/* © Andrea Marro — 23/05/2026 — ELAB Tutor — Tutti i diritti riservati */
import { describe, it, expect } from 'vitest';
import {
  overlayPortalTarget,
  overlayPortalDisplayStyle,
} from '../../../../src/components/lavagna/overlayPortal';

describe('overlayPortalTarget (L4 helper)', () => {
  it('returns document.body when DOM is available (jsdom env)', () => {
    expect(overlayPortalTarget()).toBe(document.body);
  });

  it('returns a stable reference across calls (same document.body)', () => {
    const first = overlayPortalTarget();
    const second = overlayPortalTarget();
    expect(first).toBe(second);
    expect(first).toBe(document.body);
  });

  it('is a pure function (no side effects on document)', () => {
    const beforeBodyChildren = document.body.children.length;
    overlayPortalTarget();
    overlayPortalTarget();
    overlayPortalTarget();
    expect(document.body.children.length).toBe(beforeBodyChildren);
  });
});

describe('overlayPortalDisplayStyle (L4.1 tab-gate fix)', () => {
  // Codex stop-time review 2026-05-23: il portal L4 scappava al gate
  // display:none di .lavagnaView, mostrando UNLIM su tab non-Lavagna.
  // Questi test sono il guardrail di regressione.

  it('returns undefined when activeTab === lavagna (lascia il CSS visible)', () => {
    expect(overlayPortalDisplayStyle('lavagna')).toBeUndefined();
  });

  it('returns "none" when activeTab === classe (Dashboard docente)', () => {
    expect(overlayPortalDisplayStyle('classe')).toBe('none');
  });

  it('returns "none" when activeTab === progressi (Student dashboard)', () => {
    expect(overlayPortalDisplayStyle('progressi')).toBe('none');
  });

  it('returns "none" when activeTab === lezione (LessonSelector)', () => {
    expect(overlayPortalDisplayStyle('lezione')).toBe('none');
  });

  it('returns "none" for unknown tabs (default safe-hidden)', () => {
    expect(overlayPortalDisplayStyle('qualunque-tab-non-lavagna')).toBe('none');
    expect(overlayPortalDisplayStyle('')).toBe('none');
    expect(overlayPortalDisplayStyle(null)).toBe('none');
    expect(overlayPortalDisplayStyle(undefined)).toBe('none');
  });
});
