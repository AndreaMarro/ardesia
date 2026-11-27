// Allowlist only. Candidate blocks, hints, feedback, numerical answers and bindings are never printed.
import fs from 'node:fs';
import {esperienza} from './consumer/static/js/banchi/voci/esperimento.js';
const D=new URL('.',import.meta.url),pack=JSON.parse(fs.readFileSync(new URL('package.json',D))),originals=JSON.parse(fs.readFileSync(new URL('consumer/content/esperienze-C4.json',D)));
const out=[];
for(const draft of pack.records){
 const source=originals.find(r=>r.id===draft.id),a=await esperienza(draft);
 out.push({id:draft.id,sourceTitle:source.title,sourceSummary:source.summary,sourceData:source.interpretation,sourceControl:source.control,sourceMeasure:source.measure,sourceVisibleGivenLaw:source.formula,tasks:a.record.assessment.map(q=>({prompt:q.prompt,unit:q.unit}))});
}
console.log(JSON.stringify({phase:'STIMULUS_ALLOWLIST_NO_CANDIDATE_SOLUTIONS',sourceLawDisclosure:'The existing visible source-law formula is part of the exercise stimulus; no claim of blind rediscovery of that supplied law.',records:out},null,2));
