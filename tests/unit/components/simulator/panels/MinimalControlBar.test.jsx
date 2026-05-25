import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MinimalControlBar from '../../../../../src/components/simulator/panels/MinimalControlBar';

describe('MinimalControlBar — Fumetto overflow action', () => {
  it('prefers the in-page Fumetto action over the legacy PDF report action', () => {
    const onOpenFumetto = vi.fn();
    const onGenerateReport = vi.fn();

    render(
      <MinimalControlBar
        experiment={{ id: 'v1-cap6-esp1', title: 'Accendi il tuo primo LED' }}
        experimentName="Accendi il tuo primo LED"
        isRunning={false}
        isArduinoExperiment={false}
        onReset={vi.fn()}
        onBack={vi.fn()}
        onAskUNLIM={vi.fn()}
        onOpenFumetto={onOpenFumetto}
        onGenerateReport={onGenerateReport}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Strumenti e opzioni' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Fumetto Report' }));

    expect(onOpenFumetto).toHaveBeenCalledTimes(1);
    expect(onGenerateReport).not.toHaveBeenCalled();
  });
});

describe('MinimalControlBar — Play / Stop / Pause explicit 3-button cluster (Andrea 2026-05-26)', () => {
  const baseProps = (overrides = {}) => ({
    experiment: { id: 'v3-cap6-esp4', title: 'Due LED che si alternano', icon: 'arduino' },
    experimentName: 'Due LED che si alternano',
    isArduinoExperiment: true,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onReset: vi.fn(),
    onBack: vi.fn(),
    isRunning: false,
    ...overrides,
  });

  it('renders Play + Pause + Stop as three distinct buttons when Arduino experiment + NOT running', () => {
    render(<MinimalControlBar {...baseProps({ isRunning: false })} />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });

  it('Play button is enabled and Pause is disabled when NOT running', () => {
    render(<MinimalControlBar {...baseProps({ isRunning: false })} />);
    expect(screen.getByRole('button', { name: 'Play' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeDisabled();
  });

  it('Play button is disabled and Pause is enabled when running', () => {
    render(<MinimalControlBar {...baseProps({ isRunning: true })} />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pausa' })).not.toBeDisabled();
  });

  it('clicking Play invokes onPlay (not onPause or onReset)', () => {
    const props = baseProps({ isRunning: false });
    render(<MinimalControlBar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(props.onPlay).toHaveBeenCalledTimes(1);
    expect(props.onPause).not.toHaveBeenCalled();
    expect(props.onReset).not.toHaveBeenCalled();
  });

  it('clicking Pause invokes onPause (not onPlay or onReset)', () => {
    const props = baseProps({ isRunning: true });
    render(<MinimalControlBar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pausa' }));
    expect(props.onPause).toHaveBeenCalledTimes(1);
    expect(props.onPlay).not.toHaveBeenCalled();
    expect(props.onReset).not.toHaveBeenCalled();
  });

  it('clicking Stop invokes onReset (Stop = halt + reset semantic, Andrea ratified)', () => {
    const props = baseProps({ isRunning: true });
    render(<MinimalControlBar {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
    expect(props.onPlay).not.toHaveBeenCalled();
    expect(props.onPause).not.toHaveBeenCalled();
  });

  it('Stop button has title "Ferma simulazione" (rename from "Resetta simulazione")', () => {
    render(<MinimalControlBar {...baseProps()} />);
    expect(screen.getByRole('button', { name: 'Stop' })).toHaveAttribute('title', 'Ferma simulazione');
  });

  it('Stop is still visible when experiment is NOT Arduino (non-Arduino experiments only show Stop)', () => {
    render(<MinimalControlBar {...baseProps({ isArduinoExperiment: false })} />);
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pausa' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
  });
});
