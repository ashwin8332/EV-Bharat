export class Footer {
    constructor() {
        this.render();
    }

    private render() {
        const footerHTML = `
            <footer class="relative z-20 bg-pagani-black border-t border-pagani-gold/20">
                <div class="max-w-7xl mx-auto px-8 py-16">
                    <!-- Main Footer Content -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <!-- Company -->
                        <div>
                            <h3 class="text-xl font-orbitron font-bold mb-6">
                                EV<span class="text-pagani-gold">BHARAT</span>
                            </h3>
                            <p class="text-gray-400 text-sm leading-relaxed mb-6">
                                Pioneering India's electric future with AI-powered intelligence and hypercar performance.
                            </p>
                            <div class="flex gap-4">
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">𝕏</span>
                                </a>
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">in</span>
                                </a>
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">IG</span>
                                </a>
                                <a href="#" class="w-10 h-10 border border-white/20 hover:border-pagani-gold flex items-center justify-center transition-colors group">
                                    <span class="text-white group-hover:text-pagani-gold">YT</span>
                                </a>
                            </div>
                        </div>

                        <!-- Pages -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Pages</h4>
                            <ul class="space-y-3">
                                <li><a href="/documentation" class="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
                                <li><a href="/dashboard" class="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</a></li>
                                <li><a href="/battery" class="text-gray-400 hover:text-white transition-colors text-sm">Battery Health</a></li>
                                <li><a href="/map" class="text-gray-400 hover:text-white transition-colors text-sm">Route Planner</a></li>
                                <li><a href="/alerts" class="text-gray-400 hover:text-white transition-colors text-sm">Alerts</a></li>
                            </ul>
                        </div>

                        <!-- Company -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Company</h4>
                            <ul class="space-y-3">
                                <li><a href="/about" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
                                <li><a href="/gallery" class="text-gray-400 hover:text-white transition-colors text-sm">Gallery</a></li>
                                <li><a href="/technology" class="text-gray-400 hover:text-white transition-colors text-sm">Technology</a></li>
                                <li><a href="/contact" class="text-gray-400 hover:text-white transition-colors text-sm">Contact</a></li>
                            </ul>
                        </div>

                        <!-- Newsletter -->
                        <div>
                            <h4 class="text-sm font-orbitron tracking-widest uppercase mb-6 text-pagani-gold">Stay Updated</h4>
                            <p class="text-gray-400 text-sm mb-4">Get the latest news and updates</p>
                            <form class="flex flex-col gap-3" id="newsletter-form">
                                <input 
                                    type="email" 
                                    placeholder="Your email" 
                                    class="bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-pagani-gold transition-colors"
                                    required
                                />
                                <button 
                                    type="submit"
                                    class="bg-pagani-gold text-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-pagani-gold/90 transition-colors font-semibold"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs">
                        <p>&copy; 2026 EVBharat Automotive. All rights reserved.</p>
                        <div class="flex gap-8 uppercase tracking-widest">
                            <a href="#" class="hover:text-pagani-gold transition-colors">Privacy</a>
                            <a href="#" class="hover:text-pagani-gold transition-colors">Terms</a>
                            <a href="#" class="hover:text-pagani-gold transition-colors">Legal</a>
                        </div>
                    </div>

                    <!-- Back to Top Button -->
                    <button 
                        id="back-to-top"
                        class="fixed bottom-8 right-8 w-12 h-12 bg-pagani-gold text-black flex items-center justify-center opacity-0 pointer-events-none transition-opacity hover:bg-pagani-gold/90"
                        aria-label="Back to top"
                    >
                        ↑
                    </button>
                </div>
            </footer>
        `;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
        this.attachEventListeners();
    }

    private attachEventListeners() {
        // Newsletter form
        const form = document.getElementById('newsletter-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing! 🎉');
            (e.target as HTMLFormElement).reset();
        });

        // Back to top button
        const backToTop = document.getElementById('back-to-top');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
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
