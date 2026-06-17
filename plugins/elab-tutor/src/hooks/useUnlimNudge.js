// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * useUnlimNudge — Hook React che attiva UNLIM proattivo
 *
 * Principio Zero: il docente impreparato apre ELAB. Dopo 30-60s di inattività
 * UNLIM suggerisce proattivamente il prossimo passo, pone una domanda alla classe,
 * o indica cosa osservare — nel linguaggio 10-14 anni.
 *
 * Responsabilità:
 *   - Traccia lastInteraction (mouse, tastiera, step change)
 *   - Traccia lastStepChange (quando il docente cambia passo)
 *   - Invoca shouldNudge() periodicamente
 *   - Espone {nudge, message, priority} al componente UI
 *
 * L'UI deciderà COME mostrare il nudge (toast, overlay, mascotte che parla).
 * Questo hook si occupa solo della LOGICA di quando attivarlo.
 *
 * (c) Andrea Marro — 17/04/2026 — ELAB Tutor
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { shouldNudge } from '../services/unlimProactivity';

const POLL_INTERVAL_MS = 15_000; // Check ogni 15s

/**
 * @param {object} options
 * @param {string|null} options.currentExperimentId
 * @param {object|null} options.circuitState
 * @param {object|null} options.simulationState
 * @param {number|null} options.currentStepIndex
 * @param {number|null} options.totalSteps
 * @param {boolean} options.enabled - se false, nessun nudge (default true)
 * @returns {{nudge: boolean, message: string, priority: string, dismiss: function, resetIdle: function}}
 */
export default function useUnlimNudge({
  currentExperimentId = null,
  circuitState = null,
  simulationState = null,
  currentStepIndex = null,
  totalSteps = null,
  enabled = true,
} = {}) {
  const [nudgeState, setNudgeState] = useState({
    nudge: false,
    message: '',
    priority: 'low',
    reason: null,
  });

  const lastInteractionRef = useRef(Date.now());
  const lastStepChangeRef = useRef(Date.now());
  const prevStepIndexRef = useRef(currentStepIndex);
  const dismissedUntilRef = useRef(0); // timestamp fino a cui nudge dismesso

  // Reset idle ogni volta che c'è interazione utente
  const resetIdle = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  // Dismiss nudge corrente (lo nasconde per 90s)
  const dismiss = useCallback(() => {
    dismissedUntilRef.current = Date.now() + 90_000;
    setNudgeState({ nudge: false, message: '', priority: 'low', reason: null });
  }, []);

  // Listener globali per interazioni utente
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    const events = ['click', 'keydown', 'pointerdown', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetIdle));
    };
  }, [enabled, resetIdle]);

  // Quando cambia lo step, aggiorna lastStepChange
  useEffect(() => {
    if (currentStepIndex !== prevStepIndexRef.current) {
      prevStepIndexRef.current = currentStepIndex;
      lastStepChangeRef.current = Date.now();
    }
  }, [currentStepIndex]);

  // Polling periodico: valuta shouldNudge
  useEffect(() => {
    if (!enabled) return;
    if (!currentExperimentId) return;

    const checkNudge = () => {
      const now = Date.now();
      // Se nudge dismesso di recente, salta
      if (now < dismissedUntilRef.current) return;

      const decision = shouldNudge({
        currentExperimentId,
        circuitState,
        simulationState,
        currentStepIndex,
        totalSteps,
        lastInteraction: lastInteractionRef.current,
        lastStepChange: lastStepChangeRef.current,
        now,
      });

      if (decision.nudge) {
        setNudgeState({
          nudge: true,
          message: decision.message || '',
          priority: decision.priority || 'low',
          reason: decision.reason || null,
        });
      }
    };

    // Check iniziale dopo 20s (dà tempo al docente di iniziare)
    const initialTimer = setTimeout(checkNudge, 20_000);
    // Poi check ogni 15s
    const interval = setInterval(checkNudge, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled, currentExperimentId, circuitState, simulationState, currentStepIndex, totalSteps]);

  return {
    nudge: nudgeState.nudge,
    message: nudgeState.message,
    priority: nudgeState.priority,
    reason: nudgeState.reason,
    dismiss,
    resetIdle,
  };
}
