// Independent primary-derived numerical evaluation, fresh process, zero candidate imports.
import assert from 'node:assert/strict';
const controls={
 'SIM-C4-L09-01':[-6,6,.5],
 'SIM-C4-L09-03':[.5,4,.25],
 'SIM-C4-L10-01':[0,180,5],
 'SIM-C4-L10-02':[-4,4,.5],
 'SIM-C4-L10-03':[.25,4,.25],
 'SIM-C4-L10-04':[-6,6,1]};
function value(id,x){
 if(id==='SIM-C4-L09-01')return 4*x;
 if(id==='SIM-C4-L09-03')return 12/x;
 if(id==='SIM-C4-L10-01')return x===90?0:6*Math.cos(x*Math.PI/180);
 if(id==='SIM-C4-L10-02'||id==='SIM-C4-L10-04')return -x/2;
 return -2/x;
}
const tasks={
 'SIM-C4-L09-01':[{x:5,exact:'20',unit:'µT'},{x:-2,exact:'-8',unit:'µT'}],
 'SIM-C4-L09-03':[{x:3,exact:'4',unit:'cm'},{x:1,exact:'12',unit:'cm'}],
 'SIM-C4-L10-01':[{x:120,exact:'-3',unit:'mWb'},{x:60,exact:'3',unit:'mWb'}],
 'SIM-C4-L10-02':[{x:3,exact:'-3/2',unit:'V'},{x:-2,exact:'1',unit:'V'}],
 'SIM-C4-L10-03':[{x:2,exact:'-1',unit:'V'},{x:.5,exact:'-4',unit:'V'}],
 'SIM-C4-L10-04':[{x:6,exact:'-3',unit:'A'},{x:-4,exact:'2',unit:'A'}]};
const records=[];
for(const[id,[lo,hi,step]]of Object.entries(controls)){
 const states=[];for(let i=0;i<=Math.round((hi-lo)/step);i++){const x=lo+i*step,y=value(id,x);assert.ok(Number.isFinite(y));states.push({x,independentIEEE:y});}
 records.push({id,states,tasks:tasks[id].map(t=>({...t,independentIEEE:value(id,t.x)}))});
}
assert.equal(records.reduce((n,r)=>n+r.states.length,0),123);
console.log(JSON.stringify({phase:'SOURCE_PRIMARY_MODEL_BEFORE_CANDIDATE_BLOCKS','primarySha256':'c039d58631fc38fd2984530169cdaeaace4e21930ac0ad7c2fef53acfd048499','candidateImports':[],'isolation':'FRESH_NODE_PROCESS_NO_CONSUMER_MODULES','trigonometry':'Exact manual cos120=-1/2,cos60=1/2 remains distinct from standard IEEE evaluation; no epsilon comparison.','excludedID':'SIM-C4-L09-02',records}));
