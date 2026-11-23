/* Disclose the existing editorial blocks without replacing their content or recording study events. */
export function passaggi(kind, blocks = []) {
  const types = blocks.map((block) => block.type);
  const figures = types.flatMap((type, i) => type === 'figure' ? [i] : []);
  if (kind !== 'example' && kind !== 'worked' && (kind !== 'lesson' || figures.length < 2)) return [];

  const starts = [0];
  if (kind === 'lesson') {
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

export function installaPassaggi(container, record) {
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
  container.prepend(tools);
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
  }
  start.addEventListener('click', () => {
    start.hidden = true;
    bar.hidden = false;
    show(0);
    next.focus({ preventScroll: true });
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
    nodes.forEach((node) => { node.hidden = false; });
    bar.hidden = true;
    start.hidden = false;
    status.textContent = '';
    start.focus({ preventScroll: true });
  });
}
