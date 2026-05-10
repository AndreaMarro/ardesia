/**
 * unlim-vision — Edge Function (Sprint T iter 35 — 2026-04-30)
 *
 * Vision-language analysis with provider chain:
 *   1. PRIMARY: Gemini 2.5 Flash EU Frankfurt (~600ms p50, GDPR-clean)
 *   2. FALLBACK: Mistral Pixtral 12B FR EU (~1300ms p50, GDPR-clean)
 *
 * Switch rationale (Andrea decision iter 35): -700ms latency + lower cost +
 * Frankfurt EU same-region as text path. Pixtral retained as fallback to
 * preserve resilience (the existing chain wasn't replaced — it was demoted).
 *
 * Used for: kit photo analysis, breadboard verification, circuit diagnostics.
 *
 * POST /unlim-vision
 * Body: { prompt: string, images: string[] (base64 or data URI), sessionId: string }
 * Returns:
 *   200 { success: true, response: string, model: string, provider: string, latencyMs: number }
 *   200 surfaces header `X-Vision-Provider: gemini-2.5-flash | pixtral-12b`
 *   500 on both providers failed
 *
 * Env vars (read at runtime, NEVER cached):
 *   GOOGLE_API_KEY     — primary; gemini-vision client falls back to GEMINI_API_KEY if unset
 *   MISTRAL_API_KEY    — fallback (used by callMistralChat)
 *   VISION_PROVIDER    — optional override: 'gemini' | 'pixtral' | 'auto' (default 'auto')
 *
 * (c) Andrea Marro — 2026-04-29 → 2026-04-30
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getCorsHeaders, getSecurityHeaders, checkBodySize, BODY_SIZE_MULTIMODAL } from '../_shared/guards.ts';
import { callMistralChat } from '../_shared/mistral-client.ts';
import { synthesizeGeminiVision } from '../_shared/gemini-vision.ts';
import type { UnlimAiProfile } from '../_shared/unlim-ai-profiles.ts';
import { buildUnlimAiProfilePrompt, selectUnlimAiProfile } from '../_shared/unlim-ai-profiles.ts';

interface VisionRequest {
  prompt: string;
  images: string[]; // base64 data URI OR https URL (Pixtral supports URL, Gemini does not)
  sessionId: string;
  provider?: 'gemini' | 'pixtral' | 'auto';
  aiProfile?: string | null;
  aiDepth?: 'total' | 'compact' | null;
  unlimMode?: string | null;
}

const PIXTRAL_SYSTEM_PROMPT = `Sei UNLIM, tutor visivo ELAB Tutor Italian K-12 8-14yo. Analizzi foto del kit fisico (breadboard, componenti, circuito Arduino).

REGOLE:
- INIZIA risposta con "Ragazzi,"
- Massimo 120 parole ben formattate (analogia opzionale)
- Identifica componenti visibili (LED, resistore, breadboard, fili colore, batteria)
- Diagnosi se circuito errato (LED contrario, fili sbagliati, breadboard mal collegata)
- Linguaggio 10-14 anni, analogie quotidiano
- Cita kit fisico, NON simulatore`;

/**
 * Try Gemini Vision first; on any error → Pixtral fallback.
 * Returns the provider name actually used so the caller can surface it via header.
 *
 * Note: Gemini does NOT support URL images (requires base64 inlineData). When the
 * client passes URLs we skip Gemini and go straight to Pixtral, which DOES
 * accept URL images via its `source` field.
 */
async function callVisionChain(
  prompt: string,
  images: string[],
  providerHint?: 'gemini' | 'pixtral' | 'auto',
  aiProfile?: UnlimAiProfile,
): Promise<{ text: string; latencyMs: number; model: string; provider: 'gemini-2.5-flash' | 'pixtral-12b'; dataProcessing: string }> {
  const explicitProvider = providerHint && providerHint !== 'auto' ? providerHint : null;
  const providerOverride = (explicitProvider || aiProfile?.visionProvider || Deno.env.get('VISION_PROVIDER') || 'auto').toLowerCase().trim();
  const profilePrompt = aiProfile ? buildUnlimAiProfilePrompt(aiProfile) : '';
  const enrichedPrompt = profilePrompt
    ? `${profilePrompt}\n\nRICHIESTA VISIVA:\n${prompt}`
    : prompt;

  // Detect if images are all base64 (Gemini-compatible) or contain URLs (Pixtral-only).
  const allBase64 = images.every((src) =>
    typeof src === 'string' && (src.startsWith('data:') || !src.startsWith('http'))
  );

  // Decide primary path
  const tryGeminiFirst =
    providerOverride !== 'pixtral' && // explicit override skips Gemini
    allBase64 &&                       // Gemini requires base64
    images.length === 1;               // current Gemini wire-up = single image (multi-image iter 36+)

  if (tryGeminiFirst) {
    const geminiResult = await synthesizeGeminiVision({
      imageBase64: images[0],
      prompt: enrichedPrompt,
      timeoutMs: 5000,
      maxOutputTokens: aiProfile?.depth === 'total' ? 260 : 140,
      temperature: 0.3,
    });

    if (geminiResult.ok) {
      return {
        text: geminiResult.text,
        latencyMs: geminiResult.latencyMs,
        model: 'gemini-2.5-flash',
        provider: 'gemini-2.5-flash',
        dataProcessing: 'google-gemini-eu-frankfurt',
      };
    }

    // Log the Gemini failure (server-side only) and fall through to Pixtral
    console.warn(JSON.stringify({
      level: 'warn',
      event: 'gemini_vision_fallback_to_pixtral',
      reason: geminiResult.errorReason,
      internalError: geminiResult._internalError,
      latencyMs: geminiResult.latencyMs,
      timestamp: new Date().toISOString(),
    }));
  }

  // ── Pixtral fallback (or primary when Gemini skipped/disabled) ─────────────
  const pixtralImages = images.map((src) => ({ source: src }));
  const pixtralResult = await callMistralChat({
    model: 'pixtral-12b-2409',
    systemPrompt: [PIXTRAL_SYSTEM_PROMPT, profilePrompt].filter(Boolean).join('\n\n'),
    message: prompt.slice(0, 1000),
    images: pixtralImages,
    maxOutputTokens: aiProfile?.depth === 'total' ? 260 : 140,
    temperature: 0.3,
  });

  return {
    text: pixtralResult.text,
    latencyMs: pixtralResult.latencyMs,
    model: 'pixtral-12b-2409',
    provider: 'pixtral-12b',
    dataProcessing: 'mistral-eu-fr',
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: getSecurityHeaders(req),
    });
  }

  const bodyCheck = checkBodySize(req, BODY_SIZE_MULTIMODAL);
  if (bodyCheck) return bodyCheck;

  try {
    const body: VisionRequest = await req.json();

    if (!body.prompt || !body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'prompt + images[] required' }), {
        status: 400,
        headers: getSecurityHeaders(req),
      });
    }

    if (!body.sessionId) {
      return new Response(JSON.stringify({ success: false, error: 'sessionId required' }), {
        status: 400,
        headers: getSecurityHeaders(req),
      });
    }

    if (body.images.length > 4) {
      return new Response(JSON.stringify({ success: false, error: 'max 4 images per request' }), {
        status: 400,
        headers: getSecurityHeaders(req),
      });
    }

    const profile = selectUnlimAiProfile(body.prompt, {
      hasImages: true,
      requestedProfile: body.aiProfile || null,
      requestedDepth: body.aiDepth || null,
      simulatorContext: body.unlimMode ? { modalita: body.unlimMode } : null,
    });
    const result = await callVisionChain(body.prompt, body.images, body.provider, profile);

    // Surface provider via header for client-side observability + audit trails
    const headers = new Headers(getSecurityHeaders(req));
    headers.set('X-Vision-Provider', result.provider);

    return new Response(JSON.stringify({
      success: true,
      response: result.text,
      model: result.model,
      provider: result.provider,
      aiProfile: profile.id,
      dataProcessing: result.dataProcessing,
      latencyMs: result.latencyMs,
    }), {
      status: 200,
      headers,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error(JSON.stringify({
      level: 'error',
      event: 'unlim_vision_error',
      error: msg,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false,
      error: 'Vision analysis failed',
      details: msg.slice(0, 200),
    }), {
      status: 500,
      headers: getSecurityHeaders(req),
    });
  }
});
