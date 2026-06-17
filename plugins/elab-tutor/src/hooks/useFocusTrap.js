// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within a container while active.
 * Returns a ref to attach to the container element.
 * @param {boolean} active - whether the trap is active
 * @param {{ restoreFocus?: boolean }} options
 */
export default function useFocusTrap(active, { restoreFocus = true } = {}) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    if (restoreFocus) {
      previousFocusRef.current = document.activeElement;
    }

    const container = containerRef.current;
    const focusables = () => [...container.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);

    // Auto-focus first focusable element
    const first = focusables()[0];
    if (first) first.focus();

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus && previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return containerRef;
}
