/**
 * Sprint S iter 13 U4 — ClawBot L2 templates 5/28 expansion tests
 *
 * Owner: omniscient-opus iter 13 PHASE 1.
 *
 * Scope: 5 NEW L2 templates in scripts/openclaw/templates/ (52 → 57 ToolSpec).
 * Each template = morphic pre-defined pattern (composite of existing L1 tools)
 * with Sense 1.5 morfismo runtime (docente experience + classe age + kit tier).
 *
 * Tests:
 *   - 5 templates JSON parse OK
 *   - Each template includes mandatory fields (id/sequence/principio_zero)
 *   - Sense 1.5 morfismo flags present (docente/classe/kit)
 *   - PRINCIPIO ZERO compliance (Ragazzi, plurale + Vol/pag citation regex)
 *   - Sequence steps reference real L1 tools (highlightComponent / speakTTS / ragRetrieve / postToVisionEndpoint)
 *   - Test assertions array present + non-empty
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '../../scripts/openclaw/templates');

const EXPECTED_L2_TEMPLATES = [
  'L2-explain-led-blink.json',
  'L2-diagnose-no-current.json',
  'L2-guide-mount-experiment.json',
  'L2-critique-circuit-photo.json',
  'L2-reroute-from-error.json',
];

function loadTemplate(filename) {
  const raw = readFileSync(join(TEMPLATES_DIR, filename), 'utf-8');
  return JSON.parse(raw);
}

describe('Iter 13 U4 — 5 ClawBot L2 templates filesystem presence', () => {
  it('all 5 L2 template files exist in scripts/openclaw/templates/', () => {
    const present = readdirSync(TEMPLATES_DIR).filter(f => f.startsWith('L2-') && f.endsWith('.json'));
    for (const expected of EXPECTED_L2_TEMPLATES) {
      expect(present).toContain(expected);
    }
  });

  it('total L2 template count is exactly 20 (iter 15 P2 batch 3: 15 prior + 5 NEW iter 15, target 80)', () => {
    const present = readdirSync(TEMPLATES_DIR).filter(f => f.startsWith('L2-') && f.endsWith('.json'));
    expect(present.length).toBe(20);
  });
});

describe('Iter 13 U4 — Template schema validation per file', () => {
  for (const filename of EXPECTED_L2_TEMPLATES) {
    describe(filename, () => {
      it('parses as valid JSON', () => {
        expect(() => loadTemplate(filename)).not.toThrow();
      });

      it('has mandatory top-level fields (id, level, name, sequence)', () => {
        const t = loadTemplate(filename);
        expect(t.id).toBeTypeOf('string');
        expect(t.level).toBe('L2');
        expect(t.name).toBeTypeOf('string');
        expect(Array.isArray(t.sequence)).toBe(true);
        expect(t.sequence.length).toBeGreaterThanOrEqual(3);
      });

      it('has principio_zero block with mandatory plurale "Ragazzi,"', () => {
        const t = loadTemplate(filename);
        expect(t.principio_zero).toBeDefined();
        expect(t.principio_zero.plurale_obbligatorio).toBe('Ragazzi,');
        expect(t.principio_zero.citazione_verbatim).toBe(true);
        expect(t.principio_zero.max_parole).toBeLessThanOrEqual(120);
      });

      it('has morfismo_sense_1_5 block with adapt flags (docente/classe/kit)', () => {
        const t = loadTemplate(filename);
        expect(t.morfismo_sense_1_5).toBeDefined();
        expect(Array.isArray(t.morfismo_sense_1_5.docente_esperienza)).toBe(true);
        expect(Array.isArray(t.morfismo_sense_1_5.classe_eta)).toBe(true);
        expect(Array.isArray(t.morfismo_sense_1_5.kit_tier)).toBe(true);
        expect(t.morfismo_sense_1_5.adapt_voice).toBe(true);
        expect(t.morfismo_sense_1_5.adapt_complexity_lessico).toBe(true);
      });

      it('sequence ends with speakTTS using Isabella Neural voice', () => {
        const t = loadTemplate(filename);
        const last = t.sequence[t.sequence.length - 1];
        expect(last.tool).toBe('speakTTS');
        expect(last.args.voice).toBe('it-IT-IsabellaNeural');
        // Verbatim Ragazzi in TTS text
        expect(last.args.text).toMatch(/Ragazzi,/);
      });

      it('TTS text references Vol.X pag.Y citation pattern', () => {
        const t = loadTemplate(filename);
        const last = t.sequence[t.sequence.length - 1];
        // Either literal Vol.X or template var ${citation.vol}
        expect(last.args.text).toMatch(/Vol\.(\d+|\$\{)/);
        expect(last.args.text).toMatch(/pag\.(\d+|\$\{)/);
      });

      it('test_assertions array present + non-empty + ≥4 entries', () => {
        const t = loadTemplate(filename);
        expect(Array.isArray(t.test_assertions)).toBe(true);
        expect(t.test_assertions.length).toBeGreaterThanOrEqual(4);
      });
    });
  }
});

describe('Iter 13 U4 — Cross-template Sense 1.5 morfismo coverage', () => {
  it('explain-led-blink targets lesson-explain category', () => {
    const t = loadTemplate('L2-explain-led-blink.json');
    expect(t.category).toBe('lesson-explain');
  });

  it('diagnose-no-current first step is captureScreenshot (vision flow)', () => {
    const t = loadTemplate('L2-diagnose-no-current.json');
    expect(t.sequence[0].tool).toBe('captureScreenshot');
    expect(t.sequence[1].tool).toBe('postToVisionEndpoint');
  });

  it('guide-mount-experiment uses both highlightComponent and highlightPin', () => {
    const t = loadTemplate('L2-guide-mount-experiment.json');
    const tools = t.sequence.map(s => s.tool);
    expect(tools).toContain('highlightComponent');
    expect(tools).toContain('highlightPin');
  });

  it('critique-circuit-photo highlights green (positive) + orange (improvement)', () => {
    const t = loadTemplate('L2-critique-circuit-photo.json');
    const colors = t.sequence
      .filter(s => s.tool === 'highlightComponent')
      .map(s => s.args.color);
    expect(colors).toContain('green');
    expect(colors).toContain('orange');
  });

  it('reroute-from-error opens with ragRetrieve + wikiRetrieve double pull', () => {
    const t = loadTemplate('L2-reroute-from-error.json');
    expect(t.sequence[0].tool).toBe('ragRetrieve');
    expect(t.sequence[1].tool).toBe('wikiRetrieve');
  });

  it('all 5 templates owner_agent === omniscient-opus + iter_introduced === 13', () => {
    for (const fn of EXPECTED_L2_TEMPLATES) {
      const t = loadTemplate(fn);
      expect(t.owner_agent).toBe('omniscient-opus');
      expect(t.iter_introduced).toBe(13);
    }
  });

  it('no template exceeds expected_total_latency_ms 6000ms (LIM real-time budget)', () => {
    for (const fn of EXPECTED_L2_TEMPLATES) {
      const t = loadTemplate(fn);
      expect(t.expected_total_latency_ms).toBeLessThanOrEqual(6000);
    }
  });

  it('all sequences halt-on-error fallback strategy (sequential dispatcher contract)', () => {
    for (const fn of EXPECTED_L2_TEMPLATES) {
      const t = loadTemplate(fn);
      expect(t.fallback_strategy).toBe('halt-on-error');
    }
  });
});
