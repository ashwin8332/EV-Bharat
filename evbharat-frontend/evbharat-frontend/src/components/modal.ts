import { animate } from 'motion';

export class Modal {
    private modal: HTMLElement | null = null;
    private isOpen: boolean = false;

    public open(content: string, title?: string) {
        if (this.isOpen) return;

        const modalHTML = `
            <div id="modal-overlay" class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div id="modal-content" class="bg-pagani-black border border-pagani-gold/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    ${title ? `
                        <div class="border-b border-pagani-gold/20 px-8 py-6 flex justify-between items-center">
                            <h2 class="text-2xl font-orbitron font-bold">${title}</h2>
                            <button id="modal-close" class="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
                        </div>
                    ` : `
                        <button id="modal-close" class="absolute top-4 right-4 text-white/50 hover:text-white text-2xl leading-none z-10">&times;</button>
                    `}
                    <div class="p-8">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('modal-overlay');
        this.isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Animate in
        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            animate(modalContent,
                { opacity: [0, 1], transform: ['scale(0.9)', 'scale(1)'] },
                { duration: 0.3 }
            );
        }

        // Close handlers
        document.getElementById('modal-close')?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // ESC key
        const escHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    public close() {
        if (!this.isOpen || !this.modal) return;

        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            animate(modalContent,
                { opacity: 0, transform: 'scale(0.9)' },
                { duration: 0.2 }
            ).finished.then(() => {
                this.modal?.remove();
                this.modal = null;
                this.isOpen = false;
                document.body.style.overflow = '';
            });
        }
    }
}

export const modal = new Modal();
