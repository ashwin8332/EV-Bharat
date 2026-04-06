import { authService } from '../utils/auth';

export class Footer {
    constructor() {
        this.render();
    }

    private render() {
        if (authService.isAuthenticated()) {
            return;
        }

        const footerHTML = `
        <footer class="relative bg-black text-white overflow-hidden border-t border-white/10">

            <div class="max-w-7xl mx-auto px-6 md:px-10 py-20">

                <!-- TOP GRID -->
                <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">

                    <!-- Brand -->
                    <div>
                        <h2 class="text-xl md:text-2xl font-orbitron font-bold mb-3 tracking-wide">
                            <span class="text-white">EV</span><span class="text-pagani-gold">BHARAT</span>
                        </h2>

                        <p class="text-gray-400 text-xs leading-relaxed max-w-[180px]">
                            Make mobility intelligent, sustainable and powerful.
                        </p>
                    </div>

                    ${this.renderColumn("FEATURES", [
                        { name: "Technology", path: "/technology" },
                        { name: "Gallery", path: "/gallery" },
                        { name: "Documentation", path: "/documentation" },
                    ])}
                    ${this.renderColumn("TECHNOLOGY", [
                        { name: "AI Systems", path: "/technology" },
                        { name: "Battery", path: "/battery" },
                        { name: "Analytics", path: "/battery-analytics" },
                    ])}
                    ${this.renderColumn("COMMUNITY", [
                        { name: "Dashboard", path: "/dashboard" },
                        { name: "AI Chat", path: "/rag-chat" },
                        { name: "Map", path: "/map" },
                    ])}
                    ${this.renderColumn("COMPANY", [
                        { name: "About", path: "/about" },
                        { name: "Contact", path: "/contact" },
                    ])}

                </div>

                <!-- HUGE BRAND TEXT -->
                <div class="relative text-center overflow-hidden">

                    <h1 class="whitespace-nowrap text-[12vw] max-w-full
                               font-orbitron font-bold leading-none tracking-tight
                               transform -translate-x-[4%] md:-translate-x-[5%]">

                        <span class="text-white/90">EV</span><span class="text-pagani-gold">
                            BHARAT
                        </span>

                    </h1>

                    <!-- Bottom Fade -->
                    <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent"></div>

                </div>

                <!-- Bottom Bar -->
                <div class="mt-10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">

                    <p>© 2026 EVBharat Automotive. All rights reserved.</p>

                    <div class="flex gap-6 uppercase tracking-widest">
                        <a href="#" class="hover:text-pagani-gold transition">Privacy</a>
                        <a href="#" class="hover:text-pagani-gold transition">Terms</a>
                        <a href="#" class="hover:text-pagani-gold transition">Legal</a>
                    </div>

                </div>

                <!-- Back to Top -->
                <button 
                    id="back-to-top"
                    class="fixed bottom-6 right-6 w-10 h-10 bg-pagani-gold text-black flex items-center justify-center opacity-0 pointer-events-none transition hover:scale-110"
                >
                    ↑
                </button>

            </div>
        </footer>
        `;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
        this.attachEventListeners();
    }

    private renderColumn(title: string, items: { name: string, path: string }[]) {
        return `
        <div>
            <h4 class="text-gray-500 text-xs tracking-[0.25em] mb-5">
                ${title}
            </h4>
            <ul class="space-y-2">
                ${items.map(item => `
                    <li>
                        <a href="${item.path}" class="text-gray-300 hover:text-white transition">
                            ${item.name}
                        </a>
                    </li>
                `).join("")}
            </ul>
        </div>
        `;
    }

    private attachEventListeners() {
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTop?.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                backToTop?.classList.add('opacity-0', 'pointer-events-none');
            }
        }, { passive: true });

        backToTop?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
