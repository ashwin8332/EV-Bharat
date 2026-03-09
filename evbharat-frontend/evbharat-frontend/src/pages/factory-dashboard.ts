import { authService } from '../utils/auth';

export async function renderFactoryDashboardPage() {
    if (!authService.isAuthenticated()) {
        window.location.href = '/auth';
        return;
    }

    const app = document.getElementById('app');
    if (!app) return;

    const user = authService.getCurrentUser();

    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-slate-950 pt-24 pb-12 text-white">
            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="mb-8 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-slate-900/70 to-black p-6">
                    <p class="text-xs uppercase tracking-[0.28em] text-cyan-300 mb-2">Dark Factory Portal</p>
                    <h1 class="text-3xl md:text-4xl font-orbitron font-bold mb-2">Factory Command Center</h1>
                    <p class="text-slate-300">Operator: ${user?.name || 'Factory User'} | Real-time robotics and production telemetry</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Line Status</p>
                        <p class="text-3xl font-orbitron text-cyan-300 mt-2">ONLINE</p>
                        <p class="text-xs text-blue-300 mt-2">All 4 zones active</p>
                    </article>
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Bots Running</p>
                        <p class="text-3xl font-orbitron text-cyan-300 mt-2">12</p>
                        <p class="text-xs text-slate-300 mt-2">2 in high-load mode</p>
                    </article>
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Safety Alerts</p>
                        <p class="text-3xl font-orbitron text-cyan-200 mt-2">1</p>
                        <p class="text-xs text-blue-300 mt-2">Cooling threshold near Zone B</p>
                    </article>
                    <article class="rounded-xl border border-cyan-300/25 bg-slate-900/45 p-5">
                        <p class="text-slate-400 text-xs uppercase tracking-[0.2em]">Energy Draw</p>
                        <p class="text-3xl font-orbitron text-cyan-300 mt-2">482 kW</p>
                        <p class="text-xs text-blue-300 mt-2">-3.1% vs previous hour</p>
                    </article>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <section class="xl:col-span-2 rounded-2xl border border-cyan-400/20 bg-slate-900/40 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="font-orbitron text-xl text-cyan-300">Production Grid</h2>
                            <a href="/alerts" class="text-sm text-cyan-300 hover:text-cyan-200">View alerts</a>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone A Assembly</p>
                                <p class="text-2xl font-orbitron mt-2">98.4%</p>
                                <p class="text-xs text-blue-300 mt-1">Efficiency stable</p>
                            </div>
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone B Power Systems</p>
                                <p class="text-2xl font-orbitron mt-2">91.2%</p>
                                <p class="text-xs text-cyan-300 mt-1">Cooling check required</p>
                            </div>
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone C QA Scan</p>
                                <p class="text-2xl font-orbitron mt-2">99.1%</p>
                                <p class="text-xs text-blue-300 mt-1">Defect rate low</p>
                            </div>
                            <div class="rounded-xl border border-slate-700 bg-black/40 p-4">
                                <p class="text-sm text-slate-400">Zone D Dispatch</p>
                                <p class="text-2xl font-orbitron mt-2">96.8%</p>
                                <p class="text-xs text-blue-300 mt-1">Output on schedule</p>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-2xl border border-cyan-400/20 bg-slate-900/40 p-6">
                        <h2 class="font-orbitron text-xl text-cyan-300 mb-4">Quick Actions</h2>
                        <div class="space-y-3">
                            <a href="/dashboard" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Open EV dashboard</a>
                            <a href="/alerts" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Open incident center</a>
                            <a href="/gallery" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Open camera wall</a>
                            <a href="/rag-chat" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">AI operator assistant</a>
                            <a href="/profile" class="block rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 hover:bg-cyan-400/20 transition-all">Operator profile</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;
}
