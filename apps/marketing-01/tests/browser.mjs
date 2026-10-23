import {chromium, expect} from '@playwright/test';
import {spawn} from 'node:child_process';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {tmpdir} from 'node:os';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.env.MARKETING_QA_OUTPUT || await mkdtemp(path.join(tmpdir(),'ardesia-marketing-qa-'));
await mkdir(output,{recursive:true});
const server=spawn(process.env.PYTHON || 'python3',[path.join(here,'serve.py'),'--port','0'],{stdio:['ignore','pipe','inherit']});
const origin=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('preview_startup_timeout')),10000);server.stdout.on('data',b=>{const match=String(b).match(/Preview: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});server.once('exit',c=>{clearTimeout(timer);reject(Error('preview_exit_'+c));});});
let browser;const checks=[];const watchdog=setTimeout(()=>{console.error('overall_browser_deadline');server.kill('SIGTERM');process.exit(1)},120000);
try{
 browser=await chromium.launch({executablePath:process.env.ARDESIA_BROWSER || undefined,headless:true});
 const context=await browser.newContext({baseURL:origin,reducedMotion:'reduce'});
 // Validate actual browser activation without sending messages or involving an account.
 await context.route('https://wa.me/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>WhatsApp link under test</title><p>No message sent</p>'}));
 context.setDefaultTimeout(7000);context.setDefaultNavigationTimeout(12000);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const canonical=JSON.parse(await readFile(path.resolve(here,'../../packages/engine/lessonos/study/content/physics-pathways-v1.json'),'utf8'));
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/');await expect(page).toHaveTitle(/Ardesia/);await expect(page.getByRole('heading',{level:1})).toHaveText('Dalle formuleal ragionamento.');
  await expect(page.locator('article.course-card')).toHaveCount(canonical.paths.length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:path.join(output,`hero-${width}.png`)});
  for(const course of canonical.paths){
   const cta=page.locator(`[data-course="${course.id}"]`);const href=await cta.getAttribute('href');const url=new URL(href);expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe('/393461653930');expect(url.searchParams.get('text')).toContain(course.title);expect(url.searchParams.get('text')).toContain('Ardesia');expect(url.searchParams.get('text')).toContain('non vincolante');
   const popupPromise=context.waitForEvent('page');await cta.click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(href);await popup.close();
  }
  await page.getByRole('link',{name:'Domande',exact:true}).click();await page.getByText('Date, durata e costi?',{exact:false}).click();
  const bar=page.getByRole('complementary',{name:'Segnala il percorso che ti interessa'});await expect(bar).toBeVisible();
  for(const course of canonical.paths){await page.locator('#course-sticky').selectOption(course.id);expect(new URL(await bar.locator('a').getAttribute('href')).searchParams.get('text')).toContain(course.title);await expect(page.locator('#course-hero')).toHaveValue(course.id);}
  await expect(page.getByText('Calendario, durata, formato, numero di partecipanti ed eventuali costi sono ancora da definire.',{exact:false})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:path.join(output,`faq-interest-${width}.png`)});
  console.log('viewport passed',width);checks.push({width,allFourCourseContacts:'PASS',persistentSelectedCourse:'PASS',overflow:'PASS'});
 }
 // Keyboard, real native disclosures, hash/reload, two tabs, no-JS fallbacks, genuine 404.
 console.log('keyboard');await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Vai al contenuto'})).toBeFocused();await page.keyboard.press('Enter');
 await page.locator('#course-hero').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');await expect(page.locator('.interest-panel .interest-link')).toBeFocused();
 const faq=page.locator('.faq details').nth(2);await faq.locator('summary').focus();const wasOpen=await faq.getAttribute('open');await page.keyboard.press('Enter');expect(await faq.getAttribute('open')).not.toBe(wasOpen);
 console.log('deep link');await page.goto('/#onde-ottica-radiazioni');await expect(page.locator('#course-hero')).toHaveValue('onde-ottica-radiazioni');await page.reload();await expect(page.locator('#course-hero')).toHaveValue('onde-ottica-radiazioni');
 const other=await context.newPage();await other.goto('/');await expect(other.locator('#course-hero')).toHaveValue('strumenti-meccanica');await other.close();
 console.log('local assets');const assets=await page.locator('link[rel="stylesheet"],script[src],img').evaluateAll(es=>es.map(e=>e.href||e.src));for(const u of assets){const response=await context.request.get(u);expect(response.status()).toBe(200);}
 for(const anchor of await page.locator('a[href^="#"]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))))expect(await page.locator(anchor).count()).toBeGreaterThan(0);
 await page.screenshot({path:path.join(output,'course-deep-link-1440.png')});
 console.log('nojs');const nojs=await browser.newContext({baseURL:origin,javaScriptEnabled:false});const fallback=await nojs.newPage();await fallback.goto('/');await expect(fallback.locator('[data-course]')).toHaveCount(4);expect(await fallback.locator('[data-course]').first().getAttribute('href')).toContain('wa.me');await fallback.getByText('Date, durata e costi?',{exact:false}).click();await expect(fallback.getByText('Calendario, durata, formato, numero di partecipanti ed eventuali costi sono ancora da definire.',{exact:false})).toBeVisible();await nojs.close();
 console.log('404');const healthyErrors=[...errors];expect(healthyErrors).toEqual([]);const response=await page.goto('/pagina-inesistente/');expect(response.status()).toBe(404);await expect(page.getByRole('heading',{name:'Questo percorso non c’è.'})).toBeVisible();await page.getByRole('link',{name:'Torna ai microcorsi di Fisica'}).click();await expect(page).toHaveTitle(/Ardesia/);
 checks.push({keyboard:'PASS',deepLinkReload:'PASS',separateTab:'PASS',localLinks:'PASS',noJavaScript:'PASS',notFound404:'PASS',pageErrorsBeforeDeliberate404:healthyErrors,expected404ConsoleErrors:errors.filter(e=>e.includes('404'))});
 await writeFile(path.join(output,'browser-results.json'),JSON.stringify({status:'PASS',checks,contactTesting:'Browser activates all 4 wa.me URLs at all widths; external response intercepted, no message sent.'},null,2));console.log(JSON.stringify({status:'PASS',checks}));
}finally{clearTimeout(watchdog);await browser?.close();server.kill('SIGTERM');}
