import {
  main,
  state,
  $,
  $$,
  api,
  go,
  esc,
  link,
  listLine,
  head,
  crumb,
  titleOf,
  blocks,
  typeset,
  toast,
  on,
  button,
  gate,
  demo,
  num,
  startRun,
} from './ui.js';
import { models, parameters, modes, initial } from './models.js';
import { concentrazione, momenti, segnaMomento, sequenza, mostraBanco } from './banchi/aula.js';
import { benchRoute } from './banchi/collegamenti.js';
import { vignetta } from './anteprima.js';
const ink = '#123a39',
  red = '#a93622',
  teal = '#28716e',
  pale = '#d9dfce';
const line = (x, y, X, Y, c = ink, w = 2, d = '') =>
  `<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${c}" stroke-width="${w}" ${d}/>`;
const label = (x, y, s, anchor = 'start', color = ink, size = 16) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Georgia,serif" font-size="${size}">${esc(s)}</text>`;
const rect = (x, y, w, h, fill = 'none', stroke = ink) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const poly = (pts, c = ink, w = 2, extra = '') =>
  `<polyline points="${pts.map((a) => a.join(',')).join(' ')}" stroke="${c}" fill="none" stroke-width="${w}" ${extra}/>`;
function arrow(x, y, X, Y, c = ink, w = 2) {
  if (Math.hypot(X - x, Y - y) < 1) return '';
  return line(x, y, X, Y, c, w, `marker-end="url(#arr-${c.slice(1)})"`);
}
const defs =
  '<defs>' +
  [ink, red, teal]
    .map(
      (c) =>
        `<marker id="arr-${c.slice(1)}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 8 4 0 8 2 4z" fill="${c}"/></marker>`,
    )
    .join('') +
  '<clipPath id="plot-clip"><rect x="25" y="8" width="550" height="228"/></clipPath></defs>';
const frame = (title, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 255" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${defs}${body}</svg>`;
export function diagram(model, d, v) {
  if (model === 'C1') {
    const scale = Math.min(4, 82 / Math.max(v.n, d.F, 1)),
      cx = 300,
      cy = 124;
    let body = rect(254, 100, 92, 49, '#d7d6bf') + line(60, 150, 540, 150, ink, 3);
    for (let x = 65; x < 540; x += 12) body += line(x, 151, x - 8, 159, ink, 0.8);
    body +=
      arrow(cx, cy, cx, cy - scale * v.n, teal, 3) +
      arrow(cx, cy, cx, cy + scale * v.n, red, 3) +
      label(cx + 9, cy - scale * v.n - 3, 'N', 'start', teal) +
      label(cx + 13, cy + scale * v.n + 14, 'mg', 'start', red);
    body +=
      arrow(cx, cy, cx + d.F * scale, cy, red, 3) +
      arrow(cx, cy, cx - v.friction * scale, cy, teal, 3) +
      label(386, 108, 'Trazione F', 'start', red) +
      label(215, 108, 'Attrito f', 'end', teal) +
      label(25, 235, v.moving ? 'Il blocco accelera verso destra' : 'Equilibrio orizzontale');
    return [
      frame(
        'Forze sul blocco: trazione a destra, attrito a sinistra, reazione verso l’alto e peso verso il basso.',
        body,
      ),
      'Le quattro frecce hanno la stessa scala. Le forze nulle non hanno lunghezza.',
      [
        ['Accelerazione', num(v.a) + ' m/s²'],
        ['Attrito', num(v.friction) + ' N'],
        ['Soglia statica', num(v.limit) + ' N'],
        ['Reazione normale', num(v.n) + ' N'],
      ],
    ];
  }
  if (model === 'C2') {
    const cy = 124,
      h = 28 * d.r;
    let body =
      rect(49, cy - h, 500, 2 * h, '#e0ebdc', 'none') +
      line(45, cy - h, 550, cy - h, ink, 3) +
      line(45, cy + h, 550, cy + h, ink, 3) +
      line(38, cy, 555, cy, ink, 0.8, 'stroke-dasharray="5 6"');
    const pts = [];
    for (let i = -20; i <= 20; i++) {
      const a = i / 20,
        offset = d.dp ? 124 * (1 - a * a) : 0;
      pts.push([280 + offset, cy + a * h]);
      if (i % 5 === 0 && offset) body += arrow(280, cy + a * h, 280 + offset, cy + a * h, teal, 1.8);
    }
    body +=
      poly(pts, teal, 2.5) +
      line(150, cy, 150, cy - h, red, 2) +
      line(145, cy - h, 155, cy - h, red) +
      line(145, cy, 155, cy, red) +
      poly(
        [
          [150, cy - h / 2],
          [170, cy - h / 2],
          [195, cy - h - 23],
          [202, cy - h - 23],
        ],
        red,
        1,
      ) +
      label(207, cy - h - 18, 'r', 'start', red) +
      label(53, cy - h - 13, 'Ingresso') +
      label(545, cy - h - 13, 'Uscita', 'end') +
      label(298, 225, d.dp ? 'Profilo normalizzato di velocità' : 'Fluido in quiete', 'middle');
    return [
      frame('Condotto longitudinale con profilo parabolico della velocità.', body),
      'La velocità è massima sull’asse e nulla alle pareti. La tabella dà i valori in unità fisiche.',
      [
        ['Portata Q', num(v.q, 4) + ' mL/s'],
        ['Velocità media', num(v.mean * 100) + ' cm/s'],
        ['Reynolds', num(v.re)],
        ['Q / Q a 1 mm', v.relative === null ? '—' : num(v.relative, 4)],
      ],
    ];
  }
  if (model === 'C3') {
    const x = (V) => 85 + 218 * V,
      y = (p) => 211 - p * 0.52;
    let body =
      arrow(85, 211, 562, 211) +
      arrow(85, 211, 85, 23) +
      label(568, 234, 'V (L)', 'end') +
      label(75, 21, 'p (kPa)', 'end');
    for (const z of [0.5, 1, 1.5, 2])
      body += line(x(z), 208, x(z), 215) + label(x(z), 233, num(z), 'middle', ink, 13);
    for (const z of [100, 200, 300])
      body += line(80, y(z), 87, y(z)) + label(74, y(z) + 5, z, 'end', ink, 13);
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const ratio = 1 + ((d.ratio - 1) * i) / 64,
        s = models.C3({ ratio, mode: d.mode });
      pts.push([x(s.V), y(s.p)]);
    }
    if (d.mode !== 'Isocora') {
      body += `<polygon points="${[[x(1), 211], ...pts, [x(v.V), 211]].map((a) => a.join(',')).join(' ')}" fill="#d3dccb"/>`;
    }
    body +=
      poly(pts, red, 3) +
      `<circle cx="${x(1)}" cy="${y(100)}" r="4.5" fill="${ink}"/><circle cx="${x(v.V)}" cy="${y(v.p)}" r="5" fill="${red}"/>` +
      label(555, 27, d.mode, 'end', red);
    return [
      frame('Cammino del gas sul diagramma p–V, stato iniziale a 1 L e 100 kPa.', body),
      'Il punto scuro è lo stato iniziale, il rosso lo stato finale. Il lavoro ha il segno della variazione di volume.',
      [
        ['Volume finale', num(v.V) + ' L'],
        ['Pressione finale', num(v.p) + ' kPa'],
        ['Temperatura', num(v.T) + ' K'],
        ['Lavoro W', num(v.W) + ' J'],
        ['Calore Q', num(v.Q) + ' J'],
        ['ΔU', num(v.U) + ' J'],
      ],
    ];
  }
  if (model === 'C4') {
    const series = d.mode === 'Serie';
    let body =
      line(92, 62, 92, 118) +
      line(74, 118, 110, 118, red, 3) +
      line(83, 129, 101, 129, ink, 3) +
      line(92, 129, 92, 202) +
      label(65, 115, '+', 'end', red) +
      label(65, 143, '−', 'end') +
      label(80, 173, num(d.U) + ' V', 'end');
    if (series) {
      body +=
        line(92, 62, 220, 62) +
        rect(220, 51, 74, 22, pale) +
        line(294, 62, 360, 62) +
        rect(360, 51, 74, 22, pale) +
        line(434, 62, 510, 62) +
        line(510, 62, 510, 202) +
        line(92, 202, 510, 202) +
        label(257, 40, 'R₁', 'middle') +
        label(397, 40, 'R₂', 'middle') +
        arrow(145, 48, 186, 48, teal) +
        label(164, 39, 'I', 'middle', teal);
    } else {
      body += line(92, 62, 465, 62) + line(92, 202, 465, 202);
      for (const [x, l] of [
        [280, 'R₁'],
        [465, 'R₂'],
      ])
        body +=
          line(x, 62, x, 102) +
          rect(x - 10, 102, 20, 59, pale) +
          line(x, 161, x, 202) +
          label(x + 20, 138, l) +
          `<circle cx="${x}" cy="62" r="4" fill="${ink}"/><circle cx="${x}" cy="202" r="4" fill="${ink}"/>`;
      body += arrow(144, 47, 186, 47, teal) + label(165, 38, 'I', 'middle', teal);
    }
    return [
      frame('Schema chiuso con generatore e due resistori in ' + d.mode.toLowerCase(), body),
      'La piastra lunga indica il polo positivo. La freccia orienta la corrente convenzionale erogata dal generatore.',
      [
        ['R equivalente', num(v.R) + ' Ω'],
        ['Corrente totale', num(v.I * 1000) + ' mA'],
        ['Caduta R₁ / R₂', num(v.V1) + ' / ' + num(v.V2) + ' V'],
        ['Correnti I₁ / I₂', num(v.I1 * 1000) + ' / ' + num(v.I2 * 1000) + ' mA'],
        ['Potenza totale', num(v.P * 1000) + ' mW'],
      ],
    ];
  }
  const q = v.q,
    finite = Number.isFinite(q);
  const lo = -Math.max(d.p * 1.28, d.f * 1.28, q < 0 ? -q * 1.15 : 0),
    hi = Math.max(d.f * 1.55, q > 0 && finite ? q * 1.15 : 0, d.p * 0.65);
  const X = (x) => 30 + ((x - lo) / (hi - lo)) * 540,
    scale = 73 / Math.max(1, Math.abs(v.m || 0)),
    Y = (z) => 129 - scale * z;
  const rays = (x, y, X2, Y2, c, w = 2, more = '') => line(X(x), Y(y), X(X2), Y(Y2), c, w, more);
  let body =
    line(25, Y(0), 575, Y(0), ink, 1) +
    line(X(0), 26, X(0), 222, teal, 3) +
    label(X(0), 18, 'Lente', 'middle', teal, 14);
  for (const [pos, s] of [
    [-d.f, 'F'],
    [d.f, 'F′'],
  ])
    body +=
      line(X(pos), Y(0) - 4, X(pos), Y(0) + 4, ink, 2) + label(X(pos), Y(0) + 20, s, 'middle', ink, 13);
  body +=
    '<g clip-path="url(#plot-clip)">' +
    rays(-d.p, 1, 0, 1, red) +
    rays(0, 1, hi, 1 - hi / d.f, red) +
    rays(-d.p, 1, hi, -hi / d.p, teal);
  if (finite && q < 0) {
    body +=
      rays(q, v.m, 0, 1, red, 1.4, 'stroke-dasharray="6 4"') +
      rays(q, v.m, 0, 0, teal, 1.4, 'stroke-dasharray="6 4"');
  }
  body += arrow(X(-d.p), Y(0), X(-d.p), Y(1), ink, 3);
  if (finite) body += arrow(X(q), Y(0), X(q), Y(v.m), red, 3);
  body += '</g>';
  body +=
    label(30, 245, 'Oggetto · freccia scura', 'start', ink, 13) +
    label(570, 245, 'Immagine · ' + v.type, 'end', red, 13);
  return [
    frame('Costruzione dei due raggi principali di una lente convergente.', body),
    'Il tratteggio prolunga all’indietro i raggi emergenti. La vista si adatta alle distanze; le due scale grafiche possono differire.',
    [
      ['Distanza immagine', finite ? num(q) + ' cm' : '∞'],
      ['Ingrandimento', v.m === null ? '—' : num(v.m)],
      ['Immagine', v.type],
    ],
  ];
}
function renderClassic(r, c, saved, owned, related, fields) {
  return crumb([['Simulazioni 3D','laboratori'],[r.title]]) +
    `<article class="bench-room classic-room"><header class="bench-head"><div><div class="meta">Laboratorio guidato · ${esc(r.course)}</div><h1>${esc(r.title)}</h1><p>${esc(titleOf(r.course))}</p></div><img src="/identita/cric-al-banco.svg" alt="Cric" width="82" height="68"></header>
    ${related}${sequenza()}<div class="bench-work"><section class="bench-instrument" aria-label="Banco di misura"><div class="bench-strip"><span data-display>Tavola di misura</span><button data-focus aria-pressed="false">Concentrazione</button></div><figure class="labfigure" id="lab-view"></figure><div class="meters" id="meters"></div></section>
    <aside class="bench-desk"><div data-classic="0"><h2>La tua previsione</h2><label class="field">${esc(r.prediction)}<textarea id="prediction" rows="3">${esc(saved.prediction||'')}</textarea></label></div>
    <div data-classic="1" hidden><h2>Osserva il banco</h2>${vignetta('osserva')}<p>${esc(r.observation)}</p></div>
    <div data-classic="2" hidden><h2>Regola il banco</h2>${fields}${button('Ripristina parametri','reset')}</div>
    <div data-classic="3" hidden><h2>Il modello</h2>${blocks(r.blocks)}<details><summary>Confronta la tua interpretazione</summary><p>${esc(r.interpretation)}</p></details></div>
    <div data-classic="4" hidden><h2>Verifica la tua previsione</h2><label class="field">Che cosa hai osservato?<textarea id="lab-note">${esc(saved.note||'')}</textarea></label><div class="actions">${state.user?button('Salva osservazione','save-observation',true):''}${owned?button('Verifica con un problema','lab-test'):link('Apri il percorso','corso/'+c)}</div></div>
    <div class="bench-nav"><button data-classic-back>← Indietro</button><button class="solid" data-classic-next>Osserva →</button></div></aside></div></article>`;
}
export async function labPage(id, context) {
  const route = location.hash;
  const r = await api('/item/' + id),
    m = r.model;
  const c = context || r.course;
  const d = initial(m, r.defaults || {}),
    owned = state.courses.find((o) => o.id === c)?.owned;
  const predictionsKey = 'astra-lab-' + (state.user?.id || 'ospite') + '-' + id + '-' + r.version;
  const saved = JSON.parse(sessionStorage.getItem(predictionsKey) || '{}');
  const sims = r.simulations || [];
  const related = sims.length
    ? '<details class="sim-related"' + (sims.length <= 3 ? ' open' : '') +
      '><summary>Simulazioni 3D di questa lezione · ' + sims.length + '</summary>' +
      sims.map((e) => listLine(e.title, benchRoute(e.id))).join('') + '</details>'
    : '';
  const fields = `<div class="labfields">${modes[m] ? `<label>Configurazione<select id="lab-mode">${modes[m].map((v) => `<option ${v === d.mode ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : ''}${parameters[m].map(([k, title, unit, min, max, step]) => `<div><label for="slide-${k}">${esc(title)} ${esc(unit)}</label><input id="slide-${k}" type="range" min="${min}" max="${max}" step="${step}" value="${d[k]}"><label class="sr" for="val-${k}">Valore numerico di ${esc(title)} ${esc(unit)}</label><input type="number" id="val-${k}" min="${min}" max="${max}" step="${step}" value="${d[k]}"><small>${num(min)} – ${num(max)} ${esc(unit)}</small></div>`).join('')}</div>`;
  if (!await mostraBanco(renderClassic(r,c,saved,owned,related,fields), route)) return;
  const room = main.querySelector('.classic-room');
  concentrazione(room.querySelector('.bench-instrument'));
  let phase = 0;
  function showPhase(next) {
    phase = Math.max(0,Math.min(momenti.length-1,next));
    segnaMomento(room,phase);
    for (const panel of room.querySelectorAll('[data-classic]')) panel.hidden = Number(panel.dataset.classic) !== phase;
    room.querySelector('[data-classic-back]').disabled = phase === 0;
    const ahead = room.querySelector('[data-classic-next]');
    ahead.hidden = phase === 4;
    ahead.textContent = (momenti[phase+1] || '')+' →';
  }
  for (const btn of room.querySelectorAll('[data-phase]')) btn.onclick = () => showPhase(Number(btn.dataset.phase));
  room.querySelector('[data-classic-back]').onclick = () => showPhase(phase-1);
  room.querySelector('[data-classic-next]').onclick = () => showPhase(phase+1);
  showPhase(0);
  if (m === 'C3') $('#lab-mode').setAttribute('aria-label', 'Trasformazione termodinamica');
  function draw() {
    const [svg, caption, meters] = diagram(m, d, models[m](d));
    $('#lab-view').innerHTML = svg + '<figcaption>' + esc(caption) + '</figcaption>';
    $('#meters').innerHTML = meters
      .map(([key, val]) => `<div class="meter"><span>${esc(key)}</span><b>${esc(val)}</b></div>`)
      .join('');
    if (m === 'C3')
      $('label[for="slide-ratio"]').textContent =
        d.mode === 'Isocora' ? 'Rapporto di pressione pf / pi' : 'Rapporto di volume Vf / Vi';
  }
  for (const [k, , , min, max, step] of parameters[m]) {
    const range = $('#slide-' + k),
      field = $('#val-' + k);
    range.oninput = () => {
      d[k] = Number(range.value);
      field.value = d[k];
      draw();
    };
    field.onchange = () => {
      const n = field.valueAsNumber;
      if (!Number.isFinite(n)) {
        field.value = d[k];
        return;
      }
      d[k] = Number((min + Math.round((Math.min(max, Math.max(min, n)) - min) / step) * step).toFixed(8));
      field.value = range.value = d[k];
      draw();
    };
  }
  if ($('#lab-mode'))
    $('#lab-mode').onchange = (e) => {
      d.mode = e.target.value;
      draw();
    };
  on('#reset', 'click', () => {
    Object.assign(d, initial(m, r.defaults || {}));
    for (const [k] of parameters[m]) $('#val-' + k).value = $('#slide-' + k).value = d[k];
    if ($('#lab-mode')) $('#lab-mode').value = d.mode;
    draw();
  });
  const saveText = () =>
    sessionStorage.setItem(
      predictionsKey,
      JSON.stringify({ prediction: $('#prediction').value, note: $('#lab-note').value }),
    );
  $('#prediction').oninput = $('#lab-note').oninput = saveText;
  on('#save-observation', 'click', async () => {
    await api('/observation', {
      id,
      prediction: $('#prediction').value,
      note: $('#lab-note').value,
      parameters: JSON.stringify(d),
    });
    toast('Osservazione registrata nel tuo studio.');
  });
  on('#lab-test', 'click', () => startRun({ course: c, mode: 'retest', skill: r.skill || undefined }));
  draw();
  typeset();
}
