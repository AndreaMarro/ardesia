import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile, writeFile, mkdir, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import vm from 'node:vm';

const dossier = fileURLToPath(new URL('../', import.meta.url));
const product = path.resolve(dossier,'../../../../officina-di-fisica');
const req = createRequire(path.join(process.env.OFFICINA_DEPS || product,'package.json'));
const {chromium,webkit}=req('playwright');
const axeFile=req.resolve('axe-core/axe.min.js');
const destination=process.argv[2] || await mkdtemp(path.join(tmpdir(),'tre-direzioni-'));
await mkdir(destination,{recursive:true});
const file=pathToFileURL(path.join(dossier,'confronto.html')).href;
const lib=await readFile(path.join(dossier,'prototipi/moto.js'),'utf8');
const model=vm.runInNewContext(lib+'\nmoto');
const records=JSON.parse(await readFile(path.join(product,'content/C1.json'),'utf8'));
const source=records.find(r=>r.id==='C1-Q027');
assert.equal(source.version,2);
assert.equal(model.osserva(5).x,source.answer.value);
let clockSamples=0;
for(let d=0;d<=8;d++) {
  let position=0, distance=0;
  for(let half=0;half<=(4+d)*2;half++) {
    if(half){const velocity=half<=8?3:-2;position+=velocity/2;distance+=Math.abs(velocity)/2}
    const frame=model.osserva(d,half/2);
    assert.equal(frame.x,position);assert.equal(frame.distanza,distance);assert.ok(distance>=Math.abs(position));
    clockSamples++;
  }
}
for(const invalid of [-1,8.5,9,NaN])assert.throws(()=>model.osserva(invalid));
const cases=[],auditTags=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa'];
const sourceDemo=await readFile(path.join(dossier,'confronto.html'));
const ingressi=[];
const summary={source:{id:source.id,rev:source.version,result_m:source.answer.value},clockSamples,htmlBytes:sourceDemo.length,ingressi,
  playwright:req('playwright/package.json').version,axe:req('axe-core/package.json').version,axeTags:auditTags,cases};
const screens=[['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['stretto',320,740]];
async function check(page,key,selector){
  await page.locator(selector).first().waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const dimensions=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
  assert.ok(dimensions[1]<=dimensions[0]+1,key+' overflow '+dimensions);
  assert.equal(await page.locator('h1:visible').count(),1,key+' h1');
}
async function noteAxe(p,c,label) {
  await p.addScriptTag({path:axeFile});
  const raw=await p.evaluate(async tags=>await window.axe.run(document,{runOnly:{type:'tag',values:tags}}),auditTags);
  c.axe.push({state:label,violations:raw.violations.map(v=>[v.id,v.nodes.length]),review:raw.incomplete.map(v=>[v.id,v.nodes.length])});
  if(raw.violations.length){
    const suffix=[c.browser,c.format,c.concept||'indice',label].join('-');
    await writeFile(path.join(destination,'axe-'+suffix+'.json'),JSON.stringify(raw.violations,null,2));
    await p.screenshot({path:path.join(destination,'axe-'+suffix+'.png')});
  }
  assert.deepEqual(raw.violations.map(v=>[v.id,v.nodes.map(n=>n.target)]),[],c.browser+' '+c.format+' '+label);
}
async function fill(p,s,v){await p.locator(s).fill(v)}
async function screenshot(p,c,label) {
  if(c.browser!=='chromium'||!['desktop','mobile'].includes(c.format))return;
  await p.screenshot({path:path.join(destination,label+'-'+c.format+'.png'),animations:'disabled'});
}
async function finish(p,c) {
  await p.locator('#to-transfer').click();
  await check(p,'trasferimento','#tx');
  await fill(p,'#tx','26');await p.getByRole('button',{name:'Controlla il risultato'}).click();
  assert.match(await p.locator('#tx-message').innerText(),/distanza totale/);
  await fill(p,'#tx','2');await p.getByRole('button',{name:'Controlla il risultato'}).click();
  assert.match(await p.locator('#tx-message').innerText(),/da che parte dello zero/);
  await fill(p,'#tx','−2,0');await p.getByRole('button',{name:'Controlla il risultato'}).click();
  assert.match(await p.locator('#tx-message').innerText(),/Hai ottenuto −2 m/);
  await noteAxe(p,c,'trasferimento');
  await p.reload();await check(p,'ripresa','#tx');
  assert.match(await p.locator('#tx-message').innerText(),/Hai ottenuto −2 m/);
  await p.getByRole('button',{name:'Ricomincia la prova'}).click();
}
for(const [browserName,engine] of Object.entries({chromium,webkit})){
  const browser=await engine.launch();
  try{
    for(const [format,width,height] of screens){
      const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=390,hasTouch:width<=768,reducedMotion:'reduce'});
      const page=await context.newPage(), errors=[], network=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
      page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
      await context.route(/^https?:/, r=>r.abort());
      if(browserName==='chromium')await context.setOffline(true);
      await page.goto(file);await check(page,'indice','h1');
      const index={browser:browserName,format,axe:[]};ingressi.push(index);
      assert.match(await page.locator('.sensor svg').getAttribute('aria-label'),/più tre metri al secondo/);
      assert.equal(await page.getByRole('navigation').getByRole('link').count(),3);
      await noteAxe(page,index,'scelta');
      await screenshot(page,{browser:browserName,format},'confronto');
      await page.keyboard.press(browserName==='webkit'?'Alt+Tab':'Tab');assert.equal(await page.locator(':focus').innerText(),'Vai al contenuto');
      await page.keyboard.press('Enter');assert.equal(await page.locator(':focus').getAttribute('id'),'lavoro');
      for(const key of ['passo','campo','margine']){
        const c={browser:browserName,version:browser.version(),format,width,height,concept:key,axe:[]};
        cases.push(c);
        await page.locator('a[href="#'+key+'"]').click();
        const first={passo:'#prediction .primary',campo:'#predict',margine:'#notebook .primary'}[key];
        await check(page,key,first);
        c.firstAction=await page.locator(first).evaluate(b=>({bottom:Math.round(b.getBoundingClientRect().bottom),inViewport:b.getBoundingClientRect().bottom<=innerHeight}));
        assert.ok(c.firstAction.inViewport,key+' azione iniziale fuori schermo a '+width);
        await screenshot(page,c,key);await noteAxe(page,c,'ingresso');
        if(width===320){
          const spacing=await page.addStyleTag({content:'body *:not(svg *){line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p:not(:empty){margin-bottom:2em!important}'});
          await check(page,'spaziatura '+key,first);await spacing.evaluate(e=>e.remove());
          c.textSpacingReflow=true;
        }
        if(key==='passo'){
          await page.locator('#prediction .primary').click();assert.match(await page.locator('#prediction-message').innerText(),/Scegli/);
          await page.locator('#hint summary').click();
          await page.locator('.plot svg[aria-label*="Ogni casella"]').waitFor();
          await page.getByLabel('Più indietro').check();await page.locator('#prediction .primary').click();
          assert.match(await page.locator('.session').innerText(),/Hai scelto «Più indietro»/);
          assert.equal(await page.locator('.plot pattern rect').count(),2);
          assert.match(await page.locator('.session').innerText(),/22 m/);
          await screenshot(page,c,'passo-controllo');await noteAxe(page,c,'riscontro');
        } else if(key==='campo'){
          const scene=page.locator('#plot svg');
          assert.equal(await page.getByRole('button',{name:'Pista 3D'}).getAttribute('aria-pressed'),'true');
          assert.match(await scene.getAttribute('aria-label'),/a 0 metri al secondo 0/);
          const marker=()=>scene.locator('circle').last().getAttribute('cx');
          const origin=await marker();
          await page.locator('#timeline').focus();await page.keyboard.press('End');
          assert.equal(await page.locator('#time').innerText(),'4 s');assert.equal(await page.locator('#instant').innerText(),'+12 m');
          assert.equal(await scene.locator('[data-tratto=andata]').count(),1);assert.equal(await scene.locator('[data-tratto=ritorno]').count(),0);
          assert.notEqual(await marker(),origin);
          const dial=await marker();await page.selectOption('#angle','0');assert.notEqual(await marker(),dial);
          await page.locator('#table').click();assert.equal(await page.locator('tbody tr').first().innerText(),'Andata\t4\t+3\t+12');
          assert.equal(await page.locator('tbody tr').last().innerText(),'Ritorno\t0\t−2\t0');
          await page.locator('#chart').click();assert.match(await scene.getAttribute('aria-label'),/Cursore al secondo 4/);
          await page.selectOption('#duration','0');assert.equal(await page.locator('#duration').inputValue(),'0');assert.ok(await page.locator('#less').isDisabled());
          await page.selectOption('#duration','8');assert.ok(await page.locator('#more').isDisabled());
          for(let i=0;i<3;i++)await page.locator('#less').click();
          await page.locator('#predict').click();await page.getByLabel('Più avanti').check();await page.locator('#prediction .primary').click();
          assert.match(await page.locator('#phase').innerText(),/\+2 m/);
          await page.locator('#pista').click();await page.locator('#timeline').focus();await page.keyboard.press('Home');
          for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');
          assert.match(await page.locator('#instant').innerText(),/\+12 m/);
          const right=await marker();
          await page.selectOption('#angle','-30');
          assert.notEqual(await marker(),right);
          await page.locator('#timeline').focus();await page.keyboard.press('End');
          assert.match(await scene.getAttribute('aria-label'),/\+2 metri al secondo 9/);
          assert.equal(await scene.locator('[data-tratto]').count(),2);
          await page.locator('#table').click();assert.equal(await page.locator('tbody tr').last().innerText(),'Ritorno\t5\t−2\t−10');
          await page.reload();assert.equal(await page.locator('#instant').innerText(),'+2 m');
          assert.equal(await page.locator('#table').getAttribute('aria-pressed'),'true');
          await page.locator('#pista').click();await page.evaluate(()=>scrollTo(0,0));
          await screenshot(page,c,'campo-pista');await noteAxe(page,c,'pista');
          await page.locator('#more').click();assert.equal(await page.locator('#timeline').getAttribute('max'),'4');assert.equal(await page.locator('#instant').innerText(),'0 m');assert.equal(await page.locator('#phase').count(),0);
          await page.locator('#predict').click();await page.getByLabel('Alla partenza').check();await page.locator('#prediction .primary').click();
          assert.match(await page.locator('#phase').innerText(),/finale 0 m/);
        } else {
          await page.getByText('Leggi la fonte',{exact:true}).click();
          assert.match(await page.locator('.book-tools details').innerText(),/C1-Q027, versione 2/);
          assert.ok((await page.locator('.book-tools details').innerText()).includes(source.prompt));
          await page.getByText('Leggi la fonte',{exact:true}).click();
          await fill(page,'#n0','12');await fill(page,'#n1','10');await fill(page,'#n2','22');await page.locator('#notebook .primary').click();
          assert.equal(await page.locator(':focus').getAttribute('id'),'n1');assert.match(await page.locator('#note1').innerText(),/negativo/);
          assert.equal(await page.locator('#formula2').innerText(),'+12 m + (+10 m)');
          await screenshot(page,c,'margine-errore');await noteAxe(page,c,'errore');
          await page.emulateMedia({media:'print'});assert.ok(await page.locator('.print-only').isVisible());assert.ok(await page.locator('#notebook').isHidden());
          if(browserName==='chromium'&&format==='desktop')await page.pdf({path:path.join(destination,'scheda-margine.pdf'),preferCSSPageSize:true});
          await page.emulateMedia({media:'screen'});await fill(page,'#n1','−10');await fill(page,'#n2','+2');await page.locator('#notebook .primary').click();
          assert.match(await page.locator('#phase').innerText(),/tre passaggi/);
          assert.equal(await page.locator('#formula2').innerText(),'+12 m + (−10 m)');
        }
        await finish(page,c);
        await page.locator('header a').click();
      }
      if(format==='desktop'){
        for(const view of ['chart','table']){
          await page.evaluate(v=>{
            const key='ardesia:studio-concept:1.0';
            const saved=JSON.parse(sessionStorage.getItem(key));
            saved.campo={...saved.campo,view:v,space:false,stage:'start',duration:7};
            sessionStorage.setItem(key,JSON.stringify(saved));
          },view);
          await page.reload();await page.getByRole('link',{name:/Campo/}).click();
          assert.equal(await page.locator('#duration').inputValue(),'7');
          assert.equal(await page.locator(view==='chart'?'#pista':'#table').getAttribute('aria-pressed'),'true');
          await page.locator('header a').click();
        }
        index.ripresaPrimaRevisione=true;
      }
      assert.deepEqual(network,[]);assert.deepEqual(errors,[]);await context.close();
    }
  } finally {await browser.close()}
}
await writeFile(path.join(destination,'esiti.json'),JSON.stringify(summary,null,2)+'\n');
console.log(cases.length+' percorsi completi, '+[...cases,...ingressi].reduce((n,c)=>n+c.axe.length,0)+' scansioni axe, '+clockSamples+' campioni fisici. '+destination);
