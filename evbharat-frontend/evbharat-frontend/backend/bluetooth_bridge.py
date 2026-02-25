#!/usr/bin/env python3
"""
Bluetooth Bridge Service for ESP32 V2E Car
Connects to ESP32 via Bluetooth Classic and exposes WebSocket API for web frontend
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Set
import bluetooth  # pybluez
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="ESP32 Bluetooth Bridge", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
class BluetoothManager:
    def __init__(self):
        self.esp32_socket: Optional[bluetooth.BluetoothSocket] = None
        self.esp32_address: Optional[str] = None
        self.connected: bool = False
        self.websocket_clients: Set[WebSocket] = set()
        self.last_telemetry: Dict = {}
        
    async def discover_esp32(self, device_name: str = "ESP32_V2E_CAR") -> Optional[str]:
        """Discover ESP32 device by name"""
        logger.info(f"Scanning for {device_name}...")
        try:
            nearby_devices = bluetooth.discover_devices(duration=8, lookup_names=True)
            for addr, name in nearby_devices:
                if name == device_name:
                    logger.info(f"Found {device_name} at {addr}")
                    return addr
            logger.warning(f"Device {device_name} not found")
            return None
        except Exception as e:
            logger.error(f"Error discovering devices: {e}")
            return None
    
    async def connect_to_esp32(self, address: Optional[str] = None) -> bool:
        """Connect to ESP32 via Bluetooth"""
        if self.connected:
            logger.info("Already connected to ESP32")
            return True
        
        try:
            if not address:
                address = await self.discover_esp32()
                if not address:
                    return False
            
            self.esp32_address = address
            self.esp32_socket = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
            
            logger.info(f"Connecting to ESP32 at {address}...")
            self.esp32_socket.connect((address, 1))  # RFCOMM channel 1
            self.connected = True
            logger.info("Successfully connected to ESP32")
            
            # Start listening for telemetry
            asyncio.create_task(self.listen_telemetry())
            
            return True
        except Exception as e:
            logger.error(f"Failed to connect to ESP32: {e}")
            self.connected = False
            return False
    
    async def disconnect(self):
        """Disconnect from ESP32"""
        if self.esp32_socket:
            try:
                self.esp32_socket.close()
            except:
                pass
        self.connected = False
        self.esp32_socket = None
        logger.info("Disconnected from ESP32")
    
    async def send_command(self, command: str) -> bool:
        """Send command to ESP32"""
        if not self.connected or not self.esp32_socket:
            logger.warning("Not connected to ESP32")
            return False
        
        try:
            message = f"{command}\n"
            self.esp32_socket.send(message.encode())
            logger.info(f"Sent command: {command}")
            return True
        except Exception as e:
            logger.error(f"Error sending command: {e}")
            self.connected = False
            return False
    
    async def listen_telemetry(self):
        """Listen for telemetry data from ESP32"""
        logger.info("Started telemetry listener")
        buffer = ""
        
        while self.connected and self.esp32_socket:
            try:
                data = self.esp32_socket.recv(1024)
                if not data:
                    logger.warning("No data received, connection may be lost")
                    break
                
                buffer += data.decode('utf-8', errors='ignore')
                
                # Process complete JSON messages
                while '\n' in buffer:
                    line, buffer = buffer.split('\n', 1)
                    line = line.strip()
                    
                    if line:
                        try:
                            telemetry = json.loads(line)
                            self.last_telemetry = telemetry
                            # Broadcast to all connected websocket clients
                            await self.broadcast_telemetry(telemetry)
                        except json.JSONDecodeError:
                            logger.debug(f"Invalid JSON: {line}")
                
            except Exception as e:
                logger.error(f"Error in telemetry listener: {e}")
                break
        
        logger.info("Telemetry listener stopped")
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
bt_manager = BluetoothManager()

@app.on_event("startup")
async def startup_event():
    logger.info("Bluetooth Bridge starting up...")
    # Auto-connect to ESP32 on startup
    asyncio.create_task(bt_manager.connect_to_esp32())

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Bluetooth Bridge shutting down...")
    await bt_manager.disconnect()

@app.get("/")
async def root():
    return {
        "service": "ESP32 Bluetooth Bridge",
        "version": "1.0.0",
        "connected": bt_manager.connected,
        "device": bt_manager.esp32_address
    }

@app.get("/status")
async def get_status():
    return {
        "connected": bt_manager.connected,
        "device_address": bt_manager.esp32_address,
        "active_clients": len(bt_manager.websocket_clients),
        "last_telemetry": bt_manager.last_telemetry
    }

@app.post("/connect")
async def connect(device_address: Optional[str] = None):
    """Manually trigger connection to ESP32"""
    success = await bt_manager.connect_to_esp32(device_address)
    return {
        "success": success,
        "connected": bt_manager.connected,
        "device": bt_manager.esp32_address
    }

@app.post("/disconnect")
async def disconnect():
    """Disconnect from ESP32"""
    await bt_manager.disconnect()
    return {"success": True, "connected": False}

@app.post("/command/{command}")
async def send_command(command: str):
    """Send command to ESP32: FORWARD, BACKWARD, LEFT, RIGHT, STOP, STATUS"""
    success = await bt_manager.send_command(command.upper())
    return {
        "success": success,
        "command": command.upper(),
        "connected": bt_manager.connected
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    bt_manager.websocket_clients.add(websocket)
    logger.info(f"WebSocket client connected. Total clients: {len(bt_manager.websocket_clients)}")
    
    # Send current status
    await websocket.send_text(json.dumps({
        "type": "status",
        "connected": bt_manager.connected,
        "device": bt_manager.esp32_address,
        "telemetry": bt_manager.last_telemetry
    }))
    
    try:
        while True:
            # Receive commands from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                command = message.get("command", "").upper()
                
                if command in ["FORWARD", "BACKWARD", "LEFT", "RIGHT", "STOP", "STATUS"]:
                    success = await bt_manager.send_command(command)
                    await websocket.send_text(json.dumps({
                        "type": "command_response",
                        "command": command,
                        "success": success
                    }))
                elif command == "CONNECT":
                    success = await bt_manager.connect_to_esp32()
                    await websocket.send_text(json.dumps({
                        "type": "connection_response",
                        "success": success,
                        "connected": bt_manager.connected
                    }))
                    
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON from WebSocket: {data}")
                
    except WebSocketDisconnect:
        bt_manager.websocket_clients.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(bt_manager.websocket_clients)}")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        log_level="info"
    )
