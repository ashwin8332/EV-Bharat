"""
🧠 Driver Drowsiness Detection System - MEDIAPIPE VERSION
Real-time drowsiness detection using OpenCV and MediaPipe (No dlib/face_recognition needed!)
Based on YouTube: Real Time Driver Drowsiness Detection System | OpenCV
"""

import os
import cv2
import numpy as np
from scipy.spatial import distance
import warnings
import sys
import subprocess
import threading
import time
import csv
from pathlib import Path
import urllib.request

from drowsiness_analyzer import (
    AnalyzerConfig,
    DrowsinessAnalyzer,
    eye_aspect_ratio_6pts,
    mouth_aspect_ratio_simple,
)

warnings.filterwarnings('ignore')

# ============================================================================
# ⚙️ CONFIGURATION & SESSION TRACKING
# ============================================================================

class DetectionConfig:
    """Configurable drowsiness detection parameters."""
    EYE_AR_THRESH = 0.25           # Eye closure threshold
    # With the updated MAR definition (lip opening / mouth width), typical yawn
    # thresholds land around ~0.30-0.45.
    MOUTH_AR_THRESH = 0.35         # Yawning threshold
    DROWSY_SCORE_THRESHOLD = 5     # Frames needed for drowsy alert
    ALERT_COOLDOWN_SECONDS = 8     # Min seconds between alerts
    PROCESS_EVERY_N_FRAMES = 2     # Process every nth frame (lower = more accurate)
    DETECTION_CONFIDENCE = 0.5     # MediaPipe detection confidence
    TRACKING_CONFIDENCE = 0.5      # MediaPipe tracking confidence

    # Advanced signals
    CALIBRATION_SECONDS = 2.0
    PERCLOS_WINDOW_SECONDS = 10.0
    PERCLOS_DROWSY_THRESHOLD = 0.40
    PROLONGED_EYE_CLOSED_SECONDS = 1.5
    YAWN_MIN_SECONDS = 1.0
    YAWNS_IN_WINDOW_THRESHOLD = 2
    YAWN_WINDOW_SECONDS = 20.0


class SessionData:
    """Track session statistics for detailed reporting."""
    def __init__(self):
        self.start_time = time.time()
        self.frames_processed = 0
        self.drowsy_events = 0
        self.eye_closure_count = 0
        self.yawning_count = 0
        self.frame_times = []
        self.scores = []
    
    def record_frame(self, elapsed_time, score, eye_flag, mouth_flag):
        self.frames_processed += 1
        self.frame_times.append(elapsed_time)
        self.scores.append(score)
        if eye_flag:
            self.eye_closure_count += 1
        if mouth_flag:
            self.yawning_count += 1
    
    def record_drowsy_event(self):
        self.drowsy_events += 1
    
    def get_summary(self):
        """Return formatted session summary."""
        elapsed = time.time() - self.start_time
        avg_fps = self.frames_processed / elapsed if elapsed > 0 else 0
        return {
            'duration_seconds': round(elapsed, 2),
            'total_frames': self.frames_processed,
            'avg_fps': round(avg_fps, 2),
            'drowsy_events': self.drowsy_events,
            'eye_closures': self.eye_closure_count,
            'yawns': self.yawning_count,
            'avg_score': round(np.mean(self.scores), 2) if self.scores else 0,
        }
    
    def export_csv(self, filename='drowsiness_session.csv'):
        """Export session data to CSV for analysis."""
        try:
            with open(filename, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Frame', 'Time_Seconds', 'Score'])
                for i, (t, score) in enumerate(zip(self.frame_times, self.scores)):
                    writer.writerow([i, round(t, 3), int(score)])
            return filename
        except Exception as e:
            print(f"⚠️  CSV export failed: {e}")
            return None


ALERT_MESSAGE = "You are drowsy. Stop the car and take rest and be hydrated."
ALERT_COOLDOWN_SECONDS = DetectionConfig.ALERT_COOLDOWN_SECONDS
_last_alert_time = 0.0

def _ensure_mediapipe():
    """Import mediapipe, installing it with the current interpreter if needed."""
    try:
        import mediapipe as mp  # type: ignore
        return mp
    except ImportError:
        print("MediaPipe not installed. Installing with current Python environment...")
        cmd = [sys.executable, "-m", "pip", "install", "mediapipe"]
        result = subprocess.run(cmd, check=False)
        if result.returncode != 0:
            raise RuntimeError(
                "Failed to install mediapipe automatically. "
                "Run: python -m pip install mediapipe"
            )

        import mediapipe as mp  # type: ignore
        return mp


def _create_face_mesh(mp_module):
    """Create FaceMesh object with compatible import paths across mediapipe builds."""
    try:
        if hasattr(mp_module, "solutions") and hasattr(mp_module.solutions, "face_mesh"):
            face_mesh_api = mp_module.solutions.face_mesh
        else:
            from mediapipe.python.solutions import face_mesh as face_mesh_api  # type: ignore

        return face_mesh_api.FaceMesh(
            static_image_mode=False,
            max_num_faces=5,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    except Exception as exc:
        print(
            "MediaPipe FaceMesh is unavailable in this environment.\n"
            "Trying MediaPipe Tasks FaceLandmarker fallback..."
        )
        return None


mp = _ensure_mediapipe()
face_mesh = _create_face_mesh(mp)


_FACE_LANDMARKER_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
)
_FACE_LANDMARKER_PATH = Path(__file__).resolve().parent / "models" / "face_landmarker.task"


def _ensure_face_landmarker_model() -> Path:
    """Ensure the FaceLandmarker model bundle exists locally."""
    _FACE_LANDMARKER_PATH.parent.mkdir(parents=True, exist_ok=True)
    if _FACE_LANDMARKER_PATH.exists() and _FACE_LANDMARKER_PATH.stat().st_size > 1_000_000:
        return _FACE_LANDMARKER_PATH

    print("Downloading FaceLandmarker model (one-time)...")
    try:
        urllib.request.urlretrieve(_FACE_LANDMARKER_URL, _FACE_LANDMARKER_PATH)  # nosec - fixed URL
    except Exception as exc:
        raise RuntimeError(
            "Failed to download FaceLandmarker model. "
            "Check your internet connection or download it manually from MediaPipe docs."
        ) from exc

    return _FACE_LANDMARKER_PATH


def _create_face_landmarker(mp_module):
    """Create a MediaPipe Tasks FaceLandmarker (fallback for environments where FaceMesh fails)."""
    try:
        model_path = _ensure_face_landmarker_model()
        BaseOptions = mp_module.tasks.BaseOptions
        FaceLandmarker = mp_module.tasks.vision.FaceLandmarker
        FaceLandmarkerOptions = mp_module.tasks.vision.FaceLandmarkerOptions
        VisionRunningMode = mp_module.tasks.vision.RunningMode

        options = FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=str(model_path)),
            running_mode=VisionRunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=float(DetectionConfig.DETECTION_CONFIDENCE),
            min_face_presence_confidence=float(DetectionConfig.DETECTION_CONFIDENCE),
            min_tracking_confidence=float(DetectionConfig.TRACKING_CONFIDENCE),
            output_face_blendshapes=True,
            output_facial_transformation_matrixes=False,
        )
        return FaceLandmarker.create_from_options(options)
    except Exception as exc:
        print(f"⚠️  FaceLandmarker fallback unavailable: {exc}")
        return None


face_landmarker = None
if face_mesh is None:
    # Try Tasks API as a fallback (helps on some Python 3.13 wheels).
    face_landmarker = _create_face_landmarker(mp)


def _load_face_recognition():
    """Load face_recognition lazily so Python 3.13 environments keep working."""
    try:
        return __import__("face_recognition")
    except Exception:
        return None


face_recognition = _load_face_recognition()


def _play_alarm_and_voice():
    """Play a short alarm and speak the drowsiness warning."""
    try:
        import winsound

        winsound.Beep(1200, 400)
        winsound.Beep(900, 400)
        winsound.Beep(1200, 400)
    except Exception:
        pass

    # Use built-in Windows speech engine from PowerShell.
    try:
        escaped = ALERT_MESSAGE.replace("'", "''")
        ps_cmd = (
            "Add-Type -AssemblyName System.Speech; "
            "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
            "$s.Rate = -1; "
            f"$s.Speak('{escaped}')"
        )
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_cmd],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        pass


def trigger_alert_if_needed():
    """Trigger alarm+voice with cooldown so it does not repeat every frame."""
    global _last_alert_time
    now = time.time()
    if now - _last_alert_time < ALERT_COOLDOWN_SECONDS:
        return
    _last_alert_time = now
    threading.Thread(target=_play_alarm_and_voice, daemon=True).start()

# ============================================================================
# 👁️ EYE ASPECT RATIO (EAR)
# ============================================================================

def eye_aspect_ratio(eye_landmarks):
    """
    Calculate Eye Aspect Ratio (EAR)
    Eyes are considered closed if EAR < 0.25
    
    Uses MediaPipe's eye landmarks:
    - 33 (left eye inner corner), 160 (right eye inner corner)
    - 130 (left eye center), 243 (right eye center)  
    """
    try:
        eye_arr = np.asarray(eye_landmarks, dtype=np.float32)
        return eye_aspect_ratio_6pts(eye_arr)
    except:
        return 1.0


# ============================================================================
# 👄 MOUTH ASPECT RATIO (MAR)
# ============================================================================

def mouth_aspect_ratio(mouth_landmarks):
    """
    Calculate Mouth Aspect Ratio (MAR)
    Yawning is detected if MAR > 0.6
    """
    try:
        mouth_arr = np.asarray(mouth_landmarks, dtype=np.float32)
        # Back-compat: if we receive 11 points from older callers, approximate a
        # simple MAR using corners + inner-lip points.
        if mouth_arr.shape[0] >= 11:
            left_corner = mouth_arr[0]
            right_corner = mouth_arr[6]
            upper = mouth_arr[5]
            lower = mouth_arr[2]
            simple = np.stack([left_corner, right_corner, upper, lower], axis=0)
            return mouth_aspect_ratio_simple(simple)
        return mouth_aspect_ratio_simple(mouth_arr)
    except:
        return 0.0


def _mp_pt(landmarks, idx: int, h: int, w: int) -> np.ndarray:
    lm = landmarks[idx]
    return np.array([lm.x * w, lm.y * h], dtype=np.float32)


def compute_ear_mar_from_mediapipe(landmarks, h: int, w: int):
    """Compute EAR + MAR from MediaPipe FaceMesh landmarks."""
    # EAR indices (widely used mapping for MediaPipe FaceMesh)
    left_eye = np.stack(
        [
            _mp_pt(landmarks, 33, h, w),
            _mp_pt(landmarks, 160, h, w),
            _mp_pt(landmarks, 158, h, w),
            _mp_pt(landmarks, 133, h, w),
            _mp_pt(landmarks, 153, h, w),
            _mp_pt(landmarks, 144, h, w),
        ],
        axis=0,
    )
    right_eye = np.stack(
        [
            _mp_pt(landmarks, 362, h, w),
            _mp_pt(landmarks, 385, h, w),
            _mp_pt(landmarks, 387, h, w),
            _mp_pt(landmarks, 263, h, w),
            _mp_pt(landmarks, 373, h, w),
            _mp_pt(landmarks, 380, h, w),
        ],
        axis=0,
    )
    ear = (eye_aspect_ratio_6pts(left_eye) + eye_aspect_ratio_6pts(right_eye)) / 2.0

    # MAR indices (corners + inner-lip)
    mouth = np.stack(
        [
            _mp_pt(landmarks, 61, h, w),
            _mp_pt(landmarks, 291, h, w),
            _mp_pt(landmarks, 13, h, w),
            _mp_pt(landmarks, 14, h, w),
        ],
        axis=0,
    )
    mar = mouth_aspect_ratio_simple(mouth)
    return float(ear), float(mar)


def compute_ear_mar_from_face_recognition(face_landmarks: dict):
    left_eye = np.array(face_landmarks.get("left_eye", []), dtype=np.float32)
    right_eye = np.array(face_landmarks.get("right_eye", []), dtype=np.float32)
    top_lip = np.array(face_landmarks.get("top_lip", []), dtype=np.float32)
    bottom_lip = np.array(face_landmarks.get("bottom_lip", []), dtype=np.float32)

    if left_eye.shape[0] >= 6 and right_eye.shape[0] >= 6:
        ear = (eye_aspect_ratio_6pts(left_eye[:6]) + eye_aspect_ratio_6pts(right_eye[:6])) / 2.0
    else:
        ear = 1.0

    if top_lip.size and bottom_lip.size:
        all_lip = np.concatenate([top_lip, bottom_lip], axis=0)
        left_corner = all_lip[np.argmin(all_lip[:, 0])]
        right_corner = all_lip[np.argmax(all_lip[:, 0])]
        top_center = np.mean(top_lip, axis=0)
        bottom_center = np.mean(bottom_lip, axis=0)
        mouth = np.stack([left_corner, right_corner, top_center, bottom_center], axis=0)
        mar = mouth_aspect_ratio_simple(mouth)
    else:
        mar = 0.0

    return float(ear), float(mar)


# ============================================================================
# 👁️ EXTRACT EYE LANDMARKS FROM MEDIAPIPE
# ============================================================================

def get_eye_landmarks_from_mediapipe(landmarks, h, w):
    """
    Extract eye landmarks from MediaPipe results
    Returns: left_eye_points, right_eye_points
    """
    # Left eye indices (MediaPipe)
    left_eye_indices = [33, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145]
    
    # Right eye indices (MediaPipe)
    right_eye_indices = [362, 384, 385, 386, 387, 388, 466, 388, 387, 386, 385]
    
    left_eye = []
    right_eye = []
    
    for idx in left_eye_indices:
        if idx < len(landmarks):
            x = landmarks[idx].x * w
            y = landmarks[idx].y * h
            left_eye.append([x, y])
    
    for idx in right_eye_indices:
        if idx < len(landmarks):
            x = landmarks[idx].x * w
            y = landmarks[idx].y * h
            right_eye.append([x, y])
    
    return np.array(left_eye, dtype=np.float32), np.array(right_eye, dtype=np.float32)


# ============================================================================
# 👄 EXTRACT MOUTH LANDMARKS FROM MEDIAPIPE
# ============================================================================

def get_mouth_landmarks_from_mediapipe(landmarks, h, w):
    """
    Extract mouth landmarks from MediaPipe results
    Returns: mouth_points
    """
    # Mouth indices (MediaPipe)
    mouth_indices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
    
    mouth = []
    for idx in mouth_indices:
        if idx < len(landmarks):
            x = landmarks[idx].x * w
            y = landmarks[idx].y * h
            mouth.append([x, y])
    
    return np.array(mouth, dtype=np.float32)


# ============================================================================
# 🧮 PROCESS IMAGE FUNCTION
# ============================================================================

def process_image(frame, config=None):
    """
    Process a frame and detect drowsiness indicators using MediaPipe
    
    Args:
        frame: Input frame
        config: DetectionConfig instance (defaults to DetectionConfig)
    
    Returns:
        tuple: (face_present, ear, mar)
    """
    if config is None:
        config = DetectionConfig
    
    if frame is None:
        raise ValueError('Frame not found')
    if face_mesh is None and face_landmarker is None:
        raise RuntimeError("No MediaPipe face landmark backend is available in this environment")
    
    h, w, c = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    landmarks = None

    if face_mesh is not None:
        results = face_mesh.process(rgb_frame)
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
    else:
        # Tasks API fallback
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        det = face_landmarker.detect(mp_image)
        if det.face_landmarks:
            landmarks = det.face_landmarks[0]
    
    face_present = False
    ear = None
    mar = None
    
    if landmarks is not None:
        try:
            ear, mar = compute_ear_mar_from_mediapipe(landmarks, h, w)
            face_present = True
        except Exception as e:
            print(f"Error processing landmarks: {e}")

    return face_present, ear, mar


def _summarize_blendshapes(face_blendshapes) -> dict:
    """Return a small set of *expression cues* (not emotion labels)."""
    if not face_blendshapes:
        return {}
    try:
        categories = {c.category_name: float(c.score) for c in face_blendshapes[0]}
    except Exception:
        return {}

    def pick(*names: str) -> float:
        return float(max(categories.get(n, 0.0) for n in names))

    return {
        "smile": pick("mouthSmileLeft", "mouthSmileRight"),
        "frown": pick("mouthFrownLeft", "mouthFrownRight"),
        "jaw_open": pick("jawOpen"),
        "brow_down": pick("browDownLeft", "browDownRight"),
        "brow_up": pick("browOuterUpLeft", "browOuterUpRight", "browInnerUp"),
        "eye_wide": pick("eyeWideLeft", "eyeWideRight"),
    }


def process_image_extended(frame, config=None):
    """Like process_image(), but also returns expression cues when available.

    Returns:
        (face_present, ear, mar, expression_cues)
    """
    if config is None:
        config = DetectionConfig

    if frame is None:
        raise ValueError("Frame not found")
    if face_mesh is None and face_landmarker is None:
        raise RuntimeError("No MediaPipe face landmark backend is available in this environment")

    h, w, _ = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    landmarks = None
    cues = {}

    if face_mesh is not None:
        results = face_mesh.process(rgb_frame)
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
    else:
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        det = face_landmarker.detect(mp_image)
        if det.face_landmarks:
            landmarks = det.face_landmarks[0]
        cues = _summarize_blendshapes(getattr(det, "face_blendshapes", None))

    if landmarks is None:
        return False, None, None, cues

    ear, mar = compute_ear_mar_from_mediapipe(landmarks, h, w)
    return True, ear, mar, cues


def process_image_face_recognition(frame, config=None):
    """Process a frame using face_recognition landmarks when available."""
    if config is None:
        config = DetectionConfig

    if frame is None:
        raise ValueError("Frame not found")
    if face_recognition is None:
        raise RuntimeError("face_recognition is unavailable in this environment")

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb_frame)
    landmarks_list = face_recognition.face_landmarks(rgb_frame, locations)

    face_present = False
    ear = None
    mar = None

    for face_landmarks in landmarks_list:
        try:
            ear, mar = compute_ear_mar_from_face_recognition(face_landmarks)
            face_present = True
        except Exception as e:
            print(f"Error processing face_recognition landmarks: {e}")
        break

    return face_present, ear, mar


def _resolve_backend(preferred_backend):
    """Resolve runtime backend from user preference and availability."""
    requested = (preferred_backend or "auto").strip().lower()
    valid = {"auto", "mediapipe", "face_recognition"}
    if requested not in valid:
        requested = "auto"

    if requested == "mediapipe":
        return "mediapipe" if (face_mesh is not None or face_landmarker is not None) else None
    if requested == "face_recognition":
        return "face_recognition" if face_recognition is not None else None

    # auto mode
    if face_mesh is not None or face_landmarker is not None:
        return "mediapipe"
    if face_recognition is not None:
        return "face_recognition"
    return None


# ============================================================================
# 🎥 REAL-TIME DROWSINESS DETECTION
# ============================================================================

def detect_drowsiness_video(video_source=0, use_webcam=True, config=None, enable_csv_export=False, backend="auto"):
    """
    Real-time drowsiness detection with session tracking and statistics.
    
    Args:
        video_source: Video file path or webcam index (default 0)
        use_webcam: Whether to use webcam (True) or video file (False)
        config: DetectionConfig instance (defaults to DetectionConfig)
        enable_csv_export: Export session data to CSV (default False)
        backend: auto | mediapipe | face_recognition
    """
    global _last_alert_time
    
    if config is None:
        config = DetectionConfig
    
    selected_backend = _resolve_backend(backend)
    if selected_backend is None:
        print("\nNo landmark backend is available (MediaPipe or face_recognition).")
        print("Switching to OpenCV-only detector.")
        try:
            import drowsiness_detection_simple as simple_detector

            simple_detector.detect_drowsiness_simple()
            return
        except Exception as exc:
            print(f"❌ Fallback detector failed to start: {exc}")
            print("Run manually: python drowsiness_detection_simple.py")
            return

    print("\n" + "="*70)
    print("🚗 DRIVER DROWSINESS DETECTION SYSTEM - STARTING")
    print("="*70)
    print(f"🧠 Backend: {selected_backend}")

    analyzer = DrowsinessAnalyzer(
        AnalyzerConfig(
            ear_threshold=config.EYE_AR_THRESH,
            mar_threshold=config.MOUTH_AR_THRESH,
            calibration_seconds=float(getattr(config, "CALIBRATION_SECONDS", 2.0)),
            perclos_window_seconds=float(getattr(config, "PERCLOS_WINDOW_SECONDS", 10.0)),
            perclos_drowsy_threshold=float(getattr(config, "PERCLOS_DROWSY_THRESHOLD", 0.40)),
            prolonged_eye_closed_seconds=float(getattr(config, "PROLONGED_EYE_CLOSED_SECONDS", 1.5)),
            yawn_min_seconds=float(getattr(config, "YAWN_MIN_SECONDS", 1.0)),
            yawns_in_window_threshold=int(getattr(config, "YAWNS_IN_WINDOW_THRESHOLD", 2)),
            yawn_window_seconds=float(getattr(config, "YAWN_WINDOW_SECONDS", 20.0)),
        )
    )
    
    # Initialize session tracker
    session = SessionData()
    
    # Initialize video capture
    if use_webcam:
        print(f"📹 Using webcam...")
        video_cap = cv2.VideoCapture(video_source)
    else:
        print(f"📹 Loading video: {video_source}")
        video_cap = cv2.VideoCapture(video_source)
    
    if not video_cap.isOpened():
        print("❌ Error: Cannot open video source!")
        return
    
    fps = video_cap.get(cv2.CAP_PROP_FPS)
    width = int(video_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"✅ Video loaded - Resolution: {width}x{height}, FPS: {fps}")
    print(f"⚙️  Config: EAR_THRESH={config.EYE_AR_THRESH}, MAR_THRESH={config.MOUTH_AR_THRESH}, DROWSY_THRESHOLD={config.DROWSY_SCORE_THRESHOLD}")
    
    count = 0
    score = 0
    drowsy_count = 0
    alert_active = False
    frame_start_time = time.time()
    last_out = None
    
    print("\n⏱️  Processing frames...")
    print("Press 'q' or ESC to stop, 'e' to export CSV\n")
    
    while True:
        success, frame = video_cap.read()
        
        if not success:
            print("❌ End of video reached")
            break
        
        frame = cv2.resize(frame, (800, 500))
        count += 1
        elapsed_time = time.time() - frame_start_time
        
        if count % config.PROCESS_EVERY_N_FRAMES == 0:
            try:
                if selected_backend == "mediapipe":
                    face_present, ear, mar = process_image(frame, config)
                else:
                    face_present, ear, mar = process_image_face_recognition(frame, config)

                out = analyzer.update(now=time.time(), ear=ear, mar=mar, face_present=bool(face_present))
                last_out = out
                score = int(round(out.risk * 100))

                if out.face_present:
                    if out.eye_closed or out.yawn_active:
                        indicator = "👁️ EYES CLOSED" if out.eye_closed else "👄 MOUTH OPEN"
                        print(f"Frame {count}: {indicator} | Risk: {score}% | PERCLOS: {out.perclos:.2f}")

                # Record frame data to session
                session.record_frame(elapsed_time, score, out.eye_closed, out.yawn_active)
                    
            except Exception as e:
                print(f"⚠️  Error: {e}")
                continue
        
        # Draw UI
        cv2.putText(frame, f"Risk: {score}%", (10, frame.shape[0] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        perclos = float(last_out.perclos) if last_out is not None else 0.0
        cv2.putText(
            frame,
            f"PERCLOS: {perclos:.2f}  Calib: {'YES' if analyzer.calibrated else 'NO'}",
            (10, frame.shape[0] - 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2,
        )
        
        # Treat as drowsy if analyzer says so OR if risk is very high.
        is_drowsy = bool(last_out.drowsy) if last_out is not None else False
        is_drowsy = is_drowsy or (score >= 85)

        if is_drowsy:
            cv2.putText(frame, "DROWSY DETECTED!", (frame.shape[1] - 300, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
            trigger_alert_if_needed()
            
            if not alert_active:
                drowsy_count += 1
                alert_active = True
                session.record_drowsy_event()
            
            if (drowsy_count % 10) < 5:
                cv2.rectangle(frame, (10, 10), (frame.shape[1] - 10, 60),
                            (0, 0, 255), 2)
        else:
            alert_active = False
        
        cv2.putText(frame, f"Frame: {count}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow("🚗 Drowsiness Detection", frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            print("\n⏹️  Detection stopped by user")
            break
        elif key == ord('e'):
            print("\n💾 Exporting session data to CSV...")
            csv_file = session.export_csv()
            if csv_file:
                print(f"✅ Session data exported: {csv_file}")
    
    video_cap.release()
    cv2.destroyAllWindows()
    
    # Print summary
    summary = session.get_summary()
    print("\n" + "="*70)
    print("📊 DETECTION SESSION SUMMARY")
    print("="*70)
    print(f"Duration: {summary['duration_seconds']}s")
    print(f"Total frames: {summary['total_frames']}")
    print(f"Average FPS: {summary['avg_fps']}")
    print(f"Drowsy alerts: {summary['drowsy_events']}")
    print(f"Eye closures detected: {summary['eye_closures']}")
    print(f"Yawns detected: {summary['yawns']}")
    print(f"Average score: {summary['avg_score']}")
    print("="*70)
    
    # Auto-export if enabled
    if enable_csv_export:
        csv_file = session.export_csv()
        if csv_file:
            print(f"✅ Session data auto-exported: {csv_file}")
    
    print("\n✨ Thank you for using the Drowsiness Detection System!")
    print("Stay safe on the road! 🚗\n")


# ============================================================================
# 🧪 TEST DEPENDENCIES
# ============================================================================

def test_dependencies():
    """Test if all dependencies are installed"""
    print("\n" + "="*70)
    print("🔍 TESTING DEPENDENCIES")
    print("="*70)
    
    dependencies = {
        'cv2': 'OpenCV',
        'numpy': 'NumPy',
        'scipy': 'SciPy',
        'mediapipe': 'MediaPipe'
    }
    
    all_installed = True
    
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"✅ {name} - OK")
        except ImportError:
            print(f"❌ {name} - NOT INSTALLED")
            all_installed = False

    if face_recognition is None:
        print("ℹ️  face_recognition - OPTIONAL (not installed)")
    else:
        print("✅ face_recognition - OPTIONAL backend available")
    
    print("="*70)
    return all_installed


# ============================================================================
# 🚀 MAIN
# ============================================================================

if __name__ == "__main__":
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "🧠 DROWSINESS DETECTION SYSTEM (MediaPipe)" + " "*10 + "║")
    print("╚" + "="*68 + "╝")

    if face_mesh is None and face_landmarker is None:
        print("\nRunning fallback detector...")
        try:
            from drowsiness_detection_simple import detect_drowsiness_simple

            detect_drowsiness_simple()
            sys.exit(0)
        except Exception as exc:
            print(f"Fallback launch failed: {exc}")
            print("Run this manually:")
            print(f"{sys.executable} drowsiness_detection_simple.py")
            sys.exit(1)

    if not test_dependencies():
        print("\nMissing packages detected. Installing with current Python...")
        install_result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "mediapipe"],
            check=False,
        )
        if install_result.returncode != 0:
            print("Failed to install mediapipe automatically.")
            print("Run manually:")
            print(f"{sys.executable} -m pip install mediapipe")
            sys.exit(1)
    
    print("\n📋 CHOOSE AN OPTION:")
    print("  1. Use Webcam (Real-time)")
    print("  2. Use Video File")
    print("  3. Run Tests")
    print("  4. Exit")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        print("\n🎥 Starting webcam detection...")
        detect_drowsiness_video(video_source=0, use_webcam=True)
    
    elif choice == '2':
        video_path = input("Enter video file path: ").strip()
        if os.path.exists(video_path):
            detect_drowsiness_video(video_source=video_path, use_webcam=False)
        else:
            print(f"❌ Video not found: {video_path}")
    
    elif choice == '3':
        test_dependencies()
    
    else:
        print("✅ Exiting...")
    
    print("\n" + "="*70 + "\n")
