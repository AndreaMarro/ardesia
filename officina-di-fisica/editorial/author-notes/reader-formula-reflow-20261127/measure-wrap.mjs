import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'../../..');
const inputs=JSON.parse(await fs.readFile(path.join(here,'observed-inputs.json')));
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:320,height:900}});
 const origin='https://cric-reader-layout.invalid';
 const files=new Map([['/style.css','text/css'],['/vendor/katex.min.css','text/css'],['/vendor/katex.min.js','text/javascript']]);
 for(const name of await fs.readdir(path.join(app,'static/vendor/fonts')))files.set('/vendor/fonts/'+name,'application/octet-stream');
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin||url.search)return route.abort();
  if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/vendor/katex.min.css"><link rel="stylesheet" href="/style.css"><article class="reader"><div class="lettura-contenuto"><div class="copy"></div></div></article><script src="/vendor/katex.min.js"></script>'});
  const contentType=files.get(url.pathname);
  if(!contentType)return route.abort();
  return route.fulfill({contentType,body:await fs.readFile(path.join(app,'static',url.pathname.slice(1)))});
 });
 await page.goto(origin+'/');
 await page.evaluate(items=>{
  const copy=document.querySelector('.copy');
  for(const item of items){
   const block=document.createElement('div');
   block.className='math';
   block.style.boxSizing='border-box';
   block.style.width=item.containerClientWidth+2+'px';
   copy.append(block);
   window.katex.render(item.sourceTeX,block,{displayMode:true,throwOnError:false,strict:false,trust:false});
  }
 },inputs);
 await page.evaluate(()=>document.fonts.ready);
 const observations=()=>page.evaluate(()=>[...document.querySelectorAll('.math')].map(node=>({
  width:node.clientWidth,scroll:node.scrollWidth,
  htmlWidth:node.querySelector('.katex-html')?.getBoundingClientRect().width,
  tallestBase:Math.max(...[...node.querySelectorAll('.katex-html > .base')].map(n=>n.getBoundingClientRect().height)),
  htmlHeight:node.querySelector('.katex-html')?.getBoundingClientRect().height,
  accessibleMath:node.querySelector('.katex-mathml')?.innerHTML??null,
 })));
 const baseline=await observations();
 await page.addStyleTag({content:'.reader .lettura-contenuto .math .katex-display > .katex { white-space: normal; }'});
 if(process.argv.includes('--spacing-breaks')){
  await page.evaluate(items=>{
   const blocks=[...document.querySelectorAll('.math')];
   items.forEach((item,i)=>{
    const tex=item.sourceTeX.replaceAll(/\\q(?:quad|uad)\b/g,command=>`\\allowbreak${command}`);
    if(tex===item.sourceTeX)return;
    const visual=document.createElement('div');
    window.katex.render(tex,visual,{displayMode:true,throwOnError:false,strict:false,trust:false,output:'html'});
    const output=visual.querySelector('.katex-html');
    if(!output)return;
    output.setAttribute('aria-hidden','true');
    blocks[i].querySelector('.katex-html')?.replaceWith(output);
   });
  },inputs);
  await page.evaluate(()=>document.fonts.ready);
 }
 const candidate=await observations();
 assert.equal(baseline.length,inputs.length);
 const rows=inputs.map((row,i)=>{
  const before=baseline[i],after=candidate[i];
  assert.ok(before.accessibleMath);
  assert.equal(before.accessibleMath,after.accessibleMath);
  assert.equal(before.width,after.width);
  const {accessibleMath:baselineMath,...previous}=before;
  const {accessibleMath:candidateMath,...current}=after;
  return {...row,previous,current};
 });
 const report={scope:'Component probe using measured TeX and box widths with the local product styles and KaTeX. Does not run reader journeys.',browserVersion:browser.version(),
  formulas:rows.length,baselineOverflow:rows.filter(({previous:r})=>r.scroll>r.width+1).length,
  candidateOverflow:rows.filter(({current:r})=>r.scroll>r.width+1).length,
  accessibleMathUnchanged:true,rows};
 await fs.writeFile(path.join(here,process.argv.includes('--spacing-breaks')?'wrapping-probe-spacing-breaks.json':'wrapping-probe.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(Object.fromEntries(Object.entries(report).filter(([k])=>k!=='rows'))));
}finally{await browser.close();}
