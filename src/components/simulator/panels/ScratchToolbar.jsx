import React from 'react';
import { UndoIcon, RedoIcon, TrashIcon, HelpIcon } from '../../common/ElabIcons';
import styles from './ScratchToolbar.module.css';

export default function ScratchToolbar({
  onUndo,
  onRedo,
  onClear,
  onHelp,
  canUndo = false,
  canRedo = false,
}) {
  const handleClearWithConfirm = () => {
    if (window.confirm('Ragazzi, siete sicuri di voler svuotare il programma? I blocchi spariranno tutti.')) {
      onClear();
    }
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Strumenti Blockly">
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Annulla ultima azione"
        title="Annulla (Ctrl+Z)"
      >
        <UndoIcon size={24} />
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Ripeti azione"
        title="Ripeti (Ctrl+Y)"
      >
        <RedoIcon size={24} />
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={handleClearWithConfirm}
        aria-label="Svuota tutti i blocchi"
        title="Svuota workspace"
      >
        <TrashIcon size={24} />
      </button>
      <button
        type="button"
        className={`${styles.button} ${styles.touchTarget}`}
        onClick={onHelp}
        aria-label="Aiuto e suggerimenti"
        title="Mostra aiuto"
      >
        <HelpIcon size={24} />
      </button>
    </div>
  );
}
