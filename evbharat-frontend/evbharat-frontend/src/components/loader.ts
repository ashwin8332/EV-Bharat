export class Loader {
    private loader: HTMLElement | null = null;

    constructor() {
        this.render();
    }

    private render() {
        const loaderHTML = `
            <div id="page-loader" class="fixed inset-0 z-[100] bg-pagani-black flex items-center justify-center transition-opacity duration-500">
                <div class="text-center">
                    <div class="relative w-24 h-24 mx-auto mb-8">
                        <div class="absolute inset-0 border-4 border-pagani-gold/20 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-transparent border-t-pagani-gold rounded-full animate-spin"></div>
                    </div>
                    <div class="text-2xl font-orbitron font-bold tracking-widest">
                        EV<span class="text-pagani-gold">BHARAT</span>
                    </div>
                    <div class="text-xs text-gray-400 mt-4 tracking-wider uppercase">Loading Experience...</div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
        this.loader = document.getElementById('page-loader');
    }

    public hide() {
        if (!this.loader) return;

        this.loader.style.opacity = '0';
        setTimeout(() => {
            this.loader?.remove();
        }, 500);
    }

    public show() {
        if (!this.loader) {
            this.render();
        } else {
            this.loader.style.opacity = '1';
        }
    }
}
