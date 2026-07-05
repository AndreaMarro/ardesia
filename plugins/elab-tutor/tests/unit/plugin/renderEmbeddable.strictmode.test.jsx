// ELAB-AS-PLUGIN-CANON §6 — il contratto di renderEmbeddable() deve reggere
// l'host reale: un effect React con cleanup, che StrictMode (dev) monta,
// smonta e rimonta SULLO STESSO container. Trovato firsthand nella vista
// ELAB Lab: unmount sincrono nel cleanup = errore React "Attempted to
// synchronously unmount a root while React was already rendering"; unmount
// solo-differito = "createRoot() on a container that has already been passed
// to createRoot()". Il contratto: nodo di mount proprio per ogni chiamata,
// dispose differito e idempotente.

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { renderEmbeddable } from '../../../src/plugin/renderEmbeddable';

const flush = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));

function HostView({ containerRef }) {
    React.useEffect(() => {
        const handle = renderEmbeddable(containerRef.current, { experiment: null });
        return () => handle.dispose();
    }, [containerRef]);
    return null;
}

describe('renderEmbeddable — host React con StrictMode (contratto §6)', () => {
    it('mount+cleanup+remount StrictMode sullo stesso container: zero errori React di root', async () => {
        const reactRootErrors = [];
        const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
            const text = args.map(String).join(' ');
            if (/unmount a root|already been passed to createRoot/i.test(text)) {
                reactRootErrors.push(text);
            }
        });

        const outer = document.createElement('div');
        const inner = document.createElement('div');
        outer.appendChild(inner);
        document.body.appendChild(outer);
        const containerRef = { current: inner };

        const hostRoot = createRoot(outer.appendChild(document.createElement('div')));
        hostRoot.render(
            <React.StrictMode>
                <HostView containerRef={containerRef} />
            </React.StrictMode>,
        );
        await flush();

        // Il simulatore e' montato (un solo mount vivo anche dopo il doppio giro StrictMode).
        expect(inner.childElementCount).toBeGreaterThan(0);

        hostRoot.unmount();
        await flush();

        spy.mockRestore();
        expect(reactRootErrors).toEqual([]);
        // Dopo il dispose il container torna vuoto (nessun nodo orfano).
        expect(inner.childElementCount).toBe(0);
        outer.remove();
    });

    it("dispose() idempotente: la seconda chiamata non lancia e non lascia nodi", async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const handle = renderEmbeddable(container, { experiment: null });
        await flush();

        handle.dispose();
        expect(() => handle.dispose()).not.toThrow();
        await flush();
        expect(container.childElementCount).toBe(0);
        container.remove();
    });

    it('rimontare subito sullo stesso container (dispose ancora in volo) funziona', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const first = renderEmbeddable(container, { experiment: null });
        await flush();
        first.dispose();
        // Nessun flush: il remount avviene PRIMA che l'unmount differito giri.
        const second = renderEmbeddable(container, { experiment: null });
        await flush();

        expect(container.childElementCount).toBeGreaterThan(0);
        second.dispose();
        await flush();
        expect(container.childElementCount).toBe(0);
        container.remove();
    });
});
