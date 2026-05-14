/**
 * UNLIM Knowledge Base — Verifica contenuto e struttura
 * UNLIM deve conoscere OGNI dettaglio dei volumi
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const KB_PATH = path.resolve('src/data/unlim-knowledge-base.js');

describe('UNLIM Knowledge Base', () => {
  let kbContent;

  test('knowledge base file exists', () => {
    expect(fs.existsSync(KB_PATH)).toBe(true);
    kbContent = fs.readFileSync(KB_PATH, 'utf8');
  });

  test('knowledge base is not empty', () => {
    expect(kbContent.length).toBeGreaterThan(1000);
  });

  test('knowledge base mentions all 3 volumes', () => {
    expect(kbContent).toMatch(/volume\s*1|vol\s*1/i);
    expect(kbContent).toMatch(/volume\s*2|vol\s*2/i);
    expect(kbContent).toMatch(/volume\s*3|vol\s*3/i);
  });

  test('knowledge base covers key electronic concepts', () => {
    const concepts = ['LED', 'resistore', 'breadboard', 'circuito', 'corrente', 'tensione'];
    concepts.forEach(c => {
      expect(kbContent.toLowerCase(), `missing concept: ${c}`).toContain(c.toLowerCase());
    });
  });

  test('knowledge base covers Arduino concepts', () => {
    const arduino = ['Arduino', 'pin', 'digital', 'analog'];
    arduino.forEach(c => {
      expect(kbContent.toLowerCase(), `missing Arduino concept: ${c}`).toContain(c.toLowerCase());
    });
  });

  test('knowledge base has kid-friendly analogies', () => {
    const analogies = ['acqua', 'tubo', 'rubinetto', 'strada', 'porta'];
    const found = analogies.filter(a => kbContent.toLowerCase().includes(a));
    expect(found.length, `Only ${found.length}/5 analogies found`).toBeGreaterThanOrEqual(1);
  });

  test('knowledge base exports data', () => {
    expect(kbContent).toMatch(/export/);
  });
});

describe('UNLIM Knowledge Base — Lesson Path Coverage', () => {
  const LP_DIR = path.resolve('src/data/lesson-paths');

  test('lesson paths directory has 80+ JSON files', () => {
    const files = fs.readdirSync(LP_DIR).filter(f => f.endsWith('.json'));
    expect(files.length).toBeGreaterThanOrEqual(80);
  });

  test('every lesson path JSON is valid', () => {
    const files = fs.readdirSync(LP_DIR).filter(f => f.endsWith('.json'));
    files.forEach(f => {
      const content = fs.readFileSync(path.join(LP_DIR, f), 'utf8');
      expect(() => JSON.parse(content), `${f} is invalid JSON`).not.toThrow();
    });
  });

  test('lesson path JSONs have consistent structure', () => {
    const files = fs.readdirSync(LP_DIR).filter(f => f.endsWith('.json'));
    let withTitle = 0;
    files.forEach(f => {
      const data = JSON.parse(fs.readFileSync(path.join(LP_DIR, f), 'utf8'));
      if (data.title) withTitle++;
    });
    expect(withTitle / files.length).toBeGreaterThan(0.9);
  });
});
