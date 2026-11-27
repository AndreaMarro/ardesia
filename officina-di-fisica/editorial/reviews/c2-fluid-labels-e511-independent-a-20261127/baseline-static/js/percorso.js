import { api, esc, link, startRun, runAction } from './ui.js';

export function attachPathway(node, course) {
  let status = 'idle';
  node.addEventListener('toggle', async () => {
    if (!node.open || status !== 'idle') return;
    status = 'loading';
    const panel = node.querySelector('[data-path-panel]');
    panel.textContent = 'Caricamento delle competenze…';
    try {
      const { lessons } = await api('/v1/courses/' + encodeURIComponent(course) + '/learning-path');
      if (!lessons.length) {
        panel.textContent = 'Questo corso non contiene ancora lezioni.';
      } else {
        panel.innerHTML = '<label>Lezione <select>' + lessons.map((r, i) =>
          '<option value="' + i + '">' + esc(r.title) + '</option>').join('') +
          '</select></label><div data-decision aria-live="polite"></div>';
        const select = panel.querySelector('select');
        const decision = panel.querySelector('[data-decision]');
        const byId = new Map(lessons.map((r) => [r.id, r.title]));
        function show() {
          const row = lessons[select.selectedIndex];
          const action = row.next;
          const button = action.kind === 'practice'
            ? '<button type="button" data-transfer>Prova un problema</button>'
            : link({lesson: 'Apri la lezione', example: 'Segui l’esempio', experiment: 'Apri il laboratorio'}[action.kind],
              action.kind === 'experiment' ? 'banco/' + action.id : 'materiale/' + action.id + '/' + course);
          decision.innerHTML = '<p><strong>' + esc(row.competencies.join(' · ') || row.title) + '</strong></p>' +
            (row.prerequisites.length ? '<p>Prima di questa lezione</p><ul>' + row.prerequisites.map((id) =>
              '<li>' + link(byId.get(id), 'materiale/' + id + '/' + course) + '</li>').join('') + '</ul>' : '') +
            '<p>' + esc(row.mastery) + ' · Famiglie di problemi tentate senza aiuto · ' +
            row.independentFamilies + '</p><p>' + esc(action.reason) + '</p>' + button;
          const transfer = decision.querySelector('[data-transfer]');
          transfer?.addEventListener('click', () => runAction(transfer, () => startRun({course, skill: row.id, mode: 'practice'})));
        }
        select.addEventListener('change', show);
        show();
      }
      status = 'ready';
    } catch (error) {
      panel.textContent = error.message + ' Chiudi e riapri per riprovare.';
      status = 'idle';
    }
  });
}
