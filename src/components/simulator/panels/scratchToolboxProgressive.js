// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Progressive Blockly toolbox 3-level reveal for ELAB Tutor kids 8-14.
 *
 * ⚠️ iter 82 PHASE 5.5 — NOT FUNCTIONAL UNTIL iter 83+ AUDIT ⚠️
 *
 * Block IDs (digital_write, led_on_pin, delay, tone, analog_read, etc.)
 * are FABRICATED — NOT registered in scratchBlocks.js. Real registry
 * uses arduino_* prefix (arduino_digital_write, arduino_delay, arduino_tone,
 * arduino_analog_read, ...). If wired into Blockly.inject() WITHOUT block
 * ID rename, flyout throws "Unknown block type" errors at mount time.
 *
 * Codex Pattern V (iter 82 BLOCK-PUSH MED-2) + code-reviewer (CRITICAL-3)
 * both flagged this. Tests T1-T5 (5/5 PASS) measure array shape ONLY, NOT
 * Blockly compatibility. ScratchEditor.jsx does NOT import this file in
 * iter 82 — TOOLBOX_XML legacy preserved per Phase 2 honest deferral.
 *
 * iter 83+ atom MANDATORY: audit + rename all block IDs to scratchBlocks.js
 * canonical names + add integration test asserting Blockly.Blocks[type]
 * exists for every toolbox entry BEFORE wiring into ScratchEditor.
 *
 * Level 1 (default): 4 categories — Eventi + LED + Movimento + Aspetta.
 * Level 2: +3 — Variabili + Logica + Numeri.
 * Level 3: full 12 — Funzioni + Liste + Sensori + Suono + Seriale.
 */

if (typeof console !== 'undefined' && typeof console.warn === 'function') {
  console.warn(
    '[scratchToolboxProgressive] NOT WIRED — block IDs fabricated. ' +
    'Do not use until iter 83+ audit (Codex Pattern V + code-reviewer iter 82 close).'
  );
}

const LIVELLO_1_CATEGORIES = [
  { kind: 'category', name: 'Eventi', colour: '#FFD700', contents: [
    { kind: 'block', type: 'arduino_setup' },
    { kind: 'block', type: 'arduino_loop' },
  ]},
  { kind: 'category', name: 'LED', colour: '#E54B3D', contents: [
    { kind: 'block', type: 'digital_write' },
    { kind: 'block', type: 'led_on_pin' },
  ]},
  { kind: 'category', name: 'Movimento', colour: '#4A7A25', contents: [
    { kind: 'block', type: 'analog_write' },
    { kind: 'block', type: 'servo_write' },
  ]},
  { kind: 'category', name: 'Aspetta', colour: '#E8941C', contents: [
    { kind: 'block', type: 'delay' },
    { kind: 'block', type: 'delay_microseconds' },
  ]},
];

const LIVELLO_2_EXTRA = [
  { kind: 'category', name: 'Variabili', colour: '#1E4D8C', custom: 'VARIABLE' },
  { kind: 'category', name: 'Logica', colour: '#9B59B6', contents: [
    { kind: 'block', type: 'controls_if' },
    { kind: 'block', type: 'logic_compare' },
    { kind: 'block', type: 'logic_operation' },
  ]},
  { kind: 'category', name: 'Numeri', colour: '#16A085', contents: [
    { kind: 'block', type: 'math_number' },
    { kind: 'block', type: 'math_arithmetic' },
  ]},
];

const LIVELLO_3_EXTRA = [
  { kind: 'category', name: 'Funzioni', colour: '#34495E', custom: 'PROCEDURE' },
  { kind: 'category', name: 'Liste', colour: '#7F8C8D', contents: [
    { kind: 'block', type: 'lists_create_with' },
    { kind: 'block', type: 'lists_indexOf' },
  ]},
  { kind: 'category', name: 'Sensori', colour: '#D35400', contents: [
    { kind: 'block', type: 'analog_read' },
    { kind: 'block', type: 'digital_read' },
  ]},
  { kind: 'category', name: 'Suono', colour: '#8E44AD', contents: [
    { kind: 'block', type: 'tone' },
    { kind: 'block', type: 'noTone' },
  ]},
  { kind: 'category', name: 'Seriale', colour: '#27AE60', contents: [
    { kind: 'block', type: 'serial_begin' },
    { kind: 'block', type: 'serial_println' },
  ]},
];

export function getProgressiveToolbox(level = 1) {
  let contents = [...LIVELLO_1_CATEGORIES];
  if (level >= 2) contents = [...contents, ...LIVELLO_2_EXTRA];
  if (level >= 3) contents = [...contents, ...LIVELLO_3_EXTRA];
  return { kind: 'categoryToolbox', contents };
}
