/**
 * ELAB Simulator — Diode Component (Tinkercad-Identical Style, ENRICHED)
 * Signal diode (1N4148 / 1N4007 style): dark epoxy body, silver cathode band,
 * metallic end caps, thin wire leads, subtle highlight and shadow.
 * Matches Resistor.jsx quality level for visual consistency.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Diode = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const conducting = state.conducting || false;
  const current = state.current || 0;
  const hasFlow = current > 0.0001;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="diode" role="img"
       aria-label={`Diodo ${id}${conducting ? ', conduce' : ''}`}>
      {/* S115: Hit area — 44px minimum height for WCAG touch target */}
      <rect x="-24" y="-22" width="48" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Wire leads — thin neutral gray (Tinkercad style) */}
      <line x1="-20" y1="0" x2="-12.5" y2="0"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="12.5" y1="0" x2="20" y2="0"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* End caps — small metallic rings at body-wire junction */}
      <ellipse cx="-11.5" cy="0" rx="1.3" ry="4.8" fill="var(--elab-hex-b7b7b7)" stroke="var(--elab-hex-8a8a8a)" strokeWidth="0.35" />
      <ellipse cx="11.5" cy="0" rx="1.3" ry="4.8" fill="var(--elab-hex-b7b7b7)" stroke="var(--elab-hex-8a8a8a)" strokeWidth="0.35" />

      {/* Body — dark epoxy glass, slightly rounded */}
      <rect x="-11.5" y="-4.8" width="23" height="9.6" rx="4.8"
        fill="var(--elab-hex-2f2f2f)" stroke="var(--elab-hex-111111)" strokeWidth="0.55" />

      {/* Top highlight (subtle reflection) */}
      <rect x="-10.5" y="-4.2" width="10" height="3.2" rx="1.6"
        fill="var(--elab-hex-ffffff)" opacity="0.10" />

      {/* Bottom shadow */}
      <rect x="-10.5" y="0.8" width="21" height="3.6" rx="1.8"
        fill="var(--elab-hex-000000)" opacity="0.06" />

      {/* Cathode band — silver/white stripe near cathode end */}
      <rect x="5.8" y="-4.8" width="3.6" height="9.6" rx="0"
        fill="var(--elab-hex-d6d6d6)" opacity="0.88" />
      {/* Band edge highlight */}
      <rect x="5.8" y="-4.8" width="0.8" height="9.6"
        fill="var(--elab-hex-ffffff)" opacity="0.15" />

      {/* Polarity arrow symbol (subtle, inside body) */}
      <path d="M -3 -2.5 L 1 0 L -3 2.5 Z"
        fill="none" stroke="var(--elab-hex-555555)" strokeWidth="0.5" opacity="0.3" />
      <line x1="1" y1="-2.5" x2="1" y2="2.5"
        stroke="var(--elab-hex-555555)" strokeWidth="0.5" opacity="0.3" />

      {/* Current flow indicator */}
      {hasFlow && (
        <circle cx="0" cy="0" r="1.2" fill="var(--color-accent, var(--elab-lime))" opacity={0.5}>
          <animate attributeName="cx" values="-11;11" dur="0.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Conducting glow — enhanced visibility */}
      {conducting && (
        <>
          <rect x="-13" y="-7" width="26" height="14" rx="7"
            fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="1.5" opacity="0.6">
            <animate attributeName="opacity" values="0.4;0.75;0.4" dur="1.2s" repeatCount="indefinite" />
          </rect>
          <rect x="-11.5" y="-4.8" width="23" height="9.6" rx="4.8"
            fill="var(--color-accent, var(--elab-lime))" opacity="0.18">
            <animate attributeName="opacity" values="0.10;0.25;0.10" dur="1.2s" repeatCount="indefinite" />
          </rect>
        </>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-24" y="-10" width="48" height="20" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Diode.pins = [
  { id: 'anode', label: 'Anode (A)', x: -20, y: 0, type: 'digital' },
  { id: 'cathode', label: 'Cathode (K)', x: 20, y: 0, type: 'digital' },
];

Diode.defaultState = { conducting: false, current: 0 };

registerComponent('diode', {
  component: Diode,
  pins: Diode.pins,
  defaultState: Diode.defaultState,
  category: 'passive',
  label: 'Diodo',
  icon: '\u{25B6}',
  volumeAvailableFrom: 2,
});

export default Diode;
