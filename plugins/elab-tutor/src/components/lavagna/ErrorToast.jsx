/**
 * ErrorToast — Shows a brief "UNLIM può aiutarti" when circuit/compilation errors occur.
 * Listens to __ELAB_API events for errors, auto-dismisses after 6s.
 * Non-invasive: small toast, doesn't block the UI.
 * (c) Andrea Marro — 02/04/2026
 */
import React, { useState, useEffect, useCallback } from 'react';
import css from './ErrorToast.module.css';

export default function ErrorToast({ onAskUnlim }) {
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  // Listen for simulator error events
  useEffect(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api?.on) return;

    const handleError = (data) => {
      const msg = data?.message || data?.errors?.[0] || 'Errore nel circuito';
      setError(typeof msg === 'string' ? msg.slice(0, 100) : 'Errore nel circuito');
      setVisible(true);
    };

    // Listen for various error events the simulator might emit
    api.on('circuitError', handleError);
    api.on('compilationError', handleError);

    return () => {
      api.off?.('circuitError', handleError);
      api.off?.('compilationError', handleError);
    };
  }, []);

  // Auto-dismiss after 6s
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [visible]);

  const handleAsk = useCallback(() => {
    onAskUnlim?.(`Ho un errore: ${error}. Puoi aiutarmi a capire cosa ho sbagliato?`);
    setVisible(false);
  }, [error, onAskUnlim]);

  const handleDismiss = useCallback(() => setVisible(false), []);

  if (!visible || !error) return null;

  return (
    <div className={css.toast} role="alert">
      <div className={css.content}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={css.icon}>
          <circle cx="10" cy="10" r="8" stroke="var(--elab-red)" strokeWidth="1.5" fill="rgba(229,75,61,0.1)" />
          <path d="M10 6v5M10 13v1" stroke="var(--elab-red)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className={css.text}>{error}</span>
      </div>
      <button className={css.askBtn} onClick={handleAsk}>
        UNLIM può aiutarti
      </button>
      <button className={css.dismissBtn} onClick={handleDismiss} aria-label="Chiudi">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
