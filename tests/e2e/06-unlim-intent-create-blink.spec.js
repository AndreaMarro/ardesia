import { test, expect } from '@playwright/test';
import { waitForPageReady, seedE2EBypass, skipIfProd } from './fixtures.js';

test.describe('UNLIM intent creates Blockly workspace', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EBypass(page);
  });

  test('creates escaped blink XML and loads it through simulator API', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    const result = await page.evaluate(async () => {
      const loaded = [];
      window.__ELAB_API = {
        loadScratchWorkspace(xml) {
          loaded.push(xml);
        },
      };
      const mod = await import('/src/features/unlimScreenAgent/intentExecutor.ts');
      const execution = mod.executeIntent({
        intent: 'create_blink',
        nl: 'crea <blink> sul pin 13',
        params: { pin: '13', intervalMs: 500 },
      }, window.__ELAB_API);
      return { execution, loaded };
    });

    expect(result.execution.ok).toBe(true);
    expect(result.loaded).toHaveLength(1);
    expect(result.loaded[0]).toContain('arduino_base');
    expect(result.loaded[0]).toContain('arduino_digital_write');
    expect(result.loaded[0]).toContain('crea &lt;blink&gt; sul pin 13');
  });
});
