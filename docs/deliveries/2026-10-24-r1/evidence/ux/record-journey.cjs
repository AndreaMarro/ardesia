const {chromium}=require((process.env.UX_REPO || require('node:path').resolve(__dirname,'../../ardesia-r1'))+'/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const origin=process.env.UX_ORIGIN||'http://127.0.0.1:5416',artifact=path.resolve(process.env.UX_ARTIFACT||path.join(__dirname,'../candidate-public'));
const out=path.resolve(process.env.UX_VIDEO_OUT||path.join(__dirname,'video-1'));fs.mkdirSync(out,{recursive:true});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
let browser,context;
const stages=[],issues=[];
(async()=>{
 const manifestSha=sha(fs.readFileSync(path.join(artifact,'candidate-manifest.json')));
 browser=await chromium.launch({headless:true});context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:out,size:{width:1440,height:1000}},reducedMotion:'reduce'});
 const page=await context.newPage(),video=page.video(),start=Date.now();
 page.on('pageerror',e=>issues.push(String(e)));page.on('requestfailed',r=>issues.push(r.url()+': '+r.failure()?.errorText));
 const observe=async(name,ms)=>{stages.push({name,elapsedMs:Date.now()-start,url:page.url()});await page.waitForTimeout(ms);}; // reading pauses are intentional, never readiness waits
 await page.goto(origin+'/');await page.getByRole('heading',{level:1}).waitFor();await observe('landing',1800);
 await page.locator('a[href="?percorso=fluidi-termodinamica#fluidi-termodinamica"]').click();await observe('Fluidi course selected',1800);
 await page.locator('a[href="/esperienza/?percorso=fluidi-termodinamica"]').first().click();await page.getByRole('heading',{name:'Che cosa tieni fisso?'}).scrollIntoViewIfNeeded();await observe('prediction first',1800);
 await page.getByLabel('Rapporto previsto',{exact:true}).fill('4');await observe('numerical prediction',800);
 await page.getByRole('button',{name:'Metti alla prova',exact:true}).press('Enter');await page.getByTestId('physics-ratio').waitFor();await page.getByTestId('flow-measures').scrollIntoViewIfNeeded();await observe('radius doubled, pressure fixed, Q16',2400);
 await page.getByRole('button',{name:'Guarda il grafico',exact:true}).click();await page.getByTestId('poiseuille-graph').scrollIntoViewIfNeeded();await observe('graph',2000);
 await page.getByRole('button',{name:'Riprendi il vincolo',exact:true}).click();await page.getByTestId('lesson-demo').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Ascolta il passaggio',exact:true}).click();await page.waitForFunction(()=>document.querySelector('audio').currentTime>.1);await observe('manual recovery, synthetic voice and transcript',2500);await page.getByRole('button',{name:'Pausa audio',exact:true}).click();
 await page.getByRole('button',{name:'Un problema diverso',exact:true}).press('Enter');await page.locator('.transfer-prompt').scrollIntoViewIfNeeded();await observe('new task, fixed radius/flow, viscosity and length doubled',2400);
 await page.getByLabel('Rapporto previsto',{exact:true}).fill('4');await page.getByRole('button',{name:'Metti alla prova',exact:true}).press('Enter');await page.getByTestId('flow-measures').scrollIntoViewIfNeeded();await observe('pressure ratio4, speed and flow unchanged',2400);
 await page.getByRole('link',{name:'Chiedi disponibilità',exact:true}).click();await observe('same course contact, no message sent',2200);
 const elapsedMs=Date.now()-start;await context.close();context=null;await video.saveAs(path.join(out,'ardesia-r1-public.webm'));
 const bytes=fs.readFileSync(path.join(out,'ardesia-r1-public.webm'));const metadata={origin,artifact,manifestSha,node:process.version,browser:browser.version(),elapsedMs,stages,issues,bytes:bytes.length,sha256:sha(bytes),continuous:true,width:1440,height:1000,audio:'Playwright video has no captured audio track; actual manual media playback is independently checked in UI QA. This video is a continuous visual demonstration.',limits:'Synthetic public demonstration, deliberate reading pauses, no contact submission or cloud/private access.'};
 fs.writeFileSync(path.join(out,'video-metadata.json'),JSON.stringify(metadata,null,2));if(issues.length)throw Error('Video runtime issues');console.log(JSON.stringify({elapsedMs,bytes:bytes.length,sha256:metadata.sha256}));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await context?.close();await browser?.close();});
