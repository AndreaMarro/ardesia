const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        console.log("Launching browser...");
        browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 } });
        const page = await browser.newPage();

        console.log("Navigating to simulator...");
        try {
            await page.goto('http://localhost:5173/#simulate', { waitUntil: 'load', timeout: 30000 });
        } catch (e) {
            console.log("Navigation timeout caught, continuing...");
        }
        await new Promise(r => setTimeout(r, 8000)); // Wait for chunks and React

        const clickText = async (txt) => {
            const ok = await page.evaluate((t) => {
                const els = document.querySelectorAll('button, div, span, h2, h3, h4, a');
                for (let i = 0; i < els.length; i++) {
                    const e = els[i];
                    if (e.textContent.includes(t) && e.offsetParent !== null && e.children.length < 5) {
                        e.click();
                        return true;
                    }
                }
                return false;
            }, txt);
            return ok;
        };

        const closeSidebar = async () => {
            await page.evaluate(() => {
                const els = document.querySelectorAll('button');
                for (let i = 0; i < els.length; i++) {
                    const b = els[i];
                    if (b.innerHTML.includes('svg') && !b.textContent.trim()) {
                        b.click();
                    }
                }
            });
        };

        // 1. Cap 14 Vol 1
        console.log("Clicking Mostra Esperimenti...");
        await clickText('Mostra Esperimenti') || await clickText('Esperimenti');
        await new Promise(r => setTimeout(r, 1000));

        console.log("Selecting Vol 1 Cap 14...");
        await clickText('Cap. 14');
        await new Promise(r => setTimeout(r, 3000));
        await closeSidebar();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: '/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/images/vetrina/hero-simulator.png' });
        console.log("Saved hero-simulator.png");

        // 2. Vol 3 LCD
        console.log("Re-opening sidebar...");
        await closeSidebar(); // The same button toggles it
        await new Promise(r => setTimeout(r, 1000));
        console.log("Selecting LCD Hello...");
        await clickText('LCD Hello');
        await new Promise(r => setTimeout(r, 3000));
        await closeSidebar();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: '/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/images/vetrina/simulator-rgb.png' });
        console.log("Saved simulator-rgb.png");

        // 3. Galileo
        console.log("Opening Galileo AI...");
        await clickText('Galileo') || await clickText('AI');
        await new Promise(r => setTimeout(r, 1000));
        await page.type('input[type="text"], textarea', 'Come funziona un LED?');
        await page.keyboard.press('Enter');
        console.log("Waiting for Galileo...");
        await new Promise(r => setTimeout(r, 8000));
        await page.screenshot({ path: '/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella/images/vetrina/galileo-chat.png' });
        console.log("Saved galileo-chat.png");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (browser) await browser.close();
        console.log("Done");
    }
})();
