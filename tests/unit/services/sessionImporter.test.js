/**
 * sessionImporter.test.js — Unit tests for Goal B B2 session importer
 *
 * Covers:
 * - Happy path roundtrip: build → serialize → parse → equal.
 * - Version mismatch / invalid JSON / missing root / oversized payload.
 * - Prototype pollution + constructor injection (no Object.prototype mutation).
 * - Malformed experiment.id whitelist (path traversal, script tag).
 * - Component / wire count DoS caps.
 * - Missing component id rejected.
 * - restoreSession with no api — graceful failure.
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

import {
  parseSessionJSON,
  restoreSession,
  importSessionFromJSON,
  MAX_IMPORT_BYTES,
  MAX_COMPONENTS,
  MAX_WIRES,
} from '../../../src/services/sessionImporter.js';

import {
  buildSessionExport,
  serializeSessionExport,
  exportSessionAsJSON,
} from '../../../src/services/sessionExporter.js';

const ORIGINAL_ELAB_API = window.__ELAB_API;

function setApi(getCircuitStateImpl) {
  window.__ELAB_API = {
    unlim: {
      getCircuitState: getCircuitStateImpl,
    },
  };
}

beforeEach(() => {
  delete window.__ELAB_API;
});

afterEach(() => {
  if (ORIGINAL_ELAB_API) window.__ELAB_API = ORIGINAL_ELAB_API;
  else delete window.__ELAB_API;
  vi.restoreAllMocks();
  // Cleanup prototype just in case any test partially polluted (should never)
  delete Object.prototype.polluted;
});

describe('sessionImporter — constants', () => {
  it('MAX_IMPORT_BYTES is 1 MB', () => {
    expect(MAX_IMPORT_BYTES).toBe(1024 * 1024);
  });

  it('MAX_COMPONENTS is 200', () => {
    expect(MAX_COMPONENTS).toBe(200);
  });

  it('MAX_WIRES is 500', () => {
    expect(MAX_WIRES).toBe(500);
  });
});

describe('sessionImporter — parseSessionJSON happy path roundtrip', () => {
  it('build → serialize → parse returns equal session', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1', title: 'Primo LED', chapter: 6 },
      components: [
        { id: 'led1', type: 'led', position: { x: 240, y: 180 }, state: { color: 'red' } },
      ],
      connections: [
        { id: 'w1', from: 'led1:anode', to: 'bb1:row-5-a', color: 'red' },
      ],
    }));

    const built = buildSessionExport({ modalita: 'passo-passo' });
    const json = serializeSessionExport(built);
    const result = parseSessionJSON(json);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.session.elab_session_export.version).toBe('1.0');
    expect(result.session.elab_session_export.experiment.id).toBe('v1-cap6-esp1');
    expect(result.session.elab_session_export.modalita).toBe('passo-passo');
    expect(result.session.elab_session_export.components).toHaveLength(1);
    expect(result.session.elab_session_export.wires).toHaveLength(1);
    // Components must preserve id + type
    expect(result.session.elab_session_export.components[0].id).toBe('led1');
    expect(result.session.elab_session_export.components[0].type).toBe('led');
  });
});

describe('sessionImporter — version mismatch', () => {
  it('payload with version 2.0 → ok=false with version error', () => {
    const payload = {
      elab_session_export: {
        version: '2.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components: [],
        wires: [],
      },
    };
    const r = parseSessionJSON(JSON.stringify(payload));
    expect(r.ok).toBe(false);
    expect(r.session).toBeNull();
    expect(r.errors.some((e) => /version/i.test(e))).toBe(true);
  });
});

describe('sessionImporter — invalid JSON', () => {
  it('garbage string → ok=false invalid JSON', () => {
    const r = parseSessionJSON('this is not json {');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /invalid JSON/i.test(e))).toBe(true);
  });

  it('empty string → ok=false', () => {
    const r = parseSessionJSON('');
    expect(r.ok).toBe(false);
  });

  it('non-string input → ok=false', () => {
    const r = parseSessionJSON(null);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('Input must be a string');
  });
});

describe('sessionImporter — missing root key', () => {
  it('{} → ok=false missing root', () => {
    const r = parseSessionJSON('{}');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /elab_session_export/.test(e))).toBe(true);
  });

  it('array at root → ok=false', () => {
    const r = parseSessionJSON('[]');
    expect(r.ok).toBe(false);
  });
});

describe('sessionImporter — oversized payload', () => {
  it('string > MAX_IMPORT_BYTES → ok=false payload too large', () => {
    // Build a string longer than 1 MB without actually parsing huge JSON.
    const big = 'x'.repeat(MAX_IMPORT_BYTES + 100);
    const r = parseSessionJSON(big);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /payload too large/i.test(e))).toBe(true);
  });
});

describe('sessionImporter — prototype pollution / constructor injection', () => {
  it('payload with __proto__ does NOT pollute Object.prototype', () => {
    const malicious =
      '{"elab_session_export":{"version":"1.0","experiment":{"id":"v1-cap6-esp1","__proto__":{"polluted":true}},"modalita":"percorso","components":[],"wires":[]}}';
    const r = parseSessionJSON(malicious);
    // After parse, Object.prototype.polluted must still be undefined
    expect({}.polluted).toBeUndefined();
    // Either ok or not, but no pollution
    if (r.ok) {
      expect(r.session.elab_session_export.experiment.polluted).toBeUndefined();
    }
  });

  it('payload with top-level __proto__ does NOT pollute', () => {
    const malicious =
      '{"elab_session_export":{"version":"1.0","experiment":{"id":"v1-cap6-esp1"},"modalita":"percorso","components":[],"wires":[],"__proto__":{"polluted":true}}}';
    parseSessionJSON(malicious);
    expect({}.polluted).toBeUndefined();
  });

  it('payload with constructor.prototype injection does NOT pollute', () => {
    const malicious =
      '{"elab_session_export":{"version":"1.0","experiment":{"id":"v1-cap6-esp1","constructor":{"prototype":{"polluted":true}}},"modalita":"percorso","components":[],"wires":[]}}';
    parseSessionJSON(malicious);
    expect({}.polluted).toBeUndefined();
    // Native Object constructor untouched
    expect(Object.prototype.polluted).toBeUndefined();
  });

  it('component-level __proto__ injection → sanitized', () => {
    const malicious =
      '{"elab_session_export":{"version":"1.0","experiment":{"id":"v1-cap6-esp1"},"modalita":"percorso","components":[{"id":"led1","type":"led","__proto__":{"polluted":true}}],"wires":[]}}';
    const r = parseSessionJSON(malicious);
    expect({}.polluted).toBeUndefined();
    if (r.ok) {
      expect(r.session.elab_session_export.components[0].polluted).toBeUndefined();
    }
  });
});

describe('sessionImporter — malformed experiment.id', () => {
  function payloadWithId(id) {
    return JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id, title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components: [],
        wires: [],
      },
    });
  }

  it('path traversal "../../../etc/passwd" → rejected', () => {
    const r = parseSessionJSON(payloadWithId('../../../etc/passwd'));
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /experiment\.id/i.test(e))).toBe(true);
  });

  it('script tag in id → rejected', () => {
    const r = parseSessionJSON(payloadWithId('<script>alert(1)</script>'));
    expect(r.ok).toBe(false);
  });

  it('volume out of [1-3] range → rejected (v4-cap6-esp1)', () => {
    const r = parseSessionJSON(payloadWithId('v4-cap6-esp1'));
    expect(r.ok).toBe(false);
  });

  it('valid v1-cap6-esp1 → accepted', () => {
    const r = parseSessionJSON(payloadWithId('v1-cap6-esp1'));
    expect(r.ok).toBe(true);
  });

  it('valid v3-cap6-esp5 → accepted', () => {
    const r = parseSessionJSON(payloadWithId('v3-cap6-esp5'));
    expect(r.ok).toBe(true);
  });
});

describe('sessionImporter — DoS guards (component / wire caps)', () => {
  it('201 components → rejected by cap (MAX_COMPONENTS=200)', () => {
    const components = Array.from({ length: MAX_COMPONENTS + 1 }, (_, i) => ({
      id: `c${i}`,
      type: 'led',
    }));
    const payload = JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components,
        wires: [],
      },
    });
    const r = parseSessionJSON(payload);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /components.*MAX_COMPONENTS|exceeds/i.test(e))).toBe(true);
  });

  it('501 wires → rejected by cap (MAX_WIRES=500)', () => {
    const wires = Array.from({ length: MAX_WIRES + 1 }, (_, i) => ({
      id: `w${i}`,
      from: `a${i}`,
      to: `b${i}`,
    }));
    const payload = JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components: [],
        wires,
      },
    });
    const r = parseSessionJSON(payload);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /wires.*MAX_WIRES|exceeds/i.test(e))).toBe(true);
  });

  it('exactly MAX_COMPONENTS=200 components → accepted', () => {
    const components = Array.from({ length: MAX_COMPONENTS }, (_, i) => ({
      id: `c${i}`,
      type: 'led',
    }));
    const payload = JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components,
        wires: [],
      },
    });
    const r = parseSessionJSON(payload);
    expect(r.ok).toBe(true);
  });
});

describe('sessionImporter — required fields', () => {
  it('missing component id → rejected', () => {
    const payload = JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components: [{ type: 'led' }], // no id
        wires: [],
      },
    });
    const r = parseSessionJSON(payload);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /components\[0\].*id.*type/i.test(e))).toBe(true);
  });

  it('missing wire from/to → rejected', () => {
    const payload = JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'percorso',
        components: [],
        wires: [{ id: 'w1' }],
      },
    });
    const r = parseSessionJSON(payload);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /wires\[0\].*from\/to/i.test(e))).toBe(true);
  });

  it('modalita not in whitelist → rejected', () => {
    const payload = JSON.stringify({
      elab_session_export: {
        version: '1.0',
        exportedAt: '2026-05-27T20:30:00.000Z',
        experiment: { id: 'v1-cap6-esp1', title: 'x', volume: 1, chapter: 6 },
        modalita: 'evil-mode',
        components: [],
        wires: [],
      },
    });
    const r = parseSessionJSON(payload);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /modalita.*whitelist/i.test(e))).toBe(true);
  });
});

describe('sessionImporter — restoreSession', () => {
  it('no api available → returns ok=false with error', async () => {
    delete window.__ELAB_API;
    const session = {
      elab_session_export: {
        version: '1.0',
        experiment: { id: 'v1-cap6-esp1' },
        components: [],
        wires: [],
      },
    };
    const r = await restoreSession(session);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /api unavailable|Simulator API/i.test(e))).toBe(true);
  });

  it('invalid experiment.id → returns ok=false', async () => {
    const session = {
      elab_session_export: {
        version: '1.0',
        experiment: { id: 'malicious-id' },
        components: [],
        wires: [],
      },
    };
    const r = await restoreSession(session);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /experiment\.id/i.test(e))).toBe(true);
  });

  it('null session → ok=false', async () => {
    const r = await restoreSession(null);
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('Invalid session object');
  });

  it('happy path: clearCircuit + mountExperiment + setComponentValue + connectWire called', async () => {
    const calls = { clear: 0, mount: [], setValue: [], wire: [] };
    const api = {
      unlim: {
        clearCircuit: vi.fn(() => { calls.clear++; }),
        mountExperiment: vi.fn((id) => { calls.mount.push(id); return true; }),
        setComponentValue: vi.fn((id, k, v) => { calls.setValue.push([id, k, v]); }),
        connectWire: vi.fn((from, to) => { calls.wire.push([from, to]); }),
      },
    };
    const session = {
      elab_session_export: {
        version: '1.0',
        experiment: { id: 'v1-cap6-esp1' },
        components: [
          { id: 'led1', type: 'led', color: 'red', value: 1 },
          { id: 'r1', type: 'resistor', value: 220, color: null },
        ],
        wires: [{ id: 'w1', from: 'a', to: 'b' }],
      },
    };
    const r = await restoreSession(session, { api });
    expect(r.ok).toBe(true);
    expect(calls.clear).toBe(1);
    expect(calls.mount).toEqual(['v1-cap6-esp1']);
    expect(calls.setValue).toEqual([
      ['led1', 'value', 1],
      ['led1', 'color', 'red'],
      ['r1', 'value', 220],
    ]);
    expect(calls.wire).toEqual([['a', 'b']]);
    expect(r.applied).toEqual({ components: 2, wires: 1 });
  });

  it('mountExperiment returns false → ok=false', async () => {
    const api = {
      unlim: {
        mountExperiment: () => false,
        setComponentValue: vi.fn(),
        connectWire: vi.fn(),
      },
    };
    const session = {
      elab_session_export: {
        version: '1.0',
        experiment: { id: 'v1-cap6-esp1' },
        components: [],
        wires: [],
      },
    };
    const r = await restoreSession(session, { api });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /mount failed/i.test(e))).toBe(true);
  });

  it('mountExperiment throws → ok=false with error', async () => {
    const api = {
      unlim: {
        mountExperiment: () => { throw new Error('mount boom'); },
        setComponentValue: vi.fn(),
        connectWire: vi.fn(),
      },
    };
    const session = {
      elab_session_export: {
        version: '1.0',
        experiment: { id: 'v1-cap6-esp1' },
        components: [],
        wires: [],
      },
    };
    const r = await restoreSession(session, { api });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /mount failed.*mount boom/i.test(e))).toBe(true);
  });

  it('accepts unwrapped (inner) payload too', async () => {
    const api = {
      unlim: {
        mountExperiment: vi.fn(() => true),
        setComponentValue: vi.fn(),
        connectWire: vi.fn(),
      },
    };
    const inner = {
      version: '1.0',
      experiment: { id: 'v1-cap6-esp1' },
      components: [],
      wires: [],
    };
    const r = await restoreSession(inner, { api });
    expect(r.ok).toBe(true);
  });
});

describe('sessionImporter — importSessionFromJSON one-shot', () => {
  it('invalid JSON propagates parse errors', async () => {
    const r = await importSessionFromJSON('not json');
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /invalid JSON/i.test(e))).toBe(true);
  });

  it('valid JSON + working api → ok=true', async () => {
    const api = {
      unlim: {
        clearCircuit: vi.fn(),
        mountExperiment: vi.fn(() => true),
        setComponentValue: vi.fn(),
        connectWire: vi.fn(),
      },
    };
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1', title: 'x' },
      components: [],
      connections: [],
    }));
    const json = exportSessionAsJSON();
    const r = await importSessionFromJSON(json, { api });
    expect(r.ok).toBe(true);
  });
});
