/* Remote browser proof. Access URL is read only into memory; no cookies, HAR,
 * traces, raw errors, headers with auth, or query-bearing URLs are persisted. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {createRequire} = require('node:module');
const requireRepo = createRequire('/private/tmp/ardesia-r2-20261024/package.json');
const {chromium} = requireRepo('playwright');
const OUT = __dirname;
const ROOT = '/private/tmp/ardesia-r2-public-bec05cc/public';
const INVENTORY = path.resolve(OUT, '../vercel-upload-inventory.json');
const ACCESS = '/private/tmp/ardesia-r2-vercel-access.json';
const CODE = 'bec05cc8172393b153b7d8ea56ae48f1afa95ef0';
const SOURCE = '726ef9e268e151d7d8f37b1addf84a60490c8074d339185c9853882834aab179';
const HOST = 'ardesia-fisica-preview-e5yvz04xd-andreas-projects-6d4e9791.vercel.app';
const ORIGIN = 'https://' + HOST;
const BROWSER = '/Users/andreamarro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const report = {startedAtUTC: new Date().toISOString(), sourceCode: CODE, sourceTreeSha256: SOURCE,
  host: HOST, originProtocol: 'https:', access: {temporarySharedAccess: true, capturedAuthTrace: false,
  persistedCookies: false, changedProtectionSettings: false}, observations: [], assets: [], routes: [], journeys: [],
  consoleErrorCount: 0, pageErrorCount: 0, failedRequestCount: 0, failedRequests: [], nonProductRequestHosts: [],
  warnings: [], launchAllowed: false, humanScientificApproval: 'NOT_ATTESTED'};
let phase = 'launch', browser, context, recordProductEvents = false;
function write(name, data) { fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n'); }
function check(journey, name, condition) { journey.checks.push({name, pass: !!condition}); }
function headers(response) { const h = response.headers(); return {contentSecurityPolicy: h['content-security-policy'] || null,
  cacheControl: h['cache-control'] || null, robots: h['x-robots-tag'] || null, contentType: h['content-type'] || null}; }
function safePath(value) { try {const u = new URL(value); return {host:u.hostname,path:u.pathname};} catch {return {host:null,path:null};} }
(async () => {
  browser = await chromium.launch({headless: true, executablePath: BROWSER});
  report.browserVersion = browser.version();
  context = await browser.newContext({viewport: {width: 1440,height: 1000}, locale:'it-IT', reducedMotion:'reduce'});
  const page = await context.newPage();
  page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(30000);
  phase = 'temporary-shared-access';
  const privateAccess = JSON.parse(fs.readFileSync(ACCESS, 'utf8'));
  const accessUrl = new URL(privateAccess.url);
  if (accessUrl.protocol !== 'https:' || accessUrl.hostname !== HOST) throw new Error('UnexpectedAccessDestination');
  const first = await page.goto(accessUrl.href, {waitUntil:'domcontentloaded'});
  report.access.finalStatus = first ? first.status() : null;
  const genuine = await page.locator('h1').count() === 1 && (await page.title()).includes('Ardesia');
  report.access.productReached = genuine;
  if (!genuine) { report.blocked = {phase, ...safePath(page.url()), status:report.access.finalStatus}; return; }
  await page.waitForLoadState('load');
  recordProductEvents = true;
  page.on('console', e => {if (recordProductEvents && e.type() === 'error') report.consoleErrorCount++;});
  page.on('pageerror', () => {if(recordProductEvents) report.pageErrorCount++;});
  page.on('requestfailed', request => {if(recordProductEvents) {report.failedRequestCount++;const u=safePath(request.url());report.failedRequests.push({host:u.host,path:u.path,resourceType:request.resourceType(),failureCode:['net::ERR_ABORTED','net::ERR_FAILED','net::ERR_CONNECTION_RESET'].includes(request.failure()?.errorText)?request.failure().errorText:'OTHER_ERROR'});}});
  page.on('request', r => { if (!recordProductEvents) return; const safe=safePath(r.url());
    if (safe.host && safe.host !== HOST && !report.nonProductRequestHosts.includes(safe.host)) report.nonProductRequestHosts.push(safe.host); });
  phase = 'asset-hashes';
  const inventory = JSON.parse(fs.readFileSync(INVENTORY,'utf8'));
  for (const item of inventory) {
    const local = fs.readFileSync(path.join(ROOT,item.path));
    const response = await context.request.get(ORIGIN + '/' + item.path, {timeout:20000});
    const body = await response.body();
    report.assets.push({path:item.path,status:response.status(),bytes:body.length,sha256:sha(body),expectedSha256:item.sha256,
      localMatchesInventory:sha(local) === item.sha256,remoteMatchesInventory:sha(body) === item.sha256});
  }
  phase = 'public-headers-and-routes';
  for (const route of ['/','/esperienza/','/study/session','/study/me','/studio/','/beta/','/esperienza/study/session','/esperienza/unknown-page']) {
    const response = await context.request.get(ORIGIN+route,{timeout:20000});
    report.routes.push({path:route,status:response.status(),headers:headers(response)});
  }
  phase = 'native-public-journeys';
  for (const width of [360,390,820,1440]) {
    const journey={viewport:[width,1000],reducedMotion:'reduce',checks:[]}; report.journeys.push(journey);
    await page.setViewportSize({width,height:1000});
    await page.goto(ORIGIN+'/',{waitUntil:'load'});
    check(journey,'landing-https',new URL(page.url()).protocol==='https:');
    check(journey,'landing-noindex',(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'));
    await page.locator('#scegli-percorso a').filter({hasText:'Fluidi e termodinamica'}).click();
    check(journey,'course-selected-before-experience',new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica');
    await page.locator('#fluidi-termodinamica .experience-teaser').click();
    await page.waitForLoadState('load');
    check(journey,'experience-route',new URL(page.url()).pathname==='/esperienza/' && new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica');
    await page.getByRole('button',{name:'Pressione e profondità',exact:true}).press('Enter');
    const prediction=page.getByRole('textbox',{name:'Pressione prevista in Pa',exact:true});
    const submit=page.getByRole('button',{name:'Confronta la pressione',exact:true});
    const result=page.getByTestId('hydrostatic-result');
    const graph=page.getByTestId('hydrostatic-graph');
    check(journey,'initial-hidden-result-and-graph',await result.count()===0 && await graph.count()===0);
    await prediction.fill('1e309');check(journey,'non-finite-blocked',await submit.isDisabled());
    await prediction.fill('0');await submit.press('Enter');
    check(journey,'wrong-prediction-retained',await prediction.inputValue()==='0' && await result.innerText()==='19.620 Pa' && await page.getByText(/La previsione differisce/).isVisible());
    const slider=page.getByRole('slider',{name:'Profondità della sonda',exact:true});
    await slider.press('Home'); check(journey,'native-home-clears-solution',await slider.inputValue()==='0' && await result.count()===0);
    await prediction.fill('0');await submit.press('Enter'); check(journey,'surface-gauge-zero',await result.innerText()==='0 Pa');
    await page.getByRole('combobox',{name:'Riferimento della pressione',exact:true}).selectOption('absolute');
    check(journey,'reference-change-clears-result',await result.count()===0 && await prediction.inputValue()==='');
    await prediction.fill('101325');await submit.press('Enter');check(journey,'absolute-surface-101325',await result.innerText()==='101.325 Pa');
    for(let i=0;i<4;i++) await slider.press('ArrowRight');
    await page.getByRole('combobox',{name:'Riferimento della pressione',exact:true}).selectOption('gauge');
    await prediction.fill('19620');await submit.press('Enter');
    await page.getByRole('button',{name:'Un indizio sul riferimento',exact:true}).press('Enter');
    check(journey,'first-hint-partial',await page.getByText(/Qual è lo zero\?/).isVisible() && await page.getByText(/Il contributo della profondità è/).count()===0);
    await page.getByRole('button',{name:'Un altro indizio',exact:true}).press('Enter');
    const lastHint=page.getByRole('button',{name:'Un altro indizio',exact:true});
    check(journey,'second-hint-and-focus',await page.getByText(/Il contributo della profondità è/).isVisible() && await lastHint.evaluate(e=>e===document.activeElement && !e.disabled && e.getAttribute('aria-disabled')==='true'));
    const next=page.getByRole('button',{name:'Cambia fluido: una nuova prova',exact:true});
    await next.press('Enter');
    check(journey,'new-problem1-focus-and-hidden',await prediction.evaluate(e=>e===document.activeElement && e.value==='') && await result.count()===0);
    check(journey,'new-problem1-800-3-gauge',await slider.inputValue()==='3' && await page.getByRole('combobox',{name:'Densità del liquido',exact:true}).inputValue()==='800' && await page.getByRole('combobox',{name:'Riferimento della pressione',exact:true}).inputValue()==='gauge');
    await prediction.fill('23544');await submit.press('Enter');check(journey,'new-problem1-23544',await result.innerText()==='23.544 Pa');
    await next.press('Enter');
    check(journey,'new-problem2-focus-and-hidden',await prediction.evaluate(e=>e===document.activeElement && e.value==='') && await result.count()===0);
    check(journey,'new-problem2-1000-1.5-absolute',await slider.inputValue()==='1.5' && await page.getByRole('combobox',{name:'Densità del liquido',exact:true}).inputValue()==='1000' && await page.getByRole('combobox',{name:'Riferimento della pressione',exact:true}).inputValue()==='absolute');
    await prediction.fill('116040');await submit.press('Enter');check(journey,'new-problem2-116040',await result.innerText()==='116.040 Pa');
    journey.layout=await page.locator('.hydrostatic-model svg').evaluateAll(elements=>elements.map(svg=>({width:svg.getBoundingClientRect().width,
      labels:[...svg.querySelectorAll('text')].map(t=>({fontCSS:parseFloat(getComputedStyle(t).fontSize),inside:t.getBoundingClientRect().left>=svg.getBoundingClientRect().left&&t.getBoundingClientRect().right<=svg.getBoundingClientRect().right}))})));
    check(journey,'all-svg-labels-inside',journey.layout.every(svg=>svg.labels.every(t=>t.inside)));
    check(journey,'no-horizontal-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check(journey,'no-hydro-motion',await page.locator('.hydrostatic-model').evaluate(e=>e.getAnimations({subtree:true}).length===0));
    await page.screenshot({path:path.join(OUT,'remote-hydro-'+width+'.png'),fullPage:true});
    const cta=page.getByRole('link',{name:'Chiedi disponibilità',exact:true});
    const href=new URL(await cta.getAttribute('href'),ORIGIN);
    check(journey,'cta-preserves-course',href.origin===ORIGIN && href.pathname==='/' && href.hash==='#contatto' && href.searchParams.get('percorso')==='fluidi-termodinamica');
    await Promise.all([page.waitForURL(u=>u.pathname==='/' && u.hash==='#contatto' && u.searchParams.get('percorso')==='fluidi-termodinamica'),cta.press('Enter')]);
    journey.immediateLanding={readyState:await page.evaluate(()=>document.readyState),selectedCourse:await page.locator('input[name="course"]:checked').inputValue()};
    await page.waitForLoadState('load');
    journey.settledLanding={readyState:await page.evaluate(()=>document.readyState),selectedCourse:await page.locator('input[name="course"]:checked').inputValue()};
    check(journey,'contact-course-selected',await page.locator('input[name="course"]:checked').inputValue()==='fluidi-termodinamica');
    const interest=page.locator('#contatto .interest-link'); const interestUrl=new URL(await interest.getAttribute('href'));
    check(journey,'interest-link-same-course-not-sent',interestUrl.hostname==='wa.me' && (interestUrl.searchParams.get('text')||'').includes('Fluidi e termodinamica'));
    journey.contact={host:new URL(page.url()).hostname,path:new URL(page.url()).pathname,coursePreserved:journey.settledLanding.selectedCourse==='fluidi-termodinamica',externalContactOpened:false};
    journey.pass=journey.checks.every(c=>c.pass);
  }
  report.assetCount=report.assets.length;
  report.all20AssetBytesMatch=report.assets.length===20&&report.assets.every(a=>a.status===200&&a.localMatchesInventory&&a.remoteMatchesInventory);
  report.journeyChecks=report.journeys.reduce((n,j)=>n+j.checks.length,0);
  report.journeysPass=report.journeys.length===4&&report.journeys.every(j=>j.pass);
  report.privatePaths404=report.routes.filter(r=>!['/','/esperienza/'].includes(r.path)).every(r=>r.status===404);
  report.publicCspCorrect=report.routes.filter(r=>['/','/esperienza/'].includes(r.path)).every(r=>r.status===200&&r.headers.contentSecurityPolicy);
  report.pass=report.all20AssetBytesMatch&&report.journeysPass&&report.privatePaths404&&report.publicCspCorrect&&report.failedRequestCount===0&&report.consoleErrorCount===0&&report.pageErrorCount===0;
})().catch(error=>{report.error={phase,errorType:error.name||'Error'};report.pass=false;})
.finally(async()=>{
  recordProductEvents=false; report.finishedAtUTC=new Date().toISOString();
  if(context)await context.close().catch(()=>{});if(browser)await browser.close().catch(()=>{});
  write('remote-report.json',report);
  console.log(JSON.stringify({phase,pass:report.pass||false,blocked:!!report.blocked,assetCount:report.assets.length,
    assetMismatches:report.assets.filter(a=>!a.remoteMatchesInventory).map(a=>({path:a.path,status:a.status})),journeys:report.journeys.length,
    failedChecks:report.journeys.flatMap(j=>j.checks.filter(c=>!c.pass).map(c=>({viewport:j.viewport[0],name:c.name}))),error:report.error||null},null,2));
});
