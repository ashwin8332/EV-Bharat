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
                                        class="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all" 
                                        placeholder="Enter starting point"
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
                                        placeholder="Enter destination"
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
                            <div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <p class="text-xs text-blue-400">
                                    <i class="fa-solid fa-info-circle mr-1"></i>
                                    Enter route details to calculate optimal charging strategy.
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
                                <!-- Real Google Map -->
                                <div id="google-map" class="absolute inset-0"></div>
                                <!-- Loading overlay (shown until map loads) -->
                                <div id="map-loading" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                                    <div class="text-center">
                                        <i class="fa-solid fa-spinner animate-spin text-pagani-gold text-3xl mb-3"></i>
                                        <p class="text-gray-400 text-sm font-orbitron">Loading Map...</p>
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
                                    <p class="text-2xl font-orbitron font-bold" data-trip="km">--</p>
                                    <p class="text-xs text-gray-400 mt-1">Kilometers</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-clock text-2xl text-blue-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="dur">--</p>
                                    <p class="text-xs text-gray-400 mt-1">Duration</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-bolt text-2xl text-yellow-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="energy">-- kWh</p>
                                    <p class="text-xs text-gray-400 mt-1">Energy Needed</p>
                                </div>
                                <div class="text-center p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <i class="fa-solid fa-charging-station text-2xl text-green-400 mb-2"></i>
                                    <p class="text-2xl font-orbitron font-bold" data-trip="stops">--</p>
                                    <p class="text-xs text-gray-400 mt-1">Charging Stops</p>
                                </div>
                            </div>
                        </div>

                        <!-- Weather Information Panel -->
                        <div id="weather-panel" class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section hidden" style="animation-delay: 270ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-cloud-sun text-pagani-gold"></i>
                                Weather Along Route
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="weather-cards">
                                <!-- Origin weather -->
                                <div id="weather-origin" class="p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span class="text-sm font-orbitron text-gray-300" id="weather-origin-name">Origin</span>
                                        </div>
                                        <img id="weather-origin-icon" src="" alt="" class="w-10 h-10 hidden">
                                    </div>
                                    <div class="text-center py-2">
                                        <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="weather-origin-temp">--°C</p>
                                        <p class="text-xs text-gray-400 capitalize mt-1" id="weather-origin-desc">Loading...</p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 mt-3">
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-temperature-low text-blue-400"></i>
                                            <span>Feels <span id="weather-origin-feels">--</span>°C</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-wind text-cyan-400"></i>
                                            <span><span id="weather-origin-wind">--</span> km/h</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-droplet text-blue-400"></i>
                                            <span><span id="weather-origin-humidity">--</span>%</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-eye text-gray-400"></i>
                                            <span><span id="weather-origin-visibility">--</span> km</span>
                                        </div>
                                    </div>
                                    <div class="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400" id="weather-origin-advisory"></div>
                                </div>
                                <!-- Destination weather -->
                                <div id="weather-destination" class="p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10">
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span class="text-sm font-orbitron text-gray-300" id="weather-dest-name">Destination</span>
                                        </div>
                                        <img id="weather-dest-icon" src="" alt="" class="w-10 h-10 hidden">
                                    </div>
                                    <div class="text-center py-2">
                                        <p class="text-3xl font-orbitron font-bold text-pagani-gold" id="weather-dest-temp">--°C</p>
                                        <p class="text-xs text-gray-400 capitalize mt-1" id="weather-dest-desc">Loading...</p>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 mt-3">
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-temperature-low text-blue-400"></i>
                                            <span>Feels <span id="weather-dest-feels">--</span>°C</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-wind text-cyan-400"></i>
                                            <span><span id="weather-dest-wind">--</span> km/h</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-droplet text-blue-400"></i>
                                            <span><span id="weather-dest-humidity">--</span>%</span>
                                        </div>
                                        <div class="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
                                            <i class="fa-solid fa-eye text-gray-400"></i>
                                            <span><span id="weather-dest-visibility">--</span> km</span>
                                        </div>
                                    </div>
                                    <div class="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400" id="weather-dest-advisory"></div>
                                </div>
                            </div>
                            <!-- EV Weather Impact -->
                            <div id="weather-ev-impact" class="mt-4 p-4 bg-pagani-black/50 rounded-lg border border-pagani-gold/10 hidden">
                                <h4 class="text-sm font-orbitron font-bold text-pagani-gold mb-2 flex items-center gap-2">
                                    <i class="fa-solid fa-car-battery"></i>
                                    EV Weather Impact
                                </h4>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="weather-impact-items"></div>
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
    setTimeout(async () => {
        initializeMapPage();
        await loadGoogleMap();
        // Setup autocomplete AFTER Google Maps is loaded
        setupLocationInputs();
    }, 100);
}

// ── Google Maps loader ───────────────────────────────────────────────
let googleMap: google.maps.Map | null = null;
let directionsRenderer: google.maps.DirectionsRenderer | null = null;
let streetViewService: google.maps.StreetViewService | null = null;
let originMarker: google.maps.Marker | null = null;
let destinationMarker: google.maps.Marker | null = null;
let startAutocomplete: google.maps.places.Autocomplete | null = null;
let endAutocomplete: google.maps.places.Autocomplete | null = null;

const CHARGING_STATIONS = [
    { lat: 27.9878, lng: 76.3867, name: 'Tata Power EV Station', address: 'NH-48, Neemrana' },
    { lat: 27.8750, lng: 76.2795, name: 'EESL Charging Hub', address: 'Behror Service Area' },
    { lat: 27.3990, lng: 75.9710, name: 'Fortum Charge Station', address: 'Shahpura, NH-48' },
    { lat: 27.0505, lng: 75.8570, name: 'ChargeZone Ultra', address: 'Near Jaipur Toll' },
    { lat: 26.9450, lng: 75.7625, name: 'Statiq Hypercharger', address: 'Jaipur Ring Road' },
];

// Light map style (minimal customization for cleaner look)
const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
    // Hide some POI categories for cleaner view
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
    // Enhance roads for better route visibility
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4285f4' }, { weight: 1 }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#34a853' }] },
];

async function loadGoogleMap() {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';

    try {
        // 1. Fetch API key from backend
        const res = await fetch(`${apiBase}/api/maps/key`);
        if (!res.ok) throw new Error(`Key endpoint returned ${res.status}`);
        const data = await res.json();
        if (!data.key) throw new Error('No key in response');
        const apiKey = data.key;

        // 2. Load Google Maps script (if not already loaded)
        if (typeof google === 'undefined' || !google.maps) {
            // Remove any previously injected script (avoids duplicate key errors)
            document.querySelectorAll('script[src*="maps.googleapis.com"]').forEach(s => s.remove());

            const callbackName = '__evbInitMap_' + Date.now();
            await new Promise<void>((resolve, reject) => {
                // Google Maps callback-based loading (most reliable)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any)[callbackName] = () => {
                    delete (window as any)[callbackName];
                    resolve();
                };

                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
                script.async = true;
                script.onerror = () => {
                    delete (window as any)[callbackName];
                    reject(new Error('Google Maps script failed to load'));
                };
                document.head.appendChild(script);

                // Safety timeout
                setTimeout(() => reject(new Error('Google Maps load timed out')), 15000);
            });
        }

        // 3. Initialize the map
        initGoogleMap();
    } catch (err) {
        console.error('[EVBharat] Google Maps load error:', err);
        showMapError(String(err));
    }
}

function showMapError(detail: string) {
    const loading = document.getElementById('map-loading');
    if (loading) {
        loading.innerHTML = `
            <div class="text-center">
                <i class="fa-solid fa-triangle-exclamation text-red-400 text-3xl mb-3"></i>
                <p class="text-red-400 text-sm font-orbitron mb-1">Failed to load map</p>
                <p class="text-gray-500 text-xs">${detail}</p>
            </div>`;
    }
}

function initGoogleMap() {
    const container = document.getElementById('google-map');
    if (!container) { console.error('[EVBharat] #google-map container not found'); return; }
    if (typeof google === 'undefined') { console.error('[EVBharat] google is undefined'); return; }

    try {
        // ── Create map with full controls ──
        googleMap = new google.maps.Map(container, {
            center: { lat: 27.5, lng: 76.5 },
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: LIGHT_MAP_STYLES,
            // Enable all standard UI controls
            disableDefaultUI: false,
            zoomControl: true,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_CENTER,
                mapTypeIds: [
                    google.maps.MapTypeId.ROADMAP,
                    google.maps.MapTypeId.SATELLITE,
                    google.maps.MapTypeId.HYBRID,
                    google.maps.MapTypeId.TERRAIN
                ]
            },
            streetViewControl: true,
            streetViewControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
            fullscreenControl: true,
            fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
            scaleControl: true,
            gestureHandling: 'greedy',
        });

        // ── Initialize Street View Service ──
        streetViewService = new google.maps.StreetViewService();

        // ── Directions Renderer ──
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: googleMap,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#22c55e',
                strokeWeight: 5,
                strokeOpacity: 0.9,
            },
        });

        // ── Charging station markers ──
        CHARGING_STATIONS.forEach((station, idx) => {
            const marker = new google.maps.Marker({
                position: { lat: station.lat, lng: station.lng },
                map: googleMap!,
                title: `${station.name} - Right-click for Street View`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: idx === 0 ? 10 : 8,
                    fillColor: idx === 0 ? '#eab308' : '#3b82f6',
                    fillOpacity: 0.95,
                    strokeColor: '#000000',
                    strokeWeight: 2,
                },
            });

            const infoContent = `
                <div style="color:#000;font-family:sans-serif;padding:4px 0">
                    <strong style="font-size:14px">${station.name}</strong><br>
                    <span style="color:#555;font-size:12px">${station.address}</span>
                    ${idx === 0 ? '<br><span style="background:#eab308;color:#000;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:bold;margin-top:4px;display:inline-block">RECOMMENDED STOP</span>' : ''}
                    <br><small style="color:#888;font-size:10px">Right-click for Street View</small>
                </div>`;
            const iw = new google.maps.InfoWindow({ content: infoContent });
            marker.addListener('click', () => iw.open(googleMap!, marker));
            
            // Add Street View functionality to charging station markers
            addStreetViewToMarker(marker, { lat: station.lat, lng: station.lng });
        });

        // Hide loading overlay
        const loading = document.getElementById('map-loading');
        if (loading) loading.style.display = 'none';

        console.log('[EVBharat] Google Map initialized successfully');
    } catch (err) {
        console.error('[EVBharat] initGoogleMap error:', err);
        showMapError(String(err));
    }
}

function addLabel(marker: google.maps.Marker, text: string) {
    if (!googleMap) return;
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = function () {
        const div = document.createElement('div');
        div.style.cssText = 'position:absolute;background:#ffffff;color:#1565c0;padding:2px 8px;border-radius:4px;font-size:11px;font-family:Orbitron,sans-serif;white-space:nowrap;border:1px solid rgba(21,101,192,0.3);pointer-events:none;transform:translate(-50%,8px);box-shadow:0 2px 4px rgba(0,0,0,0.1)';
        div.textContent = text;
        const panes = this.getPanes();
        panes?.overlayLayer.appendChild(div);
        overlay.draw = function () {
            const pos = this.getProjection().fromLatLngToDivPixel(marker.getPosition()!);
            if (pos) { div.style.left = pos.x + 'px'; div.style.top = pos.y + 'px'; }
        };
    };
    overlay.setMap(googleMap);
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

    // Calculate route button – enhanced with geocoding
    const calculateBtn = document.getElementById('calculate-route-btn');
    calculateBtn?.addEventListener('click', () => {
        calculateDynamicRoute();
    });

    // Add current location button
    addCurrentLocationButton();

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

// ── Dynamic Location & Route Functions ────────────────────────────────

function setupLocationInputs() {
    if (typeof google === 'undefined' || !google.maps?.places) {
        console.warn('[EVBharat] Google Maps Places not available, retrying in 2s...');
        setTimeout(setupLocationInputs, 2000);
        return;
    }

    const startInput = document.getElementById('start-location') as HTMLInputElement;
    const endInput = document.getElementById('end-location') as HTMLInputElement;
    
    if (startInput && endInput) {
        // Setup autocomplete with Indian bias
        const autocompleteOptions = {
            componentRestrictions: { country: 'IN' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address'],
            types: ['(cities)']
        };
        
        startAutocomplete = new google.maps.places.Autocomplete(startInput, autocompleteOptions);
        endAutocomplete = new google.maps.places.Autocomplete(endInput, autocompleteOptions);
            
            // Add listeners for place selection
            startAutocomplete.addListener('place_changed', () => {
                const place = startAutocomplete!.getPlace();
                if (place.geometry?.location) {
                    updateOriginMarker(place.geometry.location, place.name || place.formatted_address || 'Origin');
                }
            });
            
            endAutocomplete.addListener('place_changed', () => {
                const place = endAutocomplete!.getPlace();
                if (place.geometry?.location) {
                    updateDestinationMarker(place.geometry.location, place.name || place.formatted_address || 'Destination');
                }
            });
            
            // Add input listeners to clear markers and analysis when inputs are cleared
            startInput.addEventListener('input', (e) => {
                const value = (e.target as HTMLInputElement).value.trim();
                if (!value) {
                    if (originMarker) { originMarker.setMap(null); originMarker = null; }
                    if (directionsRenderer) { directionsRenderer.setDirections({ routes: [] } as any); }
                    resetTripAnalysis();
                }
            });
            
            endInput.addEventListener('input', (e) => {
                const value = (e.target as HTMLInputElement).value.trim();
                if (!value) {
                    if (destinationMarker) { destinationMarker.setMap(null); destinationMarker = null; }
                    if (directionsRenderer) { directionsRenderer.setDirections({ routes: [] } as any); }
                    resetTripAnalysis();
                }
            });

            // Allow Enter key to trigger route calculation
            const calcHandler = (e: KeyboardEvent) => { if (e.key === 'Enter') calculateDynamicRoute(); };
            startInput.addEventListener('keydown', calcHandler);
            endInput.addEventListener('keydown', calcHandler);
        }

    console.log('[EVBharat] Location autocomplete initialized');
}

function updateOriginMarker(position: google.maps.LatLng, name: string) {
    if (!googleMap) return;
    
    const pos = { lat: position.lat(), lng: position.lng() };
    
    if (originMarker) {
        originMarker.setPosition(pos);
        originMarker.setTitle(`${name} - Right-click for Street View`);
    } else {
        originMarker = new google.maps.Marker({
            position: pos,
            map: googleMap,
            title: `${name} - Right-click for Street View`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#22c55e',
                fillOpacity: 1,
                strokeColor: '#000000',
                strokeWeight: 3,
            },
        });
        addStreetViewToMarker(originMarker, pos);
    }
    
    addLabel(originMarker, name);
}

function updateDestinationMarker(position: google.maps.LatLng, name: string) {
    if (!googleMap) return;
    
    const pos = { lat: position.lat(), lng: position.lng() };
    
    if (destinationMarker) {
        destinationMarker.setPosition(pos);
        destinationMarker.setTitle(`${name} - Right-click for Street View`);
    } else {
        destinationMarker = new google.maps.Marker({
            position: pos,
            map: googleMap,
            title: `${name} - Right-click for Street View`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#ef4444',
                fillOpacity: 1,
                strokeColor: '#000000',
                strokeWeight: 3,
            },
        });
        addStreetViewToMarker(destinationMarker, pos);
    }
    
    addLabel(destinationMarker, name);
}

function calculateDynamicRoute() {
    const calculateBtn = document.getElementById('calculate-route-btn');
    const startInput = document.getElementById('start-location') as HTMLInputElement;
    const endInput = document.getElementById('end-location') as HTMLInputElement;
    
    if (!calculateBtn || !startInput || !endInput) return;
    
    const origin = startInput.value.trim();
    const destination = endInput.value.trim();
    
    if (!origin || !destination) {
        showNotification('Please enter both origin and destination', 'error');
        return;
    }
    
    calculateBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> Calculating...';
    
    if (typeof google !== 'undefined' && googleMap && directionsRenderer) {
        const directionsService = new google.maps.DirectionsService();
        const geocoder = new google.maps.Geocoder();
        
        // Geocode both locations for accurate routing
        Promise.all([
            geocodeLocation(geocoder, origin),
            geocodeLocation(geocoder, destination)
        ]).then(([originResult, destResult]) => {
            if (originResult && destResult) {
                // Update markers with geocoded positions
                updateOriginMarker(originResult.geometry.location, originResult.formatted_address);
                updateDestinationMarker(destResult.geometry.location, destResult.formatted_address);
                
                // Calculate route using Google Directions API
                directionsService.route({
                    origin: originResult.geometry.location,
                    destination: destResult.geometry.location,
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC,
                }, (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK && result) {
                        directionsRenderer!.setDirections(result);
                        
                        // Update trip analysis
                        const leg = result.routes[0]?.legs[0];
                        if (leg) {
                            const distance = Math.round((leg.distance?.value ?? 0) / 1000);
                            const durationText = leg.duration?.text ?? '';
                            const kmEl = document.querySelector('[data-trip="km"]');
                            const durEl = document.querySelector('[data-trip="dur"]');
                            const energyEl = document.querySelector('[data-trip="energy"]');
                            const stopsEl = document.querySelector('[data-trip="stops"]');
                            
                            if (kmEl) kmEl.textContent = String(distance);
                            if (durEl) durEl.textContent = durationText;
                            
                            const estimatedEnergy = Math.round(distance * 0.2);
                            if (energyEl) energyEl.textContent = `${estimatedEnergy} kWh`;
                            
                            const currentRange = 392;
                            const estimatedStops = distance > currentRange ? Math.ceil((distance - currentRange) / 300) : 0;
                            if (stopsEl) stopsEl.textContent = String(estimatedStops);
                            
                            // Update battery status notification
                            const batteryNotification = document.querySelector('.bg-blue-500\\/10 p, .bg-green-500\\/10 p, .bg-yellow-500\\/10 p');
                            if (batteryNotification) {
                                if (estimatedStops === 0) {
                                    batteryNotification.innerHTML = `
                                        <i class="fa-solid fa-check-circle mr-1"></i>
                                        Your current range covers this ${distance}km trip without charging stops needed.
                                    `;
                                    batteryNotification.parentElement!.className = 'mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg';
                                    batteryNotification.className = 'text-xs text-green-400';
                                } else {
                                    batteryNotification.innerHTML = `
                                        <i class="fa-solid fa-lightbulb mr-1"></i>
                                        Your ${distance}km trip will need ${estimatedStops} charging stop${estimatedStops > 1 ? 's' : ''}.
                                    `;
                                    batteryNotification.parentElement!.className = 'mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg';
                                    batteryNotification.className = 'text-xs text-yellow-400';
                                }
                            }

                            // Update route options dynamically
                            updateRouteOptions(distance, durationText);
                        }
                        
                        // Fit map to route
                        const bounds = new google.maps.LatLngBounds();
                        bounds.extend(originResult.geometry.location);
                        bounds.extend(destResult.geometry.location);
                        googleMap!.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
                        
                        const originName = originResult.address_components?.[0]?.long_name ?? 'Origin';
                        const destName = destResult.address_components?.[0]?.long_name ?? 'Destination';
                        calculateBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Route Calculated!';
                        showNotification(`Route from ${originName} to ${destName} calculated`, 'success');

                        // Fetch weather for origin & destination
                        fetchRouteWeather(
                            originResult.geometry.location.lat(),
                            originResult.geometry.location.lng(),
                            destResult.geometry.location.lat(),
                            destResult.geometry.location.lng(),
                            originName,
                            destName
                        );
                    } else {
                        handleRouteError(status);
                    }
                    
                    setTimeout(() => {
                        calculateBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route';
                    }, 3000);
                });
            } else {
                calculateBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle mr-2"></i> Invalid Locations';
                showNotification('Could not find one or both locations. Please check spelling.', 'error');
                resetTripAnalysis();
                setTimeout(() => {
                    calculateBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route';
                }, 3000);
            }
        });
    } else {
        showNotification('Map not loaded yet. Please wait and try again.', 'error');
        setTimeout(() => {
            calculateBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-location mr-2"></i> Calculate Route';
        }, 2000);
    }
}

function geocodeLocation(geocoder: google.maps.Geocoder, address: string): Promise<google.maps.GeocoderResult | null> {
    return new Promise((resolve) => {
        geocoder.geocode({
            address: address,
            componentRestrictions: { country: 'IN' }
        }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                resolve(results[0]);
            } else {
                console.error('[EVBharat] Geocoding failed:', status, 'for:', address);
                resolve(null);
            }
        });
    });
}

function handleRouteError(status: google.maps.DirectionsStatus) {
    const calculateBtn = document.getElementById('calculate-route-btn');
    if (!calculateBtn) return;
    
    let message = 'Could not calculate route';
    switch (status) {
        case google.maps.DirectionsStatus.NOT_FOUND:
            message = 'One or both locations not found';
            break;
        case google.maps.DirectionsStatus.ZERO_RESULTS:
            message = 'No route found between these locations';
            break;
        case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
            message = 'Too many requests. Please try again later.';
            break;
        case google.maps.DirectionsStatus.REQUEST_DENIED:
            message = 'Directions request denied. Check API key permissions.';
            break;
    }
    
    calculateBtn.innerHTML = '<i class="fa-solid fa-exclamation-triangle mr-2"></i> Route Failed';
    showNotification(message, 'error');
    resetTripAnalysis();
}



function resetTripAnalysis() {
    const kmEl = document.querySelector('[data-trip="km"]');
    const durEl = document.querySelector('[data-trip="dur"]');
    const energyEl = document.querySelector('[data-trip="energy"]');
    const stopsEl = document.querySelector('[data-trip="stops"]');
    
    if (kmEl) kmEl.textContent = '--';
    if (durEl) durEl.textContent = '--';
    if (energyEl) energyEl.textContent = '-- kWh';
    if (stopsEl) stopsEl.textContent = '--';
    
    // Clear route
    if (directionsRenderer) { directionsRenderer.setDirections({ routes: [] } as any); }

    // Hide weather panel
    const weatherPanel = document.getElementById('weather-panel');
    if (weatherPanel) weatherPanel.classList.add('hidden');
    const impactPanel = document.getElementById('weather-ev-impact');
    if (impactPanel) impactPanel.classList.add('hidden');

    // Reset battery status notification
    const batteryNotification = document.querySelector('.bg-green-500\\/10 p, .bg-yellow-500\\/10 p, .bg-blue-500\\/10 p');
    if (batteryNotification) {
        batteryNotification.innerHTML = `
            <i class="fa-solid fa-info-circle mr-1"></i>
            Enter route details to calculate optimal charging strategy.
        `;
        batteryNotification.parentElement!.className = 'mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg';
        batteryNotification.className = 'text-xs text-blue-400';
    }
}

function addCurrentLocationButton() {
    // Add current location button to start input
    const startInput = document.getElementById('start-location');
    if (startInput && !document.getElementById('current-location-btn')) {
        const container = startInput.parentElement;
        if (container) {
            const button = document.createElement('button');
            button.id = 'current-location-btn';
            button.type = 'button';
            button.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-pagani-gold hover:text-bright-gold transition-colors';
            button.innerHTML = '<i class="fa-solid fa-location-crosshairs text-sm"></i>';
            button.title = 'Use current location';
            
            button.addEventListener('click', () => {
                if ('geolocation' in navigator) {
                    button.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-sm"></i>';
                    
                    navigator.geolocation.getCurrentPosition((position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        if (typeof google !== 'undefined') {
                            const geocoder = new google.maps.Geocoder();
                            geocoder.geocode({
                                location: { lat, lng }
                            }, (results, status) => {
                                button.innerHTML = '<i class="fa-solid fa-location-crosshairs text-sm"></i>';
                                
                                if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                                    (startInput as HTMLInputElement).value = results[0].formatted_address;
                                    updateOriginMarker(new google.maps.LatLng(lat, lng), 'Current Location');
                                    showNotification('Current location detected', 'success');
                                } else {
                                    showNotification('Could not determine address from location', 'error');
                                }
                            });
                        }
                    }, (_error) => {
                        button.innerHTML = '<i class="fa-solid fa-location-crosshairs text-sm"></i>';
                        showNotification('Location access denied or unavailable', 'error');
                    });
                } else {
                    showNotification('Geolocation not supported by this browser', 'error');
                }
            });
            
            container.appendChild(button);
        }
    }
}

// ── Street View Functions ────────────────────────────────────────────

function addStreetViewToMarker(marker: google.maps.Marker, _position: google.maps.LatLngLiteral) {
    // Right-click opens Street View at the marker's CURRENT position
    marker.addListener('rightclick', () => {
        const pos = marker.getPosition();
        if (!pos) return;
        openStreetViewAt({ lat: pos.lat(), lng: pos.lng() });
    });

    // Double-click also opens Street View
    marker.addListener('dblclick', () => {
        const pos = marker.getPosition();
        if (!pos) return;
        openStreetViewAt({ lat: pos.lat(), lng: pos.lng() });
    });
}

function openStreetViewAt(position: google.maps.LatLngLiteral) {
    if (!streetViewService || !googleMap) return;

    // Check if Street View imagery exists near this position
    streetViewService.getPanorama(
        { location: position, radius: 1000, source: google.maps.StreetViewSource.DEFAULT },
        (data, status) => {
            if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                // Found coverage — open the built-in Street View panorama
                const pano = googleMap!.getStreetView();
                pano.setPosition(data.location.latLng);
                pano.setPov({ heading: 0, pitch: 0 });
                pano.setVisible(true);
                showNotification('Street View opened. Click the X or press Esc to return.', 'success');
            } else {
                showNotification('No Street View coverage at this location.', 'error');
            }
        },
    );
}

// ── Weather API Integration ──────────────────────────────────────────

interface WeatherData {
    main: { temp: number; feels_like: number; humidity: number };
    weather: { description: string; icon: string; main: string }[];
    wind: { speed: number };
    visibility: number;
    name: string;
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
    try {
        const res = await fetch(`${apiBase}/api/weather?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
        const data = await res.json();
        return data.success ? data.weather : null;
    } catch (err) {
        console.error('[EVBharat] Weather fetch error:', err);
        return null;
    }
}

function getWeatherAdvisory(weather: WeatherData): { text: string; icon: string; color: string } {
    const temp = weather.main.temp;
    const condition = weather.weather[0]?.main?.toLowerCase() ?? '';
    const wind = Math.round(weather.wind.speed * 3.6);

    // EV-specific advisories
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
        return {
            text: 'Rainy conditions — reduced traction. Drive cautiously, regenerative braking may be less effective on wet roads.',
            icon: 'fa-cloud-showers-heavy',
            color: 'text-blue-400'
        };
    }
    if (condition.includes('snow') || condition.includes('sleet')) {
        return {
            text: 'Snow/ice possible — battery range reduced by ~20-30%. Pre-condition cabin before departure.',
            icon: 'fa-snowflake',
            color: 'text-cyan-300'
        };
    }
    if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
        return {
            text: 'Low visibility — use fog lights. Maintain safe following distance.',
            icon: 'fa-smog',
            color: 'text-gray-300'
        };
    }
    if (temp > 40) {
        return {
            text: 'Extreme heat — A/C load will reduce range by ~15%. Battery cooling active.',
            icon: 'fa-temperature-arrow-up',
            color: 'text-red-400'
        };
    }
    if (temp > 35) {
        return {
            text: 'High temperature — expect slightly reduced range due to cabin cooling.',
            icon: 'fa-sun',
            color: 'text-orange-400'
        };
    }
    if (temp < 5) {
        return {
            text: 'Cold weather — battery range reduced ~15-25%. Pre-heat cabin while plugged in.',
            icon: 'fa-temperature-arrow-down',
            color: 'text-blue-300'
        };
    }
    if (wind > 40) {
        return {
            text: `Strong winds (${wind} km/h) — increased energy consumption, especially on highways.`,
            icon: 'fa-wind',
            color: 'text-cyan-400'
        };
    }
    return {
        text: 'Good driving conditions — optimal battery performance expected.',
        icon: 'fa-check-circle',
        color: 'text-green-400'
    };
}

function getEVWeatherImpact(originWeather: WeatherData | null, destWeather: WeatherData | null): string[] {
    const impacts: string[] = [];

    const avgTemp = ((originWeather?.main.temp ?? 25) + (destWeather?.main.temp ?? 25)) / 2;
    const maxWind = Math.max(
        Math.round((originWeather?.wind.speed ?? 0) * 3.6),
        Math.round((destWeather?.wind.speed ?? 0) * 3.6)
    );

    // Range impact
    let rangeImpact = 0;
    if (avgTemp < 5) rangeImpact = -20;
    else if (avgTemp < 15) rangeImpact = -10;
    else if (avgTemp > 40) rangeImpact = -15;
    else if (avgTemp > 35) rangeImpact = -8;

    if (maxWind > 30) rangeImpact -= 5;

    const hasRain = [originWeather, destWeather].some(w =>
        w?.weather[0]?.main?.toLowerCase().includes('rain') ||
        w?.weather[0]?.main?.toLowerCase().includes('thunderstorm')
    );
    if (hasRain) rangeImpact -= 5;

    if (rangeImpact !== 0) {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-battery-three-quarters ${rangeImpact < -10 ? 'text-red-400' : 'text-yellow-400'}"></i>
            <span class="text-gray-300">Range impact: <span class="font-bold ${rangeImpact < -10 ? 'text-red-400' : 'text-yellow-400'}">${rangeImpact}%</span> estimated</span>
        </div>`);
    } else {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-battery-full text-green-400"></i>
            <span class="text-gray-300">Range impact: <span class="font-bold text-green-400">Minimal</span></span>
        </div>`);
    }

    // Charging recommendation
    if (avgTemp < 10) {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-charging-station text-blue-400"></i>
            <span class="text-gray-300">Pre-heat battery before fast charging for optimal speed</span>
        </div>`);
    } else {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-charging-station text-green-400"></i>
            <span class="text-gray-300">Normal charging performance expected</span>
        </div>`);
    }

    // Driving tips
    if (hasRain) {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-road text-blue-400"></i>
            <span class="text-gray-300">Enable max regen braking for wet roads</span>
        </div>`);
    } else if (maxWind > 30) {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-wind text-cyan-400"></i>
            <span class="text-gray-300">Reduce highway speed to save ${Math.round(maxWind / 10)}% energy</span>
        </div>`);
    } else {
        impacts.push(`<div class="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-xs">
            <i class="fa-solid fa-leaf text-green-400"></i>
            <span class="text-gray-300">Ideal conditions for eco driving mode</span>
        </div>`);
    }

    return impacts;
}

function populateWeatherCard(prefix: string, weather: WeatherData, locationName: string) {
    const setTxt = (id: string, val: string) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setTxt(`weather-${prefix}-name`, locationName);
    setTxt(`weather-${prefix}-temp`, `${Math.round(weather.main.temp)}°C`);
    setTxt(`weather-${prefix}-desc`, weather.weather[0]?.description ?? '');
    setTxt(`weather-${prefix}-feels`, String(Math.round(weather.main.feels_like)));
    setTxt(`weather-${prefix}-wind`, String(Math.round(weather.wind.speed * 3.6)));
    setTxt(`weather-${prefix}-humidity`, String(weather.main.humidity));
    setTxt(`weather-${prefix}-visibility`, String(Math.round((weather.visibility ?? 10000) / 1000)));

    const iconEl = document.getElementById(`weather-${prefix}-icon`) as HTMLImageElement;
    if (iconEl && weather.weather[0]?.icon) {
        iconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        iconEl.alt = weather.weather[0].description;
        iconEl.classList.remove('hidden');
    }

    const advisory = getWeatherAdvisory(weather);
    const advisoryEl = document.getElementById(`weather-${prefix}-advisory`);
    if (advisoryEl) {
        advisoryEl.innerHTML = `<i class="fa-solid ${advisory.icon} mr-1 ${advisory.color}"></i> ${advisory.text}`;
    }
}

async function fetchRouteWeather(
    originLat: number, originLng: number,
    destLat: number, destLng: number,
    originName: string, destName: string
) {
    const panel = document.getElementById('weather-panel');
    if (panel) panel.classList.remove('hidden');

    // Fetch both in parallel
    const [originWeather, destWeather] = await Promise.all([
        fetchWeather(originLat, originLng),
        fetchWeather(destLat, destLng)
    ]);

    if (originWeather) populateWeatherCard('origin', originWeather, originName);
    if (destWeather) populateWeatherCard('dest', destWeather, destName);

    // EV weather impact section
    const impactPanel = document.getElementById('weather-ev-impact');
    const impactItems = document.getElementById('weather-impact-items');
    if (impactPanel && impactItems && (originWeather || destWeather)) {
        const impacts = getEVWeatherImpact(originWeather, destWeather);
        impactItems.innerHTML = impacts.join('');
        impactPanel.classList.remove('hidden');
    }
}

// ── Dynamic Route Options ────────────────────────────────────────────

function updateRouteOptions(distanceKm: number, durationText: string) {
    const routeOptions = document.getElementById('route-options');
    if (!routeOptions) return;

    // Parse duration text to minutes for calculation
    const durationMins = parseDurationToMinutes(durationText);

    // Generate three route variants from real data
    const ecoDistance = distanceKm + Math.round(distanceKm * 0.05);     // 5% longer
    const ecoDuration = Math.round(durationMins * 1.12);                // 12% more time
    const ecoEnergy = Math.round(ecoDistance * 0.16);                   // more efficient kWh/km

    const fastDistance = distanceKm;
    const fastDuration = durationMins;
    const fastEnergy = Math.round(fastDistance * 0.19);

    const scenicDistance = distanceKm + Math.round(distanceKm * 0.15);  // 15% longer
    const scenicDuration = Math.round(durationMins * 1.32);
    const scenicEnergy = Math.round(scenicDistance * 0.20);

    const currentRange = 392;
    const calcStops = (d: number) => d > currentRange ? Math.ceil((d - currentRange) / 300) : 0;

    const routes = [
        { name: 'Energy Efficient', distance: ecoDistance, duration: formatMinutes(ecoDuration), energy: ecoEnergy, stops: calcStops(ecoDistance), traffic: 'low' as 'low' | 'medium' | 'high', recommended: true },
        { name: 'Fastest Route', distance: fastDistance, duration: formatMinutes(fastDuration), energy: fastEnergy, stops: calcStops(fastDistance), traffic: 'high' as 'low' | 'medium' | 'high', recommended: false },
        { name: 'Scenic Route', distance: scenicDistance, duration: formatMinutes(scenicDuration), energy: scenicEnergy, stops: calcStops(scenicDistance), traffic: 'low' as 'low' | 'medium' | 'high', recommended: false },
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
                <span><i class="fa-solid fa-bolt mr-1"></i>${route.energy} kWh</span>
                <span><i class="fa-solid fa-charging-station mr-1"></i>${route.stops} stops</span>
                <span class="${route.traffic === 'low' ? 'text-green-400' : route.traffic === 'medium' ? 'text-yellow-400' : 'text-red-400'}">
                    <i class="fa-solid fa-traffic-light mr-1"></i>${route.traffic}
                </span>
            </div>
        </div>
    `).join('');

    // Re-attach click handlers
    routeOptions.querySelectorAll('.route-option').forEach(opt => {
        opt.addEventListener('click', () => {
            routeOptions.querySelectorAll('.route-option').forEach(o => {
                o.classList.remove('border-pagani-gold', 'ring-2', 'ring-pagani-gold/30');
                o.classList.add('border-pagani-gold/20');
            });
            opt.classList.remove('border-pagani-gold/20');
            opt.classList.add('border-pagani-gold', 'ring-2', 'ring-pagani-gold/30');
        });
    });
}

function parseDurationToMinutes(text: string): number {
    let mins = 0;
    const hMatch = text.match(/(\d+)\s*h/i);
    const mMatch = text.match(/(\d+)\s*m/i);
    if (hMatch) mins += parseInt(hMatch[1]) * 60;
    if (mMatch) mins += parseInt(mMatch[1]);
    return mins || 60;
}

function formatMinutes(totalMins: number): string {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
}
