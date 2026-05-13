/**
 * Vertex AI Frankfurt (EU) Client — Sprint U iter 39 Phase 0
 *
 * GDPR P0 prereq: GOOGLE AI Studio is NOT EU-resident.
 * Vertex AI region `europe-west3` (Frankfurt) is GA EU-resident with
 * Google Cloud Italia Srl DPA addendum.
 *
 * Wire activation:
 *   - Set Supabase secret ENABLE_VERTEX_EU=true (gates routing in llm-client.ts)
 *   - Set GCP_VERTEX_SA_JSON_B64=<base64 of SA JSON> (Service Account key)
 *   - Set GCP_VERTEX_PROJECT_ID=<project>
 *   - Set GCP_VERTEX_LOCATION=europe-west3 (or other EU region)
 *
 * Pure Gemini strategy (post iter 39 Andrea ratify): 100% chat traffic
 * Vertex Frankfurt. Mistral retained TTS Voxtral + Vision Pixtral + STT +
 * OCR + fallback chain (unchanged in llm-client.ts).
 *
 * Auth flow: OAuth 2.0 JWT-bearer
 *   1. Cold start: parse SA JSON from GCP_VERTEX_SA_JSON_B64 (cached)
 *   2. Mint JWT (RS256, scope cloud-platform, 1h validity)
 *   3. Exchange at https://oauth2.googleapis.com/token for access_token
 *   4. Cache access_token (refresh 5 min before 1h TTL expiry)
 *   5. Use Bearer token in generateContent calls
 *
 * Reference: https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini
 * (c) Andrea Marro — 2026-05-12 — ELAB Tutor Sprint U iter 39 Phase 0
 */

import type { GeminiModel, ImageData } from './types.ts';

// ── Type contracts (mirror gemini.ts) ──

interface VertexOptions {
  model: GeminiModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];
  maxOutputTokens?: number;
  temperature?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
}

interface VertexResult {
  text: string;
  model: string;
  tokensUsed: { input: number; output: number };
  latencyMs: number;
}

export enum VertexErrorCode {
  SERVICE_RATE_LIMITED = 'SERVICE_RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  API_ERROR = 'API_ERROR',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  TIMEOUT = 'TIMEOUT',
  AUTH_ERROR = 'AUTH_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
}

export class VertexError extends Error {
  code: VertexErrorCode;
  constructor(code: VertexErrorCode, internalMessage: string) {
    super(internalMessage);
    this.code = code;
    this.name = 'VertexError';
  }
}

// ── SA JSON contract (subset Google standard) ──

interface ServiceAccount {
  client_email: string;
  private_key: string;
  private_key_id?: string;
  project_id?: string;
}

// ── Module state (cold-start caches) ──

let cachedSA: ServiceAccount | null = null;
let cachedSigningKey: CryptoKey | null = null;
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

// ── Metrics (mirror gemini.ts pattern) ──

const metrics = {
  requests: new Map<string, number>(),
  totalLatency: new Map<string, number>(),
  errors: new Map<string, number>(),
};

function recordMetric(model: string, latencyMs: number, success: boolean): void {
  const reqCount = (metrics.requests.get(model) || 0) + 1;
  metrics.requests.set(model, reqCount);
  if (success) {
    const totalLat = (metrics.totalLatency.get(model) || 0) + latencyMs;
    metrics.totalLatency.set(model, totalLat);
  } else {
    metrics.errors.set(model, (metrics.errors.get(model) || 0) + 1);
  }
}

export function getVertexMetrics(): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [model, count] of metrics.requests) {
    const totalLat = metrics.totalLatency.get(model) || 0;
    const errors = metrics.errors.get(model) || 0;
    result[model] = {
      requests: count,
      errors,
      avgLatencyMs: count > errors ? Math.round(totalLat / (count - errors)) : 0,
    };
  }
  return result;
}

// ── SA parsing + signing key import ──

/**
 * Decode SA from GCP_VERTEX_SA_JSON_B64 env. Cached at cold start.
 * Throws CONFIG_ERROR if missing or malformed.
 */
function getServiceAccount(): ServiceAccount {
  if (cachedSA) return cachedSA;
  const b64 = Deno.env.get('GCP_VERTEX_SA_JSON_B64');
  if (!b64) {
    throw new VertexError(
      VertexErrorCode.CONFIG_ERROR,
      'GCP_VERTEX_SA_JSON_B64 not configured (Phase 0 prereq — Andrea GCP setup pending)'
    );
  }
  let jsonStr: string;
  try {
    jsonStr = atob(b64.trim());
  } catch {
    throw new VertexError(VertexErrorCode.CONFIG_ERROR, 'GCP_VERTEX_SA_JSON_B64 not valid base64');
  }
  let sa: ServiceAccount;
  try {
    sa = JSON.parse(jsonStr) as ServiceAccount;
  } catch {
    throw new VertexError(VertexErrorCode.CONFIG_ERROR, 'GCP_VERTEX_SA_JSON_B64 not valid JSON');
  }
  if (!sa.client_email || !sa.private_key) {
    throw new VertexError(VertexErrorCode.CONFIG_ERROR, 'SA JSON missing client_email or private_key');
  }
  cachedSA = sa;
  return sa;
}

/**
 * Import PEM private_key as CryptoKey for RS256 signing. Cached.
 */
async function getSigningKey(): Promise<CryptoKey> {
  if (cachedSigningKey) return cachedSigningKey;
  const sa = getServiceAccount();
  // Strip PEM markers + base64 decode body
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  cachedSigningKey = await crypto.subtle.importKey(
    'pkcs8',
    binary.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return cachedSigningKey;
}

// ── JWT builder + signer ──

function base64UrlEncode(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    bytes = new Uint8Array(input);
  }
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function buildJwt(sa: ServiceAccount): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT', ...(sa.private_key_id ? { kid: sa.private_key_id } : {}) };
  const claims = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    iat: nowSec,
    exp: nowSec + 3600,
  };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimsB64 = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${headerB64}.${claimsB64}`;
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput)
  );
  const sigB64 = base64UrlEncode(signature);
  return `${signingInput}.${sigB64}`;
}

// ── Access token mint + cache ──

/**
 * Return valid Vertex access_token. Mints fresh + caches if expired.
 * 5 min pre-expiry refresh buffer.
 */
async function getAccessToken(): Promise<string> {
  const nowMs = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt - 5 * 60 * 1000 > nowMs) {
    return cachedAccessToken.token;
  }
  const sa = getServiceAccount();
  const jwt = await buildJwt(sa);
  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwt)}`,
  });
  if (!tokenResp.ok) {
    const errBody = await tokenResp.text().catch(() => '');
    throw new VertexError(
      VertexErrorCode.AUTH_ERROR,
      `OAuth token exchange failed ${tokenResp.status}: ${errBody.slice(0, 200)}`
    );
  }
  const data = await tokenResp.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new VertexError(VertexErrorCode.AUTH_ERROR, 'OAuth response missing access_token');
  }
  const expiresInSec = data.expires_in || 3600;
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: nowMs + expiresInSec * 1000,
  };
  return data.access_token;
}

// ── Endpoint URL builder ──

function buildVertexUrl(model: GeminiModel): string {
  const project = Deno.env.get('GCP_VERTEX_PROJECT_ID');
  const location = (Deno.env.get('GCP_VERTEX_LOCATION') || 'europe-west3').trim();
  if (!project) {
    throw new VertexError(VertexErrorCode.CONFIG_ERROR, 'GCP_VERTEX_PROJECT_ID not configured');
  }
  // Vertex Gemini 2.5 model aliases: drop "-preview" suffix if present (AI Studio
  // uses preview tags; Vertex publishes stable model IDs without it).
  const vertexModel = model.replace(/-preview$/i, '').replace(/-preview-\d+/i, '');
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${vertexModel}:generateContent`;
}

// ── Main callVertexGemini (mirrors callGemini API) ──

/**
 * Call Vertex AI Frankfurt endpoint. Drop-in replacement for callGemini
 * when ENABLE_VERTEX_EU=true and SA configured.
 */
export async function callVertexGemini(options: VertexOptions): Promise<VertexResult> {
  const {
    model,
    systemPrompt,
    message,
    images = [],
    maxOutputTokens = 256,
    temperature = 0.7,
    thinkingLevel,
  } = options;

  const parts: Array<Record<string, unknown>> = [];
  parts.push({ text: message });
  for (const img of images) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens,
    temperature,
  };

  // Iter 45 A1 FIX (Codex gpt-5.5 high reasoning audit 2026-05-13):
  // Per Google Vertex docs (https://cloud.google.com/vertex-ai/generative-ai/docs/thinking):
  // - `thinking_level` parameter is GEMINI 3 ONLY. Earlier models return INVALID_ARGUMENT.
  // - Gemini 2.5 (Pro/Flash/Flash-Lite) MUST use `thinking_budget` integer.
  // - Gemini 2.5 Pro budget range 128-32768 (CANNOT disable, no budget=0).
  // - Flash/Flash-Lite budget range 0-... (0 disables thinking).
  // Previous code sent `{ thinkingLevel: 'medium' }` to Vertex 2.5 Pro → 503 timeout 15s.
  // Iter 43 hotfix routed deep-thinking to Flash instead of Pro (router.ts).
  // Iter 45 A1: map string → integer budget per model, restore Pro accessibility.
  const thinkingLevelToBudget = (level: string | undefined, m: string): number | undefined => {
    if (!level) return m === 'gemini-2.5-pro' ? undefined : 0; // Pro can't disable, Flash 0=off
    // Map string to integer budget (Pro requires 128+ min)
    if (m === 'gemini-2.5-pro') {
      return { minimal: 256, low: 1024, medium: 2048, high: 8192 }[level] ?? 2048;
    }
    return { minimal: 128, low: 512, medium: 1024, high: 4096 }[level] ?? 1024;
  };
  if (model !== 'gemini-2.5-flash-lite') {
    const budget = thinkingLevelToBudget(thinkingLevel, model);
    if (budget !== undefined) {
      generationConfig.thinkingConfig = { thinkingBudget: budget };
    }
    // Pro without thinkingLevel: omit thinkingConfig entirely (Pro auto-thinks default).
  }

  const requestBody = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig,
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const url = buildVertexUrl(model);
  const startTime = Date.now();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const accessToken = await getAccessToken();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const latency = Date.now() - startTime;

        if (response.status === 401 && attempt === 0) {
          // Invalidate token cache, retry with fresh token.
          cachedAccessToken = null;
          continue;
        }
        if (response.status === 429 && attempt === 0) {
          console.warn(JSON.stringify({
            level: 'warn', event: 'vertex_rate_limited',
            model, attempt, latencyMs: latency,
          }));
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const errorBody = await response.text().catch(() => '');
        console.error(JSON.stringify({
          level: 'error', event: 'vertex_api_error',
          model, status: response.status, attempt, latencyMs: latency,
          details: errorBody.slice(0, 200),
        }));

        recordMetric(model, latency, false);

        if (response.status === 429) {
          throw new VertexError(VertexErrorCode.SERVICE_RATE_LIMITED, `Rate limited by Vertex`);
        }
        if (response.status === 401 || response.status === 403) {
          throw new VertexError(VertexErrorCode.AUTH_ERROR, `Vertex auth error ${response.status}`);
        }
        if (response.status >= 500) {
          throw new VertexError(VertexErrorCode.SERVICE_UNAVAILABLE, `Vertex ${response.status}`);
        }
        throw new VertexError(VertexErrorCode.API_ERROR, `Vertex API error ${response.status}`);
      }

      const data = await response.json();
      const candidates = data.candidates;

      if (!candidates?.[0]?.content?.parts?.[0]?.text) {
        const latency = Date.now() - startTime;
        recordMetric(model, latency, false);
        throw new VertexError(VertexErrorCode.EMPTY_RESPONSE, 'Empty response from Vertex');
      }

      const text = candidates[0].content.parts[0].text;
      const usage = data.usageMetadata || {};
      const latency = Date.now() - startTime;

      console.info(JSON.stringify({
        level: 'info', event: 'vertex_call',
        model,
        location: Deno.env.get('GCP_VERTEX_LOCATION') || 'europe-west3',
        tokensIn: usage.promptTokenCount || 0,
        tokensOut: usage.candidatesTokenCount || 0,
        latencyMs: latency,
      }));

      recordMetric(model, latency, true);

      return {
        text,
        model,
        tokensUsed: {
          input: usage.promptTokenCount || 0,
          output: usage.candidatesTokenCount || 0,
        },
        latencyMs: latency,
      };
    } catch (e) {
      if (e instanceof VertexError) throw e;
      const latency = Date.now() - startTime;
      recordMetric(model, latency, false);
      if (e instanceof DOMException && e.name === 'AbortError') {
        throw new VertexError(VertexErrorCode.TIMEOUT, 'Vertex request timeout 15s');
      }
      throw new VertexError(VertexErrorCode.API_ERROR, `Vertex network error: ${String(e).slice(0, 100)}`);
    }
  }

  // Unreachable safety net
  throw new VertexError(VertexErrorCode.API_ERROR, 'Vertex retry loop exhausted');
}

/**
 * Check whether Vertex EU routing is active per env config.
 * Used by llm-client.ts to gate conditional routing.
 */
export function isVertexEUEnabled(): boolean {
  return (Deno.env.get('ENABLE_VERTEX_EU') || 'false').toLowerCase() === 'true';
}

/**
 * Reset module caches (test-only helper).
 */
export function _resetVertexCaches(): void {
  cachedSA = null;
  cachedSigningKey = null;
  cachedAccessToken = null;
  metrics.requests.clear();
  metrics.totalLatency.clear();
  metrics.errors.clear();
}
