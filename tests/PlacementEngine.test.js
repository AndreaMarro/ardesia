// ============================================
// PlacementEngine — Unit Tests
// Andrea Marro — 02/03/2026
// ============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── MOCKS ──────────────────────────────────────────────────────
// Mock the component registry
vi.mock('../src/components/simulator/components/registry', () => ({
  getComponent: vi.fn(),
}));

// We do NOT mock breadboardSnap — we use the real constants/functions
// since PlacementEngine depends on exact grid math.

import { getComponent } from '../src/components/simulator/components/registry';
import {
  validateIntent,
  OccupancyMap,
  placeComponent,
  resolveAutoWiring,
  resolvePlacement,
} from '../src/components/simulator/engine/PlacementEngine';
import {
  BB_PITCH, BB_PAD_X, BB_Y_SEC_TOP, BB_Y_SEC_BOT,
  BB_COLS, BB_TOP_ROWS, BB_BOT_ROWS,
} from '../src/components/simulator/utils/breadboardSnap';

// ── TEST FIXTURES ──────────────────────────────────────────────

/** A simple 2-pin vertical LED: anode at (0,0), cathode at (0, BB_PITCH) */
const LED_PINS = [
  { id: 'anode', x: 0, y: 0 },
  { id: 'cathode', x: 0, y: BB_PITCH },
];

/** A horizontal 2-pin resistor: pin1 at (0,0), pin2 at (3*BB_PITCH, 0) */
const RESISTOR_PINS = [
  { id: 'pin1', x: 0, y: 0 },
  { id: 'pin2', x: 3 * BB_PITCH, y: 0 },
];

/** A 4-pin vertical push-button */
const BUTTON_PINS = [
  { id: 'pin1', x: 0, y: 0 },
  { id: 'pin2', x: 0, y: 3 * BB_PITCH },
];

function mockComponent(type, pins) {
  getComponent.mockImplementation((t) => {
    if (t === type) return { type, pins, category: 'passive' };
    return null;
  });
}

function mockMultipleComponents(compMap) {
  getComponent.mockImplementation((t) => {
    if (compMap[t]) return { type: t, pins: compMap[t], category: 'passive' };
    return null;
  });
}

/** Empty circuit snapshot */
const EMPTY_SNAPSHOT = {
  components: [],
  connections: [],
  layout: { bb1: { x: 0, y: 0 } },
  pinAssignments: {},
};

/** Snapshot with an existing resistor at column 5, top section row c */
function snapshotWithResistor() {
  return {
    components: [{ id: 'r1', type: 'resistor' }],
    connections: [],
    layout: { bb1: { x: 0, y: 0 } },
    pinAssignments: {
      'r1:pin1': 'bb1:c6',  // col 5 (0-based), row c
      'r1:pin2': 'bb1:c9',  // col 8 (0-based), row c
    },
  };
}

// ═══════════════════════════════════════════════════════════════
//  1. VALIDATE INTENT
// ═══════════════════════════════════════════════════════════════

describe('validateIntent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects null/undefined/non-object', () => {
    expect(validateIntent(null).valid).toBe(false);
    expect(validateIntent(undefined).valid).toBe(false);
    expect(validateIntent('string').valid).toBe(false);
    expect(validateIntent(42).valid).toBe(false);
  });

  it('rejects missing action field', () => {
    const r = validateIntent({ components: [] });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('action'))).toBe(true);
  });

  it('rejects unknown action', () => {
    const r = validateIntent({ action: 'destroy' });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('Unknown action'))).toBe(true);
  });

  it('accepts valid actions', () => {
    for (const action of ['place_and_wire', 'place', 'wire', 'remove']) {
      expect(validateIntent({ action }).valid).toBe(true);
    }
  });

  it('validates component type against KNOWN_TYPES + registry', () => {
    mockComponent('led', LED_PINS);
    const r = validateIntent({
      action: 'place',
      components: [{ type: 'led' }],
    });
    expect(r.valid).toBe(true);
  });

  it('rejects unknown component type', () => {
    getComponent.mockReturnValue(null);
    const r = validateIntent({
      action: 'place',
      components: [{ type: 'flux-capacitor' }],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('flux-capacitor'))).toBe(true);
  });

  it('rejects non-string near field', () => {
    mockComponent('led', LED_PINS);
    const r = validateIntent({
      action: 'place',
      components: [{ type: 'led', near: 42 }],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('near'))).toBe(true);
  });

  it('rejects invalid relation', () => {
    mockComponent('led', LED_PINS);
    const r = validateIntent({
      action: 'place',
      components: [{ type: 'led', relation: 'diagonal' }],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('diagonal'))).toBe(true);
  });

  it('accepts valid relation values', () => {
    mockComponent('led', LED_PINS);
    for (const relation of ['below', 'above', 'left', 'right', 'next-to']) {
      const r = validateIntent({
        action: 'place',
        components: [{ type: 'led', relation }],
      });
      expect(r.valid).toBe(true);
    }
  });

  it('rejects invalid section value', () => {
    mockComponent('led', LED_PINS);
    const r = validateIntent({
      action: 'place',
      components: [{ type: 'led', section: 'middle' }],
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('section'))).toBe(true);
  });

  it('rejects non-array components field', () => {
    const r = validateIntent({
      action: 'place',
      components: 'not-an-array',
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some(e => e.includes('array'))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  2. OCCUPANCY MAP
// ═══════════════════════════════════════════════════════════════

describe('OccupancyMap', () => {
  it('constructs from empty pinAssignments', () => {
    const map = new OccupancyMap({});
    expect(map.isHoleFree('bb1', 'a1')).toBe(true);
    expect(map.getOccupiedHoles('bb1').size).toBe(0);
  });

  it('marks holes as occupied from pinAssignments', () => {
    const map = new OccupancyMap({
      'r1:pin1': 'bb1:a5',
      'r1:pin2': 'bb1:a8',
    });
    expect(map.isHoleFree('bb1', 'a5')).toBe(false);
    expect(map.isHoleFree('bb1', 'a8')).toBe(false);
    expect(map.isHoleFree('bb1', 'a6')).toBe(true);
    expect(map.getOccupiedHoles('bb1').size).toBe(2);
  });

  it('handles null/undefined values gracefully', () => {
    const map = new OccupancyMap({
      'r1:pin1': null,
      'r1:pin2': undefined,
      'r1:pin3': 'bb1:a5',
    });
    expect(map.getOccupiedHoles('bb1').size).toBe(1);
    expect(map.isHoleFree('bb1', 'a5')).toBe(false);
  });

  it('handles malformed bbHole values', () => {
    const map = new OccupancyMap({
      'r1:pin1': 'invalid',
      'r1:pin2': ':',
      'r1:pin3': '',
    });
    expect(map.getOccupiedHoles('bb1').size).toBe(0);
  });

  it('areHolesFree checks ALL holes', () => {
    const map = new OccupancyMap({ 'r1:pin1': 'bb1:c5' });
    expect(map.areHolesFree('bb1', ['c4', 'c6'])).toBe(true);
    expect(map.areHolesFree('bb1', ['c4', 'c5'])).toBe(false);
  });

  it('findFreeColumn returns preferred column when free', () => {
    const map = new OccupancyMap({});
    const col = map.findFreeColumn('bb1', 'top', 2, 10);
    expect(col).toBe(10);
  });

  it('findFreeColumn scans outward when preferred is occupied', () => {
    const map = new OccupancyMap({
      'r1:pin1': 'bb1:a11', // col 10 (0-based)
    });
    const col = map.findFreeColumn('bb1', 'top', 1, 10);
    // col 10 is occupied → should find 11 or 9
    expect(col).not.toBe(10);
    expect(col).not.toBeNull();
    expect(Math.abs(col - 10)).toBeLessThanOrEqual(1);
  });

  it('findFreeColumn returns null when breadboard is full', () => {
    // Fill every hole in the top section for all 30 columns (row a only = 1 required row)
    const pins = {};
    for (let c = 0; c < BB_COLS; c++) {
      pins[`comp${c}:pin1`] = `bb1:a${c + 1}`;
    }
    const map = new OccupancyMap(pins);
    const col = map.findFreeColumn('bb1', 'top', 1, 15);
    expect(col).toBeNull();
  });

  it('findFreeGapColumn finds column spanning top and bottom', () => {
    const map = new OccupancyMap({});
    const col = map.findFreeGapColumn('bb1', 2, 2, 15);
    expect(col).toBe(15);
  });

  it('findFreeGapColumn skips occupied columns', () => {
    const map = new OccupancyMap({
      'x:p1': 'bb1:e16',  // col 15 top occupied
    });
    const col = map.findFreeGapColumn('bb1', 1, 1, 15);
    expect(col).not.toBe(15);
    expect(col).not.toBeNull();
  });

  it('markOccupied updates the map dynamically', () => {
    const map = new OccupancyMap({});
    expect(map.isHoleFree('bb1', 'a5')).toBe(true);

    map.markOccupied({ 'led1:anode': 'bb1:a5' });
    expect(map.isHoleFree('bb1', 'a5')).toBe(false);
  });

  it('getOccupant returns the component:pin pair', () => {
    const map = new OccupancyMap({ 'r1:pin1': 'bb1:c6' });
    expect(map.getOccupant('bb1', 'c6')).toBe('r1:pin1');
    expect(map.getOccupant('bb1', 'c7')).toBeNull();
  });

  it('tracks multiple breadboards independently', () => {
    const map = new OccupancyMap({
      'r1:pin1': 'bb1:a5',
      'r2:pin1': 'bb2:a5',
    });
    expect(map.isHoleFree('bb1', 'a5')).toBe(false);
    expect(map.isHoleFree('bb2', 'a5')).toBe(false);
    expect(map.isHoleFree('bb1', 'a6')).toBe(true);
    expect(map.isHoleFree('bb2', 'a6')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  3. PLACE COMPONENT
// ═══════════════════════════════════════════════════════════════

describe('placeComponent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('places a vertical LED on empty breadboard', () => {
    mockComponent('led', LED_PINS);
    const occupancy = new OccupancyMap({});
    const result = placeComponent(
      { type: 'led' },
      'led_1',
      occupancy,
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    expect(typeof result.x).toBe('number');
    expect(typeof result.y).toBe('number');
    expect(result.pinAssignments).toBeDefined();
    expect(Object.keys(result.pinAssignments).length).toBe(2);

    // Pin assignments should reference bb1 holes
    for (const hole of Object.values(result.pinAssignments)) {
      expect(hole).toMatch(/^bb1:[a-j]\d+$/);
    }
  });

  it('places a horizontal resistor on empty breadboard', () => {
    mockComponent('resistor', RESISTOR_PINS);
    const occupancy = new OccupancyMap({});
    const result = placeComponent(
      { type: 'resistor' },
      'r1',
      occupancy,
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    expect(Object.keys(result.pinAssignments).length).toBe(2);

    // Both pins should be on the same row (horizontal)
    const holes = Object.values(result.pinAssignments);
    const row1 = holes[0].split(':')[1][0];
    const row2 = holes[1].split(':')[1][0];
    expect(row1).toBe(row2);
  });

  it('fails for unknown component type', () => {
    getComponent.mockReturnValue(null);
    const occupancy = new OccupancyMap({});
    const result = placeComponent(
      { type: 'unobtainium' },
      'u1',
      occupancy,
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown');
  });

  it('places "near" a reference component', () => {
    mockComponent('led', LED_PINS);
    const snap = snapshotWithResistor();
    const occupancy = new OccupancyMap(snap.pinAssignments);

    const result = placeComponent(
      { type: 'led', near: 'r1', relation: 'right' },
      'led_1',
      occupancy,
      snap,
    );

    expect(result.success).toBe(true);

    // LED should be placed to the right of the resistor (col 8 → ~col 10)
    const ledCols = Object.values(result.pinAssignments)
      .map(h => parseInt(h.split(':')[1].slice(1), 10));
    const maxResistorCol = 9; // c9 = col 9 (1-based)
    expect(Math.min(...ledCols)).toBeGreaterThan(maxResistorCol);
  });

  it('places "below" swaps section from top to bot', () => {
    mockComponent('led', LED_PINS);
    const snap = snapshotWithResistor();
    const occupancy = new OccupancyMap(snap.pinAssignments);

    const result = placeComponent(
      { type: 'led', near: 'r1', relation: 'below' },
      'led_1',
      occupancy,
      snap,
    );

    expect(result.success).toBe(true);

    // LED should be in bot section (f-j rows)
    const rows = Object.values(result.pinAssignments)
      .map(h => h.split(':')[1][0]);
    expect(rows.every(r => BB_BOT_ROWS.includes(r))).toBe(true);
  });

  it('places "above" swaps section from bot to top', () => {
    mockComponent('led', LED_PINS);
    const snap = {
      ...EMPTY_SNAPSHOT,
      pinAssignments: {
        'r1:pin1': 'bb1:f6',  // bot section
        'r1:pin2': 'bb1:f9',
      },
    };
    const occupancy = new OccupancyMap(snap.pinAssignments);

    const result = placeComponent(
      { type: 'led', near: 'r1', relation: 'above' },
      'led_1',
      occupancy,
      snap,
    );

    expect(result.success).toBe(true);

    // LED should be in top section (a-e rows)
    const rows = Object.values(result.pinAssignments)
      .map(h => h.split(':')[1][0]);
    expect(rows.every(r => BB_TOP_ROWS.includes(r))).toBe(true);
  });

  it('places in bottom section when section="bottom"', () => {
    mockComponent('led', LED_PINS);
    const occupancy = new OccupancyMap({});

    const result = placeComponent(
      { type: 'led', section: 'bottom' },
      'led_1',
      occupancy,
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);

    const rows = Object.values(result.pinAssignments)
      .map(h => h.split(':')[1][0]);
    expect(rows.every(r => BB_BOT_ROWS.includes(r))).toBe(true);
  });

  it('avoids occupied holes by scanning outward', () => {
    mockComponent('led', LED_PINS);
    // Occupy column 6 (default placement area) on all top rows
    const pins = {};
    for (const row of BB_TOP_ROWS) {
      pins[`x:${row}6`] = `bb1:${row}6`;
    }
    const occupancy = new OccupancyMap(pins);

    const result = placeComponent(
      { type: 'led' },
      'led_1',
      occupancy,
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    // Should NOT be placed on col 6 (1-based)
    const cols = Object.values(result.pinAssignments)
      .map(h => parseInt(h.split(':')[1].slice(1), 10));
    expect(cols.every(c => c !== 6)).toBe(true);
  });

  it('handles missing layout gracefully (defaults to {x:0,y:0})', () => {
    mockComponent('led', LED_PINS);
    const snap = { ...EMPTY_SNAPSHOT, layout: {} };
    const occupancy = new OccupancyMap({});

    const result = placeComponent({ type: 'led' }, 'led_1', occupancy, snap);
    expect(result.success).toBe(true);
  });

  it('handles component without pins', () => {
    getComponent.mockReturnValue({ type: 'mystery', pins: [], category: 'other' });
    const occupancy = new OccupancyMap({});
    const result = placeComponent({ type: 'mystery' }, 'm1', occupancy, EMPTY_SNAPSHOT);
    expect(result.success).toBe(false);
    expect(result.error).toContain('pinless');
  });
});

// ═══════════════════════════════════════════════════════════════
//  4. AUTO-WIRING
// ═══════════════════════════════════════════════════════════════

describe('resolveAutoWiring', () => {
  beforeEach(() => vi.clearAllMocks());

  it('generates GND wire for LED cathode', () => {
    mockComponent('led', LED_PINS);
    const pinAssignments = {
      'led1:anode': 'bb1:a5',
      'led1:cathode': 'bb1:b5',
    };
    const wires = resolveAutoWiring(
      { type: 'led' },
      'led1',
      pinAssignments,
      'bb1',
      EMPTY_SNAPSHOT,
    );

    // Should have at least one wire to bus-minus
    const gndWire = wires.find(w => w.to.includes('bus') && w.to.includes('minus'));
    expect(gndWire).toBeDefined();
    expect(gndWire.from).toContain('led1:cathode');
  });

  it('generates signal wire when connectTo is specified', () => {
    mockComponent('led', LED_PINS);
    const pinAssignments = { 'led1:anode': 'bb1:a5', 'led1:cathode': 'bb1:b5' };
    const snap = {
      ...EMPTY_SNAPSHOT,
      components: [{ id: 'nano1', type: 'nano-r4-board' }],
    };

    const wires = resolveAutoWiring(
      { type: 'led', connectTo: 'W_D3' },
      'led1',
      pinAssignments,
      'bb1',
      snap,
    );

    const signalWire = wires.find(w => w.from.includes('W_D3'));
    expect(signalWire).toBeDefined();
    expect(signalWire.to).toContain('led1:anode');
    expect(signalWire.color).toBe('#22B14C'); // green
  });

  it('does not duplicate existing wires', () => {
    mockComponent('led', LED_PINS);
    const pinAssignments = { 'led1:anode': 'bb1:a5', 'led1:cathode': 'bb1:b5' };
    const snap = {
      ...EMPTY_SNAPSHOT,
      connections: [
        { from: 'led1:cathode', to: 'bb1:bus-top-minus' },
      ],
    };

    const wires = resolveAutoWiring(
      { type: 'led' },
      'led1',
      pinAssignments,
      'bb1',
      snap,
    );

    // Should not add a duplicate GND wire (existing one connects cathode to bus)
    // Note: bus naming might differ (bus-top-minus vs bus-bot-minus)
    // but the dedup logic checks both directions
    expect(wires.length).toBeLessThanOrEqual(1);
  });

  it('returns empty array for unknown component type with no template', () => {
    getComponent.mockReturnValue({ type: 'servo', pins: [{ id: 'signal', x: 0, y: 0 }] });
    const wires = resolveAutoWiring(
      { type: 'servo' },
      'servo1',
      { 'servo1:signal': 'bb1:a5' },
      'bb1',
      EMPTY_SNAPSHOT,
    );
    // servo has no wiring template → only connectTo-based wires (none here)
    expect(wires).toEqual([]);
  });

  it('handles missing Arduino gracefully', () => {
    mockComponent('led', LED_PINS);
    const pinAssignments = { 'led1:anode': 'bb1:a5', 'led1:cathode': 'bb1:b5' };

    // connectTo specified but no Arduino in snapshot
    const wires = resolveAutoWiring(
      { type: 'led', connectTo: 'W_D3' },
      'led1',
      pinAssignments,
      'bb1',
      EMPTY_SNAPSHOT, // no components
    );

    // Should still generate GND wire but no signal wire (no Arduino)
    const signalWire = wires.find(w => w.from.includes('W_D3'));
    expect(signalWire).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
//  5. RESOLVE PLACEMENT (full integration)
// ═══════════════════════════════════════════════════════════════

describe('resolvePlacement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns failure for invalid intent', () => {
    const result = resolvePlacement(null, EMPTY_SNAPSHOT);
    expect(result.success).toBe(false);
    expect(result.actions).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('places a single LED on empty breadboard', () => {
    mockComponent('led', LED_PINS);
    const result = resolvePlacement(
      {
        action: 'place_and_wire',
        components: [{ type: 'led' }],
      },
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    expect(result.actions.length).toBeGreaterThanOrEqual(1);

    // First action should be addcomponent
    const addComp = result.actions.find(a => a.type === 'addcomponent');
    expect(addComp).toBeDefined();
    expect(addComp.tag).toMatch(/\[AZIONE:addcomponent:led:\d+:\d+\]/);
    expect(addComp.componentId).toMatch(/^pe_led_/);
    expect(addComp.pinAssignments).toBeDefined();
  });

  it('generates addwire actions for place_and_wire', () => {
    mockComponent('led', LED_PINS);
    const result = resolvePlacement(
      {
        action: 'place_and_wire',
        components: [{ type: 'led' }],
      },
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    const wireActions = result.actions.filter(a => a.type === 'addwire');
    // LED should get at least a GND bus wire
    expect(wireActions.length).toBeGreaterThanOrEqual(1);
    expect(wireActions[0].tag).toMatch(/\[AZIONE:addwire:/);
  });

  it('does NOT generate wires for action "place" (no wire)', () => {
    mockComponent('led', LED_PINS);
    const result = resolvePlacement(
      {
        action: 'place',
        components: [{ type: 'led' }],
        wires: 'none',
      },
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    const wireActions = result.actions.filter(a => a.type === 'addwire');
    expect(wireActions.length).toBe(0);
  });

  it('places multiple components with correct occupancy tracking', () => {
    mockMultipleComponents({
      led: LED_PINS,
      resistor: RESISTOR_PINS,
    });

    const result = resolvePlacement(
      {
        action: 'place',
        components: [
          { type: 'led' },
          { type: 'resistor' },
        ],
        wires: 'none',
      },
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    const addComps = result.actions.filter(a => a.type === 'addcomponent');
    expect(addComps.length).toBe(2);

    // Components should NOT overlap — check no shared holes
    const allHoles = new Set();
    let hasOverlap = false;
    for (const action of addComps) {
      for (const hole of Object.values(action.pinAssignments)) {
        if (allHoles.has(hole)) hasOverlap = true;
        allHoles.add(hole);
      }
    }
    expect(hasOverlap).toBe(false);
  });

  it('achieves partial success when one component fails placement', () => {
    // LED has valid pins → will succeed.
    // "mystery" passes validation (registry returns it) but has empty pins → placeComponent fails.
    mockMultipleComponents({
      led: LED_PINS,
      mystery: [], // empty pins array → "pinless component" error
    });

    const result = resolvePlacement(
      {
        action: 'place',
        components: [
          { type: 'led' },
          { type: 'mystery' },
        ],
        wires: 'none',
      },
      EMPTY_SNAPSHOT,
    );

    // Partial success: LED placed, mystery failed
    expect(result.success).toBe(true);
    expect(result.actions.length).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('mystery');
  });

  it('returns debug timing info', () => {
    mockComponent('led', LED_PINS);
    const result = resolvePlacement(
      { action: 'place', components: [{ type: 'led' }], wires: 'none' },
      EMPTY_SNAPSHOT,
    );

    expect(result.debug).toBeDefined();
    expect(result.debug.startTime).toBeDefined();
    expect(result.debug.totalTime).toBeGreaterThanOrEqual(0);
    expect(result.debug.steps.length).toBeGreaterThan(0);
  });

  it('generates unique pe_ IDs for each component', () => {
    mockComponent('led', LED_PINS);

    const result = resolvePlacement(
      {
        action: 'place',
        components: [
          { type: 'led' },
          { type: 'led' },
        ],
        wires: 'none',
      },
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    const ids = result.actions.map(a => a.componentId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length); // all unique
  });

  it('handles completely full breadboard gracefully', () => {
    mockComponent('led', LED_PINS);

    // Fill ALL top section holes
    const pins = {};
    for (const row of BB_TOP_ROWS) {
      for (let c = 1; c <= BB_COLS; c++) {
        pins[`x${row}${c}:p`] = `bb1:${row}${c}`;
      }
    }
    // Fill ALL bottom section holes
    for (const row of BB_BOT_ROWS) {
      for (let c = 1; c <= BB_COLS; c++) {
        pins[`y${row}${c}:p`] = `bb1:${row}${c}`;
      }
    }

    const snap = { ...EMPTY_SNAPSHOT, pinAssignments: pins };
    const result = resolvePlacement(
      { action: 'place', components: [{ type: 'led' }], wires: 'none' },
      snap,
    );

    // Should fail gracefully — no crash
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('No free');
  });

  it('returns failure for intent with no components', () => {
    const result = resolvePlacement(
      { action: 'place', components: [], wires: 'none' },
      EMPTY_SNAPSHOT,
    );

    // No components → no actions → success = false
    expect(result.success).toBe(false);
    expect(result.actions.length).toBe(0);
  });

  it('places LED near existing resistor to the right', () => {
    mockMultipleComponents({
      led: LED_PINS,
      resistor: RESISTOR_PINS,
    });

    const snap = snapshotWithResistor();
    const result = resolvePlacement(
      {
        action: 'place',
        components: [{ type: 'led', near: 'r1', relation: 'right' }],
        wires: 'none',
      },
      snap,
    );

    expect(result.success).toBe(true);
    expect(result.actions.length).toBe(1);

    // The LED should be to the right of col 9 (r1's max col in 1-based)
    const ledHoles = Object.values(result.actions[0].pinAssignments);
    const ledCols = ledHoles.map(h => parseInt(h.split(':')[1].slice(1), 10));
    expect(Math.min(...ledCols)).toBeGreaterThan(9);
  });

  it('falls back to default position when "near" ref not found', () => {
    mockComponent('led', LED_PINS);

    const result = resolvePlacement(
      {
        action: 'place',
        components: [{ type: 'led', near: 'ghost_component', relation: 'right' }],
        wires: 'none',
      },
      EMPTY_SNAPSHOT,
    );

    // Should still succeed — defaults to col 5
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
//  6. EDGE CASES & REGRESSION GUARDS
// ═══════════════════════════════════════════════════════════════

describe('edge cases', () => {
  beforeEach(() => vi.clearAllMocks());

  it('places known pinless components deterministically without mis-snapping', () => {
    mockComponent('battery9v', []);
    const occupancy = new OccupancyMap({});

    const first = placeComponent(
      { type: 'battery9v', section: 'top' },
      'bat_1',
      occupancy,
      EMPTY_SNAPSHOT,
    );
    const second = placeComponent(
      { type: 'battery9v', section: 'top' },
      'bat_1',
      new OccupancyMap({}),
      EMPTY_SNAPSHOT,
    );

    expect(first.success).toBe(true);
    expect(first.pinAssignments).toEqual({});
    expect(second).toMatchObject({
      success: true,
      x: first.x,
      y: first.y,
      pinAssignments: {},
    });
  });

  it('keeps the v1-cap6-esp1 resistor seven-column pin span stable', () => {
    mockComponent('resistor', [
      { id: 'pin1', x: -26.25, y: 0 },
      { id: 'pin2', x: 26.25, y: 0 },
    ]);

    const result = placeComponent(
      { type: 'resistor', section: 'top' },
      'r_1',
      new OccupancyMap({}),
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    expect(result.pinAssignments['r_1:pin1']).toBe('bb1:c6');
    expect(result.pinAssignments['r_1:pin2']).toBe('bb1:c13');
  });

  it('left relation at column 0 does not crash (clamps to 0)', () => {
    mockComponent('led', LED_PINS);
    const snap = {
      ...EMPTY_SNAPSHOT,
      pinAssignments: {
        'r1:pin1': 'bb1:c1',  // col 0 (0-based)
        'r1:pin2': 'bb1:c2',
      },
    };
    const occupancy = new OccupancyMap(snap.pinAssignments);

    const result = placeComponent(
      { type: 'led', near: 'r1', relation: 'left' },
      'led_1',
      occupancy,
      snap,
    );

    // Should succeed — scans rightward as fallback
    expect(result.success).toBe(true);
  });

  it('right relation at max column wraps within bounds', () => {
    mockComponent('led', LED_PINS);
    const snap = {
      ...EMPTY_SNAPSHOT,
      pinAssignments: {
        'r1:pin1': 'bb1:c29',  // col 28 (0-based), near max
        'r1:pin2': 'bb1:c30',  // col 29 (0-based), at max
      },
    };
    const occupancy = new OccupancyMap(snap.pinAssignments);

    const result = placeComponent(
      { type: 'led', near: 'r1', relation: 'right' },
      'led_1',
      occupancy,
      snap,
    );

    // Should still succeed by scanning leftward
    expect(result.success).toBe(true);
  });

  it('pinAssignments with non-string values are skipped', () => {
    // OccupancyMap constructor should not throw
    expect(() => new OccupancyMap({
      'r1:pin1': 42,
      'r1:pin2': true,
      'r1:pin3': { x: 1 },
    })).not.toThrow();
  });

  it('resolvePlacement with missing circuitSnapshot fields', () => {
    mockComponent('led', LED_PINS);
    // Minimal snapshot — no components, connections, layout, pinAssignments
    const result = resolvePlacement(
      { action: 'place', components: [{ type: 'led' }], wires: 'none' },
      {},
    );

    // Should not crash
    expect(result.success).toBe(true);
  });

  it('handles special characters in component type (stripped in ID)', () => {
    mockComponent('buzzer-piezo', [
      { id: 'positive', x: 0, y: 0 },
      { id: 'negative', x: 0, y: BB_PITCH },
    ]);

    const result = resolvePlacement(
      { action: 'place', components: [{ type: 'buzzer-piezo' }], wires: 'none' },
      EMPTY_SNAPSHOT,
    );

    expect(result.success).toBe(true);
    // componentId should have stripped the hyphen
    expect(result.actions[0].componentId).toMatch(/^pe_buzz_/);
  });
});
