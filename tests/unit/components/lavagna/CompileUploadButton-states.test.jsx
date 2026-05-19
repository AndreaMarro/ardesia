/**
 * tests/unit/components/lavagna/CompileUploadButton-states.test.jsx
 *
 * iter 88 UX-6 — 6-state visual machine for the Lavagna "Carica sul kit"
 * CTA when parent passes the optional `uploadState` prop.
 *
 * Coverage (5 tests T1-T5):
 *   T1 state="idle"      → button disabled OR neutral grey + tooltip
 *                          "Compilate prima il programma".
 *   T2 state="armed"     → pulsing class active (state_armed CSS hook)
 *                          OR title tooltip "Collegate Arduino USB".
 *   T3 state="ready"     → solid Lime via state_ready CSS hook + tooltip
 *                          "Pronti! Premete per caricare".
 *   T4 state="uploading" → spinner visible (aria-busy=true) + text label
 *                          "Caricamento...".
 *   T5 prefers-reduced-motion → no animation class injected (CSS @media
 *                               handles this; we assert state_armed class
 *                               STILL applied so docente sees Lime tone
 *                               without animation).
 *
 * Anti-regression: iter 69/76/77 existing tests (CompileUploadButton.test.jsx)
 * cover legacy + demo-mode flows. This file covers the NEW iter 88 UX-6
 * prop surface only — leaves `uploadState` UNDEFINED implicitly disables
 * the override and preserves all prior behavior verbatim.
 *
 * Spec ref: docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md §88.UX-6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import React from 'react';

import CompileUploadButton, {
  UPLOAD_STATES,
  getUploadStateLabels,
} from '../../../../src/components/lavagna/CompileUploadButton.jsx';

// Online status stub so the agent-detect poll resolves quickly without
// triggering a real network probe. UX-6 tests don't care about agent
// availability — they assert the visual surface driven by uploadState.
const statusOnline = async () => ({ available: true, port: 8765 });

describe('CompileUploadButton — UX-6 uploadState visual machine', () => {
  beforeEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('T1 state="idle" → disabled + tooltip "Compilate prima il programma"', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        uploadState={UPLOAD_STATES.IDLE}
      />,
    );
    const btn = await screen.findByRole('button', {
      name: /Carica il programma sul kit fisico Nano R4/i,
    });
    expect(btn).toBeDisabled();
    expect(btn.getAttribute('title')).toBe('Compilate prima il programma');
    expect(btn.getAttribute('data-elab-upload-state')).toBe('idle');
    // aria-disabled mirror-flagged true.
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('T2 state="armed" → pulsing class + tooltip "Collegate Arduino USB"', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        uploadState={UPLOAD_STATES.ARMED}
      />,
    );
    const btn = await screen.findByRole('button');
    // CSS module class active (state_armed hook).
    expect(btn.className).toMatch(/state_armed/);
    expect(btn.getAttribute('title')).toBe('Collegate Arduino USB');
    expect(btn.getAttribute('data-elab-upload-state')).toBe('armed');
    // aria-live polite announcer surfaces docente plurale.
    const announcer = screen.getByTestId('compile-upload-state-announcer');
    expect(announcer.getAttribute('aria-live')).toBe('polite');
    expect(announcer.textContent).toMatch(/Ragazzi/);
  });

  it('T3 state="ready" → solid Lime hook + tooltip "Pronti! Premete per caricare"', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        uploadState={UPLOAD_STATES.READY}
      />,
    );
    const btn = await screen.findByRole('button');
    expect(btn.className).toMatch(/state_ready/);
    expect(btn.getAttribute('title')).toBe('Pronti! Premete per caricare');
    // Ready is enabled — explicit gate.
    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it('T4 state="uploading" → spinner + text "Caricamento..."', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup(){}void loop(){}"
        port="/dev/cu.usb"
        statusImpl={statusOnline}
        uploadState={UPLOAD_STATES.UPLOADING}
      />,
    );
    const btn = await screen.findByRole('button');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    // Tooltip & announcer wired to "Caricamento...".
    expect(btn.getAttribute('title')).toBe('Caricamento...');
    const announcer = screen.getByTestId('compile-upload-state-announcer');
    expect(announcer.textContent).toMatch(/Caricamento/);
    // Button label reflects in-flight state (legacy `label` keeps existing
    // copy when internal `uploading` is false — Lavagna shell uses tooltip
    // + spinner icon to convey progress).
    expect(btn).toBeDisabled();
  });

  it('T5 prefers-reduced-motion → state_armed class STILL applied (CSS @media gates animation only)', async () => {
    // Stub matchMedia to report the user prefers reduced motion. This is
    // honored by the .module.css @media (prefers-reduced-motion: no-preference)
    // gate around .state_armed keyframes — the class itself remains so the
    // Lime tone is preserved; only the animation is suppressed.
    const realMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      render(
        <CompileUploadButton
          sketchCode="void setup(){}void loop(){}"
          port="/dev/cu.usb"
          statusImpl={statusOnline}
          uploadState={UPLOAD_STATES.ARMED}
        />,
      );
      const btn = await screen.findByRole('button');
      // Class still applied — CSS @media handles animation suppression.
      expect(btn.className).toMatch(/state_armed/);
      // Aria announcer present so reduced-motion users still get the cue.
      const announcer = screen.getByTestId('compile-upload-state-announcer');
      expect(announcer.getAttribute('aria-live')).toBe('polite');
      // Tooltip preserved (docente reads plurale instruction).
      expect(btn.getAttribute('title')).toBe('Collegate Arduino USB');
    } finally {
      window.matchMedia = realMatchMedia;
    }
  });
});

describe('getUploadStateLabels helper', () => {
  it('maps all 6 canonical states to plurale "Ragazzi" announcement (except success which celebrates)', () => {
    const idle = getUploadStateLabels(UPLOAD_STATES.IDLE);
    expect(idle.tooltip).toBe('Compilate prima il programma');
    expect(idle.ariaLive).toMatch(/^Ragazzi,/);

    const armed = getUploadStateLabels(UPLOAD_STATES.ARMED);
    expect(armed.tooltip).toBe('Collegate Arduino USB');
    expect(armed.ariaLive).toMatch(/^Ragazzi,/);

    const ready = getUploadStateLabels(UPLOAD_STATES.READY);
    expect(ready.tooltip).toBe('Pronti! Premete per caricare');
    expect(ready.ariaLive).toMatch(/^Ragazzi,/);

    const uploading = getUploadStateLabels(UPLOAD_STATES.UPLOADING);
    expect(uploading.tooltip).toBe('Caricamento...');

    const success = getUploadStateLabels(UPLOAD_STATES.SUCCESS);
    expect(success.tooltip).toBe('Caricato!');

    const error = getUploadStateLabels(UPLOAD_STATES.ERROR);
    expect(error.tooltip).toBe('Riprovate');
    expect(error.ariaLive).toMatch(/^Ragazzi,/);
  });
});
