/**
 * Wire.jsx path prop TDD — Demo 25/05 S1 fedeltà libro.
 *
 * Andrea verbatim: "geometria dei cavi nello spazio identica disegni libro".
 *
 * path prop:
 * - undefined (default): fallback auto-routing via calcWirePath Bezier (legacy).
 * - Array<{x, y}>: manual waypoint routing via SVG polyline. Path identico libro
 *   per Demo S1 hero esp (v1-cap6-esp1, v2-cap7-esp2, v3-cap6-esp5).
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Wire from '../../../../src/components/simulator/components/Wire';

const renderSvg = (props) =>
  render(
    <svg xmlns="http://www.w3.org/2000/svg">
      <Wire {...props} />
    </svg>
  );

describe('Wire.jsx path prop (Demo S1 manual routing)', () => {
  it('default behavior (no path) uses auto-routing Bezier curve', () => {
    const { container } = renderSvg({
      id: 'w1',
      x1: 0, y1: 0,
      x2: 100, y2: 100,
      color: 'red',
    });
    // Auto-routing renders multiple path elements (shadow + main + highlight)
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    // NO polyline when auto-routing
    const polylines = container.querySelectorAll('polyline');
    expect(polylines.length).toBe(0);
  });

  it('with path prop renders SVG polyline using waypoints', () => {
    const path = [
      { x: 10, y: 10 },
      { x: 50, y: 10 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
    ];
    const { container } = renderSvg({
      id: 'w1',
      x1: 0, y1: 0,
      x2: 100, y2: 100,
      color: 'red',
      path,
    });
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
    const points = polyline.getAttribute('points');
    expect(points).toContain('10,10');
    expect(points).toContain('50,10');
    expect(points).toContain('50,50');
    expect(points).toContain('100,50');
  });

  it('stroke color matches color prop (red palette ELAB)', () => {
    const { container } = renderSvg({
      id: 'w1',
      x1: 0, y1: 0,
      x2: 100, y2: 100,
      color: 'red',
      path: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
    });
    const polyline = container.querySelector('polyline[data-wire-main]');
    expect(polyline).toBeTruthy();
    const stroke = polyline.getAttribute('stroke');
    // ELAB red token --elab-hex-dc2626
    expect(stroke).toContain('dc2626');
  });

  it('stroke color matches color prop (black palette ELAB)', () => {
    const { container } = renderSvg({
      id: 'w2',
      x1: 0, y1: 0,
      x2: 100, y2: 100,
      color: 'black',
      path: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
    });
    const polyline = container.querySelector('polyline[data-wire-main]');
    expect(polyline).toBeTruthy();
    expect(polyline.getAttribute('stroke')).toContain('1a1a1a');
  });

  it('path with 2 waypoints (straight line) renders correctly', () => {
    const { container } = renderSvg({
      id: 'w1',
      x1: 0, y1: 0,
      x2: 50, y2: 0,
      color: 'green',
      path: [{ x: 0, y: 0 }, { x: 50, y: 0 }],
    });
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
    expect(polyline.getAttribute('points')).toBe('0,0 50,0');
  });

  it('empty path array fallback to auto-routing', () => {
    const { container } = renderSvg({
      id: 'w1',
      x1: 0, y1: 0,
      x2: 100, y2: 100,
      color: 'red',
      path: [],
    });
    // Empty path = no manual routing, fallback to auto Bezier paths
    const polylines = container.querySelectorAll('polyline');
    expect(polylines.length).toBe(0);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('data-wire-id attribute preserved across both modes', () => {
    const { container: autoContainer } = renderSvg({
      id: 'w-auto',
      x1: 0, y1: 0, x2: 50, y2: 50,
      color: 'red',
    });
    const { container: pathContainer } = renderSvg({
      id: 'w-path',
      x1: 0, y1: 0, x2: 50, y2: 50,
      color: 'red',
      path: [{ x: 0, y: 0 }, { x: 50, y: 50 }],
    });
    expect(autoContainer.querySelector('[data-component-id="w-auto"]')).toBeTruthy();
    expect(pathContainer.querySelector('[data-component-id="w-path"]')).toBeTruthy();
  });
});
