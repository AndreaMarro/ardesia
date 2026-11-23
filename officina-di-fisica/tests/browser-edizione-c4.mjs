import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = fileURLToPath(new URL('../',import.meta.url));
const output = process.env.ASTRA_RESULTS || path.join(root,'var/arch/browser/edizione-c4');
const data = await mkdtemp(path.join(tmpdir(),'officina-edizione-c4-'));
const boot = "from server.store import initialize; from server.web import Handler,ThreadingHTTPServer; initialize(); s=ThreadingHTTPServer(('127.0.0.1',0),Handler); print(s.server_port,flush=True); s.serve_forever()";
const app = spawn('python3',['-uc',boot],{cwd:root,env:{...process.env,ASTRA_DATA:data},stdio:['ignore','pipe','inherit']});
const questions = JSON.parse(await readFile(path.join(root,'content/C4.json'))).filter(r=>r.kind==='question' && r.version===2);
const reports=[];
await mkdir(output,{recursive:true});

async function reveal(page,base,id) {
  await page.goto(base+'/#materiale/'+id+'/C4');
  await page.locator('#single').press('Enter');
  await page.locator('#reveal').press('Enter');
  const copy = page.locator('.feedback > .copy');
  await copy.waitFor();
  await page.locator('.feedback[data-lettore]').waitFor({state:'attached'});
  await page.waitForFunction(()=>!document.querySelector('.feedback [data-tex]'));
  return copy;
}

async function audit(page,label) {
  const result = await page.evaluate(async () => {
    const a = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']}});
    return {width:innerWidth, scroll:document.documentElement.scrollWidth,
      violations:a.violations.map(r=>({id:r.id,targets:r.nodes.map(n=>n.target)})),
      incomplete:a.incomplete.map(r=>r.id)};
  });
  assert.deepEqual(result.violations,[],label);
  assert.ok(result.scroll<=result.width+1,label+' reflow');
  return result;
}

async function evidence(page,el,name) {
  await page.evaluate(()=>document.fonts.ready);
  await el.evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
  await page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});
}

async function solution(page,base,profile,id) {
  const rec=questions.find(r=>r.id===id);
  const copy=await reveal(page,base,id);
  const img=copy.locator('figure img');
  await img.evaluate(el=>el.decode());
  assert.equal(await img.getAttribute('alt'),rec.blocks.find(b=>b.type==='figure').text);
  assert.deepEqual(await copy.locator('math annotation').allTextContents(),rec.blocks.filter(b=>b.type==='formula').map(b=>b.text));
  const widths=await copy.locator('.math').evaluateAll(nodes=>nodes.map(el=>({
    space:el.clientWidth,formula:el.querySelector('.katex-html').getBoundingClientRect().width,
    scroll:el.scrollWidth
  })));
  for (const {space,formula,scroll} of widths) assert.ok(formula<=space+1 && scroll<=space+1, id+' '+profile+' '+JSON.stringify(widths));
  await evidence(page,copy,profile+'-'+id);
  const result=await audit(page,id+' '+profile);
  const panel=page.locator('.feedback');
  await panel.getByRole('button',{name:'Un passaggio alla volta',exact:true}).press('Enter');
  const counts=[];
  const next=panel.getByRole('button',{name:'Avanti',exact:true});
  do {
    counts.push(await panel.locator('.lettura-stato').innerText());
    if (!await next.isEnabled()) break;
    await next.press('Enter');
  } while(counts.length<=rec.blocks.length);
  assert.ok(counts.length>1 && counts.length<=rec.blocks.length);
  assert.ok((await copy.locator('p:visible').last().innerText()).length>30);
  assert.equal(await panel.getByRole('button',{name:'Mostra tutto'}).evaluate(el=>document.activeElement===el),true);
  await panel.getByRole('button',{name:'Mostra tutto'}).press('Enter');
  return {...result,widths,steps:counts};
}

async function bench(page,base,name) {
  await page.goto(base+'/#banco/LAB3D-07');
  await page.locator('[name=prediction]').nth(1).check();
  await page.locator('[data-predict] button').press('Enter');
  const form=page.locator('[data-check="0"]');
  for(let stage=0;!await form.isVisible() && stage<6;stage++) await page.locator('[data-next]').press('Enter');
  const feedback=form.locator('[role=status]');
  for(const value of ['8','9']) {
    await form.locator('input').fill(value);
    await form.locator('button').press('Enter');
    const message=await feedback.innerText();
    assert.equal(message.startsWith('Corretto.'),value==='9');
    assert.match(message,/9 N\/C/);
    assert.match(message,/2,25 N\/C/);
  }
  await evidence(page,form,name+'-banco');
  return {...await audit(page,'banco '+name),worked:await feedback.innerText()};
}

try {
  const base='http://127.0.0.1:'+String((await once(app.stdout,'data'))[0]).trim();
  for(const [engine,width,height] of [[chromium,1440,900],[chromium,320,740],[webkit,1440,900],[webkit,390,844]]) {
    const name=engine.name()+'-'+width;
    const browser=await engine.launch(engine===chromium?{channel:'chrome'}:{});
    try {
      const ctx=await browser.newContext({viewport:{width,height},locale:'it-IT',reducedMotion:'reduce',hasTouch:width<500,isMobile:width<500});
      await ctx.addInitScript({path:path.join(root,'node_modules/axe-core/axe.min.js')});
      if (width<500) await ctx.addInitScript(()=>{
        const original=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.includes('webgl')?null:original.call(this,kind,...args);};
      });
      assert.ok((await ctx.request.post(base+'/api/demo',{headers:{'X-Astra-Request':'1'},data:{}})).ok());
      const page=await ctx.newPage();
      const errors=[];
      page.on('pageerror',err=>errors.push(err.message));
      const report={name,questions:{},noWebGL:width<500};
      for (const id of ['C4-Q011','C4-Q091']) report.questions[id]=await solution(page,base,name,id);
      report.bench=await bench(page,base,name);
      if (name==='chromium-320') {
        report.examples=[];
        for (const id of ['C4-E017','C4-E019']) {
          await page.goto(base+'/#materiale/'+id+'/C4');
          await page.waitForFunction(id=>document.querySelector('.reader .meta')?.textContent.includes(id) && document.querySelector('.reader [data-lettore] math'),id);
          const widths=await page.locator('.reader .math').evaluateAll(nodes=>nodes.map(el=>el.scrollWidth-el.clientWidth));
          assert.ok(widths.length && widths.every(w=>w<=1),id+' · equazioni a 320 px '+widths);
          report.examples.push(id);
        }
        report.reviewedQuestions=[];
        for (const rec of questions) {
          const copy=await reveal(page,base,rec.id);
          const rendered=await copy.evaluate(el=>[...el.children].map(b=>b.querySelector('math annotation,figcaption')?.textContent??b.textContent));
          assert.deepEqual(rendered,rec.blocks.map(b=>b.text),rec.id);
          const overflow=await copy.locator('.math').evaluateAll(nodes=>nodes.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.querySelector('math annotation')?.textContent));
          assert.deepEqual(overflow,[],rec.id+' · equazioni a 320 px');
          report.reviewedQuestions.push(rec.id);
        }
      }
      assert.deepEqual(errors,[]);
      reports.push(report);
    } finally {await browser.close();}
  }
  const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  await writeFile(path.join(output,'edizione-c4.json'),JSON.stringify({sha,reports},null,2)+'\n');
  console.log('PASS · quattro profili, dodici stati axe, 24 svolgimenti, tabulazione e banco con e senza WebGL.');
} finally {
  const closed=once(app,'exit');
  app.kill();
  await closed;
  await rm(data,{recursive:true,force:true});
}
