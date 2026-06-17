const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  try { await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 5000 }); } catch (e) {}
  await new Promise(r => setTimeout(r, 8000));
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
  console.log("HTML:", html);
  await browser.close();
})();
