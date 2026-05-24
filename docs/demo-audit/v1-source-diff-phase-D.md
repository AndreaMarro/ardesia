# Vol1 Source-Level Diff — Phase D (canonical bookGeometry vs repo data)

**Date**: 2026-05-24 07:15
**Purpose**: enumerate EXATTI line:col change necessari per allineare repo data (`experiments-vol1.js` + `lesson-paths/v1-cap6-esp*.json`) a bookGeometry canonical post-convergence round 1.
**Andrea ratify**: tutti i fix qui sono **PENDING** — Andrea decide quali applicare.

---

## v1-cap6-esp1 — Source diff

### Bug 1: Step text "col 9" vs actual pinAssignments "col 7"

**File**: `src/data/experiments-vol1.js`

**pinAssignments verbatim line 34-39** (TRUTH source):
```javascript
pinAssignments: {
  "r1:pin1": "bb1:a2",
  "r1:pin2": "bb1:a7",      // col 7, NOT col 9
  "led1:anode": "bb1:e7",   // col 7
  "led1:cathode": "bb1:f7"  // col 7
}
```

**Step text BUG line 66-71**:
```javascript
steps: [
  "Inserisci il resistore da 470Ω orizzontale nella fila A, colonne 2 e 9 (top section).",  // ❌ "9" → "7"
  "Inserisci il LED rosso a cavallo del gap, colonna 9: anodo in E9 (top), catodo in F9 (bot).",  // ❌ "9" → "7", "E9" → "E7", "F9" → "F7"
  "Collega un filo ROSSO dal polo + della batteria al bus + superiore (col. 1).",  // OK
  "Collega un filo ROSSO dal bus + (col. 2) al foro A2 — alimenta il resistore.",  // OK col 2
  "Collega un filo NERO dal foro F7 al bus − inferiore (col. 7) — catodo LED a GND.",  // OK col 7
  "Collega un filo NERO dal bus − (col. 1) al polo − della batteria — chiude il circuito."  // OK
]
```

**buildStep text BUG line 83-84**:
```javascript
{ "step": 3, "text": "Posiziona il resistore da 470Ω orizzontale fila A, colonne 2 e 9.", ... targetPins: { "r1:pin1": "bb1:a2", "r1:pin2": "bb1:a7" }, ... }  // ❌ text "9" → "7"
{ "step": 4, "text": "Posiziona il LED rosso a cavallo del gap colonna 9: anodo E9, catodo F9.", ... targetPins: { "led1:anode": "bb1:e7", "led1:cathode": "bb1:f7" }, "hint": "Anodo (gamba lunga) in alto E9, catodo (gamba corta) in basso F9." }  // ❌ "colonna 9" → "colonna 7", "E9" → "E7", "F9" → "F7" (text + hint)
```

**Comment line 33 BUG**:
```javascript
// Book Vol1 pag.29: R orizzontale top section a2-a9, LED a cavallo gap col 9
// ❌ "a2-a9" → "a2-a7", "col 9" → "col 7"
```

**FIX target experiments-vol1.js**:
- Line 33 comment: `a2-a9` → `a2-a7`, `col 9` → `col 7`
- Line 66 step: `colonne 2 e 9` → `colonne 2 e 7`
- Line 67 step: `colonna 9` → `colonna 7`, `E9` → `E7`, `F9` → `F7` (3 occurrences)
- Line 83 buildStep 3 text: `colonne 2 e 9` → `colonne 2 e 7`
- Line 84 buildStep 4 text: `colonna 9` → `colonna 7`, `E9` → `E7`, `F9` → `F7`
- Line 84 buildStep 4 hint: `E9` → `E7`, `F9` → `F7` (2 occurrences)

### Bug 2: led-bridge variant vs libro splayed LED

**File**: `src/data/experiments-vol1.js`
**Line 31**:
```javascript
{ "type": "led-bridge", "id": "led1", "color": "red" }
// → { "type": "led", "id": "led1", "color": "red" }
```

**Implication**: cambia render Led.jsx switch da LedBridge a Led standard. Pin coords cambieranno (LED standard = pins separated x). Solver netlist same.

**Risk**: pin coords differenti potrebbero richiedere update pinAssignments (e7/f7 → e6/f6 OR similar). Verify Led.jsx pin map standard vs LedBridge.

**Andrea ratify**: do NOT apply until pin coord match verified.

### Bug 3: bookGeometry asset name (FIXED commit f0999620)

bookGeometry esp1 already corrected: `battery9v-vol1-horizontal-clip-right`.

### Bug 4: Wire visibility 4 → 2 visible (workflow-v2 fase 8)

**File**: `src/data/experiments-vol1.js` line 41-46:
```javascript
connections: [
  { "from": "bat1:positive", "to": "bb1:bus-top-plus-1", "color": "red" },     // VISIBLE libro
  { "from": "bb1:bus-top-plus-2", "to": "bb1:a2", "color": "red" },            // ❌ HIDDEN libro (rail jumper)
  { "from": "bb1:f7", "to": "bb1:bus-bot-minus-7", "color": "black" },         // ❌ HIDDEN libro (rail jumper)
  { "from": "bb1:bus-bot-minus-1", "to": "bat1:negative", "color": "black" }   // VISIBLE libro
]
```

**Refactor 2 options**:

**Option A** — split `connections` field into `visibleWires` + `hiddenConnections` (schema breaking, requires solver + UI changes):
```javascript
visibleWires: [
  { "from": "bat1:positive", "to": "bb1:bus-top-plus-1", "color": "red" },
  { "from": "bb1:bus-bot-minus-1", "to": "bat1:negative", "color": "black" }
],
hiddenConnections: [
  { "from": "bb1:bus-top-plus-2", "to": "bb1:a2", "color": "red" },
  { "from": "bb1:f7", "to": "bb1:bus-bot-minus-7", "color": "black" }
]
```

**Option B** — keep `connections` schema, add `visible: false` flag (backward-compatible):
```javascript
connections: [
  { "from": "bat1:positive", "to": "bb1:bus-top-plus-1", "color": "red", "visible": true },
  { "from": "bb1:bus-top-plus-2", "to": "bb1:a2", "color": "red", "visible": false },
  { "from": "bb1:f7", "to": "bb1:bus-bot-minus-7", "color": "black", "visible": false },
  { "from": "bb1:bus-bot-minus-1", "to": "bat1:negative", "color": "black", "visible": true }
]
```

WireRenderer (canvas) check `visible !== false` per disegnare.

**Andrea ratify**: Option A più pulito MA più invasivo. Option B compatible NON refactor.

---

## v1-cap6-esp2 — Source diff

### Bug 1: Lesson-path materials "LED blu" inconsistency

**File**: `src/data/lesson-paths/v1-cap6-esp2.json`
**Field**: `components_needed` array → contiene "LED blu" (codex round 1 finding)
**Verbatim libro**: pag.32 mostra LED rosso (anti-pattern brucia)
**experiments-vol1.js esp2**: led1 color="red"

**Fix lesson-paths**: `LED blu` → `LED rosso` per coerenza

### Bug 2: led-bridge → led standard (eredita esp1)

Stesso refactor esp1.

### Bug 3: Wire visibility 4 → 2 (eredita esp1)

Stesso refactor esp1.

### Bug 4: Step text col 9 inconsistency (verify if applicable esp2)

`src/data/experiments-vol1.js` esp2 step text needs grep verification.

---

## v1-cap6-esp3 — Source diff

### Bug 1: LED color rosso → verde

**File**: `src/data/experiments-vol1.js` esp3 line ~193
**Current**: `{ "type": "led-bridge", "id": "led1", "color": "red" }`
**Fix**: `{ "type": "led", "id": "led1", "color": "green" }` (matcha libro PNG + lesson-path materials)

### Bug 2: R=220Ω default burn threshold (CODEX NEW P0)

**File**: `src/components/simulator/engine/CircuitSolver.js`
**Lines**: 1794-1797 + 1860-1868
**Issue**: I = (9V - 1.8V) / 220Ω = 32.7mA > 30mA threshold → LED burns

**Fix options**:
- **Opt A**: raise threshold 30 → 40mA (più permissivo, accetta R=220 demo)
- **Opt B**: change default R esp3 220 → 270 (sotto soglia: I = 7.2/270 = 26.7mA, safe)
- **Opt C**: change LED Vf model verde 1.8V → 2.0V (I = 7/220 = 31.8mA, ancora sopra)
- **Opt D**: documentare "transitorio safe" in solver (allow burst overcurrent <100ms)

**Andrea ratify**: critico per demo. Senza fix esp3 dimostra "LED bruciato" invece "LED più luminoso".

### Bug 3: Step text col 9 inconsistency

**File**: `src/data/experiments-vol1.js`
**Lines 227-228**:
```javascript
"Inserisci il resistore da 220Ω orizzontale nella fila A, colonne 2 e 9.",
"Inserisci il LED rosso a cavallo del gap, colonna 9: anodo E9, catodo F9.",
```
**Fix**: `9` → `7`, `E9` → `E7`, `F9` → `F7` (+ LED "rosso" → "verde" per bug 1)

**Line 247 buildStep 4**:
```javascript
{ "step": 4, "text": "Posiziona il LED rosso a cavallo del gap col 7: anodo E7, catodo F7.", ... targetPins: { "led1:anode": "bb1:e7", "led1:cathode": "bb1:f7" }, "hint": "Anodo (lunga) in alto E9, catodo (corta) in basso F9." }
```
**Fix hint**: `E9` → `E7`, `F9` → `F7` (text OK col 7, hint partial)

### Bug 4: Lesson-path "NON dire valori numerici" vs data espone 220/470/1k

**File**: `src/data/lesson-paths/v1-cap6-esp3.json` line ~105-107
**Issue**: lesson contract dichiara "NON dire valori numerici" ma title + observe + steps tutti citano 220/470/1k apertamente.

**Decisione**:
- **Opt A**: rimuovere "NON dire valori numerici" da lesson-path (allinea data: lascia citare)
- **Opt B**: rimuovere valori numerici da steps + observe (allinea contract)

### Bug 5: 4 visible wires (eredita esp1)

### Bug 6: led-bridge → led standard (eredita esp1)

---

## Summary patches needed

### experiments-vol1.js fixes (string-only, NO behavior change)
- esp1: 6 col 9 → col 7 substitutions (comment + 2 steps + 2 buildSteps + hint)
- esp3: 4 col 9 → col 7 substitutions + hint update

### experiments-vol1.js fixes (behavior change, ratify needed)
- esp1+esp2+esp3: led-bridge → led standard (verify pin coords)
- esp3: LED color red → green
- esp3: R default 220 → 270 (if Opt B for burn threshold)

### lesson-paths fixes
- v1-cap6-esp2.json: materials "LED blu" → "LED rosso"
- v1-cap6-esp3.json: contract "NON dire valori" vs data citanon valori — decide

### CircuitSolver.js fix (CRITICAL, ratify)
- Burn threshold 30mA decision per esp3 demo functionality

### Lesson-paths.json schema (refactor optional)
- Wire visibility separation visibleWires vs hiddenConnections (Opt A breaking OR Opt B `visible` flag)

---

## Verifica pre-fix

Prima applicare patches:
1. Run `grep -rn "col\. 9\|colonna 9\|E9\|F9" src/data/experiments-vol1.js | grep -E "(esp1|esp2|esp3)"` — conferma scope esatto Vol1 cap6 demo
2. Run `npx vitest run tests/unit/services tests/integration` — baseline 29 fail / 14466 pass
3. Apply patches per Andrea ratify decisions
4. Re-run vitest — match baseline
5. Build PASS
6. Commit

**Anti-regressione**: prima di toccare experiments-vol1.js, snapshot test count. Dopo, verify exact match.

---

## Convergence verifica iter

Codex round 2 dispatched (Vol2 + Vol3 deep + Vol1 verify post-corrections). Output atteso `/tmp/codex-vol2-vol3-deep-analysis.md`.

Una volta codex round 2 ritorna:
1. Diff vs questo Phase D doc → eventuali nuovi findings codex
2. Update questo doc con correzioni round 2
3. Andrea ratify queue cumulativa
4. Apply ratified patches in single atomic commit
