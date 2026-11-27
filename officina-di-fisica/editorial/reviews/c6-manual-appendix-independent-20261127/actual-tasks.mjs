import {readFileSync} from 'node:fs';
import {esperienza} from 'file:///private/tmp/cric-resident-integrator/officina-di-fisica/static/js/banchi/voci/esperimento.js';
const root='/private/tmp/cric-resident-integrator/officina-di-fisica';
const sources=JSON.parse(readFileSync(root+'/content/esperienze-C6.json'));
const records=[];
for(const row of sources){
 const actual=await esperienza(row);
 records.push({id:row.id,assessment:actual.record.assessment});
}
console.log(JSON.stringify({scope:'ACTUAL_INSTALLED_GENERATED_TASKS_ONLY_NO_UI',records}));
