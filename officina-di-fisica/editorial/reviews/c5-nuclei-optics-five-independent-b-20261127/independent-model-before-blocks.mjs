// Independent fresh Node model: no consumer imports and no candidate keys.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const D=new URL('.',import.meta.url),stimuli=JSON.parse(readFileSync(new URL('stimuli-prompt-data-only.json',D)));
const value=(id,x)=>({
 'SIM-C5-L08-01':()=>6+x,
 'SIM-C5-L08-03':()=>[-2,1,0][x-1],
 'SIM-C5-L09-01':()=>2*x,
 'SIM-C5-L10-01':()=>100/x,
 'SIM-C5-L10-02':()=>10-100/x
}[id]());
const exactTasks=[['13','14'],['-2','1'],['40','100'],['20','5'],['-10','5']];
console.log(JSON.stringify({phase:'SOURCE_PRIMARY_MODEL_BEFORE_CANDIDATE_BLOCKS',primarySha256:createHash('sha256').update(readFileSync(new URL('primary-before-blocks.md',D))).digest('hex'),candidateImports:[],isolation:'FRESH_NODE_PROCESS_NO_CONSUMER_MODULES',records:stimuli.records.map((r,i)=>({id:r.id,states:Array.from({length:Math.round((r.control.max-r.control.min)/r.control.step)+1},(_,j)=>{const x=r.control.min+j*r.control.step;return{x,independentIEEE:value(r.id,x)}}),tasks:r.proposedPointsOnly.map((x,j)=>({x,exact:exactTasks[i][j],unit:r.measure.unit,independentIEEE:value(r.id,x)}))}))}));
