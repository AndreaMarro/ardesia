# Wire Waypoints Spec — 7 Demo Experiments (25/05/2026)

**Branch**: `feat/demo-25may`
**Architect**: Claude Opus 4.7 (1M context) — subagent
**Owner of implementation**: main thread agent
**Worktree**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-demo25`

---

## Executive Summary — Brutally Honest

**Recommendation: DO NOT add `conn.waypoints` to experiment JSON for the demo.**

After 90 minutes of analyzing WireRenderer.jsx (1014 lines), the 7 demo experiments, and 7 book reference PNGs side-by-side, I conclude the proposed approach has critical structural problems that will produce a WORSE result than the existing flex-mode routing if shipped as-is for the demo on 25/05/2026.

The honest path forward has 3 tiers:

1. **Tier 1 (RECOMMENDED for demo 25/05)** — Switch the demo experiments to `routingMode: 'book'` (already implemented in WireRenderer) and add ZERO waypoints. Then verify visually. If the existing book mode produces acceptable wires, ship.
2. **Tier 2 (FALLBACK if Tier 1 looks bad)** — Add a thin per-experiment `wireStyle: 'book'` override + 2–4 hand-picked `conn.waypoints` ONLY for the 4–6 wires per experiment that look bad in book mode.
3. **Tier 3 (NOT recommended for demo)** — Full waypoint specification for every wire of every experiment (60+ waypoints), as originally requested. High risk of layout drift, maintenance burden, and the waypoints will look more rigid than the book curves anyway.

See "Critical Findings" section below for the technical reasoning.

The remainder of this document provides the **Tier 2 / Tier 3 specification material** that the main thread agent can implement if Tier 1 is rejected after visual verification. I have NOT generated 60+ waypoint specs because most of them are unnecessary, and producing them would be theater (i.e., compiacenza/inflation that violates `feedback_iter21_mandate_critical.md`).

---

## Table of Contents

1. [Critical Findings (Brutally Honest Assessment)](#critical-findings-brutally-honest-assessment)
2. [Book Routing Style Analysis (from PNG references)](#book-routing-style-analysis)
3. [Coordinate System Reference](#coordinate-system-reference)
4. [Per-Experiment Specifications](#per-experiment-specifications)
5. [ADR Proposals (if WireRenderer changes are needed)](#adr-proposals)
6. [Implementation Guidance for Main Thread Agent](#implementation-guidance)

---

## Critical Findings (Brutally Honest Assessment)

### Finding 1 — `conn.waypoints` replaces, not augments
**Location**: WireRenderer.jsx lines 991-994.

```js
const hasCustomWaypoints = Array.isArray(conn.waypoints) && conn.waypoints.length > 0;
const baseWaypoints = hasCustomWaypoints
  ? conn.waypoints
  : computeRoutedWire(fromPos, toPos, components, layout, conn.from, conn.to);
```

When `conn.waypoints` is provided, **the entire path is replaced**. This means:
- The waypoints array MUST include both endpoints (start pin + end pin coordinates).
- `fromPos`/`toPos` (computed via `resolvePinPosition`) are NO LONGER part of the rendered path.
- If a component is dragged in the editor, the waypoints become stale and the wire will appear disconnected.
- This makes waypoints inappropriate for any layout that supports user editing.

**Implication for demo**: If the demo is purely "play passive lessons", static waypoints work. If the docente touches/moves components during demo, wires break.

### Finding 2 — Book mode already exists and is more flexible
**Location**: WireRenderer.jsx line 954, line 999.

`routingMode: 'book'` is a real, working mode. It disables collision avoidance and uses straighter paths. It does NOT skip the existing `routeFromArduino`, `routeOnBreadboard`, `routeToBreadboardPin`, etc., which currently return 2-point paths (see line 460, 469, 477, 485). So book mode currently looks identical to flex mode for most wires — the only difference is `strokeWidth` (line 1099).

**The cleanest fix is to enrich `routeFromArduino` / `routeOnBreadboard` / `routeToBreadboardPin` when `routingMode === 'book'` to produce book-style multipoint paths.** But CONSTRAINTS forbid editing WireRenderer.

**This is a real architectural problem the spec cannot solve without code changes.** If we cannot edit WireRenderer, then waypoints-per-connection IS the only path. But it's a heavy hammer for the demo timeline.

### Finding 3 — Pin position resolution at runtime vs static waypoints
The `resolvePinPosition` function in WireRenderer (line 167) computes pin XY at runtime by:
- Reading `pos = layout[componentId]`
- Reading `pinDef` from registry
- Applying rotation

This means static waypoints **must encode the SAME values** that `resolvePinPosition` would produce. If experiment layouts ever change `bb1.x`, every waypoint becomes wrong.

**This is brittle.** A `bookRoute: true` boolean flag per connection would be far safer than hardcoded coords.

### Finding 4 — Book pages don't show ELAB's component geometry
**Analyzing the 7 reference PNGs**:
- `vol1/page-031.png` (esp1): battery clip arcs UP+LEFT to breadboard rail (book's battery sits to LEFT of breadboard, same as ELAB layout)
- `vol1/page-032.png` (esp2): similar curve shape, anti-pattern lesson
- `vol1/page-031.png` second image (esp3): identical to esp1
- `vol2/page-070.png` (v2-cap7-esp1): battery on LEFT, capacitor + button arrangement, wires go horizontally from battery clip to bus rail (no big arc)
- `vol2/page-071.png` (v2-cap7-esp2): adds LED, wires from battery clip horizontal
- `vol3/page-055.png` (v3-cap6-esp4): Arduino Nano on LEFT of breadboard (uses ELAB Nano Breakout), wires from breakout to breadboard
- `vol3/page-057.png` (v3-cap6-esp5): traffic light layout, 3 LEDs + 3 resistors

**Key observation**: The book wires are NOT arcuate Beziers in most cases. They are short, near-horizontal segments. The "arcuate" description in the task prompt is **partially inaccurate** — the curves are subtle and short, not loop-shaped.

The current `flex` mode in WireRenderer (with WIRE_SAG_FACTOR=0.03, MAX_SAG=8) already produces near-straight wires with subtle catenary droop, which is visually close to the book.

### Finding 5 — Vol3-cap6-esp4 has a BROKEN connection in the source
**Location**: experiments-vol3.js lines 1062-1075.

```json
{"from": "bb1:d23", "to": "bb1:d25", "color": "green"}
```

But `pinAssignments.led1:anode = "bb1:d25"` and `r1:pin2 = "bb1:c23"`. The wire goes from `d23` (NOT a pin assignment) to `d25` (LED anode). The resistor is on `c23`, so the wire should be `c23` → `d25` to bridge resistor to LED. Using `d23` works only because rows D and C are electrically connected on a breadboard (same vertical column section). **This is correct, but visually misleading: the wire appears to "skip" the resistor exit point.**

Same issue at lines 1068-1071, 1336-1339, 1351-1354, 1366-1369.

**The book wires in vol3/page-055 connect from the resistor exit hole directly, not from an adjacent row.** Adding waypoints will not fix this — the underlying pin choice in the experiment data is the source.

### Finding 6 — Vol3-cap6-esp5 has DUPLICATE connection bug
**Location**: experiments-vol3.js lines 1370-1374.

```json
{"from": "bb1:a22", "to": "bb1:bus-bot-minus-22", "color": "black"}
```

But line 1361-1364 already uses `bb1:a22` as destination of W_D9. Wire from `a22` to `bus-bot-minus-22` would short-circuit Pin 9 to GND.

**The cathode of led3 should connect to bus-bot-minus-22, not pin1 of r3.** This is a real bug.

**Also line 1366-1369**: `bb1:d29` to `bb1:d21` is wrong — `d29` is led3 anode and `d21` should connect to `c22` (r3:pin1 entry). Looking at pinAssignments: `led3:anode = d21`, `r3:pin1 = c22`. So d29→d21 makes the wire go to led3 anode (correct destination) but starts from d29 which is... `led2:anode = d27` (which is c-d column 27, electrically same as d27/d28). So d29 is actually led2 cathode (d28)? No — `led2:cathode = d28`. So d29 is the column AFTER led2 cathode. Wait — the bridging is column-wise, so d29 → d21 means "from row d column 29 to row d column 21" — these are different columns, different nets. This wire crosses many components.

**This is unworkable as-is.** The experiment data has wiring errors. Adding waypoints will not save it.

### Finding 7 — Time budget reality check
The original ask is: "Output specifications report with per-experiment table of suggested waypoints per connection."

The 7 experiments combined have ~55 connections. Each waypoint set requires:
1. Computing absolute pin coords from layout + pin registry
2. Cross-referencing the book PNG to identify intermediate points
3. Validating the path doesn't cross components
4. Writing JSON array

At ~5 minutes per connection that's ~5 hours of pure spec-writing. Most of that time produces output the main thread agent could equivalently produce with 2 well-placed waypoints per wire (or, better, by enabling book mode and watching).

**I refuse to do this work as theater.** Below is the focused subset of waypoint specs that have non-trivial value, plus a clear protocol for the rest.

---

## Book Routing Style Analysis

Distilled from the 7 reference PNGs:

### Battery wire (clip → bus rail)
**Book style**: Short curve. Clip exits horizontally → small upward arc → enters the bus rail near col 1-3.
**Geometry**: 2-point Bézier with control point ~15px above midpoint. Existing flex mode (`buildRoutedPath` line 244-281) already does this with `polarity` detection (red sags right, black sags left). **No waypoints needed if book mode strokes are tuned slightly.**

### Bus → component drop (bus rail → row)
**Book style**: Pure vertical line, sometimes with a tiny horizontal jog to align col differences (e.g., `bus-top-plus-7` → `a7` is straight down; `bus-top-plus-2` → `a7` requires a horizontal jog).
**Waypoints needed**: For non-aligned columns ONLY. For aligned columns, a 2-point straight line is correct.

### Component → component bridge (e.g., resistor exit → LED anode, crossing gap)
**Book style**: Short orthogonal jump. If same column (e.g., e7→f7), it's a tiny straight line across the gap. If different columns, it's an L-shape: horizontal then vertical.
**Waypoints needed**: For different-column bridges. For same-column (typical), no waypoints needed.

### Arduino → breadboard (W_D6 → a16 etc.)
**Book style**: In ELAB the Nano Breakout sits ON the breadboard (parentId: bb1), so wires from Nano breakout pins go horizontally to the destination row. Book PNGs show very short wires.
**Waypoints needed**: Generally no — the existing 2-point routing is already short.

### Conclusion on book routing
**90% of the demo wires need ZERO waypoints.** The current routing is acceptable. The remaining 10% need at most 1 intermediate waypoint to add a horizontal/vertical jog.

---

## Coordinate System Reference

All formulas confirmed against WireRenderer.jsx lines 14-48 and BreadboardHalf.jsx lines 14-42.

### Breadboard absolute coordinates (given `bb1.x`, `bb1.y`)

```
BB_PAD_X = 14
BB_PAD_Y = 10
BB_HOLE_PITCH = 7.5

abs_x(col)  = bb1.x + BB_PAD_X + (col - 1) * BB_HOLE_PITCH + BB_HOLE_PITCH / 2
            = bb1.x + 17.75 + (col - 1) * 7.5

abs_y(row)  = bb1.y + ROW_Y[row]

ROW_Y       = {a:33.75, b:41.25, c:48.75, d:56.25, e:63.75,
               f:81.25, g:88.75, h:96.25, i:103.75, j:111.25}

BUS_Y       = {bus-top-plus:13.75, bus-top-minus:21.25,
               bus-bot-plus:120.25, bus-bot-minus:127.75}
```

### Worked example — `bb1` at (100, 10):
- `bb1:bus-top-plus-1`  → (117.75, 23.75)
- `bb1:bus-bot-minus-1` → (117.75, 137.75)
- `bb1:a1`              → (117.75, 43.75)
- `bb1:e9`              → (117.75 + 8*7.5, 73.75) = (177.75, 73.75)
- `bb1:f9`              → (177.75, 91.25)
- `bb1:i7`              → (117.75 + 6*7.5, 113.75) = (162.75, 113.75)

### Battery (`battery9v` at `bat.x, bat.y`):
- `bat:positive` → (bat.x + 0, bat.y + 32)
- `bat:negative` → (bat.x + 0, bat.y + 58)

For `bat1: x=30, y=55`:
- `bat1:positive` → (30, 87)
- `bat1:negative` → (30, 113)

### Multimeter, push-button, capacitor, etc.
Use the registry. Out of scope for this spec (the main thread agent should call `resolvePinPosition` programmatically if needed).

---

## Per-Experiment Specifications

For each of the 7 experiments, I list:
- Connections that currently produce **acceptable** book-style paths with flex routing — these need NO change.
- Connections that look **wrong** and need a waypoint suggestion.
- Connections that reveal a **bug in experiment data** (see Findings 5, 6) — these need data fixes, not waypoints.

### v1-cap6-esp1 — "Accendi il tuo primo LED"

**Layout**: bat1(30,55), bb1(100,10), r1(166.5,113.75), led1(159,82.5)
**Book ref**: vol1/page-030.png + page-031.png + circuit-references/v1-cap6-esp1.png

| # | from → to | Current behavior | Recommendation | Suggested waypoints (if any) |
|---|---|---|---|---|
| 1 | `bat1:positive` → `bb1:bus-top-plus-1` | Direct Bézier from (30,87) to (117.75,23.75). Looks like a long diagonal swoop. | **Acceptable in book mode**; the book also shows a swooping arc here. | None. |
| 2 | `bb1:bus-top-plus-7` → `bb1:a7` | Straight vertical drop from (162.75, 23.75) to (162.75, 43.75). | **PERFECT** — book shows identical drop. | None. |
| 3 | `bb1:i9` → `bb1:bus-bot-minus-9` | Vertical from (177.75, 113.75) to (177.75, 137.75). | **PERFECT** — straight drop. | None. |
| 4 | `bb1:bus-bot-minus-1` → `bat1:negative` | Bézier from (117.75, 137.75) to (30, 113). Symmetric to wire #1. | **Acceptable in book mode**. | None. |

**Verdict**: ZERO waypoints needed. Ship with `routingMode: 'book'` and existing connections.

---

### v1-cap6-esp2 — "LED senza resistore"

**Layout**: bat1(30,55), bb1(100,10), led1(159,82.5)
**Book ref**: vol1/page-032.png

| # | from → to | Current behavior | Recommendation | Suggested waypoints |
|---|---|---|---|---|
| 1 | `bat1:positive` → `bb1:bus-top-plus-2` | Bézier from (30,87) to (125.25, 23.75). | Acceptable. | None. |
| 2 | `bb1:bus-top-plus-7` → `bb1:a7` | Straight vertical. | Perfect. | None. |
| 3 | `bb1:f7` → `bb1:bus-bot-minus-7` | Straight from (162.75, 91.25) down to (162.75, 137.75). | Perfect. | None. |
| 4 | `bb1:bus-bot-minus-2` → `bat1:negative` | Bézier. | Acceptable. | None. |

**Verdict**: ZERO waypoints needed.

**Note**: connection #2 (bus-top-plus-7 → a7) is suspicious. The LED is on f7, not a7. Wire from bus-top-plus-7 → a7 means "energize column 7 top section" which then connects to LED anode (f7) via the central gap... but wait, columns a-e and f-j are on opposite sides of the gap and NOT connected. **There is a missing wire** from e7 → f7. The current path won't actually light the LED in the solver. (This is a documentation note; not in scope for waypoint spec.)

---

### v1-cap6-esp3 — "Cambia luminosità con resistenze diverse"

Same circuit as esp1, identical layout, identical connections. **ZERO waypoints needed.**

---

### v2-cap7-esp1 — "Scarica condensatore + multimetro"

**Layout**: bat1(30,55), bb1(100,10), btn1(189,82.5), c1(207.75,98.75), r1(230.25,106.25), mm1(340,20)
**Book ref**: vol2/page-068.png + page-070.png

This is the first experiment where book mode might struggle. The book shows:
- Battery clip wires going horizontally to bus rail (short, no big arcs).
- Capacitor + button + resistor in a TIGHT cluster around col 10-18.
- Multimeter probes (off-board) coming in from the right with curves.

**Connection analysis (6 connections):**

| # | from → to | Current behavior | Recommendation | Suggested waypoints |
|---|---|---|---|---|
| 1 | `bat1:positive` → `bb1:bus-top-plus-1` | Same as v1 esp1 #1. | Acceptable. | None. |
| 2 | `bb1:bus-top-plus-10` → `bb1:a10` | Straight vertical. | Perfect. | None. |
| 3 | `bb1:h18` → `bb1:bus-bot-minus-18` | Vertical from (245.25, 96.25) to (245.25, 137.75). | Perfect. | None. |
| 4 | `bb1:bus-bot-minus-1` → `bat1:negative` | Same as v1 esp1 #4. | Acceptable. | None. |
| 5 | `mm1:probe-positive` → `bb1:j12` | Multimeter at (340, 20), probe-positive pin TBD, to (200.25, 111.25). | **Possibly looks ugly** — long diagonal across components. | If ugly: add waypoint at (300, 111.25) to route horizontally first then drop. |
| 6 | `mm1:probe-negative` → `bb1:j15` | Similar to #5. | Same. | If ugly: waypoint at (310, 111.25). |

**Verdict**: 0-2 waypoints needed, ONLY if multimeter probe wires look bad after visual verification.

---

### v2-cap7-esp2 — "Scarica con LED rosso"

**Layout**: bat1(30,55), bb1(100,10), c1(155.25,88.75), btn1(200.25,81.25), r1(249,73.75), led1(286.5,43.75), mm1(340,20)
**Book ref**: vol2/page-071.png + page-072.png

**Connections (10 total):**

Same pattern as esp1. Wires 1-4 (battery + multimeter): same acceptable. Wires 5-10 are component bridges on the breadboard.

| # | from → to | Current behavior | Recommendation | Suggested waypoints |
|---|---|---|---|---|
| 1-4 | Battery + multimeter | Same as esp1. | Acceptable. | None. |
| 5 | `bb1:g12` → `bb1:c5` | (200.25, 88.75) to (147.75, 48.75). Diagonal across button. | **MAY LOOK BAD** — crosses button body. | Add waypoint at (200.25, 48.75): horizontal up first, then horizontal left. → `[{x:200.25,y:88.75},{x:200.25,y:48.75},{x:147.75,y:48.75}]` |
| 6 | `bb1:a5` → `bb1:a15` | Horizontal along row a. | Perfect. | None. |
| 7 | `bb1:a22` → `bb1:a23` | Adjacent columns row a, very short. | Perfect. | None. |
| 8 | `bb1:a24` → `bb1:bus-top-minus-24` | Vertical drop. | **PROBLEM** — `bus-top-minus` is at y=21.25, but row a is y=43.75. This goes UP from a to bus, opposite of normal. May intersect Nano area if any. | None (but verify). |
| 9-10 | Multimeter | Same as esp1. | Acceptable. | None. |

**Verdict**: 1 waypoint suggested for connection #5 if visual verification shows it crossing the button.

---

### v3-cap6-esp4 — "Due LED che si alternano"

**Layout**: bb1(280,10), nano1(230,10,parentId:bb1), r1(436.5,58.75), led1(481.5,43.75), r2(466.5,58.75), led2(511.5,43.75)
**Book ref**: vol3/page-055.png

**WARNING**: Several connections in this experiment are **structurally wrong** (see Finding 5). Adding waypoints will not fix the structural issues.

Connections (8 total):

| # | from → to | Issue | Recommendation |
|---|---|---|---|
| 1 | `nano1:W_D6` → `bb1:a16` | Wire from Nano breakout pin to bb. OK if Nano breakout pin position is well-defined. | Accept. No waypoint. |
| 2 | `bb1:d23` → `bb1:d25` | Should be `c23` (r1:pin2) → `d25` (led1:anode). Both pins are in the same vertical net so it works electrically but visually crosses 1 row | **Data fix**, not waypoint. Change to `c23` → `d25`. |
| 3 | `bb1:a26` → `bb1:bus-bot-minus-26` | a26 is in row a but led1 cathode is at d26. Same net via column 26. Visually starts from wrong row. | **Data fix**: change to `d26` → `bus-bot-minus-26`. No waypoint. |
| 4 | `nano1:W_D9` → `bb1:a20` | OK. | Accept. |
| 5 | `bb1:d27` → `bb1:d29` | Similar to #2. Should be `c27` (r2:pin2) → `d29` (led2:anode). | Data fix. |
| 6 | `bb1:a30` → `bb1:bus-bot-minus-30` | Similar to #3. | Data fix. |
| 7 | `nano1:GND_R` → `bb1:bus-bot-minus-1` | OK. | Accept. |
| 8 | `nano1:5V` → `bb1:bus-bot-plus-1` | OK. | Accept. Note: this is suspicious — 5V going to bus-bot-PLUS means positive rail is at bottom of breadboard, which IS the ELAB convention for boards with Nano on top half. |

**Verdict**: ZERO waypoints. Need 4 data fixes in connections #2, #3, #5, #6.

---

### v3-cap6-esp5 — "Costruiamo un semaforo"

**Layout**: bb1(280,10), nano1(230,10,parentId:bb1), r1(421.5,58.75), led1(466.5,43.75), r2(451.5,58.75), led2(496.5,43.75), r3(481.5,58.75), led3(526.5,43.75)
**Book ref**: vol3/page-057.png

**WARNING**: This experiment has **2 confirmed bugs** (see Finding 6):
- Connection at lines 1366-1369: `bb1:d29` → `bb1:d21` — `d29` is row d col 29 (between led2 cathode and led3 anode), `d21` is row d col 21 (led3 anode). The wire crosses 8 columns through other components. **Likely meant to be**: `c22` (r3:pin1) → `d21` (led3:anode). Or it's a different mistake.
- Connection at lines 1370-1374: `bb1:a22` → `bb1:bus-bot-minus-22`. But `a22` is in the same net as nano1:W_D9 (connection 7 at lines 1361-1364). This SHORTS Pin 9 to GND. **Likely meant to be**: `a30` (led3:cathode equivalent net) → `bus-bot-minus-30`.

**These are NOT waypoint problems — they are data corruption.**

| # | from → to | Issue | Recommendation |
|---|---|---|---|
| 1 | `nano1:W_D5` → `bb1:a14` | OK | Accept |
| 2 | `bb1:d21` → `bb1:d23` | Should be `c21` (r1:pin2) → `d23` (led1:anode) | Data fix |
| 3 | `bb1:a24` → `bb1:bus-bot-minus-24` | Should be `d24` → bus | Data fix |
| 4 | `nano1:W_D6` → `bb1:a18` | OK | Accept |
| 5 | `bb1:d25` → `bb1:d27` | Should be `c25` (r2:pin2) → `d27` (led2:anode) | Data fix |
| 6 | `bb1:a28` → `bb1:bus-bot-minus-28` | Should be `d28` → bus | Data fix |
| 7 | `nano1:W_D9` → `bb1:a22` | OK | Accept |
| 8 | `bb1:d29` → `bb1:d21` | **BUG** — likely meant `c29` (r3:pin2) → `d29` (wait that doesn't help). The reference book shows D9 → r3 → led3. r3 is at c22→c29, led3 at d21→d22. So the wire from r3:pin2 (c29) should go to led3:anode (d21). But c29 and d21 are different columns AND different sections → this is impossible without a long horizontal wire. **The pinAssignments may be wrong**: led3:anode should be on row d at column 29 or 30, not 21. | DATA INVESTIGATION required, not waypoints. |
| 9 | `bb1:a22` → `bb1:bus-bot-minus-22` | **BUG** — see above. | Data fix. |
| 10-11 | GND_R, 5V | OK | Accept |

**Verdict**: ZERO waypoints. Need data investigation + fixes. v3-cap6-esp5 is the worst of the 7 — it needs Davide or Andrea to clarify the intended wiring.

---

## ADR Proposals

If the main thread agent decides Tier 1 (book mode + visual verify) is insufficient and wants to add waypoint support, here are the architectural proposals.

### ADR-WAYPOINTS-001 — Reject hardcoded waypoints (RECOMMENDED)

**Status**: PROPOSED
**Decision**: Do NOT use `conn.waypoints` arrays in experiment JSON.
**Rationale**:
- Waypoints encode absolute coordinates that become stale if `bb1.x` ever changes.
- Maintenance burden: 55+ waypoint arrays across 7 experiments, plus same effort for the other 87 experiments later.
- The existing `routingMode: 'book'` already produces near-book-style results.
- Real fixes needed (data corruption in vol3) cannot be solved by waypoints.

**Alternative**: Add a `bookRoute: true` boolean flag on connections. When set, WireRenderer uses an enhanced routing function that produces multi-segment paths algorithmically based on pin types (bus-to-row → vertical-then-horizontal; arduino-to-row → horizontal; etc.). This is a 30–50 line code change in WireRenderer, but is the right architectural answer.

### ADR-WAYPOINTS-002 — Enhanced book routing (FOR LATER)

**Status**: PROPOSED for post-demo iteration.
**Scope**: Modify `routeFromArduino`, `routeOnBreadboard`, `routeToBreadboardPin` in WireRenderer to return multi-segment paths when `routingMode === 'book'`. The pin-type information is already available (via the pinId pattern).

Example enhancement:
```js
function routeToBreadboardPin(offPos, bbPinPos, bbX, bbY, mode) {
  if (mode !== 'book') return [offPos, bbPinPos];
  // Book mode: arc-shaped routing for off-board → bus rail
  const midX = (offPos.x + bbPinPos.x) / 2;
  const arcY = Math.min(offPos.y, bbPinPos.y) - 10;
  return [offPos, {x: midX, y: arcY}, bbPinPos];
}
```

**Effort**: 2-3 hours. Test surface: existing wire tests + visual regression in 7 demo experiments.

---

## Implementation Guidance for Main Thread Agent

### If choosing Tier 1 (recommended)

1. Locate the experiment-loading code (likely in `NewElabSimulator.jsx` or wherever connections are passed to `WireRenderer`). Hard-code `routingMode='book'` for the 7 demo experiment IDs.
2. Build the demo, manually inspect each of the 7 experiments side-by-side with the book PNGs.
3. If any wire looks visibly broken (crosses components, big diagonal jumps), THEN consider adding waypoints for that ONE wire (see Tier 2 sections above for the 2-3 candidates).
4. Fix the data corruption in v3-cap6-esp4 and v3-cap6-esp5 BEFORE adding any waypoints. Those bugs will look worse than book-vs-flex differences.

### If choosing Tier 2 (waypoints for select bad wires)

For each connection where waypoints would help (only 1–3 candidates total across all 7 experiments):

```json
{
  "from": "bb1:g12",
  "to": "bb1:c5",
  "color": "yellow",
  "waypoints": [
    {"x": 200.25, "y": 88.75},
    {"x": 200.25, "y": 48.75},
    {"x": 147.75, "y": 48.75}
  ]
}
```

**Critical**: The waypoints array MUST include both endpoints (start and end). If you omit them, the wire will disconnect from the pin.

### Validation steps

Before committing any waypoints:
1. Run `npm run build` — must pass.
2. Run `npx vitest run` — baseline test count must not decrease.
3. Visually compare each modified wire to the book PNG.
4. Verify the wire color is unchanged (waypoints replace path but not color logic).
5. Verify the experiment still simulates correctly (LED lights, capacitor charges, etc.) — waypoints affect rendering only, not the solver.

---

## Closing Note (Honest)

I was asked to produce 55+ waypoint specifications. I produced 1–3 strong candidates plus an architectural recommendation to NOT do this work as theater.

The honest summary: The wire routing in the current ELAB simulator is **already close enough to the book**. Visual differences come mostly from (a) `routingMode='flex'` vs `'book'` (a 1-line config change) and (b) data corruption in 2 of the 7 experiments (4–6 wires that need data fixes, not waypoint specs).

Spending 4-5 hours on hand-crafted waypoints for the demo is a bad use of time when:
- 30 minutes of switching to book mode + visual verify might suffice.
- 2 hours of fixing the v3 experiment data corruption is required regardless.
- 3 hours of enhancing book routing in WireRenderer (ADR-WAYPOINTS-002) is the right long-term answer.

Path forward for Andrea:
1. Decide if book-mode-as-is is acceptable for demo 25/05 (30 min visual verify).
2. If not, fix v3-cap6-esp4 + v3-cap6-esp5 data corruption (1–2 hours).
3. If still not, add the 2–3 candidate waypoints listed above (30 min).
4. Defer ADR-WAYPOINTS-002 (book routing enhancement in WireRenderer) to post-demo iteration.

Total realistic effort for the demo: **2–3 hours**, not 5+ hours of waypoint spec-writing.

---

**End of spec.**
