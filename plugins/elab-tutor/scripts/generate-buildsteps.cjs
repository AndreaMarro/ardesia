#!/usr/bin/env node
/**
 * generate-buildsteps.js
 * =====================
 * Genera buildSteps per tutti gli esperimenti che ne sono privi.
 *
 * Logica:
 *   1. Piazza la breadboard (se presente nei componenti)
 *   2. Piazza la batteria / alimentazione
 *   3. Piazza Arduino/NanoR4 (se presente)
 *   4. Per ogni componente restante, crea uno step di posizionamento
 *      con targetPins estratti da pinAssignments
 *   5. Per ogni connessione/filo, crea uno step wire con wireFrom, wireTo, wireColor
 *
 * Il testo è in italiano, educativo, per bambini 8-14 anni.
 *
 * USAGE:  node generate-buildsteps.js          (dry-run — mostra solo il conteggio)
 *         node generate-buildsteps.js --write   (scrive i file aggiornati)
 *
 * © Andrea Marro — 18/02/2026
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ─── Configuration ──────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'src', 'data');
const VOL1_PATH = path.join(DATA_DIR, 'experiments-vol1.js');
const VOL2_PATH = path.join(DATA_DIR, 'experiments-vol2.js');

const DRY_RUN = !process.argv.includes('--write');

// ─── Hint map per tipo componente ───────────────────────────
const COMPONENT_HINTS = {
  'resistor':          'Il resistore limita la corrente nel circuito.',
  'led':               "Ricorda: l'anodo (+ lungo) e il catodo (- corto)!",
  'push-button':       'Il pulsante apre e chiude il circuito.',
  'potentiometer':     'Il potenziometro regola la resistenza.',
  'buzzer-piezo':      'Il buzzer produce un suono quando riceve corrente.',
  'photo-resistor':    'La fotoresistenza cambia valore con la luce.',
  'capacitor':         'Il condensatore accumula e rilascia energia.',
  'battery9v':         'La batteria 9V alimenta il circuito.',
  'breadboard-half':   'La breadboard collega i componenti senza saldature.',
  'breadboard-full':   'La breadboard full-size ha più spazio per i componenti.',
  'nano-r4':           'Arduino Nano è il cervello del circuito!',
  'nano-breakout':     'Il NanoBreakout facilita i collegamenti con Arduino.',
  'rgb-led':           'Il LED RGB ha 3 colori dentro: rosso, verde e blu!',
  'reed-switch':       "Il reed switch si chiude con il magnete. Come un interruttore invisibile!",
  'mosfet-n':          'Il MOSFET è un cancello elettronico controllato dalla tensione al Gate.',
  'phototransistor':   'Il fototransistor conduce più corrente quando riceve luce.',
  'motor-dc':          "Il motore DC trasforma l'energia elettrica in movimento!",
  'diode':             'Il diodo fa passare la corrente in una sola direzione.',
  'multimeter':        'Il multimetro misura tensione, corrente e resistenza.',
};

// ─── Pin name labels (per testi descrittivi) ────────────────
const PIN_LABELS = {
  'pin1': 'pin 1',
  'pin2': 'pin 2',
  'pin3': 'pin 3',
  'pin4': 'pin 4',
  'anode': 'anodo (+)',
  'cathode': 'catodo (-)',
  'positive': 'polo positivo (+)',
  'negative': 'polo negativo (-)',
  'vcc': 'VCC',
  'signal': 'Signal',
  'gnd': 'GND',
  'red': 'pin Rosso',
  'common': 'catodo comune',
  'green': 'pin Verde',
  'blue': 'pin Blu',
  'gate': 'Gate (G)',
  'drain': 'Drain (D)',
  'source': 'Source (S)',
  'collector': 'collettore (C)',
  'emitter': 'emettitore (E)',
  'probe-positive': 'sonda rossa (+)',
  'probe-negative': 'sonda nera (-)',
};

// ─── Wire color names in Italian ────────────────────────────
const WIRE_COLOR_IT = {
  'red':    'ROSSO',
  'black':  'NERO',
  'yellow': 'GIALLO',
  'green':  'VERDE',
  'blue':   'BLU',
  'orange': 'ARANCIONE',
  'white':  'BIANCO',
  'purple': 'VIOLA',
  'brown':  'MARRONE',
  'gray':   'GRIGIO',
  'grey':   'GRIGIO',
  'pink':   'ROSA',
};

// ─── Component type labels in Italian ───────────────────────
const COMPONENT_TYPE_LABELS = {
  'battery9v':       'batteria 9V',
  'breadboard-half': 'breadboard (mezza)',
  'breadboard-full': 'breadboard (full-size)',
  'resistor':        'resistore',
  'led':             'LED',
  'rgb-led':         'LED RGB',
  'push-button':     'pulsante',
  'potentiometer':   'potenziometro',
  'buzzer-piezo':    'buzzer',
  'photo-resistor':  'fotoresistore (LDR)',
  'capacitor':       'condensatore',
  'reed-switch':     'reed switch',
  'mosfet-n':        'MOSFET',
  'phototransistor': 'fototransistor',
  'motor-dc':        'motore DC',
  'diode':           'diodo',
  'multimeter':      'multimetro',
  'nano-r4':         'Arduino Nano R4',
  'nano-breakout':   'NanoBreakout',
};

// ─── Placement order priority (lower = placed first) ────────
const PLACEMENT_PRIORITY = {
  'breadboard-half': 0,
  'breadboard-full': 0,
  'battery9v':       1,
  'nano-r4':         2,
  'nano-breakout':   2,
  // All other components default to 10
};

// ─── Helper functions ───────────────────────────────────────

/**
 * Parse a breadboard pin reference like "bb1:e5" into human-readable form
 */
function formatBBPin(pinRef) {
  if (!pinRef) return pinRef;
  const match = pinRef.match(/^(\w+):([a-j])(\d+)$/);
  if (match) {
    return `${match[2].toUpperCase()}${match[3]}`;
  }
  // Bus pins like bb1:bus-top-plus-5
  const busMatch = pinRef.match(/^(\w+):bus-(top|bot)-(plus|minus)-(\d+)$/);
  if (busMatch) {
    const side = busMatch[2] === 'top' ? 'superiore' : 'inferiore';
    const polarity = busMatch[3] === 'plus' ? '+' : '\u2212';
    return `bus ${polarity} ${side} (col. ${busMatch[4]})`;
  }
  // Component pin like bat1:positive
  const compMatch = pinRef.match(/^(\w+):(.+)$/);
  if (compMatch) {
    const label = PIN_LABELS[compMatch[2]] || compMatch[2];
    return `${label} di ${compMatch[1]}`;
  }
  return pinRef;
}

/**
 * Format a component's value for display
 */
function formatComponentValue(comp) {
  if (comp.type === 'resistor' && comp.value) {
    if (comp.value >= 1000) return `${comp.value / 1000}k\u03A9`;
    return `${comp.value}\u03A9`;
  }
  if (comp.type === 'capacitor' && comp.value) {
    return `${comp.value}\u00B5F`;
  }
  if (comp.type === 'potentiometer' && comp.value) {
    if (comp.value >= 1000) return `${comp.value / 1000}k\u03A9`;
    return `${comp.value}\u03A9`;
  }
  if (comp.type === 'led' && comp.color) {
    const colorMap = { red: 'rosso', green: 'verde', blue: 'blu', yellow: 'giallo', white: 'bianco' };
    return colorMap[comp.color] || comp.color;
  }
  return null;
}

/**
 * Build a concise list of BB hole positions from targetPins.
 * e.g., { "r1:pin1": "bb1:e5", "r1:pin2": "bb1:e12" } -> "nei fori E5 e E12"
 */
function formatTargetPositions(targetPins) {
  const positions = [];
  for (const val of Object.values(targetPins)) {
    const match = val.match(/^(\w+):([a-j])(\d+)$/);
    if (match) {
      positions.push(`${match[2].toUpperCase()}${match[3]}`);
    }
  }
  if (positions.length === 0) return '';
  if (positions.length === 1) return `nel foro ${positions[0]}`;
  if (positions.length === 2) return `nei fori ${positions[0]} e ${positions[1]}`;
  const last = positions.pop();
  return `nei fori ${positions.join(', ')} e ${last}`;
}

/**
 * For component placement text, generate an educational, kid-friendly description.
 */
function generatePlacementText(comp, targetPins) {
  const label = COMPONENT_TYPE_LABELS[comp.type] || comp.type;
  const value = formatComponentValue(comp);
  const positions = formatTargetPositions(targetPins);

  // Special handling for breadboard (no targetPins usually)
  if (comp.type === 'breadboard-half' || comp.type === 'breadboard-full') {
    return `Posiziona la ${label} nell'area di lavoro. Sar\u00E0 la base del tuo circuito!`;
  }

  // Special handling for battery
  if (comp.type === 'battery9v') {
    return `Posiziona la ${label} accanto alla breadboard. \u00C8 la fonte di energia del circuito!`;
  }

  // Special handling for multimeter
  if (comp.type === 'multimeter') {
    return `Posiziona il ${label} accanto al circuito. Ti servir\u00E0 per misurare!`;
  }

  // Special handling for motor (often no BB pins)
  if (comp.type === 'motor-dc') {
    if (positions) {
      return `Posiziona il ${label} ${positions}.`;
    }
    return `Posiziona il ${label} accanto al circuito. Trasforma l'elettricit\u00E0 in movimento!`;
  }

  // General components
  let name = label;
  if (value) {
    if (comp.type === 'led') {
      name = `LED ${value}`;
    } else if (comp.type === 'resistor') {
      name = `resistore da ${value}`;
    } else if (comp.type === 'capacitor') {
      name = `condensatore da ${value}`;
    } else if (comp.type === 'potentiometer') {
      name = `potenziometro da ${value}`;
    }
  }

  if (positions) {
    return `Prendi il ${name} dalla palette e posizionalo ${positions}.`;
  }

  return `Prendi il ${name} dalla palette e posizionalo sulla breadboard.`;
}

/**
 * Generate a contextual hint for component placement.
 */
function generatePlacementHint(comp, targetPins) {
  // Use the default hint from COMPONENT_HINTS
  let baseHint = COMPONENT_HINTS[comp.type] || '';

  // Add pin-specific info for certain components
  if (comp.type === 'led' && targetPins) {
    const anodePin = Object.entries(targetPins).find(([k]) => k.includes(':anode'));
    const cathodePin = Object.entries(targetPins).find(([k]) => k.includes(':cathode'));
    if (anodePin && cathodePin) {
      const aPos = formatBBPin(anodePin[1]);
      const cPos = formatBBPin(cathodePin[1]);
      baseHint = `L'anodo (+, gamba lunga) va in ${aPos} e il catodo (\u2212, gamba corta) in ${cPos}.`;
    }
  }

  if (comp.type === 'rgb-led' && targetPins) {
    const pins = {};
    for (const [k, v] of Object.entries(targetPins)) {
      const pinName = k.split(':')[1];
      pins[pinName] = formatBBPin(v);
    }
    const parts = [];
    if (pins.red)    parts.push(`Rosso in ${pins.red}`);
    if (pins.common) parts.push(`Catodo comune in ${pins.common}`);
    if (pins.green)  parts.push(`Verde in ${pins.green}`);
    if (pins.blue)   parts.push(`Blu in ${pins.blue}`);
    if (parts.length > 0) {
      baseHint = `I 4 piedini: ${parts.join(', ')}.`;
    }
  }

  if (comp.type === 'push-button' && targetPins) {
    baseHint = 'Il pulsante va a cavallo della scanalatura centrale della breadboard.';
  }

  if (comp.type === 'potentiometer' && targetPins) {
    const pins = {};
    for (const [k, v] of Object.entries(targetPins)) {
      const pinName = k.split(':')[1];
      pins[pinName] = formatBBPin(v);
    }
    const parts = [];
    if (pins.vcc)    parts.push(`VCC in ${pins.vcc}`);
    if (pins.signal) parts.push(`Signal in ${pins.signal}`);
    if (pins.gnd)    parts.push(`GND in ${pins.gnd}`);
    if (parts.length > 0) {
      baseHint = `I 3 pin: ${parts.join(', ')}.`;
    }
  }

  if (comp.type === 'capacitor' && targetPins) {
    const posPin = Object.entries(targetPins).find(([k]) => k.includes(':positive'));
    const negPin = Object.entries(targetPins).find(([k]) => k.includes(':negative'));
    if (posPin && negPin) {
      baseHint = `Il polo + in ${formatBBPin(posPin[1])}, il polo \u2212 in ${formatBBPin(negPin[1])}. Attenzione alla polarit\u00E0!`;
    }
  }

  if (comp.type === 'mosfet-n' && targetPins) {
    const pins = {};
    for (const [k, v] of Object.entries(targetPins)) {
      const pinName = k.split(':')[1];
      pins[pinName] = formatBBPin(v);
    }
    const parts = [];
    if (pins.gate)   parts.push(`Gate in ${pins.gate}`);
    if (pins.drain)  parts.push(`Drain in ${pins.drain}`);
    if (pins.source) parts.push(`Source in ${pins.source}`);
    if (parts.length > 0) {
      baseHint = `I 3 pin: ${parts.join(', ')}.`;
    }
  }

  if (comp.type === 'phototransistor' && targetPins) {
    const colPin = Object.entries(targetPins).find(([k]) => k.includes(':collector'));
    const emiPin = Object.entries(targetPins).find(([k]) => k.includes(':emitter'));
    if (colPin && emiPin) {
      baseHint = `Collettore in ${formatBBPin(colPin[1])}, emettitore in ${formatBBPin(emiPin[1])}.`;
    }
  }

  if (comp.type === 'diode' && targetPins) {
    const anodePin = Object.entries(targetPins).find(([k]) => k.includes(':anode'));
    const cathodePin = Object.entries(targetPins).find(([k]) => k.includes(':cathode'));
    if (anodePin && cathodePin) {
      baseHint = `L'anodo in ${formatBBPin(anodePin[1])}, il catodo (banda) in ${formatBBPin(cathodePin[1])}.`;
    }
  }

  return baseHint;
}

/**
 * Generate a wire step text
 */
function generateWireText(conn) {
  const colorName = WIRE_COLOR_IT[conn.color] || conn.color.toUpperCase();
  const fromStr = formatBBPin(conn.from);
  const toStr = formatBBPin(conn.to);

  // Detect battery connections for special text
  if (conn.from.includes('bat') && conn.from.includes('positive')) {
    return `Collega un filo ${colorName} dal polo + della batteria al foro ${toStr}.`;
  }
  if (conn.to.includes('bat') && conn.to.includes('negative')) {
    return `Collega un filo ${colorName} dal foro ${fromStr} al polo \u2212 della batteria.`;
  }
  if (conn.to.includes('bat') && conn.to.includes('positive')) {
    return `Collega un filo ${colorName} dal foro ${fromStr} al polo + della batteria.`;
  }
  if (conn.from.includes('bat') && conn.from.includes('negative')) {
    return `Collega un filo ${colorName} dal polo \u2212 della batteria al foro ${toStr}.`;
  }

  // Detect motor connections
  if (conn.from.includes('mot') || conn.to.includes('mot')) {
    const motPart = conn.from.includes('mot') ? conn.from : conn.to;
    const otherPart = conn.from.includes('mot') ? conn.to : conn.from;
    const motPin = motPart.split(':')[1];
    const motLabel = PIN_LABELS[motPin] || motPin;
    const otherStr = formatBBPin(otherPart);
    if (conn.from.includes('mot')) {
      return `Collega un filo ${colorName} dal ${motLabel} del motore al foro ${otherStr}.`;
    } else {
      return `Collega un filo ${colorName} dal foro ${otherStr} al ${motLabel} del motore.`;
    }
  }

  // Detect multimeter probe connections
  if (conn.from.includes('mm') && conn.from.includes('probe')) {
    const probePart = conn.from.split(':')[1];
    const probeLabel = probePart.includes('positive') ? 'sonda rossa (+)' : 'sonda nera (\u2212)';
    return `Collega la ${probeLabel} del multimetro al foro ${toStr}.`;
  }
  if (conn.to.includes('mm') && conn.to.includes('probe')) {
    const probePart = conn.to.split(':')[1];
    const probeLabel = probePart.includes('positive') ? 'sonda rossa (+)' : 'sonda nera (\u2212)';
    return `Collega la ${probeLabel} del multimetro al foro ${fromStr}.`;
  }

  // Detect generic component-to-component (no breadboard)
  const fromIsBB = conn.from.includes('bb');
  const toIsBB = conn.to.includes('bb');
  if (!fromIsBB && !toIsBB) {
    // Direct component-to-component connection
    const fromComp = conn.from.split(':');
    const toComp = conn.to.split(':');
    const fromLabel = PIN_LABELS[fromComp[1]] || fromComp[1];
    const toLabel = PIN_LABELS[toComp[1]] || toComp[1];
    return `Collega un filo ${colorName} dal ${fromLabel} di ${fromComp[0]} al ${toLabel} di ${toComp[0]}.`;
  }

  // Default: breadboard-to-breadboard or breadboard-to-component
  return `Collega un filo ${colorName} dal foro ${fromStr} al foro ${toStr}.`;
}

/**
 * Generate a wire step hint
 */
function generateWireHint(conn, wireIndex, totalWires) {
  // Battery -> bus connections
  if (conn.from.includes('bat') && conn.from.includes('positive') && conn.to.includes('bus') && conn.to.includes('plus')) {
    return 'Questo filo porta la corrente dalla batteria al bus positivo della breadboard.';
  }
  if (conn.from.includes('bus') && conn.from.includes('minus') && conn.to.includes('bat') && conn.to.includes('negative')) {
    return 'Questo filo chiude il circuito riportando la corrente alla batteria.';
  }
  if (conn.to.includes('bat') && conn.to.includes('negative') && conn.from.includes('bus') && conn.from.includes('minus')) {
    return 'Questo filo chiude il circuito riportando la corrente alla batteria.';
  }

  // Bus -> hole connections (power distribution)
  if (conn.from.includes('bus') && conn.from.includes('plus') && !conn.to.includes('bus')) {
    return 'Questo filo porta la corrente dal bus positivo al componente.';
  }
  if (!conn.from.includes('bus') && conn.to.includes('bus') && conn.to.includes('minus')) {
    return 'Questo filo riporta la corrente al bus negativo.';
  }

  // Bus-to-bus (bridging top/bottom)
  if (conn.from.includes('bus') && conn.to.includes('bus')) {
    return 'Questo filo collega i due bus della breadboard.';
  }

  // Multimeter probes
  if (conn.from.includes('probe') || conn.to.includes('probe')) {
    return 'Posiziona la sonda per misurare la tensione nel punto desiderato.';
  }

  // Motor connections
  if (conn.from.includes('mot') || conn.to.includes('mot')) {
    return 'Questo filo collega il motore al circuito.';
  }

  // Battery direct connections (no breadboard experiments)
  if (conn.from.includes('bat') || conn.to.includes('bat')) {
    if (conn.color === 'red') return 'Il filo rosso porta la corrente positiva dalla batteria.';
    if (conn.color === 'black') return 'Il filo nero riporta la corrente al polo negativo.';
  }

  // Color-based hints for internal wires
  if (conn.color === 'red') {
    return 'Il filo rosso porta la corrente positiva.';
  }
  if (conn.color === 'black') {
    return 'Il filo nero \u00E8 il ritorno al negativo.';
  }

  // Last wire
  if (wireIndex === totalWires - 1) {
    return 'Ultimo collegamento! Il circuito \u00E8 quasi pronto.';
  }

  return 'Questo filo collega due parti del circuito.';
}

/**
 * Collect all pin assignments for a given component ID.
 * Returns { "compId:pinName": "bb1:hole", ... }
 */
function getPinsForComponent(compId, pinAssignments) {
  const result = {};
  if (!pinAssignments) return result;
  for (const [key, val] of Object.entries(pinAssignments)) {
    if (key.startsWith(compId + ':')) {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Main: generate buildSteps for a single experiment
 */
function generateBuildSteps(exp) {
  const steps = [];
  let stepNum = 1;

  const components = exp.components || [];
  const pinAssignments = exp.pinAssignments || {};
  const connections = exp.connections || [];

  // Sort components by placement priority
  const sortedComponents = [...components].sort((a, b) => {
    const prioA = PLACEMENT_PRIORITY[a.type] !== undefined ? PLACEMENT_PRIORITY[a.type] : 10;
    const prioB = PLACEMENT_PRIORITY[b.type] !== undefined ? PLACEMENT_PRIORITY[b.type] : 10;
    return prioA - prioB;
  });

  // ── Phase 1: Component placement steps ──
  for (const comp of sortedComponents) {
    const targetPins = getPinsForComponent(comp.id, pinAssignments);
    const hasPins = Object.keys(targetPins).length > 0;

    // Breadboard
    if (comp.type === 'breadboard-half' || comp.type === 'breadboard-full') {
      steps.push({
        step: stepNum++,
        text: generatePlacementText(comp, targetPins),
        componentId: comp.id,
        componentType: comp.type,
        hint: COMPONENT_HINTS[comp.type] || '',
      });
      continue;
    }

    // Battery
    if (comp.type === 'battery9v') {
      steps.push({
        step: stepNum++,
        text: generatePlacementText(comp, targetPins),
        componentId: comp.id,
        componentType: comp.type,
        hint: COMPONENT_HINTS[comp.type] || '',
      });
      continue;
    }

    // Multimeter (auxiliary, no BB pins usually)
    if (comp.type === 'multimeter') {
      steps.push({
        step: stepNum++,
        text: generatePlacementText(comp, targetPins),
        componentId: comp.id,
        componentType: comp.type,
        hint: COMPONENT_HINTS[comp.type] || '',
      });
      continue;
    }

    // Motor DC (may or may not have BB pins)
    if (comp.type === 'motor-dc') {
      steps.push({
        step: stepNum++,
        text: generatePlacementText(comp, targetPins),
        componentId: comp.id,
        componentType: comp.type,
        targetPins: hasPins ? targetPins : undefined,
        hint: COMPONENT_HINTS[comp.type] || '',
      });
      continue;
    }

    // All other components placed on breadboard
    if (hasPins) {
      steps.push({
        step: stepNum++,
        text: generatePlacementText(comp, targetPins),
        componentId: comp.id,
        componentType: comp.type,
        targetPins: targetPins,
        hint: generatePlacementHint(comp, targetPins),
      });
    } else {
      steps.push({
        step: stepNum++,
        text: generatePlacementText(comp, {}),
        componentId: comp.id,
        componentType: comp.type,
        hint: COMPONENT_HINTS[comp.type] || '',
      });
    }
  }

  // ── Phase 2: Wire/connection steps ──
  for (let i = 0; i < connections.length; i++) {
    const conn = connections[i];
    steps.push({
      step: stepNum++,
      text: generateWireText(conn),
      wireFrom: conn.from,
      wireTo: conn.to,
      wireColor: conn.color,
      hint: generateWireHint(conn, i, connections.length),
    });
  }

  return steps;
}

// ─── File I/O helpers ───────────────────────────────────────

/**
 * Parse experiments from file content using vm.runInNewContext (safe sandboxed eval).
 * The files use ES module syntax: const VAR = { ... }; export default VAR;
 * We strip the export and evaluate in a sandbox.
 */
function parseExperiments(content) {
  // Remove the export default line
  let code = content.replace(/export\s+default\s+\w+;\s*$/m, '');

  // Find the variable name
  const varMatch = code.match(/const\s+(\w+)\s*=\s*\{/);
  if (!varMatch) {
    throw new Error('Cannot find experiment variable declaration');
  }
  const varName = varMatch[1];

  // Append code to return the variable
  code += `\n${varName};`;

  // Use vm.runInNewContext for sandboxed evaluation
  const sandbox = {};
  const result = vm.runInNewContext(code, sandbox);
  return result;
}

/**
 * Insert buildSteps into the file content for experiments that don't have them.
 * Strategy: For each experiment without buildSteps, find the insertion point
 * and inject the buildSteps array before the quiz or before the closing brace.
 */
function injectBuildSteps(content, experimentsWithSteps) {
  let modified = content;
  let injectedCount = 0;

  // Process experiments in reverse order of their position in the file
  // so that earlier injections don't shift the positions of later ones
  const toInject = [];
  for (const entry of experimentsWithSteps) {
    const idPattern = `id: "${entry.id}"`;
    const idIndex = modified.indexOf(idPattern);
    if (idIndex === -1) {
      console.warn(`  WARNING: Could not find experiment "${entry.id}" in source.`);
      continue;
    }
    toInject.push({ ...entry, idIndex });
  }

  // Sort by position descending (inject from bottom to top)
  toInject.sort((a, b) => b.idIndex - a.idIndex);

  for (const entry of toInject) {
    const idPattern = `id: "${entry.id}"`;
    const idIndex = modified.indexOf(idPattern);
    if (idIndex === -1) continue;

    // Find the opening { of this experiment
    let expStart = -1;
    for (let i = idIndex; i >= 0; i--) {
      if (modified[i] === '{') {
        expStart = i;
        break;
      }
    }

    // Find the matching closing }
    let braceDepth = 0;
    let expEnd = -1;
    for (let i = expStart; i < modified.length; i++) {
      if (modified[i] === '{') braceDepth++;
      if (modified[i] === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          expEnd = i;
          break;
        }
      }
    }

    if (expStart === -1 || expEnd === -1) {
      console.warn(`  WARNING: Could not find boundaries for experiment "${entry.id}".`);
      continue;
    }

    const expBlock = modified.substring(expStart, expEnd + 1);

    // Determine injection point: before `quiz:` if present, else before closing }
    const quizIndex = expBlock.indexOf('quiz:');
    let insertionOffset;

    if (quizIndex !== -1) {
      // Find the start of the line containing quiz:
      let lineStart = quizIndex;
      while (lineStart > 0 && expBlock[lineStart - 1] !== '\n') lineStart--;
      insertionOffset = expStart + lineStart;
    } else {
      // Insert before the closing } of the experiment
      insertionOffset = expEnd;
    }

    // Generate the buildSteps code string
    const indent = '      '; // 6 spaces
    const stepIndent = '        '; // 8 spaces
    const innerIndent = '          '; // 10 spaces

    let buildStepsStr = `${indent}buildSteps: [\n`;
    for (let si = 0; si < entry.buildSteps.length; si++) {
      const s = entry.buildSteps[si];
      buildStepsStr += `${stepIndent}{\n`;
      buildStepsStr += `${innerIndent}step: ${s.step},\n`;
      buildStepsStr += `${innerIndent}text: ${JSON.stringify(s.text)},\n`;

      if (s.componentId) {
        buildStepsStr += `${innerIndent}componentId: ${JSON.stringify(s.componentId)},\n`;
        buildStepsStr += `${innerIndent}componentType: ${JSON.stringify(s.componentType)},\n`;
        if (s.targetPins && Object.keys(s.targetPins).length > 0) {
          buildStepsStr += `${innerIndent}targetPins: ${JSON.stringify(s.targetPins)},\n`;
        }
      }

      if (s.wireFrom) {
        buildStepsStr += `${innerIndent}wireFrom: ${JSON.stringify(s.wireFrom)},\n`;
        buildStepsStr += `${innerIndent}wireTo: ${JSON.stringify(s.wireTo)},\n`;
        buildStepsStr += `${innerIndent}wireColor: ${JSON.stringify(s.wireColor)},\n`;
      }

      buildStepsStr += `${innerIndent}hint: ${JSON.stringify(s.hint)}\n`;
      buildStepsStr += `${stepIndent}}`;
      if (si < entry.buildSteps.length - 1) buildStepsStr += ',';
      buildStepsStr += '\n';
    }
    buildStepsStr += `${indent}],\n`;

    // Inject the buildSteps
    if (quizIndex !== -1) {
      // Insert before quiz line
      modified = modified.substring(0, insertionOffset) + buildStepsStr + modified.substring(insertionOffset);
    } else {
      // Insert before closing brace, ensure trailing comma on previous property
      let lastPropEnd = insertionOffset - 1;
      while (lastPropEnd > expStart && /\s/.test(modified[lastPropEnd])) lastPropEnd--;

      if (modified[lastPropEnd] !== ',') {
        // Add comma after last property, then buildSteps
        modified = modified.substring(0, lastPropEnd + 1) + ',\n' + buildStepsStr + modified.substring(insertionOffset);
      } else {
        modified = modified.substring(0, lastPropEnd + 1) + '\n' + buildStepsStr + modified.substring(insertionOffset);
      }
    }

    injectedCount++;
  }

  return { content: modified, count: injectedCount };
}

// ─── Main execution ─────────────────────────────────────────

function processFile(filePath, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${label}`);
  console.log(`File: ${filePath}`);
  console.log('='.repeat(60));

  const content = fs.readFileSync(filePath, 'utf-8');
  const data = parseExperiments(content);

  const experiments = data.experiments || [];
  let withBuildSteps = 0;
  let withoutBuildSteps = 0;
  let generated = 0;

  const toInject = []; // Experiments that need buildSteps injected

  for (const exp of experiments) {
    if (exp.buildSteps && exp.buildSteps.length > 0) {
      withBuildSteps++;
      console.log(`  [OK] ${exp.id} -- already has ${exp.buildSteps.length} buildSteps`);
    } else {
      withoutBuildSteps++;

      // Generate buildSteps
      const steps = generateBuildSteps(exp);
      generated++;

      const compSteps = steps.filter(s => s.componentId).length;
      const wireSteps = steps.filter(s => s.wireFrom).length;
      console.log(`  [++] ${exp.id} -- GENERATED ${steps.length} steps (${compSteps} components, ${wireSteps} wires)`);

      toInject.push({ id: exp.id, buildSteps: steps });
    }
  }

  console.log(`\nSummary for ${label}:`);
  console.log(`  Total experiments: ${experiments.length}`);
  console.log(`  Already had buildSteps: ${withBuildSteps}`);
  console.log(`  Generated buildSteps: ${generated}`);

  if (!DRY_RUN && toInject.length > 0) {
    const result = injectBuildSteps(content, toInject);
    fs.writeFileSync(filePath, result.content, 'utf-8');
    console.log(`  WRITTEN to file: ${result.count} experiments updated`);
  } else if (DRY_RUN && toInject.length > 0) {
    console.log(`  DRY RUN -- use --write to save changes`);

    // Print sample output for first generated experiment
    const first = toInject[0];
    if (first) {
      console.log(`\n  Sample buildSteps for "${first.id}":`);
      for (const s of first.buildSteps.slice(0, 4)) {
        console.log(`    Step ${s.step}: ${s.text}`);
        if (s.hint) console.log(`      Hint: ${s.hint}`);
      }
      if (first.buildSteps.length > 4) {
        console.log(`    ... and ${first.buildSteps.length - 4} more steps`);
      }
    }
  }

  return { total: experiments.length, existing: withBuildSteps, generated };
}

// ─── Run ────────────────────────────────────────────────────
console.log('================================================================');
console.log('  ELAB BuildSteps Generator');
console.log('  Generates guided assembly steps for experiments');
console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'WRITE (will modify files!)'}`);
console.log('================================================================');

const results = [];

if (fs.existsSync(VOL1_PATH)) {
  results.push(processFile(VOL1_PATH, 'Volume 1 -- Le Basi'));
} else {
  console.error(`File not found: ${VOL1_PATH}`);
}

if (fs.existsSync(VOL2_PATH)) {
  results.push(processFile(VOL2_PATH, 'Volume 2 -- Approfondiamo'));
} else {
  console.error(`File not found: ${VOL2_PATH}`);
}

// Final summary
console.log('\n' + '='.repeat(60));
console.log('FINAL SUMMARY');
console.log('='.repeat(60));
const totalAll = results.reduce((s, r) => s + r.total, 0);
const existingAll = results.reduce((s, r) => s + r.existing, 0);
const generatedAll = results.reduce((s, r) => s + r.generated, 0);
console.log(`  Total experiments: ${totalAll}`);
console.log(`  Already had buildSteps: ${existingAll}`);
console.log(`  Newly generated: ${generatedAll}`);
console.log(`  Coverage: ${existingAll + generatedAll}/${totalAll} (${Math.round((existingAll + generatedAll) / totalAll * 100)}%)`);

if (DRY_RUN) {
  console.log('\n  Run with --write to save changes to files.');
}
