import { describe, it, expect } from 'vitest';

// Ensure components are registered in the registry.
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

import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3.js';
import { resolvePinPosition } from '../../src/components/simulator/canvas/WireRenderer.jsx';

function buildComponentIndex(components) {
  const byId = {};
  for (const c of components) byId[c.id] = c;
  return byId;
}

describe('Volume 3 wiring resolves pins', () => {
  it('all connection endpoints resolve to a pin position', () => {
    const experiments = EXPERIMENTS_VOL3?.experiments || [];
    expect(experiments.length).toBeGreaterThan(0);

    const failures = [];

    for (const exp of experiments) {
      const comps = exp.components || [];
      const layout = exp.layout || {};
      const compById = buildComponentIndex(comps);

      // Basic layout coverage: every component should have a layout entry.
      for (const c of comps) {
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
          const pos = resolvePinPosition(endpoint, comps, layout);
          if (!pos || Number.isNaN(pos.x) || Number.isNaN(pos.y)) {
            failures.push({ exp: exp.id, type: 'unresolved-pin', ref: endpoint });
          }
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
