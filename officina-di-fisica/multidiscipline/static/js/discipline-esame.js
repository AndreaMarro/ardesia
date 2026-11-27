import { api, crumb, esc, head, link, main, state } from '/js/ui.js';
import { chiaveBozza } from '/js/recupero/bozza.js';
import { correction, eventsFor } from './discipline-pratica.js';

// Responses stay editable on this tab until delivery. Only the chosen answer and its retry key are cached.
export async function examPage(data, exam, endpoint, subjectRoute) {
  const byActivity = new Map();
  for (const course of data.courses) for (const unit of course.units) {
    for (const id of unit.activityIds) byActivity.set(id, {course, unit});
  }
  const locations = exam.activityIds.map(id => byActivity.get(id));
  if (locations.some(item => !item)) throw Error('L’indice di questa edizione è incompleto.');
  const locked = [...new Set(locations.filter(item => !item.course.accessible).map(item => item.course))];
  const heading = crumb([['Materie', 'discipline'], [data.title, subjectRoute], ['Esercitazione d’esame']]) +
    head(exam.title, exam.description, 'Esercitazione d’esame');
  if (locked.length) {
    main.innerHTML = heading + `<aside class="discipline-gate"><h2>Percorsi richiesti</h2>
      <p>La prova comprende esercizi di questi microcorsi. Apri un percorso per vedere le modalità di accesso.</p>
      <ul>${locked.map(c => `<li><a href="#${esc(subjectRoute + '/' + encodeURIComponent(c.id))}">${esc(c.title)}</a></li>`).join('')}</ul></aside>`;
    return;
  }
  main.innerHTML = heading + '<div class="discipline-exam"></div>';
  const root = main.querySelector('.discipline-exam');
  const key = state.draftSession && chiaveBozza(state.draftSession, data.id, exam.id, data.version, 'prova-disciplinare');
  let model = {phase: 'start', cursor: 0, choices: {}, tokens: {}};
  try {
    const value = key && JSON.parse(sessionStorage.getItem(key));
    if (value && ['answer', 'check', 'sending', 'finished'].includes(value.phase) && Number.isInteger(value.cursor) &&
      value.cursor >= 0 && value.cursor < locations.length && value.choices && value.tokens)
      model = value;
  } catch { // The on-page draft remains usable when device storage is disabled.
  }
  const save = () => {
    if (key) try { sessionStorage.setItem(key, JSON.stringify(model)); } catch { // The on-page draft remains usable when device storage is disabled.
    }
  };
  const units = new Map();
  async function getQuestion(i) {
    const id = locations[i].unit.id;
    if (!units.has(id)) {
      const unit = await api(endpoint + '/units/' + encodeURIComponent(id));
      if (unit.version !== data.version) throw Error('È disponibile una nuova edizione. Riapri il catalogo.');
      units.set(id, unit);
    }
    const question = units.get(id).activities.find(a => a.id === exam.activityIds[i]);
    if (!question) throw Error('Quesito assente da questa edizione.');
    return question;
  }
  const answered = () => exam.activityIds.filter(id => typeof model.choices[id] === 'string').length;
  function start() {
    root.innerHTML = `<p>${esc(exam.activityIds.length)} quesiti${exam.suggestedMinutes ? ' · ' + esc(exam.suggestedMinutes) + ' minuti suggeriti' : ''}.</p>
      <p>Puoi cambiare le risposte e lasciare quesiti in bianco. Vedrai gli svolgimenti dopo la consegna. La bozza si conserva in questa scheda del browser.</p>
      <div class="actions"><button type="button" class="solid">Inizia l’esercitazione</button></div>`;
    root.querySelector('button').onclick = () => { model.phase = 'answer'; save(); render(); };
  }
  async function questionPage() {
    const i = model.cursor, activity = await getQuestion(i);
    if (!root.isConnected) return;
    root.innerHTML = `<p class="discipline-context">Quesito ${i + 1} di ${locations.length} · ${esc(locations[i].course.title)}</p>
      <fieldset class="discipline-exam-question"><legend tabindex="-1">${esc(activity.prompt)}</legend>
      ${activity.options.map((o, idx) => `<label class="choice"><input type="radio" name="exam-choice" value="${esc(o.id)}"
        ${model.choices[activity.id] === o.id ? 'checked' : ''}><b aria-hidden="true">${String.fromCharCode(65 + idx)}</b><span>${esc(o.text)}</span></label>`).join('')}</fieldset>
      <div class="actions"><button type="button" data-clear>Lascia in bianco</button>
        ${i > 0 ? '<button type="button" data-back>Quesito precedente</button>' : ''}
        ${i < locations.length - 1 ? '<button type="button" class="solid" data-forward>Quesito successivo</button>' : ''}
        <button type="button" data-review>Rivedi e consegna</button></div><p data-exam-count role="status"></p>`;
    const status = () => { root.querySelector('[data-exam-count]').textContent = `${answered()} risposte preparate su ${locations.length}.`; };
    root.querySelector('fieldset').onchange = event => { model.choices[activity.id] = event.target.value; save(); status(); };
    root.querySelector('[data-clear]').onclick = () => {
      delete model.choices[activity.id];
      for (const input of root.querySelectorAll('input')) input.checked = false;
      save(); status();
    };
    const move = delta => { model.cursor = i + delta; save(); render(); };
    if (i > 0) root.querySelector('[data-back]').onclick = () => move(-1);
    if (i < locations.length - 1) root.querySelector('[data-forward]').onclick = () => move(1);
    root.querySelector('[data-review]').onclick = () => { model.phase = 'check'; save(); render(); };
    root.querySelector('legend').focus();
    status();
  }
  function check() {
    root.innerHTML = `<h2 tabindex="-1">Rivedi le risposte</h2><p>${answered()} quesiti con risposta su ${locations.length}. Prima di consegnare puoi rientrare in ciascun quesito.</p>
      <ol class="discipline-exam-index">${exam.activityIds.map((id, i) => `<li><button type="button" data-return="${i}">
        Quesito ${i + 1} · ${model.choices[id] ? 'con risposta' : 'in bianco'}</button></li>`).join('')}</ol>
      <div class="actions"><button type="button" class="solid" data-send ${answered() ? '' : 'disabled'}>Consegna le risposte</button></div>`;
    root.querySelector('h2').focus();
    for (const btn of root.querySelectorAll('[data-return]')) btn.onclick = () => {
      model.cursor = Number(btn.dataset.return); model.phase = 'answer'; save(); render();
    };
    root.querySelector('[data-send]').onclick = () => {
      // Freeze a key for each selected item before the first write. A partial delivery can resume safely.
      for (const id of exam.activityIds.filter(id => model.choices[id])) {
        model.tokens[id] = globalThis.crypto?.randomUUID?.() || 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2);
      }
      model.phase = 'sending'; save(); render();
    };
  }
  async function deliver() {
    root.innerHTML = '<p role="status">Apertura delle correzioni…</p>';
    const results = [];
    for (let i = 0; i < exam.activityIds.length; i++) {
      if (!root.isConnected) return;
      const activity = await getQuestion(i), picked = activity.options.find(o => o.id === model.choices[activity.id]);
      const send = eventsFor(endpoint, data.version, locations[i].unit.id, activity.id);
      const result = picked && await send('answer', {optionId: picked.id}, model.tokens[activity.id]);
      results.push({activity, picked, result});
    }
    if (!root.isConnected) return;
    model.phase = 'finished'; save();
    root.innerHTML = `<h2 tabindex="-1">Esito dell’esercitazione</h2><p>${results.filter(item => item.result?.correct).length} risposte corrette ·
      ${results.filter(item => item.picked && !item.result.correct).length} da rivedere · ${results.filter(item => !item.picked).length} in bianco.</p>
      ${results.map(({activity, picked, result}, i) => `<details class="discipline-exam-result">
        <summary>Quesito ${i + 1} · ${picked ? (result.correct ? 'corretto' : 'da rivedere') : 'in bianco'}</summary>
        ${picked ? correction(activity, picked, result, 'exam-result-' + i) : `<p>${esc(activity.prompt)}</p>
          ${link('Prova il quesito', subjectRoute + '/' + [locations[i].course.id, locations[i].unit.id, activity.id].map(encodeURIComponent).join('/'))}`}</details>`).join('')}
      <div class="actions">${link('Torna ai microcorsi', subjectRoute)}
      <button type="button" data-print>Stampa la correzione</button><button type="button" data-restart>Ricomincia l’esercitazione</button></div>`;
    root.querySelector('h2').focus();
    root.querySelector('[data-print]').onclick = () => window.print();
    root.querySelector('[data-restart]').onclick = () => {
      model = {phase: 'answer', cursor: 0, choices: {}, tokens: {}}; save(); render();
    };
  }
  async function render() {
    // Disable the old page during asynchronous navigation so two gestures cannot skip a question.
    for (const control of root.querySelectorAll('button, input')) control.disabled = true;
    try {
      if (model.phase === 'start') start();
      else if (model.phase === 'answer') await questionPage();
      else if (model.phase === 'check') check();
      else await deliver();
    } catch (error) {
      root.innerHTML = `<p role="alert">${esc(error.message)}</p><button type="button">Riprendi l’esercitazione</button>`;
      root.querySelector('button').onclick = render;
    }
  }
  await render();
}
