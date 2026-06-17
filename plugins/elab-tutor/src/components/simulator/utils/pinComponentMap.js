/* Andrea Marro — 12/02/2026 */
/**
 * Pin Component Map Builder — Maps Arduino pins to circuit components.
 * Uses Union-Find on breadboard holes to trace nano pin -> output/input component.
 * Extracted from NewElabSimulator.jsx
 *
 * Exports:
 *   buildPinComponentMap(experiment): { [pinNum]: { compId, compType } }
 *   createOnPinChangeHandler(bridge, setComponentStates, pinMapRef): (pin, value) => void
 */

const outputTypes = ['led', 'rgb-led', 'buzzer-piezo', 'motor-dc', 'servo'];
const inputTypes = ['push-button', 'potentiometer', 'photo-resistor', 'phototransistor'];

export function buildPinComponentMap(experiment) {
  if (!experiment || !experiment.components) return {};

  const map = {}; // arduinoPin (number) -> { compId, compType }
  const compById = {};
  experiment.components.forEach(c => { compById[c.id] = c; });

  // --- Strategy 1: Breadboard-routed experiments (pinAssignments present) ---
  // Use Union-Find on breadboard holes to trace nano pin → output component
  if (experiment.pinAssignments && Object.keys(experiment.pinAssignments).length > 0) {
    // Build Union-Find over breadboard holes
    const parent = {};
    const find = (x) => { if (!parent[x]) parent[x] = x; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
    const union = (a, b) => { parent[find(a)] = find(b); };

    // 1. Breadboard internal nets: holes in same column strip are connected
    const bbHoles = new Set();
    // Collect all referenced breadboard holes from pinAssignments and connections
    Object.values(experiment.pinAssignments).forEach(h => bbHoles.add(h));
    (experiment.connections || []).forEach(conn => {
      const [fId] = conn.from.split(':');
      const [tId] = conn.to.split(':');
      if (compById[fId]?.type === 'breadboard-half' || fId.startsWith('bb')) bbHoles.add(conn.from);
      if (compById[tId]?.type === 'breadboard-half' || tId.startsWith('bb')) bbHoles.add(conn.to);
    });

    // Group holes by breadboard internal nets (same column strip)
    // Rows a-e = top strip, rows f-j = bottom strip, bus-top-plus/minus, bus-bot-plus/minus
    const stripGroups = {};
    bbHoles.forEach(hole => {
      const [bbId, holeId] = hole.split(':');
      if (!holeId) return;
      let stripKey;
      if (holeId.startsWith('bus-')) {
        // Bus strips: bus-top-plus, bus-top-minus, bus-bot-plus, bus-bot-minus
        const busParts = holeId.match(/^(bus-(?:top|bot)-(?:plus|minus))/);
        stripKey = busParts ? `${bbId}:${busParts[1]}` : null;
      } else {
        const row = holeId.charAt(0);
        const col = holeId.slice(1);
        if ('abcde'.includes(row)) stripKey = `${bbId}:top-${col}`;
        else if ('fghij'.includes(row)) stripKey = `${bbId}:bot-${col}`;
      }
      if (stripKey) {
        if (!stripGroups[stripKey]) stripGroups[stripKey] = [];
        stripGroups[stripKey].push(hole);
      }
    });
    // Union all holes in same strip
    Object.values(stripGroups).forEach(group => {
      for (let i = 1; i < group.length; i++) union(group[0], group[i]);
    });

    // 2. Pin assignments: union component pin with its breadboard hole
    const compPinToHole = {}; // "led1:anode" -> "bb1:d12"
    Object.entries(experiment.pinAssignments).forEach(([compPin, bbHole]) => {
      compPinToHole[compPin] = bbHole;
      union(compPin, bbHole);
    });

    // 2b. Component internal connectivity: passive components connect their pins
    // Resistors, wires, and other 2-terminal passives pass current between pins
    const passiveTypes = ['resistor', 'wire', 'diode'];
    const compPins = {}; // group pinAssignment keys by component ID
    Object.keys(experiment.pinAssignments).forEach(compPin => {
      const [cId] = compPin.split(':');
      if (!compPins[cId]) compPins[cId] = [];
      compPins[cId].push(compPin);
    });
    Object.entries(compPins).forEach(([cId, pins]) => {
      const comp = compById[cId];
      if (comp && passiveTypes.includes(comp.type) && pins.length >= 2) {
        // Union all pins of this passive component (they're electrically connected)
        for (let i = 1; i < pins.length; i++) union(pins[0], pins[i]);
      }
    });

    // 3. Wire connections: union the two endpoints
    (experiment.connections || []).forEach(conn => {
      union(conn.from, conn.to);
    });

    // Now find which Arduino pins connect to which output components
    // Find all nano pin endpoints
    // NanoR4Board uses W_D9/E_D9/W_A0 format (West/East side prefix) — strip to D9/A0
    const nanoPins = {}; // "D13" -> union-find node
    (experiment.connections || []).forEach(conn => {
      [conn.from, conn.to].forEach(endpoint => {
        const [id, pin] = endpoint.split(':');
        if (compById[id]?.type === 'nano-r4') {
          const stripped = pin.replace(/^[WE]_/, '');
          if (/^[DA]\d+$/.test(stripped)) {
            nanoPins[stripped] = endpoint;
          }
        }
      });
    });

    // Find all output AND input component pin endpoints
    const outputPins = []; // { compId, compType, node, pinName }
    const inputPins = [];  // { compId, compType, node, pinName }
    Object.entries(compPinToHole).forEach(([compPin]) => {
      const [cId, pName] = compPin.split(':');
      const comp = compById[cId];
      if (comp && outputTypes.includes(comp.type)) {
        outputPins.push({ compId: cId, compType: comp.type, node: compPin, pinName: pName });
      }
      if (comp && inputTypes.includes(comp.type)) {
        inputPins.push({ compId: cId, compType: comp.type, node: compPin, pinName: pName });
      }
    });

    // Match: if nano pin and component pin share same root, they're connected
    Object.entries(nanoPins).forEach(([pinName, nanoNode]) => {
      const nanoRoot = find(nanoNode);
      // Output components (LED, buzzer, motor, RGB LED)
      for (const out of outputPins) {
        if (find(out.node) === nanoRoot) {
          let pinNum;
          if (pinName.startsWith('D')) pinNum = parseInt(pinName.slice(1));
          else if (pinName.startsWith('A')) pinNum = 14 + parseInt(pinName.slice(1));
          if (pinNum !== undefined) {
            map[pinNum] = { compId: out.compId, compType: out.compType, pinName: out.pinName };
          }
        }
      }
      // Input components (button, pot, LDR, phototransistor)
      for (const inp of inputPins) {
        if (find(inp.node) === nanoRoot) {
          let pinNum;
          if (pinName.startsWith('D')) pinNum = parseInt(pinName.slice(1));
          else if (pinName.startsWith('A')) pinNum = 14 + parseInt(pinName.slice(1));
          if (pinNum !== undefined && !map[pinNum]) {
            map[pinNum] = { compId: inp.compId, compType: inp.compType };
          }
        }
      }
    });

    return map;
  }

  // --- Strategy 2: Direct-wired experiments (legacy, no breadboard) ---
  (experiment.connections || []).forEach(conn => {
    const [fromId, fromPin] = conn.from.split(':');
    const [toId, toPin] = conn.to.split(':');
    const fromComp = compById[fromId];
    const toComp = compById[toId];

    let nanoPin = null;
    let otherCompId = null;
    let otherComp = null;

    // Strip W_/E_ prefix from NanoR4Board pin names (West/East side)
    const strippedFrom = fromPin.replace(/^[WE]_/, '');
    const strippedTo = toPin.replace(/^[WE]_/, '');

    if (fromComp?.type === 'nano-r4' && /^[DA]\d+$/.test(strippedFrom)) {
      nanoPin = strippedFrom; otherCompId = toId; otherComp = toComp;
    } else if (toComp?.type === 'nano-r4' && /^[DA]\d+$/.test(strippedTo)) {
      nanoPin = strippedTo; otherCompId = fromId; otherComp = fromComp;
    }

    if (nanoPin && otherComp) {
      let pinNum;
      if (nanoPin.startsWith('D')) pinNum = parseInt(nanoPin.slice(1));
      else if (nanoPin.startsWith('A')) pinNum = 14 + parseInt(nanoPin.slice(1));

      if (pinNum !== undefined) {
        const allMappable = [...outputTypes, ...inputTypes];
        // Trace through resistors to find the target component
        let target = { id: otherCompId, type: otherComp.type };
        if (otherComp.type === 'resistor') {
          for (const c of experiment.connections) {
            const [fId] = c.from.split(':');
            const [tId] = c.to.split(':');
            let nextId = null;
            if (fId === otherCompId && tId !== otherCompId) nextId = tId;
            if (tId === otherCompId && fId !== otherCompId) nextId = fId;
            if (nextId && compById[nextId] && allMappable.includes(compById[nextId].type)) {
              target = { id: nextId, type: compById[nextId].type };
              break;
            }
          }
        }
        map[pinNum] = { compId: target.id, compType: target.type };
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      }
    }
  });

  return map;
}

/**
 * Build LCD pin mapping for AVRBridge.configureLCDPins().
 * Traces which Arduino pins are connected to the LCD's RS, E, D4-D7 pins
 * through the breadboard wiring.
 * Returns { rs, e, d4, d5, d6, d7 } with Arduino pin numbers, or null if no LCD found.
 */
export function buildLCDPinMapping(experiment) {
  if (!experiment || !experiment.components) return null;

  const lcdComp = experiment.components.find(c => c.type === 'lcd16x2');
  if (!lcdComp) return null;

  const compById = {};
  experiment.components.forEach(c => { compById[c.id] = c; });

  // Build Union-Find (same as in buildPinComponentMap)
  const parent = {};
  const find = (x) => { if (!parent[x]) parent[x] = x; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
  const union = (a, b) => { parent[find(a)] = find(b); };

  // Breadboard internal nets
  if (experiment.pinAssignments) {
    const bbHoles = new Set();
    Object.values(experiment.pinAssignments).forEach(h => bbHoles.add(h));
    (experiment.connections || []).forEach(conn => { bbHoles.add(conn.from); bbHoles.add(conn.to); });

    const stripGroups = {};
    bbHoles.forEach(hole => {
      const parts = hole.split(':');
      if (parts.length < 2) return;
      const [bbId, holeId] = parts;
      let stripKey;
      if (holeId.startsWith('bus-')) {
        const busParts = holeId.match(/^(bus-(?:top|bot)-(?:plus|minus))/);
        stripKey = busParts ? `${bbId}:${busParts[1]}` : null;
      } else {
        const row = holeId.charAt(0);
        const col = holeId.slice(1);
        if ('abcde'.includes(row)) stripKey = `${bbId}:top-${col}`;
        else if ('fghij'.includes(row)) stripKey = `${bbId}:bot-${col}`;
      }
      if (stripKey) {
        if (!stripGroups[stripKey]) stripGroups[stripKey] = [];
        stripGroups[stripKey].push(hole);
      }
    });
    Object.values(stripGroups).forEach(group => {
      for (let i = 1; i < group.length; i++) union(group[0], group[i]);
    });

    // Pin assignments
    Object.entries(experiment.pinAssignments).forEach(([compPin, bbHole]) => {
      union(compPin, bbHole);
    });

    // Passive component connectivity
    const passiveTypes = ['resistor', 'wire', 'diode'];
    const compPins = {};
    Object.keys(experiment.pinAssignments).forEach(compPin => {
      const [cId] = compPin.split(':');
      if (!compPins[cId]) compPins[cId] = [];
      compPins[cId].push(compPin);
    });
    Object.entries(compPins).forEach(([cId, pins]) => {
      const comp = compById[cId];
      if (comp && passiveTypes.includes(comp.type) && pins.length >= 2) {
        for (let i = 1; i < pins.length; i++) union(pins[0], pins[i]);
      }
    });

    // Wire connections
    (experiment.connections || []).forEach(conn => { union(conn.from, conn.to); });
  }

  // Find Nano pin endpoints
  const nanoPins = {}; // "D7" -> union-find node
  (experiment.connections || []).forEach(conn => {
    [conn.from, conn.to].forEach(endpoint => {
      const [id, pin] = endpoint.split(':');
      if (compById[id]?.type === 'nano-r4') {
        const stripped = pin.replace(/^[WE]_/, '');
        if (/^[DA]\d+$/.test(stripped)) {
          nanoPins[stripped] = endpoint;
        }
      }
    });
  });

  // LCD control pin refs
  const lcdPinNames = ['rs', 'e', 'd4', 'd5', 'd6', 'd7'];
  const lcdPinRefs = {};
  lcdPinNames.forEach(p => { lcdPinRefs[p] = `${lcdComp.id}:${p}`; });

  // Match LCD pins to Arduino pins via Union-Find
  const result = {};
  lcdPinNames.forEach(lcdPin => {
    const lcdRoot = find(lcdPinRefs[lcdPin]);
    for (const [pinName, nanoNode] of Object.entries(nanoPins)) {
      if (find(nanoNode) === lcdRoot) {
        let pinNum;
        if (pinName.startsWith('D')) pinNum = parseInt(pinName.slice(1));
        else if (pinName.startsWith('A')) pinNum = 14 + parseInt(pinName.slice(1));
        if (pinNum !== undefined) result[lcdPin] = pinNum;
        break;
      }
    }
  });

  // Verify all 6 pins were found
  const allFound = lcdPinNames.every(p => result[p] !== undefined);
  if (!allFound) {
    return null;
  }

  return result;
}

/**
 * Create onPinChange callback for AVRBridge instances.
 * Maps GPIO pin changes to React component states (LED, buzzer, motor, RGB LED).
 */
export function createOnPinChangeHandler(bridge, setComponentStates, pinMapRef) {
  return (pin, value, modeState) => {
    setComponentStates(prev => {
      const pins = { ...(prev._pins || {}) };
      if (pin <= 13) pins[`D${pin}`] = value;
      else pins[`A${pin - 14}`] = value;
      pins.d13Led = pins.D13 || 0;

      if (modeState !== undefined) {
        if (!pins._modes) pins._modes = {};
        pins._modes[pin] = modeState;
      }

      // Read PWM duty cycle if this is a PWM-capable pin
      const pwmDuty = bridge.getPWMDutyCycle(pin);
      const effectiveValue = pwmDuty !== null ? pwmDuty : value;

      // Store PWM data in pins for tooltip/visualization
      if (pwmDuty !== null) {
        if (!pins._pwm) pins._pwm = {};
        pins._pwm[pin] = pwmDuty;
      }

      const updated = { ...prev, _pins: pins };

      // Map pin change to component state using pinMapRef
      const pinMap = pinMapRef.current;
      if (pinMap && pinMap[pin]) {
        const mapping = pinMap[pin];
        switch (mapping.compType) {
          case 'led':
            updated[mapping.compId] = {
              on: effectiveValue > 0,
              brightness: pwmDuty !== null ? pwmDuty : (value > 0 ? 1 : 0),
            };
            break;
          case 'buzzer-piezo':
            updated[mapping.compId] = { on: effectiveValue > 0, frequency: effectiveValue > 0 ? 2000 : 0 };
            break;
          case 'motor-dc':
            updated[mapping.compId] = {
              on: effectiveValue > 0,
              speed: pwmDuty !== null ? pwmDuty : (value > 0 ? 1 : 0),
            };
            break;
          case 'rgb-led': {
            if (!updated[mapping.compId]) {
              updated[mapping.compId] = { on: false, commonHigh: false, red: { on: false, brightness: 0 }, green: { on: false, brightness: 0 }, blue: { on: false, brightness: 0 } };
            }
            const colorBrightness = pwmDuty !== null ? pwmDuty : (value > 0 ? 1 : 0);
            // mapping.pinName is 'red', 'green', 'blue', or 'common' (from component pin ID)
            const colorChannel = mapping.pinName; // 'red' | 'green' | 'blue' | 'common'
            if (colorChannel === 'red' || colorChannel === 'green' || colorChannel === 'blue') {
              updated[mapping.compId][colorChannel] = { on: effectiveValue > 0, brightness: colorBrightness };
            } else if (colorChannel === 'common') {
              // BUG-E-09: Track common pin state (HIGH = common-anode, LOW = common-cathode)
              updated[mapping.compId].commonHigh = value > 0;
            }
            // Update overall on state
            const st = updated[mapping.compId];
            st.on = (st.red?.on || false) || (st.green?.on || false) || (st.blue?.on || false);
            break;
          }
        }
      }

      return updated;
    });
  };
}
