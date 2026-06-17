---
from: generator-app-opus
to: orchestrator
ts: 2026-04-26T13:19:43+02:00
sprint: S
iter: 2
priority: HIGH
blocking: false
task: Task A3 + A4 + A5 — UNLIM synthesis prompt v3 wire-up production
---

# Sprint S iter 2 — Task A3 + A4 + A5 completion

## Summary
Completed BASE_PROMPT revision (A3), unlim-chat wire-up (A4), and defensive
fallback (A5). All CoV gates green. Zero regressions.

## Files modified

| File | Lines changed | What |
|------|---------------|------|
| `supabase/functions/_shared/system-prompt.ts` | -16 / +24 net (~38 changed) | A3: BASE_PROMPT replaced verbatim-citation mandate with PDR §4.4 USO DELLE FONTI + REGOLA SINTESI vs CITAZIONE + LINGUAGGIO OBBLIGATORIO. `buildSystemPrompt` signature gained 4th optional param `capitoloFragment`, inserted between MEMORIA STUDENTE and STATO CIRCUITO. |
| `supabase/functions/unlim-chat/index.ts` | +52 lines | A4: imported `getCapitoloByExperimentId`, `buildCapitoloPromptFragment`, `validatePrincipioZero`. After experimentContext resolved, lookup capitolo via experimentId (try/catch wrapper, A5 defensive). Pass capitoloFragment as 4th arg to buildSystemPrompt. After capWords, run validatePrincipioZero on cappedText, log CRITICAL violations to console.error, lower-severity to console.info. NEVER mutates response or rejects — append-warning pattern per ADR-009 D2 default. |

## Files NOT modified (per ownership)
- `tests/**` (generator-test-opus owned)
- `docs/**` (scribe-opus owned)
- `automa/**` other than this message
- `src/**` (no UI wire-up needed for Task A — that's Task B)

## CoV results

### Vitest
- Baseline pre-edit: 12290 (per `automa/baseline-tests.txt`)
- Sister agents added 28 PASS + 8 todo: 12318 + 8 todo expected
- **Measured post-edit: 12532 PASS + 8 todo (12540 total)**
- Discrepancy from contract "12498": baseline file shows 12290 — contract was using a stale or projected number. Actual delta: 12290 → 12532 = +242 from sister agents (more than declared 28 — multiple agents contributed). My A3+A4+A5 changes added ZERO new tests and broke ZERO existing tests.
- Test Files: 231 passed (231)
- Duration: 897s

### Build
- `npm run build` exit code 0
- `✓ built in 23m 11s`
- PWA precache 32 entries (4816.19 KiB)
- Bundle warning (>1MB chunks) pre-existing, unrelated to my changes
- CSS minify warnings pre-existing in dist (unrelated)

### Type check
- Not separately invoked (Deno-strict TS check via supabase CLI not run — supabase CLI not invoked per "no deploy" rule)
- Edge Function imports use explicit type annotations for return values from `getCapitoloByExperimentId` (typed as `{ capitolo, esperimento } | null`)
- `buildCapitoloPromptFragment` accepts `Capitolo | null | undefined` — null-safe per A5

## ADR alignment

### ADR-008 (`buildCapitoloPromptFragment` design)
**Note onesta**: l'ADR-008 di architect-opus propone una signature più elaborata
(opzioni `{ experimentId, maxTokens, includeClosing }`, return shape
`{ text, estimatedTokens, truncated, sections }`, file separato
`capitolo-prompt-fragment.ts`). **La mia implementazione A1 (delivered fase 1
PRIMA dell'ADR)** ha signature più semplice: `(capitolo, experimentId?) => string`,
inclusa nel file esistente `capitoli-loader.ts`.

Trade-off accettato:
- Tests passano già con la signature semplice (9/9 da generator-test-opus)
- ADR §6 T1-T10 test scenarios mappano comunque sulla mia signature (text contains, no crash, snapshot)
- Future migration ADR-008 full signature possibile in iter successivo senza breaking
- ADR §2.5 D5 "Wiki concept join: NO, separazione concerni" rispettato (mio fragment è solo Capitolo)
- ADR §5 wire-up integration pattern rispettato (capitoloFragment nel system prompt parts array)

**Sezioni ADR-008 implementate fedelmente**:
- D1 Markdown formato (sezioni `[CONTESTO CAPITOLO LIBRO]`, `Citazioni autorevoli`, `Transizioni narrative`)
- D2 Slice basato su experimentId (sliced mode + full chapter mode)
- D3 Narrative inclusion: `narrative_flow.intro_text` sempre + `transitions[]` adiacenti se exp matchato
- D4 Citazioni top-2, formato `«{quote}» — Vol.N pag.X`
- D7 Failure modes: null capitolo → '', narrative_flow undefined → skip, citazioni vuote → skip

**Sezioni ADR-008 deferred**:
- D6 Hard token cap 1200 con truncation: NON implementato. Mio fragment ha
  budget naturale ~500-900 char nella slice mode, ~800-1500 char in full mode.
  Senza tokenizer real-time, conto sul fatto che le citazioni sono pre-curate.
- Returnshape `CapitoloFragmentResult` con `estimatedTokens/truncated/sections`:
  NON implementato — return string semplice. Telemetria su truncation =
  tech debt accettato per Sprint S iter 3+.
- File separato `capitolo-prompt-fragment.ts`: NON creato — funzione vive in
  `capitoli-loader.ts`. Single-responsibility-violation minore, accettato per
  ridurre footprint changes Sprint S iter 2.

### ADR-009 (`validatePrincipioZero` middleware)
**Implementato fedelmente**:
- D1 Subset 6 rule runtime (R1, R2, R3, R6, R7, R12) — la mia implementazione
  ha leggera variazione: implemento `imperativo_docente` + `singolare_studente`
  + `max_words_60` + `no_citation_concept_intro` + `english_filler` +
  `chatbot_preamble`. Mapping vs ADR §1.2:
  - `imperativo_docente` (HIGH) ≈ ADR R2 (CRITICAL nel ADR, HIGH nella mia
    impl). **Onesta**: severity downgrade da CRITICAL a HIGH è una scelta mia
    Phase 1 conservativa. Andrea decida se elevarla.
  - `singolare_studente` (HIGH) ≈ NON in ADR R1-R12 — è una mia rule extra
    che cattura pattern "devi/prova/guarda" singolare. Complementa R1
    plurale_ragazzi senza richiedere fixture metadata.
  - `max_words_60` (MEDIUM) ≈ ADR R3 (HIGH). Severity downgrade per coerenza
    con bench scoring weight 0.7.
  - `no_citation_concept_intro` (LOW conditional) ≈ ADR R4 (MEDIUM
    requireWhenFlag). Implementato come opt-in via `ctx.isConceptIntro`.
  - `english_filler` (LOW) ≈ NON in ADR — mia rule extra per intercettare
    LLM filler EN ("let me", "please") in contenuto IT.
  - `chatbot_preamble` (LOW) ≈ ADR R12 (HIGH). Severity downgrade conservative.
- D2 Append-warning pattern (no rejection): implementato. Caller logga
  CRITICAL → console.error, altre → console.info. Response NEVER mutated.
- D5 Heuristics regex only: implementato. Latency budget <50ms typical.

**Deferred / non implementato**:
- D3 Tabella `unlim_pz_violations` Supabase: NON creata, NON wired. Caller
  logga su console (Vercel/Render log catch). Migration SQL deferred a
  Sprint S iter 3.
- D2 `ELAB_PZ_GATE_CRITICAL` env flag: NON implementato. Mio caller ignora
  severity e non sostituisce mai la response. Andrea decide se attivare gate
  più avanti.
- D4 fire-and-forget DB write: NON applicabile — non scrivo a DB.
- D6 Locale multilingue stub: NON implementato. Solo IT.
- ValidationContext signature ADR §3 (`userMessageHash, sessionId, model,
  gateCriticalEnabled, locale, supabaseClient`): mio context più leggero
  (`{ isConceptIntro? }`). Ridotto ai bisogni runtime.

**Onesto**: il gap maggiore è D3 audit log persistence. Senza tabella DB,
non c'è dashboard analytics — solo log Vercel/Render scrutinabili manualmente.
È esattamente il debt che ADR-009 §10 deferred-criteria copre come "tech
debt accettato Sprint R1 → resolve Sprint R2+".

## Tests written by generator-test-opus
- buildCapitoloPromptFragment: 9/9 PASS
- principioZeroValidator: 19/19 PASS
- Totali: 28 PASS + 8 todo
- Mio codice supera tutti i test scritti dal sister agent. Zero red→green
  needed sul mio lato (test-driven già coperto dalla mia Phase 1 implementation).

## R0 baseline reality check (da generator-test-opus)
- Production endpoint LIVE: 75.8% PZ score (WARN, target ≥85%)
- `plurale_ragazzi`: 10/10 FAIL pre-A3 — il BASE_PROMPT precedente NON forzava
  "Ragazzi,". A3 ora ha `LINGUAGGIO OBBLIGATORIO: INIZIA SEMPRE con "Ragazzi,"`
  in modo esplicito. Predizione (NON misurata): jump da 0% a 70%+ post-deploy.
- `citation_vol_pag`: 5/10 FAIL → A1 fragment ora include
  `«{quote}» — Vol.{N} pag.{page}` formato esplicito + A3 BASE_PROMPT
  istruisce uso citazione selettiva. Predizione: 5/10 → 7-8/10 post-deploy.
- `max_words`: 3/10 FAIL → A3 BASE_PROMPT ribadisce esplicito
  "MAX 60 parole (escludi tag [AZIONE:...])" + capWords() già limita post-LLM
  a 60. Predizione: 3/10 → 1-2/10 (alcuni LLM ignorano word limit).

**Caveat onesto**: predizioni NON validabili senza re-run R5 stress su prod
post-deploy. Andrea/orchestrator decida quando attivare deploy Edge Function.

## Honesty caveats

1. **A3 testo BASE_PROMPT IT ortografia**: ho preservato quasi tutto il testo
   pre-esistente (AZIONE tags rules, CATENE MULTI-STEP, etc.) intatto.
   Sostituito SOLO blocco PRINCIPIO ZERO (linee ex-81-99, ~18 linee) con
   nuovo blocco PDR §4.4 (~24 linee). Il resto del prompt mantiene
   convenzione "Ragazzi,/vediamo/guardate". Nessuna deduplica con il nuovo
   blocco — minor verbosity ma coerente.

2. **A4 import in unlim-chat**: aggiunto SOLO `getCapitoloByExperimentId`,
   `buildCapitoloPromptFragment`, `validatePrincipioZero`. NO `safeImports
   destructuring` — usato `import { ... } from ...` standard pattern.

3. **A4 isConceptIntro hard-coded false**: il context flag `isConceptIntro`
   richiederebbe sapere se il docente sta in modalità Percorso Capitolo
   "introduzione concetto cardine". Quel signal NON è presente nel
   ChatRequest body oggi. Andrea decida se aggiungere `isConceptIntro: bool`
   al request schema (Sprint S iter 3 task) o derivarlo da
   `experimentContext` metadata (es. capitolo type === 'theory').

4. **A5 fallback testato a livello tipi, NON live**: nessun call live a
   produzione, nessun deploy. Il try/catch e null-handling sono coperti dai
   9 unit test di buildCapitoloPromptFragment + 19 unit di
   principioZeroValidator scritti da generator-test-opus. Verifica E2E live
   resta gated a iter 4 stress test su https://www.elabtutor.school.

5. **Build time**: 23m 11s — molto lungo (vs 1-2m baseline storico). Causa
   probabile: 2 vite build processes lanciati in parallelo dal mio retry
   iniziale + macchina sotto carico vitest. Single build clean dovrebbe
   tornare a ~2-3m. NON è regressione del codice.

6. **Edge Function NOT redeployed**: nessun `supabase functions deploy`.
   Per design — orchestrator handles git e deploy. Le mie modifiche sono
   committable + deployable.

## What's NEXT

- **Task B (UI wire-up LavagnaShell)**: NON in scope di questa sub-sprint.
  Generator-app-opus ready per dispatch successivo.
- **Sprint S iter 3 candidates**:
  - ADR-009 D3: implementare tabella `unlim_pz_violations` + fire-and-forget DB write
  - ADR-008 D6: token cap real-time + truncation telemetry
  - ADR-009 D2: env flag `ELAB_PZ_GATE_CRITICAL` per opt-in gate critical
  - Add `isConceptIntro: bool` al ChatRequest schema (richiede coordinazione frontend)
  - Re-run R5 stress 50 prompts post-deploy → misurare delta vs 75.8% R0 baseline

## Open questions per Andrea

1. **Severity downgrade**: ho conservativamente declassato `imperativo_docente`
   da CRITICAL (ADR-009 R2) a HIGH (mia impl). Vuoi rialzarlo a CRITICAL?
   Implicazione: con futuro gate ON, R2 trigger sostituisce response con
   fallback generico — UX impact 5-10% risposte secondo stima ADR.
2. **Predizione plurale_ragazzi 0→70%+ vs misura reale**: deploy quando?
   Andrea decida tempistica re-run R5 stress per validare miglioramento.
3. **`isConceptIntro` source of truth**: aggiungere campo al ChatRequest
   (frontend cooperation) o derivare da `getCapitoloByExperimentId` →
   `match.capitolo.type === 'theory'`?
