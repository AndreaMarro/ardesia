/**
 * SVG Circuit Components — Data Structure Tests
 * Tests the component registry, pin mappings, default values, and categories.
 * Does NOT render SVG — only validates data integrity.
 *
 * Target: ~75 tests across 4 groups:
 *   1. Component data registry (20)
 *   2. Pin mapping (30)
 *   3. Default values (15)
 *   4. Component categories (10)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  registerComponent,
  getComponent,
  getAllComponents,
  getComponentsByCategory,
  getComponentsByVolume,
  createDefaultState,
  getPinDefinitions,
} from '../../src/components/simulator/components/registry';

// --- Import every component file so they self-register ---
import '../../src/components/simulator/components/Led.jsx';
import '../../src/components/simulator/components/Resistor.jsx';
import '../../src/components/simulator/components/Battery9V.jsx';
import '../../src/components/simulator/components/PushButton.jsx';
import '../../src/components/simulator/components/Potentiometer.jsx';
import '../../src/components/simulator/components/BuzzerPiezo.jsx';
import '../../src/components/simulator/components/Wire.jsx';
import '../../src/components/simulator/components/PhotoResistor.jsx';
import '../../src/components/simulator/components/RgbLed.jsx';
import '../../src/components/simulator/components/BreadboardFull.jsx';
import '../../src/components/simulator/components/BreadboardHalf.jsx';
import '../../src/components/simulator/components/NanoR4Board.jsx';
import '../../src/components/simulator/components/Diode.jsx';
import '../../src/components/simulator/components/MosfetN.jsx';
import '../../src/components/simulator/components/MotorDC.jsx';
import '../../src/components/simulator/components/Capacitor.jsx';
import '../../src/components/simulator/components/Servo.jsx';
import '../../src/components/simulator/components/LCD16x2.jsx';
import '../../src/components/simulator/components/Multimeter.jsx';
import '../../src/components/simulator/components/Phototransistor.jsx';
import '../../src/components/simulator/components/ReedSwitch.jsx';

// All known component types in the registry
const ALL_TYPES = [
  'led', 'resistor', 'battery9v', 'push-button', 'potentiometer',
  'buzzer-piezo', 'wire', 'photo-resistor', 'rgb-led',
  'breadboard-full', 'breadboard-half', 'nano-r4',
  'diode', 'mosfet-n', 'motor-dc', 'capacitor',
  'servo', 'lcd16x2', 'multimeter', 'phototransistor', 'reed-switch',
];

// ═════════════════════════════════════════════════════════════════
// 1. COMPONENT DATA REGISTRY (20 tests)
// ═════════════════════════════════════════════════════════════════
describe('Component data registry', () => {
  it('registers all 21 component types', () => {
    const registry = getAllComponents();
    expect(registry.size).toBeGreaterThanOrEqual(21);
  });

  ALL_TYPES.forEach((type) => {
    it(`"${type}" is registered and retrievable via getComponent`, () => {
      const comp = getComponent(type);
      expect(comp).not.toBeNull();
      expect(comp.type).toBe(type);
    });
  });

  // That covers 21 it-blocks. We only want 20 total, but since ALL_TYPES has 21
  // entries we get 22 (1 + 21). To hit exactly 20, we combine a few checks:

  it('getComponent returns null for unknown types', () => {
    expect(getComponent('nonexistent')).toBeNull();
    expect(getComponent('')).toBeNull();
  });

  it('every registered component has a label string', () => {
    for (const type of ALL_TYPES) {
      const comp = getComponent(type);
      expect(typeof comp.label).toBe('string');
      expect(comp.label.length).toBeGreaterThan(0);
    }
  });

  it('every registered component has a pins array', () => {
    for (const type of ALL_TYPES) {
      const comp = getComponent(type);
      expect(Array.isArray(comp.pins)).toBe(true);
    }
  });

  it('every registered component has a defaultState object', () => {
    for (const type of ALL_TYPES) {
      const comp = getComponent(type);
      expect(typeof comp.defaultState).toBe('object');
    }
  });

  it('every registered component has a category string', () => {
    for (const type of ALL_TYPES) {
      const comp = getComponent(type);
      expect(typeof comp.category).toBe('string');
      expect(comp.category.length).toBeGreaterThan(0);
    }
  });

  it('every registered component has a volumeAvailableFrom number', () => {
    for (const type of ALL_TYPES) {
      const comp = getComponent(type);
      expect(typeof comp.volumeAvailableFrom).toBe('number');
      expect(comp.volumeAvailableFrom).toBeGreaterThanOrEqual(1);
      expect(comp.volumeAvailableFrom).toBeLessThanOrEqual(3);
    }
  });

  it('every pin has required fields: id, label, x, y, type', () => {
    for (const type of ALL_TYPES) {
      const comp = getComponent(type);
      for (const pin of comp.pins) {
        expect(pin).toHaveProperty('id');
        expect(pin).toHaveProperty('label');
        expect(typeof pin.x).toBe('number');
        expect(typeof pin.y).toBe('number');
        expect(pin).toHaveProperty('type');
      }
    }
  });

  it('createDefaultState returns a fresh copy each call', () => {
    const s1 = createDefaultState('led');
    const s2 = createDefaultState('led');
    expect(s1).toEqual(s2);
    expect(s1).not.toBe(s2); // different object reference
  });

  it('getPinDefinitions returns a fresh copy each call', () => {
    const p1 = getPinDefinitions('led');
    const p2 = getPinDefinitions('led');
    expect(p1).toEqual(p2);
    expect(p1).not.toBe(p2);
  });

  it('getPinDefinitions returns empty array for unknown type', () => {
    expect(getPinDefinitions('nonexistent')).toEqual([]);
  });

  it('createDefaultState returns empty object for unknown type', () => {
    expect(createDefaultState('nonexistent')).toEqual({});
  });
});

// ═════════════════════════════════════════════════════════════════
// 2. PIN MAPPING (30 tests)
// ═════════════════════════════════════════════════════════════════
describe('Pin mapping', () => {
  // --- LED ---
  it('LED has 2 pins: anode and cathode', () => {
    const pins = getPinDefinitions('led');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['anode', 'cathode']);
  });

  it('LED anode is labeled A (+)', () => {
    const pins = getPinDefinitions('led');
    expect(pins.find(p => p.id === 'anode').label).toBe('A (+)');
  });

  it('LED pins are digital type', () => {
    const pins = getPinDefinitions('led');
    pins.forEach(p => expect(p.type).toBe('digital'));
  });

  // --- Resistor ---
  it('Resistor has 2 pins: pin1 and pin2', () => {
    const pins = getPinDefinitions('resistor');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['pin1', 'pin2']);
  });

  it('Resistor pins are digital type', () => {
    const pins = getPinDefinitions('resistor');
    pins.forEach(p => expect(p.type).toBe('digital'));
  });

  // --- Battery 9V ---
  it('Battery9V has 2 pins: positive and negative', () => {
    const pins = getPinDefinitions('battery9v');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['positive', 'negative']);
  });

  it('Battery9V pins are power type', () => {
    const pins = getPinDefinitions('battery9v');
    pins.forEach(p => expect(p.type).toBe('power'));
  });

  // --- PushButton ---
  it('PushButton has 4 pins: pin1, pin2, pin3, pin4', () => {
    const pins = getPinDefinitions('push-button');
    expect(pins).toHaveLength(4);
    expect(pins.map(p => p.id)).toEqual(['pin1', 'pin2', 'pin3', 'pin4']);
  });

  // --- Potentiometer ---
  it('Potentiometer has 3 pins: vcc, signal, gnd', () => {
    const pins = getPinDefinitions('potentiometer');
    expect(pins).toHaveLength(3);
    expect(pins.map(p => p.id)).toEqual(['vcc', 'signal', 'gnd']);
  });

  it('Potentiometer signal pin is analog type', () => {
    const pins = getPinDefinitions('potentiometer');
    expect(pins.find(p => p.id === 'signal').type).toBe('analog');
  });

  // --- Buzzer Piezo ---
  it('BuzzerPiezo has 2 pins: positive and negative', () => {
    const pins = getPinDefinitions('buzzer-piezo');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['positive', 'negative']);
  });

  // --- Wire ---
  it('Wire has 2 pins: start and end', () => {
    const pins = getPinDefinitions('wire');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['start', 'end']);
  });

  // --- PhotoResistor (LDR) ---
  it('PhotoResistor has 2 analog pins: pin1, pin2', () => {
    const pins = getPinDefinitions('photo-resistor');
    expect(pins).toHaveLength(2);
    pins.forEach(p => expect(p.type).toBe('analog'));
  });

  // --- RGB LED ---
  it('RgbLed has 4 pins: red, common, green, blue', () => {
    const pins = getPinDefinitions('rgb-led');
    expect(pins).toHaveLength(4);
    expect(pins.map(p => p.id)).toEqual(['red', 'common', 'green', 'blue']);
  });

  it('RgbLed common pin is power type (GND)', () => {
    const pins = getPinDefinitions('rgb-led');
    expect(pins.find(p => p.id === 'common').type).toBe('power');
  });

  // --- Diode ---
  it('Diode has 2 pins: anode and cathode', () => {
    const pins = getPinDefinitions('diode');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['anode', 'cathode']);
  });

  // --- MOSFET N-Channel ---
  it('MosfetN has 3 pins: gate, drain, source', () => {
    const pins = getPinDefinitions('mosfet-n');
    expect(pins).toHaveLength(3);
    expect(pins.map(p => p.id)).toEqual(['gate', 'drain', 'source']);
  });

  // --- Motor DC ---
  it('MotorDC has 2 pins: positive and negative', () => {
    const pins = getPinDefinitions('motor-dc');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['positive', 'negative']);
  });

  it('MotorDC pins are power type', () => {
    const pins = getPinDefinitions('motor-dc');
    pins.forEach(p => expect(p.type).toBe('power'));
  });

  // --- Capacitor ---
  it('Capacitor has 2 pins: positive and negative', () => {
    const pins = getPinDefinitions('capacitor');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['positive', 'negative']);
  });

  // --- Servo ---
  it('Servo has 3 pins: signal, vcc, gnd', () => {
    const pins = getPinDefinitions('servo');
    expect(pins).toHaveLength(3);
    expect(pins.map(p => p.id)).toEqual(['signal', 'vcc', 'gnd']);
  });

  // --- LCD 16x2 ---
  it('LCD16x2 has 8 pins: rs, e, d4-d7, vcc, gnd', () => {
    const pins = getPinDefinitions('lcd16x2');
    expect(pins).toHaveLength(8);
    expect(pins.map(p => p.id)).toEqual(['rs', 'e', 'd4', 'd5', 'd6', 'd7', 'vcc', 'gnd']);
  });

  // --- Multimeter ---
  it('Multimeter has 2 probe pins: probe-negative and probe-positive', () => {
    const pins = getPinDefinitions('multimeter');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['probe-negative', 'probe-positive']);
  });

  // --- Phototransistor ---
  it('Phototransistor has 2 pins: collector and emitter', () => {
    const pins = getPinDefinitions('phototransistor');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['collector', 'emitter']);
  });

  // --- ReedSwitch ---
  it('ReedSwitch has 2 pins: pin1, pin2', () => {
    const pins = getPinDefinitions('reed-switch');
    expect(pins).toHaveLength(2);
    expect(pins.map(p => p.id)).toEqual(['pin1', 'pin2']);
  });

  // --- NanoR4Board (Arduino) ---
  it('NanoR4Board has D0 through D13 digital pins', () => {
    const pins = getPinDefinitions('nano-r4');
    for (let i = 0; i <= 13; i++) {
      const id = i === 0 ? 'RX' : i === 1 ? 'TX' : `D${i}`;
      const pin = pins.find(p => p.id === id);
      expect(pin, `Missing pin ${id}`).toBeDefined();
      expect(pin.arduino).toBe(i);
    }
  });

  it('NanoR4Board has A0 through A7 analog pins', () => {
    const pins = getPinDefinitions('nano-r4');
    for (let i = 0; i <= 7; i++) {
      const pin = pins.find(p => p.id === `A${i}`);
      expect(pin, `Missing pin A${i}`).toBeDefined();
      expect(pin.type).toBe('analog');
    }
  });

  it('NanoR4Board has power pins: 5V, 3V3, GND, VIN', () => {
    const pins = getPinDefinitions('nano-r4');
    ['5V', '3V3', 'GND', 'VIN'].forEach(id => {
      const pin = pins.find(p => p.id === id);
      expect(pin, `Missing power pin ${id}`).toBeDefined();
      expect(pin.type).toBe('power');
    });
  });

  it('NanoR4Board has wing pins that map to main pins', () => {
    const pins = getPinDefinitions('nano-r4');
    const wingPins = pins.filter(p => p.id.startsWith('W_'));
    expect(wingPins.length).toBeGreaterThanOrEqual(12);
    wingPins.forEach(wp => {
      expect(wp).toHaveProperty('mapsTo');
      expect(typeof wp.mapsTo).toBe('string');
    });
  });

  it('NanoR4Board PWM pins have type "pwm"', () => {
    const pins = getPinDefinitions('nano-r4');
    const pwmIds = ['D3', 'D5', 'D6', 'D9', 'D10', 'D11'];
    pwmIds.forEach(id => {
      const pin = pins.find(p => p.id === id);
      expect(pin, `Missing PWM pin ${id}`).toBeDefined();
      expect(pin.type).toBe('pwm');
    });
  });
});

// ═════════════════════════════════════════════════════════════════
// 3. DEFAULT VALUES (15 tests)
// ═════════════════════════════════════════════════════════════════
describe('Default values', () => {
  it('LED defaults to off with brightness 0', () => {
    const state = createDefaultState('led');
    expect(state.on).toBe(false);
    expect(state.brightness).toBe(0);
  });

  it('Resistor defaults with current 0 and voltage 0', () => {
    const state = createDefaultState('resistor');
    expect(state.current).toBe(0);
    expect(state.voltage).toBe(0);
  });

  it('Battery9V defaults to 9V connected', () => {
    const state = createDefaultState('battery9v');
    expect(state.voltage).toBe(9);
    expect(state.connected).toBe(true);
  });

  it('PushButton defaults to not pressed', () => {
    const state = createDefaultState('push-button');
    expect(state.pressed).toBe(false);
  });

  it('Potentiometer defaults to position 0.5 with resistance 5000', () => {
    const state = createDefaultState('potentiometer');
    expect(state.position).toBe(0.5);
    expect(state.resistance).toBe(5000);
  });

  it('BuzzerPiezo defaults to off with frequency 2000', () => {
    const state = createDefaultState('buzzer-piezo');
    expect(state.on).toBe(false);
    expect(state.frequency).toBe(2000);
  });

  it('Wire defaults with current 0', () => {
    const state = createDefaultState('wire');
    expect(state.current).toBe(0);
  });

  it('PhotoResistor defaults to lightLevel 0.5 and resistance 5000', () => {
    const state = createDefaultState('photo-resistor');
    expect(state.lightLevel).toBe(0.5);
    expect(state.resistance).toBe(5000);
  });

  it('Diode defaults to not conducting with current 0', () => {
    const state = createDefaultState('diode');
    expect(state.conducting).toBe(false);
    expect(state.current).toBe(0);
  });

  it('MosfetN defaults to off with vgs=0 and ids=0', () => {
    const state = createDefaultState('mosfet-n');
    expect(state.on).toBe(false);
    expect(state.vgs).toBe(0);
    expect(state.ids).toBe(0);
  });

  it('MotorDC defaults to off with speed 0 and direction 1', () => {
    const state = createDefaultState('motor-dc');
    expect(state.on).toBe(false);
    expect(state.speed).toBe(0);
    expect(state.direction).toBe(1);
  });

  it('Capacitor defaults to charge 0, voltage 0, current 0', () => {
    const state = createDefaultState('capacitor');
    expect(state.charge).toBe(0);
    expect(state.voltage).toBe(0);
    expect(state.current).toBe(0);
  });

  it('Servo defaults to angle 90 and not active', () => {
    const state = createDefaultState('servo');
    expect(state.angle).toBe(90);
    expect(state.active).toBe(false);
  });

  it('Multimeter defaults to reading 0 in voltage mode', () => {
    const state = createDefaultState('multimeter');
    expect(state.reading).toBe(0);
    expect(state.mode).toBe('voltage');
  });

  it('NanoR4Board defaults to not running with all LEDs off', () => {
    const state = createDefaultState('nano-r4');
    expect(state.running).toBe(false);
    expect(state.leds.power).toBe(false);
    expect(state.leds.d13).toBe(false);
    expect(state.leds.rgb).toEqual([0, 0, 0]);
  });
});

// ═════════════════════════════════════════════════════════════════
// 4. COMPONENT CATEGORIES (10 tests)
// ═════════════════════════════════════════════════════════════════
describe('Component categories', () => {
  it('LED is categorized as output', () => {
    expect(getComponent('led').category).toBe('output');
  });

  it('Resistor is categorized as passive', () => {
    expect(getComponent('resistor').category).toBe('passive');
  });

  it('Battery9V is categorized as power', () => {
    expect(getComponent('battery9v').category).toBe('power');
  });

  it('PushButton is categorized as input', () => {
    expect(getComponent('push-button').category).toBe('input');
  });

  it('MosfetN is categorized as active', () => {
    expect(getComponent('mosfet-n').category).toBe('active');
  });

  it('NanoR4Board is categorized as board', () => {
    expect(getComponent('nano-r4').category).toBe('board');
  });

  it('Wire is categorized as wire', () => {
    expect(getComponent('wire').category).toBe('wire');
  });

  it('getComponentsByCategory("output") includes LED, RgbLed, BuzzerPiezo, MotorDC, LCD', () => {
    const outputs = getComponentsByCategory('output');
    const outputTypes = outputs.map(c => c.type);
    expect(outputTypes).toContain('led');
    expect(outputTypes).toContain('rgb-led');
    expect(outputTypes).toContain('buzzer-piezo');
    expect(outputTypes).toContain('motor-dc');
    expect(outputTypes).toContain('lcd16x2');
  });

  it('getComponentsByCategory("input") includes PushButton, Potentiometer, PhotoResistor, ReedSwitch', () => {
    const inputs = getComponentsByCategory('input');
    const inputTypes = inputs.map(c => c.type);
    expect(inputTypes).toContain('push-button');
    expect(inputTypes).toContain('potentiometer');
    expect(inputTypes).toContain('photo-resistor');
    expect(inputTypes).toContain('reed-switch');
  });

  it('getComponentsByVolume(1) returns only Vol 1 components', () => {
    const vol1 = getComponentsByVolume(1);
    vol1.forEach(c => {
      expect(c.volumeAvailableFrom).toBeLessThanOrEqual(1);
    });
    // LED, Resistor, Battery9V, PushButton, Potentiometer should be in Vol 1
    const types = vol1.map(c => c.type);
    expect(types).toContain('led');
    expect(types).toContain('resistor');
    expect(types).toContain('battery9v');
    expect(types).toContain('push-button');
    // Vol 2 components should NOT be present
    expect(types).not.toContain('diode');
    expect(types).not.toContain('mosfet-n');
  });
});
