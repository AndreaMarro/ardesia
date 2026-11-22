import { esc } from '../ui.js';
import { n } from './misure.js';
const colors = ['#64439b', '#087575', '#a04725', '#44404d'];
export function plot(c) {
  const finite = c.series.flatMap((s) => s.points).filter((p) => p.every(Number.isFinite));
  if (!finite.length) return '';
  let lo = Math.min(...finite.map((p) => p[0])),
    hi = Math.max(...finite.map((p) => p[0]));
  let bottom = Math.min(0, ...finite.map((p) => p[1])),
    top = Math.max(0, ...finite.map((p) => p[1]));
  if (lo === hi) hi = lo + 1;
  if (bottom === top) top = bottom + 1;
  const left = 58,
    right = 447,
    floor = 135,
    roof = 22;
  const X = (x) => left + ((x - lo) * (right - left)) / (hi - lo),
    Y = (y) => floor - ((y - bottom) * (floor - roof)) / (top - bottom);
  const txt = (x, y, s, anchor = 'middle') =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`;
  let grid = '';
  for (let i = 0; i < 3; i++) {
    const f = i / 2,
      y = bottom + (top - bottom) * f,
      x = lo + (hi - lo) * f;
    grid +=
      `<path class="bg-grid" d="M${left} ${Y(y)} H${right}"/>` +
      txt(left - 5, Y(y) + 4, n(y), 'end') +
      txt(X(x), floor + 16, n(x));
  }
  const paths = c.series
    .map((s, i) => {
      let d = '',
        pen = false;
      for (const [x, y] of s.points) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          pen = false;
          continue;
        }
        d += (pen ? 'L' : 'M') + X(x).toFixed(2) + ' ' + Y(y).toFixed(2);
        pen = true;
      }
      return `<path d="${d}" stroke="${colors[i % 4]}" stroke-width="2.6" fill="none" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    })
    .join('');
  const marker = Number.isFinite(c.at)
    ? `<line class="bench-cursor" data-lo="${lo}" data-hi="${hi}" x1="${X(c.at)}" x2="${X(c.at)}" y1="${roof}" y2="${floor}"/>`
    : '';
  return `<figure class="bench-plot"><figcaption>${esc(c.title)}</figcaption><svg viewBox="0 0 472 176" role="img" aria-label="${esc(c.title + ', ' + c.x + ', ' + c.y)}">${grid}<path d="M${left} ${roof} V${floor} H${right}" fill="none" stroke="#40394c"/>${txt(left, 13, c.y, 'start')}${txt(right, 171, c.x, 'end')}${paths}${marker}</svg><div class="curve-key">${c.series.map((s, i) => `<span><i style="background:${colors[i % 4]}"></i>${esc(s.name)}</span>`).join('')}</div></figure>`;
}
export function moveCursor(node, time) {
  for (const el of node.querySelectorAll('.bench-cursor')) {
    const x = 58 + ((time - Number(el.dataset.lo)) * 389) / (Number(el.dataset.hi) - Number(el.dataset.lo));
    el.setAttribute('x1', x);
    el.setAttribute('x2', x);
  }
}
