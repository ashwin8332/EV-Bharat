import { authService } from '../utils/auth';

interface ChargingStation {
    id: string;
    name: string;
    address: string;
    distance: number;
    connectors: string[];
    available: number;
    total: number;
    power: string;
    price: string;
    rating: number;
    amenities: string[];
}

interface RouteOption {
    id: string;
    name: string;
    distance: number;
    duration: string;
    energyConsumption: number;
    chargingStops: number;
    traffic: 'low' | 'medium' | 'high';
    recommended: boolean;
}

export async function renderMapPage() {
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
        <!-- Map & Route Planner Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-route text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Smart Route Planner</h1>
                        </div>
                        <p class="text-gray-400">AI-Optimized Routes with Battery & Traffic Awareness</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <i class="fa-solid fa-satellite-dish text-green-400 animate-pulse"></i>
                            <span class="text-sm text-green-400 font-orbitron">GPS ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Panel - Route Planning -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Route Input -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-location-dot text-pagani-gold"></i>
                                Plan Your Route
                            </h3>
                            
                            <div class="space-y-4">
                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="start-location"
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Starting point"
                                        value="New Delhi, India"
                                    />
                                </div>

                                <div class="relative">
                                    <div class="absolute left-3 top-1/2 -translate-y-1/2">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="end-location"
                                        class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Destination"
                                        value="Jaipur, Rajasthan"
                                    />
                                </div>

                                <button 
                                    id="calculate-route-btn"
                                    class="w-full py-3 bg-gradient-to-r from-pagani-gold to-bright-gold text-black font-orbitron font-bold rounded-lg hover:shadow-lg hover:shadow-pagani-gold/50 transition-all uppercase tracking-wider text-sm"
                                >
                                    <i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route
                                </button>
                            </div>
                        </div>

                        <!-- Current Battery Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 100ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-car-battery text-pagani-gold"></i>
                                Vehicle Status
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="text-center p-3 bg-pagani-black/50 rounded-lg">
                                    <p class="text-2xl font-orbitron font-bold text-green-400">87%</p>
                                    <p class="text-xs text-gray-400 mt-1">Battery</p>
                                </div>
                                <div class="text-center p-3 bg-pagani-black/50 rounded-lg">
                                    <p class="text-2xl font-orbitron font-bold text-pagani-gold">392km</p>
                                    <p class="text-xs text-gray-400 mt-1">Range</p>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <p class="text-xs text-yellow-400">
                                    <i class="fa-solid fa-lightbulb mr-1"></i>
                                    Your current range covers this trip with 1 charging stop recommended.
                                </p>
                            </div>
                        </div>

                        <!-- Route Options -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 200ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-signs-post text-pagani-gold"></i>
                                Route Options
                            </h3>
                            <div class="space-y-3" id="route-options">
                                <!-- Routes will be populated by JS -->
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Map & Details -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Map Container -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl overflow-hidden fade-in-section" style="animation-delay: 150ms">
                            <div class="relative h-[400px] lg:h-[450px] bg-gray-800">
                                <!-- Simulated Map -->
                                <div class="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-pagani-black">
                                    <div class="absolute inset-0 opacity-30" style="background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23d4af37\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
                                    
                                    <!-- Simulated Route Line -->
                                    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path d="M 15,80 Q 30,60 45,50 T 75,25" fill="none" stroke="#d4af37" stroke-width="0.5" stroke-dasharray="2,1" class="animate-pulse"/>
                                        <path d="M 15,80 Q 30,60 45,50 T 75,25" fill="none" stroke="#22c55e" stroke-width="0.8"/>
                                    </svg>

                                    <!-- Map Markers -->
                                    <div class="absolute left-[12%] bottom-[15%] transform -translate-x-1/2">
                                        <div class="relative">
                                            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                <i class="fa-solid fa-car text-white text-sm"></i>
                                            </div>
                                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-pagani-black px-2 py-1 rounded text-xs whitespace-nowrap">New Delhi</div>
                                        </div>
                                    </div>

                                    <div class="absolute left-[45%] top-[45%] transform -translate-x-1/2 -translate-y-1/2">
                                        <div class="relative">
                                            <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                                <i class="fa-solid fa-charging-station text-white text-sm"></i>
                                            </div>
                                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-pagani-black px-2 py-1 rounded text-xs whitespace-nowrap">Charging Stop</div>
                                        </div>
                                    </div>

                                    <div class="absolute right-[20%] top-[20%]">
                                        <div class="relative">
                                            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                <i class="fa-solid fa-flag-checkered text-white text-sm"></i>
                                            </div>
                                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-pagani-black px-2 py-1 rounded text-xs whitespace-nowrap">Jaipur</div>
                                        </div>
                                    </div>

                                    <!-- Additional charging stations markers -->
                                    <div class="absolute left-[30%] top-[55%]">
                                        <div class="w-5 h-5 bg-blue-500/80 rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform">
                                            <i class="fa-solid fa-plug text-white text-xs"></i>
                                        </div>
                                    </div>
                                    <div class="absolute left-[55%] top-[35%]">
                                        <div class="w-5 h-5 bg-blue-500/80 rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform">
                                            <i class="fa-solid fa-plug text-white text-xs"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- Map Controls -->
                                <div class="absolute top-4 right-4 flex flex-col gap-2">
                                    <button class="w-10 h-10 bg-pagani-black/80 border border-pagani-gold/30 rounded-lg flex items-center justify-center text-white hover:bg-pagani-gold hover:text-black transition-all">
                                        <i class="fa-solid fa-plus"></i>
                                    </button>
                                    <button class="w-10 h-10 bg-pagani-black/80 border border-pagani-gold/30 rounded-lg flex items-center justify-center text-white hover:bg-pagani-gold hover:text-black transition-all">
                                        <i class="fa-solid fa-minus"></i>
                                    </button>
                                    <button class="w-10 h-10 bg-pagani-black/80 border border-pagani-gold/30 rounded-lg flex items-center justify-center text-white hover:bg-pagani-gold hover:text-black transition-all">
                                        <i class="fa-solid fa-location-crosshairs"></i>
                                    </button>
                                </div>

                                <!-- Map Legend -->
                                <div class="absolute bottom-4 left-4 bg-pagani-black/90 border border-pagani-gold/30 rounded-lg p-3">
                                    <div class="flex flex-wrap gap-3 text-xs">
                                        <div class="flex items-center gap-1">
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span class="text-gray-400">Your Location</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span class="text-gray-400">Destination</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span class="text-gray-400">Charging Stop</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span class="text-gray-400">Nearby Station</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Trip Summary -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 250ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-chart-pie text-pagani-gold"></i>
                                Trip Analysis
                            </h3>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-road text-2xl text-pagani-gold mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold">268</p>
                                    <p class="text-xs text-gray-400 mt-1">Kilometers</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-clock text-2xl text-blue-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold">4h 15m</p>
                                    <p class="text-xs text-gray-400 mt-1">Duration</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-bolt text-2xl text-yellow-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold">42 kWh</p>
                                    <p class="text-xs text-gray-400 mt-1">Energy Needed</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-charging-station text-2xl text-green-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold">1</p>
                                    <p class="text-xs text-gray-400 mt-1">Charging Stop</p>
                                </div>
                            </div>
                        </div>

                        <!-- Charging Stations Along Route -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 300ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center justify-between">
                                <span class="flex items-center gap-2">
                                    <i class="fa-solid fa-charging-station text-pagani-gold"></i>
                                    Charging Stations
                                </span>
                                <span class="text-sm text-gray-400 font-normal">5 stations found</span>
                            </h3>
                            <div class="space-y-3" id="charging-stations">
                                <!-- Stations will be populated by JS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize map page functionality
    setTimeout(() => {
        initializeMapPage();
    }, 100);
}

function initializeMapPage() {
    // Populate route options
    const routeOptions = document.getElementById('route-options');
    if (routeOptions) {
        const routes: RouteOption[] = [
            { id: '1', name: 'Energy Efficient', distance: 268, duration: '4h 15m', energyConsumption: 42, chargingStops: 1, traffic: 'low', recommended: true },
            { id: '2', name: 'Fastest Route', distance: 255, duration: '3h 45m', energyConsumption: 48, chargingStops: 1, traffic: 'high', recommended: false },
            { id: '3', name: 'Scenic Route', distance: 295, duration: '5h 00m', energyConsumption: 52, chargingStops: 2, traffic: 'low', recommended: false }
        ];

        routeOptions.innerHTML = routes.map(route => `
            <div class="route-option p-4 bg-pagani-black/50 border ${route.recommended ? 'border-pagani-gold' : 'border-pagani-gold/20'} rounded-lg cursor-pointer hover:border-pagani-gold transition-all ${route.recommended ? 'ring-2 ring-pagani-gold/30' : ''}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        ${route.recommended ? '<span class="px-2 py-0.5 bg-pagani-gold text-black text-xs font-bold rounded">AI PICK</span>' : ''}
                        <span class="font-orbitron font-bold">${route.name}</span>
                    </div>
                    <span class="text-sm text-gray-400">${route.distance} km</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span><i class="fa-solid fa-clock mr-1"></i>${route.duration}</span>
                    <span><i class="fa-solid fa-bolt mr-1"></i>${route.energyConsumption} kWh</span>
                    <span><i class="fa-solid fa-charging-station mr-1"></i>${route.chargingStops} stops</span>
                    <span class="${route.traffic === 'low' ? 'text-green-400' : route.traffic === 'medium' ? 'text-yellow-400' : 'text-red-400'}">
                        <i class="fa-solid fa-traffic-light mr-1"></i>${route.traffic}
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Populate charging stations
    const chargingStations = document.getElementById('charging-stations');
    if (chargingStations) {
        const stations: ChargingStation[] = [
            { id: '1', name: 'Tata Power EV Station', address: 'NH-48, Neemrana', distance: 125, connectors: ['CCS2', 'CHAdeMO'], available: 3, total: 4, power: '50kW DC', price: '₹18/kWh', rating: 4.5, amenities: ['Restroom', 'Café', 'WiFi'] },
            { id: '2', name: 'EESL Charging Hub', address: 'Behror Service Area', distance: 148, connectors: ['CCS2', 'Type 2'], available: 2, total: 6, power: '22kW AC', price: '₹12/kWh', rating: 4.2, amenities: ['Restroom', 'Food Court'] },
            { id: '3', name: 'Fortum Charge Station', address: 'Shahpura, NH-48', distance: 185, connectors: ['CCS2'], available: 4, total: 4, power: '150kW DC', price: '₹22/kWh', rating: 4.8, amenities: ['Lounge', 'Restroom', 'Café', 'WiFi'] },
            { id: '4', name: 'ChargeZone Ultra', address: 'Near Jaipur Toll', distance: 230, connectors: ['CCS2', 'CHAdeMO', 'Type 2'], available: 5, total: 8, power: '60kW DC', price: '₹16/kWh', rating: 4.3, amenities: ['Restroom', 'Parking'] },
            { id: '5', name: 'Statiq Hypercharger', address: 'Jaipur Ring Road', distance: 262, connectors: ['CCS2'], available: 2, total: 3, power: '120kW DC', price: '₹20/kWh', rating: 4.6, amenities: ['Mall', 'Restroom', 'Food'] }
        ];

        chargingStations.innerHTML = stations.map((station, index) => `
            <div class="p-4 bg-pagani-black/50 border border-pagani-gold/10 rounded-lg hover:border-pagani-gold/30 transition-all ${index === 0 ? 'ring-2 ring-yellow-500/30 border-yellow-500/50' : ''}">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            ${index === 0 ? '<span class="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">RECOMMENDED</span>' : ''}
                            <h4 class="font-orbitron font-bold">${station.name}</h4>
                        </div>
                        <p class="text-xs text-gray-400 mb-2">${station.address}</p>
                        <div class="flex flex-wrap gap-2 mb-2">
                            ${station.connectors.map(c => `<span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">${c}</span>`).join('')}
                            <span class="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">${station.power}</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-400">
                            <span><i class="fa-solid fa-location-dot mr-1"></i>${station.distance} km</span>
                            <span class="${station.available > 0 ? 'text-green-400' : 'text-red-400'}">
                                <i class="fa-solid fa-plug mr-1"></i>${station.available}/${station.total} available
                            </span>
                            <span><i class="fa-solid fa-indian-rupee-sign mr-1"></i>${station.price}</span>
                            <span class="text-yellow-400"><i class="fa-solid fa-star mr-1"></i>${station.rating}</span>
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-xs font-orbitron hover:bg-pagani-gold hover:text-black transition-all whitespace-nowrap">
                        Navigate
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Calculate route button
    const calculateBtn = document.getElementById('calculate-route-btn');
    calculateBtn?.addEventListener('click', () => {
        calculateBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Calculating...';
        setTimeout(() => {
            calculateBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Route Calculated!';
            showNotification('Optimal route calculated based on battery and traffic', 'success');
            setTimeout(() => {
                calculateBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route';
            }, 2000);
        }, 1500);
    });

    // Route option selection
    const routeOptionElements = document.querySelectorAll('.route-option');
    routeOptionElements.forEach(option => {
        option.addEventListener('click', () => {
            routeOptionElements.forEach(o => {
                o.classList.remove('border-pagani-gold', 'ring-2', 'ring-pagani-gold/30');
                o.classList.add('border-pagani-gold/20');
            });
            option.classList.remove('border-pagani-gold/20');
            option.classList.add('border-pagani-gold', 'ring-2', 'ring-pagani-gold/30');
        });
    });
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
