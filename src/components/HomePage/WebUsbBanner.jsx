/**
 * WebUsbBanner.jsx — iter 76 B-3 R5 R5b HomePage WebUSB cross-compile banner.
 *
 * Iter 76 ARCHITECTURAL PIVOT (Andrea 2026-05-17): "Non deve essere qualcosa
 * che scarichi. Deve funzionare DIRETTAMENTE dalla piattaforma elabtutor."
 *
 * Replaces iter 65-66 local agent download direction (preserved
 * CompileAgentBanner.jsx legacy ZERO regression mandate). HomePage iter 76-B.4
 * env flag VITE_USE_LOCAL_AGENT default false → WebUsbBanner; true → legacy
 * CompileAgentBanner dev fallback.
 *
 * 3 states surfaced docente (NO download CTA — cloud compile + WebUSB direct):
 *   1. Chrome/Edge + WebUSB available → Lime "Compila & Carica pronto"
 *   2. Safari → Orange "Safari NON supporta WebUSB. Aprite Chrome OR Edge"
 *   3. Firefox → Orange "Firefox NON supporta WebUSB. Aprite Chrome OR Edge"
 *   4. Unknown → Navy graceful "Aprite Chrome OR Edge versione recente"
 *
 * NO polling (capability detect pure synchronous + render-time safe).
 * NO download URL (cross-compile via Render cloud service iter 76-A).
 * NO installer (browser is the install).
 *
 * Compliance gate (CLAUDE.md §Design):
 *   ✅ Palette CSS vars Navy/Lime/Orange/Red (reuse CompileAgentBanner module)
 *   ✅ Font Oswald (titoli) + Open Sans (body)
 *   ✅ Touch target ≥44px button
 *   ✅ WCAG AA contrast 4.5:1
 *   ✅ ARIA role="status" + aria-live="polite"
 *   ✅ Italian docente professional tone
 *   ✅ PRINCIPIO ZERO kit fisico Nano R4 mention
 *
 * @copyright © Andrea Marro — 2026 — ELAB Tutor iter 76 B-3
 */
import React, { useEffect, useState } from 'react';
import { detectWebUSBCapability } from '../../services/webUsbDetect.js';
import { CheckIcon, WarningIcon, DesktopIcon } from '../common/ElabIcons.jsx';
import styles from './CompileAgentBanner.module.css';

/**
 * WebUsbBanner — single-purpose presentational widget surfacing WebUSB
 * cross-compile readiness on HomePage between hero and 4-card grid.
 *
 * @param {object} [props]
 * @param {string} [props.openCompilerUrl] Override CTA URL (default '#compile-home' iter 87 PHASE 4
 *   — Andrea reported HomePage CTA "non fa fare nulla"; root cause: banner CTA misrouted to
 *   #lavagna instead of #compile-home iter 73 cross-compile entry; reproduced Chrome MCP prod).
 * @returns {JSX.Element|null}
 */
export default function WebUsbBanner({ openCompilerUrl = '#compile-home' } = {}) {
  const [cap, setCap] = useState(null);

  useEffect(() => {
    try {
      setCap(detectWebUSBCapability());
    } catch (_) {
      setCap({ webUsbAvailable: false, browser: 'unknown', recommendation: 'Errore rilevamento browser.' });
    }
  }, []);

  if (cap === null) return null; // pre-detect, no flash

  // ── State 1: WebUSB available (Chrome/Edge) ────────────────────────
  if (cap.webUsbAvailable) {
    return (
      <aside
        className={`${styles.banner} ${styles.bannerOnline}`}
        role="status"
        aria-live="polite"
        aria-label="Browser pronto — Compila e Carica funzionano sul kit Arduino Nano R4"
        data-testid="webusb-banner"
        data-state="supported"
        data-browser={cap.browser}
      >
        <span className={`${styles.iconWrap} ${styles.iconOnline}`} aria-hidden="true">
          <CheckIcon size={22} />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>
            Compila & Carica pronto su Nano R4
          </p>
          <p className={styles.subtitle}>
            Programmate la scheda direttamente dal browser. Nessun download
            necessario.
          </p>
        </div>
        {openCompilerUrl ? (
          <div className={styles.actions}>
            <a
              href={openCompilerUrl}
              className={styles.buttonSecondary}
              data-testid="webusb-open-compiler"
              aria-label="Apri il Compilatore ELAB"
            >
              Apri il Compilatore
            </a>
          </div>
        ) : null}
      </aside>
    );
  }

  // ── State 2/3: Safari OR Firefox NOT supported ─────────────────────
  if (cap.browser === 'safari' || cap.browser === 'firefox') {
    const browserLabel = cap.browser === 'safari' ? 'Safari' : 'Firefox';
    return (
      <aside
        className={`${styles.banner} ${styles.bannerCta}`}
        role="status"
        aria-live="polite"
        aria-label={`${browserLabel} non supporta il caricamento dal browser. Aprite Chrome o Edge su computer.`}
        data-testid="webusb-banner"
        data-state="unsupported"
        data-browser={cap.browser}
      >
        <span className={`${styles.iconWrap} ${styles.iconCta}`} aria-hidden="true">
          <WarningIcon size={22} />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>
            {browserLabel} non va bene per il Compilatore
          </p>
          <p className={styles.subtitle}>
            Aprite Chrome o Edge (su computer, non tablet) per programmare il
            Nano R4 del kit ELAB direttamente dal browser.
          </p>
        </div>
      </aside>
    );
  }

  // ── State 4: Unknown browser graceful fallback ─────────────────────
  return (
    <aside
      className={`${styles.banner} ${styles.bannerInfo}`}
      role="status"
      aria-live="polite"
      aria-label="Aprite Chrome o Edge per usare il Compilatore"
      data-testid="webusb-banner"
      data-state="unsupported"
      data-browser="unknown"
    >
      <span className={`${styles.iconWrap} ${styles.iconInfo}`} aria-hidden="true">
        <DesktopIcon size={22} />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>
          Browser non riconosciuto
        </p>
        <p className={styles.subtitle}>
          Aprite Chrome o Edge (versione recente, su computer) per programmare
          il Nano R4 del kit ELAB direttamente dal browser.
        </p>
      </div>
    </aside>
  );
}
