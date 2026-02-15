// Simple client-side router using History API
export interface Route {
    path: string;
    title: string;
    render: () => Promise<void> | void;
}

export class Router {
    private routes: Map<string, Route> = new Map();
    private currentPath: string = '';

    constructor() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.addEventListener('click', (e) => this.handleLinkClick(e));
    }

    public register(path: string, title: string, render: () => Promise<void> | void) {
        this.routes.set(path, { path, title, render });
    }

    public navigate(path: string, pushState: boolean = true) {
        if (this.currentPath === path) return;

        const route = this.routes.get(path);
        if (!route) {
            this.navigate('/404', pushState);
            return;
        }

        this.currentPath = path;

        if (pushState) {
            window.history.pushState({ path }, route.title, path);
        }

        document.title = route.title;
        this.showPageTransition(async () => {
            await route.render();
            window.scrollTo({ top: 0, behavior: 'instant' });
        });
    }

    private handleRoute() {
        const path = window.location.pathname;
        this.navigate(path, false);
    }

    private handleLinkClick(e: MouseEvent) {
        const target = (e.target as HTMLElement).closest('a');
        if (!target) return;

        const href = target.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        if (this.routes.has(href)) {
            e.preventDefault();
            this.navigate(href);
        }
    }

    private showPageTransition(callback: () => Promise<void>) {
        const app = document.getElementById('app');
        if (!app) return callback();

        // Fade out
        app.style.opacity = '0';
        app.style.transition = 'opacity 0.3s ease-out';

        setTimeout(async () => {
            await callback();
            // Fade in
            app.style.opacity = '1';
        }, 300);
    }

    public init() {
        this.handleRoute();
    }
}

export const router = new Router();
