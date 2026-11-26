import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
// Only the pure renderer is exercised; ui.js reads its unused main element at import.
globalThis.document ??= {querySelector:()=>null};
const root=process.env.ASTRA_DIAGRAM_TEST_ROOT ? pathToFileURL(path.resolve(process.env.ASTRA_DIAGRAM_TEST_ROOT)+'/') : new URL('../',import.meta.url);
const {drawing}=await import(new URL('static/js/banchi/tavola.js',root));
const {solve,params}=await import(new URL('static/js/banchi/modelli/piano.js',root));
const {defaults,inRange}=await import(new URL('static/js/banchi/misure.js',root));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} ≠ ${b}`);
function vectors(svg){
 const result={};
 for(const [,d,color] of svg.matchAll(/<path d="([^"]+)"[^>]*stroke="([^"]+)"/g)){
  const m=d.match(/^M([\d.e+\-]+) ([\d.e+\-]+) L([\d.e+\-]+) ([\d.e+\-]+)/);
  if(m)result[color]=[Number(m[3])-Number(m[1]),Number(m[4])-Number(m[2])];
 }
 return {weight:result['#ae4745'],normal:result['#157474'],parallel:result['#623eaa']||[0,0]};
}
test('Piano2D: normale e peso nella stessa scala su tutta la griglia angolare e di massa',()=>{
 let cases=0;
 for(let m=.5;m<=5;m+=.5)for(let angle=0;angle<=55;angle++)for(const F of [-25,0,25]){
  const p={...defaults(params),m,angle,F};assert.ok(inRange(params,p));const s=solve(p);
  const v=vectors(drawing('piano',p,s,0,2,'Piano'));
  close(Math.hypot(...v.normal)/Math.hypot(...v.weight),s.normal/s.weight);cases++;
 }
 assert.equal(cases,1680);
});
test('Piano2D: normale opposta a Pperp e Ppar ricostruiscono il peso vettorialmente',()=>{
 for(const angle of [0,1,18,30,55]){
  const p={...defaults(params),angle};const s=solve(p);const svg=drawing('piano',p,s,0,2,'Piano');const v=vectors(svg);
  for(const axis of [0,1])close(-v.normal[axis]+v.parallel[axis],v.weight[axis]);
  assert.ok(svg.includes('scala comune'));
 }
});
test('Una componente piccola mantiene una punta più corta della freccia',()=>{
 const p={...defaults(params),angle:1};const s=solve(p);const svg=drawing('piano',p,s,0,2,'Piano');
 const d=[...svg.matchAll(/<path d="([^"]+)"[^>]*stroke="#623eaa"/g)][0][1];
 const match=d.match(/^M([\d.e+\-]+) ([\d.e+\-]+) L([\d.e+\-]+) ([\d.e+\-]+) m([\d.e+\-]+) ([\d.e+\-]+)/);
 const shaft=Math.hypot(Number(match[3])-Number(match[1]),Number(match[4])-Number(match[2]));
 close(Math.hypot(Number(match[5]),Number(match[6]))/shaft,.3);
});

test('Il bordo del piano segue la tangente fisica e vettori restano nel viewport',()=>{
 for(let angle=0;angle<=55;angle++){
  const p={...defaults(params),angle};const s=solve(p);const svg=drawing('piano',p,s,0,2,'Piano');
  const rail=svg.match(/<path d="M([\d.e+\-]+) ([\d.e+\-]+) L([\d.e+\-]+) ([\d.e+\-]+)/);
  const tangent=[Number(rail[3])-Number(rail[1]),Number(rail[4])-Number(rail[2])];
  const v=vectors(svg);close((tangent[0]*v.normal[0]+tangent[1]*v.normal[1])/Math.hypot(...tangent)/Math.hypot(...v.normal),0);
  for(const [,d,color] of svg.matchAll(/<path d="([^"]+)"[^>]*stroke="([^"]+)"/g)){
   if(!['#ae4745','#157474','#623eaa'].includes(color))continue;
   const m=d.match(/^M([\d.e+\-]+) ([\d.e+\-]+) L([\d.e+\-]+) ([\d.e+\-]+)/);
   for(const index of [1,3])assert.ok(Number(m[index])>=10&&Number(m[index])<=420);
   for(const index of [2,4])assert.ok(Number(m[index])>=10&&Number(m[index])<=188);
  }
 }
});
