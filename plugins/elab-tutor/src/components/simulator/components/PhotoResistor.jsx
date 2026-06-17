/**
 * ELAB Simulator — PhotoResistor (LDR) Component (Tinkercad-Identical Style)
 * LDR disc: light ceramic body with CdS serpentine trace and two thin leads.
 * No labels/value overlays (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const PhotoResistor = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const lightLevel = state.lightLevel ?? 0.5;
  const isLit = lightLevel > 0.1;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="photo-resistor" role="img"
       aria-label={`Fotoresistore ${id}: luce ${Math.round(lightLevel * 100)}%`}
      style={{ cursor: 'pointer' }}
    >
      <rect x="-22" y="-22" width="44" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Light level glow — yellow halo proportional to lightLevel */}
      {isLit && (
        <circle cx="0" cy="0" r="12" fill="var(--elab-hex-ffd54f)" opacity={0.06 + lightLevel * 0.14}>
          <animate attributeName="opacity"
            values={`${0.04 + lightLevel * 0.04};${0.08 + lightLevel * 0.16};${0.04 + lightLevel * 0.04}`}
            dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Ceramic body disc */}
      <circle cx="0" cy="0" r="9.5" fill="var(--elab-hex-d6c08b)"
        stroke="var(--elab-hex-9b8247)" strokeWidth="0.8" />
      <circle cx="-2" cy="-2" r="6" fill="var(--elab-hex-ffffff)" opacity="0.10" />

      {/* CdS serpentine pattern (light-sensitive trace) */}
      <path
        d="M -5 -4.5 L 5 -4.5 L 5 -2.5 L -5 -2.5 L -5 -0.5 L 5 -0.5 L 5 1.5 L -5 1.5 L -5 3.5 L 5 3.5"
        stroke="var(--elab-hex-8a6a2b)"
        strokeWidth="1.15"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />

      {/* Light arrows — incoming light indicators (same style as Phototransistor) */}
      <line x1="-13" y1="-11" x2="-7" y2="-5"
        stroke="var(--elab-hex-ffd54f)" strokeWidth="0.7" opacity={isLit ? 0.6 : 0.15}
        strokeDasharray="1.5 1.5" />
      <line x1="-10" y1="-13" x2="-5" y2="-7"
        stroke="var(--elab-hex-ffd54f)" strokeWidth="0.7" opacity={isLit ? 0.4 : 0.1}
        strokeDasharray="1.5 1.5" />
      {/* Arrow tip */}
      <path d="M -7 -5 L -8.5 -6.5 M -7 -5 L -8 -3.5"
        stroke="var(--elab-hex-ffd54f)" strokeWidth="0.6" opacity={isLit ? 0.5 : 0.1} fill="none" />

      {/* Connection pads */}
      <circle cx="-4" cy="5.5" r="1.5" fill="var(--elab-hex-8a6a2b)" opacity="0.35" />
      <circle cx="4" cy="5.5" r="1.5" fill="var(--elab-hex-8a6a2b)" opacity="0.35" />

      {/* Leads */}
      <line x1="-3.75" y1="9.4" x2="-3.75" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="3.75" y1="9.4" x2="3.75" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-18" y="-18" width="36" height="48" rx="4"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

PhotoResistor.pins = [
  { id: 'pin1', label: 'Pin 1', x: -3.75, y: 22.5, type: 'analog' },
  { id: 'pin2', label: 'Pin 2', x:  3.75, y: 22.5, type: 'analog' },
];

PhotoResistor.defaultState = { lightLevel: 0.5, resistance: 5000 };

registerComponent('photo-resistor', {
  component: PhotoResistor,
  pins: PhotoResistor.pins,
  defaultState: PhotoResistor.defaultState,
  category: 'input',
  label: 'Fotoresistore (LDR)',
  icon: '\u{2600}\uFE0F',
  volumeAvailableFrom: 1,
});

export default PhotoResistor;
