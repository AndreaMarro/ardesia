import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {esperienza} from 'file:///private/tmp/cric-resident-integrator/officina-di-fisica/static/js/banchi/voci/esperimento.js';
const raw=readFileSync(new URL('package.json',import.meta.url)),row=JSON.parse(raw).records[0],a=await esperienza(row);
console.log(JSON.stringify({kind:'ACTUAL_CODE_ONLY_264_NOT_BROWSER',packageSha256:createHash('sha256').update(raw).digest('hex'),id:row.id,assessment:a.record.assessment,prediction:a.record.prediction,steps:a.model.steps({x:175},a.model.solve({x:175})),grid:Array.from({length:11},(_,i)=>{const x=50+25*i,s=a.model.solve({x});return{x,solve:s,readings:a.model.readings({x},s)};}),UI:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
