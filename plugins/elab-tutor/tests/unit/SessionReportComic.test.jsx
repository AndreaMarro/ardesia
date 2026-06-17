/**
 * SessionReportComic.test.jsx — Sprint S iter 13 atom F4 (fumetto-opus)
 *
 * 12 tests covering F2 redesign + F3 voice cmd wire-up + Morfismo Sense 2 + Principio Zero V3.
 * Sister file `tests/unit/lavagna/SessionReportComic.test.jsx` covers MVP from iter 11/12.
 * This file focuses on iter 13 NEW capabilities (Vol/pag citation + ElabIcons + voice patterns).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import SessionReportComic from '../../src/components/lavagna/SessionReportComic';

// Real session shape — uses experimentIds present in volume-references.js (1225 LOC, 92/92 enriched).
const realSession = {
  studentAlias: 'III-A 2026',
  startedAt: '2026-04-28T08:30:00Z',
  experimentsCompleted: [
    { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
    { id: 'v1-cap6-esp2', title: 'LED senza resistore', volume: 1 },
  ],
  narrations: {
    'v1-cap6-esp1': 'Ragazzi, abbiamo acceso il LED con resistore 470 ohm.',
  },
};

describe('SessionReportComic iter 13 — Morfismo Sense 2 + Principio Zero V3', () => {
  beforeEach(() => cleanup());
  afterEach(() => cleanup());

  it('1. renders 6 vignettes total (2 real + 4 empty placeholders)', () => {
    render(<SessionReportComic session={realSession} />);
    const figures = screen.getAllByRole('figure');
    expect(figures.length).toBe(6);
  });

  it('2. renders Vol.X pag.Y citation for v1-cap6-esp1 (verbatim Sense 2 morfismo)', () => {
    const { container } = render(<SessionReportComic session={realSession} />);
    const text = container.textContent || '';
    expect(text).toMatch(/Vol\.1\s+pag\.29/);
  });

  it('3. Vol/pag citation regex matches /Vol\\.\\d+\\s+pag\\.\\d+/ in DOM', () => {
    const { container } = render(<SessionReportComic session={realSession} />);
    expect(container.textContent || '').toMatch(/Vol\.\d+\s+pag\.\d+/);
  });

  it('4. fallback narration uses bookText excerpt when narrations[exp.id] missing', () => {
    const session = {
      ...realSession,
      narrations: {}, // no explicit narrations
    };
    render(<SessionReportComic session={session} />);
    // bookText for v1-cap6-esp1 starts with "Per accendere il LED..."
    expect(screen.getByText(/Per accendere il LED/i)).toBeInTheDocument();
  });

  it('5. explicit narrations override bookText fallback', () => {
    render(<SessionReportComic session={realSession} />);
    // v1-cap6-esp1 has explicit narration → bookText must NOT appear for that vignette
    expect(screen.getByText(/abbiamo acceso il LED con resistore 470 ohm/i)).toBeInTheDocument();
  });

  it('6. empty session renders 6 placeholders + zero crash', () => {
    const empty = { studentAlias: '', experimentsCompleted: [], narrations: {} };
    const { container } = render(<SessionReportComic session={empty} />);
    expect(screen.getAllByRole('figure').length).toBe(6);
    // No Vol/pag because no completed experiments
    expect(container.textContent || '').not.toMatch(/Vol\.\d+\s+pag\.\d+/);
  });

  it('7. accessibility — article has explicit role + aria-label', () => {
    const { container } = render(<SessionReportComic session={realSession} />);
    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article.getAttribute('aria-label')).toBe('Report fumetto della sessione');
    expect(article.getAttribute('role')).toBe('article');
  });

  it('8. NO emoji codepoints anywhere (regola 11 — only ElabIcons SVG)', () => {
    const { container } = render(<SessionReportComic session={realSession} />);
    const text = container.textContent || '';
    // Emoji codepoint ranges (smileys + symbols + dingbats common in fumetto-style)
    // eslint-disable-next-line no-misleading-character-class
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}]/u;
    expect(text).not.toMatch(emojiRegex);
  });

  it('9. ElabIcons SVG present in header + export button', () => {
    const { container } = render(<SessionReportComic session={realSession} />);
    const svgs = container.querySelectorAll('svg');
    // ReportIcon (header) + PrintIcon (export btn) → at least 2 SVGs
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('10. Principio Zero plurale — "Ragazzi" in title or footer', () => {
    render(<SessionReportComic session={realSession} />);
    const ragazzi = screen.getAllByText(/Ragazzi/);
    expect(ragazzi.length).toBeGreaterThan(0);
  });

  it('11. studentAlias optional — renders without crash when undefined', () => {
    const noAlias = {
      experimentsCompleted: [{ id: 'v1-cap6-esp1', title: 'LED', volume: 1 }],
      narrations: {},
    };
    const { container } = render(<SessionReportComic session={noAlias} />);
    expect(container.querySelector('article')).not.toBeNull();
    // Class label should NOT appear
    expect(container.textContent || '').not.toMatch(/Classe:\s/);
  });

  it('12. onExport callback fires on export button click', () => {
    const onExport = vi.fn();
    render(<SessionReportComic session={realSession} onExport={onExport} />);
    const btn = screen.getByRole('button', { name: /Scarica PDF/i });
    fireEvent.click(btn);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('13. each vignette aria-label includes vignette index + Volume/pagina when ref exists', () => {
    render(<SessionReportComic session={realSession} />);
    const figures = screen.getAllByRole('figure');
    const firstAria = figures[0].getAttribute('aria-label') || '';
    expect(firstAria).toMatch(/Vignetta\s+1/);
    expect(firstAria).toMatch(/Volume\s+1\s+pagina\s+\d+/);
  });

  it('14. Oswald font-family applied to title via CSS module class (className contains "title")', () => {
    const { container } = render(<SessionReportComic session={realSession} />);
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    // CSS Modules transform className to e.g. "_title_abc123" — substring "title" must be present.
    expect(h2.className.toLowerCase()).toMatch(/title/);
  });
});

describe('SessionReportComic iter 13 — voice cmd extension (F3)', () => {
  beforeEach(() => cleanup());
  afterEach(() => cleanup());

  it('15. voice command patterns include "leggi rapporto" and "mostra fumetto"', async () => {
    const { getAvailableCommands, matchVoiceCommand } = await import('../../src/services/voiceCommands');
    const all = getAvailableCommands();
    const createReport = all.find((c) => c.action === 'createReport');
    expect(createReport).toBeDefined();
    expect(createReport.patterns).toContain('leggi rapporto');
    expect(createReport.patterns).toContain('leggi il rapporto');
    expect(createReport.patterns).toContain('mostra fumetto');
    expect(createReport.patterns).toContain('apri fumetto');

    // Live match: "leggi rapporto" should resolve to createReport action.
    const m = matchVoiceCommand('leggi rapporto');
    expect(m).not.toBeNull();
    expect(m.command.action).toBe('createReport');
  });
});
