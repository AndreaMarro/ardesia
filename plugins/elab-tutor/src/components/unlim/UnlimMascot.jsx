/**
 * UnlimMascot — Robot ELAB REALE nell'angolo del simulatore
 * Usa la mascotte ufficiale (logo-senza-sfondo.png) — pixel perfect.
 * Tap = apri/chiudi chat. Long-press (500ms) = mute/unmute voce.
 * 4 stati: idle (respira), active (glow lime), thinking (ondeggia), speaking (pulsazione + bounce)
 * Badge mute quando mutato.
 * © Andrea Marro — 28/03/2026
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import css from './unlim-mascot.module.css';
import { SpeakerOffIcon } from '../common/ElabIcons';

/**
 * Inline SVG robot mascot — fallback when PNG fails to load.
 * Friendly rounded robot face, ELAB colors (navy body, lime eyes).
 */
function MascotSVG({ className }) {
  return (
    <svg
      width="54" height="62" viewBox="0 0 54 62"
      fill="none" className={className}
      role="img" aria-label="UNLIM robot"
    >
      {/* Antenna */}
      <line x1="27" y1="0" x2="27" y2="10" stroke="var(--elab-navy)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="27" cy="3" r="3" fill="var(--elab-lime)" />
      {/* Head */}
      <rect x="6" y="10" width="42" height="34" rx="10" fill="var(--elab-navy)" />
      {/* Face plate */}
      <rect x="10" y="14" width="34" height="26" rx="7" fill="var(--elab-hex-e8eef6)" />
      {/* Eyes */}
      <circle cx="20" cy="27" r="5" fill="var(--elab-lime)" />
      <circle cx="34" cy="27" r="5" fill="var(--elab-lime)" />
      <circle cx="21" cy="25.5" r="1.5" fill="#fff" />
      <circle cx="35" cy="25.5" r="1.5" fill="#fff" />
      {/* Mouth (smile) */}
      <path d="M20 34 Q27 39 34 34" stroke="var(--elab-navy)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Ears */}
      <rect x="1" y="20" width="5" height="12" rx="2.5" fill="var(--elab-orange)" />
      <rect x="48" y="20" width="5" height="12" rx="2.5" fill="var(--elab-orange)" />
      {/* Body */}
      <rect x="14" y="46" width="26" height="14" rx="5" fill="var(--elab-navy)" />
      {/* Body detail */}
      <circle cx="27" cy="53" r="3" fill="var(--elab-lime)" />
    </svg>
  );
}

export default function UnlimMascot({ state = 'idle', onClick, isMuted = false, onLongPress }) {
  const isActive = state === 'active' || state === 'speaking' || state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const [imgFailed, setImgFailed] = useState(false);

  // Long-press detection (500ms) for mute toggle — with visual feedback
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);
  const btnRef = useRef(null);

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    if (btnRef.current) btnRef.current.classList.add(css.pressing);
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      if (btnRef.current) btnRef.current.classList.remove(css.pressing);
      onLongPress?.();
    }, 500);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    if (btnRef.current) btnRef.current.classList.remove(css.pressing);
    if (!didLongPress.current) {
      onClick?.();
    }
  }, [onClick]);

  const handlePointerLeave = useCallback(() => {
    clearTimeout(longPressTimer.current);
    if (btnRef.current) btnRef.current.classList.remove(css.pressing);
  }, []);

  // Cleanup timer on unmount (BUG-14 fix)
  useEffect(() => () => clearTimeout(longPressTimer.current), []);

  // Resolve button class
  const btnClass = [
    isSpeaking ? css.btnSpeaking
      : isThinking ? css.btnThinking
      : isActive ? css.btnActive
      : css.btn,
    isMuted ? css.btnMuted : '',
  ].filter(Boolean).join(' ');

  // Resolve image class
  const imgClass = [
    isMuted ? css.mascotImgMuted : css.mascotImg,
    isSpeaking ? css.mascotImgSpeaking
      : isThinking ? css.mascotImgThinking
      : state === 'idle' ? css.mascotImgIdle
      : '',
  ].filter(Boolean).join(' ');

  return (
      <button
        ref={btnRef}
        className={btnClass}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        aria-label={isMuted ? 'UNLIM — voce disattivata. Tieni premuto per attivare.' : 'UNLIM — clicca per parlare. Tieni premuto per disattivare voce.'}
        title={isMuted ? 'UNLIM (voce off — tieni premuto)' : 'Chiedi a UNLIM (tieni premuto = mute)'}
      >
        {imgFailed ? (
          <MascotSVG className={imgClass} />
        ) : (
          <img
            src="/assets/mascot/logo-senza-sfondo.png"
            alt="UNLIM robot"
            className={imgClass}
            onError={() => setImgFailed(true)}
          />
        )}
        {/* Badge mute — piccolo indicatore nell'angolo */}
        {isMuted && (
          <span className={css.muteBadge}>
            <SpeakerOffIcon size={14} color="#fff" />
          </span>
        )}
      </button>
  );
}
