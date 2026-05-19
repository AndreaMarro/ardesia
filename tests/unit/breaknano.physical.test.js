import { describe, it, expect } from 'vitest';

// Register all simulator components used by experiments.
import '../../src/components/simulator/components/NanoR4Board.jsx';
import '../../src/components/simulator/components/BreadboardHalf.jsx';
import '../../src/components/simulator/components/BreadboardFull.jsx';
import '../../src/components/simulator/components/Resistor.jsx';
import '../../src/components/simulator/components/Led.jsx';
import '../../src/components/simulator/components/Potentiometer.jsx';
import '../../src/components/simulator/components/PushButton.jsx';
import '../../src/components/simulator/components/Wire.jsx';
import '../../src/components/simulator/components/Diode.jsx';
import '../../src/components/simulator/components/BuzzerPiezo.jsx';
import '../../src/components/simulator/components/MotorDC.jsx';
import '../../src/components/simulator/components/PhotoResistor.jsx';
import '../../src/components/simulator/components/Phototransistor.jsx';
import '../../src/components/simulator/components/ReedSwitch.jsx';
import '../../src/components/simulator/components/Battery9V.jsx';
import '../../src/components/simulator/components/Capacitor.jsx';
import '../../src/components/simulator/components/RgbLed.jsx';
import '../../src/components/simulator/components/Servo.jsx';
import '../../src/components/simulator/components/LCD16x2.jsx';
import '../../src/components/simulator/components/Multimeter.jsx';
import '../../src/components/simulator/components/MosfetN.jsx';

import { ALL_EXPERIMENTS } from '../../src/data/experiments-index.js';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';
import {
  resolvePinPosition,
  computeRoutedWire,
  applyCollisionAvoidance,
  WireCollisionDetector,
} from '../../src/components/simulator/canvas/WireRenderer.jsx';

const BB_HOLE_PITCH = 7.5;
const BB_PAD_X = 14;
const BB_BUS_ROW_H = 7.5;
const BB_BUS_GAP = 5;
const BB_SECTION_H = 5 * BB_HOLE_PITCH;
const BB_GAP_H = 10;
const BB_PAD_Y = 10;

const BB_Y_SECTION_TOP = BB_PAD_Y + BB_BUS_ROW_H * 2 + BB_BUS_GAP;
const BB_Y_GAP = BB_Y_SECTION_TOP + BB_SECTION_H;
const BB_Y_SECTION_BOT = BB_Y_GAP + BB_GAP_H;

const ROW_Y = {
  a: BB_Y_SECTION_TOP + 0 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  b: BB_Y_SECTION_TOP + 1 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  c: BB_Y_SECTION_TOP + 2 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  d: BB_Y_SECTION_TOP + 3 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  e: BB_Y_SECTION_TOP + 4 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  f: BB_Y_SECTION_BOT + 0 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  g: BB_Y_SECTION_BOT + 1 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  h: BB_Y_SECTION_BOT + 2 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  i: BB_Y_SECTION_BOT + 3 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
  j: BB_Y_SECTION_BOT + 4 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
};

function approx(a, b, tol = 0.2) {
  return Math.abs(a - b) <= tol;
}

function isBusRef(ref) {
  const pin = String(ref).split(':')[1] || '';
  return pin.startsWith('bus-');
}

function getCompById(components) {
  const out = {};
  for (const c of components) out[c.id] = c;
  return out;
}

describe('Systematic experiment wiring checks', () => {
  it('all experiment connection endpoints resolve to concrete pin coordinates', () => {
    const failures = [];

    for (const exp of ALL_EXPERIMENTS) {
      const components = exp.components || [];
      const layout = exp.layout || {};
      const compById = getCompById(components);

      for (const c of components) {
        if (!layout[c.id]) {
          failures.push({ exp: exp.id, type: 'missing-layout', ref: c.id });
        }
      }

      for (const conn of exp.connections || []) {
        for (const endpoint of [conn.from, conn.to]) {
          const [cid] = String(endpoint).split(':');
          if (!compById[cid]) {
            failures.push({ exp: exp.id, type: 'missing-component', ref: endpoint });
            continue;
          }
          const pos = resolvePinPosition(endpoint, components, layout);
          if (!pos || Number.isNaN(pos.x) || Number.isNaN(pos.y)) {
            failures.push({ exp: exp.id, type: 'unresolved-pin', ref: endpoint });
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('volume 3 uses one consistent BreakNano standard', () => {
    const failures = [];

    // Standard nano1 position: {x:230, y:10}. The v3-extra-servo experiment
    // uses an older layout {x:130, y:20} because the servo component needs
    // more horizontal space — this is an accepted exception.
    const ALLOWED_NANO_POSITIONS = [
      { x: 230, y: 10 },
      { x: 130, y: 20 },
    ];

    // USB-only experiments (no breadboard, no components) are excluded from
    // the breadboard layout standard. Currently none in the Vol3 inventory.
    const USB_ONLY_EXPERIMENTS = new Set();

    for (const exp of EXPERIMENTS_VOL3.experiments || []) {
      // USB-only experiments are excluded from breadboard layout standard
      if (USB_ONLY_EXPERIMENTS.has(exp.id)) continue;

      const nano = exp.layout?.nano1;
      const bb = exp.layout?.bb1;

      const nanoOk = nano && ALLOWED_NANO_POSITIONS.some(
        (pos) => pos.x === nano.x && pos.y === nano.y
      );
      if (!nanoOk) {
        failures.push({ exp: exp.id, type: 'nano-layout', actual: nano || null });
      }
      if (!bb || bb.x !== 280 || bb.y !== 10) {
        failures.push({ exp: exp.id, type: 'bb-layout', actual: bb || null });
      }

      for (const conn of exp.connections || []) {
        const endpoints = [conn.from, conn.to];
        const hasBottomBus = endpoints.some((r) => r.includes('bb1:bus-bot-minus-'));
        if (!hasBottomBus) continue;

        const nanoEndpoint = endpoints.find((r) => r.startsWith('nano1:'));
        if (!nanoEndpoint) continue;

        const pin = nanoEndpoint.split(':')[1];
        if (pin !== 'GND_R') {
          failures.push({ exp: exp.id, type: 'ground-standard', ref: conn, got: pin, expected: 'GND_R' });
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('nano-to-bus wires route outside breadboard matrix and stay pad-anchored', () => {
    const failures = [];

    for (const exp of EXPERIMENTS_VOL3.experiments || []) {
      const components = exp.components || [];
      const layout = exp.layout || {};
      const bb = components.find((c) => c.type === 'breadboard-half' || c.type === 'breadboard-full');
      if (!bb || !layout[bb.id]) continue;

      const bbX = layout[bb.id].x;
      const bbY = layout[bb.id].y;
      const bbMatrixLeft = bbX + BB_PAD_X - 2;
      const bbMatrixRight = bbX + BB_PAD_X + 30 * BB_HOLE_PITCH + 2;
      const bbMatrixTop = bbY + ROW_Y.a;
      const bbMatrixBottom = bbY + ROW_Y.j;

      for (const conn of exp.connections || []) {
        const fromNano = conn.from.startsWith('nano1:');
        const toNano = conn.to.startsWith('nano1:');
        const fromBus = isBusRef(conn.from);
        const toBus = isBusRef(conn.to);

        if (!((fromNano && toBus) || (toNano && fromBus))) continue;

        const fromPos = resolvePinPosition(conn.from, components, layout);
        const toPos = resolvePinPosition(conn.to, components, layout);
        if (!fromPos || !toPos) {
          failures.push({ exp: exp.id, type: 'unresolved', conn });
          continue;
        }

        const route = computeRoutedWire(fromPos, toPos, components, layout);
        if (!route || route.length < 2) {
          failures.push({ exp: exp.id, type: 'no-route', conn });
          continue;
        }

        const start = route[0];
        const end = route[route.length - 1];
        if (!approx(start.x, fromPos.x) || !approx(start.y, fromPos.y)) {
          failures.push({ exp: exp.id, type: 'start-not-anchored', conn, start, expected: fromPos });
        }
        if (!approx(end.x, toPos.x) || !approx(end.y, toPos.y)) {
          failures.push({ exp: exp.id, type: 'end-not-anchored', conn, end, expected: toPos });
        }

        const internal = route.slice(1, -1).filter((p) => (
          p.x >= bbMatrixLeft && p.x <= bbMatrixRight && p.y >= bbMatrixTop && p.y <= bbMatrixBottom
        ));

        if (internal.length > 0) {
          failures.push({ exp: exp.id, type: 'non-physical-matrix-crossing', conn, internal });
        }
      }
    }

    expect(failures).toEqual([]);
  });

  it('collision avoidance never moves wire endpoints off real pins', () => {
    const detector = new WireCollisionDetector();
    detector.addSegment(0, 10, 100, 10, 0);

    const original = [
      { x: 0, y: 10 },
      { x: 50, y: 10 },
      { x: 100, y: 10 },
    ];

    const adjusted = applyCollisionAvoidance(original, 1, detector);

    expect(adjusted[0]).toEqual(original[0]);
    expect(adjusted[adjusted.length - 1]).toEqual(original[original.length - 1]);
  });
});
