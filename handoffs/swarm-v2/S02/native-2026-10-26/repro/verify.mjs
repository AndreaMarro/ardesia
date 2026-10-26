import { chromium, expect as baseExpect } from '../node_modules/@playwright/test/index.mjs';
import fs from 'node:fs/promises';
import { createAndVerifyExactNote } from './exact-note.mjs';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const qa=fileURLToPath(new URL('./',import.meta.url));
const origin='http://127.0.0.1:5420';
const access=JSON.parse(await fs.readFile(qa+'data/demo-access.json','utf8'));
const expect=baseExpect.configure({timeout:10000});
const browser=await chromium.launch({headless:true,timeout:20000,args:['--remote-debugging-address=127.0.0.1','--remote-debugging-port=5422']});
const report={source:'b6cba73dfec35a243da3e4c322ba58546b1ca3fb',shellSource:'3326ac2e30624248c01b67f2ac876671e5ed3886',privateRootPatch:'S05 enabledViews prop + proposed navigate pushState; private QA only',browser:browser.version(),checks:[],errors:[],screenshots:[]};
const started=performance.now();let page;
function pass(name){report.checks.push(name);console.log('PASS '+name);}
async function context(alias,viewport={width:1440,height:1000}){
 const c=await browser.newContext({baseURL:origin,viewport,hasTouch:true,reducedMotion:'reduce'});
 const r=await c.request.post('/study/session',{data:{token:access.tokens[alias]}});expect(r.status()).toBe(200);
 return c;
}
function observe(p){p.setDefaultTimeout(10000);p.on('pageerror',e=>report.errors.push('pageerror: '+e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))report.errors.push(m.type()+': '+m.text());});}
async function screenshot(name){await page.screenshot({path:qa+name,fullPage:true});report.screenshots.push(name);}
try{
 const c=await context('student-01');page=await c.newPage();observe(page);
 await page.goto('/?view=today&edition=fluidi',{waitUntil:'domcontentloaded'});
 const nav=page.getByRole('navigation',{name:'Navigazione principale'});
 await expect(nav.getByRole('button',{name:'Memoria delle idee',exact:true})).toBeVisible();
 await expect(nav.getByRole('button',{name:'Studio autonomo',exact:true})).toHaveCount(0);
 await nav.getByRole('button',{name:'Memoria delle idee',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
 await expect(page).toHaveURL(/view=memory/);pass('real S05 memory entered from mounted Shell nav; unmounted independent-study stays hidden');
 const title='S02 · dalla shell alla memoria · history guard';const note='Fixture sintetica S02: ritrovo questa idea dalla navigazione, dalla ricerca e dopo il reload.';
 report.noteId=await createAndVerifyExactNote(page,c,expect,title,note);
 pass('real Core note save, exact content retrieved and memory URL/context preserved by reload');
 await page.keyboard.press('Control+k');await page.getByRole('searchbox',{name:'Cerca una destinazione'}).fill('oggi');
 await page.getByRole('searchbox').press('ArrowDown');await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/view=today/);await expect(page.locator('#content')).toBeFocused();
 await page.goBack();await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
 await page.goForward();await expect(page).toHaveURL(/view=today/);pass('command selection focuses main; native back/forward restores real memory route');
 for(const width of [1440,820,390]){
  await page.setViewportSize({width,height:900});
  await page.keyboard.press('Control+k');const input=page.getByRole('searchbox',{name:'Cerca una destinazione'});
  await expect(input).toBeFocused();await input.fill('memoria');await input.press('ArrowDown');
  await expect(page.getByRole('dialog').getByRole('button',{name:/Memoria delle idee/})).toBeFocused();
  await screenshot('command-'+width+'.png');await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
  await expect(page.locator('#content')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  if(width===390){const entries=await page.evaluate(()=>history.length);await nav.getByRole('button',{name:'Memoria delle idee',exact:true}).tap();expect(await page.evaluate(()=>history.length)).toBe(entries);pass('selecting the active route does not add duplicate history entries');}
  await screenshot('memory-'+width+'.png');pass('real nav/search, focus, emulated touch and no document overflow at '+width+'px');
 }
 const noCourse=await context('student-03',{width:390,height:844});const nc=await noCourse.newPage();observe(nc);
 await nc.goto('/?view=memory',{waitUntil:'domcontentloaded'});
 await expect(nc.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
 await expect(nc.getByRole('combobox',{name:'Edizione corrente'})).toHaveCount(0);
 await expect(nc.getByRole('navigation',{name:'Navigazione principale'}).getByRole('button',{name:'Memoria delle idee',exact:true})).toBeVisible();
 pass('student without an edition reaches memory before course gate through real Root');await noCourse.close();
 const tutor=await context('tutor-synthetic');const tp=await tutor.newPage();observe(tp);
 await tp.goto('/?view=memory',{waitUntil:'domcontentloaded'});
 await expect(tp.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
 await expect(tp.getByRole('navigation',{name:'Navigazione principale'}).getByRole('button',{name:'Memoria delle idee',exact:true})).toBeVisible();
 pass('teacher gets the same mounted memory destination');await tutor.close();
 for(const viewport of [{width:1440,height:900},{width:820,height:900},{width:390,height:844},{width:390,height:320}]){
  await page.setViewportSize(viewport);await page.goto('/s02-native.html',{waitUntil:'domcontentloaded'});
  await page.keyboard.press('Control+k');const input=page.getByRole('searchbox');await input.fill('memoria');await input.press('ArrowDown');
  const dialog=page.getByRole('dialog');await expect(dialog.getByRole('button',{name:/Memoria delle idee/})).toBeFocused();
  await page.keyboard.press('F8');await expect(dialog.getByRole('button',{name:/Memoria delle idee/})).toHaveCount(0);
  await expect.poll(()=>dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(page.getByRole('button',{name:/Cerca nello spazio/})).toBeFocused();
  await page.keyboard.press('Control+k');await page.getByRole('searchbox').press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Chiudi ricerca',exact:true})).toBeFocused();
  await page.keyboard.press('Shift+Tab');await expect(page.getByRole('dialog').getByRole('button',{name:/Materiali/})).toBeFocused();
  await page.keyboard.press('ArrowDown');await expect(page.getByRole('dialog').getByRole('button',{name:/Oggi/})).toBeFocused();
  await page.keyboard.press('ArrowUp');await expect(page.getByRole('searchbox')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  pass('isolated real Shell fixture: route removal, containment, Escape return, Tab loop and arrows at '+viewport.width+'x'+viewport.height);
 }
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=memory&edition=fluidi',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'Memoria delle idee.',exact:true})).toBeVisible();
 expect(report.errors).toEqual([]);pass('zero unexpected page/console errors across real consumer and isolated focus fixture');
 report.automaticMs=performance.now()-started;
 console.log('READY_FOR_REA');await fs.writeFile(qa+'ready-for-rea','ready');
 const until=performance.now()+45000;while(!existsSync(qa+'rea.done')&&performance.now()<until)await new Promise(r=>setTimeout(r,250));
 report.reaSignal=existsSync(qa+'rea.done');report.status='PASS';
}catch(error){report.status='FAIL';report.failure=String(error.stack??error);if(page)await page.screenshot({path:qa+'failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{report.totalMs=performance.now()-started;await fs.writeFile(qa+'result.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,automaticMs:report.automaticMs,totalMs:report.totalMs,browser:report.browser}));}
