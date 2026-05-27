/**
 * ELAB — /api/tts serverless proxy
 *
 * Production path: same-origin HTTPS wrapper around Supabase `unlim-tts`
 * with Voxtral cloned voice. The legacy plain-HTTP VPS Edge TTS is kept only
 * as an explicit fallback because waiting for it first adds ~10s of dead time
 * whenever that service is unhealthy.
 *
 * Contract
 * ────────
 *   GET /api/tts?text=<uri-encoded-text>[&voice=<voice-id>]
 *     → 200 audio/* with the raw TTS bytes
 *     → 400 when the text parameter is missing or too long
 *     → 502 when every TTS backend is unreachable or errors out
 *     → 405 for non-GET methods
 *
 * Notes
 * ─────
 *  - GET is intentional so the PWA service worker can cache replies and the
 *    browser can stream directly into an `<audio>` element with `new Audio()`.
 *  - Text is capped at 500 characters — Edge TTS latency grows linearly with
 *    input length; longer replies are truncated upstream anyway. This also
 *    bounds any possible abuse of the proxy.
 *  - Voxtral is tried first because UNLIM voice must be reactive.
 *
 * © Andrea Marro — 18/04/2026 — Ralph Loop iteration 1 (PDR v3 TASK 10)
 */

const UPSTREAM_BASE = process.env.EDGE_TTS_URL || 'http://72.60.129.50:8880';
const MAX_TEXT_LENGTH = 500;
const REQUEST_TIMEOUT_MS = 6000;
const LEGACY_VPS_TIMEOUT_MS = 2500;
const SUPABASE_EDGE_URL = process.env.SUPABASE_EDGE_URL
  || process.env.VITE_SUPABASE_EDGE_URL
  || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1';
const PUBLIC_SUPABASE_ANON_KEY = 'DEV_SENTINEL_SET_VITE_SUPABASE_ANON_KEY_IN_ENV_LOCAL';

function isValidElabAnonJwt(value) {
  try {
    const token = String(value || '').trim();
    const payload = token.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.ref === 'euqpdueopmlllqjmqnyb' && decoded.role === 'anon';
  } catch {
    return false;
  }
}

const ENV_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_ANON_KEY = isValidElabAnonJwt(ENV_SUPABASE_ANON_KEY)
  ? ENV_SUPABASE_ANON_KEY
  : PUBLIC_SUPABASE_ANON_KEY;

async function synthesizeViaSupabase(text, signal) {
  const endpoint = `${SUPABASE_EDGE_URL.replace(/\/+$/, '')}/unlim-tts`;
  const upstream = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      text,
      provider: 'voxtral',
      format: 'mp3',
    }),
  });
  const contentType = upstream.headers.get('content-type') || '';
  const buffer = Buffer.from(await upstream.arrayBuffer());
  const provider = upstream.headers.get('x-tts-provider') || '';
  if (!upstream.ok || !contentType.startsWith('audio/') || buffer.byteLength < 1500) {
    return null;
  }
  return { buffer, contentType, provider, upstream };
}

export default async function handler(req, res) {
  // Only GET — the PWA service worker can cache replies, and `<audio src>`
  // only issues GETs. POST would force us to lose cache-ability.
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed — use GET' });
  }

  const rawText = typeof req.query?.text === 'string' ? req.query.text : '';
  const voice = typeof req.query?.voice === 'string' ? req.query.voice : '';

  if (!rawText || rawText.trim().length === 0) {
    return res.status(400).json({ error: 'Missing "text" query parameter' });
  }

  // Defensive: cap length to avoid abuse / runaway latency
  const text = rawText.slice(0, MAX_TEXT_LENGTH);

  const upstreamUrl = new URL('/tts', UPSTREAM_BASE);
  upstreamUrl.searchParams.set('text', text);
  if (voice) upstreamUrl.searchParams.set('voice', voice);

  const primaryController = new AbortController();
  const primaryTimer = setTimeout(() => primaryController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const primary = await synthesizeViaSupabase(text, primaryController.signal).catch(() => null);
    if (primary) {
      res.setHeader('Content-Type', primary.contentType);
      res.setHeader('Cache-Control', 'no-store');
      if (primary.provider) res.setHeader('X-Tts-Provider', primary.provider);
      for (const header of ['x-tts-voice', 'x-tts-model', 'x-tts-latency-ms']) {
        const value = primary.upstream.headers.get(header);
        if (value) res.setHeader(header, value);
      }
      return res.status(200).send(primary.buffer);
    }
  } finally {
    clearTimeout(primaryTimer);
  }

  const legacyController = new AbortController();
  const legacyTimer = setTimeout(() => legacyController.abort(), LEGACY_VPS_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      signal: legacyController.signal,
      headers: {
        // Identify ourselves so the VPS access log is meaningful
        'User-Agent': 'ELAB-Tutor-TTS-Proxy/1.0',
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: 'Upstream TTS returned non-2xx', status: upstream.status });
    }

    // Preserve the upstream content type so the browser picks the right
    // decoder (audio/wav, audio/mpeg, audio/ogg).
    const contentType = upstream.headers.get('content-type') || 'audio/wav';
    res.setHeader('Content-Type', contentType);

    // Cache for 1 day — identical text produces identical audio, and we've
    // clamped text length so the cache key space stays small. Publicly
    // cacheable because there's nothing PII in a TTS render.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return res.status(502).json({
      error: isAbort ? 'Upstream TTS timeout' : 'Upstream TTS unreachable',
      detail: err?.message || String(err),
    });
  } finally {
    clearTimeout(legacyTimer);
  }
}
