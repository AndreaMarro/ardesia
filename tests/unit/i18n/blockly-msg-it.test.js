// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * blockly-msg-it — Italian Blockly.Msg overrides (Wave 1 + Wave 1b).
 *
 * Spec source:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 + Sez 11
 *   docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md iter X.2
 *   docs/dispatch/2026-05-25-wave-1b-team-brief.md (Wave 1b Impl-A-2 task 2)
 *
 * Contract: applyItalianMessages(BlocklyInstance) MUST set Italian (plurale,
 * Vol1/Vol2 language) on the provided Blockly namespace's Msg object for:
 *   - 15 ELAB core UI keys (Wave 1 slice)
 *   - 30+ standard Blockly default msg keys (Wave 1b expansion):
 *       VARIABLES_*, PROCEDURES_*, MATH_*, LOGIC_*, LISTS_*, TEXT_*,
 *       CONTROLS_*, plus tooltips SETUP_FUNCTION_TIP / LOOP_TIP, plus
 *       new ELAB UI strings TOOLBOX_SEARCH_PLACEHOLDER /
 *       TOOLBOX_COLLAPSE_LABEL / TOOLBOX_WELCOME_TITLE / etc.
 * Invocation is idempotent (calling twice = same final state, no errors).
 *
 * Language rule (Principio Zero): plurale verbatim Vol1/Vol2 — "Ripeti", non
 * "Loop"; "Pausa", non "Wait"; "Variabili", non "Variables". Plural form
 * "ragazzi" used in welcome state copy.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { applyItalianMessages } from '../../../src/i18n/blockly-msg-it.js';

// Build a fresh fake Blockly namespace per test to keep tests isolated
// (real Blockly Msg is a global singleton — we don't want cross-test pollution).
function makeFakeBlockly() {
  return { Msg: {} };
}

describe('blockly-msg-it — module export contract', () => {
  it('exports applyItalianMessages as a function', () => {
    expect(typeof applyItalianMessages).toBe('function');
  });

  it('returns the Blockly instance for chaining', () => {
    const Blockly = makeFakeBlockly();
    const result = applyItalianMessages(Blockly);
    expect(result).toBe(Blockly);
  });

  it('does not throw when called twice (idempotent)', () => {
    const Blockly = makeFakeBlockly();
    expect(() => {
      applyItalianMessages(Blockly);
      applyItalianMessages(Blockly);
    }).not.toThrow();
  });

  it('creates Msg object if missing on the Blockly namespace', () => {
    const Blockly = {}; // no Msg property
    applyItalianMessages(Blockly);
    expect(Blockly.Msg).toBeDefined();
    expect(typeof Blockly.Msg).toBe('object');
  });
});

describe('blockly-msg-it — 15 core IT msg overrides', () => {
  let Blockly;

  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  // Setup / Loop core
  it('SETUP_FUNCTION = "Avvio"', () => {
    expect(Blockly.Msg.SETUP_FUNCTION).toBe('Avvio');
  });

  it('LOOP_FUNCTION = "Ripeti"', () => {
    expect(Blockly.Msg.LOOP_FUNCTION).toBe('Ripeti');
  });

  // Pin I/O — digital
  it('PIN_DIGITAL_WRITE = "Scrivi pin digitale"', () => {
    expect(Blockly.Msg.PIN_DIGITAL_WRITE).toBe('Scrivi pin digitale');
  });

  it('PIN_DIGITAL_READ = "Leggi pin digitale"', () => {
    expect(Blockly.Msg.PIN_DIGITAL_READ).toBe('Leggi pin digitale');
  });

  // Pin I/O — analog
  it('PIN_ANALOG_WRITE = "Scrivi pin analogico"', () => {
    expect(Blockly.Msg.PIN_ANALOG_WRITE).toBe('Scrivi pin analogico');
  });

  it('PIN_ANALOG_READ = "Leggi pin analogico"', () => {
    expect(Blockly.Msg.PIN_ANALOG_READ).toBe('Leggi pin analogico');
  });

  // Pin mode dropdown
  it('PIN_MODE_OUTPUT = "USCITA"', () => {
    expect(Blockly.Msg.PIN_MODE_OUTPUT).toBe('USCITA');
  });

  it('PIN_MODE_INPUT = "INGRESSO"', () => {
    expect(Blockly.Msg.PIN_MODE_INPUT).toBe('INGRESSO');
  });

  // Serial
  it('SERIAL_PRINT = "Serial.print"', () => {
    expect(Blockly.Msg.SERIAL_PRINT).toBe('Serial.print');
  });

  it('SERIAL_PRINTLN = "Serial.println"', () => {
    expect(Blockly.Msg.SERIAL_PRINTLN).toBe('Serial.println');
  });

  // Delay
  it('DELAY_MS = "Pausa (millisecondi)"', () => {
    expect(Blockly.Msg.DELAY_MS).toBe('Pausa (millisecondi)');
  });

  // Category labels
  it('VARIABLES = "Variabili"', () => {
    expect(Blockly.Msg.VARIABLES).toBe('Variabili');
  });

  it('FUNCTIONS = "Funzioni"', () => {
    expect(Blockly.Msg.FUNCTIONS).toBe('Funzioni');
  });

  it('MATH = "Matematica"', () => {
    expect(Blockly.Msg.MATH).toBe('Matematica');
  });

  it('LOGIC = "Logica"', () => {
    expect(Blockly.Msg.LOGIC).toBe('Logica');
  });
});

describe('blockly-msg-it — language discipline (Principio Zero)', () => {
  let Blockly;

  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('all 15 msg values are non-empty strings', () => {
    const keys = [
      'SETUP_FUNCTION', 'LOOP_FUNCTION',
      'PIN_DIGITAL_WRITE', 'PIN_DIGITAL_READ',
      'PIN_ANALOG_WRITE', 'PIN_ANALOG_READ',
      'PIN_MODE_OUTPUT', 'PIN_MODE_INPUT',
      'SERIAL_PRINT', 'SERIAL_PRINTLN',
      'DELAY_MS',
      'VARIABLES', 'FUNCTIONS', 'MATH', 'LOGIC',
    ];
    for (const key of keys) {
      expect(typeof Blockly.Msg[key]).toBe('string');
      expect(Blockly.Msg[key].length).toBeGreaterThan(0);
    }
  });

  it('no English-only artifacts in IT-meaning keys (sanity check)', () => {
    // Quick guard: keys that should be IT must NOT contain English-only words
    // like "Loop", "Write", "Wait", "Variables". (SERIAL_PRINT/PRINTLN are
    // deliberately Arduino API keywords — excluded from this sweep.)
    const itOnlyKeys = [
      'SETUP_FUNCTION', 'LOOP_FUNCTION',
      'PIN_DIGITAL_WRITE', 'PIN_DIGITAL_READ',
      'PIN_ANALOG_WRITE', 'PIN_ANALOG_READ',
      'DELAY_MS', 'VARIABLES', 'FUNCTIONS', 'MATH', 'LOGIC',
    ];
    const englishWordRegex = /\b(Loop|Write|Read|Wait|Variables|Functions|Math|Logic|Setup)\b/;
    for (const key of itOnlyKeys) {
      expect(Blockly.Msg[key]).not.toMatch(englishWordRegex);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────
// Wave 1b expansion — 30+ Blockly default Msg keys + new ELAB UI strings.
// Spec: docs/dispatch/2026-05-25-wave-1b-team-brief.md Impl-A-2 task 2.
// ────────────────────────────────────────────────────────────────────────

describe('blockly-msg-it — Wave 1b: tooltips for ELAB wrappers', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('SETUP_FUNCTION_TIP is non-empty IT string', () => {
    expect(typeof Blockly.Msg.SETUP_FUNCTION_TIP).toBe('string');
    expect(Blockly.Msg.SETUP_FUNCTION_TIP.length).toBeGreaterThan(0);
    expect(Blockly.Msg.SETUP_FUNCTION_TIP).not.toMatch(/\b(Setup|Run once)\b/);
  });

  it('LOOP_TIP is non-empty IT string', () => {
    expect(typeof Blockly.Msg.LOOP_TIP).toBe('string');
    expect(Blockly.Msg.LOOP_TIP.length).toBeGreaterThan(0);
    expect(Blockly.Msg.LOOP_TIP).not.toMatch(/\b(Loop|forever|repeat)\b/i);
  });
});

describe('blockly-msg-it — Wave 1b: Blockly default VARIABLES_* keys', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('VARIABLES_DEFAULT_NAME = "elemento"', () => {
    expect(Blockly.Msg.VARIABLES_DEFAULT_NAME).toBe('elemento');
  });

  it('VARIABLES_GET_TOOLTIP starts with IT word', () => {
    expect(Blockly.Msg.VARIABLES_GET_TOOLTIP).toMatch(/^(Restituisce|Leggi|Prendi)/);
  });

  it('VARIABLES_SET_TOOLTIP starts with IT word', () => {
    expect(Blockly.Msg.VARIABLES_SET_TOOLTIP).toMatch(/^(Imposta|Assegna|Salva)/);
  });

  it('NEW_VARIABLE is "Crea variabile…"', () => {
    expect(Blockly.Msg.NEW_VARIABLE).toBe('Crea variabile…');
  });

  it('RENAME_VARIABLE is "Rinomina variabile…"', () => {
    expect(Blockly.Msg.RENAME_VARIABLE).toBe('Rinomina variabile…');
  });

  it('DELETE_VARIABLE has placeholder %1 preserved', () => {
    expect(Blockly.Msg.DELETE_VARIABLE).toMatch(/%1/);
    expect(Blockly.Msg.DELETE_VARIABLE).toMatch(/Elimina/i);
  });
});

describe('blockly-msg-it — Wave 1b: Blockly default PROCEDURES_* keys', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('PROCEDURES_DEFNORETURN_TITLE = "a"', () => {
    expect(Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE).toBe('a');
  });

  it('PROCEDURES_DEFNORETURN_PROCEDURE = "qualcosa"', () => {
    expect(Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE).toBe('qualcosa');
  });

  it('PROCEDURES_BEFORE_PARAMS = "con:"', () => {
    expect(Blockly.Msg.PROCEDURES_BEFORE_PARAMS).toBe('con:');
  });

  it('PROCEDURES_DEFRETURN_RETURN = "restituisci"', () => {
    expect(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN).toBe('restituisci');
  });

  it('PROCEDURES_DEFNORETURN_TOOLTIP starts with IT', () => {
    expect(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP).toMatch(/^(Crea|Definisce|Definisci)/);
  });
});

describe('blockly-msg-it — Wave 1b: Blockly default MATH_* keys', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('MATH_ADDITION_SYMBOL preserved as "+"', () => {
    expect(Blockly.Msg.MATH_ADDITION_SYMBOL).toBe('+');
  });

  it('MATH_RANDOM_INT_TITLE non-empty IT', () => {
    expect(typeof Blockly.Msg.MATH_RANDOM_INT_TITLE).toBe('string');
    expect(Blockly.Msg.MATH_RANDOM_INT_TITLE).toMatch(/casuale|random/i);
  });

  it('MATH_ARITHMETIC_HELPURL is a string (may be empty)', () => {
    expect(typeof Blockly.Msg.MATH_ARITHMETIC_HELPURL).toBe('string');
  });

  it('MATH_NUMBER_TOOLTIP starts with IT word', () => {
    expect(Blockly.Msg.MATH_NUMBER_TOOLTIP).toMatch(/^(Un|Numero|Restituisce)/);
  });
});

describe('blockly-msg-it — Wave 1b: Blockly default LOGIC_* keys', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('LOGIC_BOOLEAN_TRUE = "vero"', () => {
    expect(Blockly.Msg.LOGIC_BOOLEAN_TRUE).toBe('vero');
  });

  it('LOGIC_BOOLEAN_FALSE = "falso"', () => {
    expect(Blockly.Msg.LOGIC_BOOLEAN_FALSE).toBe('falso');
  });

  it('LOGIC_NEGATE_TITLE has %1 placeholder + "non" IT', () => {
    expect(Blockly.Msg.LOGIC_NEGATE_TITLE).toMatch(/%1/);
    expect(Blockly.Msg.LOGIC_NEGATE_TITLE).toMatch(/non/);
  });

  it('LOGIC_OPERATION_AND = "e"', () => {
    expect(Blockly.Msg.LOGIC_OPERATION_AND).toBe('e');
  });

  it('LOGIC_OPERATION_OR = "o"', () => {
    expect(Blockly.Msg.LOGIC_OPERATION_OR).toBe('o');
  });
});

describe('blockly-msg-it — Wave 1b: Blockly default CONTROLS_* keys', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('CONTROLS_IF_MSG_IF = "se"', () => {
    expect(Blockly.Msg.CONTROLS_IF_MSG_IF).toBe('se');
  });

  it('CONTROLS_IF_MSG_THEN = "allora"', () => {
    expect(Blockly.Msg.CONTROLS_IF_MSG_THEN).toBe('allora');
  });

  it('CONTROLS_IF_MSG_ELSE = "altrimenti"', () => {
    expect(Blockly.Msg.CONTROLS_IF_MSG_ELSE).toBe('altrimenti');
  });

  it('CONTROLS_REPEAT_TITLE has %1 placeholder + "ripeti"', () => {
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toMatch(/%1/);
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toMatch(/ripeti/i);
  });

  it('CONTROLS_WHILEUNTIL_OPERATOR_WHILE = "mentre"', () => {
    expect(Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE).toBe('mentre');
  });
});

describe('blockly-msg-it — Wave 1b: Blockly default LISTS_/TEXT_ keys', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('LISTS_CREATE_EMPTY_TITLE non-empty IT', () => {
    expect(typeof Blockly.Msg.LISTS_CREATE_EMPTY_TITLE).toBe('string');
    expect(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE).toMatch(/lista|vuota/i);
  });

  it('TEXT_JOIN_TITLE_CREATEWITH non-empty IT', () => {
    expect(typeof Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH).toBe('string');
    expect(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH).toMatch(/testo|crea/i);
  });
});

describe('blockly-msg-it — Wave 1b: ELAB toolbox UI strings', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  it('TOOLBOX_SEARCH_PLACEHOLDER is "Cerca un blocco…"', () => {
    expect(Blockly.Msg.TOOLBOX_SEARCH_PLACEHOLDER).toBe('Cerca un blocco…');
  });

  it('TOOLBOX_COLLAPSE_LABEL is "Comprimi categoria"', () => {
    expect(Blockly.Msg.TOOLBOX_COLLAPSE_LABEL).toBe('Comprimi categoria');
  });

  it('TOOLBOX_EXPAND_LABEL is "Espandi categoria"', () => {
    expect(Blockly.Msg.TOOLBOX_EXPAND_LABEL).toBe('Espandi categoria');
  });

  it('TOOLBOX_WELCOME_TITLE uses plurale "ragazzi"', () => {
    expect(Blockly.Msg.TOOLBOX_WELCOME_TITLE).toMatch(/ragazzi/);
  });

  it('TOOLBOX_WELCOME_HINT mentions SETUP', () => {
    expect(Blockly.Msg.TOOLBOX_WELCOME_HINT).toMatch(/SETUP|Avvio/);
  });

  it('TOOLBOX_SEARCH_NO_RESULTS uses IT', () => {
    expect(Blockly.Msg.TOOLBOX_SEARCH_NO_RESULTS).toMatch(/^Nessun/);
  });
});

describe('blockly-msg-it — Wave 1b: 16 toolbox category labels (canonical IT)', () => {
  let Blockly;
  beforeEach(() => {
    Blockly = makeFakeBlockly();
    applyItalianMessages(Blockly);
  });

  // 16 categorie source spec line 88 Sez 1:
  //  Setup / Pin digitali / Pin analogici / Loop / Math / Logica /
  //  Variabili / Funzioni / Serial / Sensori / Attuatori / Tempo /
  //  Stringhe / RGB LED / Servo / Buzzer
  const categories = [
    ['CATEGORY_SETUP', 'Setup'],
    ['CATEGORY_PIN_DIGITALI', 'Pin digitali'],
    ['CATEGORY_PIN_ANALOGICI', 'Pin analogici'],
    ['CATEGORY_LOOP', 'Ripeti'],
    ['CATEGORY_MATH', 'Matematica'],
    ['CATEGORY_LOGICA', 'Logica'],
    ['CATEGORY_VARIABILI', 'Variabili'],
    ['CATEGORY_FUNZIONI', 'Funzioni'],
    ['CATEGORY_SERIAL', 'Comunicazione Serial'],
    ['CATEGORY_SENSORI', 'Sensori'],
    ['CATEGORY_ATTUATORI', 'Attuatori'],
    ['CATEGORY_TEMPO', 'Tempo'],
    ['CATEGORY_STRINGHE', 'Stringhe'],
    ['CATEGORY_RGB_LED', 'RGB LED'],
    ['CATEGORY_SERVO', 'Servo'],
    ['CATEGORY_BUZZER', 'Buzzer'],
  ];

  for (const [key, value] of categories) {
    it(`${key} = "${value}"`, () => {
      expect(Blockly.Msg[key]).toBe(value);
    });
  }
});

describe('blockly-msg-it — Wave 1b: ITALIAN_MESSAGES export count', () => {
  it('ITALIAN_MESSAGES export contains at least 60 keys (15 Wave1 + 45 Wave1b)', async () => {
    const mod = await import('../../../src/i18n/blockly-msg-it.js');
    const keys = Object.keys(mod.ITALIAN_MESSAGES);
    expect(keys.length).toBeGreaterThanOrEqual(60);
  });
});
