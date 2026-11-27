// Capture actual installed instrument calls before the shared arrow filter.
// Values are geometry units and intrinsic SVG viewBox units, never CSS pixels.
import {readFileSync} from 'node:fs';
import {esperienza} from 'file:///private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/static/js/banchi/voci/esperimento.js';
import {resolveEngine} from 'file:///private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/static/js/banchi/voci/engines.js';
const out=new URL('.',import.meta.url),groups=['state','calorimetry','first-law','paths','entropy'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),len=e=>Math.hypot(...e.b.map((v,i)=>v-e.a[i]));
const projected=e=>Math.hypot(47*(e.b[0]-e.a[0])+16*(e.b[2]-e.a[2]),-44*(e.b[1]-e.a[1])+11*(e.b[2]-e.a[2]));
const records=[];let states=0;const unexpected=[];
for(const group of groups)for(const observed of JSON.parse(readFileSync(new URL(group+'-actual-code.json',out))).records){
 const a=await esperienza(observed.sourceRecord),{law,instrument}=await resolveEngine(observed.sourceRecord),cases=[];
 for(const c of observed.cases){
  const frames=[{kind:'grid',x:c.x,elements:c.elements},...c.clockSamples.map((s,i)=>({kind:'clock',index:i,x:c.x,time:s.time,elements:s.elements}))];
  for(const f of frames){
   states++;const raw=[],b=Object.fromEntries(['box','ball','rod','line','label','ring'].map(k=>[k,()=>{}]));b.arrow=(aa,bb,color)=>raw.push({a:aa,b:bb,c:color});
   let x=f.x;if(a.clock?.input&&f.time!==undefined)x=f.time;const y=a.model.solve({x}).y,state=law.apparatus(x,y);
   if(a.clock?.frame&&f.time!==undefined)Object.assign(state,a.clock.frame(x,f.time,y));instrument(b,state);
   const actual=f.elements.filter(e=>e.kind==='arrow').map(({a,b,c})=>({a,b,c})),retained=raw.filter(e=>len(e)>.015);
   if(!same(actual,retained))unexpected.push({id:observed.id,x:f.x,time:f.time,scope:'raw instrument calls vs effective installed arrow elements'});
   cases.push({kind:f.kind,index:f.index,x:f.x,time:f.time,arrows:raw.map((e,i)=>({...e,worldLength:len(e),fallbackIntrinsicLength:projected(e),retainedByActualRenderer:len(e)>.015,physicalZero:len(e)===0})),actualArrowCount:actual.length});
  }
 }
 records.push({id:observed.id,apparatus:observed.sourceRecord.apparatus,legend:observed.legend,cases});
}
const omitted=records.flatMap(r=>r.cases.flatMap(c=>c.arrows.filter(a=>!a.physicalZero&&!a.retainedByActualRenderer).map(a=>({id:r.id,kind:c.kind,x:c.x,time:c.time,...a}))));
console.log(JSON.stringify({phase:'ACTUAL_INSTRUMENT_AND_SHARED_FILTER_CENSUS_NOT_PIXELS',runtime:'cf979c7de2d6072da0f998cf581eb09fd5a7e966904abe9ac722e82bc56dbb57',states,records,nonzeroOmitted:omitted,unexpectedRawVsInstalled:unexpected,lengthUnits:{worldLength:'scene geometry units',fallbackIntrinsicLength:'unscaled SVG viewBox units, not CSS pixels'},UI:'PENDING_REMOTE',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
