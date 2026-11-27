import {chromium} from '/private/tmp/cric-resident-integrator/officina-di-fisica/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const home=process.cwd()+'/editorial/reviews/c6-transfer-v1-independent-evidence';
const browser=await chromium.launch({channel:'chrome'});let records=[];
try{for(const id of ['02','03','04','05','06']){
 const name='c6-tr'+id,svg=await readFile(home+'/'+name+'.svg','utf8');
 const page=await browser.newPage({viewport:{width:640,height:500},deviceScaleFactor:1});
 await page.setContent('<!doctype html><style>html,body{margin:0;padding:0}svg{display:block;width:460px;height:216px}</style>'+svg);
 await page.evaluate(()=>document.fonts.ready);
 const clipping=await page.locator('svg text').evaluateAll(ns=>ns.map(n=>{const b=n.getBBox();return {text:n.textContent,x:b.x,y:b.y,width:b.width,height:b.height};}).filter(b=>b.x<0||b.x+b.width>460||b.y<0||b.y+b.height>216));
 if(clipping.length)throw Error(JSON.stringify(clipping));
 const box=await page.locator('svg').boundingBox();await page.locator('svg').screenshot({path:home+'/'+name+'-native.png'});
 records.push({asset:name+'.svg',assetSha256:createHash('sha256').update(svg).digest('hex'),box,textClipping:clipping});await page.close();
}}finally{await browser.close();}
await writeFile(home+'/native-five-render.json',JSON.stringify({scope:'independent full SVG-only rendering, no product UI',records},null,2)+'\n');
console.log(JSON.stringify(records));
