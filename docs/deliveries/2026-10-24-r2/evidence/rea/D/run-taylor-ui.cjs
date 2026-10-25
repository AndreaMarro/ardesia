// Scoped dev-runtime observation: real UI + canonical HTTP, synthetic student-02.
// No route mocking, auth trace, storageState, token/body logging, submission or deploy.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const repo = '/private/tmp/ardesia-r2-20261024';
const {chromium} = require(path.join(repo, 'node_modules/playwright-core'));
const origin = 'http://127.0.0.1:5440';
const access = JSON.parse(fs.readFileSync('/private/tmp/ardesia-r2-runtime-20261024/demo-access.json', 'utf8'));
assert.equal(access.synthetic, true);
const secrets = Object.values(access.tokens);
const redact = value => secrets.reduce((text, secret) => text.replaceAll(secret, '[REDACTED]'), String(value));
const runName = process.env.R2_TAYLOR_RUN || 'product-ui'; assert.ok(/^product-ui(?:-run[0-9]+)?$/.test(runName));
const root = path.resolve(__dirname, runName);
assert.ok(!fs.existsSync(root), 'Fresh evidence output required'); fs.mkdirSync(root, {mode:0o700});
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const files = ['apps/web/src/components/TaylorLab.tsx','apps/web/src/components/TaylorPlot.tsx','apps/web/src/components/TaylorPlot.css','packages/engine/lessonos/study/taylor.py'];
const sourceFiles = Object.fromEntries(files.map(file => [file, digest(fs.readFileSync(path.join(repo,file)))]));
const report = {schema:'ardesia.r2-taylor-ui.v1', scope:'Development runtime; real canonical HTTP, synthetic student-02 only. Not final artifact, remote beta, human scientific approval or course submission.', origin, sourceHead:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(), sourceFiles, node:process.version, checks:[], evaluations:[], viewport:[], errors:[], console:[], failedRequests:[], screenshots:[]};
function check(name, value, detail) {report.checks.push({name,pass:Boolean(value),...(detail?{detail}: {})});assert.ok(value,name);}
let browser, page, evaluations=0, phase='login-prelude';
async function compare(degree) {
 const waiting=page.waitForResponse(r=>new URL(r.url()).pathname==='/study/activities/evaluate' && r.request().method()==='POST');
 await page.getByRole('button',{name:'Registra la previsione e confronta',exact:true}).click();
 const response=await waiting; assert.equal(response.status(),200);
 const body=await response.json(); const request=response.request().postDataJSON();
 assert.deepEqual(request,{activityId:'taylor-exp-v1',parameters:{x:.5,degree}});
 check('Core degree '+degree+' has 41 bounded samples',body.degree===degree&&body.plot.samples.length===41&&body.plot.samples.every(p=>Object.values(p).every(Number.isFinite)));
 await page.getByRole('img',{name:new RegExp('Curva di exp e polinomio di grado '+degree+' ')}).waitFor();
 const d=await page.locator('[data-series="polynomial"]').getAttribute('d');
 check('SVG degree '+degree+' uses 41 canonical points',(d.match(/[ML]/g)||[]).length===41);
 report.evaluations.push({parameters:request.parameters,result:{value:body.value,remainderBound:body.remainderBound,referenceValue:body.referenceValue,absoluteError:body.absoluteError,terms:body.terms},sampleCount:body.plot.samples.length,responseSha256:digest(Buffer.from(JSON.stringify(body))),pathSha256:digest(Buffer.from(d))});
 return d;
}
(async()=>{
 browser=await chromium.launch({headless:true,executablePath:'/Users/andreamarro/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'it-IT',reducedMotion:'reduce'});
 page=await context.newPage();page.setDefaultTimeout(20000);
 page.on('pageerror',e=>report.errors.push({phase,message:redact(e.message)}));
 page.on('console',m=>{if(['error','warning'].includes(m.type()))report.console.push({phase,type:m.type(),text:redact(m.text())});});
 page.on('requestfailed',r=>report.failedRequests.push({phase,url:redact(r.url()),error:r.failure()?.errorText}));
 page.on('request',r=>{if(new URL(r.url()).pathname==='/study/activities/evaluate'&&r.method()==='POST')evaluations++;});
 await page.goto(origin+'/?edition=analisi&view=classroom');
 await page.getByRole('button',{name:'Accedi al tuo spazio',exact:true}).click();
 await page.getByLabel('Codice di accesso sintetico',{exact:true}).fill(access.tokens['student-02']);
 const sessionReply=page.waitForResponse(r=>new URL(r.url()).pathname==='/study/session'&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Accedi',exact:true}).click(); assert.equal((await sessionReply).status(),200);
 // Login intentionally navigates to Today; opening the explicit classroom is a separate UI navigation.
 await page.goto(origin+'/?edition=analisi&view=classroom');
 await page.getByRole('heading',{name:'Quanto basta per approssimare?',exact:true}).waitFor();
 phase='taylor';
 const identity=await (await context.request.get(origin+'/study/me')).json();
 check('UI login uses authorized synthetic student-02',identity.id==='student-02'&&identity.synthetic===true);
 const health=await (await context.request.get(origin+'/study/health')).json();
 report.runtime={synthetic:health.synthetic,persistence:health.persistence,dataId:health.dataId};
 check('no automatic evaluation before prediction',evaluations===0&&await page.getByRole('button',{name:'Registra la previsione e confronta',exact:true}).isDisabled());
 check('no schematic curve before comparison',await page.locator('.taylor-lab svg').count()===0);
 await page.getByLabel('La tua previsione e il controllo del resto',{exact:true}).fill('Prevedo che aumentando il grado la curva si avvicini a exp. Distinguo lo scarto numerico dal maggiorante del resto; il grafico non dimostra il limite. '.repeat(4));
 await page.getByLabel('Grado del polinomio',{exact:true}).fill('0');
 const d0=await compare(0);
 await page.getByLabel('Grado del polinomio',{exact:true}).fill('3');
 check('degree edit clears the graph and does not call automatically',await page.locator('.taylor-lab svg').count()===0&&evaluations===1);
 const d3=await compare(3);check('degree 0 and 3 have distinct returned geometry',d0!==d3);
 await page.getByLabel('Grado del polinomio',{exact:true}).fill('7');
 const next=page.getByRole('button',{name:'Grado successivo',exact:true});await next.focus();await page.keyboard.press('Enter');
 check('native keyboard changes one degree without an API call',await page.getByLabel('Grado del polinomio',{exact:true}).inputValue()==='8'&&evaluations===2);
 const d8=await compare(8);check('degree 3 and 8 have distinct returned geometry',d3!==d8);
 for(const width of [360,390,820,1440]){
  await page.setViewportSize({width,height:width<500?844:1000});await page.evaluate(()=>document.fonts.ready);
  await page.locator('.taylor-lab').scrollIntoViewIfNeeded();
  const metrics=await page.locator('.taylor-lab').evaluate(el=>({overflow:document.documentElement.scrollWidth>innerWidth,graphWidth:el.querySelector('svg').getBoundingClientRect().width,labWidth:el.getBoundingClientRect().width,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,animations:el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length}));
  report.viewport.push({width,...metrics});check('Taylor responsive '+width,!metrics.overflow&&metrics.graphWidth<=width&&metrics.reducedMotion&&metrics.animations===0);
  if([360,1440].includes(width)){const name='taylor-'+width+'.png';await page.locator('.taylor-lab').screenshot({path:path.join(root,name)});report.screenshots.push({name,sha256:digest(fs.readFileSync(path.join(root,name)))});}
 }
 await page.getByLabel('Argomento x',{exact:true}).fill('2');
 check('out-of-domain x clears result and disables comparison',await page.locator('.taylor-lab svg').count()===0&&await page.getByRole('button',{name:'Registra la previsione e confronta',exact:true}).isDisabled());
 await page.getByLabel('Argomento x',{exact:true}).press('Enter');
 await page.getByLabel('Argomento x',{exact:true}).fill('.5');await page.getByLabel('Grado del polinomio',{exact:true}).fill('1.5');
 check('fractional degree is rejected without a fourth request',await page.getByRole('button',{name:'Registra la previsione e confronta',exact:true}).isDisabled()&&evaluations===3);
 await page.getByText('Ipotesi e limiti del banco',{exact:true}).click();
 check('no scientific approval inferred',(await page.locator('.taylor-lab').innerText()).includes('Revisione scientifica umana: da eseguire'));
 check('no Taylor page errors',report.errors.filter(e=>e.phase==='taylor').length===0);check('no Taylor console errors or warnings',report.console.filter(e=>e.phase==='taylor').length===0);
 for(const [file,sha] of Object.entries(sourceFiles))check('source unchanged '+file,digest(fs.readFileSync(path.join(repo,file)))===sha);
 report.status='PASS';
})().catch(error=>{report.status='FAIL';report.failure=redact(error.message);process.exitCode=1;}).finally(async()=>{report.evaluationRequests=evaluations;fs.writeFileSync(path.join(root,'result.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});if(browser)await browser.close();console.log(JSON.stringify({status:report.status,checks:report.checks.length,failed:report.checks.filter(c=>!c.pass).map(c=>c.name),failure:report.failure,output:root}));});
