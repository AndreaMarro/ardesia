---
sprint: S
iter: 13
date: 2026-04-28
author: iter13-coordinator (Opus)
entry_state_score: 9.30/10 ONESTO (iter 12 P1 close)
target_iter_13_close: 9.65/10 ONESTO (honest projection — NOT 9.95)
projection_caveat: 9.95 reachable ONLY if Box 6+7 lift live verified AND Box 1+3 ADR ratified AND Mac Mini unblocked. Iter 13 12h sellable mandate => prioritize defensive lift not chase ceiling.
parent_pdr: docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §4.2
prior_contract: docs/pdr/sprint-S-iter-12-contract.md
HEAD_baseline: 9f589ba (iter 12 PHASE 1+2 SHIPPED + push origin)
priorities_user_4: Fumetto perfection | Circuit rotation | Design impeccable LIM | UNLIM omniscient
---

# Sprint S iter 13 Contract — 4-Priority OPUS dispatch

## §1 — Iter 13 entry state (post iter 12 commit 9f589ba)

### §1.1 Repo HEAD facts
- HEAD `9f589ba`: "feat(iter12): Sprint S iter 12 PHASE 1+2 — 5-agent OPUS Pattern S deliverables"
- Push origin VERIFIED iter 12 close.
- Branch: main (per Andrea iter-9 unblock + autonomous policy on iter 12).
- vitest baseline: 12599 PASS (iter 12 P1 verified, +309 vs iter 11 baseline). Mandate iter 13 PRESERVE 12599+ MIN, target ≥12700 post-test-additions Priority 1+2+4.
- openclaw vitest: 129 PASS (iter 12 P1 verified). Mandate PRESERVE 129+.
- Build: NOT re-run since iter 11. Iter 13 PHASE 3 orchestrator MUST run `npm run build` ~14 min before closing.
- Edge Function unlim-chat: LIVE prod (curl smoke 200 OK iter 12 PHASE 1 verified, sessionId UUID required, 7.8s latency — SLOW, see §1.3 P0 latency atom).

### §1.2 Edge Function metadata gap (iter 12 carry-forward)
- `supabase/functions/unlim-chat/index.ts:257-260` surfaces `chapter`/`page`/`section_title` from `cr.chapter`/`cr.page`/`cr.section_title` directly.
- BUT live curl smoke iter 12 returns NULL for chapter+page+section_title in `debug_retrieval` response.
- Root cause: 2 candidate hypotheses (iter 13 U1 ATOM verifies):
  - **H1**: rag.ts SELECT clause omits these columns (most likely — fast SELECT * → typed projection mismatch).
  - **H2**: DB ingest never populated these columns iter 7 RAG ingest (1881 chunks via Voyage stack — `scripts/rag-contextual-ingest-voyage.mjs` may have NULL'd them).
- Verify via Supabase SQL: `SELECT chapter, page, section_title FROM rag_chunks LIMIT 5` — if NULL → H2 (re-ingest required, scope creep, iter 14). If non-NULL → H1 (SELECT fix iter 13 trivial).

### §1.3 Box scores entering iter 13
| Box | Score | Notes |
|-----|-------|-------|
| 1 VPS GPU | 0.4 | ADR-020 ratify pending Andrea (binary decision iter 13) |
| 2 Stack 7-comp | 0.4 | UNCHANGED |
| 3 RAG 1881 | 0.7 | ADR-021 ratify pending Andrea (binary decision iter 13) |
| 4 Wiki 100 | 1.0 | LIVE iter 5 close |
| 5 R0 91.80% | 1.0 | LIVE iter 5 P3 deploy |
| 6 Hybrid RAG | 0.85 | Lift to 0.95 if B2 recall@5 ≥0.55 verified live iter 13 PHASE 3 |
| 7 Vision | 0.55 | Lift to 0.70 if B3 topology ≥80% verified live |
| 8 TTS WS | 0.85 | DEFER iter 14 (Sec-MS-GEC ceiling, browser fallback acceptable) |
| 9 R5 91.80% | 1.0 | LIVE iter 5 P3 deploy |
| 10 ClawBot | 0.95 | Mac Mini D1 deferred SSH block iter 12, retry iter 13 |

Subtotal box: 7.20/10 + bonus cumulative 2.10 = **9.30/10 entrance**.

### §1.4 12h product-sellable deadline
**INTERPRETATION**: iter 13 must close with state demoable to Andrea (kit + LIM smoke prod working without crashes + 4 priority improvements visible). NO regressions (vitest 12599 + build PASS + r5 91.80% + r0 91.80%). Iter 13 acceptable close = 9.65/10 (defensive). 9.95/10 = stretch (depends Andrea env provision + Mac Mini SSH unblock + Box 1+3 ratify all converge same iter — UNLIKELY single iter).

---

## §2 — 16 ATOM-S13 atoms (4 per priority + 0 cross-cutting)

Each atom: ID | Title | Owner agent | LOC estimate (real, from grep findings) | Files | Dependencies | Acceptance criteria.

### §2.1 Priority 1 — Fumetto perfection

| ID | Title | Owner | LOC est. | Files (RIGID) | Deps | Acceptance |
|----|-------|-------|----------|---------------|------|-----------|
| F1 | Fumetto component audit current state | fumetto-opus | ~150 LOC audit doc | NEW: `docs/audits/2026-04-28-fumetto-perfection-audit.md` | None | Audit ≥150 LOC documenting all 7 grep findings (`SessionReportComic.jsx`, `UnlimReport.jsx`, `LavagnaShell.jsx:857`, `voiceCommands.js:330`, `simulator-api.js:868+877`, `VolumeViewer.jsx:3` annotations contribution, `UnlimOverlay.jsx:84-163` fumetto positioning helper). |
| F2 | Fumetto visual+narrative redesign | fumetto-opus | ~80 LOC modify SessionReportComic.jsx + ~120 LOC NEW SessionReportComic.module.css enhancements | MODIFY: `src/components/lavagna/SessionReportComic.jsx` (98 LOC current) + `src/components/lavagna/SessionReportComic.module.css` | F1 | Add: real photo extraction from VolumeViewer annotations (currently only buildPhotoUrl from experiment-photo-map static), narration auto-generated per-vignette from circuit state (NOT empty placeholder), rich caption with experiment outcome (success/diagnosis), Andrea/Tea brand-aligned typography (Oswald titoli + Open Sans body), 6 vignettes + cover/back-cover. |
| F3 | Fumetto wire-up real session data | fumetto-opus | ~60 LOC modify UnlimReport.jsx + ~40 LOC modify simulator-api.js fumettoExportRequested handler | MODIFY: `src/components/unlim/UnlimReport.jsx` (line 578+595-597 patterns) + `src/services/simulator-api.js` (line 868+877 emit) + `src/components/lavagna/LavagnaShell.jsx` (line 857 voice command integration) | F2 | Voice cmd "crea il report" / "fumetto" generates HTML+PDF with: 6 real experimentsCompleted from session, real narrations from unlimMemory 3-tier, real photos VolumeViewer annotations + experiment-photo-map fallback, Vol/pag citations Sense 2 morfismo. NO mock NO demo (CLAUDE.md regola 12). |
| F4 | Fumetto unit tests | fumetto-opus | ~150 LOC NEW | NEW: `tests/unit/SessionReportComic.test.jsx` | F2 | ≥10 tests: render 6 vignettes / handles empty session / fallback photo placeholder / narration injection / export PDF callback / accessibility aria-labels / Vol/pag citation regex / no emoji icons (regola 11) / Oswald+Open Sans applied / studentAlias optional. PASS in vitest 12599+ baseline preserve. |

**Priority 1 LOC total est**: ~700 LOC (audit 150 + impl 200 + wire 100 + test 150 + CSS 100). **Time est**: 6h Opus dedicated.

### §2.2 Priority 2 — Circuit rotation

**KEY FINDING from grep**: rotation INFRASTRUCTURE ALREADY EXISTS in `SimulatorCanvas.jsx`:
- `getBBox` line 75-77 handles rotation 90/270 swap.
- Lines 294-302, 407-415, 701-706 transform rotation via rad math (corner transformation for collision detection).
- Line 2196-2342: render `<g transform={translate + rotate}>` already wired.
- Line 2844-2846: context menu "rotate" already cycles +90° on click.
- `NewElabSimulator.jsx:822-823` keyboard shortcut already increments rotation +90 mod 360.
- `parentChild.js:10` layout schema already includes rotation field.
- `PinOverlay.jsx:38-41` rotation-aware pin position calculation present.

**Conclusion**: Rotation IS NOT a greenfield feature. It's PARTIAL — infrastructure exists, gaps are: (a) UI affordance discoverability (no visible rotate handle), (b) persistence in saved circuits (verify Supabase serialization keeps rotation field), (c) test coverage missing, (d) some components like NanoR4Board (956 LOC) may render incorrectly when rotated 90/270 (text labels at lines 375, 649, 659 use `rotate(-90)` which would conflict).

| ID | Title | Owner | LOC est. | Files (RIGID) | Deps | Acceptance |
|----|-------|-------|----------|---------------|------|-----------|
| R1 | Rotation engine extension audit + NanoR4Board fix | rotation-opus | ~200 LOC audit doc + ~60 LOC fix NanoR4Board text rotation conflict | NEW: `docs/audits/2026-04-28-rotation-engine-audit.md` + MODIFY: `src/components/simulator/components/NanoR4Board.jsx` (lines 375, 649, 659 conditional `rotate(-90)` based on parent rotation) | None | Audit lists 11 grep findings + identifies 21 components in `src/components/simulator/components/` + states which need parent-rotation-aware text counter-rotate (NanoR4Board pin labels confirmed). NanoR4Board fix verified visually (rotation 90 keeps pin labels readable, NOT upside-down). |
| R2 | Rotation UI control (visible affordance) | rotation-opus | ~80 LOC modify SimulatorCanvas.jsx context menu + ~120 LOC NEW RotationHandle overlay | MODIFY: `src/components/simulator/canvas/SimulatorCanvas.jsx` (lines 2196-2342 selected component group) + NEW: `src/components/simulator/overlays/RotationHandle.jsx` | R1 | Visible rotation handle on selected component (drag arc to rotate, snap 90/180/270/0). Replaces hidden context-menu only path. Touch-target ≥44px (CLAUDE.md regola 9). |
| R3 | Rotation persistence Supabase + layout serialization | rotation-opus | ~50 LOC modify experiment save/load + verify `experiment.layout[id].rotation` round-trip | MODIFY: `src/services/api.js` (saveSession path — verify rotation field NOT stripped) + `src/services/supabaseSync.js` if exists | R1 | Round-trip test: save circuit with 4 components at rotations 0/90/180/270 → reload from Supabase → all 4 rotations preserved. |
| R4 | Rotation tests (unit + integration) | rotation-opus | ~250 LOC NEW | NEW: `tests/unit/SimulatorCanvas-rotation.test.jsx` + `tests/integration/rotation-persistence.test.js` | R2+R3 | ≥15 tests: getBBox rotation 0/90/180/270 / corner transform math / RotationHandle drag arc snap / context-menu rotate cycle / NanoR4Board text counter-rotate / persistence round-trip / collision detection rotated bbox / wire pin position rotated. PASS in vitest 12599+ baseline preserve. |

**Priority 2 LOC total est**: ~760 LOC (audit 200 + UI 200 + persistence 50 + test 250 + NanoR4Board fix 60). **Time est**: 7h Opus dedicated.

### §2.3 Priority 3 — Design impeccable LIM legibility (PROPOSE-ONLY iter 13)

**MANDATE**: per ANTI-INFLATION rule — NO code changes iter 13 (preserves vitest 12599 + build PASS for 12h sellable). Iter 13 PROPOSES iter 14 plan only. Use design/design-system + design/design-critique skills via `.impeccable.md`.

| ID | Title | Owner | LOC est. | Files (RIGID) | Deps | Acceptance |
|----|-------|-------|----------|---------------|------|-----------|
| D1 | Design audit raw signals quantified | design-opus | ~250 LOC audit doc | NEW: `docs/audits/2026-04-28-design-impeccable-LIM-audit.md` | None | Audit quantifies 435 font<14 CSS + 1326 fontSize<14 JSX + 103 touch<44 + maps top-30 worst offenders by file:line. Cross-references `.impeccable.md` 5 Design Principles + 10-anti-pattern checklist. |
| D2 | Principio Zero V3 LIM legibility proposal | design-opus | ~300 LOC proposal doc | NEW: `docs/specs/SPEC-iter-14-design-LIM-legibility.md` | D1 | Spec ≥300 LOC: font scale proposal (LIM-distance 5m → min 16px body 24px titoli), touch target proposal (52px target up from 44px CLAUDE.md regola 9 — matches LIM tap-distance), color contrast WCAG AAA (7:1 vs current AA 4.5:1) only for primary CTA, NO code changes iter 13. |
| D3 | Design critique 4 pages worst | design-opus | ~200 LOC critique doc | NEW: `docs/audits/2026-04-28-design-critique-4-pages.md` | D1 | Use `design:design-critique` skill on 4 worst-offending pages (Dashboard, NewElabSimulator shell, LavagnaShell, UnlimOverlay). Concrete ≥30 actionable critique items with file:line refs. |
| D4 | Design system extraction proposal | design-opus | ~150 LOC proposal doc | NEW: `docs/specs/SPEC-iter-14-design-system-extraction.md` | D1+D3 | Extract `src/styles/design-tokens.css` proposal: scale, spacing, color palette (Navy/Lime/Orange/Red CLAUDE.md regola 16) — NO impl iter 13, only proposal for iter 14 implementation. |

**Priority 3 LOC total est**: ~900 LOC docs only. **Time est**: 5h Opus dedicated. **ZERO code change** = ZERO regression risk.

### §2.4 Priority 4 — UNLIM omniscient

| ID | Title | Owner | LOC est. | Files (RIGID) | Deps | Acceptance |
|----|-------|-------|----------|---------------|------|-----------|
| U1 | RAG metadata SELECT fix (P0) | omniscient-opus | ~30 LOC modify rag.ts SELECT clause + ~50 LOC SQL diagnostic script + ~80 LOC unit test | MODIFY: `supabase/functions/_shared/rag.ts` (line 257-260 area, expand SELECT to include chapter, page, section_title columns) + NEW: `scripts/diagnose-rag-metadata.mjs` + NEW: `tests/unit/rag-metadata-surface.test.js` | None | Live curl smoke `unlim-chat` returns NON-NULL chapter+page+section_title in `debug_retrieval` chunks. SQL `SELECT chapter, page, section_title FROM rag_chunks LIMIT 5` returns non-NULL OR documented re-ingest required iter 14. Diagnostic script reports row count + NULL count per column. |
| U2 | Wiki LLM corpus fusion in Hybrid RAG | omniscient-opus | ~120 LOC modify rag.ts retrieval branch + ~80 LOC NEW wiki-corpus-loader integration | MODIFY: `supabase/functions/_shared/rag.ts` (add wiki branch in retrieve fn) + REFER: `scripts/wiki-corpus-loader.mjs` (existing iter 5 scaffold) | U1 | Wiki 100 concepts now retrievable in hybrid retrieval alongside 1881 RAG chunks. recall@5 measure includes wiki hits. NO duplicate ingestion (wiki is separate corpus, query both then merge top-K). |
| U3 | Screenshot ingest design (PROPOSE-ONLY iter 13) | omniscient-opus | ~250 LOC proposal doc | NEW: `docs/specs/SPEC-iter-14-screenshot-rag-ingest.md` | U1 | Proposal ≥250 LOC: how screenshots from Vision flow ingest into rag_chunks (image_url + image_description + image_embedding multimodal Voyage 1024-dim). NO impl iter 13 (avoids 12h sellable risk). |
| U4 | ClawBot L2 templates 28 ToolSpec → 80 expansion (5 templates iter 13) | omniscient-opus | ~400 LOC modify composite-handler.ts L2 template branch + ~300 LOC NEW 5 L2 templates | MODIFY: `scripts/openclaw/composite-handler.ts` (492 LOC current, +400 LOC L2 template branch) + NEW: 5 templates `scripts/openclaw/l2-templates/{lesson-intro,debug-circuit,explain-error,review-code,session-recap}.ts` (~60 LOC each) | U1 | 5 NEW L2 templates pass dispatcher contract (52 ToolSpec → 57 ToolSpec). composite-handler.test.ts +5 tests passing. NO regression on 129 openclaw PASS baseline. ClawBot Sense 1.5 morfismo runtime activation begun (per ADR-019). Mac Mini D1 carry-forward 23 remaining templates iter 14+. |

**Priority 4 LOC total est**: ~1310 LOC (impl 750 + test 80 + spec 250 + integration 230). **Time est**: 8h Opus dedicated.

---

## §3 — File ownership matrix RIGID (no overlap)

Per CLAUDE.md "ANTI-REGRESSIONE FERREA" + Pattern S file-ownership rigid principle.

| File | Owner agent | Atoms | Mode |
|------|-------------|-------|------|
| `src/components/lavagna/SessionReportComic.jsx` | fumetto-opus | F2 | MODIFY |
| `src/components/lavagna/SessionReportComic.module.css` | fumetto-opus | F2 | MODIFY (or NEW if doesn't exist) |
| `src/components/unlim/UnlimReport.jsx` | fumetto-opus | F3 | MODIFY |
| `src/services/simulator-api.js` | fumetto-opus | F3 | MODIFY (line 868+877 area only) |
| `src/components/lavagna/LavagnaShell.jsx` | fumetto-opus | F3 | MODIFY (line 857 voice command integration only — NO other touch) |
| `tests/unit/SessionReportComic.test.jsx` | fumetto-opus | F4 | NEW |
| `docs/audits/2026-04-28-fumetto-perfection-audit.md` | fumetto-opus | F1 | NEW |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | rotation-opus | R2 | MODIFY (lines 2196-2342 + 2844-2846 area only) |
| `src/components/simulator/components/NanoR4Board.jsx` | rotation-opus | R1 | MODIFY (lines 375, 649, 659 only) |
| `src/components/simulator/overlays/RotationHandle.jsx` | rotation-opus | R2 | NEW |
| `src/services/api.js` | rotation-opus | R3 | MODIFY (saveSession rotation field preserve only — VERIFY no strip) |
| `tests/unit/SimulatorCanvas-rotation.test.jsx` | rotation-opus | R4 | NEW |
| `tests/integration/rotation-persistence.test.js` | rotation-opus | R4 | NEW |
| `docs/audits/2026-04-28-rotation-engine-audit.md` | rotation-opus | R1 | NEW |
| `docs/audits/2026-04-28-design-impeccable-LIM-audit.md` | design-opus | D1 | NEW |
| `docs/specs/SPEC-iter-14-design-LIM-legibility.md` | design-opus | D2 | NEW |
| `docs/audits/2026-04-28-design-critique-4-pages.md` | design-opus | D3 | NEW |
| `docs/specs/SPEC-iter-14-design-system-extraction.md` | design-opus | D4 | NEW |
| `supabase/functions/_shared/rag.ts` | omniscient-opus | U1+U2 | MODIFY |
| `scripts/diagnose-rag-metadata.mjs` | omniscient-opus | U1 | NEW |
| `tests/unit/rag-metadata-surface.test.js` | omniscient-opus | U1 | NEW |
| `docs/specs/SPEC-iter-14-screenshot-rag-ingest.md` | omniscient-opus | U3 | NEW |
| `scripts/openclaw/composite-handler.ts` | omniscient-opus | U4 | MODIFY |
| `scripts/openclaw/l2-templates/{lesson-intro,debug-circuit,explain-error,review-code,session-recap}.ts` | omniscient-opus | U4 | NEW (5 files) |
| `scripts/openclaw/composite-handler.test.ts` | omniscient-opus | U4 | MODIFY (+5 tests for L2 templates) |

**ZERO file double-owned across agents.** Each agent has exclusive WRITE access to listed files. Other agents READ-ONLY.

**Cross-agent concern**: `scripts/openclaw/composite-handler.test.ts` is owned by omniscient-opus iter 13. If iter 12 gen-test-opus left modifications uncommitted, scribe-opus iter 13 close PHASE 2 must merge cleanly.

---

## §4 — DAG dependency

```
                                      ┌────────────┐
                                      │ planner    │ (this contract — already shipped)
                                      └─────┬──────┘
                                            │
              ┌─────────────────┬───────────┼───────────┬──────────────────┐
              │                 │           │           │                  │
              v                 v           v           v                  v
       ┌──────────────┐  ┌────────────┐ ┌────────────┐ ┌────────────────┐  ┌─────────────┐
       │ fumetto-opus │  │ rotation-  │ │ design-opus│ │ omniscient-opus│  │ Mac Mini    │
       │              │  │ opus       │ │ (DOC ONLY) │ │                │  │ D1+D2+D3    │
       │ F1→F2→F3→F4  │  │ R1→R2→R3   │ │ D1→D2,D3,D4│ │ U1→U2,U3,U4    │  │ (carry-fwd) │
       │              │  │       ↓R4  │ │            │ │                │  │             │
       │              │  │       (R4  │ │            │ │                │  │             │
       │              │  │   awaits   │ │            │ │                │  │             │
       │              │  │   R2+R3)   │ │            │ │                │  │             │
       └──────┬───────┘  └─────┬──────┘ └─────┬──────┘ └───────┬────────┘  └─────────────┘
              │                │              │                │
              └────────────────┴──────────────┴────────────────┘
                                            │
                                            v
                                    [filesystem barrier 4/4
                                     completion msgs PRESENT]
                                            │
                                            v
                                    ┌──────────────┐
                                    │ scribe-opus  │ (PHASE 2 sequential)
                                    │ audit+handoff│
                                    └──────┬───────┘
                                           │
                                           v
                                    ┌──────────────┐
                                    │ orchestrator │ (PHASE 3)
                                    │ build+bench  │
                                    │ +commit+push │
                                    └──────────────┘
```

**Critical paths**:
- Path 1 (Fumetto): F1 → F2 → F3 → F4 sequential within agent.
- Path 2 (Rotation): R1 → R2/R3 parallel within agent → R4 awaits both.
- Path 3 (Design): D1 → D3,D4 parallel → D2 independent. ZERO regression risk (DOC ONLY).
- Path 4 (UNLIM omniscient): U1 unblocks U2+U4 (rag.ts shared file). U3 independent doc.
- Path 5 (Mac Mini retry): D1+D2+D3 carry-forward iter 12 deferred SSH block. Iter 13 background autonomous IF SSH unblocked. ZERO Phase 1 dependency.

**Parallelism**: 4 OPUS agents fully parallel — fumetto-opus, rotation-opus, design-opus, omniscient-opus.

**Anti-conflict**: rag.ts shared between U1+U2 — same agent (omniscient-opus) serializes internally. SimulatorCanvas.jsx LARGE (3149 LOC) — only rotation-opus touches lines 2196-2342 + 2844-2846 (rotation areas). NanoR4Board.jsx (956 LOC) — only rotation-opus touches text rotation lines 375+649+659. NO cross-agent conflict.

---

## §5 — Pass criteria iter 13 close

### §5.1 Universal CoV mandatory all 4 agents
1. **vitest preserve**: `npx vitest run` ≥12599 PASS (iter 12 baseline). Target ≥12700 post Priority 1+2+4 test additions (F4 ~10 + R4 ~15 + U1+U4 ~10 = ~35 new tests minimum). Re-run 3× before declaring "tests pass" (CoV rule).
2. **build PASS**: `npm run build` (heavy ~14 min) — defer PHASE 3 orchestrator. Each agent who ships pure-doc/test only may skip if their changes don't touch `vite.config.js` or src bundle.
3. **baseline preserve**: `automa/baseline-tests.txt` delta ≥0 (NEVER negative — pre-commit hook enforces).
4. **3× verify rule**: every claim ("test pass", "build green", "function works") verified 3 times before stating in completion msg.
5. **completion msg emission MANDATORY** (FIX iter 12 §7.2 protocol gap): `automa/team-state/messages/<agent>-iter13-to-orchestrator-2026-04-28-*.md` writeable BEFORE agent exit. NO scribe Phase 2 spawn until 4/4 PRESENT (filesystem barrier).

### §5.2 Per-priority pass criteria

**Priority 1 Fumetto pass**:
- F1 audit ≥150 LOC + 7 grep findings documented + ALL 7 file paths verified `ls -la` exist.
- F2 redesign visible: SessionReportComic.jsx renders 6 vignettes with REAL session data + Vol/pag citations + Oswald/Open Sans typography + NO emoji icons (regola 11) + NO mock data (regola 12).
- F3 wire-up E2E: voice "crea il report" + UnlimReport listener + simulator-api emit chain connected, manual smoke yields PDF/HTML download.
- F4 tests ≥10 PASS in vitest baseline preserve.

**Priority 2 Rotation pass**:
- R1 audit ≥200 LOC + 11 grep findings cross-referenced + 21 components mapped (`ls src/components/simulator/components/*.jsx`).
- R2 RotationHandle visible on selected component, drag arc snaps 0/90/180/270, touch-target ≥44px verified.
- R3 round-trip Supabase save/load preserves rotation 4-component test PASS.
- R4 ≥15 tests PASS in vitest baseline preserve.
- NanoR4Board pin labels readable at all 4 rotations (visual verify Andrea ratify ~1 min).

**Priority 3 Design pass (DOC ONLY — ZERO regression)**:
- D1 audit ≥250 LOC + 30 worst offenders by file:line + cross-ref `.impeccable.md`.
- D2 spec ≥300 LOC LIM legibility proposal iter 14 implementation.
- D3 critique ≥30 actionable items 4 worst pages.
- D4 design tokens spec ≥150 LOC iter 14 extraction proposal.
- ZERO src/ touch — vitest 12599 + build PASS UNCHANGED.

**Priority 4 UNLIM omniscient pass**:
- U1 chapter+page+section_title NON-NULL in `debug_retrieval` curl smoke OR documented re-ingest required iter 14 (H2 root cause).
- U2 wiki 100 concepts retrievable in hybrid recall@5 measure (B2 iter 13 PHASE 3 bench live).
- U3 spec ≥250 LOC screenshot ingest proposal iter 14.
- U4 5 L2 templates pass dispatcher contract + +5 composite-handler tests PASS + ZERO regression on 129 openclaw baseline.

### §5.3 Iter 13 score gate ONESTO
- 4/4 priorities GREEN + bench live B2+B3 PASS + Box 1+3 ratify Andrea = **9.95/10** (best case, requires Andrea env + ratify ~15 min iter 13).
- 4/4 priorities GREEN + bench live partial = **9.65/10** (target ONESTO acceptable close).
- 3/4 priorities GREEN = **9.50/10** (acceptable, defer 1 priority iter 14).
- ≤2/4 priorities GREEN = **9.30/10 stuck** (UNCHANGED vs iter 12 P1 baseline, defer iter 14 deep debug).

**Honest projection**: 9.65/10 likely. 9.95/10 stretch (depends Mac Mini SSH unblock + Andrea actions chain converge same iter — historical evidence iter 5+6+8+11+12 shows single-iter convergence rare, ~30% probability).

---

## §6 — Mac Mini delegation queue (D1+D2+D3 carry-forward iter 12 + 9-doc audit Phase 1 entry)

**SSH BLOCKER iter 12**: `Permission denied (publickey,password,keyboard-interactive)` on `progettibelli@100.124.198.59`. Tailscale IP reachable (no host issue). Key not authorized.

**Iter 13 entry**: see DELIVERABLE 3 `docs/handoff/2026-04-28-mac-mini-ssh-access-debug.md` — recommended fix (Andrea SSH from MacBook → Mac Mini once with password, append MacBook public key) + filesystem trigger fallback design (git-pull-loop).

**IF SSH unblocked iter 13**:
- D1 elab-builder: 28 ToolSpec expand 52 → 80 (5 per cycle, 6 cycles ~3 days autonomous) → `automa/state/BUILD-RESULT.md`. Iter 13 omniscient-opus U4 ships 5 → 57. Mac Mini D1 covers remaining 23 iter 13-14.
- D2 elab-strategist 9-doc audit Phase 1-6 entry: deploy mappa Phase 1-6 → `automa/state/STRATEGIST-FINDINGS.md`.
- D3 elab-tester R5+R6 stress regression daily → `automa/state/TESTER-RESULTS.md`.

**IF SSH still blocked iter 13**:
- Filesystem trigger fallback: Mac Mini reads `automa/state/NEXT-TASK.md` from origin via cron `git pull` every 5 min, executes task, writes `automa/state/<TASK-ID>-RESULT.md` back, MacBook polls origin for results. SLOWER but unblocked.

**Iter 13 NOT BLOCKING on Mac Mini**: 4 OPUS priorities ship REGARDLESS of Mac Mini state.

---

## §7 — Andrea ratify queue (binary decisions iter 13)

| Decision | ADR ref | Effort Andrea | Score impact |
|----------|---------|---------------|--------------|
| Box 1 VPS GPU decommission strategic | ADR-020 (iter 12 prep) | 3 min read + Y/N | 0.4 → 1.0 (+0.6) |
| Box 3 RAG 1881 chunks coverage redefine | ADR-021 (iter 12 prep) | 3 min read + Y/N | 0.7 → 1.0 (+0.3) |
| (optional) Auto-deploy Edge Function `unlim-chat` post U1+U2 changes | iter 5 P3 policy active | 1 min approve | ensures iter 13 U1+U2 changes live, recall@5 lift verifiable |

**Total Andrea time iter 13**: ~7-10 min ratify queue. Score impact +0.9 if both ADR ratified Y.

---

## §8 — Honesty caveats

1. **Rotation NOT greenfield**: infrastructure exists (11 grep findings). R1-R4 atoms address GAPS not net-new feature. Honest LOC est ~760 (NOT 2000 if greenfield). Acceptance criteria reflect this (extension not creation).
2. **Design Priority 3 NO code change iter 13**: ZERO regression risk MANDATED for 12h sellable deadline. Iter 14 implementation deferred with full SPEC paste-ready. Andrea/Tea may review specs without time pressure.
3. **U1 metadata fix may be H1 (trivial 30 LOC) OR H2 (re-ingest scope creep iter 14)**: contract expects U1 atom completes diagnostic + applies trivial fix if H1, else documents H2 explicitly with cost estimate iter 14 re-ingest.
4. **U4 ClawBot L2 5 templates iter 13** (NOT 28): rest carry-forward Mac Mini D1 iter 13-14. Honest: 80-tool maturity is multi-iter goal, NOT iter 13 single-shot.
5. **9.95/10 NOT projected iter 13 close**: only 9.65 honest target. Inflation risk identified iter 5+6+8 history (claimed scores recalibrated post-verify multiple times — last instance iter 5 P2 6.75 → 6.35 ricalibrato).
6. **Mac Mini D1+D2+D3 carry-forward iter 12 deferred**: NOT new iter 13 atoms. If SSH unblocked iter 13 entrance, autonomous pickup. If still blocked, filesystem trigger fallback. NOT iter 13 Phase 1 gating.
7. **Iter 13 12h deadline**: not enough time for Vision E2E live execution (Playwright spec ready iter 8+12, ~10 min run + Andrea env ~5 min — IF time permits PHASE 3, B7 Vision lift to 0.70). Otherwise defer iter 14.
8. **Vitest 12700 target may overshoot baseline preserve**: F4 ~10 + R4 ~15 + U1 ~5 + U4 ~5 = ~35 NEW tests. If any test FLAKY, baseline could regress. CoV 3× verify rule enforces stability before completion msg emission.
9. **Edge Function auto-deploy iter 5 P3 policy**: applies to U1+U2 rag.ts changes if R5 ≥90% verified post-deploy. Andrea iter 13 verify ~1 min curl smoke or skip auto-deploy (manual gate).

---

## §9 — Filesystem barrier protocol (FIX iter 12 §7.2 gap)

PHASE 1 → PHASE 2 transition triggered by **4/4 completion messages PRESENT** (file system verify):
- `automa/team-state/messages/fumetto-opus-iter13-to-orchestrator-2026-04-28-*.md`
- `automa/team-state/messages/rotation-opus-iter13-to-orchestrator-2026-04-28-*.md`
- `automa/team-state/messages/design-opus-iter13-to-orchestrator-2026-04-28-*.md`
- `automa/team-state/messages/omniscient-opus-iter13-to-orchestrator-2026-04-28-*.md`

**Iter 13 EXPLICIT msg-emission CoV step MANDATORY each agent contract**: agent's COMPLETION step MUST include `Write` tool call to `automa/team-state/messages/<agent>-iter13-to-orchestrator-2026-04-28-<HHMMSS>.md` BEFORE final response. Confirms via `ls -la` post-write.

**scribe-opus PHASE 2 MUST verify all 4 present BEFORE Phase 2 spawn** (race-cond fix iter 5+ validated 5×, iter 12 §7.2 protocol gap mitigated).

**orchestrator PHASE 3 MUST verify scribe completion msg BEFORE bench runner exec**:
- `automa/team-state/messages/scribe-opus-iter13-to-orchestrator-2026-04-28-*.md`

---

## §10 — Orchestrator iter 13 entry actions (5-7 concrete first steps)

For orchestrator that picks up iter 13 dispatch (THIS contract is dispatch payload):

1. **Read this contract** end-to-end: `Read /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/pdr/sprint-S-iter-13-contract.md` (~600 LOC).
2. **Pre-flight CoV**: run `npx vitest run | tail -10` + capture PASS count → must be ≥12599. Run `node scripts/benchmark.cjs --fast` → capture iter 13 entrance score.
3. **Live bench B1+B2 smoke** (if Andrea env provided): `bash scripts/runner-smoke-iter12.sh` (or equivalent) → unlim-chat curl smoke 200 OK + record latency. If env missing, defer Phase 3.
4. **Spawn 4 OPUS agents in parallel**: read 4 dispatch briefs from `automa/team-state/messages/iter13-coordinator-to-{fumetto,rotation,design,omniscient}-opus-2026-04-28-*.md`, dispatch each via Task tool with `subagent_type: opus` + brief content as prompt. ALL 4 PARALLEL same message (no waterfall).
5. **Monitor filesystem barrier**: poll `ls automa/team-state/messages/*-iter13-to-orchestrator-2026-04-28-*.md` every 5 min until 4/4 PRESENT. If timeout (>4h per agent), spawn retry on stalled agent ONLY (preserve other 3 progress).
6. **Spawn scribe-opus PHASE 2 sequential** AFTER 4/4 barrier: scribe writes audit + handoff + CLAUDE.md append iter 13 close section (per Pattern S iter 5+ validated 5×).
7. **PHASE 3 orchestrator self-execute**: `npm run build` (~14 min), if PASS run `node scripts/bench/iter-12-bench-runner.mjs` (or iter-13 if updated U2 wiki fusion impacts B2), commit batch + push origin (per Andrea iter-9 unblock policy main branch direct push). Score recalibrate ONESTO post live measure.
8. **(optional) Andrea ratify queue dispatch**: write `automa/state/ANDREA-RATIFY-iter-13.md` listing ADR-020 + ADR-021 + (optional) Edge Function deploy approval — Andrea reads + replies Y/N each.

**Time budget iter 13 orchestrator**:
- Step 1-4 (dispatch): ~30 min.
- Step 5 (barrier wait): ~3-5h parallel agent work.
- Step 6 (scribe Phase 2): ~45 min.
- Step 7 (PHASE 3 build+bench+commit+push): ~30 min.
- **Total iter 13**: ~5-7h (within 12h sellable deadline window).

---

## §11 — Iter 13 close projected files inventory

NEW files iter 13 (target end-state):
- `docs/audits/2026-04-28-fumetto-perfection-audit.md` (F1)
- `docs/audits/2026-04-28-rotation-engine-audit.md` (R1)
- `docs/audits/2026-04-28-design-impeccable-LIM-audit.md` (D1)
- `docs/audits/2026-04-28-design-critique-4-pages.md` (D3)
- `docs/specs/SPEC-iter-14-design-LIM-legibility.md` (D2)
- `docs/specs/SPEC-iter-14-design-system-extraction.md` (D4)
- `docs/specs/SPEC-iter-14-screenshot-rag-ingest.md` (U3)
- `src/components/simulator/overlays/RotationHandle.jsx` (R2)
- `tests/unit/SessionReportComic.test.jsx` (F4)
- `tests/unit/SimulatorCanvas-rotation.test.jsx` (R4)
- `tests/integration/rotation-persistence.test.js` (R4)
- `tests/unit/rag-metadata-surface.test.js` (U1)
- `scripts/diagnose-rag-metadata.mjs` (U1)
- `scripts/openclaw/l2-templates/{lesson-intro,debug-circuit,explain-error,review-code,session-recap}.ts` (U4 — 5 files)
- `automa/team-state/messages/{fumetto,rotation,design,omniscient}-opus-iter13-to-orchestrator-2026-04-28-*.md` (4 completion msgs)
- `automa/team-state/messages/scribe-opus-iter13-to-orchestrator-2026-04-28-*.md` (scribe completion msg PHASE 2)
- `docs/audits/2026-04-28-sprint-s-iter13-PHASE1-FINAL-audit.md` (scribe)
- `docs/handoff/2026-04-28-sprint-s-iter-13-to-iter-14-handoff.md` (scribe)
- `docs/handoff/2026-04-28-mac-mini-ssh-access-debug.md` (this iter, see DELIVERABLE 3)

MODIFIED files iter 13:
- `src/components/lavagna/SessionReportComic.jsx` (F2)
- `src/components/lavagna/SessionReportComic.module.css` (F2)
- `src/components/unlim/UnlimReport.jsx` (F3)
- `src/services/simulator-api.js` (F3)
- `src/components/lavagna/LavagnaShell.jsx` (F3)
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (R2)
- `src/components/simulator/components/NanoR4Board.jsx` (R1)
- `src/services/api.js` (R3)
- `supabase/functions/_shared/rag.ts` (U1+U2)
- `scripts/openclaw/composite-handler.ts` (U4)
- `scripts/openclaw/composite-handler.test.ts` (U4 +5 tests)
- `CLAUDE.md` (scribe append iter 13 close section)

**Total NEW files iter 13**: 22. **Total MODIFIED files iter 13**: 12. **Estimated LOC delta**: ~3670 NEW + ~870 MODIFY = ~4540 LOC.

---

## §12 — Cross-cutting hygiene checklist (orchestrator + scribe shared duty iter 13 close)

These items spread across multiple agents but no single owner. Orchestrator + scribe verify at PHASE 2 + PHASE 3:

1. **CLAUDE.md append iter 13 close section**: scribe-opus PHASE 2 writes ~80 LOC append matching iter 5/6/8/11/12 sprint-history pattern. Include: 4 priorities recap + LOC delta + vitest delta + score box recalibrate + honesty caveats + iter 14 priorities preview + Andrea ratify queue results + activation string iter 14 §1.
2. **`automa/baseline-tests.txt` update**: post all 4 agents merge, vitest baseline file refresh via existing pre-commit hook OR manual `npx vitest run | grep "Tests" > automa/baseline-tests.txt` (orchestrator PHASE 3).
3. **Edge Function deploy decision** (omniscient U1+U2 changes to rag.ts): per iter 5 P3 auto-deploy policy, deploy IF R5 stays ≥90% post-change. Curl smoke verify post-deploy, rollback if regression.
4. **Commit batch strategy iter 13 PHASE 3**: NO `git add -A` blanket (CLAUDE.md anti-regression rule). Stage per-priority groups: F-prefix files → 1 commit, R-prefix → 1 commit, D-prefix → 1 commit, U-prefix → 1 commit, scribe deliverables → 1 commit. 5 commits total iter 13 close, all push origin per Andrea iter-9 unblock policy.
5. **Pre-commit hook compliance**: each commit must pass guard scripts (`scripts/guard-critical-files.sh` + baseline-tests delta) — anticipate hook may fail on SimulatorCanvas.jsx (R2) since file critico. If guard fail, document + Andrea ratify exception (1-line approval) before retry.
6. **`scripts/benchmark.cjs --write` post iter 13 close**: orchestrator PHASE 3 runs full benchmark (NOT --fast), writes `automa/state/benchmark.json` with delta vs iter 12 baseline. Score recalibrate ONESTO uses this output.
7. **Mac Mini SSH unblock outcome**: scribe PHASE 2 documents in iter 13 close audit whether D1+D2+D3 dispatched (Path A success) OR filesystem trigger fallback active OR carry-forward iter 14 (Path A+B both fail).
8. **Andrea ratify queue results**: scribe PHASE 2 records ADR-020 Y/N + ADR-021 Y/N + Edge Function deploy approval Y/N. Score impact recalibrate per response.
9. **Sense 1.5 morfismo evidence iter 13**: U4 5 L2 templates begin runtime activation per ADR-019 iter 12. Scribe verifies each template includes context-adaptation hooks (docente experienced flag, classe primaria flag, kit basic flag) — NOT just static templates with no Sense 1.5 awareness.
10. **PRINCIPIO ZERO compliance verify**: F4 + R4 + U4 tests include plurale "Ragazzi," regex assertion + Vol/pag citation regex assertion (per `_shared/principio-zero-validator.ts` iter 2 ship + iter 12 ADR alignment).

---

**End of iter 13 contract**. Total atoms: 16 (4 priorities × 4 atoms). Total agents iter 13 PHASE 1: 4 OPUS parallel + 1 scribe-opus PHASE 2 sequential + 1 orchestrator PHASE 3.

— iter13-coordinator-opus, 2026-04-28 05:30 CEST. CAVEMAN MODE. ONESTÀ MASSIMA. NO inflation. 9.65/10 honest target NOT 9.95.
