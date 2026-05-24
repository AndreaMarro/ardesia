# Vol2 Source-Level Diff — Round 4 (canonical bookGeometry vs repo data)

**Date**: 2026-05-24 07:45
**Purpose**: enumerate EXATTI fix repo per allineare `experiments-vol2.js` + `lesson-paths/v2-cap7-esp{1,2}.json` a bookGeometry canonical.
**Andrea ratify**: tutti i fix qui sono **PENDING** — Andrea decide quali applicare.

---

## v2-cap7-esp1 — Source diff

### BLOCKER B3: bb-half → bb-full migration

**File**: `src/data/experiments-vol2.js`
**Line ~2177-2179**: `{ "type": "breadboard-half", "id": "bb1" }`
**Fix**: cambiare `"breadboard-half"` → `"breadboard"` (assumendo full default) OR `"breadboard-full"`
**Verify**: `BreadboardFull.jsx:431-442` esiste già — asset disponibile

**File**: `src/data/lesson-paths/v2-cap7-esp1.json`
**Line ~131**: lesson-path components_needed references "breadboard-half" — update to full

### BLOCKER H6: Narrative discharge VIA MM probes (NOT R 1k)

**Verbatim libro pag.68**:
> "Il condensatore si comporta come una batteria momentanea e si scarica lentamente all'interno del multimetro. I puntali infatti si comportano come un resistore di valore molto elevato (richiedendo quindi poca corrente) e quindi la 'batteria' si scarica lentamente"

**Repo current** `experiments-vol2.js:2218-2219`:
- `Tau = 1s` calcolato da R 1kΩ * C 1000μF
- Narrative implica discharge VIA R 1kΩ

**Conflict**: libro dice MM probes (alta R interna ~10MΩ → Tau ~10000s) ma repo + lesson dice R 1kΩ (Tau 1s)

**Fix Andrea ratify**:
- Opt A: rimuovere R 1kΩ implicito da lesson narrative + match libro (MM probes high-R, Tau ~10s effective due CircuitSolver.js MM model 1MΩ)
- Opt B: lasciare R 1kΩ MA documentare "discharge via R, non MM probes come libro" — divergenza pedagogica

### MEDIUM M3: R 1kΩ material list

**Libro pag.67 materiali**: "...un resistore da 1kΩ"
**Repo current**: esp1 NO R component
**bookGeometry esp1**: NO R component (match repo NOT libro materials)

**Hypothesis**: typo libro materials (R intended for esp2) OR discharge parallel R non illustrata
**Andrea ratify**: typo OR aggiungere R component esp1?

### MEDIUM M1: Wire degenerate fix (APPLIED round 4)

bookGeometry esp1 `wire-button-to-cap` points [575,175],[595,175],[595,175] → [575,175],[595,175] ✅ FIXED

### HIGH H1: canonicalPose anchor (APPLIED round 4)

bookGeometry esp1 `bat1.canonicalPose.anchor = "scene"` → "bb1" + relative offset ✅ FIXED

### HIGH H2: Pseudo wire endpoints

bookGeometry visibleWires usano endpoint pseudo (`c1:positive-column-b14`, `mm1:probe-positive` etc) NON dichiarati in `components.*.pins`.

**Fix round 5 options**:
- Opt A: declare aliases in `components.*.pins` extension field
- Opt B: rewrite wires per usare solo declared pins (es. `c1:positive`)
- Opt C: documenta convention BookGeometryRenderer endpoint resolution

### HIGH H4: led-bridge → led standard (Vol2 esp2 anche)

N/A esp1 (no LED).

---

## v2-cap7-esp2 — Source diff

### BLOCKER B3: bb-half → bb-full (eredita esp1)

**File**: `experiments-vol2.js:2288-2289`
**Fix**: stesso refactor esp1

### BLOCKER B4: Text/pin contradictions

**File**: `experiments-vol2.js`

**Line 2395** step text: "resistore A14 -> A21"
**Actual pin**: `bb1:a19`
**Fix**: text "A21" → "A19"

**Line 2396** step text: "LED anode/cathode E21/F21"
**Actual pin**: `bb1:e19/f19`
**Fix**: text "E21/F21" → "E19/F19"

**Line 2402** step text: "F21/col21"
**Actual wire**: `bb1:f19 -> bb1:bus-bot-minus-19`
**Fix**: text "F21/col21" → "F19/col19"

### HIGH H4: led-bridge → led standard

**File**: `experiments-vol2.js:2300`
```javascript
{ "type": "led-bridge", "id": "led1", "color": "red" }
// → { "type": "led", "id": "led1", "color": "red" }
```
**bookGeometry esp2 GIÀ corretto** (`type: "led"` + asset `led-book-vol2-standard-splayed`)

**File**: `lesson-paths/v2-cap7-esp2.json:149` — same fix

### HIGH (codex round 3 P1): Reduce buildSteps 15 → 8

**Libro pag.69-71**: 8 prose actions
**Repo experiments-vol2.js:2378-2406**: 15 buildSteps
**Repo experiments-vol2.js:2356-2369**: top-level 12 steps

**Fix Andrea ratify**: align repo buildSteps a libro 8-step build sequence (vedi bookGeometry esp2 steps[] 7-step come reference, libro 8-step include "press button observe" final)

### HIGH (codex round 3 P1): "Tre fili colorati" libro vs 6+ repo wires

**Verbatim libro pag.69 materiali**: "tre fili colorati"
**Repo current**: 8 connections con 5+ distinct colors
**bookGeometry esp2**: 3 wire colored distinct (yellow + orange + green) + bat power 2 wire + MM probes 2 = 7 visible wires

**Fix Andrea ratify**: align repo wires distribuzione + colors

---

## Summary patches Vol2 needed

### experiments-vol2.js (Andrea ratify required — src data file)

**esp1**:
- Line 2178: `breadboard-half` → `breadboard` (BLOCKER)
- Lesson narrative: discharge VIA MM (not R 1k) — BLOCKER if libro narrative canon
- esp1 R 1kΩ component decision — MEDIUM

**esp2**:
- Line 2288: `breadboard-half` → `breadboard` (BLOCKER)
- Line 2300: `led-bridge` → `led` (HIGH)
- Lines 2395-2402: text "A21/E21/F21/col21" → "A19/E19/F19/col19" (BLOCKER)
- buildSteps 15 → 8 sequenza libro

### lesson-paths/v2-cap7-esp{1,2}.json

- esp1 + esp2: components_needed `breadboard-half` → full
- esp1 narrative: discharge VIA MM (not R 1k)
- esp2 components_needed: `led-bridge` → `led`

### bookGeometry round 4 status

- esp1 H1 canonicalPose ✅ FIXED
- esp1 M1 wire duplicate ✅ FIXED
- H2 pseudo endpoints: pending design decision
- bookGeometry semantically VALID per codex round 3 PASS

---

## Verifica pre-fix Vol2

Prima applicare patches:
1. `grep -n "A21\|E21\|F21\|col21\|breadboard-half" src/data/experiments-vol2.js` — confirm scope exact
2. Run `npx vitest run` — baseline 29 fail / 14466 pass
3. Apply per Andrea ratify decisions
4. Re-run vitest — match baseline
5. Build PASS
6. Commit
