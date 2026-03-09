import { authService } from '../utils/auth';

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
    return password.length >= 8;
}

export async function renderAuthPage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Load Font Awesome if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    app.innerHTML = `
        <!-- Auth Page with Video Background - Ledgerly Inspired -->
        <style>
            .bg-video {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: -2;
                filter: brightness(0.3);
            }
            
            .auth-container {
                position: relative;
                width: 100%;
                max-width: 900px;
                min-height: 520px;
                background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(10, 10, 10, 0.98));
                border-radius: 20px;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.2);
                overflow: hidden;
                backdrop-filter: blur(20px);
            }
            
            .form-container {
                position: absolute;
                width: 50%;
                height: 100%;
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                transition: all 0.6s ease-in-out;
            }
            
            .login-container {
                left: 0;
                opacity: 1;
                z-index: 2;
            }
            
            .register-container {
                left: 0;
                opacity: 0;
                z-index: 1;
            }
            
            .overlay-container {
                position: absolute;
                top: 0;
                left: 50%;
                width: 50%;
                height: 100%;
                overflow: hidden;
                transition: transform 0.6s ease-in-out;
                z-index: 10;
            }
            
            .overlay {
                position: relative;
                background: linear-gradient(135deg, #d4af37, #f5d67b, #d4af37);
                height: 100%;
                width: 200%;
                left: -100%;
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
            
            .overlay-panel {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 40px;
                height: 100%;
                width: 50%;
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
            
            .overlay-left {
                transform: translateX(-20%);
            }
            
            .overlay-right {
                right: 0;
                transform: translateX(0);
            }
            
            /* Active state - Register mode */
            .auth-container.right-panel-active .login-container {
                transform: translateX(100%);
                opacity: 0;
                z-index: 1;
            }
            
            .auth-container.right-panel-active .register-container {
                transform: translateX(100%);
                opacity: 1;
                z-index: 5;
            }
            
            .auth-container.right-panel-active .overlay-container {
                transform: translateX(-100%);
            }
            
            .auth-container.right-panel-active .overlay {
                transform: translateX(50%);
            }
            
            .auth-container.right-panel-active .overlay-left {
                transform: translateX(0);
            }
            
            .auth-container.right-panel-active .overlay-right {
                transform: translateX(20%);
            }
            
            .ghost-btn {
                background-color: transparent;
                border: 2px solid #000;
                color: #000;
                padding: 12px 45px;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
                text-transform: uppercase;
                transition: all 0.3s ease;
                cursor: pointer;
                border-radius: 8px;
            }
            
            .ghost-btn:hover {
                background-color: #000;
                color: #d4af37;
            }
            
            .form-input {
                width: 100%;
                padding: 14px 16px;
                background: rgba(40, 40, 40, 0.8);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 8px;
                color: white;
                font-size: 14px;
                transition: all 0.3s ease;
                outline: none;
            }
            
            .form-input:focus {
                border-color: #d4af37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
            }
            
            .form-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }
            
            .submit-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #d4af37, #f5d67b);
                border: none;
                border-radius: 8px;
                color: #000;
                font-weight: bold;
                font-size: 14px;
                letter-spacing: 1px;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .submit-btn:hover {
                box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
                transform: translateY(-2px);
            }

            .portal-switch {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                padding: 6px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(0, 0, 0, 0.35);
                margin-bottom: 18px;
            }

            .portal-btn {
                border: 1px solid transparent;
                border-radius: 8px;
                padding: 10px 12px;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                font-weight: 700;
                cursor: pointer;
                color: rgba(255, 255, 255, 0.75);
                background: transparent;
                transition: all 0.25s ease;
            }

            .portal-btn.active {
                color: #020617;
                border-color: rgba(34, 211, 238, 0.75);
                background: linear-gradient(135deg, #67e8f9, #22d3ee);
                box-shadow: 0 8px 18px rgba(6, 182, 212, 0.28);
            }

            .auth-container.mode-factory .form-input {
                border-color: rgba(34, 211, 238, 0.38);
            }

            .auth-container.mode-factory .form-input:focus {
                border-color: #22d3ee;
                box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.12);
            }

            .auth-container.mode-factory .submit-btn {
                background: linear-gradient(135deg, #67e8f9, #22d3ee);
            }

            .auth-container.mode-factory .submit-btn:hover {
                box-shadow: 0 8px 25px rgba(34, 211, 238, 0.36);
            }

            .auth-container.mode-factory .overlay {
                background: linear-gradient(135deg, #0ea5e9, #22d3ee, #0f172a);
            }

            .auth-container.mode-factory .ghost-btn {
                border-color: #020617;
                color: #020617;
            }

            .auth-container.mode-factory .ghost-btn:hover {
                background-color: #020617;
                color: #67e8f9;
            }

            .auth-container.mode-factory .text-pagani-gold,
            .auth-container.mode-factory .toggle-password:hover,
            .auth-container.mode-factory #showRegisterMobile,
            .auth-container.mode-factory #showLoginMobile,
            .auth-container.mode-factory a:hover {
                color: #67e8f9 !important;
            }

            .auth-container.mode-factory #remember-me,
            .auth-container.mode-factory #terms-checkbox {
                accent-color: #22d3ee;
            }

            #authThemeRoot.mode-factory .auth-glow {
                background: rgba(56, 189, 248, 0.2);
            }
            
            .form-control {
                position: relative;
                margin-bottom: 16px;
            }
            
            .form-control small {
                color: #ef4444;
                font-size: 11px;
                position: absolute;
                bottom: -18px;
                left: 0;
            }
            
            .form-hint {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 4px;
            }
            
            .form-status {
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                margin-bottom: 16px;
                text-align: center;
                display: none;
            }
            
            .form-status.show {
                display: block;
            }
            
            .form-status.success {
                background: rgba(34, 197, 94, 0.2);
                border: 1px solid rgba(34, 197, 94, 0.5);
                color: #22c55e;
            }
            
            .form-status.error {
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid rgba(239, 68, 68, 0.5);
                color: #ef4444;
            }
            
            /* Mobile styles */
            @media (max-width: 768px) {
                .auth-container {
                    max-width: 100%;
                    min-height: auto;
                    border-radius: 16px;
                    margin: 16px;
                }
                
                .form-container {
                    position: relative;
                    width: 100%;
                    padding: 30px 24px;
                }
                
                .register-container {
                    display: none;
                }
                
                .register-container.active {
                    display: flex;
                }
                
                .login-container.hidden {
                    display: none;
                }
                
                .overlay-container {
                    display: none;
                }
            }
        </style>
        
        <!-- Video Background -->
        <video autoplay muted loop playsinline class="bg-video" id="bgVideo">
            <source src="/videos/ev-background.mp4" type="video/mp4" />
        </video>
        
        <!-- Fallback animated background if video fails -->
        <div class="fixed inset-0 z-[-1]">
            <div class="absolute inset-0 bg-gradient-to-br from-pagani-black via-gray-900 to-pagani-black"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.15),transparent_50%)]"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(212,175,55,0.1),transparent_50%)]"></div>
            <div class="auth-glow absolute top-20 left-20 w-72 h-72 bg-pagani-gold/5 rounded-full blur-3xl animate-pulse"></div>
            <div class="auth-glow absolute bottom-20 right-20 w-96 h-96 bg-pagani-gold/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
        </div>

        <div id="authThemeRoot" class="min-h-screen flex items-center justify-center px-4 py-12">
            <div class="auth-container" id="authContainer">
                <!-- Login Form -->
                <div class="form-container login-container" id="loginContainer">
                    <form id="loginForm" novalidate>
                        <div class="portal-switch" role="tablist" aria-label="Select login portal">
                            <button type="button" class="portal-btn" id="modeEvBtn" data-mode="ev">EV Portal</button>
                            <button type="button" class="portal-btn" id="modeFactoryBtn" data-mode="factory">Dark Factory</button>
                        </div>

                        <h1 class="text-2xl font-orbitron font-bold text-white mb-2" id="loginPortalTitle">EV Portal Login</h1>
                        <p class="text-gray-400 text-sm mb-6" id="loginPortalDescription">Sign in to access your EV dashboard</p>
                        
                        <div id="login-status" class="form-status"></div>
                        <input type="hidden" id="login-portal-mode" value="ev" />
                        
                        <div class="form-control">
                            <input type="email" id="login-email" class="form-input" placeholder="Email or Username" required />
                            <small id="login-email-error"></small>
                        </div>
                        
                        <div class="form-control">
                            <div class="relative">
                                <input type="password" id="login-password" class="form-input pr-12" placeholder="Password (min 8 characters)" minlength="8" required />
                                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                            <small id="login-password-error"></small>
                            <div class="form-hint">Use at least 8 characters.</div>
                        </div>
                        
                        <div class="flex items-center justify-between mb-6">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="remember-me" class="w-4 h-4 accent-pagani-gold rounded" />
                                <span class="text-sm text-gray-400">Remember me</span>
                            </label>
                            <a href="#" class="text-sm text-pagani-gold hover:underline">Forgot password?</a>
                        </div>
                        
                        <button type="submit" class="submit-btn">
                            <i class="fa-solid fa-right-to-bracket mr-2"></i> Login
                        </button>
                        
                        <!-- Mobile Register Link -->
                        <div class="md:hidden text-center mt-6 pt-6 border-t border-pagani-gold/20">
                            <p class="text-gray-400 text-sm mb-2">Don't have an account?</p>
                            <button type="button" id="showRegisterMobile" class="text-pagani-gold font-orbitron font-bold uppercase text-sm">
                                Register <i class="fa-solid fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Register Form -->
                <div class="form-container register-container" id="registerContainer">
                    <form id="registerForm" novalidate>
                        <h1 class="text-2xl font-orbitron font-bold text-white mb-2">Join EVBharat</h1>
                        <p class="text-gray-400 text-sm mb-6">Create your account to get started</p>
                        
                        <div id="register-status" class="form-status"></div>
                        
                        <div class="form-control">
                            <input type="text" id="register-name" class="form-input" placeholder="Full Name" required />
                            <small id="register-name-error"></small>
                        </div>
                        
                        <div class="form-control">
                            <input type="email" id="register-email" class="form-input" placeholder="Email" required />
                            <small id="register-email-error"></small>
                        </div>
                        
                        <div class="form-control">
                            <div class="relative">
                                <input type="password" id="register-password" class="form-input pr-12" placeholder="Password (min 8 characters)" minlength="8" required />
                                <button type="button" class="toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                            </div>
                            <small id="register-password-error"></small>
                            <!-- Password Strength -->
                            <div class="mt-2 flex items-center gap-2">
                                <div class="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden flex gap-1">
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                    <div class="strength-bar flex-1 h-full bg-gray-600 rounded-full transition-all"></div>
                                </div>
                                <span class="strength-text text-xs text-gray-400 w-14 text-right">Weak</span>
                            </div>
                        </div>
                        
                        <div class="form-control">
                            <input type="password" id="register-confirm" class="form-input" placeholder="Confirm Password" minlength="8" required />
                            <small id="register-confirm-error"></small>
                        </div>
                        
                        <label class="flex items-start gap-2 cursor-pointer mb-4">
                            <input type="checkbox" id="terms-checkbox" class="w-4 h-4 accent-pagani-gold rounded mt-1" required />
                            <span class="text-xs text-gray-400 leading-relaxed">
                                I agree to the <a href="#" class="text-pagani-gold hover:underline">Terms of Service</a> and <a href="#" class="text-pagani-gold hover:underline">Privacy Policy</a>
                            </span>
                        </label>
                        
                        <button type="submit" class="submit-btn">
                            <i class="fa-solid fa-user-plus mr-2"></i> Register
                        </button>
                        
                        <!-- Mobile Login Link -->
                        <div class="md:hidden text-center mt-6 pt-6 border-t border-pagani-gold/20">
                            <p class="text-gray-400 text-sm mb-2">Already have an account?</p>
                            <button type="button" id="showLoginMobile" class="text-pagani-gold font-orbitron font-bold uppercase text-sm">
                                <i class="fa-solid fa-arrow-left mr-1"></i> Login
                            </button>
                        </div>
                    </form>
                </div>
                
                <!-- Sliding Overlay -->
                <div class="overlay-container">
                    <div class="overlay">
                        <!-- Left Panel - Show on Register -->
                        <div class="overlay-panel overlay-left">
                            <h1 class="text-3xl font-orbitron font-bold text-black mb-2">
                                EV<span class="text-white">BHARAT</span>
                            </h1>
                            <p class="text-black/70 italic mb-4">AI-Powered EV Intelligence</p>
                            <p class="text-black/80 text-sm mb-6 max-w-xs">Already have an account? Login to access your EV dashboard and manage your vehicles.</p>
                            <button type="button" class="ghost-btn" id="showLogin">
                                <i class="fa-solid fa-arrow-left mr-2"></i> Login
                            </button>
                        </div>
                        
                        <!-- Right Panel - Show on Login -->
                        <div class="overlay-panel overlay-right">
                            <h1 class="text-3xl font-orbitron font-bold text-black mb-2">
                                EV<span class="text-white">BHARAT</span>
                            </h1>
                            <p class="text-black/70 italic mb-4">AI-Powered EV Intelligence</p>
                            <p class="text-black/80 text-sm mb-6 max-w-xs">Don't have an account? Join EVBharat and start your journey with intelligent EV management.</p>
                            <button type="button" class="ghost-btn" id="showRegister">
                                Register <i class="fa-solid fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Back to Home -->
        <a href="/" class="fixed top-24 left-4 md:left-8 text-sm text-gray-400 hover:text-pagani-gold transition-colors z-50">
            <i class="fa-solid fa-arrow-left mr-1"></i> Back to Home
        </a>
    `;

    // Initialize auth functionality
    setTimeout(() => {
        initializeAuthFunctionality();
    }, 100);
}

function initializeAuthFunctionality() {
    const authContainer = document.getElementById('authContainer');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterMobile = document.getElementById('showRegisterMobile');
    const showLoginMobile = document.getElementById('showLoginMobile');
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const modeEvBtn = document.getElementById('modeEvBtn');
    const modeFactoryBtn = document.getElementById('modeFactoryBtn');
    const loginPortalMode = document.getElementById('login-portal-mode') as HTMLInputElement | null;
    const loginPortalTitle = document.getElementById('loginPortalTitle');
    const loginPortalDescription = document.getElementById('loginPortalDescription');
    const authThemeRoot = document.getElementById('authThemeRoot');

    const applyPortalMode = (mode: 'ev' | 'factory') => {
        loginPortalMode && (loginPortalMode.value = mode);

        const isFactory = mode === 'factory';
        authContainer?.classList.toggle('mode-factory', isFactory);
        authContainer?.classList.toggle('mode-ev', !isFactory);
        authThemeRoot?.classList.toggle('mode-factory', isFactory);
        authThemeRoot?.classList.toggle('mode-ev', !isFactory);

        modeEvBtn?.classList.toggle('active', !isFactory);
        modeFactoryBtn?.classList.toggle('active', isFactory);

        if (loginPortalTitle) {
            loginPortalTitle.textContent = isFactory ? 'Dark Factory Login' : 'EV Portal Login';
        }
        if (loginPortalDescription) {
            loginPortalDescription.textContent = isFactory
                ? 'Sign in to monitor robotics lines, alerts, and industrial analytics'
                : 'Sign in to access your EV dashboard';
        }
    };

    modeEvBtn?.addEventListener('click', () => applyPortalMode('ev'));
    modeFactoryBtn?.addEventListener('click', () => applyPortalMode('factory'));
    applyPortalMode('ev');

    // Desktop panel switching
    showRegisterBtn?.addEventListener('click', () => {
        authContainer?.classList.add('right-panel-active');
    });

    showLoginBtn?.addEventListener('click', () => {
        authContainer?.classList.remove('right-panel-active');
    });

    // Mobile panel switching
    showRegisterMobile?.addEventListener('click', () => {
        loginContainer?.classList.add('hidden');
        registerContainer?.classList.add('active');
    });

    showLoginMobile?.addEventListener('click', () => {
        loginContainer?.classList.remove('hidden');
        registerContainer?.classList.remove('active');
    });

    // Demo credentials button
    const demoBtn = document.getElementById('useDemoBtn');
    demoBtn?.addEventListener('click', () => {
        // Switch to login panel first
        authContainer?.classList.remove('right-panel-active');
        loginContainer?.classList.remove('hidden');
        registerContainer?.classList.remove('active');
        
        const credentials = authService.getDefaultCredentials();
        const emailInput = document.getElementById('login-email') as HTMLInputElement;
        const passwordInput = document.getElementById('login-password') as HTMLInputElement;
        const statusDiv = document.getElementById('login-status');
        
        if (!credentials) {
            showStatus(statusDiv, 'Demo account is not configured.', 'error');
            return;
        }

        if (emailInput && passwordInput) {
            emailInput.value = credentials.email;
            passwordInput.value = credentials.password;
            emailInput.classList.add('border-pagani-gold');
            passwordInput.classList.add('border-pagani-gold');
            setTimeout(() => {
                emailInput.classList.remove('border-pagani-gold');
                passwordInput.classList.remove('border-pagani-gold');
            }, 1000);
        }
    });

    // Password visibility toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = btn.parentElement;
            if (parent) {
                const input = parent.querySelector('input') as HTMLInputElement;
                if (input) {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
                    }
                }
            }
        });
    });

    // Password strength indicator
    const registerPassword = document.getElementById('register-password') as HTMLInputElement;
    registerPassword?.addEventListener('input', () => {
        updatePasswordStrength(registerPassword.value);
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegister();
    });

    // Check for hash-based navigation
    if (location.hash === '#register') {
        authContainer?.classList.add('right-panel-active');
        loginContainer?.classList.add('hidden');
        registerContainer?.classList.add('active');
    }
}

function updatePasswordStrength(password: string) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[@$!%*?&#]/)) strength++;

    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];

    strengthBars.forEach((bar, index) => {
        bar.classList.remove('bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-gray-600');
        if (index < strength) {
            bar.classList.add(colors[strength - 1]);
        } else {
            bar.classList.add('bg-gray-600');
        }
    });

    if (strengthText) {
        strengthText.textContent = strength > 0 ? labels[strength - 1] : 'Weak';
        strengthText.className = 'strength-text text-xs w-14 text-right ' + 
            (strength === 0 || strength === 1 ? 'text-red-400' : 
             strength === 2 ? 'text-orange-400' : 
             strength === 3 ? 'text-yellow-400' : 'text-green-400');
    }
}

function showError(element: HTMLElement | null, message: string) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(element: HTMLElement | null) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

function showStatus(element: HTMLElement | null, message: string, type: 'success' | 'error') {
    if (element) {
        element.textContent = message;
        element.className = `form-status show ${type}`;
    }
}

async function handleLogin() {
    const emailInput = document.getElementById('login-email') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password') as HTMLInputElement;
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');
    const statusDiv = document.getElementById('login-status');
    const portalModeInput = document.getElementById('login-portal-mode') as HTMLInputElement | null;

    let isValid = true;

    // Clear previous errors
    hideError(emailError);
    hideError(passwordError);
    if (statusDiv) statusDiv.className = 'form-status';

    // Validate email
    if (!emailInput.value.trim()) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailError, 'Please enter a valid email');
        isValid = false;
    }

    // Validate password
    if (!passwordInput.value.trim()) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else if (!isValidPassword(passwordInput.value)) {
        showError(passwordError, 'Password must be at least 8 characters');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const result = await authService.login(emailInput.value, passwordInput.value);
    
    if (result.success) {
        const portalMode = portalModeInput?.value || 'ev';
        localStorage.setItem('evbharat_portal_mode', portalMode);
        showStatus(statusDiv, 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = portalMode === 'factory' ? '/factory-dashboard' : '/dashboard';
        }, 1500);
    } else {
        showStatus(statusDiv, result.message, 'error');
    }
}

async function handleRegister() {
    const nameInput = document.getElementById('register-name') as HTMLInputElement;
    const emailInput = document.getElementById('register-email') as HTMLInputElement;
    const passwordInput = document.getElementById('register-password') as HTMLInputElement;
    const confirmInput = document.getElementById('register-confirm') as HTMLInputElement;
    const termsCheckbox = document.getElementById('terms-checkbox') as HTMLInputElement;

    const nameError = document.getElementById('register-name-error');
    const emailError = document.getElementById('register-email-error');
    const passwordError = document.getElementById('register-password-error');
    const confirmError = document.getElementById('register-confirm-error');
    const statusDiv = document.getElementById('register-status');

    let isValid = true;

    // Clear previous errors
    [nameError, emailError, passwordError, confirmError].forEach(hideError);
    if (statusDiv) statusDiv.className = 'form-status';

    // Validate name
    if (!nameInput.value.trim()) {
        showError(nameError, 'Name is required');
        isValid = false;
    }

    // Validate email
    if (!emailInput.value.trim()) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailError, 'Please enter a valid email');
        isValid = false;
    }

    // Validate password
    if (!passwordInput.value.trim()) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else if (!isValidPassword(passwordInput.value)) {
        showError(passwordError, 'Password must be at least 8 characters');
        isValid = false;
    }

    // Validate confirm password
    if (passwordInput.value !== confirmInput.value) {
        showError(confirmError, 'Passwords do not match');
        isValid = false;
    }

    // Validate terms
    if (!termsCheckbox.checked) {
        showStatus(statusDiv, 'Please accept the Terms of Service', 'error');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const result = await authService.signup(nameInput.value, emailInput.value, passwordInput.value);
    
    if (result.success) {
        showStatus(statusDiv, 'Registration successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    } else {
        showStatus(statusDiv, result.message, 'error');
    }
}
