/**
 * Nanobot V2 — Progressive Hints Edge Function
 * POST /hints — Contextual hints for experiments
 * Uses Flash-Lite (simple hints don't need heavy reasoning)
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { callLLM, callBrainFallback } from '../_shared/llm-client.ts';
import { buildHintsPrompt } from '../_shared/system-prompt.ts';
import type { HintsRequest, HintsResponse } from '../_shared/types.ts';
import { getCorsHeaders, getSecurityHeaders, checkRateLimitPersistent, validateExperimentId, validateDifficulty, checkBodySize } from '../_shared/guards.ts';
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
    const body: HintsRequest = await req.json();
    const { experimentId, currentStep = 0, difficulty, sessionId } = body;

    // Consent check (if sessionId provided)
    if (sessionId) {
      const consentMode = Deno.env.get('CONSENT_MODE') || 'soft';
      if (consentMode !== 'off') {
        const consent = await checkConsent(sessionId);
        if (consent === 'revoked') {
          return new Response(JSON.stringify({ success: false, error: 'Consenso revocato.' } satisfies HintsResponse), {
            status: 403, headers: getSecurityHeaders(req),
          });
        }
      }
    }

    const safeExpId = validateExperimentId(experimentId);
    if (!safeExpId) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid experiment ID' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Rate limit
    const sessionKey = `hints:${safeExpId}`;
    const allowed = await checkRateLimitPersistent(sessionKey);
    if (!allowed) {
      return new Response(JSON.stringify({ success: false, error: 'Troppe richieste. Aspetta qualche secondo.' }), {
        status: 429, headers: getSecurityHeaders(req),
      });
    }

    const safeDifficulty = validateDifficulty(difficulty);
    const safeStep = Math.max(0, Math.min(currentStep, 99));

    const systemPrompt = buildHintsPrompt(safeExpId, safeStep, safeDifficulty);

    const hintMessage = `Dammi un suggerimento per il passo ${safeStep + 1} dell'esperimento ${safeExpId}`;
    let result;
    try {
      result = await callLLM({
        model: 'gemini-2.5-flash-lite',
        systemPrompt,
        message: hintMessage,
        maxOutputTokens: 150,
        temperature: 0.6,
      });
    } catch {
      // All LLM providers failed — try Brain as last resort
      result = await callBrainFallback(hintMessage, systemPrompt);
      if (!result) {
        return new Response(JSON.stringify({
          success: false, error: 'Suggerimenti temporaneamente non disponibili.',
        } satisfies HintsResponse), {
          status: 503, headers: getSecurityHeaders(req),
        });
      }
    }

    const response: HintsResponse = {
      success: true,
      hints: result.text,
      source: 'flash-lite',
    };

    return new Response(JSON.stringify(response), {
      status: 200, headers: getSecurityHeaders(req),
    });

  } catch (err) {
    console.error(JSON.stringify({
      level: 'error', event: 'hints_error',
      error: err instanceof Error ? err.message : 'unknown',
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false,
      error: 'Suggerimenti non disponibili.',
    } satisfies HintsResponse), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
