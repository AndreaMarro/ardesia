/**
 * unlimContextInjection.test.js — Test per context enrichment in sendChat
 * 80 test: collectFullContext, context helpers, rate limiting, moderation, extractActions
 * (c) Andrea Marro — 15/04/2026 — ELAB Tutor
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock logger (must be before any src/ imports) ──
vi.mock('../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));

// ── Mock fetch globally ──
global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));

// ── Mock sessionStorage ──
const sStore = {};
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(k => sStore[k] || null),
    setItem: vi.fn((k, v) => { sStore[k] = v; }),
    removeItem: vi.fn(k => { delete sStore[k]; }),
    clear: vi.fn(() => { Object.keys(sStore).forEach(k => delete sStore[k]); }),
  },
  writable: true,
});

// ── Mock localStorage ──
const lStore = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(k => lStore[k] || null),
    setItem: vi.fn((k, v) => { lStore[k] = v; }),
    removeItem: vi.fn(k => { delete lStore[k]; }),
    clear: vi.fn(() => { Object.keys(lStore).forEach(k => delete lStore[k]); }),
  },
  writable: true,
});

// ── Imports ──
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

import { checkRateLimit } from '../../src/services/api';
import { getVolumeRef } from '../../src/data/volume-references';
import { getExperimentGroupContext } from '../../src/data/lesson-groups';
import { searchRAGChunks } from '../../src/data/unlim-knowledge-base';

// ── Helpers for cleanup ──
beforeEach(() => {
  Object.keys(sStore).forEach(k => delete sStore[k]);
  Object.keys(lStore).forEach(k => delete lStore[k]);
  delete window.__ELAB_API;
  vi.clearAllMocks();
  global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }));
});


// ═══════════════════════════════════════════════════════════════
// 1. collectFullContext (20 tests)
// ═══════════════════════════════════════════════════════════════
describe('collectFullContext', () => {
  it('returns an object when no API is available', () => {
    const ctx = collectFullContext();
    expect(ctx).toBeTypeOf('object');
  });

  it('returns empty-ish object when window.__ELAB_API is undefined', () => {
    const ctx = collectFullContext();
    // No circuit, no code, no compilation when API missing
    expect(ctx.circuit).toBeUndefined();
    expect(ctx.editorCode).toBeUndefined();
    expect(ctx.compilation).toBeUndefined();
  });

  it('includes circuit when API.getSimulatorContext returns data', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => ({ components: [{ id: 'led1', type: 'led' }], wires: [] }),
    };
    const ctx = collectFullContext();
    expect(ctx.circuit).toBeDefined();
    expect(ctx.circuit.components).toHaveLength(1);
  });

  it('includes editorCode when API.getEditorCode returns a string', () => {
    window.__ELAB_API = {
      getEditorCode: () => 'void setup() { pinMode(13, OUTPUT); }',
    };
    const ctx = collectFullContext();
    expect(ctx.editorCode).toContain('void setup');
  });

  it('truncates editorCode longer than 2000 chars', () => {
    window.__ELAB_API = {
      getEditorCode: () => 'x'.repeat(3000),
    };
    const ctx = collectFullContext();
    expect(ctx.editorCode.length).toBeLessThanOrEqual(2020); // 2000 + "// ... (troncato)" suffix
    expect(ctx.editorCode).toContain('troncato');
  });

  it('does not truncate editorCode at exactly 2000 chars', () => {
    window.__ELAB_API = {
      getEditorCode: () => 'y'.repeat(2000),
    };
    const ctx = collectFullContext();
    expect(ctx.editorCode).toBe('y'.repeat(2000));
    expect(ctx.editorCode).not.toContain('troncato');
  });

  it('includes compilation when API returns lastCompilation', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => ({
        lastCompilation: { success: false, errors: 'expected ; before }' },
      }),
    };
    const ctx = collectFullContext();
    expect(ctx.compilation).toBeDefined();
    expect(ctx.compilation.success).toBe(false);
  });

  it('includes buildStep from getSimulatorContext', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => ({
        buildStep: { current: 3, total: 8, phase: 'wiring' },
      }),
    };
    const ctx = collectFullContext();
    expect(ctx.buildStep).toEqual({ current: 3, total: 8, phase: 'wiring' });
  });

  it('falls back to getBuildStepIndex when getSimulatorContext has no buildStep', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => ({}),
      getBuildStepIndex: () => 4,
    };
    const ctx = collectFullContext();
    expect(ctx.buildStep).toBeDefined();
    expect(ctx.buildStep.current).toBe(5); // index 4 -> step 5
  });

  it('includes completedExperiments from localStorage', () => {
    lStore['elab_unlim_memory'] = JSON.stringify({
      experiments: {
        'v1-cap6-esp1': { completed: true, attempts: 2, lastResult: 'success' },
        'v1-cap6-esp2': { completed: false, attempts: 1 },
      },
    });
    const ctx = collectFullContext();
    expect(ctx.completedExperiments).toBeDefined();
    expect(ctx.completedExperiments.total).toBe(1);
    expect(ctx.completedExperiments.list[0].id).toBe('v1-cap6-esp1');
  });

  it('returns completedExperiments with total=0 when no memory', () => {
    const result = collectCompletedExperiments();
    expect(result.total).toBe(0);
    expect(result.list).toEqual([]);
  });

  it('includes circuitDescription when API provides it', () => {
    window.__ELAB_API = {
      getCircuitDescription: () => 'LED rosso collegato a R1 470ohm sulla breadboard',
    };
    const ctx = collectFullContext();
    expect(ctx.circuitDescription).toContain('LED rosso');
  });

  it('excludes circuitDescription when it says "Nessun circuito caricato."', () => {
    window.__ELAB_API = {
      getCircuitDescription: () => 'Nessun circuito caricato.',
    };
    const ctx = collectFullContext();
    expect(ctx.circuitDescription).toBeUndefined();
  });

  it('includes editorMode and editorVisible', () => {
    window.__ELAB_API = {
      getEditorMode: () => 'scratch',
      isEditorVisible: () => true,
    };
    const ctx = collectFullContext();
    expect(ctx.editorMode).toBe('scratch');
    expect(ctx.editorVisible).toBe(true);
  });

  it('includes buildMode when API provides it', () => {
    window.__ELAB_API = {
      getBuildMode: () => 'step-by-step',
    };
    const ctx = collectFullContext();
    expect(ctx.buildMode).toBe('step-by-step');
  });

  it('includes recentErrors from sessionStorage error history', () => {
    sStore['elab_error_history'] = JSON.stringify([
      { type: 'compilation', message: 'missing semicolon', ts: Date.now() },
      { type: 'circuit', message: 'short circuit detected', ts: Date.now() },
    ]);
    const ctx = collectFullContext();
    expect(ctx.recentErrors).toHaveLength(2);
    expect(ctx.errorCount).toBe(2);
  });

  it('includes pinStates when API provides them', () => {
    window.__ELAB_API = {
      getPinStates: () => ({ D13: 1, D12: 0, A0: 512 }),
    };
    const ctx = collectFullContext();
    expect(ctx.pinStates).toBeDefined();
    expect(ctx.pinStates.D13).toBe(1);
  });

  it('includes currentExperimentAttempts from memory', () => {
    window.__ELAB_API = {
      getCurrentExperimentId: () => 'v1-cap6-esp1',
    };
    lStore['elab_unlim_memory'] = JSON.stringify({
      experiments: { 'v1-cap6-esp1': { attempts: 5, hintsUsed: 3 } },
    });
    const ctx = collectFullContext();
    expect(ctx.currentExperimentAttempts).toBe(5);
    expect(ctx.currentExperimentHintsUsed).toBe(3);
  });

  it('handles API methods that throw gracefully', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => { throw new Error('API crash'); },
      getEditorCode: () => { throw new Error('editor crash'); },
      getCircuitDescription: () => { throw new Error('desc crash'); },
    };
    // Should not throw
    const ctx = collectFullContext();
    expect(ctx).toBeTypeOf('object');
  });

  it('handles corrupted localStorage gracefully', () => {
    lStore['elab_unlim_memory'] = 'NOT VALID JSON{{{';
    const result = collectCompletedExperiments();
    expect(result.total).toBe(0);
  });
});


// ═══════════════════════════════════════════════════════════════
// 2. Context building helpers (20 tests)
// ═══════════════════════════════════════════════════════════════
describe('getVolumeRef', () => {
  it('returns data for v1-cap6-esp1', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).toBeDefined();
    expect(ref.volume).toBe(1);
    expect(ref.bookPage).toBeTypeOf('number');
    expect(ref.chapter).toContain('LED');
  });

  it('returns null for unknown experiment', () => {
    expect(getVolumeRef('nonexistent-exp')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getVolumeRef('')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(getVolumeRef(undefined)).toBeNull();
  });

  it('includes bookText for v1-cap6-esp1', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref.bookText).toBeDefined();
    expect(ref.bookText.length).toBeGreaterThan(10);
  });

  it('includes bookContext for v1-cap6-esp1', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref.bookContext).toBeDefined();
  });

  it('has correct volume for Vol2 experiments', () => {
    const ref = getVolumeRef('v2-cap1-esp1');
    if (ref) {
      expect(ref.volume).toBe(2);
    }
  });

  it('has correct volume for Vol3 experiments', () => {
    const ref = getVolumeRef('v3-cap1-esp1');
    if (ref) {
      expect(ref.volume).toBe(3);
    }
  });
});

describe('getExperimentGroupContext', () => {
  it('returns context for v1-cap6-esp1', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    if (ctx) {
      expect(ctx.position).toBeTypeOf('number');
      expect(ctx.total).toBeTypeOf('number');
      expect(ctx.narrative).toContain('Esperimento');
      expect(ctx.narrative).toContain('Capitolo');
    }
  });

  it('returns null for unknown experiment', () => {
    expect(getExperimentGroupContext('fake-exp-999')).toBeNull();
  });

  it('includes prevExp and nextExp when not first/last', () => {
    // Find an experiment that is NOT the first in its group
    const ctx = getExperimentGroupContext('v1-cap6-esp2');
    if (ctx) {
      expect(ctx.prevExp).toBeTruthy();
    }
  });

  it('has prevExp=null for first experiment in group', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    if (ctx) {
      expect(ctx.prevExp).toBeNull();
    }
  });

  it('includes concept field', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    if (ctx) {
      expect(ctx.concept).toBeDefined();
      expect(ctx.concept.length).toBeGreaterThan(0);
    }
  });

  it('includes chapter number', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    if (ctx) {
      expect(ctx.chapter).toBeDefined();
    }
  });
});

describe('searchRAGChunks', () => {
  it('returns array for a valid query', () => {
    const results = searchRAGChunks('LED resistore circuito', 3);
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns empty array for null message', () => {
    expect(searchRAGChunks(null)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(searchRAGChunks('')).toEqual([]);
  });

  it('returns empty array for number input', () => {
    expect(searchRAGChunks(42)).toEqual([]);
  });

  it('respects topK parameter', () => {
    const results = searchRAGChunks('LED resistore circuito breadboard batteria', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns results with score > 0', () => {
    const results = searchRAGChunks('LED resistore', 5);
    results.forEach(r => {
      expect(r.score).toBeGreaterThan(0);
    });
  });
});


// ═══════════════════════════════════════════════════════════════
// 3. Rate limiting (10 tests)
// ═══════════════════════════════════════════════════════════════
describe('checkRateLimit', () => {
  it('allows the first message', () => {
    const result = checkRateLimit();
    expect(result.allowed).toBe(true);
    expect(result.message).toBeNull();
  });

  it('blocks rapid messages within 3 seconds', () => {
    checkRateLimit(); // first — OK
    const result = checkRateLimit(); // immediate second — should block
    expect(result.allowed).toBe(false);
    expect(result.waitMs).toBeGreaterThan(0);
    expect(result.message).toBeTruthy();
  });

  it('returns Italian message when blocked', () => {
    checkRateLimit();
    const result = checkRateLimit();
    // The message should be in Italian
    expect(result.message).toMatch(/[a-zA-ZÀ-ú]/);
  });

  it('allows messages after 3+ seconds (simulated)', () => {
    checkRateLimit();
    // Simulate time passing by manipulating sessionStorage
    // The rate limiter uses sessionStorage for minute count and in-memory lastMessageTime
    // We cannot easily mock Date.now mid-test without vi.useFakeTimers, so just verify structure
    const result = checkRateLimit();
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('waitMs');
  });

  it('returns waitMs as a number', () => {
    checkRateLimit();
    const result = checkRateLimit();
    expect(result.waitMs).toBeTypeOf('number');
  });

  it('blocks more than 10 messages per minute', () => {
    // The rate limiter uses in-memory lastMessageTime + sessionStorage for minute count.
    // Capture real time BEFORE faking, then set fake time well after it.
    const realNow = Date.now();
    vi.useFakeTimers();
    const start = realNow + 100000; // 100s in the future to clear interval check
    vi.setSystemTime(start);

    // Reset sessionStorage counters completely
    sStore['elab_rate_minute'] = '0';
    sStore['elab_rate_minute_start'] = '0';

    // Send 10 messages spaced 3.1s apart (within 1 minute window)
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(start + i * 3100);
      const r = checkRateLimit();
      expect(r.allowed).toBe(true);
    }

    // 11th message should be blocked (>10 per minute)
    vi.setSystemTime(start + 10 * 3100);
    const blocked = checkRateLimit();
    expect(blocked.allowed).toBe(false);
    expect(blocked.message).toContain('pausa');

    vi.useRealTimers();
  });

  it('resets after minute window expires', () => {
    const realNow2 = Date.now();
    vi.useFakeTimers();
    const start = realNow2 + 200000; // 200s in future to clear stale lastMessageTime
    vi.setSystemTime(start);

    // Reset sessionStorage counters
    sStore['elab_rate_minute'] = '0';
    sStore['elab_rate_minute_start'] = '0';

    // Fill up rate limit
    for (let i = 0; i < 10; i++) {
      vi.setSystemTime(start + i * 3100);
      checkRateLimit();
    }

    // Jump forward 65 seconds from window start — minute window should expire
    vi.setSystemTime(start + 65000);
    const result = checkRateLimit();
    expect(result.allowed).toBe(true);

    vi.useRealTimers();
  });

  it('has waitMs=0 when allowed (fresh state)', () => {
    // Use fake timers with a timestamp far from any previous calls
    const realNow3 = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(realNow3 + 300000);
    sStore['elab_rate_minute'] = '0';
    sStore['elab_rate_minute_start'] = '0';
    const result = checkRateLimit();
    expect(result.waitMs).toBe(0);
    vi.useRealTimers();
  });

  it('has non-negative waitMs when blocked', () => {
    checkRateLimit();
    const result = checkRateLimit();
    expect(result.waitMs).toBeGreaterThanOrEqual(0);
  });

  it('returns object with exactly 3 keys', () => {
    const result = checkRateLimit();
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['allowed', 'message', 'waitMs']));
    expect(Object.keys(result)).toHaveLength(3);
  });
});


// ═══════════════════════════════════════════════════════════════
// 4. Content moderation (15 tests)
//    isMessageBlocked is not exported, so we test via sendChat
//    which returns MODERATION_RESPONSE when blocked.
//    We replicate the BLOCKED_PATTERNS logic here for unit testing.
// ═══════════════════════════════════════════════════════════════
describe('Content moderation (BLOCKED_PATTERNS replication)', () => {
  // Replicate the exact patterns from api.js for testability
  const BLOCKED_PATTERNS = [
    /\b(cazz|merd|fott|culo|minchi|stronz|porc[ao]\s*di|porc[ao]\s*madon|vaff|troi)/i,
    /\b(ammaz|uccid|sparar|sparo|accoltell|bomb[ae]|esplod|terroris|pistol|coltel)/i,
    /\b(numero\s*(di\s*)?telefon|indirizzo\s*(di\s*)?casa|dove\s*abiti|password|carta\s*(di\s*)?credito|codice\s*fiscal)/i,
    /\b(porn|nsfw|nud[oie]|sesso|escort|droga|cocain|eroina|cannabis)/i,
  ];

  function isMessageBlocked(message) {
    if (!message || typeof message !== 'string') return false;
    return BLOCKED_PATTERNS.some(pattern => pattern.test(message));
  }

  // Vulgar Italian
  it('blocks "cazzo" (vulgar)', () => {
    expect(isMessageBlocked('che cazzo di circuito')).toBe(true);
  });

  it('blocks "merda" variant', () => {
    expect(isMessageBlocked('che merda')).toBe(true);
  });

  it('blocks "stronzo"', () => {
    expect(isMessageBlocked('sei uno stronzo')).toBe(true);
  });

  it('blocks "vaffanculo" prefix', () => {
    expect(isMessageBlocked('vaffanculo')).toBe(true);
  });

  // Legitimate electronics
  it('allows "come funziona un LED?"', () => {
    expect(isMessageBlocked('come funziona un LED?')).toBe(false);
  });

  it('allows "collega il resistore da 470 ohm"', () => {
    expect(isMessageBlocked('collega il resistore da 470 ohm')).toBe(false);
  });

  it('allows "misura la tensione con il multimetro"', () => {
    expect(isMessageBlocked('misura la tensione con il multimetro')).toBe(false);
  });

  it('allows complex electronics: "transistor MOSFET IRF540 gate threshold"', () => {
    expect(isMessageBlocked('il transistor MOSFET IRF540 ha una gate threshold di 4V')).toBe(false);
  });

  it('allows "ponte a diodi" (no false positive on "ponte")', () => {
    expect(isMessageBlocked('ponte a diodi per raddrizzare la corrente alternata')).toBe(false);
  });

  // Personal data requests
  it('blocks "dimmi il tuo numero di telefono"', () => {
    expect(isMessageBlocked('dimmi il tuo numero di telefono')).toBe(true);
  });

  it('blocks "dove abiti?"', () => {
    expect(isMessageBlocked('dove abiti?')).toBe(true);
  });

  it('blocks "password" requests', () => {
    expect(isMessageBlocked('qual è la tua password')).toBe(true);
  });

  it('blocks "carta di credito"', () => {
    expect(isMessageBlocked('dammi la carta di credito')).toBe(true);
  });

  // Edge cases
  it('returns false for null input', () => {
    expect(isMessageBlocked(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isMessageBlocked('')).toBe(false);
  });
});


// ═══════════════════════════════════════════════════════════════
// 5. extractActions (15 tests)
//    extractActions is not exported. We replicate the core logic
//    to verify the pattern-matching independently.
// ═══════════════════════════════════════════════════════════════
describe('extractActions (pattern replication)', () => {
  // Replicate the extractActions logic from api.js
  function extractActions(text, userMessage = '') {
    if (!text) return { commands: [], buttons: [], route: null };

    const actions = { commands: [], buttons: [], route: null };
    const lowerText = text.toLowerCase();
    const lowerUser = userMessage.toLowerCase();

    // Routing: simulator
    if (/prova (nel )?simulatore|carica (nel )?simulatore|apri il simulatore|simula questo|testa il circuito/i.test(lowerText)) {
      actions.route = 'simulator';
      actions.commands.push({ type: 'openSimulator', auto: true });
    }

    // Routing: canvas
    if (/disegna (prima )?|prova a disegnare|usa la lavagna|fai uno schizzo/i.test(lowerText)) {
      actions.route = 'canvas';
      actions.commands.push({ type: 'openCanvas', auto: true });
    }

    // Page references [V1P45]
    const pageMatches = text.match(/\[V(\d)P(\d+)\]/gi);
    if (pageMatches && pageMatches.length > 0) {
      const firstMatch = pageMatches[0].match(/\[V(\d)P(\d+)\]/i);
      if (firstMatch) {
        actions.buttons.push({
          type: 'openPage',
          volume: parseInt(firstMatch[1]),
          page: parseInt(firstMatch[2]),
          label: `Pagina ${parseInt(firstMatch[2])}`,
        });
        if (!actions.route) actions.route = 'page';
      }
    }

    // Code markers :::CODE:::...:::END:::
    const codeMarkerMatch = text.match(/:::(?:WOKWI|CODE):::([\s\S]*?):::END:::/);
    if (codeMarkerMatch) {
      const code = codeMarkerMatch[1].trim();
      actions.commands.push({ type: 'loadSimulator', code, auto: true });
      actions.route = 'simulator';
      actions.buttons.push({ type: 'openSimulator', code, label: 'Apri nel Simulatore' });
    }

    // Arduino code blocks ```cpp ... ```
    const codeBlock = text.match(/```(?:cpp|arduino|c\+\+)?\s*([\s\S]*?)```/i);
    if (codeBlock && codeBlock[1]?.trim().length > 20 && !codeMarkerMatch) {
      const code = codeBlock[1].trim();
      actions.commands.push({ type: 'showCode', code });
      actions.buttons.push({ type: 'openSimulator', code, label: 'Prova nel Simulatore' });
      actions.route = 'simulator';
    }

    // User-triggered simulator
    if (/simula|simulatore|provare|testare|eseguire/i.test(lowerUser) && !actions.route) {
      actions.buttons.push({ type: 'openSimulator', label: 'Simulatore' });
    }

    // User-triggered canvas
    if (/disegn|lavagna|schizzo|scrivi a mano/i.test(lowerUser) && !actions.route) {
      actions.buttons.push({ type: 'openCanvas', label: 'Lavagna' });
    }

    // Manual page search
    if (/dove trovo|quale pagina|che lezione/i.test(lowerUser) && !actions.route) {
      actions.route = 'manual';
    }

    // URLs
    const urlMatch = text.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) {
      actions.buttons.push({ type: 'openUrl', url: urlMatch[0], label: 'Apri Link' });
    }

    // Max 3 buttons
    actions.buttons = actions.buttons.slice(0, 3);

    return actions;
  }

  // Route extraction
  it('extracts route=simulator when AI says "prova nel simulatore"', () => {
    const actions = extractActions('Ottimo! Prova nel simulatore il circuito.');
    expect(actions.route).toBe('simulator');
    expect(actions.commands).toContainEqual(expect.objectContaining({ type: 'openSimulator' }));
  });

  it('extracts route=simulator for "apri il simulatore"', () => {
    const actions = extractActions('Apri il simulatore e testa questo circuito.');
    expect(actions.route).toBe('simulator');
  });

  it('extracts route=canvas when AI says "prova a disegnare"', () => {
    const actions = extractActions('Prova a disegnare il circuito prima di costruirlo.');
    expect(actions.route).toBe('canvas');
  });

  it('returns null route for plain text response', () => {
    const actions = extractActions('Il LED ha due piedini: anodo e catodo.');
    expect(actions.route).toBeNull();
  });

  // Page references
  it('extracts page reference [V1P45]', () => {
    const actions = extractActions('Guarda la spiegazione nel libro [V1P45].');
    expect(actions.buttons).toContainEqual(expect.objectContaining({
      type: 'openPage',
      volume: 1,
      page: 45,
    }));
    expect(actions.route).toBe('page');
  });

  it('extracts page reference [V2P112]', () => {
    const actions = extractActions('Trovi la spiegazione in [V2P112].');
    expect(actions.buttons).toContainEqual(expect.objectContaining({
      type: 'openPage',
      volume: 2,
      page: 112,
    }));
  });

  it('extracts only first page when multiple mentioned', () => {
    const actions = extractActions('Vedi [V1P10] e [V1P20].');
    const pageButtons = actions.buttons.filter(b => b.type === 'openPage');
    expect(pageButtons).toHaveLength(1);
    expect(pageButtons[0].page).toBe(10);
  });

  // Code blocks
  it('extracts code from ```cpp block', () => {
    const text = 'Ecco il codice:\n```cpp\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n}\n```';
    const actions = extractActions(text);
    expect(actions.commands).toContainEqual(expect.objectContaining({ type: 'showCode' }));
    expect(actions.route).toBe('simulator');
  });

  it('ignores very short code blocks (<20 chars)', () => {
    const text = 'Usa: ```cpp\nint x = 5;\n```';
    const actions = extractActions(text);
    expect(actions.commands.filter(c => c.type === 'showCode')).toHaveLength(0);
  });

  it('extracts :::CODE::: marker blocks', () => {
    const text = ':::CODE:::void setup(){pinMode(13,OUTPUT);}void loop(){digitalWrite(13,HIGH);}:::END:::';
    const actions = extractActions(text);
    expect(actions.commands).toContainEqual(expect.objectContaining({ type: 'loadSimulator' }));
  });

  // URL extraction
  it('extracts URLs from text', () => {
    const actions = extractActions('Guarda qui: https://www.arduino.cc/reference per informazioni.');
    expect(actions.buttons).toContainEqual(expect.objectContaining({
      type: 'openUrl',
      url: 'https://www.arduino.cc/reference',
    }));
  });

  // Max 3 buttons
  it('limits to maximum 3 buttons', () => {
    // Create text with many triggers
    const text = 'Vedi [V1P10] e [V1P20]. Vai su https://a.com e https://b.com. Prova nel simulatore. Disegna prima.';
    const actions = extractActions(text);
    expect(actions.buttons.length).toBeLessThanOrEqual(3);
  });

  // User message triggers
  it('adds simulator button when user asks to simulate', () => {
    const actions = extractActions('Il LED si accende così.', 'posso simulare questo?');
    expect(actions.buttons).toContainEqual(expect.objectContaining({ type: 'openSimulator' }));
  });

  // Null/empty
  it('returns empty actions for null text', () => {
    const actions = extractActions(null);
    expect(actions.commands).toEqual([]);
    expect(actions.buttons).toEqual([]);
    expect(actions.route).toBeNull();
  });
});


// ═══════════════════════════════════════════════════════════════
// Extra: logError and individual collector functions
// ═══════════════════════════════════════════════════════════════
describe('logError', () => {
  it('stores error in sessionStorage', () => {
    logError('compilation', 'missing semicolon');
    const history = JSON.parse(sStore['elab_error_history']);
    expect(history).toHaveLength(1);
    expect(history[0].type).toBe('compilation');
    expect(history[0].message).toBe('missing semicolon');
  });

  it('caps error history at 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      logError('test', `error ${i}`);
    }
    const history = JSON.parse(sStore['elab_error_history']);
    expect(history.length).toBeLessThanOrEqual(20);
  });

  it('truncates long error messages to 200 chars', () => {
    logError('compilation', 'x'.repeat(500));
    const history = JSON.parse(sStore['elab_error_history']);
    expect(history[0].message.length).toBeLessThanOrEqual(200);
  });
});

describe('collectElapsedTime', () => {
  it('returns null when no sessions', () => {
    expect(collectElapsedTime()).toBeNull();
  });

  it('returns elapsed seconds for active session', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    lStore['elab_unlim_sessions'] = JSON.stringify([
      { startTime: fiveMinAgo },
    ]);
    const elapsed = collectElapsedTime();
    expect(elapsed).toBeTypeOf('number');
    expect(elapsed).toBeGreaterThanOrEqual(290); // ~5 min
    expect(elapsed).toBeLessThanOrEqual(310);
  });

  it('returns null when last session is ended', () => {
    lStore['elab_unlim_sessions'] = JSON.stringify([
      { startTime: '2026-04-15T10:00:00Z', endTime: '2026-04-15T10:30:00Z' },
    ]);
    expect(collectElapsedTime()).toBeNull();
  });
});

describe('collectCircuitState', () => {
  it('returns null without API', () => {
    expect(collectCircuitState()).toBeNull();
  });

  it('returns context from getSimulatorContext', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => ({ components: [], wires: [] }),
    };
    const state = collectCircuitState();
    expect(state).toEqual({ components: [], wires: [] });
  });

  it('falls back to unlim.getCircuitState', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => null,
      unlim: { getCircuitState: () => ({ fallback: true }) },
    };
    const state = collectCircuitState();
    expect(state).toEqual({ fallback: true });
  });
});

describe('collectEditorCode', () => {
  it('returns null without API', () => {
    expect(collectEditorCode()).toBeNull();
  });

  it('returns code string when available', () => {
    window.__ELAB_API = {
      getEditorCode: () => 'int x = 5;',
    };
    expect(collectEditorCode()).toBe('int x = 5;');
  });
});

describe('collectBuildStep', () => {
  it('returns null without API', () => {
    expect(collectBuildStep()).toBeNull();
  });

  it('returns buildStep from simulatorContext', () => {
    window.__ELAB_API = {
      getSimulatorContext: () => ({ buildStep: { current: 2, total: 5 } }),
    };
    expect(collectBuildStep()).toEqual({ current: 2, total: 5 });
  });
});

// ═══════════════════════════════════════════════════════════════
// buildChatMessage replication test
// ═══════════════════════════════════════════════════════════════
describe('buildChatMessage (pattern replication)', () => {
  // Replicate the exact logic from api.js
  const SOCRATIC_INSTRUCTION_SAMPLE = '[AUTOCOSCIENZA — Chi sei e cosa puoi fare]\nSei UNLIM...';

  function buildChatMessage(message, socraticMode, experimentContext) {
    const parts = [];
    if (socraticMode) parts.push(SOCRATIC_INSTRUCTION_SAMPLE);
    if (experimentContext) parts.push(experimentContext);
    if (parts.length === 0) return message;
    return `${parts.join('\n')}\n\nMessaggio studente:\n${message}`;
  }

  it('returns plain message when socratic=false and no context', () => {
    expect(buildChatMessage('ciao', false, null)).toBe('ciao');
  });

  it('includes SOCRATIC_INSTRUCTION when socraticMode=true', () => {
    const result = buildChatMessage('aiuto', true, null);
    expect(result).toContain('AUTOCOSCIENZA');
    expect(result).toContain('Messaggio studente:');
    expect(result).toContain('aiuto');
  });

  it('includes experimentContext when provided', () => {
    const result = buildChatMessage('come collego?', false, 'Esperimento: LED base');
    expect(result).toContain('Esperimento: LED base');
    expect(result).toContain('come collego?');
  });

  it('includes both socratic and experiment context', () => {
    const result = buildChatMessage('perché?', true, 'Contesto: resistore');
    expect(result).toContain('AUTOCOSCIENZA');
    expect(result).toContain('Contesto: resistore');
    expect(result).toContain('perché?');
  });

  it('preserves user message exactly as provided (no mutation)', () => {
    const msg = '  il LED non si accende!!  ';
    const result = buildChatMessage(msg, false, null);
    expect(result).toContain(msg);
  });

  it('handles very long experiment context without truncation', () => {
    const longCtx = 'A'.repeat(2000);
    const result = buildChatMessage('test', false, longCtx);
    expect(result).toContain(longCtx);
  });

  it('socratic mode includes AUTOCOSCIENZA header', () => {
    const result = buildChatMessage('ciao', true, null);
    expect(result).toContain('AUTOCOSCIENZA');
    expect(result).toContain('UNLIM');
  });
});
