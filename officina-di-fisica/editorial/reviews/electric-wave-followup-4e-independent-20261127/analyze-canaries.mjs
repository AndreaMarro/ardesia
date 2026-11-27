// Deterministic source-projected geometry, kept distinct from raster reading.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as T from '../electric-wave-label-independent-20261127/baseline-esm/static/vendor/three-r180/three.module.min.js';
const OUT=path.dirname(fileURLToPath(import.meta.url)),BROWSER=path.join(OUT,'actual-browser');
const sha=b=>createHash('sha256').update(b).digest('hex');
const report=JSON.parse(readFileSync(path.join(BROWSER,'report.json'))),terminal=JSON.parse(readFileSync(path.join(OUT,'actual-browser-terminal.json')));
assert.equal(terminal.observedExit,0);assert.equal(terminal.signal,null);assert.equal(sha(readFileSync(path.join(BROWSER,'report.json'))),terminal.reportSha256);
assert.equal(report.cases.length,54);assert.ok(report.cases.every(c=>c.technicalOk));
const candidates=[],records=[];
for(const entry of report.cases){
 const raw=readFileSync(path.join(BROWSER,entry.file));assert.equal(sha(raw),entry.sha256);
 const c=JSON.parse(raw),r=c.observed;assert.equal(sha(readFileSync(path.join(BROWSER,c.imageSha256+'.png'))),c.imageSha256);
 if(!c.profile.fallback){
  const inverse=new T.Matrix4().fromArray(r.sourceDerivedCamera.matrixWorld).invert(),projection=new T.Matrix4().fromArray(r.sourceDerivedCamera.projectionMatrix);
  const project=point=>{const v=new T.Vector3(...point).applyMatrix4(inverse).applyMatrix4(projection);return[(1+v.x)*r.canvas.width/2,(1-v.y)*r.canvas.height/2];};
  for(const arrow of r.nativeGlyphs)for(const label of r.labels.filter(l=>l.box)){
   const box=label.box,margin=p=>Math.min(p[0]-(box.x-box.w/2),(box.x+box.w/2)-p[0],p[1]-(box.y-box.h/2),(box.y+box.h/2)-p[1]);
   const parts=arrow.parts.map(part=>{const points=part.vertices.map(project),inside=points.filter(p=>margin(p)>0).length;return{vertices:points.length,strictlyInside:inside,minMargin:Math.min(...points.map(margin))};});
   const tip=project(arrow.tip),tipInside=margin(tip)>0,whole=parts.every(p=>p.strictlyInside===p.vertices);
   const head=parts[1].strictlyInside===parts[1].vertices;
   if(whole||head||tipInside)candidates.push({key:c.key,id:c.id,width:c.width,view:c.view,input:c.input,time:c.instant,label:label.text,elementIndex:arrow.elementIndex,color:r.elements[arrow.elementIndex].c,wholeGlyphStrictlyInside:whole,headStrictlyInside:head,tipStrictlyInside:tipInside,parts,imageSha256:c.imageSha256,scope:'Source-derived projection of actual DOM state; raster must be read independently'});
  }
 }
 records.push({key:c.key,id:c.id,width:c.width,view:c.view,imageSha256:c.imageSha256});
}
const result={candidateRef:report.candidateRef,runtimeSha256:report.runtimeFingerprint.sha256,verifiedCases:54,verifiedPngs:54,wholeGlyphContainmentCandidates:candidates.filter(c=>c.wholeGlyphStrictlyInside),headOrTipCandidates:candidates,records,fullRasterAcceptanceGranted:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
writeFileSync(path.join(OUT,'actual-source-projected-label-census.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({cases:54,whole:candidates.filter(c=>c.wholeGlyphStrictlyInside).length,headOrTip:candidates.length,ids:[...new Set(candidates.map(c=>c.id))]}));
