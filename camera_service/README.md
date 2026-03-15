# ESP32 YOLO Camera Service

A lightweight FastAPI microservice that proxies an ESP32-CAM JPEG endpoint, applies YOLOv3 detections, and exposes the processed stream and metadata for the EV Bharat dashboard.

## Features

- Reuses the pretrained `yolov3.weights` / `yolov3.cfg` / `coco.names` that already ship with this repo.
- Streams annotated frames over MJPEG (`/stream`) so a standard `<img>` tag can display live detections.
- Provides `/snapshot` (single JPEG) and `/detect` (JSON metadata) endpoints for debugging.
- Works with any ESP32-CAM URL that returns JPEGs (default `http://192.168.1.11/cam-hi.jpg`).

## Quick start

1. **Create a virtual environment** (Python 3.10+ recommended):

   ```powershell
   cd "c:/Users/Admin/Desktop/EV Bharat/ev"
   python -m venv .venv-yolo
   .venv-yolo\Scripts\Activate.ps1
   ```

2. **Install dependencies**:

   ```powershell
   pip install -r camera_service/requirements.txt
   ```

3. **Run the service** (defaults to port `8000`):

   ```powershell
   uvicorn camera_service.server:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Point your browser (or the dashboard) to `http://localhost:8000/stream?source=http://<esp32-ip>/cam-hi.jpg`.

## Configuration

| Environment variable      | Default value                          | Purpose |
| ------------------------- | -------------------------------------- | ------- |
| `ESP32_CAM_URL`           | `http://192.168.1.11/cam-hi.jpg`       | Fallback camera JPEG URL. |
| `ESP32_TIMEOUT_SECONDS`   | `4.0`                                  | HTTP timeout for grabbing frames. |
| `YOLO_CONFIG_PATH`        | `./yolov3.cfg`                         | Path to YOLO config. |
| `YOLO_WEIGHTS_PATH`       | `./yolov3.weights`                     | Path to YOLO weights. |
| `YOLO_CLASSES_PATH`       | `./coco.names`                         | Path to class labels. |
| `YOLO_CONFIDENCE`         | `0.25`                                 | Default confidence threshold. |
| `YOLO_NMS`                | `0.3`                                  | Default NMS threshold. |
| `YOLO_TARGET_FPS`         | `12`                                   | Target FPS for the MJPEG loop. |
| `YOLO_INPUT_SIZE`         | `416`                                  | Input size passed to YOLO. |
| `YOLO_SERVICE_PORT`       | `8000`                                 | Port when launching via `python camera_service/server.py`. |

All endpoints accept query-string overrides for `source`, `conf`, `nms`, and `fps`, so you can tweak per-request without restarting the service.

## Endpoint summary

- `GET /health` → `{ "status": "ok" }`
- `GET /stream` → MJPEG stream with bounding boxes and labels.
- `GET /snapshot` → One annotated JPEG (useful for debugging latency).
- `GET /detect` → JSON metadata for the most recent inference request.
- `GET /info` → Model metadata (class names, input size, etc.).

## Frontend integration

Set `VITE_YOLO_STREAM_URL` (see `evbharat-frontend/.env.example`) or keep the default `http://localhost:8000/stream`. On the dashboard you can toggle **YOLO Detection Mode**; when enabled, the `<img>` element pulls frames from the FastAPI stream instead of the raw ESP32 endpoint.
