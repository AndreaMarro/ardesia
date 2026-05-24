# Convergence Round 2 — Vol2 + Vol3 + Vol1 verify

**Date**: 2026-05-24 07:30
**Sources**:
- Codex round 2 report: `/tmp/codex-vol2-vol3-deep-analysis.md` (132 lines)
- Claude convergence round 1: `docs/demo-audit/v1-convergence-round1.md`
- Phase D source diff Vol1: `docs/demo-audit/v1-source-diff-phase-D.md`
- Repo data: `src/data/experiments-vol{2,3}.js` + lesson-paths
- Solver source: `src/components/simulator/engine/{CircuitSolver,AVRBridge,NanoR4Board}.js`

**Andrea NON COMPIACERMI**: Codex round 2 trovato 6+ NUOVI errori MIEI + 2 BLOCKER source-of-truth canon clash.

---

## PART A: Vol1 verify post-correzioni round 1

### Verified PERSISTED ✅
| Correction round 1 | Status round 2 |
|---------------------|-----------------|
| Battery asset `battery9v-vol1-horizontal-clip-right` | ✅ PERSISTED tutti 3 bookGeometry Vol1 |
| esp3 LED green | ✅ bookGeometry esp3 line ~81-95 |
| esp2 LED standard splayed | ✅ bookGeometry esp2 line ~53-68 |
| 9 corrections in convergence-round1 doc | ✅ All match round 1 codex findings |

### NUOVI findings Vol1 round 2

**MEDIUM esp1 asset name inconsistency**: bookGeometry esp1 usa `led-book-vol1-vertical-standard` (line 80-99) mentre esp2/esp3 usano `led-book-vol1-standard-splayed`. Naming convention inconsistente — fix esp1 → `led-book-vol1-standard-splayed`.

**LOW asset existence UNVERIFIED**: bookGeometry asset strings (`battery9v-*`, `breadboard-*`, `resistor-book-*`, `led-book-*`) NON corrispondono a file SVG fisici esistenti in repo. Probabilmente renderer-token convention. Andrea verify se BookGeometryRenderer.jsx interpreta come asset lookup keys.

---

## PART B: Vol2/Vol3 deep findings + miei errori

### MIEI ERRORI confermati da CODEX round 2

| # | Mio claim | Realtà codex | File da fixare |
|---|-----------|--------------|----------------|
| 1 | Vol3 esp4 "R = 220Ω default Vol3" | Repo `experiments-vol3.js:1026-1039` usa R=470Ω (bande yellow-violet-brown). PNG conferma 470-style bands | deep doc esp4 |
| 2 | Vol3 esp5 "LED layout verticale torre semaforo" | PNG mostra HORIZONTAL row red-yellow-green left-to-right (NOT vertical). Repo green-yellow-red REVERSED vs PNG | deep doc esp5 |
| 3 | Vol2 esp1 "solver discharge path bug, cap trattiene 9V" | CircuitSolver.js HA multimeter discharge logic (`:1233`, `:2194-2242`). Cap-MM transient voltage modeled. Mio "bug" claim ERRATO | deep doc esp1, Phase D Vol1 doc |
| 4 | Vol2 esp1 W3 filo colorato "TBD verify" | Repo `experiments-vol2.js:2194` GIÀ usa yellow per W3 | deep doc esp1 |
| 5 | Vol3 esp4 "topology RESET handoff" | Topology NON è reset-empty. È popolato MA wire D6/D9 sbagliati vs libro D8/D9 | deep doc esp4 |
| 6 | Vol3 esp5 "topology RESET handoff" | Topology NON è reset-empty. È popolato MA pin rosso D9 sbagliato vs libro D7. Layout LED REVERSED | deep doc esp5 |
| 7 | Vol2 esp2 "8 step illustrati" | PNG conferma 1+3+3 = 7 illustrazioni circuit (pag.69 ill.1, pag.70 ill.3, pag.71 ill.3) | deep doc esp2 |
| 8 | Vol2 esp2 "solver dynamic RC TBD verify" | CircuitSolver:1187-1195, :1491-1508, :1840-1888 HA LED Vf + cap discharge logic | deep doc esp2 |

### NUOVI Vol2/Vol3 findings BLOCKERS

**BLOCKER 1 — Vol2/Vol3 bookGeometry MISSING tutti 4 esp**:
- `src/data/book-geometry/v2-cap7-esp{1,2}.bookGeometry.json` — DA CREARE
- `src/data/book-geometry/v3-cap6-esp{4,5}.bookGeometry.json` — DA CREARE
- Workflow-v2 fase 9 mandate

**BLOCKER 2 — Vol2 bb half vs libro full**:
- `experiments-vol2.js:2177-2179` + `:2288-2289`: `breadboard-half`
- PNG pag.67-71: bb FULL SIZE
- App ha `BreadboardFull.jsx` esistente (line 431-442) + `BreadboardHalf.jsx` (line 428-439)
- Fix: cambiare type `breadboard-half` → `breadboard` (assumendo full default) OR esplicito `breadboard-full`

**BLOCKER 3 — Vol3 esp4 PIN MISMATCH repo vs libro V0.8.1**:
- Repo `experiments-vol3.js:1046-1098`: `nano1:W_D6` per LED1 + code `const int LED_BLU = 6;`
- Libro V0.8.1 pag.37: `LED 1 → pin 8` verbatim
- **Andrea ratify CANON**: V0.8.1 (D8) OR Vol3 final stampato (D6)?

**BLOCKER 4 — Vol3 esp5 PIN MISMATCH repo vs libro V0.8.1**:
- Repo `experiments-vol3.js:1361-1400`: rosso `nano1:W_D9` + code `const int LED_ROSSO = 9;`
- Libro V0.8.1 pag.38: `Rosso → pin 7` verbatim
- Repo bookRef "Vol.3 pag.57" + lesson-path observe "pin 5, 6, 9" → repo seguendo Vol3 final stampato NON V0.8.1 manuale

**Hypothesis canon clash**:
- `Manuale VOLUME 3 V0.8.1.pdf` = bozza Davide pre-stampa (PDF cartella volumi-pdf)
- `Vol3 final stampato V1.0+` = libro che esiste (pag.54-57 stampate) — NON disponibile come PDF in volumi-pdf?
- Repo seguito Vol3 final stampato (pag.54/57 + pin 6/9)
- Codex usato V0.8.1 PDF disponibile

**Andrea verify URGENTE**: quale è canon REALE demo 25/05?
- Se V0.8.1 manuale = canon → repo PIN sbagliati (fix esp4 D6→D8, esp5 D9→D7)
- Se Vol3 final stampato = canon → repo OK (questi codex finding sono NON applicabili, V0.8.1 outdated)

**BLOCKER 5 — Vol3 esp5 LED LAYOUT REVERSED**:
- PNG pag.pdf38: red-yellow-green left-to-right
- Repo layout `experiments-vol3.js:1413-1436`: green-yellow-red left-to-right
- Fix dipende canon: se V0.8.1 → REVERSE layout. Se Vol3 final → verify Vol3 final layout (TBD)

### CODEX confermati findings Vol2/Vol3

| Finding | Status |
|---------|--------|
| Vol2 esp1 R 1kΩ materiale lista ma NON illustrato | ✅ Conferma audit Andrea ratify |
| Vol2 esp1 over-wired vs libro (7 vs ~5 visibili) | ✅ Conferma anti-pattern |
| Vol2 esp1 battery posizione below-left bb (NON lato Vol1) | ✅ |
| Vol2 esp2 8 prose actions libro vs 12-15 repo buildSteps | ✅ Reduction needed |
| Vol2 esp2 "3 fili colorati" libro vs 6+ repo colors | ✅ |
| Vol3 esp4+esp5 lesson-path no code key (verbatim libro mancante) | ✅ |
| Vol3 esp4+esp5 AVRBridge support D5/D6/D7/D8/D9 OK | ✅ Engine OK, solo data wrong |
| Vol3 esp4 R=470Ω (NOT 220 come io dichiaravo) | ✅ Mio errore |
| Vol3 esp4 LED colors PNG = 2 turquoise/blue (repo blue+red AMBIGUOUS) | MEDIUM |
| Vol3 esp5 timing 3s/1s/3s match repo | ✅ |

### Severity table consolidata round 2

| Esp | BLOCKERS | HIGH | MEDIUM | LOW |
|-----|---------:|-----:|-------:|----:|
| v1-cap6-esp1 | 0 (round 1 corrected) | 4 | 3 | 4 |
| v1-cap6-esp2 | 0 | 3 | 3 | 3 |
| v1-cap6-esp3 | 1 (R=220 burn threshold) | 5 | 3 | 3 |
| v2-cap7-esp1 | 2 (bookGeometry + bb-full) | 3 | 3 | 5 |
| v2-cap7-esp2 | 2 (bookGeometry + bb-full) | 1 | 3 | 7 |
| v3-cap6-esp4 | 3 (pin canon clash + bookGeometry + no lesson code) | 1 | 3 | 6 |
| v3-cap6-esp5 | 3 (pin canon clash + bookGeometry + layout reversed) | 2 | 2 | 6 |

**TOTALE BLOCKERS demo 25/05**: 11 blockers across 7 esp

---

## Action plan round 2 → round 3

### Immediate (NO Andrea ratify needed — safe NEW files + doc)

1. Bake 4 NEW bookGeometry files (Vol2 esp1+esp2 + Vol3 esp4+esp5) con:
   - bb-full per Vol2
   - Pin assignments LIBRO V0.8.1 verbatim + note canon clash
   - LED layout VERIFIED da PNG
   - Asset names consistent
2. Update Phase D Vol1 source-diff doc — correct mio Vol2 solver claim WRONG
3. Update deep docs Vol2/Vol3 con codex corrections (R=470 not 220, layout horizontal not vertical, solver logic exists)
4. Verify build + vitest baseline preserve
5. Commit

### Pending Andrea ratify (BLOCKERS critical)

| # | Decision | Impact |
|---|----------|--------|
| 1 | **Vol3 canon: V0.8.1 manuale OR Vol3 final stampato?** | Determina se experiments-vol3.js pins da fixare |
| 2 | Vol1 esp3 R=220 burn threshold solver | demo "luminoso" funzionalità |
| 3 | Vol1 step text "col 9" → "col 7" patches | esp1+esp3 string fixes |
| 4 | Vol2 R 1kΩ esp1 typo libro o gap solver | esp1 materiale lista |
| 5 | Vol2 bb half → full migration | esp1+esp2 (BLOCKER) |
| 6 | led-bridge → led standard Vol1+Vol2 | tutti esp con LED |
| 7 | Wire visibility refactor visibleWires/hiddenConnections schema | tutti esp |

### Round 3 dispatch codex post-bookGeometry-vol2-vol3

Dopo bake 4 bookGeometry: codex round 3 verifica completeness + flag eventuali nuovi gap.
