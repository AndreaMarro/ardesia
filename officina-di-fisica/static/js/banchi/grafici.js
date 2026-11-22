import { esc } from '../ui.js';
import { n } from './misure.js';
let nextClip = 0;
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
      if (s.markers)
        return s.points
          .map(([x, y]) => `<circle cx="${X(x)}" cy="${Y(y)}" r="3.4" fill="${colors[i % 4]}"/>`)
          .join('');
      const fill = s.fillZero
        ? s.points
            .slice(1)
            .map(([x, y], j) => {
              const [prevX, prevY] = s.points[j];
              const end = Math.min(x, s.shadeUntil ?? x);
              return end <= prevX
                ? ''
                : `<rect x="${X(prevX)}" y="${Math.min(Y(0), Y(prevY))}" width="${X(end) - X(prevX)}" height="${Math.abs(Y(prevY) - Y(0))}" fill="${prevY < 0 ? '#b6504d' : '#357f79'}" opacity="0.25"/>`;
            })
            .join('')
        : '';
      return (
        fill +
        `<path d="${d}" stroke="${colors[i % 4]}" stroke-width="2.6" fill="none" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`
      );
    })
    .join('');
  let area = '';
  if (Number.isFinite(c.integralFrom)) {
    const pts = c.series[0].points;
    const from = X(c.integralFrom),
      to = X(c.at),
      id = 'lavoro-banco-' + ++nextClip;
    const line = pts.map(([x, y]) => X(x).toFixed(2) + ' ' + Y(y).toFixed(2)).join(' L');
    area =
      '<defs><clipPath id="' +
      id +
      '"><rect data-integral-start="' +
      from +
      '" x="' +
      Math.min(from, to) +
      '" width="' +
      Math.abs(to - from) +
      '" y="' +
      roof +
      '" height="' +
      (floor - roof) +
      '"/></clipPath></defs>' +
      '<path d="M' +
      X(pts[0][0]) +
      ' ' +
      Y(0) +
      ' L' +
      line +
      ' L' +
      X(pts.at(-1)[0]) +
      ' ' +
      Y(0) +
      ' Z" fill="#cdbf8c" opacity=".65" clip-path="url(#' +
      id +
      ')"/>' +
      '<circle data-state-point data-y0="' +
      Y(0) +
      '" data-scale="' +
      (floor - roof) / (top - bottom) +
      '" r="4.7" fill="#8c412c"/>';
  }
  const marker = Number.isFinite(c.at)
    ? `<line class="bench-cursor" data-track="${esc(c.track || '')}" data-lo="${lo}" data-hi="${hi}" x1="${X(c.at)}" x2="${X(c.at)}" y1="${roof}" y2="${floor}"/>`
    : '';
  return `<figure class="bench-plot"><figcaption>${esc(c.title)}</figcaption><svg viewBox="0 0 472 176" role="img" aria-label="${esc(c.title + ', ' + c.x + ', ' + c.y)}">${grid}<path d="M${left} ${roof} V${floor} H${right}" fill="none" stroke="#40394c"/>${txt(left, 13, c.y, 'start')}${txt(right, 171, c.x, 'end')}${area}${paths}${marker}</svg><div class="curve-key">${c.series.map((s, i) => `<span><i style="background:${colors[i % 4]}"></i>${esc(s.name)}</span>`).join('')}</div>${c.categories ? '<small>' + c.categories.map(esc).join(' · ') + '</small>' : ''}</figure>`;
}
export function moveCursor(node, time, track, value) {
  for (const el of node.querySelectorAll('.bench-cursor')) {
    if (track && track !== el.dataset.track) continue;
    const x = 58 + ((time - Number(el.dataset.lo)) * 389) / (Number(el.dataset.hi) - Number(el.dataset.lo));
    el.setAttribute('x1', x);
    el.setAttribute('x2', x);
    const svg = el.ownerSVGElement;
    const clip = svg.querySelector('[data-integral-start]');
    if (clip) {
      const start = Number(clip.dataset.integralStart);
      clip.setAttribute('x', Math.min(start, x));
      clip.setAttribute('width', Math.abs(start - x));
      const point = svg.querySelector('[data-state-point]');
      point.setAttribute('cx', x);
      point.setAttribute('cy', Number(point.dataset.y0) - value * Number(point.dataset.scale));
    }
  }
}
