#!/bin/bash

echo "🚗 EVBharat - Starting Full Stack Application with Bluetooth"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "evbharat-frontend/evbharat-frontend/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

cd evbharat-frontend/evbharat-frontend

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check and install frontend dependencies
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo -e "${BLUE}🔍 Checking backend services...${NC}"

# Check if RAG backend is needed
if [ -d "backend/EVBharat Bot" ]; then
    echo "Found RAG backend"
    if ! check_port 8001; then
        echo -e "${YELLOW}⚠️  RAG backend not running. Start it with:${NC}"
        echo "    cd backend/EVBharat Bot && ./start_rag_backend.sh"
    else
        echo "✅ RAG backend running on port 8001"
    fi
fi

# Check if Bluetooth bridge is needed
if [ -f "backend/bluetooth_bridge.py" ]; then
    echo ""
    echo -e "${BLUE}🔵 Bluetooth Bridge Setup${NC}"
    if ! check_port 8002; then
        echo -e "${YELLOW}Starting Bluetooth bridge on port 8002...${NC}"
        cd backend
        
        # Check Python dependencies
        if ! python3 -c "import bluetooth" 2>/dev/null; then
            echo "Installing Bluetooth dependencies..."
            pip install -r requirements_bluetooth.txt 2>/dev/null || true
        fi
        
        # Start in background
        chmod +x start_bluetooth_bridge.sh 2>/dev/null || true
        nohup python3 bluetooth_bridge.py > bluetooth_bridge.log 2>&1 &
        BT_PID=$!
        echo "✅ Bluetooth bridge started (PID: $BT_PID)"
        echo "   Logs: backend/bluetooth_bridge.log"
        cd ..
    else
        echo "✅ Bluetooth bridge already running on port 8002"
    fi
fi

echo ""
echo -e "${GREEN}🌐 Starting Frontend Development Server...${NC}"
echo ""
echo "Available features:"
echo "  • Dashboard with vehicle control panel"
echo "  • Battery analytics and prediction"
echo "  • RAG chatbot for EV queries"
echo "  • ESP32 Bluetooth vehicle control"
echo "  • Maps with charging stations"
echo ""
echo "📱 Once started, navigate to:"
echo "   http://localhost:5173/dashboard"
echo ""
echo "🎮 Vehicle Control:"
echo "   Use the control panel in the dashboard or keyboard (WASD/Arrows)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start frontend dev server
npm run dev

# Cleanup on exit
trap "echo 'Stopping services...'; kill $BT_PID 2>/dev/null; exit" SIGINT SIGTERM
