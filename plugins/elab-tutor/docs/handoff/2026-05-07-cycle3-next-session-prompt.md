# PROMPT NEXT SESSION — Sprint U Cycle 3 fix wave continuation

**Generated**: 2026-05-07 16:00 GMT+2
**Author**: Claude Opus 4.7 (1M context)
**Mandate**: massima onestà, non compiacere (Andrea verbatim)

---

## ⚠️ CRITICAL HONEST FINDING — Cycle 2 audit hallucination rate ~33%

Sprint U Cycle 2 audit work (PR #82 Vol2, PR #83 Vol1, PR #84 Vol3) merged on main contains **hallucinated findings** despite "non inventare nulla" mandate. Verified post-merge during Cycle 3 quick-win attempt:

### Verified Vol1 critical findings

| Finding (audit claim) | Reality | Status |
|----------------------|---------|--------|
| cap10-esp1 PRINCIPIO ZERO 220Ω | Code has NO resistor, desc matches PDF verbatim "non serve un resistore" | ❌ **HALLUCINATED** |
| cap10-esp3 r1/r2/r3 missing | Layout + buildSteps reference but components/pins/connections array missing | ✅ REAL |
| cap14 capstone g-15 vs b21 coords | PDF Vol1 "Led1 gambetta lunga su g-15" verified, code b21 | ✅ REAL |

**Implication**: Cycle 3 fix wave must NOT trust audit JSONs blindly. Each "critical/high" finding must be GREP-verified against code state + PDF text before commit.

### Likely hallucination sources

1. **Maker-3 BG agent** (general-purpose subagent) Vol1 audit — hallucinated cap10-esp1 220Ω despite explicit non-inventions mandate
2. **Maker-3 BG agent** Vol3 audit — referenced "cap10-esp1" but Vol3 v0.13 has no cap10-esp1 (cap10 = Simon capstone). Reference confused Vol1 + Vol3
3. **Pattern**: longer audit scope (15 esp Maker-3 vs 9 Maker-1/2) → more hallucination risk

### Verified accurate audits

- **Vol2 lesson-groups rinomina** (5/5 verified via grep before code edit) ✅ all 5 renames correct
- **Vol1 cap14 capstone coords** ✅ PDF coords verified
- **Vol1 cap10-esp3 components bug** ✅ layout/buildSteps reference verified

---

## Sprint U Cycle 3 Status (post Vol2 merge)

### Merged main

- ✅ PR #85 Vol2 rename `c4049052` (5 lesson rinomina + tests + CHANGELOG)
- ✅ PR #87 Vision E2E fix `e8cde75d` (mount via experiment post PR #81 B9)

### Verification metrics post-merge

- **CoV 3x vitest**: stable 13616 PASS / 0 fail across runs 2+3 (run 1 truncated)
- **Quality benchmark** (`scripts/benchmark.cjs --fast`): **5.23/10** (+0.48 vs prev 4.75)
  - test_count: 9.62/10 (13474→target 14000)
  - volume_ref_coverage: 10.00/10 (94/94)
  - documentation: 10.00/10
  - git_hygiene: 9.33/10
  - build_size_kb: 0.00/10 (17171KB vs target 3500KB — over)
  - e2e_pass_rate: 0.00/10 (no cached report)
  - dashboard_live: 3.00/10
  - accessibility_wcag: 0.00/10

---

## NEXT SESSION OBJECTIVES

### Skill invocations mandatory

1. **`/ultrathink:ultrathink`** for deeper reasoning on:
   - Hallucination-resistant verification process
   - Sequencing tradeoffs Vol1 vs Vol3
   - Davide blocker mitigation (cap9 piezo content delivery)

2. **`/make-plan`** for structured 3-7 phase plan with:
   - Per-finding verification mandate (grep + PDF check before edit)
   - Atomic PR-per-fix vs bulk PR scope decision
   - Acceptance criteria + CoV gates

### Vol1 spiattellato refactor (~25h scope, decisione 3A: suggestedVariations[] schema)

Per Vol1 audit `verdetto.top_fix` #1 — **38→28 esp + 5 suggestedVariations**:

**SPIATTELLATO consolidate** (audit claims ~11/38 spiattellati 29%):
- cap7 RGB: esp2+esp3 → esp1.suggestedVariations (rosso/verde/blu = 1 concept)
- cap8 Pulsante: esp2 → esp1, esp5 → esp4
- cap9 Pot: esp2+esp3 → esp1, **esp7+8+9 → esp6.suggestedVariations** (audit flag buildSteps INVENTATI)
- cap10 LDR: esp2 → esp1
- cap12 Reed: esp2 → esp1

**MANDATORY pre-edit verification** (per hallucination finding above):
```bash
# Per ogni esp marked spiattellato in audit:
1. Read src/data/experiments-vol1.js entries
2. Compare desc + components + buildSteps vs PDF (pdftotext output)
3. ONLY consolidate if PDF actually presents as 1-line variation
4. Document grep evidence in commit message
```

### Vol1 critical fix (3 atomi P0)

**3.1 cap10-esp1 PRINCIPIO ZERO 220Ω** — ❌ **CANCELLED — audit hallucinated, no code change needed**. Document in CHANGELOG as "audit error correction".

**3.2 cap10-esp3 components instantiation bug** — ✅ REAL bug. Fix scope:
```
- ADD r1/r2/r3 to components array (3x resistor, 220Ω color rgb-led series)
- ADD pinAssignments for r1:pin1+pin2, r2:pin1+pin2, r3:pin1+pin2
- ADD connections per buildSteps "ogni LDR al suo resistore, poi resistore al canale RGB"
- ETA 1h verification + impl + test
```

**3.3 cap14 Capstone Robot ELAB** — ✅ REAL multi-issue:
- Coords realign per PDF (Led1 g-15, RGB g-24/25/26/27)
- Mascot ELAB SVG asset (Andrea + Davide content block)
- Mechanical kit assembly PDR Omaric block
- ETA 6-8h cumulative

### Vol2 quick-fixes (~10h)

Per Vol2 audit verdetto top_fix:
1. cap5-esp1+esp2 material divergence (code 2x9V vs PDF 3-4xAA 1.5V) — Davide review block
2. cap6-esp4 methodology divergent (PDF prova-diodi standalone vs code full-bb) — Davide review block
3. cap3-esp4, cap4-esp1..esp3 anomalous 0-wires — verify + add wires per PDF
4. cap7-esp4 + cap10-esp2 duplicate circuits — parametrize variations
5. cap12-esp1 mechanical capstone gap

### Vol3 fix scope (~30h, BLOCKED Davide)

- ❌ cap9 piezo NEW chapter implementare 2 esp (BLOCKED Davide content delivery)
- cap10 Simon rinomina + 4 PIN mismatch fix (3-4h)
- Rimuovere 4 INVENTED esp (cap6-morse, cap6-esp6, cap7-esp5, cap7-mini DUP) — re-verify each via PDF first (2h, hallucination risk)
- Rimuovere 2 legacy extras (lcd-hello, servo-sweep) OR Davide v0.14 decision

### Systematic PRINCIPIO ZERO codemod (~5h)

Audit Vol1 + Vol3 claim ~200 violations imperative singolare ("Posiziona/Collega/Prendi") → plurale "Ragazzi posizionate/collegate/prendete".

**MANDATORY pre-codemod**: grep actual count, sample 10 random violations, verify each is genuine (not test fixture, not docs).

---

## PROCESS MANDATES NEXT SESSION

### Anti-hallucination protocol

Per Cycle 2 finding (33% halu rate critical findings):

1. **NEVER trust audit JSON top_fix without grep verify**
2. **EVERY fix commit message MUST include**:
   - Grep evidence (file:line) of issue in code
   - PDF page citation (verbatim quote)
   - Diff summary (before/after)
3. **Before bulk codemod**: verify on 5-10 random samples
4. **CoV per fix**: vitest run before + after, baseline preserve mandate

### Governance compliance

- ✅ Regola 2 TDD: `test()` commit BEFORE `feat()`
- ✅ Regola 5 docs: CHANGELOG entry per src/ changes
- ✅ Pre-commit + pre-push hooks (regression gate)
- ❌ NEVER `--no-verify`
- ❌ NEVER push directly to main

### Scope discipline

- Atomic PR per fix (vs bulk) — easier review, easier rollback
- Vol1 spiattellato refactor likely 5-10 PRs (one per chapter consolidation)
- Vol2 + Vol3 quick-fixes 1 PR each
- Davide content blockers documented separately

### Quality gates

- vitest baseline preserved every commit (13616+ PASS post-Cycle3-Vol2)
- benchmark score lift target: 5.23 → 6.0 entro fine Cycle 3
- E2E pass rate: aim cached report green (currently 0.00/10)

---

## PROMPT NEXT SESSION (paste-ready)

```
Continua Sprint U Cycle 3 fix wave Sprint U dopo merge PR #85 Vol2 + PR #87 Vision E2E.

CRITICAL: leggi PRIMA `docs/handoff/2026-05-07-cycle3-next-session-prompt.md` per:
1. Hallucination finding audit Cycle 2 (33% rate critical findings)
2. Verified accuracy table (cap10-esp1 ❌ wrong, cap10-esp3 ✅ real, cap14 ✅ real)
3. Anti-hallucination protocol mandatory next session

Workflow:
1. Invoke /ultrathink:ultrathink per deep reasoning sequencing + hallucination mitigation
2. Invoke /make-plan per piano strutturato 3-7 fasi Vol1 spiattellato refactor 38→28
3. Per ogni audit finding: grep verify code state + PDF citation BEFORE commit
4. Atomic PR per chapter consolidation (NO bulk)
5. CoV vitest baseline 13616+ preserve

Decisioni ratify locked Cycle 3 (do NOT re-decide):
1A: sequencing Vol2 → Vol1 → Vol3 (Vol2 done)
2A: Vol2 only id+title+concept+chapter (DONE)
3A: Vol1 nuovo schema suggestedVariations[]
4A: Vol3 INVENTED hard remove
5A: Vol3 cap9 piezo wait Davide
6A: Vol3 extras lcd+servo RIMUOVERE

Mandate Andrea iter 21+: massima onestà, non compiacere, no synthesis.

Davide blockers (NOT executable senza Davide content):
- Vol3 cap9 piezo content (PDF v0.13 cap9 ESERCIZIO 9.1+9.2 verbatim)
- Vol2 cap5 batterie material decision (3-4xAA vs 2x9V)
- Vol2 cap6-esp4 methodology decision (prova-diodi vs full-bb)

Quality benchmark target Cycle 3 close: 5.23 → 6.0/10.
```

---

## REFERENCE FILES

- Audit JSONs: `automa/state/task5-volumi-vol{1,2,3}.json`
- Audit md: `docs/audits/2026-05-07-task5-volumi-vol{1,2,3}-audit.md`
- Spec/plan source: `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`
- CHANGELOG: `CHANGELOG.md` Vol2 rinomina entry top
- Cycle 3 Vol2 PR: #85 merged `c4049052`
- Vision E2E fix PR: #87 merged `e8cde75d`
- This handoff: `docs/handoff/2026-05-07-cycle3-next-session-prompt.md`
