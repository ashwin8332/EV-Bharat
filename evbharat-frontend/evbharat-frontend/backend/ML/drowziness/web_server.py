"""Local web UI for drowsiness detection.

Serves an HTML page + MJPEG stream so you can view the camera + metrics in a
browser.

Run:
  python web_server.py
Then open:
  http://127.0.0.1:5000
"""

from __future__ import annotations

import threading
import time
import cv2
from flask import Flask, Response, jsonify, render_template

from drowsiness_analyzer import AnalyzerConfig, DrowsinessAnalyzer
from drowsiness_detection import DetectionConfig, process_image_extended


app = Flask(__name__)


class CameraWorker:
    def __init__(self, camera_index: int = 0):
        self.cap = cv2.VideoCapture(camera_index)
        self.lock = threading.Lock()
        self.latest_jpeg: bytes | None = None
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

    def start(self) -> None:
        if not self.cap.isOpened():
            raise RuntimeError("Cannot open webcam")
        with self.lock:
            self.latest_status["running"] = True
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        try:
            self.cap.release()
        except Exception:
            pass

    def _run(self) -> None:
        frame_index = 0
        while not self._stop.is_set():
            ok, frame = self.cap.read()
            if not ok:
                time.sleep(0.05)
                continue

            frame = cv2.resize(frame, (800, 500))
            frame_index += 1

            # Process every N frames to keep CPU reasonable.
            out = None
            if frame_index % max(1, int(self.config.PROCESS_EVERY_N_FRAMES)) == 0:
                face_present, ear, mar, expression = process_image_extended(frame, self.config)
                out = self.analyzer.update(now=time.time(), ear=ear, mar=mar, face_present=bool(face_present))

            # Overlay.
            if out is not None:
                risk = int(round(out.risk * 100))
                now = time.time()

                # Severity levels for web audio guidance.
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
                            "expression": expression or {},
                            "alert_level": alert_level,
                            "alert_message": alert_message,
                            "alert_seq": int(self._alert_seq),
                            "alert_cooldown_seconds": int(round(cooldown)),
                            "frame_index": int(frame_index),
                            "updated_at": float(now),
                        }
                    )

            ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if ok:
                with self.lock:
                    self.latest_jpeg = buf.tobytes()

            time.sleep(0.01)


camera = CameraWorker(camera_index=0)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/status")
def status():
    with camera.lock:
        return jsonify(camera.latest_status)


@app.route("/video_feed")
def video_feed():
    def gen():
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

    return Response(gen(), mimetype="multipart/x-mixed-replace; boundary=frame")


def main() -> None:
    camera.start()
    # Debug off by default to avoid reloader spawning multiple camera readers.
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)


if __name__ == "__main__":
    main()
