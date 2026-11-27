import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const OUT=path.dirname(fileURLToPath(import.meta.url));
const OLD='/private/tmp/cric-combined-preintegration-20261127/officina-di-fisica',APP='/private/tmp/cric-c1-and-flight-contrast-20261127/officina-di-fisica';
const sha=b=>createHash('sha256').update(b).digest('hex');
const [before,after]=await Promise.all([OLD,APP].map(p=>import(pathToFileURL(p+'/static/js/banchi/voci/esperimento.js'))));
const ids=new Map([
 ['SIM-C1-L006-03',['Distanza fra i centri']],['SIM-C1-L007-01',[]],['SIM-C1-L007-02',['Carrello']],['SIM-C1-L007-03',['Carrello']],
 ['SIM-C4-L01-02',['+1']],['SIM-C5-L05-03',['Sorgente','Ricevitore']],['SIM-C5-L07-03',['Elettrone libero','Elettrone legato']],
]);
const C=0xd49332,records=[];let controls=0,scenes=0,details=0;
for(const course of ['C1','C4','C5']){
 const raw=readFileSync(APP+'/content/esperienze-'+course+'.json');assert.deepEqual(raw,readFileSync(OLD+'/content/esperienze-'+course+'.json'));
 for(const source of JSON.parse(raw).filter(s=>ids.has(s.id))){
  const a=await before.esperienza(source),b=await after.esperienza(source);assert.deepEqual(a.record,b.record);assert.deepEqual(a.observe,b.observe);assert.deepEqual(a.scene.spec,b.scene.spec);assert.deepEqual(a.model.params,b.model.params);
  const n=Math.round((source.control.max-source.control.min)/source.control.step)+1;let count=0,detailCount=0;
  for(let i=0;i<n;i++){
   const x=source.control.min+i*source.control.step;controls++;
   assert.deepEqual(a.model.solve({x}),b.model.solve({x}));assert.equal(a.measurement(x),b.measurement(x));
   const solution=a.model.solve({x});assert.deepEqual(a.model.graphs({x},solution),b.model.graphs({x},solution));assert.deepEqual(a.model.steps({x},solution),b.model.steps({x},solution));
   const times=[undefined];if(a.clock){const duration=a.clock.duration(x,solution.y);assert.equal(b.clock.duration(x,solution.y),duration);times.push(...[0,.25,.5,.75,1].map(f=>duration*f));}
   for(const time of times){
    const v=a.clock?.input&&time!==undefined?time:x;
    const primaryA=a.elements(x,2,time).filter(e=>!e.dettaglio),allB=b.elements(x,2,time),primaryB=allB.filter(e=>!e.dettaglio);
    assert.deepEqual(primaryB,primaryA,source.id+' primary '+v);
    const expected=[];
    if(source.id==='SIM-C1-L006-03'){
     const length=.85*(1/v**2),d=2.4*(v/4);
     if(length>0&&length<.18)for(const k of[-1,1])expected.push({kind:'arrow',a:[k*d,1.90,.82],b:[k*(d-6*length),1.90,.82],c:C,dettaglio:true});
    }else if(source.id==='SIM-C1-L007-02'){
     const length=(v/3)*.65,pos=-2.38+4.76*(v*v)/16;
     if(length>0&&length<.18)expected.push({kind:'arrow',a:[pos,1.56,.80],b:[pos+6*length,1.56,.80],c:C,dettaglio:true});
    }else if(source.id==='SIM-C4-L01-02'){
     const length=.62*((90/v**2)/60),d=.23+1.64*(v/6);
     if(Math.abs(length)>0&&Math.abs(length)<.16)for(const k of[-1,1])expected.push({kind:'arrow',a:[k*d,1.50,.86],b:[k*(d+8*length),1.50,.86],c:C,dettaglio:true});
    }else if(source.id==='SIM-C5-L07-03'){
     const exit=Math.max(0,v-14)/11,pos=.73+(v>=14?.38+1.14*exit:0),length=.75*exit;
     if(exit>0&&exit<=3/11)expected.push({kind:'arrow',a:[pos,2.04,.62],b:[pos+4*length,2.04,.62],c:C,dettaglio:true});
    }
    assert.deepEqual(allB.filter(e=>e.dettaglio),expected,source.id+' details '+v);details+=expected.length;detailCount+=expected.length;
    assert.deepEqual(a.model.readings({x:v},a.model.solve({x:v}),time??0),b.model.readings({x:v},b.model.solve({x:v}),time??0));scenes++;count++;
   }
  }
  records.push({id:source.id,sourceFileSha256:sha(raw),controls:n,scenes:count,details:detailCount,removedNames:ids.get(source.id),originalPrimitivesAndMathematicalOutputsIdentical:true,legends:Object.fromEntries(['orbit','side','top','diagram'].map(v=>[v,b.legend(2,v)]))});
 }
}
for(const rel of ['static/js/banchi/voci/apparati/campi.js','static/js/banchi/voci/apparati/onde.js'])assert.deepEqual(readFileSync(APP+'/'+rel),readFileSync('/private/tmp/cric-composed-input-recovery-20261127/officina-di-fisica/'+rel));
writeFileSync(OUT+'/actual-independent-comparison.json',JSON.stringify({candidateRef:'4cce177d6b73ec58bfd265ff164424226501bcff',runtimeSha256:'91f08d7f0e253778ebf36d8c2241b644e7809ee43884ca9b87d8a854aba650cf',oldCommit:'03f9634d7d6a8dcfe9161990c4d5dbc62e3773f5',records,controls,scenes,details,comparisonC4C5ConsumerModulesIdenticalTo0184:true,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'},null,2)+'\n');
console.log(JSON.stringify({records:records.length,controls,scenes,details}));
