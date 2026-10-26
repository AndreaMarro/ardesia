import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const sourceCommit=git('rev-parse','HEAD');
if(process.env.S06_EXPECTED_SHA&&process.env.S06_EXPECTED_SHA!==sourceCommit)throw Error('Unexpected source commit');
const sourcePaths=['apps/web/src','services/study-api','packages/engine/lessonos','handoffs/swarm-v2/S06/composition/browser.mjs','handoffs/swarm-v2/S06/composition/server.py','handoffs/swarm-v2/S06/composition/test_factory_composition.py'];
function assertCleanSource(){if(git('status','--porcelain','--',...sourcePaths))throw Error('Source changed or untracked during proof');if(git('rev-parse','HEAD')!==sourceCommit)throw Error('HEAD changed during proof');}
assertCleanSource();
const manifest=JSON.parse(await readFile(process.env.S06_SOURCE_MANIFEST||path.join(here,'source-manifest.json'),'utf8'));
const sourceFiles=[];
for(const item of manifest.files){const sha256=createHash('sha256').update(await readFile(path.join(root,item.path))).digest('hex');if(sha256!==item.candidateSha256)throw Error('Shared wiring differs: '+item.path);sourceFiles.push({path:item.path,sha256});}
const data=process.env.S06_COMPOSITION_DATA||path.join(here,'.artifacts');
const outputs=process.env.S06_OUTPUTS||path.join(data,'browser');
const access=JSON.parse(await readFile(path.join(data,'access.json'),'utf8'));
await mkdir(outputs,{recursive:true});
const base='http://127.0.0.1:5361',checks=[],errors=[],requests=[];let revoking=false;
const browser=await chromium.launch({headless:true});
const check=(name,condition)=>{if(!condition)throw Error(name);checks.push(name);};
function observe(page){page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!(revoking&&m.text().includes('401')))errors.push(m.text());});page.on('request',r=>requests.push(r.url()));}
async function login(token,options={}){const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...options});c.setDefaultTimeout(15000);check('cookie-login-'+checks.length,(await c.request.post(base+'/study/session',{data:{token}})).ok());return c;}
async function shot(page,name){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.evaluate(()=>new Promise(requestAnimationFrame));await page.screenshot({path:path.join(outputs,name),fullPage:true});}
async function current(c){const list=await(await c.request.get(base+'/study/independent-study?editionId=mechanics')).json();return(await c.request.get(base+'/study/independent-study/'+list.sessions[0].id)).json();}
try{
 const started=performance.now(),student=await login(access.student),page=await student.newPage();observe(page);
 check('legacy-public-fixture-available',(await student.request.get(base+'/study/course')).ok());
 const home=await page.goto(base+'/?edition=mechanics&view=today');
 check('compiled-app-csp-self',home.headers()['content-security-policy'].includes("script-src 'self'")&&!home.headers()['content-security-policy'].includes('unsafe-eval'));
 const nav=page.getByRole('navigation',{name:'Navigazione principale'});
 const entry=nav.getByRole('button',{name:'Studio autonomo',exact:true});await entry.waitFor();
 await entry.focus();await page.keyboard.press('Enter');await page.getByRole('heading',{name:'Studia da solo.'}).waitFor();
 check('real-root-navigation',new URL(page.url()).searchParams.get('view')==='independent-study');
 check('one-main-landmark',await page.getByRole('main').count()===1);
 await page.getByRole('button',{name:'Scegli questo obiettivo'}).first().click();
 await page.getByLabel('La tua idea iniziale').fill('Confronto forza e allungamento.');
 await page.getByRole('button',{name:'Comincia la spiegazione'}).click();await page.getByRole('button',{name:'Esplora il modello'}).click();
 await page.getByRole('button',{name:'Esegui il modello'}).click();await page.getByRole('img',{name:/Molla in equilibrio/}).waitFor();
 await page.getByRole('button',{name:'Passa alla prova'}).click();await page.getByRole('button',{name:'Chiedi un indizio'}).click();
 await page.getByLabel('Il tuo valore [m]',{exact:true}).fill('999');await page.getByLabel('Il tuo procedimento').fill('🔬 F/k: controllo forza e costante.');
 await page.getByRole('button',{name:'Consegna e confronta'}).click();await page.getByText(/Valore o unità non coincidono/).waitFor();
 await page.reload();await page.getByRole('button',{name:'Recupera dalla fonte'}).waitFor();
 await nav.getByRole('button',{name:'Il mio lavoro',exact:true}).click();await page.getByRole('button',{name:'Consegne e feedback',exact:true}).click();
 await page.getByText('Originali, versione e ricevuta',{exact:true}).first().click();await page.getByRole('heading',{name:'Tentativo di studio autonomo'}).waitFor();
 const beforeTransfer=await page.getByRole('main').textContent();
 check('work-source-projection-before-transfer',beforeTransfer.includes('🔬 F/k: controllo forza e costante.')&&!beforeTransfer.includes('0.075')&&!beforeTransfer.includes('"answer":')&&!beforeTransfer.includes('"assistance":'));
 await shot(page,'S06-App-fonti-prima-transfer.png');
 await nav.getByRole('button',{name:'Studio autonomo',exact:true}).click();await page.getByRole('button',{name:'Recupera dalla fonte'}).waitFor();
 await page.getByRole('button',{name:'Recupera dalla fonte'}).click();await page.getByRole('button',{name:'Affronta un problema diverso'}).click();
 await page.getByLabel('Il tuo valore [m]',{exact:true}).fill('0.075');await page.getByLabel('Il tuo procedimento').fill('Nuova forza divisa per la costante elastica.');
 await page.getByRole('button',{name:'Consegna e confronta'}).click();await page.getByRole('button',{name:'Organizza il ripasso'}).waitFor();
 await page.getByRole('button',{name:'Organizza il ripasso'}).click();await page.getByRole('button',{name:/Autovalutazione: Ricordato/}).click();
 await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();const saved=await current(student);
 check('compiled-root-complete-receipts-and-rating',saved.attempts.length===2&&saved.reviewScheduler.lastRating==='good'&&saved.mastery==='NOT_INFERRED');
 await shot(page,'S06-App-ripasso-1440.png');
 // Reload must fetch the full canonical workspace after machine resources exist.
 const note='NOTA S06 CONSERVATA\n{"phaseSupport":"testo di una nota ordinaria"}';
 check('ordinary-note-created',(await student.request.post(base+'/study/resources',{data:{editionId:'mechanics',kind:'notes',text:note,visibility:'private'},headers:{'Idempotency-Key':'ordinary-note'}})).ok());
 await page.reload();await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 await nav.getByRole('button',{name:'Materiali',exact:true}).click();await page.getByRole('heading',{name:'Materiali e appunti.'}).waitFor();
 const materialList=page.locator('.material-list');await materialList.getByRole('button',{name:/NOTA S06 CONSERVATA/}).waitFor();
 check('machine-resources-hidden-from-materials',await materialList.getByRole('button').count()===1);
 const workspace=await(await student.request.get(base+'/study/workspace?editionId=mechanics')).json();
 check('machine-resources-remain-canonical',workspace.resources.filter(r=>r.kind.startsWith('independent-study-')).length===4);
 await shot(page,'S06-App-materiali-1440.png');
 await nav.getByRole('button',{name:'Studio autonomo',exact:true}).click();await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 await page.getByLabel('Edizione corrente',{exact:true}).selectOption('analysis');await page.getByRole('button',{name:'Scegli questo obiettivo'}).waitFor();
 check('edition-switch-has-no-previous-plan',await page.getByRole('heading',{name:'Taylor: fattoriali, segni e resto'}).isVisible()&&await page.getByRole('button',{name:'Annulla l’autovalutazione'}).count()===0);
 await page.getByLabel('Edizione corrente',{exact:true}).selectOption('mechanics');await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 check('edition-return-keeps-source',(await current(student)).sourceRef.revisionId===saved.sourceRef.revisionId);
 await student.close();
 const cold=await login(access.student,{viewport:{width:390,height:844},isMobile:true,hasTouch:true}),mobile=await cold.newPage();observe(mobile);
 await mobile.goto(base+'/?edition=mechanics&view=independent-study');await mobile.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 const resumed=await current(cold);check('fresh-session-source-receipts-exact',resumed.sourceRef.revisionId===saved.sourceRef.revisionId&&resumed.attempts[0].receipt.receiptId===saved.attempts[0].receipt.receiptId);
 await mobile.getByRole('button',{name:'Annulla l’autovalutazione'}).tap();await mobile.getByRole('button',{name:/Autovalutazione: Facile/}).waitFor();
 check('compiled-root-touch-undo',!(await current(cold)).reviewScheduler.rated);
 check('compiled-root-mobile-no-overflow',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await shot(mobile,'S06-App-ripasso-390.png');
 for(const [role,token] of [['teacher',access.tutor],['not-enrolled',access.empty]]){
  const c=await login(token),p=await c.newPage();observe(p);const before=requests.length;
  await p.goto(base+'/?edition=mechanics&view=independent-study');await p.getByRole('navigation',{name:'Navigazione principale'}).waitFor();await p.getByRole('main').getByRole('heading',{level:1}).first().waitFor();
  await p.getByRole('button',{name:'Studio autonomo',exact:true}).waitFor({state:'hidden'});
  check(role+'-no-phantom-route',await p.getByRole('heading',{name:'Studia da solo.'}).count()===0);
  check(role+'-no-planner-fetch',!requests.slice(before).some(u=>u.includes('/study/independent-study')));
  check(role+'-api-remains-forbidden',(await c.request.get(base+'/study/independent-study?editionId=mechanics')).status()===403);
  if(role==='teacher'){
   await p.getByRole('navigation',{name:'Navigazione principale'}).getByRole('button',{name:'Da correggere',exact:true}).click();
   await p.getByRole('heading',{name:'Un intervento preciso.'}).waitFor();const queue=await(await c.request.get(base+'/study/workspace?editionId=mechanics')).json();const index=queue.submissions.findIndex(s=>s.text.includes('🔬'));check('unicode-submission-in-canonical-queue',index>=0);await p.getByRole('complementary',{name:'Consegne del gruppo'}).getByRole('button').nth(index).click();
   await p.getByLabel(/Fonte collegata/).selectOption('1');await p.getByRole('article',{name:'Fonte editoriale di studio'}).waitFor();
   check('teacher-editorial-source-has-no-raw-selection',await p.getByLabel('Originale della fonte').count()===0);
   await p.getByLabel(/Fonte collegata/).selectOption('0');await p.getByRole('heading',{name:'Tentativo di studio autonomo'}).waitFor();
   await p.getByText('Cita l’originale strutturato',{exact:true}).click();const original=p.getByLabel('Originale della fonte');
   const raw=await original.inputValue(),position=raw.indexOf('F/k');check('unicode-fixture-is-actual-source',raw.includes('🔬')&&position>0);
   await p.evaluate(()=>document.fonts.ready);await original.scrollIntoViewIfNeeded();
   const point=await original.evaluate((el,position)=>{const style=getComputedStyle(el),rect=el.getBoundingClientRect(),canvas=document.createElement('canvas').getContext('2d');canvas.font=style.font;const left=rect.left+parseFloat(style.borderLeftWidth)+parseFloat(style.paddingLeft),top=rect.top+parseFloat(style.borderTopWidth)+parseFloat(style.paddingTop);return {x:left+canvas.measureText(el.value.slice(0,position)).width,end:left+canvas.measureText(el.value.slice(0,position+3)).width,y:top+(parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.3)/2};},position);
   await p.mouse.move(point.x,point.y);await p.mouse.down();await p.mouse.move(point.end,point.y,{steps:5});await p.mouse.up();
   check('actual-pointer-selected-exact-fragment',await original.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))==='F/k');
   await p.getByText('Collega un passaggio al diario',{exact:true}).click();await p.locator('.observation-form blockquote').filter({hasText:/^F\/k$/}).waitFor();const accepted=p.waitForResponse(r=>r.url().endsWith('/study/diary/observations')&&r.request().method()==='POST');
   await p.getByRole('button',{name:'Proponi il passaggio',exact:true}).click();const receipt=await accepted,body=await receipt.json();
   check('unicode-citation-accepted-by-real-core',receipt.ok()&&body.source.quote==='F/k'&&body.source.start===Array.from(raw.slice(0,position)).length);
   await shot(p,'S06-App-review-citazione.png');
  }

  await c.close();
 }
 const peer=await login(access.peer);check('peer-plan-forbidden',(await peer.request.get(base+'/study/independent-study/'+saved.id)).status()===403);await peer.close();
 await mobile.getByText('Bozza e lettura sul dispositivo',{exact:true}).tap();await mobile.getByRole('button',{name:'Salva bozza e passaggio sul dispositivo'}).tap();
 await mobile.getByText('Salvato sul dispositivo. La bozza non è una consegna.',{exact:true}).waitFor();
 revoking=true;await cold.request.post(base+'/study/session/revoke-all',{data:{}});await mobile.getByRole('button',{name:'Riapri e verifica il percorso'}).tap();
 await mobile.getByRole('heading',{name:'Studia da solo.'}).waitFor({state:'hidden'});
 check('root-revocation-clears-private-plan',await mobile.getByRole('navigation',{name:'Navigazione principale'}).count()===0);
 check('root-revocation-clears-local-copy',await mobile.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('independent-study.v1.offline')).length===0));
 check('zero-browser-errors',errors.length===0);await cold.close();
 assertCleanSource();
 await writeFile(path.join(outputs,'result.json'),JSON.stringify({status:'PASS',sourceCommit,sourceFiles,checks,errors,totalMilliseconds:Math.round(performance.now()-started),scope:'Installed PR309 source: compiled actual App + Shell316 + actual create_app, synthetic local database; no remote deployment'},null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',checks:checks.length,errors}));
}catch(e){await writeFile(path.join(outputs,'result.json'),JSON.stringify({status:'FAIL',sourceCommit,checks,errors,error:String(e)},null,2)+'\n');throw e;}
finally{await browser.close();}
