/**
 * IncrementalBuildHint tests — Sprint Q2.E
 * Andrea Marro 2026-04-25
 *
 * Componente che mostra delta operations per esperimenti con build_circuit.mode='incremental_from_prev'.
 * Display "Da circuito precedente: [op1, op2, ...]" senza pulire canvas.
 *
 * PRINCIPIO ZERO: testo neutro nominale.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IncrementalBuildHint from '../../../../src/components/simulator/IncrementalBuildHint.jsx';

const SAMPLE_DELTA_MODIFY = {
  base_experiment_id: 'v1-cap6-esp1',
  operations: [
    { op: 'modify', target: 'r1', params: { value: 220 } },
  ],
};

const SAMPLE_DELTA_REMOVE = {
  base_experiment_id: 'v1-cap6-esp1',
  operations: [
    { op: 'remove', target: 'r1' },
  ],
};

const SAMPLE_DELTA_ADD = {
  base_experiment_id: 'v1-cap6-esp2',
  operations: [
    { op: 'add', target: 'r1', params: { type: 'resistor', value: 220 } },
    { op: 'add', target: 'led2', params: { type: 'led', color: 'blue' } },
  ],
};

describe('IncrementalBuildHint', () => {
  it('renders base_experiment_id reference', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_MODIFY} />);
    expect(screen.getByText(/v1-cap6-esp1/)).toBeInTheDocument();
  });

  it('renders modify operation as nominal label', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_MODIFY} />);
    expect(screen.getByText(/modifica|modificare/i)).toBeInTheDocument();
    expect(screen.getByText(/r1/)).toBeInTheDocument();
  });

  it('renders remove operation as nominal label', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_REMOVE} />);
    expect(screen.getByText(/rimoz|rimuov/i)).toBeInTheDocument();
  });

  it('renders add operation as nominal label', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_ADD} />);
    expect(screen.getAllByText(/aggiun/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders multiple operations as list', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_ADD} />);
    expect(screen.getByText(/r1/)).toBeInTheDocument();
    expect(screen.getByText(/led2/)).toBeInTheDocument();
  });

  it('shows operation count', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_ADD} />);
    expect(screen.getByText(/2.*operaz|operaz.*2/i)).toBeInTheDocument();
  });

  it('renders nothing when incrementalDelta is null', () => {
    const { container } = render(<IncrementalBuildHint incrementalDelta={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when operations array empty', () => {
    const { container } = render(
      <IncrementalBuildHint incrementalDelta={{ base_experiment_id: 'x', operations: [] }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('has role region for accessibility', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_MODIFY} />);
    expect(screen.getByRole('region', { name: /costruzione|incremental/i })).toBeInTheDocument();
  });

  it('uses neutral nominal language (no imperatives)', () => {
    render(<IncrementalBuildHint incrementalDelta={SAMPLE_DELTA_MODIFY} />);
    // Should NOT contain imperative verbs
    expect(screen.queryByText(/^Modifica /)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Togli /)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Aggiungi /)).not.toBeInTheDocument();
  });
});
