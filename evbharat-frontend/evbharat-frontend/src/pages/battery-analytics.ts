import { authService } from '../utils/auth';
import { FormValidator } from '../utils/form-validator';

interface BatteryPrediction {
    SOC: number;
    SOH: number;
    RUL: number;
    confidence: number;
}

interface BatteryAnalysis {
    status: 'success' | 'error';
    predictions?: BatteryPrediction;
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

interface RealTimeData {
    timestamp: string;
    voltage: number;
    current: number;
    temperature: number;
    soc: number;
    soh: number;
    rul: number;
}

export async function renderBatteryAnalyticsPage() {
    if (!authService.isAuthenticated()) {
        window.location.href = '/auth';
        return;
    }

    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-brain text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">AI Battery Analytics</h1>
                        </div>
                        <p class="text-gray-400">Machine Learning Powered Battery Intelligence System</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-green-400 font-orbitron">ML MODEL ACTIVE</span>
                        </div>
                        <button id="refresh-ml-btn" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Real-time Input Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Manual Input Panel -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-sliders text-pagani-gold"></i>
                            Manual Testing Input
                        </h3>
                        <form id="battery-input-form" class="space-y-4">
                            <!-- Voltage Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Battery Voltage (V)</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="voltage-input" 
                                        name="voltage"
                                        step="0.1" 
                                        min="2.5" 
                                        max="4.2" 
                                        value="3.7"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="3.7"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">V</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Typical range: 2.5V - 4.2V per cell</p>
                            </div>

                            <!-- Current Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Current (A)</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="current-input" 
                                        name="current"
                                        step="0.1" 
                                        min="-100" 
                                        max="100" 
                                        value="-5"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="-5.0"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">A</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Negative = Discharge, Positive = Charge</p>
                            </div>

                            <!-- Temperature Input -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Temperature (°C)</label>
                                <div class="relative">
                                    <input 
                                        type="number" 
                                        id="temperature-input" 
                                        name="temperature"
                                        step="1" 
                                        min="-20" 
                                        max="60" 
                                        value="25"
                                        class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold focus:bg-gray-800"
                                        placeholder="25"
                                    >
                                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">°C</span>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">Optimal: 15°C - 35°C</p>
                            </div>

                            <!-- Cell Age Selection -->
                            <div>
                                <label class="block text-sm font-orbitron text-gray-300 mb-2">Battery Age</label>
                                <select 
                                    id="cell-age-input" 
                                    name="cell_age"
                                    class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron focus:outline-none focus:border-pagani-gold"
                                >
                                    <option value="fresh">Fresh Battery (0-6 months)</option>
                                    <option value="aged">Aged Battery (6+ months)</option>
                                </select>
                            </div>

                            <!-- Quick Scenario Buttons -->
                            <div class="grid grid-cols-2 gap-3 mt-6">
                                <button type="button" id="scenario-normal" class="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 hover:bg-green-500/30 transition-all text-sm font-orbitron">
                                    Normal Drive
                                </button>
                                <button type="button" id="scenario-charging" class="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all text-sm font-orbitron">
                                    Fast Charging
                                </button>
                                <button type="button" id="scenario-cold" class="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm font-orbitron">
                                    Cold Weather
                                </button>
                                <button type="button" id="scenario-critical" class="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-all text-sm font-orbitron">
                                    Low Battery
                                </button>
                            </div>

                            <!-- Predict Button -->
                            <button 
                                type="submit" 
                                id="predict-btn"
                                class="w-full px-6 py-4 bg-gradient-to-r from-pagani-gold to-yellow-500 text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/20 transition-all mt-6"
                            >
                                <i class="fa-solid fa-brain mr-2"></i>
                                PREDICT WITH AI
                            </button>
                        </form>
                    </div>

                    <!-- Real-time Results Panel -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-chart-line text-pagani-gold"></i>
                            AI Predictions & Analysis
                        </h3>

                        <!-- Loading State -->
                        <div id="prediction-loading" class="hidden text-center py-8">
                            <div class="animate-spin w-8 h-8 border-2 border-pagani-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p class="text-gray-400">AI Model Processing...</p>
                        </div>

                        <!-- Prediction Results -->
                        <div id="prediction-results" class="space-y-4">
                            <div class="text-center py-8 text-gray-500">
                                <i class="fa-solid fa-robot text-4xl mb-4"></i>
                                <p>Enter battery parameters and click "PREDICT WITH AI" to see intelligent analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Historical Predictions Chart -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                    <h3 class="text-xl font-orbitron font-bold mb-6 flex items-center gap-3">
                        <i class="fa-solid fa-chart-area text-pagani-gold"></i>
                        Real-time Prediction Timeline
                    </h3>
                    <div id="prediction-chart" class="h-64 flex items-center justify-center text-gray-500">
                        <p>Prediction history will appear here after running AI analysis</p>
                    </div>
                </div>
            </div>

            <!-- ML Model Information -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Model Performance -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-trophy text-pagani-gold"></i>
                            Model Performance
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400">SOC Accuracy</span>
                                <span class="text-green-400 font-orbitron">94.2%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400">SOH Accuracy</span>
                                <span class="text-green-400 font-orbitron">91.8%</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-400">RUL Accuracy</span>
                                <span class="text-green-400 font-orbitron">89.5%</span>
                            </div>
                            <div class="flex justify-between items-center border-t border-gray-700 pt-3">
                                <span class="text-sm text-gray-400">Model Version</span>
                                <span class="text-pagani-gold font-orbitron">v2.1.0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Feature Importance -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-bullseye text-pagani-gold"></i>
                            Key Factors
                        </h4>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm text-gray-400">Temperature</span>
                                    <span class="text-red-400 text-sm">High</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-red-500 h-2 rounded-full" style="width: 78%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm text-gray-400">Voltage Level</span>
                                    <span class="text-yellow-400 text-sm">Medium</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 65%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm text-gray-400">Current Rate</span>
                                    <span class="text-green-400 text-sm">Medium</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: 52%"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Status -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-server text-pagani-gold"></i>
                            System Status
                        </h4>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-400">ML Backend</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-green-400 text-sm font-orbitron">ONLINE</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-400">Data Pipeline</span>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-green-400 text-sm font-orbitron">ACTIVE</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-400">Last Update</span>
                                <span class="text-gray-400 text-sm font-orbitron" id="last-update">Just now</span>
                            </div>
                            <button class="w-full px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all text-sm font-orbitron">
                                <i class="fa-solid fa-download mr-2"></i>
                                EXPORT REPORT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initializeBatteryAnalyticsPage();
}

function initializeBatteryAnalyticsPage() {
    const form = document.getElementById('battery-input-form') as HTMLFormElement;
    const validator = new FormValidator();
    
    // Setup form validation
    validator.addRule('voltage', { required: true, custom: (value) => parseFloat(value) >= 2.5 && parseFloat(value) <= 4.2 });
    validator.addRule('current', { required: true, custom: (value) => parseFloat(value) >= -100 && parseFloat(value) <= 100 });
    validator.addRule('temperature', { required: true, custom: (value) => parseFloat(value) >= -20 && parseFloat(value) <= 60 });

    // Historical prediction data
    const predictionHistory: RealTimeData[] = [];

    // Scenario buttons
    setupScenarioButtons();

    // Form submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const validation = validator.validate(formData);
        
        if (!validation.isValid) {
            showNotification(validation.errors[0], 'error');
            return;
        }

        await performPrediction(formData);
    });

    function setupScenarioButtons() {
        const scenarios = {
            'scenario-normal': { voltage: 3.7, current: -5, temperature: 25, cell_age: 'fresh' },
            'scenario-charging': { voltage: 4.0, current: 15, temperature: 35, cell_age: 'fresh' },
            'scenario-cold': { voltage: 3.5, current: -3, temperature: -5, cell_age: 'fresh' },
            'scenario-critical': { voltage: 3.1, current: -1, temperature: 20, cell_age: 'aged' }
        };

        Object.entries(scenarios).forEach(([id, scenario]) => {
            const btn = document.getElementById(id);
            btn?.addEventListener('click', () => {
                (document.getElementById('voltage-input') as HTMLInputElement).value = scenario.voltage.toString();
                (document.getElementById('current-input') as HTMLInputElement).value = scenario.current.toString();
                (document.getElementById('temperature-input') as HTMLInputElement).value = scenario.temperature.toString();
                (document.getElementById('cell-age-input') as HTMLSelectElement).value = scenario.cell_age;
                
                showNotification(`Applied ${id.split('-')[1]} scenario`, 'success');
            });
        });
    }

    async function performPrediction(formData: FormData) {
        const loadingEl = document.getElementById('prediction-loading');
        const resultsEl = document.getElementById('prediction-results');
        
        if (!loadingEl || !resultsEl) return;

        // Show loading state
        loadingEl.classList.remove('hidden');
        resultsEl.innerHTML = '';

        try {
            // Simulate API call to ML backend
            // In production, this would call your FastAPI endpoint
            const prediction = await simulateMLPrediction({
                voltage: parseFloat(formData.get('voltage') as string),
                current: parseFloat(formData.get('current') as string),
                temperature: parseFloat(formData.get('temperature') as string),
                cell_age: formData.get('cell_age') as string
            });

            // Hide loading
            loadingEl.classList.add('hidden');

            if (prediction.status === 'success') {
                displayPredictionResults(prediction, resultsEl);
                addToPredictionHistory(prediction);
                updatePredictionChart();
            } else {
                showNotification(prediction.error || 'Prediction failed', 'error');
            }
        } catch (error) {
            loadingEl.classList.add('hidden');
            showNotification('ML model communication error', 'error');
        }
    }

    function displayPredictionResults(prediction: BatteryAnalysis, container: HTMLElement) {
        if (!prediction.predictions || !prediction.analysis) return;

        const { predictions, analysis } = prediction;
        const riskColors = {
            LOW: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
            MEDIUM: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
            CRITICAL: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' }
        };

        const colors = riskColors[analysis.risk_level];

        container.innerHTML = `
            <!-- Main Predictions -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 ${colors.bg} ${colors.border} border rounded-lg">
                    <p class="text-2xl font-orbitron font-bold ${colors.text}">${predictions.SOC.toFixed(1)}%</p>
                    <p class="text-xs text-gray-400 mt-1">STATE OF CHARGE</p>
                </div>
                <div class="text-center p-4 ${colors.bg} ${colors.border} border rounded-lg">
                    <p class="text-2xl font-orbitron font-bold ${colors.text}">${predictions.SOH.toFixed(1)}%</p>
                    <p class="text-xs text-gray-400 mt-1">STATE OF HEALTH</p>
                </div>
                <div class="text-center p-4 ${colors.bg} ${colors.border} border rounded-lg">
                    <p class="text-2xl font-orbitron font-bold ${colors.text}">${Math.round(predictions.RUL)}</p>
                    <p class="text-xs text-gray-400 mt-1">REMAINING CYCLES</p>
                </div>
            </div>

            <!-- Overall Health Score -->
            <div class="mb-6 p-4 ${colors.bg} ${colors.border} border rounded-lg">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-orbitron text-gray-300">Overall Health Score</span>
                    <span class="text-lg font-bold ${colors.text}">${analysis.overall_health.toFixed(1)}/100</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3">
                    <div class="${analysis.risk_level === 'LOW' ? 'bg-green-500' : analysis.risk_level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'} h-3 rounded-full transition-all duration-1000" style="width: ${analysis.overall_health}%"></div>
                </div>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-gray-400">Risk Level</span>
                    <span class="text-sm font-orbitron ${colors.text}">${analysis.risk_level}</span>
                </div>
            </div>

            <!-- AI Alerts & Recommendations -->
            <div class="space-y-3">
                <h4 class="text-sm font-orbitron font-bold text-pagani-gold mb-3">
                    <i class="fa-solid fa-lightbulb mr-2"></i>AI Insights & Recommendations
                </h4>
                ${analysis.alerts.map(alert => {
                    const alertColors = {
                        INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'fa-info-circle' },
                        WARNING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'fa-exclamation-triangle' },
                        CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'fa-exclamation-circle' }
                    };
                    const ac = alertColors[alert.level];
                    return `
                        <div class="p-3 ${ac.bg} ${ac.border} border rounded-lg">
                            <div class="flex items-start gap-3">
                                <i class="fa-solid ${ac.icon} ${ac.text} mt-1"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-semibold ${ac.text}">${alert.type}</p>
                                    <p class="text-xs text-gray-400 mt-1">${alert.message}</p>
                                    <p class="text-xs text-gray-300 mt-2 font-semibold">💡 ${alert.recommendation}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Confidence Score -->
            <div class="mt-6 p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/20">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">Prediction Confidence</span>
                    <span class="text-pagani-gold font-orbitron">${(predictions.confidence * 100).toFixed(1)}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div class="bg-pagani-gold h-2 rounded-full" style="width: ${predictions.confidence * 100}%"></div>
                </div>
            </div>
        `;
    }

    function addToPredictionHistory(prediction: BatteryAnalysis) {
        if (!prediction.predictions) return;
        
        const newData: RealTimeData = {
            timestamp: new Date().toISOString(),
            voltage: parseFloat((document.getElementById('voltage-input') as HTMLInputElement).value),
            current: parseFloat((document.getElementById('current-input') as HTMLInputElement).value),
            temperature: parseFloat((document.getElementById('temperature-input') as HTMLInputElement).value),
            soc: prediction.predictions.SOC,
            soh: prediction.predictions.SOH,
            rul: prediction.predictions.RUL
        };

        predictionHistory.push(newData);
        if (predictionHistory.length > 20) {
            predictionHistory.shift(); // Keep only last 20 predictions
        }
    }

    function updatePredictionChart() {
        const chartContainer = document.getElementById('prediction-chart');
        if (!chartContainer || predictionHistory.length === 0) return;

        // Simple ASCII-style chart for demonstration
        // In production, use Chart.js or similar
        const latest = predictionHistory.slice(-5);
        chartContainer.innerHTML = `
            <div class="w-full">
                <div class="flex justify-between items-end h-40 border-l border-b border-gray-600 pl-4 pb-4">
                    ${latest.map((data, i) => `
                        <div class="flex-1 flex flex-col items-center gap-2">
                            <div class="flex flex-col gap-1">
                                <div class="w-8 bg-green-500 rounded-t" style="height: ${data.soc}px" title="SOC: ${data.soc.toFixed(1)}%"></div>
                                <div class="w-8 bg-yellow-500 rounded-t" style="height: ${data.soh}px" title="SOH: ${data.soh.toFixed(1)}%"></div>
                            </div>
                            <p class="text-xs text-gray-400 transform rotate-45 origin-center">${new Date(data.timestamp).toLocaleTimeString().slice(0,5)}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="flex items-center gap-4 mt-4 text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-green-500 rounded"></div>
                        <span class="text-gray-400">SOC %</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span class="text-gray-400">SOH %</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Auto-update timestamp
    setInterval(() => {
        const lastUpdateEl = document.getElementById('last-update');
        if (lastUpdateEl) {
            lastUpdateEl.textContent = new Date().toLocaleTimeString();
        }
    }, 30000);
}

async function simulateMLPrediction(input: any): Promise<BatteryAnalysis> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock ML model logic based on input parameters
    const { voltage, current, temperature, cell_age } = input;
    
    // Calculate SOC based on voltage (simplified OCV curve)
    let soc = Math.max(0, Math.min(100, (voltage - 2.5) / (4.2 - 2.5) * 100));
    
    // Calculate SOH based on age and temperature stress
    let soh = cell_age === 'fresh' ? 95 - Math.abs(temperature - 25) * 0.5 : 85 - Math.abs(temperature - 25) * 0.8;
    soh = Math.max(50, Math.min(100, soh));
    
    // Calculate RUL based on SOH and current usage
    let rul = (soh - 70) * 40; // Simplified cycle life estimation
    rul = Math.max(0, Math.min(2000, rul));
    
    // Determine risk level and generate alerts
    const overallHealth = (soc + soh) / 2;
    let riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
    const alerts: any[] = [];
    
    if (overallHealth >= 80) {
        riskLevel = 'LOW';
        alerts.push({
            type: 'Battery Health Excellent',
            message: 'Your battery is operating within optimal parameters.',
            level: 'INFO',
            recommendation: 'Continue current charging habits for maximum lifespan.'
        });
    } else if (overallHealth >= 65) {
        riskLevel = 'MEDIUM';
        alerts.push({
            type: 'Moderate Degradation Detected',
            message: 'Battery showing signs of aging but still functional.',
            level: 'WARNING',
            recommendation: 'Avoid extreme temperatures and deep discharge cycles.'
        });
    } else {
        riskLevel = 'CRITICAL';
        alerts.push({
            type: 'Battery Health Critical',
            message: 'Significant degradation detected. Consider replacement.',
            level: 'CRITICAL',
            recommendation: 'Schedule immediate battery inspection and replacement planning.'
        });
    }

    // Temperature-based alerts
    if (temperature > 40) {
        alerts.push({
            type: 'High Temperature Warning',
            message: 'Battery temperature exceeds safe operating range.',
            level: 'WARNING',
            recommendation: 'Allow battery to cool before charging or heavy usage.'
        });
    } else if (temperature < 0) {
        alerts.push({
            type: 'Cold Temperature Alert',
            message: 'Low temperature may reduce battery performance.',
            level: 'INFO',
            recommendation: 'Pre-condition battery before use in cold weather.'
        });
    }

    // Current-based alerts
    if (Math.abs(current) > 50) {
        alerts.push({
            type: 'High Current Draw',
            message: 'Excessive current may accelerate battery degradation.',
            level: 'WARNING',    
            recommendation: 'Reduce power demand or use more conservative driving mode.'
        });
    }

    return {
        status: 'success',
        predictions: {
            SOC: soc,
            SOH: soh,
            RUL: rul,
            confidence: 0.85 + Math.random() * 0.1
        },
        analysis: {
            overall_health: overallHealth,
            risk_level: riskLevel,
            alerts
        }
    };
}

function showNotification(message: string, type: 'success' | 'error') {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-8 px-6 py-4 rounded-lg backdrop-blur-sm z-50 font-orbitron text-sm fade-in-section ${
        type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
            : 'bg-red-500/20 border border-red-500/50 text-red-400'
    }`;
    notification.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}