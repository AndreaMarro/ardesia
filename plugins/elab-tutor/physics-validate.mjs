import vol1 from './src/data/experiments-vol1.js';
import vol2 from './src/data/experiments-vol2.js';
import vol3 from './src/data/experiments-vol3.js';

const all = [
  ...(vol1.experiments || []).map(e => ({...e, volume: 'Vol1'})),
  ...(vol2.experiments || []).map(e => ({...e, volume: 'Vol2'})),
  ...(vol3.experiments || []).map(e => ({...e, volume: 'Vol3'})),
];

console.log('=== COMPONENT VALUE VERIFICATION ===\n');

const resistorValues = new Set();
const ledColors = new Set();
const capValues = new Set();
const potValues = new Set();

for (const exp of all) {
  for (const c of exp.components) {
    if (c.type === 'resistor') resistorValues.add(c.value);
    if (c.type === 'led') ledColors.add(c.color);
    if (c.type === 'capacitor') capValues.add(c.value);
    if (c.type === 'potentiometer') potValues.add(c.value);
  }
}

console.log('Resistor values:', [...resistorValues].sort((a,b) => a-b).join(', '), 'Ohm');
console.log('LED colors:', [...ledColors].join(', '));
console.log('Capacitor values:', [...capValues].join(', '), 'uF');
console.log('Potentiometer values:', [...potValues].join(', '), 'Ohm');

const LED_VF = { red: 1.8, green: 2.8, blue: 3.0, yellow: 2.0, white: 3.2 };
for (const color of ledColors) {
  if (LED_VF[color] === undefined) {
    console.log('WARNING: LED color "' + color + '" has no Vf entry in CircuitSolver!');
  } else {
    console.log('LED ' + color + ': Vf=' + LED_VF[color] + 'V -- OK');
  }
}

console.log('\n=== PIN NAME VERIFICATION ===');
const pinChecks = {
  'battery9v': ['positive', 'negative'],
  'led': ['anode', 'cathode'],
  'rgb-led': ['red', 'common', 'green', 'blue'],
  'resistor': ['pin1', 'pin2'],
  'capacitor': ['positive', 'negative'],
  'buzzer-piezo': ['positive', 'negative'],
  'motor-dc': ['positive', 'negative'],
  'potentiometer': ['vcc', 'signal', 'gnd'],
  'push-button': ['pin1', 'pin2', 'pin3', 'pin4'],
  'reed-switch': ['pin1', 'pin2'],
  'mosfet-n': ['gate', 'drain', 'source'],
  'diode': ['anode', 'cathode'],
  'phototransistor': ['collector', 'emitter'],
  'photo-resistor': ['pin1', 'pin2'],
  'multimeter': ['probe-positive', 'probe-negative'],
};

let pinErrors = 0;
for (const exp of all) {
  for (const c of (exp.connections || [])) {
    for (const ref of [c.from, c.to]) {
      const parts = ref.split(':');
      if (parts.length < 2) continue;
      const [compId, pinName] = parts;
      if (pinName === undefined) continue;
      const comp = exp.components.find(x => x.id === compId);
      if (comp === undefined) continue;
      if (comp.type.startsWith('breadboard') || comp.type === 'nano-r4' || comp.type === 'lcd16x2' || comp.type === 'servo') continue;

      const validPins = pinChecks[comp.type];
      if (validPins && validPins.indexOf(pinName) === -1) {
        console.log('INVALID PIN: ' + exp.id + ' | ' + ref + ' (valid: ' + validPins.join(', ') + ')');
        pinErrors++;
      }
    }
  }
  const pa = exp.pinAssignments || {};
  for (const compPin of Object.keys(pa)) {
    const parts = compPin.split(':');
    if (parts.length < 2) continue;
    const [compId, pinName] = parts;
    if (pinName === undefined) continue;
    const comp = exp.components.find(x => x.id === compId);
    if (comp === undefined) continue;
    if (comp.type.startsWith('breadboard') || comp.type === 'nano-r4' || comp.type === 'lcd16x2' || comp.type === 'servo') continue;

    const validPins = pinChecks[comp.type];
    if (validPins && validPins.indexOf(pinName) === -1) {
      console.log('INVALID PIN in PA: ' + exp.id + ' | ' + compPin + ' (valid: ' + validPins.join(', ') + ')');
      pinErrors++;
    }
  }
}
console.log('Pin name verification: ' + (pinErrors === 0 ? 'ALL PASS' : pinErrors + ' errors'));

console.log('\n=== EXPERIMENTS WITH ZERO CONNECTIONS ===');
for (const exp of all) {
  if (exp.connections === undefined || exp.connections.length === 0) {
    console.log(exp.id + ' | ' + exp.title + ' | ' + exp.simulationMode);
  }
}

// Check for duplicate experiment IDs
console.log('\n=== DUPLICATE EXPERIMENT IDS ===');
const idCounts = {};
for (const exp of all) {
  idCounts[exp.id] = (idCounts[exp.id] || 0) + 1;
}
let dupes = 0;
for (const [id, count] of Object.entries(idCounts)) {
  if (count > 1) { console.log('DUPLICATE: ' + id + ' (x' + count + ')'); dupes++; }
}
if (dupes === 0) console.log('No duplicates found.');

// Check simulationMode consistency
console.log('\n=== SIMULATION MODE DISTRIBUTION ===');
const modeCounts = {};
for (const exp of all) {
  modeCounts[exp.simulationMode] = (modeCounts[exp.simulationMode] || 0) + 1;
}
for (const [mode, count] of Object.entries(modeCounts)) {
  console.log(mode + ': ' + count + ' experiments');
}
