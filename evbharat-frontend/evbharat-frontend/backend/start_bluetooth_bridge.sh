#!/bin/bash
# Start Bluetooth Bridge Service

echo "🔵 Starting ESP32 Bluetooth Bridge..."
echo "📡 This service connects to ESP32_V2E_CAR via Bluetooth"
echo "🌐 WebSocket API will be available on port 8002"
echo ""

# Install dependencies if needed
if ! python3 -c "import bluetooth" 2>/dev/null; then
    echo "📦 Installing Bluetooth dependencies..."
    pip install -r requirements_bluetooth.txt
fi

# Run the bridge service
python3 bluetooth_bridge.py
