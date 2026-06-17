/**
 * edge-tts-client — Microsoft Edge TTS WebSocket Deno client
 *
 * Sprint S iter 8 ATOM-S8-A4 — WS protocol migration (was REST stub iter 6).
 *
 * Why WebSocket:
 *   - REST endpoint /readaloud/edge/v1 deprecated by Microsoft 2026-Q1
 *     (intermittent HTTP 401/403 responses without warning)
 *   - WSS endpoint is the canonical protocol used by Edge browser Read Aloud
 *     and rany2/edge-tts python lib (>4k stars, MIT)
 *   - Streaming audio frames (audio.24khz-48kbitrate-mono-mp3 OR ogg-24khz-16bit-mono-opus)
 *
 * Protocol summary:
 *   1. Open WSS to wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1
 *      ?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4
 *      &Sec-MS-GEC=<hex>
 *      &Sec-MS-GEC-Version=1-130.0.2849.46
 *      &ConnectionId=<uuid>
 *   2. Send `speech.config` text frame (JSON config with output format)
 *   3. Send `ssml` text frame with body (`<speak ...>...</speak>`)
 *   4. Receive binary frames (audio chunks). Each frame begins with
 *      `Path:audio\r\n` header followed by raw audio bytes (header length is in
 *      first 2 bytes big-endian).
 *   5. Receive `Path:turn.end` text frame → close connection.
 *
 * Reference impls:
 *   - rany2/edge-tts (python) — https://github.com/rany2/edge-tts
 *   - JaVi7864/edge-tts-py-deno — Deno port reference
 *
 * Function signature preserved:
 *   `synthesizeIsabella(req): Promise<IsabellaTTSResult>`
 *
 * Honesty caveats:
 *   - Sec-MS-GEC token rotates every 5min. We compute via SHA-256 of timestamp +
 *     TRUSTED_CLIENT_TOKEN (matches rany2/edge-tts derive_sec_ms_gec algorithm
 *     reverse-engineered from Edge browser).
 *   - When WS handshake fails (network, blocked region, MS rotates protocol),
 *     we return ok:false errorReason — caller falls back to browser
 *     speechSynthesis (preserved from iter 6).
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8 — Sprint S
 */

export interface IsabellaTTSRequest {
  text: string;
  /** SSML voice short name; default 'it-IT-IsabellaNeural' */
  voice?: string;
  /** SSML rate, e.g. '-5%' '0%' '+10%'; default '-5%' (ragazzi) */
  rate?: string;
  /** SSML pitch, e.g. 'default' '-2Hz' '+2Hz'; default 'default' */
  pitch?: string;
  /** SSML volume e.g. 'default' '+10%'; default 'default' */
  volume?: string;
}

export interface IsabellaTTSResult {
  ok: boolean;
  audio?: ArrayBuffer;
  contentType?: string;
  errorReason?: string;
  latencyMs: number;
}

// Public Trusted Client Token used by Microsoft Edge Read-Aloud feature.
const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

const WSS_BASE = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';

const DEFAULT_VOICE = 'it-IT-IsabellaNeural';
const DEFAULT_RATE = '-5%';
const DEFAULT_PITCH = 'default';
const DEFAULT_VOLUME = 'default';

/** Output audio format. mp3 24kHz 48kbps mono — small + standard for browser playback. */
const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';

/** Hard cap text per request (Microsoft endpoint refuses huge SSML). */
const MAX_TEXT_LEN = 500;

/** WS connection timeout (ms). Vision LLM upstream is the slowest; 10s budget here. */
const WS_TIMEOUT_MS = 10000;

/** Maximum audio frames before we stop accumulating (defensive cap ~ 5MB). */
const MAX_AUDIO_FRAMES = 500;

// ────────────────────────────────────────────────────────────────────────────
// Helpers — UUID, GEC token, header parsing
// ────────────────────────────────────────────────────────────────────────────

/** Generate UUID v4 (no dashes), Deno-compatible. */
function uuid4NoDash(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  // fallback: 32 hex chars random
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive Sec-MS-GEC token: SHA-256 hex of `<windowsTicks>${TRUSTED_CLIENT_TOKEN}`,
 * UPPERCASE. Window = current timestamp rounded to nearest 5min boundary in
 * Windows file-time ticks (100ns since 1601-01-01).
 *
 * Algo from rany2/edge-tts derive_sec_ms_gec (MIT) — verified vs Edge browser
 * dev-tools network capture 2026-04-27.
 */
async function deriveSecMsGec(): Promise<string> {
  // Unix ms → Windows file-time ticks
  // Constant offset: 116444736000000000 (ticks from 1601-01-01 to 1970-01-01)
  const nowMs = Date.now();
  const ticks = BigInt(nowMs) * 10000n + 116444736000000000n;
  // Round down to nearest 5-minute boundary (5min = 3000000000 100ns ticks)
  const FIVE_MIN_TICKS = 3000000000n;
  const rounded = ticks - (ticks % FIVE_MIN_TICKS);
  const data = `${rounded.toString()}${TRUSTED_CLIENT_TOKEN}`;
  const buf = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/** XML escape for SSML body (text injected between tags). */
function escapeForSsml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Build SSML envelope for Edge TTS WS. */
export function buildIsabellaSsml(text: string, voice: string, rate: string, pitch: string, volume: string = DEFAULT_VOLUME): string {
  const safe = escapeForSsml(text.slice(0, MAX_TEXT_LEN));
  return [
    `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='it-IT'>`,
    `<voice name='${voice}'>`,
    `<prosody rate='${rate}' pitch='${pitch}' volume='${volume}'>${safe}</prosody>`,
    `</voice>`,
    `</speak>`,
  ].join('');
}

/** Build the speech.config text frame sent before SSML. */
function buildSpeechConfigFrame(requestId: string): string {
  const headers = [
    `X-Timestamp:${new Date().toISOString()}`,
    `Content-Type:application/json; charset=utf-8`,
    `Path:speech.config`,
  ].join('\r\n');
  const body = JSON.stringify({
    context: {
      synthesis: {
        audio: {
          metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' },
          outputFormat: OUTPUT_FORMAT,
        },
      },
    },
  });
  return `${headers}\r\n\r\n${body}`;
}

/** Build the SSML text frame. */
function buildSsmlFrame(requestId: string, ssml: string): string {
  const headers = [
    `X-RequestId:${requestId}`,
    `Content-Type:application/ssml+xml`,
    `X-Timestamp:${new Date().toISOString()}Z`,
    `Path:ssml`,
  ].join('\r\n');
  return `${headers}\r\n\r\n${ssml}`;
}

/**
 * Parse incoming binary frame:
 *   header_len (2 bytes big-endian) + headers (utf-8) + audio bytes
 * Returns audio bytes if Path:audio, else null.
 */
function parseBinaryFrame(buf: ArrayBuffer): { isAudio: boolean; audio: Uint8Array | null } {
  const view = new DataView(buf);
  if (buf.byteLength < 2) return { isAudio: false, audio: null };
  const headerLen = view.getUint16(0, false); // big-endian
  if (headerLen + 2 > buf.byteLength) return { isAudio: false, audio: null };
  const headerBytes = new Uint8Array(buf, 2, headerLen);
  const headerText = new TextDecoder('utf-8').decode(headerBytes);
  const isAudio = /Path:\s*audio/i.test(headerText);
  if (!isAudio) return { isAudio: false, audio: null };
  const audio = new Uint8Array(buf, 2 + headerLen, buf.byteLength - 2 - headerLen);
  return { isAudio: true, audio };
}

/** Detect turn.end frame in incoming text payload. */
function isTurnEnd(text: string): boolean {
  return /Path:\s*turn\.end/i.test(text);
}

// ────────────────────────────────────────────────────────────────────────────
// Main: synthesizeIsabella via WSS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Synthesize speech via Microsoft Edge Read-Aloud WS endpoint.
 *
 * @example
 *   const r = await synthesizeIsabella({ text: 'Ciao ragazzi', rate: '-5%' });
 *   if (r.ok) playAudio(r.audio);  // ArrayBuffer mp3
 */
export async function synthesizeIsabella(req: IsabellaTTSRequest): Promise<IsabellaTTSResult> {
  const start = Date.now();
  const text = (req.text || '').trim();
  if (!text) return { ok: false, errorReason: 'empty text', latencyMs: 0 };

  const voice = (req.voice || DEFAULT_VOICE).trim();
  const rate = (req.rate || DEFAULT_RATE).trim();
  const pitch = (req.pitch || DEFAULT_PITCH).trim();
  const volume = (req.volume || DEFAULT_VOLUME).trim();
  const ssml = buildIsabellaSsml(text, voice, rate, pitch, volume);

  let secMsGec: string;
  try {
    secMsGec = await deriveSecMsGec();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, errorReason: `gec derive failed: ${msg}`, latencyMs: Date.now() - start };
  }

  const requestId = uuid4NoDash();
  const url = `${WSS_BASE}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`
    + `&Sec-MS-GEC=${secMsGec}`
    + `&Sec-MS-GEC-Version=1-130.0.2849.46`
    + `&ConnectionId=${requestId}`;

  return new Promise<IsabellaTTSResult>((resolve) => {
    let settled = false;
    const audioChunks: Uint8Array[] = [];
    let totalAudioBytes = 0;
    let frameCount = 0;
    let ws: WebSocket | null = null;

    const finish = (result: IsabellaTTSResult) => {
      if (settled) return;
      settled = true;
      try { ws?.close(); } catch (_e) { /* skip */ }
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ ok: false, errorReason: `ws timeout after ${WS_TIMEOUT_MS}ms`, latencyMs: Date.now() - start });
    }, WS_TIMEOUT_MS);

    try {
      ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        try {
          ws!.send(buildSpeechConfigFrame(requestId));
          ws!.send(buildSsmlFrame(requestId, ssml));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          clearTimeout(timer);
          finish({ ok: false, errorReason: `ws send failed: ${msg}`, latencyMs: Date.now() - start });
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        frameCount++;
        if (frameCount > MAX_AUDIO_FRAMES) {
          clearTimeout(timer);
          finish({ ok: false, errorReason: `too many frames (${frameCount}) — defensive cap`, latencyMs: Date.now() - start });
          return;
        }

        const data = event.data;
        if (data instanceof ArrayBuffer) {
          const { isAudio, audio } = parseBinaryFrame(data);
          if (isAudio && audio) {
            audioChunks.push(audio);
            totalAudioBytes += audio.byteLength;
          }
        } else if (typeof data === 'string') {
          if (isTurnEnd(data)) {
            // Concatenate audio
            if (totalAudioBytes < 64) {
              clearTimeout(timer);
              finish({
                ok: false,
                errorReason: `ws empty audio (bytes=${totalAudioBytes})`,
                latencyMs: Date.now() - start,
              });
              return;
            }
            const combined = new Uint8Array(totalAudioBytes);
            let offset = 0;
            for (const chunk of audioChunks) {
              combined.set(chunk, offset);
              offset += chunk.byteLength;
            }
            clearTimeout(timer);
            finish({
              ok: true,
              audio: combined.buffer,
              contentType: 'audio/mpeg',
              latencyMs: Date.now() - start,
            });
          }
        }
      };

      ws.onerror = (event: Event) => {
        const msg = (event as Event & { message?: string }).message || 'ws error';
        clearTimeout(timer);
        finish({ ok: false, errorReason: `ws error: ${msg}`, latencyMs: Date.now() - start });
      };

      ws.onclose = (event: CloseEvent) => {
        if (settled) return;
        // If we have audio but no turn.end (rare), still return what we have
        if (totalAudioBytes >= 64) {
          const combined = new Uint8Array(totalAudioBytes);
          let offset = 0;
          for (const chunk of audioChunks) {
            combined.set(chunk, offset);
            offset += chunk.byteLength;
          }
          clearTimeout(timer);
          finish({
            ok: true,
            audio: combined.buffer,
            contentType: 'audio/mpeg',
            latencyMs: Date.now() - start,
          });
        } else {
          clearTimeout(timer);
          finish({
            ok: false,
            errorReason: `ws closed code=${event.code} reason=${event.reason || '(none)'}`,
            latencyMs: Date.now() - start,
          });
        }
      };
    } catch (err) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : String(err);
      finish({ ok: false, errorReason: `ws construct failed: ${msg}`, latencyMs: Date.now() - start });
    }
  });
}

export const ISABELLA_DEFAULTS = {
  voice: DEFAULT_VOICE,
  rate: DEFAULT_RATE,
  pitch: DEFAULT_PITCH,
  volume: DEFAULT_VOLUME,
  outputFormat: OUTPUT_FORMAT,
};
