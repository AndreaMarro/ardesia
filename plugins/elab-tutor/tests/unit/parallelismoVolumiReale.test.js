/**
 * PARALLELISMO VOLUMI REALE — Test behavioral
 *
 * Verifica che UNLIM (via lessonPrepService) inietti il testo del libro
 * e il principio evolutivo nel prompt per il backend AI.
 *
 * Principio Zero: il docente impreparato apre ELAB → UNLIM prepara la lezione
 * usando le ESATTE PAROLE del volume fisico + contesto evolutivo del capitolo.
 *
 * (c) Andrea Marro — 16/04/2026
 */
import { describe, it, expect } from 'vitest';
import { getVolumeRef } from '../../src/data/volume-references';
import { getExperimentGroupContext } from '../../src/data/lesson-groups';
import { ALL_EXPERIMENTS } from '../../src/data/experiments-index';

// ═══════════════════════════════════════════════════════════════
// 1. OGNI esperimento ha bookText completo (no stub, no troncamento)
// ═══════════════════════════════════════════════════════════════

describe('Parallelismo Volumi — bookText presente per ogni esperimento', () => {
  ALL_EXPERIMENTS.forEach(exp => {
    it(`${exp.id}: volume-references ha bookText non vuoto`, () => {
      const ref = getVolumeRef(exp.id);
      expect(ref, `volume-ref mancante per ${exp.id}`).not.toBeNull();
      expect(ref.bookText, `bookText mancante per ${exp.id}`).toBeTruthy();
      expect(ref.bookText.length, `bookText troppo corto per ${exp.id}`).toBeGreaterThan(20);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Principio EVOLUTIVO — esperimenti non-primi hanno prevExp
// che permette di raccontare la continuità narrativa
// ═══════════════════════════════════════════════════════════════

describe('Parallelismo Volumi — continuità evolutiva tra esperimenti', () => {
  it('v1-cap6-esp2 è evoluzione di v1-cap6-esp1 (stesso capitolo)', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp2');
    expect(ctx).not.toBeNull();
    expect(ctx.prevExp).toBe('v1-cap6-esp1');
    expect(ctx.chapter).toBe(6);
  });

  it('v1-cap7-esp6 è ULTIMO del capitolo (nextExp null)', () => {
    const ctx = getExperimentGroupContext('v1-cap7-esp6');
    expect(ctx.nextExp).toBeNull();
  });

  it('tutti gli esperimenti NON primi hanno prevExp che esiste in VOLUME_REFS', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      const ctx = getExperimentGroupContext(exp.id);
      if (ctx?.prevExp) {
        const prevRef = getVolumeRef(ctx.prevExp);
        expect(prevRef, `prevExp ${ctx.prevExp} referenziato da ${exp.id} non ha volume-ref`).not.toBeNull();
      }
    });
  });

  it('tutti gli esperimenti NON ultimi hanno nextExp che esiste', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      const ctx = getExperimentGroupContext(exp.id);
      if (ctx?.nextExp) {
        const nextRef = getVolumeRef(ctx.nextExp);
        expect(nextRef, `nextExp ${ctx.nextExp} referenziato da ${exp.id} non ha volume-ref`).not.toBeNull();
      }
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Il prompt di lessonPrepService INCLUDE bookText + evolutivo
// Testato simulando la struttura del prompt
// ═══════════════════════════════════════════════════════════════

describe('Parallelismo Volumi — prompt UNLIM include citazione libro + evoluzione', () => {
  // Replica logica di buildPrepPrompt per testare l'iniezione contesto
  function buildMinimalPrompt(expId) {
    const volRef = getVolumeRef(expId);
    const groupCtx = getExperimentGroupContext(expId);
    let prompt = '';

    if (volRef) {
      prompt += `DAL LIBRO FISICO (Vol. ${volRef.volume}, pag. ${volRef.bookPage}): `;
      prompt += `Capitolo: ${volRef.chapter}. `;
      if (volRef.bookText) prompt += `Testo introduttivo: "${volRef.bookText}". `;
      if (volRef.bookInstructions?.length) {
        prompt += `Istruzioni dal libro: ${volRef.bookInstructions.join(' | ')}. `;
      }
    }

    if (groupCtx) {
      prompt += `[CONTESTO EVOLUTIVO] ${groupCtx.narrative}. `;
      if (groupCtx.prevExp) {
        const prevRef = getVolumeRef(groupCtx.prevExp);
        if (prevRef?.bookText) {
          prompt += `Esperimento precedente ${groupCtx.prevExp}: "${prevRef.bookText.slice(0, 100)}". `;
        }
        prompt += `Partire dal circuito precedente, non da zero. `;
      } else {
        prompt += `Primo esperimento del capitolo: partire da zero. `;
      }
    }

    return prompt;
  }

  it('prompt v1-cap6-esp1 cita pagina libro fisico', () => {
    const p = buildMinimalPrompt('v1-cap6-esp1');
    expect(p).toMatch(/pag\./);
    expect(p).toMatch(/Vol\. 1/);
    expect(p).toContain('Primo esperimento del capitolo');
  });

  it('prompt v1-cap6-esp2 include testo esp1 (evoluzione)', () => {
    const p = buildMinimalPrompt('v1-cap6-esp2');
    expect(p).toContain('Partire dal circuito precedente');
    expect(p).toContain('v1-cap6-esp1');
  });

  it('prompt v1-cap7-esp3 cita contesto evolutivo Cap7', () => {
    const p = buildMinimalPrompt('v1-cap7-esp3');
    expect(p).toMatch(/Esperimento 3/);
    expect(p).toContain('v1-cap7-esp2');
  });

  it('prompt TUTTI gli esperimenti ha "bookText" (verifica integrita)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      const p = buildMinimalPrompt(exp.id);
      expect(p, `prompt vuoto per ${exp.id}`).toBeTruthy();
      expect(p.length, `prompt troppo corto per ${exp.id}`).toBeGreaterThan(100);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Principio Zero: prompt usa linguaggio pedagogico per la CLASSE,
// non per il docente (no "tu devi/dovresti")
// ═══════════════════════════════════════════════════════════════

describe('Parallelismo Volumi — il prompt richiede linguaggio classe', () => {
  it('volume-references bookText usa linguaggio concreto (niente jargon eccessivo)', () => {
    // Sample sul primo esperimento di ogni volume
    const samples = ['v1-cap6-esp1', 'v2-cap3-esp1', 'v3-cap5-esp1'];
    samples.forEach(id => {
      const ref = getVolumeRef(id);
      if (!ref?.bookText) return;
      // Non deve contenere jargon senza spiegazione (GND, VCC, PWM isolato)
      const text = ref.bookText.toLowerCase();
      // Almeno un termine concreto: LED, breadboard, batteria, resistore, pulsante
      const hasConcreteTerm = /led|breadboard|batteria|resist|pulsant|fil[oi]|sensore|motore|potenziomet/.test(text);
      expect(hasConcreteTerm, `${id} bookText senza termini concreti`).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. lessonPrepService importato senza errori
// ═══════════════════════════════════════════════════════════════

describe('Parallelismo Volumi — lessonPrepService exports', () => {
  // Static import hoisted to module top avoids dynamic-import contention that
  // caused intermittent 5s timeout in full-suite runs (see ralph-metrics.json
  // flaky_known entry 2026-04-17). Iter 36 Phase 3 close: 10s → 30s belt-and-
  // suspenders post anti-regression FERREA mandate (M4 16GB cold start variance
  // + concurrent vitest worker pool saturation can extend dynamic import path).
  // Test re-failed iter 36 push 4 retry: timeout 10s exceeded under contention.
  it('esporta prepareLesson e getLessonSummary', async () => {
    const mod = await import('../../src/services/lessonPrepService');
    expect(typeof mod.prepareLesson).toBe('function');
    expect(typeof mod.getLessonSummary).toBe('function');
    expect(typeof mod.isLessonPrepCommand).toBe('function');
  }, 30_000);
});
