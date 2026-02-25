# ESP32 Bluetooth Vehicle Control

This guide explains how to connect your ESP32 hardware to the EVBharat web application via Bluetooth.

## 🏗️ Architecture

```
ESP32 (Bluetooth Classic) <-> Bluetooth Bridge (Python) <-> WebSocket <-> Web Frontend
```

The ESP32 uses Bluetooth Classic (RFCOMM), which is not directly accessible from web browsers. Therefore, we use a Python bridge service that:
1. Connects to the ESP32 via Bluetooth Classic
2. Exposes a WebSocket API for the web frontend
3. Relays commands and telemetry between the two

## 📋 Prerequisites

### Hardware
- ESP32 development board
- Motor driver (L298N or similar)
- DC motors
- Power supply

### Software
- Arduino IDE with ESP32 board support
- Python 3.8+
- Node.js 16+
- BlueZ (Linux) or compatible Bluetooth stack

## 🔧 Setup Instructions

### 1. Flash the ESP32

1. Open `hardware/esp32.ino` in Arduino IDE
2. Install required libraries:
   - **DabbleESP32** (from Library Manager)
3. Select your ESP32 board and COM port
4. Upload the code
5. The ESP32 will advertise as "ESP32_V2E_CAR"

### 2. Install Backend Dependencies

```bash
cd evbharat-frontend/evbharat-frontend/backend

# Install Python dependencies for Bluetooth bridge
pip install -r requirements_bluetooth.txt

# On Linux, you may need to install BlueZ development files:
sudo apt-get install libbluetooth-dev
```

### 3. Start the Bluetooth Bridge

```bash
# Make the script executable
chmod +x start_bluetooth_bridge.sh

# Run the bridge service
./start_bluetooth_bridge.sh
```

The bridge will:
- Scan for "ESP32_V2E_CAR" device
- Connect automatically when found
- Start WebSocket server on port 8002
- Forward telemetry and commands

### 4. Start the Frontend

```bash
cd evbharat-frontend/evbharat-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be available at `http://localhost:5173`

## 🎮 Using the Vehicle Control

1. Navigate to the **Dashboard** page
2. Find the **Vehicle Control** panel in the right column
3. Click the **Connect** button
4. Once connected, the status indicator will turn green
5. Use the D-pad controls or keyboard to control the vehicle:

### Keyboard Controls
- **W** or **↑**: Forward
- **S** or **↓**: Backward  
- **A** or **←**: Turn Left
- **D** or **→**: Turn Right
- **Space**: Stop

### Telemetry Display
The dashboard shows real-time data from the ESP32:
- Battery level (simulated)
- Temperature
- Current direction
- Movement status

## 🔌 API Endpoints

The Bluetooth bridge exposes the following REST endpoints:

- `GET /` - Service info
- `GET /status` - Connection status and last telemetry
- `POST /connect` - Manually trigger connection
- `POST /disconnect` - Disconnect from ESP32
- `POST /command/{command}` - Send command (FORWARD, BACKWARD, LEFT, RIGHT, STOP, STATUS)
- WebSocket `/ws` - Real-time bidirectional communication

## 📡 ESP32 Commands

Send these commands to control the vehicle:
- `FORWARD` - Move forward
- `BACKWARD` - Move backward
- `LEFT` - Turn left (pivot)
- `RIGHT` - Turn right (pivot)
- `STOP` - Stop all motors
- `STATUS` - Request telemetry update

## 🐛 Troubleshooting

### ESP32 not found
- Ensure ESP32 is powered on and Bluetooth is enabled
- Check that the device name is "ESP32_V2E_CAR"
- Run `bluetoothctl` (Linux) or Bluetooth settings to verify visibility

### Bridge won't connect
- Check Python dependencies are installed: `pip list | grep pybluez`
- On Linux, ensure you have permissions: `sudo usermod -a -G bluetooth $USER`
- Try manual pairing first through system Bluetooth settings

### WebSocket connection failed
- Ensure the bridge service is running on port 8002
- Check firewall settings
- Verify no other service is using port 8002

### Controls not working
- Verify the bridge is connected to ESP32 (check bridge logs)
- Ensure WebSocket connection is established (green indicator)
- Check browser console for errors

## 🔐 Security Notes

- The current implementation is for development/testing
- For production:
  - Add authentication to WebSocket
  - Implement TLS/SSL
  - Add command validation and rate limiting
  - Consider using Web Bluetooth API if available

## 📝 Technical Details

### ESP32 Firmware
- Uses `BluetoothSerial` for Bluetooth Classic communication
- Sends JSON telemetry every second
- Accepts newline-terminated command strings
- Compatible with Dabble app for mobile control

### Python Bridge
- Built with FastAPI and pybluez
- Async WebSocket support
- Auto-reconnection logic
- Broadcasts telemetry to all connected clients

### Frontend Service
- TypeScript WebSocket client
- Auto-reconnect with exponential backoff
- Event-based architecture with callbacks
- Real-time telemetry updates

## 🚀 Running Everything Together

Quick start script:

```bash
# Terminal 1 - Start Bluetooth Bridge
cd evbharat-frontend/evbharat-frontend/backend
./start_bluetooth_bridge.sh

# Terminal 2 - Start Frontend
cd evbharat-frontend/evbharat-frontend
npm run dev

# Terminal 3 - Optional: Monitor bridge logs
curl http://localhost:8002/status
```

Navigate to `http://localhost:5173/dashboard` and start controlling your vehicle!

## 🎯 Next Steps

Consider adding:
- [ ] Camera feed integration
- [ ] GPS tracking
- [ ] Obstacle detection sensors
- [ ] Speed control with PWM adjustment
- [ ] Battery voltage monitoring (real ADC readings)
- [ ] Mission/waypoint planning
- [ ] Record and replay routes
- [ ] Multi-vehicle fleet management
