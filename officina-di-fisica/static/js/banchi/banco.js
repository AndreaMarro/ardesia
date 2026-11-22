import { api, esc, crumb, main, state, link } from '../ui.js';
import { defaults, inRange, n, nextTime } from './misure.js';
import { plot, moveCursor } from './grafici.js';
import { disegnoPasso } from './tavola.js';
import {
  barraTempo,
  concentrazione,
  letture,
  momenti,
  segnaMomento,
  sequenza,
  stileBanco,
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
    'Proiezione orizzontale · verde',
    'v · verde / g · rosso',
    'vx · viola / vy · ocra / vz · grafite',
  ],
  stevino: ['A · sonda mobile', 'B · presa alla stessa quota', 'Fondo · presa a 2 m'],
  tubo: ['Ingresso → uscita', 'Frecce · velocità locale / punti · traccianti', 'Anello viola · sezione'],
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
    crumb([['Simulazioni 3D', 'laboratori'], [r.course + ' · ' + areas[r.course]]]) +
    `<article class="bench-room" data-bench="${esc(r.id)}">
    <header class="bench-head"><div><div class="meta">${esc(kind)} · ${esc(areas[r.course])}</div><h1>${esc(r.title)}</h1><p>${esc(focus?.question || r.summary)}</p></div><img src="/identita/cric-al-banco.svg" width="90" height="76" alt="Cric"></header>
    ${sequenza()}<div class="bench-work">
    <section class="bench-instrument" aria-label="Strumento di osservazione">
      <div class="bench-strip"><span data-display>Preparazione della vista…</span><button type="button" data-focus aria-pressed="false">⛶ Concentrazione</button></div>
      <div class="bench-stage"><canvas tabindex="0" aria-label="${esc(r.title)}. Frecce per ruotare, più e meno per lo zoom, Home per la vista iniziale."></canvas><div data-drawing hidden></div></div>
      <p class="scene-caption" data-caption hidden></p><p class="bench-warning" role="status" hidden></p>
      ${barraTempo()}
      <div class="bench-views" aria-label="Inquadratura"><button data-view="orbit">Obliqua</button><button data-view="top">Alto</button><button data-view="side">Laterale</button>${pilot === 'onde' ? '<button data-view="section">Sezione</button>' : ''}<button data-view="diagram">Tavola 2D</button><button data-touch hidden aria-pressed="false">Ruota col dito</button><button data-reset-view aria-label="Ripristina vista">↺ Ripristina vista</button></div>
      <label class="flat-projection" hidden>Proiezione della tavola <select data-projection><option value="top">Dall’alto</option><option value="section">Sezione passante per P</option><option value="probe">Spostamenti in P</option></select></label><details class="scene-key"><summary>Legenda e gesti</summary><p data-legend></p><p data-help></p></details>
      <div data-readings class="bench-readings"></div>
    </section><div class="bench-side"><aside class="bench-desk">
      <form data-predict><div class="meta">Prima di osservare</div><h2>Fai una previsione</h2><fieldset><legend>${esc(r.prediction.question)}</legend>${r.prediction.options.map((o, i) => `<label><input type="radio" name="prediction" value="${i}" required> ${esc(o)}</label>`).join('')}</fieldset><button class="solid">Confronta con il banco →</button></form>
      <div data-guide hidden><div class="meta" data-count></div><h2 data-step-title></h2><p data-explain></p><p class="bench-equation" data-equation></p>
      <div class="math-walk" hidden><div class="math-art" data-math-art></div><span data-math-count></span><div class="math-actions"><button data-math-back aria-label="Disegno precedente">←</button><button data-math-next>Disegno successivo →</button></div></div>
      <div class="bench-nav"><button data-prev aria-label="Passaggio precedente">← Indietro</button><button data-next class="solid">Avanti →</button></div>
      <details class="initial-choice"><summary>La tua previsione iniziale</summary><p data-response></p></details><details class="initial-choice" data-reference hidden><summary>Passaggi e misure di riferimento</summary><div data-reference-content></div></details></div>
    </aside>
    <section data-experiment hidden class="bench-experiment">
      <details class="settings-drawer" data-controls><summary>Parametri del banco</summary><div class="bench-params">${controls(model.params, defaults(model.params))}</div><div class="setting-actions"><button data-reset>${activity ? 'Prima misura' : 'Valori iniziali'}</button>${activity ? '<button data-compare>Seconda misura</button>' : ''}</div></details>
      <details class="graph-drawer" data-plots><summary>Grafici e misure</summary><div data-graphs></div></details>
    </section></div></div>
    <section data-assess hidden><h2>Metti alla prova la spiegazione</h2><div class="bench-checks">${exercises(r)}</div>${logged ? '<form class="bench-note"><label>Che cosa hai osservato?<textarea required name="note" rows="2"></textarea></label><button>Salva nel quaderno</button><p role="status"></p></form>' : ''}</section>
    <footer>${link(origin ? 'Torna all’attività' : 'Torna ai laboratori', back)} <a href="#materiale/${esc(r.skill)}/${esc(r.course)}">Lezione associata</a></footer></article>`
  );
}

export async function benchPage(id, origin, topicIndex) {
  const item = await api('/item/' + encodeURIComponent(id));
  const activity =
    item.kind === 'experiment' ? await (await import('./voci/esperimento.js')).esperienza(item) : null;
  const pilot = piloti[id];
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
  stileBanco();
  const focus = topicIndex === undefined ? null : r.topics?.[Number(topicIndex)];
  const back =
    origin && /^(?:materiale|corso|prova|lab|laboratori)(?:\/|$)/.test(origin) ? origin : 'laboratori';
  main.innerHTML = bancoMarkup(r, activity, focus, back, model, pilot, state.user, origin);
  const root = main.querySelector('.bench-room'),
    get = (sel) => root.querySelector(sel),
    canvas = get('canvas'),
    stageBox = get('.bench-stage');
  const leaveFocus = concentrazione(get('.bench-instrument'));
  const settings = get('[data-controls]'),
    plots = get('[data-plots]');
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
  const initialRate = pilot === 'volo' ? 0.5 : 1;
  let rate = initialRate;
  const touch = matchMedia('(pointer:coarse)').matches;
  let touchEnabled = !touch;
  let gpu,
    startingContext,
    world,
    drawing,
    view = 'orbit',
    available = false,
    choice;
  const media = matchMedia('(prefers-reduced-motion: reduce)'),
    graphBox = get('[data-graphs]'),
    diagram = get('[data-drawing]');
  const active = () => inViewport && !document.hidden && root.isConnected && !disposed;
  const timeline =
    activity &&
    /^(Tempo|Istante)(?: |$)/.test(r.control.label) &&
    r.control.unit === 's' &&
    r.control.min === 0;
  const duration = () => (timeline ? r.control.max : s.duration);
  const isTimed = () => duration() > 0 && stage >= 0;
  const instant = () => (pilot && model.sample ? model.sample(s, t) : {});
  function reasoning() {
    return pilot && stage === 2 ? ragionamento(pilot, p, s, t, instant())[mathStep] : null;
  }
  function sceneLevel() {
    if (!pilot || stage < 0) return stage;
    return reasoning()?.[4] ?? (stage === 0 ? 1 : 2);
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
        );
    } else gpu?.frame(t);
    if (stage < 0 || !textToo) return;
    const explanation = reasoning();
    const html = letture(
      model.readings(p, s, t).map(([label, v, unit]) => [label, typeof v === 'number' ? n(v) : v, unit]),
      explanation?.[3],
    );
    if (lastReadings !== html) {
      get('[data-readings]').innerHTML = html;
      lastReadings = html;
    }
    if (explanation) {
      get('[data-equation]').textContent = explanation[2];
      get('[data-math-art]').innerHTML = disegnoPasso(pilot, mathStep, p, s, t, instant(), explanation[0]);
    }
    if (isTimed()) {
      const time = timeline ? s.x : t;
      get('[data-time]').textContent = n(time) + ' / ' + n(duration()) + ' s';
      get('[data-scrub]').value = time;
      get('[data-scrub]').setAttribute('aria-valuetext', n(time) + ' secondi');
      if (document.activeElement !== get('[data-instant]'))
        get('[data-instant]').value = Number(time.toFixed(5));
    }
    if (['volo', 'onde'].includes(pilot)) moveCursor(graphBox, t);
    if (['tubo', 'induzione'].includes(pilot)) moveCursor(graphBox, t, 'time');
    if (pilot === 'gas') {
      const q = instant();
      moveCursor(graphBox, q.V, 'volume', q.pressure);
    }
  }
  function advanceClock(now) {
    if (last && playing) t = nextTime(t, (now - last) / 1000, duration(), rate, get('[data-loop]').checked);
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
    if (timeline) {
      const x = Math.min(duration(), Math.round(t / r.control.step) * r.control.step);
      if (x !== p.x) {
        p = { ...p, x };
        s = model.solve(p);
        draw();
        return;
      }
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
    inViewport = entries[0].isIntersecting;
    visibility();
  });
  observer.observe(stageBox);
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
    if (view !== 'diagram' && gpu) gpu.rebuild(world.build, p, s, sceneLevel());
    get('[data-legend]').textContent =
      pilot === 'induzione'
        ? 'Viola · campo imposto / n · normale positiva / rosso · corrente nel circuito chiuso'
        : activity
          ? activity.legend(stage)
          : stage < 0
            ? 'Apparato iniziale'
            : legends[r.model].slice(0, Math.min(sceneLevel() + 1, 3)).join(' · ');
    root.dataset.moment = momenti[stage + 1];
    segnaMomento(root, stage + 1, !answered);
    const caption = get('[data-caption]');
    caption.hidden = stage < 0 || !pilot;
    if (!caption.hidden)
      caption.textContent = {
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
      }[pilot];
    if (stage >= 0) {
      const explanation = reasoning();
      get('[data-reference]').hidden = !pilot || stage < 2;
      references();
      const [title, text, equation] =
        explanation || (pilot ? guidaPilota(pilot, stage) : model.steps(p, s)[stage]);
      get('[data-count]').textContent = momenti[stage + 1] + ' · ' + (stage + 2) + '/5';
      get('[data-step-title]').textContent = title;
      get('[data-explain]').textContent = text;
      get('[data-equation]').textContent = equation;
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
  async function setView(next) {
    if (next === 'diagram' && !drawing) {
      if (activity && !pilot) {
        const { disegna2D } = await import('./voci/tavola.js');
        drawing = (_, p, s, t, step, title) => disegna2D(activity.elements(s.x, step), title);
      } else drawing = (await import('./tavola.js')).drawing;
      if (disposed) return;
    }
    if (next !== 'diagram' && !available) return;
    view = next;
    const flat = next === 'diagram';
    canvas.hidden = flat;
    diagram.hidden = !flat;
    get('[data-display]').textContent = flat ? 'Tavola di misura' : '3D interattivo';
    get('[data-help]').textContent = flat
      ? available
        ? 'Schema del banco nel piano di misura.'
        : 'WebGL non disponibile. La tavola segue gli stessi parametri e calcoli.'
      : 'Trascina per ruotare. Usa due dita o la rotella per ingrandire.';
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
        'Attiva «Ruota col dito» per ruotare e ingrandire con due dita. «Scorri la pagina» restituisce lo scorrimento verticale.';
    if (!flat) gpu.view(next);
    visibility();
    draw();
  }
  async function initialize3D() {
    try {
      startingContext = canvas.getContext('webgl2', {
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
      if (disposed) return;
      world = scene;
      gpu = renderer.openScene(
        canvas,
        scene.spec,
        () => {
          available = false;
          gpu?.dispose();
          gpu = null;
          setView('diagram');
        },
        startingContext,
      );
      startingContext = null;
      available = true;
      setView('orbit');
    } catch (error) {
      if (disposed) return;
      startingContext?.getExtension('WEBGL_lose_context')?.loseContext();
      startingContext = null;
      gpu?.dispose();
      gpu = null;
      available = false;
      setView('diagram');
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
    if (pilot && !media.matches) start();
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
  get('[data-reset-view]').onclick = () => setView('orbit');
  root.querySelectorAll('[data-view]').forEach((btn) => (btn.onclick = () => setView(btn.dataset.view)));
  get('.bench-params').oninput = (e) => {
    const el = e.target,
      def = model.params.find((a) => a.key === el.name);
    if (!def) return;
    const next = { ...p, [el.name]: def.options ? el.value : Number(el.value) };
    if (!inRange(model.params, next)) return;
    stop();
    p = next;
    get('.initial-choice').open = false;
    if (r.model === 'piano' && p.mk > p.ms) {
      if (el.name === 'mk') p.ms = p.mk;
      else p.mk = p.ms;
    }
    t = 0;
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
    t = 0;
    p = defaults(model.params);
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
    leaveFocus();
    startingContext?.getExtension('WEBGL_lose_context')?.loseContext();
    startingContext = null;
    cancelAnimationFrame(raf);
    observer.disconnect();
    media.removeEventListener('change', motion);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', dispose);
    gpu?.dispose();
  }
  window.addEventListener('pagehide', dispose);
  segnaMomento(root, 0, true);
  initialize3D();
  return dispose;
}
