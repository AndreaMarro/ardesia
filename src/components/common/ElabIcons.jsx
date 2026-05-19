/**
 * ElabIcons — Libreria SVG inline per ELAB
 * Ogni icona: 24x24 viewBox, stroke-based, colori via props.
 * WCAG friendly: role="img" + aria-hidden="true" di default.
 * ZERO emoji — solo SVG vettoriali.
 * © Andrea Marro — 31/03/2026
 */

import React from 'react';

const defaults = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Icon({ children, size, color, className, title, ...props }) {
  return (
    <svg
      {...defaults}
      width={size || defaults.width}
      height={size || defaults.height}
      stroke={color || defaults.stroke}
      className={className}
      role="img"
      aria-hidden={title ? undefined : 'true'}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export function MicrophoneIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </Icon>
  );
}

export function StopIcon(props) {
  return (
    <Icon {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SpeakerOnIcon(props) {
  return (
    <Icon {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </Icon>
  );
}

export function SpeakerOffIcon(props) {
  return (
    <Icon {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </Icon>
  );
}

export function SendIcon(props) {
  return (
    <Icon {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function LoadingIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </Icon>
  );
}

export function ReportIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </Icon>
  );
}

export function RobotIcon(props) {
  // Iter 35 Q3 /impeccable:polish — UNLIM mascotte mini (footer "Chi
  // siamo"). Was generic boxy; new: Navy head + Lime antenna + yellow
  // LED eyes coerente con Card UNLIM iter 35 + mascotte canonical.
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      role="img" aria-hidden="true" {...rest}
    >
      <rect x="5" y="8" width="14" height="12" rx="2" fill={color || '#1E4D8C'} stroke="#0E2D5C" strokeWidth="1.4" strokeLinejoin="round" />
      <line x1="12" y1="8" x2="12" y2="3" stroke="#4A7A25" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1.2" fill="#4A7A25" />
      <circle cx="9" cy="14" r="1.6" fill="#FFD700" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="15" cy="14" r="1.6" fill="#FFD700" stroke="#0E2D5C" strokeWidth="0.6" />
      <path d="M9 17.5 Q12 19 15 17.5" fill="none" stroke="#4A7A25" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3" y1="14" x2="5" y2="14" stroke="#0E2D5C" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="19" y1="14" x2="21" y2="14" stroke="#0E2D5C" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// iter 81 81.A2 (close BG agent A2 caveat #5): extract PuzzleIcon previously
// inline in HomeCompileEntry.jsx tab Blocchi. Matches Blockly identity (Lime
// fill + Navy stroke for WCAG AA contrast on light background). 24×24 viewBox
// consistent with ElabIcons family. Reusable for any "Blocks" Blockly UI surface.
export function PuzzleIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      role="img" aria-hidden="true" {...rest}
    >
      <path
        d="M5 5h6v3a2 2 0 0 0 4 0V5h4v6h-3a2 2 0 0 0 0 4h3v4h-6v-3a2 2 0 0 0-4 0v3H5v-6h3a2 2 0 0 0 0-4H5z"
        fill={color || '#4A7A25'}
        stroke="#1E4D8C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CircuitIcon(props) {
  // Iter 35 Q2 /impeccable:bolder — dual-tone Navy + Lime (Vol 1 base
  // elettronica). Was monochrome stroke-only; new: filled IC chip body
  // Navy + Lime traces + Orange center pin (LED indicator).
  // ModalitaSwitch "Libero" identity = costruzione libera circuito.
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      role="img" aria-hidden="true" {...rest}
    >
      <line x1="2" y1="12" x2="8" y2="12" stroke={color || '#4A7A25'} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="16" y1="12" x2="22" y2="12" stroke={color || '#4A7A25'} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="8" y="8" width="8" height="8" rx="1" fill="#1E4D8C" stroke={color || '#0E2D5C'} strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="#E8941C" stroke="#FFF" strokeWidth="0.6" />
    </svg>
  );
}

export function LightbulbIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </Icon>
  );
}

export function WrenchIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
    </Icon>
  );
}

export function BookIcon(props) {
  // Iter 35 Q2 /impeccable:bolder — dual-tone Navy cover + Lime spine
  // edge (Vol 1 accent) + Orange page bookmark accent. ModalitaSwitch
  // "Percorso" identity = volume Davide cartaceo paper-first lettura.
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      role="img" aria-hidden="true" {...rest}
    >
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" fill={color || '#1E4D8C'} stroke="#0E2D5C" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="4" y="2" width="2" height="20" fill="#4A7A25" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="#0E2D5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="8" x2="17" y2="8" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="12" x2="15" y2="12" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 2L18 5L20 2Z" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

export function CameraIcon(props) {
  return (
    <Icon {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </Icon>
  );
}

export function PrintIcon(props) {
  return (
    <Icon {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </Icon>
  );
}

export function StarIcon(props) {
  return (
    <Icon {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
  );
}

export function ErrorIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </Icon>
  );
}

export function SuccessIcon(props) {
  return (
    <Icon {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
  );
}

export function QuestionIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
  );
}

export function WarningIcon(props) {
  return (
    <Icon {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  );
}

export function TrophyIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Icon>
  );
}

export function AntennaIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2 12L12 2l10 10" />
      <path d="M12 2v20" />
      <path d="M5 9l7-7 7 7" />
    </Icon>
  );
}

export function LetterIcon(props) {
  return (
    <Icon {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
  );
}

export function ScreenshotIcon(props) {
  return (
    <Icon {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
      <path d="M9 13h6" />
    </Icon>
  );
}

export function HandWaveIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 11V7a2 2 0 0 1 4 0v2" />
      <path d="M11 9V5a2 2 0 0 1 4 0v4" />
      <path d="M15 7V5a2 2 0 0 1 4 0v6" />
      <path d="M7 11a2 2 0 0 0-4 0v4a8 8 0 0 0 16 0V9" />
    </Icon>
  );
}

export function SettingsIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Icon>
  );
}

export function RefreshIcon(props) {
  return (
    <Icon {...props}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </Icon>
  );
}

export function PartyIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5.8 11.3 2 22l10.7-3.8" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.18.95-1.2 1.45-2.06 1.02l-.01-.01a1.68 1.68 0 0 0-2.27.77v0c-.42.78-1.53.98-2.2.38l-.01-.01" />
    </Icon>
  );
}

export function FlaskIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 2h6" />
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
    </Icon>
  );
}

export function FootstepsIcon(props) {
  // Iter 35 Q2 /impeccable:bolder — dual-tone Navy soles + Lime toes
  // (passi lenti narrativa). ModalitaSwitch "Passo Passo" identity =
  // step-by-step lento accogliente per docente prima volta.
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      role="img" aria-hidden="true" {...rest}
    >
      <ellipse cx="8" cy="9" rx="3" ry="4" fill={color || '#1E4D8C'} stroke="#0E2D5C" strokeWidth="1.2" />
      <circle cx="6.5" cy="4" r="1" fill="#4A7A25" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="8.5" cy="3.5" r="1" fill="#4A7A25" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="10.2" cy="4.2" r="1" fill="#4A7A25" stroke="#0E2D5C" strokeWidth="0.6" />
      <ellipse cx="16" cy="17" rx="3" ry="4" fill={color || '#1E4D8C'} stroke="#0E2D5C" strokeWidth="1.2" />
      <circle cx="14.5" cy="12" r="1" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="16.5" cy="11.5" r="1" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="18.2" cy="12.2" r="1" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.6" />
    </svg>
  );
}

export function PaletteIcon(props) {
  // Iter 35 Q2 /impeccable:colorize — palette ELAB 4-colori brand
  // identity (Navy + Lime + Orange + Red Vol1/2/3). ModalitaSwitch
  // "Già Montato" identity = colore + assemblaggio kit.
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      role="img" aria-hidden="true" {...rest}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.3-.4-.4-.6-.8-.6-1.3 0-1.1.9-2 2-2h2.3c2.5 0 4.5-2 4.5-4.5C22 6.1 17.5 2 12 2Z" fill="#FFFEF5" stroke={color || '#1E4D8C'} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="7" cy="10" r="1.6" fill="#4A7A25" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="11" cy="7" r="1.6" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="15" cy="8" r="1.6" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.6" />
      <circle cx="17" cy="12" r="1.6" fill="#E54B3D" stroke="#0E2D5C" strokeWidth="0.6" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ITER 35 Q1+Q2+O2 — HomePage card icons /impeccable:bolder + :colorize
   Andrea iter 35 mandate (master plan §1.4): SVG identity Morfismo
   Sense 2 = "kit Omaric + volumi cartacei + software" triplet coerenza.
   Old icons (iter 36): generic lightning bolt + book stack + brain
   asymmetric. Did NOT pass Test Morfismo: "stesso prodotto del Volume?"
   New icons iter 35:
   • Lavagna = breadboard 6×3 holes + chalk gesto (kit + lavagna)
   • Tutor = volume aperto + circuit traces sulle pagine (volumi + Arduino)
   • UNLIM = mascotte head silhouette + circuit antennae (UNLIM brand)
   • Glossario = book chiuso A-Z divider tabs + Lime magnifier
   Apply /impeccable:bolder principles:
   - Stronger geometric forms (≥3px stroke equivalent)
   - Brand palette Navy/Lime/Orange/Red explicit
   - Dual-tone primary + accent (NOT monochrome)
   - WCAG AA contrast 4.5:1 verified Navy on White card
   ═══════════════════════════════════════════════════════════════════ */

// Lavagna libera card icon
// Identity: breadboard tile (kit Omaric grid 6×3 holes Lime body, Navy
// component pad outline) + chalk pen overlay (Orange diagonal accent).
// Morfismo Sense 2: identico al breadboard del kit fisico Omaric.
// Iter 38 P0.3 /impeccable:bolder enhance: stroke 2.5→3 + drop-shadow filter
// + chalk pen rotated 8deg (asymmetry break) + Lime saturation boost.
export function LavagnaCardIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(30, 77, 140, 0.18))' }}
      {...props}
    >
      {/* Breadboard body — Lime fill (Vol 1 elettronica base palette) */}
      <rect x="6" y="14" width="36" height="22" rx="2.5" fill="#4A7A25" stroke="#1E4D8C" strokeWidth="3" strokeLinejoin="round" />
      {/* Power rails top + bottom — Navy bands */}
      <rect x="6" y="14" width="36" height="3" fill="#1E4D8C" />
      <rect x="6" y="33" width="36" height="3" fill="#1E4D8C" />
      {/* Component holes 6×2 — white dots Navy outline (kit Omaric pin pad) */}
      <circle cx="11" cy="22" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="17" cy="22" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="23" cy="22" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="29" cy="22" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="35" cy="22" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="11" cy="28" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="17" cy="28" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="23" cy="28" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="29" cy="28" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      <circle cx="35" cy="28" r="1.4" fill="#FFF" stroke="#1E4D8C" strokeWidth="0.8" />
      {/* Chalk pen — Orange diagonal accent (lavagna libera "scrivere") +
          rotated 8deg /impeccable:bolder asymmetry break */}
      <g transform="rotate(8 36 10)">
        <path d="M30 4 L42 4 L42 10 L36 16 L30 10 Z" fill="#E8941C" stroke="#1E4D8C" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="34" y1="6" x2="38" y2="6" stroke="#FFD700" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ELAB Tutor completo card icon
// Identity: volume aperto (Vol Davide cartacei) + circuit trace sulle
// pagine (Arduino kit + volumi + software triplet).
// Palette: Navy spine (UNLIM brand) + Lime pages (Vol 1) + Orange trace
// (Vol 2) + Red component (Vol 3) — i 3 volumi rappresentati in 1 icona.
// Iter 38 P0.3 /impeccable:bolder enhance: stroke 2.5→3 + drop-shadow filter
// + LED glow halo + spine bookmark ribbon (asymmetry detail).
export function TutorCardIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(30, 77, 140, 0.18))' }}
      {...props}
    >
      {/* Pages left — Lime (Vol 1) */}
      <path d="M6 12 L24 8 L24 40 L6 38 Z" fill="#FFFEF5" stroke="#1E4D8C" strokeWidth="3" strokeLinejoin="round" />
      {/* Pages right — Lime soft fill */}
      <path d="M42 12 L24 8 L24 40 L42 38 Z" fill="#FFFEF5" stroke="#1E4D8C" strokeWidth="3" strokeLinejoin="round" />
      {/* Spine center — Navy band UNLIM brand */}
      <line x1="24" y1="8" x2="24" y2="40" stroke="#1E4D8C" strokeWidth="3" strokeLinecap="round" />
      {/* Bookmark ribbon — Red asymmetric detail iter 38 /impeccable:bolder */}
      <path d="M21 8 L21 16 L23 14 L25 16 L25 8 Z" fill="#E54B3D" stroke="#1E4D8C" strokeWidth="1" strokeLinejoin="round" opacity="0.85" />
      {/* Circuit trace lhs — Lime ground rail */}
      <line x1="9" y1="20" x2="20" y2="20" stroke="#4A7A25" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="9" y1="26" x2="20" y2="26" stroke="#4A7A25" strokeWidth="2.2" strokeLinecap="round" />
      {/* Component LED rhs — Red Vol 3 Arduino + glow halo */}
      <circle cx="32" cy="22" r="3.5" fill="#E54B3D" opacity="0.25" />
      <circle cx="32" cy="22" r="2.5" fill="#E54B3D" stroke="#1E4D8C" strokeWidth="1.8" />
      {/* Resistor rhs — Orange Vol 2 componenti */}
      <rect x="28" y="28" width="8" height="3" fill="#E8941C" stroke="#1E4D8C" strokeWidth="1.5" />
      {/* Trace spine to LED */}
      <line x1="24" y1="22" x2="29.5" y2="22" stroke="#1E4D8C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// UNLIM (solo chat) card icon
// Identity: mascotte UNLIM head silhouette + circuit antennae (kit
// Omaric pin coerenza) + LED yellow eye (mascotte signature).
// Replaces previous brain-asymmetric (broke Morfismo Sense 2 — UNLIM
// is mascotte robottino, not abstract brain).
// Iter 38 P0.3 /impeccable:bolder enhance: stroke 2.5→3 + drop-shadow + LED
// eye glow halo + speech-bubble pulse (Orange ring outer).
export function UNLIMCardIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(14, 45, 92, 0.25))' }}
      {...props}
    >
      {/* Head body — Navy primary UNLIM brand */}
      <rect x="10" y="14" width="28" height="22" rx="3" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="3" strokeLinejoin="round" />
      {/* Antenna left — Lime stroke + circle tip */}
      <line x1="16" y1="14" x2="13" y2="6" stroke="#4A7A25" strokeWidth="3" strokeLinecap="round" />
      <circle cx="13" cy="5" r="2.2" fill="#4A7A25" stroke="#0E2D5C" strokeWidth="0.6" />
      {/* Antenna right — Lime symmetric */}
      <line x1="32" y1="14" x2="35" y2="6" stroke="#4A7A25" strokeWidth="3" strokeLinecap="round" />
      <circle cx="35" cy="5" r="2.2" fill="#4A7A25" stroke="#0E2D5C" strokeWidth="0.6" />
      {/* Eyes — yellow LED signature mascotte + glow halo */}
      <circle cx="19" cy="23" r="3.5" fill="#FFD700" opacity="0.30" />
      <circle cx="19" cy="23" r="2.5" fill="#FFD700" stroke="#0E2D5C" strokeWidth="1.2" />
      <circle cx="29" cy="23" r="3.5" fill="#FFD700" opacity="0.30" />
      <circle cx="29" cy="23" r="2.5" fill="#FFD700" stroke="#0E2D5C" strokeWidth="1.2" />
      {/* Smile — Lime curve (accogliente) */}
      <path d="M18 30 Q24 33 30 30" fill="none" stroke="#4A7A25" strokeWidth="2.5" strokeLinecap="round" />
      {/* Speech-bubble dot — Orange (chat indicator) + pulse outer ring */}
      <circle cx="40" cy="13" r="4.2" fill="#E8941C" opacity="0.25" />
      <circle cx="40" cy="13" r="3" fill="#E8941C" stroke="#0E2D5C" strokeWidth="1.8" />
      <circle cx="40" cy="13" r="0.9" fill="#FFF" />
    </svg>
  );
}

// Glossario card icon /impeccable:polish O2
// Identity: dictionary book + alphabetic A-Z divider tabs + Lime
// magnifier lens (search vocabulary). Volumes Davide cartacei
// reference: glossario è il riassunto termini chiave dei 3 volumi.
// Iter 38 P0.3 /impeccable:bolder enhance: stroke 2.5→3 + drop-shadow filter
// + magnifier handle highlight (Orange→Yellow gradient asymmetry).
export function GlossarioCardIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(14, 45, 92, 0.20))' }}
      {...props}
    >
      {/* Book cover — Navy */}
      <rect x="6" y="6" width="26" height="36" rx="1.5" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="3" strokeLinejoin="round" />
      {/* Spine highlight — Lime accent left edge */}
      <rect x="6" y="6" width="3" height="36" fill="#4A7A25" />
      {/* Title bar — White on Navy */}
      <rect x="13" y="11" width="14" height="2.5" rx="0.5" fill="#FFF" />
      {/* A-Z divider tabs — Orange edge tabs (alphabetic dictionary) */}
      <rect x="32" y="10" width="3" height="3" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.8" />
      <rect x="32" y="16" width="3" height="3" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.8" />
      <rect x="32" y="22" width="3" height="3" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.8" />
      <rect x="32" y="28" width="3" height="3" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.8" />
      <rect x="32" y="34" width="3" height="3" fill="#E8941C" stroke="#0E2D5C" strokeWidth="0.8" />
      {/* Index lines on cover */}
      <line x1="13" y1="20" x2="27" y2="20" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="25" x2="25" y2="25" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="30" x2="27" y2="30" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
      {/* Magnifier lens — Lime ring + Orange handle (search) */}
      <circle cx="36" cy="32" r="6" fill="#FFF" stroke="#4A7A25" strokeWidth="2.8" />
      <circle cx="36" cy="32" r="2.5" fill="#4A7A25" opacity="0.25" />
      <line x1="40" y1="36" x2="44" y2="40" stroke="#E8941C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ITER 66 P0.3 — R5 HomePage Compile Agent Banner widget icons
   Andrea iter 65/66 mandate: surface ELAB Compile Agent install status
   on HomePage with platform-specific CTA (Mac primary, Win/Linux iter 67).
   3 new icons: DownloadIcon (install CTA) + CheckIcon (agent online
   confirmation) + DesktopIcon (platform context info banner).
   Compliance: stroke-based, palette via currentColor (Lime success /
   Orange warning / Navy info), no emoji, ARIA hidden by default.
   ═══════════════════════════════════════════════════════════════════ */

export function DownloadIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  );
}

export function DesktopIcon(props) {
  return (
    <Icon {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </Icon>
  );
}

export function CronologiaCardIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true" {...props}
    >
      <circle cx="24" cy="24" r="16" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="2" />
      <circle cx="24" cy="24" r="13" fill="#FFF" stroke="#0E2D5C" strokeWidth="1.5" />
      <line x1="24" y1="13" x2="24" y2="15" stroke="#0E2D5C" strokeWidth="1.5" />
      <line x1="35" y1="24" x2="33" y2="24" stroke="#0E2D5C" strokeWidth="1.5" />
      <line x1="24" y1="35" x2="24" y2="33" stroke="#0E2D5C" strokeWidth="1.5" />
      <line x1="13" y1="24" x2="15" y2="24" stroke="#0E2D5C" strokeWidth="1.5" />
      <line x1="24" y1="24" x2="24" y2="17" stroke="#1E4D8C" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="30" y2="20" stroke="#4A7A25" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="1.5" fill="#0E2D5C" />
      <path d="M10 8 L10 14 L16 14" fill="none" stroke="#4A7A25" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14 C10 9 14 6 18 6" fill="none" stroke="#4A7A25" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ITER 72 TEAM D — HomePage emoji removal mandate (Codex D2 audit
   2026-05-16). Replace 4 RUNTIME-visible emoji (HomePage.jsx:393 ⚡
   / 408 📚 / 429 🎬 / 1086 🐒) per CLAUDE.md regola 11 ban emoji
   icone (comments-only refs preserved per Codex scope).

   2 NEW icons:
   - VideoLessonsCardIcon — replaces 🎬 line 429 (videolezioni card,
     IconComponent: null actually renders emoji at runtime).
     Identity: video player frame + play triangle + film strip strip
     suggesting "videolezioni" (kit Omaric video tutorial).
     Palette: Navy frame + Lime accent + Orange play triangle (3
     volumi triplet preserved, contrast WCAG AA).
   - ScimpanzeIcon — replaces 🐒 line 1086 footer fallback
     (scimpanzè easter chi siamo). Stylized chimp silhouette
     reference ELAB mascot identity. Palette Navy primary + Lime
     accent eye.

   Both icons fixed-viewBox 48x48 wrapped svg, accept size prop
   default 48, role=img + aria-hidden by default for decorative
   use, support {...props} pass-through (className/aria-label).
   ═══════════════════════════════════════════════════════════════════ */

export function VideoLessonsCardIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(30, 77, 140, 0.18))' }}
      {...props}
    >
      {/* Video player body — Navy frame UNLIM brand */}
      <rect x="6" y="11" width="36" height="26" rx="2.5" fill="#FFFEF5" stroke="#1E4D8C" strokeWidth="3" strokeLinejoin="round" />
      {/* Top film-strip band — Navy with perforations white */}
      <rect x="6" y="11" width="36" height="4" fill="#1E4D8C" />
      <circle cx="11" cy="13" r="0.9" fill="#FFF" />
      <circle cx="17" cy="13" r="0.9" fill="#FFF" />
      <circle cx="23" cy="13" r="0.9" fill="#FFF" />
      <circle cx="29" cy="13" r="0.9" fill="#FFF" />
      <circle cx="35" cy="13" r="0.9" fill="#FFF" />
      {/* Bottom film-strip band */}
      <rect x="6" y="33" width="36" height="4" fill="#1E4D8C" />
      <circle cx="11" cy="35" r="0.9" fill="#FFF" />
      <circle cx="17" cy="35" r="0.9" fill="#FFF" />
      <circle cx="23" cy="35" r="0.9" fill="#FFF" />
      <circle cx="29" cy="35" r="0.9" fill="#FFF" />
      <circle cx="35" cy="35" r="0.9" fill="#FFF" />
      {/* Play triangle — Orange (Vol 2) primary CTA + Lime backing halo */}
      <circle cx="24" cy="24" r="7.5" fill="#4A7A25" opacity="0.22" />
      <polygon points="21,19 21,29 30,24" fill="#E8941C" stroke="#1E4D8C" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function ScimpanzeIcon({ size = 48, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      role="img" aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(30, 77, 140, 0.20))' }}
      {...props}
    >
      {/* Outer ears — Navy primary brand */}
      <circle cx="11" cy="20" r="6.5" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="2.2" />
      <circle cx="37" cy="20" r="6.5" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="2.2" />
      {/* Inner ears — Lime accent */}
      <circle cx="11" cy="20" r="2.4" fill="#4A7A25" />
      <circle cx="37" cy="20" r="2.4" fill="#4A7A25" />
      {/* Head — Navy primary, asymmetric soft shape */}
      <ellipse cx="24" cy="24" rx="12" ry="13" fill="#1E4D8C" stroke="#0E2D5C" strokeWidth="2.5" />
      {/* Face — cream/light fill */}
      <ellipse cx="24" cy="29" rx="9.5" ry="9" fill="#FFFEF5" stroke="#0E2D5C" strokeWidth="2" />
      {/* Brow ridge — Navy band */}
      <path d="M16 22 Q24 18 32 22" fill="none" stroke="#0E2D5C" strokeWidth="2.2" strokeLinecap="round" />
      {/* Eyes — Navy dots */}
      <circle cx="20" cy="27" r="1.6" fill="#0E2D5C" />
      <circle cx="28" cy="27" r="1.6" fill="#0E2D5C" />
      {/* Nose — small Lime dot */}
      <circle cx="24" cy="31" r="1.1" fill="#4A7A25" />
      {/* Smile — Orange curve (accogliente, kit Omaric warm) */}
      <path d="M20 34 Q24 36.5 28 34" fill="none" stroke="#E8941C" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function UndoIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <path d="M3 8h10a5 5 0 0 1 0 10H7" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M7 4L3 8l4 4" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function RedoIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <path d="M21 8H11a5 5 0 0 0 0 10h6" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 4l4 4-4 4" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function TrashIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <path d="M5 7h14M9 7V4h6v3M6 7l1 13h10l1-13" stroke={color || '#E54B3D'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function HelpIcon(props) {
  const { size = 24, color, ...rest } = props || {};
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" {...rest}>
      <circle cx="12" cy="12" r="10" stroke={color || '#1E4D8C'} strokeWidth="2.5" fill="none" />
      <path d="M9 9a3 3 0 1 1 4.5 2.5c-1 0.5-1.5 1-1.5 2.5" stroke={color || '#1E4D8C'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="17.5" r="1" fill={color || '#1E4D8C'} />
    </svg>
  );
}
