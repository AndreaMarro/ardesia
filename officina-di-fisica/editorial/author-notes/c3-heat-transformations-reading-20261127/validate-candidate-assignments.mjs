import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
const here=new URL('./',import.meta.url), app=new URL('../../../',here);
const source=JSON.parse(readFileSync(new URL('source-esperienze-C3-5d1dc8.json',here)));
const pkg=JSON.parse(readFileSync(new URL('editorial/batches/experiment-c3-heat-transformations-reading-20261127.json',app)));
const assignedInputs=[[8,6],[10,11],[200,175],[16.7,18.37],[3,0],[19,28]];
const manual=[['400','300'],['83.14','91.454'],['50','48'],['50','55'],['6.78','0'],['50','76.47']];
const context={};vm.runInNewContext(readFileSync(new URL('static/vendor/katex.min.js',app),'utf8'),context);
const allowed=new Set(['blocks','interpretation','prerequisites','version','baseVersion','review']);
const rows=[];let values=0,frames=0,formulas=0;
assert.equal(pkg.schema,'astra/1');assert.equal(pkg.records.length,6);assert.deepEqual(pkg.assets,[]);
for(const [i,row]of pkg.records.entries()){
 const original=source.find(r=>r.id===row.id);assert.ok(original);assert.equal(row.version,2);assert.equal(row.baseVersion,1);
 for(const key of new Set([...Object.keys(original),...Object.keys(row)]))if(!allowed.has(key))assert.deepEqual(row[key],original[key],row.id+' immutable '+key);
 const before=await esperienza(original),after=await esperienza(row);
 assert.deepEqual(after.record.assessment,before.record.assessment,'actual assignments remain exact');
 assert.deepEqual(after.model.params,before.model.params);
 const cases=[];
 for(const [j,task]of after.record.assessment.entries()){
  const answer=Number(manual[i][j]),tol=Math.max(.000001,Math.abs(task.value)*.005);
  assert.ok(Number.isFinite(answer)&&Math.abs(answer-task.value)<=tol,row.id+' manual Number entry');
  cases.push({input:assignedInputs[i][j],inputUnit:row.control.unit,actualPrompt:task.prompt,modelOutput:task.value,outputUnit:task.unit,manualNumericEntry:manual[i][j],absoluteEntryErrorVsModel:Math.abs(answer-task.value),installedAcceptanceTolerance:tol,acceptedByInstalledNumberRule:true});
 }
 for(const block of row.blocks)if(block.type==='formula'){
  context.katex.renderToString(block.text,{throwOnError:true,strict:'error'});formulas++;
 }
 const c=row.control;
 for(let n=0;n<=Math.round((c.max-c.min)/c.step);n++){
  const x=c.min+n*c.step,p={x},s=before.model.solve(p);assert.deepEqual(after.model.solve(p),s);assert.deepEqual(after.model.readings(p,s),before.model.readings(p,s));assert.deepEqual(after.model.graphs(p,s),before.model.graphs(p,s));values++;
  const times=before.clock?[0,before.clock.duration(x)/2,before.clock.duration(x)]:[undefined];
  for(const time of times){assert.deepEqual(after.elements(x,2,time),before.elements(x,2,time));frames++;}
 }
 rows.push({id:row.id,tasks:cases,sourceVersion:1,candidateVersion:2,baseVersion:1,modelControlGeometryAndClockExact:true,productUI:'NOT_RUN',scientificAcceptance:'PENDING_DISTINCT_REVIEWER',activityCredit:0});
}
const result={sourceRef:'5d1dc8dc7b601aef959d10d564c75462be74708d',consumerRef:'b9994b9116e87478905191d85cca8037d17ae4bd',role:'AUTHOR_TECHNICAL_CHECK_NO_INDEPENDENT_APPROVAL',records:rows,controlValues:values,sceneFrames:frames,katexFormulaCount:formulas,producerSha256:createHash('sha256').update(readFileSync(new URL('static/js/banchi/voci/esperimento.js',app))).digest('hex'),symbolicExpressionNumberRejected:Number.isNaN(Number('1300/17')),productUI:'NOT_RUN',humanApproval:'NOT_RUN',publicationAction:'NONE',activityCredit:0};
writeFileSync(new URL('actual-candidate-assignment-checks.json',here),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({records:rows.length,gradedInputs:12,controlValues:values,sceneFrames:frames,katexFormulas:formulas,browserStarted:false,activityCredit:0}));
