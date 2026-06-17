// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Progressive Blockly toolbox + canonical 16-category shape for ELAB Tutor
 * kids 8-14.
 *
 * Wave 1 (iter 82 PHASE 5.5) — progressive 3-level reveal scaffold.
 * Wave 1b (2026-05-25, this file) — canonical 16 categories + IT verbatim
 * labels + search filter + collapse/expand state + welcome empty state.
 *
 * ⚠️ NOT FUNCTIONAL UNTIL iter 83+ AUDIT ⚠️
 *
 * Block IDs in the progressive helper (digital_write, led_on_pin, delay,
 * tone, analog_read, etc.) are FABRICATED — NOT registered in
 * scratchBlocks.js. Real registry uses arduino_* prefix (arduino_digital_write,
 * arduino_delay, arduino_tone, arduino_analog_read, ...). If wired into
 * Blockly.inject() WITHOUT block ID rename, flyout throws
 * "Unknown block type" errors at mount time.
 *
 * Codex Pattern V (iter 82 BLOCK-PUSH MED-2) + code-reviewer (CRITICAL-3)
 * both flagged this. Tests measure array shape ONLY (and Wave 1b helper
 * behavior), NOT Blockly compatibility. ScratchEditor.jsx does NOT import
 * this file in iter 82/Wave 1 — TOOLBOX_XML legacy preserved per Phase 2
 * honest deferral.
 *
 * Canonical 16-category shape (Wave 1b) USES arduino_* prefixed block IDs
 * known to be registered in scratchBlocks.js, so getCanonicalToolbox()
 * output is safe to wire into Blockly.inject() at the next ScratchEditor
 * integration atom.
 *
 * iter 83+ atom MANDATORY for progressive shape: audit + rename all block
 * IDs to scratchBlocks.js canonical names + add integration test asserting
 * Blockly.Blocks[type] exists for every toolbox entry BEFORE wiring into
 * ScratchEditor.
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

// ───────────────────────────────────────────────────────────────────────
// Wave 2b Impl-H — ARIA semantics layer (additive, NO logic changes).
//
// Each category gets an `ariaLabel` (IT verbatim per Principio Zero,
// addressing the LIM-projected docente — "Categoria <name>, contiene
// blocchi <type>"). Category objects also carry `role: 'group'` to
// signal toolbox semantics + `ariaExpanded: true` default for the
// collapsible UI layer (paired with the existing `collapsed` flag).
//
// Wave 1b test assertions remain untouched: the cloned output through
// getCanonicalToolbox / getProgressiveToolbox still surfaces the same
// {kind,name,colour,custom?,contents?} shape Wave 1b tests assert on,
// plus optional ariaLabel/role/ariaExpanded fields tolerated.
// ───────────────────────────────────────────────────────────────────────

const LIVELLO_1_CATEGORIES = [
  { kind: 'category', name: 'Eventi', colour: '#FFD700',
    ariaLabel: 'Categoria Eventi, blocchi avvio Arduino',
    contents: [
      { kind: 'block', type: 'arduino_setup' },
      { kind: 'block', type: 'arduino_loop' },
    ]},
  { kind: 'category', name: 'LED', colour: '#E54B3D',
    ariaLabel: 'Categoria LED, blocchi accensione luci',
    contents: [
      { kind: 'block', type: 'digital_write' },
      { kind: 'block', type: 'led_on_pin' },
    ]},
  { kind: 'category', name: 'Movimento', colour: '#4A7A25',
    ariaLabel: 'Categoria Movimento, blocchi servo e PWM',
    contents: [
      { kind: 'block', type: 'analog_write' },
      { kind: 'block', type: 'servo_write' },
    ]},
  { kind: 'category', name: 'Aspetta', colour: '#E8941C',
    ariaLabel: 'Categoria Aspetta, blocchi tempo e pausa',
    contents: [
      { kind: 'block', type: 'delay' },
      { kind: 'block', type: 'delay_microseconds' },
    ]},
];

const LIVELLO_2_EXTRA = [
  { kind: 'category', name: 'Variabili', colour: '#1E4D8C', custom: 'VARIABLE',
    ariaLabel: 'Categoria Variabili, contenitori per memorizzare valori' },
  { kind: 'category', name: 'Logica', colour: '#9B59B6',
    ariaLabel: 'Categoria Logica, blocchi se-allora-altrimenti',
    contents: [
      { kind: 'block', type: 'controls_if' },
      { kind: 'block', type: 'logic_compare' },
      { kind: 'block', type: 'logic_operation' },
    ]},
  { kind: 'category', name: 'Numeri', colour: '#16A085',
    ariaLabel: 'Categoria Numeri, blocchi matematica base',
    contents: [
      { kind: 'block', type: 'math_number' },
      { kind: 'block', type: 'math_arithmetic' },
    ]},
];

const LIVELLO_3_EXTRA = [
  { kind: 'category', name: 'Funzioni', colour: '#34495E', custom: 'PROCEDURE',
    ariaLabel: 'Categoria Funzioni, blocchi riutilizzabili definiti dal docente' },
  { kind: 'category', name: 'Liste', colour: '#7F8C8D',
    ariaLabel: 'Categoria Liste, blocchi array e raccolte',
    contents: [
      { kind: 'block', type: 'lists_create_with' },
      { kind: 'block', type: 'lists_indexOf' },
    ]},
  { kind: 'category', name: 'Sensori', colour: '#D35400',
    ariaLabel: 'Categoria Sensori, blocchi lettura analogica e digitale',
    contents: [
      { kind: 'block', type: 'analog_read' },
      { kind: 'block', type: 'digital_read' },
    ]},
  { kind: 'category', name: 'Suono', colour: '#8E44AD',
    ariaLabel: 'Categoria Suono, blocchi tono buzzer',
    contents: [
      { kind: 'block', type: 'tone' },
      { kind: 'block', type: 'noTone' },
    ]},
  { kind: 'category', name: 'Seriale', colour: '#27AE60',
    ariaLabel: 'Categoria Seriale, blocchi comunicazione USB',
    contents: [
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

// ───────────────────────────────────────────────────────────────────────
// Wave 1b — Canonical 16-category toolbox (PROMPT-CROSSCOMPILATORE Sez 1).
//
// Block IDs here MATCH the scratchBlocks.js registry (arduino_* prefix) so
// this output is safe to wire into Blockly.inject() at a future
// ScratchEditor integration atom. Search box + collapse helpers are pure
// data-transform — no Blockly runtime dependency, fully unit-testable.
// ───────────────────────────────────────────────────────────────────────

/**
 * Canonical 16 IT category names — exact source-of-truth verbatim from
 * PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 line 88.
 *
 * Frozen to prevent accidental mutation by callers. Linguaggio plurale
 * Vol1/Vol2 (Principio Zero): "Ripeti" not "Loop", "Tempo" not "Time",
 * "Comunicazione Serial" not "Serial Communication".
 */
export const CANONICAL_CATEGORY_NAMES = Object.freeze([
  'Setup',
  'Pin digitali',
  'Pin analogici',
  'Ripeti',
  'Matematica',
  'Logica',
  'Variabili',
  'Funzioni',
  'Comunicazione Serial',
  'Sensori',
  'Attuatori',
  'Tempo',
  'Stringhe',
  'RGB LED',
  'Servo',
  'Buzzer',
]);

// Canonical 16-category metadata with Wave 2b Impl-H ARIA additions.
// `ariaLabel` IT verbatim per Principio Zero (linguaggio plurale Vol1/Vol2,
// addresses LIM docente). Order preserves CANONICAL_CATEGORY_NAMES Sez 1.
const CANONICAL_CATEGORIES = [
  { name: 'Setup', colour: '#1E4D8C',
    ariaLabel: 'Categoria Setup, blocchi configurazione iniziale Arduino',
    contents: [
      { kind: 'block', type: 'arduino_base' },
      { kind: 'block', type: 'arduino_pin_mode' },
    ]},
  { name: 'Pin digitali', colour: '#4A7A25',
    ariaLabel: 'Categoria Pin digitali, blocchi accendere e spegnere pin',
    contents: [
      { kind: 'block', type: 'arduino_digital_write' },
      { kind: 'block', type: 'arduino_digital_read' },
    ]},
  { name: 'Pin analogici', colour: '#E8941C',
    ariaLabel: 'Categoria Pin analogici, blocchi PWM e lettura analogica',
    contents: [
      { kind: 'block', type: 'arduino_analog_write' },
      { kind: 'block', type: 'arduino_analog_read' },
    ]},
  { name: 'Ripeti', colour: '#2E7D50',
    ariaLabel: 'Categoria Ripeti, blocchi cicli e iterazioni',
    contents: [
      { kind: 'block', type: 'controls_repeat_ext' },
      { kind: 'block', type: 'controls_whileUntil' },
      { kind: 'block', type: 'controls_for' },
    ]},
  { name: 'Matematica', colour: '#3A8A9E',
    ariaLabel: 'Categoria Matematica, blocchi operazioni aritmetiche',
    contents: [
      { kind: 'block', type: 'math_number' },
      { kind: 'block', type: 'math_arithmetic' },
      { kind: 'block', type: 'arduino_map' },
      { kind: 'block', type: 'arduino_random' },
      { kind: 'block', type: 'math_modulo' },
      { kind: 'block', type: 'math_constrain' },
    ]},
  { name: 'Logica', colour: '#1E4D8C',
    ariaLabel: 'Categoria Logica, blocchi se-allora-altrimenti e confronti',
    contents: [
      { kind: 'block', type: 'controls_if' },
      { kind: 'block', type: 'logic_compare' },
      { kind: 'block', type: 'logic_operation' },
      { kind: 'block', type: 'logic_negate' },
      { kind: 'block', type: 'logic_boolean' },
    ]},
  { name: 'Variabili', colour: '#F5A623', custom: 'VARIABLE',
    ariaLabel: 'Categoria Variabili, contenitori per memorizzare valori' },
  { name: 'Funzioni', colour: '#345E94', custom: 'PROCEDURE',
    ariaLabel: 'Categoria Funzioni, blocchi riutilizzabili definiti dal docente' },
  { name: 'Comunicazione Serial', colour: '#E54B3D',
    ariaLabel: 'Categoria Comunicazione Serial, blocchi USB Serial Monitor',
    contents: [
      { kind: 'block', type: 'arduino_serial_begin' },
      { kind: 'block', type: 'arduino_serial_print' },
      { kind: 'block', type: 'arduino_serial_available' },
      { kind: 'block', type: 'arduino_serial_read' },
    ]},
  { name: 'Sensori', colour: '#D35400',
    ariaLabel: 'Categoria Sensori, blocchi lettura sensori analogici e digitali',
    contents: [
      { kind: 'block', type: 'arduino_analog_read' },
      { kind: 'block', type: 'arduino_digital_read' },
      { kind: 'block', type: 'arduino_pulse_in' },
    ]},
  { name: 'Attuatori', colour: '#0EA87B',
    ariaLabel: 'Categoria Attuatori, blocchi controllo motori e LED',
    contents: [
      { kind: 'block', type: 'arduino_digital_write' },
      { kind: 'block', type: 'arduino_analog_write' },
    ]},
  { name: 'Tempo', colour: '#F5A623',
    ariaLabel: 'Categoria Tempo, blocchi pause e millisecondi',
    contents: [
      { kind: 'block', type: 'arduino_delay' },
      { kind: 'block', type: 'arduino_millis' },
    ]},
  { name: 'Stringhe', colour: '#5A8DBE',
    ariaLabel: 'Categoria Stringhe, blocchi testo e concatenazione',
    contents: [
      { kind: 'block', type: 'text' },
      { kind: 'block', type: 'text_join' },
    ]},
  { name: 'RGB LED', colour: '#9E5AC0',
    ariaLabel: 'Categoria RGB LED, blocchi LED tre colori',
    contents: [
      { kind: 'block', type: 'arduino_rgb_led' },
      { kind: 'block', type: 'arduino_analog_write' },
    ]},
  { name: 'Servo', colour: '#0EA87B',
    ariaLabel: 'Categoria Servo, blocchi servomotore angoli',
    contents: [
      { kind: 'block', type: 'arduino_servo_attach' },
      { kind: 'block', type: 'arduino_servo_write' },
      { kind: 'block', type: 'arduino_servo_read' },
    ]},
  { name: 'Buzzer', colour: '#9E5AC0',
    ariaLabel: 'Categoria Buzzer, blocchi tono e note musicali',
    contents: [
      { kind: 'block', type: 'arduino_tone' },
      { kind: 'block', type: 'arduino_no_tone' },
    ]},
];

/**
 * Return the canonical 16-category toolbox tree.
 *
 * @returns {{kind:'categoryToolbox', contents: Array<object>}}
 *
 * Output shape matches Blockly 12.x toolbox JSON spec:
 * `{ kind:'category', name, colour, custom?, contents? }`.
 * Returned tree is a fresh deep-ish clone — callers can mutate freely.
 */
export function getCanonicalToolbox() {
  return {
    kind: 'categoryToolbox',
    contents: CANONICAL_CATEGORIES.map((cat) => ({
      kind: 'category',
      name: cat.name,
      colour: cat.colour,
      // Wave 2b Impl-H ARIA additive layer — present on every canonical
      // category (16/16) so the consuming UI layer (ScratchEditor toolbox
      // integration atom) can apply aria-label + role="group" + aria-expanded
      // directly from the data tree without runtime mapping.
      ...(cat.ariaLabel ? { ariaLabel: cat.ariaLabel } : {}),
      role: 'group',
      ariaExpanded: true,
      ...(cat.custom ? { custom: cat.custom } : {}),
      ...(cat.contents ? { contents: cat.contents.map((b) => ({ ...b })) } : {}),
    })),
  };
}

/**
 * Filter a toolbox tree to categories whose contents match a substring of
 * the block type. Custom-flyout categories (Variabili/Funzioni) are
 * preserved as-is when query is empty, dropped when query is non-empty
 * (they cannot be filtered by block name — Blockly generates them at
 * runtime).
 *
 * @param {object} toolbox — from getCanonicalToolbox/getProgressiveToolbox
 * @param {string} query — case-insensitive substring of block type
 * @returns {object} new toolbox tree (input unchanged)
 *
 * Whitespace/empty query → identity (returns deep clone of input).
 */
export function filterToolbox(toolbox, query) {
  if (!toolbox || !Array.isArray(toolbox.contents)) {
    return { kind: toolbox?.kind ?? 'categoryToolbox', contents: [] };
  }
  const q = String(query ?? '').trim().toLowerCase();
  if (q === '') {
    return {
      kind: toolbox.kind,
      contents: toolbox.contents.map((c) => ({ ...c, contents: c.contents ? c.contents.map((b) => ({ ...b })) : undefined })),
    };
  }
  const filtered = [];
  for (const cat of toolbox.contents) {
    // Custom flyouts cannot be filtered by block name — drop on search.
    if (cat.custom && !cat.name.toLowerCase().includes(q)) continue;
    if (cat.custom && cat.name.toLowerCase().includes(q)) {
      filtered.push({ ...cat });
      continue;
    }
    const matchedBlocks = (cat.contents ?? []).filter(
      (b) => typeof b.type === 'string' && b.type.toLowerCase().includes(q)
    );
    // Category passes when its name OR any contained block matches.
    if (cat.name.toLowerCase().includes(q)) {
      filtered.push({
        ...cat,
        contents: (cat.contents ?? []).map((b) => ({ ...b })),
      });
    } else if (matchedBlocks.length > 0) {
      filtered.push({
        ...cat,
        contents: matchedBlocks,
      });
    }
  }
  return { kind: toolbox.kind, contents: filtered };
}

/**
 * Toggle the `collapsed` flag on a named category. Pure: returns a new
 * toolbox tree, input unchanged. Unknown name → no-op (collapsed stays
 * falsy on all categories).
 *
 * @param {object} toolbox
 * @param {string} categoryName — exact match against `name` field
 * @returns {object} new toolbox tree
 */
export function toggleCategoryCollapsed(toolbox, categoryName) {
  if (!toolbox || !Array.isArray(toolbox.contents)) {
    return { kind: toolbox?.kind ?? 'categoryToolbox', contents: [] };
  }
  return {
    kind: toolbox.kind,
    contents: toolbox.contents.map((cat) => {
      const cloned = {
        ...cat,
        contents: cat.contents ? cat.contents.map((b) => ({ ...b })) : undefined,
      };
      if (cat.name === categoryName) {
        cloned.collapsed = !cat.collapsed;
        // Wave 2b Impl-H — ariaExpanded mirrors !collapsed for screen
        // readers (axe-core "aria-expanded should reflect state" rule).
        cloned.ariaExpanded = !cloned.collapsed;
      }
      return cloned;
    }),
  };
}

/**
 * Welcome-state copy displayed in the empty-workspace overlay before the
 * student drags the first block.
 *
 * IT plurale Vol1/Vol2 verbatim — "Trascinate" (plurale) not "Trascina"
 * (singolare), addressed to "ragazzi" (the class). Mentions SETUP as the
 * canonical entry point (matching Arduino sketch architecture).
 *
 * @returns {{title:string, hint:string}}
 */
export function getWelcomeState() {
  return {
    title: 'Trascinate qui un blocco, ragazzi',
    hint: 'Iniziate dal blocco SETUP per preparare Arduino, poi proseguite con il ciclo Ripeti.',
  };
}
