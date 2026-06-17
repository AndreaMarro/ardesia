/* Andrea Marro — 12/02/2026 */
/**
 * LdrOverlay — Light level slider for LDR (photo-resistor) interaction
 * Extracted from NewElabSimulator.jsx
 *
 * Props:
 *   value: number (0-1)
 *   onValueChange: (value: number) => void
 *   onClose: () => void
 */

import React from 'react';
import ovStyles from '../overlays.module.css';

const LdrOverlay = React.memo(function LdrOverlay({ value, onValueChange, onClose }) {
  const luxApprox = Math.round(value * 1000);
  const iconBrightness = 0.3 + value * 0.7;

  return (
    <div className={ovStyles.backdrop} onClick={onClose}>
      <div className={ovStyles.card} onClick={(e) => e.stopPropagation()}>
        <div className={ovStyles.overlayHeader}>
          <span className={ovStyles.label}>Foto-Resistore (LDR)</span>
          <button onClick={onClose} className={ovStyles.closeBtn}>x</button>
        </div>

        {/* Sun icon */}
        <div className={ovStyles.knobContainer}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Rays */}
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45) * Math.PI / 180;
              const r1 = 45 + value * 10;
              const r2 = 61 + value * 13;
              return (
                <line key={i}
                  x1={80 + r1 * Math.cos(a)} y1={80 + r1 * Math.sin(a)}
                  x2={80 + r2 * Math.cos(a)} y2={80 + r2 * Math.sin(a)}
                  stroke={`rgba(255, 193, 7, ${iconBrightness})`}
                  strokeWidth="4" strokeLinecap="round"
                />
              );
            })}
            {/* Sun body */}
            <circle cx="80" cy="80" r="35"
              fill={`rgba(255, 235, 59, ${iconBrightness})`}
              stroke="var(--elab-hex-ffc107)" strokeWidth="3" />
          </svg>
        </div>

        <div className={ovStyles.valueRow}>
          <span style={{ fontSize: 15, color: 'var(--color-text-gray-300, #737373)', width: 36 }}>Buio</span>
          <input
            type="range"
            min="0"
            max="1000"
            value={Math.round(value * 1000)}
            onChange={(e) => onValueChange(parseInt(e.target.value) / 1000)}
            aria-label="Regola livello luce fotoresistore"
            style={{ flex: 1, accentColor: 'var(--elab-hex-ffc107)', touchAction: 'manipulation' }}
          />
          <span style={{ fontSize: 15, color: 'var(--color-text-gray-300, #737373)', width: 36, textAlign: 'right' }}>Luce</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 15, color: 'var(--color-text-gray-400, #666)', padding: '0 0 6px' }}>
          ~{luxApprox} lux
        </div>
      </div>
    </div>
  );
});

export default LdrOverlay;
