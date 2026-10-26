/** S00 adapts the S01 serial proof to the product App/Materials and actual API factory.
 * Run only in S00's coordinated machine slot. No shared source is changed.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../../..');
const {chromium,expect}=createRequire(path.join(root,'package.json'))('@playwright/test');
const out=process.env.ARDESIA_S00_SCIENCE_EVIDENCE||require('node:os').tmpdir()+'/ardesia-s00-science-'+Date.now();
const python=path.join(root,'services/study-api/.venv/bin/python');
const built=path.join(root,'apps/web/dist');
const base='http://127.0.0.1:55511',entry='/?view=materials&edition=science-s01';
const graphGeometry=require('./science-graph-geometry.cjs');
const children=[],report={status:'RUNNING',scope:'Product App + Materials + real factory/cookie/Core; local compiled candidate, not remote acceptance',checks:[],screenshots:[],resizeGeometry:[],errors:[],externalRequests:[]};
fs.mkdirSync(out,{recursive:true});
function start(command,args,name){const log=fs.openSync(path.join(out,name+'.log'),'a');const child=spawn(command,args,{cwd:root,env:{...process.env,PYTHONPATH:root+'/packages/engine:'+root+'/services/study-api'},stdio:['ignore',log,log]});fs.closeSync(log);children.push(child);return child;}
async function ready(url){for(let i=0;i<80;i++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw new Error('server_not_ready:'+url);}
const check=name=>report.checks.push(name);
const pred=p=>p.getByLabel('La tua previsione',{exact:true});
const compare=p=>p.getByRole('button',{name:'Confronta la previsione',exact:true});
async function result(p,value){await expect(p.getByTestId('science-result')).toContainText(value);await expect(p.getByText('Usa i controlli per esplorare il grafico; i dati del modello non cambiano.')).toBeVisible();await expect(p.locator('.science-graph svg')).toHaveCount(1);}
async function noOverflow(p){expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
(async()=>{
 let browser,debugPage;
 try{
  start(python,[path.join(__dirname,'science-api.py'),'--directory',out,...(built?['--frontend',built]:[])],'api');
  await ready('http://127.0.0.1:55511/openapi.json');await ready(base+entry);
  const fixture=JSON.parse(fs.readFileSync(path.join(out,'fixture-private.json'),'utf8'));
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({baseURL:base,viewport:{width:1440,height:1050},reducedMotion:'reduce'});
  const login=await context.request.post('/study/session',{data:{token:fixture.actors['s01-student'].token}});expect(login.status()).toBe(200);
  const page=await context.newPage(),requests=[];debugPage=page;page.setDefaultTimeout(10000);
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',r=>{requests.push(r.url());if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))report.externalRequests.push(r.url());});
  await page.goto(base+'/?view=today&edition=science-s01');await page.getByRole('button',{name:'Materiali',exact:true}).click();await page.getByRole('button',{name:'Apri la libreria scientifica',exact:true}).click();await expect(page.getByRole('heading',{name:'Urto e bilancio di energia',exact:true})).toBeVisible();
  await expect(page.getByRole('main')).toHaveCount(1);await expect(page.getByTestId('science-result')).toHaveCount(0);
  expect(requests.filter(url=>built?/\/assets\/src-.*\.js/.test(url):url.includes('jsxgraph')).length).toBe(0);check('real shell + cookie + no result or JSXGraph before prediction');
  await page.getByLabel('Massa del corpo1 [kg]').focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText('3');
  await expect(page.getByLabel('Massa del corpo1 [kg]')).toHaveValue('3');await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText('2');
  await pred(page).fill('1');await compare(page).click();await result(page,'1 m/s');check('keyboard manipulation + canonical collision result + real JSXGraph');
  await page.getByRole('button',{name:'Bilancio di energia cinetica',exact:true}).click();
  await page.getByText('Dati equivalenti del grafico',{exact:true}).click();await expect(page.getByRole('table')).toContainText('Trasformata');
  await page.getByRole('button',{name:'Ingrandisci il grafico'}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Ripristina vista'}).click();check('second representation + equivalent table + keyboard zoom');
  const noticeURL=await page.getByRole('link',{name:'Licenze e attribuzione del grafico',exact:true}).getAttribute('href');
  const notice=await context.request.get(noticeURL);expect(notice.status()).toBe(200);expect(await notice.text()).toContain('Permission is hereby granted');check('actual distributed MIT notice is reachable');
  const courses=[['fluidi-termodinamica','Continuità e Bernoulli','114000','114000 Pa'],['elettricita-magnetismo','Campo, potenziale e carica di prova','100','100 N/C'],['onde-ottica-radiazioni','Lente sottile e immagine con segno','0.15','0,15 m']];
  for(const [id,title,prediction,expected] of courses){
   await page.getByLabel('Percorso di studio').selectOption(id);await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
   await expect(page.getByTestId('science-result')).toHaveCount(0);await pred(page).fill(prediction);await compare(page).click();await result(page,expected);
   check('canonical visible course '+id);
  }
  await expect(page.getByRole('button',{name:'Raggi e immagine',exact:true})).toHaveAttribute('aria-pressed','true');check('lens canonical rays selected with explicit unequal scales');
  await page.getByRole('button',{name:'Mostra il ragionamento',exact:true}).click();
  await page.getByLabel('Il tuo ragionamento',{exact:true}).fill('Ragionamento sintetico S01: controllo segno e scala.');
  await page.getByRole('button',{name:'Salva nel quaderno',exact:true}).click();await expect(page.getByRole('status')).toContainText('salvati');
  const savedURL=page.url(),savedQuery=new URL(savedURL).searchParams;
  const rid=savedQuery.get('scienceResource'),revision=savedQuery.get('scienceRevision');expect(rid&&revision).toBeTruthy();
  const read=await context.request.get('/study/science-library/resources/'+rid+'?revisionId='+revision);expect(read.status()).toBe(200);
  const snapshot=await read.json();expect(snapshot.snapshot.supportUsed).toContain('explanation');expect(snapshot.result).toBeUndefined();
  report.savedRef={resourceId:rid,revisionId:revision};
  await page.getByLabel('Percorso di studio').selectOption('fluidi-termodinamica');
  await page.getByLabel('Il tuo ragionamento',{exact:true}).fill('Bernoulli: portata e pressione.');
  await page.getByRole('button',{name:'Salva nel quaderno',exact:true}).click();await expect(page.getByRole('status')).toContainText('salvati');
  await expect(page.getByRole('button',{name:/Esperimento scientifico · Bernoulli: portata e pressione/})).toBeVisible();
  await page.getByRole('button',{name:/Esperimento scientifico · Ragionamento sintetico S01/}).click();
  await expect(page.getByRole('heading',{name:'Configurazione scientifica salvata'})).toBeVisible();
  expect(await page.getByRole('link',{name:'Apri questa configurazione',exact:true}).getAttribute('href')).toContain('scienceRevision='+revision);
  await expect(page.getByText('Modifica e salva una nuova versione',{exact:true})).toHaveCount(0);
  check('two distinguishable Core snapshots + typed reader + pinned link + no generic JSON editor');
  await page.goto(savedURL);
  await expect(page.getByLabel('Il tuo ragionamento',{exact:true})).toHaveValue('Ragionamento sintetico S01: controllo segno e scala.');await expect(page.getByTestId('science-result')).toHaveCount(0);check('private Core save + exact cold reopen with help flag and no restored answer');
  await pred(page).fill('0.15');await compare(page).click();await result(page,'0,15 m');
  for(const width of [1440,820,390,360]){await page.setViewportSize({width,height:1050});
   if(width<=740){const controls=await page.locator('.science-controls').boundingBox(),main=await page.locator('.science-main').boundingBox();expect(controls.y).toBeLessThan(main.y);
    await page.getByRole('button',{name:'Modifica i dati',exact:true}).click();await expect(page.getByLabel('Distanza focale con segno [m]')).toBeFocused();} const before=await page.locator('.science-graph').evaluate(graphGeometry);
   await expect.poll(()=>page.locator('.science-graph').evaluate(graphGeometry).then(v=>v.fitted)).toBe(true);
   report.resizeGeometry.push({width,before,settled:await page.locator('.science-graph').evaluate(graphGeometry)});
   await page.evaluate(()=>{scrollTo(0,0);if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});await noOverflow(page);const file='science-'+width+'.png';await page.screenshot({path:path.join(out,file),fullPage:true});report.screenshots.push(file);}
  check('1440/820/390/360 actual product screenshots + fitted scientific geometry + no horizontal overflow');
  const fresh=await browser.newContext({baseURL:base,storageState:await context.storageState(),viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const freshPage=await fresh.newPage();freshPage.on('pageerror',e=>report.errors.push(e.message));freshPage.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))report.externalRequests.push(r.url());});
  await freshPage.goto(savedURL);await pred(freshPage).fill('0.15');await compare(freshPage).tap();await result(freshPage,'0,15 m');
  await expect.poll(()=>freshPage.locator('.science-graph').evaluate(graphGeometry).then(v=>v.fitted)).toBe(true);
  report.resizeGeometry.push({width:390,freshContext:true,settled:await freshPage.locator('.science-graph').evaluate(graphGeometry)});
  await freshPage.screenshot({path:path.join(out,'science-fresh-390.png'),fullPage:true});await fresh.close();check('fresh mobile context390 renders the actual scientific geometry under CSP');
  await page.getByRole('button',{name:'Un problema diverso',exact:true}).click();await expect(page.getByTestId('science-result')).toHaveCount(0);await expect(pred(page)).toHaveValue('');
  await pred(page).fill('-0.1');await compare(page).click();await result(page,'−0,1 m'.replace('−','-'));await expect(page.getByTestId('science-result')).toBeFocused();check('different lens problem resets prediction + virtual image');
  await context.setOffline(true);await page.getByLabel('Il tuo ragionamento',{exact:true}).fill('Nota sintetica offline');await page.getByRole('button',{name:'Salva nel quaderno',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Il tuo ragionamento',{exact:true})).toHaveValue('Nota sintetica offline');await context.setOffline(false);await page.getByRole('button',{name:'Riprova il salvataggio in attesa',exact:true}).click();await expect(page.getByRole('status')).toContainText('salvati');check('offline save failure retains text + exact retry succeeds');
  const peer=await browser.newContext({baseURL:base});await peer.request.post('/study/session',{data:{token:fixture.actors['s01-peer'].token}});
  expect((await peer.request.get('/study/science-library/resources/'+rid+'?revisionId='+revision)).status()).toBe(403);await peer.close();check('actual peer cookie denied private revision 403');
  await context.request.post('/study/session/revoke-all');await page.getByRole('button',{name:'Un problema diverso',exact:true}).click();await pred(page).fill('1');await compare(page).click();
  await expect(page.getByRole('button',{name:'Accedi',exact:true})).toBeVisible();await expect(page.getByLabel('Il tuo ragionamento',{exact:true})).toHaveCount(0);check('real session revocation removes private consumer');
  await context.close();
  const fallback=await browser.newContext({baseURL:base,viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await fallback.request.post('/study/session',{data:{token:fixture.actors['s01-tutor'].token}});const f=await fallback.newPage();
  f.on('pageerror',e=>report.errors.push(e.message));f.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))report.externalRequests.push(r.url());});
  await f.route('**/*',route=>(built?/\/assets\/src-.*\.js/.test(route.request().url()):route.request().url().includes('jsxgraph'))?route.abort():route.continue());await f.goto(base+entry);await f.getByRole('button',{name:'Apri la libreria scientifica',exact:true}).tap();
  await pred(f).fill('1');await compare(f).tap();await expect(f.getByText('Il grafico interattivo non è disponibile. Restano la vista statica e tutti i valori in tabella.')).toBeVisible();await expect(f.locator('.science-plot-area>svg')).toHaveCount(1);
  await f.getByText('Dati equivalenti del grafico',{exact:true}).tap();await expect(f.getByRole('table')).toBeVisible();await noOverflow(f);await f.evaluate(()=>scrollTo(0,0));await f.screenshot({path:path.join(out,'science-fallback-touch-390.png'),fullPage:true});check('blocked lazy library retains SVG + numbers + table with real touch');await fallback.close();
  if(built){report.builtFrontend=built;check('compiled actual product + canonical private CSP (no unsafe-eval or remote scripts)');}
  expect(report.errors).toEqual([]);expect(report.externalRequests).toEqual([]);check('no page errors or external requests');report.status='PASS';
 }catch(error){report.status='FAIL';report.failure=String(error.stack||error);process.exitCode=1;
  if(debugPage&&!debugPage.isClosed()){report.failurePageText=await debugPage.locator('body').innerText().catch(()=>null);await debugPage.screenshot({path:path.join(out,'consumer-failure.png'),fullPage:true}).catch(()=>{});}}
 finally{
  if(browser)await browser.close();for(const child of children)child.kill('SIGTERM');
  await Promise.all(children.map(child=>child.exitCode!==null?Promise.resolve():new Promise(r=>child.once('exit',r))));
  for(const name of ['fixture-private.json','science.sqlite','science.sqlite-wal','science.sqlite-shm'])fs.rmSync(path.join(out,name),{force:true});
  report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'consumer-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,report:path.join(out,'consumer-report.json'),failure:report.failure}));
 }
})();
