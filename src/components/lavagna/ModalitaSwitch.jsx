/**
 * ModalitaSwitch — active lavagna modes.
 *
 * Modes (Italian K-12 plurale "Ragazzi" Principio Zero V3):
 *   - passo-passo  -> Passo Passo (build sequenziale variazione interno capitolo)
 *   - gia-montato  -> Gia Montato (pre-assembled diagnose mode, NEW iter 26)
 *
 * Modes STANDBY / REMOVED:
 *   • percorso — 2026-05-22 temporary standby: hidden from UI, legacy state
 *     normalizes to Passo Passo until the flow is redesigned.
 *   • guida-da-errore — iter 26 (ADR-025 §4.5) diagnose integrato Già Montato + Passo Passo inline
 *   • libero — legacy merged state; now normalizes to Passo Passo while Percorso is standby.
 *
 * Touch target ≥44px (CLAUDE.md §Qualita rule 9). Active state Navy #1E4D8C palette.
 *
 * Andrea Marro — iter 26 gen-app caveman 2026-04-29 + iter 36 WebDesigner-1 Phase 1 2026-04-30
 */
import React from 'react';
import css from './ModalitaSwitch.module.css';
import { getModalitaMorphicCue } from '../../services/percorsoMorphicAdapter.js';

export const MODALITA = ['passo-passo', 'gia-montato'];
const COLLAPSED_KEY = 'elab-lavagna-modalita-switch-collapsed';
const FALLBACK_MODE = 'passo-passo';

function readCollapsedPreference() {
  try { return localStorage.getItem(COLLAPSED_KEY) === '1'; } catch { return false; }
}

function writeCollapsedPreference(value) {
  try { localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0'); } catch { /* noop */ }
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={css.modeSvg}>
      <path d="M4.5 5.5c2.4-.9 4.6-.7 6.6.6v12.4c-2-1.2-4.2-1.4-6.6-.6V5.5Z" />
      <path d="M19.5 5.5c-2.4-.9-4.6-.7-6.6.6v12.4c2-1.2 4.2-1.4 6.6-.6V5.5Z" />
      <path d="M11.1 6.1h1.8" />
    </svg>
  );
}

function StepsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={css.modeSvg}>
      <path d="M7.5 5.5h4.2v4.2H7.5z" />
      <path d="M12.3 14.3h4.2v4.2h-4.2z" />
      <path d="M9.6 9.8v2.4c0 1.2.7 2.1 2.1 2.1h.6" />
    </svg>
  );
}

// iter 94 A2 — redesign "Già Montato" icon: original PuzzleIcon path (3 puzzle
// bumps + 1 straight side) had asymmetric protrusion placement (top-left,
// right-up, bottom-left) similar enough to rotational windmill to be flagged
// alongside ElabIcons.jsx PuzzleIcon (true offset rotational asymmetry). Andrea
// iter 94 PM flagged. Replaced with breadboard-with-components icon — symmetric,
// semantically accurate for "Già Montato" (circuit pre-assembled on breadboard),
// zero rotational asymmetry.
function PuzzleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={css.modeSvg}>
      {/* Breadboard outline (rounded rect) */}
      <rect x="3" y="6" width="18" height="12" rx="1.5"
            fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Horizontal divider (power rail) */}
      <line x1="3" y1="12" x2="21" y2="12"
            stroke="currentColor" strokeWidth="1" />
      {/* 6 component holes — symmetric 3+3 grid */}
      <circle cx="7" cy="9" r="0.9" fill="currentColor" />
      <circle cx="12" cy="9" r="0.9" fill="currentColor" />
      <circle cx="17" cy="9" r="0.9" fill="currentColor" />
      <circle cx="7" cy="15" r="0.9" fill="currentColor" />
      <circle cx="12" cy="15" r="0.9" fill="currentColor" />
      <circle cx="17" cy="15" r="0.9" fill="currentColor" />
    </svg>
  );
}

const MODE_META = {
  'percorso': {
    Icon: BookIcon,
    label: 'Percorso',
    tooltip: 'Ragazzi, leggiamo il libro insieme — modalità lettura narrativa.',
    isDefault: true,
  },
  'passo-passo': {
    Icon: StepsIcon,
    label: 'Passo Passo',
    tooltip: 'Ragazzi, montiamo il circuito un componente alla volta.',
    isDefault: true,
  },
  'gia-montato': {
    Icon: PuzzleIcon,
    label: 'Già Montato',
    tooltip: 'Ragazzi, guardate il circuito già pronto — sapete spiegarlo?',
    isDefault: false,
  },
};

export default function ModalitaSwitch({
  activeMode = FALLBACK_MODE,
  onModeChange,
  availableModes,
  sessionState,
}) {
  const [collapsed, setCollapsed] = React.useState(readCollapsedPreference);

  const handleClick = (mode) => {
    if (typeof onModeChange === 'function') {
      onModeChange(mode);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      writeCollapsedPreference(next);
      return next;
    });
  };

  const morphicCue = React.useMemo(
    () => getModalitaMorphicCue({ sessionState }),
    [sessionState]
  );

  const visibleModes = Array.isArray(availableModes) && availableModes.length > 0
    ? Array.from(new Set(availableModes.filter((m) => MODALITA.includes(m))))
    : MODALITA;
  const safeVisibleModes = visibleModes.length > 0 ? visibleModes : MODALITA;
  const normalizedActiveMode = MODALITA.includes(activeMode) ? activeMode : FALLBACK_MODE;
  const activeMeta = MODE_META[normalizedActiveMode] || MODE_META[FALLBACK_MODE];
  const ActiveIcon = activeMeta.Icon;

  if (collapsed) {
    return (
      <button
        type="button"
        className={css.collapsedSwitch}
        onClick={toggleCollapsed}
        aria-label={`Mostra modalità lavagna. Attiva: ${activeMeta.label}`}
        aria-expanded="false"
        data-testid="modalita-switch-collapsed"
      >
        <span className={css.modeIcon} aria-hidden="true"><ActiveIcon /></span>
        <span className={css.collapsedLabel}>{activeMeta.label}</span>
        <span className={css.chevron} aria-hidden="true">▾</span>
      </button>
    );
  }

  return (
    <div
      className={css.modalitaSwitch}
      role="tablist"
      aria-label="Modalità lavagna"
      data-testid="modalita-switch"
      data-stato-sessione={morphicCue.sessionState}
      data-morphic-profile={morphicCue.teacherProfile}
    >
      <button
        type="button"
        className={css.collapseBtn}
        onClick={toggleCollapsed}
        aria-label="Nascondi modalità lavagna"
        aria-expanded="true"
        data-testid="modalita-switch-collapse"
      >
        −
      </button>
      {safeVisibleModes.map((mode) => {
        const meta = MODE_META[mode];
        if (!meta) return null;
        const active = normalizedActiveMode === mode;
        const Icon = meta.Icon;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={meta.tooltip}
            title={meta.tooltip}
            data-testid={`modalita-btn-${mode}`}
            data-active={active ? 'true' : 'false'}
            data-default={meta.isDefault ? 'true' : 'false'}
            data-session-cue={meta.isDefault ? morphicCue.sessionState : undefined}
            data-morphic-profile={meta.isDefault ? morphicCue.teacherProfile : undefined}
            className={`${css.modeBtn} ${active ? css.modeBtnActive : ''} ${meta.isDefault ? css.modeBtnDefault : ''}`}
            onClick={() => handleClick(mode)}
          >
            <span className={css.modeIcon} aria-hidden="true"><Icon /></span>
            <span className={css.modeLabel}>{meta.label}</span>
            {meta.isDefault && (
              <span className={css.defaultStar} aria-label="Modalità predefinita" title="Modalità predefinita" />
            )}
          </button>
        );
      })}
    </div>
  );
}
