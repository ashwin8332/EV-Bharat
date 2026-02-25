@echo off
REM ESP32 Serial Bridge for Windows
REM Run this on your Windows PC where ESP32 is connected

echo ========================================
echo ESP32 Serial Bridge - Windows
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed!
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Installing dependencies...
python -m pip install --quiet pyserial fastapi uvicorn[standard] websockets

echo.
echo ========================================
echo IMPORTANT INSTRUCTIONS:
echo ========================================
echo 1. CLOSE Arduino IDE Serial Monitor!
echo 2. Keep ESP32 connected via USB
echo 3. This will start server on port 8002
echo.
echo To access from dev container:
echo - Note the IP address shown below
echo - Update dashboard to use: ws://YOUR_WINDOWS_IP:8002/ws
echo.

REM Get Windows IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
)
echo Your Windows IP: %IP%
echo.

echo Starting Serial Bridge...
echo Press Ctrl+C to stop
echo.

python serial_bridge.py

pause
