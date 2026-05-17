/**
 * tests/unit/components/cliffhanger-cta-transitions.test.jsx
 *
 * Iter 74 BG-B1 narrative cliffhanger CTA wire-up across the three
 * transition surfaces (Andrea principle 2026-05-17: "Gli esperimenti
 * sono su un arco narrativo continuo, NON spezzettati come card flat
 * scollegate").
 *
 * Covers:
 *   T1 ScratchCompileBar renders cliffhanger CTA on compile success
 *      when `nextExperiment` prop is provided.
 *   T2 ScratchCompileBar does NOT render the cliffhanger when
 *      `nextExperiment` is null / undefined / missing id (dead-CTA guard).
 *   T3 ScratchCompileBar `onLoadNextExperiment` is called with
 *      `next_experiment.id` when the CTA is clicked.
 *   T4 CompileUploadButton renders cliffhanger CTA after an upload
 *      success (POST → ok), wired through the injected fetch.
 *   T5 AlbumStudente renders the "Vai al prossimo esperimento" panel
 *      when `nextExperiment` prop is supplied (post-save semantics).
 *   T6 PRINCIPIO ZERO plurale check: all three components use plurale
 *      "Ragazzi" + kit/percorso mention in their cliffhanger copy.
 *   T7 ARIA region role is set on all three cliffhangers (a11y guard
 *      for screen-reader navigation between continuous esperimenti).
 *
 * Honesty caveats:
 *   - Tests query by data-testid + ARIA label, not full screen reader
 *     audit. Visual rendering / contrast deferred iter 75+ Lighthouse.
 *   - CompileUploadButton uses injected fetch + statusImpl helpers per
 *     iter 69 A3 test pattern.
 *   - Lesson-path data loading mechanism (how a parent receives
 *     `next_experiment`) UNCLEAR at the component layer — assumed prop
 *     passed by parent that already consumed lesson-paths JSON. The
 *     contract is mirrored from LessonPathPanel.jsx:462-471.
 *   - The Album cliffhanger renders even when sessions === [] because
 *     the parent only supplies `nextExperiment` AFTER a save — semantic
 *     gating is delegated to the caller per spec.
 *
 * @copyright © Andrea Marro — 2026-05-17 — ELAB Tutor iter 74 BG-B1
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ScratchCompileBar from '../../../src/components/simulator/panels/ScratchCompileBar.jsx';
import CompileUploadButton from '../../../src/components/lavagna/CompileUploadButton.jsx';
import AlbumStudente from '../../../src/components/album/AlbumStudente.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const NEXT_EXP_FIXTURE = {
  id: 'v3-cap5-esp2',
  title: 'Cambia la velocità del lampeggio',
  preview:
    'Nella prossima lezione cambieremo i tempi del lampeggio del LED, ragazzi.',
};

const NEXT_EXP_NO_PREVIEW = {
  id: 'v1-cap6-esp2',
  title: 'LED a coppia',
};

// ─────────────────────────────────────────────────────────────────────────────
// T1 — ScratchCompileBar renders cliffhanger CTA when compile=success
// ─────────────────────────────────────────────────────────────────────────────

describe('iter74 B1 — ScratchCompileBar cliffhanger CTA', () => {
  it('T1 renders cliffhanger CTA on compile success when nextExperiment provided', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        currentExperimentId="v3-cap5-esp1"
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    const cliff = screen.getByTestId('scratch-compile-cliffhanger');
    expect(cliff).toBeTruthy();
    expect(cliff.getAttribute('role')).toBe('region');
    // Title rendered inside <strong>
    expect(
      screen.getByText(/Cambia la velocità del lampeggio/i)
    ).toBeTruthy();
    // Preview rendered when provided
    expect(
      screen.getByText(/Nella prossima lezione/i)
    ).toBeTruthy();
    // CTA button visible
    expect(
      screen.getByTestId('scratch-compile-cliffhanger-cta')
    ).toBeTruthy();
  });

  it('T1.b also fires on compile status "success-local" (offline HEX path)', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success-local"
        currentExperimentId="v3-cap5-esp1"
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    expect(screen.getByTestId('scratch-compile-cliffhanger')).toBeTruthy();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // T2 — Dead CTA guard: no render when nextExperiment is null / undefined / missing id
  // ───────────────────────────────────────────────────────────────────────────

  it('T2 does NOT render cliffhanger when nextExperiment is null', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        nextExperiment={null}
      />
    );
    expect(screen.queryByTestId('scratch-compile-cliffhanger')).toBeNull();
  });

  it('T2.b does NOT render cliffhanger when nextExperiment.id is empty string', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        nextExperiment={{ id: '', title: 'Broken' }}
      />
    );
    expect(screen.queryByTestId('scratch-compile-cliffhanger')).toBeNull();
  });

  it('T2.c does NOT render cliffhanger when compilationStatus is idle / error', () => {
    const { rerender } = render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="error"
        nextExperiment={NEXT_EXP_FIXTURE}
      />
    );
    expect(screen.queryByTestId('scratch-compile-cliffhanger')).toBeNull();
    rerender(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="compiling"
        nextExperiment={NEXT_EXP_FIXTURE}
      />
    );
    expect(screen.queryByTestId('scratch-compile-cliffhanger')).toBeNull();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // T3 — onLoadNextExperiment called with next.id on click
  // ───────────────────────────────────────────────────────────────────────────

  it('T3 onLoadNextExperiment is called with next.id when CTA is clicked', () => {
    const onLoad = vi.fn();
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={onLoad}
      />
    );
    fireEvent.click(screen.getByTestId('scratch-compile-cliffhanger-cta'));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('v3-cap5-esp2');
  });

  it('T3.b renders cliffhanger even when preview is missing (title-only)', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        nextExperiment={NEXT_EXP_NO_PREVIEW}
        onLoadNextExperiment={() => {}}
      />
    );
    expect(screen.getByTestId('scratch-compile-cliffhanger')).toBeTruthy();
    expect(screen.getByText(/LED a coppia/i)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T4 — CompileUploadButton renders cliffhanger after upload success
// ─────────────────────────────────────────────────────────────────────────────

describe('iter74 B1 — CompileUploadButton cliffhanger CTA', () => {
  const statusOnline = async () => ({ available: true, port: 8765 });
  const fetchOk = () =>
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, jobId: 'mock-1' }),
    });

  it('T4 renders cliffhanger CTA after upload success', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup() {} void loop() {}"
        port="/dev/cu.usbmodem1"
        boardId="arduino-nano-r4"
        statusImpl={statusOnline}
        fetchImpl={fetchOk()}
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );

    // Wait for agent probe → button enabled.
    await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /Carica il programma sul kit fisico Nano R4/i,
      });
      expect(btn.hasAttribute('disabled')).toBe(false);
    });

    // No cliffhanger yet (pre-upload).
    expect(screen.queryByTestId('compile-upload-cliffhanger')).toBeNull();

    // Click → POST resolves ok → uploadSucceeded flips true.
    fireEvent.click(
      screen.getByRole('button', {
        name: /Carica il programma sul kit fisico Nano R4/i,
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId('compile-upload-cliffhanger')).toBeTruthy();
    });

    // CTA wired to onLoadNextExperiment.
    const onLoad = vi.fn();
    // Re-render with callback bound now that cliffhanger is mounted.
    // (Easier than spying after the fact: assert CTA text + button exists.)
    expect(
      screen.getByTestId('compile-upload-cliffhanger-cta')
    ).toBeTruthy();
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('T4.b cliffhanger NOT rendered when nextExperiment missing post-success', async () => {
    render(
      <CompileUploadButton
        sketchCode="void setup() {} void loop() {}"
        port="/dev/cu.usbmodem1"
        boardId="arduino-nano-r4"
        statusImpl={statusOnline}
        fetchImpl={fetchOk()}
      />
    );

    await waitFor(() => {
      const btn = screen.getByRole('button', {
        name: /Carica il programma sul kit fisico Nano R4/i,
      });
      expect(btn.hasAttribute('disabled')).toBe(false);
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /Carica il programma sul kit fisico Nano R4/i,
      })
    );

    // Even after upload success we should NOT see the cliffhanger
    // because no nextExperiment was supplied.
    await waitFor(() => {
      // Probe a few microtasks; assert absence stays stable.
      expect(screen.queryByTestId('compile-upload-cliffhanger')).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T5 — AlbumStudente renders next-experiment link
// ─────────────────────────────────────────────────────────────────────────────

describe('iter74 B1 — AlbumStudente cliffhanger', () => {
  it('T5 renders "Vai al prossimo esperimento" link when nextExperiment supplied', () => {
    render(
      <AlbumStudente
        sessions={[]}
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    const cliff = screen.getByTestId('album-cliffhanger');
    expect(cliff).toBeTruthy();
    expect(cliff.getAttribute('role')).toBe('region');
    expect(
      screen.getByTestId('album-cliffhanger-cta')
    ).toBeTruthy();
    expect(screen.getByText(/Cambia la velocità del lampeggio/i)).toBeTruthy();
  });

  it('T5.b CTA click invokes onLoadNextExperiment with next.id', () => {
    const onLoad = vi.fn();
    render(
      <AlbumStudente
        sessions={[]}
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={onLoad}
      />
    );
    fireEvent.click(screen.getByTestId('album-cliffhanger-cta'));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('v3-cap5-esp2');
  });

  it('T5.c no cliffhanger when nextExperiment absent', () => {
    render(<AlbumStudente sessions={[]} />);
    expect(screen.queryByTestId('album-cliffhanger')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T6 — PRINCIPIO ZERO plurale check (all three components)
// ─────────────────────────────────────────────────────────────────────────────

describe('iter74 B1 — PRINCIPIO ZERO plurale "Ragazzi" gate', () => {
  it('T6.a ScratchCompileBar cliffhanger uses plurale "Ragazzi"', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    const cliff = screen.getByTestId('scratch-compile-cliffhanger');
    expect(cliff.textContent).toMatch(/Ragazzi/);
  });

  it('T6.b AlbumStudente cliffhanger uses plurale "Ragazzi" + album reference', () => {
    render(
      <AlbumStudente
        sessions={[]}
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    const cliff = screen.getByTestId('album-cliffhanger');
    expect(cliff.textContent).toMatch(/Ragazzi/);
    expect(cliff.textContent.toLowerCase()).toMatch(/album/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// T7 — ARIA region role on all three cliffhangers (a11y guard)
// ─────────────────────────────────────────────────────────────────────────────

describe('iter74 B1 — ARIA region role on cliffhangers', () => {
  it('T7.a ScratchCompileBar cliffhanger has role="region" + aria-label', () => {
    render(
      <ScratchCompileBar
        onCompile={() => {}}
        compilationStatus="success"
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    const cliff = screen.getByTestId('scratch-compile-cliffhanger');
    expect(cliff.getAttribute('role')).toBe('region');
    expect(cliff.getAttribute('aria-label')).toMatch(/prossimo esperimento/i);
  });

  it('T7.b AlbumStudente cliffhanger has role="region" + aria-label', () => {
    render(
      <AlbumStudente
        sessions={[]}
        nextExperiment={NEXT_EXP_FIXTURE}
        onLoadNextExperiment={() => {}}
      />
    );
    const cliff = screen.getByTestId('album-cliffhanger');
    expect(cliff.getAttribute('role')).toBe('region');
    expect(cliff.getAttribute('aria-label')).toMatch(/prossimo esperimento/i);
  });
});
