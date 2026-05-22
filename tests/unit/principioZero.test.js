/**
 * Principio Zero — Static Data Audit
 *
 * TU SEI LA PROFESSORESSA ROSSI. 52 anni, insegni tecnologia alle medie.
 * Non sai NULLA di elettronica. Hai paura di fare brutte figure davanti
 * ai ragazzi. Hai 25 studenti di 12 anni che ti guardano dalla LIM.
 *
 * Questi test verificano che i dati statici del progetto rispettino
 * il Principio Zero:
 *   - Nessun linguaggio da sviluppatore in unlimPrompt / desc / observe
 *   - desc breve (≤ 200 char): si legge in 5 secondi
 *   - title conciso (≤ 60 char): visibile su una riga in LIM
 *   - buildSteps.hint corti (≤ 100 char): una frase, non un romanzo
 *   - Titoli lezioni in linguaggio semplice (niente acronimi tecnici nudi)
 *
 * NOTA: Queste coperture sono NUOVE rispetto a principioZeroCompliance.test.js
 * (che testa KB/RAG/volume-references) e a experimentUnlimPrompt.test.js
 * (che testa presenza/lingua/assenza Galileo). Qui testiamo i CAMPI STATICI
 * dei file experiments-vol*.js e lesson-groups.js.
 *
 * (c) Andrea Marro — 16/04/2026
 */

import { describe, it, expect } from 'vitest';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';
import LESSON_GROUPS from '../../src/data/lesson-groups';

// ─── Dataset ───────────────────────────────────────────────────────────────

const ALL_EXPERIMENTS = [
  ...EXPERIMENTS_VOL1.experiments,
  ...EXPERIMENTS_VOL2.experiments,
  ...EXPERIMENTS_VOL3.experiments,
];

const ALL_LESSONS = Object.entries(LESSON_GROUPS);

// ─── Parole da sviluppatore ─────────────────────────────────────────────────
// Queste parole NON devono comparire in unlimPrompt, desc, observe.
// Sono termini che la Prof.ssa Rossi non capisce e che spaventano i ragazzi.
const DEV_WORDS = ['deploy', 'compile', 'runtime', 'debug', 'stack', 'boolean'];

// Acronimi tecnici nudi che non hanno posto in un titolo di lezione
// visibile sulla LIM senza alcuna spiegazione.
// NB: "RGB" e "LDR" sono già spiegati nel libro ed accettati;
//     "API", "HTTP", "JSON", "SDK", "CLI", "IDE" non lo sono.
const NAKED_TECH_ACRONYMS_IN_LESSON_TITLE = [
  /\bAPI\b/, /\bHTTP\b/, /\bJSON\b/, /\bSDK\b/, /\bCLI\b/, /\bIDE\b/,
  /\bSPI\b/, /\bI2C\b/, /\bUART\b/, /\bOOP\b/, /\bDMA\b/, /\bISR\b/,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Restituisce true se il testo contiene almeno una parola da sviluppatore.
 * Il confronto è case-insensitive e usa word boundary per evitare falsi
 * positivi (es. "compilatore" contiene "compile" come sottostringa ma è
 * un termine tecnico italiano già familiare nel contesto ELAB Vol3).
 *
 * Eccezoni accettate (false positive noti):
 *   "booleana" — in italiano è un aggettivo usato anche nei libri scolastici
 *               per spiegare AND/OR; la parola DEV esclusa è "boolean" (inglese)
 *   "debuggare" / "debug" — in Vol3 i quiz spiegano il Serial Monitor come
 *                strumento di debug. Accettiamo questa occorrenza nei campi
 *                desc/observe dei soli esperimenti Vol3 dove è contestuale.
 *                unlimPrompt non deve mai contenere "debug" tout-court.
 *
 * Per i test sui campi desc/observe/buildSteps.hint usiamo un match puro
 * (include) per essere rigorosi: se il termine è lì, o va rimosso o
 * va sostituito con un'analogia italiana.
 */
function containsDevWord(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return DEV_WORDS.some((w) => lower.includes(w));
}

// ─── Test 1 — unlimPrompt: nessuna parola da sviluppatore ──────────────────

describe('Principio Zero / 1. unlimPrompt — nessun jargon tecnico da sviluppatore', () => {
  it('sanity check: abbiamo esperimenti da tutti e 3 i volumi', () => {
    expect(EXPERIMENTS_VOL1.experiments.length).toBeGreaterThanOrEqual(38);
    expect(EXPERIMENTS_VOL2.experiments.length).toBeGreaterThanOrEqual(27);
    expect(EXPERIMENTS_VOL3.experiments.length).toBeGreaterThanOrEqual(14);
    expect(ALL_EXPERIMENTS.length).toBeGreaterThanOrEqual(88);
  });

  // Un test per ogni termine proibito — questo mostra esattamente quale
  // parola viola il principio e in quale esperimento.
  for (const word of DEV_WORDS) {
    it(`nessun unlimPrompt contiene la parola da dev "${word}"`, () => {
      const violators = ALL_EXPERIMENTS.filter((exp) => {
        if (!exp.unlimPrompt) return false;
        return exp.unlimPrompt.toLowerCase().includes(word);
      });
      expect(
        violators.map((e) => e.id),
        `Esperimenti con "${word}" in unlimPrompt: ${violators.map((e) => e.id).join(', ')}`
      ).toEqual([]);
    });
  }

  // Test complessivo — utile per il summary del runner
  it('nessun unlimPrompt contiene QUALSIASI parola da sviluppatore', () => {
    const violators = ALL_EXPERIMENTS.filter((exp) => containsDevWord(exp.unlimPrompt));
    expect(
      violators.map((e) => `${e.id}:${DEV_WORDS.find((w) => (exp.unlimPrompt || '').toLowerCase().includes(w))}`),
      `Violatori: ${violators.map((e) => e.id).join(', ')}`
    ).toEqual([]);
  });
});

// ─── Test 2 — desc: breve (≤ 200 caratteri) ────────────────────────────────

describe('Principio Zero / 2. desc — lunghezza ≤ 200 caratteri', () => {
  it('sanity: tutti gli esperimenti hanno un campo desc', () => {
    const missing = ALL_EXPERIMENTS.filter((e) => !e.desc || typeof e.desc !== 'string');
    expect(missing.map((e) => e.id)).toEqual([]);
  });

  it('nessuna desc supera 200 caratteri', () => {
    const tooLong = ALL_EXPERIMENTS.filter(
      (e) => e.desc && e.desc.length > 200
    );
    expect(
      tooLong.map((e) => `${e.id} (${e.desc.length} chars)`),
      `Descrizioni troppo lunghe (max 200): ${tooLong.map((e) => e.id).join(', ')}`
    ).toEqual([]);
  });

  // Verifica anche che la desc non sia un placeholder vuoto
  it('nessuna desc e vuota o placeholder', () => {
    const bad = ALL_EXPERIMENTS.filter(
      (e) => !e.desc || e.desc.trim().length < 10
    );
    expect(
      bad.map((e) => e.id),
      `Descrizioni assenti o troppo corte: ${bad.map((e) => e.id).join(', ')}`
    ).toEqual([]);
  });

  // Distribuzione: almeno l'85% delle desc è sotto i 150 caratteri
  // (soglia realistica: ~12 esperimenti complessi con desc tecniche è accettabile;
  // la soglia <=200 hard-limit è comunque rispettata)
  it('almeno l\'85% delle desc è sotto 150 caratteri (leggibilità LIM)', () => {
    const under150 = ALL_EXPERIMENTS.filter((e) => e.desc && e.desc.length <= 150);
    const ratio = under150.length / ALL_EXPERIMENTS.length;
    expect(ratio).toBeGreaterThanOrEqual(0.85);
  });
});

// ─── Test 3 — title: max 60 caratteri ──────────────────────────────────────

describe('Principio Zero / 3. title — max 60 caratteri', () => {
  it('sanity: tutti gli esperimenti hanno un campo title', () => {
    const missing = ALL_EXPERIMENTS.filter((e) => !e.title || typeof e.title !== 'string');
    expect(missing.map((e) => e.id)).toEqual([]);
  });

  it('nessun title supera 60 caratteri', () => {
    const tooLong = ALL_EXPERIMENTS.filter(
      (e) => e.title && e.title.length > 60
    );
    expect(
      tooLong.map((e) => `${e.id} (${e.title.length} chars): "${e.title}"`),
      `Titoli troppo lunghi (max 60): ${tooLong.map((e) => e.id).join(', ')}`
    ).toEqual([]);
  });

  it('nessun title e vuoto', () => {
    const empty = ALL_EXPERIMENTS.filter((e) => !e.title || e.title.trim().length === 0);
    expect(empty.map((e) => e.id)).toEqual([]);
  });
});

// ─── Test 4 — observe: nessuna parola da sviluppatore ──────────────────────

describe('Principio Zero / 4. observe — nessun jargon tecnico da sviluppatore', () => {
  // Non tutti gli esperimenti hanno un campo observe; skippiamo quelli senza
  const withObserve = ALL_EXPERIMENTS.filter((e) => e.observe && typeof e.observe === 'string');

  it('sanity: almeno 50 esperimenti hanno il campo observe', () => {
    expect(withObserve.length).toBeGreaterThanOrEqual(50);
  });

  for (const word of DEV_WORDS) {
    it(`nessun observe contiene la parola da dev "${word}"`, () => {
      const violators = withObserve.filter((e) =>
        e.observe.toLowerCase().includes(word)
      );
      expect(
        violators.map((e) => e.id),
        `Esperimenti con "${word}" in observe: ${violators.map((e) => e.id).join(', ')}`
      ).toEqual([]);
    });
  }

  it('nessun observe contiene QUALSIASI parola da sviluppatore', () => {
    const violators = withObserve.filter((e) => containsDevWord(e.observe));
    expect(
      violators.map((e) => e.id),
      `Violatori in observe: ${violators.map((e) => e.id).join(', ')}`
    ).toEqual([]);
  });

  // observe deve essere leggibile: non un romanzo
  it('nessun observe supera 300 caratteri (leggibile in LIM)', () => {
    const tooLong = withObserve.filter((e) => e.observe.length > 300);
    expect(
      tooLong.map((e) => `${e.id} (${e.observe.length} chars)`),
      `observe troppo lunghi: ${tooLong.map((e) => e.id).join(', ')}`
    ).toEqual([]);
  });
});

// ─── Test 5 — lesson-groups: titoli in linguaggio semplice ─────────────────

describe('Principio Zero / 5. lesson-groups — titoli kid-friendly', () => {
  it('sanity: abbiamo almeno 20 lezioni nel lesson-groups', () => {
    expect(ALL_LESSONS.length).toBeGreaterThanOrEqual(20);
  });

  it('ogni lezione ha un title non vuoto', () => {
    const missing = ALL_LESSONS.filter(
      ([, l]) => !l.title || l.title.trim().length === 0
    );
    expect(
      missing.map(([k]) => k),
      `Lezioni senza titolo: ${missing.map(([k]) => k).join(', ')}`
    ).toEqual([]);
  });

  it('nessun titolo di lezione contiene acronimi tecnici nudi non spiegabili', () => {
    const violators = ALL_LESSONS.filter(([, l]) =>
      NAKED_TECH_ACRONYMS_IN_LESSON_TITLE.some((re) => re.test(l.title))
    );
    expect(
      violators.map(([k, l]) => `${k}: "${l.title}"`),
      `Titoli con acronimi tecnici nudi: ${violators.map(([k]) => k).join(', ')}`
    ).toEqual([]);
  });

  it('nessun titolo di lezione contiene parole da sviluppatore', () => {
    const violators = ALL_LESSONS.filter(([, l]) => containsDevWord(l.title));
    expect(
      violators.map(([k, l]) => `${k}: "${l.title}"`),
      `Titoli con jargon dev: ${violators.map(([k]) => k).join(', ')}`
    ).toEqual([]);
  });

  it('tutti i titoli di lezione sono in italiano (contengono caratteri latini)', () => {
    const nonItalian = ALL_LESSONS.filter(
      ([, l]) => l.title && !/[a-zàèéìòùA-Z]/.test(l.title)
    );
    expect(nonItalian.map(([k]) => k)).toEqual([]);
  });

  it('nessun titolo di lezione supera 60 caratteri (visibile su LIM)', () => {
    const tooLong = ALL_LESSONS.filter(([, l]) => l.title && l.title.length > 60);
    expect(
      tooLong.map(([k, l]) => `${k} (${l.title.length} chars): "${l.title}"`),
      `Titoli lezione troppo lunghi: ${tooLong.map(([k]) => k).join(', ')}`
    ).toEqual([]);
  });

  it('ogni lezione ha almeno 1 esperimento nella lista experiments[]', () => {
    const empty = ALL_LESSONS.filter(
      ([, l]) => !l.experiments || l.experiments.length === 0
    );
    expect(
      empty.map(([k]) => k),
      `Lezioni senza esperimenti: ${empty.map(([k]) => k).join(', ')}`
    ).toEqual([]);
  });
});

// ─── Test 6 — buildSteps.hint: frasi corte (≤ 100 caratteri) ───────────────

describe('Principio Zero / 6. buildSteps.hint — frasi corte ≤ 100 caratteri', () => {
  // Raccogli tutti gli hint da tutti gli esperimenti
  const allHints = [];
  for (const exp of ALL_EXPERIMENTS) {
    if (!Array.isArray(exp.buildSteps)) continue;
    for (const step of exp.buildSteps) {
      if (step.hint && typeof step.hint === 'string') {
        allHints.push({ expId: exp.id, step: step.step, hint: step.hint });
      }
    }
  }

  it('sanity: abbiamo almeno 200 hint da verificare', () => {
    expect(allHints.length).toBeGreaterThanOrEqual(200);
  });

  it('nessun hint supera 100 caratteri', () => {
    const tooLong = allHints.filter((h) => h.hint.length > 100);
    const report = tooLong.map(
      (h) => `${h.expId} step ${h.step} (${h.hint.length} chars): "${h.hint.slice(0, 80)}..."`
    );
    expect(
      report,
      `Hint troppo lunghi (max 100 chars):\n${report.join('\n')}`
    ).toEqual([]);
  });

  it('nessun hint contiene parole da sviluppatore', () => {
    const violators = allHints.filter((h) => containsDevWord(h.hint));
    const report = violators.map(
      (h) => `${h.expId} step ${h.step}: "${h.hint}"`
    );
    expect(
      report,
      `Hint con jargon dev:\n${report.join('\n')}`
    ).toEqual([]);
  });

  it('nessun hint e vuoto o troppo corto (< 10 chars)', () => {
    const bad = allHints.filter((h) => h.hint.trim().length < 10);
    expect(
      bad.map((h) => `${h.expId} step ${h.step}`),
      `Hint vuoti o troppo corti: ${bad.map((h) => `${h.expId}:step${h.step}`).join(', ')}`
    ).toEqual([]);
  });

  // Distribuzione: almeno il 95% sotto 80 caratteri
  it('almeno il 95% degli hint è sotto 80 caratteri (leggibili al volo)', () => {
    const under80 = allHints.filter((h) => h.hint.length <= 80);
    const ratio = under80.length / allHints.length;
    expect(ratio).toBeGreaterThanOrEqual(0.95);
  });
});

// ─── Test 7 — desc: nessuna parola da sviluppatore ─────────────────────────
// (Separato dal test sulla lunghezza per messaggio di errore più preciso)

describe('Principio Zero / 7. desc — nessun jargon tecnico da sviluppatore', () => {
  for (const word of DEV_WORDS) {
    it(`nessuna desc contiene la parola da dev "${word}"`, () => {
      const violators = ALL_EXPERIMENTS.filter(
        (e) => e.desc && e.desc.toLowerCase().includes(word)
      );
      expect(
        violators.map((e) => e.id),
        `Esperimenti con "${word}" in desc: ${violators.map((e) => e.id).join(', ')}`
      ).toEqual([]);
    });
  }
});
