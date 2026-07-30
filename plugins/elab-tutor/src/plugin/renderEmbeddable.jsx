// ELAB-AS-PLUGIN-CANON §6 — MOUNT-CANVAS: unico entry-point embeddable del
// Simulation Plugin. L'host monta il canvas del simulatore (l'unica IP senza
// equivalente Core); shell/auth/memoria/report restano al Core.
import { createRoot } from 'react-dom/client';
// Il plugin porta il canvas E i suoi token. Senza questo import l'host montava
// il disegno e non i colori: misurato sulla produzione il 2026-07-31, sulla
// rotta ELAB Lab, 45 custom property distinte usate in `fill`/`stroke` e
// NESSUNA definita, su ~1700 elementi. Un `var()` irrisolto rende la proprieta'
// invalida e `fill` cade sul valore iniziale, che e' NERO: breadboard, batteria
// e componenti si vedevano come blocchi neri pieni.
//
// I nomi contengono il valore (`--elab-hex-bdbdbd` = #bdbdbd): una sostituzione
// automatica degli hex letterali con `var(...)`, mai seguita dal foglio che li
// definisce lungo QUESTO percorso di mount. Nell'app elab-tutor il foglio
// arriva dall'entry, e li' il difetto non si vede — per questo e' sopravvissuto.
//
// SI IMPORTANO I TOKEN, NON IL DESIGN SYSTEM. La prima riparazione importava
// `design-system.css` intero, e il revisore avversariale l'ha smontata con una
// sonda A/B: quel foglio contiene DUE regole davvero globali —
// `:focus-visible` e `:focus:not(:focus-visible)` — che colpivano la shell
// dello studio. Il link «Continuita'» prendeva outline navy ELAB
// rgb(30, 77, 140) e la shadow ELAB, su una rotta dove il canvas non viene
// montato affatto: `ElabLab` importa questo modulo staticamente, quindi il CSS
// arriva anche quando l'esperimento non esiste.
//
// La mia misura di portata aveva un buco: cercavo i selettori globali con
// `^(body|html|\*|:root)` e `^[a-zA-Z.#\[]`, e una regola che comincia con
// `:focus-visible` non e' matchata da NESSUNO dei due.
//
// `design-tokens.css` e' il blocco `:root` SPOSTATO fuori (732 token, nessuna
// copia): `design-system.css` lo reimporta come prima riga, quindi l'app
// elab-tutor non cambia, e qui entrano token e ZERO regole.
//
// Il gate e' `apps/studio/e2e/elab-lab-canvas-colors.spec.ts`, e2e e non unit
// perche' jsdom non applica i fogli importati dai moduli: li' un test su questo
// difetto sarebbe verde per costruzione.
import '../styles/design-tokens.css';
import SimulatorCanvas from '../components/simulator/canvas/SimulatorCanvas';

export const pluginManifest = Object.freeze({
    kind: 'plugin', // enum ArdesiaModuleKindSchema (apps/studio/src/toolhost-protocol/manifest.ts)
    id: 'elab-simulature',
    name: 'ELAB Simulation Plugin',
    version: '0.1.0',
    embeddable: true,
});

/**
 * Monta il simulatore dentro il container dell'host.
 *
 * Ogni chiamata crea un proprio nodo di mount (display: contents) e un proprio
 * root React: l'host tipico è un effect con cleanup che StrictMode (dev)
 * monta, smonta e rimonta sullo stesso container — un root creato sul
 * container nudo collide (`createRoot()` doppio) e l'unmount sincrono nel
 * cleanup è vietato da React ("Attempted to synchronously unmount a root
 * while React was already rendering"). dispose() è idempotente e differisce
 * l'unmount al task successivo, poi rimuove il nodo di mount.
 *
 * @param {HTMLElement} container nodo DOM fornito dall'host (ToolHost embed)
 * @param {object} props props di SimulatorCanvas (experiment, callbacks, …)
 * @returns {{ dispose(): void }} handle per lo smontaggio
 */
export function renderEmbeddable(container, props = {}) {
    if (!container) {
        throw new Error('renderEmbeddable: container mancante (fornito dall\'host)');
    }
    const mountNode = document.createElement('div');
    mountNode.style.display = 'contents';
    container.appendChild(mountNode);
    const root = createRoot(mountNode);
    root.render(<SimulatorCanvas {...props} />);
    let disposed = false;
    return {
        dispose() {
            if (disposed) return;
            disposed = true;
            setTimeout(() => {
                root.unmount();
                mountNode.remove();
            }, 0);
        },
    };
}
