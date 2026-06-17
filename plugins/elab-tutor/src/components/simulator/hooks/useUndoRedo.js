/**
 * ELAB Simulator — Undo/Redo History Stack
 * Custom hook per gestire cronologia delle modifiche al circuito.
 * Supporta max 50 step, Ctrl+Z per undo, Ctrl+Y / Ctrl+Shift+Z per redo.
 * © Andrea Marro — 12/02/2026
 */

import { useRef, useCallback, useState } from 'react';

const MAX_HISTORY = 50;

/**
 * Deep clone a circuit state snapshot
 */
function cloneSnapshot(s) {
  return {
    layout: { ...s.layout },
    connections: s.connections.map(c => ({ ...c })),
    components: s.components.map(c => ({ ...c })),
    pinAssignments: { ...s.pinAssignments },
  };
}

/**
 * useUndoRedo — gestisce una pila di snapshot per undo/redo del circuito.
 *
 * API:
 *   pushSnapshot(currentState) — salva stato corrente prima di una modifica
 *   undo(currentState) → snapshot | null — ritorna allo stato precedente
 *   redo() → snapshot | null — ripristina lo stato successivo
 *   resetHistory() — pulisce la cronologia (cambio esperimento)
 *   canUndo — boolean
 *   canRedo — boolean
 */
export default function useUndoRedo() {
  // Use refs for the actual data (no re-render needed on every push)
  const pastRef = useRef([]);    // stack of past states
  const futureRef = useRef([]);  // stack of future states (for redo)

  // Counter to force re-render when canUndo/canRedo changes
  const [, setTick] = useState(0);
  const tick = useCallback(() => setTick(t => t + 1), []);

  /**
   * Save current state BEFORE a mutation.
   * Clears redo stack (new action invalidates future).
   */
  const pushSnapshot = useCallback((currentState) => {
    const past = pastRef.current;
    past.push(cloneSnapshot(currentState));

    // Enforce max history
    while (past.length > MAX_HISTORY) {
      past.shift();
    }

    // New action clears redo stack
    futureRef.current = [];

    tick();
  }, [tick]);

  /**
   * Undo: restore previous state.
   * Saves current state to redo stack.
   */
  const undo = useCallback((currentState) => {
    const past = pastRef.current;
    if (past.length === 0) return null;

    // Save current state to future stack (for redo)
    futureRef.current.push(cloneSnapshot(currentState));

    // Pop last past state
    const snapshot = past.pop();
    tick();
    return snapshot;
  }, [tick]);

  /**
   * Redo: restore next state from future stack.
   * Saves current state to past stack.
   */
  const redo = useCallback((currentState) => {
    const future = futureRef.current;
    if (future.length === 0) return null;

    // Save current state to past stack
    pastRef.current.push(cloneSnapshot(currentState));

    // Pop from future
    const snapshot = future.pop();
    tick();
    return snapshot;
  }, [tick]);

  /**
   * Reset history (switching experiments, etc.)
   */
  const resetHistory = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    tick();
  }, [tick]);

  return {
    pushSnapshot,
    undo,
    redo,
    resetHistory,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
