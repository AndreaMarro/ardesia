import {chromium, firefox, webkit, expect} from '@playwright/test';
import {spawn, execFileSync} from 'node:child_process';
import {mkdir, mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {tmpdir} from 'node:os';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.MARKETING_QA_OUTPUT || await mkdtemp(path.join(tmpdir(), 'ardesia-golive-qa-'));
await mkdir(output, {recursive: true});
let server;
let origin = process.env.MARKETING_BASE_URL;
if (!origin) {
  server = spawn(process.env.PYTHON || 'python3', [path.join(here, 'serve.py'), '--port', '0'], {stdio: ['ignore', 'pipe', 'inherit']});
  origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('preview_startup_timeout')), 10000);
    server.stdout.on('data', bytes => {
      const match = String(bytes).match(/Preview: (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    server.once('exit', code => { clearTimeout(timer); reject(Error('preview_exit_' + code)); });
  });
}
const widths = [320, 360, 375, 390, 430, 580, 768, 820, 1024, 1280, 1440, 1920];
const canonical = JSON.parse(await readFile(path.resolve(here, '../../packages/engine/lessonos/study/content/physics-pathways-v1.json'), 'utf8'));
const engines = {chromium, firefox, webkit};
const results = [];
const watchdog = setTimeout(() => { console.error('browser_deadline'); server?.kill('SIGTERM'); process.exit(1); }, 600000);
const cleanLayout = async page => {
  const problems = await page.evaluate(() => {
    const clipped = [...document.querySelectorAll('h1,h2,h3,.course-choice span,.selected-course,.button,.step-number')].filter(element => {
      const box = element.getBoundingClientRect();
      return box.width && box.height && (box.left < -.5 || box.right > innerWidth + .5 || element.scrollWidth > element.clientWidth + 2 || (element.matches('.step-number') && box.height > parseFloat(getComputedStyle(element).lineHeight) + 1));
    }).map(element => ({tag: element.tagName, text: element.textContent.slice(0, 80)}));
    return {overflow: document.documentElement.scrollWidth > innerWidth + 1, clipped};
  });
  if (problems.overflow || problems.clipped.length) {
    const diagnostic = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(node => {const box=node.getBoundingClientRect();return box.width && (box.right > innerWidth + 1 || box.left < -1);}).map(node => ({tag:node.tagName,class:node.className,text:node.textContent?.slice(0,120),bounds:node.getBoundingClientRect().toJSON()})));
    await writeFile(path.join(output, 'layout-failure.json'),JSON.stringify({url:page.url(),viewport:page.viewportSize(),problems,diagnostic},null,2));
    await page.screenshot({path:path.join(output,'layout-failure.png')});
  }
  expect(problems).toEqual({overflow: false, clipped: []});
};
try {
  for (const engine of (process.env.MARKETING_ENGINES || 'chromium').split(',')) {
    let browser;
    // Safari on macOS uses Option-Tab for links unless full keyboard navigation is enabled.
    const nextKey = engine === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
    try {
      browser = await engines[engine].launch({headless: true, ...(engine === 'chromium' && process.env.ARDESIA_BROWSER ? {executablePath: process.env.ARDESIA_BROWSER} : {})});
      const context = await browser.newContext({baseURL: origin, reducedMotion: 'reduce'});
      // A real new-tab navigation is exercised; no WhatsApp message or account is involved.
      await context.route('https://wa.me/**', route => route.fulfill({contentType: 'text/html', body: '<title>WhatsApp link under test</title><p>No message sent</p>'}));
      context.setDefaultTimeout(7000);
      context.setDefaultNavigationTimeout(15000);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const width of widths) {
        await page.setViewportSize({width, height: 844});
        await page.goto('/');
        await expect(page).toHaveTitle('Ardesia · Microcorsi di Fisica 2026/27');
        await expect(page.locator('h1')).toHaveText('Preparati al Semestre Filtro, un argomento alla volta.');
        await expect(page.getByText('Nuovi gruppi in formazione.', {exact: true})).toBeVisible();
        await expect(page.locator('article.course-card')).toHaveCount(4);
        await expect(page.locator('header .wordmark')).toHaveAccessibleName('Ardesia con Andrea Marro');
        await expect(page.locator('.contact-panel .interest-link')).toHaveAccessibleName('Chiedi disponibilità su WhatsApp per Strumenti e meccanica');
        const stickyName = await page.locator('.interest-bar .interest-link').getAttribute('aria-label');
        expect(stickyName).toContain('Scrivi'); expect(stickyName).toContain('Chiedi disponibilità');
        await cleanLayout(page);
        await page.screenshot({path: path.join(output, `${engine}-hero-${width}.png`)});
        for (const course of canonical.paths) {
          const card = page.locator(`#${course.id}`);
          await expect(card.locator('h3')).toHaveText(course.title);
          await expect(card.locator('.unit-label')).toHaveText(course.unitIds.join(' + '));
          const details = card.locator('details');
          expect(await details.evaluate(node => node.open)).toBe(width >= 1024);
          const cta = card.locator('[data-course]');
          const href = await cta.getAttribute('href');
          const url = new URL(href);
          expect(url.hostname).toBe('wa.me'); expect(url.pathname).toBe('/393461653930');
          for (const value of [course.title, 'Ardesia', 'non vincolante']) expect(url.searchParams.get('text')).toContain(value);
          const opened = context.waitForEvent('page'); await cta.click(); const popup = await opened;
          await popup.waitForLoadState(); expect(popup.url()).toBe(href); await popup.close();
        }
        await cleanLayout(page);
        console.log(engine, 'width', width, 'PASS');
        results.push({engine, width, responsive: 'PASS', allFourContactActivations: 'PASS', canonical: 'PASS'});
      }
      // Donor transfer 1: full programme disclosure and explicit choice survives resize.
      await page.setViewportSize({width: 390, height: 844}); await page.goto('/');
      const programme = page.locator('.programme').first();
      await programme.locator('summary').focus(); await page.keyboard.press('Enter');
      await expect(programme.locator('h4').first()).toBeVisible();
      await page.setViewportSize({width: 1440, height: 1000}); expect(await programme.evaluate(node => node.open)).toBe(true);
      await programme.locator('summary').click();
      await page.setViewportSize({width: 390, height: 844}); expect(await programme.evaluate(node => node.open)).toBe(false);
      // Donor transfer 2: index -> chosen course -> return/FAQ -> persistent full title -> change -> contact.
      await page.goto('/');
      await page.locator('.path-index a[href$="#onde-ottica-radiazioni"]').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#onde-ottica-radiazioni')).toBeFocused();
      await page.keyboard.press(nextKey);
      await expect(page.locator('#onde-ottica-radiazioni summary')).toBeFocused();
      await page.locator('#onde-ottica-radiazioni .back-to-paths').click();
      await expect(page.locator('.path-index')).toBeInViewport();
      await page.locator('.path-index a[href$="#onde-ottica-radiazioni"]').click();
      await expect(page.locator('.selected-course')).toHaveText('Onde, ottica e radiazioni');
      await page.getByRole('link', {name: 'FAQ', exact: true}).click();
      const bar = page.locator('.interest-bar'); await expect(bar).toBeVisible();
      await expect(bar.locator('.selected-course')).toHaveText('Onde, ottica e radiazioni');
      expect(new URL(await bar.locator('.interest-link').getAttribute('href')).searchParams.get('text')).toContain('Onde, ottica e radiazioni');
      await page.locator('.faq details').nth(1).locator('summary').focus(); await page.keyboard.press('Enter');
      await expect(page.getByText('Calendario, durata, formato, numero di partecipanti e costi saranno comunicati', {exact: false})).toBeVisible();
      await page.screenshot({path: path.join(output, `${engine}-faq-sticky-390.png`)});
      await bar.getByRole('link', {name: 'Cambia percorso', exact: true}).click();
      await expect(bar).toBeHidden();
      const radio = page.getByRole('radio', {name: 'Fluidi e termodinamica', exact: true}); await radio.check();
      await expect(radio).toBeChecked(); expect(new URL(page.url()).searchParams.get('percorso')).toBe('fluidi-termodinamica');
      expect(new URL(await page.locator('.contact-panel .interest-link').getAttribute('href')).searchParams.get('text')).toContain('Fluidi e termodinamica');
      await page.reload(); await expect(radio).toBeChecked();
      await page.getByRole('radio', {name: 'Elettricità e magnetismo', exact: true}).check();
      await page.goBack(); await expect(radio).toBeChecked();
      await page.goForward(); await expect(page.getByRole('radio', {name: 'Elettricità e magnetismo', exact: true})).toBeChecked();
      // Modified-click keeps the target course even when the source tab chose another.
      const independent = await context.newPage(); await independent.goto('/?percorso=fluidi-termodinamica#scegli-percorso');
      const openedCourse = context.waitForEvent('page');
      await independent.locator('.path-index a').last().click({modifiers: [process.platform === 'darwin' ? 'Meta' : 'Control']});
      const openedTab = await openedCourse; await openedTab.waitForLoadState();
      await expect(openedTab.getByRole('radio', {name: 'Onde, ottica e radiazioni', exact: true})).toBeChecked();
      await expect(independent.getByRole('radio', {name: 'Fluidi e termodinamica', exact: true})).toBeChecked();
      await openedTab.close(); await independent.close(); await page.bringToFront();
      // Independent tabs and unrecognised query values have a deterministic default.
      const other = await context.newPage(); await other.goto('/?percorso=sconosciuto');
      await expect(other.getByRole('radio', {name: 'Strumenti e meccanica', exact: true})).toBeChecked(); await other.close();
      await page.goto('/#onde-ottica-radiazioni'); await page.reload();
      await expect(page.getByRole('radio', {name: 'Onde, ottica e radiazioni', exact: true})).toBeChecked();
      // Root text enlargement is not a screenshot scale: layout must actually reflow.
      for (const width of [320, 390, 820]) {
        await page.setViewportSize({width, height: 844}); await page.goto('/');
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        await cleanLayout(page); await page.locator('#percorsi').scrollIntoViewIfNeeded(); await cleanLayout(page);
        const visible = await bar.isVisible();
        if (visible) expect((await bar.boundingBox()).height).toBeLessThanOrEqual(844 * .22);
        await page.screenshot({path: path.join(output, `${engine}-text200-${width}.png`)});
      }
      // Short viewports disable overlay; native in-page contacts stay reachable.
      for (const [width, height] of [[390, 420], [844, 390], [320, 568]]) {
        await page.setViewportSize({width, height}); await page.goto('/#percorsi');
        await cleanLayout(page);
        if (height <= 480) await expect(bar).toBeHidden();
        await page.locator('[data-course]').last().scrollIntoViewIfNeeded();
        await expect(page.locator('[data-course]').last()).toBeVisible();
        await page.screenshot({path: path.join(output, `${engine}-short-${width}-${height}.png`)});
      }
      await page.setViewportSize({width: 390, height: 844}); await page.goto('/');
      await page.keyboard.press(nextKey); await expect(page.getByRole('link', {name: 'Vai al contenuto'})).toBeFocused(); await page.keyboard.press('Enter');
      const keyboardRadio = page.getByRole('radio', {name: 'Strumenti e meccanica', exact: true});
      await keyboardRadio.focus(); await page.keyboard.press('ArrowDown'); await expect(radio).toBeChecked();
      await page.keyboard.press(nextKey); await expect(page.locator('.contact-panel .interest-link')).toBeFocused();
      const teacher = page.locator('#docente'); await teacher.scrollIntoViewIfNeeded();
      const portrait = teacher.locator('img');
      await expect.poll(() => portrait.evaluate(image => image.complete && image.naturalWidth === 640)).toBe(true);
      await portrait.evaluate(image => image.decode());
      expect(await portrait.evaluate(image => image.naturalWidth)).toBe(640);
      await page.screenshot({path: path.join(output, `${engine}-teacher-390.png`)});
      await page.locator('#footer').scrollIntoViewIfNeeded(); await expect(bar).toBeHidden();
      await cleanLayout(page); await page.screenshot({path: path.join(output, `${engine}-footer-390.png`)});
      const assetURLs = await page.locator('link[rel="stylesheet"],link[rel="icon"],script[src],img').evaluateAll(nodes => nodes.map(node => node.href || node.src));
      for (const url of assetURLs) expect((await context.request.get(url)).status()).toBe(200);
      for (const hash of await page.locator('a[href^="#"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) expect(await page.locator(hash).count()).toBeGreaterThan(0);
      const nojs = await browser.newContext({baseURL: origin, javaScriptEnabled: false});
      const fallback = await nojs.newPage(); await fallback.goto('/'); await expect(fallback.locator('[data-course]')).toHaveCount(4);
      for (const link of await fallback.locator('[data-course]').all()) expect(await link.getAttribute('href')).toContain('https://wa.me/393461653930?text=');
      await fallback.locator('.programme summary').first().click(); await expect(fallback.locator('.programme-body').first()).toBeVisible();
      await fallback.locator('.faq summary').nth(1).click(); await expect(fallback.getByText('Calendario, durata, formato', {exact: false})).toBeVisible(); await nojs.close();
      if (engine === 'chromium') {
        const math = path.join(output, 'matematica');
        execFileSync(process.env.PYTHON || 'python3', [path.join(here, 'tests/subject_fixture.py'), math]);
        const mathServer = spawn(process.env.PYTHON || 'python3', [path.join(here, 'serve.py'), '--directory', math, '--port', '0'], {stdio: ['ignore', 'pipe', 'inherit']});
        try {
          const mathURL = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(Error('math_preview_timeout')), 10000);
            mathServer.stdout.on('data', bytes => { const match = String(bytes).match(/Preview: (http:\/\/127\.0\.0\.1:\d+)/); if (match) {clearTimeout(timer); resolve(match[1]);} });
          });
          const mathPage = await context.newPage(); await mathPage.goto(mathURL);
          await expect(mathPage).toHaveTitle('Ardesia · Microcorsi di Matematica 2027/28');
          await expect(mathPage.locator('article')).toHaveCount(2);
          const mathHTML = await mathPage.content();
          expect(mathHTML).not.toContain('Fisica'); expect(mathHTML).not.toContain('MUR');
          await mathPage.getByRole('radio', {name: 'Algebra e sistemi lineari', exact: true}).check();
          expect(new URL(await mathPage.locator('.contact-panel .interest-link').getAttribute('href')).searchParams.get('text')).toContain('Matematica');
          await mathPage.reload(); await expect(mathPage.getByRole('radio', {name: 'Algebra e sistemi lineari', exact: true})).toBeChecked();
          await mathPage.screenshot({path: path.join(output, 'second-subject-matematica.png')}); await mathPage.close();
          results.push({secondSubject: 'Matematica', sameTemplatesSameInteractionCode: 'PASS', noPhysicsOrMURResidual: 'PASS', twoCanonicalFixturePaths: 'PASS', contactSelectionReload: 'PASS'});
        } finally { mathServer.kill('SIGTERM'); }
      }
      // New pedagogical transfer: problem -> optional hint -> reasoning -> check -> syllabus -> contact.
      const manifest = await (await context.request.get('/source-manifest.json')).json();
      if (process.env.MARKETING_REQUIRE_EXAMPLES === '1') expect(manifest.examples).toHaveLength(4);
      for (const entry of manifest.examples || []) {
        for (const width of widths) {
          await page.setViewportSize({width, height: 844}); await page.goto('/' + entry.url);
          await expect(page.locator('.editorial-note')).toContainText('DRAFT');
          const hint = page.locator('.example-hint'), reasoning = page.locator('.example-reasoning'), check = page.locator('.example-check');
          await expect(page.locator('.example-result')).toBeHidden();
          await hint.locator('summary').focus(); await page.keyboard.press('Enter');
          await expect(hint.locator('p')).toBeVisible(); await expect(page.locator('.example-result')).toBeHidden();
          await reasoning.locator(':scope > summary').click(); await expect(page.locator('.example-result')).toBeVisible();
          await check.locator('summary').click(); await expect(check.getByRole('heading', {name: 'Il controllo', exact: true})).toBeVisible();
          await cleanLayout(page);
          if ([320,390,820,1440].includes(width)) await page.screenshot({path: path.join(output, engine+'-example-'+entry.pathId+'-'+width+'.png'),fullPage:true});
          if ([320,820].includes(width)) {
            await page.evaluate(() => {document.documentElement.style.fontSize='200%';}); await cleanLayout(page);
          }
          await page.reload(); await expect(page.locator('.example-result')).toBeHidden();
        }
        const href=await page.locator('.example-contact').getAttribute('href');
        const course=canonical.paths.find(c=>c.id===entry.pathId);
        expect(new URL(href).searchParams.get('text')).toContain(course.title);
        const popupReady=context.waitForEvent('page'); await page.locator('.example-contact').click();
        const popup=await popupReady; await popup.waitForLoadState(); expect(popup.url()).toBe(href); await popup.close();
        await page.locator('.example-back').click();
        await expect(page.getByRole('radio',{name:course.title,exact:true})).toBeChecked();
        expect(new URL(page.url()).hash).toBe('#'+entry.pathId);
        const selectedCard=page.locator('#'+entry.pathId);
        await selectedCard.locator('.example-teaser').click(); await expect(page.locator('.example-problem')).toBeVisible();
        const nj=await browser.newContext({baseURL:origin,javaScriptEnabled:false});
        const np=await nj.newPage(); await np.goto('/'+entry.url);
        await np.locator('.example-reasoning summary').first().click(); await expect(np.locator('.example-result')).toBeVisible();
        await np.locator('.example-check summary').click(); await expect(np.locator('.example-check h3').first()).toBeVisible();
        await nj.close();
        results.push({engine,exampleId:entry.id,widths:'12 PASS',progressiveReveal:'PASS',hintDoesNotRevealSolution:'PASS',returnPreservesCourse:'PASS',specificContact:'PASS',reloadResetsDisclosure:'PASS',text200:'PASS',noJavaScript:'PASS'});
      }
      expect(errors).toEqual([]);
      const response = await page.goto('/pagina-inesistente/sottopagina/'); expect(response.status()).toBe(404);
      await expect(page.getByRole('heading', {name: 'Questo percorso non c’è.'})).toBeVisible();
      for (const css of await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(node => node.href))) expect((await context.request.get(css)).status()).toBe(200);
      await page.getByRole('link', {name: 'Torna ai microcorsi di Fisica'}).click(); await expect(page).toHaveTitle(/Ardesia/);
      results.push({engine, keyboard: 'PASS', text200: 'PASS', reflow320: 'PASS', lowViewport: 'PASS', reducedMotion: 'PASS', programmeTransfer: 'PASS', navigationConversionTransfer: 'PASS', deepLinkReloadBackForward: 'PASS', separateTab: 'PASS', assetsAnchorsFavicon: 'PASS', noJavaScript: 'PASS', notFound404: 'PASS', pageErrors: errors});
      console.log(engine, 'PASS', browser.version());
    } finally { await browser?.close(); }
  }
  await writeFile(path.join(output, 'browser-results.json'), JSON.stringify({status: 'PASS', origin, widths, results, deviceScope: 'Browser viewport emulation, no physical device claim', contactScope: 'Actual navigation intercepted; no messages sent'}, null, 2));
  console.log(JSON.stringify({status: 'PASS', widths, engines: results.filter(value => value.keyboard).map(value => value.engine)}));
} finally { clearTimeout(watchdog); server?.kill('SIGTERM'); }
