// Read-only effective questions on current installed code; no renderer/browser.
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {esperienza} from 'file:///private/tmp/cric-resident-integrator/officina-di-fisica/static/js/banchi/voci/esperimento.js';
const root='/private/tmp/cric-resident-integrator',ref='cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc',p='officina-di-fisica/editorial/batches/experiments-manual-support-revision-263.json';
const raw=execFileSync('git',['show',ref+':'+p],{cwd:root}),pkg=JSON.parse(raw),row=pkg.records.find(r=>r.id==='SIM-C3-L07-05');
const a=await esperienza(row),points=row.assessmentSelection.points;
console.log(JSON.stringify({candidateRef:ref,packageSha256:createHash('sha256').update(raw).digest('hex'),id:row.id,version:row.version,baseVersion:row.baseVersion,assessmentSelection:row.assessmentSelection,assessment:a.record.assessment,lawAtSelected:points.map(x=>({x,y:a.model.solve({x}).y})),UI:'NOT_RUN',activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'}));
