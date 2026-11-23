// Compare the deployed instruments with the two reference measurements in each committed edition.
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium, webkit} from 'playwright';

const base=process.env.OFFICINA_BASE_URL;
assert.equal(new URL(base).protocol,'https:');
const flat=process.argv.includes('--senza-webgl'), mode=flat?'tavola':'webgl2';
const directory=process.env.ASTRA_EVIDENCE || 'prove-https';
await mkdir(directory,{recursive:true});
const catalog=new Map();
for (let c=1;c<=6;c++) {
  const file=new URL('../content/esperienze-C'+c+'.json',import.meta.url);
  for(const record of JSON.parse(await readFile(file,'utf8'))) catalog.set(record.id,record);
}
const browser=flat?await webkit.launch():await chromium.launch({args:['--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:flat?{width:390,height:844}:{width:1280,height:900},hasTouch:flat,reducedMotion:'reduce'});
if(flat) await context.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};
});
const page=await context.newPage(), results=[];
page.setDefaultTimeout(18000);
const headers={'X-Astra-Request':'1'};
const close=(value,expected)=>Math.abs(value-expected)<=Math.max(0.000001,Math.abs(expected)*0.0007);
try{
  assert.equal((await context.request.post(base+'/api/demo',{data:{},headers})).status(),200);
  const index=await (await context.request.get(base+'/api/simulazioni')).json();
  const ids=index.lessons.flatMap(lesson=>lesson.experiments.map(experiment=>experiment.id));
  assert.deepEqual([...ids].sort(),[...catalog.keys()].sort());
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  for(const id of ids){
    const record=catalog.get(id);
    await page.goto(base+'/#banco/'+id);
    const bench=page.locator('[data-bench="'+id+'"]');
    await bench.locator(flat?'.bench-diagram:visible':'canvas:visible').first().waitFor();
    assert.equal(await bench.locator('h1').innerText(),record.title);
    if(!flat) assert.ok(await bench.locator('canvas:visible').first().evaluate(c=>{const g=c.getContext('webgl2');return g && !g.isContextLost();}),id);
    await bench.locator('[name=prediction]').first().check();
    await bench.locator('[data-predict] button').click();
    const param=bench.locator('[name=x]'), reading=bench.locator('[data-readings] div').nth(1).locator('strong');
    const samples=[];
    for(const [x,want] of record.references){
      if(record.control.choices) await param.selectOption(String(x));
      else await param.fill(String(x));
      const value=await reading.innerText();
      const got=Number(value.trim().split(/\s/)[0].replace(/\./g,'').replace(',','.'));
      assert.ok(close(got,want),id+' · '+value+' / '+want);
      samples.push({x,value,reference:want});
    }
    results.push({id,lesson:record.skill,course:record.course,samples});
    if(results.length%25===0) console.log(mode,results.length);
  }
  assert.deepEqual(errors,[]);
  await writeFile(path.join(directory,mode+'.json'),JSON.stringify({domain:base,mode,engine:browser.version(),lessons:index.lessons.length,results},null,2)+'\n');
  console.log(mode,results.length,'banchi',2*results.length,'letture');
}catch(failure){
  console.error(JSON.stringify({count:results.length,state:await page.locator('main').innerText().then(value=>value.slice(-350)),hash:new URL(page.url()).hash}));
  throw failure;
}finally{
  await context.request.post(base+'/api/logout',{data:{},headers}).catch(()=>{});
  await browser.close();
}
