/**
 * unlim-fumetto — dedicated Gemini draft generator for session comics.
 *
 * Browser clients send session evidence only. Secrets stay inside Edge; Gemini
 * generates written panels, quiz/diary and image prompts from that evidence.
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getCorsHeaders, getSecurityHeaders, checkBodySize } from '../_shared/guards.ts';
import { callLLM } from '../_shared/llm-client.ts';
import {
  FUMETTO_GEMINI_SYSTEM_PROMPT,
  buildFumettoGeminiMessage,
  parseFumettoGeminiJson,
} from '../_shared/fumetto-prompt.ts';

interface FumettoRequest {
  sessionEvidence?: Record<string, unknown>;
  sessionId?: string;
}

function jsonResponse(req: Request, status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: getSecurityHeaders(req),
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return jsonResponse(req, 405, { success: false, error: 'Method not allowed' });
  }

  const bodyCheck = checkBodySize(req);
  if (bodyCheck) return bodyCheck;

  try {
    const body = await req.json().catch(() => ({})) as FumettoRequest;
    const sessionEvidence = body.sessionEvidence;
    if (!sessionEvidence || typeof sessionEvidence !== 'object' || Array.isArray(sessionEvidence)) {
      return jsonResponse(req, 400, { success: false, error: 'sessionEvidence required' });
    }

    const result = await callLLM({
      model: 'gemini-2.5-flash',
      systemPrompt: FUMETTO_GEMINI_SYSTEM_PROMPT,
      message: buildFumettoGeminiMessage(sessionEvidence),
      maxOutputTokens: 2800,
      temperature: 0.55,
      preferFastProvider: true,
    });

    const draft = parseFumettoGeminiJson(result.text);
    const normalizedDraft = JSON.parse(JSON.stringify(draft));

    return jsonResponse(req, 200, {
      success: true,
      draft: normalizedDraft,
      provider: result.provider,
      model: result.model,
      latencyMs: result.latencyMs,
      tokensUsed: result.tokensUsed,
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'unlim_fumetto_failed',
      error: err instanceof Error ? err.message : String(err),
    }));
    return jsonResponse(req, 503, { success: false, error: 'Gemini fumetto unavailable' });
  }
});
