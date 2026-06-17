// ============================================
// ELAB Tutor - Servizio Tracciamento Studente
// Gestisce: esperimenti, diario, confusione,
// meraviglie, tempo, concetti esplorati
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import logger from '../utils/logger';
import cryptoService from '../utils/crypto';
import { syncSession, syncMood, syncGameResult } from './supabaseSync';
import { isSupabaseConfigured } from './supabaseClient';

const STUDENT_DB_KEY = 'elab_student_data';
const STUDENT_DB_KEY_ENCRYPTED = 'elab_student_data_enc';
const SYNC_DEBOUNCE_MS = 5000; // Sync al server ogni 5 secondi max
const MAX_AGE_DAYS = 730; // G42: Prune entries older than 2 years
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // G42: Max 3MB localStorage for student data
let _syncTimer = null;
let _lastSyncedUserId = null;
let _pruneCounter = 0; // G42: Only prune every N saves

// ─── API URL per sync server ────────────────────────────
// Priorità: VITE_DATA_SERVER_URL (nuovo backend EU) → VITE_AUTH_URL (legacy n8n)
const DATA_SERVER_URL = (import.meta.env.VITE_DATA_SERVER_URL || '').replace(/\/$/, '');
const AUTH_URL = import.meta.env.VITE_AUTH_URL || '';
const TOKEN_KEY = 'elab_auth_token';

// Track server connectivity for UI indicator
let _lastSyncSource = 'unknown'; // 'server' | 'local' | 'offline' | 'unknown'

// ─── Encryption master key cache (per session) ──────────
let _masterKeyCache = null;
// ─── In-memory cache: used when plaintext localStorage is removed after encryption ──────────
let _inMemoryStudentData = null;

function _getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}

async function _getMasterKey() {
    if (_masterKeyCache) return _masterKeyCache;
    const token = _getToken();
    if (!token) return null;
    try {
        _masterKeyCache = await cryptoService.getOrCreateMasterKey(token);
        return _masterKeyCache;
    } catch {
        return null;
    }
}

// Reset master key cache on logout
function _clearMasterKeyCache() {
    _masterKeyCache = null;
}

/**
 * Returns the current sync source for UI indicators
 * @returns {'server'|'local'|'offline'|'unknown'}
 */
function getSyncStatus() {
    return _lastSyncSource;
}

function getStudentData(userId) {
    try {
        const raw = localStorage.getItem(STUDENT_DB_KEY);
        const all = raw ? JSON.parse(raw) : (_inMemoryStudentData || {});
        return all[userId] || createDefaultData(userId);
    } catch { return createDefaultData(userId); }
}

/**
 * G42: Prune stale entries (>730 days) and enforce 3MB cap.
 * Runs every 20 saves to avoid performance hit on every write.
 */
function _pruneIfNeeded(all) {
    _pruneCounter++;
    if (_pruneCounter < 20) return all;
    _pruneCounter = 0;

    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const entries = Object.entries(all);

    // Phase 1: Remove entries older than MAX_AGE_DAYS
    const pruned = {};
    for (const [uid, data] of entries) {
        const saved = data?.ultimoSalvataggio ? new Date(data.ultimoSalvataggio).getTime() : 0;
        if (now - saved < maxAge) {
            pruned[uid] = data;
        }
    }

    // Phase 2: If still over MAX_SIZE_BYTES, remove oldest entries
    let json = JSON.stringify(pruned);
    if (json.length > MAX_SIZE_BYTES) {
        const sorted = Object.entries(pruned).sort((a, b) => {
            const ta = new Date(a[1]?.ultimoSalvataggio || 0).getTime();
            const tb = new Date(b[1]?.ultimoSalvataggio || 0).getTime();
            return ta - tb; // oldest first
        });
        while (json.length > MAX_SIZE_BYTES && sorted.length > 1) {
            const [removedId] = sorted.shift();
            delete pruned[removedId];
            json = JSON.stringify(pruned);
        }
        logger.info(`[StudentService] Pruned localStorage to ${sorted.length} entries, ${(json.length / 1024).toFixed(0)}KB`);
    }

    return pruned;
}

function saveStudentData(userId, data) {
    try {
        const raw = localStorage.getItem(STUDENT_DB_KEY);
        let all = raw ? JSON.parse(raw) : (_inMemoryStudentData || {});
        all[userId] = { ...data, ultimoSalvataggio: new Date().toISOString() };
        all = _pruneIfNeeded(all);
        _inMemoryStudentData = all;
        localStorage.setItem(STUDENT_DB_KEY, JSON.stringify(all));
        _scheduleSyncToServer(userId, all[userId]);
        _encryptAndSave(all).catch(() => {});
    } catch (e) { logger.error('Errore salvataggio dati studente:', e); }
}

/**
 * Encrypt all student data to a separate localStorage key.
 * The plaintext key remains for backward compat; the encrypted key
 * is the GDPR-compliant copy. On read, encrypted version is preferred.
 */
async function _encryptAndSave(allData) {
    const masterKey = await _getMasterKey();
    if (!masterKey) return; // Not logged in — skip encryption
    try {
        await cryptoService.setEncryptedItem(STUDENT_DB_KEY_ENCRYPTED, allData, masterKey);
        _inMemoryStudentData = allData;
        // GDPR: remove plaintext copy after successful encryption
        try { localStorage.removeItem(STUDENT_DB_KEY); } catch { /* ok */ }
    } catch (e) {
        logger.error('[Crypto] Errore cifratura student data:', e);
    }
}

/**
 * Try to read encrypted student data. Falls back to plaintext.
 * Used by teacher dashboard and export features that can be async.
 * @returns {Promise<Object>} All student data
 */
async function getStudentDataEncrypted(userId) {
    const masterKey = await _getMasterKey();
    if (masterKey) {
        try {
            const all = await cryptoService.getEncryptedItem(STUDENT_DB_KEY_ENCRYPTED, masterKey);
            if (all && all[userId]) return all[userId];
        } catch { /* fall through to plaintext */ }
    }
    return getStudentData(userId);
}

/**
 * Check if encrypted storage is active
 * @returns {boolean}
 */
function isEncryptionActive() {
    try {
        const raw = localStorage.getItem(STUDENT_DB_KEY_ENCRYPTED);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!(parsed && parsed.encrypted && parsed.iv && parsed.salt);
    } catch { return false; }
}

/**
 * Debounce sync: accumula scritture e invia al server ogni SYNC_DEBOUNCE_MS.
 * Se il sync fallisce, i dati restano in localStorage per il prossimo tentativo.
 */
function _scheduleSyncToServer(userId, studentData) {
    _lastSyncedUserId = userId;
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
        _syncToServer(userId, studentData);
    }, SYNC_DEBOUNCE_MS);
}

async function _syncToServer(userId, studentData) {
    const token = _getToken();
    if (!token) return; // Non loggato
    if (!DATA_SERVER_URL && !AUTH_URL) return; // Nessun server configurato

    // Try new data server first, then legacy AUTH_URL
    const urls = [];
    if (DATA_SERVER_URL) urls.push(`${DATA_SERVER_URL}/api/sync`);
    if (AUTH_URL) urls.push(`${AUTH_URL}/student-data-sync`);

    for (const url of urls) {
        try {
            const resp = await fetch(url, {
                method: 'POST',
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ studentData }),
                signal: AbortSignal.timeout(10000),
            });
            if (resp.ok) {
                _lastSyncSource = 'server';
                return; // Success — stop trying
            }
        } catch {
            // Try next URL
        }
    }
    // All URLs failed — data stays safe in localStorage
    _lastSyncSource = 'offline';
}

/**
 * Forza sync immediato (chiamato su logout/chiusura pagina)
 */
function flushSync() {
    if (_syncTimer) {
        clearTimeout(_syncTimer);
        _syncTimer = null;
    }
    if (_lastSyncedUserId) {
        const data = getStudentData(_lastSyncedUserId);
        _syncToServer(_lastSyncedUserId, data);
    }
}

/**
 * Fetch dati studenti dal server (per teacher/admin).
 * Ritorna { [userId]: studentData } o {} se errore.
 */
async function fetchStudentsFromServer(classId) {
    const token = _getToken();
    if (!token) return {};
    if (!DATA_SERVER_URL && !AUTH_URL) return {};

    // Try new data server first, then legacy AUTH_URL
    const urls = [];
    if (DATA_SERVER_URL) {
        urls.push(classId
            ? `${DATA_SERVER_URL}/api/class/${encodeURIComponent(classId)}`
            : `${DATA_SERVER_URL}/api/class/all`);
    }
    if (AUTH_URL) {
        urls.push(classId
            ? `${AUTH_URL}/student-data-sync?classId=${classId}`
            : `${AUTH_URL}/student-data-sync`);
    }

    for (const url of urls) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) continue;
            const result = await response.json();
            _lastSyncSource = 'server';
            return result.students || {};
        } catch {
            // Try next URL
        }
    }
    _lastSyncSource = 'offline';
    return {};
}

function getAllStudentData() {
    try {
        const raw = localStorage.getItem(STUDENT_DB_KEY);
        return raw ? JSON.parse(raw) : (_inMemoryStudentData || {});
    } catch { return _inMemoryStudentData || {}; }
}

function createDefaultData(userId) {
    return {
        userId,
        // Esperimenti completati con timestamp e durata
        esperimenti: [],
        // Tempo totale in secondi
        tempoTotale: 0,
        // Sessioni (inizio/fine/durata/attività)
        sessioni: [],
        // Concetti esplorati (id, nome, contatore visite, prima visita, ultima visita)
        concetti: [],
        // Diario di bordo
        diario: [],
        // Log confusione (timestamp, livello 0-10, contesto)
        confusione: [],
        // Meraviglie (domande senza risposta)
        meraviglie: [],
        // Difficoltà taggate
        difficolta: [],
        // Mood / stato emotivo
        moods: [],
        // Statistiche aggregate
        stats: {
            giorniConsecutivi: 0,
            ultimoGiornoAttivo: null,
            esperimentiTotali: 0,
            mediaConfusione: 5,
            meraviglieTotali: 0,
            tempoMedioSessione: 0,
        },
        creato: new Date().toISOString(),
        ultimoSalvataggio: new Date().toISOString(),
    };
}

// ─── RIFLESSIONI (persistenza reale, no-userId) ──────────
const REFLECTIONS_KEY = 'elab_reflections';
const MAX_REFLECTIONS = 200;

function _getReflections() {
    try { return JSON.parse(localStorage.getItem(REFLECTIONS_KEY) || '[]'); }
    catch { return []; }
}

function _saveReflections(entries) {
    try {
        // FIFO: mantieni solo le ultime MAX_REFLECTIONS
        const trimmed = entries.length > MAX_REFLECTIONS
            ? entries.slice(entries.length - MAX_REFLECTIONS)
            : entries;
        localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(trimmed));
    } catch (e) { logger.error('Errore salvataggio riflessioni:', e); }
}

const studentService = {
    // ─── RIFLESSIONI (persistenza reale, senza userId) ──
    saveReflection(entry) {
        const all = _getReflections();
        all.push({
            ...entry,
            id: Date.now().toString(36),
            timestamp: entry.timestamp || new Date().toISOString()
        });
        _saveReflections(all);
    },

    getReflections(toolName) {
        const all = _getReflections();
        if (!toolName) return all;
        return all.filter(r => r.toolName === toolName);
    },

    getReflectionCount() {
        return _getReflections().length;
    },

    // ─── ESPERIMENTI ───────────────────────────────────
    logExperiment(userId, { experimentId, nome, volume, capitolo, durata, completato, note }) {
        const data = getStudentData(userId);
        data.esperimenti.push({
            id: Date.now().toString(36),
            experimentId,
            nome,
            volume,
            capitolo,
            durata: durata || 0,
            completato: completato !== false,
            note: note || '',
            timestamp: new Date().toISOString(),
        });
        data.stats.esperimentiTotali = data.esperimenti.filter(e => e.completato).length;
        saveStudentData(userId, data);

        // G49: Sync to Supabase (async, non-blocking)
        if (isSupabaseConfigured()) {
            syncSession({
                student_id: userId,
                experiment_id: experimentId,
                session_type: 'experiment',
                started_at: new Date().toISOString(),
                duration_seconds: Math.round((durata || 0) / 1000),
                completed: completato !== false,
                score: note ? { note } : null,
            }).catch(() => {});
        }

        return data;
    },

    // ─── SESSIONI ──────────────────────────────────────
    startSession(userId) {
        const data = getStudentData(userId);
        const sessione = {
            id: Date.now().toString(36),
            inizio: new Date().toISOString(),
            fine: null,
            durata: 0,
            attivita: [],
        };
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        data.sessioni.push(sessione);
        saveStudentData(userId, data);
        return sessione.id;
    },

    endSession(userId, sessionId) {
        const data = getStudentData(userId);
        const sessione = data.sessioni.find(s => s.id === sessionId);
        if (sessione) {
            sessione.fine = new Date().toISOString();
            sessione.durata = Math.round((new Date(sessione.fine) - new Date(sessione.inizio)) / 1000);
            data.tempoTotale += sessione.durata;
            // Aggiorna media tempo sessione
            const completate = data.sessioni.filter(s => s.fine);
            data.stats.tempoMedioSessione = Math.round(
                completate.reduce((sum, s) => sum + s.durata, 0) / completate.length
            );
            // Aggiorna giorni consecutivi
            const oggi = new Date().toDateString();
            if (data.stats.ultimoGiornoAttivo !== oggi) {
                const ieri = new Date(Date.now() - 86400000).toDateString();
                data.stats.giorniConsecutivi = data.stats.ultimoGiornoAttivo === ieri
                    ? data.stats.giorniConsecutivi + 1 : 1;
                data.stats.ultimoGiornoAttivo = oggi;
            }
            saveStudentData(userId, data);
        }
        return data;
    },

    logActivity(userId, sessionId, { tipo, dettaglio }) {
        const data = getStudentData(userId);
        const sessione = data.sessioni.find(s => s.id === sessionId);
        if (sessione) {
            sessione.attivita.push({
                tipo, // 'esperimento', 'chat', 'simulatore', 'diario', 'collaborazione'
                dettaglio,
                timestamp: new Date().toISOString(),
            });
            saveStudentData(userId, data);
        }
    },

    // ─── CONCETTI ──────────────────────────────────────
    logConcetto(userId, { concettoId, nome, categoria }) {
        const data = getStudentData(userId);
        const esistente = data.concetti.find(c => c.concettoId === concettoId);
        if (esistente) {
            esistente.visite++;
            esistente.ultimaVisita = new Date().toISOString();
        } else {
            data.concetti.push({
                concettoId,
                nome,
                categoria: categoria || 'generale',
                visite: 1,
                primaVisita: new Date().toISOString(),
                ultimaVisita: new Date().toISOString(),
            });
        }
        saveStudentData(userId, data);
        return data;
    },

    // ─── DIARIO DI BORDO ──────────────────────────────
    addDiarioEntry(userId, { tipo, contenuto, screenshot, esperimentoId, mood }) {
        const data = getStudentData(userId);
        data.diario.push({
            id: Date.now().toString(36),
            tipo, // 'riflessione', 'prima', 'dopo', 'mood', 'meraviglia', 'difficolta'
            contenuto,
            screenshot: screenshot || null,
            esperimentoId: esperimentoId || null,
            mood: mood || null,
            timestamp: new Date().toISOString(),
        });
        saveStudentData(userId, data);
        return data;
    },

    getDiario(userId) {
        return getStudentData(userId).diario.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
    },

    // ─── CONFUSIONE ────────────────────────────────────
    logConfusione(userId, { livello, contesto, concettoId }) {
        const data = getStudentData(userId);
        data.confusione.push({
            livello, // 0-10
            contesto: contesto || '',
            concettoId: concettoId || null,
            timestamp: new Date().toISOString(),
        });
        // Aggiorna media
        const ultimi = data.confusione.slice(-20);
        data.stats.mediaConfusione = Math.round(
            ultimi.reduce((sum, c) => sum + c.livello, 0) / ultimi.length * 10
        ) / 10;
        saveStudentData(userId, data);
        return data;
    },

    // ─── MERAVIGLIE ────────────────────────────────────
    addMeraviglia(userId, { domanda, contesto, concettoId }) {
        const data = getStudentData(userId);
        data.meraviglie.push({
            id: Date.now().toString(36),
            domanda,
            contesto: contesto || '',
            concettoId: concettoId || null,
            risolta: false,
            risposta: null,
            timestamp: new Date().toISOString(),
        });
        data.stats.meraviglieTotali = data.meraviglie.length;
        saveStudentData(userId, data);
        return data;
    },

    risolveMeraviglia(userId, meravigliaId, risposta) {
        const data = getStudentData(userId);
        const m = data.meraviglie.find(m => m.id === meravigliaId);
        if (m) {
            m.risolta = true;
            m.risposta = risposta;
            m.dataRisoluzione = new Date().toISOString();
            saveStudentData(userId, data);
        }
        return data;
    },

    // ─── DIFFICOLTÀ ────────────────────────────────────
    logDifficolta(userId, { descrizione, concettoId, esperimentoId }) {
        const data = getStudentData(userId);
        data.difficolta.push({
            id: Date.now().toString(36),
            descrizione,
            concettoId: concettoId || null,
            esperimentoId: esperimentoId || null,
            risolta: false,
            timestamp: new Date().toISOString(),
        });
        saveStudentData(userId, data);
        return data;
    },

    // ─── MOOD ──────────────────────────────────────────
    logMood(userId, { mood, nota }) {
        const data = getStudentData(userId);
        data.moods.push({
            mood,
            nota: nota || '',
            timestamp: new Date().toISOString(),
        });
        saveStudentData(userId, data);

        // G49: Sync mood to Supabase
        if (isSupabaseConfigured()) {
            syncMood({
                student_id: userId,
                mood: mood,
                context: nota || null,
            }).catch(() => {});
        }

        return data;
    },

    // ─── LETTURA DATI ──────────────────────────────────
    getData(userId) {
        return getStudentData(userId);
    },

    getStats(userId) {
        return getStudentData(userId).stats;
    },

    // ─── PER IL PROFESSORE: DATI DI TUTTI ──────────────
    getAllStudentsData() {
        return getAllStudentData();
    },

    getStudentsDataByIds(userIds) {
        const all = getAllStudentData();
        const result = {};
        userIds.forEach(id => {
            if (all[id]) result[id] = all[id];
        });
        return result;
    },

    // ─── AGGREGAZIONI PER DOCENTE ──────────────────────
    getClassReport(userIds) {
        const all = getAllStudentData();
        const studenti = userIds.map(id => all[id]).filter(Boolean);

        if (studenti.length === 0) return null;

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        // Concetti con più confusione
        const concettiConfusione = {};
        studenti.forEach(s => {
            s.confusione.forEach(c => {
                if (c.concettoId) {
                    if (!concettiConfusione[c.concettoId]) {
                        concettiConfusione[c.concettoId] = { totale: 0, conteggio: 0 };
                    }
                    concettiConfusione[c.concettoId].totale += c.livello;
                    concettiConfusione[c.concettoId].conteggio++;
                }
            });
        });

        // Esperimenti più completati
        const esperimentiCount = {};
        studenti.forEach(s => {
            s.esperimenti.filter(e => e.completato).forEach(e => {
                esperimentiCount[e.experimentId] = (esperimentiCount[e.experimentId] || 0) + 1;
            });
        });

        // Attività recente (ultimi 7 giorni)
        const settimanafa = new Date(Date.now() - 7 * 86400000);
        const attivitaRecente = studenti.map(s => ({
            userId: s.userId,
            sessioni: s.sessioni.filter(sess => new Date(sess.inizio) > settimanafa).length,
            tempoSettimana: s.sessioni
                .filter(sess => new Date(sess.inizio) > settimanafa && sess.durata)
                .reduce((sum, sess) => sum + sess.durata, 0),
            esperimentiSettimana: s.esperimenti
                .filter(e => new Date(e.timestamp) > settimanafa).length,
        }));

        // Studenti inattivi (nessuna sessione in 7+ giorni)
        const inattivi = studenti.filter(s => {
            const ultima = s.sessioni[s.sessioni.length - 1];
            return !ultima || new Date(ultima.inizio) < settimanafa;
        }).map(s => s.userId);

        // Mood aggregato
        const moodCount = {};
        studenti.forEach(s => {
            const ultimoMood = s.moods[s.moods.length - 1];
            if (ultimoMood) {
                moodCount[ultimoMood.mood] = (moodCount[ultimoMood.mood] || 0) + 1;
            }
        });

        return {
            totaleStudenti: studenti.length,
            concettiConfusione,
            esperimentiCount,
            attivitaRecente,
            inattivi,
            moodCount,
            tempoMedioTotale: Math.round(
                studenti.reduce((sum, s) => sum + s.tempoTotale, 0) / studenti.length
            ),
            mediaEsperimenti: Math.round(
                studenti.reduce((sum, s) => sum + s.stats.esperimentiTotali, 0) / studenti.length * 10
            ) / 10,
        };
    },

    // ─── ENCRYPTION STATUS ────────────────────────────────
    /**
     * Check if localStorage encryption is active
     */
    isEncryptionActive,

    /**
     * Read student data preferring encrypted storage (async)
     */
    getStudentDataEncrypted,

    /**
     * Clear master key cache (call on logout)
     */
    clearEncryptionCache: _clearMasterKeyCache,

    // ─── SERVER SYNC ─────────────────────────────────────
    /**
     * Returns current sync status ('server' | 'local' | 'offline' | 'unknown')
     */
    getSyncStatus,

    /**
     * Forza sync immediato dei dati al server.
     * Chiamare su logout o chiusura pagina.
     */
    flushSync,

    /**
     * Fetch dati studenti dal server (per teacher/admin).
     * @param {string} [classId] - ID classe Notion (opzionale)
     * @returns {Promise<Object>} { [userId]: studentData }
     */
    fetchStudentsFromServer,

    /**
     * Genera class report da dati server (async).
     * @param {string} [classId] - ID classe Notion
     * @returns {Promise<Object|null>} Report aggregato
     */
    async getClassReportFromServer(classId) {
        const students = await fetchStudentsFromServer(classId);
        const studenti = Object.values(students);
        if (studenti.length === 0) return null;

        const concettiConfusione = {};
        studenti.forEach(s => {
            (s.confusione || []).forEach(c => {
                if (c.concettoId) {
                    if (!concettiConfusione[c.concettoId]) {
                        concettiConfusione[c.concettoId] = { totale: 0, conteggio: 0 };
                    }
                    concettiConfusione[c.concettoId].totale += c.livello;
                    concettiConfusione[c.concettoId].conteggio++;
                }
            });
        });

        const esperimentiCount = {};
        studenti.forEach(s => {
            (s.esperimenti || []).filter(e => e.completato).forEach(e => {
                esperimentiCount[e.experimentId] = (esperimentiCount[e.experimentId] || 0) + 1;
            });
        });

        const settimanafa = new Date(Date.now() - 7 * 86400000);
        const attivitaRecente = studenti.map(s => ({
            userId: s.userId,
            sessioni: (s.sessioni || []).filter(sess => new Date(sess.inizio) > settimanafa).length,
            tempoSettimana: (s.sessioni || [])
                .filter(sess => new Date(sess.inizio) > settimanafa && sess.durata)
                .reduce((sum, sess) => sum + sess.durata, 0),
            esperimentiSettimana: (s.esperimenti || [])
                .filter(e => new Date(e.timestamp) > settimanafa).length,
        }));

        const inattivi = studenti.filter(s => {
            const ultima = (s.sessioni || [])[s.sessioni?.length - 1];
            return !ultima || new Date(ultima.inizio) < settimanafa;
        }).map(s => s.userId);

        const moodCount = {};
        studenti.forEach(s => {
            const ultimoMood = (s.moods || [])[s.moods?.length - 1];
            if (ultimoMood) {
                moodCount[ultimoMood.mood] = (moodCount[ultimoMood.mood] || 0) + 1;
            }
        });

        return {
            totaleStudenti: studenti.length,
            concettiConfusione,
            esperimentiCount,
            attivitaRecente,
            inattivi,
            moodCount,
            tempoMedioTotale: Math.round(
                studenti.reduce((sum, s) => sum + (s.tempoTotale || 0), 0) / studenti.length
            ),
            mediaEsperimenti: Math.round(
                studenti.reduce((sum, s) => sum + (s.stats?.esperimentiTotali || 0), 0) / studenti.length * 10
            ) / 10,
        };
    },
};

export default studentService;
