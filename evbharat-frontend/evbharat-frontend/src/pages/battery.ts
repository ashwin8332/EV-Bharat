import { authService } from '../utils/auth';

export async function renderBatteryPage() {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = '/auth';
        return;
    }

    const app = document.getElementById('app');
    if (!app) return;

    // Load Font Awesome
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    app.innerHTML = `
        <!-- Battery Management Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-car-battery text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Battery Management</h1>
                        </div>
                        <p class="text-gray-400">AI-Powered Battery Health Monitoring & Prediction</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="/battery-analytics" class="px-4 py-2 bg-gradient-to-r from-pagani-gold to-yellow-500 text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/20 transition-all text-sm">
                            <i class="fa-solid fa-brain mr-2"></i>ML ANALYTICS
                        </a>
                        <select id="vehicle-selector" class="px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white font-orbitron text-sm focus:outline-none focus:border-pagani-gold">
                            <option value="1">EVBharat X-1 (DL-01-AB-1234)</option>
                            <option value="2">EVBharat X-1 (MH-02-CD-5678)</option>
                            <option value="3">EVBharat X-1 Premium (KA-03-EF-9012)</option>
                        </select>
                        <button id="refresh-btn" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-refresh"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Battery Status -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Battery Visual -->
                    <div class="lg:col-span-1 bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-lg font-orbitron font-bold mb-6 text-center">Battery Status</h3>
                        <div class="relative flex justify-center">
                            <!-- Battery Container -->
                            <div class="relative w-32 h-64">
                                <!-- Battery Cap -->
                                <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-700 rounded-t-lg"></div>
                                <!-- Battery Body -->
                                <div class="absolute top-2 w-full h-60 bg-gray-800 border-4 border-gray-600 rounded-xl overflow-hidden">
                                    <!-- Battery Fill -->
                                    <div id="battery-fill" class="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-1000" style="height: 87%;">
                                        <div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
                                    </div>
                                    <!-- Charging Animation -->
                                    <div id="charging-indicator" class="absolute inset-0 flex items-center justify-center">
                                        <i class="fa-solid fa-bolt text-4xl text-yellow-400 animate-pulse"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-6">
                            <p class="text-5xl font-orbitron font-bold text-pagani-gold" id="soc-display">87%</p>
                            <p class="text-sm text-gray-400 mt-2">State of Charge</p>
                            <div class="flex items-center justify-center gap-2 mt-4 text-green-400">
                                <i class="fa-solid fa-plug-circle-bolt"></i>
                                <span id="charging-status" class="text-sm font-orbitron">CHARGING</span>
                            </div>
                            <p class="text-xs text-gray-500 mt-2" id="time-to-full">Est. 45 min to full</p>
                        </div>
                    </div>

                    <!-- Key Metrics -->
                    <div class="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <!-- State of Health -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 100ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-heart-pulse text-2xl text-red-400"></i>
                                <span class="text-xs text-gray-400 uppercase">SoH</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold text-green-400" id="soh-value">94%</p>
                            <p class="text-xs text-gray-400 mt-1">State of Health</p>
                            <div class="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" id="soh-bar" style="width: 94%"></div>
                            </div>
                        </div>

                        <!-- Temperature -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 150ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-temperature-half text-2xl text-orange-400"></i>
                                <span class="text-xs text-gray-400 uppercase">TEMP</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold" id="temp-value">32°C</p>
                            <p class="text-xs text-gray-400 mt-1">Battery Temp</p>
                            <p class="text-xs text-green-400 mt-3"><i class="fa-solid fa-check-circle mr-1"></i>Optimal Range</p>
                        </div>

                        <!-- Voltage -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 200ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-bolt text-2xl text-yellow-400"></i>
                                <span class="text-xs text-gray-400 uppercase">VOLT</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold" id="voltage-value">396V</p>
                            <p class="text-xs text-gray-400 mt-1">Pack Voltage</p>
                            <p class="text-xs text-gray-500 mt-3">Nominal: 400V</p>
                        </div>

                        <!-- Current -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 250ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-gauge-high text-2xl text-blue-400"></i>
                                <span class="text-xs text-gray-400 uppercase">AMP</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold text-green-400" id="current-value">+32A</p>
                            <p class="text-xs text-gray-400 mt-1">Charging Current</p>
                            <p class="text-xs text-gray-500 mt-3">Max: 150A</p>
                        </div>

                        <!-- Power -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 300ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-plug text-2xl text-purple-400"></i>
                                <span class="text-xs text-gray-400 uppercase">PWR</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold" id="power-value">12.7kW</p>
                            <p class="text-xs text-gray-400 mt-1">Charging Power</p>
                            <p class="text-xs text-gray-500 mt-3">DC Fast Charging</p>
                        </div>

                        <!-- Estimated Range -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section" style="animation-delay: 350ms">
                            <div class="flex items-center justify-between mb-3">
                                <i class="fa-solid fa-road text-2xl text-pagani-gold"></i>
                                <span class="text-xs text-gray-400 uppercase">RANGE</span>
                            </div>
                            <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="range-value">392km</p>
                            <p class="text-xs text-gray-400 mt-1">Est. Range</p>
                            <p class="text-xs text-gray-500 mt-3">Avg: 156Wh/km</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Battery Health Prediction -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 class="text-xl font-orbitron font-bold flex items-center gap-3">
                                <i class="fa-solid fa-brain text-pagani-gold"></i>
                                AI Battery Health Prediction
                            </h3>
                            <p class="text-sm text-gray-400 mt-1">ML-based degradation analysis and life prediction</p>
                        </div>
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <i class="fa-solid fa-check-circle text-green-400"></i>
                            <span class="text-sm text-green-400 font-orbitron">HEALTHY</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <!-- Predicted Lifespan -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold text-pagani-gold">8.5</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Years Remaining</p>
                            <p class="text-xs text-gray-500 mt-1">Based on current usage</p>
                        </div>

                        <!-- Cycle Count -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold">245</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Charge Cycles</p>
                            <p class="text-xs text-gray-500 mt-1">Max: ~2000 cycles</p>
                        </div>

                        <!-- Degradation Rate -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold text-green-400">0.8%</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Degradation/Year</p>
                            <p class="text-xs text-gray-500 mt-1">Below average</p>
                        </div>

                        <!-- Next Service -->
                        <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <p class="text-4xl font-orbitron font-bold text-orange-400">45</p>
                            <p class="text-xs text-gray-400 mt-2 uppercase">Days to Service</p>
                            <p class="text-xs text-gray-500 mt-1">Battery check-up</p>
                        </div>
                    </div>

                    <!-- Health Timeline -->
                    <div class="mt-6 p-4 bg-pagani-black/30 rounded-lg">
                        <h4 class="text-sm font-orbitron text-pagani-gold mb-4">Predicted Health Timeline</h4>
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                                    <span class="text-xs font-bold text-green-400">94%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">Now</p>
                            </div>
                            <div class="flex-1 h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 rounded-full"></div>
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
                                    <span class="text-xs font-bold text-green-400">90%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">2027</p>
                            </div>
                            <div class="flex-1 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center">
                                    <span class="text-xs font-bold text-yellow-400">85%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">2029</p>
                            </div>
                            <div class="flex-1 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                            <div class="text-center">
                                <div class="w-12 h-12 mx-auto rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                                    <span class="text-xs font-bold text-orange-400">80%</span>
                                </div>
                                <p class="text-xs text-gray-400 mt-2">2031</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Graphical Analysis -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Battery Health Trend -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-orbitron font-bold flex items-center gap-3">
                                <i class="fa-solid fa-chart-line text-pagani-gold"></i>
                                Battery Health Trend
                            </h3>
                            <span class="text-xs text-gray-400 font-orbitron">LAST 12 MONTHS</span>
                        </div>
                        <div class="relative h-52" id="soh-chart">
                            <!-- Y-axis labels -->
                            <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2" style="width:32px">
                                <span>100%</span><span>96%</span><span>92%</span><span>88%</span>
                            </div>
                            <!-- Chart area -->
                            <div class="ml-10 h-full flex items-end gap-1.5 border-l border-b border-gray-700 pl-2 pb-1">
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="100%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Mar</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="98%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Apr</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="97%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">May</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="96.5%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Jun</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="96%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Jul</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="95.5%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Aug</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="95.2%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Sep</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-green-600 to-green-400 transition-all duration-1000" data-target-height="95%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Oct</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-1000" data-target-height="94.8%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Nov</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-1000" data-target-height="94.5%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Dec</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-yellow-600 to-yellow-400 transition-all duration-1000" data-target-height="94.2%" style="height:0%"></div>
                                    <span class="text-[9px] text-gray-500">Jan</span>
                                </div>
                                <div class="chart-bar-group flex flex-col items-center flex-1 gap-1">
                                    <div class="w-full rounded-t bg-gradient-to-t from-pagani-gold to-bright-gold transition-all duration-1000" data-target-height="94%" style="height:0%"></div>
                                    <span class="text-[9px] text-pagani-gold font-bold">Now</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center justify-between text-xs">
                            <span class="text-gray-400"><i class="fa-solid fa-arrow-trend-down text-yellow-400 mr-1"></i>-6% over 12 months</span>
                            <span class="text-green-400"><i class="fa-solid fa-check-circle mr-1"></i>Within normal range</span>
                        </div>
                    </div>

                    <!-- Energy Consumption Analysis -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-orbitron font-bold flex items-center gap-3">
                                <i class="fa-solid fa-bolt text-pagani-gold"></i>
                                Energy Consumption
                            </h3>
                            <span class="text-xs text-gray-400 font-orbitron">LAST 7 DAYS</span>
                        </div>
                        <div class="space-y-3" id="energy-bars">
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Mon</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="72%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">38 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Tue</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="56%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">29 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Wed</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="88%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">46 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Thu</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="42%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">22 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Fri</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="65%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">34 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-gray-400 w-8">Sat</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-pagani-gold to-bright-gold rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="95%" style="width:0%">
                                        <span class="text-[10px] text-black font-bold">50 kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-pagani-gold w-8 font-bold">Sun</span>
                                <div class="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full flex items-center justify-end pr-2 transition-all duration-1000" data-target-width="34%" style="width:0%">
                                        <span class="text-[10px] text-white font-bold">18 kWh</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center justify-between text-xs">
                            <span class="text-gray-400">Weekly total: <span class="text-white font-bold">237 kWh</span></span>
                            <span class="text-green-400"><i class="fa-solid fa-arrow-down mr-1"></i>12% vs last week</span>
                        </div>
                    </div>

                    <!-- Charging Distribution -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 150ms">
                        <h3 class="text-lg font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-chart-pie text-pagani-gold"></i>
                            Charging Distribution
                        </h3>
                        <div class="flex items-center gap-8">
                            <!-- Donut Chart -->
                            <div class="relative w-40 h-40 flex-shrink-0">
                                <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" stroke-width="16"/>
                                    <!-- DC Fast: 45% -->
                                    <circle id="donut-dc" cx="60" cy="60" r="50" fill="none" stroke="#eab308" stroke-width="16" stroke-dasharray="0 314.16" stroke-dashoffset="0" class="transition-all duration-1000" data-target-dash="141.37 314.16"/>
                                    <!-- Home AC: 35% -->
                                    <circle id="donut-home" cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" stroke-width="16" stroke-dasharray="0 314.16" stroke-dashoffset="-141.37" class="transition-all duration-1000" data-target-dash="109.96 314.16"/>
                                    <!-- Public AC: 20% -->
                                    <circle id="donut-public" cx="60" cy="60" r="50" fill="none" stroke="#22c55e" stroke-width="16" stroke-dasharray="0 314.16" stroke-dashoffset="-251.33" class="transition-all duration-1000" data-target-dash="62.83 314.16"/>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <p class="text-2xl font-orbitron font-bold text-pagani-gold">245</p>
                                    <p class="text-[10px] text-gray-400">sessions</p>
                                </div>
                            </div>
                            <!-- Legend -->
                            <div class="flex-1 space-y-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span class="text-sm text-gray-300">DC Fast Charging</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-orbitron font-bold text-yellow-400">45%</span>
                                        <p class="text-[10px] text-gray-500">110 sessions</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span class="text-sm text-gray-300">Home AC</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-orbitron font-bold text-blue-400">35%</span>
                                        <p class="text-[10px] text-gray-500">86 sessions</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span class="text-sm text-gray-300">Public AC</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-sm font-orbitron font-bold text-green-400">20%</span>
                                        <p class="text-[10px] text-gray-500">49 sessions</p>
                                    </div>
                                </div>
                                <div class="pt-3 border-t border-gray-700">
                                    <div class="flex items-center justify-between text-xs">
                                        <span class="text-gray-400">Avg session cost</span>
                                        <span class="text-pagani-gold font-bold">₹285</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Voltage & Temperature Trends -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 200ms">
                        <h3 class="text-lg font-orbitron font-bold mb-6 flex items-center gap-3">
                            <i class="fa-solid fa-wave-square text-pagani-gold"></i>
                            Voltage & Temperature Trends
                        </h3>
                        <!-- Voltage sparkline -->
                        <div class="mb-5">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400 flex items-center gap-1"><i class="fa-solid fa-bolt text-yellow-400"></i>Pack Voltage</span>
                                <span class="text-xs font-orbitron text-yellow-400">396V</span>
                            </div>
                            <div class="relative h-16 bg-gray-800/50 rounded-lg overflow-hidden" id="voltage-sparkline">
                                <svg viewBox="0 0 300 60" class="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="voltGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#eab308" stop-opacity="0.4"/>
                                            <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,30 Q15,28 30,25 T60,22 T90,28 T120,20 T150,24 T180,18 T210,22 T240,15 T270,18 T300,12" fill="url(#voltGrad)" stroke="none" opacity="0.5"/>
                                    <path id="volt-line" d="M0,30 Q15,28 30,25 T60,22 T90,28 T120,20 T150,24 T180,18 T210,22 T240,15 T270,18 T300,12" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="500" stroke-dashoffset="500" class="transition-all duration-2000"/>
                                    <circle id="volt-dot" cx="300" cy="12" r="3" fill="#eab308" opacity="0" class="transition-all duration-500"/>
                                </svg>
                                <div class="absolute left-2 bottom-1 flex gap-4 text-[9px] text-gray-600">
                                    <span>6h ago</span><span>4h</span><span>2h</span><span>Now</span>
                                </div>
                            </div>
                        </div>
                        <!-- Temperature sparkline -->
                        <div class="mb-5">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs text-gray-400 flex items-center gap-1"><i class="fa-solid fa-temperature-half text-orange-400"></i>Battery Temperature</span>
                                <span class="text-xs font-orbitron text-orange-400">32°C</span>
                            </div>
                            <div class="relative h-16 bg-gray-800/50 rounded-lg overflow-hidden">
                                <svg viewBox="0 0 300 60" class="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stop-color="#f97316" stop-opacity="0.4"/>
                                            <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,40 Q15,38 30,35 T60,38 T90,30 T120,35 T150,28 T180,32 T210,25 T240,28 T270,22 T300,20" fill="url(#tempGrad)" stroke="none" opacity="0.5"/>
                                    <path id="temp-line" d="M0,40 Q15,38 30,35 T60,38 T90,30 T120,35 T150,28 T180,32 T210,25 T240,28 T270,22 T300,20" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="500" stroke-dashoffset="500" class="transition-all duration-2000"/>
                                    <circle id="temp-dot" cx="300" cy="20" r="3" fill="#f97316" opacity="0" class="transition-all duration-500"/>
                                </svg>
                                <div class="absolute left-2 bottom-1 flex gap-4 text-[9px] text-gray-600">
                                    <span>6h ago</span><span>4h</span><span>2h</span><span>Now</span>
                                </div>
                            </div>
                        </div>
                        <!-- Efficiency gauge -->
                        <div class="flex items-center gap-4 p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                            <div class="relative w-14 h-14 flex-shrink-0">
                                <svg viewBox="0 0 60 60" class="w-full h-full -rotate-90">
                                    <circle cx="30" cy="30" r="24" fill="none" stroke="#1f2937" stroke-width="6"/>
                                    <circle id="efficiency-ring" cx="30" cy="30" r="24" fill="none" stroke="#22c55e" stroke-width="6" stroke-dasharray="0 150.8" stroke-linecap="round" class="transition-all duration-1000" data-target-dash="131.9 150.8"/>
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-xs font-orbitron font-bold text-green-400">87%</span>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-white">Charging Efficiency</p>
                                <p class="text-xs text-gray-400">156 Wh/km average · <span class="text-green-400">Excellent</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charging History & Tips -->
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Recent Charging Sessions -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-clock-rotate-left text-pagani-gold"></i>
                            Recent Charging Sessions
                        </h3>
                        <div class="space-y-3" id="charging-history">
                            <!-- Sessions will be populated by JS -->
                        </div>
                    </div>

                    <!-- Battery Care Tips -->
                    <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                        <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-3">
                            <i class="fa-solid fa-lightbulb text-pagani-gold"></i>
                            AI Battery Care Tips
                        </h3>
                        <div class="space-y-4">
                            <div class="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <i class="fa-solid fa-check-circle text-green-400 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-green-400">Optimal Charging</p>
                                    <p class="text-xs text-gray-400 mt-1">Your average charging level is 80%, which is ideal for battery longevity.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <i class="fa-solid fa-exclamation-triangle text-yellow-400 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-yellow-400">Avoid Deep Discharge</p>
                                    <p class="text-xs text-gray-400 mt-1">Try not to let the battery drop below 20% regularly.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <i class="fa-solid fa-snowflake text-blue-400 mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-blue-400">Temperature Management</p>
                                    <p class="text-xs text-gray-400 mt-1">Pre-condition your battery before fast charging in cold weather.</p>
                                </div>
                            </div>
                            <div class="flex items-start gap-3 p-3 bg-pagani-gold/10 border border-pagani-gold/30 rounded-lg">
                                <i class="fa-solid fa-bolt text-pagani-gold mt-1"></i>
                                <div>
                                    <p class="text-sm font-semibold text-pagani-gold">Smart Charging</p>
                                    <p class="text-xs text-gray-400 mt-1">Use scheduled charging to charge during off-peak hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize battery page functionality
    setTimeout(() => {
        initializeBatteryPage();
    }, 100);
}

function initializeBatteryPage() {
    // Animate charts
    animateCharts();

    // Populate charging history
    const chargingHistory = document.getElementById('charging-history');
    if (chargingHistory) {
        const sessions = [
            { date: 'Today, 10:30 AM', type: 'DC Fast', from: '25%', to: '87%', duration: '35 min', energy: '42 kWh' },
            { date: 'Yesterday, 8:15 PM', type: 'Home AC', from: '45%', to: '80%', duration: '2h 30m', energy: '28 kWh' },
            { date: 'Feb 12, 3:45 PM', type: 'DC Fast', from: '18%', to: '90%', duration: '48 min', energy: '58 kWh' },
            { date: 'Feb 10, 11:00 AM', type: 'Public AC', from: '60%', to: '100%', duration: '3h 10m', energy: '32 kWh' }
        ];

        chargingHistory.innerHTML = sessions.map(session => `
            <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg border border-pagani-gold/10 hover:border-pagani-gold/30 transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${session.type.includes('DC') ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center">
                        <i class="fa-solid ${session.type.includes('DC') ? 'fa-bolt' : 'fa-plug'}"></i>
                    </div>
                    <div>
                        <p class="text-sm font-semibold">${session.type} Charging</p>
                        <p class="text-xs text-gray-400">${session.date}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-orbitron text-pagani-gold">${session.from} → ${session.to}</p>
                    <p class="text-xs text-gray-400">${session.duration} | ${session.energy}</p>
                </div>
            </div>
        `).join('');
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn?.addEventListener('click', () => {
        refreshBtn.classList.add('animate-spin');
        setTimeout(() => {
            refreshBtn.classList.remove('animate-spin');
            showNotification('Battery data refreshed', 'success');
        }, 1000);
    });

    // Simulate real-time updates
    startRealTimeUpdates();
}

function animateCharts() {
    // Animate SoH bar chart
    document.querySelectorAll('#soh-chart [data-target-height]').forEach((el, i) => {
        setTimeout(() => {
            (el as HTMLElement).style.height = (el as HTMLElement).dataset.targetHeight!;
        }, 100 + i * 80);
    });

    // Animate energy consumption bars
    document.querySelectorAll('#energy-bars [data-target-width]').forEach((el, i) => {
        setTimeout(() => {
            (el as HTMLElement).style.width = (el as HTMLElement).dataset.targetWidth!;
        }, 200 + i * 100);
    });

    // Animate donut chart segments
    setTimeout(() => {
        ['donut-dc', 'donut-home', 'donut-public'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('stroke-dasharray', el.dataset.targetDash!);
        });
    }, 400);

    // Animate sparklines
    setTimeout(() => {
        const voltLine = document.getElementById('volt-line');
        const tempLine = document.getElementById('temp-line');
        if (voltLine) voltLine.style.strokeDashoffset = '0';
        if (tempLine) tempLine.style.strokeDashoffset = '0';

        setTimeout(() => {
            const voltDot = document.getElementById('volt-dot');
            const tempDot = document.getElementById('temp-dot');
            if (voltDot) voltDot.setAttribute('opacity', '1');
            if (tempDot) tempDot.setAttribute('opacity', '1');
        }, 1500);
    }, 600);

    // Animate efficiency ring
    setTimeout(() => {
        const ring = document.getElementById('efficiency-ring');
        if (ring) ring.setAttribute('stroke-dasharray', ring.dataset.targetDash!);
    }, 800);
}

function startRealTimeUpdates() {
    // Simulate real-time battery updates
    setInterval(() => {
        const socDisplay = document.getElementById('soc-display');
        const batteryFill = document.getElementById('battery-fill');
        
        if (socDisplay && batteryFill) {
            const currentSoc = parseInt(socDisplay.textContent || '87');
            if (currentSoc < 100) {
                const newSoc = Math.min(currentSoc + 1, 100);
                socDisplay.textContent = `${newSoc}%`;
                batteryFill.style.height = `${newSoc}%`;
                
                // Update range
                const rangeValue = document.getElementById('range-value');
                if (rangeValue) {
                    rangeValue.textContent = `${Math.round(newSoc * 4.5)}km`;
                }
            }
        }
    }, 5000);
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
