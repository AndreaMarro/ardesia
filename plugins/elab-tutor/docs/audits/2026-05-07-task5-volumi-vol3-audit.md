# Sprint U Cycle 2 — Vol3 Audit Report

**Date**: 2026-05-07
**Scope**: Vol3 (29 esperimenti, PDF v0.13 NEWER 10 capitoli)
**Cycle**: 2 (audit-only, ZERO src/ modifications)
**Output principale**: `automa/state/task5-volumi-vol3.json`
**Spec/Plan**: shared with Vol2 (`docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`)
**Score**: **3.5/10** (PEGGIO di Vol1 5.5 e Vol2 6.8)

## Executive Summary

Sprint U Cycle 2 Vol3 audit usando PDF v0.13 NEWER (10 capitoli incluse cap9 piezo + cap10 Simon NEW) — vs Vol1+Vol2 audit usato old V0.8.1. Phase 1 (3 BG general-purpose agents parallel) + Phase 2 (Claude in Chrome MCP live test 29/29 mount, 0 errors). NanoBreakoutV1.1 GP.dwg AutoCAD non ispezionata (Fusion 360 disconnesso, Cycle 3 task con Andrea).

**MASSIVE FINDINGS** Vol3 ha problemi PEGGIO di Vol1+Vol2:
- **11 critical issues** (vs Vol1 3 + Vol2 0)
- **4 INVENTED esperimenti** (14% pure invention — code FABBRICA contenuto SENZA base PDF)
- **Cap9 piezo ENTIRE NEW chapter MISSING** (PDF v0.13 cap9 "Il piezo: facciamo musica!" 2 ESERCIZIO, code 0)
- **Cap10 Simon naming WRONG** (extras vs cap10) + **4 PIN MISMATCH** (LED A0-A3, buzzer D9, pulsanti D13-D10 + missing 5° pulsanteDiAvvio)
- **2 LEGACY EXTRAS** (lcd-hello + servo-sweep) inesistenti nel libro v0.13 (anti-Morfismo Sense 2)
- **7/29 esperimenti senza Arduino sketch** (UX rotta cap5+ Arduino-centric)
- **Title-ID collisions** cap6-esp3+morse e cap6-esp5+semaforo

## Vol3 vs Vol1 vs Vol2 Comparison

| Metric | Vol1 | Vol2 | Vol3 |
|--------|------|------|------|
| Esperimenti | 38 | 27 | 29 |
| Mount success | 38/38 | 27/27 | 29/29 |
| Critical findings | 3 | 0 | **11** |
| HIGH findings | ~10 | 3 | 15 |
| MEDIUM findings | ~25 | 4 | 14 |
| Total issues | ~63 | 27 | **51** |
| Spiattellato strict | 11/38 (29%) | 0/27 (0%) | 4/29 INVENTED (14%) |
| Lesson-groups | 0/10 mislabeled ✓ | 5/9 mislabeled ⚠️ | cap9 missing + cap10 wrong# |
| Score | 5.5/10 | 6.8/10 | **3.5/10** |

## Methodology

Hybrid Approach 3 (per spec Vol2) + 3-way Maker split + PDF v0.13 NEWER ground truth.

- Phase 0: pre-flight (vitest 13595 baseline, count 29 verified, Chrome MCP)
- Phase 1: 3 BG agents parallel:
  - Maker-1 cap5-6 (Blink + pin digitali) 11 esp
  - Maker-2 cap7 (pin analogici) 9 esp
  - Maker-3 cap8+9+10+extras + GAP analysis 9 esp
- Phase 2: Claude in Chrome MCP mega-loop async (60s, 29/29 mount=true)
- Phase 3+4: consolidation + concept-grouping + impeccable critique inline + score calibration

## Findings by Maker

### Maker-1 cap5-6 (2 critical, 5 high, 3 medium, 3 minor)

**PDF v0.13 cap6 = 8 ESERCIZIO** (not 7 iter 21 claim, not 9 code count).

1. **CRITICAL**: `v3-cap6-morse` + `v3-cap6-esp6` INVENTATI (no PDF basis) — viola "no synthesis" mandate Andrea iter 21+
2. **CRITICAL**: PDF 6.1 (AND/OR 2 pulsanti) RIMOSSO INTENZIONALMENTE — code commento dichiara — viola Morfismo Sense 2 triplet coerenza
3. HIGH: numerazione + bookRef errati 7/9 esperimenti (esp5 dichiara cap7 ma è cap6)
4. HIGH: title-ID collisions cap6-esp3+morse e cap6-esp5+semaforo
5. HIGH: duplicato concettuale (esp2+esp3 entrambi "cambia pin" + esp3 missing code)

### Maker-2 cap7 (4 critical, 7 high, 9 medium, 7 minor — 27 issues totali)

**PDF v0.13 cap7 = 7 ESERCIZIO narrativi**, code 9 entries = +2 inventati/duplicate.

1. **CRITICAL**: `v3-cap7-esp5` INVENTED "PWM con valori manuali" — non esiste in PDF v0.13
2. **CRITICAL**: `v3-cap7-mini` DUPLICATE di esp1 + Vol/pag citation ERRATA (Vol.3 pag.75 vs reale 84-86)
3. HIGH numbering shift cascade: esp6→7.5, esp7→7.6, esp8→7.7 PDF
4. HIGH LED color systemic: 5/9 esp usano rosso, PDF prescrive verde
5. HIGH esp1 soglia off-by-one: JS `> 511` vs PDF `> 512` (mini ha 512 corretto)
6. HIGH esp8 DAC reale: no multimetro fallback simulato — output "muto"
7. MEDIUM Vol/pag citation missing 8/9 — viola PRINCIPIO ZERO Andrea iter 21

### Maker-3 cap8 + cap9 + cap10 + extras (5 critical, 3 high, 2 medium, 1 minor)

**GAP analysis verdicts**:

1. **CRITICAL cap9 piezo GAP CONFIRMED**: PDF v0.13 cap9 "Il piezo: facciamo musica!" (NEW chapter, pp.133-140) ha 2 ESERCIZIO (9.1+9.2) ma ZERO `v3-cap9-*` esperimenti nel code. Intero capitolo non implementato.

2. **CRITICAL cap10 Simon NAMING WRONG**: PDF v0.13 esplicitamente "CAPITOLO 10 IL PROGETTO FINALE: IL GIOCO SIMON" pag.141, code lo chiama `v3-extra-simon` con `chapter:"Extra"`. **PIN ASSIGNMENTS TOTALMENTE SBAGLIATI vs PDF**:
   - LED: A0-A3 PDF vs D9-D12 code
   - Buzzer: D9 PDF vs D8 code
   - Pulsanti: D13-D10 PDF vs D3+D5+D6+D13 code
   - **MANCA 5° pulsanteDiAvvio**

3. **CRITICAL extras lcd-hello + servo-sweep LEGACY V0.8.1**: grep v0.13 conferma 0 menzioni hardware LCD/servo. Orphan da vecchia versione PDF — anti-Morfismo Sense 2 (kit fisico Omaric non li include).

4. HIGH: `v3-cap8-serial` DUPLICATE di `v3-cap8-esp1` + cita pag.87 errata (PDF mostra ESERCIZIO 8.1 a pag.119)

5. HIGH: `v3-cap8-esp5` claim falso "progetto finale Vol3" (Simon è cap10, not cap8)

6. MEDIUM: PDF cap8 "barra progressiva tipo volume" (esp6) MANCA in code

## INVENTED Esperimenti (Vol3 unique pattern)

Vol3 ha pattern UNICO peggiore di Vol1 spiattellato: **code FABBRICA contenuto SENZA base PDF**.

| ID | Title | Status | Action |
|----|-------|--------|--------|
| v3-cap6-morse | "SOS in codice Morse" | INVENTED | RIMUOVERE |
| v3-cap6-esp6 | "Due LED, un pulsante" | INVENTED | RIMUOVERE |
| v3-cap7-esp5 | "PWM con valori manuali" | INVENTED | RIMUOVERE |
| v3-cap7-mini | "Pot ADC + LED PWM" | DUPLICATE esp1 + wrong Vol/pag | RIMUOVERE |

Total: 4/29 = **14% pure invention**.

Vs Vol1 11/38 (29%) spiattellato (variazioni 1-line PDF), Vol3 invention pattern è PEGGIO perché:
- Spiattellato (Vol1): PDF ha base 1-line "prova ora", code esplode in N esp = inflated MA con ancoraggio testuale
- Invented (Vol3): PDF NON ha base, code crea contenuto da zero = FABRICATION pure

Pattern peggiore per:
- UNLIM tutoring (può citare Vol/pag errato)
- Studente che cerca esperimento nel libro (NON trova)
- Morfismo Sense 2 triplet (viola coerenza software-libro-kit)

## Cap9 Piezo Implementation Plan (NEW chapter)

PDF v0.13 cap9 pp.133-140 "Il piezo: facciamo musica!" — 2 ESERCIZIO da implementare:

```
PROPOSED:
  v3-cap9-esp1 (PDF ESERCIZIO 9.1)
    - components: nano-r4 + breadboard + buzzer-piezo
    - sketch: tone(pin, frequency, duration)
    - concept: produrre note singole
    - lesson group: v3-piezo (NEW), chapter:9, icon: 🎵

  v3-cap9-esp2 (PDF ESERCIZIO 9.2)
    - components: nano-r4 + breadboard + buzzer-piezo
    - sketch: melodia con array note + ciclo for + tone()
    - concept: comporre melodia
    - lesson group: v3-piezo
```

Cycle 3 implementation: 2-3h impl + test + Davide review per Vol/pag citation accuracy.

## cap10 Simon Refactor Plan

```
CURRENT:
  v3-extra-simon
  chapter: "Extra"
  pin: LED D9-D12, buzzer D8, pulsanti D3+D5+D6+D13 (4 pulsanti)

PROPOSED v0.13 ALIGNED:
  v3-cap10-esp1 (rinomina)
  chapter: 10
  title: "Cap. 10 - Il progetto finale: il gioco Simon"
  pin: LED A0-A3, buzzer D9, pulsanti D13-D10 (4) + pulsanteDiAvvio (5° pin TBD per PDF v0.13 cap10)
  lesson group: v3-progetto-finale-simon, chapter:10, icon: 🎮
```

Cycle 3 implementation: 3-4h impl + test + verifica PDF v0.13 cap10 pag.141 specifica pin esatti.

## Hardware Audit

### Arduino Nano R4 Fritzing (`HARDWARE/Arduino NANO R4.zip`)
- Files: part.fzp + 4 SVGs (breadboard, icon, pcb, schematic)
- Dimensions breadboard SVG: **44.22×17.77mm** (vs Arduino Nano R4 reale 45.0×18.0mm — ±0.4mm acceptable)

### ELAB Nano Breakout Fritzing (`HARDWARE/ELAB Nano Breakout.zip`)
- Files: part.fzp + 4 SVGs (large breadboard 716KB)
- viewBox: 287.24×200.97
- ⚠️ **Fritzing tags: arduino, NANO RP2040 CONNECT, RP2040** (kit Omaric should be R4)
- ⚠️ Property type: "Arduino NANO RP2040 CONNECT with headers"
- Possible explanation: Fritzing part adapted from RP2040 reference, but Omaric kit uses R4

### NanoBreakoutV1.1 GP.dwg AutoCAD (`HARDWARE/NanoBreakoutV1.1 GP.dwg`)
- Format: AutoCAD .dwg V1.1 attribuzione "GP" (Giovanni? Davide? Pier...?)
- ⚠️ **NON ispezionato** questa sessione — Fusion 360 MCP disconnesso
- Cycle 3 task: Andrea apre Fusion 360 + carica .dwg + run `mcp__fusion360__get_scene_info` + `mcp__fusion360__list_components` per cross-reference dimensioni vs `NanoR4Board.jsx` C-shape PCB coords
- Expected match: NanoR4Board.jsx C-shape (full semicircle left R=49.5, body 0..130, upper arm y=0..25, notch right 130..168 + 25..84, lower tab 130..155 + 84..99, pin pitch 7.5px breadboard-aligned)

### Simulator NanoR4Board.jsx (`src/components/simulator/components/NanoR4Board.jsx`)
- Header comment: "ELAB NanoBreakout V1.1 GP — SVG Component (7-Order Redesign)"
- Design: C-shape PCB integrating Nano R4 + ELAB breakout in single SVG
- SCALE=1.8 (CLAUDE.md immutable rule)
- Pin pitch 7.5px breadboard-aligned
- Verifica vs .dwg: NOT VERIFIED Cycle 2

## Impeccable Design Critique (inline observations)

Skill `/impeccable` NOT formally invoked — inline observations applied:

1. Vol3 software ha più issues di vendita di Vol1+Vol2 — **inappropriato per PNRR/MePA Davide se non sanato**
2. INVENTED esperimenti (14%) violano triplet coerenza Morfismo Sense 2 — kit fisico + libro Davide non li include, simulator li ha = aspettativa studente non realizzabile
3. Simon (cap10) è il PROGETTO FINALE pedagogico ma codice lo nasconde come 'extra' — perde valenza didattica + Vol/pag citation per UNLIM
4. Cap9 piezo NEW = capitolo creativo + sensoriale per studenti — gap implementazione blocca esperienza completa libro
5. lcd-hello + servo-sweep extras: o si rimuovono (anti-Morfismo) o si formalizzano in PDF v0.14 (Davide)
6. Title-ID collisions cap6 confondono UNLIM tutor + analytics + studenti
7. 7/29 esperimenti senza Arduino sketch = experience UX rotta
8. LED color systemic 5/9 rosso vs PDF verde — Morfismo violation visuale

Cycle 3 entrance + Andrea decide: invocare `/impeccable:critique` o `/impeccable:audit` per design review completo Vol3 con Fusion 360 dwg + Figma cross-ref.

## Cycle 3 Top Fix Priorities (12)

1. **CRITICAL P0 cap9 piezo NEW chapter** — IMPLEMENTARE 2 esperimenti (2-3h, Davide review)
2. **CRITICAL P0 cap10 Simon** — Rinomina + chapter:10 + 4 PIN MISMATCH fix (3-4h)
3. **CRITICAL P0 Rimuovere 4 INVENTED** — v3-cap6-morse + v3-cap6-esp6 + v3-cap7-esp5 + v3-cap7-mini (2-3h)
4. **CRITICAL P0 Implementare GAP** — v3-cap6-AND-OR (PDF 6.1) + cap8-esp6 barra progressiva (3h)
5. **HIGH P1 Decide extras LEGACY** — lcd + servo: rimuovere OR Davide v0.14 (decision + 1-2h impl)
6. **HIGH P1 Title-ID collisions cap6** — renumber (1h)
7. **HIGH P1 Missing Arduino code 7/29** — implementare sketch (3-4h)
8. **HIGH P1 LED color cap7 5/9** — rosso → verde per allineamento PDF (1h)
9. **HIGH P1 cap7-esp1 soglia 511 → 512** (15min)
10. **MEDIUM P2 PRINCIPIO ZERO codemod 29/29** — singolare→plurale + Vol/pag citation (2h)
11. **MEDIUM P2 NanoBreakout dwg ispezione** — Andrea Fusion 360 + cross-ref NanoR4Board.jsx (1-2h Andrea)
12. **MEDIUM P2 Fritzing zip RP2040 → R4 cleanup** (Davide o Andrea, 30min)

**Total Cycle 3 effort estimate Vol3**: ~25-30h (esp Davide content cap9 + decisione extras).

## CoV 3x Verify

Sample 3 deterministic: cap6-morse (INVENTED), cap7-esp5 (INVENTED), cap10/extra-simon (naming+pin). All STABLE across runs Maker BG + Phase 2 + Phase 3 cross-validation. Divergence 0.0%, PASS.

## Anti-Regression

- vitest baseline 13595 PASS preserved
- src/ modifications: 0
- Compliance: PASS

## Honest Caveats

1. PDF v0.13 ground truth (NEW 10 capitoli) — vs Vol1+Vol2 audit usa V0.8.1 (9 capitoli outdated). Vol3 audit ha SUPERIOR ground truth.
2. Per-esperimento PNG screenshots NOT saved (Chrome MCP base64 blocked)
3. AutoCAD .dwg NanoBreakout schema NOT inspected (Fusion 360 disconnected, Cycle 3 task)
4. /elab-quality-gate skill NOT invoked
5. /impeccable critique skill NOT formally invoked — inline observations applied
6. Figma cross-ref skipped (no file ID)
7. INVENTED count 4 conservative — Andrea verify Maker outputs accuracy pre-Cycle 3 removal
8. Vol/pag citation errors approximate ±1-2 pages
9. Extras lcd-hello + servo-sweep "legacy V0.8.1" = INFERENCE based on grep v0.13 negative — could be Davide future v0.14 content
10. Mega-loop ran 2x (1st window state cleared between Phase 1 BG dispatch + Phase 2, 2nd successful)

## References

- Spec: `docs/superpowers/specs/2026-05-07-task5-volumi-vol2-design.md`
- Plan: `docs/superpowers/plans/2026-05-07-sprint-u-cycle2-vol2-audit.md`
- Vol3 main JSON: `automa/state/task5-volumi-vol3.json`
- Maker outputs: `automa/state/maker{1,2,3}-vol3-*-audit.md`
- Phase 2 raw: `automa/state/inline-vol3-functional-test.md`
- Pattern S barriers: `automa/team-state/messages/maker{1,2,3}-vol3-phase1-completed.md`
- Vol1 audit: `automa/state/task5-volumi-vol1.json` (precedent spiattellato)
- Vol2 audit: `automa/state/task5-volumi-vol2.json` (precedent mislabeling)
- PDF v0.13: `/Users/andreamarro/VOLUME 3/Manuale vol 3 versione 0.13.pdf`
- Hardware: `/HARDWARE/Arduino NANO R4.zip`, `/HARDWARE/ELAB Nano Breakout.zip`, `/HARDWARE/NanoBreakoutV1.1 GP.dwg`
