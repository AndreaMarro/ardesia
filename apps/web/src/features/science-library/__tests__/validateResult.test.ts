import {describe,expect,it} from 'vitest';
import {checkResult} from '../validateResult';
import fixtures from './fixtures.json';
import type {Capability,ScienceResult} from '../types';
const capability=fixtures.catalog.capabilities[0] as unknown as Capability;
const results=fixtures.results as unknown as Record<string,ScienceResult>;
const result=results['collision-1d-v1'];
const answer=()=>({result:structuredClone(result),prediction:'1',assessment:'MODEL_COMPARISON_NOT_A_GRADE'});

describe('canonical response admission before drawing',()=>{
 it('admits actual Core datasets for all four capabilities',()=>{
  for(const item of fixtures.catalog.capabilities){
   const c=item as unknown as Capability;
   const r=results[c.id];
   expect(checkResult({result:r,prediction:'synthetic',assessment:'MODEL_COMPARISON_NOT_A_GRADE'},c,r.parameters)).toEqual(r);
  }
 });
 it.each(['nonfinite-x','length-mismatch','huge-series','nonfinite-ray','missing-parameters','wrong-configuration'])(
  'rejects %s rather than drawing a misleading response',kind=>{
   const value:Record<string,unknown>=structuredClone(answer());
   const r=value.result as Record<string,unknown>;
   if(kind==='nonfinite-x')r.plots=[{id:'x',label:'Position',unit:'m',xUnit:'s',x:[NaN],series:[{label:'Data',values:[1]}]}];
   if(kind==='length-mismatch')r.plots=[{id:'x',label:'Position',unit:'m',xUnit:'s',x:[1,2],series:[{label:'Data',values:[1]}]}];
   if(kind==='huge-series')r.plots=[{id:'x',label:'Position',unit:'m',xUnit:'s',x:Array(1001).fill(1),series:[{label:'Data',values:Array(1001).fill(1)}]}];
   if(kind==='nonfinite-ray')r.raySegments=[{label:'Ray',style:'solid',points:[[0,0],[Infinity,1]]}];
   if(kind==='missing-parameters')r.parameters=null;
   if(kind==='wrong-configuration')r.parameters={...result.parameters,mass1:100};
   expect(()=>checkResult(value,capability,result.parameters)).toThrow('incompatible_science_result');
  });
});
