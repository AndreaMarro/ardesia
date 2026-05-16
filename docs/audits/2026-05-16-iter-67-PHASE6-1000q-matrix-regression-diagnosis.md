# Iter 67 PHASE 6 — 1000q matrix re-verify + regression deep diagnosis

**Date**: 2026-05-16 PM CEST (PHASE 6 close ~30min orchestrator inline + 2x 1000q matrix BG)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD `d9049afb` (iter 67 PHASE 5 close)
**Score iter 67 PHASE 6 close ONESTO G45**: **9.5/10** (−0.05 vs PHASE 5 9.55 — honesty deduction PRE-EXISTING regression surfaced)

## Executive summary

Step 7 1000q matrix iter 41 v67 re-verify post v55 deploy iter 67 PHASE 2 = **NOT 100% restore**. Initial PHASE 5 audit assumed iter 41 v67 baseline preserved + only ENABLE_ONNISCENZA_V2 effect potentially regressed. **REALTY**: deeper PRE-EXISTING regression surfaced by FIXTURE expansion iter 50+ + offtopic detector hallucination bug.

Two runs comparison:
- Run 1 PHASE 5: `ENABLE_ONNISCENZA_V2=true` (post iter 67 PHASE 2 deploy) = **91.4%** (914/1000)
- Run 2 PHASE 6: `ENABLE_ONNISCENZA_V2=false` (post P0 rollback) = **92.1%** (921/1000)

**NEITHER restores iter 41 v67 baseline 1000/1000 (100% 3x CoV Andrea exit criteria)**.

Net deduction: V2 rollback recovered minor categories (color/diag 100% restore) but NOT volpag (35%) NOR offtopic (88%). **Real regression NOT iter 65-67 code change, but pre-existing bugs surfaced post iter 50+ fixture expansion**.

## Categories regression matrix

| Category | iter 41 v67 baseline | V2 ON PHASE 5 | V2 OFF PHASE 6 | Real issue |
|---|---|---|---|---|
| amb | 100% | 100% | 100% | ✅ no regression |
| concept | 100% | 100% | 100% | ✅ no regression |
| control | 100% | 100% | 100% | ✅ no regression |
| highlight | 100% | 100% | 100% | ✅ no regression |
| volnav | 100% | 100% | 100% | ✅ no regression |
| color | 100% | 98% | 100% | ✅ V2 effect only, rollback restored |
| diag | 100% | 98% | 100% | ✅ V2 effect only, rollback restored |
| expnav | 100% | 100% | 97.5% (2 no_plurale) | 🟡 V2 OFF revealed edge case |
| **offtopic** | 100% | 95% | **88%** (12 fail) | 🔴 **BUG offtopic detector verb-match hallucination** |
| **volpag** | 100% | 23% | **35%** (65 fail) | 🔴 **REGEX DETECTOR coverage gap iter 41 vs fixture iter 50+** |
| **TOTAL PASS** | **100%** | 91.4% | **92.1%** | **-7.9pp regression** |
| JSON_LEAK | 0 | 0 | 0 | ✅ preserved |
| HTTP_ERRORS | 0 | 0 | 0 | ✅ preserved |
| NO_PLURALE | 0 | 4 | 2 | -2pp minor |

## Root cause analysis (real, not surface)

### 🔴 P0 — Offtopic detector verb-match HALLUCINATION (12 failures)

**Bug**: `operational-response.ts` experiment-load detector matches Italian verbs (apri/carica/leggi/apertura) WITHOUT validating experiment ID exists in `experiments-vol{1,2,3}.js` registry.

**Sample failure** (`b795afb3d.jsonl` offtopic-1):
```
Query: "Borsa Tokyo apertura"
Response: Ragazzi, carico l'esperimento "Borsa Tokyo Apertura". [AZIONE:loadexp:borsa_tokyo_apertura]
```

Detector matched verb "apertura" + emitted FAKE `[AZIONE:loadexp:borsa_tokyo_apertura]` for non-existent experiment ID `borsa_tokyo_apertura`. Real user clicks → broken state.

**Fix iter 68 P0**: add registry validation `validateExperimentIdExists(id)` from `experiments-vol{1,2,3}.js` BEFORE emit mountExperiment OR loadexp intent. Reject (return null) if not found → fall-through LLM offtopic redirect.

### 🔴 P1 — Volpag detector regex coverage gap (65 failures)

**Bug**: `operational-response.ts:352` regex iter 41 NEW:
```js
/\b(?:leggi(?:amo)?|apri|aprite|carica(?:te)?|mostra(?:mi|te)?|vai\s+a|portami\s+a)?\s*vol(?:ume)?\.?\s*([123])\s+cap(?:itolo)?\.?\s*(\d{1,2})\b/i
```

**Catches** (vol-FIRST cap-X pattern): "leggi vol.3 cap.13", "apri vol.1 cap.6", "carica vol.2 cap.7"
**Does NOT catch** (page-FIRST OR mixed patterns):
- "Vai a pagina 67 Volume 2" (page-FIRST, "Volume" capital after page)
- "Cosa contiene pagina 102 del Volume 1?" (query pattern, "del")
- "Cosa dice il libro a pagina 134?" (no volume cite at all)
- "Riferisci Volume 2 pagina 18" (vol-FIRST but `pagina` not `cap`)
- "Vai a pagina 45 Volume 3" (page-FIRST verb at start)

**Fixture evolution**: iter 41 v67 fixture used vol-FIRST cap-X patterns → 100% detector hit rate. Iter 50+ fixture `1000-queries.jsonl` extended page-FIRST patterns + page-only patterns + pagina-cite patterns. Detector regex never updated. Fall-through LLM → LLM correctly understands query (e.g., "Volume 2 arriva fino a pagina 122") but does NOT emit verbatim "Vol.2 pag.18" citation → scorer flag `volpag_missing_citation`.

**Fix iter 68 P0**: extend regex 5 pattern variants:
1. page-FIRST: `pagina\s+(\d+)\s+volume\s+([123])` → "pagina X Volume Y"
2. del-pattern: `pagina\s+(\d+)\s+del\s+volume\s+([123])` → "pagina X del Volume Y"
3. cosa-dice: `pagina\s+(\d+)$` (page-only when LLM can resolve volume from context) → defer cap context
4. vol-pagina: `vol(?:ume)?\.?\s*([123])\s+pagina\s+(\d+)` → "Volume X pagina Y"
5. cosa-contiene: `contiene\s+pagina\s+(\d+)\s+(?:del\s+)?volume\s+([123])`

Plus: BASE_PROMPT v3.1 enforce LLM emit `Vol.X pag.Y` verbatim when query mentions volume + page (Principio Zero citation MANDATORY).

### 🟡 P2 — expnav no_plurale 2 failures

Minor edge case. Iter 68 P3 minor fix.

### 🟢 V2 effect minor

ENABLE_ONNISCENZA_V2=true added 2pp color/diag failures + 12pp volpag worsening (35→23). Rollback OK preserved. V2 wire-up Atom 2.5 iter 65 likely interferes with Vol/pag retrieval flow when active. Iter 68+ before re-enable V2: diagnose interaction + canary test.

## Mitigation iter 67 PHASE 6 deployed

1. ✅ Rollback `ENABLE_ONNISCENZA_V2=false` via secrets set explicit (NOT unset, auditable)
2. ✅ Redeploy `unlim-chat --no-verify-jwt` v240+ (preserves warmup_cron fix iter 67 PHASE 3)
3. ✅ Re-test 1000q matrix BG verified 92.1% (V2 effect isolated)
4. ⏸ Volpag regex extension iter 68 P0 (~2h orchestrator inline)
5. ⏸ Offtopic detector registry validation iter 68 P0 (~2h orchestrator inline)
6. ⏸ Re-test 1000q matrix post-fixes target ≥98%

## Iter 68 entrance P0 priorities REFINED (post PHASE 6 findings)

| Atom | Scope | Effort | Priority |
|---|---|---|---|
| **A-NEW-1** | Offtopic detector registry validation fix (operational-response.ts) | 2h orchestrator inline | P0 CRITICAL (hallucination prod) |
| **A-NEW-2** | Volpag detector regex 5 pattern variants extension | 2h orchestrator inline | P0 CRITICAL (citation Principio Zero) |
| **A-NEW-3** | Re-test 1000q matrix verify ≥98% post-fixes | ~5min BG | P0 verification gate |
| **A-NEW-4** | Andrea ratify re-enable ENABLE_ONNISCENZA_V2=true OR keep V2 OFF permanente | 5min | P0 decision |
| A0+A1.5+A2+A3 (iter 67 PHASE 5 atomization) | iter 63 ELAB Agent completion | 6-10h | P1 (defer post P0 fixes) |
| A7 Volume 3 capitoli inconsistency audit | 2h | P1 | |
| A6 forbidden patterns hook | 1h | P2 | |
| Matteo team integrate | 30min | P3 | |
| ELAB_API_KEY rotation iter 32 protocol | 30min Andrea | P0 SECURITY |

## Honesty caveats critical PHASE 6

1. **iter 67 PHASE 2 deploy NOT primary regression cause** — V2 effect minor (2pp color/diag + 12pp volpag worsening). Real regression PRE-EXISTING + surfaced by fixture iter 50+ expansion.
2. **iter 41 v67 baseline 100% WAS REAL for old fixture set** (vol-FIRST cap-X patterns only). New fixture set (page-FIRST + page-only) NEVER tested 100% — coverage gap silent iter 50-66.
3. **Offtopic hallucination = P0 PROD BUG** "Borsa Tokyo apertura" emits fake `[AZIONE:loadexp:borsa_tokyo_apertura]` — user clicks broken. Need fix iter 68 P0 ASAP.
4. **Volpag regex iter 41 NEW** only catches 35% current fixture. Citation Principio Zero violation 65% volpag queries → user docente gets navigation BUT no verbatim "Vol.X pag.Y" cite (violation Andrea iter 21+ mandate).
5. **V2 ON ADDITIONAL effect 12pp volpag worsening** — Atom 2.5 wire-up iter 65 interferes with citation flow when active. Defer V2 ON re-enable iter 69+ post fixes verified.
6. **PHASE 6 NO new feature shipped** — diagnostic + rollback only. Score 9.5/10 honest (−0.05 vs PHASE 5 9.55 acknowledgment PRE-EXISTING regression surfaced this iter).

## Anti-inflation G45 enforced PHASE 6

- Cap 9.5/10 honest (raw 9.55 → 9.5 PRE-EXISTING regression honest deduction)
- NO claim "1000q matrix 100% verified" (92.1% admitted)
- NO claim "ENABLE_ONNISCENZA_V2 restored to V1 baseline" (regression NOT V2-only)
- NO claim "iter 67 PHASE 2 caused regression" (V2 effect minor, real cause PRE-EXISTING fixture mismatch + bug)
- NO claim above 9.7 senza Volpag + offtopic fixes verified ≥98% iter 68

## Cross-link PHASE 6

- PHASE 6 audit: `docs/audits/2026-05-16-iter-67-PHASE6-1000q-matrix-regression-diagnosis.md` (THIS file)
- 1000q matrix results V2 ON: `scripts/bench/output/1000-matrix-{results,failures,report}-2026-05-16T14-43-30.{jsonl,txt}`
- 1000q matrix results V2 OFF: `scripts/bench/output/1000-matrix-{results,failures,report}-2026-05-16T15-08-47.{jsonl,txt}`
- Volpag detector code: `supabase/functions/_shared/operational-response.ts:349-362`
- Iter 41 v67 baseline reference: CLAUDE.md "Sprint U iter 41 v67 close" section
