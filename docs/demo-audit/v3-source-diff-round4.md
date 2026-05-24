# Vol3 Source-Level Diff — Round 4 (canonical bookGeometry V0.8.1 vs repo data)

**Date**: 2026-05-24 07:45
**Canon mandate round 3**: V0.8.1 PDF beats repo + final-text docs
**Andrea ratify**: tutti i fix qui sono **PENDING** — Andrea decide quali applicare.

---

## v3-cap6-esp4 — Source diff

### BLOCKER B1: Pin canon clash D6/D9 → D8/D9

**Files**:
- `src/data/experiments-vol3.js:1010-1011`: desc + description usano "pin 6 e pin 9"
- `src/data/experiments-vol3.js:1048`: connection `nano1:W_D6 → ...`
- `src/data/experiments-vol3.js:1063`: connection second `nano1:W_D9 → ...`
- `src/data/experiments-vol3.js:1098`: code `const int LED_BLU = 6; const int LED_ROSSO = 9;`
- `src/data/lesson-paths/v3-cap6-esp4.json:28`: components_needed pin 6 + 9
- `src/data/lesson-paths/v3-cap6-esp4.json:184,199`: intent.wires W_D6 + W_D9

**Canon V0.8.1 verbatim pag.37**:
> "LED 1 → pin 8, LED 2 → pin 9"

**Fix Andrea ratify**:
- experiments-vol3.js esp4: D6 → D8 (LED 1)
- code: `LED_BLU = 6` → `LED_BLU = 8` (OR renamed `LED_1 = 8` per neutralità)
- lesson-paths: same
- desc/description: "pin 8 e pin 9"

### HIGH (codex round 3 P1): Resistor value

**Codex round 2 confirmed**: repo R = 470Ω (bands yellow-violet-brown verified)
**Mio claim originale 220Ω**: ERRATO
**bookGeometry esp4**: R = 470Ω ✅ MATCH repo (codex confirm)

**Status**: no fix needed — bookGeometry + repo entrambi 470

### HIGH H1: canonicalPose anchor (APPLIED round 4)

bookGeometry esp4 `nano1.canonicalPose.anchor = "scene"` → "bb1" + relative offset ✅ FIXED

### HIGH H2: Pseudo endpoints `r1:pin2-via-bb`, `led1:cathode-via-bb`

Stesso problema esp1 Vol2 — design decision Round 5 needed.

### HIGH (codex round 3 P1): Step text NOT verbatim libro

bookGeometry steps condensed paraphrase vs libro prose/code verbatim:
```
LIBRO V0.8.1 pag.37 code snippet:
void setup() {
  pinMode(8, OUTPUT);
  pinMode(9, OUTPUT);
}
void loop() {
  digitalWrite(8, HIGH);
  digitalWrite(9, LOW);
  delay(...);
  digitalWrite(8, LOW);
  digitalWrite(9, HIGH);
  delay(...);
}
```

**Fix Round 5**: aggiungere verbatim libro code text in bookGeometry `codeRef.verbatimLibro` field (già presente nel mio doc — verify accuracy)

---

## v3-cap6-esp5 — Source diff

### BLOCKER B1: Pin canon clash D9 → D7 (rosso)

**Files**:
- `src/data/experiments-vol3.js:1283,1284`: desc + description usano "pin 5, 6 e 9"
- `src/data/experiments-vol3.js:1361-1362`: connection `nano1:W_D9 → bb1:a22`
- `src/data/experiments-vol3.js:1400`: code `const int LED_ROSSO = 9;`
- `src/data/experiments-vol3.js:1616`: observe text "pin 5, 6, 9"
- `src/data/lesson-paths/v3-cap6-esp5.json:202-233`: intent.wires W_D9 references

**Canon V0.8.1 verbatim pag.38**:
> "Verde → pin 5, Giallo → pin 6, Rosso → pin 7"

**Fix Andrea ratify**:
- experiments-vol3.js esp5: D9 → D7 (LED rosso)
- code: `LED_ROSSO = 9` → `LED_ROSSO = 7`
- desc/description: "pin 5, 6, 7"
- observe: "pin 5, 6, 7"
- lesson-paths same

### BLOCKER B2: D9-short to GND repo bug INDEPENDENT canon

**File**: `experiments-vol3.js:1361-1372`
```javascript
// Wire 1: signal D9 → bb1:a22
{ "from": "nano1:W_D9", "to": "bb1:a22", "color": "orange" }
// Wire 2: ground bb1:a22 → bus-bot-minus-22
{ "from": "bb1:a22", "to": "bb1:bus-bot-minus-22", "color": "black" }
```

= **D9 output node SHORTED to GND via column a22**

**Hazard**: ANCHE se D9 fosse canon, questo è elettricamente sbagliato. Output digitale Arduino driven HIGH = 5V cortocircuito a 0V → potenziale danno Arduino.

**Fix Andrea ratify** (independent canon):
- Wire signal: D9 → DIFFERENT column da column ground
- Es. `nano1:W_D9 → bb1:e22` + ground `bb1:f22 → bb1:bus-bot-minus-22` (e/f column DIFFERENT)
- Solver MNA probably warns but UI rendering doesn't catch geometric hazard

### BLOCKER (codex round 3): LED layout REVERSED

**File**: `experiments-vol3.js:1413-1436` (layout block)
**Repo current**: green left → yellow middle → red right
**Canon V0.8.1 PNG pag.38**: red left → yellow middle → green right
**bookGeometry esp5**: red-yellow-green canon ✅ MATCH libro

**Fix Andrea ratify**:
- experiments-vol3.js layout block: swap LED positions to red-yellow-green left-to-right
- bb pin assignments: reverse mapping (red=column-smallest, green=column-largest)

### HIGH H1: canonicalPose anchor (APPLIED round 4)

bookGeometry esp5 `nano1` added canonicalPose `{anchor: "bb1", x: -350, y: 0}` ✅ FIXED

### HIGH (codex round 3 P1): Step text + code verbatim

**Libro V0.8.1 pag.38 code snippet** (visualizzato in app screenshot riquadro):
```cpp
void setup() {
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);
}

void loop() {
  digitalWrite(5, HIGH);
  delay(3000);
  digitalWrite(5, LOW);
  digitalWrite(6, HIGH);
  delay(1000);
  digitalWrite(6, LOW);
  digitalWrite(7, HIGH);
  delay(3000);
  digitalWrite(7, LOW);
}
```

**bookGeometry esp5 codeRef.verbatimLibro**: GIÀ present + verbatim ✅

**Repo experiments-vol3.js:1400 code**: differisce (LED_ROSSO=9 ≠ 7). Fix B1.

---

## Vol3 NEW issues found round 4

### HIGH: bookRef mismatch V0.8.1 vs Vol3 final stampato

`experiments-vol3.js:1009`: `"bookRef": "Vol. 3 pag. 54 - ESERCIZIO 6.4"` — riferimento "pag.54" è VOLUME 3 FINALE STAMPATO
`experiments-vol3.js:1282`: `"bookRef": "Vol. 3 pag. 57 - ESERCIZIO 6.5"` — same

**PDF V0.8.1 manuale fisico** (file disponibile): pag.37 + pag.38

**Hypothesis Round 4**:
- Vol3 final stampato = file V1.0+ (NON disponibile come PDF in volumi-pdf/)
- V0.8.1 = bozza Davide pre-stampa
- Repo bookRef + experiments seguono Vol3 final stampato che ha:
  - pag.54 con ESERCIZIO 6.4 (pin 6+9?)
  - pag.57 con ESERCIZIO 6.5 (pin 5+6+9?)

**Andrea verify**:
- Esiste Vol3 final stampato come PDF accessibile?
- Round 3 task mandate "V0.8.1 PDF wins" — applies ANCHE se Vol3 final esiste differente?
- OR Vol3 final = canon REALE demo 25/05?

---

## Summary patches Vol3 needed (Andrea ratify ALL)

### experiments-vol3.js (BLOCKER scope)

**esp4** (assume V0.8.1 canon mandate round 3):
- desc/description: "pin 8 e pin 9"
- connection W_D6 → W_D8
- code `LED_BLU = 8`
- bookRef pag.54 → pag.37 OR keep + add note "V0.8.1 PDF reference"

**esp5** (assume V0.8.1 canon):
- desc/description/observe: "pin 5, 6, 7"
- connection W_D9 → W_D7
- code `LED_ROSSO = 7`
- layout block: swap to red-yellow-green left-to-right
- pin assignments LED rosso column TBD (separate from short bug)
- D9-short to GND fix (independent canon) — separate wire columns
- bookRef pag.57 → pag.38 OR keep + note

### lesson-paths/v3-cap6-esp{4,5}.json

- esp4: components_needed pins + intent.wires W_D8 references
- esp5: components_needed + intent.wires W_D7 references

### bookGeometry round 4 status

- esp4 H1 canonicalPose ✅ FIXED
- esp5 H1 canonicalPose ✅ FIXED
- Both H2 pseudo endpoints: pending Round 5
- Codex round 3 PASS canon V0.8.1 ✅

---

## ratifyDecision Andrea — Vol3 canon source

**CRITICAL** before applying any Vol3 fix:

1. **Esiste Vol3 final stampato come PDF accessibile?**
2. Se SÌ: usare quello come canon (repo current = match)
3. Se NO o nessun accesso: usare V0.8.1 PDF (codex round 3 mandate) — implica patch B1+B2+layout REVERSED Vol3

**Andrea risposta determina**: ~10 patch files vs ~0 patch files Vol3.
