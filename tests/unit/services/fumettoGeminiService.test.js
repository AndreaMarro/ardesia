import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateFumettoDraftWithGemini } from '../../../src/services/fumettoGeminiService.js';

describe('fumettoGeminiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the unlim-fumetto Edge Function without exposing Gemini keys in the browser', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        draft: {
          storyline: { problem: 'problema reale' },
          panels: [],
          imagePrompts: [],
        },
        provider: 'gemini',
        model: 'gemini-2.5-flash',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generateFumettoDraftWithGemini({
      session: {
        experimentsCompleted: [{ id: 'v3-cap8-esp3', title: 'Dati sul Monitor Seriale', volume: 3 }],
        componentsUsed: ['Nano R4'],
        sessionStoryline: { anchors: ['Serial Monitor: luce=710'] },
      },
      endpoint: 'https://example.supabase.co/functions/v1/unlim-fumetto',
      anonKey: 'anon-public',
      elabKey: 'elab-public',
    });

    expect(result.ok).toBe(true);
    expect(result.provider).toBe('gemini');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.supabase.co/functions/v1/unlim-fumetto',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer anon-public',
          apikey: 'anon-public',
          'X-Elab-Api-Key': 'elab-public',
        }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.sessionEvidence.componentsUsed).toEqual(['Nano R4']);
    expect(body.sessionEvidence.sessionStoryline.anchors.join(' ')).toMatch(/Serial Monitor: luce=710/i);
    expect(JSON.stringify(fetchMock.mock.calls[0][1])).not.toMatch(/GEMINI|AIza|GOOGLE_GENERATIVE/i);
  });

  it('sends a lean evidence pack to Gemini, dropping bloated runtime context', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        draft: { storyline: {}, panels: [], imagePrompts: [] },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const bloatedSnapshot = {
      ts: 1779459232617,
      reason: 'periodic-15s',
      editorCodePreview: 'void setup(){}\nvoid loop(){}',
      circuitDescription: 'Esperimento ridondante. '.repeat(30),
      narrativeLine: 'riga narrativa ripetuta e ridondante. '.repeat(20),
    };

    await generateFumettoDraftWithGemini({
      session: {
        experimentsCompleted: [{ id: 'v3-cap8-esp3', title: 'Monitor Seriale', volume: 3 }],
        componentsUsed: ['Nano R4', 'Trimmer 10 kOhm'],
        sessionContext: {
          editorMode: 'arduino',
          buildStep: { current: 2, total: 6, phase: 'verifica' },
          compilation: { success: true, size: 38120 },
          circuitDescription: 'Nano R4 con trimmer sul kit fisico.',
          applicationNarrative: Array.from({ length: 6 }, () => bloatedSnapshot),
          unlimSharedState: {
            revision: 57,
            recentEvents: Array.from({ length: 4 }, () => bloatedSnapshot),
            latestSnapshot: bloatedSnapshot,
          },
          agentDecisionSeed: { reply: { needed: true }, act: {}, diagnose: {}, rag: {} },
        },
      },
      endpoint: 'https://example.supabase.co/functions/v1/unlim-fumetto',
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const ctx = body.sessionEvidence.sessionContext;
    // Bloated, low-signal runtime fields must not reach Gemini.
    expect(ctx.applicationNarrative).toBeUndefined();
    expect(ctx.unlimSharedState).toBeUndefined();
    expect(ctx.agentDecisionSeed).toBeUndefined();
    // Distilled signal must survive the trim.
    expect(ctx.editorMode).toBe('arduino');
    expect(ctx.buildStep).toEqual({ current: 2, total: 6, phase: 'verifica' });
    expect(ctx.compilation).toEqual({ success: true, size: 38120 });
    // The whole pack stays small enough for a reliable Gemini round-trip.
    expect(JSON.stringify(body.sessionEvidence).length).toBeLessThan(4000);
  });

  it('returns ok=false when Gemini draft generation is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ success: false, error: 'Gemini fumetto unavailable' }),
    }));

    const result = await generateFumettoDraftWithGemini({
      session: { experimentsCompleted: [] },
      endpoint: 'https://example.supabase.co/functions/v1/unlim-fumetto',
    });

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Gemini fumetto unavailable|http 503/i);
  });
});
