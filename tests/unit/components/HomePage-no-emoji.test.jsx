/**
 * HomePage emoji removal regression test — iter 72 TEAM D.
 *
 * Codex D2 audit
 * (`docs/audits/2026-05-16-iter-71-entrance-codex-D2-emoji-scope-findings.md`)
 * identified 4 RUNTIME-visible emoji on HomePage:
 *   HomePage.jsx:393 ⚡ (CARDS lavagna fallback)
 *   HomePage.jsx:408 📚 (CARDS tutor fallback)
 *   HomePage.jsx:429 🎬 (CARDS videolezioni, IconComponent: null = renders)
 *   HomePage.jsx:1086 🐒 (footer scimpanzè GIF onError fallback)
 *
 * This test renders <HomePage /> and asserts ZERO occurrences of those
 * codepoints in the produced DOM. Comments-only references are not part
 * of the rendered output, so any failure here proves a RUNTIME regression.
 *
 * Per CLAUDE.md regola 11 ban emoji icone — every emoji must be a
 * dedicated ElabIcons SVG component.
 *
 * Andrea Marro — 2026-05-17 iter 72 Team D
 */
import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import HomePage from '../../../src/components/HomePage';

// HomePage triggers PWA / matchMedia / IntersectionObserver under the
// hood; defensive jsdom polyfills mirror existing HomePage.test.jsx.
beforeAll(() => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      media: '',
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
  }
  if (typeof window !== 'undefined' && !window.IntersectionObserver) {
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const BANNED_EMOJI = ['🎬', '📚', '⚡', '🐒'];

describe('HomePage emoji removal regression (iter 72 TEAM D / Codex D2)', () => {
  it('renders without throwing', () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });

  it.each(BANNED_EMOJI)(
    'contains ZERO occurrence of runtime-visible emoji %s in rendered DOM',
    (emoji) => {
      const { container } = render(<HomePage />);
      // textContent walks all visible + aria-hidden text nodes (jsdom).
      const text = container.textContent || '';
      const count = text.split(emoji).length - 1;
      expect(count).toBe(0);
    }
  );

  it('does not include any of the 4 banned emoji in aggregate', () => {
    const { container } = render(<HomePage />);
    const text = container.textContent || '';
    const found = BANNED_EMOJI.filter((e) => text.includes(e));
    expect(found).toEqual([]);
  });
});
