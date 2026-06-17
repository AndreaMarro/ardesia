/**
 * ELAB Simulator — NotesPanel
 * Pannello appunti per lo studente, ispirato alla sezione "NOTE" del libro.
 * Testo persistente in localStorage, colori ELAB, stile carta a righe.
 * © Andrea Marro — 20/02/2026
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = [
  { id: 'navy', color: 'var(--elab-navy)', label: 'Blu' },
  { id: 'lime', color: 'var(--elab-lime)', label: 'Verde' },
  { id: 'red', color: 'var(--elab-red)', label: 'Rosso' },
  { id: 'black', color: 'var(--elab-hex-1a1a2e)', label: 'Nero' },
];

const WEIGHTS = [
  { id: 'light', weight: 400, label: 'Leggero' },
  { id: 'normal', weight: 600, label: 'Normale' },
  { id: 'bold', weight: 800, label: 'Grassetto' },
];

const NotesPanel = ({ experimentId, visible, onClose }) => {
  const [text, setText] = useState('');
  const [activeColor, setActiveColor] = useState('navy');
  const [activeWeight, setActiveWeight] = useState('normal');
  const textareaRef = useRef(null);

  const storageKey = experimentId ? `elab_notes_${experimentId}` : null;

  /* Load saved notes */
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setText(saved);
      else setText('');
    } catch { setText(''); }
  }, [storageKey]);

  /* Auto-save on change (debounced by 500ms) */
  const saveTimeout = useRef(null);
  const handleChange = useCallback((e) => {
    const val = e.target.value;
    setText(val);
    if (!storageKey) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try { localStorage.setItem(storageKey, val); } catch { /* quota exceeded */ }
    }, 500);
  }, [storageKey]);

  /* Focus textarea on open */
  useEffect(() => {
    if (visible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [visible]);

  if (!visible) return null;

  const selectedColor = COLORS.find(c => c.id === activeColor)?.color || 'var(--elab-navy)';
  const selectedWeight = WEIGHTS.find(w => w.id === activeWeight)?.weight || 600;

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerIcon}>{'\u{1F4DD}'}</span>
        <span style={styles.headerTitle}>Appunti</span>
        <button onClick={onClose} style={styles.closeBtn}>{'\u{2715}'}</button>
      </div>

      {/* Toolbar: color + weight */}
      <div style={styles.toolbar}>
        <div style={styles.toolGroup}>
          {COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveColor(c.id)}
              title={c.label}
              style={{
                ...styles.colorDot,
                background: c.color,
                boxShadow: activeColor === c.id ? `0 0 0 2px #fff, 0 0 0 4px ${c.color}` : 'none',
              }}
            />
          ))}
        </div>
        <div style={styles.toolDivider} />
        <div style={styles.toolGroup}>
          {WEIGHTS.map(w => (
            <button
              key={w.id}
              onClick={() => setActiveWeight(w.id)}
              title={w.label}
              style={{
                ...styles.weightBtn,
                fontWeight: w.weight,
                background: activeWeight === w.id ? 'var(--color-border, #E5E7EB)' : 'transparent',
                borderColor: activeWeight === w.id ? 'var(--color-text-gray-200, #9CA3AF)' : 'transparent',
              }}
            >
              A
            </button>
          ))}
        </div>
      </div>

      {/* Lined-paper textarea */}
      <div style={styles.paperWrap}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Scrivi i tuoi appunti qui..."
          style={{
            ...styles.textarea,
            color: selectedColor,
            fontWeight: selectedWeight,
          }}
        />
      </div>

      {/* Footer hint */}
      <div style={styles.footer}>
        Salvataggio automatico
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const styles = {
  panel: {
    position: 'absolute',
    top: 60,
    right: 12,
    width: 320,
    maxHeight: '60vh',
    background: 'var(--color-bg, #FFFFFF)',
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    border: '1px solid var(--color-border, #E5E7EB)',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border-light, #F0F0F0)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    minHeight: 48,
  },

  headerIcon: {
    fontSize: 18,
  },

  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    color: 'var(--color-text, #1A1A2E)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: 16,
    color: 'var(--color-text-gray-200, #9CA3AF)',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    lineHeight: 1,
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderBottom: '1px solid var(--color-border-light, #F0F0F0)',
  },

  toolGroup: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },

  toolDivider: {
    width: 1,
    height: 20,
    background: 'var(--color-border, #E5E7EB)',
  },

  colorDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'box-shadow 150ms',
  },

  weightBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    color: 'var(--color-text-gray-600, #374151)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms',
  },

  paperWrap: {
    flex: 1,
    overflow: 'auto',
    background: `repeating-linear-gradient(
      transparent,
      transparent 27px,
      var(--color-border, #E5E7EB) 27px,
      var(--color-border, #E5E7EB) 28px
    )`,
    backgroundPosition: '0 8px',
  },

  textarea: {
    width: '100%',
    minHeight: 200,
    resize: 'vertical',
    border: 'none',
    outline: 'none',
    padding: '12px 16px',
    fontSize: 15,
    lineHeight: '28px',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    background: 'transparent',
  },

  footer: {
    padding: '6px 16px',
    fontSize: 14,
    color: 'var(--color-text-gray-200, #9CA3AF)',
    borderTop: '1px solid var(--color-border-light, #F0F0F0)',
    textAlign: 'center',
  },
};

export default NotesPanel;
