# Technology Stack

## 🛠️ Complete Technology Recommendations

```
Frontend:
  └─ React.js / Flutter
      ├─ Leaflet/Google Maps SDK
      ├─ Chart.js for visualizations
      └─ Material-UI/Tailwind CSS

Backend:
  └─ Python (Flask/FastAPI)
      ├─ RESTful API design
      ├─ JWT authentication
      └─ Redis for caching

Hardware/IoT:
  └─ Microcontroller
      ├─ ESP32 (WiFi + BLE)
      ├─ Arduino (basic prototyping)
      └─ Raspberry Pi (advanced)
  └─ Communication
      ├─ MQTT (Mosquitto broker)
      ├─ Eclipse Paho (client library)
      └─ WebSocket (real-time updates)
  └─ Firmware
      ├─ Arduino IDE / PlatformIO
      ├─ MicroPython / C++
      └─ FreeRTOS (for ESP32)

ML/AI:
  └─ Python
      ├─ TensorFlow/PyTorch
      ├─ Scikit-learn
      ├─ Pandas/NumPy
      └─ LSTM/Random Forest models

APIs & Services:
  ├─ Google Maps API (routing)
  ├─ TomTom/HERE API (traffic)
  └─ OpenWeatherMap (weather impact)

Database:
  ├─ PostgreSQL (user data, logs)
  └─ MongoDB (real-time sensor data)

Deployment:
  └─ Docker + Kubernetes
      ├─ AWS/Azure/GCP
      └─ CI/CD with GitHub Actions
```

---

## 🐍 Python Dependencies

### requirements.txt

```txt
# Core Framework
flask==3.0.0
fastapi==0.109.0
uvicorn==0.27.0
python-dotenv==1.0.0

# Machine Learning
tensorflow==2.15.0
scikit-learn==1.4.0
pandas==2.1.4
numpy==1.26.3
joblib==1.3.2

# IoT/MQTT
paho-mqtt==1.6.1
pyserial==3.5

# APIs & HTTP
requests==2.31.0
googlemaps==4.10.0
geopy==2.4.1

# Database
psycopg2-binary==2.9.9
pymongo==4.6.1
redis==5.0.1

# Data Processing
scipy==1.11.4
matplotlib==3.8.2
seaborn==0.13.1

# Authentication
pyjwt==2.8.0
bcrypt==4.1.2

# Testing
pytest==7.4.4
pytest-cov==4.1.0

# Utilities
python-dateutil==2.8.2
pytz==2023.3
```

---

## 💻 Development Environment Setup

### 1. Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Arduino/ESP32 Setup

**Required Software:**
- Arduino IDE 2.x
- ESP32 Board Support Package
- Libraries: PubSubClient, DHT, TinyGPS++

**Installation:**
```
1. Arduino IDE → Preferences
2. Additional Board URLs: https://dl.espressif.com/dl/package_esp32_index.json
3. Tools → Board → Boards Manager → Search "ESP32" → Install
4. Sketch → Include Library → Manage Libraries → Install required libs
```

### 3. MQTT Broker Setup

**Option A: Local (Mosquitto)**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients

# Start service
sudo systemctl start mosquitto
sudo systemctl enable mosquitto

# Test
mosquitto_sub -t "test/topic" &
mosquitto_pub -t "test/topic" -m "Hello MQTT"
```

**Option B: Cloud (HiveMQ)**
- Free tier: `broker.hivemq.com:1883`
- No authentication required for testing
- Web dashboard available

### 4. Database Setup

**PostgreSQL:**
```bash
# Install
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb evdb
sudo -u postgres createuser evuser

# Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE evdb TO evuser;
```

**MongoDB:**
```bash
# Install
sudo apt-get install mongodb

# Start service
sudo systemctl start mongodb

# Create database
mongo
use ev_telemetry
db.createCollection("sensor_data")
```

---

## 🔑 API Keys Required

| Service | Purpose | Free Tier | Link |
|---------|---------|-----------|------|
| **Google Maps** | Routes, geocoding | $200/month | [console.cloud.google.com](https://console.cloud.google.com) |
| **TomTom** | Traffic data | 2,500 req/day | [developer.tomtom.com](https://developer.tomtom.com) |
| **OpenWeatherMap** | Weather (optional) | 1,000 calls/day | [openweathermap.org](https://openweathermap.org/api) |
| **AWS IoT Core** | MQTT broker (optional) | 250K mins/month | [aws.amazon.com/iot-core](https://aws.amazon.com/iot-core/) |

**Setup:**
```bash
# Create .env file
cp .env.example .env

# Edit with your keys
GOOGLE_MAPS_API_KEY=your_key_here
TOMTOM_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
MQTT_BROKER=broker.hivemq.com
MQTT_PORT=1883
```

---

## 🏗️ Project Structure

```
ev/
├── backend/
│   ├── app.py                  # Main Flask/FastAPI app
│   ├── config.py               # Configuration
│   ├── models/                 # ML models
│   │   ├── battery_health.py
│   │   └── energy_prediction.py
│   ├── routes/                 # API endpoints
│   │   ├── telemetry.py
│   │   ├── routing.py
│   │   └── auth.py
│   ├── services/               # Business logic
│   │   ├── mqtt_handler.py
│   │   ├── traffic_api.py
│   │   └── ml_inference.py
│   └── utils/                  # Helper functions
│       ├── database.py
│       └── logger.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Map.jsx
│   │   │   └── BatteryStatus.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── firmware/
│   ├── esp32_sensor_mqtt/
│   │   ├── esp32_sensor_mqtt.ino
│   │   ├── config.h
│   │   └── sensors.h
│   └── arduino_basic/
│
├── ml_training/
│   ├── notebooks/
│   │   ├── battery_health_training.ipynb
│   │   └── energy_prediction_training.ipynb
│   ├── datasets/
│   └── trained_models/
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── HARDWARE_SETUP.md
│   ├── TECH_STACK.md
│   └── DEVELOPMENT_ROADMAP.md
│
├── tests/
│   ├── test_api.py
│   ├── test_ml_models.py
│   └── test_integration.py
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🔧 Recommended IDEs & Tools

### Code Editors
- **VS Code** (Recommended)
  - Extensions: Python, ESP32, MongoDB, REST Client
- **PyCharm** (Python development)
- **Arduino IDE** (Firmware)

### Development Tools
- **Postman** - API testing
- **MQTT Explorer** - MQTT debugging
- **MongoDB Compass** - Database GUI
- **pgAdmin** - PostgreSQL management
- **Git** - Version control

### Testing Tools
- **pytest** - Python unit testing
- **Jupyter Notebook** - ML experimentation
- **TensorBoard** - Model visualization

---

## 🐳 Docker Setup (Optional)

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MQTT_BROKER=mosquitto
      - DATABASE_URL=postgresql://user:pass@db:5432/evdb
    depends_on:
      - db
      - mosquitto
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: evdb
      POSTGRES_USER: evuser
      POSTGRES_PASSWORD: evpass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Run:**
```bash
docker-compose up -d
```

---

## 📦 Installation Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] requirements.txt installed
- [ ] Arduino IDE setup with ESP32 support
- [ ] MQTT broker running (local/cloud)
- [ ] Database created (PostgreSQL/MongoDB)
- [ ] API keys obtained and configured
- [ ] Git repository initialized
- [ ] .env file configured

---

## 🚀 Quick Start Commands

```bash
# Backend
cd backend
python app.py

# Frontend (if using React)
cd frontend
npm install
npm start

# Upload firmware to ESP32
# Open esp32_sensor_mqtt.ino in Arduino IDE
# Select Board: ESP32 Dev Module
# Upload

# Run tests
pytest tests/

# Train ML model
cd ml_training
jupyter notebook
```

---

**Next**: See [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for week-by-week implementation plan.
