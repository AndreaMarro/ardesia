import { test, expect } from '@playwright/test';
import { skipIfProd } from './fixtures.js';

const PALETTE_MIME = 'application/x-elab-palette-snippet';

async function openIde(page) {
  await page.goto('/#compile-home-v2');
  await expect(page.getByTestId('ide-shell')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Palette azioni Arduino' })).toBeVisible();
  await expect(page.locator('.cm-content')).toBeVisible();
}

async function editorText(page) {
  return page.locator('.cm-content').innerText();
}

test.describe('Palette Arduino drag insertion', () => {
  test.beforeEach(async ({ baseURL }) => {
    skipIfProd(test, baseURL);
  });

  test('drag palette action inserts Arduino snippet into CodeMirror', async ({ page }) => {
    await openIde(page);

    await page.getByRole('button', { name: /Accendi LED/i }).dragTo(page.locator('.cm-content'));

    await expect(page.locator('.cm-content')).toContainText('digitalWrite(13, HIGH);');
  });

  test('external text/plain drag is not intercepted by palette drop handler', async ({ page }) => {
    await openIde(page);
    const before = await editorText(page);

    const handled = await page.locator('.cm-content').evaluate((target) => {
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      event.dataTransfer.setData('text/plain', 'TESTO ESTERNO NON PALETTE');
      target.dispatchEvent(event);
      return event.defaultPrevented;
    });

    expect(handled).toBe(false);
    await expect(page.locator('.cm-content')).not.toContainText('TESTO ESTERNO NON PALETTE');
    expect(await editorText(page)).toBe(before);
  });

  test('tablet click-to-insert adds the selected action at the cursor', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openIde(page);

    await page.getByRole('button', { name: /Attendi/i }).click();

    await expect(page.locator('.cm-content')).toContainText('delay(500);');
  });

  test('drop active class is cleaned after palette drop and ignored external drop', async ({ page }) => {
    await openIde(page);
    const editor = page.locator('.cm-editor');

    await page.locator('.cm-content').evaluate((target, mime) => {
      const dragOver = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      dragOver.dataTransfer.setData(mime, 'delay(500);');
      target.dispatchEvent(dragOver);
    }, PALETTE_MIME);
    await expect(editor).toHaveClass(/code-palette-drop-active/);

    await page.locator('.cm-content').evaluate((target, mime) => {
      const drop = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      drop.dataTransfer.setData(mime, 'delay(500);');
      target.dispatchEvent(drop);
    }, PALETTE_MIME);
    await expect(editor).not.toHaveClass(/code-palette-drop-active/);

    await page.locator('.cm-editor').evaluate((node) => node.classList.add('code-palette-drop-active'));
    await page.locator('.cm-content').evaluate((target) => {
      const drop = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
      });
      drop.dataTransfer.setData('text/plain', 'external');
      target.dispatchEvent(drop);
    });
    await expect(editor).not.toHaveClass(/code-palette-drop-active/);
  });
});
