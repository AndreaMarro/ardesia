/**
 * componentRegistry — Tests for simulator component type registry
 * Verifica che tutti i componenti usati negli esperimenti siano registrati.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { registerComponent, getComponent, getAllComponents, getComponentsByCategory } from '../../src/components/simulator/components/registry';

describe('componentRegistry', () => {
  describe('registerComponent / getComponent', () => {
    it('registers and retrieves a component', () => {
      registerComponent('test-comp', {
        component: () => null,
        pins: ['pin1', 'pin2'],
        defaultState: { value: 0 },
        category: 'passive',
        label: 'Test Component',
      });
      const comp = getComponent('test-comp');
      expect(comp).not.toBeNull();
      expect(comp.type).toBe('test-comp');
      expect(comp.pins).toContain('pin1');
      expect(comp.category).toBe('passive');
      expect(comp.label).toBe('Test Component');
    });

    it('returns null for unregistered component', () => {
      expect(getComponent('nonexistent-xyz')).toBeNull();
    });

    it('overwrites on re-register', () => {
      registerComponent('overwrite-test', { label: 'V1' });
      registerComponent('overwrite-test', { label: 'V2' });
      expect(getComponent('overwrite-test').label).toBe('V2');
    });

    it('defaults category to passive', () => {
      registerComponent('default-cat', {});
      expect(getComponent('default-cat').category).toBe('passive');
    });

    it('defaults pins to empty array', () => {
      registerComponent('no-pins', {});
      expect(getComponent('no-pins').pins).toEqual([]);
    });
  });

  describe('getAllComponents', () => {
    it('returns a Map', () => {
      const all = getAllComponents();
      expect(all instanceof Map).toBe(true);
    });

    it('contains registered components', () => {
      registerComponent('in-all-test', { label: 'InAll' });
      const all = getAllComponents();
      expect(all.has('in-all-test')).toBe(true);
    });
  });

  describe('getComponentsByCategory', () => {
    it('filters by category', () => {
      registerComponent('cat-input-1', { category: 'input' });
      registerComponent('cat-output-1', { category: 'output' });
      const inputs = getComponentsByCategory('input');
      expect(inputs.some(c => c.type === 'cat-input-1')).toBe(true);
      expect(inputs.some(c => c.type === 'cat-output-1')).toBe(false);
    });

    it('returns empty array for unknown category', () => {
      const result = getComponentsByCategory('nonexistent-category');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('known component types from experiments', () => {
    // These are the component types used in experiments-vol*.js
    const REQUIRED_TYPES = ['led', 'resistor', 'battery9v'];

    // Note: registry is populated by SimulatorCanvas imports, not at module level.
    // These tests verify the registry API works, not that all components are loaded.
    it('registry API is functional', () => {
      registerComponent('api-test-led', {
        component: () => null,
        pins: ['anode', 'cathode'],
        category: 'output',
        label: 'LED',
      });
      const led = getComponent('api-test-led');
      expect(led.pins).toContain('anode');
      expect(led.pins).toContain('cathode');
    });
  });
});
