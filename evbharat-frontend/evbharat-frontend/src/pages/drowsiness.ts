import { authService } from '../utils/auth';

interface DrowsinessStatus {
    running: boolean;
    face_present: boolean;
    risk_percent: number;
    perclos: number;
    eye_closed: boolean;
    yawn_active: boolean;
    calibrated: boolean;
    alert_level: 'none' | 'medium' | 'high';
    alert_message: string;
    alert_seq: number;
    updated_at: number;
    ear?: number;
    mar?: number;
    ear_threshold?: number;
    mar_threshold?: number;
    camera_available?: boolean;
    camera_error?: string;
    source?: string;
    sensitivity_score?: number;
    sensitivity_state?: 'stable' | 'sensitive' | 'emotional' | string;
    sensitivity_parameters?: Record<string, number>;
    landmark_backend?: string;
    processing_active?: boolean;
}

const API_STORAGE_KEY = 'evbharat_drowsiness_api_base';
const API_BASE_DEFAULT = (import.meta.env.VITE_DROWSINESS_API_URL as string | undefined)?.trim() || '/api/drowsiness';
const POLL_INTERVAL_MS = 2500;

let statusPollInterval: ReturnType<typeof setInterval> | null = null;
let requestInFlight = false;

function normalizeApiBase(value: string): string {
    const normalized = value.trim().replace(/\/+$/, '');
    return normalized.length > 0 ? normalized : API_BASE_DEFAULT;
}

function stopPolling(): void {
    if (!statusPollInterval) {
        return;
    }

    clearInterval(statusPollInterval);
    statusPollInterval = null;
}

export async function renderDrowsinessPage() {
    if (!authService.isAuthenticated()) {
        window.location.href = '/auth';
        return;
    }

    const app = document.getElementById('app');
    if (!app) return;

    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    stopPolling();
    requestInFlight = false;

    let apiBase = normalizeApiBase(localStorage.getItem(API_STORAGE_KEY) || API_BASE_DEFAULT);
    let voiceAlertsEnabled = false;
    let lastAlertSequence = 0;

    app.innerHTML = `
        <div id="drowsiness-page-root" class="min-h-screen bg-pagani-black pt-24 pb-12">
            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 fade-in-section">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fa-solid fa-eye text-3xl text-pagani-gold"></i>
                            <h1 class="text-3xl md:text-4xl font-orbitron font-bold">Driver Drowsiness Monitor</h1>
                        </div>
                        <p class="text-gray-400">Real-time detection to check whether the driver is drowsy or alert.</p>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-2 rounded-lg border border-pagani-gold/40 bg-pagani-gold/10">
                        <span id="drowsiness-connection-dot" class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span id="drowsiness-connection-text" class="text-sm font-orbitron text-red-400">Backend Offline</span>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-5 fade-in-section">
                    <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                        <div>
                            <label for="drowsiness-api-base" class="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Backend Endpoint</label>
                            <input
                                id="drowsiness-api-base"
                                type="text"
                                class="w-full px-4 py-3 bg-gray-800/50 border border-pagani-gold/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pagani-gold transition-all"
                                placeholder="/api/drowsiness"
                            />
                            <p class="text-xs text-gray-500 mt-2">Default dev endpoint is <span class="text-pagani-gold">/api/drowsiness</span>. It proxies to <span class="text-pagani-gold">127.0.0.1:8000/drowsiness</span>.</p>
                        </div>
                        <div class="flex items-end gap-3">
                            <button id="drowsiness-connect-btn" class="px-5 py-3 bg-pagani-gold/20 border border-pagani-gold/50 rounded-lg text-pagani-gold hover:bg-pagani-gold hover:text-black transition-all uppercase text-xs tracking-[0.18em] font-orbitron font-bold whitespace-nowrap">
                                Connect
                            </button>
                            <button id="drowsiness-browser-cam-btn" class="px-5 py-3 border border-emerald-400/50 rounded-lg text-emerald-300 hover:bg-emerald-400/10 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap">
                                Use Browser Camera
                            </button>
                            <button id="drowsiness-voice-btn" class="px-5 py-3 border border-cyan-400/50 rounded-lg text-cyan-300 hover:bg-cyan-400/10 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap">
                                Voice Alerts Off
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-4 md:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section">
                            <div class="flex items-center justify-between gap-3 mb-4">
                                <h3 class="text-lg font-orbitron font-bold flex items-center gap-2">
                                    <i class="fa-solid fa-camera text-pagani-gold"></i>
                                    Live Driver Feed
                                </h3>
                                <span class="text-xs uppercase tracking-wider text-gray-400">Source: <span id="drowsiness-source-label" class="text-pagani-gold">${apiBase}</span></span>
                            </div>

                            <div class="relative overflow-hidden rounded-xl border border-pagani-gold/20 bg-black/70 aspect-video">
                                <img id="drowsiness-video-feed" alt="Drowsiness detector live feed" class="w-full h-full object-cover" loading="eager" />
                                <video id="drowsiness-browser-video" class="w-full h-full object-cover hidden" autoplay playsinline muted></video>
                                <div id="drowsiness-process-badge" class="absolute top-3 left-3 px-2.5 py-1 rounded-lg border border-pagani-gold/50 bg-black/70 text-[11px] uppercase tracking-[0.2em] text-pagani-gold font-orbitron">
                                    AI Monitor • Initializing
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Risk Score</p>
                                <p id="drowsiness-risk-value" class="text-3xl font-orbitron font-bold text-green-400">0%</p>
                                <div class="h-2 bg-gray-700 rounded-full mt-3 overflow-hidden">
                                    <div id="drowsiness-risk-bar" class="h-full bg-green-500 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>

                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section" style="animation-delay: 50ms">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">PERCLOS</p>
                                <p id="drowsiness-perclos" class="text-3xl font-orbitron font-bold text-white">0.00</p>
                                <p class="text-xs text-gray-500 mt-2">Eye-closure ratio</p>
                            </div>

                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section" style="animation-delay: 100ms">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Eye State</p>
                                <p id="drowsiness-eye-state" class="text-2xl font-orbitron font-bold text-white">OPEN</p>
                                <p id="drowsiness-face-state" class="text-xs text-gray-500 mt-2">Face: Not detected</p>
                            </div>

                            <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-4 fade-in-section" style="animation-delay: 150ms">
                                <p class="text-[11px] uppercase tracking-[0.18em] text-gray-500 mb-2">Yawn Status</p>
                                <p id="drowsiness-yawn-state" class="text-2xl font-orbitron font-bold text-white">NO</p>
                                <p id="drowsiness-calibration-state" class="text-xs text-gray-500 mt-2">Calibration pending</p>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-1 space-y-6">
                        <div id="drowsiness-state-card" class="bg-gradient-to-br from-green-500/15 to-green-900/10 border border-green-500/30 rounded-xl p-6 fade-in-section">
                            <p class="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Driver Condition</p>
                            <h3 id="drowsiness-driver-label" class="text-2xl font-orbitron font-bold text-green-400">SAFE</h3>
                            <p id="drowsiness-driver-description" class="text-sm text-gray-300 mt-3">No drowsiness risk detected right now.</p>
                            <div class="mt-4 pt-4 border-t border-gray-700/60">
                                <p class="text-xs text-gray-500">Last update</p>
                                <p id="drowsiness-last-update" class="text-sm font-orbitron text-pagani-gold mt-1">--:--:--</p>
                            </div>
                        </div>

                        <div class="bg-gradient-to-br from-gray-900 to-pagani-black border border-pagani-gold/20 rounded-xl p-6 fade-in-section" style="animation-delay: 80ms">
                            <h3 class="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-wave-square text-pagani-gold"></i>
                                Detection Signals
                            </h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">EAR / Threshold</span>
                                    <span id="drowsiness-ear-value" class="font-orbitron text-white">-- / --</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">MAR / Threshold</span>
                                    <span id="drowsiness-mar-value" class="font-orbitron text-white">-- / --</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">Alert Level</span>
                                    <span id="drowsiness-alert-level" class="font-orbitron text-white uppercase">none</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">Sensitivity Score</span>
                                    <span id="drowsiness-sensitivity-value" class="font-orbitron text-white">0%</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">Emotion State</span>
                                    <span id="drowsiness-emotion-state" class="font-orbitron text-white uppercase">stable</span>
                                </div>
                                <div class="flex items-center justify-between p-3 rounded-lg bg-pagani-black/40 border border-pagani-gold/10">
                                    <span class="text-gray-400">Landmark Engine</span>
                                    <span id="drowsiness-landmark-backend" class="font-orbitron text-white">--</span>
                                </div>
                            </div>
                            <p id="drowsiness-alert-message" class="text-xs text-gray-500 mt-4">No active alert.</p>
                            <p id="drowsiness-sensitivity-params" class="text-xs text-gray-500 mt-2">Sensitivity parameters: --</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const root = document.getElementById('drowsiness-page-root');
    const backendInput = document.getElementById('drowsiness-api-base') as HTMLInputElement | null;
    const connectButton = document.getElementById('drowsiness-connect-btn') as HTMLButtonElement | null;
    const browserCamButton = document.getElementById('drowsiness-browser-cam-btn') as HTMLButtonElement | null;
    const voiceButton = document.getElementById('drowsiness-voice-btn') as HTMLButtonElement | null;
    const videoFeed = document.getElementById('drowsiness-video-feed') as HTMLImageElement | null;
    const browserVideo = document.getElementById('drowsiness-browser-video') as HTMLVideoElement | null;
    const sourceLabel = document.getElementById('drowsiness-source-label');

    let usingBrowserCamera = false;
    let browserStream: MediaStream | null = null;
    let browserUploadInterval: ReturnType<typeof setInterval> | null = null;
    let browserUploadInFlight = false;
    const browserCanvas = document.createElement('canvas');

    if (backendInput) {
        backendInput.value = apiBase;
    }

    const speakAlert = (message: string) => {
        if (!('speechSynthesis' in window)) {
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const applyVideoSource = () => {
        if (!videoFeed) {
            return;
        }

        if (usingBrowserCamera) {
            if (sourceLabel) {
                sourceLabel.textContent = 'browser://camera';
            }
            return;
        }

        const separator = apiBase.includes('?') ? '&' : '?';
        videoFeed.src = `${apiBase}/video_feed${separator}v=${Date.now()}`;
        if (sourceLabel) {
            sourceLabel.textContent = apiBase;
        }
    };

    const stopBrowserCamera = () => {
        usingBrowserCamera = false;

        if (browserUploadInterval) {
            clearInterval(browserUploadInterval);
            browserUploadInterval = null;
        }

        if (browserStream) {
            for (const track of browserStream.getTracks()) {
                track.stop();
            }
            browserStream = null;
        }

        if (browserVideo) {
            browserVideo.pause();
            browserVideo.srcObject = null;
            browserVideo.classList.add('hidden');
        }

        if (videoFeed) {
            videoFeed.classList.remove('hidden');
        }

        if (browserCamButton) {
            browserCamButton.textContent = 'Use Browser Camera';
            browserCamButton.className =
                'px-5 py-3 border border-emerald-400/50 rounded-lg text-emerald-300 hover:bg-emerald-400/10 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap';
        }
    };

    const uploadBrowserFrame = async () => {
        if (!usingBrowserCamera || browserUploadInFlight || !browserVideo || browserVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            return;
        }

        browserUploadInFlight = true;
        try {
            const width = browserVideo.videoWidth || 800;
            const height = browserVideo.videoHeight || 500;

            browserCanvas.width = width;
            browserCanvas.height = height;

            const ctx = browserCanvas.getContext('2d');
            if (!ctx) {
                return;
            }

            ctx.drawImage(browserVideo, 0, 0, width, height);

            const blob = await new Promise<Blob | null>((resolve) => {
                browserCanvas.toBlob(resolve, 'image/jpeg', 0.75);
            });

            if (!blob) {
                return;
            }

            const body = new FormData();
            body.append('frame', blob, 'browser-frame.jpg');

            const response = await fetch(`${apiBase}/browser_frame`, {
                method: 'POST',
                body,
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Frame upload failed with code ${response.status}`);
            }
        } catch {
            showOfflineState('Browser camera frame upload failed. Check backend and reconnect.');
        } finally {
            browserUploadInFlight = false;
        }
    };

    const startBrowserCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            showOfflineState('Browser camera is not supported in this browser/environment.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user'
                },
                audio: false
            });

            stopBrowserCamera();

            browserStream = stream;
            usingBrowserCamera = true;

            if (videoFeed) {
                videoFeed.classList.add('hidden');
            }

            if (browserVideo) {
                browserVideo.srcObject = stream;
                browserVideo.classList.remove('hidden');
                await browserVideo.play();
            }

            if (sourceLabel) {
                sourceLabel.textContent = 'browser://camera';
            }

            if (browserCamButton) {
                browserCamButton.textContent = 'Stop Browser Camera';
                browserCamButton.className =
                    'px-5 py-3 border border-red-400/60 rounded-lg text-red-300 bg-red-400/10 hover:bg-red-400/20 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap';
            }

            setConnectionState(true);

            browserUploadInterval = setInterval(() => {
                void uploadBrowserFrame();
            }, 200);

            await uploadBrowserFrame();
        } catch {
            showOfflineState('Camera permission denied or no browser camera is available.');
            stopBrowserCamera();
        }
    };

    const setConnectionState = (online: boolean) => {
        const dot = document.getElementById('drowsiness-connection-dot');
        const text = document.getElementById('drowsiness-connection-text');
        if (!dot || !text) {
            return;
        }

        dot.classList.toggle('bg-green-500', online);
        dot.classList.toggle('bg-red-500', !online);

        text.textContent = online ? 'Backend Online' : 'Backend Offline';
        text.classList.toggle('text-green-400', online);
        text.classList.toggle('text-red-400', !online);
    };

    const showOfflineState = (message: string) => {
        setConnectionState(false);
        const driverLabel = document.getElementById('drowsiness-driver-label');
        const driverDescription = document.getElementById('drowsiness-driver-description');
        const stateCard = document.getElementById('drowsiness-state-card');

        if (driverLabel) {
            driverLabel.textContent = 'OFFLINE';
            driverLabel.className = 'text-2xl font-orbitron font-bold text-red-400';
        }
        if (driverDescription) {
            driverDescription.textContent = message;
        }
        if (stateCard) {
            stateCard.className = 'bg-gradient-to-br from-red-500/15 to-red-900/10 border border-red-500/30 rounded-xl p-6 fade-in-section';
        }
    };

    const formatMetric = (value: number | undefined): string => {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return '--';
        }

        return value.toFixed(2);
    };

    const renderStatus = (status: DrowsinessStatus) => {
        const risk = Number.isFinite(status.risk_percent) ? Math.max(0, Math.min(100, status.risk_percent)) : 0;
        const riskValue = document.getElementById('drowsiness-risk-value');
        const riskBar = document.getElementById('drowsiness-risk-bar');
        const perclosValue = document.getElementById('drowsiness-perclos');
        const eyeStateValue = document.getElementById('drowsiness-eye-state');
        const faceStateValue = document.getElementById('drowsiness-face-state');
        const yawnStateValue = document.getElementById('drowsiness-yawn-state');
        const calibrationValue = document.getElementById('drowsiness-calibration-state');
        const earValue = document.getElementById('drowsiness-ear-value');
        const marValue = document.getElementById('drowsiness-mar-value');
        const alertLevelValue = document.getElementById('drowsiness-alert-level');
        const alertMessageValue = document.getElementById('drowsiness-alert-message');
        const sensitivityValue = document.getElementById('drowsiness-sensitivity-value');
        const emotionStateValue = document.getElementById('drowsiness-emotion-state');
        const landmarkBackendValue = document.getElementById('drowsiness-landmark-backend');
        const sensitivityParamsValue = document.getElementById('drowsiness-sensitivity-params');
        const processBadge = document.getElementById('drowsiness-process-badge');
        const driverLabel = document.getElementById('drowsiness-driver-label');
        const driverDescription = document.getElementById('drowsiness-driver-description');
        const stateCard = document.getElementById('drowsiness-state-card');
        const updatedAt = document.getElementById('drowsiness-last-update');
        const sensitivityScore = Number.isFinite(status.sensitivity_score) ? Math.max(0, Math.min(100, status.sensitivity_score ?? 0)) : 0;
        const sensitivityState = (status.sensitivity_state || 'stable').toString();
        const landmarkBackend = (status.landmark_backend || '--').toString();
        const params = status.sensitivity_parameters || {};

        if (riskValue) {
            riskValue.textContent = `${risk}%`;
            riskValue.className = `text-3xl font-orbitron font-bold ${risk >= 85 ? 'text-red-400' : risk >= 60 ? 'text-yellow-400' : 'text-green-400'}`;
        }

        if (riskBar) {
            riskBar.style.width = `${risk}%`;
            riskBar.className = `h-full rounded-full transition-all duration-300 ${risk >= 85 ? 'bg-red-500' : risk >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`;
        }

        if (perclosValue) {
            perclosValue.textContent = formatMetric(status.perclos);
        }
        if (eyeStateValue) {
            eyeStateValue.textContent = status.eye_closed ? 'CLOSED' : 'OPEN';
            eyeStateValue.className = `text-2xl font-orbitron font-bold ${status.eye_closed ? 'text-yellow-400' : 'text-green-400'}`;
        }
        if (faceStateValue) {
            faceStateValue.textContent = `Face: ${status.face_present ? 'Detected' : 'Not detected'}`;
        }
        if (yawnStateValue) {
            yawnStateValue.textContent = status.yawn_active ? 'YES' : 'NO';
            yawnStateValue.className = `text-2xl font-orbitron font-bold ${status.yawn_active ? 'text-yellow-400' : 'text-green-400'}`;
        }
        if (calibrationValue) {
            calibrationValue.textContent = status.calibrated ? 'Calibration complete' : 'Calibration pending';
        }

        if (earValue) {
            earValue.textContent = `${formatMetric(status.ear)} / ${formatMetric(status.ear_threshold)}`;
        }
        if (marValue) {
            marValue.textContent = `${formatMetric(status.mar)} / ${formatMetric(status.mar_threshold)}`;
        }

        if (alertLevelValue) {
            alertLevelValue.textContent = status.alert_level;
            alertLevelValue.className = `font-orbitron uppercase ${status.alert_level === 'high' ? 'text-red-400' : status.alert_level === 'medium' ? 'text-yellow-400' : 'text-green-400'}`;
        }
        if (alertMessageValue) {
            alertMessageValue.textContent = status.alert_message || 'No active alert.';
            alertMessageValue.className = `text-xs mt-4 ${status.alert_level === 'high' ? 'text-red-300' : status.alert_level === 'medium' ? 'text-yellow-300' : 'text-gray-500'}`;
        }

        if (sensitivityValue) {
            sensitivityValue.textContent = `${sensitivityScore}%`;
            sensitivityValue.className = `font-orbitron ${sensitivityScore >= 70 ? 'text-red-400' : sensitivityScore >= 45 ? 'text-yellow-400' : 'text-green-400'}`;
        }

        if (emotionStateValue) {
            emotionStateValue.textContent = sensitivityState;
            emotionStateValue.className = `font-orbitron uppercase ${sensitivityScore >= 70 ? 'text-red-400' : sensitivityScore >= 45 ? 'text-yellow-400' : 'text-green-400'}`;
        }

        if (landmarkBackendValue) {
            landmarkBackendValue.textContent = landmarkBackend;
        }

        if (sensitivityParamsValue) {
            const frown = typeof params.frown === 'number' ? params.frown.toFixed(2) : '--';
            const browUp = typeof params.brow_up === 'number' ? params.brow_up.toFixed(2) : '--';
            const eyeWide = typeof params.eye_wide === 'number' ? params.eye_wide.toFixed(2) : '--';
            const jawOpen = typeof params.jaw_open === 'number' ? params.jaw_open.toFixed(2) : '--';
            sensitivityParamsValue.textContent = `Sensitivity parameters: frown=${frown}, brow_up=${browUp}, eye_wide=${eyeWide}, jaw_open=${jawOpen}`;
        }

        if (processBadge) {
            const source = status.source || 'backend';
            const activeText = status.processing_active ? 'Processing' : 'Idle';
            processBadge.textContent = `AI Monitor • ${activeText} • ${landmarkBackend} • ${source}`;
        }

        const isHighRisk = status.alert_level === 'high' || risk >= 85;
        const isMediumRisk = status.alert_level === 'medium' || risk >= 60;
        const isEmotional = sensitivityScore >= 70 || sensitivityState === 'emotional';
        const isSensitive = sensitivityScore >= 45 || sensitivityState === 'sensitive';
        const noFaceDetected = !status.face_present;

        if (driverLabel && driverDescription && stateCard) {
            if (isHighRisk) {
                driverLabel.textContent = 'DROWSY';
                driverLabel.className = 'text-2xl font-orbitron font-bold text-red-400';
                driverDescription.textContent = 'Driver appears drowsy. Please stop the vehicle safely and rest immediately.';
                stateCard.className = 'bg-gradient-to-br from-red-500/15 to-red-900/10 border border-red-500/30 rounded-xl p-6 fade-in-section';
            } else if (isEmotional) {
                driverLabel.textContent = 'EMOTIONAL';
                driverLabel.className = 'text-2xl font-orbitron font-bold text-orange-400';
                driverDescription.textContent = 'High emotional stress detected. You may not concentrate to drive. Calm down before continuing.';
                stateCard.className = 'bg-gradient-to-br from-orange-500/15 to-orange-900/10 border border-orange-500/30 rounded-xl p-6 fade-in-section';
            } else if (isSensitive) {
                driverLabel.textContent = 'SENSITIVE';
                driverLabel.className = 'text-2xl font-orbitron font-bold text-yellow-400';
                driverDescription.textContent = 'Emotional sensitivity is elevated. Take deep breaths and refocus on driving.';
                stateCard.className = 'bg-gradient-to-br from-yellow-500/15 to-yellow-900/10 border border-yellow-500/30 rounded-xl p-6 fade-in-section';
            } else if (isMediumRisk) {
                driverLabel.textContent = 'WARNING';
                driverLabel.className = 'text-2xl font-orbitron font-bold text-yellow-400';
                driverDescription.textContent = 'Fatigue signals are rising. Stay alert and plan a short break.';
                stateCard.className = 'bg-gradient-to-br from-yellow-500/15 to-yellow-900/10 border border-yellow-500/30 rounded-xl p-6 fade-in-section';
            } else if (noFaceDetected) {
                driverLabel.textContent = 'NO FACE';
                driverLabel.className = 'text-2xl font-orbitron font-bold text-cyan-400';
                driverDescription.textContent = 'No face detected in camera frame. Align camera toward the driver.';
                stateCard.className = 'bg-gradient-to-br from-cyan-500/15 to-cyan-900/10 border border-cyan-500/30 rounded-xl p-6 fade-in-section';
            } else {
                driverLabel.textContent = 'SAFE';
                driverLabel.className = 'text-2xl font-orbitron font-bold text-green-400';
                driverDescription.textContent = 'Driver is alert and no drowsiness condition is detected.';
                stateCard.className = 'bg-gradient-to-br from-green-500/15 to-green-900/10 border border-green-500/30 rounded-xl p-6 fade-in-section';
            }
        }

        if (updatedAt) {
            const formatted = Number.isFinite(status.updated_at)
                ? new Date(status.updated_at * 1000).toLocaleTimeString('en-IN', { hour12: false })
                : '--:--:--';
            updatedAt.textContent = formatted;
        }

        if (status.alert_seq > lastAlertSequence) {
            lastAlertSequence = status.alert_seq;
            if (voiceAlertsEnabled && status.alert_level !== 'none' && status.alert_message) {
                speakAlert(status.alert_message);
            }
        }
    };

    const pollStatus = async () => {
        if (requestInFlight) {
            return;
        }

        requestInFlight = true;
        try {
            const response = await fetch(`${apiBase}/status`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Status fetch failed with code ${response.status}`);
            }

            const status = (await response.json()) as DrowsinessStatus;
            setConnectionState(true);
            renderStatus(status);
        } catch {
            showOfflineState('Cannot reach drowsiness backend. Verify endpoint and start run_ml_backend.py.');
        } finally {
            requestInFlight = false;
        }
    };

    const reconnect = () => {
        if (backendInput) {
            apiBase = normalizeApiBase(backendInput.value || apiBase);
            backendInput.value = apiBase;
        }

        localStorage.setItem(API_STORAGE_KEY, apiBase);
        applyVideoSource();
        void pollStatus();

        if (usingBrowserCamera) {
            void uploadBrowserFrame();
        }
    };

    connectButton?.addEventListener('click', reconnect);
    browserCamButton?.addEventListener('click', () => {
        if (usingBrowserCamera) {
            stopBrowserCamera();
            applyVideoSource();
            void pollStatus();
            return;
        }

        void startBrowserCamera();
    });
    backendInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            reconnect();
        }
    });

    voiceButton?.addEventListener('click', () => {
        voiceAlertsEnabled = !voiceAlertsEnabled;
        voiceButton.textContent = voiceAlertsEnabled ? 'Voice Alerts On' : 'Voice Alerts Off';
        voiceButton.className = voiceAlertsEnabled
            ? 'px-5 py-3 border border-green-400/60 rounded-lg text-green-300 bg-green-400/10 hover:bg-green-400/20 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap'
            : 'px-5 py-3 border border-cyan-400/50 rounded-lg text-cyan-300 hover:bg-cyan-400/10 transition-all uppercase text-xs tracking-[0.12em] font-orbitron font-bold whitespace-nowrap';

        if (!voiceAlertsEnabled && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    });

    applyVideoSource();
    void pollStatus();

    statusPollInterval = setInterval(() => {
        if (!root || !document.body.contains(root)) {
            stopBrowserCamera();
            stopPolling();
            return;
        }

        void pollStatus();
    }, POLL_INTERVAL_MS);
}