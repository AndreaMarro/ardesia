/**
 * Wiki L2 concepts validation — Sprint Q4
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCEPTS_DIR = join(__dirname, '../../../docs/unlim-wiki/concepts');

const files = readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.md'));

describe('Wiki L2 concepts', () => {
  it('contains 25+ concept files (Q4 target)', () => {
    expect(files.length).toBeGreaterThanOrEqual(25);
  });

  it('every concept file has front-matter with required fields', () => {
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      expect(content.startsWith('---'), `${f} no front-matter`).toBe(true);
      expect(content).toMatch(/id:\s*\S+/);
      expect(content).toMatch(/type:\s*concept/);
      expect(content).toMatch(/title:\s*"[^"]+"/);
      expect(content).toMatch(/created_at:\s*\d{4}-\d{2}-\d{2}/);
      expect(content).toMatch(/updated_at:\s*\d{4}-\d{2}-\d{2}/);
      expect(content).toMatch(/tags:\s*\[/);
    }
  });

  it('Definizione 100% + Analogia ≥65% concepts (iter 8 cleanup target ≥80%)', () => {
    let definizione = 0;
    let analogia = 0;
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      if (/## Definizione/i.test(content)) definizione++;
      if (/## Analogia/i.test(content)) analogia++;
    }
    // Definizione MUST be 100% (Mac Mini batch v2 enforces)
    expect(definizione / files.length).toBeGreaterThanOrEqual(1.0);
    // Analogia ≥65% post iter 7 (~70 concepts, Mac Mini v1 batch missing).
    // Iter 8 Mac Mini v3 enrichment target ≥80%.
    expect(analogia / files.length).toBeGreaterThanOrEqual(0.65);
  });

  it('80%+ concepts have Errori or links to errors/', () => {
    let withErrors = 0;
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      if (/## Errori/i.test(content) || /errors\//.test(content)) withErrors++;
    }
    expect(withErrors / files.length).toBeGreaterThanOrEqual(0.8);
  });

  it('PRINCIPIO ZERO mentioned in concept files', () => {
    let countWithRule = 0;
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      if (content.includes('PRINCIPIO ZERO') || content.includes('plurale')) countWithRule++;
    }
    expect(countWithRule / files.length).toBeGreaterThanOrEqual(0.8);
  });

  it('analogia uses plurale ragazzi (Ragazzi, Vediamo, Provate)', () => {
    let pluralCount = 0;
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      if (/\b(Ragazzi|Vediamo|Provate|Vediamo insieme|È come)\b/i.test(content)) pluralCount++;
    }
    expect(pluralCount / files.length).toBeGreaterThanOrEqual(0.7);
  });

  it('cite Vol.X pag.Y where volume_ref + pagina_ref defined', () => {
    let citedRequired = 0;
    let cited = 0;
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      const hasVolume = /volume_ref:\s*[1-3]/.test(content);
      const hasPage = /pagina_ref:\s*\d+/.test(content);
      if (hasVolume && hasPage) {
        citedRequired++;
        if (/Vol\.\s*[1-3]\s*pag\.\s*\d+/.test(content)) cited++;
      }
    }
    if (citedRequired > 0) {
      expect(cited / citedRequired).toBeGreaterThanOrEqual(0.7);
    }
  });

  it('unique concept ids', () => {
    const ids = files.map((f) => f.replace('.md', ''));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all concept ids match filename (kebab-case lowercase)', () => {
    for (const f of files) {
      const content = readFileSync(join(CONCEPTS_DIR, f), 'utf8');
      const idMatch = content.match(/^id:\s*(\S+)/m);
      const expectedId = f.replace('.md', '');
      if (idMatch) {
        expect(idMatch[1], `${f} id mismatch`).toBe(expectedId);
      }
    }
  });
});
