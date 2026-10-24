const {chromium}=require((process.env.UX_REPO || require('node:path').resolve(__dirname,'../../ardesia-r1'))+'/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const origin=process.env.UX_ORIGIN||'http://127.0.0.1:5416';
const artifact=path.resolve(process.env.UX_ARTIFACT||path.join(__dirname,'../candidate-public'));
const out=path.resolve(process.env.UX_OUT||path.join(__dirname,'public-qa-1'));
fs.mkdirSync(out,{recursive:true});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function wavDuration(bytes){let at=12,byteRate=0,dataBytes=0;while(at+8<=bytes.length){const size=bytes.readUInt32LE(at+4),kind=bytes.toString('ascii',at,at+4);if(kind==='fmt ')byteRate=bytes.readUInt32LE(at+16);if(kind==='data')dataBytes=size;at+=8+size+(size%2);}if(!byteRate||!dataBytes)throw Error('Cannot read canonical WAV duration');return dataBytes/byteRate;}
const checks=[],issues=[],assets=[],pending=[];
let browser,page;
function check(name,pass,detail){checks.push({name,pass,detail});if(!pass)throw Error(name+': '+JSON.stringify(detail));}
const task='Nuovo problema: Q e raggio restano costanti; viscosità e lunghezza raddoppiano.';
async function evaluate(value){await page.getByLabel('Rapporto previsto',{exact:true}).fill(value);await page.getByRole('button',{name:'Metti alla prova',exact:true}).press('Enter');await page.getByTestId('physics-ratio').waitFor();}
async function finishDocumentCapture(){await page.waitForLoadState('networkidle');await Promise.all(pending);} // static site: finish response-body reads before destroying the document/CDP loader
async function text200(){return page.evaluate(()=>{const elements=[...document.querySelectorAll('h1,h2,h3,p,span,a,button,label,input,select,summary,strong,blockquote,output,li,svg text')];const sizes=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));elements.forEach((e,i)=>e.style.fontSize=sizes[i]*2+'px');return elements.length;});}
async function fitState(){return page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,quantities:[...document.querySelectorAll('.flow-measures > div')].map(e=>{const column=e.getBoundingClientRect(),text=e.querySelector('strong').getBoundingClientRect();return {text:e.textContent,columnRight:column.right,textRight:text.right,overflowsColumn:text.right>column.right+1};})}));}
function observe(p){
 p.on('pageerror',e=>issues.push({kind:'pageerror',value:String(e)}));
 p.on('console',m=>{if(['warning','error'].includes(m.type()))issues.push({kind:m.type(),value:m.text()});});
 p.on('requestfailed',r=>issues.push({kind:'requestfailed',url:r.url(),failure:r.failure()}));
 p.on('request',r=>{if(new URL(r.url()).origin!==origin||r.url().includes('/study/'))issues.push({kind:'external/private request',url:r.url()});});
 p.on('response',r=>{if(r.status()>=400)issues.push({kind:'HTTP failure',url:r.url(),status:r.status()});
  if(![200,206].includes(r.status())||new URL(r.url()).origin!==origin||r.request().method()!=='GET')return;
  pending.push((async()=>{const bytes=await r.body();const relative=decodeURIComponent(new URL(r.url()).pathname).replace(/^\//,'');const target=path.join(artifact,'public',!relative?'index.html':relative.endsWith('/')?relative+'index.html':relative);let expected=fs.existsSync(target)?fs.readFileSync(target):null;const range=r.headers()['content-range'];if(r.status()===206){const match=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(range||'');if(!match||!expected)throw Error('Unverifiable media range');expected=expected.subarray(Number(match[1]),Number(match[2])+1);}assets.push({url:r.url(),status:r.status(),contentRange:range,bytes:bytes.length,sha256:sha(bytes),artifactSha256:expected?sha(expected):null});})().catch(e=>issues.push({kind:'response-body',url:r.url(),value:String(e)})));
 });
}
(async()=>{
 const manifestSha=sha(fs.readFileSync(path.join(artifact,'candidate-manifest.json'))),sourceManifestSha=sha(fs.readFileSync(path.join(artifact,'source-manifest.json')));
 const expectedWavDuration=wavDuration(fs.readFileSync(path.join(artifact,'public/esperienza/lesson-demo/poiseuille.wav')));
 browser=await chromium.launch({headless:true});
 for(const width of [360,390,820,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  page=await context.newPage();observe(page);
  await page.goto(origin+'/esperienza/?percorso=fluidi-termodinamica');
  await page.getByRole('heading',{name:'Che cosa tieni fisso?'}).waitFor();
  await page.screenshot({path:path.join(out,`first-viewport-${width}.png`)});
  check(`${width}: identity`,/Ardesia Fisica/.test(await page.title())&&await page.getByRole('heading',{level:1}).count()===1);
  check(`${width}: meaningful content and no framework overlay`,await page.getByRole('heading',{name:'Che cosa tieni fisso?'}).count()===1&&await page.locator('vite-error-overlay').count()===0);
  check(`${width}: prediction first`,await page.getByTestId('physics-ratio').count()===0&&await page.getByTestId('flow-measures').count()===0&&await page.locator('audio').count()===0);
  await page.locator('.skip-link').focus();await page.keyboard.press('Enter');
  check(`${width}: keyboard skip destination`,await page.locator('main').evaluate(e=>e===document.activeElement));
  await page.getByText('Modello e limiti',{exact:true}).click();
  const domain=await page.locator('details').innerText();
  check(`${width}: complete assumptions before result`,domain.includes('orizzontale')&&domain.includes('sviluppato')&&domain.includes('senza scorrimento')&&domain.includes('valori assoluti')&&domain.includes('rapporti adimensionali'));
  await page.getByText('Modello e limiti',{exact:true}).click();
  await page.screenshot({path:path.join(out,`initial-${width}.png`),fullPage:true});
  await evaluate('4');check(`${width}: independent doubled-radius oracle`,await page.getByTestId('physics-ratio').innerText()==='Q/Q0 = 16');
  await page.getByRole('button',{name:'Guarda il grafico',exact:true}).click();
  check(`${width}: ordinary graph revealed`,await page.getByTestId('poiseuille-graph').count()===1);
  check(`${width}: reduced motion`,await page.locator('.flow-tracer').first().evaluate(e=>getComputedStyle(e).animationName)==='none');
  await page.getByRole('button',{name:'Riprendi il vincolo',exact:true}).click();
  const audio=page.locator('audio');check(`${width}: manual audio`,await audio.getAttribute('preload')==='none'&&await audio.evaluate(e=>e.paused));
  await page.getByRole('button',{name:'Ascolta il passaggio',exact:true}).press('Enter');
  await page.waitForFunction(()=>document.querySelector('audio').currentTime>.1);
  check(`${width}: actual canonical WAV decoded`,Math.abs(await audio.evaluate(e=>e.duration)-expectedWavDuration)<.1);
  await page.getByRole('button',{name:'Pausa audio',exact:true}).click();
  check(`${width}: transcript points to new task`,(await page.getByTestId('lesson-demo').innerText()).includes('Ora mantieni la portata e il raggio, ma raddoppia viscosità e lunghezza.'));
  await page.screenshot({path:path.join(out,`recovery-${width}.png`),fullPage:true});
  await page.getByRole('button',{name:'Prova di nuovo',exact:true}).press('Enter');
  check(`${width}: retry focus with hidden result and recovery`,await page.getByLabel('Rapporto previsto',{exact:true}).evaluate(e=>e===document.activeElement)&&await page.getByTestId('physics-ratio').count()===0&&await page.getByTestId('lesson-demo').count()===0);
  await evaluate('16');await page.getByRole('button',{name:'Un problema diverso',exact:true}).press('Enter');
  check(`${width}: distinct task and focused prediction`,await page.getByLabel('Rapporto previsto',{exact:true}).evaluate(e=>e===document.activeElement)&&await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).inputValue()==='1'&&await page.locator('.transfer-prompt').innerText()===task);
  check(`${width}: no transfer result leak`,await page.getByTestId('physics-ratio').count()===0&&await page.getByTestId('flow-measures').count()===0);
  const lengths=await page.locator('.tube-body').evaluateAll(es=>es.map(e=>Number(e.getAttribute('width'))));
  check(`${width}: tube lengths match authored ratio`,lengths[0]===227.5&&lengths[1]===455,lengths);
  await page.screenshot({path:path.join(out,`new-task-${width}.png`),fullPage:true});
  await page.locator('.transfer-prompt').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`new-task-viewport-${width}.png`)});
  await evaluate('1');check(`${width}: transfer pressure oracle and relevant feedback`,await page.getByTestId('physics-ratio').innerText()==='Δp/Δp0 = 4'&&(await page.locator('.prediction-comparison').innerText()).includes('viscosità e lunghezza'));
  check(`${width}: actual Core visual override`,await page.getByTestId('flow-measures').getAttribute('data-speed-ratio')==='1'&&(await page.getByTestId('flow-measures').innerText()).includes('Δp/Δp₀ = 4')&&await page.getByRole('button',{name:'Guarda il grafico',exact:true}).count()===0);
  await page.getByRole('button',{name:'Prova di nuovo',exact:true}).press('Enter');check(`${width}: retry retains task`,await page.locator('.transfer-prompt').innerText()===task);
  await evaluate('4');await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).focus();await page.keyboard.press('ArrowRight');
  check(`${width}: manual radius edit leaves stale task and varied metadata`,await page.locator('.transfer-prompt').count()===0&&(await page.locator('.model-key').innerText()).includes('Stesso fluido · stessa lunghezza')&&await page.getByTestId('physics-ratio').count()===0);
  await page.getByRole('button',{name:'Ricomincia l’esperimento',exact:true}).press('Enter');
  check(`${width}: restart focus and exact defaults`,await page.getByLabel('Rapporto previsto',{exact:true}).evaluate(e=>e===document.activeElement)&&await page.getByRole('slider',{name:'Rapporto dei raggi',exact:true}).inputValue()==='2'&&await page.getByRole('combobox',{name:/Grandezza fissata/}).inputValue()==='pressure');
  await evaluate('16');await page.getByRole('button',{name:'Un problema diverso',exact:true}).click();
  await page.getByRole('combobox',{name:/Grandezza fissata/}).selectOption('pressure');
  check(`${width}: manual constraint edit leaves stale task`,await page.locator('.transfer-prompt').count()===0&&(await page.locator('.model-key').innerText()).includes('Δp fissata'));
  await finishDocumentCapture();await page.getByRole('link',{name:'Chiedi disponibilità',exact:true}).click();await finishDocumentCapture();
  check(`${width}: course contact navigation`,new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica'&&new URL(page.url()).hash==='#contatto');
  await page.goBack();await finishDocumentCapture();check(`${width}: Back preserves route context`,new URL(page.url()).pathname==='/esperienza/'&&new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica');
  await page.goForward();await finishDocumentCapture();check(`${width}: Forward preserves course`,new URL(page.url()).hash==='#contatto'&&new URL(page.url()).searchParams.get('percorso')==='fluidi-termodinamica');
  await page.goto(origin+'/esperienza/?percorso=elettricita-magnetismo');await finishDocumentCapture();await page.reload();
  check(`${width}: direct route and reload preserve selected course`,await page.getByRole('link',{name:'Chiedi disponibilità',exact:true}).getAttribute('href')==='/?percorso=elettricita-magnetismo#contatto'&&await page.getByTestId('physics-ratio').count()===0);
  await evaluate('16');await text200();const fit=await fitState();
  check(`${width}: text200 no page or quantity overlap`,fit.scrollWidth<=fit.width&&fit.quantities.every(q=>!q.overflowsColumn),fit);
  await page.getByTestId('flow-measures').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`text200-${width}.png`),fullPage:true});await page.screenshot({path:path.join(out,`text200-viewport-${width}.png`)});
  await finishDocumentCapture();await page.reload();const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
  check(`${width}: browser page scale 2 observed`,await page.evaluate(()=>visualViewport.scale)===2);
  await page.screenshot({path:path.join(out,`page-scale2-${width}.png`)});
  await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
  await finishDocumentCapture();await context.close();
 }
 await Promise.all(pending);
 check('native audio responses captured for exact byte verification',assets.some(a=>new URL(a.url).pathname.endsWith('.wav')));
 check('all actual HTTP bodies match exact artifact files',assets.every(a=>a.sha256===a.artifactSha256));
 check('no console/runtime/request/HTTP/private/remote issues',issues.length===0,issues);
 check('candidate manifest unchanged',sha(fs.readFileSync(path.join(artifact,'candidate-manifest.json')))===manifestSha);
 check('source manifest unchanged',sha(fs.readFileSync(path.join(artifact,'source-manifest.json')))===sourceManifestSha);
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({status:'PASS',origin,artifact,manifestSha,sourceManifestSha,browser:browser.version(),node:process.version,checks,issues,assets,limits:'Anonymous Chromium desktop contexts at four CSS viewports. Browser plugin unavailable; existing Playwright used. Text200 is an isolated computed-font-size doubling simulation including SVG text; browser pageScaleFactor2 is visual pinch zoom, not desktop Chrome preference zoom. Screenshots require independent visual review. No real device, external account, API, microphone, contact submission or learning measure.'},null,2));
 console.log(JSON.stringify({checks:checks.length,status:'PASS',out}));
})().catch(async error=>{fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({error:String(error),checks,issues,assets},null,2));if(page&&!page.isClosed()){await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(out,'failure.html'),await page.content());}console.error(error);process.exitCode=1;}).finally(()=>browser?.close());
