import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
const here=new URL('./',import.meta.url);
const pkg=JSON.parse(readFileSync(new URL('experiment-c5-wave-energy-sound-reading-20261127.json',here)));
const originals=JSON.parse(readFileSync(new URL('original-records.json',here)));
const manual=[[4,2.25],[8,6],[.0625,.1111],[30,441.2],[60,40],[333.3,281.25]], records=[];
let gridCount=0,clockCount=0;
for(const [i,row]of pkg.records.entries()){
 const a=await esperienza(row),original=await esperienza(originals.find(r=>r.id===row.id));
 const controls=[],c=row.control;
 for(let index=0;index<=Math.round((c.max-c.min)/c.step);index++){
  const x=c.min+index*c.step, p={x},s=a.model.solve(p);assert.deepEqual(s,original.model.solve(p));
  const times=a.clock?[0,a.clock.duration(x,s.y)/4,a.clock.duration(x,s.y)/2,a.clock.duration(x,s.y)]:[];
  const clocks=times.map(time=>({time,signal:a.clock.signal?.(x,time,s.y),readings:a.model.readings(p,s,time)}));
  controls.push({x,output:s.y,clocks});gridCount++;clockCount+=clocks.length;
 }
 const tasks=a.record.assessment.map((task,index)=>{
  const entry=manual[i][index],tolerance=Math.max(.000001,Math.abs(task.value)*.005);assert.ok(Math.abs(entry-task.value)<=tolerance);
  return {input:row.assessmentSelection.points[index],inputUnit:c.unit,exactManualNumericEntry:entry,modelOutput:task.value,outputUnit:task.unit,prompt:task.prompt,worked:task.worked,entryAcceptedByInstalledNumberRule:true};
 });
 records.push({id:row.id,tasks,controls,clockSetup:a.clock?.setup??null});
}
writeFileSync(new URL('actual-consumer-observation.json',here),JSON.stringify({consumerRef:'b9994b9116e87478905191d85cca8037d17ae4bd',records,gridCount,clockCount,productUI:'NOT_RUN',activityCredit:0},null,2)+'\n');
console.log(JSON.stringify({records:records.length,gridCount,clockCount,numericEntries:12,productUI:'NOT_RUN',activityCredit:0}));
