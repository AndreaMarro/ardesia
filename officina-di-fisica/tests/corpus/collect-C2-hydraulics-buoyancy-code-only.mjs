// Independent collection of installed models; no DOM, browser, UI or scientific approval.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {esperienza} from '../../static/js/banchi/voci/esperimento.js';
import {n} from '../../static/js/banchi/misure.js';

const app=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sourceRef='5d1dc8dc7b601aef959d10d564c75462be74708d';
const sourcePath='officina-di-fisica/content/esperienze-C2.json';
const raw=execFileSync('git',['show',sourceRef+':'+sourcePath],{cwd:app});
const ids=['SIM-C2-L003-02','SIM-C2-L003-03','SIM-C2-L004-01','SIM-C2-L004-02','SIM-C2-L004-03'];
const rows=JSON.parse(raw).filter(r=>ids.includes(r.id));
if(rows.length!==5||new Set(rows.map(r=>r.id)).size!==5)throw Error('Source identity incomplete');
const records=[];
for(const row of rows){
  const a=await esperienza(row),c=row.control;
  const count=Math.round((c.max-c.min)/c.step)+1,cases=[];
  let firstGraph;
  for(let i=0;i<count;i++){
    const x=c.min+i*c.step,s=a.model.solve({x}),graphs=a.model.graphs({x},s);
    if(!firstGraph)firstGraph=graphs;
    cases.push({x,solve:s,readings:a.model.readings({x},s),elements:a.elements(x,2),
      graphs,steps:a.model.steps({x},s),measurement:a.measurement(x)});
  }
  records.push({id:row.id,sourceVersion:row.version,params:a.model.params,clock:a.clock,
    prediction:a.record.prediction,assessment:a.record.assessment,spec:a.scene.spec,
    legend:a.legend(),observe:a.observe,cases,
    assessmentFormat:a.record.assessment.map(t=>({value:t.value,display:n(t.value),parsed:Number(n(t.value).replace(',','.'))}))});
}
console.log(JSON.stringify({phase:'INSTALLED_CODE_COLLECTION_ONLY_NOT_UI',sourceRef,sourcePath,
  sourceFileSha256:createHash('sha256').update(raw).digest('hex'),
  protocolSha256:createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex'),
  sourceIds:ids,records,UI:'NOT_RUN',scientificApproval:false,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
