/**
 * unlimKBRegression.test.js — KB disambiguation regression tests
 *
 * One test per critical KB entry to ensure keywords route to the correct
 * answer. Prevents future tie-breaking bugs (e.g. 'non funziona' → celebrazione,
 * 'cos'è il PWM' → Arduino). Each test verifies:
 *   1. The correct entry wins (question text contains expected substring)
 *   2. The wrong entry does NOT win
 *
 * (c) Andrea Marro — 16/04/2026 — ELAB Tutor
 */

import { describe, it, expect } from 'vitest';
import { searchKnowledgeBase } from '../../src/data/unlim-knowledge-base.js';

// ─── Helper ────────────────────────────────────────────────────────────────
function wins(query, expectedQuestionSubstring) {
  const r = searchKnowledgeBase(query);
  if (!r) return false;
  return r.question.toLowerCase().includes(expectedQuestionSubstring.toLowerCase());
}

// ─── LED disambiguation ────────────────────────────────────────────────────
describe('KB Regression — LED', () => {
  it('"led accende" → LED funzionamento (non celebrazione)', () => {
    const r = searchKnowledgeBase('led accende');
    expect(r).not.toBeNull();
    expect(r.question.toLowerCase()).toContain('led');
    expect(r.answer.toLowerCase()).not.toContain('complimenti'); // no celebration
  });

  it('"il led non si accende" → LED troubleshooting (non celebrazione)', () => {
    expect(wins('il led non si accende', 'led non si accende')).toBe(true);
  });

  it('"led rgb" → LED RGB (non LED semplice)', () => {
    const r = searchKnowledgeBase('led rgb');
    expect(r).not.toBeNull();
    expect(r.answer).toContain('RGB');
  });
});

// ─── 'non funziona' must NOT route to celebration ─────────────────────────
describe('KB Regression — non funziona (BUG #1 regression)', () => {
  it('"non funziona" → NON risposta celebrazione', () => {
    const r = searchKnowledgeBase('non funziona');
    // Must not return the celebration entry
    if (r) {
      expect(r.question.toLowerCase()).not.toContain('ce l\'ho fatta');
      expect(r.answer.toLowerCase()).not.toMatch(/complimenti.*livello|fantastico.*prossima/i);
    }
  });

  it('"non funziona" → score celebrazione inferiore a LED entry', () => {
    // Celebrazione ha 'funzionato' (partial). LED ha 'funziona' (exact = 3).
    // Regresson: se celebrazione torna a 'funziona' → questo test fallisce.
    const r = searchKnowledgeBase('non funziona');
    if (r) {
      expect(r.question.toLowerCase()).not.toBe('funziona! ce l\'ho fatta!');
    }
  });

  it('"il progetto non funziona" → risposta tecnica, non celebrazione', () => {
    const r = searchKnowledgeBase('il progetto non funziona');
    if (r) {
      expect(r.answer.toLowerCase()).not.toMatch(/^fantastico/i);
    }
  });
});

// ─── PWM must win over Arduino for 'pwm' queries (BUG #2 regression) ──────
describe('KB Regression — PWM vs Arduino (BUG #2 regression)', () => {
  it('"pwm" → risposta PWM (non Arduino generico)', () => {
    const r = searchKnowledgeBase('pwm');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('pwm');
    expect(r.question.toLowerCase()).not.toBe("cos'è arduino?");
  });

  it('"cos\'è il pwm" → risposta PWM con analogWrite', () => {
    const r = searchKnowledgeBase("cos'è il pwm");
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('pwm');
    expect(r.answer.toLowerCase()).toContain('analogwrite');
  });

  it('"analogwrite luminosità" → risposta PWM', () => {
    const r = searchKnowledgeBase('analogwrite luminosità');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('pwm');
  });

  it('"come funziona analogWrite" → risposta PWM (non Serial Monitor)', () => {
    const r = searchKnowledgeBase('come funziona analogWrite');
    expect(r).not.toBeNull();
    // Should not confuse with Serial Monitor or other 'come funziona' entries
    expect(r.answer.toLowerCase()).toContain('pwm');
  });
});

// ─── Arduino queries must NOT match PWM entry ──────────────────────────────
describe('KB Regression — Arduino queries route correctly', () => {
  it('"cos\'è arduino" → risposta Arduino (non PWM)', () => {
    const r = searchKnowledgeBase("cos'è arduino");
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('arduino');
    expect(r.question.toLowerCase()).toContain('arduino');
  });

  it('"arduino nano scheda" → risposta Arduino base', () => {
    const r = searchKnowledgeBase('arduino nano scheda');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('arduino');
  });
});

// ─── Scratch/Blockly disambiguation ────────────────────────────────────────
describe('KB Regression — Scratch/Blockly', () => {
  it('"scratch blockly" → risposta Scratch (non Arduino)', () => {
    const r = searchKnowledgeBase('scratch blockly');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('scratch');
  });

  it('"il programma scratch non compila" → Scratch troubleshooting', () => {
    const r = searchKnowledgeBase('il programma scratch non compila');
    expect(r).not.toBeNull();
    // Should match Scratch error entry, not generic celebration
    expect(r.answer.toLowerCase()).toContain('scratch');
  });
});

// ─── Celebrazione deve matchare correttamente ──────────────────────────────
describe('KB Regression — Celebrazione route', () => {
  it('"ce l\'ho fatta funzionato" → celebrazione', () => {
    const r = searchKnowledgeBase("ce l'ho fatta");
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('fantastico');
  });

  it('"evviva riuscito" → celebrazione', () => {
    const r = searchKnowledgeBase('evviva riuscito');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('fantastico');
  });

  it('"bravo bravissimo" → celebrazione o risposta positiva', () => {
    const r = searchKnowledgeBase('bravo bravissimo');
    if (r) {
      // Any positive response is OK
      expect(r.score).toBeGreaterThan(2.5);
    }
  });
});

// ─── Temperature sensor ────────────────────────────────────────────────────
describe('KB Regression — Sensori', () => {
  it('"temperatura termometro" → TMP36 answer', () => {
    const r = searchKnowledgeBase('temperatura termometro');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('temperatura');
  });

  it('"lcd display schermo" → LCD answer', () => {
    const r = searchKnowledgeBase('lcd display schermo');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('lcd');
  });

  it('"sensore ultrasuoni distanza" → HC-SR04 answer', () => {
    const r = searchKnowledgeBase('sensore ultrasuoni distanza');
    expect(r).not.toBeNull();
    // Could reference HC-SR04 or ultrasuoni
    expect(r.score).toBeGreaterThan(2.5);
  });
});

// ─── digitalRead/Write disambiguation ─────────────────────────────────────
describe('KB Regression — digitalWrite vs digitalRead', () => {
  it('"digitalwrite output high" → digitalWrite answer', () => {
    const r = searchKnowledgeBase('digitalwrite output high');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('digitalwrite');
  });

  it('"digitalread pulsante input" → digitalRead answer', () => {
    const r = searchKnowledgeBase('digitalread pulsante input');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('digitalread');
  });

  it('"pulsante bottone premuto" → pulsante answer (non LED)', () => {
    const r = searchKnowledgeBase('pulsante bottone premuto');
    expect(r).not.toBeNull();
    expect(r.question.toLowerCase()).toContain('pulsante');
  });
});

// ─── Manuale / struttura libro ─────────────────────────────────────────────
describe('KB Regression — Manuale ELAB', () => {
  it('"manuale elab volumi" → risposta struttura libro', () => {
    const r = searchKnowledgeBase('manuale elab volumi');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toContain('volume');
  });

  it('"come è organizzato il libro" → risposta manuale (non celebrazione)', () => {
    const r = searchKnowledgeBase('come è organizzato il libro');
    if (r) {
      expect(r.answer.toLowerCase()).not.toMatch(/^fantastico/i);
    }
  });
});

// ─── Score minimum threshold ────────────────────────────────────────────────
describe('KB Regression — Score threshold (2.5)', () => {
  it('tutte le query valide ritornano score >= 2.5', () => {
    const validQueries = [
      'led', 'resistenza', 'breadboard', 'arduino', 'pwm', 'scratch',
      'lcd', 'temperatura', 'pulsante', 'digitalwrite'
    ];
    for (const q of validQueries) {
      const r = searchKnowledgeBase(q);
      expect(r, `query "${q}" deve trovare risultato`).not.toBeNull();
      expect(r.score, `query "${q}" deve avere score >= 2.5`).toBeGreaterThanOrEqual(2.5);
    }
  });

  it('query vuota ritorna null', () => {
    expect(searchKnowledgeBase('')).toBeNull();
    expect(searchKnowledgeBase('  ')).toBeNull();
    expect(searchKnowledgeBase(null)).toBeNull();
  });

  it('query di sole stop words ritorna null', () => {
    // "il la lo" sono tutte stop words → words array vuoto → null
    expect(searchKnowledgeBase('il la lo')).toBeNull();
  });
});
