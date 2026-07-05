// Host boundary (ELAB-AS-PLUGIN-CANON §6): il plugin non possiede auth.
// L'identità arriva dall'host; senza host il guest è anonimo, con la stessa
// forma del vecchio AuthContext (sostituzione LSP del caso non-autenticato).
import { describe, it, expect, afterEach } from 'vitest';
import { useHostIdentity, setHostIdentity } from '../../../src/plugin/hostIdentity';

afterEach(() => setHostIdentity(null));

describe('hostIdentity (guest senza host = anonimo)', () => {
    it('espone la stessa forma di AuthContext con i default non-autenticato', () => {
        const id = useHostIdentity();
        expect(id.user).toBeNull();
        expect(id.loading).toBe(false);
        expect(id.isAuthenticated).toBe(false);
        expect(id.isAdmin).toBe(false);
        expect(id.isDocente).toBe(false);
        expect(id.isStudente).toBe(false);
        expect(id.hasLicense).toBe(false);
        expect(id.licenseExpired).toBe(false);
        expect(typeof id.logout).toBe('function');
        expect(typeof id.activateLicense).toBe('function');
    });

    it('le operazioni auth-only falliscono esplicite, non lanciano', async () => {
        const id = useHostIdentity();
        const res = await id.activateLicense('QUALSIASI-CODICE');
        expect(res.success).toBe(false);
        expect(String(res.error)).toMatch(/host/i);
    });

    it("l'host può iniettare un'identità e il plugin la riflette", () => {
        setHostIdentity({ user: { id: 'u1', ruolo: 'docente' }, isDocente: true });
        const id = useHostIdentity();
        expect(id.user.id).toBe('u1');
        expect(id.isDocente).toBe(true);
    });
});
