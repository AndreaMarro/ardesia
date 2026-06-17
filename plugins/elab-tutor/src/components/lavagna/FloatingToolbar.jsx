import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import css from './FloatingToolbar.module.css';
import { computeNextPos, getPositionStyle } from './floatingToolbarDrag';

const STORAGE_KEY = 'elab-toolbar-pos';

function loadPos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return null; // null = use CSS default (centered bottom)
}

function savePos(pos) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch { /* */ }
}

const tools = [
  {
    id: 'select',
    labelKey: 'floating_toolbar.tool_select',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 2l12 7-5 2-3 5L4 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'wire',
    labelKey: 'floating_toolbar.tool_wire',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 17C3 12 7 8 12 8h5M14 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { id: 'divider1', divider: true },
  {
    id: 'delete',
    labelKey: 'floating_toolbar.tool_delete',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 5h14M7 5V3h6v2M8 8v7M12 8v7M5 5l1 12h8l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'undo',
    labelKey: 'floating_toolbar.tool_undo',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 8h9a4 4 0 010 8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 5L4 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'redo',
    labelKey: 'floating_toolbar.tool_redo',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M16 8H7a4 4 0 000 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  { id: 'divider2', divider: true },
  {
    id: 'pen',
    labelKey: 'floating_toolbar.tool_pen',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M12 3l5 5-10 10H2v-5L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 5l5 5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  // iter 45 fix Andrea video2 06/05/2026 B5 "manca la gomma": gomma esposta
  // accanto alla penna nella FloatingToolbar (oltre quella già nel drawing
  // toolbar interno DrawingOverlay top-center). Toggle modalità eraser via
  // window CustomEvent 'elab-set-eraser-mode' che DrawingOverlay ascolta.
  {
    id: 'eraser',
    labelKey: 'floating_toolbar.tool_eraser',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 16h11M5 11l7-7 4 4-7 7H5v-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function FloatingToolbar({
  activeTool = 'select',
  onToolChange,
  abovePanel = false,
  leftPanelOpen = false,
  unlimSlot,
}) {
  const { t } = useTranslation();
  const [pos, setPos] = useState(loadPos);
  const dragRef = useRef(null);
  const barRef = useRef(null);

  // Drag only from the drag handle area — buttons work normally.
  // Uses position:fixed while dragging (see floatingToolbarDrag.js) so that
  // clientX/clientY (viewport) map directly to left/top without any
  // offset-parent correction. Previously, when the toolbar was inside a
  // <main> with panel margins, the bar jumped by the margin amount.
  const handleDragStart = useCallback((e) => {
    // If user clicked a button, let the button handle it — no drag
    if (e.target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // Capture pointer so we don't lose it
    if (barRef.current?.setPointerCapture) {
      try { barRef.current.setPointerCapture(e.pointerId); } catch { /* */ }
    }

    const onMove = (ev) => {
      const next = computeNextPos({
        clientX: ev.clientX,
        clientY: ev.clientY,
        offsetX,
        offsetY,
        width: rect.width,
        height: rect.height,
        viewportW: window.innerWidth,
        viewportH: window.innerHeight,
      });
      setPos(next);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setPos(prev => { if (prev) savePos(prev); return prev; });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  // Reset position on double-click (back to default centered)
  const handleDoubleClick = useCallback((e) => {
    if (e.target.closest('button')) return;
    setPos(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  }, []);

  const posStyle = getPositionStyle(pos);

  return (
    <div
      ref={barRef}
      className={`${css.toolbar} ${abovePanel ? css.abovePanel : ''} ${!leftPanelOpen ? css.verticalOnLIM : ''}`}
      style={{ ...posStyle, cursor: 'grab', touchAction: 'none' }}
      role="toolbar"
      aria-label={t('floating_toolbar.aria')}
      onPointerDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag handle — area di presa ampia */}
      <div className={css.dragHandle} aria-hidden="true" title={t('floating_toolbar.drag_title')}>
        <svg width="8" height="28" viewBox="0 0 8 28" fill="none">
          <circle cx="2.5" cy="6" r="1.5" fill="currentColor" opacity="0.35"/>
          <circle cx="5.5" cy="6" r="1.5" fill="currentColor" opacity="0.35"/>
          <circle cx="2.5" cy="14" r="1.5" fill="currentColor" opacity="0.35"/>
          <circle cx="5.5" cy="14" r="1.5" fill="currentColor" opacity="0.35"/>
          <circle cx="2.5" cy="22" r="1.5" fill="currentColor" opacity="0.35"/>
          <circle cx="5.5" cy="22" r="1.5" fill="currentColor" opacity="0.35"/>
        </svg>
      </div>
      {tools.map((tool) => {
        if (tool.divider) {
          return <div key={tool.id} className={css.divider} aria-hidden="true" />;
        }
        return (
          <button
            key={tool.id}
            className={`${css.btn} ${activeTool === tool.id ? css.btnActive : ''}`}
            onClick={() => onToolChange?.(tool.id)}
            aria-label={t(tool.labelKey)}
            aria-pressed={activeTool === tool.id}
          >
            {tool.icon}
          </button>
        );
      })}
      {/* UNLIM può agganciarsi qui quando l'utente lo trascina sulla barra */}
    </div>
  );
}
