/**
 * Nanobot V2 — Security Guards
 * Rate limiting (persistent + fallback), input validation, CORS,
 * prompt injection protection, deep sanitization, security headers.
 * (c) Andrea Marro — 02/04/2026
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS — restricted to ELAB origins ──
const ALLOWED_ORIGINS = [
  'https://elab-builder.vercel.app',
  'https://www.elabtutor.school',
  'https://elabtutor.school',
  'https://elab-tutor.it',
  'https://www.elab-tutor.it',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    // P1 FIX 19/04/2026: aggiunto `apikey` (richiesto da Supabase client),
    // `X-Elab-Api-Key` (custom API key ELAB), `x-client-info` (telemetry).
    // Senza questi header preflight falliva CORS, bloccando unlim-chat in prod
    // → utenti vedevano "UNLIM non ha risposto" modal.
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Elab-Api-Key, x-client-info',
    'Vary': 'Origin',
  };
}

// ── Security Headers (OWASP) ──
export function getSecurityHeaders(req: Request): Record<string, string> {
  return {
    ...getCorsHeaders(req),
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store',
  };
}

// ── ELAB Custom API Key Verification (defense-in-depth) ──
/**
 * Verify the `X-Elab-Api-Key` header against the `ELAB_API_KEY` secret.
 * Complements Supabase's anon-JWT gateway check (which is browser-bundle-visible
 * and therefore scrapeable) with a server-only secret that only legit ELAB
 * builds carry.
 *
 * Fail-open semantics when the secret is not configured: this lets the code
 * ship before the secret is rolled out in all environments. Set the secret
 * with:
 *   npx supabase secrets set ELAB_API_KEY=<value> --project-ref <ref>
 * Once set, requests missing or mismatching the header return 401.
 *
 * @returns { ok: true } when authorized OR when fail-open triggers.
 *          { ok: false, reason } when explicit mismatch.
 */
export function verifyElabApiKey(req: Request): { ok: boolean; reason?: string } {
  const expected = Deno.env.get('ELAB_API_KEY');
  if (!expected) {
    // Fail-open: secret not yet configured. Deployment is still backward-
    // compatible for any Edge Function that hasn't been updated to enforce.
    return { ok: true };
  }
  const provided = req.headers.get('X-Elab-Api-Key') || '';
  if (!provided) {
    return { ok: false, reason: 'missing X-Elab-Api-Key header' };
  }
  // Constant-time-ish equality: length check + per-byte loop. Not as strict as
  // Node's timingSafeEqual but avoids a length-leak in the common case.
  if (provided.length !== expected.length) {
    return { ok: false, reason: 'bad api key' };
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0 ? { ok: true } : { ok: false, reason: 'bad api key' };
}

// ── Supabase Client (lazy, for persistent rate limiting) ──
let _dbClient: SupabaseClient | null = null;
function getDbClient(): SupabaseClient | null {
  if (_dbClient) return _dbClient;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  _dbClient = createClient(url, key);
  return _dbClient;
}

// ── Rate Limiting ──
// Persistent (Supabase DB) with in-memory fallback.
// Max 30 requests per 60s per sessionId.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_MAP_MAX = 10_000; // Max entries in-memory (DoS protection)

// Cleanup in-memory entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

// ── Request Body Size Limit ──
const MAX_BODY_SIZE = 100_000; // 100KB max request body (default chat/text)
const MAX_BODY_SIZE_MULTIMODAL = 12_000_000; // 12MB for vision/STT (image base64 OR audio file)

/**
 * Check request body size before parsing JSON.
 * Returns null if OK, or an error Response if too large.
 * iter 25: maxBytes optional param for multimodal endpoints (vision/STT).
 */
export function checkBodySize(req: Request, maxBytes?: number): Response | null {
  const limit = maxBytes ?? MAX_BODY_SIZE;
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > limit) {
    return new Response(JSON.stringify({ success: false, error: 'Request too large', limit }), {
      status: 413,
      headers: getSecurityHeaders(req),
    });
  }
  return null;
}

export const BODY_SIZE_MULTIMODAL = MAX_BODY_SIZE_MULTIMODAL;

// ── SessionId Validation ──
const SESSION_ID_MAX_LENGTH = 128;
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_\-.:]{1,128}$/;

export function validateSessionId(sessionId: string | undefined): boolean {
  if (!sessionId || !sessionId.trim()) return false;
  if (sessionId.length > SESSION_ID_MAX_LENGTH) return false;
  return SESSION_ID_PATTERN.test(sessionId);
}

/**
 * Check rate limit — tries persistent DB first, falls back to in-memory.
 */
export async function checkRateLimitPersistent(sessionId: string): Promise<boolean> {
  if (!sessionId) return true;

  // Try DB client first (Supabase auto-injects SUPABASE_URL + SERVICE_ROLE_KEY)
  const db = getDbClient();
  if (db) {
    try {
      const { data, error } = await db.rpc('check_rate_limit', {
        p_session_id: sessionId,
        p_max_requests: RATE_LIMIT_MAX,
        p_window_ms: RATE_LIMIT_WINDOW,
      });

      if (!error && typeof data === 'boolean') {
        return data;
      }

      // Log failure for debugging
      if (error) {
        console.warn(JSON.stringify({ level: 'warn', event: 'rate_limit_rpc_error', error: error.message }));
      }
    } catch (err) {
      console.warn(JSON.stringify({ level: 'warn', event: 'rate_limit_exception', error: String(err) }));
    }
  }

  // Fallback: direct REST API call
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (url && key) {
    try {
      const resp = await fetch(`${url}/rest/v1/rpc/check_rate_limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          p_session_id: sessionId,
          p_max_requests: RATE_LIMIT_MAX,
          p_window_ms: RATE_LIMIT_WINDOW,
        }),
      });
      if (resp.ok) {
        const result = await resp.json();
        if (typeof result === 'boolean') return result;
      }
    } catch { /* silent */ }
  }

  // In-memory fallback
  return checkRateLimitInMemory(sessionId);
}

/**
 * In-memory rate limit (original logic, used as fallback).
 */
export function checkRateLimitInMemory(sessionId: string): boolean {
  if (!sessionId) return true;

  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now > entry.resetAt) {
    // LRU eviction: if map is at capacity, reject new sessions
    if (!entry && rateLimitMap.size >= RATE_LIMIT_MAP_MAX) {
      // Evict oldest expired entries first
      for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) rateLimitMap.delete(key);
        if (rateLimitMap.size < RATE_LIMIT_MAP_MAX) break;
      }
      // If still at capacity after cleanup, reject
      if (rateLimitMap.size >= RATE_LIMIT_MAP_MAX) return false;
    }
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}



// ── Input Validation ──

// Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea live test root cause: frontend
// wraps user message in REGOLA + GERARCHIA CONTESTO + full circuit JSON state
// (>5000 chars typical). Old 2000 cap rejected ALL real frontend chats with HTTP
// 400 "Message too long" → surfaced as fake timeout "ci sta mettendo un po'".
// Raised to 16000 (well below Gemini 1M + Mistral 128K context windows).
const MAX_MESSAGE_LENGTH = 16000;
const MAX_IMAGE_SIZE = 5_000_000; // 5MB base64
const MAX_IMAGES = 3;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateChatInput(
  message?: string,
  sessionId?: string,
  images?: Array<{ base64?: string }>,
): ValidationResult {
  if (!message || !message.trim()) {
    return { valid: false, error: 'Empty message' };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` };
  }

  if (!sessionId || !sessionId.trim()) {
    return { valid: false, error: 'Missing sessionId' };
  }

  if (images && images.length > MAX_IMAGES) {
    return { valid: false, error: `Too many images (max ${MAX_IMAGES})` };
  }

  if (images) {
    for (const img of images) {
      if (img.base64 && img.base64.length > MAX_IMAGE_SIZE) {
        return { valid: false, error: 'Image too large (max 5MB)' };
      }
    }
  }

  return { valid: true };
}

// ── Prompt Injection Guard (hardened) ──
// Unicode NFKD normalization + multi-language patterns

/**
 * Normalize unicode to NFKD form to prevent homoglyph bypass.
 * E.g., "ⅰgnore" → "ignore"
 */
function normalizeUnicode(text: string): string {
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Strip combining marks
    .replace(/[\u200b-\u200f\u2028-\u202f\ufeff]/g, ''); // Strip zero-width chars
}

const INJECTION_PATTERNS = [
  // English
  /ignore.*previous.*instructions/i,
  /ignore.*above.*instructions/i,
  /disregard.*previous/i,
  /you are now/i,
  /new instructions/i,
  /forget.*everything/i,
  /system.*prompt/i,
  /override.*instructions/i,
  /act as.*(?:admin|developer|root|hacker)/i,
  /pretend.*you.*are/i,
  /roleplay.*as/i,
  /jailbreak/i,
  /DAN.*mode/i,
  /do anything now/i,
  /bypass.*(?:filter|safety|guard)/i,
  // Italian
  /ignora.*istruzioni.*precedenti/i,
  /dimentica.*tutto/i,
  /nuove.*istruzioni/i,
  /fai finta.*di.*essere/i,
  /comportati.*come/i,
  // Spanish
  /ignora.*instrucciones.*anteriores/i,
  /olvida.*todo/i,
  // French
  /ignore.*instructions.*pr[eé]c[eé]dentes/i,
  /oublie.*tout/i,
  // Encoding tricks
  /\[SYSTEM\]/i,
  /\[ADMIN\]/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|im_start\|>/i,
  /<\|system\|>/i,
];

export function sanitizeMessage(message: string): { safe: boolean; cleaned: string } {
  // Normalize unicode before checking
  const normalized = normalizeUnicode(message);

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        safe: false,
        cleaned: 'Sono specializzato in elettronica! Chiedimi dei circuiti.',
      };
    }
  }

  // Remove injection markers
  const cleaned = normalized
    .replace(/\[SYSTEM\]/gi, '')
    .replace(/\[ADMIN\]/gi, '')
    .replace(/\[INST\]/gi, '')
    .replace(/\[\/INST\]/gi, '')
    .replace(/<\|[^|]+\|>/g, '')
    .replace(/<<.*?>>/g, '')
    .trim();

  return { safe: true, cleaned: cleaned || message };
}

// ── Deep CircuitState Sanitization ──
// Recursive with max depth and size limits.

const MAX_DEPTH = 10;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_SIZE = 50;

/**
 * Deep sanitize any value — recursive with depth limit.
 * Strips injection patterns, limits string/array sizes.
 */
function deepSanitize(value: unknown, depth: number = 0): unknown {
  if (depth > MAX_DEPTH) return null;

  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    const normalized = normalizeUnicode(value);
    return normalized
      .replace(/ignore.*previous.*instructions/gi, '[filtered]')
      .replace(/you are now/gi, '[filtered]')
      .replace(/system.*prompt/gi, '[filtered]')
      .replace(/\[SYSTEM\]/gi, '')
      .replace(/\[ADMIN\]/gi, '')
      .replace(/\[INST\]/gi, '')
      .replace(/<\|[^|]+\|>/g, '')
      .slice(0, MAX_STRING_LENGTH);
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_SIZE).map(item => deepSanitize(item, depth + 1));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>);
    for (const key of keys.slice(0, MAX_ARRAY_SIZE)) {
      const sanitizedKey = key.slice(0, 100);
      result[sanitizedKey] = deepSanitize((value as Record<string, unknown>)[key], depth + 1);
    }
    return result;
  }

  return null; // Unknown types stripped
}

export function sanitizeCircuitState(circuitState: unknown): unknown {
  return deepSanitize(circuitState, 0);
}

// ── Experiment ID Validation ──

export function validateExperimentId(id: string | null | undefined): string | null {
  if (!id) return null;
  if (/^v[1-3]-cap\d{1,2}-esp\d{1,2}$/.test(id)) return id;
  if (/^[a-z0-9-]{3,50}$/.test(id)) return id;
  return null;
}

// ── MIME Type Validation ──

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateMimeType(mimeType: string): string {
  return ALLOWED_MIME_TYPES.includes(mimeType) ? mimeType : 'image/png';
}

// ── Difficulty Validation ──

const VALID_DIFFICULTIES = ['base', 'intermedio', 'avanzato'];

export function validateDifficulty(difficulty: string | undefined): string {
  return VALID_DIFFICULTIES.includes(difficulty || '') ? difficulty! : 'base';
}

// ── GDPR Field Validators ──

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_CONSENT_METHODS = ['in_app', 'email', 'paper', 'verbal'];

export function validateUUID(value: string | undefined): boolean {
  return !!value && UUID_REGEX.test(value);
}

export function validateEmail(value: string | undefined): boolean {
  return !!value && EMAIL_REGEX.test(value) && value.length <= 254;
}

export function validateConsentMethod(method: string | undefined): string {
  return VALID_CONSENT_METHODS.includes(method || '') ? method! : 'in_app';
}

// ── TTS Field Validators ──

const VALID_TTS_VOICES = ['unlim-tutor', 'default'];
const VALID_TTS_LANGUAGES = ['it', 'en'];

export function validateTTSVoice(voice: string | undefined): string {
  return VALID_TTS_VOICES.includes(voice || '') ? voice! : 'unlim-tutor';
}

export function validateTTSLanguage(language: string | undefined): string {
  return VALID_TTS_LANGUAGES.includes(language || '') ? language! : 'it';
}

export function validateTTSSpeed(speed: number | undefined): number {
  if (typeof speed !== 'number' || isNaN(speed)) return 0.95;
  return Math.max(0.5, Math.min(2.0, speed)); // Clamp 0.5-2.0
}
