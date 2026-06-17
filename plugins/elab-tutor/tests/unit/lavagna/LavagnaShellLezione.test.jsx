/**
 * LavagnaShell — Lezione Guidata tab integration tests
 * TDD: test scritto prima dell'implementazione (governance rule 2)
 * (c) Andrea Marro — 2026-04-18
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'teacher1' }, isDocente: true, isStudente: false }),
}));

vi.mock('../../../src/services/classProfile', () => ({
  buildClassProfile: vi.fn(() => ({
    isFirstTime: false, lastExperimentTitle: 'LED', sessionsCount: 3,
  })),
  getNextLessonSuggestion: vi.fn(() => ({
    experimentId: 'v1-cap6-esp1', title: 'Accendi il LED',
  })),
}));

vi.mock('../../../src/services/wakeWord', () => ({
  isWakeWordSupported: () => false,
  startWakeWordListener: () => false,
  stopWakeWordListener: () => {},
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../src/components/simulator/NewElabSimulator', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-simulator' }, 'Simulator'),
}));

vi.mock('../../../src/components/teacher/TeacherDashboard', () => ({
  default: () => React.createElement('div', null, 'TeacherDashboard'),
}));

vi.mock('../../../src/components/student/StudentDashboard', () => ({
  default: () => React.createElement('div', null, 'StudentDashboard'),
}));

vi.mock('../../../src/components/lavagna/VolumeViewer', () => ({
  default: () => null,
}));

vi.mock('../../../src/components/lavagna/PercorsoPanel', () => ({
  default: () => null,
}));

vi.mock('../../../src/components/simulator/canvas/DrawingOverlay', () => ({
  default: () => null,
}));

vi.mock('../../../src/components/lavagna/ExperimentPicker', () => ({
  default: () => null,
}));

import LavagnaShell from '../../../src/components/lavagna/LavagnaShell';

function clickLezioneTab() {
  const tab = screen.getByRole('button', { name: /Lezione Guidata/i });
  fireEvent.click(tab);
}

describe('LavagnaShell — Lezione Guidata tab', () => {
  beforeEach(() => {
    cleanup();
    delete window.__ELAB_API;
    localStorage.clear();
    localStorage.setItem('elab_skip_bentornati', 'true');
  });

  it('renders "Lezione Guidata" tab button', () => {
    render(<LavagnaShell />);
    expect(screen.getByRole('button', { name: /Lezione Guidata/i })).toBeInTheDocument();
  });

  it('switches to LessonReader view when tab clicked', () => {
    render(<LavagnaShell />);
    clickLezioneTab();
    expect(screen.getByRole('heading', { name: /Accendi il LED/i })).toBeInTheDocument();
  });

  it('marks lezione tab as active after click', () => {
    render(<LavagnaShell />);
    const tab = screen.getByRole('button', { name: /Lezione Guidata/i });
    fireEvent.click(tab);
    expect(tab.className).toMatch(/active/i);
  });

  it('shows experiment timeline with page references', () => {
    render(<LavagnaShell />);
    clickLezioneTab();
    expect(screen.getByTestId('lesson-step-v1-cap6-esp1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-step-v1-cap6-esp2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-step-v1-cap6-esp3')).toBeInTheDocument();
  });

  it('calls __ELAB_API.mountExperiment when step clicked', () => {
    const mockMount = vi.fn();
    window.__ELAB_API = { mountExperiment: mockMount, on: vi.fn(), loadExperiment: vi.fn() };
    render(<LavagnaShell />);
    clickLezioneTab();
    const step = screen.getByTestId('lesson-step-v1-cap6-esp1');
    fireEvent.click(step);
    expect(mockMount).toHaveBeenCalledWith('v1-cap6-esp1');
  });

  it('does not show "Docente leggi" in lezione tab', () => {
    render(<LavagnaShell />);
    clickLezioneTab();
    const text = document.body.textContent || '';
    expect(text).not.toMatch(/Docente,\s*leggi/i);
  });
});
