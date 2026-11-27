import { api, esc, main, state, head, crumb, link, go } from '/js/ui.js';
import { caseRoute, decodeCase, caseFromState } from './risorse-stato.js';

const endpoint = '/v1/resource-cases';
const href = route => '#' + route;
const alive = route => location.hash === route;
const requestId = () => globalThis.crypto?.randomUUID?.() || 'rc' + Date.now().toString(36) + Math.random().toString(36).slice(2);
const scopeHeaders = scope => scope ? { 'X-Officina-Session': scope } : {};
const notice = message => `<p class="notice" role="status">${esc(message)}</p>`;
const loginLink = next => link('Accedi al tuo quaderno', 'accedi/entra/' + next, true);
const shell = (title, description) => crumb([['Inizio', 'home'], ['Risorse', 'risorse'], [title]]) + head(title, description);

function unavailable(message) {
  main.innerHTML = shell('Caso non disponibile', message) +
    '<p>La risorsa o la sua versione non sono più disponibili con questo accesso. I valori del caso originale restano conservati.</p>' +
    link('Scegli una risorsa', 'risorse');
}

async function directory() {
  main.innerHTML = shell('Risorse per capire e spiegare',
    'Apri uno strumento e usalo nelle tue spiegazioni, oppure esplora un fenomeno durante lo studio.') +
    `<section class="resource-feature" aria-labelledby="resource-feature-title"><div><div class="meta">Fluidi · un caso da riusare</div>
      <h2 id="resource-feature-title">Un tubo, una domanda.</h2><p>Come cambia la portata se aumenta il raggio? Regola il banco di Poiseuille, salva le condizioni e ritrova lo stesso caso nella tua lezione.</p>
      <div class="actions">${link('Apri lo strumento', 'strumento/LAB3D-04', true)}${link('Le mie raccolte', 'raccolte')}</div></div>
      <img src="/identita/cric-al-banco.svg" width="180" height="152" alt="" /></section>
    <section class="resource-index" aria-labelledby="resource-index-title"><h2 id="resource-index-title">Gli strumenti</h2>
      <label class="resource-search">Cerca uno strumento<input type="search" data-resource-search placeholder="Argomento o nome" autocomplete="off"></label>
      <p class="helper">L’uso libero apre subito i comandi. Puoi sempre passare all’attività guidata e alla lezione associata.</p>
      <div data-resource-list class="rows"></div><p data-resource-count role="status"></p></section>
    <div class="resource-footer-links">${link('Tutte le simulazioni di lezione', 'laboratori')}${link('Percorsi e microcorsi', 'discipline')}</div>`;
  const render = query => {
    const matches = (state.benches || []).filter(b =>
      `${b.title} ${b.summary} ${b.course}`.toLocaleLowerCase('it').includes(query.toLocaleLowerCase('it')));
    main.querySelector('[data-resource-list]').innerHTML = matches.map(b =>
      `<a class="catalog-row" href="#strumento/${esc(b.id)}"><span class="code">${esc(b.course)}</span><strong>${esc(b.title)}</strong>
       <span class="summary">${esc(b.summary)}${b.id === 'LAB3D-04' ? ' · Casi salvabili e condivisibili' : ''}</span><span class="arrow" aria-hidden="true">→</span></a>`).join('');
    main.querySelector('[data-resource-count]').textContent = matches.length + (matches.length === 1 ? ' strumento' : ' strumenti');
  };
  render('');
  main.querySelector('[data-resource-search]').oninput = event => render(event.target.value);
}

function revealLink(container, url, message) {
  container.hidden = false;
  container.innerHTML = `<label>Collegamento al caso<input readonly value="${esc(url)}"></label><p role="status">${esc(message)}</p>`;
  const input = container.querySelector('input');
  input.focus();
  input.select();
}

async function tool(id, token, saved, origin) {
  const route = location.hash;
  const scope = state.draftSession;
  const item = await api('/item/' + encodeURIComponent(id));
  if (!alive(route)) return;
  if (item.kind !== 'bench') throw Error('Scegli uno strumento dal catalogo delle risorse.');
  let spec = null;
  try { spec = await api(endpoint + '/spec/' + encodeURIComponent(id)); }
  catch (error) { if (error.status !== 404) throw error; }
  if (!alive(route)) return;
  let initial = saved?.case || (token ? decodeCase(token) : null);
  if (initial && initial.resource.id !== id) throw Error('Il caso appartiene a un altro strumento.');
  if (initial) {
    const checked = await api(endpoint + '/validate', { case: initial });
    if (!alive(route)) return;
    initial = checked.case;
  }
  let handle;
  const { benchPage } = await import('./risorse-banco.js');
  if (!alive(route)) return;
  const dispose = await benchPage(id, undefined, undefined, {
    explore: true, initialCase: initial, onReady: value => { handle = value; },
  });
  if (!alive(route) || !handle) { dispose?.(); return; }
  const room = main.querySelector('.bench-room');
  main.querySelector('.crumb').innerHTML = '<a href="#risorse">Risorse</a><span aria-hidden="true">›</span><span>Uso libero</span>';
  room.querySelector('.bench-head .meta').textContent = item.course + ' · Uso libero';
  const toolbar = document.createElement('section');
  toolbar.className = 'resource-toolbar';
  toolbar.setAttribute('aria-label', 'Usa e conserva questo caso');
  toolbar.innerHTML = `${saved ? `<p class="resource-saved-title"><strong>${esc(saved.title)}</strong>${saved.note ? ' · ' + esc(saved.note) : ''}</p>` : ''}
    <p>Modifica i parametri mentre spieghi o studi. L’esplorazione e le verifiche del banco non attestano una competenza autonoma.</p>
    <div class="actions">${spec ? '<button type="button" data-case-link>Collegamento a questo caso</button>' : ''}
      ${link('Attività guidata', 'banco/' + id)}${link('Lezione associata', 'materiale/' + item.skill + '/' + item.course)}
    </div><div class="resource-link-result" data-case-link-result hidden></div>
    ${spec ? state.user ? `<details class="resource-save"><summary>Salva nel quaderno e riusa in una raccolta</summary>
      <form data-save-case><label>Nome del caso<input name="title" required maxlength="120" value="${esc(saved?.title || item.title)}"></label>
      <label>Nota per ritrovarlo (facoltativa)<textarea name="note" rows="2" maxlength="2000">${esc(saved?.note || '')}</textarea></label>
      <button class="solid">Salva questo caso</button><p data-save-status role="status"></p></form></details>` :
      `<p>Per conservare casi e raccolte nel tuo quaderno, ${loginLink('strumento/' + id)}. Puoi usare subito il collegamento al caso.</p>` :
      '<p class="helper">Questo strumento è disponibile per l’uso libero. Il salvataggio di casi è attivo, per ora, sul banco di Poiseuille.</p>'}`;
  room.querySelector('.bench-head').after(toolbar);
  const back = typeof origin === 'string' && /^(?:raccolta\/rcol-[a-f0-9]{32}|condivisione\/[A-Za-z0-9_-]{20,100})$/.test(origin) ? origin : null;
  room.querySelector('footer').innerHTML = (back ? link('Torna alla raccolta', back) : link('Torna alle risorse', 'risorse')) +
    link('Percorso di studio', 'corso/' + item.course) + link('Le mie raccolte', 'raccolte');
  const snapshot = () => caseFromState(spec, handle.getState());
  const signIn = toolbar.querySelector('a[href^="#accedi/"]');
  if (signIn && spec) signIn.onclick = event => {
    event.preventDefault();
    const target = caseRoute(snapshot()) + (back ? '/' + encodeURIComponent(back) : '');
    go('accedi/entra/' + target);
  };
  const linkButton = toolbar.querySelector('[data-case-link]');
  if (linkButton) linkButton.onclick = async () => {
    linkButton.disabled = true;
    try {
      const checked = await api(endpoint + '/validate', { case: snapshot() });
      if (!alive(route)) return;
      const url = location.origin + location.pathname + href(caseRoute(checked.case));
      revealLink(toolbar.querySelector('[data-case-link-result]'), url,
        'Copia questo indirizzo nelle tue slide o nei materiali. Contiene solo le condizioni del modello; l’accesso alla risorsa viene verificato a ogni apertura.');
    } catch (error) {
      if (alive(route)) {
        const output = toolbar.querySelector('[data-case-link-result]');
        output.hidden = false;
        output.innerHTML = notice(error.message);
      }
    } finally { linkButton.disabled = false; }
  };
  const form = toolbar.querySelector('[data-save-case]');
  let retry;
  if (form) form.onsubmit = async event => {
    event.preventDefault();
    const submit = form.querySelector('button');
    submit.disabled = true;
    const payload = { title: form.elements.title.value.trim(), note: form.elements.note.value.trim(), case: snapshot() };
    const fingerprint = JSON.stringify(payload);
    if (retry?.fingerprint !== fingerprint) retry = { fingerprint, id: requestId() };
    try {
      const result = await api(endpoint + '/cases', { ...payload, requestId: retry.id }, scopeHeaders(scope));
      if (!alive(route)) return;
      form.querySelector('[data-save-status]').innerHTML = 'Caso salvato. ' +
        `<a href="#caso/${esc(result.id)}">Riapri il caso</a> · <a href="#raccolte">Aggiungi a una raccolta</a>`;
    } catch (error) {
      if (alive(route)) form.querySelector('[data-save-status]').textContent = error.message;
    } finally { submit.disabled = false; }
  };
  return dispose;
}

function savedCaseList(cases) {
  return cases.length ? `<ul class="resource-saved-list">${cases.map(item =>
    `<li><div><a href="#caso/${esc(item.id)}">${esc(item.title)}</a>${item.note ? '<p>' + esc(item.note) + '</p>' : ''}
      ${item.available === false ? '<p class="helper">' + esc(item.reason || 'Risorsa non disponibile.') + '</p>' : ''}</div></li>`).join('')}</ul>` :
    '<p>Salva le condizioni di uno strumento per ritrovarle qui.</p>';
}

async function collections() {
  const route = location.hash;
  const scope = state.draftSession;
  if (!state.user) {
    main.innerHTML = shell('Le mie raccolte', 'Raggruppa casi da richiamare nelle spiegazioni e nello studio.') +
      '<p>Il quaderno conserva le raccolte sul tuo account. Aprire e usare gli strumenti resta possibile senza accesso.</p>' +
      loginLink('raccolte') + link('Esplora gli strumenti', 'risorse');
    return;
  }
  const notebook = await api(endpoint + '/me');
  if (!alive(route)) return;
  main.innerHTML = shell('Le mie raccolte',
    'Prepara una selezione di casi per un microcorso o una spiegazione. Lo studente può riaprire gli stessi casi e proseguire nella lezione.') +
    `<section aria-labelledby="collections-title"><h2 id="collections-title">Raccolte</h2>
      ${notebook.totalCollections > notebook.collections.length ? '<p class="helper">Le ' + notebook.collections.length + ' raccolte più recenti su ' + notebook.totalCollections + '. Le altre restano raggiungibili dal loro collegamento.</p>' : ''}
      ${notebook.collections.length ? `<ul class="resource-saved-list">${notebook.collections.map(c =>
        `<li><div><a href="#raccolta/${esc(c.id)}">${esc(c.title)}</a><p>${esc(c.note || '')}</p></div><span>${c.shared ? 'Collegamento attivo' : 'Privata'}</span></li>`).join('')}</ul>` :
        '<p>Una raccolta è una selezione di risorse: puoi usarla con le tue slide, durante una spiegazione o nei materiali di studio.</p>'}
      <details class="resource-save" ${notebook.collections.length ? '' : 'open'}><summary>Nuova raccolta</summary>
      <form data-new-collection><label>Nome della raccolta<input name="title" required maxlength="120" placeholder="Es. Raggio, portata e resistenza"></label>
      <label>Obiettivo o istruzione (facoltativi)<textarea name="note" maxlength="2000" rows="2" placeholder="Che cosa osservare e perché"></textarea></label>
      <button class="solid">Crea raccolta</button><p role="status"></p></form></details></section>
    <section class="resource-case-shelf" aria-labelledby="saved-cases-title"><h2 id="saved-cases-title">Casi salvati</h2>
      ${notebook.totalCases > notebook.cases.length ? '<p class="helper">I ' + notebook.cases.length + ' casi più recenti su ' + notebook.totalCases + '. I precedenti restano nelle raccolte e nei collegamenti salvati.</p>' : ''}${savedCaseList(notebook.cases)}</section>
    ${link('Apri uno strumento', 'risorse')}`;
  const form = main.querySelector('[data-new-collection]');
  let retry;
  form.onsubmit = async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    const payload = { title: form.elements.title.value.trim(), note: form.elements.note.value.trim(), caseIds: [] };
    const fingerprint = JSON.stringify(payload);
    if (retry?.fingerprint !== fingerprint) retry = { fingerprint, id: requestId() };
    try {
      const result = await api(endpoint + '/collections', { ...payload, requestId: retry.id }, scopeHeaders(scope));
      if (alive(route)) go('raccolta/' + result.id);
    } catch (error) { if (alive(route)) form.querySelector('[role=status]').textContent = error.message; }
    finally { button.disabled = false; }
  };
}

function collectionCases(cases, shared = false) {
  if (!cases.length) return '<p>La raccolta non contiene ancora casi.</p>';
  return `<ol class="resource-collection-cases">${cases.map(item =>
    `<li><h2>${esc(item.title)}</h2>${item.note ? '<p>' + esc(item.note) + '</p>' : ''}
      ${item.available === false || !item.case ? notice(item.reason || 'Risorsa non disponibile con questo accesso.') :
        `<div class="actions">${link('Apri questo caso', caseRoute(item.case) + '/' + encodeURIComponent(location.hash.slice(1)), true)}${link('Lezione collegata', 'materiale/' + item.resource.skill + '/' + item.resource.course)}
        ${link('Continua nel percorso', 'corso/' + item.resource.course)}</div>`}</li>`).join('')}</ol>`;
}

async function collection(id, shared = false) {
  const route = location.hash;
  const scope = state.draftSession;
  const data = await api(endpoint + (shared ? '/shared/' : '/collections/') + encodeURIComponent(id));
  if (!alive(route)) return;
  let current = data;
  main.innerHTML = shell(data.title, data.note || (shared ? 'Una selezione di casi da esplorare e ritrovare durante lo studio.' : 'Organizza le risorse che vuoi richiamare nelle tue spiegazioni.')) +
    `<div data-collection-content>${collectionCases(data.cases, shared)}</div>` +
    (shared ? `<p class="helper">Esplorare un caso non registra una competenza. Per esercitarti e ritrovare le tue prove, prosegui nel percorso di studio.</p>${link('Il mio studio', 'studio')}` :
      '<section class="resource-collection-editor" data-collection-editor></section>');
  if (shared) return;
  const notebook = await api(endpoint + '/me');
  if (!alive(route)) return;
  let order = data.cases.map(c => c.id);
  const byId = new Map([...data.cases, ...notebook.cases].map(c => [c.id, c]));
  const editor = main.querySelector('[data-collection-editor]');
  editor.innerHTML = `<details class="resource-save" open><summary>Modifica la raccolta</summary>
    <form data-collection-edit><label>Nome della raccolta<input name="title" required maxlength="120" value="${esc(data.title)}"></label>
    <label>Obiettivo o istruzione<textarea name="note" maxlength="2000" rows="2">${esc(data.note || '')}</textarea></label>
    <h3>Ordine dei casi</h3><ol data-collection-order class="resource-order"></ol>
    <div class="resource-add"><div class="resource-case-picker"><label for="resource-add-case">Aggiungi un caso salvato</label><select id="resource-add-case" data-add-case><option value="">Scegli un caso</option>${notebook.cases.map(c =>
      `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('')}</select></div><button type="button" data-add-button>Aggiungi</button></div>
    <button class="solid">Salva raccolta</button><p data-edit-status role="status"></p></form></details>
    <section class="resource-sharing" aria-labelledby="share-collection-title"><h2 id="share-collection-title">Collegamento per gli studenti</h2>
    <p>Attivandolo, chi riceve il collegamento può leggere il titolo e le istruzioni della raccolta, i nomi dei casi e le condizioni del modello. Le note personali dei casi restano nel tuo quaderno. L’accesso ai materiali segue i permessi della risorsa.</p>
    <button type="button" data-share-collection></button><div data-collection-link></div><p data-share-status role="status"></p></section>`;
  const orderNode = editor.querySelector('[data-collection-order]');
  const renderOrder = focusIndex => {
    orderNode.innerHTML = order.map((caseId, i) => `<li><span>${esc(byId.get(caseId)?.title || caseId)}</span><div>
      <button type="button" data-move="${i}" data-direction="-1" ${i ? '' : 'disabled'} aria-label="Sposta prima ${esc(byId.get(caseId)?.title || 'il caso')}">↑</button>
      <button type="button" data-move="${i}" data-direction="1" ${i < order.length - 1 ? '' : 'disabled'} aria-label="Sposta dopo ${esc(byId.get(caseId)?.title || 'il caso')}">↓</button>
      <button type="button" data-remove="${i}" aria-label="Rimuovi ${esc(byId.get(caseId)?.title || 'il caso')}">Rimuovi</button></div></li>`).join('');
    if (focusIndex !== undefined) orderNode.children[focusIndex]?.querySelector('[data-remove]')?.focus();
  };
  renderOrder();
  orderNode.onclick = event => {
    const move = event.target.closest('[data-move]'), remove = event.target.closest('[data-remove]');
    if (move) {
      const from = Number(move.dataset.move), to = from + Number(move.dataset.direction);
      [order[from], order[to]] = [order[to], order[from]];
      renderOrder(to);
    } else if (remove) {
      const index = Number(remove.dataset.remove);
      order.splice(index, 1); renderOrder(Math.min(index, order.length - 1));
      if (!order.length) editor.querySelector('[data-add-case]').focus();
    }
  };
  editor.querySelector('[data-add-button]').onclick = () => {
    const selection = editor.querySelector('[data-add-case]');
    const status = editor.querySelector('[data-edit-status]');
    if (!selection.value) { status.textContent = 'Scegli prima un caso salvato.'; return; }
    if (order.includes(selection.value)) { status.textContent = 'Il caso è già nella raccolta.'; return; }
    if (order.length >= 24) { status.textContent = 'Una raccolta contiene al massimo 24 casi.'; return; }
    order.push(selection.value); renderOrder(order.length - 1);
    status.textContent = 'Caso aggiunto. Salva la raccolta per conservarlo.';
  };
  const updateSharing = () => {
    editor.querySelector('[data-share-collection]').textContent = current.shared ? 'Disattiva collegamento' : 'Attiva collegamento alla raccolta';
    const url = current.shareToken ? location.origin + location.pathname + '#condivisione/' + current.shareToken : '';
    editor.querySelector('[data-collection-link]').innerHTML = current.shared && url ?
      `<label>Collegamento alla raccolta<input readonly value="${esc(url)}"></label><a href="#condivisione/${esc(current.shareToken)}">Apri la raccolta condivisa</a>` :
      '<p class="helper">La raccolta è privata.</p>';
  };
  updateSharing();
  const form = editor.querySelector('[data-collection-edit]');
  form.onsubmit = async event => {
    event.preventDefault();
    const submit = form.querySelector('button[type=submit]') || form.querySelector('button.solid');
    submit.disabled = true;
    try {
      const result = await api(endpoint + '/collections/' + id, {
        revision: current.revision, title: form.elements.title.value.trim(), note: form.elements.note.value.trim(), caseIds: [...order],
      }, scopeHeaders(scope));
      if (!alive(route)) return;
      current = result;
      main.querySelector('[data-collection-content]').innerHTML = collectionCases(result.cases);
      main.querySelector('.pagehead h1').textContent = result.title;
      const description = main.querySelector('.pagehead p');
      if (description) description.textContent = result.note || 'Organizza le risorse che vuoi richiamare nelle tue spiegazioni.';
      form.querySelector('[data-edit-status]').textContent = 'Raccolta salvata.';
      updateSharing();
    } catch (error) { if (alive(route)) form.querySelector('[data-edit-status]').textContent = error.message; }
    finally { submit.disabled = false; }
  };
  editor.querySelector('[data-share-collection]').onclick = async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const result = await api(endpoint + '/collections/' + id + '/share', { revision: current.revision, shared: !current.shared }, scopeHeaders(scope));
      if (!alive(route)) return;
      current = result; updateSharing();
      editor.querySelector('[data-share-status]').textContent = current.shared ?
        'Collegamento attivato. Puoi copiarlo nei materiali del microcorso.' : 'Collegamento disattivato. Il vecchio indirizzo non apre più la raccolta.';
    } catch (error) { if (alive(route)) editor.querySelector('[data-share-status]').textContent = error.message; }
    finally { button.disabled = false; }
  };
}

export async function resourcePage(page, id, token, origin) {
  if (page === 'risorse') return directory();
  if (page === 'strumento') return tool(id, token, null, origin);
  if (page === 'raccolte') return collections();
  if (page === 'raccolta') return collection(id);
  if (page === 'condivisione') return collection(id, true);
  if (page === 'caso') {
    const route = location.hash;
    const saved = await api(endpoint + '/cases/' + encodeURIComponent(id));
    if (!alive(route)) return;
    if (saved.available === false || !saved.case) return unavailable(saved.reason || 'La versione del caso non è disponibile.');
    return tool(saved.case.resource.id, null, saved);
  }
}
