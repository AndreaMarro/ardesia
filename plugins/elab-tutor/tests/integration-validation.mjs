/**
 * ELAB Sprint 3 — T2: Test Integrazione
 * Verifica Analytics, Events, CircuitSolver, PinComponentMap
 * Eseguire con: node tests/integration-validation.mjs
 * © Andrea Marro — 13/02/2026
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

let pass = 0;
let fail = 0;
const results = [];

function check(name, condition, detail = '') {
  if (condition) {
    pass++;
    results.push({ name, status: '✅', detail });
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    results.push({ name, status: '❌', detail });
    console.log(`  ❌ ${name} — ${detail}`);
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log('  ELAB Sprint 3 — T2: Test Integrazione');
console.log('═══════════════════════════════════════════════════════\n');

// ─── 1. Analytics System ───
console.log('--- Analytics System ---');
const analyticsPath = resolve(rootDir, 'src/components/simulator/api/AnalyticsWebhook.js');
const analyticsContent = readFileSync(analyticsPath, 'utf8');

const expectedEvents = [
  'EXPERIMENT_LOADED', 'SIMULATION_STARTED', 'SIMULATION_PAUSED',
  'SIMULATION_RESET', 'COMPONENT_INTERACTED', 'CODE_VIEWED', 'SERIAL_USED',
  'VOLUME_SELECTED', 'ERROR'
];

for (const evt of expectedEvents) {
  check(`EVENTS.${evt} definito`, analyticsContent.includes(evt), `Non trovato in AnalyticsWebhook.js`);
}

check('sendAnalyticsEvent esportato',
  analyticsContent.includes('export') && analyticsContent.includes('sendAnalyticsEvent'),
  'Funzione non esportata');

check('Webhook URL presente',
  analyticsContent.includes('https://') || analyticsContent.includes('webhook'),
  'URL webhook mancante');

// ─── 2. Event System ───
console.log('\n--- Event System ---');
const simApiPath = resolve(rootDir, 'src/services/simulator-api.js');
const simApiContent = readFileSync(simApiPath, 'utf8');

const expectedExports = ['registerSimulatorInstance', 'unregisterSimulatorInstance', 'emitSimulatorEvent'];
for (const fn of expectedExports) {
  check(`${fn} esportato`, simApiContent.includes(fn), `Non trovato in simulator-api.js`);
}

const expectedEventTypes = ['experimentChange', 'stateChange', 'serialOutput', 'componentInteract', 'circuitChange'];
for (const evt of expectedEventTypes) {
  check(`Evento "${evt}" referenziato`,
    simApiContent.includes(evt) || analyticsContent.includes(evt),
    `Non trovato in simulator-api.js né AnalyticsWebhook.js`);
}

// ─── 3. CircuitSolver ───
console.log('\n--- CircuitSolver ---');
const solverPath = resolve(rootDir, 'src/components/simulator/engine/CircuitSolver.js');
const solverContent = readFileSync(solverPath, 'utf8');

check('CircuitSolver class/function esiste',
  solverContent.includes('class CircuitSolver') || solverContent.includes('function CircuitSolver'),
  'Classe/funzione non trovata');

check('MNA solver presente (Gaussian elimination)',
  solverContent.includes('gaussian') || solverContent.includes('Gaussian') || solverContent.includes('MNA') || solverContent.includes('mna'),
  'MNA solver non trovato');

check('Union-Find presente',
  solverContent.includes('union') || solverContent.includes('Union') || solverContent.includes('find('),
  'Union-Find non trovato');

check('Risoluzione nodale implementata (MNA/Gaussian)',
  solverContent.includes('_solveMNA') && solverContent.includes('_gaussianElimination'),
  'Risoluzione nodale non trovata');

check('Probe connections supportate',
  solverContent.includes('probe') || solverContent.includes('Probe'),
  'Probe connections non trovate');

const solverLOC = solverContent.split('\n').length;
check(`CircuitSolver.js LOC: ${solverLOC}`, solverLOC > 500, `Troppo corto: ${solverLOC} righe`);

// ─── 4. PinComponentMap ───
console.log('\n--- PinComponentMap ---');
const pinMapPath = resolve(rootDir, 'src/components/simulator/utils/pinComponentMap.js');
const pinMapContent = readFileSync(pinMapPath, 'utf8');

check('buildPinComponentMap esportato',
  pinMapContent.includes('export') && pinMapContent.includes('buildPinComponentMap'),
  'Funzione non esportata');

check('buildLCDPinMapping esportato',
  pinMapContent.includes('buildLCDPinMapping'),
  'Funzione non esportata');

check('createOnPinChangeHandler esportato',
  pinMapContent.includes('createOnPinChangeHandler'),
  'Funzione non esportata');

// ─── 5. AVRBridge ───
console.log('\n--- AVRBridge ---');
const avrPath = resolve(rootDir, 'src/components/simulator/engine/AVRBridge.js');
const avrContent = readFileSync(avrPath, 'utf8');

check('AVRBridge class/function esiste',
  avrContent.includes('class AVRBridge') || avrContent.includes('AVRBridge'),
  'Non trovato');

check('Web Worker supportato',
  avrContent.includes('Worker') || avrContent.includes('worker'),
  'Web Worker non trovato');

check('Servo supportato',
  avrContent.includes('servo') || avrContent.includes('Servo'),
  'Servo non trovato');

check('LCD supportato',
  avrContent.includes('lcd') || avrContent.includes('LCD'),
  'LCD non trovato');

const avrLOC = avrContent.split('\n').length;
check(`AVRBridge.js LOC: ${avrLOC}`, avrLOC > 500, `Troppo corto: ${avrLOC} righe`);

// ─── 6. Orchestratore simulazione (NES + mapping pin) ───
console.log('\n--- Orchestratore Simulazione ---');
const nesPath = resolve(rootDir, 'src/components/simulator/NewElabSimulator.jsx');
const nesContent = readFileSync(nesPath, 'utf8');

check('NewElabSimulator esiste',
  nesContent.includes('function NewElabSimulator') || nesContent.includes('const NewElabSimulator'),
  'NewElabSimulator non trovato');

check('Bridge pin-change handler usato',
  nesContent.includes('createOnPinChangeHandler') && nesContent.includes('bridge.onPinChange'),
  'Pin handler bridge non trovato');

check('Supporto code editor/compile in NES',
  nesContent.includes('handleCompile') && nesContent.includes('CodeEditorCM6'),
  'Compile/editor integration non trovata');

// ─── 7. Sprint 3 Features ───
console.log('\n--- Sprint 3 Features ---');

check('BomPanel importato in NES', nesContent.includes('BomPanel'), 'BomPanel non importato');
check('ShortcutsPanel importato in NES', nesContent.includes('ShortcutsPanel'), 'ShortcutsPanel non importato');
check('Annotation importato in NES', nesContent.includes('Annotation'), 'Annotation non importato');
check('Export PNG funzione in NES',
  nesContent.includes('exportPng') || nesContent.includes('ExportPng') || nesContent.includes('handleExportPng'),
  'Export PNG non trovato');

const cbPath = resolve(rootDir, 'src/components/simulator/panels/ControlBar.jsx');
const cbContent = readFileSync(cbPath, 'utf8');
check('ControlBar ha bottone BOM', cbContent.includes('onToggleBom'), 'Bottone BOM mancante');
check('ControlBar ha bottone Export PNG', cbContent.includes('onExportPng'), 'Bottone Export PNG mancante');
check('ControlBar ha bottone Shortcuts', cbContent.includes('onToggleShortcuts'), 'Bottone Shortcuts mancante');

// ─── RIEPILOGO ───
console.log('\n═══════════════════════════════════════════════════════');
console.log(`  RISULTATO: ${pass}/${pass + fail} PASS`);
if (fail > 0) {
  console.log(`  ❌ ${fail} FAIL`);
}
console.log('═══════════════════════════════════════════════════════\n');

process.exit(fail > 0 ? 1 : 0);
