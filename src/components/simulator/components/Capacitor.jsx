/**
 * ELAB Simulator — Capacitor Component (Book-Parity, Flat Didactic)
 * Electrolytic capacitor: dark cylindrical body, white polarity stripe with
 * minus marks, metallic top cap, + label near positive lead, value text.
 * Book reference Vol2 cap7 pages 63-72: simple cylinder, white stripe,
 * no K-groove drawings / vent markings (those are micro-details not in book).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad redesign 23/02/2026,
 *   book-parity simplification (remove micro-details) 2026-05-23
 */

import React from 'react';
import { registerComponent } from './registry';

function formatCapValue(uF) {
  if (uF >= 1000) return `${(uF / 1000).toFixed(uF % 1000 === 0 ? 0 : 1)}mF`;
  if (uF >= 1) return `${uF}μF`;
  if (uF >= 0.001) return `${(uF * 1000).toFixed(0)}nF`;
  return `${(uF * 1000000).toFixed(0)}pF`;
}

const Capacitor = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, value = 100, id }) => {
  const chargePercent = state.chargePercent || 0;
  const voltage = state.voltage || 0;
  const hasCharge = Math.abs(voltage) > 0.1;
  const uid = `cap-${id}`;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="capacitor" role="img"
       aria-label={`Condensatore ${id}: ${formatCapValue(value)}`}>
      {/* S115: Hit area — 44px minimum on both dimensions for WCAG touch target */}
      <rect x="-22" y="-22" width="44" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Gradient for cylindrical body effect */}
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--elab-hex-3a3a3a)" />
          <stop offset="30%" stopColor="var(--elab-hex-2a2a2a)" />
          <stop offset="70%" stopColor="var(--elab-hex-222222)" />
          <stop offset="100%" stopColor="var(--elab-hex-333333)" />
        </linearGradient>
      </defs>

      {/* Wire leads — vertical alignment for breadboard snap.
          POSITIVE (top, x=0, y=-15) is the lead OPPOSITE to white stripe.
          NEGATIVE (bottom, x=0, y=15) corresponds to white stripe side
          (white stripe = negative per electrolytic convention).
          NOTE: pin labels are 'positive' (top) / 'negative' (bottom). */}
      <line x1="-2" y1="-11" x2="0" y2="-15"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="2" y1="11" x2="0" y2="15"
        stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* + polarity symbol on positive (top) lead side — bigger, more visible.
          Placed RIGHT of body to avoid overlap with white minus-stripe (left). */}
      <text x="10" y="-9" fontSize="5.5" fill="var(--elab-hex-cc0000)" fontWeight="800"
        fontFamily="Arial, sans-serif" textAnchor="middle">+</text>

      {/* Main cylindrical body */}
      <rect x="-8" y="-11" width="16" height="22" rx="3"
        fill={`url(#${uid}-body)`} stroke="var(--elab-hex-111111)" strokeWidth="0.6" />

      {/* Left highlight (cylinder curvature) */}
      <rect x="-7.2" y="-10.2" width="3.5" height="20.4" rx="1.8"
        fill="var(--elab-hex-ffffff)" opacity="0.07" />

      {/* Right edge shadow */}
      <rect x="3.5" y="-10.2" width="3.5" height="20.4" rx="1.8"
        fill="var(--elab-hex-000000)" opacity="0.08" />

      {/* Polarity stripe — white band on negative side (left).
          Book shows clear white stripe with minus marks. */}
      <rect x="-8" y="-11" width="3.4" height="22"
        fill="var(--elab-hex-eaeaea)" opacity="0.85" />

      {/* Minus marks on stripe (didactic polarity indicator) — vertical column */}
      {[-6, -2, 2, 6].map((dy, i) => (
        <text key={i} x="-6.3" y={dy + 1} fontSize="3.6"
          fill="var(--elab-hex-1a1a1a)" fontWeight="700"
          fontFamily="Arial, sans-serif" textAnchor="middle"
          opacity="0.75">
          −
        </text>
      ))}

      {/* Value text on body — single line, didactic readable */}
      <text x="2.5" y="1.5" textAnchor="middle" fontSize="3" fill="var(--elab-hex-eaeaea)"
        fontFamily="Fira Code, monospace" fontWeight="600" letterSpacing="0.15">
        {formatCapValue(value)}
      </text>

      {/* Top face — metallic silver cap (subtle, no K-groove / vent markings) */}
      <ellipse cx="0" cy="-11" rx="8" ry="2.2"
        fill="var(--elab-hex-c8c8c8)" stroke="var(--elab-hex-707070)" strokeWidth="0.4" />

      {/* Bottom face */}
      <ellipse cx="0" cy="11" rx="8" ry="2.2"
        fill="var(--elab-hex-252525)" stroke="var(--elab-hex-111111)" strokeWidth="0.35" />

      {/* Charge level fill — rises from bottom like liquid filling the capacitor */}
      {/* Clip path for charge fill — defined once, outside conditional */}
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect x="-8" y="-11" width="16" height="22" rx="3" />
        </clipPath>
      </defs>
      {chargePercent > 0.01 && (() => {
        const bodyH = 22; // body height
        const fillH = bodyH * Math.min(1, chargePercent); // filled portion
        const fillY = 11 - fillH; // starts from bottom (y=11) going up
        // Color shifts from dim cyan to bright cyan as charge increases
        const fillOpacity = 0.15 + chargePercent * 0.35; // 0.15 → 0.50
        return (
          <>
            <rect x="-8" y={fillY} width="16" height={fillH}
              fill="var(--elab-hex-4fc3f7)" opacity={fillOpacity}
              clipPath={`url(#${uid}-clip)`} />
            {/* Pulsing edge glow at fill level top */}
            {chargePercent > 0.05 && (
              <line x1="-6" y1={fillY + 0.5} x2="6" y2={fillY + 0.5}
                stroke="var(--elab-hex-80deea)" strokeWidth="1.2" opacity="0.6">
                <animate attributeName="opacity"
                  values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
              </line>
            )}
          </>
        );
      })()}

      {/* Voltage readout near component when charging */}
      {chargePercent > 0.01 && chargePercent < 0.99 && (
        <text x="13" y="0" fontSize="3.5" fill="var(--elab-hex-4fc3f7)"
          fontFamily="Fira Code, monospace" fontWeight="600">
          {voltage.toFixed(1)}V
        </text>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-12" y="-18" width="24" height="40" rx="4"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Capacitor.pins = [
  { id: 'positive', label: '+ (Positive)', x: 0, y: -15, type: 'passive' },
  { id: 'negative', label: '\u2212 (Negative)', x: 0, y: 15, type: 'passive' },
];

Capacitor.defaultState = { charge: 0, voltage: 0, current: 0 };

registerComponent('capacitor', {
  component: Capacitor,
  pins: Capacitor.pins,
  defaultState: Capacitor.defaultState,
  category: 'passive',
  label: 'Condensatore',
  icon: '\u{26A1}',
  volumeAvailableFrom: 2,
});

export default Capacitor;
