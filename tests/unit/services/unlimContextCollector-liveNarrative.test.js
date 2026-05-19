import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../src/utils/logger', () => ({
  default: { debug: vi.fn(), warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import {
  captureApplicationSnapshot,
  collectFullContext,
  getApplicationSnapshots,
  getLatestVisualSnapshotImage,
  resetApplicationNarrativeForTests,
  startApplicationNarrativeLoop,
  stopApplicationNarrativeLoop,
} from '../../../src/services/unlimContextCollector.js';

describe('unlimContextCollector live narrative snapshots', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetApplicationNarrativeForTests();
    sessionStorage.clear();
    window.__ELAB_API = {
      getSimulatorContext: vi.fn(() => ({
        experiment: { id: 'v3-cap6-semaforo', name: 'Semaforo' },
        buildStep: { current: 2, total: 5 },
        editorMode: 'scratch',
        editorVisible: true,
        components: [{ id: 'led1', type: 'led' }],
        wires: [{ from: 'led1:anode', to: 'nano:D13' }],
        simulation: { state: 'stopped' },
      })),
      getCircuitDescription: vi.fn(() => 'LED su D13 con resistenza.'),
      getEditorCode: vi.fn(() => 'void setup(){} void loop(){}'),
      captureScreenshot: vi.fn(async () => 'data:image/png;base64,abc123'),
    };
  });

  afterEach(() => {
    resetApplicationNarrativeForTests();
    delete window.__ELAB_API;
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it('captures simulator data and visual evidence in parallel into a compact ring buffer', async () => {
    const snapshot = await captureApplicationSnapshot({ includeVisual: true, reason: 'unit-test' });

    expect(snapshot.reason).toBe('unit-test');
    expect(snapshot.experimentId).toBe('v3-cap6-semaforo');
    expect(snapshot.visual).toEqual({ available: true, source: 'app-screenshot' });
    expect(window.__ELAB_API.captureScreenshot).toHaveBeenCalledTimes(1);
    expect(getLatestVisualSnapshotImage()).toEqual({ dataUrl: 'data:image/png;base64,abc123', mimeType: 'image/png' });
    expect(getApplicationSnapshots()).toHaveLength(1);
  });

  it('adds recent narrative snapshots to collectFullContext without embedding base64 images', async () => {
    await captureApplicationSnapshot({ includeVisual: true, reason: 'unit-test' });

    const context = collectFullContext();

    expect(context.applicationNarrative).toHaveLength(1);
    expect(context.applicationNarrative[0]).toMatchObject({
      experimentId: 'v3-cap6-semaforo',
      componentsCount: 1,
      wiresCount: 1,
      hasVisualSnapshot: true,
    });
    expect(JSON.stringify(context.applicationNarrative)).not.toContain('abc123');
  });

  it('starts one idempotent 15s loop and stops it cleanly', async () => {
    startApplicationNarrativeLoop({ intervalMs: 15000, includeVisual: true });
    startApplicationNarrativeLoop({ intervalMs: 15000, includeVisual: true });

    await vi.advanceTimersByTimeAsync(15000);
    expect(window.__ELAB_API.getSimulatorContext).toHaveBeenCalledTimes(1);

    stopApplicationNarrativeLoop();
    await vi.advanceTimersByTimeAsync(30000);
    expect(window.__ELAB_API.getSimulatorContext).toHaveBeenCalledTimes(1);
  });
});
