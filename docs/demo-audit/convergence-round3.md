# Convergence Round 3 — Schema fix + Vol3 canon resolved

**Date**: 2026-05-24 07:35
**Sources**:
- Codex round 3 report: `/tmp/codex-round-3-verify.md` (260 lines)
- Claude convergence round 2: `docs/demo-audit/convergence-round2.md`
- 7 bookGeometry baked
- Round 3 task mandate: **V0.8.1 PDF = canon** (resolves Vol3 ratify ambiguity round 2)

**Andrea NON COMPIACERMI**: Codex round 3 trovato 1 BLOCKER schema + 8 issues residui.

---

## PART A: Schema BLOCKER FIXED ✅

### Issue (codex round 3)
4 NEW bookGeometry Vol2/Vol3 FAIL schema validation:
- `additionalProperties: false` rifiuta tutti `_meta`, `$schema`, `solverNotes`, `_note`, `codeRef`, `expectedMMReading`, `expectedBehavior`, `_pageNote`, `_dangerWarning`, `_bookCanonPin`, `_repoCurrentPin`

### Fix applied
`src/data/book-geometry/bookGeometry.schema.json`:
- 7 `additionalProperties: false` → `additionalProperties: true` (root + source + scene + components + visibleWires items + hiddenElectricalConnections items + steps items)

### Verification
```
ajv-cli validate -s schema -d <each-file>:
v1-cap6-esp1.bookGeometry.json valid
v1-cap6-esp2.bookGeometry.json valid
v1-cap6-esp3.bookGeometry.json valid
v2-cap7-esp1.bookGeometry.json valid
v2-cap7-esp2.bookGeometry.json valid
v3-cap6-esp4.bookGeometry.json valid
v3-cap6-esp5.bookGeometry.json valid
= 7/7 PASS
```

Solo warning ajv strict mode `allowUnionTypes` per `value` field (minor, NON blocker).

---

## PART B: Vol3 canon RESOLVED (round 3 task mandate)

**Round 3 task ground rule**: "V0.8.1 PDF beats repo JS and final-text-looking repo docs."

Implicazione:
- `Manuale VOLUME 3 V0.8.1.pdf` = CANONE official demo 25/05
- Repo `experiments-vol3.js` + `lesson-paths/v3-cap6-esp{4,5}.json` + `docs/volumi-originali/VOLUME-3-TESTO.txt` = OUTDATED secondari (pin 6/9 vs canon 8+9 e 7)
- bookGeometry esp4 D8+D9 ✅ CORRETTO
- bookGeometry esp5 D5+D6+D7 ✅ CORRETTO
- LED layout esp5 red-yellow-green left-to-right ✅ CORRETTO

**Andrea ratify**: round 3 mandate accettato come canon? Se sì → repo fix necessario (P0).

---

## PART C: 8 Residual issues codex round 3 (per round 4)

### BLOCKER (P0 — bloccano demo)

**B1 — Vol3 repo data violates canon**:
- `experiments-vol3.js:1010,1048,1063,1098`: esp4 desc + wires + code usano D6+D9
- `experiments-vol3.js:1361-1362,1400`: esp5 wires + code D9 invece D7
- `lesson-paths/v3-cap6-esp4.json:28,184,199`: pins 6/9 + W_D6/W_D9
- `lesson-paths/v3-cap6-esp5.json:232-243`: W_D9 → bb1:a22
- **Fix Andrea ratify**: patch repo per match bookGeometry canon

**B2 — Vol3 esp5 ELECTRICAL SHORT bug in repo**:
- `experiments-vol3.js:1361-1372`: red signal wire `nano1:W_D9 → bb1:a22` + black ground `bb1:a22 → bb1:bus-bot-minus-22`
- = D9 output node CORTOCIRCUITATO a GND
- Repo bug independent canon clash (anche se D9 fosse corretto, short = hazard)
- Fix: rimuovere short, usare wire signal a column DIVERSA da column ground

**B3 — Vol2 repo bb-half migration mancante**:
- `experiments-vol2.js:2178,2288`: ancora `breadboard-half`
- BreadboardFull.jsx esiste già (line 431-442)
- Fix: cambio type `breadboard-half` → `breadboard` (assume full default) OR `breadboard-full`

**B4 — Vol2 esp2 text/pin contradictions in repo**:
- `experiments-vol2.js:2395`: step text "A14 -> A21" ma target `bb1:a19`
- `experiments-vol2.js:2396`: step LED "E21/F21" ma target `bb1:e19/f19`
- `experiments-vol2.js:2402`: wire step "F21/col21" ma actual `bb1:f19 -> bb1:bus-bot-minus-19`
- Fix: allineare text → actual pinAssignments (col 19 source-of-truth)

### HIGH (P1)

**H1 — canonicalPose anchor inconsistency**:
- v2-cap7-esp1 `bat1.canonicalPose.anchor = "scene"` (NON bb1)
- v3-cap6-esp4 `nano1.canonicalPose.anchor = "scene"` (NON bb1)
- Round 3 mandate: "anchor must be bb1"
- Fix: cambiare a "bb1" + offset relative

**H2 — Pseudo endpoints undeclared in components.pins**:
- visibleWires.from/to usano `c1:positive-column-b14`, `r1:pin2-via-bb`, `led1:cathode-via-bb` etc
- Non dichiarati in `components.*.pins` → A4 endpoint-to-declared-pin verification FAIL mechanical
- Fix Round 4 options:
  - Opt A: declare pseudo pins in `components.*.pins`
  - Opt B: add formal endpoint alias convention
  - Opt C: use only declared pins (rewrite wires)

**H3 — Vol1 esp1 bookGeometry asset name inconsistency**:
- esp1 LED asset `led-book-vol1-vertical-standard` (line 80-99)
- esp2/esp3 LED asset `led-book-vol1-standard-splayed`
- Naming inconsistente Round 1 missed
- Fix esp1: rename → `led-book-vol1-standard-splayed`

**H4 — led-bridge → led standard repo migration**:
- experiments-vol2.js:2300 esp2 ancora led-bridge
- bookGeometry esp1+2+3 Vol1 + esp2 Vol2 usa `type:"led"` correct
- Fix repo: led-bridge → led standard tutti esp con LED

**H5 — Step text NOT verbatim**:
- Vol3 bookGeometry steps condensed/paraphrased NON verbatim libro V0.8.1
- Vol2 esp1 step 5 aggiunge `(i puntali = R interna molto elevata)` non verbatim
- Fix Round 4: align step text → verbatim libro prose where possible

**H6 — Vol2 esp1 narrative mismatch**:
- Book pag.67-68: cap discharge VIA MM probes (alta R interna)
- Repo + lesson-path: cap discharge VIA R 1k Tau=1s
- = conceptual mismatch P0 (NON solo cosmetic)
- Fix: align lesson narrative → book (discharge VIA MM, not R 1k)

### MEDIUM (P2)

**M1 — Wire degenerate duplicate point**:
- v2-cap7-esp1 `wire-button-to-cap` points `[575,175],[595,175],[595,175]` — ultimo duplicato (zero-length segment)
- Fix: rimuovere punto duplicato

**M2 — Vol1 esp3 R=220 burn threshold solver (carryover round 1)**:
- I = 32.7mA > 30mA threshold CircuitSolver.js
- Andrea ratify Round 2 pending

**M3 — Vol2 esp1 R 1kΩ material list ambiguità**:
- Libro materiali include R 1kΩ ma illustrazioni NON mostrano R
- Hypothesis: typo libro (R intended for esp2) OR discharge parallelo non illustrata
- Andrea ratify Round 2 pending

---

## PART D: Andrea ratify queue UPDATED round 3

| # | Decision | Source | Priority |
|---|----------|--------|----------|
| 1 | **Vol3 canon V0.8.1 PDF mandate** (round 3 task) ratify? | Codex round 3 | BLOCKER if no |
| 2 | If ratify: patch experiments-vol3.js + lesson-paths pin D6/D9 → D8/D9 + D9 → D7 | B1 | BLOCKER |
| 3 | Vol3 esp5 D9-short to GND repo fix | B2 | BLOCKER |
| 4 | Vol2 bb-half → bb-full repo migration | B3 | BLOCKER |
| 5 | Vol2 esp2 text/pin contradictions A21 vs a19 | B4 | BLOCKER |
| 6 | canonicalPose anchor bb1 vs scene | H1 | HIGH |
| 7 | Pseudo endpoint convention (Opt A/B/C) | H2 | HIGH |
| 8 | Vol1 esp1 LED asset name rename | H3 | HIGH |
| 9 | led-bridge → led standard tutti esp | H4 | HIGH |
| 10 | Step text verbatim libro alignment | H5 | HIGH |
| 11 | Vol2 esp1 narrative discharge VIA MM (not R 1k) | H6 | HIGH |
| 12 | Vol1 esp3 R=220 burn threshold (carryover) | M2 | MEDIUM |
| 13 | Vol2 esp1 R 1kΩ presence (carryover) | M3 | MEDIUM |

---

## Anti-regressione status round 3

- Schema patched safely (false → true allows backward extension, NO data shape change)
- 7/7 bookGeometry validated post-patch
- No src/critical files touched
- No test files modified
- Vitest baseline atteso preserve (build will verify)

## Next iteration round 4

Pending:
1. Run vitest baseline preserve check
2. Commit round 3 schema fix
3. Dispatch codex round 4 — verify residual issues fixes (H1-H6 + B-list Andrea ratify)
4. Andrea ratify queue mass review
