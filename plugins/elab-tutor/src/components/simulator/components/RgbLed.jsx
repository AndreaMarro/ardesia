/**
 * ELAB Simulator — RGB LED Component (Tinkercad-Identical Style)
 * 5mm common-cathode RGB LED: small dome + 4 long thin wire leads.
 * No labels/text on the component (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const RgbLed = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const r = Math.min(1, Math.max(0, typeof state.red   === 'object' ? (state.red?.brightness   || 0) : (state.r || 0)));
  const g = Math.min(1, Math.max(0, typeof state.green === 'object' ? (state.green?.brightness || 0) : (state.g || 0)));
  const b = Math.min(1, Math.max(0, typeof state.blue  === 'object' ? (state.blue?.brightness  || 0) : (state.b || 0)));
  const isOn = r > 0.01 || g > 0.01 || b > 0.01;
  const mixR = Math.round(r * 255);
  const mixG = Math.round(g * 255);
  const mixB = Math.round(b * 255);
  const mixedColor = `rgb(${mixR}, ${mixG}, ${mixB})`;

  /* Body color: mixed when on, milky grey when off */
  const bodyFill = isOn ? mixedColor : 'var(--elab-hex-dadada)';
  const bodyStroke = isOn ? `rgb(${Math.round(r * 150)},${Math.round(g * 150)},${Math.round(b * 150)})` : 'var(--elab-hex-a3a3a3)';

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="rgb-led" role="img"
       aria-label={`LED RGB ${id}${isOn ? `: rgb(${mixR},${mixG},${mixB})` : ''}`}>
      {/* S115: Hit area — 44px minimum width for WCAG touch target */}
      <rect x="-22" y="-22" width="44" height="54" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Radial glow halo when RGB LED is ON — dramatic Tinkercad-style bloom */}
      {isOn && (
        <>
          <circle cx="0" cy="-5" r="30" fill={mixedColor} opacity={0.18} />
          <circle cx="0" cy="-5" r="22" fill={mixedColor} opacity={0.30} />
          <circle cx="0" cy="-5" r="14" fill={mixedColor} opacity={0.48} />
          <circle cx="0" cy="-5" r="8" fill="var(--elab-hex-ffffff)" opacity={0.35} />
        </>
      )}

      {/* Wire leads — 4 pins, long thin (Tinkercad style) */}
      <line x1="-6.8" y1="0" x2="-11.25" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="-2.3" y1="0" x2="-3.75" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="2.3" y1="0" x2="3.75" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="6.8" y1="0" x2="11.25" y2="22.5"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* RGB LED dome — compact D-shape */}
      <path
        d="M -9.5 0 L -9.5 -1.9 A 9.5 10.5 0 0 1 9.5 -1.9 L 9.5 0 Z"
        fill={bodyFill}
        opacity={isOn ? 0.95 : 0.88}
        stroke={bodyStroke} strokeWidth="0.55"
      />
      {/* Subtle highlight (flat overlay) */}
      <path
        d="M -8.2 0 L -8.2 -1.7 A 8.2 9.4 0 0 1 -2.6 -9.8 L -2.6 0 Z"
        fill="var(--elab-hex-ffffff)" opacity={isOn ? 0.24 : 0.12}
      />
      {/* Bright center dome highlight when ON */}
      {isOn && (
        <path
          d="M -5.5 -1.2 A 5.5 7.2 0 0 1 5.5 -1.2 L 5.5 -0.5 L -5.5 -0.5 Z"
          fill="var(--elab-hex-ffffff)" opacity={0.4}
        />
      )}
      <line x1="-9.5" y1="0" x2="9.5" y2="0" stroke={bodyStroke} strokeWidth="0.55" opacity="0.95" />

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-18" y="-26" width="36" height="60" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

RgbLed.pins = [
  { id: 'red',    label: 'R (Red)',     x: -11.25, y: 22.5, type: 'digital' },
  { id: 'common', label: 'GND (\u2212)', x:  -3.75, y: 22.5, type: 'power'   },
  { id: 'green',  label: 'G (Green)',   x:   3.75, y: 22.5, type: 'digital' },
  { id: 'blue',   label: 'B (Blue)',    x:  11.25, y: 22.5, type: 'digital' },
];

RgbLed.defaultState = {
  r: 0, g: 0, b: 0,
  red:   { on: false, brightness: 0 },
  green: { on: false, brightness: 0 },
  blue:  { on: false, brightness: 0 },
};

registerComponent('rgb-led', {
  component: RgbLed,
  pins: RgbLed.pins,
  defaultState: RgbLed.defaultState,
  category: 'output',
  label: 'LED RGB',
  icon: '\u{1F308}',
  volumeAvailableFrom: 1,
});

export default RgbLed;
