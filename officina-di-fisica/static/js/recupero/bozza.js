import { verificaSpostamento } from './cinematica.js';

const prefix = 'officina.recupero.v1/';
export const cambioAccesso = 'officina.cambio-accesso';
let authChannel;

export function ascoltaCambioAccesso(notify) {
  window.addEventListener('storage', (event) => {
    if (event.key === cambioAccesso) notify();
  });
  try {
    // WebKit can initialize the storage area lazily, including in a second tab.
    localStorage.getItem(cambioAccesso);
  } catch {
    /* Storage can be disabled independently of messaging. */
  }
  try {
    authChannel = new BroadcastChannel(cambioAccesso);
    authChannel.onmessage = notify;
  } catch {
    /* Each available channel can work independently. */
  }
}
export const chiaveBozza = (session, run, item, edition, variant) =>
  prefix + [session, run, item, edition, variant].map(encodeURIComponent).join('/');

export function pulisciBozze(keepSession = null) {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix) && !(keepSession && key.startsWith(prefix + keepSession + '/')))
        sessionStorage.removeItem(key);
    }
  } catch {
    /* Storage can be disabled; the activity remains available in memory. */
  }
}

export function segnalaCambioAccesso() {
  pulisciBozze();
  authChannel?.postMessage('cambio');
  try {
    localStorage.setItem(cambioAccesso, Date.now() + '/' + Math.random());
  } catch {
    /* Private storage. */
  }
}

export const nuovaBozza = () => ({
  open: false,
  answer: '',
  status: 'bozza',
  last: null,
  helps: [],
  view: 'risposta',
  time: 0,
});

export function modificaRisposta(state, answer) {
  return { ...state, answer, status: 'bozza' };
}

export function controllaRisposta(state, end) {
  const feedback = verificaSpostamento(state.answer, end);
  const last = { answer: state.answer, feedback, assisted: state.helps.length > 0 };
  return { ...state, last, status: feedback === 'corretto' ? 'correzione' : 'errore' };
}

export function consultaAiuto(state, view) {
  return { ...state, view, helps: [...new Set([...state.helps, view])] };
}

export function salvaBozza(key, state) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function leggiBozza(key, model) {
  const empty = nuovaBozza();
  const text = (value) => typeof value === 'string' && value.length <= 32;
  try {
    const s = JSON.parse(sessionStorage.getItem(key));
    if (!s || !text(s.answer) || typeof s.open !== 'boolean' || !Array.isArray(s.helps)) return empty;
    const helps = [...new Set(s.helps.filter((v) => v === 'pista' || v === 'tabella'))];
    const view = helps.includes(s.view) ? s.view : 'risposta';
    const last =
      s.last && text(s.last.answer)
        ? {
            answer: s.last.answer,
            feedback: verificaSpostamento(s.last.answer, model.at(model.duration)),
            assisted: s.last.assisted === true,
          }
        : null;
    const verified =
      last &&
      last.answer === s.answer &&
      s.status === (last.feedback === 'corretto' ? 'correzione' : 'errore');
    return {
      open: s.open,
      answer: s.answer,
      status: verified ? s.status : 'bozza',
      last,
      helps,
      view,
      time: Number.isInteger(s.time) && s.time >= 0 && s.time <= model.duration ? s.time : 0,
    };
  } catch {
    return empty;
  }
}
