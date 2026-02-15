import { modal } from '../components/modal';
import { ScrollAnimator } from '../utils/animations';

const galleryImages = [
    { id: 1, category: 'exterior', title: 'Front View', description: 'Aggressive front fascia with LED headlights', src: '/images/gallery/ev_car_front_1768921597944.png' },
    { id: 2, category: 'exterior', title: 'Side Profile - Black', description: 'Midnight black with aerodynamic design', src: '/images/gallery/ev_car_side_black_1768921527957.png' },
    { id: 3, category: 'exterior', title: 'Side Profile - Gold', description: 'Pagani gold metallic finish', src: '/images/gallery/ev_car_side_gold_1768921550995.png' },
    { id: 4, category: 'exterior', title: 'Side Profile - White', description: 'Arctic white with carbon fiber accents', src: '/images/gallery/ev_car_side_white_1768921572922.png' },
    { id: 5, category: 'exterior', title: 'Rear View', description: 'Integrated LED light bar and diffuser', src: '/images/gallery/ev_car_rear_1768921622132.png' },
    { id: 6, category: 'interior', title: 'Dashboard', description: 'Minimalist digital cockpit with OLED displays', src: '/images/gallery/ev_car_interior_dashboard_1768921641324.png' },
    { id: 7, category: 'technology', title: 'Front Design', description: 'Advanced aerodynamics and LED technology', src: '/images/gallery/ev_car_front_1768921597944.png' },
    { id: 8, category: 'technology', title: 'Rear Technology', description: 'Active aero and thermal management', src: '/images/gallery/ev_car_rear_1768921622132.png' },
    { id: 9, category: 'interior', title: 'Cockpit View', description: 'Driver-focused interior design', src: '/images/gallery/ev_car_interior_dashboard_1768921641324.png' }
];

export async function renderGalleryPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <!-- Hero Section -->
        <section class="relative min-h-[60vh] flex items-center justify-center px-8 py-32 bg-gradient-to-b from-pagani-black via-gray-900 to-pagani-black">
            <div class="max-w-4xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                    <span class="text-pagani-gold tracking-[0.3em] uppercase text-sm">Gallery</span>
                    <span class="w-16 h-[2px] bg-pagani-gold"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8">
                    VISUAL <span class="text-pagani-gold">EXCELLENCE</span>
                </h1>
                <p class="text-xl text-gray-300 leading-relaxed">
                    Explore every detail of the EVBharat X-1 through our curated image collection
                </p>
            </div>
        </section>

        <!-- Filter Section -->
        <section class="relative z-20 bg-pagani-black py-12 px-8 border-y border-pagani-gold/20">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-wrap justify-center gap-4">
                    <button class="filter-btn active px-6 py-3 border border-pagani-gold bg-pagani-gold text-black font-semibold tracking-wider uppercase transition-all text-sm" data-filter="all">
                        All
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-pagani-gold font-semibold tracking-wider uppercase transition-all text-sm" data-filter="exterior">
                        Exterior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-pagani-gold font-semibold tracking-wider uppercase transition-all text-sm" data-filter="interior">
                        Interior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-pagani-gold font-semibold tracking-wider uppercase transition-all text-sm" data-filter="technology">
                        Technology
                    </button>
                </div>
            </div>
        </section>

        <!-- Gallery Grid -->
        <section class="relative z-20 bg-gradient-to-b from-gray-900 to-pagani-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
                    ${galleryImages.map((image, index) => `
                        <div class="gallery-item fade-in-section group cursor-pointer" data-category="${image.category}" data-id="${image.id}" style="animation-delay: ${index * 50}ms">
                            <div class="relative aspect-video bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 overflow-hidden">
                                <img 
                                    src="${image.src}" 
                                    alt="${image.title}" 
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-pagani-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 class="text-xl font-orbitron font-bold mb-2">${image.title}</h3>
                                        <p class="text-sm text-gray-300">${image.description}</p>
                                    </div>
                                </div>
                                <!-- Category badge -->
                                <div class="absolute top-4 right-4 px-3 py-1 bg-pagani-gold/90 text-black text-xs font-semibold uppercase tracking-wider">
                                    ${image.category}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- No results message -->
                <div id="no-results" class="hidden text-center py-16">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-2xl font-orbitron font-bold mb-2">No images found</h3>
                    <p class="text-gray-400">Try selecting a different category</p>
                </div>
            </div>
        </section>

        <!-- Download Section -->
        <section class="relative z-20 bg-pagani-black py-24 px-8 border-t border-pagani-gold/20">
            <div class="max-w-4xl mx-auto text-center fade-in-section">
                <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">PRESS & <span class="text-pagani-gold">MEDIA</span></h2>
                <p class="text-gray-400 text-lg mb-8">Download high-resolution images and press materials</p>
                <button class="px-12 py-4 bg-pagani-gold text-black font-semibold tracking-widest uppercase hover:bg-pagani-gold/90 transition-all">
                    Download Press Kit
                </button>
            </div>
        </section>
    `;

    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const noResults = document.getElementById('no-results');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-pagani-gold', 'text-black');
                b.classList.add('border-white/20');
            });
            btn.classList.add('active', 'bg-pagani-gold', 'text-black');
            btn.classList.remove('border-white/20');

            // Filter items
            const filter = btn.getAttribute('data-filter');
            let visibleCount = 0;

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });

            // Show/hide no results message
            if (visibleCount === 0) {
                noResults?.classList.remove('hidden');
            } else {
                noResults?.classList.add('hidden');
            }
        });
    });

    // Lightbox functionality
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            const image = galleryImages.find(img => img.id === parseInt(id || '0'));

            if (image) {
                const lightboxContent = `
                    <div class="text-center">
                        <div class="aspect-video bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 flex items-center justify-center mb-6 overflow-hidden">
                            <img src="${image.src}" alt="${image.title}" class="w-full h-full object-contain" />
                        </div>
                        <h3 class="text-3xl font-orbitron font-bold mb-4">${image.title}</h3>
                        <p class="text-gray-400 text-lg mb-6">${image.description}</p>
                        <div class="flex gap-4 justify-center">
                            <a href="${image.src}" download class="px-8 py-3 bg-pagani-gold text-black font-semibold tracking-wider uppercase hover:bg-pagani-gold/90 transition-all">
                                Download HD
                            </a>
                            <button class="px-8 py-3 border border-pagani-gold text-pagani-gold font-semibold tracking-wider uppercase hover:bg-pagani-gold hover:text-black transition-all" onclick="navigator.share ? navigator.share({url: '${image.src}'}) : navigator.clipboard.writeText('${image.src}')">
                                Share
                            </button>
                        </div>
                    </div>
                `;

                modal.open(lightboxContent);
            }
        });
    });

    // Initialize animations
    const animator = new ScrollAnimator(0.1);
    animator.observeAll('.fade-in-section');
}
