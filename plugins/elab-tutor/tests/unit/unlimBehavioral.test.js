/**
 * UNLIM Behavioral Tests — 30 test cases
 * Testa: unlimContextCollector, searchKnowledgeBase, searchRAGChunks,
 *        struttura dati esperimenti, tag AZIONE nelle lesson paths.
 * © Andrea Marro — 16/04/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  collectFullContext,
  collectCircuitState,
  collectEditorCode,
  collectCompilationErrors,
  collectBuildStep,
  collectElapsedTime,
  collectCompletedExperiments,
  logError,
} from '../../src/services/unlimContextCollector';
import { searchKnowledgeBase, searchRAGChunks } from '../../src/data/unlim-knowledge-base.js';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1.js';
import v1Cap6Esp1Path from '../../src/data/lesson-paths/v1-cap6-esp1.json';
import v1Cap7Esp1Path from '../../src/data/lesson-paths/v1-cap7-esp1.json';
import v2Cap8Esp1Path from '../../src/data/lesson-paths/v2-cap8-esp1.json';

// ─── localStorage mock helpers ───────────────────────────────────────────────
const storageMap = new Map();
const sessionStorageMap = new Map();

function setupStorage() {
  localStorage.getItem.mockImplementation((k) => storageMap.get(k) ?? null);
  localStorage.setItem.mockImplementation((k, v) => storageMap.set(k, v));
  localStorage.removeItem.mockImplementation((k) => storageMap.delete(k));
  localStorage.clear.mockImplementation(() => storageMap.clear());

  sessionStorage.getItem.mockImplementation((k) => sessionStorageMap.get(k) ?? null);
  sessionStorage.setItem.mockImplementation((k, v) => sessionStorageMap.set(k, v));
  sessionStorage.removeItem.mockImplementation((k) => sessionStorageMap.delete(k));
  sessionStorage.clear.mockImplementation(() => sessionStorageMap.clear());
}

// ─── __ELAB_API mock helper ───────────────────────────────────────────────────
function mockAPI(overrides = {}) {
  const base = {
    getSimulatorContext: vi.fn(() => ({
      experiment: { id: 'v1-cap6-esp1', name: 'Primo LED', volume: 1 },
      buildMode: 'passopasso',
      buildStep: { current: 2, total: 6, phase: 'hardware' },
      editorMode: 'arduino',
      editorVisible: false,
      components: [
        { type: 'led', id: 'led1', placed: true, on: true },
        { type: 'resistor', id: 'r1', placed: true },
        { type: 'battery9v', id: 'bat1', placed: true },
      ],
      wires: [
        { from: 'bat1:positive', to: 'bb1:bus-top-plus-1', color: 'red' },
      ],
      simulation: { state: 'running' },
      lastCompilation: { success: false, errors: ['undefined variable x'], warnings: [] },
    })),
    getEditorCode: vi.fn(() => 'void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); delay(500); }'),
    getCircuitDescription: vi.fn(() => 'Esperimento: "Primo LED". Simulazione in corso. Componenti: LED rosso [acceso] (led1), resistore 470Ω (r1).'),
    getEditorMode: vi.fn(() => 'arduino'),
    isEditorVisible: vi.fn(() => false),
    getBuildMode: vi.fn(() => 'passopasso'),
    getBuildStepIndex: vi.fn(() => 1),
    getCurrentExperimentId: vi.fn(() => 'v1-cap6-esp1'),
    getCircuitState: vi.fn(() => null),
    getPinStates: vi.fn(() => ({ D13: 5.0, GND: 0.0 })),
    unlim: {
      getCircuitState: vi.fn(() => ({
        components: [{ type: 'led', id: 'led1', on: true }],
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

beforeEach(() => {
  clearAPI();
  storageMap.clear();
  sessionStorageMap.clear();
  setupStorage();
});

afterEach(() => {
  clearAPI();
  storageMap.clear();
  sessionStorageMap.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 1 — collectFullContext() struttura garantita
// ─────────────────────────────────────────────────────────────────────────────

describe('collectFullContext() — struttura garantita', () => {
  test('1. ritorna sempre un oggetto (mai null o undefined)', () => {
    clearAPI();
    const ctx = collectFullContext();
    expect(ctx).toBeDefined();
    expect(ctx).not.toBeNull();
    expect(typeof ctx).toBe('object');
  });

  test('2. senza API, non lancia eccezioni e ritorna oggetto vuoto o parziale', () => {
    clearAPI();
    expect(() => collectFullContext()).not.toThrow();
    const ctx = collectFullContext();
    expect(ctx.circuit).toBeUndefined();
    expect(ctx.editorCode).toBeUndefined();
    expect(ctx.compilation).toBeUndefined();
  });

  test('3. con API disponibile, contiene circuitState', () => {
    mockAPI();
    const ctx = collectFullContext();
    expect(ctx.circuit).toBeTruthy();
    expect(ctx.circuit.experiment).toBeDefined();
  });

  test('4. con API disponibile, contiene editorCode', () => {
    mockAPI();
    const ctx = collectFullContext();
    expect(ctx.editorCode).toBeDefined();
    expect(ctx.editorCode).toContain('setup');
  });

  test('5. con API disponibile, contiene compilation', () => {
    mockAPI();
    const ctx = collectFullContext();
    expect(ctx.compilation).toBeDefined();
    expect(ctx.compilation).toHaveProperty('success');
  });

  test('6. con API disponibile, contiene buildStep', () => {
    mockAPI();
    const ctx = collectFullContext();
    expect(ctx.buildStep).toBeDefined();
    expect(ctx.buildStep.current).toBeGreaterThan(0);
    expect(ctx.buildStep.total).toBeGreaterThan(0);
  });

  test('7. editorCode viene troncato a max ~2020 caratteri se troppo lungo', () => {
    mockAPI({ getEditorCode: vi.fn(() => 'A'.repeat(3000)) });
    const ctx = collectFullContext();
    expect(ctx.editorCode.length).toBeLessThan(2100);
    expect(ctx.editorCode).toContain('(troncato)');
  });

  test('8. editorCode non viene troncato se <= 2000 caratteri', () => {
    const code = 'void setup(){}void loop(){}'; // < 2000 chars
    mockAPI({ getEditorCode: vi.fn(() => code) });
    const ctx = collectFullContext();
    expect(ctx.editorCode).toBe(code);
    expect(ctx.editorCode).not.toContain('(troncato)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 2 — currentExperiment: null/undefined senza esperimento caricato
// ─────────────────────────────────────────────────────────────────────────────

describe('collectFullContext() — senza esperimento caricato', () => {
  test('9. getSimulatorContext ritorna null ma unlim.getCircuitState disponibile → circuit viene da fallback', () => {
    // Quando getSimulatorContext è null, il codice usa unlim.getCircuitState come fallback
    mockAPI({ getSimulatorContext: vi.fn(() => null) });
    const ctx = collectFullContext();
    // Il fallback unlim.getCircuitState è presente nel mock → circuit è definito
    expect(ctx.circuit).toBeDefined();
  });

  test('10. senza API completa (nessun fallback) → circuit è undefined, nessun throw', () => {
    // Nessuna API disponibile: né getSimulatorContext né unlim
    mockAPI({
      getSimulatorContext: vi.fn(() => { throw new Error('API not ready'); }),
      unlim: { getCircuitState: vi.fn(() => null) },
    });
    expect(() => collectFullContext()).not.toThrow();
    const ctx = collectFullContext();
    // Entrambi i percorsi falliscono → circuit undefined
    expect(ctx.circuit).toBeUndefined();
  });

  test('11. circuitDescription è assente se getCircuitDescription ritorna "Nessun circuito caricato."', () => {
    mockAPI({
      getSimulatorContext: vi.fn(() => null),
      getCircuitDescription: vi.fn(() => 'Nessun circuito caricato.'),
    });
    const ctx = collectFullContext();
    expect(ctx.circuitDescription).toBeUndefined();
  });

  test('12. collectCircuitState ritorna null quando nessuna API è disponibile', () => {
    clearAPI();
    expect(collectCircuitState()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 3 — collectCompletedExperiments
// ─────────────────────────────────────────────────────────────────────────────

describe('collectCompletedExperiments() — memoria studente', () => {
  test('13. senza localStorage ritorna { total: 0, list: [] }', () => {
    const result = collectCompletedExperiments();
    expect(result).toEqual({ total: 0, list: [] });
  });

  test('14. conta solo esperimenti con completed: true', () => {
    storageMap.set('elab_unlim_memory', JSON.stringify({
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 2, lastResult: 'success' },
        'v1-cap7-esp1': { completed: false, attempts: 1, lastResult: 'partial' },
        'v1-cap8-esp1': { completed: true, attempts: 4, lastResult: 'success' },
      },
    }));
    const result = collectCompletedExperiments();
    expect(result.total).toBe(2);
    expect(result.list).toHaveLength(2);
  });

  test('15. include id, attempts e lastResult per ogni esperimento completato', () => {
    storageMap.set('elab_unlim_memory', JSON.stringify({
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 3, lastResult: 'success' },
      },
    }));
    const result = collectCompletedExperiments();
    expect(result.list[0]).toMatchObject({
      id: 'v1-cap6-esp1',
      attempts: 3,
      lastResult: 'success',
    });
  });

  test('16. JSON malformato in localStorage → ritorna { total: 0, list: [] } senza throw', () => {
    storageMap.set('elab_unlim_memory', 'NOT_VALID_JSON{{{');
    expect(() => collectCompletedExperiments()).not.toThrow();
    const result = collectCompletedExperiments();
    expect(result).toEqual({ total: 0, list: [] });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 4 — collectElapsedTime
// ─────────────────────────────────────────────────────────────────────────────

describe('collectElapsedTime() — tempo sessione attiva', () => {
  test('17. sessione attiva da ~60s → ritorna valore circa 60', () => {
    const sixtyAgo = new Date(Date.now() - 60000).toISOString();
    storageMap.set('elab_unlim_sessions', JSON.stringify([
      { startTime: sixtyAgo },
    ]));
    const elapsed = collectElapsedTime();
    expect(elapsed).toBeGreaterThanOrEqual(58);
    expect(elapsed).toBeLessThan(70);
  });

  test('18. sessione con endTime → non conta come attiva, ritorna null', () => {
    const tenMinAgo = new Date(Date.now() - 600000).toISOString();
    storageMap.set('elab_unlim_sessions', JSON.stringify([
      { startTime: tenMinAgo, endTime: new Date(Date.now() - 300000).toISOString() },
    ]));
    const elapsed = collectElapsedTime();
    expect(elapsed).toBeNull();
  });

  test('19. nessuna sessione in localStorage → ritorna null', () => {
    expect(collectElapsedTime()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 5 — logError
// ─────────────────────────────────────────────────────────────────────────────

describe('logError() — storico errori sessione', () => {
  test('20. logError salva errore in sessionStorage', () => {
    logError('compilation', 'undefined variable foo');
    const raw = sessionStorage.getItem('elab_error_history');
    const history = JSON.parse(raw);
    expect(history).toHaveLength(1);
    expect(history[0].type).toBe('compilation');
    expect(history[0].message).toBe('undefined variable foo');
  });

  test('21. logError mantiene massimo 20 errori (sliding window)', () => {
    for (let i = 0; i < 25; i++) {
      logError('circuit', `error_${i}`);
    }
    const raw = sessionStorage.getItem('elab_error_history');
    const history = JSON.parse(raw);
    expect(history.length).toBe(20);
    // Deve contenere solo gli ultimi 20
    expect(history[19].message).toBe('error_24');
  });

  test('22. logError tronca messaggi oltre 200 char', () => {
    logError('runtime', 'X'.repeat(300));
    const raw = sessionStorage.getItem('elab_error_history');
    const history = JSON.parse(raw);
    expect(history[0].message.length).toBeLessThanOrEqual(200);
  });

  test('23. errori recenti appaiono in collectFullContext.recentErrors', () => {
    logError('compilation', 'Sketch too large');
    logError('circuit', 'Short circuit detected');
    mockAPI();
    const ctx = collectFullContext();
    expect(ctx.recentErrors).toBeDefined();
    expect(ctx.recentErrors.length).toBeGreaterThanOrEqual(1);
    expect(ctx.errorCount).toBeGreaterThanOrEqual(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 6 — searchKnowledgeBase — edge cases e qualità
// ─────────────────────────────────────────────────────────────────────────────

describe('searchKnowledgeBase() — edge cases', () => {
  test('24. query corta < 3 char → ritorna null (nessun risultato)', () => {
    const result = searchKnowledgeBase('ab');
    expect(result).toBeNull();
  });

  test('25. query vuota → ritorna null', () => {
    expect(searchKnowledgeBase('')).toBeNull();
    expect(searchKnowledgeBase('   ')).toBeNull();
  });

  test('26. input non stringa (null) → ritorna null senza throw', () => {
    expect(() => searchKnowledgeBase(null)).not.toThrow();
    expect(searchKnowledgeBase(null)).toBeNull();
  });

  test('27. "LED" → trova chunk relativi a LED', () => {
    const result = searchKnowledgeBase('LED');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/led|diodo|piedino/);
  });

  test('28. "resistore" → risposta menziona corrente o protezione', () => {
    const result = searchKnowledgeBase('resistore ohm corrente');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/corrente|resistenza|limit|proteg/);
  });

  test('29. risultato KB ha campi answer, question e score', () => {
    const result = searchKnowledgeBase('come funziona la breadboard');
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('answer');
    expect(result).toHaveProperty('question');
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
    expect(result.score).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 7 — searchRAGChunks — rilevanza e edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('searchRAGChunks() — ricerca vettoriale RAG', () => {
  test('30. "resistore" → ritorna risultati con score > 0', () => {
    const results = searchRAGChunks('resistore');
    expect(Array.isArray(results)).toBe(true);
    // Deve trovare almeno 1 risultato rilevante
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => expect(r.score).toBeGreaterThan(0));
  });

  test('31. query vuota → ritorna array vuoto', () => {
    const results = searchRAGChunks('');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  test('32. input non stringa → ritorna array vuoto senza throw', () => {
    expect(() => searchRAGChunks(null)).not.toThrow();
    expect(searchRAGChunks(null)).toEqual([]);
  });

  test('33. topK=1 → ritorna al massimo 1 risultato', () => {
    const results = searchRAGChunks('LED circuito', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  test('34. "non va" (short-phrase fallback) → ritorna risultati senza throw', () => {
    expect(() => searchRAGChunks('non va')).not.toThrow();
    const results = searchRAGChunks('non va');
    expect(Array.isArray(results)).toBe(true);
    // short-phrase map rimappa a termini utili: deve trovare qualcosa
    expect(results.length).toBeGreaterThan(0);
  });

  test('35. ogni risultato ha proprietà text e score', () => {
    const results = searchRAGChunks('Arduino setup loop');
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      expect(r).toHaveProperty('text');
      expect(r).toHaveProperty('score');
      expect(typeof r.text).toBe('string');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 8 — unlimPrompt degli esperimenti: lunghezza e tag [AZIONE:]
// ─────────────────────────────────────────────────────────────────────────────

describe('Esperimenti Vol1 — unlimPrompt struttura dati', () => {
  // EXPERIMENTS_VOL1 importato staticamente all'inizio del file
  const exps = EXPERIMENTS_VOL1.experiments;

  test('36. 5 esperimenti campione da Vol1 hanno unlimPrompt non vuoto', () => {
    const sample = exps.slice(0, 5);
    expect(sample.length).toBeGreaterThanOrEqual(5);
    sample.forEach(exp => {
      expect(exp.unlimPrompt).toBeDefined();
      expect(typeof exp.unlimPrompt).toBe('string');
      expect(exp.unlimPrompt.trim().length).toBeGreaterThan(10);
    });
  });

  test('37. unlimPrompt di ogni esperimento Vol1 menziona ELAB o termini didattici', () => {
    const sample = exps.slice(0, 8);
    sample.forEach(exp => {
      const lower = exp.unlimPrompt.toLowerCase();
      // Ogni unlimPrompt deve contenere riferimenti a contesto ELAB / didattica
      expect(lower).toMatch(/elab|unlim|italiano|analogia|bambini|ragazzi|spiega/);
    });
  });

  test('38. ogni esperimento Vol1 ha un id univoco', () => {
    const ids = exps.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('Lesson paths — action_tags contengono tag [AZIONE:]', () => {
  // JSON importati staticamente all'inizio del file

  test('39. v1-cap6-esp1 ha almeno 1 fase con action_tags [AZIONE:]', () => {
    const allTags = v1Cap6Esp1Path.phases.flatMap(p => p.action_tags ?? []);
    const hasAzione = allTags.some(tag => /\[AZIONE:/i.test(tag));
    expect(hasAzione).toBe(true);
  });

  test('40. v1-cap7-esp1 ha tag [AZIONE:play] nella fase OSSERVA', () => {
    const osserva = v1Cap7Esp1Path.phases.find(p => p.name === 'OSSERVA');
    expect(osserva).toBeDefined();
    const hasPlay = (osserva.action_tags ?? []).some(t => /\[AZIONE:play\]/i.test(t));
    expect(hasPlay).toBe(true);
  });

  test('41. v2-cap8-esp1 ha tag [AZIONE:loadexp:...] nella fase MOSTRA', () => {
    const mostra = v2Cap8Esp1Path.phases.find(p => p.name === 'MOSTRA');
    expect(mostra).toBeDefined();
    const hasLoad = (mostra.action_tags ?? []).some(t => /\[AZIONE:loadexp:/i.test(t));
    expect(hasLoad).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 9 — collectFullContext: pinStates e currentExperimentAttempts
// ─────────────────────────────────────────────────────────────────────────────

describe('collectFullContext() — pinStates e tentativi correnti', () => {
  test('42. pinStates appare nel contesto se getPinStates ritorna valori', () => {
    mockAPI({ getPinStates: vi.fn(() => ({ D13: 5.0, GND: 0.0 })) });
    const ctx = collectFullContext();
    expect(ctx.pinStates).toBeDefined();
    expect(ctx.pinStates.D13).toBe(5.0);
  });

  test('43. pinStates è assente se getPinStates ritorna oggetto vuoto', () => {
    mockAPI({ getPinStates: vi.fn(() => ({})) });
    const ctx = collectFullContext();
    expect(ctx.pinStates).toBeUndefined();
  });

  test('44. currentExperimentAttempts appare se ci sono tentativi in memoria', () => {
    storageMap.set('elab_unlim_memory', JSON.stringify({
      experiments: {
        'v1-cap6-esp1': { completed: false, attempts: 5, hintsUsed: 2 },
      },
    }));
    mockAPI({ getCurrentExperimentId: vi.fn(() => 'v1-cap6-esp1') });
    const ctx = collectFullContext();
    expect(ctx.currentExperimentAttempts).toBe(5);
    expect(ctx.currentExperimentHintsUsed).toBe(2);
  });

  test('45. elapsedSeconds appare nel contesto se c\'è una sessione attiva', () => {
    const twoMinAgo = new Date(Date.now() - 120000).toISOString();
    storageMap.set('elab_unlim_sessions', JSON.stringify([
      { startTime: twoMinAgo },
    ]));
    mockAPI();
    const ctx = collectFullContext();
    expect(ctx.elapsedSeconds).toBeGreaterThanOrEqual(118);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 10 — collectBuildStep fallback
// ─────────────────────────────────────────────────────────────────────────────

describe('collectBuildStep() — Passo Passo', () => {
  test('46. se getSimulatorContext non ha buildStep, usa getBuildStepIndex come fallback', () => {
    mockAPI({
      getSimulatorContext: vi.fn(() => ({
        // buildStep assente
        experiment: { id: 'v1-cap6-esp1' },
      })),
      getBuildStepIndex: vi.fn(() => 4),
    });
    const step = collectBuildStep();
    // Il fallback usa getBuildStepIndex (indice 4 → current 5)
    expect(step).toBeTruthy();
    expect(step.current).toBe(5);
  });

  test('47. senza API, collectBuildStep ritorna null senza throw', () => {
    clearAPI();
    expect(() => collectBuildStep()).not.toThrow();
    expect(collectBuildStep()).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEZIONE 11 — collectEditorCode edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('collectEditorCode() — codice editor', () => {
  test('48. senza API ritorna null', () => {
    clearAPI();
    expect(collectEditorCode()).toBeNull();
  });

  test('49. getEditorCode ritorna stringa vuota → collectEditorCode ritorna null', () => {
    mockAPI({ getEditorCode: vi.fn(() => '') });
    expect(collectEditorCode()).toBeNull();
  });

  test('50. getEditorCode ritorna codice valido → collectEditorCode ritorna la stringa', () => {
    mockAPI({ getEditorCode: vi.fn(() => 'void setup(){}') });
    expect(collectEditorCode()).toBe('void setup(){}');
  });
});
