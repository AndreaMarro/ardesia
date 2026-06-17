/**
 * MascotPresence — Mascotte ELAB trascinabile sulla Lavagna
 * Clicca per aprire UNLIM, trascina per spostare.
 * Si anima quando UNLIM parla, dopo 30s di inattività "guarda" il circuito.
 * (c) Andrea Marro — 03/04/2026
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import css from './MascotPresence.module.css';

const STORAGE_KEY = 'elab-mascot-pos';

function loadPos() {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function savePos(pos) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch { /* */ }
}

/* SVG inline della mascotte ELAB — robottino con cuffie + cacciavite o microfono */
function MascotSvg({ size = 44, micActive = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path d="M8 20C8 12.3 14.3 6 22 6s14 6.3 14 14" stroke="var(--elab-navy)" strokeWidth="2.5" fill="none" />
      <rect x="10" y="14" width="24" height="20" rx="5" fill="var(--elab-navy)" />
      <rect x="13" y="17" width="18" height="12" rx="3" fill="var(--elab-hex-153d6f)" />
      <circle cx="18" cy="23" r="2.5" fill="var(--elab-lime)" />
      <circle cx="26" cy="23" r="2.5" fill="var(--elab-lime)" />
      <circle cx="18.8" cy="22.2" r="0.8" fill="#fff" opacity="0.9" />
      <circle cx="26.8" cy="22.2" r="0.8" fill="#fff" opacity="0.9" />
      <path d="M17 27c0 0 2.5 2.5 5 2.5s5-2.5 5-2.5" stroke="var(--elab-lime)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 14V9" stroke="var(--elab-orange)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="7.5" r="2" fill="var(--elab-orange)" />
      <rect x="4" y="18" width="7" height="11" rx="3.5" fill="var(--elab-lime)" />
      <rect x="33" y="18" width="7" height="11" rx="3.5" fill="var(--elab-lime)" />
      {micActive ? (
        /* Microfono in mano */
        <>
          <rect x="36" y="30" width="4" height="8" rx="2" fill="var(--elab-red)" />
          <path d="M36 38h4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="38" cy="30" r="2.5" fill="var(--elab-red)" />
          <circle cx="38" cy="29" r="0.8" fill="#fff" opacity="0.6" />
        </>
      ) : (
        /* Cacciavite in mano */
        <>
          <line x1="36" y1="34" x2="40" y2="38" stroke="var(--elab-lime)" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="38" x2="42" y2="40" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export default function MascotPresence({ speaking = false, isSpeaking, micActive = false, onClick, onMascotClick, mascotSrc }) {
  const activeSpeaking = Boolean(isSpeaking ?? speaking);
  const clickHandler = onClick || onMascotClick;
  const [idle, setIdle] = useState(false);
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef(null);
  const dragRef = useRef(null);
  const wasDragged = useRef(false);
  const posRef = useRef(null); // track latest pos for handleUp closure
  const onClickRef = useRef(clickHandler);
  onClickRef.current = clickHandler;

  const saved = loadPos();
  const clampToViewport = (p) => {
    if (typeof window === 'undefined') return p;
    return {
      x: Math.max(0, Math.min(window.innerWidth - 64, p.x)),
      y: Math.max(48, Math.min(window.innerHeight - 64, p.y)),
    };
  };
  const [pos, setPos] = useState(() => clampToViewport({
    x: saved?.x ?? (typeof window !== 'undefined' ? window.innerWidth - 80 : 1100),
    y: saved?.y ?? (typeof window !== 'undefined' ? window.innerHeight - 80 : 700),
  }));

  // Re-clamp position on window resize
  useEffect(() => {
    const handleResize = () => setPos(prev => clampToViewport(prev));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Idle animation after 30s
  const resetIdle = useCallback(() => {
    setIdle(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), 30000);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => setIdle(true), 30000);
    window.addEventListener('pointerdown', resetIdle);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('pointerdown', resetIdle);
    };
  }, [resetIdle]);

  // Keep posRef in sync for closure-safe access
  posRef.current = pos;

  // Drag handling
  const handlePointerDown = useCallback((e) => {
    wasDragged.current = false;
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = e.clientX - posRef.current.x;
    const startY = e.clientY - posRef.current.y;
    dragRef.current = { startX, startY };

    const handleMove = (ev) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - startClientX;
      const dy = ev.clientY - startClientY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        wasDragged.current = true;
        setDragging(true);
        ev.preventDefault();
      }
      if (wasDragged.current) {
        const nx = Math.max(0, Math.min(window.innerWidth - 64, ev.clientX - dragRef.current.startX));
        const ny = Math.max(48, Math.min(window.innerHeight - 64, ev.clientY - dragRef.current.startY));
        setPos({ x: nx, y: ny });
      }
    };
    const handleUp = () => {
      dragRef.current = null;
      setDragging(false);
      savePos(posRef.current);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, []); // no deps — uses refs for latest values

  // Save position on change
  useEffect(() => { savePos(pos); }, [pos]);

  const handleClick = useCallback(() => {
    if (!wasDragged.current) onClickRef.current?.();
  }, []);

  const stateClasses = [
    css.mascot,
    activeSpeaking ? css.speaking : '',
    idle ? css.idle : '',
    dragging ? css.dragging : '',
    css.floating,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={stateClasses}
      style={{ left: pos.x, top: pos.y, position: 'fixed', zIndex: 900, cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label="Parla con UNLIM — trascina per spostare"
      title="Trascina per spostare, clicca per UNLIM"
    >
      {mascotSrc ? (
        <img src={mascotSrc} alt="UNLIM mascotte" className={css.img} />
      ) : (
        <MascotSvg size={44} micActive={micActive} />
      )}
      {activeSpeaking && (
        <div className={css.speechBubble} role="status" aria-label="Sto ELABorando...">
          <span className={css.speechText}>Sto ELABorando...</span>
          <span className={css.dot} />
          <span className={css.dot} />
          <span className={css.dot} />
        </div>
      )}
    </button>
  );
}

export { MascotSvg };
