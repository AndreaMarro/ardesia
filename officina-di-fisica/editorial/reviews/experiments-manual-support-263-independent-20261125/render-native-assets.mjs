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
const out=path.join(base,'native-images');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const cases=[];
try{
 const page=await browser.newPage({deviceScaleFactor:1});
 for(const file of files){
  const full=path.join(app,file.path),raw=await readFile(full);
  if(sha(raw)!==file.sha256)throw Error('Frozen asset changed');
  const text=raw.toString(),width=Number(text.match(/\bwidth="(\d+)"/)[1]),height=Number(text.match(/\bheight="(\d+)"/)[1]);
  await page.setViewportSize({width,height});
  await page.setContent('<!doctype html><html><head><style>html,body{margin:0;padding:0}img{display:block}</style></head><body><img alt="Frozen standalone scientific diagram" width="'+width+'" height="'+height+'" src="data:image/svg+xml;base64,'+raw.toString('base64')+'"></body></html>');
  await page.locator('img').evaluate(async image=>{await image.decode();});
  const documentInfo=await page.locator('img').evaluate(image=>({complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,box:image.getBoundingClientRect().toJSON()}));
  if(documentInfo.naturalWidth!==width||documentInfo.naturalHeight!==height)throw Error('Native intrinsic image size differs');
  const target=path.join(out,path.basename(file.path,'.svg')+'.png');
  await page.screenshot({path:target,fullPage:false});
  const png=await readFile(target);
  cases.push({asset:file.path,assetSha256:file.sha256,png:path.relative(app,target),pngSha256:sha(png),nativeWidth:width,nativeHeight:height,documentInfo});
 }
 await page.close();
 const result={phase:'NATIVE_SVG_IMAGE_IN_MINIMAL_HTML_NOT_PRODUCT_UI',browser:browser.version(),deviceScaleFactor:1,cases,
  svgDocumentsRendered:cases.length,applicationUiCases:0,scientificApproval:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
 await writeFile(path.join(base,'native-render.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({nativeSvgDocuments:cases.length,applicationUiCases:0}));
}finally{await browser.close();}
