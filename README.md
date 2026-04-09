# EV Bharat

Professional setup and operations guide for first-time developers.

---

## 1. Project Overview

EV-Bharat includes these major parts:

- Frontend web app (Vite + TypeScript)
- Node.js backend API (auth, profile, app APIs)
- ESP32 bridge backend (Bluetooth or Serial over WebSocket)
- RAG backend for EV document Q&A
- ML backend for battery analytics + drowsiness monitoring
- YOLO camera detection service (optional)

---

## 2. Port Map (Important)

| Service | Default Port | Command | Health / Check URL |
| --- | --- | --- | --- |
| Frontend (Vite) | `5173` (or `5174` if busy) | `npm run dev` | `http://localhost:5173` |
| Node Backend API | `3001` | `npm run dev` (in backend) | `http://localhost:3001/api/health` |
| RAG Backend (FastAPI) | `8001` | `./start_rag_backend.sh` | `http://localhost:8001/health` |
| ESP32 Bridge (Bluetooth) | `8002` | `./start_bluetooth_bridge.sh` | `http://localhost:8002/status` |
| ESP32 Bridge (Serial) | `8002` | `./start_serial_bridge.sh` | `http://localhost:8002/status` |
| ML Backend (Battery + Drowsiness) | `8000` | `python run_ml_backend.py` | `http://localhost:8000/health` |
| Drowsiness standalone web UI (optional) | `5000` | `python web_server.py` | `http://127.0.0.1:5000/status` |
| YOLO Camera Service (optional) | `8000` by default | `uvicorn camera_service.server:app ...` | `http://localhost:8000/health` |

### Port conflict note

- ML Backend and YOLO Camera Service both default to `8000`.
- Run one of them on a different port if needed (example: YOLO on `8010`).

---

## 3. Prerequisites

Install these first:

- Node.js `20+`
- npm
- Python `3.10+`
- pip

On Linux/devcontainer, also install system packages:

```bash
sudo apt-get update
sudo apt-get install -y libbluetooth-dev python3-dev libgl1 libglib2.0-0 libgles2 libegl1
```

Optional (recommended for PDF/OCR-heavy RAG workflows):

```bash
sudo apt-get install -y tesseract-ocr poppler-utils
```

---

## 4. One-Time Installation

### 4.1 Frontend dependencies

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend
npm install
```

### 4.2 Node backend dependencies

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
npm install
cp .env.example .env
```

### 4.3 Python dependencies (per service)

From backend folder:

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend

# ESP32 Bluetooth bridge
python3 -m pip install -r requirements_bluetooth.txt

# ESP32 Serial bridge
python3 -m pip install -r requirements_serial.txt

# ML backend
python3 -m pip install -r ML/requirements.txt
```

For RAG backend:

```bash
cd "/workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend/EVBharat Bot"
# Ensure .env contains GOOGLE_API_KEY=... before starting
python3 -m pip install -r requirements.txt
```

For YOLO camera service (from repo root):

```bash
cd /workspaces/EV-Bharat
python3 -m pip install -r camera_service/requirements.txt
```

### Python environment note (important)

If you see a PEP 668 "externally-managed-environment" error, use either:

1. A virtual environment (recommended), or
2. `python3 -m pip install --break-system-packages ...`

---

## 5. Startup Commands

### 5.1 Quick start (frontend + Bluetooth bridge)

From repo root:

```bash
./start_project.sh
```

This starts:

- Frontend (`5173`)
- Bluetooth bridge (`8002`)

It does **not** start Node API, RAG, or ML services.

### 5.2 Full stack startup (recommended for complete project)

Use separate terminals.

### Terminal A - Frontend

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend
npm run dev
```

### Terminal B - Node API backend

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
npm run dev
```

### Terminal C - ESP32 bridge (choose one)

Bluetooth mode:

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
./start_bluetooth_bridge.sh
```

Serial mode:

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
./start_serial_bridge.sh
```

### Terminal D - RAG backend (optional, for chatbot)

```bash
cd "/workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend/EVBharat Bot"
./start_rag_backend.sh
```

### Terminal E - ML backend (optional, battery + drowsiness APIs)

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
python3 run_ml_backend.py
```

### Terminal F - YOLO camera service (optional)

Run on `8010` if ML backend is already using `8000`:

```bash
cd /workspaces/EV-Bharat
YOLO_SERVICE_PORT=8010 uvicorn camera_service.server:app --host 0.0.0.0 --port 8010 --reload
```

Then update frontend env (`VITE_YOLO_STREAM_URL=http://localhost:8010/stream`) if needed.

---

## 6. Service Verification Commands

Run these checks after startup:

```bash
curl http://localhost:3001/api/health
curl http://localhost:8002/status
curl http://localhost:8001/health
curl http://localhost:8000/health
curl http://localhost:8000/drowsiness/status
```

If YOLO runs on `8010`:

```bash
curl http://localhost:8010/health
```

Check active listeners:

```bash
lsof -i :3001 -i :5173 -i :8000 -i :8001 -i :8002
```

---

## 7. Machine Learning Models Used

### 7.1 Battery analytics models

Location:

- `evbharat-frontend/evbharat-frontend/backend/ML/battery_models/`

Primary artifacts:

- `SOC_model.pkl`
- `SOH_model.pkl`
- `RUL_model.pkl`
- `RUL_scaler.pkl`
- `battery_intelligence.pkl`
- `model_config.pkl`

API host:

- Served by `python run_ml_backend.py` on `http://localhost:8000`

### 7.2 Drowsiness detection models

Location:

- `evbharat-frontend/evbharat-frontend/backend/ML/drowziness/`

Model stack:

- MediaPipe FaceMesh / FaceLandmarker (`models/face_landmarker.task`)
- TensorFlow/Keras model (`drowsiness_model.h5`)
- OpenCV fallback pipeline

API/web UI:

- Combined ML mount: `http://localhost:8000/drowsiness/...`
- Standalone UI: `http://127.0.0.1:5000`

### 7.3 YOLO object detection model

Location:

- `camera_service/`

Model files:

- `yolov3.cfg`
- `yolov3.weights`
- `coco.names`

Default host:

- `http://localhost:8000` (or custom `YOLO_SERVICE_PORT`)

### 7.4 RAG chatbot model pipeline

Location:

- `evbharat-frontend/evbharat-frontend/backend/EVBharat Bot/`

Pipeline:

- Retrieval over uploaded documents
- Generation using configured LLM provider (Google API key required)

Host:

- `http://localhost:8001`

---

## 8. Common Errors and Fixes

### 8.1 "Address already in use" on startup

Cause:

- Another process is using the same port.

Fix:

```bash
lsof -i :8000
# kill the PID if safe, or change service port
```

For YOLO/ML conflict, run YOLO on `8010`.

### 8.2 Serial bridge cannot connect / "Port already in use"

Cause:

- Arduino Serial Monitor is open, or wrong COM/tty device.

Fix:

- Close Arduino Serial Monitor.
- Re-run `./start_serial_bridge.sh`.
- Check ports list: `curl http://localhost:8002/ports`

### 8.3 Bluetooth bridge import error (`No module named bluetooth`)

Fix:

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
python3 -m pip install -r requirements_bluetooth.txt
sudo apt-get install -y libbluetooth-dev python3-dev
```

### 8.4 Login/auth APIs fail from frontend

Cause:

- Node backend on `3001` is not running.

Fix:

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
npm run dev
curl http://localhost:3001/api/health
```

### 8.5 RAG backend fails (API key or package issues)

Fix:

- Ensure `.env` in `EVBharat Bot` contains `GOOGLE_API_KEY=...`
- Reinstall: `python3 -m pip install -r requirements.txt`
- Restart with `./start_rag_backend.sh`

### 8.6 ML backend says model files are missing

Cause:

- Trained artifacts not available in `ML/battery_models`.

Fix:

- Run notebook: `backend/ML/battery_analytics_system.ipynb` to generate models.
- Validate with:

```bash
cd /workspaces/EV-Bharat/evbharat-frontend/evbharat-frontend/backend
python3 test_models.py
```

If scaler compatibility fails, regenerate:

```bash
cd /workspaces/EV-Bharat
python3 regenerate_scaler.py
```

### 8.7 Drowsiness camera unavailable

Cause:

- No webcam access in container, or missing OpenCV runtime libs.

Fix:

```bash
sudo apt-get install -y libgl1 libglib2.0-0 libgles2 libegl1
```

If using devcontainer, expose camera device (`/dev/video0`) to container.

### 8.8 WebSocket connection to ESP32 fails in devcontainer/codespace

Cause:

- ESP32 is connected to host machine, but bridge is running in container.

Fix:

- Run `START_ON_WINDOWS.bat` on host Windows machine.
- Update dashboard WebSocket URL to `ws://<host-ip>:8002/ws`.

---

## 9. Frontend Proxy Routing (for understanding requests)

Vite dev proxy routes:

- `/api` -> Node backend `127.0.0.1:3001`
- `/api/rag` -> RAG backend `127.0.0.1:8001`
- `/api/battery` -> ML backend `127.0.0.1:8000`
- `/api/drowsiness` -> ML backend `127.0.0.1:8000/drowsiness`

This is why frontend can call relative `/api/...` paths while services run on different ports.

---

## 10. Primary Access URLs

- App home: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- RAG docs: `http://localhost:8001/docs`
- ML health: `http://localhost:8000/health`
- Bridge status: `http://localhost:8002/status`


## 5. Machine Learning Models

The EV-Bharat project utilizes several machine learning models for various features. Here is an overview of the models and where they are used:

### a. Object Detection (YOLOv3)

-   **Location:** `camera_service/`
-   **Purpose:** This service uses a pretrained YOLOv3 model to perform real-time object detection on video streams, typically from an ESP32-CAM.
-   **Files:** `yolov3.cfg`, `yolov3.weights`, `coco.names`.
-   **Functionality:** It provides endpoints to get an annotated MJPEG stream (`/stream`), a single snapshot (`/snapshot`), or JSON metadata about detected objects (`/detect`).

### b. Drowsiness Detection

-   **Location:** `evbharat-frontend/evbharat-frontend/backend/ML/drowziness/`
-   **Purpose:** To monitor the driver's state and alert them if signs of drowsiness are detected.
-   **Models & Methods:**
    -   **MediaPipe:** The primary, recommended method using face mesh for fast and accurate feature extraction.
    -   **OpenCV Fallback:** A simpler model that works without MediaPipe.
    -   **Legacy Model:** A `dlib` and `face_recognition` based model for older Python environments.
    -   **Keras/TensorFlow Model:** A saved model (`drowsiness_model.h5`) is used for classification.

### c. Battery Analytics

-   **Location:** `evbharat-frontend/evbharat-frontend/backend/ML/battery_analytics_system.ipynb`
-   **Purpose:** This Jupyter Notebook contains the analysis and model training for predicting key battery metrics.
-   **Models & Predictions:**
    -   **State of Charge (SOC) Prediction:** Uses models like `RandomForestRegressor` and `GradientBoostingRegressor`.
    -   **State of Health (SOH) Prediction:** Employs regression models to estimate the battery's health over time.
    -   **Remaining Useful Life (RUL) Prediction:** Utilizes time-series analysis and models like `LinearRegression` to predict the battery's lifespan.

### d. RAG Chatbot

-   **Location:** `evbharat-frontend/evbharat-frontend/backend/EVBharat Bot/`
-   **Purpose:** Provides a conversational AI to answer questions about electric vehicles.
-   **Technology:** It uses a Retrieval-Augmented Generation (RAG) architecture.
    -   **Retrieval:** A vector database (likely using ChromaDB or FAISS with Sentence Transformers) finds relevant information from a knowledge base (`test_ev_document.txt`).
    -   **Generation:** A Large Language Model (LLM) then uses this retrieved context to generate a coherent and informative answer to the user's query.

    
