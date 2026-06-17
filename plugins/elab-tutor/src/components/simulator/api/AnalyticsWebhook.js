/**
 * ELAB Simulator — Analytics Webhook
 * POST fire-and-forget al backend per tracciamento uso simulatore
 * © Andrea Marro — 10/02/2026
 *
 * GDPR: analytics events are only sent if the user has given explicit consent.
 * Consent is stored in localStorage under 'elab_consent' with value 'accepted' or 'rejected'.
 * The ConsentBanner component is the single writer for this key.
 */

const WEBHOOK_URL = import.meta.env.VITE_ANALYTICS_WEBHOOK || '';
const CONSENT_KEY = 'elab_consent';

/**
 * Controlla se l'utente ha dato il consenso analytics.
 * Ritorna true SOLO se il valore è esattamente 'accepted'.
 * Se 'rejected', null, o qualsiasi altro valore → false → analytics bloccati.
 * @returns {boolean}
 */
export function hasAnalyticsConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Invia evento analytics (fire-and-forget, non blocca UI)
 * @param {string} event — tipo evento (es. "experiment_loaded", "simulation_started")
 * @param {object} data — dati aggiuntivi
 */
export function sendAnalyticsEvent(event, data = {}) {
  if (!WEBHOOK_URL) {
    return;
  }
  if (!hasAnalyticsConsent()) return;

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    ...data,
  };

  // Fire and forget — non attendiamo la risposta
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        WEBHOOK_URL,
        JSON.stringify(payload)
      );
    } else {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Silenzioso — analytics non devono mai rompere l'app
      });
    }
  } catch {
    // Silenzioso
  }
}

/**
 * Genera/recupera session ID per raggruppare eventi
 */
function getSessionId() {
  let id = sessionStorage.getItem('elab-sim-session');
  if (!id) {
    id = 'sim-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
    sessionStorage.setItem('elab-sim-session', id);
  }
  return id;
}

/**
 * Eventi predefiniti
 */
export const EVENTS = {
  EXPERIMENT_LOADED: 'experiment_loaded',
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_PAUSED: 'simulation_paused',
  SIMULATION_RESET: 'simulation_reset',
  COMPONENT_INTERACTED: 'component_interacted',
  CODE_VIEWED: 'code_viewed',
  SERIAL_USED: 'serial_used',
  VOLUME_SELECTED: 'volume_selected',
  ERROR: 'simulator_error',
};

export default { sendAnalyticsEvent, EVENTS, hasAnalyticsConsent };
