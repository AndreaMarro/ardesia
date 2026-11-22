import { esc, link, listLine, state } from '../ui.js';
import { benchRoute } from './collegamenti.js';

const countLabel = (count) => count === 1 ? '1 simulazione' : count + ' simulazioni';
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it');
const words = (text) => normalize(text).match(/[\p{L}\p{N}]+/gu) || [];
const row = (e, detail = e.summary) => listLine(e.title, benchRoute(e.id), detail);

function lessonGroup(lesson) {
  return '<details><summary>' + esc(lesson.title) + ' · ' + lesson.experiments.length +
    '</summary>' + lesson.experiments.map((e) => row(e)).join('') + '</details>';
}

function courseGroups(lessons, currentCourse) {
  return state.courses.map((course) => {
    const group = lessons.filter((l) => l.course === course.id);
    if (!group.length) return '';
    const count = group.reduce((n, l) => n + l.experiments.length, 0);
    const includes = Boolean(course.includes?.length);
    const title = includes ? 'Raccordi del percorso completo' : course.title;
    return '<details class="topic-shelf" data-course="' + esc(course.id) + '"><summary>' +
      esc(course.id + ' · ' + title) + ' <small>· ' + count + '</small></summary>' +
      '<div class="topic-shelf-body">' + group.map(lessonGroup).join('') +
      (includes && course.id !== currentCourse ? link('Tutte le simulazioni del percorso completo', 'laboratori/' + course.id) : '') +
      '</div></details>';
  }).join('');
}

export function showSimulationIndex(node, lessons, course, lesson, collections) {
  if (lesson) {
    node.innerHTML = lesson.experiments.map((e) => row(e)).join('');
    return;
  }
  const entries = lessons.flatMap((l) => l.experiments.map((e) => ({
    e, lesson: l, tokens: words([e.title, e.summary, e.id, l.title, l.section, l.id, l.course].join(' ')),
  })));
  const browse = () => course && !course.includes?.length
    ? '<div class="topic-shelf">' + lessons.map(lessonGroup).join('') + '</div>'
    : courseGroups(lessons, course?.id);
  node.innerHTML = '<label class="sim-search" for="cerca-simulazione">Cerca un argomento' +
    '<input type="search" id="cerca-simulazione" placeholder="Es. lente, attrito, capillarità" autocomplete="off"></label>' +
    '<p class="sim-count" role="status"></p><div class="sim-results"></div>';
  const field = node.querySelector('input');
  const status = node.querySelector('[role=status]');
  const results = node.querySelector('.sim-results');
  function render() {
    const terms = words(field.value);
    if (collections) collections.hidden = terms.length > 0;
    if (!terms.length) {
      status.textContent = countLabel(entries.length) + ' in ' + lessons.length + (lessons.length === 1 ? ' lezione' : ' lezioni');
      results.innerHTML = browse();
      return;
    }
    const found = entries.filter(({tokens}) => terms.every((term) => tokens.some((word) => word.startsWith(term))));
    status.textContent = found.length ? countLabel(found.length) : 'Nessuna simulazione trovata. Prova un altro termine.';
    results.innerHTML = found.map(({e, lesson}) => row(e, lesson.course + ' · ' + lesson.title)).join('');
  }
  field.addEventListener('input', render);
  render();
}
