# DEMO VERTICAL SLICE RESULT

Verified: 2026-07-02 10:24-10:29 CEST
URL: `https://ardesia-lavagna.vercel.app`
Mode: browser check only. No deploy, no alias change, no repo/runtime mutation.

## Verdict

The live `ardesia-lavagna` deployment passes the minimum vertical-slice smoke:

1. Board loads at HTTP 200.
2. Plugin menu opens.
3. `Simulatore Arduino` can be added after the permission/confirmation step.
4. The hosted plugin renders on the board.
5. The plugin can be interacted with through the visible `Run` button.
6. Lesson export downloads `lezione.ardesia.json`.
7. Re-import through the file input restores the simulator plugin.

This is not yet a full product-readiness claim. It is a live smoke result for
the PR #8 demo plan.

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
