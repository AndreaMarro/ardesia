/**
 * useOverlayQueue — Serializzazione overlay primo-accesso.
 *
 * Feature-map 2026-04-24 §0 flag top-5 #4: fino a 4 overlay simultanei
 * (ConsentBanner + OnboardingTooltip + BentornatiOverlay + ExperimentPicker)
 * paralizzano il docente nei primi 10 secondi (Principio Zero v3).
 *
 * Priorità coda (alta → bassa):
 *   1. consent     — ConsentBanner (minori, solo su route student-facing)
 *   2. welcome     — OnboardingTooltip ("Scegli come iniziare")
 *   3. bentornati  — BentornatiOverlay (Principio Zero welcome)
 *   4. picker      — ExperimentPicker (ultimo, dopo Bentornati o welcome dismissed)
 *
 * L'overlay più alto in priorità blocca quelli sotto finché non è dismesso.
 * Dismiss propagato via 'elab-overlay-change' CustomEvent (+ storage event
 * cross-tab). Ogni overlay chiama `markDismissed(name)` all'atto di chiusura.
 *
 * © Andrea Marro — 24/04/2026
 */

import { useEffect, useState } from 'react';

const CONSENT_STORAGE_KEY = 'elab_gdpr_consent';
const ONBOARDING_KEY = 'elab_onboarding_seen';

/**
 * True se ConsentBanner deve mostrarsi ORA (route student-facing + consenso
 * pending). Allineato con isConsentRouteAllowed in App.jsx.
 */
const CONSENT_SKIP_HASHES = new Set([
  'lavagna', 'tutor', 'dashboard', 'dashboard-v2',
  'teacher', 'admin', 'account', 'login', 'register',
]);

export function isConsentBannerPending() {
  if (typeof window === 'undefined') return false;
  try {
    const path = window.location.pathname || '';
    if (path.startsWith('/scuole')) return false;
    const hash = (window.location.hash.replace('#', '').split('?')[0] || '').toLowerCase();
    if (CONSENT_SKIP_HASHES.has(hash)) return false;
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    const status = parsed?.status;
    return status === 'parental_required' || status === 'parental_sent';
  } catch {
    return false;
  }
}

/** True se OnboardingTooltip non è ancora stato dismesso. */
export function isOnboardingPending() {
  if (typeof window === 'undefined') return false;
  try {
    return !window.localStorage.getItem(ONBOARDING_KEY);
  } catch {
    return false;
  }
}

/** Notifica gli hook montati che la coda va rivalutata (post-dismiss). */
export function markOverlayDismissed() {
  if (typeof window === 'undefined') return;
  try { window.dispatchEvent(new CustomEvent('elab-overlay-change')); } catch { /* jsdom */ }
}

/**
 * @param {'consent'|'welcome'|'bentornati'|'picker'} name
 * @returns {boolean} true se l'overlay ha il turno (nessuno più prioritario pending)
 */
export default function useOverlayQueue(name) {
  const [canShow, setCanShow] = useState(() => resolveCanShow(name));
  useEffect(() => {
    const refresh = () => setCanShow(resolveCanShow(name));
    window.addEventListener('storage', refresh);
    window.addEventListener('elab-overlay-change', refresh);
    window.addEventListener('hashchange', refresh);
    window.addEventListener('popstate', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('elab-overlay-change', refresh);
      window.removeEventListener('hashchange', refresh);
      window.removeEventListener('popstate', refresh);
    };
  }, [name]);
  return canShow;
}

function resolveCanShow(name) {
  const consent = isConsentBannerPending();
  switch (name) {
    case 'consent':
      return true;
    case 'welcome':
      // OnboardingTooltip (#tutor/#prova) — dopo consent
      return !consent;
    case 'bentornati':
      // BentornatiOverlay (#lavagna) — dopo consent (consent è già gated da route)
      return !consent;
    case 'picker':
      // ExperimentPicker (#lavagna) — dopo consent + dopo Bentornati (gated in-loco).
      // `onboarding` non si applica a #lavagna dove TutorLayout non è montato.
      return !consent;
    default:
      return true;
  }
}

// Export for tests / future hooks that need to gate via onboarding state.
export { resolveCanShow as __resolveCanShow };
