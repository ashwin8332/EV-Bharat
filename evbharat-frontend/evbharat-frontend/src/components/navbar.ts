import { authService } from '../utils/auth';

export class Navbar {
    private navbar: HTMLElement | null = null;
    private mobileMenu: HTMLElement | null = null;
    private isMenuOpen: boolean = false;
    private readonly languageStorageKey = 'evbharat_language';

    constructor() {
        this.render();
        this.attachEventListeners();
    }

    private render() {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        const portalMode = localStorage.getItem('evbharat_portal_mode') || 'ev';
        const isFactoryMode = portalMode === 'factory';
        const dashboardPath = portalMode === 'factory' ? '/factory-dashboard' : '/dashboard';
        
        const navbarHTML = `
            ${isFactoryMode ? `
            <style id="factory-navbar-theme">
                .factory-mode .text-pagani-gold { color: #67e8f9 !important; }
                .factory-mode .hover\\:text-pagani-gold:hover { color: #67e8f9 !important; }
                .factory-mode .border-pagani-gold\\/10,
                .factory-mode .border-pagani-gold\\/20,
                .factory-mode .border-pagani-gold\\/30,
                .factory-mode .border-pagani-gold\\/50,
                .factory-mode .hover\\:border-pagani-gold:hover { border-color: rgba(34, 211, 238, 0.45) !important; }
                .factory-mode .bg-pagani-gold\\/10 { background-color: rgba(34, 211, 238, 0.10) !important; }
                .factory-mode .bg-pagani-gold\\/20 { background-color: rgba(34, 211, 238, 0.16) !important; }
                .factory-mode .hover\\:bg-pagani-gold\\/10:hover { background-color: rgba(34, 211, 238, 0.16) !important; }
                .factory-mode .bg-pagani-gold { background-color: #22d3ee !important; }
                .factory-mode .hover\\:bg-pagani-gold:hover { background-color: #22d3ee !important; }
                .factory-mode .hover\\:text-black:hover { color: #020617 !important; }
            </style>
            ` : ''}
            <style id="language-selector-theme">
                .language-select {
                    width: 11rem;
                    color: #f8fafc;
                    background-color: rgba(2, 6, 23, 0.25);
                    border: 1px solid rgba(234, 179, 8, 0.35);
                    border-radius: 0.5rem;
                    padding: 0.35rem 2rem 0.35rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: linear-gradient(45deg, transparent 50%, #eab308 50%), linear-gradient(135deg, #eab308 50%, transparent 50%);
                    background-position: calc(100% - 16px) calc(50% - 2px), calc(100% - 11px) calc(50% - 2px);
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                    transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
                }

                .language-select:hover {
                    border-color: rgba(234, 179, 8, 0.7);
                    background-color: rgba(2, 6, 23, 0.4);
                }

                .language-select:focus {
                    outline: none;
                    border-color: rgba(234, 179, 8, 0.9);
                    box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
                }

                .language-select option {
                    color: #f8fafc;
                    background-color: #0b1220;
                }

                .mobile-language-select {
                    width: 100%;
                    max-width: 13rem;
                }

                .factory-mode .language-select {
                    border-color: rgba(34, 211, 238, 0.45);
                    background-image: linear-gradient(45deg, transparent 50%, #22d3ee 50%), linear-gradient(135deg, #22d3ee 50%, transparent 50%);
                }

                .factory-mode .language-select:hover,
                .factory-mode .language-select:focus {
                    border-color: rgba(34, 211, 238, 0.8);
                    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
                }
            </style>
            <nav class="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-3 md:py-4 transition-all duration-300 ${isFactoryMode ? 'factory-mode' : ''}" id="navbar">
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between">
                        <!-- Logo -->
                        <div class="flex-shrink-0 z-10">
                            <a href="/" class="text-lg md:text-xl lg:text-2xl font-bold tracking-widest text-white uppercase font-orbitron hover:text-pagani-gold transition-colors">
                                EV<span class="text-pagani-gold">BHARAT</span>
                            </a>
                        </div>

                        <!-- Desktop Navigation -->
                        <div class="hidden lg:flex items-center justify-center flex-1 max-w-4xl mx-8">
                            ${!isAuthenticated ? `
                            <div class="flex items-center gap-4 xl:gap-6">
                                <a href="/" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Home</a>
                                <a href="/about" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">About</a>
                                <a href="/technology" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Technology</a>
                                <a href="/gallery" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Gallery</a>
                                <a href="/contact" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 py-2 px-3 rounded-md hover:bg-pagani-gold/10">Contact</a>
                            </div>
                            ` : `
                            <div class="flex items-center gap-3 xl:gap-4">
                                <a href="${dashboardPath}" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-gauge-high text-xs"></i>
                                    <span class="hidden xl:inline">${portalMode === 'factory' ? 'Factory' : 'Dashboard'}</span>
                                </a>
                                ${portalMode === 'factory' ? `
                                <a href="/dashboard" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-car-side text-xs"></i>
                                    <span class="hidden xl:inline">EV Dashboard</span>
                                </a>
                                <a href="/alerts" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-bell text-xs"></i>
                                    <span class="hidden xl:inline">Incidents</span>
                                </a>
                                <a href="/rag-chat" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-robot text-xs"></i>
                                    <span class="hidden xl:inline">AI Ops</span>
                                </a>
                                <a href="/gallery" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-camera text-xs"></i>
                                    <span class="hidden xl:inline">Camera Wall</span>
                                </a>
                                <a href="/profile" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-user text-xs"></i>
                                    <span class="hidden xl:inline">Operator</span>
                                </a>
                                ` : `
                                <a href="/battery" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-car-battery text-xs"></i>
                                    <span class="hidden xl:inline">Battery</span>
                                </a>
                                <a href="/rag-chat" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-robot text-xs"></i>
                                    <span class="hidden xl:inline">AI Chat</span>
                                </a>
                                <a href="/map" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-route text-xs"></i>
                                    <span class="hidden xl:inline">Routes</span>
                                </a>
                                <a href="/alerts" class="nav-link text-xs xl:text-sm tracking-wider uppercase hover:text-pagani-gold transition-all duration-300 flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-pagani-gold/10 border border-transparent hover:border-pagani-gold/30">
                                    <i class="fa-solid fa-bell text-xs"></i>
                                    <span class="hidden xl:inline">Alerts</span>
                                </a>
                                `}
                            </div>
                            `}
                        </div>

                        <!-- User Menu (Desktop) - Right Aligned -->
                        <div class="hidden md:flex items-center gap-3 lg:gap-4 flex-shrink-0 z-10">
                            <label class="flex items-center gap-2 px-3 py-2 border border-pagani-gold/30 rounded-lg bg-pagani-black/30 hover:border-pagani-gold/60 transition-colors" aria-label="Select language">
                                <i class="fa-solid fa-language text-pagani-gold text-sm"></i>
                                <select id="language-select" class="language-select" title="Select language">
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="bn">Bengali</option>
                                    <option value="as">Assamese</option>
                                    <option value="or">Odia</option>
                                    <option value="ur">Urdu</option>
                                    <option value="ne">Nepali</option>
                                    <option value="sd">Sindhi</option>
                                    <option value="ta">Tamil</option>
                                    <option value="te">Telugu</option>
                                    <option value="mr">Marathi</option>
                                    <option value="gu">Gujarati</option>
                                    <option value="kn">Kannada</option>
                                    <option value="ml">Malayalam</option>
                                    <option value="pa">Punjabi</option>
                                    <option value="ar">Arabic</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="es">Spanish</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh-CN">Chinese (Simplified)</option>
                                    <option value="zh-TW">Chinese (Traditional)</option>
                                    <option value="it">Italian</option>
                                    <option value="nl">Dutch</option>
                                    <option value="tr">Turkish</option>
                                    <option value="pl">Polish</option>
                                    <option value="vi">Vietnamese</option>
                                    <option value="id">Indonesian</option>
                                    <option value="th">Thai</option>
                                    <option value="fa">Persian</option>
                                    <option value="uk">Ukrainian</option>
                                    <option value="el">Greek</option>
                                    <option value="sv">Swedish</option>
                                    <option value="da">Danish</option>
                                    <option value="fi">Finnish</option>
                                </select>
                            </label>
                            ${isAuthenticated ? `
                            <a href="/profile" class="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 border border-pagani-gold/30 rounded-lg bg-pagani-black/20 backdrop-blur-sm hover:border-pagani-gold hover:bg-pagani-gold/10 transition-all duration-300 group">
                                <div class="text-right hidden md:block">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider group-hover:text-pagani-gold/80 transition-colors">User</p>
                                    <p class="text-sm font-orbitron font-bold text-pagani-gold">${user?.name}</p>
                                </div>
                                <div class="w-8 h-8 rounded-full bg-pagani-gold/20 flex items-center justify-center text-pagani-gold border border-pagani-gold/30 group-hover:bg-pagani-gold/30 group-hover:border-pagani-gold transition-all duration-300">
                                    <i class="fa-solid fa-user text-sm"></i>
                                </div>
                            </a>
                            <button id="logout-btn" class="px-4 lg:px-6 py-2 bg-pagani-gold/20 border border-pagani-gold/50 text-xs tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase rounded-lg">
                                <span class="hidden lg:inline">Logout</span>
                                <i class="fa-solid fa-sign-out-alt lg:hidden"></i>
                            </button>
                            ` : `
                            <a href="/auth" class="px-4 lg:px-6 py-2 border border-pagani-gold/30 text-xs tracking-[0.2em] hover:text-pagani-gold hover:border-pagani-gold transition-all uppercase rounded-lg">
                                Login
                            </a>
                            `}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-btn" class="lg:hidden text-white focus:outline-none p-2 hover:bg-pagani-gold/10 rounded-lg transition-colors ml-auto md:ml-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                <!-- Mobile Menu -->
                <div id="mobile-menu" class="lg:hidden fixed inset-0 bg-pagani-black/98 backdrop-blur-xl transform translate-x-full transition-transform duration-300 pt-16 z-40">
                    <div class="flex flex-col items-center gap-6 p-4 h-full overflow-y-auto">
                        ${!isAuthenticated ? `
                        <div class="flex flex-col items-center gap-6 w-full">
                            <a href="/" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Home</a>
                            <a href="/about" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">About</a>
                            <a href="/technology" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Technology</a>
                            <a href="/gallery" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Gallery</a>
                            <a href="/contact" class="mobile-nav-link text-xl tracking-wider uppercase hover:text-pagani-gold transition-colors py-2">Contact</a>
                        </div>
                        ` : ''}
                        ${isAuthenticated ? `
                        <div class="w-full">
                            <div class="text-center mb-6">
                                <h2 class="text-pagani-gold font-orbitron text-lg uppercase tracking-wider">${portalMode === 'factory' ? 'Factory Control Center' : 'EV Control Center'}</h2>
                                <div class="w-16 h-0.5 bg-pagani-gold mx-auto mt-2"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <a href="${dashboardPath}" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-gauge-high text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">${portalMode === 'factory' ? 'Factory' : 'Dashboard'}</span>
                                </a>
                                ${portalMode === 'factory' ? `
                                <a href="/alerts" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-bell text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Incidents</span>
                                </a>
                                ` : `
                                <a href="/battery" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-car-battery text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Battery</span>
                                </a>
                                `}
                                <a href="/rag-chat" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-robot text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">${portalMode === 'factory' ? 'AI Ops' : 'AI Chat'}</span>
                                </a>
                                ${portalMode === 'factory' ? `
                                <a href="/dashboard" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-car-side text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">EV Dashboard</span>
                                </a>
                                ` : ''}
                                ${portalMode === 'factory' ? `
                                <a href="/gallery" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-camera text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Camera Wall</span>
                                </a>
                                ` : `
                                <a href="/map" class="mobile-nav-card flex flex-col items-center justify-center gap-3 p-6 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300 min-h-[100px]">
                                    <i class="fa-solid fa-route text-3xl text-pagani-gold"></i>
                                    <span class="text-xs uppercase tracking-wider text-center">Routes</span>
                                </a>
                                `}
                            </div>
                            ${portalMode === 'factory' ? `
                            <a href="/profile" class="mobile-nav-card w-full flex items-center justify-center gap-4 p-4 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300">
                                <i class="fa-solid fa-user text-2xl text-pagani-gold"></i>
                                <span class="text-sm uppercase tracking-wider">Operator Settings</span>
                            </a>
                            ` : `
                            <a href="/alerts" class="mobile-nav-card w-full flex items-center justify-center gap-4 p-4 border border-pagani-gold/30 rounded-xl hover:bg-pagani-gold/10 hover:border-pagani-gold transition-all duration-300">
                                <i class="fa-solid fa-bell text-2xl text-pagani-gold"></i>
                                <span class="text-sm uppercase tracking-wider">Smart Alerts & Notifications</span>
                            </a>
                            `}
                        </div>
                        ` : ''}
                        <div class="flex flex-col gap-4 w-full mt-8">
                            <label class="w-full flex items-center justify-between gap-3 px-4 py-3 border border-pagani-gold/30 rounded-lg bg-pagani-black/20" aria-label="Select language">
                                <span class="text-xs uppercase tracking-[0.2em] text-pagani-gold">Language</span>
                                <select id="mobile-language-select" class="language-select mobile-language-select" title="Select language">
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="bn">Bengali</option>
                                    <option value="as">Assamese</option>
                                    <option value="or">Odia</option>
                                    <option value="ur">Urdu</option>
                                    <option value="ne">Nepali</option>
                                    <option value="sd">Sindhi</option>
                                    <option value="ta">Tamil</option>
                                    <option value="te">Telugu</option>
                                    <option value="mr">Marathi</option>
                                    <option value="gu">Gujarati</option>
                                    <option value="kn">Kannada</option>
                                    <option value="ml">Malayalam</option>
                                    <option value="pa">Punjabi</option>
                                    <option value="ar">Arabic</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="es">Spanish</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh-CN">Chinese (Simplified)</option>
                                    <option value="zh-TW">Chinese (Traditional)</option>
                                    <option value="it">Italian</option>
                                    <option value="nl">Dutch</option>
                                    <option value="tr">Turkish</option>
                                    <option value="pl">Polish</option>
                                    <option value="vi">Vietnamese</option>
                                    <option value="id">Indonesian</option>
                                    <option value="th">Thai</option>
                                    <option value="fa">Persian</option>
                                    <option value="uk">Ukrainian</option>
                                    <option value="el">Greek</option>
                                    <option value="sv">Swedish</option>
                                    <option value="da">Danish</option>
                                    <option value="fi">Finnish</option>
                                </select>
                            </label>
                            ${isAuthenticated ? `
                                <a href="/profile" class="text-center py-3 border border-pagani-gold/30 rounded-lg hover:border-pagani-gold hover:bg-pagani-gold/10 transition-all duration-300 mobile-nav-link">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider">Profile Settings</p>
                                    <p class="font-orbitron font-bold text-pagani-gold">${user?.name}</p>
                                </a>
                                <button id="logout-mobile-btn" class="w-full px-8 py-3 bg-pagani-gold/20 border border-pagani-gold/50 text-sm tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                    Logout
                                </button>
                            ` : `
                                <a href="/auth" class="w-full text-center py-3 border border-pagani-gold/30 text-sm tracking-[0.2em] hover:text-pagani-gold hover:border-pagani-gold transition-all uppercase">
                                    Login
                                </a>
                                <button class="w-full px-8 py-3 border border-pagani-gold text-sm tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                    Book Test Drive
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Insert navbar at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
        this.navbar = document.getElementById('navbar');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.initializeGoogleTranslate();
    }

    private attachEventListeners() {
        // Logout buttons
        const logoutBtn = document.getElementById('logout-btn');
        const logoutMobileBtn = document.getElementById('logout-mobile-btn');
        
        logoutBtn?.addEventListener('click', () => this.handleLogout());
        logoutMobileBtn?.addEventListener('click', () => this.handleLogout());

        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        menuBtn?.addEventListener('click', () => this.toggleMobileMenu());

        const languageSelect = document.getElementById('language-select') as HTMLSelectElement | null;
        const mobileLanguageSelect = document.getElementById('mobile-language-select') as HTMLSelectElement | null;
        const savedLanguage = localStorage.getItem(this.languageStorageKey) || 'en';

        if (languageSelect) {
            languageSelect.value = savedLanguage;
            languageSelect.addEventListener('change', (event) => {
                this.handleLanguageChange((event.target as HTMLSelectElement).value);
            });
        }

        if (mobileLanguageSelect) {
            mobileLanguageSelect.value = savedLanguage;
            mobileLanguageSelect.addEventListener('change', (event) => {
                this.handleLanguageChange((event.target as HTMLSelectElement).value);
            });
        }

        // Close menu on link click
        const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-card');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Scroll effect
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

        // Update active link on navigation
        this.updateActiveLink();
        window.addEventListener('popstate', () => this.updateActiveLink());
    }

    private handleLogout() {
        authService.logout();
        window.location.href = '/';
    }

    private initializeGoogleTranslate() {
        const win = window as typeof window & {
            googleTranslateElementInit?: () => void;
            google?: any;
            googleTranslateInitialized?: boolean;
        };

        win.googleTranslateElementInit = () => {
            if (win.googleTranslateInitialized || !win.google?.translate) {
                return;
            }

            const containerId = 'google_translate_element';
            if (!document.getElementById(containerId)) {
                const el = document.createElement('div');
                el.id = containerId;
                el.style.display = 'none';
                document.body.appendChild(el);
            }

            new win.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,bn,as,or,ur,ne,sd,ta,te,mr,gu,kn,ml,pa,ar,fr,de,es,pt,ru,ja,ko,zh-CN,zh-TW,it,nl,tr,pl,vi,id,th,fa,uk,el,sv,da,fi',
                    autoDisplay: false,
                },
                containerId
            );

            win.googleTranslateInitialized = true;
            const savedLanguage = localStorage.getItem(this.languageStorageKey) || 'en';
            this.applyGoogleLanguage(savedLanguage);
        };

        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else if (win.google?.translate) {
            win.googleTranslateElementInit();
        }
    }

    private handleLanguageChange(language: string) {
        localStorage.setItem(this.languageStorageKey, language);

        const languageSelect = document.getElementById('language-select') as HTMLSelectElement | null;
        const mobileLanguageSelect = document.getElementById('mobile-language-select') as HTMLSelectElement | null;

        if (languageSelect) {
            languageSelect.value = language;
        }
        if (mobileLanguageSelect) {
            mobileLanguageSelect.value = language;
        }

        this.applyGoogleLanguage(language);
    }

    private applyGoogleLanguage(language: string) {
        const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (!select) {
            return;
        }

        select.value = language;
        select.dispatchEvent(new Event('change'));
    }

    private toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            this.mobileMenu?.classList.remove('translate-x-full');
            document.querySelector('.menu-icon')?.classList.add('hidden');
            document.querySelector('.close-icon')?.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            this.closeMobileMenu();
        }
    }

    private closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileMenu?.classList.add('translate-x-full');
        document.querySelector('.menu-icon')?.classList.remove('hidden');
        document.querySelector('.close-icon')?.classList.add('hidden');
        document.body.style.overflow = '';
    }

    private handleScroll() {
        if (!this.navbar) return;

        const scrolled = window.scrollY;
        if (scrolled > 50) {
            this.navbar.classList.add('bg-pagani-black/80', 'backdrop-blur-md', 'shadow-lg');
        } else {
            this.navbar.classList.remove('bg-pagani-black/80', 'backdrop-blur-md', 'shadow-lg');
        }
    }

    private updateActiveLink() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-nav-card');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('text-pagani-gold');
                // Add enhanced active state for mobile cards
                if (link.classList.contains('mobile-nav-card')) {
                    link.classList.add('bg-pagani-gold/20', 'border-pagani-gold');
                }
            } else {
                link.classList.remove('text-pagani-gold');
                if (link.classList.contains('mobile-nav-card')) {
                    link.classList.remove('bg-pagani-gold/20', 'border-pagani-gold');
                }
            }
        });
    }

    public destroy() {
        this.navbar?.remove();
    }
}
