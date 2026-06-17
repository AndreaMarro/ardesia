/**
 * Vercel Edge Function — proxy Kokoro TTS (HTTPS safe)
 *
 * In produzione elabtutor.school è HTTPS ma il Kokoro-FastAPI container gira
 * su VPS plain HTTP (72.60.129.50:8881). Senza proxy i browser bloccano
 * per mixed-content. Questa funzione forwarda POST /v1/audio/speech e
 * restituisce il binary MP3.
 *
 * Endpoint Kokoro upstream: POST http://72.60.129.50:8881/v1/audio/speech
 * Body: { input: string, voice: string, response_format: 'mp3' }
 * Ritorna: audio/mpeg binary
 *
 * (c) Andrea Marro — 17/04/2026
 */

export const config = { runtime: 'nodejs' };

const KOKORO_UPSTREAM = 'http://72.60.129.50:8881/v1/audio/speech';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method not allowed, use POST' });
        return;
    }

    try {
        // Next/Vercel Edge Function già fa body parsing JSON su req.body
        const body = req.body || {};
        const input = String(body.input || '').slice(0, 500);
        const voice = String(body.voice || 'if_sara');
        const responseFormat = body.response_format || 'mp3';

        if (!input) {
            res.status(400).json({ error: 'Missing input' });
            return;
        }

        // Timeout upstream 10s (Kokoro CPU typical 1-2s, buffer x5)
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);

        const upstream = await fetch(KOKORO_UPSTREAM, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input,
                voice,
                response_format: responseFormat,
            }),
            signal: controller.signal,
        });
        clearTimeout(timer);

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            res.status(upstream.status).json({
                error: `Kokoro upstream error ${upstream.status}`,
                detail: text.slice(0, 200),
            });
            return;
        }

        const audio = await upstream.arrayBuffer();
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(Buffer.from(audio));
    } catch (e) {
        const isAbort = e && e.name === 'AbortError';
        res.status(isAbort ? 504 : 500).json({
            error: isAbort ? 'Kokoro timeout 10s' : 'Kokoro proxy error',
            detail: String(e?.message || e).slice(0, 200),
        });
    }
}
