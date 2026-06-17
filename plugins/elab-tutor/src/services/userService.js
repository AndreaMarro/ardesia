// ============================================
// ELAB Tutor - Servizio Utenti e Autenticazione
// Database Notion via backend webhook
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

// ============================================
// DATABASE LOCALE (localStorage)
// Persistenza completa senza server esterno
// I dati sono salvati nel browser dell'utente
// L'admin può esportare/importare tutto
// ============================================

const DB_KEYS = {
    users: 'elab_db_users',
    currentUser: 'elab_current_user',
};

const DEV_ADMIN_SEED_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ADMIN_SEED !== 'false';
const CLIENT_PRIVILEGED_ROLES_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_CLIENT_PRIVILEGED_ROLES === 'true';
const GENERIC_LOGIN_ERROR = 'Email o password non validi';
const LOGIN_GUARD = {
    keyPrefix: 'elab_login_guard_',
    maxAttempts: 5,
    lockMs: 60000,
};

// ============================================
// PROTEZIONE RUOLI: Firma HMAC sulla sessione utente
// Impedisce manipolazione ruolo admin via DevTools
// ============================================
// SECURITY: Removed VITE_SESSION_SECRET — VITE_ vars are inlined into the client bundle.
// A per-session random secret is sufficient for client-side HMAC session signing.
const SESSION_SECRET = (() => {
    let s = sessionStorage.getItem('elab_session_secret');
    if (!s) { s = crypto.randomUUID(); sessionStorage.setItem('elab_session_secret', s); }
    return s;
})();

async function signUserSession(user) {
    const payload = `${user.id}:${user.ruolo}:${user.email}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', encoder.encode(SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function verifyUserSession(user, signature) {
    if (!user || !signature) return false;
    const expected = await signUserSession(user);
    return expected === signature;
}

// Helper per leggere/scrivere dal DB locale
function dbRead(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function dbWrite(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentUserRaw() {
    try {
        const fromSession = sessionStorage.getItem(DB_KEYS.currentUser);
        if (fromSession) return fromSession;

        // Backward compatibility: migrate old localStorage session to sessionStorage
        const fromLocal = localStorage.getItem(DB_KEYS.currentUser);
        if (fromLocal) {
            sessionStorage.setItem(DB_KEYS.currentUser, fromLocal);
            localStorage.removeItem(DB_KEYS.currentUser);
            return fromLocal;
        }
    } catch {
        // ignore
    }
    return null;
}

function setCurrentUserRaw(value) {
    try {
        sessionStorage.setItem(DB_KEYS.currentUser, value);
        // Remove legacy persistence to reduce risk on shared devices
        localStorage.removeItem(DB_KEYS.currentUser);
    } catch {
        // ignore storage errors
    }
}

function clearCurrentUserRaw() {
    try {
        sessionStorage.removeItem(DB_KEYS.currentUser);
        localStorage.removeItem(DB_KEYS.currentUser);
    } catch {
        // ignore
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Hash password con SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getLoginGuard(email) {
    const key = `${LOGIN_GUARD.keyPrefix}${(email || '').toLowerCase()}`;
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return { attempts: 0, lockedUntil: 0, key };
        const parsed = JSON.parse(raw);
        return {
            attempts: Number(parsed.attempts) || 0,
            lockedUntil: Number(parsed.lockedUntil) || 0,
            key,
        };
    } catch {
        return { attempts: 0, lockedUntil: 0, key };
    }
}

function setLoginGuard(key, attempts, lockedUntil = 0) {
    try {
        sessionStorage.setItem(key, JSON.stringify({ attempts, lockedUntil }));
    } catch {
        // ignore storage errors
    }
}

function clearLoginGuard(email) {
    const key = `${LOGIN_GUARD.keyPrefix}${(email || '').toLowerCase()}`;
    try {
        sessionStorage.removeItem(key);
    } catch {
        // ignore storage errors
    }
}

// ============================================
// INIT: Crea admin di default se non esiste
// ============================================
function initializeDB() {
    const users = dbRead(DB_KEYS.users);
    if (users.length === 0 && DEV_ADMIN_SEED_ENABLED) {
        // Admin iniziale — SOLO in DEV, password deve essere impostata via UI
        const adminUser = {
            id: 'admin_001',
            nome: 'Admin Dev',
            email: 'dev@localhost',
            passwordHash: '', // Vuoto — l'admin dev deve registrarsi o usare licenseService
            avatar: '',
            bio: 'Account dev locale',
            ruolo: 'admin',
            dataRegistrazione: new Date().toISOString(),
            ultimoAccesso: new Date().toISOString(),
            stato: 'attivo',
            scuola: 'Dev',
            citta: '',
            interessi: [],
        };
        dbWrite(DB_KEYS.users, [adminUser]);

    }
}

// Inizializza al caricamento
initializeDB();

// ============================================
// RUOLI DISPONIBILI
// 'user'    — Studente (default)
// 'docente' — Professore (può monitorare studenti)
// 'admin'   — Amministratore (accesso completo)
// ============================================

// ============================================
// AUTH SERVICE
// ============================================
const authService = {
    // Registrazione
    async register({ nome, email, password, scuola, citta, ruolo }) {
        const users = dbRead(DB_KEYS.users);

        // Controlla email duplicata
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Email già registrata' };
        }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati

        const passwordHash = await hashPassword(password);
        // Ruolo: 'user' (studente) o 'docente' (professore)
        const validRoles = ['user', 'docente'];
        const userRole = validRoles.includes(ruolo) ? ruolo : 'user';

        const newUser = {
            id: generateId(),
            nome,
            email: email.toLowerCase(),
            passwordHash,
            avatar: '',
            bio: '',
            ruolo: userRole,
            dataRegistrazione: new Date().toISOString(),
            ultimoAccesso: new Date().toISOString(),
            stato: 'attivo',
            scuola: scuola || '',
            citta: citta || '',
            interessi: [],
            // Dati specifici studente
            ...(userRole === 'user' ? {
                esperimentiCompletati: [],
                tempoTotale: 0,
                ultimaAttivita: null,
                diarioEntries: [],
                concettiEsplorati: [],
                difficolta: [],
                confusioneLog: [],
                meraviglieLog: [],
            } : {}),
            // Dati specifici docente
            ...(userRole === 'docente' ? {
                classi: [],
                studentiMonitorati: [],
            } : {}),
        };

        users.push(newUser);
        dbWrite(DB_KEYS.users, users);

        // Salva sessione con firma HMAC
        const safeUser = { ...newUser };
        delete safeUser.passwordHash;
        const sig = await signUserSession(safeUser);
        setCurrentUserRaw(JSON.stringify({ ...safeUser, _sig: sig }));

        return { success: true, user: safeUser };
    },

    // Login
    async login(email, password) {
        const guard = getLoginGuard(email);
        const now = Date.now();
        if (guard.lockedUntil > now) {
            const waitSec = Math.ceil((guard.lockedUntil - now) / 1000);
            return { success: false, error: `Troppi tentativi. Riprova tra ${waitSec}s.` };
        }

        const users = dbRead(DB_KEYS.users);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            const attempts = guard.attempts + 1;
            const lockedUntil = attempts >= LOGIN_GUARD.maxAttempts ? now + LOGIN_GUARD.lockMs : 0;
            setLoginGuard(guard.key, attempts, lockedUntil);
            return { success: false, error: GENERIC_LOGIN_ERROR };
        }
        if (user.stato === 'bannato') return { success: false, error: 'Account sospeso. Contatta l\'amministratore.' };
        if (user.stato === 'sospeso') return { success: false, error: 'Account temporaneamente sospeso.' };

        const inputHash = await hashPassword(password);
        if (inputHash !== user.passwordHash) {
            const attempts = guard.attempts + 1;
            const lockedUntil = attempts >= LOGIN_GUARD.maxAttempts ? now + LOGIN_GUARD.lockMs : 0;
            setLoginGuard(guard.key, attempts, lockedUntil);
            return { success: false, error: GENERIC_LOGIN_ERROR };
        }

        clearLoginGuard(email);

        // Aggiorna ultimo accesso
        user.ultimoAccesso = new Date().toISOString();
        dbWrite(DB_KEYS.users, users);

        const safeUser = { ...user };
        delete safeUser.passwordHash;
        // Firma sessione con HMAC per proteggere il ruolo
        const sig = await signUserSession(safeUser);
        setCurrentUserRaw(JSON.stringify({ ...safeUser, _sig: sig }));

        return { success: true, user: safeUser };
    },

    // Logout
    logout() {
        clearCurrentUserRaw();
    },

    // Utente corrente — verifica firma HMAC per proteggere il ruolo
    getCurrentUser() {
        try {
            const data = getCurrentUserRaw();
            if (!data) return null;
            const parsed = JSON.parse(data);
            if (!CLIENT_PRIVILEGED_ROLES_ENABLED && parsed.ruolo === 'admin') {
                parsed.ruolo = 'user';
            }
            // Per utenti con ruolo privilegiato, la firma è obbligatoria
            // Gli utenti normali ('user') funzionano senza firma per retrocompatibilità
            if (parsed.ruolo === 'admin' || parsed.ruolo === 'docente') {
                if (!parsed._sig) {
                    // Sessione non firmata con ruolo privilegiato = manipolata
                    parsed.ruolo = 'user';
                }
                // La verifica asincrona avviene in AuthContext (vedi _verifySession)
            }
            const { _sig, ...user } = parsed;
            return user;
        } catch { return null; }
    },

    // Verifica asincrona della sessione (chiamata da AuthContext)
    async verifySession() {
        try {
            const data = getCurrentUserRaw();
            if (!data) return null;
            const parsed = JSON.parse(data);
            if (!CLIENT_PRIVILEGED_ROLES_ENABLED && parsed.ruolo === 'admin') {
                parsed.ruolo = 'user';
            }
            if (parsed.ruolo === 'admin' || parsed.ruolo === 'docente') {
                const isValid = await verifyUserSession(parsed, parsed._sig);
                if (!isValid) {
                    parsed.ruolo = 'user';
                    delete parsed._sig;
                    setCurrentUserRaw(JSON.stringify(parsed));
                }
            }
            const { _sig, ...user } = parsed;
            return user;
        } catch { return null; }
    },

    // Verifica admin
    isAdmin() {
        if (!CLIENT_PRIVILEGED_ROLES_ENABLED) return false;
        const user = this.getCurrentUser();
        return user?.ruolo === 'admin';
    },

    // Aggiorna profilo
    async updateProfile(userId, updates) {
        const users = dbRead(DB_KEYS.users);
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, error: 'Utente non trovato' };

        // Non permettere la modifica di ruolo e stato da qui
        delete updates.ruolo;
        delete updates.stato;
        delete updates.passwordHash;
        delete updates._sig;

        users[idx] = { ...users[idx], ...updates };
        dbWrite(DB_KEYS.users, users);

        const safeUser = { ...users[idx] };
        delete safeUser.passwordHash;

        // Aggiorna sessione se è l'utente corrente, con firma HMAC
        const current = this.getCurrentUser();
        if (current?.id === userId) {
            const sig = await signUserSession(safeUser);
            setCurrentUserRaw(JSON.stringify({ ...safeUser, _sig: sig }));
        }

        return { success: true, user: safeUser };
    },

    // Cambia password
    async changePassword(userId, oldPassword, newPassword) {
        const users = dbRead(DB_KEYS.users);
        const user = users.find(u => u.id === userId);
        if (!user) return { success: false, error: 'Utente non trovato' };

        const oldHash = await hashPassword(oldPassword);
        if (oldHash !== user.passwordHash) return { success: false, error: 'Password attuale errata' };

        user.passwordHash = await hashPassword(newPassword);
        dbWrite(DB_KEYS.users, users);
        return { success: true };
    },
};


// ============================================
// ADMIN SERVICE
// ============================================
const adminService = {
    // Ottieni tutti gli utenti
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    getAllUsers() {
        return dbRead(DB_KEYS.users).map(u => {
            const safe = { ...u };
            delete safe.passwordHash;
            return safe;
        });
    },

    // Cambia ruolo utente
    setUserRole(userId, ruolo) {
        const users = dbRead(DB_KEYS.users);
        const user = users.find(u => u.id === userId);
        if (!user) return false;
        user.ruolo = ruolo;
        dbWrite(DB_KEYS.users, users);
        return true;
    },

    // Banna/Sospendi utente
    setUserStatus(userId, stato) {
        const users = dbRead(DB_KEYS.users);
        const user = users.find(u => u.id === userId);
        if (!user) return false;
        user.stato = stato;
        dbWrite(DB_KEYS.users, users);
        return true;
    },

    // Elimina utente
    deleteUser(userId) {
        let users = dbRead(DB_KEYS.users);
        users = users.filter(u => u.id !== userId);
        dbWrite(DB_KEYS.users, users);
        return true;
    },

    // Statistiche
    getStats() {
        const users = dbRead(DB_KEYS.users);

        const oggi = new Date().toDateString();
        const utentiOggi = users.filter(u => new Date(u.dataRegistrazione).toDateString() === oggi).length;

        return {
            totaleUtenti: users.length,
            utentiAttivi: users.filter(u => u.stato === 'attivo').length,
            utentiBannati: users.filter(u => u.stato === 'bannato').length,
            utentiSospesi: users.filter(u => u.stato === 'sospeso').length,
            utentiOggi,
        };
    },

    // Esporta tutto il DB (backup)
    exportDB() {
        const data = {};
        Object.entries(DB_KEYS).forEach(([key, storageKey]) => {
            if (key !== 'currentUser') {
                data[key] = dbRead(storageKey);
            }
        });
        return JSON.stringify(data, null, 2);
    },

    // Importa DB (restore)
    importDB(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(DB_KEYS).forEach(([key, storageKey]) => {
                if (key !== 'currentUser' && data[key]) {
                    dbWrite(storageKey, data[key]);
                }
            });
            return { success: true };
        } catch {
            return { success: false, error: 'JSON non valido' };
        }
    },

    // Reset password utente
    async resetUserPassword(userId, newPassword) {
        const users = dbRead(DB_KEYS.users);
        const user = users.find(u => u.id === userId);
        if (!user) return false;
        user.passwordHash = await hashPassword(newPassword);
        dbWrite(DB_KEYS.users, users);
        return true;
    },
};

// ============================================
// USERS LOOKUP SERVICE
// ============================================
const usersLookup = {
    getUser(userId) {
        const users = dbRead(DB_KEYS.users);
        const user = users.find(u => u.id === userId);
        if (!user) return null;
        const safe = { ...user };
        delete safe.passwordHash;
        return safe;
    },

    getUsersByIds(ids) {
        const users = dbRead(DB_KEYS.users);
        return ids.map(id => {
            const u = users.find(user => user.id === id);
            if (!u) return { id, nome: 'Utente eliminato', avatar: '' };
            return { id: u.id, nome: u.nome, avatar: u.avatar, ruolo: u.ruolo };
        });
    },

    searchUsers(query) {
        const q = query.toLowerCase();
        return dbRead(DB_KEYS.users)
            .filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
            .map(u => ({ id: u.id, nome: u.nome, avatar: u.avatar, email: u.email, ruolo: u.ruolo }));
    },
};

export { authService, adminService, usersLookup };
