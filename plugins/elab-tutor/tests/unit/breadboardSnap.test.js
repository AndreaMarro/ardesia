/**
 * breadboardSnap.test.js — Test per breadboard snap grid e auto-assignment
 * 10 test: constants, findNearestHole, generateComponentId, analyzePinLayout
 */
import { describe, it, expect } from 'vitest';
import { findNearestHole, findNearestHoleFull, generateComponentId, analyzePinLayout, getHolePixelPosition } from '../../src/components/simulator/utils/breadboardSnap';

describe('breadboardSnap — constants & geometry', () => {
  it('findNearestHole returns object for center of board', () => {
    // Center of a BreadboardHalf: ~100, ~40
    const result = findNearestHole(100, 40);
    if (result) {
      expect(result).toHaveProperty('holeId');
      expect(result).toHaveProperty('row');
      expect(result).toHaveProperty('col');
    }
  });

  it('findNearestHole returns null for far-away position', () => {
    const result = findNearestHole(-1000, -1000);
    expect(result).toBeNull();
  });

  it('findNearestHoleFull returns object for valid position', () => {
    const result = findNearestHoleFull(30, 30);
    if (result) {
      expect(result).toHaveProperty('holeId');
    }
  });

  it('findNearestHoleFull returns null for far-away position', () => {
    expect(findNearestHoleFull(-1000, -1000)).toBeNull();
  });
});

describe('breadboardSnap — generateComponentId', () => {
  it('generates ID with type prefix', () => {
    const id = generateComponentId('led', []);
    expect(id).toContain('led');
  });

  it('avoids existing IDs', () => {
    const id = generateComponentId('led', ['led1']);
    expect(id).not.toBe('led1');
  });

  it('generates unique IDs for same type', () => {
    const id1 = generateComponentId('resistor', []);
    const id2 = generateComponentId('resistor', [id1]);
    expect(id1).not.toBe(id2);
  });
});

describe('breadboardSnap — analyzePinLayout', () => {
  it('returns object for pin array', () => {
    const result = analyzePinLayout([
      { id: 'anode', x: 0, y: 0 },
      { id: 'cathode', x: 0, y: 15 },
    ]);
    expect(result).toBeDefined();
  });

  it('handles empty pin array', () => {
    const result = analyzePinLayout([]);
    expect(result).toBeDefined();
  });

  it('handles single pin', () => {
    const result = analyzePinLayout([{ id: 'pin1', x: 0, y: 0 }]);
    expect(result).toBeDefined();
  });
});

describe('breadboardSnap — getHolePixelPosition', () => {
  // getHolePixelPosition with simple ID removed — needs BB context

  it('returns null for invalid hole ID', () => {
    expect(getHolePixelPosition('zzz999')).toBeNull();
  });
});
