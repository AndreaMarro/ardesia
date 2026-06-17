/**
 * unlim-imagegen — Edge Function (Sprint T iter 25)
 *
 * Image generation via Cloudflare Workers AI FLUX.1 Schnell.
 * Free tier: 10k req/giorno shared.
 *
 * POST /unlim-imagegen
 * Body: { prompt: string, sessionId: string, width?: number, height?: number }
 * Returns: { success: true, image: base64-png-data-uri, model: '@cf/black-forest-labs/flux-1-schnell' }
 *
 * (c) Andrea Marro — 2026-04-29
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { getCorsHeaders, getSecurityHeaders, checkBodySize } from '../_shared/guards.ts';
import { cfImageGen } from '../_shared/cloudflare-client.ts';

interface ImageGenRequest {
  prompt: string;
  sessionId: string;
  width?: number;
  height?: number;
}

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
    const body: ImageGenRequest = await req.json();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'prompt required' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'sessionId required (UUID)' }), {
        status: 400, headers: getSecurityHeaders(req),
      });
    }

    // Cap prompt length (anti-abuse)
    const prompt = body.prompt.slice(0, 500);

    // Generate via Cloudflare FLUX schnell
    const result = await cfImageGen({
      prompt,
      width: body.width ?? 1024,
      height: body.height ?? 1024,
      numSteps: 4,
    });

    return new Response(JSON.stringify({
      success: true,
      image: `data:image/png;base64,${result.imageBase64}`,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
    }), {
      status: 200, headers: getSecurityHeaders(req),
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error(JSON.stringify({
      level: 'error', event: 'unlim_imagegen_error', error: msg,
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false, error: 'Image generation failed', details: msg.slice(0, 200),
    }), {
      status: 500, headers: getSecurityHeaders(req),
    });
  }
});
