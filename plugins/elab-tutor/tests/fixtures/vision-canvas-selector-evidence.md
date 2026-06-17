# Vision E2E canvas selector evidence — Sprint S iter 12 ATOM-S12-A3

Generated: 2026-04-28 (gen-test-opus PHASE 1 iter 12)
Source modified: `tests/e2e/02-vision-flow.spec.js`
Owner: gen-test-opus.

## Iter 11 baseline issue (per planner contract)

- Navigation `/#lavagna` works (iter 11 P0 fix `683da5f`).
- LavagnaShell mounts `__ELAB_API` global on `window` correctly.
- `mountExperiment(fx.experimentId)` resolves true.
- **`captureScreenshot()` returns null/empty** for all 5 fixtures (empty / led-ok / led-bad / resistor-only / nano-only).

Hypothesis: internal `simulator-api.js` `captureScreenshot` queries a canvas/svg selector that no longer matches post-Lavagna redesign S1-S8 (CSS modules + NanoR4Board scaling 1.8). DOM root may have moved or testid attribute may be missing.

## Iter 12 fix approach (NO functional change to spec assertions)

Add diagnostic + selector-discovery block BEFORE the existing `captureScreenshot` evaluate call:

1. **Enumerate candidates**: `document.querySelectorAll('canvas, svg')` — log tag / id / class / role / aria-label / data-testid / bbox per element to test stdout.
2. **Pick simulator canvas root**: priority order
   - `[data-testid="simulator-canvas"]` (preferred — gen-app should add this attr if missing)
   - `svg[data-testid*="simulator"]`
   - `svg.SimulatorCanvas`
   - `svg[class*="NanoR4"]`
   - `svg[class*="simulator"]`
   - Largest bbox `svg` (fallback)
3. **Wait visible**: `page.waitForSelector(picked, { state: 'visible', timeout: 10000 })` before invoking captureScreenshot. Tolerant: warn-and-continue if timeout (captureScreenshot owns its own selector logic, this is just a render-settle assist).

Spec assertions UNCHANGED — same expects on `screenshot.ok`, `length`, `Ragazzi` plurale, `[AZIONE:...]` tag, latency ceiling.

## Diagnostic block code (gist)

```js
const canvasCandidates = await page.evaluate(() => {
  const out = [];
  const els = Array.from(document.querySelectorAll('canvas, svg'));
  for (const el of els) {
    const rect = el.getBoundingClientRect();
    out.push({
      tag: el.tagName,
      id: el.id || '',
      class: typeof el.className === 'string' ? el.className : (el.className?.baseVal || ''),
      role: el.getAttribute('role') || '',
      aria: el.getAttribute('aria-label') || '',
      testid: el.getAttribute('data-testid') || '',
      bbox: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
    });
  }
  return out;
});
console.log(`[vision-e2e][${fx.id}] candidates:`, JSON.stringify(canvasCandidates, null, 2));
```

## Selector decision rationale

- **Why not hardcode a single selector?** LavagnaShell + SimulatorCanvas + NanoR4Board may render with class hashes (CSS modules: `SimulatorCanvas_root_abc123`). Hardcoded `.SimulatorCanvas` may fail. The picker prefers `data-testid` (stable contract) then falls back to substring match then largest-bbox svg.
- **Why log all candidates?** When iter 13 inspects spec output, the JSON dump under `[vision-e2e][${fx.id}] candidates:` is grep-able evidence of the actual DOM at run time. No more guessing.
- **Why tolerant `waitForSelector`?** captureScreenshot via `__ELAB_API` already encapsulates its own root-finding logic in `src/services/simulator-api.js`. Our wait is a render-settle assist, not a contract. If the picked selector is wrong, captureScreenshot may still succeed via its internal logic — we still trust the assert on `screenshot.ok`.

## Open follow-up iter 13+

1. **gen-app territory**: add stable `data-testid="simulator-canvas"` to the SVG root in `src/components/simulator/canvas/SimulatorCanvas.jsx` (line ~3149 file). One-line change. Future selector-discovery becomes one call.
2. **gen-app territory**: confirm `simulator-api.captureScreenshot` internal selector still matches post-redesign. If broken, fix in `src/services/simulator-api.js`.
3. **gen-test territory iter 13**: when env (ELAB_API_KEY + SUPABASE_ANON_KEY) provisioned, run the spec headed against prod. Capture the JSON candidates dump. Append a "Live evidence" section to this file with the actual matched selector + bbox.
4. **B3 dependency**: `scripts/capture-real-screenshots.mjs` (this iter ATOM-S12-B3) reuses the same selector logic to capture 20 PNGs. If iter 12 ships placeholder PNGs, iter 13 unblocks via the same canvas-discovery code path.

## CoV

- File modified: `tests/e2e/02-vision-flow.spec.js` (insert ~50 LOC diagnostic + selector picker before `screenshot = await page.evaluate`).
- Spec assertions: UNCHANGED (no behavior change).
- Run gate: spec still skipped without ELAB_API_KEY + SUPABASE_ANON_KEY (iter 6 hard rule preserved).
- Vitest impact: ZERO (Playwright spec, separate runner).
- Build impact: ZERO (test-only file).

## Honest caveats

- Spec NOT executed against prod this iter (env not present in this agent shell). Selector discovery is a passive enhancement: when run, it WILL surface candidates. When NOT run, it changes nothing.
- The "largest bbox svg" fallback may pick the wrong svg if there are multiple large svg roots (e.g. UNLIM mascot + simulator canvas both visible). Iter 13 should prefer the `data-testid` route.
- captureScreenshot internal logic in `src/services/simulator-api.js` not modified this iter (gen-app territory). If iter 11 root cause was inside that function, this fix only assists rendering settle — not capture itself. Honest gating.
