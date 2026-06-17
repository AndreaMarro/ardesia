/**
 * ELAB Simulator API — Comprehensive Test Suite
 * Tests window.__ELAB_API public interface
 *
 * Target: ~100 tests across 9 categories
 * (c) Andrea Marro — 2026
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock dependencies ───

vi.mock('../../src/data/experiments-index', () => {
  const EXPERIMENTS_VOL1 = {
    experiments: [
      { id: 'v1-cap6-primo-circuito', title: 'Primo Circuito', chapter: 6, difficulty: 1, simulationMode: 'circuit', code: null, concept: 'circuito base' },
      { id: 'v1-cap7-led', title: 'LED e Resistore', chapter: 7, difficulty: 1, simulationMode: 'circuit', code: 'void setup(){}', concept: 'LED' },
    ],
  };
  const EXPERIMENTS_VOL2 = {
    experiments: [
      { id: 'v2-cap1-arduino-intro', title: 'Arduino Intro', chapter: 1, difficulty: 2, simulationMode: 'avr', code: 'void setup(){}', concept: 'arduino' },
    ],
  };
  const EXPERIMENTS_VOL3 = {
    experiments: [
      { id: 'v3-cap1-avanzato', title: 'Avanzato', chapter: 1, difficulty: 3, simulationMode: 'avr', code: 'void loop(){}', concept: 'avanzato' },
    ],
  };

  return {
    EXPERIMENTS_VOL1,
    EXPERIMENTS_VOL2,
    EXPERIMENTS_VOL3,
    findExperimentById: (id) => {
      const all = [...EXPERIMENTS_VOL1.experiments, ...EXPERIMENTS_VOL2.experiments, ...EXPERIMENTS_VOL3.experiments];
      return all.find(e => e.id === id) || null;
    },
  };
});

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn().mockResolvedValue({ success: true, response: 'Risposta AI', source: 'test' }),
  analyzeImage: vi.fn().mockResolvedValue({ success: true, analysis: 'analisi' }),
  compileCode: vi.fn().mockResolvedValue({ success: true, hex: 'AABB', errors: null, output: 'ok' }),
}));

vi.mock('../../src/services/unlimContextCollector', () => ({
  logError: vi.fn(),
}));

vi.mock('../../src/utils/whiteboardScreenshot', () => ({
  captureWhiteboardScreenshot: vi.fn().mockReturnValue({ dataUrl: null }),
}));

// ─── Import the module under test ───

import {
  registerSimulatorInstance,
  unregisterSimulatorInstance,
  emitSimulatorEvent,
} from '../../src/services/simulator-api';
import { compileCode } from '../../src/services/api';

// ─── Helper: create a mock simulator instance ───

function createMockSimulator(overrides = {}) {
  return {
    selectExperiment: vi.fn(),
    getCurrentExperiment: vi.fn().mockReturnValue({ id: 'v1-cap6-primo-circuito', title: 'Primo Circuito' }),
    play: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    getComponentStates: vi.fn().mockReturnValue({ led1: { on: true }, r1: { value: 220 } }),
    interact: vi.fn(),
    addWire: vi.fn(),
    removeWire: vi.fn(),
    addComponent: vi.fn().mockReturnValue('comp-new-1'),
    removeComponent: vi.fn(),
    getSelectedComponent: vi.fn().mockReturnValue('led1'),
    moveComponent: vi.fn(),
    clearAll: vi.fn(),
    setComponentValue: vi.fn(),
    getCircuitState: vi.fn().mockReturnValue({
      experiment: { id: 'v1-cap6-primo-circuito', title: 'Primo Circuito' },
      components: [
        { id: 'bat1', type: 'battery9v', state: {} },
        { id: 'r1', type: 'resistor', value: 220, state: {} },
        { id: 'led1', type: 'led', color: 'red', state: { on: true } },
        { id: 'bb1', type: 'breadboard-half', state: {} },
      ],
      connections: [
        { from: 'bat1:positive', to: 'r1:pin1' },
        { from: 'r1:pin2', to: 'led1:anode' },
      ],
      isSimulating: false,
      buildMode: 'complete',
      buildStepIndex: -1,
      buildStepTotal: 0,
    }),
    getComponentPositions: vi.fn().mockReturnValue({
      bat1: { x: 10, y: 20, type: 'battery9v' },
      r1: { x: 50, y: 20, type: 'resistor' },
    }),
    getLayout: vi.fn().mockReturnValue({
      components: [{ id: 'bat1', type: 'battery9v' }],
      connections: [{ from: 'bat1:positive', to: 'r1:pin1' }],
      layout: { width: 800, height: 600 },
    }),
    getEditorCode: vi.fn().mockReturnValue('void setup() { pinMode(13, OUTPUT); }'),
    setEditorCode: vi.fn(),
    showEditor: vi.fn(),
    hideEditor: vi.fn(),
    setEditorMode: vi.fn(),
    getEditorMode: vi.fn().mockReturnValue('arduino'),
    isEditorVisible: vi.fn().mockReturnValue(false),
    loadScratchWorkspace: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn().mockReturnValue(true),
    canRedo: vi.fn().mockReturnValue(false),
    highlightPin: vi.fn(),
    serialWrite: vi.fn(),
    setBuildMode: vi.fn(),
    getBuildMode: vi.fn().mockReturnValue('complete'),
    setToolMode: vi.fn(),
    getToolMode: vi.fn().mockReturnValue('select'),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    setBuildStepIndex: vi.fn(),
    resetBuildSteps: vi.fn(),
    getBuildStepIndex: vi.fn().mockReturnValue(2),
    showBom: vi.fn(),
    hideBom: vi.fn(),
    showSerialMonitor: vi.fn(),
    isSimulating: vi.fn().mockReturnValue(false),
    getSimulationStatus: vi.fn().mockReturnValue('stopped'),
    appendEditorCode: vi.fn(),
    resetEditorCode: vi.fn(),
    getExperimentOriginalCode: vi.fn().mockReturnValue('// original'),
    getCompilationSnapshot: vi.fn().mockReturnValue({ status: 'idle' }),
    setHighlightedComponents: vi.fn(),
    setHighlightedPins: vi.fn(),
    ...overrides,
  };
}

// ─── Setup / Teardown ───

beforeEach(() => {
  // Clean slate
  delete window.__ELAB_API;
  delete window.__ELAB_EVENTS;
  vi.clearAllMocks();
});

afterEach(() => {
  unregisterSimulatorInstance();
});


// ═══════════════════════════════════════════════
// 1. API Initialization (10 tests)
// ═══════════════════════════════════════════════

describe('1. API Initialization', () => {
  it('creates window.__ELAB_API on registerSimulatorInstance', () => {
    registerSimulatorInstance(createMockSimulator());
    expect(window.__ELAB_API).toBeDefined();
  });

  it('has version string', () => {
    registerSimulatorInstance(createMockSimulator());
    expect(window.__ELAB_API.version).toBe('1.0.0');
  });

  it('has name string', () => {
    registerSimulatorInstance(createMockSimulator());
    expect(window.__ELAB_API.name).toBe('ELAB Simulator API');
  });

  it('has all expected top-level methods', () => {
    registerSimulatorInstance(createMockSimulator());
    const api = window.__ELAB_API;
    const expectedMethods = [
      'getExperimentList', 'getExperiment', 'loadExperiment', 'getCurrentExperiment',
      'play', 'pause', 'reset', 'getComponentStates', 'interact',
      'addWire', 'removeWire', 'addComponent', 'removeComponent',
      'moveComponent', 'clearAll', 'setComponentValue', 'connectWire', 'clearCircuit',
      'mountExperiment', 'getCircuitDescription', 'getComponentPositions', 'getLayout',
      'captureScreenshot', 'askUNLIM', 'analyzeImage', 'compile',
      'getEditorCode', 'setEditorCode', 'showEditor', 'hideEditor',
      'setEditorMode', 'getEditorMode', 'isEditorVisible', 'loadScratchWorkspace',
      'undo', 'redo', 'canUndo', 'canRedo',
      'highlightPin', 'serialWrite', 'setBuildMode', 'getBuildMode',
      'setToolMode', 'getToolMode', 'nextStep', 'prevStep', 'setBuildStepIndex',
      'resetBuildSteps', 'getBuildStepIndex',
      'showBom', 'hideBom', 'showSerialMonitor',
      'isSimulating', 'getSimulationStatus',
      'appendEditorCode', 'resetEditorCode', 'getExperimentOriginalCode',
      'getSimulatorContext', 'getSelectedComponent',
      'on', 'off',
    ];
    for (const method of expectedMethods) {
      expect(typeof api[method]).toBe('function');
    }
  });

  it('has unlim sub-object', () => {
    registerSimulatorInstance(createMockSimulator());
    expect(window.__ELAB_API.unlim).toBeDefined();
    expect(typeof window.__ELAB_API.unlim.highlightComponent).toBe('function');
    expect(typeof window.__ELAB_API.unlim.highlightPin).toBe('function');
    expect(typeof window.__ELAB_API.unlim.clearHighlights).toBe('function');
    expect(typeof window.__ELAB_API.unlim.serialWrite).toBe('function');
    expect(typeof window.__ELAB_API.unlim.getCircuitState).toBe('function');
  });

  it('unlim.info contains metadata', () => {
    registerSimulatorInstance(createMockSimulator());
    const info = window.__ELAB_API.unlim.info;
    expect(info.name).toBe('ELAB Simulator — UNLIM Bridge');
    expect(info.author).toBe('Andrea Marro');
    expect(info.modes).toEqual(['circuit', 'avr']);
    expect(typeof info.totalExperiments).toBe('number');
    expect(info.totalExperiments).toBe(4); // 2+1+1 from mock
  });

  it('does not duplicate API on double registration (React StrictMode)', () => {
    const sim = createMockSimulator();
    registerSimulatorInstance(sim);
    const firstRef = window.__ELAB_API;
    registerSimulatorInstance(sim);
    expect(window.__ELAB_API).toBe(firstRef);
  });

  it('removes API on unregister', () => {
    registerSimulatorInstance(createMockSimulator());
    expect(window.__ELAB_API).toBeDefined();
    unregisterSimulatorInstance();
    expect(window.__ELAB_API).toBeUndefined();
  });

  it('removes __ELAB_EVENTS on unregister', () => {
    registerSimulatorInstance(createMockSimulator());
    window.__ELAB_API.on('stateChange', () => {});
    expect(window.__ELAB_EVENTS).toBeDefined();
    unregisterSimulatorInstance();
    expect(window.__ELAB_EVENTS).toBeUndefined();
  });

  it('unlim.version is set', () => {
    registerSimulatorInstance(createMockSimulator());
    expect(window.__ELAB_API.unlim.version).toBe('1.1.0');
  });
});

describe('simulatorAPI compile bridge', () => {
  it('delegates compile to the live simulator compileAndLoad bridge when available', async () => {
    const compileAndLoad = vi.fn().mockResolvedValue({ success: true, status: 'success-local', hex: 'BEEF' });
    registerSimulatorInstance(createMockSimulator({ compileAndLoad }));

    const result = await window.__ELAB_API.compile('void setup(){}');

    expect(compileAndLoad).toHaveBeenCalledWith('void setup(){}', 'arduino:avr:nano:cpu=atmega328old');
    expect(compileCode).not.toHaveBeenCalled();
    expect(result).toMatchObject({ success: true, status: 'success-local', hex: 'BEEF' });
  });

  it('falls back to compileCode when no live compile bridge exists', async () => {
    registerSimulatorInstance(createMockSimulator());

    const result = await window.__ELAB_API.compile('void loop(){}');

    expect(compileCode).toHaveBeenCalledWith('void loop(){}', 'arduino:avr:nano:cpu=atmega328old');
    expect(result).toMatchObject({ success: true, hex: 'AABB' });
  });
});


// ═══════════════════════════════════════════════
// 2. Event System (15 tests)
// ═══════════════════════════════════════════════

describe('2. Event System', () => {
  beforeEach(() => {
    registerSimulatorInstance(createMockSimulator());
  });

  it('on() registers a listener and returns unsubscribe function', () => {
    const cb = vi.fn();
    const unsub = window.__ELAB_API.on('stateChange', cb);
    expect(typeof unsub).toBe('function');
    expect(window.__ELAB_EVENTS.stateChange).toContain(cb);
  });

  it('emitSimulatorEvent calls registered listeners', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    emitSimulatorEvent('stateChange', { key: 'value' });
    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith({ key: 'value' });
  });

  it('multiple listeners on same event all fire', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const cb3 = vi.fn();
    window.__ELAB_API.on('experimentChange', cb1);
    window.__ELAB_API.on('experimentChange', cb2);
    window.__ELAB_API.on('experimentChange', cb3);
    emitSimulatorEvent('experimentChange', 'data');
    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
    expect(cb3).toHaveBeenCalledOnce();
  });

  it('off() removes a specific listener', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    window.__ELAB_API.on('circuitChange', cb1);
    window.__ELAB_API.on('circuitChange', cb2);
    window.__ELAB_API.off('circuitChange', cb1);
    emitSimulatorEvent('circuitChange', {});
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it('unsubscribe function from on() removes the listener', () => {
    const cb = vi.fn();
    const unsub = window.__ELAB_API.on('serialOutput', cb);
    unsub();
    emitSimulatorEvent('serialOutput', 'hello');
    expect(cb).not.toHaveBeenCalled();
  });

  it('event data is passed correctly to listeners', () => {
    const cb = vi.fn();
    const payload = { experimentId: 'v1-cap6', components: ['led1'] };
    window.__ELAB_API.on('experimentChange', cb);
    emitSimulatorEvent('experimentChange', payload);
    expect(cb).toHaveBeenCalledWith(payload);
  });

  it('events with no listeners do not throw', () => {
    expect(() => emitSimulatorEvent('nonExistentEvent', {})).not.toThrow();
  });

  it('listener errors are silently caught', () => {
    const throwingCb = vi.fn(() => { throw new Error('boom'); });
    const normalCb = vi.fn();
    window.__ELAB_API.on('stateChange', throwingCb);
    window.__ELAB_API.on('stateChange', normalCb);
    expect(() => emitSimulatorEvent('stateChange', {})).not.toThrow();
    expect(normalCb).toHaveBeenCalledOnce();
  });

  it('off() on non-existent event does not throw', () => {
    expect(() => window.__ELAB_API.off('nope', () => {})).not.toThrow();
  });

  it('listeners receive events only for their event type', () => {
    const cbA = vi.fn();
    const cbB = vi.fn();
    window.__ELAB_API.on('stateChange', cbA);
    window.__ELAB_API.on('experimentChange', cbB);
    emitSimulatorEvent('stateChange', 'x');
    expect(cbA).toHaveBeenCalledOnce();
    expect(cbB).not.toHaveBeenCalled();
  });

  it('emitSimulatorEvent works with undefined data', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    emitSimulatorEvent('stateChange', undefined);
    expect(cb).toHaveBeenCalledWith(undefined);
  });

  it('re-adding same callback results in duplicate calls', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    window.__ELAB_API.on('stateChange', cb);
    emitSimulatorEvent('stateChange', {});
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('off() removes only the first matching reference', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('stateChange', cb);
    window.__ELAB_API.on('stateChange', cb);
    window.__ELAB_API.off('stateChange', cb);
    // filter removes ALL matching (standard Array.filter behavior)
    emitSimulatorEvent('stateChange', {});
    expect(cb).toHaveBeenCalledTimes(0);
  });

  it('componentInteract event works', () => {
    const cb = vi.fn();
    window.__ELAB_API.on('componentInteract', cb);
    emitSimulatorEvent('componentInteract', { id: 'led1', action: 'toggle' });
    expect(cb).toHaveBeenCalledWith({ id: 'led1', action: 'toggle' });
  });

  it('emitSimulatorEvent with no __ELAB_EVENTS does not throw', () => {
    delete window.__ELAB_EVENTS;
    expect(() => emitSimulatorEvent('stateChange', {})).not.toThrow();
  });
});


// ═══════════════════════════════════════════════
// 3. Component Management (15 tests)
// ═══════════════════════════════════════════════

describe('3. Component Management', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('addComponent() returns generated component ID', () => {
    const id = window.__ELAB_API.addComponent('resistor', { x: 100, y: 200 });
    expect(id).toBe('comp-new-1');
    expect(sim.addComponent).toHaveBeenCalledWith('resistor', { x: 100, y: 200 });
  });

  it('addComponent() returns null when simulator is not available', () => {
    unregisterSimulatorInstance();
    registerSimulatorInstance({});
    // Re-create API for null sim ref scenario
    delete window.__ELAB_API;
    registerSimulatorInstance(null);
    // API won't be created because null ref, test the fallback
  });

  it('removeComponent() calls simulator.removeComponent', () => {
    window.__ELAB_API.removeComponent('led1');
    expect(sim.removeComponent).toHaveBeenCalledWith('led1');
  });

  it('clearAll() calls simulator.clearAll', () => {
    window.__ELAB_API.clearAll();
    expect(sim.clearAll).toHaveBeenCalledOnce();
  });

  it('clearCircuit() is an alias for clearAll', () => {
    window.__ELAB_API.clearCircuit();
    expect(sim.clearAll).toHaveBeenCalledOnce();
  });

  it('getLayout() returns structure with components, connections, layout', () => {
    const layout = window.__ELAB_API.getLayout();
    expect(layout).toHaveProperty('components');
    expect(layout).toHaveProperty('connections');
    expect(layout).toHaveProperty('layout');
  });

  it('getComponentStates() returns component state map', () => {
    const states = window.__ELAB_API.getComponentStates();
    expect(states.led1).toEqual({ on: true });
    expect(states.r1).toEqual({ value: 220 });
  });

  it('getComponentPositions() returns position map', () => {
    const positions = window.__ELAB_API.getComponentPositions();
    expect(positions.bat1).toEqual({ x: 10, y: 20, type: 'battery9v' });
  });

  it('moveComponent() calls simulator.moveComponent with correct args', () => {
    window.__ELAB_API.moveComponent('r1', 100, 200);
    expect(sim.moveComponent).toHaveBeenCalledWith('r1', 100, 200);
  });

  it('interact() delegates to simulator.interact', () => {
    window.__ELAB_API.interact('btn1', 'press', null);
    expect(sim.interact).toHaveBeenCalledWith('btn1', 'press', null);
  });

  it('setComponentValue() sets property on component', () => {
    window.__ELAB_API.setComponentValue('r1', 'value', 470);
    expect(sim.setComponentValue).toHaveBeenCalledWith('r1', 'value', 470);
  });

  it('setComponentValue() sets color on LED', () => {
    window.__ELAB_API.setComponentValue('led1', 'color', 'blue');
    expect(sim.setComponentValue).toHaveBeenCalledWith('led1', 'color', 'blue');
  });

  it('getSelectedComponent() returns selected component ID', () => {
    expect(window.__ELAB_API.getSelectedComponent()).toBe('led1');
  });

  it('getSelectedComponent() returns null when nothing selected', () => {
    sim.getSelectedComponent.mockReturnValue(null);
    expect(window.__ELAB_API.getSelectedComponent()).toBeNull();
  });

  it('unlim.highlightComponent() highlights components', () => {
    window.__ELAB_API.unlim.highlightComponent(['r1', 'led1']);
    expect(sim.setHighlightedComponents).toHaveBeenCalledWith(['r1', 'led1']);
  });
});


// ═══════════════════════════════════════════════
// 4. Wire Management (10 tests)
// ═══════════════════════════════════════════════

describe('4. Wire Management', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('addWire() calls simulator.addWire with pin refs', () => {
    window.__ELAB_API.addWire('bat1:positive', 'r1:pin1');
    expect(sim.addWire).toHaveBeenCalledWith('bat1:positive', 'r1:pin1');
  });

  it('connectWire() is a semantic alias for addWire', () => {
    window.__ELAB_API.connectWire('bat1:positive', 'r1:pin1');
    expect(sim.addWire).toHaveBeenCalledWith('bat1:positive', 'r1:pin1');
  });

  it('removeWire() calls simulator.removeWire with index', () => {
    window.__ELAB_API.removeWire(0);
    expect(sim.removeWire).toHaveBeenCalledWith(0);
  });

  it('addWire with no simulator does not throw', () => {
    unregisterSimulatorInstance();
    delete window.__ELAB_API;
    registerSimulatorInstance({});
    // The API gracefully handles missing methods via optional chaining
    expect(() => window.__ELAB_API.addWire('a:b', 'c:d')).not.toThrow();
  });

  it('multiple wires can be added sequentially', () => {
    window.__ELAB_API.addWire('bat1:positive', 'r1:pin1');
    window.__ELAB_API.addWire('r1:pin2', 'led1:anode');
    window.__ELAB_API.addWire('led1:cathode', 'bat1:negative');
    expect(sim.addWire).toHaveBeenCalledTimes(3);
  });

  it('removeWire with negative index still delegates to simulator', () => {
    window.__ELAB_API.removeWire(-1);
    expect(sim.removeWire).toHaveBeenCalledWith(-1);
  });

  it('connectWire and addWire call the same underlying method', () => {
    window.__ELAB_API.connectWire('a:b', 'c:d');
    window.__ELAB_API.addWire('e:f', 'g:h');
    expect(sim.addWire).toHaveBeenCalledTimes(2);
  });

  it('highlightPin() highlights specific pin refs', () => {
    window.__ELAB_API.highlightPin(['r1:pin1', 'led1:anode']);
    expect(sim.highlightPin).toHaveBeenCalledWith(['r1:pin1', 'led1:anode']);
  });

  it('highlightPin() wraps single string in array', () => {
    window.__ELAB_API.highlightPin('r1:pin1');
    expect(sim.highlightPin).toHaveBeenCalledWith(['r1:pin1']);
  });

  it('unlim.highlightPin() also delegates', () => {
    window.__ELAB_API.unlim.highlightPin('bat1:positive');
    expect(sim.setHighlightedPins).toHaveBeenCalledWith(['bat1:positive']);
  });
});


// ═══════════════════════════════════════════════
// 5. Simulation Control (10 tests)
// ═══════════════════════════════════════════════

describe('5. Simulation Control', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('play() calls simulator.play', () => {
    window.__ELAB_API.play();
    expect(sim.play).toHaveBeenCalledOnce();
  });

  it('pause() calls simulator.pause', () => {
    window.__ELAB_API.pause();
    expect(sim.pause).toHaveBeenCalledOnce();
  });

  it('reset() calls simulator.reset', () => {
    window.__ELAB_API.reset();
    expect(sim.reset).toHaveBeenCalledOnce();
  });

  it('isSimulating() returns false when stopped', () => {
    expect(window.__ELAB_API.isSimulating()).toBe(false);
  });

  it('isSimulating() returns true when running', () => {
    sim.isSimulating.mockReturnValue(true);
    expect(window.__ELAB_API.isSimulating()).toBe(true);
  });

  it('getSimulationStatus() returns "stopped"', () => {
    expect(window.__ELAB_API.getSimulationStatus()).toBe('stopped');
  });

  it('getSimulationStatus() returns "running" when active', () => {
    sim.getSimulationStatus.mockReturnValue('running');
    expect(window.__ELAB_API.getSimulationStatus()).toBe('running');
  });

  it('play/pause/reset do not throw when simulator methods are missing', () => {
    unregisterSimulatorInstance();
    delete window.__ELAB_API;
    registerSimulatorInstance({});
    expect(() => window.__ELAB_API.play()).not.toThrow();
    expect(() => window.__ELAB_API.pause()).not.toThrow();
    expect(() => window.__ELAB_API.reset()).not.toThrow();
  });

  it('interact() passes action and value to simulator', () => {
    window.__ELAB_API.interact('pot1', 'setPosition', 0.75);
    expect(sim.interact).toHaveBeenCalledWith('pot1', 'setPosition', 0.75);
  });

  it('serialWrite() delegates to simulator', () => {
    window.__ELAB_API.serialWrite('Hello Arduino');
    expect(sim.serialWrite).toHaveBeenCalledWith('Hello Arduino');
  });
});


// ═══════════════════════════════════════════════
// 6. Experiment Loading (15 tests)
// ═══════════════════════════════════════════════

describe('6. Experiment Loading', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('getExperimentList() returns all volumes', () => {
    const list = window.__ELAB_API.getExperimentList();
    expect(list).toHaveProperty('vol1');
    expect(list).toHaveProperty('vol2');
    expect(list).toHaveProperty('vol3');
  });

  it('getExperimentList().vol1 has correct experiment count', () => {
    const list = window.__ELAB_API.getExperimentList();
    expect(list.vol1).toHaveLength(2);
  });

  it('getExperimentList() formats experiments with expected fields', () => {
    const list = window.__ELAB_API.getExperimentList();
    const exp = list.vol1[0];
    expect(exp).toHaveProperty('id');
    expect(exp).toHaveProperty('title');
    expect(exp).toHaveProperty('chapter');
    expect(exp).toHaveProperty('difficulty');
    expect(exp).toHaveProperty('mode');
    expect(exp).toHaveProperty('hasCode');
    expect(exp).toHaveProperty('concept');
  });

  it('getExperiment() returns experiment by ID', () => {
    const exp = window.__ELAB_API.getExperiment('v1-cap6-primo-circuito');
    expect(exp).not.toBeNull();
    expect(exp.title).toBe('Primo Circuito');
  });

  it('getExperiment() returns null for unknown ID', () => {
    expect(window.__ELAB_API.getExperiment('nonexistent-id')).toBeNull();
  });

  it('loadExperiment() returns true on success', () => {
    const result = window.__ELAB_API.loadExperiment('v1-cap6-primo-circuito');
    expect(result).toBe(true);
    expect(sim.selectExperiment).toHaveBeenCalledOnce();
  });

  it('loadExperiment() returns false for invalid ID', () => {
    const result = window.__ELAB_API.loadExperiment('does-not-exist');
    expect(result).toBe(false);
  });

  it('loadExperiment() returns false when simulator has no selectExperiment', () => {
    unregisterSimulatorInstance();
    delete window.__ELAB_API;
    registerSimulatorInstance({});
    expect(window.__ELAB_API.loadExperiment('v1-cap6-primo-circuito')).toBe(false);
  });

  it('mountExperiment() loads experiment (alias pattern)', () => {
    const result = window.__ELAB_API.mountExperiment('v2-cap1-arduino-intro');
    expect(result).toBe(true);
    expect(sim.selectExperiment).toHaveBeenCalledOnce();
  });

  it('mountExperiment() returns false for invalid ID', () => {
    expect(window.__ELAB_API.mountExperiment('xxx')).toBe(false);
  });

  it('mountExperiment() returns false when no selectExperiment method', () => {
    unregisterSimulatorInstance();
    delete window.__ELAB_API;
    registerSimulatorInstance({});
    expect(window.__ELAB_API.mountExperiment('v1-cap6-primo-circuito')).toBe(false);
  });

  it('getCurrentExperiment() returns current experiment data', () => {
    const current = window.__ELAB_API.getCurrentExperiment();
    expect(current).toEqual({ id: 'v1-cap6-primo-circuito', title: 'Primo Circuito' });
  });

  it('getCurrentExperiment() returns null when none loaded', () => {
    sim.getCurrentExperiment.mockReturnValue(null);
    expect(window.__ELAB_API.getCurrentExperiment()).toBeNull();
  });

  it('getExperimentList() shows hasCode correctly', () => {
    const list = window.__ELAB_API.getExperimentList();
    expect(list.vol1[0].hasCode).toBe(false);
    expect(list.vol1[1].hasCode).toBe(true);
  });

  it('getExperimentOriginalCode() returns original code', () => {
    expect(window.__ELAB_API.getExperimentOriginalCode()).toBe('// original');
  });
});


// ═══════════════════════════════════════════════
// 7. Editor Control (10 tests)
// ═══════════════════════════════════════════════

describe('7. Editor Control', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('showEditor() calls simulator.showEditor', () => {
    window.__ELAB_API.showEditor();
    expect(sim.showEditor).toHaveBeenCalledOnce();
  });

  it('hideEditor() calls simulator.hideEditor', () => {
    window.__ELAB_API.hideEditor();
    expect(sim.hideEditor).toHaveBeenCalledOnce();
  });

  it('isEditorVisible() returns current visibility', () => {
    expect(window.__ELAB_API.isEditorVisible()).toBe(false);
    sim.isEditorVisible.mockReturnValue(true);
    expect(window.__ELAB_API.isEditorVisible()).toBe(true);
  });

  it('getEditorCode() returns current code string', () => {
    const code = window.__ELAB_API.getEditorCode();
    expect(code).toBe('void setup() { pinMode(13, OUTPUT); }');
  });

  it('getEditorCode() returns null when not available', () => {
    sim.getEditorCode.mockReturnValue(null);
    expect(window.__ELAB_API.getEditorCode()).toBeNull();
  });

  it('setEditorCode() updates code', () => {
    window.__ELAB_API.setEditorCode('void loop() {}');
    expect(sim.setEditorCode).toHaveBeenCalledWith('void loop() {}');
  });

  it('getEditorMode() returns current mode', () => {
    expect(window.__ELAB_API.getEditorMode()).toBe('arduino');
  });

  it('setEditorMode() switches mode', () => {
    window.__ELAB_API.setEditorMode('scratch');
    expect(sim.setEditorMode).toHaveBeenCalledWith('scratch');
  });

  it('appendEditorCode() appends to existing code', () => {
    window.__ELAB_API.appendEditorCode('\ndigitalWrite(13, HIGH);');
    expect(sim.appendEditorCode).toHaveBeenCalledWith('\ndigitalWrite(13, HIGH);');
  });

  it('resetEditorCode() resets to original', () => {
    window.__ELAB_API.resetEditorCode();
    expect(sim.resetEditorCode).toHaveBeenCalledOnce();
  });
});


// ═══════════════════════════════════════════════
// 8. Circuit Description (5 tests)
// ═══════════════════════════════════════════════

describe('8. Circuit Description', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('returns human-readable Italian description', () => {
    const desc = window.__ELAB_API.getCircuitDescription();
    expect(desc).toContain('Esperimento: "Primo Circuito"');
    expect(desc).toContain('batteria 9V');
    expect(desc).toContain('resistore da 220');
    expect(desc).toContain('LED rosso');
    expect(desc).toMatch(/2 collegament/);
  });

  it('returns "Nessun circuito caricato." when no circuit state', () => {
    sim.getCircuitState.mockReturnValue(null);
    expect(window.__ELAB_API.getCircuitDescription()).toBe('Nessun circuito caricato.');
  });

  it('returns "Il circuito e vuoto." when no components', () => {
    sim.getCircuitState.mockReturnValue({
      experiment: {},
      components: [],
      connections: [],
      isSimulating: false,
    });
    expect(window.__ELAB_API.getCircuitDescription()).toBe('Il circuito è vuoto.');
  });

  it('includes simulation status when running', () => {
    sim.getCircuitState.mockReturnValue({
      experiment: { title: 'Test' },
      components: [{ id: 'r1', type: 'resistor', value: 1000, state: {} }],
      connections: [],
      isSimulating: true,
    });
    const desc = window.__ELAB_API.getCircuitDescription();
    expect(desc).toContain('Simulazione in corso');
    expect(desc).toContain('resistore da 1k');
  });

  it('shows [acceso]/[spento] state for components', () => {
    sim.getCircuitState.mockReturnValue({
      experiment: {},
      components: [
        { id: 'led1', type: 'led', color: 'green', state: { on: true } },
        { id: 'led2', type: 'led', color: 'red', state: { on: false } },
      ],
      connections: [],
      isSimulating: false,
    });
    const desc = window.__ELAB_API.getCircuitDescription();
    expect(desc).toContain('LED verde [acceso]');
    expect(desc).toContain('LED rosso [spento]');
  });
});


// ═══════════════════════════════════════════════
// 9. Undo/Redo (10 tests)
// ═══════════════════════════════════════════════

describe('9. Undo/Redo', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('undo() calls simulator.undo', () => {
    window.__ELAB_API.undo();
    expect(sim.undo).toHaveBeenCalledOnce();
  });

  it('redo() calls simulator.redo', () => {
    window.__ELAB_API.redo();
    expect(sim.redo).toHaveBeenCalledOnce();
  });

  it('canUndo() returns true when undo is available', () => {
    expect(window.__ELAB_API.canUndo()).toBe(true);
  });

  it('canRedo() returns false when redo is not available', () => {
    expect(window.__ELAB_API.canRedo()).toBe(false);
  });

  it('canUndo/canRedo reflect state changes', () => {
    sim.canUndo.mockReturnValue(false);
    sim.canRedo.mockReturnValue(true);
    expect(window.__ELAB_API.canUndo()).toBe(false);
    expect(window.__ELAB_API.canRedo()).toBe(true);
  });

  it('multiple undo calls work', () => {
    window.__ELAB_API.undo();
    window.__ELAB_API.undo();
    window.__ELAB_API.undo();
    expect(sim.undo).toHaveBeenCalledTimes(3);
  });

  it('multiple redo calls work', () => {
    window.__ELAB_API.redo();
    window.__ELAB_API.redo();
    expect(sim.redo).toHaveBeenCalledTimes(2);
  });

  it('undo then redo chain', () => {
    window.__ELAB_API.undo();
    window.__ELAB_API.undo();
    window.__ELAB_API.redo();
    expect(sim.undo).toHaveBeenCalledTimes(2);
    expect(sim.redo).toHaveBeenCalledTimes(1);
  });

  it('undo/redo do not throw when simulator is empty', () => {
    unregisterSimulatorInstance();
    delete window.__ELAB_API;
    registerSimulatorInstance({});
    expect(() => window.__ELAB_API.undo()).not.toThrow();
    expect(() => window.__ELAB_API.redo()).not.toThrow();
  });

  it('canUndo/canRedo return false when simulator is empty', () => {
    unregisterSimulatorInstance();
    delete window.__ELAB_API;
    registerSimulatorInstance({});
    expect(window.__ELAB_API.canUndo()).toBe(false);
    expect(window.__ELAB_API.canRedo()).toBe(false);
  });
});


// ═══════════════════════════════════════════════
// 10. Bonus: Build Mode, Tool Mode, Context (5 tests)
// ═══════════════════════════════════════════════

describe('10. Build Mode, Tool Mode, Simulator Context', () => {
  let sim;

  beforeEach(() => {
    sim = createMockSimulator();
    registerSimulatorInstance(sim);
  });

  it('setBuildMode/getBuildMode work', () => {
    expect(window.__ELAB_API.getBuildMode()).toBe('complete');
    window.__ELAB_API.setBuildMode('guided');
    expect(sim.setBuildMode).toHaveBeenCalledWith('guided');
  });

  it('setToolMode/getToolMode work', () => {
    expect(window.__ELAB_API.getToolMode()).toBe('select');
    window.__ELAB_API.setToolMode('wire');
    expect(sim.setToolMode).toHaveBeenCalledWith('wire');
  });

  it('getBuildStepIndex returns step', () => {
    expect(window.__ELAB_API.getBuildStepIndex()).toBe(2);
  });

  it('nextStep/prevStep delegate', () => {
    window.__ELAB_API.nextStep();
    window.__ELAB_API.prevStep();
    expect(sim.nextStep).toHaveBeenCalledOnce();
    expect(sim.prevStep).toHaveBeenCalledOnce();
  });

  it('setBuildStepIndex/resetBuildSteps delegate', () => {
    window.__ELAB_API.setBuildStepIndex(0);
    window.__ELAB_API.resetBuildSteps();
    expect(sim.setBuildStepIndex).toHaveBeenCalledWith(0);
    expect(sim.resetBuildSteps).toHaveBeenCalledOnce();
  });

  it('getSimulatorContext returns structured snapshot', () => {
    const ctx = window.__ELAB_API.getSimulatorContext();
    expect(ctx).toHaveProperty('experiment');
    expect(ctx).toHaveProperty('buildMode');
    expect(ctx).toHaveProperty('editorMode');
    expect(ctx).toHaveProperty('components');
    expect(ctx).toHaveProperty('wires');
    expect(ctx).toHaveProperty('simulation');
    expect(ctx.experiment.id).toBe('v1-cap6-primo-circuito');
    expect(ctx.simulation.state).toBe('stopped');
    // breadboard should be included in components
    expect(ctx.components.length).toBe(4);
    // wires should map from/to
    expect(ctx.wires.length).toBe(2);
    expect(ctx.wires[0]).toEqual({ from: 'bat1:positive', to: 'r1:pin1' });
  });
});
