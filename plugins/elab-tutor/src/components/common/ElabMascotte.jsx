/**
 * ElabMascotte — SVG mascotte ELAB inline component.
 *
 * Sprint V iter 1 Phase 3 WebDesigner-1 Atom A10 NEW.
 *
 * Andrea mandate iter 42 PM 2026-05-05 (feedback_homepage_old_version_regression
 * + fresh screenshot decision): aggiungi mascotte design IMPECCABLE in HomePage,
 * NIENTE emoticon, design strutturato + elegante per età 8-14 + LIM-friendly.
 *
 * Design rationale (perché impeccable non emoji):
 *   - Robottino stilizzato palette ELAB Navy/Lime/Orange/Red (Morfismo Sense 2:
 *     stesso prodotto del kit Omaric + volumi Davide cartacei)
 *   - Antenna doppia con tip glow (riferimento Arduino + radio del kit)
 *   - LED occhi gialli signature mascotte UNLIM (coerente con UNLIMCardIcon)
 *   - Cuore Lime sul petto (Tea + Andrea + Davide + team — "fatto con cuore")
 *   - 3 stati comportamentali (idle/speaks/listens) per Morfismo Sense 1
 *     runtime adattivo (TTS attivo / mic attivo / ambient)
 *   - prefers-reduced-motion rispettato (no anim per docenti accessibility)
 *
 * Replaces: emoji 🤖 / 🐒 / generic mascot PNG (kit Omaric coerenza
 * impossibile con asset stock).
 *
 * Props:
 *   - state: 'idle' | 'speaks' | 'listens' (default 'idle')
 *   - size:  'hero' | 'small' (default 'hero')
 *   - className: optional CSS class merge
 *   - ariaLabel: override default "Mascotte ELAB Tutor — il robot..."
 *
 * Andrea Marro — 2026-05-05 PM iter 42
 */
import React from 'react';
import styles from './ElabMascotte.module.css';

const PALETTE = {
  navy: '#1E4D8C',
  navyDark: '#0E2D5C',
  lime: '#4A7A25',
  orange: '#E8941C',
  red: '#E54B3D',
  yellow: '#FFD700',
  white: '#FFFFFF',
};

const DEFAULT_ARIA =
  'Mascotte ELAB Tutor — il robot che insegna elettronica con il kit fisico e i volumi cartacei';

export default function ElabMascotte({
  state = 'idle',
  size = 'hero',
  className = '',
  ariaLabel = DEFAULT_ARIA,
  ...rest
}) {
  // Validate state to prevent invalid CSS data attribute
  const safeState = ['idle', 'speaks', 'listens'].includes(state) ? state : 'idle';
  const safeSize = ['hero', 'small'].includes(size) ? size : 'hero';

  return (
    <span
      className={`${styles.mascotte} ${className}`.trim()}
      data-state={safeState}
      data-size={safeSize}
      data-testid="elab-mascotte"
      role="img"
      aria-label={ariaLabel}
      {...rest}
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        aria-hidden="true"
      >
        {/* Drop shadow filter */}
        <defs>
          <filter id="elab-mascotte-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor={PALETTE.navyDark} floodOpacity="0.25" />
          </filter>
          <radialGradient id="elab-mascotte-eye-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={PALETTE.yellow} stopOpacity="1" />
            <stop offset="60%" stopColor={PALETTE.yellow} stopOpacity="0.6" />
            <stop offset="100%" stopColor={PALETTE.orange} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="elab-mascotte-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A5FA0" />
            <stop offset="100%" stopColor={PALETTE.navy} />
          </linearGradient>
        </defs>

        {/* ═══════════════ Antenna sinistra ═══════════════ */}
        <line
          x1="76" y1="48" x2="62" y2="20"
          stroke={PALETTE.lime} strokeWidth="5" strokeLinecap="round"
        />
        <circle cx="62" cy="18" r="7" fill="url(#elab-mascotte-eye-glow)" opacity="0.55" />
        <circle
          cx="62" cy="18" r="4.5"
          fill={PALETTE.orange} stroke={PALETTE.navyDark} strokeWidth="1.5"
          className={styles.antennaTipLeft}
        />

        {/* ═══════════════ Antenna destra ═══════════════ */}
        <line
          x1="124" y1="48" x2="138" y2="20"
          stroke={PALETTE.lime} strokeWidth="5" strokeLinecap="round"
        />
        <circle cx="138" cy="18" r="7" fill="url(#elab-mascotte-eye-glow)" opacity="0.55" />
        <circle
          cx="138" cy="18" r="4.5"
          fill={PALETTE.orange} stroke={PALETTE.navyDark} strokeWidth="1.5"
          className={styles.antennaTipRight}
        />

        {/* ═══════════════ Body / Head ═══════════════ */}
        <g className={styles.body} filter="url(#elab-mascotte-shadow)">
          {/* Head (testa principale) */}
          <rect
            x="40" y="48" width="120" height="100" rx="18"
            fill="url(#elab-mascotte-body)"
            stroke={PALETTE.navyDark} strokeWidth="3"
          />

          {/* Ear left (orecchio sinistro — listens state pulsa) */}
          <rect x="32" y="84" width="10" height="28" rx="4"
            fill={PALETTE.lime} stroke={PALETTE.navyDark} strokeWidth="2" />
          {/* Ear right */}
          <rect x="158" y="84" width="10" height="28" rx="4"
            fill={PALETTE.lime} stroke={PALETTE.navyDark} strokeWidth="2" />

          {/* Visor band (banda fronte — area "schermo") */}
          <rect x="50" y="60" width="100" height="6" rx="2"
            fill={PALETTE.navyDark} opacity="0.4" />

          {/* ═══════════════ Eyes (LED gialli signature) ═══════════════ */}
          {/* Glow halo left */}
          <circle cx="78" cy="92" r="14" fill="url(#elab-mascotte-eye-glow)" opacity="0.5" />
          {/* Eye left — yellow LED */}
          <circle
            cx="78" cy="92" r="9"
            fill={PALETTE.yellow}
            stroke={PALETTE.navyDark} strokeWidth="2"
            className={styles.eyeLeft}
          />
          <circle cx="78" cy="92" r="3" fill={PALETTE.navyDark} />
          {/* Sparkle pupil */}
          <circle cx="80" cy="89" r="1.4" fill={PALETTE.white} />

          {/* Glow halo right */}
          <circle cx="122" cy="92" r="14" fill="url(#elab-mascotte-eye-glow)" opacity="0.5" />
          <circle
            cx="122" cy="92" r="9"
            fill={PALETTE.yellow}
            stroke={PALETTE.navyDark} strokeWidth="2"
            className={styles.eyeRight}
          />
          <circle cx="122" cy="92" r="3" fill={PALETTE.navyDark} />
          <circle cx="124" cy="89" r="1.4" fill={PALETTE.white} />

          {/* ═══════════════ Mouth (smile Lime) ═══════════════ */}
          <path
            d="M 78 122 Q 100 138 122 122"
            fill="none"
            stroke={PALETTE.lime}
            strokeWidth="5"
            strokeLinecap="round"
            className={styles.mouth}
          />
          {/* Mouth dot left + right (smile detail) */}
          <circle cx="76" cy="122" r="2.2" fill={PALETTE.lime} />
          <circle cx="124" cy="122" r="2.2" fill={PALETTE.lime} />
        </g>

        {/* ═══════════════ Heart on chest (Tea + team signature) ═══════════════ */}
        {/* Subtle Lime heart bottom-center — "fatto con cuore" Andrea + Tea + Davide + Omaric + Giovanni */}
        <path
          d="M 100 162 C 96 156 88 156 88 164 C 88 170 100 178 100 178 C 100 178 112 170 112 164 C 112 156 104 156 100 162 Z"
          fill={PALETTE.red}
          stroke={PALETTE.navyDark}
          strokeWidth="1.5"
          opacity="0.92"
        />

        {/* Body base shadow ellipse */}
        <ellipse cx="100" cy="186" rx="52" ry="4" fill={PALETTE.navyDark} opacity="0.15" />
      </svg>
    </span>
  );
}
