import { esc } from '../../ui.js';
import { n } from '../misure.js';
import { disegna2D } from './tavola.js';

export function confrontoMisure(node, activity, setSecond) {
  const r = activity.record;
  const first = r.references[0][0];
  let reference = first;
  let current = first;
  node.innerHTML =
    '<header><h2>Confronta due misure</h2><p>' +
    esc(activity.observe) +
    '</p></header>' +
    '<div class="measure-pair"><figure></figure><figure></figure></div>' +
    '<div class="setting-actions"><button type="button" data-pin>Fissa la misura attuale in A</button>' +
    '<button type="button" data-pair-next>Prova la seconda misura in B</button></div>' +
    '<p class="measure-change"></p><details class="measure-work"><summary>Segui il calcolo delle due letture</summary><div></div></details>';
  const figures = node.querySelectorAll('figure');
  const change = node.querySelector('.measure-change');
  const work = node.querySelector('.measure-work div');
  let a, b;

  function plate(figure, title, sample) {
    figure.innerHTML =
      '<figcaption><strong>' +
      title +
      '</strong><span>' +
      esc(r.control.label + ' · ' + sample.input) +
      '</span></figcaption>' +
      disegna2D(activity.elements(sample.x, 2), r.title + ' · ' + title, 'measure-diagram') +
      '<p>' +
      esc(r.measure.label) +
      ' <b>' +
      esc(sample.reading) +
      '</b></p>';
  }
  function render(x) {
    current = x;
    if (a?.x === reference && b?.x === x) return;
    if (a?.x !== reference) {
      a = activity.measurement(reference);
      plate(figures[0], 'A · Riferimento', a);
    }
    if (b?.x !== x) {
      b = activity.measurement(x);
      plate(figures[1], 'B · Misura attuale', b);
    }
    const difference = b.value - a.value;
    const unit = r.measure.unit === '1' ? '' : ' ' + r.measure.unit;
    const delta = n(difference) + unit;
    change.textContent =
      reference === current
        ? 'Le impostazioni coincidono. Cambia il parametro oppure prova la seconda misura.'
        : Math.abs(difference) < 1e-12
          ? 'Le due impostazioni danno la stessa lettura.'
          : 'Variazione da A a B · ' + (difference > 0 ? '+' : '') + delta;
    const rounded = [a.value, b.value, difference].some((v) => Number(v.toPrecision(4)) !== v);
    work.innerHTML =
      '<p><b>A</b> ' +
      esc(a.calculation) +
      '</p><p><b>B</b> ' +
      esc(b.calculation) +
      '</p><p><b>B − A</b> ' +
      esc(n(b.value) + ' − (' + n(a.value) + ')' + (rounded ? ' ≈ ' : ' = ') + delta) +
      '</p>';
  }
  node.querySelector('[data-pin]').onclick = () => {
    reference = current;
    render(current);
  };
  node.querySelector('[data-pair-next]').onclick = setSecond;
  return {
    render,
    reset() {
      reference = first;
    },
  };
}
