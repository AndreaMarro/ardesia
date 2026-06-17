import React from 'react';
import styles from './IdeShell.module.css';

export type IdeMode = 'blocks' | 'cpp' | 'dual';

const OPTIONS: Array<{ id: IdeMode; label: string }> = [
  { id: 'blocks', label: 'Blocchi' },
  { id: 'cpp', label: 'C++' },
  { id: 'dual', label: 'Vista doppia' },
];

type ModeSwitcherProps = {
  mode: IdeMode;
  onModeChange: (mode: IdeMode) => void;
};

export default function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className={styles.modeSwitcher} role="group" aria-label="Modalita editor">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={styles.modeButton}
          data-active={mode === option.id}
          aria-pressed={mode === option.id}
          onClick={() => onModeChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
