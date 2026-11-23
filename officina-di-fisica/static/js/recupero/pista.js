import { meccanica } from '../banchi/voci/apparati/meccanica.js';
import { scenaMobile, tavolo } from '../banchi/voci/geometria.js';

export const firma = (n) => (n < 0 ? '−' : n > 0 ? '+' : '') + Math.abs(n).toLocaleString('it-IT');

function scala(model) {
  const extent = model.max - model.min || 1;
  const step = 10 ** Math.ceil(Math.log10(extent / 18));
  const min = Math.floor(model.min / step) * step - step;
  const max = Math.ceil(model.max / step) * step + step;
  const marks = [];
  for (let i = 0; i <= Math.round((max - min) / step); i++) {
    const value = min + step * i;
    const label = value !== model.origin && (value === model.min || value === model.max);
    marks.push({ value, major: label || value === model.origin, label: label ? firma(value) + ' m' : '' });
  }
  return { min, max, marks };
}

// An orthographic ruler keeps the zero and the tick labels large on a narrow screen.
function pistaPiana(axis, model, sample, label) {
  const project = (x) => 17 + (286 * (x - axis.min)) / (axis.max - axis.min);
  const start = project(model.origin),
    car = project(sample.x);
  const turn = project(model.at(Math.min(sample.time, model.boundaries[1])).x);
  const arrow = (from, to, y, ink) => {
    if (from === to) return '';
    const tip = Math.sign(to - from) * Math.min(7, Math.abs(to - from) / 2);
    return `<path d="M ${from} ${y} H ${to} m ${-tip} -3.5 L ${to} ${y} l ${-tip} 3.5" stroke="${ink}" stroke-width="2.5" fill="none"/>`;
  };
  const ticks = axis.marks.map((mark) => {
    const x = project(mark.value);
    return `<path d="M ${x} 79 v ${mark.major ? 9 : 5}" stroke="currentColor"/>
      ${mark.label ? `<text x="${x}" y="105">${mark.label}</text>` : ''}`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" class="campo-disegno" role="img" aria-label="${label}" viewBox="0 0 320 150">
    <text x="${start}" y="23">Via · ${firma(model.origin)} m</text>
    <path d="M ${start} 29 V 89" stroke="currentColor" stroke-dasharray="3 3"/>
    <path d="M 17 76 H 303" stroke="currentColor" stroke-width="3"/>${ticks.join('')}
    <g transform="translate(${car} 0)"><rect x="-12" y="51" width="24" height="17" rx="2" fill="#18675e"/>
      <circle cx="-7" cy="71" r="4" fill="currentColor"/><circle cx="7" cy="71" r="4" fill="currentColor"/></g>
    ${arrow(start, turn, 121, '#18675e')}${arrow(turn, car, 139, '#563d87')}
  </svg>`;
}

export function montaPista(root, model, initialTime, returnToClock) {
  const canvas = root.querySelector('canvas');
  const flat = root.querySelector('[data-pista-piana]');
  const desc = root.querySelector('[data-vista-pista]');
  const axis = scala(model);
  let time = initialTime,
    gpu = null,
    in3D = false,
    closed = false;
  function elements(t) {
    const sample = model.at(t),
      b = tavolo(1);
    meccanica.binario(b, {
      ...axis,
      pos: sample.x,
      inizio: model.origin,
      freccia: Math.sign(sample.velocity),
      turn: model.at(Math.min(t, model.boundaries[1])).x,
      startLabel: 'Via · ' + firma(model.origin) + ' m',
    });
    return b.elementi;
  }
  function draw(t) {
    time = t;
    const point = model.at(t);
    const label = 'Carrello a ' + firma(point.x) + ' m al secondo ' + t + '.';
    if (in3D) {
      canvas.setAttribute('aria-label', label + ' Frecce per ruotare, Home per ripristinare la vista.');
      gpu.frame(t);
    } else flat.innerHTML = pistaPiana(axis, model, point, label);
  }
  function flatView() {
    const hadFocus = document.activeElement === canvas;
    in3D = false;
    gpu?.visible(false);
    canvas.hidden = true;
    flat.hidden = false;
    desc.textContent =
      'Pista in due dimensioni. Ogni tacca vale ' +
      (axis.marks[1].value - axis.min) +
      ' m. Le frecce seguono l’andata e il ritorno.';
    draw(time);
    if (hadFocus) returnToClock();
  }
  function show3D() {
    if (closed || !root.isConnected) return;
    in3D = true;
    canvas.hidden = false;
    flat.hidden = true;
    gpu.visible(true);
    desc.textContent =
      'Pista in 3D. Ogni tacca vale ' +
      (axis.marks[1].value - axis.min) +
      ' m. Usa le frecce sulla pista per ruotarla.';
    draw(time);
  }
  flatView();
  async function start3D() {
    let gl;
    try {
      const { openScene } = await import('../banchi/scena.js');
      if (closed || !root.isConnected) return;
      gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'low-power' });
      if (!gl) return;
      canvas.hidden = false;
      gpu = openScene(
        canvas,
        { width: 7.5, height: 3.15, target: [0, 0.45, 0], eye: [2, 3.5, 9] },
        flatView,
        gl,
        show3D,
      );
      gpu.gestures(false);
      gpu.rebuild((tools) => scenaMobile(tools, elements));
      show3D();
    } catch {
      if (gpu) gpu.dispose();
      else gl?.getExtension('WEBGL_lose_context')?.loseContext();
      gpu = null;
      if (!closed) flatView();
    }
  }
  start3D();
  return {
    draw,
    dispose() {
      closed = true;
      gpu?.dispose();
      gpu = null;
    },
  };
}
