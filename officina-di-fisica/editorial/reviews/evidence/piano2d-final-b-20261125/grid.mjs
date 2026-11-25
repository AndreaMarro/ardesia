import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const app='/private/tmp/cric-resident-integrator/officina-di-fisica';
const files=['static/js/banchi/tavola.js','static/js/banchi/modelli/piano.js','static/js/banchi/misure.js','static/banchi.css','content/banchi.json'];
const hash=x=>createHash('sha256').update(x).digest('hex');
const before=Object.fromEntries(await Promise.all(files.map(async f=>[f,hash(await readFile(app+'/'+f))])));
// Test-only DOM entry stub permits importing the actual string renderer; no model or assertion is mocked.
globalThis.document={querySelector:()=>null};
const {drawing}=await import(app+'/static/js/banchi/tavola.js');
const {solve}=await import(app+'/static/js/banchi/modelli/piano.js');
const colors={weight:'#ae4745',normal:'#157474',parallel:'#623eaa'};
const near=(x,y)=>assert.ok(Number.isFinite(x)&&Math.abs(x-y)<=2e-10*Math.max(1,Math.abs(y)),`${x} != ${y}`);
const number='[-+]?(?:[0-9]*\\.)?[0-9]+(?:[eE][-+]?[0-9]+)?';
const pattern=new RegExp(`^M(${number}) (${number}) L(${number}) (${number}) m(${number}) (${number}) L(${number}) (${number}) l(${number}) (${number})$`);
function arrows(svg){
 const found={};
 for(const [_,d,c] of svg.matchAll(/<path d="([^"]+)"[^>]*stroke="([^"]+)"/g)){
  const name=Object.keys(colors).find(k=>colors[k]===c);if(!name)continue;
  const m=d.match(pattern);if(!m)continue;
  const [x,y,X,Y,hx,hy,endX,endY,jx,jy]=m.slice(1).map(Number);
  assert.ok(!(name in found));near(X,endX);near(Y,endY);
  found[name]={origin:[x,y],tip:[X,Y],vector:[X-x,Y-y],headPoints:[[X+hx,Y+hy],[X+jx,Y+jy]],arms:[[hx,hy],[jx,jy]]};
 }
 return found;
}
let cases=0,arrowsRead=0;const clipped=[],rampMismatch=[];let maxAngleError=0;
for(let massIndex=1;massIndex<=10;massIndex++)for(let angle=0;angle<=55;angle++)for(let F=-25;F<=25;F++){
 const m=massIndex/2,theta=angle*Math.PI/180,P=m*9.81;
 const p={m,angle,F,ms:.4,mk:.25};const s=solve(p);
 near(s.weight,P);near(s.normal,P*Math.cos(theta));near(s.parallel,-P*Math.sin(theta));
 const svg=drawing('piano',p,s,0,2,'Piano');const a=arrows(svg);
 assert.ok(a.weight&&a.normal);if(angle===0)assert.equal(a.parallel,undefined);else assert.ok(a.parallel);
 const [px,py]=a.weight.vector;near(px,0);assert.ok(py>0);const L=py;
 const expected={normal:[-L*Math.sin(theta)*Math.cos(theta),-L*Math.cos(theta)**2],parallel:[-L*Math.sin(theta)*Math.cos(theta),L*Math.sin(theta)**2]};
 for(const name of ['normal','parallel'])for(let axis=0;axis<2;axis++)near((a[name]?.vector||[0,0])[axis],expected[name][axis]);
 const v=a.parallel?.vector||[0,0];for(let axis=0;axis<2;axis++)near(-a.normal.vector[axis]+v[axis],a.weight.vector[axis]);
 near(Math.hypot(...a.normal.vector)/L,Math.cos(theta));near(Math.hypot(...v)/L,Math.sin(theta));
 for(const [name,arrow] of Object.entries(a)){
  const length=Math.hypot(...arrow.vector);assert.ok(length>0);
  for(const arm of arrow.arms){
   const head=Math.hypot(...arm);assert.ok(head<=9+1e-10&&head<=.3*length+1e-10);
   assert.ok(arm[0]*arrow.vector[0]+arm[1]*arrow.vector[1]<0);
  }
  for(const point of [arrow.origin,arrow.tip,...arrow.headPoints])if(point[0]<0||point[0]>430||point[1]<0||point[1]>198){
   if(F===0&&m===2)clipped.push({angle,name,point});
  }
  arrowsRead++;
 }
 const edge=svg.match(new RegExp(`<path d="M(${number}) (${number}) L(${number}) (${number}) V`));assert.ok(edge);
 const [x0,y0,x1,y1]=edge.slice(1).map(Number),dx=x1-x0,dy=y1-y0;
 const edgeAngle=Math.atan2(-dy,dx),error=Math.abs(edgeAngle-theta)*180/Math.PI;
 maxAngleError=Math.max(maxAngleError,error);
 if(F===0&&m===2&&error>1e-8)rampMismatch.push({angle,edgeAngle:edgeAngle*180/Math.PI,errorDegrees:error});
 cases++;
}
assert.equal(clipped.length,0);assert.ok(maxAngleError<1e-10);
const after=Object.fromEntries(await Promise.all(files.map(async f=>[f,hash(await readFile(app+'/'+f))])));assert.deepEqual(before,after);
const report={schemaVersion:'1.0.0',scope:'Independent force and SVG geometry reading; no candidate or production edits',sourceSha256:before,inputsStable:true,grid:{m:{min:.5,max:5,step:.5},angle:{min:0,max:55,step:1},F:{min:-25,max:25,step:1},cases,arrowsRead},numericForceRatios:'EXACT_ORACLE_NUMERICAL_ROUNDING_ONLY',arrowheadDirectionAndMaximumFraction:'PASS',modelAndVectorAlgebra:'PASS',visibleGeometry:'PASS',clippedEndpoints:clipped,maximumRampAngleMismatchDegrees:maxAngleError,rampMismatchSamples:rampMismatch.filter(x=>[0,18,55].includes(x.angle)),limitations:['Float trigonometric coordinates checked at2e-10 relative tolerance; algebra derived independently in primary.md.','The test DOM stub only avoids UI entry initialization; real solve and drawing functions are imported, never root test assertions.','This review does not assess friction parameter ordering or approve the withdrawn friction scenario.','Browser-rendered text bounds and screenshots are separate evidence; no full canonical UI acceptance or human approval is claimed.'],humanApproval:'NOT_RUN',publication:'DRAFT'};
await writeFile('/private/tmp/cric-piano2d-independent-final/grid-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({cases,arrowsRead,clipped:clipped.length,maxAngleError}));
