/**
 * ELAB Simulator — Public API for MCP/AI integration
 * (c) Andrea Marro — 28/02/2026 — ELAB Tutor — Tutti i diritti riservati
 * Provides a global window.__ELAB_API object for external systems to interact
 * with the simulator programmatically.
 *
 * Includes UNLIM AI bridge (highlight, serialWrite, callbacks),
 * pub/sub event system, and full simulation control.
 *
 * Usage from MCP/external:
 *   window.__ELAB_API.loadExperiment('v1-cap6-primo-circuito')
 *   window.__ELAB_API.getExperimentList()
 *   window.__ELAB_API.captureScreenshot()
 *   window.__ELAB_API.askUNLIM('Spiega questo circuito')
 *   window.__ELAB_API.unlim.highlightComponent(['led1', 'r1'])
 *   window.__ELAB_API.on('stateChange', console.log)
 *
 * © Andrea Marro — 12/02/2026
 */

import { findExperimentById, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../data/experiments-index';
import { sendChat, analyzeImage, compileCode } from './api';
import { logError } from './unlimContextCollector';
import { captureWhiteboardScreenshot } from '../utils/whiteboardScreenshot';
import * as voiceService from './voiceService';
import { sendNudge } from './nudgeService';
import projectHistoryService from './projectHistoryService';
import { recordUnlimEvent } from './unlimSharedStateStore';

/**
 * Internal reference to the simulator instance (set by NewElabSimulator)
 */
let _simulatorRef = null;

function mountExperimentInSimulator(arg) {
  const experimentId = typeof arg === 'string' ? arg : (arg?.id || arg?.experimentId);
  if (!experimentId) return false;
  if (!_simulatorRef?.selectExperiment) return false;
  const exp = findExperimentById(experimentId);
  if (!exp) return false;
  _simulatorRef.selectExperiment(exp);
  emitSimulatorEvent('experimentChange', {
    id: exp.id,
    experimentId: exp.id,
    title: exp.title,
    mode: exp.simulationMode,
    steps: exp.buildSteps || [],
    totalSteps: Array.isArray(exp.buildSteps) ? exp.buildSteps.length : 0,
  });
  return true;
}

/**
 * Register the simulator instance for API access
 * Called by NewElabSimulator on mount
 */
export function registerSimulatorInstance(instance) {
  _simulatorRef = instance;
  // FIX P0-8: Guard against duplicate registration (React StrictMode double-mount)
  if (typeof window !== 'undefined' && !window.__ELAB_API) {
    window.__ELAB_API = createPublicAPI();
  } else if (typeof window !== 'undefined') {
    // Update internal ref without re-creating the API object
  }
}

/**
 * Unregister on unmount
 */
export function unregisterSimulatorInstance() {
  _simulatorRef = null;
  if (typeof window !== 'undefined') {
    delete window.__ELAB_API;
    delete window.__ELAB_EVENTS;
  }
}

/**
 * Create the public API object
 */
function createPublicAPI() {
  const totalExperiments = [EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3]
    .reduce((total, volume) => total + (volume?.experiments?.length || 0), 0);

  return {
    // ─── Info ───
    version: '1.0.0',
    name: 'ELAB Simulator API',

    // ─── Experiment Management ───

    /**
     * Get list of all experiments grouped by volume
     * @returns {Promise<Object>} { vol1: [...], vol2: [...], vol3: [...] }
     */
    getExperimentList() {
      const format = (vol) => vol.experiments.map(e => ({
        id: e.id,
        title: e.title,
        chapter: e.chapter,
        difficulty: e.difficulty,
        mode: e.simulationMode,
        hasCode: !!e.code,
        concept: e.concept,
      }));
      return {
        vol1: format(EXPERIMENTS_VOL1),
        vol2: format(EXPERIMENTS_VOL2),
        vol3: format(EXPERIMENTS_VOL3),
      };
    },

    /**
     * Get full experiment data by ID
     * @param {string} experimentId - e.g. 'v1-cap6-primo-circuito'
     * @returns {Object|null} Full experiment object
     */
    getExperiment(experimentId) {
      return findExperimentById(experimentId) || null;
    },

    /**
     * Load an experiment into the simulator
     * @param {string} experimentId
     * @returns {boolean} success
     */
    loadExperiment(experimentId) {
      if (!_simulatorRef?.selectExperiment) return false;
      const exp = findExperimentById(experimentId);
      if (!exp) return false;
      // iter 45 fix Andrea video 06/05/2026: inject buildMode 'guided' quando esperimento
      // ha buildSteps[]. Allinea a ExperimentPicker.jsx:202 che faceva la stessa iniezione
      // solo nel suo flusso click. Senza questa iniezione, INIZIA Bentornati / loadExperiment
      // da useGalileoChat / loadExperiment da PercorsoPanel non triggeravano ComponentDrawer
      // (vero pannello Passo Passo click-by-click).
      const hasBuildSteps = Array.isArray(exp.buildSteps) && exp.buildSteps.length > 0;
      const enriched = exp.buildMode
        ? exp
        : { ...exp, buildMode: hasBuildSteps ? 'guided' : false };
      _simulatorRef.selectExperiment(enriched);
      emitSimulatorEvent('experimentChange', {
        id: enriched.id,
        experimentId: enriched.id,
        title: enriched.title,
        mode: enriched.simulationMode,
        steps: enriched.buildSteps || [],
        totalSteps: Array.isArray(enriched.buildSteps) ? enriched.buildSteps.length : 0,
      });
      return true;
    },

    /**
     * Get current experiment info
     * @returns {Object|null}
     */
    getCurrentExperiment() {
      return _simulatorRef?.getCurrentExperiment?.() || null;
    },

    // ─── Simulation Control ───

    /**
     * Start simulation
     */
    play() {
      _simulatorRef?.play?.();
    },

    /**
     * Pause simulation
     */
    pause() {
      _simulatorRef?.pause?.();
    },

    /**
     * Reset simulation
     */
    reset() {
      _simulatorRef?.reset?.();
    },

    /**
     * Get current component states
     * @returns {Object} componentId -> state
     */
    getComponentStates() {
      return _simulatorRef?.getComponentStates?.() || {};
    },

    /**
     * Interact with a component (press button, set pot value, etc.)
     * @param {string} componentId
     * @param {string} action - 'press', 'release', 'toggle', 'setPosition', 'setLightLevel'
     * @param {*} value - optional value for setPosition/setLightLevel
     */
    interact(componentId, action, value) {
      _simulatorRef?.interact?.(componentId, action, value);
    },

    /**
     * Add a custom wire to the layout
     * @param {string} fromPin - format "componentId:pinId"
     * @param {string} toPin - format "componentId:pinId"
     */
    addWire(fromPin, toPin) {
      return _simulatorRef?.addWire?.(fromPin, toPin) || null;
    },

    /**
     * Remove a wire by its numerical index
     * @param {number} index
     */
    removeWire(index) {
      _simulatorRef?.removeWire?.(index);
    },

    /**
     * Add a custom component to the specific coordinates
     * @param {string} type 
     * @param {Object} position - {x, y}
     * @returns {string|null} The generated component ID
     */
    addComponent(type, position) {
      return _simulatorRef?.addComponent?.(type, position) || null;
    },

    /**
     * Remove a component by ID
     * @param {string} id
     */
    removeComponent(id) {
      _simulatorRef?.removeComponent?.(id);
    },

    /**
     * Get the currently selected component ID (if any)
     * @returns {string|null} component ID or null
     */
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    getSelectedComponent() {
      return _simulatorRef?.getSelectedComponent?.() || null;
    },

    // ─── UNLIM ONNIPOTENTE: Extended breadboard manipulation ───

    /**
     * Move a component to new coordinates
     * @param {string} componentId
     * @param {number} x - horizontal position
     * @param {number} y - vertical position
     */
    moveComponent(componentId, x, y) {
      _simulatorRef?.moveComponent?.(componentId, x, y);
    },

    /**
     * Clear all custom components, connections, and layout
     * Saves an undo snapshot before clearing
     */
    clearAll() {
      _simulatorRef?.clearAll?.();
    },

    // ─── UNLIM ONNIPOTENTE v2: Circuit manipulation for AI ───

    /**
     * Set a component property (value, color, etc.)
     * @param {string} id - component ID (e.g. "r1", "led1")
     * @param {string} field - property name: 'value' | 'color'
     * @param {*} value - new value (number for resistors/capacitors, string for colors)
     */
    setComponentValue(id, field, value) {
      _simulatorRef?.setComponentValue?.(id, field, value);
    },

    /**
     * Connect two pins with a wire (semantic alias for addWire)
     * @param {string} fromPin - format "componentId:pinId" (e.g. "bat1:positive")
     * @param {string} toPin - format "componentId:pinId" (e.g. "bb1:bus-top-plus-1")
     */
    connectWire(fromPin, toPin) {
      _simulatorRef?.addWire?.(fromPin, toPin);
    },

    /**
     * Clear the entire circuit (components + wires)
     * Semantic alias for clearAll — used by UNLIM voice/AI commands
     */
    clearCircuit() {
      _simulatorRef?.clearAll?.();
    },

    /**
     * Mount a complete experiment: reset current state, then load.
     * Emits 'experimentChange' event on success.
     * @param {string} experimentId - e.g. 'v1-cap6-primo-circuito'
     * @returns {boolean} success
     */
    mountExperiment(arg) {
      // Iter 42 P0 BUG-2 FIX: accept BOTH positional string AND object {id}/{experimentId}
      // (Mistral function calling intentsDispatcher passes args object, not positional string)
      return mountExperimentInSimulator(arg);
    },

    /**
     * Get a human-readable description of the current circuit.
     * Used by UNLIM to answer "che componenti ci sono?", "il circuito è corretto?".
     * @returns {string} Italian description of the circuit
     */
    getCircuitDescription() {
      const state = _simulatorRef?.getCircuitState?.();
      if (!state) return 'Nessun circuito caricato.';

      const exp = state.experiment || {};
      const comps = state.components || [];
      const conns = state.connections || [];

      const COMP_NAMES_IT = {
        'resistor': 'resistore',
        'led': 'LED',
        'rgb-led': 'LED RGB',
        'battery9v': 'batteria 9V',
        'breadboard-half': 'breadboard',
        'breadboard-full': 'breadboard grande',
        'capacitor': 'condensatore',
        'pushbutton': 'pulsante',
        'potentiometer': 'potenziometro',
        'buzzer': 'cicalino',
        'photoresistor': 'fotoresistore',
        'ldr': 'LDR',
        'servo': 'servo',
        'lcd16x2': 'display LCD',
        'nano-r4': 'Arduino Nano',
        'multimeter': 'multimetro',
        'diode': 'diodo',
        'motor-dc': 'motore DC',
        'transistor': 'transistore',
        'reed-switch': 'reed switch',
        'mosfet-n': 'MOSFET',
        'wire': 'filo',
      };

      if (comps.length === 0) return 'Il circuito è vuoto.';

      const compList = comps
        .filter(c => c.type !== 'breadboard-half' && c.type !== 'breadboard-full')
        .map(c => {
          const name = COMP_NAMES_IT[c.type] || c.type;
          let detail = '';
          if (c.type === 'resistor' && c.value) {
            const v = c.value;
            detail = v >= 1000 ? ` da ${v / 1000}kΩ` : ` da ${v}Ω`;
          } else if (c.type === 'led' && c.color) {
            const colors = { red: 'rosso', green: 'verde', yellow: 'giallo', blue: 'blu', white: 'bianco' };
            detail = ` ${colors[c.color] || c.color}`;
          } else if (c.type === 'capacitor' && c.value) {
            detail = ` da ${c.value}µF`;
          }
          const on = c.state?.on;
          const state = on === true ? ' [acceso]' : on === false ? ' [spento]' : '';
          return `${name}${detail}${state} (${c.id})`;
        });

      const expName = exp.title ? `Esperimento: "${exp.title}". ` : '';
      const simStatus = state.isSimulating ? 'Simulazione in corso. ' : '';
      const compText = compList.length > 0
        ? `Componenti sul kit fisico ELAB (breadboard): ${compList.join(', ')}.`
        : 'Nessun componente attivo sul kit.';
      const wireText = conns.length > 0
        ? ` Fili: ${conns.length} collegament${conns.length > 1 ? 'i' : 'o'} sulla breadboard.`
        : ' Nessun filo collegato sulla breadboard.';

      return `${expName}${simStatus}${compText}${wireText}`;
    },

    /**
     * Get full structured circuit state.
     * Top-level alias required by UNLIM live awareness and Playwright QA.
     * @returns {Object}
     */
    getCircuitState() {
      return _simulatorRef?.getCircuitState?.() || _simulatorRef?.getComponentStates?.() || {};
    },

    /**
     * Get positions of all components in current experiment
     * @returns {Object} componentId -> { x, y, type }
     */
    getComponentPositions() {
      return _simulatorRef?.getComponentPositions?.() || {};
    },

    /**
     * Get full layout info (components, connections, layout)
     * @returns {Object} { components, connections, layout }
     */
    getLayout() {
      return _simulatorRef?.getLayout?.() || {};
    },

    // ─── Screenshot & AI ───

    /**
     * Capture a screenshot of the current canvas
     * @returns {Promise<string|null>} base64 PNG data URL or null
     */
    async captureScreenshot() {
      const whiteboardShot = captureWhiteboardScreenshot();
      if (whiteboardShot.dataUrl) return whiteboardShot.dataUrl;

      const svgEl = document.querySelector('.elab-simulator-canvas svg');
      if (!svgEl) return null;

      try {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        canvas.width = Math.min(img.width || 800, 1200);
        canvas.height = Math.min(img.height || 600, 900);
        ctx.fillStyle = '#FAFAF7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        return dataUrl;
      } catch {
        return null;
      }
    },

    /**
     * Ask UNLIM AI about the current experiment
     * @param {string} customPrompt - Optional custom prompt (overrides unlimPrompt)
     * @returns {Promise<Object>} { success, response, source }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
     */
    async askUNLIM(customPrompt = null) {
      const exp = _simulatorRef?.getCurrentExperiment?.();
      const prompt = customPrompt || exp?.unlimPrompt ||
        `Spiega l'esperimento "${exp?.title || 'corrente'}" in modo semplice per bambini.`;

      // Try to capture screenshot
      const screenshot = await this.captureScreenshot();
      const images = screenshot
        ? [{ base64: screenshot.split(',')[1], mimeType: 'image/png' }]
        : [];

      return await sendChat(prompt, images);
    },

    /**
     * Send an image to UNLIM for analysis
     * @param {string} imageDataUrl - data:image/png;base64,...
     * @param {string} question
     * @returns {Promise<Object>}
     */
    async analyzeImage(imageDataUrl, question) {
      return await analyzeImage(imageDataUrl, question);
    },

    // ─── Compilation ───

    /**
     * Compile Arduino code
     * @param {string} code - Arduino .ino code
     * @param {string} board - FQBN (default: arduino:avr:nano)
     * @returns {Promise<Object>} { success, hex, errors, output }
     */
    async compile(code, board = 'arduino:avr:nano:cpu=atmega328old') {
      const liveCode = code ?? _simulatorRef?.getEditorCode?.() ?? '';
      const result = (typeof _simulatorRef?.compileAndLoad === 'function'
        ? await _simulatorRef.compileAndLoad(liveCode, board)
        : await compileCode(liveCode, board))
        || { success: false, errors: 'Compilazione senza risultato', output: null };
      if (!result.success && result.errors) {
        logError('compilation', result.errors);
      }
      return result;
    },

    /**
     * Get current editor code
     * @returns {string|null}
     */
    getEditorCode() {
      return _simulatorRef?.getEditorCode?.() || null;
    },

    /**
     * Set editor code
     * @param {string} code
     */
    setEditorCode(code) {
      _simulatorRef?.setEditorCode?.(code);
    },

    // ─── S76: Editor Control (Scratch Universale) ───

    /**
     * Show the code editor panel
     */
    showEditor() {
      _simulatorRef?.showEditor?.();
    },

    /**
     * Hide the code editor panel
     */
    hideEditor() {
      _simulatorRef?.hideEditor?.();
    },

    /**
     * Switch editor mode
     * @param {string} mode - 'arduino' or 'scratch'
     */
    setEditorMode(mode) {
      _simulatorRef?.setEditorMode?.(mode);
    },

    /**
     * Get current editor mode
     * @returns {string} 'arduino' or 'scratch'
     */
    getEditorMode() {
      return _simulatorRef?.getEditorMode?.() || 'arduino';
    },

    /**
     * Check if editor is visible
     * @returns {boolean}
     */
    isEditorVisible() {
      return _simulatorRef?.isEditorVisible?.() || false;
    },

    /**
     * Load a Blockly workspace XML and switch to Scratch mode
     * @param {string} xml - Blockly workspace XML
     */
    loadScratchWorkspace(xml) {
      if (!_simulatorRef?.loadScratchWorkspace) return false;
      _simulatorRef.loadScratchWorkspace(xml);
      return true;
    },

    // ─── S115: UNLIM Onnipotente v2 — Extended Control ───

    /** Undo last action */
    undo() { _simulatorRef?.undo?.(); },

    /** Redo last undone action */
    redo() { _simulatorRef?.redo?.(); },

    /** @returns {boolean} Whether undo is available */
    canUndo() { return _simulatorRef?.canUndo?.() || false; },

    /** @returns {boolean} Whether redo is available */
    canRedo() { return _simulatorRef?.canRedo?.() || false; },

    /**
     * Highlight specific pins on the canvas
     * @param {string|string[]} pinRefs - e.g. "r1:pin1" or ["r1:pin1", "led1:anode"]
     */
    highlightPin(pinRefs) {
      const refs = Array.isArray(pinRefs) ? pinRefs : [pinRefs];
      _simulatorRef?.highlightPin?.(refs);
    },

    /**
     * Write text to the serial monitor (AVR experiments)
     * @param {string} text
     */
    serialWrite(text) { _simulatorRef?.serialWrite?.(text); },

    /**
     * Switch build mode
     * @param {string} mode - 'complete' | 'guided' | 'sandbox'
     */
    setBuildMode(mode) { _simulatorRef?.setBuildMode?.(mode); },

    /** @returns {string|false} Current build mode */
    getBuildMode() { return _simulatorRef?.getBuildMode?.() || false; },

    /** Set tool mode: 'select' or 'wire' */
    setToolMode(mode) { _simulatorRef?.setToolMode?.(mode); },

    /** @returns {string} Current tool mode ('select' or 'wire') */
    getToolMode() { return _simulatorRef?.getToolMode?.() || 'select'; },

    /** Advance to next build step (Passo Passo) */
    nextStep() { _simulatorRef?.nextStep?.(); },

    /** Go back to previous build step (Passo Passo) */
    prevStep() { _simulatorRef?.prevStep?.(); },

    /**
     * Set current build step index (Passo Passo)
     * @param {number} index - -1 intro/base only, 0..n progressive steps, Infinity complete
     */
    setBuildStepIndex(index) { _simulatorRef?.setBuildStepIndex?.(index); },

    /** Reset guided build to intro/base-only state */
    resetBuildSteps() { _simulatorRef?.resetBuildSteps?.(); },

    /** @returns {number} Current build step index */
    getBuildStepIndex() { return _simulatorRef?.getBuildStepIndex?.() ?? -1; },

    /** Show the Bill of Materials panel */
    showBom() { _simulatorRef?.showBom?.(); },

    /** Hide the Bill of Materials panel */
    hideBom() { _simulatorRef?.hideBom?.(); },

    /** Show the serial monitor (opens editor + switches to monitor tab) */
    showSerialMonitor() { _simulatorRef?.showSerialMonitor?.(); },

    /** @returns {boolean} Whether simulation is running */
    isSimulating() { return _simulatorRef?.isSimulating?.() || false; },

    /** @returns {string} 'running' or 'stopped' */
    getSimulationStatus() { return _simulatorRef?.getSimulationStatus?.() || 'stopped'; },

    // ─── S115: Code Control — UNLIM writes/reads Arduino code ───

    /**
     * Append code to the existing editor content
     * @param {string} code - Code to append
     */
    appendEditorCode(code) { _simulatorRef?.appendEditorCode?.(code); },

    /**
     * Reset editor code to experiment's original code
     */
    resetEditorCode() { _simulatorRef?.resetEditorCode?.(); },

    /**
     * Get the experiment's original code (before user edits)
     * @returns {string}
     */
    getExperimentOriginalCode() { return _simulatorRef?.getExperimentOriginalCode?.() || ''; },

    // ─── S104: Unified Simulator Context for UNLIM ───

    /**
     * Get full simulator context as a compact JSON payload.
     * Includes experiment, build mode, editor mode, components, wires,
     * simulation state, and last compilation result.
     * @returns {Object} Comprehensive simulator snapshot for UNLIM
     */
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    getSimulatorContext() {
      const circuitState = _simulatorRef?.getCircuitState?.() || {};
      const compilationSnapshot = _simulatorRef?.getCompilationSnapshot?.() || {};
      const exp = circuitState.experiment || {};

      // Build step phase detection (hardware vs code)
      const buildStepIndex = circuitState.buildStepIndex ?? -1;
      const buildStepTotal = circuitState.buildStepTotal ?? 0;
      let buildPhase = 'none';
      if (buildStepIndex >= 0 && buildStepTotal > 0) {
        // If build step index exceeds hardware steps count, we're in code phase
        buildPhase = 'hardware'; // default — could be refined with scratchSteps info
      }

      // Compact component list
      const components = (circuitState.components || []).map(c => ({
        type: c.type,
        id: c.id,
        placed: true,
        ...(c.state?.on !== undefined ? { on: c.state.on } : {}),
        ...(c.state?.brightness > 0 ? { brightness: c.state.brightness } : {}),
        ...(c.state?.value !== undefined ? { value: c.state.value } : {}),
      }));

      // Compact wire list
      const wires = (circuitState.connections || []).map(c => ({
        from: c.from,
        to: c.to,
      }));

      // Compilation result
      let lastCompilation = null;
      if (compilationSnapshot.status && compilationSnapshot.status !== 'idle') {
        lastCompilation = {
          success: compilationSnapshot.status === 'success',
          ...(compilationSnapshot.size ? {
            size: `${compilationSnapshot.size.bytes}/${compilationSnapshot.size.total} bytes (${compilationSnapshot.size.percent}%)`
          } : {}),
          errors: compilationSnapshot.errors ? [compilationSnapshot.errors] : [],
          warnings: compilationSnapshot.warnings ? [compilationSnapshot.warnings] : [],
        };
      }

      return {
        experiment: {
          id: exp.id || null,
          name: exp.title || null,
          volume: exp.volume || null,
          chapter: exp.chapter || null,
          simulationMode: circuitState.status === 'avr' ? 'avr' : (exp.id?.startsWith('v3') ? 'avr' : 'circuit'),
        },
        buildMode: circuitState.buildMode || 'mounted',
        buildStep: buildStepTotal > 0 ? {
          current: buildStepIndex + 1,
          total: buildStepTotal,
          phase: buildPhase,
        } : null,
        editorMode: _simulatorRef?.getEditorMode?.() || 'arduino',
        editorVisible: _simulatorRef?.isEditorVisible?.() || false,
        components,
        wires,
        simulation: {
          state: circuitState.isSimulating ? 'running' : 'stopped',
        },
        lastCompilation,
      };
    },

    // ─── UNLIM AI Bridge ───
    /* Andrea Marro — 12/02/2026 */
    unlim: {
      /**
       * Highlight one or more components on the canvas
       * @param {string|string[]} componentIds - e.g. "led1" or ["r1", "led1"]
       */
      highlightComponent(componentIds) {
        const ids = Array.isArray(componentIds) ? componentIds : [componentIds];
        _simulatorRef?.setHighlightedComponents?.(ids);
      },

      /**
       * Highlight one or more pins
       * @param {string|string[]} pinRefs - e.g. "bat1:positive" or ["r1:pin1", "led1:anode"]
       */
      highlightPin(pinRefs) {
        const refs = Array.isArray(pinRefs) ? pinRefs : [pinRefs];
        _simulatorRef?.setHighlightedPins?.(refs);
      },

      /**
       * Clear all highlights (components and pins)
       */
      clearHighlights() {
        _simulatorRef?.setHighlightedComponents?.([]);
        _simulatorRef?.setHighlightedPins?.([]);
      },

      /**
       * Mount a complete experiment through the UNLIM namespace.
       * Mirrors top-level mountExperiment so Fumetto cliffhangers and direct
       * UNLIM callers share the same public API contract.
       * @param {string|{id?: string, experimentId?: string}} arg
       * @returns {boolean} success
       */
      mountExperiment(arg) {
        return mountExperimentInSimulator(arg);
      },

      /**
       * Toggle diagnostic mode used by Già Montato / UNLIM checks.
       * Defensive no-op when the mounted simulator does not implement it yet.
       * @param {boolean|{enabled?: boolean, on?: boolean}} arg
       */
      setDiagnoseMode(arg) {
        const enabled = typeof arg === 'object' ? Boolean(arg.enabled ?? arg.on) : Boolean(arg);
        _simulatorRef?.setDiagnoseMode?.(enabled);
        return { ok: true, enabled };
      },

      /**
       * Write text to the serial monitor (for AVR experiments)
       * @param {string} text
       */
      serialWrite(text) {
        _simulatorRef?.serialWrite?.(text);
      },

      /**
       * Get full circuit state
       * @returns {Object}
       */
      getCircuitState() {
        // Use the new structured API if available
        return _simulatorRef?.getCircuitState?.() || _simulatorRef?.getComponentStates?.() || {};
      },

      // ─── Sprint 6 Day 37 — OpenClaw declared handlers ───
      // Each handler returns a documented shape. Wired = delegates to real
      // service. Event-stub = emits __ELAB_EVENTS for UI listeners (Day 38+).

      /**
       * Speak text via TTS chain (Kokoro → Edge → Nanobot).
       * @param {{text:string}|string} arg
       * @returns {Promise<{ok:boolean, error?:string}>}
       */
      async speakTTS(arg) {
        const text = typeof arg === 'string' ? arg : arg?.text;
        if (!text) return { ok: false, error: 'empty text' };
        try {
          const audio = await voiceService.synthesizeSpeech(text);
          await voiceService.playAudio(audio);
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e?.message || String(e) };
        }
      },

      /**
       * Start microphone recording. Returns control object with stop()/cancel().
       * @param {{sessionId?:string, experimentId?:string}} opts
       * @returns {{ok:boolean, stop:()=>Promise<object>, cancel:()=>Promise<void>}}
       */
      listenSTT(opts = {}) {
        let started = true;
        const ready = voiceService.startRecording().then((ok) => { started = ok; return ok; });
        return {
          ready,
          get ok() { return started; },
          async stop() {
            await ready;
            if (!started) return { ok: false, error: 'mic denied' };
            const blob = await voiceService.stopRecording();
            if (!blob) return { ok: false, error: 'no audio' };
            const result = await voiceService.sendVoiceChat(blob, opts);
            return { ok: true, ...result };
          },
          async cancel() {
            await ready;
            voiceService.cancelRecording();
          },
        };
      },

      /**
       * Persist a session snapshot (code + note) per project.
       * Wraps projectHistoryService.saveSnapshot (localStorage layer).
       * @param {{projectId:string, code?:string, note?:string, experimentId?:string, volume?:string|number, chapter?:string|number}} payload
       * @returns {{ok:boolean, projectId?:string, error?:string}}
       */
      saveSessionMemory(payload = {}) {
        if (!payload.projectId) return { ok: false, error: 'projectId required' };
        try {
          projectHistoryService.saveSnapshot(payload.projectId, {
            code: payload.code || '',
            note: payload.note || '',
            experimentId: payload.experimentId || payload.projectId,
            volume: payload.volume || null,
            chapter: payload.chapter || null,
          });
          return { ok: true, projectId: payload.projectId };
        } catch (e) {
          return { ok: false, error: e?.message || String(e) };
        }
      },

      /**
       * Recall past session timeline + narrative for a project.
       * @param {{projectId:string, limit?:number}} opts
       * @returns {{ok:boolean, snapshots?:Array, story?:string, error?:string}}
       */
      recallPastSession(opts = {}) {
        if (!opts.projectId) return { ok: false, error: 'projectId required' };
        try {
          let snapshots = projectHistoryService.getTimeline(opts.projectId) || [];
          if (typeof opts.limit === 'number' && opts.limit >= 0) {
            snapshots = snapshots.slice(0, opts.limit);
          }
          const story = projectHistoryService.getStory(opts.projectId);
          return { ok: true, snapshots, story };
        } catch (e) {
          return { ok: false, error: e?.message || String(e) };
        }
      },

      /**
       * Send a nudge from teacher to a specific student.
       * @param {{studentId:string, studentName?:string, message:string, classId?:string, teacherId?:string}} payload
       * @returns {{ok:boolean, id?:string, error?:string}}
       */
      showNudge(payload = {}) {
        if (!payload.studentId || !payload.message) {
          return { ok: false, error: 'studentId + message required' };
        }
        try {
          const result = sendNudge(
            payload.studentId,
            payload.studentName || '',
            payload.message,
            { classId: payload.classId, teacherId: payload.teacherId }
          );
          return { ok: true, id: result?.id, timestamp: result?.timestamp };
        } catch (e) {
          return { ok: false, error: e?.message || String(e) };
        }
      },

      /**
       * Alert teacher about session anomaly (re-uses nudge channel inverted).
       * @param {{severity?:'info'|'warning'|'critical', message:string, studentId?:string, context?:object}} payload
       */
      alertDocente(payload = {}) {
        const severity = payload.severity || 'info';
        const message = payload.message || 'alert';
        try {
          sendNudge(
            payload.studentId || 'teacher_alert',
            'docente',
            `[${severity.toUpperCase()}] ${message}`,
            { teacherId: 'system', classId: payload.context?.classId }
          );
          return { ok: true, severity };
        } catch (e) {
          return { ok: false, severity, error: e?.message || String(e) };
        }
      },

      /**
       * Request quiz generation. Event-stub: QuizPanel listener wires Day 38+.
       * @param {{experimentId:string, count?:number, difficulty?:string}} opts
       */
      generateQuiz(opts = {}) {
        const requestId = 'q_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const payload = {
          requestId,
          experimentId: opts.experimentId || null,
          count: typeof opts.count === 'number' ? opts.count : 3,
          difficulty: opts.difficulty || 'easy',
        };
        emitSimulatorEvent('quizRequested', payload);
        return { ok: true, requestId };
      },

      /**
       * Request fumetto export. Iter 13 atom F3: also dispatches voice-style
       * 'createReport' event so LavagnaShell handler opens the report window
       * even if the consumer of __ELAB_API has no fumettoExportRequested
       * listener wired (preserves Day 38+ event-stub path while making the
       * action work end-to-end via the existing LavagnaShell wire-up).
       * @param {{sessionData?:object, format?:'pdf'|'png', preview?:boolean}} opts
       */
      exportFumetto(opts = {}) {
        const payload = {
          sessionData: opts.sessionData || {},
          format: opts.format || 'pdf',
          preview: !!opts.preview,
          requestedAt: new Date().toISOString(),
        };
        emitSimulatorEvent('fumettoExportRequested', payload);
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          try {
            window.dispatchEvent(new CustomEvent('elab-voice-command', {
              detail: { action: 'createReport', source: 'exportFumetto' },
            }));
          } catch { /* silent */ }
        }
        return { ok: true, format: payload.format, preview: payload.preview };
      },

      /**
       * Request video load. Event-stub: video component listener Day 38+.
       * @param {{url:string, autoplay?:boolean, mute?:boolean}} opts
       */
      videoLoad(opts = {}) {
        if (!opts.url) return { ok: false, error: 'url required' };
        const payload = {
          url: opts.url,
          autoplay: opts.autoplay !== false,
          mute: !!opts.mute,
        };
        emitSimulatorEvent('videoLoadRequested', payload);
        return { ok: true };
      },

      /**
       * Send a text message to the UNLIM chat from outside the chat UI.
       * Used by wake word, percorso panel, error toast, experiment picker.
       * Dispatches a window event; useGalileoChat listens and invokes handleSend.
       * @param {string} text
       */
      sendMessage(text) {
        if (typeof window === 'undefined' || !text) return;
        window.dispatchEvent(new CustomEvent('elab-unlim-send', { detail: { text } }));
      },

      version: '1.1.0',
      info: {
        name: 'ELAB Simulator — UNLIM Bridge',
        author: 'Andrea Marro',
        modes: ['circuit', 'avr'],
        totalExperiments,
        sprint6Handlers: 9,
      },
    },

    // ─── Events (pub/sub) ───

    /**
     * Listen for simulator events
     * @param {string} event - 'experimentChange', 'stateChange', 'serialOutput', 'componentInteract', 'circuitChange'
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    on(event, callback) {
      if (!window.__ELAB_EVENTS) window.__ELAB_EVENTS = {};
      if (!window.__ELAB_EVENTS[event]) window.__ELAB_EVENTS[event] = [];
      window.__ELAB_EVENTS[event].push(callback);
      return () => {
        window.__ELAB_EVENTS[event] = window.__ELAB_EVENTS[event].filter(cb => cb !== callback);
      };
    },

    /**
     * Unsubscribe from simulator events
     * @param {string} event
     * @param {Function} callback - the exact function reference passed to on()
     */
    off(event, callback) {
      if (window.__ELAB_EVENTS?.[event]) {
        window.__ELAB_EVENTS[event] = window.__ELAB_EVENTS[event].filter(cb => cb !== callback);
      }
    },
  };
}

/**
 * Emit an event to all listeners
 * @param {string} event
 * @param {*} data
 */
export function emitSimulatorEvent(event, data) {
  try { recordUnlimEvent(event, data); } catch { /* shared state is best effort */ }
  if (typeof window !== 'undefined' && window.__ELAB_EVENTS?.[event]) {
    window.__ELAB_EVENTS[event].forEach(cb => {
      try { cb(data); } catch { /* event handler error — silent */ }
    });
  }
}
