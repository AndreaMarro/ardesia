import { api, esc, head, main, state } from '/js/ui.js';
import { chiaveBozza } from '/js/recupero/bozza.js';

function requestId() {
  return globalThis.crypto?.randomUUID?.() || 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// A failed transport keeps its request ID so manual retries can recover the receipt.
export function eventsFor(endpoint, version, unitId, activityId) {
  const pending = new Map(), session = state.draftSession;
  return async (kind, fields = {}, id) => {
    const key = JSON.stringify([kind, fields]);
    const token = id || pending.get(key) || requestId();
    pending.set(key, token);
    const receipt = await api(endpoint + '/events',
      { requestId: token, version, unitId, ...(activityId ? {activityId} : {}), kind, ...fields },
      session ? { 'X-Officina-Session': session } : {});
    pending.delete(key);
    return receipt;
  };
}

export function correction(activity, picked, result, headingId = 'disc-result') {
  const right = activity.options.find(option => option.id === result.correctOptionId);
  const steps = result.solution.map(part => `<li><h3>${esc(part.title)}</h3><p>${esc(part.body)}</p></li>`).join('');
  return `<section class="discipline-correction" aria-labelledby="${esc(headingId)}">
    <p class="discipline-restated">${esc(activity.prompt)}</p>
    <h2 id="${esc(headingId)}" tabindex="-1">${result.correct ? 'Risposta corretta' : 'Rivedi il passaggio'}</h2>
    <p>Hai scelto <strong>${esc(picked.text)}</strong></p>
    ${!result.correct && right ? `<p>La risposta corretta è <strong>${esc(right.text)}</strong></p>` : ''}
    <p>${esc(result.feedback[picked.id])}</p>
    ${result.assisted ? '<p class="discipline-context">Il quaderno registra questo tentativo con aiuto.</p>' : ''}
    <h2>Soluzione commentata</h2><ol class="discipline-steps">${steps}</ol>
    <section class="discipline-alternatives"><h2>Confronta le alternative</h2>
      ${activity.options.map(option => `<details><summary>${esc(option.text)}</summary><p>${esc(result.feedback[option.id])}</p></details>`).join('')}</section>
    ${result.transfer ? `<section class="discipline-oral"><h2>Prova a cambiare situazione</h2>
      <p>${esc(result.transfer.prompt)}</p><details><summary>Confronta il tuo ragionamento</summary><p>${esc(result.transfer.answer)}</p></details></section>` : ''}
  </section>`;
}

export async function activityPage(data, unit, activity, events, navigation, unitRoute) {
  const options = activity.options;
  const index = unit.activities.findIndex(item => item.id === activity.id);
  const next = unit.activities[index + 1];
  const key = state.draftSession && chiaveBozza(state.draftSession, data.id, activity.id, unit.version, 'disciplina');
  let draft = {};
  if (key) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(key));
      if (stored && typeof stored === 'object' && options.some(option => option.id === stored.optionId)) draft = stored;
    } catch { // Device storage is optional.
    }
  }
  const save = () => {
    if (key) try { sessionStorage.setItem(key, JSON.stringify(draft)); } catch { // Device storage is optional.
    }
  };
  main.innerHTML = navigation + head('Esercizio ' + (index + 1), '', unit.title) +
    `<div class="discipline-practice"><form data-quiz><fieldset><legend>${esc(activity.prompt)}</legend>
       ${options.map((option, i) => `<label class="choice"><input type="radio" name="option" value="${esc(option.id)}" required
         ${draft.optionId === option.id ? 'checked' : ''}><b aria-hidden="true">${String.fromCharCode(65 + i)}</b><span>${esc(option.text)}</span></label>`).join('')}
       </fieldset>
       <div class="actions"><button class="solid">Verifica la risposta</button>
       ${activity.hintCount ? '<button type="button" data-hint>Chiedi un suggerimento</button>' : ''}</div>
    </form><div data-hints aria-live="polite"></div><p data-notice role="status"></p>
    <div data-correction></div><div class="actions"><a class="button" href="#${esc(unitRoute)}">Torna alla lezione</a>
    ${next ? `<a class="button" data-next-exercise hidden href="#${esc(unitRoute + '/' + encodeURIComponent(next.id))}">Esercizio successivo</a>` : ''}
    <button type="button" data-repeat hidden>Riprova il quesito</button>
    <button type="button" data-print hidden>Stampa lo svolgimento</button></div></div>`;
  const root = main.querySelector('.discipline-practice'), form = root.querySelector('form');
  const hint = form.querySelector('[data-hint]'), answer = form.querySelector('.solid');
  const notice = root.querySelector('[data-notice]'), printable = root.querySelector('[data-print]');
  const hintList = root.querySelector('[data-hints]'), repeat = root.querySelector('[data-repeat]');
  let hintIndex = 0, busy = false;
  function lock(value) {
    busy = value;
    form.querySelector('fieldset').disabled = value;
    answer.disabled = value;
    if (hint) hint.disabled = value || hintIndex >= activity.hintCount;
  }
  form.addEventListener('change', () => {
    draft = {optionId: new FormData(form).get('option')};
    save();
  });
  hint?.addEventListener('click', async () => {
    if (busy || hintIndex >= activity.hintCount) return;
    lock(true);
    try {
      const result = await events('hint', {hintIndex});
      const p = document.createElement('p');
      p.textContent = 'Suggerimento ' + ++hintIndex + ' · ' + result.hint;
      hintList.append(p);
      notice.textContent = '';
      if (hintIndex === activity.hintCount) {
        hint.textContent = 'Suggerimenti esauriti';
        answer.disabled = false;
        answer.focus();
      }
    } catch (error) { notice.textContent = error.message; }
    finally { lock(false); }
  });
  async function submit(option, restore = false) {
    if (!option || busy) return;
    lock(true);
    if (!draft.requestId || draft.optionId !== option.id) draft = {optionId: option.id, requestId: requestId()};
    save();
    try {
      const result = await events('answer', {optionId: option.id}, draft.requestId);
      if (!root.isConnected) return;
      root.querySelector('[data-correction]').innerHTML = correction(activity, option, result);
      root.querySelector('form').hidden = true;
      hintList.hidden = true;
      const nextLink = root.querySelector('[data-next-exercise]');
      if (nextLink) nextLink.hidden = false;
      printable.hidden = false;
      repeat.hidden = false;
      // Restore the learner's choice and response receipt ID without storing solutions on the device.
      draft.submitted = true;
      save();
      notice.textContent = restore ? 'Tentativo ritrovato nel quaderno.' : 'Tentativo salvato nel quaderno.';
      if (!restore) root.querySelector('#disc-result').focus();
    } catch (error) {
      notice.textContent = error.message + ' Puoi riprovare la verifica.';
      lock(false);
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = new FormData(form).get('option');
    submit(options.find(option => option.id === selected));
  });
  printable.addEventListener('click', () => window.print());
  repeat.addEventListener('click', () => {
    draft = {};
    save();
    lock(false);
    form.reset();
    for (const input of form.elements.option) input.checked = false;
    form.hidden = false;
    hintList.hidden = false;
    printable.hidden = repeat.hidden = true;
    root.querySelector('[data-correction]').replaceChildren();
    notice.textContent = 'Hai già letto lo svolgimento. Il quaderno terrà conto di questo aiuto.';
    form.elements.option[0].focus();
  });
  if (draft.submitted && typeof draft.requestId === 'string') {
    await submit(options.find(option => option.id === draft.optionId), true);
  }
  return notice;
}
