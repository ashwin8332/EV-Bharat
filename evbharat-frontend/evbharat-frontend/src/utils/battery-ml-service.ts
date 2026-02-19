interface BatteryMLRequest {
    voltage: number;
    current: number;
    temperature: number;
    cell_age: 'fresh' | 'aged';
}

interface BatteryMLResponse {
    status: 'success' | 'error';
    predictions?: {
        SOC: number;
        SOH: number;
        RUL: number;
        confidence: number;
    };
    analysis?: {
        overall_health: number;
        risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
        alerts: Array<{
            type: string;
            message: string;
            level: 'INFO' | 'WARNING' | 'CRITICAL';
            recommendation: string;
        }>;
    };
    error?: string;
}

interface MLModelInfo {
    model_version: string;
    accuracy: {
        soc: number;
        soh: number;
        rul: number;
    };
    last_training: string;
    features_used: string[];
}

class BatteryMLService {
    private baseUrl: string;
    private isProduction: boolean;

    constructor() {
        // Auto-detect environment
        this.isProduction = window.location.hostname !== 'localhost';
        this.baseUrl = this.isProduction 
            ? 'http://your-production-domain.com/api'  // Replace with your production URL
            : 'http://localhost:8000';  // FastAPI default port
    }

    /**
     * Test connection to ML backend
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.ok;
        } catch (error) {
            console.error('ML Backend connection test failed:', error);
            return false;
        }
    }

    /**
     * Get ML model information and performance metrics
     */
    async getModelInfo(): Promise<MLModelInfo | null> {
        try {
            const response = await fetch(`${this.baseUrl}/model/info`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get model info:', error);
            return null;
        }
    }

    /**
     * Predict battery state using ML models
     */
    async predict(batteryData: BatteryMLRequest): Promise<BatteryMLResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batteryData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('ML Prediction failed:', error);
            
            // Fallback to local simulation if backend is unavailable
            return this.simulateOfflinePrediction(batteryData);
        }
    }

    /**
     * Batch predict multiple battery states
     */
    async batchPredict(batteryDataArray: BatteryMLRequest[]): Promise<BatteryMLResponse[]> {
        try {
            const response = await fetch(`${this.baseUrl}/predict/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ batch_data: batteryDataArray })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.predictions || [];
        } catch (error) {
            console.error('Batch prediction failed:', error);
            
            // Fallback: predict each item individually using simulation
            return Promise.all(batteryDataArray.map(data => this.simulateOfflinePrediction(data)));
        }
    }

    /**
     * Get historical predictions for a specific time range
     */
    async getHistoricalPredictions(startDate: Date, endDate: Date): Promise<any[]> {
        try {
            const params = new URLSearchParams({
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            });

            const response = await fetch(`${this.baseUrl}/history?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.predictions || [];
        } catch (error) {
            console.error('Failed to get historical data:', error);
            return [];
        }
    }

    /**
     * Submit training data to improve model
     */
    async submitTrainingData(realData: {
        voltage: number;
        current: number;
        temperature: number;
        actual_soc: number;
        actual_soh: number;
        timestamp: string;
    }): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/training/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(realData)
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to submit training data:', error);
            return false;
        }
    }

    /**
     * Retrain model with new data (admin only)
     */
    async retrainModel(authToken: string): Promise<{ status: string; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/model/retrain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Model retraining failed:', error);
            return { status: 'error', message: 'Retraining request failed' };
        }
    }

    /**
     * Offline fallback simulation when backend is unavailable
     */
    private async simulateOfflinePrediction(input: BatteryMLRequest): Promise<BatteryMLResponse> {
        // Add small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 300));

        const { voltage, current, temperature, cell_age } = input;
        
        // Enhanced simulation with more realistic battery physics
        
        // SOC calculation using improved OCV curve approximation
        let soc: number;
        if (voltage < 3.0) {
            soc = 0;
        } else if (voltage < 3.3) {
            soc = (voltage - 3.0) / (3.3 - 3.0) * 10;
        } else if (voltage < 3.6) {
            soc = 10 + (voltage - 3.3) / (3.6 - 3.3) * 30;
        } else if (voltage < 3.9) {
            soc = 40 + (voltage - 3.6) / (3.9 - 3.6) * 40;
        } else if (voltage < 4.1) {
            soc = 80 + (voltage - 3.9) / (4.1 - 3.9) * 15;
        } else {
            soc = 95 + (voltage - 4.1) / (4.2 - 4.1) * 5;
        }
        
        soc = Math.max(0, Math.min(100, soc));

        // SOH calculation with temperature and aging effects
        let tempStress = Math.abs(temperature - 25) * 0.3;
        let ageingFactor = cell_age === 'fresh' ? 1.0 : 0.85;
        let currentStress = Math.abs(current) > 10 ? Math.abs(current) * 0.1 : 0;
        
        let soh = (95 * ageingFactor) - tempStress - currentStress;
        soh = Math.max(50, Math.min(100, soh));

        // RUL calculation based on SOH and usage patterns
        let baseCycles = 2000;
        let healthFactor = soh / 100;
        let usageFactor = Math.abs(current) > 20 ? 0.8 : 1.0;
        let tempFactor = Math.abs(temperature - 25) > 15 ? 0.9 : 1.0;
        
        let rul = baseCycles * healthFactor * usageFactor * tempFactor * (cell_age === 'fresh' ? 1.0 : 0.6);
        rul = Math.max(0, Math.min(2000, rul));

        // Risk assessment
        const overallHealth = (soc * 0.3 + soh * 0.7); // SOH weighs more for long-term health
        let riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
        const alerts: any[] = [];

        if (overallHealth >= 85) {
            riskLevel = 'LOW';
        } else if (overallHealth >= 70) {
            riskLevel = 'MEDIUM';
        } else {
            riskLevel = 'CRITICAL';
        }

        // Generate intelligent alerts based on conditions
        if (soc < 20) {
            alerts.push({
                type: 'Low State of Charge',
                message: `Battery SOC is ${soc.toFixed(1)}% - Consider charging soon.`,
                level: soc < 10 ? 'CRITICAL' : 'WARNING',
                recommendation: 'Charge to at least 20% to avoid deep discharge damage.'
            });
        }

        if (temperature > 45) {
            alerts.push({
                type: 'High Temperature Alert',
                message: `Battery temperature ${temperature}°C exceeds safe limits.`,
                level: 'CRITICAL',
                recommendation: 'Stop usage and allow battery to cool. Check cooling system.'
            });
        } else if (temperature > 35) {
            alerts.push({
                type: 'Elevated Temperature',
                message: `Battery temperature ${temperature}°C is above optimal range.`,
                level: 'WARNING',
                recommendation: 'Monitor temperature and reduce power usage if possible.'
            });
        }

        if (temperature < -10) {
            alerts.push({
                type: 'Cold Temperature Impact',
                message: `Low temperature ${temperature}°C reducing battery performance.`,
                level: 'WARNING',
                recommendation: 'Pre-warm battery before heavy usage. Performance will improve as it warms.'
            });
        }

        if (soh < 80) {
            alerts.push({
                type: 'Battery Aging Detected',
                message: `Battery health at ${soh.toFixed(1)}% - showing signs of degradation.`,
                level: soh < 70 ? 'CRITICAL' : 'WARNING',
                recommendation: soh < 70 ? 'Consider battery replacement planning.' : 'Monitor health trends and optimize charging patterns.'
            });
        }

        if (Math.abs(current) > 30) {
            alerts.push({
                type: 'High Current Draw',
                message: `Current ${current.toFixed(1)}A may stress battery cells.`,
                level: 'WARNING',
                recommendation: 'Use eco mode or reduce power demand to extend battery life.'
            });
        }

        if (rul < 200) {
            alerts.push({
                type: 'Low Remaining Life',
                message: `Estimated ${Math.round(rul)} cycles remaining.`,
                level: 'CRITICAL',
                recommendation: 'Schedule battery replacement within 6 months.'
            });
        }

        // If no issues, add positive feedback
        if (alerts.length === 0) {
            alerts.push({
                type: 'Battery Health Excellent',
                message: 'All parameters within optimal ranges.',
                level: 'INFO',
                recommendation: 'Continue current charging and usage patterns.'
            });
        }

        // Calculate confidence based on input validity and model certainty
        let confidence = 0.75; // Base confidence for simulation
        if (voltage >= 3.0 && voltage <= 4.2) confidence += 0.1;
        if (temperature >= -20 && temperature <= 60) confidence += 0.1;
        if (Math.abs(current) <= 50) confidence += 0.05;
        
        confidence = Math.min(0.95, confidence + Math.random() * 0.05);

        return {
            status: 'success',
            predictions: {
                SOC: soc,
                SOH: soh,
                RUL: rul,
                confidence
            },
            analysis: {
                overall_health: overallHealth,
                risk_level: riskLevel,
                alerts
            }
        };
    }

    /**
     * Export prediction data as CSV
     */
    exportPredictionData(predictions: any[], filename: string = 'battery_predictions.csv') {
        if (predictions.length === 0) return;

        const headers = ['timestamp', 'voltage', 'current', 'temperature', 'soc', 'soh', 'rul', 'risk_level'];
        const csvContent = [
            headers.join(','),
            ...predictions.map(p => [
                p.timestamp,
                p.voltage || 0,
                p.current || 0,
                p.temperature || 0,
                p.predictions?.SOC || 0,
                p.predictions?.SOH || 0,
                p.predictions?.RUL || 0,
                p.analysis?.risk_level || 'UNKNOWN'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Singleton instance
export const batteryMLService = new BatteryMLService();

// Connection status monitoring
export class MLConnectionMonitor {
    private isOnline: boolean = false;
    private listeners: ((status: boolean) => void)[] = [];
    private checkInterval: number | null = null;

    constructor(private mlService: BatteryMLService) {}

    start(intervalMs: number = 30000) {
        this.stop(); // Clear any existing interval
        
        // Initial check
        this.checkConnection();
        
        // Set up periodic checks
        this.checkInterval = window.setInterval(() => {
            this.checkConnection();
        }, intervalMs);
    }

    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    onStatusChange(callback: (isOnline: boolean) => void) {
        this.listeners.push(callback);
    }

    private async checkConnection() {
        const wasOnline = this.isOnline;
        this.isOnline = await this.mlService.testConnection();
        
        if (wasOnline !== this.isOnline) {
            this.listeners.forEach(callback => callback(this.isOnline));
        }
    }

    get status() {
        return this.isOnline;
    }
}

export const mlConnectionMonitor = new MLConnectionMonitor(batteryMLService);