/**
 * UnlimModeSwitch — Bottone switch UNLIM/Classic Mode
 * Persiste la scelta in localStorage.
 * Bottone visibile in entrambe le modalità.
 * © Andrea Marro — 27/03/2026
 */

import React from 'react';
import css from './unlim-mode-switch.module.css';

const STORAGE_KEY = 'elab-unlim-mode';

/**
 * Hook per leggere/scrivere la modalità UNLIM
 */
export function useUnlimMode() {
  const [isUnlim, setIsUnlim] = React.useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Default: UNLIM attivo (come da design doc)
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const toggleMode = React.useCallback(() => {
    setIsUnlim(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const setMode = React.useCallback((value) => {
    setIsUnlim(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  }, []);

  return { isUnlim, toggleMode, setMode };
}

/**
 * Bottone switch visuale UNLIM / Classic
 */
export default function UnlimModeSwitch({ isUnlim, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isUnlim ? 'Passa a modalità Classic' : 'Passa a modalità UNLIM'}
      title={isUnlim ? 'Modalità UNLIM attiva — clicca per Classic' : 'Modalità Classic — clicca per UNLIM'}
      className={isUnlim ? css.switchBtnActive : css.switchBtn}
    >
      <span className={isUnlim ? css.trackActive : css.track}>
        <span className={isUnlim ? css.thumbActive : css.thumb} />
      </span>
      <span>{isUnlim ? 'UNLIM' : 'Classic'}</span>
    </button>
  );
}
