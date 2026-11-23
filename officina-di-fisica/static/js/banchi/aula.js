import { esc } from '../ui.js';

export const momenti = ['Prevedi', 'Osserva', 'Esplora', 'Comprendi', 'Verifica'];
export function stileBanco() {
  if (document.querySelector('#bench-styles')) return;
  const style = document.createElement('link');
  style.id = 'bench-styles';
  style.rel = 'stylesheet';
  style.href = '/banchi.css';
  document.head.append(style);
}
export function sequenza() {
  return (
    '<nav class="lab-path" aria-label="Momenti del laboratorio">' +
    momenti
      .map(
        (name, i) =>
          '<button type="button" data-phase="' +
          i +
          '" ' +
          (i ? '' : 'aria-current="step"') +
          '><span aria-hidden="true">' +
          (i + 1) +
          '</span>' +
          name +
          '</button>',
      )
      .join('') +
    '</nav>'
  );
}
export function segnaMomento(root, index, locked = false) {
  for (const button of root.querySelectorAll('[data-phase]')) {
    const i = Number(button.dataset.phase);
    button.disabled = locked && i > 0;
    if (i === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
}
export function barraTempo() {
  return (
    '<div class="bench-time" hidden><div class="time-line"><button type="button" data-play>Avvia</button>' +
    '<label class="time-slide">Tempo simulato <output data-time></output><input data-scrub type="range" aria-label="Scorri il tempo simulato" min="0" max="1" step="any" value="0"></label></div>' +
    '<p class="clock-scale" hidden></p><details class="time-options"><summary>Regola il tempo</summary><div><label>Istante (<span data-clock-unit>s</span>)<input data-instant type="number" step="any" min="0" value="0"></label>' +
    '<label>Velocità<select data-rate><option value="0.25">¼×</option><option value="0.5">½×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label>' +
    '<button type="button" data-nudge="-1" aria-label="−1% del ciclo, indietro">−1%</button><button type="button" data-nudge="1" aria-label="+1% del ciclo, avanti">+1%</button><button type="button" data-rewind>Da capo</button><label class="loop"><input type="checkbox" data-loop> Ripeti in ciclo</label></div></details></div>'
  );
}
export function concentrazione(instrument) {
  const opener = instrument.querySelector('[data-focus]');
  const dialog = document.createElement('dialog');
  dialog.className = 'lab-focus-dialog';
  dialog.setAttribute('aria-label', 'Scena in concentrazione');
  const anchor = document.createComment('posizione dello strumento');
  instrument.before(anchor, dialog);
  function restore() {
    if (dialog.open || !dialog.contains(instrument)) return;
    anchor.after(instrument);
    opener.textContent = 'Concentrazione';
    opener.setAttribute('aria-pressed', 'false');
    if (opener.isConnected) opener.focus({ preventScroll: true });
  }
  dialog.addEventListener('close', restore);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    dialog.close();
    restore();
  });
  opener.onclick = () => {
    if (dialog.open) {
      dialog.close();
      restore();
      return;
    }
    dialog.append(instrument);
    dialog.showModal();
    opener.textContent = 'Esci dalla concentrazione';
    opener.setAttribute('aria-pressed', 'true');
    opener.focus({ preventScroll: true });
  };
  return () => {
    if (dialog.open) {
      dialog.close();
      restore();
    }
  };
}
export function letture(rows, selected = '') {
  return rows
    .map(
      ([label, value, unit]) =>
        '<div' +
        (label === selected ? ' class="reading-target"' : '') +
        '><span>' +
        esc(label) +
        '</span><strong>' +
        esc(value) +
        ' <small>' +
        esc(unit) +
        '</small></strong></div>',
    )
    .join('');
}
