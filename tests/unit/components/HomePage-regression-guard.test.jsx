/**
 * HomePage-regression-guard.test.jsx — iter 63 P0.6 B3 anti-regression guard
 *
 * Andrea iter 41 PM 2026-05-05 verbatim mandate:
 *   "è tornato questo, segnati che non deve accadere"
 *
 * Prod deploy `dpl_GvRZwSyfwnWW8FearcxCFf5fbAwL` 14:15 GMT+2 introdusse versione
 * regredita HomePage con tokens specifici BAD (sottotitolo "Kit fisici + volumi
 * + software morfico" + 3-card CHATBOT UNLIM/GLOSSARIO "Fatto da Tea"/LAVAGNA
 * + mascotte robot blu/verde con cuffie).
 *
 * Questo test guard è anti-regression: ASSERTA che TUTTI i token BAD sono ASSENTI
 * dal render corrente HomePage.jsx. Se riappare, il test FAIL e blocca commit/push
 * via pre-commit hook + pre-push hook (CLAUDE.md "Anti-regressione FERREA").
 *
 * Pattern: negative assertions (queryBy* + .not.toBeInTheDocument). NO positive
 * assertion contenuto specifico GOOD (quello è in HomePage.test.jsx Sprint V iter
 * 1 Atom A13.6). Pulizia separazione responsabilità.
 *
 * Anti-regression scope iter 41 PM evidence:
 *   - Sottotitolo "Kit fisici + volumi + software morfico." (line-exact)
 *   - Card "CHATBOT UNLIM" letterale label
 *   - Badge "Fatto da Tea" (vecchio attribution Glossario card)
 *   - 3-card grid struttura (CURRENT è 4-card iter 36-37 + Sprint V evolution)
 *   - Mascotte robot blu/verde fallback PNG (CURRENT è ElabMascotte SVG iter 42)
 *
 * Reference: memory/feedback_homepage_old_version_regression.md (Andrea 2026-05-05).
 *
 * Iter 63 P0.6 — Claude MacBook author 2026-05-15.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import HomePage from '../../../src/components/HomePage.jsx';

vi.mock('../../../src/components/HomeCronologia.jsx', () => ({
  default: () => <div data-testid="home-cronologia-mock">Cronologia</div>,
}));

beforeEach(() => {
  if (window.localStorage && typeof window.localStorage.getItem === 'function') {
    if (window.localStorage.getItem.mockReturnValue) {
      window.localStorage.getItem.mockReturnValue(null);
    }
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('HomePage regression guard — iter 41 PM BAD version anti-regression', () => {
  it('does NOT render sottotitolo "Kit fisici + volumi + software morfico" (iter 41 PM regression token)', () => {
    const { container } = render(<HomePage />);
    const fullText = container.textContent || '';
    // Token exact match — Andrea screenshot evidence 2026-05-05 PM.
    expect(fullText).not.toMatch(/Kit fisici \+ volumi \+ software morfico/i);
    // Also forbid the variant without "+" separators (defensive)
    expect(fullText).not.toMatch(/Kit fisici e volumi e software morfico/i);
  });

  it('does NOT render card label "CHATBOT UNLIM" letterale (iter 41 PM BAD 3-card structure)', () => {
    render(<HomePage />);
    // Letterale uppercase "CHATBOT UNLIM" era la card iter 41 PM BAD.
    // Current iter 37 ChatbotOnly route usa "Chatbot UNLIM" mixed-case in route hash
    // ma NON come card label visibile (vedi HomePage.test.jsx 3-card current).
    expect(screen.queryByText('CHATBOT UNLIM')).not.toBeInTheDocument();
    expect(screen.queryByText(/^CHATBOT UNLIM$/i)).not.toBeInTheDocument();
  });

  it('does NOT render badge "Fatto da Tea" (iter 41 PM BAD Glossario attribution)', () => {
    render(<HomePage />);
    expect(screen.queryByText('Fatto da Tea')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Fatto da Tea$/i)).not.toBeInTheDocument();
  });

  it('does NOT render iter 41 PM BAD robot blu/verde con cuffie mascotte (specific tokens from Andrea screenshot evidence 2026-05-05)', () => {
    const { container } = render(<HomePage />);
    // iter 41 PM BAD screenshot Andrea evidence verbatim: "mascotte robot blu/verde con cuffie".
    // Pattern targets are SPECIFIC to the regression (NOT generic "robot" — current
    // good mascotte alt contains "robottino ELAB navy con antenna e LED giallo" which
    // is the iter 42 mandate-approved ElabMascotte vera and MUST be allowed).
    //
    // BAD tokens to forbid:
    //   - alt text containing "cuffie" (headphones — iter 41 PM BAD only)
    //   - alt or src containing "blu/verde" or "blu-verde" combo
    //   - src filename matching legacy bad PNG patterns (robot-blue, robot-green, mascot-old)
    const allImgs = Array.from(container.querySelectorAll('img'));

    const cuffieImg = allImgs.find((img) => /cuffie/i.test(img.getAttribute('alt') || ''));
    expect(cuffieImg, 'Image with "cuffie" in alt = iter 41 PM BAD robot. Must NOT be rendered.').toBeUndefined();

    const blueGreenImg = allImgs.find((img) => {
      const alt = img.getAttribute('alt') || '';
      const src = img.getAttribute('src') || '';
      return /blu[\s/-]+verde|blue[\s/-]+green/i.test(alt) || /blu[\s/-]+verde|blue[\s/-]+green/i.test(src);
    });
    expect(blueGreenImg, 'Image with blu/verde combo = iter 41 PM BAD palette. Must NOT be rendered.').toBeUndefined();

    const legacyBadFilenames = allImgs.find((img) => {
      const src = img.getAttribute('src') || '';
      return /robot-blue|robot-green|mascot-old|robot-headphones|robot-cuffie/i.test(src);
    });
    expect(legacyBadFilenames, 'Image with legacy BAD filename pattern. Must NOT be rendered.').toBeUndefined();
  });

  it('does NOT render exactly 3-card BAD structure (CHATBOT UNLIM + GLOSSARIO + LAVAGNA)', () => {
    const { container } = render(<HomePage />);
    const fullText = container.textContent || '';

    // BAD 3-card combo: tutti e 3 i label letterali presenti simultaneamente
    const hasChatbotUnlim = /CHATBOT\s+UNLIM/i.test(fullText);
    const hasGlossarioTea = /GLOSSARIO[\s\S]*?Fatto da Tea/i.test(fullText);
    const hasLavagnaEtTutor = /LAVAGNA\s+ELAB\s+TUTOR/i.test(fullText);

    // Almeno uno deve essere ASSENTE (escludere combo BAD esatta iter 41 PM)
    const allThreeBadCardsPresent = hasChatbotUnlim && hasGlossarioTea && hasLavagnaEtTutor;
    expect(allThreeBadCardsPresent).toBe(false);
  });
});
