import { esc } from '../../ui.js';
const css = (c) => '#' + c.toString(16).padStart(6, '0');
// An oblique metric projection keeps depth visible without a WebGL context.
const proj = ([x, y, z]) => [229 + 47 * x + 16 * z, 156 - 44 * y + 11 * z];
const pt = (p) =>
  proj(p)
    .map((v) => v.toFixed(2))
    .join(',');
export function disegna2D(elementi, title) {
  const shapes = [],
    labels = [];
  const poly = (pts, c, opacity = 1) =>
    '<polygon points="' +
    pts.map(pt).join(' ') +
    '" fill="' +
    css(c) +
    '" fill-opacity="' +
    opacity +
    '" stroke="#554b58" stroke-width="0.65"/>';
  for (const e of elementi) {
    const c = css(e.c);
    if (e.kind === 'label') {
      const [x, y] = proj(e.p);
      labels.push(
        '<text x="' +
          x +
          '" y="' +
          y +
          '" text-anchor="middle" fill="' +
          c +
          '" style="paint-order:stroke;stroke:#fbf7e9;stroke-width:3px;font:600 12px sans-serif">' +
          esc(e.text) +
          '</text>',
      );
    } else if (e.kind === 'box') {
      const at = (x, y, z) => [x, y, z].map((u, j) => e.p[j] + (u * e.size[j]) / 2);
      for (const face of [
        [
          [1, -1, -1],
          [1, 1, -1],
          [1, 1, 1],
          [1, -1, 1],
        ],
        [
          [-1, -1, 1],
          [1, -1, 1],
          [1, 1, 1],
          [-1, 1, 1],
        ],
        [
          [-1, 1, -1],
          [1, 1, -1],
          [1, 1, 1],
          [-1, 1, 1],
        ],
      ])
        shapes.push(
          poly(
            face.map((p) => at(...p)),
            e.c,
            e.alpha,
          ),
        );
    } else if (e.kind === 'ball') {
      const [x, y] = proj(e.p);
      shapes.push(
        '<circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="' +
          Math.max(1.3, e.r * 44) +
          '" fill="' +
          c +
          '" opacity="' +
          e.alpha +
          '" stroke="#554b58" stroke-width="0.6"/>',
      );
    } else if (e.kind === 'line') {
      shapes.push(
        '<polyline points="' +
          e.points.map(pt).join(' ') +
          '" stroke="' +
          c +
          '" fill="none" stroke-width="1.7" ' +
          (e.dash ? 'stroke-dasharray="4 3"' : '') +
          '/>',
      );
    } else {
      const [x, y] = proj(e.a),
        [X, Y] = proj(e.b),
        len = Math.hypot(X - x, Y - y) || 1;
      if (e.kind === 'arrow') {
        const ux = (X - x) / len,
          uy = (Y - y) / len,
          h = Math.min(8, len / 3);
        shapes.push(
          '<path d="M' +
            x +
            ' ' +
            y +
            ' L' +
            X +
            ' ' +
            Y +
            '" fill="none" stroke="' +
            c +
            '" stroke-width="2.7"/><polygon points="' +
            [
              [X, Y],
              [X - h * ux + 0.48 * h * uy, Y - h * uy - 0.48 * h * ux],
              [X - h * ux - 0.48 * h * uy, Y - h * uy + 0.48 * h * ux],
            ]
              .map((p) => p.join(','))
              .join(' ') +
            '" fill="' +
            c +
            '"/>',
        );
      } else {
        const nx = -(Y - y) / len,
          ny = (X - x) / len,
          r = e.r * 42,
          R = e.r2 * 42;
        const coords = [
          [x + nx * r, y + ny * r],
          [X + nx * R, Y + ny * R],
          [X - nx * R, Y - ny * R],
          [x - nx * r, y - ny * r],
        ];
        shapes.push(
          '<polygon points="' +
            coords.map((p) => p.join(',')).join(' ') +
            '" fill="' +
            c +
            '" opacity="' +
            e.alpha +
            '" stroke="' +
            c +
            '" stroke-width="0.7"/>',
        );
      }
    }
  }
  return (
    '<svg class="bench-diagram" viewBox="0 0 460 215" role="img" aria-label="' +
    esc(title) +
    '"><title>' +
    esc(title) +
    '</title>' +
    shapes.join('') +
    labels.join('') +
    '</svg>'
  );
}
