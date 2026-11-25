// Read-only comparison after independent exact primary was already frozen.
// No candidate, authoring code, renderer, DOM or browser is loaded.
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(base,'../../..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const input=JSON.parse(await readFile(path.join(base,'installed-comparison-inputs.json'),'utf8'));
const primaryBytes=await readFile(path.join(base,'exact-primary.json'));
const primary=JSON.parse(primaryBytes);
if(primary.records.length!==8||primary.newCandidatesRead!==0)throw Error('Exact primary not frozen');
const modelFiles={};const modules={};
for(const course of ['C3','C4','C5']){
 const file=`static/js/banchi/voci/modelli/${course}.js`;
 modelFiles[file]=sha(await readFile(path.join(app,file)));
 modules[course]=(await import(pathToFileURL(path.join(app,file)))).experiments;
}
const graderFile='static/js/banchi/banco.js';
const graderBytes=await readFile(path.join(app,graderFile));
const source=graderBytes.toString();
const start=source.indexOf('const a = r.assessment[Number(form.dataset.check)]');
const end=source.indexOf('let hint =',start);
if(start<0||end<start)throw Error('Original grading block not found');
const block=source.slice(start,end);
if(!block.includes('Number.isFinite(answer)')||!block.includes('Math.abs(a.value) * 0.005'))throw Error('Unexpected grading block');
// Exact installed parser/decision excerpt, with only its surrounding r/form
// data supplied by a tiny private fixture. This is not a consumer/UI test.
const grade=new Function('r','form',`${block}\nreturn {answer,ok};`);
const score=(value,text)=>grade({assessment:[{value}]},{dataset:{check:'0'},elements:{answer:{value:text}}});
const records=[];
for(const row of input){
 const course=row.id.split('-')[1],model=modules[course][row.id];
 if(!model||typeof model.measure!=='function')throw Error('Original installed law missing');
 const values=[];
 for(let i=0;i<2;i++){
  const actual=model.measure(Number(row.inputs[i]));
  const expected=row.expectedIndependentNumeric[i];
  if(!Number.isFinite(actual)||Math.abs(actual-expected)>1e-12*Math.max(1,Math.abs(expected)))throw Error(`Installed law differs from exact primary: ${row.id}`);
  const finite=row.finiteNumberExamples[i];
  const result=score(actual,finite);
  if(!result.ok)throw Error(`Finite manual example rejected: ${row.id}`);
  if(!score(actual,finite.replace('.',',')).ok)throw Error('Decimal comma compatibility changed');
  if(score(actual,'').ok||score(actual,'Infinity').ok||score(actual,String(actual+1)).ok)throw Error('Original numeric rejection changed');
  values.push({input:row.inputs[i],installedOriginalValue:actual,independentNumericValue:expected,finiteExample:finite,finiteExampleAccepted:true});
 }
 records.push({id:row.id,values,activityCredit:0,UI:'NOT_RUN'});
}
const symbols=['800/27','sqrt(2)','asin(1/3)','arcsin(1/3)','≈19.5'];
for(const text of symbols)if(score(19.5,text).ok)throw Error('Symbolic input unexpectedly accepted');
const result={phase:'INSTALLED_ORIGINAL_LAW_AND_EXACT_GRADING_EXCERPT_ONLY',
 independentPrimarySha256:sha(primaryBytes),nodeVersion:process.version,modelFiles,
 graderFile,graderFileSha256:sha(graderBytes),graderExcerptSha256:sha(Buffer.from(block)),
 originalGraderExcerpt:block,records,modelEvaluations:16,finiteExamplesAccepted:16,
 symbolicInputsRejected:symbols,newCandidateModulesRead:0,
 limit:'Comparison at proposed input pairs is not evidence of future candidate delivery, actual generated questions, geometry, clock or UI. Machine-float comparison does not replace the independent exact derivation.',
 activityCredit:0,UI:'NOT_RUN',humanApproval:'NOT_RUN',publicationAction:'NONE'};
await writeFile(path.join(base,'installed-comparison.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({records:records.length,modelEvaluations:16,finiteExamplesAccepted:16,symbolicInputsRejected:symbols.length}));
