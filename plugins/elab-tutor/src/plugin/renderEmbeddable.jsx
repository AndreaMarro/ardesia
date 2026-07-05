// ELAB-AS-PLUGIN-CANON §6 — MOUNT-CANVAS: unico entry-point embeddable del
// Simulation Plugin. L'host monta il canvas del simulatore (l'unica IP senza
// equivalente Core); shell/auth/memoria/report restano al Core.
import { createRoot } from 'react-dom/client';
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
