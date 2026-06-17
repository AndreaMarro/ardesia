// ============================================
// ELAB Tutor - Servizio Autenticazione Server-Side
// Netlify Functions auth con HMAC tokens
// (c) Andrea Marro — 28/02/2026 — ELAB Tutor — Tutti i diritti riservati
// ============================================

const API_BASE_URL = (import.meta.env.VITE_AUTH_URL || '').trim();
const TOKEN_KEY = 'elab_auth_token';
const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minuto di margine

// ============================================
// TOKEN HELPERS
// ============================================

function parseToken(token) {
    try {
        if (!token || !token.includes('.')) return null;
        const payloadB64 = token.split('.')[0];
        // Decode base64url
        const padding = '='.repeat((4 - (payloadB64.length % 4)) % 4);
        const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/') + padding;
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    const payload = parseToken(token);
    if (!payload || !payload.exp) return true;
    return payload.exp < (Date.now() + TOKEN_EXPIRY_BUFFER);
}

function getTokenRemainingTime(token) {
    const payload = parseToken(token);
    if (!payload || !payload.exp) return 0;
    return Math.max(0, payload.exp - Date.now());
}

// ============================================
// STORAGE HELPERS
// ============================================

function setToken(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}

function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

// ============================================
// RATE LIMITING (client-side)
// ============================================

const RATE_LIMIT_KEY = 'elab_auth_ratelimit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minuti

function getRateLimitState() {
    try {
        const data = sessionStorage.getItem(RATE_LIMIT_KEY);
        if (!data) return { attempts: 0, lockedUntil: 0 };
        return JSON.parse(data);
    } catch { return { attempts: 0, lockedUntil: 0 }; }
}

function setRateLimitState(attempts, lockedUntil = 0) {
    try {
        sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ attempts, lockedUntil }));
    } catch { /* ignore */ }
}

function clearRateLimit() {
    try { sessionStorage.removeItem(RATE_LIMIT_KEY); } catch { /* ignore */ }
}

function checkRateLimit() {
    const state = getRateLimitState();
    const now = Date.now();
    if (state.lockedUntil > now) {
        return { allowed: false, waitSec: Math.ceil((state.lockedUntil - now) / 1000) };
    }
    if (state.attempts >= MAX_ATTEMPTS) {
        const lockedUntil = now + LOCKOUT_DURATION;
        setRateLimitState(state.attempts, lockedUntil);
        return { allowed: false, waitSec: LOCKOUT_DURATION / 1000 };
    }
    return { allowed: true };
}

function incrementRateLimit() {
    const state = getRateLimitState();
    setRateLimitState(state.attempts + 1, 0);
}

// ============================================
// API CALLS
// ============================================

async function apiCall(endpoint, options = {}) {
    if (!API_BASE_URL) {
        throw new Error('VITE_AUTH_URL non configurato');
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Aggiungi token se presente
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Errore del server' }));
        if (response.status === 401 && error.loginRequired) {
            clearToken();
            throw new Error('Sessione scaduta. Effettua nuovamente il login.');
        }
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// ============================================
// AUTH SERVICE
// ============================================

/**
 * Login utente (email o username)
 * @param {string} emailOrUsername
 * @param {string} password
 * @returns {Promise<{success: boolean, user?: Object, hasLicense?: boolean, error?: string}>}
 */
export async function login(emailOrUsername, password) {
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
        return {
            success: false,
            error: `Troppi tentativi. Riprova tra ${Math.ceil(rateCheck.waitSec / 60)} minuti.`,
        };
    }

    try {
        const isEmail = emailOrUsername.includes('@');
        const body = isEmail
            ? { email: emailOrUsername.toLowerCase(), password }
            : { username: emailOrUsername, password };

        const result = await apiCall('/auth-login', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        clearRateLimit();

        if (result.token) {
            setToken(result.token);
        }

        return {
            success: true,
            user: result.user,
            hasLicense: result.hasLicense,
            licenseExpiry: result.licenseExpiry,
        };
    } catch (error) {
        incrementRateLimit();
        return { success: false, error: error.message };
    }
}

/**
 * Registrazione nuovo utente
 * @param {Object} data - { nome, email, password, ruolo, userType }
 * @returns {Promise<{success: boolean, user?: Object, error?: string}>}
 */
export async function register(data) {
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
        return {
            success: false,
            error: `Troppi tentativi. Riprova tra ${Math.ceil(rateCheck.waitSec / 60)} minuti.`,
        };
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }

    try {
        const passwordValidation = validatePassword(data.password);
        if (!passwordValidation.valid) {
            return { success: false, error: passwordValidation.error };
        }

        const result = await apiCall('/auth-register', {
            method: 'POST',
            body: JSON.stringify({
                name: data.nome || data.name,
                surname: data.cognome || data.surname || '',
                email: data.email.toLowerCase(),
                password: data.password,
                ruolo: data.ruolo || 'student',
                userType: data.userType || 'family',
            }),
        });

        clearRateLimit();

        if (result.token) {
            setToken(result.token);
        }

        return { success: true, user: result.user };
    } catch (error) {
        incrementRateLimit();
        return { success: false, error: error.message };
    }
}

/**
 * Ottieni profilo utente corrente (via token)
 * @returns {Promise<{user: Object, hasLicense: boolean, licenseExpiry: string|null}|null>}
 */
export async function getProfile() {
    try {
        const token = getToken();
        if (!token || isTokenExpired(token)) return null;
        const result = await apiCall('/auth-me');
        return {
            user: result.user,
            hasLicense: result.hasLicense,
            licenseExpiry: result.licenseExpiry,
            licenseExpired: result.licenseExpired || false,
        };
    } catch {
        return null;
    }
}

/**
 * Logout — pulisci token locale (il server invalida automaticamente alla scadenza)
 */
export async function logout() {
    clearToken();
    clearRateLimit();
}


/**
 * Attiva codice licenza sull'account utente
 * @param {string} licenseCode
 * @returns {Promise<{success: boolean, licenseExpiry?: string, kits?: string[], error?: string}>}
 */
export async function activateLicense(licenseCode) {
    try {
        const result = await apiCall('/auth-activate-license', {
            method: 'POST',
            body: JSON.stringify({ licenseCode }),
        });
        return {
            success: true,
            licenseExpiry: result.licenseExpiry,
            kits: result.kits,
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Crea account studente (solo docenti)
 * @param {Object} data - { username, password?, className? }
 * @returns {Promise<{success: boolean, student?: Object, error?: string}>}
 */
export async function createStudent(data) {
    try {
        const result = await apiCall('/auth-create-student', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { success: true, student: result.student };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Verifica se l'utente ha un token valido (non scaduto)
 * @returns {boolean}
 */
export function isAuthenticated() {
    const token = getToken();
    return !!token && !isTokenExpired(token);
}

/**
 * Ottieni ruolo utente dal token
 * @returns {string|null}
 */
export function getUserRole() {
    const token = getToken();
    if (!token) return null;
    // Il token HMAC non contiene il ruolo — il ruolo è nel profilo utente
    // Questa funzione è mantenuta per retrocompatibilità ma ritorna null
    // Usare getProfile() per il ruolo reale
    return null;
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, error: 'La password deve essere di almeno 8 caratteri' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'La password deve contenere almeno una lettera maiuscola' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'La password deve contenere almeno un numero' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, error: 'La password deve contenere almeno un carattere speciale (!@#$%...)' };
    }
    return { valid: true };
}

// ============================================
// AUTO REFRESH (token expiry awareness)
// ============================================

let refreshTimer = null;

export function startAutoRefresh(callback) {
    stopAutoRefresh();
    const token = getToken();
    if (!token) return;

    const remainingTime = getTokenRemainingTime(token);
    // Tenta refresh 10 minuti prima della scadenza
    const refreshTime = Math.max(0, remainingTime - 10 * 60 * 1000);

    refreshTimer = setTimeout(async () => {
        try {
            const currentToken = getToken();
            if (!currentToken) { if (callback) callback(); return; }
            const response = await fetch(`${API_BASE_URL}/.netlify/functions/auth-me`, {
                headers: { Authorization: `Bearer ${currentToken}` },
                signal: AbortSignal.timeout(10000),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.newToken) {
                    setToken(data.newToken);
                    startAutoRefresh(callback); // Schedule next refresh
                } else {
                    // Token still valid, schedule another check
                    startAutoRefresh(callback);
                }
            } else {
                if (callback) callback(); // Logout on failure
            }
        } catch {
            if (callback) callback();
        }
    }, refreshTime);
}

export function stopAutoRefresh() {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}

// ============================================
// CLASS MANAGEMENT (Sprint 1, Session 30)
// ============================================

/**
 * Crea una nuova classe (solo docenti)
 * @param {string} name - Nome della classe
 * @returns {Promise<{success: boolean, classCode?: string, className?: string, volumes?: string[], error?: string}>}
 */
export async function createClass(name) {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    try {
        const result = await apiCall('/auth-create-class', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
        return {
            success: true,
            classCode: result.classCode,
            className: result.className,
            volumes: result.volumes,
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Studente entra in una classe con codice
 * @param {string} classCode - Codice classe 6 caratteri
 * @returns {Promise<{success: boolean, className?: string, volumes?: string[], teacherName?: string, error?: string}>}
 */
export async function joinClass(classCode) {
    try {
        const result = await apiCall('/auth-join-class', {
            method: 'POST',
            body: JSON.stringify({ classCode }),
        });
        return {
            success: true,
            className: result.className,
            volumes: result.volumes,
            teacherName: result.teacherName,
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Elenco classi del docente
 * @returns {Promise<{success: boolean, classes?: Array, error?: string}>}
 */
export async function listClasses() {
    try {
        const result = await apiCall('/auth-list-classes');
        return { success: true, classes: result.classes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Rimuovi studente da una classe (solo docenti)
 * @param {string} classId - ID Notion della classe
 * @param {string} studentId - ID Notion dello studente
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function removeStudent(classId, studentId) {
    try {
        await apiCall('/auth-remove-student', {
            method: 'POST',
            body: JSON.stringify({ classId, studentId }),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Aggiorna i giochi attivi per una classe (solo docenti)
 * Sprint 3 Session 30: Teacher-gated games
 * @param {string} classId - ID Notion della classe
 * @param {string[]} activeGames - Array di nomi giochi attivi
 * @returns {Promise<{success: boolean, activeGames?: string[], error?: string}>}
 */
export async function updateClassGames(classId, activeGames) {
    try {
        const result = await apiCall('/auth-update-class-games', {
            method: 'POST',
            body: JSON.stringify({ classId, activeGames }),
        });
        return { success: true, activeGames: result.activeGames };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// EXPORTS
// ============================================

export default {
    login,
    register,
    logout,
    getProfile,
    activateLicense,
    createStudent,
    createClass,
    joinClass,
    listClasses,
    removeStudent,
    updateClassGames,
    isAuthenticated,
    getUserRole,
    validatePassword,
    startAutoRefresh,
    stopAutoRefresh,
};
