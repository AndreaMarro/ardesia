/**
 * ELAB Simulator — Progressive Disclosure Hook
 * Traccia le milestone dell'utente e calcola il livello di disclosure.
 * Il livello sale FLUIDAMENTE man mano che l'utente interagisce.
 *
 * Livello 1 (Novizio): solo controlli essenziali
 * Livello 2 (Esploratore): strumenti di costruzione circuiti
 * Livello 3 (Costruttore): tutti gli strumenti avanzati
 *
 * © Andrea Marro — 26/03/2026
 */

import { useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'elab-disclosure-milestones';

// Milestone → livello minimo che sbloccano
const MILESTONE_WEIGHTS = {
  // Livello 2: l'utente sta esplorando attivamente
  loadedExperiment: 1,      // ha caricato almeno 1 esperimento
  changedComponent: 1,      // ha modificato un valore (R, LED...)
  connectedWire: 2,         // ha collegato un filo
  draggedComponent: 2,      // ha trascinato un componente
  usedPalette: 2,           // ha aperto la palette componenti
  // Livello 3: l'utente sta costruendo
  compiledCode: 3,          // ha compilato codice Arduino
  usedCodeEditor: 3,        // ha aperto l'editor codice
  loaded3Experiments: 2,    // ha caricato 3+ esperimenti diversi
  usedUndo: 3,              // ha usato undo/redo
  exportedCircuit: 3,       // ha esportato JSON o PNG
};

// Soglie: quanti punti servono per ogni livello
const LEVEL_THRESHOLDS = [0, 0, 2, 5]; // L1=0, L2=2pts, L3=5pts

function loadMilestones() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveMilestones(milestones) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
  } catch { /* quota exceeded — silently ignore */ }
}

function computeLevel(milestones) {
  let score = 0;
  for (const [key, weight] of Object.entries(MILESTONE_WEIGHTS)) {
    if (milestones[key]) score += weight;
  }
  if (score >= LEVEL_THRESHOLDS[3]) return 3;
  if (score >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
}

/**
 * useDisclosureLevel — progressive disclosure basato su milestones utente.
 *
 * @returns {{ level: number, recordMilestone: (name: string) => void }}
 */
export default function useDisclosureLevel() {
  const [milestones, setMilestones] = useState(loadMilestones);
  const experimentCountRef = useRef(
    new Set(Object.keys(milestones).filter(k => k.startsWith('exp:')))
  );

  const recordMilestone = useCallback((name) => {
    setMilestones(prev => {
      // Track unique experiments for loaded3Experiments
      if (name === 'loadedExperiment') {
        // Already tracked — no-op unless it's a new experiment
        if (prev.loadedExperiment) return prev;
      }

      if (prev[name]) return prev; // already recorded

      const next = { ...prev, [name]: Date.now() };
      saveMilestones(next);
      return next;
    });
  }, []);

  // Special: track experiment count separately
  const recordExperimentLoad = useCallback((expId) => {
    const set = experimentCountRef.current;
    set.add(expId);

    setMilestones(prev => {
      const next = { ...prev, loadedExperiment: prev.loadedExperiment || Date.now() };
      if (set.size >= 3) {
        next.loaded3Experiments = prev.loaded3Experiments || Date.now();
      }
      if (JSON.stringify(next) === JSON.stringify(prev)) return prev;
      saveMilestones(next);
      return next;
    });
  }, []);

  const level = computeLevel(milestones);

  return { level, recordMilestone, recordExperimentLoad };
}
