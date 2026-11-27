import {readFileSync,writeFileSync} from 'node:fs';
import {esperienza} from '../../../static/js/banchi/voci/esperimento.js';
const here=new URL('./',import.meta.url),batches=['experiment-c5-wave-basis-reading-20261127','experiment-c5-wave-energy-sound-reading-20261127'];
const entries=[['0.5','0.4'],['4','3'],['1.5','2'],['-2','0'],['4','2'],['4','2.25'],['8','6'],['0.0625','0.1111'],['30','441.2'],['60','40'],['333.3','281.25']],rows=[];
for(const batch of batches)for(const record of JSON.parse(readFileSync(new URL('inputs/'+batch+'.json',here))).records){
 const a=await esperienza(record);rows.push({id:record.id,grid:record.assessmentSelection.points,expectedValues:record.assessmentSelection.points.map(x=>a.model.solve({x}).y),questions:a.record.assessment.map((q,i)=>({input:entries[rows.length][i],expectedAccepted:true,sourceManualReadiness:'INDEPENDENT_SCIENTIFIC_READING_CPU_PASS_UI_PENDING',prompt:q.prompt})),sourcePrediction:a.record.prediction.correct,hasClock:!!a.clock,clockInput:!!a.clock?.input});
}
writeFileSync(new URL('actual-selected-state-compilation.json',here),JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify({records:rows.length,gradedInputs:rows.reduce((n,r)=>n+r.questions.length,0)}));
