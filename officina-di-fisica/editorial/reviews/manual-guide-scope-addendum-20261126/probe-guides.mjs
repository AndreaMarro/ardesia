// Real installed code path only; not a browser/product UI observation.
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import path from 'node:path';import {createHash} from 'node:crypto';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
import {piloti} from '../../../static/js/banchi/quaderno.js';
const base=path.dirname(fileURLToPath(import.meta.url)),app=path.resolve(base,'../../..'),sha=b=>createHash('sha256').update(b).digest('hex');
const pp='editorial/reviews/experiments-manual-support-263-independent-20261125/final-input-snapshot/editorial/batches/experiments-manual-support-revision-263.json';
const bytes=await readFile(path.join(app,pp)),pkg=JSON.parse(bytes);
if(sha(bytes)!=='89541bdaa029e64149860cc3dcfab0f293686c738e5d0d4e8dbf07d3d768b0fc')throw Error('Wrong frozen final candidate');
const examples={'SIM-C3-L07-05':1.25,'SIM-C4-L09-02':5,'SIM-C5-L01-01':.125,'SIM-C5-L02-03':.125,'SIM-C5-L03-02':.55,'SIM-C5-L07-02':2.5,'SIM-C5-L08-02':2.5,'SIM-C5-L09-02':5};
const records=[];
for(const row of pkg.records){
 const a=await esperienza(row),selected=row.assessmentSelection.points,probe=examples[row.id];
 if(piloti[row.id])throw Error('Pilot overrides model.steps; must read separate path');
 const samples=[...selected,probe].map(x=>{const p={x},s=a.model.solve(p);return{input:x,selected:selected.includes(x),output:s,steps:a.model.steps(p,s),measurement:a.measurement(x)};});
 const text=row.blocks.filter(b=>b.type==='text').map(b=>b.text);
 records.push({id:row.id,candidateVersion:row.version,control:row.control,selectedAssessmentInputs:selected,
 actualGradedQuestions:a.record.assessment,nonSelectedInput:probe,pilotOverride:false,samples,
 declaredObservationOnlyOrScopeText:text.filter(t=>/osservazion|cursore|verifiche assegnate|conti assegnati|due domande|quarto.*mezzo|due incidenze/i.test(t)),
 actionInstructionAtNonselectedInput:samples[2].steps[2][1],generatedModelEquation:samples[2].steps[2][2],
 additionalGradedForm:false,UI:'NOT_RUN',activityCredit:0});
}
const pins={};for(const name of ['static/js/banchi/voci/esperimento.js','static/js/banchi/banco.js','static/js/banchi/quaderno.js'])pins[name]=sha(await readFile(path.join(app,name)));
const result={phase:'INSTALLED_GUIDE_CODE_OBSERVATION_NOT_PRODUCT_UI',sourceCandidateCommit:'3a0b5960fd75491df58fd9a58ca72a69beb3d708',candidatePackageSha256:sha(bytes),pins,records,modelsExecuted:8,guideSamples:24,newBrowserCases:0,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
await writeFile(path.join(base,'actual-guide-code.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({records:8,guideSamples:24,nonselectedActionInstructions:records.filter(r=>r.actionInstructionAtNonselectedInput.includes('Sostituisci i dati')).length}));
