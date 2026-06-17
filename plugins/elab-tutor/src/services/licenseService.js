// ============================================
// ELAB Tutor - Sistema Licenze via Notion
// Privacy-First: sessione anonima senza fingerprinting invasivo
// © Andrea Marro — 15/02/2026
// ============================================

// GDPR/COPPA COMPLIANCE FIX 15/02/2026:
// Rimosso fingerprinting invasivo (Canvas, WebGL, AudioContext, UserAgent, etc.)
// Ora utilizziamo solo un randomUUID() per sessione - nessun dato identificativo
// In conformità con GDPR "data minimization" e COPPA "no persistent identifiers"

import logger from '../utils/logger';

const NOTION_API_URL = import.meta.env.VITE_N8N_LICENSE_URL || '';

const SESSION_ID_KEY = 'elab_session_id';

/**
 * Genera un ID sessione privacy-safe.
 * Usa solo crypto.randomUUID() - nessun fingerprinting del browser.
 * GDPR compliant: nessun dato personale o identificativo persistente.
 * © Andrea Marro — 15/02/2026
 */
async function generateSessionId() {
    try {
        // Controlla se esiste già una sessione
        const cached = sessionStorage.getItem(SESSION_ID_KEY);
        if (cached) return cached;
        
        // Genera nuovo ID casuale
        const sessionId = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
        sessionStorage.setItem(SESSION_ID_KEY, sessionId);
        return sessionId;
    } catch {
        // Fallback se sessionStorage non disponibile
        return crypto.randomUUID().replace(/-/g, '').slice(0, 32);
    }
}

/**
 * @deprecated Il fingerprinting è stato rimosso per conformità GDPR/COPPA.
 * Usa generateSessionId() al suo posto.
 */
async function generateDeviceFingerprint() {
    return generateSessionId();
}

class LicenseService {
    constructor() {
        this.cachedLicense = null;
        this.cacheExpiry = null;
        this.deviceId = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minuti
    }

    // Ottieni ID sessione privacy-safe (senza fingerprinting)
    async getSessionId() {
        if (this.deviceId) return this.deviceId;
        this.deviceId = await generateSessionId();
        return this.deviceId;
    }
    
    // @deprecated Usa getSessionId()
    async getDeviceId() {
        return this.getSessionId();
    }

    // Verifica licenza con il codice + device lock
    async verifyLicense(licenseCode) {
        // Check cache
        if (this.cachedLicense && this.cacheExpiry > Date.now()) {
            if (this.cachedLicense.code === licenseCode) {
                return this.cachedLicense;
            }
        }

        try {
            const sessionId = await this.getSessionId();

            const response = await fetch(NOTION_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000),
                body: JSON.stringify({
                    action: 'verify',
                    code: licenseCode,
                    sessionId: sessionId,
                    // Nota: deviceId è mantenuto per retrocompatibilità API
                    deviceId: sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Errore di connessione');
            }

            const data = await response.json();

            if (data.valid) {
                this.cachedLicense = {
                    code: licenseCode,
                    school: data.school,
                    email: data.email,
                    expiry: new Date(data.expiry),
                    plan: data.plan || 'base',
                    maxUsers: data.maxUsers || 1,
                    sessionId: sessionId,
                    valid: true
                };
                this.cacheExpiry = Date.now() + this.CACHE_DURATION;

                // Salva in sessionStorage (senza informazioni sensibili)
                sessionStorage.setItem('elab_license', JSON.stringify({
                    code: licenseCode,
                    expiry: data.expiry,
                    school: data.school,
                    sessionId: sessionId
                }));

                return this.cachedLicense;
            } else {
                // Gestisci errore device già associato
                if (data.error === 'DEVICE_LOCKED') {
                    return {
                        valid: false,
                        error: 'Questa licenza è già attiva su un altro dispositivo. Ogni licenza può essere usata su un solo computer alla volta.'
                    };
                }
                return {
                    valid: false,
                    error: data.error || 'Licenza non valida'
                };
            }
        } catch (error) {
            logger.error('[LicenseService] Error:', error);

            // NESSUN fallback locale — senza server non si accede
            // Questo previene manipolazione del sessionStorage
            return {
                valid: false,
                error: 'Impossibile verificare la licenza. Controlla la connessione a internet e riprova.'
            };
        }
    }

    // Rilascia il session lock (quando si fa logout)
    async releaseLicense() {
        const stored = sessionStorage.getItem('elab_license');
        if (!stored) return;

        try {
            const parsed = JSON.parse(stored);
            const sessionId = await this.getSessionId();

            // Notifica il server che la sessione rilascia la licenza
            await fetch(NOTION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(10000),
                body: JSON.stringify({
                    action: 'release',
                    code: parsed.code,
                    sessionId: sessionId,
                    // Retrocompatibilità
                    deviceId: sessionId
                })
            });
        } catch (e) {
            // Ignora errori di rete durante il rilascio
        }
    }

    // Controlla se c'è una sessione attiva
    hasActiveSession() {
        const stored = sessionStorage.getItem('elab_license');
        if (!stored) return false;

        try {
            const parsed = JSON.parse(stored);
            return new Date(parsed.expiry) > new Date();
        } catch {
            return false;
        }
    }

    // Ottieni info licenza corrente
    getCurrentLicense() {
        const stored = sessionStorage.getItem('elab_license');
        if (!stored) return null;

        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    // Logout con rilascio device
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    async logout() {
        await this.releaseLicense();
        this.cachedLicense = null;
        this.cacheExpiry = null;
        sessionStorage.removeItem('elab_license');
        sessionStorage.removeItem('elab_auth');
    }

    // Verifica se la licenza è scaduta
    isExpired() {
        const license = this.getCurrentLicense();
        if (!license) return true;
        return new Date(license.expiry) < new Date();
    }

    // Giorni rimanenti
    getDaysRemaining() {
        const license = this.getCurrentLicense();
        if (!license) return 0;
        const diff = new Date(license.expiry) - new Date();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
}

// Singleton - © Andrea Marro 2026
const licenseService = new LicenseService();
export default licenseService;

// Named convenience exports removed — unused across codebase.
// Use the default export (licenseService singleton) if needed.
