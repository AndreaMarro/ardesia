import type {Capability,Parameters,ScienceResult} from './types';
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=10000;
const number=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=1e100;
const array=(v:unknown,max:number):v is unknown[]=>Array.isArray(v)&&v.length>0&&v.length<=max;
const numbers=(v:unknown):v is number[]=>array(v,1000)&&v.every(number);
function validPlot(p:unknown){
  if(!record(p)||!text(p.id)||!text(p.label)||!text(p.unit)||!array(p.series,20))return false;
  const x=p.x!==undefined,categories=p.categories!==undefined;
  if(x===categories)return false;
  if(x&&(!numbers(p.x)||!text(p.xUnit)))return false;
  if(categories&&(!array(p.categories,1000)||!p.categories.every(text)))return false;
  const length=(x?p.x:p.categories) as unknown[];
  return p.series.every(s=>record(s)&&text(s.label)&&numbers(s.values)&&s.values.length===length.length);
}

/** Admit a bounded canonical response before it can affect a graph or number.
 * This validates transport structure/binding, never the physical equations.
 */
export function checkResult(value:unknown,c:Capability,p:Parameters):ScienceResult{
  const reject=()=>{throw new Error('incompatible_science_result');};
  if(!record(value)||value.assessment!=='MODEL_COMPARISON_NOT_A_GRADE'||!record(value.result))return reject();
  const r=value.result;
  if(r.activityId!==c.id||r.version!==c.version||r.dataVersion!==1||r.unit!==c.primaryOutput.unit
    ||!number(r.value)||!text(r.domain)||r.editorialStatus!=='DRAFT'||r.distribution!=='BUNDLED_FIRST_PARTY'
    ||!record(r.parameters)||JSON.stringify(Object.keys(r.parameters).sort())!==JSON.stringify(Object.keys(p).sort())
    ||Object.entries(p).some(([k,v])=>(r.parameters as Record<string,unknown>)[k]!==v)
    ||!array(r.observables,30)||!r.observables.every(o=>record(o)&&text(o.key)&&text(o.label)&&text(o.unit)&&number(o.value))
    ||!array(r.plots,20)||!r.plots.every(validPlot))return reject();
  if(r.raySegments!==undefined&&(!array(r.raySegments,20)||!r.raySegments.every(s=>record(s)&&text(s.label)
    &&(s.style==='solid'||s.style==='dashed')&&array(s.points,100)&&s.points.length>=2
    &&s.points.every(point=>Array.isArray(point)&&point.length===2&&point.every(number)))))return reject();
  return r as ScienceResult;
}
