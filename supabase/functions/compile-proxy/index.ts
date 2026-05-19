/**
 * compile-proxy — Supabase Edge Function
 *
 * Path C iter 19 P0 (2026-04-28): production CORS unblock for /compile.
 *
 * BUG (iter 18 confirmed): browser fetch from https://www.elabtutor.school to
 * `https://n8n.srv1022317.hstgr.cloud/compile` fails CORS preflight (no
 * `Access-Control-Allow-Origin`, n8n /compile returns 502). Direct
 * `/webhook/compile` works server-side but cannot be reached cross-origin.
 *
 * FIX: this Edge Function proxies POST { code } to the n8n webhook and adds
 * the missing CORS headers. The frontend (`src/services/api.js:1192`) uses
 * `VITE_COMPILE_WEBHOOK_URL` AS-IS — Andrea will switch the Vercel env var to
 * point here once verified, no client code changes needed.
 *
 * SECURITY:
 * - CORS allow-list: prod elabtutor + Vercel preview + localhost dev.
 * - 50 KB request body cap (Arduino sketches typically <10 KB).
 * - 30 s timeout to upstream n8n.
 * - No auth check — `/webhook/compile` is already public on n8n. We don't add
 *   `verify_jwt` either (compile is anonymous in src/services/api.js).
 *
 * (c) Andrea Marro — 28/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import {
  CORS_ALLOWED_ORIGINS,
  VERCEL_PREVIEW_REGEX,
  isLoopbackDevOrigin,
  isOriginAllowed,
} from './cors.ts';

// Re-export for vitest integration test (`tests/integration/compile-proxy-cors.test.js`).
export { CORS_ALLOWED_ORIGINS, VERCEL_PREVIEW_REGEX, isLoopbackDevOrigin, isOriginAllowed };

// ── n8n upstream ──────────────────────────────────────────────────────────
const N8N_COMPILE_URL =
  Deno.env.get('N8N_COMPILE_URL') ||
  'https://n8n.srv1022317.hstgr.cloud/webhook/compile';

const UPSTREAM_TIMEOUT_MS = 30_000; // n8n compile can take ~10–20 s
const MAX_BODY_BYTES = 50_000;      // 50 KB Arduino sketch ceiling

// ── CORS allow-list ───────────────────────────────────────────────────────
// Iter 29 Task 29.5 (BUG-29-01): regex-based allowlist for Vercel preview
// deployments — branch-specific URLs follow pattern
// `elab-tutor-<branch-slug>-andreas-projects-6d4e9791.vercel.app`.
// Source of truth lives in `./cors.ts` (testable, no Deno deps).

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = isOriginAllowed(origin) ? origin : CORS_ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, apikey, X-Elab-Api-Key, x-client-info',
    'Vary': 'Origin',
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  req: Request,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

// ── handler ───────────────────────────────────────────────────────────────
serve(async (req: Request): Promise<Response> => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405, req);
  }

  // Body size guard
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse(
      { error: 'payload_too_large', max_bytes: MAX_BODY_BYTES },
      413,
      req,
    );
  }

  // Parse + validate
  let payload: { code?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400, req);
  }

  const code = payload?.code;
  if (typeof code !== 'string' || code.length === 0) {
    return jsonResponse({ error: 'code_required' }, 400, req);
  }
  if (code.length > MAX_BODY_BYTES) {
    return jsonResponse(
      { error: 'code_too_large', max_bytes: MAX_BODY_BYTES },
      413,
      req,
    );
  }

  // Forward to n8n webhook
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(N8N_COMPILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await upstream.text();
    const upstreamContentType =
      upstream.headers.get('content-type') || 'application/json';

    return new Response(text, {
      status: upstream.status,
      headers: {
        ...corsHeaders(req),
        'Content-Type': upstreamContentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const aborted = (err as Error)?.name === 'AbortError';
    return jsonResponse(
      {
        error: aborted ? 'upstream_timeout' : 'upstream_error',
        message: (err as Error)?.message || 'unknown',
        upstream: N8N_COMPILE_URL,
      },
      502,
      req,
    );
  }
});
