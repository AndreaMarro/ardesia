---
id: ADR-027
title: Volumi Narrative Refactor Schema — lesson-paths flat 92 file → narrative continuum v{N}-cap{M}.json grouped (1 file per capitolo, multi-variazione interno) + 4-step plan Mac Mini D3 audit + Davide co-author validate (Sprint T iter 22-25 mandatory)
status: PROPOSED
date: 2026-04-29
deciders:
  - architect-opus (Sprint T iter 19 caveman mode, ralph loop /caveman dispatch ANDREA-MANDATES-ITER-18-PM-ADDENDUM §4)
  - Andrea Marro (final ratify iter 25 close — schema rivisto + UI Percorso/Passo-Passo refactor approve)
  - Davide Fagherazzi (co-author iter 22 review narrative flow per capitolo + linguaggio "Ragazzi" + "occhio-scorre" docente)
context-tags:
  - sprint-t-iter-22
  - sprint-t-iter-23
  - sprint-t-iter-24
  - sprint-t-iter-25
  - volumi-narrative-refactor-schema
  - lesson-paths-narrative-grouped
  - 92-flat-to-38-grouped
  - variazioni-stesso-tema-capitolo
  - mac-mini-d3-audit-pdf-vs-current
  - davide-co-author-validate-iter-25
  - morfismo-sense-2-triplet-coerenza
  - principio-zero-v3-vol-pag-verbatim
  - score-impact-box-morfismo-sense-2-0.7-0.95
related:
  - CLAUDE.md §0 DUE PAROLE D'ORDINE Morfismo Sense 2 triplet coerenza esterna (kit + volumi + software)
  - ADR-008 (buildCapitoloPromptFragment Vol/pag verbatim citazioni — schema lesson-paths-narrative compatible)
  - ADR-009 (Principio Zero validator middleware V3 Vol/pag canonical — Vol/pag VERBATIM cross-check)
  - ADR-019 (Sense 1.5 Morfismo runtime docente + classe — narrative continuum adatta età + livello)
  - ADR-021 (Box 3 RAG 1881 chunks coverage redefine — chunks narrative continuum aware)
  - ADR-023 (Onniscenza completa 7-layer — Layer 1 RAG + Layer 4 class_memory.capitolo_corrente)
  - ADR-025 (Modalità ELAB 4 simplification — Percorso = narrative continuum reading sibling, lesson-paths-narrative schema host 4-mode metadata)
  - ADR-026 (Content Safety Guard runtime 10 rules — rule 6 Vol/pag VERBATIM cross-check Layer 1 RAG)
  - docs/pdr/2026-04-29-sprint-T-iter-18+/ANDREA-MANDATES-ITER-18-PM-ADDENDUM.md §4 (mandate iter 18 PM Andrea verbatim "esperimenti sui volumi sono variazioni stesso tema, ELAB tenta pezzi staccati")
  - docs/pdr/2026-04-29-sprint-T-iter-18+/PDR-MASTER-2026-04-29.md (master plan iter 18-30)
input-files:
  - src/data/lesson-paths/v1-cap{1..6}-esp{1..N}.json (38 file flat Vol1)
  - src/data/lesson-paths/v2-cap{1..N}-esp{1..N}.json (27 file flat Vol2)
  - src/data/lesson-paths/v3-cap{1..N}-esp{1..N}.json (27 file flat Vol3)
  - src/data/lesson-groups.js (250 LOC, 27 Lezioni raggruppate per concetto iter 14)
  - src/data/volume-references.js (1221 LOC, 92/92 enriched bookText volumi Vol1+2+3)
  - VOLUME 3/CONTENUTI/volumi-pdf/{Vol1,Vol2,Vol3}.pdf (PDF source canonical)
output-files:
  - docs/architectures/ADR-027-volumi-narrative-refactor-schema-2026-04-29.md (THIS file, NEW)
  - Future iter 22+: automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md (Mac Mini D3 audit output, mapping capitolo libro → variazioni narrative + lesson-paths flat current)
  - Future iter 23+: src/data/lesson-paths-narrative/v{N}-cap{M}.json (NEW schema grouped, ~38 file totale, 1 per capitolo, multi-variazione interno)
  - Future iter 23+: src/data/lesson-paths/ DEPRECATE → migration script `scripts/migrate-lesson-paths-flat-to-narrative.mjs` (NEW ~250 LOC)
  - Future iter 24+: src/components/lavagna/PercorsoReader.jsx (NEW Percorso narrative reader page-by-page)
  - Future iter 24+: src/components/lavagna/PassoPassoNavigator.jsx EXTEND (variation_1→variation_2→...→variation_N navigation interno capitolo)
  - Future iter 25+: docs/audits/2026-05-XX-volumi-narrative-davide-validate.md (Davide co-author UAT iter 25 close)
---

# ADR-027 — Volumi Narrative Refactor Schema Sprint T iter 22-25

> Codificare refactor lesson-paths schema da **flat 92 file pezzi staccati** (`v{1,2,3}-cap{N}-esp{M}.json`) a **narrative continuum grouped** (`src/data/lesson-paths-narrative/v{N}-cap{M}.json`, ~38 file totale, 1 per capitolo, multi-variazione interno) per riflettere variazioni stesso tema capitolo volumi cartacei Davide. Schema NEW `{ chapter, themes, variations: [{step, components, instructions, expected, modes_entry_state}] }`. 4-step plan: Mac Mini D3 audit PDF Vol1+2+3 vs current 92 lesson-paths → schema rivisto → UI Percorso/Passo-Passo refactor → Davide co-author validate iter 25. Score impact Box Morfismo Sense 2 (kit + volumi + software triplet) 0.7 → 0.95 post-refactor. Andrea ratify iter 25 close mandatory. Davide review co-author iter 22.

---

## 1. Status

**PROPOSED** — architect-opus iter 19 caveman mode 2026-04-29 propone Volumi Narrative Refactor Schema canonical 4-step per Sprint T iter 22-25 mandatory. Andrea ratify iter 25 close. Davide Fagherazzi co-author iter 22 review.

Sign-off chain previsto:
- architect-opus iter 19 caveman dispatch ADR-027 PROPOSED 4-step canonical
- Mac Mini elab-auditor-v2 iter 22 D3 audit PDF Vol1+2+3 vs current lesson-paths flat → output `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md`
- gen-app-opus iter 23 implement schema lesson-paths-narrative `v{N}-cap{M}.json` + migration script flat → narrative
- gen-app-opus iter 24 implement UI PercorsoReader.jsx + PassoPassoNavigator.jsx extend
- Davide Fagherazzi iter 22 + iter 25 co-author review narrative flow per capitolo + linguaggio "Ragazzi" + "occhio-scorre" docente
- Andrea Marro iter 25 close ratify schema rivisto + UI refactor approve

---

## 2. Context

### 2.1 Andrea mandate iter 18 PM verbatim

ANDREA-MANDATES-ITER-18-PM-ADDENDUM §4 codifica mandato Sprint T iter 22-25:

> "esperimenti sui volumi non sono proposti come su elabtutor: in uno sono variazioni di uno stesso tema, nell'altro tenti pezzi staccati"

Razionale Andrea (paraphrase iter 18 PM cumulative messages, repetuto critical):
- **Volumi cartacei Davide** (TRES JOLIE/1 ELAB VOLUME UNO + 2 + 3): esperimenti come **VARIAZIONI** dello stesso **tema-capitolo** (narrative continuum coerente).
- **ELAB Tutor lesson-paths**: 92 file `v{1,2,3}-cap{N}-esp{M}.json` = **PEZZI STACCATI** flat (cards isolate).
- **Conseguenza**: docente legge libro narrative MA software mostra cards isolate → **DISCONTINUITÀ** + **viola Morfismo Sense 2 triplet coerenza esterna** (kit + volumi + software).
- Differenziatore competitivo 2026+ ELAB = **coerenza esatta software ↔ kit fisico Omaric ↔ volumi cartacei Davide** = singola esperienza unificata. Pezzi staccati = viola moat materiale.

### 2.2 Stato attuale lesson-paths iter 18 (HEAD `e02eabb`)

Componenti shipped iter 1-12:
- **92 file flat** `src/data/lesson-paths/v{1,2,3}-cap{N}-esp{M}.json` (38 Vol1 + 27 Vol2 + 27 Vol3)
- **27 Lezioni raggruppate per concetto** (`src/data/lesson-groups.js` 250 LOC iter 14, mappatura Lezione → set esperimenti)
- **92/92 enriched bookText volumi** (`src/data/volume-references.js` 1221 LOC iter 14, mapping experimentId → Vol/pag + bookText VERBATIM PDF)

Componenti NON live (gap iter 22-25 mandatory):
- **Schema narrative continuum**: NOT implemented (current schema flat per esperimento, NO grouping per capitolo)
- **Variazioni stesso tema interno capitolo**: NOT esplicito (variation_1 → variation_2 → variation_3 → variation_4 dentro 1 capitolo)
- **PercorsoReader.jsx** narrative scroll page-by-page: NOT implemented (current Percorso shows experiment cards flat)
- **PassoPassoNavigator.jsx** variation_1→...→variation_N: NOT implemented (current Passo-Passo step navigation interno singolo esperimento NON cross-variation)
- **Mac Mini D3 audit PDF vs current**: NOT executed (Sprint S iter 12 deferred Mac Mini SSH block, retry iter 22)
- **Davide co-author validate**: NOT executed (deferred iter 25 close UAT)

### 2.3 Perché ADR adesso (iter 19 caveman)

Tre motivi cogenti:
1. **Sprint T iter 22-25 mandatory implementation richiede architettura codificata prima di toccare 92 file lesson-paths**: gen-app+gen-test+architect 5-agent OPUS iter 22-25 partono da spec canonical schema, NO ad-hoc refactor.
2. **Andrea mandate explicit iter 18 PM addendum §4 repetuto critical**: senza ADR esplicita, scope ambiguo + risk regression Morfismo Sense 2 (worst case: refactor parziale Vol1 ma Vol2+3 restano flat → discontinuità peggiore).
3. **Coupling ADR-025 modalità 4 simplification + ADR-023 Layer 1 RAG**: schema lesson-paths-narrative supporta 4-mode metadata + Layer 1 RAG cross-link narrative continuum aware. Codifica simultanea iter 19 evita drift cross-ADR.

### 2.4 Rischio non-codifica

Se ADR-027 non shipped iter 19 caveman:
- Implementazione iter 22-25 rischia divergenza schema (chi decide `variations[]` vs `experiments[]`? capitolo_id format?)
- Risk regression Morfismo Sense 2 (worst case: schema refactor parziale → mix flat + narrative coexisting → debt + confusion)
- Risk decoupling ADR-025 modalità (schema lesson-paths-narrative MUST host 4-mode metadata `modes_entry_state`)
- Risk regression `volume_references.js` 92/92 enriched bookText (refactor schema senza migrazione bookText perde Vol/pag VERBATIM canonical)

---

## 3. Decision

**Volumi Narrative Refactor Schema = lesson-paths flat 92 file → narrative continuum grouped `src/data/lesson-paths-narrative/v{N}-cap{M}.json` (~38 file totale, 1 per capitolo, multi-variazione interno) + 4-step plan: Mac Mini D3 audit → schema rivisto → UI refactor → Davide co-author validate iter 25 close.**

Architettura schema NEW `lesson-paths-narrative/v{N}-cap{M}.json`:
```json
{
  "chapter": "v1-cap6",
  "chapter_title_book": "I LED — capitolo 6 Volume 1",
  "vol_pag_canonical": "Vol.1|pag.45-58",
  "themes": ["LED", "resistenza", "legge di Ohm", "polarità"],
  "narrative_intro_book_text_verbatim": "Ragazzi, oggi scopriremo i LED... [VERBATIM bookText pag.45]",
  "modes_supported": ["Percorso", "Passo-Passo", "GiaMontato", "Libero"],
  "variations": [
    {
      "variation_id": "v1-cap6-var1",
      "step": 1,
      "title": "LED rosso semplice — variazione 1",
      "vol_pag_canonical": "Vol.1|pag.46",
      "components": [
        { "type": "led", "color": "red", "id": "led1" },
        { "type": "resistor", "value": 220, "id": "r1" }
      ],
      "instructions_book_text_verbatim": "Ragazzi, montiamo il LED rosso... [VERBATIM bookText pag.46]",
      "expected_state": "led1.lit=true, r1.current=20mA",
      "modes_entry_state": {
        "Percorso": "passive_view",
        "Passo-Passo": "build_step_1",
        "GiaMontato": "final_assembled_state",
        "Libero": "passive_view_with_proactive_unlim"
      }
    },
    {
      "variation_id": "v1-cap6-var2",
      "step": 2,
      "title": "LED giallo — variazione 2",
      "vol_pag_canonical": "Vol.1|pag.48",
      "components": [...],
      "instructions_book_text_verbatim": "...",
      "expected_state": "...",
      "modes_entry_state": {...}
    },
    {
      "variation_id": "v1-cap6-var3",
      "step": 3,
      "title": "LED blu — variazione 3",
      "vol_pag_canonical": "Vol.1|pag.50",
      "components": [...],
      "instructions_book_text_verbatim": "...",
      "expected_state": "...",
      "modes_entry_state": {...}
    },
    {
      "variation_id": "v1-cap6-var4",
      "step": 4,
      "title": "Più LED in parallelo — variazione 4 capstone capitolo",
      "vol_pag_canonical": "Vol.1|pag.55-58",
      "components": [...],
      "instructions_book_text_verbatim": "...",
      "expected_state": "...",
      "modes_entry_state": {...}
    }
  ],
  "narrative_outro_book_text_verbatim": "Ragazzi, abbiamo visto come... [VERBATIM bookText pag.58]",
  "next_chapter_pointer": "v1-cap7"
}
```

Replace flat 92 file → grouped ~38 file (1 per capitolo Vol1+2+3, multi-variazione interno).

Non-goal:
- Multi-volume cross-reference dentro singola variation (resta volume_id mono, cross-ref via `cross_ref_capitolo` field opzionale)
- Capstone marking automatico (resta manual Davide co-author iter 22 review)
- Schema migration backward-compat flat 92 file mantenuti runtime (deprecation hard cut-off iter 25 close)

---

## 4. 4-Step Plan canonical

### 4.1 Step 1 iter 22 — Mac Mini D3 audit Vol1+2+3 capitolo-by-capitolo

**Owner**: Mac Mini autonomous loop elab-auditor-v2 agent (recovery SSH iter 22 entrance precondition).

**Input**:
- `VOLUME 3/CONTENUTI/volumi-pdf/{Vol1,Vol2,Vol3}.pdf` (PDF source canonical Davide)
- `src/data/lesson-paths/*.json` (92 file flat current)
- `src/data/lesson-groups.js` 27 Lezioni raggruppate
- `src/data/volume-references.js` 92/92 enriched bookText

**Process**:
1. Mac Mini elab-auditor-v2 estrae testo PDF Vol1+2+3 (`pdftotext` per capitolo)
2. Identifica capitoli libro (es. Vol1 cap1-cap6, Vol2 cap1-cap?, Vol3 cap1-cap?)
3. Per ogni capitolo libro, identifica **variazioni stesso tema** (esempio Vol1 cap6 LED: var1 LED rosso → var2 LED giallo → var3 LED blu → var4 LED parallelo)
4. Diff vs current 92 lesson-paths flat: quali sono "pezzi staccati" superflui (esperimenti software che NON corrispondono a variazioni libro)
5. Output mapping `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md`:
   ```markdown
   # Vol1 Capitolo 6 — I LED
   ## Variazioni libro narrative continuum:
   - var1 (pag.46): LED rosso semplice
   - var2 (pag.48): LED giallo
   - var3 (pag.50): LED blu
   - var4 (pag.55-58): Più LED parallelo (capstone)
   
   ## Lesson-paths flat current:
   - v1-cap6-esp1.json → MAPS TO var1
   - v1-cap6-esp2.json → MAPS TO var2
   - v1-cap6-esp3.json → MAPS TO var3
   - v1-cap6-esp4.json → MAPS TO var4
   - v1-cap6-esp5.json → SUPERFLUO (non in libro, "LED PWM" non capitolo 6)
   
   ## Action: GROUP 4 file → 1 file v1-cap6.json + REMOVE esp5 OR move to cap7-PWM
   ```
6. Total estimate: ~38 capitoli totali Vol1+2+3 (vs current 92 esperimenti) → ratio 92/38 = ~2.4 esperimenti per capitolo media

**Output**: `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (Markdown audit ~500 LOC)

**Deadline**: iter 22 close.

**Andrea ratify**: review audit + decide eventuali esperimenti software che SUPERFLUO eliminare vs spostare a cap diverso.

### 4.2 Step 2 iter 23 — Schema rivisto lesson-paths-narrative

**Owner**: gen-app-opus iter 23 (5-agent OPUS Pattern S Phase 1).

**Atoms**:
1. **B1 architect-opus**: this ADR-027 §3 schema canonical ratify Andrea iter 22 entrance (~5 min Andrea decision Y/N).
2. **B2 gen-app-opus**: implement migration script `scripts/migrate-lesson-paths-flat-to-narrative.mjs` (~250 LOC):
   - Input: 92 file flat current + audit `VOLUMI-EXPERIMENT-ALIGNMENT.md` mapping
   - Output: ~38 file `src/data/lesson-paths-narrative/v{N}-cap{M}.json` grouped
   - Logic: group flat esperimenti per capitolo + sort variation_id step + inject `narrative_intro/outro_book_text_verbatim` from `volume_references.js` + inject `modes_entry_state` 4-mode metadata
3. **B3 gen-app-opus**: deprecate `src/data/lesson-paths/` directory (move to `src/data/lesson-paths-deprecated-flat/` con README "DEPRECATED iter 23, see lesson-paths-narrative/")
4. **B4 gen-app-opus**: update `src/data/lesson-groups.js` 27 Lezioni mapping per capitolo NEW schema (ref `chapter` field invece experimentId).
5. **B5 gen-test-opus**: `tests/unit/lesson-paths-narrative-schema.test.js` schema validation 38 file + Vol/pag VERBATIM bookText match RAG chunks (cross-check Layer 1 ADR-023).
6. **B6 gen-test-opus**: regression sweep — verificare ZERO breakage existing tests + R5 91.80% PASS preserved.

**Output**: `src/data/lesson-paths-narrative/v{N}-cap{M}.json` ~38 file + migration script + deprecate flat 92 file + lesson-groups update + tests.

**Deadline**: iter 23 close.

**Andrea ratify**: review schema canonical + approve deprecation flat 92 file.

### 4.3 Step 3 iter 24 — UI Percorso/Passo-Passo refactor

**Owner**: gen-app-opus iter 24 (5-agent OPUS Pattern S Phase 1).

**Atoms**:
1. **C1 gen-app-opus**: `src/components/lavagna/PercorsoReader.jsx` NEW (~350 LOC):
   - Scroll page-by-page dentro capitolo (`narrative_intro_book_text_verbatim` + `variations[].instructions_book_text_verbatim` + `narrative_outro_book_text_verbatim`)
   - ToC themes sidebar (`themes` array)
   - Voice UNLIM TTS Isabella narratore volumi (wake word "Ehi UNLIM leggi")
   - Highlight visual passi narrativi (NO build interaction, passive view)
2. **C2 gen-app-opus**: `src/components/lavagna/PassoPassoNavigator.jsx` EXTEND (~200 LOC delta):
   - Step navigation variation_1 → variation_2 → variation_3 → variation_4 dentro capitolo
   - Verifica componente per componente real-time CircuitSolver MNA/KCL (`expected_state` field)
   - Diagnose flow integrato inline (errore componente → feedback "Ragazzi, controlliamo..." + Vol/pag riferimento)
   - Auto-progress next variation post completion
3. **C3 gen-app-opus**: `src/components/lavagna/GiaMontatoView.jsx` NEW (~250 LOC, coupled ADR-025 §4.3):
   - Jump to final state variation (`variations[last].modes_entry_state.GiaMontato`)
   - Visual diagnose highlight errori (se circuit broken)
   - Spiegazione overlay bottom 30% (`narrative_outro_book_text_verbatim`)
4. **C4 gen-app-opus**: `src/components/lavagna/LiberoMode.jsx` EXTEND (~100 LOC delta, coupled ADR-025 §4.4):
   - Auto-mount Percorso ultimo capitolo completato classe (`Layer 4 class_memory.capitolo_corrente` ADR-023)
   - UNLIM proattivo wake word + nudge 30s inattività
5. **C5 gen-test-opus**: `tests/integration/percorso-narrative-reader.test.js` E2E reader scroll page-by-page + voice TTS + ToC navigation
6. **C6 gen-test-opus**: `tests/integration/passo-passo-cross-variation.test.js` E2E variation_1→variation_2→variation_3→variation_4 + diagnose flow inline
7. **C7 gen-test-opus**: regression sweep — verificare ZERO breakage existing modalità tests + R5 91.80% PASS preserved.

**Output**: 4 nuovi/extended componenti React + 3 integration tests.

**Deadline**: iter 24 close.

**Andrea ratify**: review UI refactor demo Fiera-style "docente leggi libro narrativo + classe build kit fisico variazioni".

### 4.4 Step 4 iter 25 — Davide co-author validate UAT

**Owner**: Davide Fagherazzi co-author iter 25 close (UAT review + validation).

**Atoms**:
1. **D1 architect-opus**: prep package review per Davide:
   - Schema canonical lesson-paths-narrative `v{N}-cap{M}.json` (38 file)
   - UI demo Percorso reader narrative scroll
   - UI demo Passo-Passo cross-variation navigation
   - Audit alignment `VOLUMI-EXPERIMENT-ALIGNMENT.md` con eventuali deviazioni
2. **D2 Davide review** narrative flow per capitolo:
   - Verifica linguaggio "Ragazzi" + "occhio-scorre" docente coerente con volumi cartacei
   - Verifica Vol/pag VERBATIM bookText injected `narrative_intro/outro` correctly
   - Verifica variazioni stesso tema capitolo (NO pezzi staccati orfani)
   - Verifica capstone marking variation finale capitolo
3. **D3 Davide approve** o request modifiche (Davide è autore volumi, voce decisiva narrative consistency)
4. **D4 gen-app-opus iter 25** apply Davide modifiche se any (es. tweak `narrative_intro_book_text_verbatim` per phrasing più aderente volume)
5. **D5 Andrea final ratify** iter 25 close + score Box Morfismo Sense 2 update 0.7 → 0.95
6. **D6 scribe-opus iter 25** audit `docs/audits/2026-05-XX-volumi-narrative-davide-validate.md` + handoff Sprint T close

**Output**: Davide approval + audit document + score Box Morfismo Sense 2 update.

**Deadline**: iter 25 close.

**Andrea ratify**: final score Sprint T iter 25 close 9.95+/10 ONESTO con Box Morfismo Sense 2 1.0 (volumi narrative refactor closed).

---

## 5. Score impact analysis

### 5.1 Box Morfismo Sense 2 (kit + volumi + software triplet)

Pre-refactor (iter 18 baseline):
- Box Morfismo Sense 2 = **0.7** (lesson-paths flat 92 file = pezzi staccati, viola triplet coerenza esterna parziale)
- Componenti coerenti: kit Omaric ↔ volumi Davide ↔ software simulator SVG (NanoR4Board + LED + breadboard) ✓
- Componenti incoerenti: software lesson-paths ↔ volumi narrative continuum ✗ (worst case docente legge libro narrativo MA software cards isolate)

Post-refactor (iter 25 close):
- Box Morfismo Sense 2 = **0.95** (lesson-paths-narrative grouped + Davide validate UAT)
- Componenti coerenti: kit Omaric ↔ volumi Davide ↔ software simulator SVG ↔ software lesson-paths-narrative ✓✓
- Residual gap 0.05: alcuni esperimenti SUPERFLUI software (es. lab demo developer-only) potrebbero restare ma chiaramente marcati `experimental_extra` flag schema

Score Sprint T iter 25 close target: **+0.25 contribution Box Morfismo Sense 2** (0.7 → 0.95)

### 5.2 Box 1 RAG coverage redefine (ADR-021)

Pre-refactor:
- Box 3 RAG 1881 chunks (Vol1 203 + Vol2 292 + Vol3 198 + 100 wiki + 1188 misc) → 0.7

Post-refactor:
- Layer 1 RAG cross-link `lesson-paths-narrative` schema via `vol_pag_canonical` field → narrative continuum aware retrieval
- Box 3 RAG = **0.85** (chunks aware narrative continuum, cross-ref `chapter` + `variation_id`)

Score Sprint T iter 25 close target: **+0.15 contribution Box 3 RAG** (coupled ADR-021)

### 5.3 Box Modalità (ADR-025)

Pre-refactor:
- Modalità 4 modes (ADR-025) NEW iter 22 → 0.6 parziale

Post-refactor:
- Percorso reader + Passo-Passo cross-variation + Già Montato pre-assembled + Libero auto-Percorso ALL functional con narrative schema
- Box Modalità = **1.0** (full coverage iter 25 close, coupled ADR-025 §10)

Score Sprint T iter 25 close target: **+0.4 contribution Box Modalità** (coupled ADR-025)

### 5.4 Total score impact Sprint T iter 25 close

Cumulative lift: **+0.8 score iter 25 close** (Box Morfismo Sense 2 +0.25 + Box 3 RAG +0.15 + Box Modalità +0.4).

Sprint T iter 25 close target ONESTO: **9.95/10** (depend ADR-023 Onniscenza + ADR-024 Onnipotenza + ADR-026 Content Safety + ADR-025 Modalità + ADR-027 Volumi Narrative tutti chiusi).

---

## 6. Migration script `scripts/migrate-lesson-paths-flat-to-narrative.mjs`

### 6.1 Logic outline

```javascript
import fs from 'fs/promises'
import path from 'path'

const FLAT_DIR = 'src/data/lesson-paths'
const NARRATIVE_DIR = 'src/data/lesson-paths-narrative'
const ALIGNMENT_MD = 'automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md'
const VOLUME_REFS = 'src/data/volume-references.js'

async function migrate() {
  // 1. Parse alignment audit Mac Mini D3 → mapping flat experimentId → capitolo + variation_id
  const alignment = parseAlignmentMd(ALIGNMENT_MD)
  
  // 2. Load all 92 flat lesson-paths
  const flatFiles = await fs.readdir(FLAT_DIR)
  const flatLessonPaths = await Promise.all(flatFiles.map(loadJson))
  
  // 3. Group by capitolo (es. v1-cap6 → [esp1, esp2, esp3, esp4])
  const grouped = groupByCapitolo(flatLessonPaths, alignment)
  
  // 4. For each capitolo, build narrative schema
  const narrative = []
  for (const [chapterId, esperimenti] of Object.entries(grouped)) {
    const volPagCanonical = inferVolPagCanonical(esperimenti)
    const narrativeIntro = loadBookTextVerbatim(VOLUME_REFS, chapterId, 'intro')
    const narrativeOutro = loadBookTextVerbatim(VOLUME_REFS, chapterId, 'outro')
    const themes = inferThemes(esperimenti)
    
    const variations = esperimenti
      .sort((a, b) => a.step - b.step)
      .map((esp, idx) => ({
        variation_id: `${chapterId}-var${idx + 1}`,
        step: idx + 1,
        title: esp.title,
        vol_pag_canonical: esp.volPag,
        components: esp.components,
        instructions_book_text_verbatim: loadBookTextVerbatim(VOLUME_REFS, esp.id, 'instructions'),
        expected_state: esp.expected,
        modes_entry_state: {
          Percorso: 'passive_view',
          'Passo-Passo': `build_step_${idx + 1}`,
          GiaMontato: idx === esperimenti.length - 1 ? 'final_assembled_state' : 'passive_view',
          Libero: 'passive_view_with_proactive_unlim'
        }
      }))
    
    narrative.push({
      chapter: chapterId,
      chapter_title_book: alignment[chapterId].titleBook,
      vol_pag_canonical: volPagCanonical,
      themes,
      narrative_intro_book_text_verbatim: narrativeIntro,
      modes_supported: ['Percorso', 'Passo-Passo', 'GiaMontato', 'Libero'],
      variations,
      narrative_outro_book_text_verbatim: narrativeOutro,
      next_chapter_pointer: alignment[chapterId].nextChapter
    })
  }
  
  // 5. Write 38 narrative files
  await fs.mkdir(NARRATIVE_DIR, { recursive: true })
  for (const ch of narrative) {
    await fs.writeFile(`${NARRATIVE_DIR}/${ch.chapter}.json`, JSON.stringify(ch, null, 2))
  }
  
  // 6. Verify counts + Vol/pag VERBATIM
  console.log(`Migrated ${flatLessonPaths.length} flat → ${narrative.length} narrative`)
  console.log('Run schema validation: npm test -- lesson-paths-narrative-schema')
}

migrate().catch(console.error)
```

### 6.2 Pre-conditions

- Mac Mini D3 audit complete `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` shipped iter 22 close
- `src/data/volume-references.js` 92/92 enriched bookText preserved iter 14 baseline
- Backup `src/data/lesson-paths/` → `src/data/lesson-paths-deprecated-flat/` pre migration

### 6.3 Post-conditions verifica

- 38 narrative files generated `src/data/lesson-paths-narrative/v{N}-cap{M}.json`
- Schema validation 38/38 PASS (`tests/unit/lesson-paths-narrative-schema.test.js`)
- Vol/pag VERBATIM bookText match RAG chunks 100% (`Layer 1 ADR-023 cross-check`)
- `lesson-groups.js` 27 Lezioni mapping aggiornato per capitolo schema
- ZERO breakage existing tests baseline 12599 PASS preserved

---

## 7. Cross-reference

### 7.1 ADR-025 Modalità coupling

ADR-027 schema lesson-paths-narrative `v{N}-cap{M}.json` host 4-mode metadata `modes_entry_state` campo (ADR-025 §5.2 B1 schema extension). Modalità 4 modes (Percorso + Passo-Passo + Già Montato + Libero) implementation iter 22 dipende ADR-027 schema iter 23+:
- **Percorso** = narrative continuum reading (`narrative_intro/outro_book_text_verbatim` + scroll page-by-page)
- **Passo-Passo** = variazione sequenziale (`variations[]` array step navigation)
- **Già Montato** = variazione final state (`variations[last].modes_entry_state.GiaMontato`)
- **Libero** = auto-Percorso entry point (`Layer 4 class_memory.capitolo_corrente` ADR-023)

### 7.2 ADR-026 Content Safety Guard rule 6

Rule 6 Vol/pag VERBATIM cross-check Layer 1 RAG (ADR-026 §4.6) depende ADR-027 schema `vol_pag_canonical` field per ogni variation. Cross-check post-LLM verifica response claims match Vol/pag schema lesson-paths-narrative VERBATIM (closed loop validation cross-mode).

### 7.3 ADR-008 buildCapitoloPromptFragment + ADR-009 Principio Zero

ADR-008 buildCapitoloPromptFragment iter 2 inject Vol/pag VERBATIM prompt (BASE_PROMPT v3) → schema narrative `narrative_intro_book_text_verbatim` field directly compatible (NO refactor ADR-008 needed iter 22). ADR-009 Principio Zero Vol/pag canonical INVARIANT preserved (rule 3 Vol/pag presente ADR-009 base 6 rules → rule 6 ADR-026 estesa).

### 7.4 ADR-023 Onniscenza Layer 1 RAG + Layer 4 class_memory

Layer 1 RAG retrieval narrative continuum aware: cross-link `rag_chunks.chapter_id` → `lesson-paths-narrative.chapter` (NEW field iter 23 migration `rag_chunks` extension). Layer 4 `class_memory.capitolo_corrente` references `lesson-paths-narrative.chapter` field (es. "v1-cap6") → entry point Libero auto-Percorso ADR-025 §4.4.

### 7.5 ADR-021 Box 3 RAG coverage redefine

ADR-021 prep iter 13 ratify Box 3 RAG 1881 chunks coverage redefine post Mac Mini D3 audit. Coupling ADR-027 §4.1 audit alignment shared work scope → unified report `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` covers both lesson-paths refactor + RAG coverage redefine.

### 7.6 ADR-019 Sense 1.5 Morfismo runtime

Schema narrative `themes` + `variations` adatta runtime per età studenti (Layer 4 ADR-023 class_memory.eta_studenti):
- 8-10 anni → variation_1 + variation_2 (semplici, NO capstone)
- 11-14 anni → variations completa fino capstone variation_4
- Livello competenza: base → variation_1 only, avanzato → all variations + Libero

### 7.7 CLAUDE.md DUE PAROLE D'ORDINE Morfismo Sense 2

Morfismo Sense 2 triplet coerenza esterna (kit + volumi + software) = CORE motivation ADR-027:
- Volumi cartacei narrative continuum ↔ software lesson-paths-narrative grouped variazioni stesso tema (post-refactor)
- Vol/pag VERBATIM bookText preserved schema field ↔ ADR-008 prompt injection (closed loop)
- Davide co-author iter 25 review = author volumi voce decisiva narrative consistency (Sense 2 INVARIANT)

---

## 8. Failure modes + graceful degradation

| Failure | Comportamento | Recovery |
|---------|---------------|----------|
| Mac Mini D3 audit SSH block iter 22 | Fallback: architect-opus iter 22 manual audit Vol1 only (subset 38 capitoli → ~6 Vol1 capitoli) → schema partial Vol1 only iter 23 | Mac Mini SSH unblock iter 23 + complete Vol2+3 audit |
| Migration script flat → narrative produce mismatch Vol/pag VERBATIM | Block migration commit + log mismatch list per debug | Tune `loadBookTextVerbatim` mapping logic + re-run |
| Davide iter 25 request major modifiche narrative | Defer iter 26+ Sprint T extension OR Sprint U entry | Andrea decide priorità + scope adjustment |
| Schema validation 38/38 fail >5 file | Block deprecation flat 92 file + fix iterativo schema | Tune schema field optional/required iter 23 |
| Layer 1 RAG cross-link `chapter_id` migration breaks rag_chunks | Defensive: schema extension column nullable + back-fill async | Apply migration iter 23 + nullable column → NOT NULL post back-fill |
| `volume_references.js` 92/92 enriched bookText loss durante refactor | Backup pre-migration MANDATORY (`src/data/volume-references.js.backup-pre-iter-23`) + revert se loss | Restore backup + re-run migration con bookText preserved |

**Test plan failure modes iter 24**: chaos engineering script `scripts/chaos/lesson-paths-narrative-schema-fail.mjs` simula schema corruption + verifica fallback runtime (modalità Percorso fallback to flat lesson-paths-deprecated-flat se narrative load fail).

---

## 9. Andrea ratify queue iter 22 + iter 25

### 9.1 Iter 22 entrance ratify (~5 min)

1. **Schema canonical `lesson-paths-narrative/v{N}-cap{M}.json` Y/N** (this ADR §3 decision)
2. **4-step plan Y/N** (this ADR §4 decision)
3. **Mac Mini D3 audit dispatch Y/N** (precondition SSH unblock iter 22 entrance)
4. **Davide co-author iter 22 review notification** (Andrea contatta Davide schedule)

### 9.2 Iter 25 close ratify (~10 min)

1. **Davide approve narrative flow per capitolo Y/N** (this ADR §4.4 D3 decision)
2. **Schema rivisto + UI refactor approve final Y/N** (this ADR §4.4 D5 decision)
3. **Score Box Morfismo Sense 2 update 0.7 → 0.95 Y/N** (§5.1 decision)
4. **Sprint T iter 25 close 9.95+/10 ONESTO ratify Y/N** (master PDR §4.2)
5. **Deprecation flat 92 file `src/data/lesson-paths-deprecated-flat/` Y/N** (§4.2 B3 decision hard cut-off)

Cross-ref ANDREA-MANDATES-ITER-18-PM-ADDENDUM §6 voce 6 ratify queue iter 25 (Volumi narrative refactor Step 1-4 Davide co-review iter 22).

---

## 10. Activation iter 22 + iter 25 (final)

### 10.1 Iter 22 entrance (Andrea ~5 min + Davide schedule)

1. Approve ADR-027 status PROPOSED → ACCEPTED via comment commit message.
2. Dispatch Mac Mini D3 audit (precondition SSH unblock).
3. Schedule Davide co-author iter 22 review notification.
4. Approve gen-app-opus iter 23 ATOM-S23-B2 spawn (migration script implementation).
5. Approve gen-test-opus iter 23 ATOM-S23-B5 spawn (schema validation tests).

### 10.2 Iter 25 close (Andrea ~10 min + Davide UAT)

1. Davide UAT review 38 capitoli narrative + UI demo Percorso/Passo-Passo/Già Montato.
2. Davide approve OR request modifiche.
3. gen-app-opus apply Davide modifiche se any.
4. Andrea final ratify Box Morfismo Sense 2 0.7 → 0.95.
5. scribe-opus audit Sprint T close + handoff Sprint U entry.

**Iter 22 score target**: Volumi Narrative Box NEW = 0.3 (Mac Mini D3 audit complete + schema canonical ratify).

**Iter 23 score target**: Volumi Narrative Box = 0.6 (38 narrative files + migration script + schema validation tests + lesson-groups update).

**Iter 24 score target**: Volumi Narrative Box = 0.85 (UI Percorso/Passo-Passo/Già Montato/Libero refactor + integration tests).

**Sprint T iter 25 close target ONESTO**: 9.95/10 (Volumi Narrative Box 1.0 + Box Morfismo Sense 2 0.95 + Onniscenza Box 1.0 ADR-023 + Onnipotenza Box 1.0 ADR-024 + Modalità Box 1.0 ADR-025 + Content Safety Box 1.0 ADR-026 + Sense 1.5 morfismo runtime tuning live ADR-019).

**End ADR-027**.
