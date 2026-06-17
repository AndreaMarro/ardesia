/**
 * Nanobot V2 — Gemini API Client
 * Handles all communication with Google Gemini 3.x models.
 * Supports text, vision, and configurable thinking levels.
 * Error responses use generic codes — never leaks API details.
 * (c) Andrea Marro — 02/04/2026
 */

import type { GeminiModel, ImageData } from './types.ts';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiOptions {
  model: GeminiModel;
  systemPrompt: string;
  message: string;
  images?: ImageData[];
  maxOutputTokens?: number;
  temperature?: number;
  thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
}

interface GeminiResult {
  text: string;
  model: string;
  tokensUsed: { input: number; output: number };
  latencyMs: number;
}

// Generic error codes for client-facing responses
export enum ErrorCode {
  SERVICE_RATE_LIMITED = 'SERVICE_RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  API_ERROR = 'API_ERROR',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  TIMEOUT = 'TIMEOUT',
}

export class GeminiError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, internalMessage: string) {
    super(internalMessage);
    this.code = code;
    this.name = 'GeminiError';
  }
}

// Metrics — per-model request counters and latency tracking
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

/**
 * Get current metrics for monitoring/health endpoint.
 */
export function getMetrics(): Record<string, unknown> {
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

/**
 * Call Gemini API with automatic model routing.
 * @throws GeminiError with generic error code (never leaks API details)
 */
export async function callGemini(options: GeminiOptions): Promise<GeminiResult> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'GEMINI_API_KEY not configured');

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
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64,
      },
    });
  }

  const generationConfig: Record<string, unknown> = {
    maxOutputTokens,
    temperature,
  };

  // Gemini 2.5 flash/pro fanno thinking di default, consumando maxOutputTokens
  // prima dell'output visibile (troncamento a poche parole). Disabilita esplicitamente
  // se il caller non lo richiede; flash-lite non supporta thinking, quindi skip.
  if (model !== 'gemini-2.5-flash-lite') {
    generationConfig.thinkingConfig = thinkingLevel
      ? { thinkingLevel }
      : { thinkingBudget: 0 };
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

  const url = `${GEMINI_API_BASE}/models/${model}:generateContent`;
  const startTime = Date.now();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const latency = Date.now() - startTime;

        if (response.status === 429 && attempt === 0) {
          // Structured log for rate limit
          console.warn(JSON.stringify({
            level: 'warn', event: 'gemini_rate_limited',
            model, attempt, latencyMs: latency,
          }));
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        // Log internal error details server-side only
        const errorBody = await response.text().catch(() => '');
        console.error(JSON.stringify({
          level: 'error', event: 'gemini_api_error',
          model, status: response.status, attempt, latencyMs: latency,
          // Internal details logged but NOT returned to client
          details: errorBody.slice(0, 200),
        }));

        recordMetric(model, latency, false);

        if (response.status === 429) {
          throw new GeminiError(ErrorCode.SERVICE_RATE_LIMITED, `Rate limited by Gemini`);
        }
        if (response.status >= 500) {
          throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, `Gemini ${response.status}`);
        }
        throw new GeminiError(ErrorCode.API_ERROR, `Gemini API error ${response.status}`);
      }

      const data = await response.json();
      const candidates = data.candidates;

      if (!candidates?.[0]?.content?.parts?.[0]?.text) {
        const latency = Date.now() - startTime;
        recordMetric(model, latency, false);
        throw new GeminiError(ErrorCode.EMPTY_RESPONSE, 'Empty response from Gemini');
      }

      const text = candidates[0].content.parts[0].text;
      const usage = data.usageMetadata || {};
      const latency = Date.now() - startTime;

      // Structured log for successful call
      console.info(JSON.stringify({
        level: 'info', event: 'gemini_call',
        model,
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
    } catch (err) {
      if (err instanceof GeminiError) throw err;
      if (attempt === 1) {
        const latency = Date.now() - startTime;
        recordMetric(model, latency, false);
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw new GeminiError(ErrorCode.TIMEOUT, 'Request timed out');
        }
        throw new GeminiError(ErrorCode.API_ERROR, `Gemini call failed: ${err}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  throw new GeminiError(ErrorCode.SERVICE_UNAVAILABLE, 'All retries exhausted');
}

/**
 * Call Galileo Brain on VPS as fallback.
 */
export async function callBrainFallback(
  message: string,
  systemPrompt: string,
): Promise<GeminiResult | null> {
  const vpsUrl = Deno.env.get('VPS_OLLAMA_URL') || 'http://72.60.129.50:11434';

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${vpsUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'galileo-brain-v13',
        prompt: `${systemPrompt}\n\nStudente: ${message}\n\nUNLIM:`,
        stream: false,
        options: { temperature: 0.7, num_predict: 200 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.response) return null;

    const latency = Date.now() - startTime;
    console.info(JSON.stringify({
      level: 'info', event: 'brain_fallback_call',
      latencyMs: latency,
    }));

    return {
      text: data.response,
      model: 'galileo-brain-v13',
      tokensUsed: { input: 0, output: 0 },
      latencyMs: latency,
    };
  } catch {
    return null;
  }
}
