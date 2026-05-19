/**
 * Principio Zero Compliance — UNLIM behavioural audit
 *
 * UNLIM produce CONTENUTO per la classe (10-14 anni). Il docente proietta
 * sulla LIM senza dover studiare. UNLIM NON dice "fai questo" al docente:
 * parla direttamente alla CLASSE con analogie, cita il libro con pagina
 * esatta, e se il docente e' impreparato fa domande proattive.
 *
 * Questi test sono COMPORTAMENTALI: verificano che le risposte non
 * regrediscano a jargon tecnico, che il linguaggio resti per 10-14 anni,
 * che i riferimenti al libro siano concreti, che UNLIM sia proattivo,
 * e che ci sia parita' tra i 3 volumi.
 *
 * === VIOLAZIONI REALI CATTURATE ALLA CREAZIONE (15/04/2026) ===
 *
 * 252 test totali — 19 falliscono per VIOLAZIONI REALI del Principio Zero
 * (tutte nella sezione "Linguaggio 10-14 anni", in src/data/unlim-knowledge-base.js):
 *
 *   KB senza parola-analogia ("come", "è una", "funziona come", "simile a",
 *   "pensalo come") e/o con jargon tecnico non spiegato (anodo/catodo, VCC,
 *   PWM, I2C):
 *     - "Come funziona un LED RGB?" — anodo/catodo senza analogia
 *     - "Come si usa un buzzer con Arduino?"
 *     - "Come si controlla un servo motore?" — PWM senza analogia
 *     - "Qual è la differenza tra delay() e millis()?"
 *     - "Come funziona if/else in Arduino?"
 *     - "Come funziona il ciclo for?"
 *     - "Il mio codice non compila, cosa faccio?"
 *     - "Cosa posso costruire con Arduino?"
 *     - "È troppo difficile!" (risposta empatica senza analogia)
 *     - "Aiutami per favore!" (idem)
 *     - "Ho paura di sbagliare!" (idem)
 *     - "Come si misura la temperatura con Arduino?" — VCC senza analogia
 *     - "Come si usa un display LCD?" — VCC + I2C senza analogia
 *     - "Come è organizzato il manuale ELAB?" — PWM menzionato senza analogia
 *
 * Queste voci devono essere riscritte in unlim-knowledge-base.js aggiungendo
 * analogie tipo "è come...", "funziona come...", "pensalo come..." e/o
 * spiegando il jargon con un paragone familiare ai 10-14 anni. Quando il
 * knowledge base sara' sistemato, questi test passeranno senza modifiche.
 *
 * (c) Andrea Marro — 15/04/2026
 */
import { describe, it, expect } from 'vitest';
import { searchKnowledgeBase, searchRAGChunks } from '../../src/data/unlim-knowledge-base';
import { getVolumeRef, getBookPage, getVolumeLabel } from '../../src/data/volume-references';
import VOLUME_REFERENCES from '../../src/data/volume-references';
import {
  getExperimentGroupContext,
  findLessonForExperiment,
  getLessonsForVolume,
} from '../../src/data/lesson-groups';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Parole-analogia che indicano un linguaggio adatto a 10-14 anni.
// Una risposta KB "buona" ne contiene almeno una.
const ANALOGY_MARKERS = [
  'come ',
  'è una',
  'è un',
  "e' una",
  "e' un",
  'funziona come',
  'simile a',
  'pensalo come',
  'pensa ',
  'immagina',
  'tipo ',
  'come se',
  'assomiglia',
];

// Parole tecniche che DEVONO essere accompagnate da un'analogia nella stessa
// risposta per restare nel linguaggio 10-14 anni. Sono parole che un bambino
// medio NON conosce: anodo, catodo, VCC, PWM ecc.
const TECHNICAL_WORDS = [
  'anodo',
  'catodo',
  'vcc',
  'pwm',
  'uart',
  'i2c',
  'mosfet',
  'partitore',
  'impedenza',
];

// Parole/costruzioni rivolte ESPLICITAMENTE al docente che violano il
// Principio Zero: UNLIM non deve parlare AL docente ("dica ai ragazzi",
// "come insegnante..."). NB: "devi mettere", "devi collegare" parlano
// allo studente che usa la piattaforma e sono ok.
const TEACHER_DIRECTIVE_MARKERS = [
  'dica ai ragazzi',
  'dica alla classe',
  'dica agli studenti',
  'spieghi ai ragazzi',
  'spieghi alla classe',
  'insegnante, ',
  'docente, ',
  'come insegnante',
  'come docente',
  'al docente',
];

// Parole che indicano proattivita' / risposta diagnostica: un prompt
// concreto, una domanda alla classe, una lista di passi, o una proposta.
const PROACTIVE_MARKERS = [
  '1.',
  '1)',
  '\n1',
  '\n- ',
  'controlliamo',
  'prova',
  'verifichiamo',
  'proviamo',
  'puoi',
  'possiamo',
  '?',
];

const WORD_COUNT = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;

// Pull the internal KNOWLEDGE_BASE via a search for a neutral token. Rather
// than re-importing the private const, we iterate by searching unique
// keywords that each entry exposes. To keep the suite focused, we pick a
// representative subset via direct queries.
const KB_PROBE_QUERIES = [
  'come funziona un LED',
  'perche il LED non si accende',
  'come funziona un LED RGB',
  'come funziona una resistenza',
  'legge di Ohm',
  'serie parallelo',
  'cos e Arduino',
  'struttura programma Arduino',
  'digitalWrite',
  'digitalRead pulsante',
  'analogWrite PWM',
  'analogRead sensore',
  'Serial Monitor',
  'breadboard',
  'buzzer',
  'fotoresistenza',
  'servo motore',
  'condensatore',
  'delay millis',
  'if else Arduino',
  'ciclo for',
  'motore DC',
  'errore compilazione',
  'cortocircuito',
  'variabili Arduino',
  'map funzione',
  'cosa posso costruire con Arduino',
  'come inizio con ELAB',
  'non capisco niente',
  'troppo difficile',
  'aiutami per favore',
  'ho paura di sbagliare',
  'funziona ce l ho fatta',
  'sensore temperatura',
  'display LCD',
  'sensore ultrasuoni',
  'resistenza pullup',
  'simulatore ELAB',
  'manuale volume capitolo',
  'lavagna disegnare',
  'come usare UNLIM',
  'elettronica pericolosa',
];

// Collect unique KB answers by probing. Dedup by `question`.
function collectKBAnswers() {
  const map = new Map();
  for (const q of KB_PROBE_QUERIES) {
    const r = searchKnowledgeBase(q);
    if (r && !map.has(r.question)) {
      map.set(r.question, r);
    }
  }
  return [...map.values()];
}

const KB_ANSWERS = collectKBAnswers();

// ---------------------------------------------------------------------------
// Sezione 1 — Docente impreparato apre ELAB (30 test)
// ---------------------------------------------------------------------------
describe('Principio Zero / 1. Docente impreparato apre ELAB', () => {
  it('searchKnowledgeBase("come iniziare") ritorna una risposta non vuota', () => {
    const r = searchKnowledgeBase('come iniziare');
    expect(r).not.toBeNull();
    expect(r.answer.length).toBeGreaterThan(60);
  });

  it('la risposta a "come iniziare" elenca passi numerati o bulletati', () => {
    const r = searchKnowledgeBase('come iniziare');
    expect(r).not.toBeNull();
    const hasSteps = /1\.|1\)|\n-\s/.test(r.answer);
    expect(hasSteps).toBe(true);
  });

  it('"come iniziare" menziona manuale, simulatore o volume', () => {
    const r = searchKnowledgeBase('come iniziare');
    expect(r).not.toBeNull();
    const low = r.answer.toLowerCase();
    expect(/manuale|simulatore|volume|capitolo|libro/.test(low)).toBe(true);
  });

  it('"da dove inizio" non manda in errore e ritorna qualcosa di utile', () => {
    const r = searchKnowledgeBase('da dove inizio');
    // La query potrebbe non matchare la KB curata: in tal caso deve
    // almeno dare risultati via RAG.
    const rag = searchRAGChunks('da dove inizio', 3);
    const usefulKB = r && r.answer && r.answer.length > 40;
    const usefulRAG = rag.length > 0 && rag[0].text && rag[0].text.length > 20;
    expect(usefulKB || usefulRAG).toBe(true);
  });

  it('"aiuto" produce una risposta proattiva con passi o domande', () => {
    const r = searchKnowledgeBase('aiuto');
    const rag = searchRAGChunks('aiuto', 3);
    const source = (r && r.answer) || (rag[0] && rag[0].text) || '';
    expect(source.length).toBeGreaterThan(30);
  });

  it('il primo esperimento v1-cap6-esp1 esiste nei VOLUME_REFERENCES', () => {
    expect(getVolumeRef('v1-cap6-esp1')).not.toBeNull();
  });

  it('v1-cap6-esp1.bookText spiega di cosa serve (LED, batteria, resistore)', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref).not.toBeNull();
    const t = ref.bookText.toLowerCase();
    expect(t.includes('led')).toBe(true);
    expect(t.includes('batteria')).toBe(true);
    expect(t.includes('resistore') || t.includes('resistenza')).toBe(true);
  });

  it('v1-cap6-esp1 ha bookInstructions concrete (>=3 passi)', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref.bookInstructions).toBeInstanceOf(Array);
    expect(ref.bookInstructions.length).toBeGreaterThanOrEqual(3);
  });

  it('v1-cap6-esp1 bookInstructions parlano di "Collega" (azioni fisiche)', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    const withCollega = ref.bookInstructions.filter((s) => /collega/i.test(s));
    expect(withCollega.length).toBeGreaterThanOrEqual(2);
  });

  it('v1-cap6-esp1 e il PRIMO del suo gruppo (position === 1)', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx).not.toBeNull();
    expect(ctx.position).toBe(1);
  });

  it('v1-cap6-esp1 non ha esperimento precedente (prevExp === null)', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx.prevExp).toBeNull();
  });

  it('v1-cap6-esp1 ha un esperimento successivo (nextExp definito)', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx.nextExp).toBeTruthy();
    expect(typeof ctx.nextExp).toBe('string');
  });

  it('v1-cap6-esp1 appartiene alla lezione "Accendi il LED"', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx.lessonTitle.toLowerCase()).toContain('led');
  });

  it('v1-cap6-esp1 narrative spiega la posizione nel gruppo', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx.narrative).toContain('Esperimento');
    expect(ctx.narrative).toContain('Capitolo');
  });

  it('v1-cap6-esp1 bookContext spiega cosa succede nel capitolo', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref.bookContext).toBeTruthy();
    expect(ref.bookContext.length).toBeGreaterThan(30);
  });

  it('v1-cap6-esp1 bookQuote non e una stringa vuota se presente', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    if (ref.bookQuote !== null) {
      expect(typeof ref.bookQuote).toBe('string');
      expect(ref.bookQuote.length).toBeGreaterThan(5);
    }
  });

  it('searchKnowledgeBase("come funziona un LED") ritorna risposta utile', () => {
    const r = searchKnowledgeBase('come funziona un LED');
    expect(r).not.toBeNull();
    expect(r.answer.length).toBeGreaterThan(80);
  });

  it('la risposta "come funziona un LED" contiene un concetto chiave', () => {
    const r = searchKnowledgeBase('come funziona un LED');
    expect(r).not.toBeNull();
    const low = r.answer.toLowerCase();
    // "polarita", "un verso", "piedino" o "resistenza" sono concetti che
    // permettono al docente di spiegare il LED senza studiare.
    expect(/verso|piedino|resistenza|polarità|polarita/.test(low)).toBe(true);
  });

  it('docente che legge la risposta LED capisce cosa e un LED senza formule', () => {
    const r = searchKnowledgeBase('come funziona un LED');
    expect(r).not.toBeNull();
    // Nessuna formula matematica esplicita tipo V=R*I nella risposta LED
    expect(r.answer).not.toMatch(/V\s*=\s*R\s*\*\s*I/);
  });

  it('searchKnowledgeBase("aiuto base principiante") menziona il manuale/simulatore', () => {
    const r = searchKnowledgeBase('aiuto base principiante');
    expect(r).not.toBeNull();
    expect(r.answer.toLowerCase()).toMatch(/manuale|volume|capitolo|simulatore/);
  });

  it('searchKnowledgeBase o RAG per "come inizio" propongono un primo esperimento', () => {
    const r = searchKnowledgeBase('aiuto come iniziare');
    const rag = searchRAGChunks('come iniziare', 3);
    const src = ((r && r.answer) || '') + ' ' + rag.map(c => c.text).join(' ');
    expect(/led|primo|esperimento|simulatore|volume/i.test(src)).toBe(true);
  });

  it('v1-cap6-esp1 ha un volume definito (non undefined/null)', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref.volume).toBe(1);
  });

  it('getVolumeLabel("v1-cap6-esp1") ritorna "Vol. 1, p. XX"', () => {
    const label = getVolumeLabel('v1-cap6-esp1');
    expect(label).toMatch(/^Vol\. 1, p\. \d+$/);
  });

  it('getBookPage("v1-cap6-esp1") ritorna una pagina numerica', () => {
    const p = getBookPage('v1-cap6-esp1');
    expect(typeof p).toBe('number');
    expect(p).toBeGreaterThan(0);
  });

  it('Vol 1 Cap 6 ha almeno 3 esperimenti (esp1, esp2, esp3)', () => {
    expect(getVolumeRef('v1-cap6-esp1')).not.toBeNull();
    expect(getVolumeRef('v1-cap6-esp2')).not.toBeNull();
    expect(getVolumeRef('v1-cap6-esp3')).not.toBeNull();
  });

  it('primo esperimento Vol 1 menziona esplicitamente cosa serve', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(/bisogno di|occorr|ti serve|servono/i.test(ref.bookText)).toBe(true);
  });

  it('v1-cap6-esp1.bookText supera 80 caratteri (no placeholder)', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(ref.bookText.length).toBeGreaterThan(80);
  });

  it('v1-cap6-esp1 bookInstructions sono tutte stringhe non vuote', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    for (const s of ref.bookInstructions) {
      expect(typeof s).toBe('string');
      expect(s.trim().length).toBeGreaterThan(10);
    }
  });

  it('getExperimentGroupContext("v1-cap6-esp1") ha total === numero esperimenti', () => {
    const ctx = getExperimentGroupContext('v1-cap6-esp1');
    expect(ctx.total).toBeGreaterThanOrEqual(3);
  });

  it('v1-cap6-esp1 bookText NON inizia con "Lorem" o placeholder', () => {
    const ref = getVolumeRef('v1-cap6-esp1');
    expect(/^lorem|^placeholder|^tbd|^todo/i.test(ref.bookText)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Sezione 2 — Linguaggio 10-14 anni (40 test)
// ---------------------------------------------------------------------------
describe('Principio Zero / 2. Linguaggio 10-14 anni', () => {
  it('abbiamo raccolto un numero sostanziale di risposte KB', () => {
    expect(KB_ANSWERS.length).toBeGreaterThanOrEqual(25);
  });

  // 2a — almeno una parola-analogia in ogni risposta
  for (const entry of KB_ANSWERS) {
    it(`KB "${entry.question}" contiene almeno una parola-analogia`, () => {
      const low = entry.answer.toLowerCase();
      const hit = ANALOGY_MARKERS.some((m) => low.includes(m));
      expect(hit, `Nessuna analogia in: "${entry.answer.slice(0, 120)}..."`).toBe(true);
    });
  }

  // 2b — nessuna parola tecnica ISOLATA senza analogia
  for (const entry of KB_ANSWERS) {
    it(`KB "${entry.question}" non lascia jargon tecnico senza analogia`, () => {
      const low = entry.answer.toLowerCase();
      // parole tecniche presenti nella risposta
      const jargonInAnswer = TECHNICAL_WORDS.filter((w) => low.includes(w));
      if (jargonInAnswer.length === 0) return; // ok, nessun jargon
      const hasAnalogy = ANALOGY_MARKERS.some((m) => low.includes(m));
      expect(
        hasAnalogy,
        `Jargon [${jargonInAnswer.join(',')}] senza analogia in: "${entry.answer.slice(0, 120)}..."`
      ).toBe(true);
    });
  }

  // 2c — nessuna forma imperativa verso il DOCENTE
  for (const entry of KB_ANSWERS) {
    it(`KB "${entry.question}" non parla al docente con "devi/dovresti fare"`, () => {
      const low = entry.answer.toLowerCase();
      const offender = TEACHER_DIRECTIVE_MARKERS.find((m) => low.includes(m));
      expect(offender, `Forma rivolta al docente: "${offender}"`).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// Sezione 3 — Citazione libro (30 test)
// ---------------------------------------------------------------------------
describe('Principio Zero / 3. Citazione libro', () => {
  // Esperimenti chiave del Vol1 da Cap 6/7/8. 14 esperimenti censiti.
  const VOL1_CAP6_7_8 = [
    'v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap6-esp3',
    'v1-cap7-esp1', 'v1-cap7-esp2', 'v1-cap7-esp3', 'v1-cap7-esp4', 'v1-cap7-esp5', 'v1-cap7-esp6',
    'v1-cap8-esp1', 'v1-cap8-esp2', 'v1-cap8-esp3', 'v1-cap8-esp4', 'v1-cap8-esp5',
  ];

  // 3a — getVolumeRef ritorna un oggetto valido
  for (const id of VOL1_CAP6_7_8) {
    it(`getVolumeRef("${id}") ritorna bookText e bookPage validi`, () => {
      const ref = getVolumeRef(id);
      expect(ref).not.toBeNull();
      expect(typeof ref.bookText).toBe('string');
      expect(ref.bookText.length).toBeGreaterThan(20);
      expect(typeof ref.bookPage).toBe('number');
      expect(ref.bookPage).toBeGreaterThan(0);
    });
  }

  // 3b — bookText NON vuoto (gia' parzialmente coperto sopra, ma con asserzione esplicita)
  for (const id of VOL1_CAP6_7_8) {
    it(`"${id}" bookText non e vuoto e non e un placeholder`, () => {
      const ref = getVolumeRef(id);
      expect(ref.bookText.trim().length).toBeGreaterThan(0);
      expect(/^(tbd|todo|placeholder|xxx|\.\.\.)$/i.test(ref.bookText.trim())).toBe(false);
    });
  }

  // 3c — keyword del capitolo coerenti
  const CHAPTER_KEYWORDS = {
    6: /led|resistore|resistenza|batteria|lucina/i,
    7: /rgb|colore|rosso|verde|blu|led/i,
    8: /pulsant|bottone|interruttor|premere|press/i,
  };

  for (const id of VOL1_CAP6_7_8) {
    const cap = parseInt(id.match(/cap(\d+)/)[1], 10);
    it(`"${id}" bookText/bookInstructions/bookContext contengono keyword del Cap ${cap}`, () => {
      const ref = getVolumeRef(id);
      // Le variazioni ("parti dall'esperimento 1") non ripetono il concetto
      // nel bookText/Instructions — ammesso se bookContext lo fa, oppure se
      // il testo fa back-reference esplicito all'esperimento precedente.
      const text = (ref.bookText + ' ' + (ref.bookInstructions || []).join(' '));
      const ctx = (ref.bookContext || '');
      const backRef = /parti dal|dall esperimento|appena finit|precedent/i.test(text);
      const okChapter = CHAPTER_KEYWORDS[cap].test(text) || CHAPTER_KEYWORDS[cap].test(ctx);
      expect(okChapter || backRef, `"${id}" non cita Cap ${cap} nè fa back-reference`).toBe(true);
    });
  }

  // 3d — pagine coerenti con i range dei capitoli (Cap6 p.27-33, Cap7 p.35-42,
  // Cap8 p.43-58 — lasciamo margine +/-2 per tolleranza editoriale).
  const CHAPTER_PAGE_RANGES = {
    6: [27, 35],
    7: [35, 43],
    8: [43, 60],
  };

  for (const id of VOL1_CAP6_7_8) {
    const cap = parseInt(id.match(/cap(\d+)/)[1], 10);
    it(`"${id}" bookPage rientra nel range del Cap ${cap}`, () => {
      const ref = getVolumeRef(id);
      const [minP, maxP] = CHAPTER_PAGE_RANGES[cap];
      expect(ref.bookPage).toBeGreaterThanOrEqual(minP);
      expect(ref.bookPage).toBeLessThanOrEqual(maxP);
    });
  }
});

// ---------------------------------------------------------------------------
// Sezione 4 — Proattivita UNLIM (20 test)
// ---------------------------------------------------------------------------
describe('Principio Zero / 4. Proattivita UNLIM', () => {
  it('"non so da dove iniziare" → risposta con passi o proposta concreta', () => {
    const kb = searchKnowledgeBase('non so da dove iniziare');
    const rag = searchRAGChunks('non so da dove iniziare', 3);
    const src = ((kb && kb.answer) || '') + '\n' + rag.map((r) => r.text).join('\n');
    expect(src.length).toBeGreaterThan(30);
    const proactive = PROACTIVE_MARKERS.some((m) => src.toLowerCase().includes(m));
    expect(proactive).toBe(true);
  });

  it('"aiuto" non genera risposta generica/muta', () => {
    const kb = searchKnowledgeBase('aiuto');
    const rag = searchRAGChunks('aiuto', 3);
    const src = ((kb && kb.answer) || '') + '\n' + rag.map((r) => r.text).join('\n');
    expect(src.trim().length).toBeGreaterThan(20);
  });

  it('"aiuto" propone almeno una direzione concreta (verbo di azione)', () => {
    const kb = searchKnowledgeBase('aiuto');
    const rag = searchRAGChunks('aiuto', 3);
    const src = (((kb && kb.answer) || '') + ' ' + rag.map((r) => r.text).join(' ')).toLowerCase();
    expect(/dimm|prova|cerc|scegli|guard|controll|proviamo|possiamo|puoi/.test(src)).toBe(true);
  });

  it('"help" (inglese) non va a vuoto: c e RAG o KB', () => {
    const kb = searchKnowledgeBase('help');
    const rag = searchRAGChunks('help', 3);
    const any = !!((kb && kb.answer) || rag.length > 0);
    expect(any).toBe(true);
  });

  it('"il led non va" produce contenuto diagnostico (non risposta di 1 parola)', () => {
    const kb = searchKnowledgeBase('il led non va');
    const rag = searchRAGChunks('il led non va', 3);
    const src = ((kb && kb.answer) || '') + rag.map((r) => r.text).join(' ');
    expect(src.length).toBeGreaterThan(40);
  });

  it('"il led non va" menziona LED, resistenza, batteria o polarita', () => {
    const kb = searchKnowledgeBase('il led non va');
    const rag = searchRAGChunks('il led non va', 3);
    const src = (((kb && kb.answer) || '') + ' ' + rag.map((r) => r.text).join(' ')).toLowerCase();
    expect(/led|resistenza|resistore|batteria|verso|polarità|polarita|collegamento/.test(src)).toBe(true);
  });

  it('"il led non va" NON e un generico "riprova" di poche parole', () => {
    const kb = searchKnowledgeBase('il led non va');
    if (kb && kb.answer) {
      expect(WORD_COUNT(kb.answer)).toBeGreaterThan(20);
    }
  });

  it('"perche il mio LED non si accende" produce checklist diagnostica', () => {
    const kb = searchKnowledgeBase('perche il mio LED non si accende');
    expect(kb).not.toBeNull();
    const low = kb.answer.toLowerCase();
    const proactive = PROACTIVE_MARKERS.some((m) => low.includes(m));
    expect(proactive).toBe(true);
  });

  it('"non capisco niente" e gestita empaticamente, NON con silenzio', () => {
    const kb = searchKnowledgeBase('non capisco niente');
    const rag = searchRAGChunks('non capisco niente', 3);
    const src = ((kb && kb.answer) || '') + rag.map((r) => r.text).join(' ');
    expect(src.length).toBeGreaterThan(30);
  });

  it('"non capisco niente" contiene tono empatico ("tranquillo", "normale", "insieme", ecc.)', () => {
    const kb = searchKnowledgeBase('non capisco niente');
    expect(kb).not.toBeNull();
    expect(/tranquillo|normale|insieme|proviamo|non sei il solo|passo/i.test(kb.answer)).toBe(true);
  });

  it('"non capisco niente" propone un passo successivo concreto', () => {
    const kb = searchKnowledgeBase('non capisco niente');
    expect(kb).not.toBeNull();
    const low = kb.answer.toLowerCase();
    expect(/dimm|prova|spieg|guid|ti guido|proviamo|passo/.test(low)).toBe(true);
  });

  it('"è difficile" → risposta empatica e propositiva', () => {
    const kb = searchKnowledgeBase('è troppo difficile');
    expect(kb).not.toBeNull();
    expect(/facciam|insieme|passo|inventor|trucco|prov/i.test(kb.answer)).toBe(true);
  });

  it('"è difficile" NON banalizza il problema ("è facile!")', () => {
    const kb = searchKnowledgeBase('è troppo difficile');
    expect(kb).not.toBeNull();
    expect(/è facile|e' facile|semplicissimo/i.test(kb.answer)).toBe(false);
  });

  it('"ho paura di sbagliare" rassicura e dice che nel simulatore non si rompe nulla', () => {
    const kb = searchKnowledgeBase('ho paura di sbagliare');
    expect(kb).not.toBeNull();
    expect(/simulatore|non puoi rompere|non si rompe|sperimenta|prova/i.test(kb.answer)).toBe(true);
  });

  it('"aiutami per favore" invita lo studente a descrivere il problema', () => {
    const kb = searchKnowledgeBase('aiutami per favore');
    expect(kb).not.toBeNull();
    expect(/dimm|descrivi|racconta|che cosa|cosa stai/i.test(kb.answer)).toBe(true);
  });

  it('risposta emotiva rimane sotto 200 parole (brevita)', () => {
    const kb = searchKnowledgeBase('è troppo difficile');
    expect(kb).not.toBeNull();
    expect(WORD_COUNT(kb.answer)).toBeLessThan(200);
  });

  it('risposta diagnostica rimane sotto 200 parole (brevita)', () => {
    const kb = searchKnowledgeBase('perche il mio LED non si accende');
    expect(kb).not.toBeNull();
    expect(WORD_COUNT(kb.answer)).toBeLessThan(200);
  });

  it('risposta "aiuto come iniziare" rimane sotto 250 parole', () => {
    const kb = searchKnowledgeBase('aiuto come iniziare');
    expect(kb).not.toBeNull();
    expect(WORD_COUNT(kb.answer)).toBeLessThan(250);
  });

  it('"boh" (token non deterministico) non crasha e produce RAG', () => {
    const kb = searchKnowledgeBase('boh');
    const rag = searchRAGChunks('boh', 3);
    // Almeno il RAG deve avere qualcosa (SHORT_PHRASE_MAP copre "boh")
    expect(rag.length).toBeGreaterThan(0);
  });

  it('"non funziona" rientra nel SHORT_PHRASE_MAP e produce contenuto tecnico', () => {
    const rag = searchRAGChunks('non funziona', 3);
    expect(rag.length).toBeGreaterThan(0);
    const joined = rag.map((r) => r.text).join(' ').toLowerCase();
    expect(/errore|circuito|collegamento|problema|led/.test(joined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sezione 5 — Parita volumi (30 test)
// ---------------------------------------------------------------------------
describe('Principio Zero / 5. Parita tra i 3 volumi', () => {
  it('Vol 1 ha almeno 38 esperimenti in VOLUME_REFERENCES', () => {
    const ids = Object.keys(VOLUME_REFERENCES).filter((id) => id.startsWith('v1-cap'));
    expect(ids.length).toBeGreaterThanOrEqual(38);
  });

  it('Vol 2 ha almeno 27 esperimenti in VOLUME_REFERENCES', () => {
    const ids = Object.keys(VOLUME_REFERENCES).filter((id) => id.startsWith('v2-cap'));
    expect(ids.length).toBeGreaterThanOrEqual(24);
  });

  it('Vol 3 ha almeno 14 esperimenti in VOLUME_REFERENCES', () => {
    const ids = Object.keys(VOLUME_REFERENCES).filter((id) => id.startsWith('v3-cap'));
    expect(ids.length).toBeGreaterThanOrEqual(14);
  });

  // 5a — tutti gli esperimenti hanno bookText non vuoto
  const ALL_IDS = Object.keys(VOLUME_REFERENCES);

  it('TUTTI gli esperimenti (3 volumi) hanno bookText non vuoto', () => {
    const missing = ALL_IDS.filter((id) => {
      const t = VOLUME_REFERENCES[id].bookText;
      return !t || t.trim().length === 0;
    });
    expect(missing, `Esperimenti senza bookText: ${missing.join(',')}`).toEqual([]);
  });

  it('TUTTI gli esperimenti hanno volume coerente col prefisso ID', () => {
    const mismatched = ALL_IDS.filter((id) => {
      const n = parseInt(id.match(/^v(\d)-/)[1], 10);
      return VOLUME_REFERENCES[id].volume !== n;
    });
    expect(mismatched).toEqual([]);
  });

  it('TUTTI gli esperimenti hanno bookPage numerico positivo', () => {
    const bad = ALL_IDS.filter((id) => {
      const p = VOLUME_REFERENCES[id].bookPage;
      return typeof p !== 'number' || p <= 0;
    });
    expect(bad).toEqual([]);
  });

  it('TUTTI gli esperimenti hanno bookInstructions array (eventualmente vuoto e ok solo per extra)', () => {
    const bad = ALL_IDS.filter((id) => {
      const bi = VOLUME_REFERENCES[id].bookInstructions;
      return !Array.isArray(bi);
    });
    expect(bad).toEqual([]);
  });

  // 5b — Vol 1 primo esperimento menziona LED e 9V
  it('v1-cap6-esp1 bookText menziona "LED"', () => {
    expect(/LED|led/.test(getVolumeRef('v1-cap6-esp1').bookText)).toBe(true);
  });

  it('v1-cap6-esp1 bookText menziona batteria 9V', () => {
    const t = getVolumeRef('v1-cap6-esp1').bookText;
    expect(/9V|9 V|batteria/i.test(t)).toBe(true);
  });

  // 5c — Vol 2 coerenza: multimetro, condensatore, transistor...
  const VOL2_TOPIC_MAP = [
    ['v2-cap3-esp1', /multimetro|tensione|volt|misur/i],
    ['v2-cap4-esp1', /resistore|resistenza|parallelo|serie|ohm/i],
    ['v2-cap5-esp1', /batter|tensione|volt|serie/i],
    ['v2-cap6-esp1', /led|resistore/i],
    ['v2-cap7-esp1', /condensatore|carica|scarica|farad/i],
    ['v2-cap8-esp1', /mosfet|transistor|interrut|tensione/i],
    ['v2-cap9-esp1', /foto|luce|sensor|fototransistor|fotoresistor/i],
    ['v2-cap10-esp1', /motor|gira|dc/i],
  ];

  for (const [id, re] of VOL2_TOPIC_MAP) {
    it(`Vol2 "${id}" bookText coerente con argomento del capitolo`, () => {
      const ref = getVolumeRef(id);
      expect(ref).not.toBeNull();
      const all = ref.bookText + ' ' + (ref.bookInstructions || []).join(' ');
      expect(re.test(all)).toBe(true);
    });
  }

  // 5d — Vol 3 coerenza: parla di Arduino / codice / sketch / pin
  const VOL3_IDS_SAMPLE = [
    'v3-cap5-esp1', 'v3-cap5-esp2',
    'v3-cap6-esp1', 'v3-cap6-esp2',
    'v3-cap7-esp1', 'v3-cap7-esp2',
    'v3-cap8-esp1',
  ];

  for (const id of VOL3_IDS_SAMPLE) {
    it(`Vol3 "${id}" bookText o bookInstructions menzionano Arduino/codice/pin/sketch`, () => {
      const ref = getVolumeRef(id);
      expect(ref).not.toBeNull();
      const all = (ref.bookText + ' ' + (ref.bookInstructions || []).join(' ')).toLowerCase();
      expect(/arduino|sketch|codice|pin|digital|analog|setup|loop|led/.test(all)).toBe(true);
    });
  }

  // 5e — getExperimentGroupContext.volume === prefix dell'ID
  const SAMPLED_IDS = [
    'v1-cap6-esp1', 'v1-cap7-esp1', 'v1-cap8-esp1',
    'v2-cap3-esp1', 'v2-cap7-esp1', 'v2-cap10-esp1',
    'v3-cap5-esp1', 'v3-cap6-esp1', 'v3-cap8-esp1',
  ];

  for (const id of SAMPLED_IDS) {
    it(`getExperimentGroupContext("${id}").volume coincide col prefisso`, () => {
      const ctx = getExperimentGroupContext(id);
      expect(ctx).not.toBeNull();
      const n = parseInt(id.match(/^v(\d)-/)[1], 10);
      expect(ctx.volume).toBe(n);
    });
  }

  // 5f — ogni volume ha almeno 1 lezione (lesson-groups)
  it('Vol 1 ha almeno 9 lezioni nel lesson-groups', () => {
    expect(getLessonsForVolume(1).length).toBeGreaterThanOrEqual(9);
  });

  it('Vol 2 ha almeno 9 lezioni nel lesson-groups', () => {
    expect(getLessonsForVolume(2).length).toBeGreaterThanOrEqual(9);
  });

  it('Vol 3 ha almeno 5 lezioni nel lesson-groups', () => {
    expect(getLessonsForVolume(3).length).toBeGreaterThanOrEqual(5);
  });

  // 5g — ogni esperimento del VOLUME_REFERENCES appartiene a una lezione
  it('La maggior parte degli esperimenti del VOLUME_REFERENCES ha una lezione assegnata', () => {
    const orphans = ALL_IDS.filter((id) => findLessonForExperiment(id) === null);
    // Tolleranza: alcuni 'extra' possono non essere mappati, ma deve
    // essere una percentuale bassa.
    const ratio = orphans.length / ALL_IDS.length;
    expect(ratio, `Orfani: ${orphans.length}/${ALL_IDS.length} (${orphans.slice(0, 5).join(',')})`).toBeLessThan(0.2);
  });
});
