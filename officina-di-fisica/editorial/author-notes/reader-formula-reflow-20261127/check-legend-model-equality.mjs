import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [previous,current]=process.argv.slice(2).map(p=>path.resolve(p,'officina-di-fisica'));
const load=async app=>(await import(pathToFileURL(path.join(app,'static/js/banchi/voci/esperimento.js')))).esperienza;
const [before,after]=await Promise.all([load(previous),load(current)]);
let variants=0,states=0;
const known=[];
for(const course of ['C1','C2','C3','C4','C5','C6']){
 const bytes=await fs.readFile(path.join(previous,`content/esperienze-${course}.json`));
 assert.deepEqual(bytes,await fs.readFile(path.join(current,`content/esperienze-${course}.json`)));
 for(const row of JSON.parse(bytes)){
  const [a,b]=await Promise.all([before(row),after(row)]);
  assert.equal(a.legend(1,'orbit'),b.legend(1,'orbit'),row.id);
  if(!['lorentz','ottica'].includes(row.apparatus))assert.equal(a.legend(1,'diagram'),b.legend(1,'diagram'),row.id);
  else{
   assert.match(a.legend(1,'diagram'),/Obliqua o Laterale/);
   assert.doesNotMatch(b.legend(1,'diagram'),/Obliqua o Laterale/);
   known.push(row.id);
  }
  const xValues=new Set([row.control.min,row.control.max,...row.references.map(([x])=>x)]);
  for(const x of xValues){
   assert.deepEqual(a.model.solve({x}),b.model.solve({x}),row.id+' at '+x);
   assert.deepEqual(a.measurement(x),b.measurement(x),row.id+' measurement '+x);
   states++;
  }
  variants++;
 }
}
assert.equal(variants,181);
assert.deepEqual(known.sort(),['SIM-C4-L09-02','SIM-C5-L09-01','SIM-C5-L09-02','SIM-C5-L10-01','SIM-C5-L10-02','SIM-C6-L06-01']);
console.log(JSON.stringify({variants,states,known,sourceExperimentBytesUnchanged:true,nativeLegendByteEquivalent:true,
 scope:'Model and display-text parity for the legend-only change. No scientific acceptance.'}));
