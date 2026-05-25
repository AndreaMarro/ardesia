// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * blockly-msg-it — Italian Blockly.Msg overrides (Wave 1 first slice).
 *
 * Spec source:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 + Sez 11
 *   docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md iter X.2 Wave 1 Impl-A
 *
 * Wires the 15 most-common Blockly UI msg keys used by ELAB toolbox to Italian
 * verbatim Vol1/Vol2 language (plurale, Principio Zero). Invoke once at editor
 * init via applyItalianMessages(Blockly) BEFORE Blockly.inject().
 *
 * Scope this slice = 15 keys:
 *   setup/loop (2) + pin digital (2) + pin analog (2) + pin mode (2) +
 *   serial (2) + delay (1) + category labels (4)
 *
 * Wave 1b will extend with: search box, collapse btn, welcome state copy,
 * remaining 30+ Blockly default Msg keys (SETUP_FUNCTION_TIP, etc.).
 *
 * Language rule (Principio Zero, plurale, Vol1/Vol2 verbatim):
 *   "Ripeti" NOT "Loop"; "Pausa" NOT "Wait"; "Variabili" NOT "Variables";
 *   "Scrivi pin digitale" NOT "Digital Write". Reflects scratchBlocks.js
 *   existing labels ("imposta pin", "scrivi pin", "USCITA"/"INGRESSO").
 *
 * Coordination note: scratchBlocks.js currently uses hard-coded IT strings
 * inline via appendField("scrivi pin"). These Msg keys SUPPLEMENT for future
 * standard Blockly UI surfaces (toolbox category names, dropdown labels,
 * variable/function builtin dialogs). Hard-coded inline strings remain
 * canonical until Wave 1b refactor — NO behavioural change this slice.
 */

/**
 * 15 IT msg key → value map (frozen at module load to prevent accidental
 * mutation by callers).
 */
const IT_MESSAGES = Object.freeze({
  // Setup / Loop core (Arduino sketch wrappers)
  SETUP_FUNCTION: 'Avvio',
  LOOP_FUNCTION: 'Ripeti',

  // Pin I/O — digital
  PIN_DIGITAL_WRITE: 'Scrivi pin digitale',
  PIN_DIGITAL_READ: 'Leggi pin digitale',

  // Pin I/O — analog
  PIN_ANALOG_WRITE: 'Scrivi pin analogico',
  PIN_ANALOG_READ: 'Leggi pin analogico',

  // Pin mode dropdown options
  PIN_MODE_OUTPUT: 'USCITA',
  PIN_MODE_INPUT: 'INGRESSO',

  // Serial communication (Arduino API keywords preserved)
  SERIAL_PRINT: 'Serial.print',
  SERIAL_PRINTLN: 'Serial.println',

  // Timing
  DELAY_MS: 'Pausa (millisecondi)',

  // Category labels (toolbox sidebar)
  VARIABLES: 'Variabili',
  FUNCTIONS: 'Funzioni',
  MATH: 'Matematica',
  LOGIC: 'Logica',
});

/**
 * Apply Italian Blockly.Msg overrides onto the provided Blockly namespace.
 *
 * @param {object} Blockly — Blockly namespace (either `import * as Blockly`
 *   ESM default or window.Blockly global). Must be mutable.
 * @returns {object} the same Blockly instance (for chaining).
 *
 * Idempotent: calling twice produces the same final state with no errors.
 * Safe: creates `Blockly.Msg` if missing.
 *
 * Usage:
 *   import * as Blockly from 'blockly';
 *   import { applyItalianMessages } from './i18n/blockly-msg-it';
 *   applyItalianMessages(Blockly);
 *   Blockly.inject(div, { toolbox, theme, ... });
 */
export function applyItalianMessages(Blockly) {
  if (!Blockly || typeof Blockly !== 'object') {
    throw new Error('applyItalianMessages: Blockly namespace required');
  }
  if (!Blockly.Msg || typeof Blockly.Msg !== 'object') {
    Blockly.Msg = {};
  }
  for (const [key, value] of Object.entries(IT_MESSAGES)) {
    Blockly.Msg[key] = value;
  }
  return Blockly;
}

/**
 * Frozen map of IT msg overrides — exported for test introspection +
 * documentation generators. NOT for direct mutation.
 */
export const ITALIAN_MESSAGES = IT_MESSAGES;
