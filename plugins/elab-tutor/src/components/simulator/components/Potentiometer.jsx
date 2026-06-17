/**
 * ELAB Simulator — Potentiometer Component (Tinkercad-Identical Style)
 * Blue rotary potentiometer: dark housing, bright blue face, dense ticks,
 * rotating pointer and metallic pivot. No labels/text (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Potentiometer = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, value = 10000, id }) => {
  const position = state.position || 0.5;
  const angle = -135 + position * 270;
  const uid = `pot-${id}`;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="potentiometer" role="img"
       aria-label={`Potenziometro ${id}: ${Math.round(position * 100)}%`}
      style={{ cursor: 'pointer' }}
    >
      {/* Transparent click area */}
      <circle cx="0" cy="5" r="22" fill="transparent" />

      <defs>
        {/* Radial gradient for blue dial — 3D dome effect */}
        <radialGradient id={`${uid}-dial`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="var(--elab-hex-9ecce8)" />
          <stop offset="50%" stopColor="var(--elab-hex-6ea4ce)" />
          <stop offset="100%" stopColor="var(--elab-hex-3a7aa8)" />
        </radialGradient>
        {/* Radial gradient for housing */}
        <radialGradient id={`${uid}-housing`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="var(--elab-hex-3a4e5c)" />
          <stop offset="100%" stopColor="var(--elab-hex-1c2a34)" />
        </radialGradient>
        {/* Metallic pivot gradient */}
        <radialGradient id={`${uid}-pivot`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="var(--elab-hex-e8e8e8)" />
          <stop offset="50%" stopColor="var(--elab-hex-bdbdbd)" />
          <stop offset="100%" stopColor="var(--elab-hex-7e7e7e)" />
        </radialGradient>
      </defs>

      {/* Wire leads — metallic */}
      <line x1="-7.5" y1="15.2" x2="-7.5" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="0" y1="15.2" x2="0" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7.5" y1="15.2" x2="7.5" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.4" strokeLinecap="round" />

      {/* Housing shadow */}
      <circle cx="0.5" cy="0.8" r="15.6" fill="var(--elab-hex-000000)" opacity="0.1" />

      {/* Housing body with gradient */}
      <circle cx="0" cy="0" r="15.6" fill={`url(#${uid}-housing)`} stroke="var(--elab-hex-141c22)" strokeWidth="0.8" />
      {/* Outer rim — beveled edge */}
      <circle cx="0" cy="0" r="14.6" fill="none" stroke="var(--elab-hex-0f151b)" strokeWidth="1.6" opacity="0.55" />
      {/* Top rim highlight */}
      <path d="M -12 -8 A 14.6 14.6 0 0 1 12 -8" fill="none" stroke="var(--elab-hex-ffffff)" strokeWidth="0.5" opacity="0.08" />

      {/* Blue dial face — radial gradient for dome */}
      <circle cx="0" cy="0" r="11.6" fill={`url(#${uid}-dial)`} stroke="var(--elab-hex-2e6d9c)" strokeWidth="0.6" />

      {/* Dense tick marks (Tinkercad dial look) */}
      {Array.from({ length: 41 }, (_, i) => {
        const a = (-135 + i * (270 / 40)) * Math.PI / 180;
        const isMain = i % 10 === 0;
        const r1 = isMain ? 12.1 : 12.6;
        const r2 = 14.6;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
            stroke={isMain ? 'var(--elab-hex-b8c6d2)' : 'var(--elab-hex-7b8c9a)'}
            strokeWidth={isMain ? 1.0 : 0.55}
            strokeLinecap="round"
            opacity={isMain ? 0.95 : 0.9}
          />
        );
      })}

      {/* Knob indicator — rotates with position */}
      <g transform={`rotate(${angle})`}>
        {/* Position indicator line */}
        <line x1="0" y1="0" x2="0" y2="-9"
          stroke="var(--elab-hex-1f2a33)" strokeWidth="2.0" strokeLinecap="round" />
        {/* Center metallic pivot — gradient circle */}
        <circle cx="0" cy="0" r="3.1" fill={`url(#${uid}-pivot)`} stroke="var(--elab-hex-7e7e7e)" strokeWidth="0.35" />
        {/* Specular highlight on pivot */}
        <circle cx="-0.7" cy="-0.7" r="1.1" fill="var(--elab-hex-ffffff)" opacity="0.35" />
        {/* Rim detail */}
        <circle cx="0" cy="0" r="2.8" fill="none" stroke="var(--elab-hex-ffffff)" strokeWidth="0.2" opacity="0.1" />
      </g>

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-18" y="-22" width="36" height="54" rx="4"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Potentiometer.pins = [
  { id: 'vcc',    label: 'VCC',    x: -7.5, y: 22.5, type: 'power'  },
  { id: 'signal', label: 'Signal', x:   0,  y: 22.5, type: 'analog' },
  { id: 'gnd',    label: 'GND',    x:  7.5, y: 22.5, type: 'power'  },
];

Potentiometer.defaultState = { position: 0.5, resistance: 5000 };

registerComponent('potentiometer', {
  component: Potentiometer,
  pins: Potentiometer.pins,
  defaultState: Potentiometer.defaultState,
  category: 'input',
  label: 'Potenziometro',
  icon: '\u{1F39B}\uFE0F',
  volumeAvailableFrom: 1,
});

export default Potentiometer;
