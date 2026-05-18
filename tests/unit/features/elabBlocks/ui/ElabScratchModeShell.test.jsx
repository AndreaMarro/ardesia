import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ElabScratchModeShell } from '../../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx';

describe('ElabScratchModeShell — Sub-project A iter 84 atom 7 wrap', () => {
  it('T1: renders children + title default', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={3} onStarterClick={() => {}}>
        <div data-testid="child-marker">SCRATCH EDITOR PLACEHOLDER</div>
      </ElabScratchModeShell>
    );
    expect(screen.getByText('ELAB Scratch Arduino')).toBeInTheDocument();
    expect(screen.getByTestId('child-marker')).toBeInTheDocument();
  });

  it('T2: shows loading pill PRINCIPIO ZERO plurale when workspace NOT ready', () => {
    render(
      <ElabScratchModeShell workspaceReady={false} workspaceBlockCount={0} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.getByRole('status')).toHaveTextContent(/Ragazzi/);
    expect(screen.getByRole('status')).toHaveTextContent(/blocchi/);
  });

  it('T3: shows skeleton aria-hidden when NOT ready (F4 mount slow mitigation)', () => {
    const { container } = render(
      <ElabScratchModeShell workspaceReady={false} workspaceBlockCount={0} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('T4: shows StarterButtons overlay when workspace ready AND empty (block count ≤ 1)', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={1} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.getByRole('button', { name: /Accendi un LED/i })).toBeInTheDocument();
    expect(screen.getByText(/da dove cominciamo/i)).toBeInTheDocument();
  });

  it('T5: hides StarterButtons overlay when workspace has user blocks (count > 1)', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={5} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.queryByRole('button', { name: /Accendi un LED/i })).not.toBeInTheDocument();
  });

  it('T6: hides StarterButtons when disableAutoStarters true (teacher mode opt-out)', () => {
    render(
      <ElabScratchModeShell
        workspaceReady
        workspaceBlockCount={0}
        onStarterClick={() => {}}
        disableAutoStarters
      >
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.queryByRole('button', { name: /Accendi un LED/i })).not.toBeInTheDocument();
  });

  it('T7: clicking starter delegates to onStarterClick callback', () => {
    const handler = vi.fn();
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={1} onStarterClick={handler}>
        <div />
      </ElabScratchModeShell>
    );
    fireEvent.click(screen.getByRole('button', { name: /Leggi un pulsante/i }));
    expect(handler).toHaveBeenCalledWith('button');
  });

  it('T8: custom title overrides default', () => {
    render(
      <ElabScratchModeShell
        workspaceReady
        workspaceBlockCount={3}
        onStarterClick={() => {}}
        title="Modalità Esperto Arduino"
      >
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.getByText('Modalità Esperto Arduino')).toBeInTheDocument();
    expect(screen.queryByText('ELAB Scratch Arduino')).not.toBeInTheDocument();
  });
});
