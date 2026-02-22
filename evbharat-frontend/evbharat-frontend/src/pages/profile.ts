import { authService } from '../utils/auth';
import { FormValidator } from '../utils/form-validator';

export function renderProfilePage() {
    const user = authService.getCurrentUser();
    
    if (!user) {
        window.location.href = '/auth';
        return;
    }

    const app = document.getElementById('app')!;
    
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-pagani-black via-gray-900 to-pagani-black pt-24 pb-16">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Profile Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-5xl font-bold font-orbitron text-white mb-4">
                        User <span class="text-pagani-gold">Profile</span>
                    </h1>
                    <p class="text-xl text-gray-300">Manage your account information</p>
                    <div class="w-24 h-1 bg-gradient-to-r from-pagani-gold to-yellow-600 mx-auto mt-4"></div>
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Profile Sidebar -->
                    <div class="lg:col-span-1">
                        <div class="bg-pagani-black/60 backdrop-blur-lg border border-pagani-gold/20 rounded-2xl p-8 text-center">
                            <!-- Profile Avatar -->
                            <div class="relative mx-auto w-32 h-32 mb-6">
                                <div class="w-full h-full rounded-full bg-gradient-to-br from-pagani-gold/30 to-pagani-gold/10 border-4 border-pagani-gold/50 flex items-center justify-center">
                                    <i class="fa-solid fa-user text-4xl text-pagani-gold"></i>
                                </div>
                                <button id="change-avatar-btn" class="absolute bottom-0 right-0 w-10 h-10 bg-pagani-gold hover:bg-yellow-500 rounded-full flex items-center justify-center text-black transition-all duration-300">
                                    <i class="fa-solid fa-camera text-sm"></i>
                                </button>
                            </div>

                            <!-- User Info -->
                            <h2 class="text-2xl font-bold text-white mb-2">${user.name}</h2>
                            <p class="text-pagani-gold mb-4">${user.email}</p>
                            <div class="inline-flex items-center gap-2 px-4 py-2 bg-pagani-gold/20 border border-pagani-gold/30 rounded-lg">
                                <i class="fa-solid fa-crown text-pagani-gold text-sm"></i>
                                <span class="text-sm font-medium text-pagani-gold uppercase">${user.role}</span>
                            </div>

                            <!-- Quick Stats -->
                            <div class="mt-8 pt-8 border-t border-pagani-gold/20">
                                <h3 class="text-lg font-semibold text-white mb-4">Account Stats</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-pagani-gold">847</div>
                                        <div class="text-sm text-gray-400">Miles Driven</div>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-pagani-gold">23</div>
                                        <div class="text-sm text-gray-400">Trips</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Form -->
                    <div class="lg:col-span-2">
                        <div class="bg-pagani-black/60 backdrop-blur-lg border border-pagani-gold/20 rounded-2xl p-8">
                            <!-- Tab Navigation -->
                            <div class="flex flex-wrap gap-2 mb-8 border-b border-pagani-gold/20">
                                <button class="profile-tab active" data-tab="personal">
                                    <i class="fa-solid fa-user mr-2"></i>Personal Info
                                </button>
                                <button class="profile-tab" data-tab="security">
                                    <i class="fa-solid fa-shield-halved mr-2"></i>Security
                                </button>
                                <button class="profile-tab" data-tab="preferences">
                                    <i class="fa-solid fa-cog mr-2"></i>Preferences
                                </button>
                                <button class="profile-tab" data-tab="vehicle">
                                    <i class="fa-solid fa-car mr-2"></i>Vehicle Info
                                </button>
                            </div>

                            <!-- Success/Error Messages -->
                            <div id="profile-message" class="hidden mb-6"></div>

                            <!-- Personal Information Tab -->
                            <div id="personal-tab" class="tab-content active">
                                <h3 class="text-2xl font-bold text-white mb-6">Personal Information</h3>
                                <form id="personal-form" class="space-y-6">
                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="firstName" class="form-label">First Name</label>
                                            <input type="text" id="firstName" name="firstName" class="form-input" value="${user.name.split(' ')[0] || ''}" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="lastName" class="form-label">Last Name</label>
                                            <input type="text" id="lastName" name="lastName" class="form-input" value="${user.name.split(' ')[1] || ''}" required>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" id="email" name="email" class="form-input" value="${user.email}" required>
                                        <p class="text-sm text-gray-400 mt-1">We'll send a verification email if you change this</p>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="phone" class="form-label">Phone Number</label>
                                            <input type="tel" id="phone" name="phone" class="form-input" placeholder="+91 98765 43210">
                                        </div>
                                        <div class="form-group">
                                            <label for="dateOfBirth" class="form-label">Date of Birth</label>
                                            <input type="date" id="dateOfBirth" name="dateOfBirth" class="form-input">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="address" class="form-label">Address</label>
                                        <textarea id="address" name="address" class="form-input" rows="3" placeholder="Enter your full address"></textarea>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="city" class="form-label">City</label>
                                            <input type="text" id="city" name="city" class="form-input" placeholder="Mumbai">
                                        </div>
                                        <div class="form-group">
                                            <label for="state" class="form-label">State</label>
                                            <select id="state" name="state" class="form-input">
                                                <option value="">Select State</option>
                                                <option value="maharashtra">Maharashtra</option>
                                                <option value="delhi">Delhi</option>
                                                <option value="karnataka">Karnataka</option>
                                                <option value="tamil-nadu">Tamil Nadu</option>
                                                <option value="gujarat">Gujarat</option>
                                                <option value="rajasthan">Rajasthan</option>
                                                <option value="west-bengal">West Bengal</option>
                                                <option value="uttar-pradesh">Uttar Pradesh</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-save mr-2"></i>Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Security Tab -->
                            <div id="security-tab" class="tab-content hidden">
                                <h3 class="text-2xl font-bold text-white mb-6">Security Settings</h3>
                                <form id="security-form" class="space-y-6">
                                    <div class="form-group">
                                        <label for="currentPassword" class="form-label">Current Password</label>
                                        <div class="relative">
                                            <input type="password" id="currentPassword" name="currentPassword" class="form-input pr-12" required>
                                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pagani-gold" onclick="togglePassword('currentPassword')">
                                                <i class="fa-solid fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="newPassword" class="form-label">New Password</label>
                                        <div class="relative">
                                            <input type="password" id="newPassword" name="newPassword" class="form-input pr-12" required>
                                            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pagani-gold" onclick="togglePassword('newPassword')">
                                                <i class="fa-solid fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="mt-2">
                                            <div class="text-sm text-gray-400 mb-2">Password strength:</div>
                                            <div class="w-full bg-gray-700 rounded-full h-2">
                                                <div id="password-strength" class="bg-red-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                        <input type="password" id="confirmPassword" name="confirmPassword" class="form-input" required>
                                    </div>

                                    <!-- Two-Factor Authentication -->
                                    <div class="bg-pagani-gold/10 border border-pagani-gold/20 rounded-lg p-6">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <h4 class="text-lg font-semibold text-white">Two-Factor Authentication</h4>
                                                <p class="text-sm text-gray-400">Add an extra layer of security to your account</p>
                                            </div>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="twoFactor">
                                                <span class="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-shield-halved mr-2"></i>Update Security
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Preferences Tab -->
                            <div id="preferences-tab" class="tab-content hidden">
                                <h3 class="text-2xl font-bold text-white mb-6">Preferences</h3>
                                <form id="preferences-form" class="space-y-6">
                                    <!-- Notification Settings -->
                                    <div class="space-y-4">
                                        <h4 class="text-lg font-semibold text-white">Notifications</h4>
                                        <div class="space-y-3">
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-white">Email Notifications</div>
                                                    <div class="text-sm text-gray-400">Receive updates via email</div>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="emailNotifications" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-white">Battery Alerts</div>
                                                    <div class="text-sm text-gray-400">Get notified about battery status</div>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="batteryAlerts" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <div>
                                                    <div class="text-white">Maintenance Reminders</div>
                                                    <div class="text-sm text-gray-400">Periodic maintenance notifications</div>
                                                </div>
                                                <label class="toggle-switch">
                                                    <input type="checkbox" id="maintenanceAlerts" checked>
                                                    <span class="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Units Settings -->
                                    <div class="space-y-4">
                                        <h4 class="text-lg font-semibold text-white">Units & Display</h4>
                                        <div class="grid md:grid-cols-2 gap-6">
                                            <div class="form-group">
                                                <label for="distanceUnit" class="form-label">Distance Unit</label>
                                                <select id="distanceUnit" name="distanceUnit" class="form-input">
                                                    <option value="km">Kilometers</option>
                                                    <option value="miles">Miles</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label for="temperatureUnit" class="form-label">Temperature Unit</label>
                                                <select id="temperatureUnit" name="temperatureUnit" class="form-input">
                                                    <option value="celsius">Celsius (°C)</option>
                                                    <option value="fahrenheit">Fahrenheit (°F)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Language Settings -->
                                    <div class="form-group">
                                        <label for="language" class="form-label">Language</label>
                                        <select id="language" name="language" class="form-input">
                                            <option value="en">English</option>
                                            <option value="hi">हिन्दी (Hindi)</option>
                                            <option value="mr">मराठी (Marathi)</option>
                                            <option value="ta">தமிழ் (Tamil)</option>
                                            <option value="te">తెలుగు (Telugu)</option>
                                        </select>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-cog mr-2"></i>Save Preferences
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <!-- Vehicle Info Tab -->
                            <div id="vehicle-tab" class="tab-content hidden">
                                <h3 class="text-2xl font-bold text-white mb-6">Vehicle Information</h3>
                                <form id="vehicle-form" class="space-y-6">
                                    <div class="form-group">
                                        <label for="vehicleMake" class="form-label">Make</label>
                                        <select id="vehicleMake" name="vehicleMake" class="form-input">
                                            <option value="">Select Make</option>
                                            <option value="tata">Tata Motors</option>
                                            <option value="mahindra">Mahindra</option>
                                            <option value="hyundai">Hyundai</option>
                                            <option value="mg">MG Motor</option>
                                            <option value="kia">Kia</option>
                                            <option value="tesla">Tesla</option>
                                            <option value="bmw">BMW</option>
                                            <option value="audi">Audi</option>
                                        </select>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="vehicleModel" class="form-label">Model</label>
                                            <input type="text" id="vehicleModel" name="vehicleModel" class="form-input" placeholder="e.g., Nexon EV">
                                        </div>
                                        <div class="form-group">
                                            <label for="vehicleYear" class="form-label">Year</label>
                                            <select id="vehicleYear" name="vehicleYear" class="form-input">
                                                <option value="">Select Year</option>
                                                ${Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(year => 
                                                    `<option value="${year}">${year}</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                    </div>

                                    <div class="grid md:grid-cols-2 gap-6">
                                        <div class="form-group">
                                            <label for="batteryCapacity" class="form-label">Battery Capacity (kWh)</label>
                                            <input type="number" id="batteryCapacity" name="batteryCapacity" class="form-input" placeholder="40.5" step="0.1">
                                        </div>
                                        <div class="form-group">
                                            <label for="range" class="form-label">Range (km)</label>
                                            <input type="number" id="range" name="range" class="form-input" placeholder="312">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="chargingType" class="form-label">Charging Type</label>
                                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="type1">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-plug text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">Type 1</div>
                                                </div>
                                            </label>
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="type2">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-plug-circle-plus text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">Type 2</div>
                                                </div>
                                            </label>
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="ccs">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-bolt text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">CCS</div>
                                                </div>
                                            </label>
                                            <label class="charging-option">
                                                <input type="checkbox" name="chargingType" value="chademo">
                                                <div class="charging-card">
                                                    <i class="fa-solid fa-charging-station text-2xl text-pagani-gold mb-2"></i>
                                                    <div class="text-sm">CHAdeMO</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="vehicleNotes" class="form-label">Additional Notes</label>
                                        <textarea id="vehicleNotes" name="vehicleNotes" class="form-input" rows="3" placeholder="Any additional information about your vehicle..."></textarea>
                                    </div>

                                    <div class="flex justify-end">
                                        <button type="submit" class="btn-primary">
                                            <i class="fa-solid fa-car mr-2"></i>Save Vehicle Info
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize profile functionality
    initializeProfilePage();
}

function initializeProfilePage() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = (tab as HTMLElement).dataset.tab;

            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.classList.remove('hidden');
            }
        });
    });

    // Form validation setup
    const personalValidator = new FormValidator();
    personalValidator.addRule('firstName', { required: true, minLength: 2 });
    personalValidator.addRule('lastName', { required: true, minLength: 2 });
    personalValidator.addRule('email', { required: true, email: true });
    personalValidator.addRule('phone', { phone: true });

    const securityValidator = new FormValidator();
    securityValidator.addRule('currentPassword', { required: true, minLength: 6 });
    securityValidator.addRule('newPassword', { required: true, minLength: 8 });
    securityValidator.addRule('confirmPassword', { required: true });

    // Form submission handlers
    setupFormHandlers(personalValidator, securityValidator);
    
    // Password strength checker
    setupPasswordStrengthChecker();
    
    // Avatar change handler
    setupAvatarHandler();

    // Load saved profile data from backend
    loadProfileData();
}

async function loadProfileData() {
    const result = await authService.fetchProfile();
    if (!result.success || !result.data) return;

    const { profile, preferences, vehicle } = result.data;

    // Personal fields
    const setVal = (id: string, val: string | undefined | null) => {
        const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
        if (el && val) el.value = val;
    };

    if (profile) {
        setVal('phone', profile.phone);
        setVal('dateOfBirth', profile.date_of_birth);
        setVal('address', profile.address);
        setVal('city', profile.city);
        setVal('state', profile.state);
    }

    // Preferences
    if (preferences) {
        const setChecked = (id: string, val: boolean) => {
            const el = document.getElementById(id) as HTMLInputElement | null;
            if (el) el.checked = val;
        };
        setChecked('emailNotifications', preferences.emailNotifications);
        setChecked('batteryAlerts', preferences.batteryAlerts);
        setChecked('maintenanceAlerts', preferences.maintenanceAlerts);
        setChecked('twoFactor', preferences.twoFactorEnabled);
        setVal('distanceUnit', preferences.distanceUnit);
        setVal('temperatureUnit', preferences.temperatureUnit);
        setVal('language', preferences.language);
    }

    // Vehicle
    if (vehicle) {
        setVal('vehicleMake', vehicle.make);
        setVal('vehicleModel', vehicle.model);
        setVal('vehicleYear', vehicle.year?.toString());
        setVal('batteryCapacity', vehicle.batteryCapacity?.toString());
        setVal('range', vehicle.rangeKm?.toString());
        setVal('vehicleNotes', vehicle.notes);

        if (Array.isArray(vehicle.chargingTypes)) {
            vehicle.chargingTypes.forEach((type: string) => {
                const cb = document.querySelector<HTMLInputElement>(`input[name="chargingType"][value="${type}"]`);
                if (cb) cb.checked = true;
            });
        }
    }
}

function setupFormHandlers(personalValidator: FormValidator, securityValidator: FormValidator) {
    // Personal form handler
    const personalForm = document.getElementById('personal-form') as HTMLFormElement;
    personalForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(personalForm);
        const validation = personalValidator.validate(formData);
        
        if (!validation.isValid) {
            showMessage(validation.errors.join(', '), 'error');
            return;
        }

        showMessage('Processing...', 'info');
        
        try {
            const result = await authService.updateProfile({
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                dateOfBirth: formData.get('dateOfBirth') as string,
                address: formData.get('address') as string,
                city: formData.get('city') as string,
                state: formData.get('state') as string
            });

            if (result.success) {
                showMessage(result.message, 'success');
                // Refresh page to reflect updated name/email in navbar
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showMessage(result.message, 'error');
            }
        } catch {
            showMessage('Failed to update information. Please try again.', 'error');
        }
    });

    // Security form handler
    const securityForm = document.getElementById('security-form') as HTMLFormElement;
    securityForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(securityForm);
        const validation = securityValidator.validate(formData);
        
        if (!validation.isValid) {
            showMessage(validation.errors.join(', '), 'error');
            return;
        }

        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        
        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        showMessage('Updating security settings...', 'info');
        
        try {
            const result = await authService.updatePassword(currentPassword, newPassword);
            if (result.success) {
                showMessage(result.message, 'success');
                securityForm.reset();
            } else {
                showMessage(result.message, 'error');
            }
        } catch {
            showMessage('Failed to update security settings. Please try again.', 'error');
        }
    });

    // Preferences form handler
    const preferencesForm = document.getElementById('preferences-form') as HTMLFormElement;
    preferencesForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage('Saving preferences...', 'info');
        
        try {
            const result = await authService.updatePreferences({
                emailNotifications: (document.getElementById('emailNotifications') as HTMLInputElement)?.checked ?? true,
                batteryAlerts: (document.getElementById('batteryAlerts') as HTMLInputElement)?.checked ?? true,
                maintenanceAlerts: (document.getElementById('maintenanceAlerts') as HTMLInputElement)?.checked ?? true,
                distanceUnit: (document.getElementById('distanceUnit') as HTMLSelectElement)?.value ?? 'km',
                temperatureUnit: (document.getElementById('temperatureUnit') as HTMLSelectElement)?.value ?? 'celsius',
                language: (document.getElementById('language') as HTMLSelectElement)?.value ?? 'en',
                twoFactorEnabled: (document.getElementById('twoFactor') as HTMLInputElement)?.checked ?? false
            });

            if (result.success) {
                showMessage(result.message, 'success');
            } else {
                showMessage(result.message, 'error');
            }
        } catch {
            showMessage('Failed to save preferences. Please try again.', 'error');
        }
    });

    // Vehicle form handler
    const vehicleForm = document.getElementById('vehicle-form') as HTMLFormElement;
    vehicleForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage('Saving vehicle information...', 'info');
        
        try {
            const chargingCheckboxes = vehicleForm.querySelectorAll<HTMLInputElement>('input[name="chargingType"]:checked');
            const chargingTypes = Array.from(chargingCheckboxes).map(cb => cb.value);

            const result = await authService.updateVehicle({
                make: (document.getElementById('vehicleMake') as HTMLSelectElement)?.value ?? '',
                model: (document.getElementById('vehicleModel') as HTMLInputElement)?.value ?? '',
                year: parseInt((document.getElementById('vehicleYear') as HTMLSelectElement)?.value) || null,
                batteryCapacity: parseFloat((document.getElementById('batteryCapacity') as HTMLInputElement)?.value) || null,
                rangeKm: parseFloat((document.getElementById('range') as HTMLInputElement)?.value) || null,
                chargingTypes,
                notes: (document.getElementById('vehicleNotes') as HTMLTextAreaElement)?.value ?? ''
            });

            if (result.success) {
                showMessage(result.message, 'success');
            } else {
                showMessage(result.message, 'error');
            }
        } catch {
            showMessage('Failed to save vehicle information. Please try again.', 'error');
        }
    });
}

function setupPasswordStrengthChecker() {
    const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
    const strengthBar = document.getElementById('password-strength');
    
    newPasswordInput?.addEventListener('input', (e) => {
        const password = (e.target as HTMLInputElement).value;
        const strength = calculatePasswordStrength(password);
        
        if (strengthBar) {
            strengthBar.style.width = `${strength.percentage}%`;
            strengthBar.className = `h-2 rounded-full transition-all duration-300 ${strength.colorClass}`;
        }
    });
}

function calculatePasswordStrength(password: string) {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    
    let colorClass = 'bg-red-500';
    if (score >= 75) colorClass = 'bg-green-500';
    else if (score >= 50) colorClass = 'bg-yellow-500';
    else if (score >= 25) colorClass = 'bg-orange-500';
    
    return {
        percentage: Math.min(100, score),
        colorClass
    };
}

function setupAvatarHandler() {
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    changeAvatarBtn?.addEventListener('click', () => {
        // In a real app, this would open a file picker or avatar selection modal
        showMessage('Avatar upload feature coming soon!', 'info');
    });
}

function showMessage(message: string, type: 'success' | 'error' | 'info') {
    const messageDiv = document.getElementById('profile-message');
    if (!messageDiv) return;
    
    const bgColor = type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                   type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                   'bg-blue-500/20 border-blue-500/30 text-blue-400';
    
    messageDiv.className = `mb-6 p-4 rounded-lg border ${bgColor}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
    }
}

// Global function for password toggle
(window as any).togglePassword = function(fieldId: string) {
    const field = document.getElementById(fieldId) as HTMLInputElement;
    const button = field?.nextElementSibling?.querySelector('i');
    
    if (field && button) {
        if (field.type === 'password') {
            field.type = 'text';
            button.className = 'fa-solid fa-eye-slash';
        } else {
            field.type = 'password';
            button.className = 'fa-solid fa-eye';
        }
    }
};