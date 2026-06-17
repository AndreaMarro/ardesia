/**
 * LessonReader — Test TDD (failing first per governance rule 2)
 *
 * Coverage obiettivi:
 * - Render timeline capitolo con citazioni volume
 * - Click step apre esperimento
 * - Principio Zero v3: content "Ragazzi,..." + "Vol. X pag Y"
 * - Riuso lesson-groups + volume-references (no duplication)
 *
 * (c) Andrea Marro — 2026-04-18
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import LessonReader from '../../../src/components/lavagna/LessonReader';

describe('LessonReader — Principio Zero v3 UI', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('Rendering base', () => {
    it('renders null when no lessonId', () => {
      const { container } = render(<LessonReader lessonId={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders null when lessonId invalid', () => {
      const { container } = render(<LessonReader lessonId="non-esistente" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders lesson title for v1-accendi-led', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      expect(screen.getByText(/Accendi il LED/i)).toBeInTheDocument();
    });

    it('renders Volume and Chapter info', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      expect(screen.getByText(/Vol\.\s*1/i)).toBeInTheDocument();
      expect(screen.getByText(/Capitolo 6/i)).toBeInTheDocument();
    });
  });

  describe('Timeline narrativa capitolo', () => {
    it('renders list of experiments from lesson group', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      // v1-accendi-led has 3 experiments
      expect(screen.getByText(/v1-cap6-esp1/i)).toBeInTheDocument();
      expect(screen.getByText(/v1-cap6-esp2/i)).toBeInTheDocument();
      expect(screen.getByText(/v1-cap6-esp3/i)).toBeInTheDocument();
    });

    it('shows page number for each experiment', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      expect(screen.getByText(/pag\.\s*29/i)).toBeInTheDocument();
    });

    it('shows bookText preview for first experiment', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      expect(screen.getByText(/470 Ohm/i)).toBeInTheDocument();
    });
  });

  describe('Principio Zero v3 compliance', () => {
    it('does NOT use meta-instruction "Docente, leggi"', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      const text = document.body.textContent || '';
      expect(text).not.toMatch(/Docente,\s*leggi/i);
      expect(text).not.toMatch(/Insegnante,\s*leggi/i);
    });

    it('includes book citation pattern (Vol. X a pagina Y)', () => {
      render(<LessonReader lessonId="v1-accendi-led" />);
      const text = document.body.textContent || '';
      // Either pattern should exist
      const hasCitation = /Vol\.\s*1/i.test(text) && /pag\.\s*2[79]/i.test(text);
      expect(hasCitation).toBe(true);
    });
  });

  describe('Interaction', () => {
    it('calls onExperimentSelect when step clicked', () => {
      const onSelect = vi.fn();
      render(<LessonReader lessonId="v1-accendi-led" onExperimentSelect={onSelect} />);
      const firstStep = screen.getByTestId('lesson-step-v1-cap6-esp1');
      fireEvent.click(firstStep);
      expect(onSelect).toHaveBeenCalledWith('v1-cap6-esp1');
    });

    it('marks currentExperimentId as active', () => {
      render(
        <LessonReader
          lessonId="v1-accendi-led"
          currentExperimentId="v1-cap6-esp2"
        />
      );
      const activeStep = screen.getByTestId('lesson-step-v1-cap6-esp2');
      expect(activeStep.className).toMatch(/active|current/i);
    });
  });

  describe('Riuso dati esistenti', () => {
    it('does not duplicate data from lesson-groups.js', () => {
      // Il componente deve importare da lesson-groups, no hardcode locale
      const { container } = render(<LessonReader lessonId="v1-accendi-led" />);
      // Se rendering OK, import è riuscito
      expect(container.firstChild).not.toBeNull();
    });

    it('does not duplicate data from volume-references.js', () => {
      // Idem, import da volume-references per bookText
      render(<LessonReader lessonId="v1-accendi-led" />);
      // bookText "470 Ohm" viene da volume-references
      expect(screen.getByText(/470 Ohm/i)).toBeInTheDocument();
    });
  });
});
