/**
 * Goal C — Play/Pause/Stop 3-button UX (più Reset come quarto bottone)
 *
 * Verifica state matrix Andrea verbatim "play e pausa e stop":
 *   stopped (isRunning=false, isPaused=false) -> Play enabled, Pause/Stop disabled
 *   running (isRunning=true,  isPaused=false) -> Play disabled, Pause+Stop enabled
 *   paused  (isRunning=false, isPaused=true ) -> Play "Riprendi" enabled, Pause disabled, Stop enabled
 *   non-Arduino -> Play/Pause/Stop nascosti, Reset sempre visibile
 *
 * Coerente con tests/unit/components/simulator/panels/MinimalControlBar.test.jsx —
 * questo file vive un livello più in alto (richiesto plan 27/05) per
 * isolare la matrice Goal C dai test overflow legacy.
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MinimalControlBar from '../../../../src/components/simulator/panels/MinimalControlBar';

const experiment = { id: 'v1-cap6-esp1', title: 'Accendi il tuo primo LED' };

const renderBar = (overrides = {}) => {
  const defaults = {
    experiment,
    experimentName: experiment.title,
    isRunning: false,
    isPaused: false,
    isArduinoExperiment: true,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onStop: vi.fn(),
    onReset: vi.fn(),
    onBack: vi.fn(),
    onAskUNLIM: vi.fn(),
  };
  const props = { ...defaults, ...overrides };
  return { props, ...render(<MinimalControlBar {...props} />) };
};

const PLAY_LABEL = 'Avvia simulazione';
const RESUME_LABEL = 'Riprendi simulazione';
const PAUSE_LABEL = 'Sospendi simulazione';
const STOP_LABEL = 'Ferma simulazione e azzera tempo';
const RESET_LABEL = 'Azzera circuito';

describe('MinimalControlBar Goal C — disabled-state matrix', () => {
  it('stopped state: Play enabled, Pause+Stop disabled, Reset enabled', () => {
    renderBar({ isRunning: false, isPaused: false });

    expect(screen.getByRole('button', { name: PLAY_LABEL })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: PAUSE_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: RESET_LABEL })).not.toBeDisabled();
  });

  it('running state: Play disabled, Pause+Stop+Reset enabled', () => {
    renderBar({ isRunning: true, isPaused: false });

    expect(screen.getByRole('button', { name: PLAY_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: PAUSE_LABEL })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: STOP_LABEL })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: RESET_LABEL })).not.toBeDisabled();
  });

  it('paused state: Play "Riprendi" enabled, Pause disabled, Stop+Reset enabled', () => {
    renderBar({ isRunning: false, isPaused: true });

    expect(screen.getByRole('button', { name: RESUME_LABEL })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: PAUSE_LABEL })).toBeDisabled();
    expect(screen.getByRole('button', { name: STOP_LABEL })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: RESET_LABEL })).not.toBeDisabled();
  });
});

describe('MinimalControlBar Goal C — handler invocations', () => {
  it('clicking Play invokes onPlay from stopped state', () => {
    const { props } = renderBar({ isRunning: false, isPaused: false });
    fireEvent.click(screen.getByRole('button', { name: PLAY_LABEL }));
    expect(props.onPlay).toHaveBeenCalledTimes(1);
  });

  it('clicking Play "Riprendi" invokes onPlay from paused state (resume)', () => {
    const { props } = renderBar({ isRunning: false, isPaused: true });
    fireEvent.click(screen.getByRole('button', { name: RESUME_LABEL }));
    expect(props.onPlay).toHaveBeenCalledTimes(1);
  });

  it('clicking Pause invokes onPause from running state', () => {
    const { props } = renderBar({ isRunning: true, isPaused: false });
    fireEvent.click(screen.getByRole('button', { name: PAUSE_LABEL }));
    expect(props.onPause).toHaveBeenCalledTimes(1);
  });

  it('clicking Stop invokes onStop from running state', () => {
    const { props } = renderBar({ isRunning: true, isPaused: false });
    fireEvent.click(screen.getByRole('button', { name: STOP_LABEL }));
    expect(props.onStop).toHaveBeenCalledTimes(1);
  });

  it('clicking Stop invokes onStop from paused state', () => {
    const { props } = renderBar({ isRunning: false, isPaused: true });
    fireEvent.click(screen.getByRole('button', { name: STOP_LABEL }));
    expect(props.onStop).toHaveBeenCalledTimes(1);
  });

  it('clicking Reset invokes onReset regardless of state', () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByRole('button', { name: RESET_LABEL }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });
});

describe('MinimalControlBar Goal C — ARIA labels (italiano)', () => {
  it('exposes Italian ARIA labels for all 4 control buttons', () => {
    renderBar({ isRunning: false, isPaused: false });
    expect(screen.getByRole('button', { name: PLAY_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: PAUSE_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: STOP_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeInTheDocument();
  });

  it('Play label switches to "Riprendi simulazione" when paused', () => {
    renderBar({ isRunning: false, isPaused: true });
    expect(screen.queryByRole('button', { name: PLAY_LABEL })).toBeNull();
    expect(screen.getByRole('button', { name: RESUME_LABEL })).toBeInTheDocument();
  });
});

describe('MinimalControlBar Goal C — non-Arduino gate', () => {
  it('hides Play/Pause/Stop for non-Arduino experiments, keeps Reset', () => {
    renderBar({ isArduinoExperiment: false });

    expect(screen.queryByRole('button', { name: PLAY_LABEL })).toBeNull();
    expect(screen.queryByRole('button', { name: PAUSE_LABEL })).toBeNull();
    expect(screen.queryByRole('button', { name: STOP_LABEL })).toBeNull();
    expect(screen.getByRole('button', { name: RESET_LABEL })).toBeInTheDocument();
  });
});
