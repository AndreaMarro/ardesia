import React, { useRef, useState, useCallback, useEffect } from 'react';
import css from './RetractablePanel.module.css';

const STORAGE_PREFIX = 'elab-rp-';

function loadSize(id, fallback) {
  if (!id) return fallback;
  try {
    const v = localStorage.getItem(STORAGE_PREFIX + id);
    if (v) return Number(v);
  } catch { /* ignore */ }
  return fallback;
}

function saveSize(id, val) {
  if (!id) return;
  try { localStorage.setItem(STORAGE_PREFIX + id, String(val)); } catch { /* ignore */ }
}

export default function RetractablePanel({
  id,
  direction = 'left',
  open = true,
  onToggle,
  defaultSize = 240,
  minSize = 120,
  maxSize = 600,
  children,
  className,
  onSizeChange,
}) {
  const [size, setSize] = useState(() => loadSize(id, defaultSize));
  const resizeRef = useRef(null);

  useEffect(() => { saveSize(id, size); onSizeChange?.(size); }, [id, size, onSizeChange]);

  // Cleanup resize refs on unmount (prevents orphaned listeners)
  useEffect(() => {
    return () => { resizeRef.current = null; };
  }, []);

  const isHorizontal = direction === 'left' || direction === 'right';
  const sizeStyle = isHorizontal ? { width: size } : { height: size };

  // Resize handler
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    const startPos = isHorizontal ? e.clientX : e.clientY;
    resizeRef.current = { startPos, startSize: size };

    const handleMove = (ev) => {
      if (!resizeRef.current) return;
      const currentPos = isHorizontal ? ev.clientX : ev.clientY;
      const delta = currentPos - resizeRef.current.startPos;
      const sign = (direction === 'left' || direction === 'bottom') ? 1 : -1;
      const directedDelta = direction === 'bottom' ? -delta : delta * sign;
      const newSize = Math.max(minSize, Math.min(maxSize, resizeRef.current.startSize + directedDelta));
      setSize(newSize);
    };
    const handleUp = () => {
      resizeRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [isHorizontal, direction, size, minSize, maxSize]);

  const panelClasses = [
    css.panel,
    css[direction],
    !open && css.closed,
    className,
  ].filter(Boolean).join(' ');

  const handleClass = direction === 'left' ? css.handleRight
    : direction === 'right' ? css.handleLeft
    : css.handleTop;

  const toggleClass = direction === 'left' ? css.toggleLeft
    : direction === 'right' ? css.toggleRight
    : css.toggleBottom;

  // Arrow direction for toggle
  const arrowSvg = (() => {
    if (direction === 'left') {
      return open
        ? <path d="M9 4l-5 6 5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        : <path d="M5 4l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    }
    if (direction === 'right') {
      return open
        ? <path d="M5 4l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        : <path d="M9 4l-5 6 5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    }
    // bottom
    return open
      ? <path d="M4 5l6 5 6-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      : <path d="M4 9l6-5 6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  })();

  return (
    <div
      className={panelClasses}
      style={sizeStyle}
      role="complementary"
      aria-label={`Pannello ${direction === 'left' ? 'sinistro' : direction === 'right' ? 'destro' : 'inferiore'}`}
    >
      {/* Resize handle */}
      <div
        className={`${css.handle} ${handleClass}`}
        onPointerDown={handleResizeStart}
        aria-hidden="true"
      />

      {/* Panel body */}
      <div className={css.body}>
        {children}
      </div>

      {/* Toggle button */}
      {onToggle && (
        <button
          className={`${css.toggle} ${toggleClass}`}
          onClick={onToggle}
          aria-label={open ? 'Chiudi pannello' : 'Apri pannello'}
          aria-expanded={open}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            {arrowSvg}
          </svg>
        </button>
      )}
    </div>
  );
}
