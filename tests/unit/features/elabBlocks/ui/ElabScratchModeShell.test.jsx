import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ElabScratchModeShell } from '../../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx';

describe('ElabScratchModeShell — iter-102 ridisegno composizione', () => {
  it('T1: renders children', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={3} onStarterClick={() => {}}>
        <div data-testid="child-marker">SCRATCH EDITOR PLACEHOLDER</div>
      </ElabScratchModeShell>
    );
    expect(screen.getByTestId('child-marker')).toBeInTheDocument();
  });

  it('T2: iter-102 — no redundant "ELAB Scratch Arduino" header bar', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={3} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    // L'header blu ridondante è stato rimosso nel ridisegno iter-102.
    expect(screen.queryByText('ELAB Scratch Arduino')).not.toBeInTheDocument();
  });

  it('T3: shows skeleton aria-hidden when NOT ready (mount slow mitigation)', () => {
    const { container } = render(
      <ElabScratchModeShell workspaceReady={false} workspaceBlockCount={0} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('T4: shows starter strip when workspace ready AND empty (block count ≤ 1)', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={1} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.getByRole('button', { name: /Accendi un LED/i })).toBeInTheDocument();
    expect(screen.getByText(/da dove cominciamo/i)).toBeInTheDocument();
  });

  it('T5: hides starter strip when workspace has user blocks (count > 1)', () => {
    render(
      <ElabScratchModeShell workspaceReady workspaceBlockCount={5} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.queryByRole('button', { name: /Accendi un LED/i })).not.toBeInTheDocument();
  });

  it('T6: hides starter strip when disableAutoStarters true (teacher mode opt-out)', () => {
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

  it('T8: starter strip hidden until workspace ready (gated on workspaceReady)', () => {
    render(
      <ElabScratchModeShell workspaceReady={false} workspaceBlockCount={0} onStarterClick={() => {}}>
        <div />
      </ElabScratchModeShell>
    );
    expect(screen.queryByRole('button', { name: /Accendi un LED/i })).not.toBeInTheDocument();
  });
});
