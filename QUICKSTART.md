# 🚀 Quick Start Guide - EVBharat with ESP32 Bluetooth Control

## ✅ What's Been Set Up

Your EVBharat project is now fully configured with ESP32 Bluetooth vehicle control! Here's what has been implemented:

### 1. **ESP32 Firmware** ([hardware/esp32.ino](hardware/esp32.ino))
   - ✅ Bluetooth Classic support (device name: "ESP32_V2E_CAR")
   - ✅ Bidirectional communication (commands + telemetry)
   - ✅ Motor control (forward, backward, left, right, stop)
   - ✅ Real-time telemetry (battery, temperature, direction)
   - ✅ Compatible with both web control and Dabble mobile app

### 2. **Bluetooth Bridge Service** (Python)
   - ✅ Backend service: [backend/bluetooth_bridge.py](evbharat-frontend/evbharat-frontend/backend/bluetooth_bridge.py)
   - ✅ Auto-discovery of ESP32 device
   - ✅ WebSocket API on port 8002
   - ✅ REST endpoints for status and commands
   - ✅ Real-time telemetry broadcasting
   - ✅ Startup script: [backend/start_bluetooth_bridge.sh](evbharat-frontend/evbharat-frontend/backend/start_bluetooth_bridge.sh)

### 3. **Frontend Integration**
   - ✅ Bluetooth service utility: [src/utils/bluetooth-service.ts](evbharat-frontend/evbharat-frontend/src/utils/bluetooth-service.ts)
   - ✅ Vehicle control panel in dashboard
   - ✅ Real-time telemetry display
   - ✅ D-pad controls with visual feedback
   - ✅ Keyboard controls (WASD or Arrow keys)
   - ✅ Connection status indicators

## 🏃‍♂️ How to Run the Project

### **Option 1: Automated Startup (Recommended)**

```bash
# From project root directory
./start_project.sh
```

This script will:
- ✅ Check and install all dependencies
- ✅ Start the Bluetooth bridge service
- ✅ Start the frontend dev server
- ✅ Show you the URL to access the app

### **Option 2: Manual Startup**

#### Terminal 1 - Bluetooth Bridge
```bash
cd evbharat-frontend/evbharat-frontend/backend
./start_bluetooth_bridge.sh
```

#### Terminal 2 - Frontend
```bash
cd evbharat-frontend/evbharat-frontend
npm install  # First time only
npm run dev
```

### **Option 3: Frontend Only (No Bluetooth)**

If you just want to test the web app without ESP32:

```bash
cd evbharat-frontend/evbharat-frontend
npm run dev
```

## 🎮 Using Vehicle Control

### Step 1: Flash Your ESP32
1. Open [hardware/esp32.ino](hardware/esp32.ino) in Arduino IDE
2. Install library: **DabbleESP32**
3. Select your ESP32 board
4. Upload the code

### Step 2: Start the Services
```bash
./start_project.sh
```

### Step 3: Access the Dashboard
1. Open browser to: **http://localhost:5173**
2. Login/Register if needed
3. Navigate to **Dashboard** page
4. Find the **Vehicle Control** panel (right column)

### Step 4: Connect to ESP32
1. Power on your ESP32
2. Click the **Connect** button in the control panel
3. Wait for green indicator (Connected)

### Step 5: Control Your Vehicle!

**Using Mouse:**
- Click the D-pad arrows
- Click STOP to halt

**Using Keyboard:**
- **W** or **↑** - Forward
- **S** or **↓** - Backward
- **A** or **←** - Turn Left
- **D** or **→** - Turn Right
- **Space** - Stop

## 📊 Telemetry Display

The control panel shows real-time data:
- **Battery**: Current charge level (%)
- **Temperature**: Motor/battery temp (°C)
- **Direction**: Current movement direction
- **Status**: Moving or stopped

## 🔧 Troubleshooting

### Frontend won't start
```bash
cd evbharat-frontend/evbharat-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Bluetooth bridge error
```bash
# Install Python dependencies
pip install fastapi uvicorn pybluez websockets

# On Linux, install Bluetooth development files
sudo apt-get install libbluetooth-dev python3-dev
```

### ESP32 not connecting
1. Verify ESP32 is powered on
2. Check Bluetooth is enabled on your computer
3. Ensure device name is "ESP32_V2E_CAR"
4. Check bridge logs: `backend/bluetooth_bridge.log`

### WebSocket connection failed
1. Verify bridge service is running:
   ```bash
   curl http://localhost:8002/status
   ```
2. Check firewall allows port 8002
3. Look at browser console for errors

## 🌐 Available URLs

After starting the project:

- **Frontend**: http://localhost:5173
- **Dashboard**: http://localhost:5173/dashboard
- **Bluetooth Status**: http://localhost:8002/status
- **RAG Chatbot** (if running): http://localhost:8001

## 📁 Project Structure

```
/workspaces/ev/
├── hardware/
│   ├── esp32.ino                 # ESP32 firmware
│   └── README_BLUETOOTH.md       # Detailed Bluetooth guide
├── evbharat-frontend/evbharat-frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── dashboard.ts      # Dashboard with vehicle control
│   │   └── utils/
│   │       └── bluetooth-service.ts  # Bluetooth WebSocket client
│   └── backend/
│       ├── bluetooth_bridge.py   # Bluetooth bridge service
│       ├── requirements_bluetooth.txt
│       └── start_bluetooth_bridge.sh
└── start_project.sh              # Master startup script
```

## 🎯 What You Can Do Now

1. **Test the Web Interface**: 
   - Visit http://localhost:5173/dashboard
   - Explore all features

2. **Flash Your ESP32**:
   - Upload [hardware/esp32.ino](hardware/esp32.ino)
   - Power it up

3. **Control Your Vehicle**:
   - Connect via the dashboard
   - Use keyboard or mouse controls
   - View real-time telemetry

4. **Extend the System**:
   - Add sensors (ultrasonic, GPS, camera)
   - Implement obstacle avoidance
   - Add autonomous navigation
   - Record and replay routes

## 📖 Documentation

- **Main README**: [README.md](README.md)
- **Bluetooth Setup Guide**: [hardware/README_BLUETOOTH.md](hardware/README_BLUETOOTH.md)
- **ESP32 Code**: [hardware/esp32.ino](hardware/esp32.ino)

## 🚀 Next Steps

Consider implementing:
- [ ] Camera feed from ESP32-CAM
- [ ] GPS tracking and location sharing
- [ ] Ultrasonic sensors for obstacle detection
- [ ] Speed control with PWM adjustment
- [ ] Real battery voltage monitoring (ADC)
- [ ] Mission planning with waypoints
- [ ] Multiple vehicle fleet management

## 🎉 You're All Set!

The project is running at **http://localhost:5173**

Navigate to the **Dashboard** to start controlling your ESP32 vehicle!

---

**Need Help?**
- Check [hardware/README_BLUETOOTH.md](hardware/README_BLUETOOTH.md) for detailed setup
- Review bridge logs: `backend/bluetooth_bridge.log`
- Check browser console for frontend errors

Happy building! 🚗💨
