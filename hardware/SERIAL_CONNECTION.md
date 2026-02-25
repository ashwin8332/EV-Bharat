# Connecting ESP32 to Dashboard via USB Serial

Your ESP32 is sending telemetry! Now let's connect it to the web dashboard.

## 🔌 Connection Methods

Since you're seeing data in Arduino IDE, we'll use **USB Serial** (simpler than Bluetooth):

### Method 1: USB Serial Bridge ⭐ RECOMMENDED

This reads data directly from the USB cable.

#### Steps:

1. **Close Arduino IDE Serial Monitor** ⚠️
   - The COM port can only be used by one program at a time
   - Close the Serial Monitor window in Arduino IDE

2. **Install Python dependencies:**
   ```bash
   cd evbharat-frontend/evbharat-frontend/backend
   pip install -r requirements_serial.txt
   ```

3. **Start the Serial Bridge:**
   
   **On Windows:**
   ```bash
   start_serial_bridge.bat
   ```
   
   **On Linux/Mac:**
   ```bash
   chmod +x start_serial_bridge.sh
   ./start_serial_bridge.sh
   ```
   
   Or directly:
   ```bash
   python serial_bridge.py
   ```

4. **Open the Dashboard:**
   - Make sure frontend is running: http://localhost:5173
   - Go to Dashboard page
   - Vehicle Control panel should auto-connect
   - You'll see live telemetry updating!

## 🎮 How It Works

```
ESP32 (USB Cable) → Serial Bridge (Python) → WebSocket → Web Dashboard
```

1. ESP32 sends JSON telemetry via USB Serial (115200 baud)
2. Python bridge reads the serial data
3. WebSocket broadcasts to web dashboard
4. Dashboard displays real-time data and allows control

## 📊 What You'll See

In the dashboard's Vehicle Control panel:
- **Battery**: 87% (from your ESP32)
- **Temperature**: 24.1°C - 27.8°C (fluctuating)
- **Direction**: STOP (current state)
- **Status**: Green indicator when connected

## 🎯 Sending Commands

Once connected, you can control the vehicle:

**From Dashboard:**
- Click D-pad buttons
- Or use keyboard: W/A/S/D or Arrow keys

**Commands sent to ESP32:**
- FORWARD
- BACKWARD  
- LEFT
- RIGHT
- STOP

## 🐛 Troubleshooting

### "Port already in use"
❌ **Problem**: Arduino IDE Serial Monitor is still open
✅ **Solution**: Close Serial Monitor window

### "No serial port found"
❌ **Problem**: ESP32 not detected
✅ **Solution**: 
- Check USB cable is connected
- Install CH340/CP210x drivers if needed
- Check Device Manager (Windows) for COM port

### "Permission denied" (Linux)
❌ **Problem**: No permission to access serial port
✅ **Solution**:
```bash
sudo usermod -a -G dialout $USER
# Then logout and login again
```

### Dashboard shows "Disconnected"
❌ **Problem**: Serial bridge not running
✅ **Solution**: 
1. Start the serial bridge first
2. Then refresh dashboard

### Wrong COM port selected
❌ **Problem**: Multiple serial devices
✅ **Solution**: 
- Check which COM port in Arduino IDE (Tools → Port)
- List available ports: `python -c "import serial.tools.list_ports; print([p.device for p in serial.tools.list_ports.comports()])"`
- Manually specify port: Edit serial_bridge.py, line 89

## 🔍 Checking Status

While the bridge is running:

**Check connection:**
```bash
curl http://localhost:8002/status
```

**List available ports:**
```bash
curl http://localhost:8002/ports
```

**Test command:**
```bash
curl -X POST http://localhost:8002/command/FORWARD
```

## 📝 Quick Start Summary

```bash
# 1. Close Arduino Serial Monitor
# 2. Start the backend
cd evbharat-frontend/evbharat-frontend/backend
python serial_bridge.py

# 3. In another terminal, start the frontend (if not running)
cd evbharat-frontend/evbharat-frontend
npm run dev

# 4. Open browser
# http://localhost:5173/dashboard
```

## 🎉 You're Connected!

You should now see:
- ✅ Green "Connected" indicator
- ✅ Live battery and temperature updates  
- ✅ Direction showing STOP
- ✅ Working control buttons

Try clicking the **FORWARD** button and watch the Serial Bridge logs - you'll see the command being sent to your ESP32!

## 🚀 Next Steps

- Test all movement directions
- Add sensors (ultrasonic, GPS)
- Implement real battery voltage reading
- Add camera feed
- Create autonomous navigation

Happy driving! 🚗💨
