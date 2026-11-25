import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const app='/private/tmp/cric-resident-integrator/officina-di-fisica',out='/private/tmp/cric-piano2d-independent-final';
const {chromium}=createRequire(app+'/package.json')('playwright');
const hash=x=>createHash('sha256').update(x).digest('hex');
const inputs=['static/js/banchi/tavola.js','static/js/banchi/modelli/piano.js','static/js/banchi/misure.js','static/banchi.css','static/style.css','static/type/worksans2.woff2'];
const before=Object.fromEntries(await Promise.all(inputs.map(async f=>[f,hash(await readFile(app+'/'+f))])));
assert.equal(before['static/js/banchi/tavola.js'],'9082781b0fbf88f421742cf8f10f3f098f51e9aac131118a5691e1b6e11cc4a8');
globalThis.document={querySelector:()=>null};
const {drawing}=await import(app+'/static/js/banchi/tavola.js');
const {solve}=await import(app+'/static/js/banchi/modelli/piano.js');
const svgs=[];
for(let angle=0;angle<=55;angle++){
 const p={m:2,angle,F:0,ms:.4,mk:.25};svgs.push(drawing('piano',p,solve(p),0,2,'Piano inclinato e attrito'));
}
const browser=await chromium.launch({headless:true}),records=[];
try{
 for(const width of [1440,768,320]){
  const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
  await page.route('https://review.invalid/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/frame')return route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="it"><head><link rel="stylesheet" href="/static/style.css"><link rel="stylesheet" href="/static/banchi.css"></head><body><section class="bench-stage"><div data-drawing></div></section></body></html>'});
   const file=path.startsWith('/static/')?app+path:path.startsWith('/type/')?app+'/static'+path:null;
   if(!file||path.includes('..'))return route.abort();
   const body=await readFile(file);return route.fulfill({body,contentType:file.endsWith('.css')?'text/css':file.endsWith('.woff2')?'font/woff2':'application/octet-stream'});
  });
  await page.goto('https://review.invalid/frame');
  for(let angle=0;angle<=55;angle++){
   await page.locator('[data-drawing]').evaluate((e,svg)=>{e.innerHTML=svg;},svgs[angle]);
   await page.evaluate(()=>document.fonts.ready);
   const record=await page.locator('svg').evaluate(svg=>{
    const box=e=>{const b=e.getBBox();return{x:b.x,y:b.y,width:b.width,height:b.height};};
    const intersects=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
    const view=svg.viewBox.baseVal;const texts=[...svg.querySelectorAll('text')].map(e=>({text:e.textContent,box:box(e)}));
    const geometry=[...svg.querySelectorAll('path,circle')].map(e=>({d:e.getAttribute('d'),box:box(e)}));
    const overlaps=[];
    for(let i=0;i<texts.length;i++){
     for(const g of geometry)if(intersects(texts[i].box,g.box))overlaps.push({text:texts[i].text,geometry:g.d});
     for(let j=i+1;j<texts.length;j++)if(intersects(texts[i].box,texts[j].box))overlaps.push({text:texts[i].text,other:texts[j].text});
    }
    const outside=[...texts,...geometry].filter(({box:b})=>b.x<view.x||b.y<view.y||b.x+b.width>view.x+view.width||b.y+b.height>view.y+view.height);
    return {viewBox:[view.x,view.y,view.width,view.height],texts,geometryBounds:geometry.map(x=>x.box),overlaps,outside,font:getComputedStyle(svg.querySelector('text')).fontFamily,fontLoaded:document.fonts.check('14px "Work Sans"')};
   });
   assert.equal(record.fontLoaded,true);assert.ok(record.font.includes('Work Sans'));assert.deepEqual(record.overlaps,[]);assert.deepEqual(record.outside,[]);
   const screenshot=[0,1,18,55].includes(angle)?`angle-${angle}-${width}.png`:null;
   if(screenshot)await page.locator('svg').screenshot({path:out+'/'+screenshot});
   records.push({width,angle,...record,screenshot});
  }
  await page.close();
 }
}finally{await browser.close();}
const after=Object.fromEntries(await Promise.all(inputs.map(async f=>[f,hash(await readFile(app+'/'+f))])));assert.deepEqual(after,before);
await writeFile(out+'/browser-report.json',JSON.stringify({scope:'Actual drawing function rendered in Chromium with unchanged application CSS and self-hosted Work Sans; no full canonical app-flow credit',inputSha256:before,inputStable:true,cases:records.length,records,humanApproval:'NOT_RUN',publication:'DRAFT'},null,2)+'\n');
console.log(JSON.stringify({cases:records.length,overlaps:0,outside:0,font:'actual Work Sans',inputStable:true}));
