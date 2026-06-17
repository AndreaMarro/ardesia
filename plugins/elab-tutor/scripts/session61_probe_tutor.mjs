import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
await page.goto('https://www.elabtutor.school/#tutor', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4000);

const data = await page.evaluate(() => {
  const compact = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const controls = [];
  document.querySelectorAll('input, textarea, button, [role="button"], a').forEach((el) => {
    controls.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      href: el.getAttribute('href') || '',
      type: el.getAttribute('type') || '',
      placeholder: el.getAttribute('placeholder') || '',
      aria: el.getAttribute('aria-label') || '',
      text: compact(el.textContent || '').slice(0, 80),
    });
  });
  return {
    href: location.href,
    title: document.title,
    controls: controls.slice(0, 200),
    bodySnippet: compact(document.body.innerText || '').slice(0, 500),
  };
});

console.log(JSON.stringify(data, null, 2));
await page.screenshot({ path: '/tmp/session61_probe_tutor.png', fullPage: true });
await browser.close();
