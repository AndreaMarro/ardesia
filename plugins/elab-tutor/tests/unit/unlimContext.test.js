/**
 * UNLIM Context Collector — Unit Tests
 * Verifica che il contesto venga raccolto correttamente per UNLIM.
 * (c) Andrea Marro — 14/04/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  collectCircuitState,
  collectEditorCode,
  collectCompilationErrors,
  collectBuildStep,
  collectElapsedTime,
  collectCompletedExperiments,
  collectFullContext,
} from '../../src/services/unlimContextCollector';

// ── Mock localStorage data store ──
// The global setup.js mocks localStorage with vi.fn(), so we need to
// back it with a real Map for these tests.
const storageMap = new Map();
function setupLocalStorage() {
  localStorage.getItem.mockImplementation((key) => storageMap.get(key) ?? null);
  localStorage.setItem.mockImplementation((key, val) => storageMap.set(key, val));
  localStorage.removeItem.mockImplementation((key) => storageMap.delete(key));
  localStorage.clear.mockImplementation(() => storageMap.clear());
}

// ── Mock __ELAB_API ──
function mockAPI(overrides = {}) {
  const base = {
    getSimulatorContext: vi.fn(() => ({
      experiment: { id: 'v1-cap6-primo-circuito', name: 'Primo Circuito', volume: 1 },
      buildMode: 'mounted',
      buildStep: { current: 3, total: 8, phase: 'hardware' },
      editorMode: 'arduino',
      editorVisible: false,
      components: [
        { type: 'led', id: 'led1', placed: true, on: true },
        { type: 'resistor', id: 'r1', placed: true },
      ],
      wires: [{ from: 'bat1:positive', to: 'r1:pin1' }],
      simulation: { state: 'running' },
      lastCompilation: { success: true, errors: [], warnings: [] },
    })),
    getEditorCode: vi.fn(() => 'void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); }'),
    getCircuitDescription: vi.fn(() => 'Esperimento: "Primo Circuito". Simulazione in corso. Componenti: LED rosso [acceso] (led1), resistore da 220Ω (r1). Fili: 1 collegamento.'),
    getEditorMode: vi.fn(() => 'arduino'),
    isEditorVisible: vi.fn(() => true),
    getBuildMode: vi.fn(() => 'passopasso'),
    getBuildStepIndex: vi.fn(() => 2),
    getCurrentExperiment: vi.fn(() => ({ id: 'v1-cap6-primo-circuito', title: 'Primo Circuito' })),
    unlim: {
      getCircuitState: vi.fn(() => ({
        components: [{ type: 'led', id: 'led1' }],
        connections: [],
      })),
    },
    ...overrides,
  };
  window.__ELAB_API = base;
  return base;
}

function clearAPI() {
  delete window.__ELAB_API;
}

describe('unlimContextCollector', () => {
  beforeEach(() => {
    clearAPI();
    storageMap.clear();
    setupLocalStorage();
  });

  afterEach(() => {
    clearAPI();
    storageMap.clear();
  });

  // ── Test 1: collectCircuitState returns full context from getSimulatorContext ──
  it('1. collectCircuitState returns simulator context when API available', () => {
    mockAPI();
    const state = collectCircuitState();
    expect(state).toBeTruthy();
    expect(state.experiment.id).toBe('v1-cap6-primo-circuito');
    expect(state.components).toHaveLength(2);
    expect(state.wires).toHaveLength(1);
    expect(state.simulation.state).toBe('running');
  });

  // ── Test 2: collectCircuitState returns null when no API ──
  it('2. collectCircuitState returns null when __ELAB_API is absent', () => {
    clearAPI();
    const state = collectCircuitState();
    expect(state).toBeNull();
  });

  // ── Test 3: collectEditorCode returns Arduino code ──
  it('3. collectEditorCode returns editor code for Vol3', () => {
    mockAPI();
    const code = collectEditorCode();
    expect(code).toContain('void setup()');
    expect(code).toContain('digitalWrite');
  });

  // ── Test 4: collectCompilationErrors returns compilation info ──
  it('4. collectCompilationErrors returns compilation status', () => {
    mockAPI();
    const compilation = collectCompilationErrors();
    expect(compilation).toBeTruthy();
    expect(compilation.success).toBe(true);
    expect(compilation.errors).toEqual([]);
  });

  // ── Test 5: collectBuildStep returns Passo Passo step ──
  it('5. collectBuildStep returns current step N of M', () => {
    mockAPI();
    const step = collectBuildStep();
    expect(step).toBeTruthy();
    expect(step.current).toBe(3);
    expect(step.total).toBe(8);
    expect(step.phase).toBe('hardware');
  });

  // ── Test 6: collectElapsedTime returns seconds for active session ──
  it('6. collectElapsedTime returns elapsed seconds for active session', () => {
    const twoMinAgo = new Date(Date.now() - 120000).toISOString();
    localStorage.setItem('elab_unlim_sessions', JSON.stringify([
      { startTime: twoMinAgo, messages: [], errors: [], actions: [] },
    ]));

    const elapsed = collectElapsedTime();
    expect(elapsed).toBeGreaterThanOrEqual(119); // ~120 seconds
    expect(elapsed).toBeLessThan(125);
  });

  // ── Test 7: collectCompletedExperiments returns student history ──
  it('7. collectCompletedExperiments reads from unlimMemory', () => {
    localStorage.setItem('elab_unlim_memory', JSON.stringify({
      experiments: {
        'v1-cap6-primo-circuito': { completed: true, attempts: 3, lastResult: 'success' },
        'v1-cap7-resistore': { completed: true, attempts: 1, lastResult: 'success' },
        'v2-cap1-condensatore': { completed: false, attempts: 2, lastResult: 'partial' },
      },
    }));

    const result = collectCompletedExperiments();
    expect(result.total).toBe(2); // only completed ones
    expect(result.list).toHaveLength(2);
    expect(result.list[0].id).toBe('v1-cap6-primo-circuito');
    expect(result.list[0].attempts).toBe(3);
  });

  // ── Test 8: collectFullContext assembles all pieces ──
  it('8. collectFullContext includes circuit, code, compilation, buildStep, and description', () => {
    mockAPI();
    // Set up memory and sessions too
    localStorage.setItem('elab_unlim_memory', JSON.stringify({
      experiments: {
        'v1-cap6-primo-circuito': { completed: true, attempts: 1, lastResult: 'success' },
      },
    }));
    const twoMinAgo = new Date(Date.now() - 60000).toISOString();
    localStorage.setItem('elab_unlim_sessions', JSON.stringify([
      { startTime: twoMinAgo, messages: [], errors: [], actions: [] },
    ]));

    const ctx = collectFullContext();

    // All 6 context pieces present
    expect(ctx.circuit).toBeTruthy();
    expect(ctx.editorCode).toContain('void setup()');
    expect(ctx.compilation).toBeTruthy();
    expect(ctx.buildStep).toEqual({ current: 3, total: 8, phase: 'hardware' });
    expect(ctx.elapsedSeconds).toBeGreaterThan(50);
    expect(ctx.completedExperiments.total).toBe(1);

    // Extra context
    expect(ctx.circuitDescription).toContain('Primo Circuito');
    expect(ctx.editorMode).toBe('arduino');
    expect(ctx.editorVisible).toBe(true);
    expect(ctx.buildMode).toBe('passopasso');
  });

  // ── Test 9: collectFullContext handles missing API gracefully ──
  it('9. collectFullContext returns partial context when API is missing', () => {
    clearAPI();
    storageMap.set('elab_unlim_memory', JSON.stringify({
      experiments: {
        'v1-cap6-primo-circuito': { completed: true, attempts: 1, lastResult: 'success' },
      },
    }));

    const ctx = collectFullContext();
    expect(ctx.circuit).toBeUndefined();
    expect(ctx.editorCode).toBeUndefined();
    expect(ctx.completedExperiments.total).toBe(1);
  });

  // ── Test 10: editor code is truncated when exceeding 2000 chars ──
  it('10. collectFullContext truncates long editor code at 2000 chars', () => {
    const longCode = 'x'.repeat(3000);
    mockAPI({
      getEditorCode: vi.fn(() => longCode),
    });

    const ctx = collectFullContext();
    expect(ctx.editorCode.length).toBeLessThan(2100);
    expect(ctx.editorCode).toContain('// ... (troncato)');
  });
});
