/**
 * StarterButtons — 3 grandi starter Andrea spec FASE 3.2
 * Andrea ratify gruppo 16 voce 2: labels verbatim spec.
 *
 * Click OR keyboard Space/Enter triggers onStarterClick(key) parent callback.
 * Parent (ElabScratchModeShell iter 84 atom 7) wires onStarterClick to
 * Blockly Xml.domToWorkspace(getStarterXml(key), workspace).
 *
 * WCAG 2.2 AA: touch 44+, aria-label, keyboard activate, focus visible.
 */
import React, { useCallback } from 'react';
import styles from './StarterButtons.module.css';

export const STARTER_KEYS = ['blink', 'button', 'sensor'];

const STARTER_LABELS = {
  blink: 'Accendi un LED',
  button: 'Leggi un pulsante',
  sensor: 'Leggi un sensore',
};

const STARTER_DESCRIPTIONS = {
  blink: 'Costruisci il programma classico LED lampeggiante: si accende, si spegne, ripete.',
  button: 'Programma che reagisce quando i ragazzi premono un pulsante.',
  sensor: 'Programma che legge un valore da un sensore analogico.',
};

export function StarterButtons({ onStarterClick, disabled = false }) {
  const handleClick = useCallback((key) => () => {
    if (!disabled && typeof onStarterClick === 'function') {
      onStarterClick(key);
    }
  }, [disabled, onStarterClick]);

  const handleKeyDown = useCallback((key) => (event) => {
    if (disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (typeof onStarterClick === 'function') {
        onStarterClick(key);
      }
    }
  }, [disabled, onStarterClick]);

  return (
    <div className={styles.container} role="group" aria-label="Programmi iniziali da cui partire">
      {STARTER_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={styles.button}
          onClick={handleClick(key)}
          onKeyDown={handleKeyDown(key)}
          disabled={disabled}
          aria-label={`${STARTER_LABELS[key]} — ${STARTER_DESCRIPTIONS[key]}`}
          data-starter={key}
        >
          <span className={styles.label}>{STARTER_LABELS[key]}</span>
          <span className={styles.description}>{STARTER_DESCRIPTIONS[key]}</span>
        </button>
      ))}
    </div>
  );
}

export { STARTER_LABELS, STARTER_DESCRIPTIONS };
