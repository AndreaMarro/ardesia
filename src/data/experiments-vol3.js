/**
 * ELAB Experiments — Volume 3: Arduino Programmato
 * 26 esperimenti — Arduino Nano R4, pin digitali, analogici, seriale
 * Cap 5 (2) + Cap 6 (8) + Cap 7 (8) + Cap 8 (5) + Extra (3 = LCD, Servo, Simon)
 * Verificato CoVe dai PDF reali del Volume 3 (Cap 5-8)
 * Layout ricalcolato: componenti posizionati SUI fori della breadboard
 * © Andrea Marro — 10/02/2026 — UPDATED 03/04/2026 (all manual experiments added)
 *
 * ── Coordinate Reference (NanoR4 HORIZONTAL — OVERLAPPING BB) ────
 * Arduino (nano1) at { x: 230, y: 10 } (HORIZONTAL, overlapping breadboard left side)
 *   - Board body: 139.5 wide x 99 tall, wing extends right
 *     x range: 230 → 369.5 (width = 139.5)
 *     y range: 10 → 109 (board body)
 *     Rect body starts at x=279.5 (SEMI_R=49.5 from origin) — flush with bb1 left edge (280)
 *     Wing pins extend from x=296 to x=365 — fully INSIDE breadboard hole area
 *     Nano body sits ON TOP of breadboard left portion (plugged-in effect)
 *     Nano covers approximately columns 1-14 of the breadboard
 *   - SVG render order: bb1 FIRST, nano1 SECOND (nano appears ON TOP of breadboard)
 *   - IMPORTANT: All components shifted to cols 18+ (resistor pin1 at col 18 minimum to clear Nano right edge at x=397.58)
 *
 * Breadboard (bb1) always at { x: 280, y: 10 }
 *
 * Breadboard hole formula (absolute coords, with bb1 at {280, 10}):
 *   holeX(col) = 297.75 + (col - 1) * 7.5     (col 1-30, 1-based)
 *   rowY = { a: 43.75, b: 51.25, c: 58.75, d: 66.25, e: 73.75,
 *            f: 91.25, g: 98.75, h: 106.25, i: 113.75, j: 121.25 }
 *
 * Component pin offsets (CORRECTED 21/02/2026 from JSX source):
 *   Resistor: pin1=(-26.25,0), pin2=(26.25,0) → spans 52.5px (7 cols)
 *   LED: anode=(-3.75,22.5), cathode=(3.75,22.5) — below center
 *   PushButton: pin1=(-15,-7.5), pin2=(15,-7.5), pin3=(-15,7.5), pin4=(15,7.5)
 *   Potentiometer: vcc=(-7.5,22.5), signal=(0,22.5), gnd=(7.5,22.5)
 *
 * Placement formulas (place specific pin on a breadboard hole):
 *   Resistor pin1 at (col, row):  origin = (holeX(col) + 26.25, rowY[row])
 *   LED anode at (col, row):      origin = (holeX(col) + 3.75,  rowY[row] - 22.5)
 *   Button pin1 at row e (gap):   origin = (holeX(col) + 15,    rowY.e + 7.5) = (..., 81.25)
 *   Pot vcc at (col, row):        origin = (holeX(col) + 7.5,   rowY[row] - 22.5)
 * ──────────────────────────────────────────────────────────────────────
 */

// ═══ Simon Game — Scratch XML Workspaces (progressivi) ═══════════════════

// Step 4: LED rosso completo — blink semplice
const SIMON_SCRATCH_STEP4 = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field>
<value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Step 16: tutti i 4 LED — random + accensione condizionale
const SIMON_SCRATCH_STEP16 = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">ledNum</field>
<value name="VALUE"><block type="arduino_random">
<value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="MAX"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">ledNum</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
</block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</next></block>
</statement>
</block></xml>`;

// Step 28: tutti i pulsanti — setup completo + lettura bottoni
const SIMON_SCRATCH_STEP28 = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_serial_begin"><field name="BAUD">9600</field>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">3</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Rosso!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">5</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Verde!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Blu!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">13</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Giallo!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
</block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Workspace COMPLETO — Simon semplificato (random + accendi LED + leggi pulsanti + verifica)
const SIMON_SCRATCH_FULL = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_serial_begin"><field name="BAUD">9600</field>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">nuovoLed</field>
<value name="VALUE"><block type="arduino_random">
<value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="MAX"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="text_join"><mutation items="2"/>
<value name="ADD0"><shadow type="text"><field name="TEXT">LED: </field></shadow></value>
<value name="ADD1"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
</block></value>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">nuovoLed</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
</block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">3</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Rosso premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">5</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Verde premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Blu premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="controls_if">
<value name="IF0"><block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">13</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block></value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_tone"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">523</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Giallo premuto!</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_no_tone"><field name="PIN">8</field>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</next></block>
</statement>
</block></xml>`;

// ═══ Scratch XML Workspaces — Esperimenti Vol3 ═══════════════════════════

// Cap.6 Esp.1 — LED Blink esterno (pin 13)


// Cap.6 Esp.5 — Semaforo 3 LED (pin 5 verde, pin 6 giallo, pin 3 rosso)
const SEMAFORO_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// Cap.7 Esp.2 — Pulsante accende LED (pin 6 input, pin 10 output)

// Cap.8 Esp.3 — analogRead + Serial Monitor (A0 + serial 9600)
const SERIAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block>
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
</statement>
</block></xml>`;

// Extra — Servo Sweep (pin 9, semplificato: 0° → 180° → ripeti)
const SERVO_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_servo_attach"><field name="PIN">9</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_servo_write">
<value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_servo_write">
<value name="ANGLE"><shadow type="math_number"><field name="NUM">180</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══════════════════════════════════════════════════════════════════════════

// Cap.6 Esp.3 — SOS Morse (pin 13, Ripeti blocchi per punto/linea)

// Cap.7 Esp.3 — 2 LED + Pulsante semplificato (D6=btn, D10=verde, D9=rosso)
const MINI_TOGGLE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">6</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
</block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
</block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.5 Esp.1 — Blink LED_BUILTIN (pin 13, 1s ON / 1s OFF) ═══
const BLINK_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.5 Esp.2 — Blink veloce (pin 13, 200ms ON / 200ms OFF) ═══
const BLINK_FAST_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.2 — LED esterno pin 13 (stesso Blink, LED su breadboard) ═══
const BLINK_EXTERNAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Morse — SOS semplificato (pin 13, punti 200ms, linee 600ms) ═══
const SOS_MORSE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">400</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">400</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.3 — LED su pin 5 (blink su pin diverso) ═══
const BLINK_PIN5_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.4 — Semaforo 3 LED (pin 5/6/9) ═══
const SEMAFORO_3LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">9</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.5 — digitalRead con pulsante + LED (pin 10 INPUT_PULLUP, pin 5 LED) ═══
const PULLUP_LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<mutation else="1"/>
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">10</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.6 Esp.7 — Debounce pulsante (pin 10 btn, pin 5 LED) — semplificato come toggle ═══
const DEBOUNCE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">INPUT_PULLUP</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
</block></next></block>
</statement>
<statement name="LOOP">
<block type="controls_if">
<value name="IF0">
<block type="logic_compare"><field name="OP">EQ</field>
<value name="A"><block type="arduino_digital_read"><field name="PIN">10</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.1 — analogRead base (A0 trimmer, pin 13 LED, soglia 511) ═══
const ANALOG_READ_BASE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">GT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">511</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.2 — analogRead con tensione (A0, pin 13, soglia 2.5V = 511) ═══
// Semplificato: Scratch non supporta float, usiamo soglia 511 come equivalente di 2.5V
const ANALOG_VOLTAGE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">GT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">511</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.3 — Trimmer controlla 3 LED (A0, pin 3/5/6, soglie 341/682) ═══
const ANALOG_3LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation elseif="1" else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">341</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<value name="IF1">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">682</field></shadow></value>
</block>
</value>
<statement name="DO1">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
</block></next></block></next></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.4 — PWM fade up (pin 5, for 0→255 step 5) ═══
const PWM_FADE_UP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_for">
<field name="VAR">i</field>
<value name="FROM"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="TO"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.5 — PWM valori manuali (pin 5, 0/64/128/255) ═══
const PWM_MANUAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">64</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">128</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.6 — Fade up/down (pin 5, for 0→255 e 255→0) ═══
const PWM_FADE_UPDOWN_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_for">
<field name="VAR">i</field>
<value name="FROM"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
<value name="TO"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_for">
<field name="VAR">i</field>
<value name="FROM"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="TO"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">-5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.7 — Trimmer controlla luminosita con map (A0→pin 5 PWM) ═══
const TRIMMER_PWM_MAP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valorePWM</field>
<value name="VALUE"><block type="arduino_map">
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
<value name="FROM_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="FROM_HIGH"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
<value name="TO_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="TO_HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
</block></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valorePWM</field></block></value>
</block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.7 Esp.8 — DAC reale (A1 input, A0 output) — semplificato come analog read+write ═══
const DAC_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">A0</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreLetto</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A1</field></block></value>
<next><block type="arduino_analog_write"><field name="PIN">A0</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valoreLetto</field></block></value>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.1 — Serial.println in setup (messaggio singolo) ═══
const SERIAL_SETUP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Ciao dal Team di ELAB!</field></shadow></value>
</block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.2 — Serial.println in loop (messaggio ripetuto) ═══
const SERIAL_LOOP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">Ciao dal Team di ELAB!</field></shadow></value>
</block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.4 — Serial Plotter 2 pot (A3, A4) ═══
const SERIAL_PLOTTER_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreA3</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A3</field></block></value>
<next><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valoreA4</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A4</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT">A3:</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valoreA3</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><shadow type="text"><field name="TEXT"> A4:</field></shadow></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valoreA4</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;

// ═══ Cap.8 Esp.5 — Pot + 3 LED + Serial (A3, pin 12/11/10) ═══
const FINAL_PROJECT_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">12</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_serial_begin"><field name="BAUD">9600</field>
</block></next></block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A3</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<next><block type="controls_if">
<mutation elseif="1" else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">300</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<value name="IF1">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">700</field></shadow></value>
</block>
</value>
<statement name="DO1">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
</block></next></block></next></block>
</statement>
</block></next></block></next></block>
</statement>
</block></xml>`;

const EXPERIMENTS_VOL3 = {
  title: "Volume 3 - Arduino Programmato",
  subtitle: "Programmazione Arduino: LED, pulsanti, sensori analogici",
  icon: "\u{1F4D5}",
  color: "#E54B3D",
  experiments: [
    // ═══════════════════════════════════════════════════
    // CAPITOLO 5 — Il nostro primo programma (2 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap5-esp1",
      title: "Cap. 5 Esp. 1 - Blink con LED_BUILTIN",
      desc: "Il primo programma in assoluto! Facciamo lampeggiare il LED integrato sulla scheda Arduino, quello collegato al pin 13. Si accende per 1 secondo, si spegne per 1 secondo, e ripete all'infinito.",
      chapter: "Capitolo 5 - Il nostro primo programma",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Blink — Il primo programma!
// Fa lampeggiare il LED integrato (pin 13)

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "pinMode, digitalWrite, delay, LED_BUILTIN, ciclo loop infinito",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Non servono altri componenti!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Il LED integrato e gia sulla scheda Arduino, collegato al pin 13. Basta il codice!"
        }
      ],
      scratchXml: BLINK_SCRATCH,
      steps: [
        "Collega l'Arduino Nano al computer con il cavo USB.",
        "Apri l'editor e scrivi il codice: pinMode(13, OUTPUT) nel setup(), poi digitalWrite e delay nel loop().",
        "Carica il programma e osserva il LED sulla scheda che lampeggia!"
      ],
      observe: "Il LED integrato sulla scheda Arduino (vicino al pin 13) si accende per 1 secondo e si spegne per 1 secondo, all'infinito. Non serve nessun componente esterno!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe il primo programma in assoluto: il Blink! Fa lampeggiare il LED integrato sulla scheda Arduino (pin 13). Il codice e semplicissimo: setup() configura il pin 13 come OUTPUT, poi loop() lo accende (HIGH), aspetta 1 secondo (delay 1000), lo spegne (LOW), aspetta ancora 1 secondo. Spiega con entusiasmo, e il primo traguardo! Rispondi in italiano.",
      quiz: [
        {
          question: "Cosa fa delay(1000)?",
          options: ["Accende il LED per 1000 volte", "Aspetta 1000 millisecondi, cioe 1 secondo", "Spegne il LED dopo 1000 lampeggi"],
          correct: 1,
          explanation: "delay(1000) mette in pausa il programma per 1000 millisecondi = 1 secondo. Il LED resta nello stato in cui era prima del delay!"
        },
        {
          question: "A cosa serve pinMode(13, OUTPUT) nel setup?",
          options: ["Legge il valore del pin 13", "Dice ad Arduino che il pin 13 sara usato per mandare corrente (uscita)", "Accende subito il LED"],
          correct: 1,
          explanation: "pinMode configura un pin come OUTPUT (uscita) o INPUT (ingresso). Senza questa istruzione nel setup, Arduino non sa come usare il pin!"
        }
      ]
    },
    {
      id: "v3-cap5-esp2",
      title: "Cap. 5 Esp. 2 - Modifica tempi del Blink",
      desc: "Cambiamo i tempi del Blink! Prova a modificare i valori dentro delay() per far lampeggiare il LED piu veloce o piu lento. Cosa succede con delay(100)? E con delay(2000)?",
      chapter: "Capitolo 5 - Il nostro primo programma",
      difficulty: 1,
      icon: "\u{23F1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Blink veloce — Modifica i tempi!
// Prova a cambiare i numeri dentro delay()

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(200);
  digitalWrite(13, LOW);
  delay(200);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "Parametri delay, sperimentazione, millisecondi vs secondi",
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Stesso circuito del Blink!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Nessun componente esterno. Modifichiamo solo i valori di delay() nel codice."
        }
      ],
      scratchXml: BLINK_FAST_SCRATCH,
      steps: [
        "Parti dal programma Blink del Cap. 5 Esp. 1.",
        "Cambia delay(1000) in delay(200) in entrambi i posti.",
        "Carica e osserva: il LED lampeggia molto piu veloce! Prova altri valori."
      ],
      observe: "Con delay(200) il LED lampeggia 5 volte al secondo invece di 1. Provate valori diversi per il tempo di accensione e spegnimento: con numeri diversi ottenete effetti asimmetrici!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe come modificare i tempi del Blink. Incoraggialo a sperimentare con diversi valori di delay: cosa succede con delay(50)? E con delay(5000)? Spiega che i millisecondi sono millesimi di secondo. Rispondi in italiano.",
      quiz: [
        {
          question: "Se metti delay(500) acceso e delay(100) spento, cosa succede?",
          options: ["Il LED resta sempre acceso", "Il LED sta acceso piu a lungo di quanto sta spento", "Il LED non funziona piu"],
          correct: 1,
          explanation: "Con delay(500) il LED sta acceso mezzo secondo, con delay(100) sta spento solo un decimo di secondo. Sembra quasi sempre acceso con un breve spegnimento!"
        },
        {
          question: "Quante volte al secondo lampeggia il LED con delay(100) acceso e delay(100) spento?",
          options: ["1 volta al secondo", "5 volte al secondo", "100 volte al secondo"],
          correct: 1,
          explanation: "Un ciclo completo dura 100ms + 100ms = 200ms. In un secondo (1000ms) ci stanno 1000/200 = 5 cicli, quindi il LED lampeggia 5 volte al secondo!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 6 — I pin digitali (7 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      // ────────────────────────────────────────────────────────────
      // ALLINEATO al libro Vol3 p.56 ESPERIMENTO 1 (18/04/2026 TASK 3):
      // "Colleghiamo la resistenza" — LED esterno + 470Ω + pin D13.
      // Il precedente contenuto (AND/OR con 2 pulsanti) non era nel libro
      // ed è stato rimosso per preservare il parallelismo volumi ↔ simulatore.
      // ────────────────────────────────────────────────────────────
      id: "v3-cap6-esp1",
      title: "Cap. 6 Esp. 1 - Colleghiamo la resistenza",
      bookRef: "Vol3 p.56 - ESPERIMENTO 1",
      desc: "Il primo LED esterno! Colleghiamo un LED + resistenza 470Ω al pin D13. Stesso sketch Blink del Cap. 5, ma ora il LED lampeggia sulla breadboard invece che sulla scheda.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      code: `// Vol3 Cap.6 Esp.1 — LED esterno su pin 13
// Stesso Blink del Cap. 5, ma ora il LED lampeggia sulla breadboard!

void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "LED esterno controllato da pin digitale, resistore di protezione 470Ω, circuito su breadboard",
      layer: "schema",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Il resistore protegge il LED dalla troppa corrente."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (gamba lunga) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "La gamba lunga (anodo) va nel foro D27, la corta (catodo) in D28."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte tra resistenza e LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Questo filo collega il resistore all'anodo del LED."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 controlla il LED esterno, esattamente come faceva con il LED integrato."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Il catodo del LED va a massa chiudendo il circuito."
        }
      ],
      steps: [
        "Posiziona il resistore da 470Ω in serie al LED.",
        "Collega il pin D13 dell'Arduino all'anodo del LED (tramite la resistenza).",
        "Collega il catodo del LED a GND.",
        "Carica lo sketch Blink usando il pin 13 al posto di LED_BUILTIN."
      ],
      observe: "Il LED sulla breadboard lampeggia una volta al secondo — esattamente come il LED integrato sulla scheda, ma ora sei TU a posizionarlo. Stesso codice, stesso comportamento, nuovo circuito!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'ESPERIMENTO 1 del Volume 3 a pagina 56: 'Colleghiamo la resistenza'. Il circuito è LED esterno (rosso) + resistenza 470\u03A9 in serie, pilotati dal pin D13 con lo sketch Blink. Spiega perché serve la resistenza (protegge il LED dalla troppa corrente, è come un tubo stretto per l'acqua), che la gamba lunga del LED è l'anodo (+) e va verso D13, e che il codice è identico a quello del Cap. 5 ma con '13' al posto di 'LED_BUILTIN'. Cita sempre il libro a pagina 56. Rispondi in italiano semplice per ragazzi 10-14 anni.",
      quiz: [
        {
          question: "A cosa serve la resistenza da 470\u03A9 in serie al LED?",
          options: ["A far brillare di più il LED", "A proteggere il LED dalla troppa corrente", "A cambiare il colore del LED"],
          correct: 1,
          explanation: "La resistenza limita la corrente che passa nel LED. Senza resistenza il LED potrebbe bruciarsi! È come un tubo stretto che riduce il flusso dell'acqua."
        },
        {
          question: "Qual è la differenza tra anodo e catodo nel LED?",
          options: ["Sono la stessa cosa", "L'anodo è la gamba lunga (+), il catodo la gamba corta (-)", "L'anodo va a GND, il catodo al pin digitale"],
          correct: 1,
          explanation: "L'anodo (gamba lunga) è il polo positivo e va verso il pin Arduino. Il catodo (gamba corta) è il polo negativo e va a GND. Se inverti il LED non si accende!"
        }
      ]
    },
    {
      // ────────────────────────────────────────────────────────────
      // ALLINEATO al libro Vol3 p.57 ESPERIMENTO 2 (18/04/2026 TASK 3):
      // "Cambia il numero di pin" — stesso circuito LED+470Ω, ma pilotato
      // da un pin diverso (D8 invece di D13). Dimostra che qualsiasi pin
      // digitale funziona come OUTPUT.
      // ────────────────────────────────────────────────────────────
      id: "v3-cap6-esp2",
      title: "Cap. 6 Esp. 2 - Cambia il numero di pin",
      bookRef: "Vol3 p.57 - ESPERIMENTO 2",
      desc: "Stesso circuito LED + resistenza 470Ω, ma ora il LED è pilotato dal pin D8 invece di D13. Cambia il numero nel codice e sposta il filo: il LED lampeggia lo stesso!",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 1,
      icon: "\u{1F4A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D8", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      code: `// Vol3 Cap.6 Esp.2 — Stesso Blink, pin diverso (D8 invece di D13)
// Dimostra che qualsiasi pin digitale può essere OUTPUT

void setup() {
  pinMode(8, OUTPUT);
}

void loop() {
  digitalWrite(8, HIGH);
  delay(1000);
  digitalWrite(8, LOW);
  delay(1000);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "LED esterno, resistore di protezione, circuito su breadboard",
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Il resistore protegge il LED dalla troppa corrente."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "La gamba lunga (anodo) va nel foro D27, la corta (catodo) in D28."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Questo filo collega il resistore all'anodo del LED."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D8 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D8",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "Ora usiamo D8 al posto di D13 — un pin digitale qualsiasi!"
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-) - catodo LED",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Il catodo del LED va a massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Modifica il codice: pinMode(8, OUTPUT) e digitalWrite(8, ...) — il LED lampeggia lo stesso!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Qualsiasi pin digitale funziona come OUTPUT. Cambia il numero nel codice e nel collegamento."
        }
      ],
      scratchXml: BLINK_EXTERNAL_SCRATCH,
      steps: [
        "Sposta il filo dal pin D13 al pin D8 dell'Arduino.",
        "Modifica il codice: pinMode(8, OUTPUT) e digitalWrite(8, HIGH/LOW).",
        "Carica e verifica che il LED lampeggi esattamente come prima."
      ],
      observe: "Il LED lampeggia identico a prima. Hai appena scoperto che qualsiasi pin digitale può essere usato come OUTPUT — basta cambiare il numero nel codice e il collegamento fisico. Arduino Nano ha 14 pin digitali (D2-D13) e tutti possono comandare un LED.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'ESPERIMENTO 2 del Volume 3 a pagina 57: 'Cambia il numero di pin'. Stesso circuito LED + 470Ω dell'esperimento precedente, ma ora pilotato dal pin D8 invece di D13. Spiega che Arduino Nano ha 14 pin digitali (D2-D13) e TUTTI possono funzionare come OUTPUT: basta cambiare il numero nel codice (pinMode e digitalWrite) e spostare il filo fisicamente. Cita sempre il libro a pagina 57. Rispondi in italiano semplice per ragazzi 10-14 anni.",
      quiz: [
        {
          question: "Quali pin di Arduino Nano possono essere usati come OUTPUT digitale?",
          options: ["Solo il pin D13", "Tutti i pin digitali D2-D13", "Solo i pin analogici A0-A5"],
          correct: 1,
          explanation: "Arduino Nano ha 14 pin digitali (D0-D13). Tutti tranne D0 e D1 (riservati per la seriale) possono essere OUTPUT. Basta chiamare pinMode(pin, OUTPUT)."
        },
        {
          question: "Cosa bisogna modificare per passare da D13 a D8?",
          options: ["Solo il codice Arduino", "Solo il collegamento fisico", "Sia il codice (pinMode e digitalWrite) sia il filo sulla breadboard"],
          correct: 2,
          explanation: "Entrambi! Il codice dice ad Arduino quale pin usare, il filo porta il segnale dal pin al LED. Se ne cambi solo uno, il circuito non funziona."
        }
      ]
    },
    {
      id: "v3-cap6-morse",
      title: "Cap. 6 Esp. 3 - SOS in codice Morse",
      bookRef: "Vol3 Cap6 ESPERIMENTO 3",
      desc: "Modifichiamo il programma Blink per far lampeggiare il LED in codice Morse! S = tre lampi brevi, O = tre lampi lunghi. Il nostro Arduino manda un messaggio SOS!",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F4E1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18",
        "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27",
        "led1:cathode": "bb1:d28"
      },
      code: `// SOS in codice Morse — tre brevi, tre lunghi, tre brevi!

void setup() {
  pinMode(13, OUTPUT);
}

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
// Punto: lampo breve (200ms)
void punto() {
  digitalWrite(13, HIGH);
  delay(200);
  digitalWrite(13, LOW);
  delay(200);
}

// Linea: lampo lungo (600ms)
void linea() {
  digitalWrite(13, HIGH);
  delay(600);
  digitalWrite(13, LOW);
  delay(200);
}

void loop() {
  // S: tre punti
  punto(); punto(); punto();
  delay(400);
  // O: tre linee
  linea(); linea(); linea();
  delay(400);
  // S: tre punti
  punto(); punto(); punto();
  delay(1000); // pausa tra messaggi
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Funzioni personalizzate, temporizzazione, codice Morse",
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Stesso circuito dell'esperimento precedente: resistore + LED su pin 13."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED lampeggera in codice Morse: tre brevi (S), tre lunghi (O), tre brevi (S)."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore all'anodo del LED."
        },
        {
          step: 4,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 manda il segnale Morse al LED."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Carica il codice SOS!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Il LED lampeggera SOS: punto-punto-punto linea-linea-linea punto-punto-punto!"
        }
      ],
      scratchXml: SOS_MORSE_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'esperimento precedente (LED su pin 13 con resistore).",
        "Modifica il programma: crea due funzioni, punto() per lampi brevi e linea() per lampi lunghi.",
        "Nel loop, chiama punto() tre volte per la S, linea() tre volte per la O, e di nuovo punto() tre volte.",
        "Carica il programma e osserva il LED lampeggiare SOS!",
        "Prova a cambiare i tempi: delay piu corto = Morse piu veloce."
      ],
      observe: "Il LED lampeggia in un ritmo riconoscibile: tre lampi brevi (S), tre lampi lunghi (O), tre lampi brevi (S), poi una pausa lunga. Questo e il segnale di soccorso universale SOS in codice Morse!",
      unlimPrompt: "Il docente sta mostrando alla classe l'esperimento del codice Morse SOS con un LED. Spiega cos'e il codice Morse (inventato nel 1838, lettere come combinazioni di punti e linee). Perche SOS? Non e un'abbreviazione ma un segnale facile da ricordare e trasmettere. Rispondi in italiano.",
      quiz: [
        {
          question: "Nel codice Morse, la lettera S e formata da:",
          options: ["Tre lampi lunghi", "Tre lampi brevi (punti)", "Un lampo lungo e due brevi"],
          correct: 1,
          explanation: "La S nel codice Morse e composta da tre punti (lampi brevi): ... Le lettere brevi hanno simboli brevi, le lettere lunghe hanno simboli lunghi!"
        },
        {
          question: "A cosa serve creare funzioni come punto() e linea()?",
          options: ["A rendere il programma piu lento", "A organizzare il codice e evitare ripetizioni", "A cambiare il colore del LED"],
          correct: 1,
          explanation: "Le funzioni raggruppano istruzioni che si ripetono. Invece di scrivere lo stesso codice 6 volte, creiamo punto() e linea() e le richiamiamo quando servono!"
        }
      ]
    },
    {
      id: "v3-cap6-esp4",
      title: "Cap. 6 Esp. 4 - Due LED: effetto polizia",
      bookRef: "Vol3 Cap6 ESPERIMENTO 4",
      desc: "Due LED che si alternano come le luci della polizia! Quando uno e acceso l'altro e spento. Usiamo due pin digitali per controllare due LED separatamente.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F6A8}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "blue" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a16", color: "red" },
        { from: "bb1:d23", to: "bb1:d25", color: "red" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D6", to: "bb1:a22", color: "blue" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30"
      },
      code: `// Effetto Polizia — Due LED che si alternano
// Vol.3 Cap.6 Esp.4
// Pin D5 (rosso) e D6 (blu) si alternano ogni 200ms

void setup() {
  pinMode(5, OUTPUT);   // LED rosso
  pinMode(6, OUTPUT);   // LED blu
}

void loop() {
  digitalWrite(5, HIGH); digitalWrite(6, LOW);  delay(200);
  digitalWrite(5, LOW);  digitalWrite(6, HIGH); delay(200);
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 436.5, y: 51.25 },
        "led1": { x: 481.5, y: 43.75 },
        "r2": { x: 481.5, y: 73.75 },
        "led2": { x: 511.5, y: 43.75 }
      },
      concept: "Due pin OUTPUT, alternanza stati, effetto lampeggio polizia",
      layer: "schema",

      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori B16 e B23 - circuito LED rosso",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 protegge il LED rosso dalla troppa corrente."
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D25 e D26. La gamba lunga (anodo +) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Il LED rosso rappresenta una delle luci della polizia."
        },
        {
          step: 3,
          text: "Collega un filo ROSSO dal foro D23 al foro D25 (ponte R1 al LED rosso)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "red",
          hint: "Collega il resistore al LED rosso."
        },
        {
          step: 4,
          text: "Prendi il resistore R2 (470\u03A9) e posizionalo nei fori E22 e E29 - circuito LED blu",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 protegge il LED blu."
        },
        {
          step: 5,
          text: "Prendi il LED blu e mettilo nei fori D29 e D30. La gamba lunga (anodo +) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Il LED blu e la seconda luce della polizia. R2 si collega all'anodo via stessa colonna."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal pin D5 dell'Arduino al foro A16",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a16",
          wireColor: "red",
          hint: "D5 controlla il LED rosso."
        },
        {
          step: 7,
          text: "Collega un filo NERO dal foro A26 al binario GND (-) - catodo LED rosso",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Il catodo del LED rosso va a massa."
        },
        {
          step: 8,
          text: "Collega un filo BLU dal pin D6 dell'Arduino al foro A22",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a22",
          wireColor: "blue",
          hint: "D6 controlla il LED blu."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A30 al binario GND (-) - catodo LED blu",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Il catodo del LED blu va a massa."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino al binario negativo."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal pin 5V al binario (+). Carica il programma: i 2 LED lampeggiano come la polizia!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Due LED, due pin, un effetto spettacolare!"
        }
      ],
      scratchXml: BLINK_EXTERNAL_SCRATCH,
      steps: [
        "Collega 2 LED (rosso e blu) con i loro resistori ai pin D5 e D6.",
        "Nel setup() configura i 2 pin come OUTPUT.",
        "Nel loop() accendi un LED e spegni l'altro, poi delay(200), poi inverte."
      ],
      observe: "I 2 LED rosso e blu si alternano ogni 200ms, come le luci della polizia! Quando il rosso e acceso il blu e spento, e viceversa.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'effetto polizia con due LED (rosso e blu) sui pin D5 e D6. I due LED si alternano ogni 200ms: quando uno e HIGH l'altro e LOW. Spiega che questo e il primo esperimento con DUE pin di output controllati insieme, e che il delay(200) determina la velocita dell'alternanza — come le sirene della polizia! Cita Vol.3 e ricorda ai ragazzi di controllare la gamba lunga del LED verso il resistore. Rispondi in italiano usando 'Ragazzi,'.",
      quiz: [
        {
          question: "Cosa succede se aumenti delay(200) a delay(1000) nel codice?",
          options: ["I LED si alternano piu lentamente, ogni secondo", "I LED si spengono tutti", "Arduino si blocca"],
          correct: 0,
          explanation: "delay(1000) aspetta 1 secondo invece di 200ms. I LED si alternano piu lentamente — come le luci di emergenza lente invece delle sirene veloci della polizia!"
        },
        {
          question: "Perche nel codice scriviamo digitalWrite(5, LOW) prima di accendere il pin 6?",
          options: ["Perche il pin 5 si rompe se resta acceso troppo", "Per spegnere il LED rosso prima di accendere il blu, creando l'alternanza", "Perche Arduino puo accendere solo un pin alla volta fisicamente"],
          correct: 1,
          explanation: "Se non spegniamo il rosso prima di accendere il blu, entrambi resterebbero accesi insieme! L'alternanza richiede che uno sia LOW mentre l'altro e HIGH."
        }
      ]
    },
    {
      id: "v3-cap6-semaforo",
      title: "Cap. 6 Esp. 5 - Il semaforo",
      bookRef: "Vol3 Cap6 ESPERIMENTO 5",
      desc: "Un vero semaforo! Verde 3s, Giallo 1s, Rosso 3s. Pin D5, D6, D3 sul breakout wing.",
      chapter: "Capitolo 6 - I pin digitali",
      difficulty: 2,
      icon: "\u{1F6A6}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "led", id: "led1", color: "green" },
        { type: "led", id: "led2", color: "yellow" },
        { type: "led", id: "led3", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:b16",
        "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25",
        "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22",
        "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29",
        "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:i16",
        "r3:pin2": "bb1:i23",
        "led3:anode": "bb1:h30",
        "led3:cathode": "bb1:h29"
      },
      connections: [
        { from: "nano1:W_D5", to: "bb1:a16", color: "green" },
        { from: "bb1:d23", to: "bb1:d25", color: "green" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D6", to: "bb1:a22", color: "yellow" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:W_D3", to: "bb1:f16", color: "red" },
        { from: "bb1:h23", to: "bb1:h30", color: "green" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // 3 LED circuits:
      // R1 (green): row b col 16-23, LED1 shifted to d25-d26 (bridge d23→d25)
      // R2 (yellow): row e col 22-29, LED2 anode d29, cathode d30 (below LEDs to avoid overlap)
      // R3 (red): row i col 16-23, LED3 shifted to h30-h29 (bridge h23→h30)
      // D5 (W_D5) → a16, D6 (W_D6) → a22, D3 (W_D3) → f16; cathodes → GND bus
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 436.5, y: 51.25 },
        "led1": { x: 481.5, y: 43.75 },
        "r2": { x: 481.5, y: 73.75 },
        "led2": { x: 511.5, y: 43.75 },
        "r3": { x: 436.5, y: 113.75 },
        "led3": { x: 519, y: 83.75 }
      },
      steps: [
        "Posiziona l'Arduino Nano sopra la breadboard.",
        "Circuito verde: resistore 470\u03A9 fila b col 16-23, LED verde anodo fila d col 25, catodo d col 26. Ponte verde d23-d25. D5 alla fila a col 16.",
        "Circuito giallo: resistore 470\u03A9 fila e col 22-29, LED giallo anodo fila d col 29, catodo d col 30. D6 alla fila a col 22.",
        "Circuito rosso: resistore 470\u03A9 fila i col 16-23, LED rosso anodo fila h col 30, catodo h col 29. Ponte verde h23-h30. D3 (breakout wing W_D3) alla fila f col 16.",
        "Collega le colonne dei catodi (26, 30, 29) al binario GND (-) con fili neri.",
        "Collega GND e 5V dell'Arduino ai binari. Carica il programma e osserva il semaforo!"
      ],
      observe: "I LED si accendono in sequenza come un vero semaforo: verde per 3 secondi, giallo per 1 secondo, rosso per 3 secondi. Solo un colore alla volta è acceso, esattamente come al semaforo stradale!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'Semaforo 3 LED' del Volume 3 — Arduino Programmato. Questo esperimento usa TRE pin di output sul breakout wing (W_D5, W_D6, W_D3) per creare un semaforo vero! Il codice nel loop() ha tre blocchi: prima accende solo il verde (pin 5 HIGH, gli altri LOW) e aspetta 3 secondi, poi solo il giallo (pin 6) per 1 secondo, poi solo il rosso (pin 3) per 3 secondi. È una sequenza di stati, come le fasi di un semaforo reale! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// Semaforo 3 LED — Pin D5 (verde), D6 (giallo), D3 (rosso)
// Breakout wing: W_D5, W_D6, W_D3
// Timing: Verde 3s, Giallo 1s, Rosso 3s

void setup() {
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(3, OUTPUT);
}

void loop() {
  // Verde acceso
  digitalWrite(5, HIGH);
  digitalWrite(6, LOW);
  digitalWrite(3, LOW);
  delay(3000);

  // Giallo acceso
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  digitalWrite(3, LOW);
  delay(1000);

  // Rosso acceso
  digitalWrite(5, LOW);
  digitalWrite(6, LOW);
  digitalWrite(3, HIGH);
  delay(3000);
}`,
      hexFile: "/hex/v3-cap6-semaforo.hex",
      scratchXml: SEMAFORO_SCRATCH,
      concept: "Sequenza stati, semaforo reale, timing multiplo",
      layer: "schema",
      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470Ω) e posizionalo nei fori B16 e B23 — circuito verde",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 è il resistore del LED verde, nella fila B a sinistra."
        },
        {
          step: 2,
          text: "Prendi il LED verde e mettilo nei fori D25 e D26. L'anodo (+) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Il verde è il primo colore del semaforo. Spostato a destra del resistore."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D23 al foro D25 (ponte R1→LED verde)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "green",
          hint: "Collega il resistore al LED verde attraverso le colonne."
        },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        {
          step: 4,
          text: "Prendi il resistore R2 (470Ω) e posizionalo nei fori E22 e E29 — circuito giallo",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 è il resistore del LED giallo, nella fila E (sotto i LED)."
        },
        {
          step: 5,
          text: "Prendi il LED giallo e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Il giallo è il secondo colore del semaforo."
        },
        {
          step: 6,
          text: "Prendi il resistore R3 (470Ω) e posizionalo nei fori I16 e I23 — circuito rosso",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23" },
          hint: "R3 è il resistore del LED rosso, nella fila I (parte bassa)."
        },
        {
          step: 7,
          text: "Prendi il LED rosso e mettilo nei fori H30 e H29. L'anodo (+) in H30!",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29" },
          hint: "Il rosso è il terzo colore del semaforo. Spostato a destra per evitare sovrapposizioni."
        },
        {
          step: 8,
          text: "Collega un filo VERDE dal foro H23 al foro H30 (ponte R3→LED rosso)",
          wireFrom: "bb1:h23",
          wireTo: "bb1:h30",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso attraverso le colonne."
        },
        {
          step: 9,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A16",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a16",
          wireColor: "green",
          hint: "D5 controlla il LED verde."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal foro A26 al binario GND (−) — catodo verde",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Il catodo del LED verde va a massa."
        },
        {
          step: 11,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino al foro A22",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:a22",
          wireColor: "yellow",
          hint: "D6 controlla il LED giallo."
        },
        {
          step: 12,
          text: "Collega un filo NERO dal foro A30 al binario GND (−) — catodo giallo",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Il catodo del LED giallo va a massa."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal pin D3 (breakout wing W_D3) al foro F16",
          wireFrom: "nano1:W_D3",
          wireTo: "bb1:f16",
          wireColor: "red",
          hint: "D3 (wing) controlla il LED rosso."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro F29 al binario GND (−) — catodo rosso",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "Il catodo del LED rosso va a massa."
        },
        {
          step: 15,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 16,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Il semaforo è pronto!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "3 circuiti LED su 3 pin diversi. Il programma li accende in sequenza!"
        }
      ],
      scratchSteps: [
        {
          step: 1,
          text: "Configura i 3 pin — trascina 3 blocchi PinMode nel Setup: pin 5 OUTPUT (verde), pin 6 OUTPUT (giallo), pin 3 OUTPUT (rosso)",
          explanation: "Un semaforo ha 3 luci indipendenti, quindi servono 3 pin diversi. Ogni blocco PinMode configura un pin — puoi impilarli uno sotto l'altro nel Setup.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
</block></xml>`
        },
        {
          step: 2,
          text: "Fase VERDE — nel Loop: DigitalWrite pin 5 HIGH, pin 6 LOW, pin 3 LOW, poi Attendi 3000 ms",
          explanation: "Nella fase verde, accendiamo solo il pin 5 (verde) e spegniamo gli altri due. Il delay 3000 ms = 3 secondi, come un vero semaforo.",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">3000</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block></xml>`
        },
        {
          step: 3,
          text: "Completa il semaforo — aggiungi fase GIALLA (pin 6 HIGH, 1000 ms) e fase ROSSA (pin 3 HIGH, 3000 ms). Il ciclo si ripete!",
          explanation: "Il giallo dura solo 1 secondo (1000 ms) perché nella realtà è una fase di transizione breve. Il Loop ripete tutto all'infinito: verde → giallo → rosso → verde...",
          xml: SEMAFORO_SCRATCH
        }
      ],
      quiz: [
        {
          question: "Perché nel semaforo si accende un solo LED alla volta?",
          options: ["Perché Arduino non ha abbastanza corrente per tutti", "Perché i LED sono collegati in serie", "Perché il codice spegne gli altri prima di accenderne uno nuovo"],
          correct: 2,
          explanation: "Il programma usa digitalWrite LOW per spegnere tutti i LED, poi accende solo quello giusto. Così funziona come un vero semaforo!"
        },
        {
          question: "Quale colore del semaforo resta acceso più a lungo?",
          options: ["Il giallo, con 3 secondi", "Il verde e il rosso, con 3 secondi ciascuno", "Tutti restano accesi lo stesso tempo"],
          correct: 1,
          explanation: "Il verde e il rosso hanno delay(3000) cioè 3 secondi, mentre il giallo ha delay(1000) cioè solo 1 secondo, come nei semafori veri!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 7 — I pin analogici (8 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap7-esp1",
      title: "Cap. 7 Esp. 1 - analogRead base",
      desc: "Leggiamo un trimmer (potenziometro) con analogRead! Se il valore supera 511, il LED si accende. Il trimmer restituisce valori da 0 a 1023.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F39B}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// analogRead base — trimmer controlla LED on/off
// A0 = trimmer, pin 13 = LED

void setup() {
  pinMode(A0, INPUT);
  pinMode(13, OUTPUT);
}

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
void loop() {
  int valoreLetto = analogRead(A0);
  if (valoreLetto > 511) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "analogRead, valori 0-1023, soglia, confronto",
      layer: "schema",

      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il potenziometro ha 3 pin: VCC, segnale e GND. La manopola regola la tensione."
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0. analogRead(A0) leggera valori 0-1023."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED si accende quando il trimmer supera meta corsa (valore > 511)."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 controlla il LED."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A28 al binario GND (-) - catodo LED",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Gira il trimmer e osserva!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Superata meta corsa (511) il LED si accende. E il tuo primo sensore analogico!"
        }
      ],
      scratchXml: ANALOG_READ_BASE_SCRATCH,
      steps: [
        "Collega il potenziometro: VCC al 5V, GND a massa, segnale al pin A0.",
        "Collega un LED con resistore al pin 13.",
        "Carica il codice e gira il potenziometro: superata la meta (511), il LED si accende!"
      ],
      observe: "Girando il potenziometro, il LED si accende quando superi la meta della rotazione (valore > 511 su 1023). E come un interruttore controllato dalla posizione della manopola!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta usando con la classe analogRead per la prima volta. Spiega che i pin analogici leggono valori da 0 a 1023 (10 bit), non solo HIGH/LOW come i digitali. Il trimmer e come una manopola del volume: girandolo cambia la tensione che Arduino legge. 511 e la meta. Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e il range di valori che analogRead puo restituire?",
          options: ["Da 0 a 255", "Da 0 a 1023", "Da 0 a 5"],
          correct: 1,
          explanation: "analogRead usa un convertitore a 10 bit, quindi restituisce valori da 0 (0 Volt) a 1023 (5 Volt). Sono 1024 livelli possibili!"
        },
        {
          question: "Cosa succede quando il valore del trimmer e esattamente 511?",
          options: ["Il LED si accende", "Il LED resta spento", "Arduino si resetta"],
          correct: 1,
          explanation: "Il codice dice if(valoreLetto > 511): il 511 NON e maggiore di 511, quindi la condizione e falsa e il LED resta spento. Serve almeno 512 per accenderlo!"
        }
      ]
    },
    {
      id: "v3-cap7-esp2",
      title: "Cap. 7 Esp. 2 - analogRead con tensione",
      desc: "Convertiamo il valore del trimmer in Volt veri! Con una formula semplice, Arduino ci dice quanti Volt sta leggendo sul pin A0.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{26A1}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D13", to: "bb1:a18", color: "orange" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// analogRead con tensione — converte in Volt
// A0 = trimmer, pin 13 = LED, soglia 2.5V

void setup() {
  pinMode(A0, INPUT);
  pinMode(13, OUTPUT);
}

void loop() {
  int valoreLetto = analogRead(A0);
  float tensione = (valoreLetto * 5.0) / 1023;
  if (tensione > 2.5) { digitalWrite(13, HIGH); } else { digitalWrite(13, LOW); }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Conversione ADC-Volt, float, formula proporzionale",
      layer: "schema",

      estimatedMinutes: 30,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Stesso circuito dell'Es. 7.1. Stavolta convertiamo in Volt!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "R1 protegge il LED."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED si accende sopra 2.5V (meta di 5V). La formula converte in Volt!"
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 8,
          text: "Collega un filo ARANCIONE dal pin D13 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D13",
          wireTo: "bb1:a18",
          wireColor: "orange",
          hint: "D13 controlla il LED."
        },
        {
          step: 9,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 10,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 11,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Ora ragioniamo in Volt!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "La formula (valore * 5.0) / 1023 converte il numero in Volt reali."
        }
      ],
      scratchXml: ANALOG_VOLTAGE_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'Es. 7.1 (potenziometro + LED).",
        "Nel codice, la variabile float tensione converte il valore 0-1023 in Volt 0-5V.",
        "Apri il Serial Monitor per vedere la tensione in tempo reale (aggiungi Serial.println)."
      ],
      observe: "Il LED si accende sopra 2.5V (meta di 5V). La formula (valore * 5.0) / 1023 converte il numero grezzo in Volt reali. E la stessa cosa dell'Es. 7.1 ma ora ragioniamo in Volt!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe convertendo valori analogici in Volt. La formula e semplice: (valore * 5.0) / 1023. Il 5.0 e la tensione massima, 1023 e il valore massimo dell'ADC. float serve perche i Volt hanno i decimali! Rispondi in italiano.",
      quiz: [
        {
          question: "Se analogRead restituisce 512, quanti Volt corrispondono circa?",
          options: ["Circa 1 Volt", "Circa 2.5 Volt", "Circa 5 Volt"],
          correct: 1,
          explanation: "La formula e (512 * 5.0) / 1023 = circa 2.5V. Il valore 512 e circa la meta di 1023, quindi la tensione e circa la meta di 5V!"
        },
        {
          question: "Perche usiamo il tipo float invece di int per la variabile tensione?",
          options: ["Perche float e piu veloce di int", "Perche la tensione ha i decimali (es. 2.5V) e int puo contenere solo numeri interi", "Perche Arduino non accetta int per i calcoli"],
          correct: 1,
          explanation: "int contiene solo numeri interi (1, 2, 3...), ma la tensione puo essere 2.5V o 3.7V. float permette di memorizzare numeri con la virgola!"
        }
      ]
    },
    {
      id: "v3-cap7-esp3",
      title: "Cap. 7 Esp. 3 - Trimmer controlla 3 LED",
      desc: "Il trimmer controlla 3 LED diversi! Poco girato = LED 1, a meta = LED 2, tutto girato = LED 3. Dividiamo il range 0-1023 in 3 zone.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F6A6}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 },
        { type: "resistor", id: "r1", value: 470 },
        { type: "resistor", id: "r2", value: 470 },
        { type: "resistor", id: "r3", value: 470 },
        { type: "led", id: "led1", color: "red" },
        { type: "led", id: "led2", color: "yellow" },
        { type: "led", id: "led3", color: "green" }
      ],
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:W_D3", to: "bb1:a16", color: "red" },
        { from: "bb1:d23", to: "bb1:d25", color: "green" },
        { from: "bb1:a26", to: "bb1:bus-bot-minus-26", color: "black" },
        { from: "nano1:W_D5", to: "bb1:a22", color: "green" },
        { from: "bb1:a30", to: "bb1:bus-bot-minus-30", color: "black" },
        { from: "nano1:W_D6", to: "bb1:f16", color: "yellow" },
        { from: "bb1:h23", to: "bb1:h30", color: "green" },
        { from: "bb1:f29", to: "bb1:bus-bot-minus-29", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24",
        "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23",
        "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26",
        "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29",
        "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30",
        "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23",
        "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29"
      },
      code: `// Trimmer controlla 3 LED — intervalli
// A0 = trimmer, pin 3/5/6 = LED

void setup() {
  pinMode(A0, INPUT);
  pinMode(3, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
}

void loop() {
  int valoreLetto = analogRead(A0);
  if ((valoreLetto >= 0) && (valoreLetto < 341)) {
    digitalWrite(3, HIGH); digitalWrite(5, LOW); digitalWrite(6, LOW);
  } else if ((valoreLetto >= 341) && (valoreLetto < 682)) {
    digitalWrite(3, LOW); digitalWrite(5, HIGH); digitalWrite(6, LOW);
  } else {
    digitalWrite(3, LOW); digitalWrite(5, LOW); digitalWrite(6, HIGH);
  }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 },
        "r1": { x: 436.5, y: 51.25 },
        "r2": { x: 481.5, y: 73.75 },
        "r3": { x: 436.5, y: 113.75 },
        "led1": { x: 481.5, y: 43.75 },
        "led2": { x: 511.5, y: 43.75 },
        "led3": { x: 519, y: 83.75 }
      },
      concept: "Intervalli, if-else if-else, range analogico diviso in zone",
      layer: "schema",

      estimatedMinutes: 45,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10k\u03A9 e posizionalo nei fori H22, H23, H24",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Il trimmer controlla quale dei 3 LED si accende."
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro al 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro ad A0."
        },
        {
          step: 4,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          text: "Collega un filo NERO dal foro F24 al binario GND (-)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro a massa."
        },
        {
          step: 5,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori B16 e B23 - circuito rosso",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:b16", "r1:pin2": "bb1:b23" },
          hint: "R1 protegge il LED rosso."
        },
        {
          step: 6,
          text: "Prendi il LED rosso e mettilo nei fori D25 e D26. L'anodo (+) in D25!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d25", "led1:cathode": "bb1:d26" },
          hint: "Primo LED: si accende quando il trimmer e nella zona bassa (0-340)."
        },
        {
          step: 7,
          text: "Collega un filo VERDE dal foro D23 al foro D25 (ponte R1 al LED rosso)",
          wireFrom: "bb1:d23",
          wireTo: "bb1:d25",
          wireColor: "green",
          hint: "Collega il resistore al LED rosso."
        },
        {
          step: 8,
          text: "Prendi il resistore R2 (470\u03A9) e posizionalo nei fori E22 e E29 - circuito giallo",
          componentId: "r2",
          componentType: "resistor",
          targetPins: { "r2:pin1": "bb1:e22", "r2:pin2": "bb1:e29" },
          hint: "R2 protegge il LED giallo."
        },
        {
          step: 9,
          text: "Prendi il LED giallo e mettilo nei fori D29 e D30. L'anodo (+) in D29!",
          componentId: "led2",
          componentType: "led",
          targetPins: { "led2:anode": "bb1:d29", "led2:cathode": "bb1:d30" },
          hint: "Secondo LED: si accende nella zona media (341-681)."
        },
        {
          step: 10,
          text: "Prendi il resistore R3 (470\u03A9) e posizionalo nei fori I16 e I23 - circuito verde",
          componentId: "r3",
          componentType: "resistor",
          targetPins: { "r3:pin1": "bb1:i16", "r3:pin2": "bb1:i23" },
          hint: "R3 protegge il LED verde."
        },
        {
          step: 11,
          text: "Prendi il LED verde e mettilo nei fori H30 e H29. L'anodo (+) in H30!",
          componentId: "led3",
          componentType: "led",
          targetPins: { "led3:anode": "bb1:h30", "led3:cathode": "bb1:h29" },
          hint: "Terzo LED: si accende nella zona alta (682-1023)."
        },
        {
          step: 12,
          text: "Collega un filo VERDE dal foro H23 al foro H30 (ponte R3 al LED verde)",
          wireFrom: "bb1:h23",
          wireTo: "bb1:h30",
          wireColor: "green",
          hint: "Collega il resistore al LED verde."
        },
        {
          step: 13,
          text: "Collega un filo ROSSO dal pin D3 dell'Arduino al foro A16",
          wireFrom: "nano1:W_D3",
          wireTo: "bb1:a16",
          wireColor: "red",
          hint: "D3 controlla il LED rosso."
        },
        {
          step: 14,
          text: "Collega un filo NERO dal foro A26 al binario GND (-) - catodo rosso",
          wireFrom: "bb1:a26",
          wireTo: "bb1:bus-bot-minus-26",
          wireColor: "black",
          hint: "Catodo del LED rosso verso massa."
        },
        {
          step: 15,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A22",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a22",
          wireColor: "green",
          hint: "D5 controlla il LED giallo."
        },
        {
          step: 16,
          text: "Collega un filo NERO dal foro A30 al binario GND (-) - catodo giallo",
          wireFrom: "bb1:a30",
          wireTo: "bb1:bus-bot-minus-30",
          wireColor: "black",
          hint: "Catodo del LED giallo verso massa."
        },
        {
          step: 17,
          text: "Collega un filo GIALLO dal pin D6 dell'Arduino al foro F16",
          wireFrom: "nano1:W_D6",
          wireTo: "bb1:f16",
          wireColor: "yellow",
          hint: "D6 controlla il LED verde."
        },
        {
          step: 18,
          text: "Collega un filo NERO dal foro F29 al binario GND (-) - catodo verde",
          wireFrom: "bb1:f29",
          wireTo: "bb1:bus-bot-minus-29",
          wireColor: "black",
          hint: "Catodo del LED verde verso massa."
        },
        {
          step: 19,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 20,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Gira il trimmer per cambiare LED!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Il range 0-1023 e diviso in 3 zone. Ogni zona accende un LED diverso!"
        }
      ],
      scratchXml: ANALOG_3LED_SCRATCH,
      steps: [
        "Collega il potenziometro ad A0 come prima.",
        "Collega 3 LED con resistori ai pin 3, 5 e 6.",
        "Carica il codice e gira il trimmer: vedrai accendersi un LED alla volta in base alla posizione!"
      ],
      observe: "Il range 0-1023 e diviso in 3 zone uguali: 0-340 accende il primo LED, 341-681 il secondo, 682-1023 il terzo. Girando il trimmer passi da un LED all'altro!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe dividendo il range analogico in 3 intervalli. 1023/3 = 341, quindi: zona 1 (0-340), zona 2 (341-681), zona 3 (682-1023). if-else if-else e come un semaforo con 3 condizioni. Rispondi in italiano.",
      quiz: [
        {
          question: "Perche dividiamo il range 0-1023 in 3 zone uguali?",
          options: ["Perche Arduino ha solo 3 pin", "Perche abbiamo 3 LED e vogliamo che ognuno si accenda in una porzione del trimmer", "Perche il trimmer ha solo 3 posizioni"],
          correct: 1,
          explanation: "Dividiamo 1024 valori in 3 zone (circa 341 valori ciascuna) cosi ogni LED corrisponde a un terzo della rotazione del trimmer. E come dividere una torta in 3 fette uguali!"
        },
        {
          question: "Se il valore letto dal trimmer e 500, quale LED si accende?",
          options: ["Il primo LED (pin 3)", "Il secondo LED (pin 5)", "Il terzo LED (pin 6)"],
          correct: 1,
          explanation: "500 e compreso tra 341 e 681, quindi cade nella seconda zona. Il codice entra nell'else if e accende il pin 5 (secondo LED)!"
        }
      ]
    },
    {
      id: "v3-cap7-esp6",
      title: "Cap. 7 Esp. 6 - Fade up/down con for",
      desc: "Il LED si accende gradualmente e poi si spegne gradualmente, all'infinito! Due cicli for: uno che sale da 0 a 255 e uno che scende da 255 a 0.",
      chapter: "Capitolo 7 - I pin analogici",
      difficulty: 2,
      icon: "\u{1F4AB}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "resistor", id: "r1", value: 470 },
        { type: "led", id: "led1", color: "red" }
      ],
      connections: [
        { from: "nano1:W_D5", to: "bb1:a18", color: "green" },
        { from: "bb1:d25", to: "bb1:d27", color: "green" },
        { from: "bb1:a28", to: "bb1:bus-bot-minus-28", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      pinAssignments: {
        "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25",
        "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28"
      },
      code: `// Fade up e down — respiro di luce
// Pin 5 = LED PWM

void setup() { pinMode(5, OUTPUT); }

void loop() {
  for (int i = 0; i <= 255; i = i + 5) { analogWrite(5, i); delay(10); }
  for (int i = 255; i >= 0; i = i - 5) { analogWrite(5, i); delay(10); }
}`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "r1": { x: 451.5, y: 58.75 },
        "led1": { x: 496.5, y: 43.75 }
      },
      concept: "Due cicli for, fade up e down, effetto respiro",
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il resistore R1 (470\u03A9) e posizionalo nei fori C18 e C25",
          componentId: "r1",
          componentType: "resistor",
          targetPins: { "r1:pin1": "bb1:c18", "r1:pin2": "bb1:c25" },
          hint: "Stesso circuito. Il fade up/down crea un effetto respiro!"
        },
        {
          step: 2,
          text: "Prendi il LED rosso e mettilo nei fori D27 e D28. L'anodo (+) in D27!",
          componentId: "led1",
          componentType: "led",
          targetPins: { "led1:anode": "bb1:d27", "led1:cathode": "bb1:d28" },
          hint: "Il LED crescera e calera di luminosita come un respiro."
        },
        {
          step: 3,
          text: "Collega un filo VERDE dal foro D25 al foro D27 (ponte R1 al LED)",
          wireFrom: "bb1:d25",
          wireTo: "bb1:d27",
          wireColor: "green",
          hint: "Collega il resistore al LED."
        },
        {
          step: 4,
          text: "Collega un filo VERDE dal pin D5 dell'Arduino al foro A18",
          wireFrom: "nano1:W_D5",
          wireTo: "bb1:a18",
          wireColor: "green",
          hint: "D5 e un pin PWM per l'effetto fade."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal foro A28 al binario GND (-)",
          wireFrom: "bb1:a28",
          wireTo: "bb1:bus-bot-minus-28",
          wireColor: "black",
          hint: "Catodo del LED verso massa."
        },
        {
          step: 6,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (-)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 7,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Guarda il respiro di luce!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Due for: uno sale (0 a 255) e uno scende (255 a 0). Effetto ipnotico!"
        }
      ],
      scratchXml: PWM_FADE_UPDOWN_SCRATCH,
      steps: [
        "Usa lo stesso circuito dell'Es. 7.4 (LED su pin 5).",
        "Il primo for sale (i va da 0 a 255), il secondo scende (i va da 255 a 0).",
        "L'effetto e un respiro continuo: luce che cresce e decresce!"
      ],
      observe: "Il LED fa un bellissimo effetto respiro: si accende piano, raggiunge il massimo, e poi si spegne piano. I due for lavorano in sequenza, uno dopo l'altro, all'infinito nel loop!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe facendo il fade up/down. Spiega che i due for sono speculari: il primo sale (i = i + 5) e il secondo scende (i = i - 5). Insieme creano un ciclo continuo. Si puo cambiare la velocita modificando delay o il passo (5). Rispondi in italiano.",
      quiz: [
        {
          question: "Perche servono DUE cicli for per l'effetto respiro?",
          options: ["Perche un solo for non funziona su Arduino", "Uno fa salire la luminosita da 0 a 255, l'altro la fa scendere da 255 a 0", "Perche il LED ha bisogno di due cicli per accendersi"],
          correct: 1,
          explanation: "Il primo for aumenta i da 0 a 255 (fade up), il secondo diminuisce i da 255 a 0 (fade down). Insieme creano il ciclo sale-scende che sembra un respiro!"
        },
        {
          question: "Come puoi rendere l'effetto respiro piu lento?",
          options: ["Aumentando il valore del delay nel for", "Usando un LED piu grande", "Togliendo il secondo for"],
          correct: 0,
          explanation: "Aumentando delay(10) a delay(30) o delay(50), ogni passo della luminosita dura piu a lungo e l'effetto diventa piu lento e rilassante. Puoi anche diminuire il passo da 5 a 1!"
        }
      ]
    },

    // ═══════════════════════════════════════════════════
    // CAPITOLO 8 — Comunicazione Seriale (5 esperimenti)
    // ═══════════════════════════════════════════════════
    {
      id: "v3-cap8-esp1",
      title: "Cap. 8 Esp. 1 - Serial.println in setup",
      desc: "Il primo messaggio da Arduino al computer! Scriviamo 'Ciao dal Team di ELAB!' una sola volta nel setup, e lo vediamo apparire nel Serial Monitor.",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 1,
      icon: "\u{1F4AC}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Serial println in setup — messaggio singolo
// Apri il Serial Monitor per vedere il messaggio!

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Ciao dal Team di ELAB!");
}

void loop() { }`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "Serial.begin, Serial.println, Serial Monitor, comunicazione USB",
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Non servono componenti esterni!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Basta il cavo USB. Il Serial Monitor riceve i messaggi da Arduino."
        }
      ],
      scratchXml: SERIAL_SETUP_SCRATCH,
      steps: [
        "Non serve nessun componente esterno: basta il cavo USB!",
        "Serial.begin(9600) avvia la comunicazione a 9600 baud.",
        "Apri il Serial Monitor e vedrai il messaggio apparire una sola volta."
      ],
      observe: "Nel Serial Monitor appare una sola volta 'Ciao dal Team di ELAB!'. Perche? Perche Serial.println e nel setup(), che si esegue UNA SOLA VOLTA all'accensione. Il loop() e vuoto!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta usando con la classe Serial per la prima volta! Serial e come un tubo che collega Arduino al computer via USB. Serial.begin(9600) apre il tubo a velocita 9600. while(!Serial) aspetta che il tubo sia pronto. println stampa una riga. Rispondi in italiano.",
      quiz: [
        {
          question: "Perche il messaggio appare una sola volta nel Serial Monitor?",
          options: ["Perche Serial.println puo stampare solo un messaggio", "Perche il codice e nel setup() che si esegue una sola volta all'accensione", "Perche il Serial Monitor si chiude dopo un messaggio"],
          correct: 1,
          explanation: "setup() viene eseguito UNA SOLA VOLTA quando Arduino si accende. Il loop() e vuoto, quindi dopo il messaggio il programma non fa piu niente!"
        },
        {
          question: "Cosa succede se dimentichi Serial.begin(9600)?",
          options: ["Il messaggio appare lo stesso", "Non appare niente nel Serial Monitor perche la comunicazione non e stata avviata", "Arduino si resetta"],
          correct: 1,
          explanation: "Serial.begin() apre il canale di comunicazione. Senza questa istruzione, Arduino non sa che deve parlare con il computer e println non manda nulla!"
        }
      ]
    },
    {
      id: "v3-cap8-esp2",
      title: "Cap. 8 Esp. 2 - Serial.println in loop",
      desc: "Ora il messaggio si ripete all'infinito! Spostando Serial.println nel loop(), Arduino scrive il messaggio continuamente. Attenzione: senza delay va velocissimo!",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 1,
      icon: "\u{1F501}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" }
      ],
      connections: [],
      code: `// Serial println in loop — messaggio ripetuto
// Apri il Serial Monitor e osserva il flusso!

void setup() { Serial.begin(9600); while (!Serial); }

void loop() { Serial.println("Ciao dal Team di ELAB!"); }`,
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 }
      },
      concept: "Differenza setup vs loop, flusso continuo, velocita seriale",
      layer: "schema",

      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Posiziona l'Arduino Nano sulla breadboard. Non servono componenti esterni!",
          componentId: "nano1",
          componentType: "nano-r4",
          targetPins: {},
          hint: "Stesso circuito dell'Es. 8.1. La differenza e nel codice: println e nel loop!"
        }
      ],
      scratchXml: SERIAL_LOOP_SCRATCH,
      steps: [
        "Il codice e quasi identico all'Es. 8.1, ma println e nel loop() invece che nel setup().",
        "Carica e apri il Serial Monitor: il messaggio appare continuamente!",
        "Prova ad aggiungere delay(1000) nel loop per rallentare."
      ],
      observe: "Il Serial Monitor si riempie di messaggi velocissimamente! Senza delay, Arduino stampa migliaia di righe al secondo. Aggiungendo delay(1000) il messaggio appare una volta al secondo.",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe confrontando setup vs loop per Serial. Spiega che il loop si ripete all'infinito: senza delay, Arduino e molto veloce e stampa tantissimo. Questo e utile per leggere sensori in tempo reale! Rispondi in italiano.",
      quiz: [
        {
          question: "Qual e la differenza tra mettere Serial.println nel setup() o nel loop()?",
          options: ["Nessuna differenza", "Nel setup si esegue una volta sola, nel loop si ripete all'infinito", "Nel setup stampa piu veloce"],
          correct: 1,
          explanation: "Il setup() si esegue UNA SOLA VOLTA all'accensione. Il loop() si ripete all'infinito. Mettendo println nel loop, il messaggio viene stampato continuamente!"
        },
        {
          question: "Cosa succede se aggiungi delay(1000) nel loop dopo Serial.println?",
          options: ["Il messaggio appare una volta al secondo invece che migliaia di volte", "Arduino si blocca", "Non cambia niente"],
          correct: 0,
          explanation: "delay(1000) fa aspettare 1 secondo tra un println e il successivo. Senza delay, Arduino stampa migliaia di messaggi al secondo perche il loop e velocissimo!"
        }
      ]
    },
    {
      id: "v3-cap8-esp3",
      title: "Cap. 8 Esp. 3 - analogRead + Serial Monitor",
      desc: "Leggi il valore del potenziometro su A0 e stampalo sul Serial Monitor! Valori 0-1023.",
      chapter: "Capitolo 8 - Comunicazione Seriale",
      difficulty: 2,
      icon: "\u{1F4CA}",
      simulationMode: "avr",
      components: [
        { type: "breadboard-half", id: "bb1" },
        { type: "nano-r4", id: "nano1" },
        { type: "potentiometer", id: "pot1", value: 10000 }
      ],
      pinAssignments: {
        "pot1:vcc": "bb1:h22",
        "pot1:signal": "bb1:h23",
        "pot1:gnd": "bb1:h24"
      },
      connections: [
        { from: "bb1:f22", to: "bb1:bus-bot-plus-22", color: "red" },
        { from: "nano1:W_A0", to: "bb1:f23", color: "yellow" },
        { from: "bb1:f24", to: "bb1:bus-bot-minus-24", color: "black" },
        { from: "nano1:GND_R", to: "bb1:bus-bot-minus-1", color: "black" },
        { from: "nano1:5V", to: "bb1:bus-bot-plus-1", color: "red" }
      ],
      // Same pot layout as cap8-pot
      // vcc col 22 → 5V bus, signal col 23 → A0, gnd col 24 → GND bus
      layout: {
        "nano1": { x: 230, y: 10, parentId: "bb1" },
        "bb1": { x: 280, y: 10 },
        "pot1": { x: 462.75, y: 83.75 }
      },
      steps: [
        "Costruisci lo stesso circuito dell'esperimento precedente (potenziometro su A0).",
        "Carica il programma: apre la comunicazione seriale a 9600 baud.",
        "Apri il Serial Monitor nel simulatore (pannello in basso).",
        "Gira lentamente la manopola del potenziometro.",
        "Osserva i numeri che appaiono sul Serial Monitor: vanno da 0 a 1023.",
        "Prova a trovare il valore 512 (metà corsa) girando la manopola con precisione!"
      ],
      observe: "Sul Serial Monitor appaiono numeri che cambiano in tempo reale quando giri la manopola. Il valore va da 0 (manopola tutta a sinistra, 0V) a 1023 (tutta a destra, 5V). Questo è il convertitore analogico-digitale (ADC) a 10 bit dell'Arduino: trasforma una tensione analogica in un numero digitale!",
      unlimPrompt: "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento 'analogRead + Serial Monitor' del Volume 3 — Arduino Programmato. Questo è il primo esperimento con i pin analogici E il Serial Monitor! Il codice usa Serial.begin(9600) nel setup per aprire la comunicazione seriale. Nel loop(), analogRead(A0) legge il valore del potenziometro come un numero da 0 a 1023 (ADC a 10 bit), poi Serial.println(valore) lo stampa sul monitor. Il delay(200) evita di stampare troppo velocemente. È come un termometro digitale che legge la temperatura e la mostra sullo schermo! Spiega il codice riga per riga in modo semplice, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.",
      code: `// analogRead + Serial Monitor
// Potenziometro su A0, stampa valore 0-1023

void setup() {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  Serial.begin(9600);
}

void loop() {
  int valore = analogRead(A0);
  Serial.println(valore);
  delay(200);
}`,
      hexFile: "/hex/v3-cap8-esp3.hex",
      scratchXml: SERIAL_SCRATCH,
      concept: "analogRead, Serial Monitor, ADC 10 bit (0-1023)",
      layer: "schema",
      estimatedMinutes: 15,
      buildSteps: [
        {
          step: 1,
          text: "Prendi il potenziometro da 10kΩ e posizionalo nei fori H22, H23, H24 (come l'esperimento precedente)",
          componentId: "pot1",
          componentType: "potentiometer",
          targetPins: { "pot1:vcc": "bb1:h22", "pot1:signal": "bb1:h23", "pot1:gnd": "bb1:h24" },
          hint: "Stesso collegamento dell'esperimento precedente. Stavolta aggiungiamo il codice!"
        },
        {
          step: 2,
          text: "Collega un filo ROSSO dal foro F22 al binario + (5V)",
          wireFrom: "bb1:f22",
          wireTo: "bb1:bus-bot-plus-22",
          wireColor: "red",
          hint: "VCC del potenziometro → 5V."
        },
        {
          step: 3,
          text: "Collega un filo GIALLO dal pin A0 dell'Arduino al foro F23",
          wireFrom: "nano1:W_A0",
          wireTo: "bb1:f23",
          wireColor: "yellow",
          hint: "Segnale del potenziometro → A0. analogRead(A0) leggerà valori 0-1023."
        },
        {
          step: 4,
          text: "Collega un filo NERO dal foro F24 al binario GND (−)",
          wireFrom: "bb1:f24",
          wireTo: "bb1:bus-bot-minus-24",
          wireColor: "black",
          hint: "GND del potenziometro → massa."
        },
        {
          step: 5,
          text: "Collega un filo NERO dal pin GND dell'Arduino al binario GND (−)",
          wireFrom: "nano1:GND_R",
          wireTo: "bb1:bus-bot-minus-1",
          wireColor: "black",
          hint: "Massa dell'Arduino."
        },
        {
          step: 6,
          text: "Collega un filo ROSSO dal pin 5V al binario +. Apri il Serial Monitor per vedere i valori!",
          wireFrom: "nano1:5V",
          wireTo: "bb1:bus-bot-plus-1",
          wireColor: "red",
          hint: "Gira la manopola e osserva i numeri 0-1023 sul Serial Monitor!"
        }
      ],
      // S102: Scratch steps — analogRead + Serial Monitor
      scratchSteps: [
        {
          label: "Apri l'editor blocchi",
          description: "Programmiamo la lettura analogica! Apri l'editor e vai sulla tab Blocchi.",
          explanation: "Questo esperimento introduce due concetti nuovi: leggere un valore analogico (0-1023) e stamparlo sul Serial Monitor. È come avere un termometro digitale che mostra la temperatura sullo schermo!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"></block></xml>`,
        },
        {
          label: "Inizializza la comunicazione seriale",
          description: "Nel Setup, trascina un blocco 'Serial.begin' dal menu Seriale. Imposta la velocità a 9600 baud.",
          explanation: "Serial.begin(9600) apre un canale di comunicazione tra Arduino e il computer a 9600 bit/secondo. È come sintonizzare la radio sulla stessa frequenza per poter parlare!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_serial_begin"><field name="BAUD">9600</field></block></statement></block></xml>`,
        },
        {
          label: "Leggi il potenziometro",
          description: "Nel Loop, trascina un blocco 'Dichiara variabile' dal menu Variabili. Tipo: int, nome: valore, e come valore metti un blocco 'AnalogRead' con pin A0.",
          explanation: "analogRead(A0) converte la tensione del potenziometro (0-5V) in un numero da 0 a 1023. Questa conversione si chiama ADC (Analog to Digital Converter) — è come trasformare il volume di una radio in un numero!",
          xml: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="arduino_base" x="40" y="30" deletable="false"><statement name="SETUP"><block type="arduino_serial_begin"><field name="BAUD">9600</field></block></statement><statement name="LOOP"><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field><value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value></block></statement></block></xml>`,
        },
        {
          label: "Stampa e rallenta",
          description: "Dopo la variabile, aggiungi 'Serial.print' con newline ✓ e come contenuto il blocco 'Leggi variabile: valore'. Poi aggiungi 'Attendi 200ms' per non stampare troppo veloce. Compila e apri il Serial Monitor!",
          explanation: "Serial.println() stampa il valore e va a capo. Il delay(200) evita di riempire lo schermo troppo velocemente — 5 letture al secondo sono sufficienti. Gira la manopola e vedrai i numeri cambiare in tempo reale!",
          xml: SERIAL_SCRATCH,
        },
      ],
      quiz: [
        {
          question: "Cosa fa Serial.begin(9600) nel setup?",
          options: ["Avvia la comunicazione seriale a 9600 baud (velocità di trasmissione)", "Accende il LED sul pin 9600", "Aspetta 9600 millisecondi"],
          correct: 0,
          explanation: "Serial.begin(9600) apre la comunicazione tra Arduino e il computer a 9600 baud. Serve per poter inviare e ricevere dati."
        },
        {
          question: "A cosa serve il Serial Monitor?",
          options: ["A programmare Arduino", "A vedere i dati che Arduino invia al computer in tempo reale", "A controllare la temperatura di Arduino"],
          correct: 1,
          explanation: "Il Serial Monitor è una finestra che mostra i messaggi inviati da Arduino al computer tramite Serial.println(). Utilissimo per il debug!"
        }
      ]
    }
  ]
};

export default EXPERIMENTS_VOL3;
