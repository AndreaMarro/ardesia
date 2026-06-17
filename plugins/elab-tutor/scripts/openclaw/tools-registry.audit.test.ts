import { describe, it, expect } from 'vitest';
import { OPENCLAW_TOOLS_REGISTRY, auditRegistry, resolveStatus } from './tools-registry.ts';
import { buildFullMockApi } from './__mocks__/elab-api-mock.ts';

describe('auditRegistry against mock __ELAB_API', () => {
  it('all live tools resolve to function on mock API', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    if (report.live_broken.length > 0) {
      console.error('Broken handlers:', JSON.stringify(report.live_broken, null, 2));
    }
    expect(report.live_broken).toEqual([]);
  });

  it('sum of (live_ok + todo + composite + broken) equals total', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    expect(report.live_ok + report.todo + report.composite + report.live_broken.length).toBe(report.total);
  });

  it('reports at least 1 composite tool (analyzeImage)', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    expect(report.composite).toBeGreaterThanOrEqual(1);
  });

  it('Sprint 6 Day 37: all 9 added_in_sprint="sprint-6" handlers wired live (zero todo_sett5 among them)', () => {
    const sprint6 = OPENCLAW_TOOLS_REGISTRY.filter(t => t.added_in_sprint === 'sprint-6');
    expect(sprint6.length).toBe(9);
    const stillTodo = sprint6.filter(t => resolveStatus(t) === 'todo_sett5');
    expect(stillTodo).toEqual([]);
  });

  it('total todo_sett5 count bounded (toggleDrawing still pending separate work)', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    // Post Day 37: only toggleDrawing (added_in_sprint: 'sett5') remains.
    expect(report.todo).toBeLessThanOrEqual(2);
  });

  it('majority of tools are live (≥60% live_ok post-fix)', () => {
    const api = buildFullMockApi();
    const report = auditRegistry(api, OPENCLAW_TOOLS_REGISTRY);
    expect(report.live_ok / report.total).toBeGreaterThanOrEqual(0.6);
  });

  it('no live handler points to unlim.X when X not in real surface (Sprint-5 + Sprint-6 Day 37 wired set)', () => {
    const realUnlimMethods = new Set([
      // Sprint-5 base (5)
      'highlightComponent', 'highlightPin', 'clearHighlights', 'serialWrite', 'getCircuitState',
      // Sprint-6 Day 37 wired (9)
      'speakTTS', 'listenSTT', 'saveSessionMemory', 'recallPastSession',
      'showNudge', 'generateQuiz', 'exportFumetto', 'videoLoad', 'alertDocente',
    ]);
    const offenders: string[] = [];
    for (const spec of OPENCLAW_TOOLS_REGISTRY) {
      if (resolveStatus(spec) !== 'live') continue;
      if (!spec.handler.startsWith('unlim.')) continue;
      const method = spec.handler.slice('unlim.'.length);
      if (!realUnlimMethods.has(method)) {
        offenders.push(`${spec.name} → ${spec.handler}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
