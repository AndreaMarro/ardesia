/** Private component verification; published lesson/Core acceptance is separate. */
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const base=process.env.ARDESIA_LABS_URL||'http://127.0.0.1:5342/src/features/science-library/fluid-lab.html';
const output=resolve(process.env.ARDESIA_LABS_OUTPUT||'work/fluid-labs-browser');
await mkdir(output,{recursive:true});
const models=process.env.ARDESIA_LABS_MODELS?.split(',')||['manometer','hydrostatic','pascal','buoyancy','continuity','venturi','poiseuille','hydraulic-network','capillary','ideal-gas','calorimetry','phase-change','heat-transfer','process','carnot','entropy'];
const spatial=new Set(['pascal','buoyancy','continuity','venturi','poiseuille','capillary','ideal-gas','process']);
const report={schema:'ardesia.fluid-labs.browser/1',source:process.env.ARDESIA_LABS_SOURCE||'WORKING_TREE',
  scope:'PRIVATE_COMPONENT_HARNESS_NOT_PUBLISHED_LESSON_OR_CORE_PERSISTENCE',url:base,
  environment:{desktopViewport:{width:1440,height:1100},tabletViewport:{width:820,height:1180},mobileViewport:{width:390,height:844},physicalTablet:false},
  models:[],errors:[],limits:['No physical tablet, Safari or remote Core persistence acceptance.','No general FPS or full-product p95 claim.'],checks:{}};
const sourcePaths=['FluidThermoLab.tsx','LabDiagram.tsx','LabScene3D.tsx','sceneGeometry.ts','models.ts','definitions.ts','snapshot.ts','fluid-thermo.css'].map(p=>'apps/studio/plugins/fluid-thermo/'+p);
async function sourceManifest(){return Promise.all(sourcePaths.map(async path=>({path,sha256:createHash('sha256').update(await readFile(resolve(path))).digest('hex')})));}
report.sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();report.sourceManifest=await sourceManifest();
report.environment.renderer='Chromium headless shell with SwiftShader software rendering; not a physical GPU/device benchmark';
// Explicit --use-gl=angle stalls requestAnimationFrame in this macOS Chromium
// build even on about:blank. Leave GL selection to the bundled headless shell.
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader','--no-sandbox']});
let page;
try{
  report.environment.browser=browser.version();
  page=await browser.newPage({viewport:report.environment.desktopViewport,deviceScaleFactor:1});
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle',timeout:60000});
  await page.getByRole('heading',{name:'Stevino e distribuzione della pressione'}).waitFor();
  report.environment.clock=await page.evaluate(async()=>{let frames=0,active=true;const tick=()=>{frames++;if(active)requestAnimationFrame(tick);};requestAnimationFrame(tick);await new Promise(done=>setTimeout(done,300));active=false;return {frames,visibility:document.visibilityState};});
  if(report.environment.clock.frames<2)throw Error('Browser animation clock is not advancing; environment validation failed before model tests');
  for(const id of models){
    await page.getByLabel('Esperienza',{exact:true}).selectOption(id);
    const entry={id,twoD:false,manipulated:false,threeD:false};
    await page.locator('.lab-diagram').waitFor();entry.twoD=true;
    const input=page.locator('.ft-parameter input[type=number]').first();
    const original=await input.inputValue(),maximum=Number(await input.getAttribute('max'));
    const next=Number(original)*1.01<=maximum?Number(original)*1.01:Number(original)*.99;
    await input.fill(String(next));
    if(await input.inputValue()===original)throw Error('Control did not change: '+id);
    await page.getByRole('button',{name:'Ripristina lo scenario'}).click();
    await page.getByLabel('La tua previsione',{exact:true}).fill('Prevedo un cambiamento: confronto il vincolo.');
    await page.getByRole('button',{name:'Confronta con il modello',exact:true}).click();
    await page.locator('.ft-observation strong').waitFor();entry.manipulated=true;
    entry.primary=await page.locator('.ft-observation strong').innerText();
    await page.locator('.ft-visual').screenshot({path:resolve(output,id+'-2d.png')});
    if(spatial.has(id)){
      await page.getByRole('button',{name:'Esplora la geometria 3D'}).click();
      await page.locator('.ft-scene canvas').waitFor();
      await page.waitForFunction(()=>!!document.querySelector('.ft-scene canvas')?.getContext('webgl2'),{timeout:30000});
      await page.waitForTimeout(250);
      const before=await page.locator('.ft-scene canvas').screenshot();
      await page.getByRole('button',{name:'Ruota a destra',exact:true}).click();
      await page.waitForTimeout(80);
      const after=await page.locator('.ft-scene canvas').screenshot({path:resolve(output,id+'-3d.png')});
      if(createHash('sha256').update(before).digest('hex')===createHash('sha256').update(after).digest('hex'))throw Error('Camera has no visible effect: '+id);
      entry.threeD=true;
      await page.getByRole('button',{name:'Sezione e diagramma 2D'}).click();
    }
    report.models.push(entry);
  }
  await page.getByLabel('Esperienza',{exact:true}).selectOption('ideal-gas');
  await page.getByLabel('La tua previsione',{exact:true}).fill('La pressione cresce al diminuire del volume.');
  await page.getByRole('button',{name:'Esplora la geometria 3D'}).click();
  await page.locator('.ft-scene canvas').waitFor();
  await page.locator('.ft-scene canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.getByRole('button',{name:'Riprendi in 2D'}).click();
  if(await page.getByLabel('La tua previsione',{exact:true}).inputValue()!=='La pressione cresce al diminuire del volume.')throw Error('Context loss erased prediction');
  report.checks.contextLossPreservesDraft=true;
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [name,viewport] of [['tablet',report.environment.tabletViewport],['mobile',report.environment.mobileViewport]]){
    await page.setViewportSize(viewport);await page.getByLabel('Esperienza',{exact:true}).selectOption('venturi');
    const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
    if(geometry.scroll>geometry.width+1)throw Error('Horizontal page overflow: '+name+' '+JSON.stringify(geometry));
    await page.locator('.fluid-thermo').screenshot({path:resolve(output,name+'-venturi.png')});
  }
  report.checks.reducedMotionAndResponsive=true;
  await page.getByLabel('La tua previsione',{exact:true}).focus();await page.keyboard.type('Confronto indipendente');await page.keyboard.press('Tab');
  if(await page.evaluate(()=>document.activeElement?.textContent)!=='Confronta con il modello')throw Error('Prediction keyboard order');
  await page.keyboard.press('Enter');await page.locator('.ft-observation strong').waitFor();report.checks.keyboardPrediction=true;
  await page.setViewportSize(report.environment.desktopViewport);await page.getByLabel('Esperienza',{exact:true}).selectOption('hydrostatic');
  const latencies=await page.evaluate(async()=>{
    const slider=document.querySelector('.ft-parameter input[type=range][aria-label*="Profondità"]'),samples=[];
    for(let i=0;i<20;i++){
      const start=performance.now();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(slider,String(2+i*.1));
      slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));
      await new Promise(requestAnimationFrame);samples.push(performance.now()-start);
    }
    return samples;
  });
  latencies.sort((a,b)=>a-b);report.inputToNextFrame={model:'hydrostatic',count:latencies.length,p95ms:latencies[Math.ceil(latencies.length*.95)-1],measurement:'Synthetic input dispatch to next requestAnimationFrame in Chromium; not a whole-product/device benchmark'};
  await page.close();
}catch(error){report.failure=error.stack||String(error);process.exitCode=1;if(page){report.pageText=await page.locator('body').innerText().catch(()=>null);await page.screenshot({path:resolve(output,'failure.png'),fullPage:true}).catch(()=>{});}}
finally{await browser.close();}
if(!report.failure){
  const disabled=await chromium.launch({headless:true,args:['--disable-webgl','--no-sandbox']});
  try{
    const page=await disabled.newPage();await page.goto(base,{waitUntil:'networkidle',timeout:60000});
    await page.getByLabel('Esperienza',{exact:true}).selectOption('ideal-gas');
    await page.getByLabel('La tua previsione',{exact:true}).fill('Bozza conservata senza WebGL');
    await page.getByRole('button',{name:'Esplora la geometria 3D'}).click();
    await page.getByRole('button',{name:'Riprendi in 2D'}).click();
    report.checks.noWebGLPreservesDraft=await page.getByLabel('La tua previsione',{exact:true}).inputValue()==='Bozza conservata senza WebGL';
    await page.locator('.ft-visual').screenshot({path:resolve(output,'no-webgl-fallback.png')});
    if(!report.checks.noWebGLPreservesDraft)throw Error('WebGL fallback lost state');
  }catch(error){report.failure=error.stack||String(error);process.exitCode=1;}
  finally{await disabled.close();}
}
await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2)+'\n');
process.stdout.write(JSON.stringify({models:report.models.length,threeD:report.models.filter(m=>m.threeD).length,checks:report.checks,failure:report.failure||null,inputToNextFrame:report.inputToNextFrame})+'\n');
