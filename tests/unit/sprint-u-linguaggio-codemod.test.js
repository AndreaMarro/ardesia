/**
 * tests/unit/sprint-u-linguaggio-codemod.test.js
 *
 * Iter 61 B1 P0 PRIMARIO — Workstream B Andrea iter 21+ mandate carryover.
 * Andrea ratify Q-CODEMOD-1=a (PLURALE imperativo uniforme) + Q-CODEMOD-3=a (per-file Codex C-V).
 * Q-CODEMOD-2 teacher_messages DISMISSED iter 61 — OUT-OF-SCOPE.
 *
 * Scope: scripts/sprint-u/linguaggio-codemod.mjs
 * - Verb map 40 entries singolare imperativo → plurale imperativo
 * - False positive guards: preceded-by (quando|se|dopo|prima|perché|mentre|finché|appena)
 * - Student speech inside '...' single quotes: preserve verbatim
 * - JSON path scope strict: phases[].teacher_tip ONLY
 * - Enclitic pronouns: Mostralo→Mostratelo
 * - Composite negation: Non dare→Non date
 * - Infinito → plurale: Mostrare→Mostrate (Q-CODEMOD-1=a "uniforme" mandate)
 */

import { describe, it, expect } from 'vitest';
import {
  VERB_MAP,
  FALSE_POSITIVE_PRECEDED_BY,
  transformText,
  transformTeacherTip,
  transformLessonPath,
} from '../../scripts/sprint-u/linguaggio-codemod.mjs';

describe('VERB_MAP', () => {
  it('contains 40+ singolare→plurale mappings', () => {
    expect(Object.keys(VERB_MAP).length).toBeGreaterThanOrEqual(40);
  });

  it.each([
    ['Premi', 'Premete'],
    ['Fai', 'Fate'],
    ['Clicca', 'Cliccate'],
    ['Monta', 'Montate'],
    ['Collega', 'Collegate'],
    ['Prendi', 'Prendete'],
    ['Prova', 'Provate'],
    ['Inserisci', 'Inserite'],
    ['Apri', 'Aprite'],
    ['Chiudi', 'Chiudete'],
    ['Cerca', 'Cercate'],
    ['Vedi', 'Vedete'],
    ['Usa', 'Usate'],
    ['Chiedi', 'Chiedete'],
    ['Mostra', 'Mostrate'],
    ['Evidenzia', 'Evidenziate'],
    ['Lascia', 'Lasciate'],
    ['Spiega', 'Spiegate'],
    ['Dai', 'Date'],
    ['Anticipa', 'Anticipate'],
    ['Stimola', 'Stimolate'],
    ['Celebra', 'Celebrate'],
    ['Guida', 'Guidate'],
    ['Porta', 'Portate'],
    ['Inizia', 'Iniziate'],
    ['Aiuta', 'Aiutate'],
    ['Sottolinea', 'Sottolineate'],
    ['Rafforza', 'Rafforzate'],
  ])('maps singolare %s → plurale %s', (singolare, plurale) => {
    expect(VERB_MAP[singolare]).toBe(plurale);
  });

  it('maps infinito → plurale (Q-CODEMOD-1=a uniforme mandate)', () => {
    expect(VERB_MAP['Mostrare']).toBe('Mostrate');
    expect(VERB_MAP['Coprire']).toBe('Coprite');
    expect(VERB_MAP['Usare']).toBe('Usate');
    expect(VERB_MAP['Chiedere']).toBe('Chiedete');
    expect(VERB_MAP['Spiegare']).toBe('Spiegate');
    expect(VERB_MAP['Aiutare']).toBe('Aiutate');
    expect(VERB_MAP['Lasciare']).toBe('Lasciate');
    expect(VERB_MAP['Compilare']).toBe('Compilate');
  });
});

describe('transformText — verb map application', () => {
  it('transforms standalone Chiedi → Chiedete with word boundary', () => {
    expect(transformText('Chiedi alla classe.')).toBe('Chiedete alla classe.');
  });

  it('transforms Mostra → Mostrate mid-sentence', () => {
    expect(transformText('Poi Mostra il LED.')).toBe('Poi Mostrate il LED.');
  });

  it('handles multiple violations in one string', () => {
    const input = 'Chiedi: cosa pensate? Mostra il motore. Evidenzia il MOSFET.';
    const output = 'Chiedete: cosa pensate? Mostrate il motore. Evidenziate il MOSFET.';
    expect(transformText(input)).toBe(output);
  });

  it('preserves word boundary (Premi NOT inside Premiazione)', () => {
    expect(transformText('Premiazione finale.')).toBe('Premiazione finale.');
  });

  it('transforms newline-separated paragraphs', () => {
    const input = 'Chiedi prima.\nPoi Mostra dopo.';
    const output = 'Chiedete prima.\nPoi Mostrate dopo.';
    expect(transformText(input)).toBe(output);
  });
});

describe('transformText — already-plurale guard (NO-OP)', () => {
  it.each([
    'Mostrate il motore: ha solo 2 fili.',
    'Fate notare la direzione di rotazione.',
    'Chiedete agli studenti di spiegare.',
    'Premete il pulsante e osservate.',
    'Cliccate sul componente.',
    'Lasciate che provino.',
    'Spiegate la differenza.',
  ])('leaves already-plurale unchanged: %s', (input) => {
    expect(transformText(input)).toBe(input);
  });
});

describe('transformText — false positive guards (preceded-by SKIP)', () => {
  it.each([
    ['quando premi il pulsante', 'quando premi il pulsante'],
    ['se premi a lungo', 'se premi a lungo'],
    ['dopo premi il reset', 'dopo premi il reset'],
    ['prima chiedi se hanno capito', 'prima chiedi se hanno capito'],
    ['perché mostra solo una luce', 'perché mostra solo una luce'],
    ['mentre apri il circuito', 'mentre apri il circuito'],
    ['finché non chiudi il loop', 'finché non chiudi il loop'],
    ['appena premi start', 'appena premi start'],
  ])('preserves verbo after preceded-by guard: %s', (input, expected) => {
    expect(transformText(input)).toBe(expected);
  });

  it('FALSE_POSITIVE_PRECEDED_BY exported regex matches expected prefixes', () => {
    expect(FALSE_POSITIVE_PRECEDED_BY).toBeInstanceOf(RegExp);
    expect('quando '.match(FALSE_POSITIVE_PRECEDED_BY)).toBeTruthy();
    expect('se '.match(FALSE_POSITIVE_PRECEDED_BY)).toBeTruthy();
    expect('Quando '.match(FALSE_POSITIVE_PRECEDED_BY)).toBeTruthy();
    expect('chiedi '.match(FALSE_POSITIVE_PRECEDED_BY)).toBeFalsy();
  });
});

describe('transformText — composite negation', () => {
  it('transforms "Non dare" → "Non date"', () => {
    expect(transformText('Non dare il resistore subito.')).toBe('Non date il resistore subito.');
  });

  it('transforms "Non correre" → "Non correte"', () => {
    expect(transformText('NON correre a correggerli.')).toBe('NON correte a correggerli.');
  });
});

describe('transformText — enclitic pronouns', () => {
  it('transforms "Mostralo" → "Mostratelo"', () => {
    expect(transformText('Mostralo alla classe.')).toBe('Mostratelo alla classe.');
  });

  it('transforms "Spiegalo" → "Spiegatelo"', () => {
    expect(transformText('Spiegalo brevemente.')).toBe('Spiegatelo brevemente.');
  });
});

describe('transformText — student speech preservation', () => {
  it('preserves verbo inside single-quoted student speech', () => {
    const input = "Chiedi: 'premi il pulsante e vedi cosa succede'";
    const output = "Chiedete: 'premi il pulsante e vedi cosa succede'";
    expect(transformText(input)).toBe(output);
  });

  it('preserves complex student speech with multiple verbs inside quotes', () => {
    const input = "Chiedi: 'Mostra a un compagno cosa hai costruito, poi spiega come funziona.'";
    const output = "Chiedete: 'Mostra a un compagno cosa hai costruito, poi spiega come funziona.'";
    expect(transformText(input)).toBe(output);
  });

  it('transforms outside quote but preserves inside (mixed)', () => {
    const input = "Mostra il LED. Chiedi: 'cosa vedi?' Poi Spiega.";
    const output = "Mostrate il LED. Chiedete: 'cosa vedi?' Poi Spiegate.";
    expect(transformText(input)).toBe(output);
  });
});

describe('transformText — relative pronoun + indicative guard (chi/che/lui/lei)', () => {
  it('preserves "chi spiega" relative pronoun + 3rd person indicative', () => {
    expect(transformText("L'effetto Protégé: chi spiega, impara di più.")).toBe("L'effetto Protégé: chi spiega, impara di più.");
  });

  it('preserves "che spiega" relative pronoun + indicative', () => {
    expect(transformText("Un docente che spiega bene.")).toBe("Un docente che spiega bene.");
  });

  it('preserves "lui spiega" subject pronoun + indicative', () => {
    expect(transformText("Lui spiega in modo chiaro.")).toBe("Lui spiega in modo chiaro.");
  });

  it('preserves "lei chiede" subject pronoun + indicative', () => {
    expect(transformText("Lei chiede informazioni.")).toBe("Lei chiede informazioni.");
  });

  it('still transforms imperative at sentence start with subordinate "che" clause', () => {
    expect(transformText("Lascia che provino e poi spiega.")).toBe("Lasciate che provino e poi spiegate.");
  });
});

describe('transformText — past participle / gerund / subjunctive guard', () => {
  it('leaves past participle unchanged', () => {
    expect(transformText('Il pulsante premuto attiva il LED.')).toBe('Il pulsante premuto attiva il LED.');
  });

  it('leaves gerund unchanged', () => {
    expect(transformText('Premendo il pulsante, il LED si accende.')).toBe('Premendo il pulsante, il LED si accende.');
  });
});

describe('transformTeacherTip — input/output API', () => {
  it('returns { output, changes } shape', () => {
    const result = transformTeacherTip('Chiedi: cosa pensate?');
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('changes');
    expect(Array.isArray(result.changes)).toBe(true);
  });

  it('reports changes count for multi-violation input', () => {
    const result = transformTeacherTip('Chiedi prima. Mostra dopo. Evidenzia infine.');
    expect(result.changes.length).toBeGreaterThanOrEqual(3);
    expect(result.output).toContain('Chiedete');
    expect(result.output).toContain('Mostrate');
    expect(result.output).toContain('Evidenziate');
  });

  it('reports 0 changes for already-plurale input', () => {
    const result = transformTeacherTip('Mostrate il motore.');
    expect(result.changes.length).toBe(0);
    expect(result.output).toBe('Mostrate il motore.');
  });

  it('handles empty string', () => {
    const result = transformTeacherTip('');
    expect(result.output).toBe('');
    expect(result.changes.length).toBe(0);
  });
});

describe('transformLessonPath — JSON scope strict', () => {
  const sampleLessonPath = {
    experiment_id: 'v1-test-esp1',
    volume: 1,
    chapter: 6,
    title: 'Test',
    objective: 'Chiedi agli studenti di osservare.',
    chapter_title: 'Capitolo Test',
    phases: [
      {
        name: 'OSSERVA',
        teacher_tip: 'Chiedi prima. Mostra dopo.',
        teacher_messages: ['Premi qui.'],
      },
      {
        name: 'COSTRUISCI',
        teacher_tip: 'Evidenzia il LED.',
        teacher_messages: ['Collega il filo.'],
      },
    ],
    unlimPrompt: 'Mostra il LED al docente.',
  };

  it('transforms phases[].teacher_tip ONLY', () => {
    const result = transformLessonPath(sampleLessonPath);
    expect(result.json.phases[0].teacher_tip).toBe('Chiedete prima. Mostrate dopo.');
    expect(result.json.phases[1].teacher_tip).toBe('Evidenziate il LED.');
  });

  it('PRESERVES teacher_messages unchanged (Q-CODEMOD-2 DISMISSED iter 61)', () => {
    const result = transformLessonPath(sampleLessonPath);
    expect(result.json.phases[0].teacher_messages[0]).toBe('Premi qui.');
    expect(result.json.phases[1].teacher_messages[0]).toBe('Collega il filo.');
  });

  it('PRESERVES objective unchanged', () => {
    const result = transformLessonPath(sampleLessonPath);
    expect(result.json.objective).toBe('Chiedi agli studenti di osservare.');
  });

  it('PRESERVES chapter_title unchanged', () => {
    const result = transformLessonPath(sampleLessonPath);
    expect(result.json.chapter_title).toBe('Capitolo Test');
  });

  it('PRESERVES unlimPrompt unchanged (iter 61 scope teacher_tip only)', () => {
    const result = transformLessonPath(sampleLessonPath);
    expect(result.json.unlimPrompt).toBe('Mostra il LED al docente.');
  });

  it('reports aggregate changesCount across phases', () => {
    const result = transformLessonPath(sampleLessonPath);
    // 2 (Chiedi, Mostra) + 1 (Evidenzia) = 3 changes
    expect(result.changesCount).toBeGreaterThanOrEqual(3);
  });

  it('handles lesson-path with no phases array (edge case)', () => {
    const noPhasesObj = { experiment_id: 'test', volume: 1, chapter: 6, title: 'Test' };
    const result = transformLessonPath(noPhasesObj);
    expect(result.changesCount).toBe(0);
    expect(result.json).toEqual(noPhasesObj);
  });

  it('handles phases without teacher_tip field (edge case)', () => {
    const partialPhases = {
      experiment_id: 'test',
      phases: [{ name: 'OSSERVA', teacher_messages: ['x'] }],
    };
    const result = transformLessonPath(partialPhases);
    expect(result.changesCount).toBe(0);
  });
});

describe('transformText — Vol1 real sample integration', () => {
  it('transforms v1-cap6-esp1 phase OSSERVA tip correctly', () => {
    const input = "Non dare il resistore subito — lascia che provino con batteria + LED + fili. L'emozione del 'si accende!' viene PRIMA di qualsiasi teoria.";
    const output = transformText(input);
    expect(output).toContain('Non date');
    expect(output).toContain('lasciate');
    expect(output).toContain("'si accende!'");
  });

  it('transforms v1-cap10-esp1 phase OSSERVA tip with quote preservation', () => {
    const input = "Dai la fotoresistenza prima di montare il circuito. Chiedi: 'Cosa notate quando la coprite con la mano?'";
    const output = transformText(input);
    expect(output).toContain('Date la fotoresistenza');
    expect(output).toContain('Chiedete:');
    expect(output).toContain("'Cosa notate quando la coprite con la mano?'");
  });
});
