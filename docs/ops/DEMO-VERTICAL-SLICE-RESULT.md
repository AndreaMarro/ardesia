# DEMO VERTICAL SLICE RESULT

Verified: 2026-07-02 10:24-10:29 CEST
URL: `https://ardesia-lavagna.vercel.app`
Mode: browser check only. No deploy, no alias change, no repo/runtime mutation.

## MVP Proof

This is the first live MVP proof for ARDESIA as a board-hosted plugin surface,
not as a new ELAB standalone app.

Verified live path:

```text
board -> plugin menu -> add Simulatore Arduino -> interact -> export -> import -> restored plugin
```

Why it counts:

1. the board loads from the live Vercel URL;
2. the simulator is mounted as an object on the board;
3. the simulator reacts to user input;
4. the lesson export includes the simulator embed;
5. the exported lesson can be imported back and restores the simulator.

This proves the minimum product loop: a teacher can open the live board, mount a
tool, interact with it, save the lesson, and recover it.

## What Works

The live `ardesia-lavagna` deployment passes the minimum vertical-slice smoke:

1. Board loads at HTTP 200.
2. Plugin menu opens.
3. `Simulatore Arduino` can be added after the permission/confirmation step.
4. The hosted plugin renders on the board.
5. The plugin can be interacted with through the visible `Run` button.
6. Lesson export downloads `lezione.ardesia.json`.
7. Re-import through the file input restores the simulator plugin.

## What Is Missing

This is not yet a full product-readiness claim.

Missing before calling it a product slice:

1. ELAB Vol.1 cap.6 esp.1 is not yet bound to the simulator as a manual-aligned
   circuit.
2. There is no manual/circuit drift test yet.
3. The headless browser used a coordinate click for `Run`; the visual state
   changed to `RUNNING`, but role lookup for the button should be made stable.
4. The evidence is textual COV plus local artifacts; screenshots are not
   committed.
5. No new production deploy was made from this PR.

## Browser Result

| Check | Result | Evidence |
|---|---|---|
| Page load | PASS | HTTP 200, title `ARDESIA - la lavagna del docente` |
| Board visible | PASS | toolbar, canvas, paper background visible |
| Plugin menu | PASS | `Plugin` menu exposes simulator entries |
| Plugin add | PASS | confirmed `Simulatore Arduino` permission modal with `Aggiungi` |
| Plugin render | PASS | simulator card visible with blocks, generated code, LED, Run/Stop |
| Interaction | PASS | coordinate click on visible `Run` button switched status to `RUNNING` |
| Export | PASS | downloaded `lezione.ardesia.json` |
| Export content | PASS | JSON keys: `format`, `v`, `ink`, `embeds`, `tools`; `embedsCount=1` |
| Import | PASS | file input import restored `com.ardesia.sim-arduino` embed |
| Console/page errors | PASS | `logCount=0` |

## Export/Import Evidence

Exported sample embed:

```json
{
  "pluginId": "com.ardesia.sim-arduino",
  "x": 440,
  "y": 290,
  "w": 560,
  "h": 420,
  "z": 11
}
```

After import:

- `bodyHasSimulator=true`
- `localStorage ardesia.embeds.v1` contains one `com.ardesia.sim-arduino` embed
- plugin card is visible again

## Local Artifacts

Artifacts were collected locally and were not committed:

- `/tmp/ardesia-lavagna-demo/01-home.png`
- `/tmp/ardesia-lavagna-demo/31-simulatore-confirmed-added.png`
- `/tmp/ardesia-lavagna-demo/39-after-coordinate-run.png`
- `/tmp/ardesia-lavagna-demo/40-after-import-coordinate-run.png`
- `/tmp/ardesia-lavagna-demo/flow-result-coordinate-run.json`
- `/tmp/ardesia-lavagna-demo/lesson-export-coordinate-run-lezione.ardesia.json`

## Artifact Decision

Textual COV is sufficient for PR #8. The screenshots, browser JSON, and
downloaded lesson export stay local because they are generated verification
artifacts, not source. The result table records the live URL, checked flow,
export/import evidence, and local artifact paths; committing images would add
binary churn without changing the demo verdict.

Commit screenshots or exported lessons only if Andrea asks for release evidence
or a future regression needs visual fixtures.

## Next Micro-Slice Plan

Condition satisfied: PR #11 and PR #12 are merged.

Target: Simulation Plugin / ELAB Vol.1 cap.6 esp.1. This is not a new ELAB app;
it is a small manual-aligned slice on the existing simulator/plugin surface.

File budget: maximum 5 files.

Planned touch set:

1. `apps/studio/sim/entry.html` - show the cap.6 esp.1 LED circuit state in the
   existing simulator iframe.
2. `apps/studio/sim/manifest-source.json` - update name/version/metadata only if
   needed; do not add capabilities.
3. `apps/studio/src/store/referenceBlinkDemo.ts` - only if the demo selector
   needs a stable URL flag for this slice.
4. `apps/studio/src/__tests__/ReferenceBlinkDemo.test.tsx` - add manual/circuit
   drift assertions.
5. one docs/COV note - record browser result and rollback.

Required tests:

1. manual/circuit drift: canonical cap.6 esp.1 components stay aligned with the
   simulator labels/state;
2. ToolHost safety: board writes remain scoped to own embeds;
3. export/import: saved lesson restores the simulator embed;
4. browser smoke: board -> plugin -> interaction -> export/import.

Non-goals:

1. no new ELAB app;
2. no full `plugins/elab-tutor` import;
3. no new deploy without approval;
4. no payments, marketplace, UNLIM flow, or CircuitSolver rewrite.

## Notes

- Playwright role lookup for the `Run` button was unreliable in headless mode,
  so the interaction used a coordinate click on the visible button. Screenshot
  evidence shows the plugin status changed to `RUNNING`.
- The first attempted flow exposed the real two-step plugin add path: menu
  selection opens a confirmation modal; the embed is not persisted until
  `Aggiungi` is clicked.
- No screenshots, downloaded lessons, or raw browser logs were committed.

## COV

Commands/probes:

- Playwright/Chromium via bundled Node runtime and installed Google Chrome.
- `page.goto("https://ardesia-lavagna.vercel.app", waitUntil="networkidle")`.
- screenshots before add, after add, after Run, after import.
- localStorage checks for `ardesia.embeds.v1` and `ardesia.ink.v1`.
- export download capture with Playwright `download`.
- import via `input[type=file]`.

Not done:

- no Vercel deploy;
- no alias change;
- no production setting change;
- no source code change;
- no screenshot artifact commit.
