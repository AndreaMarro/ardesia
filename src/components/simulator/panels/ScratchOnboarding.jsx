import React, { useState, useEffect } from 'react';
import { RobotIcon, PuzzleIcon, CircuitIcon } from '../../common/ElabIcons';
import styles from './ScratchOnboarding.module.css';

const STEPS = [
  {
    icon: CircuitIcon,
    title: 'Costruite prima il circuito reale',
    body: 'Ragazzi, prima di scrivere il programma prendete il kit ELAB e montate il LED sulla breadboard come mostrato nel Vol.1 pag.42. Il software completa il lavoro che fate con le mani.',
  },
  {
    icon: PuzzleIcon,
    title: 'Trascinate i blocchi a sinistra',
    body: 'Ragazzi, scegliete la categoria LED a sinistra e trascinate il blocco "accendi LED" nel programma. Ogni blocco è un comando che Arduino eseguirà.',
  },
  {
    icon: RobotIcon,
    title: 'Premete Compila per provare',
    body: 'Ragazzi, quando il programma è pronto premete il bottone Compila in basso. Il computer trasformerà i blocchi in codice C++ pronto per Arduino.',
  },
];

export default function ScratchOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        localStorage.setItem('elab-blockly-onboarded', 'true');
        onComplete();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onComplete]);

  const finish = () => {
    localStorage.setItem('elab-blockly-onboarded', 'true');
    onComplete();
  };

  const current = STEPS[step];
  const IconComponent = current.icon;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
    >
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <IconComponent size={64} />
        </div>
        <h2 id="onboarding-title" className={styles.title}>
          {current.title}
        </h2>
        <p id="onboarding-body" className={styles.body}>
          {current.body}
        </p>
        <p className={styles.stepIndicator} aria-live="polite">
          Passo {step + 1} di {STEPS.length}
        </p>
        <div className={styles.actions}>
          {step > 0 && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => setStep(step - 1)}
            >
              Indietro
            </button>
          )}
          <button
            type="button"
            className={`${styles.button} ${styles.buttonGhost}`}
            onClick={finish}
          >
            Salta
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => setStep(step + 1)}
            >
              Avanti
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={finish}
            >
              Iniziamo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
