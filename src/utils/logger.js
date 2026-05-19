// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
// ============================================
// ELAB Tutor - Logger condizionale
// In produzione: solo warn/error. In dev: tutto.
// ============================================

const isDev = import.meta.env.DEV;

const logger = {
    debug: (...args) => { if (isDev) console.log('[DEBUG]', ...args); },
    info: (...args) => { if (isDev) console.log('[INFO]', ...args); },
    log: (...args) => { if (isDev) console.log('[LOG]', ...args); },
    warn: (...args) => { console.warn('[WARN]', ...args); },
    error: (...args) => { console.error('[ERROR]', ...args); },
};

export default logger;
