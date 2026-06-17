/**
 * voxtral-client — Mistral Voxtral 4B TTS client (Italian via cross-lingual transfer
 * OR custom-cloned voice ID).
 *
 * Sprint T iter 29 — Voxtral PRIMARY TTS provider (replaces Edge TTS Isabella as primary).
 *
 * Why Voxtral:
 *   - Mistral EU FR — GDPR-clean for student runtime
 *   - 70 ms model latency (best-in-class TTS for ELAB UNLIM voice)
 *   - 68.4 % win rate vs ElevenLabs Flash v2.5 in human preference (multilingual)
 *   - 9 native languages including Italian
 *   - Voice cloning from 3-6 s audio sample (Morfismo Sense 2 narratore volumi)
 *   - Cloud API $0.016 / 1k char (≈60% cheaper than Cartesia)
 *
 * Endpoint:
 *   POST https://api.mistral.ai/v1/audio/speech
 *
 * Request body:
 *   { model, input, voice_id, response_format }
 *
 * Response:
 *   200 OK  application/json  { audio_data: "<base64>" }   ← NOT raw stream
 *   4xx/5xx application/json  { object: "error", message, code, ... }
 *
 * Default voice (Andrea iter 29 — pre-clone phase):
 *   c69964a6-ab8b-4f8a-9465-ec0925096ec8  "Paul - Neutral" en_us
 *   → cross-lingual transfer for Italian text (acceptable until Andrea/Davide
 *     supplies a 3-6 s Italian narrator clone via voice-cloning helper below).
 *
 * Override via env:
 *   VOXTRAL_VOICE_ID    → custom cloned voice id (recommended for prod)
 *   VOXTRAL_MODEL       → defaults to `voxtral-mini-tts-2603`
 *
 * Verified live 2026-04-30 04:18 UTC (Mistral key access OK, 23 KB MP3 23 KB
 * generated for `Ragazzi, oggi costruiamo un circuito con un LED.`,
 * cross-lingual EN→IT @745 ms first call).
 */

const VOXTRAL_ENDPOINT = 'https://api.mistral.ai/v1/audio/speech';
const VOICES_ENDPOINT = 'https://api.mistral.ai/v1/audio/voices';

const DEFAULT_MODEL = 'voxtral-mini-tts-2603';
const DEFAULT_VOICE_ID = 'c69964a6-ab8b-4f8a-9465-ec0925096ec8'; // Paul - Neutral en_us
const DEFAULT_TIMEOUT_MS = 10_000;

export type VoxtralFormat = 'mp3' | 'wav' | 'pcm' | 'flac' | 'opus';

export interface VoxtralRequest {
  text: string;
  voiceId?: string;
  model?: string;
  format?: VoxtralFormat;
  timeoutMs?: number;
}

export interface VoxtralResult {
  ok: boolean;
  audio?: Uint8Array;
  contentType?: string;
  latencyMs: number;
  voiceId?: string;
  model?: string;
  errorReason?: string;
  errorCode?: string;
  statusCode?: number;
}

/**
 * Synthesize Italian (or any of 9 supported languages) audio via Mistral Voxtral.
 *
 * Returns binary Uint8Array audio + content-type. Never throws — surfaces errors
 * via `errorReason` so the caller can fall back to Edge TTS gracefully.
 */
export async function synthesizeVoxtral(req: VoxtralRequest): Promise<VoxtralResult> {
  const start = Date.now();
  const apiKey = (Deno.env.get('MISTRAL_API_KEY') ?? '').trim();

  if (!apiKey) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      errorReason: 'MISTRAL_API_KEY not configured',
    };
  }

  if (!req.text || req.text.trim().length === 0) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      errorReason: 'empty input text',
    };
  }

  const model = (req.model || Deno.env.get('VOXTRAL_MODEL') || DEFAULT_MODEL).trim();
  const voiceId = (req.voiceId || Deno.env.get('VOXTRAL_VOICE_ID') || DEFAULT_VOICE_ID).trim();
  // Iter 34 P0 Andrea "voce più veloce": opus default (40% smaller mp3, faster
  // network transfer + decode browser native AudioContext). Fallback mp3 if
  // explicit req.format='mp3'. Opus encoding latency Voxtral side ~10ms (model
  // 70ms + opus encode 10ms = 80ms total vs mp3 70+30=100ms).
  const format = req.format || 'opus';
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(VOXTRAL_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: req.text,
        voice_id: voiceId,
        response_format: format,
      }),
    });
    clearTimeout(timeoutHandle);

    const latencyMs = Date.now() - start;
    const bodyText = await resp.text();

    if (!resp.ok) {
      let errCode = String(resp.status);
      let errMsg = bodyText.slice(0, 300);
      try {
        const j = JSON.parse(bodyText);
        if (j.code) errCode = String(j.code);
        if (j.message) errMsg = String(j.message).slice(0, 300);
      } catch (_) { /* keep raw text */ }
      return {
        ok: false,
        latencyMs,
        statusCode: resp.status,
        errorReason: errMsg,
        errorCode: errCode,
        voiceId,
        model,
      };
    }

    // Voxtral returns JSON {audio_data: "<b64>"} (not raw audio stream)
    let audioB64: string | undefined;
    try {
      const j = JSON.parse(bodyText);
      audioB64 = j.audio_data;
    } catch (_) {
      return {
        ok: false,
        latencyMs,
        statusCode: resp.status,
        errorReason: 'unexpected non-JSON Voxtral response',
        voiceId,
        model,
      };
    }

    if (!audioB64) {
      return {
        ok: false,
        latencyMs,
        statusCode: resp.status,
        errorReason: 'audio_data field missing in Voxtral response',
        voiceId,
        model,
      };
    }

    // Decode base64 → Uint8Array
    const binary = atob(audioB64);
    const audio = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) audio[i] = binary.charCodeAt(i);

    return {
      ok: true,
      audio,
      contentType: contentTypeForFormat(format),
      latencyMs,
      voiceId,
      model,
      statusCode: resp.status,
    };
  } catch (e) {
    clearTimeout(timeoutHandle);
    const latencyMs = Date.now() - start;
    return {
      ok: false,
      latencyMs,
      errorReason: e instanceof Error ? e.message : String(e),
      voiceId,
      model,
    };
  }
}

function contentTypeForFormat(fmt: VoxtralFormat): string {
  switch (fmt) {
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'flac': return 'audio/flac';
    case 'opus': return 'audio/opus';
    case 'pcm': return 'audio/L16';
    default: return 'application/octet-stream';
  }
}

// ────────────────────────────────────────────────────────────
// Voice cloning helper (one-shot setup, NOT called at runtime)
// ────────────────────────────────────────────────────────────

export interface CloneVoiceRequest {
  name: string;                  // human-readable label
  sampleAudioBase64: string;     // 3-6 s audio reference (mp3/wav)
  sampleFilename?: string;       // e.g. "elab-narrator-it.mp3"
  languages?: string[];          // e.g. ["it"]
  gender?: 'male' | 'female';
  age?: number;
  tags?: string[];
}

export interface CloneVoiceResult {
  ok: boolean;
  voiceId?: string;
  raw?: unknown;
  errorReason?: string;
}

/**
 * One-shot voice cloning. Returns a voice_id to set in `VOXTRAL_VOICE_ID` env
 * for subsequent `synthesizeVoxtral` calls.
 *
 * Per Mistral docs: voice prompt should be in the same language as future text
 * prompts. For ELAB Italian K-12 narrator: supply an Italian sample.
 */
export async function cloneVoice(req: CloneVoiceRequest): Promise<CloneVoiceResult> {
  const apiKey = (Deno.env.get('MISTRAL_API_KEY') ?? '').trim();
  if (!apiKey) return { ok: false, errorReason: 'MISTRAL_API_KEY not configured' };

  try {
    const resp = await fetch(VOICES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: req.name,
        sample_audio: req.sampleAudioBase64,
        sample_filename: req.sampleFilename,
        languages: req.languages,
        gender: req.gender,
        age: req.age,
        tags: req.tags,
      }),
    });
    const bodyText = await resp.text();
    if (!resp.ok) return { ok: false, errorReason: bodyText.slice(0, 400) };
    const j = JSON.parse(bodyText);
    return { ok: true, voiceId: j.id, raw: j };
  } catch (e) {
    return { ok: false, errorReason: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * List all available voices (pre-built + cloned). Useful for dashboard / debug.
 */
export async function listVoices(): Promise<unknown> {
  const apiKey = (Deno.env.get('MISTRAL_API_KEY') ?? '').trim();
  if (!apiKey) throw new Error('MISTRAL_API_KEY not configured');
  const resp = await fetch(VOICES_ENDPOINT, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  return resp.json();
}

export const VOXTRAL_DEFAULTS = {
  model: DEFAULT_MODEL,
  voiceId: DEFAULT_VOICE_ID,
  format: 'opus' as VoxtralFormat, // iter 34 default opus (faster decode browser)
  timeoutMs: DEFAULT_TIMEOUT_MS,
} as const;
