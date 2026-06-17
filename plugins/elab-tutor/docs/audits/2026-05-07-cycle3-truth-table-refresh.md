# Sprint U Cycle 3 — Truth Table Refresh (Phase 0 anti-hallucination preamble)

**Generated**: 2026-05-07 ~16:45 GMT+2
**Skill invocation**: `/claude-mem:make-plan` Phase 0 preamble
**Mandate**: massima onestà, non compiacere, no synthesis (Andrea iter 21+)
**Source plan**: `docs/plans/2026-05-07-sprint-u-cycle3-fix-wave-plan.md`

---

## Phase 0 Goals (per plan)

1. Re-verify INSUFFICIENT_EVIDENCE entries from initial Discovery agent run
2. Refresh PRINCIPIO ZERO violation count (audit underestimated)
3. Confirm baseline 13474 unchanged
4. Lock truth table for Phase 1+ fix wave entry

## Sources Consulted

- `automa/state/task5-volumi-vol1.json` (audit JSON)
- `docs/audits/2026-05-07-task5-volumi-vol1-audit.md`
- `src/data/experiments-vol1.js` (live read cap12-esp3 + esp4 lines 5939-6213)
- `/tmp/vol1-layout.txt` (regenerated this session via `pdftotext -layout`)
- `automa/baseline-tests.txt` (canonical 13474)

---

## Refreshed Verified Truth Table

### #12 cap12-esp3 RGB locked rosso vs PDF "colore che preferisci"

**Previous status**: ⚠️ INSUFFICIENT_EVIDENCE
**Refreshed status**: ✅ **REAL**

**Code state** (`src/data/experiments-vol1.js:5939-6096`):
- `pinAssignments` rgb1:red d24, rgb1:common d25 (line 5958-5959)
- `connections` line 5967 single orange wire `bb1:a21 → bb1:a24` = RED channel only
- `observe` line 5986: "Il magnete accende il canale rosso del RGB! Riesci a farlo diventare bianco aggiungendo circuiti per verde e blu?"

**PDF state** (`/tmp/vol1-layout.txt` cap12 ESPERIMENTO 3 lines 104-107 within `awk /CAPITOLO 12/,/CAPITOLO 13/` extract):
> "ESPERIMENTO 3 / Prova a realizzare un circuito che accenda un LED RGB del **colore che preferisci** utilizzando un interruttore magnetico"

**Conflict**: PDF says student chooses any color, code locks to red channel via single orange wire. `observe` field acknowledges incompleteness ("aggiungendo circuiti per verde e blu") but invariant is locked-red.

**Fix scope** (Cycle 3 Phase 1 or Phase 2 candidate):
- Option A (minimal): update `desc` + `observe` + `unlimPrompt` to acknowledge "scegli colore" framing without changing wires (interpret as Sfida open)
- Option B (full): add 2 additional resistors + 2 wires for green + blue channels, parametrize selection
- Recommendation: Option A 0.5h scope; Option B 2h Davide ratify scope (changes esperimento difficulty)

### #13 cap12-esp4 plurale "potenziometri" vs code 1 pot

**Previous status**: ⚠️ INSUFFICIENT_EVIDENCE
**Refreshed status**: ✅ **REAL**

**Code state** (`src/data/experiments-vol1.js:6099-6213`):
- `components` line 6110 single `pot1` only
- All buildSteps + pinAssignments singular pot1

**PDF state** (`/tmp/vol1-layout.txt` cap12 ESPERIMENTO 4 lines 112-114):
> "ESPERIMENTO 4 / Prova ad utilizzare insieme **potenziometri** [PLURALE], LED RGB e un interruttore"

**Conflict**: PDF plurale "potenziometri" = at least 2 pots, code has 1.

**Fix scope** (Cycle 3 Phase 1 or Phase 2 candidate):
- Option A (minimal): change `desc` + `unlimPrompt` to singolare "potenziometro" (rewrite to match code, but violates Morfismo Sense 2 verbatim mandate)
- Option B (full): add pot2 + buildSteps + pinAssignments + connections (matches PDF, increases scope)
- Recommendation: Option B 1.5h Davide ratify scope (PDF is canonical per Morfismo Sense 2)

### #15 lesson-groups Vol1 labeling

**Previous status**: ⚠️ INSUFFICIENT_EVIDENCE
**Refreshed status**: ⚠️ **DEFERRED** (out of Cycle 3 scope; Sprint T iter 39+ candidate)

---

## Refreshed cap14-esp1 PDF Citation Block

`/tmp/vol1-layout.txt` lines extracted via `awk /CAPITOLO 12/,/CAPITOLO 13/` show full cap14 content (cap12 includes capstone esercizio for cap14 mascot reference):

| Pin | PDF verbatim quote                                                       | Line |
|-----|--------------------------------------------------------------------------|------|
| pot1:pin1 | "1. potenziometro n°1 Pin e-1"                                     | 2497 (within extract) |
| pot2:pin1 | "2. potenziometro n°2 Pin e-5"                                     | 2498 |
| pot3:pin1 | "3. potenziometro n°1 Pin e-9" (sic — PDF typo "n°1" should be "n°3") | 2499 |
| led1:anode (gambetta lunga) | "1. Led1 gambetta lunga su g-15"                          | 2511 |
| led1:cathode (gambetta corta) | "2. Led1 gambetta corta su g-16"                        | 2512 |
| led2:anode | "3. Led2 gambetta lunga su d-15"                                  | 2513 |
| led2:cathode | "4. Led2 gambetta corta su d-16"                                | 2514 |
| jumper f-15 to e-15 | "Ora colleghiamo con due fili il punto f-15 con e-15"     | 2516 |
| jumper f-16 to e-16 | "e f-16 con e-16"                                         | 2516 |
| resistor a-15 | "Inseriamo una resistenza da 220 Ohm dal pin a-15 verso la linea del positivo" | 2518 |
| pot wire 1 | "5. piedino potenziometro j-2 con punto j-27"                     | 2528 |
| pot wire 2 | "6. piedino potenziometro j-6 con punto j-26"                     | 2529 |
| pot wire 3 | "7. piedino potenziometro j-10 con punto j-24"                    | 2530 |
| reed pin1 | "8. un piedino su g-18"                                            | 2536 |
| reed pin2 | "9. un piedino su d-18"                                            | 2537 |
| jumper j-16 to j-18 | "colleghiamo i LED verdi al l'interruttore con un filo da j-16 a j-18" | 2539 |
| jumper i-18 to j-25 | "Colleghiamo anche i-18 con j-25"                          | 2540 |
| jumper c-16 to neg | "con un terzo cavo, colleghiamo c-16 con la linea del negativo" | 2542 |
| RGB common (gamba lunga) | "il piedino più lungo devi inserirlo su g-25"              | 2580 |
| RGB other pins | "(g-24),(g-26) e (g-27)"                                       | 2581 |

**Confirmed conflict**: code `experiments-vol1.js:6564` `led1:anode bb1:b21` vs PDF `g-15`. Massive divergence requires full coord rebuild for cap14-esp1 PR-C.

**Note**: PDF has internal typo "potenziometro n°1 Pin e-9" (line 2499) — should be "n°3". Phase 1 PR-C should follow PDF coordinates (e-9) not the human-error typo numbering. Document this in PR description.

---

## Refreshed PRINCIPIO ZERO Violation Count

```bash
grep -cE "(Posiziona|Collega|Prendi|Inserisci|Allarga|Avvicina|Scollega) " src/data/experiments-vol1.js  # 681
grep -cE "(Posiziona|Collega|Prendi|Inserisci|Allarga|Avvicina|Scollega) " src/data/experiments-vol3.js  # 312
# Vol2 already plurale post Vol2 PR #85 Cycle 2 rinomina
```

**Total Vol1+Vol3: 993 singolare imperative occurrences**.

Audit Cycle 2 said ~200 = **5× underestimate** (revised from 3.4× initial Phase 0 estimate; Vol3 312 was not counted in initial sweep).

Phase 5 codemod scope unchanged but hours estimate revised: 3-6h → **5-8h** (993 vs 200 instances).

---

## Phase 0 Verification Checklist

- [x] `/tmp/vol1-layout.txt` regenerated this session (2622 lines, line counts shifted from `/tmp/vol1.txt` due to `-layout` flag)
- [x] cap12-esp3 verdict ✅ REAL (PDF "colore che preferisci" line 106)
- [x] cap12-esp4 verdict ✅ REAL (PDF plurale "potenziometri" line 114)
- [x] cap14-esp1 PDF citation table built (12+ pin coords with verbatim quotes)
- [x] PRINCIPIO ZERO count refreshed: 993 (Vol1 681 + Vol3 312)
- [x] Baseline 13474 confirmed unchanged
- [x] No regression risk (Phase 0 = read-only audit doc, no src/ changes)

---

## Cycle 3 Total Hallucination Rate Refreshed

After Phase 0 INSUFFICIENT_EVIDENCE re-verification:
- ✅ REAL: **12** (was 10, +2 from cap12-esp3+esp4 upgrade)
- ⚠️ PARTIAL: **2** (#1 cap10-esp1 nuance, #5 cap9 buildSteps count exaggerated)
- ⚠️ INSUFFICIENT_EVIDENCE: **0** (was 2, both resolved)
- ⚠️ DEFERRED: **1** (#15 lesson-groups out of scope)
- ❌ HALLUCINATED (strict): **0**

**Hallucination rate strict Vol1 = 0/14 = 0%** (Cycle 2 broader 33% halluc claim is Vol3-driven per handoff §Likely hallucination sources — Vol3 audit work needs heavier re-verify in Phase 4).

**Partial-or-nuanced rate Vol1 = 2/14 = 14%** (improved from initial 29%).

---

## Phase 1 Entry Conditions

✅ All Phase 0 verification done.
✅ Truth table locked for Cycle 3 fix wave.
✅ Baseline preserved.
✅ No code changes Phase 0 (read-only audit doc only).

**Next**: Phase 1 PR-A — `fix/cycle3-vol1-cap10-esp1-220-removal` branch off main, ~1h scope.

---

## Cross-references

- Plan: `docs/plans/2026-05-07-sprint-u-cycle3-fix-wave-plan.md`
- Handoff: `docs/handoff/2026-05-07-cycle3-next-session-prompt.md`
- Audit JSON: `automa/state/task5-volumi-vol1.json`
- Audit md: `docs/audits/2026-05-07-task5-volumi-vol1-audit.md`
- PDF extracts: `/tmp/vol1-layout.txt` (this session), `/tmp/vol1.txt` (Apr 26)
- CLAUDE.md `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/CLAUDE.md` (PRINCIPIO ZERO + Morfismo Sense 1+2 invariants)
