import {chromium} from '/private/tmp/cric-resident-integrator/officina-di-fisica/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const family=process.argv[2],root='/private/tmp/cric-author-b-resident/officina-di-fisica',out='/private/tmp/cric-c3-b-svg';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});let result;
try{const page=await browser.newPage({viewport:{width:640,height:800},deviceScaleFactor:1});
 const svg=await readFile(root+'/editorial/assets/'+family+'-progressive.svg','utf8');
 await page.setContent('<!doctype html><style>html,body{margin:0;padding:0}svg{display:block}</style>'+svg);await page.evaluate(()=>document.fonts.ready);
 const clipping=await page.locator('svg text').evaluateAll(nodes=>nodes.map(n=>{let b=n.getBBox();return {text:n.textContent,x:b.x,y:b.y,width:b.width,height:b.height};}).filter(b=>b.x<0||b.x+b.width>640));
 if(clipping.length)throw Error(JSON.stringify(clipping));
 const box=await page.locator('svg').boundingBox();await page.screenshot({path:out+'/'+family+'-full.png',fullPage:true});result={family,scope:'native_SVG_only_not_product_UI',box,textClipping:clipping};
}finally{await browser.close();}
await writeFile(out+'/'+family+'-render.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
