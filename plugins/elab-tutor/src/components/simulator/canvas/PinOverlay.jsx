/**
 * ELAB Simulator — PinOverlay
 * Layer trasparente sopra i componenti per evidenziare pin
 * Usato dall'AI tutor UNLIM per indicare dove collegare i fili
 * © Andrea Marro — 10/02/2026
 */

import React, { useMemo } from 'react';
import { getComponent } from '../components/registry';

const PinOverlay = ({
  components = [],
  layout = {},
  highlightedPins = [],  // Array di "componentId:pinId"
  onPinClick
}) => {
  // Calcola le posizioni assolute di tutti i pin evidenziati
  const pinPositions = useMemo(() => {
    if (!highlightedPins.length) return [];

    return highlightedPins.map(pinRef => {
      const [componentId, pinId] = pinRef.split(':');
      if (!componentId || !pinId) return null;

      const comp = components.find(c => c.id === componentId);
      if (!comp) return null;

      const pos = layout?.[componentId];
      if (!pos) return null;

      const registered = getComponent(comp.type);
      if (!registered || !registered.pins) return null;

      const pinDef = registered.pins.find(p => p.id === pinId);
      if (!pinDef) return null;

      // Applica rotazione se presente
      const rotation = pos.rotation || 0;
      let px = pinDef.x;
      let py = pinDef.y;
      if (rotation !== 0) {
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = px * cos - py * sin;
        const ry = px * sin + py * cos;
        px = rx;
        py = ry;
      }

      return {
        ref: pinRef,
        x: pos.x + px,
        y: pos.y + py,
        label: pinDef.label || pinId,
        type: pinDef.type || 'digital'
      };
    }).filter(Boolean);
  }, [components, layout, highlightedPins]);

  if (pinPositions.length === 0) return null;

  return (
    <g className="pin-overlay">
      {pinPositions.map((pin, i) => (
        <g
          key={pin.ref}
          onClick={(e) => {
            e.stopPropagation();
            if (onPinClick) onPinClick(pin.ref);
          }}
          style={{ cursor: onPinClick ? 'pointer' : 'default' }}
        >
          {/* Cerchio pulsante */}
          <circle
            cx={pin.x}
            cy={pin.y}
            r="6"
            fill="var(--color-accent)"
            opacity="0.3"
          >
            <animate
              attributeName="r"
              values="5;8;5"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.5;0.2"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Pin center dot */}
          <circle
            cx={pin.x}
            cy={pin.y}
            r="3"
            fill="var(--color-accent)"
            stroke="white"
            strokeWidth="1"
            opacity="0.9"
          />

          {/* Label pin */}
          <text
            x={pin.x}
            y={pin.y - 10}
            textAnchor="middle"
            fontSize="5"
            fill="var(--color-accent)"
            fontFamily="var(--font-mono)"
            fontWeight="bold"
          >
            {pin.label}
          </text>

          {/* Linea connessione tra pin consecutivi evidenziati */}
          {i > 0 && (
            <line
              x1={pinPositions[i - 1].x}
              y1={pinPositions[i - 1].y}
              x2={pin.x}
              y2={pin.y}
              stroke="var(--color-accent)"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.4"
            />
          )}
        </g>
      ))}
    </g>
  );
};

export default PinOverlay;
