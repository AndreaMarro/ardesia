/**
 * LessonSelector — Test for lesson picker within Lezione Guidata tab
 * Lets docente choose from available lessons (grouped by volume).
 * (c) Andrea Marro — 2026-04-19
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';

// Andrea 24/05 PM mandate: DEMO_MODE_ENABLED filters lesson list to demo set.
// Tests below assert FULL lesson list behavior — mock demo-mode to disable filter.
vi.mock('../../../src/data/demo-mode', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, DEMO_MODE_ENABLED: false };
});

import LessonSelector from '../../../src/components/lavagna/LessonSelector';

describe('LessonSelector — scelta lezione', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders a list of lessons for volume 1', () => {
    render(<LessonSelector volumeNumber={1} onLessonSelect={vi.fn()} />);
    expect(screen.getByText(/Accendi il LED/i)).toBeInTheDocument();
    expect(screen.getByText(/Il LED RGB/i)).toBeInTheDocument();
    expect(screen.getByText(/I pulsanti/i)).toBeInTheDocument();
    expect(screen.getByText(/Il potenziometro/i)).toBeInTheDocument();
    expect(screen.getByText(/Sensore di luce/i)).toBeInTheDocument();
  });

  it('calls onLessonSelect with lessonId when clicked', () => {
    const onSelect = vi.fn();
    render(<LessonSelector volumeNumber={1} onLessonSelect={onSelect} />);
    fireEvent.click(screen.getByText(/Il LED RGB/i));
    expect(onSelect).toHaveBeenCalledWith('v1-led-rgb');
  });

  it('marks activeLessonId as selected', () => {
    render(
      <LessonSelector
        volumeNumber={1}
        activeLessonId="v1-pulsanti"
        onLessonSelect={vi.fn()}
      />
    );
    const active = screen.getByTestId('lesson-option-v1-pulsanti');
    expect(active.className).toMatch(/active|selected/i);
  });

  it('shows chapter number for each lesson', () => {
    render(<LessonSelector volumeNumber={1} onLessonSelect={vi.fn()} />);
    expect(screen.getByText(/Cap\.\s*6/i)).toBeInTheDocument();
    expect(screen.getByText(/Cap\.\s*7/i)).toBeInTheDocument();
  });

  it('renders lessons for volume 2', () => {
    render(<LessonSelector volumeNumber={2} onLessonSelect={vi.fn()} />);
    // Sprint U Cycle 3: rinominato da v2-resistenze "Le resistenze in dettaglio" → v2-multimetro "Il Multimetro"
    expect(screen.getByText(/Il Multimetro/i)).toBeInTheDocument();
  });

  it('renders nothing for invalid volume', () => {
    const { container } = render(<LessonSelector volumeNumber={99} onLessonSelect={vi.fn()} />);
    const items = container.querySelectorAll('[data-testid^="lesson-option-"]');
    expect(items.length).toBe(0);
  });
});
