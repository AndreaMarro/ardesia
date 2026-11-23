import { traiettoria } from './cinematica.js';
import {
  chiaveBozza,
  leggiBozza,
  salvaBozza,
  modificaRisposta,
  controllaRisposta,
  consultaAiuto,
} from './bozza.js';
import { firma, montaPista } from './pista.js';

function riscontro(code, model) {
  const end = model.at(model.duration);
  const forward = model.at(model.boundaries[1]).displacement;
  switch (code) {
    case 'corretto':
      return (
        'Correzione verificata. All’andata conti ' +
        firma(forward) +
        ' m, al ritorno ' +
        firma(end.displacement - forward) +
        ' m. La somma dà uno spostamento di ' +
        firma(end.displacement) +
        ' m. ' +
        (end.displacement === 0
          ? 'Sei tornato alla partenza.'
          : 'Ti fermi ' +
            Math.abs(end.displacement) +
            ' m ' +
            (end.displacement < 0 ? 'a sinistra' : 'a destra') +
            ' della partenza.')
      );
    case 'segno':
      return (
        'Modulo corretto, segno errato. Lo scarto è di ' +
        Math.abs(end.displacement) +
        ' m. Da quale lato dello zero si ferma il carrello?'
      );
    case 'distanza':
      return (
        end.distance + ' m è la distanza percorsa. Per lo spostamento conta anche il verso dei due tratti.'
      );
    case 'numero':
      return 'Scrivi un numero in metri. Puoi usare il tasto «Cambia segno».';
    default:
      return 'Calcola i metri di ciascun tratto moltiplicando velocità e durata. Poi somma i contributi con il loro segno.';
  }
}

export function montaRecupero(shell, entry, run, item) {
  const { session, variant } = item.formative;
  const model = traiettoria(variant);
  const [andata, ritorno] = variant.legs;
  const key = chiaveBozza(session, run.id, item.id, item.version, variant.id);
  let state = leggiBozza(key, model),
    track = null;
  const panel = document.createElement('section');
  panel.className = 'campo-recupero';
  panel.hidden = true;
  shell.after(panel);
  panel.innerHTML = `
    <header class="campo-intestazione"><span data-fonte></span>
      <button type="button" data-torna>Torna al quesito</button></header>
    <h1 tabindex="-1">Il ritorno dura ${ritorno.duration} secondi</h1>
    <p class="campo-consegna">Il carrello parte da zero. Avanza a <strong>${firma(andata.velocity)} m/s per ${andata.duration} s</strong>,
      poi torna a <strong>${firma(ritorno.velocity)} m/s per ${ritorno.duration} s</strong>.
      Qual è lo spostamento finale rispetto alla partenza?</p>
    <form data-risposta novalidate>
      <label for="campo-valore">Spostamento finale (m)</label>
      <div class="campo-scrittura"><input id="campo-valore" inputmode="decimal" maxlength="32" autocomplete="off" spellcheck="false">
        <button type="button" data-segno>Cambia segno</button></div>
      <p data-bozza></p><button class="solid" type="submit">Verifica lo spostamento</button>
    </form>
    <p id="campo-riscontro" class="campo-riscontro" tabindex="-1" hidden></p>
    <details data-precedente hidden><summary>Ultimo invio verificato</summary><p></p></details>
    <p data-aiuti class="small" hidden></p>
    <button type="button" data-apri-pista hidden>Rivedi questi ${ritorno.duration} s sulla pista</button>
    <section data-banco class="campo-banco" aria-labelledby="campo-titolo-pista" hidden>
      <h2 id="campo-titolo-pista" tabindex="-1">Misura la posizione</h2>
      <p>Lo zero segna la partenza. Avanza di un secondo alla volta e osserva da che parte arrivi.</p>
      <div class="campo-viste" role="group" aria-label="Rappresentazione"><button type="button" data-vista="pista">Pista</button><button type="button" data-vista="tabella">Tabella</button></div>
      <figure data-figura><div class="campo-quadro"><canvas hidden tabindex="0" role="img"></canvas><div data-pista-piana></div></div><figcaption data-vista-pista></figcaption></figure>
      <table data-tabella hidden><caption>Misure fino all’istante scelto</caption><thead><tr><th scope="col">Tempo (s)</th><th scope="col">Posizione (m)</th><th scope="col">Distanza (m)</th></tr></thead><tbody></tbody></table>
      <p class="campo-lettura" data-lettura></p><p class="campo-tratti" data-tratti></p>
      <label for="campo-tempo">Istante sulla pista (s)</label>
      <input id="campo-tempo" type="range" min="0" max="${model.duration}" step="1" aria-describedby="campo-istruzioni">
      <p id="campo-istruzioni" class="small">Usa le frecce o i pulsanti per cambiare istante.</p>
      <div class="campo-tempo"><button type="button" data-meno>−1 s</button><button type="button" data-piu>+1 s</button></div>
      <button type="button" data-rispondi>Torna alla risposta</button>
    </section>
    <p role="status" data-salvataggio></p>`;
  const get = (selector) => panel.querySelector(selector);
  get('[data-fonte]').textContent = item.id + ' · Recupero formativo';
  const field = get('#campo-valore'),
    feedback = get('#campo-riscontro'),
    slider = get('#campo-tempo');
  function save() {
    if (!salvaBozza(key, state))
      get('[data-salvataggio]').textContent =
        'Questo browser non consente il salvataggio della bozza. Puoi continuare in questa pagina.';
  }
  function showResult() {
    const checked = state.status !== 'bozza';
    const previous = get('[data-precedente]');
    get('[data-bozza]').textContent = !checked && state.answer ? 'Bozza da verificare.' : '';
    feedback.hidden = !checked;
    feedback.textContent = checked ? riscontro(state.last.feedback, model) : '';
    feedback.classList.toggle('campo-esatto', state.status === 'correzione');
    if (state.status === 'errore') {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', feedback.id);
    } else {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
    previous.hidden = checked || !state.last || state.view !== 'risposta';
    if (!previous.hidden)
      previous.querySelector('p').textContent =
        (state.last.answer || 'Risposta vuota') + ' · ' + riscontro(state.last.feedback, model);
    const aids = get('[data-aiuti]');
    aids.hidden = !state.helps.length;
    aids.textContent =
      'Aiuti consultati · ' +
      state.helps.join(', ') +
      '.' +
      (checked && state.last.assisted ? ' Hai usato un aiuto prima di questo invio.' : '');
    get('[data-apri-pista]').hidden = !state.last || state.view !== 'risposta';
  }
  function showTime() {
    const point = model.at(state.time);
    slider.value = String(point.time);
    slider.setAttribute('aria-valuetext', point.time + ' secondi, posizione ' + firma(point.x) + ' metri');
    get('[data-meno]').disabled = point.time === 0;
    get('[data-piu]').disabled = point.time === model.duration;
    get('[data-lettura]').textContent =
      'A ' +
      point.time +
      ' s · posizione ' +
      firma(point.x) +
      ' m · distanza percorsa ' +
      point.distance +
      ' m';
    const forward = model.at(Math.min(point.time, andata.duration)).displacement;
    get('[data-tratti]').textContent =
      'Andata ' + firma(forward) + ' m · ritorno ' + firma(point.displacement - forward) + ' m';
    if (state.view === 'tabella') {
      const times = [...new Set([0, andata.duration, point.time])]
        .filter((t) => t <= point.time)
        .sort((a, b) => a - b);
      get('tbody').innerHTML = times
        .map((t) => {
          const s = model.at(t);
          return `<tr${t === point.time ? ' aria-current="true"' : ''}><th scope="row">${t}</th><td>${firma(s.x)}</td><td>${s.distance}</td></tr>`;
        })
        .join('');
    }
    track?.draw(point.time);
  }
  function showView() {
    const bank = get('[data-banco]');
    const onTrack = state.view === 'pista';
    bank.hidden = state.view === 'risposta';
    get('form').hidden = !bank.hidden;
    get('[data-figura]').hidden = !onTrack;
    get('[data-tabella]').hidden = state.view !== 'tabella';
    for (const button of panel.querySelectorAll('[data-vista]'))
      button.setAttribute('aria-pressed', String(state.view === button.dataset.vista));
    if (!onTrack) {
      track?.dispose();
      track = null;
    }
    if (onTrack && !track) track = montaPista(get('[data-figura]'), model, state.time);
    showTime();
    showResult();
  }
  function open() {
    shell.hidden = true;
    panel.hidden = false;
    document.title = 'Il ritorno di ' + ritorno.duration + ' s · Officina di Fisica';
    field.value = state.answer;
    showView();
  }
  function edit() {
    state = modificaRisposta(state, field.value);
    showResult();
    save();
  }
  entry.onclick = () => {
    state = { ...state, open: true };
    save();
    open();
    get('h1').focus();
  };
  get('[data-torna]').onclick = () => {
    state = { ...state, open: false };
    save();
    track?.dispose();
    track = null;
    panel.hidden = true;
    shell.hidden = false;
    document.title = shell.querySelector('h1').textContent + ' · Andrea Marro';
    entry.focus();
  };
  field.oninput = edit;
  get('[data-segno]').onclick = () => {
    field.value = /^[−-]/.test(field.value)
      ? field.value.slice(1)
      : ('−' + field.value.replace(/^\+/, '')).slice(0, 32);
    edit();
    field.focus();
  };
  get('form').onsubmit = (event) => {
    event.preventDefault();
    state = controllaRisposta(state, model.at(model.duration));
    save();
    showResult();
    feedback.focus();
  };
  function choose(view) {
    state = consultaAiuto(state, view);
    save();
    showView();
  }
  get('[data-apri-pista]').onclick = () => {
    choose('pista');
    get('#campo-titolo-pista').focus();
  };
  for (const button of panel.querySelectorAll('[data-vista]'))
    button.onclick = () => choose(button.dataset.vista);
  const setTime = (time) => {
    state = { ...state, time };
    save();
    showTime();
  };
  slider.oninput = () => setTime(slider.valueAsNumber);
  for (const [sel, delta] of [
    ['[data-meno]', -1],
    ['[data-piu]', 1],
  ])
    get(sel).onclick = () => {
      setTime(Math.min(model.duration, Math.max(0, state.time + delta)));
      if (get(sel).disabled) slider.focus();
    };
  get('[data-rispondi]').onclick = () => {
    state = { ...state, view: 'risposta' };
    save();
    showView();
    field.focus();
  };
  if (state.open) open();
  return {
    focus: state.open
      ? state.view !== 'risposta'
        ? slider
        : state.status === 'bozza'
          ? field
          : feedback
      : null,
    dispose() {
      track?.dispose();
      track = null;
    },
  };
}
