const number = new Intl.NumberFormat('it-IT', {maximumFractionDigits: 6});
const fmt = value => number.format(Object.is(value, -0) ? 0 : value);
const increments = [-1, -0.5, -0.1, -0.01, 0, 0.01, 0.1, 0.5, 1];
const polynomial = (coefficients, x) => coefficients.reduceRight((v, c) => v * x + c, 0);

function formula(coefficients) {
  const powers = ['', 'x', 'x²', 'x³'];
  return [...coefficients].map((value, i) => {
    if (!value) return '';
    const abs = Math.abs(value);
    return (value < 0 ? ' − ' : ' + ') + (i && abs === 1 ? '' : fmt(abs)) + powers[i];
  }).reverse().join('').replace(/^ \+ /, '').trim() || '0';
}

export function polynomialLab(spec, setting) {
  const c = spec?.coefficients;
  if (!Array.isArray(c) || c.length < 1 || c.length > 4 || !c.every(v => Number.isFinite(v) && Math.abs(v) <= 1000)) return;
  const f = x => polynomial(c, x);
  if (spec.kind === 'secant') {
    const a = spec.point;
    if (!Number.isFinite(a) || Math.abs(a) > 2 || !Number.isInteger(setting) || !(setting in increments)) return;
    const h = increments[setting], b = a + h;
    const derivative = polynomial(c.slice(1).map((v, i) => v * (i + 1)), a);
    const slope = h === 0 ? derivative : (f(b) - f(a)) / h;
    return {f, min: a - 1.2, max: a + 1.2, a, b, h, fa: f(a), fb: f(b), slope, derivative,
      line: x => f(a) + slope * (x - a)};
  }
  if (spec.kind === 'riemann') {
    const interval = spec.interval;
    if (!Array.isArray(interval) || interval.length !== 2 || !interval.every(v => Number.isFinite(v) && Math.abs(v) <= 2)) return;
    const [min, max] = interval;
    if (!(max > min) || !Number.isInteger(setting) || setting < 1 || setting > 12) return;
    const width = (max - min) / setting;
    const rectangles = Array.from({length: setting}, (_, i) => {
      const x = min + i * width, height = f(x);
      return {x, height, area: width * height};
    });
    const primitive = [0, ...c.map((v, i) => v / (i + 1))];
    return {f, min, max, width, rectangles, sum: rectangles.reduce((a, r) => a + r.area, 0),
      integral: polynomial(primitive, max) - polynomial(primitive, min)};
  }
}

function drawing(model) {
  const {min, max, f, rectangles, line} = model;
  const xs = Array.from({length: 97}, (_, i) => min + (max - min) * i / 96);
  const ys = [0, ...xs.map(f)];
  if (line) ys.push(line(min), line(max));
  const low = Math.min(...ys), high = Math.max(...ys), span = high - low || 1;
  const px = x => 36 + (x - min) / (max - min) * 360;
  const py = y => 189 - (y - low + span * .08) / (span * 1.16) * 162;
  const coords = (x, y) => px(x).toFixed(2) + ',' + py(y).toFixed(2);
  const bars = rectangles?.map(r => `<rect x="${px(r.x)}" y="${Math.min(py(0), py(r.height))}" width="${360 / rectangles.length}"
    height="${Math.abs(py(0) - py(r.height))}" class="mathlab-bar"/>`).join('') || '';
  const secant = line ? `<line x1="36" y1="${py(line(min))}" x2="396" y2="${py(line(max))}" class="mathlab-line"/>
    <circle cx="${px(model.a)}" cy="${py(model.fa)}" r="4.8" class="mathlab-point"/>
    <circle cx="${px(model.b)}" cy="${py(model.fb)}" r="3.5" class="mathlab-point"/>` : '';
  const ticks = [...new Set([low, high])].map(y => `<path d="M36 ${py(y)}H396" class="mathlab-grid"/><text x="29" y="${py(y) + 4}" text-anchor="end">${fmt(y)}</text>`).join('');
  return `<svg viewBox="-25 0 457 222" aria-hidden="true" focusable="false">
    ${ticks}${bars}<path d="M36 ${py(0)} H396" class="mathlab-axis"/>${min <= 0 && max >= 0 ? `<path d="M${px(0)} 15V194" class="mathlab-axis"/>` : ''}
    <polyline points="${xs.map(x => coords(x, f(x))).join(' ')}" class="mathlab-curve"/>${secant}
    <text x="36" y="215">${fmt(min)}</text><text x="396" y="215" text-anchor="end">${fmt(max)}</text>
    <text x="408" y="${py(0) + 5}">x</text><text x="35" y="15">f(x)</text></svg>`;
}

export function attachMathLab(target, spec) {
  const secant = spec?.kind === 'secant', initial = secant ? 8 : 4;
  if (!polynomialLab(spec, initial)) return;
  const name = secant ? 'Dalla secante alla tangente' : 'Dai rettangoli all’integrale';
  const label = secant ? 'Incremento h' : 'Numero di rettangoli';
  target.innerHTML = `<section class="discipline-mathlab" aria-labelledby="mathlab-title"><h2 id="mathlab-title">${name}</h2>
    <p>f(x) = ${formula(spec.coefficients)}. ${secant ? 'Segui il secondo punto mentre si avvicina a quello fissato.' : 'Ogni rettangolo usa il valore della funzione nell’estremo sinistro.'}</p>
    <div class="mathlab-graph"></div><label for="mathlab-parameter">${label}</label>
    <input id="mathlab-parameter" type="range" min="${secant ? 0 : 1}" max="${secant ? 8 : 12}" value="${initial}" step="1">
    <p class="mathlab-observation" aria-live="polite" aria-atomic="true"></p>
    <details><summary>Leggi i valori in tabella</summary><div class="mathlab-data"></div></details></section>`;
  const slider = target.querySelector('input'), observation = target.querySelector('.mathlab-observation');
  const table = target.querySelector('.mathlab-data');
  function update() {
    const model = polynomialLab(spec, Number(slider.value));
    target.querySelector('.mathlab-graph').innerHTML = drawing(model);
    if (secant) {
      slider.setAttribute('aria-valuetext', 'h uguale a ' + fmt(model.h));
      observation.textContent = model.h === 0
        ? `I punti coincidono. Il rapporto incrementale avrebbe denominatore zero. La retta tratteggiata è la tangente, con pendenza ${fmt(model.derivative)} calcolata dalla derivata.`
        : `Per h = ${fmt(model.h)} la retta tratteggiata è la secante. La sua pendenza è circa ${fmt(model.slope)}. La derivata nel punto fissato vale ${fmt(model.derivative)}.`;
      table.innerHTML = `<table><caption>Coordinate sulla curva</caption><thead><tr><th scope="col">Punto</th><th scope="col">x</th><th scope="col">f(x)</th></tr></thead>
        <tbody><tr><th scope="row">Fisso</th><td>${fmt(model.a)}</td><td>${fmt(model.fa)}</td></tr>
        <tr><th scope="row">Mobile</th><td>${fmt(model.b)}</td><td>${fmt(model.fb)}</td></tr></tbody></table>`;
    } else {
      slider.setAttribute('aria-valuetext', model.rectangles.length + ' rettangoli');
      observation.textContent = `Con ${model.rectangles.length} ${model.rectangles.length === 1 ? 'rettangolo' : 'rettangoli'} la larghezza è circa ${fmt(model.width)}. La somma con segno vale circa ${fmt(model.sum)}. L’integrale della funzione vale circa ${fmt(model.integral)}.`;
      table.innerHTML = `<table><caption>Somma delle aree con segno</caption><thead><tr><th scope="col">x sinistro</th><th scope="col">Altezza</th><th scope="col">Area con segno</th></tr></thead>
        <tbody>${model.rectangles.map(r => `<tr><td>${fmt(r.x)}</td><td>${fmt(r.height)}</td><td>${fmt(r.area)}</td></tr>`).join('')}</tbody></table>`;
    }
  }
  slider.addEventListener('input', update);
  update();
}
