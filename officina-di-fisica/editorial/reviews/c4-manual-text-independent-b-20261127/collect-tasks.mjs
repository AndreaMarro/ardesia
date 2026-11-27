import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const app=process.argv[2];
const {esperienza}=await import(pathToFileURL(app+'/static/js/banchi/voci/esperimento.js'));
const ids=['L01-01','L01-02','L02-01','L02-02','L02-03','L03-01','L03-02','L03-03'].map(s=>'SIM-C4-'+s);
const sources=JSON.parse(readFileSync(app+'/content/esperienze-C4.json'));
const result=[];
for(const id of ids){const record=sources.find(r=>r.id===id);const a=await esperienza(record);result.push({id,control:record.control,formula:record.formula,interpretation:record.interpretation,assessment:a.record.assessment});}
console.log(JSON.stringify(result));
