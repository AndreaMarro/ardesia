import { api, crumb, esc, go, kinds, main, state } from './ui.js';

function searchRoute(params) {
  const query = params.toString();
  return 'percorsi/cerca' + (query ? '/' + encodeURIComponent(query) : '');
}

function destination(item, course) {
  const id = encodeURIComponent(item.id);
  const context = encodeURIComponent(course || item.course);
  switch (item.kind) {
    case 'course': return 'corso/' + id;
    case 'experiment':
    case 'bench': return 'banco/' + id + '/' + encodeURIComponent(location.hash.slice(1));
    case 'lab': return 'lab/' + id + '/' + context;
    case 'method': return 'corso/' + encodeURIComponent(item.course) + '/metodo/' + id;
    default: return 'materiale/' + id + '/' + context;
  }
}

function options(entries, current) {
  return entries.map(([value, label]) => `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(label)}</option>`).join('');
}

function pageLink(params, number, label) {
  const next = new URLSearchParams(params);
  next.set('page', number);
  return `<a class="button" href="#${esc(searchRoute(next))}">${label}</a>`;
}

function renderResults(result, params) {
  const { total, items, page, pageSize } = result;
  const pages = Math.ceil(total / pageSize);
  const title = total === 0 ? 'Nessun risultato' : total === 1 ? 'Un risultato' : total + ' risultati';
  const rows = items.map(item => `<li><a data-result="${esc(item.id)}" href="#${esc(destination(item, params.get('course')))}">
    <span class="search-kind">${esc(kinds[item.kind])}</span><strong>${esc(item.title)}</strong>
    <span class="search-code">${esc(item.id)}</span><span class="search-arrow" aria-hidden="true">→</span></a></li>`).join('');
  const summary = rows && pages > 1 ? `<span>Pagina ${page} di ${pages}</span>` : '';
  const nav = [];
  if (!items.length && total) nav.push(pageLink(params, 1, 'Prima pagina'));
  else if (page > 1) nav.push(pageLink(params, page - 1, 'Precedente'));
  if (page < pages) nav.push(pageLink(params, page + 1, 'Successiva'));
  return `<div class="search-count"><h2 tabindex="-1" id="search-result-title">${title}</h2>${summary}</div>` +
    (rows ? '<ul class="search-list">' + rows + '</ul>' :
      '<p>' + (total ? 'Questa pagina è fuori dall’elenco.' : 'Prova un termine più breve oppure togli un filtro.') + '</p>') +
    (nav.length ? '<nav class="search-pages" aria-label="Pagine dei risultati">' + nav.join('') + '</nav>' : '');
}

export async function catalogPage(mode, query = '', catalog) {
  const params = new URLSearchParams(query);
  const course = params.get('course') || '', kind = params.get('kind') || '';
  const optionsKinds = ['course', 'lesson', 'example', 'question', 'experiment', 'bench', 'lab', 'method'].map(k => [k, kinds[k]]);
  const courses = state.courses.map(c => [c.id, c.id + ' · ' + c.title]);
  main.innerHTML = crumb([['Inizio', 'home'], ['Percorsi']]) +
    `<section class="search-sheet"><h1>I percorsi</h1>
      <form role="search" aria-label="Materiali dei microcorsi">
        <div class="search-entry"><label for="search-term">Cerca per argomento o codice</label>
          <div><input id="search-term" type="search" name="q" value="${esc(params.get('q') || '')}" maxlength="96" placeholder="Es. velocità, C1-Q027"><button class="solid">Cerca</button></div></div>
        <div class="search-filters"><div><label for="search-course">Percorso</label><select id="search-course" name="course">${options([['', 'Tutti i percorsi'], ...courses], course)}</select></div>
          <div><label for="search-kind">Materiale</label><select id="search-kind" name="kind">${options([['', 'Tutti i materiali'], ...optionsKinds], kind)}</select></div></div>
      </form></section>
      <section class="search-results" aria-labelledby="search-result-title"></section>`;
  const form = main.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const chosen = new URLSearchParams();
    for (const [key, value] of new FormData(form)) if (value.trim()) chosen.set(key, value.trim());
    go(searchRoute(chosen));
  });
  const region = main.querySelector('.search-results');
  if (!query) {
    region.innerHTML = '<h2 id="search-result-title">Sfoglia per corso</h2>' + catalog();
    return mode === 'cerca' ? form.elements.q : null;
  }
  try {
    const result = await api('/v1/catalog/search?' + params);
    region.innerHTML = renderResults(result, params) + '<a class="search-reset" href="#percorsi">Sfoglia tutti i percorsi</a>';
  } catch (error) {
    region.innerHTML = '<h2 id="search-result-title" tabindex="-1">Ricerca interrotta</h2><p>' + esc(error.message) + '</p>' +
      '<a class="search-reset" href="#percorsi">Riparti dai percorsi</a>';
  }
  region.addEventListener('click', event => {
    const target = event.target.closest('a[data-result]');
    if (target) history.replaceState({ ...history.state, catalogResult: target.dataset.result }, '');
  });
  return Array.from(region.querySelectorAll('[data-result]')).find(a => a.dataset.result === history.state?.catalogResult)
    || region.querySelector('h2');
}
