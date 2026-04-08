import { authService } from '../utils/auth';

// ═══════════════════════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════════════════════
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    processingTime?: number;
}

type ChatMode = 'free' | 'document';

interface HealthStatus { status: string; active_sessions: number; timestamp: number; }
interface SessionStatus { exists: boolean; processed_at?: number; file_path?: string; document_count?: number; }
interface SpeechToTextResult { text: string; language: string; processing_time: number; model: string; }

// ═══════════════════════════════════════════════════════════════════════════
//  API Service
// ═══════════════════════════════════════════════════════════════════════════
class EVAdvisorService {
    baseUrl: string;
    constructor() {
        // Always use same-origin proxy path — Vite proxies /api/rag/* to localhost:8001
        // This avoids all CORS and Codespaces port-visibility issues.
        this.baseUrl = '/api/rag';
        console.log('🔗 Backend via Vite proxy:', this.baseUrl);
    }

    async healthCheck(): Promise<HealthStatus> {
        const r = await this.fetchR(`${this.baseUrl}/health`, { method: 'GET' });
        return r.json();
    }

    async freeChat(message: string): Promise<{ response: string; processing_time: number }> {
        const r = await this.fetchR(`${this.baseUrl}/free-chat`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (!r.ok) { const e = await r.json().catch(() => ({ detail: 'Network error' })); throw new Error(e.detail || 'Chat failed'); }
        return r.json();
    }

    async uploadPDF(file: File) {
        const f = new FormData(); f.append('file', file);
        // Use fetchR with retry logic for uploads too
        const r = await this.fetchR(`${this.baseUrl}/upload`, { method: 'POST', body: f }, 3);
        if (!r.ok) { const e = await r.json().catch(() => ({ detail: 'Upload failed' })); throw new Error(e.detail || 'Upload failed'); }
        return r.json() as Promise<{ success: boolean; session_id: string; message: string; file_hash: string; document_count: number }>;
    }

    async docChat(message: string, sessionId: string) {
        const r = await this.fetchR(`${this.baseUrl}/chat`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: sessionId }),
        });
        if (!r.ok) { const e = await r.json().catch(() => ({ detail: 'Chat failed' })); throw new Error(e.detail || 'Chat failed'); }
        return r.json() as Promise<{ response: string; session_id: string; processing_time: number }>;
    }

    async speechToText(audioFile: File): Promise<SpeechToTextResult> {
        const f = new FormData();
        f.append('file', audioFile);
        const r = await this.fetchR(`${this.baseUrl}/speech-to-text`, { method: 'POST', body: f }, 1);
        if (!r.ok) {
            const e = await r.json().catch(() => ({ detail: 'Speech transcription failed' }));
            throw new Error(e.detail || 'Speech transcription failed');
        }
        return r.json();
    }

    async textToSpeech(text: string, language = 'en', slow = false): Promise<Blob> {
        const r = await this.fetchR(`${this.baseUrl}/text-to-speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language, slow }),
        }, 1, 60_000);
        if (!r.ok) {
            const e = await r.json().catch(() => ({ detail: 'Text to speech failed' }));
            throw new Error(e.detail || 'Text to speech failed');
        }
        return r.blob();
    }

    async sessionStatus(sid: string): Promise<SessionStatus> {
        return (await fetch(`${this.baseUrl}/sessions/${sid}/status`)).json();
    }

    async deleteSession(sid: string) {
        await fetch(`${this.baseUrl}/sessions/${sid}`, { method: 'DELETE' });
    }

    /**
     * Fetch with retry.
     * ⚠ DO NOT use `credentials: 'include'` — the backend returns
     *   Access-Control-Allow-Origin: * which browsers reject when
     *   credentials are included (CORS specification).
     */
    private async fetchR(url: string, opts: RequestInit, retries = 2, timeoutMs = 30_000): Promise<Response> {
        let last: Error | null = null;
        for (let i = 0; i <= retries; i++) {
            try {
                const ac = new AbortController();
                const t = setTimeout(() => ac.abort(), timeoutMs);
                const r = await fetch(url, { ...opts, signal: ac.signal });
                clearTimeout(t);
                if ((r.status === 429 || r.status === 503) && i < retries) { await this.wait(2 ** i * 1000); continue; }
                return r;
            } catch (e) {
                last = e as Error;
                if (i < retries) await this.wait(2 ** i * 1000);
            }
        }
        throw last || new Error('Request failed after all retries');
    }

    private wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }
}

const api = new EVAdvisorService();

// ═══════════════════════════════════════════════════════════════════════════
//  Constants
// ═══════════════════════════════════════════════════════════════════════════
const CHIPS = [
    { icon: 'fa-hand-holding-dollar', q: 'What subsidies are available under FAME II for e-2W buyers?', color: 'rgba(34, 197, 94, 0.15)' },
    { icon: 'fa-file-invoice',        q: 'List the EV registration & road-tax exemptions in Maharashtra.', color: 'rgba(59, 130, 246, 0.15)' },
    { icon: 'fa-battery-full',        q: 'Explain BIS AIS-156 battery safety standards.', color: 'rgba(168, 85, 247, 0.15)' },
    { icon: 'fa-percent',             q: 'What are the GST rates on EVs vs ICE vehicles?', color: 'rgba(245, 158, 11, 0.15)' },
    { icon: 'fa-charging-station',    q: 'How to get approval for setting up a public EV charging station?', color: 'rgba(20, 184, 166, 0.15)' },
    { icon: 'fa-landmark',            q: 'What is Section 80EEB income-tax benefit on EV loans?', color: 'rgba(236, 72, 153, 0.15)' },
];

const STORE_KEY = 'evbharat_chat_history';

// ═══════════════════════════════════════════════════════════════════════════
//  Chat persistence
// ═══════════════════════════════════════════════════════════════════════════
function saveChat(msgs: ChatMessage[]) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(msgs.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })))); } catch { /* */ }
}
function loadChat(): ChatMessage[] {
    try {
        const r = localStorage.getItem(STORE_KEY);
        if (!r) return [];
        return (JSON.parse(r) as Array<Record<string, unknown>>).map(m => ({ ...m, timestamp: new Date(m.timestamp as string) })) as ChatMessage[];
    } catch { return []; }
}
function clearChat() { localStorage.removeItem(STORE_KEY); }

// ═══════════════════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════════════════
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const timeStr = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

function md(raw: string): string {
    let h = esc(raw);
    h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang: string, code: string) => {
        const lb = lang ? `<span style="position:absolute;top:4px;right:8px;font-size:9px;color:#6b7280;text-transform:uppercase">${lang}</span>` : '';
        return `<div style="position:relative;margin:8px 0"><pre style="background:rgba(0,0,0,.45);border:1px solid rgba(75,85,99,.3);border-radius:8px;padding:12px 14px;overflow-x:auto;font-size:12px;line-height:1.6"><code>${lb}${code.trim()}</code></pre></div>`;
    });
    h = h.replace(/`([^`]+)`/g, '<code style="background:rgba(55,65,81,.6);color:rgba(212,175,55,.85);padding:1px 6px;border-radius:4px;font-size:12px">$1</code>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e5e7eb;font-weight:600">$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#D4AF37;text-decoration:underline">$1</a>');
    h = h.replace(/^####\s+(.+)$/gm, '<h5 style="font-weight:600;color:rgba(212,175,55,.8);margin-top:8px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">$1</h5>');
    h = h.replace(/^###\s+(.+)$/gm, '<h4 style="font-weight:600;color:#D4AF37;margin-top:10px;font-size:14px">$1</h4>');
    h = h.replace(/^##\s+(.+)$/gm, '<h3 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:16px">$1</h3>');
    h = h.replace(/^#\s+(.+)$/gm, '<h2 style="font-weight:700;color:#D4AF37;margin-top:12px;font-size:18px">$1</h2>');
    h = h.replace(/^[\-\*]\s+(.+)$/gm, '<li style="margin-left:16px;list-style:disc;color:#d1d5db">$1</li>');
    h = h.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-left:16px;list-style:decimal;color:#d1d5db">$1</li>');
    h = h.replace(/^---$/gm, '<hr style="border-color:rgba(75,85,99,.3);margin:12px 0">');
    h = h.replace(/\n/g, '<br>');
    return h;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Page renderer
// ═══════════════════════════════════════════════════════════════════════════
export async function renderRAGChatPage() {
    if (!authService.isAuthenticated()) { window.location.href = '/auth'; return; }
    const app = document.getElementById('app');
    if (!app) return;

    // ── State ─────────────────────────────────────────────────────────────
    const messages: ChatMessage[] = loadChat();
    let mode: ChatMode = 'free';
    let sessionId: string | null = null;
    let busy = false;
    let uploading = false;
    let uploadName: string | null = null;
    let online = false;
    let isRecording = false;
    let isTranscribing = false;
    let ttsEnabled = false;
    let recorder: MediaRecorder | null = null;
    let recordingStream: MediaStream | null = null;
    let audioChunks: BlobPart[] = [];
    let audioPlayer: HTMLAudioElement | null = null;
    let lastAssistantReply = '';
    let ttsLanguage = 'en';
    let ttsSlow = false;
    let ttsVolume = 1;
    let recordingStartedAt = 0;
    let recordingTicker: number | null = null;

    // ── Health ────────────────────────────────────────────────────────────
    async function checkHealth(): Promise<boolean> {
        try {
            const h = await api.healthCheck();
            online = h.status === 'healthy';
            setHealth(online, h.active_sessions);
            return online;
        } catch {
            online = false;
            setHealth(false, 0);
            return false;
        }
    }
    function setHealth(on: boolean, n: number) {
        document.querySelectorAll<HTMLElement>('.ev-health-dot').forEach(d => {
            d.style.background = on ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)';
            d.style.boxShadow = on ? '0 0 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : '0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
            d.style.animation = on ? 'evPulse 2s infinite' : 'none';
        });
        document.querySelectorAll<HTMLElement>('.ev-health-text').forEach(l => {
            l.textContent = on ? '🟢 Online' : '🔴 Offline';
            l.style.color = on ? '#10b981' : '#ef4444';
            l.style.fontWeight = '600';
        });
        const sc = document.getElementById('ev-sessions');
        if (sc) sc.textContent = on ? `⚡ ${n} active session${n !== 1 ? 's' : ''}` : '⚠️ Backend unreachable';
    }

    // ── Messages ──────────────────────────────────────────────────────────
    function renderMsgs() {
        const box = document.getElementById('ev-messages');
        if (!box) return;
        if (!messages.length) { box.innerHTML = welcomeHTML(); wireChips(); return; }

        box.innerHTML = messages.map(m => {
            if (m.role === 'system') return `<div style="display:flex;justify-content:center;margin:12px 0"><span style="font-size:11px;color:#6b7280;background:rgba(31,41,55,.6);padding:3px 12px;border-radius:999px"><i class="fa-solid fa-info-circle" style="margin-right:4px;color:#3b82f6"></i>${esc(m.content)}</span></div>`;
            const u = m.role === 'user';
            const userIcon = u ? '👤' : '🤖';
            return `
            <div style="display:flex;justify-content:${u ? 'flex-end' : 'flex-start'};margin-bottom:16px" class="ev-msg-row">
                ${!u ? `<div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,rgba(212,175,55,.25),rgba(212,175,55,.08));display:flex;align-items:center;justify-content:center;margin-right:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.15)"><span style="font-size:12px">${userIcon}</span></div>` : ''}
                <div style="max-width:78%;padding:12px 16px;border-radius:16px;${u
                    ? 'border-bottom-right-radius:6px;background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04));border:1px solid rgba(212,175,55,.18)'
                    : 'border-bottom-left-radius:6px;background:rgba(31,41,55,.45);border:1px solid rgba(55,65,81,.4)'
                };box-shadow:0 2px 8px rgba(0,0,0,.15)">
                    <div style="font-size:13px;line-height:1.65;color:${u ? '#e5e7eb' : '#d1d5db'}">${u ? esc(m.content) : md(m.content)}</div>
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.2);gap:8px">
                        <span style="font-size:10px;color:#4b5563">🕐 ${timeStr(m.timestamp)}</span>
                        <div style="display:flex;align-items:center;gap:6px">
                            ${m.processingTime != null ? `<span style="font-size:10px;color:#6b7280"><i class="fa-solid fa-stopwatch" style="margin-right:2px;color:#8b5cf6"></i>${m.processingTime.toFixed(2)}s</span>` : ''}
                            ${!u ? `<button data-copy="${m.id}" class="ev-copy" style="opacity:0;font-size:10px;color:#6b7280;cursor:pointer;background:none;border:none;transition:all .15s" title="📋 Copy"><i class="fa-regular fa-copy"></i></button>` : ''}
                        </div>
                    </div>
                </div>
                ${u ? `<div style="width:28px;height:28px;border-radius:8px;background:rgba(212,175,55,.12);display:flex;align-items:center;justify-content:center;margin-left:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.12)"><span style="font-size:12px">${userIcon}</span></div>` : ''}
            </div>`;
        }).join('');

        document.querySelectorAll<HTMLButtonElement>('.ev-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const m = messages.find(x => x.id === btn.dataset.copy);
                if (m) navigator.clipboard.writeText(m.content).then(() => {
                    btn.innerHTML = '<i class="fa-solid fa-check" style="color:#34d399"></i>';
                    setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 1500);
                });
            });
        });
        scrollEnd();
    }

    function welcomeHTML(): string {
        return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 20px;text-align:center">
            <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg, #D4AF37, rgba(212,175,55,.6));border:2px solid rgba(212,175,55,.25);display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 8px 32px rgba(212,175,55,.15), inset 0 2px 0 rgba(255,255,255,.1);position:relative;overflow:hidden" class="ev-logo-animate">
                <i class="fa-solid fa-bolt" style="color:#000;font-size:32px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"></i>
                <div style="position:absolute;inset:0;background:linear-gradient(45deg, transparent 30%, rgba(255,255,255,.1) 50%, transparent 70%);animation:evShimmer 3s infinite"></div>
            </div>
            <h3 style="font-family:'Orbitron',sans-serif;font-size:24px;font-weight:800;margin-bottom:12px;letter-spacing:.5px;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 2px 8px rgba(212,175,55,.3)">⚡ EV Compliance Advisor</h3>
            <p style="font-size:15px;color:#c1c7cd;max-width:480px;margin-bottom:8px;line-height:1.5;font-weight:400">🔍 Ask any question about Indian EV regulations, subsidies, licensing, or upload a document for in-depth analysis.</p>
            <p style="font-size:12px;color:#64748b;max-width:420px;margin-bottom:40px;line-height:1.4">🚀 Powered by Google Gemini │ 📊 Knowledge covers FAME II, PM E-DRIVE, PLI, state policies & more</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;width:100%;max-width:640px">
                ${CHIPS.map((c, i) => `
                <button data-chip="${i}" class="ev-chip" style="display:flex;align-items:flex-start;gap:12px;text-align:left;font-size:13px;padding:16px 18px;border-radius:16px;border:1px solid rgba(55,65,81,.3);background:linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6));color:#d1d5db;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);line-height:1.5;position:relative;overflow:hidden;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                    <div style="width:32px;height:32px;border-radius:8px;background:${c.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <i class="fa-solid ${c.icon}" style="color:#D4AF37;font-size:14px"></i>
                    </div>
                    <span style="font-weight:500">${esc(c.q)}</span>
                    <div style="position:absolute;inset:0;background:linear-gradient(135deg, transparent, rgba(212,175,55,.05));opacity:0;transition:opacity .3s"></div>
                </button>`).join('')}
            </div>
        </div>`;
    }

    function wireChips() {
        document.querySelectorAll<HTMLButtonElement>('.ev-chip').forEach(b => {
            b.addEventListener('click', () => {
                b.style.transform = 'scale(0.98)';
                setTimeout(() => { b.style.transform = ''; }, 150);
                send(CHIPS[+(b.dataset.chip || '0')].q);
            });
            b.addEventListener('mouseenter', () => {
                b.style.borderColor = 'rgba(212,175,55,.4)';
                b.style.background = 'linear-gradient(135deg, rgba(212,175,55,.08), rgba(31,41,55,.6))';
                b.style.color = '#f1f5f9';
                b.style.transform = 'translateY(-2px)';
                b.style.boxShadow = '0 8px 25px rgba(212,175,55,.15), 0 2px 8px rgba(0,0,0,.1)';
                const overlay = b.querySelector('div:last-child') as HTMLElement;
                if (overlay) overlay.style.opacity = '1';
            });
            b.addEventListener('mouseleave', () => {
                b.style.borderColor = 'rgba(55,65,81,.3)';
                b.style.background = 'linear-gradient(135deg, rgba(31,41,55,.4), rgba(17,24,39,.6))';
                b.style.color = '#d1d5db';
                b.style.transform = '';
                b.style.boxShadow = '0 2px 8px rgba(0,0,0,.1)';
                const overlay = b.querySelector('div:last-child') as HTMLElement;
                if (overlay) overlay.style.opacity = '0';
            });
        });
    }

    function scrollEnd() {
        const el = document.getElementById('ev-messages');
        if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }

    function setVoiceStatus(msg: string, type: 'info' | 'success' | 'error' = 'info') {
        const el = document.getElementById('ev-voice-status');
        if (!el) return;
        const color = type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : '#9ca3af';
        el.textContent = msg;
        el.style.color = color;
    }

    function setVoiceHint(msg: string) {
        const el = document.getElementById('ev-voice-hint');
        if (el) el.textContent = msg;
    }

    function formatDuration(totalSeconds: number): string {
        const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const ss = String(totalSeconds % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    }

    function updateMicButton(active: boolean) {
        const btn = document.getElementById('ev-mic') as HTMLButtonElement | null;
        const icon = document.getElementById('ev-mic-icon');
        const text = document.getElementById('ev-mic-text');
        const dot = document.getElementById('ev-mic-dot');
        if (!btn) return;

        btn.classList.toggle('ev-mic-recording', active);
        btn.style.background = active
            ? 'linear-gradient(135deg, rgba(239,68,68,.95), rgba(249,115,22,.85))'
            : 'linear-gradient(135deg, rgba(31,41,55,.9), rgba(17,24,39,.7))';
        btn.style.borderColor = active ? 'rgba(248,113,113,.65)' : 'rgba(75,85,99,.35)';
        btn.style.color = active ? '#ffffff' : '#e5e7eb';
        btn.title = active ? 'Stop voice recording' : 'Start voice input';

        if (icon) icon.className = active ? 'fa-solid fa-stop' : 'fa-solid fa-microphone-lines';
        if (text) text.textContent = active ? 'Stop Voice' : 'Start Voice';
        if (dot) {
            dot.style.background = active ? '#ffffff' : '#34d399';
            dot.style.opacity = active ? '1' : '.75';
        }
    }

    function updateTtsButton(active: boolean) {
        const btn = document.getElementById('ev-tts-toggle') as HTMLButtonElement | null;
        const text = document.getElementById('ev-tts-toggle-text');
        if (!btn) return;

        btn.style.background = active
            ? 'linear-gradient(135deg, rgba(16,185,129,.25), rgba(52,211,153,.12))'
            : 'linear-gradient(135deg, rgba(31,41,55,.7), rgba(17,24,39,.5))';
        btn.style.borderColor = active ? 'rgba(52,211,153,.45)' : 'rgba(75,85,99,.3)';
        btn.style.color = active ? '#34d399' : '#9ca3af';
        btn.title = active ? 'Disable auto voice replies' : 'Enable auto voice replies';
        if (text) text.textContent = active ? 'Auto Voice: On' : 'Auto Voice: Off';
    }

    function updatePlaybackControls() {
        const playBtn = document.getElementById('ev-tts-play') as HTMLButtonElement | null;
        const pauseBtn = document.getElementById('ev-tts-pause') as HTMLButtonElement | null;
        const stopBtn = document.getElementById('ev-tts-stop') as HTMLButtonElement | null;
        const pauseText = document.getElementById('ev-tts-pause-text');

        if (playBtn) {
            const canPlay = Boolean(lastAssistantReply) || Boolean(audioPlayer);
            playBtn.disabled = !canPlay;
            playBtn.style.opacity = canPlay ? '1' : '.45';
            playBtn.style.cursor = canPlay ? 'pointer' : 'not-allowed';
        }

        const hasPlayer = Boolean(audioPlayer);
        if (pauseBtn) {
            pauseBtn.disabled = !hasPlayer;
            pauseBtn.style.opacity = hasPlayer ? '1' : '.45';
            pauseBtn.style.cursor = hasPlayer ? 'pointer' : 'not-allowed';
            if (pauseText) pauseText.textContent = audioPlayer?.paused ? 'Resume' : 'Pause';
        }

        if (stopBtn) {
            stopBtn.disabled = !hasPlayer;
            stopBtn.style.opacity = hasPlayer ? '1' : '.45';
            stopBtn.style.cursor = hasPlayer ? 'pointer' : 'not-allowed';
        }
    }

    function cleanupRecordingStream() {
        if (recordingStream) {
            recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;
        }
    }

    function clearRecordingTicker() {
        if (recordingTicker !== null) {
            window.clearInterval(recordingTicker);
            recordingTicker = null;
        }
    }

    function normalizedSpeechText(text: string): string {
        return text
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`[^`]*`/g, ' ')
            .replace(/[>#*_~\[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async function transcribeAudioBlob(blob: Blob, inputEl: HTMLInputElement) {
        if (isTranscribing) return;
        isTranscribing = true;
        setVoiceStatus('Transcribing audio...', 'info');
        setVoiceHint('Listening to your recorded input');
        try {
            const ext = blob.type.includes('ogg')
                ? 'ogg'
                : blob.type.includes('mp4') || blob.type.includes('m4a')
                    ? 'm4a'
                    : blob.type.includes('wav')
                        ? 'wav'
                        : 'webm';

            const audioFile = new File([blob], `voice-input.${ext}`, {
                type: blob.type || 'audio/webm',
            });

            const result = await api.speechToText(audioFile);
            const transcript = result.text?.trim();
            if (!transcript) {
                setVoiceStatus('No speech detected. Please try again.', 'error');
                setVoiceHint('Try speaking closer to the microphone');
                return;
            }

            inputEl.value = inputEl.value.trim()
                ? `${inputEl.value.trim()} ${transcript}`
                : transcript;
            inputEl.focus();
            setVoiceStatus(`Voice recognized (${result.language.toUpperCase()})`, 'success');
            setVoiceHint('You can edit the transcribed text before sending');
        } catch (err) {
            const msg = (err as Error).message || 'Voice transcription failed';
            setVoiceStatus(`Voice input failed: ${msg}`, 'error');
            setVoiceHint('Check microphone permission and try again');
        } finally {
            isTranscribing = false;
            clearRecordingTicker();
            updateMicButton(false);
        }
    }

    async function startRecording(inputEl: HTMLInputElement) {
        if (isRecording) return;
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            setVoiceStatus('This browser does not support microphone recording.', 'error');
            setVoiceHint('Use latest Chrome/Edge for voice input');
            return;
        }

        try {
            recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const candidates = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
            ];
            const mimeType = candidates.find(type => MediaRecorder.isTypeSupported(type));
            recorder = mimeType
                ? new MediaRecorder(recordingStream, { mimeType })
                : new MediaRecorder(recordingStream);

            audioChunks = [];
            recorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };
            recorder.onstop = async () => {
                const blob = new Blob(audioChunks, { type: recorder?.mimeType || 'audio/webm' });
                cleanupRecordingStream();
                await transcribeAudioBlob(blob, inputEl);
            };

            recorder.start();
            isRecording = true;
            recordingStartedAt = Date.now();
            clearRecordingTicker();
            recordingTicker = window.setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartedAt) / 1000);
                setVoiceStatus(`Recording ${formatDuration(elapsed)}...`, 'info');
            }, 250);

            updateMicButton(true);
            setVoiceHint('Tap Stop Voice when you finish speaking');
        } catch (err) {
            cleanupRecordingStream();
            clearRecordingTicker();
            isRecording = false;
            updateMicButton(false);
            const msg = (err as Error).message || 'Microphone access denied';
            setVoiceStatus(`Unable to start recording: ${msg}`, 'error');
            setVoiceHint('Allow microphone permission in browser settings');
        }
    }

    function stopRecording() {
        if (!recorder || !isRecording) return;
        isRecording = false;
        clearRecordingTicker();
        setVoiceStatus('Processing recording...', 'info');
        setVoiceHint('Converting speech into text');
        recorder.stop();
    }

    function stopAudioPlayback(announce = true) {
        if (!audioPlayer) {
            updatePlaybackControls();
            return;
        }

        const player = audioPlayer;
        audioPlayer = null;
        player.onended = null;
        player.onerror = null;
        player.onpause = null;
        player.onplay = null;
        player.pause();
        player.currentTime = 0;
        if (player.src.startsWith('blob:')) URL.revokeObjectURL(player.src);

        if (announce) {
            setVoiceStatus(ttsEnabled ? 'Auto voice ON' : 'Voice ready', 'success');
            setVoiceHint('Use Speak Last to hear the latest assistant reply');
        }
        updatePlaybackControls();
    }

    async function toggleAudioPause() {
        if (!audioPlayer) return;
        try {
            if (audioPlayer.paused) {
                await audioPlayer.play();
                setVoiceStatus('Voice resumed', 'success');
                setVoiceHint('Voice reply is now playing');
            } else {
                audioPlayer.pause();
                setVoiceStatus('Voice paused', 'info');
                setVoiceHint('Tap Resume to continue playback');
            }
        } catch {
            setVoiceStatus('Unable to change playback state.', 'error');
        } finally {
            updatePlaybackControls();
        }
    }

    async function speakLastReply() {
        if (!lastAssistantReply) {
            setVoiceStatus('No assistant reply yet to read aloud.', 'error');
            setVoiceHint('Send a message first, then tap Speak Last');
            return;
        }
        await playTts(lastAssistantReply);
    }

    async function playTts(text: string) {
        const clean = normalizedSpeechText(text).slice(0, 3800);
        if (!clean) return;

        try {
            setVoiceStatus('Generating speech...', 'info');
            setVoiceHint(`Voice: ${ttsLanguage.toUpperCase()} | ${ttsSlow ? 'Slow' : 'Normal'} speed`);
            stopAudioPlayback(false);

            const audioBlob = await api.textToSpeech(clean, ttsLanguage, ttsSlow);
            const url = URL.createObjectURL(audioBlob);
            const player = new Audio(url);
            audioPlayer = player;
            player.volume = ttsVolume;

            player.onplay = () => {
                setVoiceStatus('Speaking assistant reply...', 'success');
                setVoiceHint('Use Pause or Stop to control playback');
                updatePlaybackControls();
            };

            player.onpause = () => {
                if (audioPlayer === player && !player.ended) {
                    setVoiceStatus('Voice paused', 'info');
                    setVoiceHint('Tap Resume to continue');
                    updatePlaybackControls();
                }
            };

            player.onended = () => {
                if (player.src.startsWith('blob:')) URL.revokeObjectURL(player.src);
                if (audioPlayer === player) {
                    audioPlayer = null;
                }
                setVoiceStatus(ttsEnabled ? 'Auto voice ON' : 'Voice ready', 'success');
                setVoiceHint('Voice playback finished');
                updatePlaybackControls();
            };

            player.onerror = () => {
                if (player.src.startsWith('blob:')) URL.revokeObjectURL(player.src);
                if (audioPlayer === player) {
                    audioPlayer = null;
                }
                setVoiceStatus('Audio playback failed.', 'error');
                setVoiceHint('Try again or switch language/speed');
                updatePlaybackControls();
            };

            await player.play();
        } catch (err) {
            const msg = (err as Error).message || 'Text to speech failed';
            setVoiceStatus(`TTS failed: ${msg}`, 'error');
            setVoiceHint('Check backend speech service and try again');
            updatePlaybackControls();
        }
    }

    // ── Thinking indicator ────────────────────────────────────────────────
    function showThinking() {
        const box = document.getElementById('ev-messages');
        if (!box) return;
        const label = mode === 'document' ? '🔍 Searching document & analysing…' : '🧠 Thinking…';
        box.insertAdjacentHTML('beforeend', `
        <div id="ev-thinking" style="display:flex;justify-content:flex-start;margin-bottom:16px;animation:evFadeIn .25s ease-out">
            <div style="width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,rgba(212,175,55,.25),rgba(212,175,55,.08));display:flex;align-items:center;justify-content:center;margin-right:10px;margin-top:2px;flex-shrink:0;border:1px solid rgba(212,175,55,.15)">
                <span style="font-size:12px">🤖</span>
            </div>
            <div style="background:rgba(31,41,55,.45);border:1px solid rgba(55,65,81,.4);border-radius:16px;border-bottom-left-radius:6px;padding:12px 16px;box-shadow:0 2px 8px rgba(0,0,0,.15)">
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="display:flex;gap:4px">
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.65);border-radius:50%;animation:evBounce .6s infinite alternate"></span>
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.65);border-radius:50%;animation:evBounce .6s .15s infinite alternate"></span>
                        <span style="width:6px;height:6px;background:rgba(212,175,55,.65);border-radius:50%;animation:evBounce .6s .3s infinite alternate"></span>
                    </div>
                    <span style="font-size:11px;color:#6b7280">${label}</span>
                </div>
            </div>
        </div>`);
        scrollEnd();
    }
    function hideThinking() { document.getElementById('ev-thinking')?.remove(); }

    // ── Send ──────────────────────────────────────────────────────────────
    async function send(text: string) {
        if (busy || !text.trim()) return;

        // Check connection with retry
        if (!online) {
            const isHealthy = await checkHealth();
            if (!isHealthy) {
                addMsg('assistant', '❌ Backend server is offline. Please check if the server is running on port 8001 and try again.');
                return;
            }
        }

        const inp = document.getElementById('ev-input') as HTMLInputElement;
        if (inp) inp.value = '';
        busy = true;
        setBtnState(false);
        addMsg('user', text, false);
        renderMsgs();
        showThinking();

        try {
            const r = mode === 'document' && sessionId ? await api.docChat(text, sessionId) : await api.freeChat(text);
            hideThinking();
            messages.push({ id: uid(), role: 'assistant', content: r.response, timestamp: new Date(), processingTime: r.processing_time });
            lastAssistantReply = r.response;
            if (ttsEnabled) {
                await playTts(r.response);
            }
        } catch (err) {
            hideThinking();
            const msg = (err as Error).message;
            if (mode === 'document' && /session not found/i.test(msg)) {
                rmDoc();
                addMsg('assistant', 'Your document session expired (usually after backend restart). Please upload the file again and continue.');
                return;
            }
            const net = msg.includes('Failed to fetch') || msg.includes('aborted');
            addMsg('assistant', net ? 'Unable to reach the backend. Check that the API is running on port 8001.' : `Error: ${msg}`, false);
            if (net) { online = false; setHealth(false, 0); }
        } finally {
            busy = false;
            setBtnState(true);
            renderMsgs();
            saveChat(messages);
        }
    }

    function addMsg(role: 'user' | 'assistant' | 'system', content: string, save = true) {
        messages.push({ id: uid(), role, content, timestamp: new Date() });
        if (save) { renderMsgs(); saveChat(messages); }
    }

    function setBtnState(enabled: boolean) {
        const b = document.getElementById('ev-send') as HTMLButtonElement;
        if (b) { b.disabled = !enabled; b.style.opacity = enabled ? '1' : '.35'; }
    }

    // ── Upload ────────────────────────────────────────────────────────────
    async function handleUpload(file: File) {
        if (uploading) return;
        const fname = file.name.toLowerCase();
        const isPdf = fname.endsWith('.pdf');
        const isImage = fname.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i);
        
        if (!(isPdf || isImage)) { 
            uploadStatus('Only PDF or image files (JPG, PNG, WebP, GIF, BMP) accepted.', 'error'); 
            return; 
        }
        if (file.size > 50 * 1024 * 1024) { uploadStatus('File too large (max 50 MB).', 'error'); return; }

        uploading = true;
        uploadStatus(`Uploading ${file.name}…`, 'info');
        uploadProgress(40);

        try {
            const res = await api.uploadPDF(file);
            sessionId = res.session_id;
            uploadName = file.name;
            mode = 'document';
            uploadProgress(100);
            const typeStr = isPdf ? 'PDF' : 'Image';
            uploadStatus(`${file.name} — ${res.document_count} chunks`, 'success');
            updateMode();
            try {
                const st = await api.sessionStatus(res.session_id);
                if (st.exists && st.document_count) showDocStats(st);
            } catch { /* */ }
            addMsg('system', `${typeStr} loaded: ${file.name}. Switched to document mode.`, false);
            addMsg('assistant', `I've processed **${file.name}** (${typeStr}) and extracted **${res.document_count}** content chunks.\n\nYou can now ask questions about this ${isPdf ? 'document' : 'image'}. I'll cross-reference with Indian EV regulations.\n\n**File hash:** \`${res.file_hash.slice(0, 12)}…\``);
        } catch (err) {
            uploadProgress(0);
            uploadStatus(`Upload failed: ${(err as Error).message}`, 'error');
        } finally { uploading = false; }
    }

    function uploadProgress(pct: number) {
        const b = document.getElementById('ev-upload-bar') as HTMLElement;
        if (b) { b.style.width = `${pct}%`; b.style.opacity = pct > 0 ? '1' : '0'; }
    }
    function uploadStatus(msg: string, type: 'info' | 'success' | 'error') {
        const el = document.getElementById('ev-upload-status');
        if (!el) return;
        const configs = {
            error:   { color: '#f87171', icon: 'fa-circle-xmark', symbol: '❌' },
            success: { color: '#34d399', icon: 'fa-circle-check', symbol: '✅' },
            info:    { color: '#D4AF37', icon: 'fa-spinner fa-spin', symbol: '⏳' }
        };
        const config = configs[type];
        el.innerHTML = `<div style="display:flex;align-items:center;gap:6px;color:${config.color}"><span style="font-size:12px">${config.symbol}</span><i class="fa-solid ${config.icon}" style="font-size:10px"></i><span style="font-size:11px">${msg}</span></div>`;
    }
    function showDocStats(st: SessionStatus) {
        const el = document.getElementById('ev-doc-stats');
        if (!el || !st.exists) return;
        el.innerHTML = `<div style="font-size:10px;color:#6b7280;margin-top:6px;padding-top:6px;border-top:1px solid rgba(55,65,81,.25)">🧩 <i class="fa-solid fa-puzzle-piece" style="color:rgba(212,175,55,.35);margin-right:4px"></i>${st.document_count} chunks${st.processed_at ? ` │ ⏰ Processed ${new Date(st.processed_at * 1000).toLocaleTimeString('en-IN')}` : ''}</div>`;
    }

    function updateMode() {
        const el = document.getElementById('ev-mode');
        if (!el) return;
        if (mode === 'document' && uploadName) {
            el.innerHTML = `<div style="display:flex;align-items:center;gap:6px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);border-radius:8px;padding:4px 10px">
                📄 <i class="fa-solid fa-file-pdf" style="color:#34d399;font-size:10px"></i>
                <span style="font-size:11px;color:#6ee7b7;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(uploadName)}</span>
                <button id="ev-rm-doc" style="color:#6b7280;cursor:pointer;background:none;border:none;transition:color .15s" title="🗑️ Remove"><i class="fa-solid fa-xmark" style="font-size:10px"></i></button>
            </div>`;
            document.getElementById('ev-rm-doc')?.addEventListener('click', rmDoc);
        } else {
            el.innerHTML = `<div style="display:flex;align-items:center;gap:6px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.12);border-radius:8px;padding:4px 10px">
                💬 <i class="fa-solid fa-comments" style="color:#D4AF37;font-size:10px"></i>
                <span style="font-size:11px;color:#9ca3af">Free advisory mode</span>
            </div>`;
        }
    }

    function rmDoc() {
        if (sessionId) api.deleteSession(sessionId).catch(() => {});
        sessionId = null; uploadName = null; mode = 'free';
        updateMode(); uploadStatus('', 'info'); uploadProgress(0);
        const ds = document.getElementById('ev-doc-stats'); if (ds) ds.innerHTML = '';
        addMsg('system', 'Document removed. Switched back to free advisory mode.');
    }

    function exportChat() {
        if (!messages.length) return;
        const lines = messages.filter(m => m.role !== 'system').map(m => `[${timeStr(m.timestamp)}] ${m.role === 'user' ? 'You' : 'EV Advisor'}:\n${m.content}\n`);
        const txt = `EVBharat EV Compliance Advisor — Chat Export\n${'='.repeat(50)}\nExported: ${new Date().toLocaleString('en-IN')}\nMessages: ${lines.length}\n${'='.repeat(50)}\n\n${lines.join('\n')}`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
        a.download = `ev-chat-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(a.href);
    }

    function clearAll() { messages.length = 0; clearChat(); renderMsgs(); }

    // ═══════════════════════════════════════════════════════════════════════
    //  HTML
    // ═══════════════════════════════════════════════════════════════════════
    app.innerHTML = `
    <style>
    @keyframes evFadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
    @keyframes evBounce { from { transform:translateY(0) } to { transform:translateY(-6px) } }
    @keyframes evPulse { 0%, 100% { opacity:1 } 50% { opacity:.7 } }
    @keyframes evShimmer { 0% { transform:translateX(-100%) } 100% { transform:translateX(100%) } }
    @keyframes evGlow { 0%, 100% { box-shadow:0 0 20px rgba(212,175,55,.2) } 50% { box-shadow:0 0 30px rgba(212,175,55,.4), 0 0 40px rgba(212,175,55,.2) } }
    @keyframes evMicRing {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, .45), 0 8px 24px rgba(239, 68, 68, .2); }
        70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0), 0 8px 24px rgba(239, 68, 68, .2); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), 0 8px 24px rgba(239, 68, 68, .2); }
    }
    .ev-mic-recording { animation: evMicRing 1.4s infinite; }
    .ev-voice-pill { transition: all .2s ease; }
    .ev-voice-pill:hover { transform: translateY(-1px); }
    .ev-logo-animate { animation:evGlow 4s infinite }
    .ev-msg-row { animation:evFadeIn .4s cubic-bezier(0.4, 0, 0.2, 1) }
    .ev-msg-row:hover .ev-copy { opacity:1 !important }
    #ev-messages::-webkit-scrollbar { width:6px }
    #ev-messages::-webkit-scrollbar-track { background:rgba(17,24,39,.3); border-radius:3px }
    #ev-messages::-webkit-scrollbar-thumb { background:linear-gradient(180deg, rgba(212,175,55,.4), rgba(212,175,55,.2)); border-radius:3px; border:1px solid rgba(55,65,81,.2) }
    #ev-messages::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg, rgba(212,175,55,.6), rgba(212,175,55,.3)) }
    .ev-sidebar::-webkit-scrollbar { width:4px }
    .ev-sidebar::-webkit-scrollbar-track { background:transparent }
    .ev-sidebar::-webkit-scrollbar-thumb { background:linear-gradient(180deg, rgba(75,85,99,.4), rgba(75,85,99,.2)); border-radius:2px }

    /* Mobile sidebar */
    @media (max-width: 767px) {
        .ev-sidebar { position:fixed !important; top:0 !important; left:0; bottom:0; z-index:50; width:280px !important; transform:translateX(-100%); transition:transform .3s ease; background:rgba(26,26,26,.98) !important; backdrop-filter:blur(12px); padding:20px !important; }
        .ev-sidebar.open { transform:translateX(0) }
        .ev-mobile-show { display:flex !important }
        .ev-mobile-hide { display:none !important }
    }
    @media (min-width: 768px) {
        .ev-mobile-show { display:none !important }
        .ev-mobile-close { display:none !important }
    }
    </style>

    <div style="min-height:100vh;background:#1a1a1a;padding-top:80px;padding-bottom:24px">
        <div style="max-width:1200px;margin:0 auto;padding:0 16px">

            <!-- Mobile toggle -->
            <button id="ev-sb-toggle" class="ev-mobile-show" style="display:none;align-items:center;gap:6px;font-size:12px;color:#9ca3af;margin-bottom:12px;cursor:pointer;background:none;border:none">
                <i class="fa-solid fa-bars"></i> Menu & Upload
            </button>

            <!-- Mobile overlay -->
            <div id="ev-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(2px);z-index:45"></div>

            <div style="display:flex;gap:20px;align-items:flex-start">

                <!-- ═══ SIDEBAR ═══ -->
                <div id="ev-sidebar" class="ev-sidebar" style="width:240px;flex-shrink:0;position:sticky;top:100px;max-height:calc(100vh - 120px);overflow-y:auto;display:flex;flex-direction:column;gap:14px">

                    <!-- Close (mobile) -->
                    <button id="ev-sb-close" class="ev-mobile-close" style="position:absolute;top:12px;right:12px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(31,41,55,.5);color:#9ca3af;border:none;cursor:pointer;z-index:51">
                        <i class="fa-solid fa-xmark" style="font-size:13px"></i>
                    </button>

                    <!-- Brand -->
                    <div style="text-align:center;padding:8px 0;border-bottom:1px solid rgba(75,85,99,.15);margin-bottom:6px">
                        <h1 style="font-family:'Orbitron',sans-serif;font-size:18px;font-weight:800;line-height:1.2;margin:0;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 2px 4px rgba(212,175,55,.15))">⚡ EV <span style="background:linear-gradient(135deg, #FFD700, #D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Compliance</span></h1>
                        <p style="font-size:9px;color:#9ca3af;margin-top:3px;text-transform:uppercase;letter-spacing:2px;font-weight:600">🤖 AI-Powered Advisory</p>
                    </div>

                    <!-- Status -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:12px 14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <div style="display:flex;align-items:center;gap:8px">
                            <span class="ev-health-dot" style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg, #6b7280, #9ca3af);flex-shrink:0;border:1px solid rgba(255,255,255,.1)"></span>
                            <span class="ev-health-text" style="font-size:12px;color:#c1c7cd;font-weight:500">Checking…</span>
                        </div>
                        <p id="ev-sessions" style="font-size:10px;color:#64748b;margin-top:4px;margin-left:16px;font-weight:400"></p>
                    </div>

                    <!-- Upload -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:10px;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-paperclip" style="color:#D4AF37;font-size:12px"></i>Document Analysis</h4>
                        <div id="ev-upload-area" style="position:relative;border:2px dashed rgba(212,175,55,.25);border-radius:12px;padding:20px 16px;text-align:center;cursor:pointer;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);overflow:hidden;background:linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))">
                            <input type="file" id="ev-file-input" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp" style="display:none">
                            <i class="fa-solid fa-cloud-arrow-up" style="font-size:28px;color:#64748b;margin-bottom:8px;display:block;transition:all .3s"></i>
                            <p style="font-size:12px;color:#9ca3af;font-weight:500">Drop PDF or image or <span style="color:#D4AF37;text-decoration:underline;cursor:pointer;font-weight:600">browse</span></p>
                            <p style="font-size:10px;color:#64748b;margin-top:4px">JPG • PNG • WebP • GIF • BMP | Max 50 MB</p>
                            <div id="ev-upload-bar" style="position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,#D4AF37,#FFD700);transition:width .8s cubic-bezier(0.4, 0, 0.2, 1);opacity:0;width:0;border-radius:0 0 12px 12px"></div>
                        </div>
                        <div id="ev-upload-status" style="margin-top:8px"></div>
                        <div id="ev-doc-stats"></div>
                    </div>

                    <!-- Capabilities -->
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));border:1px solid rgba(75,85,99,.3);border-radius:12px;padding:14px;backdrop-filter:blur(8px);box-shadow:0 2px 8px rgba(0,0,0,.1)">
                        <h4 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#9ca3af;margin-bottom:12px;display:flex;align-items:center;gap:6px"><i class="fa-solid fa-shield-halved" style="color:#D4AF37;font-size:12px"></i>🚀 Capabilities</h4>
                        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
                            ${['⚡ FAME II / PM E-DRIVE subsidy guidance', '🗺️ State-wise EV policy comparison', '🛡️ BIS / AIS safety-standard checks', '� GST, income-tax & import-duty rules', '🔌 Charging-infra & DISCOM approvals', '� PDF analysis & compliance audit'].map(c =>
                                `<li style="display:flex;align-items:flex-start;gap:8px;font-size:11px;color:#c1c7cd;padding:6px 8px;border-radius:6px;background:rgba(212,175,55,.03);border:1px solid rgba(212,175,55,.08);transition:all .2s"><div style="width:16px;height:16px;border-radius:4px;background:linear-gradient(135deg, rgba(16,185,129,.2), rgba(52,211,153,.1));display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><i class="fa-solid fa-check" style="color:#10b981;font-size:8px"></i></div><span style="line-height:1.4;font-weight:400">${c}</span></li>`).join('')}
                        </ul>
                    </div>

                    <!-- Actions -->
                    <div style="display:flex;gap:6px">
                        <button id="ev-export" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#9ca3af;padding:8px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:500" title="📥 Export conversation">
                            <i class="fa-solid fa-download" style="font-size:10px"></i> Export
                        </button>
                        <button id="ev-test-connection" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#9ca3af;padding:8px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:500" title="🔍 Test connection">
                            <i class="fa-solid fa-wifi" style="font-size:10px"></i> Test
                        </button>
                        <button id="ev-clear" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:#9ca3af;padding:8px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4));border:1px solid rgba(75,85,99,.25);transition:all .3s;font-weight:500" title="🧹 Clear chat history">
                            <i class="fa-solid fa-trash-can" style="font-size:10px"></i> Clear
                        </button>
                    </div>

                    <p style="font-size:9px;color:#64748b;line-height:1.5;padding:8px;background:rgba(17,24,39,.3);border-radius:6px;border-left:3px solid rgba(212,175,55,.3)"><i class="fa-solid fa-triangle-exclamation" style="color:rgba(212,175,55,.6);margin-right:4px;font-size:8px"></i>AI-generated responses. Verify with official government notifications before making compliance decisions.</p>
                </div>

                <!-- ═══ MAIN CHAT ═══ -->
                <div style="flex:1;min-width:0">
                    <div style="background:linear-gradient(135deg, rgba(17,24,39,.4), rgba(31,41,55,.3));border:1px solid rgba(75,85,99,.3);border-radius:20px;display:flex;flex-direction:column;height:calc(100vh - 120px);min-height:500px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15);backdrop-filter:blur(16px)">

                        <!-- Header -->
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(75,85,99,.25);background:linear-gradient(135deg, rgba(17,24,39,.6), rgba(31,41,55,.4));backdrop-filter:blur(8px)">
                            <div style="display:flex;align-items:center;gap:12px">
                                <div style="width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg, rgba(212,175,55,.25), rgba(212,175,55,.1));display:flex;align-items:center;justify-content:center;border:1px solid rgba(212,175,55,.2);box-shadow:0 4px 12px rgba(212,175,55,.1)">
                                    <i class="fa-solid fa-bolt" style="color:#D4AF37;font-size:14px"></i>
                                </div>
                                <div>
                                    <h3 style="font-family:'Orbitron',sans-serif;font-size:15px;font-weight:800;line-height:1.2;margin:0;background:linear-gradient(135deg, #D4AF37, #FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent">EV Compliance Advisor</h3>
                                    <p style="font-size:10px;color:#9ca3af;margin:0;font-weight:500">Indian Government EV Rules & Regulations</p>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:12px">
                                <div id="ev-mode"></div>
                                <div style="display:flex;align-items:center;gap:6px;background:rgba(31,41,55,.4);padding:4px 10px;border-radius:8px;border:1px solid rgba(75,85,99,.2)">
                                    <span class="ev-health-dot" style="width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg, #6b7280, #9ca3af);flex-shrink:0;border:1px solid rgba(255,255,255,.05)"></span>
                                    <span class="ev-health-text" style="font-size:10px;color:#9ca3af;font-weight:500">…</span>
                                </div>
                            </div>
                        </div>

                        <!-- Messages area -->
                        <div id="ev-messages" style="flex:1;overflow-y:auto;padding:20px;background:linear-gradient(180deg, rgba(17,24,39,.15), rgba(31,41,55,.1))"></div>

                        <!-- Input bar -->
                        <div style="border-top:1px solid rgba(75,85,99,.25);padding:16px 20px;background:linear-gradient(135deg, rgba(17,24,39,.7), rgba(31,41,55,.5));backdrop-filter:blur(8px)">
                            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                                <input
                                    type="text"
                                    id="ev-input"
                                    placeholder="💬 Ask about Indian EV regulations, subsidies, compliance…"
                                    maxlength="2000"
                                    autocomplete="off"
                                    style="flex:1;padding:12px 16px;background:rgba(31,41,55,.5);border:1px solid rgba(75,85,99,.3);border-radius:16px;font-size:14px;color:#f1f5f9;outline:none;transition:all .3s;font-weight:400;backdrop-filter:blur(4px)"
                                    onfocus="this.style.borderColor='rgba(212,175,55,.4)';this.style.boxShadow='0 0 0 3px rgba(212,175,55,.1)'"
                                    onblur="this.style.borderColor='rgba(75,85,99,.3)';this.style.boxShadow='none'"
                                >
                                <button
                                    id="ev-mic"
                                    class="ev-voice-pill"
                                    style="display:flex;align-items:center;gap:8px;padding:12px 14px;background:linear-gradient(135deg, rgba(31,41,55,.9), rgba(17,24,39,.7));border:1px solid rgba(75,85,99,.35);border-radius:14px;color:#e5e7eb;cursor:pointer;transition:all .2s;font-size:12px;font-weight:600;min-width:126px;justify-content:center"
                                    title="Start voice input"
                                >
                                    <span id="ev-mic-dot" style="width:7px;height:7px;border-radius:999px;background:#34d399;opacity:.75"></span>
                                    <i id="ev-mic-icon" class="fa-solid fa-microphone-lines" style="font-size:13px"></i>
                                    <span id="ev-mic-text">Start Voice</span>
                                </button>
                                <button
                                    id="ev-send"
                                    style="padding:12px 20px;background:linear-gradient(135deg, #D4AF37, #FFD700);border:none;border-radius:16px;color:#000;cursor:pointer;transition:all .3s;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(212,175,55,.25);display:flex;align-items:center;gap:8px"
                                    title="🚀 Send message"
                                    onmouseenter="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 20px rgba(212,175,55,.35)'"
                                    onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 12px rgba(212,175,55,.25)'"
                                >
                                    <i class="fa-solid fa-paper-plane" style="font-size:14px"></i>
                                    <span style="font-weight:700">Send</span>
                                    <i class="fa-solid fa-rocket" style="font-size:12px"></i>
                                </button>
                            </div>
                            <div style="margin-top:10px;padding:10px 12px;border-radius:12px;background:linear-gradient(135deg, rgba(31,41,55,.35), rgba(17,24,39,.5));border:1px solid rgba(75,85,99,.22)">
                                <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
                                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                                        <button id="ev-tts-toggle" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:linear-gradient(135deg, rgba(31,41,55,.7), rgba(17,24,39,.5));color:#9ca3af;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-wave-square" style="font-size:11px"></i>
                                            <span id="ev-tts-toggle-text">Auto Voice: Off</span>
                                        </button>
                                        <button id="ev-tts-play" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:rgba(31,41,55,.6);color:#d1d5db;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-play" style="font-size:10px"></i>
                                            <span>Speak Last</span>
                                        </button>
                                        <button id="ev-tts-pause" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:rgba(31,41,55,.6);color:#d1d5db;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-pause" style="font-size:10px"></i>
                                            <span id="ev-tts-pause-text">Pause</span>
                                        </button>
                                        <button id="ev-tts-stop" class="ev-voice-pill" style="display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid rgba(75,85,99,.3);background:rgba(31,41,55,.6);color:#d1d5db;cursor:pointer;font-size:11px;font-weight:600">
                                            <i class="fa-solid fa-stop" style="font-size:10px"></i>
                                            <span>Stop</span>
                                        </button>
                                    </div>
                                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                                        <label for="ev-tts-lang" style="font-size:10px;color:#9ca3af">Lang</label>
                                        <select id="ev-tts-lang" style="background:rgba(17,24,39,.7);border:1px solid rgba(75,85,99,.32);color:#d1d5db;border-radius:8px;padding:6px 8px;font-size:11px;outline:none">
                                            <option value="en">English</option>
                                            <option value="hi">Hindi</option>
                                            <option value="kn">Kannada</option>
                                            <option value="ta">Tamil</option>
                                            <option value="te">Telugu</option>
                                            <option value="mr">Marathi</option>
                                        </select>
                                        <label for="ev-tts-speed" style="font-size:10px;color:#9ca3af">Speed</label>
                                        <select id="ev-tts-speed" style="background:rgba(17,24,39,.7);border:1px solid rgba(75,85,99,.32);color:#d1d5db;border-radius:8px;padding:6px 8px;font-size:11px;outline:none">
                                            <option value="normal">Normal</option>
                                            <option value="slow">Slow</option>
                                        </select>
                                        <label for="ev-tts-volume" style="font-size:10px;color:#9ca3af">Vol</label>
                                        <input id="ev-tts-volume" type="range" min="0" max="100" value="100" style="accent-color:#D4AF37;cursor:pointer;width:90px">
                                        <span id="ev-tts-volume-label" style="font-size:10px;color:#9ca3af;min-width:34px">100%</span>
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 4px">
                                <span id="ev-voice-status" style="font-size:11px;color:#9ca3af">Voice ready</span>
                                <span id="ev-voice-hint" style="font-size:11px;color:#6b7280">Mic input + full playback controls</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // ═══════════════════════════════════════════════════════════════════════
    //  Wire events
    // ═══════════════════════════════════════════════════════════════════════
    const uploadArea = document.getElementById('ev-upload-area')!;
    const fileInput  = document.getElementById('ev-file-input') as HTMLInputElement;
    const chatInput  = document.getElementById('ev-input') as HTMLInputElement;
    const micBtn     = document.getElementById('ev-mic') as HTMLButtonElement;
    const ttsBtn     = document.getElementById('ev-tts-toggle') as HTMLButtonElement;
    const ttsPlayBtn = document.getElementById('ev-tts-play') as HTMLButtonElement;
    const ttsPauseBtn = document.getElementById('ev-tts-pause') as HTMLButtonElement;
    const ttsStopBtn = document.getElementById('ev-tts-stop') as HTMLButtonElement;
    const ttsLangSel = document.getElementById('ev-tts-lang') as HTMLSelectElement;
    const ttsSpeedSel = document.getElementById('ev-tts-speed') as HTMLSelectElement;
    const ttsVolumeRange = document.getElementById('ev-tts-volume') as HTMLInputElement;
    const ttsVolumeLabel = document.getElementById('ev-tts-volume-label');
    const sendBtn    = document.getElementById('ev-send') as HTMLButtonElement;

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(212,175,55,.5)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(212,175,55,.08), rgba(255,215,0,.04))';
        uploadArea.style.transform = 'scale(1.02)';
        const icon = uploadArea.querySelector('i');
        if (icon) { icon.style.color = '#D4AF37'; icon.style.transform = 'scale(1.1)'; }
    });
    uploadArea.addEventListener('dragleave', e => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(212,175,55,.25)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))';
        uploadArea.style.transform = '';
        const icon = uploadArea.querySelector('i');
        if (icon) { icon.style.color = '#64748b'; icon.style.transform = ''; }
    });
    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(212,175,55,.25)';
        uploadArea.style.background = 'linear-gradient(135deg, rgba(212,175,55,.03), rgba(17,24,39,.3))';
        uploadArea.style.transform = '';
        const icon = uploadArea.querySelector('i');
        if (icon) { icon.style.color = '#64748b'; icon.style.transform = ''; }
        if (e.dataTransfer?.files[0]) handleUpload(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', () => { if (fileInput.files?.[0]) handleUpload(fileInput.files[0]); });

    sendBtn.addEventListener('click', () => send(chatInput.value.trim()));
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(chatInput.value.trim()); } });
    micBtn.addEventListener('click', async () => {
        if (isTranscribing) return;
        if (isRecording) {
            stopRecording();
            return;
        }
        await startRecording(chatInput);
    });
    ttsBtn.addEventListener('click', () => {
        ttsEnabled = !ttsEnabled;
        updateTtsButton(ttsEnabled);
        setVoiceStatus(ttsEnabled ? 'Auto voice ON' : 'Auto voice OFF', 'success');
        setVoiceHint(ttsEnabled ? 'Assistant replies will be spoken automatically' : 'Auto voice disabled; use Speak Last anytime');
        if (!ttsEnabled && audioPlayer) {
            stopAudioPlayback(false);
        }
        updatePlaybackControls();
    });

    ttsPlayBtn.addEventListener('click', () => { void speakLastReply(); });
    ttsPauseBtn.addEventListener('click', () => { void toggleAudioPause(); });
    ttsStopBtn.addEventListener('click', () => { stopAudioPlayback(); });

    ttsLangSel.addEventListener('change', () => {
        ttsLanguage = ttsLangSel.value;
        setVoiceStatus(`Voice language set to ${ttsLangSel.options[ttsLangSel.selectedIndex].text}`, 'success');
    });

    ttsSpeedSel.addEventListener('change', () => {
        ttsSlow = ttsSpeedSel.value === 'slow';
        setVoiceStatus(`Voice speed: ${ttsSlow ? 'Slow' : 'Normal'}`, 'success');
    });

    ttsVolumeRange.addEventListener('input', () => {
        ttsVolume = Number(ttsVolumeRange.value) / 100;
        if (ttsVolumeLabel) ttsVolumeLabel.textContent = `${Math.round(ttsVolume * 100)}%`;
        if (audioPlayer) audioPlayer.volume = ttsVolume;
    });

    // Mobile sidebar
    const sidebar = document.getElementById('ev-sidebar')!;
    const overlay = document.getElementById('ev-overlay')!;
    const openSb  = () => { sidebar.classList.add('open'); overlay.style.display = 'block'; };
    const closeSb = () => { sidebar.classList.remove('open'); overlay.style.display = 'none'; };
    document.getElementById('ev-sb-toggle')?.addEventListener('click', openSb);
    document.getElementById('ev-sb-close')?.addEventListener('click', closeSb);
    overlay.addEventListener('click', closeSb);

    // Action buttons
    document.getElementById('ev-export')?.addEventListener('click', exportChat);
    document.getElementById('ev-clear')?.addEventListener('click', clearAll);
    document.getElementById('ev-test-connection')?.addEventListener('click', async () => {
        addMsg('system', '🔍 Testing backend connection...');
        const isHealthy = await checkHealth();
        addMsg('system', isHealthy ? '✅ Connection successful!' : '❌ Connection failed – check console (F12)');
    });

    // Hover effects for action buttons
    ['ev-export', 'ev-clear', 'ev-test-connection'].forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            const hc  = id === 'ev-clear' ? '#ef4444' : id === 'ev-test-connection' ? '#3b82f6' : '#D4AF37';
            const rgb = id === 'ev-clear' ? '239,68,68' : id === 'ev-test-connection' ? '59,130,246' : '212,175,55';
            b.addEventListener('mouseenter', () => {
                b.style.color = hc;
                b.style.background = `linear-gradient(135deg, rgba(${rgb},.1), rgba(${rgb},.05))`;
                b.style.borderColor = `rgba(${rgb},.4)`;
                b.style.transform = 'translateY(-1px)';
                b.style.boxShadow = `0 4px 12px rgba(${rgb},.15)`;
            });
            b.addEventListener('mouseleave', () => {
                b.style.color = '#9ca3af';
                b.style.background = 'linear-gradient(135deg, rgba(31,41,55,.6), rgba(17,24,39,.4))';
                b.style.borderColor = 'rgba(75,85,99,.25)';
                b.style.transform = '';
                b.style.boxShadow = 'none';
            });
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    //  Init
    // ═══════════════════════════════════════════════════════════════════════
    updateMode();
    updateMicButton(false);
    updateTtsButton(false);
    updatePlaybackControls();
    setVoiceStatus('Voice ready', 'info');
    setVoiceHint('Tap Start Voice or use playback controls for replies');
    renderMsgs();
    checkHealth();
    const hInterval = setInterval(checkHealth, 30_000);

    const obs = new MutationObserver(() => {
        if (!document.getElementById('ev-messages')) {
            clearInterval(hInterval);
            if (isRecording) stopRecording();
            clearRecordingTicker();
            cleanupRecordingStream();
            stopAudioPlayback(false);
            obs.disconnect();
        }
    });
    obs.observe(app, { childList: true });
}
