import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
import {n} from '../../../static/js/banchi/misure.js';
const here=new URL('./',import.meta.url);
const source=JSON.parse(readFileSync(new URL('source-esperienze-C3-5d1dc8.json',here)));
const ids=['SIM-C3-L03-01','SIM-C3-L03-03','SIM-C3-L03-04','SIM-C3-L04-01','SIM-C3-L04-02','SIM-C3-L04-03'];
const results=[];
for(const id of ids){
 const r=source.find(r=>r.id===id), a=await esperienza(r), c=r.control;
 const grid=Array.from({length:Math.round((c.max-c.min)/c.step)+1},(_,i)=>c.min+i*c.step);
 const extra=grid.filter(x=>Math.abs(x-r.references[0][0])>1e-7&&Math.abs(x-r.references[1][0])>1e-7);
 const selected=[r.references[1][0],extra[Math.floor(extra.length/2)]??r.references[0][0]];
 results.push({id,sourceVersion:r.version,inputUnit:c.unit,outputUnit:r.measure.unit,control:c,
  tasks:a.record.assessment.map((task,i)=>{const answer=id==='SIM-C3-L04-03'&&i===1?76.47:task.value;
   const tolerance=Math.max(.000001,Math.abs(task.value)*.005);
   return {index:i,input:selected[i],formattedInput:n(selected[i]),inputUnit:c.unit,output:task.value,formattedOutput:n(task.value),outputUnit:r.measure.unit,prompt:task.prompt,worked:task.worked,suggestedNumericEntry:answer,entryAcceptedByInstalledNumberRule:Number.isFinite(answer)&&Math.abs(answer-task.value)<=tolerance,acceptanceTolerance:tolerance};}),
  clock:a.clock?{label:a.clock.label,durationAtSelected:selected.map(x=>a.clock.duration(x)),setup:a.clock.setup}:null,
 });
}
writeFileSync(new URL('actual-source-tasks.json',here),JSON.stringify({consumerRef:'b9994b9116e87478905191d85cca8037d17ae4bd',producerSha256:createHash('sha256').update(readFileSync(new URL('../../../static/js/banchi/voci/esperimento.js',here))).digest('hex'),records:results,role:'AUTHOR_SOURCE_CODE_OBSERVATION_NO_BROWSER',UI:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN'},null,2)+'\n');
console.log(JSON.stringify(results.map(r=>({id:r.id,tasks:r.tasks.map(t=>({input:t.input,inputUnit:t.inputUnit,output:t.output,outputUnit:t.outputUnit,entry:t.suggestedNumericEntry,accepted:t.entryAcceptedByInstalledNumberRule})),clock:r.clock}))));
