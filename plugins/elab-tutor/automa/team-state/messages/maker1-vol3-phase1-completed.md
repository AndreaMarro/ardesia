# maker1-vol3-phase1-completed

- Date: 2026-05-07
- Agent: Maker-1 Sprint U Cycle 2 Vol3 audit
- Phase: 1 (audit cap5-6 PDF v0.13 ground truth)
- Status: **COMPLETED**

## Esperimenti audited count
11/11 esperimenti cap5+cap6 code mappati contro PDF v0.13 ground truth.
- 2 cap5: v3-cap5-esp1, v3-cap5-esp2
- 9 cap6: v3-cap6-esp1, esp2, morse, esp3, esp4, semaforo, esp5, esp6, esp7

PDF v0.13 ESERCIZIO marker count cap5+cap6 = **10 narrativi distinct** (5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8).

## Spiattellato verdict cap6 (target Andrea 9 esp vs PDF reality)
- PDF v0.13 cap6 = **8 ESERCIZIO narrativi** (NOT 7 come iter 21 claim, NOT 9 come target Andrea)
- Code = **9 entry** (esp1-7 + morse + semaforo)
- NET delta = **+1 entry** vs PDF, MA non è "sano +1" — è disallineamento strutturale multi-direzione:
  - **2 esperimenti INVENTATI** (morse, 2-LED-1-pulsante) — violano "NO synthesis" mandate
  - **1 ESERCIZIO PDF GAP TOTALE** (6.1 AND/OR 2 pulsanti — code commento dichiara "rimosso intenzionalmente", viola Morfismo Sense 2 triplet)
  - **1 duplicato concettuale** (esp2 + esp3 entrambi "cambia pin" = stesso PDF 6.3)
  - **1 conflate 2 in 1** (esp5 = PDF 6.6 + 6.7 fusi)
  - Numerazione disallineata 7/9 esperimenti

**Spiattellato pattern verdict: confermato MA invertito** — non è "9 = 8+1 sano", è "9 = 6 mappati + 2 inventati + 1 PDF gap rimosso".

## Top 3 findings

1. **CRITICAL — 2 esperimenti inventati cap6**: `v3-cap6-morse` (SOS Morse code) e `v3-cap6-esp6` (2 LED + 1 pulsante) **non hanno corrispondenza in PDF v0.13** (verifica cap5+cap6+cap7). Spiattellato pattern Andrea iter 21 "no synthesis" violato. Fix: rimuovere o spostare in lesson-paths "Estensioni custom" fuori cap6.

2. **CRITICAL GAP — PDF 6.1 AND/OR rimosso**: ESERCIZIO 6.1 PDF v0.13 (line 1516-1670) "PROVIAMO IL CIRCUITO AND E OR con 2 pulsanti" **completamente assente** in code. Commento source line 1115-1119 dichiara intenzionale ("Il precedente AND/OR rimosso per preservare parallelismo"). Decisione era basata su ODT V0.9 outdated. PDF v0.13 ground truth conferma 6.1 È AND/OR. Morfismo triplet coerenza violato.

3. **HIGH — Numerazione disallineata**: Code esp1 = PDF 6.2 ; code esp2 = PDF 6.3 ; code esp5 dichiara `bookRef "Vol3 Cap7 ESERCIZIO 7.3"` ma è cap6 PDF 6.6. 7/9 esperimenti cap6 hanno bookRef numerato male. Renumber needed.

## v0.13 vs old V0.8.1 differences noted

- PDF v0.13 = **10 capitoli reali** (cap1-10) — vs V0.8.1 12 cap fittizi (cap10-12 ricostruiti da titoli, **deprecated**), vs ODT V0.9 9 cap reali
- **Cap 9 NUOVO** "Il piezo: facciamo musica!" pag 133 (PDF v0.13 line 30, ESERCIZIO 9.1+9.2 line 4189+4276) — assente sia V0.8.1 che ODT V0.9
- **Cap 10 NUOVO** "Il progetto finale: il gioco Simon" pag 141 — capstone Arduino reale, sostituisce ODT cap "Non è finita qui!" teasing
- Cap5+Cap6 piattezza confermata: 2 + 8 = 10 ESERCIZIO narrativi (vs claim iter 21 "Vol3 ODT 23 ESERCIZIO totali cap5-8")
- Sketch_Capitolo_X_Y references PDF v0.13 line 934 confermano sito ELAB download per ogni capitolo

## Severity counters
- 2 critical (morse invented + esp6 invented + PDF 6.1 AND/OR gap = 2-3 issues)
- 5 high (esp1/esp2 numbering, esp3 duplicato, esp5 bookRef cap7 wrong, esp5 conflate)
- 3 medium (esp4 pin diff, semaforo pin diff, esp7 missing bookRef)
- 3 minor (cap5 LED_BUILTIN vs 13, cap5 missing bookRef field x2)

## Status COMPLETED

Audit file: `automa/state/maker1-vol3-cap5-6-audit.md` (10 sezioni, ~270 LOC).

NO src/ modifications. NO tests/npm/git operations. Audit-only deliverable.
