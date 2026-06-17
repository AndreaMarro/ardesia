/**
 * ELAB Simulator — Serial Monitor (Enhanced)
 * Terminale seriale per esperimenti Arduino (Vol3)
 * Design: VS Code terminal, modern dark panel with rounded cards
 * (c) Andrea Marro — 12/02/2026, UI-7 polish 13/02/2026
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200];
const LINE_ENDINGS = [
  { label: 'Nessuno', value: '' },
  { label: 'NL', value: '\n' },
  { label: 'CR', value: '\r' },
  { label: 'Entrambi', value: '\r\n' },
];

const SerialMonitor = ({ serialOutput = '', onSerialInput, onClear, isRunning = false, onBaudRateChange, baudMismatch = false, showTimestamps = false, onToggleTimestamps, onSendToUNLIM }) => {
  const [inputText, setInputText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [baudRate, setBaudRate] = useState(9600);
  const [lineEnding, setLineEnding] = useState('\n');
  const outputRef = useRef(null);

  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [serialOutput, autoScroll]);

  const handleSend = useCallback(() => {
    if (inputText.trim() && onSerialInput) {
      onSerialInput(inputText + lineEnding);
      setInputText('');
    }
  }, [inputText, onSerialInput, lineEnding]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  return (
    <div style={S.panel}>
      {/* Header with controls */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={{
            ...S.statusDot,
            background: isRunning ? 'var(--color-accent)' : 'var(--color-text-gray-300)',
            boxShadow: isRunning ? '0 0 6px rgba(124,179,66,0.5)' : 'none',
          }} />
          <span style={S.headerTitle}>Monitor Seriale</span>
        </div>
        <div style={S.controls}>
          {/* Baud rate */}
          <select
            value={baudRate}
            onChange={(e) => {
              const newBaud = Number(e.target.value);
              setBaudRate(newBaud);
              if (onBaudRateChange) onBaudRateChange(newBaud);
            }}
            style={{
              ...S.select,
              ...(baudMismatch ? { borderColor: 'var(--color-vol2)', color: 'var(--color-vol2-text)' } : {}),
            }}
            title={baudMismatch ? 'Baud rate diverso dallo sketch!' : 'Baud rate'}
          >
            {BAUD_RATES.map(rate => (
              <option key={rate} value={rate}>{rate}</option>
            ))}
          </select>

          {/* Line ending */}
          <select
            value={lineEnding}
            onChange={(e) => setLineEnding(e.target.value)}
            style={S.select}
            title="Fine riga"
          >
            {LINE_ENDINGS.map(le => (
              <option key={le.label} value={le.value}>{le.label}</option>
            ))}
          </select>

          {/* Timestamp toggle */}
          {onToggleTimestamps && (
            <button
              onClick={onToggleTimestamps}
              style={{
                ...S.iconBtn,
                background: showTimestamps ? 'rgba(124, 179, 66, 0.15)' : 'transparent',
                color: showTimestamps ? 'var(--color-accent)' : 'var(--color-text-gray-200)',
                borderColor: showTimestamps ? 'rgba(124,179,66,0.3)' : 'var(--color-editor-border)',
              }}
              title={showTimestamps ? 'Timestamp ON' : 'Timestamp OFF'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(prev => !prev)}
            style={{
              ...S.iconBtn,
              background: autoScroll ? 'rgba(124, 179, 66, 0.15)' : 'transparent',
              color: autoScroll ? 'var(--color-accent)' : 'var(--color-text-gray-200)',
              borderColor: autoScroll ? 'rgba(124,179,66,0.3)' : 'var(--color-editor-border)',
            }}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M5 10L8 13L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Clear button */}
          <button onClick={onClear} style={S.iconBtn} title="Cancella output">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* UNLIM button */}
          {onSendToUNLIM && serialOutput.trim() && (
            <button
              onClick={() => onSendToUNLIM(`L'output del Serial Monitor è:\n${serialOutput.slice(-500)}\n\nPuoi spiegarmi cosa significano questi dati?`)}
              style={{
                ...S.iconBtn,
                background: 'var(--color-primary-subtle, rgba(30,77,140,0.15))',
                color: 'var(--color-accent)',
                borderColor: 'rgba(124,179,66,0.3)',
                fontWeight: 700,
                fontSize: 14,
              }}
              title="Chiedi a UNLIM di spiegare l'output"
            >
              U
            </button>
          )}
        </div>
      </div>

      {/* Baud rate mismatch inline warning */}
      {baudMismatch && (
        <div style={S.baudWarning}>
          <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, fontWeight: 700, color: 'var(--color-vol2-text)' }}>{'\u26A0'}</span>
          <span>Il baud rate selezionato non corrisponde a quello dello sketch. Cambia il baud rate per leggere i dati correttamente.</span>
        </div>
      )}

      {/* Terminal output */}
      <div ref={outputRef} style={{ ...S.terminal, opacity: isRunning ? 1 : 0.5, transition: 'opacity 200ms' }}>
        {!isRunning && !serialOutput && (
          <div style={S.disabledMessage}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8, opacity: 0.6 }}>
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 9L10 12L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="13" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Premi Play per vedere i dati</span>
            <span style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }}>Il Serial Monitor mostra i messaggi inviati da Arduino con Serial.println()</span>
          </div>
        )}
        <pre style={S.terminalPre}>
          {serialOutput
            ? (showTimestamps
              ? serialOutput.split('\n').map((line, i, arr) => {
                  if (i === arr.length - 1 && line === '') return '';
                  const now = new Date();
                  const ts = `[${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}] `;
                  return ts + line;
                }).join('\n')
              : serialOutput)
            : (isRunning ? '> In attesa di dati da Arduino...\n> (Se il codice usa Serial.println(), i dati appariranno qui)' : '')}
        </pre>
      </div>

      {/* Input bar */}
      <div style={S.inputBar}>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Invia comando..."
          style={S.input}
          disabled={!isRunning}
        />
        <button
          onClick={handleSend}
          disabled={!isRunning || !inputText.trim()}
          style={{
            ...S.sendBtn,
            opacity: isRunning && inputText.trim() ? 1 : 0.4,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
            <path d="M2 8L13 3L10 8L13 13L2 8Z" fill="currentColor"/>
          </svg>
          Invia
        </button>
      </div>
    </div>
  );
};

// ─── Styles (VS Code terminal) ───
const S = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    background: 'var(--color-code-bg, #1E1E2E)',
    borderRadius: '0 0 10px 10px',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    borderBottom: '1px solid var(--color-code-border, #313244)',
    background: 'var(--color-code-header, #181825)',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 40,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    transition: 'all 300ms',
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-code-text, #CDD6F4)',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    whiteSpace: 'nowrap',
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  select: {
    background: 'var(--color-code-border, #313244)',
    border: '1px solid var(--color-code-gutter, #45475A)',
    borderRadius: 6,
    color: 'var(--color-code-text, #CDD6F4)',
    fontSize: 14,
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    padding: '5px 8px',
    outline: 'none',
    cursor: 'pointer',
    minHeight: 36,
  },

  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--color-editor-border, #4B5563)',
    borderRadius: 6,
    color: 'var(--color-text-gray-200, #9CA3AF)',
    fontSize: 14,
    padding: 0,
    cursor: 'pointer',
    lineHeight: 1,
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms',
  },

  terminal: {
    flex: 1,
    overflow: 'auto',
    padding: '12px 14px',
    minHeight: 56,
    background: 'var(--color-code-bg, #1E1E2E)',
    position: 'relative',
  },

  baudWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    background: 'rgba(232, 148, 28, 0.12)',
    borderBottom: '1px solid rgba(232, 148, 28, 0.3)',
    color: 'var(--color-vol2-text, #996600)', /* G42: WCAG AA */
    fontSize: 14,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    lineHeight: 1.4,
  },

  disabledMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    color: 'var(--color-text-gray-200, #9CA3AF)',
    fontSize: 14,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    textAlign: 'center',
    lineHeight: 1.5,
  },

  terminalPre: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    color: 'var(--elab-hex-b8f0b8)',
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    letterSpacing: '0.02em',
    textShadow: '0 0 1px rgba(184, 240, 184, 0.3)',
  },

  inputBar: {
    display: 'flex',
    gap: 6,
    padding: '8px 10px',
    borderTop: '1px solid var(--color-code-border, #313244)',
    background: 'var(--color-code-header, #181825)',
  },

  input: {
    flex: 1,
    background: 'var(--color-code-border, #313244)',
    border: '1px solid var(--color-code-gutter, #45475A)',
    borderRadius: 8,
    color: 'var(--color-code-text, #CDD6F4)',
    padding: '8px 12px',
    fontSize: 14,
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    outline: 'none',
    minHeight: 36,
    transition: 'border-color 200ms',
  },

  sendBtn: {
    background: 'var(--color-accent, var(--elab-lime))',
    border: 'none',
    borderRadius: 8,
    color: 'var(--color-text-inverse, white)',
    padding: '6px 14px',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontWeight: 600,
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 150ms',
  },
};

export default SerialMonitor;
