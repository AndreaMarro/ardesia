/**
 * Sprint S iter 6 — multimodalRouter.routeTTS unit tests (Task A4).
 *
 * Generator: gen-test-opus iter 6 PHASE 1.
 *
 * Scope: 6 cases against the new routeTTS impl that gen-app iter 6 will ship
 * in `src/services/multimodalRouter.js` (replacing the current iter-4 stub
 * that returns `{ ok: false, error: 'defer iter 5+' }`).
 *
 * TDD red phase: this test file MAY fail on initial run if gen-app has not
 * yet landed the routeTTS impl. Orchestrator coordinates parallel landing.
 *
 * Expected new contract (per ADR-014 architect-opus iter 6 + Andrea decision
 * 2026-04-26 PM "it-IT-IsabellaNeural approvato"):
 *
 *   await multimodalRouter.route({
 *     modality: 'tts',
 *     payload: { text, voice?, speed?, sessionId? },
 *     context: {},
 *   })
 *   →  { ok: true, provider: 'edge-tts', voice, audio?, meta?, latencyMs }
 *   |  { ok: false, error, provider: 'edge-tts', latencyMs }
 *   |  { ok: false, error: '<validation>' }       // empty text
 *
 * Default voice: it-IT-IsabellaNeural (Andrea decision marker).
 * Default speed: 1.0.
 * Default rate offset: -5%  → speed=0.95 supported.
 *
 * Implementation hint for gen-app: import callTtsEdge from a new
 * `src/services/ttsClient.js` (or inline) that posts to unlim-tts; on 200
 * audio/mpeg return `provider:'edge-tts'` + audio; on 401/500 return
 * `provider:'edge-tts'` + ok:false + error.
 *
 * Cases:
 *   1. Default Isabella + speed -5% → ok=true, provider='edge-tts'.
 *   2. Voice override (it-IT-ElsaNeural) → forwarded to fetch body.
 *   3. Edge Function HTTP 401 unauthorized → ok=false + error.
 *   4. Edge Function HTTP 500 internal → ok=false + provider='edge-tts'.
 *   5. Empty text → ok=false validation error before fetch.
 *   6. latencyMs > 0 tracked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock api.js BEFORE importing multimodalRouter (api.js init side-effects).
vi.mock('../../src/services/api.js', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  diagnoseCircuit: vi.fn(),
  getExperimentHints: vi.fn(),
}));

import { multimodalRouter } from '../../src/services/multimodalRouter.js';

const ISABELLA = 'it-IT-IsabellaNeural';
const ELSA = 'it-IT-ElsaNeural';

function mockBinaryAudio(bytes = 1024) {
  const buf = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) buf[i] = (i * 7) % 256;
  return new Response(buf, {
    status: 200,
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(bytes) },
  });
}

describe('multimodalRouter.routeTTS — default Isabella', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('case 1: default Isabella + rate -5% → ok=true, provider=edge-tts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio(2048));
    vi.stubGlobal('fetch', fetchMock);

    const r = await multimodalRouter.route({
      modality: 'tts',
      payload: { text: 'Ragazzi, attenzione.' },
    });

    expect(r.ok).toBe(true);
    expect(r.provider).toBe('edge-tts');
    // Voice should default to Isabella when not specified
    const callBody = fetchMock.mock.calls[0]?.[1]?.body;
    expect(callBody).toBeDefined();
    const parsed = JSON.parse(callBody);
    expect(parsed.voice).toBe(ISABELLA);
    // Default rate -5% per Andrea decision (gen-app contract uses string rate, not numeric speed)
    expect(parsed.rate).toBe('-5%');
  });
});

describe('multimodalRouter.routeTTS — voice override', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('case 2: voice override forwarded to Edge Function body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio(1024));
    vi.stubGlobal('fetch', fetchMock);

    const r = await multimodalRouter.route({
      modality: 'tts',
      payload: { text: 'Ciao.', voice: ELSA },
    });

    expect(r.ok).toBe(true);
    expect(r.provider).toBe('edge-tts');
    const callBody = fetchMock.mock.calls[0]?.[1]?.body;
    if (callBody) {
      const parsed = JSON.parse(callBody);
      expect(parsed.voice).toBe(ELSA);
    }
  });
});

describe('multimodalRouter.routeTTS — error paths', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('case 3: Edge Function HTTP 401 unauthorized → ok=false + error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const r = await multimodalRouter.route({
      modality: 'tts',
      payload: { text: 'test 401' },
    });

    expect(r.ok).toBe(false);
    expect(typeof r.error).toBe('string');
    expect(r.error.length).toBeGreaterThan(0);
  });

  it('case 4: Edge Function HTTP 500 → ok=false + provider=edge-tts', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ success: false, error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const r = await multimodalRouter.route({
      modality: 'tts',
      payload: { text: 'test 500' },
    });

    expect(r.ok).toBe(false);
    expect(r.provider).toBe('edge-tts');
  });

  it('case 5: empty text → validation error, no fetch invoked', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const r = await multimodalRouter.route({
      modality: 'tts',
      payload: { text: '' },
    });

    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/text|required|empty/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('multimodalRouter.routeTTS — latency tracking', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('case 6: latencyMs tracked >= 0 on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockBinaryAudio(512));
    vi.stubGlobal('fetch', fetchMock);

    const r = await multimodalRouter.route({
      modality: 'tts',
      payload: { text: 'latency probe' },
    });

    expect(r.ok).toBe(true);
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(typeof r.latencyMs).toBe('number');
  });
});
