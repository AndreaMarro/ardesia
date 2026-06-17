/**
 * GiaMontato — Modalità "Già Montato" pre-assembled diagnose ADR-025 §4.3
 *
 * Mostra un circuito già montato (final state della variazione) e propone alla classe
 * di osservare/diagnosticare. Se `hasError=true` evidenzia "qualcosa non torna" senza
 * dare la risposta (effetto Protégé).
 *
 * Linguaggio Principio Zero V3: plurale "Ragazzi", Vol/pag VERBATIM se forniti.
 *
 * Wire-up:
 *   • on mount → chiama `window.__ELAB_API.mountExperiment(experimentId)` se fornito
 *   • flag diagnose attiva mostra prompt + (opzionale) highlight visivo via API
 *
 * Andrea Marro — iter 26 gen-app caveman 2026-04-29
 */
import React, { useEffect, useMemo } from 'react';

const PROMPT_OK = 'Ragazzi, guardate qui — questo circuito è già montato. Sapete dirmi che cosa fa?';
const PROMPT_ERROR = 'Ragazzi, questo circuito ha un errore. Sapete trovarlo?';

export default function GiaMontato({
  experimentId = null,
  hasError = false,
  volumeRef = null, // { volume: 1, page: 42 } VERBATIM citation
  onReady,
}) {
  const prompt = hasError ? PROMPT_ERROR : PROMPT_OK;

  const citation = useMemo(() => {
    if (!volumeRef || typeof volumeRef.volume !== 'number') return null;
    const vol = volumeRef.volume;
    const pag = volumeRef.page;
    if (typeof pag !== 'number') return null;
    return `Vol.${vol} pag.${pag}`;
  }, [volumeRef]);

  // Mount circuit pre-assembled on entry + signal diagnose flag to simulator
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const api = window.__ELAB_API;
    if (!api) return;
    try {
      if (experimentId && typeof api.mountExperiment === 'function') {
        api.mountExperiment(experimentId);
      }
      // Signal diagnose mode to simulator (visual highlight errori potenziali)
      if (api.unlim && typeof api.unlim.setDiagnoseMode === 'function') {
        api.unlim.setDiagnoseMode(true);
      }
      if (typeof onReady === 'function') onReady();
    } catch {
      /* defensive: API mismatch should not break rendering */
    }
    return () => {
      try {
        if (api.unlim && typeof api.unlim.setDiagnoseMode === 'function') {
          api.unlim.setDiagnoseMode(false);
        }
      } catch { /* noop */ }
    };
  }, [experimentId, onReady]);

  return (
    <div
      role="region"
      aria-label="Modalità Già Montato"
      data-testid="gia-montato-panel"
      data-has-error={hasError ? 'true' : 'false'}
      style={{
        padding: '14px 18px',
        background: 'var(--elab-hex-fff8e6)',
        borderLeft: '4px solid var(--elab-orange)',
        borderRadius: 8,
        fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
        color: 'var(--elab-navy)',
        fontSize: 15,
        lineHeight: 1.45,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600 }}>{prompt}</p>
      {citation && (
        <p
          data-testid="gia-montato-citation"
          style={{ margin: '6px 0 0', fontSize: 13, fontStyle: 'italic', color: 'var(--elab-lime)' }}
        >
          Riferimento volume: {citation}
        </p>
      )}
    </div>
  );
}
