import { authService, type User } from '../utils/auth';

interface NavItem {
    label: string;
    path: string;
    icon: string;
    description?: string;
    portal?: 'ev' | 'factory' | 'both';
    requiresAuth?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
    portal?: 'ev' | 'factory' | 'both';
    requiresAuth?: boolean;
}

interface LanguageOption {
    value: string;
    label: string;
}

export class Navbar {
    private navbar: HTMLElement | null = null;
    private navbarShell: HTMLElement | null = null;
    private mobileMenu: HTMLElement | null = null;
    private isMenuOpen: boolean = false;
    private readonly languageStorageKey = 'evbharat_language';

    private readonly languageOptions: ReadonlyArray<LanguageOption> = [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'bn', label: 'Bengali' },
        { value: 'as', label: 'Assamese' },
        { value: 'or', label: 'Odia' },
        { value: 'ur', label: 'Urdu' },
        { value: 'ne', label: 'Nepali' },
        { value: 'sd', label: 'Sindhi' },
        { value: 'ta', label: 'Tamil' },
        { value: 'te', label: 'Telugu' },
        { value: 'mr', label: 'Marathi' },
        { value: 'gu', label: 'Gujarati' },
        { value: 'kn', label: 'Kannada' },
        { value: 'ml', label: 'Malayalam' },
        { value: 'pa', label: 'Punjabi' },
        { value: 'ar', label: 'Arabic' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'es', label: 'Spanish' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'ru', label: 'Russian' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'zh-CN', label: 'Chinese (Simplified)' },
        { value: 'zh-TW', label: 'Chinese (Traditional)' },
        { value: 'it', label: 'Italian' },
        { value: 'nl', label: 'Dutch' },
        { value: 'tr', label: 'Turkish' },
        { value: 'pl', label: 'Polish' },
        { value: 'vi', label: 'Vietnamese' },
        { value: 'id', label: 'Indonesian' },
        { value: 'th', label: 'Thai' },
        { value: 'fa', label: 'Persian' },
        { value: 'uk', label: 'Ukrainian' },
        { value: 'el', label: 'Greek' },
        { value: 'sv', label: 'Swedish' },
        { value: 'da', label: 'Danish' },
        { value: 'fi', label: 'Finnish' }
    ];

    // Navigation Configuration
    private readonly publicNavItems: NavItem[] = [
        { label: 'Home', path: '/', icon: 'fa-home' },
        { label: 'About', path: '/about', icon: 'fa-info-circle' },
        { label: 'Technology', path: '/technology', icon: 'fa-microchip' },
        { label: 'Gallery', path: '/gallery', icon: 'fa-images' },
        { label: 'Documentation', path: '/documentation', icon: 'fa-book-open' },
        { label: 'Contact', path: '/contact', icon: 'fa-envelope' }
    ];

    private readonly evAuthNavGroups: NavGroup[] = [
        {
            title: 'CORE',
            requiresAuth: true,
            portal: 'ev',
            items: [
                { label: 'Dashboard', path: '/dashboard', icon: 'fa-gauge-high', description: 'Real-time vehicle analytics' },
                { label: 'Battery', path: '/battery', icon: 'fa-car-battery', description: 'In-depth battery health' },
                { label: 'Routes', path: '/map', icon: 'fa-route', description: 'Intelligent route planning' },
                { label: 'Alerts', path: '/alerts', icon: 'fa-bell', description: 'Critical vehicle notifications' },
            ]
        },
        {
            title: 'AI FEATURES',
            requiresAuth: true,
            portal: 'ev',
            items: [
                { label: 'AI Chat', path: '/rag-chat', icon: 'fa-robot', description: 'Ask our AI anything' },
                { label: 'Drowsiness', path: '/drowsiness', icon: 'fa-eye', description: 'Driver alertness monitoring' },
                { label: 'Documentation', path: '/documentation', icon: 'fa-book-open', description: 'Vehicle & system docs' }
            ]
        }
    ];

    private readonly factoryAuthNavGroups: NavGroup[] = [
        {
            title: 'CONTROL',
            requiresAuth: true,
            portal: 'factory',
            items: [
                { label: 'Factory', path: '/factory-dashboard', icon: 'fa-industry', description: 'Factory Control Center' },
                { label: 'EV Fleet', path: '/dashboard', icon: 'fa-car-side', description: 'Fleet-wide EV monitoring' },
                { label: 'AI Ops', path: '/rag-chat', icon: 'fa-robot', description: 'AI-driven operational support' }
            ]
        },
        {
            title: 'MONITORING',
            requiresAuth: true,
            portal: 'factory',
            items: [
                { label: 'Incidents', path: '/alerts', icon: 'fa-triangle-exclamation', description: 'Fleet-wide incident reports' },
                { label: 'Driver State', path: '/drowsiness', icon: 'fa-video', description: 'Driver alertness streams' },
                { label: 'Camera Wall', path: '/gallery', icon: 'fa-border-all', description: 'Live camera feeds' },
                { label: 'Documentation', path: '/documentation', icon: 'fa-book-open', description: 'Operational & technical docs' }
            ]
        }
    ];

    constructor() {
        this.render();
        this.attachEventListeners();
    }

    private getLanguageOptionsHTML(): string {
        return this.languageOptions
            .map((option) => `<option value="${option.value}">${option.label}</option>`)
            .join('');
    }

    private getIncludedLanguagesList(): string {
        return this.languageOptions.map((option) => option.value).join(',');
    }

    private getUserDisplayLabel(user: User | null): string {
        if (user?.email?.trim()) {
            return user.email.trim();
        }

        if (user?.name?.trim()) {
            return user.name.trim();
        }

        return 'Profile';
    }

    private getDesktopNavHTML(
        isAuthenticated: boolean,
        portalMode: string
    ): string {
        if (!isAuthenticated) {
            return this.publicNavItems
                .map(
                    (item) => `
                <a href="${item.path}" class="nav-link">
                    <i class="fa-solid ${item.icon} nav-link-icon" aria-hidden="true"></i>
                    <span>${item.label}</span>
                </a>
            `
                )
                .join('');
        }

        const navGroups = portalMode === 'factory' ? this.factoryAuthNavGroups : this.evAuthNavGroups;

        return navGroups
            .flatMap((group) => group.items)
            .map(
                (item) => `
            <a href="${item.path}" class="nav-link">
                <i class="fa-solid ${item.icon} nav-link-icon" aria-hidden="true"></i>
                <span>${item.label}</span>
            </a>
        `
            )
            .join('');
    }

    private getMobileNavHTML(
        isAuthenticated: boolean,
        portalMode: string
    ): string {
        if (!isAuthenticated) {
            return `
                <div class="space-y-2 w-full">
                    ${this.publicNavItems
                        .map(
                            (item) => `
                        <a href="${item.path}" class="mobile-nav-link flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-colors">
                            <span class="text-sm uppercase tracking-[0.14em]">${item.label}</span>
                            <i class="fa-solid ${item.icon} text-xs opacity-70"></i>
                        </a>
                    `
                        )
                        .join('')}
                </div>
            `;
        }

        const navGroups = portalMode === 'factory' ? this.factoryAuthNavGroups : this.evAuthNavGroups;

        return `
            <div class="w-full">
                ${navGroups
                    .map(
                        (group) => `
                    <div class="mb-6">
                        <h3 class="text-[11px] uppercase tracking-[0.24em] mb-3 text-white/60">${group.title}</h3>
                        <div class="grid grid-cols-2 gap-3">
                            ${group.items
                                .map(
                                    (item) => `
                                <a href="${item.path}" class="mobile-nav-card flex flex-col items-center justify-center gap-2 p-4 border border-white/10 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] transition-all duration-200 min-h-[96px]">
                                    <i class="fa-solid ${item.icon} text-2xl"></i>
                                    <span class="text-[11px] uppercase tracking-[0.12em] text-center">${item.label}</span>
                                </a>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    }

    private render() {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        const portalMode = localStorage.getItem('evbharat_portal_mode') || 'ev';
        const isFactoryMode = portalMode === 'factory';
        const userLabel = this.getUserDisplayLabel(user);
        const languageOptionsHTML = this.getLanguageOptionsHTML();
        
        const desktopNavHTML = this.getDesktopNavHTML(isAuthenticated, portalMode);
        const mobileNavHTML = this.getMobileNavHTML(isAuthenticated, portalMode);
        
        const navbarHTML = `
            <style id="navbar-design-theme">
                #navbar {
                    --nav-accent: #d4af37;
                    --nav-accent-soft: rgba(212, 175, 55, 0.19);
                    --nav-accent-border: rgba(212, 175, 55, 0.48);
                }

                #navbar.factory-mode {
                    --nav-accent: #22d3ee;
                    --nav-accent-soft: rgba(34, 211, 238, 0.2);
                    --nav-accent-border: rgba(34, 211, 238, 0.5);
                }

                #navbar .nav-pill-shell {
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    background:
                        linear-gradient(95deg, rgba(9, 12, 19, 0.95), rgba(11, 17, 33, 0.95) 42%, rgba(8, 11, 18, 0.95)),
                        radial-gradient(circle at 22% 50%, rgba(212, 175, 55, 0.18), transparent 42%);
                    box-shadow: 0 20px 44px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.09);
                    transition: transform 220ms ease, box-shadow 220ms ease;
                }

                #navbar.navbar-scrolled .nav-pill-shell {
                    transform: translateY(-1px);
                    box-shadow: 0 26px 58px rgba(2, 6, 23, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.13);
                }

                #navbar .nav-brand-wordmark {
                    display: inline-flex;
                    align-items: center;
                    gap: 0;
                    border-radius: 0.72rem;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    background: rgba(9, 13, 20, 0.92);
                    color: #f8fafc;
                    padding: 0.42rem 0.6rem 0.4rem 0.6rem;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.6rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    line-height: 1;
                    box-shadow: 0 10px 22px rgba(3, 7, 18, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
                    transition: transform 180ms ease, box-shadow 180ms ease;
                }

                #navbar .nav-brand-wordmark:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 14px 24px rgba(3, 7, 18, 0.44), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
                }

                #navbar .brand-ev {
                    color: #f8fafc;
                }

                #navbar .brand-bharat {
                    color: #d4af37;
                }

                #navbar .nav-main-links {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    overflow-x: auto;
                    overflow-y: hidden;
                    white-space: nowrap;
                }

                #navbar .nav-main-links::-webkit-scrollbar {
                    display: none;
                }

                #navbar .nav-link {
                    color: rgba(226, 232, 240, 0.92);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.46rem;
                    padding: 0.5rem 0.72rem;
                    border-radius: 9999px;
                    font-family: 'Rajdhani', sans-serif;
                    font-size: 0.86rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    white-space: nowrap;
                    border: 1px solid transparent;
                    transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
                }

                #navbar .nav-link-icon {
                    font-size: 0.68rem;
                    opacity: 0.76;
                }

                #navbar .nav-link:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                #navbar .nav-link.nav-link-active {
                    color: #ffffff;
                    background: linear-gradient(130deg, var(--nav-accent-soft), rgba(255, 255, 255, 0.06));
                    border-color: var(--nav-accent-border);
                    box-shadow: 0 6px 16px rgba(1, 4, 12, 0.35);
                }

                #navbar .nav-link.nav-link-active .nav-link-icon {
                    color: var(--nav-accent);
                    opacity: 1;
                }

                #navbar .nav-cta {
                    border-radius: 9999px;
                    background: #f8fafc;
                    color: #111827;
                    padding: 0.58rem 1rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.26);
                    transition: transform 180ms ease, box-shadow 180ms ease;
                    max-width: 14rem;
                    display: inline-flex;
                    align-items: center;
                }

                #navbar .nav-cta:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 22px rgba(15, 23, 42, 0.3);
                }

                #navbar .nav-ghost-btn {
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(226, 232, 240, 0.92);
                    width: 2.25rem;
                    height: 2.25rem;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: background-color 180ms ease, border-color 180ms ease;
                }

                #navbar .nav-ghost-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.45);
                }

                #navbar .language-select {
                    width: 7.6rem;
                    border-radius: 9999px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.05);
                    color: #f1f5f9;
                    padding: 0.38rem 1.75rem 0.38rem 0.72rem;
                    font-size: 0.73rem;
                    letter-spacing: 0.02em;
                    appearance: none;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    background-image: linear-gradient(45deg, transparent 50%, var(--nav-accent) 50%), linear-gradient(135deg, var(--nav-accent) 50%, transparent 50%);
                    background-position: calc(100% - 14px) calc(50% - 2px), calc(100% - 9px) calc(50% - 2px);
                    background-size: 5px 5px, 5px 5px;
                    background-repeat: no-repeat;
                    transition: border-color 180ms ease, background-color 180ms ease;
                }

                #navbar .language-select:hover,
                #navbar .language-select:focus {
                    border-color: var(--nav-accent-border);
                    background-color: rgba(255, 255, 255, 0.1);
                    outline: none;
                }

                #navbar .language-select option {
                    color: #111827;
                    background-color: #f8fafc;
                }

                #navbar .mobile-nav-link-active {
                    border-color: var(--nav-accent-border) !important;
                    background: var(--nav-accent-soft) !important;
                }

                #navbar .mobile-nav-card-active {
                    border-color: var(--nav-accent-border) !important;
                    background: var(--nav-accent-soft) !important;
                }

                @media (max-width: 1279px) {
                    #navbar .nav-pill-shell {
                        border-radius: 1.1rem;
                    }
                }
            </style>
            <nav class="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-[96rem] transition-all duration-300 ${isFactoryMode ? 'factory-mode' : ''}" id="navbar">
                <div id="navbar-shell" class="nav-pill-shell px-2.5 md:px-3 py-2">
                    <div class="flex items-center gap-2.5 w-full">
                        <a href="/" class="nav-brand-wordmark" aria-label="EV Bharat home">
                            <span class="brand-ev">EV</span><span class="brand-bharat">BHARAT</span>
                        </a>

                        <div class="hidden lg:flex items-center gap-1.5 flex-1 min-w-0 nav-main-links pr-1">
                            ${desktopNavHTML}
                        </div>

                        <div class="hidden xl:flex items-center gap-2 shrink-0">
                            <label class="inline-flex items-center" aria-label="Select language">
                                <select id="language-select" class="language-select" title="Select language">
                                    ${languageOptionsHTML}
                                </select>
                            </label>

                            ${isAuthenticated ? `
                            <a href="/profile" class="nav-cta" title="${userLabel}">
                                <span class="truncate">${userLabel}</span>
                            </a>
                            <button id="logout-btn" class="nav-ghost-btn" aria-label="Logout">
                                <i class="fa-solid fa-right-from-bracket text-xs"></i>
                            </button>
                            ` : `
                            <a href="/auth" class="nav-cta">
                                <span>Login</span>
                            </a>
                            `}
                        </div>

                        <button id="mobile-menu-btn" class="xl:hidden inline-flex items-center justify-center text-white w-10 h-10 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.12] transition-colors" aria-label="Toggle menu">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div id="mobile-menu" class="xl:hidden fixed inset-0 z-40 bg-[#0a0d14]/95 backdrop-blur-xl transform translate-x-full transition-transform duration-300 overflow-y-auto">
                    <div class="mx-auto w-full max-w-md pt-24 px-4 pb-10">
                        <div class="rounded-[2rem] border border-white/10 bg-[#121827]/90 shadow-[0_22px_42px_rgba(0,0,0,0.45)] p-5">
                            <div class="mb-5">
                                <a href="/" class="nav-brand-wordmark" aria-label="EV Bharat home">
                                    <span class="brand-ev">EV</span><span class="brand-bharat">BHARAT</span>
                                </a>
                            </div>

                            ${mobileNavHTML}

                            <div class="mt-7 pt-6 border-t border-white/10 space-y-3">
                                <label class="flex items-center justify-between gap-3" aria-label="Select language">
                                    <span class="text-[11px] uppercase tracking-[0.2em] text-white/65">Language</span>
                                    <select id="mobile-language-select" class="language-select !w-40" title="Select language">
                                        ${languageOptionsHTML}
                                    </select>
                                </label>

                                ${isAuthenticated ? `
                                <a href="/profile" class="mobile-nav-link flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-colors">
                                    <span class="text-[11px] uppercase tracking-[0.2em] text-white/60">Profile</span>
                                    <span class="font-semibold text-sm truncate max-w-[10rem]">${userLabel}</span>
                                </a>
                                <button id="logout-mobile-btn" class="w-full py-3 rounded-2xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-sm uppercase tracking-[0.18em] transition-colors">
                                    Logout
                                </button>
                                ` : `
                                <a href="/auth" class="mobile-nav-link block text-center px-6 py-3 rounded-2xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.12] text-sm uppercase tracking-[0.18em] transition-colors">
                                    Login
                                </a>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Insert navbar at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
        this.navbar = document.getElementById('navbar');
        this.navbarShell = document.getElementById('navbar-shell');
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
                    includedLanguages: this.getIncludedLanguagesList(),
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
        if (!this.navbar || !this.navbarShell) return;

        const scrolled = window.scrollY;
        if (scrolled > 28) {
            this.navbar.classList.add('navbar-scrolled');
        } else {
            this.navbar.classList.remove('navbar-scrolled');
        }
    }

    private updateActiveLink() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-nav-card');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                if (link.classList.contains('nav-link')) {
                    link.classList.add('nav-link-active');
                }
                if (link.classList.contains('mobile-nav-link')) {
                    link.classList.add('mobile-nav-link-active');
                }
                if (link.classList.contains('mobile-nav-card')) {
                    link.classList.add('mobile-nav-card-active');
                }
            } else {
                link.classList.remove('nav-link-active', 'mobile-nav-link-active');
                if (link.classList.contains('mobile-nav-card')) {
                    link.classList.remove('mobile-nav-card-active');
                }
            }
        });
    }

    public destroy() {
        this.navbar?.remove();
    }
}
