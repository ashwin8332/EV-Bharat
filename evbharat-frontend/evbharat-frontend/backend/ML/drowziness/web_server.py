"""Local web UI for drowsiness detection.

Serves an HTML page + MJPEG stream so you can view the camera + metrics in a
browser.

Run:
  python web_server.py
Then open:
  http://127.0.0.1:5000
"""

from __future__ import annotations

import os
import threading
import time
import cv2
import numpy as np
from pathlib import Path
from flask import Flask, Response, jsonify, request, send_from_directory

from drowsiness_analyzer import AnalyzerConfig, DrowsinessAnalyzer
from drowsiness_detection import ACTIVE_LANDMARK_BACKEND, DetectionConfig, process_image_extended


app = Flask(__name__)


class CameraWorker:
    def __init__(self, camera_index: int = 0):
        env_camera_index = os.getenv("DROWSINESS_CAMERA_INDEX")
        env_max_probe = os.getenv("DROWSINESS_MAX_CAMERA_INDEX")

        self.preferred_camera_index = int(camera_index)
        if env_camera_index is not None:
            try:
                self.preferred_camera_index = int(env_camera_index)
            except ValueError:
                pass

        self.max_probe_index = 4
        if env_max_probe is not None:
            try:
                self.max_probe_index = int(env_max_probe)
            except ValueError:
                pass

        self.cap = None
        self.lock = threading.Lock()
        self.latest_jpeg: bytes | None = None
        self.camera_available = False
        self.camera_error = "Camera not initialized"
        self.active_camera_index = -1
        self.latest_status: dict = {
            "running": False,
            "face_present": False,
            "risk_percent": 0,
            "perclos": 0.0,
            "eye_closed": False,
            "yawn_active": False,
            "calibrated": False,
            "alert_level": "none",
            "alert_message": "",
            "alert_seq": 0,
            "alert_cooldown_seconds": 8,
            "frame_index": 0,
            "updated_at": 0.0,
            "camera_available": False,
            "camera_error": self.camera_error,
            "camera_index": self.active_camera_index,
            "sensitivity_score": 0,
            "sensitivity_state": "stable",
            "sensitivity_parameters": {},
            "landmark_backend": ACTIVE_LANDMARK_BACKEND,
            "processing_active": False,
        }

        self._last_web_alert_at = 0.0
        self._alert_seq = 0

        self.config = DetectionConfig
        self.analyzer = DrowsinessAnalyzer(
            AnalyzerConfig(
                ear_threshold=self.config.EYE_AR_THRESH,
                mar_threshold=self.config.MOUTH_AR_THRESH,
                calibration_seconds=float(getattr(self.config, "CALIBRATION_SECONDS", 2.0)),
                perclos_window_seconds=float(getattr(self.config, "PERCLOS_WINDOW_SECONDS", 10.0)),
                perclos_drowsy_threshold=float(getattr(self.config, "PERCLOS_DROWSY_THRESHOLD", 0.40)),
                prolonged_eye_closed_seconds=float(getattr(self.config, "PROLONGED_EYE_CLOSED_SECONDS", 1.5)),
                yawn_min_seconds=float(getattr(self.config, "YAWN_MIN_SECONDS", 1.0)),
                yawns_in_window_threshold=int(getattr(self.config, "YAWNS_IN_WINDOW_THRESHOLD", 2)),
                yawn_window_seconds=float(getattr(self.config, "YAWN_WINDOW_SECONDS", 20.0)),
            )
        )

        self._thread = threading.Thread(target=self._run, daemon=True)
        self._stop = threading.Event()
        self._web_clients_active = False
        self._last_client_check_at = 0.0
        self._last_client_seen_at = 0.0
        self._idle_after_seconds = 10.0
        self._last_camera_retry_at = 0.0
        self._camera_retry_interval_seconds = 5.0
        self._last_browser_frame_at = 0.0

    def _candidate_camera_indices(self) -> list[int]:
        candidates = [self.preferred_camera_index]
        for idx in range(0, self.max_probe_index + 1):
            if idx not in candidates:
                candidates.append(idx)
        return candidates

    @staticmethod
    def _parse_camera_source(raw_source: str):
        source = raw_source.strip()
        if source == "":
            return None
        try:
            return int(source)
        except ValueError:
            return source

    @staticmethod
    def _candidate_backends() -> list[int | None]:
        backends: list[int | None] = [None]
        if os.name == "nt":
            for attr in ("CAP_DSHOW", "CAP_MSMF"):
                backend = getattr(cv2, attr, None)
                if backend is not None and backend not in backends:
                    backends.append(backend)
        else:
            backend = getattr(cv2, "CAP_V4L2", None)
            if backend is not None and backend not in backends:
                backends.append(backend)
        return backends

    def _try_open_source(self, source):
        last_error = ""
        for backend in self._candidate_backends():
            try:
                cap = cv2.VideoCapture(source) if backend is None else cv2.VideoCapture(source, backend)
            except Exception as exc:
                last_error = str(exc)
                continue

            if cap is None or not cap.isOpened():
                if cap is not None:
                    cap.release()
                continue

            # Some camera drivers need a few reads before frames are available.
            ok, _ = cap.read()
            if not ok:
                for _ in range(5):
                    time.sleep(0.05)
                    ok, _ = cap.read()
                    if ok:
                        break

            if ok:
                return cap, ""

            cap.release()
            last_error = "Camera opened but could not read frames"

        return None, last_error

    def _open_available_camera(self):
        override = self._parse_camera_source(os.getenv("DROWSINESS_CAMERA_SOURCE", ""))

        if override is not None:
            cap, error = self._try_open_source(override)
            if cap is not None:
                self.active_camera_index = override if isinstance(override, int) else -1
                return cap, ""
            return None, f"Cannot open DROWSINESS_CAMERA_SOURCE={override!r}. {error}".strip()

        candidates = self._candidate_camera_indices()
        last_error = ""
        for idx in candidates:
            if os.name != "nt" and not Path(f"/dev/video{idx}").exists():
                continue
            cap, error = self._try_open_source(idx)
            if cap is not None:
                self.active_camera_index = idx
                return cap, ""
            if error:
                last_error = error

        if os.name != "nt":
            has_video_nodes = any(Path(f"/dev/video{idx}").exists() for idx in candidates)
            if not has_video_nodes:
                return None, (
                    f"Cannot open webcam indices {candidates}. "
                    "No /dev/video* device is visible. "
                    "If running in Docker/devcontainer, pass camera device (e.g. --device /dev/video0)."
                )

        return None, f"Cannot open webcam indices {candidates}. {last_error}".strip()

    @staticmethod
    def _build_placeholder_frame(message: str) -> np.ndarray:
        frame = np.zeros((500, 800, 3), dtype=np.uint8)
        frame[:] = (12, 20, 28)
        cv2.putText(frame, "Drowsiness Monitor", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (80, 230, 255), 2)
        cv2.putText(frame, "Camera unavailable", (20, 125), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (80, 180, 255), 2)
        cv2.putText(frame, message[:85], (20, 175), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (220, 220, 220), 1)
        cv2.putText(frame, "Attach webcam and restart backend", (20, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (220, 220, 220), 1)
        return frame

    def start(self) -> bool:
        if self._thread.is_alive():
            return self.camera_available

        self.cap, error = self._open_available_camera()
        self.camera_available = self.cap is not None
        self.camera_error = "" if self.camera_available else error

        with self.lock:
            self.latest_status.update(
                {
                    "running": bool(self.camera_available),
                    "camera_available": bool(self.camera_available),
                    "camera_error": self.camera_error,
                    "camera_index": int(self.active_camera_index),
                    "alert_level": "none" if self.camera_available else "medium",
                    "alert_message": "" if self.camera_available else "Camera unavailable. Connect a webcam and restart backend.",
                }
            )

        self._thread.start()
        return self.camera_available

    def stop(self) -> None:
        self._stop.set()
        try:
            if self.cap is not None:
                self.cap.release()
        except Exception:
            pass

    @staticmethod
    def _to_float(value) -> float:
        try:
            return float(value)
        except Exception:
            return 0.0

    def _compute_sensitivity(self, expression: dict | None) -> tuple[int, str, dict]:
        cues = expression or {}
        frown = self._to_float(cues.get("frown"))
        brow_up = self._to_float(cues.get("brow_up"))
        brow_down = self._to_float(cues.get("brow_down"))
        eye_wide = self._to_float(cues.get("eye_wide"))
        jaw_open = self._to_float(cues.get("jaw_open"))

        # A light-weight emotional sensitivity proxy from blendshape cues.
        stress_signal = min(1.0, (0.40 * frown) + (0.20 * brow_up) + (0.20 * brow_down) + (0.20 * eye_wide))
        agitation_signal = min(1.0, (0.70 * stress_signal) + (0.30 * jaw_open))
        score = int(round(agitation_signal * 100))

        state = "stable"
        if score >= 70:
            state = "emotional"
        elif score >= 45:
            state = "sensitive"

        params = {
            "frown": round(frown, 3),
            "brow_up": round(brow_up, 3),
            "brow_down": round(brow_down, 3),
            "eye_wide": round(eye_wide, 3),
            "jaw_open": round(jaw_open, 3),
            "stress_signal": round(stress_signal, 3),
            "agitation_signal": round(agitation_signal, 3),
        }

        return score, state, params

    def _process_frame(self, frame: np.ndarray, frame_index: int, source: str) -> None:
        frame = cv2.resize(frame, (800, 500))

        # Process every N frames to keep CPU reasonable.
        out = None
        if frame_index % max(1, int(self.config.PROCESS_EVERY_N_FRAMES)) == 0:
            face_present, ear, mar, expression = process_image_extended(frame, self.config)
            out = self.analyzer.update(now=time.time(), ear=ear, mar=mar, face_present=bool(face_present))

        if out is not None:
            risk = int(round(out.risk * 100))
            now = time.time()
            expression = expression or {}

            sensitivity_score, sensitivity_state, sensitivity_params = self._compute_sensitivity(expression)

            alert_level = "none"
            alert_message = ""
            should_emit_alert = False
            if bool(out.drowsy) or risk >= 85:
                alert_level = "high"
                alert_message = "Drowsiness detected. Please stop safely and rest now."
                should_emit_alert = True
            elif risk >= 60:
                alert_level = "medium"
                alert_message = "Warning. Fatigue signs detected. Stay alert."
                should_emit_alert = True

            # Sensitivity/emotional warning can also affect concentration while driving.
            if sensitivity_score >= 70 and alert_level != "high":
                alert_level = "high"
                alert_message = "Emotional stress detected. You may not concentrate to drive. Pull over, breathe, and continue only when calm."
                should_emit_alert = True
            elif sensitivity_score >= 45 and alert_level == "none":
                alert_level = "medium"
                alert_message = "Emotional sensitivity rising. Please calm down and refocus before driving further."
                should_emit_alert = True

            cooldown = float(getattr(self.config, "ALERT_COOLDOWN_SECONDS", 8.0))
            if should_emit_alert and (now - self._last_web_alert_at) >= cooldown:
                self._last_web_alert_at = now
                self._alert_seq += 1

            cv2.putText(frame, f"Risk: {risk}%", (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"PERCLOS: {out.perclos:.2f}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.putText(frame, f"Eye closed: {out.eye_closed}", (10, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.putText(frame, f"Yawn: {out.yawn_active}", (10, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            if out.drowsy:
                cv2.putText(frame, "DROWSY DETECTED!", (450, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

            with self.lock:
                self.latest_status.update(
                    {
                        "running": True,
                        "face_present": bool(out.face_present),
                        "risk_percent": risk,
                        "perclos": float(out.perclos),
                        "eye_closed": bool(out.eye_closed),
                        "yawn_active": bool(out.yawn_active),
                        "calibrated": bool(self.analyzer.calibrated),
                        "ear": float(out.ear),
                        "mar": float(out.mar),
                        "ear_threshold": float(out.ear_threshold),
                        "mar_threshold": float(out.mar_threshold),
                            "expression": expression,
                            "sensitivity_score": int(sensitivity_score),
                            "sensitivity_state": sensitivity_state,
                            "sensitivity_parameters": sensitivity_params,
                            "landmark_backend": ACTIVE_LANDMARK_BACKEND,
                            "processing_active": True,
                        "alert_level": alert_level,
                        "alert_message": alert_message,
                        "alert_seq": int(self._alert_seq),
                        "alert_cooldown_seconds": int(round(cooldown)),
                        "frame_index": int(frame_index),
                        "updated_at": float(now),
                        "camera_available": True,
                        "camera_error": "",
                        "camera_index": int(self.active_camera_index),
                        "source": source,
                    }
                )
        else:
            now = time.time()
            with self.lock:
                self.latest_status.update(
                    {
                        "running": True,
                        "camera_available": True,
                        "camera_error": "",
                        "camera_index": int(self.active_camera_index),
                            "landmark_backend": ACTIVE_LANDMARK_BACKEND,
                            "processing_active": True,
                        "frame_index": int(frame_index),
                        "updated_at": float(now),
                        "source": source,
                    }
                )

        ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        if ok:
            with self.lock:
                self.latest_jpeg = buf.tobytes()

    def process_external_frame(self, frame: np.ndarray) -> bool:
        if frame is None:
            return False

        now = time.time()
        self._last_browser_frame_at = now
        self.camera_available = True
        self.camera_error = ""

        frame_index = int(self.latest_status.get("frame_index", 0)) + 1
        self._process_frame(frame, frame_index, source="browser")
        return True

    def ping_web_client(self):
        """Record that a web client has recently made a request."""
        self._last_client_seen_at = time.time()

    def _run(self) -> None:
        frame_index = 0
        while not self._stop.is_set():
            now = time.time()

            # Check for active web clients and manage camera state
            if now - self._last_client_check_at > 2.0:
                self._last_client_check_at = now
                is_active = now - self._last_client_seen_at < self._idle_after_seconds
                if is_active != self._web_clients_active:
                    self._web_clients_active = is_active
                    if not self._web_clients_active and self.cap is not None:
                        # We've become idle, release the camera
                        try:
                            self.cap.release()
                        except Exception:
                            pass
                        self.cap = None
                        self.camera_available = False
                        self.camera_error = f"Web client idle for >{int(self._idle_after_seconds)}s"

            if not self._web_clients_active:
                time.sleep(0.5)
                continue

            if (now - self._last_browser_frame_at) < 2.0:
                # Browser camera is currently feeding frames; avoid overriding with placeholders.
                time.sleep(0.05)
                continue

            if not self.camera_available or self.cap is None:
                # Attempt to re-acquire camera if clients are active
                if (
                    self._web_clients_active
                    and self.cap is None
                    and (now - self._last_camera_retry_at) >= self._camera_retry_interval_seconds
                ):
                    self._last_camera_retry_at = now
                    self.cap, error = self._open_available_camera()
                    self.camera_available = self.cap is not None
                    self.camera_error = "" if self.camera_available else error

                frame_index += 1
                frame = self._build_placeholder_frame(self.camera_error or "No webcam detected")

                with self.lock:
                    self.latest_status.update(
                        {
                            "running": False,
                            "face_present": False,
                            "risk_percent": 0,
                            "perclos": 0.0,
                            "eye_closed": False,
                            "yawn_active": False,
                            "camera_available": False,
                            "camera_error": self.camera_error,
                            "camera_index": int(self.active_camera_index),
                            "sensitivity_score": 0,
                            "sensitivity_state": "stable",
                            "sensitivity_parameters": {},
                            "landmark_backend": ACTIVE_LANDMARK_BACKEND,
                            "processing_active": False,
                            "frame_index": int(frame_index),
                            "updated_at": float(now),
                        }
                    )

                ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                if ok:
                    with self.lock:
                        self.latest_jpeg = buf.tobytes()

                time.sleep(0.2)
                continue

            ok, frame = self.cap.read()
            if not ok:
                self.camera_available = False
                self.camera_error = "Camera stream read failed"
                try:
                    if self.cap is not None:
                        self.cap.release()
                except Exception:
                    pass
                self.cap = None
                continue

            frame = cv2.resize(frame, (800, 500))
            frame_index += 1
            self._process_frame(frame, frame_index, source="backend")

            time.sleep(0.01)


camera = CameraWorker(camera_index=0)


@app.route("/")
def index():
    base_dir = Path(__file__).resolve().parent
    return send_from_directory(base_dir, "index.html")


@app.route("/status")
def status():
    with camera.lock:
        return jsonify(camera.latest_status)


@app.route("/video_feed")
def video_feed():
    """Returns the MJPEG stream."""
    camera.ping_web_client()
    return Response(
        gen(camera), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/browser_frame", methods=["POST"])
def browser_frame():
    frame_file = request.files.get("frame")
    if frame_file is None:
        return jsonify({"status": "error", "message": "Missing frame file"}), 400

    data = frame_file.read()
    if not data:
        return jsonify({"status": "error", "message": "Empty frame payload"}), 400

    np_buf = np.frombuffer(data, dtype=np.uint8)
    frame = cv2.imdecode(np_buf, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"status": "error", "message": "Invalid image frame"}), 400

    camera.ping_web_client()
    ok = camera.process_external_frame(frame)
    if not ok:
        return jsonify({"status": "error", "message": "Frame processing failed"}), 500

    return jsonify({"status": "success"})


def gen(camera):
    """Generator function for MJPEG stream."""
    boundary = b"frame"
    while True:
        with camera.lock:
            jpg = camera.latest_jpeg
        if jpg is None:
            time.sleep(0.05)
            continue
        yield (
            b"--" + boundary + b"\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n"
        )

@app.before_request
def before_request():
    """Track web client activity."""
    camera.ping_web_client()


def main() -> None:
    camera.start()
    # Debug off by default to avoid reloader spawning multiple camera readers.
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)


if __name__ == "__main__":
    main()
