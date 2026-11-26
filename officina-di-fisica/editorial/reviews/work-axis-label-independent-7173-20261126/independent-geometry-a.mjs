import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const B='/private/tmp/cric-author-a-resident/officina-di-fisica/editorial/reviews/work-axis-label-independent-7173-20261126';
const T='/private/tmp/cric-work-axis-independent-a-ui-app';
const base=await fs.readFile(B+'/baseline-esperimento.js','utf8');
const imports=[];
const transformed=base.replace(/from '([^']+)'/g,(whole,p)=>{assert.ok(p.startsWith('.'));const url=pathToFileURL(path.resolve(T+'/static/js/banchi/voci',p)).href;imports.push({original:p,resolved:url});return 'from '+JSON.stringify(url);});
await fs.writeFile(B+'/baseline-import-resolution-witness.mjs',transformed);
const old=await import(pathToFileURL(B+'/baseline-import-resolution-witness.mjs'));
const fresh=await import(pathToFileURL(T+'/static/js/banchi/voci/esperimento.js'));
const source=JSON.parse(await fs.readFile(B+'/original-esperienze-C1.json','utf8'));
const rows=source.filter(r=>r.apparatus==='vettori'&&!r.engine);assert.equal(rows.length,6);
const raw={schemaVersion:'1.0.0',scope:'SIX_NATIVE_C1_VECTOR_RECORDS_SOURCE_ONLY_COMPLETE_CONTROL_GRID; NOT_UI_ACCEPTANCE',candidateRef:'b38d8b8dd1dd3d69f558bbe8753d759084aa527f',baselineRef:'64aef05bef5ca7ebff8491060762dd4cac0cbb34',imports,sourceWitnessSha256:createHash('sha256').update(base).digest('hex'),contexts:[],activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
for(const r of rows){
 const a=await old.esperienza(r),b=await fresh.esperienza(r);
 assert.deepEqual(a.teaching,b.teaching);assert.deepEqual(a.scene.spec,b.scene.spec);
 const num=Math.round((r.control.max-r.control.min)/r.control.step);
 for(let i=0;i<=num;i++){
  const x=r.control.min+i*r.control.step;assert.deepEqual(a.model.solve({x}),b.model.solve({x}));
  for(const stage of [-1,0,1,2,3,4]){
   const before=a.elements(x,stage),after=b.elements(x,stage);
   const target=r.id==='SIM-C1-L007-01';
   assert.deepEqual(after,target?before.filter(e=>!(e.kind==='label'&&e.text==='y')):before);
   const entry={id:r.id,x,stage,removedY:before.length-after.length,elementCount:after.length};
   if(target&&stage>=0){
    const arrows=after.filter(e=>e.kind==='arrow');assert.equal(arrows.length,2);const [green,ochre]=arrows;assert.deepEqual(green.a,[-.8,.28,0]);assert.deepEqual(ochre.a,green.a);assert.ok(green.b.every((v,i)=>v===[.8,.28,0][i]));
    const d=ochre.b.map((z,j)=>z-ochre.a[j]),theta=x*Math.PI/180;
    assert.ok(Math.abs(d[0]-1.5*Math.cos(theta))<1e-14);assert.equal(d[1],0);assert.ok(Math.abs(d[2]+1.5*Math.sin(theta))<1e-14);assert.ok(Math.abs(Math.hypot(...d)-1.5)<1e-14);
    assert.ok(Math.abs(b.model.solve({x}).y-12*Math.cos(theta))<1e-11);assert.ok(after.every(e=>!(e.kind==='label'&&e.text==='y')));
    assert.deepEqual(after.filter(e=>e.kind==='line').slice(0,2),before.filter(e=>e.kind==='line').slice(0,2));entry.vectorLengths=[1.6,Math.hypot(...d)];entry.commonTail=green.a;
   }
   raw.contexts.push(entry);
  }
 }
}
raw.totals={records:rows.length,contexts:raw.contexts.length,targetGridAngles:new Set(raw.contexts.filter(x=>x.id==='SIM-C1-L007-01').map(x=>x.x)).size,targetContexts:raw.contexts.filter(x=>x.id==='SIM-C1-L007-01').length,otherContexts:raw.contexts.filter(x=>x.id!=='SIM-C1-L007-01').length};
await fs.writeFile(B+'/actual-source-grid-geometry.json',JSON.stringify(raw,null,2)+'\n');console.log(JSON.stringify(raw.totals));
