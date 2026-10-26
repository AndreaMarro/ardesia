import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./',import.meta.url)),base='http://127.0.0.1:5360';
const outputs=path.resolve(process.env.S06_OUTPUTS||path.join(root,'.artifacts'));
await mkdir(outputs,{recursive:true});
const access=JSON.parse(await readFile(path.join(root,'access.json'),'utf8'));
const browser=await chromium.launch({headless:true});
const checks=[],errors=[],timings=[];let revoking=false;
const context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
context.setDefaultTimeout(15000);
const page=await context.newPage();
function observe(p){p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!(revoking&&m.text().includes('401')))errors.push(m.text());});}
observe(page);
function check(name,value){if(!value)throw Error(name);checks.push(name);}
async function click(name){await page.getByRole('button',{name,exact:true}).click();}
async function state(c=context){const catalog=await (await c.request.get(base+'/study/independent-study?editionId=strumenti-meccanica')).json();const response=await c.request.get(base+'/study/independent-study/'+catalog.sessions[0].id);if(!response.ok())throw Error('state '+response.status());return response.json();}
try{
 const start=performance.now();
 check('real-cookie-login',(await context.request.post(base+'/study/session',{data:{token:access.student}})).ok());
 await page.goto(base);await page.getByRole('button',{name:'Scegli questo obiettivo'}).first().click();
 await page.getByLabel('La tua idea iniziale').fill('Controllo forza, costante elastica e unità.');
 await click('Comincia la spiegazione');await click('Esplora il modello');await click('Esegui il modello');
 await page.getByRole('img',{name:/Molla in equilibrio/}).waitFor();
 await page.screenshot({path:outputs+'/S06-scheduler-modello-1440.png',fullPage:true});
 await click('Passa alla prova');await click('Chiedi un indizio');
 await page.getByLabel('Il tuo valore [m]',{exact:true}).fill('999');
 await page.getByLabel('Il tuo procedimento').fill('Prima ipotesi, controllo F/k e le unità.');
 await click('Consegna e confronta');await page.getByText(/Valore o unità non coincidono/).waitFor();
 await click('Recupera dalla fonte');await click('Affronta un problema diverso');
 await page.getByLabel('Il tuo valore [m]',{exact:true}).fill('0.075');
 await page.getByLabel('Il tuo procedimento').fill('Divido la forza per la costante nel nuovo problema.');
 await click('Consegna e confronta');await page.getByText(/Il valore e l’unità coincidono/).waitFor();
 await click('Organizza il ripasso');await page.getByRole('heading',{name:'Come hai ricordato?'}).waitFor();
 const original=await state();
 check('four-real-preview-choices',original.reviewScheduler.choices.length===4&&!original.reviewScheduler.rated);
 check('no-inferred-mastery',original.mastery==='NOT_INFERRED');
 await page.screenshot({path:outputs+'/S06-scheduler-scelte-1440.png',fullPage:true});
 // Reach a rating with actual keyboard Tab events, then activate with Enter.
 await page.getByRole('button',{name:'Riapri e verifica il percorso',exact:true}).focus();
 let focused=false;
 for(let n=0;n<30;n++){await page.keyboard.press('Tab');if(await page.getByRole('button',{name:/Autovalutazione: Da riprovare/}).evaluate(el=>el===document.activeElement)){focused=true;break;}}
 check('rating-reachable-by-tab',focused);
 await page.keyboard.press('Enter');await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 for(const [rating,label,delay,index] of [['again','Da riprovare',60,0],['hard','Difficile',330,1],['good','Ricordato',600,2],['easy','Facile',691200,3]]){
  const began=performance.now();
  if(index){await page.getByRole('button',{name:new RegExp('Autovalutazione: '+label)}).click();await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();}
  const rated=await state(),now=Date.now()/1000;
  check('rating-'+rating,rated.reviewScheduler.lastRating===rating&&Math.abs(rated.reviewAt-now-delay)<15);
  check('rating-'+rating+'-keeps-sources-and-help',JSON.stringify(rated.sourceRef)===JSON.stringify(original.sourceRef)&&JSON.stringify(rated.assistanceHistory)===JSON.stringify(original.assistanceHistory)&&rated.attempts.length===2);
  await click('Annulla l’autovalutazione');await page.getByRole('button',{name:/Autovalutazione: Da riprovare/}).waitFor();
  const undone=await state();check('undo-'+rating,undone.reviewAt===original.reviewAt&&!undone.reviewScheduler.rated);
  timings.push({operation:rating+'-and-undo',milliseconds:Math.round(performance.now()-began)});
 }
 await page.getByRole('button',{name:/Autovalutazione: Ricordato/}).click();await page.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 await page.getByLabel('Scegli quando ripassare',{exact:true}).selectOption('7');
 await page.getByText(/Hai scelto una data personale/).waitFor();
 const manual=await state();check('manual-date-is-not-new-review',manual.reviewScheduler.lastRating==='good'&&manual.reviewScheduler.manualOverride.days===7);
 await page.reload();await page.getByText(/Hai scelto una data personale/).waitFor();
 check('reload-keeps-rated-schedule',(await state()).reviewAt===manual.reviewAt);
 await context.close();
 // A separate cookie login and touch-enabled browser context read the same Core DB.
 const cold=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 cold.setDefaultTimeout(15000);
 check('fresh-cookie-login',(await cold.request.post(base+'/study/session',{data:{token:access.student}})).ok());
 const mobile=await cold.newPage();observe(mobile);await mobile.goto(base);
 await mobile.getByText(/Hai scelto una data personale/).waitFor();
 const restored=await state(cold);check('cold-context-keeps-source-receipts',restored.sourceRef.revisionId===original.sourceRef.revisionId&&restored.attempts[0].receipt.receiptId===original.attempts[0].receipt.receiptId);
 check('mobile-no-horizontal-overflow',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await mobile.getByRole('button',{name:'Annulla l’autovalutazione'}).tap();await mobile.getByRole('button',{name:/Autovalutazione: Facile/}).waitFor();
 await mobile.screenshot({path:outputs+'/S06-scheduler-scelte-390.png',fullPage:true});
 await mobile.getByRole('button',{name:/Autovalutazione: Facile/}).tap();await mobile.getByRole('button',{name:'Annulla l’autovalutazione'}).waitFor();
 check('touch-rating-saved',(await state(cold)).reviewScheduler.lastRating==='easy');
 await mobile.getByText('Bozza e lettura sul dispositivo',{exact:true}).tap();await mobile.getByRole('button',{name:'Salva bozza e passaggio sul dispositivo'}).tap();
 await mobile.getByText('Salvato sul dispositivo. La bozza non è una consegna.',{exact:true}).waitFor();
 revoking=true;await cold.request.post(base+'/study/session/revoke-all',{data:{}});
 await mobile.getByRole('button',{name:'Riapri e verifica il percorso'}).tap();await mobile.getByRole('alert').waitFor();
 check('revocation-hides-private-review',await mobile.getByRole('heading',{name:'Come hai ricordato?'}).count()===0);
 check('revocation-clears-offline-review',await mobile.evaluate(()=>Object.keys(localStorage).filter(k=>k.includes('independent-study.v1.offline')).length===0));
 check('no-unexpected-browser-errors',errors.length===0);
 await cold.close();
 await writeFile(outputs+'/scheduler-browser-result.json',JSON.stringify({status:'PASS',checks,errors,timings,totalMilliseconds:Math.round(performance.now()-start),scope:'Real UI/HTTP/Core on loopback with synthetic actors, not integrated RootApp or remote deployment'},null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',checks:checks.length,errors,timings}));
}catch(e){await writeFile(outputs+'/scheduler-browser-result.json',JSON.stringify({status:'FAIL',checks,errors,error:String(e)},null,2)+'\n');throw e;}
finally{await browser.close();}
