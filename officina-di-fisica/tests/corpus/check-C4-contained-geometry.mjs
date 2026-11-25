// Actual vendor convex-mesh support tests only; no browser/render/UI claim.
import * as T from '../../static/vendor/three-r180/three.module.min.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const groups=['electrostatics','materials-current','capacitors','magnetism'];
const sphere=new T.SphereGeometry(1,24,16),pos=sphere.attributes.position,ix=sphere.index,planes=[];
for(let i=0;i<ix.count;i+=3){const p=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(pos,ix.getX(i+j)));const n=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));if(n.length()<1e-12)continue;n.normalize();let d=n.dot(p[0]);if(d<0){n.negate();d=-d;}planes.push({n,d});}
function pointMargin(q,body){const v=new T.Vector3(...q).sub(new T.Vector3(...body.p));return Math.min(...planes.map(p=>p.d*body.r-p.n.dot(v)));}
function glyphMargin(a,body){
 const start=new T.Vector3(...a.a),end=new T.Vector3(...a.b),delta=end.clone().sub(start),length=delta.length(),u=delta.clone().normalize();
 const joint=end.clone().addScaledVector(u,-Math.min(.24,.32*length)),center=new T.Vector3(...body.p);
 function diskSupport(n,c,r){return n.dot(c.clone().sub(center))+r*Math.sqrt(Math.max(0,1-n.dot(u)**2));}
 return Math.min(...planes.map(p=>p.d*body.r-Math.max(p.n.dot(end.clone().sub(center)),diskSupport(p.n,joint,.0812),diskSupport(p.n,joint,.028),diskSupport(p.n,start,.028))));
}
const observations=[];let states=0,clockFrames=0,arrowInstances=0;
for(const group of groups){
 const proof=JSON.parse(readFileSync(`editorial/reviews/C4-${group}-installed-code-1a35-20261125.json`));
 for(const row of proof.records)for(const c of row.cases){
  const contexts=[{time:null,elements:c.elements},...c.clockSamples.map(f=>({time:f.time,elements:f.elements}))];
  states++;clockFrames+=c.clockSamples.length;
  for(const context of contexts){
   for(const a of context.elements){if(a.kind!=='arrow')continue;arrowInstances++;
    for(const body of context.elements){if(body.kind!=='ball'||body.alpha!==1)continue;
     const margin=pointMargin(a.b,body);if(margin<=0)continue;
     observations.push({id:row.id,input:c.x,time:context.time,a:a.a,tip:a.b,bodyCenter:body.p,bodyRadius:body.r,minimumTipPlaneMargin:margin,
      minimumWholeGlyphPlaneMargin:glyphMargin(a,body),tipStrictlyInsideActualMesh:true,wholeGlyphInsideActualMesh:glyphMargin(a,body)>0});
    }
   }
  }
 }
}
sphere.dispose();
console.log(JSON.stringify({phase:'LOCAL_C4_VENDOR_MESH_CONTAINMENT_NOT_UI',runtimeSha256:'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba',
 protocolSha256:sha(readFileSync(new URL(import.meta.url))),dependencies:Object.fromEntries(['static/js/banchi/scena.js','static/js/banchi/voci/geometria.js','static/js/banchi/voci/apparati/campi.js','static/js/banchi/voci/apparati/meccanica.js','static/vendor/three-r180/three.module.min.js'].map(p=>[p,sha(readFileSync(p))])),
 sourceMaterialContract:'Source read: opacity1,transparentfalse,depthWritetrue,DoubleSide,defaultdepthTesttrue. No browser-material inspection.',
 sourceMeshContract:'Dynamic unitSphere24x16 scaled byr; actual unit mesh720supportplanes. Cone lengthmin(.24,.32L),radius.0812;shaft.028. Wholeconvexglyphsupportincludesheadapex,allrimpointsandshaftcaps.',
 states,clockFrames,arrowInstances,observations,UI:'NOT_RUN',nativeRaster:'NOT_RUN',fallbackRaster:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE',localOnly:true}));
