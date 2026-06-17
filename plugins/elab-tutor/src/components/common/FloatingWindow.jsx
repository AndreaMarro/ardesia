/**
 * FloatingWindow — Finestra trascinabile/ridimensionabile comune ELAB
 * Atom A5 iter 36: Passo Passo LessonReader wrapper.
 * API compatibile con spec PDR §3:
 *   initialPosition, initialSize, minSize, resizable, draggable, zIndex,
 *   Esc close, mobile <768px fullscreen modal, ARIA-modal, focus trap,
 *   localStorage persist per title.
 *
 * Z-index 10001 > UNLIM lavagna/FloatingWindow (maximized z-index: 10000).
 *
 * (c) Andrea Marro — 2026-04-30 iter 36
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './FloatingWindow.module.css';

const FOCUSABLE_SEL =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function persistKey(title) {
  // Sanitize title → valid localStorage key
  return 'elab-floatwin-' + title.replace(/\s+/g, '-').toLowerCase();
}

function loadState(title, fallbackPos, fallbackSize) {
  try {
    const raw = localStorage.getItem(persistKey(title));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pos: { x: parsed.x ?? fallbackPos.x, y: parsed.y ?? fallbackPos.y },
        size: { width: parsed.width ?? fallbackSize.width, height: parsed.height ?? fallbackSize.height },
      };
    }
  } catch { /* ignore */ }
  return { pos: fallbackPos, size: fallbackSize };
}

function saveState(title, pos, size) {
  try {
    localStorage.setItem(persistKey(title), JSON.stringify({
      x: pos.x, y: pos.y,
      width: size.width, height: size.height,
    }));
  } catch { /* ignore */ }
}

export default function FloatingWindow({
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 480, height: 600 },
  minSize = { width: 320, height: 400 },
  resizable = true,
  draggable = true,
  zIndex = 10001,
  onClose,
}) {
  const winRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);

  // Clamp initial values to viewport
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const safePos = {
    x: Math.max(0, Math.min(initialPosition.x, vw - 100)),
    y: Math.max(48, Math.min(initialPosition.y, vh - 100)),
  };
  const safeSize = {
    width: Math.min(initialSize.width, vw - 40),
    height: Math.min(initialSize.height, vh - 80),
  };

  const loaded = loadState(title, safePos, safeSize);
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, Math.min(loaded.pos.x, vw - 100)),
    y: Math.max(48, Math.min(loaded.pos.y, vh - 100)),
  }));
  const [size, setSize] = useState(() => ({
    width: Math.max(minSize.width, Math.min(loaded.size.width, vw - 40)),
    height: Math.max(minSize.height, Math.min(loaded.size.height, vh - 80)),
  }));

  // Persist on change
  useEffect(() => { saveState(title, pos, size); }, [title, pos, size]);

  // Esc key → close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus trap (WCAG 2.4.3)
  useEffect(() => {
    const win = winRef.current;
    if (!win) return;
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = win.querySelectorAll(FOCUSABLE_SEL);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    win.addEventListener('keydown', onKey);
    return () => win.removeEventListener('keydown', onKey);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    dragState.current = null;
    resizeState.current = null;
  }, []);

  // Drag
  const handleDragStart = useCallback((e) => {
    if (!draggable) return;
    e.preventDefault();
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragState.current = { dx: cx - pos.x, dy: cy - pos.y };
    const onMove = (ev) => {
      if (!dragState.current) return;
      const x = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      const y = ev.clientY ?? ev.touches?.[0]?.clientY ?? 0;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 80, x - dragState.current.dx)),
        y: Math.max(48, Math.min(window.innerHeight - 100, y - dragState.current.dy)),
      });
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [draggable, pos]);

  // Resize (bottom-right corner only — spec: ≥24x24)
  const handleResizeStart = useCallback((e) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = { sx: e.clientX, sy: e.clientY, sw: size.width, sh: size.height };
    const onMove = (ev) => {
      if (!resizeState.current) return;
      const dx = ev.clientX - resizeState.current.sx;
      const dy = ev.clientY - resizeState.current.sy;
      setSize({
        width: Math.max(minSize.width, Math.min(window.innerWidth * 0.9, resizeState.current.sw + dx)),
        height: Math.max(minSize.height, Math.min(window.innerHeight * 0.85, resizeState.current.sh + dy)),
      });
    };
    const onUp = () => {
      resizeState.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [resizable, size, minSize]);

  const windowStyle = {
    left: pos.x,
    top: pos.y,
    width: size.width,
    height: size.height,
    zIndex,
  };

  return (
    <div
      ref={winRef}
      className={styles.window}
      style={windowStyle}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Title bar — drag handle (touch target ≥44px height) */}
      <div
        className={`${styles.titleBar} ${!draggable ? styles.titleBarNoDrag : ''}`}
        onPointerDown={handleDragStart}
        aria-label={`Trascina ${title}`}
      >
        <span className={styles.titleText}>{title}</span>
        {onClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={`Chiudi ${title}`}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {children}
      </div>

      {/* Resize corner (≥24x24 per spec) */}
      {resizable && (
        <div
          className={styles.resizeCorner}
          onPointerDown={handleResizeStart}
          aria-hidden="true"
          role="presentation"
        />
      )}
    </div>
  );
}
