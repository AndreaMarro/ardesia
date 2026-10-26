import { chromium, expect as baseExpect } from '../node_modules/@playwright/test/index.mjs';
import { createAndVerifyExactNote } from './exact-note.mjs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const qa=fileURLToPath(new URL('./',import.meta.url));const access=JSON.parse(await fs.readFile(qa+'data/demo-access.json','utf8'));
const expect=baseExpect.configure({timeout:10000});const browser=await chromium.launch({headless:true,timeout:20000});
const report={source:'b6cba73dfec35a243da3e4c322ba58546b1ca3fb',shellSource:'3326ac2e30624248c01b67f2ac876671e5ed3886',privateRootProposal:true,checks:[],errors:[],browser:browser.version()};
const start=performance.now();
function pass(name){report.checks.push(name);console.log('PASS '+name);}
try{
 const c=await browser.newContext({baseURL:'http://127.0.0.1:5420',viewport:{width:820,height:900},reducedMotion:'reduce'});
 expect((await c.request.post('/study/session',{data:{token:access.tokens['student-01']}})).status()).toBe(200);
 const p=await c.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>report.errors.push(e.message));
 await p.goto('/?view=today&edition=fluidi');const nav=p.getByRole('navigation',{name:'Navigazione principale'});
 await nav.getByRole('button',{name:'Memoria delle idee',exact:true}).click();
 const title='S02 · confronto esatto per ID · '+crypto.randomUUID().slice(0,8);const text='Fixture sintetica S02.\nΔp < 10 kPa · nessuna valutazione.';
 report.noteId=await createAndVerifyExactNote(p,c,expect,title,text);
 pass('POST ID, GET by same ID, title/text exact equality and raw detail text after reload');
 await nav.getByRole('button',{name:'Oggi',exact:true}).click();await nav.getByRole('button',{name:'Memoria delle idee',exact:true}).click();
 await p.getByRole('button',{name:/Esci dall’account/}).click();await expect(nav).toHaveCount(0);
 await p.goBack();await p.goBack();await expect(p).toHaveURL(/view=memory/);
 await expect(nav).toHaveCount(0);expect(await p.locator('body').textContent()).not.toContain(text);
 pass('logout then native Back to old memory URL does not restore private UI');
 expect((await c.request.get('/study/memory/notes/'+encodeURIComponent(report.noteId))).status()).toBe(401);
 expect(report.errors).toEqual([]);pass('same note returns 401 without cookie and page has no runtime errors');report.status='PASS';
}catch(e){report.status='FAIL';report.failure=String(e.stack??e);throw e;}
finally{report.totalMs=performance.now()-start;await fs.writeFile(qa+'exact-session-result.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,totalMs:report.totalMs}));}
