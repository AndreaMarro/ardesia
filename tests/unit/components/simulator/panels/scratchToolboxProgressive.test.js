import { describe, test, expect } from 'vitest';
import { getProgressiveToolbox } from '../../../../../src/components/simulator/panels/scratchToolboxProgressive';

describe('scratchToolboxProgressive', () => {
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
