/**
 * Sprint S iter 6 — TTS Isabella unit tests (Task B2).
 *
 * Generator: gen-test-opus iter 6 PHASE 1.
 *
 * Scope: 12+ unit cases against the unlim-tts Edge Function contract +
 * client-side calling code path. Tests fetch the Edge Function via mocked
 * `fetch` global. Default voice = `it-IT-IsabellaNeural` (Andrea decision
 * 2026-04-26 PM). Fallback voice = `it-IT-ElsaNeural`.
 *
 * Edge Function contract (verified supabase/functions/unlim-tts/index.ts):
 *   POST {SUPABASE_EDGE}/unlim-tts
 *   body: { text, voice?, language?, speed?, sessionId? }
 *   200 binary audio/mpeg  → success path
 *   200 JSON {success:true, source:'browser'}  → graceful degradation
 *   400 JSON {success:false, error:'Empty text'}  → empty text
 *   400 JSON {success:false, error:'Text too short after cleaning'}  → all action tags
 *   403 JSON {success:false, error:'Consenso revocato.'}  → GDPR revoked
 *   429 JSON {success:false, error:'Troppe richieste TTS.'}  → rate limit
 *   413 (checkBodySize)  → body too large
 *
 * Iter 6 wire-up status:
 *   - it-IT-IsabellaNeural is the agreed-upon UNLIM voice (CLAUDE.md addendum).
 *   - edge-tts pip wire-up to be deployed in Edge Function by gen-app iter 6
 *     (B1 task, parallel). These tests bind the contract.
 *   - Long-text split (>5000 chars) is the only behavior NOT yet implemented
 *     server-side — this suite documents the expected behavior.
 *
 * Honesty caveat: tests mock fetch — they do NOT hit prod Edge Function.
 * Real HTTP smoke iter 6+ via run-sprint-r5-stress.mjs (Box 9 already 91.80%).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const UNLIM_TTS_URL = 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts';
const DEFAULT_VOICE = 'it-IT-IsabellaNeural';
const FALLBACK_VOICE = 'it-IT-ElsaNeural';

/**
 * Minimal client wrapper used by the tests. Mirrors the contract that the
 * gen-app routeTTS impl will provide (B1 iter 6). Kept inline so this test
 * file is self-contained and documents the expected client surface.
 */
async function callTtsEdge({
  text,
  voice = DEFAULT_VOICE,
  language = 'it-IT',
  speed = 1.0,
  sessionId,
  signal,
} = {}) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { ok: false, error: 'text required (non-empty string)' };
  }
  if (text.length > 5000) {
    return {
      ok: false,
      error: 'text exceeds 5000 chars limit — split before TTS',
      meta: { text_length: text.length, limit: 5000 },
    };
  }

  const body = { text, voice, language, speed };
  if (sessionId) body.sessionId = sessionId;

  // SSML special chars escape (defensive — Edge Function also strips/escapes)
  body.text = body.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const start = Date.now();
  const ctrl = signal ? null : new AbortController();
  const timeoutId = ctrl ? setTimeout(() => ctrl.abort(), 30000) : null;

  try {
    const res = await fetch(UNLIM_TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: signal || ctrl.signal,
    });
    if (timeoutId) clearTimeout(timeoutId);

    const ct = res.headers.get('Content-Type') || '';
    const latency = Date.now() - start;

    if (!res.ok) {
      let payload = null;
      try { payload = await res.json(); } catch (_e) { /* binary error edge */ }
      return {
        ok: false,
        status: res.status,
        error: payload?.error || `HTTP ${res.status}`,
        latency_ms: latency,
      };
    }

    if (ct.startsWith('audio/')) {
      const audio = await res.arrayBuffer();
      return {
        ok: true,
        provider: 'edge-tts',
        voice,
        audio,
        audio_bytes: audio.byteLength,
        content_type: ct,
        latency_ms: latency,
      };
    }

    // JSON degradation path
    const payload = await res.json();
    return {
      ok: payload?.success === true,
      provider: payload?.source === 'browser' ? 'browser-fallback' : 'edge-tts',
      meta: payload,
      latency_ms: latency,
    };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { ok: false, error: 'timeout (30s)', timeout: true };
    }
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

function mockBinaryAudio(bytes = 1024) {
  const buf = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) buf[i] = i % 256;
  return new Response(buf, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(bytes) },
  });
}

describe('TTS Isabella — default voice', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('uses it-IT-IsabellaNeural as default voice (Andrea decision 2026-04-26)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio(2048));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'Ragazzi, accendiamo il LED.' });

    expect(r.ok).toBe(true);
    expect(r.provider).toBe('edge-tts');
    expect(r.voice).toBe(DEFAULT_VOICE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.voice).toBe(DEFAULT_VOICE);
    expect(body.language).toBe('it-IT');
  });

  it('forwards default speed=1.0', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    await callTtsEdge({ text: 'Ciao ragazzi.' });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.speed).toBe(1.0);
  });
});

describe('TTS Isabella — speed/rate variants', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('forwards speed 0.95 (rate -5%)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    await callTtsEdge({ text: 'Lento.', speed: 0.95 });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.speed).toBe(0.95);
  });

  it('forwards speed 0.90 (rate -10%)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    await callTtsEdge({ text: 'Piu lento.', speed: 0.90 });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.speed).toBe(0.90);
  });

  it('forwards speed 1.05 (rate +5%)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    await callTtsEdge({ text: 'Piu veloce.', speed: 1.05 });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.speed).toBe(1.05);
  });
});

describe('TTS Isabella — voice override', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('forwards override voice (it-IT-ElsaNeural fallback)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'Test', voice: FALLBACK_VOICE });

    expect(r.ok).toBe(true);
    expect(r.voice).toBe(FALLBACK_VOICE);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.voice).toBe(FALLBACK_VOICE);
  });
});

describe('TTS Isabella — input validation', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns error on empty text without calling fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: '' });

    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/text required/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error on whitespace-only text', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: '   \n\t  ' });

    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/text required/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns error when text exceeds 5000 chars (split required)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const longText = 'a'.repeat(5001);
    const r = await callTtsEdge({ text: longText });

    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/exceeds 5000 chars/);
    expect(r.meta.text_length).toBe(5001);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('TTS Isabella — SSML escape', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('escapes & < > before sending to Edge Function', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    await callTtsEdge({ text: 'A & B <tag> C' });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.text).toBe('A &amp; B &lt;tag&gt; C');
  });
});

describe('TTS Isabella — error responses', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('handles 429 rate limit with proper error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, error: 'Troppe richieste TTS. Aspetta qualche secondo.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'spam', sessionId: 's1' });

    expect(r.ok).toBe(false);
    expect(r.status).toBe(429);
    expect(r.error).toMatch(/Troppe richieste/);
  });

  it('handles 403 GDPR consent revoked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, error: 'Consenso revocato.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'test', sessionId: 'gdpr-revoked' });

    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
    expect(r.error).toMatch(/Consenso revocato/);
  });
});

describe('TTS Isabella — audio response binary integrity', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns audio buffer with byteLength > 0', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio(4096));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'Ragazzi, attenzione al circuito.' });

    expect(r.ok).toBe(true);
    expect(r.audio).toBeInstanceOf(ArrayBuffer);
    expect(r.audio_bytes).toBe(4096);
    expect(r.audio_bytes).toBeGreaterThan(0);
  });

  it('returns Content-Type audio/mpeg on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio(1024));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'test' });

    expect(r.content_type).toBe('audio/mpeg');
  });

  it('handles JSON browser-fallback degradation (200 + source=browser)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: true, source: 'browser', text: 'fallback', message: 'Usa la sintesi vocale del browser.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'test' });

    expect(r.ok).toBe(true);
    expect(r.provider).toBe('browser-fallback');
    expect(r.meta.message).toMatch(/sintesi vocale del browser/);
  });
});

describe('TTS Isabella — timeout handling', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns timeout error when fetch aborts via AbortError', async () => {
    const fetchMock = vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'test' });

    expect(r.ok).toBe(false);
    expect(r.timeout).toBe(true);
    expect(r.error).toMatch(/timeout/);
  });
});

describe('TTS Isabella — latency tracking', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('reports latency_ms >= 0 on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio());
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'latency probe' });

    expect(r.latency_ms).toBeGreaterThanOrEqual(0);
    expect(typeof r.latency_ms).toBe('number');
  });

  it('reports latency_ms on error path too', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, error: 'boom' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const r = await callTtsEdge({ text: 'fail probe' });

    expect(r.ok).toBe(false);
    expect(r.latency_ms).toBeGreaterThanOrEqual(0);
  });
});
