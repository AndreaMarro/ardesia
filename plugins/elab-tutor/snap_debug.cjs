const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 } });
  const page = await browser.newPage();
  try { await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 5000 }); } catch (e) { }
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: '/Users/andreamarro/.gemini/antigravity/brain/ee69273a-008e-4ced-b1d0-7c682ec2343d/puppeteer_debug.png' });
  await browser.close();
  console.log('Saved debug screenshot');
})();
