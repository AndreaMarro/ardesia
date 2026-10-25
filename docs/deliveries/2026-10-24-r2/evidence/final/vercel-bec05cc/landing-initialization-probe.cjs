/* Controlled readiness counterproof; no product edits or auth trace. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const {chromium,request}=createRequire('/private/tmp/ardesia-r2-20261024/package.json')('playwright');
const HOST='ardesia-fisica-preview-e5yvz04xd-andreas-projects-6d4e9791.vercel.app',ORIGIN='https://'+HOST;
const SCRIPT='/assets/site.084d55bb702f.js';
const BROWSER='/Users/andreamarro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const report={startedAtUTC:new Date().toISOString(),host:HOST,controlledResourcePath:SCRIPT,productSourceUnchanged:true,
  protectionSettingsUnchanged:true,cookiesPersisted:false,authTraceRecorded:false,checks:[]};
let browser,context,api,release,phase='anonymous-protection';
(async()=>{
 api=await request.newContext();const anonymous=await api.get(ORIGIN+'/',{maxRedirects:0});report.anonymousRootStatus=anonymous.status();await api.dispose();api=null;
 phase='temporary-shared-access';browser=await chromium.launch({headless:true,executablePath:BROWSER});context=await browser.newContext({viewport:{width:390,height:1000},locale:'it-IT',reducedMotion:'reduce'});const page=await context.newPage();
 const access=JSON.parse(fs.readFileSync('/private/tmp/ardesia-r2-vercel-access.json','utf8'));const url=new URL(access.url);if(url.protocol!=='https:'||url.hostname!==HOST)throw new Error('UnexpectedAccessDestination');
 await page.goto(url.href,{waitUntil:'load'});if(!(await page.title()).includes('Ardesia'))throw new Error('ProtectedProductUnavailable');
 phase='controlled-loader';await page.goto(ORIGIN+'/esperienza/?percorso=fluidi-termodinamica',{waitUntil:'load'});
 let held=false;const gate=new Promise(resolve=>{release=resolve;});
 await page.route(ORIGIN+SCRIPT,async route=>{held=true;await gate;await route.continue();});
 const scriptResponse=page.waitForResponse(response=>response.url()===ORIGIN+SCRIPT);
 const cta=page.getByRole('link',{name:'Chiedi disponibilità',exact:true});
 await cta.press('Enter',{noWaitAfter:true});
 await page.waitForURL(u=>u.pathname==='/'&&u.hash==='#contatto'&&u.searchParams.get('percorso')==='fluidi-termodinamica',{waitUntil:'commit'});
 await page.locator('input[name="course"]:checked').waitFor({state:'attached'});
 report.pending={resourceHeld:held,readyState:await page.evaluate(()=>document.readyState),selectedCourse:await page.locator('input[name="course"]:checked').inputValue(),correctCourseMessage:new URL(await page.locator('#contatto .interest-link').getAttribute('href')).searchParams.get('text').includes('Fluidi e termodinamica')};
 release();await page.waitForLoadState('load');
 report.settled={readyState:await page.evaluate(()=>document.readyState),selectedCourse:await page.locator('input[name="course"]:checked').inputValue(),correctCourseMessage:new URL(await page.locator('#contatto .interest-link').getAttribute('href')).searchParams.get('text').includes('Fluidi e termodinamica')};
 const response=await scriptResponse;const body=await response.body();report.releasedResource={status:response.status(),sha256:crypto.createHash('sha256').update(body).digest('hex'),bytes:body.length};
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'../vercel-upload-inventory.json'),'utf8')).find(item=>'/'+item.path===SCRIPT);
 report.checks=[{name:'pending-loader-reproduces-default-other-course',pass:held&&report.pending.selectedCourse==='strumenti-meccanica'&&!report.pending.correctCourseMessage},
 {name:'real-script-unmodified',pass:report.releasedResource.status===200&&report.releasedResource.sha256===expected.sha256},
 {name:'only-releasing-script-restores-correct-course',pass:report.settled.readyState==='complete'&&report.settled.selectedCourse==='fluidi-termodinamica'&&report.settled.correctCourseMessage},
 {name:'anonymous-root-remains-protected',pass:[401,403,302,307].includes(report.anonymousRootStatus)}];
 report.pass=report.checks.every(c=>c.pass);
})().catch(error=>{report.error={phase,errorType:error.name};report.pass=false;}).finally(async()=>{
 if(release)release();if(api)await api.dispose().catch(()=>{});if(context)await context.close().catch(()=>{});if(browser)await browser.close().catch(()=>{});
 report.finishedAtUTC=new Date().toISOString();fs.writeFileSync(path.join(__dirname,'landing-initialization-probe.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({phase,pass:report.pass,pending:report.pending,settled:report.settled,anonymousRootStatus:report.anonymousRootStatus,error:report.error||null},null,2));
});
