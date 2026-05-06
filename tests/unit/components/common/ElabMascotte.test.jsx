/**
 * ElabMascotte.test.jsx — Sprint V iter 1 Atom A13.7 (Tester-1)
 *
 * Tests ElabMascotte SVG component states (idle/speaks/listens) + a11y +
 * prefers-reduced-motion respect.
 *
 * IMPORTANT: src/components/common/ElabMascotte.jsx does NOT yet exist
 * (only ElabMascotte.module.css present). WebDesigner-1 Phase 3 ships the
 * .jsx component — until then ALL tests are it.todo per Tester-1 mandate
 * "wait Phase 3 WebDesigner-1 implementation".
 */
import { describe, it, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ElabMascotte states (Sprint V A13.7)', () => {
  it.todo('renders SVG visible + aria-label "Mascotte ELAB Tutor" — wait Phase 3 WebDesigner-1 implementation');
  it.todo('state="speaks" → mouth animation class active — wait Phase 3 WebDesigner-1 implementation');
  it.todo('state="listens" → ear animation class active — wait Phase 3 WebDesigner-1 implementation');
  it.todo('prefers-reduced-motion → animation classes inactive (matchMedia mock) — wait Phase 3 WebDesigner-1 implementation');
  it.todo('no state prop → defaults to idle (no animation classes) — wait Phase 3 WebDesigner-1 implementation');
});
