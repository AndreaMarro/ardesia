/**
 * UNLIM Context Collector — Raccoglie TUTTO il contesto del simulatore per UNLIM
 * (c) Andrea Marro — 14/04/2026 — ELAB Tutor — Tutti i diritti riservati
 *
 * Prima di ogni sendChat, raccoglie:
 *   a. circuitState (componenti, connessioni, stato)
 *   b. Codice Arduino attuale nell'editor (se Vol3)
 *   c. Errori compilazione se presenti
 *   d. Step corrente nel Passo Passo (N di M)
 *   e. Tempo trascorso sull'esperimento
 *   f. Esperimenti completati dallo studente (da unlimMemory)
 */

import logger from '../utils/logger';
import {
  buildAgentDecisionSeed,
  getUnlimSharedState,
  recordUnlimSnapshot,
} from './unlimSharedStateStore';

const MEMORY_KEY = 'elab_unlim_memory';
const SESSIONS_KEY = 'elab_unlim_sessions';
const ERROR_HISTORY_KEY = 'elab_error_history';
const LIVE_NARRATIVE_KEY = 'elab_unlim_live_narrative';
const MAX_LIVE_SNAPSHOTS = 8;

let liveNarrativeTimer = null;
let liveNarrativeBusy = false;
let latestVisualSnapshot = null;
let liveNarrativeEntries = [];

/**
 * Log an error to the session error history (for AI context)
 * @param {string} type - Error type: 'compilation', 'circuit', 'runtime'
 * @param {string} message - Error message
 */
export function logError(type, message) {
  try {
    const history = JSON.parse(sessionStorage.getItem(ERROR_HISTORY_KEY) || '[]');
    history.push({ type, message: String(message).slice(0, 200), ts: Date.now() });
    // Keep max 20 entries
    if (history.length > 20) history.splice(0, history.length - 20);
    sessionStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history));
  } catch { /* silent */ }
}

/**
 * Get the __ELAB_API safely
 * @returns {Object|null}
 */
function getAPI() {
  return (typeof window !== 'undefined' && window.__ELAB_API) || null;
}

function readStoredNarrative() {
  try {
    const raw = sessionStorage.getItem(LIVE_NARRATIVE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-MAX_LIVE_SNAPSHOTS);
  } catch {
    /* fall back to memory */
  }
  return liveNarrativeEntries.slice(-MAX_LIVE_SNAPSHOTS);
}

function writeStoredNarrative(entries) {
  liveNarrativeEntries = entries.slice(-MAX_LIVE_SNAPSHOTS);
  try {
    sessionStorage.setItem(LIVE_NARRATIVE_KEY, JSON.stringify(liveNarrativeEntries));
  } catch { /* session storage may be full or unavailable */ }
}

function summarizeSnapshot({ simulatorContext, circuitDescription, editorCode, visualAvailable, reason }) {
  const components = simulatorContext?.components || simulatorContext?.circuit?.components || [];
  const wires = simulatorContext?.wires || simulatorContext?.circuit?.wires || simulatorContext?.circuit?.connections || [];
  const exp = simulatorContext?.experiment || simulatorContext?.circuit?.experiment || {};
  const buildStep = simulatorContext?.buildStep || null;
  const simulationState = simulatorContext?.simulation?.state
    || (simulatorContext?.circuit?.simulation?.state)
    || (simulatorContext?.circuit?.isSimulating ? 'running' : 'stopped');
  const editorMode = simulatorContext?.editorMode || null;

  const parts = [];
  if (exp?.id || exp?.name) parts.push(`esperimento ${exp.name || exp.id}`);
  if (buildStep?.current) parts.push(`passo ${buildStep.current}/${buildStep.total || '?'}`);
  parts.push(`${components.length} componenti`);
  parts.push(`${wires.length} fili`);
  if (simulationState) parts.push(`simulazione ${simulationState}`);
  if (editorMode) parts.push(`editor ${editorMode}`);
  if (visualAvailable) parts.push('screenshot app disponibile');

  return {
    ts: Date.now(),
    reason,
    experimentId: exp?.id || null,
    experimentName: exp?.name || exp?.title || null,
    buildStep,
    editorMode,
    editorVisible: simulatorContext?.editorVisible ?? null,
    simulationState,
    componentsCount: components.length,
    wiresCount: wires.length,
    circuitDescription: circuitDescription ? String(circuitDescription).slice(0, 240) : null,
    editorCodePreview: editorCode ? String(editorCode).slice(0, 320) : null,
    hasVisualSnapshot: Boolean(visualAvailable),
    narrativeLine: parts.join(' | '),
  };
}

/**
 * Capture one compact application snapshot for UNLIM's live narrative.
 * Calls independent app/simulator getters in parallel; base64 images stay in
 * memory only, while the prompt receives compact metadata.
 */
export async function captureApplicationSnapshot({ includeVisual = false, reason = 'periodic' } = {}) {
  const api = getAPI();
  if (!api) return null;

  const tasks = [
    Promise.resolve().then(() => api.getSimulatorContext?.() || null),
    Promise.resolve().then(() => api.getCircuitDescription?.() || null),
    Promise.resolve().then(() => api.getEditorCode?.() || null),
    includeVisual
      ? Promise.resolve().then(() => api.captureScreenshot?.() || null)
      : Promise.resolve(null),
  ];

  const [ctxResult, descResult, codeResult, visualResult] = await Promise.allSettled(tasks);
  const simulatorContext = ctxResult.status === 'fulfilled' ? ctxResult.value : null;
  const circuitDescription = descResult.status === 'fulfilled' ? descResult.value : null;
  const editorCode = codeResult.status === 'fulfilled' ? codeResult.value : null;
  const visualDataUrl = visualResult.status === 'fulfilled' ? visualResult.value : null;

  if (typeof visualDataUrl === 'string' && visualDataUrl.startsWith('data:image/')) {
    latestVisualSnapshot = { dataUrl: visualDataUrl, mimeType: visualDataUrl.split(';')[0].split(':')[1] || 'image/png' };
  }

  const compact = summarizeSnapshot({
    simulatorContext,
    circuitDescription,
    editorCode,
    visualAvailable: Boolean(latestVisualSnapshot),
    reason,
  });

  const stored = readStoredNarrative();
  stored.push(compact);
  writeStoredNarrative(stored);
  recordUnlimSnapshot(compact, { reason });

  return {
    ...compact,
    visual: compact.hasVisualSnapshot ? { available: true, source: 'app-screenshot' } : { available: false },
  };
}

export function startApplicationNarrativeLoop({ intervalMs = 15000, includeVisual = true } = {}) {
  if (typeof window === 'undefined') return false;
  if (liveNarrativeTimer) return true;

  liveNarrativeTimer = window.setInterval(() => {
    if (liveNarrativeBusy) return;
    liveNarrativeBusy = true;
    captureApplicationSnapshot({ includeVisual, reason: 'periodic-15s' })
      .catch((err) => logger.warn?.('[unlimContextCollector] live narrative snapshot failed:', err?.message || err))
      .finally(() => { liveNarrativeBusy = false; });
  }, intervalMs);

  return true;
}

export function stopApplicationNarrativeLoop() {
  if (typeof window !== 'undefined' && liveNarrativeTimer) {
    window.clearInterval(liveNarrativeTimer);
  }
  liveNarrativeTimer = null;
  liveNarrativeBusy = false;
}

export function getApplicationSnapshots() {
  return readStoredNarrative();
}

export function getLatestVisualSnapshotImage() {
  return latestVisualSnapshot;
}

export function resetApplicationNarrativeForTests() {
  stopApplicationNarrativeLoop();
  liveNarrativeEntries = [];
  latestVisualSnapshot = null;
  try { sessionStorage.removeItem(LIVE_NARRATIVE_KEY); } catch { /* noop */ }
}

/**
 * (a) Collect full circuit state: components, connections, simulation status
 * @returns {Object|null}
 */
export function collectCircuitState() {
  const api = getAPI();
  if (!api) return null;

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx) return ctx;
  } catch { /* silent */ }

  // Fallback: build from individual calls
  try {
    const state = api.unlim?.getCircuitState?.();
    if (state) return state;
  } catch { /* silent */ }

  return null;
}

/**
 * (b) Collect Arduino code from editor (relevant for Vol3 experiments)
 * @returns {string|null}
 */
export function collectEditorCode() {
  const api = getAPI();
  if (!api) return null;

  try {
    return api.getEditorCode?.() || null;
  } catch { /* silent */ }
  return null;
}

/**
 * (c) Collect compilation errors if present
 * @returns {Object|null} { success, errors, warnings, size }
 */
export function collectCompilationErrors() {
  const api = getAPI();
  if (!api) return null;

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx?.lastCompilation) return ctx.lastCompilation;
  } catch { /* silent */ }

  return null;
}

/**
 * (d) Collect Passo Passo step: current step N of M
 * @returns {Object|null} { current, total, phase }
 */
export function collectBuildStep() {
  const api = getAPI();
  if (!api) return null;

  try {
    const ctx = api.getSimulatorContext?.();
    if (ctx?.buildStep) return ctx.buildStep;
  } catch { /* silent */ }

  // Fallback: use individual API methods
  try {
    const index = api.getBuildStepIndex?.();
    if (index !== undefined && index >= 0) {
      return { current: index + 1, total: null, phase: 'unknown' };
    }
  } catch { /* silent */ }

  return null;
}

/**
 * (e) Collect elapsed time on current experiment
 * @returns {number|null} elapsed time in seconds, or null
 */
export function collectElapsedTime() {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    if (sessions.length === 0) return null;

    const lastSession = sessions[sessions.length - 1];
    if (lastSession?.startTime && !lastSession.endTime) {
      // Active session
      return Math.round((Date.now() - new Date(lastSession.startTime).getTime()) / 1000);
    }
  } catch { /* silent */ }
  return null;
}

/**
 * (f) Collect completed experiments from unlimMemory
 * @returns {Object|null} { total, list: [{id, attempts, lastResult}] }
 */
export function collectCompletedExperiments() {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { total: 0, list: [] };

    const profile = JSON.parse(raw);
    const experiments = profile.experiments || {};
    const completed = Object.entries(experiments)
      .filter(([, v]) => v.completed)
      .map(([id, v]) => ({
        id,
        attempts: v.attempts || 1,
        lastResult: v.lastResult || 'unknown',
      }));

    return { total: completed.length, list: completed };
  } catch { /* silent */ }
  return { total: 0, list: [] };
}

/**
 * Collect ALL simulator context in one call.
 * Returns a unified object for sendChat's simulatorContext parameter.
 * @returns {Object} Full context snapshot
 */
export function collectFullContext() {
  const api = getAPI();
  const context = {};

  // (a) Circuit state
  const circuitState = collectCircuitState();
  if (circuitState) {
    context.circuit = circuitState;
  }

  // (b) Editor code (only for Vol3 / AVR experiments)
  const editorCode = collectEditorCode();
  if (editorCode) {
    // Truncate to 2000 chars to avoid huge payloads
    context.editorCode = editorCode.length > 2000
      ? editorCode.slice(0, 2000) + '\n// ... (troncato)'
      : editorCode;
  }

  // (c) Compilation errors
  const compilation = collectCompilationErrors();
  if (compilation) {
    context.compilation = compilation;
  }

  // (d) Build step (Passo Passo)
  const buildStep = collectBuildStep();
  if (buildStep) {
    context.buildStep = buildStep;
  }

  // (e) Elapsed time
  const elapsed = collectElapsedTime();
  if (elapsed !== null) {
    context.elapsedSeconds = elapsed;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  }

  // (f) Completed experiments
  const completed = collectCompletedExperiments();
  if (completed && completed.total > 0) {
    context.completedExperiments = completed;
  }

  // Extra: circuit description (human-readable, for AI context)
  try {
    const desc = api?.getCircuitDescription?.();
    if (desc && desc !== 'Nessun circuito caricato.') {
      context.circuitDescription = desc;
    }
  } catch { /* silent */ }

  // Extra: editor mode + visibility
  try {
    if (api) {
      const editorMode = api.getEditorMode?.();
      const editorVisible = api.isEditorVisible?.();
      if (editorMode) context.editorMode = editorMode;
      if (editorVisible !== undefined) context.editorVisible = editorVisible;
    }
  } catch { /* silent */ }

  // Extra: build mode
  try {
    const buildMode = api?.getBuildMode?.();
    if (buildMode) context.buildMode = buildMode;
  } catch { /* silent */ }

  // Extra: error history (recent compilation errors and circuit warnings)
  try {
    const errorHistory = JSON.parse(sessionStorage.getItem('elab_error_history') || '[]');
    if (errorHistory.length > 0) {
      context.recentErrors = errorHistory.slice(-5); // Last 5 errors
      context.errorCount = errorHistory.length;
    }
  } catch { /* silent */ }

  // Extra: failed attempts count on current experiment
  try {
    const memory = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}');
    const currentExpId = api?.getCurrentExperimentId?.();
    if (currentExpId && memory.experiments?.[currentExpId]) {
      const exp = memory.experiments[currentExpId];
      context.currentExperimentAttempts = exp.attempts || 0;
      context.currentExperimentHintsUsed = exp.hintsUsed || 0;
    }
  } catch { /* silent */ }

  // Extra: pin voltage measurements (for debugging help)
  try {
    const pinState = api?.getPinStates?.();
    if (pinState && Object.keys(pinState).length > 0) {
      context.pinStates = pinState;
    }
  } catch { /* silent */ }

  try {
    const narrative = getApplicationSnapshots();
    if (narrative.length > 0) {
      context.applicationNarrative = narrative.slice(-5);
    }
  } catch { /* silent */ }

  try {
    const sharedState = getUnlimSharedState();
    if (sharedState.revision > 0) {
      context.unlimSharedState = {
        revision: sharedState.revision,
        updatedAt: sharedState.updatedAt,
        latestSnapshot: sharedState.latestSnapshot,
        recentEvents: sharedState.events.slice(-8),
      };
    }
    context.agentDecisionSeed = buildAgentDecisionSeed({
      simulatorContext: context,
      narrativeContext: context.applicationNarrative?.at?.(-1) || null,
      albumContext: context.completedExperiments || null,
    });
  } catch { /* silent */ }

  logger.debug('[unlimContextCollector] Full context collected:', Object.keys(context));
  return context;
}
