import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as T from '../../electric-wave-label-independent-20261127/baseline-esm/static/vendor/three-r180/three.module.min.js';
const D=path.dirname(fileURLToPath(import.meta.url)),OUT=path.join(D,'actual-browser');
const sha=b=>createHash('sha256').update(b).digest('hex');
const report=JSON.parse(readFileSync(path.join(OUT,'report.json'))),terminal=JSON.parse(readFileSync(path.join(D,'terminal-receipt.json')));
assert.equal(terminal.observedExitCode,0);assert.equal(terminal.observedSignal,null);assert.equal(sha(readFileSync(path.join(OUT,'report.json'))),terminal.reportSha256);
for(const name of ['three.module.min.js','three.core.min.js'])assert.equal(sha(readFileSync(path.join(D,'../../electric-wave-label-independent-20261127/baseline-esm/static/vendor/three-r180',name))),report.runtimeFingerprint.files['static/vendor/three-r180/'+name]);
const candidates=[];
for(const entry of report.cases){
 const bytes=readFileSync(path.join(OUT,entry.file));assert.equal(sha(bytes),entry.sha256);const c=JSON.parse(bytes);
 if(!c.model||c.profile.fallback)continue;
 const inverse=new T.Matrix4().fromArray(c.sourceDerivedCamera.matrixWorld).invert(),projection=new T.Matrix4().fromArray(c.sourceDerivedCamera.projectionMatrix);
 const project=p=>{const v=new T.Vector3(...p).applyMatrix4(inverse).applyMatrix4(projection);return[(1+v.x)*c.canvas.width/2,(1-v.y)*c.canvas.height/2];};
 for(const arrow of c.nativeGlyphs)for(const label of c.labels.filter(l=>l.box)){
  const b=label.box,margin=p=>Math.min(p[0]-(b.x-b.w/2),b.x+b.w/2-p[0],p[1]-(b.y-b.h/2),b.y+b.h/2-p[1]);
  const parts=arrow.parts.map(p=>{const points=p.vertices.map(project);return{vertices:points.length,strictlyInside:points.filter(v=>margin(v)>0).length,minMargin:Math.min(...points.map(margin))};});
  const headInside=parts[1].strictlyInside===parts[1].vertices,wholeInside=parts.every(p=>p.strictlyInside===p.vertices),tip=project(arrow.tip),tipInside=margin(tip)>0;
  if(headInside||wholeInside||tipInside)candidates.push({caseKey:entry.caseKey,profile:c.profile,input:c.sourceReplayedX,field:c.model.y,label:label.text,labelBox:b,color:c.elements[arrow.elementIndex].c,headInside,wholeInside,tipInside,tipPixels:tip,tipMargin:margin(tip),parts,screenshots:c.screenshots,scope:'Source-derived actual-state projection. Native PNG was read independently; not private GPU-state introspection.'});
 }
}
const result={candidateCommit:report.sourceCommit,runtimeSha256:report.runtimeFingerprint.sha256,cases:report.cases.length,headOrTipCandidates:candidates,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
writeFileSync(path.join(D,'actual-source-projected-label-census.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(candidates));
