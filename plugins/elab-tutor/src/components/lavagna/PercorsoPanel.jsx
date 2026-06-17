/**
 * PercorsoPanel — Lesson path (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI) in FloatingWindow.
 * Wraps the existing LessonPathPanel for the Lavagna shell.
 * Principio Zero: only the teacher sees this. Language is neutral guide, not "you the teacher".
 * (c) Andrea Marro — 03/04/2026
 */

import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import FloatingWindow from './FloatingWindow';

const LessonPathPanel = lazy(() => import('../simulator/panels/LessonPathPanel'));

export default function PercorsoPanel({ visible = false, onClose, experiment: propExperiment = null }) {
  const [localExperiment, setLocalExperiment] = useState(null);
  const [allExperiments, setAllExperiments] = useState([]);

  // Use prop experiment (from LavagnaShell) as primary source
  const experiment = propExperiment || localExperiment;

  // Listen for experiment changes via __ELAB_API event system + polling fallback
  useEffect(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api) return;

    // Initial load from API
    const exp = api.getCurrentExperiment?.();
    if (exp) setLocalExperiment(exp);
    const all = api.getExperimentList?.();
    if (all?.length) setAllExperiments(all);

    // Event-driven updates (instant)
    const onExpChange = () => {
      const newExp = api.getCurrentExperiment?.();
      if (newExp) setLocalExperiment(newExp);
    };
    api.on('experimentChange', onExpChange);

    // Short polling fallback for race condition on mount
    let retries = 0;
    const poll = setInterval(() => {
      const e = api.getCurrentExperiment?.();
      if (e && e.id) { setLocalExperiment(e); clearInterval(poll); }
      if (++retries > 10) clearInterval(poll);
    }, 300);

    return () => {
      clearInterval(poll);
      api.off('experimentChange', onExpChange);
    };
  }, [propExperiment]);

  const handleSendToUNLIM = useCallback((msg) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.unlim?.sendMessage) api.unlim.sendMessage(msg);
  }, []);

  const handleLoadExperiment = useCallback((id) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.loadExperiment) api.loadExperiment(id);
  }, []);

  if (!visible) return null;

  return (
    <FloatingWindow
      id="percorso-v2"
      title="Guida Esperimento"
      defaultPosition={{ x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 400) : 600, y: 56 }}
      defaultSize={{ w: 380, h: Math.min(550, typeof window !== 'undefined' ? window.innerHeight - 120 : 550) }}
      onClose={onClose}
    >
      <div style={{ height: '100%', overflow: 'auto' }}>
        {experiment ? (
          <Suspense fallback={<div style={{ padding: 20, textAlign: 'center', color: 'var(--elab-navy)' }}>Caricamento percorso...</div>}>
            <LessonPathPanel
              experiment={experiment}
              allExperiments={allExperiments}
              onClose={onClose}
              onSendToUNLIM={handleSendToUNLIM}
              onLoadExperiment={handleLoadExperiment}
              embedded
            />
          </Suspense>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--elab-navy)', fontFamily: 'Open Sans, sans-serif' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&var(--elab-hex-128218);</div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nessun esperimento caricato</p>
            <p style={{ fontSize: 14, color: 'var(--elab-hex-737373)' }}>Scegli un esperimento dall'header per vedere il percorso della lezione.</p>
          </div>
        )}
      </div>
    </FloatingWindow>
  );
}
