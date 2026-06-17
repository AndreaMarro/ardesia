/**
 * CapitoloPicker tests — Sprint Q2.C
 * Andrea Marro 2026-04-25
 *
 * Grid Cap per volume. Selettore Vol 1/2/3.
 * Click su Cap card -> apre Percorso Capitolo via callback.
 *
 * PRINCIPIO ZERO: ordine, leggibilità, no comandi al docente.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CapitoloPicker from '../../../../src/components/lavagna/CapitoloPicker.jsx';

const SAMPLE_CAPITOLI = [
  {
    id: 'v1-cap1', volume: 1, capitolo: 1, type: 'theory',
    titolo: "La Storia dell'Elettronica", titolo_classe: "Storia",
    pageStart: 5, pageEnd: 8, esperimenti: [],
  },
  {
    id: 'v1-cap6', volume: 1, capitolo: 6, type: 'experiment',
    titolo: "Cos'è il diodo LED?", titolo_classe: "LED",
    pageStart: 27, pageEnd: 34,
    esperimenti: [{ id: 'v1-cap6-esp1' }, { id: 'v1-cap6-esp2' }, { id: 'v1-cap6-esp3' }],
  },
  {
    id: 'v1-cap14', volume: 1, capitolo: 14, type: 'project',
    titolo: "Robot primo", titolo_classe: "Robot",
    pageStart: 107, pageEnd: 112,
    esperimenti: [{ id: 'v1-cap14-esp1' }],
  },
  {
    id: 'v2-cap3', volume: 2, capitolo: 3, type: 'experiment',
    titolo: "Il Multimetro", titolo_classe: "Multimetro",
    pageStart: 13, pageEnd: 36,
    esperimenti: [{ id: 'v2-cap3-esp1' }, { id: 'v2-cap3-esp2' }],
  },
  {
    id: 'v3-cap9', volume: 3, capitolo: 9, type: 'project',
    titolo: "Simon Says capstone", titolo_classe: "Simon Says",
    pageStart: 85, pageEnd: 92,
    esperimenti: [{ id: 'v3-cap9-esp1' }],
  },
];

describe('CapitoloPicker', () => {
  it('renders Cap cards for selected volume (default 1)', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} />);
    expect(screen.getByText("Cos'è il diodo LED?")).toBeInTheDocument();
    expect(screen.getByText("La Storia dell'Elettronica")).toBeInTheDocument();
    expect(screen.getByText("Robot primo")).toBeInTheDocument();
  });

  it('does NOT render Vol2/Vol3 Cap when volume=1 selected', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} />);
    expect(screen.queryByText("Il Multimetro")).not.toBeInTheDocument();
    expect(screen.queryByText("Simon Says capstone")).not.toBeInTheDocument();
  });

  it('renders Vol2 Cap when volume=2', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={2} />);
    expect(screen.getByText("Il Multimetro")).toBeInTheDocument();
    expect(screen.queryByText("Cos'è il diodo LED?")).not.toBeInTheDocument();
  });

  it('shows Cap number in card', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} />);
    expect(screen.getByText(/Cap\. 6/)).toBeInTheDocument();
    expect(screen.getByText(/Cap\. 14/)).toBeInTheDocument();
  });

  it('shows experiment count for each Cap', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} />);
    // Cap 6 has 3 esperimenti
    const cap6Card = screen.getByText("Cos'è il diodo LED?").closest('button');
    expect(cap6Card.textContent).toMatch(/3/);
  });

  it('shows type badge (theory/experiment/project)', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} />);
    expect(screen.getAllByText(/theory/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/experiment/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/project/i).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectCapitolo with cap id when card clicked', () => {
    const handler = vi.fn();
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} onSelectCapitolo={handler} />);
    const cap6Card = screen.getByText("Cos'è il diodo LED?").closest('button');
    fireEvent.click(cap6Card);
    expect(handler).toHaveBeenCalledWith('v1-cap6');
  });

  it('renders volume switcher (Vol 1, 2, 3)', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} />);
    expect(screen.getByRole('button', { name: /Volume 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volume 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volume 3/i })).toBeInTheDocument();
  });

  it('switches volume when volume tab clicked', () => {
    const onVolChange = vi.fn();
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} onVolumeChange={onVolChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Volume 2/i }));
    expect(onVolChange).toHaveBeenCalledWith(2);
  });

  it('sorts Cap by capitolo number', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} />);
    const cards = screen.getAllByRole('button').filter((b) =>
      b.textContent.includes('Cap.')
    );
    const numbers = cards.map((c) => parseInt(c.textContent.match(/Cap\.\s*(\d+)/)?.[1], 10));
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
  });

  it('renders empty state when no capitoli for volume', () => {
    render(<CapitoloPicker capitoli={[]} volume={1} />);
    expect(screen.getByText(/Nessun capitolo/i)).toBeInTheDocument();
  });

  it('has role region for accessibility', () => {
    render(<CapitoloPicker capitoli={SAMPLE_CAPITOLI} volume={1} />);
    expect(screen.getByRole('region', { name: /capitoli/i })).toBeInTheDocument();
  });
});
