// Host boundary (ELAB-AS-PLUGIN-CANON §6): l'identità è un concern del Core host.
// Il plugin NON possiede auth: finché l'host non inietta un'identità via contratto
// ToolHost, il guest opera da anonimo. Stessa forma del vecchio AuthContext, così
// i consumer restano sostituibili (LSP) sul caso non-autenticato.

function unavailable(operation) {
    return async () => ({
        success: false,
        error: `${operation}: identità gestita dall'host, non disponibile nel plugin`,
    });
}

const ANONYMOUS = Object.freeze({
    user: null,
    loading: false,
    hasLicense: false,
    licenseExpired: false,
    isAuthenticated: false,
    isAdmin: false,
    isDocente: false,
    isStudente: false,
    login: unavailable('login'),
    register: unavailable('register'),
    logout: () => {},
    activateLicense: unavailable('activateLicense'),
    refreshUser: async () => null,
});

let hostIdentity = null;

/** L'host (ToolHost) inietta l'identità; null la revoca (torna anonimo). */
export function setHostIdentity(identity) {
    hostIdentity = identity;
}

/** Identità corrente vista dal plugin: quella dell'host, o l'anonimo. */
export function useHostIdentity() {
    return hostIdentity ? { ...ANONYMOUS, ...hostIdentity } : ANONYMOUS;
}
