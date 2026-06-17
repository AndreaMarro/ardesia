/**
 * ELAB Simulator — Resistor Component (Tinkercad-Identical Style)
 * Axial resistor: light beige body with subtle highlight, flat color bands,
 * thin neutral wire leads. No value text (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
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
      {/* S115: Hit area — 44px minimum height for WCAG touch target */}
      <rect x="-30" y="-22" width="60" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      <defs>
        {/* Cylindrical body gradient (top-lit) */}
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--elab-hex-f0e0a8)" />
          <stop offset="25%" stopColor="var(--elab-hex-e8d49a)" />
          <stop offset="50%" stopColor="var(--elab-hex-d9c58a)" />
          <stop offset="75%" stopColor="var(--elab-hex-c8b47a)" />
          <stop offset="100%" stopColor="var(--elab-hex-b8a06a)" />
        </linearGradient>
        {/* Metallic end cap gradient */}
        <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--elab-hex-d8d8d8)" />
          <stop offset="40%" stopColor="var(--elab-hex-b7b7b7)" />
          <stop offset="100%" stopColor="var(--elab-hex-8a8a8a)" />
        </linearGradient>
        {/* Wire lead gradient */}
        <linearGradient id={`${uid}-wire`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--elab-hex-b0b0b0)" />
          <stop offset="50%" stopColor="var(--elab-hex-9e9e9e)" />
          <stop offset="100%" stopColor="var(--elab-hex-888888)" />
        </linearGradient>
      </defs>

      {/* Wire leads — metallic gradient */}
      <line x1="-26.25" y1="0" x2="-14.2" y2="0"
        stroke={`url(#${uid}-wire)`} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="14.2" y1="0" x2="26.25" y2="0"
        stroke={`url(#${uid}-wire)`} strokeWidth="1.25" strokeLinecap="round" />

      {/* Body shadow for depth */}
      <rect x="-12.5" y="-4.8" width="26" height="11.2" rx="5.2"
        fill="var(--elab-hex-000000)" opacity="0.06" transform="translate(0.4, 0.6)" />

      {/* End caps — metallic rings with gradient */}
      <ellipse cx="-13" cy="0" rx="1.55" ry="5.6" fill={`url(#${uid}-cap)`} stroke="var(--elab-hex-8a8a8a)" strokeWidth="0.35" />
      <ellipse cx="13"  cy="0" rx="1.55" ry="5.6" fill={`url(#${uid}-cap)`} stroke="var(--elab-hex-8a8a8a)" strokeWidth="0.35" />
      {/* Cap highlights */}
      <ellipse cx="-13.2" cy="-2" rx="0.8" ry="2.5" fill="var(--elab-hex-ffffff)" opacity="0.12" />
      <ellipse cx="12.8" cy="-2" rx="0.8" ry="2.5" fill="var(--elab-hex-ffffff)" opacity="0.12" />

      {/* Body — cylindrical gradient for 3D effect */}
      <rect x="-13" y="-5.6" width="26" height="11.2" rx="5.2"
        fill={`url(#${uid}-body)`} stroke="var(--elab-hex-9c874e)" strokeWidth="0.4" />
      {/* Top specular highlight */}
      <rect x="-11" y="-5.2" width="22" height="3.8" rx="2.5"
        fill="var(--elab-hex-ffffff)" opacity="0.14" />

      {/* Color bands — with subtle curvature shadow */}
      {[
        { bx: -9.1, w: 3.1, fill: bands[0] },
        { bx: -4.2, w: 3.1, fill: bands[1] },
        { bx:  0.8, w: 3.1, fill: bands[2] },
        { bx:  8.1, w: 2.7, fill: bands[3] },
      ].map(({ bx, w, fill }, i) => (
        <g key={i}>
          <rect x={bx} y="-5.45" width={w} height="10.9" rx="0.6"
            fill={fill} opacity={0.92} />
          {/* Band highlight (top) */}
          <rect x={bx + 0.3} y="-5.2" width={w - 0.6} height="2.5" rx="0.4"
            fill="var(--elab-hex-ffffff)" opacity="0.08" />
        </g>
      ))}

      {/* Current flow indicator */}
      {hasFlow && (
        <circle cx="0" cy="0" r="1.2" fill="var(--color-accent, var(--elab-lime))" opacity={0.5}>
          <animate attributeName="cx" values="-13;13" dur="0.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-29" y="-10" width="58" height="20" rx="3"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Resistor.pins = [
  { id: 'pin1', label: 'Pin 1', x: -26.25, y: 0, type: 'digital' },
  { id: 'pin2', label: 'Pin 2', x:  26.25, y: 0, type: 'digital' },
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
