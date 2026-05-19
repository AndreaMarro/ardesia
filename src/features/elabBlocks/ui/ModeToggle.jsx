/**
 * ModeToggle — Sub-project A iter 84 atom 8 Andrea ratify gruppo 16 voce 3.
 * Top bar position ScratchEditor sopra workspace (visibile LIM 4K + iPad).
 *
 * 2-state toggle "Blocchi" vs "C++". Parent (iter 84 close integration) wires
 * activeMode + onModeChange callback per render conditional ElabScratchModeShell
 * (modalita blocks) vs CodeMirror editor (modalita code).
 *
 * WCAG 2.2 AA:
 *  - role="tablist" + role="tab" per pulsante con aria-selected/aria-pressed
 *  - Keyboard: Tab focus group, ArrowLeft/ArrowRight switch active, Space/Enter activate
 *  - Touch 44+ + focus ring visible
 *  - PRINCIPIO ZERO label IT plurale neutro ("Blocchi"/"C++")
 */
import React, { useCallback, useRef } from 'react';
import styles from './ModeToggle.module.css';

export const MODE_BLOCKS = 'blocks';
export const MODE_CODE = 'code';
export const VALID_MODES = [MODE_BLOCKS, MODE_CODE];

const MODE_LABELS = {
  [MODE_BLOCKS]: 'Blocchi',
  [MODE_CODE]: 'C++',
};

const MODE_DESCRIPTIONS = {
  [MODE_BLOCKS]: 'Programmate con i blocchi colorati trascinabili',
  [MODE_CODE]: 'Programmate scrivendo codice Arduino in C++',
};

export function ModeToggle({ activeMode = MODE_BLOCKS, onModeChange, disabled = false }) {
  const blocksRef = useRef(null);
  const codeRef = useRef(null);

  const handleClick = useCallback((mode) => () => {
    if (!disabled && typeof onModeChange === 'function' && mode !== activeMode) {
      onModeChange(mode);
    }
  }, [disabled, onModeChange, activeMode]);

  const handleKeyDown = useCallback((currentMode) => (event) => {
    if (disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (typeof onModeChange === 'function') {
        onModeChange(currentMode);
      }
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const nextMode = currentMode === MODE_BLOCKS ? MODE_CODE : MODE_BLOCKS;
      if (typeof onModeChange === 'function') {
        onModeChange(nextMode);
      }
      // Move focus to the new tab
      requestAnimationFrame(() => {
        if (nextMode === MODE_BLOCKS && blocksRef.current) blocksRef.current.focus();
        if (nextMode === MODE_CODE && codeRef.current) codeRef.current.focus();
      });
    }
  }, [disabled, onModeChange]);

  return (
    <div className={styles.container} role="tablist" aria-label="Scegli modalita editor: Blocchi o C++">
      <button
        ref={blocksRef}
        type="button"
        role="tab"
        className={`${styles.tab} ${activeMode === MODE_BLOCKS ? styles.active : ''}`}
        onClick={handleClick(MODE_BLOCKS)}
        onKeyDown={handleKeyDown(MODE_BLOCKS)}
        disabled={disabled}
        aria-selected={activeMode === MODE_BLOCKS}
        aria-pressed={activeMode === MODE_BLOCKS}
        aria-label={`${MODE_LABELS[MODE_BLOCKS]} — ${MODE_DESCRIPTIONS[MODE_BLOCKS]}`}
        tabIndex={activeMode === MODE_BLOCKS ? 0 : -1}
        data-mode={MODE_BLOCKS}
      >
        {MODE_LABELS[MODE_BLOCKS]}
      </button>
      <button
        ref={codeRef}
        type="button"
        role="tab"
        className={`${styles.tab} ${activeMode === MODE_CODE ? styles.active : ''}`}
        onClick={handleClick(MODE_CODE)}
        onKeyDown={handleKeyDown(MODE_CODE)}
        disabled={disabled}
        aria-selected={activeMode === MODE_CODE}
        aria-pressed={activeMode === MODE_CODE}
        aria-label={`${MODE_LABELS[MODE_CODE]} — ${MODE_DESCRIPTIONS[MODE_CODE]}`}
        tabIndex={activeMode === MODE_CODE ? 0 : -1}
        data-mode={MODE_CODE}
      >
        {MODE_LABELS[MODE_CODE]}
      </button>
    </div>
  );
}

export { MODE_LABELS, MODE_DESCRIPTIONS };
