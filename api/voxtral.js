/**
 * ELAB — /api/voxtral serverless proxy
 *
 * Same-origin HTTPS proxy for Supabase `unlim-tts`, forcing the Voxtral path.
 * This keeps browser CSP/CORS clean and lets UNLIM use the configured cloned
 * voice before falling back to Kokoro/Edge/browser speech.
 */

export const config = { runtime: 'nodejs' };

const SUPABASE_EDGE_URL = process.env.SUPABASE_EDGE_URL
  || process.env.VITE_SUPABASE_EDGE_URL
  || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1';

const PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXBkdWVvcG1sbGxxam1xbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDI3MDksImV4cCI6MjA5MDcxODcwOX0.289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ';

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

const MAX_TEXT_LENGTH = 500;
const REQUEST_TIMEOUT_MS = 10_000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed - use POST' });
  }

  const body = req.body || {};
  const input = String(body.input || body.text || '').trim().slice(0, MAX_TEXT_LENGTH);
  if (!input) {
    return res.status(400).json({ error: 'Missing input' });
  }

  const endpoint = `${SUPABASE_EDGE_URL.replace(/\/+$/, '')}/unlim-tts`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        text: input,
        provider: 'voxtral',
        format: body.response_format || body.format || 'mp3',
        voice_id: body.voice_id,
        sessionId: body.sessionId,
      }),
    });

    const contentType = upstream.headers.get('content-type') || '';
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const provider = upstream.headers.get('x-tts-provider') || '';

    if (!upstream.ok || !contentType.startsWith('audio/') || provider !== 'voxtral') {
      return res.status(502).json({
        error: 'Voxtral upstream did not return cloned audio',
        status: upstream.status,
        contentType,
        provider,
        detail: buffer.toString('utf8').slice(0, 240),
      });
    }

    res.setHeader('Content-Type', contentType || 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    for (const header of ['x-tts-provider', 'x-tts-voice', 'x-tts-model', 'x-tts-latency-ms']) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    return res.status(200).send(buffer);
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return res.status(isAbort ? 504 : 502).json({
      error: isAbort ? 'Voxtral timeout 10s' : 'Voxtral proxy error',
      detail: String(err?.message || err).slice(0, 200),
    });
  } finally {
    clearTimeout(timer);
  }
}
