/**
 * simulator-api-events.test.js — Extended tests for simulator-api.js pub/sub + UNLIM bridge
 * Sprint T iter 28 — NEW FILE (distinct from existing simulator-api.test.js)
 *
 * Covers: event pub/sub on/off/emit, unlim bridge methods, getCircuitDescription,
 * getSimulationStatus, getBuildStepIndex, mountExperiment, getExperimentList format,
 * unregisterSimulatorInstance cleanup.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../src/data/experiments-index', () => ({
  findExperimentById: vi.fn((id) => {
    if (id === 'v1-cap6-esp1') return { id: 'v1-cap6-esp1', title: 'LED Test', volume: 1, chapter: 6 };
    if (id === 'v2-cap3-esp1') return { id: 'v2-cap3-esp1', title: 'Resistenza', volume: 2, chapter: 3 };
    return null;
  }),
  EXPERIMENTS_VOL1: {
    experiments: [
      { id: 'v1-cap6-esp1', title: 'LED Test', chapter: 6, difficulty: 1, simulationMode: 'dc', code: null, concept: 'LED' },
      { id: 'v1-cap7-esp1', title: 'LED RGB', chapter: 7, difficulty: 1, simulationMode: 'dc', code: null, concept: 'RGB' },
    ],
  },
  EXPERIMENTS_VOL2: {
    experiments: [
      { id: 'v2-cap3-esp1', title: 'Resistenza', chapter: 3, difficulty: 2, simulationMode: 'dc', code: 'void setup(){}', concept: 'Resistenza' },
    ],
  },
  EXPERIMENTS_VOL3: {
    experiments: [
      { id: 'v3-cap5-esp1', title: 'Arduino', chapter: 5, difficulty: 3, simulationMode: 'avr', code: 'void setup(){}', concept: 'Arduino' },
    ],
  },
}));

vi.mock('../../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ message: 'test' })),
  analyzeImage: vi.fn(() => Promise.resolve({ analysis: 'ok' })),
  compileCode: vi.fn(() => Promise.resolve({ success: true, hex: '0x' })),
}));

vi.mock('../../../src/utils/whiteboardScreenshot', () => ({
  captureWhiteboardScreenshot: vi.fn(() => ({ dataUrl: null })),
}));

vi.mock('../../../src/services/voiceService', () => ({
  synthesizeSpeech: vi.fn(() => Promise.resolve('audio-data')),
  playAudio: vi.fn(() => Promise.resolve()),
  startRecording: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('../../../src/services/nudgeService', () => ({
  sendNudge: vi.fn(),
}));

vi.mock('../../../src/services/projectHistoryService', () => ({
  default: { saveSnapshot: vi.fn() },
}));

vi.mock('../../../src/services/unlimContextCollector', () => ({
  logError: vi.fn(),
}));

import {
  registerSimulatorInstance,
  unregisterSimulatorInstance,
  emitSimulatorEvent,
} from '../../../src/services/simulator-api';

const mockSimulator = {
  selectExperiment: vi.fn(),
  getState: vi.fn(() => ({ running: false })),
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  getCircuitState: vi.fn(() => ({ components: [], connections: [], isSimulating: false })),
  getComponentStates: vi.fn(() => ({})),
  setHighlightedComponents: vi.fn(),
  setHighlightedPins: vi.fn(),
  serialWrite: vi.fn(),
  getEditorCode: vi.fn(() => null),
  setEditorCode: vi.fn(),
  getEditorMode: vi.fn(() => 'arduino'),
  isEditorVisible: vi.fn(() => false),
  getBuildMode: vi.fn(() => 'mounted'),
  getBuildStepIndex: vi.fn(() => -1),
  getSimulationStatus: vi.fn(() => 'stopped'),
  isSimulating: vi.fn(() => false),
  getCurrentExperiment: vi.fn(() => null),
  getCompilationSnapshot: vi.fn(() => ({})),
  addWire: vi.fn(),
  removeWire: vi.fn(),
  addComponent: vi.fn(() => 'comp-id'),
  removeComponent: vi.fn(),
  moveComponent: vi.fn(),
  clearAll: vi.fn(),
  interact: vi.fn(),
  setComponentValue: vi.fn(),
  getSelectedComponent: vi.fn(() => null),
  getComponentPositions: vi.fn(() => ({})),
  getLayout: vi.fn(() => ({})),
  getToolMode: vi.fn(() => 'select'),
  setToolMode: vi.fn(),
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  setBuildStepIndex: vi.fn(),
  resetBuildSteps: vi.fn(),
  showBom: vi.fn(),
  hideBom: vi.fn(),
  showSerialMonitor: vi.fn(),
  getExperimentOriginalCode: vi.fn(() => ''),
  appendEditorCode: vi.fn(),
  resetEditorCode: vi.fn(),
  getCurrentExperimentId: vi.fn(() => null),
  getPinStates: vi.fn(() => ({})),
  setHighlightMode: vi.fn(),
};

beforeEach(() => {
  delete window.__ELAB_API;
  delete window.__ELAB_EVENTS;
  vi.clearAllMocks();
});

afterEach(() => {
  unregisterSimulatorInstance();
});

// ─── Event pub/sub ─────────────────────────────────────────────────────

describe('simulatorAPI — event pub/sub', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('on registers a listener', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    emitSimulatorEvent('stateChange', { running: true });
    expect(cb).toHaveBeenCalledWith({ running: true });
  });

  it('on with same event registers multiple listeners', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    window.__ELAB_API.on('stateChange', cb1);
    window.__ELAB_API.on('stateChange', cb2);
    emitSimulatorEvent('stateChange', {});
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });

  it('off removes a listener', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    window.__ELAB_API.off('stateChange', cb);
    emitSimulatorEvent('stateChange', {});
    expect(cb).not.toHaveBeenCalled();
  });

  it('off for unknown event does not throw', () => {
    expect(() => window.__ELAB_API.off('unknownEvent', vi.fn())).not.toThrow();
  });

  it('emitting event with no listeners does not throw', () => {
    expect(() => emitSimulatorEvent('experimentChange', {})).not.toThrow();
  });

  it('listener receives correct event data', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('circuitChange', cb);
    const data = { componentId: 'led1', state: 'on' };
    emitSimulatorEvent('circuitChange', data);
    expect(cb).toHaveBeenCalledWith(data);
  });

  it('does not throw for null event data', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    expect(() => emitSimulatorEvent('stateChange', null)).not.toThrow();
  });
});

// ─── UNLIM bridge — highlightComponent ────────────────────────────────

describe('simulatorAPI — unlim.highlightComponent', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('accepts string ID', () => {
    window.__ELAB_API.unlim.highlightComponent('led1');
    expect(mockSimulator.setHighlightedComponents).toHaveBeenCalledWith(['led1']);
  });

  it('accepts array of IDs', () => {
    window.__ELAB_API.unlim.highlightComponent(['led1', 'r1']);
    expect(mockSimulator.setHighlightedComponents).toHaveBeenCalledWith(['led1', 'r1']);
  });

  it('converts single string to array', () => {
    window.__ELAB_API.unlim.highlightComponent('r1');
    const [arg] = mockSimulator.setHighlightedComponents.mock.calls[0];
    expect(Array.isArray(arg)).toBe(true);
  });
});

// ─── UNLIM bridge — clearHighlights ────────────────────────────────────

describe('simulatorAPI — unlim.clearHighlights', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('clears components highlights', () => {
    window.__ELAB_API.unlim.clearHighlights();
    expect(mockSimulator.setHighlightedComponents).toHaveBeenCalledWith([]);
  });

  it('clears pin highlights', () => {
    window.__ELAB_API.unlim.clearHighlights();
    expect(mockSimulator.setHighlightedPins).toHaveBeenCalledWith([]);
  });
});

// ─── UNLIM bridge — highlightPin ──────────────────────────────────────

describe('simulatorAPI — unlim.highlightPin', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('accepts single pin string', () => {
    window.__ELAB_API.unlim.highlightPin('nano:D13');
    expect(mockSimulator.setHighlightedPins).toHaveBeenCalledWith(['nano:D13']);
  });

  it('accepts array of pins', () => {
    window.__ELAB_API.unlim.highlightPin(['nano:D13', 'bat1:positive']);
    expect(mockSimulator.setHighlightedPins).toHaveBeenCalledWith(['nano:D13', 'bat1:positive']);
  });
});

// ─── simulation control ────────────────────────────────────────────────

describe('simulatorAPI — simulation control', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('play delegates to simulatorRef', () => {
    window.__ELAB_API.play();
    expect(mockSimulator.play).toHaveBeenCalled();
  });

  it('pause delegates to simulatorRef', () => {
    window.__ELAB_API.pause();
    expect(mockSimulator.pause).toHaveBeenCalled();
  });

  it('reset delegates to simulatorRef', () => {
    window.__ELAB_API.reset();
    expect(mockSimulator.reset).toHaveBeenCalled();
  });

  it('isSimulating returns false when not running', () => {
    mockSimulator.isSimulating.mockReturnValue(false);
    expect(window.__ELAB_API.isSimulating()).toBe(false);
  });

  it('getSimulationStatus returns stopped by default', () => {
    mockSimulator.getSimulationStatus.mockReturnValue('stopped');
    expect(window.__ELAB_API.getSimulationStatus()).toBe('stopped');
  });

  it('getBuildStepIndex returns -1 when not in step mode', () => {
    mockSimulator.getBuildStepIndex.mockReturnValue(-1);
    expect(window.__ELAB_API.getBuildStepIndex()).toBe(-1);
  });
});

// ─── experiment management ─────────────────────────────────────────────

describe('simulatorAPI — experiment management', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('getExperimentList returns vol1, vol2, vol3 keys', () => {
    const list = window.__ELAB_API.getExperimentList();
    expect(list).toHaveProperty('vol1');
    expect(list).toHaveProperty('vol2');
    expect(list).toHaveProperty('vol3');
  });

  it('getExperimentList vol1 has experiments', () => {
    const list = window.__ELAB_API.getExperimentList();
    expect(Array.isArray(list.vol1)).toBe(true);
    expect(list.vol1.length).toBeGreaterThan(0);
  });

  it('each experiment in list has id and title', () => {
    const list = window.__ELAB_API.getExperimentList();
    [...list.vol1, ...list.vol2, ...list.vol3].forEach(exp => {
      expect(exp).toHaveProperty('id');
      expect(exp).toHaveProperty('title');
    });
  });

  it('getExperiment returns null for unknown ID', () => {
    expect(window.__ELAB_API.getExperiment('nope')).toBeNull();
  });

  it('getExperiment returns experiment for known ID', () => {
    const exp = window.__ELAB_API.getExperiment('v1-cap6-esp1');
    expect(exp).not.toBeNull();
    expect(exp.title).toBe('LED Test');
  });

  it('loadExperiment returns false for unknown experiment', () => {
    const result = window.__ELAB_API.loadExperiment('nope');
    expect(result).toBe(false);
  });

  it('mountExperiment calls selectExperiment for known experiment', () => {
    window.__ELAB_API.mountExperiment('v1-cap6-esp1');
    expect(mockSimulator.selectExperiment).toHaveBeenCalled();
  });

  it('mountExperiment returns false for unknown experiment', () => {
    expect(window.__ELAB_API.mountExperiment('nope')).toBe(false);
  });
});

// ─── getCircuitDescription ────────────────────────────────────────────

describe('simulatorAPI — getCircuitDescription', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('returns default message when no circuit state', () => {
    mockSimulator.getCircuitState.mockReturnValue(null);
    expect(window.__ELAB_API.getCircuitDescription()).toBe('Nessun circuito caricato.');
  });

  it('returns empty circuit message when components are empty', () => {
    mockSimulator.getCircuitState.mockReturnValue({ components: [], connections: [] });
    expect(window.__ELAB_API.getCircuitDescription()).toContain('vuoto');
  });

  it('includes component names in Italian', () => {
    mockSimulator.getCircuitState.mockReturnValue({
      components: [{ type: 'led', id: 'led1', color: 'red', state: { on: true } }],
      connections: [],
      isSimulating: false,
    });
    const desc = window.__ELAB_API.getCircuitDescription();
    expect(desc).toContain('LED');
  });

  it('includes wire count in description', () => {
    mockSimulator.getCircuitState.mockReturnValue({
      components: [{ type: 'led', id: 'led1', state: {} }],
      connections: [{ from: 'led1:anode', to: 'bat1:positive' }],
      isSimulating: false,
    });
    const desc = window.__ELAB_API.getCircuitDescription();
    expect(desc).toContain('1 collegament');
  });

  it('indicates simulation running', () => {
    mockSimulator.getCircuitState.mockReturnValue({
      components: [{ type: 'led', id: 'led1', state: {} }],
      connections: [],
      isSimulating: true,
    });
    const desc = window.__ELAB_API.getCircuitDescription();
    expect(desc).toContain('Simulazione in corso');
  });
});

// ─── component manipulation ────────────────────────────────────────────

describe('simulatorAPI — component manipulation', () => {
  beforeEach(() => { registerSimulatorInstance(mockSimulator); });

  it('addComponent delegates to simulatorRef', () => {
    mockSimulator.addComponent.mockReturnValue('new-comp');
    const id = window.__ELAB_API.addComponent('led', { x: 100, y: 100 });
    expect(mockSimulator.addComponent).toHaveBeenCalledWith('led', { x: 100, y: 100 });
    expect(id).toBe('new-comp');
  });

  it('removeComponent delegates to simulatorRef', () => {
    window.__ELAB_API.removeComponent('led1');
    expect(mockSimulator.removeComponent).toHaveBeenCalledWith('led1');
  });

  it('moveComponent delegates to simulatorRef', () => {
    window.__ELAB_API.moveComponent('led1', 200, 300);
    expect(mockSimulator.moveComponent).toHaveBeenCalledWith('led1', 200, 300);
  });

  it('clearAll delegates to simulatorRef', () => {
    window.__ELAB_API.clearAll();
    expect(mockSimulator.clearAll).toHaveBeenCalled();
  });

  it('clearCircuit delegates to clearAll', () => {
    window.__ELAB_API.clearCircuit();
    expect(mockSimulator.clearAll).toHaveBeenCalled();
  });

  it('interact delegates to simulatorRef', () => {
    window.__ELAB_API.interact('btn1', 'press');
    expect(mockSimulator.interact).toHaveBeenCalledWith('btn1', 'press', undefined);
  });

  it('setComponentValue delegates to simulatorRef', () => {
    window.__ELAB_API.setComponentValue('r1', 'resistance', 470);
    expect(mockSimulator.setComponentValue).toHaveBeenCalledWith('r1', 'resistance', 470);
  });
});

// ─── unregisterSimulatorInstance cleanup ──────────────────────────────

describe('unregisterSimulatorInstance', () => {
  it('removes window.__ELAB_API', () => {
    registerSimulatorInstance(mockSimulator);
    unregisterSimulatorInstance();
    expect(window.__ELAB_API).toBeUndefined();
  });

  it('removes window.__ELAB_EVENTS', () => {
    registerSimulatorInstance(mockSimulator);
    unregisterSimulatorInstance();
    expect(window.__ELAB_EVENTS).toBeUndefined();
  });
});
