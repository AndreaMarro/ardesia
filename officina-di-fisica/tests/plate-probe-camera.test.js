import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../static/vendor/three-r180/three.module.min.js';
import {esperienza} from '../static/js/banchi/voci/esperimento.js';
import {camera,body,bounds,states} from './helpers/plate-probe-projection.mjs';
const records=JSON.parse(readFileSync(new URL('../content/esperienze-C4.json',import.meta.url)));
const ids=['SIM-C4-L02-03','SIM-C4-L03-02','SIM-C4-L03-03'];
const sizes=[[294,341],[839,451]]; // Actual canvas captures at320/1280 viewport, includingtheir recorded extent.
for(const id of ids){
 test(id+' · whole marker and three field heads are clear of plate silhouettes in initial framing',async()=>{
  const record=records.find(r=>r.id===id),exp=await esperienza(record);
  const grid=states(record);for(const x of[grid.at(-1),...grid.slice(0,-1)]){
   const elements=exp.elements(x,2),plates=elements.filter(e=>e.kind==='box'&&e.size[0]===.11);
   assert.equal(plates.length,2,'two actual opaque plate meshes');
   const marker=elements.find(e=>e.kind==='ball'&&e.r===.13);assert.ok(marker,'actual purple signal');
   const fields=elements.filter(e=>e.kind==='arrow');assert.equal(fields.length,3,'three original field arrows');
   for(const[w,h]of sizes){
    const c=camera(exp.scene.spec,w,h),l=bounds(body(plates[0]),c),r=bounds(body(plates[1]),c);
    for(const e of[marker,...fields]){
     const q=bounds(body(e),c);
     assert.ok(q.lo>l.hi&&q.hi<r.lo,JSON.stringify({id,x,w,h,kind:e.kind,leftGapCss:(q.lo-l.hi)*w/2,rightGapCss:(r.lo-q.hi)*w/2,scope:'actualFloat32mesh projected support; noGPUrasterclaim'}));
    }
   }
  }
 });
}
test('target camera keeps all actual opaque mesh supports and table corners inside both recorded frames',async()=>{
 for(const id of ids){const r=records.find(x=>x.id===id),exp=await esperienza(r);
  for(const x of[r.control.min,r.control.max])for(const[w,h]of sizes)for(const view of['orbit','top','side']){
   const c=camera(exp.scene.spec,w,h,view);
   const points=exp.elements(x,2).filter(e=>e.kind!=='label').flatMap(body);
   // Exact nativebase geometries, including Float32 board/foot vertices.
   points.push(...body({kind:'box',p:[0,-.11,0],size:[6.75,.22,3.45]}));
   for(const xx of[-6.75/2+.26,6.75/2-.26])for(const zz of[-3.45/2+.24,3.45/2-.24])points.push(...body({kind:'rod',a:[xx,-.145,zz],b:[xx,.006,zz],r:.07}));
   const q=bounds(points,c);assert.ok(q.lo>-1&&q.hi<1&&q.bottom>-1&&q.top<1,JSON.stringify({id,x,w,h,view,q}));
  }
 }
});
test('native alternative views are taught without directing fallback users to disabled controls',async()=>{
 for(const id of ids){const r=records.find(x=>x.id===id),exp=await esperienza(r);
  for(const view of['orbit','top','side']){
   const legend=exp.legend(2,view);assert.match(legend,/frontal/i);assert.match(legend,/Alto/);assert.match(legend,/Laterale/);assert.match(legend,/Ripristina vista/);
  }
  assert.doesNotMatch(exp.legend(2,'diagram'),/scegli.*(?:Alto|Laterale)|Ripristina vista/i);
 }
});
