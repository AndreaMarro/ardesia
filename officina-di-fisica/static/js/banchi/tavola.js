import { esc } from '../ui.js';
import { n } from './misure.js';
const purple = '#623eaa',
  green = '#157474',
  red = '#ae4745',
  dark = '#343044',
  gold = '#b07828';
const path = (d, c = dark, dash = false) =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="2.9" ${dash ? 'stroke-dasharray="6 4"' : ''}/>`;
const dot = (x, y, c = purple, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const label = (x, y, t) => `<text x="${x}" y="${y}">${esc(t)}</text>`;
const box = (x, y, w, h, c) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${dark}"/>`;
function arrow(x, y, X, Y, c = dark) {
  if (Math.hypot(X - x, Y - y) < 0.1) return '';
  const a = Math.atan2(Y - y, X - x);
  return path(
    `M${x} ${y} L${X} ${Y} m${-9 * Math.cos(a - 0.45)} ${-9 * Math.sin(a - 0.45)} L${X} ${Y} l${-9 * Math.cos(a + 0.45)} ${-9 * Math.sin(a + 0.45)}`,
    c,
  );
}
export function drawing(model, p, s, t, stage, title) {
  let d = '';
  const reveal = stage >= 0;
  if (model === 'piano') {
    const dx = 140 * Math.cos(s.theta),
      dy = 140 * Math.sin(s.theta),
      x = 85 + dx,
      y = 159 - dy;
    d = path(`M75 160 L${85 + 2 * dx} ${159 - 2 * dy} V164 H75`) + dot(x, y, green, 10);
    if (reveal) {
      d +=
        arrow(x, y, x, y + 42, red) +
        arrow(x, y, x - 40 * Math.sin(s.theta), y - 40 * Math.cos(s.theta), green) +
        label(22, 27, 'Peso ↓ · normale ⟂ al piano');
      if (stage >= 1)
        d += arrow(
          x,
          y,
          x - 48 * Math.sin(s.theta) * Math.cos(s.theta),
          y + 48 * Math.sin(s.theta) ** 2,
          purple,
        );
    }
  } else if (model === 'volo') {
    d = path('M56 25 V157 H399') + label(18, 29, 'y (m)') + label(288, 184, 'orizzontale (m)');
    const k = Math.min(314 / Math.max(0.001, s.range), 114 / Math.max(0.001, s.peak)),
      pt = (u) => [
        60 + k * s.range * (s.duration ? u / s.duration : 0),
        154 - k * (s.u * u - (9.81 * u * u) / 2),
      ];
    if (reveal) {
      d +=
        path(
          Array.from({ length: 55 }, (_, i) => (i ? 'L' : 'M') + pt((s.duration * i) / 54).join(' ')).join(
            '',
          ),
          purple,
        ) + dot(...pt(t), gold, 7);
    }
  } else if (model === 'stevino') {
    const y = 45 + (105 * p.h) / 2;
    d = box(79, 45, 250, 105, '#afd9d7') + path('M79 31 V150 H329 V31') + label(84, 34, 'superficie');
    if (reveal)
      d +=
        dot(151, y, gold) +
        label(132, y - 7, 'A') +
        dot(279, y, purple) +
        label(286, y - 5, 'B') +
        path(`M151 ${y} H279`, green, true) +
        label(82, 179, 'h = ' + n(p.h) + ' m');
  } else if (model === 'tubo') {
    d = path('M38 52 H399 M38 141 H399', green) + label(35, 34, 'parete · asse orizzontale');
    if (reveal && s.laminar)
      for (let i = -4; i <= 4; i++) {
        const v = 1 - (i / 4) ** 2;
        d += arrow(101, 96 + i * 10, 101 + 180 * v, 96 + i * 10, purple);
      }
    d += label(44, 174, reveal && s.laminar ? 'v = 0 alla parete' : 'sezione longitudinale');
  } else if (model === 'gas') {
    const y = 150 - 18 * p.V;
    d =
      path('M124 28 V156 H299 V28') +
      box(126, y, 171, 155 - y, '#ebcf99') +
      box(123, y - 6, 177, 7, '#897693') +
      path(`M211 ${y - 6} V20`);
    if (reveal) d += label(158, 145, 'V = ' + n(p.V) + ' L');
  } else if (model === 'calore') {
    const temp = (v) => 'hsl(' + Math.round(210 - 2.1 * v) + ' 45% 67%)';
    d =
      box(68, 64, 38, 69, temp(p.left)) +
      box(106, 75, 210, 48, '#e4d6b6') +
      box(316, 64, 38, 69, temp(p.right)) +
      label(46, 48, 'T₁ ' + p.left + ' °C') +
      label(292, 48, 'T₂ ' + p.right + ' °C');
    if (reveal && s.power) d += arrow(s.power > 0 ? 146 : 274, 99, s.power > 0 ? 274 : 146, 99, green);
    d += label(133, 165, 'L = ' + n(p.L) + ' cm');
  } else if (model === 'campo') {
    const map = ([x, y]) => [212 + 54 * x, 98 - 32 * y];
    d = path('M62 98 H368 M212 22 V174', '#a49ba5');
    for (const [i, a] of s.sources.entries())
      if (a.q) {
        const [x, y] = map(a.pos);
        d += dot(x, y, a.q > 0 ? red : purple, 9) + label(x + 9, y - 10, 'q' + (i + 1));
      }
    const [x, y] = map(s.probe);
    d += dot(x, y, gold) + label(x - 9, y - 11, 'P');
    if (reveal && s.reading?.magnitude) {
      const E = s.reading.E;
      d += arrow(x, y, x + (50 * E[0]) / s.reading.magnitude, y - (50 * E[1]) / s.reading.magnitude, green);
    }
    d += label(43, 185, 'Proiezione x–y · Ez si legge nei passaggi');
  } else if (model === 'circuito') {
    d =
      path('M188 154 H61 V48 H135 M294 48 H357 V154 H235') +
      path('M201 135 V172 M222 144 V165 M188 154 H201 M222 154 H235') +
      label(170, 184, '+     −');
    if (p.mode === 'Serie')
      d +=
        box(135, 37, 64, 21, '#c6b5e4') +
        path('M199 48 H231') +
        box(231, 37, 63, 21, '#eccb95') +
        label(147, 30, 'R₁') +
        label(244, 30, 'R₂');
    else
      d +=
        path('M135 48 H177 M246 48 H294 M61 99 H177 M246 99 H357') +
        box(177, 37, 69, 21, '#c6b5e4') +
        box(177, 88, 69, 21, '#eccb95') +
        label(184, 30, 'R₁') +
        label(185, 82, 'R₂');
    if (reveal && p.U) d += arrow(84, 48, 120, 48, red);
  } else if (model === 'lente') {
    const k = 2.7,
      O = 188,
      y = 103,
      H = 22;
    d =
      path('M30 103 H407', '#998b95') +
      path('M188 37 Q174 103 188 158 Q202 103 188 37', purple) +
      arrow(O - p.p * k, y, O - p.p * k, y - H, gold) +
      path(`M${O + p.screen * k} 37 V165`, green);
    d += dot(O + p.f * k, y, purple, 3) + label(O + p.f * k, y + 22, 'F′');
    if (stage >= 1) {
      d +=
        path(`M${O - p.p * k} ${y - H} H${O} l${p.screen * k} ${(H * p.screen) / p.f}`, gold) +
        path(`M${O - p.p * k} ${y - H} L${O + p.screen * k} ${y + (H * p.screen) / p.p}`, green);
    }
    if (stage >= 2 && s.q < 0)
      d += path(`M${O} ${y - H} L${O + s.q * k} ${y - s.m * H} L${O} ${y}`, purple, true);
  } else {
    const k = 105,
      px = 212 + p.x * k,
      pz = 97 + p.z * k;
    for (const [i, x] of [212 - (p.d * k) / 2, 212 + (p.d * k) / 2].entries()) {
      d += dot(x, 97, i ? purple : gold) + label(x - 10, 81, 'S' + (i + 1));
      if (reveal) {
        for (let j = 1; j <= 4; j++) {
          const r = (j + ((((t * p.f - (i ? p.phase / 360 : 0)) % 1) + 1) % 1)) * s.lambda * k;
          d += `<circle cx="${x}" cy="97" r="${r}" fill="none" stroke="${i ? purple : gold}" opacity=".48"/>`;
        }
        d += path(`M${x} 97 L${px} ${pz}`, green, true);
      }
    }
    d += dot(px, pz, green) + label(px + 7, pz - 4, 'P');
  }
  return `<svg class="bench-diagram" viewBox="0 0 430 198" role="img" aria-label="${esc('Schema di ' + title)}"><g>${d}</g></svg>`;
}
