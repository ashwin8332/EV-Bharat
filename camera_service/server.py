"""FastAPI service that proxies an ESP32-CAM feed through YOLOv3 detection.

The service exposes:
    GET /health     -> quick health probe
    GET /info       -> metadata about the model and defaults
    GET /stream     -> MJPEG stream with drawn detections
    GET /detect     -> one-off detection metadata for debugging
    GET /snapshot   -> single JPEG with detections overlaid
"""
from __future__ import annotations

import logging
import os
import threading
import time
from pathlib import Path
from typing import Generator, Iterable, List, Tuple

import cv2  # type: ignore
import numpy as np
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

LOGGER = logging.getLogger("camera_service")
logging.basicConfig(level=os.getenv("YOLO_LOG_LEVEL", "INFO"))

ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_CONFIG_PATH = Path(os.getenv("YOLO_CONFIG_PATH", ROOT_DIR / "yolov3.cfg"))
MODEL_WEIGHTS_PATH = Path(os.getenv("YOLO_WEIGHTS_PATH", ROOT_DIR / "yolov3.weights"))
CLASS_NAMES_PATH = Path(os.getenv("YOLO_CLASSES_PATH", ROOT_DIR / "coco.names"))
DEFAULT_SOURCE_URL = os.getenv("ESP32_CAM_URL", "http://192.168.1.11/cam-hi.jpg")
CAMERA_TIMEOUT = float(os.getenv("ESP32_TIMEOUT_SECONDS", "4.0"))
DEFAULT_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE", "0.25"))
DEFAULT_NMS = float(os.getenv("YOLO_NMS", "0.3"))
DEFAULT_FPS = int(os.getenv("YOLO_TARGET_FPS", "12"))
INPUT_SIZE = int(os.getenv("YOLO_INPUT_SIZE", "416"))

REQUEST_SESSION = requests.Session()
REQUEST_SESSION.headers.update({
    "User-Agent": "EVBharat-YOLO-Proxy/1.0"
})


class YoloDetector:
    def __init__(self, cfg: Path, weights: Path, classes: Path, input_size: int = 416) -> None:
        for path in (cfg, weights, classes):
            if not path.exists():
                raise FileNotFoundError(f"Required model file missing: {path}")

        self.net = cv2.dnn.readNetFromDarknet(str(cfg), str(weights))
        self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        self.layer_names = self.net.getLayerNames()
        self.output_layers = [self.layer_names[i - 1] for i in self.net.getUnconnectedOutLayers().flatten()]
        self.class_names = classes.read_text(encoding="utf-8").strip().splitlines()
        self.input_size = input_size
        self._lock = threading.Lock()

    def _forward(self, blob: np.ndarray) -> Iterable[np.ndarray]:
        with self._lock:
            self.net.setInput(blob)
            return self.net.forward(self.output_layers)

    def detect(self, frame: np.ndarray, conf_threshold: float, nms_threshold: float) -> Tuple[np.ndarray, List[dict]]:
        (h, w) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 1 / 255.0, (self.input_size, self.input_size), swapRB=True, crop=False)
        outputs = self._forward(blob)

        boxes: List[List[int]] = []
        confidences: List[float] = []
        class_ids: List[int] = []

        for output in outputs:
            for detection in output:
                scores = detection[5:]
                class_id = int(np.argmax(scores))
                confidence = float(scores[class_id]) * float(detection[4])

                if confidence < conf_threshold:
                    continue

                center_x = int(detection[0] * w)
                center_y = int(detection[1] * h)
                width = int(detection[2] * w)
                height = int(detection[3] * h)

                x = int(center_x - width / 2)
                y = int(center_y - height / 2)

                boxes.append([x, y, width, height])
                confidences.append(confidence)
                class_ids.append(class_id)

        indices = cv2.dnn.NMSBoxes(boxes, confidences, conf_threshold, nms_threshold)

        detections: List[dict] = []
        if len(indices) > 0:
            for idx in indices.flatten():
                x, y, width, height = boxes[idx]
                label = self.class_names[class_ids[idx]] if class_ids[idx] < len(self.class_names) else f"id_{class_ids[idx]}"
                detections.append({
                    "label": label,
                    "confidence": round(confidences[idx], 4),
                    "bbox": {
                        "x": int(x),
                        "y": int(y),
                        "width": int(width),
                        "height": int(height),
                    },
                })
                color = (255, 0, 255)
                cv2.rectangle(frame, (x, y), (x + width, y + height), color, 2)
                text = f"{label.upper()} {int(confidences[idx] * 100)}%"
                cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        return frame, detections


def fetch_frame(source_url: str) -> np.ndarray:
    try:
        response = REQUEST_SESSION.get(source_url, timeout=CAMERA_TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Unable to reach camera ({exc})") from exc

    image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if frame is None:
        raise RuntimeError("Camera returned an invalid frame")
    return frame


def encode_frame(frame: np.ndarray) -> bytes:
    success, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    if not success:
        raise RuntimeError("Failed to encode frame as JPEG")
    return buffer.tobytes()


def build_mjpeg_chunk(jpeg_bytes: bytes) -> bytes:
    return b"--frame\r\nContent-Type: image/jpeg\r\nContent-Length: " + str(len(jpeg_bytes)).encode() + b"\r\n\r\n" + jpeg_bytes + b"\r\n"


def placeholder_frame(message: str, size: Tuple[int, int] = (480, 640)) -> np.ndarray:
    canvas = np.zeros((size[0], size[1], 3), dtype=np.uint8)
    cv2.putText(canvas, message, (10, size[0] // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    return canvas


def mjpeg_generator(source_url: str, conf: float, nms: float, fps: int) -> Generator[bytes, None, None]:
    frame_delay = max(1.0 / max(fps, 1), 0.01)
    while True:
        start_time = time.perf_counter()
        try:
            frame = fetch_frame(source_url)
            annotated_frame, _ = DETECTOR.detect(frame, conf, nms)
        except Exception as exc:  # pylint: disable=broad-except
            LOGGER.warning("Frame error: %s", exc)
            annotated_frame = placeholder_frame(str(exc))
            time.sleep(0.5)

        jpeg_bytes = encode_frame(annotated_frame)
        yield build_mjpeg_chunk(jpeg_bytes)

        elapsed = time.perf_counter() - start_time
        sleep_for = frame_delay - elapsed
        if sleep_for > 0:
            time.sleep(sleep_for)


# Instantiate detector once so repeated requests reuse the network
DETECTOR = YoloDetector(MODEL_CONFIG_PATH, MODEL_WEIGHTS_PATH, CLASS_NAMES_PATH, INPUT_SIZE)

app = FastAPI(title="EV Bharat YOLO Camera Proxy", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root_info() -> JSONResponse:
    return JSONResponse({
        "service": "EV Bharat YOLO camera proxy",
        "source": DEFAULT_SOURCE_URL,
        "input_size": INPUT_SIZE,
        "defaults": {
            "confidence": DEFAULT_CONFIDENCE,
            "nms": DEFAULT_NMS,
            "fps": DEFAULT_FPS,
        },
        "model_files": {
            "config": str(MODEL_CONFIG_PATH),
            "weights": str(MODEL_WEIGHTS_PATH),
            "classes": str(CLASS_NAMES_PATH),
        },
    })


@app.get("/health")
def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@app.get("/info")
def info() -> JSONResponse:
    return JSONResponse({
        "classes": len(DETECTOR.class_names),
        "class_names": DETECTOR.class_names,
        "input_size": INPUT_SIZE,
    })


@app.get("/stream")
def stream(
    source: str = Query(DEFAULT_SOURCE_URL, description="ESP32-CAM JPEG endpoint"),
    conf: float = Query(DEFAULT_CONFIDENCE, ge=0.05, le=1.0, description="Confidence threshold"),
    nms: float = Query(DEFAULT_NMS, ge=0.05, le=1.0, description="Non-maximum suppression threshold"),
    fps: int = Query(DEFAULT_FPS, ge=1, le=30, description="Target frames per second"),
) -> StreamingResponse:
    generator = mjpeg_generator(source, conf, nms, fps)
    return StreamingResponse(generator, media_type="multipart/x-mixed-replace; boundary=frame")


@app.get("/snapshot")
def snapshot(
    source: str = Query(DEFAULT_SOURCE_URL),
    conf: float = Query(DEFAULT_CONFIDENCE),
    nms: float = Query(DEFAULT_NMS),
) -> StreamingResponse:
    try:
        frame = fetch_frame(source)
        annotated_frame, _ = DETECTOR.detect(frame, conf, nms)
        jpeg_bytes = encode_frame(annotated_frame)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return StreamingResponse(iter([jpeg_bytes]), media_type="image/jpeg")


@app.get("/detect")
def detect(
    source: str = Query(DEFAULT_SOURCE_URL),
    conf: float = Query(DEFAULT_CONFIDENCE),
    nms: float = Query(DEFAULT_NMS),
) -> JSONResponse:
    try:
        frame = fetch_frame(source)
        _, detections = DETECTOR.detect(frame, conf, nms)
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return JSONResponse({
        "count": len(detections),
        "detections": detections,
        "source": source,
        "confidence": conf,
        "nms": nms,
    })


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "camera_service.server:app",
        host="0.0.0.0",
        port=int(os.getenv("YOLO_SERVICE_PORT", "8000")),
        reload=False,
    )
