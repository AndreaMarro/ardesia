/**
 * ModalitaSwitch — 3 modes canonical UI Sprint V iter 3 (Andrea iter 1+ mandate)
 *
 * Modes (Italian K-12 plurale "Ragazzi" Principio Zero V3):
 *   • percorso     → 📖 Percorso (default narrative reading + morphic Onniscenza Sense 1.5) ⭐
 *   • passo-passo  → 👣 Passo Passo (build sequenziale variazione interno capitolo)
 *   • gia-montato  → 🧩 Già Montato (pre-assembled diagnose mode, NEW iter 26)
 *
 * Modes REMOVED:
 *   • guida-da-errore — iter 26 (ADR-025 §4.5) diagnose integrato Già Montato + Passo Passo inline
 *   • libero — Sprint V iter 3 (Andrea iter 1+ mandate) MERGED in 'percorso' (Onniscenza morfico Sense 1.5)
 *     Migration: localStorage 'libero' → 'percorso' on read (LavagnaShell:441-449)
 *
 * Iter 36 Phase 1 Atom A4 fix (PDR §3) — Modalità Percorso visibile:
 *   • availableModes prop opzionale: filter difensivo (mai escludere 'percorso')
 *   • defaultStar visivamente prominente (lift opacity + size + Lime accent)
 *   • Percorso renderizzato SEMPRE first (anche se prop array escluso percorso → forza re-include)
 *
 * Touch target ≥44px (CLAUDE.md §Qualita rule 9). Active state Navy #1E4D8C palette.
 *
 * Andrea Marro — iter 26 gen-app caveman 2026-04-29 + iter 36 WebDesigner-1 Phase 1 2026-04-30
 */
import React from 'react';
import css from './ModalitaSwitch.module.css';

export const MODALITA = ['percorso', 'passo-passo', 'gia-montato'];

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

function PuzzleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={css.modeSvg}>
      <path d="M9.1 4.8h4.1v3h1.5a1.8 1.8 0 1 1 0 3h-1.5v2.4h-2.4v1.5a1.8 1.8 0 1 1-3 0v-1.5h-3v-4.1h3V7.6a1.8 1.8 0 1 1 3 0v1.5h2.4V4.8H9.1Z" />
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
    isDefault: false,
  },
  'gia-montato': {
    Icon: PuzzleIcon,
    label: 'Già Montato',
    tooltip: 'Ragazzi, guardate il circuito già pronto — sapete spiegarlo?',
    isDefault: false,
  },
};

export default function ModalitaSwitch({ activeMode = 'percorso', onModeChange, availableModes }) {
  const handleClick = (mode) => {
    if (typeof onModeChange === 'function') {
      onModeChange(mode);
    }
  };

  // iter 36 Atom A4 fix — defensive filter: never exclude 'percorso' (default canonical).
  // If parent passes availableModes array, intersect with MODALITA + force-include percorso.
  // This protects against H3 hypothesis (filter excludes percorso accidentally).
  const visibleModes = Array.isArray(availableModes) && availableModes.length > 0
    ? Array.from(new Set(['percorso', ...availableModes.filter((m) => MODALITA.includes(m))]))
    : MODALITA;

  return (
    <div
      className={css.modalitaSwitch}
      role="tablist"
      aria-label="Modalità lavagna"
      data-testid="modalita-switch"
    >
      {visibleModes.map((mode) => {
        const meta = MODE_META[mode];
        if (!meta) return null;
        const active = activeMode === mode;
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
