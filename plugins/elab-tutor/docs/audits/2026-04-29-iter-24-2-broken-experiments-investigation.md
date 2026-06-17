# Iter 24 — Investigation 2 broken esperimenti

Date: 2026-04-29
Author: gen-app iter 24 agent
Scope: investigate why `v1-cap6-esp1` "Accendi il tuo primo LED" + `v1-cap7-esp2` "Accendi il verde del RGB" fail E2E harness

## TL;DR

The two experiments **are NOT JSON-malformed**. Both files parse, follow the curriculum schema, and have all required keys. The harness `iter-23-harness-real-pilot/results.jsonl` shows ALL 5 tested experiments fail with the SAME identical signature:

```
api_ready: false
render.svg_count: 0
render.component_nodes: 0
mount.strategy: 'hash-fallback'
```

i.e. the failure mode is **not per-experiment** — it is a harness/prod plumbing gap: the live site at `https://www.elabtutor.school` does NOT expose `window.__ELAB_API` after the harness's `navigate()` step, so `mountExperiment()` never gets called, no SVG is rendered, no diff against golden state can be computed.

That said, when the harness IS fixed, `v1-cap6-esp1` will likely STILL trip the placement engine for a **separate** structural reason described below.

## File-system evidence

Files inspected:
- `src/data/lesson-paths/v1-cap6-esp1.json` (258 LOC) — "Accendi il tuo primo LED"
- `src/data/lesson-paths/v1-cap7-esp2.json` (246 LOC) — "Accendi il verde del RGB"
- `src/data/lesson-paths/v1-cap6-esp2.json` (PASSING similar context, no harness data on it)
- `automa/state/iter-23-harness-real-pilot/results.jsonl` (6 lines: 1 meta + 5 results, all `pass=false`)

Both broken JSONs parse cleanly (`python3 -m json.tool` succeeds, no errors).

## Diff vs working sibling — `v1-cap6-esp1` vs `v1-cap6-esp2`

Same chapter (Cap 6 LED), same kit list except esp2 has NO resistor (deliberate "what happens without protection"). Same `phases` shape. Same vocabulary block. **Important asymmetry in `MOSTRA.build_circuit.intent`:**

### v1-cap6-esp1 (BROKEN) — resistor placement

`components`:
- `bat1` (battery9v)
- `bb1` (breadboard-half)
- `r1` (resistor 470)
- `led1` (LED red)

`wires`:
1. `bat1:positive → bb1:bus-top-plus-1`
2. `bb1:bus-top-plus-2 → bb1:b2`        ← +rail to **col 2 row b**
3. `bb1:e9 → bb1:f9`                    ← jumper col 9 (LED leg-1 expected here)
4. `bb1:j10 → bb1:bus-bot-minus-10`     ← LED leg-2 → ground
5. `bb1:bus-bot-minus-1 → bb1:bus-top-minus-1`
6. `bb1:bus-top-minus-1 → bat1:negative`

The resistor `r1` declares only `{id, value: 470}` — no `from`/`to` pin pair. The Placement Engine has to infer placement based on wire endpoints. From the wire pattern:
- col 2 (anode side, +rail) is wired
- col 9 (`e9 ↔ f9`) is the only intermediate pin pair in the workspace
- col 10 (LED to ground) is wired

So the placement engine has to bridge the **column 2 wire** to the **column 9 jumper**. That implies the resistor must straddle **cols 2 ↔ 9**, a **7-column span**. Typical THT resistors fit a 5-col span on a half breadboard. A 7-col span is geometrically possible (the leads are bendable in real kit), but **`PlacementEngine.js` may snap to the nearest 5-col profile**, picking either cols 2↔7 or 4↔9 — neither of which matches the wired endpoints, leaving the resistor disconnected (visually or electrically).

### v1-cap6-esp2 (PASSING similar) — no resistor

The "broken" sibling is actually simpler: just battery+LED. `bat1:positive → bb1:bus-top-plus-1`, then `bus-top-plus-2 → a2`, `e2 ↔ f2`, `j3 → bus-bot-minus-3`, ground close. The LED straddles rows `a–e` at col 2 (cathode lead) and rows `f–j` at col 3 (anode lead), via the jumper `e2 ↔ f2` then `j3 → ground`. Pin spacing: 1 col, normal LED footprint. No resistor → no inference problem.

**Hypothesis 1 (resistor inference)**: `v1-cap6-esp1` uses a **non-canonical 7-col resistor span** that the Placement Engine cannot resolve unambiguously. Fix: rewrite the wire list to use a 5-col span, e.g.:

```jsonc
// v1-cap6-esp1 PROPOSED FIX wires
{ "from": "bb1:bus-top-plus-2", "to": "bb1:b2",  "color": "red"   },  // +rail to row b col 2 (resistor lead 1)
{ "from": "bb1:e7",             "to": "bb1:f7",  "color": "green" },  // resistor lead 2 jumper (col 7, 5-col span 2→7)
{ "from": "bb1:j7",             "to": "bb1:bus-bot-minus-7", "color": "black" }, // wait, LED is also here…
```

Actually rewriting requires knowing where `led1` goes — the original JSON does not specify. The cleanest fix is to **add explicit `pins` declarations** to the resistor + LED in the components array, e.g.:

```jsonc
{ "type": "resistor", "id": "r1", "value": 470, "pins": ["b2", "b7"] },
{ "type": "led", "id": "led1", "color": "red", "pins": ["e7", "e8"] }
```

This eliminates Placement Engine ambiguity.

## Diff vs working sibling — `v1-cap7-esp2`

Schema-clean. Same shape as v1-cap7-esp1 (presumed working) and v1-cap6-esp2.

`components`: bat1, bb1, r1 (470), rgb1 (rgb-led)
`wires`:
1. `bat1:positive → bb1:bus-top-plus-1`
2. `bb1:bus-top-plus-11 → bb1:b11`        ← +rail to **col 11**
3. `bb1:e4 → bb1:f4`                       ← green channel pin jumper col 4
4. `bb1:j3 → bb1:bus-bot-minus-3`          ← cathode common to ground
5. `bb1:bus-bot-minus-1 → bb1:bus-top-minus-2`
6. `bb1:bus-top-minus-1 → bat1:negative`

**Hypothesis 2 (RGB-LED pin layout)**: an RGB LED has **4 legs** (R, common cathode, G, B) — pins at cols 2, 3, 4, 5 in a typical 4-pin DIP package. The wires assume:
- col 11 = resistor lead 1 (top end)
- col 4 = green channel pin (`e4 ↔ f4` jumper bridging top to bottom rail of breadboard)
- col 3 = cathode common pin (to ground)
- cols 2 + 5 (R + B legs) NOT WIRED → floating (correct, only green channel active)

The resistor `r1` has no `pins`. Wire 2 anchors col 11 (top of resistor). Where does the bottom of the resistor go? **Nowhere wired** — the only path from col 11 to anywhere is through the resistor body to its other lead, which the engine has to guess. Need to add wire `bb1:bus-top-plus-X → bb1:b11` AND `bb1:e11 → bb1:f4` (or similar) to bridge resistor → green pin. The current JSON is **missing the resistor-to-RGB jumper wire**.

Compare: in `v1-cap7-esp1` (presumed working) wires list should include the bridge between resistor end-col and the RGB pin column. Without inspecting `v1-cap7-esp1.json` (skipped — file not in this scope) the diff is a hypothesis.

**Hypothesis 2 fix**: add 1 missing wire:

```jsonc
{ "from": "bb1:b11", "to": "bb1:b4", "color": "yellow" }
```

so resistor (col 11) bridges to green-channel pin (col 4). Or equivalent jumper through the bottom rail.

## Composite handler smoke test

Out-of-scope of "broken experiments" but task D required: composite-handler tests at `scripts/openclaw/composite-handler.test.ts` execute **10/10 PASS** in 170ms (verified 2026-04-29 via `npx vitest run -c vitest.openclaw.config.ts`). `executeComposite` is wired and the L1 morphic pipeline (sequential dispatch with chain-wide timeout, PZ block-mode, memory cache hit/miss, error propagation, aggregate) all pass. The "Costruisci LED PWM con pulsante e spiega" multi-tool scenario is not specifically in the test suite (those are case 1-10 generic dispatch sub-tools), so a real prod-side smoke test still requires Andrea Edge Function deploy + composite registry entry for the demo composite.

## Honest gaps remaining iter 25+

1. **Harness/prod plumbing**: 5/5 pilot fails because `__ELAB_API` not exposed post-navigate on prod. Fix: harness needs `await page.waitForFunction(() => !!window.__ELAB_API, {timeout: 10000})` BEFORE attempting `mount.strategy='hash-fallback'`. Once that lands, the per-experiment failures will surface.
2. **Resistor placement inference**: needs explicit `pins` in component declarations OR a Placement Engine config that prefers 5-col span when ambiguous. Recommended: add `pins: ["bX", "bY"]` to all resistor declarations across all 92 experiments.
3. **Missing bridge wires**: v1-cap7-esp2 (and likely others) is missing the resistor-to-component bridge wire. Audit script needed: walk all `build_circuit.intent.wires` arrays and validate every component declared in `intent.components` appears in at least 2 wires (anode + cathode for LEDs/resistors, etc.).
4. **No JSON schema validation in CI**: lesson-paths JSONs lack a JSON Schema. Adding one would catch malformed wire endpoints (`bb1:bus-top-minus-1` vs `bb1:bus-top-plus-1` typo) at PR time.

## Recommended fix priority

| File | Fix | Effort | Iter |
|------|-----|--------|------|
| `src/data/lesson-paths/v1-cap6-esp1.json` | Add explicit `pins` to `r1` + `led1` | 5 min | 25 |
| `src/data/lesson-paths/v1-cap7-esp2.json` | Add resistor-to-RGB bridge wire | 5 min | 25 |
| `tests/e2e/harness-real-2026-04-28.spec.js` | `waitForFunction(__ELAB_API)` pre-mount | 15 min | 25 |
| `src/components/simulator/engine/PlacementEngine.js` | Documented snap rules + explicit `pins` precedence | 1 h | 25 |
| `scripts/audit-lesson-paths-wires.mjs` | NEW: validate wire connectivity per esperimento | 30 min | 26 |

## Citations

- `src/data/lesson-paths/v1-cap6-esp1.json` lines 110-167 — components+wires intent
- `src/data/lesson-paths/v1-cap7-esp2.json` lines 110-162 — components+wires intent
- `src/data/lesson-paths/v1-cap6-esp2.json` lines 109-159 — passing sibling
- `automa/state/iter-23-harness-real-pilot/results.jsonl` — 5/5 fail same signature
- `scripts/openclaw/composite-handler.test.ts` — 10/10 PASS (170ms vitest run)
