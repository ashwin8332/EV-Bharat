import { authService } from '../utils/auth';
import { bluetoothService } from '../utils/bluetooth-service';

const DEFAULT_ESP32_CAM_URL = 'http://192.168.1.11/cam-hi.jpg';
const CAMERA_URL_STORAGE_KEY = 'evbharat_esp32_cam_url';
let camViewInterval: ReturnType<typeof setInterval> | null = null;

interface CameraDetectionPrediction {
    bbox: [number, number, number, number];
    class: string;
    score: number;
}

interface CocoSsdModel {
    detect: (img: HTMLImageElement) => Promise<CameraDetectionPrediction[]>;
}

interface CocoSsdGlobal {
    load: (config?: { base?: string }) => Promise<CocoSsdModel>;
}

export async function renderDashboardPage() {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = '/auth';
        return;
    }

    const app = document.getElementById('app');
    if (!app) return;

    const user = authService.getCurrentUser();
    const portalMode = localStorage.getItem('evbharat_portal_mode') || 'ev';
    const isFactoryPortal = portalMode === 'factory';

    // Load Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    app.innerHTML = `
        <!-- Dashboard Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <p class="text-pagani-gold text-sm uppercase tracking-wider mb-1">Welcome back</p>
                        <h1 class="text-3xl md:text-4xl font-orbitron font-bold">${user?.name || 'User'}</h1>
                        <p class="text-gray-400 mt-1">Your AI-Powered EV Intelligence Hub</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-green-400 font-orbitron">VEHICLE ONLINE</span>
                        </div>
                        <button id="refresh-dashboard" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <!-- Battery Status -->
                    <a href="/battery" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section hover:border-pagani-gold/50 transition-all group cursor-pointer">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-car-battery text-2xl text-green-400 group-hover:scale-110 transition-transform"></i>
                            <span class="text-xs text-gray-400 uppercase">Battery</span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold text-green-400">87%</p>
                        <p class="text-xs text-gray-400 mt-1">State of Charge</p>
                        <div class="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style="width: 87%"></div>
                        </div>
                    </a>

                    <!-- Range -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 50ms">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-road text-2xl text-blue-400"></i>
                            <span class="text-xs text-gray-400 uppercase">Range</span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold">285 <span class="text-lg">km</span></p>
                        <p class="text-xs text-gray-400 mt-1">Estimated Distance</p>
                        <p class="text-xs text-green-400 mt-3"><i class="fa-solid fa-arrow-up mr-1"></i>+12km from yesterday</p>
                    </div>

                    <!-- Active Alerts -->
                    <a href="/alerts" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section hover:border-pagani-gold/50 transition-all group cursor-pointer" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-bell text-2xl text-yellow-400 group-hover:scale-110 transition-transform"></i>
                            <span class="relative">
                                <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">3</span>
                                <span class="text-xs text-gray-400 uppercase">Alerts</span>
                            </span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold text-yellow-400">3</p>
                        <p class="text-xs text-gray-400 mt-1">Active Alerts</p>
                        <p class="text-xs text-red-400 mt-3"><i class="fa-solid fa-circle-exclamation mr-1"></i>1 Critical</p>
                    </a>

                    <!-- V2E Status -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 150ms">
                        <div class="flex items-center justify-between mb-3">
                            <i class="fa-solid fa-tower-broadcast text-2xl text-purple-400 animate-pulse"></i>
                            <span class="text-xs text-gray-400 uppercase">V2E</span>
                        </div>
                        <p class="text-3xl font-orbitron font-bold text-green-400">Active</p>
                        <p class="text-xs text-gray-400 mt-1">VLC Communication</p>
                        <p class="text-xs text-purple-400 mt-3"><i class="fa-solid fa-signal mr-1"></i>3 vehicles nearby</p>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <!-- Left Column - Battery & Health -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Battery Health Card -->
                        <div id="quick-route-planner-card" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-heart-pulse text-red-400"></i>
                                    Battery Health Prediction
                                </h3>
                                <a href="/battery" class="text-sm text-pagani-gold hover:underline">View Details <i class="fa-solid fa-arrow-right ml-1"></i></a>
                            </div>
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold text-green-400">94%</p>
                                    <p class="text-xs text-gray-400 mt-1">State of Health</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold">32°C</p>
                                    <p class="text-xs text-gray-400 mt-1">Temperature</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold">396V</p>
                                    <p class="text-xs text-gray-400 mt-1">Voltage</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <p class="text-2xl font-orbitron font-bold text-green-400">+32A</p>
                                    <p class="text-xs text-gray-400 mt-1">Current</p>
                                </div>
                            </div>
                            
                            <!-- AI Prediction -->
                            <div class="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                                <div class="flex items-start gap-3">
                                    <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <i class="fa-solid fa-robot text-blue-400"></i>
                                    </div>
                                    <div>
                                        <p class="text-sm font-orbitron text-blue-400 mb-1">AI Battery Prediction</p>
                                        <p class="text-sm text-gray-300">Based on current usage patterns, your battery SoH is expected to remain above 90% for the next <strong class="text-pagani-gold">18 months</strong>. Recommended charging threshold: 80%.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ESP32-CAM View -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-4 gap-3">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-camera text-cyan-400"></i>
                                    Live Cam View
                                </h3>
                                <div class="flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10">
                                    <span id="cam-status-dot" class="w-2 h-2 rounded-full bg-red-500"></span>
                                    <span id="cam-status-text" class="text-xs text-cyan-300">Offline</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 mb-4">
                                <input
                                    id="cam-url-input"
                                    type="text"
                                    class="w-full px-3 py-2 bg-gray-800/60 border border-cyan-500/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all"
                                    placeholder="ESP32-CAM URL (e.g. http://192.168.1.11/cam-hi.jpg)"
                                />
                                <button id="cam-save-url" class="px-3 py-2 bg-cyan-500/15 border border-cyan-500/40 rounded-lg text-cyan-300 text-sm hover:bg-cyan-500/25 transition-all">
                                    Save
                                </button>
                                <button id="cam-toggle-btn" class="px-3 py-2 bg-cyan-500 text-black font-semibold rounded-lg text-sm hover:bg-cyan-400 transition-all">
                                    Start
                                </button>
                            </div>

                            <div class="flex flex-wrap items-center gap-2 mb-4">
                                <span class="text-[11px] uppercase tracking-wider text-gray-500">Resolution:</span>
                                <button data-cam-path="/cam-lo.jpg" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">Low (320x240)</button>
                                <button data-cam-path="/cam-mid.jpg" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">Mid (640x480)</button>
                                <button data-cam-path="/cam-hi.jpg" class="px-2 py-1 border border-cyan-500/40 rounded text-xs text-cyan-300 hover:bg-cyan-500/15 transition-all">High (800x600)</button>
                            </div>

                            <div class="flex items-center justify-between mb-4 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 gap-3">
                                <div>
                                    <p class="text-xs text-emerald-300 font-orbitron uppercase tracking-wide">Object Detection</p>
                                    <p id="cam-detection-status" class="text-[11px] text-gray-400 mt-1">Off</p>
                                </div>
                                <button id="cam-detection-btn" class="px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm hover:bg-emerald-500/30 transition-all">
                                    Enable Detection
                                </button>
                            </div>

                            <div class="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-black/60 aspect-video">
                                <img
                                    id="cam-feed"
                                    alt="ESP32-CAM feed"
                                    class="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <canvas
                                    id="cam-overlay"
                                    class="absolute inset-0 w-full h-full pointer-events-none"
                                ></canvas>
                                <div class="absolute inset-0 pointer-events-none border border-cyan-300/20 rounded-xl"></div>
                                <div class="absolute top-3 left-3 px-2 py-1 bg-black/70 border border-cyan-500/50 rounded text-[11px] font-orbitron text-cyan-300 uppercase tracking-wider">
                                    ESP32-CAM
                                </div>
                            </div>

                            <p class="text-xs text-gray-500 mt-3">
                                Supports ESP32 endpoints: /cam-lo.jpg, /cam-mid.jpg, /cam-hi.jpg. This view auto-refreshes frames similar to the Python ESP32 fetch loop.
                            </p>
                        </div>

                        ${!isFactoryPortal ? `
                        <!-- Quick Route Planner -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-route text-pagani-gold"></i>
                                    Smart Route Planner
                                </h3>
                                <a href="/map" class="text-sm text-pagani-gold hover:underline">Open Map <i class="fa-solid fa-arrow-right ml-1"></i></a>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Current Location"
                                        value="New Delhi"
                                        readonly
                                    />
                                </div>
                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="quick-destination"
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Enter destination..."
                                    />
                                </div>
                            </div>

                            <!-- Recent Destinations -->
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="text-xs text-gray-400">Recent:</span>
                                <button class="px-3 py-1 bg-pagani-gold/10 border border-pagani-gold/20 rounded-full text-xs text-pagani-gold hover:bg-pagani-gold/20 transition-all">
                                    Mumbai <i class="fa-solid fa-clock ml-1"></i>
                                </button>
                                <button class="px-3 py-1 bg-pagani-gold/10 border border-pagani-gold/20 rounded-full text-xs text-pagani-gold hover:bg-pagani-gold/20 transition-all">
                                    Jaipur <i class="fa-solid fa-clock ml-1"></i>
                                </button>
                                <button class="px-3 py-1 bg-pagani-gold/10 border border-pagani-gold/20 rounded-full text-xs text-pagani-gold hover:bg-pagani-gold/20 transition-all">
                                    Agra <i class="fa-solid fa-clock ml-1"></i>
                                </button>
                            </div>

                            <a href="/map" class="w-full py-3 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                <i class="fa-solid fa-map-location-dot"></i> Plan Route
                            </a>
                        </div>
                        ` : ''}

                        <!-- V2E Communication Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-tower-broadcast text-purple-400"></i>
                                    V2E Communication
                                </h3>
                                <div class="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span class="text-xs text-green-400">Active</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div class="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <i class="fa-solid fa-lightbulb text-2xl text-purple-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">VLC</p>
                                    <p class="text-xs text-green-400">Connected</p>
                                </div>
                                <div class="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <i class="fa-solid fa-car text-2xl text-blue-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">V2V</p>
                                    <p class="text-xs text-gray-400">3 Nearby</p>
                                </div>
                                <div class="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <i class="fa-solid fa-traffic-light text-2xl text-green-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">V2I</p>
                                    <p class="text-xs text-green-400">Active</p>
                                </div>
                                <div class="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <i class="fa-solid fa-person-walking text-2xl text-orange-400 mb-2"></i>
                                    <p class="text-sm font-orbitron">V2P</p>
                                    <p class="text-xs text-green-400">Scanning</p>
                                </div>
                            </div>

                            <div class="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <i class="fa-solid fa-shield-halved text-2xl text-purple-400"></i>
                                    <div>
                                        <p class="text-sm font-orbitron text-purple-400">Secure VLC Data Exchange</p>
                                        <p class="text-xs text-gray-400">Light-based communication prevents RF interference and enhances security</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Alerts & Emergency -->
                    <div class="space-y-6">
                        <!-- Emergency SOS -->
                        <div class="bg-gradient-to-br from-red-900/30 to-pagani-black border border-red-500/30 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2 text-red-400">
                                <i class="fa-solid fa-truck-medical"></i>
                                Emergency SOS
                            </h3>
                            <p class="text-sm text-gray-400 mb-4">
                                Automatic crash detection with accelerometer sensors. Manual trigger for immediate assistance.
                            </p>
                            <button id="sos-btn" class="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg transition-all uppercase tracking-wider">
                                <i class="fa-solid fa-circle-exclamation mr-2 animate-pulse"></i> EMERGENCY SOS
                            </button>
                            <p class="text-xs text-gray-500 text-center mt-3">
                                <i class="fa-solid fa-info-circle mr-1"></i> Hold for 3 seconds to activate
                            </p>
                        </div>

                        <!-- Vehicle Control -->
                        <div class="bg-gradient-to-br from-blue-900/30 to-pagani-black border border-blue-500/30 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2 text-blue-400">
                                <i class="fa-solid fa-gamepad"></i>
                                Vehicle Control
                            </h3>
                            
                            <!-- Connection Status -->
                            <div id="bt-status" class="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div id="bt-indicator" class="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span id="bt-status-text" class="text-xs text-gray-400">Disconnected</span>
                                    </div>
                                    <button id="bt-connect-btn" class="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-md text-xs text-blue-400 hover:bg-blue-500/30 transition-all">
                                        Connect
                                    </button>
                                </div>
                            </div>

                            <!-- Telemetry Data -->
                            <div id="vehicle-telemetry" class="mb-4 grid grid-cols-2 gap-2 opacity-50">
                                <div class="p-2 bg-gray-800/50 rounded text-center">
                                    <p id="telemetry-battery" class="text-lg font-orbitron font-bold text-green-400">--</p>
                                    <p class="text-xs text-gray-500">Battery</p>
                                </div>
                                <div class="p-2 bg-gray-800/50 rounded text-center">
                                    <p id="telemetry-temp" class="text-lg font-orbitron font-bold">--</p>
                                    <p class="text-xs text-gray-500">Temp °C</p>
                                </div>
                                <div class="col-span-2 p-2 bg-gray-800/50 rounded text-center">
                                    <p id="telemetry-direction" class="text-sm font-orbitron font-bold text-gray-400">STOP</p>
                                    <p class="text-xs text-gray-500">Direction</p>
                                </div>
                            </div>

                            <!-- D-Pad Controls -->
                            <div class="relative w-full aspect-square max-w-[200px] mx-auto mb-4">
                                <!-- Center -->
                                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 rounded-full border-2 border-gray-700 flex items-center justify-center">
                                    <i class="fa-solid fa-car text-2xl text-gray-600"></i>
                                </div>
                                
                                <!-- Up (Forward) -->
                                <button id="ctrl-forward" class="absolute left-1/2 -translate-x-1/2 top-0 w-16 h-20 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-t-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-up text-xl"></i>
                                </button>
                                
                                <!-- Down (Backward) -->
                                <button id="ctrl-backward" class="absolute left-1/2 -translate-x-1/2 bottom-0 w-16 h-20 bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 rounded-b-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-down text-xl"></i>
                                </button>
                                
                                <!-- Left -->
                                <button id="ctrl-left" class="absolute top-1/2 -translate-y-1/2 left-0 w-20 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-l-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-left text-xl"></i>
                                </button>
                                
                                <!-- Right -->
                                <button id="ctrl-right" class="absolute top-1/2 -translate-y-1/2 right-0 w-20 h-16 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 rounded-r-xl border border-blue-400/50 flex items-center justify-center text-white shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-chevron-right text-xl"></i>
                                </button>
                            </div>

                            <!-- Stop Button -->
                            <button id="ctrl-stop" class="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg transition-all uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed">
                                <i class="fa-solid fa-hand mr-2"></i> STOP
                            </button>

                            <p class="text-xs text-gray-500 text-center mt-3">
                                <i class="fa-solid fa-bluetooth mr-1"></i> Requires Bluetooth bridge running
                            </p>
                        </div>

                        <!-- Recent Alerts -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-bell text-yellow-400"></i>
                                    Recent Alerts
                                </h3>
                                <a href="/alerts" class="text-sm text-pagani-gold hover:underline">View All</a>
                            </div>

                            <div class="space-y-3">
                                <!-- Critical Alert -->
                                <div class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fa-solid fa-temperature-high text-red-400 text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-red-400">High Temperature Warning</p>
                                            <p class="text-xs text-gray-400">Cell module 3 temp: 45°C</p>
                                            <p class="text-xs text-gray-500 mt-1">2 mins ago</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Warning Alert -->
                                <div class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fa-solid fa-charging-station text-yellow-400 text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-yellow-400">Charging Recommended</p>
                                            <p class="text-xs text-gray-400">Battery below optimal level</p>
                                            <p class="text-xs text-gray-500 mt-1">15 mins ago</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Info Alert -->
                                <div id="route-updated-alert" class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fa-solid fa-route text-blue-400 text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-blue-400">Route Updated</p>
                                            <p class="text-xs text-gray-400">Traffic detected, rerouting...</p>
                                            <p class="text-xs text-gray-500 mt-1">1 hour ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Nearby Charging Stations -->
                        <div id="nearby-stations-card" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-charging-station text-green-400"></i>
                                    Nearby Stations
                                </h3>
                                <a href="/map" class="text-sm text-pagani-gold hover:underline">View Map</a>
                            </div>

                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <i class="fa-solid fa-bolt text-green-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">TATA Power Station</p>
                                            <p class="text-xs text-gray-400">1.2 km • 4/6 available</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-green-400">50kW</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <i class="fa-solid fa-bolt text-blue-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">Ather Grid</p>
                                            <p class="text-xs text-gray-400">2.8 km • 2/4 available</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-blue-400">22kW</span>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all cursor-pointer">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                            <i class="fa-solid fa-bolt text-yellow-400"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">ChargeZone</p>
                                            <p class="text-xs text-gray-400">4.5 km • 6/8 available</p>
                                        </div>
                                    </div>
                                    <span class="text-xs text-yellow-400">150kW</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-pagani-gold"></i>
                                Quick Actions
                            </h3>
                            <div class="grid grid-cols-2 gap-3">
                                <a href="/battery" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-car-battery text-2xl text-green-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Battery</p>
                                </a>
                                <a id="quick-route-action" href="/map" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-route text-2xl text-blue-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Route</p>
                                </a>
                                <a href="/alerts" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-bell text-2xl text-yellow-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Alerts</p>
                                </a>
                                <button id="vehicle-diagnostics" class="p-4 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold/50 transition-all group">
                                    <i class="fa-solid fa-stethoscope text-2xl text-purple-400 mb-2 group-hover:scale-110 transition-transform"></i>
                                    <p class="text-xs font-orbitron">Diagnostics</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (isFactoryPortal) {
        document.getElementById('quick-route-planner-card')?.remove();
        document.getElementById('nearby-stations-card')?.remove();
        document.getElementById('quick-route-action')?.remove();
        document.getElementById('route-updated-alert')?.remove();
    }

    // Initialize dashboard functionality
    setTimeout(() => {
        initializeDashboard();
    }, 100);
}

function initializeDashboard() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-dashboard');
    refreshBtn?.addEventListener('click', () => {
        refreshBtn.classList.add('animate-spin');
        setTimeout(() => {
            refreshBtn.classList.remove('animate-spin');
        }, 1000);
    });

    // SOS button
    const sosBtn = document.getElementById('sos-btn');
    let holdTimer: ReturnType<typeof setTimeout>;
    
    sosBtn?.addEventListener('mousedown', () => {
        holdTimer = setTimeout(() => {
            alert('Emergency SOS activated! Contacting emergency services...');
        }, 3000);
    });

    sosBtn?.addEventListener('mouseup', () => {
        clearTimeout(holdTimer);
    });

    sosBtn?.addEventListener('mouseleave', () => {
        clearTimeout(holdTimer);
    });

    // Vehicle diagnostics
    const diagnosticsBtn = document.getElementById('vehicle-diagnostics');
    diagnosticsBtn?.addEventListener('click', () => {
        alert('Running vehicle diagnostics... All systems operational!');
    });

    // Bluetooth Vehicle Control
    initializeVehicleControl();

    // ESP32 camera view
    initializeCamView();

    // Animate stats on scroll
    const animateSections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
            }
        });
    }, { threshold: 0.1 });

    animateSections.forEach(section => observer.observe(section));
}

function initializeCamView() {
    const camFeed = document.getElementById('cam-feed') as HTMLImageElement | null;
    const camOverlay = document.getElementById('cam-overlay') as HTMLCanvasElement | null;
    const camUrlInput = document.getElementById('cam-url-input') as HTMLInputElement | null;
    const camSaveBtn = document.getElementById('cam-save-url') as HTMLButtonElement | null;
    const camToggleBtn = document.getElementById('cam-toggle-btn') as HTMLButtonElement | null;
    const camDetectionBtn = document.getElementById('cam-detection-btn') as HTMLButtonElement | null;
    const camPathButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-cam-path]'));
    const camDetectionStatus = document.getElementById('cam-detection-status');
    const camStatusDot = document.getElementById('cam-status-dot');
    const camStatusText = document.getElementById('cam-status-text');

    if (!camFeed || !camOverlay || !camUrlInput || !camSaveBtn || !camToggleBtn || !camDetectionBtn || !camDetectionStatus || !camStatusDot || !camStatusText) {
        return;
    }

    const cocoSsdWindow = window as Window & { cocoSsd?: CocoSsdGlobal };

    const loadScript = (src: string) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                return Promise.resolve();
            }
            return new Promise<void>((resolve, reject) => {
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed loading script: ${src}`)), { once: true });
            });
        }

        return new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = () => reject(new Error(`Failed loading script: ${src}`));
            document.head.appendChild(script);
        });
    };

    const getSanitizedUrl = (url: string) => {
        const trimmed = url.trim();
        if (!trimmed) return '';
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        return `http://${trimmed}`;
    };

    const normalizeCommonCameraTypos = (url: string) => {
        return url
            .replace('/com-hi.jpg', '/cam-hi.jpg')
            .replace('/camhi.jpg', '/cam-hi.jpg')
            .replace('/cam-mid.jpeg', '/cam-mid.jpg')
            .replace('/cam-lo.jpeg', '/cam-lo.jpg')
            .replace('/cam-hi.jpeg', '/cam-hi.jpg');
    };

    const ensureCameraPath = (url: string) => {
        try {
            const parsed = new URL(url);
            const pathname = parsed.pathname.toLowerCase();
            const hasKnownPath = /\/cam-(lo|mid|hi)\.jpg$/.test(pathname);
            const hasAnyJpegPath = pathname.endsWith('.jpg') || pathname.endsWith('.jpeg');

            if (!pathname || pathname === '/' || (!hasKnownPath && !hasAnyJpegPath)) {
                parsed.pathname = '/cam-hi.jpg';
            }

            return parsed.toString();
        } catch {
            return url;
        }
    };

    const setCameraPath = (url: string, path: string) => {
        try {
            const parsed = new URL(url);
            parsed.pathname = path;
            return parsed.toString();
        } catch {
            return url;
        }
    };

    const setStatus = (isOnline: boolean, text: string) => {
        camStatusText.textContent = text;
        camStatusDot.classList.remove('bg-red-500', 'bg-green-500', 'animate-pulse');
        if (isOnline) {
            camStatusDot.classList.add('bg-green-500', 'animate-pulse');
            camStatusText.classList.remove('text-red-300');
            camStatusText.classList.add('text-cyan-300');
            return;
        }

        camStatusDot.classList.add('bg-red-500');
        camStatusText.classList.add('text-red-300');
    };

    const buildFrameUrl = (baseUrl: string) => {
        const now = Date.now();
        const params = new URLSearchParams({
            url: baseUrl,
            t: String(now)
        });
        return `/api/camera/frame?${params.toString()}`;
    };

    const readProxyErrorMessage = async (response: Response) => {
        try {
            const data = await response.json() as { message?: string };
            return data.message || `Camera error (${response.status})`;
        } catch {
            return `Camera error (${response.status})`;
        }
    };

    const validateCameraEndpoint = async (baseUrl: string) => {
        const proxyUrl = buildFrameUrl(baseUrl);
        const response = await fetch(proxyUrl, { method: 'GET', cache: 'no-store' });
        if (!response.ok) {
            const message = await readProxyErrorMessage(response);
            return { ok: false, message };
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.toLowerCase().includes('image/')) {
            return { ok: false, message: 'Camera response is not an image.' };
        }

        return { ok: true, message: 'Ready' };
    };

    const overlayContext = camOverlay.getContext('2d');
    let detectionModel: CocoSsdModel | null = null;
    let isDetectionEnabled = false;
    let isDetectorLoading = false;
    let detectionInFlight = false;
    let lastDetectionAt = 0;

    const setDetectionStatus = (status: string) => {
        camDetectionStatus.textContent = status;
    };

    const syncOverlaySize = () => {
        const width = camFeed.clientWidth;
        const height = camFeed.clientHeight;
        if (!width || !height) return;
        if (camOverlay.width !== width || camOverlay.height !== height) {
            camOverlay.width = width;
            camOverlay.height = height;
        }
    };

    const clearOverlay = () => {
        if (!overlayContext) return;
        overlayContext.clearRect(0, 0, camOverlay.width, camOverlay.height);
    };

    const drawDetections = (predictions: CameraDetectionPrediction[]) => {
        if (!overlayContext) return;

        syncOverlaySize();
        clearOverlay();

        const naturalWidth = camFeed.naturalWidth || 1;
        const naturalHeight = camFeed.naturalHeight || 1;
        const scaleX = camOverlay.width / naturalWidth;
        const scaleY = camOverlay.height / naturalHeight;

        overlayContext.lineWidth = 2;
        overlayContext.strokeStyle = '#22d3ee';
        overlayContext.font = '12px Orbitron, sans-serif';
        overlayContext.textBaseline = 'top';

        predictions.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            const sx = x * scaleX;
            const sy = y * scaleY;
            const sw = width * scaleX;
            const sh = height * scaleY;
            const label = `${prediction.class.toUpperCase()} ${(prediction.score * 100).toFixed(0)}%`;

            overlayContext.strokeRect(sx, sy, sw, sh);

            const labelPadding = 4;
            const textWidth = overlayContext.measureText(label).width;
            const textHeight = 14;

            overlayContext.fillStyle = 'rgba(15, 23, 42, 0.85)';
            overlayContext.fillRect(sx, Math.max(0, sy - textHeight - 4), textWidth + labelPadding * 2, textHeight + 4);
            overlayContext.fillStyle = '#34d399';
            overlayContext.fillText(label, sx + labelPadding, Math.max(0, sy - textHeight - 2));
        });
    };

    const maybeDetectObjects = async () => {
        if (!isDetectionEnabled || !detectionModel || !isStreaming || detectionInFlight) {
            return;
        }

        const now = Date.now();
        if (now - lastDetectionAt < 1000) {
            return;
        }

        detectionInFlight = true;
        lastDetectionAt = now;

        try {
            const predictions = await detectionModel.detect(camFeed);
            drawDetections(predictions);
            setDetectionStatus(predictions.length > 0 ? `Detected ${predictions.length} object(s)` : 'No objects detected');
        } catch {
            setDetectionStatus('Detection error');
        } finally {
            detectionInFlight = false;
        }
    };

    const ensureDetectionModel = async () => {
        if (detectionModel) {
            return true;
        }

        if (isDetectorLoading) {
            return false;
        }

        isDetectorLoading = true;
        setDetectionStatus('Loading model...');

        try {
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');

            if (!cocoSsdWindow.cocoSsd) {
                throw new Error('COCO-SSD script not available');
            }

            detectionModel = await cocoSsdWindow.cocoSsd.load({ base: 'lite_mobilenet_v2' });
            setDetectionStatus('Model ready');
            return true;
        } catch {
            setDetectionStatus('Model load failed');
            return false;
        } finally {
            isDetectorLoading = false;
        }
    };

    let cameraUrl = ensureCameraPath(normalizeCommonCameraTypos(getSanitizedUrl(localStorage.getItem(CAMERA_URL_STORAGE_KEY) || DEFAULT_ESP32_CAM_URL)));
    let isStreaming = false;

    camUrlInput.value = cameraUrl;

    if (camViewInterval) {
        clearInterval(camViewInterval);
        camViewInterval = null;
    }

    const requestFrame = () => {
        if (!cameraUrl) {
            setStatus(false, 'No URL');
            return;
        }
        camFeed.src = buildFrameUrl(cameraUrl);
    };

    camFeed.addEventListener('load', () => {
        syncOverlaySize();
        if (isStreaming) {
            setStatus(true, 'Online');
        }
        void maybeDetectObjects();
    });

    camFeed.addEventListener('error', () => {
        clearOverlay();
        setStatus(false, 'Unable to load');
    });

    const startStream = async () => {
        if (!cameraUrl) {
            setStatus(false, 'No URL');
            return;
        }

        setStatus(false, 'Checking...');
        const validation = await validateCameraEndpoint(cameraUrl);
        if (!validation.ok) {
            setStatus(false, validation.message);
            return;
        }

        if (camViewInterval) {
            clearInterval(camViewInterval);
        }

        isStreaming = true;
        camToggleBtn.textContent = 'Stop';
        camToggleBtn.classList.remove('bg-cyan-500', 'hover:bg-cyan-400', 'text-black');
        camToggleBtn.classList.add('bg-red-600', 'hover:bg-red-500', 'text-white');

        requestFrame();
        camViewInterval = setInterval(requestFrame, 250);
    };

    const stopStream = () => {
        isStreaming = false;

        if (camViewInterval) {
            clearInterval(camViewInterval);
            camViewInterval = null;
        }

        clearOverlay();
        camToggleBtn.textContent = 'Start';
        camToggleBtn.classList.remove('bg-red-600', 'hover:bg-red-500', 'text-white');
        camToggleBtn.classList.add('bg-cyan-500', 'hover:bg-cyan-400', 'text-black');

        setStatus(false, 'Stopped');
    };

    const applyCameraUrl = () => {
        const nextUrl = ensureCameraPath(normalizeCommonCameraTypos(getSanitizedUrl(camUrlInput.value)));
        camUrlInput.value = nextUrl;
        cameraUrl = nextUrl;
        localStorage.setItem(CAMERA_URL_STORAGE_KEY, nextUrl);

        if (!nextUrl) {
            stopStream();
            setStatus(false, 'No URL');
            return;
        }

        if (isStreaming) {
            void startStream();
        } else {
            setStatus(false, 'Ready');
        }
    };

    camSaveBtn.addEventListener('click', applyCameraUrl);
    camUrlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyCameraUrl();
        }
    });

    camToggleBtn.addEventListener('click', () => {
        if (isStreaming) {
            stopStream();
        } else {
            void startStream();
        }
    });

    camPathButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const selectedPath = button.dataset.camPath || '/cam-hi.jpg';
            const baseUrl = ensureCameraPath(normalizeCommonCameraTypos(getSanitizedUrl(camUrlInput.value || cameraUrl || DEFAULT_ESP32_CAM_URL)));
            const nextUrl = setCameraPath(baseUrl, selectedPath);

            cameraUrl = nextUrl;
            camUrlInput.value = nextUrl;
            localStorage.setItem(CAMERA_URL_STORAGE_KEY, nextUrl);

            if (isStreaming) {
                void startStream();
            } else {
                setStatus(false, 'Ready');
            }
        });
    });

    camDetectionBtn.addEventListener('click', async () => {
        if (isDetectionEnabled) {
            isDetectionEnabled = false;
            clearOverlay();
            camDetectionBtn.textContent = 'Enable Detection';
            camDetectionBtn.classList.remove('bg-red-500/20', 'border-red-500/50', 'text-red-300');
            camDetectionBtn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-300');
            setDetectionStatus('Off');
            return;
        }

        const modelReady = await ensureDetectionModel();
        if (!modelReady) {
            return;
        }

        isDetectionEnabled = true;
        camDetectionBtn.textContent = 'Disable Detection';
        camDetectionBtn.classList.remove('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-300');
        camDetectionBtn.classList.add('bg-red-500/20', 'border-red-500/50', 'text-red-300');
        setDetectionStatus('Detection active');
        void maybeDetectObjects();
    });

    if (cameraUrl) {
        void startStream();
    } else {
        setStatus(false, 'No URL');
    }
}

function initializeVehicleControl() {
    const btConnectBtn = document.getElementById('bt-connect-btn');
    const btIndicator = document.getElementById('bt-indicator');
    const btStatusText = document.getElementById('bt-status-text');
    const telemetryContainer = document.getElementById('vehicle-telemetry');
    
    const ctrlForward = document.getElementById('ctrl-forward') as HTMLButtonElement;
    const ctrlBackward = document.getElementById('ctrl-backward') as HTMLButtonElement;
    const ctrlLeft = document.getElementById('ctrl-left') as HTMLButtonElement;
    const ctrlRight = document.getElementById('ctrl-right') as HTMLButtonElement;
    const ctrlStop = document.getElementById('ctrl-stop') as HTMLButtonElement;
    
    const telemetryBattery = document.getElementById('telemetry-battery');
    const telemetryTemp = document.getElementById('telemetry-temp');
    const telemetryDirection = document.getElementById('telemetry-direction');
    
    // Initially disable controls
    const controlButtons = [ctrlForward, ctrlBackward, ctrlLeft, ctrlRight, ctrlStop];
    controlButtons.forEach(btn => btn && (btn.disabled = true));
    
    // Subscribe to status changes
    bluetoothService.onStatusChange((status) => {
        if (status.connected) {
            btIndicator?.classList.remove('bg-red-500');
            btIndicator?.classList.add('bg-green-500', 'animate-pulse');
            if (btStatusText) btStatusText.textContent = `Connected to ${status.device || 'ESP32'}`;
            if (btConnectBtn) {
                btConnectBtn.textContent = 'Connected';
                btConnectBtn.classList.add('bg-green-500/20', 'border-green-500/50', 'text-green-400');
                btConnectBtn.classList.remove('bg-blue-500/20', 'border-blue-500/50', 'text-blue-400');
            }
            telemetryContainer?.classList.remove('opacity-50');
            
            // Enable control buttons
            controlButtons.forEach(btn => btn && (btn.disabled = false));
        } else {
            btIndicator?.classList.remove('bg-green-500', 'animate-pulse');
            btIndicator?.classList.add('bg-red-500');
            if (btStatusText) btStatusText.textContent = 'Disconnected';
            if (btConnectBtn) {
                btConnectBtn.textContent = 'Connect';
                btConnectBtn.classList.remove('bg-green-500/20', 'border-green-500/50', 'text-green-400');
                btConnectBtn.classList.add('bg-blue-500/20', 'border-blue-500/50', 'text-blue-400');
            }
            telemetryContainer?.classList.add('opacity-50');
            
            // Disable control buttons
            controlButtons.forEach(btn => btn && (btn.disabled = true));
        }
    });
    
    // Subscribe to telemetry updates
    bluetoothService.onTelemetry((telemetry) => {
        if (telemetryBattery) telemetryBattery.textContent = `${telemetry.battery}%`;
        if (telemetryTemp) telemetryTemp.textContent = `${telemetry.temperature.toFixed(1)}°C`;
        if (telemetryDirection) {
            telemetryDirection.textContent = telemetry.direction;
            // Add color based on status
            if (telemetry.moving) {
                telemetryDirection.classList.remove('text-gray-400');
                telemetryDirection.classList.add('text-green-400');
            } else {
                telemetryDirection.classList.remove('text-green-400');
                telemetryDirection.classList.add('text-gray-400');
            }
        }
    });
    
    // Connect button
    btConnectBtn?.addEventListener('click', () => {
        const status = bluetoothService.getStatus();
        if (!status.connected) {
            bluetoothService.connectToESP32();
            if (btConnectBtn) btConnectBtn.textContent = 'Connecting...';
        }
    });
    
    // Control buttons
    ctrlForward?.addEventListener('click', () => {
        bluetoothService.sendCommand('FORWARD');
    });
    
    ctrlBackward?.addEventListener('click', () => {
        bluetoothService.sendCommand('BACKWARD');
    });
    
    ctrlLeft?.addEventListener('click', () => {
        bluetoothService.sendCommand('LEFT');
    });
    
    ctrlRight?.addEventListener('click', () => {
        bluetoothService.sendCommand('RIGHT');
    });
    
    ctrlStop?.addEventListener('click', () => {
        bluetoothService.sendCommand('STOP');
    });
    
    // Keyboard controls (WASD or Arrow keys)
    document.addEventListener('keydown', (e) => {
        const status = bluetoothService.getStatus();
        if (!status.connected) return;
        
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                e.preventDefault();
                ctrlForward?.classList.add('scale-95');
                bluetoothService.sendCommand('FORWARD');
                break;
            case 's':
            case 'arrowdown':
                e.preventDefault();
                ctrlBackward?.classList.add('scale-95');
                bluetoothService.sendCommand('BACKWARD');
                break;
            case 'a':
            case 'arrowleft':
                e.preventDefault();
                ctrlLeft?.classList.add('scale-95');
                bluetoothService.sendCommand('LEFT');
                break;
            case 'd':
            case 'arrowright':
                e.preventDefault();
                ctrlRight?.classList.add('scale-95');
                bluetoothService.sendCommand('RIGHT');
                break;
            case ' ':
                e.preventDefault();
                ctrlStop?.classList.add('scale-95');
                bluetoothService.sendCommand('STOP');
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                ctrlForward?.classList.remove('scale-95');
                break;
            case 's':
            case 'arrowdown':
                ctrlBackward?.classList.remove('scale-95');
                break;
            case 'a':
            case 'arrowleft':
                ctrlLeft?.classList.remove('scale-95');
                break;
            case 'd':
            case 'arrowright':
                ctrlRight?.classList.remove('scale-95');
                break;
            case ' ':
                ctrlStop?.classList.remove('scale-95');
                break;
        }
    });
}
