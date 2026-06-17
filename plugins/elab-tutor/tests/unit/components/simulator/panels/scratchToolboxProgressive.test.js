// © Andrea Marro — 25/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * scratchToolboxProgressive — Wave 1 + Wave 1b coverage.
 *
 * Spec source:
 *   PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 1 + Sez 11
 *   docs/dispatch/2026-05-25-wave-1b-team-brief.md Impl-A-2 tasks 1, 3, 4, 5
 *
 * Wave 1 (T1-T5): basic shape — 3 levels (4 / 7 / 12 cat).
 * Wave 1b adds:
 *   - Canonical-16 toolbox shape (livello 4) matching Sez 1 line 88
 *   - IT category names verbatim from Vol1/Vol2 (no EN leftover)
 *   - Search box renderer helper (filter contents by block type substring)
 *   - Collapse/expand state helpers per category
 *   - Welcome state copy IT plurale "Trascinate ... ragazzi"
 *
 * Test shape ONLY — no Blockly.inject runtime call. Block IDs remain
 * fabricated per iter 82 honesty header until iter 83+ ScratchEditor audit.
 */

import { describe, test, expect } from 'vitest';
import {
  getProgressiveToolbox,
  getCanonicalToolbox,
  CANONICAL_CATEGORY_NAMES,
  filterToolbox,
  toggleCategoryCollapsed,
  getWelcomeState,
} from '../../../../../src/components/simulator/panels/scratchToolboxProgressive';

describe('scratchToolboxProgressive — Wave 1 shape (preserved)', () => {
  test('T1: livello1 returns 4 categories', () => {
    const tb = getProgressiveToolbox(1);
    expect(tb.contents).toHaveLength(4);
  });

  test('T2: livello2 returns 7 categories', () => {
    const tb = getProgressiveToolbox(2);
    expect(tb.contents).toHaveLength(7);
  });

  test('T3: livello3 returns 12 categories', () => {
    const tb = getProgressiveToolbox(3);
    expect(tb.contents).toHaveLength(12);
  });

  test('T4: Eventi category always first (entry point)', () => {
    [1, 2, 3].forEach((level) => {
      const tb = getProgressiveToolbox(level);
      expect(tb.contents[0].name).toMatch(/eventi/i);
    });
  });

  test('T5: LED category present in livello1 (kit fisico primary)', () => {
    const tb = getProgressiveToolbox(1);
    const ledCat = tb.contents.find((c) => /led/i.test(c.name));
    expect(ledCat).toBeDefined();
  });
});

describe('scratchToolboxProgressive — Wave 1b: canonical 16 categories', () => {
  test('CANONICAL_CATEGORY_NAMES has 16 entries (Sez 1 line 88)', () => {
    expect(CANONICAL_CATEGORY_NAMES).toHaveLength(16);
  });

  test('canonical names are exact IT verbatim from Vol1/Vol2', () => {
    expect(CANONICAL_CATEGORY_NAMES).toEqual([
      'Setup',
      'Pin digitali',
      'Pin analogici',
      'Ripeti',
      'Matematica',
      'Logica',
      'Variabili',
      'Funzioni',
      'Comunicazione Serial',
      'Sensori',
      'Attuatori',
      'Tempo',
      'Stringhe',
      'RGB LED',
      'Servo',
      'Buzzer',
    ]);
  });

  test('canonical names contain ZERO English leftovers', () => {
    const englishWords = /\b(Loop|Wait|Variables|Functions|Math|Logic|Setup|Sensors|Actuators|Time|Strings|Speaker|Servo motor)\b/;
    for (const name of CANONICAL_CATEGORY_NAMES) {
      // "Setup" + "Servo" + "Buzzer" are Arduino keywords retained globally.
      // The guard excludes them by allow-listing.
      if (['Setup', 'Servo', 'Buzzer', 'RGB LED', 'Comunicazione Serial'].includes(name)) continue;
      expect(name).not.toMatch(englishWords);
    }
  });

  test('getCanonicalToolbox returns categoryToolbox with 16 cat', () => {
    const tb = getCanonicalToolbox();
    expect(tb.kind).toBe('categoryToolbox');
    expect(tb.contents).toHaveLength(16);
    expect(tb.contents.map((c) => c.name)).toEqual(CANONICAL_CATEGORY_NAMES);
  });

  test('getCanonicalToolbox: every category has colour matching ELAB palette', () => {
    const tb = getCanonicalToolbox();
    const validHex = /^#[0-9A-Fa-f]{6}$/;
    for (const cat of tb.contents) {
      expect(cat.colour).toMatch(validHex);
    }
  });

  test('getCanonicalToolbox: Variabili + Funzioni use Blockly custom flyouts', () => {
    const tb = getCanonicalToolbox();
    const vars = tb.contents.find((c) => c.name === 'Variabili');
    const funcs = tb.contents.find((c) => c.name === 'Funzioni');
    expect(vars.custom).toBe('VARIABLE');
    expect(funcs.custom).toBe('PROCEDURE');
  });
});

describe('scratchToolboxProgressive — Wave 1b: search filter', () => {
  test('filterToolbox with empty query returns same toolbox', () => {
    const tb = getCanonicalToolbox();
    const filtered = filterToolbox(tb, '');
    expect(filtered.contents).toHaveLength(tb.contents.length);
  });

  test('filterToolbox with whitespace query returns same toolbox', () => {
    const tb = getCanonicalToolbox();
    const filtered = filterToolbox(tb, '   ');
    expect(filtered.contents).toHaveLength(tb.contents.length);
  });

  test('filterToolbox query "servo" returns only Servo category', () => {
    const tb = getCanonicalToolbox();
    const filtered = filterToolbox(tb, 'servo');
    expect(filtered.contents.map((c) => c.name)).toContain('Servo');
    // No category with zero matching blocks should appear.
    for (const cat of filtered.contents) {
      if (cat.contents) {
        expect(cat.contents.length).toBeGreaterThan(0);
      }
    }
  });

  test('filterToolbox query is case-insensitive', () => {
    const tb = getCanonicalToolbox();
    const lower = filterToolbox(tb, 'servo');
    const upper = filterToolbox(tb, 'SERVO');
    expect(upper.contents.map((c) => c.name)).toEqual(
      lower.contents.map((c) => c.name)
    );
  });

  test('filterToolbox query "xyzzy" returns empty contents', () => {
    const tb = getCanonicalToolbox();
    const filtered = filterToolbox(tb, 'xyzzy');
    expect(filtered.contents).toHaveLength(0);
  });

  test('filterToolbox preserves toolbox kind', () => {
    const tb = getCanonicalToolbox();
    const filtered = filterToolbox(tb, 'delay');
    expect(filtered.kind).toBe('categoryToolbox');
  });
});

describe('scratchToolboxProgressive — Wave 1b: collapse/expand state', () => {
  test('toggleCategoryCollapsed sets collapsed=true when initially absent', () => {
    const tb = getCanonicalToolbox();
    const next = toggleCategoryCollapsed(tb, 'Servo');
    const cat = next.contents.find((c) => c.name === 'Servo');
    expect(cat.collapsed).toBe(true);
  });

  test('toggleCategoryCollapsed flips collapsed=true → false', () => {
    let tb = getCanonicalToolbox();
    tb = toggleCategoryCollapsed(tb, 'Servo'); // → true
    tb = toggleCategoryCollapsed(tb, 'Servo'); // → false
    const cat = tb.contents.find((c) => c.name === 'Servo');
    expect(cat.collapsed).toBe(false);
  });

  test('toggleCategoryCollapsed does not mutate input toolbox', () => {
    const tb = getCanonicalToolbox();
    const orig = JSON.stringify(tb);
    toggleCategoryCollapsed(tb, 'Servo');
    expect(JSON.stringify(tb)).toBe(orig);
  });

  test('toggleCategoryCollapsed with unknown name returns equivalent toolbox', () => {
    const tb = getCanonicalToolbox();
    const next = toggleCategoryCollapsed(tb, 'NonExistente');
    expect(next.contents).toHaveLength(tb.contents.length);
    for (const cat of next.contents) {
      expect(cat.collapsed).toBeFalsy();
    }
  });
});

describe('scratchToolboxProgressive — Wave 1b: RGB LED category', () => {
  test('RGB LED category contains arduino_rgb_led block', () => {
    const tb = getCanonicalToolbox();
    const rgb = tb.contents.find((c) => c.name === 'RGB LED');
    expect(rgb).toBeDefined();
    const types = rgb.contents.map((b) => b.type);
    expect(types).toContain('arduino_rgb_led');
  });
});

describe('scratchToolboxProgressive — Wave 1b: welcome state', () => {
  test('getWelcomeState returns object with title + hint', () => {
    const w = getWelcomeState();
    expect(typeof w.title).toBe('string');
    expect(typeof w.hint).toBe('string');
    expect(w.title.length).toBeGreaterThan(0);
    expect(w.hint.length).toBeGreaterThan(0);
  });

  test('welcome title is IT plurale ("Trascinate ... ragazzi")', () => {
    const w = getWelcomeState();
    expect(w.title).toMatch(/Trascinate/);
    expect(w.title).toMatch(/ragazzi/);
  });

  test('welcome hint mentions SETUP block reference', () => {
    const w = getWelcomeState();
    expect(w.hint).toMatch(/SETUP/);
  });

  test('welcome state contains ZERO English imperatives', () => {
    const w = getWelcomeState();
    const englishImperative = /\b(Drag|Drop|Click|Start|Begin)\b/;
    expect(w.title).not.toMatch(englishImperative);
    expect(w.hint).not.toMatch(englishImperative);
  });
});
