import {chromium} from '/private/tmp/cric-resident-integrator/officina-di-fisica/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const family=process.argv[2],batch=process.argv[3];
if(!family||!batch)throw Error('Expected explicit family and batch arguments');
const dir='/private/tmp/cric-author-a-resident/officina-di-fisica/output/playwright/u7-author-260-a/'+batch;
await mkdir(dir,{recursive:true});
const input='/private/tmp/cric-author-a-resident/officina-di-fisica/editorial/assets/'+family+'-progressive.svg';
const bytes=await readFile(input),svg=bytes.toString('utf8');
const hash=createHash('sha256').update(bytes).digest('hex');
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:640,height:800},deviceScaleFactor:1});
 await page.setContent('<!doctype html><html><head><style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>'+svg+'</body></html>');
 await page.evaluate(()=>document.fonts.ready);
 const size=await page.locator('svg').boundingBox();
 const textBounds=await page.locator('svg text').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBBox();return {text:n.textContent,x:b.x,y:b.y,width:b.width,height:b.height}}));
 await page.screenshot({path:dir+'/full-native.png',fullPage:true});
 const png=await readFile(dir+'/full-native.png');
 const result={scope:'Author browser-native rendering of the authored SVG only; no product UI or scientific approval',sourceSvgSha256:hash,svgBoundingBox:size,pngWidth:png.readUInt32BE(16),pngHeight:png.readUInt32BE(20),textBounds,observedExit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
 if(result.pngWidth<Math.ceil(size.width)||result.pngHeight<Math.ceil(size.height))throw Error('Screenshot does not cover complete intrinsic SVG');
 await writeFile(dir+'/render.json',JSON.stringify(result,null,2)+'\n');
 console.log(batch,'full pinned SVG',size,'PNG',result.pngWidth,result.pngHeight,'source SHA',hash);
}finally{await browser.close();}
