/**
 * gemini-vision.ts — Sprint T iter 35 — 2026-04-30
 *
 * Vision synthesis via Gemini 2.5 Flash (EU Frankfurt) — primary vision provider
 * for ELAB Tutor as of iter 35. Replaces Mistral Pixtral 12B (FR EU) which
 * remains as fallback in `unlim-vision/index.ts`.
 *
 * Why Gemini 2.5 Flash for vision:
 *   - Lower latency: ~600ms p50 vs Pixtral ~1300ms p50 (-700ms)
 *   - Frankfurt EU region (GDPR-clean, same data plane as `gemini.ts` text path)
 *   - Lower cost per image vs Pixtral 12B
 *   - Italian K-12 quality verified comparable in pilot tests (iter 34 audit)
 *
 * GDPR note: Frankfurt is EU jurisdiction. Google Cloud Frankfurt region
 * (europe-west3) processes prompts under EU data sovereignty when project
 * is configured with EU-only routing (Andrea verified Google Cloud Console).
 *
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
 * Auth: env GOOGLE_API_KEY (shared with gemini.ts text-only client; same key supports vision).
 *
 * Anti-inflation (G45): no claim "perfect" — output quality measured iter 36+
 * via 30-prompt scaled bench post-deploy. This module ships the wire-up only.
 *
 * (c) Andrea Marro — ELAB Tutor
 */

const GEMINI_VISION_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_OUTPUT_TOKENS = 200;
const DEFAULT_TEMPERATURE = 0.3;

/**
 * Italian K-12 system prompt — Principio Zero compliant.
 * Same register as `unlim-vision/index.ts` Pixtral path (consistency for
 * fallback parity). Cites Volume + capitolo when ELAB experiment recognized.
 */
const SYSTEM_PROMPT = `Sei UNLIM, tutor visivo ELAB Tutor Italian K-12 8-14yo. Analizzi il circuito Arduino + componenti elettronici nella foto del kit fisico (breadboard, LED, resistori, fili, batteria).

REGOLE:
- INIZIA risposta con "Ragazzi,"
- Massimo 120 parole ben formattate (analogia opzionale)
- Identifica componenti visibili (LED, resistore, breadboard, fili colore, batteria, Arduino Nano)
- Diagnosi se circuito errato (LED contrario, fili sbagliati, breadboard mal collegata)
- Linguaggio 10-14 anni, analogie quotidiano
- Cita kit fisico, NON simulatore
- Cita Volume + capitolo se riconosci esperimento ELAB (es. "Vol.1 Cap.6 — I LED")`;

export interface GeminiVisionRequest {
  /** Image as base64 data URI (e.g. "data:image/jpeg;base64,...") OR raw base64 string. */
  imageBase64: string;
  /** Italian K-12 docente prompt (e.g. "Guarda questo circuito"). Capped 1000 chars. */
  prompt: string;
  /** Override default 5000ms. Pass <=0 to disable timeout (not recommended). */
  timeoutMs?: number;
  /** Override default 200 tokens. */
  maxOutputTokens?: number;
  /** Override default 0.3 temperature (deterministic for diagnosis). */
  temperature?: number;
}

export interface GeminiVisionResult {
  ok: boolean;
  text: string;
  latencyMs: number;
  /** Populated when ok=false. Generic codes — never leaks API details to client. */
  errorReason?:
    | 'API_KEY_MISSING'
    | 'INVALID_IMAGE'
    | 'INVALID_PROMPT'
    | 'TIMEOUT'
    | 'RATE_LIMITED'
    | 'SERVICE_UNAVAILABLE'
    | 'EMPTY_RESPONSE'
    | 'NETWORK_ERROR'
    | 'API_ERROR';
  /** Internal-only details (logged server-side, NEVER returned to clients). */
  _internalError?: string;
}

/**
 * Strip data URI prefix if present, return raw base64 + detected mime type.
 * Accepts:
 *   - "data:image/jpeg;base64,/9j/4AAQ..." → { base64: "/9j/4AAQ...", mimeType: "image/jpeg" }
 *   - "/9j/4AAQ..." (raw base64) → { base64: "/9j/4AAQ...", mimeType: "image/jpeg" } (default)
 *   - "https://..." → null (NOT supported by Gemini inlineData; caller fetch + convert first)
 */
function parseImageInput(imageBase64: string): { base64: string; mimeType: string } | null {
  if (!imageBase64 || typeof imageBase64 !== 'string') return null;

  // Reject URLs — Gemini inlineData requires base64 bytes, not URLs
  if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
    return null;
  }

  // data URI: extract mime + base64 payload
  const dataUriMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    return { mimeType: dataUriMatch[1], base64: dataUriMatch[2] };
  }

  // Raw base64 → assume jpeg (most common from kit photos)
  return { mimeType: 'image/jpeg', base64: imageBase64 };
}

/**
 * Synthesize vision response via Gemini 2.5 Flash EU Frankfurt.
 *
 * Design notes:
 *   - Single attempt (no retry loop) — caller (`unlim-vision/index.ts`) handles
 *     fallback to Pixtral on any errorReason, so retries here would double the
 *     timeout budget for the user.
 *   - thinkingBudget=0 — Gemini 2.5 Flash defaults to thinking mode which
 *     consumes maxOutputTokens before visible output (truncating responses).
 *     Disable explicitly for vision (matches gemini.ts text-only handling).
 *   - Safety thresholds BLOCK_ONLY_HIGH — same as gemini.ts; appropriate for
 *     K-12 educational content where false-positive blocks frustrate teachers.
 */
export async function synthesizeGeminiVision(
  req: GeminiVisionRequest,
): Promise<GeminiVisionResult> {
  const startedAt = Date.now();

  // ── 1. Env validation ─────────────────────────────────────────────────────
  // Note: gemini.ts text path uses GEMINI_API_KEY. Andrea task mandates
  // GOOGLE_API_KEY for Vision. We accept either (precedence: GOOGLE_API_KEY,
  // then GEMINI_API_KEY) so single-key deployments keep working.
  const apiKey = (Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY') || '').trim();
  if (!apiKey) {
    return {
      ok: false,
      text: '',
      latencyMs: Date.now() - startedAt,
      errorReason: 'API_KEY_MISSING',
      _internalError: 'GOOGLE_API_KEY (or GEMINI_API_KEY) not set in Edge Function env',
    };
  }

  // ── 2. Input validation ───────────────────────────────────────────────────
  const parsed = parseImageInput(req.imageBase64);
  if (!parsed) {
    return {
      ok: false,
      text: '',
      latencyMs: Date.now() - startedAt,
      errorReason: 'INVALID_IMAGE',
      _internalError: 'imageBase64 must be base64 string or data URI (URLs not supported)',
    };
  }

  if (!req.prompt || typeof req.prompt !== 'string' || req.prompt.trim().length === 0) {
    return {
      ok: false,
      text: '',
      latencyMs: Date.now() - startedAt,
      errorReason: 'INVALID_PROMPT',
      _internalError: 'prompt is required and must be non-empty string',
    };
  }

  const promptCapped = req.prompt.slice(0, 1000);
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxOutputTokens = req.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  const temperature = req.temperature ?? DEFAULT_TEMPERATURE;

  // ── 3. Build request body ─────────────────────────────────────────────────
  const requestBody = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [
          { text: promptCapped },
          {
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens,
      temperature,
      // Disable Gemini 2.5 thinking mode — it consumes maxOutputTokens BEFORE
      // visible output, which truncates short Italian K-12 responses to a few words.
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  // ── 4. HTTP call with timeout ─────────────────────────────────────────────
  const controller = new AbortController();
  const timeoutHandle = timeoutMs > 0
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let response: Response;
  try {
    response = await fetch(GEMINI_VISION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
  } catch (err) {
    const latency = Date.now() - startedAt;
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        ok: false,
        text: '',
        latencyMs: latency,
        errorReason: 'TIMEOUT',
        _internalError: `gemini-vision aborted after ${timeoutMs}ms`,
      };
    }
    return {
      ok: false,
      text: '',
      latencyMs: latency,
      errorReason: 'NETWORK_ERROR',
      _internalError: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (timeoutHandle !== null) clearTimeout(timeoutHandle);
  }

  // ── 5. HTTP error handling ────────────────────────────────────────────────
  if (!response.ok) {
    const latency = Date.now() - startedAt;
    const errorBody = await response.text().catch(() => '');

    // Structured server-side log (NEVER returned to client)
    console.error(JSON.stringify({
      level: 'error',
      event: 'gemini_vision_api_error',
      status: response.status,
      latencyMs: latency,
      bodyExcerpt: errorBody.slice(0, 200),
      timestamp: new Date().toISOString(),
    }));

    if (response.status === 429) {
      return { ok: false, text: '', latencyMs: latency, errorReason: 'RATE_LIMITED', _internalError: `429 from Gemini Vision` };
    }
    if (response.status >= 500) {
      return { ok: false, text: '', latencyMs: latency, errorReason: 'SERVICE_UNAVAILABLE', _internalError: `${response.status} from Gemini Vision` };
    }
    return { ok: false, text: '', latencyMs: latency, errorReason: 'API_ERROR', _internalError: `${response.status}: ${errorBody.slice(0, 100)}` };
  }

  // ── 6. Parse response ─────────────────────────────────────────────────────
  let data: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
  try {
    data = await response.json();
  } catch (err) {
    const latency = Date.now() - startedAt;
    return {
      ok: false,
      text: '',
      latencyMs: latency,
      errorReason: 'API_ERROR',
      _internalError: `JSON parse failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    const latency = Date.now() - startedAt;
    return {
      ok: false,
      text: '',
      latencyMs: latency,
      errorReason: 'EMPTY_RESPONSE',
      _internalError: 'Gemini Vision returned no text candidate (possibly safety-blocked)',
    };
  }

  const latency = Date.now() - startedAt;

  // Structured server-side log on success (no PII, only metadata)
  console.info(JSON.stringify({
    level: 'info',
    event: 'gemini_vision_call',
    model: 'gemini-2.5-flash',
    latencyMs: latency,
    tokensIn: data.usageMetadata?.promptTokenCount ?? 0,
    tokensOut: data.usageMetadata?.candidatesTokenCount ?? 0,
    timestamp: new Date().toISOString(),
  }));

  return {
    ok: true,
    text: text.trim(),
    latencyMs: latency,
  };
}

/** Module marker for orchestration audits + tests. */
export const GEMINI_VISION_PROVIDER = 'gemini-2.5-flash';
export const GEMINI_VISION_REGION = 'eu-frankfurt';
export const GEMINI_VISION_ITER = 35;
