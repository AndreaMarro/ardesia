// ============================================
// ELAB Tutor - Cifratura Dati Locali
// AES-256-GCM con PBKDF2 key derivation
// © Andrea Marro — 15/02/2026
// ============================================

import logger from './logger';

/**
 * Servizio di cifratura per proteggere i dati sensibili nel localStorage.
 * 
 * Algoritmi:
 * - AES-256-GCM per la cifratura
 * - PBKDF2 per la derivazione della chiave
 * - Salt: 16 bytes random per utente
 * - IV: 12 bytes random per encryption
 * 
 * Target: bambini 8-14 anni - dati emotivi, progressi, sessioni
 */

const ENCRYPTION_KEY = 'elab_encryption_key';
const MASTER_KEY_SALT = 'elab_master_salt_v1';
const PBKDF2_ITERATIONS = 100000;

// ============================================
// UTILITY
// ============================================

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    // Rimuovi eventuali spazi e normalizza il padding per evitare InvalidCharacterError in Node/Vitest
    const safeBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');
    const binary = atob(safeBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str);
}

function arrayBufferToString(buffer) {
    return new TextDecoder().decode(buffer);
}

// ============================================
// KEY DERIVATION
// ============================================

/**
 * Deriva una chiave AES-256 da una password usando PBKDF2
 * @param {string} password - Password master
 * @param {Uint8Array} salt - Salt (16 bytes)
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    // Importa la password come raw key
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    // Deriva la chiave AES-256
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// ============================================
// MASTER KEY MANAGEMENT
// ============================================

/**
 * Ottieni o genera la master key per la sessione corrente.
 * La chiave viene derivata dalla password di login dell'utente.
 * 
 * NOTA: Questa implementazione usa un approccio ibrido:
 * - Se l'utente è loggato via JWT, la password non è disponibile
 * - In questo caso, usiamo un token derivato dal JWT come "password"
 * - Alternativa: richiedere una passphrase separata all'utente
 * 
 * @param {string} jwtToken - Token JWT dell'utente (usato per derivare la chiave)
 * @returns {Promise<string>} - Master key derivata
 */
async function getOrCreateMasterKey(jwtToken) {
    try {
        // Usa una parte del JWT come base per la chiave
        // In produzione, questo dovrebbe essere un token separato o
        // la password reale dell'utente
        if (!jwtToken) {
            throw new Error('JWT token richiesto per la derivazione della chiave');
        }

        // Deriva una chiave stabile dal JWT
        const encoder = new TextEncoder();
        const data = encoder.encode(jwtToken + MASTER_KEY_SALT);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        logger.error('[Crypto] Errore derivazione master key:', error);
        throw error;
    }
}

// ============================================
// ENCRYPTION / DECRYPTION
// ============================================

/**
 * Cifra dati con AES-256-GCM
 * @param {Object} data - Dati da cifrare
 * @param {string} password - Password per la derivazione della chiave
 * @returns {Promise<Object>} - Oggetto cifrato { encrypted, iv, salt, tag }
 */
async function encrypt(data, password) {
    try {
        // Genera salt casuale (16 bytes)
        const salt = crypto.getRandomValues(new Uint8Array(16));

        // Deriva la chiave
        const key = await deriveKey(password, salt);

        // Genera IV casuale (12 bytes per GCM)
        const iv = crypto.getRandomValues(new Uint8Array(12));

        // Cifra i dati
        const encoded = stringToArrayBuffer(JSON.stringify(data));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoded
        );

        // Estrai il tag di autenticazione (gli ultimi 16 bytes del ciphertext in GCM)
        const ciphertextArray = new Uint8Array(ciphertext);
        const encryptedData = ciphertextArray.slice(0, -16);
        const authTag = ciphertextArray.slice(-16);

        return {
            encrypted: arrayBufferToBase64(encryptedData),
            iv: arrayBufferToBase64(iv),
            salt: arrayBufferToBase64(salt),
            tag: arrayBufferToBase64(authTag),
            version: '1',
            algorithm: 'AES-256-GCM',
        };
    } catch (error) {
        logger.error('[Crypto] Errore cifratura:', error);
        throw new Error('Impossibile cifrare i dati');
    }
}

/**
 * Decifra dati con AES-256-GCM
 * @param {Object} encryptedData - Oggetto cifrato { encrypted, iv, salt, tag }
 * @param {string} password - Password per la derivazione della chiave
 * @returns {Promise<Object>} - Dati decifrati
 */
async function decrypt(encryptedData, password) {
    try {
        if (!encryptedData || !encryptedData.encrypted) {
            throw new Error('Dati cifrati mancanti');
        }

        // Decodifica i componenti
        const salt = new Uint8Array(base64ToArrayBuffer(encryptedData.salt));
        const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));
        const encrypted = new Uint8Array(base64ToArrayBuffer(encryptedData.encrypted));
        const authTag = new Uint8Array(base64ToArrayBuffer(encryptedData.tag));

        // Deriva la chiave
        const key = await deriveKey(password, salt);

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        // Ricostruisci il ciphertext con il tag
        const ciphertext = new Uint8Array(encrypted.length + authTag.length);
        ciphertext.set(encrypted);
        ciphertext.set(authTag, encrypted.length);

        // Decifra
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        );

        return JSON.parse(arrayBufferToString(decrypted));
    } catch (error) {
        logger.error('[Crypto] Errore decifratura:', error);
        throw new Error('Password errata o dati corrotti');
    }
}

// ============================================
// SECURE STORAGE
// ============================================

/**
 * Salva dati cifrati nel localStorage
 * @param {string} key - Chiave localStorage
 * @param {Object} data - Dati da salvare
 * @param {string} masterKey - Chiave master per cifratura
 * @returns {Promise<boolean>}
 */
async function setEncryptedItem(key, data, masterKey) {
    try {
        const encrypted = await encrypt(data, masterKey);
        localStorage.setItem(key, JSON.stringify(encrypted));
        return true;
    } catch (error) {
        logger.error(`[Crypto] Errore salvataggio cifrato per ${key}:`, error);
        return false;
    }
}

/**
 * Leggi dati cifrati dal localStorage
 * @param {string} key - Chiave localStorage
 * @param {string} masterKey - Chiave master per decifratura
 * @returns {Promise<Object|null>} - Dati decifrati o null
 */
async function getEncryptedItem(key, masterKey) {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        const encrypted = JSON.parse(stored);
        return await decrypt(encrypted, masterKey);
    } catch (error) {
        logger.error(`[Crypto] Errore lettura cifrata per ${key}:`, error);
        return null;
    }
}

/**
 * Rimuovi dati cifrati dal localStorage
 * @param {string} key - Chiave localStorage
 */
function removeEncryptedItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        logger.error(`[Crypto] Errore rimozione per ${key}:`, error);
    }
}

// ============================================
// DATI SENSIBILI SPECIFICI
// ============================================

const SENSITIVE_KEYS = {
    confusioneLog: 'elab_confusione_log',
    studentProgress: 'elab_student_progress',
    sessionData: 'elab_session_data',
    projectHistory: 'elab_project_history',
    deviceFingerprint: 'elab_device_fp',
};

/**
 * Salva confusioneLog (stati emotivi) cifrato
 * @param {Array} data - Array di stati emotivi
 * @param {string} masterKey
 */
async function saveConfusioneLog(data, masterKey) {
    return setEncryptedItem(SENSITIVE_KEYS.confusioneLog, data, masterKey);
}

/**
 * Carica confusioneLog decifrato
 * @param {string} masterKey
 */
async function loadConfusioneLog(masterKey) {
    return getEncryptedItem(SENSITIVE_KEYS.confusioneLog, masterKey);
}

/**
 * Salva progressi studente cifrati
 * @param {Object} data - Progressi
 * @param {string} masterKey
 */
async function saveStudentProgress(data, masterKey) {
    return setEncryptedItem(SENSITIVE_KEYS.studentProgress, data, masterKey);
}

/**
 * Carica progressi studente decifrati
 * @param {string} masterKey
 */
async function loadStudentProgress(masterKey) {
    return getEncryptedItem(SENSITIVE_KEYS.studentProgress, masterKey);
}

/**
 * Salva dati sessione cifrati
 * @param {Object} data - Dati sessione
 * @param {string} masterKey
 */
async function saveSessionData(data, masterKey) {
    return setEncryptedItem(SENSITIVE_KEYS.sessionData, data, masterKey);
}

/**
 * Carica dati sessione decifrati
 * @param {string} masterKey
 */
async function loadSessionData(masterKey) {
    return getEncryptedItem(SENSITIVE_KEYS.sessionData, masterKey);
}

/**
 * Salva cronologia progetti cifrata
 * @param {Array} data - Cronologia
 * @param {string} masterKey
 */
async function saveProjectHistory(data, masterKey) {
    return setEncryptedItem(SENSITIVE_KEYS.projectHistory, data, masterKey);
}

/**
 * Carica cronologia progetti decifrata
 * @param {string} masterKey
 */
async function loadProjectHistory(masterKey) {
    return getEncryptedItem(SENSITIVE_KEYS.projectHistory, masterKey);
}

/**
 * Salva fingerprinting minimizzato (solo session ID)
 * @param {string} sessionId - ID sessione random
 * @param {string} masterKey
 */
async function saveDeviceSession(sessionId, masterKey) {
    return setEncryptedItem(SENSITIVE_KEYS.deviceFingerprint, { sessionId }, masterKey);
}

/**
 * Carica fingerprinting minimizzato
 * @param {string} masterKey
 */
async function loadDeviceSession(masterKey) {
    const data = await getEncryptedItem(SENSITIVE_KEYS.deviceFingerprint, masterKey);
    return data?.sessionId || null;
}

// ============================================
// CLEAR ALL DATA
// ============================================

/**
 * Elimina tutti i dati sensibili cifrati
 * Utile per "diritto all'oblio"
 */
export function clearAllSensitiveData() {
    Object.values(SENSITIVE_KEYS).forEach(key => {
        removeEncryptedItem(key);
    });
}

// ============================================
// EXPORTS
// ============================================

export default {
    encrypt,
    decrypt,
    setEncryptedItem,
    getEncryptedItem,
    removeEncryptedItem,
    getOrCreateMasterKey,
    saveConfusioneLog,
    loadConfusioneLog,
    saveStudentProgress,
    loadStudentProgress,
    saveSessionData,
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    loadSessionData,
    saveProjectHistory,
    loadProjectHistory,
    saveDeviceSession,
    loadDeviceSession,
    clearAllSensitiveData,
};
