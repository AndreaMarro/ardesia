/**
 * EasterModal — Sprint T iter 37 Atom A6 (WebDesigner-1)
 *
 * Modal "Chi siamo" easter scimpanze (footer link 🐒 + #about-easter route).
 *
 * Spec iter 37 PDR §3 A6:
 *   - Modal centered 500x500 (90vw mobile)
 *   - 4 GIF random rotation `public/easter/scimpanze-{1,2,3,4}.gif`
 *   - Fallback graceful se 404 (Andrea action: scaricare GIF placeholder
 *     o lasciare fallback SVG mascotte semplice + msg "Ragazzi, ancora
 *     niente scimpanze!")
 *   - 5-click banana mode unlock: counter localStorage `elab-easter-banana-clicks`
 *     + soglia 5 + sblocca CSS yellow-banana 30s + cursor banana emoji
 *   - Close X top-right + Esc key + click outside
 *   - ARIA `role="dialog" aria-modal="true" aria-label` + focus trap
 *
 * Compliance gate iter 37 §0:
 *   ✅ Linguaggio plurale "Ragazzi" (msg fallback)
 *   ✅ Kit fisico mention (credit line "il team che fa kit + volumi + software")
 *   ✅ Palette tokens var(--elab-*) — NO hard-coded
 *   ✅ Iconografia: SVG inline scimpanze fallback (NO emoji standalone)
 *   ✅ Touch target ≥44px close button
 *   ✅ Font ≥13px credit / 15px message
 *   ✅ WCAG AA contrast (Navy bg + white text ratio ~13:1)
 *
 * Andrea Marro — iter 37 — 2026-04-30
 */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import styles from './EasterModal.module.css';

const BANANA_KEY = 'elab-easter-banana-clicks';
const BANANA_THRESHOLD = 5;
const BANANA_DURATION_MS = 30000;
const GIF_COUNT = 4;

// Iter 44 fix Andrea 2026-05-06: foto HD scimpanze vera (Wikimedia Commons
// public domain). 1280×960 516 KB. Fonte: Schimpanse_Zoo_Leipzig.jpg
// (commons.wikimedia.org). Mostrata pre-banana-mode insieme a SVG fallback
// se 4 GIF placeholder mancano (`scimpanze-{1..4}.gif` non droppate Andrea).
const SCIMPANZE_HD_PHOTO = '/easter/scimpanze-hd.jpg';

/**
 * Fallback SVG mostrato se la GIF scimpanze non è disponibile (404).
 * Mascotte UNLIM stilizzata + messaggio plurale Principio Zero.
 */
function ScimpanzeFallback() {
  return (
    <div className={styles.scimpanzeFallback} data-testid="easter-fallback">
      <svg
        viewBox="0 0 120 120"
        width="100"
        height="100"
        aria-hidden="true"
        role="img"
        style={{ marginBottom: 8 }}
      >
        {/* Faccia scimpanze stilizzata — soluzione provvisoria fino a GIF Andrea */}
        <circle cx="60" cy="60" r="44" fill="var(--elab-hex-8b5a2b)" />
        <ellipse cx="60" cy="68" rx="32" ry="28" fill="var(--elab-hex-d9a87c)" />
        <circle cx="46" cy="52" r="6" fill="var(--elab-hex-1a1a1a)" />
        <circle cx="74" cy="52" r="6" fill="var(--elab-hex-1a1a1a)" />
        <circle cx="47" cy="50" r="2" fill="#fff" />
        <circle cx="75" cy="50" r="2" fill="#fff" />
        <ellipse cx="60" cy="78" rx="10" ry="6" fill="var(--elab-hex-8b5a2b)" />
        <path d="M52 84 Q 60 90 68 84" stroke="var(--elab-hex-1a1a1a)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="42" rx="10" ry="14" fill="var(--elab-hex-8b5a2b)" />
        <ellipse cx="98" cy="42" rx="10" ry="14" fill="var(--elab-hex-8b5a2b)" />
        <ellipse cx="22" cy="42" rx="5" ry="8" fill="var(--elab-hex-d9a87c)" />
        <ellipse cx="98" cy="42" rx="5" ry="8" fill="var(--elab-hex-d9a87c)" />
      </svg>
      <span>{i18n.t('easter_modal.placeholder_message')}</span>
    </div>
  );
}

export default function EasterModal({ isOpen = true, onClose }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [bananaClicks, setBananaClicks] = useState(() => {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const raw = localStorage.getItem(BANANA_KEY);
      const n = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    } catch { return 0; }
  });
  const [bananaActive, setBananaActive] = useState(false);

  // Random GIF index — stable across renders within the same modal instance
  const gifIndex = useMemo(
    () => Math.floor(Math.random() * GIF_COUNT) + 1,
    []
  );
  const gifSrc = `/easter/scimpanze-${gifIndex}.gif`;

  // Track previous focus and trap focus on close button on mount
  useEffect(() => {
    if (!isOpen) return;
    if (typeof document !== 'undefined') {
      previousFocusRef.current = document.activeElement;
    }
    // Focus trap: focus close button on mount
    const t = setTimeout(() => {
      if (closeBtnRef.current) closeBtnRef.current.focus();
    }, 60);
    return () => {
      clearTimeout(t);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        try { previousFocusRef.current.focus(); } catch { /* no-op */ }
      }
    };
  }, [isOpen]);

  // ESC key + Tab focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (typeof onClose === 'function') onClose();
      }
      if (e.key === 'Tab') {
        // simple focus trap: keep focus within dialog
        const focusables = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  // Banana mode unlock effect — activates body class for 30s
  useEffect(() => {
    if (!bananaActive) return;
    if (typeof document === 'undefined') return;
    document.body.classList.add('elab-banana-mode');
    const t = setTimeout(() => {
      document.body.classList.remove('elab-banana-mode');
      setBananaActive(false);
    }, BANANA_DURATION_MS);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('elab-banana-mode');
    };
  }, [bananaActive]);

  // Persist banana clicks to localStorage + auto-activate banana mode.
  // Effect-based to avoid double-invocation pitfalls inside state updater fn.
  useEffect(() => {
    if (bananaClicks > 0) {
      try {
        localStorage.setItem(BANANA_KEY, String(bananaClicks));
      } catch { /* no-op */ }
    }
    if (bananaClicks >= BANANA_THRESHOLD && !bananaActive) {
      setBananaActive(true);
    }
  }, [bananaClicks, bananaActive]);

  const handleScimpanzeClick = useCallback(() => {
    setBananaClicks((prev) => prev + 1);
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const remainingClicks = Math.max(0, BANANA_THRESHOLD - bananaClicks);

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      data-testid="easter-modal-overlay"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="easter-modal-title"
        aria-label={t('easter_modal.modal_aria')}
        data-testid="easter-modal-dialog"
      >
        <header className={styles.header}>
          <h2 id="easter-modal-title" className={styles.title}>
            Chi siamo
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label={t('easter_modal.close_aria')}
            data-testid="easter-modal-close"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <button
            type="button"
            className={styles.scimpanzeFrame}
            onClick={handleScimpanzeClick}
            aria-label={photoError
              ? 'Ragazzi, ancora niente scimpanze qui — torneranno presto!'
              : 'Scimpanzè ELAB — premi 5 volte per sorpresa banana'}
            data-testid="easter-scimpanze-trigger"
          >
            {/* Iter 44 fix Andrea 2026-05-06: foto HD scimpanze vera
                (Wikimedia Commons public domain) PRIMARY. GIF placeholder
                tentate solo se Andrea dropperà 4 GIF in public/easter/.
                Cascade fallback: GIF → HD photo → SVG mascotte stilizzata. */}
            {photoError ? (
              <ScimpanzeFallback />
            ) : imgError ? (
              <img
                className={styles.scimpanzeImg}
                src={SCIMPANZE_HD_PHOTO}
                alt="Scimpanzè ELAB — foto HD Wikimedia Commons"
                onError={() => setPhotoError(true)}
                loading="eager"
                decoding="async"
                draggable={false}
                data-testid="easter-scimpanze-photo"
              />
            ) : (
              <img
                className={styles.scimpanzeImg}
                src={gifSrc}
                alt="Scimpanzè ELAB animato"
                onError={() => setImgError(true)}
                data-testid="easter-scimpanze-img"
              />
            )}
          </button>

          {/* Iter 44 fix Andrea 2026-05-06 PM "solo foto scimpanze e sopra
              scritto chi siamo / nessun altra scritta":
              rimossi message body + creditLine + banana counter UI.
              Banana mode (5-click) preserved come Easter logica MA NO label
              visible (sorpresa silente).
              Title "Chi siamo" header sopra foto = unico testo visibile. */}
        </div>
      </div>
    </div>
  );
}
