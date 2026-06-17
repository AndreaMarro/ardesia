/**
 * Unit tests for openclaw dispatcher — Sprint S iter 4 P1 B3.
 * Covers 6 dispatch outcomes + audit + handler resolution edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { dispatch, auditDispatcher, _resetDispatcherCache } from './dispatcher.ts';

describe('dispatcher — registry lookup', () => {
  beforeEach(() => { _resetDispatcherCache(); });

  it('returns unknown_tool for non-registered toolId', async () => {
    const r = await dispatch('totally_fake_tool_xyz', {}, {});
    expect(r.status).toBe('unknown_tool');
    expect(r.error).toMatch(/not in OPENCLAW_TOOLS_REGISTRY/);
  });

  it('returns todo_sett5 for tools with explicit status=todo_sett5 (e.g. toggleDrawing)', async () => {
    const r = await dispatch('toggleDrawing', {}, { api: {} });
    expect(r.status).toBe('todo_sett5');
    expect(r.error).toMatch(/handler not yet implemented/);
  });

  it('returns todo_sett5 for composite tools (defer iter 5+)', async () => {
    const r = await dispatch('analyzeImage', {}, { api: { captureScreenshot: () => null } });
    expect(r.status).toBe('todo_sett5');
    expect(r.meta?.composite_of).toBeDefined();
  });
});

describe('dispatcher — handler resolution', () => {
  beforeEach(() => { _resetDispatcherCache(); });

  it('returns unresolved_handler when no api context', async () => {
    const r = await dispatch('addComponent', { type: 'led' }, {});
    expect(r.status).toBe('unresolved_handler');
    expect(r.error).toMatch(/no api context/);
  });

  it('returns unresolved_handler when handler missing on api', async () => {
    const r = await dispatch('addComponent', { type: 'led' }, { api: { somethingElse: () => 'x' } });
    expect(r.status).toBe('unresolved_handler');
  });

  it('returns ok when flat handler resolves + executes', async () => {
    const api = {
      addComponent: (args: Record<string, unknown>) => ({ ok: true, type: args.type }),
    };
    const r = await dispatch('addComponent', { type: 'led' }, { api });
    expect(r.status).toBe('ok');
    expect(r.data).toEqual({ ok: true, type: 'led' });
  });

  it('handles namespace handler unlim.X with correct this binding', async () => {
    const api = {
      unlim: {
        _state: 'cleared',
        highlightComponent: function (args: { ids: string[] }) {
          return { highlighted: args.ids, state: this._state };
        },
      },
    };
    const r = await dispatch('highlight', { ids: ['led1'] }, { api });
    expect(r.status).toBe('ok');
    expect((r.data as { state: string }).state).toBe('cleared');
  });

  it('captures handler error → status=error', async () => {
    const api = {
      addComponent: () => { throw new Error('handler boom'); },
    };
    const r = await dispatch('addComponent', {}, { api });
    expect(r.status).toBe('error');
    expect(r.error).toBe('handler boom');
  });

  it('handles async handler resolution', async () => {
    const api = {
      addComponent: async (args: Record<string, unknown>) => {
        await new Promise(r => setTimeout(r, 1));
        return { async_ok: args };
      },
    };
    const r = await dispatch('addComponent', { type: 'r' }, { api });
    expect(r.status).toBe('ok');
    expect((r.data as { async_ok: unknown }).async_ok).toEqual({ type: 'r' });
  });
});

describe('dispatcher — PZ v3 validation (warn-only iter 4)', () => {
  beforeEach(() => { _resetDispatcherCache(); });

  it('emits pz_warnings for sensitive tools but does NOT block (warn mode)', async () => {
    // mountExperiment is pz_v3_sensitive=true (changes class view)
    const api = {
      mountExperiment: (args: Record<string, unknown>) => ({ mounted: args.experimentId }),
    };
    const r = await dispatch('mountExperiment', { experimentId: 'v1-cap6-esp1' }, { api, pz_mode: 'warn' });
    expect(r.status).toBe('ok');
    expect(r.pz_warnings).toBeDefined();
    expect(r.pz_warnings && r.pz_warnings.length).toBeGreaterThan(0);
  });

  it('blocks PZ-sensitive when pz_mode=block', async () => {
    const api = {
      mountExperiment: (args: Record<string, unknown>) => ({ mounted: args }),
    };
    const r = await dispatch('mountExperiment', { experimentId: 'v1-cap6-esp1' }, { api, pz_mode: 'block' });
    expect(r.status).toBe('blocked_pz');
    expect(r.error).toMatch(/PZ v3 block/);
  });

  it('skips PZ check when validate_pz=false', async () => {
    const api = {
      mountExperiment: (args: Record<string, unknown>) => ({ mounted: args }),
    };
    const r = await dispatch('mountExperiment', { experimentId: 'x' }, { api, pz_mode: 'block', validate_pz: false });
    expect(r.status).toBe('ok');
    expect(r.pz_warnings).toEqual([]);
  });
});

describe('dispatcher — auditDispatcher', () => {
  it('returns counts for live_resolved + todo_sett5 + composite', () => {
    const api = {
      addComponent: () => null,
      getCurrentExperiment: () => null,
    };
    const a = auditDispatcher(api);
    expect(a.total).toBeGreaterThan(0);
    expect(a.todo_sett5).toBeGreaterThan(0);
    expect(a.composite).toBeGreaterThanOrEqual(0);
    // 2 known tools resolved
    expect(a.live_resolved).toBeGreaterThanOrEqual(2);
  });

  it('reports live_unresolved with reasons when api empty', () => {
    const a = auditDispatcher({});
    expect(a.live_resolved).toBe(0);
    expect(a.live_unresolved.length).toBeGreaterThan(0);
    expect(a.live_unresolved[0]).toHaveProperty('name');
    expect(a.live_unresolved[0]).toHaveProperty('reason');
  });
});

describe('dispatcher — latency tracking', () => {
  beforeEach(() => { _resetDispatcherCache(); });

  it('reports latency_ms ≥ 0 on success', async () => {
    const api = { addComponent: () => 'ok' };
    const r = await dispatch('addComponent', {}, { api });
    expect(r.latency_ms).toBeGreaterThanOrEqual(0);
  });

  it('reports latency_ms ≥ 0 on unknown_tool fast path', async () => {
    const r = await dispatch('nonexistent', {}, {});
    expect(r.latency_ms).toBeGreaterThanOrEqual(0);
  });
});
