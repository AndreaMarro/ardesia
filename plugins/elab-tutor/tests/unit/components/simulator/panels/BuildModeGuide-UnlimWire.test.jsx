/**
 * tests/unit/components/simulator/panels/BuildModeGuide-UnlimWire.test.jsx
 *
 * Wave 2 X.3b Impl-F atom (Option C — wire UNLIM chat into BuildModeGuide).
 *
 * Closes iter 36 PM Passo Passo regression (9+ iter carryover):
 * 1. UNLIM chat panel mounts inside BuildModeGuide (not LessonReader).
 * 2. activeLessonId is NOT hardcoded — flows from prop, defaults to
 *    experiment.id (NOT the legacy 'v1-accendi-led').
 * 3. AZIONE:highlight:<id> tags route through blocklyHighlightBridge.
 *
 * Tests use React Testing Library to render BuildModeGuide and assert
 * on the wire-up surface — NOT on chat content, which lives in
 * useGalileoChat (covered separately).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import BuildModeGuide from '../../../../../src/components/simulator/panels/BuildModeGuide';

// ── Fixtures ───────────────────────────────────────────────
const SAMPLE_EXPERIMENT = {
  id: 'v3-cap6-esp4',
  title: 'Due LED che si alternano',
  icon: 'arduino',
  buildSteps: [
    {
      step: 1,
      text: 'Ragazzi, collegate il LED rosso sul pin 6 (Vol3 pag 54).',
      hint: 'Verificate insieme: anodo lungo verso il resistore.',
      componentId: 'led1',
    },
    {
      step: 2,
      text: 'Ragazzi, collegate il LED blu sul pin 9 (Vol3 pag 54).',
      componentId: 'led2',
    },
  ],
};

beforeEach(() => {
  // Reset any global stubs
  if (typeof window !== 'undefined') {
    delete window.__ELAB_BLOCKLY_WORKSPACE;
  }
  vi.restoreAllMocks();
});

describe('BuildModeGuide — UNLIM chat wire (Option C)', () => {
  it('renders a UNLIM panel region when an experiment is provided', () => {
    render(
      <BuildModeGuide
        experiment={SAMPLE_EXPERIMENT}
        currentStep={-1}
        activeLessonId="v3-cap6-esp4"
        onStepChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // UNLIM mount surface — a labelled region the chat hook would render into.
    expect(screen.getByTestId('build-mode-guide-unlim-panel')).toBeInTheDocument();
  });

  it('exposes the activeLessonId from props (NOT the hardcoded v1-accendi-led)', () => {
    render(
      <BuildModeGuide
        experiment={SAMPLE_EXPERIMENT}
        currentStep={-1}
        activeLessonId="v3-cap6-esp4"
        onStepChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const panel = screen.getByTestId('build-mode-guide-unlim-panel');
    // The lessonId attribute on the panel must reflect the prop, not the
    // legacy LavagnaShell hardcode.
    expect(panel.getAttribute('data-lesson-id')).toBe('v3-cap6-esp4');
    expect(panel.getAttribute('data-lesson-id')).not.toBe('v1-accendi-led');
  });

  it('falls back to experiment.id when activeLessonId is not provided', () => {
    render(
      <BuildModeGuide
        experiment={SAMPLE_EXPERIMENT}
        currentStep={-1}
        onStepChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const panel = screen.getByTestId('build-mode-guide-unlim-panel');
    expect(panel.getAttribute('data-lesson-id')).toBe('v3-cap6-esp4');
    // Critical regression guard: no defaulting to v1-accendi-led
    expect(panel.getAttribute('data-lesson-id')).not.toBe('v1-accendi-led');
  });

  it('renders the build-step pane next to the UNLIM panel (routing: BuildModeGuide owns step rendering in passo-passo)', () => {
    render(
      <BuildModeGuide
        experiment={SAMPLE_EXPERIMENT}
        currentStep={0}
        activeLessonId="v3-cap6-esp4"
        onStepChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // Step-1 text must be visible inside the guide; chat panel must coexist.
    expect(
      screen.getByText(/Ragazzi, collegate il LED rosso sul pin 6 \(Vol3 pag 54\)\./),
    ).toBeInTheDocument();
    expect(screen.getByTestId('build-mode-guide-unlim-panel')).toBeInTheDocument();
  });

  it('handles AZIONE:highlight tags via the blocklyHighlightBridge when triggered', () => {
    // Stub a workspace with the expected block
    const select = vi.fn();
    window.__ELAB_BLOCKLY_WORKSPACE = {
      getBlockById(id) {
        if (id === 'arduino_pin_mode_1') return { id, select };
        return null;
      },
    };
    render(
      <BuildModeGuide
        experiment={SAMPLE_EXPERIMENT}
        currentStep={0}
        activeLessonId="v3-cap6-esp4"
        onStepChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // The component exposes a window-level event hook for UNLIM responses.
    const evt = new CustomEvent('elab:unlim:response', {
      detail: { text: 'Ragazzi, guardate [AZIONE:highlight:arduino_pin_mode_1]' },
    });
    act(() => { window.dispatchEvent(evt); });
    // The bridge must have resolved + selected the block.
    expect(select).toHaveBeenCalledTimes(1);
    // Re-query the panel after the React state flush — its attribute must
    // reflect the latest highlight count.
    const panelAfter = screen.getByTestId('build-mode-guide-unlim-panel');
    expect(panelAfter.getAttribute('data-last-highlight-count')).toBe('1');
  });
});

describe('BuildModeGuide — passo-passo regression guards (iter 36 PM)', () => {
  it('does NOT mount when experiment is missing buildSteps (LessonReader path is wrong here)', () => {
    const { container } = render(
      <BuildModeGuide
        experiment={{ id: 'v3-cap6-esp4', title: 'X', buildSteps: [] }}
        currentStep={-1}
        activeLessonId="v3-cap6-esp4"
        onStepChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    // BuildModeGuide must early-return null for buildSteps.length === 0.
    expect(container.firstChild).toBeNull();
  });

  it('advances step via the Avanti button without touching activeLessonId', () => {
    const onStepChange = vi.fn();
    render(
      <BuildModeGuide
        experiment={SAMPLE_EXPERIMENT}
        currentStep={-1}
        activeLessonId="v3-cap6-esp4"
        onStepChange={onStepChange}
        onClose={vi.fn()}
      />,
    );
    // "Premi Avanti" appears in intro copy too — narrow to the nav button text
    fireEvent.click(screen.getByText(/Avanti →/));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });
});
