import { models } from './models.js';

const number = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 4 });
const fixed = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const base = { r: 1, dp: 200, eta: 4 };
const baseFlow = models.C2(base).q;

export function previewOfficina() {
  return '<esperimento-portata></esperimento-portata>';
}

export function vignetta(pose) {
  return `<svg class="vignetta" viewBox="0 0 120 96" aria-hidden="true" focusable="false"><use href="/identita/gesti.svg#${pose}"></use></svg>`;
}

class EsperimentoPortata extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount) return;
    this.innerHTML = `<section class="indagine" aria-labelledby="prova-titolo">
      <div class="indagine-testo">
        <p class="indagine-materia">Un esperimento di Fluidi</p>
        <h2 id="prova-titolo" tabindex="-1">Dimezza il raggio.<br><em>Quanto liquido passa?</em></h2>
        <p>Due tubi lunghi uguali. La stessa differenza di pressione spinge un liquido viscoso. Nel secondo tubo il raggio è la metà. Quanto liquido raccogli nello stesso tempo?</p>
        <fieldset class="ipotesi"><legend>Fai una previsione</legend>
          <button type="button" value="2" aria-pressed="false">La metà</button>
          <button type="button" value="4" aria-pressed="false">Un quarto</button>
          <button type="button" value="16" aria-pressed="false">Un sedicesimo</button>
        </fieldset>
        <p class="riscontro" role="status" aria-live="polite"></p>
        <a class="textbtn" href="#lab/LAB-C2/C2">Apri il banco dei fluidi <span aria-hidden="true">↗</span></a>
      </div>
      <figure class="indagine-tavola">
        <svg viewBox="0 0 440 200" role="img" aria-label="Confronto in scala fra le sezioni interne di due tubi. Il tubo di riferimento ha raggio un millimetro.">
          <defs><pattern id="sezione-tratto" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M1 0v8" stroke="#5936ae" stroke-width="1.25"/></pattern></defs>
          <g stroke="#221c30" stroke-width="2.5">
            <circle cx="106" cy="89" r="69" fill="#e4dcfa"/>
            <circle cx="325" cy="89" r="69" fill="none" stroke-dasharray="3 6" stroke-width="1.4"/>
            <circle id="raggio-campione" cx="325" cy="89" r="34.5" fill="url(#sezione-tratto)"/>
            <path d="M106 89h69" fill="none"/><path id="quota-campione" d="M325 89h34.5" fill="none"/>
            <circle cx="106" cy="89" r="2.7" fill="#221c30"/><circle cx="325" cy="89" r="2.7" fill="#221c30"/>
          </g>
          <g text-anchor="middle" fill="#221c30" font-family="Work Sans, sans-serif" font-size="16" font-weight="650">
            <text x="106" y="182">r₁ = 1,00 mm</text><text id="didascalia-campione" x="325" y="182">r₂ = 0,50 mm</text>
          </g>
        </svg>
        <figcaption>Sezioni dei condotti, viste di fronte e disegnate alla stessa scala.</figcaption>
        <div class="misura-portata" hidden>
          <label for="raggio-anteprima">Cambia il raggio del secondo tubo</label>
          <input id="raggio-anteprima" type="range" min="0.5" max="1" step="0.05" value="0.5">
          <div class="confronto-flusso"><span>Portata rispetto al primo tubo</span><strong id="valore-portata"></strong></div>
          <div class="scala-portata" aria-hidden="true"><i></i></div>
          <p id="conto-portata" aria-live="polite"></p>
        </div>
      </figure>
    </section>`;
    const slider = this.querySelector('input');
    const result = this.querySelector('.riscontro');
    const controls = this.querySelector('.misura-portata');
    const draw = () => {
      const radius = Number(slider.value);
      const ratio = models.C2({ ...base, r: radius }).q / baseFlow;
      this.querySelector('#raggio-campione').setAttribute('r', 69 * radius);
      this.querySelector('#quota-campione').setAttribute('d', `M325 89h${69 * radius}`);
      this.querySelector('#didascalia-campione').textContent = `r₂ = ${fixed.format(radius)} mm`;
      this.querySelector('#valore-portata').textContent = number.format(100 * ratio) + ' %';
      this.querySelector('.scala-portata i').style.width = 100 * ratio + '%';
      const fraction = radius === 0.5 ? '= 1/16 = 0,0625' : radius === 1 ? '= 1' : '≈ ' + number.format(ratio);
      this.querySelector('#conto-portata').textContent = `Q₂/Q₁ = (r₂/r₁)⁴ = (${fixed.format(radius)}/1,00)⁴ ${fraction}.`;
      slider.setAttribute('aria-valuetext', fixed.format(radius) + ' millimetri');
    };
    const why = {
      2: 'Hai seguito il raggio. Riducendolo, però, diminuiscono sia la sezione attraversata sia la velocità media del liquido.',
      4: 'Hai riconosciuto il rapporto fra le aree. A parità di differenza di pressione, anche la velocità media scende a un quarto.',
      16: 'Sì. La sezione scende a un quarto e la velocità media a un quarto. Moltiplicando i due fattori ottieni un sedicesimo.',
    };
    this.querySelectorAll('.ipotesi button').forEach((choice) => {
      choice.addEventListener('click', () => {
        this.querySelectorAll('.ipotesi button').forEach((button) =>
          button.setAttribute('aria-pressed', String(button === choice)),
        );
        result.textContent = why[choice.value] + (choice.value === '16' ? '' : ' Raccogli un sedicesimo del volume iniziale.');
        if (!this.querySelector('.condizioni')) {
          const note = document.createElement('p');
          note.className = 'condizioni';
          note.textContent = 'La legge di Poiseuille vale qui per un liquido newtoniano in moto laminare stazionario, in tubi cilindrici rigidi. Lunghezza, viscosità e differenza di pressione restano uguali.';
          this.querySelector('.indagine-tavola').append(note);
        }
        slider.value = '0.5';
        controls.hidden = false;
        draw();
      });
    });
    slider.addEventListener('input', draw);
    draw();
  }
}

customElements.define('esperimento-portata', EsperimentoPortata);

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-prova-portata]')) {
    const title = document.getElementById('prova-titolo');
    title?.focus({ preventScroll: true });
    title?.scrollIntoView({ block: 'start' });
    return;
  }
  const portrait = event.target.closest('[data-mascotte]');
  if (!portrait) return;
  const active = portrait.getAttribute('aria-pressed') !== 'true';
  portrait.setAttribute('aria-pressed', String(active));
  const img = portrait.querySelector('img');
  if (img) img.src = active ? '/identita/copertina-attiva.svg' : '/identita/copertina.svg';
});
