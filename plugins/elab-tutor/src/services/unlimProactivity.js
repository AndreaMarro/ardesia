/**
 * UNLIM Proactivity — Nudge proattivo quando il docente è impreparato
 * (c) Andrea Marro — 15/04/2026 — ELAB Tutor
 *
 * Principio Zero: UNLIM deve essere proattivo. Se il docente non sa cosa fare:
 *  1. Indica visivamente il prossimo passo
 *  2. Pone domande DIRETTAMENTE alla classe (non al docente)
 *  3. Suggerisce cosa guardare sullo schermo
 *  4. Tutto nel linguaggio 10-14 anni, citando il libro quando possibile
 *
 * API pura, senza side effects — facile da testare.
 *
 * Esempio uso:
 *   const decision = shouldNudge(context);
 *   if (decision.nudge) { showNudgeUI(decision.message); }
 */

import VOLUME_REFERENCES from '../data/volume-references';

// ─────────────────────────────────────────────────
// Soglie (tutte in millisecondi)
// ─────────────────────────────────────────────────
export const IDLE_THRESHOLD_MS = 60_000;          // 60s inattività utente → nudge
export const STEP_STUCK_THRESHOLD_MS = 30_000;    // 30s stesso step Passo Passo → nudge
export const HIGH_PRIORITY_THRESHOLD_MS = 120_000; // >2min bloccato → priority high
export const MEDIUM_PRIORITY_THRESHOLD_MS = 90_000; // >90s → priority medium

// Parole "jargon" che NON devono apparire nei messaggi ai ragazzi 10-14 anni
// (lista conservativa — solo jargon puro, non terminologia elettronica base)
const JARGON_BLACKLIST = [
  'kirchhoff', 'ohm\'s law', 'ddp', 'fem',
  'mna', 'kcl', 'adc', 'pwm', 'usart', 'gpio',
  'mosfet n-channel', 'transconduttanza',
  'impedance', 'thevenin', 'norton',
  'bypassa', 'override', 'buffer', 'stack',
  'payload', 'endpoint', 'api', 'callback',
];

// ─────────────────────────────────────────────────
// Utility interne
// ─────────────────────────────────────────────────

/**
 * Quanto tempo è trascorso dall'ultimo input utente
 * @param {number} lastInteraction - ms timestamp (Date.now style)
 * @param {number} now - ms timestamp corrente
 * @returns {number} millisecondi da lastInteraction
 */
function idleFor(lastInteraction, now) {
  if (!lastInteraction || typeof lastInteraction !== 'number') return 0;
  return Math.max(0, now - lastInteraction);
}

/**
 * Il circuito è "statico"? (cioè esperimento caricato ma nulla sta succedendo)
 * Statico = nessun LED acceso, nessun pulsante premuto, simulazione non attiva
 * @param {object} circuitState
 * @param {object} simulationState
 * @returns {boolean}
 */
function isCircuitStatic(circuitState, simulationState) {
  if (!circuitState) return false;

  // Simulazione non avviata = statico
  const running =
    simulationState?.running === true ||
    simulationState?.isRunning === true;
  if (!running) return true;

  // Nessun LED acceso (led.on === true oppure brightness > 0)
  const components = Array.isArray(circuitState.components)
    ? circuitState.components
    : [];
  const anyLedOn = components.some((c) => {
    if (!c || typeof c !== 'object') return false;
    const type = String(c.type || c.kind || '').toLowerCase();
    if (type.includes('led')) {
      if (c.on === true) return true;
      if (typeof c.brightness === 'number' && c.brightness > 0) return true;
    }
    return false;
  });
  if (anyLedOn) return false;

  // Nessun pulsante premuto
  const anyButtonPressed = components.some((c) => {
    if (!c || typeof c !== 'object') return false;
    const type = String(c.type || c.kind || '').toLowerCase();
    return type.includes('button') && c.pressed === true;
  });
  if (anyButtonPressed) return false;

  return true;
}

/**
 * Controlla che il messaggio sia adatto a bambini 10-14 anni
 * @param {string} message
 * @returns {boolean}
 */
function isKidFriendly(message) {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  return !JARGON_BLACKLIST.some((word) => lower.includes(word));
}

/**
 * Recupera il riferimento al libro per un esperimento (se noto)
 * @param {string} experimentId
 * @returns {object|null}
 */
function getBookRef(experimentId) {
  if (!experimentId) return null;
  try {
    return VOLUME_REFERENCES[experimentId] || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────
// API PUBBLICA
// ─────────────────────────────────────────────────

/**
 * Decide se UNLIM deve attivare un nudge proattivo.
 *
 * Trigger possibili (in ordine di priorità):
 *  A. Esperimento bloccato da >2min → priority 'high'
 *  B. Passo Passo bloccato >30s sullo stesso step → priority 'medium'
 *  C. Circuito statico + 60s inattività → priority 'low'/'medium'
 *
 * @param {object} context
 * @param {number} context.lastInteraction - timestamp ms ultimo input utente
 * @param {string} [context.experimentId] - id esperimento corrente
 * @param {object} [context.currentStep] - { index, totalSteps, enteredAt }
 * @param {object} [context.circuitState] - { components: [...] }
 * @param {object} [context.simulationState] - { running: boolean }
 * @param {number} [context.now] - timestamp ms (per test deterministici)
 * @returns {{nudge: boolean, message: string, priority: 'low'|'medium'|'high', reason: string}}
 */
export function shouldNudge(context) {
  const safeCtx = context && typeof context === 'object' ? context : {};
  const now = typeof safeCtx.now === 'number' ? safeCtx.now : Date.now();
  const idle = idleFor(safeCtx.lastInteraction, now);

  // Nessun nudge se l'utente era attivo da poco
  if (idle < IDLE_THRESHOLD_MS) {
    return { nudge: false, message: '', priority: 'low', reason: 'user-active' };
  }

  // (A) Esperimento bloccato da >2 minuti
  if (idle >= HIGH_PRIORITY_THRESHOLD_MS) {
    const msg = generateProactiveMessage({ ...safeCtx, _reason: 'experiment-stuck' });
    return {
      nudge: true,
      message: msg,
      priority: 'high',
      reason: 'experiment-stuck-long',
    };
  }

  // (B) Passo Passo bloccato da >30s
  const step = safeCtx.currentStep;
  if (step && typeof step.enteredAt === 'number') {
    const stepIdle = Math.max(0, now - step.enteredAt);
    if (stepIdle >= STEP_STUCK_THRESHOLD_MS) {
      const msg = generateProactiveMessage({ ...safeCtx, _reason: 'step-stuck' });
      const priority = stepIdle >= MEDIUM_PRIORITY_THRESHOLD_MS ? 'medium' : 'low';
      return {
        nudge: true,
        message: msg,
        priority,
        reason: 'step-stuck',
      };
    }
  }

  // (C) Circuito statico + inattività
  if (isCircuitStatic(safeCtx.circuitState, safeCtx.simulationState)) {
    const msg = generateProactiveMessage({ ...safeCtx, _reason: 'circuit-static' });
    const priority =
      idle >= MEDIUM_PRIORITY_THRESHOLD_MS ? 'medium' : 'low';
    return {
      nudge: true,
      message: msg,
      priority,
      reason: 'circuit-static',
    };
  }

  // Utente inattivo ma circuito non statico (es. simulazione running, LED acceso)
  // → nessun nudge, non serve interrompere
  return { nudge: false, message: '', priority: 'low', reason: 'nothing-to-nudge' };
}

/**
 * Genera un messaggio proattivo nel linguaggio 10-14 anni.
 * - Rivolge domanda ALLA CLASSE (non al docente)
 * - Cita il libro se esperimento noto
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
 * - Evita jargon
 * - Diverso per esperimenti diversi (usa pageRef e chapter)
 *
 * @param {object} context
 * @returns {string}
 */
export function generateProactiveMessage(context) {
  const safeCtx = context && typeof context === 'object' ? context : {};
  const bookRef = getBookRef(safeCtx.experimentId);
  const reason = safeCtx._reason || 'idle';

  // ── Messaggio quando il circuito è statico ──────────────────────
  if (reason === 'circuit-static') {
    if (bookRef) {
      const page = bookRef.bookPage;
      return (
        `Ragazzi, il circuito è pronto! Clicchiamo Play per vederlo funzionare. ` +
        `A pagina ${page} del libro c'è il passaggio: secondo voi cosa dovrebbe succedere quando parte?`
      );
    }
    return (
      `Ragazzi, guardate lo schermo: il circuito è pronto ma fermo. ` +
      `Proviamo a premere Play insieme — secondo voi cosa succederà?`
    );
  }

  // ── Messaggio quando il Passo Passo è bloccato ──────────────────
  if (reason === 'step-stuck') {
    if (bookRef && Array.isArray(bookRef.bookInstructions) && bookRef.bookInstructions.length) {
      const stepIdx = Math.min(
        (safeCtx.currentStep?.index ?? 0),
        bookRef.bookInstructions.length - 1,
      );
      const stepText = bookRef.bookInstructions[stepIdx];
      return (
        `Ragazzi, rileggiamo insieme questo passaggio: "${stepText}". ` +
        `Secondo voi perché serve questo collegamento? Provate a spiegarlo con parole vostre.`
      );
    }
    return (
      `Ragazzi, rimaniamo su questo passaggio un momento. ` +
      `Chi vuole provare a spiegare cosa stiamo facendo adesso?`
    );
  }

  // ── Messaggio quando esperimento bloccato da tanto tempo ────────
  if (reason === 'experiment-stuck') {
    if (bookRef) {
      const quote = bookRef.bookQuote || null;
      const chapter = bookRef.chapter || '';
      if (quote) {
        return (
          `Ragazzi, facciamo una pausa e rileggiamo il libro: "${quote}". ` +
          `Torniamo al circuito — cosa potete osservare che prima non avevate notato?`
        );
      }
      return (
        `Ragazzi, riprendiamo dal ${chapter}. ` +
        `Chi si ricorda qual era il prossimo passo? Parliamone insieme.`
      );
    }
    return (
      `Ragazzi, prendiamoci un momento. ` +
      `Chi vuole raccontare cosa abbiamo fatto fino ad adesso? Poi decidiamo il prossimo passo.`
    );
  }

  // Default
  if (bookRef) {
    const page = bookRef.bookPage;
    return (
      `Ragazzi, guardate il libro a pagina ${page}: ` +
      `proviamo a seguire il passaggio successivo. Qualcuno vuole leggere ad alta voce?`
    );
  }
  return (
    `Ragazzi, guardate lo schermo insieme a me. ` +
    `Cosa vedete? Da dove pensate di dover partire?`
  );
}

/**
 * Verifica se un messaggio è nel linguaggio adatto a bambini 10-14 anni.
 * (utility esposta per test + enforcement chiamante)
 * @param {string} message
 * @returns {boolean}
 */
export function isMessageKidFriendly(message) {
  return isKidFriendly(message);
}

export default {
  shouldNudge,
  generateProactiveMessage,
  isMessageKidFriendly,
  IDLE_THRESHOLD_MS,
  STEP_STUCK_THRESHOLD_MS,
  HIGH_PRIORITY_THRESHOLD_MS,
  MEDIUM_PRIORITY_THRESHOLD_MS,
};
