import { modal } from '../components/modal';
import { ScrollAnimator } from '../utils/animations';

const galleryImages = [
    {
        id: 1,
        category: 'technology',
        title: 'Wiring Bench Telemetry',
        description: 'Bench-level MCU wiring and isolation rails inside a dark factory diagnostics rig.',
        src: '/images/gallery/Gemini_Generated_Image_j11eq8j11eq8j11e.png'
    },
    {
        id: 2,
        category: 'interior',
        title: 'Nested MCU Stack',
        description: 'ESP32-CAM and controller stack mounted on the rover with VLC receiver hardware.',
        src: '/images/gallery/unnamed%20(1).jpg'
    },
    {
        id: 3,
        category: 'exterior',
        title: 'Factory Swarm Link',
        description: 'Multi-bot optical communication across an automated factory floor.',
        src: '/images/gallery/unnamed%20(2).jpg'
    }
];

const factoryVideos = [
    {
        title: 'Factory Bot Feed 01',
        src: '/images/gallery/AI_Generates_Project_Visualization_Videos.mp4'
    },
    {
        title: 'Factory Bot Feed 02',
        src: '/images/gallery/Project_Visualization_Images_and_Video.mp4'
    },
    {
        title: 'Factory Bot Feed 03',
        src: '/images/gallery/Zonda_Sequence_Video_Generated.mp4'
    }
];

export async function renderGalleryPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <!-- Hero Section -->
        <section class="relative min-h-[60vh] flex items-center justify-center px-8 py-32 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
            <div class="absolute inset-0 opacity-35" style="background-image: radial-gradient(circle at 20% 20%, rgba(56,189,248,0.16), transparent 35%), radial-gradient(circle at 80% 60%, rgba(148,163,184,0.14), transparent 40%), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: auto, auto, 42px 42px, 42px 42px;"></div>
            <div class="max-w-5xl mx-auto text-center relative z-10 fade-in-section">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <span class="w-16 h-[2px] bg-cyan-400"></span>
                    <span class="text-cyan-300 tracking-[0.3em] uppercase text-sm">Factory Vision Grid</span>
                    <span class="w-16 h-[2px] bg-cyan-400"></span>
                </div>
                <h1 class="text-5xl md:text-7xl font-orbitron font-bold mb-8">
                    DARK FACTORY <span class="text-cyan-300">BOT</span>
                </h1>
                <p class="text-xl text-zinc-300 leading-relaxed max-w-3xl mx-auto">
                    Surveillance-grade views from the assembly line, calibrated for machine precision and steel-floor realism.
                </p>
            </div>
        </section>

        <!-- Factory Video Section -->
        <section class="relative z-20 bg-black py-20 px-8 border-y border-cyan-400/20">
            <div class="max-w-6xl mx-auto fade-in-section">
                <div class="text-center mb-10">
                    <p class="text-cyan-300 tracking-[0.25em] uppercase text-sm mb-3">Live Simulation</p>
                    <h2 class="text-4xl md:text-5xl font-orbitron font-bold">Dark Factory Bot <span class="text-cyan-300">Video Feed</span></h2>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    ${factoryVideos.map(video => `
                        <article class="relative aspect-video overflow-hidden border border-cyan-300/30 bg-zinc-950 shadow-[0_0_0_1px_rgba(6,182,212,0.18),0_18px_48px_rgba(0,0,0,0.55)]">
                            <video
                                class="w-full h-full object-cover"
                                src="${video.src}"
                                autoplay
                                muted
                                loop
                                playsinline
                                controls
                            ></video>
                            <div class="absolute left-3 bottom-3 px-3 py-1 text-xs tracking-[0.2em] uppercase bg-black/60 border border-cyan-300/40 text-cyan-200">
                                ${video.title}
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Filter Section -->
        <section class="relative z-20 bg-zinc-950 py-12 px-8 border-y border-cyan-400/20">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-wrap justify-center gap-4">
                    <button class="filter-btn active px-6 py-3 border border-cyan-300 bg-cyan-300 text-zinc-950 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="all">
                        All
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-cyan-300 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="exterior">
                        Exterior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-cyan-300 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="interior">
                        Interior
                    </button>
                    <button class="filter-btn px-6 py-3 border border-white/20 hover:border-cyan-300 font-semibold tracking-wider uppercase transition-all text-sm" data-filter="technology">
                        Technology
                    </button>
                </div>
            </div>
        </section>

        <!-- Gallery Grid -->
        <section class="relative z-20 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black py-24 px-8">
            <div class="max-w-7xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-grid">
                    ${galleryImages.map((image, index) => `
                        <div class="gallery-item fade-in-section group cursor-pointer" data-category="${image.category}" data-id="${image.id}" style="animation-delay: ${index * 50}ms">
                            <div class="relative aspect-video bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-black border border-cyan-300/25 overflow-hidden shadow-[0_0_0_1px_rgba(6,182,212,0.15),0_16px_40px_rgba(0,0,0,0.45)]">
                                <img 
                                    src="${image.src}" 
                                    alt="${image.title}" 
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 class="text-xl font-orbitron font-bold mb-2">${image.title}</h3>
                                        <p class="text-sm text-zinc-300">${image.description}</p>
                                    </div>
                                </div>
                                <!-- Category badge -->
                                <div class="absolute top-4 right-4 px-3 py-1 bg-cyan-300/90 text-zinc-950 text-xs font-semibold uppercase tracking-wider">
                                    ${image.category}
                                </div>
                                <div class="absolute top-4 left-4 px-2 py-1 border border-cyan-200/40 text-cyan-100 text-[10px] tracking-[0.2em] uppercase bg-black/40">
                                    Unit-${String(image.id).padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- No results message -->
                <div id="no-results" class="hidden text-center py-16">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-2xl font-orbitron font-bold mb-2">No visual feed found</h3>
                    <p class="text-gray-400">Try selecting a different data channel</p>
                </div>
            </div>
        </section>

        <!-- Download Section -->
        <section class="relative z-20 bg-zinc-950 py-24 px-8 border-t border-cyan-400/20">
            <div class="max-w-4xl mx-auto text-center fade-in-section">
                <h2 class="text-4xl md:text-5xl font-orbitron font-bold mb-6">ARCHIVE & <span class="text-cyan-300">TELEMETRY</span></h2>
                <p class="text-gray-400 text-lg mb-8">Download high-resolution frames and engineering media packs</p>
                <button class="px-12 py-4 bg-cyan-300 text-zinc-950 font-semibold tracking-widest uppercase hover:bg-cyan-200 transition-all">
                    Download Asset Pack
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
                b.classList.remove('active', 'bg-cyan-300', 'text-zinc-950');
                b.classList.add('border-white/20');
            });
            btn.classList.add('active', 'bg-cyan-300', 'text-zinc-950');
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
                        <div class="aspect-video bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-black border border-cyan-300/30 flex items-center justify-center mb-6 overflow-hidden">
                            <img src="${image.src}" alt="${image.title}" class="w-full h-full object-contain" />
                        </div>
                        <h3 class="text-3xl font-orbitron font-bold mb-4">${image.title}</h3>
                        <p class="text-gray-400 text-lg mb-6">${image.description}</p>
                        <div class="flex gap-4 justify-center">
                            <a href="${image.src}" download class="px-8 py-3 bg-cyan-300 text-zinc-950 font-semibold tracking-wider uppercase hover:bg-cyan-200 transition-all">
                                Download HD
                            </a>
                            <button class="px-8 py-3 border border-cyan-300 text-cyan-300 font-semibold tracking-wider uppercase hover:bg-cyan-300 hover:text-zinc-950 transition-all" onclick="navigator.share ? navigator.share({url: '${image.src}'}) : navigator.clipboard.writeText('${image.src}')">
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
