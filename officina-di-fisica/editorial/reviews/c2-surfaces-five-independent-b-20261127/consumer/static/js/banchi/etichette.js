// Coordinates refer to the centre of the text, in screen pixels.
export function posizionaEtichetta(x, y, w, h, viewW, viewH, occupied) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const cx = clamp(x, w / 2 + 2, viewW - w / 2 - 2);
  const base = clamp(y, h / 2 + 2, viewH - h / 2 - 2);
  let cy = base;
  for (const step of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5]) {
    const candidate = base + step * (h + 2);
    if (candidate < h / 2 || candidate > viewH - h / 2) continue;
    if (
      occupied.every(
        (p) => Math.abs(cx - p.x) >= (w + p.w) / 2 + 1 || Math.abs(candidate - p.y) >= (h + p.h) / 2 + 1,
      )
    ) {
      cy = candidate;
      break;
    }
  }
  const box = { x: cx, y: cy, w, h };
  occupied.push(box);
  return box;
}
