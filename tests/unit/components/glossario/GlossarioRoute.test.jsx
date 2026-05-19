/**
 * GlossarioRoute tests — internal #glossario route (Tea iter 41 carryover).
 *
 * Sprint U iter 70 Team D.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlossarioRoute, {
  indexByLetter,
  filterTerms,
} from '../../../../src/components/glossario/GlossarioRoute';
import glossarioData from '../../../../src/data/glossario-terms.json';

describe('GlossarioRoute — Tea internal port', () => {
  it('renders without crashing', () => {
    render(<GlossarioRoute />);
    expect(screen.getByTestId('glossario-route')).toBeTruthy();
  });

  it('shows total term count in subtitle', () => {
    render(<GlossarioRoute />);
    const total = glossarioData.terms.length;
    // The same numeric token may appear in the results-count line too, so
    // scope the match to the header subtitle (mentions "Tea De Venere").
    const matches = screen.getAllByText(new RegExp(`${total} termini`, 'i'));
    expect(matches.length).toBeGreaterThan(0);
    const inSubtitle = matches.some((el) =>
      /Tea De Venere/i.test(el.textContent || '')
    );
    expect(inSubtitle).toBe(true);
  });

  it('renders 3 volume filter chips', () => {
    render(<GlossarioRoute />);
    expect(screen.getByTestId('glossario-vol-1')).toBeTruthy();
    expect(screen.getByTestId('glossario-vol-2')).toBeTruthy();
    expect(screen.getByTestId('glossario-vol-3')).toBeTruthy();
  });

  it('renders 2 reading mode chips (bambini + tecnico)', () => {
    render(<GlossarioRoute />);
    expect(screen.getByTestId('glossario-mode-bambini')).toBeTruthy();
    expect(screen.getByTestId('glossario-mode-tecnico')).toBeTruthy();
  });

  it('default reading mode is bambini (kid-friendly)', () => {
    render(<GlossarioRoute />);
    expect(
      screen.getByTestId('glossario-mode-bambini').getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('switches to tecnico mode on click', () => {
    render(<GlossarioRoute />);
    fireEvent.click(screen.getByTestId('glossario-mode-tecnico'));
    expect(
      screen.getByTestId('glossario-mode-tecnico').getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen.getByTestId('glossario-mode-bambini').getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('shows alphabet filter buttons (≥10 letters)', () => {
    render(<GlossarioRoute />);
    // "Tutti" + at least 10 letter buttons
    expect(screen.getByTestId('glossario-alpha-all')).toBeTruthy();
    const letters = ['A', 'B', 'C', 'E', 'L', 'P', 'R', 'S', 'T', 'V'];
    for (const ch of letters) {
      expect(screen.getByTestId(`glossario-alpha-${ch}`)).toBeTruthy();
    }
  });

  it('search input is rendered and accessible', () => {
    render(<GlossarioRoute />);
    const input = screen.getByTestId('glossario-search');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('search');
  });

  it('filters terms by free-text search', () => {
    render(<GlossarioRoute />);
    const input = screen.getByTestId('glossario-search');
    fireEvent.change(input, { target: { value: 'tensione' } });
    const results = screen.getByTestId('glossario-results');
    // At least one card with id starting v1- containing tensione
    expect(results.querySelectorAll('[data-testid^="glossario-term-"]').length).toBeGreaterThan(0);
  });

  it('filters terms by volume', () => {
    render(<GlossarioRoute />);
    // Deactivate vol2 and vol3 → only vol1
    fireEvent.click(screen.getByTestId('glossario-vol-2'));
    fireEvent.click(screen.getByTestId('glossario-vol-3'));
    const cards = screen
      .getByTestId('glossario-results')
      .querySelectorAll('[data-testid^="glossario-term-v"]');
    for (const c of cards) {
      const id = c.getAttribute('data-testid');
      expect(id.startsWith('glossario-term-v1-')).toBe(true);
    }
  });

  it('shows empty-state Italian message when nothing matches', () => {
    render(<GlossarioRoute />);
    const input = screen.getByTestId('glossario-search');
    fireEvent.change(input, {
      target: { value: 'xyzz-non-esiste-termine-mai' },
    });
    expect(screen.getByText(/Ragazzi, nessun termine/i)).toBeTruthy();
  });

  it('reset button appears and works', () => {
    render(<GlossarioRoute />);
    fireEvent.change(screen.getByTestId('glossario-search'), {
      target: { value: 'led' },
    });
    expect(screen.getByTestId('glossario-reset')).toBeTruthy();
    fireEvent.click(screen.getByTestId('glossario-reset'));
    // After reset, no reset button shown
    expect(screen.queryByTestId('glossario-reset')).toBeNull();
  });

  it('alphabet click filters by letter', () => {
    render(<GlossarioRoute />);
    fireEvent.click(screen.getByTestId('glossario-alpha-A'));
    const cards = screen
      .getByTestId('glossario-results')
      .querySelectorAll('[data-testid^="glossario-term-"]');
    expect(cards.length).toBeGreaterThan(0);
    for (const c of cards) {
      const titleEl = c.querySelector('h3');
      expect(titleEl).toBeTruthy();
      expect(titleEl.textContent.charAt(0).toUpperCase()).toBe('A');
    }
  });

  it('renders close button when onClose provided', () => {
    const close = vi.fn();
    render(<GlossarioRoute onClose={close} />);
    expect(screen.getByTestId('glossario-close')).toBeTruthy();
    fireEvent.click(screen.getByTestId('glossario-close'));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose absent', () => {
    render(<GlossarioRoute />);
    expect(screen.queryByTestId('glossario-close')).toBeNull();
  });

  it('cards display volume + chapter badge', () => {
    render(<GlossarioRoute />);
    const firstCard = screen
      .getByTestId('glossario-results')
      .querySelector('[data-testid^="glossario-term-"]');
    expect(firstCard).toBeTruthy();
    expect(firstCard.textContent).toMatch(/Vol\s*\d/);
    expect(firstCard.textContent).toMatch(/Cap\s*\d/);
  });

  it('cannot deactivate all 3 volumes simultaneously', () => {
    render(<GlossarioRoute />);
    fireEvent.click(screen.getByTestId('glossario-vol-1'));
    fireEvent.click(screen.getByTestId('glossario-vol-2'));
    fireEvent.click(screen.getByTestId('glossario-vol-3'));
    // Should reset to all 3 active
    expect(
      screen.getByTestId('glossario-vol-1').getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen.getByTestId('glossario-vol-2').getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen.getByTestId('glossario-vol-3').getAttribute('aria-pressed')
    ).toBe('true');
  });
});

describe('GlossarioRoute helpers', () => {
  describe('indexByLetter()', () => {
    it('groups terms by initial letter', () => {
      const terms = [
        { term: 'Atomo' },
        { term: 'Bit' },
        { term: 'Ampere' },
      ];
      const { letters, byLetter } = indexByLetter(terms);
      expect(letters).toEqual(['A', 'B']);
      expect(byLetter.get('A')).toHaveLength(2);
      expect(byLetter.get('B')).toHaveLength(1);
    });

    it('handles empty input', () => {
      const { letters, byLetter } = indexByLetter([]);
      expect(letters).toEqual([]);
      expect(byLetter.size).toBe(0);
    });

    it('upper-cases initial letter', () => {
      const { byLetter } = indexByLetter([{ term: 'atomo' }]);
      expect(byLetter.has('A')).toBe(true);
    });

    it('returns sorted alphabet', () => {
      const { letters } = indexByLetter(
        glossarioData.terms.slice(0, 50)
      );
      const sorted = [...letters].sort((a, b) => a.localeCompare(b, 'it'));
      expect(letters).toEqual(sorted);
    });
  });

  describe('filterTerms()', () => {
    const sample = [
      { term: 'LED', volume: 1, tecnico: 'diodo', bambini: 'lampadina', capitoloTitle: 'Cos\'è il LED' },
      { term: 'Transistor', volume: 2, tecnico: 'amplificatore', bambini: 'interruttore', capitoloTitle: 'Transistor' },
      { term: 'Arduino', volume: 3, tecnico: 'microcontrollore', bambini: 'computerino', capitoloTitle: 'Arduino' },
    ];

    it('returns all when no filters', () => {
      const r = filterTerms(sample, { volumes: [1, 2, 3], search: '' });
      expect(r).toHaveLength(3);
    });

    it('filters by volume', () => {
      const r = filterTerms(sample, { volumes: [2], search: '' });
      expect(r).toHaveLength(1);
      expect(r[0].term).toBe('Transistor');
    });

    it('filters by free-text search (case-insensitive)', () => {
      const r = filterTerms(sample, {
        volumes: [1, 2, 3],
        search: 'AMPLIFI',
      });
      expect(r).toHaveLength(1);
      expect(r[0].term).toBe('Transistor');
    });

    it('searches across all text fields', () => {
      const r = filterTerms(sample, {
        volumes: [1, 2, 3],
        search: 'lampadina',
      });
      expect(r).toHaveLength(1);
      expect(r[0].term).toBe('LED');
    });

    it('returns empty when search has no hits', () => {
      const r = filterTerms(sample, {
        volumes: [1, 2, 3],
        search: 'unicorno-magico',
      });
      expect(r).toHaveLength(0);
    });

    it('falls back to all volumes when none specified', () => {
      const r = filterTerms(sample, { volumes: [], search: '' });
      expect(r).toHaveLength(3);
    });
  });

  describe('glossario-terms.json dataset', () => {
    it('contains ≥150 terms across 3 volumes', () => {
      expect(glossarioData.terms.length).toBeGreaterThanOrEqual(150);
    });

    it('every term has required fields', () => {
      for (const t of glossarioData.terms) {
        expect(typeof t.id).toBe('string');
        expect([1, 2, 3]).toContain(t.volume);
        expect(typeof t.capitolo).toBe('number');
        expect(typeof t.term).toBe('string');
        expect(t.term.length).toBeGreaterThan(0);
        expect(typeof t.tecnico).toBe('string');
        expect(typeof t.bambini).toBe('string');
      }
    });

    it('stats match the term count', () => {
      const summed =
        glossarioData.stats.perVolume[1] +
        glossarioData.stats.perVolume[2] +
        glossarioData.stats.perVolume[3];
      expect(summed).toBe(glossarioData.terms.length);
      expect(glossarioData.stats.totalTerms).toBe(glossarioData.terms.length);
    });
  });
});
