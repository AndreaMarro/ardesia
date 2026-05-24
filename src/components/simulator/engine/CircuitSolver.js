/**
 * ELAB Simulator — CircuitSolver Engine v4
 * (c) Andrea Marro — 28/02/2026 — ELAB Tutor — Tutti i diritti riservati
 * Net-based + path-tracing circuit solver for passive circuits (Vol1 + Vol2)
 *
 * Architecture:
 * 1. Build electrical nets (Union-Find): wires merge pins into same net,
 *    closed switches/MOSFETs merge their internal pins,
 *    breadboard internal strips merge holes in same column/bus.
 * 2. Assign supply voltages (battery/Arduino).
 * 3. Path-trace: for each "load" component (LED, buzzer, motor, etc.),
 *    find the supply voltage reachable from each pin by traversing the net graph
 *    through resistive elements. Calculate effective V and I.
 * 4. Iterate if MOSFET/diode states change.
 *
 * © Andrea Marro — 11/02/2026
 */

import { getComponent } from '../components/registry';

// Forward voltages per LED color
const LED_VF = {
  red: 1.8,
  green: 2.2,
  blue: 3.0,
  yellow: 2.0,
  white: 3.2,
  orange: 2.0,
};

const DIODE_VF = 0.7;
const MOSFET_VGS_THRESHOLD = 2.0;

// ─── Union-Find ───

class UnionFind {
  constructor() {
    this.parent = new Map();
    this.rank = new Map();
  }

  make(x) {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.rank.set(x, 0);
    }
  }

  find(x) {
    if (!this.parent.has(x)) this.make(x);
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)));
    }
    return this.parent.get(x);
  }

  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    const rankA = this.rank.get(ra);
    const rankB = this.rank.get(rb);
    if (rankA < rankB) this.parent.set(ra, rb);
    else if (rankA > rankB) this.parent.set(rb, ra);
    else { this.parent.set(rb, ra); this.rank.set(ra, rankA + 1); }
  }

  sameSet(a, b) {
    return this.find(a) === this.find(b);
  }
}

// ─── CircuitSolver ───

class CircuitSolver {
  constructor() {
    this.components = new Map();
    this.connections = [];
    this.time = 0;
    this.dt = 1 / 30;
    this.running = false;
    this.rafId = null;
    this.onStateChange = null;
    this.onWarning = null; // callback: (type, message) => void

    // Internal structures
    this._uf = null;
    this._pinRefs = new Set();
    this._supplyNets = new Map();  // net representative → voltage (only for supply-driven nets)

    // Adjacency: compId → Set of neighbor compIds connected via wires
    this._compNeighbors = new Map();
    // Pin ref → which component+pin
    this._pinToComp = new Map(); // pinRef → { compId, pinName }

    // Dynamic supply sources (potentiometer wiper, etc.) — persisted across solve iterations
    // Stores pinRef → voltage so they can be re-injected after _buildNets clears _supplyNets
    this._dynamicSupplies = new Map(); // pinRef (original, not net representative) → voltage

    // Probe connections from visual drag (multimeter probes)
    // Format: { mmId: { positive: 'led1:anode', negative: 'bb:e15' } }
    this._probeConnections = {};
  }

  /**
   * Set multimeter probe connections from visual drag.
   * When probes are dragged to component pins, the solver uses those pin refs
   * instead of the fixed probe-positive/probe-negative pins.
   */
  setProbeConnections(conns) {
    this._probeConnections = conns || {};
  }

  // ─── Public API ───

  loadExperiment(experiment, options = {}) {
    const preserveState = options.preserveState || false;

    if (!preserveState) {
      this.reset();
    } else {
      // Partial reset: clear topology but keep components/time
      this.connections = [];
      this._pinRefs.clear();
      this._compNeighbors.clear();
      this._pinToComp.clear();
      this._supplyNets.clear();
      this._mnaNodeVoltages = null;
      this._mnaBranchCurrents = null;
      // Do NOT clear this.time, this.components, or this._dynamicSupplies
    }

    if (!experiment || !experiment.components) return;

    // specific handling for preserveState: prune removed components, add new ones
    if (preserveState) {
      const newIds = new Set(experiment.components.map(c => c.id));
      // Remove deleted components
      for (const [id, comp] of this.components) {
        if (!newIds.has(id)) {
          this.components.delete(id);
        }
      }
      // Add/Update components
      experiment.components.forEach(comp => {
        if (this.components.has(comp.id)) {
          // Update static properties but keep state
          const existing = this.components.get(comp.id);
          existing.value = comp.value || 0;
          existing.color = comp.color || null;
          // existing.state is preserved
        } else {
          // New component
          this.components.set(comp.id, {
            type: comp.type,
            value: comp.value || 0,
            color: comp.color || null,
            state: this._initState(comp),
          });
        }
      });
    } else {
      // Standard load (full reset)
      experiment.components.forEach(comp => {
        this.components.set(comp.id, {
          type: comp.type,
          value: comp.value || 0,
          color: comp.color || null,
          state: this._initState(comp),
        });
      });
    }

    if (experiment.connections) {
      this.connections = experiment.connections.map(c => ({
        from: c.from, to: c.to, color: c.color,
      }));
    }

    // Index all pin refs and build adjacency
    this.connections.forEach(c => {
      this._pinRefs.add(c.from);
      this._pinRefs.add(c.to);

      const [fromId, fromPin] = c.from.split(':');
      const [toId, toPin] = c.to.split(':');
      this._pinToComp.set(c.from, { compId: fromId, pinName: fromPin });
      this._pinToComp.set(c.to, { compId: toId, pinName: toPin });

      // Build component adjacency (which components are wired together)
      if (!this._compNeighbors.has(fromId)) this._compNeighbors.set(fromId, new Set());
      if (!this._compNeighbors.has(toId)) this._compNeighbors.set(toId, new Set());
      this._compNeighbors.get(fromId).add(toId);
      this._compNeighbors.get(toId).add(fromId);
    });

    // ─── Breadboard pinAssignments ───
    // Maps "componentId:pinName" → "bbId:holeId" for components inserted in breadboard
    this._pinAssignments = experiment.pinAssignments || {};
    Object.entries(this._pinAssignments).forEach(([compPin, bbHole]) => {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      this._pinRefs.add(compPin);
      this._pinRefs.add(bbHole);
      const [cId, cPin] = compPin.split(':');
      const [bbId, holeId] = bbHole.split(':');
      this._pinToComp.set(compPin, { compId: cId, pinName: cPin });
      this._pinToComp.set(bbHole, { compId: bbId, pinName: holeId });
      // Build adjacency for pin assignments too
      if (!this._compNeighbors.has(cId)) this._compNeighbors.set(cId, new Set());
      if (!this._compNeighbors.has(bbId)) this._compNeighbors.set(bbId, new Set());
      this._compNeighbors.get(cId).add(bbId);
      this._compNeighbors.get(bbId).add(cId);
    });

    this.solve();

    // ─── Compute active holes for breadboard highlighting ───
    this._computeActiveHoles();
  }

  _computeActiveHoles() {
    // Find all breadboard components and compute which holes are in use
    this.components.forEach((comp, id) => {
      if (comp.type !== 'breadboard-half' && comp.type !== 'breadboard-full') return;

      const activeHoles = {};
      const bbPrefix = `${id}:`;

      // Mark holes used by pinAssignments (component pins inserted into holes)
      if (this._pinAssignments) {
        Object.values(this._pinAssignments).forEach(bbHole => {
          if (bbHole.startsWith(bbPrefix)) {
            const holeId = bbHole.slice(bbPrefix.length);
            activeHoles[holeId] = true;
          }
        });
      }

      // Mark holes used as wire endpoints in connections
      this.connections.forEach(c => {
        [c.from, c.to].forEach(ref => {
          if (ref.startsWith(bbPrefix)) {
            const holeId = ref.slice(bbPrefix.length);
            activeHoles[holeId] = true;
          }
        });
      });

      comp.state.activeHoles = activeHoles;
    });
  }

  interact(componentId, action, value) {
    const comp = this.components.get(componentId);
    if (!comp) return;

    switch (comp.type) {
      case 'push-button':
        if (action === 'press') comp.state.pressed = true;
        if (action === 'release') comp.state.pressed = false;
        break;
      case 'potentiometer':
        if (action === 'setPosition' && typeof value === 'number') {
          comp.state.position = Math.max(0, Math.min(1, value));
          comp.state.resistance = (comp.value || 10000) * comp.state.position;
        } else if (typeof action === 'number') {
          // Legacy: interact(id, 0.5)
          comp.state.position = Math.max(0, Math.min(1, action));
          comp.state.resistance = (comp.value || 10000) * comp.state.position;
        }
        break;
      case 'photo-resistor':
        if (action === 'setLightLevel' && typeof value === 'number') {
          comp.state.lightLevel = Math.max(0, Math.min(1, value));
          comp.state.resistance = 200 + (1 - comp.state.lightLevel) * 9800;
        } else if (typeof action === 'number') {
          comp.state.lightLevel = Math.max(0, Math.min(1, action));
          comp.state.resistance = 200 + (1 - comp.state.lightLevel) * 9800;
        }
        break;
      case 'phototransistor':
        if (action === 'setLightLevel' && typeof value === 'number') {
          comp.state.lightLevel = Math.max(0, Math.min(1, value));
          comp.state.conducting = comp.state.lightLevel > 0.05;
        } else if (typeof action === 'number') {
          comp.state.lightLevel = Math.max(0, Math.min(1, action));
          comp.state.conducting = comp.state.lightLevel > 0.05;
        }
        break;
      case 'mosfet-n':
        // Touch gate: simulate body charge capacitance (floating gate experiment)
        if (action === 'touchGate') {
          comp.state.gateTouched = true;
          comp.state.vgs = 5; // body charge ~5V
          comp.state.on = true;
          // BUG FIX: Set low Rds when gate is touched — _preEvaluateSwitches
          // skips gateTouched MOSFETs, so rds stayed at 1MΩ (off value).
          comp.state.rds = Math.max(0.1, 10 / (5 - MOSFET_VGS_THRESHOLD + 0.1));
        } else if (action === 'releaseGate') {
          comp.state.gateTouched = false;
          // Gate charge dissipates slowly
          comp.state.vgs = 0;
          comp.state.on = false;
          comp.state.rds = 1e6; // 1MΩ off state
        }
        break;
      case 'reed-switch':
        if (action === 'toggle') comp.state.closed = !comp.state.closed;
        break;
      case 'multimeter':
        if (action === 'set-mode' && value) {
          comp.state.mode = value; // 'voltage', 'resistance', 'current'
        }
        break;
    }

    this.solve();
  }

  getState() {
    const state = {};
    this.components.forEach((comp, id) => {
      state[id] = { ...comp.state };
    });
    return state;
  }

  /**
   * S99: Returns circuit diagnostics for visual feedback.
   * Called by React layer to highlight problems on the canvas.
   * @returns {{ shortCircuit: boolean, disconnectedPins: Array<{compId, pinName, pinRef}>, overloadWarnings: Array<{compId, type, message}> }}
   */
  getDiagnostics() {
    return {
      shortCircuit: !!this._shortCircuit,
      disconnectedPins: this._disconnectedPins || [],
      overloadWarnings: this._overloadWarnings || [],
    };
  }

  /**
   * Returns node voltages as a plain object.
   * Keys are pin references (e.g. "bb1:e5"), values are voltages in Volts.
   * Falls back to supply net voltages when MNA hasn't run.
   * @returns {Object} e.g. { "bb1:e5": 5.0, "bb1:a3": 2.1, "nano-r4:GND": 0 }
   */
  getNodeVoltages() {
    const voltages = {};

    if (this._mnaNodeVoltages && this._mnaNodeVoltages.size > 0) {
      // MNA results: most accurate (parallel paths resolved)
      this._mnaNodeVoltages.forEach((v, netRep) => {
        voltages[netRep] = Math.round(v * 1000) / 1000; // 3 decimal places
      });
    } else if (this._supplyNets && this._supplyNets.size > 0) {
      // Fallback: supply nets from path-tracer (simple series circuits)
      this._supplyNets.forEach((v, netRep) => {
        voltages[netRep] = Math.round(v * 1000) / 1000;
      });
    }

    return voltages;
  }

  /**
   * Returns component currents as a plain object.
   * Keys are component IDs (e.g. "led1", "r1"), values are currents in Amps.
   * Uses MNA branch currents when available, falls back to per-component state.
   * @returns {Object} e.g. { "led1": 0.015, "r1": 0.015, "cap1": 0.002 }
   */
  getComponentCurrents() {
    const currents = {};

    this.components.forEach((comp, id) => {
      // Priority 1: MNA branch current (most accurate for parallel paths)
      if (this._mnaBranchCurrents && this._mnaBranchCurrents.has(id)) {
        currents[id] = Math.round(this._mnaBranchCurrents.get(id) * 10000) / 10000; // 4 decimals
      }
      // Priority 2: per-component state current (from path-tracer solvers)
      else if (comp.state && typeof comp.state.current === 'number' && comp.state.current !== 0) {
        currents[id] = Math.round(comp.state.current * 10000) / 10000;
      }
      // Skip components with no current info (breadboard, nano-r4, etc.)
    });

    return currents;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.time += this.dt;
      this.solve(true);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  pause() {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  reset() {
    this.pause();
    this.components.clear();
    this.connections = [];
    this._pinRefs.clear();
    this._compNeighbors.clear();
    this._pinToComp.clear();
    this._dynamicSupplies.clear();
    this.time = 0;
  }

  destroy() {
    this.reset();
    this.onStateChange = null;
    this.onWarning = null;
  }

  // ─── Core Solver ───

  solve(isTimeStep = false) {
    let prevSnap = '';
    for (let outer = 0; outer < 5; outer++) {
      // Pre-evaluate switch states before building nets.
      // Phototransistors: always pre-evaluate (based on lightLevel, no voltage needed).
      // MOSFETs/diodes: only after iteration 0 (need voltage from previous solve).
      this._preEvaluateSwitches(outer);
      this._buildNets();
      this._markSupplyNets();
      this._checkShortCircuit();

      // Validate after _buildNets so Union-Find is available for net-based checks
      if (outer === 0) {
        const validation = this._validatePhysicalConnections();
        if (validation.message && this.onWarning) {
          this.onWarning('connection_warning', validation.message);
        }
        // S99: Detect disconnected pins for visual feedback
        this._detectDisconnectedPins();
      }

      // Re-inject dynamic supplies (potentiometer wiper, etc.) from previous iteration.
      // These are stored by pinRef; we re-map to the current net representative
      // since _buildNets() may have reassigned nets.
      this._injectDynamicSupplies();

      this._solveAllLoads(isTimeStep && outer === 0);

      // After solving loads, collect new dynamic supply sources (potentiometer signal, etc.)
      // for the NEXT iteration. These will be injected via _injectDynamicSupplies().
      this._collectDynamicSupplies();

      // Convergence check: includes MOSFET/diode states AND dynamic supply voltages
      const snap = this._convergenceSnapshot();
      if (snap === prevSnap) break;
      prevSnap = snap;
    }

    // S99: Post-solve diagnostics (after all iterations converged)
    this._detectOverload();

    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Inject dynamic supply sources (potentiometer wiper, etc.) into _supplyNets.
   * Called BEFORE _solveAllLoads() so downstream components (LEDs, etc.) can
   * trace their supply through the potentiometer signal pin.
   * Uses data collected from the PREVIOUS iteration's _collectDynamicSupplies().
   */
  _injectDynamicSupplies() {
    for (const [pinRef, voltage] of this._dynamicSupplies) {
      if (!this._pinRefs.has(pinRef)) continue;
      const net = this._uf.find(pinRef);
      // Only inject if not already set by a "real" supply (battery, nano)
      if (!this._supplyNets.has(net)) {
        this._supplyNets.set(net, voltage);
      }
    }
  }

  /**
   * Collect dynamic supply sources after solving all loads.
   * Potentiometer signal voltage is computed during _solvePotentiometer();
   * we store it here by pinRef so _injectDynamicSupplies() can use it
   * on the NEXT iteration (or on the first iteration after interact()).
   */
  _collectDynamicSupplies() {
    this._dynamicSupplies.clear();
    this.components.forEach((comp, id) => {
      if (comp.type === 'potentiometer') {
        const signalRef = `${id}:signal`;
        if (this._pinRefs.has(signalRef) && comp.state.signalVoltage != null) {
          this._dynamicSupplies.set(signalRef, comp.state.signalVoltage);
        }
      }
      // Capacitor: register charged capacitor as dynamic voltage source.
      // This allows LEDs, resistors, and other loads to "see" the capacitor's
      // stored voltage when discharging (e.g., button released after charging).
      if (comp.type === 'capacitor') {
        const posRef = `${id}:positive`;
        if (this._pinRefs.has(posRef) && Math.abs(comp.state.voltage || 0) > 0.01) {
          this._dynamicSupplies.set(posRef, comp.state.voltage);
        }
      }
    });
  }

  /**
   * Pre-evaluate MOSFET and diode conducting states based on current net voltages.
   * Called before _buildNets() on iterations > 0 so that net merging
   * reflects the updated switch states immediately.
   */
  _preEvaluateSwitches(iteration = 1) {
    this.components.forEach((comp, id) => {
      // Phototransistor: always pre-evaluate (purely light-level based, no voltage needed)
      if (comp.type === 'phototransistor') {
        comp.state.conducting = comp.state.lightLevel > 0.05;
      }
      // MOSFET/diode: only re-evaluate after first iteration (need solved voltages)
      if (iteration > 0) {
        if (comp.type === 'mosfet-n') {
          // Skip voltage-based evaluation if gate is manually touched (floating gate experiment)
          if (comp.state.gateTouched) return;
          const gateV = this._mnaNodeVoltages ? this._getMNAVoltage(`${id}:gate`) : this._pinSupplyVoltage(`${id}:gate`, id);
          const sourceV = this._mnaNodeVoltages ? this._getMNAVoltage(`${id}:source`) : this._pinSupplyVoltage(`${id}:source`, id);
          comp.state.vgs = gateV - sourceV;
          comp.state.on = comp.state.vgs >= MOSFET_VGS_THRESHOLD;

          // Analog resistance model for MNA stamping
          if (comp.state.on) {
            comp.state.rds = Math.max(0.1, 10 / (comp.state.vgs - MOSFET_VGS_THRESHOLD + 0.1));
          } else {
            comp.state.rds = 1e6; // 1MΩ off state
          }
        }
        if (comp.type === 'diode') {
          const anodeV = this._pinSupplyVoltage(`${id}:anode`, id);
          const cathodeV = this._pinSupplyVoltage(`${id}:cathode`, id);
          comp.state.conducting = (anodeV - cathodeV) >= DIODE_VF;
        }
      }
    });
  }

  // ─── TINKERCAD REALISM: Physical Connection Validation ───

  /**
   * Validate that circuit connections are physically realistic
   * Returns { valid: boolean, message: string }
   */
  _validatePhysicalConnections() {
    const errors = [];

    // Check 1: LED must have current-limiting resistor in series
    this.components.forEach((comp, id) => {
      if (comp.type === 'led') {
        const hasResistor = this._hasResistorInSeries(id);
        if (!hasResistor) {
          errors.push(`LED "${id}" non ha una resistenza in serie! Serve una resistenza per proteggere il LED.`);
        }
      }
    });

    // Check 2: LED polarity must be correct (anode to higher voltage)
    this.components.forEach((comp, id) => {
      if (comp.type === 'led') {
        const anodeRef = `${id}:anode`;
        const cathodeRef = `${id}:cathode`;

        // Find what anode and cathode are connected to
        const anodeConnectedTo = this._getConnectedComponents(anodeRef);
        const cathodeConnectedTo = this._getConnectedComponents(cathodeRef);

        // Check if cathode is connected to GND or lower voltage side
        const cathodeHasGround = cathodeConnectedTo.some(c =>
          c.type === 'breadboard-half' || c.type === 'breadboard-full'
        );

        if (!cathodeHasGround) {
          // Not necessarily an error, but worth checking
          // console.warn(`LED ${id} cathode may not be connected to ground`);
        }
      }
    });

    // Check 3: No floating inputs (Arduino pins configured as INPUT must be connected)
    // This is a soft check - may not always be applicable

    if (errors.length > 0) {
      // CoVe Fix: Allow simulation to proceed even with "errors" (like missing resistor)
      // so that the physical result (e.g., LED burning) can happen.
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      // We can still return the message for UI warnings if needed, but valid must be true.
      return {
        valid: true,
        message: errors.join(' ')
      };
    }

    return { valid: true, message: '' };
  }

  /**
   * Check if a LED has a resistor somewhere in its supply path.
   * Uses BFS through the circuit net graph: starting from the LED's nets,
   * traverse through components to find if a resistor is reachable before
   * reaching a supply (battery/Arduino). This correctly handles multi-LED
   * series circuits where the resistor is not directly adjacent to every LED.
   */
  _hasResistorInSeries(componentId) {
    const comp = this.components.get(componentId);
    if (!comp) return false;
    if (!this._uf) return true; // Union-Find not built yet, assume OK

    // Collect nets for all pins of the target component
    const registered = getComponent(comp.type);
    if (!registered || !registered.pins) return true;

    const startNets = new Set();
    for (const pin of registered.pins) {
      const pinRef = `${componentId}:${pin.id}`;
      if (this._pinRefs.has(pinRef)) {
        startNets.add(this._uf.find(pinRef));
      }
    }

    if (startNets.size === 0) return true; // Component not in circuit, skip

    // BFS through the net graph: visit nets reachable through 2-terminal components
    const visited = new Set(startNets);
    const queue = [...startNets];

    while (queue.length > 0) {
      const currentNet = queue.shift();

      // Check all components for pins in this net
      for (const [cId, cComp] of this.components) {
        if (cId === componentId) continue; // Skip the LED itself

        const cReg = getComponent(cComp.type);
        if (!cReg || !cReg.pins) continue;

        // Find which pins of this component are in the current net
        for (const pin of cReg.pins) {
          const pinRef = `${cId}:${pin.id}`;
          if (!this._pinRefs.has(pinRef)) continue;
          if (this._uf.find(pinRef) !== currentNet) continue;

          // This component has a pin in the current net
          if (cComp.type === 'resistor') return true; // Found resistor in path!

          // For other 2-terminal pass-through components (LEDs, diodes, switches, etc.),
          // find their other pins and add those nets to the BFS queue
          for (const otherPin of cReg.pins) {
            if (otherPin.id === pin.id) continue;
            const otherPinRef = `${cId}:${otherPin.id}`;
            if (!this._pinRefs.has(otherPinRef)) continue;
            const otherNet = this._uf.find(otherPinRef);
            if (!visited.has(otherNet)) {
              visited.add(otherNet);
              queue.push(otherNet);
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get list of components connected to a pin reference
   */
  _getConnectedComponents(pinRef) {
    const connected = [];

    // Find all wires connected to this pin
    const wires = this.connections.filter(c =>
      c.from === pinRef || c.to === pinRef
    );

    for (const wire of wires) {
      const otherEnd = wire.from === pinRef ? wire.to : wire.from;
      const [compId] = otherEnd.split(':');
      const comp = this.components.get(compId);
      if (comp) connected.push(comp);
    }

    // Also check pinAssignments
    if (this._pinAssignments) {
      for (const [compPin, bbHole] of Object.entries(this._pinAssignments)) {
        if (compPin === pinRef) {
          // This pin is inserted in breadboard - find other components in same hole
          for (const [otherPin, otherHole] of Object.entries(this._pinAssignments)) {
            if (otherHole === bbHole && otherPin !== compPin) {
              const [otherCompId] = otherPin.split(':');
              const otherComp = this.components.get(otherCompId);
              if (otherComp) connected.push(otherComp);
            }
          }
        }
      }
    }

    return connected;
  }

  // ─── Net Building ───

  _buildNets() {
    this._uf = new UnionFind();
    this._supplyNets = new Map();

    this._pinRefs.forEach(p => this._uf.make(p));

    // All wires merge endpoints into same net
    this.connections.forEach(c => this._uf.union(c.from, c.to));

    // Closed switches, conducting MOSFETs/diodes merge internal pins
    this.components.forEach((comp, id) => {
      if (comp.type === 'push-button') {
        // Tactile switch: pin1+pin3 always connected, pin2+pin4 always connected
        this._mergePins(id, 'pin1', 'pin3');
        this._mergePins(id, 'pin2', 'pin4');
        if (comp.state.pressed) {
          this._mergePins(id, 'pin1', 'pin2');
        }
      }
      if (comp.type === 'reed-switch' && comp.state.closed) {
        this._mergePins(id, 'pin1', 'pin2');
      }
      // MOSFET pins are NO LONGER merged here. They are solved iteratively
      // via MNA and path tracer as a variable resistor to support natural high-side/low-side voltage drops.
      if (comp.type === 'diode' && comp.state.conducting) {
        this._mergePins(id, 'anode', 'cathode');
      }
      if (comp.type === 'phototransistor' && comp.state.conducting) {
        this._mergePins(id, 'collector', 'emitter');
      }

      // ─── Breadboard internal connectivity ───
      // Merge holes in same column strip or bus rail (only those actually referenced)
      if (comp.type === 'breadboard-half' || comp.type === 'breadboard-full') {
        const bbReg = getComponent(comp.type);
        if (bbReg && bbReg.getInternalConnections) {
          const nets = bbReg.getInternalConnections();
          for (const net of nets) {
            // Only union holes that are actually in _pinRefs (used by wires or pinAssignments)
            const usedRefs = net.holes
              .map(h => `${id}:${h}`)
              .filter(r => this._pinRefs.has(r));

            if (usedRefs.length > 1) {
              for (let i = 1; i < usedRefs.length; i++) {
                this._uf.union(usedRefs[0], usedRefs[i]);
              }
            }
          }
        }
      }
    });

    // ─── Wing pin aliasing (NanoBreakout W_ → actual Arduino pin) ───
    // BUG FIX S56: Wing pins like W_D10 must be unioned with their actual
    // counterpart (D10) so the CircuitSolver sees them as the same net.
    // If only one side is in _pinRefs, we must add the other side too,
    // otherwise the union and supply net registration will fail.
    this.components.forEach((comp, id) => {
      if (comp.type === 'nano-r4') {
        const reg = getComponent(comp.type);
        if (reg && reg.pins) {
          for (const pin of reg.pins) {
            if (pin.mapsTo) {
              const wingRef = `${id}:${pin.id}`;
              const actualRef = `${id}:${pin.mapsTo}`;
              const hasWing = this._pinRefs.has(wingRef);
              const hasActual = this._pinRefs.has(actualRef);
              if (hasWing || hasActual) {
                // Ensure both exist in pinRefs and UF
                if (!hasWing) {
                  this._pinRefs.add(wingRef);
                  this._uf.make(wingRef);
                }
                if (!hasActual) {
                  this._pinRefs.add(actualRef);
                  this._uf.make(actualRef);
                }
                this._uf.union(wingRef, actualRef);
              }
            }
          }
        }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      }
    });

    // ─── Pin Assignments: component pin = breadboard hole ───
    // When a component is inserted into a breadboard hole, they are electrically the same
    if (this._pinAssignments) {
      Object.entries(this._pinAssignments).forEach(([compPin, bbHole]) => {
        if (this._pinRefs.has(compPin) && this._pinRefs.has(bbHole)) {
          this._uf.union(compPin, bbHole);
        }
      });
    }
  }

  _mergePins(compId, pinA, pinB) {
    const a = `${compId}:${pinA}`;
    const b = `${compId}:${pinB}`;
    if (this._pinRefs.has(a) && this._pinRefs.has(b)) {
      this._uf.union(a, b);
    }
  }

  // ─── Supply Identification ───

  _markSupplyNets() {
    this.components.forEach((comp, id) => {
      if (comp.type === 'battery9v' && comp.state.connected) {
        const posRef = `${id}:positive`;
        const negRef = `${id}:negative`;
        if (this._pinRefs.has(posRef)) {
          this._supplyNets.set(this._uf.find(posRef), comp.state.voltage);
        }
        if (this._pinRefs.has(negRef)) {
          this._supplyNets.set(this._uf.find(negRef), 0);
        }
      }
      if (comp.type === 'nano-r4') {
        const v5 = `${id}:5V`;
        const gnd = `${id}:GND`;
        const gndR = `${id}:GND_R`;
        const v33 = `${id}:3V3`;
        if (this._pinRefs.has(v5)) this._supplyNets.set(this._uf.find(v5), 5);
        if (this._pinRefs.has(gnd)) this._supplyNets.set(this._uf.find(gnd), 0);
        // BUG FIX: GND_R is also a ground pin on the Nano
        if (this._pinRefs.has(gndR)) this._supplyNets.set(this._uf.find(gndR), 0);
        // BUG FIX: 3V3 is a 3.3V supply pin
        if (this._pinRefs.has(v33)) this._supplyNets.set(this._uf.find(v33), 3.3);

        // BUG FIX S56: Register Arduino digital output pins as supply nets
        // so the path tracer can see them (previously only visible in MNA mode).
        // Without this, any simple Arduino→resistor→LED→GND circuit fails because
        // _traceToSupply() can't find a voltage source on the digital pin side.
        if (comp.state && comp.state.pinStates && comp.state.pinModes) {
          for (let i = 0; i <= 13; i++) {
            const pinRef = `${id}:D${i}`;
            if (!this._pinRefs.has(pinRef)) continue;
            const mode = comp.state.pinModes[i];
            // avr8js PinState: 0=OUTPUT LOW, 1=OUTPUT HIGH, 3=INPUT_PULLUP
            if (mode === 0 || mode === 1 || mode === 3) {
              const val = comp.state.pinStates[`D${i}`] > 0;
              let pwmDuty = null;
              if (comp.state.pinStates._pwm && comp.state.pinStates._pwm[i] !== undefined) {
                pwmDuty = comp.state.pinStates._pwm[i];
              }
              let voltage = 0.0;
              if (pwmDuty !== null && (mode === 0 || mode === 1)) {
                voltage = pwmDuty * 5.0;
              } else {
                voltage = (val || mode === 3) ? 5.0 : 0.0;
              }
              const net = this._uf.find(pinRef);
              // Don't overwrite existing higher-priority supply (battery, 5V rail)
              if (!this._supplyNets.has(net)) {
                this._supplyNets.set(net, voltage);
              }
            }
          }
          // Also register analog pins A0-A5 if they are configured as OUTPUT
          for (let i = 0; i <= 5; i++) {
            const pinRef = `${id}:A${i}`;
            if (!this._pinRefs.has(pinRef)) continue;
            const mode = comp.state.pinModes[14 + i]; // A0=14, A1=15, ..., A5=19
            if (mode === 0 || mode === 1) {
              const val = comp.state.pinStates[`A${i}`] > 0;
              const voltage = val ? 5.0 : 0.0;
              const net = this._uf.find(pinRef);
              if (!this._supplyNets.has(net)) {
                this._supplyNets.set(net, voltage);
              }
            }
          }
        }
      }
    });
  }

  /**
   * Check for short circuits: battery/supply positive and negative pins
   * in the same net (zero resistance path between + and -).
   */
  _checkShortCircuit() {
    this._shortCircuit = false;
    this.components.forEach((comp, id) => {
      if (comp.type === 'battery9v' && comp.state.connected) {
        const posNet = this._uf.find(`${id}:positive`);
        const negNet = this._uf.find(`${id}:negative`);
        if (posNet === negNet) {
          this._shortCircuit = true;
          if (this.onWarning) {
            this.onWarning('short-circuit', 'Cortocircuito! Il polo + e il polo - della batteria sono collegati direttamente.');
          }
        }
      }
      if (comp.type === 'nano-r4') {
        const v5Net = this._pinRefs.has(`${id}:5V`) ? this._uf.find(`${id}:5V`) : null;
        const gndNet = this._pinRefs.has(`${id}:GND`) ? this._uf.find(`${id}:GND`) : null;
        if (v5Net && gndNet && v5Net === gndNet) {
          this._shortCircuit = true;
          if (this.onWarning) {
            this.onWarning('short-circuit', 'Cortocircuito! 5V e GND dell\'Arduino sono collegati direttamente.');
          }
        }
      }
    });
  }

  /**
   * S99: Detect pins that are not connected to anything else in the circuit.
   * A "disconnected" pin is one whose Union-Find net contains only itself
   * (no wires, no breadboard connections to other components).
   * Excludes breadboards, nano-r4 (many unused pins are normal), and supply components.
   */
  _detectDisconnectedPins() {
    this._disconnectedPins = [];
    if (!this._uf) return;

    // Build a map: net representative → count of distinct component pins in that net
    const netPinCount = new Map(); // net → Set of compId:pinName refs
    this._pinRefs.forEach(pinRef => {
      const net = this._uf.find(pinRef);
      if (!netPinCount.has(net)) netPinCount.set(net, new Set());
      netPinCount.get(net).add(pinRef);
    });

    // Types to skip (many pins are legitimately unused)
    const skipTypes = new Set(['breadboard-half', 'breadboard-full', 'nano-r4', 'battery9v']);

    this.components.forEach((comp, id) => {
      if (skipTypes.has(comp.type)) return;
      const registered = getComponent(comp.type);
      if (!registered || !registered.pins) return;

      for (const pin of registered.pins) {
        const pinRef = `${id}:${pin.id}`;
        if (!this._pinRefs.has(pinRef)) {
          // Pin not in any connection at all — definitely disconnected
          this._disconnectedPins.push({ compId: id, pinName: pin.id, pinRef });
          continue;
        }
        const net = this._uf.find(pinRef);
        const netMembers = netPinCount.get(net);
        // If this pin's net has only breadboard holes and itself, it's floating
        if (netMembers && netMembers.size <= 1) {
          this._disconnectedPins.push({ compId: id, pinName: pin.id, pinRef });
        }
      }
    });

    // Set disconnectedPins on component state for visual rendering
    const byComp = new Map();
    for (const dp of this._disconnectedPins) {
      if (!byComp.has(dp.compId)) byComp.set(dp.compId, []);
      byComp.get(dp.compId).push(dp.pinName);
    }
    this.components.forEach((comp, id) => {
      comp.state.disconnectedPins = byComp.get(id) || [];
    });
  }

  /**
   * S99: Detect component overload conditions (pre-burn warnings).
   * LED in "yellow zone" (20-30mA): warn but don't burn yet.
   * LED without resistor: already handled by _validatePhysicalConnections,
   * but we add a warning state for visual feedback.
   */
  _detectOverload() {
    this._overloadWarnings = [];
    const LED_WARN_CURRENT = 0.020; // 20mA — rated max for standard LEDs
    const LED_BURN_CURRENT = 0.030; // 30mA — burn threshold

    this.components.forEach((comp, id) => {
      if (comp.type === 'led') {
        const current = comp.state.current || 0;
        if (current > LED_WARN_CURRENT && current <= LED_BURN_CURRENT && !comp.state.burned) {
          comp.state.warning = 'overcurrent';
          this._overloadWarnings.push({
            compId: id,
            type: 'overcurrent',
            message: `LED "${id}" a ${Math.round(current * 1000)}mA — vicino al limite! (max 20mA)`,
          });
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          if (this.onWarning) {
            this.onWarning('overcurrent', `LED "${id}" è in zona di pericolo: ${Math.round(current * 1000)}mA (max 20mA).`);
          }
        } else if (!comp.state.burned) {
          comp.state.warning = null;
        }
      }
    });
  }

  /**
   * Get the voltage of the net containing a pin ref.
   * This checks if the net is directly a supply net.
   */
  _netVoltage(pinRef) {
    if (!this._pinRefs.has(pinRef)) return null;
    const net = this._uf.find(pinRef);
    if (this._supplyNets.has(net)) return this._supplyNets.get(net);
    return null;
  }

  /**
   * Trace from a pin through the circuit graph to find the supply voltage
   * it's connected to, accumulating series resistance AND voltage drops along the way.
   * Returns { voltage: number, resistance: number, vDrop: number } or null if no supply found.
   *
   * vDrop accumulates forward voltage drops from LEDs/diodes traversed in the path.
   * This is critical for series LED calculations: when LED1 traces through LED2 to reach
   * supply, LED2's Vf must be subtracted from the available voltage.
   *
   * Uses best-first search (Dijkstra-like) to find the lowest-resistance
   * path to a supply, instead of BFS which returns the first (arbitrary) supply found.
   */
  _traceToSupply(startPinRef, excludeCompId) {
    const startNet = this._uf.find(startPinRef);

    // Check if this net is directly a supply.
    // IMPORTANT: Skip this shortcut if the supply on this net was injected by the
    // excluded component itself (e.g., capacitor's own dynamic supply).
    // Otherwise the cap finds its own stored voltage at R=0 and never explores
    // the actual discharge path (e.g., cap+ → R → LED → GND).
    if (this._supplyNets.has(startNet)) {
      let isSelfSupply = false;
      if (excludeCompId) {
        // Check if any pin of the excluded component is on this net AND
        // has a dynamic supply that matches the net's supply voltage
        for (const [dynPin, dynV] of this._dynamicSupplies) {
          if (dynPin.startsWith(excludeCompId + ':')
              && this._pinRefs.has(dynPin)
              && this._uf.find(dynPin) === startNet
              && Math.abs(dynV - this._supplyNets.get(startNet)) < 0.01) {
            isSelfSupply = true;
            break;
          }
        }
      }
      if (!isSelfSupply) {
        return { voltage: this._supplyNets.get(startNet), resistance: 0, vDrop: 0 };
      }
      // Self-supply detected: skip early exit, explore circuit paths below
    }

    // Collect ALL paths to supply, then combine parallel resistances.
    // Uses modified Dijkstra: allows revisiting nets via different component paths.
    const allResults = []; // all paths that reach a supply
    const visited = new Map(); // net → Set of component IDs already used to reach it

    // Queue: { net, totalR, totalVDrop, usedComps: Set }
    const queue = [{ net: startNet, totalR: 0, totalVDrop: 0, usedComps: new Set() }];
    const MAX_PATHS = 16; // limit to prevent exponential blowup

    while (queue.length > 0 && allResults.length < MAX_PATHS) {
      // Sort queue by totalR (cheapest first)
      queue.sort((a, b) => a.totalR - b.totalR);
      const { net, totalR, totalVDrop, usedComps } = queue.shift();

      // Safety: skip very high resistance paths
      if (allResults.length > 0 && totalR > allResults[0].resistance * 100) continue;

      // Find all pins in this net
      for (const pinRef of this._pinRefs) {
        if (this._uf.find(pinRef) !== net) continue;

        const info = this._pinToComp.get(pinRef);
        if (!info) continue;
        if (info.compId === excludeCompId) continue;
        // Don't traverse the same component twice in one path
        if (usedComps.has(info.compId)) continue;

        const comp = this.components.get(info.compId);
        if (!comp) continue;

        // Can we traverse through this component?
        const otherPin = this._getOtherPin(info.compId, comp, info.pinName);
        if (!otherPin) continue;

        const otherPinRef = `${info.compId}:${otherPin}`;
        if (!this._pinRefs.has(otherPinRef)) continue;

        const otherNet = this._uf.find(otherPinRef);

        const compR = this._getComponentResistance(info.compId, comp, info.pinName);
        if (compR === null) continue; // component blocks current (open switch, etc.)

        // Accumulate voltage drop from LEDs and diodes in the path
        const compVDrop = this._getComponentVDrop(info.compId, comp);

        const newTotalR = totalR + compR;
        const newTotalVDrop = totalVDrop + compVDrop;

        // For parallel support: allow revisiting a net if we arrive via a DIFFERENT component
        // (but still skip if same component and same or worse resistance)
        const visitKey = `${otherNet}|${info.compId}`;
        if (visited.has(visitKey) && visited.get(visitKey) <= newTotalR) continue;
        visited.set(visitKey, newTotalR);

        const newUsedComps = new Set(usedComps);
        newUsedComps.add(info.compId);

        // Check if the other net is supply
        if (this._supplyNets.has(otherNet)) {
          allResults.push({ voltage: this._supplyNets.get(otherNet), resistance: newTotalR, vDrop: newTotalVDrop });
          continue; // Keep searching for more parallel paths
        }

        queue.push({ net: otherNet, totalR: newTotalR, totalVDrop: newTotalVDrop, usedComps: newUsedComps });
      }
    }

    if (allResults.length === 0) return null;

    // If only one path, return it directly (most common case, zero overhead)
    if (allResults.length === 1) return allResults[0];

    // Group by supply voltage (parallel paths must reach the same supply)
    const byVoltage = new Map();
    for (const r of allResults) {
      const key = r.voltage;
      if (!byVoltage.has(key)) byVoltage.set(key, []);
      byVoltage.get(key).push(r);
    }

    // Use the supply voltage with the most paths (or highest voltage in ties)
    let bestGroup = null;
    for (const [v, paths] of byVoltage) {
      if (!bestGroup || paths.length > bestGroup.length || (paths.length === bestGroup.length && v > bestGroup[0].voltage)) {
        bestGroup = paths;
      }
    }

    // Combine parallel resistances: 1/Rtot = 1/R1 + 1/R2 + ...
    // CoVe Fix #1: RIMOSSI calcoli errati di vDrop in parallelo.
    // In un parallelo tutti i rami hanno la STESSA differenza di potenziale ai capi.
    // La media ponderata per conduttanza era fisicamente incorretta.
    // Ora usiamo il vDrop del primo ramo (rappresentativo) o il max se ci sono LED.
    let invRSum = 0;
    let maxVDrop = 0;
    for (const path of bestGroup) {
      if (path.resistance > 0) {
        invRSum += 1 / path.resistance;
        // In caso di vDrop diversi (es. uno ha LED, l'altro no), 
        // il vDrop è determinato dal componente con caduta maggiore (LED)
        if (path.vDrop > maxVDrop) maxVDrop = path.vDrop;
      } else {
        // Zero resistance path = short, use it directly
        return path;
      }
    }

    const parallelR = invRSum > 0 ? 1 / invRSum : 0;
    // Usiamo il vDrop del primo ramo, o il max se presenti componenti non lineari
    const representativeVDrop = maxVDrop > 0 ? maxVDrop : bestGroup[0].vDrop;

    return { voltage: bestGroup[0].voltage, resistance: parallelR, vDrop: representativeVDrop };
  }

  /**
   * Get the voltage drop (Vf) of a component for path-tracing.
   * Used to accumulate forward voltage drops from LEDs/diodes in series paths.
   * Returns 0 for components with no inherent voltage drop (resistors, wires, etc.).
   */
  _getComponentVDrop(compId, comp) {
    switch (comp.type) {
      case 'led':
        return LED_VF[comp.color] || 2.0;
      case 'diode':
        return comp.state.conducting ? DIODE_VF : 0;
      default:
        return 0;
    }
  }

  /**
   * Get the other pin of a 2-terminal component.
   * Returns null for components that don't allow current flow.
   */
  _getOtherPin(compId, comp, currentPin) {
    const pinMap = {
      'resistor': { pin1: 'pin2', pin2: 'pin1' },
      'photo-resistor': { pin1: 'pin2', pin2: 'pin1' },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      'push-button': comp.state.pressed
        ? { pin1: 'pin2', pin2: 'pin1', pin3: 'pin4', pin4: 'pin3' }
        : null,
      'reed-switch': comp.state.closed ? { pin1: 'pin2', pin2: 'pin1' } : null,
      'led': { anode: 'cathode', cathode: 'anode' },
      'rgb-led': { red: 'common', green: 'common', blue: 'common', common: null }, // multi-channel: each color pin → common; common doesn't traverse back (solved per-channel in _solveRGBLed)
      'buzzer-piezo': { positive: 'negative', negative: 'positive' },
      'motor-dc': { positive: 'negative', negative: 'positive' },
      'capacitor': { positive: 'negative', negative: 'positive' },
      'phototransistor': { collector: 'emitter', emitter: 'collector' },
      // BUG FIX: Non-conducting diode should block ALL traversal, not just cathode→anode
      'diode': comp.state.conducting ? { anode: 'cathode', cathode: 'anode' } : null,
      'mosfet-n': comp.state.on ? { drain: 'source', source: 'drain' } : null,
      'potentiometer': (() => {
        // End-to-end traversal: vcc ↔ gnd with full track resistance
        // Signal (wiper): can traverse to BOTH endpoints. Return the closer one
        // based on position (lower resistance path).
        const pos = comp.state.position != null ? comp.state.position : 0.5;
        return {
          vcc: 'gnd',
          gnd: 'vcc',
          signal: pos <= 0.5 ? 'gnd' : 'vcc',  // traverse to closer endpoint
        };
      })(),
      'multimeter': { 'probe-positive': 'probe-negative', 'probe-negative': 'probe-positive' },
    };

    const mapping = pinMap[comp.type];
    if (!mapping) return null;
    return mapping[currentPin] || null;
  }

  /**
   * Get the resistance of a component for path-tracing.
   * Returns 0 for zero-resistance elements (wires, closed switches).
   * Returns null for elements that block current.
   * @param {string} entryPin - the pin name we're entering from (needed for potentiometer signal)
   */
  _getComponentResistance(compId, comp, entryPin) {
    switch (comp.type) {
      case 'resistor':
        return comp.value || 470;
      case 'photo-resistor':
        return comp.state.resistance || 5000;
      case 'push-button':
        return comp.state.pressed ? 0 : null; // open = blocks
      case 'reed-switch':
        return comp.state.closed ? 0 : null;
      case 'led':
        return 0; // LED resistance handled separately via Vf
      case 'buzzer-piezo':
        return 50; // typical buzzer impedance
      case 'motor-dc':
        return 10; // typical motor winding resistance
      case 'capacitor':
        return 0; // for DC analysis, simplify
      case 'diode':
        return comp.state.conducting ? 0 : null;
      case 'mosfet-n':
        return comp.state.on ? (comp.state.rds || 0.1) : null;
      case 'potentiometer': {
        const maxR = comp.value || 10000;
        if (entryPin === 'signal') {
          // Signal (wiper) to endpoint: partial track resistance based on position
          const pos = comp.state.position != null ? comp.state.position : 0.5;
          // If pos <= 0.5, signal exits to gnd → R = pos * maxR
          // If pos > 0.5, signal exits to vcc → R = (1 - pos) * maxR
          return pos <= 0.5 ? pos * maxR : (1 - pos) * maxR;
        }
        return maxR; // full track resistance for vcc→gnd end-to-end
      }
      case 'phototransistor':
        return comp.state.conducting ? 100 : null; // conducting phototransistor ~100Ω, otherwise blocks
      case 'multimeter':
        return 1e6; // very high impedance
      default:
        return null;
    }
  }

  // ─── Modified Nodal Analysis (MNA) ───

  /**
   * Detect whether the circuit has parallel resistive paths that require MNA.
   * Heuristic: count resistive components connected to each net.
   * If any net has ≥3 resistive edges (i.e. a node with ≥3 branches), MNA is needed.
   * Also triggered if ≥2 distinct resistive paths exist between supply+ and supply-.
   */
  _hasParallelPaths() {
    // Count resistive edges per net
    const netEdgeCount = new Map();
    this.components.forEach((comp, id) => {
      const r = this._getMNAResistance(id, comp);
      if (r === null || r === 0) return; // skip non-resistive or zero-R
      // Get both pins
      const pins = this._getMNAPins(id, comp);
      if (!pins) return;
      for (const pinRef of pins) {
        if (!this._pinRefs.has(pinRef)) continue;
        const net = this._uf.find(pinRef);
        netEdgeCount.set(net, (netEdgeCount.get(net) || 0) + 1);
      }
    });
    // If any net has ≥3 resistive edges → parallel paths exist
    for (const count of netEdgeCount.values()) {
      if (count >= 3) return true;
    }
    return false;
  }

  /**
   * Get the two pin refs of a component for MNA stamping.
   * Returns [pinRefA, pinRefB] or null if component is not a 2-terminal element.
   */
  _getMNAPins(id, comp) {
    switch (comp.type) {
      case 'resistor': return [`${id}:pin1`, `${id}:pin2`];
      case 'photo-resistor': return [`${id}:pin1`, `${id}:pin2`];
      case 'led': return [`${id}:anode`, `${id}:cathode`];
      case 'buzzer-piezo': return [`${id}:positive`, `${id}:negative`];
      case 'motor-dc': return [`${id}:positive`, `${id}:negative`];
      case 'capacitor': return [`${id}:positive`, `${id}:negative`];
      case 'multimeter': return [`${id}:probe-positive`, `${id}:probe-negative`];
      case 'mosfet-n': return [`${id}:drain`, `${id}:source`];
      default: return null;
    }
  }

  /**
   * Get the resistance of a component for MNA stamping.
   * Returns: number (resistance in Ω), 0 for wires/switches, null if blocks current.
   * LEDs are modeled as Vf source + ~20Ω forward resistance.
   */
  _getMNAResistance(id, comp) {
    switch (comp.type) {
      case 'resistor': return comp.value || 470;
      case 'photo-resistor': return comp.state.resistance || 5000;
      case 'led': return 20; // Forward resistance ~20Ω (Vf handled as voltage source)
      case 'buzzer-piezo': return 50;
      case 'motor-dc': return 10;
      case 'capacitor': return 1e6; // High impedance for DC steady state
      case 'multimeter': return 1e6; // High impedance voltmeter
      case 'potentiometer': return null; // Handled specially
      case 'mosfet-n': return comp.state.rds || 1e6;
      default: return null;
    }
  }

  /**
   * Solve the circuit using Modified Nodal Analysis (MNA).
   * Builds a conductance matrix G and solves G*x = b for node voltages.
   *
   * Components are modeled as:
   * - Resistors: conductance stamp G[i][i]+=g, G[j][j]+=g, G[i][j]-=g, G[j][i]-=g
   * - Voltage sources (batteries, Nano 5V/3V3): extra row/col for branch current
   * - LEDs: Vf voltage source in series with ~20Ω forward resistance
   * - Wires/switches: already merged into same net by Union-Find
   *
   * Stores results in this._mnaNodeVoltages (Map: netRepresentative → voltage)
   * and this._mnaBranchCurrents (Map: componentId → current in Amps).
   */
  _solveMNA() {
    this._mnaNodeVoltages = new Map();
    this._mnaBranchCurrents = new Map();

    // Step 1: Enumerate unique nets (from Union-Find)
    const netSet = new Set();
    for (const pinRef of this._pinRefs) {
      netSet.add(this._uf.find(pinRef));
    }

    // Identify ground net: the net connected to battery negative or Nano GND
    let groundNet = null;
    this.components.forEach((comp, id) => {
      if (comp.type === 'battery9v' && comp.state.connected) {
        const negRef = `${id}:negative`;
        if (this._pinRefs.has(negRef)) groundNet = this._uf.find(negRef);
      }
      if (comp.type === 'nano-r4') {
        const gndRef = `${id}:GND`;
        if (this._pinRefs.has(gndRef)) groundNet = this._uf.find(gndRef);
      }
    });

    if (!groundNet) return; // No ground reference → can't solve

    // Map nets to node indices (ground = excluded, it's the reference)
    const netToIndex = new Map();
    const indexToNet = [];
    let nodeCount = 0;
    for (const net of netSet) {
      if (net === groundNet) continue;
      netToIndex.set(net, nodeCount);
      indexToNet.push(net);
      nodeCount++;
    }

    if (nodeCount === 0) return;

    // ─── Iterative MNA with LED polarity check ───
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    // LEDs are modeled as Vf voltage sources, but a reverse-biased LED should
    // be an open circuit. We solve, check LED currents, exclude reverse-biased
    // LEDs (negative current), and re-solve until convergence (max 3 passes).
    const excludedLEDs = new Set(); // LED compIds excluded as reverse-biased

    for (let mnaPass = 0; mnaPass < 3; mnaPass++) {
      // Step 2: Collect voltage sources for MNA extension
      const voltageSources = [];
      this.components.forEach((comp, id) => {
        if (comp.type === 'battery9v' && comp.state.connected) {
          const posRef = `${id}:positive`;
          const negRef = `${id}:negative`;
          if (this._pinRefs.has(posRef) && this._pinRefs.has(negRef)) {
            voltageSources.push({
              compId: id,
              posNet: this._uf.find(posRef),
              negNet: this._uf.find(negRef),
              voltage: comp.state.voltage || 9,
            });
          }
        }
        if (comp.type === 'nano-r4') {
          const v5Ref = `${id}:5V`;
          const gndRef = `${id}:GND`;
          if (this._pinRefs.has(v5Ref) && this._pinRefs.has(gndRef)) {
            voltageSources.push({
              compId: `${id}_5V`,
              posNet: this._uf.find(v5Ref),
              negNet: this._uf.find(gndRef),
              voltage: 5,
            });
          }
          const v33Ref = `${id}:3V3`;
          if (this._pinRefs.has(v33Ref) && this._pinRefs.has(gndRef)) {
            voltageSources.push({
              compId: `${id}_3V3`,
              posNet: this._uf.find(v33Ref),
              negNet: this._uf.find(gndRef),
              voltage: 3.3,
            });
          }

          // Arduino Digital Pins as MNA Voltage Sources
          if (comp.state && comp.state.pinStates && comp.state.pinModes) {
            for (let i = 0; i <= 13; i++) {
              const pinRef = `${id}:D${i}`;
              if (!this._pinRefs.has(pinRef)) continue;

              // keys in _modes are 0..13 (digital) and A0..A7 (analog)
              const mode = comp.state.pinModes[i];
              // avr8js.PinState: 0=Low, 1=High, 2=Input, 3=InputPullUp
              if (mode === 0 || mode === 1 || mode === 3) { // OUTPUT LOW, OUTPUT HIGH, INPUT_PULLUP
                const val = comp.state.pinStates[`D${i}`] > 0;

                let pwmDuty = null;
                if (comp.state.pinStates._pwm && comp.state.pinStates._pwm[i] !== undefined) {
                  pwmDuty = comp.state.pinStates._pwm[i];
                }

                let voltage = 0.0;
                if (pwmDuty !== null && (mode === 0 || mode === 1)) {
                  voltage = pwmDuty * 5.0; // PWM effective voltage
                } else {
                  voltage = (val || mode === 3) ? 5.0 : 0.0;
                }

                const internalR = mode === 3 ? 30000 : 0; // 30k internal pullup resistor

                voltageSources.push({
                  compId: `${id}_D${i}`,
                  posNet: this._uf.find(pinRef),
                  negNet: this._uf.find(gndRef),
                  voltage: voltage,
                  internalR: internalR
                });
              }
            }
          }
        }
        // LED modeled as Vf voltage source + forward resistance
        // BUG FIX: Skip reverse-biased LEDs (excluded in previous pass)
        if (comp.type === 'led' && !excludedLEDs.has(id)) {
          const anodeRef = `${id}:anode`;
          const cathodeRef = `${id}:cathode`;
          if (this._pinRefs.has(anodeRef) && this._pinRefs.has(cathodeRef)) {
            const anodeNet = this._uf.find(anodeRef);
            const cathodeNet = this._uf.find(cathodeRef);
            if (anodeNet !== cathodeNet) {
              const vf = LED_VF[comp.color] || 2.0;
              voltageSources.push({
                compId: id,
                posNet: anodeNet,
                negNet: cathodeNet,
                voltage: vf,
                isLED: true,
                ledForwardR: 20, // ~20Ω forward resistance
              });
            }
          }
        }
      });

      const vsCount = voltageSources.length;
      const matSize = nodeCount + vsCount;

      // Step 3: Build MNA matrix A and RHS vector b
      const A = Array.from({ length: matSize }, () => new Float64Array(matSize));
      const b = new Float64Array(matSize);

      // Helper: stamp conductance between two nets
      const stampConductance = (netA, netB, g) => {
        const iA = netToIndex.get(netA);
        const iB = netToIndex.get(netB);
        if (iA !== undefined) A[iA][iA] += g;
        if (iB !== undefined) A[iB][iB] += g;
        if (iA !== undefined && iB !== undefined) {
          A[iA][iB] -= g;
          A[iB][iA] -= g;
        }
      };

      // Step 4: Stamp resistive components
      this.components.forEach((comp, id) => {
        const R = this._getMNAResistance(id, comp);
        if (R === null || R <= 0) return;

        // LED resistance is stamped along with its voltage source
        if (comp.type === 'led') return;

        const pins = this._getMNAPins(id, comp);
        if (!pins) return;
        const [pinA, pinB] = pins;
        if (!this._pinRefs.has(pinA) || !this._pinRefs.has(pinB)) return;

        const netA = this._uf.find(pinA);
        const netB = this._uf.find(pinB);
        if (netA === netB) return;

        stampConductance(netA, netB, 1 / R);
      });

      // Stamp potentiometer as two resistors (vcc-signal and signal-gnd)
      this.components.forEach((comp, id) => {
        if (comp.type !== 'potentiometer') return;
        const maxR = comp.value || 10000;
        const pos = comp.state.position != null ? comp.state.position : 0.5;
        const rTop = (1 - pos) * maxR;
        const rBot = pos * maxR;

        const vccRef = `${id}:vcc`;
        const sigRef = `${id}:signal`;
        const gndRef = `${id}:gnd`;

        if (this._pinRefs.has(vccRef) && this._pinRefs.has(sigRef) && rTop > 0.001) {
          stampConductance(this._uf.find(vccRef), this._uf.find(sigRef), 1 / rTop);
        }
        if (this._pinRefs.has(sigRef) && this._pinRefs.has(gndRef) && rBot > 0.001) {
          stampConductance(this._uf.find(sigRef), this._uf.find(gndRef), 1 / rBot);
        }
      });

      // Step 5: Stamp voltage sources (batteries, Nano, LEDs with Vf)
      for (let v = 0; v < vsCount; v++) {
        const vs = voltageSources[v];
        const vsRow = nodeCount + v;
        const iPosNet = netToIndex.get(vs.posNet);
        const iNegNet = netToIndex.get(vs.negNet);

        if (iPosNet !== undefined) {
          A[iPosNet][vsRow] += 1;
          A[vsRow][iPosNet] += 1;
        }
        if (iNegNet !== undefined) {
          A[iNegNet][vsRow] -= 1;
          A[vsRow][iNegNet] -= 1;
        }

        if (vs.isLED && vs.ledForwardR > 0) {
          A[vsRow][vsRow] -= vs.ledForwardR;
        }

        if (vs.internalR > 0) {
          A[vsRow][vsRow] -= vs.internalR;
        }

        b[vsRow] = vs.voltage;
      }

      // Step 6: Solve the system using Gaussian elimination with partial pivoting
      const x = this._gaussianElimination(A, b, matSize);
      if (!x) return; // Singular matrix

      // Step 7: Extract node voltages
      this._mnaNodeVoltages = new Map();
      for (let i = 0; i < nodeCount; i++) {
        this._mnaNodeVoltages.set(indexToNet[i], x[i]);
      }
      this._mnaNodeVoltages.set(groundNet, 0);

      // Step 8: Extract branch currents from voltage sources
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      this._mnaBranchCurrents = new Map();
      for (let v = 0; v < vsCount; v++) {
        const vs = voltageSources[v];
        this._mnaBranchCurrents.set(vs.compId, x[nodeCount + v]);
      }

      // Step 9: LED polarity check — exclude reverse-biased LEDs and re-solve
      // A reverse-biased LED has negative branch current (MNA convention:
      // positive current flows from posNet to negNet, i.e. anode to cathode).
      let needReSolve = false;
      for (let v = 0; v < vsCount; v++) {
        const vs = voltageSources[v];
        if (!vs.isLED) continue;
        const current = x[nodeCount + v];
        if (current < -1e-9) {
          // Reverse-biased: current flows cathode→anode, LED should be open circuit
          excludedLEDs.add(vs.compId);
          needReSolve = true;
        }
      }

      // If no LEDs were newly excluded, the solution has converged
      if (!needReSolve) break;
    } // end mnaPass loop

    // Set branch current to 0 for excluded (reverse-biased) LEDs
    for (const ledId of excludedLEDs) {
      this._mnaBranchCurrents.set(ledId, 0);
    }
  }

  /**
   * Gaussian elimination with partial pivoting.
   * Solves Ax = b in-place. Returns solution vector x or null if singular.
   * @param {Float64Array[]} A - matrix (array of Float64Array rows)
   * @param {Float64Array} b - RHS vector
   * @param {number} n - size
   * @returns {Float64Array|null}
   */
  _gaussianElimination(A, b, n) {
    // CoVe Fix #7: Aggiunto scaling e migliorato check singolarità
    // Per prevenire NaN in circuiti con resistenze estreme (1Ω || 1MΩ)

    // Compute row scaling factors (max absolute value in each row)
    const rowScale = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let maxRowVal = 0;
      for (let j = 0; j < n; j++) {
        maxRowVal = Math.max(maxRowVal, Math.abs(A[i][j]));
      }
      rowScale[i] = maxRowVal > 0 ? maxRowVal : 1;
    }

    // Augment: copy A and b into augmented matrix for in-place solve
    const aug = Array.from({ length: n }, (_, i) => {
      const row = new Float64Array(n + 1);
      for (let j = 0; j < n; j++) row[j] = A[i][j] / rowScale[i]; // Scale rows
      row[n] = b[i] / rowScale[i];
      return row;
    });

    // Forward elimination with partial pivoting
    for (let col = 0; col < n; col++) {
      // Find pivot (largest absolute value in column)
      let maxVal = Math.abs(aug[col][col]);
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        const val = Math.abs(aug[row][col]);
        if (val > maxVal) { maxVal = val; maxRow = row; }
      }

      // CoVe Fix #7: Soglia adattiva basata sulla dimensione della matrice
      // e precisione macchina (evita false positive con matrici grandi)
      const tolerance = 1e-12 * Math.max(1, n);
      if (maxVal < tolerance) continue; // Skip near-zero pivot (singular column)

      // Swap rows
      if (maxRow !== col) {
        const tmp = aug[col];
        aug[col] = aug[maxRow];
        aug[maxRow] = tmp;
      }

      // Eliminate below
      const pivotVal = aug[col][col];
      for (let row = col + 1; row < n; row++) {
        const factor = aug[row][col] / pivotVal;
        if (factor === 0) continue;
        for (let j = col; j <= n; j++) {
          aug[row][j] -= factor * aug[col][j];
        }
      }
    }

    // Back substitution
    const x = new Float64Array(n);
    const backTolerance = 1e-12 * Math.max(1, n);
    for (let row = n - 1; row >= 0; row--) {
      if (Math.abs(aug[row][row]) < backTolerance) {
        x[row] = 0; // Free variable (singular)
        continue;
      }
      let sum = aug[row][n];
      for (let j = row + 1; j < n; j++) {
        sum -= aug[row][j] * x[j];
      }
      x[row] = sum / aug[row][row];

      // CoVe Fix #7: Check per NaN/Infinity
      if (!Number.isFinite(x[row])) {
        x[row] = 0; // Fallback a 0 se risultato invalido
      }
    }

    return x;
  }

  /**
   * Get node voltage from MNA results for a given pin ref.
   * Falls back to 0 for ground or unknown nets.
   */
  _getMNAVoltage(pinRef) {
    if (!this._mnaNodeVoltages || !this._pinRefs.has(pinRef)) return null;
    const net = this._uf.find(pinRef);
    if (!this._mnaNodeVoltages.has(net)) return null;
    return this._mnaNodeVoltages.get(net);
  }

  /**
   * Get the best resolved voltage for a node (MNA, or Path-Tracing, or null if floating).
   * Used for interfacing with Arduino GPIO to ensure INPUT_PULLUP works for floating nets.
   */
  getNodeVoltage(pinRef) {
    if (!this._pinRefs.has(pinRef)) return null;

    // First try MNA if available
    const mnaV = this._getMNAVoltage(pinRef);
    if (mnaV !== null) return mnaV;

    // Fall back to path-tracing to see if it's connected to 5V or GND
    const directV = this._netVoltage(pinRef);
    if (directV !== null) return directV;

    const trace = this._traceToSupply(pinRef);
    if (trace) return trace.voltage;

    // Pin is truly floating
    return null;
  }

  // ─── Solve All Load Components ───

  _solveAllLoads(isTimeStep) {
    // Determine if MNA should be used (parallel paths detected)
    const useMNA = this._hasParallelPaths();

    if (useMNA) {
      this._solveMNA();
    } else {
      this._mnaNodeVoltages = null;
      this._mnaBranchCurrents = null;
    }

    this.components.forEach((comp, id) => {
      switch (comp.type) {
        case 'led': this._solveLED(id, comp); break;
        case 'rgb-led': this._solveRGBLed(id, comp); break;
        case 'buzzer-piezo': this._solveBuzzer(id, comp); break;
        case 'motor-dc': this._solveMotor(id, comp); break;
        case 'mosfet-n': this._solveMOSFET(id, comp, isTimeStep); break;
        case 'diode': this._solveDiode(id, comp); break;
        case 'capacitor': this._solveCapacitor(id, comp, isTimeStep); break;
        case 'resistor': this._solveResistor(id, comp); break;
        case 'potentiometer': this._solvePotentiometer(id, comp); break;
        case 'multimeter': this._solveMultimeter(id, comp); break;
        case 'phototransistor': this._solvePhototransistor(id, comp); break;
      }
    });
  }

  _solveLED(id, comp) {
    // Both MNA and path-tracer use the same 20mA burn threshold for consistency.
    const LED_BURN_CURRENT = 0.03; // 30mA — burn threshold for standard LEDs (rated 20mA continuous, burns above ~30mA)

    // If MNA is available, use its branch current for this LED
    if (this._mnaBranchCurrents && this._mnaBranchCurrents.has(id)) {
      const current = this._mnaBranchCurrents.get(id);
      const vf = LED_VF[comp.color] || 2.0;

      if (current > 0.0001) { // >0.1mA threshold
        comp.state.voltage = vf;

        // BUG FIX (BUG-E-06): Burn detection aligned with MNA results.
        // Use MNA-computed current directly (not path-tracer heuristic).
        // Burn threshold: >20mA (consistent for both MNA and path-tracer).
        if (current > LED_BURN_CURRENT) {
          comp.state.burned = true;
          comp.state.brightness = 0;
          comp.state.on = false;
          comp.state.current = current;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          // Ensure voltage reflects forward drop even if burned
          comp.state.voltage = vf;
        } else {
          comp.state.burned = false;
          comp.state.on = true;
          comp.state.brightness = Math.min(1, current / LED_BURN_CURRENT);
          comp.state.current = current;
        }
        return;
      }

      // MNA says current ≤ 0 — but dynamic supplies (e.g. charged capacitor) are NOT
      // modeled by MNA. If any dynamic supply is active, fall through to the path-tracer
      // which DOES see capacitor voltages via _supplyNets injection.
      if (this._dynamicSupplies.size === 0) {
        this._ledOff(comp);
        return;
      }
      // Fall through to path-tracer below — dynamic supply may power this LED
    }

    // Fallback: path-tracer (for simple series circuits)
    // Trace from anode to supply (high side)
    const anodeTrace = this._traceToSupply(`${id}:anode`, id);
    // Trace from cathode to supply (low side)
    const cathodeTrace = this._traceToSupply(`${id}:cathode`, id);

    if (!anodeTrace || !cathodeTrace) {
      this._ledOff(comp);
      return;
    }

    const vHigh = anodeTrace.voltage;
    const vLow = cathodeTrace.voltage;
    const totalR = anodeTrace.resistance + cathodeTrace.resistance;
    const vf = LED_VF[comp.color] || 2.0;

    // BUG FIX: Subtract voltage drops from OTHER LEDs/diodes in the path.
    // When LEDs are in series, the path from this LED's anode to supply may
    // traverse other LEDs, each consuming their Vf. Without this, each LED
    // sees full supply voltage and overestimates current by 33-66%.
    const pathVDrop = (anodeTrace.vDrop || 0) + (cathodeTrace.vDrop || 0);
    const vDiff = vHigh - vLow - pathVDrop;

    if (vDiff >= vf) {
      if (totalR > 0) {
        const current = (vDiff - vf) / totalR;
        comp.state.voltage = vf;
        // BUG FIX (BUG-E-06): Use same current-based burn threshold as MNA path
        if (current > LED_BURN_CURRENT) {
          comp.state.burned = true;
          comp.state.brightness = 0;
          comp.state.on = false;
          comp.state.current = current;
        } else {
          comp.state.burned = false;
          comp.state.on = true;
          comp.state.brightness = Math.min(1, current / LED_BURN_CURRENT);
          comp.state.current = Math.max(0, current);
        }
      } else {
        // No resistor — current is effectively unlimited, LED always burns
        // BUG FIX (BUG-E-06): Replaced voltage heuristic (vDiff > vf + 2)
        // with consistent behavior: no resistor = burn (same logic as MNA)
        comp.state.burned = true;
        comp.state.brightness = 0;
        comp.state.on = false;
        comp.state.current = 0.999; // Indicate excessive current
        comp.state.voltage = vf;
      }
    } else {
      this._ledOff(comp);
    }
  }

  _ledOff(comp) {
    comp.state.on = false;
    comp.state.brightness = 0;
    comp.state.current = 0;
    comp.state.voltage = 0;
    // BUG FIX: Don't clear burned flag — once burned, stays burned until reset
    // comp.state.burned is preserved
  }

  _solveRGBLed(id, comp) {
    const channels = ['red', 'green', 'blue'];
    const commonTrace = this._traceToSupply(`${id}:common`, id);

    channels.forEach(ch => {
      const pinTrace = this._traceToSupply(`${id}:${ch}`, id);

      if (!pinTrace || !commonTrace) {
        comp.state[ch] = { on: false, brightness: 0 };
        return;
      }

      // BUG FIX: Determine polarity dynamically — don't assume color pin is always high side
      const vPin = pinTrace.voltage;
      const vCommon = commonTrace.voltage;
      const vHigh = Math.max(vPin, vCommon);
      const vLow = Math.min(vPin, vCommon);
      const totalR = pinTrace.resistance + commonTrace.resistance;
      const vf = LED_VF[ch] || 2.0;
      // BUG FIX: Subtract voltage drops from other LEDs/diodes in the path
      const pathVDrop = (pinTrace.vDrop || 0) + (commonTrace.vDrop || 0);
      const vDiff = vHigh - vLow - pathVDrop;

      if (vDiff >= vf && totalR > 0) {
        const current = (vDiff - vf) / totalR;
        const clamped = Math.min(0.04, Math.max(0, current));
        comp.state[ch] = { on: true, brightness: Math.min(1, clamped / 0.03) };
      } else {
        comp.state[ch] = { on: false, brightness: 0 };
      }
    });

    comp.state.on = comp.state.red.on || comp.state.green.on || comp.state.blue.on;
  }

  _solveBuzzer(id, comp) {
    if (this._mnaNodeVoltages) {
      const vPos = this._getMNAVoltage(`${id}:positive`);
      const vNeg = this._getMNAVoltage(`${id}:negative`);
      const vAcross = Math.abs(vPos - vNeg);
      comp.state.on = vAcross > 2.0;
      comp.state.frequency = comp.state.on ? 2000 : 0;
      return;
    }

    const posTrace = this._traceToSupply(`${id}:positive`, id);
    const negTrace = this._traceToSupply(`${id}:negative`, id);

    if (posTrace && negTrace) {
      const vAcross = Math.abs(posTrace.voltage - negTrace.voltage);
      comp.state.on = vAcross > 2.0;
      comp.state.frequency = comp.state.on ? 2000 : 0;
    } else {
      comp.state.on = false;
      comp.state.frequency = 0;
    }
  }

  _solveMotor(id, comp) {
    if (this._mnaNodeVoltages) {
      const vPos = this._getMNAVoltage(`${id}:positive`);
      const vNeg = this._getMNAVoltage(`${id}:negative`);
      const vAcross = Math.abs(vPos - vNeg);
      comp.state.on = vAcross > 1.5;
      comp.state.speed = comp.state.on ? Math.min(1, vAcross / 9) : 0;
      comp.state.direction = (vPos - vNeg) >= 0 ? 1 : -1;
      return;
    }

    const posTrace = this._traceToSupply(`${id}:positive`, id);
    const negTrace = this._traceToSupply(`${id}:negative`, id);

    if (posTrace && negTrace) {
      const vPos = posTrace.voltage;
      const vNeg = negTrace.voltage;
      const vAcross = Math.abs(vPos - vNeg);
      comp.state.on = vAcross > 1.5;
      comp.state.speed = comp.state.on ? Math.min(1, vAcross / 9) : 0;
      comp.state.direction = (vPos - vNeg) >= 0 ? 1 : -1;
    } else {
      comp.state.on = false;
      comp.state.speed = 0;
    }
  }

  _solveMOSFET(id, comp, isTimeStep) {
    // Skip voltage-based solve if gate is manually touched (floating gate experiment)
    if (comp.state.gateTouched) return;

    // Gate voltage: direct net voltage or trace to supply
    const gateTrace = this._traceToSupply(`${id}:gate`, id);
    let gateV = 0;

    // Fix: If gate is floating (no path to supply/ground), simulate discharge
    if (!gateTrace && !comp.state.gateTouched) {
      // Weak pull-down to simulate leakage (discharge gate capacitance)
      // If it was previously charged, decay it
      if (comp.state.vgs > 0.01) {
        if (isTimeStep) comp.state.vgs *= 0.9; // Fast decay per frame
      } else {
        comp.state.vgs = 0;
      }
      // Recalculate gateV for display if needed, though Vgs is the driver
      gateV = comp.state.vgs;
    } else {
      gateV = this._mnaNodeVoltages ? this._getMNAVoltage(`${id}:gate`) : this._pinSupplyVoltage(`${id}:gate`, id);
    }

    // Source voltage
    const sourceV = this._mnaNodeVoltages ? this._getMNAVoltage(`${id}:source`) : this._pinSupplyVoltage(`${id}:source`, id);

    // If gate is driven, use proper Vgs
    if (gateTrace || comp.state.gateTouched) {
      comp.state.vgs = gateV - sourceV;
    }

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    comp.state.on = comp.state.vgs >= MOSFET_VGS_THRESHOLD;

    if (comp.state.on) {
      const drainV = this._mnaNodeVoltages ? this._getMNAVoltage(`${id}:drain`) : this._pinSupplyVoltage(`${id}:drain`, id);
      comp.state.ids = Math.abs(drainV - sourceV) / (comp.state.rds || 0.1);
    } else {
      comp.state.ids = 0;
    }
  }

  _solveDiode(id, comp) {
    const anodeTrace = this._traceToSupply(`${id}:anode`, id);
    const cathodeTrace = this._traceToSupply(`${id}:cathode`, id);
    const anodeV = anodeTrace ? anodeTrace.voltage : 0;
    const cathodeV = cathodeTrace ? cathodeTrace.voltage : 0;
    // Subtract voltage drops from other components in the path
    const pathVDrop = (anodeTrace ? anodeTrace.vDrop || 0 : 0) + (cathodeTrace ? cathodeTrace.vDrop || 0 : 0);
    const effectiveVDiff = anodeV - cathodeV - pathVDrop;
    comp.state.conducting = effectiveVDiff >= DIODE_VF;
    const totalR = (anodeTrace ? anodeTrace.resistance : 0) + (cathodeTrace ? cathodeTrace.resistance : 0);
    const effectiveR = totalR > 0 ? totalR : 10; // fallback to 10Ω if no resistance found
    comp.state.current = comp.state.conducting
      ? Math.max(0, (effectiveVDiff - DIODE_VF) / effectiveR)
      : 0;
  }

  _solveCapacitor(id, comp, isTimeStep) {
    const posPinRef = `${id}:positive`;
    const negPinRef = `${id}:negative`;

    let posTrace = this._traceToSupply(posPinRef, id);
    const negTrace = this._traceToSupply(negPinRef, id);

    // ─── Self-reference safety net ───
    // _traceToSupply now skips the early-exit when the start net's supply is the cap's
    // own dynamic supply (see the isSelfSupply check there). This safety net catches any
    // residual self-reference: if posTrace returns with R=0 and voltage matching the cap's
    // own dynamic supply, it's the cap seeing itself — nullify it.
    // With the _traceToSupply fix, this should rarely trigger, but keeps correctness.
    const ownDynV = this._dynamicSupplies.get(posPinRef);
    if (posTrace && ownDynV != null && posTrace.resistance === 0
        && Math.abs(posTrace.voltage - ownDynV) < 0.01) {
      posTrace = null;
    }

    // Determine if the capacitor is connected to a complete circuit
    const posConnected = posTrace !== null;
    const negConnected = negTrace !== null;
    const bothConnected = posConnected && negConnected;

    const posV = posTrace ? posTrace.voltage : 0;
    const negV = negTrace ? negTrace.voltage : 0;
    const posR = posTrace ? posTrace.resistance : 0;
    const negR = negTrace ? negTrace.resistance : 0;

    // Smart unit detection: PropertiesPanel sends µF (e.g. 100 = 100µF),
    // old experiments also store in µF. Values < 0.001 are already in Farads.
    const rawVal = comp.value || 100;
    const C = rawVal < 0.001 ? rawVal : rawVal * 1e-6; // capacitance in Farads
    const currentV = comp.state.voltage || 0;
    const MIN_EDUCATIONAL_TAU = 0.3; // 0.3 seconds visible charge animation

    if (bothConnected) {
      // ─── CHARGING / DISCHARGING (connected to external supply) ───
      // Target voltage = supply voltage difference across capacitor
      const vSource = posV - negV;
      // Force a minimum resistance to prevent divide-by-zero or instantaneous infinite current.
      // This represents internal wire/battery resistance in "ideal" shorts.
      const R = Math.max((posR + negR), 0.1);
      // Educational minimum tau: when R is very low (cap directly on battery),
      // enforce a minimum tau so kids can see the charge/discharge animation.
      // Real tau stays if R provides enough natural delay.
      const tau = Math.max(R * C, MIN_EDUCATIONAL_TAU);

      if (tau > 0) {
        // Use actual dt for time stepping (RC transient model)
        // V(t+dt) = V(t) + (Vtarget - V(t)) * (1 - e^(-dt/tau))
        const dt = isTimeStep ? this.dt : 0;
        const alpha = dt > 0 ? (1 - Math.exp(-dt / tau)) : 0;
        const newV = currentV + (vSource - currentV) * alpha;
        comp.state.voltage = newV;
        if (dt > 0) {
          comp.state.current = C * (newV - currentV) / dt; // I = C * dV/dt
        }
        comp.state.charge = newV * C;
        comp.state.tau = tau; // expose tau for UI display
        comp.state.targetVoltage = vSource;
        // Charge percentage relative to typical maximum (9V) for visual animation
        const MAX_TYPICAL_V = 9.0;
        comp.state.chargePercent = Math.min(1, Math.abs(newV / MAX_TYPICAL_V));

        // Charging or discharging? (Comparing current to target with a small tolerance)
        comp.state.charging = Math.abs(vSource) > Math.abs(currentV) + 0.05;
      }
    } else if (!posConnected && !negConnected) {
      // ─── ISOLATED (disconnected from circuit) ───
      // Capacitor holds its charge (ideal capacitor, no leakage)
      comp.state.current = 0;
      // In reality there's a tiny leakage, simulate very slow discharge
      // Self-discharge tau ~1000s (electrolytic capacitor leakage)
      if (Math.abs(currentV) > 0.001) {
        const leakageTau = 1000;
        const dt = isTimeStep ? this.dt : 0;
        const alpha = dt > 0 ? (1 - Math.exp(-dt / leakageTau)) : 0;
        comp.state.voltage = currentV * (1 - alpha);
        comp.state.charge = comp.state.voltage * C;
        comp.state.chargePercent = Math.min(1, Math.abs(comp.state.voltage / 9));
      }
      comp.state.charging = false;
    } else {
      // ─── PARTIALLY CONNECTED (one terminal floating) ───
      // Use actual circuit resistance between cap terminals for proper discharge tau.
      // This enables the LED to fade when cap discharges through LED+resistor.
      const R_circuit = this._measureResistanceBetweenNets(posPinRef, negPinRef, id);
      const R_discharge = R_circuit < Infinity
        ? Math.max(R_circuit, 0.1)
        : ((posR + negR) > 0 ? (posR + negR) : 10000);
      const tau = Math.max(R_discharge * C, MIN_EDUCATIONAL_TAU);
      if (tau > 0 && Math.abs(currentV) > 0.001) {
        const dt = isTimeStep ? this.dt : 0;
        const alpha = dt > 0 ? (1 - Math.exp(-dt / tau)) : 0;
        const newV = currentV * (1 - alpha);
        comp.state.voltage = newV;
        if (dt > 0) {
          comp.state.current = C * (newV - currentV) / dt;
        }
        comp.state.charge = newV * C;
        comp.state.tau = tau;
        comp.state.targetVoltage = 0;
        comp.state.chargePercent = Math.min(1, Math.abs(newV / 9));
      }
      comp.state.charging = false;
    }
  }

  _solveResistor(id, comp) {
    // Use MNA voltages when available for accurate parallel circuit results
    if (this._mnaNodeVoltages) {
      const v1 = this._getMNAVoltage(`${id}:pin1`);
      const v2 = this._getMNAVoltage(`${id}:pin2`);
      const vDrop = Math.abs(v1 - v2);
      const R = comp.value || 470;
      comp.state.current = R > 0 ? vDrop / R : 0;
      comp.state.voltage = vDrop;
      return;
    }

    const v1 = this._pinSupplyVoltage(`${id}:pin1`, id);
    const v2 = this._pinSupplyVoltage(`${id}:pin2`, id);
    const vDrop = Math.abs(v1 - v2);
    const R = comp.value || 470;
    comp.state.current = R > 0 ? vDrop / R : 0;
    comp.state.voltage = vDrop;
  }

  _solvePotentiometer(id, comp) {
    const maxR = comp.value || 10000;
    comp.state.resistance = maxR * comp.state.position;

    // Solve voltage divider: vcc to gnd are the ends, signal is the wiper
    const vccTrace = this._traceToSupply(`${id}:vcc`, id);
    const gndTrace = this._traceToSupply(`${id}:gnd`, id);
    const vVcc = vccTrace ? vccTrace.voltage : 0;
    const vGnd = gndTrace ? gndTrace.voltage : 0;

    // BUG FIX (BUG-E-04): Handle reversed polarity.
    // "position" represents the wiper fraction from gnd toward vcc.
    // In normal polarity (vVcc > vGnd), signal = vGnd + (vVcc - vGnd) * position.
    // In reversed polarity (vGnd > vVcc), the physical wiper still moves the same way
    // on the resistive track, but the voltage endpoints are swapped, so:
    // signal = vVcc + (vGnd - vVcc) * (1 - position) = vGnd + (vVcc - vGnd) * position.
    // Simplified: always interpolate from vGnd to vVcc using position directly,
    // which correctly handles both polarities without needing Math.max/min.
    comp.state.signalVoltage = vGnd + (vVcc - vGnd) * comp.state.position;
    // Note: _collectDynamicSupplies() will store the signalVoltage by pinRef
    // and _injectDynamicSupplies() will add it to _supplyNets on the next iteration
  }

  /**
   * Check if a capacitor's terminals span the same nets as the multimeter probes.
   * If so, return the capacitor's transient state.voltage instead of the static
   * supply voltage — this makes the charging/discharging animation visible.
   * Returns { voltage } or null if no capacitor found across probes.
   */
  _findCapacitorAcrossProbes(posPinRef, negPinRef, multimeterId) {
    const posNet = this._uf.find(posPinRef);
    const negNet = this._uf.find(negPinRef);
    if (posNet === negNet) return null; // Same net — no voltage to measure

    for (const [cId, comp] of this.components) {
      if (comp.type !== 'capacitor' || cId === multimeterId) continue;
      const capPosRef = `${cId}:positive`;
      const capNegRef = `${cId}:negative`;
      if (!this._pinRefs.has(capPosRef) || !this._pinRefs.has(capNegRef)) continue;

      const capPosNet = this._uf.find(capPosRef);
      const capNegNet = this._uf.find(capNegRef);

      // Check both orientations: probes may be connected either way
      if ((capPosNet === posNet && capNegNet === negNet) ||
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        (capPosNet === negNet && capNegNet === posNet)) {
        const v = comp.state.voltage || 0;
        // Match polarity: if cap-positive is on probe-positive net, use as-is
        const sign = (capPosNet === posNet) ? 1 : -1;
        return { voltage: v * sign };
      }
    }
    return null;
  }

  _solveMultimeter(id, comp) {
    // Preserve user-selected mode (don't overwrite)
    const mode = comp.state.mode || 'voltage';

    // Use dragged probe connections if available, otherwise fixed pin refs
    const probeConns = this._probeConnections[id];
    const posPinRef = (probeConns && probeConns.positive) || `${id}:probe-positive`;
    const negPinRef = (probeConns && probeConns.negative) || `${id}:probe-negative`;

    if (mode === 'voltage') {
      // First check: is there a capacitor across the probes?
      // If yes, use its transient voltage for visible charge/discharge animation.
      const capResult = this._findCapacitorAcrossProbes(posPinRef, negPinRef, id);
      if (capResult !== null) {
        comp.state.reading = Math.abs(capResult.voltage);
      } else if (this._mnaNodeVoltages) {
        const posV = this._getMNAVoltage(posPinRef);
        const negV = this._getMNAVoltage(negPinRef);
        comp.state.reading = Math.abs(posV - negV);
      } else {
        const posTrace = this._traceToSupply(posPinRef, id);
        const negTrace = this._traceToSupply(negPinRef, id);
        const posV = posTrace ? posTrace.voltage : (this._netVoltage(posPinRef) || 0);
        const negV = negTrace ? negTrace.voltage : (this._netVoltage(negPinRef) || 0);
        comp.state.reading = Math.abs(posV - negV);
      }
    } else if (mode === 'resistance') {
      // Ohm mode: measure resistance between probes.
      // MNA approach: inject a virtual 1mA test current through probes, measure voltage → R=V/I
      // But since full injection changes the circuit, use the simpler approach:
      // sum all resistances in paths between the two probe nets (excluding the multimeter itself).
      if (this._mnaNodeVoltages) {
        // With MNA: V across probes / I through multimeter
        // Multimeter is stamped as 1MΩ, so I = V/1MΩ → R_measured = V/I - 1MΩ ≈ V/I for small R
        // Better approach: trace resistive paths between probe nets excluding multimeter
        const posNet = this._uf.find(posPinRef);
        const negNet = this._uf.find(negPinRef);
        if (posNet === negNet) {
          comp.state.reading = 0; // Same net = 0Ω
        } else {
          // Use path-tracer from pos probe net to neg probe net, excluding multimeter
          // This gives us the series resistance of the path between probes
          const resistance = this._measureResistanceBetweenNets(posPinRef, negPinRef, id);
          comp.state.reading = resistance;
        }
      } else {
        // Path-tracer: trace from both probes to see what they share
        const posTrace = this._traceToSupply(posPinRef, id);
        const negTrace = this._traceToSupply(negPinRef, id);
        // The resistance between probes is the sum of the two paths'
        // resistances to a common node minus any supply path resistance.
        // For direct measurement across a component: this approximation works.
        const resistance = this._measureResistanceBetweenNets(posPinRef, negPinRef, id);
        comp.state.reading = resistance;
      }
    } else if (mode === 'current') {
      // Ampere mode: probes must be in series (inserted into circuit path).
      // The current through the multimeter = current through the probes' shared path.
      if (this._mnaNodeVoltages) {
        // MNA: multimeter is stamped as 1MΩ resistor.
        // Current through it = |V_pos - V_neg| / R_multimeter
        const posV = this._getMNAVoltage(posPinRef);
        const negV = this._getMNAVoltage(negPinRef);
        const vAcross = Math.abs(posV - negV);
        // In current mode, ideal ammeter has ~0Ω. We approximate by computing
        // the current that would flow if multimeter were replaced with a wire.
        // Use circuit topology: find total resistance in the path (excluding multimeter)
        // then I = V_supply / R_total
        const posTrace = this._traceToSupply(posPinRef, id);
        const negTrace = this._traceToSupply(negPinRef, id);
        if (posTrace && negTrace) {
          const totalV = Math.abs(posTrace.voltage - negTrace.voltage);
          const totalR = posTrace.resistance + negTrace.resistance;
          // Subtract path voltage drops (LEDs/diodes in series)
          const pathVDrop = (posTrace.vDrop || 0) + (negTrace.vDrop || 0);
          const effectiveV = totalV - pathVDrop;
          const current = totalR > 0.001 ? effectiveV / totalR : 0;
          comp.state.reading = Math.abs(current) * 1000; // mA
        } else {
          comp.state.reading = 0;
        }
      } else {
        // Path-tracer fallback
        const posTrace = this._traceToSupply(posPinRef, id);
        const negTrace = this._traceToSupply(negPinRef, id);
        if (posTrace && negTrace) {
          const totalV = Math.abs(posTrace.voltage - negTrace.voltage);
          const totalR = posTrace.resistance + negTrace.resistance;
          const pathVDrop = (posTrace.vDrop || 0) + (negTrace.vDrop || 0);
          const effectiveV = totalV - pathVDrop;
          const current = totalR > 0.001 ? effectiveV / totalR : 0;
          comp.state.reading = Math.abs(current) * 1000; // mA
        } else {
          comp.state.reading = 0;
        }
      }
    }

    comp.state.mode = mode;
  }

  /**
   * Measure resistance between two probe pin refs by tracing through the circuit.
   * Excludes the specified component (multimeter) from the traversal.
   * Uses a BFS/path-trace from one probe's net to the other, accumulating resistance.
   */
  _measureResistanceBetweenNets(pinRefA, pinRefB, excludeCompId) {
    if (!this._pinRefs.has(pinRefA) || !this._pinRefs.has(pinRefB)) return 0;

    const startNet = this._uf.find(pinRefA);
    const targetNet = this._uf.find(pinRefB);

    if (startNet === targetNet) return 0; // Same net = 0Ω

    // BFS to find path from startNet to targetNet through resistive components
    const visited = new Map(); // net → best resistance to reach it
    const queue = [{ net: startNet, totalR: 0, usedComps: new Set() }];
    visited.set(startNet, 0);

    while (queue.length > 0) {
      queue.sort((a, b) => a.totalR - b.totalR);
      const { net, totalR, usedComps } = queue.shift();

      // Find all pins in this net
      for (const pinRef of this._pinRefs) {
        if (this._uf.find(pinRef) !== net) continue;

        const info = this._pinToComp.get(pinRef);
        if (!info) continue;
        if (info.compId === excludeCompId) continue;
        if (usedComps.has(info.compId)) continue;

        const comp = this.components.get(info.compId);
        if (!comp) continue;

        const otherPin = this._getOtherPin(info.compId, comp, info.pinName);
        if (!otherPin) continue;

        const otherPinRef = `${info.compId}:${otherPin}`;
        if (!this._pinRefs.has(otherPinRef)) continue;

        const otherNet = this._uf.find(otherPinRef);
        const compR = this._getComponentResistance(info.compId, comp, info.pinName);
        if (compR === null) continue;

        const newR = totalR + compR;

        // Found target?
        if (otherNet === targetNet) return newR;

        // Skip if we've reached this net with lower resistance
        if (visited.has(otherNet) && visited.get(otherNet) <= newR) continue;
        visited.set(otherNet, newR);

        const newUsedComps = new Set(usedComps);
        newUsedComps.add(info.compId);
        queue.push({ net: otherNet, totalR: newR, usedComps: newUsedComps });
      }
    }

    return Infinity; // No path found (open circuit)
  }

  _solvePhototransistor(id, comp) {
    // Conducting state is purely light-level based (set in _preEvaluateSwitches).
    // When conducting, collector-emitter are merged so vAcross=0 — don't use vAcross for state.
    comp.state.conducting = comp.state.lightLevel > 0.05;

    if (comp.state.conducting) {
      const maxCurrent = 0.005;
      comp.state.current = maxCurrent * comp.state.lightLevel;
    } else {
      comp.state.current = 0;
    }
  }

  // ─── Helpers ───

  /**
   * Get the effective voltage at a pin by checking direct net supply
   * or tracing through the circuit.
   * Note: This returns the RAW supply voltage reachable from this pin,
   * NOT the voltage after resistance drops. Use _traceToSupply() directly
   * when you need both voltage and series resistance for current calculations.
   * For components that just need to know "is this connected to V+ or GND?"
   * (like MOSFET gate, diode bias check), this is correct.
   */
  _pinSupplyVoltage(pinRef, excludeCompId) {
    // Direct net supply?
    const directV = this._netVoltage(pinRef);
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    if (directV !== null) return directV;

    // Trace through circuit
    const trace = this._traceToSupply(pinRef, excludeCompId);
    return trace ? trace.voltage : null;
  }

  /**
   * Build a convergence snapshot that includes:
   * - MOSFET/diode conducting states (for iterative switch convergence)
   * - Dynamic supply voltages (for potentiometer signal propagation)
   * The outer loop continues until this snapshot stabilizes.
   */
  _convergenceSnapshot() {
    let snap = '';
    this.components.forEach((comp, id) => {
      if (comp.type === 'mosfet-n') snap += `${id}:${comp.state.on ? 1 : 0},`;
      if (comp.type === 'diode') snap += `${id}:${comp.state.conducting ? 1 : 0},`;
      if (comp.type === 'phototransistor') snap += `${id}:${comp.state.conducting ? 1 : 0},`;
    });
    // Include dynamic supply voltages (rounded to avoid floating-point noise)
    for (const [pinRef, voltage] of this._dynamicSupplies) {
      snap += `${pinRef}:${voltage.toFixed(3)},`;
    }
    return snap;
  }

  // ─── Init States ───

  _initState(comp) {
    switch (comp.type) {
      case 'battery9v':
        // BUG FIX: Respect comp.value if provided (e.g., 1.5V batteries)
        return { voltage: comp.value || 9, connected: true };
      case 'led':
        return { brightness: 0, on: false, current: 0, voltage: 0, burned: false };
      case 'rgb-led':
        return {
          on: false,
          red: { on: false, brightness: 0 },
          green: { on: false, brightness: 0 },
          blue: { on: false, brightness: 0 },
        };
      case 'resistor':
        return { current: 0, voltage: 0 };
      case 'capacitor':
        return { charge: 0, voltage: 0, current: 0, chargePercent: 0, tau: 0, targetVoltage: 0, charging: false };
      case 'mosfet-n':
        return { on: false, vgs: 0, ids: 0 };
      case 'potentiometer':
        return { position: 0.5, resistance: (comp.value || 10000) * 0.5 };
      case 'photo-resistor':
        return { lightLevel: 0.5, resistance: 5000 };
      case 'phototransistor':
        return { lightLevel: 0.5, current: 0, conducting: false };
      case 'push-button':
        return { pressed: false };
      case 'reed-switch':
        return { closed: false };
      case 'buzzer-piezo':
        return { frequency: 0, on: false };
      case 'motor-dc':
        return { speed: 0, on: false, direction: 1 };
      case 'diode':
        return { conducting: false, current: 0 };
      case 'multimeter':
        return { reading: 0, mode: 'voltage' };
      default:
        return {};
    }
  }
}

export default CircuitSolver;
