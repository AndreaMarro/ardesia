/**
 * FASE 9 — Responsive Test (375px, 768px, 1440px)
 * Tests: Login, Tutor, Teacher, Admin at 3 viewports
 */
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'fs';

const CHROME = '/Users/andreamarro/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'https://elab-builder.vercel.app';
const SS_DIR = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/screenshots/s19/responsive';
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Admin account (verified working)
const ADMIN = { email: 'marro.andrea96@gmail.com', password: 'Bz4@qW8!fJ3#xV6' };

mkdirSync(SS_DIR, { recursive: true });

const results = [];

async function log(test, status, detail = '') {
  const entry = { test, status, detail };
  results.push(entry);
  console.log(`[${status}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function loginAs(page, email, password) {
  await page.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].fill(email);
    await inputs[1].fill(password);
    // Find and click login button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '');
      if (text.toLowerCase().includes('accedi') || text.toLowerCase().includes('login')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(4000);
  }
}

async function dismissOnboarding(page) {
  // Try to close onboarding overlay
  for (let i = 0; i < 5; i++) {
    const skipBtns = await page.$$('button');
    for (const btn of skipBtns) {
      const text = await btn.textContent().catch(() => '');
      if (text.includes('Salta') || text.includes('Skip') || text.includes('Chiudi') || text.includes('✕') || text.includes('×')) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  
  for (const vp of VIEWPORTS) {
    console.log(`\n===== VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) =====`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    
    // 1. Login page
    try {
      await page.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SS_DIR}/login-${vp.name}.png`, fullPage: true });
      
      // Check if form is visible and not overflowing
      const formVisible = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        const buttons = document.querySelectorAll('button');
        let allVisible = true;
        for (const el of [...inputs, ...buttons]) {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth || rect.left < 0) allVisible = false;
        }
        return { allVisible, inputCount: inputs.length, buttonCount: buttons.length };
      });
      
      await log(`login-${vp.name}`, formVisible.allVisible ? 'PASS' : 'FAIL',
        `inputs:${formVisible.inputCount}, buttons:${formVisible.buttonCount}, overflow:${!formVisible.allVisible}`);
    } catch (e) {
      await log(`login-${vp.name}`, 'FAIL', e.message.slice(0, 80));
    }
    
    // 2. Login as admin
    await loginAs(page, ADMIN.email, ADMIN.password);
    
    // 3. Tutor page
    try {
      await page.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      await dismissOnboarding(page);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SS_DIR}/tutor-${vp.name}.png`, fullPage: false });
      
      // Check sidebar visibility and overflow
      const tutorLayout = await page.evaluate(() => {
        const body = document.body;
        const hasHScroll = body.scrollWidth > window.innerWidth;
        // Check for sidebar
        const sidebar = document.querySelector('[class*="sidebar"], [class*="Sidebar"], [style*="width: 240"], [style*="width: 280"]');
        // Check text readability - find smallest font
        const allEls = document.querySelectorAll('*');
        let smallestFont = 100;
        for (const el of allEls) {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs > 0 && fs < smallestFont && el.textContent.trim().length > 0) {
            smallestFont = fs;
          }
        }
        return { hasHScroll, hasSidebar: !!sidebar, smallestFont: Math.round(smallestFont) };
      });
      
      await log(`tutor-${vp.name}`, !tutorLayout.hasHScroll ? 'PASS' : 'FAIL',
        `hScroll:${tutorLayout.hasHScroll}, sidebar:${tutorLayout.hasSidebar}, minFont:${tutorLayout.smallestFont}px`);
    } catch (e) {
      await log(`tutor-${vp.name}`, 'FAIL', e.message.slice(0, 80));
    }
    
    // 4. Teacher Dashboard
    try {
      await page.goto(`${BASE}/#teacher`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SS_DIR}/teacher-${vp.name}.png`, fullPage: true });
      
      const teacherLayout = await page.evaluate(() => {
        const hasHScroll = document.body.scrollWidth > window.innerWidth;
        // Check tab buttons overflow
        const buttons = document.querySelectorAll('button');
        let tabsOverflow = false;
        for (const btn of buttons) {
          const rect = btn.getBoundingClientRect();
          if (rect.right > window.innerWidth + 5) tabsOverflow = true;
        }
        return { hasHScroll, tabsOverflow, buttonCount: buttons.length };
      });
      
      await log(`teacher-${vp.name}`, !teacherLayout.hasHScroll && !teacherLayout.tabsOverflow ? 'PASS' : 'FAIL',
        `hScroll:${teacherLayout.hasHScroll}, tabsOverflow:${teacherLayout.tabsOverflow}, buttons:${teacherLayout.buttonCount}`);
    } catch (e) {
      await log(`teacher-${vp.name}`, 'FAIL', e.message.slice(0, 80));
    }
    
    // 5. Admin Panel
    try {
      await page.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SS_DIR}/admin-${vp.name}.png`, fullPage: true });
      
      const adminLayout = await page.evaluate(() => {
        const hasHScroll = document.body.scrollWidth > window.innerWidth;
        const buttons = document.querySelectorAll('button');
        let tabsOverflow = false;
        for (const btn of buttons) {
          const rect = btn.getBoundingClientRect();
          if (rect.right > window.innerWidth + 5) tabsOverflow = true;
        }
        return { hasHScroll, tabsOverflow, buttonCount: buttons.length };
      });
      
      await log(`admin-${vp.name}`, !adminLayout.hasHScroll && !adminLayout.tabsOverflow ? 'PASS' : 'FAIL',
        `hScroll:${adminLayout.hasHScroll}, tabsOverflow:${adminLayout.tabsOverflow}, buttons:${adminLayout.buttonCount}`);
    } catch (e) {
      await log(`admin-${vp.name}`, 'FAIL', e.message.slice(0, 80));
    }
    
    // 6. Dashboard Student
    try {
      await page.goto(`${BASE}/#dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${SS_DIR}/dashboard-${vp.name}.png`, fullPage: true });
      
      const dashLayout = await page.evaluate(() => {
        const hasHScroll = document.body.scrollWidth > window.innerWidth;
        return { hasHScroll };
      });
      
      await log(`dashboard-${vp.name}`, !dashLayout.hasHScroll ? 'PASS' : 'FAIL',
        `hScroll:${dashLayout.hasHScroll}`);
    } catch (e) {
      await log(`dashboard-${vp.name}`, 'FAIL', e.message.slice(0, 80));
    }
    
    // 7. Navbar responsiveness
    try {
      if (vp.name === 'mobile') {
        // Check hamburger menu exists
        const hasHamburger = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.textContent.includes('☰') || btn.textContent.includes('✕')) return true;
          }
          return false;
        });
        await log(`navbar-${vp.name}`, hasHamburger ? 'PASS' : 'FAIL',
          `hamburger:${hasHamburger}`);
      } else {
        // Desktop/tablet: check horizontal nav links
        const navInfo = await page.evaluate(() => {
          const nav = document.querySelector('nav') || document.querySelector('[class*="Navbar"]');
          const links = nav ? nav.querySelectorAll('a, button') : [];
          return { hasNav: !!nav, linkCount: links.length };
        });
        await log(`navbar-${vp.name}`, navInfo.hasNav ? 'PASS' : 'INFO',
          `nav:${navInfo.hasNav}, links:${navInfo.linkCount}`);
      }
    } catch (e) {
      await log(`navbar-${vp.name}`, 'INFO', e.message.slice(0, 80));
    }
    
    // 8. Touch targets check (mobile only)
    if (vp.name === 'mobile') {
      try {
        const touchTargets = await page.evaluate(() => {
          const interactive = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
          let tooSmall = 0;
          let total = 0;
          const smallOnes = [];
          for (const el of interactive) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              total++;
              if (rect.height < 36 || rect.width < 36) {
                tooSmall++;
                const text = (el.textContent || el.getAttribute('aria-label') || el.tagName).slice(0, 30);
                if (smallOnes.length < 5) smallOnes.push(`${text}(${Math.round(rect.width)}x${Math.round(rect.height)})`);
              }
            }
          }
          return { total, tooSmall, smallOnes };
        });
        
        await log(`touch-targets-mobile`, touchTargets.tooSmall === 0 ? 'PASS' : 'WARN',
          `total:${touchTargets.total}, tooSmall:${touchTargets.tooSmall}${touchTargets.smallOnes.length ? ' — ' + touchTargets.smallOnes.join(', ') : ''}`);
      } catch (e) {
        await log(`touch-targets-mobile`, 'FAIL', e.message.slice(0, 80));
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Summary
  console.log('\n===== RESPONSIVE SUMMARY =====');
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  console.log(`PASS: ${pass} | FAIL: ${fail} | WARN: ${warn} | TOTAL: ${results.length}`);
  
  writeFileSync(`${SS_DIR}/responsive-results.json`, JSON.stringify(results, null, 2));
  console.log('\nResults saved to responsive-results.json');
})();
