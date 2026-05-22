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
