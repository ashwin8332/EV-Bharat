
export class ZondaScrollCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private images: HTMLImageElement[] = [];
    private totalFrames: number = 240;
    private isLoaded: boolean = false;
    private currentFrameIndex: number = -1;

    constructor(canvasId: string, totalFrames: number = 240) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) throw new Error(`Canvas with id ${canvasId} not found`);

        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Alpha false for slight perf boost if opaque bg
        this.totalFrames = totalFrames;

        if (this.ctx) {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.preloadImages();
    }

    private resize() {
        if (!this.canvas || !this.ctx) return;

        // Handle High-DPI (Retina) displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement?.getBoundingClientRect();

        if (rect) {
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);

            // Re-apply smoothing after resize might reset context state in some browsers
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';

            // Re-draw current frame after resize
            if (this.currentFrameIndex >= 0) {
                this.renderFrame(this.currentFrameIndex);
            }
        }
    }

    private preloadImages() {
        let loadedCount = 0;
        for (let i = 1; i <= this.totalFrames; i++) {
            const img = new Image();
            img.src = `/images/zonda-sequence/${i}.jpg`;
            img.onload = () => {
                loadedCount++;
                if (loadedCount === this.totalFrames) {
                    this.isLoaded = true;
                    // Draw first frame once loaded
                    this.renderFrame(0);
                }
            };
            this.images.push(img);
        }
    }

    public update(progress: number) {
        if (!this.isLoaded) return;

        // Map 0-1 to 0-(totalFrames-1)
        const frameIndex = Math.min(
            this.totalFrames - 1,
            Math.max(0, Math.floor(progress * this.totalFrames))
        );

        if (frameIndex !== this.currentFrameIndex) {
            this.renderFrame(frameIndex);
            this.currentFrameIndex = frameIndex;
        }
    }

    private renderFrame(index: number) {
        if (!this.ctx || !this.canvas) return;

        const img = this.images[index];
        if (!img) return;

        // Clear canvas (taking into account the transform)
        // We need to clear the FULL scaled width/height
        const dpr = window.devicePixelRatio || 1;
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

        // Object Fit: Contain Logic
        const canvasWidth = this.canvas.width / dpr;
        const canvasHeight = this.canvas.height / dpr;

        const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
        const x = (canvasWidth / 2) - (img.width / 2) * scale;
        const y = (canvasHeight / 2) - (img.height / 2) * scale;

        this.ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
}
