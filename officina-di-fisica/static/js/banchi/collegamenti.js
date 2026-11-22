import { state, esc, listLine } from '../ui.js';
const origin = () => location.hash.slice(1) || 'laboratori';
export function benchRoute(id, topic) {
  return 'banco/' + id + '/' + encodeURIComponent(origin()) + (topic === undefined ? '' : '/' + topic);
}
export function benchLinks(id) {
  return (state.benches || [])
    .filter((b) => b.related.includes(id))
    .map((b) => listLine('Osserva in 3D · ' + b.title, benchRoute(b.id), b.summary))
    .join('');
}
export function lessonBenches(node, r) {
  const paragraphs = [...node.querySelectorAll('.copy > p')],
    used = new Map();
  for (const topic of r.benchTopics || []) {
    const dest = paragraphs.find((el) => el.textContent.startsWith(topic.anchor)) || node;
    let group = used.get(dest);
    if (!group) {
      group = document.createElement('details');
      group.className = 'bench-topic';
      group.innerHTML = '<summary>Esplora questo passaggio in 3D</summary>';
      if (dest === node) dest.append(group);
      else {
        const block = document.createElement('div');
        dest.before(block);
        block.append(dest, group);
      }
      used.set(dest, group);
    }
    group.insertAdjacentHTML(
      'beforeend',
      `<a href="#${esc(benchRoute(topic.bench, topic.index))}"><strong>${esc(topic.topic)}</strong><span>${esc(topic.question)} →</span></a>`,
    );
  }
}
