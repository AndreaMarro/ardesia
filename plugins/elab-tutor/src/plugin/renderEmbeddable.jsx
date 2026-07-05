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
 * @param {HTMLElement} container nodo DOM fornito dall'host (ToolHost embed)
 * @param {object} props props di SimulatorCanvas (experiment, callbacks, …)
 * @returns {{ dispose(): void }} handle per lo smontaggio
 */
export function renderEmbeddable(container, props = {}) {
    if (!container) {
        throw new Error('renderEmbeddable: container mancante (fornito dall\'host)');
    }
    const root = createRoot(container);
    root.render(<SimulatorCanvas {...props} />);
    return {
        dispose() {
            root.unmount();
        },
    };
}
