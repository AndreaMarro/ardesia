import * as T from '../../../static/vendor/three-r180/three.module.min.js';
import fs from 'node:fs/promises';import path from 'node:path';import{fileURLToPath}from'node:url';import assert from'node:assert/strict';
const out=path.dirname(fileURLToPath(import.meta.url));const raw=JSON.parse(await fs.readFile(path.join(out,'diagnostic.json'),'utf8'));
const material=new T.MeshBasicMaterial({side:T.DoubleSide});const up=new T.Vector3(0,1,0),eye=new T.Vector3(2.6,1.9,6.1).normalize();
function cylinder(a,b,r,R=r){const A=new T.Vector3(...a),B=new T.Vector3(...b),axis=B.clone().sub(A);const mesh=new T.Mesh(new T.CylinderGeometry(R,r,axis.length(),32,1,false),material);mesh.position.copy(A).add(B).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(up,axis.normalize());mesh.updateMatrixWorld(true);return mesh;}
function arrow(e){const a=new T.Vector3(...e.a),b=new T.Vector3(...e.b),d=b.clone().sub(a),length=d.length(),joint=b.clone().addScaledVector(d.normalize(),-Math.min(.24,length*.32));return{shaft:cylinder(e.a,joint.toArray(),.028),head:cylinder(joint.toArray(),e.b,.028*2.9,0),joint:joint.toArray(),length};}
function vertices(mesh){const a=mesh.geometry.attributes.position,result=[];for(let i=0;i<a.count;i++)result.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld));return result;}
function blocker(point,meshes){const ray=new T.Raycaster(point.clone().addScaledVector(eye,100),eye.clone().negate(),0,100-1e-6);return ray.intersectObjects(meshes,false)[0]||null;}
const cases=[];
for(const sample of raw.cases.filter(r=>!r.fallback&&r.edition==='draft-140-v2')){
 const theta=sample.angle*Math.PI/180,normalDirection=new T.Vector3(-Math.sin(theta),Math.cos(theta),0),tangent=new T.Vector3(Math.cos(theta),Math.sin(theta),0);
 const sphere=sample.elements.find(e=>e.kind==='ball'),point=new T.Vector3(...sphere.p),arrows=sample.elements.filter(e=>e.kind==='arrow');assert.equal(arrows.length,2);
 const bodies=[new T.Mesh(new T.BoxGeometry(6.75,.22,3.45),material)];bodies[0].position.set(0,-.11,0);bodies[0].updateMatrixWorld(true);
 for(const e of sample.elements){let m;if(e.kind==='ball'){m=new T.Mesh(new T.SphereGeometry(e.r,24,16),material);m.position.fromArray(e.p);m.updateMatrixWorld(true);}else if(e.kind==='rod')m=cylinder(e.a,e.b,e.r,e.r2);else if(e.kind==='box'){m=new T.Mesh(new T.BoxGeometry(...e.size),material);m.position.fromArray(e.p);m.updateMatrixWorld(true);}if(m)bodies.push(m);}
 const glyphs=arrows.map(e=>({e,...arrow(e)}));
 const aspect=sample.canvas.width/sample.canvas.height,span=Math.max(sample.spec.height,sample.spec.width/aspect),camera=new T.OrthographicCamera(-span*aspect/2,span*aspect/2,span/2,-span/2,.05,100),target=new T.Vector3(...sample.spec.target);camera.position.copy(target).addScaledVector(eye,14);camera.lookAt(target);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
 const rows=[];
 for(const glyph of glyphs){const e=glyph.e,A=new T.Vector3(...e.a),B=new T.Vector3(...e.b),delta=B.clone().sub(A),others=[...bodies,...glyphs.filter(g=>g!==glyph).flatMap(g=>[g.shaft,g.head])];const headVertices=vertices(glyph.head),shaftVertices=vertices(glyph.shaft);const centers=Array.from({length:101},(_,i)=>A.clone().lerp(B,i/100));
  const visibleTips=blocker(B,others)===null,blockedHead=headVertices.filter(v=>blocker(v,others)).length,blockedCenters=centers.filter(v=>blocker(v,others)).length,blockedShaftRim=shaftVertices.filter(v=>blocker(v,others)).length;
  const allVertices=[...headVertices,...shaftVertices],insideViewport=allVertices.every(v=>{const p=v.clone().project(camera);return Math.abs(p.x)<=1&&Math.abs(p.y)<=1;});
  const normal=e.c===0x147979;const expected=normal?.75*Math.cos(theta):.75;assert.ok(Math.abs(delta.length()-expected)<1e-12);
  assert.ok(A.clone().sub(point).cross(delta).length()<1e-12,'Translated origin must stay on physical action line');
  if(normal){assert.ok(Math.abs(delta.dot(tangent))<1e-12);assert.ok(delta.dot(normalDirection)>0);}else{assert.equal(delta.x,0);assert.equal(delta.z,0);assert.ok(delta.y<0);}
  rows.push({color:normal?'normal-green':'weight-red',length:delta.length(),expectedLength:expected,start:e.a,end:e.b,lineOfActionCrossProduct:A.clone().sub(point).cross(delta).length(),tipUnoccluded:visibleTips,headVertices:headVertices.length,headVerticesOccluded:blockedHead,centerlineSamples:centers.length,centerlineSamplesOccluded:blockedCenters,shaftRimVerticesOccluded:blockedShaftRim,entireMeshWithinViewport:insideViewport});
 }
 const green=rows.find(r=>r.color==='normal-green'),red=rows.find(r=>r.color==='weight-red');assert.ok(Math.abs(green.length/red.length-Math.cos(theta))<1e-12);
 cases.push({angle:sample.angle,width:sample.width,forces:rows,commonScaleRatio:green.length/red.length,expectedRatio:Math.cos(theta)});
}
const summary={nativeConfigurations:cases.length,forceGlyphs:cases.length*2,allTipsUnoccluded:cases.every(c=>c.forces.every(f=>f.tipUnoccluded)),allHeadVerticesUnoccluded:cases.every(c=>c.forces.every(f=>f.headVerticesOccluded===0)),allCenterlinesUnoccluded:cases.every(c=>c.forces.every(f=>f.centerlineSamplesOccluded===0)),allEntireGlyphMeshesInsideViewport:cases.every(c=>c.forces.every(f=>f.entireMeshWithinViewport)),shaftRimOcclusions:cases.flatMap(c=>c.forces.filter(f=>f.shaftRimVerticesOccluded).map(f=>({angle:c.angle,width:c.width,color:f.color,count:f.shaftRimVerticesOccluded}))),method:'Actual declarative consumer elements, independent reconstruction with same documented Three mesh parameters and native base, camera rays toward all complete cone vertices and101 centerline points; own glyph excluded from self-occlusion, other force included. Width-specific native frusta. No production scene mutation.'};
await fs.writeFile(path.join(out,'complete-glyph-geometry.json'),JSON.stringify({purpose:'INDEPENDENT_COMPLETE_FORCE_GLYPH_AND_ACTION_LINE_REVIEW',summary,cases,humanApproval:'NOT_RUN',publicationAction:'NONE'},null,2)+'\n');console.log(JSON.stringify(summary));
