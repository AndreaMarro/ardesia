import { chromium } from 'playwright-core';

const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const context = await browser.newContext({ viewport: { width: 1700, height: 1050 } });
const page = await context.newPage();

await page.goto('https://www.elabtutor.school/#tutor', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(1500);

const acceptBtn = page.getByRole('button', { name: /accetto/i });
if (await acceptBtn.count()) await acceptBtn.first().click().catch(() => {});

await page.fill('#login-email', 'teacher@elab.test');
await page.fill('#login-password', 'Tm7@xK4!pR2#nJ8');
await page.getByRole('button', { name: /^accedi$/i }).click();
await page.waitForTimeout(3000);

await page.getByRole('button', { name: /^tutor$/i }).first().click();
await page.waitForTimeout(7000);

const data = await page.evaluate(() => {
  const compact = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const controls = [];
  document.querySelectorAll('input, textarea, button, [role="button"], a').forEach((el) => {
    controls.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      className: (el.className || '').toString().slice(0, 120),
      type: el.getAttribute('type') || '',
      placeholder: el.getAttribute('placeholder') || '',
      aria: el.getAttribute('aria-label') || '',
      text: compact(el.textContent || '').slice(0, 80),
    });
  });
  return {
    href: location.href,
    title: document.title,
    controls: controls.slice(0, 450),
    bodySnippet: compact(document.body.innerText || '').slice(0, 1200),
  };
});

console.log(JSON.stringify(data, null, 2));
await page.screenshot({ path: '/tmp/session61_probe_tutor_after_teacher.png', fullPage: true });
await browser.close();
