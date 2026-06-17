# ELAB Master Plan v2 — Comprehensive Strategic Formulation

> **Replaces** `docs/strategy/2026-04-25-saturday-master-formulation.md` (v1).
> v1 missed: volume parallelism analysis, UNLIM synthesis architecture, Mac Mini autonomous work, Tea creative async (NON marketing).
> v2 addresses ALL Andrea call-outs with maximum honesty, zero compiacenza.

**Date**: 2026-04-26 Sunday (post Saturday context update)
**Author**: Andrea Marro via Claude Opus 4.7 1M context
**Skill compliance**: quality-audit + writing-plans + using-superpowers
**Tone**: brutal honesty, no inflation, no flattery

---

## 0. TL;DR (12 line)

1. **CORE thesis Andrea raised**: i volumi presentano ogni Capitolo come **narrativa continua con esperimenti come variazioni progressive sullo stesso tema** — ELAB Tutor finora trattava 94 esperimenti come **card flat indipendenti**. Sprint Q1 schema-side fix delivered (37 Capitoli + narrative_flow + incremental_mode), MA UI wire-up production NOT YET LANDED (PR #36, #37 draft).
2. **Linguaggio call-out**: il system-prompt corrente forza CITAZIONE FEDELE testo libro ("riporta fedele"). Andrea vuole SINTESI con citation come riferimento, non verbatim. Contraddizione interna risolvibile via prompt revision Sprint R1.
3. **DocenteSidebar**: Sprint Q1.D HA implementato `nominalize()` 17 pattern. Verifica su 37 Capitoli pending. Andrea era già stato ascoltato lì — gap = production wire-up.
4. **Citazioni inline Modalità**: schema Q1.A ha `citazioni_volume[{page, quote, context}]` + `figure_refs`. UI Q2 VolumeCitation component esiste. WIRE-UP onclick → VolumeViewer pending.
5. **UNLIM synthesis architecture**: deve combinare (a) LLM knowledge generale (b) RAG ampliato 6549 chunk (c) Wiki LLM 100+ concept (d) memoria classe (e) live state (f) domanda specifica (g) PRINCIPIO ZERO linguaggio. Karpathy Wiki LLM pattern (viral April 2026, 5000+ stars) valida thesis.
6. **Sprint R proposed (R0-R5)**: cycle CoV-Audit-Sprint per onniscenza qualità PRIMA Sprint 6 Day 39 OpenClaw onnipotenza. Pattern 5 agenti paralleli.
7. **Mac Mini Claude Max sub** = autonomous H24 lavoratore VERO. Wiki LLM batch generation, RAG ingest, audit cycles, baseline test continuous.
8. **Tea async creativo NON marketing**: Wiki concept expansion 30→100+ (drafting + review pedagogical), Vol3 bug editoriali fix, brand alignment iconografia, onboarding docs scuole (uso interno NON vendita).
9. **OpenClaw/ClawBot Sprint 6 Day 39 PARKED** until Sprint R complete. Senza onniscenza qualità, onnipotenza dispersa.
10. **Hetzner trial Saturday/Sunday window** = thesis validator GPU final state. €25 cap. Decisional output drives Stage 2a roadmap.
11. **Together AI come fallback safe** (gated per Sprint 5 canUseTogether) = transitional bridge. GDPR plan defensive valid ma scope-creep evitabile post Sprint Q merge.
12. **Vercel Pro upgrade fatto** → bundle OOM resolved → Bundle plan parked Sprint 7. Pro features integration: Analytics + Speed Insights + Cron warmup (replaces Render free).

---

## 1. Critique of v1 formulation (onesta gap admission)

### 1.1 Errori di omissione v1

| Gap | Severity | Cosa missed |
|-----|----------|-------------|
| Volume parallelism analysis | HIGH | Sprint Q ha già risolto schema-side, ma v1 non collegava UI wire-up come PRIMARY work post-merge |
| UNLIM synthesis architecture | HIGH | Wiki LLM + Onniscenza pillars (revenue moat) ignorati in workstream priorities |
| Linguaggio enforcement matrix | MEDIUM | Sprint Q1.D fix esistente non valorizzato; verifica/wire-up pending |
| Mac Mini autonomous con Claude Max sub | HIGH | Trattato come passive infra; in realtà active worker H24 capability |
| Tea creative work nature | MEDIUM | Proposto PNRR marketing; Andrea vuole VERO async creative non commerciale |
| Sprint R cycle proposal | HIGH | Sprint orchestration cycle CoV-Audit-Sprint missing |
| Karpathy Wiki LLM viral April 2026 | MEDIUM | External validation thesis non citata |

### 1.2 Errori di commissione v1

| Errore | Onesta |
|--------|--------|
| GDPR plan execute proposed parità Hetzner trial | GDPR severity dropped post env check (no TOGETHER_API_KEY → de facto Gemini only). Defensive only. |
| Bundle Opt plan execute proposed | Vercel Pro upgrade fatto post v1 → OOM solved, plan parked Sprint 7. |
| PR review prep packets considered | Redundant given Sprint Q comprehensive doc esistente. |
| Mac Mini work proposed as launchd plist physical setup only | Underutilized: Claude Max sub on Mac Mini = autonomous worker H24 capability |

---

## 2. CORE INSIGHT: Volume parallelism digitale↔cartaceo

### 2.1 Andrea's exact statement

> "Gli esperimenti sui volumi non sono proposti come su elabtutor: in uno sono variazioni di uno stesso tema, nell'altro tenti pezzi staccati. Questo influisce sul parallelismo tra i due prodotti e anche sulle modalità passo passo, percorso e libero."

### 2.2 Verification: cosa dicono i volumi REALI

**Volume 1 esempio Cap 6 LED** (verified Sprint Q0 audit `2026-04-24-narrative-progression-analysis.md`):
- Apertura narrativa: "I LED sono come piccole lampadine..."
- ESPERIMENTO 1: accendi 1 LED + resistore 220Ω
- "Ora proviamo con due LED"
- ESPERIMENTO 2: 2 LED in serie (incremental — riusa resistore + aggiunge LED)
- "E se li mettessimo in parallelo?"
- ESPERIMENTO 3: 2 LED in parallelo (modify topology — stesso parts pool)
- "Vogliamo regolare la luminosità?"
- ESPERIMENTO 4: aggiunge potenziometro (incremental)

**ESPERIMENTI = VARIAZIONI PROGRESSIVE STESSO TEMA**, narrative continuity esplicita ("ora proviamo", "e se", "ricordate quando").

### 2.3 Verification: cosa fa ELAB Tutor finora

**State pre-Sprint Q1**:
- `src/data/lesson-paths/v1-cap6-esp1.json` (38 file Vol1)
- `src/data/lesson-paths/v1-cap6-esp2.json`
- `src/data/lesson-paths/v1-cap6-esp3.json`
- ... 94 file totali, ognuno **standalone JSON**
- Catalog flat tipo Khan Academy card → click → load

**No narrative continuity.** Studente clicca esp2, simulator carica fresh circuit, perde memoria di esp1. Docente legge UNLIM intro che riparte da zero. **Spezzato il legame narrativo che il volume cartaceo HA per design.**

### 2.4 Sprint Q1 schema-side fix (già in branch, NON YET MERGED)

Sprint Q1 schema `Capitolo.js` (verified earlier this session) introduce:

```js
const ExperimentBuildModeSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('from_scratch'), intent: BuildIntentSchema }),
  z.object({
    mode: z.literal('incremental_from_prev'),
    incremental_delta: z.object({
      base_experiment_id: z.string(),
      operations: z.array(z.discriminatedUnion('op', [
        z.object({ op: z.literal('add_component'), ... }),
        z.object({ op: z.literal('remove_component'), ... }),
        z.object({ op: z.literal('modify_component'), ... }),
        z.object({ op: z.literal('add_wire'), ... }),
        z.object({ op: z.literal('remove_wire'), ... }),
      ])),
    }),
  }),
]);

const NarrativeFlowSchema = z.object({
  capitolo_intro: z.string(),
  transitions: z.array(z.object({
    from_experiment: z.string(),
    to_experiment: z.string(),
    transition_text: z.string(),  // "Ora proviamo con due LED"
    incremental_mode: z.enum(['from_scratch', 'add', 'remove', 'modify_component']),
  })),
});
```

**Schema = correct.** Encodes EXACTLY what volumi do.

### 2.5 Sprint Q1 migration (already executed, in PR #35 draft)

`scripts/migrate-lesson-paths-to-capiloli.lib.js` migrates 94 lesson-paths → 37 Capitoli:
- Vol1 14 Cap (5 theory + 9 sperimentali)
- Vol2 12 Cap (3 theory + 9 sperimentali/capstone)
- Vol3 9 Cap (4 theory + 5 sperimentali/capstone)

37 file `src/data/capitoli/*.json` con narrative_flow populated dal source (legacy lesson-paths analizzati per inferire transitions).

### 2.6 Sprint Q2 UI implementation (in PR #36 draft)

`PercorsoCapitoloView.jsx` rendering:
- 70% display centrale: capitolo_intro (font 24-32px) → exp1 narrative (font 18px) → transition_text (font 16px italic) → exp2 → ... 
- 25% sidebar destra: DocenteSidebar nominalizzata
- 5% margins/spacing

**Esperimenti as continuous narrative scroll, NOT separated cards.**

### 2.7 Modalità impact

#### Percorso (mode primary)
**Pre-Q**: lista esperimenti card flat. Doc clicca esp → simulator standalone load.
**Post-Q wire-up**: scroll narrative continuo Cap intro → exp1 → transition → exp2 → ... Doc legge ai ragazzi seguendo libro. Simulator si aggiorna **incrementally** quando passa a exp successivo (non clearAll, applica `incremental_delta.operations`).

**Critical UX**: doc deve poter:
- Scroll come legge libro
- Sidebar nominalizzata "colpo d'occhio cosa fare"
- Pulsante "Apri Vol.1 pag.27 fig.6.2" per consultare cartaceo
- Simulator state continua incrementale

#### Passo Passo (build guided mode)
**Pre-Q**: pre-compiled circuit, "next step" highlight component-by-component.
**Post-Q wire-up**: per esperimenti `mode: 'from_scratch'` mantieni passo-passo classic. Per esperimenti `mode: 'incremental_from_prev'` mostra IncrementalBuildHint component (Q2.E delivered): "Partiamo dal circuito di prima. Aggiungiamo un secondo LED qui...".

#### Libero (sandbox)
Pre-Q & post-Q: same. Doc free-form circuit construction. UNLIM watches + suggests.

### 2.8 PRIMARY WORK identified

**PR cascade merge #35→#36→#37** UNBLOCKS volume parallelism fix end-to-end. This is the **single biggest narrative-fidelity unblock** for ELAB.

NO new code needed. Just **review + merge**.

---

## 3. Linguaggio enforcement matrix per component

### 3.1 PRINCIPIO ZERO v3.1 (CLAUDE.md immutabile)

> "UNLIM parla ai RAGAZZI plurale, MAI imperativo al docente. Vol.X pag.Y. Max 60 parole. Testi duali CLASSE display centrale + DOCENTE sidebar colpo d'occhio."

### 3.2 Component-by-component target language

| Componente | Audience | Style esempio CORRETTO | Style esempio SBAGLIATO |
|-----------|----------|------------------------|-------------------------|
| **Display centrale Percorso** | classe (proiettata LIM) | "Ragazzi, prendete il LED rosso e il resistore da 220Ω. Vediamo insieme: il LED è come una piccola lampadina." | "Distribuisci il LED ai ragazzi" (imperativo docente) |
| **DocenteSidebar nominalizzata** | docente colpo d'occhio | "Distribuzione kit. Tempo: 3 min. Errore tipico: polarità invertita → LED non si accende." | "Distribuisci i kit. Controlla che..." (imperativo) |
| **UNLIM chat answer** | classe via docente lettura | "Ragazzi, il LED non si accende perché la polarità è invertita. Provate a girarlo: la zampa lunga (anodo) deve toccare il +." | "Devi girare il LED, hai sbagliato la polarità." (singolare) |
| **Citazione volume** | classe (proiettata) | "Come racconta il nostro libro a pagina 27: «Il LED è un diodo che emette luce quando la corrente lo attraversa nella direzione giusta.»" | "Vedi pag 27" (referenza secca) |
| **Errore tipico (errori_tipici)** | docente sidebar | `{ "problema": "LED non si accende", "soluzione_neutra": "verifica polarità + collegamento serie" }` | `{ "problema": "...", "soluzione": "Dì ai ragazzi di girare il LED" }` (imperativo) |
| **Quiz contestuale** | classe | "Provate: se cambio il resistore da 220Ω a 1kΩ, il LED diventa più forte o più debole?" | "Quale resistore farebbe brillare meno il LED?" (no plurale, no contesto) |

### 3.3 Sprint Q1.D nominalize() function (verified existing)

`scripts/migrate-lesson-paths-to-capitoli.lib.js` ha `nominalize(text)` heuristic con 17 pattern regex:

```js
function nominalize(text) {
  return text
    .replace(/^Distribuisci(?:\s+i)?(?:\s+kit)?/gi, 'Distribuzione$&')
    .replace(/^Togli(?:\s+il)?/gi, 'Rimozione')
    .replace(/^Chiedi/gi, 'Domanda:')
    .replace(/^Mostra/gi, 'Visualizzazione')
    .replace(/^Spiega/gi, 'Spiegazione')
    // ... 12 more
}
```

37 capitoli rigenerati con campi nominalizzati: `step_corrente`, `spunto_per_classe`, `note`, `errori_tipici{problema, soluzione_neutra}`.

### 3.4 GAP identification

**Gap 1**: Pre-existing `system-prompt.ts` BASE_PROMPT contains line:
> "1. CITA il libro ai ragazzi: «Come racconta il nostro libro a pagina X:» e riporta FEDELE il Testo libro (le parole del libro = autorevoli, adattale appena al linguaggio orale ma non parafrasare i concetti)."

**Andrea call-out**: "Non può rispondere con lo stralcio di libro che più si avvicina alla risposta. Deve essere realistica e con il linguaggio giusto."

**Tension**: prompt mandates verbatim citation; Andrea wants synthesis.

**Resolution Sprint R1**: revise BASE_PROMPT line to:
> "1. CITA il libro QUANDO la domanda chiede 'cosa dice il libro' o 'leggi pagina X'. ALTRIMENTI sintetizza in linguaggio adatto a 10-14 anni, integrando: contenuto volume + analogia + memoria classe + stato circuito + sapere generale. Cita in modo SELETTIVO una frase chiave del libro come ancora di autorevolezza, NON come copia integrale."

**Gap 2**: BASE_PROMPT non sa di Capitolo schema (Q1) ne di Wiki concept (Q4) ne di Karpathy LLM Wiki pattern. Sprint Q3 prompt builder ha aggiunto `buildCapitoloPromptFragment()` ma WIRE-UP NOT YET LANDED in production unlim-chat. Sprint R1 deliverable.

**Gap 3**: DocenteSidebar nominalize verified pure-helper test only (Q1.D). Live UI render NOT YET visible (Q2 wire-up pending PR #36 merge). Sprint R2 verification.

---

## 4. UNLIM intelligence design (synthesis architecture)

### 4.1 Andrea's design intent

> "Le risposte date da unlim dipendano dal rag (che dovrebbe essere aumentato o wiki llm), ma anche dalla domanda fatta, dal contesto, da quello che sa l'llm. Non può rispondere con lo stralcio di libro che più si avvicina alla risposta. Deve essere realistica e con il linguaggio giusto."

### 4.2 Karpathy LLM Wiki pattern (viral April 2026, validates thesis)

Per VentureBeat / GitHub Gist Karpathy:
- Pattern shift: dall'ad-hoc RAG-on-raw-docs a **LLM-compiled persistent wiki**
- LLM legge raw data UNA volta → "compila" structured knowledge base markdown
- Genera summaries, identifica concepts, scrive encyclopedia-style articles, **crea backlinks tra concepts**
- Query time: LLM reads compiled wiki (smaller, denser, cross-linked) instead of re-reading raw chunks
- Karpathy stato post: 100 articles, 400k words self-maintained on single research topic

Direct mapping su ELAB:
- Raw data = 3 volumi PDF + ODT + lesson-paths legacy
- Compiled wiki = `docs/unlim-wiki/concepts/*.md` (Sprint Q4 30 concepts) → expand 100+
- Backlinks = `concept-graph` linking esperimenti, prerequisiti, errori comuni
- Query time = UNLIM chat retrieves from compiled wiki + Capitolo schema + memory + live state

**ELAB anticipa Karpathy's pattern** (Sett-4 scaffold + Q4 30 concept) ma incompleto.

### 4.3 UNLIM synthesis stack target

```
┌────────────────────────────────────────────────────────────────────┐
│ User question (docente domanda specifica via voice o text)        │
└────────────────────────────────┬───────────────────────────────────┘
                                 │
            ┌────────────────────┴────────────────────┐
            │ Context collection (parallel, <300ms)   │
            ├──────────────────────────────────────────┤
            │ A. Active Capitolo (Q1 percorsoService)  │
            │ B. Active esperimento (state)            │
            │ C. Live circuit state (simulator-api)    │
            │ D. Wiki concepts (Q4 retriever, semantic)│
            │ E. RAG chunks 549 (current)              │
            │ F. RAG chunks Wiki LLM 6000 (TODO ingest)│
            │ G. Class memory (memoryWriter Q5)        │
            │ H. Teacher memory (memoryWriter Q5)      │
            │ I. Question intent classification        │
            └──────────────────────────────────────────┘
                                 │
            ┌────────────────────▼────────────────────┐
            │ Prompt assembly (capitoloPromptBuilder Q3) │
            ├──────────────────────────────────────────┤
            │ - PRINCIPIO ZERO rules                   │
            │ - Capitolo schema fragment               │
            │ - Wiki concept selected (top-3 semantic) │
            │ - RAG chunk selected (top-3 keyword+vec) │
            │ - Memory: class + teacher                │
            │ - Live state circuit                     │
            │ - Question                               │
            │ - Linguaggio rules (plurale, max 60w)    │
            └──────────────────────────────────────────┘
                                 │
            ┌────────────────────▼────────────────────┐
            │ LLM call (Gemini EU / Qwen self-host)   │
            └────────────────────┬────────────────────┘
                                 │
            ┌────────────────────▼────────────────────┐
            │ Validator middleware (Q3.E principioZero)│
            ├──────────────────────────────────────────┤
            │ - max_words HIGH                         │
            │ - imperativo_docente CRITICAL            │
            │ - singolare_studente HIGH                │
            │ - pii_potential HIGH                     │
            │ - english_filler LOW                     │
            │ - citation Vol/pag presence              │
            └──────────────────────────────────────────┘
                                 │
            ┌────────────────────▼────────────────────┐
            │ Response: synthesis + selective citation │
            │ + optional [AZIONE:...] tags             │
            └──────────────────────────────────────────┘
```

### 4.4 Synthesis prompt revision (Sprint R1 deliverable)

Replace BASE_PROMPT lines 86-99 (current verbatim mandate) with:

```
PRINCIPIO ZERO — REGOLA SUPREMA:
CHIUNQUE apre ELAB Tutor deve essere in grado di spiegare ai ragazzi senza conoscenze pregresse.
Tu (UNLIM) prepari il contenuto in linguaggio 10-14 anni che il docente proietta sulla LIM.

USO DELLE FONTI:
Hai accesso a 4 fonti di sapere:
A. WIKI LLM (concept md compiled): definizioni precise, analogie validate, errori comuni
B. RAG VOLUMI (chunk dei 3 volumi cartacei): testo originale, autorevolezza
C. MEMORIA CLASSE/DOCENTE: livello, esperimenti fatti, errori ricorrenti
D. STATO LIVE: circuito attuale, codice attuale, esperimento attivo

REGOLA SINTESI vs CITAZIONE:
- DEFAULT: SINTETIZZA. Combina A+B+C+D + tuo sapere generale → risposta in linguaggio 10-14 anni.
- CITAZIONE FEDELE quando: la domanda è "cosa dice il libro su X" OPPURE "leggi pagina N" OPPURE durante introduzione concetto cardine in Modalità Percorso.
- Format citazione: «...frase esatta libro...» — Vol.N pag.X
- MAI copia 3+ frasi di seguito dal libro. Citazione = ancora autorevolezza, non sostituto sintesi.

SE DEVI CITARE FONTE:
- Volume cartaceo → «testo» Vol.N pag.X (sempre)
- Wiki concept → "Dal nostro glossario: [concept]" + frase chiave (raro)
- Memoria classe → "Ricordate quando avete provato [esperimento]?" (medio)
- Sapere generale → nessuna fonte esplicita (default)
```

### 4.5 RAG ampliamento

| Layer | Pre-Sprint-R | Post-Sprint-R3 target |
|-------|-------------|------------------------|
| RAG chunk volumi | 549 | 549 |
| Wiki LLM concept compiled | 30 (Sprint Q4) | 100+ |
| RAG Wiki LLM full corpus (Karpathy pattern) | 0 | 6000 (Together batch ingest $0.07 one-time) |
| Embeddings | keyword Sett-4 | BGE-M3 semantic (post Hetzner trial validation) |
| Concept-graph backlinks | partial | full |

---

## 5. Modalità citazioni inline (UI wire-up)

### 5.1 Sprint Q1.A schema fields available

```js
const TheorySchema = z.object({
  testo_classe: z.string(),
  citazioni_volume: z.array(z.object({
    page: z.number(),
    quote: z.string(),
    context: z.string().optional(),
  })),
  figure_refs: z.array(z.object({
    page: z.number(),
    figure_id: z.string(),  // "fig.6.2"
    caption: z.string(),
  })),
  analogies_classe: z.array(z.string()),
});
```

### 5.2 Sprint Q2 VolumeCitation component (delivered, in PR #36 draft)

```jsx
<VolumeCitation
  volume={1}
  page={27}
  quote="Il LED è un diodo che emette luce..."
  onCitationClick={(vol, page) => openVolumeViewer(vol, page)}
/>
```

Renders:
```
"Il LED è un diodo che emette luce..." 📖 Vol.1 pag.27
                                    [click → opens VolumeViewer]
```

### 5.3 Wire-up needed (Sprint R2)

**LavagnaShell** integrate:
1. Replace `PercorsoPanel` with `PercorsoCapitoloView` (Q2.D)
2. CapitoloPicker `<Capitoli>` button in AppHeader
3. VolumeCitation onCitationClick → lazy-load VolumeViewer + jumpToPage(volume, page)
4. DocenteSidebar reactive to scroll/click events
5. IncrementalBuildHint render when `experiment.build_circuit.mode === 'incremental_from_prev'`

**File modifications**: `src/components/lavagna/LavagnaShell.jsx`, `AppHeader.jsx`. Per `docs/pdr/PDR-INTEGRATION.md` step 2 (~6h).

### 5.4 Behavior target end-to-end

User flow:
1. Docente apre ELAB Tutor → tab Lavagna
2. Click "Capitoli" → CapitoloPicker overlay (Vol1/2/3 tabs, grid auto-fill)
3. Click "Cap 6 LED" → PercorsoCapitoloView mounts
4. Display centrale 70% scroll: intro Cap → exp1 narrative + simulator load → transition_text → exp2 + simulator delta → ...
5. Sidebar 25% sticky: nominalize step_corrente + spunto_per_classe + note + errori_tipici
6. Inline citazioni: "...«Il LED è un diodo che emette luce» Vol.1 pag.27 fig.6.2 📖[click]..."
7. Click 📖 → VolumeViewer side-panel opens at Vol.1 pag.27, fig.6.2 highlighted
8. Doc reads aloud → ragazzi vedono LIM + libro fisico aperto sulla cattedra
9. Quando exp2 attivo, simulator NON clearAll: applica `incremental_delta.operations` (add component nuovo, mantieni esistenti)

**Risultato**: parallelismo digitale↔cartaceo COMPLETO. Lo schermo è il libro che si apre interattivo.

---

## 6. Sprint R cycle (R0-R5)

**Goal Sprint R**: rendere UNLIM intelligence + citazioni modalità + memoria + ordine production-quality PRIMA Sprint 6 Day 39 OpenClaw onnipotenza.

**Why**: senza onniscenza qualità + linguaggio corretto + parallelismo digitale↔cartaceo, OpenClaw 80 tool dispatcher costruisce su fondazione fragile. Risultato = onnipotenza dispersa, dove l'AI può fare 80 azioni ma di qualità mediocre.

**Pattern**: 5 agenti paralleli per sprint, CoV 3x al gate, audit doc consolidato.

### 6.1 Sprint R0 — Audit UNLIM responses baseline

**Branch**: `audit/sprint-r0-unlim-baseline-2026-04-26`

**Goal**: misurare BASELINE corrente UNLIM response quality su 10 prompt fixture.

**Tasks**:
1. Build fixture `scripts/bench/workloads/unlim-quality-fixtures.jsonl` (10 prompt reali docente: introduce-cap, spiega-componente, debug-circuito, verifica-comprensione, etc.)
2. Run UNLIM live (production endpoint) su 10 prompts, capture responses
3. Score ogni response su 5 axes:
   - **Synthesis vs Verbatim**: % parole copiate da libro (target <30%)
   - **Linguaggio plurale**: presenza "Ragazzi/Vediamo/Provate" (target 100%)
   - **Citazione Vol/pag**: presenza quando rilevante (target 80% concept-introduction prompts)
   - **Max parole**: rispetto 60 word cap (target 100%)
   - **Linguaggio età 10-14**: niente termini universitari (target 95%)
4. Write `docs/audits/2026-04-26-sprint-r0-unlim-baseline.md` con scores numerici.

**Agenti**:
- generator-test-sonnet → fixture
- evaluator-haiku → scoring rubric + execution
- scribe-sonnet → audit doc

**CoV**: 3x re-run scoring per consistency.

**Deliverable**: baseline score numerico (esempio aspettato: 5.5/10 sintesi, 7/10 linguaggio plurale, 4/10 citazioni).

### 6.2 Sprint R1 — Synthesis architecture wire-up

**Branch**: `feat/sprint-r1-unlim-synthesis-2026-04-XX`

**Goal**: production wire-up `capitoloPromptBuilder` + `principioZeroValidator` + revised BASE_PROMPT into `unlim-chat/index.ts`.

**Pre-requisite**: PR #37 (Q3 Edge Function infra) MERGED.

**Tasks**:
1. Modify `supabase/functions/_shared/system-prompt.ts` BASE_PROMPT per section 4.4 above (revised PRINCIPIO ZERO + USO DELLE FONTI rules)
2. Wire `getCapitoloByExperimentId` + `buildCapitoloPromptFragment` in `unlim-chat/index.ts`
3. Wire `validatePrincipioZero` post-LLM response, before return
4. Add CRITICAL violations log to Supabase audit table
5. Run R0 fixture suite again → measure delta
6. CoV 3x

**Deliverable**: scores delta R0→R1 esempio target: sintesi +1.5, citazioni +2.0, linguaggio +0.5.

**Agenti** Pattern B (5 paralleli):
- generator-app-sonnet#1 → system-prompt revision
- generator-app-sonnet#2 → unlim-chat wire-up
- generator-test-sonnet → integration tests
- evaluator-haiku → R0 fixture re-run + scoring
- scribe-sonnet → audit doc + commit narratives

### 6.3 Sprint R2 — Modalità citazioni inline UI wire-up

**Branch**: `feat/sprint-r2-modalita-citazioni-inline-2026-04-XX`

**Goal**: production wire-up Q2 components (PercorsoCapitoloView + VolumeCitation + DocenteSidebar + CapitoloPicker + IncrementalBuildHint) in LavagnaShell.

**Pre-requisite**: PR #36 (Q2 UI) MERGED.

**Tasks**:
1. Modify `src/components/lavagna/LavagnaShell.jsx` per PDR-INTEGRATION step 2
2. Add CapitoloPicker trigger in AppHeader
3. Wire VolumeCitation onCitationClick → VolumeViewer.jumpToPage(vol, page)
4. Wire DocenteSidebar reactive (scroll-position + click-to-jump)
5. Wire IncrementalBuildHint when `mode === 'incremental_from_prev'`
6. Browser preview verification (npm run dev): open Cap 6, scroll exp1→exp2, click VolumeCitation, verify VolumeViewer opens correct page
7. Playwright e2e spec `tests/e2e/11-modalita-citazioni-inline.spec.js`
8. CoV 3x

**Deliverable**: end-to-end visual demo of modalità Percorso con narrative continua + citazioni inline + DocenteSidebar nominalizzata + simulator incremental.

### 6.4 Sprint R3 — Wiki LLM expansion 30→100 + RAG full corpus

**Branch**: `feat/sprint-r3-wiki-llm-expansion-2026-04-XX`

**Goal**: expand Wiki LLM concepts da 30 (Q4) a 100+ (Karpathy pattern compounding).

**Pre-requisite**: PR #38 (Q4 wiki) MERGED.

**Tasks**:
1. **Tea async**: write 30 NEW concepts md per Q4 schema (concepts ELETTRONICA-base) — pedagogical accuracy, linguaggio bambino, citation volume, errori comuni
2. **Mac Mini autonomous loop**: generate 40+ concepts via Claude Code agent loop (wiki-llm-builder skill) — pre-Sprint-R3 prep work, parallel
3. **Hetzner trial B2 BGE-M3 semantic embeddings**: index all 100+ concepts + 549 RAG chunks via BGE-M3
4. **Together batch ingest** (one-time $0.07): generate 6000-chunk Wiki LLM full corpus from PDF source (parallel ingestion)
5. Modify Wiki retriever Sett-4 from keyword → semantic BGE-M3 hybrid (Sprint 7 candidate, R3 may defer)
6. CoV 3x: precision@3 vs keyword baseline

**Deliverable**: 100+ Wiki concepts compiled, semantic retriever active.

### 6.5 Sprint R4 — Memory compounding wire-up

**Branch**: `feat/sprint-r4-memory-compounding-2026-04-XX`

**Goal**: production wire-up `memoryWriter` (Q5) into `unlimMemory`. Cross-session compounding visible to UNLIM.

**Pre-requisite**: PR #39 (Q5 memory) MERGED.

**Tasks**:
1. Modify `src/services/unlimMemory.js`: invocare `buildStudentMemory` + `buildTeacherMemory` post session save
2. Upload generated markdown to Supabase storage (`students/{classId}.md`, `teachers/{teacherId}.md`)
3. Modify `loadStudentContext` in `_shared/memory.ts` Edge Function: fetch compounding markdown if available
4. Add ChatRequest field `useCompoundingMemory: boolean` (default true)
5. UI sidebar flag "Memoria attiva: ultime N sessioni"
6. CoV 3x: verify session N+1 references session N events

**Deliverable**: cross-session continuity. Session 5 UNLIM cita "Ricordate quando avete provato il LED rosso 3 lezioni fa?" with actual reference.

### 6.6 Sprint R5 — CoV stress audit

**Branch**: `audit/sprint-r5-stress-50-prompt-2026-04-XX`

**Goal**: stress test 50 prompt reali + verify passing rate >= 85% sintesi qualità.

**Tasks**:
1. Build extended fixture `scripts/bench/workloads/unlim-stress-50-fixtures.jsonl` (50 prompt diverse: introduce, debug, verify, deep-question, off-topic)
2. Run UNLIM live (post R1+R2+R3+R4 wire-up) on 50 prompts
3. Score per R0 rubric (5 axes)
4. Decision gate:
   - IF >= 85% pass → onniscenza GO. Sprint 6 Day 39 OpenClaw cleared.
   - IF < 85% → identify lowest-scoring axis, plan R5.5 targeted fix
5. CoV 3x: consistency score across runs <5% variance
6. Audit doc `docs/audits/2026-04-XX-sprint-r5-stress-final.md`

**Deliverable**: PASS/FAIL gate per Sprint 6 Day 39.

### 6.7 Sprint R timeline estimate

| Sprint | Effort | Gating |
|--------|--------|--------|
| R0 | 4-6h | once Andrea OK Sprint Q PR merge |
| R1 | 6-10h | post PR #37 merge |
| R2 | 6-8h | post PR #36 merge |
| R3 | 8-12h (Tea + Mac Mini parallel reduces wall clock) | post PR #38 merge |
| R4 | 4-6h | post PR #39 merge |
| R5 | 4-6h | depends on R1+R2+R4 (NOT R3) |
| **TOTAL Sprint R** | ~4-6 days wall clock w/ parallel work | ~32-48h human time |

**Parallel reductions via Mac Mini autonomous + Tea async**: 32-48h could collapse to 2-3 days wall-clock if orchestrated well.

**Honesty correction (audit gap #5)**: R5 stress test does NOT depend on R3 (Wiki expansion). R5 measures synthesis quality on existing 30 concepts + 549 RAG chunks. Wiki 30→100 expansion is INDEPENDENT improvement, can lag R5 gate without blocking Sprint 6 Day 39 OpenClaw start. R5 prerequisites: R1 (synthesis prompt) + R2 (citation UI) + R4 (memory wire-up) only.

---

## 7. Workstream allocation

### 7.1 MacBook (Andrea + Claude session live)

**Primary role**: review + merge + integration coordination + decision gates.

**Saturday immediate (today + tomorrow)**:
1. Vercel Pro Analytics + Speed Insights setup (30min)
2. Sprint Q PR cascade review #34→#41 (2-4h spread)
3. Hetzner trial Saturday block (4-6h primary)
4. Mac Mini autonomous loop start (1-2h, physical access)
5. Tea brief docs delivery (30min)

**Sprint R execution**:
- Pattern B 5 agenti paralleli on MacBook for code changes
- CoV 3x at each sprint gate
- Manual browser preview verification each UI change
- Production deploy gate (only after Andrea explicit OK + smoke 24h)

**What MacBook should NOT do**:
- Wiki concept drafting (Tea + Mac Mini)
- Continuous benchmark daily run (Mac Mini cron)
- RAG ingestion batch (Mac Mini or Hetzner)
- Long inference benchmarks (Hetzner)
- Plan inflation (avoid writing more plans without execution)

### 7.2 Mac Mini (Strambino, Claude Max sub, autonomous H24)

**Andrea critical clarification**: Mac Mini ha proprio Claude Max sub. Claude Code agents run autonomous H24.

**KILLER USE CASE 1**: Wiki LLM concept expansion 30→100+
- `wiki-llm-builder` skill (CREATE if not exists) drives autonomous concept generation
- Per night: agent picks next gap concept, drafts md per Q4 SCHEMA, commits to branch
- Telegram approval gate every N concepts: Andrea reviews + merges
- **Output**: 60-80 concepts in 2 settimane senza Andrea time

**KILLER USE CASE 2**: Continuous benchmark daily
- Cron 03:00 ogni notte: `node scripts/benchmark.cjs --write`
- Drift detection: if score drops vs baseline, Telegram alert
- **Output**: never-regression confidence

**KILLER USE CASE 3**: RAG ingestion + maintenance
- Re-index `src/data/rag-chunks.json` quando volumes update
- Embed new chunks via local BGE-M3 (post Hetzner B2 validation, install BGE-M3 on Mac Mini if Apple Silicon supports)
- Update Supabase pgvector incrementally

**KILLER USE CASE 4**: Brain V13 self-host (ELIMINATE Hostinger VPS €€/mese)
- Ollama + galileo-brain-v13 (Qwen 2.5 3B Q5_K_M ~2.5GB)
- Tunnel via Tailscale + Cloudflare Tunnel + auth header
- Supabase env `VPS_OLLAMA_URL` → `https://mac-mini-tunnel.elabtutor.school`

**KILLER USE CASE 5**: Self-hosted GitHub Actions runner
- Vitest CI 3-5x faster
- Workflow matrix: heavy job → self-hosted, fallback → ubuntu-latest

**KILLER USE CASE 6**: Audit autonomi periodici
- Weekly: scan `automa/state/` for drift
- Weekly: lint Sprint Q wire-up status
- Weekly: Wiki concept gap analysis

**KILLER USE CASE 7**: Sprint R agent orchestration
- Sprint R1-R4 implementation can RUN ON MAC MINI overnight via Pattern B 5 agenti
- Andrea wakes up to PR draft ready for review
- **Output**: throughput 3-5x

### Mac Mini setup tasks (concrete)

**Day 1 Andrea fisicamente su Mac Mini**:
1. SSH config + Tailscale install (15min)
2. Ollama install + Qwen 2.5 3B Q5_K_M pull (15min)
3. galileo-brain-v13 Modelfile import (10min)
4. Cloudflare Tunnel public endpoint + auth (30min)
5. Update Supabase env `VPS_OLLAMA_URL` (5min)
6. Smoke test brain endpoint via Edge Function (10min)
7. launchctl plist persistent loop-forever.sh (15min)
8. Claude Code installation + sub login (10min)
9. Clone repo + checkout main (5min)
10. First autonomous loop dry-run (15min)

Total: ~2.5h Andrea physical time once on Mac Mini.

**Day 2-7 Mac Mini autonomous**:
- Self-running, Telegram approval gates for risky operations (deploys, deletes, key rotations)
- Andrea reviews PR draft created by Mac Mini
- Continuous Wiki concept generation, benchmark, audit

### 7.3 Tea (async creative VERO, NON marketing)

**Andrea explicit**: "NON LAVORIAMO SU PNRR ECC... DIAMO LAVORO VERO E ASINCRONO A TEA, CREATIVO E SODDISFACENTE."

**Profile recall (CLAUDE.md)**: pedagogical writer, kit content expert, Italian language native.

**Lavoro creativo VERO assignments (priority order)**:

#### T1 — Wiki LLM concept drafting (HIGH creative + pedagogical)
**Brief**: drafting 30-60 nuovi concept md per Wiki LLM expansion 30→100+ (Sprint R3).

**Per ogni concept**:
- Definizione precisa per età 10-14 ("Ragazzi, il LED è...")
- Analogia plurale ("è come una piccola lampadina")
- Parametri tipici (tensione, corrente, valori comuni)
- Citation Vol.X pag.Y where defined
- Errori comuni (3-5 con problema + soluzione_neutra)
- Domande tipiche studenti possono fare ("perché si brucia?")
- PRINCIPIO ZERO section esplicita
- Esperimenti correlati linkati

**Output**: 30-60 file md in `docs/unlim-wiki/concepts/`, NEW branch `tea/wiki-concepts-batch-N-2026-04-XX`.

**Effort**: ~30min per concept × 30-60 = 15-30h spread over 2-3 settimane.

**Why creative**: Tea ha autorialità pedagogica reale. Questo è il SUO mestiere.

#### T2 — Vol3 bug editoriali fix (LOW effort, bigger picture)
**Brief**: fix 4 bugs flagged Sprint Q0:
- Vol3 PDF V0.8.1 phantom Cap 10-12 (rimuovi)
- Vol3 ESERCIZIO 6.4 duplicate (line 2113 + 2176)
- Vol3 ESERCIZIO 7.8 marker mancante
- Vol2 PDF Cap 8 ESPERIMENTO 2 duplicate

**Output**: corrected ODT/PDF + change log.

**Effort**: 1-2h.

#### T3 — Volumi narrative quality audit (creative + pedagogical)
**Brief**: review whether ALL 22 esperimenti capitoli mantengono narrative continuity.

Per Cap analyzed:
- Transitions natural? ("Ora proviamo", "E se", "Ricordate")
- Incremental build logical? (ogni esp aggiunge UN concept nuovo)
- Conclusion narrative chiusa?

**Output**: report `docs/audits/2026-04-XX-tea-volumi-narrative-quality.md` con flag su Cap problematici + suggerimenti.

**Effort**: 4-6h.

**Why creative**: Tea può proporre narrative improvements che entrano in volume v0.9.

#### T4 — Brand + iconografia + assets TRES JOLIE prep (creative non marketing)
**Brief**: NON marketing materials. Internal design consistency:
- Audit current ELAB Tutor iconografia (ElabIcons.jsx) vs volumes physical
- Propose icon set extensions for Capitolo Picker grid
- Curate TRES JOLIE 1.5GB asset folder per future import:
  - Categorize by Cap
  - Recommend top 5-10 images per Cap to import
  - Format: WebP optimized, lazy-loaded

**Output**: `docs/design/tea-iconografia-audit-2026-04.md` + asset selection list.

**Effort**: 4-6h.

#### T5 — Onboarding internal docs scuole (NOT marketing)
**Brief**: doc per scuole CHE GIà USANO ELAB (no sales). Es:
- "Come gestire 5 gruppi in classe con UNLIM"
- "Cosa fare quando un kit ha pezzo rotto"
- "Tips primo giorno classe nuova"

**Output**: 3-5 brief markdown in `docs/scuole-onboarding/` per Tea decide topics.

**Effort**: 4-6h.

**Tea total ask**: 25-50h spread over 2-3 settimane. Async, no blocking dependencies.

### 7.4 Lavoro NON allocato (cosa NON si fa ora)

| Task | Why deferred |
|------|--------------|
| GDPR plan execute (block-Together student) | Severity dropped: TOGETHER_API_KEY missing → de facto Gemini only. Defensive only. Sprint R post-merge. |
| Bundle optimization execute | Vercel Pro upgrade resolves OOM. Sprint 7 polish. |
| Render Pro upgrade | Mac Mini Brain self-host eliminates Render need entirely. Deprecate, don't upgrade. |
| OpenClaw Sprint 6 Day 39 dispatcher | PARKED until Sprint R cleared. Senza onniscenza qualità, dispatcher onnipotente disperso. |
| Mac Mini GitHub runner Livello 4 | Day +5+ post Sprint R. Not Saturday. |
| Hetzner GEX44 mensile €187 | Premature. Trial €25 first. Decision per matrix Section 6.2 GPU framework. |

---

## 8. Web research findings

### 8.1 Karpathy LLM Wiki (April 2026 viral)

**Sources verified via WebSearch 2026-04-26**:
- GitHub Gist 5000+ stars
- VentureBeat coverage: "bypasses RAG with evolving markdown library maintained by AI"
- Medium articles confirm pattern: LLM compiles markdown wiki ONCE, queries against compiled artifact instead of raw chunks
- Karpathy stato post: 100 articles, 400k words self-maintained on single research topic

**Direct mapping to ELAB**:
- Wiki LLM 30 concepts (Q4) → 100+ → 6000 (full corpus) follows same pattern
- Compiled markdown = `docs/unlim-wiki/concepts/*.md`
- Query time = retriever fetches compiled, NOT raw PDF chunks
- Cross-linking via `concept-graph` matches Karpathy's "backlinks between related ideas"

**Validation**: ELAB anticipated Karpathy's pattern (Sett-4 + Q4) but execution incomplete. Sprint R3 closes gap.

### 8.2 Khanmigo architecture (competitive landscape)

**Sources verified**: Khan Academy + Harvard Business School case + LearningMate podcast.

**Khanmigo architecture**:
- ChatGPT (GPT-4) + Khan Academy curated course repo as RAG source
- Personalized tutor + assistant (dual mode learner/teacher)
- Socratic method emphasis (guides not gives)
- No public info on synthesis vs verbatim balance — opaque
- US-only data flow (privacy concern for EU schools)

**ELAB advantage vs Khanmigo**:
- EU-native (GDPR clean by design once GPU VPS lands)
- Volume-specific (3 volumi cartacei + kit fisici Omaric integrated)
- PRINCIPIO ZERO v3.1 (linguaggio plurale classe, NOT 1:1 student chat)
- Wiki LLM Karpathy pattern (compiled vs raw RAG)
- Open architecture (incremental build, narrative continuity)

**ELAB disadvantage vs Khanmigo**:
- 0 paying schools today vs Khanmigo 1M+ students
- Brand recognition gap
- No mobile app native (PWA only)

**Honesta**: ELAB defensible only via filiera (volumi + kit + Davide MePA + Giovanni Arduino + Andrea solo dev) + EU-native moat. Pure tech competition lost.

---

## 9. OpenClaw / ClawBot defer rationale

### 9.1 Sprint 6 Day 37-38 already delivered (per CLAUDE.md context)

- Tools registry 52 → 80
- 9 handler stubs (3 event-only TODO Sprint 6 Day 37-38 done)
- pz-v3-validator IT primary + EN/ES/FR/DE stub
- tool-memory pgvector schema Supabase migration ready
- state-snapshot-aggregator Promise.all 5-source pattern
- together-teacher-mode gate Sprint 5

### 9.2 Sprint 6 Day 39 dispatcher = ONNIPOTENZA gateway

Per `docs/superpowers/plans/2026-04-23-openclaw-sprint6-l1-live.md`:
- Runtime tool dispatch resolving dot-path against window.__ELAB_API
- PZ v3 pairing soft-enforce
- Composite L1 morphic generator
- Production behind feature flag VITE_OPENCLAW_ENABLED

### 9.3 Why DEFER until Sprint R complete

**Critical insight Andrea raised**:
> "Sprint COV-AUDIT-SPRINT cycle PRIMA Sprint 6 Day 39"
> "Sprint 6 dispatcher OpenClaw richiede onniscenza qualità"
> "Senza Wiki LLM ampliato + UNLIM sintesi + citazioni inline → onnipotenza dispersa"

**Esempio concreto**: tool `unlim.speakTTS(text, opts)` può eseguire ma se text che UNLIM genera è verbatim libro o singolare studente, l'onnipotenza è qualità mediocre.

OpenClaw 80 tool su onniscenza fragile = AI può fare tante azioni, ma di poco valore.

**Decisione operativa onesta**: completare Sprint R0-R5 (qualità), POI Sprint 6 Day 39 (potenza). Pattern: foundations first.

### 9.4 Sprint 6 Day 39 timeline updated

| Pre-revision | Post-revision |
|--------------|---------------|
| Day 39 immediate post Sprint Q merge | Day 39 post Sprint R5 PASS gate |
| Estimated 5-6 days | Estimated 5-6 days (unchanged, but slips ~7-10 days) |
| ~2026-05-02 start | ~2026-05-12 start |

---

## 10. Hetzner trial scope (parallel non-blocking)

### 10.1 Saturday/Sunday window

Saturday 2026-04-25 ALREADY in window.
Sunday 2026-04-26 also in window.

Trial scope per `docs/business/gpu-vps-decision-framework.md`:
- Provider Saturday trial: **Scaleway L4 FR ONLY** (EU GDPR-clean, hourly billing €0.85/h, ~€3.40 for 4h)
- Budget cap €25 = ~28h compute time on Scaleway
- Realistic test: 4-6h Andrea active

**Honesty correction (audit gap #11)**: Hetzner GEX44 (€187 mensile) NON disponibile per trial weekend — solo subscription mensile. Riservato a post-decision Stage 2a (1+ paying school). Vast.ai RTX 4090 ($0.30/h) cheaper alternative ma US-skewed → friction not worth €3 saved per trial.

### 10.2 Benchmarks (per master formulation v1 Hetzner section)

B1 Qwen 7B chat latency vs Gemini Flash (1h) — decision criterion
B2 BGE-M3 embeddings vs keyword retriever Sett-4 (30min) — decision criterion
B3 Voxtral 4B TTS quality vs Edge TTS (30min) — decision criterion
B4 Qwen 14B latency stretch (30min) — soft criterion
B5 Wiki LLM L2 dynamic generation prototype (1h) — Karpathy thesis confirmation

### 10.3 Decision matrix output → drives Sprint R3 + Sprint 7

- IF B1 + B2 PASS → Sprint R3 BGE-M3 wire-up confirmed, Sprint 7 GPU mensile candidate
- IF B5 PASS → Karpathy L2 runtime generation roadmap Sprint 7+
- IF FAIL → cloud-only, GDPR plan EXEC priority increases

### 10.4 NON-BLOCKING per Sprint R0-R2

Hetzner trial is INDEPENDENT of Sprint R0-R2 (which are software changes, not infra).

Andrea can run Hetzner Saturday afternoon while Sprint R0 fixture writing happens MacBook side.

---

## 11. Anti-patterns (rivisited)

### 11.1 v1 anti-patterns still valid

1. Plan inflation > esecuzione
2. Score auto-claim >7 senza CoV (G45 audit lesson)
3. Bundle opt execute oggi (Vercel Pro solved)
4. Render upgrade (Mac Mini Brain self-host eliminates)
5. Hetzner GEX44 mensile pre-1st-paying-school

### 11.2 New anti-patterns identified v2

6. **Skip Sprint R, jump to Sprint 6 Day 39 OpenClaw**: tempting because OpenClaw is "more impressive" feature, but builds fragile foundation. Andrea call-out caught this.
7. **Marketing PNRR Tea work**: not Tea's strength, not creative satisfaction, not Andrea's value. Andrea explicit refused.
8. **Mac Mini as passive infra**: misses Claude Max sub autonomous worker H24. Underutilization of paid resource.
9. **Verbatim citation default in UNLIM**: pre-existing prompt mandates "fedele" citation. Andrea wants synthesis. Sprint R1 fixes.
10. **Treat 94 lesson-paths as catalog flat**: pre-Q1 schema state. Sprint Q1 schema-side fixed, but UI wire-up MISSING is the bottleneck. Sprint R2 fixes.
11. **GDPR plan execute as critical**: env check showed not active. Plan defensive valid but lower priority. Don't burn Saturday on it.
12. **Together AI active without code-level gate**: if/when TOGETHER_API_KEY added in Supabase env, code MUST already have gate. Sprint R defensive deliverable.

---

## 12. Execution sequence (concrete, ordered)

### 12.1 Saturday 2026-04-25 (today, ~10h Andrea)

**Block S1 (0-30min): Vercel Pro instant**
- Analytics setup (15min)
- Speed Insights setup (15min)

**Block S2 (30-90min): Tea brief delivery**
- Email Tea: T1+T2+T3+T4+T5 briefs above (60min compose + send)

**Block S3 (90min-180min): Mac Mini physical setup**
- 10 setup steps Section 7.2 (~2h)

**Block S4 (180min-360min): Hetzner trial PRIMARY**
- Provision Scaleway L4 FR
- Stack docker-compose deploy
- Run B1+B2+B3 benchmarks
- Document results + decision per matrix

**Block S5 (Saturday evening 30min-60min): Sprint Q PR review prep**
- Read Sprint Q comprehensive doc again (refresh)
- Identify squash merge order #34→#41
- Set tomorrow plan

**Block S6 (Saturday end 30min): consolidate + commit**
- Audit doc Hetzner trial
- Tomorrow plan: Sprint Q PR cascade merge

### 12.2 Sunday 2026-04-26 (~6-8h Andrea)

**Block U1 (0-3h): Sprint Q PR cascade merge**
- Andrea reviews each PR via GitHub UI
- Squash merge sequential (rebase chain)
- After each merge: Vercel auto-deploy preview, smoke test
- Final merge #41 docs

**Block U2 (3-5h): Sprint R0 audit fixture build**
- Pattern B 5 agenti paralleli on MacBook
- generator-test fixture, evaluator scoring, scribe audit
- Run UNLIM live on 10 prompts
- Audit doc baseline

**Block U3 (5-7h): Mac Mini autonomous loop start**
- launchctl persistent verify
- First Claude Code agent dispatch (Wiki concept drafting kickoff)
- Telegram approval gate setup

**Block U4 (Sunday end): consolidate + plan Monday**

### 12.3 Monday 2026-04-27 onwards

**Sprint R1 wire-up Edge Function** (post #37 merge): 6-10h spread Mon-Wed.
**Sprint R2 wire-up UI Lavagna** (post #36 merge): 6-8h spread Wed-Thu.
**Sprint R3 Wiki expansion**: 8-12h spread (Tea + Mac Mini parallel) week 1.
**Sprint R4 memory wire-up** (post #39 merge): 4-6h Thu-Fri.
**Sprint R5 stress audit**: 4-6h Fri-Sat next week.

**Cumulative Sprint R**: 1-2 weeks wall clock with parallel orchestration.

### 12.4 Sprint 6 Day 39 OpenClaw

Post Sprint R5 PASS gate: ~2026-05-12 start.

---

## 13. Decision criteria

### 13.1 Hetzner trial (per master formulation v1 retained)

Hard-pass: Qwen 7B p95 < 1500ms + IT quality acceptable + ops < 2h
Soft: Qwen 14B + BGE-M3 win + Voxtral natural

### 13.2 Sprint R5 stress test gate

PASS rate >= 85% across 5 axes (synthesis, plurale, citation, max words, age-appropriate language) → Sprint 6 Day 39 GO.

PASS rate < 85% → identify lowest axis, plan R5.5 targeted fix, retry.

### 13.3 Mac Mini Brain self-host migration

PASS criteria:
- Local Qwen 2.5 3B Q5_K_M latency vs Hostinger VPS comparable (within 30%)
- Cloudflare Tunnel uptime 99% over 7 days
- Supabase Edge Function brain fallback verified

PASS → Hostinger VPS deprecate, save €/mese.

### 13.4 GDPR plan execute trigger

Trigger:
- Supabase env `TOGETHER_API_KEY` ADDED → defensive gate becomes urgent
- Sprint Q PR #37 MERGED → no conflict path

If both true → execute GDPR plan as separate PR Sprint R+1.
If neither → defer indefinitely (moot via GPU VPS final state).

---

## 14. Risk register updated

| Rischio | Prob | Impatto | Mitigazione |
|---------|------|---------|-------------|
| Sprint Q merge conflict cascade | LOW | MEDIUM | rebase incrementale, CI catches |
| Hetzner trial inconclusive | MEDIUM | MEDIUM | decision tree explicit, multiple criteria |
| Mac Mini Brain self-host tunnel complexity | MEDIUM | LOW | Cloudflare Tunnel +auth header standard pattern |
| Tea Wiki concepts pedagogical drift | LOW | MEDIUM | Q4 SCHEMA enforces structure, periodic review |
| Mac Mini autonomous loop runaway | LOW | HIGH | Telegram approval gates for risky ops, dry-run first |
| Sprint R blocking Sprint 6 timeline | MEDIUM | MEDIUM | accept slip, prioritize quality over speed (Andrea explicit) |
| Vercel Pro Frankfurt EU not configured | LOW | LOW | verify region in Vercel project settings |
| Together AI accidentally activated student | LOW | HIGH | code-level gate (GDPR plan) MUST land before TOGETHER_API_KEY env add |
| Andrea overload Saturday 10h+ | MEDIUM | HIGH | aggressive prioritization, drop Block S5/S6 if running late |
| Wiki LLM L2 generation prototype fails | MEDIUM | LOW | static Wiki concept md still works as fallback |

---

## 15. Ultima onestà

### 15.1 Cosa questo documento NON risolve

- **Vendite/revenue**: 0 paying schools today. Deadline PNRR 30/06/2026. Documento è product-focused, not commercial. Davide owns sales.
- **Brand recognition**: ELAB unknown. Marketing not Tea's job per Andrea. Open question how brand grows.
- **Burnout risk**: Andrea solo dev. Sprint R adds 1-2 weeks before OpenClaw. No mitigation here beyond aggressive scoping.
- **Funding/cashflow**: GPU VPS thesis requires investment when paying. No revenue plan until 1st school.

### 15.2 Cosa è VERIFICABILE / cosa è IPOTESI

| Affermazione | Verifica |
|-------------|----------|
| 12291 test PASS main | pre-commit hook output (verified earlier session) |
| 8 PR draft Sprint Q | gh pr list (verified earlier session) |
| LLM_PROVIDER + TOGETHER_API_KEY missing prod | Supabase secrets list (verified earlier session) |
| Vercel Pro upgrade fatto | Andrea statement (claim, deploy console verifica) |
| Karpathy LLM Wiki April 2026 viral | WebSearch verified |
| Khanmigo GPT-4 ChatGPT-based | WebSearch verified |
| 549 RAG chunks src/data/rag-chunks.json | CLAUDE.md (likely true, not re-verified) |
| Mac Mini M4 16GB available | Andrea statement (claim) |
| Hetzner trial €25 budget | gpu-vps-decision-framework.md doc |
| Sprint R5 85% pass rate target | proposal, not validated empirical |
| Qwen 7B IT quality vs Gemini | UNTESTED, requires Hetzner trial |

**Ipotesi to verify SOON**: Sprint R5 target threshold, Qwen IT quality, BGE-M3 win delta.

### 15.3 Cosa Andrea può ASKARE adesso

Honest enumeration:

1. "Skip Sprint R, go straight to OpenClaw Day 39" → I'd push back: foundation fragile.
2. "Do GDPR plan execute today instead of Hetzner" → I'd push back: severity dropped.
3. "Tea should do PNRR after all" → Andrea explicit refused; would respect that.
4. "Bundle opt is Sprint 7, why not now" → push back: Vercel Pro solved.
5. "Mac Mini just for Brain self-host, no autonomous loop" → push back: under-utilization paid sub.

### 15.4 Scope creep avoidance

This doc itself is risk of plan inflation. Successo measure:
- ENTRO 2 settimane: Sprint R1+R2 wire-up landed, R0 baseline + R3 partial done
- ENTRO 4 settimane: Sprint R5 gate evaluated
- ENTRO 6 settimane: Sprint 6 Day 39 OpenClaw started

If 6 settimane pass without R5 gate → review, possibly downscope R3/R4.

### 15.5 Action gate Andrea adesso

Three concrete asks pending Andrea decision:

**A. Vercel Pro setup ora (15min × 2)?** Quick wins instant prod observability.

**B. Tea email send oggi (60min compose)?** T1-T5 briefs delivered async start.

**C. Mac Mini setup tonight or tomorrow?** Physical access required, 2.5h block.

If yes A+B+C: I help compose Tea email + Vercel setup + Mac Mini setup script tonight.
If only A: quick wins only, defer rest.
If different ordering: tell me.

---

## File metadata

- **Path**: `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md`
- **Replaces**: `docs/strategy/2026-04-25-saturday-master-formulation.md` (v1)
- **Length**: ~1100 lines comprehensive
- **Skill compliance**: quality-audit (audit + critique v1) + writing-plans (Sprint R sub-plans) + documentation (engineering structure)
- **Caveman mode**: chat replies caveman; this doc normal language per skill rules
- **Honesta dichiarazione**: zero compiacenza, every claim either verified or labeled hypothesis

---

**Sources verified via WebSearch**:
- [Andrej Karpathy LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [VentureBeat: Karpathy LLM Knowledge Base architecture](https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an)
- [DAIR.AI: LLM Knowledge Bases explained](https://academy.dair.ai/blog/llm-knowledge-bases-karpathy)
- [Khan Academy Khanmigo official](https://www.khanmigo.ai/)
- [Harvard Business School Khanmigo case](https://www.hbs.edu/faculty/Pages/item.aspx?num=64929)
- [LearningMate podcast Building Khanmigo](https://learningmate.com/ep-11-building-khanmigo-an-ai-powered-personal-tutor-and-teaching-assistant/)
