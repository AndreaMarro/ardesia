/**
 * ELAB Simulator — DC Motor Component (Tinkercad-Identical Style)
 * Small DC motor: simple gray body, terminals with red/black wires.
 * No pin/state labels (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const MotorDC = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const isOn = state.on || false;
  const speed = Math.min(1, Math.max(0, state.speed || 0));
  const direction = state.direction || 1; // 1 = CW, -1 = CCW
  /* Rotation duration: slower at low speed, faster at high speed */
  const rotDur = Math.max(0.08, 1.2 - speed * 1.1);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="motor-dc" role="img"
       aria-label={`Motore DC ${id}${isOn ? `, velocità ${Math.round(speed * 100)}%` : ''}`}>
      <rect x="-25" y="-25" width="50" height="50" fill="transparent" pointerEvents="all" onClick={onInteract} />

       {/* Terminal wires (behind body) */}
       <line x1="-6" y1="-8" x2="-6" y2="-16" stroke="var(--elab-hex-8b1b1b)" strokeWidth="2.8" strokeLinecap="round" opacity="0.22" />
       <line x1="-6" y1="-8" x2="-6" y2="-16" stroke="var(--elab-hex-d32f2f)" strokeWidth="2.0" strokeLinecap="round" />

       <line x1="6" y1="-8" x2="6" y2="-16" stroke="var(--elab-hex-000000)" strokeWidth="2.8" strokeLinecap="round" opacity="0.22" />
       <line x1="6" y1="-8" x2="6" y2="-16" stroke="var(--elab-hex-1a1a1a)" strokeWidth="2.0" strokeLinecap="round" />

       {/* Main cylindrical body */}
       <rect x="-13" y="-8" width="26" height="16" rx="2.6"
         fill="var(--elab-hex-9a9a9a)" stroke="var(--elab-hex-747474)" strokeWidth="0.55" />
       <rect x="-12.2" y="-7.2" width="24.4" height="6.2" rx="2.2"
         fill="var(--elab-hex-ffffff)" opacity="0.10" />

      {/* Front end cap — flat metallic rect, no highlight line */}
      <rect x="13" y="-7" width="5" height="14" rx="1.5"
        fill="var(--elab-hex-888888)" stroke="var(--elab-hex-707070)" strokeWidth="0.4" />

      {/* Bearing hole — flat concentric circles */}
      <circle cx="15.5" cy="0" r="3" fill="var(--elab-hex-707070)" stroke="var(--elab-hex-606060)" strokeWidth="0.3" />
      <circle cx="15.5" cy="0" r="2.2" fill="var(--elab-hex-606060)" stroke="var(--elab-hex-505050)" strokeWidth="0.3" />
      <circle cx="15.5" cy="0" r="1.3" fill="var(--elab-hex-404040)" />

      {/* Back end cap */}
      <rect x="-15" y="-6" width="3" height="12" rx="1"
        fill="var(--elab-hex-888888)" stroke="#666" strokeWidth="0.3" />

      {/* Shaft — flat metallic, no highlight line */}
      <rect x="18" y="-1.2" width="8" height="2.4" rx="0.5"
        fill="var(--elab-hex-c0c0c0)" stroke="#999" strokeWidth="0.3" />

      {/* Shaft rotation indicator (animated cross when ON) */}
      {isOn && speed > 0 && (
        <g transform="translate(26, 0)">
          <g>
            <line x1="-3" y1="0" x2="3" y2="0" stroke="var(--elab-hex-d97706)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--elab-hex-d97706)" strokeWidth="1.8" strokeLinecap="round" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={direction >= 0 ? '0' : '360'}
              to={direction >= 0 ? '360' : '0'}
              dur={`${rotDur}s`}
              repeatCount="indefinite"
            />
          </g>
        </g>
      )}



      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-18" y="-22" width="50" height="44" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

MotorDC.pins = [
  { id: 'positive', label: '+ (M)',    x: -7.5, y: -16, type: 'power' },
  { id: 'negative', label: '\u2212 (M)', x:  7.5, y: -16, type: 'power' },
];

MotorDC.defaultState = { on: false, speed: 0, direction: 1 };

registerComponent('motor-dc', {
  component: MotorDC,
  pins: MotorDC.pins,
  defaultState: MotorDC.defaultState,
  category: 'output',
  label: 'Motore DC',
  icon: '\u{2699}\uFE0F',
  volumeAvailableFrom: 2,
});

export default MotorDC;
