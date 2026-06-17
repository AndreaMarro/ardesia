/**
 * LessonBar — Compact lesson progress bar below the circuit
 * Shows: "[Step 1/5] PREPARA — Non dare il resistore subito"
 * Click to expand for full detail. Replaces the 300px right panel.
 * (c) Andrea Marro — 02/04/2026
 */
import React, { useState, useCallback } from 'react';
import css from './LessonBar.module.css';

export default function LessonBar({ steps = [], currentStep = 0, onAskUnlim }) {
  const [expanded, setExpanded] = useState(false);

  const step = steps[currentStep];
  if (!step && steps.length === 0) return null;

  const toggleExpand = useCallback(() => setExpanded(p => !p), []);

  const stepLabel = step?.label || step?.title || `Passo ${currentStep + 1}`;
  const stepDesc = step?.description || step?.text || '';
  const stepType = step?.type?.toUpperCase() || '';

  const handleQuickAsk = useCallback((e) => {
    e.stopPropagation(); // Don't toggle expand
    onAskUnlim?.(`Aiutami con il passo ${currentStep + 1}: ${stepLabel}`);
  }, [currentStep, stepLabel, onAskUnlim]);

  return (
    <div className={css.bar}>
      {/* Compact view — always visible */}
      <div className={css.compactRow}>
        <button className={css.compact} onClick={toggleExpand} aria-expanded={expanded}>
          <span className={css.progress}>
            {currentStep + 1}/{steps.length}
          </span>
          {/* Mini progress dots */}
          {steps.length > 1 && steps.length <= 10 && (
            <span className={css.miniDots} aria-hidden="true">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`${css.miniDot} ${i < currentStep ? css.miniDotDone : ''} ${i === currentStep ? css.miniDotCurrent : ''}`}
                />
              ))}
            </span>
          )}
          {stepType && <span className={css.badge}>{stepType}</span>}
          <span className={css.stepLabel}>{stepLabel}</span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
            className={`${css.chevron} ${expanded ? css.chevronUp : ''}`}
          >
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* Quick UNLIM help — always visible on compact bar */}
        {onAskUnlim && (
          <button
            className={css.quickAsk}
            onClick={handleQuickAsk}
            aria-label="Chiedi aiuto a UNLIM per questo passo"
            title="Chiedi a UNLIM"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="14" height="12" rx="3" fill="var(--elab-navy)" />
              <circle cx="8" cy="10" r="1.3" fill="var(--elab-lime)" />
              <circle cx="12" cy="10" r="1.3" fill="var(--elab-lime)" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className={css.detail}>
          {stepDesc && <p className={css.desc}>{stepDesc}</p>}
          {onAskUnlim && (
            <button
              className={css.askUnlim}
              onClick={() => onAskUnlim(`Spiega in modo semplice il passo ${currentStep + 1}: ${stepLabel}. ${stepDesc}`)}
            >
              Chiedi a UNLIM di spiegare
            </button>
          )}
        </div>
      )}
    </div>
  );
}
