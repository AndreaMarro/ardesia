import { esc } from './ui.js';
import { equivalent } from './espressioni.js';
import { plot } from './grafico-metodo.js';

export function activityPanel(records = []) {
  if (!records.length) return '';
  const buttons = records.map((row) => {
    const label = row.format === 'formula' ? 'Ricava una formula' : 'Interpreta un grafico';
    const multiple = records.filter((other) => other.format === row.format).length > 1;
    return (
      '<button type="button" data-sheet="' +
      esc(row.id) +
      '" aria-pressed="false">' +
      esc(multiple ? row.title : label) +
      '</button>'
    );
  });
  return (
    '<section class="method-part workshop" aria-label="Allenamento di metodo"><h2>Mettiti alla prova</h2><div class="actions">' +
    buttons.join('') +
    '</div><div class="work-area"></div></section>'
  );
}
const notation = (text) => text.replaceAll('rho', 'ρ').replaceAll('lambda', 'λ').replaceAll('p0', 'p₀');
const stageNames = ['Leggere', 'Costruire', 'Interpretare'];
function graphStage(g, stage) {
  const data = { ...g, samples: g.points, ymin: g.ymin ?? 0, slope: !g.wave && !g.area };
  let charts = plot(data, stage + 1, true);
  if (g.comparison && stage === 2) {
    charts += plot({ ...g.comparison, samples: g.comparison.points }, 3, true);
  }
  const pairs = g.points.map((pair) => '(' + pair.join(' ; ') + ')').join(', ');
  return `<figure class="work-graph">${charts}<figcaption>${esc(g.captions[stage])}</figcaption></figure>
    <details><summary>Leggi i dati del grafico in testo</summary><p>${esc(g.x)} · ${esc(g.y)}. Punti: ${esc(pairs)}.
    ${g.comparison && stage === 2 ? esc(g.comparison.x + ' · ' + g.comparison.y + '. Punti: ' + g.comparison.points.map((p) => '(' + p.join(' ; ') + ')').join(', ')) : ''}</p></details>`;
}
function field(step) {
  if (step.kind === 'choice') {
    return step.options
      .map(
        (option) =>
          `<label class="work-option"><input type="radio" name="answer" value="${esc(option)}" required><span>${esc(option)}</span></label>`,
      )
      .join('');
  }
  const numeric = step.kind === 'number';
  return `<label>${numeric ? 'Il tuo valore' : 'La tua espressione'}
    <input name="answer" required autocomplete="off" maxlength="72" inputmode="${numeric ? 'decimal' : 'text'}"></label>
    ${numeric ? '' : '<small>Usa +, −, *, / e parentesi. Puoi omettere il segno di prodotto fra simboli.</small>'}`;
}
export function installActivities(root, records) {
  const panel = root.querySelector('.workshop');
  if (!panel) return;
  const area = panel.querySelector('.work-area');
  const progress = new Map();
  let record;
  function render(focus) {
    const steps = record.steps,
      index = progress.get(record.id) || 0,
      graph = record.format === 'graph',
      step = steps[index];
    const title = record.title;
    const checks = steps
      .slice(0, index)
      .map((s) => '<li>' + esc(s.why) + '</li>')
      .join('');
    const history = checks
      ? `<details class="work-history" ${step ? '' : 'open'}><summary>Passaggi verificati · ${index}</summary><ol>${checks}</ol></details>`
      : '';
    area.innerHTML = `<h3 tabindex="-1">${esc(title)}</h3>${history}`;
    if (!step) {
      area.insertAdjacentHTML(
        'beforeend',
        '<p role="status" class="notice good">Attività completata.</p><button type="button" data-reset>Riprova da capo</button>',
      );
      area.querySelector('[data-reset]').onclick = () => {
        progress.set(record.id, 0);
        render(true);
      };
    } else {
      const content = graph
        ? graphStage(record.diagram, step.stage)
        : `<p>${esc(notation(record.prompt))}</p><p class="work-model">${esc(notation(record.relation))}</p>`;
      area.insertAdjacentHTML(
        'beforeend',
        `<div class="work-grid"><div>${content}</div><form>
        <div class="meta">${graph ? stageNames[step.stage] + ' · ' : ''}Passaggio ${index + 1} di ${steps.length}</div>
        <fieldset><legend>${esc(step.prompt)}</legend>${field(step)}</fieldset>
        <button class="solid">Verifica</button><p role="status" class="work-status"></p></form></div>`,
      );
      const form = area.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        const value = String(new FormData(form).get('answer') || '').trim();
        const decimal = value.replace(',', '.');
        const right =
          step.kind === 'choice'
            ? value === step.answer
            : step.kind === 'expression'
              ? equivalent(value, step.answer, record.symbols, record.target)
              : /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(decimal) && Number(decimal) === step.answer;
        const status = form.querySelector('.work-status');
        if (!right) {
          status.textContent = 'Riprova. ' + step.hint;
          return;
        }
        form.querySelector('fieldset').disabled = true;
        const button = form.querySelector('button');
        status.textContent = 'Corretto. ' + step.why;
        button.type = 'button';
        button.textContent = index + 1 === steps.length ? 'Concludi' : 'Continua';
        button.onclick = () => {
          progress.set(record.id, index + 1);
          render(true);
        };
        button.focus();
      };
    }
    if (focus) area.querySelector('h3').focus({ preventScroll: true });
  }
  panel.querySelectorAll('[data-sheet]').forEach((button) => {
    button.onclick = () => {
      record = records.find((row) => row.id === button.dataset.sheet);
      for (const b of panel.querySelectorAll('[data-sheet]'))
        b.setAttribute('aria-pressed', String(b === button));
      render(true);
    };
  });
}
