/**
 * ELAB Simulator — Circuit Save/Load
 * Auto-save to localStorage, JSON export/import.
 * © Andrea Marro — 12/02/2026
 */

import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'elab-simulator-circuit';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

/**
 * useCircuitStorage — auto-save and manual export/import of circuit state.
 *
 * @param {string} experimentId — current experiment ID (null = sandbox)
 * @param {object} getState — function returning { layout, connections, components, pinAssignments }
 * @param {function} restoreState — function to apply a saved state
 */
export default function useCircuitStorage(experimentId, getState, restoreState) {
  const lastSavedRef = useRef('');

  // ─── Auto-save to localStorage every 5 seconds ───
  useEffect(() => {
    if (!experimentId) return;

    const timer = setInterval(() => {
      const state = getState();
      const key = `${STORAGE_KEY}-${experimentId}`;
      const json = JSON.stringify(state);

      // Only write if changed
      if (json !== lastSavedRef.current) {
        try {
          localStorage.setItem(key, json);
          lastSavedRef.current = json;
        } catch (e) {
          // localStorage full — silently fail
        }
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [experimentId, getState]);

  // ─── Load from localStorage on experiment change ───
  const loadFromStorage = useCallback((overrideExperimentId = null) => {
    const targetExperimentId = overrideExperimentId || experimentId;
    if (!targetExperimentId) return false;
    const key = `${STORAGE_KEY}-${targetExperimentId}`;
    try {
      const json = localStorage.getItem(key);
      if (!json) return false;
      const state = JSON.parse(json);
      // Validate shape
      if (!state || typeof state !== 'object') return false;
      if (!Array.isArray(state.connections) || !Array.isArray(state.components)) return false;
      restoreState(state);
      lastSavedRef.current = json;
      return true;
    } catch {
      return false;
    }
  }, [experimentId, restoreState]);

  // ─── Clear saved state for current experiment ───
  const clearSaved = useCallback(() => {
    if (!experimentId) return;
    const key = `${STORAGE_KEY}-${experimentId}`;
    localStorage.removeItem(key);
    lastSavedRef.current = '';
  }, [experimentId]);

  // ─── Check if there's a saved state ───
  const hasSavedState = useCallback(() => {
    if (!experimentId) return false;
    const key = `${STORAGE_KEY}-${experimentId}`;
    return localStorage.getItem(key) !== null;
  }, [experimentId]);

  // ─── Export to JSON file (download) ───
  const exportJSON = useCallback(() => {
    const state = getState();
    const payload = {
      version: 1,
      experimentId: experimentId || 'sandbox',
      timestamp: new Date().toISOString(),
      circuit: state,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elab-circuit-${experimentId || 'sandbox'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [experimentId, getState]);

  // ─── Import from JSON file ───
  const importJSON = useCallback(() => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) { resolve(false); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const payload = JSON.parse(ev.target.result);
            if (!payload || !payload.circuit) { resolve(false); return; }
            const state = payload.circuit;
            if (!Array.isArray(state.connections) || !Array.isArray(state.components)) {
              resolve(false);
              return;
            }
            restoreState(state);
            resolve(true);
          } catch {
            resolve(false);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }, [restoreState]);

  return {
    loadFromStorage,
    clearSaved,
    hasSavedState,
    exportJSON,
    importJSON,
  };
}
