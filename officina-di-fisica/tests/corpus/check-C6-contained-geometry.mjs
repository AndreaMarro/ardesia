// Actual vendor convex-mesh support tests only; no browser/render/UI claim.
import * as T from '../../static/vendor/three-r180/three.module.min.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const groups=['cross-domain'];
const sphere=new T.SphereGeometry(1,24,16),pos=sphere.attributes.position,ix=sphere.index,planes=[];
for(let i=0;i<ix.count;i+=3){const p=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(pos,ix.getX(i+j)));const n=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));if(n.length()<1e-12)continue;n.normalize();let d=n.dot(p[0]);if(d<0){n.negate();d=-d;}planes.push({n,d});}
function pointMargin(q,body){const v=new T.Vector3(...q).sub(new T.Vector3(...body.p));return Math.min(...planes.map(p=>p.d*body.r-p.n.dot(v)));}
function glyphMargin(a,body){
 const start=new T.Vector3(...a.a),end=new T.Vector3(...a.b),delta=end.clone().sub(start),length=delta.length(),u=delta.clone().normalize();
 const joint=end.clone().addScaledVector(u,-Math.min(.24,.32*length)),center=new T.Vector3(...body.p);
 function diskSupport(n,c,r){return n.dot(c.clone().sub(center))+r*Math.sqrt(Math.max(0,1-n.dot(u)**2));}
 return Math.min(...planes.map(p=>p.d*body.r-Math.max(p.n.dot(end.clone().sub(center)),diskSupport(p.n,joint,.0812),diskSupport(p.n,joint,.028),diskSupport(p.n,start,.028))));
}
const observations=[],baseIntersections=[],rodInteriors=[];let states=0,clockFrames=0,arrowInstances=0;
for(const group of groups){
 const proof=JSON.parse(readFileSync(`editorial/reviews/C6-${group}-installed-code-1a35-20261125.json`));
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
    // Base is a real global opaque mesh added by disegna3D/scenaMobile.
    const lower=[-3.375,-.22,-1.725],upper=[3.375,0,1.725];let enter=0,exit=1,hit=true;
    for(let i=0;i<3;i++){const d=a.b[i]-a.a[i];if(Math.abs(d)<1e-15){if(!(a.a[i]>lower[i]&&a.a[i]<upper[i]))hit=false;}else{const ts=[(lower[i]-a.a[i])/d,(upper[i]-a.a[i])/d].sort((a,b)=>a-b);enter=Math.max(enter,ts[0]);exit=Math.min(exit,ts[1]);}}
    if(hit&&exit-enter>1e-8&&enter<1&&exit>0)baseIntersections.push({id:row.id,input:c.x,time:context.time,a:a.a,tip:a.b,baseMin:lower,baseMax:upper,entryFraction:enter,exitFraction:exit});
    for(const body of context.elements){
      if(body.kind!=='rod'||body.alpha!==1||body.openEnded)continue;
      const delta=body.b.map((n,i)=>n-body.a[i]),norm2=delta.reduce((s,n)=>s+n*n,0);if(!norm2)continue;
      const fraction=delta.reduce((s,n,i)=>s+(a.b[i]-body.a[i])*n,0)/norm2;
      const radius=body.r+(body.r2-body.r)*fraction;
      const distance=Math.hypot(...delta.map((n,i)=>a.b[i]-body.a[i]-fraction*n));
      if(fraction>0&&fraction<1&&distance<radius-1e-9)rodInteriors.push({id:row.id,input:c.x,time:context.time,tip:a.b,rodA:body.a,rodB:body.b,radiusAtTip:radius,radialDistance:distance});
    }
   }
  }
 }
}
sphere.dispose();
console.log(JSON.stringify({phase:'LOCAL_C6_VENDOR_MESH_CONTAINMENT_NOT_UI',runtimeSha256:'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba',
 protocolSha256:sha(readFileSync(new URL(import.meta.url))),dependencies:Object.fromEntries(['static/js/banchi/scena.js','static/js/banchi/voci/geometria.js','static/js/banchi/voci/apparati/onde.js','static/js/banchi/voci/apparati/termica.js','static/js/banchi/voci/apparati/fluidi.js','static/js/banchi/voci/apparati/meccanica.js','static/vendor/three-r180/three.module.min.js'].map(p=>[p,sha(readFileSync(p))])),
 sourceMaterialContract:'Source read: opacity1,transparentfalse,depthWritetrue,DoubleSide,defaultdepthTesttrue. No browser-material inspection.',
 sourceMeshContract:'Dynamic unitSphere24x16 scaled byr; actual unit mesh720supportplanes. Cone lengthmin(.24,.32L),radius.0812;shaft.028. Wholeconvexglyphsupportincludesheadapex,allrimpointsandshaftcaps.',
 states,clockFrames,arrowInstances,observations,baseIntersections,rodInteriors,UI:'NOT_RUN',nativeRaster:'NOT_RUN',fallbackRaster:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE',localOnly:true}));
