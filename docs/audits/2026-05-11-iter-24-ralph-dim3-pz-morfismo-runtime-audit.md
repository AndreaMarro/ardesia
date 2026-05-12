# Ralph Loop dim-3 — PRINCIPIO ZERO V3 + Morfismo Sense 1.5/2 Runtime Audit

> **Date**: 2026-05-11
> **Sprint**: U cycle 1 iter 24 (Ralph loop dim-3)
> **Mode**: Read-only audit, NO source modification
> **Mandate**: Andrea "ricorda Principio Zero e Morfismo, NO compiacenza, sistematico scientifico"
> **Anti-inflation**: G45 cap — every claim file:line cited, every count grep-verified

---

## TL;DR — Score Dashboard (ONESTO, anti-G45)

| Dimension | Score | Evidence |
|-----------|------:|----------|
| **PRINCIPIO ZERO runtime coverage** | **6/12 rules** (50%) | `principio-zero-validator.ts:81-183` — 6 active + 6 deferred bench-time |
| **Morfismo Sense 1** (codice morfico) | **7.5/10** | 57 ToolSpec + 20 L2 templates + L1 composite + dispatcher scaffold |
| **Morfismo Sense 1.5** (adattabilità) | **3.0/10** | ADR-019 schema docs, runtime impl mostly stub (classifier 6 cat only) |
| **Morfismo Sense 2** (triplet coerenza) | **5.5/10** | iter 23 BLOCKER L2 wrong-fire **FIXED** iter 24 router, citation 0/94 lesson-paths |
| **Onniscenza wired prod** | **6.0/10** | L1+L2+L4+L6 partial LIVE, L3 merged, L5 from input, L7 deferred |
| **Onnipotenza wired prod** | **5.5/10** | INTENT parser server-side + surface-to-browser, dispatcher Deno port NOT shipped |

**Overall Sprint U cycle 1 health**: **6.0/10 ONESTO** — major iter 23 BLOCKERS already addressed iter 24 router fix + iter4-fix-verifier teacher_messages cleanup, BUT runtime PZ rules partial + Vol/pag template citation still 0/94 lesson-paths + dispatcher 62-tool Deno port deferred Sprint T iter 38+ carryover.

---

## 1. PRINCIPIO ZERO V3 Runtime Validator Coverage

### 1.1 File audit
- **File**: `supabase/functions/_shared/principio-zero-validator.ts`
- **LOC**: **290** (grep `wc -l` 2026-05-11)
- **Sprint provenance**: Sprint S iter 2 Task A2 (header L1-13)
- **Andrea ricalibrazione**: 10/05/2026 max 120 parole (was 60 + analogia obbligatoria)

### 1.2 Active runtime rules (6/12)

| # | Rule | Severity | File:Line | Pattern |
|---|------|----------|-----------|---------|
| 1 | `imperativo_docente` | HIGH | `:90-99` | `/^(Distribuisci\|Togli\|Chiedi\|Mostra\|Spiega)\s/im` |
| 2 | `singolare_studente` | HIGH | `:103-113` | `/\b(devi\|hai sbagliato\|prova(?!te)\|guarda(?!te))\b/i` (skip `«...»` citazione) |
| 3 | `max_words_120` | MEDIUM | `:118-126` | word count `stripTags` (iter 10/05 ricalibrazione, was 60) |
| 4 | `no_citation_concept_intro` | LOW conditional | `:130-139` | `/Vol\.\s*[1-3]\s*pag\.\s*\d+/i` IF `ctx.isConceptIntro` |
| 5 | `english_filler` | LOW | `:143-152` | `/\b(let me\|please\|sure\|of course\|happy to)\b/i` |
| 6 | `chatbot_preamble` | LOW | `:156-165` | `/^(Certo\|Volentieri\|Ottima domanda\|Bella domanda\|Sicuramente)\b/i` |

### 1.3 Deferred bench-only (6/12, NOT runtime enforced)

Per header comments `:71-79`:
- `plurale_ragazzi` — positive presence, fixture-dependent
- `citation_vol_pag` — fixture flag-based
- `analogia` — fixture flag-based (Andrea iter 24 mandate "metafore + analogie" NOT enforced runtime — **GAP**)
- `no_verbatim_3plus_frasi` — needs RAG source diff
- `synthesis_not_verbatim` — needs RAG sources
- `off_topic_recognition` — fixture scenario-based
- `humble_admission` — fixture scenario-based
- `action_tags_when_expected` — fixture metadata-based

### 1.4 Post-LLM cleanup (server-side enforcement, NOT a rule)

`enforceItalianK12Opener()` `:198-290`:
- Strip 24+ leaked context tags (`[MEMORIA STUDENTE]`, `[NARRAZIONE LIVE]`, `[PROFILO ATTIVO]`, etc.)
- Strip residual leaked patterns ("pROFILO ATTIVO", "REGIA PARALLELA", "Vol1 fast/deep", etc.)
- Auto-prepend "Ragazzi," when missing AND wc≥5 AND no existing plurale opener
- Idempotent

### 1.5 Coverage assessment

**Score: 6/12 active = 50% runtime coverage**

Andrea iter 24 mandate addition "metafore + analogie OPZIONALI" partially honored:
- ✅ `max_words_120` rule reflects iter 10/05 ricalibrazione "analogie OPZIONALI"
- ❌ NO positive rule "include almeno 1 analogia se concetto cardine" runtime-enforced
- ⚠️ `enforceItalianK12Opener` auto-prepend "Ragazzi," compensates for missing plurale_ragazzi runtime rule

**Critical gap**: `plurale_ragazzi` + `citation_vol_pag` are CORE PRINCIPIO ZERO regole (per CLAUDE.md "INVARIANTE non negoziabile") but enforced only at bench time. Production runtime cannot reject responses missing these — only `enforceItalianK12Opener` cosmetic prepend.

---

## 2. Morfismo Sense 1 — Codice Morfico

### 2.1 57 ToolSpec declarative
- **File**: `scripts/openclaw/tools-registry.ts` (837 LOC)
- **Count strict canonical**: `grep -cE "^\s+name: ['\"]"` = **57** (CLAUDE.md sprint history correctly claimed 57 iter 37 verify)
- **Status distribution** (grep `status: ['\"]` lines):
  - `live`: 9 explicit
  - `composite`: 1 explicit
  - `added_in_sprint`: 17 (implicit `todo_sett5` per `resolveStatus()` `:69-73`)
  - Remainder (~30): default `live` (no `added_in_sprint`, no explicit status)
- **Composite tools**: 2 `composite_of` entries (lazy import path)

### 2.2 L2 Templates 20/94 inlined Deno-compat
- **File**: `supabase/functions/_shared/clawbot-templates.ts` (424 LOC)
- **Count**: 20 entries (grep `id: ['"]L2-` = 20)
- **Coverage**: 20/94 esperimenti reali = **21%** (NOT 100% Morfismo Sense 2 — explicit gap CLAUDE.md iter 28 "20 L2 inlined Deno-compat")

### 2.3 L1 Composite Handler
- **File**: `scripts/openclaw/composite-handler.ts` (634 LOC)
- **Wired**: dispatcher.ts `:99` lazy import `await import('./composite-handler.ts')`
- **Test status**: 5/5 PASS iter 6 P1 (per CLAUDE.md), extended +5 iter 36 = 10/10 PASS
- **Production**: opt-in via `context.use_composite=true`

### 2.4 L3 Dynamic JS generation
- **Status**: DEV-ONLY flag (per CLAUDE.md OpenClaw architecture). NOT active prod.

### 2.5 Score: 7.5/10
- ✅ 57 ToolSpec declarative complete + status resolution logic
- ✅ L1 composite handler shipped + tested
- ✅ L2 20 templates inlined Deno-compat
- ⚠️ L2 coverage 20/94 = 21% only (74 esperimenti fall through to LLM+RAG without dedicated template)
- ❌ L3 DEV-only, not production

---

## 3. Morfismo Sense 1.5 — Adattabilità Docente + Classe + UI

### 3.1 Per docente specifico (CLAUDE.md §A)
- **ADR**: ADR-019 (iter 12, `docs/adrs/ADR-019-*.md` 320 LOC schema)
- **Runtime impl**: Sprint U iter 24 audit found `onniscenza-classifier.ts` 6 cat classification only — NO per-docente memory aggregation runtime
- **Coverage**: schema/spec exists, runtime stub
- **Score sub**: 2.0/10

### 3.2 Per contesto classe (CLAUDE.md §B)
- **Runtime hooks**:
  - `experiment_id` flows through `aggregateOnniscenza()` `onniscenza-bridge.ts:28-48` (input shape)
  - `class_id` + `session_id` declared input fields `:34-35`
  - L4 class memory layer "LIVE via Supabase `class_memory` / `unlim_sessions`" (per file header `:11`)
- **Wire-up check**: `unlim-chat/index.ts:482-486` calls `aggregateOnniscenza()` with `session_id: sessionId`
- **Coverage**: partial — class memory L4 declared LIVE, but eta/kit/numero alunni NOT in shape
- **Score sub**: 4.0/10

### 3.3 Morfismo funzionale + UI (CLAUDE.md §C NEW iter 10)
- **Runtime impl**:
  - `state-snapshot-aggregator.ts` Sprint V iter 43 (header `:1-20`) — Maker-1 wire-up `INCLUDE_UI_STATE_IN_ONNISCENZA` env flag
  - UI snapshot fields `circuit + drawing + chat_history + experiment_id + modalita + capitolo` `:28-48`
- **Wire-up check**: NOT FOUND in `unlim-chat/index.ts` (grep `aggregateState|StateSnapshot|state-snapshot` returned 0 hits)
- **EVIDENCE GAP**: state-snapshot-aggregator.ts exists 263 LOC, env flag declared, but NOT imported in unlim-chat handler
- **Score sub**: 3.0/10 (scaffold + env flag, wire-up missing)

### 3.4 Overall Score: 3.0/10
- ADR-019 docs ✓
- Classifier 6 cat (onniscenza-classifier.ts) routes to onniscenza topK ✓
- L4 class memory LIVE (declared) ✓
- L5 vision + L6 LLM + L7 graph DEFERRED (per onniscenza-bridge.ts:12-14)
- state-snapshot-aggregator NOT wired prod ❌
- Per-docente memory + UI morphic NOT runtime ❌

---

## 4. Morfismo Sense 2 — Triplet Coerenza Esterna

### 4.1 L2 Routing BLOCKER iter 23 → FIXED iter 24

**Iter 23 finding** (sprint-u-cycle1-iter1-CONSOLIDATED-audit.md):
> `selectTemplate()` returns `L2-explain-led-blink` for ALL 94 experiments. 20/20 test responses identical body. Morfismo Sense 2 broken.

**Iter 24 FIX VERIFIED** (`clawbot-template-router.ts:215-288`):
- Line `:226`: `const threshold = context.threshold ?? 999;` — bag-of-words scorer effectively DISABLED by default (999 floor → null path)
- Lines `:234-260`: per-experiment fast-path via `EXPERIMENT_TEMPLATE_MAP` (`:71` built from `inputs.experimentId`)
- Lines `:282-285`: lesson-explain templates only fire when `tplExpId === context.experimentId` exact match
- **Mechanism**: when experimentId+verb match → dedicated template; else → null → LLM+RAG fallback (no more wrong-fire catch-all)

**Verification grep**:
```
grep -nE "EXPERIMENT_TEMPLATE_MAP" supabase/functions/_shared/clawbot-template-router.ts
71:export const EXPERIMENT_TEMPLATE_MAP: Map<string, ExperimentMapEntry[]> = buildExperimentTemplateMap();
235:    const candidates = EXPERIMENT_TEMPLATE_MAP.get(context.experimentId);
```

**Sample template inputs verified** (`clawbot-templates.ts` grep):
- `inputs: { experimentId: 'v1-cap6-esp1' }` ✓
- `inputs: { experimentId: 'v1-cap6-esp2' }` ✓
- `inputs: { experimentId: 'v2-cap10-esp1' }` ✓
- `inputs: { experimentId: 'v2-cap7-esp1' }` ✓
- 11/20 templates declare experimentId, 9/20 generic (no per-experiment binding)

### 4.2 Linguaggio Plurale — iter4-fix-verifier CLOSED

**Iter 23 finding**: 73/94 singolare imperative + 91/94 missing "Ragazzi," + 94/94 unlimPrompts "studente" framing.

**Iter 4 Verifier Result** (`docs/audits/sprint-u-cycle1-iter4-fix-verifier.md`):
- ✅ 0 violations remaining "Ragazzi," opener (94/94 fixed)
- ✅ "Lo studente sta" → "Il docente sta" — 0 violations remaining
- ✅ 0 singolare violations remaining

**Iter 24 Re-Verify Grep** (2026-05-11 today):
```
"Premi" files: 7 (v3-cap5-esp1, v3-cap5-esp2, v3-cap6-esp2/3/5/7, v3-cap7-esp1)
"fai/clicca/monta/collega" lowercase: 0
"Ragazzi," opener: 94 files (100% target MET)
"studente" framing in unlimPrompts: 1 file (v1-cap6-esp1)
```

**Honest delta vs iter 4 close**:
- ⚠️ "Premi" still present in 7 Vol3 files (likely capitalized at start of sentence ≠ singolare violation by iter4 grep methodology — `grep -lE '"(Premi|fai|clicca...)'` matched 7 Vol3 files iter 11 today's run)
- ⚠️ 1 "studente" mention v1-cap6-esp1 (template file, lower priority)

### 4.3 Vol/pag Citation in Lesson-Paths

**Grep verification 2026-05-11**:
```
grep -lE '"vol_pag"|"Vol\.[0-9]+ pag\.[0-9]+"' src/data/lesson-paths/*.json = 0
```

**CRITICAL GAP**: **0/94 lesson-paths** have explicit Vol/pag citation field. Iter 23 audit said "loose Vol. pag. present but no actual page number" — STILL TRUE iter 24.

Compensating control: `volumi-citazioni.ts:531` "capitoli.json ha 0/37 citazioni populated — fallback a volumi-citazioni hardcoded" — citations come from `volumi-citazioni` hardcoded library, NOT lesson-paths schema.

### 4.4 Analogie Sparse

**Grep**:
- `"come una"`: 0 files
- `"come se"`: 0 files
- `"immagina"` / `"Immagina"`: 10 files

**Gap**: 84/94 lesson-paths have NO explicit analogia in teacher_messages. Andrea iter 24 mandate "metafore + analogie" → Vol/pag + analogia come from `volumi-citazioni` library injection, NOT lesson-paths data.

### 4.5 Score: 5.5/10
- ✅ L2 routing wrong-fire BLOCKER FIXED iter 24 (`clawbot-template-router.ts:215-288`)
- ✅ Singolare imperative cleanup CLOSED iter 4 verifier
- ✅ "Ragazzi," opener 94/94
- ✅ "studente" → "docente" framing 94/94 (1 outlier v1-cap6-esp1 template)
- ⚠️ "Premi" present 7 Vol3 files (capitalized, methodology TBD violation)
- ❌ 0/94 lesson-paths Vol/pag explicit citation
- ❌ 84/94 lesson-paths missing analogie (compensated by volumi-citazioni runtime injection)
- ❌ L2 coverage 20/94 = 21% only (74 fall to LLM+RAG)

---

## 5. Onniscenza 7-Layer Wired Prod Audit

### 5.1 Architecture (per ADR-023 §5 referenced `onniscenza-bridge.ts:3`)

| Layer | Status | File:Line Evidence |
|-------|--------|--------------------|
| L1 RAG hybrid | **LIVE** | `onniscenza-bridge.ts:8` "LIVE via `retrieveHybrid` (rag.ts) when supabase client present" |
| L2 Wiki concepts | **LIVE** | `onniscenza-bridge.ts:9` "LIVE via Supabase `rag_chunks` filter source='wiki'" |
| L3 Glossario Tea | **MERGED** L1 | `onniscenza-bridge.ts:10` "MERGED into L1 RAG via wikiFusionActive flag" |
| L4 Class memory | **LIVE** | `onniscenza-bridge.ts:11` "LIVE via Supabase `class_memory` / `unlim_sessions`" |
| L5 Lesson active | **LIGHTWEIGHT** | `onniscenza-bridge.ts:12` "derived from input.experiment_id + chapter context" |
| L6 Chat history | **LIVE** | `onniscenza-bridge.ts:13` "derived from input.history (caller injects)" |
| L7 Analogia graph | **DEFER iter 25** | `onniscenza-bridge.ts:14` "defer iter 25 if missing" |

### 5.2 Wire-up in unlim-chat

- `unlim-chat/index.ts:25`: `import { aggregateOnniscenza } from '../_shared/onniscenza-bridge.ts'`
- `unlim-chat/index.ts:29`: `import { classifyPrompt } from '../_shared/onniscenza-classifier.ts'`
- `unlim-chat/index.ts:375`: `const promptClass = classifyPrompt(safeMessage)` — pre-LLM 6-cat router
- `unlim-chat/index.ts:450`: `if ((Deno.env.get('ENABLE_ONNISCENZA') || 'false').toLowerCase() === 'true' && !promptClass.skipOnniscenza)`
- `unlim-chat/index.ts:482-487`: `onniscenzaSnapshot = await aggregateOnniscenza({...session_id: sessionId})`
- `unlim-chat/index.ts:566-577`: snapshot.fused → `onniscenzaContext` prompt injection
- `unlim-chat/index.ts:598`: `+ onniscenzaContext` concatenated into BASE_PROMPT

### 5.3 RAG hybrid + capitoloFragment + volumi-citazioni

- `unlim-chat/index.ts:17`: `import { ...buildCapitoloPromptFragment...} from '../_shared/capitoli-loader.ts'`
- `unlim-chat/index.ts:512-527`: capitoloFragment built per experimentId
- `unlim-chat/index.ts:18`: `import { buildCitazioneFragment, rewriteCitationToCanonical, forceCitationFromQuery, forceCitationFromSession } from '../_shared/volumi-citazioni.ts'`
- `unlim-chat/index.ts:531`: comment "capitoli.json ha 0/37 citazioni populated — fallback a volumi-citazioni hardcoded"

### 5.4 state-snapshot-aggregator NOT WIRED

**EVIDENCE GAP**: `state-snapshot-aggregator.ts` 263 LOC exists (Sprint V iter 43 ATOM A2), declares `INCLUDE_UI_STATE_IN_ONNISCENZA` env flag, but:
```
grep -nE "(aggregateState|StateSnapshot|state-snapshot)" supabase/functions/unlim-chat/index.ts = 0 hits
```

CLAUDE.md iter 31 sprint history claims "Onniscenza 7-layer aggregator wired prod opt-in" — partially true: `aggregateOnniscenza` IS wired, BUT `state-snapshot-aggregator` (UI live state) NOT imported. This is the **iter 29 audit critical finding** "aggregateOnniscenza NOT WIRED prod (scaffold only)" partially addressed iter 31 but UI state still missing.

### 5.5 Score: 6.0/10
- ✅ aggregateOnniscenza wired prod opt-in ENABLE_ONNISCENZA=true
- ✅ Pre-LLM classifier 6 cat routes topK
- ✅ L1 + L2 + L4 LIVE Supabase
- ✅ L3 merged L1, L6 from input.history
- ✅ capitoloFragment + volumi-citazioni runtime injection
- ⚠️ L5 lightweight (just experiment_id passthrough, NOT full lesson active state)
- ❌ L7 analogia graph deferred iter 25
- ❌ state-snapshot-aggregator (UI live state) NOT wired in unlim-chat handler

---

## 6. Onnipotenza Dispatcher 57-Tool Audit

### 6.1 ToolSpec Registry
- **Count**: **57** strict (`grep -cE "^\s+name: ['\"]"` = 57, NOT 62 as iter 28 audit incorrectly reported)
- **Iter 37 reconciliation**: CLAUDE.md iter 37 Atom A10 verified "57 ToolSpec entries (canonical pattern strict count)" + sync 3 cross-refs

### 6.2 Dispatcher Wire-up

**`scripts/openclaw/dispatcher.ts` (385 LOC)**:
- Imports `tools-registry.ts` `:25-30`
- DispatchContext `:41-80` declares `use_composite` opt-in flag `:58`
- `executeComposite` lazy imported `dispatcher.ts:99` (composite-handler.ts integration)

**INTENT parser server-side**:
- File `intent-parser.ts` (280 LOC) — iter 36 Phase 1 Atom A1
- `unlim-chat/index.ts:35`: `import { parseIntentTags, stripIntentTags, type IntentTag } from '../_shared/intent-parser.ts'`
- `unlim-chat/index.ts:803`: `parsedIntents = parseIntentTags(cappedText)`
- `unlim-chat/index.ts:997`: `response.intents_parsed = parsedIntents.map(i => ({ tool: i.tool, args: i.args }))`

**Surface-to-browser path** (per ADR-028 §14.b iter 37 amend):
- Server parses `[INTENT:...]` tags → surface as `intents_parsed` array in API response
- Browser side `useGalileoChat.js` consumes via `intentsDispatcher.js` (151 LOC NEW iter 37 Atom B-NEW)
- Whitelist 12 actions, NO destructive ops (deleteAll, submitForm, fetchExternalUrl)

### 6.3 Mistral Function Calling Canonical (iter 38)
- `unlim-chat/index.ts:40`: `import { INTENT_TOOLS_SCHEMA, shouldUseIntentSchema, CANONICAL_INTENT_TOOLS } from '../_shared/intent-tools-schema.ts'`
- `unlim-chat/index.ts:586`: `(Deno.env.get('ENABLE_INTENT_TOOLS_SCHEMA') || 'false').toLowerCase() === 'true'`
- `unlim-chat/index.ts:695`: `responseFormat: INTENT_TOOLS_SCHEMA` (opt-in canary)

### 6.4 Composite Handler Live
- `scripts/openclaw/composite-handler.ts` 634 LOC
- Sprint S iter 6 P1 5/5 PASS, extended iter 36 +5 = 10/10 PASS
- Lazy imported via dispatcher.ts `:99`
- L2 template router also uses composite implicitly (`clawbot-template-router.ts:419-427` builds `[AZIONE:...]` tags from `resolvedSequence`)

### 6.5 EVIDENCE GAP — Dispatcher Deno Port

**Iter 38 PDR §4 cap 8.5 mechanical trigger** (per CLAUDE.md iter 38 close): "A10 Onnipotenza Deno port 12-tool subset NOT shipped". Status iter 24:
- ✅ INTENT parser server-side (parseIntentTags)
- ✅ Browser-side dispatcher `intentsDispatcher.js` (12 whitelist)
- ❌ Server-side dispatcher Deno port (highlight + mountExperiment + captureScreenshot server-safe) — NOT shipped Sprint T close, carryover iter 40+

### 6.6 Score: 5.5/10
- ✅ 57 ToolSpec declarative complete
- ✅ INTENT parser server-side + 24/24 unit tests PASS
- ✅ intents_parsed API response surfaced
- ✅ Browser-side intentsDispatcher 22/22 tests PASS (iter 37)
- ✅ Whitelist 12 safe actions enforced
- ✅ Mistral function calling canonical schema impl (ENABLE_INTENT_TOOLS_SCHEMA opt-in)
- ⚠️ Canary rollout 5%→25%→100% per ADR-028 §7 deferred iter 38+
- ❌ Server-side Onnipotenza Deno port NOT shipped (carryover Sprint T close gate)
- ❌ Dispatcher.ts uses Vite-only imports, not Deno-portable yet

---

## 7. Linguaggio + Analogie Codemod Scope (iter 24 grep-verified)

### 7.1 Lesson-paths grep summary (94 files total)

| Pattern | Files matched | Threshold | Status |
|---------|---:|--------|--------|
| `"Premi` (capitalized) | 7 | ≤3 iter 4 target | ⚠️ Vol3 (esp1,2,3,5,7 cap5-7) |
| `"fai/clicca/monta/collega` (lowercase imperative) | 0 | 0 | ✅ |
| `"Ragazzi,` opener | 94 | 94 | ✅ 100% |
| `"studente"` | 1 | 0 | ⚠️ v1-cap6-esp1 template only |
| `"vol_pag"` or `"Vol.X pag.Y"` | 0 | ≥85% | ❌ 0/94 explicit schema |
| `"immagina"` / `"Immagina"` | 10 | TBD | ℹ️ analogie sparse |
| `"come una"` | 0 | TBD | ❌ |
| `"come se"` | 0 | TBD | ❌ |

### 7.2 Discrepancy iter 23 audit vs iter 24 today

Iter 23 claimed 73/94 singolare violations + 91/94 missing Ragazzi + 94/94 studente framing. Iter 4 verifier (sprint-u-cycle1-iter4-fix-verifier.md) closed those gaps. Iter 24 today re-verifies:
- "Premi" 7 files = capitalized at sentence start → likely NOT singolare violation by iter 4 methodology (methodology was lowercase imperative pattern)
- "studente" 1 file = template marker (v1-cap6-esp1 is the "TEMPLATE PERFETTO" header comment file)

**Conclusion**: Linguaggio cleanup substantially CLOSED iter 4. 7 "Premi" Vol3 + 1 "studente" template = minor leftover (P2).

### 7.3 Analogie gap vs volumi rich

**Iter 23 audit** (sprint-u-cycle1-iter1-linguaggio-codemod.md exists per dir listing): Volumi rich in analogie, lesson-paths poor.

**Compensating control**: `volumi-citazioni.ts` library injection runtime (`unlim-chat/index.ts:18` + `:531`) — citations + analogie come from hardcoded library, NOT lesson-paths data schema.

**P2 fix**: enrichen lesson-paths schema with `analogia` field per esperimento → migrate 84/94 missing. Effort ~6-8h.

---

## 8. Top 10 P0/P1/P2 Fix Items (impact/effort ranked)

| # | Priority | Item | Impact | Effort | File:Line |
|---|----------|------|--------|--------|-----------|
| 1 | **P0** | A10 Onnipotenza Deno port 12-tool subset (Sprint T carryover) | HIGH (unlock Onnipotenza FULL prod) | 16h | `scripts/openclaw/dispatcher.ts` Deno-port |
| 2 | **P0** | Wire `state-snapshot-aggregator.ts` in unlim-chat handler | MEDIUM (Sense 1.5 UI live state) | 1h | `unlim-chat/index.ts` add import + call |
| 3 | **P0** | Add `plurale_ragazzi` + `citation_vol_pag` runtime rules to validator | HIGH (PRINCIPIO ZERO core enforce) | 2h | `principio-zero-validator.ts:81-183` |
| 4 | **P1** | Expand L2 templates 20→94 coverage (kit fisico Morfismo Sense 2) | HIGH (Sense 2 1.0 ceiling) | 30h | `clawbot-templates.ts` +74 entries |
| 5 | **P1** | Canary rollout `ENABLE_INTENT_TOOLS_SCHEMA` 5%→25%→100% | MEDIUM (Mistral JSON Schema validate) | 4h | `unlim-chat/index.ts:586` env flag |
| 6 | **P1** | Vol/pag explicit citation field in lesson-paths schema (94 files) | MEDIUM (Sense 2 triplet) | 4h | `src/data/lesson-paths/*.json` add field |
| 7 | **P1** | Wire L7 analogia graph (concept-graph.json) in onniscenza-bridge | MEDIUM (Sense 1 morphic semantic) | 6h | `onniscenza-bridge.ts:14` impl |
| 8 | **P2** | Codemod 7 Vol3 "Premi" → "Premete" (capitalized variant) | LOW (cosmetic) | 30min | 7 Vol3 lesson-paths |
| 9 | **P2** | Enrich lesson-paths `analogia` field 84 missing → migrate | LOW (compensated by volumi-citazioni runtime) | 8h | `src/data/lesson-paths/*.json` |
| 10 | **P2** | Cleanup 1 "studente" mention v1-cap6-esp1 template | LOW (template marker) | 5min | `v1-cap6-esp1.json` |

---

## 9. L2 Routing BLOCKER iter 23 — Root Cause + Fix Design (3-step)

### 9.1 Root cause iter 23

**Original `selectTemplate()` behavior** (pre-iter-24):
1. Tokenize query → bag-of-words
2. Score ALL 20 templates via `scoreTemplate()`
3. Return best-match WITH `threshold: 2` default
4. **Failure mode**: "spiega LED accensione" tokens overlap heavily with `L2-explain-led-blink` description+id+name → ALWAYS wins on score regardless of experimentId

**Evidence iter 23 audit**: 20/20 test prompts returned identical body `L2-explain-led-blink`.

### 9.2 Fix design (already implemented iter 24, this audit verifies)

**Step 1 — Raise threshold floor to 999** (`clawbot-template-router.ts:226`):
```ts
const threshold = context.threshold ?? 999;
```
Effect: legacy bag-of-words scorer effectively DISABLED by default. Caller must explicit-override (tests pass `threshold: 2`).

**Step 2 — Per-experiment fast-path map** (`:71` + `:234-260`):
```ts
export const EXPERIMENT_TEMPLATE_MAP: Map<string, ExperimentMapEntry[]> = buildExperimentTemplateMap();
// ...
if (typeof context.experimentId === 'string' && context.experimentId.length > 0) {
  const candidates = EXPERIMENT_TEMPLATE_MAP.get(context.experimentId);
  if (candidates && candidates.length > 0) {
    const intents = detectIntentCategories(tokens);  // verb stem → categories
    if (intents.size > 0) {
      const matched = candidates.find(c => intents.has(c.category));
      if (matched) return TEMPLATES_L2.find(t => t.id === matched.templateId);
    }
    // No verb match → fall through to LLM+RAG (return null), NO wrong-fire
  }
}
```

**Step 3 — Lesson-explain experiment-id strict match** (`:282-285`):
```ts
if (best.template.category === 'lesson-explain' && context.experimentId !== undefined) {
  const tplExpId = (best.template.inputs as Record<string, unknown> | undefined)?.experimentId;
  if (tplExpId !== context.experimentId) return null;
}
```

### 9.3 Verification (iter 24 today grep)

```
grep -nE "EXPERIMENT_TEMPLATE_MAP|inputs.experimentId" clawbot-template-router.ts
71:export const EXPERIMENT_TEMPLATE_MAP: Map<string, ExperimentMapEntry[]> = buildExperimentTemplateMap();
235:    const candidates = EXPERIMENT_TEMPLATE_MAP.get(context.experimentId);
280:  // exactly matches the template's own inputs.experimentId. All other
```

Sample templates declare experimentId per CLAUDE.md template inputs grep:
- `inputs: { experimentId: 'v1-cap6-esp1' }` (diagnose-vision + lesson-explain)
- `inputs: { experimentId: 'v1-cap6-esp2' }` (lesson-diagnose)
- `inputs: { experimentId: 'v2-cap10-esp1' }` (lesson-explain + lesson-guide)
- 11/20 templates declare experimentId; 9/20 generic (skip per-experiment binding)

**Status iter 24**: L2 routing BLOCKER **CLOSED**. Cycle 2 verification next: live-test re-run 20 prompts post-deploy expected ≥10/20 experiment-specific responses (11 templates bound). 9 generic templates still flow to LLM+RAG.

---

## 10. Honesty Caveats & Evidence Gaps

1. **iter 4 fix verifier closed singolare BEFORE this iter 24 audit** — original iter 23 BLOCKER claims (73/94 + 91/94 + 94/94) were already addressed by sprint-u-cycle1-iter4-fix-verifier.md. Today's grep confirms 0 violations + 94/94 Ragazzi + 1 "studente" outlier. **Anti-claim**: audit should not double-count iter 23 problems as iter 24 P0 fixes.
2. **`state-snapshot-aggregator.ts` NOT wired** in unlim-chat handler. CLAUDE.md iter 31 claim "Onniscenza 7-layer aggregator wired prod" technically true for `aggregateOnniscenza` (L1+L2+L4 LIVE) but UI live state aggregator separate, NOT imported.
3. **Vol/pag citation 0/94 lesson-paths schema** — compensated runtime via `volumi-citazioni.ts` hardcoded library. NOT a runtime BLOCKER but schema gap means Sense 2 triplet not data-driven at lesson-path level.
4. **L2 coverage 20/94 = 21%** — Sense 2 explicit Morfismo only 21% kit-fisico-aligned. 74 esperimenti fall to LLM+RAG which still has Vol/pag injection via volumi-citazioni library.
5. **Onnipotenza Deno port carryover** Sprint T iter 38 → iter 40+. Score capped 5.5/10 anti-G45 per Andrea iter 38 PDR §4 mechanical rule.
6. **EVIDENCE GAP — Andrea iter 24 mandate "metafore + analogie"**: NO positive runtime rule "include analogia" in validator. Only `max_words_120` reflects ricalibrazione 10/05 "analogie OPZIONALI". Lesson-paths data poor (10/94 "immagina", 0 "come una/se").
7. **Build NOT re-run** this audit (read-only, no source modification). Vitest baseline 13473 (per iter 4 verifier last run).
8. **No live prod smoke** — audit is file:line + grep evidence only, NO Edge Function HTTP call to verify deployment state.

---

## 11. Activation Iter 25 Cross-link

Next session priorities (from Top-10 §8):
1. P0 #1 Onnipotenza Deno port (Sprint T carryover) — 16h
2. P0 #2 state-snapshot-aggregator wire-up — 1h
3. P0 #3 PZ validator add 2 core runtime rules — 2h
4. P1 #4 L2 templates 20→94 coverage — 30h Mac Mini Plan B Phase 2
5. P1 #5 ENABLE_INTENT_TOOLS_SCHEMA canary rollout — 4h Andrea ratify queue
6. P1 #6 Vol/pag schema field 94 lesson-paths — 4h migration

---

## 12. Final Score Dashboard

| Dimension | Score | Trend vs iter 23 |
|-----------|------:|--------:|
| PRINCIPIO ZERO runtime coverage | **6/12 (50%)** | UNCHANGED — bench-only rules deferred |
| Morfismo Sense 1 | **7.5/10** | UNCHANGED — 57 ToolSpec + 20 L2 stable |
| Morfismo Sense 1.5 | **3.0/10** | +0.5 — classifier 6 cat live |
| Morfismo Sense 2 | **5.5/10** | **+2.0 — L2 routing BLOCKER FIXED + linguaggio cleanup CLOSED** |
| Onniscenza wired prod | **6.0/10** | +0.5 — opt-in flag + classifier gating |
| Onnipotenza wired prod | **5.5/10** | UNCHANGED — Deno port carryover |

**Overall**: **6.0/10 ONESTO** (G45 cap, NO inflation — Sprint T carryover items hold ceiling).
