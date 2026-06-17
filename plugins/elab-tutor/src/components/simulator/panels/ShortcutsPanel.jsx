/**
 * ELAB Simulator — ShortcutsPanel
 * Modal overlay listing all keyboard shortcuts, grouped by category.
 * Design: Apple card-style modal with key badges
 * Andrea Marro — 13/02/2026, UI-7 polish 13/02/2026
 */

import React from 'react';

const SHORTCUTS = [
  {
    category: 'Modifica',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    items: [
      { keys: 'Ctrl+Z', desc: 'Annulla' },
      { keys: 'Ctrl+Y', desc: 'Ripeti' },
      { keys: 'Ctrl+Shift+Z', desc: 'Ripeti' },
      { keys: 'Ctrl+C', desc: 'Copia selezione' },
      { keys: 'Ctrl+V', desc: 'Incolla' },
      { keys: 'Ctrl+D', desc: 'Duplica selezione' },
      { keys: 'Canc / Backspace', desc: 'Elimina selezione' },
    ],
  },
  {
    category: 'Navigazione',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2V14M2 8H14" stroke="var(--color-tab-plotter)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 5L8 2L11 5M5 11L8 14L11 11" stroke="var(--color-tab-plotter)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    items: [
      { keys: 'F', desc: 'Adatta alla vista' },
      { keys: 'Rotella mouse', desc: 'Zoom avanti/indietro' },
      { keys: 'Alt + Trascina', desc: 'Sposta la vista (pan)' },
      { keys: 'Tasto centrale', desc: 'Sposta la vista (pan)' },
    ],
  },
  {
    category: 'Circuito',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="var(--color-vol3)" strokeWidth="1.5"/>
        <path d="M8 5V8L10 10" stroke="var(--color-vol3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    items: [
      { keys: 'Spazio', desc: 'Avvia / Pausa simulazione' },
      { keys: 'Ctrl+S', desc: 'Salva circuito' },
      { keys: 'Shift + Click', desc: 'Multi-selezione componenti' },
      { keys: 'Esc', desc: 'Deseleziona / Esci modalit\u00E0 filo' },
      { keys: 'Tasto destro', desc: 'Ruota componente 90\u00B0' },
    ],
  },
];

const ShortcutsPanel = React.memo(function ShortcutsPanel({ onClose }) {
  return (
    <div style={S.backdrop} onClick={onClose} role="button" tabIndex={-1} aria-label="Chiudi pannello scorciatoie">
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="10" rx="2" stroke="var(--color-primary)" strokeWidth="1.5"/>
              <path d="M5 8H6M8 8H9M11 8H12M14 8H15M6 11H14" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={S.headerTitle}>Scorciatoie da Tastiera</span>
          </div>
          <button onClick={onClose} style={S.closeBtn} aria-label="Chiudi scorciatoie">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {SHORTCUTS.map((group) => (
            <div key={group.category} style={S.group}>
              <div style={S.groupHeader}>
                {group.icon}
                <span style={S.groupTitle}>{group.category}</span>
              </div>
              <div style={S.groupItems}>
                {group.items.map((item, i) => (
                  <div key={i} style={S.row}>
                    <div style={S.kbdWrap}>
                      {item.keys.split('+').map((key, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && <span style={S.kbdPlus}>+</span>}
                          <kbd style={S.kbd}>{key.trim()}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                    <span style={S.desc}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          Premi <kbd style={S.kbdSmall}>Ctrl</kbd><span style={S.kbdPlus}>+</span><kbd style={S.kbdSmall}>/</kbd> per aprire/chiudere
        </div>
      </div>
    </div>
  );
});

// ─── Styles (Apple card modal) ───
const S = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.35)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },

  modal: {
    background: 'var(--color-bg, #FFFFFF)',
    borderRadius: 16,
    boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
    width: 440,
    maxWidth: '90vw',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border-light, #F0F0F0)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    minHeight: 48,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  headerTitle: {
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text, #1A1A2E)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-sim-text-muted, #A0A0A0)',
    padding: 8,
    borderRadius: 8,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 18px',
  },

  group: {
    marginBottom: 20,
  },

  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px solid var(--color-border-light, #F0F0F0)',
  },

  groupTitle: {
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-primary, var(--elab-navy))',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 0',
    minHeight: 44,
  },

  kbdWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },

  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 8,
    background: 'var(--color-bg-secondary, #F7F7F8)',
    border: '1px solid var(--color-border, #E5E5E5)',
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-gray-700, #333)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    whiteSpace: 'nowrap',
    minHeight: 28,
  },

  kbdSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 6,
    background: 'var(--color-bg-secondary, #F7F7F8)',
    border: '1px solid var(--color-border, #E5E5E5)',
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-gray-700, #333)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },

  kbdPlus: {
    color: 'var(--color-sim-text-muted, #C0C0C0)',
    fontSize: 14,
    padding: '0 2px',
  },

  desc: {
    fontSize: 14,
    color: 'var(--color-text-gray-400, #666)',
    textAlign: 'right',
  },

  footer: {
    padding: '12px 18px',
    borderTop: '1px solid var(--color-border-light, #F0F0F0)',
    fontSize: 14,
    color: 'var(--color-sim-text-muted, #A0A0A0)',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
};

export default ShortcutsPanel;
