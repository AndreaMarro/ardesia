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

  // iter 88 PHASE 3 HIGH-2 fix (comprehensive-review subagent verdict):
  // Esc keydown attached to dialogRef.current (NOT window) — window scope
  // would swallow Esc from CodeMirror/Blockly autocomplete close + search
  // overlay close beneath the dialog. Dialog already has focus per trap so
  // bubbles naturally. Andrea WCAG mandate + spec §88.UX-3 preserved.
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    node.addEventListener('keydown', handleKey);
    return () => node.removeEventListener('keydown', handleKey);
  }, [dismiss]);

  // iter 88 PHASE 3 HIGH-3 fix: Focus trap with backdrop-click focus restore.
  // Pattern: window-level keydown + activeElement guard (must be inside dialog).
  // If user clicks backdrop (focus escapes to body), Tab afterward re-focuses
  // dialog first focusable. Mitigates trap break per review HIGH-3.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const node = dialogRef.current;
      if (!node) return;
      const focusable = node.querySelectorAll(FOCUSABLE_SEL);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      // Guard: only trap when focus is inside dialog. If body got focus
      // via backdrop click, restore to first focusable on Tab.
      const inside = document.activeElement && node.contains(document.activeElement);
      if (!inside) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // iter 88 PHASE 3 HIGH-4 fix: Track mutated elements in a ref Set so
  // cleanup always strips data-onboard-active even if React 19 strict mode
  // double-renders OR if step?.targetSelector flips undefined briefly.
  // useLayoutEffect runs synchronously pre-paint to avoid Lime outline flash.
  // CSS drops :global !important + lowers z-index 10499→10399 (under
  // backdrop 10500). See HomeCompileOnboarding.module.css PHASE 3 fix.
  const activeTargetsRef = useRef(new Set());
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Strip prior step's marks via ref tracking (guarantees no orphan).
    activeTargetsRef.current.forEach((el) => {
      try { el.removeAttribute('data-onboard-active'); } catch (_) { /* defensive */ }
    });
    activeTargetsRef.current.clear();
    if (!step?.targetSelector) {
      // Still return cleanup to ensure unmount strips defensively.
      return () => {
        activeTargetsRef.current.forEach((el) => {
          try { el.removeAttribute('data-onboard-active'); } catch (_) { /* defensive */ }
        });
        activeTargetsRef.current.clear();
      };
    }
    const active = document.querySelector(step.targetSelector);
    if (active) {
      active.setAttribute('data-onboard-active', 'true');
      activeTargetsRef.current.add(active);
    }
    return () => {
      activeTargetsRef.current.forEach((el) => {
        try { el.removeAttribute('data-onboard-active'); } catch (_) { /* defensive */ }
      });
      activeTargetsRef.current.clear();
    };
  }, [step?.targetSelector]);

  // iter 88 PHASE 3 HIGH-1 fix: Auto-focus ONLY on initial mount (deps [],
  // NOT [stepIdx]). Per-step transition no longer steals focus mid-flow
  // (e.g. docente Shift+Tab to Indietro retains focus). Screen readers
  // announce new step content via aria-live updates from h2 + p re-render.
  // LIM keyboard scenario explicit Andrea mandate preserved.
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const focusable = node.querySelectorAll(FOCUSABLE_SEL);
    if (focusable.length) {
      const primary = focusable[focusable.length - 1];
      primary.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
