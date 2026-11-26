// Actual installed question producer and original Number grading excerpt.
// No authoring modules, DOM, browser, server, DB or publication are invoked.
import {readFile,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
import {n} from '../../../static/js/banchi/misure.js';
const base=path.dirname(fileURLToPath(import.meta.url)),app=path.resolve(base,'../../..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const packageFile=path.join(app,process.argv[2]||'editorial/batches/experiments-manual-support-revision-263.json');
const packageBytes=process.argv[2]==='-'?readFileSync(0):await readFile(packageFile),pkg=JSON.parse(packageBytes);
const primary=JSON.parse(await readFile(path.join(app,'editorial/reviews/manual-experiments-eight-primary-20261125/exact-primary.json'),'utf8'));
const byId=new Map(primary.records.map(r=>[r.id,r]));
if(pkg.records.length!==8||new Set(pkg.records.map(r=>r.id)).size!==8)throw Error('Expected eight unique candidates');
const graderBytes=await readFile(path.join(app,'static/js/banchi/banco.js'));
const source=graderBytes.toString(),start=source.indexOf('const a = r.assessment[Number(form.dataset.check)]'),end=source.indexOf('let hint =',start);
if(start<0||end<start)throw Error('Original grading block missing');
const block=source.slice(start,end),grade=new Function('r','form','activity',`${block}\nreturn {answer,ok};`);
const score=(value,text)=>grade({assessment:[{value}]},{dataset:{check:'0'},elements:{answer:{value:text}}},true);
const records=[];
for(const row of pkg.records){
 if(row.engine||!byId.has(row.id))throw Error('Unexpected candidate engine or ID');
 const a=await esperienza(row),p=byId.get(row.id);
 if(a.record.assessment.length!==2)throw Error('Two actual generated questions required');
 const questions=a.record.assessment.map((q,i)=>{
  const entry=p.finiteNumberExamples[i],display=n(q.value);
  return {...q,selectedInput:row.assessmentSelection.points[i],finiteManualEntry:entry,
   finiteManualEntryAccepted:score(q.value,entry).ok,commaEntryAccepted:score(q.value,entry.replace('.',',')).ok,
   display,displayNumberRoundtripAccepted:score(q.value,display).ok,
   blankRejected:!score(q.value,'').ok,infiniteRejected:!score(q.value,'Infinity').ok,
   symbolicRejected:!score(q.value,p.exactSolutions[i]).ok};
 });
 if(questions.some(q=>!q.finiteManualEntryAccepted||!q.commaEntryAccepted||!q.displayNumberRoundtripAccepted||!q.blankRejected||!q.infiniteRejected))throw Error('Numeric input behavior differs');
 records.push({id:row.id,selection:row.assessmentSelection,questions,prediction:a.record.prediction,
  unitsDuplicatedInPrompt:questions.some(q=>/°\s*°|\bs\s+s\b/.test(q.prompt)),UI:'NOT_RUN',activityCredit:0});
}
const result={phase:'ACTUAL_INSTALLED_QUESTION_AND_NUMERIC_CODE_PROBE_NOT_PRODUCT_UI',
 packageFileSha256:sha(packageBytes),nodeVersion:process.version,graderFileSha256:sha(graderBytes),graderExcerptSha256:sha(Buffer.from(block)),
 records,actualGeneratedQuestions:records.reduce((s,r)=>s+r.questions.length,0),UI:'NOT_RUN',newUiCases:0,
 authorModulesImported:false,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
if(process.argv[3]==='-')console.log(JSON.stringify(result));
else{const output=path.join(base,process.argv[3]||'effective-questions-db4-diagnostic.json');await writeFile(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({questions:result.actualGeneratedQuestions,duplicatedPromptUnits:records.filter(r=>r.unitsDuplicatedInPrompt).map(r=>r.id)}));}
