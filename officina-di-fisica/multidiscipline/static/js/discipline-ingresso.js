import { api, link, main } from '/js/ui.js';

// Keep the original cover and its navigation usable while the registry is loading.
export async function updateCover() {
  const cover = main.querySelector('.hero');
  const directory = await api('/v1/disciplines').catch(() => null);
  if (!cover?.isConnected) return;
  const subjects = directory?.disciplines.filter(subject => subject.route !== 'percorsi') || [];
  if (!subjects.length) return;
  cover.querySelector('#cover-title span').textContent = 'Lo studio,';
  cover.querySelector('.hero-copy p').textContent =
    'Entra nei percorsi di Fisica per Medicina o scegli un’altra materia. Il quaderno conserva il punto in cui ti fermi.';
  const physics = cover.querySelector('.hero-actions [href="#percorsi"]');
  physics.firstChild.textContent = 'Fisica per Medicina ';
  physics.insertAdjacentHTML('afterend', subjects.map(subject =>
    link(subject.title, 'disciplina/' + encodeURIComponent(subject.id))).join(''));
  for (const destination of ['#sprint', '#laboratori']) {
    cover.querySelector('.hero-actions a[href="' + destination + '"]')?.remove();
  }
  const index = main.querySelector('#cover-index');
  index.textContent = 'Fisica per Medicina';
  index.parentElement.classList.add('discipline-intro');
}

export function updateSearch(page, subject) {
  const search = document.querySelector('.mast-search');
  const inSubject = page === 'disciplina' && subject;
  search.href = inSubject ? '#disciplina/' + encodeURIComponent(subject) + '/%40cerca' : '#percorsi/cerca';
  search.title = inSubject ? 'Cerca in questa materia' : 'Cerca nei percorsi di Fisica';
}
