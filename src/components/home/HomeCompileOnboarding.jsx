/**
 * HomeCompileOnboarding — iter 88 88.UX-3 /onboard.
 *
 * Spec: docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md §88.UX-3
 *
 * Goal: 5-step overlay first-render tour per docente non-tech first visiting
 * `#compile-home`. Mostra workflow visivo passo-passo: starter buttons →
 * editor → compila → status → carica. Dismissibile via "Salta tour", Esc,
 * o completamento (step 5 → "Inizia").
 *
 * Tour persisted via localStorage key `elab.compile.onboarded === 'true'`
 * — second visit no auto-mount. Reset via DevTools `localStorage.removeItem`
 * o nuovo browser/incognito.
 *
 * PRINCIPIO ZERO: plurale "Ragazzi", "Aprite", "Premete" — comportamento
 * docente legge ad alta voce alla classe LIM. Mai singolare imperativo.
 *
 * Morfismo Sense 2: palette Navy/Lime/Orange/Red CSS vars + ARIA dialog +
 * focus trap WCAG 2.4.3 + touch ≥44×44 + Esc close + backdrop blur.
 *
 * Anti-pattern: NO emoji, NO ASCII art, NO testo decorativo. Bottoni size
 * uniform (Salta tour secondary outline, Indietro outline, Avanti/Inizia
 * filled primary).
 *
 * Architettura highlight target: ogni step ha `targetSelector` su
 * `data-onboard-target="<name>"` attr HomeCompileEntry. Step active aggiunge
 * `data-onboard-active="true"` per Lime 3px outline via CSS module sibling.
 *
 * Honesty caveats fine sezione:
 *   - Tooltip card posizionata fissa center-bottom (NO smart placement
 *     viewport-aware deferred iter 89+).
 *   - Focus trap usa stesso pattern FloatingWindow (focusable selector
 *     wide, Tab/Shift+Tab cycle within dialog).
 *   - Backdrop click NON chiude (richiede esplicito "Salta tour" o Esc).
 *   - Step transition no animate, instant render (animate deferred iter 89).
 *   - localStorage write defensive try/catch (private mode + quota OK).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HomeCompileOnboarding.module.css';

const ONBOARDED_KEY = 'elab.compile.onboarded';

// 5 step tour — copy plurale "Ragazzi" canonical, target via data-attr.
const STEPS = [
  {
    title: 'Iniziamo dagli esempi pronti',
    body: 'Ragazzi, qui programmiamo Arduino. Iniziamo con un esempio: cliccate uno dei bottoni in alto a sinistra (Blink, Pulsante, LED…).',
    targetSelector: '[data-onboard-target="starter-buttons"]',
  },
  {
    title: 'Modificate il codice insieme',
    body: 'Ragazzi, ora trascinate i blocchi colorati per cambiare l\'esempio. Potete cambiare i numeri (pin, secondi) o aggiungere blocchi nuovi.',
    targetSelector: '[data-onboard-target="editor"]',
  },
  {
    title: 'Premete Compila',
    body: 'Ragazzi, premete il bottone "Compila" sulla destra. Il browser tradurrà i blocchi in codice Arduino. Aspettate qualche secondo.',
    targetSelector: '[data-onboard-target="compile-bar"]',
  },
  {
    title: 'Aspettate il verde',
    body: 'Ragazzi, sotto il bottone Compila appare lo stato. Aspettate il messaggio verde "Programma pronto" prima di andare avanti.',
    targetSelector: '[data-onboard-target="compile-bar"]',
  },
  {
    title: 'Caricate sul kit',
    body: 'Ragazzi, ora collegate il Nano R4 del kit ELAB al computer con il cavo USB e premete "Carica". La luce del kit confermerà il caricamento.',
    targetSelector: '[data-onboard-target="compile-bar"]',
  },
];

// Focus trap — match FloatingWindow.jsx pattern (Tab/Shift+Tab cycle).
const FOCUSABLE_SEL = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const HomeCompileOnboarding = React.memo(function HomeCompileOnboarding({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const dialogRef = useRef(null);
  const dismissRef = useRef(false);

  const step = STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  // Persist + dismiss handler — used by skip, Esc, complete (step 5 → Inizia).
  const dismiss = useCallback(() => {
    if (dismissRef.current) return; // idempotent guard
    dismissRef.current = true;
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ONBOARDED_KEY, 'true');
      }
    } catch (_) { /* defensive — quota / private mode */ }
    if (typeof onComplete === 'function') onComplete();
  }, [onComplete]);

  // Esc keydown — close tour (Andrea WCAG mandate + spec §88.UX-3).
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dismiss]);

  // Focus trap — Tab cycles within dialog (FloatingWindow pattern).
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = node.querySelectorAll(FOCUSABLE_SEL);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    node.addEventListener('keydown', onKey);
    return () => node.removeEventListener('keydown', onKey);
  }, []);

  // Highlight active target via data-onboard-active attr — toggle on
  // matched element. Reset on step change + cleanup unmount. Defensive:
  // selector may not find element (component lazy mount race) — skip silently.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const targets = document.querySelectorAll('[data-onboard-target]');
    targets.forEach((el) => el.removeAttribute('data-onboard-active'));
    if (!step?.targetSelector) return;
    const active = document.querySelector(step.targetSelector);
    if (active) active.setAttribute('data-onboard-active', 'true');
    return () => {
      // Cleanup on step change / unmount — strip all active attrs.
      if (typeof document === 'undefined') return;
      const all = document.querySelectorAll('[data-onboard-target]');
      all.forEach((el) => el.removeAttribute('data-onboard-active'));
    };
  }, [step?.targetSelector]);

  // Auto-focus first focusable (Avanti btn primary CTA) on mount + step change
  // for keyboard-only docente flow (LIM remote keyboard pattern).
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const focusable = node.querySelectorAll(FOCUSABLE_SEL);
    // Focus "Avanti" / "Inizia" primary CTA (last focusable in row).
    if (focusable.length) {
      const primary = focusable[focusable.length - 1];
      primary.focus();
    }
  }, [stepIdx]);

  const handleNext = useCallback(() => {
    if (isLast) {
      dismiss();
      return;
    }
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }, [isLast, dismiss]);

  const handleBack = useCallback(() => {
    setStepIdx((i) => Math.max(0, i - 1));
  }, []);

  const titleId = 'home-compile-onboarding-title';
  const bodyId = 'home-compile-onboarding-body';

  return (
    <div className={styles.backdrop} data-testid="home-compile-onboarding-backdrop">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        data-testid="home-compile-onboarding-dialog"
      >
        <div className={styles.progress} aria-label={`Passo ${stepIdx + 1} di ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === stepIdx ? styles.dotActive : ''} ${i < stepIdx ? styles.dotDone : ''}`}
              aria-hidden="true"
            />
          ))}
          <span className={styles.progressLabel}>
            Passo {stepIdx + 1} di {STEPS.length}
          </span>
        </div>

        <h2 id={titleId} className={styles.title}>{step.title}</h2>
        <p id={bodyId} className={styles.body}>{step.body}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.skipBtn}
            onClick={dismiss}
            data-testid="home-compile-onboarding-skip"
          >
            Salta tour
          </button>
          <div className={styles.nav}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={handleBack}
              disabled={isFirst}
              data-testid="home-compile-onboarding-back"
            >
              Indietro
            </button>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={handleNext}
              data-testid="home-compile-onboarding-next"
            >
              {isLast ? 'Inizia' : 'Avanti'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HomeCompileOnboarding;
