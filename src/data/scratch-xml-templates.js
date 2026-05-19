/**
 * ELAB Scratch XML Templates — Blockly workspace XML per Vol3 experiments
 *
 * Ogni template traduce il codice C++ dell'esperimento in blocchi Blockly visivi.
 * I bambini possono modificare i parametri (pin, tempi, soglie) senza scrivere codice.
 *
 * Non tutti gli esperimenti possono avere scratchXml:
 * - v3-cap6-esp1: circuito puro (code: null) → NO scratchXml
 * - v3-cap6-morse: usa funzioni custom (punto/linea) → versione semplificata
 *
 * © Andrea Marro — 10/04/2026
 */

// ─── Cap.5 Esp.1 — Blink LED_BUILTIN (pin 13) ─────────────
export const BLINK_BUILTIN_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ─── Cap.5 Esp.2 — Blink veloce (200ms) ────────────────────
export const BLINK_FAST_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ─── Cap.6 Esp.2 — LED esterno su pin 13 ───────────────────
export const LED_ESTERNO_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ─── Cap.6 Esp.3 — Cambia pin (pin 5) ──────────────────────
export const CAMBIA_PIN_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ─── Cap.6 Esp.4 — Due LED effetto polizia (3 LED sequenza) ─
export const POLIZIA_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ─── Cap.6 Esp.5 — Pulsante toggle con INPUT_PULLUP ────────
export const PULSANTE_TOGGLE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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
</block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ─── Cap.6 Morse — versione semplificata (senza funzioni custom) ─
export const MORSE_SIMPLE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_repeat_ext"><value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
<statement name="DO">
<block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">HIGH</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
<next><block type="arduino_digital_write"><field name="PIN">13</field><field name="STATE">LOW</field>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
</block></next></block></next></block></next></block>
</statement>
</block>
</statement>
</block></xml>`;

// ─── Cap.7 Esp.1 — analogRead base (soglia on/off) ─────────
export const ANALOG_READ_BASE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">GT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
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

// ─── Cap.7 Esp.3 — Trimmer controlla 3 LED ─────────────────
export const TRIMMER_3LED_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">3</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field>
<next><block type="arduino_pin_mode"><field name="PIN">6</field><field name="MODE">OUTPUT</field>
</block></next></block></next></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="controls_if">
<mutation else="1"/>
<value name="IF0">
<block type="logic_compare"><field name="OP">LT</field>
<value name="A"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<value name="B"><shadow type="math_number"><field name="NUM">341</field></shadow></value>
</block>
</value>
<statement name="DO0">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">HIGH</field>
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">LOW</field>
</block></next></block></next></block>
</statement>
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">3</field><field name="STATE">LOW</field>
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
<next><block type="arduino_digital_write"><field name="PIN">5</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">6</field><field name="STATE">HIGH</field>
</block></next></block></next></block>
</statement>
</block></next></block>
</statement>
</block></xml>`;

// ─── Cap.7 Esp.4 — PWM fade (for loop analogWrite) ─────────
export const PWM_FADE_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_for">
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

// ─── Cap.7 Esp.5 — PWM valori manuali ──────────────────────
export const PWM_MANUAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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

// ─── Cap.7 Esp.7 — Trimmer controlla luminosita con map() ──
export const TRIMMER_MAP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valore</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A0</field></block></value>
<next><block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE">
<block type="arduino_map">
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">valore</field></block></value>
<value name="FROM_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="FROM_HIGH"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
<value name="TO_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="TO_HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
</block>
</value>
</block></next></block>
</statement>
</block></xml>`;

// ─── Cap.8 Esp.1 — Serial.println in setup ─────────────────
export const SERIAL_SETUP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="text"><field name="TEXT">Ciao dal Team di ELAB!</field></block></value>
</block></next></block>
</statement>
</block></xml>`;

// ─── Cap.8 Esp.2 — Serial.println in loop ──────────────────
export const SERIAL_LOOP_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="text"><field name="TEXT">Ciao dal Team di ELAB!</field></block></value>
</block>
</statement>
</block></xml>`;

// ─── Cap.8 Esp.5 — Pot + 3 LED + Serial ────────────────────
export const POT_3LED_SERIAL_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
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
<mutation else="1"/>
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
<statement name="ELSE">
<block type="arduino_digital_write"><field name="PIN">12</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">11</field><field name="STATE">LOW</field>
<next><block type="arduino_digital_write"><field name="PIN">10</field><field name="STATE">HIGH</field>
</block></next></block></next></block>
</statement>
</block></next></block></next></block>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
</block></next></statement>
</block></xml>`;

// ─── Cap.7 Esp.6 — PWM fade up + down (respiro di luce) ────
export const PWM_FADE_UPDOWN_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_pin_mode"><field name="PIN">5</field><field name="MODE">OUTPUT</field></block>
</statement>
<statement name="LOOP">
<block type="controls_for">
<value name="FROM"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
<value name="TO"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
<value name="BY"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
<statement name="DO">
<block type="arduino_analog_write"><field name="PIN">5</field>
<value name="VALUE"><block type="arduino_variable_get"><field name="VAR">i</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
</block></next></block>
</statement>
<next><block type="controls_for">
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

// ─── Cap.8 Esp.4 — Serial Plotter con 2 potenziometri ──────
export const SERIAL_2POT_SCRATCH = `<xml xmlns="https://developers.google.com/blockly/xml">
<block type="arduino_base" x="40" y="30" deletable="false">
<statement name="SETUP">
<block type="arduino_serial_begin"><field name="BAUD">9600</field></block>
</statement>
<statement name="LOOP">
<block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valA3</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A3</field></block></value>
<next><block type="arduino_variable_set"><field name="TYPE">int</field><field name="VAR">valA4</field>
<value name="VALUE"><block type="arduino_analog_read"><field name="PIN">A4</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valA3</field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">FALSE</field>
<value name="CONTENT"><block type="text"><field name="TEXT"> </field></block></value>
<next><block type="arduino_serial_print"><field name="NEWLINE">TRUE</field>
<value name="CONTENT"><block type="arduino_variable_get"><field name="VAR">valA4</field></block></value>
<next><block type="arduino_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
</block></next></block></next></block></next></block></next></block></next></block>
</statement>
</block></xml>`;
