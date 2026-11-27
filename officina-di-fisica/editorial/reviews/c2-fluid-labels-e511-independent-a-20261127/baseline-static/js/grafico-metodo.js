import { esc } from './ui.js';
const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
export function plot(g, stage, exercise = false) {
  const left = 61,
    right = 390,
    top = 20,
    bottom = 221;
  const sx = (n) => left + (n / g.xmax) * (right - left);
  const sy = (n) => bottom - ((n - g.ymin) / (g.ymax - g.ymin)) * (bottom - top);
  const n = (v) => String(Math.round(v * 10) / 10);
  const p = (x, y) => n(sx(x)) + ',' + n(sy(y));
  const lines = [];
  for (let i = 0; i <= 4; i++) {
    const x = sx((g.xmax * i) / 4),
      y = sy(g.ymin + ((g.ymax - g.ymin) * i) / 4);
    lines.push(
      '<line class="method-grid" x1="' +
        n(x) +
        '" y1="' +
        top +
        '" x2="' +
        n(x) +
        '" y2="' +
        bottom +
        '"/>',
    );
    lines.push(
      '<line class="method-grid" x1="' +
        left +
        '" y1="' +
        n(y) +
        '" x2="' +
        right +
        '" y2="' +
        n(y) +
        '"/>',
    );
    lines.push(
      '<text class="method-tick" x="' +
        n(x) +
        '" y="' +
        (bottom + 16) +
        '" text-anchor="middle">' +
        esc(fmt((g.xmax * i) / 4)) +
        '</text>',
    );
    lines.push(
      '<text class="method-tick" x="' +
        (left - 10) +
        '" y="' +
        n(y + 3) +
        '" text-anchor="end">' +
        esc(fmt(g.ymin + ((g.ymax - g.ymin) * i) / 4)) +
        '</text>',
    );
  }
  const coords = g.wave
    ? Array.from({ length: 161 }, (_, i) => {
        const x = (g.xmax * i) / 160;
        return [x, g.ymax * Math.sin((2 * Math.PI * x) / g.wave)];
      })
    : g.type === 'fourth'
      ? Array.from({ length: 81 }, (_, i) => [(2 * i) / 80, Math.pow((2 * i) / 80, 4)])
      : g.type === 'wave'
        ? Array.from({ length: 161 }, (_, i) => [
            (8 * i) / 160,
            Math.sin((Math.PI * ((8 * i) / 160)) / 2),
          ])
        : g.samples;
  const highlights = g.samples.filter((a) => a[0] !== 0 || a[1] !== 0);
  let svg =
    '<svg class="method-plot" viewBox="0 0 420 270" role="img" aria-label="' +
    esc('Grafico: ' + g.y + ' in funzione di ' + g.x) +
    '">';
  svg += '<rect x="0" y="0" width="420" height="270" fill="transparent"/>' + lines.join('');
  svg +=
    '<line class="method-axis" x1="' +
    left +
    '" y1="' +
    bottom +
    '" x2="' +
    right +
    '" y2="' +
    bottom +
    '"/>';
  svg +=
    '<line class="method-axis" x1="' +
    left +
    '" y1="' +
    top +
    '" x2="' +
    left +
    '" y2="' +
    bottom +
    '"/>';
  svg += '<text class="method-axis-label" x="390" y="259" text-anchor="end">' + esc(g.x) + '</text>';
  svg += '<text class="method-axis-label" x="65" y="12" text-anchor="start">' + esc(g.y) + '</text>';
  if (exercise && g.ymin < 0)
    svg +=
      '<line class="method-axis" x1="' +
      left +
      '" y1="' +
      sy(0) +
      '" x2="' +
      right +
      '" y2="' +
      sy(0) +
      '"/>';
  if (exercise && stage === 3 && (g.area || g.slope)) {
    const [a, b] = g.samples;
    if (g.area) {
      const boundary = [[a[0], 0], [b[0], 0], b, a].map(([x, y]) => p(x, y)).join(' ');
      svg += '<polygon class="method-area" points="' + boundary + '"/>';
    } else {
      const corner = [b[0], a[1]];
      const legs = [a, corner, b].map(([x, y]) => p(x, y)).join(' ');
      svg += '<polyline class="work-slope" points="' + legs + '"/>';
      svg +=
        '<text class="method-tick" x="' +
        sx((a[0] + b[0]) / 2) +
        '" y="' +
        (sy(a[1]) - 8) +
        '">Δ' +
        esc(g.x.split(' ')[0]) +
        '</text>';
      svg +=
        '<text class="method-tick" x="' +
        (sx(b[0]) + 5) +
        '" y="' +
        sy((a[1] + b[1]) / 2) +
        '">Δ' +
        esc(g.y.startsWith('p −') ? 'p' : g.y.split(' ')[0]) +
        '</text>';
    }
  }
  if (exercise && stage < 3)
    svg += '<polyline class="method-curve" points="' + coords.map(([x, y]) => p(x, y)).join(' ') + '"/>';
  if (stage >= 2) {
    for (const a of highlights) {
      svg +=
        '<line class="method-guide" x1="' +
        n(sx(a[0])) +
        '" y1="' +
        n(sy(a[1])) +
        '" x2="' +
        n(sx(a[0])) +
        '" y2="' +
        bottom +
        '"/>';
      svg +=
        '<line class="method-guide" x1="' +
        left +
        '" y1="' +
        n(sy(a[1])) +
        '" x2="' +
        n(sx(a[0])) +
        '" y2="' +
        n(sy(a[1])) +
        '"/>';
      svg += '<circle class="method-dot" cx="' + n(sx(a[0])) + '" cy="' + n(sy(a[1])) + '" r="4.5"/>';
    }
  }
  if (stage >= 3) {
    if (g.shade) {
      const s = g.shade,
        x = sx(s[0]),
        width = sx(s[1]) - x,
        y = sy(s[2]);
      svg +=
        '<rect class="method-area" x="' +
        n(x) +
        '" y="' +
        n(y) +
        '" width="' +
        n(width) +
        '" height="' +
        n(bottom - y) +
        '"/>';
    }
    svg +=
      '<polyline class="method-curve" points="' + coords.map((a) => p(a[0], a[1])).join(' ') + '"/>';
    for (const a of highlights)
      svg += '<circle class="method-dot" cx="' + n(sx(a[0])) + '" cy="' + n(sy(a[1])) + '" r="4.5"/>';
  }
  return svg + '</svg>';
}
