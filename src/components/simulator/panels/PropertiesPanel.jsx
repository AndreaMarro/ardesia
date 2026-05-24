/* Andrea Marro — 12/02/2026, UI-7 polish 13/02/2026 */
/**
 * PropertiesPanel — Edit component values (R, C, V, LED color)
 * Design: Apple card-style modal with clean form layout
 * Extracted from NewElabSimulator.jsx
 *
 * Props:
 *   comp: { id, type, value, color }
 *   onValueChange: (id, field, value) => void
 *   onClose: () => void
 */

import React, { useState, useEffect, useRef } from 'react';

const NAVY = 'var(--color-primary)';
const LIME = 'var(--color-accent)';
const VOL3_RED = 'var(--color-vol3)';

const LED_COLORS = ['red', 'green', 'yellow', 'blue', 'white'];
const LED_COLOR_HEX = { red: '#ef4444', green: '#22c55e', yellow: '#eab308', blue: '#3b82f6', white: '#e5e7eb' }; // palette
const LED_LABELS = { red: 'Rosso', green: 'Verde', yellow: 'Giallo', blue: 'Blu', white: 'Bianco' };

const WIRE_COLORS = ['green', 'yellow', 'orange', 'red', 'brown', 'black', 'white', 'blue', 'purple', 'gray'];
// Hex values MUST match Wire.jsx WIRE_COLORS (source of truth for rendering)
const WIRE_COLOR_HEX = { green: '#16a34a', yellow: '#ca8a04', orange: '#ea580c', red: '#dc2626', brown: '#795548', black: '#1a1a1a', white: '#d4d4d4', blue: '#2563eb', purple: '#9333ea', gray: '#9e9e9e' }; // palette
const WIRE_LABELS = { green: 'Verde', yellow: 'Giallo', orange: 'Arancione', red: 'Rosso', brown: 'Marrone', black: 'Nero', white: 'Bianco', blue: 'Blu', purple: 'Viola', gray: 'Grigio' };

const COMP_NAMES = {
  resistor: 'Resistore',
  capacitor: 'Condensatore',
  led: 'LED',
  battery9v: 'Batteria',
  potentiometer: 'Potenziometro',
};

const PropertiesPanel = React.memo(function PropertiesPanel({ comp, onValueChange, onClose }) {
  if (!comp) return null;
  const { type, id, value, color } = comp;

  // Local state per gli input di testo per evitare aggiornamenti a singhiozzo durante la digitazione
  const [localValue, setLocalValue] = useState('');
  const [localUnit, setLocalUnit] = useState('');

  // Floating draggable logic
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStartPos.current.x, y: e.clientY - dragStartPos.current.y });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  // Sincronizza lo stato locale quando il componente cambia
  useEffect(() => {
    if (type === 'resistor' || type === 'potentiometer') {
      const v = value || (type === 'resistor' ? 470 : 10000);
      if (v >= 1e6) { setLocalValue((v / 1e6).toString()); setLocalUnit('M'); }
      else if (v >= 1e3) { setLocalValue((v / 1e3).toString()); setLocalUnit('k'); }
      else { setLocalValue(v.toString()); setLocalUnit(''); }
    } else if (type === 'capacitor') {
      const v = value || 100e-6;
      if (v >= 1e-3) { setLocalValue((v * 1e3).toString()); setLocalUnit('m'); }
      else if (v >= 1e-6) { setLocalValue((v * 1e6).toString()); setLocalUnit('u'); }
      else if (v >= 1e-9) { setLocalValue((v * 1e9).toString()); setLocalUnit('n'); }
      else { setLocalValue((v * 1e12).toString()); setLocalUnit('p'); }
    } else if (type === 'battery9v') {
      setLocalValue((value || 9).toString());
    }
  }, [id, type, value]);

  // Handler unico per l'aggiornamento (scatta onBlur o cambio unità)
  const commitValue = (newValStr, newUnitStr) => {
    const num = parseFloat(newValStr);
    if (isNaN(num)) return; // Ignora valori non validi (es. vuoto)

    let finalValue = num;
    if (type === 'resistor' || type === 'potentiometer') {
      if (newUnitStr === 'M') finalValue = num * 1e6;
      else if (newUnitStr === 'k') finalValue = num * 1e3;
    } else if (type === 'capacitor') {
      // CircuitSolver expects µF — convert all units TO µF
      if (newUnitStr === 'm') finalValue = num * 1e3;      // mF → µF
      else if (newUnitStr === 'u') finalValue = num;        // µF → µF (identity)
      else if (newUnitStr === 'n') finalValue = num * 1e-3; // nF → µF
      else if (newUnitStr === 'p') finalValue = num * 1e-6; // pF → µF
    }

    // Aggiorna lo store genitore
    onValueChange(id, 'value', finalValue);
  };

  const compName = COMP_NAMES[type] || 'Componente';
  const accentColor = type === 'resistor' || type === 'potentiometer' ? LIME
    : type === 'capacitor' ? 'var(--color-vol2)'
      : type === 'battery9v' ? VOL3_RED
        : NAVY;

  return (
    <div
      style={{
        ...S.card,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        zIndex: 9999, // Float above simulator
        boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.3)' : S.card.boxShadow,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{ ...S.header, cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div>
          <div style={S.headerLabel}>{compName}</div>
          <div style={S.headerSub}>Modifica proprietà</div>
        </div>
        <button onClick={onClose} style={S.closeBtn} onPointerDown={(e) => e.stopPropagation()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div style={S.body}>
        {/* Resistor & Potentiometer: Exact value + multiplier */}
        {(type === 'resistor' || type === 'potentiometer') && (
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>{type === 'resistor' ? 'Resistenza' : 'Resistenza Totale'}</label>
            <div style={S.inputRow}>
              <input
                type="number"
                step="any"
                min="0"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => commitValue(localValue, localUnit)}
                // Submit also on Enter
                onKeyDown={(e) => e.key === 'Enter' && commitValue(localValue, localUnit)}
                style={{ ...S.textInput, accentColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
              />
              <select
                value={localUnit}
                onChange={(e) => {
                  const newU = e.target.value;
                  setLocalUnit(newU);
                  commitValue(localValue, newU);
                }}
                style={S.unitSelect}
              >
                <option value="">Ω</option>
                <option value="k">kΩ</option>
                <option value="M">MΩ</option>
              </select>
            </div>
          </div>
        )}

        {/* Capacitor: Exact value + multiplier */}
        {type === 'capacitor' && (
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Capacità</label>
            <div style={S.inputRow}>
              <input
                type="number"
                step="any"
                min="0"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => commitValue(localValue, localUnit)}
                onKeyDown={(e) => e.key === 'Enter' && commitValue(localValue, localUnit)}
                style={{ ...S.textInput, accentColor: 'var(--color-vol2)', borderColor: 'var(--color-vol2)' }}
              />
              <select
                value={localUnit}
                onChange={(e) => {
                  const newU = e.target.value;
                  setLocalUnit(newU);
                  commitValue(localValue, newU);
                }}
                style={S.unitSelect}
              >
                <option value="p">pF</option>
                <option value="n">nF</option>
                <option value="u">µF</option>
                <option value="m">mF</option>
              </select>
            </div>
          </div>
        )}

        {/* Battery 9V (or generic source): exact voltage */}
        {type === 'battery9v' && (
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Voltaggio</label>
            <div style={S.inputRow}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="48"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => commitValue(localValue, '')}
                onKeyDown={(e) => e.key === 'Enter' && commitValue(localValue, '')}
                style={{ ...S.textInput, accentColor: 'var(--color-vol3)', borderColor: 'var(--color-vol3)' }}
              />
              <div style={S.staticUnit}>V</div>
            </div>
          </div>
        )}

        {/* LED: color picker */}
        {type === 'led' && (
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Colore LED</label>
            <div style={S.colorSwatches}>
              {LED_COLORS.map(c => {
                const isSelected = (color || 'red') === c;
                return (
                  <button key={c} onClick={() => onValueChange(id, 'color', c)}
                    style={{
                      ...S.colorSwatch,
                      background: LED_COLOR_HEX[c],
                      border: isSelected ? `3px solid ${NAVY}` : '2px solid var(--color-border)',
                      boxShadow: isSelected ? `0 0 10px ${LED_COLOR_HEX[c]}80` : 'none',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}
                    title={LED_LABELS[c] || c}
                  />
                );
              })}
            </div>
            <div style={{ ...S.valueDisplay, color: 'var(--color-text-gray-400)', fontSize: 14 }}>
              {LED_LABELS[color || 'red']}
            </div>
          </div>
        )}

        {/* Wire: color picker */}
        {type === 'wire' && (
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Colore Filo</label>
            <div style={S.colorSwatches}>
              {WIRE_COLORS.map(c => {
                const isSelected = (color || 'green') === c;
                return (
                  <button key={c} onClick={() => onValueChange(id, 'color', c)}
                    style={{
                      ...S.colorSwatch,
                      background: WIRE_COLOR_HEX[c],
                      border: isSelected ? `3px solid ${NAVY}` : '2px solid var(--color-border)',
                      boxShadow: isSelected ? `0 0 10px ${WIRE_COLOR_HEX[c]}80` : 'none',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    }}
                    title={WIRE_LABELS[c] || c}
                  />
                );
              })}
            </div>
            <div style={{ ...S.valueDisplay, color: 'var(--color-text-gray-400)', fontSize: 14 }}>
              {WIRE_LABELS[color || 'green']}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Styles (Apple card modal) ───
const S = {
  // Backdrop rimosso per permettere interazione col canvas libero

  card: {
    background: 'var(--color-bg, #FFFFFF)',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 16,
    boxShadow: 'var(--shadow-xl, 0 8px 40px rgba(0, 0, 0, 0.15))',
    width: 280,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border, #F0F0F0)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
  },

  headerLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-text, #1A1A2E)',
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },

  headerSub: {
    fontSize: 14,
    color: 'var(--color-text-gray-200, #A0A0A0)',
    marginTop: 2,
  },

  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-gray-200, #A0A0A0)',
    padding: 8,
    borderRadius: 8,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 150ms',
  },

  body: {
    padding: '16px 18px 20px',
  },

  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-gray-400, #666)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  slider: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    cursor: 'pointer',
  },

  valueDisplay: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 700,
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    padding: '8px 0',
    background: 'var(--color-bg-secondary, #F7F7F8)',
    borderRadius: 10,
  },

  inputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },

  textInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    fontWeight: 600,
    color: 'var(--color-text, #1A1A2E)',
    border: '2px solid',
    borderRadius: 8,
    padding: '0 12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },

  unitSelect: {
    height: 44,
    fontSize: 15,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontWeight: 600,
    color: 'var(--color-text-gray-700, #333)',
    border: '2px solid var(--color-border, #E5E5E5)',
    borderRadius: 8,
    padding: '0 8px',
    backgroundColor: 'var(--color-bg-secondary, #FAFAFA)',
    cursor: 'pointer',
    outline: 'none',
  },

  staticUnit: {
    height: 44,
    lineHeight: '40px',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text-gray-400, #666)',
    padding: '0 12px',
    border: '2px solid var(--color-border, #E5E5E5)',
    borderRadius: 8,
    backgroundColor: 'var(--color-bg-secondary, #FAFAFA)',
  },

  colorSwatches: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    padding: '4px 0',
  },

  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    outline: 'none',
  },
};

export default PropertiesPanel;
