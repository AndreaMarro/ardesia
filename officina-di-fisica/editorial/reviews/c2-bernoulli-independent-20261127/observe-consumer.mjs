import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
import {experiments} from '../../../static/js/banchi/voci/modelli/C2.js';
const here=new URL('./',import.meta.url),app=new URL('../../../',here),context={};vm.runInNewContext(readFileSync(new URL('static/vendor/katex.min.js',app),'utf8'),context);
const pkg=JSON.parse(readFileSync(new URL('experiment-c2-bernoulli-reading-20261127.json',here))), originals=JSON.parse(readFileSync(new URL('original-records.json',here)));
const manual=[[16,18.5],[2,8],[4,1],[9,11]];const records=[];let gridCount=0,formulas=0;
for(const[i,row]of pkg.records.entries()){
 const a=await esperienza(row),old=await esperienza(originals.find(r=>r.id===row.id)),c=row.control,controls=[];
 for(let j=0;j<=Math.round((c.max-c.min)/c.step);j++){
  const x=c.min+j*c.step,p={x},s=a.model.solve(p);assert.deepEqual(s,old.model.solve(p));assert.deepEqual(a.elements(x,2),old.elements(x,2));controls.push({x,output:s.y,apparatus:experiments[row.id].apparatus(x,s.y)});gridCount++;
 }
 for(const block of row.blocks)if(block.type==='formula'){context.katex.renderToString(block.text,{throwOnError:true,strict:'error'});formulas++;}
 const tasks=a.record.assessment.map((q,j)=>{assert.ok(Math.abs(q.value-manual[i][j])<=Math.max(.000001,.005*Math.abs(q.value)));return{input:row.assessmentSelection.points[j],inputUnit:c.unit,modelOutput:q.value,outputUnit:q.unit,prompt:q.prompt,worked:q.worked,manualNumericEntry:manual[i][j],NumberAccepted:true};});
 records.push({id:row.id,tasks,controls,hasClock:!!a.clock,legend:a.legend(2,'orbit')});
}
const key='SIM-C2-L006-03',a=await esperienza(pkg.records.find(r=>r.id===key)),s=experiments[key].apparatus(1,2),es=a.elements(1,2);const arrows=es.filter(e=>e.kind==='arrow');
const arrowLengths=arrows.map(e=>Math.hypot(...e.a.map((v,i)=>e.b[i]-v)));const columns=es.filter(e=>e.kind==='rod'&&e.r===.062);
const witness={id:key,inputAreaRatio:1,physicalUpstreamSpeed:2,physicalDownstreamSpeed:2,physicalAreaRatio:s.r2**2/s.r1**2,sourceApparatus:s,arrowLengths,arrowRatio:arrowLengths[1]/arrowLengths[0],pressureColumnTopY:columns.map(e=>e.b[1]),columnHeightDifference:columns[1].b[1]-columns[0].b[1],expectedArrowRatio:1,expectedColumnHeightDifference:0,UIObserved:false,classification:'CODE_REPRESENTATION_FAILURE_NOT_SCALAR_ANSWER_FAILURE'};
writeFileSync(new URL('actual-CPU-observation.json',here),JSON.stringify({consumerRef:'b9994b9116e87478905191d85cca8037d17ae4bd',records,gridCount,katexFormulaCount:formulas,witness,productUI:'NOT_RUN',activityCredit:0},null,2)+'\n');console.log(JSON.stringify({records:records.length,gridCount,formulas,witness}));
