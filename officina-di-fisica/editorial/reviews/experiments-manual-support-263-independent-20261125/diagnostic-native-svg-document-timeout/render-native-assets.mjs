// Standalone native SVG documents only. No application, DB, auth route or UI.
import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const base=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(base,'../../..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const handoff=JSON.parse(await readFile(path.join(base,'author-handoff.json'),'utf8'));
const files=handoff.files.filter(x=>x.path.endsWith('.svg'));
if(files.length!==8)throw Error('Expected eight frozen SVG inputs');
const out=path.join(base,'native-assets');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const cases=[];
try{
 const page=await browser.newPage({deviceScaleFactor:1});
 for(const file of files){
  const full=path.join(app,file.path),raw=await readFile(full);
  if(sha(raw)!==file.sha256)throw Error('Frozen asset changed');
  const text=raw.toString(),width=Number(text.match(/\bwidth="(\d+)"/)[1]),height=Number(text.match(/\bheight="(\d+)"/)[1]);
  await page.setViewportSize({width,height});
  await page.goto(pathToFileURL(full).href,{waitUntil:'load'});
  const documentInfo=await page.evaluate(()=>{
   const root=document.documentElement;
   if(root.namespaceURI!=='http://www.w3.org/2000/svg')throw Error('Not a native SVG document');
   return {root:root.localName,width:root.width.baseVal.value,height:root.height.baseVal.value,
    text:[...document.querySelectorAll('text')].map(el=>{const b=el.getBoundingClientRect();return{text:el.textContent,x:b.x,y:b.y,width:b.width,height:b.height};}),
    title:document.querySelector('title')?.textContent,description:document.querySelector('desc')?.textContent};
  });
  const target=path.join(out,path.basename(file.path,'.svg')+'.png');
  await page.screenshot({path:target,fullPage:true});
  const png=await readFile(target);
  cases.push({asset:file.path,assetSha256:file.sha256,png:path.relative(app,target),pngSha256:sha(png),nativeWidth:width,nativeHeight:height,documentInfo});
 }
 await page.close();
 const result={phase:'NATIVE_STANDALONE_SVG_RENDER_NOT_PRODUCT_UI',browser:browser.version(),deviceScaleFactor:1,cases,
  svgDocumentsRendered:cases.length,applicationUiCases:0,scientificApproval:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
 await writeFile(path.join(base,'native-render.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({nativeSvgDocuments:cases.length,applicationUiCases:0}));
}finally{await browser.close();}
