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
  const length = Math.hypot(X - x, Y - y);
  if (length < 0.1) return '';
  const a = Math.atan2(Y - y, X - x),
    head = Math.min(9, 0.3 * length);
  return path(
    `M${x} ${y} L${X} ${Y} m${-head * Math.cos(a - 0.45)} ${-head * Math.sin(a - 0.45)} L${X} ${Y} l${-head * Math.cos(a + 0.45)} ${-head * Math.sin(a + 0.45)}`,
    c,
  );
}
function capillaryPlate(p, s, t, stage, equations) {
  const left = 58,
    right = 398,
    axis = 98;
  const radius = 17 * p.r;
  const y = (ratio) => axis - radius * ratio;
  const x = (ratio, initial = 0) => left + (right - left) * equations.tracerFraction(s, ratio, t, initial);
  const description = stage >= 1 && s.laminar
    ? 'Le due pareti delimitano il capillare. La curva descrive il profilo di velocità. Un tracciante scorre alla quota della sonda.'
    : 'Le due pareti delimitano il capillare. Il segmento verticale indica il raggio interno.';
  let plate =
    '<desc>' + description + '</desc>' +
    '<g role="group" aria-label="Pareti del capillare">' +
    path(`M${left} ${y(1)} H${right} M${left} ${y(-1)} H${right}`, green) +
    '</g>' +
    path(`M33 ${y(1)} h10 M38 ${y(1)} V${axis} M33 ${axis} h10`, dark) +
    label(24, 19, 'R = ' + n(p.r) + ' mm') +
    label(294, 19, 'L = ' + n(p.length) + ' cm');
  if (stage < 0) return plate;
  if (!s.laminar) return plate + label(26, 188, 'Re = ' + n(s.re) + ' · fuori dal regime laminare');
  if (stage < 1) return plate;

  const vmax = equations.velocity(s, 0);
  const profileX = (ratio) => 215 + (82 * equations.velocity(s, ratio)) / vmax;
  plate += label(144, 19, 'Profilo v(r)/v(0)');
  plate += path(
    Array.from({ length: 33 }, (_, i) => {
      const h = i / 16 - 1;
      return (i ? 'L' : 'M') + profileX(h) + ' ' + y(h);
    }).join(' '),
    purple,
  );
  for (const h of [-0.75, 0, 0.75]) plate += arrow(215, y(h), profileX(h), y(h), purple);
  const probe = p.probe;
  plate += path(`M${left} ${y(probe)} H${right}`, red, true);
  for (const h of [-1, -0.5, 0, 0.8, 1]) {
    for (const initial of [0.12, 0.46, 0.79]) {
      plate += dot(x(h, initial), y(h), h === 0 ? gold : green, Math.min(3.5, radius * 0.17));
    }
  }
  return (
    plate +
    '<g role="group" aria-label="Tracciante della sonda">' +
    dot(x(probe), y(probe), red, 5) +
    '</g>' +
    label(25, 188, 'Sonda · r/R = ' + n(probe) + ' · v = ' + n(equations.velocity(s, probe)) + ' m/s') +
    label(313, 188, 'v(R) = 0 m/s')
  );
}
export function drawing(model, p, s, t, stage, title, projection = 'top', equations) {
  let d = '';
  const reveal = stage >= 0;
  if (model === 'piano') {
    const x = 295,
      y = 100,
      dx = 75 * Math.cos(s.theta),
      dy = 75 * Math.sin(s.theta),
      left = [x - dx, y + dy],
      right = [x + dx, y - dy],
      base = left[1] + 10;
    // The rail and vectors share one tangent/normal basis; the left column is reserved for labels.
    d = path(`M${left[0]} ${left[1]} L${right[0]} ${right[1]} V${base} H${left[0]} Z`) + dot(x, y, green, 10);
    if (reveal) {
      // A common normalized force scale preserves N/P and both weight components.
      const forceScale = 42 / s.weight;
      d +=
        arrow(x, y, x, y + forceScale * s.weight, red) +
        arrow(x, y, x - forceScale * s.normal * Math.sin(s.theta), y - forceScale * s.normal * Math.cos(s.theta), green) +
        label(12, 27, 'Peso ↓') +
        label(12, 49, 'Normale ⟂ al piano') +
        label(12, 87, 'Lunghezze riferite') +
        label(12, 107, 'al peso') +
        label(12, 127, '(scala comune)');
      if (stage >= 1)
        d += arrow(
          x,
          y,
          x + forceScale * s.parallel * Math.cos(s.theta),
          y - forceScale * s.parallel * Math.sin(s.theta),
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
      const [x, y] = pt(t),
        vh = Math.hypot(s.vx, s.vz),
        vv = s.u - 9.81 * t,
        gain = 35 / p.speed;
      if (stage >= 1) d += arrow(x, y, x + vh * gain, y - vv * gain, green) + arrow(x, y, x, y + 24, red);
      if (stage >= 2) d += path('M' + x + ' ' + y + ' h' + vh * gain + ' v' + -vv * gain, purple, true);
      d += label(105, 24, 't = ' + n(t) + ' s');
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
    d = capillaryPlate(p, s, t, stage, equations);
  } else if (model === 'gas') {
    const volume = s.instant?.V ?? p.V;
    const y = 150 - 18 * volume;
    d =
      path('M124 28 V156 H299 V28') +
      box(126, y, 171, 155 - y, '#ebcf99') +
      box(123, y - 6, 177, 7, '#897693') +
      path(`M211 ${y - 6} V20`);
    if (reveal)
      d +=
        path('M102 ' + (150 - 18 * s.start) + ' H124', green) +
        path('M299 ' + (150 - 18 * s.end) + ' H324', purple) +
        label(158, 145, 'V = ' + n(volume) + ' L');
  } else if (model === 'induzione') {
    const q = s.instant,
      gap = s.closed ? 0 : 13;
    d =
      path('M305 ' + (99 - gap) + ' A84 64 0 1 0 305 ' + (100 + gap), gold) +
      label(18, 25, 'Vista dalla punta di +n');
    if (reveal) {
      const symbol = Math.abs(q.B) < 1e-9 ? '0' : q.B > 0 ? '⊙' : '⊗';
      for (const x of [195, 225, 255]) for (const y of [84, 108, 132]) d += label(x, y, symbol);
      d += label(15, 175, 'B = ' + n(q.B) + ' T') + label(288, 175, s.closed ? 'Chiuso · 5 Ω' : 'Aperto');
      if (s.closed && s.current)
        d += arrow(222 + Math.sign(s.current) * 15, 36, 222 - Math.sign(s.current) * 15, 36, red);
      d += label(307, 59, 'ε = ' + n(q.emf) + ' V');
    }
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
  } else if (model === 'onde' && projection !== 'top') {
    const baseline = 102;
    d =
      path('M30 40 V155 M30 102 H405') + label(8, 23, 'y (mm)') + label(4, 51, '+4') + label(6, 156, '−4');
    if (projection === 'section') {
      const poly = (fn, color) =>
        path(
          Array.from({ length: 91 }, (_, i) => {
            const x = -1.2 + (i * 2.4) / 90;
            return (i ? 'L' : 'M') + (30 + i * 4.1) + ' ' + (baseline - 13000 * fn(x));
          }).join(' '),
          color,
        );
      d += poly((x) => equations.displacement(s, equations.coefficients(s, x, p.z), t), green);
      d +=
        dot(30 + ((p.x + 1.2) * 369) / 2.4, baseline - 13000 * s.instant.y, red) +
        label(254, 181, 'x (m) · z = ' + n(p.z) + ' m');
    } else {
      for (const [i, value] of [s.instant.first, s.instant.second, s.instant.y].entries()) {
        const x = 100 + i * 100,
          y = baseline - 13000 * value;
        d +=
          arrow(x, baseline, x, y, [gold, purple, green][i]) +
          dot(x, y, [gold, purple, green][i], 4) +
          label(x - 18, 180, ['S₁', 'S₂', 'Somma'][i]);
      }
    }
  } else {
    const k = 105,
      px = 212 + p.x * k,
      pz = 97 + p.z * k;
    for (const [i, x] of [212 - (p.d * k) / 2, 212 + (p.d * k) / 2].entries()) {
      d += dot(x, 97, i ? purple : gold) + label(x - 10, 81, 'S' + (i + 1));
      if (reveal) {
        const phase = (((t * p.f - (i ? p.phase / 360 : 0)) % 1) + 1) % 1;
        const corner = Math.hypot(Math.max(x, 430 - x), 101);
        for (let j = 0; (j + phase) * s.lambda * k <= corner; j++) {
          const r = (j + phase) * s.lambda * k;
          d += `<circle cx="${x}" cy="97" r="${r}" fill="none" stroke="${i ? purple : gold}" opacity=".48"/>`;
        }
        d += path(`M${x} 97 L${px} ${pz}`, green, true);
      }
    }
    d += dot(px, pz, green) + label(px + 7, pz - 4, 'P');
    if (reveal) d += label(15, 185, 'Spostamento in P · ' + n(1000 * (s.instant?.y ?? 0)) + ' mm');
  }
  return `<svg class="bench-diagram" viewBox="0 0 430 198" role="img" aria-label="${esc('Schema di ' + title)}">${d}</svg>`;
}

// Compact constructions beside the derivation. All distances and signed quantities follow the same sample as the main instrument.
const circle = (x, y, r, color) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="2"/>`;
const trace = (X, Y, color) =>
  path(
    Array.from({ length: 61 }, (_, i) => (i ? 'L' : 'M') + X(i / 60) + ' ' + Y(i / 60)).join(' '),
    color,
  );

function lancioDisegno(i, p, s, t, q) {
  if (i === 0) {
    const x = 48 + 25 * s.vx,
      z = 73 - 11 * s.vz;
    return (
      path('M48 18 V100 M34 73 H212') +
      label(195, 94, 'x') +
      label(22, 22, 'z') +
      path(`M${x} 73 V${z} H48`, gold, true) +
      arrow(48, 73, x, z, green) +
      label(225, 47, 'vₓ = ' + n(s.vx) + ' m/s') +
      label(225, 78, 'v𝓏 = ' + n(s.vz) + ' m/s')
    );
  }
  const f = s.duration ? t / s.duration : 0,
    X = (u) => 45 + 235 * u;
  if (i === 1 || i === 2) {
    const Y = (u) => 59 - 38 * (s.u ? 1 - 2 * u : 0);
    let area = '';
    if (i === 2)
      for (const [a, b, color] of [
        [0, Math.min(0.5, f), '#a5cbbc'],
        [0.5, f, '#e6bbb2'],
      ]) {
        if (b > a)
          area += `<path d="M${X(a)} 59 L${X(a)} ${Y(a)} L${X(b)} ${Y(b)} L${X(b)} 59 Z" fill="${color}"/>`;
      }
    return (
      area +
      path('M45 12 V105 M45 59 H284') +
      path(`M45 ${Y(0)} L280 ${Y(1)}`, purple) +
      dot(X(f), Y(f), green) +
      label(6, 14, 'vᵧ') +
      label(205, 105, 't (s)') +
      label(294, 45, i === 1 ? 'vᵧ (m/s)' : 'Area netta') +
      label(294, 74, i === 1 ? n(q.vy) + ' m/s' : n(q.y) + ' m')
    );
  }
  const Y = (u) => 90 - (s.peak ? 64 * 4 * u * (1 - u) : 0);
  return (
    path('M45 16 V90 H284') +
    trace(X, Y, purple) +
    dot(X(f), Y(f), green) +
    dot(X(0.5), Y(0.5), gold, 4) +
    label(5, 16, 'y (m)') +
    label(40, 112, '0') +
    label(134, 112, 'T/2') +
    label(267, 112, 'T') +
    label(298, 61, 'T = ' + n(s.duration) + ' s')
  );
}
function flussoDisegno(i, p, s, t, q, equations) {
  if (!s.laminar) return label(22, 55, 'Re = ' + n(s.re)) + label(22, 82, 'Profilo laminare fuori dominio');
  if (i === 0) {
    const distance = (h) => 48 + 213 * equations.tracerFraction(s, h, t);
    return (
      path('M48 24 H266 M48 101 H266') +
      path('M48 63 H266', green, true) +
      dot(distance(0), 63, green) +
      dot(distance(p.probe), 63 - 39 * p.probe, red) +
      label(277, 54, 'asse') +
      label(277, 80, 'r/R = ' + n(p.probe))
    );
  }
  if (i === 1) {
    const X = (u) => 42 + 209 * u,
      Y = (u) => 90 - 64 * (1 - u * u);
    return (
      path('M42 15 V90 H265') +
      trace(X, Y, purple) +
      dot(X(p.probe), Y(p.probe), red) +
      label(4, 18, 'v') +
      label(42, 113, '0') +
      label(218, 113, 'r/R = 1') +
      label(279, 50, 'v(r) (m/s)') +
      label(279, 81, n(2 * s.mean * (1 - p.probe ** 2)))
    );
  }
  if (i === 2)
    return (
      circle(85, 61, 44, dark) +
      circle(85, 61, 27, purple) +
      circle(85, 61, 32, purple) +
      arrow(85, 61, 129, 61, gold) +
      label(150, 53, 'Anello di area 2πr dr') +
      label(150, 82, 'dQ = v(r) × 2πr dr')
    );
  return (
    arrow(40, 66, 364, 66, green) +
    label(34, 42, p.mode === 'pressure' ? 'Δp fissata' : 'Q fissata') +
    label(183, 42, 'R varia') +
    label(273, 98, p.mode === 'pressure' ? 'Q ∝ R⁴' : 'Δp ∝ 1/R⁴')
  );
}
function pistoneDisegno(i, p, s, t, q) {
  if (i === 0) {
    const Y = (v) => 98 - 13 * v;
    return (
      path('M40 14 V98 H147 V14') +
      box(41, Y(q.V), 104, 98 - Y(q.V), '#d8c697') +
      path(`M36 ${Y(s.start)} H63`, green) +
      path(`M131 ${Y(s.end)} H158`, purple) +
      label(178, 47, 'Vᵢ = ' + n(s.start) + ' L') +
      label(178, 74, 'V(t) = ' + n(q.V) + ' L') +
      label(178, 101, 'Vf = ' + n(s.end) + ' L')
    );
  }
  if (i === 1 || i === 2) {
    const lo = Math.min(s.start, s.end) * 0.85,
      hi = Math.max(s.start, s.end) * 1.12;
    const X = (v) => 47 + (215 * (v - lo)) / (hi - lo),
      Y = (v) => 95 - (78 * lo) / v;
    const area = Array.from({ length: 41 }, (_, j) => {
      const v = s.start + ((q.V - s.start) * j) / 40;
      return `L${X(v)} ${Y(v)}`;
    }).join(' ');
    return (
      (i === 2 ? `<path d="M${X(s.start)} 95 ${area} L${X(q.V)} 95 Z" fill="#dbcda1"/>` : '') +
      path('M47 15 V95 H268') +
      trace(
        (u) => X(lo + (hi - lo) * u),
        (u) => Y(lo + (hi - lo) * u),
        purple,
      ) +
      dot(X(s.start), Y(s.start), green, 4) +
      dot(X(q.V), Y(q.V), red) +
      label(3, 18, 'p (kPa)') +
      label(214, 114, 'V (L)') +
      label(277, 49, i === 1 ? 'Pressione' : 'Lavoro del gas') +
      label(277, 76, i === 1 ? n(q.pressure) + ' kPa' : n(q.work) + ' J')
    );
  }
  const x = 165,
    dx = 82 * Math.sign(q.work);
  return (
    box(130, 43, 70, 43, '#dbe8e1') +
    label(148, 70, 'gas') +
    arrow(x - 85 - dx / 2, 61, x - 85 + dx / 2, 61, gold) +
    arrow(x + 85 - dx / 2, 61, x + 85 + dx / 2, 61, green) +
    label(24, 29, 'Q = ' + n(q.work) + ' J') +
    label(217, 29, 'W = ' + n(q.work) + ' J') +
    label(143, 111, 'ΔU = 0 J')
  );
}
function bobinaDisegno(i, p, s, t, q) {
  if (i === 0 || i === 1) {
    const count = i === 0 ? 1 : 10;
    let coils = '';
    for (let j = 0; j < count; j++)
      coils += `<ellipse cx="91" cy="${72 - j * 3}" rx="53" ry="15" fill="none" stroke="${purple}" stroke-width="1.6"/>`;
    const norm = Math.max(0.5, Math.abs(s.middle - s.x), Math.abs(s.middle + s.x));
    return (
      coils +
      arrow(91, 61 + (34 * q.B) / norm, 91, 61 - (34 * q.B) / norm, green) +
      label(163, 48, i === 0 ? 'Una spira · A = 0,05 m²' : 'Dieci spire con la stessa normale') +
      label(163, 80, (i === 0 ? 'Φ = ' + n(q.flux / 10) : 'NΦ = ' + n(q.flux)) + ' Wb')
    );
  }
  if (i === 2) {
    const first = 0.5 * (s.middle - s.x),
      end = 0.5 * (s.middle + s.x),
      max = Math.max(0.25, Math.abs(first), Math.abs(end)),
      Y = (v) => 61 - (41 * v) / max;
    return (
      path('M50 13 V106 M50 61 H256') +
      path(`M50 ${Y(first)} L250 ${Y(end)}`, purple) +
      path(`M50 ${Y(first)} H250 V${Y(end)}`, gold, true) +
      dot(50 + 100 * t, Y(q.flux), green) +
      label(2, 17, 'NΦ') +
      label(47, 115, '0 s') +
      label(226, 115, '2 s') +
      label(268, 47, 'Δ(NΦ) / Δt') +
      label(268, 77, n(0.5 * s.x) + ' Wb/s')
    );
  }
  return (
    path('M101 32 H40 V90 H204 V32 H162') +
    circle(103, 32, 3, dark) +
    circle(162, 32, 3, dark) +
    path(s.closed ? 'M103 32 H162' : 'M103 32 L153 13', green) +
    (s.closed
      ? arrow(q.current > 0 ? 71 : 91, 90, q.current > 0 ? 91 : 71, 90, q.current ? red : 'transparent')
      : '') +
    label(224, 46, s.closed ? 'Chiuso · 5 Ω' : 'Aperto') +
    label(224, 72, 'ε = ' + n(q.emf) + ' V') +
    label(224, 98, 'I = ' + n(q.current) + ' A')
  );
}
function ondeDisegno(i, p, s, t, q, equations) {
  if (i === 0) {
    const k = s.k,
      x = (u) => 43 + 225 * u,
      y = (u) => 63 - 27 * Math.cos(k * u * 2 * s.lambda - s.omega * t);
    return (
      path('M43 63 H278') +
      trace(x, y, purple) +
      arrow(90, 22, 175, 22, green) +
      label(281, 45, 'λ = ' + n(s.lambda) + ' m') +
      label(281, 76, 'T = ' + n(1 / p.f) + ' s')
    );
  }
  if (i === 1) {
    const X = (x) => 142 + x * 75,
      Y = (z) => 61 - z * 52;
    return (
      path(`M${X(-p.d / 2)} 61 L${X(p.x)} ${Y(p.z)}`, gold) +
      path(`M${X(p.d / 2)} 61 L${X(p.x)} ${Y(p.z)}`, purple) +
      dot(X(p.x), Y(p.z), green) +
      label(X(p.x) + 7, Y(p.z), 'P') +
      label(X(-p.d / 2) - 9, 88, 'S₁') +
      label(X(p.d / 2) - 9, 88, 'S₂') +
      label(261, 49, 'r₁ = ' + n(s.probe.r1) + ' m') +
      label(261, 80, 'r₂ = ' + n(s.probe.r2) + ' m')
    );
  }
  if (i === 2) {
    let d = path('M36 62 H366');
    for (const [j, v] of [q.first, q.second, q.y].entries()) {
      const x = 85 + j * 108,
        y = 62 - 9500 * v;
      d +=
        arrow(x, 62, x, y, [gold, purple, green][j]) +
        dot(x, y, [gold, purple, green][j], 3) +
        label(x - 13, 113, ['y₁', 'y₂', 'Σy'][j]);
    }
    return d + label(5, 18, 'y (mm)');
  }
  const X = (u) => 42 + 220 * u,
    Y = (u) => 64 - 8500 * equations.displacement(s, s.probe, u / p.f);
  return (
    path('M42 14 V104 M42 64 H266') +
    trace(X, Y, green) +
    dot(X((t * p.f) % 1), Y((t * p.f) % 1), purple) +
    label(3, 17, 'y (mm)') +
    label(194, 114, '1 periodo') +
    label(280, 49, 'Ampiezza') +
    label(280, 79, n(1000 * s.envelope) + ' mm')
  );
}
const disegni = {
  volo: lancioDisegno,
  tubo: flussoDisegno,
  gas: pistoneDisegno,
  induzione: bobinaDisegno,
  onde: ondeDisegno,
};
export function disegnoPasso(key, index, p, s, t, q, title, equations) {
  return `<svg viewBox="0 0 430 122" role="img" aria-label="${esc(title)}">${disegni[key](index, p, s, t, q, equations)}</svg>`;
}
