# Vol1 Convergence Round 1 — Claude + Codex parallel deep analysis

**Date**: 2026-05-24 03:30+
**Sources**:
- Claude Sprint A audit: `docs/demo-audit/v1-cap6-esp{1,2,3}.md`
- Claude deep analysis: `docs/demo-audit/v1-cap6-esp{1,2,3}-deep.md`
- Codex independent deep: `/tmp/codex-vol1-deep-analysis.md` (474 lines)
- Reference PNGs: `reference/vol1/v1-cap6-esp{1,2,3}/page-*.png`
- Repo data: `src/data/experiments-vol1.js`, `lesson-paths/v1-cap6-esp{1,2,3}.json`
- bookGeometry: `src/data/book-geometry/v1-cap6-esp1.bookGeometry.json`
- Component SVG: `Battery9V.jsx`, `Resistor.jsx`, `Led.jsx`, `CircuitSolver.js`

**Andrea NON COMPIACERMI**: Codex ha trovato 5+ errori miei. Admit retroactively.

---

## Discrepanze CLAUDE vs CODEX risolte

### Errori CLAUDE confermati da CODEX (devo correggere)

| # | Mio claim | Codex finding | Verdict | File da fixare |
|---|-----------|----------------|---------|----------------|
| 1 | Battery 9V "VERTICALE sinistra clip-right" | Battery body HORIZONTAL landscape (Battery9V.jsx:1-4 dichiara "HORIZONTAL", BODY_W=70 BODY_H=36). "9V" testo ruotato 90° è decorativo non orientation | **CLAUDE WRONG** | deep docs esp1+esp2+esp3, bookGeometry esp1 asset name |
| 2 | esp3 LED color "rosso" (eredita esp1) | esp3 PNG pag.33 LED VERDE; lesson-path materials dice "LED verde"; experiments-vol1.js dice red (inconsistency interna) | **CLAUDE WRONG** | deep doc esp3, audit Sprint A esp3 |
| 3 | esp2 LED burn rendering "TBD verify" | Led.jsx:253-260 implementa LedBridge burned overlay (black + red X + "BRUCIATO!" text). CircuitSolver.js:1875-1883 sets burned per circuiti senza R. Solver MNA burn threshold 30mA at CircuitSolver.js:1794-1797 | **CLAUDE WRONG (outdated)** | deep doc esp2, audit Sprint A esp2 |
| 4 | esp3 P0 "swap UX TBD" minor | **NUOVO P0 critico**: R=220 @ 9V = 32.7mA > 30mA solver burn threshold → demo "più luminoso" potrebbe diventare "LED bruciato" | **CLAUDE MISSED** | deep doc esp3, audit Sprint A esp3, solver decision needed |
| 5 | esp3 "4 stati R variant 220/470/1k" | Page 33 = 2 illustrazioni (220 + 1k), 470 è textual reference dal precedente esp1 NON illustrazione separata | **CLAUDE WRONG (Sprint A), CORRECTED in deep** | audit Sprint A esp3 only |
| 6 | NON menzionato | **Step text inconsistency**: experiments-vol1.js step text dice "colonna 9" ma pinAssignments + targetPins usano column 7 (e7/f7/a7). Bug pedagogico — docente legge "col 9" ma simulatore mostra LED in col 7 | **CLAUDE MISSED** | experiments-vol1.js step text correction |
| 7 | NON menzionato | **Lesson-path esp2 dice "LED blu"** ma experiments-vol1.js + libro PNG = LED rosso (inconsistency lesson-path vs experiment data) | **CLAUDE MISSED** | lesson-paths/v1-cap6-esp2.json correction |
| 8 | NON menzionato | **Lesson-path esp3 dice "LED verde"** (CORRECT vs libro) ma experiments-vol1.js dice rosso (data inconsistency interna) | **CLAUDE MISSED** | experiments-vol1.js esp3 LED color → verde |
| 9 | NON menzionato | esp3 lesson-path dice "NON dire i valori numerici" ma experiments + step text usano 220/470/1k apertamente (lesson contract violation) | **CLAUDE MISSED** | TBD audit lesson-path constraint vs data |

### Findings CLAUDE confermati da CODEX

| Finding | Status |
|---------|--------|
| esp1 wire visibility: 2 libro vs 4 app (anti-pattern workflow-v2 fase 8) | ✅ CONFIRMED |
| LED splayed/divaricate gambe libro (NON straight) | ✅ CONFIRMED |
| led-bridge variant ≠ libro LED standard | ✅ CONFIRMED tutti 3 esp |
| Wire colors red/black corretti (problema è count, non color) | ✅ CONFIRMED |
| Vol1 = no Arduino (code: null, hexFile: null) | ✅ CONFIRMED |
| esp2 anti-pattern educativo no-R | ✅ CONFIRMED |
| Topology elettrica corretta (solver/intent OK) — il problema è visual rendering | ✅ CONFIRMED |
| esp1 pag.30 = 3 illustrazioni, pag.31 = 2 illustrazioni | ✅ CONFIRMED |
| Resistor 4-band E12 app vs 3-band didattico libro (testo "Giallo Viola Marrone") | ✅ CONFIRMED (P2) |
| bookGeometry v1-cap6-esp1 esiste con 2 visibleWires + 3 hidden — model correct, source code data inconsistent | ✅ CONFIRMED |

### Findings UNVERIFIABLE solo da text/source — richiedono runtime visual diff

- Exact pixel curvature wire libro vs app
- Actual collision rendering app live
- Compattezza preservata su rotation/translation/zoom (PlacementEngine behavior)
- Pixel-perfect proportions battery vs bb scale
- Runtime UX quality burn animation timing/reset

→ Richiedono **Phase D screenshot capture + visual diff vs reference PNG**.

---

## P0/P1/P2 CONSOLIDATED (post-convergence)

### P0 bloccante demo (CRITICI)

| # | Esp | Issue | File/fix |
|---|-----|-------|----------|
| P0-1 | esp1+esp2+esp3 | Wire visibility refactor 4→2 (rail jumpers → hiddenElectricalConnections) | experiments-vol1.js connections + lesson-paths intent.wires |
| P0-2 | esp1+esp2+esp3 | led-bridge → led standard splayed (gambe divaricate libro) | experiments-vol1.js components type field |
| P0-3 | **esp3 NEW codex** | R=220Ω @ 9V = 32.7mA > 30mA solver burn threshold → demo "luminoso" diventa "bruciato" | CircuitSolver.js burn threshold OR R default value OR LED Vf model |
| P0-4 | esp3 | LED color rosso → verde (matcha libro PNG + lesson-path materials) | experiments-vol1.js esp3 led1 color |
| P0-5 | esp1+esp2+esp3 | Step text "colonna 9" inconsistency vs actual col 7 pinAssignments | experiments-vol1.js step text + lesson-paths hint targets |
| P0-6 | esp2 | Lesson-path "LED blu" inconsistency vs data red + libro red | lesson-paths/v1-cap6-esp2.json materials |
| P0-7 | esp1 | bookGeometry asset `battery9v-vol1-vertical-with-clip` → `battery9v-vol1-horizontal-clip-right` | book-geometry/v1-cap6-esp1.bookGeometry.json |
| P0-8 | esp2+esp3 | bookGeometry esp2 + esp3 da CREARE | book-geometry/v1-cap6-esp{2,3}.bookGeometry.json |
| P0-9 | tutti | Reference state-specific PNG crops (subset di full page) richiedono cropper Sprint B fase 3 | tools/elab-reference-cropper (TBD) |

### P1 importante

| # | Esp | Issue |
|---|-----|-------|
| P1-1 | esp1+esp3 | R 4-band E12 (giallo-viola-marrone-oro) vs libro 3-band (Giallo Viola Marrone) didattico |
| P1-2 | tutti | Wire path bezier morbide libro vs app endpoint-only data (path generation logic) |
| P1-3 | esp2 | Burn visual style: app black/X/"BRUCIATO!" vs libro explosion star giallo/rosso |
| P1-4 | esp3 | "NON dire valori numerici" lesson-path constraint vs experiment data espone 220/470/1k |
| P1-5 | esp1+esp2+esp3 | Battery clip esce destra (CONFIRMED via Battery9V.jsx code + libro PNG) — UPDATE deep doc claim verticale |

### P2 rifinitura

| # | Esp | Issue |
|---|-----|-------|
| P2-1 | tutti | Antialiasing wire |
| P2-2 | esp2 | Sound effect "pop" brucia |
| P2-3 | tutti | Pixel-perfect component proportions (richiede runtime visual diff) |
| P2-4 | esp3 | R-swap animation transition (220→1k) |
| P2-5 | tutti | bb rail color match Omaric kit (Andrea ratify SVG vs foto fisica) |

---

## Convergence iteration plan (Andrea mandate "fino totale convergenza")

### Round 1 (questo doc): claude deep + codex deep → diff = 9 corrections needed
### Round 2: applico corrections to deep docs + bookGeometry esp1
### Round 3: codex re-review post-corrections → verifica convergenza
### Round 4: bookGeometry esp2 + esp3 baked (post-convergence canone)
### Round 5: build + verify + visual diff vs reference PNG (Phase D)
### Round 6: codex review visual diff doc → final convergence

---

## Outstanding questions per Andrea ratify

1. **R=220 burn threshold**: solver CircuitSolver.js:1794-1797 dichiara 30mA threshold. R=220Ω demo esp3 = 32.7mA. Decisione:
   - Aumentare threshold a 40mA (più tollerante)?
   - Cambiare default R esp3 da 220 → 270 o 330 (sempre più luminoso ma sotto soglia)?
   - Cambiare Vf LED model (verde Vf ~2.2V → I = 6.8/220 = 30.9mA, ancora sopra)?
   - Andrea decide

2. **3-band vs 4-band Resistor**: libro testo dice "Giallo Viola Marrone" (3 bande). App SVG sempre 4-band. Decisione:
   - Aggiungere variant SVG `resistor-3band-didactic` per Vol1?
   - Aderire E12 standard (4-band sempre)?

3. **Battery body orientation source-of-truth**: Battery9V.jsx dichiara HORIZONTAL. bookGeometry esp1 dichiara `vertical-with-clip` (errato). Decisione:
   - Allineare bookGeometry asset name a Battery9V.jsx (horizontal)
   - Aggiornare deep docs claim verticale → horizontal

4. **LED color esp3**: libro VERDE, lesson-path materials VERDE, experiments-vol1.js ROSSO (inconsistency). Decisione:
   - experiments-vol1.js esp3 led1 color: red → green (matcha libro + lesson)
   - Andrea ratify

5. **Step text col 9 vs col 7**: pinAssignments dicono e7/f7/a7 ma step text + hints dicono "colonna 9". Decisione:
   - Update step text/hints → "colonna 7" (matcha actual pins)
   - OR cambiare pinAssignments → col 9 (cambia bookGeometry + tutti riferimenti)
   - Andrea ratify quale è canone

---

## Next actions

1. Update 3 Claude deep docs Vol1 con corrections (commit message: "audit: convergence round 1 corrections post codex")
2. Update Sprint A audit docs Vol1 (note round 1 supersedes Sprint A claims)
3. Update bookGeometry v1-cap6-esp1.bookGeometry.json asset name horizontal
4. Verify build PASS + vitest match baseline 29/14466
5. Phase B: bake bookGeometry esp2 + esp3
6. Phase C: verify
7. Phase D: visual diff doc post-build
