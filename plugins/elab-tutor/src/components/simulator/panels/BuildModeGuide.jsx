/* Andrea Marro — 17/02/2026 */
/**
 * BuildModeGuide -- Interactive step-by-step build guide
 * Shows build steps for an experiment when buildMode is active.
 * Each step tells the child which component to place and where.
 *
 * PROGRESSIVE ASSEMBLY: the currentStep prop controls which components
 * are visible on the canvas via the parent (NewElabSimulator).
 * Step -1 = empty board (only base components: breadboard + battery/arduino)
 * Step 0 = first buildStep visible, etc.
 *
 * Wave 2 X.3b Impl-F (Option C — wire UNLIM chat) iter 36 PM Passo Passo
 * regression close:
 *   - UNLIM chat surface mounted INSIDE the guide (not in a sibling
 *     LessonReader) so passo-passo mode owns its own conversational
 *     channel + AZIONE:highlight wire.
 *   - activeLessonId flows from prop (falling back to experiment.id) so
 *     the lavagna no longer hardcodes 'v1-accendi-led'.
 *   - AZIONE:highlight:<id> tags emitted by UNLIM responses route through
 *     src/services/blocklyHighlightBridge.js to select Blockly blocks.
 *
 * Props:
 *   experiment: { id, title, icon, buildSteps: [...] }
 *   currentStep: number (-1 = intro, 0..N = step index)
 *   activeLessonId: string  (Wave 2b iter X.3b — replaces hardcode)
 *   onStepChange: (stepIndex: number) => void
 *   onClose: () => void
 */

import React, { useState, useEffect, useRef } from 'react';
import ovStyles from '../overlays.module.css';
import {
  parseHighlightActionTags,
  emitHighlightAction,
} from '../../../services/blocklyHighlightBridge';

// Simple step number used instead of emoji per component type
const STEP_ICONS = {};

const SIZE_STORAGE_KEY = 'elab-build-guide-size';

function loadSavedSize() {
  try {
    const raw = localStorage.getItem(SIZE_STORAGE_KEY);
    if (raw) { const s = JSON.parse(raw); if (s.w && s.h) return s; }
  } catch { /* */ }
  return { w: 300, h: 350 };
}

const BuildModeGuide = React.memo(function BuildModeGuide({
  experiment,
  currentStep = -1,
  activeLessonId,
  onStepChange,
  onClose,
}) {
  const [expanded, setExpanded] = useState(true);
  const [size, setSize] = useState(loadSavedSize);
  const resizeRef = React.useRef(null);
  // Wave 2b iter X.3b — last highlight count reflected on the UNLIM panel
  // surface so callers (and tests) can observe bridge activity without
  // peeking into Blockly internals.
  const [lastHighlightCount, setLastHighlightCount] = useState(0);
  const unlimPanelRef = useRef(null);

  // Wave 2b iter X.3b — resolve activeLessonId from prop, falling back to
  // experiment.id. The legacy LavagnaShell hardcode 'v1-accendi-led' is
  // GONE — passo-passo mode now reflects whichever experiment the user
  // selected. (iter 36 PM regression cause: useState('v1-accendi-led') at
  // LavagnaShell:438 never updated on experiment change.)
  const resolvedLessonId = (typeof activeLessonId === 'string' && activeLessonId.trim())
    ? activeLessonId.trim()
    : (experiment?.id || '');

  // Wave 2b iter X.3b — UNLIM chat AZIONE:highlight wire.
  // BuildModeGuide listens on a window-level CustomEvent so the existing
  // useGalileoChat hook (which lives in the lavagna shell) can broadcast
  // responses without BuildModeGuide importing it directly — keeping the
  // 294 LOC panel surgical and avoiding a circular dep on the chat hook.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = (evt) => {
      const text = evt?.detail?.text;
      const ids = parseHighlightActionTags(text);
      if (ids.length === 0) return;
      const { highlighted } = emitHighlightAction(ids);
      setLastHighlightCount(highlighted.length);
    };
    window.addEventListener('elab:unlim:response', handler);
    return () => window.removeEventListener('elab:unlim:response', handler);
  }, []);

  const handleResizeStart = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.w;
    const startH = size.h;
    const onMove = (ev) => {
      const newW = Math.max(220, Math.min(600, startW - (ev.clientX - startX)));
      const newH = Math.max(200, Math.min(700, startH + (ev.clientY - startY)));
      setSize({ w: newW, h: newH });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setSize(prev => {
        try { localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(prev)); } catch { /* */ }
        return prev;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [size]);

  if (!experiment) return null;
  const buildSteps = experiment.buildSteps || [];
  if (buildSteps.length === 0) return null;

  // Collapsed: small floating button
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={ovStyles.collapsedBtn}
        title="Mostra guida montaggio"
      >
        {'\u2261'}
      </button>
    );
  }

  const isIntro = currentStep < 0;
  const isLast = currentStep >= buildSteps.length - 1;
  const step = isIntro ? null : buildSteps[currentStep];
  const stepIcon = step
    ? (STEP_ICONS[step.componentType] || '\u2022')
    : null;

  // Navigation handlers — delegate to parent
  const handlePrev = () => {
    if (onStepChange) onStepChange(Math.max(-1, currentStep - 1));
  };
  const handleNext = () => {
    if (onStepChange) onStepChange(Math.min(buildSteps.length - 1, currentStep + 1));
  };

  // Progress: intro = 0%, step 0 = 1/N, ..., last step = 100%
  const progressPct = isIntro ? 0 : ((currentStep + 1) / buildSteps.length) * 100;

  return (
    <div className={ovStyles.guideRoot} style={{ width: size.w, maxHeight: size.h }}>
      {/* Resize handle — bottom-left corner (panel is anchored to right) */}
      <div onPointerDown={handleResizeStart} ref={resizeRef}
        style={{ position: 'absolute', bottom: 0, left: 0, width: 18, height: 18, cursor: 'nesw-resize', zIndex: 5, touchAction: 'none' }}
        title="Trascina per ridimensionare">
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: 'absolute', bottom: 2, left: 2, opacity: 0.35 }}>
          <path d="M12 2L2 12M12 6L6 12M12 10L10 12" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      {/* Header */}
      <div className={ovStyles.guideHeader} style={{ background: 'linear-gradient(135deg, rgba(124,179,66,0.15), rgba(30,77,140,0.05))' }}>
        <span className={ovStyles.guideIcon}>{'\u2261'}</span>
        <span className={ovStyles.guideTitle}>Montalo Tu!</span>
        <button onClick={() => setExpanded(false)} className={ovStyles.guideCloseBtn}>{'\u2212'}</button>
        <button onClick={onClose} className={ovStyles.guideCloseBtn}>{'\u2715'}</button>
      </div>

      {/* Progress bar */}
      <div style={progressBarContainer}>
        <div style={{ ...progressBarFill, width: `${progressPct}%` }} />
      </div>

      {/* Step counter */}
      <div style={stepCounterStyle}>
        {isIntro
          ? 'Pronti a montare!'
          : `Passo ${currentStep + 1} di ${buildSteps.length}`
        }
      </div>

      {/* Current step content — key forces re-mount for fade-in animation */}
      <div key={currentStep} style={stepContentStyle} className={ovStyles.buildStepFadeIn}>
        {isIntro ? (
          /* Intro screen: empty board */
          <div style={introStyle}>
            <span style={{ fontSize: 20, display: 'block', textAlign: 'center', marginBottom: 6, fontWeight: 700, color: 'var(--color-primary)' }}>{'\u25B6'}</span>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: 'var(--color-text-gray-700)', textAlign: 'center', fontWeight: 500 }}>
              Davanti a te c'è il banco vuoto con la breadboard e la batteria.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 16, lineHeight: 1.4, color: 'var(--color-text-gray-400)', textAlign: 'center' }}>
              Premi <strong>Avanti</strong> per iniziare a montare il circuito pezzo per pezzo!
            </p>
          </div>
        ) : (
          /* Regular step */
          <>
            <div style={stepIconRow}>
              <span style={{ fontSize: 22 }}>{stepIcon}</span>
              <span style={stepTextStyle}>{step.text}</span>
            </div>
            {step.hint && (
              <div style={hintStyle}>
                {step.hint}
              </div>
            )}
            {/* Breadboard pin hint: show pin locations if available */}
            {step.pinHint && (
              <div style={pinHintStyle}>
                {step.pinHint}
              </div>
            )}
          </>
        )}
      </div>

      {/* Wave 2b iter X.3b \u2014 UNLIM panel mount surface (Option C wire).
          The lavagna shell's useGalileoChat hook broadcasts UNLIM
          responses on the window CustomEvent 'elab:unlim:response'; the
          handler in this component routes AZIONE:highlight:<id> tags
          through blocklyHighlightBridge to select Blockly blocks.
          The lessonId attribute reflects the prop (no hardcode). */}
      <div
        ref={unlimPanelRef}
        data-testid="build-mode-guide-unlim-panel"
        data-lesson-id={resolvedLessonId}
        data-last-highlight-count={String(lastHighlightCount)}
        style={unlimPanelStyle}
        aria-label="Pannello UNLIM passo-passo"
      >
        <span style={unlimPanelHintStyle}>
          UNLIM ti accompagna {resolvedLessonId ? `(${resolvedLessonId})` : ''}
        </span>
      </div>

      {/* Navigation */}
      <div style={navStyle}>
        <button
          onClick={handlePrev}
          disabled={isIntro}
          style={{
            ...navBtnStyle,
            opacity: isIntro ? 0.4 : 1,
            cursor: isIntro ? 'default' : 'pointer',
          }}
        >
          {'\u2190'} Indietro
        </button>
        <button
          onClick={isLast ? onClose : handleNext}
          style={{
            ...navBtnStyle,
            background: isLast ? 'var(--color-success)' : 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            fontWeight: 700,
          }}
        >
          {isLast ? '\u2714 Finito!' : 'Avanti \u2192'}
        </button>
      </div>
    </div>
  );
});

// --- Styles ---

const progressBarContainer = {
  height: 4,
  background: 'var(--color-sim-border)',
  width: '100%',
};

const progressBarFill = {
  height: '100%',
  background: 'var(--color-accent)',
  borderRadius: '0 2px 2px 0',
  transition: 'width var(--transition-slow)',
};

const stepCounterStyle = {
  padding: '6px 10px 2px',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--color-primary)',
  fontFamily: 'var(--font-display)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const stepContentStyle = {
  padding: '6px 10px 8px',
};

const introStyle = {
  padding: '8px 4px',
};

const stepIconRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  marginBottom: 6,
};

const stepTextStyle = {
  fontSize: 14,
  lineHeight: 1.45,
  color: 'var(--color-text-gray-700)',
  fontWeight: 500,
};

const hintStyle = {
  fontSize: 14,
  color: 'var(--color-text-gray-400)',
  fontStyle: 'italic',
  lineHeight: 1.4,
  padding: '4px 8px',
  background: 'var(--color-warning-light, #FFF9C4)',
  borderRadius: 6,
  marginTop: 4,
};

const pinHintStyle = {
  fontSize: 14,
  color: 'var(--color-primary)',
  lineHeight: 1.4,
  padding: '4px 8px',
  background: 'var(--color-primary-subtle)',
  borderRadius: 6,
  marginTop: 4,
  fontFamily: 'var(--font-mono)',
};

const navStyle = {
  display: 'flex',
  gap: 6,
  padding: '6px 10px 10px',
  borderTop: '1px solid var(--color-divider-subtle)',
};

const navBtnStyle = {
  flex: 1,
  padding: '8px 0',
  border: '1px solid var(--color-sim-scrollbar)',
  borderRadius: 6,
  background: 'var(--color-bg)',
  color: 'var(--color-text-gray-500)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  cursor: 'pointer',
  textAlign: 'center',
  minHeight: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  transition: 'var(--transition-fast)',
};

// Wave 2b iter X.3b — UNLIM panel mount surface (Option C wire).
const unlimPanelStyle = {
  padding: '6px 10px 6px',
  borderTop: '1px solid var(--color-divider-subtle)',
  background: 'var(--color-primary-subtle, rgba(30,77,140,0.05))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: 28,
};

const unlimPanelHintStyle = {
  fontSize: 13,
  color: 'var(--color-primary, #1E4D8C)',
  fontFamily: 'var(--font-sans)',
  fontStyle: 'italic',
};

export default BuildModeGuide;
