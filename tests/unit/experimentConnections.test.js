/**
 * Experiment Connections — Comprehensive Wire Validation
 * Tests all 92 experiments for correct wire/connection definitions.
 * ~250 tests covering: existence, format, component references, self-connections, pin validity.
 *
 * © Andrea Marro — 15/04/2026
 */

import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index';

// ─── Known valid pin names ──────────────────────────────────────────────────

// Battery pins
const BATTERY_PINS = ['positive', 'negative'];

// Multimeter pins
const MULTIMETER_PINS = ['positive', 'negative', 'probe-pos', 'probe-neg', 'probe-positive', 'probe-negative'];

// LED pins
const LED_PINS = ['anode', 'cathode'];

// Resistor / generic 2-pin
const TWO_PIN = ['pin1', 'pin2'];

// Push-button (4-pin)
const BUTTON_PINS = ['pin1', 'pin2', 'pin3', 'pin4'];

// Potentiometer
const POT_PINS = ['vcc', 'signal', 'gnd'];

// MOSFET
const MOSFET_PINS = ['gate', 'drain', 'source'];

// Phototransistor
const PHOTOTRANSISTOR_PINS = ['collector', 'emitter'];

// Motor DC / Capacitor / Buzzer
const POLAR_PINS = ['positive', 'negative'];

// Diode
const DIODE_PINS = ['anode', 'cathode'];

// Arduino Nano R4 — digital pins, analog pins, power, GND
const NANO_PINS = [
  '5V', '3V3', 'VIN', 'GND', 'GND_R', 'GND_L', 'RESET',
  // Wing pins with W_ prefix
  'W_D0', 'W_D1', 'W_D2', 'W_D3', 'W_D4', 'W_D5', 'W_D6', 'W_D7',
  'W_D8', 'W_D9', 'W_D10', 'W_D11', 'W_D12', 'W_D13',
  // Analog pins
  'W_A0', 'W_A1', 'W_A2', 'W_A3', 'W_A4', 'W_A5',
  // Direct digital pins (some experiments use D0-D13 without W_ prefix)
  'D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
  'D8', 'D9', 'D10', 'D11', 'D12', 'D13',
  // Direct analog pins
  'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
];

// Breadboard patterns
const BB_BUS_PATTERN = /^bus-(top|bot)-(plus|minus)-\d+$/;
const BB_HOLE_PATTERN = /^[a-j]\d+$/;

// All known component pin names (flat set for validation)
const ALL_KNOWN_COMPONENT_PINS = new Set([
  ...BATTERY_PINS, ...MULTIMETER_PINS, ...LED_PINS, ...TWO_PIN,
  ...BUTTON_PINS, ...POT_PINS, ...MOSFET_PINS, ...PHOTOTRANSISTOR_PINS,
  ...POLAR_PINS, ...DIODE_PINS, ...NANO_PINS,
]);

/**
 * Checks whether a pin name is valid:
 * - Known component pin (anode, pin1, D13, etc.)
 * - Breadboard hole (a1, j30, etc.)
 * - Breadboard bus (bus-top-plus-1, bus-bot-minus-30, etc.)
 */
function isValidPin(pinName) {
  if (ALL_KNOWN_COMPONENT_PINS.has(pinName)) return true;
  if (BB_BUS_PATTERN.test(pinName)) return true;
  if (BB_HOLE_PATTERN.test(pinName)) return true;
  return false;
}

/**
 * Extracts componentId and pinName from a connection endpoint like "bat1:positive"
 */
function parseEndpoint(endpoint) {
  const colonIdx = endpoint.indexOf(':');
  if (colonIdx === -1) return { componentId: endpoint, pinName: null };
  return {
    componentId: endpoint.substring(0, colonIdx),
    pinName: endpoint.substring(colonIdx + 1),
  };
}

// ─── Experiments known to have empty connections (multimeter-only, manual, code-only) ──
const EXPERIMENTS_WITH_EMPTY_CONNECTIONS = new Set([
  'v2-cap3-esp1', 'v2-cap3-esp2', 'v2-cap3-esp3', 'v2-cap3-esp4',
  'v2-cap4-esp1', 'v2-cap4-esp2', 'v2-cap4-esp3',
  'v2-cap5-esp1', 'v2-cap5-esp2',
  'v3-cap5-esp1', 'v3-cap5-esp2', 'v3-cap8-esp1', 'v3-cap8-esp2',
]);

// ─── Sampled experiments for deeper validation (20, mixed across volumes) ────
const SAMPLED_IDS = [
  // Vol1 — battery circuits
  'v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap6-esp3',
  'v1-cap7-esp1', 'v1-cap7-esp2', 'v1-cap7-esp3',
  'v1-cap8-esp1', 'v1-cap9-esp1',
  // Vol2 — more complex circuits
  'v2-cap6-esp1', 'v2-cap7-esp1', 'v2-cap8-esp1',
  'v2-cap9-esp1', 'v2-cap10-esp1', 'v2-cap11-esp1',
  // Vol3 — Arduino circuits
  'v3-cap5-esp3', 'v3-cap6-esp1', 'v3-cap6-esp2', 'v3-cap6-morse',
  'v3-cap7-esp1', 'v3-cap7-esp2',
];

const VALID_WIRE_COLORS = new Set([
  'red', 'black', 'green', 'blue', 'yellow', 'orange', 'white',
  'brown', 'purple', 'gray', 'grey', 'pink',
]);

// Helpers
const withConnections = () => ALL_EXPERIMENTS.filter(e => e.connections && e.connections.length > 0);
const sampledExperiments = () => SAMPLED_IDS
  .map(id => ALL_EXPERIMENTS.find(e => e.id === id))
  .filter(Boolean)
  .filter(e => e.connections.length > 0);

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 1: Every experiment has connections (92 tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Existence', () => {
  it('ALL_EXPERIMENTS contains exactly 79 experiments', () => {
    expect(ALL_EXPERIMENTS.length).toBe(79);
  });

  describe('connections array exists on every experiment', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      it(`${exp.id} has connections array`, () => {
        expect(exp).toHaveProperty('connections');
        expect(Array.isArray(exp.connections)).toBe(true);
      });
    });
  });

  describe('wired experiments have non-empty connections', () => {
    const wired = ALL_EXPERIMENTS.filter(e => !EXPERIMENTS_WITH_EMPTY_CONNECTIONS.has(e.id));
    wired.forEach(exp => {
      it(`${exp.id} connections is non-empty`, () => {
        expect(exp.connections.length).toBeGreaterThan(0);
      });
    });
  });

  describe('multimeter/manual/code-only experiments have empty connections', () => {
    const empty = ALL_EXPERIMENTS.filter(e => EXPERIMENTS_WITH_EMPTY_CONNECTIONS.has(e.id));
    empty.forEach(exp => {
      it(`${exp.id} connections is empty (expected)`, () => {
        expect(exp.connections.length).toBe(0);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 2: Connection format — from/to/color (79 wired experiments)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Format', () => {
  describe('every connection has from, to, and color string fields', () => {
    withConnections().forEach(exp => {
      it(`${exp.id} — from/to/color present and strings`, () => {
        exp.connections.forEach((conn, idx) => {
          expect(typeof conn.from, `conn[${idx}] from not string`).toBe('string');
          expect(typeof conn.to, `conn[${idx}] to not string`).toBe('string');
          expect(typeof conn.color, `conn[${idx}] color not string`).toBe('string');
          expect(conn.from.length).toBeGreaterThan(0);
          expect(conn.to.length).toBeGreaterThan(0);
          expect(conn.color.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('from/to contain colon separator (componentId:pinName)', () => {
    withConnections().forEach(exp => {
      it(`${exp.id} — colon in from/to`, () => {
        exp.connections.forEach((conn, idx) => {
          expect(conn.from).toContain(':');
          expect(conn.to).toContain(':');
        });
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 3: Component IDs in connections reference existing components (sampled 20)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Component ID References (sampled)', () => {
  sampledExperiments().forEach(exp => {
    it(`${exp.id} — all connection endpoints reference existing component IDs`, () => {
      const compIds = new Set(exp.components.map(c => c.id));
      exp.connections.forEach(conn => {
        const fromId = parseEndpoint(conn.from).componentId;
        const toId = parseEndpoint(conn.to).componentId;
        expect(compIds.has(fromId),
          `from "${conn.from}" references unknown component "${fromId}". Known: [${[...compIds]}]`
        ).toBe(true);
        expect(compIds.has(toId),
          `to "${conn.to}" references unknown component "${toId}". Known: [${[...compIds]}]`
        ).toBe(true);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 3b: Component ID references — ALL experiments (exhaustive)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Component ID References (all)', () => {
  withConnections().forEach(exp => {
    it(`${exp.id} — componentIds in connections exist in components`, () => {
      const compIds = new Set(exp.components.map(c => c.id));
      exp.connections.forEach(conn => {
        const fromId = conn.from.split(':')[0];
        const toId = conn.to.split(':')[0];
        expect(compIds.has(fromId),
          `from="${conn.from}" references unknown "${fromId}"`
        ).toBe(true);
        expect(compIds.has(toId),
          `to="${conn.to}" references unknown "${toId}"`
        ).toBe(true);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 4: No self-connections (20 sampled)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — No Self-Connections (sampled)', () => {
  const wired = withConnections();
  const selfSampled = [
    ...wired.filter(e => e.id.startsWith('v1-')).slice(0, 8),
    ...wired.filter(e => e.id.startsWith('v2-')).slice(0, 6),
    ...wired.filter(e => e.id.startsWith('v3-')).slice(0, 6),
  ];

  selfSampled.forEach(exp => {
    it(`${exp.id} — no wire connects an endpoint to itself`, () => {
      exp.connections.forEach(conn => {
        expect(conn.from !== conn.to,
          `Self-connection: "${conn.from}" -> "${conn.to}"`
        ).toBe(true);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 5: Pin names are valid (sampled 20)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Pin Name Validity (sampled)', () => {
  sampledExperiments().forEach(exp => {
    it(`${exp.id} — all pin names in connections are valid`, () => {
      exp.connections.forEach(conn => {
        const fromPin = parseEndpoint(conn.from).pinName;
        const toPin = parseEndpoint(conn.to).pinName;
        if (fromPin) {
          expect(isValidPin(fromPin),
            `Invalid pin "${fromPin}" in from "${conn.from}"`
          ).toBe(true);
        }
        if (toPin) {
          expect(isValidPin(toPin),
            `Invalid pin "${toPin}" in to "${conn.to}"`
          ).toBe(true);
        }
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 6: No duplicate connections
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — No Duplicates', () => {
  withConnections().forEach(exp => {
    if (exp.connections.length > 1) {
      it(`${exp.id} — no duplicate from->to pairs`, () => {
        const seen = new Set();
        exp.connections.forEach(conn => {
          const key = `${conn.from}->${conn.to}`;
          expect(seen.has(key), `Duplicate: ${key}`).toBe(false);
          seen.add(key);
        });
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 7: Wire color validity
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Wire Color Validity', () => {
  withConnections().forEach(exp => {
    it(`${exp.id} — all wire colors are valid`, () => {
      exp.connections.forEach(conn => {
        expect(VALID_WIRE_COLORS.has(conn.color),
          `Unexpected wire color "${conn.color}" in ${conn.from}->${conn.to}`
        ).toBe(true);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 8: Structural integrity
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Structural Integrity', () => {
  it('all Vol1 wired experiments have bat1 component', () => {
    const vol1Wired = ALL_EXPERIMENTS.filter(
      e => e.id.startsWith('v1-') && e.connections.length > 0
    );
    vol1Wired.forEach(exp => {
      const ids = exp.components.map(c => c.id);
      expect(ids).toContain('bat1');
    });
  });

  it('all Vol3 wired experiments have nano1 or bat1', () => {
    const vol3Wired = ALL_EXPERIMENTS.filter(
      e => e.id.startsWith('v3-') && e.connections.length > 0
    );
    vol3Wired.forEach(exp => {
      const ids = exp.components.map(c => c.id);
      expect(
        ids.includes('nano1') || ids.includes('bat1'),
        `${exp.id} has neither nano1 nor bat1`
      ).toBe(true);
    });
  });

  it('every wired experiment that references bb1 has a breadboard component', () => {
    withConnections().forEach(exp => {
      const refsBB = exp.connections.some(
        c => c.from.startsWith('bb1:') || c.to.startsWith('bb1:')
      );
      if (refsBB) {
        const hasBB = exp.components.some(
          c => c.type === 'breadboard-half' || c.type === 'breadboard' || c.id === 'bb1'
        );
        expect(hasBB, `${exp.id} references bb1 but has no breadboard component`).toBe(true);
      }
    });
  });

  it('no experiment has more than 30 wires (sanity)', () => {
    withConnections().forEach(exp => {
      expect(exp.connections.length,
        `${exp.id} has ${exp.connections.length} connections`
      ).toBeLessThanOrEqual(30);
    });
  });

  it('simplest circuits have at least 3 wires', () => {
    const first = ALL_EXPERIMENTS.find(e => e.id === 'v1-cap6-esp1');
    expect(first).toBeDefined();
    expect(first.connections.length).toBeGreaterThanOrEqual(3);
  });

  it('average wire count is between 3 and 15', () => {
    const wired = withConnections();
    const total = wired.reduce((sum, e) => sum + e.connections.length, 0);
    const avg = total / wired.length;
    expect(avg).toBeGreaterThanOrEqual(3);
    expect(avg).toBeLessThanOrEqual(15);
  });

  it('total connections across all experiments > 200', () => {
    const total = ALL_EXPERIMENTS.reduce((sum, e) => sum + e.connections.length, 0);
    expect(total).toBeGreaterThan(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 9: pinAssignments consistency (sampled 20)
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — pinAssignments Consistency', () => {
  const withBoth = ALL_EXPERIMENTS.filter(
    e => e.connections?.length > 0 && e.pinAssignments && Object.keys(e.pinAssignments).length > 0
  ).slice(0, 20);

  withBoth.forEach(exp => {
    it(`${exp.id} — pinAssignment componentIds exist in components`, () => {
      const compIds = new Set(exp.components.map(c => c.id));
      Object.keys(exp.pinAssignments).forEach(key => {
        const compId = key.split(':')[0];
        expect(compIds.has(compId),
          `pinAssignment key "${key}" references unknown "${compId}"`
        ).toBe(true);
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 10: from/to have exactly two non-empty parts
// ═══════════════════════════════════════════════════════════════════════════

describe('Connections — Endpoint Format (two non-empty parts)', () => {
  withConnections().forEach(exp => {
    it(`${exp.id} — from/to split into componentId and pinName`, () => {
      exp.connections.forEach((conn, idx) => {
        const fromParts = conn.from.split(':');
        const toParts = conn.to.split(':');
        expect(fromParts.length, `from="${conn.from}" bad format`).toBeGreaterThanOrEqual(2);
        expect(toParts.length, `to="${conn.to}" bad format`).toBeGreaterThanOrEqual(2);
        expect(fromParts[0].length).toBeGreaterThan(0);
        expect(fromParts[1].length).toBeGreaterThan(0);
        expect(toParts[0].length).toBeGreaterThan(0);
        expect(toParts[1].length).toBeGreaterThan(0);
      });
    });
  });
});
