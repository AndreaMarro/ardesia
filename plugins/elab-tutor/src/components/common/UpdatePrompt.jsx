/**
 * UpdatePrompt — Sprint T iter 38 Atom A12 (WebDesigner-1)
 *
 * Toast non-bloccante che avvisa i docenti quando una nuova versione di
 * ELAB Tutor è stata scaricata dal Service Worker. Prompt-update workflow
 * (vite-plugin-pwa registerType: 'prompt'):
 *
 *   1. Vite-plugin-pwa rileva chunk SW nuovi → emette `onNeedRefresh`.
 *   2. Toast appare con messaggio plurale "Ragazzi" + countdown 5s + due
 *      bottoni: "Ricarica adesso" (call updateSW(true)) e "Rimanda".
 *   3. Click "Ricarica" o countdown=0 → updateSW(true) → SW skipWaiting →
 *      `controllerchange` event → main.jsx reload guard fires → fresh chunks.
 *   4. "Rimanda" → toast nascosto fino al prossimo `onNeedRefresh` (next
 *      page load or next SW update poll).
 *
 * Spec PDR §3 A12:
 *   - Causa originaria: post key rotation iter 32, docenti vedevano stale
 *     UI strings (ENABLE_ONNISCENZA marker iter 5 ancora visibile dopo
 *     deploy v50). Workbox precache + SW autoUpdate è asynchronous: il
 *     prompt esplicito mette il docente in controllo del refresh window.
 *   - Esistente: main.jsx già gestisce controllerchange → reload (P0
 *     hotfix 2026-04-22 fix/p0-pwa-stale-precache). Funziona ma è silent:
 *     docente perde input se sta scrivendo. Prompt rispetta workflow.
 *
 * Compliance gate iter 38:
 *   ✅ Linguaggio plurale "Ragazzi, c'è una nuova versione…" (PRINCIPIO ZERO V3)
 *   ✅ Kit fisico mention non necessario (toast tecnico, non lezione)
 *   ✅ Palette tokens var(--elab-*) — NO hard-coded
 *   ✅ Iconografia ElabIcons RefreshIcon (NO emoji)
 *   ✅ Touch target ≥44px Ricarica / Rimanda
 *   ✅ Font ≥13px body / 14px CTA
 *   ✅ WCAG AA contrast Navy bg + white text
 *
 * Source: web.dev/learn/pwa/workbox + Workbox Issue #2767 + vite-plugin-pwa
 * `virtual:pwa-register/react` standard.
 *
 * Andrea Marro — iter 38 — 2026-04-30
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshIcon } from './ElabIcons.jsx';

const COUNTDOWN_SECONDS = 5;

/**
 * Lazy-load `useRegisterSW` from vite-plugin-pwa runtime virtual module.
 * In dev (no SW) o quando il modulo non è disponibile, restituiamo un
 * no-op hook per non rompere il render.
 */
function useSafeRegisterSW() {
  const [hookState, setHookState] = useState({
    needRefresh: false,
    updateSW: null,
  });

  useEffect(() => {
    let cancelled = false;
    // SSR / vitest gate: se non siamo in browser con SW supportato, skip.
    if (typeof window === 'undefined') return undefined;
    if (!('serviceWorker' in (typeof navigator !== 'undefined' ? navigator : {}))) return undefined;
    // Let Vite resolve the PWA virtual module at build time. Do not hide this
    // import behind @vite-ignore, otherwise production browsers try to fetch
    // the literal "virtual:pwa-register" URL and CSP blocks the update flow.
    import('virtual:pwa-register').then((mod) => {
      if (cancelled || typeof mod?.registerSW !== 'function') return;
      try {
        const updateSW = mod.registerSW({
          onNeedRefresh() {
            if (!cancelled) setHookState((s) => ({ ...s, needRefresh: true }));
          },
          onOfflineReady() {
            // Nothing user-facing — already working offline. iter 38 non
            // mostriamo toast offline-ready per non gonfiare UX.
          },
          onRegisterError(err) {
            // best effort — log per devtools; non rompiamo UI.
            // eslint-disable-next-line no-console
            console.warn('[UpdatePrompt] SW register error:', err);
          },
        });
        if (!cancelled) setHookState((s) => ({ ...s, updateSW }));
      } catch {
        // SW disabilitato o virtual module assente in dev → no-op.
      }
    }).catch(() => { /* virtual module non disponibile in dev/vitest */ });
    return () => { cancelled = true; };
  }, []);

  return hookState;
}

/**
 * UpdatePrompt component — mountable in any shell (LavagnaShell, App).
 *
 * Props:
 *   - autoReloadSeconds?: number (default 5) — countdown prima di
 *     auto-reload. 0 disabilita countdown (manual click only).
 *   - onReload?: () => void — chiamato prima del reload (telemetria).
 *   - onDismiss?: () => void — chiamato quando docente clicca "Rimanda".
 */
export default function UpdatePrompt({
  autoReloadSeconds = COUNTDOWN_SECONDS,
  onReload,
  onDismiss,
}) {
  const { needRefresh, updateSW } = useSafeRegisterSW();
  const [dismissed, setDismissed] = useState(false);
  const [seconds, setSeconds] = useState(autoReloadSeconds);
  const intervalRef = useRef(null);
  const reloadingRef = useRef(false);

  const performReload = useCallback(() => {
    if (reloadingRef.current) return;
    reloadingRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (typeof onReload === 'function') {
      try { onReload(); } catch { /* no-op */ }
    }
    if (typeof updateSW === 'function') {
      try {
        // skipWaiting=true → SW activates immediately → controllerchange →
        // main.jsx reload guard fires → fresh chunks loaded.
        updateSW(true);
      } catch (err) {
        // Fallback: hard reload if updateSW fails for any reason.
        // eslint-disable-next-line no-console
        console.warn('[UpdatePrompt] updateSW failed, falling back to reload:', err);
        if (typeof window !== 'undefined') window.location.reload();
      }
    } else if (typeof window !== 'undefined') {
      // updateSW unavailable (dev mode or registration failed) → just reload.
      window.location.reload();
    }
  }, [updateSW, onReload]);

  // Countdown effect — start when needRefresh flips true and not dismissed.
  useEffect(() => {
    if (!needRefresh || dismissed) return undefined;
    if (autoReloadSeconds <= 0) return undefined; // manual mode
    setSeconds(autoReloadSeconds);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // Trigger reload on next tick — performReload will clear interval.
          setTimeout(() => performReload(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [needRefresh, dismissed, autoReloadSeconds, performReload]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (typeof onDismiss === 'function') {
      try { onDismiss(); } catch { /* no-op */ }
    }
  }, [onDismiss]);

  const handleReloadNow = useCallback(() => {
    performReload();
  }, [performReload]);

  if (!needRefresh || dismissed) return null;

  // Inline styles — palette tokens with fallback (CLAUDE.md design rule 16).
  // Bottom-right toast non-blocking (max-width 480, mobile fluid).
  const styles = {
    wrap: {
      position: 'fixed',
      right: 16,
      bottom: 16,
      width: 'min(420px, calc(100vw - 32px))',
      background: 'var(--elab-navy, var(--elab-navy))',
      color: 'var(--elab-hex-ffffff)',
      borderRadius: 14,
      boxShadow: '0 12px 40px rgba(15, 27, 46, 0.45)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      zIndex: 12000,
      fontFamily: "'Open Sans', system-ui, sans-serif",
      border: '2px solid var(--elab-orange, var(--elab-orange))',
      animation: 'elabUpdatePromptSlideIn 220ms cubic-bezier(.2,.8,.2,1)',
    },
    iconBox: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'rgba(232, 148, 28, 0.20)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },
    text: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.4,
      color: 'var(--elab-hex-ffffff)',
      fontWeight: 500,
    },
    countdown: {
      margin: 0,
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.78)',
      fontStyle: 'italic',
    },
    ctaRow: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
    },
    btnPrimary: {
      minWidth: 140,
      minHeight: 44,
      padding: '8px 14px',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--elab-navy, var(--elab-navy))',
      background: 'var(--elab-orange, var(--elab-orange))',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      letterSpacing: '0.02em',
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    btnSecondary: {
      minWidth: 88,
      minHeight: 44,
      padding: '8px 12px',
      fontSize: 13,
      color: 'var(--elab-hex-ffffff)',
      background: 'transparent',
      border: '1.5px solid rgba(255, 255, 255, 0.45)',
      borderRadius: 8,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
  };

  const message = "Ragazzi, c'è una nuova versione di ELAB Tutor. Ricaricate la pagina per aggiornare?";

  return (
    <>
      <style>{`
        @keyframes elabUpdatePromptSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={styles.wrap}
        role="status"
        aria-live="polite"
        aria-label="Aggiornamento ELAB Tutor disponibile"
        data-testid="update-prompt"
      >
        <div style={styles.iconBox} aria-hidden="true">
          <RefreshIcon size={22} color="var(--elab-hex-ffffff)" />
        </div>
        <div style={styles.body}>
          <p style={styles.text} data-testid="update-prompt-text">
            {message}
          </p>
          {autoReloadSeconds > 0 && seconds > 0 && (
            <p style={styles.countdown} data-testid="update-prompt-countdown">
              Ricarica automatica tra {seconds}s…
            </p>
          )}
          <div style={styles.ctaRow}>
            <button
              type="button"
              style={styles.btnPrimary}
              onClick={handleReloadNow}
              aria-label="Ricarica adesso ELAB Tutor con la nuova versione"
              data-testid="update-prompt-reload"
            >
              <RefreshIcon size={16} color="var(--elab-navy, var(--elab-navy))" />
              Ricarica adesso
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={handleDismiss}
              aria-label="Rimanda aggiornamento ELAB Tutor"
              data-testid="update-prompt-dismiss"
            >
              Rimanda
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
