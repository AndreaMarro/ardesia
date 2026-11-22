import { activityPanel, installActivities } from './attivita-metodo.js';
import { equivalent } from './espressioni.js';
import {
  errorNames,
  api,
  esc,
  main,
  state,
  go,
  link,
  button,
  blocks,
  typeset,
  toast,
  crumb,
  head,
  refresh,
  runAction,
  kinds,
  date,
} from './ui.js';
import { parameters, modes, initial, models } from './models.js';
import { diagram } from './labs.js';
import { installaPassaggi } from './lettura.js';

const typeNames = { ...kinds, text: 'Testo', formula: 'Formula', figure: 'Figura', attachment: 'Allegato' };
const kindOrder = ['course', 'section', 'lesson', 'example', 'question', 'lab', 'bench', 'experiment', 'method'];
const blockTypes = ['text', 'formula', 'figure', 'example', 'question', 'lab', 'attachment'];
const answerTypes = { choice: 'Scelta multipla', text: 'Completamento', numeric: 'Risposta numerica' };
const route = (k) => 'autore/modifica/' + encodeURIComponent(k);
const select = (selector, node = main) => node.querySelector(selector);
const options = (pairs, current = '') =>
  pairs
    .map(
      ([key, title]) =>
        `<option value="${esc(key)}" ${String(current) === String(key) ? 'selected' : ''}>${esc(title)}</option>`,
    )
    .join('');
const pairs = (rows) => rows.map((r) => [r.id, r.id + ' · ' + r.title]);
const lineList = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);
const titleOrder = (a, b) =>
  String(a.course).localeCompare(String(b.course), 'it', { numeric: true }) ||
  kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) ||
  a.order - b.order ||
  a.id.localeCompare(b.id, 'it', { numeric: true });
const statusName = (r) =>
  r.draft ? (r.live ? 'Aggiornamento in bozza' : 'Bozza') : r.live ? 'Pubblicato' : 'Ritirato';
const hasDraft = (row) => Boolean(row?.draft);
const listSize = 24;
let lastFilter = { text: '', course: '', kind: '', status: '', page: 0 };
const brandHeader = (name, detail) =>
  crumb([
    ['Inizio', 'home'],
    ...(name === 'Area autore' ? [['Area autore']] : [['Area autore', 'autore'], [name]]),
  ]) + head(name, detail);
function authorNav(active) {
  const tabs = [
    ['autore', 'Materiali'],
    ['autore/lotti', 'Importa ed esporta'],
    ['amministrazione', 'Ordini e incassi'],
    ['edizioni', 'Edizioni PDF'],
  ];
  return (
    '<nav class="tabs" aria-label="Strumenti autore">' +
    tabs.map(([r, t]) => `<a class="${r === active ? 'active' : ''}" href="#${r}">${t}</a>`).join('') +
    '</nav>'
  );
}
function download(data, name) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function postButton(id, callback) {
  const el = select('#' + id);
  if (el) el.onclick = (e) => runAction(e.currentTarget, callback);
}
function inGroups(id, rows, used = []) {
  const ids = new Set([id, ...used].filter(Boolean));
  let prior;
  do {
    prior = ids.size;
    for (const course of rows) if (course.includes?.some((child) => ids.has(child))) ids.add(course.id);
  } while (prior !== ids.size);
  return [...ids].sort().join(', ');
}
async function many(keys, load) {
  const entries = [];
  for (let i = 0; i < keys.length; i += 6)
    entries.push(...(await Promise.all(keys.slice(i, i + 6).map(load))));
  return entries;
}
function listPage(rows) {
  const courses = rows.filter((x) => x.kind === 'course'),
    selected = new Set(),
    f = lastFilter;
  main.innerHTML =
    brandHeader(
      'Area autore',
      'Consulta il catalogo di lavoro, prepara le bozze e decidi quando renderle disponibili agli studenti.',
    ) +
    authorNav('autore') +
    `<div class="kickerline"><h2>Archivio dei materiali</h2>${link('Crea un materiale', 'autore/nuovo', true)}</div>
    <div class="labfields"><label class="field">Trova per titolo o codice<input id="find" type="search" autocomplete="off" value="${esc(f.text)}"></label>
    <label class="field">Corso<select id="filter-course">${options([['', 'Tutti i corsi'], ...pairs(courses)], f.course)}</select></label>
    <label class="field">Tipo<select id="filter-kind">${options([['', 'Tutti i tipi'], ...kindOrder.map((k) => [k, kinds[k]])], f.kind)}</select></label>
    <label class="field">Stato<select id="filter-state">${options(
      [
        ['', 'Tutti gli stati'],
        ['draft', 'Con bozza'],
        ['live', 'Pubblicato'],
        ['off', 'Ritirato'],
      ],
      f.status,
    )}</select></label></div>
    <div class="actions">${button('Seleziona le bozze filtrate', 'pick-drafts')}${button('Rivedi la selezione', 'publish-selection')}${link('Riordina i materiali', 'autore/ordine')}</div>
    <p id="pick-status" class="helper" role="status"></p><div id="batch-action"></div><div id="found"></div>`;
  const filtered = () =>
    rows
      .filter(
        (r) =>
          (!f.course || r.course === f.course) &&
          (!f.kind || r.kind === f.kind) &&
          (!f.status ||
            (f.status === 'draft' ? hasDraft(r) : f.status === 'live' ? r.live : !r.live && !r.draft)) &&
          (r.title + ' ' + r.id + ' ' + r.section)
            .toLocaleLowerCase('it')
            .includes(f.text.trim().toLocaleLowerCase('it')),
      )
      .sort(titleOrder);
  function selection() {
    select('#pick-status').textContent = selected.size
      ? selected.size === 1
        ? 'Una bozza selezionata per la pubblicazione.'
        : selected.size + ' bozze selezionate per la pubblicazione.'
      : '';
    select('#publish-selection').disabled = !selected.size;
    select('#batch-action').innerHTML = '';
  }
  function draw() {
    const result = filtered();
    f.page = Math.max(0, Math.min(f.page, Math.ceil(result.length / listSize) - 1));
    const offset = f.page * listSize,
      group = result.slice(offset, offset + listSize);
    select('#found').innerHTML =
      `<p class="meta">${result.length} materiali${result.length ? ' · ' + (offset + 1) + '–' + (offset + group.length) : ''}</p>${group.length ? `<div class="tablebox"><table><thead><tr><th><span class="sr">Selezione</span></th><th>Materiale</th><th>Corso e tipo</th><th>Stato</th></tr></thead><tbody>${group.map((r) => `<tr><td>${r.draft ? `<label><input type="checkbox" data-pick="${esc(r.id)}" ${selected.has(r.id) ? 'checked' : ''}><span class="sr">Seleziona ${esc(r.title)}</span></label>` : ''}</td><td><a href="#${route(r.id)}"><strong>${esc(r.title)}</strong></a><br><small>${esc(r.id)}</small></td><td>${esc(r.course)} · ${kinds[r.kind]}</td><td>${esc(statusName(r))}${r.draft ? ' · v' + r.draft : r.live ? ' · v' + r.live : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="notice">Nessun materiale corrisponde ai filtri applicati.</p>'}
        ${result.length > listSize ? `<nav class="actions" aria-label="Pagine dei materiali">${button('Pagina precedente', 'prev-page')}${button('Pagina successiva', 'next-page')}</nav>` : ''}`;
    select('#found').onchange = (e) => {
      const id = e.target.dataset.pick;
      if (!id) return;
      e.target.checked ? selected.add(id) : selected.delete(id);
      selection();
    };
    for (const [id, delta] of [
      ['prev-page', -1],
      ['next-page', 1],
    ]) {
      const ctrl = select('#' + id);
      if (!ctrl) continue;
      ctrl.disabled = delta < 0 ? f.page === 0 : offset + listSize >= result.length;
      ctrl.onclick = () => {
        f.page += delta;
        draw();
        select('#found').scrollIntoView({ block: 'start' });
      };
    }
    selection();
  }
  for (const [id, name] of [
    ['find', 'text'],
    ['filter-course', 'course'],
    ['filter-kind', 'kind'],
    ['filter-state', 'status'],
  ]) {
    select('#' + id).addEventListener(id === 'find' ? 'input' : 'change', (e) => {
      f[name] = e.target.value;
      f.page = 0;
      draw();
    });
  }
  select('#pick-drafts').onclick = () => {
    const visible = filtered().filter(hasDraft),
      all = visible.every((r) => selected.has(r.id));
    for (const r of visible) all ? selected.delete(r.id) : selected.add(r.id);
    draw();
  };
  postButton('publish-selection', async () => {
    const info = await many([...selected], (id) => api('/author/item/' + encodeURIComponent(id)));
    for (const item of info) validatePreview(item.record);
    select('#batch-action').innerHTML =
      `<section class="sheetpanel"><h3>Rileggi prima della pubblicazione</h3><ul>${info.map((r) => `<li>${esc(r.record.title)} · v${r.head.draft || '—'} · ${esc(r.used.join(', '))}</li>`).join('')}</ul><p>Le versioni selezionate diventeranno disponibili insieme nei corsi indicati.</p><div class="actions">${button('Pubblica queste bozze', 'confirm-group', true)}${button('Annulla', 'cancel-group')}</div><p id="action-status" role="status"></p></section>`;
    select('#cancel-group').onclick = () => {
      select('#batch-action').innerHTML = '';
    };
    postButton('confirm-group', async () => {
      const targets = Object.fromEntries(info.map((x) => [x.record.id, x.head.draft]));
      await api('/author/publish', { targets });
      await refresh();
      toast('Bozze pubblicate.');
      go('autore');
    });
  });
  draw();
}
function exchangePage() {
  main.innerHTML =
    brandHeader(
      'Importa ed esporta',
      'Conserva i materiali in un lotto JSON aperto. Puoi controllare l’intero lotto prima di portarlo nelle bozze.',
    ) +
    authorNav('autore/lotti') +
    `<div class="split"><section class="sheetpanel"><h2>Importa un lotto</h2><label class="field">File di contenuti (.json)<input type="file" id="batch-file" accept=".json,application/json"></label><p id="batch-file-name" class="helper"></p><details><summary>Incolla il contenuto JSON</summary><label class="field">Lotto in formato astra/1<textarea id="batch-source" rows="7" spellcheck="false"></textarea></label></details><div class="actions">${button('Controlla il lotto', 'check-batch', true)}${button('Importa in bozza', 'commit-batch')}</div><div id="batch-report" role="status"></div></section>
    <aside class="sheetpanel intro-card"><h2>Esporta l’archivio</h2><p>L’esportazione contiene i materiali di lavoro, i riferimenti alle figure e i file caricati. Ogni record include la versione da cui ripartire.</p><div class="actions">${button('Scarica archivio JSON', 'export-all')}</div><details><summary>Struttura del lotto</summary><p>La chiave <code>schema</code> vale <code>astra/1</code>. In <code>records</code> inserisci lezioni, esempi, quesiti o configurazioni, ognuno con un ID stabile. Per un nuovo ID la versione di partenza è 0. Per aggiornare un ID esistente conserva il suo <code>baseVersion</code>. I file caricati sono inclusi in <code>assets</code>.</p></details></aside></div><p id="action-status" role="alert"></p>`;
  const source = select('#batch-source'),
    file = select('#batch-file'),
    report = select('#batch-report'),
    commit = select('#commit-batch');
  let selectedFile = null,
    checked = null;
  const reset = () => {
    checked = null;
    commit.disabled = true;
    report.textContent = '';
  };
  reset();
  source.oninput = () => {
    reset();
    selectedFile = null;
    file.value = '';
    select('#batch-file-name').textContent = '';
  };
  file.onchange = () => {
    reset();
    selectedFile = file.files[0] || null;
    if (selectedFile) {
      source.value = '';
      select('#batch-file-name').textContent = selectedFile.name;
    }
  };
  const display = (r) => {
    report.innerHTML = r.errors.length
      ? `<div class="notice"><strong>Correzioni richieste</strong><ul>${r.errors.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>`
      : `<p class="notice good">${r.count === 1 ? (r.saved ? 'Un materiale importato in bozza.' : 'Un materiale controllato. Il lotto può essere importato in bozza.') : r.count + ' materiali ' + (r.saved ? 'importati in bozza.' : 'controllati. Il lotto può essere importato in bozza.')}</p>`;
  };
  postButton('check-batch', async () => {
    reset();
    let pkg;
    try {
      pkg = JSON.parse(selectedFile ? await selectedFile.text() : source.value);
    } catch {
      report.textContent = 'Il file o il testo non è JSON valido. Controlla parentesi, virgole e virgolette.';
      return;
    }
    const response = await api('/author/import', { package: pkg, commit: false });
    display(response);
    if (!response.errors.length) {
      checked = pkg;
      commit.disabled = false;
    }
  });
  // The server validates again in the committing transaction.
  commit.onclick = async () => {
    if (!checked || commit.disabled) return;
    commit.disabled = true;
    try {
      const r = await api('/author/import', { package: checked, commit: true });
      display(r);
      checked = null;
      if (r.saved)
        report.innerHTML += '<div class="actions">' + link('Apri le bozze', 'autore', true) + '</div>';
      if (r.saved) lastFilter = { text: '', kind: '', course: '', status: 'draft', page: 0 };
    } catch (e) {
      report.textContent = e.message;
      commit.disabled = false;
    }
  };
  postButton('export-all', async () => {
    download(await api('/author/export'), 'officina-fisica-archivio.json');
    toast('Esportazione pronta.');
  });
}
async function sortPage(rows) {
  const courses = rows.filter((x) => x.kind === 'course');
  const selectedCourse = lastFilter.course || courses[0]?.id,
    selectedKind = lastFilter.kind || 'lesson';
  main.innerHTML =
    brandHeader(
      'Riordina i materiali',
      'Scegli un gruppo, sposta le voci e salva l’ordine in bozza. Puoi pubblicare insieme tutte le versioni interessate.',
    ) +
    authorNav('autore') +
    `<div class="labfields"><label class="field">Corso<select id="sort-course">${options(pairs(courses), selectedCourse)}</select></label>
    <label class="field">Tipo<select id="sort-kind">${options(
      kindOrder.filter((k) => k !== 'course').map((k) => [k, kinds[k]]),
      selectedKind,
    )}</select></label>
    <label class="field">Sezione<select id="sort-section"></select></label></div><div id="sort-rows"></div>
    <div class="actions">${button('Salva ordine in bozza', 'save-order', true)}${link('Archivio dei materiali', 'autore')}</div><p id="action-status" role="status"></p>`;
  let ordered = [],
    initialList = [];
  const group = () =>
    rows.filter((r) => r.course === select('#sort-course').value && r.kind === select('#sort-kind').value);
  function loadGroup() {
    const section = select('#sort-section').value;
    ordered = group()
      .filter((x) => !section || x.section === section)
      .sort(titleOrder);
    initialList = ordered.map((r) => r.id);
    draw();
  }
  function loadSections() {
    select('#sort-section').innerHTML = options([
      ['', 'Tutte le sezioni'],
      ...[
        ...new Set(
          group()
            .map((r) => r.section)
            .filter(Boolean),
        ),
      ].map((s) => [s, s]),
    ]);
    loadGroup();
  }
  function draw() {
    select('#sort-rows').innerHTML = ordered.length
      ? ordered
          .map(
            (r, i) =>
              `<div class="topic-row"><span><small>${i + 1}.</small> ${esc(r.title)}</span><div class="inline"><button data-move="-1" data-at="${i}" aria-label="Alza ${esc(r.title)}" ${i === 0 ? 'disabled' : ''}>↑</button><button data-move="1" data-at="${i}" aria-label="Abbassa ${esc(r.title)}" ${i === ordered.length - 1 ? 'disabled' : ''}>↓</button></div></div>`,
          )
          .join('')
      : '<p class="notice">Questo gruppo non contiene materiali.</p>';
    select('#save-order').disabled = !ordered.some((r, i) => r.id !== initialList[i]);
  }
  select('#sort-course').onchange = select('#sort-kind').onchange = loadSections;
  select('#sort-section').onchange = loadGroup;
  select('#sort-rows').onclick = (e) => {
    const b = e.target.closest('[data-move]');
    if (!b) return;
    const i = +b.dataset.at,
      j = i + +b.dataset.move;
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    draw();
    select(`[data-at="${j}"][data-move="${b.dataset.move}"]:enabled`)?.focus();
  };
  postButton('save-order', async () => {
    const sorted = ordered.map((r) => r.order).sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) if (sorted[i] <= sorted[i - 1]) sorted[i] = sorted[i - 1] + 1;
    const changes = ordered.map((r, i) => [r, sorted[i]]).filter(([r, pos]) => r.order !== pos);
    const records = await many(changes, async ([r, pos]) => {
      const item = await api('/author/item/' + encodeURIComponent(r.id));
      return { ...item.record, order: pos, baseVersion: item.base };
    });
    const result = await api('/author/import', { package: { schema: 'astra/1', records }, commit: true });
    if (result.errors.length) throw Error(result.errors.join(' · '));
    lastFilter = {
      text: '',
      kind: select('#sort-kind').value,
      course: select('#sort-course').value,
      status: 'draft',
      page: 0,
    };
    toast('Ordine salvato in ' + result.count + ' bozze.');
    go('autore');
  });
  loadSections();
}
function newPage() {
  main.innerHTML =
    brandHeader(
      'Crea un materiale',
      'Scegli la scheda da preparare. Il materiale avrà un identificatore stabile e resterà in bozza fino alla pubblicazione.',
    ) +
    authorNav('autore') +
    '<div class="big-list">' +
    [
      ['course', 'Un percorso con i suoi materiali, anche condivisi.'],
      ['section', 'Un gruppo ordinabile di materiali dello stesso corso.'],
      ['lesson', 'Spiegazioni, formule, figure e attività collegate.'],
      ['example', 'Un problema e i passaggi dello svolgimento.'],
      ['question', 'Una prova con risposta, suggerimento e recupero.'],
      ['lab', 'Una nuova attività basata su un laboratorio esistente.'],
    ]
      .map(
        ([k, d]) =>
          `<a class="line-link" href="#autore/nuovo/${k}"><span><strong>${kinds[k]}</strong><br>${esc(d)}</span><span aria-hidden="true">→</span></a>`,
      )
      .join('') +
    '</div>';
}
function blank(kind, rows) {
  const course = lastFilter.course || rows.find((r) => r.kind === 'course')?.id || 'C1';
  const suffix = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 8);
  const id =
    (kind === 'course'
      ? 'C'
      : course + '-' + { section: 'S', lesson: 'L', example: 'E', question: 'Q', lab: 'LAB', method: 'M' }[kind]) +
    '-' +
    suffix;
  const siblings = rows.filter((r) => r.kind === kind && (kind === 'course' || r.course === course));
  const r = {
    id,
    kind,
    course: kind === 'course' ? id : course,
    title: '',
    section: '',
    order: Math.max(0, ...siblings.map((s) => s.order)) + 1,
    version: 1,
    skill: kind === 'lesson' ? id : '',
    prerequisites: [],
    blocks: [],
  };
  if (['lesson', 'example', 'question', 'lab'].includes(kind)) r.blocks = [{ type: 'text', text: '' }];
  if (['example', 'question'].includes(kind))
    Object.assign(r, { prompt: '', promptBlocks: [], family: '', difficulty: 1 });
  if (kind === 'question')
    Object.assign(r, {
      answer: { type: 'choice', options: ['', '', '', ''], value: '' },
      hints: [],
      error: { category: 'concetto', message: '', target: '' },
    });
  if (kind === 'lab')
    Object.assign(r, {
      model: 'C1',
      defaults: initial('C1'),
      prediction: '',
      observation: '',
      interpretation: '',
    });
  if (kind === 'course') Object.assign(r, { summary: '', includes: [] });
  return r;
}
const clone = (data) => JSON.parse(JSON.stringify(data));
function assignValue(r, path, value) {
  const keys = path.split('.');
  let node = r;
  for (const k of keys.slice(0, -1)) node = node[k] ??= /^\d+$/.test(k) ? [] : {};
  node[keys.at(-1)] = value;
}
function readValue(r, path) {
  return path.split('.').reduce((a, k) => a?.[k], r);
}
function simple(label, key, value = '', type = 'text', extra = '') {
  return `<label class="field">${esc(label)}<input type="${type}" data-key="${esc(key)}" value="${esc(value)}" ${extra}></label>`;
}
function area(label, key, value = '', rows = 3, format = '') {
  const data = format ? ` data-format="${format}"` : '';
  return `<label class="field">${esc(label)}<textarea rows="${rows}" data-key="${esc(key)}"${data}>${esc(Array.isArray(value) ? value.join('\n') : value)}</textarea></label>`;
}
function drop(label, key, value, opts) {
  return `<label class="field">${esc(label)}<select data-key="${esc(key)}">${options(opts, value)}</select></label>`;
}
function checking(formula) {
  if (!window.katex?.renderToString) return '';
  try {
    window.katex.renderToString(formula, { throwOnError: true, strict: false, trust: false });
    return '';
  } catch (e) {
    return e.message;
  }
}
function diagramUpload(block, path) {
  const image = block.type === 'figure';
  return `<label class="field">${image ? 'Carica o sostituisci il disegno' : 'Carica o sostituisci il file'}<input type="file" data-upload="${esc(path)}" accept="${image ? 'image/png,image/jpeg,image/webp,image/svg+xml' : 'application/pdf,image/png,image/jpeg,image/webp,image/svg+xml'}"></label>
    <p class="helper">${image ? 'PNG, JPG, WebP o SVG' : 'PDF, PNG, JPG, WebP o SVG'} · massimo 4 MiB.${block.src ? ' File già collegato.' : ''}</p>
    <details><summary>Collega un asset già presente</summary>${simple('Percorso del file nella piattaforma', path + '.src', block.src)}</details>`;
}
const mathSnippets = [
  ['Frazione', '\\frac{a}{b}'],
  ['Potenza', 'x^{2}'],
  ['Indice', 'x_{1}'],
  ['Radice', '\\sqrt{x}'],
  ['Prodotto', '\\cdot '],
  ['Delta', '\\Delta '],
  ['Pi greco', '\\pi '],
  ['Unità', '\\mathrm{m/s}'],
];
function blockEditor(group, i, b) {
  const path = group + '.' + i,
    ref = ['example', 'question', 'lab'].includes(b.type);
  let body = '';
  if (ref)
    body =
      simple('Materiale da richiamare', path + '.ref', b.ref, 'text', `list="refs-${esc(b.type)}"`) +
      simple('Titolo del collegamento', path + '.text', b.text);
  else if (b.type === 'figure' || b.type === 'attachment')
    body =
      diagramUpload(b, path) +
      area(
        b.type === 'figure' ? 'Didascalia e descrizione accessibile' : 'Titolo del file scaricabile',
        path + '.text',
        b.text,
        2,
      );
  else
    body =
      area(
        b.type === 'formula' ? 'Espressione matematica' : 'Paragrafo',
        path + '.text',
        b.text,
        b.type === 'formula' ? 2 : 4,
      ) +
      (b.type === 'formula'
        ? `<div class="inline">${mathSnippets.map(([l, s]) => `<button type="button" data-snippet="${esc(s)}" data-for="${esc(path + '.text')}">${esc(l)}</button>`).join('')}</div><p class="helper">Leggi la resa tipografica con Anteprima. Per correggere una formula puoi sostituire numeri e simboli nel campo.</p>`
        : '');
  return `<div class="editor-block" data-block="${esc(path)}"><header><strong>${i + 1}. ${esc(typeNames[b.type] || b.type)}</strong><div class="inline"><button type="button" aria-label="Alza blocco ${i + 1}" data-op="up" data-path="${path}">↑</button><button type="button" aria-label="Abbassa blocco ${i + 1}" data-op="down" data-path="${path}">↓</button><button type="button" aria-label="Rimuovi blocco ${i + 1}" data-op="remove" data-path="${path}">Rimuovi</button></div></header>${body}</div>`;
}
function groupEditor(name, rec, label, help) {
  const arr = rec[name] || [],
    allowed = name === 'promptBlocks' ? ['text', 'figure', 'formula'] : blockTypes;
  return `<section class="sheetpanel"><h3>${esc(label)}</h3>${help ? '<p class="helper">' + esc(help) + '</p>' : ''}<div data-group="${name}">${arr.map((b, i) => blockEditor(name, i, b)).join('')}</div>
    <div class="actions"><label class="field">Tipo di blocco<select data-type-for="${name}">${options(allowed.map((t) => [t, typeNames[t]]))}</select></label><button type="button" data-add-block="${name}">Aggiungi blocco</button></div></section>`;
}
function multiple(label, key, values, rows) {
  const set = new Set(values || []),
    items = rows.filter((r) => !set.has(r.id));
  return `<div class="editor-block"><strong>${esc(label)}</strong><div class="taglist">${[...set].map((v) => `<button type="button" class="textbtn" data-remove-from="${esc(key)}" data-id="${esc(v)}" aria-label="Rimuovi ${esc(v)} da ${esc(label)}">${esc(rows.find((x) => x.id === v)?.title || v)} ×</button>`).join('')}</div>
    <div class="inline"><label class="field">${esc(label)} da aggiungere<select data-pick-for="${esc(key)}">${options([['', 'Scegli dalla lista'], ...pairs(items)])}</select></label>
    <button type="button" data-add-to="${esc(key)}">Aggiungi</button></div></div>`;
}
function questionEditor(r) {
  const a = r.answer || { type: 'choice' },
    er = r.error || {};
  let answer = '';
  if (a.type === 'choice')
    answer =
      area('Alternative, una per riga', 'answer.options', a.options, 5, 'lines') +
      drop('Alternativa corretta', 'answer.value', a.value, [
        ['', 'Scegli la risposta corretta'],
        ...(a.options || []).filter(Boolean).map((x) => [x, x]),
      ]);
  if (a.type === 'text')
    answer =
      simple('Risposta attesa', 'answer.value', a.value) +
      area('Altre grafie accettate, una per riga', 'answer.aliases', a.aliases, 2, 'lines');
  if (a.type === 'numeric')
    answer =
      simple('Valore corretto', 'answer.value', a.value, 'number', 'step="any" data-format="number"') +
      simple('Unità richiesta (vuoto per quantità adimensionale)', 'answer.unit', a.unit) +
      simple(
        'Tolleranza assoluta ammessa',
        'answer.tolerance',
        a.tolerance,
        'number',
        'min="0" step="any" data-format="number"',
      );
  return `<section class="sheetpanel"><h3>Risposta e recupero</h3>${drop('Modalità di risposta', 'answer.type', a.type, Object.entries(answerTypes))}
    <div id="answer-fields">${answer}</div>${area('Suggerimenti, uno per riga', 'hints', r.hints, 2, 'lines')}${drop('Difficoltà associata all’errore', 'error.category', er.category, Object.entries(errorNames))}
    ${area('Feedback sul ragionamento', 'error.message', er.message, 3)}
    ${simple('Lezione o laboratorio di recupero', 'error.target', er.target, 'text', 'list="refs-recovery"')}</section>`;
}
function labEditor(r) {
  const model = r.model || 'C1',
    defs = initial(model, r.defaults || {});
  return `<section class="sheetpanel"><h3>Esperimento</h3>${drop('Modello fisico', 'model', model, [
    ['C1', 'Forze e attrito'],
    ['C2', 'Portata nel condotto'],
    ['C3', 'Gas e trasformazioni'],
    ['C4', 'Resistori'],
    ['C5', 'Lente convergente'],
  ])}
    ${area('Domanda di previsione', 'prediction', r.prediction)}${area('Osservazione guidata', 'observation', r.observation)}
    ${area('Interpretazione per il confronto finale', 'interpretation', r.interpretation)}<h4>Configurazione iniziale</h4>
    ${
      modes[model]
        ? drop(
            'Modalità iniziale',
            'defaults.mode',
            defs.mode,
            modes[model].map((x) => [x, x]),
          )
        : ''
    }
    <div class="labfields">${parameters[model].map(([k, n, u, min, max, step]) => simple(n + (u ? ' (' + u + ')' : '') + ' · ' + min + '–' + max, 'defaults.' + k, defs[k], 'number', `min="${min}" max="${max}" step="${step}" data-format="number"`)).join('')}</div></section>`;
}
function labWarnings(r) {
  const warnings = [];
  for (const [k, label, unit, min, max, step] of parameters[r.model] || []) {
    const value = r.defaults?.[k];
    if (value === undefined) continue;
    if (!Number.isFinite(value) || value < min || value > max) {
      warnings.push(label + ' richiede un valore tra ' + min + ' e ' + max + ' ' + unit + '.');
      continue;
    }
    const steps = (value - min) / step;
    if (Math.abs(steps - Math.round(steps)) > 1e-7)
      warnings.push(label + ' ammette incrementi di ' + step + ' ' + unit + ' dal minimo ' + min + '.');
  }
  if (r.defaults?.mode && !modes[r.model]?.includes(r.defaults.mode))
    warnings.push('Seleziona una configurazione prevista per il modello.');
  return warnings;
}
function methodEditor(r) {
  const numeric = (label, key, value) => simple(label, key, value, 'number', 'step="any" data-format="number"');
  function chartFields(d, path) {
    return simple('Asse orizzontale', path+'.x', d.x) + simple('Asse verticale', path+'.y', d.y) +
      ['xmax','ymin','ymax', ...(d.wave ? ['wave'] : [])].map(k=>numeric(
        {xmax:'Massimo orizzontale',ymin:'Minimo verticale',ymax:'Massimo verticale',wave:'Periodo della curva'}[k],
        path+'.'+k, d[k] ?? 0)).join('') +
      d.points.map((pt,i)=>pt.map((v,j)=>numeric('Punto '+(i+1)+' · '+(j ? 'ordinata' : 'ascissa'),
        path+'.points.'+i+'.'+j,v)).join('')).join('');
  }
  const setup = r.format === 'formula' ?
    area('Consegna','prompt',r.prompt) + simple('Relazione iniziale','relation',r.relation) +
    simple('Incognita','target',r.target) + area('Simboli ammessi, uno per riga','symbols',r.symbols,3,'lines') :
    chartFields(r.diagram,'diagram') + (r.diagram.comparison ? chartFields(r.diagram.comparison,'diagram.comparison') : '') +
    r.diagram.captions.map((c,i)=>area('Didascalia '+(i+1),'diagram.captions.'+i,c,2)).join('');
  const steps = r.steps.map((s,i)=>{
    const path='steps.'+i+'.';
    return '<details><summary>Passaggio '+(i+1)+' · '+esc(s.prompt)+'</summary>'+
      area('Domanda',path+'prompt',s.prompt,2)+
      (s.kind==='choice' ? area('Alternative, una per riga',path+'options',s.options,3,'lines') : '')+
      (s.kind==='number' ? numeric('Valore corretto',path+'answer',s.answer) : simple('Risposta corretta',path+'answer',s.answer))+
      area('Indizio dopo un errore',path+'hint',s.hint,2)+area('Spiegazione della risposta',path+'why',s.why,2)+'</details>';
  }).join('');
  return '<section class="sheetpanel"><h3>Attività di metodo</h3>'+setup+steps+'</section>';
}
function validatePreview(r) {
  if (r.kind === 'method' && r.format === 'formula') {
    for (const step of r.steps.filter(s => s.kind === 'expression'))
      if (!equivalent(step.answer, step.answer, r.symbols, r.target)) throw Error('La chiave algebrica richiede simboli e operazioni supportati.');
  }
  const equations = [...(r.promptBlocks || []), ...(r.blocks || [])].filter((b) => b.type === 'formula');
  for (const [i, b] of equations.entries()) {
    const msg = checking(b.text);
    if (msg) throw Error(r.id + ' · Formula ' + (i + 1) + ' da correggere. ' + msg);
  }
  const warnings = r.kind === 'lab' ? labWarnings(r) : [];
  if (warnings.length) throw Error(r.id + ' · ' + warnings.join(' '));
}
function preview(r, rows) {
  const who = [r.course, ...(r.reuse || [])].filter(Boolean).join(', ');
  let html = `<div class="meta">${esc(kinds[r.kind])} · ${esc(who)}</div><h2>${esc(r.title || 'Senza titolo')}</h2>`;
  if (r.kind === 'method') return html + activityPanel([r]);
  if (r.kind === 'course')
    html +=
      `<p>${esc(r.summary || '')}</p>` +
      ((r.includes || []).length
        ? `<p>Include ${esc(r.includes.map((id) => rows.find((x) => x.id === id)?.title || id).join(', '))}.</p>`
        : '');
  if (r.prompt) html += `<p class="exercise-prompt">${esc(r.prompt)}</p>` + blocks(r.promptBlocks || []);
  if (r.kind === 'question') {
    const a = r.answer || {};
    if (a.type === 'choice')
      html += '<ol type="A">' + (a.options || []).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol>';
    if (a.type === 'numeric')
      html += `<p>Risposta numerica${a.unit ? ' in ' + esc(a.unit) : ''} · tolleranza ±${esc(a.tolerance)}</p>`;
    html += `<div class="callout"><strong>Risposta attesa</strong><p>${esc(a.value)} ${esc(a.unit || '')}</p></div>`;
  }
  if (r.kind === 'example' || r.kind === 'question') html += '<h3>Svolgimento</h3>';
  html += '<div class="lettura-contenuto">' + blocks(r.blocks) + '</div>';
  if (r.kind === 'lab' && parameters[r.model]) {
    html += [
      ['Previsione', r.prediction],
      ['Osservazione', r.observation],
    ]
      .map(([l, t]) => (t ? `<h3>${l}</h3><p>${esc(t)}</p>` : ''))
      .join('');
    const warnings = labWarnings(r);
    if (warnings.length) html += `<p class="notice">${esc(warnings.join(' '))}</p>`;
    else {
      const defaults = initial(r.model, r.defaults || {});
      const [svg, caption, values] = diagram(r.model, defaults, models[r.model](defaults));
      html += `<h3>Il banco all’apertura</h3><figure class="labfigure">${svg}<figcaption>${esc(caption)}</figcaption></figure><div class="meters">${values.map(([k, v]) => `<div class="meter"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
    }
    if (r.interpretation) html += `<h3>Confronto</h3><p>${esc(r.interpretation)}</p>`;
  }
  if (r.kind === 'question')
    html +=
      (r.hints || []).map((h) => '<p><strong>Suggerimento</strong> ' + esc(h) + '</p>').join('') +
      (r.error?.message ? '<p><strong>Feedback</strong> ' + esc(r.error.message) + '</p>' : '');
  return '<article class="reader preview"><div class="prose">' + html + '</div></article>';
}
function dataLists(rows) {
  const groups = {};
  for (const k of ['lesson', 'lab', 'example', 'question']) groups[k] = rows.filter((r) => r.kind === k);
  groups.recovery = [
    ...groups.lesson,
    ...groups.lab,
    ...groups.lab.map((r) => ({ id: 'lab:' + r.course, title: r.title })),
  ];
  return Object.entries(groups)
    .map(
      ([key, items]) =>
        `<datalist id="refs-${key}">${items.map((r) => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('')}</datalist>`,
    )
    .join('');
}
function getLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}
function findLocal(prefix) {
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .map((key) => ({ key, item: getLocal(key) }))
      .filter((x) => x.item?.record)
      .sort((a, b) => b.item.stamp - a.item.stamp);
  } catch {
    return [];
  }
}
function forgetLocal(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* The server draft remains available. */
  }
}
const tabKey = 'astra-editor-scheda';
let tabId;
try {
  tabId = sessionStorage.getItem(tabKey) || Math.random().toString(36).slice(2);
  sessionStorage.setItem(tabKey, tabId);
} catch {
  tabId = Math.random().toString(36).slice(2);
}
async function editPage(info, rows, newKind, template) {
  let base = info?.base || 0,
    rec = info ? clone(info.record) : blank(newKind, rows);
  if (template) rec = { ...clone(template), id: rec.id, order: rec.order, version: 1, title: template.title + ' · copia' };
  const original = clone(rec),
    roleId = state.user?.id,
    slot = info ? rec.id : 'new-' + newKind;
  const prefix = 'astra-autore|' + roleId + '|' + slot + '|',
    localKey = prefix + tabId;
  let recovered = null,
    dirty = false,
    previewOpen = false,
    undo = null,
    timer;
  const detailsOpen = new Set(['contenuti']);
  const courses = rows.filter((x) => x.kind === 'course'),
    lessons = rows.filter((x) => x.kind === 'lesson');
  function stash() {
    dirty = true;
    try {
      localStorage.setItem(localKey, JSON.stringify({ base, record: rec, stamp: Date.now() }));
      const s = select('#local-status');
      if (s) s.textContent = 'Copia locale aggiornata. Salva la bozza per ritrovarla su altri dispositivi.';
    } catch {
      const s = select('#local-status');
      if (s) s.textContent = 'Memoria locale non disponibile. Salva la bozza sul server.';
    }
    if (select('#review-publish')) select('#review-publish').disabled = true;
  }
  function redrawPreview() {
    const p = select('#edit-preview');
    if (!p) return;
    p.hidden = !previewOpen;
    if (previewOpen) {
      p.innerHTML =
        '<div class="kickerline"><h3>Anteprima dello studente</h3><button type="button" data-close-preview>Chiudi</button></div>' +
        preview(rec, rows);
      installaPassaggi(p.querySelector('.lettura-contenuto'), rec);
      if (rec.kind === 'method') installActivities(p, [rec]);
      typeset(p);
    }
  }
  function redraw(nextFocus) {
    for (const el of main.querySelectorAll('details[data-fold]'))
      el.open ? detailsOpen.add(el.dataset.fold) : detailsOpen.delete(el.dataset.fold);
    const k = rec.kind,
      isProblem = ['question', 'example'].includes(k),
      relatedCourses = courses.filter((r) => r.id !== rec.course);
    let recovery = '';
    const saves = findLocal(prefix).filter((x) => !dirty || x.key !== localKey);
    if (saves.length)
      recovery = `<details class="notice" ${dirty ? '' : 'open'}><summary>${saves.length === 1 ? 'Copia locale disponibile' : 'Copie locali disponibili'}</summary>
        <p>Puoi confrontare la copia del browser con la versione aperta.</p>${saves
          .map(
            (
              { key, item },
              i,
            ) => `<div class="editor-block"><strong>${esc(item.record.title || 'Senza titolo')}</strong> · ${esc(new Date(item.stamp).toLocaleString('it-IT'))} · base v${esc(item.base)}
        ${item.base !== base ? '<p>Nel frattempo il server ha una versione più recente. Riprendendo la copia, potrai conciliare le modifiche prima di salvare.</p>' : ''}
        <details><summary>Leggi la copia</summary>${preview(item.record, rows)}</details><div class="actions"><button type="button" data-resume="${esc(key)}">Riprendi questa copia</button>
        <button type="button" data-discard="${esc(key)}">Elimina questa copia</button></div></div>`,
          )
          .join('')}</details>`;
    const listSections = [
      ...new Set(
        rows
          .filter((r) => r.course === rec.course)
          .map((r) => (r.kind === 'section' ? r.title : r.section))
          .filter(Boolean),
      ),
    ].sort();
    const advanced = `<details data-fold="struttura" ${detailsOpen.has('struttura') ? 'open' : ''}><summary>Organizzazione e riutilizzo</summary>
        ${k !== 'course' ? simple('Sezione nel corso', 'section', rec.section, 'text', 'list="section-names"') : ''}
        <datalist id="section-names">${listSections.map((x) => `<option>${esc(x)}</option>`).join('')}</datalist>
        ${simple('Posizione nell’ordine di lettura', 'order', rec.order, 'number', 'step="any" data-format="number"')}
        ${
          k === 'course'
            ? multiple(
                'Corsi inclusi',
                'includes',
                rec.includes,
                courses.filter((r) => r.id !== rec.id),
              )
            : multiple('Riutilizza anche nel corso', 'reuse', rec.reuse, relatedCourses)
        }
        ${
          !['course', 'section'].includes(k)
            ? multiple(
                'Prerequisito',
                'prerequisites',
                rec.prerequisites,
                lessons.filter((r) => r.id !== rec.id),
              )
            : ''
        }
        ${k === 'lesson' ? area('Punti del programma coperti, uno per riga', 'coverage', rec.coverage, 3, 'lines') : ''}</details>`;
    const meta = `<section class="sheetpanel"><h3>Scheda del materiale</h3>
        ${simple('Titolo', 'title', rec.title, 'text', 'required autocomplete="off"')}
        <div class="two">${simple('Identificatore stabile', 'id', rec.id, 'text', info ? 'readonly' : 'required maxlength="96"')}
        ${k !== 'course' ? drop('Corso principale', 'course', rec.course, pairs(courses)) : ''}</div>
        ${isProblem || k === 'lab' ? simple('Competenza · scegli la lezione di riferimento', 'skill', rec.skill, 'text', 'list="refs-lesson"') : ''}
        ${
          isProblem
            ? '<div class="two">' +
              simple(
                'Famiglia del problema',
                'family',
                rec.family,
                'text',
                'placeholder="Ricavata dal titolo se lasciata vuota"',
              ) +
              drop('Difficoltà', 'difficulty', rec.difficulty, [
                [1, '1 · Base'],
                [2, '2 · Intermedia'],
                [3, '3 · Integrata'],
              ]) +
              '</div>'
            : ''
        }
        ${k === 'course' ? area('Descrizione per il catalogo', 'summary', rec.summary) : ''}${advanced}</section>`;
    const groups = k === 'method' ? methodEditor(rec) :
      (isProblem
        ? `<section class="sheetpanel"><h3>Consegna allo studente</h3>${area('Testo del problema', 'prompt', rec.prompt, 4)}</section>
        <details data-fold="consegna" ${detailsOpen.has('consegna') || rec.promptBlocks?.length ? 'open' : ''}><summary>Figure e formule prima della risposta</summary>${groupEditor('promptBlocks', rec, 'Blocchi della consegna', 'Questi elementi sono visibili prima di rispondere.')}</details>`
        : '') +
      groupEditor(
        'blocks',
        rec,
        isProblem ? 'Svolgimento' : k === 'lab' ? 'Modello e ipotesi' : 'Contenuto',
        isProblem ? 'Inserisci in ordine figure, spiegazioni e passaggi matematici.' : '',
      ) +
      (k === 'question' ? questionEditor(rec) : '') +
      (k === 'lab' ? labEditor(rec) : '');
    const history = info
      ? `<details data-fold="storia" ${detailsOpen.has('storia') ? 'open' : ''}><summary>Storico delle versioni (${info.history.length})</summary><div class="tablebox"><table><thead><tr><th>Versione</th><th>Data</th><th>Stato</th><th></th></tr></thead><tbody>${info.history.map((v) => `<tr><td>v${v.v}</td><td>${esc(date(v.stamp))}</td><td>${v.v === info.head.live ? 'Pubblicata' : v.v === info.head.draft ? 'Bozza' : 'Archiviata'}</td><td>${v.v !== base ? `<button type="button" data-restore="${v.v}">Ripristina in bozza</button>` : ''}</td></tr>`).join('')}</tbody></table></div></details>`
      : '';
    main.innerHTML =
      brandHeader(
        info ? 'Modifica materiale' : 'Nuovo materiale',
        kinds[k] + (info ? ' · ' + statusName(info.head) + ' · v' + base : ''),
      ) +
      authorNav('autore') +
      recovery +
      `<div id="author-edit"><div class="actions">${button('Salva bozza', 'save-draft', true)}${button('Anteprima', 'show-preview')}${info?.head.draft ? button('Rivedi e pubblica', 'review-publish') : ''}
            ${info?.head.live ? button('Ritira dal catalogo', 'review-withdraw') : ''}${link('Torna ai materiali', 'autore')}</div>
            <p id="local-status" class="helper" role="status">${dirty ? 'Modifiche presenti nella copia locale.' : info ? 'Versione corrente sul server.' : 'Le modifiche sono recuperabili in questo browser.'}</p><div id="edit-action"></div><section id="edit-preview" class="sheetpanel" hidden></section>
            <form id="record-form" novalidate>${meta}${groups}${k === 'method' && info ? link('Crea da questa attività', 'autore/nuovo/method/'+encodeURIComponent(rec.id)) : ''}<div class="actions"><button type="submit" class="solid">Salva bozza</button>
            ${button('Leggi anteprima', 'bottom-preview')}${undo ? button('Annulla ultima rimozione', 'undo-block') : ''}</div></form>${history}
            <p id="action-status" role="alert"></p></div>${dataLists(rows)}`;
    if (dirty && select('#review-publish')) select('#review-publish').disabled = true;
    redrawPreview();
    typeset(main);
    if (nextFocus) {
      const el = select(nextFocus);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'nearest' });
    }
  }
  function reveal() {
    previewOpen = true;
    redrawPreview();
    const p = select('#edit-preview');
    p.setAttribute('tabindex', '-1');
    p.focus({ preventScroll: true });
    p.scrollIntoView({ block: 'start' });
  }
  function writeInput(el) {
    const path = el.dataset.key;
    if (!path) return;
    const previous = readValue(rec, path),
      format = el.dataset.format;
    let value = el.value;
    if (format === 'lines') value = lineList(value);
    if (format === 'number' || path === 'difficulty') value = value === '' ? '' : Number(value);
    if (path === 'answer.type' && previous !== value) {
      rec.answer =
        value === 'numeric'
          ? { type: value, value: '', unit: '', tolerance: 0 }
          : value === 'text'
            ? { type: value, value: '', aliases: [] }
            : { type: value, value: '', options: [] };
      stash();
      redraw('[data-key="answer.type"]');
      return;
    }
    if (path === 'model' && previous !== value) {
      rec.model = value;
      rec.defaults = initial(value);
      stash();
      redraw('[data-key="model"]');
      return;
    }
    assignValue(rec, path, value);
    if (path === 'id' && ['course', 'lesson'].includes(rec.kind))
      rec[rec.kind === 'course' ? 'course' : 'skill'] = value;
    if (path === 'skill' && rec.kind === 'question' && (!rec.error.target || rec.error.target === previous)) {
      rec.error.target = value;
      const field = select('[data-key="error.target"]');
      if (field) field.value = value;
    }
    if (path === 'answer.options' && Array.isArray(value)) {
      const dropdown = select('[data-key="answer.value"]');
      if (!value.includes(rec.answer.value)) rec.answer.value = '';
      if (dropdown)
        dropdown.innerHTML = options(
          [['', 'Scegli la risposta corretta'], ...value.map((x) => [x, x])],
          rec.answer.value,
        );
    }
    stash();
    if (path === 'course' && el.tagName === 'SELECT') {
      redraw('[data-key="course"]');
      return;
    }
    if (previewOpen) {
      clearTimeout(timer);
      timer = setTimeout(redrawPreview, 160);
    }
  }
  async function save() {
    if (!rec.title.trim()) throw Error('Aggiungi un titolo prima di salvare la bozza.');
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,95}$/.test(rec.id))
      throw Error(
        'Usa un identificatore di 1–96 caratteri formato da lettere, numeri, punti, trattini o trattini bassi.',
      );
    if (!Number.isFinite(rec.order)) throw Error('Inserisci una posizione numerica.');
    if (['example', 'question'].includes(rec.kind) && !rec.family?.trim()) {
      rec.family =
        rec.title
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || rec.id;
    }
    if (rec.kind === 'section' && info && original.title !== rec.title) {
      const children = rows.filter(
        (r) => r.course === original.course && r.id !== rec.id && r.section === original.title,
      );
      if (children.length) {
        const kids = await many(children, (r) => api('/author/item/' + encodeURIComponent(r.id)));
        const pkg = {
          schema: 'astra/1',
          records: [
            { ...rec, baseVersion: base },
            ...kids.map((x) => ({ ...x.record, section: rec.title, baseVersion: x.base })),
          ],
        };
        const out = await api('/author/import', { package: pkg, commit: true });
        if (out.errors.length) throw Error(out.errors.join(' · '));
        forgetLocal(localKey);
        if (recovered) forgetLocal(recovered);
        lastFilter = { text: '', kind: '', course: rec.course, status: 'draft', page: 0 };
        toast(out.count + ' bozze salvate con la nuova sezione.');
        go('autore');
        return;
      }
    }
    const transient = JSON.stringify(rec);
    const result = await api('/author/save', { record: clone(rec), base });
    if (JSON.stringify(rec) !== transient) {
      base = result.v;
      stash();
      toast('Versione salvata. Le modifiche successive restano nella copia locale.');
      return;
    }
    forgetLocal(localKey);
    if (recovered) forgetLocal(recovered);
    dirty = false;
    toast('Bozza v' + result.v + ' salvata.');
    go(route(rec.id));
  }
  async function perform(buttonEl, fn) {
    if (buttonEl.disabled) return;
    buttonEl.disabled = true;
    const before = select('#action-status');
    if (before) before.textContent = '';
    try {
      await fn();
    } catch (e) {
      toast(e.message || String(e));
      const s = select('#action-status');
      if (s) {
        s.textContent = e.message || String(e);
        s.scrollIntoView({ block: 'nearest' });
      }
    } finally {
      if (buttonEl.isConnected) buttonEl.disabled = false;
    }
  }
  function actBox(title, body, action, text, callback) {
    const box = select('#edit-action');
    box.innerHTML = `<section class="sheetpanel"><h3>${esc(title)}</h3>${body}<div class="actions">${button(text, 'editor-confirm', true)}${button('Annulla', 'editor-cancel')}</div></section>`;
    select('#editor-cancel').onclick = () => {
      box.innerHTML = '';
    };
    select('#editor-confirm').onclick = (e) => perform(e.currentTarget, callback);
    box.scrollIntoView({ block: 'nearest' });
  }

  redraw();
  const root = main.querySelector('#author-edit')?.parentElement || main;
  const abort = new AbortController();
  window.addEventListener(
    'hashchange',
    () => {
      clearTimeout(timer);
      abort.abort();
    },
    { once: true },
  );
  const opt = { signal: abort.signal };
  root.addEventListener(
    'input',
    (e) => {
      if (!e.target.matches('[data-key]')) return;
      writeInput(e.target);
    },
    opt,
  );
  root.addEventListener(
    'submit',
    (e) => {
      if (e.target.id !== 'record-form') return;
      e.preventDefault();
      perform(e.submitter || select('#save-draft'), save);
    },
    opt,
  );
  root.addEventListener(
    'change',
    async (e) => {
      const input = e.target;
      if (!input.dataset.upload) return;
      const file = input.files[0];
      if (!file) return;
      const dst = readValue(rec, input.dataset.upload),
        was = dst;
      input.disabled = true;
      try {
        if (!file.size || file.size > 4 * 1024 * 1024) throw Error('Scegli un file fra 1 byte e 4 MiB.');
        const mime =
          file.type ||
          {
            svg: 'image/svg+xml',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            webp: 'image/webp',
            pdf: 'application/pdf',
          }[file.name.split('.').pop()?.toLowerCase()];
        if (dst.type === 'figure' && !String(mime).startsWith('image/'))
          throw Error('Per una figura scegli un’immagine. Un PDF può essere aggiunto come allegato.');
        const data = await new Promise((ok, no) => {
          const reader = new FileReader();
          reader.onload = () => ok(String(reader.result).split(',')[1]);
          reader.onerror = () => no(Error('File illeggibile.'));
          reader.readAsDataURL(file);
        });
        const upload = await api('/author/upload', { mime, name: file.name, data });
        if (abort.signal.aborted || readValue(rec, input.dataset.upload) !== was) return;
        dst.src = upload.src;
        if (!dst.text) dst.text = file.name;
        stash();
        redraw();
        toast('File collegato alla copia di lavoro.');
      } catch (err) {
        toast(err.message);
        select('#action-status').textContent = err.message;
      } finally {
        input.disabled = false;
      }
    },
    opt,
  );
  root.addEventListener(
    'click',
    (e) => {
      const b = e.target.closest('button');
      if (!b || b.type === 'submit' || b.disabled) return;
      if (b.id === 'save-draft') {
        perform(b, save);
        return;
      }
      if (b.id === 'show-preview' || b.id === 'bottom-preview') {
        reveal();
        return;
      }
      if (b.hasAttribute('data-close-preview')) {
        previewOpen = false;
        redrawPreview();
        select('#show-preview').focus();
        return;
      }
      if (b.dataset.snippet) {
        const field = select(`[data-key="${b.dataset.for}"]`);
        field.setRangeText(b.dataset.snippet, field.selectionStart, field.selectionEnd, 'end');
        field.focus();
        writeInput(field);
        return;
      }
      if (b.dataset.resume) {
        const stored = getLocal(b.dataset.resume);
        if (stored) {
          rec = clone(stored.record);
          recovered = b.dataset.resume;
          stash();
          redraw();
          toast('Copia locale riaperta.');
        }
        return;
      }
      if (b.dataset.discard) {
        const key = b.dataset.discard;
        actBox(
          'Elimina la copia locale',
          '<p>Questa copia del browser verrà rimossa. La versione salvata sul server resta disponibile.</p>',
          'discard',
          'Elimina copia',
          () => {
            forgetLocal(key);
            redraw();
          },
        );
        return;
      }
      if (b.dataset.addBlock) {
        const name = b.dataset.addBlock,
          type = select(`[data-type-for="${name}"]`).value;
        const arr = (rec[name] ??= []);
        arr.push({
          type,
          text: '',
          ...(['figure', 'attachment'].includes(type)
            ? { src: '' }
            : ['lab', 'example', 'question'].includes(type)
              ? { ref: '' }
              : {}),
        });
        stash();
        redraw(
          `[data-block="${name}.${arr.length - 1}"] textarea, [data-block="${name}.${arr.length - 1}"] input`,
        );
        return;
      }
      if (b.dataset.op) {
        const [name, ix] = b.dataset.path.split('.'),
          i = Number(ix),
          arr = rec[name];
        if (b.dataset.op === 'remove') {
          undo = { name, i, block: arr.splice(i, 1)[0] };
          stash();
          redraw(`[data-add-block="${name}"]`);
          return;
        }
        const j = i + (b.dataset.op === 'up' ? -1 : 1);
        if (j < 0 || j >= arr.length) {
          toast(j < 0 ? 'Il blocco è già il primo.' : 'Il blocco è già l’ultimo.');
          return;
        }
        [arr[i], arr[j]] = [arr[j], arr[i]];
        stash();
        redraw(`[data-path="${name}.${j}"][data-op="${b.dataset.op}"]`);
        return;
      }
      if (b.id === 'undo-block' && undo) {
        rec[undo.name].splice(undo.i, 0, undo.block);
        undo = null;
        stash();
        redraw();
        return;
      }
      if (b.dataset.addTo || b.dataset.removeFrom) {
        const k = b.dataset.addTo || b.dataset.removeFrom;
        if (b.dataset.addTo) {
          const value = select(`[data-pick-for="${k}"]`).value;
          if (!value) return;
          rec[k] = [...new Set([...(rec[k] || []), value])];
        } else rec[k] = (rec[k] || []).filter((x) => x !== b.dataset.id);
        stash();
        redraw(`[data-pick-for="${k}"]`);
        return;
      }
      if (b.id === 'review-publish' && info?.head.draft && !dirty) {
        perform(b, async () => {
          validatePreview(rec);
          const live = await api('/author/item/' + encodeURIComponent(rec.id));
          if (live.base !== base)
            throw Error('Una versione più recente è disponibile. Riapri la scheda prima di pubblicare.');
          const msg =
            `<p>«${esc(rec.title)}» · v${live.head.draft}. Questa versione sarà visibile in ${esc(live.used.join(', '))}.</p>` +
            preview(rec, rows);
          actBox('Pubblica la bozza', msg, 'publish', 'Pubblica v' + live.head.draft, async () => {
            if (dirty) throw Error('La copia locale è cambiata. Salva e rileggi la nuova bozza.');
            await api('/author/publish', { targets: { [rec.id]: live.head.draft } });
            await refresh();
            toast('Versione pubblicata.');
            go(route(rec.id));
          });
          typeset(select('#edit-action'));
        });
        return;
      }
      if (b.id === 'review-withdraw' && info?.head.live) {
        actBox(
          'Ritira il materiale',
          `<p>La versione v${info.head.live} di «${esc(rec.title)}» uscirà dal catalogo degli studenti. Percorsi interessati: ${esc(info.used.join(', '))}.</p>`,
          'withdraw',
          'Conferma il ritiro',
          async () => {
            await api('/author/withdraw', { id: rec.id, live: info.head.live });
            await refresh();
            toast('Versione ritirata dal catalogo.');
            go(route(rec.id));
          },
        );
        return;
      }
      if (b.dataset.restore) {
        const v = Number(b.dataset.restore);
        actBox(
          'Ripristina la versione ' + v,
          `<p>Una nuova bozza riprenderà i contenuti di v${v}. Potrai controllarla prima della pubblicazione.</p>`,
          'restore',
          'Crea bozza da v' + v,
          async () => {
            await api('/author/restore', { id: rec.id, v, base });
            toast('Versione ripristinata in una nuova bozza.');
            go(route(rec.id));
          },
        );
      }
    },
    opt,
  );
}
export async function authorPage(parts = []) {
  if (state.user?.role !== 'autore') {
    const error = Error(
      'Questa area richiede l’accesso autore. Dal computer del servizio apri il collegamento personale per la redazione.',
    );
    error.status = 403;
    throw error;
  }
  const [page, id] = parts;
  if (page === 'lotti') {
    exchangePage();
    return;
  }
  const rows = (await api('/author/list')).sort(titleOrder);
  if (page === 'nuovo' && !id) {
    newPage();
    return;
  }
  if (page === 'nuovo' && id === 'method') {
    const source = rows.find(r => r.kind === 'method' && r.id === parts[2]);
    if (!source) throw Error('Apri una scheda di metodo esistente e scegli «Crea da questa attività».');
    const template = (await api('/author/item/' + encodeURIComponent(source.id))).record;
    await editPage(null, rows, id, template);
    return;
  }
  if (page === 'nuovo' && kindOrder.includes(id)) {
    await editPage(null, rows, id);
    return;
  }
  if (page === 'modifica' && id) {
    await editPage(await api('/author/item/' + encodeURIComponent(id)), rows);
    return;
  }
  if (page === 'ordine') {
    await sortPage(rows);
    return;
  }
  listPage(rows);
}
