/**
 * UnlimInputBar — Barra input unificata (testo + mic + invio)
 * Sostituisce la chat in UNLIM Mode.
 * Design minimale: progressive disclosure — mic, TTS, report hidden
 * behind overflow menu until first use (localStorage).
 * © Andrea Marro — 31/03/2026
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import css from './unlim-input-bar.module.css';
import { MicrophoneIcon, StopIcon, SpeakerOnIcon, SpeakerOffIcon, ReportIcon, SendIcon, LoadingIcon } from '../common/ElabIcons';

const TOOLS_KEY = 'elab-unlim-tools-revealed';

function useRevealedTools() {
  const [revealed, setRevealed] = useState(() => {
    try {
      const stored = localStorage.getItem(TOOLS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const reveal = useCallback((tool) => {
    setRevealed(prev => {
      const next = { ...prev, [tool]: true };
      try { localStorage.setItem(TOOLS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { revealed, reveal };
}

// Overflow menu icon (3 dots)
function MoreIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

export default function UnlimInputBar({
  onSend,
  onMicClick,
  onReport,
  isMuted = true,
  onToggleMute,
  isListening = false,
  isLoading = false,
  placeholder = 'Chiedi qualcosa a UNLIM...',
}) {
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const { revealed, reveal } = useRevealedTools();

  // Auto-focus input — skip on touch devices
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) inputRef.current?.focus();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [menuOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Which tools are shown directly vs. in menu
  const showMicDirect = revealed.mic || isListening;
  const showTtsDirect = revealed.tts || !isMuted;
  const showReportDirect = revealed.report;

  // Are there hidden tools?
  const hasHiddenTools = onMicClick && !showMicDirect
    || onToggleMute && !showTtsDirect
    || onReport && !showReportDirect;

  return (
    <form onSubmit={handleSubmit} className={css.form}>
      {/* Mic — direct if revealed */}
      {onMicClick && showMicDirect && (
        <button
          type="button"
          onClick={() => { reveal('mic'); onMicClick(); }}
          aria-label={isListening ? 'Ferma registrazione' : 'Parla con UNLIM'}
          title={isListening ? 'Ferma' : 'Parla'}
          className={isListening ? css.micBtnActive : css.micBtn}
        >
          {isListening ? <StopIcon size={20} /> : <MicrophoneIcon size={20} />}
        </button>
      )}

      {/* TTS — direct if revealed */}
      {onToggleMute && showTtsDirect && (
        <button
          type="button"
          onClick={() => { reveal('tts'); onToggleMute(); }}
          aria-label={isMuted ? 'Attiva lettura risposte' : 'Disattiva lettura risposte'}
          aria-pressed={!isMuted}
          title={isMuted ? 'Leggi risposte: OFF' : 'Leggi risposte: ON'}
          className={isMuted ? css.ttsBtn : css.ttsBtnActive}
        >
          {isMuted ? <SpeakerOffIcon size={20} /> : <SpeakerOnIcon size={20} />}
        </button>
      )}

      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Messaggio per UNLIM"
        disabled={isLoading}
        autoComplete="off"
        className={css.textInput}
      />

      {/* Report — direct if revealed */}
      {onReport && showReportDirect && (
        <button
          type="button"
          onClick={onReport}
          disabled={isLoading}
          aria-label="Crea report della sessione"
          title="Crea Report"
          className={css.reportBtn}
        >
          <ReportIcon size={20} />
        </button>
      )}

      {/* Overflow menu — shows hidden tools */}
      {hasHiddenTools && (
        <div ref={menuRef} className={css.menuWrap}>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Altre opzioni"
            aria-expanded={menuOpen}
            title="Altre opzioni"
            className={css.circleBtn}
          >
            <MoreIcon size={20} />
          </button>
          {menuOpen && (
            <div className={css.overflowMenu} role="menu">
              {onMicClick && !showMicDirect && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { reveal('mic'); onMicClick(); setMenuOpen(false); }}
                  className={css.menuItem}
                >
                  <MicrophoneIcon size={18} /> Parla
                </button>
              )}
              {onToggleMute && !showTtsDirect && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { reveal('tts'); onToggleMute(); setMenuOpen(false); }}
                  className={css.menuItem}
                >
                  <SpeakerOnIcon size={18} /> Leggi risposte
                </button>
              )}
              {onReport && !showReportDirect && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { reveal('report'); onReport(); setMenuOpen(false); }}
                  className={css.menuItem}
                >
                  <ReportIcon size={18} /> Crea Report
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Send button */}
      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        aria-label="Invia messaggio"
        title="Invia"
        className={text.trim() && !isLoading ? css.sendBtnActive : css.sendBtn}
      >
        {isLoading ? <LoadingIcon size={20} /> : <SendIcon size={20} />}
      </button>

      {/* A11y: loading state announcement */}
      <span role="status" aria-live="polite" className="sr-only">
        {isLoading ? 'UNLIM sta elaborando la risposta...' : ''}
      </span>
    </form>
  );
}
