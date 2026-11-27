// Read-only geometric witness from installed model + actual renderer primitive constructors.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as T from '/private/tmp/cric-method-css-748-independent-app/static/vendor/three-r180/three.module.min.js';
import * as model from '/private/tmp/cric-method-css-748-independent-app/static/js/banchi/modelli/campo.js';
import {defaults} from '/private/tmp/cric-method-css-748-independent-app/static/js/banchi/misure.js';
const root='/private/tmp/cric-method-css-748-independent-app';
const names=['static/js/banchi/scene/campo.js','static/js/banchi/scena.js','static/js/banchi/modelli/campo.js','static/js/banchi/misure.js'];
const hashes=async()=>Object.fromEntries(await Promise.all(names.map(async n=>[n,createHash('sha256').update(await fs.readFile(root+'/'+n)).digest('hex')])));
const before=await hashes(),p=defaults(model.params),s=model.solve(p),gain=1.25/Math.max(1,s.reading.magnitude,...s.reading.contributions.map(v=>Math.hypot(...v)));
const witnesses=[];
for(const [i,field]of s.reading.contributions.entries()){
 const tail=new T.Vector3(...s.probe),tip=tail.clone().add(new T.Vector3(...field).multiplyScalar(gain)),axis=tip.clone().sub(tail),length=axis.length();
 const joint=tip.clone().addScaledVector(axis.clone().normalize(),-Math.min(.24,length*.32)),headAxis=tip.clone().sub(joint),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),headAxis.clone().normalize()),mid=joint.clone().add(tip).multiplyScalar(.5);
 const cone=new T.CylinderGeometry(0,.028*2.9,Math.max(.0001,headAxis.length()),32,1,false),verts=cone.attributes.position;
 const base=[];for(let j=0;j<verts.count;j++){const local=new T.Vector3().fromBufferAttribute(verts,j);if(Math.abs(local.y+headAxis.length()/2)<1e-6&&Math.hypot(local.x,local.z)>.05)base.push(local.applyQuaternion(q).add(mid));}
 const source=s.sources.find(v=>Math.sign(v.pos[0])===Math.sign(tip.x));
 const sphere=new T.Mesh(new T.SphereGeometry(.19,24,16),new T.MeshBasicMaterial({side:T.DoubleSide}));sphere.position.set(...source.pos);sphere.updateMatrixWorld(true);
 const observations=base.map(point=>{const ray=new T.Raycaster(new T.Vector3(point.x,point.y,14),new T.Vector3(0,0,-1));const hits=ray.intersectObject(sphere,false);const ownDistance=14-point.z;return{point:point.toArray(),distanceFromSource:point.distanceTo(sphere.position),frontHitDistance:hits[0]?.distance??null,pointDistance:ownDistance,occludedBySourceSphere:!!hits.length&&hits[0].distance<ownDistance};});
 witnesses.push({contributionIndex:i,field,tail:tail.toArray(),tip:tip.toArray(),joint:joint.toArray(),headLength:headAxis.length(),headBaseRadius:.028*2.9,opaqueSource:{position:source.pos,radius:.19,opacity:1,depthWrite:true,sphereSegments:[24,16]},tipOutsideSphere:tip.distanceTo(sphere.position)>.19,baseSamples:observations,allActualBaseRimVerticesInsideNominalSphere:observations.every(o=>o.distanceFromSource<.19),allActualBaseRimVerticesOccludedInSideCamera:observations.every(o=>o.occludedBySourceSphere)});
}
if(witnesses.length!==2||witnesses.some(w=>!w.tipOutsideSphere||!w.allActualBaseRimVerticesInsideNominalSphere||!w.allActualBaseRimVerticesOccludedInSideCamera))throw Error('Claim not reproduced by actual model/Float32 constructors/rays');
if(JSON.stringify(before)!==JSON.stringify(await hashes()))throw Error('Read runtime changed');
console.log(JSON.stringify({id:'LAB3D-07',parameters:p,sourceState:s,gain,witnesses,runtimeBytes:before,scope:'Actual Float32 CPU geometry and double-precision CPU transforms/ray intersections against opaque source sphere. Not GPU raster proof; real cb9 side PNGs independently show partial head and shaft masking. Tips are outside; neither full-cone containment nor tip occlusion claimed.',sourceScientificFailure:false,consumerGeometryFailure:true,activityCredit:0,humanApproval:'NOT_RUN'},null,2));
