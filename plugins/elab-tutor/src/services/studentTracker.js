// ============================================
// ELAB Tutor - Student Activity Tracker
// Bridge: simulator events → studentService
// Ascolta eventi __ELAB_API e persiste in localStorage
// © Andrea Marro — 28/03/2026
// Tutti i diritti riservati
// ============================================

import studentService from './studentService';
import gdprService from './gdprService';
import logger from '../utils/logger';
import gamification from './gamificationService';

const DEVICE_ID_KEY = 'elab_device_id';
const STUDENT_NAME_KEY = 'elab_student_name';

let _initialized = false;
let _userId = null;
let _sessionId = null;
let _currentExperimentId = null;
let _experimentStartTime = null;
let _playCount = 0;
let _errorCount = 0;
let _unsubscribers = [];

/**
 * Get or create a persistent device-based userId.
 * No login required — each device/browser gets a unique ID.
 */
function getDeviceUserId() {
    let id = null;
    try { id = localStorage.getItem(DEVICE_ID_KEY); } catch { /* private browsing */ }
    if (!id) {
        id = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        try { localStorage.setItem(DEVICE_ID_KEY, id); } catch { /* private browsing */ }
    }
    return id;
}

/**
 * Initialize the tracker. Call once when the app/simulator mounts.
 * Starts a new session and subscribes to simulator events.
 */
function init() {
    if (_initialized) return;

    // GDPR Art.7: NON iniziare tracking senza consenso valido
    if (!gdprService.hasValidConsent()) {
        logger.info('[StudentTracker] Consent not given — tracking deferred');
        return;
    }

    _userId = getDeviceUserId();
    _sessionId = studentService.startSession(_userId);
    _initialized = true;

    // Subscribe to __ELAB_API events if available
    _subscribeToEvents();

    // Track page visibility for session end
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && _sessionId) {
            _endCurrentExperiment();
            studentService.endSession(_userId, _sessionId);
            studentService.flushSync();
        } else if (document.visibilityState === 'visible' && _initialized) {
            // Resume: start new session
            _sessionId = studentService.startSession(_userId);
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    _unsubscribers.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange));

    // Track beforeunload for sync
    const handleUnload = () => {
        _endCurrentExperiment();
        if (_sessionId) studentService.endSession(_userId, _sessionId);
        studentService.flushSync();
    };
    window.addEventListener('beforeunload', handleUnload);
    _unsubscribers.push(() => window.removeEventListener('beforeunload', handleUnload));

    logger.info(`[StudentTracker] Initialized userId=${_userId} sessionId=${_sessionId}`);
}

/**
 * Subscribe to simulator events via __ELAB_API pub/sub.
 * Retries if __ELAB_API is not yet available (simulator not mounted yet).
 */
function _subscribeToEvents() {
    const trySubscribe = () => {
        if (!window.__ELAB_API?.on) return false;

        const api = window.__ELAB_API;

        const unsub1 = api.on('experimentChange', _onExperimentChange);
        const unsub2 = api.on('stateChange', _onStateChange);
        const unsub3 = api.on('componentInteract', _onComponentInteract);

        _unsubscribers.push(unsub1, unsub2, unsub3);
        logger.info('[StudentTracker] Subscribed to simulator events');
        return true;
    };

    if (!trySubscribe()) {
        // Retry after simulator mounts (up to 10s)
        let attempts = 0;
        const retryInterval = setInterval(() => {
            attempts++;
            if (trySubscribe() || attempts > 20) {
                clearInterval(retryInterval);
            }
        }, 500);
        _unsubscribers.push(() => clearInterval(retryInterval));
    }
}

function _onExperimentChange(data) {
    if (!_userId || !_sessionId) return;

    // End previous experiment tracking and flush immediately
    _endCurrentExperiment();
    studentService.flushSync();

    // Start tracking new experiment
    const expId = data?.experimentId || data?.id;
    if (expId) {
        _currentExperimentId = expId;
        _experimentStartTime = Date.now();
        _playCount = 0;
        _errorCount = 0;

        studentService.logActivity(_userId, _sessionId, {
            tipo: 'esperimento',
            dettaglio: `Aperto: ${data?.title || expId}`,
        });

        studentService.logConcetto(_userId, {
            concettoId: expId,
            nome: data?.title || expId,
            categoria: `volume-${data?.volume || '?'}`,
        });
    }
}

function _onStateChange(data) {
    if (!_userId || !_sessionId) return;

    const state = data?.state;
    if (state === 'running' || state === 'playing') {
        _playCount++;
        studentService.logActivity(_userId, _sessionId, {
            tipo: 'simulatore',
            dettaglio: `Play #${_playCount}` + (_currentExperimentId ? ` (${_currentExperimentId})` : ''),
        });
    } else if (state === 'error') {
        _errorCount++;
    }
}

function _onComponentInteract(data) {
    if (!_userId || !_sessionId) return;

    studentService.logActivity(_userId, _sessionId, {
        tipo: 'simulatore',
        dettaglio: `Interazione: ${data?.componentId || 'unknown'} (${data?.action || 'click'})`,
    });
}

/**
 * End tracking for the current experiment. Logs completion with duration.
 */
function _endCurrentExperiment() {
    if (!_currentExperimentId || !_experimentStartTime) return;

    const durata = Math.round((Date.now() - _experimentStartTime) / 1000);
    if (durata > 3) { // Ignora aperture lampo (<3s)
        studentService.logExperiment(_userId, {
            experimentId: _currentExperimentId,
            nome: _currentExperimentId,
            volume: _currentExperimentId.startsWith('v1') ? 1 : _currentExperimentId.startsWith('v2') ? 2 : 3,
            capitolo: parseInt(_currentExperimentId.match(/cap(\d+)/)?.[1] || '0'),
            durata,
            completato: _playCount > 0,
            note: `play:${_playCount}, errori:${_errorCount}`,
        });
    }

    _currentExperimentId = null;
    _experimentStartTime = null;
    _playCount = 0;
    _errorCount = 0;
}

// ─── Public API for manual tracking calls ───

/**
 * Log a chat interaction with UNLIM AI.
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
 */
function logChatInteraction(question, responseQuality) {
    if (!_userId || !_sessionId) return;
    studentService.logActivity(_userId, _sessionId, {
        tipo: 'chat',
        dettaglio: question?.slice(0, 100) || 'domanda',
    });
}

/**
 * Log a compilation result.
 */
function logCompilation(success, errorMessage) {
    if (!_userId || !_sessionId) return;
    if (success) {
        studentService.logActivity(_userId, _sessionId, {
            tipo: 'compilazione',
            dettaglio: 'Compilazione OK',
        });
    } else {
        _errorCount++;
        studentService.logActivity(_userId, _sessionId, {
            tipo: 'compilazione',
            dettaglio: `Errore: ${(errorMessage || '').slice(0, 100)}`,
        });
    }
}

/**
 * Log a game result.
 */
function logGameResult(gameId, score, maxScore, timeSpent) {
    if (!_userId || !_sessionId) return;
    studentService.logActivity(_userId, _sessionId, {
        tipo: 'gioco',
        dettaglio: `${gameId}: ${score}/${maxScore} (${timeSpent}s)`,
    });
    // Also log as experiment for Teacher Dashboard progress
    studentService.logExperiment(_userId, {
        experimentId: `game-${gameId}`,
        nome: gameId,
        volume: 0,
        capitolo: 0,
        durata: timeSpent,
        completato: score >= maxScore * 0.5,
        note: `score:${score}/${maxScore}`,
    });
    // Gamification: sound + points on game win
    if (score >= maxScore * 0.5) {
        try { gamification.onGameWon(gameId); } catch { /* silent */ }
    }
}

/**
 * Set student display name (optional, for Teacher Dashboard).
 */
function setStudentName(name) {
    try { localStorage.setItem(STUDENT_NAME_KEY, name); } catch { /* ok */ }
}

/**
 * Get student display name.
 */
function getStudentName() {
    try { return localStorage.getItem(STUDENT_NAME_KEY) || null; } catch { return null; }
}

/**
 * Get current userId.
 */
function getUserId() {
    return _userId || getDeviceUserId();
}

/**
 * Destroy tracker. Call on app unmount.
 */
function destroy() {
    _endCurrentExperiment();
    if (_sessionId && _userId) {
        studentService.endSession(_userId, _sessionId);
        studentService.flushSync();
    }
    _unsubscribers.forEach(fn => { try { fn(); } catch { /* ok */ } });
    _unsubscribers = [];
    _initialized = false;
    _sessionId = null;
    _userId = null;
    logger.info('[StudentTracker] Destroyed');
}

/**
 * Re-initialize tracker after consent is granted.
 * Called by ConsentBanner on accept.
 */
function initAfterConsent() {
    _initialized = false;
    init();
}

const studentTracker = {
    init,
    initAfterConsent,
    destroy,
    getUserId,
    getStudentName,
    setStudentName,
    logChatInteraction,
    logCompilation,
    logGameResult,
};

export default studentTracker;
