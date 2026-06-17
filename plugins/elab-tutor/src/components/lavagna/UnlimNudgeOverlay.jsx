/**
 * UnlimNudgeOverlay — small, dismissable toast that surfaces a proactive
 * message from `useUnlimNudge`. Positioned bottom-right over the current
 * pane. Clicking "Ok" dismisses for 90s (managed by the hook). Clicking
 * "Chiedi a UNLIM" delegates to onAskUNLIM so the docente can escalate.
 *
 * This component is purely presentational — it never runs the nudge logic
 * itself, so unit tests can exercise it with controlled props and the
 * parent stays in control of *when* nudges fire.
 *
 * Principio Zero: the docente glances at the screen from the corner of
 * the eye. The nudge must be legible in under 2 seconds and actionable
 * in one tap.
 *
 * © Andrea Marro — 18/04/2026 — Ralph Loop iteration 1 (PDR v3 TASK 6)
 */

import React from 'react';

const BORDER_BY_PRIORITY = {
  high: 'var(--elab-red)',
  med: 'var(--elab-orange)',
  medium: 'var(--elab-orange)',
  low: 'var(--elab-lime)',
};

const BG_BY_PRIORITY = {
  high: 'linear-gradient(135deg, #fff5f4 0%, #ffffff 100%)', // palette
  med: 'linear-gradient(135deg, #fff8ee 0%, #ffffff 100%)', // palette
  medium: 'linear-gradient(135deg, #fff8ee 0%, #ffffff 100%)', // palette
  low: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', // palette
};

export default function UnlimNudgeOverlay({
  visible,
  message,
  priority = 'low',
  onDismiss,
  onAskUNLIM,
  // Test seam — parent may force presentation in storybook/tests.
  _forceRender = false,
}) {
  if (!_forceRender && (!visible || !message)) return null;

  const border = BORDER_BY_PRIORITY[priority] || BORDER_BY_PRIORITY.low;
  const bg = BG_BY_PRIORITY[priority] || BG_BY_PRIORITY.low;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="unlim-nudge-overlay"
      data-priority={priority}
      style={{
        position: 'absolute',
        right: 16,
        bottom: 16,
        maxWidth: 340,
        padding: '14px 16px',
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: 14,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 40,
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          fontFamily: "'Oswald', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: border,
        }}
      >
        UNLIM suggerisce
      </div>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: '#1a1a2e', // palette
          marginBottom: 12,
        }}
      >
        {message}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Chiudi suggerimento UNLIM"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 10,
            border: `1px solid ${border}40`,
            background: 'rgba(255,255,255,0.6)',
            color: border,
            cursor: 'pointer',
            fontFamily: "'Oswald', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          Ok
        </button>
        {onAskUNLIM && (
          <button
            type="button"
            onClick={() => onAskUNLIM(message)}
            aria-label="Chiedi a UNLIM di approfondire"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              background: border,
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            Chiedi a UNLIM
          </button>
        )}
      </div>
    </div>
  );
}
