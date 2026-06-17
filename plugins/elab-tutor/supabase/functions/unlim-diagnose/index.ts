/**
 * Nanobot V2 — Circuit Diagnosis Edge Function
 * POST /diagnose — Proactive circuit error analysis
 * Always uses Gemini Flash (needs reasoning but not Pro-level)
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { callLLM, callBrainFallback } from '../_shared/llm-client.ts';
import { DIAGNOSE_PROMPT } from '../_shared/system-prompt.ts';
import type { DiagnoseRequest, DiagnoseResponse } from '../_shared/types.ts';
import { getCorsHeaders, getSecurityHeaders, checkRateLimitPersistent, sanitizeCircuitState, validateExperimentId, checkBodySize } from '../_shared/guards.ts';
import { checkConsent } from '../_shared/memory.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405, headers: getSecurityHeaders(req),
    });
  }

  const bodyCheck = checkBodySize(req);
  if (bodyCheck) return bodyCheck;

  try {
    // Iter 8 fix: accept BOTH legacy `circuitState` schema AND new
    // postToVisionEndpoint schema `{image, circuit, session_id, prompt}`.
    // Image (base64 PNG) is forwarded to callLLM Gemini Vision when present.
    const body = await req.json() as DiagnoseRequest & {
      image?: string;
      circuit?: unknown;
      session_id?: string;
      prompt?: string;
    };
    const circuitState = body.circuitState ?? body.circuit;
    const experimentId = body.experimentId;
    const sessionId = body.sessionId ?? body.session_id;
    const imageBase64 = typeof body.image === 'string' ? body.image : undefined;
    const userPrompt = typeof body.prompt === 'string' ? body.prompt : undefined;

    // Consent check (if sessionId provided)
    if (sessionId) {
      const consentMode = Deno.env.get('CONSENT_MODE') || 'soft';
      if (consentMode !== 'off') {
        const consent = await checkConsent(sessionId);
        if (consent === 'revoked') {
          return new Response(JSON.stringify({ success: false, error: 'Consenso revocato.' }), {
            status: 403, headers: getSecurityHeaders(req),
          });
        }
      }
    }

    // Iter 8 fix: at least ONE of circuitState OR image required
    if (!circuitState && !imageBase64) {
      return new Response(JSON.stringify({ success: false, error: 'No circuit state or image' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Rate limit by a session-like identifier (use experimentId or IP hash)
    const sessionKey = `diagnose:${experimentId || 'anon'}`;
    const allowed = await checkRateLimitPersistent(sessionKey);
    if (!allowed) {
      return new Response(JSON.stringify({ success: false, error: 'Troppe richieste. Aspetta qualche secondo.' }), {
        status: 429, headers: getSecurityHeaders(req),
      });
    }

    // Deep sanitize circuit state (optional now — image-only diagnosis OK)
    const safeState = circuitState ? (sanitizeCircuitState(circuitState) as Record<string, unknown>) : null;
    const safeExpId = validateExperimentId(experimentId);

    const circuitDescription = safeState
      ? ((safeState as { text?: string }).text || JSON.stringify(safeState).slice(0, 2000))
      : '(nessuno stato circuito fornito — diagnosi via vision)';

    // Iter 8 fix: support optional teacher-supplied prompt to focus the diagnosis
    const promptHeader = userPrompt ? `Domanda docente: ${userPrompt}\n\n` : '';
    const expIdHeader = safeExpId ? `Esperimento: ${safeExpId}\n\n` : '';
    const message = `${promptHeader}${expIdHeader}Stato circuito:\n${circuitDescription}`;

    // Iter 8 fix: build images[] for callLLM Gemini Vision when image present
    const images = imageBase64
      ? [{
          mimeType: 'image/png' as const,
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/i, ''),
        }]
      : undefined;

    let result = null;
    let source = imageBase64 ? 'flash-vision' : 'flash';

    // Try LLM (Together/Gemini with auto-fallback), then Flash-Lite, then Brain
    try {
      result = await callLLM({
        model: 'gemini-2.5-flash',
        systemPrompt: DIAGNOSE_PROMPT,
        message,
        images,
        maxOutputTokens: imageBase64 ? 400 : 200, // vision needs more tokens
        temperature: 0.3,
      });
    } catch (e1) {
      console.warn(JSON.stringify({
        level: 'warn', event: 'diagnose_primary_failed',
        error: e1 instanceof Error ? e1.message : 'unknown',
      }));
      // Fallback to Flash-Lite tier
      try {
        result = await callLLM({
          model: 'gemini-2.5-flash-lite',
          systemPrompt: DIAGNOSE_PROMPT,
          message,
          images,
          maxOutputTokens: imageBase64 ? 400 : 200,
          temperature: 0.3,
        });
        source = imageBase64 ? 'flash-lite-vision' : 'flash-lite';
      } catch {
        // All LLM providers failed — try Brain (Brain has no vision)
        result = await callBrainFallback(message, DIAGNOSE_PROMPT);
        source = 'brain';
      }
    }

    if (!result?.text) {
      return new Response(JSON.stringify({
        success: false, error: 'Diagnosi temporaneamente non disponibile.',
      } satisfies DiagnoseResponse), {
        status: 503, headers: getSecurityHeaders(req),
      });
    }

    const response: DiagnoseResponse = {
      success: true,
      diagnosis: result.text,
      source,
    };

    return new Response(JSON.stringify(response), {
      status: 200, headers: getSecurityHeaders(req),
    });

  } catch (err) {
    console.error(JSON.stringify({
      level: 'error', event: 'diagnose_error',
      error: err instanceof Error ? err.message : 'unknown',
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false,
      error: 'Diagnosi non disponibile.',
    } satisfies DiagnoseResponse), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
