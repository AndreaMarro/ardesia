/* Disclose the existing editorial blocks without replacing their content or recording study events. */
export function passaggi(kind, blocks = []) {
  const types = blocks.map((block) => block.type);
  const figures = types.flatMap((type, i) => type === 'figure' ? [i] : []);
  if (!['example', 'worked', 'lesson'].includes(kind)) return [];

  const starts = [0];
  if (kind === 'lesson') {
    if (figures.length < 2) {
      // Keep formulas and figures with the paragraph that introduces them.
      for (let i = 1; i < types.length; i++) {
        if (types[i] === 'text' && types[i - 1] !== 'figure') starts.push(i);
      }
    }
    for (const i of figures.slice(1)) {
      // Two paragraphs before a new figure often close one configuration and introduce the next.
      starts.push(types[i - 1] === 'text' && types[i - 2] === 'text' ? i - 1 : i);
    }
  } else {
    const lastFormula = types.lastIndexOf('formula');
    for (let i = 1; i < types.length; i++) {
      const newPlate = types[i] === 'figure' &&
        types.slice(starts[starts.length - 1], i).some((type) => type === 'figure' || type === 'formula');
      const nextCalculation = types[i - 1] === 'formula' &&
        (types[i] === 'formula' || (types[i] === 'text' && i < lastFormula && types[i + 1] !== 'figure'));
      if (newPlate || nextCalculation) starts.push(i);
    }
    if (starts.length === 1) {
      const formula = types.indexOf('formula');
      const nextParagraph = types.findIndex((type, i) => type === 'text' && types[i - 1] === 'text');
      const split = formula > 0 ? formula : nextParagraph;
      if (split > 0) starts.push(split);
    }
  }
  return starts.length > 1 ? starts.map((from, i) => [from, starts[i + 1] ?? blocks.length]) : [];
}

export function installaPassaggi(container, record, onChange = () => {}) {
  const spans = passaggi(record.kind, record.blocks);
  if (!spans.length) return;
  const copy = container?.querySelector('.copy');
  if (!copy) return;
  const nodes = Array.from(copy.children);
  if (nodes.length !== record.blocks.length) return;
  copy.id = 'testo-dei-passaggi';
  const tools = document.createElement('div');
  tools.className = 'lettura-strumenti';
  tools.innerHTML = `<button type="button" class="lettura-inizia" aria-controls="testo-dei-passaggi">Un passaggio alla volta</button>
    <div class="lettura-barra" role="group" aria-label="Lettura per passaggi" hidden>
      <span class="lettura-stato" role="status" aria-live="polite" aria-atomic="true"></span>
      <div class="lettura-pulsanti">
        <button type="button" class="lettura-indietro" aria-controls="testo-dei-passaggi">Indietro</button>
        <button type="button" class="lettura-avanti solid" aria-controls="testo-dei-passaggi">Avanti</button>
        <button type="button" class="lettura-tutto textbtn" aria-controls="testo-dei-passaggi">Mostra tutto</button>
      </div>
    </div>`;
  copy.before(tools);
  const start = tools.querySelector('.lettura-inizia');
  const bar = tools.querySelector('.lettura-barra');
  const status = tools.querySelector('.lettura-stato');
  const back = tools.querySelector('.lettura-indietro');
  const next = tools.querySelector('.lettura-avanti');
  const all = tools.querySelector('.lettura-tutto');
  let current = 0;
  function show(index) {
    current = index;
    const [from, until] = spans[index];
    nodes.forEach((node, n) => { node.hidden = n < from || n >= until; });
    status.textContent = 'Passaggio ' + (index + 1) + ' di ' + spans.length;
    back.disabled = index === 0;
    next.disabled = index === spans.length - 1;
    container.dispatchEvent(new Event('lettura:passaggio'));
  }
  function setMode(mode, focus = false) {
    if ((mode === 'steps') === !bar.hidden) return;
    if (mode === 'continuous') {
      nodes.forEach((node) => { node.hidden = false; });
      bar.hidden = true;
      start.hidden = false;
      status.textContent = '';
      container.dispatchEvent(new Event('lettura:passaggio'));
      if (focus) start.focus({ preventScroll: true });
      return;
    }
    start.hidden = true;
    bar.hidden = false;
    show(0);
    if (focus) next.focus({ preventScroll: true });
  }
  start.addEventListener('click', () => {
    setMode('steps', true);
    onChange('steps');
  });
  back.addEventListener('click', () => {
    show(current - 1);
    if (back.disabled) next.focus({ preventScroll: true });
  });
  next.addEventListener('click', () => {
    show(current + 1);
    if (next.disabled) all.focus({ preventScroll: true });
  });
  all.addEventListener('click', () => {
    setMode('continuous', true);
    onChange('continuous');
  });
  return { setMode };
}

export async function lettorePersonale(container, record) {
  let reader;
  try {
    reader = await import('./preferenze-lettura.js');
  } catch {
    if (!container?.isConnected) return;
    installaPassaggi(container, record);
    const notice = document.createElement('p');
    notice.className = 'helper';
    notice.setAttribute('role', 'status');
    notice.textContent = 'Le preferenze e l’ascolto sono temporaneamente indisponibili. Puoi continuare a leggere.';
    container.prepend(notice);
    return;
  }
  if (container?.isConnected) reader.installReader(container, record);
}

export function segnaleLettori(root, event) {
  for (const container of root.querySelectorAll('[data-lettore]')) container.dispatchEvent(new Event(event));
}
