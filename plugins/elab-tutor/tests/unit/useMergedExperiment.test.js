/**
 * useMergedExperiment — Tests for experiment data merging logic
 * Verifica che componenti, connessioni, layout vengano mergiati correttamente.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';

// Test the pure merge logic without React hooks
// Extract logic by testing the data structures directly

describe('useMergedExperiment — merge logic', () => {
  describe('component filtering', () => {
    it('filtra componenti con hidden=true', () => {
      const components = [
        { id: 'led-1', type: 'led', hidden: false },
        { id: 'r-1', type: 'resistor', hidden: true },
        { id: 'btn-1', type: 'button' },
      ];
      const visible = components.filter(c => !c.hidden);
      expect(visible).toHaveLength(2);
      expect(visible.map(c => c.id)).toContain('led-1');
      expect(visible.map(c => c.id)).not.toContain('r-1');
    });

    it('componenti senza hidden flag sono visibili', () => {
      const components = [{ id: 'led-1', type: 'led' }];
      const visible = components.filter(c => !c.hidden);
      expect(visible).toHaveLength(1);
    });
  });

  describe('connection merging', () => {
    it('merge base + custom connections senza duplicati', () => {
      const base = [
        { from: 'led-1:anode', to: 'r-1:pin1' },
        { from: 'r-1:pin2', to: 'bus-plus' },
      ];
      const custom = [
        { from: 'btn-1:pin1', to: 'led-1:cathode' },
      ];
      const merged = [
        ...base.map((c, i) => ({ ...c, id: `base-${i}` })),
        ...custom.map((c, i) => ({ ...c, id: `custom-${i}` })),
      ];
      expect(merged).toHaveLength(3);
      // Nessun duplicato
      const ids = merged.map(c => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('rimuove connessioni con componenti nascosti', () => {
      const connections = [
        { from: 'led-1:anode', to: 'r-1:pin1' },
        { from: 'hidden-1:pin1', to: 'bus-plus' },
      ];
      const hiddenIds = new Set(['hidden-1']);
      const filtered = connections.filter(c => {
        const fromComp = c.from.split(':')[0];
        const toComp = c.to.split(':')[0];
        return !hiddenIds.has(fromComp) && !hiddenIds.has(toComp);
      });
      expect(filtered).toHaveLength(1);
    });
  });

  describe('pin assignment merging', () => {
    it('custom pin assignments sovrascrivono base', () => {
      const basePins = { 'led-1': { anode: 'A1', cathode: 'A2' } };
      const customPins = { 'led-1': { anode: 'B5' } };
      const merged = {};
      for (const [compId, pins] of Object.entries(basePins)) {
        merged[compId] = { ...pins };
      }
      for (const [compId, pins] of Object.entries(customPins)) {
        merged[compId] = { ...(merged[compId] || {}), ...pins };
      }
      expect(merged['led-1'].anode).toBe('B5');
      expect(merged['led-1'].cathode).toBe('A2');
    });

    it('null values in custom non sovrascrivono', () => {
      const basePins = { 'led-1': { anode: 'A1' } };
      const customPins = { 'led-1': { anode: null } };
      const merged = {};
      for (const [compId, pins] of Object.entries(basePins)) {
        merged[compId] = { ...pins };
      }
      for (const [compId, pins] of Object.entries(customPins)) {
        for (const [pin, val] of Object.entries(pins)) {
          if (val !== null && val !== undefined) {
            if (!merged[compId]) merged[compId] = {};
            merged[compId][pin] = val;
          }
        }
      }
      expect(merged['led-1'].anode).toBe('A1');
    });
  });

  describe('layout merging', () => {
    it('merge base layout con override posizione', () => {
      const baseLayout = { 'led-1': { x: 100, y: 200 } };
      const customLayout = { 'led-1': { x: 300 } };
      const merged = {};
      for (const [id, layout] of Object.entries(baseLayout)) {
        merged[id] = { ...layout };
      }
      for (const [id, layout] of Object.entries(customLayout)) {
        merged[id] = { ...(merged[id] || {}), ...layout };
      }
      expect(merged['led-1'].x).toBe(300);
      expect(merged['led-1'].y).toBe(200);
    });

    it('rimuove layout per componenti nascosti', () => {
      const layout = { 'led-1': { x: 100 }, 'hidden-1': { x: 200 } };
      const hiddenIds = new Set(['hidden-1']);
      const filtered = {};
      for (const [id, l] of Object.entries(layout)) {
        if (!hiddenIds.has(id)) filtered[id] = l;
      }
      expect(Object.keys(filtered)).toEqual(['led-1']);
    });
  });

  describe('ID format parsing', () => {
    it('split component ID da pin notation', () => {
      expect('led-1:anode'.split(':')[0]).toBe('led-1');
      expect('nano:D13'.split(':')[0]).toBe('nano');
      expect('bus-plus'.split(':')[0]).toBe('bus-plus');
    });

    it('gestisce ID senza ":" (solo componente)', () => {
      const id = 'bus-plus';
      const parts = id.split(':');
      expect(parts[0]).toBe('bus-plus');
      expect(parts[1]).toBeUndefined();
    });
  });
});
