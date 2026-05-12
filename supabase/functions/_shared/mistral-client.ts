/**
 * Mistral AI client — Sprint T iter 24
 *
 * Provider: Mistral AI (FR, EU GDPR-friendly).
 * Models supported:
 *   - chat:    `mistral-small-latest` (primary) + `mistral-large-latest` (premium)
 *   - vision:  `pixtral-12b-2409` (Pixtral 12B)
 *   - embed:   `mistral-embed` (1024-dim)
 *
 * API base: https://api.mistral.ai/v1
 * Endpoints:
 *   POST /chat/completions  — chat + vision (OpenAI-compatible)
 *   POST /embeddings        — embeddings
 *
 * Auth: `Bearer ${MISTRAL_API_KEY}` (env).
 *
 * Iter 24 scope: implement `callMistralChat` (text+vision) + `callMistralEmbed`.
 * Wired into `llm-client.ts` callLLMWithFallback chain (defer iter 25 routing
 * decisions: chat 70% Small / 25% Large / 5% Together fallback).
 *
 * (c) Andrea Marro 2026-04-29 — ELAB Tutor
 */

import { GeminiError, ErrorCode } from './gemini.ts';
import type { GeminiModel, ImageData } from './types.ts';

const MISTRAL_BASE = 'https://api.mistral.ai/v1';
const TIMEOUT_MS = 15000;

// ════════════════════════════════════════════════════════════════════
// Sprint U iter 25 P0-B — Inner retry for HTTP 5xx/429 burst rate-limit
// ════════════════════════════════════════════════════════════════════
//
// Iter 24 dim-1 LIVE prod bench: HTTP 503 rate 11.4% (8/70 query) on Mistral
// burst rate-limit. Adding 2× retry [400ms, 1000ms] + jitter at the client
// layer recovers the majority of transient 5xx without falling through to
// next provider (which doubles latency).
//
// llm-client.ts ALSO wraps callMistralChat in its outer callWithRetry — that
// gives 3 attempts total (1 outer + 2 inner) but the inner layer is cheaper
// because it does not re-load credentials nor re-build the body.

const MISTRAL_RETRY_DELAYS_MS = [400, 1000] as const;
const MISTRAL_NETWORK_RETRY = 1;

function isMistralRetriableStatus(status: number): boolean {
  // 429 + any 5xx → retry. 4xx (400/401/403/422) → fail-fast.
  return status === 429 || (status >= 500 && status <= 599);
}

function computeMistralJitter(baseMs: number): number {
  // ±20% jitter, deterministic non-negative.
  const offset = (Math.random() * 2 - 1) * baseMs * 0.2;
  return Math.max(0, Math.floor(baseMs + offset));
}

function mistralSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type MistralChatModel =
  | 'mistral-small-latest'
  | 'mistral-small-2506'        // iter 26 vision migration replacement (Mistral Small 3.2, vision-capable, EU FR)
  | 'mistral-large-latest'
  | 'pixtral-12b-2409'          // iter 26 LEGACY fallback (deprecated 2 Dec 2025 MA endpoint still alive)
  | 'pixtral-large-latest';

/**
 * Mistral La Plateforme `response_format` parameter — JSON schema mode.
 *
 * When set, Mistral returns a JSON object that conforms to the supplied
 * schema. Used by Sprint T iter 38 Atom A7 to replace the legacy
 * `[INTENT:{...}]` regex parsing with structured outputs (eliminates
 * Tester-6 R7 v53 4-way schema drift: canonical 12.5%, 17/200 params_fail).
 *
 * Reference: https://docs.mistral.ai/capabilities/structured-output/json_schema/
 *
 * Type: 'json_schema' wraps a strict subset (Mistral validates server-side).
 */
export type MistralResponseFormat =
  | { type: 'json_schema'; json_schema: { name?: string; strict?: boolean; schema: Record<string, unknown> } }
  | { type: 'json_object' };

export interface MistralChatOptions {
  model?: MistralChatModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];          // Pixtral when present
  maxOutputTokens?: number;
  temperature?: number;
  /** Iter 38 A7: optional JSON schema constraint on the model output. */
  responseFormat?: MistralResponseFormat;
}

export interface MistralChatResult {
  text: string;
  model: string;
  provider: 'mistral';
  tokensUsed: { input: number; output: number };
  latencyMs: number;
}

/**
 * Pick default model:
 *   - images present → mistral-small-2506 (iter 26 vision migration, env override MISTRAL_VISION_MODEL)
 *   - else           → mistral-small-latest (cheap primary)
 * Caller can override via options.model.
 *
 * iter 26 P1 migration: pixtral-12b-2409 deprecated 2 Dec 2025 (endpoint still alive prod 2026-05-11
 * MA Mistral può retire silently). Replacement mistral-small-2506 (Mistral Small 3.2):
 * - Vision-capable, same EU FR data residency, cost parity ~€0.0011/img
 * - Unified text+vision model (simpler client)
 * - Rollback via env var: `supabase secrets set MISTRAL_VISION_MODEL=pixtral-12b-2409` no redeploy.
 */
function pickDefaultModel(opts: MistralChatOptions): MistralChatModel {
  if (opts.model) return opts.model;
  if (opts.images && opts.images.length > 0) {
    const envOverride = (Deno.env.get('MISTRAL_VISION_MODEL') || '').trim();
    if (envOverride === 'pixtral-12b-2409' || envOverride === 'pixtral-large-latest' || envOverride === 'mistral-small-2506' || envOverride === 'mistral-small-latest') {
      return envOverride as MistralChatModel;
    }
    return 'mistral-small-2506';
  }
  return 'mistral-small-latest';
}

/** Build OpenAI-compatible content array for vision (text + image_url). */
function buildVisionContent(text: string, images: ImageData[]): unknown[] {
  const out: unknown[] = [{ type: 'text', text }];
  for (const img of images) {
    // ImageData expects either dataUrl or base64+mime
    // deno-lint-ignore no-explicit-any
    const anyImg = img as any;
    const dataUrl = anyImg.dataUrl
      || (anyImg.base64 ? `data:${anyImg.mimeType || 'image/png'};base64,${anyImg.base64}` : null);
    if (dataUrl) out.push({ type: 'image_url', image_url: dataUrl });
  }
  return out;
}

/**
 * Call Mistral chat completions (text + optional vision via Pixtral).
 */
export async function callMistralChat(opts: MistralChatOptions): Promise<MistralChatResult> {
  const apiKey = (Deno.env.get('MISTRAL_API_KEY') || '').trim();
  if (!apiKey) {
    throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'MISTRAL_API_KEY not configured');
  }
  const model = pickDefaultModel(opts);
  const hasImages = (opts.images?.length ?? 0) > 0;

  const userContent = hasImages
    ? buildVisionContent(opts.message, opts.images!)
    : opts.message;

  // Build base body. response_format is optional and only emitted when the
  // caller explicitly opts in (iter 38 A7). When present, Mistral La Plateforme
  // returns a JSON object that matches the supplied schema; we still consume
  // it as `content` (string) and let the caller JSON.parse — this keeps the
  // contract identical to the regex-based legacy path for downstream code.
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: opts.maxOutputTokens ?? 200,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.responseFormat) {
    body.response_format = opts.responseFormat;
  }

  const start = Date.now();

  // Sprint U iter 25 P0-B: HTTP 5xx/429 burst rate-limit inner retry loop
  // [400ms, 1000ms] + jitter ±20%. Network errors (TypeError) retry 1x.
  // 4xx (auth/validation) → fail-fast. Preserves TIMEOUT_MS=15000 per attempt.
  let networkRetryUsed = 0;
  let lastError: unknown = null;
  const maxStatusRetries = MISTRAL_RETRY_DELAYS_MS.length;
  const maxAttempts = 1 + maxStatusRetries; // 1 initial + 2 retries = 3 total

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${MISTRAL_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const code = res.status === 429
          ? ErrorCode.SERVICE_RATE_LIMITED
          : res.status >= 500
            ? ErrorCode.SERVICE_UNAVAILABLE
            : ErrorCode.API_ERROR;
        const err = new GeminiError(code, `Mistral ${res.status}: ${text.slice(0, 200)}`);

        // Retriable status (5xx / 429) AND we still have retries → backoff + retry.
        if (isMistralRetriableStatus(res.status) && attempt < maxAttempts - 1) {
          const baseDelay = MISTRAL_RETRY_DELAYS_MS[attempt] ?? 1000;
          const delayMs = computeMistralJitter(baseDelay);
          console.info(JSON.stringify({
            level: 'info',
            event: 'mistral_retry_scheduled',
            attempt,
            status: res.status,
            delayMs,
            model,
          }));
          await mistralSleep(delayMs);
          lastError = err;
          continue;
        }

        // 4xx fail-fast OR retries exhausted.
        console.warn(JSON.stringify({
          level: 'warn',
          event: isMistralRetriableStatus(res.status) ? 'mistral_retry_exhausted' : 'mistral_fail_fast_4xx',
          attempt,
          status: res.status,
          model,
        }));
        throw err;
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? '';
      if (!content) throw new GeminiError(ErrorCode.EMPTY_RESPONSE, 'Mistral empty response');

      if (attempt > 0) {
        console.info(JSON.stringify({
          level: 'info',
          event: 'mistral_retry_success',
          attempt,
          model,
          totalElapsedMs: Date.now() - start,
        }));
      }

      return {
        text: content,
        model,
        provider: 'mistral',
        tokensUsed: {
          input: data?.usage?.prompt_tokens ?? 0,
          output: data?.usage?.completion_tokens ?? 0,
        },
        latencyMs: Date.now() - start,
      };
    } catch (e) {
      clearTimeout(timeout);
      if (e instanceof GeminiError) throw e;
      if (e instanceof DOMException && e.name === 'AbortError') {
        // Treat timeout as retriable network event if we have budget left.
        if (networkRetryUsed < MISTRAL_NETWORK_RETRY && attempt < maxAttempts - 1) {
          networkRetryUsed++;
          const delayMs = computeMistralJitter(MISTRAL_RETRY_DELAYS_MS[0]);
          console.info(JSON.stringify({
            level: 'info',
            event: 'mistral_network_timeout_retry',
            attempt,
            delayMs,
          }));
          await mistralSleep(delayMs);
          lastError = e;
          continue;
        }
        throw new GeminiError(ErrorCode.TIMEOUT, 'Mistral request timed out');
      }
      // Native fetch TypeError → retriable network error.
      if (e instanceof TypeError && networkRetryUsed < MISTRAL_NETWORK_RETRY && attempt < maxAttempts - 1) {
        networkRetryUsed++;
        const delayMs = computeMistralJitter(MISTRAL_RETRY_DELAYS_MS[0]);
        console.info(JSON.stringify({
          level: 'info',
          event: 'mistral_network_error_retry',
          attempt,
          delayMs,
          errorMessage: e.message,
        }));
        await mistralSleep(delayMs);
        lastError = e;
        continue;
      }
      throw new GeminiError(ErrorCode.API_ERROR, `Mistral failed: ${e}`);
    }
  }

  // Unreachable — loop returns or throws. Defensive fallback.
  if (lastError instanceof GeminiError) throw lastError;
  throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'Mistral: all retries exhausted');
}

/**
 * Embeddings via `mistral-embed` (1024-dim, EU).
 */
export async function callMistralEmbed(texts: string[]): Promise<number[][]> {
  const apiKey = (Deno.env.get('MISTRAL_API_KEY') || '').trim();
  if (!apiKey) {
    throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'MISTRAL_API_KEY not configured');
  }
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${MISTRAL_BASE}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: 'mistral-embed', input: texts }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new GeminiError(ErrorCode.API_ERROR, `Mistral embed ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const items: Array<{ embedding: number[] }> = data?.data ?? [];
    return items.map((it) => it.embedding);
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof GeminiError) throw e;
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new GeminiError(ErrorCode.TIMEOUT, 'Mistral embed timed out');
    }
    throw new GeminiError(ErrorCode.API_ERROR, `Mistral embed failed: ${e}`);
  }
}

/** Tier mapper compatible with llm-client `callLLM` signature. */
export function mistralModelFromTier(_tier: GeminiModel, premium = false): MistralChatModel {
  return premium ? 'mistral-large-latest' : 'mistral-small-latest';
}

export const MISTRAL_CLIENT_VERSION = '1.0-iter24';
