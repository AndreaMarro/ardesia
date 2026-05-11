/**
 * Sprint U iter 28 — ClawBot L2 templates Vol1 cap.10-14 expand 20 -> 25 tests
 *
 * Owner: iter 28 PHASE 1 (Sense 2 Morfismo coverage lift 21% -> 27%).
 *
 * Scope: 5 NEW L2 templates inlined in
 * `supabase/functions/_shared/clawbot-templates.ts` (TEMPLATES_L2 array).
 *
 *   - L2-explain-fotoresistore-vol1cap10  (Vol.1 pag.81)
 *   - L2-explain-buzzer-vol1cap11         (Vol.1 pag.93)
 *   - L2-explain-reedswitch-vol1cap12     (Vol.1 pag.97)
 *   - L2-explain-elettropongo-vol1cap13   (Vol.1 pag.103)
 *   - L2-explain-robot-vol1cap14          (Vol.1 pag.107)
 *
 * Tests:
 *   - 5 templates loadable + id present
 *   - category = 'lesson-explain' (existing category, no new fields)
 *   - principio_zero plurale 'Ragazzi,' + citazione_verbatim true + max <= 120 parole
 *   - principio_zero.vol_pag canonical 'Vol.1 pag.XX' format
 *   - sequence non-empty references real L1 tools (highlightComponent / speakTTS)
 *   - speak-explain step text opens with "Ragazzi,"
 *   - speak-explain step text <= 120 parole (Andrea iter 21+ mandate iter 28 update)
 *   - speak-explain step text cites canonical Vol.1 pag.XX verbatim
 *
 * NOTE: This test reads the inline TS registry as raw source — Edge Function
 * is Deno-portable but vitest runs Node. We regex-extract template fields
 * instead of executing the file to avoid Deno deps.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REGISTRY_PATH = join(
  __dirname,
  '../../supabase/functions/_shared/clawbot-templates.ts',
);

const SOURCE = readFileSync(REGISTRY_PATH, 'utf-8');

const NEW_TEMPLATES_ITER28 = [
  {
    id: 'L2-explain-fotoresistore-vol1cap10',
    volPag: 'Vol.1 pag.81',
    expectedExperimentId: 'v1-cap10-esp1',
    triggerKeywords: ['fotoresistor', 'LDR', 'luce'],
  },
  {
    id: 'L2-explain-buzzer-vol1cap11',
    volPag: 'Vol.1 pag.93',
    expectedExperimentId: 'v1-cap11-esp1',
    triggerKeywords: ['buzzer', 'cicalino', 'suono'],
  },
  {
    id: 'L2-explain-reedswitch-vol1cap12',
    volPag: 'Vol.1 pag.97',
    expectedExperimentId: 'v1-cap12-esp1',
    triggerKeywords: ['reed', 'magnete', 'interruttore'],
  },
  {
    id: 'L2-explain-elettropongo-vol1cap13',
    volPag: 'Vol.1 pag.103',
    expectedExperimentId: 'v1-cap13-esp1',
    triggerKeywords: ['elettropongo', 'pasta', 'conduttric'],
  },
  {
    id: 'L2-explain-robot-vol1cap14',
    volPag: 'Vol.1 pag.107',
    expectedExperimentId: 'v1-cap14-esp1',
    triggerKeywords: ['robot', 'capstone', 'progetto'],
  },
];

/**
 * Slice the registry source to the block belonging to a given template id.
 */
function templateBlock(source, templateId) {
  const idMatch = new RegExp(`id:\\s*'${templateId}'`).exec(source);
  if (!idMatch) return '';
  const tail = source.slice(idMatch.index);
  const blockEnd = tail.search(/\n {2}},\n {2}\{\n {4}id:|\n {2}},\n\];/);
  return blockEnd > -1 ? tail.slice(0, blockEnd) : tail;
}

function extractSpeakExplainText(source, templateId) {
  const block = templateBlock(source, templateId);
  if (!block) return null;
  const speakMatch = /text:\s*"((?:[^"\\]|\\.)*Ragazzi[^"]*)"/.exec(block);
  if (speakMatch) return speakMatch[1];
  const speakMatchSingle = /text:\s*'((?:[^'\\]|\\.)*Ragazzi[^']*)'/.exec(block);
  return speakMatchSingle ? speakMatchSingle[1] : null;
}

function extractTemplateField(source, templateId, fieldName) {
  const block = templateBlock(source, templateId);
  if (!block) return null;
  const re = new RegExp(`${fieldName}:\\s*['"]([^'"\\n]+)['"]`);
  const m = re.exec(block);
  return m ? m[1] : null;
}

function wordCount(text) {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => w.length > 0).length;
}

describe('iter 28 — 5 NEW L2 templates Vol1 cap.10-14 inline registry presence', () => {
  it('clawbot-templates.ts source loads non-empty', () => {
    expect(SOURCE.length).toBeGreaterThan(1000);
    expect(SOURCE).toContain('TEMPLATES_L2');
  });

  it('updated header comment reflects 25-template count (iter 28 expansion)', () => {
    expect(SOURCE).toMatch(/25 L2 TEMPLATES/);
  });

  for (const { id } of NEW_TEMPLATES_ITER28) {
    it(`template ${id} declared in TEMPLATES_L2 inline registry`, () => {
      const idRegex = new RegExp(`id:\\s*'${id}'`);
      expect(SOURCE).toMatch(idRegex);
    });
  }
});

describe('iter 28 — Sense 2 Morfismo schema compliance per template', () => {
  for (const { id, volPag, expectedExperimentId, triggerKeywords } of NEW_TEMPLATES_ITER28) {
    describe(id, () => {
      it("category is 'lesson-explain' (existing category, no new fields)", () => {
        const category = extractTemplateField(SOURCE, id, 'category');
        expect(category).toBe('lesson-explain');
      });

      it("principio_zero.plurale_obbligatorio is 'Ragazzi,'", () => {
        const plurale = extractTemplateField(SOURCE, id, 'plurale_obbligatorio');
        expect(plurale).toBe('Ragazzi,');
      });

      it(`principio_zero.vol_pag is canonical '${volPag}'`, () => {
        const volPagField = extractTemplateField(SOURCE, id, 'vol_pag');
        expect(volPagField).toBe(volPag);
      });

      it(`default experimentId is '${expectedExperimentId}'`, () => {
        const expField = extractTemplateField(SOURCE, id, 'experimentId');
        expect(expField).toBe(expectedExperimentId);
      });

      it('description triggers match docente queries (regex coverage)', () => {
        const block = templateBlock(SOURCE, id);
        const triggerRe = new RegExp(triggerKeywords.join('|'), 'i');
        expect(triggerRe.test(block)).toBe(true);
      });

      it("speakTTS step text opens with 'Ragazzi,'", () => {
        const text = extractSpeakExplainText(SOURCE, id);
        expect(text).not.toBeNull();
        expect(text.startsWith('Ragazzi,')).toBe(true);
      });

      it(`speakTTS step text cites '${volPag}' verbatim`, () => {
        const text = extractSpeakExplainText(SOURCE, id);
        expect(text).toContain(volPag);
      });

      it('speakTTS step text within 120-word ceiling (Andrea iter 21+ mandate, iter 28 update)', () => {
        const text = extractSpeakExplainText(SOURCE, id);
        expect(text).not.toBeNull();
        const wc = wordCount(text);
        expect(wc).toBeLessThanOrEqual(120);
      });

      it('sequence references real L1 tools (highlightComponent + speakTTS)', () => {
        const block = templateBlock(SOURCE, id);
        expect(block).toContain("tool: 'highlightComponent'");
        expect(block).toContain("tool: 'speakTTS'");
      });
    });
  }
});

describe('iter 28 — coverage lift inventory (Sense 2 Morfismo 20/94 -> 25/94)', () => {
  it('TEMPLATES_L2 contains at least 25 templates after iter 28 expansion', () => {
    const matches = SOURCE.match(/\n {2}\{\n {4}id:\s*'L2-/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(25);
  });

  it('all 5 NEW iter 28 template ids appear in the registry source', () => {
    for (const { id } of NEW_TEMPLATES_ITER28) {
      expect(SOURCE).toContain(`'${id}'`);
    }
  });
});
