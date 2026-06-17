/**
 * ELAB Simulator — Phototransistor Component (Tinkercad-Identical Style)
 * Clear-lens 5mm phototransistor: hemispherical dome, metallic base collar,
 * dark sensor chip visible inside, flat spot orientation, two leads.
 * Flat Tinkercad style: 0 gradients, 0 filters, 0 shadows.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 27/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Phototransistor = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const lightLevel = state.lightLevel ?? 0.5;
  const isActive = lightLevel > 0.1;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="phototransistor" role="img"
       aria-label={`Fototransistor ${id}: luce ${Math.round(lightLevel * 100)}%`}
      style={{ cursor: 'pointer' }}
    >
      {/* S115: Hit area — 44px minimum width for WCAG touch target */}
      <rect x="-22" y="-24" width="44" height="48" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Wire leads — vertical, matching original pin positions */}
      <line x1="0" y1="-8" x2="0" y2="-18"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="0" y1="8" x2="0" y2="18"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* Lead labels (tiny) */}
      <text x="-4" y="-14" fontSize="2" fill="#777" fontFamily="Fira Code, monospace" textAnchor="end">C</text>
      <text x="-4" y="16" fontSize="2" fill="#777" fontFamily="Fira Code, monospace" textAnchor="end">E</text>

      {/* Base collar — metallic ring (flat rectangle) */}
      <rect x="-8" y="4" width="16" height="4" rx="1"
        fill="var(--elab-hex-bdbdbd)" stroke="var(--elab-hex-888888)" strokeWidth="0.4" />
      {/* Collar highlight */}
      <rect x="-7" y="4.5" width="14" height="1.5" rx="0.5"
        fill="var(--elab-hex-ffffff)" opacity="0.2" />

      {/* Clear dome body — hemispherical, water-clear LED style */}
      <path
        d="M -7.5 7 L -7.5 0 A 7.5 8 0 0 1 7.5 0 L 7.5 7 Z"
        fill="var(--elab-hex-e8e8e8)" stroke="var(--elab-hex-aaaaaa)" strokeWidth="0.5" />

      {/* Inner translucency (slightly lighter inner area) */}
      <path
        d="M -5.5 6 L -5.5 0.5 A 5.5 6 0 0 1 5.5 0.5 L 5.5 6 Z"
        fill="var(--elab-hex-f0f0f0)" opacity="0.5" />

      {/* Dark sensor chip inside dome */}
      <rect x="-2.5" y="-3" width="5" height="5" rx="0.5"
        fill="var(--elab-hex-2a2a2a)" opacity="0.3" />

      {/* Flat spot (orientation indicator) — left side */}
      <rect x="-7.5" y="0" width="1.2" height="5" rx="0.3"
        fill="var(--elab-hex-999999)" opacity="0.4" />

      {/* Light arrows — incoming light indicators */}
      <line x1="-11" y1="-12" x2="-5" y2="-5"
        stroke="var(--elab-hex-ffd54f)" strokeWidth="0.7" opacity={isActive ? 0.7 : 0.2}
        strokeDasharray="1.5 1.5" />
      <line x1="-8" y1="-14" x2="-3" y2="-7"
        stroke="var(--elab-hex-ffd54f)" strokeWidth="0.7" opacity={isActive ? 0.5 : 0.15}
        strokeDasharray="1.5 1.5" />
      {/* Arrow tips */}
      <path d="M -5 -5 L -6.5 -6.5 M -5 -5 L -6 -3.5"
        stroke="var(--elab-hex-ffd54f)" strokeWidth="0.6" opacity={isActive ? 0.6 : 0.15} fill="none" />

      {/* Active glow when receiving light */}
      {isActive && (
        <ellipse cx="0" cy="-1" rx="5" ry="5"
          fill="var(--elab-hex-ffd54f)" opacity={0.08 + lightLevel * 0.12}>
          <animate attributeName="opacity"
            values={`${0.05 + lightLevel * 0.05};${0.1 + lightLevel * 0.15};${0.05 + lightLevel * 0.05}`}
            dur="2s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-14" y="-22" width="28" height="46" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Phototransistor.pins = [
  { id: 'collector', label: 'Collector (C)', x: 0, y: -18, type: 'analog' },
  { id: 'emitter', label: 'Emitter (E)', x: 0, y: 18, type: 'analog' },
];

Phototransistor.defaultState = { lightLevel: 0.5, current: 0 };

registerComponent('phototransistor', {
  component: Phototransistor,
  pins: Phototransistor.pins,
  defaultState: Phototransistor.defaultState,
  category: 'input',
  label: 'Fototransistor',
  icon: '\u{1F4A1}',
  volumeAvailableFrom: 2,
});

export default Phototransistor;
