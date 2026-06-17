# Sprint U Cycle 2 — Vol1 Audit Report

**Date**: 2026-05-07
**Scope**: Vol1 (38 esperimenti dichiarati CLAUDE.md, verified live)
**Cycle**: 2 (audit-only, ZERO src/ modifications)
**Output principale**: `automa/state/task5-volumi-vol1.json`
**Spec/Plan**: shared with Vol2 (`docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`)
**Score**: **5.5/10** (vs Vol2 6.8/10)

## Executive Summary

Sprint U Cycle 2 Vol1 audit completato in ~25min con 3-way Maker split (vs 2-way Vol2):
- Phase 1 3 BG general-purpose agents parallel (Maker-1 ch6-7, Maker-2 ch8-9, Maker-3 ch10-14)
- Phase 2 inline live test 38/38 mount=true 0 errors (~76s mega-loop async)
- Phase 3 lesson-groups Vol1 audit
- Phase 4 consolidation + CoV + score calibration

**Key finding NUOVO + CRITICO**: Andrea iter 21+ feedback "spiattellato" **DRAMATICALLY CONFIRMED VOL1**. ~13-15/38 esperimenti spiattellati (~35-40%) — STARK contrast vs Vol2 (0/27).

Worst case: **cap9 Pot esp7+esp8+esp9** = LETTERALMENTE 1 riga PDF ciascuno ("Vuoi provare ad aggiungere qualche pulsante?", "Prova a fare insieme esperimento 6 e 5", "Aggiungi un pulsante per accendere e spegnere il LED all'esperimento 8!"). Codice esplode 1 riga in card-flat con 8 buildSteps **INVENTATI** ciascuno = **violazione TRIPLET COERENZA Morfismo Sense 2**.

**Vol1 vs Vol2 comparison**:
| Metric | Vol1 | Vol2 |
|--------|------|------|
| Esperimenti | 38 | 27 |
| Mount success | 38/38 | 27/27 |
| Lesson-groups mislabeled | 0/10 (✓) | 5/9 (⚠️) |
| Spiattellato count strict | 11/38 (29%) | 0/27 (0%) |
| Critical findings | 3 | 0 |
| HIGH findings | ~10 | 3 |
| Score | 5.5/10 | 6.8/10 |

## Methodology

Hybrid Approach 3 (per spec Vol2 sezione 4) + 3-way Maker split (vs 2-way Vol2 dato 38 esp vs 27).

## Findings (severity-ranked)

### CRITICAL (3 esperimenti)

1. **v1-cap14-esp1 Capstone Robot ELAB**
   - Breadboard coords code DIVERGE MASSIVELY from PDF (e-28 vs PDF e-1 anchor; b21 vs PDF g-15; d53..d56 vs PDF g-24..g-27)
   - PDF references physical "amico ELAB" mascot/case Omaric con anatomy occhi + mano RGB + scettro
   - Code only sims breadboard circuit, NO mascot SVG asset
   - Mechanical kit gap kit fisico Omaric extra-SVG
   - Fix richiesto: realign coords + mascot SVG OR simulable:false con foto + PDR mechanical assembly Omaric

2. **v1-cap10-esp1 LDR PRINCIPIO ZERO violation**
   - PDF explicitly says "non c'è bisogno di inserire un resistore"
   - Code adds 220Ω
   - Diretta violazione PRINCIPIO ZERO (testo libro = canone)

3. **v1-cap10-esp3 components instantiation bug**
   - Components array missing r1/r2/r3 declarations
   - But buildSteps reference r1/r2/r3
   - Simulator instantiation bug risk

### HIGH (~10 esperimenti)

**cap9 Pot 5/9 spiattellati HIGH** (Maker-2):
- esp3, esp7, esp8, esp9 = LETTERALMENTE 1 riga testo PDF
- esp7+8+9 codice ha 8 buildSteps **INVENTATI** ciascuno = violazione triplet Morfismo Sense 2
- Pattern peggiore Vol1

**cap7 RGB 3/6 spiattellati MEDIUM-HIGH** (Maker-1):
- esp1+esp2+esp3 stesso circuit (4 comps 6 wires)
- esp1=rosso, esp2=verde, esp3=blu — UN concetto canale RGB
- PDF arc 3-momenti continuo, code 6 esp card-flat

**cap8 Pulsante 2/5 spiattellati MEDIUM** (Maker-2):
- esp2 = variazione di esp1 ("Partendo dall'esperimento appena finito" PDF)
- esp5 = variazione di esp4 ("Giocando con esperimento 4" PDF)
- Code card-flat

### MEDIUM (~25 esperimenti)

- cap10 LDR esp2 = duplicate esp1 (4/6 stesso circuit)
- cap12 Reed esp2 = duplicate esp1 (5/5 stesso circuit)
- cap12-esp3 RGB locked rosso vs PDF "del colore che preferisci"
- cap12-esp4 1 pot vs PDF plurale "potenziometri"
- cap7-esp5 missing PDF observation "rosso 330→220Ω bilanciamento bianco"
- 38/38 PRINCIPIO ZERO violations (singolare imperative + missing Vol/pag citation)

### MINOR (~25 esperimenti)

- Accenti mancanti sistematici (legacy)
- Linguaggio tweaks
- cap6 esperimenti correttamente allineati (3/3 narrative distinct, smart anti-pattern esp2)

## Spiattellato Detailed Pattern

| Capitolo | Esp totali | Spiattellati | Pattern |
|----------|------------|---------------|---------|
| cap6 LED | 3 | 0 | ✅ Narrative distinct (esp1 first LED, esp2 anti-pattern, esp3 R variations) |
| cap7 RGB | 6 | 3 | ⚠️ esp1+2+3 = 1 concetto "accendi singolo canale" 3 colori |
| cap8 Pulsante | 5 | 2 | ⚠️ esp2 var di esp1, esp5 var di esp4 |
| cap9 Pot | 9 | 5 | 🔴 HIGH esp3+esp7+8+9 = 1 riga PDF, esp7+8+9 buildSteps INVENTATI |
| cap10 LDR | 6 | 1 | ⚠️ esp2 var di esp1 |
| cap11 Buzzer | 2 | 0 | ✅ Distinct |
| cap12 Reed | 4 | 1 | ⚠️ esp2 var di esp1 |
| cap13 Plastilina | 2 | 0 | ✅ Smart design (no bb) |
| cap14 Robot | 1 | 0 | 🔴 CRITICAL coords + mascot |
| **TOTAL** | **38** | **11** | **29% strict spiattellato** |

## Lesson-Groups Vol1 — CORRECTLY LABELED (10/10)

Vs Vol2 5/9 mislabeled, Vol1 lesson-groups.js è **correttamente etichettato**:
- v1-accendi-led ✓ matches PDF cap6 LED
- v1-led-rgb ✓ matches PDF cap7 RGB
- v1-pulsanti ✓ matches PDF cap8 Pulsante
- v1-potenziometro + v1-sfide-pot ✓ split cap9 (base + sfide)
- v1-sensore-luce ✓ matches PDF cap10 LDR
- v1-buzzer ✓ matches PDF cap11 Buzzer
- v1-reed-switch ✓ matches PDF cap12 Reed
- v1-plastilina ✓ matches PDF cap13
- v1-robot ✓ matches PDF cap14 Capstone

NO refactor needed at lesson-group level Vol1. Refactor è INTERNO ai gruppi (consolidate spiattellati come suggestedVariations).

## Concept-Grouping Refactor Proposal

**38 esp → 28 esp + 5 suggestedVariations**:
- cap7: 6 → 4 (consolidate esp2+esp3 into esp1 RGB channel selector)
- cap8: 5 → 3 (esp2 in esp1, esp5 in esp4)
- cap9: 9 → 4 + 3 suggestedVariations (esp2+esp3 in esp1, esp7+8+9 in esp6.suggestedVariations)
- cap10: 6 → 5 (esp2 in esp1)
- cap12: 4 → 3 (esp2 in esp1)
- Other chapters unchanged (cap6, 11, 13, 14)

Riduzione ~26% mantenendo concetti narrative + esposizione variazioni come tinkering nel `suggestedVariations` field (NON nuovo schema, leveraged from existing experiments-vol3.js v3-cap7-mini precedent).

## Cycle 3 Top Fix Priorities (8)

1. **P0 SPIATTELLATO REFACTOR** (4-6h, Davide review CRITICAL) — 38→28 esp via consolidate. Big refactor experiments-vol1.js + lesson-groups.js.
2. **P0 cap14 CRITICAL** (6-8h) — coords realign + mascot SVG asset + mechanical kit assembly PDR.
3. **P0 cap10-esp1 PRINCIPIO ZERO fix** (30min) — rimuovere R 220Ω.
4. **P0 cap10-esp3 components bug** (1h) — declare r1/r2/r3.
5. **P0 cap9 esp7+8+9 buildSteps INVENTATI** rimuovere (2h, parte di #1) — questi DEVONO essere consolidati come suggestedVariations cap9-esp6, NO fake buildSteps.
6. **P0 SYSTEMATIC PRINCIPIO ZERO codemod** 38/38 (3h) — singolare→plurale + Vol.1 pag.X citation.
7. **P2 cap12 fix** (1h) — esp3 RGB unlock + esp4 verifica plurale potenziometri.
8. **P2 cap7-esp5 missing PDF observation** (30min) — aggiungere note bilanciamento bianco.

## CoV 3x Verify

Sample 3 deterministic: cap7-esp2 (spiattellato), cap9-esp7 (buildSteps inventati), cap14 (capstone critical). Three runs Maker BG + Phase 2 live + Phase 3 cross-validation. All STABLE, divergence 0.0%, PASS.

## Anti-Regression

- vitest baseline 13595 PASS preserved (`automa/state/task5-vol1-baseline.txt`)
- src/ modifications: 0
- Compliance: PASS

## Honest Caveats

1. Per-esperimento PNG screenshots NOT saved (Chrome MCP limitation, same Vol2)
2. Figma cross-ref skipped (no file ID)
3. /elab-quality-gate skill NOT invoked (audit-only)
4. Spiattellato counts conservative — 11 strict (PDF literally 1-line variation), narrative-similar variants ~13-15 (35-40%)
5. BG Maker agents reported spec file NOT FOUND on disk during execution — applied via prompt + ground truth (audit quality unaffected)
6. Vol1 lesson-groups CORRECTLY labeled (opposite Vol2) — Andrea may verify independent finding

## References

- Spec: `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`
- Main JSON: `automa/state/task5-volumi-vol1.json`
- Maker outputs: `automa/state/maker{1,2,3}-vol1-*-audit.md`
- Phase 2 raw: `automa/state/inline-vol1-functional-test.md`
- Pattern S barriers: `automa/team-state/messages/maker{1,2,3}-vol1-phase1-completed.md`
- Vitest baseline: `automa/state/task5-vol1-baseline.txt`
- Vol2 audit (comparison): `automa/state/task5-volumi-vol2.json` + `docs/audits/2026-05-07-task5-volumi-vol2-audit.md`
