import {
  main,
  state,
  $,
  $$,
  api,
  go,
  esc,
  link,
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
  inputFor,
  answerText,
  errorNames,
  modeNames,
  startRun,
  num,
} from './ui.js';

import { vignetta } from './anteprima.js';

export function recoveryCollection(node, items, course) {
  const questions = items.filter((item) => item.kind === 'question');
  if (!questions.length) {
    node.textContent =
      'Le schede di recupero saranno disponibili con i primi quesiti pubblicati di questo corso.';
    return;
  }
  const index = new Map(items.map((item) => [item.id, item]));
  const skills = [...new Set(questions.map((q) => q.skill))];
  const option = (id, title) => `<option value="${esc(id)}">${esc(title)}</option>`;
  node.innerHTML = `<h2>Errori da riconoscere</h2><p>Scegli una competenza e una situazione. Ricostruisci il passaggio che può trarre in inganno, poi mettilo alla prova su un altro problema.</p>
    <form id="choose-recovery" class="form"><label><span id="recovery-skill-label">Competenza</span><select name="skill" aria-labelledby="recovery-skill-label">${skills.map((key) => option(key, index.get(key)?.title || key)).join('')}</select></label>
    <label><span id="recovery-scenario-label">Situazione</span><select name="scenario" aria-labelledby="recovery-scenario-label"></select></label><div><button class="solid">Apri la scheda di recupero</button></div>
    <p class="helper">Dopo aver consultato la scheda, un tentativo sullo stesso quesito e sulla stessa versione conta come assistito.</p><p role="status" id="action-status"></p></form>
    <div id="scheda-recupero" aria-live="polite"></div>`;
  const form = node.querySelector('form');
  const { skill, scenario } = form.elements;
  const sheet = node.querySelector('#scheda-recupero');
  const clear = () => sheet.replaceChildren();
  const list = () => {
    scenario.innerHTML = questions
      .filter((q) => q.skill === skill.value)
      .map((q) => option(q.id, q.title))
      .join('');
    clear();
  };
  skill.addEventListener('change', list);
  scenario.addEventListener('change', clear);
  list();
  on(
    '#choose-recovery',
    'submit',
    async () => {
      const q = index.get(scenario.value);
      const result = await api('/recupero', { course, id: q.id });
      if (!node.isConnected || scenario.value !== q.id) return;
      const target = result.target;
      sheet.innerHTML = `<article class="reader sheetpanel"><div class="meta">${esc(errorNames[result.error.category] || result.error.category)}</div><h3>${esc(q.title)}</h3><p>${esc(result.prompt)}</p>
      ${blocks(result.figures)}${result.options.length ? `<ol type="A">${result.options.map((v) => `<li>${esc(v)}</li>`).join('')}</ol>` : ''}
      <div class="callout">${vignetta('riprendi')}<h3>Il passaggio da controllare</h3><p>${esc(result.error.message)}</p></div>
      <details><summary>Segui lo svolgimento</summary>${blocks(result.solution)}</details>
      <div class="actions">${target ? link(target.kind === 'lab' ? 'Osserva il laboratorio' : 'Riprendi la spiegazione', (target.kind === 'lab' ? 'lab/' : 'materiale/') + target.id + '/' + course) : ''}${result.canRetest ? button('Prova un caso diverso', 'recovery-retest', true) : ''}</div></article>`;
      typeset(sheet);
      on(
        '#recovery-retest',
        'click',
        () => startRun({ course, mode: 'retest', skill: q.skill, exclude: q.id }),
        sheet,
      );
    },
    node,
  );
}

export async function trainPage(id) {
  const c = state.courses.find((c) => c.id === id);
  if (!c) throw Error('Corso non disponibile.');
  const activities =
    id === 'C6'
      ? [
          ['diagnosis', 'Diagnosi d’ingresso', 'Due passaggi per area, con correzione dopo la consegna.'],
          ['mixed', 'Problemi misti', 'Scegli il modello leggendo la situazione.'],
          [
            'practice',
            'Allenamento adattivo',
            'Cinque situazioni selezionate usando tentativi e prerequisiti.',
          ],
        ]
      : [
          [
            'practice',
            'Allenamento adattivo',
            'Ricevi un riscontro dopo ogni risposta e usa gli aiuti quando servono.',
          ],
          ['mid:1', 'Verifica intermedia I', 'Prima metà delle competenze del modulo.'],
          ['mid:2', 'Verifica intermedia II', 'Seconda metà delle competenze del modulo.'],
          ['final', 'Verifica finale', 'Un campione di tutte le competenze, con correzione alla consegna.'],
        ];
  main.innerHTML =
    crumb([['Percorsi', 'percorsi'], [c.title, 'corso/' + id], ['Attività']]) +
    head('Mettiti alla prova', c.title) +
    (!c.owned ? gate(id) : '') +
    `<section class="big-list">${activities.map(([v, t, s], i) => `<article class="order"><h3>${t}</h3><p>${s}</p>${c.owned ? `<button class="textbtn" id="act-${i}">Inizia · ${esc(t)}</button>` : ''}</article>`).join('')}</section>${id === 'C6' ? `<section class="sheetpanel"><h2>Simulazioni di Fisica</h2><p>21 quesiti a scelta fra cinque opzioni e 10 completamenti. Hai 50 minuti. Una risposta corretta vale +1, un errore −0,1 e un’omissione 0. I risultati e le soluzioni si aprono alla consegna o alla scadenza.</p><p class="helper">Puoi confermare una risposta e correggerla una volta. La scelta esplicita di omettere è definitiva. Le risposte già registrate restano salvate anche cambiando dispositivo.</p>${c.owned ? `<label class="field">Durata<select id="minutes"><option value="50">50 minuti · ordinaria</option><option value="65">65 minuti · allenamento con +30%</option><option value="75">75 minuti · allenamento con +50%</option></select></label><div class="actions">${[1, 2, 3].map((i) => button('Avvia fascicolo ' + i, 'exam-' + i, true)).join('')}</div>` : ''}<a href="#fonti">Regole e fonti ministeriali</a></section>` : ''}`;
  demo('allenamento/' + id);
  activities.forEach(([v], i) =>
    on('#act-' + i, 'click', () => {
      const [mode, part] = v.split(':');
      return startRun({ course: id, mode, part: Number(part) || 1 });
    }),
  );
  [1, 2, 3].forEach((i) =>
    on('#exam-' + i, 'click', () =>
      startRun({ course: id, mode: 'exam', exam: i, minutes: Number($('#minutes').value) }),
    ),
  );
}
let timer = 0;
export async function runPage(id, initial) {
  clearInterval(timer);
  let run = await api('/run/' + id),
    idx = Math.min(
      Math.max(Number.isInteger(initial) ? initial : run.items.findIndex((q) => !q.sent), 0),
      run.items.length - 1,
    );
  const jump = (n) => go('prova/' + id + '/' + n);
  const send = async (action, extra = {}) => {
    run = await api('/run/' + id, { action, idx, ...extra });
    draw();
  };
  function draw() {
    clearInterval(timer);
    const q = run.items[idx],
      exam = run.mode === 'exam';
    const feedback = q.correct !== undefined;
    const noEdit = Boolean(run.finished || (!run.sealed && q.sent) || (exam && (q.blank || q.changes >= 2)));
    const score = run.result;
    let diagnosis = '';
    if (feedback && q.correct === false) {
      const target = q.error.target?.startsWith('lab:')
        ? 'lab/LAB-' + q.error.target.slice(4)
        : q.error.target?.startsWith('LAB-')
          ? 'lab/' + q.error.target
          : 'materiale/' + (q.error.target || q.skill);
      diagnosis = `<div class="callout">${vignetta('riprendi')}<h3>Ritorna sul passaggio</h3><p>${esc(q.error.message || 'Ricostruisci il modello e ricontrolla le unità.')}</p><div class="actions">${link(target.startsWith('lab/') ? 'Apri il laboratorio' : 'Rileggi la spiegazione', target)}${button('Controlla con un altro problema', 'retest', true)}${q.prerequisites?.find((k) => k !== q.skill) ? link('Riprendi il prerequisito', 'materiale/' + q.prerequisites.find((k) => k !== q.skill)) : ''}</div></div>`;
    }
    const result = score
      ? `<section class="sheetpanel intro-card"><h2>Esito della consegna</h2><div class="meters"><div class="meter"><span>Corrette</span><b>${score.right}</b></div><div class="meter"><span>Errate</span><b>${score.wrong}</b></div><div class="meter"><span>Omesse</span><b>${score.omitted}</b></div>${exam ? `<div class="meter"><span>Punteggio grezzo</span><b>${num(score.score, 4)} / 31</b></div>` : ''}</div>${exam ? `<p>${score.score === 31 ? 'Equivalente di carriera: 30 e lode.' : score.score >= 18 ? 'Equivalente di carriera: ' + Math.floor(score.score + 0.5) + '/30.' : 'Soglia di 18 punti grezzi non raggiunta.'}</p>` : ''}<p class="helper">Seleziona un numero per rivedere consegna, risposta e svolgimento.</p></section>`
      : '';
    main.innerHTML =
      crumb([['Il mio studio', 'studio'], [modeNames[run.mode]]]) +
      `<article class="question-shell"><div class="kickerline"><h2>${esc(modeNames[run.mode])}</h2>${exam && !run.finished ? '<b id="clock" aria-label="Tempo rimanente"></b>' : ''}</div>${result}<nav class="pager" aria-label="Quesiti">${run.items.map((k, i) => `<button aria-label="Quesito ${i + 1}${k.sent ? ', registrato' : ''}" aria-current="${idx === i ? 'step' : 'false'}" class="${idx === i ? 'chosen ' : ''}${k.sent ? 'done' : ''}" data-jump="${i}">${i + 1}</button>`).join('')}</nav><div class="meta">Quesito ${idx + 1} / ${run.items.length}</div><h1 class="exercise-prompt">${esc(q.prompt)}</h1>${blocks(q.figures)}<form id="response"><fieldset ${noEdit ? 'disabled' : ''} style="border:0;padding:0;margin:0">${inputFor(q, q.answer)}<div class="actions">${!noEdit ? `<button class="solid">${q.sent && run.sealed ? 'Salva correzione' : run.sealed ? 'Registra risposta' : 'Verifica risposta'}</button>` : ''}${!noEdit && exam ? button('Ometti definitivamente', 'blank') : ''}</div></fieldset><p id="action-status" role="status"></p></form>${q.sent && !feedback ? `<p class="notice good">${q.blank ? 'Omissione definitiva registrata.' : 'Risposta registrata.'} ${exam && !q.blank ? (q.changes === 1 ? 'È disponibile una correzione.' : 'Correzione utilizzata.') : ''}</p>` : ''}
 ${!run.sealed && !q.sent && !run.finished ? `<div class="actions">${q.hasHint ? button('Leggi un suggerimento', 'hint') : ''}${button('Leggi lo svolgimento', 'reveal')}</div>${(q.hintTexts || []).map((s) => '<p class="notice">' + esc(s) + '</p>').join('')}` : ''}
 ${feedback ? `<section class="feedback"><h3>${q.correct === true ? 'Risposta corretta' : q.correct === false ? 'Rivediamo il ragionamento' : q.aided ? 'Svolgimento consultato' : 'Quesito omesso'}</h3>${q.aided ? '<p class="small">Questa attività è registrata come assistita.</p>' : ''}${blocks(q.solution)}<p class="notice good"><b>Risposta</b> · ${esc(answerText(q, q.key))}</p>${diagnosis}</section>` : ''}
 <div class="actions">${idx > 0 ? button('← Precedente', 'prev') : ''}${idx < run.items.length - 1 ? button('Successivo →', 'next', true) : ''}${!run.finished ? button('Consegna l’attività', 'finish') : link('Il mio studio', 'studio')}</div></article>`;
    typeset();
    $$('[data-jump]').forEach((el) => (el.onclick = () => jump(Number(el.dataset.jump))));
    on('#response', 'submit', async (e, f) => {
      const value = new FormData(f).get('value');
      if (value === null || String(value).trim() === '') throw Error('Scegli o inserisci una risposta.');
      await send('answer', { value });
    });
    on('#prev', 'click', () => jump(idx - 1));
    on('#next', 'click', () => jump(idx + 1));
    on('#hint', 'click', () => send('hint'));
    on('#reveal', 'click', () => send('reveal'));
    on('#blank', 'click', () => {
      if (confirm('Confermi l’omissione definitiva di questo quesito?')) return send('blank');
    });
    on('#finish', 'click', () => {
      const left = run.items.filter((q) => !q.sent).length;
      if (!left || confirm('Restano ' + left + ' quesiti senza risposta. Consegnare?')) return send('finish');
    });
    on('#retest', 'click', () =>
      startRun({ course: run.course, mode: 'retest', skill: q.skill, exclude: q.id }),
    );
    if (exam && !run.finished) {
      const skew = Date.now() / 1000 - run.serverTime;
      const tick = () => {
        if (!location.hash.startsWith('#prova/' + id)) {
          clearInterval(timer);
          return;
        }
        const remaining = Math.max(0, Math.ceil(run.deadline - Date.now() / 1000 + skew));
        const clock = $('#clock');
        if (clock)
          clock.textContent =
            Math.floor(remaining / 60) + ' min ' + String(remaining % 60).padStart(2, '0') + ' s';
        if (remaining === 0) {
          clearInterval(timer);
          api('/run/' + id)
            .then((r) => {
              run = r;
              draw();
            })
            .catch((e) => toast(e.message));
        }
      };
      tick();
      timer = setInterval(tick, 1000);
    }
  }
  draw();
}
