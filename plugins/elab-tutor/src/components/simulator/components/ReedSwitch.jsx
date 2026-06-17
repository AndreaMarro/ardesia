/**
 * ELAB Simulator — Reed Switch Component (Tinkercad-Identical Style, ENRICHED)
 * Glass ampule reed switch: translucent glass body with visible internal
 * reed contacts, metallic end seals, wire leads. Click toggles state.
 * Enhanced with glass reflections, contact detail, magnetic field indicator.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const ReedSwitch = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const isClosed = state.closed || false;
  const uid = `rs-${id}`;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="reed-switch" role="img"
       aria-label={`Reed Switch ${id}${isClosed ? ', chiuso' : ', aperto'}`}
      onClick={() => onInteract && onInteract(id, 'toggle')}
      style={{ cursor: 'pointer' }}
    >
      {/* S115: Hit area — 44px minimum height for WCAG touch target */}
      <rect x="-28" y="-22" width="56" height="44" fill="transparent" pointerEvents="all" />

      {/* Gradient for glass effect */}
      <defs>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--elab-hex-ffffff)" stopOpacity="0.35" />
          <stop offset="40%" stopColor="var(--elab-hex-d4edda)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--elab-hex-a8d5b0)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Wire leads — neutral gray */}
      <line x1="-22.5" y1="0" x2="-16.5" y2="0"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="16.5" y1="0" x2="22.5" y2="0"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* Glass ampule body — translucent green */}
      <rect x="-15.5" y="-5" width="31" height="10" rx="5"
        fill="var(--elab-hex-cfebd4)" fillOpacity="0.45" stroke="var(--elab-hex-6daf7b)" strokeWidth="0.7" />

      {/* Glass gradient overlay */}
      <rect x="-15.5" y="-5" width="31" height="10" rx="5"
        fill={`url(#${uid}-glass)`} />

      {/* Top glass reflection (long highlight stripe) */}
      <rect x="-12" y="-4.2" width="24" height="2.8" rx="1.4"
        fill="var(--elab-hex-ffffff)" opacity="0.22" />

      {/* Bottom glass shadow */}
      <rect x="-12" y="1.5" width="24" height="2.5" rx="1.2"
        fill="var(--elab-hex-000000)" opacity="0.04" />

      {/* End seals — metallic caps */}
      <ellipse cx="-15.5" cy="0" rx="2" ry="4.8"
        fill="var(--elab-hex-c0c0c0)" stroke="var(--elab-hex-888888)" strokeWidth="0.4" />
      <ellipse cx="-15.5" cy="-1" rx="1.4" ry="2"
        fill="var(--elab-hex-ffffff)" opacity="0.15" />

      <ellipse cx="15.5" cy="0" rx="2" ry="4.8"
        fill="var(--elab-hex-c0c0c0)" stroke="var(--elab-hex-888888)" strokeWidth="0.4" />
      <ellipse cx="15.5" cy="-1" rx="1.4" ry="2"
        fill="var(--elab-hex-ffffff)" opacity="0.15" />

      {/* Internal reeds (contact blades) */}
      {/* Left reed — fixed */}
      <rect x="-13" y="-0.8" width={isClosed ? 13.5 : 11} height="1.6" rx="0.4"
        fill="var(--elab-hex-5a5a5a)" stroke="var(--elab-hex-3a3a3a)" strokeWidth="0.25" />
      {/* Reed tip highlight */}
      <rect x="-13" y="-0.6" width={isClosed ? 13.5 : 11} height="0.5" rx="0.25"
        fill="var(--elab-hex-ffffff)" opacity="0.12" />

      {/* Right reed — moves when closed */}
      <rect x={isClosed ? -0.2 : 2.5} y={isClosed ? -0.8 : -1.5}
        width={isClosed ? 13 : 11} height="1.6" rx="0.4"
        fill="var(--elab-hex-5a5a5a)" stroke="var(--elab-hex-3a3a3a)" strokeWidth="0.25"
        transform={isClosed ? '' : 'rotate(-5, 2.5, 0)'} />

      {/* Contact point spark when closed */}
      {isClosed && (
        <circle cx="0.5" cy="0" r="1" fill="var(--elab-hex-ffd54f)" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="0.8s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Gap indicator when open */}
      {!isClosed && (
        <line x1="-1.5" y1="-2" x2="3" y2="2"
          stroke="var(--elab-hex-e53935)" strokeWidth="0.5" opacity="0.3"
          strokeDasharray="1 1" />
      )}

      {/* State label */}
      <text x="0" y="-8" textAnchor="middle" fontSize="3" fill={isClosed ? 'var(--elab-hex-2e7d32)' : 'var(--elab-hex-737373)'}
        fontFamily="Oswald, sans-serif" fontWeight="600" letterSpacing="0.3">
        {isClosed ? 'CHIUSO' : 'APERTO'}
      </text>

      {/* Magnetic field hint (when interacting) */}
      {isClosed && (
        <g opacity="0.3">
          <path d="M -20 -8 Q -25 0 -20 8" fill="none" stroke="var(--elab-hex-1e88e5)" strokeWidth="0.6" strokeDasharray="2 1" />
          <path d="M 20 -8 Q 25 0 20 8" fill="none" stroke="var(--elab-hex-1e88e5)" strokeWidth="0.6" strokeDasharray="2 1" />
        </g>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-26" y="-12" width="52" height="24" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

ReedSwitch.pins = [
  { id: 'pin1', label: 'Pin 1', x: -22.5, y: 0, type: 'digital' },
  { id: 'pin2', label: 'Pin 2', x: 22.5, y: 0, type: 'digital' },
];

ReedSwitch.defaultState = { closed: false };

registerComponent('reed-switch', {
  component: ReedSwitch,
  pins: ReedSwitch.pins,
  defaultState: ReedSwitch.defaultState,
  category: 'input',
  label: 'Reed Switch',
  icon: '',
  volumeAvailableFrom: 1,
});

export default ReedSwitch;
