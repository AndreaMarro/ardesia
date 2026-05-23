/**
 * Battery9V renderMode prop TDD — Demo 25/05 S1 fedeltà libro.
 *
 * Andrea verbatim: "La pila non deve avere i due strisci di cavi all'inizio.
 *  Ma semplicemente tu colleghi il rosso e il nero. Geometria identica."
 *
 * renderMode prop:
 * - "default" (legacy) → render strisci cavi embedded (path red + path black da clip a pin)
 * - "clip_simplified" → NO strisci. Solo body + clip + terminal. Wire esterni
 *   (Wire.jsx con path custom) collegano da pin positive (0, 32) / negative (0, 58).
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Battery9V from '../../../../src/components/simulator/components/Battery9V';

const renderSvg = (props) =>
  render(
    <svg xmlns="http://www.w3.org/2000/svg">
      <Battery9V {...props} />
    </svg>
  );

describe('Battery9V renderMode prop (Demo S1)', () => {
  it('renderMode default (omitted) shows strisci cavi embedded', () => {
    const { container } = renderSvg({ id: 'bat1', x: 50, y: 100 });
    const strisci = container.querySelectorAll('[data-strisci]');
    expect(strisci.length).toBeGreaterThan(0);
  });

  it('renderMode="default" shows strisci cavi embedded', () => {
    const { container } = renderSvg({ id: 'bat1', x: 50, y: 100, renderMode: 'default' });
    const stricciRed = container.querySelectorAll('[data-strisci="red"]');
    const stricciBlack = container.querySelectorAll('[data-strisci="black"]');
    expect(stricciRed.length).toBeGreaterThan(0);
    expect(stricciBlack.length).toBeGreaterThan(0);
  });

  it('renderMode="clip_simplified" hides ALL strisci cavi', () => {
    const { container } = renderSvg({ id: 'bat1', x: 50, y: 100, renderMode: 'clip_simplified' });
    const strisci = container.querySelectorAll('[data-strisci]');
    expect(strisci.length).toBe(0);
  });

  it('renderMode="clip_simplified" preserves body + clips + terminals + 9V text', () => {
    const { container } = renderSvg({ id: 'bat1', x: 50, y: 100, renderMode: 'clip_simplified' });
    // Body present (via component-id wrapper)
    const componentG = container.querySelector('[data-component-id="bat1"]');
    expect(componentG).toBeTruthy();
    // 9V text still rendered
    expect(componentG.textContent).toContain('9V');
    // Clip metallic rects present (gray rgba a0a0a0)
    const allRects = componentG.querySelectorAll('rect');
    const hasClipRect = Array.from(allRects).some((r) =>
      (r.getAttribute('fill') || '').includes('a0a0a0')
    );
    expect(hasClipRect).toBe(true);
  });

  it('pin positions UNCHANGED across renderModes (solver-safe)', () => {
    // Battery9V.pins static = [{positive 0,32}, {negative 0,58}]
    expect(Battery9V.pins).toBeDefined();
    expect(Battery9V.pins).toHaveLength(2);
    expect(Battery9V.pins[0]).toMatchObject({ id: 'positive', x: 0, y: 32 });
    expect(Battery9V.pins[1]).toMatchObject({ id: 'negative', x: 0, y: 58 });
  });
});
