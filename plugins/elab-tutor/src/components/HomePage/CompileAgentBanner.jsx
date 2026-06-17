/**
 * CompileAgentBanner.jsx — Iter 66 P0.3 R5 HomePage banner widget
 *
 * Consume iter 65 R4 browser-side detection helper
 * `src/services/compileAgentDetect.js` (ae13c9e6) and surface ELAB Compile
 * Agent install status to docenti with platform-specific CTA.
 *
 * States rendered (per mandate spec):
 *   1. Mac + installer + ONLINE  → Lime banner "Agent ELAB attivo (v{version})"
 *                                   + secondary CTA "Apri il Compilatore"
 *   2. Mac + installer + OFFLINE → Orange CTA "Carica codice direttamente
 *                                   su Nano R4" + primary button
 *                                   "Installa Agent ELAB (Mac)"
 *   3. Windows / Linux           → Navy neutral "Compilazione cloud
 *                                   disponibile" + "Installer desktop in
 *                                   arrivo iter 67"
 *   4. Unknown platform          → Navy minimal "Compilazione cloud
 *                                   disponibile" (graceful degradation)
 *
 * Behavior:
 *   - useEffect mount → getCompileAgentStatus() (cached helper, 5s TTL)
 *   - 30s setInterval re-poll (cancelled on unmount)
 *   - Initial loading → renders null (no flash banner pre-detect)
 *   - Error in helper → graceful fallback to "Compilazione cloud disponibile"
 *
 * Compliance gate (CLAUDE.md §Design):
 *   ✅ Palette CSS vars (NO hex inline)
 *   ✅ Font Oswald (titoli) / Open Sans (body) / Fira Code (version mono)
 *   ✅ Touch target ≥44px (min-height 44px button)
 *   ✅ WCAG AA contrast 4.5:1 (Navy on white, Lime on white, Orange CTA)
 *   ✅ Iconografia ElabIcons SVG (DownloadIcon / CheckIcon / DesktopIcon)
 *   ✅ Italian language — docente professional tone
 *   ✅ ARIA role="status" + aria-live="polite" for state changes
 *   ✅ Brand voice "Affidabile / Didattico / Accogliente"
 *
 * © Andrea Marro — 2026-05-16 — ELAB Tutor iter 66 P0.3
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCompileAgentStatus,
  getAgentInstallInstructions,
} from '../../services/compileAgentDetect';
import {
  DownloadIcon,
  CheckIcon,
  DesktopIcon,
} from '../common/ElabIcons';
import styles from './CompileAgentBanner.module.css';

/** Re-poll interval for agent status when banner is mounted. */
const POLL_INTERVAL_MS = 30_000;

/**
 * Map R4 instruction record to a derived `installerSupported` flag.
 * The mandate spec called for `installerSupported`, while R4 exposes
 * `detected` + `downloadUrl`. We derive the boolean strictly from the
 * presence of a downloadUrl — that is the only thing we can actually
 * link to. Future iter 67 cross-platform installers will simply
 * populate `downloadUrl` in PLATFORM_TABLE without any change here.
 */
function normalizePlatform(channel) {
  if (!channel || typeof channel !== 'object') {
    return {
      platform: 'unknown',
      installerSupported: false,
      downloadUrl: null,
      label: 'Sconosciuto',
    };
  }
  return {
    platform: channel.platform || 'unknown',
    installerSupported: !!channel.downloadUrl,
    downloadUrl: channel.downloadUrl || null,
    instructionsUrl: channel.instructionsUrl || null,
    label: channel.label || 'Sconosciuto',
  };
}

/**
 * CompileAgentBanner — single-purpose presentational widget rendered
 * between the HomePage hero and the 4-card grid.
 *
 * @param {object} [props]
 * @param {string} [props.openCompilerUrl] Override target for the
 *   "Apri il Compilatore" secondary CTA (default '#compile-home' iter 87 PHASE 4 —
 *   Andrea reported HomePage CTA "non fa fare nulla"; root cause: legacy banner CTA
 *   misrouted to #lavagna instead of #compile-home iter 73 cross-compile entry;
 *   reproduced Chrome MCP prod 2026-05-18).
 * @param {Function} [props.onInstallClick] Optional analytics hook.
 * @returns {JSX.Element|null}
 */
export default function CompileAgentBanner({
  openCompilerUrl = '#compile-home',
  onInstallClick,
} = {}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null); // null = still loading
  const [channel, setChannel] = useState(null); // resolved platform info
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Always resolve platform once on mount — pure synchronous read of
  // navigator.platform via the R4 helper. Safe in SSR (returns 'unknown').
  useEffect(() => {
    try {
      setChannel(normalizePlatform(getAgentInstallInstructions()));
    } catch (_) {
      setChannel(normalizePlatform(null));
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await getCompileAgentStatus();
      if (mountedRef.current) setStatus(result || { available: false });
    } catch (_) {
      if (mountedRef.current) setStatus({ available: false, error: 'probe_error' });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Initial probe on mount.
    refresh();
    // Re-probe every 30s while mounted. Helper has a 5s cache so the
    // network cost is bounded regardless.
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refresh]);

  // Still loading — render nothing rather than flashing a fallback.
  if (status === null || channel === null) return null;

  const handleInstallClick = () => {
    if (typeof onInstallClick === 'function') {
      try { onInstallClick({ platform: channel.platform }); } catch (_) { /* swallow */ }
    }
  };

  const isMac = channel.platform === 'mac' && channel.installerSupported;
  const isWindows = channel.platform === 'win';
  const isLinux = channel.platform === 'linux';

  // ── State 1: Mac + installer + ONLINE ─────────────────────────────
  if (isMac && status.available) {
    const version = typeof status.version === 'string' && status.version
      ? status.version
      : null;
    return (
      <aside
        className={`${styles.banner} ${styles.bannerOnline}`}
        role="status"
        aria-live="polite"
        aria-label={t('compile_agent_banner.active_aria')}
        data-testid="compile-agent-banner"
        data-state="online"
      >
        <span className={`${styles.iconWrap} ${styles.iconOnline}`} aria-hidden="true">
          <CheckIcon size={22} />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>
            Agent ELAB attivo
            {version && (
              <span className={styles.version} data-testid="compile-agent-version">
                v{version}
              </span>
            )}
          </p>
          <p className={styles.subtitle}>
            Caricamento diretto sul Nano R4 abilitato.
          </p>
        </div>
        {openCompilerUrl ? (
          <div className={styles.actions}>
            <a
              href={openCompilerUrl}
              className={styles.buttonSecondary}
              data-testid="compile-agent-open-compiler"
              aria-label={t('compile_agent_banner.open_compiler_aria')}
            >
              Apri il Compilatore
            </a>
          </div>
        ) : null}
      </aside>
    );
  }

  // ── State 2: Mac + installer + OFFLINE ────────────────────────────
  if (isMac && !status.available) {
    return (
      <aside
        className={`${styles.banner} ${styles.bannerCta}`}
        role="status"
        aria-live="polite"
        aria-label={t('compile_agent_banner.install_mac_aria')}
        data-testid="compile-agent-banner"
        data-state="offline"
      >
        <span className={`${styles.iconWrap} ${styles.iconCta}`} aria-hidden="true">
          <DownloadIcon size={22} />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>
            Carica codice direttamente su Nano R4
          </p>
          <p className={styles.subtitle}>
            Installa l'Agent ELAB sul Mac per programmare la scheda dal browser.
          </p>
        </div>
        <div className={styles.actions}>
          <a
            href={channel.downloadUrl}
            className={styles.buttonPrimary}
            onClick={handleInstallClick}
            data-testid="compile-agent-install-button"
            aria-label={t('compile_agent_banner.install_mac_aria')}
            download
          >
            <DownloadIcon size={18} aria-hidden="true" />
            Installa Agent ELAB (Mac)
          </a>
        </div>
      </aside>
    );
  }

  // ── State 3: Windows / Linux — installer in arrivo iter 67 ────────
  if (isWindows || isLinux) {
    const platformLabel = channel.label || (isWindows ? 'Windows' : 'Linux');
    return (
      <aside
        className={`${styles.banner} ${styles.bannerInfo}`}
        role="status"
        aria-live="polite"
        aria-label={`Compilazione cloud disponibile su ${platformLabel}`}
        data-testid="compile-agent-banner"
        data-state={isWindows ? 'windows' : 'linux'}
      >
        <span className={`${styles.iconWrap} ${styles.iconInfo}`} aria-hidden="true">
          <DesktopIcon size={22} />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>
            Compilazione cloud disponibile
          </p>
          <p className={styles.subtitle}>
            Installer desktop per {platformLabel} in arrivo iter 67.
          </p>
        </div>
      </aside>
    );
  }

  // ── State 4: Unknown platform — graceful degradation ──────────────
  return (
    <aside
      className={`${styles.banner} ${styles.bannerInfo}`}
      role="status"
      aria-live="polite"
      aria-label={t('compile_agent_banner.cloud_aria')}
      data-testid="compile-agent-banner"
      data-state="unknown"
    >
      <span className={`${styles.iconWrap} ${styles.iconInfo}`} aria-hidden="true">
        <DesktopIcon size={22} />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>
          Compilazione cloud disponibile
        </p>
      </div>
    </aside>
  );
}
