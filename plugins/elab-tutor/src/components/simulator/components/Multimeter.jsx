/**
 * ELAB Simulator — Multimeter Component (Fritzing-identical)
 * Digital multimeter: 3D yellow body with depth shading, LCD display,
 * metallic mode selector knob, draggable probe tips with snap detection.
 * Matches Fritzing illustrations in ELAB volumes.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, book-style redesign 22/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Multimeter = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, onProbeMove, id, probePositions, probeSnapped }) => {
  const reading = state.reading || 0;
  const mode = state.mode || 'voltage';
  const uid = `mm-${id}`;

  // Probe tip positions: relative to component origin (0,0)
  const negProbe = probePositions?.negative || { x: -6, y: 55 };
  const posProbe = probePositions?.positive || { x: 6, y: 55 };

  // Probe drag handler factory
  const handleProbeDown = (probeId, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onProbeMove) onProbeMove(probeId, 'start', e);
  };

  const unit = mode === 'voltage' ? 'V' : mode === 'current' ? 'mA' : 'Ω';
  const displayValue = reading >= 1000 ? `${(reading / 1000).toFixed(2)}k` : reading.toFixed(2);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="multimeter" role="img"
       aria-label={`Multimetro ${id}: ${displayValue}${unit}`}>
      {/* Main body — Fritzing 3D */}
      <rect x="-18" y="-25" width="36" height="50" rx="4"
        fill="var(--elab-hex-ffd700)" stroke="var(--elab-hex-b8860b)" strokeWidth="0.8" />


      {/* LCD Display — Fritzing 3D recessed */}
      <rect x="-14.5" y="-22.5" width="29" height="15" rx="2"
        fill="#111" stroke="var(--elab-hex-0a0a0a)" strokeWidth="0.6" />
      <rect x="-14" y="-22" width="28" height="14" rx="1.5"
        fill="var(--elab-hex-2d3748)" />

      {/* LCD reading */}
      <text x="-2" y="-12" textAnchor="middle" fontSize="8"
        fill="var(--color-accent, var(--elab-lime))" fontFamily="Fira Code, monospace" fontWeight="bold">
        {displayValue}
      </text>
      <text x="12" y="-12" fontSize="5" fill="var(--color-accent, var(--elab-lime))"
        fontFamily="Fira Code, monospace" opacity="0.9">
        {unit}
      </text>

      {/* Mode selector ring markings */}
      {['V', 'Ω', 'A'].map((label, i) => {
        const a = (-90 + i * 120) * Math.PI / 180;
        const isActive = (mode === 'voltage' && label === 'V')
          || (mode === 'resistance' && label === 'Ω')
          || (mode === 'current' && label === 'A');
        return (
          <text key={label}
            x={Math.cos(a) * 12} y={3 + Math.sin(a) * 12}
            textAnchor="middle" fontSize="3.5"
            fill={isActive ? 'var(--color-accent, var(--elab-lime))' : '#555'}
            fontFamily="Open Sans, sans-serif" fontWeight="bold">
            {label}
          </text>
        );
      })}

      {/* Knob rotation indicator */}
      {(() => {
        const modeAngle = mode === 'voltage' ? -90 : mode === 'resistance' ? 30 : 150;
        const rad = modeAngle * Math.PI / 180;
        return (
          <line x1="0" y1="2" x2={Math.cos(rad) * 6} y2={2 + Math.sin(rad) * 6}
            stroke="#EEE" strokeWidth="1.2" strokeLinecap="round" />
        );
      })()}

      {/* Selector knob — Fritzing metallic 3D */}
      <circle cx="0" cy="2" r="8"
        fill="var(--elab-hex-a0a0a0)" stroke="#444" strokeWidth="0.5"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          if (onInteract) onInteract(id, 'cycle-mode');
        }}
      />

      {/* Knob label */}
      <text x="0" y="5" textAnchor="middle" fontSize="5" fill="#EEE"
        fontFamily="Open Sans, sans-serif" fontWeight="bold" pointerEvents="none">
        {mode === 'voltage' ? 'V' : mode === 'current' ? 'A' : 'Ω'}
      </text>

      {/* Probe ports — Fritzing 3D recessed */}
      {/* COM port (black) */}
      <circle cx="-7.5" cy="20" r="3" fill="#111" stroke="var(--elab-hex-0a0a0a)" strokeWidth="0.5" />
      <circle cx="-7.5" cy="20" r="2.5" fill="#222" stroke="#111" strokeWidth="0.3" />
      <circle cx="-7.5" cy="20" r="1.5" fill="#333" />
      {/* V/Ω port (red) */}
      <circle cx="7.5" cy="20" r="3" fill="var(--elab-hex-8b0000)" stroke="var(--elab-hex-5c0000)" strokeWidth="0.5" />
      <circle cx="7.5" cy="20" r="2.5" fill="var(--elab-hex-c62828)" stroke="var(--elab-hex-b71c1c)" strokeWidth="0.3" />
      <circle cx="7.5" cy="20" r="1.5" fill="var(--elab-hex-ef4444)" />

      {/* Port labels */}
      <text x="-7.5" y="16" textAnchor="middle" fontSize="2.5" fill="var(--elab-hex-737373)"
        fontFamily="Fira Code, monospace">COM</text>
      <text x="7.5" y="16" textAnchor="middle" fontSize="2.5" fill="var(--elab-hex-c62828)"
        fontFamily="Fira Code, monospace">V/Ω</text>

      {/* Black probe wire (COM) */}
      <path
        d={`M -6 22.5 Q ${(-6 + negProbe.x) / 2 - 4} ${(22.5 + negProbe.y) / 2} ${negProbe.x} ${negProbe.y - 8}`}
        stroke="#333" strokeWidth="1.8" fill="none" strokeLinecap="round"
        pointerEvents="none"
      />
      {/* Black probe handle + tip */}
      <g
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => handleProbeDown('negative', e)}
        onTouchStart={(e) => { e.stopPropagation(); handleProbeDown('negative', e); }}
      >
        {/* Snap glow when probe is over a valid pin */}
        {probeSnapped?.negative && (
          <circle cx={negProbe.x} cy={negProbe.y} r="8" fill="var(--color-accent, var(--elab-lime))" opacity="0.3">
            <animate attributeName="r" values="8;11;8" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <line x1={negProbe.x} y1={negProbe.y - 8} x2={negProbe.x} y2={negProbe.y - 1}
          stroke="#333" strokeWidth="1.2" pointerEvents="none" />
        <circle cx={negProbe.x} cy={negProbe.y} r="2.5" fill="#222" stroke="#111" strokeWidth="0.3" />
        <line x1={negProbe.x} y1={negProbe.y} x2={negProbe.x} y2={negProbe.y + 2}
          stroke="#999" strokeWidth="0.8" pointerEvents="none" />
        {/* Invisible hit area — touch-friendly 24px diameter */}
        <circle cx={negProbe.x} cy={negProbe.y} r="12" fill="transparent" />
      </g>

      {/* Red probe wire (V/Ohm) */}
      <path
        d={`M 6 22.5 Q ${(6 + posProbe.x) / 2 + 4} ${(22.5 + posProbe.y) / 2} ${posProbe.x} ${posProbe.y - 8}`}
        stroke="var(--elab-hex-dc2626)" strokeWidth="1.8" fill="none" strokeLinecap="round"
        pointerEvents="none"
      />
      {/* Red probe handle + tip */}
      <g
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => handleProbeDown('positive', e)}
        onTouchStart={(e) => { e.stopPropagation(); handleProbeDown('positive', e); }}
      >
        {/* Snap glow when probe is over a valid pin */}
        {probeSnapped?.positive && (
          <circle cx={posProbe.x} cy={posProbe.y} r="8" fill="var(--color-accent, var(--elab-lime))" opacity="0.3">
            <animate attributeName="r" values="8;11;8" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        <line x1={posProbe.x} y1={posProbe.y - 8} x2={posProbe.x} y2={posProbe.y - 1}
          stroke="var(--elab-hex-dc2626)" strokeWidth="1.2" pointerEvents="none" />
        <circle cx={posProbe.x} cy={posProbe.y} r="2.5" fill="var(--elab-hex-c62828)" stroke="var(--elab-hex-b71c1c)" strokeWidth="0.3" />
        <line x1={posProbe.x} y1={posProbe.y} x2={posProbe.x} y2={posProbe.y + 2}
          stroke="#999" strokeWidth="0.8" pointerEvents="none" />
        {/* Invisible hit area — touch-friendly 24px diameter */}
        <circle cx={posProbe.x} cy={posProbe.y} r="12" fill="transparent" />
      </g>

      {/* AI Tutoring Highlight */}
      {highlighted && (
        <rect x="-22" y="-28" width="44" height="78" rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Multimeter.pins = [
  { id: 'probe-negative', label: 'COM (−)', x: -7.5, y: 45, type: 'passive' },
  { id: 'probe-positive', label: 'V/Ω (+)', x: 7.5, y: 45, type: 'passive' },
];

Multimeter.defaultState = { reading: 0, mode: 'voltage' };

registerComponent('multimeter', {
  component: Multimeter,
  pins: Multimeter.pins,
  defaultState: Multimeter.defaultState,
  category: 'passive',
  label: 'Multimetro',
  icon: '\u{1F4CF}',
  volumeAvailableFrom: 2,
});

export default Multimeter;
