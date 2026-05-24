/**
 * BookGeometryRenderer — React component che renderizza bookGeometry JSON
 * come overlay SVG canonical visivo libro.
 *
 * Workflow-v2 fase 10: passo-passo deve rivelare progressively la stessa scena
 * canonica (NON generare geometria diversa per step).
 *
 * Usage:
 *   <svg viewBox="0 0 1200 400">
 *     <BookGeometryRenderer
 *       bookGeometry={bookGeometryV1Esp1}
 *       mode="complete"
 *     />
 *   </svg>
 *
 *   // Passo-passo mode:
 *   <BookGeometryRenderer
 *     bookGeometry={bookGeometryV1Esp1}
 *     mode="guided"
 *     stepIndex={2}
 *   />
 *
 * Mode 'complete': mostra TUTTI components + visibleWires
 * Mode 'guided': filtra per steps[stepIndex].visibleComponents + visibleWires
 *
 * SVG output:
 *   <g class="book-geometry-renderer" data-experiment="v1-cap6-esp1">
 *     <g class="bg-components">...components placeholder</g>
 *     <g class="bg-wires">...polyline visibleWires</g>
 *     <g class="bg-labels">...component id labels</g>
 *   </g>
 *
 * Asset rendering: PRIMA versione = placeholder rect + label. Asset specifici
 * (battery9v-vol1-horizontal-clip-right etc) integrabili in iter successiva.
 */

import React from 'react';

const COMPONENT_PLACEHOLDER_STYLES = {
  battery9v: { width: 70, height: 36, fill: '#2a2a2a', stroke: '#ffd700' },
  breadboard: { width: 450, height: 75, fill: '#f0e8d0', stroke: '#888' },
  led: { width: 12, height: 18, fill: '#ff4444', stroke: '#aa0000' },
  'led-bridge': { width: 12, height: 18, fill: '#ff4444', stroke: '#aa0000' },
  resistor: { width: 38, height: 8, fill: '#d4a574', stroke: '#8b6f47' },
  capacitor: { width: 14, height: 30, fill: '#1a1a1a', stroke: '#555' },
  'push-button': { width: 20, height: 20, fill: '#ff8800', stroke: '#aa5500' },
  multimeter: { width: 70, height: 100, fill: '#ffeb3b', stroke: '#806600' },
  'nano-r4': { width: 50, height: 80, fill: '#003366', stroke: '#001122' },
};

const DEFAULT_PLACEHOLDER = { width: 20, height: 20, fill: '#ccc', stroke: '#666' };

function getPlaceholderStyle(type) {
  return COMPONENT_PLACEHOLDER_STYLES[type] || DEFAULT_PLACEHOLDER;
}

function ComponentPlaceholder({ id, component }) {
  const style = getPlaceholderStyle(component.type);
  const rotation = component.rotation || 0;
  const x = component.x || 0;
  const y = component.y || 0;

  return (
    <g
      className="bg-component"
      data-component={id}
      data-type={component.type}
      transform={`translate(${x},${y}) rotate(${rotation})`}
    >
      <rect
        width={style.width}
        height={style.height}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={1.5}
        opacity={0.7}
      />
      <text
        x={style.width / 2}
        y={-3}
        fontSize={9}
        textAnchor="middle"
        fill="#333"
      >
        {id}
      </text>
    </g>
  );
}

function WirePolyline({ wire }) {
  if (!wire.points || wire.points.length < 2) return null;
  const pointsStr = wire.points.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <polyline
      className="bg-wire"
      data-wire-id={wire.id}
      data-color={wire.color}
      points={pointsStr}
      stroke={wire.color || 'black'}
      strokeWidth={wire.thickness || 3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function BookGeometryRenderer({ bookGeometry, mode = 'complete', stepIndex }) {
  if (!bookGeometry || !bookGeometry.components) return null;

  // Filtra components + wires per mode
  let visibleComponentIds;
  let visibleWireIds;

  if (mode === 'complete') {
    visibleComponentIds = new Set(Object.keys(bookGeometry.components));
    visibleWireIds = new Set((bookGeometry.visibleWires || []).map((w) => w.id));
  } else if (mode === 'guided') {
    const step = bookGeometry.steps && bookGeometry.steps[stepIndex];
    if (!step) {
      visibleComponentIds = new Set();
      visibleWireIds = new Set();
    } else {
      visibleComponentIds = new Set(step.visibleComponents || []);
      visibleWireIds = new Set(step.visibleWires || []);
    }
  } else {
    return null;
  }

  return (
    <g
      className="book-geometry-renderer"
      data-experiment={bookGeometry.experimentId}
      data-mode={mode}
      data-step={stepIndex || 0}
    >
      <g className="bg-components">
        {Object.entries(bookGeometry.components)
          .filter(([id]) => visibleComponentIds.has(id))
          .map(([id, component]) => (
            <ComponentPlaceholder key={id} id={id} component={component} />
          ))}
      </g>
      <g className="bg-wires">
        {(bookGeometry.visibleWires || [])
          .filter((w) => visibleWireIds.has(w.id))
          .map((wire) => (
            <WirePolyline key={wire.id} wire={wire} />
          ))}
      </g>
    </g>
  );
}

export default BookGeometryRenderer;
