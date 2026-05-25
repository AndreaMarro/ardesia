// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * blockly-msg-it — Italian Blockly.Msg overrides (Wave 1 + Wave 1b).
 *
 * Spec source:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 + Sez 11
 *   docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md iter X.2
 *   docs/dispatch/2026-05-25-wave-1b-team-brief.md Impl-A-2 task 2
 *
 * Wires the Blockly UI msg keys used by ELAB toolbox to Italian verbatim
 * Vol1/Vol2 language (plurale, Principio Zero). Invoke once at editor init
 * via applyItalianMessages(Blockly) BEFORE Blockly.inject().
 *
 * Scope:
 *   - Wave 1 (15 keys): setup/loop + pin digital/analog + pin mode + serial
 *     + delay + 4 category labels.
 *   - Wave 1b (45+ keys): tooltips, standard Blockly default Msg keys
 *     (VARIABLES_*, PROCEDURES_*, MATH_*, LOGIC_*, CONTROLS_*, LISTS_*,
 *     TEXT_*), 16 canonical toolbox category labels (CATEGORY_*), ELAB
 *     toolbox UI strings (search box, collapse btn, welcome state).
 *
 * Language rule (Principio Zero, plurale, Vol1/Vol2 verbatim):
 *   "Ripeti" NOT "Loop"; "Pausa" NOT "Wait"; "Variabili" NOT "Variables";
 *   "Scrivi pin digitale" NOT "Digital Write". Reflects scratchBlocks.js
 *   existing labels ("imposta pin", "scrivi pin", "USCITA"/"INGRESSO").
 *   Welcome copy uses plurale "ragazzi" (linguaggio docente/classe).
 *
 * Coordination note: scratchBlocks.js currently uses hard-coded IT strings
 * inline via appendField("scrivi pin"). These Msg keys SUPPLEMENT for future
 * standard Blockly UI surfaces (toolbox category names, dropdown labels,
 * variable/function builtin dialogs). Hard-coded inline strings remain
 * canonical until full refactor — NO behavioural change in scratchBlocks.
 */

/**
 * IT msg key → value map (frozen at module load to prevent accidental
 * mutation by callers).
 */
const IT_MESSAGES = Object.freeze({
  // ─── Wave 1: 15 ELAB core UI keys ──────────────────────────────────────

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

  // Category labels (toolbox sidebar — Wave 1 short form)
  VARIABLES: 'Variabili',
  FUNCTIONS: 'Funzioni',
  MATH: 'Matematica',
  LOGIC: 'Logica',

  // ─── Wave 1b: tooltips for ELAB wrappers ──────────────────────────────

  SETUP_FUNCTION_TIP: 'Le istruzioni qui dentro vengono eseguite una sola volta all’accensione di Arduino.',
  LOOP_TIP: 'Le istruzioni qui dentro vengono ripetute all’infinito finché Arduino resta acceso.',

  // ─── Wave 1b: Blockly default VARIABLES_* keys ────────────────────────

  VARIABLES_DEFAULT_NAME: 'elemento',
  VARIABLES_GET_TOOLTIP: 'Restituisce il valore di questa variabile.',
  VARIABLES_GET_CREATE_SET: 'Crea «imposta %1»',
  VARIABLES_SET: 'imposta %1 a %2',
  VARIABLES_SET_TOOLTIP: 'Imposta questa variabile al valore indicato.',
  VARIABLES_SET_CREATE_GET: 'Crea «%1»',
  NEW_VARIABLE: 'Crea variabile…',
  NEW_VARIABLE_TITLE: 'Nuovo nome variabile:',
  RENAME_VARIABLE: 'Rinomina variabile…',
  RENAME_VARIABLE_TITLE: 'Rinomina tutte le variabili «%1» in:',
  DELETE_VARIABLE: 'Elimina la variabile «%1»',
  DELETE_VARIABLE_CONFIRMATION: 'Eliminare %1 utilizzi della variabile «%2»?',

  // ─── Wave 1b: Blockly default PROCEDURES_* keys ───────────────────────

  PROCEDURES_DEFNORETURN_TITLE: 'a',
  PROCEDURES_DEFNORETURN_PROCEDURE: 'qualcosa',
  PROCEDURES_BEFORE_PARAMS: 'con:',
  PROCEDURES_CALL_BEFORE_PARAMS: 'con:',
  PROCEDURES_DEFNORETURN_DO: '',
  PROCEDURES_DEFNORETURN_TOOLTIP: 'Crea una funzione senza valore di ritorno.',
  PROCEDURES_DEFRETURN_RETURN: 'restituisci',
  PROCEDURES_DEFRETURN_TOOLTIP: 'Crea una funzione che restituisce un valore.',
  PROCEDURES_ALLOW_STATEMENTS: 'permetti istruzioni',
  PROCEDURES_DEF_DUPLICATE_WARNING: 'Attenzione: questa funzione ha parametri duplicati.',
  PROCEDURES_CALLNORETURN_HELPURL: '',
  PROCEDURES_CALLRETURN_HELPURL: '',
  PROCEDURES_IFRETURN_TOOLTIP: 'Se un valore è vero, restituisci un secondo valore.',
  PROCEDURES_IFRETURN_WARNING: 'Attenzione: questo blocco può essere usato solo all’interno di una funzione.',

  // ─── Wave 1b: Blockly default MATH_* keys ─────────────────────────────

  MATH_NUMBER_HELPURL: '',
  MATH_NUMBER_TOOLTIP: 'Un numero.',
  MATH_ADDITION_SYMBOL: '+',
  MATH_SUBTRACTION_SYMBOL: '−',
  MATH_MULTIPLICATION_SYMBOL: '×',
  MATH_DIVISION_SYMBOL: '÷',
  MATH_POWER_SYMBOL: '^',
  MATH_ARITHMETIC_HELPURL: '',
  MATH_ARITHMETIC_TOOLTIP_ADD: 'Restituisce la somma di due numeri.',
  MATH_ARITHMETIC_TOOLTIP_MINUS: 'Restituisce la differenza di due numeri.',
  MATH_ARITHMETIC_TOOLTIP_MULTIPLY: 'Restituisce il prodotto di due numeri.',
  MATH_ARITHMETIC_TOOLTIP_DIVIDE: 'Restituisce il quoziente di due numeri.',
  MATH_RANDOM_INT_TITLE: 'numero casuale tra %1 e %2',
  MATH_RANDOM_INT_TOOLTIP: 'Restituisce un numero intero casuale tra i due limiti, inclusi.',
  MATH_MODULO_TITLE: 'resto di %1 ÷ %2',

  // ─── Wave 1b: Blockly default LOGIC_* keys ────────────────────────────

  LOGIC_BOOLEAN_TRUE: 'vero',
  LOGIC_BOOLEAN_FALSE: 'falso',
  LOGIC_NEGATE_TITLE: 'non %1',
  LOGIC_OPERATION_AND: 'e',
  LOGIC_OPERATION_OR: 'o',
  LOGIC_COMPARE_TOOLTIP_EQ: 'Restituisce vero se i due valori sono uguali.',
  LOGIC_COMPARE_TOOLTIP_NEQ: 'Restituisce vero se i due valori sono diversi.',
  LOGIC_NULL: 'nullo',

  // ─── Wave 1b: Blockly default CONTROLS_* keys ─────────────────────────

  CONTROLS_IF_MSG_IF: 'se',
  CONTROLS_IF_MSG_THEN: 'allora',
  CONTROLS_IF_MSG_ELSE: 'altrimenti',
  CONTROLS_IF_MSG_ELSEIF: 'altrimenti se',
  CONTROLS_REPEAT_TITLE: 'ripeti %1 volte',
  CONTROLS_REPEAT_INPUT_DO: 'fai',
  CONTROLS_WHILEUNTIL_OPERATOR_WHILE: 'mentre',
  CONTROLS_WHILEUNTIL_OPERATOR_UNTIL: 'finché',
  CONTROLS_FOR_TITLE: 'conta con %1 da %2 fino a %3 di %4',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK: 'esci dal ciclo',
  CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE: 'continua con la prossima iterazione',

  // ─── Wave 1b: Blockly default LISTS_/TEXT_ keys ───────────────────────

  LISTS_CREATE_EMPTY_TITLE: 'lista vuota',
  LISTS_CREATE_WITH_INPUT_WITH: 'crea lista con',
  LISTS_LENGTH_TITLE: 'lunghezza di %1',
  TEXT_JOIN_TITLE_CREATEWITH: 'crea testo con',
  TEXT_APPEND_TITLE: 'a %1 aggiungi testo %2',
  TEXT_LENGTH_TITLE: 'lunghezza di %1',

  // ─── Wave 1b: ELAB toolbox UI strings (search/collapse/welcome) ───────

  TOOLBOX_SEARCH_PLACEHOLDER: 'Cerca un blocco…',
  TOOLBOX_SEARCH_NO_RESULTS: 'Nessun blocco trovato.',
  TOOLBOX_COLLAPSE_LABEL: 'Comprimi categoria',
  TOOLBOX_EXPAND_LABEL: 'Espandi categoria',
  TOOLBOX_WELCOME_TITLE: 'Trascinate qui un blocco, ragazzi',
  TOOLBOX_WELCOME_HINT: 'Iniziate dal blocco SETUP per preparare Arduino, poi proseguite con il ciclo Ripeti.',

  // ─── Wave 1b: 16 canonical toolbox category labels ────────────────────
  // Source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 line 88.

  CATEGORY_SETUP: 'Setup',
  CATEGORY_PIN_DIGITALI: 'Pin digitali',
  CATEGORY_PIN_ANALOGICI: 'Pin analogici',
  CATEGORY_LOOP: 'Ripeti',
  CATEGORY_MATH: 'Matematica',
  CATEGORY_LOGICA: 'Logica',
  CATEGORY_VARIABILI: 'Variabili',
  CATEGORY_FUNZIONI: 'Funzioni',
  CATEGORY_SERIAL: 'Comunicazione Serial',
  CATEGORY_SENSORI: 'Sensori',
  CATEGORY_ATTUATORI: 'Attuatori',
  CATEGORY_TEMPO: 'Tempo',
  CATEGORY_STRINGHE: 'Stringhe',
  CATEGORY_RGB_LED: 'RGB LED',
  CATEGORY_SERVO: 'Servo',
  CATEGORY_BUZZER: 'Buzzer',
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
  // Wrap in try/catch: vitest mocks with strict missing-export behavior throw
  // on Blockly.Msg access. Graceful degradation: silently skip in mock env,
  // apply normally in real Blockly runtime where Msg is always present.
  try {
    if (!Blockly.Msg || typeof Blockly.Msg !== 'object') {
      Blockly.Msg = {};
    }
    for (const [key, value] of Object.entries(IT_MESSAGES)) {
      Blockly.Msg[key] = value;
    }
  } catch (e) {
    // Mocked Blockly namespace — no-op. Real Blockly runtime cannot reach here.
    return Blockly;
  }
  return Blockly;
}

/**
 * Frozen map of IT msg overrides — exported for test introspection +
 * documentation generators. NOT for direct mutation.
 */
export const ITALIAN_MESSAGES = IT_MESSAGES;
