/**
 * ELAB Simulator — Resistor Component (Book-Parity, Flat Didactic Style)
 * Axial resistor: light beige cylindrical body, FLAT color bands,
 * thin metallic wire leads. Book reference Vol1 cap6 pages 30-36:
 * flat illustrative style with clear color bands, no chrome/photorealism.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad redesign 23/02/2026,
 *   book-parity flat simplification 2026-05-23
 */

import React from 'react';
import { registerComponent } from './registry';

const BAND_COLORS = {
  0: 'var(--elab-hex-1a1a1a)', 1: 'var(--elab-hex-8b4513)', 2: 'var(--elab-hex-dd0000)', 3: 'var(--elab-hex-ff8c00)', 4: 'var(--elab-hex-ffd700)',
  5: 'var(--elab-hex-00aa00)', 6: 'var(--elab-hex-0044dd)', 7: 'var(--elab-hex-8b00ff)', 8: 'var(--elab-hex-808080)', 9: 'var(--elab-hex-f0f0f0)',
};

const MULTIPLIER_COLORS = {
  1: 'var(--elab-hex-1a1a1a)', 10: 'var(--elab-hex-8b4513)', 100: 'var(--elab-hex-dd0000)', 1000: 'var(--elab-hex-ff8c00)',
  10000: 'var(--elab-hex-ffd700)', 100000: 'var(--elab-hex-00aa00)', 1000000: 'var(--elab-hex-0044dd)',
};

const TOLERANCE_COLORS = { 5: 'var(--elab-hex-daa520)', 10: 'var(--elab-hex-c0c0c0)' };

function calculateBands(value) {
  if (value <= 0) return ['var(--elab-hex-1a1a1a)', 'var(--elab-hex-1a1a1a)', 'var(--elab-hex-1a1a1a)', 'var(--elab-hex-daa520)'];
  const str = String(Math.round(value));
  const d1 = parseInt(str[0]) || 0;
  const d2 = parseInt(str[1]) || 0;
  const multiplier = Math.pow(10, Math.max(0, str.length - 2));
  return [
    BAND_COLORS[d1] || 'var(--elab-hex-1a1a1a)',
    BAND_COLORS[d2] || 'var(--elab-hex-1a1a1a)',
    MULTIPLIER_COLORS[multiplier] || 'var(--elab-hex-1a1a1a)',
    TOLERANCE_COLORS[5],
  ];
}

function formatValue(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M\u03A9`;
  if (value >= 1000)    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k\u03A9`;
  return `${value}\u03A9`;
}

const Resistor = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, value = 470, id }) => {
  const bands = calculateBands(value);
  const current = state.current || 0;
  const hasFlow = current > 0.0001;
  const uid = `res-${id}`;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="resistor" role="img"
       aria-label={`Resistore ${id}: ${formatValue(value)}`}>
      {/* S115: Hit area — 44px minimum for WCAG touch target. */}
      <rect x="-30" y="-22" width="60" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      <defs>
        {/* Subtle cylindrical body gradient — soft top-light only,
            not photorealistic. Book style is mostly flat. */}
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--elab-hex-eddca0)" />
          <stop offset="55%" stopColor="var(--elab-hex-dcc88a)" />
          <stop offset="100%" stopColor="var(--elab-hex-c4b074)" />
        </linearGradient>
      </defs>

      {/* Wire leads — Andrea PM iter 2 "ancora troppo lunghe": pin distance 7→5 col.
          Pin span 37.5px, body 8px, leads 14.75px each side. */}
      <line x1="-18.75" y1="0" x2="-4.0" y2="0"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="4.0" y1="0" x2="18.75" y2="0"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.4" strokeLinecap="round" />

      {/* Body — corpo 8px compatto */}
      <rect x="-4.0" y="-2.5" width="8" height="5" rx="2.5"
        fill={`url(#${uid}-body)`} stroke="var(--elab-hex-9c874e)" strokeWidth="0.4" />

      {/* Color bands — 4 bande E12 fit 8px body */}
      {[
        { bx: -2.8, w: 0.9, fill: bands[0] },
        { bx: -1.4, w: 0.9, fill: bands[1] },
        { bx:  0.0, w: 0.9, fill: bands[2] },
        { bx:  2.1, w: 0.9, fill: bands[3] },
      ].map(({ bx, w, fill }, i) => (
        <rect key={i} x={bx} y="-2.5" width={w} height="5"
          fill={fill} stroke="var(--elab-hex-9c874e)" strokeWidth="0.2"
          strokeOpacity="0.4" />
      ))}

      {/* Current flow indicator */}
      {hasFlow && (
        <circle cx="0" cy="0" r="0.9" fill="var(--color-accent, var(--elab-lime))" opacity={0.5}>
          <animate attributeName="cx" values="-7;7" dur="0.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-29" y="-7" width="58" height="14" rx="3"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

// Pin distance 5 col = 37.5px (Andrea iter 2 "ancora troppo lunghe").
// Topologie ora a2-a7 invece a2-a9.
Resistor.pins = [
  { id: 'pin1', label: 'Pin 1', x: -18.75, y: 0, type: 'digital' },
  { id: 'pin2', label: 'Pin 2', x:  18.75, y: 0, type: 'digital' },
];

Resistor.defaultState = { current: 0, voltage: 0 };

registerComponent('resistor', {
  component: Resistor,
  pins: Resistor.pins,
  defaultState: Resistor.defaultState,
  category: 'passive',
  label: 'Resistore',
  icon: '\u{2393}',
  volumeAvailableFrom: 1,
});

export { calculateBands, formatValue };
export default Resistor;
