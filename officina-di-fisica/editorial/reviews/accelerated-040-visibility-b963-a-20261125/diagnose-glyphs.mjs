import * as T from '../../../static/vendor/three-r180/three.module.min.js';
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
import {esperienza}from'../../../static/js/banchi/voci/esperimento.js';
const out=path.dirname(fileURLToPath(import.meta.url));const sources=JSON.parse(await fs.readFile(new URL('../../../content/esperienze-C1.json',import.meta.url),'utf8'));const material=new T.MeshBasicMaterial({side:T.DoubleSide});const eye=new T.Vector3(2.6,1.9,6.1).normalize(),up=new T.Vector3(0,1,0);
function cylinder(a,b,r,R=r){const A=new T.Vector3(...a),B=new T.Vector3(...b),axis=B.clone().sub(A),mesh=new T.Mesh(new T.CylinderGeometry(R,r,axis.length(),32,1,false),material);mesh.position.copy(A).add(B).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(up,axis.normalize());mesh.updateMatrixWorld(true);return mesh;}
function vertices(mesh){const a=mesh.geometry.attributes.position,result=[];for(let i=0;i<a.count;i++)result.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld));return result;}
function blocked(point,meshes){return new T.Raycaster(point.clone().addScaledVector(eye,100),eye.clone().negate(),0,100-1e-6).intersectObjects(meshes,false).length>0;}
const results=[];
for(const [id,x,color]of[['SIM-C1-L004-02',2,0xb94f48],['SIM-C1-L004-04',1,0x7350b0]]){
 const exp=await esperienza(sources.find(r=>r.id===id)),elements=exp.elements(x,2);const ball=elements.find(e=>e.kind==='ball');const e=elements.find(e=>e.kind==='arrow'&&e.c===color);const A=new T.Vector3(...e.a),B=new T.Vector3(...e.b),delta=B.clone().sub(A),len=delta.length(),joint=B.clone().addScaledVector(delta.clone().normalize(),-Math.min(.24,len*.32));
 const head=cylinder(joint.toArray(),e.b,.0812,0),shaft=cylinder(e.a,joint.toArray(),.028);
 const sphere=new T.Mesh(new T.SphereGeometry(ball.r,24,16),material);sphere.position.fromArray(ball.p);sphere.updateMatrixWorld(true);const table=new T.Mesh(new T.BoxGeometry(6.75,.22,3.45),material);table.position.set(0,-.11,0);table.updateMatrixWorld(true);
 const headVertices=vertices(head),shaftVertices=vertices(shaft);const blockers=[sphere,table];
 results.push({id,input:x,elements,arrow:e,body:ball,length:len,headJoint:joint.toArray(),tipDistanceFromBody:B.distanceTo(new T.Vector3(...ball.p)),tipBlockedByBody:blocked(B,[sphere]),tipBlockedByTable:blocked(B,[table]),headVertexCount:headVertices.length,headVerticesBlocked:headVertices.filter(v=>blocked(v,blockers)).length,shaftVertexCount:shaftVertices.length,shaftVerticesBlocked:shaftVertices.filter(v=>blocked(v,blockers)).length,method:'Actual declarative consumer elements; independent Three reconstruction with unchanged32-side closed cones/shafts,24x16opaque sphere,base top0 bottom-.22; default oblique camera rays. No production mutation. Rim visibility is distinguished from tip visibility.'});
}
await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify({runtimeProfileSha256:'b963060675f372b28d79823f92e3a781b32856779fe1dd6a6fbb3feaba30686f',results},null,2)+'\n');console.log(JSON.stringify(results.map(({elements,...r})=>r)));
