// Local mesh-halfspace proof only. No DOM, browser, pixels or activity credit.
import * as T from '../../static/vendor/three-r180/three.module.min.js';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const state=JSON.parse(readFileSync('editorial/reviews/C3-state-installed-code-1a35-20261125.json'));
const fridge=JSON.parse(readFileSync('editorial/reviews/C3-entropy-installed-code-1a35-20261125.json'));
const thermometer=state.records.find(r=>r.id==='SIM-C3-L01-04');
const caps=[];
for(const x of [-50,-45,-40]){
 const es=thermometer.cases.find(c=>c.x===x).elements;
 const ball=es.find(e=>e.kind==='ball'&&e.alpha===1);
 const rod=es.find(e=>e.kind==='rod'&&e.alpha===1);
 const cap=new T.Vector3(...rod.b).sub(new T.Vector3(...ball.p));
 const margins=[];
 // Both static radius geometry and dynamic unit-sphere scaling are supported.
 for(const scaleFirst of [false,true]){
  const g=new T.SphereGeometry(scaleFirst?1:ball.r,24,16),pos=g.attributes.position,index=g.index;
  let minimum=Infinity,faces=0;
  for(let i=0;i<index.count;i+=3){
   const p=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(pos,index.getX(i+j)).multiplyScalar(scaleFirst?ball.r:1));
   const normal=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));
   if(normal.length()<1e-12)continue;
   normal.normalize();let offset=normal.dot(p[0]);
   if(offset<0){normal.negate();offset=-offset;}
   // Sup over every point of horizontal circular cap, not just tip/axis.
   const support=normal.dot(cap)+rod.r*Math.hypot(normal.x,normal.z);
   minimum=Math.min(minimum,offset-support);faces++;
  }
  margins.push({geometry:scaleFirst?'dynamic_unit_scaled':'static_radius',faces,minimumPlaneMargin:minimum,entireCapInside:minimum>0});g.dispose();
 }
 if(margins.some(m=>m.entireCapInside)!==(x!==-40))throw Error('Unexpected thermometer containment control');
 caps.push({input:x,center:rod.b,radius:rod.r,bulbCenter:ball.p,bulbRadius:ball.r,margins});
}
const boxes=[];
for(const x of [70,75,80]){
 const es=fridge.records[0].cases.find(c=>c.x===x).elements;
 const box=es.find(e=>e.kind==='box'&&e.p[0]===-2);
 const arrow=es.find(e=>e.kind==='arrow'&&e.c===box.c);
 const min=box.p.map((c,i)=>c-box.size[i]/2),max=box.p.map((c,i)=>c+box.size[i]/2);
 const axisMargins=arrow.b.map((c,i)=>Math.min(c-min[i],max[i]-c));
 const contained=axisMargins.every(m=>m>0);
 if(contained!==(x!==70))throw Error('Unexpected box containment control');
 boxes.push({input:x,tip:arrow.b,min,max,axisMargins,tipStrictlyInside:contained,wholeConeClaim:false});
}
const mat=new T.MeshStandardMaterial();
console.log(JSON.stringify({phase:'LOCAL_MESH_HALFSPACE_CODE_PROOF_NOT_UI',runtimeSha256:state.runtimeProfileBefore,
 protocolSha256:sha(readFileSync(new URL(import.meta.url))),
 dependencies:Object.fromEntries(['static/js/banchi/scena.js','static/js/banchi/voci/geometria.js','static/js/banchi/voci/apparati/termica.js','static/vendor/three-r180/three.module.min.js'].map(p=>[p,sha(readFileSync(p))])),
 materialSourceContract:'scena.js source read: opacity1 transparentfalse depthWritetrue DoubleSide; defaultdepthTest verified below. These are not a browser material inspection.',
 defaultMaterialDepthTest:mat.depthTest,thermometerCaps:caps,fridgeTips:boxes,
 UI:'NOT_RUN',nativeRaster:'NOT_RUN',fallbackRaster:'NOT_RUN',humanApproval:'NOT_RUN',activityCredit:0,publicationAction:'NONE',localOnly:true}));
mat.dispose();
