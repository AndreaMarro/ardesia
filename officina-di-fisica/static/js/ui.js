import { pulisciBozze, segnalaCambioAccesso } from './recupero/bozza.js';

export const main = document.querySelector('main');
export const state = { courses: [], labs: [], user: null, mode: 'verifica' };
export const esc = (x) =>
  String(x ?? '').replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  );
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const euro = (c) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(c / 100);
export const date = (s) =>
  new Date(s * 1000).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
export const num = (v, d = 3) =>
  Number.isFinite(v) ? new Intl.NumberFormat('it-IT', { maximumSignificantDigits: d }).format(v) : '∞';
export const kinds = {
  course: 'Corso',
  section: 'Sezione',
  method: 'Attività di metodo',
  lesson: 'Lezione',
  example: 'Esempio svolto',
  question: 'Quesito',
  lab: 'Laboratorio',
  bench: 'Laboratorio 3D',
  experiment: 'Simulazione di lezione',
};
export const errorNames = {
  concetto: 'Errore concettuale',
  calcolo: 'Calcolo',
  algebra: 'Passaggio algebrico',
  unità: 'Conversione',
  testo: 'Interpretazione del testo',
  modello: 'Scelta del modello',
};
export async function api(path, data) {
  let response;
  try {
    response = await fetch(
      '/api' + path,
      data === undefined
        ? { cache: 'no-store' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Astra-Request': '1' },
            body: JSON.stringify(data),
            cache: 'no-store',
          },
    );
  } catch {
    throw new Error('Connessione interrotta. Riprova quando il server risponde.');
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Risposta illeggibile dal server.');
  }
  if (!response.ok) {
    const error = new Error(result.error || 'Operazione interrotta.');
    error.status = response.status;
    throw error;
  }
  if (data !== undefined && ['/login', '/register', '/owner', '/demo', '/logout'].includes(path))
    segnalaCambioAccesso();
  return result;
}
export async function refresh() {
  Object.assign(state, await api('/state'));
  pulisciBozze(state.draftSession);
  return state;
}
export function go(route) {
  if (location.hash === '#' + route) window.dispatchEvent(new Event('hashchange'));
  else location.hash = route;
}
export const link = (label, route, solid = false) =>
  `<a class="button ${solid ? 'solid' : ''}" href="#${esc(route)}">${esc(label)}</a>`;
export const button = (label, id, solid = false) =>
  `<button type="button" id="${esc(id)}" class="${solid ? 'solid' : ''}">${esc(label)}</button>`;
export const head = (title, description = '', kicker = '') =>
  `<header class="pagehead">${kicker ? '<div class="meta">' + esc(kicker) + '</div>' : ''}<h1>${esc(title)}</h1>${description ? '<p>' + esc(description) + '</p>' : ''}</header>`;
export const crumb = (items) =>
  `<nav class="crumb" aria-label="Percorso di navigazione">${items.map(([label, r]) => (r ? `<a href="#${esc(r)}">${esc(label)}</a>` : `<span>${esc(label)}</span>`)).join('<span aria-hidden="true">›</span>')}</nav>`;
export const titleOf = (id) => state.courses.find((c) => c.id === id)?.title || id;
export const errMsg = (e) => `<div class="notice" role="alert">${esc(e.message || e)}</div>`;
export const listLine = (label, href, detail = '') =>
  `<a class="line-link" href="#${esc(href)}"><span><strong>${esc(label)}</strong> ${detail ? '<small>' + esc(detail) + '</small>' : ''}</span><span aria-hidden="true">→</span></a>`;
export function blocks(data = []) {
  return `<div class="copy">${data
    .map((b) => {
      const text = esc(b.text || '');
      if (b.type === 'formula') return `<div class="math" data-tex="${text}">${text}</div>`;
      if (b.type === 'figure')
        return `<figure class="figure"><img loading="lazy" src="${esc(assetPath(b.src))}" alt="${text}"><figcaption>${text}</figcaption></figure>`;
      if (b.type === 'attachment')
        return `<p><a href="${esc(assetPath(b.src))}" download>↓ ${text || 'Scarica allegato'}</a></p>`;
      if (['lab', 'example', 'question'].includes(b.type))
        return listLine(b.text || kinds[b.type], (b.type === 'lab' ? 'lab/' : 'materiale/') + b.ref);
      return `<p>${text.replaceAll('\n', '<br>')}</p>`;
    })
    .join('')}</div>`;
}
function assetPath(s) {
  return /^\/(?:figures\/[\w.-]+\.svg|asset\/[a-f0-9]{64})$/.test(s || '') ? s : '';
}
export function typeset(node = main) {
  if (!window.katex) return;
  for (const el of node.querySelectorAll('[data-tex]')) {
    katex.render(el.dataset.tex, el, {
      displayMode: true,
      throwOnError: false,
      strict: false,
      trust: false,
    });
    el.removeAttribute('data-tex');
  }
}
let tid;
export function toast(s) {
  const el = $('#toast');
  el.textContent = s;
  clearTimeout(tid);
  tid = setTimeout(() => (el.textContent = ''), 5000);
}
export async function runAction(el, fn) {
  if (el?.disabled) return;
  if (el) el.disabled = true;
  try {
    return await fn();
  } catch (e) {
    toast(e.message || String(e));
    const status = $('#action-status');
    if (status) status.textContent = e.message || String(e);
  } finally {
    if (el) el.disabled = false;
  }
}
export const on = (sel, event, fn, root = document) => {
  const el = $(sel, root);
  if (el)
    el.addEventListener(event, (e) => {
      if (event === 'submit') e.preventDefault();
      return runAction(event === 'submit' ? e.submitter : el, () => fn(e, el));
    });
};
export const modeNames = {
  practice: 'Allenamento',
  retest: 'Nuova situazione',
  mixed: 'Problemi misti',
  diagnosis: 'Diagnosi iniziale',
  review: 'Ripasso distribuito',
  mid: 'Verifica intermedia',
  final: 'Verifica finale',
  exam: 'Simulazione di Fisica',
};
export function gate(course, desc = 'Accedi al percorso per usare questa attività.') {
  return `<div class="notice">${esc(desc)}<div class="actions">${!state.user ? link('Accedi', 'accedi', true) : ''}${link('Riepilogo del percorso', 'acquisto/' + course)}${!state.user && state.mode === 'verifica' ? button('Apri un quaderno di prova', 'demo') : ''}</div></div>`;
}
export function demo(next = 'studio') {
  on('#demo', 'click', async () => {
    await api('/demo', {});
    await refresh();
    go(next);
  });
}
export function answerText(question, key) {
  if (question.type !== 'numeric') return String(key);
  const unit = question.unit === '1' ? '' : question.unit;
  return [String(key).replace('.', ','), unit].filter(Boolean).join(' ');
}
export function inputFor(q, value = '') {
  if (q.type === 'choice')
    return `<fieldset style="border:0;padding:0;margin:0"><legend class="sr">Scegli una risposta</legend>${q.options.map((opt, i) => `<label class="choice"><input type="radio" name="value" value="${esc(opt)}" ${String(value) === opt ? 'checked' : ''}><b aria-hidden="true">${String.fromCharCode(65 + i)}</b><span>${esc(opt)}</span></label>`).join('')}</fieldset>`;
  const numeric = q.type === 'numeric';
  const unit = q.unit === '1' ? '' : q.unit;
  const label = numeric
    ? 'Risposta numerica' + (unit ? ' in ' + esc(unit) : ' (adimensionale)')
    : 'Completa con il termine richiesto';
  return `<label class="field">${label}<input name="value" type="text" ${numeric ? 'inputmode="decimal"' : ''} autocomplete="off" maxlength="600" value="${esc(value ?? '')}"></label>${numeric ? `<p class="helper">Tolleranza assoluta ±${esc(answerText(q, q.tolerance))}. Puoi usare la virgola o il punto come separatore decimale.</p>` : ''}`;
}
export async function startRun(d) {
  const requestId =
    globalThis.crypto?.randomUUID?.() || 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const r = await api('/runs', { ...d, requestId });
  go('prova/' + r.id);
}
