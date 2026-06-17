/**
 * ELAB API mock — reflects src/services/simulator-api.js surface.
 * Used by OpenClaw registry audit + dispatcher tests.
 *
 * Keep in sync with simulator-api.js (verified 2026-04-23 on file lines 74-725).
 */

export function buildFullMockApi(): Record<string, unknown> {
  const noop = () => undefined;
  const empty = () => ({});
  const list = () => [];
  return {
    // Info
    version: '1.0.0',
    name: 'ELAB Simulator API',

    // Experiment
    getExperimentList: list,
    getExperiment: empty,
    loadExperiment: noop,
    getCurrentExperiment: empty,
    mountExperiment: noop,

    // Lifecycle
    play: noop,
    pause: noop,
    reset: noop,
    clearAll: noop,
    clearCircuit: noop,

    // Components
    addComponent: () => 'led1',
    removeComponent: noop,
    moveComponent: noop,
    interact: noop,
    setComponentValue: noop,
    getComponentStates: empty,
    getComponentPositions: empty,
    getSelectedComponent: empty,

    // Wires
    addWire: noop,
    removeWire: noop,
    connectWire: noop,

    // Description
    getCircuitDescription: () => 'Circuito vuoto',
    getLayout: empty,

    // Editor
    getEditorCode: () => '',
    setEditorCode: noop,
    appendEditorCode: noop,
    resetEditorCode: noop,
    showEditor: noop,
    hideEditor: noop,
    setEditorMode: noop,
    getEditorMode: () => 'code',
    isEditorVisible: () => false,
    loadScratchWorkspace: noop,

    // Undo
    undo: noop,
    redo: noop,
    canUndo: () => false,
    canRedo: () => false,

    // Flat highlight (legacy path, used by setHighlightedPins internally)
    highlightPin: noop,
    serialWrite: noop,

    // Build mode
    setBuildMode: noop,
    getBuildMode: () => 'complete',
    setToolMode: noop,
    getToolMode: () => 'select',

    // Step
    nextStep: noop,
    prevStep: noop,
    getBuildStepIndex: () => -1,

    // BOM / Serial
    showBom: noop,
    hideBom: noop,
    showSerialMonitor: noop,

    // Status
    isSimulating: () => false,
    getSimulationStatus: () => 'stopped',

    // Experiment code
    getExperimentOriginalCode: () => '',
    appendEditorCode2: noop,

    // Context
    getSimulatorContext: empty,

    // Compile
    compile: async () => ({ success: true, errors: [] }),

    // Screenshot
    captureScreenshot: () => ({ dataUrl: 'data:image/png;base64,AAAA', w: 800, h: 600 }),

    // Toggle drawing (new in Sprint 6)
    toggleDrawing: noop,

    // Events
    on: () => () => undefined,
    off: noop,

    // UNLIM namespace
    unlim: {
      // Real (5 existing)
      highlightComponent: noop,
      highlightPin: noop,
      clearHighlights: noop,
      serialWrite: noop,
      getCircuitState: empty,

      // Sprint 5 TODO → implemented Day 37 (mocked here for test runner)
      speakTTS: async () => ({ ok: true }),
      listenSTT: async () => ({ text: '' }),
      saveSessionMemory: async () => ({ id: 'mem-1' }),
      recallPastSession: async () => [],
      showNudge: noop,
      generateQuiz: async () => ({ questions: [] }),
      exportFumetto: async () => ({ url: '' }),
      videoLoad: noop,
      alertDocente: noop,

      // Composite
      analyzeImage: async () => ({ description: 'mock circuit description' }),

      version: '1.0.0',
      info: { name: 'ELAB Simulator — UNLIM Bridge', author: 'Andrea Marro', modes: ['circuit', 'avr'], totalExperiments: 92 },
    },
  };
}
