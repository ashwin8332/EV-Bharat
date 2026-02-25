#!/usr/bin/env python3
"""
Serial Bridge for ESP32 V2E Car
Reads telemetry from ESP32 via USB Serial and exposes WebSocket API for web frontend
This works when ESP32 is connected via USB cable (simpler than Bluetooth)
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Set
import serial
import serial.tools.list_ports
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="ESP32 Serial Bridge", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
class SerialManager:
    def __init__(self):
        self.serial_port: Optional[serial.Serial] = None
        self.port_name: Optional[str] = None
        self.connected: bool = False
        self.websocket_clients: Set[WebSocket] = set()
        self.last_telemetry: Dict = {}
        
    def find_esp32_port(self) -> Optional[str]:
        """Auto-detect ESP32 COM port"""
        logger.info("Scanning for ESP32 serial ports...")
        ports = serial.tools.list_ports.comports()
        
        for port in ports:
            # Look for common ESP32 identifiers
            if any(keyword in port.description.lower() for keyword in ['ch340', 'cp210', 'esp32', 'usb serial', 'uart']):
                logger.info(f"Found potential ESP32 at {port.device}: {port.description}")
                return port.device
            # Also check by manufacturer
            if port.manufacturer and 'silicon labs' in port.manufacturer.lower():
                logger.info(f"Found Silicon Labs device at {port.device}")
                return port.device
        
        # If no specific match, list all ports
        if ports:
            logger.info("Available serial ports:")
            for port in ports:
                logger.info(f"  {port.device}: {port.description}")
            return ports[0].device  # Return first available port
        
        logger.warning("No serial ports found")
        return None
    
    def connect_to_serial(self, port: Optional[str] = None, baudrate: int = 115200) -> bool:
        """Connect to ESP32 via Serial"""
        if self.connected:
            logger.info("Already connected to serial port")
            return True
        
        try:
            if not port:
                port = self.find_esp32_port()
                if not port:
                    logger.error("No serial port found")
                    return False
            
            logger.info(f"Connecting to {port} at {baudrate} baud...")
            self.serial_port = serial.Serial(port, baudrate, timeout=1)
            self.port_name = port
            self.connected = True
            logger.info(f"Successfully connected to {port}")
            
            # Start listening for telemetry
            asyncio.create_task(self.listen_serial())
            
            return True
        except serial.SerialException as e:
            logger.error(f"Failed to connect to serial port: {e}")
            self.connected = False
            return False
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            self.connected = False
            return False
    
    def disconnect(self):
        """Disconnect from serial port"""
        if self.serial_port and self.serial_port.is_open:
            try:
                self.serial_port.close()
            except:
                pass
        self.connected = False
        self.serial_port = None
        logger.info("Disconnected from serial port")
    
    def send_command(self, command: str) -> bool:
        """Send command to ESP32"""
        if not self.connected or not self.serial_port:
            logger.warning("Not connected to serial port")
            return False
        
        try:
            message = f"{command}\n"
            self.serial_port.write(message.encode())
            logger.info(f"Sent command: {command}")
            return True
        except Exception as e:
            logger.error(f"Error sending command: {e}")
            self.connected = False
            return False
    
    async def listen_serial(self):
        """Listen for telemetry data from ESP32"""
        logger.info("Started serial listener")
        
        while self.connected and self.serial_port and self.serial_port.is_open:
            try:
                if self.serial_port.in_waiting > 0:
                    line = self.serial_port.readline().decode('utf-8', errors='ignore').strip()
                    
                    if line:
                        # Try to parse as JSON telemetry
                        if line.startswith('{') and line.endswith('}'):
                            try:
                                telemetry = json.loads(line)
                                if 'battery' in telemetry or 'temperature' in telemetry:
                                    self.last_telemetry = telemetry
                                    await self.broadcast_telemetry(telemetry)
                            except json.JSONDecodeError:
                                logger.debug(f"Non-JSON line: {line}")
                        else:
                            logger.debug(f"Serial: {line}")
                
                await asyncio.sleep(0.01)  # Small delay to prevent CPU overload
                
            except Exception as e:
                logger.error(f"Error in serial listener: {e}")
                break
        
        logger.info("Serial listener stopped")
        self.connected = False
    
    async def broadcast_telemetry(self, telemetry: Dict):
        """Broadcast telemetry to all connected WebSocket clients"""
        if not self.websocket_clients:
            return
        
        message = json.dumps({
            "type": "telemetry",
            "data": telemetry,
            "timestamp": datetime.now().isoformat()
        })
        
        # Remove disconnected clients
        disconnected = set()
        for client in self.websocket_clients:
            try:
                await client.send_text(message)
            except:
                disconnected.add(client)
        
        self.websocket_clients -= disconnected

# Global manager instance
serial_manager = SerialManager()

@app.on_event("startup")
async def startup_event():
    logger.info("Serial Bridge starting up...")
    # Auto-connect to ESP32 on startup
    serial_manager.connect_to_serial()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Serial Bridge shutting down...")
    serial_manager.disconnect()

@app.get("/")
async def root():
    return {
        "service": "ESP32 Serial Bridge",
        "version": "1.0.0",
        "connected": serial_manager.connected,
        "port": serial_manager.port_name
    }

@app.get("/status")
async def get_status():
    return {
        "connected": serial_manager.connected,
        "port": serial_manager.port_name,
        "active_clients": len(serial_manager.websocket_clients),
        "last_telemetry": serial_manager.last_telemetry
    }

@app.get("/ports")
async def list_ports():
    """List all available serial ports"""
    ports = serial.tools.list_ports.comports()
    return {
        "ports": [
            {
                "device": port.device,
                "description": port.description,
                "manufacturer": port.manufacturer
            }
            for port in ports
        ]
    }

@app.post("/connect")
async def connect(port: Optional[str] = None):
    """Manually trigger connection to serial port"""
    success = serial_manager.connect_to_serial(port)
    return {
        "success": success,
        "connected": serial_manager.connected,
        "port": serial_manager.port_name
    }

@app.post("/disconnect")
async def disconnect():
    """Disconnect from serial port"""
    serial_manager.disconnect()
    return {"success": True, "connected": False}

@app.post("/command/{command}")
async def send_command(command: str):
    """Send command to ESP32: FORWARD, BACKWARD, LEFT, RIGHT, STOP, STATUS"""
    success = serial_manager.send_command(command.upper())
    return {
        "success": success,
        "command": command.upper(),
        "connected": serial_manager.connected
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    serial_manager.websocket_clients.add(websocket)
    logger.info(f"WebSocket client connected. Total clients: {len(serial_manager.websocket_clients)}")
    
    # Send current status
    await websocket.send_text(json.dumps({
        "type": "status",
        "connected": serial_manager.connected,
        "port": serial_manager.port_name,
        "telemetry": serial_manager.last_telemetry
    }))
    
    try:
        while True:
            # Receive commands from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                command = message.get("command", "").upper()
                
                if command in ["FORWARD", "BACKWARD", "LEFT", "RIGHT", "STOP", "STATUS"]:
                    success = serial_manager.send_command(command)
                    await websocket.send_text(json.dumps({
                        "type": "command_response",
                        "command": command,
                        "success": success
                    }))
                elif command == "CONNECT":
                    port = message.get("port")
                    success = serial_manager.connect_to_serial(port)
                    await websocket.send_text(json.dumps({
                        "type": "connection_response",
                        "success": success,
                        "connected": serial_manager.connected
                    }))
                    
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from WebSocket: {data}")
                
    except WebSocketDisconnect:
        serial_manager.websocket_clients.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(serial_manager.websocket_clients)}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("ESP32 Serial Bridge - USB Connection")
    print("="*60)
    print("\n📋 Instructions:")
    print("1. Connect ESP32 to computer via USB cable")
    print("2. Make sure ESP32 is NOT open in Arduino IDE Serial Monitor")
    print("3. This service will auto-detect the ESP32 port")
    print("4. Dashboard will connect via WebSocket on port 8002")
    print("\n" + "="*60 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        log_level="info"
    )
