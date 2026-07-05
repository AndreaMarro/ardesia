// ELAB-AS-PLUGIN-CANON §6 — MOUNT-CANVAS: il plugin espone UN solo
// renderEmbeddable() consumato dall'host. Il modulo plugin non può dipendere
// da shell/auth/dashboard (concern del Core host).
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { renderEmbeddable, pluginManifest } from '../../../src/plugin/renderEmbeddable';

describe('renderEmbeddable (Simulation Plugin entry)', () => {
    it('pluginManifest dichiara kind "plugin" (enum ArdesiaModuleKind) ed embeddable', () => {
        expect(pluginManifest.kind).toBe('plugin');
        expect(pluginManifest.embeddable).toBe(true);
        expect(pluginManifest.id).toBeTruthy();
        expect(pluginManifest.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('monta il simulatore nel container e dispose() smonta', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const handle = renderEmbeddable(container, { experiment: null });
        // flush del commit React 18 concurrent
        await new Promise((r) => setTimeout(r, 0));
        expect(container.childElementCount).toBeGreaterThan(0);
        handle.dispose();
        await new Promise((r) => setTimeout(r, 0));
        expect(container.childElementCount).toBe(0);
        container.remove();
    });

    it('container mancante = errore esplicito, non silenzioso', () => {
        expect(() => renderEmbeddable(null)).toThrow(/container/i);
    });

    it('il modulo src/plugin/ non importa auth/dashboard/shell (confine host)', () => {
        const pluginDir = path.resolve(__dirname, '../../../src/plugin');
        const forbidden = /(AuthContext|authService|supabaseAuth|components\/auth\/|dashboard|\/App(\.jsx)?['"]|\/main(\.jsx)?['"])/i;
        for (const file of fs.readdirSync(pluginDir)) {
            const source = fs.readFileSync(path.join(pluginDir, file), 'utf-8');
            const imports = source.match(/(?:from|import\s*\()\s*['"][^'"]+['"]/g) ?? [];
            for (const spec of imports) {
                expect(spec, `${file}: ${spec}`).not.toMatch(forbidden);
            }
        }
    });
});
