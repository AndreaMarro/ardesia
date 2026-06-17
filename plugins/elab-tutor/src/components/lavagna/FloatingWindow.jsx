import React, { useRef, useCallback, useEffect, useState } from 'react';
import css from './FloatingWindow.module.css';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let zCounter = 1010;

const STORAGE_PREFIX = 'elab-fw-';

function loadPosition(id, fallback) {
  if (!id) return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function savePosition(id, pos) {
  if (!id) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(pos));
  } catch { /* ignore */ }
}

export default function FloatingWindow({
  title,
  children,
  id,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { w: 360, h: 400 },
  maximized = false,
  glass = false,
  onMinimize,
  onMaximize,
  onClose,
  onFocus,
  style,
  className,
}) {
  const winRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);

  const saved = loadPosition(id, { ...defaultPosition, ...defaultSize });
  // Clamp saved values to viewport to prevent panels covering entire screen
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const clampedW = Math.min(saved.w ?? defaultSize.w, vw - 40);
  const clampedH = Math.min(saved.h ?? defaultSize.h, vh - 80);
  const clampedX = Math.max(0, Math.min(saved.x ?? defaultPosition.x, vw - 100));
  const clampedY = Math.max(0, Math.min(saved.y ?? defaultPosition.y, vh - 100));
  const [pos, setPos] = useState({ x: clampedX, y: clampedY });
  const [size, setSize] = useState({ w: clampedW, h: clampedH });
  const [zIndex, setZIndex] = useState(() => ++zCounter);

  const bringToFront = useCallback(() => {
    if (zCounter > 5000) zCounter = 1010;
    setZIndex(++zCounter);
    onFocus?.();
  }, [onFocus]);

  // Persist position/size
  useEffect(() => {
    if (!maximized) {
      savePosition(id, { x: pos.x, y: pos.y, w: size.w, h: size.h });
    }
  }, [id, pos, size, maximized]);

  // Cleanup drag/resize listeners on unmount (prevents memory leaks)
  useEffect(() => {
    return () => {
      dragState.current = null;
      resizeState.current = null;
    };
  }, []);

  // Focus trap — Tab cycles within the floating window (WCAG 2.4.3)
  useEffect(() => {
    const win = winRef.current;
    if (!win) return;
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = win.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    win.addEventListener('keydown', handleKeyDown);
    return () => win.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- DRAG ---
  const handleDragStart = useCallback((e) => {
    if (maximized) return;
    e.preventDefault();
    bringToFront();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragState.current = { startX: clientX - pos.x, startY: clientY - pos.y };

    const handleMove = (ev) => {
      if (!dragState.current) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? 0;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 280, cx - dragState.current.startX)),
        y: Math.max(48, Math.min(window.innerHeight - 100, cy - dragState.current.startY)),
      });
    };
    const handleUp = () => {
      dragState.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [pos, maximized, bringToFront]);

  // --- RESIZE ---
  const handleResizeStart = useCallback((dir, e) => {
    if (maximized) return;
    e.preventDefault();
    e.stopPropagation();
    bringToFront();
    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    resizeState.current = { dir, startX: clientX, startY: clientY, startW: size.w, startH: size.h, startLeft: pos.x, startTop: pos.y };

    const handleMove = (ev) => {
      if (!resizeState.current) return;
      const cx = ev.clientX ?? 0;
      const cy = ev.clientY ?? 0;
      const dx = cx - resizeState.current.startX;
      const dy = cy - resizeState.current.startY;
      const state = resizeState.current;
      const minW = 280;
      const minH = 200;
      const maxW = Math.max(minW, window.innerWidth - 24);
      const maxH = Math.max(minH, window.innerHeight - 64);
      let nextW = state.startW;
      let nextH = state.startH;
      let nextX = state.startLeft;
      let nextY = state.startTop;

      if (state.dir.includes('e')) {
        nextW = Math.max(minW, Math.min(maxW, state.startW + dx));
      }
      if (state.dir.includes('s')) {
        nextH = Math.max(minH, Math.min(maxH, state.startH + dy));
      }
      if (state.dir.includes('w')) {
        const proposedW = Math.max(minW, Math.min(maxW, state.startW - dx));
        nextX = state.startLeft + (state.startW - proposedW);
        nextW = proposedW;
      }
      if (state.dir.includes('n')) {
        const proposedH = Math.max(minH, Math.min(maxH, state.startH - dy));
        nextY = state.startTop + (state.startH - proposedH);
        nextH = proposedH;
      }

      nextX = Math.max(0, Math.min(nextX, window.innerWidth - minW));
      nextY = Math.max(48, Math.min(nextY, window.innerHeight - minH));
      setPos({ x: nextX, y: nextY });
      setSize({ w: nextW, h: nextH });
    };
    const handleUp = () => {
      resizeState.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [pos, size, maximized, bringToFront]);

  const classNames = [
    css.window,
    maximized && css.maximized,
    glass && css.glass,
    className,
  ].filter(Boolean).join(' ');

  const windowStyle = maximized
    ? { zIndex, ...style }
    : { left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex, ...style };

  return (
    <div
      id={id}
      ref={winRef}
      className={classNames}
      style={windowStyle}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onPointerDown={bringToFront}
    >
      {/* Title bar — drag handle */}
      <div className={css.titleBar} onPointerDown={handleDragStart}>
        <span className={css.titleText} title={title}>{title}</span>
        {onMinimize && (
          <button
            className={css.btn}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            aria-label="Minimizza"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {onMaximize && (
          <button
            className={css.btn}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            aria-label="Espandi"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
        {onClose && (
          <button
            className={`${css.btn} ${css.btnClose}`}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Chiudi"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className={css.body}>
        {children}
      </div>

      {/* Resize handles (hidden when maximized) */}
      {!maximized && (
        <>
          <div className={`${css.resizeHandle} ${css.resizeTop}`} role="separator" aria-label={`Ridimensiona ${title} sopra`} onPointerDown={(e) => handleResizeStart('n', e)} />
          <div className={`${css.resizeHandle} ${css.resizeRight}`} role="separator" aria-label={`Ridimensiona ${title} destra`} onPointerDown={(e) => handleResizeStart('e', e)} />
          <div className={`${css.resizeHandle} ${css.resizeBottom}`} role="separator" aria-label={`Ridimensiona ${title} sotto`} onPointerDown={(e) => handleResizeStart('s', e)} />
          <div className={`${css.resizeHandle} ${css.resizeLeft}`} role="separator" aria-label={`Ridimensiona ${title} sinistra`} onPointerDown={(e) => handleResizeStart('w', e)} />
          <div className={`${css.resizeHandle} ${css.resizeCorner} ${css.resizeNE}`} role="separator" aria-label={`Ridimensiona ${title} alto destra`} onPointerDown={(e) => handleResizeStart('ne', e)} />
          <div className={`${css.resizeHandle} ${css.resizeCorner} ${css.resizeSE}`} role="separator" aria-label={`Ridimensiona ${title} basso destra`} onPointerDown={(e) => handleResizeStart('se', e)} />
          <div className={`${css.resizeHandle} ${css.resizeCorner} ${css.resizeSW}`} role="separator" aria-label={`Ridimensiona ${title} basso sinistra`} onPointerDown={(e) => handleResizeStart('sw', e)} />
          <div className={`${css.resizeHandle} ${css.resizeCorner} ${css.resizeNW}`} role="separator" aria-label={`Ridimensiona ${title} alto sinistra`} onPointerDown={(e) => handleResizeStart('nw', e)} />
        </>
      )}
    </div>
  );
}
