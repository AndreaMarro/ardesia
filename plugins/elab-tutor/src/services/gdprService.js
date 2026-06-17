// ============================================
// ELAB Tutor - Servizio GDPR/COPPA Compliance
// Gestione privacy, consenso, esportazione ed eliminazione dati
// © Andrea Marro — 15/02/2026
// ============================================

import logger from '../utils/logger';

const GDPR_WEBHOOK_URL = import.meta.env.VITE_N8N_GDPR_URL || '';
const DATA_SERVER_URL = (import.meta.env.VITE_DATA_SERVER_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'elab_auth_token';

function _getAuthToken() {
    try { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

/**
 * Chiamata generica al webhook GDPR backend
 * Priorità: data server (autenticato) → n8n webhook (legacy) → locale
 * @param {string} action - Azione da eseguire
 * @param {Object} data - Dati da inviare
 * @returns {Promise<Object>}
 */
async function callGdprWebhook(action, data) {
    const token = _getAuthToken();

    // Try data server first (authenticated, GDPR-compliant)
    if (DATA_SERVER_URL && token && action === 'delete') {
        try {
            const userId = data.userId;
            const response = await fetch(`${DATA_SERVER_URL}/api/student/${encodeURIComponent(userId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                signal: AbortSignal.timeout(10000),
            });
            if (response.ok) {
                return await response.json();
            }
        } catch {
            logger.warn('[GDPR] Data server non raggiungibile, fallback n8n');
        }
    }

    // Fallback: n8n webhook (legacy, unauthenticated)
    if (GDPR_WEBHOOK_URL) {
        const response = await fetch(GDPR_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({ action, ...data }),
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `Errore GDPR (${response.status})`);
        }

        return await response.json();
    }

    // No server configured — local only
    logger.warn('[GDPR] Nessun server GDPR configurato — operazione locale');
    return { success: true, action, local: true, message: 'Operazione registrata localmente' };
}

// ============================================
// CONSENT MANAGEMENT
// ============================================

const CONSENT_STORAGE_KEY = 'elab_gdpr_consent';

/**
 * Stati del consenso GDPR
 * - pending: nessuna scelta
 * - parental_required: richiesto consenso parentale
 * - parental_sent: email inviata al genitore
 * - parental_verified: consenso parentale confermato
 * - accepted: consenso standard (≥16 anni)
 * - rejected: consenso rifiutato
 */

/**
 * Salva stato consenso GDPR
 * @param {Object} consentData
 */
export function saveConsent(consentData) {
    try {
        const data = {
            ...consentData,
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        logger.error('[GDPR] Errore salvataggio consenso:', error);
        return false;
    }
}

/**
 * Ottieni stato consenso GDPR
 * @returns {Object|null}
 */
export function getConsent() {
    try {
        const data = localStorage.getItem(CONSENT_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Verifica se il consenso è valido
 * @returns {boolean}
 */
function hasValidConsent() {
    const consent = getConsent();
    if (!consent) return false;
    
    // Consenso valido se: accepted o parental_verified
    const validStatuses = ['accepted', 'parental_verified'];
    return validStatuses.includes(consent.status);
}

/**
 * Verifica se è richiesto il consenso parentale
 * @returns {boolean}
 */
function requiresParentalConsent() {
    const consent = getConsent();
    if (!consent) return false;
    return consent.status === 'parental_required' || consent.status === 'parental_sent';
}

// ============================================
// DATA SUBJECT RIGHTS (GDPR Art. 15-22)
// ============================================

/**
 * Richiedi esportazione dati (Art. 20 - Portabilità)
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function requestDataExport(userId) {
    try {
        return await callGdprWebhook('export', { userId });
    } catch (error) {
        logger.error('[GDPR] Errore esportazione:', error);
        throw error;
    }
}

/**
 * Richiedi eliminazione dati (Art. 17 - Diritto all'oblio)
 * @param {string} userId
 * @param {string} password
 * @param {string} reason
 * @returns {Promise<Object>}
 */
export async function requestDataDeletion(userId, password, reason) {
    try {
        const result = await callGdprWebhook('delete', {
            userId,
            password,
            reason,
            timestamp: new Date().toISOString(),
        });

        // Elimina anche i dati locali
        clearLocalData();

        return result;
    } catch (error) {
        logger.error('[GDPR] Errore eliminazione:', error);
        throw error;
    }
}

/**
 * Richiedi rettifica dati (Art. 16)
 * @param {string} userId
 * @param {Object} corrections
 * @returns {Promise<Object>}
 */
async function requestDataCorrection(userId, corrections) {
    try {
        return await callGdprWebhook('correct', { userId, corrections });
    } catch (error) {
        logger.error('[GDPR] Errore rettifica:', error);
        throw error;
    }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
}

/**
 * Revoca consenso (Art. 7)
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function revokeConsent(userId) {
    try {
        const result = await callGdprWebhook('revoke', { userId });

        // Aggiorna stato locale
        const consent = getConsent();
        if (consent) {
            saveConsent({ ...consent, status: 'revoked', revokedAt: new Date().toISOString() });
        }

        return result;
    } catch (error) {
        logger.error('[GDPR] Errore revoca:', error);
        throw error;
    }
}

// ============================================
// LOCAL DATA MANAGEMENT
// ============================================

/**
 * Elimina tutti i dati locali dell'utente
 */
function clearLocalData() {
    const keysToRemove = [];
    
    // Raccoglie tutte le chiavi elab_
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('elab_')) {
            keysToRemove.push(key);
        }
    }
    
    // Rimuove dallo storage
    keysToRemove.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch {
            // ignore
        }
    });
    
    // Rimuove anche da sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('elab_')) {
            sessionKeysToRemove.push(key);
        }
    }
    
    sessionKeysToRemove.forEach(key => {
        try {
            sessionStorage.removeItem(key);
        } catch {
            // ignore
        }
    });
}

/**
 * Ottieni riepilogo dati locali
 * @returns {Object}
 */
function getLocalDataSummary() {
    const summary = {
        localStorage: {},
        sessionStorage: {},
        approximateSize: 0,
    };
    
    // Scansiona localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('elab_')) {
            try {
                const value = localStorage.getItem(key);
                summary.localStorage[key] = value ? JSON.parse(value) : null;
                summary.approximateSize += value ? value.length : 0;
            } catch {
                summary.localStorage[key] = '[Non parsabile]';
            }
        }
    }
    
    // Scansiona sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('elab_')) {
            try {
                const value = sessionStorage.getItem(key);
                summary.sessionStorage[key] = value ? JSON.parse(value) : null;
                summary.approximateSize += value ? value.length : 0;
            } catch {
                summary.sessionStorage[key] = '[Non parsabile]';
            }
        }
    }
    
    return summary;
}

// ============================================
// PARENTAL CONSENT
// ============================================

/**
 * Richiedi consenso parentale
 * @param {Object} data - { childName, childAge, parentEmail, parentName, consentMethod }
 * @returns {Promise<Object>}
 */
async function requestParentalConsent(data) {
    try {
        const result = await callGdprWebhook('parental-consent', {
            ...data,
            timestamp: new Date().toISOString(),
            requiresCOPPA: data.childAge < 13,
        });

        // Salva stato locale
        saveConsent({
            status: 'parental_sent',
            childAge: data.childAge,
            parentEmail: data.parentEmail,
            sentAt: new Date().toISOString(),
        });

        return result;
    } catch (error) {
        logger.error('[GDPR] Errore consenso parentale:', error);
        throw error;
    }
}

/**
 * Verifica stato consenso parentale
 * @param {string} token - Token di verifica
 * @returns {Promise<Object>}
 */
async function verifyParentalConsent(token) {
    try {
        const result = await callGdprWebhook('verify-parental-consent', { token });

        // Aggiorna stato locale
        if (result.verified) {
            saveConsent({
                status: 'parental_verified',
                verifiedAt: new Date().toISOString(),
            });
        }

        return result;
    } catch (error) {
        logger.error('[GDPR] Errore verifica consenso:', error);
        throw error;
    }
}

// ============================================
// COPPA COMPLIANCE
// ============================================

/**
 * Verifica se l'utente è soggetto a COPPA (<13 anni)
 * @param {number} age
 * @returns {boolean}
 */
export function isCOPPAApplicable(age) {
    return age < 13;
}

/**
 * Ottieni requisiti COPPA per l'età
 * @param {number} age
 * @returns {Object}
 */
function getCOPPARequirements(age) {
    return {
        applicable: age < 13,
        requiresVerifiedConsent: age < 13,
        requiresEmailVerification: age < 13,
        requiresDocumentSignature: age < 13,
        minimumAge: 13,
        documentationRequired: true,
    };
}

// ============================================
// PRIVACY BY DESIGN
// ============================================

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Minimizza dati raccolti
 * @param {Object} data - Dati originali
 * @param {Array} allowedFields - Campi consentiti
 * @returns {Object}
 */
function minimizeData(data, allowedFields) {
    const minimized = {};
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            minimized[field] = data[field];
        }
    });
    return minimized;
}

/**
 * Pseudonimizza ID utente con SHA-256 (irreversibile)
 * @param {string} userId
 * @returns {Promise<string>} Hash hex troncato a 16 caratteri
 */
async function pseudonymizeUserId(userId) {
    const salt = 'elab-tutor-2026';
    const data = new TextEncoder().encode(salt + userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16);
}

/**
 * Controlla se i dati sono scaduti (retention policy)
 * @param {string} date - Data ISO
 * @param {number} maxDays - Giorni massimi
 * @returns {boolean}
 */
function isDataExpired(date, maxDays = 730) { // 2 anni default
    const dataDate = new Date(date);
    const expiryDate = new Date(dataDate.getTime() + (maxDays * 24 * 60 * 60 * 1000));
    return new Date() > expiryDate;
}

// ============================================
// EXPORTS
// ============================================

export default {
    saveConsent,
    getConsent,
    hasValidConsent,
    requiresParentalConsent,
    requestDataExport,
    requestDataDeletion,
    requestDataCorrection,
    revokeConsent,
    clearLocalData,
    getLocalDataSummary,
    requestParentalConsent,
    verifyParentalConsent,
    isCOPPAApplicable,
    getCOPPARequirements,
    minimizeData,
    pseudonymizeUserId,
    isDataExpired,
};
