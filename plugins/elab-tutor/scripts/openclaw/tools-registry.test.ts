import { describe, it, expect } from 'vitest';
import { OPENCLAW_TOOLS_REGISTRY, resolveStatus, ensureHandlerResolves, auditRegistry } from './tools-registry.ts';

describe('tools-registry invariants', () => {
  it('every ToolSpec has valid handler path shape', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      expect(spec.handler, `${spec.name} handler`).toMatch(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)?$/);
    }
  });

  it('every ToolSpec has non-empty effect description ≥ 10 chars', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      expect(spec.effect.length, `${spec.name} effect`).toBeGreaterThanOrEqual(10);
    }
  });

  it('every name is unique', () => {
    const names = OPENCLAW_TOOLS_REGISTRY.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('composite tools have composite_of with ≥2 entries', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'composite')) {
      expect(spec.composite_of, `${spec.name} composite_of`).toBeDefined();
      expect(spec.composite_of!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('todo_sett5 tools have added_in_sprint set (sett5 or sprint-6)', () => {
    // Both labels are semantically "will be added in upcoming sprint".
    // Accepted values match Sprint 5 retrospective language + Sprint 6 planning.
    for (const spec of OPENCLAW_TOOLS_REGISTRY.filter(t => resolveStatus(t) === 'todo_sett5')) {
      expect(spec.added_in_sprint).toBeDefined();
      expect(['sett5', 'sprint-6']).toContain(spec.added_in_sprint);
    }
  });

  it('params object keys are valid JS identifiers', () => {
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      for (const key of Object.keys(spec.params)) {
        expect(key, `${spec.name} param ${key}`).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      }
    }
  });

  it('resolveStatus defaults to live when no added_in_sprint', () => {
    const mock = { name: 'x', category: 'meta' as const, handler: 'foo', params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04' };
    expect(resolveStatus(mock)).toBe('live');
  });

  it('resolveStatus returns todo_sett5 when added_in_sprint="sett5"', () => {
    const mock = { name: 'x', category: 'meta' as const, handler: 'foo', params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04', added_in_sprint: 'sett5' };
    expect(resolveStatus(mock)).toBe('todo_sett5');
  });

  it('resolveStatus respects explicit status', () => {
    const mock = { name: 'x', category: 'meta' as const, handler: 'foo', status: 'composite' as const, params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04' };
    expect(resolveStatus(mock)).toBe('composite');
  });

  it('registry total ≥ 55 ToolSpec (post-Sprint-6 Day 38 Layer A expansion, target 80 Sprint 6 end)', () => {
    // Honest count verified 2026-04-23: 57 ToolSpec in registry.
    // Sprint 6 Day 38 added 15 Layer A tools (read + editor + UI) mirroring __ELAB_API flat surface.
    // Remaining path to 80: composite L1 tools (Day 39+) + vision/voice extensions.
    expect(OPENCLAW_TOOLS_REGISTRY.length).toBeGreaterThanOrEqual(55);
  });
});

describe('ensureHandlerResolves', () => {
  it('resolves flat handler on mock API', () => {
    const api = { addComponent: () => 'led1' };
    const spec = { name: 'x', category: 'circuit' as const, handler: 'addComponent', params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04' };
    expect(ensureHandlerResolves(spec, api).resolved).toBe(true);
  });

  it('resolves nested unlim.* handler', () => {
    const api = { unlim: { highlightComponent: () => undefined } };
    const spec = { name: 'x', category: 'circuit' as const, handler: 'unlim.highlightComponent', params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04' };
    expect(ensureHandlerResolves(spec, api).resolved).toBe(true);
  });

  it('reports broken path with reason', () => {
    const api = { foo: 42 };
    const spec = { name: 'x', category: 'circuit' as const, handler: 'foo.bar', params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04' };
    const result = ensureHandlerResolves(spec, api);
    expect(result.resolved).toBe(false);
    expect(result.reason).toMatch(/bar/);
  });

  it('composite tools return resolved=true without checking API', () => {
    const spec = { name: 'x', category: 'vision' as const, handler: 'unlim.analyzeImage', status: 'composite' as const, composite_of: ['a', 'b'], params: {}, effect: 'test effect', pz_v3_sensitive: false, since: '2026-04' };
    expect(ensureHandlerResolves(spec, {}).resolved).toBe(true);
  });
});

describe('auditRegistry', () => {
  it('returns balanced report sum = total', () => {
    const api = { addComponent: () => undefined, unlim: { highlightComponent: () => undefined } };
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    expect(report.live_ok + report.live_broken.length + report.todo + report.composite).toBe(report.total);
  });
});
