/**
 * Progressive Blockly toolbox 3-level reveal for ELAB Tutor kids 8-14.
 */

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
