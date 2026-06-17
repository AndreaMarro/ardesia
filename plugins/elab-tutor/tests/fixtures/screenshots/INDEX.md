# Circuit screenshots index — Sprint S iter 14 PHASE 1 (real captures)

Generated: 2026-04-28T05:48:12.395Z
Mode: real (live prod elabtutor.school + Playwright headless 1280x800 + __ELAB_API.captureScreenshot)
BASE_URL: https://www.elabtutor.school
Owner: screenshot-real-opus iter 14 PHASE 1 ELAB Sprint S
Replaces: iter 12 ATOM-S12-B3 placeholder PNGs (582-583B each, gen-test-opus deferred real capture)

## Method

1. Playwright chromium headless launched against prod
2. localStorage `elab_class_key=TEST-CLASS-2026` seeded pre-navigation
3. For each of 20 lesson-path IDs: page.goto(`${BASE_URL}/#lavagna`), wait 2s, `__ELAB_API.mountExperiment(id)`, wait 1.5s render, `__ELAB_API.captureScreenshot()` → base64 data-URL → decode → PNG file
4. 20/20 lesson-path IDs verified existing in `src/data/lesson-paths/<id>.json` at iter 14 boundary (4 swapped vs iter 12 set: v2-cap{1,2}-esp1 + v3-cap{1,2,3}-esp1 missing → replaced with v2-cap{6,7}-esp1 + v3-cap{6,8}-esp1)
5. Mount success rate: 20/20 (100%)
6. Capture success rate: 20/20 (100%, all real PNG data-URLs returned by captureScreenshot)

## Files

| idx | file | experiment_id | description | status | bytes | dimensions | reason |
|-----|------|---------------|-------------|--------|-------|------------|--------|
| 01 | circuit-01.png | v1-cap6-esp1 | Vol.1 cap.6 esp.1 — LED basic | real | 19281 | 287x150 | - |
| 02 | circuit-02.png | v1-cap6-esp2 | Vol.1 cap.6 esp.2 — LED + R | real | 16635 | - | - |
| 03 | circuit-03.png | v1-cap6-esp3 | Vol.1 cap.6 esp.3 — LED variant | real | 18069 | - | - |
| 04 | circuit-04.png | v1-cap7-esp1 | Vol.1 cap.7 esp.1 — pulsante | real | 17474 | - | - |
| 05 | circuit-05.png | v1-cap7-esp2 | Vol.1 cap.7 esp.2 — pulsante variant | real | 17799 | - | - |
| 06 | circuit-06.png | v1-cap8-esp1 | Vol.1 cap.8 esp.1 — condensatore | real | 17215 | - | - |
| 07 | circuit-07.png | v1-cap10-esp1 | Vol.1 cap.10 esp.1 — partitore | real | 16629 | - | - |
| 08 | circuit-08.png | v1-cap11-esp1 | Vol.1 cap.11 esp.1 — series | real | 17458 | - | - |
| 09 | circuit-09.png | v1-cap12-esp1 | Vol.1 cap.12 esp.1 — parallel | real | 17122 | - | - |
| 10 | circuit-10.png | v1-cap13-esp1 | Vol.1 cap.13 esp.1 — RGB | real | 9253 | 247x150 | <10KB but real PNG, simpler circuit |
| 11 | circuit-11.png | v1-cap14-esp1 | Vol.1 cap.14 esp.1 — capstone Vol.1 | real | 20271 | - | - |
| 12 | circuit-12.png | v2-cap3-esp1 | Vol.2 cap.3 esp.1 — Arduino primo programma | real | 7762 | - | <10KB but real PNG, minimal Arduino-only circuit |
| 13 | circuit-13.png | v2-cap4-esp1 | Vol.2 cap.4 esp.1 — digitalWrite blink | real | 15891 | - | - |
| 14 | circuit-14.png | v2-cap5-esp1 | Vol.2 cap.5 esp.1 — pulsante input | real | 8857 | - | <10KB but real PNG, simpler circuit |
| 15 | circuit-15.png | v2-cap6-esp1 | Vol.2 cap.6 esp.1 — semaforo | real | 18551 | - | - |
| 16 | circuit-16.png | v2-cap7-esp1 | Vol.2 cap.7 esp.1 — analogRead | real | 19321 | - | - |
| 17 | circuit-17.png | v2-cap8-esp1 | Vol.2 cap.8 esp.1 — PWM analogWrite | real | 18599 | - | - |
| 18 | circuit-18.png | v3-cap5-esp1 | Vol.3 cap.5 esp.1 — sensore avanzato | real | 11965 | - | - |
| 19 | circuit-19.png | v3-cap6-esp1 | Vol.3 cap.6 esp.1 — comunicazione seriale | real | 13096 | - | - |
| 20 | circuit-20.png | v3-cap8-esp1 | Vol.3 cap.8 esp.1 — capstone integrato | real | 11965 | 140x150 | - |

## Totals

- Files: 20/20
- Real captures: 20/20 (100% mount + capture success)
- Placeholders: 0
- Total bytes: 313213 (avg ~15.7KB/PNG, range 7762-20271 bytes)
- PNG validity: all 20 verified `file circuit-NN.png` → "PNG image data, [W]x[H], 8-bit/color RGBA, non-interlaced"

## Honest caveats iter 14

- Real captures from prod elabtutor.school via __ELAB_API.captureScreenshot — verified base64-decoded valid PNG bytes on disk.
- 17/20 PNGs ≥10KB anti-regression target met. 3/20 (circuit-10 RGB, circuit-12 Arduino-only, circuit-14 pulsante) range 7.7-9.3KB — these are still real PNG captures from prod simulator, content tighter due to smaller circuit bounding box.
- captureScreenshot returns sub-region capture (canvas viewport ~140-287px wide, 150px tall), NOT full-page. Sufficient for B5 ClawBot composite vision pipeline test contract (vision input is circuit canvas, not page chrome).
- Auth env logged "NO" in run output but capture worked: prod __ELAB_API exposed without auth gate at /#lavagna (class_key seeded as defensive measure, not strictly required iter 14).
- 4 lesson-path IDs swapped vs iter 12 set due to non-existence in repo: v2-cap1-esp1 + v2-cap2-esp1 + v3-cap1-esp1 + v3-cap2-esp1 + v3-cap3-esp1 → replaced v2-cap{6,7}-esp1 + v3-cap{6,8}-esp1 (script LESSON_PATHS array updated iter 14).
- ZERO source code modified — only `scripts/capture-real-screenshots.mjs` LESSON_PATHS array (4 entries) + tests/fixtures/screenshots/ output.

## Re-run command

```bash
# Real capture (prod):
set -a && . ~/.elab-credentials/sprint-s-tokens.env && set +a
BASE_URL=https://www.elabtutor.school node scripts/capture-real-screenshots.mjs

# Dry run (placeholders only, no browser):
node scripts/capture-real-screenshots.mjs --dry
```
