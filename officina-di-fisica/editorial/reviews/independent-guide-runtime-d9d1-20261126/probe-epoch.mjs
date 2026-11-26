// Independent data and code-path probe. A tiny selector fixture below is NOT a browser or product UI.
import {readFile,writeFile} from 'node:fs/promises';import{execFileSync}from'node:child_process';
import {fileURLToPath,pathToFileURL}from'node:url';import path from'node:path';import{createHash}from'node:crypto';
const base=path.dirname(fileURLToPath(import.meta.url)),core=path.resolve(base,'../../..'),candidate=process.env.ASTRA_REVIEW_APP;
const sha=b=>createHash('sha256').update(b).digest('hex'),ref='cbc64655906e0a3c990c74cdd7fe613d57e130e9';
const file='static/js/banchi/voci/esperimento.js',producer=await readFile(path.join(candidate,file));
if(!producer.equals(execFileSync('git',['show',ref+':officina-di-fisica/'+file],{cwd:'/private/tmp/cric-consumer-author-20261126'})))throw Error('Candidate drift');
const old=await import(pathToFileURL(path.join(core,file))),now=await import(pathToFileURL(path.join(candidate,file)));
const {piloti,guidaPilota,ragionamento}=await import(pathToFileURL(path.join(candidate,'static/js/banchi/quaderno.js')));
const {n}=await import(pathToFileURL(path.join(candidate,'static/js/banchi/misure.js')));
const input=JSON.parse(await readFile(path.join(base,'candidate-input-snapshot/editorial/batches/experiments-manual-support-revision-263.json'),'utf8'));
const before=JSON.parse(await readFile(path.join(core,'editorial/reviews/manual-guide-scope-addendum-20261126/actual-guide-code.json'),'utf8'));
const banco=await readFile(path.join(candidate,'static/js/banchi/banco.js'),'utf8');
const gradeBlock=banco.slice(banco.indexOf('const a = r.assessment[Number(form.dataset.check)]'),banco.indexOf('let hint =',banco.indexOf('const a = r.assessment[Number(form.dataset.check)]')));
const grade=new Function('r','form','activity',`${gradeBlock};return ok;`);
const primary=JSON.parse(await readFile(path.join(core,'editorial/reviews/manual-experiments-eight-primary-20261125/exact-primary.json'),'utf8'));
let gradedManualInputsAccepted=0;
const records=[];let physicsEquivalent=true;
for(const row of input.records){
 const a=await now.esperienza(row),o=await old.esperienza(row),prior=before.records.find(r=>r.id===row.id);
 const samples=[...row.assessmentSelection.points,prior.nonSelectedInput].map(x=>{const p={x},s=a.model.solve(p),os=o.model.solve(p);
  if(JSON.stringify(s)!==JSON.stringify(os))physicsEquivalent=false;
  return{x,steps:a.model.steps(p,s),solve:s};});
 if(JSON.stringify(a.record.assessment)!==JSON.stringify(o.record.assessment))throw Error('Graded questions changed');
 if(!samples.slice(0,2).every(s=>s.steps[2][0]==='Controlla il calcolo')||samples[2].steps[2][0]!=='Osserva la lettura del modello')throw Error('Direct guide branch incorrect');
 const exact=primary.records.find(r=>r.id===row.id);
 for(let i=0;i<2;i++){if(!grade(a.record,{dataset:{check:String(i)},elements:{answer:{value:exact.finiteNumberExamples[i]}}},true))throw Error('Actual Number manual input rejected');gradedManualInputsAccepted++;}
 const numberChecks=a.record.assessment.map((q,i)=>{const input=exact.finiteNumberExamples[i],score=value=>grade(a.record,{dataset:{check:String(i)},elements:{answer:{value}}},true);return{index:i,input,display:n(q.value),finiteManualEntryAccepted:score(input),commaEntryAccepted:score(input.replace('.',',')),displayNumberRoundtripAccepted:score(n(q.value)),blankRejected:!score(''),infiniteRejected:!score('Infinity')};});
 if(numberChecks.some(q=>!q.finiteManualEntryAccepted||!q.commaEntryAccepted||!q.displayNumberRoundtripAccepted||!q.blankRejected||!q.infiniteRejected))throw Error('Actual Number/format roundtrip differs');
 records.push({id:row.id,clock:a.clock,samples,assessments:a.record.assessment,assessmentUnchanged:true,numberChecks,unitsDuplicatedInPrompt:a.record.assessment.some(q=>/°\s*°|\bs\s+s\b/.test(q.prompt))});
}
const frameSource=banco.slice(banco.indexOf('  function frame('),banco.indexOf('  function advanceClock('));
const syncSource=banco.slice(banco.indexOf('  function syncTime('),banco.indexOf('  function tick('));
const renderGuideSource=banco.slice(banco.indexOf('  function renderGuide('),banco.indexOf('  let lastReadings ='));
const drawSource='renderGuide(explanation);';
if(!frameSource||!syncSource||!renderGuideSource||!banco.includes(drawSource))throw Error('Exact consumer blocks missing');
const transitions=[];
for(const rec of records.filter(r=>r.clock?.input)){
 const row=input.records.find(r=>r.id===rec.id),a=await now.esperienza(row),selected=row.assessmentSelection.points[0],outside=before.records.find(r=>r.id===row.id).nonSelectedInput;
 for(const [from,to]of[[selected,outside],[outside,selected]]){
  const nodes=new Map();const node=()=>({textContent:'',innerHTML:'',value:0,setAttribute(){},closest(){return{querySelector(){return node();}};}});
  const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);};
  const factory=new Function('model','get','n','start','destination','clock',`
    let p={x:start},s=model.solve(p),t=start,lastReadings='',stage=2;
    const pilot=null,view='native',gpu={frame(){}},timeline=true,graphBox={},pair=null,pairNode={},clockInput=get('clockInput');
    const document={activeElement:null},momenti=['a','b','c','d','e'];
    const reasoning=()=>null,letture=JSON.stringify,moveCursor=()=>{},duration=()=>clock.duration(s.x,s.y),isTimed=()=>duration()>0&&stage>=0,timeUnit=clock.clockUnit||'s',stop=()=>{};
    ${renderGuideSource}
    function drawGuide(){const explanation=reasoning();${drawSource}}
    ${frameSource}
    ${syncSource}
    drawGuide();const initial={title:get('[data-step-title]').textContent,text:get('[data-explain]').textContent,equation:get('[data-equation]').textContent};
    seek(destination);
    const after={title:get('[data-step-title]').textContent,text:get('[data-explain]').textContent,equation:get('[data-equation]').textContent};
    return {initial,after,expected:model.steps(p,s)[2],currentState:s};
  `);
  const trace=factory(a.model,get,n,from,to,a.clock);
  const stale=trace.after.title!==trace.expected[0]||trace.after.text!==trace.expected[1];
  transitions.push({id:row.id,from,to,trace,staleTitleOrInstruction:stale,scope:'Exact draw-selection+seek+syncTime+frame blocks and actual clock duration/unit; stop is a paused-clock no-op fixture for unrelated RAF/buttons. Private selector objects, not DOM/native/fallback UI.'});
 }
}
const mutatedFrame=frameSource.replace('if (explanation || timeline) renderGuide(explanation);',"if (timeline) get('[data-equation]').textContent = model.steps(p,s)[stage][2];");
if(mutatedFrame===frameSource)throw Error('Mutation did not apply');
const mutationTransitions=[];
for(const rec of records.filter(r=>r.clock?.input)){
 const row=input.records.find(r=>r.id===rec.id),a=await now.esperienza(row),selected=row.assessmentSelection.points[0],outside=before.records.find(r=>r.id===row.id).nonSelectedInput;
 for(const [from,to]of[[selected,outside],[outside,selected]]){
  const values=new Map(),get=selector=>{if(!values.has(selector))values.set(selector,{textContent:'',innerHTML:'',setAttribute(){},closest(){return{querySelector(){return{textContent:''};}};}});return values.get(selector);};
  const run=new Function('model','get','n','start','destination','clock',`
   let p={x:start},s=model.solve(p),t=start,lastReadings='',stage=2;
   const pilot=null,view='native',gpu={frame(){}},timeline=true,graphBox={},pair=null,pairNode={},clockInput=get('clockInput'),document={activeElement:null};
   const reasoning=()=>null,letture=JSON.stringify,moveCursor=()=>{},duration=()=>clock.duration(s.x,s.y),isTimed=()=>duration()>0&&stage>=0,timeUnit=clock.clockUnit||'s',stop=()=>{};
   ${renderGuideSource}
${mutatedFrame}
${syncSource}
   renderGuide(null);seek(destination);return {actual:[get('[data-step-title]').textContent,get('[data-explain]').textContent,get('[data-equation]').textContent],expected:model.steps(p,s)[2]};`);
  const value=run(a.model,get,n,from,to,a.clock);const rejected=JSON.stringify(value.actual)!==JSON.stringify(value.expected);
  if(!rejected)throw Error('Legacy stale-guide mutation escaped');mutationTransitions.push({id:row.id,from,to,...value,rejected});
 }
}
const sourceRecords=[];for(const c of ['C2','C3','C4','C5','C6'])sourceRecords.push(...JSON.parse(execFileSync('git',['show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-'+c+'.json'],{cwd:core,encoding:'utf8'})));
let gridStates=0;for(const row of sourceRecords){const a=await now.esperienza(row),o=await old.esperienza(row);if(JSON.stringify(a.record.assessment)!==JSON.stringify(o.record.assessment))throw Error('Original139graded drift');
 for(let i=0;i<=Math.round((row.control.max-row.control.min)/row.control.step);i++){
  const p={x:row.control.min+i*row.control.step},s=a.model.solve(p),os=o.model.solve(p);
  if(JSON.stringify(s)!==JSON.stringify(os)||JSON.stringify(a.model.readings(p,s))!==JSON.stringify(o.model.readings(p,os))||JSON.stringify(a.elements(p.x,2))!==JSON.stringify(o.elements(p.x,2)))throw Error('Original139physics/drawing changed');gridStates++;
 }}
const decimalRow=structuredClone(input.records.find(r=>r.id==='SIM-C5-L02-03'));decimalRow.control={...decimalRow.control,min:0,max:1,step:.1};decimalRow.assessmentSelection.points=[.3,.7];
const decimal=await now.esperienza(decimalRow);const decimalSamples=[.3,.1+.2,.3+1e-8,.4].map(x=>({x,step:decimal.model.steps({x},decimal.model.solve({x}))[2],value:decimal.model.solve({x}).y}));
if(decimalSamples[0].step[0]!=='Controlla il calcolo'||decimalSamples[1].step[0]!=='Controlla il calcolo'||decimalSamples[2].step[0]==='Controlla il calcolo'||decimalSamples[3].step[0]==='Controlla il calcolo')throw Error('Decimal scope classifier error');
const c1=JSON.parse(execFileSync('git',['show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/esperienze-C1.json'],{cwd:core,encoding:'utf8'}));
const quadrantRow=structuredClone(c1.find(r=>r.id==='SIM-C1-L002-04'));quadrantRow.assessmentSelection={schemaVersion:'1.0.0',points:[90,180]};
const quadrant=await now.esperienza(quadrantRow),quadrantOld=await old.esperienza(quadrantRow),near=90-1e-8,qs=quadrant.model.solve({x:near});
const nearQuadrant={input:near,solve:qs,guide:quadrant.model.steps({x:near},qs)[2],measureUnchanged:JSON.stringify(qs)===JSON.stringify(quadrantOld.model.solve({x:near}))};
if(qs.y===0||nearQuadrant.guide[0]==='Controlla il calcolo'||!nearQuadrant.measureUnchanged)throw Error('Near-quadrant physics or manual classification changed');
const pilotRow=sourceRecords.find(r=>r.id==='SIM-C4-L10-02'),pilotActivity=await now.esperienza(pilotRow),pilotInput={x:pilotRow.control.min};
const pilotReference={id:pilotRow.id,pilot:piloti[pilotRow.id],referenceSteps:pilotActivity.model.steps(pilotInput,pilotActivity.model.solve(pilotInput)),
 drawUsesReasoningOverride:piloti[pilotRow.id]==='induzione',referenceUsesOriginalActivityModel:banco.includes('const original = activity?.model || model;'),limit:'Reference producer+source dispatch read; no fresh pilot/DOM UI acceptance.'};
const induction=await import(pathToFileURL(path.join(candidate,'static/js/banchi/modelli/induzione.js')));
const pilotGuideSamples=[];
for(const stage of [0,1,2,3])for(const t of [0,1,2]){
 const p={x:-2,middle:0,circuit:'closed'},state=induction.solve(p),instant=induction.sample(state,t);
 const explanations=stage===2?ragionamento('induzione',p,state,t,instant):[null];
 for(const [mathStep,explanation]of explanations.entries()){
  const nodes=new Map(),get=selector=>{if(!nodes.has(selector))nodes.set(selector,{textContent:''});return nodes.get(selector);};
  const apply=new Function('model','get','p','s','stage','pilot','guidaPilota','explanation',`${renderGuideSource}renderGuide(explanation);return [get('[data-step-title]').textContent,get('[data-explain]').textContent,get('[data-equation]').textContent];`);
  const actual=apply(induction,get,p,state,stage,'induzione',guidaPilota,explanation),expected=explanation||guidaPilota('induzione',stage);
  if(JSON.stringify(actual)!==JSON.stringify(expected.slice(0,3)))throw Error('Pilot reasoning/guide priority changed');
  pilotGuideSamples.push({stage,t,mathStep,actual,selectedFrom:explanation?'actual ragionamento override':'actual guidaPilota fallback'});
 }
}
const result={phase:'INDEPENDENT_GUIDE_CODE_REVIEW_NOT_FULL_ACTIVITY_ACCEPTANCE',sourceCommit:ref,producerSha256:sha(producer),bancoSha256:sha(Buffer.from(banco)),
 records,gradedManualInputsAccepted,transitions,exactConsumerBlocks:{frameSource,syncSource,drawSource,renderGuideSource},direct24GuideSamplesCorrect:true,physicsEquivalent,originalSourcesCompared:sourceRecords.length,originalGridStatesCompared:gridStates,
 mutationTransitions,decimalSamples,nearQuadrant,decimalFixtureScope:'Private controller rounding fixture, not authored learner content',pilotReference,pilotGuideSamples,
 openTimelineTransitions:transitions.filter(t=>t.staleTitleOrInstruction).length,newProductUiCases:0,newPasses:0,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
if(result.openTimelineTransitions!==0||gridStates!==2144||!physicsEquivalent)throw Error('Expected bounded evidence mismatch');
await writeFile(path.join(base,'code-probe.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({directGuides:24,originals:139,gridStates,openTimelineTransitions:result.openTimelineTransitions,productUi:0}));
