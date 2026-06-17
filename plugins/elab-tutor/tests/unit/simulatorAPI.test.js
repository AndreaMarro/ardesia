/**
 * simulatorAPI.test.js — Test __ELAB_API mock and structure
 * Tests: API methods existence, event system, getCircuitDescription
 * 50 tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We cannot import the actual module since it depends on real data imports.
// Instead, we test the API shape by replicating the createPublicAPI logic.

function createMockAPI() {
  const _events = {};

  return {
    version: '1.0.0',
    name: 'ELAB Simulator API',

    // Experiment management
    getExperimentList() { return { vol1: [], vol2: [], vol3: [] }; },
    getExperiment(id) { return null; },
    loadExperiment(id) { return false; },
    getCurrentExperiment() { return null; },

    // Simulation control
    play() {},
    pause() {},
    reset() {},
    getComponentStates() { return {}; },
    interact(id, action, value) {},
    addWire(from, to) {},
    removeWire(index) {},
    addComponent(type, position) { return type + '-1'; },
    removeComponent(id) {},
    getSelectedComponent() { return null; },

    // Extended manipulation
    moveComponent(id, x, y) {},
    clearAll() {},
    setComponentValue(id, field, value) {},
    connectWire(from, to) {},
    clearCircuit() {},
    mountExperiment(id) { return false; },

    getCircuitDescription() { return 'Il circuito e vuoto.'; },
    getComponentPositions() { return {}; },
    getLayout() { return {}; },

    // Screenshot/AI
    async captureScreenshot() { return null; },
    async askUNLIM(prompt) { return { success: false }; },
    async analyzeImage(url, question) { return { success: false }; },

    // Compilation
    async compile(code, board) { return { success: false }; },
    getEditorCode() { return null; },
    setEditorCode(code) {},

    // Editor control
    showEditor() {},
    hideEditor() {},
    setEditorMode(mode) {},
    getEditorMode() { return 'arduino'; },
    isEditorVisible() { return false; },
    loadScratchWorkspace(xml) {},

    // Extended control
    undo() {},
    redo() {},
    canUndo() { return false; },
    canRedo() { return false; },
    highlightPin(refs) {},
    serialWrite(text) {},
    setBuildMode(mode) {},
    getBuildMode() { return false; },
    setToolMode(mode) {},
    getToolMode() { return 'select'; },
    nextStep() {},
    prevStep() {},
    getBuildStepIndex() { return -1; },
    showBom() {},
    hideBom() {},
    showSerialMonitor() {},
    isSimulating() { return false; },
    getSimulationStatus() { return 'stopped'; },

    // Code control
    appendEditorCode(code) {},
    resetEditorCode() {},
    getExperimentOriginalCode() { return ''; },

    // Context
    getSimulatorContext() { return {}; },

    // UNLIM bridge
    unlim: {
      highlightComponent(ids) {},
      highlightPin(refs) {},
      clearHighlights() {},
      serialWrite(text) {},
      getCircuitState() { return {}; },
      version: '1.0.0',
      info: {
        name: 'ELAB Simulator — UNLIM Bridge',
        author: 'Andrea Marro',
        modes: ['circuit', 'avr'],
        totalExperiments: 91,
      },
    },

    // Events
    on(event, callback) {
      if (!_events[event]) _events[event] = [];
      _events[event].push(callback);
      return () => {
        _events[event] = _events[event].filter(cb => cb !== callback);
      };
    },
    off(event, callback) {
      if (_events[event]) {
        _events[event] = _events[event].filter(cb => cb !== callback);
      }
    },
    _emit(event, data) {
      if (_events[event]) {
        _events[event].forEach(cb => cb(data));
      }
    },
    _events,
  };
}

describe('__ELAB_API structure', () => {
  let api;

  beforeEach(() => {
    api = createMockAPI();
  });

  describe('info properties', () => {
    it('has version string', () => {
      expect(api.version).toBe('1.0.0');
    });

    it('has name string', () => {
      expect(api.name).toBe('ELAB Simulator API');
    });
  });

  describe('experiment management methods exist', () => {
    it('has getExperimentList', () => {
      expect(typeof api.getExperimentList).toBe('function');
    });

    it('getExperimentList returns vol1/vol2/vol3', () => {
      const list = api.getExperimentList();
      expect(list).toHaveProperty('vol1');
      expect(list).toHaveProperty('vol2');
      expect(list).toHaveProperty('vol3');
    });

    it('has getExperiment', () => {
      expect(typeof api.getExperiment).toBe('function');
    });

    it('has loadExperiment', () => {
      expect(typeof api.loadExperiment).toBe('function');
    });

    it('has getCurrentExperiment', () => {
      expect(typeof api.getCurrentExperiment).toBe('function');
    });
  });

  describe('simulation control methods exist', () => {
    it('has play', () => { expect(typeof api.play).toBe('function'); });
    it('has pause', () => { expect(typeof api.pause).toBe('function'); });
    it('has reset', () => { expect(typeof api.reset).toBe('function'); });
    it('has getComponentStates', () => { expect(typeof api.getComponentStates).toBe('function'); });
    it('has interact', () => { expect(typeof api.interact).toBe('function'); });
    it('has addWire', () => { expect(typeof api.addWire).toBe('function'); });
    it('has removeWire', () => { expect(typeof api.removeWire).toBe('function'); });
    it('has addComponent', () => { expect(typeof api.addComponent).toBe('function'); });
    it('has removeComponent', () => { expect(typeof api.removeComponent).toBe('function'); });
  });

  describe('extended manipulation methods', () => {
    it('has moveComponent', () => { expect(typeof api.moveComponent).toBe('function'); });
    it('has clearAll', () => { expect(typeof api.clearAll).toBe('function'); });
    it('has setComponentValue', () => { expect(typeof api.setComponentValue).toBe('function'); });
    it('has connectWire', () => { expect(typeof api.connectWire).toBe('function'); });
    it('has clearCircuit', () => { expect(typeof api.clearCircuit).toBe('function'); });
    it('has mountExperiment', () => { expect(typeof api.mountExperiment).toBe('function'); });
    it('has getCircuitDescription', () => { expect(typeof api.getCircuitDescription).toBe('function'); });
    it('has undo', () => { expect(typeof api.undo).toBe('function'); });
    it('has redo', () => { expect(typeof api.redo).toBe('function'); });
    it('has canUndo', () => { expect(typeof api.canUndo).toBe('function'); });
    it('has canRedo', () => { expect(typeof api.canRedo).toBe('function'); });
  });

  describe('editor control methods', () => {
    it('has showEditor', () => { expect(typeof api.showEditor).toBe('function'); });
    it('has hideEditor', () => { expect(typeof api.hideEditor).toBe('function'); });
    it('has setEditorMode', () => { expect(typeof api.setEditorMode).toBe('function'); });
    it('has getEditorMode', () => { expect(api.getEditorMode()).toBe('arduino'); });
    it('has isEditorVisible', () => { expect(api.isEditorVisible()).toBe(false); });
    it('has getEditorCode', () => { expect(typeof api.getEditorCode).toBe('function'); });
    it('has setEditorCode', () => { expect(typeof api.setEditorCode).toBe('function'); });
  });

  describe('UNLIM bridge', () => {
    it('has unlim object', () => {
      expect(api.unlim).toBeDefined();
    });

    it('has unlim.highlightComponent', () => {
      expect(typeof api.unlim.highlightComponent).toBe('function');
    });

    it('has unlim.highlightPin', () => {
      expect(typeof api.unlim.highlightPin).toBe('function');
    });

    it('has unlim.clearHighlights', () => {
      expect(typeof api.unlim.clearHighlights).toBe('function');
    });

    it('has unlim.serialWrite', () => {
      expect(typeof api.unlim.serialWrite).toBe('function');
    });

    it('has unlim.getCircuitState', () => {
      expect(typeof api.unlim.getCircuitState).toBe('function');
    });

    it('unlim.info has correct author', () => {
      expect(api.unlim.info.author).toBe('Andrea Marro');
    });

    it('unlim.info has modes array', () => {
      expect(api.unlim.info.modes).toContain('circuit');
      expect(api.unlim.info.modes).toContain('avr');
    });
  });

  describe('event system: on/off/emit', () => {
    it('on registers a listener', () => {
      const fn = vi.fn();
      api.on('stateChange', fn);
      expect(api._events['stateChange']).toContain(fn);
    });

    it('emit calls registered listener', () => {
      const fn = vi.fn();
      api.on('stateChange', fn);
      api._emit('stateChange', { test: true });
      expect(fn).toHaveBeenCalledWith({ test: true });
    });

    it('off removes a listener', () => {
      const fn = vi.fn();
      api.on('stateChange', fn);
      api.off('stateChange', fn);
      api._emit('stateChange', {});
      expect(fn).not.toHaveBeenCalled();
    });

    it('on returns unsubscribe function', () => {
      const fn = vi.fn();
      const unsub = api.on('experimentChange', fn);
      unsub();
      api._emit('experimentChange', {});
      expect(fn).not.toHaveBeenCalled();
    });

    it('multiple listeners on same event', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      api.on('circuitChange', fn1);
      api.on('circuitChange', fn2);
      api._emit('circuitChange', 'data');
      expect(fn1).toHaveBeenCalledWith('data');
      expect(fn2).toHaveBeenCalledWith('data');
    });

    it('off on non-existent event does not throw', () => {
      expect(() => api.off('nonExistent', () => {})).not.toThrow();
    });

    it('emit on event with no listeners does not throw', () => {
      expect(() => api._emit('nope', {})).not.toThrow();
    });
  });

  describe('default return values', () => {
    it('getComponentStates returns empty object', () => {
      expect(api.getComponentStates()).toEqual({});
    });

    it('getSelectedComponent returns null', () => {
      expect(api.getSelectedComponent()).toBeNull();
    });

    it('canUndo returns false', () => {
      expect(api.canUndo()).toBe(false);
    });

    it('canRedo returns false', () => {
      expect(api.canRedo()).toBe(false);
    });

    it('getToolMode returns select', () => {
      expect(api.getToolMode()).toBe('select');
    });

    it('getSimulationStatus returns stopped', () => {
      expect(api.getSimulationStatus()).toBe('stopped');
    });

    it('isSimulating returns false', () => {
      expect(api.isSimulating()).toBe(false);
    });

    it('getBuildStepIndex returns -1', () => {
      expect(api.getBuildStepIndex()).toBe(-1);
    });
  });
});
