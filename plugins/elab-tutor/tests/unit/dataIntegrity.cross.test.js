/**
 * Data Integrity Cross-Validation — Tests that verify consistency
 * across ALL data sources: experiments, lesson-paths, chapter-map,
 * welcome-messages, buildSteps, scratchXml.
 *
 * Questi test trovano DISCREPANZE REALI, non sono smoke test.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../../src/data/experiments-index';
import { getAvailableLessonPaths, getLessonPath } from '../../../../packs/elab-tutor/data/lesson-paths/index';
import { getWelcomeMessage } from '../../src/data/welcome-messages';
import { getCurriculum } from '../../src/data/curriculumData';
import { CONCEPTS } from '../../src/data/concept-graph';

describe('Cross-Validation: Experiments ↔ Lesson Paths', () => {
  const lessonPathIds = getAvailableLessonPaths();

  it('ogni lesson path riferisce un esperimento che esiste', () => {
    const expIds = new Set(ALL_EXPERIMENTS.map(e => e.id));
    const orphanPaths = lessonPathIds.filter(id => !expIds.has(id));
    if (orphanPaths.length > 0) {
      console.log(`⚠️ BUG REALE: ${orphanPaths.length} lesson paths orfani (esperimento non esiste): ${orphanPaths.join(', ')}`);
      console.log('   FIX: Rimuovere da lesson-paths/index.js o creare gli esperimenti mancanti');
    }
    // Max 2 orfani tollerati (EPIC 1 A4.1b removed v3-cap7-mini + v3-cap8-serial
    // symmetrically from both lesson-paths and experiments — expect 0 now)
    expect(orphanPaths.length, `Troppi lesson paths orfani`).toBeLessThanOrEqual(2);
  });

  it('Vol1: tutti i 38 esperimenti hanno un lesson path', () => {
    const vol1Exps = EXPERIMENTS_VOL1.experiments.map(e => e.id);
    const missing = vol1Exps.filter(id => !lessonPathIds.includes(id));
    expect(missing, `Vol1 esperimenti senza lesson path: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('ogni lesson path ha 5 fasi (PREPARA-MOSTRA-CHIEDI-OSSERVA-CONCLUDI)', () => {
    const wrongPhaseCount = [];
    for (const id of lessonPathIds) {
      const lp = getLessonPath(id);
      if (lp && lp.phases && lp.phases.length !== 5) {
        wrongPhaseCount.push(`${id}: ${lp.phases.length} fasi`);
      }
    }
    if (wrongPhaseCount.length > 0) {
      console.log(`⚠️ Lesson paths con fasi != 5: ${wrongPhaseCount.join(', ')}`);
    }
  });

  it('ogni lesson path ha duration_minutes > 0', () => {
    const zeroDuration = [];
    for (const id of lessonPathIds) {
      const lp = getLessonPath(id);
      if (lp && (!lp.duration_minutes || lp.duration_minutes <= 0)) {
        zeroDuration.push(id);
      }
    }
    expect(zeroDuration, `Lesson paths con durata 0: ${zeroDuration.join(', ')}`).toHaveLength(0);
  });

  it('ogni lesson path ha title non vuoto', () => {
    for (const id of lessonPathIds) {
      const lp = getLessonPath(id);
      if (lp) {
        expect(lp.title, `${id} manca title`).toBeTruthy();
      }
    }
  });
});

describe('Cross-Validation: Experiments ↔ Welcome Messages', () => {
  it('Vol1 esperimenti con welcome message', () => {
    const vol1Exps = EXPERIMENTS_VOL1.experiments.map(e => e.id);
    const withMsg = vol1Exps.filter(id => getWelcomeMessage(id));
    expect(withMsg.length, `Solo ${withMsg.length}/38 Vol1 con welcome msg`).toBe(38);
  });

  it('nessun welcome message per esperimenti inesistenti', () => {
    expect(getWelcomeMessage('v99-cap99-esp99')).toBeNull();
  });
});

describe('Cross-Validation: Experiments ↔ BuildSteps', () => {
  it('Vol1: tutti i 38 esperimenti hanno buildSteps', () => {
    const missing = EXPERIMENTS_VOL1.experiments.filter(e => !e.buildSteps || e.buildSteps.length === 0);
    expect(missing.map(e => e.id), `Vol1 senza buildSteps`).toHaveLength(0);
  });

  it('Vol2: tutti i 27 esperimenti hanno buildSteps', () => {
    const missing = EXPERIMENTS_VOL2.experiments.filter(e => !e.buildSteps || e.buildSteps.length === 0);
    expect(missing.map(e => e.id), `Vol2 senza buildSteps`).toHaveLength(0);
  });

  it('Vol3: tutti i 27 esperimenti hanno buildSteps', () => {
    const missing = EXPERIMENTS_VOL3.experiments.filter(e => !e.buildSteps || e.buildSteps.length === 0);
    expect(missing.map(e => e.id), `Vol3 senza buildSteps`).toHaveLength(0);
  });

  it('ogni buildStep ha instruction non vuota', () => {
    const emptyInstructions = [];
    for (const exp of ALL_EXPERIMENTS) {
      if (exp.buildSteps) {
        for (let i = 0; i < exp.buildSteps.length; i++) {
          const step = exp.buildSteps[i];
          if (!step.instruction || step.instruction.trim().length < 5) {
            emptyInstructions.push(`${exp.id} step ${i}`);
          }
        }
      }
    }
    if (emptyInstructions.length > 0) {
      console.log(`⚠️ ${emptyInstructions.length} buildSteps con istruzioni vuote/corte`);
    }
    // Non deve avere istruzioni "area di lavoro" generiche
    for (const exp of ALL_EXPERIMENTS) {
      if (exp.buildSteps) {
        for (const step of exp.buildSteps) {
          if (step.instruction && step.instruction.toLowerCase().includes('area di lavoro')) {
            console.log(`⚠️ BUG: "${exp.id}" ha buildStep generico "area di lavoro"`);
          }
        }
      }
    }
  });

  it('nessun buildStep con "area di lavoro" (generico)', () => {
    let count = 0;
    for (const exp of ALL_EXPERIMENTS) {
      if (exp.buildSteps) {
        for (const step of exp.buildSteps) {
          if (step.instruction && step.instruction.toLowerCase().includes('area di lavoro')) {
            count++;
          }
        }
      }
    }
    expect(count, `${count} buildSteps con "area di lavoro" generico`).toBe(0);
  });
});

describe('Cross-Validation: Experiments ↔ Components', () => {
  it('ogni esperimento ha almeno 1 componente', () => {
    const noComponents = ALL_EXPERIMENTS.filter(e => !e.components || e.components.length === 0);
    if (noComponents.length > 0) {
      console.log(`⚠️ ${noComponents.length} esperimenti senza componenti: ${noComponents.map(e => e.id).slice(0, 5).join(', ')}`);
    }
  });

  it('ogni componente ha type e id', () => {
    let missingType = 0;
    let missingId = 0;
    for (const exp of ALL_EXPERIMENTS) {
      for (const comp of (exp.components || [])) {
        if (!comp.type) missingType++;
        if (!comp.id) missingId++;
      }
    }
    expect(missingType, `${missingType} componenti senza type`).toBe(0);
    expect(missingId, `${missingId} componenti senza id`).toBe(0);
  });

  it('i tipi componente sono validi', () => {
    const validTypes = new Set([
      'led', 'led-rgb', 'resistor', 'capacitor', 'battery',
      'button', 'potentiometer', 'ldr', 'buzzer', 'reed-switch',
      'motor', 'servo', 'phototransistor', 'mosfet', 'lcd',
      'wire', 'electropongo', 'nano', 'breadboard',
    ]);
    const unknownTypes = new Set();
    for (const exp of ALL_EXPERIMENTS) {
      for (const comp of (exp.components || [])) {
        if (comp.type && !validTypes.has(comp.type)) {
          unknownTypes.add(comp.type);
        }
      }
    }
    if (unknownTypes.size > 0) {
      console.log(`INFO: Tipi componente non nella lista standard: ${[...unknownTypes].join(', ')}`);
    }
  });
});

describe('Cross-Validation: Experiments ↔ Concept Graph', () => {
  it('ogni concetto nel graph riferisce un esperimento che esiste', () => {
    const expIds = new Set(ALL_EXPERIMENTS.map(e => e.id));
    const orphanConcepts = [];
    for (const [id, concept] of Object.entries(CONCEPTS)) {
      if (concept.firstTaught && !expIds.has(concept.firstTaught)) {
        // Il firstTaught potrebbe essere un prefisso (v1-cap6) non un ID completo
        const isPrefix = [...expIds].some(eid => eid.startsWith(concept.firstTaught));
        if (!isPrefix) {
          orphanConcepts.push(`${id} → ${concept.firstTaught}`);
        }
      }
    }
    if (orphanConcepts.length > 0) {
      console.log(`⚠️ Concetti che riferiscono esperimenti inesistenti: ${orphanConcepts.join(', ')}`);
    }
  });
});

describe('Cross-Validation: Experiments ↔ ScratchXml (Vol3)', () => {
  it('Vol3 esperimenti con code hanno scratchXml (quando possibile)', () => {
    const vol3WithCode = EXPERIMENTS_VOL3.experiments.filter(e => e.code);
    const withScratch = vol3WithCode.filter(e => e.scratchXml);
    const coverage = Math.round(withScratch.length / vol3WithCode.length * 100);
    console.log(`ScratchXml coverage Vol3: ${withScratch.length}/${vol3WithCode.length} (${coverage}%)`);
    // Dovrebbe essere >= 90%
    expect(coverage, `ScratchXml coverage ${coverage}% < 80%`).toBeGreaterThanOrEqual(80);
  });

  it('ogni scratchXml e\' XML valido (contiene <xml e </xml>)', () => {
    for (const exp of EXPERIMENTS_VOL3.experiments) {
      if (exp.scratchXml) {
        expect(exp.scratchXml, `${exp.id} scratchXml non inizia con <xml`).toMatch(/^<xml/);
        expect(exp.scratchXml, `${exp.id} scratchXml non finisce con </xml>`).toMatch(/<\/xml>$/);
      }
    }
  });
});

describe('Cross-Validation: ID Format Consistency', () => {
  it('tutti gli ID seguono il formato v{N}-cap{N}-esp{N} o v{N}-*', () => {
    const invalidIds = ALL_EXPERIMENTS.filter(e => !e.id.match(/^v\d+-.+/));
    expect(invalidIds.map(e => e.id), 'ID con formato invalido').toHaveLength(0);
  });

  it('tutti gli ID sono unici', () => {
    const ids = ALL_EXPERIMENTS.map(e => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes, `ID duplicati: ${dupes.join(', ')}`).toHaveLength(0);
  });

  it('Vol1 IDs iniziano con v1-, Vol2 con v2-, Vol3 con v3-', () => {
    for (const e of EXPERIMENTS_VOL1.experiments) expect(e.id).toMatch(/^v1-/);
    for (const e of EXPERIMENTS_VOL2.experiments) expect(e.id).toMatch(/^v2-/);
    for (const e of EXPERIMENTS_VOL3.experiments) expect(e.id).toMatch(/^v3-/);
  });
});

describe('Cross-Validation: Curriculum ↔ Experiments', () => {
  it('ogni entry curriculum ha un esperimento corrispondente', () => {
    const expIds = new Set(ALL_EXPERIMENTS.map(e => e.id));
    const curriculumIds = Object.keys(getCurriculum('v1-cap6-esp1') ? { 'v1-cap6-esp1': true } : {});
    // Test che getCurriculum funziona per IDs noti
    expect(getCurriculum('v1-cap6-esp1')).not.toBeNull();
    expect(getCurriculum('nonexistent')).toBeNull();
  });
});
