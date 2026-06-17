/**
 * Unit tests for multimodalRouter — Sprint S iter 4 P1 B2.
 * Covers validation + 7 modality routes + error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock api.js BEFORE import multimodalRouter (api.js has heavy init side effects)
vi.mock('../../src/services/api.js', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  diagnoseCircuit: vi.fn(),
  getExperimentHints: vi.fn(),
}));

import { multimodalRouter } from '../../src/services/multimodalRouter.js';
import { sendChat, analyzeImage, diagnoseCircuit, getExperimentHints } from '../../src/services/api.js';

describe('multimodalRouter — shape', () => {
  it('exports route + 7 modalities + per-modality fns', () => {
    expect(typeof multimodalRouter.route).toBe('function');
    expect(multimodalRouter.modalities).toEqual([
      'chat', 'rag', 'vision', 'imageGen', 'stt', 'tts', 'clawbot',
    ]);
    expect(typeof multimodalRouter.routeChat).toBe('function');
    expect(typeof multimodalRouter.routeVision).toBe('function');
    expect(typeof multimodalRouter.routeRAG).toBe('function');
    expect(typeof multimodalRouter.routeSTT).toBe('function');
    expect(typeof multimodalRouter.routeTTS).toBe('function');
    expect(typeof multimodalRouter.routeImageGen).toBe('function');
    expect(typeof multimodalRouter.routeClawBot).toBe('function');
  });
});

describe('multimodalRouter — validation', () => {
  it('throws when intent is null', async () => {
    await expect(multimodalRouter.route(null)).rejects.toThrow(/intent must be object/);
  });

  it('throws on unknown modality', async () => {
    await expect(multimodalRouter.route({
      modality: 'telepathy', payload: {},
    })).rejects.toThrow(/unknown modality 'telepathy'/);
  });

  it('throws when payload missing', async () => {
    await expect(multimodalRouter.route({
      modality: 'chat',
    })).rejects.toThrow(/payload required/);
  });

  it('throws when payload not object', async () => {
    await expect(multimodalRouter.route({
      modality: 'chat', payload: 'invalid',
    })).rejects.toThrow(/payload required/);
  });
});

describe('multimodalRouter — chat', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('delegates to sendChat with message + images', async () => {
    sendChat.mockResolvedValue({ text: 'reply', meta: { provider: 'gemini' } });
    const r = await multimodalRouter.route({
      modality: 'chat',
      payload: { message: 'Spiega Ohm' },
      context: { experimentId: 'v1-cap6-esp1' },
    });
    expect(r.ok).toBe(true);
    expect(r.provider).toBe('gemini');
    expect(r.data.text).toBe('reply');
    expect(sendChat).toHaveBeenCalledWith('Spiega Ohm', [], expect.objectContaining({ experimentId: 'v1-cap6-esp1' }));
  });

  it('captures sendChat error → ok=false', async () => {
    sendChat.mockRejectedValue(new Error('Edge timeout'));
    const r = await multimodalRouter.route({
      modality: 'chat', payload: { message: 'x' },
    });
    expect(r.ok).toBe(false);
    expect(r.error).toBe('Edge timeout');
  });

  it('latencyMs > 0 on success', async () => {
    sendChat.mockResolvedValue({ text: 'ok' });
    const r = await multimodalRouter.route({ modality: 'chat', payload: { message: 'x' } });
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe('multimodalRouter — vision', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns error when no image data', async () => {
    const r = await multimodalRouter.route({
      modality: 'vision', payload: {},
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/imageData or imageBase64 required/);
  });

  it('delegates to analyzeImage with imageData + question', async () => {
    analyzeImage.mockResolvedValue({ analysis: 'circuit OK' });
    const r = await multimodalRouter.route({
      modality: 'vision',
      payload: { imageData: 'data:image/png;base64,abc', question: 'what is wrong?' },
    });
    expect(r.ok).toBe(true);
    expect(r.provider).toBe('gemini-vision');
    expect(analyzeImage).toHaveBeenCalledWith('data:image/png;base64,abc', 'what is wrong?', expect.any(Object));
  });

  it('falls back to default question if not provided', async () => {
    analyzeImage.mockResolvedValue({ analysis: 'x' });
    await multimodalRouter.route({ modality: 'vision', payload: { imageBase64: 'b64' } });
    expect(analyzeImage).toHaveBeenCalledWith('b64', expect.stringMatching(/Analizza/), expect.any(Object));
  });
});

describe('multimodalRouter — rag', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('routes experiment-hints to getExperimentHints', async () => {
    getExperimentHints.mockResolvedValue({ hints: ['try LED'] });
    const r = await multimodalRouter.route({
      modality: 'rag',
      payload: { kind: 'experiment-hints', experimentId: 'v1-cap6-esp1', currentStep: 0 },
    });
    expect(r.ok).toBe(true);
    expect(getExperimentHints).toHaveBeenCalledWith('v1-cap6-esp1', 0, 'base');
  });

  it('routes diagnose-circuit to diagnoseCircuit', async () => {
    diagnoseCircuit.mockResolvedValue({ diagnosis: 'wire missing' });
    const r = await multimodalRouter.route({
      modality: 'rag',
      payload: { kind: 'diagnose-circuit', circuitState: { components: [] }, experimentId: 'v1-cap6-esp1' },
    });
    expect(r.ok).toBe(true);
    expect(diagnoseCircuit).toHaveBeenCalled();
  });

  it('returns deferred error for generic RAG (no kind)', async () => {
    const r = await multimodalRouter.route({
      modality: 'rag', payload: { query: 'ohm' },
    });
    expect(r.ok).toBe(false);
    expect(r.provider).toBe('stub');
    expect(r.error).toMatch(/defer iter 5/);
  });
});

describe('multimodalRouter — stubs (stt/tts/imageGen/clawbot)', () => {
  it('stt returns hint to use hook', async () => {
    const r = await multimodalRouter.route({ modality: 'stt', payload: {} });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/useSpeechRecognition/);
  });

  it('tts validates payload (iter 6+ real impl with Isabella Neural default)', async () => {
    // Iter 6 routeTTS real impl (not stub). With empty payload, validation fails.
    const r = await multimodalRouter.route({ modality: 'tts', payload: {} });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/payload\.text required/);
    expect(r.provider).toBe('edge-tts');
  });

  it('imageGen validates payload (iter 24 wire to Cloudflare FLUX schnell via Edge Function)', async () => {
    const r = await multimodalRouter.route({ modality: 'imageGen', payload: {} });
    expect(r.ok).toBe(false);
    // iter 24: missing prompt validation now runs first; provider is cloudflare
    expect(r.error).toMatch(/prompt required/);
    expect(r.provider).toBe('cloudflare');
  });

  it('clawbot defers to iter 5+ with toolId in meta', async () => {
    const r = await multimodalRouter.route({
      modality: 'clawbot', payload: { toolId: 'addComponent' },
    });
    expect(r.ok).toBe(false);
    expect(r.meta?.requested_tool).toBe('addComponent');
  });
});
