import { attachPathway } from './percorso.js';
import {benchLinks, lessonBenches} from './banchi/collegamenti.js';
import {showSimulationIndex} from './banchi/catalogo.js';
import {
  main,
  state,
  esc,
  $,
  $$,
  api,
  refresh,
  go,
  link,
  button,
  head,
  crumb,
  titleOf,
  blocks,
  typeset,
  toast,
  runAction,
  on,
  listLine,
  errMsg,
  gate,
  demo,
  inputFor,
  answerText,
  kinds,
  modeNames,
  date,
  startRun,
} from './ui.js';
import { study, login, checkout, admin, editions } from './account.js';
import { recoveryCollection, runPage, trainPage } from './practice.js';
import { ascoltaCambioAccesso, pulisciBozze } from './recupero/bozza.js';
import { labPage } from './labs.js';
import { previewOfficina } from './anteprima.js';
import { lettorePersonale, segnaleLettori } from './lettura.js';
import { installActivities } from './attivita-metodo.js';
import { metodoContent, sprintContent } from './metodo.js';
const authorPage = async (parts) => (await import('./editor.js')).authorPage(parts);
let ready = false,
  routing = false,
  pending = false;
const courseUrl = (c, tab = 'parti') => 'corso/' + c + '/' + tab;
function subjectDrawing(id) {
  return /^C[1-6]$/.test(id)
    ? `<svg class="subject-drawing" viewBox="0 0 88 50" aria-hidden="true" focusable="false"><use href="/materie.svg#${id}"></use></svg>`
    : '';
}
function indexRow(code, title, summary, route, drawing, complete = false) {
  return `<a class="catalog-row${drawing ? ' illustrated' : ''}${complete ? ' complete' : ''}" href="#${esc(route)}">
    <span class="code">${esc(code)}</span>${drawing}<strong>${esc(title)}</strong>
    <span class="summary">${esc(summary)}</span><span class="arrow" aria-hidden="true">→</span>
  </a>`;
}
function catalog() {
  const entries = state.courses.map((course) => {
    const complete = Boolean(course.includes?.length);
    return indexRow(course.id, course.title, course.summary, 'corso/' + course.id,
      subjectDrawing(complete ? 'C6' : course.id), complete);
  });
  return '<nav class="rows course-index" aria-label="Catalogo dei percorsi">' + entries.join('') + '</nav>';
}

function home() {
  main.innerHTML = `<section class="hero" aria-labelledby="cover-title">
    <div class="hero-copy">
      <h1 id="cover-title"><span>La fisica,</span> <em>in pratica.</em></h1>
      <p>Sei percorsi per Medicina: studia un argomento con calma oppure preparati all’esame attraverso esercizi, grafici e formule inverse.</p>
      <div class="hero-actions">
        <a class="button solid" href="#percorsi">Studio completo <span class="arrow" aria-hidden="true">→</span></a>
        <a class="button" href="#sprint">Preparazione rapida all’esame</a>
        <a class="button" href="#laboratori">Laboratori 3D per capitolo</a>
        <button type="button" class="textbtn" data-prova-portata>Prova un esperimento</button>
      </div>
    </div>
    <figure class="cover-plate">
      <button type="button" class="cover-trigger" data-mascotte aria-label="Cambia posa a Cric, la chiave inglese dell’Officina" aria-describedby="cover-caption" aria-pressed="false">
        <img src="/identita/copertina.svg" width="1000" height="800" fetchpriority="high" alt="">
      </button>
      <figcaption id="cover-caption"><strong>Cric</strong><span>La chiave inglese col vizio del disegno. Premi per cambiare posa.</span></figcaption>
    </figure>
  </section>
  <section aria-labelledby="cover-index"><div class="rule-head"><h2 id="cover-index">I percorsi</h2><p>Cinque microcorsi tematici e un percorso completo.</p></div>${catalog()}</section>
  ${previewOfficina()}`;
}
async function labs(courseId, lessonId) {
  const { lessons } = await api('/simulazioni' + (courseId ? '/' + encodeURIComponent(courseId) : ''));
  const course = state.courses.find((c) => c.id === courseId);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (lessonId && !lesson) throw Error('Questa lezione non è presente nel catalogo delle simulazioni di ' + courseId + '.');
  const crumbs = [['Inizio', 'home'], ['Simulazioni 3D', course ? 'laboratori' : undefined]];
  if (course) crumbs.push([courseId, lesson ? 'laboratori/' + courseId : undefined]);
  if (lesson) crumbs.push(['Lezione']);
  const title = lesson ? lesson.title : course ? 'Simulazioni 3D di ' + courseId : 'Simulazioni 3D';
  main.innerHTML = crumb(crumbs) +
    head(title, lesson ? '' : course ? course.title : 'Scegli un argomento per aprire il suo modello e metterlo alla prova.',
      lesson ? 'Simulazioni 3D della lezione · ' + lesson.id : '') +
    '<section id="simulazioni-voci" aria-label="Simulazioni degli argomenti"></section>';
  if (!course) main.insertAdjacentHTML('beforeend',
    '<section class="sim-collections" aria-label="Altre attività di laboratorio"><h2 class="bench-collection">Banchi tridimensionali di approfondimento</h2><div class="rows">' +
    state.benches.map((b) => indexRow(b.course, b.title, b.summary, 'banco/' + b.id, subjectDrawing(b.course))).join('') +
    '</div><h2 class="bench-collection">Laboratori guidati</h2><div class="rows">' +
    [...state.labs].sort((a, b) => a.order - b.order)
      .map((l) => indexRow(l.course, l.title, titleOf(l.course), 'lab/' + l.id, subjectDrawing(l.course))).join('') + '</div></section>');
  showSimulationIndex(main.querySelector('#simulazioni-voci'), lessons, course, lesson, main.querySelector('.sim-collections'));
}
function sources() {
  main.innerHTML =
    crumb([['Inizio', 'home'], ['Programma e fonti']]) +
    head(
      'Programma e fonti',
      'Edizione del semestre aperto 2026/27. Riferimenti consultati il 21 novembre 2026.',
    ) +
    `<div class="prose big-list"><h3>Sette unità, cinque microcorsi</h3><p>Le unità MUR 1 e 2 confluiscono in C1; la 3 in C2, la 5 in C3 e la 6 in C4. Le unità 4 e 7 formano C5. C6 riunisce gli stessi identificatori e aggiunge problemi trasversali.</p><a href="https://www.mur.gov.it/it/news/venerdi-19062026/semestre-aperto-aa-2026-2027" target="_blank" rel="noopener">Pagina del syllabus MUR ↗</a><h3>Come funziona la prova di Fisica</h3><p>Il D.M. 941 del 10 luglio 2026, art. 8 e allegato 2, prevede 21 quesiti a cinque opzioni con una sola risposta corretta e 10 completamenti. La durata ordinaria è 50 minuti. Ogni risposta corretta vale 1 punto, ogni errata −0,1; un’omissione vale 0. Per la carriera l’arrotondamento all’intero più vicino si applica a partire da 18 punti grezzi.</p><a href="https://www.mur.gov.it/it/atti-e-normativa/decreto-ministeriale-n-941-del-10-7-2026" target="_blank" rel="noopener">Decreto e allegati ↗</a><h3>Materiali dell’officina</h3><p>Quesiti e laboratori sono originali e le simulazioni riproducono la struttura della prova di Fisica. La documentazione di consegna contiene matrice di copertura, controlli numerici e provenienza delle illustrazioni. L’edizione è stata verificata con controlli automatici e revisione assistita.</p></div>`;
}
function sectionList(items, active, course) {
  const groups = new Map();
  const sectionOrder = new Map(items.filter((r) => r.kind === 'section').map((r) => [r.title, r.order]));
  for (const r of active) {
    const title = r.section || 'Materiali';
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(r);
  }
  const counts = new Map();
  for (const item of items) {
    if (item.kind === 'experiment') counts.set(item.skill, (counts.get(item.skill) || 0) + 1);
  }
  const row = (r, section = '') => {
    const entry = `<a class="topic-row" href="#materiale/${esc(r.id)}/${esc(course)}"><span><small>${esc(r.id)}</small> <strong>${esc(r.title)}</strong>${section ? '<span class="topic-context">' + esc(section) + '</span>' : ''}</span><span aria-hidden="true">→</span></a>`;
    const count = r.kind === 'lesson' && counts.get(r.id);
    if (!count) return entry;
    const label = count === 1 ? '1 laboratorio 3D' : count + ' laboratori 3D';
    return `<div class="chapter-with-labs">${entry}<a class="chapter-lab-link" href="#laboratori/${esc(course)}/${esc(r.id)}" aria-label="${esc(label + ' · ' + r.title)}">${label} ↗</a></div>`;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => (sectionOrder.get(a) ?? Infinity) - (sectionOrder.get(b) ?? Infinity))
    .map(([name, recs], i) => {
      if (recs.length === 1) return row(recs[0], name === recs[0].title ? '' : name);
      return `<details class="topic-group" ${active.length <= 22 || i === 0 ? 'open' : ''}><summary>${esc(name)} <small>· ${recs.length}</small></summary>${recs.map((r) => row(r)).join('')}</details>`;
    })
    .join('');
}
function courseContents(items, group, course) {
  if (!course.includes?.length) return sectionList(items, group, course.id);
  const sections = new Set([...course.includes, course.id, ...group.map((r) => r.course)]);
  const names = { lesson: ['lezione', 'lezioni'], example: ['esempio', 'esempi'], question: ['quesito', 'quesiti'] };
  let volumes = '';
  for (const origin of sections) {
    const part = group.filter((r) => r.course === origin);
    if (!part.length) continue;
    const name = course.id === 'C6' && origin === 'C6' ? 'Materiali di raccordo' : titleOf(origin);
    const label = names[part[0].kind][part.length === 1 ? 0 : 1];
    const contents = sectionList(items.filter((r) => r.course === origin), part, course.id);
    volumes += `<details class="course-volume" ${volumes ? '' : 'open'}><summary><span class="volume-code">${esc(origin)}</span><strong>${esc(name)}</strong> <small>· ${part.length} ${label}</small></summary><div class="volume-topics">${contents}</div></details>`;
  }
  return volumes;
}
function c1Start() {
  return `<section class="c1-paths" aria-label="Scegli il tuo percorso">
    <article><h2>Studio completo</h2>
      <p>Segui le lezioni, leggi gli esempi svolti e prova gli esercizi. Poi passa al laboratorio e alle verifiche.</p>
      <div class="actions">${link('Inizia dalle lezioni', courseUrl('C1', 'lezioni'), true)}${link('Simulazioni 3D di C1', 'laboratori/C1')}</div></article>
    <article><h2>Preparazione rapida all’esame</h2>
      <p>Parti dai quesiti prioritari, recupera gli errori e misura i progressi con diagnosi e simulazioni.</p>
      ${link('Vai agli esercizi prioritari', courseUrl('C1', 'esercizi'), true)}</article>
    </section>`;
}

function c1Exam(items) {
  const priorities = ['C1-Q027', 'C1-Q022', 'C1-Q037']
    .map(id => items.find(item => item.id === id))
    .filter(Boolean)
    .map(item => listLine(item.title, 'materiale/' + item.id + '/C1'))
    .join('');
  return `<section class="big-list"><h2>Esercizi prioritari</h2>
    <p>Comincia dai grafici del moto. Dopo ogni risposta, confronta i tuoi passaggi con la soluzione.</p>
    ${priorities}
    <div class="actions">${link('Recupera gli errori', courseUrl('C1', 'recupero'))}
    ${link('Diagnosi e simulazioni · C6', 'allenamento/C6')}</div></section>`;
}

async function coursePage(id, tab = 'parti', activityId) {
  const data = await api('/course/' + id),
    c = data.course;
  const tabs = [
    ['parti', 'Inizia qui'],
    ['metodo', 'Formule e grafici'],
    ['lezioni', 'Lezioni'],
    ['simulazioni', 'Simulazioni 3D', 'laboratori/' + id],
    ['esempi', 'Esempi svolti'],
    ['esercizi', 'Esercizi'],
    ['recupero', 'Errori e recupero'],
    ['attivita', 'Verifiche e laboratori'],
    ['pdf', 'Fascicoli PDF'],
  ];
  const title =
    crumb([['Percorsi', 'percorsi'], [c.title]]) +
    '<div class="course-title">' +
    head(
      c.title,
      c.summary,
      c.id + ' / ' + (c.includes?.length ? 'Percorso integrale' : 'Microcorso di Fisica'),
    ) + subjectDrawing(c.includes?.length ? 'C6' : c.id) + '</div>';
  const utilities =
    `<div class="actions">${!data.owned ? link(state.mode === 'verifica' ? 'Accesso e ordine di verifica' : 'Acquista il percorso', 'acquisto/' + id, true) : link('Allenati', 'allenamento/' + id, true)}${!data.owned && data.preview.length ? link('Leggi un’anteprima', 'materiale/' + data.preview[0] + '/' + id) : ''}${c.id === 'C6' ? link('Diagnosi e simulazioni', 'allenamento/C6') : ''}</div><nav class="tabs" aria-label="Materiali del percorso">${tabs.map(([t, l, route]) => `<a class="${t === tab ? 'active' : ''}" ${t === tab ? 'aria-current="page"' : ''} href="#${esc(route || courseUrl(id, t))}">${l}</a>`).join('')}</nav>`;
  let body = '';
  if (id === 'C1' && tab === 'parti') {
    body = c1Start();
  } else if (tab === 'parti') {
    body = '<section class="method-intro"><h2>Da dove vuoi cominciare?</h2><p>Non devi aprire tutto insieme. Puoi seguire il microcorso con ordine oppure partire dai problemi da esame e recuperare soltanto ciò che non padroneggi.</p><div class="method-cards">' +
      '<article class="method-card"><div class="meta">Studio completo</div><h3>Capire e imparare</h3><p>Lezioni ed esempi guidati, con formule, figure, laboratori e controlli dei passaggi.</p>' + link('Apri le lezioni', courseUrl(id, 'lezioni'), true) + '</article>' +
      '<article class="method-card"><div class="meta">Abilità trasversali</div><h3>Formule inverse e grafici</h3><p>Ricava ogni grandezza, interpreta gli assi e controlla i risultati senza calcolatrice, un passo alla volta.</p>' + link('Apri il metodo', courseUrl(id, 'metodo'), true) + '</article>' +
      '<article class="method-card"><div class="meta">Allenamento rapido</div><h3>Esercizi e recupero</h3><p>Inizia dai quesiti, poi riprendi la spiegazione associata agli errori.</p>' + link('Allenati', 'allenamento/' + id, true) + '</article></div></section>';
  } else if (tab === 'metodo') {
    body = metodoContent(id, data.activities);
  } else if (tab === 'pdf') {
    const courses = [...(c.includes || []), id];
    body = `<div class="big-list"><h2>Fascicoli per lo studio</h2>${!data.owned ? gate(id) : ''}${courses.map((cid) => `<div class="order"><h3>${esc(titleOf(cid))}</h3><div class="actions">${(cid === 'C6' ? ['dispensa', 'esercizi', 'simulazioni'] : ['dispensa', 'esercizi']).map((b) => (data.owned ? `<a class="button" href="/download/${esc(cid)}/${b}" download>↓ ${{ dispensa: 'Dispensa', esercizi: 'Esercizi con soluzioni', simulazioni: 'Simulazioni' }[b]}</a>` : `<span class="small">${{ dispensa: 'Dispensa', esercizi: 'Eserciziario', simulazioni: 'Simulazioni' }[b]}</span>`)).join('')}</div></div>`).join('')}</div>`;
  } else if (tab === 'recupero') {
    body = data.owned ? '<div class="actions">' + link('Diario dei miei errori', 'studio/diario/' + id, true) + '</div><section id="raccolta-errori" class="big-list"></section>' : gate(id);
  } else if (tab === 'attivita') {
    body = `<div class="split"><div><h2>Verifica il tuo lavoro</h2><p class="deck">Allenamento con feedback, verifiche con correzione alla consegna.</p><div class="actions">${link('Apri le attività', 'allenamento/' + id, true)}</div></div><div><h3>Laboratori del percorso</h3>${listLine('Simulazioni 3D delle lezioni', 'laboratori/' + id)}${data.items.filter(r=>r.kind==='bench').map(r=>listLine(r.title,'banco/'+r.id+'/'+encodeURIComponent(location.hash.slice(1)),r.summary)).join('')}${data.items
      .filter((r) => r.kind === 'lab')
      .map((r) => listLine(r.title, 'lab/' + r.id + '/' + id))
      .join('')}</div></div>`;
  } else {
    const k = { lezioni: 'lesson', esempi: 'example', esercizi: 'question' }[tab] || 'lesson';
    const group = data.items.filter((r) => r.kind === k);
    body = `<div class="big-list">${id === 'C6' && tab === 'lezioni' ? `<div class="callout"><h3>Il filo del percorso</h3><p>Inizia con la diagnosi. Studia misure e meccanica prima di fluidi e gas, poi passa a campi, onde e radiazioni. Usa i raccordi C6 per richiamare due modelli nello stesso problema.</p></div>` : ''}${tab === 'esercizi' ? `<div class="actions">${link('Allenamento senza titoli', 'allenamento/' + id, true)}</div>` : ''}${courseContents(data.items, group, c) || '<p>Questa sezione è vuota.</p>'}</div>`;
  }
  if (id === 'C1') {
    const method = tab === 'metodo' ? '' : listLine('Formule inverse e interpretazione dei grafici', courseUrl(id, 'metodo'));
    if (tab === 'esercizi') {
      body = c1Exam(data.items) + '<details class="c1-index"><summary>Tutti gli esercizi C1</summary>' + body + '</details>';
    }
    const next = { lezioni: ['Segui un esempio svolto', 'esempi'], esempi: ['Prova gli esercizi', 'esercizi'],
      esercizi: ['Passa al laboratorio e alle verifiche', 'attivita'], recupero: ['Riprendi gli esercizi', 'esercizi'], metodo: ['Applica il metodo a un esercizio', 'esercizi'] }[tab];
    const index = '<details class="c1-index"><summary>Indice del microcorso e accesso</summary>' + utilities + '</details>';
    main.innerHTML = tab === 'parti' ? title + body + method + index :
      title + index + method + body + (next ? listLine(next[0], courseUrl(id, next[1])) : '');
  } else {
    main.innerHTML = title + utilities + body;
  }
  if (tab === 'lezioni' && data.owned) {
    main.insertAdjacentHTML('beforeend', '<details class="c1-index" data-learning-path><summary>Prerequisiti e prossima attività</summary><div data-path-panel></div></details>');
    attachPathway(main.querySelector('[data-learning-path]'), id);
  }
  const activityFocus = tab === 'metodo' && installActivities(main, data.activities, activityId);
  if (tab === 'recupero' && data.owned) recoveryCollection($('#raccolta-errori'), data.items, id);
  demo('corso/' + id);
  return activityFocus;
}
async function material(id, course) {
  const r = await api('/item/' + id);
  if (['bench','experiment'].includes(r.kind)) return go('banco/' + id);
  if (r.kind === 'lab') return labPage(id, course);
  course = course || r.course;
  if (r.kind === 'question') {
    if (state.courses.find((c) => c.id === course)?.owned) {
      main.innerHTML =
        crumb([[titleOf(course), courseUrl(course, 'esercizi')], ['Esercizio']]) +
        head('Prova a rispondere') +
        button('Inizia il quesito', 'single', true) + benchLinks(id);
      on('#single', 'click', () => startRun({ course, item: id, mode: 'practice' }));
      return;
    }
    main.innerHTML =
      crumb([[titleOf(course), courseUrl(course, 'esercizi')], ['Anteprima']]) +
      `<article class="question-shell"><div class="meta">Esercizio di anteprima</div><h1 class="exercise-prompt">${esc(r.prompt)}</h1>${blocks(r.figures)}<form id="q-preview">${inputFor(r)}<button class="solid" type="submit">Verifica risposta</button></form><div id="preview-result"></div>${benchLinks(id)}</article>`;
    on('#q-preview', 'submit', async (e, el) => {
      const value = new FormData(el).get('value');
      if (!value) throw Error('Inserisci una risposta.');
      const result = await api('/item/' + id, { value });
      $('#preview-result').innerHTML =
        `<h3>${result.correct ? 'Risposta corretta' : 'Rivedi il passaggio'}</h3>${blocks(result.solution)}<p>Risposta · ${esc(answerText(r, result.key))}</p>`;
      typeset();
      await lettorePersonale($('#preview-result'), { kind: 'worked', blocks: result.solution });
      el.hidden = true;
    });
    return;
  }
  const data = await api('/course/' + course),
    lessons = data.items.filter((o) => o.kind === 'lesson' && o.course === r.course);
  const examples = data.items.filter((o) => o.kind === 'example' && o.skill === r.skill);
  const q = data.items.find((o) => o.kind === 'question' && o.skill === r.skill),
    idx = lessons.findIndex((x) => x.id === r.skill);
  const indexLinks = lessons
    .map(
      (o) =>
        `<a class="${o.id === r.skill ? 'current' : ''}" ${o.id === r.skill ? 'aria-current="location"' : ''} href="#materiale/${esc(o.id)}/${esc(course)}">${esc(o.title)}</a>`,
    )
    .join('');
  const lab = data.items.find((l) => l.kind === 'lab' && l.course === r.course);
  const simulations = r.kind === 'lesson' && r.experiments?.length
    ? '<div class="actions">' + link('Simulazioni 3D della lezione (' + r.experiments.length + ')',
      'laboratori/' + course + '/' + r.id) + '</div>' : '';
  main.innerHTML =
    crumb([['Percorsi', 'percorsi'], [titleOf(course), courseUrl(course, course === 'C6' && r.kind === 'lesson' ? 'lezioni' : 'parti')], [kinds[r.kind] || 'Materiale']]) +
    `<div class="layout"><aside class="index"><details ${matchMedia('(min-width:641px)').matches ? 'open' : ''}><summary>Indice del modulo</summary><h3>${esc(titleOf(r.course))}</h3>${indexLinks}</details></aside><article class="reader"><div class="meta">${esc(kinds[r.kind])} · ${esc(r.id)}</div><h1>${esc(r.title)}</h1>${simulations}${r.prompt ? `<p class="exercise-prompt">${esc(r.prompt)}</p>${blocks(r.promptBlocks)}` : ''}<div class="lettura-contenuto">${blocks(r.blocks)}</div><div class="actions">${state.user ? button(r.readVersion === r.version ? 'Lettura registrata' : r.readVersion ? 'Segna la nuova versione come letta' : 'Segna come letta', 'read') : ''}${r.kind === 'lesson' && examples.length ? link('Segui un esempio', 'materiale/' + examples[0].id + '/' + course, true) : ''}${data.owned && q ? button('Prova un problema', 'exercise', true) : ''}</div>${r.kind === 'lesson' && examples.length ? '<h3>Esempi svolti</h3>' + examples.map((e) => listLine(e.title, 'materiale/' + e.id + '/' + course)).join('') : ''}${lab ? listLine(lab.title, 'lab/' + lab.id + '/' + course, 'Laboratorio') : ''}${lessons[idx + 1] ? listLine('Lezione successiva', 'materiale/' + lessons[idx + 1].id + '/' + course, lessons[idx + 1].title) : ''}</article></div>`;
  const reading = main.querySelector('.lettura-contenuto');
  if (r.kind === 'lesson') lessonBenches(reading, r);
  if (r.kind === 'lesson' && r.scaffold) {
    const captions = {'richiama-prerequisito':'Richiama il prerequisito', 'confronta-le-misure':'Confronta le misure', 'segui-un-esempio':'Segui un esempio'};
    reading.insertAdjacentHTML('beforeend', '<details class="c1-index"><summary>' +
      esc(captions[r.scaffold.strategy]) + '</summary><p>' + esc(r.scaffold.citation) + '</p></details>');
  }
  typeset(main);
  if (r.kind === 'example') reading.insertAdjacentHTML('afterend', benchLinks(id));
  on('#read', 'click', async () => {
    await api('/read', { id });
    toast('Lettura salvata nel tuo quaderno.');
    $('#read').textContent = 'Lettura registrata';
  });
  on('#exercise', 'click', () => startRun({ course, skill: r.skill, mode: 'practice' }));
  await lettorePersonale(reading, r);
}
let closePage, returnPage, displayedRoute;
async function router() {
  const [page = 'home', ...parts] = (location.hash.slice(1) || 'home').split('/').map(decodeURIComponent);
  if (page === 'main') {
    main.focus();
    return;
  }
  const focusBeforeRender = document.activeElement;
  segnaleLettori(main, 'lettura:sospendi');
  const here = location.hash.slice(1);
  if (!ready) await refresh();
  ready = true;
  if (here !== location.hash.slice(1)) return;
  const originRoute = main.querySelector('.question-shell')?.dataset.route || displayedRoute;
  closePage?.();
  closePage = undefined;
  let focusOnArrival;
  if (page === 'banco' && parts[1] && parts[1] === originRoute &&
      /^(?:materiale|corso|prova|lab|laboratori|percorsi|studio\/diario)(?:\/|$)/.test(originRoute)) {
    // Reauthorize private runs on return. Other lesson pages can reuse their reading position and DOM.
    const fragment = /^(?:prova\/|percorsi\/|studio\/diario(?:\/|$))/.test(originRoute) ? null : document.createDocumentFragment();
    let source = document.activeElement;
    if (originRoute.startsWith('materiale/') && source?.closest('a')?.hash !== '#' + here) {
      source = [...main.querySelectorAll('a[href]')].find(link => link.hash === '#' + here) || source;
    }
    if (originRoute.startsWith('percorsi/')) {
      source = [...main.querySelectorAll('[data-result]')].find(a => a.dataset.result === parts[0]);
    } else if (originRoute.startsWith('studio/diario')) {
      source = main.querySelector('[data-diary-origin]') || source;
    }
    const practice = main.querySelector('form[data-practice-key]');
    const draft = practice && {session: state.draftSession, key: practice.dataset.practiceKey,
      value: new FormData(practice).get('value')};
    const card = source?.closest('[data-diario-item]');
    const diary = card && { session: state.draftSession, run: card.dataset.run, index: Number(card.dataset.index),
      link: [...card.querySelectorAll('a')].indexOf(source) };
    returnPage = {route: originRoute, fragment, scroll: window.scrollY, focus: fragment ? source : null, diary, draft,
      href: source?.getAttribute('href'), user: state.user?.id};
    fragment?.append(...main.childNodes);
  }
  const restore = returnPage && page !== 'banco' && here === returnPage.route && state.user?.id === returnPage.user;
  if (!restore && page !== 'banco') returnPage = undefined;
  displayedRoute = here;
  main.setAttribute('aria-busy', 'true');
  const section = {
    corso: 'percorsi', materiale: 'percorsi', acquisto: 'percorsi', allenamento: 'percorsi',
    prova: 'studio', lab: 'laboratori', banco: 'laboratori', accedi: 'studio',
  }[page] || page;
  for (const a of document.querySelectorAll('.mast nav a')) {
    const active = a.hash === '#' + section;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', page === section ? 'page' : 'location');
    else a.removeAttribute('aria-current');
  }
  try {
    if (restore && returnPage.fragment) {
      const prior = returnPage;
      returnPage = undefined;
      main.replaceChildren(prior.fragment);
      segnaleLettori(main, 'lettura:riprendi');
      main.removeAttribute('aria-busy');
      document.title = (main.querySelector('h1')?.textContent || 'Officina di Fisica') + ' · Andrea Marro';
      if (prior.focus?.isConnected) prior.focus.focus({preventScroll: true});
      window.scrollTo({top: prior.scroll, behavior: 'instant'});
      return;
    }
    if (page === 'home') home();
    else if (page === 'percorsi') {
      const { catalogPage } = await import('./ricerca.js');
      focusOnArrival = await catalogPage(parts[0], parts[1], catalog);
    } else if (page === 'sprint') main.innerHTML = sprintContent();
    else if (page === 'corso') focusOnArrival = await coursePage(...parts);
    else if (page === 'materiale') await material(...parts);
    else if (page === 'laboratori') await labs(...parts);
    else if (page === 'banco') closePage = await (await import('./banchi/banco.js')).benchPage(...parts);
    else if (page === 'lab') await labPage(...parts);
    else if (page === 'fonti') sources();
    else if (page === 'studio' && parts[0] === 'diario') {
      if (restore && returnPage.diary)
        history.replaceState({ ...history.state, diary: returnPage.diary }, '');
      focusOnArrival = await (await import('./diario.js')).diaryPage(...parts.slice(1));
    }
    else if (page === 'studio') await study();
    else if (page === 'accedi') await login(parts);
    else if (page === 'acquisto') await checkout(parts[0]);
    else if (page === 'allenamento') await trainPage(parts[0]);
    else if (page === 'prova') {
      const draft = restore && returnPage.draft;
      if (draft) await refresh();
      const run = await runPage(parts[0], parts[1] === undefined ? undefined : Number(parts[1]), draft);
      closePage = run.dispose;
      focusOnArrival = run.focus;
    }
    else if (page === 'autore-accesso') {
      await api('/owner', { ticket: parts[0] });
      if (here === location.hash.slice(1)) history.replaceState(null, '', '#autore');
      // replaceState non emette hashchange. La destinazione rilegge la sessione e gestisce il proprio focus.
      ready = false;
      pending = true;
      return;
    } else if (page === 'autore') await authorPage(parts);
    else if (page === 'amministrazione') await admin();
    else if (page === 'edizioni') await editions();
    else throw Error('Pagina non trovata.');
  } catch (e) {
    main.innerHTML =
      crumb([['Inizio', 'home'], ['Accesso']]) +
      head(e.status === 403 ? 'Accesso al materiale' : 'Apri il tuo quaderno', e.message) +
      (e.status === 403 || e.status === 401
        ? `<div class="actions">${link('Il mio studio', 'studio', true)}${link('Esplora i percorsi', 'percorsi')}${!state.user && state.mode === 'verifica' ? button('Apri un quaderno di prova', 'demo') : ''}</div>`
        : button('Riprova', 'retry'));
    on('#retry', 'click', () => go(here));
    demo(here);
  }
  // Un collegamento già visibile può essere attivato durante il caricamento del lettore.
  if (here !== location.hash.slice(1)) return;
  typeset();
  document.title = ([...main.querySelectorAll('h1')].find(h => !h.closest('[hidden]'))?.textContent || 'Officina di Fisica') + ' · Andrea Marro';
  main.removeAttribute('aria-busy');
  if (restore && returnPage) {
    const prior = returnPage;
    returnPage = undefined;
    const links = prior.diary ? main.querySelectorAll('.diary-entry[open] a') : main.querySelectorAll('a');
    const exact = prior.diary && links[prior.diary.link];
    const origin = exact?.getAttribute('href') === prior.href ? exact : [...links].find(a => a.getAttribute('href') === prior.href);
    if (origin && here.startsWith('studio/diario')) {
      for (let details = origin.closest('details'); details; details = details.parentElement?.closest('details'))
        details.open = true;
    }
    (origin || focusOnArrival || main).focus({preventScroll: true});
    window.scrollTo({top: prior.scroll, behavior: 'instant'});
  } else if (document.activeElement !== focusBeforeRender && document.activeElement !== main &&
             main.contains(document.activeElement)) {
    // Il lettore può essere ancora in caricamento quando si raggiunge un controllo della nuova pagina.
    return;
  } else if (focusOnArrival) {
    focusOnArrival.focus();
  } else {
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
async function schedule() {
  pending = true;
  if (routing) return;
  routing = true;
  try {
    while (pending) {
      pending = false;
      await router();
    }
  } catch (e) {
    main.innerHTML = errMsg(e) + button('Riapri la piattaforma', 'retry');
    on('#retry', 'click', () => location.reload());
  } finally {
    routing = false;
  }
}
document.querySelector('.skip').addEventListener('click', (e) => {
  e.preventDefault();
  main.focus();
  main.scrollIntoView();
});
window.addEventListener('hashchange', schedule);
window.addEventListener('pagehide', () => segnaleLettori(main, 'lettura:sospendi'));
let leavingSession = false;
function privateActivity(route = '') {
  return /^(?:materiale\/|prova\/|studio\/diario(?:\/|$))/.test(route.replace(/^#/, ''));
}
function changedSession() {
  segnaleLettori(main, 'lettura:sospendi');
  pulisciBozze();
  ready = false;
  if (!leavingSession && (privateActivity(location.hash) || privateActivity(returnPage?.route))) {
    leavingSession = true;
    main.replaceChildren();
    location.reload();
  }
}
ascoltaCambioAccesso(changedSession);
document.addEventListener('visibilitychange', async () => {
  if (document.hidden || !ready || !privateActivity(location.hash)) return;
  // A background tab can miss both origin messages while suspended.
  try {
    const fresh = await api('/state');
    if (fresh.draftSession !== state.draftSession) changedSession();
  } catch { /* A transient connection failure leaves the current draft available. */ }
});
window.addEventListener('pageshow', event => {
  if (event.persisted && privateActivity(location.hash)) location.reload();
});
schedule();
