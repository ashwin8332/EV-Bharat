
import { animate } from 'motion';
import { modal } from './components/modal';

export class ZondaHUD {
    private container: HTMLElement;

    // Cache Elements
    private heroEl: HTMLElement;
    private designEl: HTMLElement;
    private engineEl: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId) as HTMLElement;
        if (!this.container) throw new Error(`HUD container with id ${containerId} not found`);

        // Create the phase elements dynamically or expect them? 
        // Let's create them dynamically for cleaner control
        this.container.innerHTML = '';

        this.heroEl = this.createPhaseElement('hero', `
            <div class="text-center relative">
                <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-pagani-gold/50"></div>
                <h1 class="text-5xl md:text-8xl font-black text-white tracking-tight mb-6 glitch-text">AI-POWERED<br><span class="text-pagani-gold">EV INTELLIGENCE</span></h1>
                <div class="flex items-center justify-center gap-4 text-white/80 text-base tracking-wide mb-8">
                    <span class="w-12 h-[1px] bg-pagani-gold/50"></span>
                    <span class="uppercase text-sm">Smart Battery • Intelligent Routing • Indian Roads</span>
                    <span class="w-12 h-[1px] bg-pagani-gold/50"></span>
                </div>
                <p class="text-gray-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
                    Solving India's EV challenges with Machine Learning for battery health monitoring and traffic-aware energy optimization.
                </p>
            </div>
        `);

        this.designEl = this.createPhaseElement('design', `
            <div class="max-w-2xl text-left absolute left-8 md:left-24 bottom-1/4 pointer-events-auto">
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-pagani-gold text-xs tracking-[0.3em] uppercase">AI/ML CORE</div>
                    <div class="h-[1px] w-16 bg-pagani-gold/50"></div>
                </div>
                <h2 class="text-5xl md:text-6xl font-black mb-6 leading-tight cursor-pointer hover:text-pagani-gold transition-colors" id="hud-battery-health-title">BATTERY HEALTH<br><span class="text-pagani-gold">PREDICTION</span></h2>
                <ul class="space-y-4 text-gray-300 text-base leading-relaxed border-l-2 border-pagani-gold/30 pl-6">
                   <li class="flex items-start gap-3"><span class="text-pagani-gold mt-1">▸</span><span>Real-time battery degradation monitoring using ML models</span></li>
                   <li class="flex items-start gap-3"><span class="text-pagani-gold mt-1">▸</span><span>Energy consumption prediction based on driving patterns</span></li>
                   <li class="flex items-start gap-3"><span class="text-pagani-gold mt-1">▸</span><span>Destination feasibility analysis with current charge levels</span></li>
                </ul>
            </div>
        `);

        this.engineEl = this.createPhaseElement('engine', `
             <div class="max-w-2xl absolute right-8 md:right-24 top-1/4 text-right flex flex-col items-end pointer-events-auto">
                <div class="flex items-center gap-4 mb-4">
                    <div class="h-[1px] w-16 bg-pagani-gold/50"></div>
                    <div class="text-pagani-gold text-xs tracking-[0.3em] uppercase">INTELLIGENT NAVIGATION</div>
                </div>
                <h2 class="text-5xl md:text-6xl font-black mb-6 leading-tight">SMART<br><span class="text-pagani-gold">ROUTING</span></h2>
                <ul class="space-y-4 text-gray-300 text-base leading-relaxed border-r-2 border-pagani-gold/30 pr-6 text-right">
                    <li class="flex items-end justify-end gap-3"><span>Traffic-aware route optimization for Indian road conditions</span><span class="text-pagani-gold mt-1">◂</span></li>
                    <li class="flex items-end justify-end gap-3"><span>Energy-efficient path planning with real-time updates</span><span class="text-pagani-gold mt-1">◂</span></li>
                    <li class="flex items-end justify-end gap-3"><span>Charging station recommendations based on battery SOC</span><span class="text-pagani-gold mt-1">◂</span></li>
                </ul>
            </div>
        `);

        this.container.appendChild(this.heroEl);
        this.container.appendChild(this.designEl);
        this.container.appendChild(this.engineEl);

        // Initial State
        this.setPhaseOpacity(this.heroEl, 1);
        this.setPhaseOpacity(this.designEl, 0);
        this.setPhaseOpacity(this.engineEl, 0);

        // Add click handler for Battery Health Prediction
        this.setupClickHandlers();
    }

    private setupClickHandlers() {
        // Use event delegation since the element is in the designEl
        setTimeout(() => {
            const batteryHealthTitle = document.getElementById('hud-battery-health-title');
            if (batteryHealthTitle) {
                batteryHealthTitle.addEventListener('click', this.openBatteryHealthWindow);
            }
        }, 100);
    }

    private openBatteryHealthWindow() {
        const batteryHealthContent = `
            <div class="space-y-8">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="text-7xl mb-4">🔋</div>
                    <h3 class="text-3xl font-orbitron font-bold mb-2">AI Battery Health Prediction System</h3>
                    <p class="text-gray-400">Real-time ML-powered battery monitoring and analysis</p>
                </div>

                <!-- Current Battery Status -->
                <div class="bg-gradient-to-br from-pagani-gold/10 to-transparent border border-pagani-gold/30 p-6 rounded-lg">
                    <h4 class="text-xl font-orbitron font-bold mb-4 text-pagani-gold">Current Battery Status</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">94%</div>
                            <div class="text-sm text-gray-400">State of Health</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">82%</div>
                            <div class="text-sm text-gray-400">Current Charge</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">28°C</div>
                            <div class="text-sm text-gray-400">Temperature</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-white">245</div>
                            <div class="text-sm text-gray-400">Charge Cycles</div>
                        </div>
                    </div>
                </div>

                <!-- ML Predictions -->
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                            <span class="text-pagani-gold">▸</span>
                            Predicted Degradation
                        </h4>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Next 6 months</span>
                                <span class="text-white font-bold">2.3% decline</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Next 12 months</span>
                                <span class="text-white font-bold">4.8% decline</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-400">Estimated lifespan</span>
                                <span class="text-white font-bold">8.2 years</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                        <h4 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                            <span class="text-pagani-gold">▸</span>
                            Optimization Recommendations
                        </h4>
                        <ul class="space-y-3 text-gray-300">
                            <li class="flex items-start gap-2">
                                <span class="text-green-500 mt-1">✓</span>
                                <span>Charging patterns optimal</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-yellow-500 mt-1">⚠</span>
                                <span>Consider reducing fast-charge frequency</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <span class="text-green-500 mt-1">✓</span>
                                <span>Temperature management excellent</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Key Features -->
                <div class="border-t border-pagani-gold/20 pt-6">
                    <h4 class="text-xl font-orbitron font-bold mb-4">AI/ML Features</h4>
                    <div class="grid md:grid-cols-3 gap-4">
                        ${[
                            { icon: '📊', title: 'Real-time Monitoring', desc: 'Continuous SOH analysis with ML models' },
                            { icon: '🎯', title: 'Predictive Alerts', desc: 'Proactive maintenance notifications' },
                            { icon: '⚡', title: 'Smart Charging', desc: 'Adaptive charging cycle optimization' },
                            { icon: '🌡️', title: 'Thermal Management', desc: 'Temperature-aware battery control' },
                            { icon: '📈', title: 'Pattern Analysis', desc: 'Driving behavior impact assessment' },
                            { icon: '🔮', title: 'Lifespan Prediction', desc: 'Accurate remaining life estimation' }
                        ].map(feature => `
                            <div class="bg-gradient-to-br from-pagani-gold/5 to-transparent border border-pagani-gold/20 p-4">
                                <div class="text-3xl mb-2">${feature.icon}</div>
                                <h5 class="font-bold text-sm mb-1">${feature.title}</h5>
                                <p class="text-xs text-gray-400">${feature.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Technical Details -->
                <div class="bg-pagani-black border border-pagani-gold/20 p-6">
                    <h4 class="text-lg font-orbitron font-bold mb-4">Technical Specifications</h4>
                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-400">ML Model Type:</span>
                                <span class="text-white">LSTM Neural Network</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Prediction Accuracy:</span>
                                <span class="text-white">97.3%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Update Frequency:</span>
                                <span class="text-white">Real-time (50ms)</span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Data Points Analyzed:</span>
                                <span class="text-white">250+ parameters</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Training Dataset:</span>
                                <span class="text-white">5M+ charge cycles</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Edge Computing:</span>
                                <span class="text-white">On-board AI chip</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.open(batteryHealthContent, 'BATTERY HEALTH PREDICTION');
    }

    private createPhaseElement(id: string, innerHTML: string): HTMLElement {
        const el = document.createElement('div');
        el.id = `phase-${id}`;
        el.className = 'absolute inset-0 w-full h-full flex items-center justify-center opacity-0 transition-opacity duration-500';
        el.innerHTML = innerHTML;
        return el;
    }

    private setPhaseOpacity(el: HTMLElement, opacity: number) {
        animate(el, { opacity }, { duration: 0.5 });
    }

    public update(progress: number) {
        // Logic:
        // 0.0 - 0.25 : Hero visible, others 0
        // 0.25 - 0.35 : Transition Hero -> Design
        // 0.35 - 0.60 : Design visible
        // 0.60 - 0.70 : Transition Design -> Engine
        // 0.70 - 1.0 : Engine visible

        if (progress < 0.25) {
            this.setPhaseOpacity(this.heroEl, 1);
            this.setPhaseOpacity(this.designEl, 0);
            this.setPhaseOpacity(this.engineEl, 0);
        }
        else if (progress >= 0.25 && progress < 0.35) {
            // Crossfade
            const t = (progress - 0.25) / 0.10; // 0 to 1
            this.setPhaseOpacity(this.heroEl, 1 - t);
            this.setPhaseOpacity(this.designEl, t);
            this.setPhaseOpacity(this.engineEl, 0);
        }
        else if (progress >= 0.35 && progress < 0.60) {
            this.setPhaseOpacity(this.heroEl, 0);
            this.setPhaseOpacity(this.designEl, 1);
            this.setPhaseOpacity(this.engineEl, 0);
        }
        else if (progress >= 0.60 && progress < 0.70) {
            // Crossfade
            const t = (progress - 0.60) / 0.10; // 0 to 1
            this.setPhaseOpacity(this.heroEl, 0);
            this.setPhaseOpacity(this.designEl, 1 - t);
            this.setPhaseOpacity(this.engineEl, t);
        }
        else {
            this.setPhaseOpacity(this.heroEl, 0);
            this.setPhaseOpacity(this.designEl, 0);
            this.setPhaseOpacity(this.engineEl, 1);
        }

    }
}
