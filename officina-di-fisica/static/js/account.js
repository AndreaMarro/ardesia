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
  toast,
  on,
  listLine,
  gate,
  demo,
  modeNames,
  date,
  euro,
  startRun,
} from './ui.js';
const studioCrumb = () => crumb([['Inizio', 'home'], ['Il mio studio']]);
export async function login(parts = []) {
  const register = parts[0] === 'nuovo',
    next = parts.slice(1).join('/') || 'studio';
  main.innerHTML =
    studioCrumb() +
    `<section class="authbox">${head(register ? 'Apri il tuo quaderno' : 'Il mio studio', register ? 'Salva letture, risposte e ordini nel tuo account.' : 'Riprendi le letture e ritrova gli esercizi da consolidare.')}<form class="form" id="auth"><label>Email<input name="email" type="email" autocomplete="email" maxlength="254" required></label><label>Password<input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" ${register ? 'minlength="10"' : ''} maxlength="512" required></label>${register ? '<p class="helper">Usa almeno 10 caratteri.</p>' : ''}<div class="actions"><button class="solid">${register ? 'Crea account' : 'Accedi'}</button>${link(register ? 'Ho già un account' : 'Crea un account', 'accedi/' + (register ? 'entra' : 'nuovo') + '/' + next)}</div><p role="status" id="action-status"></p></form>${state.mode === 'verifica' ? `<div class="sheetpanel intro-card"><h3>Quaderno di prova</h3><p>Esplora tutti i corsi con un profilo di lettura personale a questo browser. Per provare un ordine o ritrovarti su un altro dispositivo usa un account con password.</p><div class="actions">${button('Apri un quaderno di prova', 'demo')}</div></div>` : ''}</section>`;
  on('#auth', 'submit', async (e, el) => {
    await api(register ? '/register' : '/login', Object.fromEntries(new FormData(el)));
    await refresh();
    go(next);
  });
  demo(next);
}
export async function study() {
  await refresh();
  if (!state.user) return login();
  const s = await api('/studio'),
    owned = state.courses.filter((c) => c.owned);
  const ids = new Set([...s.reads.map((r) => r.id), ...Object.keys(s.skills)]);
  const all = await Promise.all(owned.filter((c) => !c.includes?.length).map((c) => api('/course/' + c.id)));
  const complete = owned.find((c) => c.id === 'C6');
  if (complete) all.push(await api('/course/C6'));
  const index = new Map();
  for (const c of all) for (const r of c.items) if (ids.has(r.id)) index.set(r.id, r);
  const skills = Object.entries(s.skills).sort((a, b) => a[1].due - b[1].due);
  const due = skills.filter((x) => x[1].due * 1000 <= Date.now());
  const recent = s.lastRuns.filter((r) => !r.finished);
  main.innerHTML =
    studioCrumb() +
    head('Il mio studio', state.user.email) +
    `<div class="actions">${state.user.role === 'autore' ? link('Banco autore', 'autore', true) : ''}${button('Aggiorna il quaderno', 'update-studio')}${button('Esci', 'logout')}</div><div class="split"><div><h2>Il tuo quaderno</h2>${s.recommendations.length ? `<section class="sheetpanel"><h3>Da dove riprendere</h3>${s.recommendations.map((r, i) => `<div class="order"><b>${esc(r.title)}</b><p>${esc(r.reason)}</p><div class="actions">${r.target ? link(r.targetKind === 'lab' ? 'Osserva il laboratorio' : 'Rivedi la spiegazione', (r.targetKind === 'lab' ? 'lab/' : 'materiale/') + r.target) : ''}${button('Prova una nuova situazione', 'advice-' + i)}</div></div>`).join('')}</section>` : ''}${
      recent.length
        ? `<section class="sheetpanel"><h3>Attività da riprendere</h3>${recent
            .slice(0, 5)
            .map((r) => listLine(modeNames[r.mode], 'prova/' + r.id, r.course + ' · ' + date(r.start)))
            .join('')}</section>`
        : ''
    }<section class="sheetpanel"><h3>Letture segnate <small>${s.reads.length}</small></h3>${
      s.reads.length
        ? s.reads
            .slice(0, 8)
            .map((r) =>
              listLine(
                index.get(r.id)?.title || r.id,
                'materiale/' + r.id,
                'v' + r.v + ' · ' + date(r.stamp),
              ),
            )
            .join('')
        : '<p>Puoi segnare una lezione come letta alla fine della pagina.</p>'
    }</section><section class="sheetpanel"><h3>Risultati osservati</h3>${skills.length ? `<div class="tablebox"><table><thead><tr><th>Competenza</th><th>Evidenze recenti</th><th>Ritorna il</th></tr></thead><tbody>${skills.map(([id, h]) => `<tr><td><a href="#materiale/${esc(id)}">${esc(index.get(id)?.title || id)}</a></td><td>${esc(h.state)}<br><small>${h.good} corrette su ${h.families} famiglie autonome · ${h.aided} assistite</small></td><td>${date(h.due)}</td></tr>`).join('')}</tbody></table></div>` : '<p>Rispondi a un esercizio per iniziare a raccogliere evidenze.</p>'}${due.length ? button('Ripassa le competenze in scadenza', 'due', true) : ''}<p class="helper">Le ultime cinque famiglie con risposta autonoma alimentano il giudizio. Una sola risposta apre una prima evidenza. Letture e osservazioni di laboratorio sono conteggiate separatamente.</p></section><p class="small">Osservazioni di laboratorio salvate · ${s.labCount}</p>${s.notes?.length ? `<details><summary>Rileggi le tue osservazioni</summary>${s.notes.map((n) => `<article class="order"><b>${esc(n.lab)} · ${date(n.stamp)}</b><p>Previsione · ${esc(n.prediction)}</p><p>Osservazione · ${esc(n.note)}</p></article>`).join('')}</details>` : ''}</div><div><h2>Percorsi accessibili</h2>${owned.length ? owned.map((c) => listLine(c.title, 'corso/' + c.id, c.id)).join('') : `<p class="notice">Scegli un percorso. L’accesso digitale si attiva dopo la conferma del bonifico.</p>${link('Sfoglia i percorsi', 'percorsi')}`}<h3 style="margin-top:1.5rem">Ordini</h3>${s.orders.length ? s.orders.map(orderView).join('') : '<p class="small">Il registro ordini è vuoto.</p>'}</div></div>${
      s.lastRuns.some((r) => r.finished)
        ? `<section class="sheetpanel"><h3>Attività consegnate</h3>${s.lastRuns
            .filter((r) => r.finished)
            .map((r) => listLine(modeNames[r.mode], 'prova/' + r.id, r.course + ' · ' + date(r.start)))
            .join('')}</section>`
        : ''
    }`;
  on('#update-studio', 'click', () => go('studio'));
  if (s.orders.some((o) => o.state === 'in attesa'))
    setTimeout(() => {
      if (location.hash === '#studio' && document.visibilityState === 'visible') go('studio');
    }, 15000);
  on('#logout', 'click', async () => {
    await api('/logout', {});
    await refresh();
    go('home');
  });
  s.recommendations.forEach((r, i) =>
    on('#advice-' + i, 'click', () =>
      startRun({ course: r.course, skill: r.skill, exclude: r.exclude, mode: 'retest' }),
    ),
  );
  on('#due', 'click', () => {
    const [key] = due[0],
      course = index.get(key)?.course || 'C6';
    return startRun({ course, mode: 'review', skill: key });
  });
  for (const el of $$('[data-cancel]'))
    on('#' + el.id, 'click', async () => {
      if (confirm('Annullare questo ordine in attesa?')) {
        await api('/order/' + el.dataset.cancel, { action: 'cancel' });
        go('studio');
      }
    });
}
function orderView(o) {
  const s = o.snapshot;
  return `<article class="order"><div class="kickerline"><b>${esc(s.courseTitle)}</b><span class="stamp">${esc(o.state)}</span></div><p>${esc(s.label)} · ${euro(o.cents)} · ${esc(o.mode)}</p><p class="small">Ordine ${esc(o.id)} · ${date(o.stamp)}</p>${o.mode === 'reale' && o.state === 'in attesa' ? `<p>Intestatario · ${esc(s.holder)}<br>IBAN · ${esc(s.iban)}<br>Causale · ${esc(s.reference)}</p>` : ''}${o.mode === 'verifica' ? '<p class="helper">Importo fittizio. Nessun bonifico da effettuare.</p>' : ''}${o.state === 'in attesa' ? `<button class="textbtn" id="cancel-${esc(o.id)}" data-cancel="${esc(o.id)}">Annulla ordine</button>` : ''}</article>`;
}
export async function checkout(id) {
  const data = await api('/course/' + id),
    c = data.course;
  const mock = state.mode === 'verifica',
    next = 'acquisto/' + id;
  const contents = [
    ['lesson', 'lezione', 'lezioni'], ['example', 'esempio guidato', 'esempi guidati'],
    ['question', 'quesito di studio', 'quesiti di studio'], ['lab', 'laboratorio', 'laboratori'],
  ].map(([kind, singular, plural]) => {
    const count = data.items.filter((item) => item.kind === kind).length;
    return count ? count + ' ' + (count === 1 ? singular : plural) : '';
  }).filter(Boolean).join(' · ');
  main.innerHTML =
    crumb([['Percorsi', 'percorsi'], [c.title, 'corso/' + id], ['Accesso']]) +
    head('Accesso al percorso', c.title) +
    `<div class="split"><div class="sheetpanel"><h2>Riepilogo</h2><p>${esc(c.summary)}</p>${contents ? '<p class="small">' + contents + '</p>' : ''}${mock ? '<div class="notice"><b>Modalità di verifica</b><p>L’importo di 1,00 € serve al collaudo. Non effettuare bonifici.</p></div>' : ''}${data.offers.length ? `<form id="order" class="form"><label>Offerta<select name="offer">${data.offers.map((o) => `<option value="${esc(o.key)}">${esc(o.label)} · ${euro(o.cents)}</option>`).join('')}</select></label><p id="off-desc"></p>${!mock ? `<div class="notice">${esc(data.terms)}</div>` : ''}${state.user && state.user.role !== 'lettore' ? `<label class="inline-check"><input type="checkbox" name="accepted" required>Ho letto il riepilogo ${mock ? 'e la modalità di verifica' : 'e le condizioni dell’offerta'}.</label><button class="solid">${mock ? 'Crea ordine di verifica' : 'Crea ordine di bonifico'}</button>` : link(state.user ? 'Usa un account personale' : 'Accedi per creare l’ordine', 'accedi/entra/' + next, true)}<p id="action-status"></p></form>` : '<p class="notice">Le iscrizioni a questa offerta sono chiuse.</p>'}</div><aside class="sheetpanel intro-card"><h3>Dall’ordine all’accesso</h3><ol><li>Il riepilogo fissa l’offerta e l’importo.</li><li>Ritrovi identificativo e istruzioni nel tuo account.</li><li>Andrea controlla l’accredito e registra la conferma.</li><li>I materiali acquistati compaiono nel tuo studio.</li></ol>${data.owned ? link('Apri il percorso', 'corso/' + id) : ''}</aside></div>`;
  const selector = $('#order select');
  if (selector) {
    const show = () => {
      $('#off-desc').textContent =
        data.offers.find((o) => o.key === selector.value)?.description ||
        {
          digitale: 'Accesso ai materiali digitali del percorso.',
          incontri: mock ? 'Incontri dal vivo fittizi per verificare il flusso amministrativo.' : '',
          combinata: mock ? 'Prova di offerta combinata con materiali digitali e incontri.' : '',
        }[selector.value];
    };
    selector.onchange = show;
    show();
  }
  on('#order', 'submit', async (e, el) => {
    const f = new FormData(el);
    const o = await api('/orders', { course: id, offer: f.get('offer'), accepted: f.has('accepted') });
    toast('Ordine ' + o.id + ' registrato.');
    go('studio');
  });
}
const authorTabs = () =>
  `<nav class="tabs"><a href="#autore">Materiali</a><a href="#amministrazione">Bonifici</a><a href="#edizioni">Edizioni PDF</a></nav>`;
export async function admin() {
  const a = await api('/author/commerce'),
    c = a.config;
  main.innerHTML =
    crumb([['Area autore', 'autore'], ['Bonifici']]) +
    head(
      'Registro dei bonifici',
      'Confronta l’importo con il movimento bancario prima di attivare il percorso.',
    ) +
    authorTabs() +
    `<h2>Ordini</h2>${a.orders.length ? a.orders.map((o) => `<article class="order"><div class="kickerline"><b>${esc(o.id)} · ${esc(o.snapshot.courseTitle)}</b><span class="stamp">${esc(o.state)}</span></div><p>${esc(o.email)} · ${esc(o.snapshot.label)} · ${euro(o.cents)} · modalità ${esc(o.mode)}</p>${o.state === 'in attesa' ? `<form class="form check-order" data-order="${esc(o.id)}"><label>Importo riscontrato (€)<input name="amount" inputmode="decimal" required></label><label class="inline-check"><input name="verified" type="checkbox" required>Ho verificato ${o.mode === 'verifica' ? 'il movimento di prova' : 'l’effettivo accredito sul conto'}.</label><button>Conferma accredito</button></form>` : ''}</article>`).join('') : '<p class="notice">Non sono stati creati ordini.</p>'}<details class="sheetpanel"><summary><strong>Coordinate, offerte e modalità di vendita</strong></summary><form id="commerce" class="form"><label>Modalità<select name="mode"><option value="verifica">Verifica · nessun pagamento</option><option value="reale" ${c.mode === 'reale' ? 'selected' : ''}>Reale · bonifici attivi</option></select></label>${[
      ['holder', 'Intestatario'],
      ['iban', 'IBAN'],
      ['reference', 'Modello di causale, includi {ordine}'],
    ]
      .map(
        ([k, s]) =>
          `<label>${s}<input name="${k}" value="${esc(c[k] || (k === 'reference' ? 'Officina {ordine}' : ''))}"></label>`,
      )
      .join(
        '',
      )}<label>Condizioni commerciali<textarea name="terms">${esc(c.terms)}</textarea></label><p class="helper">Usa un prezzo vuoto per chiudere un’offerta reale. Per incontri e combinazioni descrivi le prestazioni incluse.</p>${state.courses
      .map(
        (course) =>
          `<details><summary>${esc(course.title)}</summary>${['digitale', 'incontri', 'combinata']
            .map((k) => {
              const id = course.id + '|' + k;
              return `<div class="two"><label>${k} (€)<input name="price:${id}" inputmode="decimal" value="${c.prices?.[id] ? (c.prices[id] / 100).toFixed(2) : ''}"></label><label>Inclusioni<input name="desc:${id}" value="${esc(c.descriptions?.[id])}"></label></div>`;
            })
            .join('')}</details>`,
      )
      .join(
        '',
      )}<button class="solid">Salva configurazione</button><p id="action-status"></p></form></details><details><summary>Registro operazioni</summary><div class="tablebox"><table><thead><tr><th>Data</th><th>Operazione</th><th>Oggetto</th><th>Operatore</th></tr></thead><tbody>${a.audit.map((r) => `<tr><td>${date(r.stamp)}</td><td>${esc(r.event)}</td><td>${esc(r.target)} ${esc(r.detail)}</td><td>${esc(r.actor)}</td></tr>`).join('')}</tbody></table></div></details>`;
  $$('.check-order').forEach((f) => {
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const el = e.submitter;
      el.disabled = true;
      try {
        const r = await api('/order/' + f.dataset.order, {
          action: 'confirm',
          amount: new FormData(f).get('amount'),
          verified: true,
        });
        toast(r.message || 'Accredito confermato.');
        await admin();
      } catch (e) {
        toast(e.message);
      } finally {
        el.disabled = false;
      }
    });
  });
  on('#commerce', 'submit', async (e, f) => {
    const fd = new FormData(f),
      values = { prices: {}, descriptions: {} };
    for (const [k, v] of fd) {
      if (k.startsWith('price:')) values.prices[k.slice(6)] = v;
      else if (k.startsWith('desc:')) values.descriptions[k.slice(5)] = v;
      else values[k] = v;
    }
    await api('/author/commerce', values);
    await refresh();
    toast('Configurazione salvata.');
    go('amministrazione');
  });
}
export async function editions() {
  const rows = await api('/author/pdf');
  main.innerHTML =
    crumb([['Area autore', 'autore'], ['Edizioni PDF']]) +
    head(
      'Edizioni PDF',
      'Ogni fascicolo corrisponde a un insieme preciso di versioni pubblicate. Dopo una modifica rigenera i volumi segnalati.',
    ) +
    authorTabs() +
    `<div class="actions">${button('Aggiorna stato', 'check')}<a class="button" href="/api/author/inventario/record" download>Inventario corrente · CSV</a><a class="button" href="/api/author/inventario/copertura" download>Matrice MUR · CSV</a></div><div class="tablebox"><table><thead><tr><th>Corso</th><th>Fascicolo</th><th>Stato</th><th>Azione</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${esc(r.course)}</td><td>${esc(r.title)}</td><td>${esc(r.job === 'in lavorazione' || r.job.startsWith('errore') ? r.job : r.ready ? 'Allineato' : 'Da rigenerare')}</td><td><button id="pdf-${i}">Rigenera</button> ${r.ready ? `<a href="/download/${r.course}/${r.book}" download>Scarica</a>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  on('#check', 'click', () => go('edizioni'));
  rows.forEach((r, i) =>
    on('#pdf-' + i, 'click', async () => {
      await api('/author/pdf', { course: r.course, book: r.book });
      toast('Impaginazione avviata.');
      go('edizioni');
    }),
  );
  if (rows.some((r) => r.job === 'in lavorazione'))
    setTimeout(() => {
      if (location.hash === '#edizioni') editions().catch((e) => toast(e.message));
    }, 2300);
}
