/**
 * Vertex AI Claude (Anthropic Messages API) — Deno-native client.
 *
 * Sprint U iter 47 — Opzione B: Claude Haiku 4.5 chat_thinking path via Vertex
 * AI EU multi-region endpoint (GDPR EU residency + reuse existing GCP service
 * account). Karpathy Simple: no SDK, no AWS Bedrock complexity, just fetch +
 * Bearer token from `getAccessToken` (shared with vertex-client.ts).
 *
 * Endpoint format:
 *   https://aiplatform.eu.rep.googleapis.com/v1/projects/${PROJECT}/locations/eu/publishers/anthropic/models/claude-haiku-4-5@20251001:rawPredict
 *
 * Body format (Anthropic Messages API + `anthropic_version`):
 *   {
 *     anthropic_version: "vertex-2023-10-16",
 *     messages: [{role, content}],
 *     system?: string,
 *     max_tokens: number,
 *     temperature?: number,
 *   }
 *
 * Pricing 2026 (per 1M tok, +10% regional/multi-region premium):
 *   Claude Haiku 4.5: $1.10 input / $5.50 output
 *   (vs Gemini Flash-Lite $0.10/$0.40 = 11x/14x — trivial volumi ELAB).
 *
 * (c) Andrea Marro 2026-05-13 — ELAB Tutor
 */

import { getAccessToken, VertexError, VertexErrorCode } from './vertex-client.ts';

// ── Types ──

export interface ClaudeVertexOptions {
  systemPrompt: string;
  message: string;
  maxTokens?: number;
  temperature?: number;
  // Model alias (default 'claude-haiku-4-5@20251001').
  model?: string;
}

export interface ClaudeVertexResult {
  text: string;
  model: string;
  tokensUsed: { input: number; output: number };
  latencyMs: number;
}

// ── Endpoint URL builder ──

/**
 * Build Vertex AI Claude endpoint URL. Defaults to EU multi-region `eu`
 * (GDPR EU residency + +10% premium vs global). Override via env
 * `GCP_VERTEX_CLAUDE_LOCATION` (e.g. 'europe-west1' for Belgium regional).
 */
function buildClaudeVertexUrl(modelId: string): string {
  const project = Deno.env.get('GCP_VERTEX_PROJECT_ID');
  const location = (Deno.env.get('GCP_VERTEX_CLAUDE_LOCATION') || 'eu').trim();
  if (!project) {
    throw new VertexError(VertexErrorCode.CONFIG_ERROR, 'GCP_VERTEX_PROJECT_ID not configured');
  }
  // Multi-region endpoint uses aiplatform.eu.rep.googleapis.com (not <region>-aiplatform).
  // Regional endpoint uses europe-west1-aiplatform.googleapis.com.
  const host = location === 'eu' || location === 'us'
    ? `aiplatform.${location}.rep.googleapis.com`
    : `${location}-aiplatform.googleapis.com`;
  return `https://${host}/v1/projects/${project}/locations/${location}/publishers/anthropic/models/${modelId}:rawPredict`;
}

// ── Main callVertexClaude ──

/**
 * Call Vertex AI Claude Haiku 4.5 (or other Claude model) via Anthropic
 * Messages API surface. Returns text + tokens + latency.
 *
 * Auth: reuses `getAccessToken` from vertex-client.ts (same SA used for
 * Gemini Vertex EU short-circuit).
 *
 * Errors: throws VertexError (compatible with llm-client.ts fallback chain).
 */
export async function callVertexClaude(options: ClaudeVertexOptions): Promise<ClaudeVertexResult> {
  const {
    systemPrompt,
    message,
    maxTokens = 240,
    temperature = 0.7,
    model = 'claude-haiku-4-5@20251001',
  } = options;

  const accessToken = await getAccessToken();
  const url = buildClaudeVertexUrl(model);

  const body = {
    anthropic_version: 'vertex-2023-10-16',
    messages: [
      { role: 'user', content: message },
    ],
    ...(systemPrompt ? { system: systemPrompt } : {}),
    max_tokens: maxTokens,
    temperature,
  };

  const startMs = Date.now();
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new VertexError(
      VertexErrorCode.API_ERROR,
      `Vertex Claude fetch failed: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  const latencyMs = Date.now() - startMs;

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '');
    throw new VertexError(
      resp.status === 401 || resp.status === 403 ? VertexErrorCode.AUTH_ERROR : VertexErrorCode.API_ERROR,
      `Vertex Claude ${resp.status}: ${errBody.slice(0, 300)}`
    );
  }

  // Anthropic Messages API response shape:
  //   { id, type:'message', role:'assistant', content:[{type:'text', text:'...'}],
  //     model, stop_reason, usage:{input_tokens, output_tokens} }
  const data = await resp.json() as {
    content?: Array<{ type: string; text?: string }>;
    model?: string;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  const text = (data.content || [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');

  // Iter 49 Codex audit medium fix: malformed 200 response (empty content[] or
  // no text blocks) must throw API_ERROR so llm-client.ts fall-through path
  // activates Vertex Gemini fallback. Returning successful empty text would
  // silently degrade UX with a blank chat bubble downstream.
  if (!text || text.trim().length === 0) {
    throw new VertexError(
      VertexErrorCode.API_ERROR,
      `Vertex Claude 200 OK with empty content[] (malformed response, model=${model})`
    );
  }

  return {
    text,
    model: data.model || model,
    tokensUsed: {
      input: data.usage?.input_tokens ?? 0,
      output: data.usage?.output_tokens ?? 0,
    },
    latencyMs,
  };
}

/**
 * Feature gate — return true when ENABLE_VERTEX_CLAUDE_THINKING=true env set.
 * Used by router/llm-client to route THINKING_KEYWORDS to Claude only when
 * explicitly enabled (canary rollout pattern).
 */
export function isVertexClaudeEnabled(): boolean {
  return (Deno.env.get('ENABLE_VERTEX_CLAUDE_THINKING') || 'false').trim().toLowerCase() === 'true';
}
