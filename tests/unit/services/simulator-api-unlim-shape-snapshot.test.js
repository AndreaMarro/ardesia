/**
 * simulator-api-unlim-shape-snapshot.test.js — Sprint 6 Day 38
 * Regression guard: shape snapshot for window.__ELAB_API.unlim.* namespace.
 * Closes Day 37 audit gap G6 (docs/audit/day-37-audit-2026-04-23.md §5).
 *
 * If a handler is removed or renamed, or the unlim namespace shape drifts,
 * this test fails loudly so the OpenClaw registry + the bridge stay in sync.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../src/data/experiments-index', () => ({
  findExperimentById: vi.fn(() => null),
  EXPERIMENTS_VOL1: { experiments: [] },
  EXPERIMENTS_VOL2: { experiments: [] },
  EXPERIMENTS_VOL3: { experiments: [] },
}));

vi.mock('../../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ message: 'ok' })),
  analyzeImage: vi.fn(() => Promise.resolve({ analysis: 'ok' })),
  compileCode: vi.fn(() => Promise.resolve({ hex: 'a' })),
}));

vi.mock('../../../src/services/unlimContextCollector', () => ({
  logError: vi.fn(),
}));

vi.mock('../../../src/utils/whiteboardScreenshot', () => ({
  captureWhiteboardScreenshot: vi.fn(() => Promise.resolve('data:image/png;base64,abc')),
}));

vi.mock('../../../src/services/voiceService', () => ({
  synthesizeSpeech: vi.fn(() => Promise.resolve(new ArrayBuffer(8))),
  playAudio: vi.fn(() => Promise.resolve({})),
  startRecording: vi.fn(() => Promise.resolve(true)),
  stopRecording: vi.fn(() => Promise.resolve(new Blob(['x']))),
  sendVoiceChat: vi.fn(() => Promise.resolve({ userText: 'ciao', response: 'ok' })),
  cancelRecording: vi.fn(),
  isRecording: vi.fn(() => false),
  unlockAudioPlayback: vi.fn(),
  stopPlayback: vi.fn(),
}));

vi.mock('../../../src/services/nudgeService', () => ({
  sendNudge: vi.fn(() => ({ id: 'x', timestamp: 'T' })),
}));

vi.mock('../../../src/services/projectHistoryService', () => ({
  default: {
    saveSnapshot: vi.fn(() => ({ id: 'p', snapshots: [] })),
    getTimeline: vi.fn(() => []),
    getStory: vi.fn(() => ''),
    listProjects: vi.fn(() => []),
    getProject: vi.fn(() => null),
  },
}));

import { registerSimulatorInstance, unregisterSimulatorInstance } from '../../../src/services/simulator-api.js';

// Sprint 6 Day 37 declared 9 OpenClaw handlers
const EXPECTED_SPRINT6_HANDLERS = [
  'speakTTS',
  'listenSTT',
  'saveSessionMemory',
  'recallPastSession',
  'showNudge',
  'generateQuiz',
  'exportFumetto',
  'videoLoad',
  'alertDocente',
];

// Pre-existing unlim surface (pre Sprint 6) + sendMessage bridge (2026-04-24)
const EXPECTED_LEGACY_HANDLERS = [
  'highlightComponent',
  'highlightPin',
  'clearHighlights',
  'serialWrite',
  'getCircuitState',
  'sendMessage',
  'setDiagnoseMode',
];

// Iter 83 Fumetto cliffhanger CTA needs the nested UNLIM bridge contract:
// window.__ELAB_API.unlim.mountExperiment(id).
const EXPECTED_ITER83_HANDLERS = ['mountExperiment'];

const EXPECTED_UNLIM_HANDLERS = [
  ...EXPECTED_LEGACY_HANDLERS,
  ...EXPECTED_SPRINT6_HANDLERS,
  ...EXPECTED_ITER83_HANDLERS,
];

const EXPECTED_UNLIM_META = ['version', 'info'];

describe('window.__ELAB_API.unlim — shape snapshot (regression guard)', () => {
  beforeEach(() => {
    registerSimulatorInstance({ getCircuitState: () => ({}) });
  });

  afterEach(() => {
    unregisterSimulatorInstance();
  });

  it('unlim namespace exists on global __ELAB_API', () => {
    expect(window.__ELAB_API).toBeTruthy();
    expect(window.__ELAB_API.unlim).toBeTruthy();
    expect(typeof window.__ELAB_API.unlim).toBe('object');
  });

  it.each(EXPECTED_UNLIM_HANDLERS)(
    'handler %s is a function on __ELAB_API.unlim (no drift)',
    (handlerName) => {
      expect(typeof window.__ELAB_API.unlim[handlerName]).toBe('function');
    },
  );

  it('no unexpected extra handlers were added without updating this snapshot', () => {
    const keys = Object.keys(window.__ELAB_API.unlim);
    const functionKeys = keys.filter((k) => typeof window.__ELAB_API.unlim[k] === 'function');
    // Every function-valued key must be in the expected set. If a new handler
    // is added, the dev MUST update EXPECTED_UNLIM_HANDLERS (forcing audit
    // + registry update at the same time).
    const unexpected = functionKeys.filter((k) => !EXPECTED_UNLIM_HANDLERS.includes(k));
    expect(unexpected).toEqual([]);
  });

  it('version field exists and matches Sprint 6 bump (1.1.0)', () => {
    expect(window.__ELAB_API.unlim.version).toBe('1.1.0');
  });

  it('info.sprint6Handlers matches 9 declared count', () => {
    expect(window.__ELAB_API.unlim.info).toBeTruthy();
    expect(window.__ELAB_API.unlim.info.sprint6Handlers).toBe(EXPECTED_SPRINT6_HANDLERS.length);
  });

  it.each(EXPECTED_UNLIM_META)(
    'meta field %s exists on unlim namespace',
    (metaField) => {
      expect(window.__ELAB_API.unlim).toHaveProperty(metaField);
    },
  );

  it('snapshot key count equals expected handlers + meta keys', () => {
    const keys = Object.keys(window.__ELAB_API.unlim);
    // If this fails, review docs/audit/day-37-audit-2026-04-23.md §5 G6 and
    // update EXPECTED_UNLIM_HANDLERS + EXPECTED_UNLIM_META atomically.
    expect(keys.length).toBe(EXPECTED_UNLIM_HANDLERS.length + EXPECTED_UNLIM_META.length);
  });

  it('handlers with error-branch return {ok:false,error:...} when called with empty input', async () => {
    const result = window.__ELAB_API.unlim.speakTTS('');
    const resolved = await Promise.resolve(result);
    expect(resolved).toMatchObject({ ok: false });
    expect(typeof resolved.error).toBe('string');
  });

  it('handlers with requestId event emission return {ok:true, requestId}', () => {
    const r = window.__ELAB_API.unlim.generateQuiz({ experimentId: 'x' });
    expect(r.ok).toBe(true);
    expect(typeof r.requestId).toBe('string');
    expect(r.requestId).toMatch(/^q_/);
  });
});
