/**
 * ELAB UX Tester — Interactivity & Usability Validator
 * Validates all 69 experiments for buildSteps, quiz, interactivity, code, and galileoPrompt
 * Run: node ux-validator.cjs
 * © Andrea Marro — 27/02/2026
 */

const v1 = require('./src/data/experiments-vol1.js').default;
const v2 = require('./src/data/experiments-vol2.js').default;
const v3 = require('./src/data/experiments-vol3.js').default;

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Interactive component types (should respond to user interaction)
const INTERACTIVE_TYPES = new Set([
  'push-button',      // click press/release
  'potentiometer',    // drag/turn overlay
  'photo-resistor',   // light slider overlay
  'phototransistor',  // light slider overlay
  'reed-switch',      // toggle
  'mosfet-n',         // gate touch toggle
]);

// Output-only components (should NOT have interactive handlers beyond properties panel)
const OUTPUT_TYPES = new Set([
  'led', 'resistor', 'capacitor', 'buzzer-piezo', 'motor-dc',
  'diode', 'rgb-led', 'servo', 'lcd16x2',
]);

// Base types always visible in build mode (not placed by buildSteps)
const BASE_TYPES = new Set([
  'breadboard-half', 'breadboard-full', 'battery9v', 'arduino-nano', 'nano-r4',
]);

// NanoBreakout wing pin names
const WING_PINS = new Set([
  'W_A0', 'W_A1', 'W_A2', 'W_A3', 'W_D3', 'W_D5', 'W_D6', 'W_D9',
  'W_A4', 'W_A5', 'W_D0', 'W_D1', 'W_D13', 'W_D12', 'W_D11', 'W_D10',
  // Also accept SDA/SCL/RX/TX/SCK/MISO/MOSI variants
  'W_A4/SDA', 'W_A5/SCL', 'W_D0/RX', 'W_D1/TX', 'W_D13/SCK', 'W_D12/MISO', 'W_D11/MOSI',
]);

// Standard Arduino pins (non-wing)
const ARDUINO_SPECIAL_PINS = new Set(['GND_R', 'GND_L', '5V', '3V3', 'VIN', 'AREF']);

// ═══════════════════════════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════════════════════════

function validateBuildSteps(exp) {
  const issues = [];
  const buildSteps = exp.buildSteps;

  if (!buildSteps || buildSteps.length === 0) {
    issues.push('NO buildSteps defined');
    return { ok: false, issues };
  }

  // 1. Every non-base component should appear in a buildStep
  const componentIds = new Set(exp.components.map(c => c.id));
  const baseComponentIds = new Set(exp.components.filter(c => BASE_TYPES.has(c.type)).map(c => c.id));
  const nonBaseComponentIds = new Set([...componentIds].filter(id => !baseComponentIds.has(id)));

  const buildStepComponentIds = new Set();
  const buildStepWires = [];

  for (let i = 0; i < buildSteps.length; i++) {
    const step = buildSteps[i];

    // Validate step number
    if (step.step !== i + 1) {
      issues.push(`buildStep[${i}].step = ${step.step}, expected ${i + 1}`);
    }

    // Track components in buildSteps
    if (step.componentId) {
      if (BASE_TYPES.has(step.componentType)) {
        // Base components in buildSteps are OK (some experiments explicitly place them)
        buildStepComponentIds.add(step.componentId);
      } else {
        buildStepComponentIds.add(step.componentId);
      }
    }

    // Track wires in buildSteps
    if (step.wireFrom && step.wireTo) {
      buildStepWires.push({ from: step.wireFrom, to: step.wireTo, step: i });
    }

    // Validate text is non-empty
    if (!step.text || step.text.trim().length === 0) {
      issues.push(`buildStep[${i}] has empty text`);
    }

    // Validate hint is non-empty
    if (!step.hint || step.hint.trim().length === 0) {
      issues.push(`buildStep[${i}] has empty hint`);
    }
  }

  // Check missing non-base components
  for (const compId of nonBaseComponentIds) {
    if (!buildStepComponentIds.has(compId)) {
      issues.push(`Component '${compId}' not placed in any buildStep`);
    }
  }

  // 2. Every wire in connections should appear in a buildStep
  const connections = exp.connections || [];
  for (const conn of connections) {
    const found = buildStepWires.some(w =>
      (w.from === conn.from && w.to === conn.to) ||
      (w.from === conn.to && w.to === conn.from)
    );
    if (!found) {
      issues.push(`Wire ${conn.from} → ${conn.to} not in any buildStep`);
    }
  }

  // 3. Every buildStep wire should correspond to an actual connection
  for (const bsw of buildStepWires) {
    const found = connections.some(c =>
      (c.from === bsw.from && c.to === bsw.to) ||
      (c.from === bsw.to && c.to === bsw.from)
    );
    if (!found) {
      issues.push(`buildStep wire ${bsw.from} → ${bsw.to} (step ${bsw.step + 1}) has no matching connection`);
    }
  }

  // 4. Total coverage: buildStep components + wires should fully cover the experiment
  const totalBuildStepItems = buildStepComponentIds.size + buildStepWires.length;
  const totalExpectedItems = nonBaseComponentIds.size + connections.length;

  // Note: base components placed in buildSteps are extra (OK, not an error)

  return { ok: issues.length === 0, issues };
}

function validateQuiz(exp) {
  const issues = [];
  const quiz = exp.quiz;

  if (!quiz || !Array.isArray(quiz)) {
    issues.push('NO quiz defined');
    return { ok: false, issues };
  }

  if (quiz.length !== 2) {
    issues.push(`Quiz has ${quiz.length} questions, expected 2`);
  }

  for (let i = 0; i < quiz.length; i++) {
    const q = quiz[i];

    if (!q.question || q.question.trim().length === 0) {
      issues.push(`Quiz[${i}] has empty question`);
    }

    if (!Array.isArray(q.options)) {
      issues.push(`Quiz[${i}] options is not an array`);
    } else if (q.options.length !== 3) {
      issues.push(`Quiz[${i}] has ${q.options.length} options, expected 3`);
    } else {
      // Check each option is non-empty
      q.options.forEach((opt, j) => {
        if (!opt || opt.trim().length === 0) {
          issues.push(`Quiz[${i}].options[${j}] is empty`);
        }
      });
    }

    if (q.correct !== 0 && q.correct !== 1 && q.correct !== 2) {
      issues.push(`Quiz[${i}].correct = ${q.correct}, expected 0, 1, or 2`);
    }

    if (!q.explanation || q.explanation.trim().length === 0) {
      issues.push(`Quiz[${i}] has empty explanation`);
    }
  }

  return { ok: issues.length === 0, issues };
}

function validateInteractivity(exp) {
  const issues = [];

  // Identify which component types are interactive in this experiment
  const interactiveComps = exp.components.filter(c => INTERACTIVE_TYPES.has(c.type));
  const outputComps = exp.components.filter(c => OUTPUT_TYPES.has(c.type));

  // In handleComponentClick:
  // - push-button: handled (press/release for both circuit and avr modes)
  // - potentiometer: handled (shows overlay)
  // - photo-resistor: handled (shows light slider)
  // - phototransistor: handled (shows light slider)
  // - reed-switch: handled (toggle in circuit mode)
  // - mosfet-n: handled (toggle gate touch)
  // These are ALL handled in the code. We just validate that every experiment's
  // interactive components are of known types.

  for (const comp of interactiveComps) {
    if (!INTERACTIVE_TYPES.has(comp.type)) {
      issues.push(`Component ${comp.id} (${comp.type}) is treated as interactive but not in known handler`);
    }
  }

  // For AVR experiments with push-button, check that the button is wired to an Arduino pin
  if (exp.simulationMode === 'avr') {
    const buttons = exp.components.filter(c => c.type === 'push-button');
    for (const btn of buttons) {
      // Check if there's a connection from any Arduino pin to a button column
      const btnPins = Object.entries(exp.pinAssignments || {})
        .filter(([key]) => key.startsWith(btn.id + ':'))
        .map(([, val]) => val);

      // The button should be connected (directly or through breadboard) to an Arduino pin
      const hasArduinoConnection = exp.connections.some(c =>
        c.from.startsWith('nano1:') || c.to.startsWith('nano1:')
      );

      if (!hasArduinoConnection && exp.simulationMode === 'avr') {
        issues.push(`AVR experiment has button ${btn.id} but no Arduino connections found`);
      }
    }
  }

  // Potentiometer in AVR mode should be connected to an analog pin
  if (exp.simulationMode === 'avr') {
    const pots = exp.components.filter(c => c.type === 'potentiometer');
    for (const pot of pots) {
      const hasAnalogConnection = exp.connections.some(c => {
        const pin = c.from.startsWith('nano1:') ? c.from.split(':')[1] : (c.to.startsWith('nano1:') ? c.to.split(':')[1] : '');
        return pin.includes('A');
      });
      if (pots.length > 0 && !hasAnalogConnection) {
        issues.push(`AVR experiment has potentiometer ${pot.id} but no analog pin connection`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

function validateCode(exp) {
  const issues = [];

  // Only Vol3 AVR experiments should have code
  const isVol3 = exp.id.startsWith('v3-');
  const hasCode = exp.code && exp.code.trim().length > 0;
  const isAVR = exp.simulationMode === 'avr';

  if (isVol3 && isAVR && !hasCode) {
    issues.push(`Vol3 AVR experiment missing code`);
  }

  if (isVol3 && !isAVR && hasCode) {
    issues.push(`Vol3 circuit-mode experiment has code (unexpected for non-AVR)`);
  }

  if (!isVol3 && hasCode) {
    issues.push(`Non-Vol3 experiment has code (unexpected)`);
  }

  if (!hasCode) {
    return { ok: issues.length === 0, issues, hasCode: false };
  }

  // Extract pin numbers from code
  const code = exp.code;

  // Extract pinMode/digitalWrite/digitalRead/analogRead/analogWrite pin references
  const pinModeMatches = code.match(/pinMode\s*\(\s*(\w+)/g) || [];
  const digitalWriteMatches = code.match(/digitalWrite\s*\(\s*(\w+)/g) || [];
  const digitalReadMatches = code.match(/digitalRead\s*\(\s*(\w+)/g) || [];
  const analogReadMatches = code.match(/analogRead\s*\(\s*(\w+)/g) || [];
  const analogWriteMatches = code.match(/analogWrite\s*\(\s*(\w+)/g) || [];

  // Extract the actual pin numbers used in code
  const extractPinNum = (matches) => {
    return matches.map(m => {
      const match = m.match(/\(\s*(\w+)/);
      return match ? match[1] : null;
    }).filter(Boolean);
  };

  const codePins = new Set([
    ...extractPinNum(pinModeMatches),
    ...extractPinNum(digitalWriteMatches),
    ...extractPinNum(digitalReadMatches),
    ...extractPinNum(analogReadMatches),
    ...extractPinNum(analogWriteMatches),
  ]);

  // Extract Arduino pin numbers from connections
  const connectedArduinoPins = new Set();
  for (const conn of (exp.connections || [])) {
    if (conn.from.startsWith('nano1:')) {
      const pin = conn.from.split(':')[1];
      if (!ARDUINO_SPECIAL_PINS.has(pin)) {
        // Convert wing pin name to pin number
        const num = wingPinToNumber(pin);
        if (num !== null) connectedArduinoPins.add(String(num));
      }
    }
    if (conn.to.startsWith('nano1:')) {
      const pin = conn.to.split(':')[1];
      if (!ARDUINO_SPECIAL_PINS.has(pin)) {
        const num = wingPinToNumber(pin);
        if (num !== null) connectedArduinoPins.add(String(num));
      }
    }
  }

  // Check: pins referenced in code should be in connections
  for (const codePin of codePins) {
    // Skip non-numeric constants, #define names, variable names
    if (!/^\d+$/.test(codePin) && !codePin.startsWith('A')) continue;

    // A0-A5 => check analog pins
    if (codePin.startsWith('A')) {
      if (!connectedArduinoPins.has(codePin)) {
        // A0 could be connected as W_A0
        const altPin = codePin; // e.g. "A0"
        if (!connectedArduinoPins.has(altPin)) {
          issues.push(`Code uses pin ${codePin} but no matching Arduino connection found`);
        }
      }
    } else {
      // Digital pin number
      if (!connectedArduinoPins.has(codePin)) {
        // Skip pin numbers that are clearly not GPIO (e.g., delay values, loop counters)
        const pinNum = parseInt(codePin);
        if (pinNum >= 0 && pinNum <= 19) {
          // Could be a legitimate pin - check more carefully
          // Some pin references may be through #define or variables
          // Only flag if the pin is definitely used as a GPIO pin
          issues.push(`Code uses pin ${codePin} but no matching Arduino connection`);
        }
      }
    }
  }

  // Check if code uses Serial and experiment should show Serial Monitor
  const usesSerial = code.includes('Serial.begin') || code.includes('Serial.print');
  if (usesSerial && !code.includes('Serial.begin')) {
    issues.push('Code uses Serial.print but missing Serial.begin');
  }

  return { ok: issues.length === 0, issues, hasCode: true, usesSerial };
}

function wingPinToNumber(wingPin) {
  // Convert wing pin names to Arduino pin numbers
  const map = {
    'W_A0': 'A0', 'W_A1': 'A1', 'W_A2': 'A2', 'W_A3': 'A3',
    'W_D3': '3', 'W_D5': '5', 'W_D6': '6', 'W_D9': '9',
    'W_A4': 'A4', 'W_A4/SDA': 'A4', 'W_A5': 'A5', 'W_A5/SCL': 'A5',
    'W_D0': '0', 'W_D0/RX': '0', 'W_D1': '1', 'W_D1/TX': '1',
    'W_D13': '13', 'W_D13/SCK': '13',
    'W_D12': '12', 'W_D12/MISO': '12',
    'W_D11': '11', 'W_D11/MOSI': '11',
    'W_D10': '10',
  };
  return map[wingPin] !== undefined ? map[wingPin] : null;
}

function validateGalileo(exp) {
  const issues = [];

  if (!exp.galileoPrompt || exp.galileoPrompt.trim().length === 0) {
    issues.push('NO galileoPrompt defined');
    return { ok: false, issues };
  }

  const prompt = exp.galileoPrompt;

  // Check minimum length (should be descriptive)
  if (prompt.length < 50) {
    issues.push(`galileoPrompt too short (${prompt.length} chars)`);
  }

  // Check it mentions the experiment concept or components
  const hasComponentRef = exp.components.some(c => {
    const typeNames = {
      'led': ['LED', 'led'],
      'resistor': ['resistore', 'resistenza', 'resistor'],
      'capacitor': ['condensatore', 'capacitor'],
      'push-button': ['pulsante', 'button', 'bottone'],
      'potentiometer': ['potenziometro', 'potentiometer'],
      'photo-resistor': ['fotoresistenza', 'fotoresistore', 'LDR', 'photo'],
      'battery9v': ['batteria', 'battery', '9V'],
      'buzzer-piezo': ['buzzer', 'piezo', 'cicalino'],
      'motor-dc': ['motore', 'motor', 'DC'],
      'diode': ['diodo', 'diode'],
      'mosfet-n': ['MOSFET', 'mosfet', 'transistor'],
      'phototransistor': ['fototransistor', 'phototransistor'],
      'reed-switch': ['reed', 'magnetico', 'magnetic'],
      'servo': ['servo', 'servomotore'],
      'lcd16x2': ['LCD', 'display', 'schermo'],
      'rgb-led': ['RGB', 'rgb'],
      'nano-r4': ['Arduino', 'Nano', 'arduino'],
      'breadboard-half': ['breadboard'],
      'breadboard-full': ['breadboard'],
      'multimeter': ['multimetro', 'multimeter', 'tester'],
    };
    const names = typeNames[c.type] || [c.type];
    return names.some(n => prompt.toLowerCase().includes(n.toLowerCase()));
  });

  if (!hasComponentRef) {
    issues.push('galileoPrompt does not reference any experiment component');
  }

  // Check it's in Italian
  const italianMarkers = ['esperimento', 'circuito', 'spiega', 'italiano', 'studente', 'Galileo', 'ELAB'];
  const hasItalianRef = italianMarkers.some(m => prompt.includes(m));
  if (!hasItalianRef) {
    issues.push('galileoPrompt may not be in Italian (no Italian markers found)');
  }

  return { ok: issues.length === 0, issues };
}

// ═══════════════════════════════════════════════════════════════
// ADDITIONAL CHECKS
// ═══════════════════════════════════════════════════════════════

function validateBuildStepOrder(exp) {
  const issues = [];
  if (!exp.buildSteps || exp.buildSteps.length === 0) return { ok: true, issues: [] };

  const steps = exp.buildSteps;

  // Check that components come before their wires
  // (you can't wire a component that hasn't been placed yet)
  const placedComponentIds = new Set();
  // Base types are always placed
  exp.components.filter(c => BASE_TYPES.has(c.type)).forEach(c => placedComponentIds.add(c.id));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.componentId) {
      placedComponentIds.add(step.componentId);
    }
    if (step.wireFrom && step.wireTo) {
      // Check if wire endpoints reference components that are already placed
      // Wire endpoints are like "bb1:a5" or "bat1:positive" or "nano1:W_D13"
      const fromCompId = step.wireFrom.split(':')[0];
      const toCompId = step.wireTo.split(':')[0];

      if (!placedComponentIds.has(fromCompId) && fromCompId !== 'bb1') {
        issues.push(`buildStep[${i}] wire from '${step.wireFrom}' but component '${fromCompId}' not yet placed`);
      }
      if (!placedComponentIds.has(toCompId) && toCompId !== 'bb1') {
        issues.push(`buildStep[${i}] wire to '${step.wireTo}' but component '${toCompId}' not yet placed`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

function validateCodePinConsistency(exp) {
  // Deep check: for Vol3 experiments, verify that the pin numbers in the code
  // match exactly what's wired in the connections
  const issues = [];
  if (!exp.code || !exp.id.startsWith('v3-')) return { ok: true, issues: [] };

  const code = exp.code;

  // Extract all Arduino pins from connections
  const wiredPins = {};
  for (const conn of (exp.connections || [])) {
    for (const endpoint of [conn.from, conn.to]) {
      if (endpoint.startsWith('nano1:')) {
        const pinName = endpoint.split(':')[1];
        if (!ARDUINO_SPECIAL_PINS.has(pinName)) {
          const pinNum = wingPinToNumber(pinName);
          if (pinNum !== null) {
            wiredPins[pinNum] = pinName;
          }
        }
      }
    }
  }

  // Extract pin numbers from code that are used as GPIO
  // Look for explicit pin definitions like: const int LED = 13;
  const defineMatches = code.match(/(const\s+int|int|#define)\s+\w+\s*[=\s]+\s*(\d+)/g) || [];
  const definedPins = {};
  for (const m of defineMatches) {
    const match = m.match(/(const\s+int|int|#define)\s+(\w+)\s*[=\s]+\s*(\d+)/);
    if (match) {
      definedPins[match[2]] = match[3];
    }
  }

  // Check if any defined pin constants correspond to wired pins
  for (const [name, pinNum] of Object.entries(definedPins)) {
    if (!wiredPins[pinNum] && parseInt(pinNum) >= 0 && parseInt(pinNum) <= 19) {
      // Check if it's used as a GPIO pin (not a timing value)
      const isUsedAsPin = code.includes(`pinMode(${name}`) ||
        code.includes(`pinMode(${pinNum}`) ||
        code.includes(`digitalWrite(${name}`) ||
        code.includes(`digitalRead(${name}`) ||
        code.includes(`analogRead(${name}`) ||
        code.includes(`analogWrite(${name}`);
      if (isUsedAsPin) {
        issues.push(`Code defines pin ${name}=${pinNum} and uses it as GPIO, but no wire connects Arduino pin ${pinNum}`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

function validateSerialMonitor(exp) {
  const issues = [];
  if (!exp.code) return { ok: true, issues: [], usesSerial: false };

  const usesSerial = exp.code.includes('Serial.print') || exp.code.includes('Serial.println');
  const hasSerialBegin = exp.code.includes('Serial.begin');

  if (usesSerial && !hasSerialBegin) {
    issues.push('Code uses Serial.print but no Serial.begin found');
  }

  // Extract baud rate
  if (hasSerialBegin) {
    const baudMatch = exp.code.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/);
    if (!baudMatch) {
      issues.push('Serial.begin found but could not extract baud rate');
    } else {
      const baud = parseInt(baudMatch[1]);
      if (![9600, 115200, 57600, 38400, 19200, 4800, 2400, 1200].includes(baud)) {
        issues.push(`Unusual baud rate: ${baud}`);
      }
    }
  }

  return { ok: issues.length === 0, issues, usesSerial };
}

// ═══════════════════════════════════════════════════════════════
// MAIN VALIDATION
// ═══════════════════════════════════════════════════════════════

const allExperiments = [
  ...v1.experiments.map(e => ({ ...e, volume: 'Vol1' })),
  ...v2.experiments.map(e => ({ ...e, volume: 'Vol2' })),
  ...v3.experiments.map(e => ({ ...e, volume: 'Vol3' })),
];

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                         ELAB UX TESTER — Interactivity & Usability Validator                       ║');
console.log('║                                    69 Experiments × 6 Checks                                       ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝');
console.log('');

const results = [];
const issuesByCategory = { BUILD: [], QUIZ: [], INTERACTIVE: [], CODE: [], GALILEO: [], ORDER: [], PIN_CONSISTENCY: [], SERIAL: [] };

let totalPass = 0;
let totalFail = 0;

// Header
console.log('┌───────────────────────┬───────────┬──────────┬───────────────┬──────────┬────────────┬───────────┐');
console.log('│ EXPERIMENT ID         │ BUILD_OK  │ QUIZ_OK  │ INTERACT_OK   │ CODE_OK  │ GALILEO_OK │  RESULT   │');
console.log('├───────────────────────┼───────────┼──────────┼───────────────┼──────────┼────────────┼───────────┤');

for (const exp of allExperiments) {
  const buildResult = validateBuildSteps(exp);
  const quizResult = validateQuiz(exp);
  const interactResult = validateInteractivity(exp);
  const codeResult = validateCode(exp);
  const galileoResult = validateGalileo(exp);
  const orderResult = validateBuildStepOrder(exp);
  const pinResult = validateCodePinConsistency(exp);
  const serialResult = validateSerialMonitor(exp);

  const allOk = buildResult.ok && quizResult.ok && interactResult.ok && codeResult.ok && galileoResult.ok && orderResult.ok && pinResult.ok && serialResult.ok;

  if (allOk) totalPass++;
  else totalFail++;

  // Collect issues
  if (!buildResult.ok) issuesByCategory.BUILD.push({ id: exp.id, issues: buildResult.issues });
  if (!quizResult.ok) issuesByCategory.QUIZ.push({ id: exp.id, issues: quizResult.issues });
  if (!interactResult.ok) issuesByCategory.INTERACTIVE.push({ id: exp.id, issues: interactResult.issues });
  if (!codeResult.ok) issuesByCategory.CODE.push({ id: exp.id, issues: codeResult.issues });
  if (!galileoResult.ok) issuesByCategory.GALILEO.push({ id: exp.id, issues: galileoResult.issues });
  if (!orderResult.ok) issuesByCategory.ORDER.push({ id: exp.id, issues: orderResult.issues });
  if (!pinResult.ok) issuesByCategory.PIN_CONSISTENCY.push({ id: exp.id, issues: pinResult.issues });
  if (!serialResult.ok) issuesByCategory.SERIAL.push({ id: exp.id, issues: serialResult.issues });

  const padId = exp.id.padEnd(21);
  const bOk = buildResult.ok ? '   PASS   ' : '  *FAIL*  ';
  const qOk = quizResult.ok ? '  PASS   ' : ' *FAIL*  ';
  const iOk = interactResult.ok ? '     PASS      ' : '    *FAIL*     ';
  const cOk = codeResult.ok ? '  PASS   ' : ' *FAIL*  ';
  const gOk = galileoResult.ok ? '    PASS    ' : '   *FAIL*   ';
  const overall = allOk ? '   PASS   ' : '  *FAIL*  ';

  console.log(`│ ${padId} │${bOk}│${qOk}│${iOk}│${cOk}│${gOk}│${overall}│`);

  results.push({
    id: exp.id,
    volume: exp.volume,
    build: buildResult.ok,
    quiz: quizResult.ok,
    interactive: interactResult.ok,
    code: codeResult.ok,
    galileo: galileoResult.ok,
    order: orderResult.ok,
    pinConsistency: pinResult.ok,
    serial: serialResult.ok,
    allOk,
  });
}

console.log('└───────────────────────┴───────────┴──────────┴───────────────┴──────────┴────────────┴───────────┘');
console.log('');

// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('                                         SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log(`  Total experiments:  ${allExperiments.length}`);
console.log(`  PASS (all checks):  ${totalPass}`);
console.log(`  FAIL (any issue):   ${totalFail}`);
console.log('');

// Per-volume breakdown
for (const vol of ['Vol1', 'Vol2', 'Vol3']) {
  const volResults = results.filter(r => r.volume === vol);
  const volPass = volResults.filter(r => r.allOk).length;
  console.log(`  ${vol}: ${volPass}/${volResults.length} PASS`);
}
console.log('');

// Per-category breakdown
console.log('  Category Breakdown:');
const catNames = { BUILD: 'Build Steps', QUIZ: 'Quiz', INTERACTIVE: 'Interactivity', CODE: 'Code', GALILEO: 'Galileo AI', ORDER: 'Step Order', PIN_CONSISTENCY: 'Pin Consistency', SERIAL: 'Serial Monitor' };
for (const [cat, items] of Object.entries(issuesByCategory)) {
  const count = items.length;
  const icon = count === 0 ? 'PASS' : `${count} FAIL`;
  console.log(`    ${catNames[cat].padEnd(18)} ${icon}`);
}

// ═══════════════════════════════════════════════════════════════
// DETAILED ISSUES
// ═══════════════════════════════════════════════════════════════
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('                                      DETAILED ISSUES');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');

let totalIssues = 0;
for (const [cat, items] of Object.entries(issuesByCategory)) {
  if (items.length === 0) continue;
  console.log('');
  console.log(`  ── ${catNames[cat]} Issues (${items.length} experiments) ──`);
  for (const item of items) {
    for (const issue of item.issues) {
      console.log(`    [${item.id}] ${issue}`);
      totalIssues++;
    }
  }
}

if (totalIssues === 0) {
  console.log('  No issues found! All 69 experiments pass all checks.');
}

console.log('');
console.log(`  Total issues found: ${totalIssues}`);
console.log('');

// ═══════════════════════════════════════════════════════════════
// INTERACTIVE COMPONENT MATRIX
// ═══════════════════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('                              INTERACTIVE COMPONENT MATRIX');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');

const interactiveExps = allExperiments.filter(e =>
  e.components.some(c => INTERACTIVE_TYPES.has(c.type))
);

console.log(`  ${interactiveExps.length} experiments have interactive components:`);
console.log('');
console.log('  Experiment              | Interactive Components           | Handler');
console.log('  ────────────────────────┼──────────────────────────────────┼────────────────────');

for (const exp of interactiveExps) {
  const interComps = exp.components.filter(c => INTERACTIVE_TYPES.has(c.type));
  const handlers = interComps.map(c => {
    switch (c.type) {
      case 'push-button': return 'press/release';
      case 'potentiometer': return 'knob overlay';
      case 'photo-resistor': return 'light slider';
      case 'phototransistor': return 'light slider';
      case 'reed-switch': return 'toggle';
      case 'mosfet-n': return 'gate touch';
      default: return 'unknown';
    }
  });
  const compList = interComps.map(c => `${c.type}(${c.id})`).join(', ');
  const handlerList = [...new Set(handlers)].join(', ');
  console.log(`  ${exp.id.padEnd(24)}| ${compList.padEnd(33)}| ${handlerList}`);
}

// ═══════════════════════════════════════════════════════════════
// SERIAL MONITOR USAGE
// ═══════════════════════════════════════════════════════════════
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('                              SERIAL MONITOR USAGE (Vol3)');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');

const vol3WithCode = allExperiments.filter(e => e.volume === 'Vol3' && e.code);
console.log(`  ${vol3WithCode.length} Vol3 experiments have code`);
console.log('');
for (const exp of vol3WithCode) {
  const usesSerial = exp.code.includes('Serial.print') || exp.code.includes('Serial.println');
  const hasBaud = exp.code.includes('Serial.begin');
  const baudMatch = exp.code.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/);
  const baud = baudMatch ? baudMatch[1] : 'N/A';
  console.log(`  ${exp.id.padEnd(24)} | Serial: ${usesSerial ? 'YES' : 'no '} | Baud: ${baud}`);
}

// ═══════════════════════════════════════════════════════════════
// QUIZ STATISTICS
// ═══════════════════════════════════════════════════════════════
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('                              QUIZ STATISTICS');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');

let totalQuestions = 0;
const correctDist = { 0: 0, 1: 0, 2: 0 };
for (const exp of allExperiments) {
  if (exp.quiz) {
    for (const q of exp.quiz) {
      totalQuestions++;
      correctDist[q.correct]++;
    }
  }
}
console.log(`  Total questions: ${totalQuestions} (expected: ${allExperiments.length * 2})`);
console.log(`  Correct answer distribution: 0=${correctDist[0]}, 1=${correctDist[1]}, 2=${correctDist[2]}`);
const maxDist = Math.max(correctDist[0], correctDist[1], correctDist[2]);
const minDist = Math.min(correctDist[0], correctDist[1], correctDist[2]);
const balance = ((minDist / maxDist) * 100).toFixed(1);
console.log(`  Balance ratio: ${balance}% (100% = perfectly balanced)`);

// ═══════════════════════════════════════════════════════════════
// BUILD STEPS STATISTICS
// ═══════════════════════════════════════════════════════════════
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('                              BUILD STEPS STATISTICS');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════');

let totalBuildSteps = 0;
let minSteps = Infinity;
let maxSteps = 0;
let expWithNoSteps = 0;

for (const exp of allExperiments) {
  const steps = exp.buildSteps?.length || 0;
  totalBuildSteps += steps;
  if (steps === 0) expWithNoSteps++;
  if (steps > 0) {
    minSteps = Math.min(minSteps, steps);
    maxSteps = Math.max(maxSteps, steps);
  }
}

console.log(`  Total build steps: ${totalBuildSteps}`);
console.log(`  Average per experiment: ${(totalBuildSteps / allExperiments.length).toFixed(1)}`);
console.log(`  Min steps: ${minSteps === Infinity ? 0 : minSteps}`);
console.log(`  Max steps: ${maxSteps}`);
console.log(`  Experiments without buildSteps: ${expWithNoSteps}`);

// Exit code
console.log('');
if (totalFail > 0) {
  console.log(`RESULT: ${totalFail} experiments have issues. See details above.`);
  process.exit(1);
} else {
  console.log('RESULT: ALL 69 EXPERIMENTS PASS ALL CHECKS!');
  process.exit(0);
}
