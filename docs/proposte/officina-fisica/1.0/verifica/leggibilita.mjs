import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {mkdtemp,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
const root=fileURLToPath(new URL('../',import.meta.url)),product=path.resolve(root,'../../../../officina-di-fisica');
const require=createRequire(path.join(process.env.OFFICINA_DEPS||product,'package.json'));
const {chromium}=require('playwright');
const dir=process.argv[2]||await mkdtemp(path.join(tmpdir(),'leggibilita-'));
await mkdir(dir,{recursive:true});
const result=[];
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1536,height:1024}});
 for(const concept of ['passo','campo','margine']){
  await page.goto(pathToFileURL(path.join(root,'confronto.html')).href+'#'+concept);
  await page.evaluate(()=>document.fonts.ready);
  function read(){
   const body=document.body,cs=getComputedStyle(body);
   const rgb=s=>{const e=document.createElement('span');e.style.color=s;body.append(e);const out=getComputedStyle(e).color.match(/[\d.]+/g).slice(0,3).map(Number);e.remove();return out};
   const l=s=>rgb(s).map(c=>{const n=c/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   const token=s=>cs.getPropertyValue('--'+s).trim();
   const ratio=(a,b)=>{const A=l(token(a)),B=l(token(b));return +((Math.max(A,B)+.05)/(Math.min(A,B)+.05)).toFixed(2)};
   return {ink:ratio('ink','paper'),action:ratio('on-action','action'),focus:ratio('focus','paper'),positive:ratio('plus','soft'),negative:ratio('minus','soft')};
  }
  const ratios=await page.evaluate(read);
  assert.ok(ratios.ink>=4.5&&ratios.action>=4.5&&ratios.focus>=3&&ratios.positive>=3&&ratios.negative>=3,concept+' '+JSON.stringify(ratios));
  await page.screenshot({path:path.join(dir,concept+'-1536.png')});
  await page.setViewportSize({width:640,height:800});
  // Double computed HTML text sizes, independently of the device pixel ratio.
  await page.evaluate(()=>{
   const entries=[...document.querySelectorAll('header *,main *')].filter(e=>e instanceof HTMLElement);
   const sizes=entries.map(e=>parseFloat(getComputedStyle(e).fontSize));
   entries.forEach((e,i)=>{e.style.fontSize=2*sizes[i]+'px'});
  });
  const widths=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);assert.ok(widths[1]<=widths[0]+1,concept+' testo 200% '+widths);
  const overflow=await page.locator('button:visible, summary:visible, h1:visible, h2:visible, legend:visible').evaluateAll(nodes=>nodes.filter(n=>n.clientWidth>0 && n.scrollWidth>n.clientWidth+1).map(n=>n.innerText));
  assert.deepEqual(overflow,[],concept+' elementi tagliati');
  result.push({concept,ratios,testo200:{cssViewport:640,documentWidth:widths[1],textControlsClipped:overflow.length}});
  await page.setViewportSize({width:1536,height:1024});
  // Re-read the document on the next concept so per-element stress styles cannot leak between cases.
  await page.goto('about:blank');
 }
 await writeFile(path.join(dir,'leggibilita.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
}finally{await browser.close()}
