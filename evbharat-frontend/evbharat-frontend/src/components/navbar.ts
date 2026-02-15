import { authService } from '../utils/auth';

export class Navbar {
    private navbar: HTMLElement | null = null;
    private mobileMenu: HTMLElement | null = null;
    private isMenuOpen: boolean = false;

    constructor() {
        this.render();
        this.attachEventListeners();
    }

    private render() {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        
        const navbarHTML = `
            <nav class="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 transition-all duration-300" id="navbar">
                <div class="max-w-7xl mx-auto flex justify-between items-center">
                    <!-- Logo -->
                    <a href="/" class="text-xl md:text-2xl font-bold tracking-widest text-white uppercase font-orbitron hover:text-pagani-gold transition-colors">
                        EV<span class="text-pagani-gold">BHARAT</span>
                    </a>

                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center gap-8">
                        <a href="/" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Home</a>
                        <a href="/about" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">About</a>
                        <a href="/technology" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Technology</a>
                        <a href="/gallery" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Gallery</a>
                        <a href="/contact" class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors">Contact</a>
                        ${isAuthenticated ? `
                        <div class="relative group">
                            <button class="nav-link text-sm tracking-wider uppercase hover:text-pagani-gold transition-colors flex items-center gap-1">
                                <i class="fa-solid fa-gauge-high text-xs"></i> Dashboard <i class="fa-solid fa-chevron-down text-xs"></i>
                            </button>
                            <div class="absolute top-full left-0 mt-2 w-56 bg-pagani-black/95 backdrop-blur-lg border border-pagani-gold/30 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                                <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-gauge-high w-5"></i> Dashboard
                                </a>
                                <a href="/battery" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-car-battery w-5"></i> Battery Health
                                </a>
                                <a href="/map" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all border-b border-pagani-gold/10">
                                    <i class="fa-solid fa-route w-5"></i> Route Planner
                                </a>
                                <a href="/alerts" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-pagani-gold/20 hover:text-pagani-gold transition-all">
                                    <i class="fa-solid fa-bell w-5"></i> Alerts
                                </a>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <!-- User Menu (Desktop) -->
                    <div class="hidden md:flex items-center gap-4">
                        ${isAuthenticated ? `
                            <div class="flex items-center gap-3 px-4 py-2 border border-pagani-gold/30 rounded-lg">
                                <div class="text-right">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider">User</p>
                                    <p class="text-sm font-orbitron font-bold">${user?.name}</p>
                                </div>
                                <div class="text-2xl">👤</div>
                            </div>
                            <button id="logout-btn" class="px-6 py-2 bg-pagani-gold/20 border border-pagani-gold/50 text-xs tracking-[0.2em] hover:bg-pagani-gold hover:text-black transition-all uppercase">
                                Logout
                            </button>
                        ` : `
                            <a href="/auth" class="px-6 py-2 border border-pagani-gold/30 text-xs tracking-[0.2em] hover:text-pagani-gold hover:border-pagani-gold transition-all uppercase">
                                Login
                            </a>
                        `}
                    </div>

                    <!-- Mobile Menu Button -->
                    <button id="mobile-menu-btn" class="md:hidden text-white focus:outline-none">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Mobile Menu -->
                <div id="mobile-menu" class="md:hidden fixed inset-0 bg-pagani-black/95 backdrop-blur-lg transform translate-x-full transition-transform duration-300 pt-20">
                    <div class="flex flex-col items-center gap-8 p-8">
                        <a href="/" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Home</a>
                        <a href="/about" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">About</a>
                        <a href="/technology" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Technology</a>

                        <a href="/gallery" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Gallery</a>
                        <a href="/contact" class="mobile-nav-link text-2xl tracking-wider uppercase hover:text-pagani-gold transition-colors">Contact</a>
                        ${isAuthenticated ? `
                        <div class="w-full border-t border-pagani-gold/30 pt-6">
                            <p class="text-xs text-pagani-gold uppercase tracking-wider text-center mb-4">EV Management</p>
                            <div class="flex flex-col gap-3">
                                <a href="/dashboard" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-gauge-high"></i> Dashboard
                                </a>
                                <a href="/battery" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-car-battery"></i> Battery
                                </a>
                                <a href="/map" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-route"></i> Route Planner
                                </a>
                                <a href="/alerts" class="mobile-nav-link flex items-center justify-center gap-3 text-lg tracking-wider uppercase hover:text-pagani-gold transition-colors">
                                    <i class="fa-solid fa-bell"></i> Alerts
                                </a>
                            </div>
                        </div>
                        ` : ''}
                        <div class="flex flex-col gap-4 w-full mt-8">
                            ${isAuthenticated ? `
                                <div class="text-center py-3 border border-pagani-gold/30 rounded-lg">
                                    <p class="text-xs text-gray-400 uppercase tracking-wider">Logged in as</p>
                                    <p class="font-orbitron font-bold text-pagani-gold">${user?.name}</p>
                                </div>
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

        // Close menu on link click
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
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
        const links = document.querySelectorAll('.nav-link, .mobile-nav-link');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('text-pagani-gold');
            } else {
                link.classList.remove('text-pagani-gold');
            }
        });
    }

    public destroy() {
        this.navbar?.remove();
    }
}
