import { authService } from '../utils/auth';

interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    category: 'battery' | 'safety' | 'v2e' | 'emergency' | 'maintenance' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionable: boolean;
    action?: string;
}

export async function renderAlertPage() {
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
        <!-- Alerts Page -->
        <div class="min-h-screen bg-pagani-black pt-24 pb-12">
            <!-- Header Section -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-bell text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Alert Center</h1>
                        </div>
                        <p class="text-gray-400">Real-time Alerts, Safety Notifications & Emergency Response</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="mark-all-read" class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-sm font-orbitron hover:bg-pagani-gold hover:text-black transition-all">
                            <i class="fa-solid fa-check-double mr-2"></i>Mark All Read
                        </button>
                        <button id="alert-settings" class="px-4 py-2 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white text-sm hover:border-pagani-gold transition-all">
                            <i class="fa-solid fa-gear"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Alert Stats -->
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-gradient-to-br from-red-500/20 to-red-900/10 border border-red-500/30 rounded-xl p-4 fade-in-section">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-red-400 uppercase tracking-wider">Critical</p>
                                <p class="text-3xl font-orbitron font-bold text-red-400" id="critical-count">1</p>
                            </div>
                            <i class="fa-solid fa-circle-exclamation text-3xl text-red-500/50"></i>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-yellow-500/20 to-yellow-900/10 border border-yellow-500/30 rounded-xl p-4 fade-in-section" style="animation-delay: 50ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-yellow-400 uppercase tracking-wider">Warnings</p>
                                <p class="text-3xl font-orbitron font-bold text-yellow-400" id="warning-count">3</p>
                            </div>
                            <i class="fa-solid fa-triangle-exclamation text-3xl text-yellow-500/50"></i>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-500/20 to-blue-900/10 border border-blue-500/30 rounded-xl p-4 fade-in-section" style="animation-delay: 100ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-blue-400 uppercase tracking-wider">Info</p>
                                <p class="text-3xl font-orbitron font-bold text-blue-400" id="info-count">5</p>
                            </div>
                            <i class="fa-solid fa-circle-info text-3xl text-blue-500/50"></i>
                        </div>
                    </div>
                    <div class="bg-gradient-to-br from-green-500/20 to-green-900/10 border border-green-500/30 rounded-xl p-4 fade-in-section" style="animation-delay: 150ms">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs text-green-400 uppercase tracking-wider">Resolved</p>
                                <p class="text-3xl font-orbitron font-bold text-green-400" id="resolved-count">12</p>
                            </div>
                            <i class="fa-solid fa-circle-check text-3xl text-green-500/50"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main Alerts List -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Filter Tabs -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section">
                            <div class="flex flex-wrap gap-2">
                                <button class="alert-filter active px-4 py-2 bg-pagani-gold text-black text-sm font-orbitron rounded-lg transition-all" data-filter="all">
                                    All Alerts
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="battery">
                                    <i class="fa-solid fa-car-battery mr-1"></i> Battery
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="safety">
                                    <i class="fa-solid fa-shield-halved mr-1"></i> Safety
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="v2e">
                                    <i class="fa-solid fa-tower-broadcast mr-1"></i> V2E
                                </button>
                                <button class="alert-filter px-4 py-2 bg-pagani-black/50 border border-pagani-gold/20 text-white text-sm font-orbitron rounded-lg hover:border-pagani-gold transition-all" data-filter="emergency">
                                    <i class="fa-solid fa-truck-medical mr-1"></i> Emergency
                                </button>
                            </div>
                        </div>

                        <!-- Alerts List -->
                        <div class="space-y-4" id="alerts-list">
                            <!-- Alerts will be populated by JS -->
                        </div>
                    </div>

                    <!-- Right Sidebar -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Emergency SOS Panel -->
                        <div class="bg-gradient-to-br from-red-900/30 to-pagani-black border border-red-500/30 rounded-xl p-6 fade-in-section">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2 text-red-400">
                                <i class="fa-solid fa-truck-medical"></i>
                                Emergency SOS
                            </h3>
                            <p class="text-sm text-gray-400 mb-4">
                                Automatic emergency detection with crash sensors. Manual trigger available for immediate assistance.
                            </p>
                            <button id="sos-btn" class="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold rounded-lg transition-all uppercase tracking-wider animate-pulse">
                                <i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS
                            </button>
                            <p class="text-xs text-gray-500 text-center mt-3">
                                <i class="fa-solid fa-info-circle mr-1"></i>
                                Press and hold for 3 seconds to activate
                            </p>
                        </div>

                        <!-- V2E Communication Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 100ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-tower-broadcast text-pagani-gold"></i>
                                V2E Communication
                            </h3>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-lightbulb text-yellow-400"></i>
                                        <span class="text-sm">VLC Module</span>
                                    </div>
                                    <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Active</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-car text-blue-400"></i>
                                        <span class="text-sm">Nearby Vehicles</span>
                                    </div>
                                    <span class="text-sm font-orbitron text-pagani-gold">3</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-traffic-light text-red-400"></i>
                                        <span class="text-sm">Traffic Signals</span>
                                    </div>
                                    <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Connected</span>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="fa-solid fa-road text-purple-400"></i>
                                        <span class="text-sm">Road Sensors</span>
                                    </div>
                                    <span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Partial</span>
                                </div>
                            </div>
                        </div>

                        <!-- Sensor Status -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 150ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-microchip text-pagani-gold"></i>
                                Safety Sensors
                            </h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Accelerometer</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Vibration Sensor</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Impact Detector</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Obstacle Radar</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-400">Temperature Monitor</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span class="text-xs text-green-400">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p class="text-xs text-green-400">
                                    <i class="fa-solid fa-shield-check mr-1"></i>
                                    All safety systems operational
                                </p>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 200ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-bolt text-pagani-gold"></i>
                                Quick Actions
                            </h3>
                            <div class="grid grid-cols-2 gap-3">
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-phone text-green-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Call Support</p>
                                </button>
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-location-crosshairs text-blue-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Share Location</p>
                                </button>
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-car-burst text-red-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Report Accident</p>
                                </button>
                                <button class="p-3 bg-pagani-black/50 border border-pagani-gold/20 rounded-lg text-center hover:border-pagani-gold transition-all">
                                    <i class="fa-solid fa-wrench text-yellow-400 text-xl mb-2"></i>
                                    <p class="text-xs text-gray-400">Request Help</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize alerts page functionality
    setTimeout(() => {
        initializeAlertPage();
    }, 100);
}

function initializeAlertPage() {
    // Sample alerts data
    const alerts: Alert[] = [
        {
            id: '1',
            type: 'critical',
            category: 'battery',
            title: 'Battery Cell Degradation Detected',
            message: 'Cell #67 showing abnormal degradation (72% health). Recommend immediate inspection to prevent further battery pack damage.',
            timestamp: '10 minutes ago',
            read: false,
            actionable: true,
            action: 'Schedule Service'
        },
        {
            id: '2',
            type: 'warning',
            category: 'battery',
            title: 'High Battery Temperature',
            message: 'Battery temperature reached 42°C during fast charging. Reduced charging speed to protect battery longevity.',
            timestamp: '25 minutes ago',
            read: false,
            actionable: false
        },
        {
            id: '3',
            type: 'warning',
            category: 'safety',
            title: 'Lane Departure Warning',
            message: 'Multiple lane departures detected in the last trip. Driver attention monitoring activated.',
            timestamp: '1 hour ago',
            read: false,
            actionable: false
        },
        {
            id: '4',
            type: 'info',
            category: 'v2e',
            title: 'V2E Connection Established',
            message: 'Successfully connected to nearby traffic infrastructure via VLC. Real-time traffic signal data now available.',
            timestamp: '1 hour ago',
            read: true,
            actionable: false
        },
        {
            id: '5',
            type: 'warning',
            category: 'safety',
            title: 'Obstacle Detected Ahead',
            message: 'Stationary vehicle detected 200m ahead on NH-48. Proceed with caution.',
            timestamp: '2 hours ago',
            read: true,
            actionable: false
        },
        {
            id: '6',
            type: 'info',
            category: 'v2e',
            title: 'Emergency Vehicle Approaching',
            message: 'V2E alert: Ambulance approaching from rear. Please make way.',
            timestamp: '3 hours ago',
            read: true,
            actionable: false
        },
        {
            id: '7',
            type: 'success',
            category: 'battery',
            title: 'Charging Complete',
            message: 'Battery fully charged to 100%. Total energy added: 58 kWh. Ready for 450 km range.',
            timestamp: '4 hours ago',
            read: true,
            actionable: false
        },
        {
            id: '8',
            type: 'info',
            category: 'maintenance',
            title: 'Scheduled Maintenance Reminder',
            message: 'Your vehicle is due for scheduled maintenance in 45 days. Book your service appointment.',
            timestamp: '1 day ago',
            read: true,
            actionable: true,
            action: 'Book Now'
        },
        {
            id: '9',
            type: 'info',
            category: 'system',
            title: 'Software Update Available',
            message: 'EVBharat OS v3.2.1 is available. Includes improved battery management and new V2E features.',
            timestamp: '2 days ago',
            read: true,
            actionable: true,
            action: 'Update Now'
        }
    ];

    renderAlerts(alerts);
    setupFilterListeners();
    setupSOSButton();
    setupMarkAllRead(alerts);
}

function renderAlerts(alerts: Alert[]) {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;

    const getTypeStyles = (type: Alert['type']) => {
        switch (type) {
            case 'critical':
                return { bg: 'from-red-900/30 to-red-900/10', border: 'border-red-500/50', icon: 'fa-circle-exclamation', iconColor: 'text-red-400' };
            case 'warning':
                return { bg: 'from-yellow-900/30 to-yellow-900/10', border: 'border-yellow-500/50', icon: 'fa-triangle-exclamation', iconColor: 'text-yellow-400' };
            case 'info':
                return { bg: 'from-blue-900/30 to-blue-900/10', border: 'border-blue-500/50', icon: 'fa-circle-info', iconColor: 'text-blue-400' };
            case 'success':
                return { bg: 'from-green-900/30 to-green-900/10', border: 'border-green-500/50', icon: 'fa-circle-check', iconColor: 'text-green-400' };
        }
    };

    const getCategoryIcon = (category: Alert['category']) => {
        switch (category) {
            case 'battery': return 'fa-car-battery';
            case 'safety': return 'fa-shield-halved';
            case 'v2e': return 'fa-tower-broadcast';
            case 'emergency': return 'fa-truck-medical';
            case 'maintenance': return 'fa-wrench';
            case 'system': return 'fa-gear';
        }
    };

    alertsList.innerHTML = alerts.map((alert, index) => {
        const styles = getTypeStyles(alert.type);
        const categoryIcon = getCategoryIcon(alert.category);
        
        return `
            <div class="alert-item bg-gradient-to-br ${styles.bg} border ${styles.border} rounded-xl p-5 fade-in-section ${!alert.read ? 'ring-2 ring-white/10' : ''}" 
                 data-category="${alert.category}" style="animation-delay: ${index * 50}ms">
                <div class="flex items-start gap-4">
                    <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full ${styles.bg} border ${styles.border} flex items-center justify-center">
                            <i class="fa-solid ${styles.icon} text-xl ${styles.iconColor}"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-pagani-black/50 text-gray-400 text-xs rounded flex items-center gap-1">
                                <i class="fa-solid ${categoryIcon}"></i>
                                ${alert.category.toUpperCase()}
                            </span>
                            ${!alert.read ? '<span class="w-2 h-2 bg-pagani-gold rounded-full"></span>' : ''}
                        </div>
                        <h4 class="font-orbitron font-bold text-white mb-2">${alert.title}</h4>
                        <p class="text-sm text-gray-400 mb-3">${alert.message}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">
                                <i class="fa-solid fa-clock mr-1"></i>
                                ${alert.timestamp}
                            </span>
                            ${alert.actionable ? `
                                <button class="px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold text-xs font-orbitron hover:bg-pagani-gold hover:text-black transition-all">
                                    ${alert.action}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <button class="flex-shrink-0 p-2 text-gray-500 hover:text-white transition-all" title="Dismiss">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function setupFilterListeners() {
    const filterButtons = document.querySelectorAll('.alert-filter');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => {
                b.classList.remove('active', 'bg-pagani-gold', 'text-black');
                b.classList.add('bg-pagani-black/50', 'text-white');
            });
            btn.classList.add('active', 'bg-pagani-gold', 'text-black');
            btn.classList.remove('bg-pagani-black/50', 'text-white');

            // Filter alerts
            const filter = btn.getAttribute('data-filter');
            const alertItems = document.querySelectorAll('.alert-item');
            
            alertItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    (item as HTMLElement).style.display = 'block';
                } else {
                    (item as HTMLElement).style.display = 'none';
                }
            });
        });
    });
}

function setupSOSButton() {
    const sosBtn = document.getElementById('sos-btn');
    if (!sosBtn) return;

    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let isHolding = false;

    sosBtn.addEventListener('mousedown', () => {
        isHolding = true;
        sosBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin mr-2"></i> HOLD 3 SECONDS...';
        
        holdTimer = setTimeout(() => {
            if (isHolding) {
                sosBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> SOS ACTIVATED!';
                sosBtn.classList.remove('bg-red-600', 'hover:bg-red-500', 'animate-pulse');
                sosBtn.classList.add('bg-green-600');
                showEmergencyModal();
            }
        }, 3000);
    });

    sosBtn.addEventListener('mouseup', () => {
        isHolding = false;
        if (holdTimer) {
            clearTimeout(holdTimer);
            sosBtn.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS';
        }
    });

    sosBtn.addEventListener('mouseleave', () => {
        isHolding = false;
        if (holdTimer) {
            clearTimeout(holdTimer);
            sosBtn.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS';
        }
    });
}

function showEmergencyModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4 fade-in-section';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-red-900/50 to-pagani-black border border-red-500/50 rounded-xl p-8 max-w-md w-full text-center">
            <div class="w-20 h-20 mx-auto bg-red-500/20 border-4 border-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <i class="fa-solid fa-truck-medical text-4xl text-red-400"></i>
            </div>
            <h2 class="text-2xl font-orbitron font-bold text-red-400 mb-4">Emergency SOS Activated</h2>
            <p class="text-gray-400 mb-6">
                Your location has been shared with emergency services. Help is on the way.
            </p>
            <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                    <span class="text-sm text-gray-400">Location Shared</span>
                    <span class="text-green-400"><i class="fa-solid fa-check"></i></span>
                </div>
                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                    <span class="text-sm text-gray-400">Emergency Contacts Notified</span>
                    <span class="text-green-400"><i class="fa-solid fa-check"></i></span>
                </div>
                <div class="flex items-center justify-between p-3 bg-pagani-black/50 rounded-lg">
                    <span class="text-sm text-gray-400">Nearby Vehicles Alerted (V2E)</span>
                    <span class="text-green-400"><i class="fa-solid fa-check"></i></span>
                </div>
            </div>
            <button id="cancel-sos" class="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-orbitron rounded-lg transition-all">
                Cancel SOS
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);

    const cancelBtn = modal.querySelector('#cancel-sos');
    cancelBtn?.addEventListener('click', () => {
        modal.remove();
        const sosBtn = document.getElementById('sos-btn');
        if (sosBtn) {
            sosBtn.innerHTML = '<i class="fa-solid fa-circle-exclamation mr-2"></i> EMERGENCY SOS';
            sosBtn.classList.remove('bg-green-600');
            sosBtn.classList.add('bg-red-600', 'hover:bg-red-500', 'animate-pulse');
        }
    });
}

function setupMarkAllRead(alerts: Alert[]) {
    const markAllBtn = document.getElementById('mark-all-read');
    markAllBtn?.addEventListener('click', () => {
        alerts.forEach(a => a.read = true);
        document.querySelectorAll('.alert-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-white/10');
        });
        document.querySelectorAll('.alert-item .w-2.h-2.bg-pagani-gold').forEach(dot => {
            dot.remove();
        });
        showNotification('All alerts marked as read', 'success');
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
