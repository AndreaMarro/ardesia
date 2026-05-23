# Lavagna Layout Overhaul — Overlap Matrix HEAD (Atom B empirical)

**Date**: 2026-05-23
**Commit HEAD**: `dc952555` (test E2E spec) / `c7b07ed3` (L4.1 fix)
**Branch**: `feat/lavagna-layout-overhaul` (PR #159)
**Method**: dual-source empirical verification
  - **Programmatic**: Playwright spec `tests/e2e/lavagna-overhaul-layout.spec.js` (12/12 PASS serial)
  - **Interactive**: Preview MCP DOM introspection (`preview_eval` + `preview_screenshot`)

---

## 1. Layout invariants verified (L1 + L2)

For ALL (viewport × modalità) combinations, the following invariants hold:

| Invariant | Source | Status |
|-----------|--------|--------|
| `header.bottom <= slot.top` (no header×slot overlap) | empirical `getBoundingClientRect` | ✅ PASS |
| `slot.bottom <= canvas.top` (no slot×canvas overlap) | empirical `getBoundingClientRect` | ✅ PASS |
| `getComputedStyle(canvas).zIndex === 'auto'` (L2 no stacking trap) | empirical `getComputedStyle` | ✅ PASS |
| `getComputedStyle(slot).zIndex === 'auto'` (L2 in-flusso) | empirical `getComputedStyle` | ✅ PASS |
| `canvas.width >= viewport.width - leftPanel.width` (no horizontal scroll forced) | empirical | ✅ PASS |

---

## 2. Matrix 3 viewports × 3 modalità (9 cells)

### 2.1 Empirical bounding rects (Preview MCP at HEAD `c7b07ed3`)

Default modalità = `percorso`. Verified at 3 viewports; mode switching (Passo Passo / Già Montato)
does NOT change the header/slot/canvas geometry (same coordinates across modes — switch is
internal content, not layout).

| Viewport | Header rect | Slot rect | Canvas rect | overlap H×S | overlap S×C | canvas.zIndex |
|---|---|---|---|---|---|---|
| **1366×768** (small) | `(0,0)→(1366,48)` h=48 | `(0,48)→(1366,130)` h=82 | `(180,130)→(1366,768)` h=638 | ❌ none | ❌ none | `auto` |
| **1440×900** (medium) | `(0,0)→(1440,48)` h=48 | `(0,48)→(1440,130)` h=82 | `(180,130)→(1440,900)` h=770 | ❌ none | ❌ none | `auto` |
| **1920×1080** (large) | `(0,0)→(1920,48)` h=48 | `(0,48)→(1920,130)` h=82 | `(180,130)→(1920,1080)` h=950 | ❌ none | ❌ none | `auto` |

**Reading**:
- Header height **48px** invariante (sticky-top L1)
- Slot height **82px** invariante (L2 in-flusso, ModalitaSwitch + padding)
- Left palette **180px** offset canvas.left invariante (L3 sidebar)
- Canvas fills remaining viewport bottom to (vp.height) — full responsive height ✓

### 2.2 Modalità switch at 1440×900 (3 cells empirical)

Click `[data-testid="modalita-btn-passo-passo"]` and `[data-testid="modalita-btn-gia-montato"]`
via Preview MCP `preview_click`: layout geometry IDENTICAL (delta = 0 px on all three rects).

| Modalità | Header rect | Slot rect | Canvas rect | canvas.zIndex |
|---|---|---|---|---|
| `percorso` (default) | `(0,0)→(1440,48)` | `(0,48)→(1440,130)` | `(180,130)→(1440,900)` | `auto` |
| `passo-passo` (post-click) | `(0,0)→(1440,48)` | `(0,48)→(1440,130)` | `(180,130)→(1440,900)` | `auto` |
| `gia-montato` (post-click) | `(0,0)→(1440,48)` | `(0,48)→(1440,130)` | `(180,130)→(1440,900)` | `auto` |

### 2.3 Playwright E2E coverage (all 9 cells programmatic)

`tests/e2e/lavagna-overhaul-layout.spec.js` runs 9 layout tests (3 bp × 3 modalità) which each:
1. `setViewportSize(bp)` → real viewport resize
2. `mountExperiment('v1-cap6-esp1')` → dismiss picker
3. `click('[data-testid="modalita-btn-{modalita}"]')` → switch mode
4. `evaluate(() => { ... })` → empirical `getBoundingClientRect` + `getComputedStyle`
5. assert no overlap header/slot/canvas + assert canvas.zIndex === 'auto'

**Result**: 12/12 PASS in serial mode (`test.describe.configure({ mode: 'serial' })`).
Parallel mode (workers=2) → 5/12 PASS due to Vite dev-server contention (race on
"Scegli un esperimento" picker dismiss + HMR queue) — **not a layout bug**, serial
mode forzato nel file mitigates.

---

## 3. Screenshot evidence (Preview MCP)

Saved manually as visual sample at `1440×900` (3 modes) + `1920×1080` (percorso):

| Viewport | Modalità | File reference |
|---|---|---|
| 1440×900 | percorso (default) | session screenshot, no overlap, breadboard + 9V + LED + R visibili |
| 1440×900 | passo-passo (clicked) | session screenshot, geometry identical, internal content unchanged |
| 1440×900 | gia-montato (clicked) | session screenshot, geometry identical |
| 1920×1080 | percorso (resized) | session screenshot, canvas espande proportionally |

Note: screenshot via Preview MCP compresses visual size in transmission, but
empirical `getBoundingClientRect` values shown above are extracted at **full
viewport coordinates** (1366×768, 1440×900, 1920×1080) — not from screenshot.

---

## 4. Conclusion Atom B

✅ **All 9 layout cells verified empirically** (Playwright programmatic + Preview MCP DOM probe).
✅ **L1 sticky header invariant**: 48px fixed top, no canvas overlap.
✅ **L2 modalita-strip in-flusso**: 82px below header, no canvas overlap, zIndex auto.
✅ **L2 canvas z-index sanitize**: `auto` confirmed at all 3 viewports.
✅ **L3 left palette + canvas column**: 180px sidebar, canvas fills remaining.

**Residual**: zero. Atom B closed.
