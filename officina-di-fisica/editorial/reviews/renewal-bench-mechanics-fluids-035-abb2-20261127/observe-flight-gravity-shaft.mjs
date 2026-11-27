import * as T from '/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica/static/vendor/three-r180/three.module.min.js';
import {build,spec} from '/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica/static/js/banchi/scene/volo.js';
import {solve,sample} from '/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica/static/js/banchi/modelli/volo.js';
import {posizionaEtichetta}from'/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica/static/js/banchi/etichette.js';
import fs from'node:fs/promises';import{createHash}from'node:crypto';
const app='/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica',files=['static/js/banchi/scene/volo.js','static/js/banchi/scena.js','static/js/banchi/modelli/volo.js','static/js/banchi/etichette.js'];const hashes=async()=>Object.fromEntries(await Promise.all(files.map(async x=>[x,createHash('sha256').update(await fs.readFile(app+'/'+x)).digest('hex')])));const before=await hashes();
const root=new T.Group(),arrows=[],labels=[];const group=(p=root)=>{const g=new T.Group();p.add(g);return g};
const mesh=(geo,pos,parent=root)=>{const m=new T.Mesh(geo,new T.MeshBasicMaterial());m.position.fromArray(pos);parent.add(m);return m};
function rod(a,b,r,c,parent=root,opacity=1,endRadius=r){const start=new T.Vector3(...a),end=new T.Vector3(...b),d=end.clone().sub(start),m=mesh(new T.CylinderGeometry(endRadius,r,Math.max(.0001,d.length()),32,1,false),start.lerp(end,.5).toArray(),parent);if(d.lengthSq())m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
function arrow(a,b,c,parent=root,thin=.028){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),len=d.length();if(len<.012)return;const joint=new T.Vector3(...b).addScaledVector(d.normalize(),-Math.min(.24,len*.32)).toArray();const shaft=rod(a,joint,thin,c,parent),cone=rod(joint,b,thin*2.9,c,parent,1,0);arrows.push({a,b,c,parent,shaft,cone});}
const b={T,group,rod,arrow,base(){},line(){},ring(){},ball:(p,r,c,parent)=>mesh(new T.SphereGeometry(r,24,16),p,parent),label:(p,text)=>labels.push({p,text})};
const p={speed:5,elevation:90,azimuth:0},s=solve(p);const frame=build(b,p,s,3,'side');frame(.5);root.updateMatrixWorld(true);

// Native phase2/Esplora is sceneLevel2. Original model defaults are declared by params.
const actualParameters={speed:4,elevation:50,azimuth:15},solution=solve(actualParameters);
const root2=new T.Group(),arrows2=[];
const group2=(parent=root2)=>{const g=new T.Group();parent.add(g);return g;};
function mesh2(geometry,position,parent=root2){const m=new T.Mesh(geometry,new T.MeshBasicMaterial({side:T.DoubleSide}));m.position.fromArray(position);parent.add(m);return m;}
function rod2(a,b,r,c,parent=root2,opacity=1,endRadius=r){const start=new T.Vector3(...a),end=new T.Vector3(...b),d=end.clone().sub(start),m=mesh2(new T.CylinderGeometry(endRadius,r,Math.max(.0001,d.length()),32,1,false),start.lerp(end,.5).toArray(),parent);if(d.lengthSq())m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
function arrow2(a,b,c,parent=root2,thin=.028){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),len=d.length();if(len<.012)return;const joint=new T.Vector3(...b).addScaledVector(d.normalize(),-Math.min(.24,len*.32)).toArray();const shaft=rod2(a,joint,thin,c,parent),cone=rod2(joint,b,thin*2.9,c,parent,1,0);arrows2.push({a,b,c,parent,shaft,cone});}
let base;
const b2={T,group:group2,rod:rod2,arrow:arrow2,base(w,d){base=mesh2(new T.BoxGeometry(w,.22,d),[0,-.11,0]);},line(){},ring(){},ball:(p,r,c,parent)=>mesh2(new T.SphereGeometry(r,24,16),p,parent),label(){}};
const frame2=build(b2,actualParameters,solution,2,'side');frame2(0);root2.updateMatrixWorld(true);
const gravity=arrows2.find(a=>a.c===0xbc4b51&&a.b[1]===-.64);if(!gravity||!base)throw Error('Actual source gravity/base not built');
const tail=new T.Vector3(...gravity.a).applyMatrix4(gravity.parent.matrixWorld),tip=new T.Vector3(...gravity.b).applyMatrix4(gravity.parent.matrixWorld),shaftTop=new T.Vector3(0,gravity.shaft.geometry.parameters.height/2,0).applyMatrix4(gravity.shaft.matrixWorld),shaftBottom=new T.Vector3(0,-gravity.shaft.geometry.parameters.height/2,0).applyMatrix4(gravity.shaft.matrixWorld);
const box=new T.Box3().setFromObject(base),samples=[];
// Each ring vertex pair is an actual generator of the Float32 polygonal shaft surface.
const attr=gravity.shaft.geometry.attributes.position;const top=[],bottom=[];
for(let i=0;i<attr.count;i++){const v=new T.Vector3().fromBufferAttribute(attr,i);if(v.y>0)top.push(v);else if(v.y<0)bottom.push(v);}
for(let ring=0;ring<32;ring++){const a=top[ring].clone().applyMatrix4(gravity.shaft.matrixWorld),b=bottom[ring].clone().applyMatrix4(gravity.shaft.matrixWorld);for(let i=0;i<=100;i++){const v=a.clone().lerp(b,i/100),origin=new T.Vector3(v.x,v.y,14),ray=new T.Raycaster(origin,new T.Vector3(0,0,-1)),hit=ray.intersectObject(base,false)[0],distance=14-v.z;samples.push({ring,fraction:i/100,point:v.toArray(),insideBase:box.containsPoint(v),baseHitDistance:hit?.distance??null,ownDistance:distance,occluded:!!hit&&hit.distance<distance});}}
const tipRay=new T.Raycaster(new T.Vector3(tip.x,tip.y,14),new T.Vector3(0,0,-1)),tipHit=tipRay.intersectObject(base,false)[0];
const after=await hashes();if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Source drift');
const witness={id:'LAB3D-02',parameters:actualParameters,time:0,sceneLevel:2,sourceDefaultInput:true,sourceSample:sample(solution,0),actualSourceBuildCalled:true,base:{center:[0,-.11,0],size:[6.5,.22,4.3],float32Bounds:{min:box.min.toArray(),max:box.max.toArray()},opacity:1,depthWrite:true},gravity:{tail:tail.toArray(),tip:tip.toArray(),delta:tip.clone().sub(tail).toArray(),shaftEnds:[shaftTop.toArray(),shaftBottom.toArray()],tipOutsideBase:!box.containsPoint(tip),tipOccluded:!!tipHit&&tipHit.distance<14-tip.z},sampleCount:samples.length,occludedShaftSurfaceSamples:samples.filter(x=>x.occluded).length,insideBaseShaftSurfaceSamples:samples.filter(x=>x.insideBase).length,samples,runtimeBytes:before,scope:'Actual source build and Float32 shaft/base geometry. 32 rim generators sampled at101 fractions, duplicated samples not independent UI cases. Side CPUray before surface plus original actual SidePNG shows partial SHAFT masking; tip and cone are below base and remain visible. Not whole-cone containment or GPUreadback. No historical1a inference.',activityCredit:0,humanApproval:'NOT_RUN'};
if(!witness.gravity.tipOutsideBase||witness.gravity.tipOccluded||witness.occludedShaftSurfaceSamples===0)throw Error('Specific partial-shaft witness not reproduced');console.log(JSON.stringify(witness,null,2));
