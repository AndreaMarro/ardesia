/**
 * Cloudflare Workers AI client — Sprint T iter 24
 *
 * Provider: Cloudflare Workers AI (free tier 10k req/day shared).
 * Models supported:
 *   - imageGen: `@cf/black-forest-labs/flux-1-schnell` (FLUX schnell)
 *   - stt:      `@cf/openai/whisper-large-v3-turbo`
 *   - embed:    `@cf/baai/bge-m3` (1024-dim)
 *
 * API: POST https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}
 * Auth: `Bearer ${CLOUDFLARE_API_TOKEN}` (env).
 * Account ID hardcoded fallback: 31b0f72ef02445f6a9987c994fe17b56 (override
 * via env CLOUDFLARE_ACCOUNT_OR_ZONE_ID per CLAUDE.md infra).
 *
 * Iter 24 scope: implement `cfImageGen`, `cfWhisperSTT`, `cfBgeM3Embed`.
 * Wired into `multimodalRouter.routeImageGen` (replaces stub).
 *
 * (c) Andrea Marro 2026-04-29 — ELAB Tutor
 */

import { GeminiError, ErrorCode } from './gemini.ts';

const CF_DEFAULT_ACCOUNT = '31b0f72ef02445f6a9987c994fe17b56';
const TIMEOUT_MS = 30_000; // imageGen can be slow

function cfBaseUrl(): string {
  const acct = (Deno.env.get('CLOUDFLARE_ACCOUNT_OR_ZONE_ID') || CF_DEFAULT_ACCOUNT).trim();
  return `https://api.cloudflare.com/client/v4/accounts/${acct}/ai/run`;
}

function cfHeaders(): Record<string, string> {
  const token = (Deno.env.get('CLOUDFLARE_API_TOKEN') || '').trim();
  if (!token) throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'CLOUDFLARE_API_TOKEN not configured');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function cfFetch(model: string, body: unknown): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${cfBaseUrl()}/${model}`, {
      method: 'POST',
      headers: cfHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new GeminiError(ErrorCode.TIMEOUT, `Cloudflare ${model} timed out`);
    }
    throw e;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Image generation — FLUX schnell
// ────────────────────────────────────────────────────────────────────────────

export interface CfImageGenOptions {
  prompt: string;
  numSteps?: number;        // default 4 (schnell), max 8
  width?: number;           // default 1024
  height?: number;          // default 1024
}

export interface CfImageGenResult {
  imageBase64: string;      // PNG base64 (no data:URL prefix)
  model: string;
  provider: 'cloudflare';
  latencyMs: number;
}

export async function cfImageGen(opts: CfImageGenOptions): Promise<CfImageGenResult> {
  const start = Date.now();
  const body = {
    prompt: opts.prompt,
    num_steps: opts.numSteps ?? 4,
    width: opts.width ?? 1024,
    height: opts.height ?? 1024,
  };
  const res = await cfFetch('@cf/black-forest-labs/flux-1-schnell', body);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GeminiError(ErrorCode.API_ERROR, `CF FLUX ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  // CF returns { result: { image: '<base64>' }, success: true, errors, messages }
  const imageBase64: string = data?.result?.image ?? '';
  if (!imageBase64) {
    throw new GeminiError(ErrorCode.EMPTY_RESPONSE, 'CF FLUX empty image');
  }
  return {
    imageBase64,
    model: '@cf/black-forest-labs/flux-1-schnell',
    provider: 'cloudflare',
    latencyMs: Date.now() - start,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// STT — Whisper Turbo
// ────────────────────────────────────────────────────────────────────────────

export interface CfWhisperOptions {
  /** Audio bytes (raw, base64 string, or Uint8Array). */
  audio: Uint8Array | number[] | string;
  language?: string; // e.g. 'it', 'en'
  /**
   * iter 37 A4: shape selector. CF Whisper Turbo accepts both shapes 2026:
   *   'auto'        — try base64 JSON first (canonical 2026), fallback raw binary
   *   'base64-json' — POST application/json {audio: "base64..."} (CF canonical)
   *   'raw-binary'  — POST application/octet-stream <bytes> (curl --data-binary)
   * Default 'auto' for maximum compatibility (Voxtral Ogg Opus + WAV + MP3 + WebM).
   */
  inputShape?: 'auto' | 'base64-json' | 'raw-binary';
}

export interface CfWhisperResult {
  text: string;
  model: string;
  provider: 'cloudflare';
  latencyMs: number;
  /** iter 37 A4: which input shape actually succeeded (auto retry telemetry). */
  shapeUsed?: 'base64-json' | 'raw-binary';
  /** iter 37 A4: detected audio container from magic bytes (ogg|webm|mp3|wav|flac|unknown). */
  audioContainer?: string;
  /** iter 37 A4: surface language returned by CF when available. */
  language?: string;
  meta?: Record<string, unknown>;
}

/**
 * Detect audio container from leading magic bytes. Used for telemetry +
 * future format-specific handling. NEVER throws — returns 'unknown' on
 * unrecognized signatures.
 */
function detectAudioContainer(bytes: Uint8Array): string {
  if (bytes.length < 4) return 'unknown';
  // OggS — Ogg container (Opus / Vorbis)
  if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'ogg';
  // 1A 45 DF A3 — EBML / Matroska / WebM
  if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return 'webm';
  // RIFF....WAVE
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return 'wav';
  // ID3 (MP3 with metadata)
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'mp3';
  // FF Fx — MP3 frame sync
  if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) return 'mp3';
  // fLaC
  if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) return 'flac';
  // 00 00 00 .. ftyp — MP4 / M4A
  if (bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'mp4';
  return 'unknown';
}

/** Encode bytes → base64 (chunked for large arrays to avoid stack overflow). */
function bytesToBase64(bytes: Uint8Array): string {
  // Process in 8KB chunks to avoid String.fromCharCode argument limit (~64K args).
  const CHUNK = 0x2000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Cloudflare Whisper STT — iter 37 Phase 3 fix v2 dual-shape with auto-fallback.
 *
 * The 2026 CF Whisper Turbo REST API accepts:
 *   - application/json {audio: [byte_array], language?}  (canonical per CF docs — array of integer bytes 0-255)
 *   - audio/<container> <raw bytes>                       (binary upload path with format-specific Content-Type)
 *
 * Iter 37 Phase 3 fix: prior implementation sent `{audio: "<base64string>"}` which CF rejects with
 * "AiError: Invalid input (code 8001)" — Tester-4 9/9 FAIL matrix confirmed both paths broken.
 * Root cause: CF API expects ARRAY of integer bytes per audio field, not base64-encoded string.
 *
 * Strategy v2 (iter 37 Phase 3):
 *   1. Try array-json first (CORRECT canonical CF format).
 *   2. On 4xx, retry binary with format-specific Content-Type from container detection.
 *   3. Surface `shapeUsed` + `audioContainer` for telemetry / debug.
 */
export async function cfWhisperSTT(opts: CfWhisperOptions): Promise<CfWhisperResult> {
  const start = Date.now();
  // Normalize input → Uint8Array
  let audioBytes: Uint8Array;
  if (opts.audio instanceof Uint8Array) {
    audioBytes = opts.audio;
  } else if (Array.isArray(opts.audio)) {
    audioBytes = new Uint8Array(opts.audio);
  } else if (typeof opts.audio === 'string') {
    // Caller may pass base64 string directly — decode for container detection.
    try {
      const bin = atob(opts.audio);
      audioBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) audioBytes[i] = bin.charCodeAt(i);
    } catch {
      throw new GeminiError(ErrorCode.API_ERROR, 'CF Whisper invalid base64 input string');
    }
  } else {
    throw new GeminiError(ErrorCode.API_ERROR, 'CF Whisper unsupported audio input type');
  }

  const audioContainer = detectAudioContainer(audioBytes);
  const url = `${cfBaseUrl()}/@cf/openai/whisper-large-v3-turbo`;
  const token = (Deno.env.get('CLOUDFLARE_API_TOKEN') || '').trim();
  if (!token) throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'CLOUDFLARE_API_TOKEN not configured');

  const shape = opts.inputShape || 'auto';

  // Helper to perform a POST with given Content-Type + body, with timeout.
  async function postOnce(contentType: string, body: BodyInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (e) {
      clearTimeout(timeout);
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new GeminiError(ErrorCode.TIMEOUT, `Cloudflare Whisper timed out`);
      }
      throw e;
    }
  }

  // iter 37 Phase 3 fix v2: build array-of-bytes JSON payload (CF canonical REST format).
  const lang = opts.language || 'it';
  const buildArrayJsonBody = () => JSON.stringify({ audio: Array.from(audioBytes), language: lang });

  // Map detected audio container → format-specific Content-Type for binary fallback.
  // Falls back to application/octet-stream for unknown containers.
  function containerToContentType(container: string): string {
    switch (container) {
      case 'wav': return 'audio/wav';
      case 'mp3': return 'audio/mpeg';
      case 'ogg': return 'audio/ogg';
      case 'webm': return 'audio/webm';
      case 'flac': return 'audio/flac';
      case 'mp4': return 'audio/mp4';
      default: return 'application/octet-stream';
    }
  }

  let res: Response | null = null;
  let shapeUsed: 'base64-json' | 'raw-binary' = 'base64-json';

  if (shape === 'base64-json' || shape === 'auto') {
    res = await postOnce('application/json', buildArrayJsonBody());
    shapeUsed = 'base64-json';  // logical name preserved for telemetry compat (now means array-json)
    // On 4xx retry raw binary with format-specific Content-Type (auto only).
    if (!res.ok && shape === 'auto' && res.status >= 400 && res.status < 500) {
      const errBody = await res.text().catch(() => '');
      console.warn(JSON.stringify({
        level: 'warn', event: 'cf_whisper_array_json_failed_retry_binary',
        status: res.status, container: audioContainer,
        contentType: containerToContentType(audioContainer),
        error: errBody.slice(0, 200),
      }));
      res = await postOnce(containerToContentType(audioContainer), audioBytes);
      shapeUsed = 'raw-binary';
    }
  } else {
    // shape === 'raw-binary' explicit — use format-specific Content-Type
    res = await postOnce(containerToContentType(audioContainer), audioBytes);
    shapeUsed = 'raw-binary';
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GeminiError(
      ErrorCode.API_ERROR,
      `CF Whisper ${res.status} (shape=${shapeUsed}, container=${audioContainer}): ${text.slice(0, 200)}`,
    );
  }
  const data = await res.json();
  const text: string = data?.result?.text ?? '';
  if (!text) throw new GeminiError(ErrorCode.EMPTY_RESPONSE, 'CF Whisper empty text');
  return {
    text,
    model: '@cf/openai/whisper-large-v3-turbo',
    provider: 'cloudflare',
    latencyMs: Date.now() - start,
    shapeUsed,
    audioContainer,
    language: data?.result?.language,
    meta: data?.result || {},
  };
}

// ────────────────────────────────────────────────────────────────────────────
// TTS — MeloTTS (MyShell, Italian native, female voice, 200-500 ms latency)
// Iter 31 P0 PIVOT: Voxtral cross-lingual EN→IT troppo lento + accent inglese.
// MeloTTS @cf/myshell-ai/melotts native Italian, female natural tone, free tier.
// ────────────────────────────────────────────────────────────────────────────

export interface CfMeloTtsOptions {
  text: string;
  lang?: string; // 'IT' | 'EN_NEWEST' | 'EN' | 'ES' | 'FR' | 'JP' | 'KR' | 'ZH'
  speaker?: string; // language-specific speaker id
}

export interface CfMeloTtsResult {
  audioBase64: string;     // MP3 base64 no prefix
  audio: Uint8Array;       // decoded bytes
  contentType: string;     // 'audio/mpeg'
  model: string;
  provider: 'cloudflare';
  latencyMs: number;
}

/**
 * Synthesize Italian audio via Cloudflare MeloTTS (native IT speaker, NOT cross-lingual).
 * Returns binary audio Uint8Array + base64. Never throws — error surfaced via reject.
 */
export async function cfMeloTtsSynthesize(opts: CfMeloTtsOptions): Promise<CfMeloTtsResult> {
  const start = Date.now();
  const body = {
    prompt: opts.text,
    lang: opts.lang || 'IT',
  };
  const res = await cfFetch('@cf/myshell-ai/melotts', body);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GeminiError(ErrorCode.API_ERROR, `CF MeloTTS ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  // CF returns { result: { audio: '<base64>' }, success: true }
  const audioBase64: string = data?.result?.audio ?? '';
  if (!audioBase64) {
    throw new GeminiError(ErrorCode.EMPTY_RESPONSE, 'CF MeloTTS empty audio');
  }
  // Decode base64 → Uint8Array
  const binary = atob(audioBase64);
  const audio = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) audio[i] = binary.charCodeAt(i);
  return {
    audioBase64,
    audio,
    contentType: 'audio/mpeg',
    model: '@cf/myshell-ai/melotts',
    provider: 'cloudflare',
    latencyMs: Date.now() - start,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Embeddings — BGE-M3 (1024-dim, multilingual)
// ────────────────────────────────────────────────────────────────────────────

export async function cfBgeM3Embed(texts: string[]): Promise<number[][]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const res = await cfFetch('@cf/baai/bge-m3', { text: texts });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GeminiError(ErrorCode.API_ERROR, `CF BGE-M3 ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const arr: number[][] = data?.result?.data ?? [];
  return arr;
}

export const CLOUDFLARE_CLIENT_VERSION = '1.0-iter24';
