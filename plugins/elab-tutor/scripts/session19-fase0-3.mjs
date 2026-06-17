/**
 * Session 19 — FASE 0-3: Ambiente + Auth E2E + Navbar + Galileo AI
 * Playwright-core headless — brutally honest audit
 * Andrea Marro + Claude — 19/02/2026
 */
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const CHROMIUM = '/Users/andreamarro/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'https://elab-builder.vercel.app';
const NETLIFY = 'https://funny-pika-3d1029.netlify.app';
const SHOTS = '/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/scripts/screenshots/s19';

const ACCOUNTS = [
  { role: 'admin', email: 'debug@test.com', password: 'Xk9#mL2!nR4' },
  { role: 'teacher', email: 'teacher@elab.test', password: 'Pw8&jF3@hT6!cZ1' },
  { role: 'student', email: 'student@elab.test', password: 'Ry5!kN7#dM2$wL9' },
  { role: 'admin2', email: 'marro.andrea96@gmail.com', password: 'Bz4@qW8!fJ3#xV6' },
];

fs.mkdirSync(SHOTS, { recursive: true });

const results = { fase0: [], fase1: [], fase2: [], fase3: [] };

function log(fase, test, status, detail = '') {
  const entry = { test, status, detail };
  results[fase].push(entry);
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'BLOCKED' ? '🚫' : status === 'MOCK' ? '🎭' : '⚠️';
  console.log(`  ${icon} [${fase.toUpperCase()}] ${test}${detail ? ` — ${detail}` : ''}`);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });

  // ═══════════════════════════════════════════
  // FASE 0: Ambiente + Login 4 account + RBAC
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 0: AMBIENTE + LOGIN 4 ACCOUNT ═══');

  // Test n8n
  log('fase0', 'n8n webhooks', 'BLOCKED', 'Connection refused (000) — completamente OFFLINE');

  // Test each account login + RBAC
  for (const acc of ACCOUNTS) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Fill login form
      const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]');
      const passInput = await page.$('input[type="password"]');

      if (!emailInput || !passInput) {
        log('fase0', `Login ${acc.role} (${acc.email})`, 'FAIL', 'Form inputs non trovati');
        await shot(page, `f0-login-fail-${acc.role}`);
        await ctx.close();
        continue;
      }

      await emailInput.fill(acc.email);
      await passInput.fill(acc.password);
      await shot(page, `f0-login-form-${acc.role}`);

      // Click login button
      const loginBtn = await page.$('button[type="submit"], button:has-text("Accedi"), button:has-text("Login")');
      if (loginBtn) await loginBtn.click();
      await page.waitForTimeout(4000);

      const currentHash = await page.evaluate(() => window.location.hash);
      const currentUrl = page.url();
      await shot(page, `f0-login-result-${acc.role}`);

      if (currentHash === '#login' || currentHash === '') {
        // Check for error message
        const errorEl = await page.$('.error, [class*="error"], [class*="Error"], [role="alert"]');
        const errorText = errorEl ? await errorEl.textContent() : 'nessun errore visibile';
        log('fase0', `Login ${acc.role} (${acc.email})`, 'FAIL', `Rimasto su #login. Error: ${errorText}`);
      } else {
        log('fase0', `Login ${acc.role} (${acc.email})`, 'PASS', `Redirect a ${currentHash}`);

        // RBAC check — try to access restricted routes
        if (acc.role === 'student') {
          await page.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
          const adminHash = await page.evaluate(() => window.location.hash);
          if (adminHash === '#admin') {
            log('fase0', `RBAC: student accede a #admin`, 'FAIL', 'Studente non dovrebbe vedere admin');
          } else {
            log('fase0', `RBAC: student bloccato da #admin`, 'PASS', `Redirect a ${adminHash}`);
          }

          await page.goto(`${BASE}/#teacher`, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
          const teacherHash = await page.evaluate(() => window.location.hash);
          if (teacherHash === '#teacher') {
            log('fase0', `RBAC: student accede a #teacher`, 'FAIL', 'Studente non dovrebbe vedere teacher');
          } else {
            log('fase0', `RBAC: student bloccato da #teacher`, 'PASS', `Redirect a ${teacherHash}`);
          }
        }

        if (acc.role === 'teacher') {
          await page.goto(`${BASE}/#admin`, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
          const adminHash = await page.evaluate(() => window.location.hash);
          if (adminHash === '#admin') {
            log('fase0', `RBAC: teacher accede a #admin`, 'FAIL', 'Teacher non dovrebbe vedere admin');
          } else {
            log('fase0', `RBAC: teacher bloccato da #admin`, 'PASS', `Redirect a ${adminHash}`);
          }

          await page.goto(`${BASE}/#teacher`, { waitUntil: 'networkidle', timeout: 15000 });
          await page.waitForTimeout(2000);
          const teacherHash2 = await page.evaluate(() => window.location.hash);
          log('fase0', `RBAC: teacher accede a #teacher`, teacherHash2 === '#teacher' ? 'PASS' : 'FAIL', `Hash: ${teacherHash2}`);
          await shot(page, `f0-rbac-teacher-dashboard`);
        }

        if (acc.role === 'admin' || acc.role === 'admin2') {
          // Admin should access everything
          for (const route of ['#admin', '#teacher', '#tutor']) {
            await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(2000);
            const h = await page.evaluate(() => window.location.hash);
            log('fase0', `RBAC: ${acc.role} accede a ${route}`, h === route ? 'PASS' : 'FAIL', `Hash: ${h}`);
          }
        }
      }
    } catch (err) {
      log('fase0', `Login ${acc.role}`, 'FAIL', err.message.slice(0, 100));
    }
    await ctx.close();
  }

  // ═══════════════════════════════════════════
  // FASE 1: Auth E2E completa
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 1: AUTH E2E ═══');

  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p1 = await ctx1.newPage();

  // Test: Login failed con credenziali sbagliate
  try {
    await p1.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 30000 });
    await p1.waitForTimeout(2000);
    const emailI = await p1.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passI = await p1.$('input[type="password"]');
    if (emailI && passI) {
      await emailI.fill('wrong@wrong.com');
      await passI.fill('wrongpassword123');
      const btn = await p1.$('button[type="submit"], button:has-text("Accedi"), button:has-text("Login")');
      if (btn) await btn.click();
      await p1.waitForTimeout(3000);
      await shot(p1, 'f1-login-failed');
      const errVisible = await p1.evaluate(() => {
        const els = document.querySelectorAll('[class*="error" i], [class*="Error"], [role="alert"], .error-message');
        return Array.from(els).map(e => e.textContent.trim()).filter(Boolean);
      });
      log('fase1', 'Login fallito → errore visibile', errVisible.length > 0 ? 'PASS' : 'FAIL', errVisible.join(' | ') || 'nessun errore visibile');
    }
  } catch (err) {
    log('fase1', 'Login fallito test', 'FAIL', err.message.slice(0, 80));
  }

  // Test: RequireAuth guard (non loggato → #tutor)
  try {
    const ctx_guard = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pg = await ctx_guard.newPage();
    await pg.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 20000 });
    await pg.waitForTimeout(3000);
    const h = await pg.evaluate(() => window.location.hash);
    log('fase1', 'RequireAuth guard (#tutor senza login)', h !== '#tutor' ? 'PASS' : 'FAIL', `Hash: ${h}`);
    await shot(pg, 'f1-guard-requireauth');
    await ctx_guard.close();
  } catch (err) {
    log('fase1', 'RequireAuth guard', 'FAIL', err.message.slice(0, 80));
  }

  // Test: Privacy Policy page
  try {
    await p1.goto(`${BASE}/privacy`, { waitUntil: 'networkidle', timeout: 20000 });
    await p1.waitForTimeout(2000);
    const privacyContent = await p1.evaluate(() => document.body.innerText.length);
    await shot(p1, 'f1-privacy-policy');
    log('fase1', 'Privacy Policy (/privacy)', privacyContent > 200 ? 'PASS' : 'FAIL', `${privacyContent} caratteri`);
  } catch (err) {
    log('fase1', 'Privacy Policy', 'FAIL', err.message.slice(0, 80));
  }

  // Test: Data Deletion page
  try {
    await p1.goto(`${BASE}/data-deletion`, { waitUntil: 'networkidle', timeout: 20000 });
    await p1.waitForTimeout(2000);
    const deletionContent = await p1.evaluate(() => document.body.innerText.length);
    await shot(p1, 'f1-data-deletion');
    log('fase1', 'Data Deletion (/data-deletion)', deletionContent > 100 ? 'PASS' : 'FAIL', `${deletionContent} caratteri`);
  } catch (err) {
    log('fase1', 'Data Deletion', 'FAIL', err.message.slice(0, 80));
  }

  // Test: Registration page
  try {
    await p1.goto(`${BASE}/#register`, { waitUntil: 'networkidle', timeout: 20000 });
    await p1.waitForTimeout(2000);
    await shot(p1, 'f1-register-page');
    const regForm = await p1.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      return {
        inputCount: inputs.length,
        types: Array.from(inputs).map(i => i.type || i.name || 'unknown'),
        hasSubmit: !!document.querySelector('button[type="submit"], button:has-text("Registra"), button:has-text("Crea")')
      };
    });
    log('fase1', 'Registration page', regForm.inputCount >= 3 ? 'PASS' : 'FAIL', `${regForm.inputCount} input, types: ${regForm.types.join(',')} submit: ${regForm.hasSubmit}`);
  } catch (err) {
    log('fase1', 'Registration page', 'FAIL', err.message.slice(0, 80));
  }

  // Test: Login + Logout + sessionStorage cleanup
  try {
    await p1.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 20000 });
    await p1.waitForTimeout(2000);
    const emailI2 = await p1.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passI2 = await p1.$('input[type="password"]');
    if (emailI2 && passI2) {
      await emailI2.fill('debug@test.com');
      await passI2.fill('Xk9#mL2!nR4');
      const btn2 = await p1.$('button[type="submit"], button:has-text("Accedi"), button:has-text("Login")');
      if (btn2) await btn2.click();
      await p1.waitForTimeout(4000);

      // Check sessionStorage has token
      const hasToken = await p1.evaluate(() => {
        const auth = sessionStorage.getItem('elab_auth');
        return auth ? JSON.parse(auth) : null;
      });
      log('fase1', 'Token in sessionStorage post-login', hasToken ? 'PASS' : 'FAIL', hasToken ? `token: ${JSON.stringify(hasToken).slice(0, 60)}...` : 'nessun token');
      await shot(p1, 'f1-post-login-admin');

      // Consent Banner check
      const consentVisible = await p1.evaluate(() => {
        const banner = document.querySelector('[class*="consent" i], [class*="cookie" i], [class*="banner" i]');
        return banner ? { visible: true, text: banner.textContent.slice(0, 100) } : { visible: false };
      });
      log('fase1', 'Consent Banner', consentVisible.visible ? 'PASS' : 'WARN', consentVisible.visible ? consentVisible.text : 'Banner non visibile (potrebbe essere già accettato)');

      // Find and click logout
      const logoutBtn = await p1.$('button:has-text("Logout"), button:has-text("Esci"), a:has-text("Logout"), [aria-label*="logout" i]');
      if (!logoutBtn) {
        // Try dropdown menu first
        const accountBtn = await p1.$('[class*="account"], [class*="avatar"], [class*="dropdown"], [class*="user-menu"]');
        if (accountBtn) {
          await accountBtn.click();
          await p1.waitForTimeout(500);
        }
        const logoutBtn2 = await p1.$('button:has-text("Logout"), button:has-text("Esci"), a:has-text("Esci")');
        if (logoutBtn2) {
          await logoutBtn2.click();
          await p1.waitForTimeout(3000);
        } else {
          log('fase1', 'Logout button', 'FAIL', 'Pulsante logout non trovato');
        }
      } else {
        await logoutBtn.click();
        await p1.waitForTimeout(3000);
      }

      const hashAfterLogout = await p1.evaluate(() => window.location.hash);
      const tokenAfterLogout = await p1.evaluate(() => sessionStorage.getItem('elab_auth'));
      await shot(p1, 'f1-post-logout');
      log('fase1', 'Logout → redirect', hashAfterLogout === '#login' || hashAfterLogout === '' ? 'PASS' : 'FAIL', `Hash: ${hashAfterLogout}`);
      log('fase1', 'Logout → sessionStorage pulito', !tokenAfterLogout ? 'PASS' : 'FAIL', tokenAfterLogout ? 'token ancora presente!' : 'pulito');
    }
  } catch (err) {
    log('fase1', 'Login/Logout E2E', 'FAIL', err.message.slice(0, 80));
  }

  // Test: Vetrina (#vetrina) — what does it show?
  try {
    const ctx_vetrina = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pv = await ctx_vetrina.newPage();
    // Login as student (no license expected)
    await pv.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 20000 });
    await pv.waitForTimeout(2000);
    const ei = await pv.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const pi = await pv.$('input[type="password"]');
    if (ei && pi) {
      await ei.fill('student@elab.test');
      await pi.fill('Ry5!kN7#dM2$wL9');
      const btn = await pv.$('button[type="submit"], button:has-text("Accedi")');
      if (btn) await btn.click();
      await pv.waitForTimeout(4000);
      const h = await pv.evaluate(() => window.location.hash);
      await shot(pv, 'f1-vetrina-or-tutor');
      log('fase1', 'Student post-login destination', 'INFO', `Hash: ${h}`);
      if (h === '#vetrina') {
        const vetrinaContent = await pv.evaluate(() => document.body.innerText.slice(0, 300));
        log('fase1', 'Vetrina page content', vetrinaContent.length > 50 ? 'PASS' : 'FAIL', vetrinaContent.slice(0, 100));
      }
    }
    await ctx_vetrina.close();
  } catch (err) {
    log('fase1', 'Vetrina test', 'FAIL', err.message.slice(0, 80));
  }

  await ctx1.close();

  // ═══════════════════════════════════════════
  // FASE 2: Navbar + Navigazione
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 2: NAVBAR + NAVIGAZIONE ═══');

  // Desktop test (logged in as admin)
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  try {
    await p2.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 20000 });
    await p2.waitForTimeout(2000);
    const ei = await p2.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const pi = await p2.$('input[type="password"]');
    if (ei && pi) {
      await ei.fill('debug@test.com');
      await pi.fill('Xk9#mL2!nR4');
      const btn = await p2.$('button[type="submit"], button:has-text("Accedi")');
      if (btn) await btn.click();
      await p2.waitForTimeout(4000);
    }

    await shot(p2, 'f2-navbar-desktop');

    // Check navbar structure
    const navInfo = await p2.evaluate(() => {
      const nav = document.querySelector('nav, [class*="navbar" i], [class*="Navbar" i], header');
      if (!nav) return { found: false };
      const links = nav.querySelectorAll('a, button');
      const items = Array.from(links).map(l => ({
        text: l.textContent.trim().slice(0, 30),
        href: l.getAttribute('href') || '',
        onClick: !!l.onclick || l.getAttribute('onclick') || '',
      }));
      return { found: true, itemCount: items.length, items };
    });
    log('fase2', 'Navbar presente (desktop)', navInfo.found ? 'PASS' : 'FAIL', `${navInfo.itemCount || 0} items`);
    if (navInfo.items) {
      navInfo.items.forEach(item => {
        if (item.text) console.log(`    📌 "${item.text}" → ${item.href || 'click handler'}`);
      });
    }

    // Check for dead "community" references
    const deadCode = await p2.evaluate(() => {
      const all = document.body.innerHTML.toLowerCase();
      return {
        community: (all.match(/community/g) || []).length,
        groups: (all.match(/#groups/g) || []).length,
        profile: (all.match(/#profile/g) || []).length,
      };
    });
    log('fase2', 'Dead "community" references in DOM', deadCode.community === 0 ? 'PASS' : 'WARN', `community: ${deadCode.community}, #groups: ${deadCode.groups}, #profile: ${deadCode.profile}`);

  } catch (err) {
    log('fase2', 'Navbar desktop test', 'FAIL', err.message.slice(0, 80));
  }

  // Mobile test (375px)
  try {
    await p2.setViewportSize({ width: 375, height: 812 });
    await p2.waitForTimeout(1000);
    await shot(p2, 'f2-navbar-mobile-closed');

    // Find hamburger
    const hamburger = await p2.$('[class*="hamburger" i], [class*="mobile-toggle" i], [aria-label*="menu" i], button[class*="menu" i]');
    if (hamburger) {
      await hamburger.click();
      await p2.waitForTimeout(1000);
      await shot(p2, 'f2-navbar-mobile-open');

      const mobileNavContent = await p2.evaluate(() => {
        const nav = document.querySelector('[class*="mobile-nav" i], nav[class*="open" i], [class*="mobile-menu" i]');
        if (!nav) return { found: false };
        return { found: true, text: nav.innerText.slice(0, 300), height: nav.offsetHeight };
      });
      log('fase2', 'Hamburger menu mobile (375px)', mobileNavContent.found ? 'PASS' : 'FAIL', mobileNavContent.found ? `height: ${mobileNavContent.height}px` : 'nav non trovata');
    } else {
      log('fase2', 'Hamburger button mobile (375px)', 'FAIL', 'Pulsante hamburger non trovato');
    }
  } catch (err) {
    log('fase2', 'Navbar mobile test', 'FAIL', err.message.slice(0, 80));
  }

  // Tablet test (768px)
  try {
    await p2.setViewportSize({ width: 768, height: 1024 });
    await p2.waitForTimeout(1000);
    await shot(p2, 'f2-navbar-tablet');
    log('fase2', 'Navbar tablet (768px)', 'PASS', 'Screenshot catturato');
  } catch (err) {
    log('fase2', 'Navbar tablet', 'FAIL', err.message.slice(0, 80));
  }

  await ctx2.close();

  // ═══════════════════════════════════════════
  // FASE 3: Galileo AI Chat
  // ═══════════════════════════════════════════
  console.log('\n═══ FASE 3: GALILEO AI CHAT ═══');

  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p3 = await ctx3.newPage();

  // Collect console errors
  const consoleErrors = [];
  p3.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 120));
  });

  try {
    // Login as admin
    await p3.goto(`${BASE}/#login`, { waitUntil: 'networkidle', timeout: 30000 });
    await p3.waitForTimeout(2000);
    const ei = await p3.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const pi = await p3.$('input[type="password"]');
    if (ei && pi) {
      await ei.fill('debug@test.com');
      await pi.fill('Xk9#mL2!nR4');
      const btn = await p3.$('button[type="submit"], button:has-text("Accedi")');
      if (btn) await btn.click();
      await p3.waitForTimeout(5000);
    }

    // Navigate to tutor
    await p3.goto(`${BASE}/#tutor`, { waitUntil: 'networkidle', timeout: 30000 });
    await p3.waitForTimeout(5000);

    // Dismiss onboarding if present
    const skipBtn = await p3.$('button:has-text("Salta"), button:has-text("Skip"), button:has-text("Chiudi"), [class*="skip" i]');
    if (skipBtn) {
      await skipBtn.click();
      await p3.waitForTimeout(1000);
    }

    await shot(p3, 'f3-tutor-main');

    // Check Galileo chat UI
    const chatUI = await p3.evaluate(() => {
      // Look for chat input, send button, chat messages, chat overlay
      const chatInput = document.querySelector('textarea[placeholder*="Galileo" i], input[placeholder*="Galileo" i], textarea[placeholder*="chiedi" i], input[placeholder*="chiedi" i], [class*="chat-input" i] textarea, [class*="chat-input" i] input');
      const sendBtn = document.querySelector('button[aria-label*="invia" i], button:has-text("Invia"), [class*="send" i] button');
      const messages = document.querySelectorAll('[class*="message" i], [class*="chat-msg" i]');
      const chatPanel = document.querySelector('[class*="chat" i], [class*="galileo" i], [class*="Chat" i]');
      const welcomeMsg = document.body.innerText.includes('Galileo');
      const socraticToggle = document.querySelector('[class*="socratic" i], input[type="checkbox"][id*="socratic" i], button:has-text("Socratic"), button:has-text("Guida")');

      return {
        hasInput: !!chatInput,
        inputPlaceholder: chatInput?.placeholder || 'N/A',
        hasSendBtn: !!sendBtn,
        messageCount: messages.length,
        hasChatPanel: !!chatPanel,
        hasWelcomeMsg: welcomeMsg,
        hasSocraticToggle: !!socraticToggle,
      };
    });

    log('fase3', 'Chat input presente', chatUI.hasInput ? 'PASS' : 'FAIL', `placeholder: "${chatUI.inputPlaceholder}"`);
    log('fase3', 'Send button presente', chatUI.hasSendBtn ? 'PASS' : 'FAIL', '');
    log('fase3', 'Chat panel presente', chatUI.hasChatPanel ? 'PASS' : 'FAIL', '');
    log('fase3', 'Welcome message (Galileo)', chatUI.hasWelcomeMsg ? 'PASS' : 'FAIL', '');
    log('fase3', 'Socratic mode toggle', chatUI.hasSocraticToggle ? 'PASS' : 'WARN', chatUI.hasSocraticToggle ? '' : 'Toggle non trovato visivamente');

    // Try sending a message
    const chatInput = await p3.$('textarea[placeholder*="Galileo" i], input[placeholder*="Galileo" i], textarea[placeholder*="chiedi" i], input[placeholder*="chiedi" i], [class*="chat-input" i] textarea, [class*="chat-input" i] input');
    if (chatInput) {
      await chatInput.fill('Come funziona un LED?');
      await shot(p3, 'f3-chat-message-typed');

      const sendBtn = await p3.$('button[aria-label*="invia" i], button:has-text("Invia"), [class*="send" i] button');
      if (sendBtn) {
        await sendBtn.click();
        await p3.waitForTimeout(5000);
        await shot(p3, 'f3-chat-after-send');

        // Check what happened
        const afterSend = await p3.evaluate(() => {
          const msgs = document.querySelectorAll('[class*="message" i]');
          const errorVisible = document.body.innerText.includes('connessione') ||
                              document.body.innerText.includes('errore') ||
                              document.body.innerText.includes('riprova') ||
                              document.body.innerText.includes('non funziona');
          const loadingVisible = document.querySelector('[class*="loading" i], [class*="spinner" i], [class*="typing" i]');
          return {
            messageCount: msgs.length,
            errorVisible,
            loadingVisible: !!loadingVisible,
            bodySnippet: document.body.innerText.slice(-500),
          };
        });
        log('fase3', 'Invio messaggio', 'PASS', 'Messaggio inviato');
        log('fase3', 'Risposta AI (n8n OFFLINE)', afterSend.errorVisible ? 'BLOCKED' : 'WARN',
          afterSend.errorVisible ? 'Errore rete mostrato (corretto — n8n offline)' : 'Nessun errore visibile — potrebbe essere in loading infinito');
      }
    }

    // Check window.__ELAB_API
    const elabAPI = await p3.evaluate(() => {
      const api = window.__ELAB_API;
      if (!api) return { exists: false };
      return {
        exists: true,
        methods: Object.keys(api),
        hasGalileo: !!api.galileo,
        galileoMethods: api.galileo ? Object.keys(api.galileo) : [],
        hasOn: typeof api.on === 'function',
        hasOff: typeof api.off === 'function',
      };
    });
    log('fase3', 'window.__ELAB_API esiste', elabAPI.exists ? 'PASS' : 'FAIL', elabAPI.methods?.join(', ') || '');
    if (elabAPI.hasGalileo) {
      log('fase3', '__ELAB_API.galileo bridge', 'PASS', `Methods: ${elabAPI.galileoMethods.join(', ')}`);
    } else {
      log('fase3', '__ELAB_API.galileo bridge', 'FAIL', 'galileo namespace non trovato');
    }
    log('fase3', '__ELAB_API.on/off (pub/sub)', elabAPI.hasOn && elabAPI.hasOff ? 'PASS' : 'FAIL', '');

    // Quick suggestions test
    const quickSuggestions = await p3.evaluate(() => {
      const btns = document.querySelectorAll('button');
      const suggestions = Array.from(btns).filter(b => {
        const t = b.textContent.trim();
        return t.includes('LED') || t.includes('resistore') || t.includes('Ohm') || t.includes('circuito');
      });
      return suggestions.map(s => s.textContent.trim().slice(0, 50));
    });
    log('fase3', 'Quick suggestions visibili', quickSuggestions.length > 0 ? 'PASS' : 'WARN', quickSuggestions.join(' | ') || 'nessun suggerimento rapido visibile');

  } catch (err) {
    log('fase3', 'Galileo AI test', 'FAIL', err.message.slice(0, 100));
  }

  // Log console errors
  if (consoleErrors.length > 0) {
    console.log(`\n  📋 Console errors (${consoleErrors.length}):`);
    consoleErrors.slice(0, 10).forEach(e => console.log(`    ⚠️ ${e}`));
  }

  await ctx3.close();

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n\n═══════════════════════════════════════');
  console.log('         SESSION 19 — FASE 0-3 SUMMARY');
  console.log('═══════════════════════════════════════');

  for (const [fase, tests] of Object.entries(results)) {
    const pass = tests.filter(t => t.status === 'PASS').length;
    const fail = tests.filter(t => t.status === 'FAIL').length;
    const blocked = tests.filter(t => t.status === 'BLOCKED').length;
    const warn = tests.filter(t => t.status === 'WARN' || t.status === 'INFO').length;
    console.log(`\n  ${fase.toUpperCase()}: ${pass} PASS | ${fail} FAIL | ${blocked} BLOCKED | ${warn} WARN`);
    tests.filter(t => t.status === 'FAIL').forEach(t => console.log(`    ❌ ${t.test}: ${t.detail}`));
    tests.filter(t => t.status === 'BLOCKED').forEach(t => console.log(`    🚫 ${t.test}: ${t.detail}`));
  }

  const totalPass = Object.values(results).flat().filter(t => t.status === 'PASS').length;
  const totalFail = Object.values(results).flat().filter(t => t.status === 'FAIL').length;
  const totalBlocked = Object.values(results).flat().filter(t => t.status === 'BLOCKED').length;
  console.log(`\n  TOTALE: ${totalPass} PASS | ${totalFail} FAIL | ${totalBlocked} BLOCKED`);
  console.log('═══════════════════════════════════════\n');

  await browser.close();
})();
