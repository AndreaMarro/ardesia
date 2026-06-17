import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.goto('https://www.elabtutor.school', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(3000);

const controls = await page.evaluate(() => {
  const compact = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const pick = (el) => ({
    tag: el.tagName.toLowerCase(),
    id: el.id || '',
    name: el.getAttribute('name') || '',
    type: el.getAttribute('type') || '',
    placeholder: el.getAttribute('placeholder') || '',
    aria: el.getAttribute('aria-label') || '',
    text: compact(el.textContent || '').slice(0, 60),
  });
  const arr = [];
  document.querySelectorAll('input, textarea, button, [role="button"]').forEach((el) => {
    arr.push(pick(el));
  });
  return arr.slice(0, 120);
});

console.log(JSON.stringify({ url: page.url(), title: await page.title(), controls }, null, 2));
await page.screenshot({ path: '/tmp/session61_probe_home.png', fullPage: true });
await browser.close();
