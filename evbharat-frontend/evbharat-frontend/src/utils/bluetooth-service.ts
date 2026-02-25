/**
 * Bluetooth Service for ESP32 V2E Car
 * Connects to the Bluetooth Bridge WebSocket API
 */

export interface VehicleTelemetry {
    battery: number;
    temperature: number;
    direction: string;
    moving: boolean;
    timestamp: number;
}

export interface BluetoothStatus {
    connected: boolean;
    device: string | null;
    telemetry: VehicleTelemetry | null;
}

type TelemetryCallback = (telemetry: VehicleTelemetry) => void;
type StatusCallback = (status: BluetoothStatus) => void;

class BluetoothService {
    private ws: WebSocket | null = null;
    private reconnectInterval: number | null = null;
    private telemetryCallbacks: Set<TelemetryCallback> = new Set();
    private statusCallbacks: Set<StatusCallback> = new Set();
    private currentStatus: BluetoothStatus = {
        connected: false,
        device: null,
        telemetry: null
    };

    // Try multiple connection methods
    private wsUrls = [
        'ws://localhost:8002/ws',           // Local serial bridge
        'ws://127.0.0.1:8002/ws',           // Alternative local
        // Add your Windows IP here if using dev container, e.g.:
        // 'ws://192.168.1.100:8002/ws',
    ];
    private currentUrlIndex = 0;
    private readonly RECONNECT_DELAY = 3000;

    constructor() {
        this.connect();
    }

    /**
     * Set custom WebSocket URLs (for dev container setup)
     */
    public setCustomUrls(urls: string[]) {
        this.wsUrls = urls;
        this.currentUrlIndex = 0;
        this.disconnect();
        setTimeout(() => this.connect(), 100);
    }

    /**
     * Connect to Bluetooth Bridge WebSocket
     */
    private connect() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        const url = this.wsUrls[this.currentUrlIndex];

        try {
            console.log(`🔵 Attempting connection to: ${url}`);
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log(`🔵 Connected to Serial Bridge at ${url}`);
                this.stopReconnectTimer();
                this.currentUrlIndex = 0; // Reset to first URL on success
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error(`WebSocket error on ${url}:`, error);
            };

            this.ws.onclose = () => {
                console.log(`🔴 Disconnected from ${url}`);
                this.currentStatus.connected = false;
                this.notifyStatusChange();
                
                // Try next URL
                this.currentUrlIndex = (this.currentUrlIndex + 1) % this.wsUrls.length;
                this.scheduleReconnect();
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.currentUrlIndex = (this.currentUrlIndex + 1) % this.wsUrls.length;
            this.scheduleReconnect();
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(message: any) {
        switch (message.type) {
            case 'status':
                this.currentStatus = {
                    connected: message.connected || false,
                    device: message.port || message.device || 'ESP32',
                    telemetry: message.telemetry || null
                };
                this.notifyStatusChange();
                if (message.telemetry) {
                    this.notifyTelemetry(message.telemetry);
                }
                break;

            case 'telemetry':
                this.currentStatus.telemetry = message.data;
                this.currentStatus.connected = true; // Receiving data means connected
                this.notifyTelemetry(message.data);
                break;

            case 'command_response':
                console.log(`Command ${message.command}: ${message.success ? 'Success' : 'Failed'}`);
                break;

            case 'connection_response':
                this.currentStatus.connected = message.connected;
                this.notifyStatusChange();
                break;
        }
    }

    /**
     * Schedule reconnection attempt
     */
    private scheduleReconnect() {
        this.stopReconnectTimer();
        this.reconnectInterval = window.setInterval(() => {
            console.log('🔄 Attempting to reconnect to Bluetooth Bridge...');
            this.connect();
        }, this.RECONNECT_DELAY);
    }

    /**
     * Stop reconnection timer
     */
    private stopReconnectTimer() {
        if (this.reconnectInterval !== null) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }

    /**
     * Send command to ESP32
     */
    public sendCommand(command: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP' | 'STATUS') {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected - command not sent:', command);
            return false;
        }

        try {
            this.ws.send(JSON.stringify({ command }));
            return true;
        } catch (error) {
            console.error('Failed to send command:', error);
            return false;
        }
    }

    /**
     * Request connection to ESP32
     */
    public connectToESP32() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket not connected to bridge - trying to reconnect...');
            this.connect();
            return false;
        }

        try {
            this.ws.send(JSON.stringify({ command: 'CONNECT' }));
            return true;
        } catch (error) {
            console.error('Failed to send connect command:', error);
            return false;
        }
    }

    /**
     * Subscribe to telemetry updates
     */
    public onTelemetry(callback: TelemetryCallback): () => void {
        this.telemetryCallbacks.add(callback);
        
        // Send current telemetry if available
        if (this.currentStatus.telemetry) {
            callback(this.currentStatus.telemetry);
        }

        // Return unsubscribe function
        return () => {
            this.telemetryCallbacks.delete(callback);
        };
    }

    /**
     * Subscribe to status updates
     */
    public onStatusChange(callback: StatusCallback): () => void {
        this.statusCallbacks.add(callback);
        
        // Send current status immediately
        callback(this.currentStatus);

        // Return unsubscribe function
        return () => {
            this.statusCallbacks.delete(callback);
        };
    }

    /**
     * Get current status
     */
    public getStatus(): BluetoothStatus {
        return { ...this.currentStatus };
    }

    /**
     * Notify all telemetry subscribers
     */
    private notifyTelemetry(telemetry: VehicleTelemetry) {
        this.telemetryCallbacks.forEach(callback => {
            try {
                callback(telemetry);
            } catch (error) {
                console.error('Error in telemetry callback:', error);
            }
        });
    }

    /**
     * Notify all status subscribers
     */
    private notifyStatusChange() {
        this.statusCallbacks.forEach(callback => {
            try {
                callback(this.currentStatus);
            } catch (error) {
                console.error('Error in status callback:', error);
            }
        });
    }

    /**
     * Disconnect from bridge
     */
    public disconnect() {
        this.stopReconnectTimer();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Export singleton instance
export const bluetoothService = new BluetoothService();
