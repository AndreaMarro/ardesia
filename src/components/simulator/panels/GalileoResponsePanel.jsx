/* Andrea Marro — 12/02/2026, UI-7 polish 13/02/2026 */
/**
 * UNLIMResponsePanel — Modal overlay showing UNLIM AI response
 * Design: Apple card-style modal with UNLIM branding
 * Extracted from NewElabSimulator.jsx
 *
 * Props:
 *   response: { text: string, timestamp: number, loading?: boolean } | null
 *   isAsking: boolean
 *   onAskAgain: () => void
 *   onClose: () => void
 */

import React, { useState, useRef, useCallback } from 'react';
import { cleanAndTruncate } from '../../../utils/truncateResponse';

// iter 45 fix Andrea video2 06/05/2026 B10: modal "UNLIM SPIEGA L'ESPERIMENTO"
// copriva il potenziometro al centro canvas. Andrea verbatim "queste finestre
// che compaiono dovrebbero essere spostabili perché il potenziometro è coperto".
// Aggiunto state + drag pointer su header. Backdrop click-to-close preserve.
// Persiste posizione localStorage 'elab-unlim-response-pos' per coerenza UX.
const POSITION_STORAGE_KEY = 'elab-unlim-response-pos';

function loadSavedPosition() {
  try {
    const raw = localStorage.getItem(POSITION_STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p?.x === 'number' && typeof p?.y === 'number') return p;
    }
  } catch { /* localStorage unavailable */ }
  return null;
}

const UNLIMResponsePanel = React.memo(function UNLIMResponsePanel({
  response,
  isAsking,
  onAskAgain,
  onClose,
}) {
  const [pos, setPos] = useState(loadSavedPosition);
  const dragRef = useRef(null);

  const handleHeaderPointerDown = useCallback((e) => {
    if (e.target.closest('button')) return; // close btn click
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = pos || { x: 0, y: 0 };
    dragRef.current = { startX, startY, startPos };
    if (e.pointerId !== undefined) {
      try { e.target.setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
  }, [pos]);

  const handleHeaderPointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { startX, startY, startPos } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    setPos({ x: startPos.x + dx, y: startPos.y + dy });
  }, []);

  const handleHeaderPointerUp = useCallback((e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (e?.pointerId !== undefined) {
      try { e.target.releasePointerCapture?.(e.pointerId); } catch { /* noop */ }
    }
    setPos((p) => {
      if (p) {
        try { localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(p)); } catch { /* noop */ }
      }
      return p;
    });
  }, []);

  if (!response) return null;

  // iter 45 B10 fix: panel translation runtime via pos state. Default centered (no transform).
  const panelDynamicStyle = pos
    ? { transform: `translate(${pos.x}px, ${pos.y}px)` }
    : {};

  return (
    <div style={S.backdrop} onClick={() => !response.loading && onClose()} role="button" tabIndex={-1} aria-label="Chiudi risposta UNLIM">
      <div style={{ ...S.panel, ...panelDynamicStyle }} onClick={(e) => e.stopPropagation()}>
        {/* Header — iter 45 B10 draggable per non coprire potenziometro/canvas */}
        <div
          style={{ ...S.header, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
          onPointerDown={handleHeaderPointerDown}
          onPointerMove={handleHeaderPointerMove}
          onPointerUp={handleHeaderPointerUp}
          onPointerCancel={handleHeaderPointerUp}
          aria-label="Trascina per spostare la finestra UNLIM"
        >
          <div style={S.headerLeft}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>
              {response.loading ? '\u2026' : 'U'}
            </span>
            <div>
              <div style={S.headerTitle}>
                {response.loading ? 'UNLIM sta pensando...' : 'UNLIM spiega l\'esperimento'}
              </div>
              {!response.loading && (
                <div style={S.headerSub}>Assistente AI ELAB</div>
              )}
            </div>
          </div>
          {!response.loading && (
            <button onClick={onClose} style={S.closeBtn}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div style={S.body}>
          {response.loading ? (
            <div style={S.loadingWrap}>
              <div style={S.loadingDots}>
                <span style={{ ...S.dot, animationDelay: '0ms' }} />
                <span style={{ ...S.dot, animationDelay: '200ms' }} />
                <span style={{ ...S.dot, animationDelay: '400ms' }} />
              </div>
              <p style={S.loadingText}>Analizzando il circuito...</p>
            </div>
          ) : (
            cleanAndTruncate(response.text).split('\n').map((line, i) => (
              <p key={i} style={S.textLine}>{line}</p>
            ))
          )}
        </div>

        {/* Footer */}
        {!response.loading && (
          <div style={S.footer}>
            <span style={S.footerMeta}>
              Powered by ELAB AI — {new Date(response.timestamp).toLocaleTimeString('it-IT')}
            </span>
            <button
              onClick={onAskAgain}
              disabled={isAsking}
              style={{
                ...S.retryBtn,
                opacity: isAsking ? 0.5 : 1,
                cursor: isAsking ? 'not-allowed' : 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4 }}>
                <path d="M2 7A5 5 0 0 1 12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 7A5 5 0 0 1 2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 3L12 7L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isAsking ? 'Attendi...' : 'Chiedi ancora'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Styles (Apple card modal with UNLIM branding — uses design-system tokens) ───
const S = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--color-overlay-backdrop)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
    backdropFilter: 'blur(4px)',
  },

  panel: {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 18,
    boxShadow: 'var(--shadow-xl)',
    width: '100%',
    maxWidth: 580,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'var(--font-sans)',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  headerSub: {
    fontSize: 14,
    color: 'var(--color-accent)',
    fontWeight: 600,
    marginTop: 2,
  },

  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-sim-text-muted)',
    padding: 8,
    borderRadius: 8,
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    padding: '20px 24px',
    fontSize: 14,
    color: 'var(--color-text-gray-600)',
    lineHeight: 1.7,
    overflow: 'auto',
    flex: 1,
    fontFamily: 'var(--font-sans)',
  },

  textLine: {
    margin: '6px 0',
    lineHeight: 1.7,
  },

  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '30px 0',
  },

  loadingDots: {
    display: 'flex',
    gap: 6,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'var(--color-accent)',
    opacity: 0.4,
  },

  loadingText: {
    fontSize: 14,
    color: 'var(--color-sim-text-muted)',
    margin: 0,
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
  },

  footerMeta: {
    fontSize: 14,
    color: 'var(--color-sim-text-muted)',
  },

  retryBtn: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-accent)',
    borderRadius: 10,
    background: 'var(--color-bg)',
    color: 'var(--color-accent)',
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    minHeight: 56,
    transition: 'var(--transition-fast)',
  },
};

export default UNLIMResponsePanel;
