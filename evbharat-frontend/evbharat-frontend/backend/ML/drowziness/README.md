# Drowsiness Detection Project

This project detects driver drowsiness using webcam/video input.

## Available Detectors

1. Main detector: `drowsiness_detection.py`
   - Uses MediaPipe-based workflow in the current project setup.

2. MediaPipe detector: `drowsiness_detection_mediapipe.py`
   - Fast and recommended for Python 3.12+ and Python 3.13.

3. OpenCV fallback detector: `drowsiness_detection_simple.py`
   - Runs without MediaPipe face mesh features.

4. Legacy detector: `drowsiness_detection_legacy.py`
   - Face-recognition/dlib-based path for older Python environments (typically 3.10/3.11).

## Prerequisites

- Windows
- Python 3.10+ (project is currently running on Python 3.13)
- Webcam (for real-time mode)

## Setup

### 1) Open terminal in project folder

Example path:

C:\Users\hp\OneDrive\Desktop\drowziness

### 2) Create virtual environment (if needed)

python -m venv .venv

### 3) Activate virtual environment (Windows PowerShell)

.\.venv\Scripts\Activate.ps1

If activation is blocked by policy, run PowerShell as your user and execute:

Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

Then activate again:

.\.venv\Scripts\Activate.ps1

### 4) Install dependencies

Recommended stack (works on Python 3.13):

pip install -r requirements.txt

Optional legacy stack (Python 3.10/3.11):

pip install -r requirements-legacy-face-recognition.txt

## Run

### Recommended

python drowsiness_detection.py

or

python drowsiness_detection_mediapipe.py

### OpenCV fallback

python drowsiness_detection_simple.py

### Legacy face_recognition path

python drowsiness_detection_legacy.py

## Web UI (HTML)

Run a local browser view (camera stream + live metrics):

1) Install deps:

pip install -r requirements.txt

2) Start server:

python web_server.py

3) Open in browser:

http://127.0.0.1:5000/

The web UI can also show basic facial-expression cues (e.g., smile/frown/jaw open) when available. These are approximate facial movement signals and are not personality or mental state detection.

Web audio alert behavior:

- Click "Enable Voice Alerts" once after opening the page (required by browser autoplay rules).
- Medium and high risk states trigger a beep + spoken warning with cooldown.
- CLI mode (`python drowsiness_detection.py`) still has Windows beep + voice alert logic.

## Validate installation

python VALIDATION.py

Expected result includes:

Status: READY

## Typical Workflow

1. Activate virtual environment.
2. Install dependencies from requirements.txt.
3. Run VALIDATION.py.
4. Start drowsiness_detection.py.

## Notes on face_recognition and dlib

- On Python 3.13 (Windows), face_recognition/dlib often fails to install.
- If legacy install fails, use MediaPipe path:
  - python drowsiness_detection.py
  - or python drowsiness_detection_mediapipe.py

## Troubleshooting

### "activate" command fails

Use the full script path in PowerShell:

.\.venv\Scripts\Activate.ps1

### Webcam not opening

- Close other apps using camera.
- Check camera permissions in Windows settings.
- Try rebooting and run again.

### Missing package errors

Reinstall core dependencies:

pip install -r requirements.txt

### Validation passes but script exits quickly

Run directly with Python from the same terminal after activation:

python drowsiness_detection.py

## Project Files

- drowsiness_detection.py
- drowsiness_detection_mediapipe.py
- drowsiness_detection_simple.py
- drowsiness_detection_legacy.py
- requirements.txt
- requirements-legacy-face-recognition.txt
- VALIDATION.py
- SETUP_GUIDE.md
