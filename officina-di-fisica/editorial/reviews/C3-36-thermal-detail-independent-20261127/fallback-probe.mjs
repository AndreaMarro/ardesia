import {readFileSync,writeFileSync} from 'node:fs';
import {esperienza} from 'file:///private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/static/js/banchi/voci/esperimento.js';
globalThis.document={querySelector:()=>null}; // UI main binding only; no DOM rendering or browser claim.
const {disegna2D}=await import('file:///private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/static/js/banchi/voci/tavola.js');
const rows=JSON.parse(readFileSync('/private/tmp/cric-vector-apparatus-author-20261126/officina-di-fisica/content/esperienze-C3.json'));
const choices=[['SIM-C3-L04-03',1,0.125,'phase-minimum-detail'],['SIM-C3-L09-01',5,undefined,'fridge-minimum-detail'],['SIM-C3-L09-02',10,undefined,'engine-minimum-detail'],['SIM-C3-L09-02',200,undefined,'engine-maximum-primary']];
const result=[];
for(const[id,x,t,name]of choices){const a=await esperienza(rows.find(r=>r.id===id)),elements=a.elements(x,2,t);const svg=disegna2D(elements,id,'bench-diagram',260);writeFileSync(new URL(name+'.svg',import.meta.url),svg);result.push({id,x,t,name,legend:a.legend(2,'diagram'),arrows:elements.filter(e=>e.kind==='arrow')});}
console.log(JSON.stringify({phase:'ACTUAL_FALLBACK_SVG_NOT_BROWSER_PIXELS',result,UI:'NOT_RUN',activityCredit:0}));
