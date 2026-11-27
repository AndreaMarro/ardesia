import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const app=process.argv[2],{esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const originals=JSON.parse(readFileSync(new URL('./original-C3.json',import.meta.url))),pack=JSON.parse(readFileSync(new URL('./candidate-package.json',import.meta.url)));
const banco=readFileSync(app+'/static/js/banchi/banco.js','utf8');
const start=banco.indexOf('const a = r.assessment[Number(form.dataset.check)]');
const end=banco.indexOf("let hint = 'Rivedi il calcolo. ';",start);assert.ok(start>0&&end>start);
const actualBlock=banco.slice(start,end);
writeFileSync(new URL('./actual-grader-block.js.txt',import.meta.url),actualBlock);
// Execute the unchanged numeric block. No browser/DOM event or UI claim.
const grade=new Function('r','activity','form',actualBlock+';return {answer,ok};');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');const results=[];
const literals=[['80','60'],['160','140'],['30','40'],['323.15','298.15'],['40','53.33'],['400','325']];
for(const [i,row]of pack.records.entries()){
 const a=await esperienza(row),old=await esperienza(originals.find(r=>r.id===row.id));
 const states=[],c=row.control;
 for(let j=0;j<=Math.round((c.max-c.min)/c.step);j++){
  const x=c.min+j*c.step,s=a.model.solve({x});assert.deepEqual(s,old.model.solve({x}));
  for(const stage of [0,2])assert.deepEqual(a.elements(x,stage),old.elements(x,stage));
  states.push({x,solve:s,measurement:a.measurement(x),elementsSha256:hash(a.elements(x,2))});
 }
 assert.deepEqual(a.model.params,old.model.params);
 const grades=literals[i].map((text,j)=>grade(a.record,a,{dataset:{check:String(j)},elements:{answer:{value:text}}}));
 const negativeGrades=['','Infinity','NaN'].map(text=>grade(a.record,a,{dataset:{check:'0'},elements:{answer:{value:text}}}));
 results.push({id:row.id,points:row.assessmentSelection.points,assessment:a.record.assessment,states,grades,negativeGrades});
}
console.log(JSON.stringify({phase:'CPU_ONLY_NOT_BROWSER',results,graderBlockSha256:createHash('sha256').update(actualBlock).digest('hex')}));
