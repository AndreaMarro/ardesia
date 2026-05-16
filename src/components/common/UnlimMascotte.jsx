/**
 * UnlimMascotte — Tea canonical SVG mascotte component.
 *
 * Sprint U iter 70 Team D — UI overhaul mandate.
 *
 * Renders the Tea-canonical UNLIM mascotte exactly per
 * `/Users/andreamarro/VOLUME 3/TEA/Nuovo lavoro tea/mascotte_unlim_canonica.md`:
 *
 *   - Antenna zigzag Navy with sphere tip
 *   - Large left ear (speaker) Navy ring + white moon + navy pupil
 *   - Square rounded head: Navy outer frame + Lime inner frame + white face screen
 *   - Two Navy oval eyes with white highlights (gaze upper-right curious)
 *   - No mouth (UNLIM listens, illuminates)
 *   - Compact Navy torso (babyface, 2-heads-tall)
 *   - White hands holding a horizontal torch/saldatore (white handle + Lime tip + 3 Lime rays right)
 *   - White stubby legs + Navy oval feet
 *
 * Palette canonica (Tea spec + CLAUDE.md Morfismo Sense 2):
 *   - Navy  #1E4D8C
 *   - Lime  #4A7A25
 *   - Orange #E8941C (warning accents — not used in base pose)
 *   - Red   #E54B3D (error — not used in base pose)
 *   - White #FFFFFF
 *
 * States (Sense 1.5 morfismo runtime — CLAUDE.md ADR-019 level 3):
 *   - parla    — suggests content to teacher (light ray pulse)
 *   - ascolta  — teacher/students interacting (ear pulse)
 *   - aspetta  — idle default (no animation)
 *
 * Props:
 *   - size:     'small' | 'medium' | 'large' | 'hero' (default 'medium')
 *               180-280 px runtime range per ADR-019.
 *   - state:    'parla' | 'ascolta' | 'aspetta' (default 'aspetta')
 *   - position: 'inline' | 'floating-tl' | 'floating-tr' | 'floating-bl' | 'floating-br'
 *               (default 'inline')
 *   - className: optional extra class merge
 *   - ariaLabel: override default Italian "Mascotte UNLIM ELAB..."
 *   - onClick:   optional handler (kept anonymous, no destructive default)
 *
 * Honesty caveats iter 70 D:
 *   - NOT visually verified browser yet (defer Andrea ratify iter 71+ Playwright)
 *   - Bibbia stilistica Tea (65KB PDF) NOT fully applied — only palette + base pose
 *     from `mascotte_unlim_canonica.md` 3.2KB spec
 *   - Animation respects prefers-reduced-motion via CSS module
 *   - SVG body matches `src/assets/mascot/elab-mascot-tea-canonica.svg` 3.5KB byte-for-byte
 *     for the geometry, re-rendered inline here to allow CSS animation hooks per-element
 *
 * Andrea Marro — 2026-05-16 PM iter 70 Team D
 */
import React from 'react';
import styles from './UnlimMascotte.module.css';

export const UNLIM_PALETTE = Object.freeze({
  navy: '#1E4D8C',
  lime: '#4A7A25',
  orange: '#E8941C',
  red: '#E54B3D',
  white: '#FFFFFF',
});

const VALID_SIZES = ['small', 'medium', 'large', 'hero'];
const VALID_STATES = ['parla', 'ascolta', 'aspetta'];
const VALID_POSITIONS = [
  'inline',
  'floating-tl',
  'floating-tr',
  'floating-bl',
  'floating-br',
];

const DEFAULT_ARIA_LABEL =
  'Mascotte UNLIM ELAB — robot illuminatore che ascolta i Ragazzi sul kit fisico';

/**
 * Pure-functional Tea-canonical UNLIM mascotte SVG component.
 */
function UnlimMascotte({
  size = 'medium',
  state = 'aspetta',
  position = 'inline',
  className = '',
  ariaLabel = DEFAULT_ARIA_LABEL,
  onClick,
  ...rest
}) {
  const safeSize = VALID_SIZES.includes(size) ? size : 'medium';
  const safeState = VALID_STATES.includes(state) ? state : 'aspetta';
  const safePosition = VALID_POSITIONS.includes(position) ? position : 'inline';

  const wrapperClass = [
    styles.wrapper,
    styles[`size-${safeSize}`],
    styles[`state-${safeState}`],
    styles[`pos-${safePosition}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={wrapperClass}
      data-state={safeState}
      data-size={safeSize}
      data-position={safePosition}
      data-testid="unlim-mascotte"
      role="img"
      aria-label={ariaLabel}
      onClick={typeof onClick === 'function' ? onClick : undefined}
      {...rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 400"
        width="100%"
        height="100%"
        focusable="false"
        aria-hidden="true"
        className={styles.svg}
      >
        {/* Antenna zigzag Navy + sphere tip */}
        <g className={styles.antennaGroup}>
          <polyline
            points="220,95 235,75 215,60 230,40"
            fill="none"
            stroke={UNLIM_PALETTE.navy}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="232"
            cy="38"
            r="9"
            fill={UNLIM_PALETTE.navy}
            className={styles.antennaTip}
          />
        </g>

        {/* Left ear: speaker Navy ring + white moon + navy pupil */}
        <g className={styles.earGroup}>
          <circle cx="100" cy="185" r="36" fill={UNLIM_PALETTE.navy} />
          <circle cx="100" cy="185" r="20" fill={UNLIM_PALETTE.white} />
          <circle
            cx="100"
            cy="185"
            r="9"
            fill={UNLIM_PALETTE.navy}
            className={styles.earPupil}
          />
        </g>

        {/* Head: Navy outer + Lime inner + white face screen */}
        <rect
          x="125"
          y="105"
          width="180"
          height="170"
          rx="22"
          ry="22"
          fill={UNLIM_PALETTE.navy}
        />
        <rect
          x="135"
          y="115"
          width="160"
          height="150"
          rx="16"
          ry="16"
          fill={UNLIM_PALETTE.lime}
        />
        <rect
          x="146"
          y="126"
          width="138"
          height="128"
          rx="10"
          ry="10"
          fill={UNLIM_PALETTE.white}
        />

        {/* Eyes: Navy ovals + white highlights upper-left */}
        <ellipse cx="190" cy="190" rx="14" ry="20" fill={UNLIM_PALETTE.navy} />
        <ellipse cx="245" cy="190" rx="14" ry="20" fill={UNLIM_PALETTE.navy} />
        <circle cx="186" cy="182" r="4" fill={UNLIM_PALETTE.white} />
        <circle cx="241" cy="182" r="4" fill={UNLIM_PALETTE.white} />

        {/* Neck (short) */}
        <rect x="170" y="270" width="90" height="14" rx="4" fill={UNLIM_PALETTE.navy} />

        {/* Torso compact */}
        <rect
          x="158"
          y="282"
          width="115"
          height="70"
          rx="10"
          ry="10"
          fill={UNLIM_PALETTE.navy}
        />

        {/* Tool: horizontal torch/saldatore */}
        <g className={styles.toolGroup}>
          <rect
            x="100"
            y="305"
            width="195"
            height="18"
            rx="4"
            fill={UNLIM_PALETTE.white}
            stroke={UNLIM_PALETTE.navy}
            strokeWidth="5"
          />
          <rect
            x="92"
            y="298"
            width="22"
            height="32"
            rx="6"
            fill={UNLIM_PALETTE.white}
            stroke={UNLIM_PALETTE.navy}
            strokeWidth="5"
          />
          <path
            d="M 295 305 L 318 296 L 332 314 L 318 332 L 295 323 Z"
            fill={UNLIM_PALETTE.lime}
            stroke={UNLIM_PALETTE.navy}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Light rays (animate on 'parla') */}
          <g className={styles.lightRays}>
            <line
              x1="340"
              y1="296"
              x2="354"
              y2="288"
              stroke={UNLIM_PALETTE.lime}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="343"
              y1="314"
              x2="358"
              y2="314"
              stroke={UNLIM_PALETTE.lime}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="340"
              y1="332"
              x2="354"
              y2="340"
              stroke={UNLIM_PALETTE.lime}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Hands: white mittens holding the handle */}
        <circle
          cx="158"
          cy="314"
          r="14"
          fill={UNLIM_PALETTE.white}
          stroke={UNLIM_PALETTE.navy}
          strokeWidth="5"
        />
        <circle
          cx="248"
          cy="314"
          r="14"
          fill={UNLIM_PALETTE.white}
          stroke={UNLIM_PALETTE.navy}
          strokeWidth="5"
        />

        {/* Legs */}
        <rect
          x="178"
          y="350"
          width="22"
          height="32"
          rx="5"
          fill={UNLIM_PALETTE.white}
          stroke={UNLIM_PALETTE.navy}
          strokeWidth="5"
        />
        <rect
          x="232"
          y="350"
          width="22"
          height="32"
          rx="5"
          fill={UNLIM_PALETTE.white}
          stroke={UNLIM_PALETTE.navy}
          strokeWidth="5"
        />

        {/* Feet ovals */}
        <ellipse cx="189" cy="385" rx="20" ry="6" fill={UNLIM_PALETTE.navy} />
        <ellipse cx="243" cy="385" rx="20" ry="6" fill={UNLIM_PALETTE.navy} />
      </svg>
    </span>
  );
}

export default UnlimMascotte;
