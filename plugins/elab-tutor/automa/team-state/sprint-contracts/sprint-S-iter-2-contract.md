---
sprint: S
iter: 2
date_start: 2026-04-26
date_target_end: 2026-04-27
orchestrator: claude-main-session (Andrea pilots)
team: planner-opus + architect-opus + generator-app-opus + generator-test-opus + scribe-opus
pattern: ralph-loop max 100 iter, --completion-promise SPRINT_S_COMPLETE
mode: SOFTWARE-ONLY (pod RunPod EXITED, host US-WA-1 saturo, retry poll background)
---

# Sprint S iter 2 — Contract

## Reality update vs PDR (CRITICAL)

PDR diceva PR cascade #34-#41 OPEN draft. **VERIFICATO MERGED**: #41,#42,#45,#46,#47,#48,#49,#50,#51 tutti su `main`.
Conseguenza: Sprint Q1-Q6 + Wiki batch 1 + Sprint S iter 1 = LIVE su `main` ORA. Niente PR cascade da fare.

Pod `felby5z84fk3ly` EXITED, host `kply5qifvp6v` US-WA-1 GPU saturo. Volume container-locale (non network) = modelli persi se TERMINATED. Background poll PID 10470 retry resume ogni 15min × 32 = 8h max.

## Iter 2 SOFTWARE-only goals (no GPU)

### Task A — UNLIM synthesis prompt v3 wire-up production

**Owner**: generator-app-opus (lead) + architect-opus (ADR) + generator-test-opus (TDD)
**File ownership**: `supabase/functions/_shared/system-prompt.ts`, `supabase/functions/_shared/capitoli-loader.ts`, `supabase/functions/unlim-chat/index.ts`, `tests/integration/unlim-chat-prompt-v3.test.ts`
**Estimate**: 6-8h

**Gap reale verificato**:
- `buildCapitoloPromptFragment()` NON ESISTE (PDR §4.4 lo nominava ma non implementato)
- `validatePrincipioZero()` middleware NON ESISTE
- BASE_PROMPT line 14-86 esistente forza CITAZIONE FEDELE — Andrea vuole sintesi
- `unlim-chat/index.ts` line 234 chiama solo `buildSystemPrompt(studentContext, circuitState, experimentContext)` senza Capitolo + Wiki

**Acceptance criteria (CoV per agente)**:
- [ ] `buildCapitoloPromptFragment(capitolo: Capitolo): string` implementato in `_shared/capitoli-loader.ts` con tests unit
- [ ] `validatePrincipioZero(response: string): {violations: Violation[], severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'}` implementato `_shared/principio-zero-validator.ts` con 12 rules da score-unlim-quality.mjs
- [ ] BASE_PROMPT revised per PDR master plan v2 §4.4 (sintesi default, citazione selettiva, USO DELLE FONTI rules)
- [ ] `unlim-chat/index.ts` chiama `getCapitoloByExperimentId` + `buildCapitoloPromptFragment` + post-LLM `validatePrincipioZero`
- [ ] CRITICAL violations log to Supabase `together_audit_log` table (riusa schema esistente)
- [ ] `npx vitest run tests/integration/unlim-chat-prompt-v3.test.ts` PASS
- [ ] Baseline preservato: `npx vitest run | grep "Tests"` ≥ 12498
- [ ] `npm run build` PASS (Edge Function bundle)

### Task B — Modalità citazioni inline UI wire-up LavagnaShell

**Owner**: generator-app-opus + generator-test-opus + scribe-opus (e2e spec)
**File ownership**: `src/components/lavagna/LavagnaShell.jsx`, `src/components/lavagna/AppHeader.jsx`, `src/components/percorso/PercorsoCapitoloView.jsx` (touch readonly), `tests/e2e/11-modalita-citazioni-inline.spec.js`
**Estimate**: 6-8h

**Gap reale**: Q2 components delivered (PercorsoCapitoloView, VolumeCitation, DocenteSidebar, CapitoloPicker, IncrementalBuildHint) ma NON wired in LavagnaShell production.

**Acceptance criteria**:
- [ ] LavagnaShell.jsx replace PercorsoPanel → PercorsoCapitoloView quando `mode === 'percorso'`
- [ ] AppHeader.jsx aggiunge button "Capitoli" → CapitoloPicker overlay
- [ ] VolumeCitation onCitationClick wired → VolumeViewer.jumpToPage(volume, page) lazy-load
- [ ] DocenteSidebar reactive scroll-position + click-to-jump
- [ ] IncrementalBuildHint render conditional su `experiment.build_circuit.mode === 'incremental_from_prev'`
- [ ] e2e spec 11: open Cap 6, scroll exp1→exp2, click VolumeCitation, verify VolumeViewer at Vol.1 pag.27
- [ ] Baseline preservato + build PASS
- [ ] Browser preview verification con preview_* tools (no claim "funziona" senza vista)

### Task C — Sprint R0 baseline measure (production endpoint)

**Owner**: generator-test-opus + evaluator (CoV integrated) + scribe-opus
**File ownership**: `scripts/bench/run-sprint-r0.sh`, `docs/audits/2026-04-26-sprint-r0-unlim-baseline.md`
**Estimate**: 3-4h

**Goal**: misurare BASELINE corrente UNLIM su 10 prompt fixture via produzione endpoint `https://elab-galileo.onrender.com` PRIMA Task A wire-up.

**Acceptance criteria**:
- [ ] Run `node scripts/runpod-r0-bench.mjs` adattato per Render endpoint (sostituisci RUNPOD_PROXY_BASE → RENDER_URL)
- [ ] OPPURE call diretto via curl 10 prompt + capture responses
- [ ] Score via `node scripts/bench/score-unlim-quality.mjs` (12 PZ rules) con args fix (--responses --fixture)
- [ ] Audit doc baseline numerico (sintesi%, plurale%, citation%, max_words%, age-appropriate%)
- [ ] CoV: 3x re-run consistency check, variance <5%
- [ ] Output: PASS (≥85%) / WARN (70-84%) / FAIL (<70%) verdetto

### Task D — Mac Mini Wiki concepts batch (async parallel)

**Owner**: scribe-opus (dispatch + pull + commit) + planner-opus (concept selection)
**Estimate**: ~30min wall-clock per batch (Mac Mini autonomous)

**Status**: batch dispatched 2026-04-26 11:23 CEST, 5 concepts: `analog-read digital-write pin-mode ohm amperometro`, branch `mac-mini/wiki-concepts-batch-20260426-112238`.

**Acceptance criteria**:
- [ ] Pull batch results quando `~/.elab-batch-result` esistente Mac Mini
- [ ] PR draft creato su branch `mac-mini/wiki-concepts-batch-20260426-112238` → main
- [ ] Wiki count: 33 → 38+ concepts post-pull
- [ ] Dispatch next batch 5 (target: digital-read, serial-print, voltmetro, ground-massa, blink-led)
- [ ] Q4 SCHEMA validation: pre-commit hook verifies kebab-case lowercase

### Task E — Architect ADR (parallel)

**Owner**: architect-opus
**File ownership**: `docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md`, `docs/adrs/ADR-009-principio-zero-validator-middleware.md`
**Estimate**: 2-3h

**Acceptance criteria**:
- [ ] ADR-008: design decision per buildCapitoloPromptFragment (Capitolo schema → prompt fragment shape, narrative_flow embedding, citazioni_volume formatting)
- [ ] ADR-009: principioZeroValidator middleware pattern (post-LLM check, severity gate, log strategy, reject vs append-warning)

### Task F — Documentation + handoff

**Owner**: scribe-opus
**File ownership**: `docs/audits/2026-04-26-sprint-s-iter2-audit.md`, `docs/handoff/2026-04-26-sprint-s-iter2-handoff.md`, `CLAUDE.md`
**Estimate**: 1-2h

**Acceptance criteria**:
- [ ] Audit doc iter 2 completo con CoV results, file changes, honesty caveats
- [ ] Handoff doc per iter 3 (GPU work quando pod resume)
- [ ] CLAUDE.md update: rimuovi "Sprint Q PR cascade #34-#41 NOT merged" (obsoleto), aggiungi pod resume blocker, mark Q3 wire-up done

## Communication protocol

- Filesystem messages: `automa/team-state/messages/<from>-to-<to>-<TS>.md`
- Format: YAML frontmatter (from, to, ts, sprint, priority, blocking) + Task/Dependencies/Acceptance sections
- Ogni agente CoV 3x prima claim "fatto"

## Dispatch order

1. **Pre-iter** (this orchestrator): write contract (DONE), dispatch wiki batch (DONE)
2. **Wave 1 parallel** (single Agent tool message, 5 calls):
   - planner-opus → decomposizione finale + assegnazione Task A/B/C/D/E/F precisa
   - architect-opus → ADR-008 + ADR-009 (Task E)
   - generator-test-opus → Task C R0 baseline + test scaffolds Task A
   - scribe-opus → Task D wiki pull/dispatch coord
   - generator-app-opus → ATTENDE planner output prima dispatch Task A
3. **Wave 2** (post Wave 1):
   - generator-app-opus → Task A wire-up + Task B UI
   - generator-test-opus → integration tests Task A + e2e Task B
4. **Wave 3** (post Wave 2):
   - scribe-opus → Task F audit + handoff
   - orchestrator → /quality-audit + commit + push branch `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26`

## Stress test gate

Iter 4 trigger (next iter): Playwright + Control Chrome MCP su `https://www.elabtutor.school` smoke E2E. Iter 2 NON è iter 4 → skip stress test.

## SPRINT_S_COMPLETE delta after iter 2

Box check expected post iter 2:
1. ⚠️ VPS GPU deployed (pod EXITED, blocked)
2. ⚠️ 7-component stack live (depends pod resume)
3. ❌ 6000 RAG chunks (depends GPU)
4. ⚠️ 100+ Wiki LLM concepts (33 → 38+ this iter, target end Sprint S)
5. ✅ UNLIM synthesis prompt v3 wired prod (Task A)
6. ❌ Hybrid RAG live (depends GPU)
7. ❌ Vision flow live (depends GPU)
8. ❌ TTS+STT Italian (depends GPU)
9. ⚠️ R5 stress 50 prompts ≥90% (R0 baseline this iter Task C, R5 Sprint S iter 5+)
10. ❌ ClawBot 80-tool dispatcher (Sprint 6 Day 39 post R5 PASS)

Score expected iter 2 close: 1.5 → 2.5/10 boxes (15% → 25%).

## Honesty caveats iter 2

1. Task A wire-up qualità reale dipende da `unlim-chat` invocazione live — pre-prod test ok ma stress test su elabtutor.school iter 4 obbligatorio
2. Task B UI verifica MANUALE browser — preview_* tools richiesti, no claim senza screenshot
3. Task C R0 baseline su Render (nanobot V2 18s cold start), endpoint potenzialmente diverso da quello target VPS GPU
4. PR cascade scoperta merged tardi nel ciclo — possibile drift altre assunzioni PDR (verificare)
5. Pod resume blocker fuori controllo team (RunPod host capacity)
6. Mac Mini wiki batch rate ~3.6min/concept = throughput 5/30min, target 100 lontano
7. Tea async creative work indipendente, non in iter 2 scope
