import { api, button, crumb, esc, go, head, link, main, on, refresh, state } from '/js/ui.js';
import { lettorePersonale } from '/js/lettura.js';
import { vignetta } from '/js/anteprima.js';
import { activityPage, eventsFor } from './discipline-pratica.js';

const endpoint = id => '/v1/disciplines/' + encodeURIComponent(id);
export const pathTo = (...parts) => ['disciplina', ...parts.map(encodeURIComponent)].join('/');
const normalized = text => text.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function locationOf(data, point) {
  if (!point?.unitId) return;
  for (const course of data.courses) {
    const unit = course.units.find(item => item.id === point.unitId);
    if (unit && course.accessible) {
      const parts = [data.id, course.id, unit.id];
      if (point.activityId) parts.push(point.activityId);
      return { title: unit.title, route: pathTo(...parts) };
    }
  }
}

export async function directoryPage() {
  const { disciplines } = await api('/v1/disciplines');
  const cards = disciplines.map(subject => {
    const legacy = subject.route === 'percorsi';
    return `<a class="discipline-entry" href="#${esc(legacy ? 'percorsi' : pathTo(subject.id))}">
      <strong>${esc(subject.title)}</strong><span>${esc(subject.summary || (subject.coursesCount === 1 ? '1 microcorso' : subject.coursesCount + ' microcorsi'))}</span>
      <span class="entry-affordance">Apri i percorsi <span aria-hidden="true">→</span></span></a>`;
  }).join('');
  main.innerHTML = crumb([['Inizio', 'home'], ['Materie']]) +
    head('Le materie di Cric', 'Scegli una materia per esplorare i percorsi e ritrovare il tuo lavoro.') +
    `<div class="discipline-entries">${cards}</div>`;
  attachComparator();
}

function attachComparator() {
  main.insertAdjacentHTML('beforeend', `<details class="discipline-compare">
    <summary>Verifica un passaggio algebrico</summary>
    <p>Confronta espressioni razionali nella variabile x. Usa le parentesi, * per il prodotto e ^ per le potenze intere. Il risultato resta in questa pagina.</p>
    <form><label>Operazione<select name="operation"><option value="equivalent">Confronta due espressioni</option>
      <option value="derivative">Verifica una derivata</option><option value="primitive">Verifica una primitiva</option></select></label>
    <label>Espressione di partenza<input required name="expression" value="(x^2-1)/(x-1)" maxlength="160" autocapitalize="off" spellcheck="false"></label>
    <label><span data-candidate-label>Espressione da confrontare</span><input required name="candidate" value="x+1" maxlength="160" autocapitalize="off" spellcheck="false"></label>
    <button>Confronta</button></form><p role="status" aria-atomic="true"></p></details>`);
  const panel = main.querySelector('.discipline-compare'), form = panel.querySelector('form'), status = panel.querySelector('[role=status]');
  const examples = {
    equivalent: ['Espressione da confrontare', '(x^2-1)/(x-1)', 'x+1'],
    derivative: ['Derivata proposta', 'x^3-2*x', '3*x^2-2'],
    primitive: ['Primitiva proposta', '2*x', 'x^2+3'],
  };
  form.elements.operation.addEventListener('change', () => {
    const [label, expression, candidate] = examples[form.elements.operation.value];
    panel.querySelector('[data-candidate-label]').textContent = label;
    form.elements.expression.value = expression;
    form.elements.candidate.value = candidate;
    status.textContent = '';
  });
  let generation = 0;
  form.addEventListener('input', () => { generation++; status.textContent = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const token = ++generation, verify = form.querySelector('button');
    verify.disabled = true;
    try {
      const result = await api('/v1/mathematics/compare', Object.fromEntries(new FormData(form)));
      if (token === generation) status.textContent = result.explanation;
    } catch (error) { if (token === generation) status.textContent = error.message; }
    finally { verify.disabled = false; }
  });
}

function crumbs(data, course, unit, activity) {
  const items = [['Materie', 'discipline'], [data.title, course && pathTo(data.id)]];
  if (course) items.push([course.title, unit && pathTo(data.id, course.id)]);
  if (unit) items.push([unit.title, activity && pathTo(data.id, course.id, unit.id)]);
  if (activity) items.push(['Esercizio']);
  return crumb(items);
}

function notebook(data, me) {
  if (!me) return '';
  const last = locationOf(data, me.resume), next = locationOf(data, me.next);
  if (!last && !next) return '';
  return `<section class="discipline-bookmark" aria-labelledby="bookmark-title">
    ${vignetta('riprendi')}<h2 id="bookmark-title">Il tuo quaderno</h2>
    ${last ? `<div><p>Ultimo punto di studio</p>${link('Riprendi · ' + last.title, last.route, true)}</div>` : ''}
    ${next && (next.route !== last?.route || me.next.reason) ? `<div><p>${esc(me.next.reason)}</p>${link('Attività proposta · ' + next.title, next.route)}</div>` : ''}
  </section>`;
}

export async function disciplineNotebookLinks() {
  const directory = await api('/v1/disciplines');
  const entries = await Promise.all(directory.disciplines.filter(subject => subject.route !== 'percorsi').map(async subject => {
    const data = await api(endpoint(subject.id));
    const accessible = data.courses.filter(c => c.accessible);
    if (!accessible.length) return '';
    const me = await api(endpoint(subject.id) + '/me');
    const last = locationOf(data, me.resume);
    return `<section class="discipline-account"><h3>${esc(subject.title)}</h3>
      ${last ? link('Riprendi · ' + last.title, last.route, true) : link('Apri i microcorsi', pathTo(subject.id))}
      <details><summary>Microcorsi accessibili (${accessible.length})</summary><ul>
      ${accessible.map(c => `<li><a href="#${esc(pathTo(subject.id, c.id))}">${esc(c.title)}</a></li>`).join('')}</ul></details></section>`;
  }));
  return entries.join('');
}

function gate(data, course, route) {
  const actions = [];
  if (!state.user) {
    actions.push(link('Accedi al quaderno', 'accedi/entra/' + route, true));
    if (state.mode === 'verifica') actions.push(button('Apri un quaderno di prova', 'demo'));
  }
  if (course?.orderKey) actions.push(link('Accesso al microcorso', 'acquisto/' + course.orderKey, true));
  const note = data.status === 'preview'
    ? 'Questa edizione è in revisione. La consultazione è riservata ai profili abilitati alla prova.'
    : 'I materiali completi sono disponibili con l’accesso al microcorso.';
  return `<aside class="discipline-gate"><h2>Accesso ai materiali</h2><p>${esc(note)}</p>
    ${actions.length ? `<div class="actions">${actions.join('')}</div>` : ''}</aside>`;
}

function bindAccess() {
  on('#demo', 'click', async () => {
    const original = location.hash;
    await api('/demo', {});
    await refresh();
    if (location.hash === original) go(original.slice(1) || 'home');
  });
}

function courseRow(data, course, matchedUnits) {
  const units = matchedUnits || course.units;
  const count = units.length === 1 ? '1 unità' : units.length + ' unità';
  const courseRoute = pathTo(data.id, course.id);
  return `<article class="discipline-course">
    <div><small>${esc(count)}${matchedUnits ? ' nel filtro' : ''}</small><h3><a href="#${esc(courseRoute)}">${esc(course.title)}</a></h3></div>
    <p>${esc(course.summary)}</p>
    ${matchedUnits ? `<ul>${units.map(unit => `<li><a href="#${esc(pathTo(data.id, course.id, unit.id))}">${esc(unit.title)}</a></li>`).join('')}</ul>` : ''}
  </article>`;
}

function renderCatalog(data, me) {
  const saved = history.state?.disciplineFilter;
  main.innerHTML = crumbs(data) + head(data.title, data.summary, data.status === 'preview' ? 'Edizione in revisione' : '') +
    notebook(data, me) + `<section class="discipline-shelf" aria-labelledby="courses-title"><h2 id="courses-title">I microcorsi</h2>
    <form class="discipline-filter" role="search" aria-label="Cerca nei microcorsi">
      <label>Cerca un argomento<input type="search" name="topic" maxlength="100" autocomplete="off" placeholder="Per esempio, un teorema"></label>
      ${data.syllabi.length ? `<label>Programma universitario<select name="syllabus"><option value="">Tutti gli argomenti</option>
        ${data.syllabi.map(s => `<option value="${esc(s.id)}">${esc(s.title)} · ${esc(s.year)}</option>`).join('')}</select></label>` : ''}
      <button>Applica</button>
    </form><div data-syllabus-source></div><p class="discipline-count" role="status"></p>
    <div class="discipline-courses"></div></section>`;
  const form = main.querySelector('.discipline-filter');
  if (saved?.discipline === data.id && saved.version === data.version) {
    form.elements.topic.value = saved.topic || '';
    if (form.elements.syllabus) form.elements.syllabus.value = saved.syllabus || '';
  }
  const apply = () => {
    const topic = form.elements.topic.value.trim(), syllabusId = form.elements.syllabus?.value || '';
    const syllabus = data.syllabi.find(item => item.id === syllabusId);
    const needle = normalized(topic);
    const allow = syllabus && new Set(syllabus.skills);
    let count = 0;
    const rows = data.courses.map(course => {
      const units = course.units.filter(unit => (!allow || allow.has(unit.skillId)) &&
        (!needle || normalized([course.title, unit.title, unit.objective].join(' ')).includes(needle)));
      if (!units.length) return '';
      count++;
      return courseRow(data, course, needle || allow ? units : null);
    });
    const url = syllabus?.url && /^https?:\/\//.test(syllabus.url) ? syllabus.url : '';
    main.querySelector('[data-syllabus-source]').innerHTML = syllabus
      ? `${url ? `<p>Argomenti collegati al <a rel="noopener" target="_blank" href="${esc(url)}">programma ufficiale di ${esc(syllabus.title)} (${esc(syllabus.year)})</a>.</p>` : ''}
        ${syllabus.coverage ? `<p>${esc(syllabus.coverage)}</p>` : ''}` : '';
    main.querySelector('.discipline-count').textContent = count === 1 ? '1 microcorso' : count + ' microcorsi';
    main.querySelector('.discipline-courses').innerHTML = count ? rows.join('') : '<p>Prova un altro termine o scegli tutti gli argomenti.</p>';
    history.replaceState({ ...history.state, disciplineFilter: { discipline: data.id, version: data.version, topic, syllabus: syllabusId } }, '');
  };
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  form.elements.syllabus?.addEventListener('change', apply);
  apply();
  if (data.exams?.length) {
    main.insertAdjacentHTML('beforeend', `<section class="discipline-shelf"><h2>Preparazione all’esame</h2><ul class="discipline-units">
      ${data.exams.map(exam => `<li><a href="#${esc(pathTo(data.id, '@esame', exam.id))}">${esc(exam.title)}</a>
        <p>${esc(exam.description)}</p></li>`).join('')}</ul></section>`);
  }
  attachComparator();
}

function skillLocation(data, id) {
  for (const course of data.courses) {
    const unit = course.units.find(item => item.skillId === id);
    if (unit) return { title: unit.title, route: pathTo(data.id, course.id, unit.id) };
  }
}

function prerequisites(data, ids, courseLevel = false) {
  const targets = ids.map(id => {
    if (!courseLevel) return skillLocation(data, id);
    const course = data.courses.find(item => item.id === id);
    if (course) return { title: course.title, route: pathTo(data.id, id) };
  }).filter(Boolean);
  if (!targets.length) return '';
  return `<aside class="discipline-prereqs"><h2>Prima di cominciare</h2><p>Puoi richiamare questi prerequisiti quando ti servono.</p>
    <ul>${targets.map(t => `<li><a href="#${esc(t.route)}">${esc(t.title)}</a></li>`).join('')}</ul></aside>`;
}

function evidence(me, skillId) {
  const values = me?.skills?.[skillId];
  if (!values) return '';
  const labels = [
    ['exposures', 'Aperture'], ['completions', 'Letture concluse'], ['assisted', 'Risposte corrette con aiuto'],
    ['independent', 'Risposte corrette autonome'], ['transfer', 'Nuove famiglie risolte'],
    ['retention', 'Richiami a distanza riusciti'], ['errors', 'Risposte da rivedere'],
  ];
  return `<details class="discipline-evidence"><summary>Evidenze su questa competenza</summary><dl>
    ${labels.map(([key, label]) => `<div><dt>${label}</dt><dd>${esc(values[key] ?? 0)}</dd></div>`).join('')}</dl></details>`;
}

function renderCourse(data, course, me) {
  const route = pathTo(data.id, course.id);
  main.innerHTML = crumbs(data, course) + head(course.title, course.summary, data.title) +
    (course.accessible ? '' : gate(data, course, route)) +
    prerequisites(data, course.prerequisites, true) + `<section class="discipline-shelf"><h2>Unità di studio</h2>
    <ol class="discipline-units">${course.units.map(unit => `<li>
      <a href="#${esc(pathTo(data.id, course.id, unit.id))}">${esc(unit.title)}</a>
      <p>${esc(unit.objective)}</p>${evidence(me, unit.skillId)}</li>`).join('')}</ol></section>` +
    (course.formulas?.length ? `<details class="discipline-formulas"><summary>Formulario ragionato</summary><dl>
      ${course.formulas.map(item => `<dt>${esc(item.title)}</dt><dd>${esc(item.body)}</dd>`).join('')}</dl></details>` : '');
  bindAccess();
}

async function renderLesson(data, course, unit, me, events) {
  const links = unit.activities.map((activity, i) => `<li><a data-exercise href="#${esc(pathTo(data.id, course.id, unit.id, activity.id))}">
    <span>Esercizio ${i + 1}</span> ${esc(activity.prompt)}</a></li>`);
  const skill = data.skills.find(item => item.id === unit.skillId);
  const nextUnit = course.units[course.units.findIndex(item => item.id === unit.id) + 1];
  const sections = unit.lesson.map(part => `<section><h2>${esc(part.title)}</h2><p>${esc(part.body)}</p></section>`);
  const text = [unit.objective, ...unit.lesson.map(p => p.body), unit.oral?.prompt || ''].join(' ');
  const symbols = (data.symbols || []).filter(entry => text.includes(entry.symbol));
  main.innerHTML = crumbs(data, course, unit) + head(unit.title, unit.objective, course.title) +
    `<div class="discipline-spread"><article class="discipline-reader lettura-contenuto">
      <div class="copy">${sections.join('')}</div>
      ${symbols.length ? `<details class="discipline-symbols"><summary>Come leggere i simboli della lezione</summary><dl>
        ${symbols.map(entry => `<dt>${esc(entry.symbol)} · ${esc(entry.reading)}</dt><dd>${esc(entry.meaning)}</dd>`).join('')}</dl></details>` : ''}
      ${unit.representation ? '<div data-math-lab></div>' : ''}
      ${unit.oral ? `<section class="discipline-oral"><h2>Preparati all’orale</h2><p>${esc(unit.oral.prompt)}</p><details>
        <summary>Confronta la tua spiegazione</summary>${unit.oral.solution.map(text => `<p>${esc(text)}</p>`).join('')}</details></section>` : ''}
      <div class="actions"><button type="button" data-complete>Segna la lettura come conclusa</button><button type="button" data-print>Stampa la lezione</button></div>
      <p class="discipline-save" role="status"></p>
      <details class="discipline-share"><summary>Porta l’obiettivo in un altro strumento</summary>
        <p>Scarica un file JSON con l’obiettivo e i prerequisiti. Potrai scegliere tu dove aprirlo.</p>
        <label><input type="checkbox" data-share-evidence> Includi le mie evidenze su questa competenza</label>
        <div class="actions"><button type="button" data-share>Scarica il contesto di studio</button></div><p data-share-status role="status"></p>
      </details></article>
      <aside class="discipline-side">${prerequisites(data, skill?.prerequisites || [])}
        ${links.length ? `<section class="discipline-tasks"><h2>Mettiti alla prova</h2><ol>${links.join('')}</ol></section>` : ''}
        ${evidence(me, unit.skillId)}
        ${nextUnit ? `<p>${link('Unità successiva · ' + nextUnit.title, pathTo(data.id, course.id, nextUnit.id))}</p>` : ''}
      </aside></div>`;
  const reader = main.querySelector('.discipline-reader');
  const note = reader.querySelector('[role=status]');
  const done = reader.querySelector('[data-complete]');
  done.addEventListener('click', async () => {
    done.disabled = true;
    try {
      await events('complete');
      note.textContent = 'Lettura conclusa e salvata nel quaderno.';
      done.textContent = 'Lettura conclusa';
    } catch (error) { done.disabled = false; note.textContent = error.message; }
  });
  reader.querySelector('[data-print]').addEventListener('click', () => window.print());
  const share = reader.querySelector('[data-share]');
  share.addEventListener('click', async () => {
    share.disabled = true;
    const status = reader.querySelector('[data-share-status]'), scopes = ['objective', 'prerequisites'];
    if (reader.querySelector('[data-share-evidence]').checked) scopes.push('evidence');
    try {
      const packet = await api(endpoint(data.id) + '/context', {unitId: unit.id, version: unit.version, scopes},
        { 'X-Officina-Session': state.draftSession });
      if (!reader.isConnected) return;
      const url = URL.createObjectURL(new Blob([JSON.stringify(packet, null, 2)], {type: 'application/json'}));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'cric-' + data.id + '-' + unit.id + '.json';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'File di contesto preparato per il download.';
    } catch (error) { status.textContent = error.message; }
    finally { share.disabled = false; }
  });
  if (unit.representation) {
    const { attachMathLab } = await import('./discipline-grafici.js');
    attachMathLab(reader.querySelector('[data-math-lab]'), unit.representation);
  }
  // The existing reader applies reversible spacing, pacing, focus, transcription and timer preferences.
  await lettorePersonale(reader, {kind: 'lesson', blocks: unit.lesson.map(p => ({type: 'text', text: p.body}))});
  return note;
}

// Native printing includes explicitly hidden oral and correction details, then restores the student's view.
let detailsForPrint = [];
window.addEventListener('beforeprint', () => {
  detailsForPrint = [...main.querySelectorAll('.discipline-oral details:not([open]), .discipline-alternatives details:not([open]), .discipline-exam-result:not([open]), .discipline-mathlab details:not([open])')];
  for (const detail of detailsForPrint) detail.open = true;
});
window.addEventListener('afterprint', () => {
  for (const detail of detailsForPrint) detail.open = false;
  detailsForPrint = [];
});

export async function disciplinePage(id, courseId, unitId, activityId) {
  const route = location.hash;
  main.innerHTML = '<p class="notice" role="status">Apertura del percorso…</p>';
  const data = await api(endpoint(id));
  const me = state.user && await api(endpoint(id) + '/me');
  if (location.hash !== route) return;
  if (!courseId || courseId === '@cerca') {
    renderCatalog(data, me);
    if (courseId === '@cerca') return main.querySelector('.discipline-filter input[type=search]');
    return;
  }
  if (courseId === '@esame') {
    const exam = data.exams?.find(item => item.id === unitId);
    if (!exam) throw Error('Esercitazione assente da questa edizione.');
    const { examPage } = await import('./discipline-esame.js');
    return examPage(data, exam, endpoint(id), pathTo(data.id));
  }
  const course = data.courses.find(item => item.id === courseId);
  if (!course) throw Error('Microcorso assente da questa edizione.');
  if (!unitId) return renderCourse(data, course, me);
  const metadata = course.units.find(item => item.id === unitId);
  if (!metadata) throw Error('Questa unità non appartiene al microcorso.');
  if (!course.accessible) {
    main.innerHTML = crumbs(data, course, metadata) + head(metadata.title, metadata.objective) + gate(data, course, route.slice(1));
    bindAccess();
    return;
  }
  const unit = await api(endpoint(id) + '/units/' + encodeURIComponent(unitId));
  if (location.hash !== route) return;
  const events = eventsFor(endpoint(id), unit.version, unitId, activityId);
  const activity = activityId && unit.activities.find(item => item.id === activityId);
  if (activityId && !activity) throw Error('Questo esercizio non appartiene all’unità.');
  let openError;
  try { await events('open'); }
  catch (error) { openError = error.message; }
  if (location.hash !== route) return;
  const notice = activity
    ? await activityPage(data, unit, activity, events, crumbs(data, course, unit, activity), pathTo(data.id, course.id, unit.id))
    : await renderLesson(data, course, unit, me, events);
  if (openError && notice?.isConnected) notice.textContent = 'Punto di ripresa non salvato. ' + openError;
}
