/**
 * ELAB Simulator — Wire Component (Tinkercad-identical)
 * Filo colorato tra due punti — colori vividi come Tinkercad,
 * spessore maggiore, endpoint visibili.
 * Pin & API INVARIATI — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad redesign 21/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const WIRE_COLORS = {
  red:    'var(--elab-hex-dc2626)',
  black:  'var(--elab-hex-1a1a1a)',
  orange: 'var(--elab-hex-ea580c)',
  yellow: 'var(--elab-hex-ca8a04)',
  green:  'var(--elab-hex-16a34a)',
  blue:   'var(--elab-hex-2563eb)',
  purple: 'var(--elab-hex-9333ea)',
  white:  'var(--elab-hex-d4d4d4)',
  brown:  'var(--elab-hex-795548)',
  gray:   'var(--elab-hex-9e9e9e)',
};

function calcWirePath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 30) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const offset = Math.min(dist * 0.15, 20);

  if (Math.abs(dx) > Math.abs(dy)) {
    return `M ${x1} ${y1} Q ${midX} ${y1 + offset} ${x2} ${y2}`;
  } else {
    return `M ${x1} ${y1} Q ${x1 + offset} ${midY} ${x2} ${y2}`;
  }
}

const Wire = ({
  x1 = 0, y1 = 0,
  x2 = 50, y2 = 0,
  color = 'red',
  state = {},
  highlighted = false,
  id
}) => {
  const wireColor = WIRE_COLORS[color] || color;
  const current = state.current || 0;
  const hasFlow = current > 0.0001;
  const path = calcWirePath(x1, y1, x2, y2);

  return (
    <g data-component-id={id} data-type="wire">
      {/* Shadow */}
      <path
        d={path}
        stroke="#00000018"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
        transform="translate(0.8, 0.8)"
      />

      {/* Main wire — thicker for Tinkercad look */}
      <path
        d={path}
        stroke={wireColor}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Subtle highlight */}
      <path
        d={path}
        stroke="var(--elab-hex-ffffff)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.2"
        transform="translate(-0.4, -0.4)"
      />

      {/* Current flow animation */}
      {hasFlow && (
        <circle r="1.5" fill="var(--color-accent, var(--elab-lime))" opacity="0.7">
          <animateMotion
            path={path}
            dur={`${Math.max(0.3, 1 - current * 0.5)}s`}
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Pin endpoints (only when highlighted) */}
      {highlighted && (
        <>
          <circle cx={x1} cy={y1} r="2.2" fill={wireColor} opacity="0.7" />
          <circle cx={x2} cy={y2} r="2.2" fill={wireColor} opacity="0.7" />
        </>
      )}

      {/* Highlight per AI tutoring */}
      {highlighted && (
        <path
          d={path}
          stroke="var(--color-accent, var(--elab-lime))"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          opacity="0.3"
          strokeDasharray="6 3"
        >
          <animate attributeName="stroke-opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
        </path>
      )}
    </g>
  );
};

Wire.pins = [
  { id: 'start', label: 'Start', x: 0, y: 0, type: 'digital' },
  { id: 'end', label: 'End', x: 50, y: 0, type: 'digital' }
];

Wire.defaultState = { current: 0 };

registerComponent('wire', {
  component: Wire,
  pins: Wire.pins,
  defaultState: Wire.defaultState,
  category: 'wire',
  label: 'Filo',
  icon: '\u{1F517}',
  volumeAvailableFrom: 1,
});

export { WIRE_COLORS, calcWirePath };
export default Wire;
