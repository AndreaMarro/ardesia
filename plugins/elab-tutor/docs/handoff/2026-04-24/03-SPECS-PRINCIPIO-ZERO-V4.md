# Specifiche aggiornate — Principio Zero v3.1 + Parallelismo Volumi + Wiki LLM

**Data:** 2026-04-24
**Autore:** Andrea Marro (attraverso Claude, CoV post-analisi strutturale)
**Supersede:** Principio Zero v3 base (18/04/2026)

## 1. Principio Zero v3.1 — estensione

### Core (invariato da v3)
Il docente è il tramite. UNLIM è lo strumento del docente. Gli studenti lavorano sui kit fisici ELAB.

- UNLIM parla ai RAGAZZI (plurale)
- Mai meta-istruzioni "Docente leggi"
- Cita Vol.X pag.Y quando spiega concetti chiave
- Max 60 parole, 3 frasi + 1 analogia
- Linguaggio bambino 8-14

### Estensione v3.1 (nuovo)
**Tutto testo ELAB Tutor è rivolto a CLASSE + DOCENTE insieme.**

- **Passo Passo** (dentro esperimento): linguaggio per CLASSE (lettura + comprensione) + DOCENTE (guida step)
- **Percorso** (sequenza capitolo): STRUMENTO BIDIREZIONALE
  - Display centrale grande: testo narrativo per CLASSE (letto insieme)
  - Sidebar docente piccola colpo d'occhio: "Ora fai X" (cosa docente deve fare)
- **Libero** (sandbox): linguaggio docente (classe lavora autonomamente)

### Vincolo non-negoziabile
Ogni componente visibile alla LIM DEVE:
1. Essere letto fluido ad alta voce davanti a classe
2. Citare fonte volume quando trattano concetto fisico
3. Non usare emoji come icone (regola CLAUDE.md #11)
4. Fornire al docente sidebar/overlay "cosa fare" sempre accessibile
5. Plurale RAGAZZI/VEDIAMO/PROVATE, mai "tu studente"

## 2. Parallelismo Volumi ↔ Tutor (rivelazione critica 24/4)

### Struttura volumi fisici (evidenza Tresjolie + PDF)

```
VOLUME 1 (14 Capitoli):
  Cap 1: La Storia dell'Elettronica
  Cap 2: Grandezze elettriche + Legge di Ohm
  Cap 3: Cos'è un resistore? (ESPERIMENTO 1, 2, 3)
  Cap 4: Cos'è la breadboard? (ESPERIMENTO 1, 2, 3, 4, 5, 6)
  Cap 5: Batterie (ESPERIMENTO 1, 2, 3, 4, 5)
  Cap 6: Cos'è il diodo LED? (ESPERIMENTO 1, 2, 3)
  Cap 7: Cos'è il LED RGB? (ESPERIMENTO 1, 2, 3, 4, 5, 6, 7, 8, 9)
  Cap 8: Cos'è un pulsante? (ESPERIMENTO 1, 2, 3, 4, 5, 6)
  Cap 9: Cos'è un potenziometro? (...)
  Cap 10-14: [...]

VOLUME 2 (27 esperimenti, numero Capitoli TBD audit Q0)
VOLUME 3 (27 esperimenti, numero Capitoli TBD audit Q0)
```

**Pattern osservato:**
- Ogni Capitolo introduce 1 TEMA (componente/concetto)
- Teoria estesa narrativa (5-8 pagine)
- Esperimenti = VARIAZIONI INCREMENTALI dello stesso tema
- Linguaggio progressivo: "Tutto bellissimo, tante parole, ma ora..."
- Riferimenti incrociati: "Torniamo al LED che abbiamo visto..."

### Struttura tutor attuale

```
94 file JSON lesson-paths INDIPENDENTI
  v1-cap6-esp1.json
  v1-cap6-esp2.json
  v1-cap6-esp3.json
  v1-cap7-esp1.json
  ...

Nessun livello parent "Capitolo"
Picker presenta come CATALOG flat
```

### Gap + impatto

| Aspetto              | Volume fisico                    | Tutor attuale                   | Fix necessario                   |
|---------------------|---------------------------------|--------------------------------|----------------------------------|
| Unità pedagogica    | Capitolo (teoria + N esperimenti) | Esperimento singolo isolato    | Capitolo come aggregato          |
| Navigazione         | Lineare capitoli                | Picker catalog flat             | Picker Capitolo → scroll          |
| Progressione        | Narrativa cross-esperimento      | Nessuna                        | Campo `narrative_from_prev`       |
| Linguaggio          | "Torniamo al LED..."            | "Esperimento caricato"         | Prompt ibrido sa contesto capitolo |
| Percorso studente   | Cap 6 → Cap 7 → Cap 8           | Esperimento ad hoc             | Percorso Capitolo-based          |

## 3. Percorso dinamico generativo (Wiki LLM Karpathy applicato)

### Reference: Karpathy 3-Layer pattern

```
Layer 1 RAW (immutable)    = PDF volumi + Tresjolie + foto kit
Layer 2 WIKI (LLM-owned)   = docs/unlim-wiki/ markdown
Layer 3 SCHEMA (config)    = CLAUDE.md + convenzioni
```

**Principio Karpathy:**
- RAG stateless = ogni query cerca chunk raw
- Wiki LLM stateful = LLM ha distillato raw in concetti riutilizzabili
- Wiki evolve compoundly
- Risposta = sintesi Wiki + LLM knowledge + contesto + query

### Applicazione ELAB Tutor

```
Layer 1 RAW ELAB:
  src/data/rag-chunks-v2.json (1849 chunks volumi)
  CONTENUTI/volumi-pdf/ (PDF master)
  ELAB - TRES JOLIE/ (asset fisici)

Layer 2 WIKI ELAB (Karpathy):
  docs/unlim-wiki/concepts/        ← 25 concepti target (led, resistenza, led-rgb, pulsante, potenziometro, ecc.)
  docs/unlim-wiki/experiments/     ← 92 esperimenti (1 markdown ognuno, citazioni)
  docs/unlim-wiki/lessons/         ← 27 lezioni (Capitoli aggregate)
  docs/unlim-wiki/errors/          ← errori comuni per tema
  docs/unlim-wiki/students/<classId>.md   ← memoria compounding classe (gitignored, Supabase)
  docs/unlim-wiki/teachers/<teacherId>.md ← stile + preferenze docente (gitignored)

Layer 3 SCHEMA ELAB:
  CLAUDE.md (regole immutabili)
  docs/unlim-wiki/SCHEMA.md (convenzioni Wiki)
  docs/handoff/2026-04-24/03-SPECS-PRINCIPIO-ZERO-V4.md (this)
```

### Percorso dinamico: generazione runtime

Quando docente apre tutor e seleziona "Capitolo 6 LED", UNLIM:

1. **Carica contesto**:
   - Live state: esperimento corrente, step, componenti sulla breadboard
   - Memoria classe (`students/<classId>.md`): cosa hanno visto, difficoltà, quiz risultati
   - Memoria docente (`teachers/<teacherId>.md`): stile, tempo lezione, level studenti
   - Wiki L2 concept (`concepts/led.md`): sintesi LLM del tema
   - Raw anchor (RAG v2): citazioni Vol.1 pag.27-34

2. **Genera percorso ad hoc**:
   ```
   Prompt LLM:
     "Docente X, classe 1A (2 esperimenti fatti, 1 quiz al 60%),
      vuole fare Capitolo 6 LED.
      Classe ha già visto breadboard + resistenza + batteria (concepts/breadboard.md, resistenza.md, batteria.md).
      Esperienza precedente: 'rossi non si accendevano' (students/1a.md#errors).
      Genera percorso Capitolo 6 (3 esperimenti) adattato:
        - Esp 1: accendi primo LED (rivedi polarità, risolvi errore passato)
        - Esp 2: variazione con altro colore (estensione)
        - Esp 3: variazione con 2 LED paralleli (avanzato)
      Output: narrative intro + step passo-passo per ciascun esp
              + citazioni Vol.1 pag.27-34
              + sidebar docente 'cosa fare' per ciascuno step
              + quiz finale adattato livello."
   ```

3. **Rendering LIM**:
   - Display centrale: testo narrativo + simulazione (classe legge insieme)
   - Sidebar docente: "Passo 3: aspetta che classe colleghi anodo (+)... se non funziona, chiedi di girare LED"
   - Citazioni Vol.1 pag.27 linkate (cliccabili → apre Volume Viewer a quella pagina)

4. **Dopo lezione**:
   - UNLIM aggiorna `students/<classId>.md` con: esperimenti fatti, errori, intuizioni, suggerimenti prossima volta
   - UNLIM aggiorna `teachers/<teacherId>.md` con: tempo impiegato, feedback, stile preferito
   - Wiki L2 evolve (compounding)

### Vantaggi Karpathy Wiki vs RAG-only

| Aspetto              | RAG stateless       | Wiki LLM stateful             |
|---------------------|--------------------|-------------------------------|
| Memoria cross-sessione | ❌ nessuna         | ✅ classe + docente memorizzati |
| Risposta stile       | Stralcio libro più vicino | Sintesi + LLM knowledge     |
| Linguaggio           | Verbatim volume     | Adattato classe + livello     |
| Progressione         | Nessuna             | "L'ultima volta abbiamo visto..." |
| Cura continuità      | LLM reinventa ogni session | Stabile + compounding     |
| Citazioni            | Possibili (random)  | Precise + intenzionali        |

### Implicazioni tecniche

Serve service:

```ts
// src/services/unlim/percorsoGenerator.ts (NEW)
export async function generatePercorsoCapitolo(params: {
  capitoloId: string;        // "v1-cap6"
  classId: string;
  teacherId: string;
  liveState: CircuitState;
}): Promise<Percorso> {
  // 1. Fetch Wiki L2 concepts + experiments + lessons relevant
  const wikiContext = await wikiRetrieve({
    capitoloId,
    relatedConcepts: true
  });

  // 2. Fetch memoria classe + docente
  const classMemory = await readStudentMarkdown(classId);
  const teacherStyle = await readTeacherMarkdown(teacherId);

  // 3. Fetch raw anchor (RAG v2 chunks con volume+page metadata)
  const anchors = await ragRetriever.search({
    query: `Capitolo ${capitoloId} tutti esperimenti`,
    filters: { volume: extractVolume(capitoloId) },
    topK: 10
  });

  // 4. Build prompt ibrido + call LLM con tool-use
  const prompt = buildPercorsoPrompt({ wiki: wikiContext, memory: { class: classMemory, teacher: teacherStyle }, anchors, liveState });

  // 5. LLM genera Percorso JSON strutturato
  const percorso = await llm.complete({ prompt, responseFormat: 'json', schema: PercorsoSchema });

  // 6. Dopo rendering, LLM scrive update su students/<classId>.md (async)
  return percorso;
}
```

### Schema Percorso

```ts
interface Percorso {
  id: string;                              // "percorso-v1-cap6-1a-2026-04-24"
  capitolo: { id, titolo, volume, pageStart, pageEnd };
  narrative_intro: {
    testo_classe: string;                  // letto alla LIM
    citazioni: Array<{volume, page, quote}>;
  };
  esperimenti: Array<{
    id: string;
    narrative_from_prev: string;           // continuità progressione
    passo_passo: Array<{
      step_num: number;
      testo_classe: string;                // display centrale
      sidebar_docente: string;              // colpo d'occhio
      citazione?: {volume, page, figure?};
    }>;
    quiz?: Array<{domanda, risposte, correct}>;
  }>;
  quiz_finale_capitolo?: Array<{...}>;
  next_capitolo_suggestion?: string;
}
```

## 4. Vincoli immutabili confermati

1. NO dati finti/demo
2. NO emoji come icone (CLAUDE.md #11)
3. Tutti path volumi da Tresjolie = source of truth
4. Citazioni Vol.X pag.Y OBBLIGATORIE per concetti core
5. Plurale RAGAZZI SEMPRE
6. Max 60 parole per bubble UNLIM
7. GDPR EU-only runtime student chat
8. Together AI solo batch/teacher/emergency
9. Test baseline mai regredito
10. Branch + PR workflow (mai main push)

## 5. Roadmap coerente con v3.1

Sprint Q **precede** Sprint 6 Day 39 perché onnipotenza senza struttura Capitolo = amplificatore incoerenza.

Dettaglio in `04-PDR-SPRINT-Q.md`.

---

**Sorgenti ricerca Karpathy Wiki LLM:**
- Karpathy GitHub gist llm-wiki: <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>
- Wiki LLM v2 Gamgee: <https://gamgee.ai/blogs/karpathy-llm-wiki-memory-pattern/>
- Level Up Coding "Beyond RAG": <https://levelup.gitconnected.com/beyond-rag-how-andrej-karpathys-llm-wiki-pattern-builds-knowledge-that-actually-compounds-31a08528665e>
- Agent memory extension: <https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2>
