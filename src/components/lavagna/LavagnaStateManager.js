/**
 * LavagnaStateManager — State machine per auto-gestione pannelli
 * 5 stati: CLEAN, BUILD, CODE, RUN, STUCK
 * Ogni stato definisce quali pannelli sono aperti/chiusi.
 * L'utente puo sempre override manualmente.
 * (c) Andrea Marro — 02/04/2026
 */

export const STATES = {
  CLEAN: 'CLEAN',   // Lavagna pulita, nessun esperimento
  BUILD: 'BUILD',   // Costruzione circuito (passo passo o libero)
  CODE: 'CODE',     // Scrittura codice Arduino/Scratch
  RUN: 'RUN',       // Simulazione in esecuzione
  STUCK: 'STUCK',   // Utente bloccato (inattivita o errore)
};

/**
 * Panel configuration per ogni stato
 * true = suggerisci aperto, false = suggerisci chiuso
 * L'utente puo sempre override (manual = true)
 */
export const STATE_PANELS = {
  [STATES.CLEAN]: {
    leftPanel: false,
    bottomPanel: false,
    unlim: false,
    toolbar: true,
  },
  [STATES.BUILD]: {
    leftPanel: true,      // Componenti aperti per drag
    bottomPanel: false,    // Codice chiuso durante montaggio
    unlim: false,
    toolbar: true,
  },
  [STATES.CODE]: {
    leftPanel: false,      // Componenti chiusi
    bottomPanel: true,     // Editor codice aperto
    unlim: false,
    toolbar: false,        // Non serve durante coding
  },
  [STATES.RUN]: {
    leftPanel: false,
    bottomPanel: true,     // Monitor seriale visibile
    unlim: false,
    toolbar: false,
  },
  [STATES.STUCK]: {
    leftPanel: false,
    bottomPanel: false,
    unlim: false,
    toolbar: true,
  },
};

/**
 * Determina lo stato dalla combinazione di eventi
 * @param {Object} context - { hasExperiment, isPlaying, isEditing, idleSeconds, hasError }
 * @returns {string} - uno dei STATES
 */
export function deriveState(context) {
  const { hasExperiment, isPlaying, isEditing, idleSeconds = 0, hasError = false } = context;

  if (hasError || idleSeconds > 120) return STATES.STUCK; // 120s idle → UNLIM si auto-apre per aiutare
  if (!hasExperiment) return STATES.CLEAN;
  if (isPlaying) return STATES.RUN;
  if (isEditing) return STATES.CODE;
  return STATES.BUILD;
}

/**
 * Calcola le azioni da applicare ai pannelli
 * Rispetta gli override manuali dell'utente
 * @param {string} newState - il nuovo stato
 * @param {Object} currentPanels - stato attuale pannelli { leftPanel, bottomPanel, unlim, toolbar }
 * @param {Object} manualOverrides - pannelli settati manualmente dall'utente (non toccare)
 * @returns {Object} - nuovo stato pannelli da applicare
 */
export function computePanelActions(newState, currentPanels, manualOverrides = {}) {
  const suggested = STATE_PANELS[newState] || STATE_PANELS[STATES.CLEAN];
  const result = {};

  for (const key of Object.keys(suggested)) {
    if (manualOverrides[key]) {
      // L'utente ha settato questo pannello manualmente — rispetta la sua scelta
      result[key] = currentPanels[key];
    } else {
      result[key] = suggested[key];
    }
  }

  return result;
}
