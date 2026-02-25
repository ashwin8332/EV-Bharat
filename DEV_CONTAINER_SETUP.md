# 🔧 Connecting ESP32 to Dashboard (Dev Container Setup)

## Problem

You're seeing "Disconnected" because:
- Your **ESP32** is connected to your **Windows PC**
- Your **dashboard** is running in a **dev container/codespace** (Linux)
- The serial bridge needs to run on Windows where the ESP32 is connected

## ✅ Solution: Run Serial Bridge on Windows

### Step 1: Copy Files to Windows

Copy these files to your Windows PC:
- `evbharat-frontend/evbharat-frontend/backend/serial_bridge.py`
- `evbharat-frontend/evbharat-frontend/backend/requirements_serial.txt`
- `START_ON_WINDOWS.bat` (in project root)

### Step 2: Close Arduino Serial Monitor ⚠️

- **Important**: Close the Serial Monitor in Arduino IDE
- The COM port can only be used by one program at a time

### Step 3: Run the Serial Bridge on Windows

**Option A: Double-click the batch file**
```
START_ON_WINDOWS.bat
```

**Option B: Manual start**
```cmd
cd path\to\backend\folder
python -m pip install -r requirements_serial.txt
python serial_bridge.py
```

You should see:
```
========================================
ESP32 Serial Bridge - USB Connection
========================================

Your Windows IP: 192.168.x.x  ← COPY THIS IP!

INFO: Started serial listener
INFO: Successfully connected to COM3
{"battery":87,"temperature":24.1,...}
```

### Step 4: Update Dashboard WebSocket URL

Copy your Windows IP address from the Serial Bridge console, then:

**Open Browser Console** (F12) on the dashboard page and run:

```javascript
// Replace with YOUR Windows IP
bluetoothService.setCustomUrls(['ws://192.168.1.100:8002/ws']);
```

Replace `192.168.1.100` with the IP shown in your Serial Bridge console.

### Step 5: Refresh Dashboard

Refresh the page and the dashboard should now connect!

## 🔥 Quick Test

Check if bridge is accessible from dev container:

```bash
# From dev container terminal
curl http://YOUR_WINDOWS_IP:8002/status
```

If you get a response with JSON, it's working!

## 🚧 Firewall Setup

If still not connecting, allow port 8002 in Windows Firewall:

1. Windows Security → Firewall & network protection
2. Advanced settings → Inbound Rules
3. New Rule → Port → TCP → 8002 → Allow
4. Name it "ESP32 Serial Bridge"

## 🎯 Alternative: Port Forwarding

If using VS Code dev containers, add to `.devcontainer/devcontainer.json`:

```json
{
  "forwardPorts": [8002],
  "portsAttributes": {
    "8002": {
      "label": "ESP32 Serial Bridge",
      "onAutoForward": "notify"
    }
  }
}
```

Then run serial bridge in the dev container terminal (but ESP32 must support network serial).

## 📱 Simplest Option: Use Dabble App

If the above is too complex, just use the **Dabble mobile app**:

1. Download Dabble from Play Store/App Store
2. Open app → Gamepad mode
3. Connect to "ESP32_V2E_CAR"
4. Use gamepad to control vehicle

The ESP32 code already supports both!

## ✅ What Should Work

Once connected:

**Dashboard Shows:**
- ✅ Green "Connected" indicator
- ✅ Device: COM3 (or your port)
- ✅ Battery: 87%
- ✅ Temperature: updating every second
- ✅ Direction: STOP
- ✅ Control buttons enabled

**Commands Work:**
- Click FORWARD → Motors spin forward
- Keyboard W/A/S/D → Controls work
- Serial Bridge console shows: "Sent command: FORWARD"

## 📊 Architecture

```
┌─────────────────┐         ┌──────────────────┐          ┌─────────────────┐
│   ESP32         │  USB    │  Windows PC      │  Network │ Dev Container   │
│   (Hardware)    │────────▶│  Serial Bridge   │◀─────────│  Dashboard      │
│                 │         │  (Port 8002)     │          │  (Browser)      │
└─────────────────┘         └──────────────────┘          └─────────────────┘
```

## 🆘 Still Not Working?

Check browser console (F12) for errors:
```
🔵 Attempting connection to: ws://192.168.1.100:8002/ws
🔴 WebSocket error: Failed to connect
```

If you see this, check:
1. Serial bridge is running on Windows
2. Windows IP is correct
3. Port 8002 is not blocked by firewall
4. Both machines are on same network

Need help? Share the error message from browser console!
