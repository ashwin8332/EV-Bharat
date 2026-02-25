@echo off
REM Start Serial Bridge Service for Windows

echo ========================================
echo ESP32 Serial Bridge - Windows
echo ========================================
echo.
echo WARNING: Close Arduino IDE Serial Monitor first!
echo.
echo Press any key to continue...
pause > nul

echo.
echo Installing dependencies...
pip install -r requirements_serial.txt

echo.
echo Starting Serial Bridge on port 8002...
python serial_bridge.py

pause
