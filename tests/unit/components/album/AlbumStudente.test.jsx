/**
 * AlbumStudente tests — Tea scaffold (iter 70 D).
 *
 * Sprint U iter 70 Team D.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlbumStudente from '../../../../src/components/album/AlbumStudente';

const mockSession = {
  id: 'sess-1',
  experimentId: 'v1-cap6-esp1',
  completedAt: '2026-05-16T10:00:00.000Z',
  fumetto: {
    experimentTitle: 'Accendi il primo LED',
    panels: [
      {
        index: 1,
        role: 'problema',
        title: 'Il problema',
        caption: 'CAP. 6 — I LED',
      },
      { index: 2, role: 'successo', title: 'Successo', caption: 'OK' },
    ],
  },
};

describe('AlbumStudente — Tea iter 70 D scaffold', () => {
  it('renders without crashing', () => {
    render(<AlbumStudente />);
    expect(screen.getByTestId('album-studente')).toBeTruthy();
  });

  it('shows empty state when no sessions', () => {
    render(<AlbumStudente sessions={[]} />);
    expect(screen.getByTestId('album-empty')).toBeTruthy();
    expect(screen.getByText(/Ragazzi, non c'è ancora nessun fumetto/i)).toBeTruthy();
  });

  it('shows empty state when sessions is null', () => {
    render(<AlbumStudente sessions={null} />);
    expect(screen.getByTestId('album-empty')).toBeTruthy();
  });

  it('renders default title "Album dei Ragazzi" without studentName', () => {
    render(<AlbumStudente />);
    expect(screen.getByText('Album dei Ragazzi')).toBeTruthy();
  });

  it('renders studentName-prefixed title when provided', () => {
    render(<AlbumStudente studentName="Marta" />);
    expect(screen.getByText(/Album di Marta/)).toBeTruthy();
  });

  it('truncates studentName to max 40 chars (GDPR safety)', () => {
    const name = 'A'.repeat(80);
    render(<AlbumStudente studentName={name} />);
    const title = screen.getByText(/Album di A+/);
    // Title contains exactly the first 40 chars
    expect(title.textContent.length).toBeLessThanOrEqual('Album di '.length + 40);
  });

  it('renders one card per session', () => {
    render(
      <AlbumStudente
        sessions={[mockSession, { ...mockSession, id: 'sess-2' }]}
      />
    );
    expect(screen.getByTestId('album-card-sess-1')).toBeTruthy();
    expect(screen.getByTestId('album-card-sess-2')).toBeTruthy();
  });

  it('displays experiment title from fumetto', () => {
    render(<AlbumStudente sessions={[mockSession]} />);
    expect(screen.getByText('Accendi il primo LED')).toBeTruthy();
  });

  it('falls back to experimentId when no title', () => {
    const s = { ...mockSession, fumetto: { panels: [] } };
    render(<AlbumStudente sessions={[s]} />);
    expect(screen.getByText('v1-cap6-esp1')).toBeTruthy();
  });

  it('displays panel count', () => {
    render(<AlbumStudente sessions={[mockSession]} />);
    expect(screen.getByText(/2\s*vignette/i)).toBeTruthy();
  });

  it('displays cover caption from first valid-role panel', () => {
    render(<AlbumStudente sessions={[mockSession]} />);
    expect(screen.getByTestId('album-card-caption').textContent).toContain(
      'CAP. 6 — I LED'
    );
  });

  it('shows fallback caption when no fumetto', () => {
    const s = { id: 'sess-empty', experimentId: 'v1-cap6-esp1' };
    render(<AlbumStudente sessions={[s]} />);
    expect(screen.getByText(/Fumetto non ancora generato/i)).toBeTruthy();
  });

  it('calls onOpenFumetto when card CTA clicked', () => {
    const handler = vi.fn();
    render(
      <AlbumStudente sessions={[mockSession]} onOpenFumetto={handler} />
    );
    fireEvent.click(screen.getByTestId('album-card-open'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(mockSession);
  });

  it('does not crash on click without handler', () => {
    render(<AlbumStudente sessions={[mockSession]} />);
    expect(() =>
      fireEvent.click(screen.getByTestId('album-card-open'))
    ).not.toThrow();
  });

  it('displays formatted Italian date', () => {
    render(<AlbumStudente sessions={[mockSession]} />);
    // Italian "mag" or "maggio"
    const cardText = screen.getByTestId('album-card-sess-1').textContent;
    expect(cardText).toMatch(/2026/);
  });

  it('renders scaffold footer marker', () => {
    render(<AlbumStudente />);
    expect(screen.getByText(/scaffold iter 70 D/i)).toBeTruthy();
  });

  it('uses data-experiment-id attribute for harness lookup', () => {
    render(<AlbumStudente sessions={[mockSession]} />);
    const card = screen.getByTestId('album-card-sess-1');
    expect(card.getAttribute('data-experiment-id')).toBe('v1-cap6-esp1');
  });

  it('renders multiple sessions in grid', () => {
    const sessions = Array.from({ length: 5 }, (_, i) => ({
      ...mockSession,
      id: `sess-${i}`,
      experimentId: `v1-cap6-esp${i + 1}`,
    }));
    render(<AlbumStudente sessions={sessions} />);
    expect(screen.getByTestId('album-grid')).toBeTruthy();
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`album-card-sess-${i}`)).toBeTruthy();
    }
  });

  it('singular "vignetta" when only one panel', () => {
    const s = {
      ...mockSession,
      fumetto: { panels: [{ index: 1, role: 'problema' }] },
    };
    render(<AlbumStudente sessions={[s]} />);
    expect(screen.getByText(/1\s*vignetta\b/i)).toBeTruthy();
  });
});
