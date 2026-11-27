// Read-only, five-ID public model adapter; never creates a browser or edits data.
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const app=process.argv[2];
const {esperienza}=await import(pathToFileURL(path.join(app,'static/js/banchi/voci/esperimento.js')).href);
const {n}=await import(pathToFileURL(path.join(app,'static/js/banchi/misure.js')).href);
const points={'SIM-C2-L001-01':[3,2],'SIM-C2-L001-02':[6,4],'SIM-C2-L001-03':[6,5],'SIM-C2-L001-04':[5,7],'SIM-C2-L001-05':[100,90]};
const sources=JSON.parse(readFileSync(path.join(app,'content/esperienze-C2.json'),'utf8')).filter(r=>Object.hasOwn(points,r.id));
if(sources.length!==5)throw Error('Five actual source identities required');
const out=[];
for(const source of sources){
 const a=await esperienza(source);
 out.push({id:source.id,source,params:a.model.params,actualAssessment:a.record.assessment,
  atAssignedControls:points[source.id].map(x=>({x,output:a.model.solve({x}),readings:a.model.readings({x},a.model.solve({x}))})),
  formatted:a.record.assessment.map(t=>({display:n(t.value),parsed:Number(n(t.value).replace(',','.'))}))});
}
console.log(JSON.stringify({scope:'FIVE_INSTALLED_MODELS_TEN_TASKS_NOT_UI',records:out,browser:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
