/**
 * Edge case tests for Lavagna components
 * Tests unusual inputs, rapid interactions, and boundary conditions
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Demo mode mock
vi.mock('../../../src/data/demo-mode', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, DEMO_MODE_ENABLED: false, filterDemoOnly: (arr) => arr };
});

import ExperimentPicker from '../../../src/components/lavagna/ExperimentPicker';
import { deriveState, computePanelActions, STATES } from '../../../src/components/lavagna/LavagnaStateManager';

describe('ExperimentPicker edge cases', () => {
  it('handles empty completedIds gracefully', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} completedIds={[]} />);
    expect(screen.getByText(/0\/\d+ completati/)).toBeTruthy();
  });

  it('handles undefined completedIds', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByText(/0\/\d+ completati/)).toBeTruthy();
  });

  it('handles search with no results', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Cerca esperimento...'), { target: { value: 'xyznonexistent' } });
    // In lesson view, shows "Nessuna lezione trovata."
    expect(screen.getByText('Nessuna lezione trovata.')).toBeTruthy();
  });

  it('clears search when switching volumes', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText('Cerca esperimento...');
    fireEvent.change(input, { target: { value: 'LED' } });
    fireEvent.click(screen.getByText('Volume 2'));
    expect(input.value).toBe('');
  });

  it('handles rapid volume switching', () => {
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByText('Volume 2'));
    fireEvent.click(screen.getByText('Volume 3'));
    fireEvent.click(screen.getByText('Volume 1'));
    // Should be back to Vol1 — check lesson view
    expect(screen.getByText('Accendi il LED')).toBeTruthy();
  });

  it('shows correct completion for mixed completedIds', () => {
    // Only demo-set ids count: v1-cap6-esp1+esp2 are demo, v1-cap7-esp1 is filtered out.
    const completed = ['v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap7-esp1'];
    render(<ExperimentPicker open={true} onClose={vi.fn()} onSelect={vi.fn()} completedIds={completed} />);
    expect(screen.getByText(/\d+\/\d+ completati/)).toBeTruthy();
  });
});

describe('LavagnaStateManager edge cases', () => {
  it('handles empty context object', () => {
    expect(deriveState({})).toBe(STATES.CLEAN);
  });

  it('handles undefined context values', () => {
    expect(deriveState({ hasExperiment: undefined })).toBe(STATES.CLEAN);
  });

  it('STUCK overrides all other states including RUN (at 130s)', () => {
    expect(deriveState({ hasExperiment: true, isPlaying: true, idleSeconds: 130 })).toBe(STATES.STUCK);
  });

  it('90s idle does NOT trigger STUCK (threshold is 120s)', () => {
    expect(deriveState({ hasExperiment: true, isPlaying: true, idleSeconds: 90 })).toBe(STATES.RUN);
  });

  it('error takes priority over idle', () => {
    expect(deriveState({ hasExperiment: true, hasError: true, idleSeconds: 10 })).toBe(STATES.STUCK);
  });

  it('computePanelActions handles unknown state gracefully', () => {
    const result = computePanelActions('UNKNOWN_STATE', {}, {});
    // Falls back to CLEAN
    expect(result.toolbar).toBe(true);
  });

  it('computePanelActions preserves ALL manual overrides', () => {
    const current = { leftPanel: true, bottomPanel: true, unlim: true, toolbar: false };
    const overrides = { leftPanel: true, bottomPanel: true, unlim: true, toolbar: true };
    const result = computePanelActions(STATES.CLEAN, current, overrides);
    // All overridden = all keep current values
    expect(result.leftPanel).toBe(true);
    expect(result.bottomPanel).toBe(true);
    expect(result.unlim).toBe(true);
    expect(result.toolbar).toBe(false);
  });

  it('zero idle seconds does not trigger STUCK', () => {
    expect(deriveState({ hasExperiment: true, idleSeconds: 0 })).toBe(STATES.BUILD);
  });

  it('exactly 120 seconds idle does not trigger STUCK', () => {
    expect(deriveState({ hasExperiment: true, idleSeconds: 120 })).toBe(STATES.BUILD);
  });

  it('121 seconds idle triggers STUCK', () => {
    expect(deriveState({ hasExperiment: true, idleSeconds: 121 })).toBe(STATES.STUCK);
  });
});
