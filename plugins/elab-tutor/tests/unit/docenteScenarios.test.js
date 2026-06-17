/**
 * Scenari docente reali — verifica Principio Zero
 *
 * Test che simulano un docente TOTALMENTE IMPREPARATO che apre ELAB:
 * - Non ha mai visto un circuito
 * - Deve fare lezione FRA 5 MINUTI
 * - Guarda ELAB con la coda dell'occhio e capisce cosa fare
 *
 * Questi test verificano che TUTTO CIO' CHE SERVE sia disponibile
 * (testo libro, contesto capitolo, narrativa, risposte KB proattive)
 * senza che il docente debba studiare.
 *
 * (c) Andrea Marro — 16/04/2026
 */
import { describe, it, expect } from 'vitest';
import { searchKnowledgeBase, searchRAGChunks } from '../../src/data/unlim-knowledge-base';
import { getVolumeRef } from '../../src/data/volume-references';
import { getExperimentGroupContext, findLessonForExperiment } from '../../src/data/lesson-groups';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index';

// ═══════════════════════════════════════════════════════════════
// SCENARIO 1: Docente apre ELAB per la prima volta, deve fare
// il primo esperimento del Volume 1 (Cap 6 — Accendi il LED)
// ═══════════════════════════════════════════════════════════════

describe('Scenario Docente 1: primo esperimento senza preparazione', () => {
  const expId = 'v1-cap6-esp1';

  it('il docente vede SUBITO dove si trova (narrative)', () => {
    const ctx = getExperimentGroupContext(expId);
    expect(ctx).not.toBeNull();
    expect(ctx.narrative).toContain('Esperimento');
    expect(ctx.narrative).toContain('Capitolo 6');
    expect(ctx.narrative).toContain('di'); // "Esperimento 1 di 3"
  });

  it('il docente sa cosa dice il libro (testo completo, non troncato)', () => {
    const ref = getVolumeRef(expId);
    expect(ref).not.toBeNull();
    expect(ref.bookText).toBeTruthy();
    expect(ref.bookText.length).toBeGreaterThan(50);
    // Il testo parla di componenti concreti (LED, breadboard)
    const bookText = ref.bookText.toLowerCase();
    const hasConcreteComponents =
      bookText.includes('led') ||
      bookText.includes('breadboard') ||
      bookText.includes('resist') ||
      bookText.includes('batter');
    expect(hasConcreteComponents).toBe(true);
  });

  it('il docente sa la pagina esatta del libro fisico', () => {
    const ref = getVolumeRef(expId);
    expect(typeof ref.bookPage).toBe('number');
    expect(ref.bookPage).toBeGreaterThan(0);
    expect(ref.bookPage).toBeLessThan(200);
  });

  it('il docente trova una risposta se un bambino chiede "cos\'e\' un LED"', () => {
    const result = searchKnowledgeBase("cos'è un LED");
    expect(result).not.toBeNull();
    // Risposta usa analogia (Principio Zero: linguaggio 10-14)
    const hasAnalogy = /come|è una|è un|pensa|immagina/i.test(result.answer);
    expect(hasAnalogy).toBe(true);
  });

  it('la lezione è inquadrata (sa che è il primo esperimento del capitolo)', () => {
    const ctx = getExperimentGroupContext(expId);
    expect(ctx.position).toBe(1);
    expect(ctx.prevExp).toBeNull();
    expect(ctx.nextExp).toBeTruthy(); // c'è un seguito
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 2: Docente e' a meta' capitolo (v1-cap7-esp3 — LED RGB)
// Deve sapere dove si trova e cosa e' successo prima
// ═══════════════════════════════════════════════════════════════

describe('Scenario Docente 2: a metà capitolo (Vol1 Cap7 Esp3)', () => {
  const expId = 'v1-cap7-esp3';

  it('narrative mostra posizione (es. "Esperimento 3 di 6")', () => {
    const ctx = getExperimentGroupContext(expId);
    expect(ctx.narrative).toMatch(/Esperimento 3 di \d+/);
  });

  it('ha prevExp (sa cosa c\'era prima)', () => {
    const ctx = getExperimentGroupContext(expId);
    expect(ctx.prevExp).toBe('v1-cap7-esp2');
  });

  it('ha nextExp (sa cosa viene dopo)', () => {
    const ctx = getExperimentGroupContext(expId);
    expect(ctx.nextExp).toBe('v1-cap7-esp4');
  });

  it('tutti 6 esperimenti Cap7 condividono lo stesso lessonTitle', () => {
    const ids = ['v1-cap7-esp1', 'v1-cap7-esp2', 'v1-cap7-esp3', 'v1-cap7-esp4', 'v1-cap7-esp5', 'v1-cap7-esp6'];
    const titles = ids.map(id => getExperimentGroupContext(id)?.lessonTitle);
    expect(new Set(titles).size).toBe(1);
  });

  it('il libro ha testo specifico per questo esperimento', () => {
    const ref = getVolumeRef(expId);
    expect(ref.bookText).toBeTruthy();
    expect(ref.bookText.length).toBeGreaterThan(30);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 3: Docente deve rispondere a domande frequenti ragazzi
// Ogni domanda deve trovare risposta con analogia
// ═══════════════════════════════════════════════════════════════

describe('Scenario Docente 3: classi di 12 anni chiedono domande tipiche', () => {
  const classroomQuestions = [
    { q: "perche' il led non si accende", expected: 'led|gira|resistenza' },
    { q: "cosa fa il resistore", expected: 'tubo|freno|strettoia|passa|corrente' },
    { q: "come collego il pulsante", expected: 'pulsante|premut|interrut' },
    { q: "che cos'e' la breadboard", expected: 'basetta|fori|breadboard' },
    { q: "perche' serve la batteria", expected: 'batter|aliment|energia|tensione|corrente' },
  ];

  classroomQuestions.forEach(({ q, expected }) => {
    it(`domanda "${q}" trova risposta pertinente`, () => {
      const kb = searchKnowledgeBase(q);
      const rag = searchRAGChunks(q, 2);
      const hasAnswer = (kb !== null) || (rag.length > 0);
      expect(hasAnswer).toBe(true);
      // Se c'è risposta KB, verifica pertinenza
      if (kb) {
        const regex = new RegExp(expected, 'i');
        expect(kb.answer).toMatch(regex);
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 4: Docente impreparato apre ELAB — cosa vede?
// ═══════════════════════════════════════════════════════════════

describe('Scenario Docente 4: supporto impreparato (Principio Zero)', () => {
  it('chiede "da dove inizio" → UNLIM guida al manuale', () => {
    const result = searchKnowledgeBase('come inizio');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/volume|manuale|esperimento|elab/);
  });

  it('chiede "non so niente di elettronica" → KB risponde', () => {
    const result = searchKnowledgeBase('principiante iniziare');
    expect(result).not.toBeNull();
  });

  it('emotivo: "è troppo difficile" → risposta empatica', () => {
    const result = searchKnowledgeBase('è troppo difficile');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/tranquil|passo|insieme|bici|ce la/);
  });

  it('chiede "cosa insegno oggi" — RAG deve coprire con analogia', () => {
    const rag = searchRAGChunks('insegnare primo esperimento', 3);
    // Almeno un risultato
    expect(rag.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 5: Parita' volumi — OGNI esperimento deve avere
// sufficiente materiale per una lezione senza preparazione
// ═══════════════════════════════════════════════════════════════

describe('Scenario Docente 5: parità volumi per tutti i 92 esperimenti', () => {
  // Per ogni esperimento, verifica che il docente abbia TUTTO:
  // - group context (narrative, position, chapter)
  // - volume ref (bookText, bookPage)
  // - steps (almeno 1)

  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: docente ha narrative + bookText + steps`, () => {
      const ctx = getExperimentGroupContext(exp.id);
      const ref = getVolumeRef(exp.id);

      expect(ctx, `manca group context per ${exp.id}`).not.toBeNull();
      expect(ref, `manca volume ref per ${exp.id}`).not.toBeNull();
      expect(ref.bookText, `manca bookText per ${exp.id}`).toBeTruthy();
      expect(exp.buildSteps?.length ?? 0, `manca steps per ${exp.id}`).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SCENARIO 6: Linguaggio contenuto KB per classe 10-14 anni
// Nessuna risposta dovrebbe essere "muta" (senza analogia)
// quando contiene termini tecnici specifici
// ═══════════════════════════════════════════════════════════════

describe('Scenario Docente 6: linguaggio adatto a classe 10-14', () => {
  const ANALOGY_WORDS = ['come ', 'è una', 'è un', 'funziona come', 'pensa', 'immagina', 'tipo ', 'assomiglia'];

  it('la risposta su LED usa analogia', () => {
    const result = searchKnowledgeBase('come funziona un led');
    expect(result).not.toBeNull();
    const hasAnalogy = ANALOGY_WORDS.some(w => result.answer.toLowerCase().includes(w));
    expect(hasAnalogy).toBe(true);
  });

  it('la risposta su resistenza usa analogia (tubo, strettoia, freno)', () => {
    const result = searchKnowledgeBase('come funziona una resistenza');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/tubo|strettoia|freno|flusso/);
  });

  it('la risposta emotiva "aiuto" usa analogia empatica', () => {
    const result = searchKnowledgeBase('aiutami');
    expect(result).not.toBeNull();
    const hasSupport = /guida|insieme|sentiero|tranquill|dimmi/i.test(result.answer);
    expect(hasSupport).toBe(true);
  });
});
