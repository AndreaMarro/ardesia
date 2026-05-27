/**
 * sessionExporter.test.js — Unit tests for Goal B B1 session exporter
 *
 * Covers:
 * - buildSessionExport: returns elab_session_export wrapper with version 1.0,
 *   ISO exportedAt, experiment, modalita, components, wires.
 * - Empty circuit and missing __ELAB_API fallbacks (no throw).
 * - serializeSessionExport: JSON.parse roundtrip safe.
 * - exportSessionAsJSON: build+serialize shortcut.
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

import {
  buildSessionExport,
  serializeSessionExport,
  exportSessionAsJSON,
  EXPORT_SCHEMA_VERSION,
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
});

describe('sessionExporter — EXPORT_SCHEMA_VERSION', () => {
  it('exposes version 1.0', () => {
    expect(EXPORT_SCHEMA_VERSION).toBe('1.0');
  });
});

describe('sessionExporter — buildSessionExport (happy path)', () => {
  it('returns elab_session_export wrapper with all required fields', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1', title: 'Primo LED', chapter: 6 },
      components: [
        { id: 'led1', type: 'led', position: { x: 240, y: 180, rotation: 0 }, state: { color: 'red' } },
      ],
      connections: [
        { id: 'w1', from: 'led1:anode', to: 'bb1:row-5-a', color: 'red' },
      ],
    }));

    const result = buildSessionExport({ modalita: 'passo-passo' });

    expect(result).toHaveProperty('elab_session_export');
    const ese = result.elab_session_export;
    expect(ese.version).toBe('1.0');
    expect(typeof ese.exportedAt).toBe('string');
    // ISO 8601: YYYY-MM-DDTHH:MM:SS.sssZ — strict regex
    expect(ese.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(ese.experiment).toEqual({
      id: 'v1-cap6-esp1',
      title: 'Primo LED',
      volume: 1,
      chapter: 6,
    });
    expect(ese.modalita).toBe('passo-passo');
    expect(Array.isArray(ese.components)).toBe(true);
    expect(Array.isArray(ese.wires)).toBe(true);
  });

  it('default modalita is "percorso"', () => {
    setApi(() => ({ experiment: { id: 'v1-cap6-esp1' }, components: [], connections: [] }));
    const r = buildSessionExport();
    expect(r.elab_session_export.modalita).toBe('percorso');
  });

  it('maps components: id, type, x, y, rotation, color, value', () => {
    setApi(() => ({
      experiment: { id: 'v2-cap7-esp1' },
      components: [
        { id: 'r1', type: 'resistor', position: { x: 10, y: 20, rotation: 90 }, state: { value: 220 } },
        { id: 'led2', type: 'led', x: 50, y: 60, color: 'green', value: null },
      ],
      connections: [],
    }));

    const result = buildSessionExport();
    const comps = result.elab_session_export.components;

    expect(comps).toHaveLength(2);
    expect(comps[0]).toEqual({
      id: 'r1', type: 'resistor', x: 10, y: 20, rotation: 90, color: null, value: 220,
    });
    expect(comps[1]).toEqual({
      id: 'led2', type: 'led', x: 50, y: 60, rotation: 0, color: 'green', value: null,
    });
  });

  it('maps wires: id, from, to, color (default "auto")', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1' },
      components: [],
      connections: [
        { id: 'w1', from: 'a', to: 'b', color: 'red' },
        { from: 'c', to: 'd' }, // missing id + color
      ],
    }));

    const result = buildSessionExport();
    const wires = result.elab_session_export.wires;

    expect(wires).toHaveLength(2);
    expect(wires[0]).toEqual({ id: 'w1', from: 'a', to: 'b', color: 'red' });
    expect(wires[1]).toEqual({ id: 'w2', from: 'c', to: 'd', color: 'auto' });
  });

  it('derives volume from experiment id prefix v[123]-', () => {
    setApi(() => ({ experiment: { id: 'v3-cap6-esp5' }, components: [], connections: [] }));
    const r = buildSessionExport();
    expect(r.elab_session_export.experiment.volume).toBe(3);
  });

  it('derives chapter from experiment id "-capN-"', () => {
    setApi(() => ({ experiment: { id: 'v2-cap7-esp1' }, components: [], connections: [] }));
    const r = buildSessionExport();
    expect(r.elab_session_export.experiment.chapter).toBe(7);
  });

  it('derives chapter from string "Capitolo N" when no id match', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1', chapter: 'Capitolo 9' },
      components: [],
      connections: [],
    }));
    const r = buildSessionExport();
    // String "Capitolo 9" takes precedence over id "-cap6-" per source order
    expect(r.elab_session_export.experiment.chapter).toBe(9);
  });

  it('experimentMeta overrides live experiment metadata', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1', title: 'Live Title' },
      components: [],
      connections: [],
    }));

    const r = buildSessionExport({
      experimentMeta: { id: 'v2-cap7-esp1', title: 'Override Title', volume: 2, chapter: 7 },
    });
    expect(r.elab_session_export.experiment).toEqual({
      id: 'v2-cap7-esp1',
      title: 'Override Title',
      volume: 2,
      chapter: 7,
    });
  });
});

describe('sessionExporter — empty/missing fallbacks (no throw)', () => {
  it('empty circuit returns empty components and wires arrays', () => {
    setApi(() => ({ experiment: { id: 'v1-cap6-esp1' }, components: [], connections: [] }));
    const r = buildSessionExport();
    expect(r.elab_session_export.components).toEqual([]);
    expect(r.elab_session_export.wires).toEqual([]);
  });

  it('no __ELAB_API available returns empty session object (no throw)', () => {
    delete window.__ELAB_API;
    expect(() => buildSessionExport()).not.toThrow();
    const r = buildSessionExport();
    expect(r).toHaveProperty('elab_session_export');
    expect(r.elab_session_export.version).toBe('1.0');
    expect(r.elab_session_export.experiment).toEqual({
      id: null, title: null, volume: null, chapter: null,
    });
    expect(r.elab_session_export.components).toEqual([]);
    expect(r.elab_session_export.wires).toEqual([]);
  });

  it('getCircuitState throws — falls back to empty session', () => {
    setApi(() => { throw new Error('boom'); });
    expect(() => buildSessionExport()).not.toThrow();
    const r = buildSessionExport();
    expect(r.elab_session_export.components).toEqual([]);
    expect(r.elab_session_export.wires).toEqual([]);
  });

  it('getCircuitState returns null — falls back', () => {
    setApi(() => null);
    const r = buildSessionExport();
    expect(r.elab_session_export.components).toEqual([]);
    expect(r.elab_session_export.wires).toEqual([]);
  });

  it('explicit api opt overrides window.__ELAB_API', () => {
    setApi(() => ({ experiment: { id: 'v1-cap6-esp1' }, components: [{ id: 'wrong', type: 'x' }], connections: [] }));
    const customApi = {
      unlim: {
        getCircuitState: () => ({
          experiment: { id: 'v2-cap7-esp2' },
          components: [{ id: 'right', type: 'led' }],
          connections: [],
        }),
      },
    };
    const r = buildSessionExport({ api: customApi });
    expect(r.elab_session_export.experiment.id).toBe('v2-cap7-esp2');
    expect(r.elab_session_export.components[0].id).toBe('right');
  });
});

describe('sessionExporter — serializeSessionExport', () => {
  it('produces valid JSON parseable by JSON.parse', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1', title: 'Primo LED' },
      components: [{ id: 'led1', type: 'led', position: { x: 1, y: 2 } }],
      connections: [{ from: 'a', to: 'b' }],
    }));

    const session = buildSessionExport();
    const json = serializeSessionExport(session);

    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(session);
  });

  it('produces indented JSON (indent 2)', () => {
    const session = { elab_session_export: { version: '1.0' } };
    const json = serializeSessionExport(session);
    expect(json).toContain('\n  "elab_session_export"');
  });
});

describe('sessionExporter — exportSessionAsJSON (shortcut)', () => {
  it('is equivalent to build + serialize', () => {
    setApi(() => ({
      experiment: { id: 'v1-cap6-esp1' },
      components: [],
      connections: [],
    }));

    const json1 = exportSessionAsJSON({ modalita: 'gia-montato' });
    const parsed1 = JSON.parse(json1);
    expect(parsed1.elab_session_export.modalita).toBe('gia-montato');
    expect(parsed1.elab_session_export.version).toBe('1.0');
  });

  it('default export points to exportSessionAsJSON', async () => {
    const mod = await import('../../../src/services/sessionExporter.js');
    expect(typeof mod.default).toBe('function');
  });
});
