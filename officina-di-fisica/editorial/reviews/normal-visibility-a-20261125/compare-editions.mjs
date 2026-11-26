import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
const folder=path.dirname(fileURLToPath(import.meta.url)),report=JSON.parse(await fs.readFile(path.join(folder,'diagnostic.json'),'utf8'));
const pairs=[];
for(const width of[1280,320])for(const fallback of[false,true])for(const angle of[0,75]){
 const source=report.cases.find(r=>r.width===width&&r.angle===angle&&r.fallback===fallback&&r.edition==='source-v1');
 const draft=report.cases.find(r=>r.width===width&&r.angle===angle&&r.fallback===fallback&&r.edition==='draft-140-v2');
 const images=await Promise.all([source,draft].map(async r=>PNG.sync.read(await fs.readFile(path.join(folder,r.stageFile)))));
 if(images[0].width!==images[1].width||images[0].height!==images[1].height)throw Error('Different screenshot dimensions');
 let differingPixels=0;for(let i=0;i<images[0].data.length;i+=4)if([0,1,2,3].some(j=>images[0].data[i+j]!==images[1].data[i+j]))differingPixels++;
 let fallbackArrow=null;
 if(fallback){const p=draft.forcePaths.find(p=>p.color==='#147979').path.match(/[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?/g).map(Number);const svgLength=Math.hypot(p[2]-p[0],p[3]-p[1]);const scale=Math.min(draft.svgBox.width/460,draft.svgBox.height/215);fallbackArrow={svgLength,uniformCssScale:scale,cssLength:svgLength*scale};}
 pairs.push({width,fallback,angle,sourceFile:source.stageFile,draftFile:draft.stageFile,imageWidth:images[0].width,imageHeight:images[0].height,differingPixels,byteIdentical:source.stageSha256===draft.stageSha256,geometryIdentical:JSON.stringify(source.elements)===JSON.stringify(draft.elements),modelEqual:source.model.y===draft.model.y,fallbackNormal:fallbackArrow});
}
await fs.writeFile(path.join(folder,'edition-comparison.json'),JSON.stringify({purpose:'Source/DRAFT real screenshot and geometry comparison',pairs},null,2)+'\n');console.log(JSON.stringify(pairs.map(r=>({width:r.width,fallback:r.fallback,angle:r.angle,differingPixels:r.differingPixels,normalCss:r.fallbackNormal?.cssLength}))));
