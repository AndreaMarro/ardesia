/* Andrea Marro — 12/02/2026, UI-7 polish 13/02/2026 */
/**
 * ExperimentGuide — Compact "Cosa Fare" floating panel
 * Shows experiment steps, observations, and concept.
 * Design: Apple card-style floating guide
 * Extracted from NewElabSimulator.jsx
 *
 * Props:
 *   experiment: { title, icon, desc, steps, observe, note, concept }
 *   onClose: () => void
 */

import React from 'react';

const ExperimentGuide = React.memo(function ExperimentGuide({ experiment, buildMode, onClose, onSendToUNLIM }) {
  // S84: Auto-collapse on iPad/tablet (all breakpoints ≤1365px) to maximize canvas space
  const isTabletOrSmaller = typeof window !== 'undefined' && window.innerWidth <= 1365;
  const [expanded, setExpanded] = React.useState(!isTabletOrSmaller);
  if (!experiment) return null;
  // S112: In "Già Montato" (complete) mode, hide wiring steps — circuit is pre-assembled
  const isComplete = buildMode === 'complete';
  const steps = isComplete ? [] : (experiment.steps || []);
  const observe = experiment.observe || experiment.note || '';
  const desc = experiment.desc || '';

  if (!steps.length && !observe && !desc) return null;

  // Collapsed: just a small floating button
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={S.collapsedBtn}
        title="Mostra guida esperimento"
        data-elab-guide="true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--color-primary)' }}>
          <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 6H12M6 9H12M6 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    );
  }

  return (
    <div style={S.root} data-elab-guide="true">
      {/* Header */}
      <div style={S.header}>
        <span style={S.headerIcon}>{experiment.icon || '\u25CF'}</span>
        <span style={S.headerTitle}>{experiment.title}</span>
        <div style={S.headerActions}>
          <button onClick={() => setExpanded(false)} style={S.headerBtn} title="Comprimi">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button onClick={onClose} style={S.headerBtn} title="Chiudi">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {desc && (
        <p style={S.desc}>{desc}</p>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Cosa Fare</div>
          <ol style={S.stepsList}>
            {steps.map((s, i) => (
              <li key={i} style={S.step}>
                <span style={S.stepNum}>{i + 1}</span>
                <span style={S.stepText}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Observe */}
      {observe && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Cosa Osservare</div>
          <p style={S.observe}>{observe}</p>
        </div>
      )}

      {/* Concept */}
      {experiment.concept && (
        <div style={S.concept}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="7" cy="6" r="4" stroke="var(--color-vol2)" strokeWidth="1.5"/>
            <path d="M5.5 10.5H8.5" stroke="var(--color-vol2)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{experiment.concept}</span>
        </div>
      )}

      {/* Chiedi a UNLIM */}
      {onSendToUNLIM && (
        <button
          onClick={() => onSendToUNLIM(`Spiegami l'esperimento "${experiment.title || ''}" — cosa devo osservare e perché funziona così?`)}
          style={S.unlimBtn}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4C7.83 4 8.5 4.67 8.5 5.5C8.5 6.33 7 6.5 7 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7" cy="9.5" r="0.5" fill="currentColor"/>
          </svg>
          Chiedi a UNLIM
        </button>
      )}
    </div>
  );
});

// ─── Styles (Apple floating card) ───
const S = {
  collapsedBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 56,
    height: 56,
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.95)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    boxShadow: 'var(--shadow-sm, 0 2px 10px rgba(0, 0, 0, 0.08))',
    backdropFilter: 'blur(8px)',
  },

  root: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 'min(260px, calc(100% - 16px))',
    maxHeight: 'calc(100% - 16px)',
    background: 'rgba(255, 255, 255, 0.97)',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 14,
    boxShadow: 'var(--shadow-lg, 0 4px 24px rgba(0, 0, 0, 0.1))',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontSize: 14,
    color: 'var(--color-text-gray-700, #333)',
    overflow: 'auto',
    resize: 'both',
    zIndex: 20,
    backdropFilter: 'blur(8px)',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    borderBottom: '1px solid var(--color-border, #F0F0F0)',
    borderRadius: '14px 14px 0 0',
  },

  headerIcon: {
    fontSize: 18,
    lineHeight: 1,
  },

  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text, #1A1A2E)',
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    lineHeight: 1.25,
  },

  headerActions: {
    display: 'flex',
    gap: 2,
  },

  headerBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary, #6B7280)',
    padding: 6,
    borderRadius: 6,
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 150ms',
  },

  desc: {
    margin: 0,
    padding: '10px 14px',
    fontSize: 14,
    color: 'var(--color-text-gray-400, #666)',
    lineHeight: 1.5,
    borderBottom: '1px solid var(--color-divider-subtle, #F0EDE6)',
  },

  section: {
    padding: '10px 14px',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-primary, var(--elab-navy))',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },

  stepsList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-text-gray-600, #444)',
  },

  stepNum: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'var(--color-primary-light, #E8EEF6)',
    color: 'var(--color-primary, var(--elab-navy))',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },

  stepText: {
    flex: 1,
  },

  observe: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-success, #16A34A)',
    fontWeight: 500,
    padding: '8px 12px',
    background: 'var(--color-accent-light, #E8F5E9)',
    borderRadius: 8,
  },

  concept: {
    margin: 0,
    padding: '10px 14px',
    fontSize: 14,
    color: 'var(--color-text-gray-300, #737373)',
    fontStyle: 'italic',
    borderTop: '1px solid var(--color-divider-subtle, #F0EDE6)',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    lineHeight: 1.5,
  },

  unlimBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: '8px 14px 12px',
    padding: '8px 14px',
    border: '1px solid var(--color-primary, var(--elab-navy))',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--color-primary, var(--elab-navy))',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    cursor: 'pointer',
    transition: 'background 150ms, color 150ms',
    width: 'calc(100% - 28px)',
  },
};

export default ExperimentGuide;
