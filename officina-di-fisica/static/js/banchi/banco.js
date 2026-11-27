import { api, esc, crumb, main, state, link, blocks, typeset } from '../ui.js';
import { lettorePersonale } from '../lettura.js';
import { defaults, inRange, n, nextTime } from './misure.js';
import { confrontoMisure } from './voci/misure-affiancate.js';
import { plot, moveCursor } from './grafici.js';
import {
  barraTempo,
  concentrazione,
  letture,
  momenti,
  segnaMomento,
  sequenza,
  mostraBanco,
} from './aula.js';
import { guidaPilota, piloti, problemi, ragionamento } from './quaderno.js';
const areas = {
  C1: 'Meccanica',
  C2: 'Fluidi',
  C3: 'Termodinamica',
  C4: 'Elettricità',
  C5: 'Onde e ottica',
  C6: 'Raccordi fra i corsi',
};
const legends = {
  piano: [
    'Peso · rosso / Normale · verde',
    'P∥ · viola / P⊥ · ocra',
    'Attrito · grafite / F · verde / a · lime',
  ],
  volo: [
    'Anello verde · origine O / Tratteggio verde · proiezione orizzontale',
    'v · verde / g · rosso / Tratteggio verticale · culmine',
    'vx · viola / vy · ocra / vz · grafite',
  ],
  stevino: ['A · sonda mobile', 'B · presa alla stessa quota', 'Fondo · presa a 2 m'],
  tubo: [
    'Ingresso → uscita',
    'Frecce · velocità rispetto al centro, v(r)/v(0). Punti · traccianti',
    'Viola · profilo nella sezione di misura',
  ],
  gas: [
    'Pistone · metallo / volume · ocra',
    'Freccia · spinta del gas',
    'Curva p–V · isoterma dello stato',
  ],
  calore: [
    'T₁ · faccia sinistra / T₂ · faccia destra',
    'Dal blu al rosso · temperatura crescente',
    'Freccia verde · flusso termico',
  ],
  campo: [
    'Rosso · carica positiva / viola · negativa',
    'E₁ · ocra / E₂ · viola / E totale · verde',
    'Curve · linee di campo / superficie azzurra · V costante',
  ],
  circuito: [
    'R₁ · viola / R₂ · ocra',
    'Frecce rosse · corrente convenzionale',
    'A e B · nodi del circuito',
  ],
  lente: [
    'F e F′ · fuochi',
    'Ocra · raggio rifratto / verde · raggio centrale',
    'Tratteggio · prolungamento / rosso · immagine',
  ],
  onde: [
    'S₁ e S₂ · sorgenti / P · sonda',
    'Segmenti · cammini fino a P',
    'Chiaro · cresta / scuro · valle',
  ],
};

function controls(params, p) {
  return params
    .map(
      (a) =>
        `<label class="bench-param" data-row="${a.key}"><span>${esc(a.label)}</span>${a.options ? `<select name="${a.key}">${a.options.map(([v, l]) => `<option value="${esc(v)}" ${p[a.key] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>` : `<output for="bp-${a.key}">${n(p[a.key])} ${esc(a.unit)}</output><input type="range" id="bp-${a.key}" name="${a.key}" min="${a.min}" max="${a.max}" step="${a.step}" value="${p[a.key]}"><small>${n(a.min)} – ${n(a.max)} ${esc(a.unit)}</small>`}</label>`,
    )
    .join('');
}
function exercises(record) {
  return record.assessment
    .map(
      (a, i) =>
        `<form class="bench-check" data-check="${i}"><h3>${['Verifica la misura', 'Un caso diverso', 'Verifica del fenomeno', 'Problema di trasferimento'][i] || 'Verifica'}</h3><p>${esc(a.prompt)}</p><label>Risposta (${esc(a.unit)}) <input name="answer" inputmode="decimal" required autocomplete="off"></label><button>Verifica</button><p role="status"></p></form>`,
    )
    .join('');
}
function bancoMarkup(r, activity, focus, back, model, pilot, logged, origin) {
  const kind = activity ? 'Simulazione di lezione' : 'Banco ' + r.id.slice(-2);
  return (
    crumb([['Simulazioni 3D', 'laboratori'], [r.course + ' · ' + (areas[r.course] || state.courses.find(c => c.id === r.course)?.title || r.course)]]) +
    `<article class="bench-room" data-bench="${esc(r.id)}">
    <header class="bench-head"><div><div class="meta">${esc(kind)} · ${esc((areas[r.course] || state.courses.find(c => c.id === r.course)?.title || r.course))}</div><h1>${esc(r.title)}</h1><p>${esc(focus?.question || r.summary)}</p></div><img src="/identita/cric-al-banco.svg" width="90" height="76" alt="Cric"></header>
    ${sequenza()}<div class="bench-work">
    <section class="bench-instrument" aria-label="Strumento di osservazione">
      <div class="bench-strip"><span data-display role="status">Preparazione della vista…</span><button type="button" data-focus aria-pressed="false">Concentrazione</button></div>
      <div class="bench-stage"><canvas tabindex="0" aria-label="${esc(r.title)}. Frecce per ruotare, Maiusc e frecce per spostare, più e meno per lo zoom, Home per raddrizzare la vista scelta."></canvas><div data-drawing hidden></div></div>
      <p class="scene-caption" data-caption hidden></p><p class="bench-warning" role="status" hidden></p>
      ${barraTempo()}
      <div class="bench-views" role="group" aria-label="Inquadratura"><button data-view="orbit">Obliqua</button><button data-view="top">Alto</button><button data-view="side">Laterale</button>${pilot === 'onde' ? '<button data-view="section">Sezione</button>' : ''}<button data-view="diagram">Tavola 2D</button><button data-touch hidden aria-pressed="false">Ruota col dito</button><button data-reset-view aria-label="Ripristina vista">↺ Ripristina vista</button></div>
      <label class="flat-projection" hidden>Proiezione della tavola <select data-projection><option value="top">Dall’alto</option><option value="section">Sezione passante per P</option><option value="probe">Spostamenti in P</option></select></label><details class="scene-key"><summary>Legenda e gesti</summary><p data-legend></p><p data-help></p></details>
      <div data-readings class="bench-readings"></div>
    </section><div class="bench-side"><aside class="bench-desk">
      <form data-predict><div class="meta">Prima di osservare</div><h2>Fai una previsione</h2><fieldset><legend>${esc(r.prediction.question)}</legend>${r.prediction.options.map((o, i) => `<label><input type="radio" name="prediction" value="${i}" required> ${esc(o)}</label>`).join('')}</fieldset><button class="solid">Confronta con il banco →</button></form>
      <div data-guide hidden><div class="meta" data-count></div><h2 data-step-title></h2><p data-explain></p><p class="bench-equation" data-equation></p>
      <div class="math-walk" hidden><div class="math-art" data-math-art></div><span data-math-count></span><div class="math-actions"><button data-math-back aria-label="Disegno precedente">←</button><button data-math-next>Disegno successivo →</button></div></div>
      <div class="bench-nav"><button data-prev>← Indietro</button><button data-next class="solid">Avanti →</button></div>
      <details class="initial-choice"><summary>La tua previsione iniziale</summary><p data-response></p></details><details class="initial-choice" data-reference hidden><summary>Passaggi e misure di riferimento</summary><div data-reference-content></div></details></div>
    </aside>
    <section data-experiment hidden class="bench-experiment">
      <details class="settings-drawer" data-controls><summary>Parametri del banco</summary><div class="bench-params">${controls(model.params, defaults(model.params))}</div><div class="setting-actions"><button data-reset>${activity ? 'Prima misura' : 'Valori iniziali'}</button>${activity ? '<button data-compare>Seconda misura</button>' : ''}</div></details>
      <details class="graph-drawer" data-plots><summary>Grafici e misure</summary><div data-graphs></div></details>
    </section></div></div>
    ${activity ? '<section class="bench-comparison" data-comparison hidden></section>' : ''}
    ${activity && r.blocks?.length ? '<details class="sheetpanel reader" data-authored-reading hidden><summary>Ragionamento e calcoli a mano</summary><div class="lettura-contenuto">' + blocks(r.blocks) + '</div></details>' : ''}
    <section data-assess hidden><h2>Metti alla prova la spiegazione</h2><div class="bench-checks">${exercises(r)}</div>${logged ? '<form class="bench-note"><label>Che cosa hai osservato?<textarea required name="note" rows="2"></textarea></label><button>Salva nel quaderno</button><p role="status"></p></form>' : ''}</section>
    <footer>${link(origin ? 'Torna all’attività' : 'Torna ai laboratori', back)} <a href="#materiale/${esc(r.skill)}/${esc(r.course)}">Lezione associata</a></footer></article>`
  );
}

export async function benchPage(id, origin, topicIndex) {
  const route = location.hash;
  const item = await api('/item/' + encodeURIComponent(id));
  const activity =
    item.kind === 'experiment' ? await (await import('./voci/esperimento.js')).esperienza(item) : null;
  const pilot = piloti[id];
  const disegnoPasso = pilot ? (await import('./tavola.js')).disegnoPasso : null;
  const source = activity?.record || item;
  const r = pilot
    ? { ...source, model: pilot, assessment: [...source.assessment, ...problemi[pilot]] }
    : source;
  if (!activity && (r.kind !== 'bench' || !Object.hasOwn(legends, r.model)))
    throw Error('Banco non disponibile.');
  let model = activity?.model || (await import('./modelli/' + r.model + '.js'));
  if (pilot === 'induzione') {
    const induction = await import('./modelli/induzione.js');
    model = { ...induction, params: [model.params[0], ...induction.params.slice(1)] };
  }
  const focus = topicIndex === undefined ? null : r.topics?.[Number(topicIndex)];
  const back =
    origin && /^(?:materiale|corso|prova|lab|laboratori|percorsi|studio\/diario)(?:\/|$)/.test(origin) ? origin : 'laboratori';
  const markup = bancoMarkup(r, activity, focus, back, model, pilot, state.user, origin);
  if (!await mostraBanco(markup, route)) return;
  const root = main.querySelector('.bench-room'),
    get = (sel) => root.querySelector(sel),
    canvas = get('canvas'),
    stageBox = get('.bench-stage');
  const leaveFocus = concentrazione(get('.bench-instrument'));
  const settings = get('[data-controls]'),
    plots = get('[data-plots]');
  const pairNode = get('[data-comparison]');
  const pair = activity ? confrontoMisure(pairNode, activity, () => get('[data-compare]').click()) : null;
  let mathStep = 0,
    answered = false;
  let p = defaults(model.params),
    s = model.solve(p),
    stage = -1,
    t = 0,
    playing = false,
    inViewport = false,
    disposed = false,
    raf = 0,
    last = 0,
    lastText = -1;
  const authoredReading = get('[data-authored-reading]');
  let readingInstalled = false;
  if (authoredReading) authoredReading.ontoggle = async () => {
    if (!authoredReading.open || readingInstalled) return;
    readingInstalled = true;
    typeset(authoredReading);
    await lettorePersonale(authoredReading, { ...r, kind: 'worked' });
    if (authoredReading.hidden || disposed) authoredReading.dispatchEvent(new Event('lettura:sospendi'));
  };
  const clock = !pilot && activity?.clock;
  const timeline = clock?.input;
  const timeUnit = clock?.clockUnit || 's';
  if (timeline) t = Number(p.x);
  get('[data-clock-unit]').textContent = timeUnit;
  if (clock && (timeUnit !== 's' || clock.pace !== 1)) {
    const scale = get('.clock-scale');
    scale.hidden = false;
    scale.textContent =
      'A velocità 1×, un secondo di riproduzione corrisponde a ' +
      n(clock.pace) +
      ' ' +
      (timeUnit === 'T½' ? 'emivita' : timeUnit) +
      ' del modello.';
  }
  const initialRate = pilot === 'volo' ? 0.5 : 1;
  let rate = initialRate;
  const touch = matchMedia('(pointer:coarse)').matches;
  let touchEnabled = !touch;
  let gpu,
    startingContext,
    world,
    drawing,
    view = 'orbit',
    desiredView = 'orbit',
    viewRequest = 0,
    available = false,
    choice;
  const media = matchMedia('(prefers-reduced-motion: reduce)'),
    graphBox = get('[data-graphs]'),
    diagram = get('[data-drawing]');
  let diagramWidth = 460;
  const active = () => inViewport && !document.hidden && root.isConnected && !disposed;
  const duration = () => (clock ? clock.duration(s.x, s.y) : s.duration);
  const clockInput = timeline && get('[name=x]');
  if (clockInput) {
    clockInput.step = 'any';
    clockInput.onkeydown = (event) => {
      const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key];
      if (!direction) return;
      event.preventDefault();
      clockInput.value = Number(clockInput.value) + direction * r.control.step;
      clockInput.dispatchEvent(new Event('input', { bubbles: true }));
    };
  }
  const isTimed = () => duration() > 0 && stage >= 0;
  const instant = () => (pilot && model.sample ? model.sample(s, t) : {});
  function reasoning() {
    return pilot && stage === 2 ? ragionamento(pilot, p, s, t, instant())[mathStep] : null;
  }
  function sceneLevel() {
    if (!pilot || stage < 0) return stage;
    return reasoning()?.[4] ?? (stage === 0 ? 1 : 2);
  }
  function renderGuide(explanation) {
    const [title, text, equation] =
      explanation || (pilot ? guidaPilota(pilot, stage) : model.steps(p, s)[stage]);
    get('[data-step-title]').textContent = title;
    get('[data-explain]').textContent = text;
    get('[data-equation]').textContent = equation;
  }
  let lastReadings = '';
  function frame(textToo = true) {
    if (view === 'diagram') {
      if (textToo && drawing)
        diagram.innerHTML = drawing(
          r.model,
          p,
          { ...s, instant: instant() },
          t,
          sceneLevel(),
          r.title,
          get('[data-projection]').value,
          model,
        );
    } else gpu?.frame(t);
    if (stage < 0 || !textToo) return;
    const explanation = reasoning();
    if (explanation || timeline) renderGuide(explanation);
    const html = letture(
      model.readings(p, s, t).map(([label, v, unit]) => [label, typeof v === 'number' ? n(v) : v, unit]),
      explanation?.[3],
    );
    if (lastReadings !== html) {
      get('[data-readings]').innerHTML = html;
      lastReadings = html;
    }
    if (explanation) {
      get('[data-math-art]').innerHTML = disegnoPasso(pilot, mathStep, p, s, t, instant(), explanation[0], model);
    }
    if (isTimed()) {
      const time = timeline ? s.x : t;
      get('[data-time]').textContent = n(time) + ' / ' + n(duration()) + ' ' + timeUnit;
      get('[data-scrub]').value = time;
      get('[data-scrub]').setAttribute('aria-valuetext', n(time) + ' ' + timeUnit);
      if (document.activeElement !== get('[data-instant]'))
        get('[data-instant]').value = Number(time.toFixed(5));
    }
    if (timeline) {
      const row = clockInput.closest('[data-row]');
      clockInput.value = s.x;
      clockInput.setAttribute('aria-valuetext', n(s.x) + ' ' + timeUnit);
      row.querySelector('output').textContent = n(s.x) + ' ' + timeUnit;
      moveCursor(graphBox, s.x, 'control', s.y);
      moveCursor(graphBox, s.x, 'area-v');
      if (pair && !pairNode.hidden) pair.render(s.x);
    } else if (clock?.signal) moveCursor(graphBox, t, 'time', clock.signal(s.x, t, s.y));
    if (['volo', 'onde'].includes(pilot)) moveCursor(graphBox, t);
    if (['tubo', 'induzione'].includes(pilot)) moveCursor(graphBox, t, 'time');
    if (pilot === 'gas') {
      const q = instant();
      moveCursor(graphBox, q.V, 'volume', q.pressure);
    }
  }
  function advanceClock(now) {
    if (last && playing)
      t = nextTime(t, (now - last) / 1000, duration(), rate * (clock?.pace || 1), get('[data-loop]').checked);
    last = now;
  }
  function stop() {
    const wasPlaying = playing;
    if (playing && last) advanceClock(performance.now());
    playing = false;
    last = 0;
    cancelAnimationFrame(raf);
    raf = 0;
    get('[data-play]').textContent = t >= duration() ? 'Ripeti' : 'Avvia';
    if (wasPlaying && stage >= 0) syncTime();
  }
  function syncTime(fresh = true) {
    if (timeline && t !== s.x) {
      p = { ...p, x: t };
      s = model.solve(p);
    }
    frame(fresh);
  }
  function seek(value) {
    if (!Number.isFinite(value) || !isTimed()) return;
    stop();
    t = Math.min(duration(), Math.max(0, value));
    syncTime();
    get('[data-instant]').value = Number(t.toFixed(5));
    get('[data-play]').textContent = t >= duration() ? 'Ripeti' : 'Avvia';
  }
  function tick(now) {
    raf = 0;
    if (!active() || !playing) {
      last = 0;
      return;
    }
    advanceClock(now);
    const fresh = now - lastText >= 80 || t >= duration();
    syncTime(fresh);
    if (fresh) lastText = now;
    if (t >= duration()) {
      stop();
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (!isTimed()) return;
    if (timeline) t = s.x;
    if (t >= duration()) t = 0;
    playing = true;
    get('[data-play]').textContent = 'Pausa';
    visibility();
  }
  function visibility() {
    if (playing && last) advanceClock(performance.now());
    gpu?.visible(active() && view !== 'diagram');
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (playing && active()) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (playing) syncTime();
  }
  const observer = new IntersectionObserver((entries) => {
    inViewport = entries.at(-1).isIntersecting;
    visibility();
  });
  observer.observe(stageBox);
  // A focused instrument can receive a camera key before the viewport observer catches up.
  function updateViewportForInput() {
    if (inViewport || disposed || !gpu || view === 'diagram' || document.hidden) return;
    const rect = canvas.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft || 0;
    const top = viewport?.offsetTop || 0;
    if (rect.width && rect.height && rect.right > left && rect.bottom > top &&
        rect.left < left + (viewport?.width || innerWidth) && rect.top < top + (viewport?.height || innerHeight)) {
      inViewport = true;
      visibility();
    }
  }
  canvas.addEventListener('keydown', updateViewportForInput, true);
  let diagramFrame = 0;
  const diagramSize = activity && !pilot ? new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    const padding = parseFloat(getComputedStyle(root).fontSize);
    const usable = Math.min(width - padding, (height - padding) * 460 / 215);
    if (usable <= 0 || usable === diagramWidth) return;
    diagramWidth = usable;
    if (diagramFrame || disposed || view !== 'diagram') return;
    diagramFrame = requestAnimationFrame(() => {
      diagramFrame = 0;
      if (!disposed && view === 'diagram') frame();
    });
  }) : null;
  diagramSize?.observe(stageBox);
  document.addEventListener('visibilitychange', visibility);
  function motion() {
    if (media.matches) stop();
  }
  media.addEventListener('change', motion);
  function references() {
    if (!get('[data-reference]').open || !pilot) return;
    const original = activity?.model || model;
    const input = activity ? { x: p.x } : p;
    const result = original.solve(input);
    const guide = original
      .steps(input, result)
      .map(
        ([title, text, eq]) =>
          '<h3>' +
          esc(title) +
          '</h3><p>' +
          esc(text) +
          '</p><p class="bench-equation">' +
          esc(eq) +
          '</p>',
      )
      .join('');
    const measures = activity
      ? original
          .readings(input, result, t)
          .map(
            ([label, v, unit]) =>
              esc(label) + ' · ' + esc(typeof v === 'number' ? n(v) : v) + ' ' + esc(unit),
          )
          .join('<br>')
      : '';
    get('[data-reference-content]').innerHTML =
      guide +
      (activity ? '<p>' + measures + '</p>' + original.graphs(input, result, t, 2).map(plot).join('') : '');
  }
  get('[data-reference]').ontoggle = references;
  function draw() {
    if (available && view !== 'diagram') gpu.rebuild(world.build, p, s, sceneLevel());
    let nativeLegend = '';
    if (pilot === 'onde' && view === 'section') {
      nativeLegend = ' · Linea scura · spostamento istantaneo lungo la sezione passante per P';
    } else if (view !== 'diagram' && pilot === 'volo') {
      nativeLegend = ' · Il vettore velocità è di fianco alla sfera. Il dettaglio ocra appare per velocità piccole e ingrandisce la freccia 16 volte nello stesso verso. La freccia rossa indica l’accelerazione verticale e rimane sopra il piano mentre segue la sfera. Sul piano del tavolo la freccia scura più lunga indica x e quella più corta indica z. Nella vista Alto puoi leggere entrambe le direzioni.';
      if (view === 'top') nativeLegend += ' Scegli Laterale per leggere l’altezza del culmine.';
    } else if (view !== 'diagram' && r.model === 'piano') {
      nativeLegend = ' · Il verso positivo della guida è verso monte. Le frecce delle forze sono in primo piano alla scala della guida.';
    } else if (view !== 'diagram' && r.model === 'campo') {
      const charges = s.sources.map(({q, pos: [x, y, z]}, i) => {
        const symbol = i === 0 ? 'q₁' : 'q₂';
        return q ? `${symbol} = ${n(q)} nC, con x ${n(x)}, y ${n(y)} e z ${n(z)} m.` : `${symbol} è spenta.`;
      });
      nativeLegend = ' · L’anello ocra indica la sonda P. Le frecce del campo sono in primo piano alla stessa scala. ' + charges.join(' ');
    }
    get('[data-legend]').textContent =
      pilot === 'induzione'
        ? 'Viola · campo imposto / n · normale positiva / rosso · corrente nel circuito chiuso'
        : activity
          ? activity.legend(stage, view)
          : stage < 0
            ? 'Apparato iniziale'
            : legends[r.model].slice(0, Math.min(sceneLevel() + 1, 3)).join(' · ') + nativeLegend;
    root.dataset.moment = momenti[stage + 1];
    segnaMomento(root, stage + 1, !answered);
    const caption = get('[data-caption]');
    caption.hidden = stage < 0 || (!pilot && !activity);
    if (pair) {
      pairNode.hidden = stage !== 1 && stage !== 2;
      if (!pairNode.hidden) pair.render(Number(p.x));
    }
    if (!caption.hidden)
      caption.textContent =
        {
          volo: 'Pallina in volo · freccia verde per la velocità, rossa per la gravità.',
          tubo:
            p.mode === 'flow'
              ? 'Portata imposta · la pompa adatta la pressione quando cambia il raggio.'
              : 'Pressione imposta · la portata risponde alle variazioni del raggio.',
          gas: 'La tacca verde indica il volume iniziale, la viola il volume finale.',
          induzione: s.closed
            ? 'Circuito chiuso · il segno di I indica il verso rispetto a +n.'
            : 'Circuito aperto · leggi la tensione ai capi della bobina.',
          onde: 'S₁ e S₂ sono le sorgenti. La sonda P misura la somma delle due onde.',
        }[pilot] || [activity.observe, clock?.setup].filter(Boolean).join(' ');
    if (authoredReading && authoredReading.hidden !== (stage < 2)) {
      authoredReading.hidden = stage < 2;
      authoredReading.dispatchEvent(new Event(stage < 2 ? 'lettura:sospendi' : 'lettura:riprendi'));
    }
    if (stage >= 0) {
      const explanation = reasoning();
      get('[data-reference]').hidden = !pilot || stage < 2;
      references();
      get('[data-count]').textContent = momenti[stage + 1] + ' · ' + (stage + 2) + '/5';
      renderGuide(explanation);
      get('.math-walk').hidden = !explanation;
      if (explanation) {
        const total = ragionamento(pilot, p, s, t, instant()).length;
        get('[data-math-count]').textContent = 'Disegno ' + (mathStep + 1) + ' di ' + total;
        get('[data-math-back]').disabled = !mathStep;
        get('[data-math-next]').disabled = mathStep === total - 1;
      }
      get('[data-next]').textContent = stage === 3 ? 'Apri i problemi ↓' : momenti[stage + 2] + ' →';
      const warn = model.warning?.(p, s) || '';
      get('.bench-warning').textContent = warn;
      get('.bench-warning').hidden = !warn;
      graphBox.innerHTML = model.graphs(p, s, t, stage).map(plot).join('');
      get('.bench-time').hidden = !isTimed();
      if (isTimed()) {
        if (!playing)
          get('[data-play]').textContent = (timeline ? s.x : t) >= duration() ? 'Ripeti' : 'Avvia';
        get('[data-scrub]').max = duration();
        get('[data-instant]').max = duration();
      }
      for (const a of model.params) {
        const row = get('[data-row="' + a.key + '"]');
        row.hidden = Boolean(a.when && p[a.when[0]] !== a.when[1]);
        const el = row.querySelector('input,select');
        el.value = p[a.key];
        if (!a.options) {
          row.querySelector('output').textContent = n(p[a.key]) + ' ' + a.unit;
          el.setAttribute('aria-valuetext', n(p[a.key]) + ' ' + a.unit);
        }
      }
    }
    frame();
  }
  function chooseView(next) {
    desiredView = next;
    return showView(true);
  }
  async function showView(resetCamera = false) {
    const request = ++viewRequest;
    const next = available ? desiredView : 'diagram';
    if (next === 'diagram' && !drawing) {
      if (activity && !pilot) {
        const { disegna2D } = await import('./voci/tavola.js');
        drawing = (_, p, s, t, step, title) =>
          disegna2D(activity.elements(s.x, step, step >= 0 ? t : undefined), title, 'bench-diagram', diagramWidth);
      } else drawing = (await import('./tavola.js')).drawing;
    }
    if (disposed || !root.isConnected || request !== viewRequest) return;
    view = next;
    const flat = next === 'diagram';
    canvas.hidden = flat;
    diagram.hidden = !flat;
    const temporary = flat && !available && (gpu || startingContext);
    const display = flat
      ? temporary ? 'Tavola di misura · 3D interrotto' : 'Tavola di misura'
      : '3D interattivo';
    const status = get('[data-display]');
    status.toggleAttribute('data-interrotto', Boolean(temporary));
    if (status.textContent !== display) status.textContent = display;
    get('[data-help]').textContent = flat
      ? available
        ? 'Schema del banco nel piano di misura.'
        : temporary && desiredView !== 'diagram'
          ? 'Puoi continuare a misurare. La vista 3D riprenderà appena disponibile. Scegli «Tavola 2D» per restare qui.'
          : 'WebGL non disponibile. La tavola segue gli stessi parametri e calcoli.'
      : 'Trascina per ruotare, usa il tasto destro per spostare la vista e la rotella per lo zoom. Da tastiera usa le frecce, Maiusc e frecce, oppure + e −.';
    root.querySelectorAll('[data-view]').forEach((btn) => {
      btn.disabled = !available && btn.dataset.view !== 'diagram';
      btn.setAttribute('aria-pressed', String(btn.dataset.view === view));
    });
    get('[data-reset-view]').disabled = flat;
    get('[data-touch]').hidden = flat || !touch;
    get('.flat-projection').hidden = !flat || pilot !== 'onde';
    get('[data-touch]').setAttribute('aria-pressed', String(touchEnabled));
    get('[data-touch]').textContent = touchEnabled ? 'Scorri la pagina' : 'Ruota col dito';
    if (!flat) gpu.gestures(touchEnabled);
    if (!flat && touch)
      get('[data-help]').textContent =
        'Attiva «Ruota col dito». Un dito ruota la vista, due dita la spostano o la ingrandiscono. Scegli «Scorri la pagina» per scorrere di nuovo.';
    if (!flat && resetCamera) gpu.view(next);
    visibility();
    draw();
  }
  function lostContext(event) {
    event?.preventDefault();
    if (disposed) return;
    const focused = document.activeElement;
    const viewControl = root.contains(focused) && focused?.matches(
      '[data-view]:not([data-view=diagram]), [data-reset-view], [data-touch]',
    );
    if (focused === canvas || viewControl)
      get('[data-view=diagram]').focus({ preventScroll: true });
    available = false;
    showView();
  }
  function restoredContext() {
    if (disposed) return;
    available = true;
    showView();
  }
  // The lazy imports can still be pending when the browser loses its first context.
  function restoreDuringLoad() {
    if (startingContext) initialize3D();
  }
  function finishLoading() {
    canvas.removeEventListener('webglcontextlost', lostContext);
    canvas.removeEventListener('webglcontextrestored', restoreDuringLoad);
  }
  async function initialize3D() {
    try {
      startingContext ??= canvas.getContext('webgl2', {
        antialias: true,
        alpha: false,
        powerPreference: 'low-power',
      });
      if (!startingContext) throw Error('WebGL2');
      const [renderer, scene] = await Promise.all([
        import('./scena.js'),
        pilot
          ? import('./scene/' + pilot + '.js')
          : activity?.scene || import('./scene/' + r.model + '.js'),
      ]);
      if (disposed || gpu || !startingContext || startingContext.isContextLost()) return;
      world = scene;
      gpu = renderer.openScene(canvas, scene.spec, lostContext, startingContext, restoredContext);
      finishLoading();
      startingContext = null;
      available = true;
      showView(true);
    } catch (error) {
      if (disposed) return;
      finishLoading();
      startingContext?.getExtension('WEBGL_lose_context')?.loseContext();
      startingContext = null;
      gpu?.dispose();
      gpu = null;
      available = false;
      showView();
    }
  }
  function goStep(next) {
    if (next < -1 || next > 3 || (!answered && next >= 0)) return;
    stop();
    stage = next;
    mathStep = 0;
    get('[data-predict]').hidden = next >= 0;
    get('[data-guide]').hidden = next < 0;
    get('[data-experiment]').hidden = next < 0;
    get('[data-assess]').hidden = next !== 3;
    get('.bench-time').hidden = true;
    if (next < 0) {
      get('[data-readings]').innerHTML = '';
      lastReadings = '';
      get('.bench-warning').hidden = true;
    }
    if (next === 0) {
      settings.open = !!activity;
      plots.open = !!pilot;
    }
    if (next === 1) settings.open = true;
    if (next === 2) plots.open = true;
    if (next === 3) {
      settings.open = false;
      plots.open = false;
    }
    get('.initial-choice').open = false;
    draw();
    if (matchMedia('(max-width: 650px)').matches)
      get('.lab-path').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  get('[data-predict]').onsubmit = (e) => {
    e.preventDefault();
    choice = Number(new FormData(e.currentTarget).get('prediction'));
    answered = true;
    get('[data-response]').textContent =
      'Hai scelto «' +
      r.prediction.options[choice] +
      '». ' +
      (choice === r.prediction.correct ? 'Previsione corretta. ' : 'Confronta con il modello. ') +
      r.prediction.why;
    goStep(0);
    get('.initial-choice').open = true;
    if ((pilot || clock) && !media.matches) start();
  };
  for (const btn of root.querySelectorAll('[data-phase]'))
    btn.onclick = () => goStep(Number(btn.dataset.phase) - 1);
  get('[data-prev]').onclick = () => goStep(stage - 1);
  get('[data-next]').onclick = () =>
    stage === 3 ? get('[data-assess]').scrollIntoView() : goStep(stage + 1);
  get('[data-math-next]').onclick = () => {
    mathStep++;
    draw();
  };
  get('[data-math-back]').onclick = () => {
    mathStep--;
    draw();
  };
  get('[data-projection]').onchange = () => frame();
  get('[data-touch]').onclick = () => {
    touchEnabled = !touchEnabled;
    gpu?.gestures(touchEnabled);
    get('[data-touch]').textContent = touchEnabled ? 'Scorri la pagina' : 'Ruota col dito';
    get('[data-touch]').setAttribute('aria-pressed', String(touchEnabled));
  };
  get('[data-reset-view]').onclick = () => chooseView('orbit');
  root.querySelectorAll('[data-view]').forEach((btn) => (btn.onclick = () => chooseView(btn.dataset.view)));
  get('.bench-params').oninput = (e) => {
    const el = e.target,
      def = model.params.find((a) => a.key === el.name);
    if (!def) return;
    let value = def.options ? el.value : Number(el.value);
    if (el === clockInput)
      value = Math.min(
        def.max,
        Math.max(def.min, def.min + Math.round((value - def.min) / def.step) * def.step),
      );
    const next = { ...p, [el.name]: value };
    if (!inRange(model.params, next)) return;
    stop();
    p = next;
    get('.initial-choice').open = false;
    if (r.model === 'piano' && p.mk > p.ms) {
      if (el.name === 'mk') p.ms = p.mk;
      else p.mk = p.ms;
    }
    t = timeline ? Number(p.x) : 0;
    s = model.solve(p);
    draw();
  };
  if (activity)
    get('[data-compare]').onclick = () => {
      const input = settings.querySelector('[name=x]');
      input.value = String(r.references[1][0]);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
  get('[data-reset]').onclick = () => {
    stop();
    p = defaults(model.params);
    t = timeline ? Number(p.x) : 0;
    pair?.reset();
    s = model.solve(p);
    rate = initialRate;
    get('[data-rate]').value = String(rate);
    get('[data-loop]').checked = false;
    draw();
  };
  get('[data-play]').onclick = () => (playing ? stop() : start());
  get('[data-scrub]').oninput = (e) => seek(Number(e.target.value));
  get('[data-instant]').onchange = (e) => seek(e.target.valueAsNumber);
  get('[data-rewind]').onclick = () => seek(0);
  for (const btn of root.querySelectorAll('[data-nudge]'))
    btn.onclick = () => seek(t + (Number(btn.dataset.nudge) * duration()) / 100);
  get('[data-rate]').value = String(rate);
  get('[data-rate]').onchange = () => {
    if (playing && last) advanceClock(performance.now());
    rate = Number(get('[data-rate]').value);
  };
  root.querySelectorAll('[data-check]').forEach(
    (form) =>
      (form.onsubmit = (e) => {
        e.preventDefault();
        const a = r.assessment[Number(form.dataset.check)],
          answer = Number(form.elements.answer.value.trim().replace(',', '.'));
        const ok =
          form.elements.answer.value.trim() !== '' &&
          Number.isFinite(answer) &&
          Math.abs(answer - a.value) <= Math.max(activity ? 0.000001 : 0.001, Math.abs(a.value) * 0.005);
        let hint = 'Rivedi il calcolo. ';
        if (activity && !ok && Number.isFinite(answer) && a.value) {
          const ratio = Math.abs(answer / a.value);
          if (Math.sign(answer) === -Math.sign(a.value) && Math.abs(ratio - 1) < 0.01)
            hint = 'Controlla il verso o il segno dello scambio. ';
          else if ([10, 100, 1000, 0.1, 0.01, 0.001].some((k) => Math.abs(ratio / k - 1) < 0.01))
            hint = 'Ricontrolla le unità e le potenze di dieci. ';
        }
        form.querySelector('[role=status]').textContent = (ok ? 'Corretto. ' : hint) + a.worked;
      }),
  );
  const note = get('.bench-note');
  if (note)
    note.onsubmit = async (e) => {
      e.preventDefault();
      const btn = note.querySelector('button');
      btn.disabled = true;
      try {
        await api('/observation', {
          id: r.id,
          prediction: r.prediction.options[choice],
          parameters: JSON.stringify(isTimed() ? { ...p, tempoSecondi: t } : p),
          note: note.elements.note.value,
        });
        note.querySelector('[role=status]').textContent = 'Osservazione salvata nel quaderno.';
      } catch (err) {
        note.querySelector('[role=status]').textContent = err.message;
      } finally {
        btn.disabled = false;
      }
    };
  function dispose() {
    if (disposed) return;
    disposed = true;
    authoredReading?.dispatchEvent(new Event('lettura:sospendi'));
    leaveFocus();
    finishLoading();
    startingContext?.getExtension('WEBGL_lose_context')?.loseContext();
    startingContext = null;
    cancelAnimationFrame(raf);
    observer.disconnect();
    canvas.removeEventListener('keydown', updateViewportForInput, true);
    diagramSize?.disconnect();
    cancelAnimationFrame(diagramFrame);
    media.removeEventListener('change', motion);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', dispose);
    gpu?.dispose();
  }
  window.addEventListener('pagehide', dispose);
  segnaMomento(root, 0, true);
  canvas.addEventListener('webglcontextlost', lostContext);
  canvas.addEventListener('webglcontextrestored', restoreDuringLoad);
  initialize3D();
  return dispose;
}
