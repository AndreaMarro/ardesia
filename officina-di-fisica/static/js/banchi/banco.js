import { api, esc, crumb, main, state, link } from '../ui.js';
import { defaults, inRange, n } from './misure.js';
import { plot, moveCursor } from './grafici.js';
const areas = { C1: 'Meccanica', C2: 'Fluidi', C3: 'Termodinamica', C4: 'Elettricità', C5: 'Onde e ottica' };
const legends = {
  piano: [
    'Peso · rosso / Normale · verde',
    'P∥ · viola / P⊥ · ocra',
    'Attrito · grafite / F · verde / a · lime',
  ],
  volo: ['Proiezione orizzontale · verde', 'v · verde / g · rosso', 'vx · viola / vy · ocra / vz · grafite'],
  stevino: ['A · sonda mobile', 'B · presa alla stessa quota', 'Fondo · presa a 2 m'],
  tubo: ['Ingresso → uscita', 'Frecce · velocità locale / punti · traccianti', 'Anello viola · sezione'],
  gas: ['Pistone · metallo / volume · ocra', 'Freccia · spinta del gas', 'Curva p–V · isoterma dello stato'],
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
  circuito: ['R₁ · viola / R₂ · ocra', 'Frecce rosse · corrente convenzionale', 'A e B · nodi del circuito'],
  lente: [
    'F e F′ · fuochi',
    'Ocra · raggio rifratto / verde · raggio centrale',
    'Tratteggio · prolungamento / rosso · immagine',
  ],
  onde: ['S₁ e S₂ · sorgenti / P · sonda', 'Segmenti · cammini fino a P', 'Chiaro · cresta / scuro · valle'],
};
const graphite = 'Tavola 2D';
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
        `<form class="bench-check" data-check="${i}"><h3>${i ? 'Un caso diverso' : 'Verifica la misura'}</h3><p>${esc(a.prompt)}</p><label>Risposta (${esc(a.unit)}) <input name="answer" inputmode="decimal" required autocomplete="off"></label><button>Verifica</button><p role="status"></p></form>`,
    )
    .join('');
}
export async function benchPage(id, origin, topicIndex) {
  const r = await api('/item/' + encodeURIComponent(id));
  if (r.kind !== 'bench' || !Object.hasOwn(legends, r.model)) throw Error('Banco non disponibile.');
  const model = await import('./modelli/' + r.model + '.js');
  if (!document.querySelector('#bench-styles')) {
    const l = document.createElement('link');
    l.id = 'bench-styles';
    l.rel = 'stylesheet';
    l.href = '/banchi.css';
    document.head.append(l);
  }
  const focus = topicIndex === undefined ? null : r.topics?.[Number(topicIndex)];
  const back = origin && /^(?:materiale|corso|prova|laboratori)(?:\/|$)/.test(origin) ? origin : 'laboratori';
  main.innerHTML =
    crumb([['Laboratori', 'laboratori'], [r.course + ' · ' + areas[r.course]]]) +
    `<article class="bench-room" data-bench="${r.id}">
 <header class="bench-head"><div><div class="meta">Banco ${esc(r.id.slice(-2))} · ${esc(areas[r.course])}</div><h1>${esc(r.title)}</h1><p>${esc(focus?.question || r.summary)}</p></div><img src="/identita/segno.svg" width="54" height="54" alt="Cric"></header>
 <div class="bench-work"><section class="bench-instrument" aria-label="Strumento di osservazione"><div class="bench-strip"><strong>Banco sperimentale</strong><span data-display>Preparazione della vista…</span></div>
 <div class="bench-stage"><canvas tabindex="0" aria-label="${esc(r.title)}. Frecce per ruotare, più e meno per lo zoom, Home per la vista iniziale."></canvas><div data-drawing hidden></div></div>
 <div data-legend class="bench-key"></div><div class="bench-views" aria-label="Viste del banco"><button data-view="orbit">Obliqua</button><button data-view="top">Alto</button><button data-view="side">Laterale</button>${r.model === 'onde' ? '<button data-view="section">Sezione</button>' : ''}<button data-view="diagram">${graphite}</button><button data-reset-view aria-label="Ripristina vista">↺ Vista</button></div>
 <p class="bench-help" data-help>Trascina per ruotare. Usa due dita o la rotella per ingrandire.</p>
 <div class="bench-time" hidden><button data-play>Avvia</button><label>Tempo <output data-time></output><input data-scrub type="range" min="0" max="1" step="0.001" value="0"></label></div>
 <div data-readings class="bench-readings"></div></section>
 <aside class="bench-desk"><form data-predict><div class="meta">Prima della misura</div><h2>Fai una previsione</h2><fieldset><legend>${esc(r.prediction.question)}</legend>${r.prediction.options.map((o, i) => `<label><input type="radio" name="prediction" value="${i}" required> ${esc(o)}</label>`).join('')}</fieldset><button class="solid">Confronta con il banco</button></form>
 <div data-guide hidden><div class="bench-stepbar"><span class="meta" data-count></span><span aria-hidden="true">✳</span></div><h2 data-step-title></h2><p data-explain></p><p class="bench-equation" data-equation></p><div class="bench-nav"><button data-prev aria-label="Passaggio precedente">←</button><button data-next class="solid">Passaggio successivo →</button></div><details><summary>La tua previsione iniziale</summary><p>${esc(r.prediction.question)}</p><p data-response></p></details></div>
 </aside></div>
 <p class="bench-warning" role="status" hidden></p>
 <section data-experiment hidden class="bench-experiment"><div><div class="rule-head"><h2>Regola il banco</h2><button data-reset>Valori iniziali</button></div><div class="bench-params">${controls(model.params, defaults(model.params))}</div></div><div data-graphs></div></section>
 <section data-assess hidden><h2>Dal banco al problema</h2><div class="bench-checks">${exercises(r)}</div>${state.user ? '<form class="bench-note"><label>Che cosa hai osservato?<textarea required name="note" rows="2"></textarea></label><button>Salva nel quaderno</button><p role="status"></p></form>' : ''}</section>
 <footer>${link(origin ? 'Torna all’attività' : 'Torna ai laboratori', back)} <a href="#materiale/${esc(r.skill)}/${esc(r.course)}">Lezione associata</a></footer></article>`;
  const root = main.querySelector('.bench-room'),
    get = (sel) => root.querySelector(sel),
    canvas = get('canvas'),
    stageBox = get('.bench-stage');
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
  const isTimed = () => s.duration > 0 && stage >= (r.model === 'tubo' || r.model === 'volo' ? 1 : 0);
  function measurements() {
    const reads = model.readings(p, s, t);
    get('[data-readings]').innerHTML = reads
      .map(
        ([label, v, u]) =>
          `<div><span>${esc(label)}</span><strong>${esc(typeof v === 'string' ? v : n(v))} <small>${esc(u)}</small></strong></div>`,
      )
      .join('');
  }
  function frame(textToo = true) {
    if (view === 'diagram') {
      if (textToo) diagram.innerHTML = drawing(r.model, p, s, t, stage, r.title);
    } else gpu?.frame(t);
    if (stage >= 0 && textToo) {
      measurements();
      get('[data-time]').textContent = n(t) + ' s';
      get('[data-scrub]').value = s.duration ? t / s.duration : 0;
      if (['volo', 'onde'].includes(r.model)) moveCursor(graphBox, t);
    }
  }
  function stop() {
    playing = false;
    last = 0;
    cancelAnimationFrame(raf);
    raf = 0;
    get('[data-play]').textContent = t >= s.duration ? 'Ripeti' : 'Avvia';
  }
  function tick(now) {
    raf = 0;
    if (!active() || !playing) {
      last = 0;
      return;
    }
    if (last) t = Math.min(s.duration, t + (now - last) / 1000);
    last = now;
    const fresh = now - lastText >= 90 || t >= s.duration;
    frame(fresh);
    if (fresh) lastText = now;
    if (t >= s.duration) {
      stop();
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  function visibility() {
    gpu?.visible(active() && view !== 'diagram');
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (playing && active()) raf = requestAnimationFrame(tick);
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
  function draw() {
    if (view !== 'diagram' && gpu) gpu.rebuild(world.build, p, s, stage);
    get('[data-legend]').textContent =
      stage < 0 ? 'Apparato iniziale' : legends[r.model].slice(0, Math.min(stage + 1, 3)).join('   ·   ');
    if (stage >= 0) {
      const steps = model.steps(p, s),
        [title, text, equation] = steps[stage];
      get('[data-count]').textContent = 'Passaggio ' + (stage + 1) + ' di ' + steps.length;
      get('[data-step-title]').textContent = title;
      get('[data-explain]').textContent = text;
      get('[data-equation]').textContent = equation;
      get('[data-prev]').disabled = stage === 0;
      get('[data-next]').textContent =
        stage === steps.length - 1 ? 'Vai alla verifica ↓' : 'Passaggio successivo →';
      const warn = model.warning?.(p, s) || '';
      get('.bench-warning').textContent = warn;
      get('.bench-warning').hidden = !warn;
      graphBox.innerHTML = model.graphs(p, s, t, stage).map(plot).join('');
      get('.bench-time').hidden = !isTimed();
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
      drawing = (await import('./tavola.js')).drawing;
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
        import('./scene/' + r.model + '.js'),
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
  get('[data-predict]').onsubmit = (e) => {
    e.preventDefault();
    choice = Number(new FormData(e.currentTarget).get('prediction'));
    stage = 0;
    get('[data-response]').textContent =
      'Hai scelto «' +
      r.prediction.options[choice] +
      '». ' +
      (choice === r.prediction.correct ? 'Previsione corretta. ' : 'Confronta con il modello. ') +
      r.prediction.why;
    e.currentTarget.hidden = true;
    get('[data-guide]').hidden = false;
    get('[data-experiment]').hidden = false;
    get('[data-guide] details').open = true;
    draw();
  };
  function goStep(next) {
    get('[data-guide] details').open = false;
    stop();
    stage = next;
    t = 0;
    get('[data-assess]').hidden = stage < 3;
    draw();
  }
  get('[data-prev]').onclick = () => goStep(stage - 1);
  get('[data-next]').onclick = () =>
    stage === 3 ? get('[data-assess]').scrollIntoView() : goStep(stage + 1);
  get('[data-reset-view]').onclick = () => setView('orbit');
  root.querySelectorAll('[data-view]').forEach((btn) => (btn.onclick = () => setView(btn.dataset.view)));
  get('.bench-params').oninput = (e) => {
    const el = e.target,
      def = model.params.find((a) => a.key === el.name);
    if (!def) return;
    const next = { ...p, [el.name]: def.options ? el.value : Number(el.value) };
    if (!inRange(model.params, next)) return;
    p = next;
    get('[data-guide] details').open = false;
    if (r.model === 'piano' && p.mk > p.ms) {
      if (el.name === 'mk') p.ms = p.mk;
      else p.mk = p.ms;
    }
    stop();
    t = 0;
    s = model.solve(p);
    draw();
  };
  get('[data-reset]').onclick = () => {
    stop();
    t = 0;
    p = defaults(model.params);
    s = model.solve(p);
    draw();
  };
  get('[data-play]').onclick = () => {
    if (playing) return stop();
    if (t >= s.duration) t = 0;
    playing = true;
    get('[data-play]').textContent = 'Pausa';
    visibility();
  };
  get('[data-scrub]').oninput = (e) => {
    stop();
    t = Number(e.target.value) * s.duration;
    frame();
  };
  root.querySelectorAll('[data-check]').forEach(
    (form) =>
      (form.onsubmit = (e) => {
        e.preventDefault();
        const a = r.assessment[Number(form.dataset.check)],
          answer = Number(form.elements.answer.value.trim().replace(',', '.'));
        const ok =
          Number.isFinite(answer) && Math.abs(answer - a.value) <= Math.max(0.001, Math.abs(a.value) * 0.005);
        form.querySelector('[role=status]').textContent =
          (ok ? 'Corretto. ' : 'Rivedi il calcolo. ') + a.worked;
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
          parameters: JSON.stringify(p),
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
  initialize3D();
  return dispose;
}
