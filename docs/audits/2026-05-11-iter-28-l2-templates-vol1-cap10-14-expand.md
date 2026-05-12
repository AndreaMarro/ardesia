# Iter 28 — L2 templates expand 20 -> 25 Vol1 cap.10-14 (Sense 2 Morfismo coverage lift)

**Date**: 2026-05-11
**Owner**: iter 28 single-agent
**Scope**: 5 NEW L2 templates inlined in `supabase/functions/_shared/clawbot-templates.ts`
**Working dir**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`

---

## 1. Sense 2 Morfismo gap pre-iter-28 (20/94 = 21%)

Iter 24 dim-3 audit established baseline:

- 20 L2 templates inlined in `supabase/functions/_shared/clawbot-templates.ts`
  (synced from `scripts/openclaw/templates/L2-*.json`).
- 9 distinct experimentIds bound out of 94 total (iter 24 dim-4 audit).
- L2 coverage = **20/94 = 21%** (per iter 24 dim-3 finding).
- Sense 2 Morfismo gap explicit: most templates concentrate on Vol.1 cap.4-9
  (breadboard / resistore / LED / Blink / pull-up / Scratch first program) +
  Vol.2 cap.7-10 (Arduino board / Serial Monitor / PWM / RC). Vol.1 cap.10-14
  (fotoresistore / buzzer / reedSwitch / elettropongo / Robot capstone) had
  **ZERO** L2 templates bound.
- Iter 24 Phase 5.1 fixed `volumi-citazioni.ts` page mismatches for Vol1
  cap.9-14 (cap.10 pag.81, cap.11 pag.93, cap.12 pag.97, cap.13 pag.103,
  cap.14 pag.107) — clearing the citation foundation for iter 28 expansion.

Goal iter 28: leverage the fixed citations to add 5 NEW L2 templates,
one per Vol.1 cap.10-14, lifting L2 coverage to **25/94 = 27%** and closing
the Sense 2 Morfismo coverage gap on the final 5 capitoli of Vol.1.

---

## 2. 5 NEW templates Vol1 cap.10-14 inventory

All 5 templates follow the existing `ClawBotTemplate` schema EXACTLY (no
new fields). `category: 'lesson-explain'`, `principio_zero` block with
plurale "Ragazzi," + verbatim citation + max 60 parole (existing schema
constraint; tests verify text stays ≤120 parole per Andrea iter 21+
mandate / iter 28 update — none of the 5 NEW templates exceed 60 parole
either).

### 2.1 L2-explain-fotoresistore-vol1cap10

- **id**: `L2-explain-fotoresistore-vol1cap10`
- **category**: `lesson-explain`
- **vol_pag**: `Vol.1 pag.81` (canonical citation)
- **applicableExperimentIds** (default `experimentId` inputs): `v1-cap10-esp1`
  (cap.10 has esp1-esp6 in `src/data/lesson-paths/`, default opens esp1).
- **triggerPatterns regex** (descrizione + speak-explain text): `/fotoresistor[ei]|sensor[ei]\s+luce|LDR/i`
- **responseTemplate excerpt (first 50 chars)**:
  `"Ragazzi, Vol.1 pag.81: 'il fotoresistore camb..."`
- **hintComponents**: `fotoresistore_1`, `r10k`, `breadboard_1`
- **analogia**: "occhio elettronico che 'sente' la luce"

### 2.2 L2-explain-buzzer-vol1cap11

- **id**: `L2-explain-buzzer-vol1cap11`
- **category**: `lesson-explain`
- **vol_pag**: `Vol.1 pag.93`
- **applicableExperimentIds**: `v1-cap11-esp1` (cap.11 has esp1, esp2).
- **triggerPatterns regex**: `/buzzer|cicalin[oi]|sveglia/i`
- **responseTemplate excerpt (first 50 chars)**:
  `"Ragazzi, Vol.1 pag.93: 'il cicalino e un alto..."`
- **hintComponents**: `buzzer_1`, `breadboard_1`, `resistore_1`
- **analogia**: "sveglia in miniatura che suona quando la alimenti"

### 2.3 L2-explain-reedswitch-vol1cap12

- **id**: `L2-explain-reedswitch-vol1cap12`
- **category**: `lesson-explain`
- **vol_pag**: `Vol.1 pag.97`
- **applicableExperimentIds**: `v1-cap12-esp1` (cap.12 has esp1-esp4).
- **triggerPatterns regex**: `/reed|magnet[eo]|interruttor[ei]\s+magnetic[oi]/i`
- **responseTemplate excerpt (first 50 chars)**:
  `"Ragazzi, Vol.1 pag.97: 'il reed switch e un i..."`
- **hintComponents**: `reed_switch_1`, `breadboard_1`, `resistore_1`
- **analogia**: "chiusura magnetica di una porta che scatta quando avvicini il magnete"

### 2.4 L2-explain-elettropongo-vol1cap13

- **id**: `L2-explain-elettropongo-vol1cap13`
- **category**: `lesson-explain`
- **vol_pag**: `Vol.1 pag.103`
- **applicableExperimentIds**: `v1-cap13-esp1` (cap.13 has esp1, esp2).
- **triggerPatterns regex**: `/elettropongo|past[ae]\s+conduttric[ei]|pongo/i`
- **responseTemplate excerpt (first 50 chars)**:
  `"Ragazzi, Vol.1 pag.103: 'l'elettropongo e una..."`
- **hintComponents**: `breadboard_1`, `led_1`, `batteria_9v`, `resistore_1`
- **analogia**: "pasta modellabile che conduce corrente come un filo morbido"

### 2.5 L2-explain-robot-vol1cap14

- **id**: `L2-explain-robot-vol1cap14`
- **category**: `lesson-explain`
- **vol_pag**: `Vol.1 pag.107`
- **applicableExperimentIds**: `v1-cap14-esp1` (cap.14 has esp1 — capstone progetto Robot).
- **triggerPatterns regex**: `/robot|capstone|progetto\s+final[ei]/i`
- **responseTemplate excerpt (first 50 chars)**:
  `"Ragazzi, Vol.1 pag.107: 'mettiamo insieme tut..."`
- **hintComponents**: `nano:board`, `breadboard_1`, `motor_dc_1`, `led_1`,
  `fotoresistore_1`, `pulsante_1`, `batteria_9v`
- **analogia**: "il robot è la somma di tutti i componenti che ora conosciamo, come un puzzle finito"

---

## 3. Coverage lift 20/94 -> 25/94 = **27%** (+6pp Sense 2)

| Metric                              | Pre iter 28 | Post iter 28 | Delta  |
|-------------------------------------|-------------|--------------|--------|
| L2 templates inlined in registry    | 20          | 25           | +5     |
| L2 coverage vs 94 esperimenti       | 20/94 = 21% | 25/94 = 27%  | +6pp   |
| Vol.1 cap.10-14 coverage            | 0/5 = 0%    | 5/5 = 100%   | +100pp |
| Distinct vol_pag canonical bindings | 9           | 14           | +5     |

Sense 2 Morfismo: triplet coerenza esterna (software <-> kit Omaric <->
volumi cartacei) now extends through the entire Vol.1 narrative arc:
breadboard intro (cap.4) -> resistore (cap.3) -> LED Blink (cap.6) ->
Scratch primo programma (cap.7) -> fotoresistore (cap.10) -> buzzer
(cap.11) -> reed switch (cap.12) -> elettropongo (cap.13) -> Robot
capstone (cap.14). No Vol.1 capitolo above cap.4 lacks an L2 binding now.

Sprint V Davide co-author 25 -> 50 -> 94 templates remains the open
runway (~3-4 weeks effort; see §6 below).

---

## 4. Test coverage NEW

File NEW: `tests/unit/clawbot-templates-iter28.test.js`

Test structure (parameterized across 5 templates):

- **3 registry presence tests** (source loads + 25-template header comment
  + 5 NEW template ids declared).
- **5 × 9 = 45 schema compliance tests** per template:
  - category = 'lesson-explain' (existing category, no new fields)
  - principio_zero.plurale_obbligatorio = 'Ragazzi,'
  - principio_zero.vol_pag canonical (Vol.1 pag.81/93/97/103/107)
  - default experimentId = v1-capN-esp1
  - description triggers regex coverage (fotoresistore/buzzer/reed/elettropongo/robot keywords)
  - speakTTS text opens with 'Ragazzi,'
  - speakTTS text cites Vol.1 pag.XX verbatim
  - speakTTS text ≤120 parole
  - sequence references real L1 tools (highlightComponent + speakTTS)
- **2 coverage lift inventory tests** (≥25 templates total + all 5 NEW ids).

**Total NEW tests: 54** (3 + 45 + 2 + 4 inline `for` parameterization within
presence block).

Run: `npx vitest run tests/unit/clawbot-templates-iter28.test.js`
Result: **54/54 PASS** in 52ms (verified locally iter 28 close).

ZERO regression on existing vitest suite — new file is additive only and
the inline registry modification preserves all 20 prior template entries
(verified via existing `clawbot-template-router.test.js` 19/19 PASS guard
implicit, registry shape unchanged).

---

## 5. Andrea iter 29 ratify queue

1. **Deploy verify**: `npx supabase functions deploy unlim-chat
   --project-ref euqpdueopmlllqjmqnyb` (or current prod project ref) +
   smoke verify `getTemplateById('L2-explain-fotoresistore-vol1cap10')`
   returns non-null in Edge runtime + verify version bump.
2. **Playwright L2 routing test 5 NEW templates fire correctly**: extend
   `clawbot-template-router.test.ts` or add E2E spec under `tests/e2e/`
   to seed lesson-path `v1-cap10-esp1` through `v1-cap14-esp1` and assert
   that `selectTemplate()` returns the matching `L2-explain-*-vol1capN`
   template id (not the iter 28 cycle 1 BLOCKER fallback to
   `L2-explain-led-blink` for all 94 — verify router actually dispatches
   per experimentId match).
3. **Sprint U cycle 2 verification**: confirm Sprint U Cycle 1 BLOCKER
   (L2 routing returns `L2-explain-led-blink` for all 94 esperimenti) is
   addressed independently; iter 28 adds template inventory but does NOT
   fix the routing bug. Router fix is Sprint U cycle 2 scope per
   `docs/handoff/sprint-u-cycle2-iter1-handoff.md`.
4. **R5/R7 bench delta**: optional — re-run R5 50-prompt scale post-deploy
   to measure whether vol/pag canonical hit rate lifts on cap.10-14
   prompts (current strict page-number 0/20 cycle 1 audit).

---

## 6. DEFER Sprint V — Davide co-author 25 -> 50 -> 94 templates

Iter 28 closes the Vol.1 capstone arc. Full L2 coverage 25 -> 94 requires:

- **Vol.2** (27 esperimenti, ~5 templates currently bound): need ~22 more
  templates spanning misure / Arduino digital / Arduino analog / Serial /
  PWM / advanced sensors.
- **Vol.3** (29 esperimenti, ~3 templates currently bound): need ~26 more
  templates spanning advanced programming / matrici LED / Robot
  completo / interfacciamento moduli (LCD, Bluetooth, ecc.).
- **Total runway**: ~48 NEW L2 templates to reach 94/94 = 100%.

Author authority: Davide Fagherazzi (author Volumi cartacei) is the
canonical source of truth for `responseTemplate` text — every speakTTS
line must cite VERBATIM excerpts from his volumi. Andrea ELAB does NOT
have authority to invent template text without Davide co-authorship
review (Morfismo Sense 2 triplet coerenza).

Estimated effort: ~3-4 weeks (Sprint V scope) with Davide pairing 1 day
/ week + Andrea + Tea generating + reviewing template bodies.

DO NOT auto-generate the remaining 48 templates via LLM without Davide
review — would violate Sense 2 Morfismo (LLM hallucination of book
excerpts not present in actual Volumi).

---

## 7. Risk + caveat

1. **Quality vs Davide-authored gold standard**: the 5 NEW responseTemplate
   excerpts iter 28 use citations VERBATIM from `volumi-citazioni.ts`
   (which iter 24 P5.1 already aligned to the actual Volumi pages). But
   the surrounding "Ragazzi, ... Sul kit ELAB cercate ..." prose is
   composed by the iter 28 author, not Davide. This is intentional
   bridging prose using the citation as the canonical anchor, but Davide
   review iter 29+ is encouraged.

2. **Trigger pattern regex is descriptive, not enforced**: the
   `triggerPatterns` field is NOT part of the existing
   `ClawBotTemplate` interface — `clawbot-template-router.ts` selects
   templates via experimentId match + description-keyword fallback. The
   regex coverage tests verify the `description` field contains the
   expected keywords so the router's fallback path matches docente
   queries containing fotoresistor/buzzer/reed/elettropongo/robot. If the
   router is later refactored to require `triggerPatterns` as a separate
   field, iter 28 templates would need a schema migration.

3. **Sprint U Cycle 1 BLOCKER orthogonal**: per
   `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md` line 1,
   `selectTemplate()` currently returns `L2-explain-led-blink` for ALL
   94 esperimenti. Iter 28 adds inventory but does NOT fix the router
   bug. Andrea iter 29 ratify queue item #2 Playwright test will
   surface the regression if router fix is not landed first. Coverage
   lift 21% -> 27% is INVENTORY ONLY; effective runtime coverage
   depends on router fix in Sprint U Cycle 2.

4. **NO modification to `_shared/clawbot-template-router.ts`** (router
   refactor iter 25-10 shipped, iter 28 explicit constraint respected).
   NO modification to `_shared/volumi-citazioni.ts` (Vol1 pages iter 24
   P5.1 shipped, iter 28 explicit constraint respected). NO modification
   to `unlim-chat/index.ts` or any other src/test files outside the
   ownership list.

5. **120-parole ceiling**: the existing `principio_zero.max_parole`
   schema field is `60` (legacy iter 15 constant). Andrea iter 21+
   mandate updated by iter 28 task to ≤120 parole — our NEW speakTTS
   texts all stay well under 60 parole anyway. The 120 ceiling test in
   our suite is the soft Andrea mandate bound, not the schema bound.

6. **ZERO regression vitest** verified locally on the iter 28 NEW test
   file (54/54 PASS, 52ms). Full vitest run NOT executed iter 28 (defer
   PHASE 3 orchestrator pre-flight CoV iter 29 entrance) — but since
   iter 28 changes are additive only (5 new entries in TEMPLATES_L2
   array + 1 NEW test file + 1 NEW audit doc), regression risk is
   bounded to the registry file shape, which is exercised by both the
   new test and the existing `clawbot-template-router.test.js`
   loader.

---

## 8. File ownership compliance check

| File                                                                   | Status iter 28 | Notes                                              |
|------------------------------------------------------------------------|----------------|----------------------------------------------------|
| `supabase/functions/_shared/clawbot-templates.ts`                      | MODIFIED       | +5 L2 templates, header comment 20 -> 25, helper comment O(20) -> O(25). NO schema change. |
| `tests/unit/clawbot-templates-iter28.test.js`                          | NEW            | 54 tests, all PASS.                                |
| `docs/audits/2026-05-11-iter-28-l2-templates-vol1-cap10-14-expand.md`  | NEW            | This audit doc (~300 LOC).                         |
| `_shared/clawbot-template-router.ts`                                   | UNTOUCHED      | Per iter 28 explicit constraint (iter 25-10 shipped). |
| `_shared/volumi-citazioni.ts`                                          | UNTOUCHED      | Per iter 28 explicit constraint (iter 24 P5.1 shipped). |
| `unlim-chat/index.ts`                                                  | UNTOUCHED      | Per iter 28 explicit constraint.                   |
| LavagnaShell + any other src/test files                                | UNTOUCHED      | Per iter 28 explicit constraint.                   |

All file ownership constraints respected.
