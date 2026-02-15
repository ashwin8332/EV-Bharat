import { animate } from 'motion';

// Scroll-triggered animation observer
export class ScrollAnimator {
    private observer: IntersectionObserver;

    constructor(threshold: number = 0.1) {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold }
        );
    }

    public observe(element: HTMLElement) {
        this.observer.observe(element);
    }

    public observeAll(selector: string) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => this.observe(el as HTMLElement));
    }

    public disconnect() {
        this.observer.disconnect();
    }
}

// Counter animation
export function animateCounter(
    element: HTMLElement,
    start: number,
    end: number,
    duration: number = 2000,
    suffix: string = ''
) {
    const startTime = Date.now();

    const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);

        element.textContent = current.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    };

    updateCounter();
}

// Parallax effect
export function initParallax(selector: string, speed: number = 0.5) {
    const elements = document.querySelectorAll<HTMLElement>(selector);

    const handleScroll = () => {
        const scrollY = window.scrollY;

        elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const offset = (scrollY - elementTop) * speed;

            el.style.transform = `translateY(${offset}px)`;
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
}

// Stagger animation for lists
export function staggerFadeIn(elements: NodeListOf<HTMLElement> | HTMLElement[], delay: number = 100) {
    elements.forEach((el, index) => {
        animate(
            el,
            { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
            { duration: 0.6, delay: index * (delay / 1000) }
        );
    });
}

// Page transition helper
export async function pageTransition(callback: () => Promise<void> | void) {
    const app = document.getElementById('app');
    if (!app) return callback();

    await animate(app, { opacity: 0 }, { duration: 0.3 }).finished;
    await callback();
    await animate(app, { opacity: 1 }, { duration: 0.3 }).finished;
}
