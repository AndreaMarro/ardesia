import { api, link, main, state } from '/js/ui.js';

// Keep the original cover and its navigation usable while the registry is loading.
export async function updateCover() {
  const cover = main.querySelector('.hero');
  if (!cover) return;
  cover.querySelector('#cover-title span').textContent = 'Capire,';
  cover.querySelector('.hero-copy p').textContent =
    'Un argomento alla volta: spiegazioni, esempi e strumenti per studiare. Riprendi dal tuo quaderno oppure scegli cosa esplorare.';
  cover.querySelector('.hero-actions').innerHTML =
    link(state.user ? 'Riprendi lo studio' : 'Scegli un percorso', state.user ? 'studio' : 'discipline', true) +
    link('Esplora le risorse', 'risorse');
  const helper = document.createElement('p');
  helper.className = 'resource-cover-note';
  helper.innerHTML = 'Insegni? Apri uno strumento, prepara un caso e richiamalo nelle tue spiegazioni. ' +
    '<a href="#raccolte">Le tue raccolte</a>';
  cover.querySelector('.hero-copy').append(helper);
  const directory = await api('/v1/disciplines').catch(() => null);
  if (!cover?.isConnected) return;
  const subjects = directory?.disciplines.filter(subject => subject.route !== 'percorsi') || [];
  if (subjects.length) {
    const entry = document.createElement('section');
    entry.className = 'resource-subjects';
    entry.setAttribute('aria-label', 'Altre materie');
    entry.innerHTML = '<h2>Altre materie</h2>' + subjects.map(subject =>
      link(subject.title, 'disciplina/' + encodeURIComponent(subject.id))).join('');
    cover.after(entry);
  }
  const index = main.querySelector('#cover-index');
  index.textContent = 'Fisica per Medicina';
  index.parentElement.classList.add('discipline-intro');
  index.parentElement.querySelector('p').innerHTML =
    'Lezioni e pratica, con strumenti collegati agli argomenti. <a href="#sprint">Preparazione all’esame</a>';
}

export function updateSearch(page, subject) {
  const search = document.querySelector('.mast-search');
  const inSubject = page === 'disciplina' && subject;
  search.href = inSubject ? '#disciplina/' + encodeURIComponent(subject) + '/%40cerca' : '#percorsi/cerca';
  search.title = inSubject ? 'Cerca in questa materia' : 'Cerca nei percorsi di Fisica';
}
