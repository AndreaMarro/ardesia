/**
 * MinimalControlBar — Progressive Disclosure toolbar
 * G12 "RESPIRA": Da 28 bottoni a 3.
 * Mostra SOLO: Play/Pause, Nome Esperimento, UNLIM.
 * Tutto il resto in menu overflow organizzato per sezioni.
 *
 * (c) Andrea Marro — 28 Marzo 2026
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ControlBar from './ControlBar';

/* ─── SVG Icons (inline, minimal set) ─── */
const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6,3 20,12 6,21" />
  </svg>
);

const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <polyline points="3 3 3 9 9 9" />
  </svg>
);

const UNLIMIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L1 9l11 6 9-4.91V17" />
    <path d="M5 13.18v4L12 21l7-3.82v-4" />
  </svg>
);

const OverflowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="toolbar-spinner">
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

/* ─── Overflow Menu (reuses existing CSS, keyboard nav) ─── */
const MinimalOverflowMenu = ({ open, setOpen, items }) => {
  const [focusIndex, setFocusIndex] = useState(-1);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const itemRefs = useRef([]);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && focusIndex >= 0 && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex].focus();
    }
  }, [focusIndex, open]);

  useEffect(() => { if (!open) setFocusIndex(-1); }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  const nextFocusable = useCallback((from, dir) => {
    let idx = from;
    for (let i = 0; i < items.length; i++) {
      idx = (idx + dir + items.length) % items.length;
      if (items[idx].type !== 'separator') return idx;
    }
    return from;
  }, [items]);

  const handleKeyDown = useCallback((e) => {
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setFocusIndex(prev => nextFocusable(prev, 1)); break;
      case 'ArrowUp': e.preventDefault(); setFocusIndex(prev => nextFocusable(prev, -1)); break;
      case 'Escape': e.preventDefault(); setOpen(false); break;
      default: break;
    }
  }, [open, nextFocusable, setOpen]);

  const handleToggle = useCallback(() => {
    setOpen(prev => {
      if (!prev && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setMenuPos({ top: r.bottom + 4, right: Math.max(4, window.innerWidth - r.right) });
      }
      return !prev;
    });
  }, [setOpen]);

  return (
    <div ref={menuRef} onKeyDown={handleKeyDown} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className={`minimal-toolbar__btn minimal-toolbar__btn--overflow ${open ? 'minimal-toolbar__btn--active' : ''}`}
        onClick={handleToggle}
        title="Strumenti e opzioni"
        aria-label="Strumenti e opzioni"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <OverflowIcon />
      </button>
      {open && (
        <div
          className="toolbar-overflow-menu"
          role="menu"
          aria-label="Strumenti e opzioni"
          style={{
            position: 'fixed', top: menuPos.top, right: menuPos.right, left: 'auto',
            maxHeight: `calc(100dvh - ${menuPos.top + 8}px)`, overflowY: 'auto',
            minWidth: 220,
          }}
        >
          {items.map((item, idx) => (
            item.type === 'separator' ? (
              <div key={`sep-${idx}`} className="overflow-separator" role="separator" aria-hidden="true">
                {item.label}
              </div>
            ) : (
              <button
                key={item.label}
                ref={el => { itemRefs.current[idx] = el; }}
                className={`toolbar-overflow-item${item.disabled ? ' toolbar-overflow-item--disabled' : ''}`}
                role="menuitem"
                tabIndex={focusIndex === idx ? 0 : -1}
                disabled={item.disabled}
                onClick={() => { if (!item.disabled) { item.action(); setOpen(false); } }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!item.disabled) { item.action(); setOpen(false); }
                  }
                }}
              >
                {item.checked !== undefined && (
                  <span style={{ display: 'inline-block', width: 20, textAlign: 'center' }}>
                    {item.checked ? '✓' : ''}
                  </span>
                )}
                <span>{item.label}</span>
                {item.shortcut && (
                  <span style={{ marginLeft: 'auto', paddingLeft: 16, opacity: 0.5, fontSize: 14 }}>
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── MinimalControlBar ─── */
const MinimalControlBar = (props) => {
  const {
    experiment,
    isRunning,
    onPlay,
    onPause,
    onReset,
    onBack,
    isArduinoExperiment,
    // UNLIM
    onAskUNLIM,
    isAskingUNLIM,
    // Compile
    onCompile,
    compileStatus,
    // All props forwarded to ControlBar fallback
    minimalMode = true,
    ...rest
  } = props;

  const [overflowOpen, setOverflowOpen] = useState(false);

  // Fallback: render full ControlBar
  if (!minimalMode) {
    return <ControlBar {...props} />;
  }

  if (!experiment) return null;

  // Build overflow items from all the props
  const overflowItems = buildOverflowItems(props);

  return (
    <div className="minimal-toolbar" role="toolbar" aria-label="Controlli simulatore">
      {/* ── 1. PLAY/PAUSE — big, lime ── */}
      <div className="minimal-toolbar__primary">
        {isArduinoExperiment && (
          isRunning ? (
            <button
              className="minimal-toolbar__btn minimal-toolbar__btn--play minimal-toolbar__btn--pause-state"
              onClick={onPause}
              title="Metti in pausa (Spazio)"
              aria-label="Pausa"
            >
              <PauseIcon />
            </button>
          ) : (
            <button
              className="minimal-toolbar__btn minimal-toolbar__btn--play"
              onClick={onPlay}
              title="Avvia simulazione (Spazio)"
              aria-label="Avvia"
            >
              <PlayIcon />
            </button>
          )
        )}

        {/* Reset — small, next to play */}
        <button
          className="minimal-toolbar__btn minimal-toolbar__btn--reset"
          onClick={onReset}
          title="Resetta simulazione"
          aria-label="Azzera"
        >
          <ResetIcon />
        </button>

        {/* Compile — only if Arduino, small */}
        {onCompile && (
          <button
            className={`minimal-toolbar__btn minimal-toolbar__btn--compile ${compileStatus === 'compiling' ? 'minimal-toolbar__btn--loading' : ''} ${compileStatus === 'success' || compileStatus === 'success-local' ? 'minimal-toolbar__btn--compile-ok' : ''} ${compileStatus === 'error' ? 'minimal-toolbar__btn--compile-err' : ''}`}
            onClick={onCompile}
            disabled={compileStatus === 'compiling'}
            title="Compila (Ctrl+B)"
            aria-label="Compila"
          >
            {compileStatus === 'compiling' ? <SpinnerIcon /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
                <path d="M12 12v8" /><path d="m9 15 3-3 3 3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── 2. EXPERIMENT NAME — clickable ── */}
      <button
        className="minimal-toolbar__experiment"
        onClick={onBack}
        title="Cambia esperimento"
        aria-label={`Esperimento: ${experiment.title}. Clicca per cambiare.`}
      >
        <span className="minimal-toolbar__experiment-icon">{experiment.icon}</span>
        <span className="minimal-toolbar__experiment-title">{experiment.title}</span>
      </button>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── 3. OVERFLOW MENU ── */}
      <MinimalOverflowMenu open={overflowOpen} setOpen={setOverflowOpen} items={overflowItems} />

      {/* ── 4. UNLIM ── */}
      {onAskUNLIM && (
        <button
          className={`minimal-toolbar__btn minimal-toolbar__btn--unlim ${isAskingUNLIM ? 'minimal-toolbar__btn--loading' : ''}`}
          onClick={onAskUNLIM}
          disabled={isAskingUNLIM}
          title="Chiedi a UNLIM"
          aria-label="Chiedi a UNLIM"
        >
          {isAskingUNLIM ? <SpinnerIcon /> : <UNLIMIcon />}
          <span className="minimal-toolbar__unlim-label">UNLIM</span>
        </button>
      )}
    </div>
  );
};

/* ─── Build overflow items from all ControlBar props ─── */
function buildOverflowItems(props) {
  const {
    onTogglePalette, showPalette,
    onToggleCodeEditor, showCodeEditor,
    onToggleBom, showBom,
    onToggleQuiz, showQuiz, hasQuiz,
    onToggleLessonPath, showLessonPath,
    onToggleNotes, showNotes,
    onAddAnnotation,
    onToggleWireMode, wireMode,
    onToggleBottomPanel, showBottomPanel,
    onExportPng,
    onGenerateReport, isGeneratingReport,
    onOpenFumetto,
    onToggleWhiteboard, showWhiteboard,
    onToggleDrawingOverlay, showDrawingOverlay,

    onAskUNLIM, isAskingUNLIM,
    onDiagnoseCircuit,
    onGetHints,
    experimentName, isArduinoExperiment, experiment,
    onToggleShortcuts,
    onShowWelcome,
    onUndo, onRedo, canUndo, canRedo,
    onExportJSON, onImportJSON, onResetExperiment,
    selectedComponentId, onComponentDelete, onComponentRotate, onShowProperties,
    onToggleSidebar, showSidebar,
    onTabChange,
  } = props;

  const items = [];

  // ── Attività (tab switching) ──
  if (onTabChange) {
    items.push({ type: 'separator', label: 'Attività' });
    items.push({ label: 'Manuale', action: () => onTabChange('manual') });
    items.push({ label: 'Giochi', action: () => onTabChange('detective') });
    items.push({ label: 'Lavagna', action: () => onTabChange('canvas') });
    items.push({ label: 'Taccuini', action: () => onTabChange('notebooks') });
  }

  // ── Circuito ──
  items.push({ type: 'separator', label: 'Circuito' });
  if (onToggleWireMode) items.push({ label: 'Collega Fili', checked: wireMode, action: onToggleWireMode, shortcut: 'W' });
  if (selectedComponentId && onComponentDelete) items.push({ label: 'Elimina Componente', action: () => onComponentDelete(selectedComponentId), shortcut: 'Canc' });
  if (selectedComponentId && onComponentRotate) items.push({ label: 'Ruota Componente', action: () => onComponentRotate(selectedComponentId) });
  if (selectedComponentId && onShowProperties) items.push({ label: 'Proprietà', action: () => onShowProperties(selectedComponentId) });
  if (onResetExperiment) items.push({ label: 'Ripristina Esperimento', action: onResetExperiment });

  // ── Strumenti ──
  items.push({ type: 'separator', label: 'Strumenti' });
  if (onTogglePalette) items.push({ label: 'Componenti', checked: showPalette, action: onTogglePalette });
  if (onToggleCodeEditor) items.push({ label: 'Editor Codice', checked: showCodeEditor, action: onToggleCodeEditor });
  if (onToggleBom) items.push({ label: 'Lista Pezzi (BOM)', checked: showBom, action: onToggleBom });
  if (onToggleBottomPanel) items.push({ label: 'Monitor Seriale', checked: showBottomPanel, action: onToggleBottomPanel });

  // ── Lezione ──
  items.push({ type: 'separator', label: 'Lezione' });
  if (onToggleLessonPath) items.push({ label: 'Percorso Lezione', checked: showLessonPath, action: onToggleLessonPath });
  if (onToggleQuiz && hasQuiz) items.push({ label: 'Quiz', checked: showQuiz, action: onToggleQuiz });
  if (onToggleNotes) items.push({ label: 'Appunti', checked: showNotes, action: onToggleNotes });
  if (onAddAnnotation) items.push({ label: 'Nota sul Circuito', action: onAddAnnotation });

  // ── Avanzato ──
  items.push({ type: 'separator', label: 'Avanzato' });
  if (onExportPng) items.push({ label: 'Cattura Immagine', action: onExportPng });
  if (onOpenFumetto) {
    items.push({ label: 'Fumetto Report', action: onOpenFumetto });
  } else if (onGenerateReport) {
    items.push({ label: isGeneratingReport ? 'Generazione...' : 'Report PDF', action: onGenerateReport, disabled: isGeneratingReport });
  }
  if (onToggleWhiteboard) items.push({ label: 'Lavagna', checked: showWhiteboard, action: onToggleWhiteboard });
  if (onToggleDrawingOverlay) items.push({ label: 'Penna Circuito', checked: showDrawingOverlay, action: onToggleDrawingOverlay });

  if (onDiagnoseCircuit) items.push({ label: 'Controlla Circuito', action: onDiagnoseCircuit });
  if (onGetHints) items.push({ label: 'Suggerimenti', action: onGetHints });
  if (experimentName) {
    items.push({
      label: 'Cerca su YouTube', action: () => {
        const q = `ELAB elettronica ${experimentName}${isArduinoExperiment ? ' arduino' : ''}`;
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank', 'noopener');
      }
    });
  }

  // ── Modifica ──
  items.push({ type: 'separator', label: 'Modifica' });
  if (onUndo) items.push({ label: 'Annulla', action: onUndo, disabled: !canUndo, shortcut: 'Ctrl+Z' });
  if (onRedo) items.push({ label: 'Ripeti', action: onRedo, disabled: !canRedo, shortcut: 'Ctrl+Y' });

  // ── File ──
  items.push({ type: 'separator', label: 'File' });
  if (onExportJSON) items.push({ label: 'Salva Circuito', action: onExportJSON });
  if (onImportJSON) items.push({ label: 'Carica Circuito', action: onImportJSON });

  // ── Vista ──
  items.push({ type: 'separator', label: 'Vista' });
  if (onToggleSidebar) items.push({ label: showSidebar ? 'Nascondi Sidebar' : 'Mostra Sidebar', action: onToggleSidebar });
  if (onToggleShortcuts) items.push({ label: 'Scorciatoie Tastiera', action: onToggleShortcuts });
  if (onShowWelcome) items.push({ label: 'Guida Rapida', action: onShowWelcome });

  return items;
}

export default MinimalControlBar;
