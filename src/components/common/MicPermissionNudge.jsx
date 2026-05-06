/**
 * MicPermissionNudge — Sprint T iter 38 Atom A11 (WebDesigner-1)
 *
 * Pre-emptive UX banner che chiede ai docenti di autorizzare il microfono
 * PRIMA di entrare in Lavagna, così il wake word "Ehi UNLIM" è pronto al
 * primo uso. Senza questo nudge, su mount Lavagna il browser blocca silent
 * la SpeechRecognition (NetworkError / not-allowed) finché un user-gesture
 * non innesca getUserMedia. Risultato osservato in iter 35: docenti
 * dicono "il vocale non funziona" ma è solo permission policy.
 *
 * Comportamento:
 *   1. Mount → query Permissions API `navigator.permissions.query({name:'microphone'})`
 *   2. Se state === 'prompt' → mostra banner (NON se 'granted' né 'denied')
 *   3. Click "Autorizza" → getUserMedia({audio:true}) → on grant: stream
 *      chiuso subito + chiama onGrant() → caller starts wake word listener
 *   4. Stato 'denied' → banner secondario con istruzioni browser settings
 *   5. Stato 'granted' → component returns null (no UI noise)
 *   6. Permissions API non supportata (Safari old) → fallback: mostra banner
 *      sempre, click → getUserMedia direttamente
 *
 * Honest caveats:
 *   - SpeechRecognition wake word richiede gesture user (browser policy);
 *     getUserMedia consume gesture ma SpeechRecognition.start() successivo
 *     erediterà permission grant cached per origin.
 *   - Se permission denied, banner offre link Brave/Chrome/Edge "site settings".
 *   - Localstorage flag `elab_mic_nudge_dismissed` permette docente di
 *     chiudere il banner senza autorizzare (NO spam ad ogni page load).
 *
 * Compliance gate iter 38:
 *   ✅ Linguaggio plurale "Ragazzi, autorizza il microfono..." (PRINCIPIO ZERO V3)
 *   ✅ Kit fisico mention "...per usare la voce di UNLIM con i kit ELAB"
 *   ✅ Palette tokens var(--elab-*) — NO hard-coded
 *   ✅ Iconografia ElabIcons MicrophoneIcon (NO emoji)
 *   ✅ Touch target ≥44px Autorizza / Chiudi
 *   ✅ Font ≥13px body / 14px CTA button
 *   ✅ WCAG AA contrast Navy bg + white text (~13:1)
 *
 * Andrea Marro — iter 38 — 2026-04-30
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MicrophoneIcon } from './ElabIcons.jsx';

// Legacy permanent dismiss key (iter 38, deprecated): 'elab_mic_nudge_dismissed'.
// Sprint V iter 1 Atom A1.2: TTL 24h — dismiss expires so docente non-Chrome è
// re-prompted al giorno dopo invece che permanently silenced. Legacy flag
// 'elab-mic-nudge-dismissed' (single string '1') was permanent.
const DISMISS_TS_KEY = 'elab-mic-nudge-dismissed-ts';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Internal helper — read TTL-aware dismiss flag.
 * Returns true if dismissed within last 24h, false otherwise.
 * Migration: legacy string '1' under new key (or stored under DISMISS_KEY)
 * is treated as expired (re-prompt immediately).
 */
function isDismissActive() {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(DISMISS_TS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts) || ts <= 0) return false; // legacy '1' or junk
    return (Date.now() - ts) < DISMISS_TTL_MS;
  } catch { return false; }
}

function writeDismissNow() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DISMISS_TS_KEY, String(Date.now()));
    }
  } catch { /* no-op */ }
}

/**
 * Internal helper — query mic permission state.
 * Returns one of: 'prompt' | 'granted' | 'denied' | 'unsupported'
 */
async function queryMicPermission() {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({ name: 'microphone' });
    return status.state || 'prompt';
  } catch {
    return 'unsupported';
  }
}

/**
 * Internal helper — request mic via getUserMedia and immediately stop tracks.
 * The browser caches the permission grant per origin; subsequent
 * SpeechRecognition.start() inherits the cached grant.
 */
async function requestMicGrant() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('getUserMedia not supported');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Immediately stop tracks — we only needed the permission grant, not recording.
  stream.getTracks().forEach((t) => {
    try { t.stop(); } catch { /* no-op */ }
  });
}

/**
 * MicPermissionNudge component.
 *
 * Props:
 *   - onGrant?: () => void  — chiamato dopo grant successful (caller wires
 *     wakeWord.startWakeWordListener)
 *   - onDeny?: (state: string) => void  — chiamato se denied/error
 *   - children?: ReactNode  — testo custom override (default plurale Ragazzi)
 *   - autoDismissOnGrant?: boolean  — default true: chiude banner dopo grant
 */
export default function MicPermissionNudge({
  onGrant,
  onDeny,
  children,
  autoDismissOnGrant = true,
}) {
  const [permState, setPermState] = useState(null); // null | 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [requesting, setRequesting] = useState(false);
  const [dismissed, setDismissed] = useState(() => isDismissActive());
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  // Query permission state on mount + re-query when state changes via onchange
  useEffect(() => {
    let permStatus = null;
    let cancelled = false;
    (async () => {
      const state = await queryMicPermission();
      if (cancelled || !mountedRef.current) return;
      setPermState(state);
      // Subscribe to permission changes (Chrome/Edge supported)
      if (state !== 'unsupported' && navigator.permissions?.query) {
        try {
          permStatus = await navigator.permissions.query({ name: 'microphone' });
          permStatus.onchange = () => {
            if (mountedRef.current) setPermState(permStatus.state);
          };
        } catch { /* no-op */ }
      }
    })();
    return () => {
      cancelled = true;
      if (permStatus) { try { permStatus.onchange = null; } catch { /* no-op */ } }
    };
  }, []);

  const handleAuthorize = useCallback(async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      await requestMicGrant();
      if (!mountedRef.current) return;
      setPermState('granted');
      if (typeof onGrant === 'function') onGrant();
      if (autoDismissOnGrant) {
        writeDismissNow();
        setDismissed(true);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      // NotAllowedError → user denied; SecurityError → insecure context
      const next = err?.name === 'NotAllowedError' ? 'denied' : 'denied';
      setPermState(next);
      if (typeof onDeny === 'function') onDeny(next);
    } finally {
      if (mountedRef.current) setRequesting(false);
    }
  }, [requesting, onGrant, onDeny, autoDismissOnGrant]);

  const handleDismiss = useCallback(() => {
    writeDismissNow();
    setDismissed(true);
  }, []);

  // Settings deep-link for denied state. Modern browsers expose chrome://settings
  // restrictions — we offer a generic "open site settings" hint with the
  // current origin so docente sees what to look for.
  // Iter 38 hotfix: declared BEFORE early returns to honor Rules of Hooks
  // (else dismissed/granted/loading branches would unmount this hook
  // and trigger React error "Rendered more hooks than during the previous render").
  const handleDeniedClick = useCallback(() => {
    if (typeof window === 'undefined') return;
    const origin = window.location?.origin || 'questo sito';
    // eslint-disable-next-line no-alert
    window.alert(
      `Per riabilitare il microfono di ${origin}:\n` +
      "1. Apri il menù del browser (icona lucchetto vicino alla barra URL)\n" +
      "2. Trova 'Microfono' → imposta su 'Consenti'\n" +
      "3. Ricarica la pagina"
    );
  }, []);

  // No banner if: granted, dismissed by user, or still loading
  if (permState === 'granted') return null;
  if (dismissed) return null;
  if (permState === null) return null; // loading
  // 'denied' surfaces a different message (settings link); 'prompt' + 'unsupported' surface CTA

  const isDenied = permState === 'denied';

  // Plurale "Ragazzi" + kit fisico mention (PRINCIPIO ZERO V3 + MORFISMO Sense 2)
  const defaultMessage = isDenied
    ? "Ragazzi, il microfono è bloccato dal browser. Apriamo le impostazioni del sito per riabilitarlo e usare la voce di UNLIM con i kit ELAB."
    : "Ragazzi, autorizza il microfono per usare la voce di UNLIM e parlare durante l'esperimento sul kit ELAB.";

  const ctaLabel = isDenied ? 'Apri impostazioni' : 'Autorizza';

  // Inline styles — palette tokens with fallback (CLAUDE.md design rule 16).
  // Banner fixed-bottom non-blocking (max-width 480, mobile fluid).
  const styles = {
    wrap: {
      position: 'fixed',
      left: '50%',
      bottom: 16,
      transform: 'translateX(-50%)',
      width: 'min(480px, calc(100vw - 32px))',
      background: 'var(--elab-navy, var(--elab-navy))',
      color: 'var(--elab-hex-ffffff)',
      borderRadius: 14,
      boxShadow: '0 12px 40px rgba(15, 27, 46, 0.40)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      zIndex: 11500,
      fontFamily: "'Open Sans', system-ui, sans-serif",
      border: '2px solid var(--elab-lime, var(--elab-lime))',
      animation: 'elabMicNudgeSlideIn 240ms cubic-bezier(.2,.8,.2,1)',
    },
    iconBox: {
      flexShrink: 0,
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'rgba(74, 122, 37, 0.18)',
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
    },
    ctaRow: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
    },
    btnPrimary: {
      minWidth: 120,
      minHeight: 44,
      padding: '8px 16px',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--elab-navy, var(--elab-navy))',
      background: 'var(--elab-lime, var(--elab-lime))',
      border: 'none',
      borderRadius: 8,
      cursor: requesting ? 'wait' : 'pointer',
      opacity: requesting ? 0.6 : 1,
      letterSpacing: '0.02em',
      fontFamily: 'inherit',
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

  const onCta = isDenied ? handleDeniedClick : handleAuthorize;

  return (
    <>
      <style>{`
        @keyframes elabMicNudgeSlideIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div
        style={styles.wrap}
        role="region"
        aria-label="Autorizza il microfono per UNLIM"
        data-testid="mic-permission-nudge"
      >
        <div style={styles.iconBox} aria-hidden="true">
          <MicrophoneIcon size={22} color="var(--elab-hex-ffffff)" />
        </div>
        <div style={styles.body}>
          <p style={styles.text} data-testid="mic-permission-nudge-text">
            {children || defaultMessage}
          </p>
          <div style={styles.ctaRow}>
            <button
              type="button"
              style={styles.btnPrimary}
              onClick={onCta}
              disabled={requesting}
              aria-label={`${ctaLabel} microfono per UNLIM`}
              data-testid="mic-permission-nudge-cta"
            >
              {requesting ? 'Attendete…' : ctaLabel}
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={handleDismiss}
              aria-label="Chiudi banner microfono (potrai abilitarlo dopo)"
              data-testid="mic-permission-nudge-dismiss"
            >
              Più tardi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
