import { api, state } from './ui.js';
import { installaPassaggi } from './lettura.js';
import { italianVoice, narrator, transcript } from './ascolto.js';

const guestKey = 'officina.lettura.ospite.v1';
let writes = Promise.resolve();
let nextReader = 0;

export function installReader(container, record) {
  const copy = container?.querySelector('.copy');
  if (!copy || !container.isConnected) return;
  const scope = state.draftSession;
  const layout = container.closest('.layout') || container;
  const id = 'preferenze-lettore-' + ++nextReader;
  const panel = document.createElement('details');
  panel.className = 'lettore-opzioni';
  panel.innerHTML = `<summary>Testo e ascolto</summary>
    <div class="lettore-impostazioni">
      <div class="lettore-campi">
        <label><span id="${id}-density">Spaziatura</span><select name="density" aria-labelledby="${id}-density"><option value="standard">Normale</option><option value="spacious">Ampia</option></select></label>
        <label><span id="${id}-contrast">Contrasto</span><select name="contrast" aria-labelledby="${id}-contrast"><option value="paper">Carta</option><option value="high">Alto</option></select></label>
        <label><span id="${id}-pace">All’apertura</span><select name="pace" aria-labelledby="${id}-pace"><option value="continuous">Testo intero</option><option value="steps">Un passaggio alla volta</option></select></label>
      </div>
      <label class="lettore-focus"><input name="focus" type="checkbox">Modalità concentrazione</label>
      <div class="lettore-suono"><button type="button" data-play>Ascolta il testo visibile</button>
        <button type="button" data-stop hidden>Ferma l’ascolto</button>
        <button type="button" data-words aria-expanded="false" aria-controls="${id}-trascrizione">Leggi la trascrizione</button></div>
      <p class="lettore-nota" data-voice></p>
      <div class="lettore-trascrizione" id="${id}-trascrizione" data-transcript hidden></div>
      <div class="lettore-tempo"><button type="button" data-clock>Avvia un timer di 5 minuti</button>
        <span role="timer" aria-label="Tempo rimanente" aria-live="off" hidden></span></div>
      <button type="button" class="textbtn" data-reset>Ripristina le preferenze</button>
      <p role="status" class="lettore-nota" data-message></p>
    </div>`;
  const get = selector => panel.querySelector(selector);
  const inputs = [...panel.querySelectorAll('[name]')];
  const message = get('[data-message]');
  const words = get('[data-words]');
  const text = get('[data-transcript]');
  const play = get('[data-play]');
  const stop = get('[data-stop]');
  const clock = get('[data-clock]');
  const time = get('[role=timer]');
  const synth = window.speechSynthesis;
  const active = () => container.isConnected && state.draftSession === scope && !suspended;
  let suspended = false;
  let serial = 0;
  let textRequest = 0;
  let interval;
  let listening = false;
  function audioStatus(note, busy) {
    const returnFocus = !busy && document.activeElement === stop;
    listening = busy;
    stop.hidden = !busy;
    play.hidden = busy;
    if (returnFocus) play.focus({preventScroll:true});
    message.textContent = note;
  }
  const speech = narrator(synth, window.SpeechSynthesisUtterance, audioStatus);
  function stopAudio() {
    speech.stop();
    if (listening) audioStatus('Ascolto fermato.', false);
  }
  function closeTranscript() {
    textRequest++;
    words.setAttribute('aria-expanded', 'false');
    words.textContent = 'Leggi la trascrizione';
    text.hidden = true;
    text.replaceChildren();
  }
  function stopClock(note) {
    clearInterval(interval);
    interval = undefined;
    time.hidden = true;
    clock.textContent = 'Avvia un timer di 5 minuti';
    if (note) message.textContent = note;
  }
  function voices() {
    const available = Boolean(window.SpeechSynthesisUtterance && italianVoice(synth?.getVoices() || []));
    play.disabled = !available;
    get('[data-voice]').textContent = available ? 'La voce italiana viene dal dispositivo.' :
      'Questo browser non offre una voce italiana locale. Puoi leggere la trascrizione, formule comprese.';
  }
  const controls = installaPassaggi(container, record, pace => save({pace}));
  if (!controls) get('[name=pace]').parentElement.hidden = true;
  (container.querySelector('.lettura-strumenti') || copy).before(panel);
  container.dataset.lettore = '';
  const profile = () => {
    const base = { ...state.readingPreferences };
    if (scope) return base;
    try {
      const stored = JSON.parse(localStorage.getItem(guestKey) || '{}');
      for (const el of inputs) {
        const value = stored?.[el.name];
        if (el.type === 'checkbox' ? typeof value === 'boolean' : [...el.options].some(o => o.value === value))
          base[el.name] = value;
      }
    } catch { /* Unavailable device storage still allows reading in this page. */ }
    return base;
  };
  let selected = profile();
  function apply(next) {
    selected = next;
    for (const el of inputs) {
      if (el.type === 'checkbox') el.checked = next[el.name];
      else el.value = next[el.name];
    }
    layout.dataset.density = next.density;
    layout.dataset.contrast = next.contrast;
    layout.classList.toggle('lettore-concentrato', next.focus);
    if (controls) controls.setMode(next.pace);
  }
  function save(changes) {
    const version = ++serial;
    const reset = changes.reset === true;
    if (!scope) {
      const next = reset ? { ...state.readingPreferences } : {...selected, ...changes};
      apply(next);
      try {
        if (reset) localStorage.removeItem(guestKey);
        else localStorage.setItem(guestKey, JSON.stringify(next));
        message.textContent = reset ? 'Preferenze ripristinate.' : 'Preferenza salvata su questo dispositivo.';
      } catch { message.textContent = 'Scelta applicata per questa pagina. Il salvataggio sul dispositivo è indisponibile.'; }
      return;
    }
    if (!reset) apply({...selected, ...changes});
    // Serialize this browser’s gestures. The server merges only changed fields across devices.
    writes = writes.then(async () => {
      const next = await api('/v1/me/reading-preferences', changes, {'X-Officina-Session':scope});
      if (state.draftSession !== scope) return;
      state.readingPreferences = next;
      if (version === serial && active()) {
        apply(next);
        message.textContent = reset ? 'Preferenze ripristinate.' : 'Preferenza salvata nel quaderno.';
      }
    }).catch(error => {
      if (version === serial && active()) {
        apply(profile());
        message.textContent = 'Preferenza non salvata. ' + error.message;
      }
    });
  }
  for (const el of inputs) el.addEventListener('change', () => save({[el.name]:el.type === 'checkbox' ? el.checked : el.value}));
  get('[data-reset]').onclick = () => save({reset:true});
  play.onclick = () => {
    const pending = speech.play(copy);
    if (!stop.hidden) stop.focus({preventScroll:true});
    return pending;
  };
  stop.onclick = stopAudio;
  words.onclick = async () => {
    if (words.getAttribute('aria-expanded') === 'true') { closeTranscript(); return; }
    const request = ++textRequest;
    words.setAttribute('aria-expanded','true');
    words.textContent = 'Chiudi la trascrizione';
    try {
      const paragraphs = await transcript(copy);
      if (!active() || request !== textRequest) return;
      text.replaceChildren(...paragraphs.map(line => {
        const el = document.createElement('p');
        el.textContent = line;
        return el;
      }));
      text.hidden = false;
      message.textContent = 'Trascrizione disponibile.';
    } catch {
      if (request !== textRequest || !active()) return;
      closeTranscript();
      message.textContent = 'Trascrizione non disponibile. Le formule restano nel testo. Puoi riprovare.';
    }
  };
  clock.onclick = () => {
    if (interval !== undefined) { stopClock('Timer fermato.'); return; }
    const end = performance.now() + 300000;
    clock.textContent = 'Ferma il timer';
    time.hidden = false;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      time.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0');
      if (!seconds) stopClock('I cinque minuti sono trascorsi. Puoi continuare al tuo ritmo.');
    };
    interval = setInterval(tick, 1000);
    tick();
    message.textContent = 'Timer avviato.';
  };
  container.addEventListener('lettura:passaggio', () => { stopAudio(); closeTranscript(); });
  function observeVoices() {
    synth?.removeEventListener('voiceschanged', voices);
    if (panel.open && !suspended) { voices(); synth?.addEventListener('voiceschanged', voices); }
  }
  const enclosing = container.closest('details');
  enclosing?.addEventListener('toggle', () => { if (!enclosing.open) stopAudio(); });
  panel.addEventListener('toggle', () => {
    observeVoices();
    if (!panel.open) stopAudio();
  });
  container.addEventListener('lettura:sospendi', () => {
    suspended = true;
    stopAudio();
    closeTranscript();
    stopClock();
    observeVoices();
  });
  container.addEventListener('lettura:riprendi', () => {
    suspended = false;
    apply(profile());
    observeVoices();
  });
  apply(selected);
  writes.then(() => { if (scope && !serial && active()) apply(profile()); });
}
