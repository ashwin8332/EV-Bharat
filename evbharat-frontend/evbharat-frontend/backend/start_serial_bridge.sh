#!/bin/bash
# Start Serial Bridge Service

echo "🔌 Starting ESP32 Serial Bridge..."
echo "📡 This service connects to ESP32 via USB Serial"
echo "🌐 WebSocket API will be available on port 8002"
echo ""
echo "⚠️  IMPORTANT: Close Arduino IDE Serial Monitor before starting!"
echo ""

# Install dependencies if needed
if ! python3 -c "import serial" 2>/dev/null; then
    echo "📦 Installing Serial dependencies..."
    pip3 install -r requirements_serial.txt
fi

# Run the bridge service
python3 serial_bridge.py
