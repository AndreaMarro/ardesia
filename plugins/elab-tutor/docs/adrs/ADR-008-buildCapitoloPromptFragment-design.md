---
id: ADR-008
title: buildCapitoloPromptFragment — design del prompt fragment Capitolo per UNLIM
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 2 ralph loop)
  - Andrea Marro (final approver)
context-tags:
  - sprint-s-iter-2
  - unlim-synthesis
  - principio-zero
  - capitolo-schema-q1
  - prompt-engineering
  - edge-function-unlim-chat
related:
  - ADR-007 (Wiki module extraction pattern)
  - ADR-009 (validatePrincipioZero middleware) — sibling, same wire-up sequence
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §4.3, §4.4, §11
  - docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md
input-files:
  - src/data/schemas/Capitolo.js (CapitoloSchema, ~206 LOC)
  - supabase/functions/_shared/capitoli-loader.ts (Deno loader, ~93 LOC)
  - supabase/functions/_shared/system-prompt.ts (BASE_PROMPT line 14, buildSystemPrompt line 135)
  - supabase/functions/unlim-chat/index.ts (call site line ~234)
output-files:
  - supabase/functions/_shared/capitolo-prompt-fragment.ts (NEW — generator-app-opus)
  - supabase/functions/_shared/system-prompt.ts (modified — append fragment in buildSystemPrompt)
  - supabase/functions/unlim-chat/index.ts (modified — resolve experimentId → capitolo)
---

# ADR-008 — `buildCapitoloPromptFragment` design

> Convertire una istanza `Capitolo` (schema Q1.A) in un frammento testuale da iniettare nel system prompt di UNLIM, in modo che la sintesi finale abbia (a) ancore narrative per PRINCIPIO ZERO, (b) citazioni selettive Vol/pag, (c) budget token controllato.

---

## 1. Contesto operativo

### 1.1 Stato attuale del prompt UNLIM

`supabase/functions/_shared/system-prompt.ts` esporta `BASE_PROMPT` (linea 14, ~117 righe testo) + `buildSystemPrompt(studentContext, circuitState, experimentContext)` (linea 135) che concatena:

```
[BASE_PROMPT]
\n
[MEMORIA STUDENTE: completedExperiments / commonMistakes / level / currentChapter]
\n
[STATO CIRCUITO ATTUALE: stateStr]
\n
[ESPERIMENTO ATTIVO: experimentContext]   ← oggi è solo `Esperimento attivo: ${expId}` (string flat)
```

`unlim-chat/index.ts:234` lo chiama così:
```ts
const systemPrompt = buildSystemPrompt(studentContext, circuitState, experimentContext)
  + (ragContext ? `\n\n${ragContext}` : '')
  + imagePiiGuard;
```

`experimentContext` è oggi una stringa povera (`"Esperimento attivo: v1-cap6-esp1"`). **Il modello non sa nulla del Capitolo**: niente narrative_flow, niente analogie validate, niente citazioni, niente sequenza esperimenti del capitolo. Risultato: o pesca dal RAG raw chunk (verbatim, viola "sintesi" Andrea-call-out), o inventa.

### 1.2 Cosa porta in tavola Q1 (CapitoloSchema)

`src/data/schemas/Capitolo.js` definisce un Capitolo come unità pedagogica con:

- `theory.testo_classe` — testo gia' nel linguaggio 10-14
- `theory.citazioni_volume[]` — `{page, quote, context}` selezionate dal libro fisico
- `theory.figure_refs[]` — `{page, caption, image_path?}`
- `theory.analogies_classe[]` — `{concept, text, evidence?}` validate
- `narrative_flow.intro_text` + `transitions[]` + `closing_text` — collante narrativo del capitolo
- `esperimenti[]` con `build_circuit` discriminato (`from_scratch` | `incremental_from_prev`), `phases`, `session_save.next_suggested`

37 capitoli aggregati in `supabase/functions/_shared/capitoli.json` (~1MB), accessibili via `getCapitolo(id)` o `getCapitoloByExperimentId(expId)` (capitoli-loader.ts:60-70). Lookup O(1) via Map.

### 1.3 Scoring rules che la fragment deve aiutare a soddisfare

Da `scripts/bench/score-unlim-quality.mjs`:
- RULE 4 `citation_vol_pag` (MEDIUM, requireWhenFlag) — pattern `/Vol\.\s*[1-3]\s*pag\.\s*\d+/i`
- RULE 5 `analogia` (MEDIUM, requireWhenFlag) — keyword pattern porta/strada/tubo/squadra/...
- RULE 6 `no_verbatim_3plus_frasi` (HIGH) — niente blocchi `«...»` con 3+ frasi
- RULE 9 `synthesis_not_verbatim` (CRITICAL, measured live) — overlap % vs RAG sources

La fragment **non** deve contenere blocchi raw lunghi: deve dare al modello materiale **per sintetizzare**, non per copiare.

---

## 2. Decisioni

### 2.1 Decisione D1 — Formato: Markdown leggero con sezioni etichettate

**Scelta**: Markdown con header `### CAPITOLO ATTIVO` e sotto-sezioni `### TEORIA / ### CITAZIONI DISPONIBILI / ### ANALOGIE / ### NARRATIVA CAPITOLO / ### ESPERIMENTO CORRENTE`.

**Alternative considerate**:

| Formato | Pro | Contro | Decisione |
|---------|-----|--------|-----------|
| Markdown sectioned | LLM-friendly (Gemini training), token-efficient, leggibile in log | Meno parseable post-hoc | **SCELTO** |
| XML tags `<capitolo>...</capitolo>` | Anthropic best-practice per Claude | Gemini non lo usa nativamente, +30% token, parsing CDATA per quote | Scartato |
| YAML frontmatter | Compatto | Indentation hell con quote multiline italiani | Scartato |
| JSON inline | Strict, machine-parseable | Verboso (key-quoting), Gemini tende a citarne struttura nella response | Scartato |

**Razionale**: la stack target è Gemini EU (default) + Together fallback (Llama/Qwen). Tutti gestiscono Markdown nativamente. XML andrebbe valutato se passassimo Claude default — ma stack 2026-04-26 non lo prevede.

**Downside onesto**: Markdown headers `###` confondono se il modello li ri-emette nella response. Mitigazione: BASE_PROMPT istruisce "non ripetere markdown del contesto". Andrea può forzare XML nel futuro se si vede l'header rispuntare nelle risposte (telemetria).

### 2.2 Decisione D2 — Scope: slice basato su experimentId, NON full capitolo

**Scelta**: la fragment **non** include mai tutti gli esperimenti del Capitolo. Include:
- Sempre: theory abbreviata + 2 citazioni top + 2 analogie + intro_text capitolo (slot fissi)
- Se `experimentId` matchato: l'esperimento corrente (titolo, components_needed, phases.name list) + transition_text dal precedente (se incremental)
- Se `experimentId` non matchato (utente sta chattando senza esperimento attivo): solo theory + intro_text del capitolo padre

**Alternative considerate**:

| Scope | Token estimate | Pro | Contro |
|-------|----------------|-----|--------|
| Full Capitolo (~5-15K char) | 1500-4500 token | LLM sa tutto | Sfora budget, dilui segnale, costo |
| Slice esp-corrente only | 200-500 token | Compatto, focus | Perde narrative_flow tra esperimenti |
| **Slice + narrative envelope (SCELTO)** | 500-900 token | Equilibrio focus/contesto | Logica selezione non banale |
| RAG-style retrieve (top-k chunk dal Capitolo) | variabile | Riusa infrastruttura | Snatura schema strutturato Q1 |

**Razionale**: Capitolo medio ha 3-5 esperimenti. Iniettare tutti ogni call = sprecare 70-80% token su esperimenti non rilevanti per la domanda. Slice contestualizzata mantiene PRINCIPIO ZERO continuity (intro + transition mantenuto) senza esplodere il prompt.

**Downside onesto**: se docente fa domanda cross-esperimento ("nel capitolo 6 prima abbiamo visto X poi Y, perche'?"), perdiamo Y dalla fragment. Mitigazione futura: rule simple — se nella user message compaiono >=2 esperimento_id pattern (regex `v\d-cap\d+-esp\d+`), passare il modulo a "full capitolo mode" (flag opzionale). Non Sprint S iter 2.

### 2.3 Decisione D3 — Narrative inclusion: solo intro + transition rilevante

**Scelta**: includere `narrative_flow.intro_text` (collante apertura capitolo) **sempre**. Includere la `transitions[]` entry dove `between[1] === currentExperimentId` solo se `experimentId` matchato (= "come arriviamo qui dall'esperimento precedente").

NON includere:
- `closing_text` capitolo (rilevante solo a fine percorso, evento raro)
- Tutte le `transitions[]` (esplosione token)
- `text_docente_action` di transition (è meta-istruzione al docente; PRINCIPIO ZERO dice non meta-istruire)

**Razionale**: PRINCIPIO ZERO + sezione 4.4 strategy doc dicono "esperimenti NON sono blocchetti staccati". L'intro e la transition al corrente sono ESATTAMENTE la cucitura narrativa che evita il "card isolata" effect. Closing è invece un evento di chiusura, non utile durante chat live.

**Downside onesto**: per esperimento NUMERO 1 di un capitolo non c'è transition (between[0] non esiste). La fragment in quel caso ha solo intro_text. Accettabile — è proprio l'apertura del capitolo, ha senso.

### 2.4 Decisione D4 — Citazioni: top-2 pre-selezionate, formato esplicito anti-verbatim

**Scelta**: includere max 2 entry da `theory.citazioni_volume[]`, scelte per:
1. `context === 'opening'` se presente (priority 1)
2. Altrimenti: prima entry con `quote.length` tra 40-180 caratteri (sweet spot per ancora autorevole, no blocchi 3+ frasi)
3. Format nel prompt:
   ```
   ### CITAZIONI DISPONIBILI (usa SELETTIVAMENTE, max 1 per risposta, formato «...» Vol.N pag.X)
   - Vol.{volume} pag.{page}: «{quote}»
   - Vol.{volume} pag.{page}: «{quote}»
   ```

**Razionale**: il prompt deve **invitare** alla citazione selettiva (RULE 4 score), **scoraggiare** la copia massiccia (RULE 6 anti-verbatim, RULE 9 synthesis). L'istruzione "max 1 per risposta" + formato pre-confezionato `«...» Vol.N pag.X` riduce probabilità che il modello incolli paragrafi.

**Downside onesto**: 2 quote possono essere insufficienti per domande tipo "spiegami il capitolo intero". Trade-off accettato — quelle domande dovrebbero ricadere nella modalità Percorso Capitolo (UI), non nella chat libera.

### 2.5 Decisione D5 — Wiki concept join: NO, separazione di concerni

**Scelta**: la fragment **non** include Wiki concept md. Wiki retrieval rimane nel modulo separato (`wiki-query-core.mjs` Sett-4 + futuro `wiki-retriever` Q4) iniettato come **blocco distinto** nel system prompt da `unlim-chat/index.ts`.

**Razionale**:
- Single Responsibility: Capitolo fragment = struttura pedagogica. Wiki fragment = enciclopedia conceptual. Mescolarli rende il modulo non testabile in isolamento.
- Cardinality diversa: Capitolo è 1 (lookup deterministico via experimentId). Wiki è top-k (retrieval semantico/keyword).
- Token budget separato e dosabile: Wiki può essere disattivato per chat veloce (es. salutini), Capitolo no.
- ADR-007 ha già stabilito il pattern di module-extraction per Wiki. ADR-008 lo rispetta.

**Downside onesto**: due punti di iniezione nel system prompt (capitolo + wiki) → ordine di concatenazione importa per attention model. Convention proposta: `BASE_PROMPT → MEMORIA STUDENTE → CAPITOLO FRAGMENT → WIKI FRAGMENT → STATO CIRCUITO → RAG CONTEXT → IMAGE GUARD`. Capitolo prima di Wiki perchè è gerarchicamente superiore (Wiki è support).

### 2.6 Decisione D6 — Budget token target: 500-900 token per fragment

**Scelta**: target 500-900 token (≈ 350-630 parole italiane).

**Calcolo onesto**:

| Sezione | Token stimati |
|---------|--------------|
| Header `### CAPITOLO ATTIVO: ...` + intro_text (≈80 parole) | 100-130 |
| `### TEORIA` testo_classe abbreviato 50 parole | 65-80 |
| `### CITAZIONI DISPONIBILI` 2 quote ≈ 60 parole | 100-150 |
| `### ANALOGIE VALIDATE` 2 entry ≈ 40 parole | 50-70 |
| `### NARRATIVA` transition (se presente) ≈ 30 parole | 40-60 |
| `### ESPERIMENTO CORRENTE` titolo + components_needed names + phase names | 80-120 |
| Istruzioni d'uso (footer "USA QUESTO CONTESTO PER:") | 40 |
| **Totale stimato** | **475-650** worst case ~900 |

Con budget complessivo system prompt Gemini (~32K context), 900 token = 2.8% del context window. Trascurabile.

**Hard cap**: 1200 token. Se superato → log warning + truncate `testo_classe` per primo, citazioni per ultime (preserva il segnale autorevolezza).

### 2.7 Decisione D7 — Failure modes

**Scelta**: comportamento per casi degenerati:

| Caso | Comportamento | Razionale |
|------|---------------|-----------|
| `capitolo === null` (no match) | Return `""` (stringa vuota), log a `console.warn` con experimentId | Non rompere flusso chat, downgrade a comportamento legacy |
| `capitolo.theory` mancante (schema invalid) | Skip sezione TEORIA, restanti sezioni proseguono | Best-effort |
| `experimentId` fornito ma non matcha esperimento del Capitolo passato | Render Capitolo full-mode (intro + theory + tutti i titoli esperimenti, no slice) | Edge case improbabile ma gestito |
| `narrative_flow` undefined (capitoli `wip` o `theory` puri) | Skip sezione NARRATIVA | Schema lo prevede `optional()` |
| `citazioni_volume[]` vuoto | Skip sezione CITAZIONI + nota nel log telemetry "no citations available for {capitolo.id}" | Visibilità debt content |
| Token cap superato (>1200 stim) | Truncate `testo_classe` → 30 parole; se ancora >1200, drop CITAZIONI 2nd | Preserva ranking importanza |
| `capitolo.id` malformed o tipo string nullo | Throw `TypeError` (programmer error, fail loud in dev) | Non degradare silenziosamente input dirty |

**Onesto**: l'unico failure mode "throw" è programmer error. Tutti gli altri sono "log + degrade gracefully" perchè in middleware chat live mai bloccare la risposta per un fragment mancante.

---

## 3. Signature TypeScript proposta

```ts
// supabase/functions/_shared/capitolo-prompt-fragment.ts

import type { Capitolo } from "./capitoli-loader.ts";

export interface CapitoloFragmentOptions {
  /** Se fornito, attiva slice mode su esperimento corrispondente. */
  experimentId?: string;
  /** Token budget hard cap (default 1200). */
  maxTokens?: number;
  /** Se true, include closing_text del capitolo (default false). */
  includeClosing?: boolean;
}

export interface CapitoloFragmentResult {
  /** Frammento markdown da iniettare nel system prompt. Stringa vuota se capitolo null. */
  text: string;
  /** Token stimati (parole * 1.3 euristica IT). */
  estimatedTokens: number;
  /** True se truncation è avvenuto. */
  truncated: boolean;
  /** Sezioni effettivamente incluse (per telemetry). */
  sections: Array<"intro" | "theory" | "citations" | "analogies" | "narrative" | "experiment">;
}

export function buildCapitoloPromptFragment(
  capitolo: Capitolo | null,
  options?: CapitoloFragmentOptions,
): CapitoloFragmentResult;
```

---

## 4. Esempio di output renderizzato

Input: `getCapitoloByExperimentId("v1-cap6-esp2")` ritorna Capitolo 6 Vol.1 "Il primo LED" con esperimento 2 "LED + resistore in serie" (incremental da esp1).

Output fragment (esempio realistico, ~580 token):

```markdown
### CAPITOLO ATTIVO: Vol.1 Cap.6 — Il primo LED

Ragazzi, oggi accendiamo la nostra prima luce! Un LED e' come una piccola
lampadina, ma molto piu' efficiente. Vedremo come collegarlo correttamente
e perche' serve sempre un resistore al suo fianco.

### TEORIA (in linguaggio classe)

Il LED ha due gambe: una lunga (positiva, anodo) e una corta (negativa,
catodo). Se invertiamo la polarita', non si accende — ma non si rompe.
Se non mettiamo il resistore, invece, troppa corrente lo brucia.

### CITAZIONI DISPONIBILI (usa SELETTIVAMENTE, max 1 per risposta, formato «...» Vol.1 pag.X)

- Vol.1 pag.27: «Il LED e' un diodo che emette luce quando lo attraversa una corrente nel verso giusto»
- Vol.1 pag.29: «Il resistore in serie limita la corrente e protegge il LED da bruciature»

### ANALOGIE VALIDATE (preferisci queste, sono testate per la classe)

- Polarita' LED: come una porta a senso unico — la corrente entra solo dall'anodo
- Resistore in serie: come una valvola che riduce il flusso d'acqua in un tubo

### NARRATIVA CAPITOLO

Apertura capitolo: dopo aver imparato cosa e' un circuito (Cap.5), ora
mettiamo dentro il primo componente attivo che produce un effetto visibile.

Transizione da esp1 a esp2: nell'esperimento 1 abbiamo acceso il LED
direttamente con la batteria (rischioso!), ora aggiungiamo il resistore
da 220Ω per protezione.

### ESPERIMENTO CORRENTE: LED + resistore in serie (esp 2 di 4)

- Componenti necessari: 1 LED rosso, 1 resistore 220Ω, 2 fili jumper, 1 breadboard
- Modalita' costruzione: incrementale da v1-cap6-esp1 (NON resettare il circuito)
- Fasi previste: PREPARA → MOSTRA → OSSERVA → CONCLUDI

### USA QUESTO CONTESTO PER:
- Sintetizzare risposta in linguaggio 10-14 anni (NON copiare integralmente)
- Citare massimo 1 frase del libro come ancora di autorevolezza
- Riusare le ANALOGIE VALIDATE invece di inventarne
- Ricordare la continuita' narrativa (riferisciti all'esperimento precedente se utile)
```

Questo è il payload che `buildCapitoloPromptFragment(getCapitoloByExperimentId('v1-cap6-esp2').capitolo, { experimentId: 'v1-cap6-esp2' }).text` deve produrre.

---

## 5. Integrazione in `unlim-chat/index.ts`

Punto di iniezione (estensione di linea ~234 attuale):

```ts
// PRIMA (oggi):
const experimentContext = safeExperimentId
  ? `Esperimento attivo: ${safeExperimentId}`
  : null;
const systemPrompt = buildSystemPrompt(studentContext, safeCircuitState, experimentContext)
  + (ragContext ? `\n\n${ragContext}` : '')
  + imagePiiGuard;

// DOPO (proposto ADR-008):
import { getCapitoloByExperimentId } from "../_shared/capitoli-loader.ts";
import { buildCapitoloPromptFragment } from "../_shared/capitolo-prompt-fragment.ts";

const capitoloMatch = safeExperimentId ? getCapitoloByExperimentId(safeExperimentId) : null;
const capitoloFragment = buildCapitoloPromptFragment(
  capitoloMatch?.capitolo ?? null,
  { experimentId: safeExperimentId ?? undefined },
);

// experimentContext legacy mantenuto come fallback minimal
const experimentContext = safeExperimentId
  ? `Esperimento attivo: ${safeExperimentId}`
  : null;

const systemPrompt = [
  buildSystemPrompt(studentContext, safeCircuitState, experimentContext),
  capitoloFragment.text || null,
  ragContext || null,
  imagePiiGuard || null,
]
  .filter(Boolean)
  .join("\n\n");

// Telemetry hook (opzionale, raccomandato)
if (capitoloFragment.truncated) {
  console.warn(`[capitolo-fragment] truncated for ${safeExperimentId}, sections=${capitoloFragment.sections.join(",")}`);
}
```

**Note integrazione onesta**:
- Il join via array `.filter(Boolean)` evita doppi `\n\n` quando una sezione è vuota.
- Il chiamante NON deve preoccuparsi del token budget: la fragment self-limita.
- Se Andrea vuole A/B test su prompt revision, basta avvolgere `capitoloFragment.text` in un feature flag env (`Deno.env.get("ELAB_CAPITOLO_FRAGMENT_ENABLED")`) — design suggerito ma non incluso nell'ADR.

---

## 6. Test scenarios (per generator-test-opus)

Ogni test PURE-FUNCTION (no Deno-specific, gira su Vitest standalone).

| ID | Scenario | Input | Assert |
|----|----------|-------|--------|
| T1 | Happy path slice mode | Capitolo Cap6 Vol.1 + experimentId `v1-cap6-esp2` | `text` contiene `### CAPITOLO ATTIVO`, `### TEORIA`, `### ESPERIMENTO CORRENTE: LED + resistore`, sections include 6 voci, estimatedTokens tra 400-900 |
| T2 | Capitolo null (no match) | `null, { experimentId: 'fake-exp' }` | `text === ""`, sections === [], truncated === false |
| T3 | Esperimento numero 1 (no transition) | Capitolo + experimentId primo esp | sections NON include `narrative` per transition (solo intro), nessun crash |
| T4 | Capitolo `wip` senza narrative_flow | Capitolo type=wip | sections skippa `narrative`, nessun throw, text contiene almeno theory |
| T5 | Citazioni vuote | Capitolo con `citazioni_volume: []` | sections NON include `citations`, no crash, log warn |
| T6 | Token cap superato | Capitolo con `testo_classe` 5000 parole + 10 citazioni | truncated === true, estimatedTokens <= 1200, testo_classe troncato a 30 parole |
| T7 | experimentId fornito ma non matcha esperimenti del Capitolo | Cap6 + experimentId `v1-cap99-esp1` | Render full-mode capitolo (intro + theory + lista titoli esperimenti), no crash |
| T8 | Capitolo.id malformed (object instead of Capitolo) | `{ foo: 'bar' }` | Throw TypeError (programmer error) |
| T9 | includeClosing=true | Capitolo + opt | sections include `narrative` con closing_text |
| T10 | Snapshot stability | Capitolo Cap6 deterministic | `text` === snapshot file (regression test) |

---

## 7. Open questions per Andrea

1. **[ANDREA-DECIDE] Default `includeClosing`**: false (mio default), ma se docente sta in modalità "fine percorso", potrebbe servire. Per ora false, override via opzione.
2. **[ANDREA-DECIDE] Soglia token cap**: 1200 token = ~3% context window Gemini Pro (32K). Se vogliamo essere parsimoniosi su modelli minori (Together Llama 8B 8K context), potremmo abbassare a 600. Mio default 1200, da rivedere quando misuriamo bench R5.
3. **Cardinalità citazioni**: ho fissato max 2. Se Andrea vuole 3 (più ancora autorevole), basta cambiare costante. Trade-off: più quote = più probabile RULE 6 fail (verbatim 3+).
4. **Lingua fissa IT**: nessun supporto multilingue oggi. Schema Capitolo è IT-only. Quando Sprint multilingue arriva, fragment dovrebbe essere costruito da `theory.testo_classe[locale]`. Non Sprint S iter 2.

---

## 8. Trade-off summary onesto

**Pro**:
- LLM ha contesto pedagogico **strutturato** invece che chunk RAG raw → risposta synthesis-friendly (RULE 9 score positivo)
- Citazioni pre-curate con format esplicito → RULE 4 score senza copia massiccia (RULE 6 score)
- Analogie validate da Andrea/Tea → meno probabilità di analogia inventata fuori target età
- Continuità narrativa da `narrative_flow.transitions` → addresso Andrea call-out "esperimenti non sono blocchetti staccati"
- Token budget controllato (≤1200) → costo prevedibile per call

**Contro / debt**:
- Doppio source of truth: `BASE_PROMPT` ha già istruzioni narrative + il fragment ne aggiunge altre. Rischio drift. Mitigazione: ADR-008 + ADR-009 wire-up obbliga rilettura BASE_PROMPT (line 86-99 va riscritta come da master plan §4.4 — quel cambio è prerequisito ADR-008 utile).
- Se Capitolo schema evolve (Q1.B add field) la fragment va aggiornata manualmente. Non auto-derivata da Zod schema. Trade-off accettato per leggibilità output.
- Token cap 1200 è euristica (1 parola IT ≈ 1.3 token Gemini, ≈ 1.5 Llama). Senza tokenizer real-time, possiamo sforare ~10% in casi borderline. Accettabile.
- `getCapitoloByExperimentId` fa lookup O(N) sulla lista esperimenti per ogni call — N totale = ~92 esperimenti, costo trascurabile (microsec). Se diventa hot path, indicizzare in capitoli-loader.

**Alternative rejected**:
- "Iniettare l'intero capitolo serializzato come JSON nel prompt" — ~5K token wasted, struttura non leggibile da LLM in modo naturale.
- "Lasciare BASE_PROMPT inalterato e gestire tutto via RAG retrieval semantico" — viola la motivazione di Q1 (avere unità pedagogica strutturata vs chunk flat).
- "Costruire fragment lato frontend (React) e passarlo come stringa al backend" — aumenta payload HTTP, mette logica pedagogica nel client (rebuild edge function per change).

---

## 9. Acceptance criteria implementazione

Per `generator-app-opus` quando implementa:

- [ ] File creato: `supabase/functions/_shared/capitolo-prompt-fragment.ts`
- [ ] Export `buildCapitoloPromptFragment(capitolo, options)` con signature ADR §3
- [ ] Header markdown sezioni `###` come da §4 esempio
- [ ] Token cap 1200 default + truncation in ordine: testo_classe → citazioni → analogie
- [ ] Failure modes §2.7 implementati (null capitolo → "", wip → skip narrative, etc.)
- [ ] 10 test pass (§6) in `tests/unit/supabase/capitolo-prompt-fragment.test.ts` (generator-test-opus)
- [ ] Wire-up in `unlim-chat/index.ts` come da §5
- [ ] BASE_PROMPT line 86-99 riscritta come da master plan §4.4 (DEFAULT sintetizza, citazione SELETTIVA) — coordinato in stesso PR
- [ ] No regressione test baseline (12291 PASS preservato)
- [ ] Build Deno function passa: `npx supabase functions deploy unlim-chat --dry-run`
- [ ] Snapshot fixture aggiornato: `tests/fixtures/capitolo-fragment/cap6-esp2.snapshot.md`

---

## 10. Riferimenti

- **Master plan**: `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` §4.3, §4.4, §11
- **Sprint S iter 2 PDR**: `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md`
- **Schema source**: `src/data/schemas/Capitolo.js`
- **Loader Deno**: `supabase/functions/_shared/capitoli-loader.ts`
- **Call site target**: `supabase/functions/unlim-chat/index.ts:234`
- **Scoring rules**: `scripts/bench/score-unlim-quality.mjs` RULES 4, 5, 6, 9
- **PRINCIPIO ZERO**: `CLAUDE.md` Sezione "PRINCIPIO ZERO" + linea 81-99 di `system-prompt.ts`
- **Sibling ADR**: ADR-009 (validatePrincipioZero middleware) — implementato nello stesso PR Sprint R1
