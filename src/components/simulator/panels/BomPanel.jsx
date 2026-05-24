/**
 * ELAB Simulator — BOM Panel (Bill of Materials)
 * Shows a table of all components in the current circuit.
 * Groups identical components and shows quantity + value.
 * Design: Apple card-style floating panel with clean table
 * Andrea Marro — 13/02/2026, UI-7 polish 13/02/2026
 */

import React, { useMemo } from 'react';
import { getComponent } from '../components/registry';

const COMPONENT_LABELS = {
  'led': 'LED',
  'rgb-led': 'LED RGB',
  'resistor': 'Resistenza',
  'push-button': 'Pulsante',
  'potentiometer': 'Potenziometro',
  'photo-resistor': 'Fotoresistenza',
  'phototransistor': 'Fototransistor',
  'buzzer-piezo': 'Buzzer Piezo',
  'capacitor': 'Condensatore',
  'mosfet-n': 'MOSFET N',
  'motor-dc': 'Motore DC',
  'diode': 'Diodo',
  'reed-switch': 'Interruttore a Magnete',
  'battery9v': 'Batteria 9V',
  'nano-r4': 'Arduino Nano R4',
  'breadboard-half': 'Breadboard',
  'breadboard-full': 'Breadboard Grande',
  'multimeter': 'Multimetro',
  'servo': 'Servo',
  'lcd16x2': 'LCD 16x2',
};

function formatValue(type, value) {
  if (value === undefined || value === null) return '\u2014';
  if (type === 'resistor') {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)} M\u03A9`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(value % 1e3 === 0 ? 0 : 1)} k\u03A9`;
    return `${value} \u03A9`;
  }
  if (type === 'capacitor') {
    if (value >= 1e-3) return `${(value * 1e3).toFixed(0)} mF`;
    if (value >= 1e-6) return `${(value * 1e6).toFixed(0)} \u00B5F`;
    if (value >= 1e-9) return `${(value * 1e9).toFixed(0)} nF`;
    return `${(value * 1e12).toFixed(0)} pF`;
  }
  return String(value);
}

const BomPanel = React.memo(function BomPanel({ experiment, onClose }) {
  const bomRows = useMemo(() => {
    if (!experiment || !experiment.components) return [];

    const skipTypes = new Set(['breadboard-half', 'breadboard-full', 'wire']);
    const groups = {};

    for (const comp of experiment.components) {
      if (skipTypes.has(comp.type)) continue;
      const key = `${comp.type}|${comp.value ?? ''}|${comp.color ?? ''}`;
      if (!groups[key]) {
        groups[key] = {
          type: comp.type,
          value: comp.value,
          color: comp.color,
          count: 0,
          ids: [],
        };
      }
      groups[key].count++;
      groups[key].ids.push(comp.id);
    }

    return Object.values(groups).sort((a, b) => {
      const order = { 'battery9v': 0, 'nano-r4': 1 };
      const oa = order[a.type] ?? 10;
      const ob = order[b.type] ?? 10;
      if (oa !== ob) return oa - ob;
      return a.type.localeCompare(b.type);
    });
  }, [experiment]);

  if (!experiment) return null;

  const totalComponents = bomRows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--color-primary)' }}>
            <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 5H11M5 8H11M5 11H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={S.headerTitle}>Lista dei Pezzi</span>
        </div>
        <button onClick={onClose} style={S.closeBtn}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 30 }}></th>
              <th style={{ ...S.th, textAlign: 'left' }}>Componente</th>
              <th style={{ ...S.th, width: 40, textAlign: 'center' }}>Qt.</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Valore</th>
            </tr>
          </thead>
          <tbody>
            {bomRows.map((row, i) => {
              const reg = getComponent(row.type);
              const icon = reg?.icon || '';
              const label = COMPONENT_LABELS[row.type] || reg?.label || row.type;
              const colorLabel = row.color ? ` (${row.color})` : '';
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--color-bg)' : 'var(--color-bg-secondary)' }}>
                  <td style={S.iconCell}>{icon}</td>
                  <td style={S.nameCell}>
                    {label}{colorLabel}
                  </td>
                  <td style={S.qtyCell}>
                    <span style={S.qtyBadge}>{row.count}</span>
                  </td>
                  <td style={S.valueCell}>
                    {formatValue(row.type, row.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <span style={S.footerCount}>{totalComponents}</span> componenti in totale
      </div>
    </div>
  );
});

// ─── Styles (Apple card floating panel — uses design-system tokens) ───
const S = {
  root: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 310,
    maxHeight: 400,
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    boxShadow: 'var(--shadow-lg)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    zIndex: 80,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-secondary)',
    minHeight: 48,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-sim-text-muted)',
    padding: 8,
    borderRadius: 8,
    width: 56,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tableWrap: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },

  th: {
    padding: '8px 10px',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-sim-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky',
    top: 0,
    background: 'var(--color-bg)',
  },

  iconCell: {
    padding: '6px 4px 6px 10px',
    fontSize: 15,
    textAlign: 'center',
    verticalAlign: 'middle',
  },

  nameCell: {
    padding: '6px 6px',
    fontWeight: 600,
    color: 'var(--color-text-gray-700)',
    verticalAlign: 'middle',
    fontSize: 14,
  },

  qtyCell: {
    padding: '6px 4px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },

  qtyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    height: 24,
    padding: '0 6px',
    background: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
  },

  valueCell: {
    padding: '6px 10px 6px 4px',
    textAlign: 'right',
    color: 'var(--color-text-gray-300)',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    verticalAlign: 'middle',
  },

  footer: {
    padding: '10px 16px',
    borderTop: '1px solid var(--color-border)',
    fontSize: 14,
    color: 'var(--color-sim-text-muted)',
    textAlign: 'center',
  },

  footerCount: {
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
};

export default BomPanel;
