/**
 * ELAB Simulator — ComponentDrawer
 * Pannello bottom-anchored per modalità "Passo Passo" (guided) e "Libero" (sandbox).
 * - Guided: mostra step corrente con navigazione Avanti/Indietro
 * - Sandbox: griglia di componenti draggabili filtrati per volume
 * Design: Apple-style, ELAB palette (Oswald headers, Open Sans body).
 * © Andrea Marro — 20/02/2026
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { getComponentsByVolume, getComponent } from '../components/registry';

const STEP_ICONS = {
  resistor: 'R',
  led: 'LED',
  'push-button': 'SW',
  'rgb-led': 'RGB',
  'buzzer-piezo': 'BZ',
  capacitor: 'C',
  'motor-dc': 'M',
  potentiometer: 'POT',
  'photo-resistor': 'LDR',
  phototransistor: 'PT',
  'reed-switch': 'REED',
  'mosfet-n': 'MOS',
  diode: 'D',
  servo: 'SV',
  lcd16x2: 'LCD',
  wire: 'Filo',
  battery9v: '9V',
};

/* ─── Short labels for sandbox chips (full names, no truncation) ─── */
const SHORT_LABELS = {
  battery9v: 'Batteria',
  'nano-r4': 'Arduino',
  resistor: 'Resistore',
  capacitor: 'Condensatore',
  potentiometer: 'Potenziometro',
  diode: 'Diodo',
  'mosfet-n': 'MOSFET',
  led: 'LED',
  'rgb-led': 'LED RGB',
  'buzzer-piezo': 'Cicalino',
  'motor-dc': 'Motore DC',
  servo: 'Servo',
  lcd16x2: 'LCD 16x2',
  'push-button': 'Pulsante',
  'reed-switch': 'Reed Switch',
  'photo-resistor': 'Fotoresist.',
  phototransistor: 'Fototransi.',
  multimeter: 'Multimetro',
  wire: 'Filo',
};

/* ─── SVG sizes for each component type (viewBox crop for mini preview) ─── */
const SVG_PREVIEW_SIZE = {
  battery9v: { w: 60, h: 80, vb: '-30 -40 60 80' },
  resistor: { w: 50, h: 20, vb: '-25 -10 50 20' },
  led: { w: 30, h: 40, vb: '-15 -20 30 40' },
  'rgb-led': { w: 30, h: 40, vb: '-15 -20 30 40' },
  capacitor: { w: 30, h: 40, vb: '-15 -20 30 40' },
  'push-button': { w: 40, h: 40, vb: '-20 -20 40 40' },
  potentiometer: { w: 50, h: 50, vb: '-25 -25 50 50' },
  diode: { w: 40, h: 20, vb: '-20 -10 40 20' },
  'buzzer-piezo': { w: 50, h: 50, vb: '-25 -25 50 50' },
  'motor-dc': { w: 50, h: 50, vb: '-25 -25 50 50' },
  servo: { w: 60, h: 40, vb: '-30 -20 60 40' },
  lcd16x2: { w: 80, h: 40, vb: '-40 -20 80 40' },
  'photo-resistor': { w: 30, h: 40, vb: '-15 -20 30 40' },
  phototransistor: { w: 30, h: 40, vb: '-15 -20 30 40' },
  'reed-switch': { w: 50, h: 20, vb: '-25 -10 50 20' },
  'mosfet-n': { w: 40, h: 40, vb: '-20 -20 40 40' },
  multimeter: { w: 60, h: 60, vb: '-30 -30 60 60' },
};

/* ─── Draggable chip for sandbox mode — uses REAL SVG component ─── */
const DraggableChip = React.memo(function DraggableChip({ type, label, icon }) {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const shortLabel = SHORT_LABELS[type] || label;

  const registered = useMemo(() => getComponent(type), [type]);
  const svgSize = SVG_PREVIEW_SIZE[type];

  const handleDragStart = useCallback((e) => {
    const payload = JSON.stringify({ type });
    e.dataTransfer.setData('application/elab-component', payload);
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'copy';
    window.__elabDragType = type;
    setDragging(true);
  }, [type]);

  // Tap-to-place for iPad: tap selects component, then tap canvas to place
  const handleTapSelect = useCallback(() => {
    window.__elabPendingComponent = type;
    window.dispatchEvent(new CustomEvent('elab-component-selected', { detail: { type } }));
  }, [type]);

  const SvgComp = registered ? registered.component : null;

  return (
    <div
      className="elab-sandbox-chip"
      draggable="true"
      role="button"
      tabIndex={0}
      onDragStart={handleDragStart}
      onDragEnd={() => { window.__elabDragType = null; setDragging(false); }}
      onClick={handleTapSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTapSelect(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        ...styles.sandboxChip,
        opacity: dragging ? 0.35 : 1,
        background: hovered && !dragging ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
        borderColor: hovered && !dragging ? 'var(--color-primary)' : 'var(--color-border)',
        transform: hovered && !dragging ? 'translateY(-1px)' : 'none',
        boxShadow: hovered && !dragging ? 'var(--shadow-sm)' : 'none',
      }}
      aria-label={`Aggiungi ${label} al circuito`}
      title={`Trascina "${label}" sul canvas`}
    >
      {SvgComp && svgSize ? (
        <svg
          width="24"
          height="24"
          viewBox={svgSize.vb}
          style={{ flexShrink: 0, pointerEvents: 'none' }}
        >
          <SvgComp
            id={`__chip_${type}`}
            state={registered.defaultState}
            value={registered.defaultState?.value}
            color={registered.defaultState?.color}
            selected={false}
          />
        </svg>
      ) : (
        <span style={styles.chipIcon}>{icon || '\u{2022}'}</span>
      )}
      <span style={styles.chipLabel}>{shortLabel}</span>
    </div>
  );
});

/* ─── Main ComponentDrawer ─── */
const ComponentDrawer = ({
  mode = 'guided',       // 'guided' | 'sandbox'
  experiment = null,
  currentStep = -1,
  onStepChange,
  volumeNumber = 1,
  onStartScratchPhase,   // S86: callback to open Blocchi tab + load XML
  onCompileAndPlay,      // S86: callback for final compile+play
  nextExperiment = null,
  onLoadNextExperiment,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // S89: Drag state for guided mode — right-side default, freely draggable
  const [dragPos, setDragPos] = useState(null); // null = default position (right side)
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false); // S89: true if pointer moved during drag (suppress click-to-collapse)
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  // iter 45 fix Andrea video 06/05/2026 "rendilo allungabile e allargabile":
  // size state per pannello guided. Persiste localStorage. Default null usa
  // clamp() default da floatingCard. Min 240×260, Max 600×720.
  const SIZE_STORAGE_KEY = 'elab-component-drawer-guided-size';
  const [size, setSize] = useState(() => {
    try {
      const raw = localStorage.getItem(SIZE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.w >= 240 && parsed?.w <= 600 && parsed?.h >= 260 && parsed?.h <= 720) {
          return parsed;
        }
      }
    } catch { /* localStorage unavailable */ }
    return null;
  });
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ dir: 'se', x: 0, y: 0, w: 0, h: 0, left: 0, top: 0, parentW: 800, parentH: 600 });

  const handleResizeStart = useCallback((dir, e) => {
    if (mode !== 'guided' || !panelRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    const rect = panelRef.current.getBoundingClientRect();
    const parentRect = panelRef.current.offsetParent?.getBoundingClientRect() || { left: 0, top: 0, width: 800, height: 600 };
    resizeStartRef.current = {
      dir,
      x: e.clientX, y: e.clientY,
      w: rect.width, h: rect.height,
      left: rect.left - parentRect.left,
      top: rect.top - parentRect.top,
      parentW: parentRect.width,
      parentH: parentRect.height,
    };
    if (e.pointerId !== undefined) {
      e.target.setPointerCapture?.(e.pointerId);
    }
  }, [mode]);

  const handleResizeMove = useCallback((e) => {
    if (!isResizingRef.current) return;
    const state = resizeStartRef.current;
    const dx = e.clientX - state.x;
    const dy = e.clientY - state.y;
    const minW = 240;
    const minH = 260;
    const maxW = Math.min(720, Math.max(minW, state.parentW - 16));
    const maxH = Math.min(760, Math.max(minH, state.parentH - 16));
    let newW = state.w;
    let newH = state.h;
    let newLeft = state.left;
    let newTop = state.top;

    if (state.dir.includes('e')) newW = Math.max(minW, Math.min(maxW, state.w + dx));
    if (state.dir.includes('s')) newH = Math.max(minH, Math.min(maxH, state.h + dy));
    if (state.dir.includes('w')) {
      newW = Math.max(minW, Math.min(maxW, state.w - dx));
      newLeft = state.left + (state.w - newW);
    }
    if (state.dir.includes('n')) {
      newH = Math.max(minH, Math.min(maxH, state.h - dy));
      newTop = state.top + (state.h - newH);
    }

    newLeft = Math.max(0, Math.min(newLeft, state.parentW - newW));
    newTop = Math.max(0, Math.min(newTop, state.parentH - newH));
    setDragPos({ x: newLeft, y: newTop });
    setSize({ w: newW, h: newH });
  }, []);

  const handleResizeEnd = useCallback((e) => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    if (e?.pointerId !== undefined && e.target?.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    }
    setSize((prev) => {
      if (prev) {
        try { localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(prev)); } catch { /* noop */ }
      }
      return prev;
    });
  }, []);

  // S89: Pointer handlers for dragging the panel header
  const handlePanelDragStart = useCallback((e) => {
    if (mode !== 'guided' || !panelRef.current) return;
    // Only drag from header area (not buttons)
    if (e.target.closest('button')) return;
    e.preventDefault();
    isDraggingRef.current = true;
    didDragRef.current = false;
    const rect = panelRef.current.getBoundingClientRect();
    const parentRect = panelRef.current.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };
    dragOffsetRef.current = {
      x: e.clientX - rect.left + parentRect.left,
      y: e.clientY - rect.top + parentRect.top,
    };
    // Capture pointer for smooth dragging
    if (e.pointerId !== undefined) {
      e.target.setPointerCapture(e.pointerId);
    }
  }, [mode]);

  const handlePanelDragMove = useCallback((e) => {
    if (!isDraggingRef.current || !panelRef.current) return;
    e.preventDefault();
    didDragRef.current = true;
    const parentRect = panelRef.current.offsetParent?.getBoundingClientRect() || { left: 0, top: 0, width: 800, height: 600 };
    const panelW = panelRef.current.offsetWidth;
    const panelH = panelRef.current.offsetHeight;
    // Clamp within parent bounds
    const x = Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, parentRect.width - panelW));
    const y = Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, parentRect.height - panelH));
    setDragPos({ x, y });
  }, []);

  const handlePanelDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    // didDragRef stays true until next pointerDown — prevents onClick from collapsing after drag
  }, []);

  // S89: Reset drag position when experiment changes (new experiment = default position)
  useEffect(() => {
    setDragPos(null);
  }, [experiment?.id]);

  // S84: Auto-collapse when Passo Passo completes — panel covers the finished circuit
  const isCompleteCheck = mode === 'guided' && experiment && currentStep >= (experiment.buildSteps || []).length + (experiment.scratchSteps || []).length;
  useEffect(() => {
    if (isCompleteCheck && !nextExperiment?.id) setCollapsed(true);
  }, [isCompleteCheck, nextExperiment?.id]);

  /* Sandbox: volume-filtered component list */
  const volumeComponents = useMemo(() => {
    if (mode !== 'sandbox') return [];
    return getComponentsByVolume(volumeNumber).filter(
      c => c.category !== 'wire' && c.type !== 'breadboard-half' && c.type !== 'breadboard-full'
    );
  }, [mode, volumeNumber]);

  if (!experiment) return null;

  const buildSteps = experiment.buildSteps || [];
  const scratchSteps = experiment.scratchSteps || [];
  const hasScratch = scratchSteps.length > 0;

  // Merge hardware + code steps into single sequence
  const allSteps = useMemo(() => [
    ...buildSteps.map(s => ({ ...s, _type: 'hardware' })),
    ...scratchSteps.map(s => ({ ...s, _type: 'scratch' })),
  ], [buildSteps, scratchSteps]);

  const isIntro = currentStep < 0;
  const isComplete = currentStep >= allSteps.length;
  const isLast = !isComplete && currentStep >= allSteps.length - 1;
  const step = isIntro || isComplete ? null : allSteps[currentStep];
  const isScratchStep = step?._type === 'scratch';

  // S86: Phase detection for split HW/Code display
  const isHWPhase = !isIntro && !isComplete && !isScratchStep;
  const isTransition = !isIntro && !isComplete && currentStep === buildSteps.length && isScratchStep && hasScratch;
  const hwDone = currentStep >= buildSteps.length;

  // S86: Scratch step index (0-based within scratch phase)
  const scratchIndex = isScratchStep ? currentStep - buildSteps.length : -1;

  // S86: Normalize scratch step fields — some use label/description, others use text/hint
  const scratchStepText = isScratchStep
    ? (step.text || step.label || '')
    : '';
  const scratchStepHint = isScratchStep
    ? (step.hint || step.description || '')
    : '';
  const scratchStepExplanation = isScratchStep
    ? (step.explanation || '')
    : '';

  const stepIcon = step
    ? isScratchStep ? '\u{1F9E9}'
    : (step.componentType ? (STEP_ICONS[step.componentType] || '\u{1F9E9}') : STEP_ICONS.wire)
    : null;

  const progressPct = allSteps.length === 0 ? 0
    : isIntro ? 0
    : isComplete ? 100
    : ((currentStep + 1) / allSteps.length) * 100;

  const handlePrev = () => {
    if (onStepChange) onStepChange(Math.max(-1, currentStep - 1));
  };
  const handleNext = () => {
    if (onStepChange) onStepChange(Math.min(allSteps.length - 1, currentStep + 1));
  };
  // S93: Start code phase — opens chosen editor mode and advances to first scratch step
  const handleStartCode = useCallback((chosenMode) => {
    onStartScratchPhase?.(chosenMode);
    if (onStepChange) onStepChange(buildSteps.length);
  }, [onStartScratchPhase, onStepChange, buildSteps.length]);

  /* Collapsed state */
  if (collapsed) {
    if (mode === 'guided') {
      // S89: Floating badge — top-right pill showing current step (draggable position remembered)
      const badgeStyle = dragPos
        ? { ...styles.collapsedBadge, top: dragPos.y, left: dragPos.x, right: 'auto' }
        : styles.collapsedBadge;
      return (
        <button style={badgeStyle} onClick={() => setCollapsed(false)} aria-label={`Espandi guida passo passo — ${isIntro ? 'Inizia' : isComplete ? 'Fatto!' : `passo ${currentStep + 1} di ${allSteps.length}`}`}>
          <span style={{ fontSize: 16 }} aria-hidden="true">{'\u{1F527}'}</span>
          <span style={styles.collapsedBadgeText}>
            {isIntro ? 'Inizia' : isComplete ? 'Fatto!' : `${currentStep + 1}/${allSteps.length}`}
          </span>
          <span style={{ fontSize: 16, color: 'var(--color-text-gray-300, #737373)' }} aria-hidden="true">{'\u{25BC}'}</span>
        </button>
      );
    }
    // Sandbox: bottom bar (unchanged)
    return (
      <button style={styles.collapsedBar} onClick={() => setCollapsed(false)} aria-label="Espandi pannello componenti">
        <div style={styles.dragHandle} aria-hidden="true" />
        <span style={styles.collapsedTitle}>
          {'\u{1F9E9} Componenti'}
        </span>
      </button>
    );
  }

  // S89: Guided mode uses floating card (right side, draggable), Sandbox uses bottom drawer
  const guidedPosStyle = dragPos
    ? { top: dragPos.y, left: dragPos.x, right: 'auto' }
    : {}; // default from styles.floatingCard (right: 12, top: 12)
  // iter 45 fix Andrea: applica size se settata (override clamp default).
  const guidedSizeStyle = size
    ? { width: size.w, maxWidth: size.w, height: size.h, maxHeight: size.h }
    : {};
  const containerStyle = mode === 'guided'
    ? { ...styles.floatingCard, ...guidedPosStyle, ...guidedSizeStyle }
    : styles.drawer;

  return (
    <div ref={panelRef} style={containerStyle} role="region" aria-label={mode === 'guided' ? 'Guida passo passo' : 'Pannello componenti'}>
      {/* Header — draggable in guided mode */}
      <div
        style={mode === 'guided' ? styles.floatingHeader : styles.header}
        role="button"
        tabIndex={0}
        aria-label={mode === 'guided' ? 'Riduci guida passo passo' : 'Riduci pannello componenti'}
        onClick={() => {
          // S89: Suppress collapse if the user just finished dragging
          if (didDragRef.current) { didDragRef.current = false; return; }
          setCollapsed(true);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(true); } }}
        onPointerDown={mode === 'guided' ? handlePanelDragStart : undefined}
        onPointerMove={mode === 'guided' ? handlePanelDragMove : undefined}
        onPointerUp={mode === 'guided' ? handlePanelDragEnd : undefined}
        onPointerCancel={mode === 'guided' ? handlePanelDragEnd : undefined}
      >
          {mode === 'guided' && <div style={styles.dragHandle} />}
        {mode !== 'guided' && <div style={styles.dragHandle} />}
        <span style={mode === 'guided' ? styles.floatingHeaderTitle : styles.headerTitle}>
          {mode === 'guided' ? 'Passo Passo' : '\u{1F9E9} Percorso'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
          style={styles.minimizeBtn}
          title="Riduci"
        >
          {'\u{2212}'}
        </button>
      </div>

      {/* === GUIDED MODE === */}
      {mode === 'guided' && (
        <>
          {/* Progress bar */}
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
          </div>

          <div style={styles.guidedBody}>
            {/* S86: Phase-aware step counter */}
            <div style={styles.stepCounter} aria-live="polite" aria-atomic="true">
              {isIntro
                ? 'Pronti a montare!'
                : isComplete
                ? `Completato!`
                : isScratchStep
                ? `Codice ${scratchIndex + 1} di ${scratchSteps.length}`
                : `Passo ${currentStep + 1} di ${buildSteps.length}`
              }
            </div>

            {/* Step content */}
            <div style={styles.stepContent}>
              {isIntro ? (
                <div style={styles.introText}>
                  <span>Il banco parte pulito: vedete solo breadboard e batteria. Premete <strong>Avanti</strong>: a ogni passo ELAB aggiunge il pezzo giusto sul circuito.</span>
                </div>
              ) : isComplete ? (
                /* S86: Completion card with compile+play button */
                <div style={styles.completionCard}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.completionTitle}>
                      {hasScratch ? 'Circuito e codice pronti!' : 'Circuito completato!'}
                    </div>
                    <div style={styles.completionSubtitle}>
                      {hasScratch
                        ? 'Premete Compila e Provate per vedere il risultato!'
                        : 'Premete \u25B6 Avvia per simulare il circuito.'
                      }
                    </div>
                  </div>
                  {hasScratch && onCompileAndPlay && (
                    <button onClick={onCompileAndPlay} style={styles.compilePlayBtn}>
                      {'\u25B6'} Compila e Prova!
                    </button>
                  )}
                  {nextExperiment?.id && (
                    <div style={styles.cliffhangerBox} data-testid="component-drawer-cliffhanger">
                      <div style={styles.cliffhangerTitle}>Prossimo esperimento: {nextExperiment.title || nextExperiment.id}</div>
                      {nextExperiment.preview && (
                        <div style={styles.cliffhangerPreview}>{nextExperiment.preview}</div>
                      )}
                      <button
                        type="button"
                        style={styles.cliffhangerBtn}
                        data-testid="component-drawer-cliffhanger-cta"
                        onClick={() => onLoadNextExperiment?.(nextExperiment.id)}
                      >
                        Apri prossimo esperimento
                      </button>
                    </div>
                  )}
                </div>
              ) : isScratchStep ? (
                /* S86: Dedicated Scratch step card with explanation */
                <div style={styles.scratchStepCard}>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{'\u{1F9E9}'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={styles.stepText}>{scratchStepText}</div>
                      {scratchStepHint && (
                        <div style={styles.scratchHint}>
                          {scratchStepHint}
                        </div>
                      )}
                      {scratchStepExplanation && (
                        <div style={styles.scratchExplanation}>
                          {scratchStepExplanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : step ? (
                /* Hardware step (unchanged logic) */
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                  {step.componentType ? (
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <DraggableChip
                        type={step.componentType}
                        label={SHORT_LABELS[step.componentType] || step.componentType}
                        icon={STEP_ICONS[step.componentType] || '\u{1F9E9}'}
                      />
                      <span style={{ fontSize: 16, color: 'var(--color-text-gray-400, #666)', fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '0' }}>si monta</span>
                    </div>
                  ) : (
                    <span style={styles.stepBadge}>{stepIcon}</span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={styles.stepText}>{step.text}</div>
                    {step.hint && (
                      <div style={styles.hint}>
                        {step.hint}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* S86: Navigation — handles HW→Scratch transition */}
            <div style={styles.navRow}>
              <button
                onClick={handlePrev}
                disabled={isIntro}
                style={{
                  ...styles.navBtn,
                  opacity: isIntro ? 0.4 : 1,
                  cursor: isIntro ? 'default' : 'pointer',
                }}
              >
                {'\u2190'} Indietro
              </button>
              {!isComplete && (
                /* S93: At last HW step with scratch → show choice: Blocchi or Codice */
                (currentStep === buildSteps.length - 1 && hasScratch) ? (
                  <div style={{ display: 'flex', gap: 'var(--space-1-5)', flex: 1 }}>
                    <button
                      onClick={() => handleStartCode('scratch')}
                      style={{
                        ...styles.navBtn,
                        flex: 1,
                        background: 'var(--color-tab-scratch, #E67E22)',
                        color: 'var(--color-text-inverse)',
                        fontWeight: 700,
                        borderColor: 'var(--color-tab-scratch, #E67E22)',
                      }}
                    >
                      {'\u{1F9E9}'} Blocchi
                    </button>
                    <button
                      onClick={() => handleStartCode('arduino')}
                      style={{
                        ...styles.navBtn,
                        flex: 1,
                        background: 'var(--color-accent, var(--elab-lime))',
                        color: 'var(--color-text-inverse)',
                        fontWeight: 700,
                        borderColor: 'var(--color-accent, var(--elab-lime))',
                      }}
                    >
                      {'</>'} Codice
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={isLast ? () => onStepChange && onStepChange(allSteps.length) : handleNext}
                    style={{
                      ...styles.navBtn,
                      background: isLast ? 'var(--color-success)' : 'var(--color-primary)',
                      color: 'var(--color-text-inverse)',
                      fontWeight: 700,
                      borderColor: isLast ? 'var(--color-success)' : 'var(--color-primary)',
                    }}
                  >
                    {isLast ? 'Finito' : 'Avanti \u{2192}'}
                  </button>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* === SANDBOX MODE === */}
      {mode === 'sandbox' && (
        <div style={styles.sandboxBody}>
          <div style={styles.sandboxChipStrip}>
            {volumeComponents.map(comp => (
              <DraggableChip
                key={comp.type}
                type={comp.type}
                label={comp.label}
                icon={comp.icon}
              />
            ))}
          </div>
        </div>
      )}

      {/* iter 45 fix Andrea video 06/05/2026: resize handle visibile bottom-right
           per modalità guided (Passo Passo). Persiste size in localStorage. */}
      {mode === 'guided' && (
        <div
          role="separator"
          aria-label="Ridimensiona pannello passo passo"
          aria-orientation="diagonal"
          onPointerDown={(e) => handleResizeStart('se', e)}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 24,
            height: 24,
            cursor: 'nwse-resize',
            zIndex: 31,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 4,
            touchAction: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M11 1 L1 11 M11 5 L5 11 M11 9 L9 11"
                  stroke="var(--color-border-hover, #9CA3AF)"
                  strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {mode === 'guided' && (
        <>
          {[
            ['n', { top: 0, left: 0, right: 0, height: 12, cursor: 'ns-resize' }],
            ['s', { bottom: 0, left: 0, right: 0, height: 12, cursor: 'ns-resize' }],
            ['w', { left: 0, top: 0, bottom: 0, width: 12, cursor: 'ew-resize' }],
            ['e', { right: 0, top: 0, bottom: 0, width: 12, cursor: 'ew-resize' }],
            ['nw', { top: 0, left: 0, width: 24, height: 24, cursor: 'nwse-resize' }],
            ['ne', { top: 0, right: 0, width: 24, height: 24, cursor: 'nesw-resize' }],
            ['sw', { bottom: 0, left: 0, width: 24, height: 24, cursor: 'nesw-resize' }],
          ].map(([dir, edgeStyle]) => (
            <div
              key={dir}
              role="separator"
              aria-label={`Ridimensiona pannello passo passo ${dir}`}
              onPointerDown={(e) => handleResizeStart(dir, e)}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={handleResizeEnd}
              style={{
                position: 'absolute',
                zIndex: 30,
                touchAction: 'none',
                ...edgeStyle,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

/* ─── Styles ─── */
const styles = {
  /* S89: Floating card for guided mode — RIGHT-side overlay, draggable */
  floatingCard: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 'clamp(320px, 34vw, 460px)',
    maxWidth: 'calc(100% - 24px)', // Safety: prevent overflow on narrow viewports (iPad slide-over)
    background: 'var(--color-bg, #FFFFFF)',
    borderRadius: 'var(--radius-lg, 14px)',
    boxShadow: 'var(--shadow-lg, 0 10px 20px rgba(0,0,0,0.07)), 0 0 0 1px var(--color-border, #E5E5EA)',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'clamp(320px, 58vh, 560px)',
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    overflow: 'hidden',
    touchAction: 'none', // S89: prevent scroll interference when dragging
    userSelect: 'none',
  },

  floatingHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 12px 8px',
    cursor: 'grab',  // S89: visual cue that header is draggable
    borderBottom: '1px solid var(--color-border, #E5E5EA)',
    background: 'linear-gradient(135deg, rgba(124, 179, 66, 0.06), rgba(30, 77, 140, 0.03))',
    borderRadius: '14px 14px 0 0',
    gap: 8,
    flexShrink: 0,
    touchAction: 'none',
  },

  floatingHeaderTitle: {
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
    color: 'var(--color-primary, var(--elab-navy))',
    textTransform: 'uppercase',
    letterSpacing: 0,
    flex: 1,
  },

  minimizeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 18,
    color: 'var(--color-text-gray-300, #737373)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-xs, 4px)',
    minWidth: 'var(--touch-min, 56px)',
    minHeight: 'var(--touch-min, 56px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },

  /* S89: Collapsed floating badge — small pill top-RIGHT (matches panel position) */
  collapsedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'var(--color-bg, #FFFFFF)',
    borderRadius: 'var(--radius-full, 9999px)',
    boxShadow: 'var(--shadow-md, 0 4px 8px rgba(0,0,0,0.06)), 0 0 0 1px var(--color-border, #E5E5EA)',
    zIndex: 30,
    cursor: 'pointer',
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    minHeight: 'var(--touch-min, 56px)',
  },

  collapsedBadgeText: {
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    color: 'var(--color-primary, var(--elab-navy))',
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
  },

  /* Bottom drawer for sandbox mode (unchanged) */
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--color-bg, #FFFFFF)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 200,
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
  },

  collapsedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    background: 'var(--color-bg, #FFFFFF)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: 4,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px 6px',
    cursor: 'pointer',
    position: 'relative',
    gap: 8,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    background: 'var(--color-border-hover, #D1D5DB)',
    position: 'absolute',
    top: 4,
    left: '50%',
    transform: 'translateX(-50%)',
  },

  headerTitle: {
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
    color: 'var(--color-text, #1A1A2E)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: 6,
  },

  collapsedTitle: {
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 600,
    color: 'var(--color-text-gray-400, #666)',
  },

  /* Progress */
  progressContainer: {
    height: 3,
    background: 'var(--color-border-hover)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    background: 'var(--color-accent)',
    borderRadius: '0 2px 2px 0',
    transition: 'width var(--transition-slow)',
  },

  /* Guided body — flex column for proper overflow scrolling */
  guidedBody: {
    padding: '8px 16px 12px',
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, // flex child needs this for bounded overflow
  },

  stepCounter: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--color-primary, var(--elab-navy))',
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 6,
    flexShrink: 0, // Don't compress in flex column
  },

  stepContent: {
    marginBottom: 8,
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
  },

  introText: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '16px',
    color: 'var(--color-text, #1A1A2E)',
    lineHeight: 1.5,
  },

  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },

  stepBadge: {
    minWidth: 44,
    minHeight: 32,
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm, 6px)',
    background: 'rgba(30, 77, 140, 0.08)',
    color: 'var(--color-primary, var(--elab-navy))',
    fontSize: '14px',
    fontWeight: 800,
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    letterSpacing: 0,
  },

  stepText: {
    fontSize: '16px',
    lineHeight: 1.5,
    color: 'var(--color-text, #1A1A2E)',
    fontWeight: 500,
  },

  hint: {
    fontSize: '16px',
    color: 'var(--color-text-gray-600, #444)',
    fontStyle: 'normal',
    lineHeight: 1.45,
    padding: '6px 10px',
    background: 'var(--color-warning-light, #FFF9C4)',
    borderRadius: 'var(--radius-sm, 6px)',
    borderLeft: '3px solid var(--color-warning, #F59E0B)',
    marginTop: 6,
  },

  scratchHint: {
    fontSize: '16px',
    color: 'var(--color-primary, var(--elab-navy))',
    fontStyle: 'normal',
    lineHeight: 1.45,
    padding: '6px 10px',
    background: 'var(--color-primary-light)',
    borderRadius: 'var(--radius-sm, 6px)',
    borderLeft: '3px solid var(--color-primary, var(--elab-navy))',
    marginTop: 6,
  },

  /* S86: Scratch step explanation (educational insight) */
  scratchExplanation: {
    fontSize: 'var(--font-size-sm, 16px)',
    color: 'var(--color-text-gray-600, #444)',
    lineHeight: 1.45,
    padding: '4px 8px',
    background: 'var(--color-accent-light, #E8F5E9)',
    borderRadius: 'var(--radius-sm, 6px)',
    borderLeft: '3px solid var(--color-accent, var(--elab-lime))',
    marginTop: 4,
  },

  /* S86: Scratch step card wrapper */
  scratchStepCard: {
    // No extra styling needed — inherits stepContent
  },

  /* S86: Completion card */
  completionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  completionTitle: {
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    color: 'var(--color-success, #16A34A)',
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  completionSubtitle: {
    fontSize: 'var(--font-size-sm, 16px)',
    color: 'var(--color-text-gray-600, #444)',
    lineHeight: 1.45,
    marginTop: 2,
  },
  compilePlayBtn: {
    padding: '8px 16px',
    background: 'var(--color-accent, var(--elab-lime))',
    color: 'var(--color-text-inverse, #fff)',
    border: 'none',
    borderRadius: 'var(--radius-md, 8px)',
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    cursor: 'pointer',
    minHeight: 'var(--touch-min, 56px)',
    minWidth: 'var(--touch-min, 56px)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  cliffhangerBox: {
    flexBasis: '100%',
    marginTop: 8,
    padding: '10px 12px',
    background: 'var(--color-cliffhanger-bg, rgba(74, 122, 37, 0.08))',
    borderLeft: '3px solid var(--color-accent, var(--elab-lime))',
    borderRadius: 'var(--radius-sm, 6px)',
    color: 'var(--color-primary, var(--elab-navy))',
  },
  cliffhangerTitle: {
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    marginBottom: 4,
  },
  cliffhangerPreview: {
    fontSize: 'var(--font-size-sm, 16px)',
    lineHeight: 1.45,
    color: 'var(--color-text-gray-600, #444)',
    marginBottom: 8,
  },
  cliffhangerBtn: {
    minHeight: 'var(--touch-min, 56px)',
    padding: '8px 14px',
    border: 'none',
    borderRadius: 'var(--radius-md, 8px)',
    background: 'var(--color-primary, var(--elab-navy))',
    color: 'var(--color-text-inverse, #fff)',
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    fontSize: 'var(--font-size-sm, 16px)',
    fontWeight: 700,
    cursor: 'pointer',
  },

  /* Navigation */
  navRow: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
  },

  navBtn: {
    flex: 1,
    padding: '8px 0',
    border: '1px solid var(--color-border-hover, #D1D5DB)',
    borderRadius: 'var(--radius-md, 8px)',
    background: 'var(--color-bg, #fff)',
    color: 'var(--color-text-gray-500, #555)',
    fontSize: 'var(--font-size-sm, 16px)',
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    cursor: 'pointer',
    textAlign: 'center',
    minHeight: 'var(--touch-min, 56px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    transition: 'all var(--transition-fast, 150ms)',
  },

  /* Sandbox body — compact horizontal strip */
  sandboxBody: {
    padding: '4px 12px 8px',
    overflow: 'hidden',
  },

  sandboxChipStrip: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingBottom: 4,
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-sim-scrollbar) transparent',
  },

  sandboxChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    minHeight: 56,
    background: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 20,
    cursor: 'grab',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  chipIcon: {
    fontSize: 16,
    lineHeight: 1,
    flexShrink: 0,
  },

  chipLabel: {
    fontSize: 16,
    color: 'var(--color-text-gray-700)',
    fontWeight: 600,
    lineHeight: 1,
    fontFamily: 'var(--font-sans)',
  },
};

export default ComponentDrawer;
