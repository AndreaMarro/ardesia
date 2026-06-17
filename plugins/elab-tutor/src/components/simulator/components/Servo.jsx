/**
 * ELAB Simulator — Servo Motor Component (Tinkercad-Identical Style)
 * SG90 micro servo: blue body, white rotating horn, 3 colored wires.
 * No labels/angle overlays (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 12/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Servo = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const angle = Math.max(0, Math.min(180, state.angle || 90));
  const isActive = state.active || false;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="servo" role="img"
       aria-label={`Servo ${id}: ${angle}°`}>
      <rect x="-25" y="-25" width="50" height="50" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Mounting tabs (ears) — flat, no highlights */}
      <rect x="-23" y="-4" width="6" height="8" rx="1"
        fill="var(--elab-hex-3570c0)" stroke="var(--elab-hex-2a5fa0)" strokeWidth="0.4" />
      <circle cx="-20" cy="0" r="1.5" fill="#2A5FA0" stroke="var(--elab-navy)" strokeWidth="0.3" />

      <rect x="17" y="-4" width="6" height="8" rx="1"
        fill="var(--elab-hex-3570c0)" stroke="var(--elab-hex-2a5fa0)" strokeWidth="0.4" />
      <circle cx="20" cy="0" r="1.5" fill="#2A5FA0" stroke="var(--elab-navy)" strokeWidth="0.3" />

      {/* Main body — flat blue, no 3D rim lights, no specular */}
      <rect x="-18" y="-13" width="36" height="26" rx="3"
        fill="#3B7DD8" stroke="var(--elab-navy)" strokeWidth="0.6" />

      {/* Shaft housing (top bump) — flat blue, no highlight */}
      <rect x="-6" y="-18" width="12" height="6" rx="2"
        fill="#3570C0" stroke="var(--elab-navy)" strokeWidth="0.4" />

      {/* Rotating horn — flat white, no highlights */}
      <g transform={`translate(0, -18) rotate(${angle - 90})`}>
        {/* Horn arm */}
        <rect x="-2" y="-16" width="4" height="16" rx="1.5"
          fill="var(--elab-hex-f0f0f0)" stroke="var(--elab-hex-b0b0b0)" strokeWidth="0.5" />

        {/* Horn holes */}
        <circle cx="0" cy="-5"  r="1"   fill="var(--elab-hex-d0d0d0)" stroke="var(--elab-hex-a0a0a0)" strokeWidth="0.3" />
        <circle cx="0" cy="-9"  r="1"   fill="var(--elab-hex-d0d0d0)" stroke="var(--elab-hex-a0a0a0)" strokeWidth="0.3" />
        <circle cx="0" cy="-13" r="0.8" fill="var(--elab-hex-d0d0d0)" stroke="var(--elab-hex-a0a0a0)" strokeWidth="0.3" />

        {/* Horn tip */}
        <circle cx="0" cy="-15" r="1.5" fill="var(--elab-hex-e0e0e0)" stroke="var(--elab-hex-b0b0b0)" strokeWidth="0.3" />
      </g>

      {/* Shaft center circle — flat metallic, no specular */}
      <circle cx="0" cy="-18" r="3.5" fill="var(--elab-hex-a0a0a0)"
        stroke="#666" strokeWidth="0.5" />
      <circle cx="0" cy="-18" r="1.5" fill="var(--elab-hex-707070)" stroke="#555" strokeWidth="0.3" />

      {/* Wires (bottom) */}
      {/* Orange (signal) */}
      <line x1="-6" y1="13" x2="-6" y2="24" stroke="var(--elab-hex-ff8c00)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="-7.5" cy="24" r="1.8" fill="var(--elab-hex-ff8c00)" stroke="var(--elab-hex-cc7000)" strokeWidth="0.3" />

      {/* Red (VCC) */}
      <line x1="0" y1="13" x2="0" y2="24" stroke="var(--elab-hex-ef4444)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="0" cy="24" r="1.8" fill="var(--elab-hex-ef4444)" stroke="var(--elab-hex-c62828)" strokeWidth="0.3" />

      {/* Brown/Black (GND) */}
      <line x1="6" y1="13" x2="6" y2="24" stroke="var(--elab-hex-5c3317)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="7.5" cy="24" r="1.8" fill="var(--elab-hex-5c3317)" stroke="var(--elab-hex-3e2210)" strokeWidth="0.3" />

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-26" y="-32" width="52" height="66" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Servo.pins = [
  { id: 'signal', label: 'Signal (SIG)', x: -7.5, y: 24, type: 'digital' },
  { id: 'vcc',    label: 'VCC (+)',      x:   0,  y: 24, type: 'power'   },
  { id: 'gnd',    label: 'GND (-)',      x:  7.5, y: 24, type: 'power'   },
];

Servo.defaultState = { angle: 90, active: false };

registerComponent('servo', {
  component: Servo,
  pins: Servo.pins,
  defaultState: Servo.defaultState,
  category: 'actuators',
  label: 'Servo',
  icon: '\u{1F504}',
  volumeAvailableFrom: 3,
});

export default Servo;
