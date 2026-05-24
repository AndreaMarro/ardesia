/**
 * Tests: BookGeometryRenderer React component
 * Coverage: rendering modes, component filter, wire filter, edge cases.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BookGeometryRenderer } from '../../../../src/plugins/bookGeometry/index.js';

const BOOKGEOMETRY_FIXTURE = {
  experimentId: 'test-esp',
  scene: { width: 900, height: 300, anchor: 'bb1' },
  components: {
    bb1: { type: 'breadboard', x: 100, y: 50 },
    bat1: { type: 'battery9v', x: 30, y: 70 },
    r1: { type: 'resistor', value: 470, x: 200, y: 55 },
    led1: { type: 'led', color: 'red', x: 250, y: 70 },
  },
  visibleWires: [
    {
      id: 'w1',
      color: 'red',
      from: 'bat1:positive',
      to: 'bb1:topPlusRail-col1',
      points: [
        { x: 100, y: 80 },
        { x: 150, y: 70 },
        { x: 200, y: 60 },
      ],
    },
    {
      id: 'w2',
      color: 'black',
      from: 'bat1:negative',
      to: 'bb1:bottomMinusRail-col1',
      points: [
        { x: 100, y: 100 },
        { x: 150, y: 130 },
      ],
    },
  ],
  hiddenElectricalConnections: [],
  steps: [
    {
      id: 'step-01',
      visibleComponents: ['bb1', 'bat1'],
      visibleWires: ['w1'],
    },
    {
      id: 'step-02',
      visibleComponents: ['bb1', 'bat1', 'r1'],
      visibleWires: ['w1'],
    },
    {
      id: 'step-final',
      visibleComponents: ['bb1', 'bat1', 'r1', 'led1'],
      visibleWires: ['w1', 'w2'],
    },
  ],
};

function renderInSvg(ui) {
  return render(
    <svg viewBox="0 0 900 300" data-testid="canvas">
      {ui}
    </svg>
  );
}

describe('BookGeometryRenderer — base rendering', () => {
  it('ritorna null senza bookGeometry prop', () => {
    const { container } = render(<svg><BookGeometryRenderer /></svg>);
    expect(container.querySelector('.book-geometry-renderer')).toBeNull();
  });

  it('ritorna null se bookGeometry mancante components', () => {
    const { container } = render(
      <svg>
        <BookGeometryRenderer bookGeometry={{ experimentId: 'x' }} />
      </svg>
    );
    expect(container.querySelector('.book-geometry-renderer')).toBeNull();
  });

  it('renderizza root g con data-experiment', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={BOOKGEOMETRY_FIXTURE} mode="complete" />
    );
    const root = container.querySelector('.book-geometry-renderer');
    expect(root).not.toBeNull();
    expect(root.getAttribute('data-experiment')).toBe('test-esp');
    expect(root.getAttribute('data-mode')).toBe('complete');
  });
});

describe('BookGeometryRenderer — mode "complete"', () => {
  it('renderizza TUTTI components fixture', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={BOOKGEOMETRY_FIXTURE} mode="complete" />
    );
    const components = container.querySelectorAll('.bg-component');
    expect(components.length).toBe(4); // bb1 + bat1 + r1 + led1
  });

  it('renderizza TUTTI visibleWires fixture', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={BOOKGEOMETRY_FIXTURE} mode="complete" />
    );
    const wires = container.querySelectorAll('.bg-wire');
    expect(wires.length).toBe(2);
  });

  it('imposta data-component + data-type su component', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={BOOKGEOMETRY_FIXTURE} mode="complete" />
    );
    const led = container.querySelector('[data-component="led1"]');
    expect(led).not.toBeNull();
    expect(led.getAttribute('data-type')).toBe('led');
  });

  it('imposta stroke color match wire color', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={BOOKGEOMETRY_FIXTURE} mode="complete" />
    );
    const redWire = container.querySelector('[data-wire-id="w1"]');
    expect(redWire).not.toBeNull();
    expect(redWire.getAttribute('stroke')).toBe('red');
    expect(redWire.getAttribute('data-color')).toBe('red');
  });
});

describe('BookGeometryRenderer — mode "guided"', () => {
  it('step 0 mostra solo bb1 + bat1 + w1', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer
        bookGeometry={BOOKGEOMETRY_FIXTURE}
        mode="guided"
        stepIndex={0}
      />
    );
    expect(container.querySelectorAll('.bg-component').length).toBe(2);
    expect(container.querySelectorAll('.bg-wire').length).toBe(1);
    expect(container.querySelector('[data-component="bb1"]')).not.toBeNull();
    expect(container.querySelector('[data-component="bat1"]')).not.toBeNull();
    expect(container.querySelector('[data-component="r1"]')).toBeNull();
    expect(container.querySelector('[data-component="led1"]')).toBeNull();
  });

  it('step 1 aggiunge r1', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer
        bookGeometry={BOOKGEOMETRY_FIXTURE}
        mode="guided"
        stepIndex={1}
      />
    );
    expect(container.querySelectorAll('.bg-component').length).toBe(3);
    expect(container.querySelector('[data-component="r1"]')).not.toBeNull();
    expect(container.querySelector('[data-component="led1"]')).toBeNull();
  });

  it('step finale mostra tutto', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer
        bookGeometry={BOOKGEOMETRY_FIXTURE}
        mode="guided"
        stepIndex={2}
      />
    );
    expect(container.querySelectorAll('.bg-component').length).toBe(4);
    expect(container.querySelectorAll('.bg-wire').length).toBe(2);
  });

  it('stepIndex out of range = niente visibile', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer
        bookGeometry={BOOKGEOMETRY_FIXTURE}
        mode="guided"
        stepIndex={99}
      />
    );
    expect(container.querySelectorAll('.bg-component').length).toBe(0);
    expect(container.querySelectorAll('.bg-wire').length).toBe(0);
  });
});

describe('BookGeometryRenderer — invalid mode', () => {
  it('mode sconosciuto ritorna null', () => {
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={BOOKGEOMETRY_FIXTURE} mode="invalid" />
    );
    expect(container.querySelector('.book-geometry-renderer')).toBeNull();
  });
});

describe('BookGeometryRenderer — edge cases', () => {
  it('bookGeometry senza visibleWires', () => {
    const bg = { ...BOOKGEOMETRY_FIXTURE, visibleWires: undefined };
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={bg} mode="complete" />
    );
    expect(container.querySelectorAll('.bg-wire').length).toBe(0);
  });

  it('wire senza points = NON renderizzato', () => {
    const bg = {
      ...BOOKGEOMETRY_FIXTURE,
      visibleWires: [
        { id: 'empty', color: 'red', points: [] },
        { id: 'single', color: 'red', points: [{ x: 0, y: 0 }] },
        { id: 'valid', color: 'red', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] },
      ],
    };
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={bg} mode="complete" />
    );
    const wires = container.querySelectorAll('.bg-wire');
    expect(wires.length).toBe(1); // solo 'valid' renderizzato
    expect(wires[0].getAttribute('data-wire-id')).toBe('valid');
  });

  it('component senza x/y default = 0', () => {
    const bg = {
      experimentId: 't',
      components: { x1: { type: 'led' } },
      visibleWires: [],
    };
    const { container } = renderInSvg(
      <BookGeometryRenderer bookGeometry={bg} mode="complete" />
    );
    const comp = container.querySelector('[data-component="x1"]');
    expect(comp).not.toBeNull();
    expect(comp.getAttribute('transform')).toContain('translate(0,0)');
  });
});
