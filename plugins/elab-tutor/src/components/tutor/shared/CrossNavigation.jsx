// ============================================
// CrossNavigation — Link contestuali tra strumenti
// Connette Simulatore, Manuale, Diario, Detective, etc.
// © Andrea Marro — 2026
// ============================================

import React from 'react';

/**
 * Barra di navigazione incrociata tra strumenti ELAB.
 * Mostra link contestuali basati sull'attivita corrente.
 *
 * @param {Array} links - Array di { icon, label, action }
 * @param {string} style - 'bar' | 'compact' (default: bar)
 */
export default function CrossNavigation({ links, variant = 'bar' }) {
  if (!links || links.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {links.map((link, i) => (
          <button
            key={i}
            onClick={link.action}
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              border: '1px solid var(--elab-border)',
              background: 'white',
              fontSize: '0.875rem',
              color: 'var(--elab-navy)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'var(--elab-transition)'
            }}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="elab-tool__card" style={{
      padding: '12px 16px',
      background: 'rgba(31,61,133,0.02)',
      borderTop: '1px solid var(--elab-border)',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: 'none',
      borderRadius: 0,
      marginBottom: 0,
      boxShadow: 'none'
    }}>
      <div style={{
        fontSize: '0.875rem',
        color: 'var(--elab-muted)',
        fontWeight: 600,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Esplora anche
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {links.map((link, i) => (
          <button
            key={i}
            onClick={link.action}
            className="elab-tool__btn elab-tool__btn--secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.875rem',
              borderRadius: 8,
              minHeight: 44
            }}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}
