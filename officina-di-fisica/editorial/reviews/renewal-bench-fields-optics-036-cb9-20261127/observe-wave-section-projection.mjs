import * as T from '/private/tmp/cric-method-css-748-independent-app/static/vendor/three-r180/three.module.min.js';
import {solve,coefficients,displacement} from '/private/tmp/cric-method-css-748-independent-app/static/js/banchi/modelli/onde.js';
import fs from 'node:fs/promises';import {createHash}from'node:crypto';
const root='/private/tmp/cric-method-css-748-independent-app';const names=['static/js/banchi/scene/onde.js','static/js/banchi/modelli/onde.js','static/js/banchi/scena.js'];const hashes=async()=>Object.fromEntries(await Promise.all(names.map(async n=>[n,createHash('sha256').update(await fs.readFile(root+'/'+n)).digest('hex')])));const before=await hashes();
const p={f:1,d:1.2,x:0,z:0,phase:0},s=solve(p),times=[];
for(const t of[0,.5]){
 const vertices=[],NX=64,NZ=1;
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const x=-1.24+2.48*i/NX,z=p.z+(j-.5)*.025,c=coefficients(s,x,z),u=(c.c*Math.cos(s.omega*t)+c.s*Math.sin(s.omega*t))/2;vertices.push(x*2.15,.45+82*.004*u,z*2.15);}
 const actual=new T.Float32BufferAttribute(vertices,3),points=Array.from({length:actual.count},(_,i)=>new T.Vector3().fromBufferAttribute(actual,i));const triangles=[];
 for(let i=0;i<NX;i++){const a=i;for(const ids of[[a,a+NX+1,a+1],[a+1,a+NX+1,a+NX+2]]){const q=ids.map(k=>points[k]);const twiceXYarea=(q[1].x-q[0].x)*(q[2].y-q[0].y)-(q[1].y-q[0].y)*(q[2].x-q[0].x);triangles.push({indices:ids,twiceXYarea});}}
 const ys=points.map(p=>p.y);times.push({time:t,actualProbeMm:displacement(s,s.probe,t)*1000,pointCount:points.length,triangleCount:triangles.length,allProjectedTrianglesDegenerate:triangles.every(x=>x.twiceXYarea===0),minY:Math.min(...ys),maxY:Math.max(...ys),vertices:points.map(p=>p.toArray()),triangles});
}
if(times.some(r=>!r.allProjectedTrianglesDegenerate||r.maxY-r.minY<.6))throw Error('Nonflat section projection claim not reproduced');if(JSON.stringify(before)!==JSON.stringify(await hashes()))throw Error('Runtime drift');console.log(JSON.stringify({id:'LAB3D-10',setup:p,cameraDirection:[0,0,1],sectionDescription:'Production strip at z=±.0125, Nx64 Nz1, Float32 positions. Side/section camera is exactly alongZ so its projected surface triangles have zeroXYarea at symmetric z=0.',times,runtimeBytes:before,scope:'Actual model + Float32 geometry CPU reconstruction; real independent native section PNGs confirm no visible profile at both extrema. Quarter-period zero is not used as a failure. Not GPU instrumented.',sourceScientificFailure:false,consumerGeometryFailure:true,activityCredit:0,humanApproval:'NOT_RUN'},null,2));
