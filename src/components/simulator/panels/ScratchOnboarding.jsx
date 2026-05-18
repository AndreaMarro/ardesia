import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
}

export default function ScratchOnboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const modalRef = useRef(null);
  const restoreFocusRef = useRef(null);

  // Save current focus + apply initial focus on mount + restore on unmount
  useEffect(() => {
    restoreFocusRef.current = document.activeElement;

    // Defer to next frame so modal DOM is fully mounted before focusing
    const rafId = requestAnimationFrame(() => {
      if (!modalRef.current) return;
      const focusables = getFocusableElements(modalRef.current);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (typeof modalRef.current.focus === 'function') {
        modalRef.current.focus();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      // Restore focus on unmount (defensive — element may have been removed)
      const restoreTarget = restoreFocusRef.current;
      if (restoreTarget && typeof restoreTarget.focus === 'function') {
        try {
          restoreTarget.focus();
        } catch (_) {
          /* defensive: element may be unmounted */
        }
      }
    };
  }, []);

  // Document-level Escape listener (preserves legacy behavior — T7 in
  // ScratchOnboarding.test.jsx fires keydown on document, not on modal).
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

  // Modal-level focus trap on Tab/Shift+Tab. ESC is also handled here so the
  // dialog explicitly preventDefault's it before bubbling to the document
  // listener above (which still fires onComplete — both paths idempotent).
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      // stopPropagation prevents the document-level Escape listener (above)
      // from firing onComplete a second time when ESC originates inside the
      // modal — single-source dispatch semantics.
      event.stopPropagation();
      localStorage.setItem('elab-blockly-onboarded', 'true');
      onComplete();
      return;
    }
    if (event.key !== 'Tab') return;
    if (!modalRef.current) return;

    const focusables = getFocusableElements(modalRef.current);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }, [onComplete]);

  const finish = () => {
    localStorage.setItem('elab-blockly-onboarded', 'true');
    onComplete();
  };

  const current = STEPS[step];
  const IconComponent = current.icon;

  return (
    <div
      ref={modalRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-body"
      aria-label="Tutorial ELAB Scratch Arduino: 3 passi"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
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
