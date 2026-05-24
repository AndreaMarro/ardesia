/**
 * ELAB Simulator — ComponentPalette (Compact Grid)
 * Pannello tavolozza componenti con drag & drop e categorie.
 * Design compatto: griglia 2 colonne, tutti i componenti visibili senza scroll.
 * (c) Andrea Marro — 10/02/2026, compact grid redesign 27/02/2026
 */

import React, { useState, useMemo, useCallback } from 'react';
import { getAllComponents } from '../components/registry';

// ---------------------------------------------------------------------------
// Category definitions — order matters for display
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { id: 'power',   label: 'Alimentazione', types: ['battery9v', 'nano-r4'] },
  { id: 'passive', label: 'Passivi',       types: ['resistor', 'capacitor', 'potentiometer', 'diode'] },
  { id: 'semi',    label: 'Semiconduttori', types: ['mosfet-n'] },
  { id: 'output',  label: 'Luci e Suoni',   types: ['led', 'rgb-led', 'buzzer-piezo', 'motor-dc', 'servo', 'lcd16x2'] },
  { id: 'input',   label: 'Sensori e Input', types: ['push-button', 'reed-switch', 'photo-resistor', 'phototransistor'] },
  { id: 'board',   label: 'Schede',        types: ['breadboard-half', 'breadboard-full'] },
  { id: 'tool',    label: 'Strumenti',     types: ['multimeter', 'wire'] },
];

// ---------------------------------------------------------------------------
// Compact component card — memoised for perf
// ---------------------------------------------------------------------------
const ComponentCard = React.memo(function ComponentCard({ type, label, icon }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = useCallback((e) => {
    const payload = JSON.stringify({ type });
    e.dataTransfer.setData('application/elab-component', payload);
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.effectAllowed = 'copy';
    window.__elabDragType = type;
    setDragging(true);
  }, [type]);

  const handleDragEnd = useCallback(() => {
    window.__elabDragType = null;
    setDragging(false);
  }, []);

  // Tap-to-place for iPad: tap selects component, then tap canvas to place
  const handleTapSelect = useCallback(() => {
    window.__elabPendingComponent = type;
    window.dispatchEvent(new CustomEvent('elab-component-selected', { detail: { type } }));
  }, [type]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Aggiungi ${label || type}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTapSelect(); } }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleTapSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...S.card,
        background: hovered && !dragging ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
        borderColor: hovered && !dragging ? 'var(--color-border-hover)' : 'var(--color-border-light, #ECECEC)',
        opacity: dragging ? 0.45 : 1,
        transform: hovered && !dragging ? 'scale(1.02)' : 'scale(1)',
      }}
      title={`Trascina "${label}" sul canvas`}
    >
      <span style={S.cardIcon}>{icon || '\u2022'}</span>
      <span style={S.cardLabel}>{label}</span>
    </div>
  );
});

// ---------------------------------------------------------------------------
// ComponentPalette — compact grid layout, no scroll needed
// ---------------------------------------------------------------------------
const ComponentPalette = ({
  onWireModeToggle,
  wireMode = false,
  volumeFilter = 0,
  experimentComponents = null,
  className = '',
  style = {},
}) => {
  const [showAll, setShowAll] = useState(false);

  const registryMap = useMemo(() => {
    const all = getAllComponents();
    const map = {};
    for (const [key, val] of all.entries()) {
      map[key] = val;
    }
    return map;
  }, []);

  // Set of component types used in the current experiment
  const experimentTypeSet = useMemo(() => {
    if (!experimentComponents || experimentComponents.length === 0) return null;
    return new Set(experimentComponents);
  }, [experimentComponents]);

  // When experimentComponents changes (new experiment selected), reset to filtered view
  React.useEffect(() => {
    setShowAll(false);
  }, [experimentComponents]);

  const isFiltered = experimentTypeSet && !showAll;

  const filteredCategories = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = cat.types
        .map((t) => {
          const reg = registryMap[t];
          return {
            type: t,
            label: reg ? reg.label : t,
            icon: reg ? reg.icon : '',
            volumeAvailableFrom: reg ? (reg.volumeAvailableFrom || 1) : 1,
          };
        })
        .filter((item) => {
          if (volumeFilter > 0 && item.volumeAvailableFrom > volumeFilter) return false;
          if (isFiltered && !experimentTypeSet.has(item.type)) return false;
          return true;
        });
      return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);
  }, [registryMap, volumeFilter, isFiltered, experimentTypeSet]);

  return (
    <div
      className={className}
      style={{ ...S.panel, ...style }}
      data-elab-palette="true"
    >
      {/* Compact header */}
      <div style={S.header}>
        <span style={S.headerTitle}>
          {isFiltered ? 'Componenti esperimento' : 'Componenti'}
        </span>
        <span style={S.headerCount}>
          {filteredCategories.reduce((sum, c) => sum + c.items.length, 0)}
        </span>
      </div>

      {/* Component grid — no scroll */}
      <div style={S.listWrap}>
        {filteredCategories.map((cat) => (
          <div key={cat.id}>
            <div style={S.catDivider}>
              <span style={S.catLabel}>{cat.label}</span>
            </div>
            <div style={S.grid}>
              {cat.items.map((item) => (
                <ComponentCard
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Show all / Show experiment toggle */}
      {experimentTypeSet && (
        <div style={S.filterToggleWrap}>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            style={S.filterToggleBtn}
            aria-label={showAll ? 'Mostra solo componenti esperimento' : 'Mostra tutti i componenti'}
          >
            {showAll ? 'Solo esperimento' : 'Mostra tutti i componenti'}
          </button>
        </div>
      )}

      {/* Wire mode toggle — compact */}
      <div style={S.footer}>
        <button
          onClick={onWireModeToggle}
          style={{
            ...S.wireBtn,
            background: wireMode ? 'var(--color-accent-light)' : 'var(--color-bg)',
            color: wireMode ? 'var(--color-success)' : 'var(--color-text-gray-500)',
            borderColor: wireMode ? 'var(--color-accent)' : 'var(--color-border)',
            fontWeight: wireMode ? 700 : 500,
          }}
        >
          {wireMode ? 'Fili — ATTIVO' : 'Collegamento Fili'}
        </button>
      </div>
    </div>
  );
};

// ─── Compact Styles ───
const S = {
  panel: {
    background: 'var(--color-bg, #FFFFFF)',
    borderRadius: 12,
    border: '1px solid var(--color-border, #E5E5E5)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontSize: 14,
    color: 'var(--color-text-gray-700, #333)',
    overflow: 'hidden',
    userSelect: 'none',
    maxHeight: 'calc(100dvh - 120px)',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px',
    borderBottom: '1px solid var(--color-border-light, #F0F0F0)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    minHeight: 56,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    color: 'var(--color-text, #1A1A2E)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  headerCount: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-sim-text-muted, #737373)',
    background: 'var(--color-border-light, #F0F0F0)',
    borderRadius: 10,
    padding: '2px 7px',
  },

  listWrap: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-sim-scrollbar, #D0D0D0) transparent',
    padding: '2px 0',
  },

  catDivider: {
    padding: '4px 12px',
    background: 'var(--color-bg-secondary, #F7F7F8)',
    borderBottom: '1px solid var(--color-border-light, #F0F0F0)',
  },

  catLabel: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    color: 'var(--color-primary, var(--elab-navy))',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 3,
    padding: '3px 6px',
  },

  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '8px 8px',
    borderRadius: 6,
    border: '1px solid var(--color-border-light, #ECECEC)',
    cursor: 'grab',
    transition: 'all 120ms ease',
    fontSize: 14,
    minHeight: 56,
    overflow: 'hidden',
  },

  cardIcon: {
    width: 16,
    textAlign: 'center',
    fontSize: 14,
    flexShrink: 0,
  },

  cardLabel: {
    flex: 1,
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text-gray-700, #333)',
    lineHeight: 1.2,
  },

  filterToggleWrap: {
    padding: '4px 10px 0',
  },

  filterToggleBtn: {
    width: '100%',
    padding: '5px 0',
    border: '1px dashed var(--color-primary, var(--elab-navy))',
    borderRadius: 8,
    background: 'var(--color-bg-secondary, #FAFAFA)',
    color: 'var(--color-primary, var(--elab-navy))',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 150ms ease',
    minHeight: 36,
  },

  footer: {
    padding: '6px 10px',
    borderTop: '1px solid var(--color-border-light, #F0F0F0)',
  },

  wireBtn: {
    width: '100%',
    padding: '6px 0',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 8,
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontSize: 14,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 150ms ease',
    minHeight: 56,
  },

  emptyMsg: {
    padding: '16px 12px',
    textAlign: 'center',
    color: 'var(--color-sim-text-muted, #A0A0A0)',
    fontSize: 14,
    fontStyle: 'italic',
  },
};

export default ComponentPalette;
