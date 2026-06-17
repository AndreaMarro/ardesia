// ============================================
// UNLIM Voice Service — Real-time Voice Pipeline
// STT + TTS routed through nanobot backend
// Audio capture → nanobot /voice-chat → audio playback
// © Andrea Marro — 13/03/2026
// ============================================

import logger from '../utils/logger';

const SUPABASE_EDGE_URL = (import.meta.env.VITE_SUPABASE_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1').trim();
const NANOBOT_URL = (import.meta.env.VITE_NANOBOT_URL || '').trim() || SUPABASE_EDGE_URL;
const PUBLIC_SUPABASE_ANON_KEY = 'DEV_SENTINEL_SET_VITE_SUPABASE_ANON_KEY_IN_ENV_LOCAL';
function isValidElabAnonJwt(value) {
    try {
        const token = String(value || '').trim();
        const payload = token.split('.')[1];
        if (!payload) return false;
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded.ref === 'euqpdueopmlllqjmqnyb' && decoded.role === 'anon';
    } catch {
        return false;
    }
}
// Fallback chain: VITE_SUPABASE_EDGE_KEY → VITE_SUPABASE_ANON_KEY → sentinel.
// Vercel env historically had only VITE_SUPABASE_ANON_KEY set; missing
// VITE_SUPABASE_EDGE_KEY broke fetch after JWT strip a7dfc9d0.
const ENV_SUPABASE_EDGE_KEY = (import.meta.env.VITE_SUPABASE_EDGE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const SUPABASE_EDGE_KEY = isValidElabAnonJwt(ENV_SUPABASE_EDGE_KEY)
    ? ENV_SUPABASE_EDGE_KEY
    : PUBLIC_SUPABASE_ANON_KEY;
const ELAB_API_KEY = (import.meta.env.VITE_ELAB_API_KEY || '').trim();
const isSupabaseEdge = () => !!NANOBOT_URL && NANOBOT_URL.includes('supabase.co/functions');

// Audio recording state
let mediaRecorder = null;
let audioChunks = [];
let recordingStream = null;

/**
 * Check if voice features are available on this device + backend.
 * @returns {Promise<{stt: boolean, tts: boolean, microphone: boolean}>}
 */
export async function checkVoiceCapabilities() {
    const result = { stt: false, tts: false, microphone: false, error: null };

    // Check microphone API availability (actual permission requested on first record)
    // Note: enumerateDevices() often returns empty before getUserMedia() is called,
    // so we just check the API exists — real permission check happens at startRecording()
    try {
        result.microphone = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    } catch {
        result.microphone = false;
    }

    // Do not probe the raw HTTP VPS from the browser: the app CSP intentionally
    // blocks direct IP connections and the failed probe pollutes console health.
    // Runtime synthesis uses same-origin proxies first, then backend fallbacks.
    result.tts = typeof speechSynthesis !== 'undefined';
    result.stt = result.microphone;

    // Fallback: check nanobot voice endpoints
    if (!result.tts && NANOBOT_URL) {
        try {
            const resp = await fetch(`${NANOBOT_URL}/voice-status`, {
                signal: AbortSignal.timeout(5000),
            });
            if (resp.ok) {
                const data = await resp.json();
                result.stt = data.stt;
                result.tts = data.tts;
            }
        } catch (e) {
            result.error = 'TTS non raggiungibile';
        }
    }

    // Final fallback: browser TTS is always available
    if (!result.tts && typeof speechSynthesis !== 'undefined') {
        result.tts = true;
    }

    return result;
}

/**
 * Unlock audio playback on browsers with strict autoplay policies.
 * Must be called directly from a user gesture (click/tap) handler.
 * Creates a silent AudioContext + tiny silent play to unlock the session.
 */
let audioUnlocked = false;
export function unlockAudioPlayback() {
    if (audioUnlocked) return;
    try {
        // Resume/create AudioContext (works on most browsers)
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);

        // Also unlock HTMLAudioElement path. Use a blob URL because the
        // production CSP intentionally blocks data: media.
        const silentWav = new Uint8Array([
            82, 73, 70, 70, 38, 0, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32,
            16, 0, 0, 0, 1, 0, 1, 0, 64, 31, 0, 0, 64, 31, 0, 0,
            1, 0, 8, 0, 100, 97, 116, 97, 2, 0, 0, 0, 128, 128,
        ]);
        const url = URL.createObjectURL(new Blob([silentWav], { type: 'audio/wav' }));
        const silent = new Audio(url);
        silent.volume = 0;
        silent.onended = () => URL.revokeObjectURL(url);
        silent.onerror = () => URL.revokeObjectURL(url);
        silent.play().catch(() => URL.revokeObjectURL(url));

        audioUnlocked = true;
        logger.debug('[Voice] Audio playback unlocked');
    } catch { /* silent */ }
}

/**
 * Request microphone permission and start recording.
 * @returns {Promise<boolean>} true if recording started
 */
export async function startRecording() {
    try {
        // Request microphone — iPad Safari needs { audio: true }
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000,
            }
        });
        recordingStream = stream;
        audioChunks = [];

        // Use webm/opus for Chrome, mp4 for Safari/iPad
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : MediaRecorder.isTypeSupported('audio/mp4')
                ? 'audio/mp4'
                : 'audio/webm';

        mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            audioBitsPerSecond: 64000,
        });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        // Collect data every 250ms for responsiveness
        mediaRecorder.start(250);
        logger.debug(`[Voice] Recording started (${mimeType})`);
        return true;
    } catch (err) {
        logger.error('[Voice] Microphone access denied:', err);
        return false;
    }
}

/**
 * Stop recording and return the audio blob.
 * @returns {Promise<Blob|null>} audio blob or null if not recording
 */
export function stopRecording() {
    return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            resolve(null);
            return;
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
            audioChunks = [];

            // Release microphone
            if (recordingStream) {
                recordingStream.getTracks().forEach(t => t.stop());
                recordingStream = null;
            }

            logger.debug(`[Voice] Recording stopped: ${(blob.size / 1024).toFixed(1)}KB`);
            resolve(blob);
        };

        mediaRecorder.stop();
    });
}

/**
 * Check if currently recording.
 * @returns {boolean}
 */
export function isRecording() {
    return mediaRecorder && mediaRecorder.state === 'recording';
}

/**
 * Cancel active recording without returning audio.
 */
export function cancelRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
    }
    audioChunks = [];
    if (recordingStream) {
        recordingStream.getTracks().forEach(t => t.stop());
        recordingStream = null;
    }
}

/**
 * Send audio to nanobot /voice-chat for complete round-trip.
 * Returns: { userText, response, audio (base64), timing }
 * @param {Blob} audioBlob - recorded audio
 * @param {Object} options - sessionId, experimentId, circuitState, simulatorContext
 * @param {AbortSignal} signal - abort signal
 * @returns {Promise<Object>}
 */
// © Andrea Marro — 18/04/2026 — ELAB Tutor — Tutti i diritti riservati
export async function sendVoiceChat(audioBlob, options = {}, signal = null) {
    if (!NANOBOT_URL) {
        throw new Error('Nanobot URL non configurato');
    }

    const formData = new FormData();
    // Determine extension from MIME type
    const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
    formData.append('audio', audioBlob, `recording.${ext}`);
    formData.append('sessionId', options.sessionId || '');
    formData.append('experimentId', options.experimentId || '');

    if (options.circuitState) {
        formData.append('circuitState', JSON.stringify(options.circuitState));
    }
    if (options.simulatorContext) {
        formData.append('simulatorContext', JSON.stringify(options.simulatorContext));
    }

    if (isSupabaseEdge()) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        let abortHandler = null;
        if (signal) {
            if (signal.aborted) {
                clearTimeout(timeoutId);
                throw new DOMException('Aborted', 'AbortError');
            }
            abortHandler = () => controller.abort();
            signal.addEventListener('abort', abortHandler, { once: true });
        }
        formData.append('language', 'it');
        const headers = {};
        if (SUPABASE_EDGE_KEY) {
            headers.apikey = SUPABASE_EDGE_KEY;
            headers.Authorization = `Bearer ${SUPABASE_EDGE_KEY}`;
        }
        if (ELAB_API_KEY) headers['X-Elab-Api-Key'] = ELAB_API_KEY;

        try {
            const sttResp = await fetch(`${NANOBOT_URL}/unlim-stt`, {
                method: 'POST',
                headers,
                body: formData,
                signal: controller.signal,
            });
            const sttData = await sttResp.json().catch(() => ({}));
            if (!sttResp.ok || !sttData.success || !sttData.text) {
                throw new Error(sttData.error || sttData.details || `STT error: ${sttResp.status}`);
            }

            const { sendChat } = await import('./api');
            const chatResult = await sendChat(sttData.text, [], {
                experimentId: options.experimentId || null,
                circuitState: options.circuitState || null,
                simulatorContext: options.simulatorContext || null,
                socraticMode: true,
                signal: controller.signal,
            });
            const response = chatResult?.response || chatResult?.message || '';
            let audio = null;
            if (response) {
                try { audio = await synthesizeSpeech(response); } catch { audio = null; }
            }
            return {
                success: true,
                userText: sttData.text,
                response,
                audio,
                audioFormat: 'audio/mpeg',
                source: 'unlim-stt+unlim-chat',
            };
        } finally {
            clearTimeout(timeoutId);
            if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s max

    if (signal) {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
        const resp = await fetch(`${NANOBOT_URL}/voice-chat`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || `Voice chat error: ${resp.status}`);
        }

        return await resp.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

// TTS endpoints — same-origin Voxtral clone proxy → Kokoro → Edge → fallback
const KOKORO_VOICE = 'if_sara'; // Italian female Sara

/**
 * Pick the right TTS endpoint for the current environment.
 * HTTPS origin (produzione elabtutor.school): raw HTTP engines are blocked as
 * mixed content, so voice always goes through same-origin Vercel proxies.
 */
function getVoxtralUrl() {
    return '/api/voxtral';
}

function getKokoroUrl() {
    return '/api/kokoro';
}

function getEdgeTtsUrl(encodedText) {
    return `/api/tts?text=${encodedText}`;
}

/**
 * Send text to TTS. Chain: Voxtral cloned voice → Kokoro → Edge TTS → Nanobot → browser fallback.
 * @param {string} text - text to synthesize
 * @returns {Promise<ArrayBuffer>} audio data (MP3)
 */
export async function synthesizeSpeech(text) {
    const clipped = String(text || '').slice(0, 500);
    if (!clipped) throw new Error('Empty text for TTS');
    const encoded = encodeURIComponent(clipped);

    // 1. Voxtral primary: configured Andrea cloned voice via Supabase unlim-tts.
    try {
        const resp = await fetch(getVoxtralUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: clipped, provider: 'voxtral', response_format: 'mp3' }),
            signal: AbortSignal.timeout(10000),
        });
        const provider = resp.headers?.get?.('x-tts-provider') || '';
        const contentType = resp.headers?.get?.('content-type') || '';
        if (resp.ok && contentType.startsWith('audio/') && (!provider || provider === 'voxtral')) {
            logger.debug('[Voice] Voxtral cloned TTS success');
            return await resp.arrayBuffer();
        }
    } catch (e) {
        logger.debug('[Voice] Voxtral not available:', e.message);
    }

    // 2. Kokoro VPS (OpenAI-compat, voce italiana naturale)
    try {
        const resp = await fetch(getKokoroUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: clipped,
                voice: KOKORO_VOICE,
                response_format: 'mp3',
            }),
            signal: AbortSignal.timeout(10000),
        });
        if (resp.ok) {
            logger.debug('[Voice] Kokoro TTS success');
            return await resp.arrayBuffer();
        }
    } catch (e) {
        logger.debug('[Voice] Kokoro not available:', e.message);
    }

    // 3. Try Edge TTS — goes through /api/tts proxy on HTTPS origins to
    //    avoid mixed-content blocks, or direct to VPS on localhost.
    try {
        const resp = await fetch(getEdgeTtsUrl(encoded), {
            signal: AbortSignal.timeout(15000),
        });
        if (resp.ok) {
            logger.debug('[Voice] Edge TTS success');
            return await resp.arrayBuffer();
        }
    } catch (e) {
        logger.debug('[Voice] Edge TTS fallback:', e.message);
    }

    // Fallback to nanobot TTS
    if (NANOBOT_URL) {
        const formData = new FormData();
        formData.append('text', text);
        const resp = await fetch(`${NANOBOT_URL}/tts`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(15000),
        });
        if (resp.ok) return await resp.arrayBuffer();
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `TTS error: ${resp.status}`);
    }

    throw new Error('Nessun servizio TTS disponibile');
}

/**
 * Play audio from base64 string or ArrayBuffer.
 * Returns a promise that resolves when playback completes.
 * @param {string|ArrayBuffer} audio - base64 MP3 string or ArrayBuffer
 * @param {string} format - MIME type (default: audio/mpeg)
 * @returns {Promise<HTMLAudioElement>}
 */
export function playAudio(audio, format = 'audio/mpeg') {
    return new Promise((resolve, reject) => {
        try {
            let blob;
            if (typeof audio === 'string') {
                // base64 string
                const bytes = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
                blob = new Blob([bytes], { type: format });
            } else {
                // ArrayBuffer
                blob = new Blob([audio], { type: format });
            }

            const url = URL.createObjectURL(blob);
            const player = new Audio(url);

            // Track for stop functionality
            currentPlayer = player;

            player.onended = () => {
                URL.revokeObjectURL(url);
                if (currentPlayer === player) currentPlayer = null;
                resolve(player);
            };
            player.onerror = (e) => {
                URL.revokeObjectURL(url);
                if (currentPlayer === player) currentPlayer = null;
                reject(new Error('Audio playback failed'));
            };

            player.play().catch(reject);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Stop any currently playing audio.
 */
let currentPlayer = null;
export function stopPlayback() {
    if (currentPlayer) {
        currentPlayer.pause();
        currentPlayer = null;
    }
}

/**
 * Play audio and track the player for stop functionality.
 * @param {string|ArrayBuffer} audio
 * @param {string} format
 * @returns {Promise<void>}
 */
export async function playTracked(audio, format = 'audio/mpeg') {
    stopPlayback();
// © Andrea Marro — 18/04/2026 — ELAB Tutor — Tutti i diritti riservati
    await playAudio(audio, format);
}
