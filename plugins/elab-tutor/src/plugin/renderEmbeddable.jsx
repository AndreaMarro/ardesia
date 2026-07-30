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
// Portata verificata prima di importarlo: 965 righe, 748 variabili, 20 regole
// non-`:root` tutte class-scoped (`.elab-simulator`, `.u-*`, `.sr-only`,
// `.skip-to-content`) — nessun selettore su `body` o `*`. I due nomi in comune
// con lo studio (`--color-primary`, `--color-primary-light`) NON collidono: lo
// studio non li dichiara a `:root`, li dichiara dentro `.excalidraw`, e una
// custom property si eredita dall'antenato piu' vicino.
//
// Il gate e' `apps/studio/e2e/elab-lab-canvas-colors.spec.ts`, e2e e non unit
// perche' jsdom non applica i fogli importati dai moduli: li' un test su questo
// difetto sarebbe verde per costruzione.
import '../styles/design-system.css';
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
