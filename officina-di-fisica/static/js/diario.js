import { api, crumb, date, esc, go, link, main, refresh, runAction, state } from './ui.js';
import { login } from './account.js';

const route = (course, page, minutes) => 'studio/diario/' + encodeURIComponent(course) + '/' + page + '/' + minutes;
const day = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

function resource(item, course) {
  if (item.kind === 'lab') return 'lab/' + encodeURIComponent(item.id) + '/' + encodeURIComponent(course);
  if (['bench', 'experiment'].includes(item.kind))
    return 'banco/' + encodeURIComponent(item.id) + '/' + encodeURIComponent(location.hash.slice(1));
  return 'materiale/' + encodeURIComponent(item.id) + '/' + encodeURIComponent(course);
}

function action(entry, step, index, course, primary = false) {
  const item = entry[step];
  const labels = { prerequisite: 'Richiama le basi', explanation: 'Rileggi la spiegazione', representation: 'Osserva il modello' };
  if (labels[step] && item) {
    const label = primary ? labels[step] : esc(item.title);
    return link(label, resource(item, course), primary);
  }
  if (step === 'retry' && entry.retryAvailable)
    return `<button type="button" data-diario-retest="${index}"${primary ? ' class="solid"' : ''}>Prova un caso diverso</button>`;
  return '';
}

function card(entry, index, course, selected) {
  const evidence = entry.observed;
  const resourceStep = (step, heading) => '<li><strong>' + heading + '</strong> ' +
    (action(entry, step, index, course) || '<span>Risorsa attualmente indisponibile.</span>') + '</li>';
  const question = entry.question;
  const original = question
    ? '<p>' + esc(question.id) + ' · edizione ' + question.version + '</p>'
    : '<p>Recupero da una simulazione d’esame consegnata.</p>';
  const submitted = question ? '<details class="diary-steps"><summary>Rivedi la tua risposta</summary><p>' +
    esc(question.prompt) + '</p><p>Hai risposto <strong>' + esc(question.response) +
    (question.unit && question.unit !== '1' ? ' ' + esc(question.unit) : '') + '</strong>.</p></details>' : '';
  const history = [
    entry.assisted ? 'Risposta iniziale con supporto.' : 'Risposta iniziale autonoma.',
    entry.hints ? 'Indizi aperti in quel tentativo: ' + entry.hints + '.' : '',
    entry.solutionAvailable ? 'Svolgimento disponibile per questa edizione.' : '',
    evidence.assistedAfter ? 'Risposte successive con supporto: ' + evidence.assistedAfter + '.' : '',
    evidence.transferAt !== null ? 'Risposta autonoma su una famiglia diversa il ' + date(evidence.transferAt) + '.' : '',
    evidence.reviewedAt !== null ? 'Ripasso con risposta corretta il ' + date(evidence.reviewedAt) + '.' : '',
    evidence.delayedAt !== null ? 'Un’ulteriore famiglia risolta autonomamente a distanza il ' + date(evidence.delayedAt) + '.' : '',
  ].filter(Boolean);
  const retry = action(entry, 'retry', index, course);
  const next = action(entry, entry.next.step, index, course, true);
  const familiar = entry.retryAvailable && !entry.retryFresh ? 'Hai già incontrato questo esercizio nel quaderno.' : '';
  return `<details class="diary-entry" name="diary-cases" data-diario-item="${index}" data-run="${esc(entry.run)}" data-index="${entry.index}"${selected ? ' open' : ''}>
    <summary><span class="diary-date">${esc(date(entry.at))}</span><strong>${esc(entry.title)}</strong></summary>
    <div class="diary-body">${original}<h3>${esc(entry.category)}</h3><p>${esc(entry.diagnosis)}</p>
      <p class="diary-why">${esc(entry.next.reason)} ${entry.next.step === 'retry' ? familiar : ''}</p>${next}
      ${submitted}<details class="diary-steps"><summary>Passaggi del recupero</summary>
        <ol>${resourceStep('prerequisite', 'Prerequisito')}${resourceStep('explanation', 'Spiegazione')}${resourceStep('representation', 'Rappresentazione')}
          <li><strong>Spiega il passaggio.</strong> A voce o su carta, indica quale grandezza controlli e perché.</li>
          <li><strong>Verifica autonoma.</strong> ${retry || 'In questa edizione manca un’altra famiglia disponibile.'}
          ${familiar}</li></ol>
      </details>
      <details class="diary-steps"><summary>Tentativi e aiuti</summary><ul>${history.map(t => '<li>' + esc(t) + '</li>').join('')}</ul></details>
      <p class="diary-review">${evidence.reviewedAt !== null ? 'Ripasso registrato il ' : 'Riprova dal '}${day.format((evidence.reviewedAt ?? evidence.due) * 1000)}</p>
    </div></details>`;
}

export async function diaryPage(course, page = '1', minutes = '5') {
  await refresh();
  if (!state.user) return login(['entra', 'studio', 'diario', ...(course ? [course, page, minutes] : [])]);
  const owned = state.courses.filter(item => item.owned);
  if (!owned.length && !course) {
    main.innerHTML = crumb([['Il mio studio', 'studio'], ['Diario degli errori']]) +
      '<h1>Diario degli errori</h1><p>Apri un percorso per ritrovare gli errori dei tuoi tentativi.</p>' + link('Vai ai percorsi', 'percorsi');
    return;
  }
  course ||= (owned.find(c => c.includes?.length) || owned[0]).id;
  const base = '/v1/courses/' + encodeURIComponent(course) + '/error-diary';
  const result = await api(base + '?' + new URLSearchParams({ page, minutes }));
  const saved = history.state?.diary;
  const reopened = saved?.session === state.draftSession && result.items.findIndex(a => a.run === saved.run && a.index === saved.index);
  const chosen = Number.isInteger(reopened) && reopened >= 0 ? reopened : 0;
  const opts = (list, current) => list.map(([key, text]) => `<option value="${esc(key)}"${String(key) === String(current) ? ' selected' : ''}>${esc(text)}</option>`).join('');
  const pages = Math.ceil(result.total / result.pageSize);
  const totalLabel = ['Nessun errore registrato', 'Un errore registrato'][result.total] || result.total + ' errori registrati';
  const pager = [];
  if (result.page > 1) pager.push(link('Precedente', route(course, Math.min(result.page - 1, pages || 1), minutes)));
  if (result.page < pages) pager.push(link('Successiva', route(course, result.page + 1, minutes)));
  main.innerHTML = crumb([['Il mio studio', 'studio'], ['Diario degli errori']]) + `<section class="diary-page">
    <h1>Diario degli errori</h1><form class="diary-filter">
      <div><label for="diary-course">Percorso</label><select id="diary-course" name="course">${opts(owned.map(c => [c.id,c.id+' · '+c.title]), course)}</select></div>
      <div><label for="diary-minutes">Tempo disponibile</label><select id="diary-minutes" name="minutes">${opts([[5,'5 minuti'],[15,'15 minuti']], minutes)}</select></div>
      <button>Aggiorna diario</button></form>
    <h2 tabindex="-1" id="diary-total">${totalLabel}</h2>
    ${pages > 1 ? '<p>Pagina ' + result.page + ' di ' + pages + '</p>' : ''}
    ${result.items.map((e,i) => card(e,i,course,i===chosen)).join('') || '<p>' + (result.total ? 'Questa pagina è fuori dall’elenco.' : 'Qui ritroverai i passaggi da riprendere dopo una risposta errata. Puoi iniziare con un esercizio del percorso.') + '</p>'}
    ${pager.length ? '<nav class="actions" aria-label="Pagine del diario">' + pager.join('') + '</nav>' : ''}
    <div class="actions">${link('Apri l’allenamento', 'allenamento/' + encodeURIComponent(course))}${link('Torna al quaderno', 'studio')}</div></section>`;
  const form = main.querySelector('.diary-filter');
  form.onsubmit = event => { event.preventDefault(); go(route(form.elements.course.value,1,form.elements.minutes.value)); };
  const tokens = new Map();
  const remember = (index) => {
    const entry = result.items[index];
    history.replaceState({ ...history.state, diary: { session: state.draftSession, run:entry.run, index:entry.index } }, '');
  };
  for (const el of main.querySelectorAll('[data-diario-item]')) {
    el.querySelector('summary').onclick = () => remember(Number(el.dataset.diarioItem));
    el.addEventListener('click', e => {
      const source = e.target.closest('a[href]');
      if (!source) return;
      main.querySelector('[data-diary-origin]')?.removeAttribute('data-diary-origin');
      source.setAttribute('data-diary-origin', '');
      remember(Number(el.dataset.diarioItem));
    });
  }
  for (const btn of main.querySelectorAll('[data-diario-retest]')) {
    btn.onclick = () => runAction(btn, async () => {
      const index = Number(btn.dataset.diarioRetest), item = result.items[index];
      remember(index);
      if (!tokens.has(index)) tokens.set(index, globalThis.crypto?.randomUUID?.() || 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2));
      const attempt = await api(base + '/retest', { run:item.run, index:item.index, requestId:tokens.get(index) });
      go('prova/' + encodeURIComponent(attempt.id));
    });
  }
  return Number.isInteger(reopened) && reopened >= 0 ? main.querySelector('[data-diario-item="' + reopened + '"] summary') : main.querySelector('#diary-total');
}
