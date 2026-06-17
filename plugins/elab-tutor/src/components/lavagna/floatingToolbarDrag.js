/**
 * ELAB — FloatingToolbar drag math (pure, unit-testable)
 *
 * The toolbar is rendered as `position: absolute` inside a scroll/offset-parent
 * (`<main className={css.canvas}>`) that itself has margins for the left and
 * bottom panels. During drag we switch to `position: fixed` so the
 * `left`/`top` values we compute become viewport-relative — which matches
 * the `clientX`/`clientY` we get from `PointerEvent`.
 *
 * This module intentionally has zero DOM references so it can be unit-tested
 * in the project's jsdom-with-mocked-localStorage setup (where
 * getBoundingClientRect returns zeros).
 *
 * © Andrea Marro — 18/04/2026 — Ralph Loop iteration 1 (PDR v3 TASK 2)
 */

const DEFAULT_MIN_TOP = 48;

/**
 * Compute the next {x, y} position for the toolbar given the current pointer
 * and the offset captured at drag-start, clamped to the viewport so the bar
 * can never leave the screen.
 *
 * @param {object} args
 * @param {number} args.clientX   — pointer viewport X
 * @param {number} args.clientY   — pointer viewport Y
 * @param {number} args.offsetX   — pointer X within the toolbar at drag-start
 * @param {number} args.offsetY   — pointer Y within the toolbar at drag-start
 * @param {number} args.width     — toolbar width (rect.width)
 * @param {number} args.height    — toolbar height (rect.height)
 * @param {number} args.viewportW — window.innerWidth
 * @param {number} args.viewportH — window.innerHeight
 * @param {number} [args.minTop=48] — clamp the top edge so the toolbar
 *   doesn't collide with the AppHeader
 * @returns {{x:number, y:number}}
 */
export function computeNextPos({
  clientX,
  clientY,
  offsetX,
  offsetY,
  width,
  height,
  viewportW,
  viewportH,
  minTop = DEFAULT_MIN_TOP,
}) {
  const rawX = clientX - offsetX;
  const rawY = clientY - offsetY;
  const maxX = Math.max(0, viewportW - width);
  const maxY = Math.max(minTop, viewportH - height);
  return {
    x: Math.max(0, Math.min(maxX, rawX)),
    y: Math.max(minTop, Math.min(maxY, rawY)),
  };
}

/**
 * Inline style to use when the user has dragged the toolbar to a custom
 * position. `position: fixed` is the key — it makes `left/top` viewport
 * relative so our drag math stays consistent regardless of how the
 * surrounding layout moves (left panel open, bottom panel open, etc.).
 *
 * When `pos` is null we return {} so the CSS default (absolute, centered)
 * takes over.
 *
 * @param {{x:number,y:number}|null} pos
 * @returns {object} React style prop
 */
export function getPositionStyle(pos) {
  if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
    return {};
  }
  return {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    bottom: 'auto',
    right: 'auto',
    transform: 'none',
  };
}
