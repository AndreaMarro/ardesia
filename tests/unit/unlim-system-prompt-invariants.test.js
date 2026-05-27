/**
 * unlim-system-prompt-invariants.test.js — Sprint X iter 105.3
 *
 * Static invariant tests for UNLIM `system-prompt.ts`. Catches drift in:
 *   - Word cap constants (LIVE_SYSTEM_PROMPT must reference 120)
 *   - Andrea PZ V3 invariants ("Ragazzi,", Vol/pag, kit fisico)
 *   - Citation format enforcement language
 *   - Anti-pattern phrases NOT present (e.g. legacy "Galileo")
 *
 * READ-ONLY tests: scan the raw module source as string. No runtime exec.
 * Catches accidental rule loosening without re-deploying Edge Fn.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SP_PATH = path.resolve(
  __dirname,
  '../../supabase/functions/_shared/system-prompt.ts',
);
const SP_SRC = fs.readFileSync(SP_PATH, 'utf8');

describe('system-prompt.ts — Andrea word cap mandate (10/05/2026: 120 parole)', () => {
  it('1.1 — mentions "120 parole" at least once', () => {
    expect(SP_SRC).toMatch(/120\s*parole/);
  });

  it('1.2 — does NOT mention legacy 60-word cap (drift guard)', () => {
    // Andrea Rule 10/05/2026 superseded 60-word rule. Verify no live mention.
    // Allow comments referencing history.
    const liveSection = SP_SRC.split('LIVE_SYSTEM_PROMPT')[1] || '';
    expect(liveSection).not.toMatch(/MAX\s*60\s*parole/i);
  });

  it('1.3 — does NOT mention legacy 80-word cap', () => {
    const liveSection = SP_SRC.split('LIVE_SYSTEM_PROMPT')[1] || '';
    expect(liveSection).not.toMatch(/MAX\s*80\s*parole/i);
  });
});

describe('system-prompt.ts — Italian K-12 plural mandate', () => {
  it('2.1 — mentions "Ragazzi," opener', () => {
    expect(SP_SRC).toMatch(/Ragazzi,/);
  });

  it('2.2 — references plural form', () => {
    expect(SP_SRC.toLowerCase()).toMatch(/plurale|ragazzi/);
  });
});

describe('system-prompt.ts — Vol/pag citation enforcement', () => {
  it('3.1 — references "Vol.X pag.Y" canonical format', () => {
    expect(SP_SRC).toMatch(/Vol\.\s*[XN]\s*pag\.\s*[YN]/i);
  });

  it('3.2 — mentions VERBATIM rule (Andrea PZ V3 invariant)', () => {
    expect(SP_SRC.toLowerCase()).toMatch(/verbatim/);
  });

  it('3.3 — references caporali «» quote style', () => {
    expect(SP_SRC).toMatch(/«[\s\S]+»|caporali/);
  });
});

describe('system-prompt.ts — Kit fisico anchoring (Principio Zero)', () => {
  it('4.1 — references "kit fisico"', () => {
    expect(SP_SRC.toLowerCase()).toMatch(/kit\s+fisico/);
  });

  it('4.2 — references at least one physical-kit term', () => {
    expect(SP_SRC.toLowerCase()).toMatch(/breadboard|batteria|componente|cavetto/);
  });
});

describe('system-prompt.ts — Drift guard: legacy name "Galileo" forbidden', () => {
  it('5.1 — LIVE_SYSTEM_PROMPT does NOT contain "Galileo" as tutor name', () => {
    // CLAUDE.md mandate: name is UNLIM, not Galileo.
    const liveSection = SP_SRC.split('LIVE_SYSTEM_PROMPT')[1] || '';
    expect(liveSection).not.toMatch(/\bGalileo\b/i);
  });

  it('5.2 — Mentions "UNLIM" as tutor name', () => {
    expect(SP_SRC).toMatch(/UNLIM/);
  });
});

describe('system-prompt.ts — Schema mode (Mistral structured output)', () => {
  it('6.1 — buildSystemPrompt accepts useIntentSchema param', () => {
    expect(SP_SRC).toMatch(/useIntentSchema/);
  });

  it('6.2 — references JSON structured output mode', () => {
    expect(SP_SRC).toMatch(/INTENT_TOOLS_SCHEMA|JSON|json_schema/i);
  });
});

describe('system-prompt.ts — BASE_PROMPT vs LIVE_SYSTEM_PROMPT', () => {
  it('7.1 — BASE_PROMPT constant defined', () => {
    expect(SP_SRC).toMatch(/const\s+BASE_PROMPT\s*=/);
  });

  it('7.2 — LIVE_SYSTEM_PROMPT constant defined', () => {
    expect(SP_SRC).toMatch(/const\s+LIVE_SYSTEM_PROMPT\s*=/);
  });

  it('7.3 — buildSystemPrompt referenced (function exported)', () => {
    expect(SP_SRC).toMatch(/export\s+function\s+buildSystemPrompt/);
  });
});

describe('system-prompt.ts — Andrea anti-pattern guards', () => {
  it('8.1 — does NOT contain emoji as instruction icon (CLAUDE.md regola 11)', () => {
    const liveSection = SP_SRC.split('LIVE_SYSTEM_PROMPT')[1] || '';
    // Allow Unicode mathematical symbols / accented Italian, but block common emoji
    expect(liveSection).not.toMatch(/[\u{1F300}-\u{1F6FF}]/u);
  });

  it('8.2 — references off-topic redirect (Andrea mandate "soft")', () => {
    expect(SP_SRC.toLowerCase()).toMatch(/off-?topic|fuori\s+tema/);
  });
});

describe('system-prompt.ts — Italian school context', () => {
  it('9.1 — references età 8-14 or scuola primaria/secondaria', () => {
    expect(SP_SRC.toLowerCase()).toMatch(/8[\s-]+14|scuola|primaria|secondaria/);
  });

  it('9.2 — DIAGNOSE_PROMPT constant exists (for unlim-diagnose endpoint)', () => {
    expect(SP_SRC).toMatch(/DIAGNOSE_PROMPT/);
  });

  it('9.3 — buildHintsPrompt function exported', () => {
    expect(SP_SRC).toMatch(/export\s+function\s+buildHintsPrompt/);
  });
});

describe('system-prompt.ts — Static size sanity', () => {
  it('10.1 — file is non-empty', () => {
    expect(SP_SRC.length).toBeGreaterThan(1000);
  });

  it('10.2 — file size bounded (< 100KB sanity)', () => {
    expect(SP_SRC.length).toBeLessThan(100_000);
  });

  it('10.3 — no trailing TODO/FIXME without context (CLAUDE.md anti-pattern)', () => {
    // Allow TODO with comment, block bare "TODO" lines
    const bareTodo = SP_SRC.match(/^\s*TODO\s*$/gm);
    expect(bareTodo).toBeNull();
  });
});
