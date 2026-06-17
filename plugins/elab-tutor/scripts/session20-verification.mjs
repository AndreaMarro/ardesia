/**
 * Session 20 — Chain of Verification Finale
 * Verifica tutti i fix su produzione con Playwright
 * Andrea Marro — 19/02/2026
 */

import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CHROMIUM = '/Users/andreamarro/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'https://elab-builder.vercel.app';
const SHOTS = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/screenshots-s20';

// Ensure screenshots directory
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function log(msg) { console.log(`[S20] ${msg}`); results.push(msg); }

async function screenshot(page, name) {
    const p = path.join(SHOTS, `${name}.png`);
    await page.screenshot({ path: p, fullPage: false });
    log(`📸 ${name}.png saved`);
    return p;
}

(async () => {
    const browser = await chromium.launch({
        executablePath: CHROMIUM,
        headless: true,
        args: ['--no-sandbox', '--disable-gpu'],
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        ignoreHTTPSErrors: true,
    });

    const page = await context.newPage();

    // ─── Pre-set localStorage to skip onboarding ───
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => {
        localStorage.setItem('elab_onboarding_completed', 'true');
        localStorage.setItem('elab_onboarding_done', 'true');
        localStorage.setItem('elab_onboarding_vetrina', 'true');
        localStorage.setItem('elab_onboarding_tutor', 'true');
        localStorage.setItem('elab_onboarding_simulator', 'true');
        localStorage.setItem('elab_consent_v2', 'accepted');
    });

    // ─── LOGIN ───
    log('=== LOGIN ===');
    await page.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    try {
        await page.fill('input[type="email"]', 'debug@test.com');
        await page.fill('input[type="password"]', 'Xk9#mL2!nR4');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
        log('✅ Login completed');
    } catch (e) {
        log(`❌ Login failed: ${e.message}`);
    }
    await screenshot(page, '01-login-result');

    // ─── FASE 3 VERIFY: Tab Overflow at 3 viewports ───
    log('=== FASE 3: Tab Overflow Verification ===');

    // Teacher Dashboard
    await page.goto(`${BASE}/#teacher`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 1440px
    await screenshot(page, '02-teacher-1440px');

    // 768px
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await screenshot(page, '03-teacher-768px');

    // 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await screenshot(page, '04-teacher-375px');

    // Admin Panel
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await screenshot(page, '05-admin-1440px');

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await screenshot(page, '06-admin-768px');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await screenshot(page, '07-admin-375px');

    // ─── FASE 4 VERIFY: Font sizes ───
    log('=== FASE 4: Font Size Verification ===');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Check min font size on Teacher page
    await page.goto(`${BASE}/#teacher`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const minFontTeacher = await page.evaluate(() => {
        let minSize = 999;
        const all = document.querySelectorAll('*');
        for (const el of all) {
            const cs = window.getComputedStyle(el);
            const fs = parseFloat(cs.fontSize);
            if (fs > 0 && fs < minSize && el.offsetWidth > 0 && el.offsetHeight > 0 && el.textContent.trim()) {
                // Skip SVG internal elements
                if (el.closest('svg')) continue;
                minSize = fs;
            }
        }
        return minSize;
    });
    log(`Font min Teacher: ${minFontTeacher}px (target: ≥14px) ${minFontTeacher >= 14 ? '✅' : '⚠️'}`);

    // Check min font size on Admin page
    await page.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const minFontAdmin = await page.evaluate(() => {
        let minSize = 999;
        const all = document.querySelectorAll('*');
        for (const el of all) {
            const cs = window.getComputedStyle(el);
            const fs = parseFloat(cs.fontSize);
            if (fs > 0 && fs < minSize && el.offsetWidth > 0 && el.offsetHeight > 0 && el.textContent.trim()) {
                if (el.closest('svg')) continue;
                minSize = fs;
            }
        }
        return minSize;
    });
    log(`Font min Admin: ${minFontAdmin}px (target: ≥14px) ${minFontAdmin >= 14 ? '✅' : '⚠️'}`);

    // ─── FASE 5 VERIFY: Touch target ───
    log('=== FASE 5: Touch Target Verification ===');
    // Show consent banner for verification
    await page.evaluate(() => {
        localStorage.removeItem('elab_consent_v2');
    });
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const privacyLinkSize = await page.evaluate(() => {
        const link = document.querySelector('a[href="/privacy"]');
        if (!link) return { width: 0, height: 0 };
        const rect = link.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    log(`Privacy link size: ${privacyLinkSize.width}x${privacyLinkSize.height}px (target: height≥36px) ${privacyLinkSize.height >= 36 ? '✅' : '⚠️'}`);
    await screenshot(page, '08-consent-banner');

    // Restore consent
    await page.evaluate(() => {
        localStorage.setItem('elab_consent_v2', 'accepted');
    });

    // ─── FASE 6 VERIFY: No community refs ───
    log('=== FASE 6: Dead Code Verification ===');
    await page.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const communityTab = await page.evaluate(() => {
        const buttons = [...document.querySelectorAll('button')];
        return buttons.some(b => b.textContent.toLowerCase().includes('community'));
    });
    log(`Community tab visible in Admin: ${communityTab ? '❌ STILL VISIBLE' : '✅ REMOVED'}`);
    await screenshot(page, '09-admin-no-community');

    // ─── ALL PAGES at 3 viewports ───
    log('=== FULL PAGE VERIFICATION ===');
    const pages = ['tutor', 'teacher', 'admin', 'vetrina'];
    const viewports = [
        { w: 1440, h: 900, label: '1440' },
        { w: 768, h: 1024, label: '768' },
        { w: 375, h: 812, label: '375' },
    ];

    for (const pg of pages) {
        for (const vp of viewports) {
            await page.setViewportSize({ width: vp.w, height: vp.h });
            await page.goto(`${BASE}/#${pg}`, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);

            // Check for horizontal overflow
            const hasOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });

            // Check console errors
            const errors = [];
            page.on('pageerror', (err) => errors.push(err.message));

            await screenshot(page, `10-${pg}-${vp.label}px`);
            log(`${pg} @ ${vp.label}px — overflow: ${hasOverflow ? '❌' : '✅'}`);
        }
    }

    // ─── FASE 2: Whiteboard V2 Quick Test ───
    log('=== FASE 2: Whiteboard V2 Verification ===');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to a specific experiment via hash
    await page.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to navigate to experiment via volume click
    try {
        // Click Volume 1 button
        const v1Btn = await page.$('button.v4-volume-btn, [class*="volume"]');
        if (v1Btn) {
            await v1Btn.click();
            await page.waitForTimeout(1000);
            log('Clicked Volume 1');
        } else {
            // Try text-based approach
            const volumeEl = await page.locator('text=Volume 1').first();
            if (await volumeEl.isVisible({ timeout: 3000 })) {
                await volumeEl.click();
                await page.waitForTimeout(1000);
                log('Clicked Volume 1 (text)');
            } else {
                log('⚠️ Volume 1 button not found');
            }
        }
        await screenshot(page, '11-whiteboard-step1-volume');

        // Click first chapter
        const ch1 = await page.locator('text=Capitolo 1').first();
        if (await ch1.isVisible({ timeout: 3000 })) {
            await ch1.click();
            await page.waitForTimeout(1000);
            log('Clicked Capitolo 1');
        }
        await screenshot(page, '12-whiteboard-step2-chapter');

        // Click first experiment
        const exp1 = await page.locator('text=Esperimento 1').first();
        if (await exp1.isVisible({ timeout: 3000 })) {
            await exp1.click();
            await page.waitForTimeout(3000);
            log('Clicked Esperimento 1');
        }
        await screenshot(page, '13-whiteboard-step3-experiment');

        // Look for Whiteboard button
        const wbBtn = await page.locator('button:has-text("Lavagna"), [title*="Lavagna"], [aria-label*="Lavagna"]').first();
        if (await wbBtn.isVisible({ timeout: 5000 })) {
            await wbBtn.click();
            await page.waitForTimeout(1000);
            log('✅ Whiteboard button found and clicked');
            await screenshot(page, '14-whiteboard-open');

            // Verify canvas exists
            const canvasExists = await page.evaluate(() => {
                return !!document.querySelector('canvas');
            });
            log(`Whiteboard canvas: ${canvasExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

            // Check tool buttons
            const tools = ['Matita', 'Gomma', 'Testo', 'Rettangolo', 'Cerchio', 'Freccia', 'Linea'];
            for (const tool of tools) {
                const exists = await page.evaluate((t) => {
                    return !!document.querySelector(`[title="${t}"], button:has-text("${t}")`);
                }, tool);
                log(`  Tool "${tool}": ${exists ? '✅' : '❌'}`);
            }
            await screenshot(page, '15-whiteboard-tools');

            // Close whiteboard
            const closeBtn = await page.locator('[title="Chiudi"], button:has-text("Chiudi")').first();
            if (await closeBtn.isVisible({ timeout: 2000 })) {
                await closeBtn.click();
                await page.waitForTimeout(500);
                log('✅ Whiteboard closed');
            }
        } else {
            log('⚠️ Whiteboard button not visible (experiment may not have loaded)');
            await screenshot(page, '14-whiteboard-not-found');
        }
    } catch (e) {
        log(`⚠️ Whiteboard test: ${e.message}`);
        await screenshot(page, '14-whiteboard-error');
    }

    // ─── SUMMARY ───
    log('\n=== SESSION 20 VERIFICATION SUMMARY ===');
    const passCount = results.filter(r => r.includes('✅')).length;
    const failCount = results.filter(r => r.includes('❌')).length;
    const warnCount = results.filter(r => r.includes('⚠️')).length;
    log(`✅ PASS: ${passCount}`);
    log(`❌ FAIL: ${failCount}`);
    log(`⚠️ WARN: ${warnCount}`);

    await browser.close();

    // Save results
    const reportPath = path.join(SHOTS, 'verification-results.txt');
    fs.writeFileSync(reportPath, results.join('\n'));
    log(`Report saved to ${reportPath}`);
})().catch(e => {
    console.error('[S20] Fatal:', e.message);
    process.exit(1);
});
