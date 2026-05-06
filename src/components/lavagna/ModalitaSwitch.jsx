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

const MODE_META = {
  'percorso': {
    icon: '📖',
    label: 'Percorso',
    tooltip: 'Ragazzi, leggiamo il libro insieme — modalità lettura narrativa.',
    isDefault: true,
  },
  'passo-passo': {
    icon: '👣',
    label: 'Passo Passo',
    tooltip: 'Ragazzi, montiamo il circuito un componente alla volta.',
    isDefault: false,
  },
  'gia-montato': {
    icon: '🧩',
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
            <span className={css.modeIcon} aria-hidden="true">{meta.icon}</span>
            <span className={css.modeLabel}>{meta.label}</span>
            {meta.isDefault && (
              <span className={css.defaultStar} aria-label="Modalità predefinita" title="Modalità predefinita">⭐</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
