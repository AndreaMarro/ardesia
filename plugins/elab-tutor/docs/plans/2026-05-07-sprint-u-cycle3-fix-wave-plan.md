# Sprint U Cycle 3 Fix Wave — Phased Plan

**Generated**: 2026-05-07 ~16:30 GMT+2
**Author**: Claude Opus 4.7 (1M context)
**Skill invocation**: `/claude-mem:make-plan` (post `/ultrathink:ultrathink` deep reasoning)
**Mandate Andrea iter 21+**: massima onestà, non compiacere, no synthesis
**Quality benchmark target**: 5.23/10 → **6.0/10** entro fine Cycle 3
**Vitest baseline**: 13474 PASS (current `automa/baseline-tests.txt`) — preserve mandatory
**Source handoff**: `docs/handoff/2026-05-07-cycle3-next-session-prompt.md`

---

## Decisioni ratify LOCKED Cycle 3 (do NOT re-decide)

- **1A**: sequencing Vol2 → Vol1 → Vol3 (Vol2 done PR #85 merged)
- **2A**: Vol2 only id+title+concept+chapter rinomina (DONE)
- **3A**: Vol1 nuovo schema `suggestedVariations[]` per spiattellato consolidate
- **4A**: Vol3 INVENTED esp hard remove
- **5A**: Vol3 cap9 piezo wait Davide content (PDF v0.13 cap9 ESERCIZIO 9.1+9.2 verbatim)
- **6A**: Vol3 extras lcd+servo RIMUOVERE

## Davide blockers (NOT executable senza Davide content)

- Vol3 cap9 piezo content (PDF v0.13 cap9 ESERCIZIO 9.1+9.2 verbatim)
- Vol2 cap5 batterie material decision (3-4xAA 1.5V vs 2x9V)
- Vol2 cap6-esp4 methodology decision (prova-diodi standalone vs full-bb)
- Vol1 cap14-esp1 mascot SVG asset (ELAB amico occhi+mano RGB+scettro)
- Vol1 spiattellato refactor 38→28 ratify (Davide as author should approve narrative collapse)

---

## Verified Truth Table (Phase 0 output, anti-hallucination preamble)

Vol1 audit Cycle 2 verification result (file `automa/state/task5-volumi-vol1.json` + PDF `/tmp/vol1.txt`):
- **Hallucination rate strict: 0/14 = 0%** (lower than 33% Cycle 2 broader claim — Vol3 likely halluc source)
- **Partial-or-insufficient: 4/14 = 29%** (cap10-esp1 nuance, cap9-esp7 buildSteps count exaggerated 8→15, cap12-esp3 + cap12-esp4 INSUFFICIENT_EVIDENCE PDF text scope)
- **38 esp count CONFIRMED** (`grep -nE "^\s*id:\s*['\"]" experiments-vol1.js` → 38)
- **PRINCIPIO ZERO violations**: actual count **680** singolare imperative occurrences (audit ~200 underestimate 3.4×)

Critical revisions vs handoff:
- **cap10-esp1**: PARTIAL not HALLUCINATED. `desc:4173` + `components:4180-4183` ✅ "no resistor", BUT `layout:4202`+`steps:4207`+`observe:4215`+`unlimPrompt:4216`+`buildSteps step4:4248-4252` ❌ all reference 220Ω. Fix = **REMOVE r1 references** (not add component).
- **cap9-esp7**: 15 buildSteps not 8 (audit underestimated)
- **cap12-esp3** + **cap12-esp4**: INSUFFICIENT_EVIDENCE in scoped grep — Phase 1 retry mandatory before fix

---

## PHASE 0 — Anti-Hallucination Truth Verification (preamble, ~30 min, NO commits)

### Goal

Refresh Verified Truth Table for Cycle 3 entry. Re-verify INSUFFICIENT_EVIDENCE entries before fix work begins.

### Tasks

1. Re-load this plan + handoff doc.
2. Re-verify cap12-esp3 + cap12-esp4 PDF text:
   ```bash
   pdftotext -layout "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/VOL1_ITA_ COMPLETO V.0.1 GP.pdf" /tmp/vol1-layout.txt
   grep -n "ESPERIMENTO" /tmp/vol1-layout.txt | tail -30
   sed -n '$LINE_NUM_CAP12,$LINE_NUM_END p' /tmp/vol1-layout.txt
   ```
3. Document findings in `docs/audits/2026-05-07-cycle3-truth-table-refresh.md`:
   - cap12-esp3 "colore preferisci" PDF verbatim citation OR mark SKIP
   - cap12-esp4 plurale "potenziometri" PDF verbatim citation OR mark SKIP
4. Branch: stay on temp branch `docs/cycle3-next-session-handoff` for now (no commits to main).
5. Confirm baseline:
   ```bash
   cat automa/baseline-tests.txt   # expected 13474
   git log --oneline main..HEAD     # confirm only handoff doc commits
   ```

### Verification checklist

- [ ] `/tmp/vol1-layout.txt` regenerated this session
- [ ] cap12-esp3 + cap12-esp4 verdict added to truth table refresh doc
- [ ] Baseline 13474 confirmed unchanged
- [ ] No untracked dangerous files (check `git status --short`)

### Anti-pattern guards

- ❌ DO NOT proceed to Phase 1 fix work without finishing Phase 0 verification
- ❌ DO NOT trust audit JSON top_fix entries blindly — every "critical/high" must match grep + PDF citation
- ❌ DO NOT retro-justify a fix attempt by re-reading audit; truth table is canonical

### Documentation references

- `docs/handoff/2026-05-07-cycle3-next-session-prompt.md` (handoff)
- `automa/state/task5-volumi-vol{1,2,3}.json` (audit JSONs)
- `docs/audits/2026-05-07-task5-volumi-vol{1,2,3}-audit.md` (audit md)
- `/tmp/vol{1,2}.txt` + `/tmp/vol3-v0.8.1.txt` (PDF extract)
- `src/data/experiments-vol1.js` (38 esp canonical)
- `src/data/experiments-vol2.js` (post Vol2 rinomina)
- `src/data/experiments-vol3.js` (canonical)

---

## PHASE 1 — Vol1 P0 Critical Fixes (~6-8h, 3 atomic PRs)

### Goal

Fix 3 confirmed-REAL Vol1 critical defects without scope creep. Each PR independent, atomic, reviewable, revertible.

### Branch convention

Cycle 3 work happens off **`main`** (post Vol2 PR #85 merge baseline). Each Phase 1 fix gets its own short-lived branch:

```
fix/cycle3-vol1-cap10-esp1-220-removal       # PR-A
fix/cycle3-vol1-cap10-esp3-r-components-add  # PR-B
fix/cycle3-vol1-cap14-esp1-coords-realign    # PR-C
```

### PR-A: cap10-esp1 220Ω internal contradiction removal (~1h)

**Why this is real**: `desc:4173` + PDF line 1851 verbatim "non c'è bisogno di inserire un resistore" + `components[]:4180-4183` + `pinAssignments:4185-4189` ✅ all align "no resistor". BUT `layout:4202` r1 entry + `steps:4207` + `observe:4215` + `unlimPrompt:4216` + `buildSteps step4:4248-4252` ❌ all reference 220Ω r1. **Internal contradiction**, not external.

**Fix scope (file `src/data/experiments-vol1.js`)**:
- Remove `"r1": {x:170, y:43.75}` from `layout` (line ~4202)
- Remove `steps[1]` ("Inserisci il resistore da 220Ω")
- Update `steps[2]` references "fila d, colonne 10-11" → "fila d, colonne 9-10" (LED at d9-d10 per pinAssignments)
- Update `steps[5]` "colonna 9 alla colonna 10 (resistore al LED)" → REMOVE
- Update `steps[6]` "colonna 11" → "colonna 10"
- Strip "Il resistore da 220Ω protegge il LED" from `observe`
- Strip every "resistore da 220Ω" from `unlimPrompt` + replace analogy "guardiano" with "porta che si apre col sole, e l'LDR è il portinaio"
- Remove buildSteps step 4 entirely (r1 entry)
- Renumber subsequent buildSteps step 5 → 4, step 6 → 5, etc.
- Update buildSteps step (formerly 5) hint "anodo va in D10" → "anodo va in D9, catodo in D10"

**CHANGELOG entry**: append top of `CHANGELOG.md`:
```
## fix/cycle3-vol1-cap10-esp1-220-removal
- Internal contradiction fix: cap10-esp1 desc/components/pinAssignments stated "no resistor" (per PDF Vol.1 cap.10 pag.[N] "non serve un resistore") but layout/steps/observe/unlimPrompt/buildSteps referenced 220Ω r1. Removed r1 references to align all surfaces with PRINCIPIO ZERO + Morfismo Sense 2 triplet coerenza.
- Audit Cycle 2 (PR #83) marked cap10-esp1 critical "PRINCIPIO ZERO violation" → REFINED via Cycle 3 truth table to "internal contradiction" (PARTIAL not HALLUCINATED).
```

**Verification checklist PR-A**:
- [ ] `git diff src/data/experiments-vol1.js` shows ONLY cap10-esp1 fields
- [ ] `npx vitest run` post-edit: 13474+ PASS, 0 fail
- [ ] `node scripts/benchmark.cjs --fast` runs (no crash)
- [ ] `npm run build` PASS (post-edit, before commit)
- [ ] CHANGELOG entry includes grep evidence (file:line) + PDF citation
- [ ] Commit format `fix(vol1): cap10-esp1 220Ω internal contradiction removal` per Regola Karpathy "Surgical"

### PR-B: cap10-esp3 r1/r2/r3 components instantiation (~1.5h)

**Why this is real**: `experiments-vol1.js:4487-4494` `components[]={battery,bb1,ldr1,ldr2,ldr3,rgb1}` — NO r1/r2/r3. BUT `layout:4525,4527,4529` references r1/r2/r3 + `steps[]:4534` "Inserisci 3 resistori da 220Ω" + buildSteps reference resistor placement. Layout-orphan + steps-orphan = simulator fails to mount components.

**Fix scope**:
- ADD `r1`, `r2`, `r3` to `components` array (3× `{type: "resistor", id: "rN", color_bands: ["red","red","brown","gold"]}` for 220Ω)
- ADD `pinAssignments`:
  - `"r1:pin1": "bb1:[X]", "r1:pin2": "bb1:[Y]"` per buildSteps spec
  - same for r2, r3
- ADD `connections` per buildSteps "ogni LDR al suo resistore, poi resistore al canale RGB":
  - LDR1 → r1 → RGB red channel
  - LDR2 → r2 → RGB green channel
  - LDR3 → r3 → RGB blue channel
- Cross-reference buildSteps to derive exact pin coords (READ buildSteps THEN add — do NOT invent)

**CHANGELOG entry**:
```
## fix/cycle3-vol1-cap10-esp3-r-components-add
- Real bug fix: cap10-esp3 components array missing r1/r2/r3 (3× 220Ω) instantiation despite layout + buildSteps + steps[] referencing them. Added components, pinAssignments, connections per buildSteps spec.
- Grep evidence: experiments-vol1.js:4487-4494 missing r1/r2/r3, references at 4525,4527,4529.
- PDF Vol.1 cap.10 pag.[N] confirms 3 resistors needed for 3 LDR + RGB channels (parallel circuit).
```

**Verification checklist PR-B**:
- [ ] Components array has 9 entries (was 6, +3)
- [ ] pinAssignments includes r1/r2/r3 pin1+pin2 mappings
- [ ] connections array has +3 entries (LDR-R-RGB chain × 3)
- [ ] vitest 13474+ PASS
- [ ] `npm run build` PASS
- [ ] Live test (Phase 6 deferred): mount cap10-esp3 → assert 9 components rendered, no orphan layout warning console

### PR-C: cap14-esp1 capstone coords realign (~4-6h)

**Why this is real**: PDF line 2252 "potenziometro n°1 Pin e-1" + line 2268 "Led1 gambetta lunga su g-15" + line 2270 "Led2 gambetta lunga su d-15". Code `experiments-vol1.js:6564` `"led1:anode": "bb1:b21"` + `:6566` `"led2:anode": "bb1:h23"` + `:6568` pot1 at e28. **Massive coord divergence**.

**Fix scope (CODE-ONLY, mascot SVG asset DEFER Davide)**:
- Update `pinAssignments` for cap14-esp1:
  - `led1:anode`: `bb1:b21` → `bb1:g15`
  - `led2:anode`: `bb1:h23` → `bb1:d15`
  - `pot1:pin1`: `bb1:e28` → `bb1:e1`
  - All other pot/led/RGB/sensor pins: cross-reference PDF lines 2244-2330 verbatim
- Update `layout` x/y coords accordingly
- Update `connections` array to match new pin coords (rebuild wire mesh)
- Update `steps[]` text references "colonna [N]" to match new coords
- Update `buildSteps` `targetPins` per buildStep
- KEEP `simulable: false` flag (mascot asset still missing)
- KEEP `simulableReason: "Richiede kit robot fisico"` (Davide block separate)

**CHANGELOG entry**:
```
## fix/cycle3-vol1-cap14-esp1-coords-realign
- Real bug fix: capstone Robot ELAB coords diverged from PDF Vol.1 cap.14. Realigned led1 b21→g15, led2 h23→d15, pot1 e28→e1, all other pins per PDF lines 2244-2330 verbatim.
- Mascot SVG asset (occhi+mano RGB+scettro) DEFERRED: Davide+Omaric content delivery block. simulable:false retained.
- Audit Cycle 2 (PR #83) marked cap14-esp1 critical → confirmed REAL via Cycle 3 truth table grep+PDF.
```

**Verification checklist PR-C**:
- [ ] Every pin in pinAssignments has matching PDF citation (verbatim quote in PR description)
- [ ] connections array consistent with new pinAssignments (no orphan from/to)
- [ ] simulable:false retained
- [ ] vitest 13474+ PASS
- [ ] `npm run build` PASS
- [ ] PR description includes side-by-side diff table: `pin | code-old | code-new | PDF-line | PDF-quote`

### Anti-pattern guards (Phase 1 global)

- ❌ DO NOT bundle PR-A + PR-B + PR-C in one PR (atomic, revertible per Andrea iter 21+ mandate)
- ❌ DO NOT amend mascot SVG asset to PR-C (Davide block separate)
- ❌ DO NOT add `r1` component to cap10-esp1 (handoff initial direction was wrong; truth table revised)
- ❌ DO NOT skip CHANGELOG entry per fix (Regola 5 mandatory)
- ❌ DO NOT use `--no-verify` if pre-commit hook fails (investigate root cause)
- ❌ DO NOT push directly to main (always PR via `gh pr create`)

---

## PHASE 2 — Vol1 Spiattellato Consolidation (~6h, 5 atomic PRs)

### Goal

Refactor Vol1 38 esp → 28 esp + 5 `suggestedVariations[]` per ratify decision 3A. One PR per chapter consolidation. Davide ratify gate before merge each.

### Branches

```
refactor/cycle3-vol1-cap7-rgb-consolidate-esp2-esp3
refactor/cycle3-vol1-cap8-pulsante-consolidate-esp2-esp5
refactor/cycle3-vol1-cap9-pot-consolidate-esp2-esp3-esp7-esp8-esp9   # PRIORITY (biggest)
refactor/cycle3-vol1-cap10-ldr-consolidate-esp2
refactor/cycle3-vol1-cap12-reed-consolidate-esp2
```

### Schema 3A — `suggestedVariations[]` design

Per ratify 3A, Vol1 schema gets new optional field:

```js
{
  id: "v1-cap7-esp1",
  title: "...",
  desc: "...",
  // ... existing fields ...
  suggestedVariations: [
    {
      id: "v1-cap7-esp1-var-verde",       // narrative continuity, NOT separate esp
      pdf_ref: "Vol.1 cap.7 ESPERIMENTO 2 pag.[N]",
      change_summary: "Scollega resistore da rosso, collegalo a verde",
      narrative_text: "ESPERIMENTO 2 / Scollega il resistore da 470 Ohm dal rosso e collegalo al verde",
      // ZERO buildSteps — consolidation is narrative, not new procedure
    },
    {
      id: "v1-cap7-esp1-var-blu",
      pdf_ref: "Vol.1 cap.7 ESPERIMENTO 3 pag.[N]",
      change_summary: "Scollega resistore da rosso, collegalo a blu",
      narrative_text: "ESPERIMENTO 3 / Scollega il resistore da 470 Ohm dal rosso e collegalo al blu"
    }
  ]
}
```

UI consumer side: lesson-paths render parent esp + collapsible variation cards (NEW UI work iter 39+ scope, NOT this Cycle 3).

### PR per chapter (template)

Each PR follows identical pattern:

1. **Pre-edit verification** (per anti-hallucination protocol):
   ```bash
   # 1. Read code state
   sed -n 'NN,MMp' src/data/experiments-vol1.js  # cap[X] esp[N] entries
   # 2. Read PDF chapter
   grep -n "ESPERIMENTO" /tmp/vol1-layout.txt | grep -A1 "cap[X]"
   # 3. Confirm PDF presents as 1-line variation
   ```
2. **Fix**: REMOVE consolidated esp entries from main array, ADD `suggestedVariations[]` to parent esp
3. **Test update**: any test that imported removed esp ID → update to reference parent + variation slug
4. **CHANGELOG entry**: include PDF verbatim + grep evidence
5. **Davide ratify gate**: PR description includes "@DAVIDE: ratify required before merge — does cap[X] esp[N] consolidation respect volume narrative?"

### Per-chapter scope

| Chapter | Consolidate                                | Source PDF                          | Hours |
|---------|--------------------------------------------|-------------------------------------|-------|
| cap7    | esp2+esp3 → esp1.suggestedVariations       | Line 1106-1107, 1115-1116           | 1.5h  |
| cap8    | esp2 → esp1.suggestedVariations + esp5 → esp4.suggestedVariations | Line 1264-1265, 1395-1396 | 1h |
| cap9    | esp2+esp3 → esp1; esp7+8+9 → esp6.suggestedVariations | Line 1530-1531, 1769, 1776, 1779 | 2-3h (PRIORITY) |
| cap10   | esp2 → esp1.suggestedVariations            | Line 1855-1856                      | 0.5h  |
| cap12   | esp2 → esp1.suggestedVariations            | Line 2031 + live 5/5 sig            | 0.5h  |

Total: 38 esp → **28 esp** + 5 `suggestedVariations[]` arrays containing 11 narrative variations.

### Verification checklist (per PR)

- [ ] PDF verbatim quote in PR description for EACH consolidated esp
- [ ] Parent esp `suggestedVariations[]` contains all consolidated narrative_text
- [ ] No orphan references to removed esp IDs in `lesson-paths/*.json`
- [ ] vitest 13474+ PASS (some tests will FAIL on missing esp IDs — update test fixtures, NOT skip)
- [ ] `npm run build` PASS
- [ ] CHANGELOG entry per PR
- [ ] PR description tagged `@DAVIDE` for ratify before merge

### Anti-pattern guards (Phase 2 global)

- ❌ DO NOT consolidate esp where PDF presents as distinct narrative (cap6, cap11, cap13 — preserve as-is)
- ❌ DO NOT invent `suggestedVariations[]` content not in PDF
- ❌ DO NOT bulk-update lesson-paths/*.json — orphan references should fail tests, fix per PR
- ❌ DO NOT merge without Davide ratify (narrative collapse risks Morfismo Sense 2 violation)
- ❌ DO NOT skip the `pdf_ref` field in suggestedVariations[] — triplet coerenza requirement

### Documentation references

- `src/data/experiments-vol1.js` (canonical pre-refactor)
- `/tmp/vol1-layout.txt` (PDF extract with line numbers)
- `docs/audits/2026-05-07-task5-volumi-vol1-audit.md` (audit md)
- Verified Truth Table refresh (Phase 0 output)

---

## PHASE 3 — Vol2 Quick-fixes Non-Davide-Blocked (~4h, 1 atomic PR)

### Goal

Address Vol2 audit `verdetto.top_fix` items 3-5 (excludes 1+2 which are Davide blocks).

### Branch

```
fix/cycle3-vol2-quick-fixes-non-davide
```

### Scope

| Sub-fix | Issue | Source |
|---------|-------|--------|
| 3a | cap3-esp4 anomalous 0-wires (no connections array) | `experiments-vol2.js` cap3-esp4 |
| 3b | cap4-esp1, cap4-esp2, cap4-esp3 anomalous 0-wires | `experiments-vol2.js` cap4-esp[1-3] |
| 4a | cap7-esp4 duplicate of cap7-esp3 (parametrize variations) | `experiments-vol2.js` |
| 4b | cap10-esp2 duplicate of cap10-esp1 (parametrize variations) | `experiments-vol2.js` |
| 5  | cap12-esp1 mechanical capstone gap doc                  | `experiments-vol2.js` cap12-esp1 |

### Per sub-fix protocol (anti-hallucination)

1. Grep current state in `experiments-vol2.js`
2. Read PDF Vol2 corresponding chapter via `/tmp/vol2.txt`
3. ONLY add wires that are explicitly described in PDF text or implied by buildSteps
4. Document each added wire with line citation in commit body

### Davide blocks DEFER (Phase 3 EXCLUDED)

- Vol2 cap5 batterie (3-4xAA 1.5V vs 2x9V) — material decision
- Vol2 cap6-esp4 methodology (prova-diodi standalone vs full-bb)

### Verification checklist

- [ ] vitest 13474+ PASS post all 5 sub-fixes
- [ ] `npm run build` PASS
- [ ] `node scripts/benchmark.cjs --fast` (informational)
- [ ] PR description: 5 sub-fix sections each with grep before/after + PDF citation
- [ ] CHANGELOG entry per sub-fix
- [ ] PR description blocks: "Davide blocks DEFERRED: cap5 batterie + cap6-esp4 methodology — Cycle 4+ scope"

### Anti-pattern guards

- ❌ DO NOT touch cap5 or cap6-esp4 (Davide blocks)
- ❌ DO NOT add wires that are not in PDF or buildSteps (invent risk)
- ❌ DO NOT bundle Phase 3 with Phase 1 or 2 PRs

---

## PHASE 4 — Vol3 Fix Scope Non-Davide-Blocked (~6h, 3 atomic PRs)

### Goal

Address Vol3 audit non-Davide-blocked items per ratify 4A + 6A. cap9 piezo NEW chapter DEFER (5A — Davide content).

### Branches

```
fix/cycle3-vol3-cap10-simon-rinomina-pin-mismatch
fix/cycle3-vol3-invented-esp-removal
fix/cycle3-vol3-legacy-extras-lcd-servo-removal
```

### PR-A: cap10 Simon rinomina + 4 PIN mismatch fix (~3-4h)

**Scope**:
- Rename cap10 chapter title per PDF v0.13
- Fix 4 PIN mismatches per audit JSON (verify each via grep + PDF before edit)
- Update lesson-paths/*.json references

**Pre-edit verification**:
```bash
grep -n "v3-cap10" src/data/experiments-vol3.js
grep -n "Simon\|cap.10\|cap. 10\|capitolo 10" /tmp/vol3-v0.8.1.txt | head -20
```

### PR-B: 4 INVENTED esp removal (~2h, HIGH halluc risk)

Per ratify 4A: hard remove cap6-morse, cap6-esp6, cap7-esp5, cap7-mini DUP.

**Pre-edit verification CRITICAL** (handoff §Likely hallucination sources flags this scope):
```bash
# Per ogni esp marked "INVENTED":
grep -n "cap6-morse\|cap6-esp6\|cap7-esp5\|cap7-mini" src/data/experiments-vol3.js
grep -n "morse\|ESPERIMENTO 6\|cap.7 ESPERIMENTO 5" /tmp/vol3-v0.8.1.txt
# CONFIRM: PDF v0.13 has NO matching narrative for these IDs
# REJECT removal if any PDF match found
```

If PDF citation found contradicting "INVENTED" claim → SKIP removal + flag as Cycle 3 truth table refresh entry.

### PR-C: 2 legacy extras lcd+servo RIMUOVERE (~1h)

Per ratify 6A: hard remove `extra-lcd-hello` + `extra-servo-sweep`.

**Verification**:
- Grep references in lesson-paths + components arrays
- Update lesson-paths to remove orphan references
- vitest run pre + post

### Davide block DEFER (Phase 4 EXCLUDED)

- cap9 piezo NEW chapter (PDF v0.13 cap9 ESERCIZIO 9.1+9.2 verbatim) — content delivery block

### Verification checklist (Phase 4 global)

- [ ] PR-A PIN mismatches: each fix has PDF citation in PR description
- [ ] PR-B removals: each removal has confirmation "PDF v0.13 NO MATCH" via explicit grep
- [ ] PR-C removals: legacy extras gone from experiments-vol3.js + lesson-paths
- [ ] vitest 13474+ PASS each PR
- [ ] `npm run build` PASS
- [ ] CHANGELOG entry per PR
- [ ] PR descriptions block "Davide cap9 piezo DEFERRED: ratify 5A wait content"

### Anti-pattern guards

- ❌ DO NOT bulk-remove all 4 INVENTED at once — atomic per esp, allows revert if PDF citation found
- ❌ DO NOT touch cap9 piezo (5A wait Davide)
- ❌ DO NOT skip pre-edit verification — Vol3 is highest halluc-risk scope per handoff

---

## PHASE 5 — PRINCIPIO ZERO Codemod Systematic (~3-6h, 1 atomic PR)

### Goal

Address ~680 singolare imperative violations per Andrea iter 21 mandate (audit underestimated 200 → actual 680, 3.4× ratio).

### Branch

```
refactor/cycle3-principio-zero-codemod-vol1-vol3
```

### Pre-codemod protocol (mandatory per handoff §Anti-hallucination)

1. **Get actual count via grep**:
   ```bash
   grep -cE "(Posiziona|Collega|Prendi|Inserisci|Allarga|Avvicina|Scollega) " src/data/experiments-vol1.js
   grep -cE "(Posiziona|Collega|Prendi|Inserisci|Allarga|Avvicina|Scollega) " src/data/experiments-vol3.js
   # Vol2 already done in PR #85 Cycle 2
   ```

2. **Sample 10 random violations**:
   ```bash
   grep -nE "(Posiziona|Collega|Prendi|Inserisci|Allarga|Avvicina|Scollega) " src/data/experiments-vol1.js | shuf -n 10
   ```
   For each, manually verify:
   - Is it test fixture? → SKIP
   - Is it docs comment? → SKIP
   - Is it user-facing text (steps, observe, unlimPrompt, buildSteps)? → INCLUDE
   - Is it PDF verbatim quote? → CONFLICT (PDF singolare vs PRINCIPIO ZERO plurale; flag for Davide)

3. **Codemod design**:
   - Andrea iter 21 mandate: linguaggio docente plurale "Ragazzi, posizionate"
   - Conflict with PDF verbatim mandate (Morfismo Sense 2 — software cita verbatim)
   - **Resolution proposal**: software UI uses plurale "Ragazzi, posizionate", PDF citation field (`pdf_ref` + verbatim quote in `narrative_text`) preserves singolare original
   - Codemod target: `steps[]`, `observe`, `unlimPrompt`, `buildSteps[].text`, `buildSteps[].hint`
   - Codemod EXCLUDE: `pdf_quote`, `narrative_text`, `desc` (where desc is verbatim from book)

4. **Davide ratify gate**: before bulk codemod, PR description tagged `@DAVIDE: linguaggio plurale software vs verbatim singolare PDF — ratify direction`

### Replacement table

| Singolare | Plurale (default codemod) |
|-----------|---------------------------|
| Posiziona | Ragazzi, posizionate      |
| Collega   | Ragazzi, collegate        |
| Prendi    | Ragazzi, prendete         |
| Inserisci | Ragazzi, inserite         |
| Allarga   | Ragazzi, allargate        |
| Avvicina  | Ragazzi, avvicinate       |
| Scollega  | Ragazzi, scollegate       |
| Sposta    | Ragazzi, spostate         |
| Verifica  | Ragazzi, verificate       |
| Osserva   | Ragazzi, osservate        |

Note: prepend "Ragazzi," only if not already present in same line (avoid double "Ragazzi, Ragazzi, posizionate").

### Codemod execution

```bash
# Phase 5 codemod script (write a one-shot node script):
node scripts/cycle3/principio-zero-codemod.mjs --vol vol1 --dry-run
# Review output diff
node scripts/cycle3/principio-zero-codemod.mjs --vol vol1 --apply
node scripts/cycle3/principio-zero-codemod.mjs --vol vol3 --dry-run
node scripts/cycle3/principio-zero-codemod.mjs --vol vol3 --apply
```

### Verification checklist

- [ ] Sample 10 random violations manually verified before codemod (NO test/docs/comment caught)
- [ ] Codemod dry-run output reviewed by human (orchestrator) before apply
- [ ] Post-codemod grep confirms ~680 → near-0 violations (some preserved if PDF citation field)
- [ ] vitest 13474+ PASS
- [ ] `npm run build` PASS
- [ ] PR description: before/after counts + 10 sample diffs + Davide ratify ask
- [ ] CHANGELOG entry: codemod scope + Davide ratify status

### Anti-pattern guards

- ❌ DO NOT bulk codemod without sample-10 verification first (handoff §Anti-hallucination protocol)
- ❌ DO NOT codemod PDF verbatim citation fields (Morfismo Sense 2 violation)
- ❌ DO NOT prepend "Ragazzi," if already present (double-prepend bug)
- ❌ DO NOT merge without Davide ratify gate

---

## PHASE 6 — Verification + Benchmark Closure (~30 min, NO commits)

### Goal

Confirm Cycle 3 fix wave preserved baseline + lifted benchmark target. Document Davide blockers separately for Cycle 4.

### Tasks

1. **Vitest 3× CoV** (per CLAUDE.md §Regola anti-inflazione):
   ```bash
   npx vitest run > /tmp/vitest-cycle3-close-1.log
   npx vitest run > /tmp/vitest-cycle3-close-2.log
   npx vitest run > /tmp/vitest-cycle3-close-3.log
   # All 3 must show 13474+ PASS, 0 fail
   ```

2. **Benchmark refresh**:
   ```bash
   node scripts/benchmark.cjs --write
   # Read automa/state/benchmark.json
   # Confirm score >= 6.0/10
   ```

3. **Final E2E smoke** (informational, gated by env):
   ```bash
   npx playwright test tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-smoke.spec.js
   ```

4. **Davide blocker doc** (`docs/handoff/2026-05-07-cycle3-davide-blocks.md`):
   - List 5 blockers (cap9 piezo, cap5 batterie, cap6-esp4 methodology, cap14 mascot SVG, spiattellato 38→28 ratify)
   - For each: PDF reference, decision needed, scope hours, Cycle 4 entry condition

5. **Cycle 3 close audit** (`docs/audits/2026-05-07-cycle3-close-audit.md`):
   - Total PRs merged (target: 12-15 atomic across phases 1-5)
   - Vitest delta (13474 → final count)
   - Benchmark delta (5.23 → final score)
   - Halluc rate measured (0% Vol1 strict, target broader Cycle 3 0% via mandatory grep+PDF protocol)
   - Anti-inflation audit (no claim "9.5/10" without Opus indipendente per G45 mandate)

### Verification checklist (Phase 6 global)

- [ ] Vitest 3/3 runs PASS 13474+ identical
- [ ] Benchmark score >= 6.0/10
- [ ] Davide blocker doc shipped
- [ ] Cycle 3 close audit shipped
- [ ] All Phase 1-5 PRs merged OR explicit defer documented
- [ ] CHANGELOG.md head reflects all Phase 1-5 entries

### Anti-pattern guards (Cycle close)

- ❌ DO NOT claim Cycle 3 "DONE" if any PR still OPEN (count merged vs target)
- ❌ DO NOT inflate score self-claim (G45 mandate iter 36+: NO claim >7 without Opus indipendente)
- ❌ DO NOT delete Davide block doc (Cycle 4 entry condition)

---

## ATOMIC PR CONVENTION (Phase 1-5)

Per Andrea iter 21+ mandate "atomic PR per fix" + handoff §Scope discipline:

### Per PR template

```markdown
## Phase [N] — [Brief title]

### Why
[Issue summary 1 line]

### Truth verification (anti-hallucination)
- **Code state**: `file.js:LINE` `[verbatim grep result]`
- **PDF state**: `Vol.X cap.Y pag.Z` `"[verbatim PDF quote]"`
- **Conflict**: [exact conflict description]

### Fix
- [Change 1]
- [Change 2]

### Verification
- [ ] vitest 13474+ PASS (paste tail of npx vitest run output)
- [ ] `npm run build` PASS
- [ ] CHANGELOG entry added

### Davide block flag
[None | Awaiting ratify @DAVIDE | DEFERRED Cycle 4]

### CoV
- Pre: vitest [N] PASS, build [PASS|FAIL]
- Post: vitest [N] PASS, build [PASS|FAIL]
- Delta: [+M tests | 0 regression]
```

### Commit convention (Karpathy "Surgical")

```
fix(vol1): cap10-esp1 220Ω internal contradiction removal

- desc:4173 + components + pinAssignments said "no resistor"
- BUT layout + steps + observe + unlimPrompt + buildSteps step4 referenced 220Ω r1
- PDF Vol.1 cap.10 line 1851: "non c'è bisogno di inserire un resistore"
- Removed all r1 references (NOT add component) per truth table refresh

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

### Branch protection rules

- Pre-commit hook: vitest baseline check (DO NOT `--no-verify`)
- Pre-push hook: build PASS check (DO NOT `--no-verify`)
- PR target: `main` (post Vol2 + Vision E2E + handoff baseline)
- Squash merge preferred (atomic commit history)
- Davide ratify gate: Phase 2 + Phase 5 PR descriptions tag `@DAVIDE`

---

## SCOPE TOTALS

| Phase | PRs | Hours | Davide blocks |
|-------|-----|-------|---------------|
| 0 (truth refresh) | 0 (audit doc only) | 0.5h | — |
| 1 (Vol1 P0) | 3 | 6-8h | mascot SVG (cap14) DEFERRED |
| 2 (Vol1 spiattellato) | 5 | 6h | spiattellato ratify gate per PR |
| 3 (Vol2 quick-fixes) | 1 | 4h | cap5 + cap6-esp4 DEFERRED |
| 4 (Vol3 non-Davide) | 3 | 6h | cap9 piezo DEFERRED |
| 5 (PRINCIPIO ZERO codemod) | 1 | 3-6h | linguaggio direction ratify gate |
| 6 (closure) | 0 (audit doc) | 0.5h | — |
| **TOTAL** | **13 PRs** | **26-31h** | **5 Davide blocks** |

Cycle 3 actual fix-wave delivery: ~13 atomic PRs across 5 active phases. Davide blocks documented for Cycle 4.

---

## SUCCESS CRITERIA

Cycle 3 close achieves **6.0+/10 ONESTO** quality benchmark (lift 5.23 → 6.0+) when:

1. ✅ All Phase 1 P0 critical fixes merged (3 PRs)
2. ✅ ≥3/5 Phase 2 spiattellato PRs merged (cap9 priority + 2 others)
3. ✅ Phase 3 Vol2 quick-fixes PR merged
4. ✅ Phase 4 Vol3 non-Davide PRs merged (3 PRs)
5. ✅ Phase 5 PRINCIPIO ZERO codemod PR merged (Davide ratify obtained)
6. ✅ Vitest 13474+ baseline preserved across all merges
7. ✅ `npm run build` PASS at Cycle 3 close
8. ✅ Davide blocker doc shipped (5 items)
9. ✅ Cycle 3 close audit shipped (no inflation per G45 mandate)
10. ✅ Halluc rate measured ≤5% across Cycle 3 PRs (mandatory grep + PDF protocol enforcement)

Cycle 4 entry condition: Davide content delivery for ≥1 of 5 blocks (cap9 piezo, cap5 batterie, cap6-esp4 methodology, cap14 mascot SVG, spiattellato ratify).

---

## REFERENCES

- **Handoff doc**: `docs/handoff/2026-05-07-cycle3-next-session-prompt.md`
- **Audit JSONs**: `automa/state/task5-volumi-vol{1,2,3}.json`
- **Audit md**: `docs/audits/2026-05-07-task5-volumi-vol{1,2,3}-audit.md`
- **PDF extracts**: `/tmp/vol1.txt`, `/tmp/vol2.txt`, `/tmp/vol3-v0.8.1.txt`
- **Spec source**: `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`
- **CHANGELOG**: `CHANGELOG.md` (Vol2 rinomina entry top)
- **Vol2 PR**: #85 merged `c4049052`
- **Vision E2E PR**: #87 merged `e8cde75d`
- **Handoff PR**: #88
- **CLAUDE.md**: project root (orchestration history + tech stack)
- **`.impeccable.md`**: project root (design source of truth)
- **Verified Truth Table**: built Phase 0 inline this session (will refresh + persist `docs/audits/2026-05-07-cycle3-truth-table-refresh.md`)

---

**Plan version**: 1.0
**Generated under**: `/claude-mem:make-plan` skill + `/ultrathink:ultrathink` deep reasoning
**Anti-inflation cap (G45 iter 36+ mandate)**: Plan score self-rate REJECTED. Score determined post-Cycle-3-close via Opus indipendente review + benchmark.cjs measurement.
