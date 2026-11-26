// Independent data and code-path probe. A tiny selector fixture below is NOT a browser or product UI.
import {readFile,writeFile} from 'node:fs/promises';import{execFileSync}from'node:child_process';
import {fileURLToPath,pathToFileURL}from'node:url';import path from'node:path';import{createHash}from'node:crypto';
const base=path.dirname(fileURLToPath(import.meta.url)),core=path.resolve(base,'../../..'),candidate='/private/tmp/cric-consumer-author-20261126/officina-di-fisica';
const sha=b=>createHash('sha256').update(b).digest('hex'),ref='19fe56cf0a80f6a8468fb2558528fdb36a450228';
const file='static/js/banchi/voci/esperimento.js',producer=await readFile(path.join(candidate,file));
if(!producer.equals(execFileSync('git',['show',ref+':officina-di-fisica/'+file],{cwd:candidate})))throw Error('Candidate drift');
const old=await import(pathToFileURL(path.join(core,file))),now=await import(pathToFileURL(path.join(candidate,file)));
const {piloti,guidaPilota,ragionamento}=await import(pathToFileURL(path.join(candidate,'static/js/banchi/quaderno.js')));
const {n}=await import(pathToFileURL(path.join(candidate,'static/js/banchi/misure.js')));
const input=JSON.parse(await readFile(path.join(core,'editorial/reviews/experiments-manual-support-263-independent-20261125/final-input-snapshot/editorial/batches/experiments-manual-support-revision-263.json'),'utf8'));
const before=JSON.parse(await readFile(path.join(core,'editorial/reviews/manual-guide-scope-addendum-20261126/actual-guide-code.json'),'utf8'));
const records=[];let physicsEquivalent=true;
for(const row of input.records){
 const a=await now.esperienza(row),o=await old.esperienza(row),prior=before.records.find(r=>r.id===row.id);
 const samples=[...row.assessmentSelection.points,prior.nonSelectedInput].map(x=>{const p={x},s=a.model.solve(p),os=o.model.solve(p);
  if(JSON.stringify(s)!==JSON.stringify(os))physicsEquivalent=false;
  return{x,steps:a.model.steps(p,s),solve:s};});
 if(JSON.stringify(a.record.assessment)!==JSON.stringify(o.record.assessment))throw Error('Graded questions changed');
 if(!samples.slice(0,2).every(s=>s.steps[2][0]==='Controlla il calcolo')||samples[2].steps[2][0]!=='Osserva la lettura del modello')throw Error('Direct guide branch incorrect');
 records.push({id:row.id,clock:a.clock,samples,assessmentUnchanged:true});
}
const banco=await readFile(path.join(candidate,'static/js/banchi/banco.js'),'utf8');
const frameSource=banco.slice(banco.indexOf('  function frame('),banco.indexOf('  function advanceClock('));
const syncSource=banco.slice(banco.indexOf('  function syncTime('),banco.indexOf('  function tick('));
const drawStart=banco.indexOf('      const [title, text, equation] =');
const drawEnd=banco.indexOf("      get('[data-equation]').textContent = equation;",drawStart)+"      get('[data-equation]').textContent = equation;".length;
const drawSource=banco.slice(drawStart,drawEnd);
if(!frameSource||!syncSource||!drawSource)throw Error('Exact consumer blocks missing');
const transitions=[];
for(const rec of records.filter(r=>r.clock?.input)){
 const row=input.records.find(r=>r.id===rec.id),a=await now.esperienza(row),selected=row.assessmentSelection.points[0],outside=before.records.find(r=>r.id===row.id).nonSelectedInput;
 for(const [from,to]of[[selected,outside],[outside,selected]]){
  const nodes=new Map();const node=()=>({textContent:'',innerHTML:'',value:0,setAttribute(){},closest(){return{querySelector(){return node();}};}});
  const get=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);};
  const factory=new Function('model','get','n','start','destination',`
    let p={x:start},s=model.solve(p),t=start,lastReadings='',stage=2;
    const pilot=null,clock={input:true},view='native',gpu={frame(){}},timeline=true,graphBox={},pair=null,pairNode={},clockInput=get('clockInput');
    const document={activeElement:null},momenti=['a','b','c','d','e'];
    const reasoning=()=>null,letture=JSON.stringify,moveCursor=()=>{},isTimed=()=>true,duration=()=>100,timeUnit='s',stop=()=>{};
    function drawGuide(){const explanation=reasoning();${drawSource}}
    ${frameSource}
    ${syncSource}
    drawGuide();const initial={title:get('[data-step-title]').textContent,text:get('[data-explain]').textContent,equation:get('[data-equation]').textContent};
    seek(destination);
    const after={title:get('[data-step-title]').textContent,text:get('[data-explain]').textContent,equation:get('[data-equation]').textContent};
    return {initial,after,expected:model.steps(p,s)[2],currentState:s};
  `);
  const trace=factory(a.model,get,n,from,to);
  const stale=trace.after.title!==trace.expected[0]||trace.after.text!==trace.expected[1];
  transitions.push({id:row.id,from,to,trace,staleTitleOrInstruction:stale,scope:'Exact draw-selection+seek+syncTime+frame blocks with private selector objects. Not DOM/native/fallback UI.'});
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
const pilotRow=sourceRecords.find(r=>r.id==='SIM-C4-L10-02'),pilotActivity=await now.esperienza(pilotRow),pilotInput={x:pilotRow.control.min};
const pilotReference={id:pilotRow.id,pilot:piloti[pilotRow.id],referenceSteps:pilotActivity.model.steps(pilotInput,pilotActivity.model.solve(pilotInput)),
 drawUsesReasoningOverride:piloti[pilotRow.id]==='induzione',referenceUsesOriginalActivityModel:banco.includes('const original = activity?.model || model;'),limit:'Reference producer+source dispatch read; no fresh pilot/DOM UI acceptance.'};
const result={phase:'INDEPENDENT_RUNTIME_CODE_REVIEW_WITH_OPEN_TIMELINE_DELIVERY_FINDING',sourceCommit:ref,producerSha256:sha(producer),bancoSha256:sha(Buffer.from(banco)),
 records,transitions,exactConsumerBlocks:{frameSource,syncSource,drawSource},direct24GuideSamplesCorrect:true,physicsEquivalent,originalSourcesCompared:sourceRecords.length,originalGridStatesCompared:gridStates,
 decimalSamples,decimalFixtureScope:'Private controller rounding fixture, not authored learner content',pilotReference,
 openTimelineTransitions:transitions.filter(t=>t.staleTitleOrInstruction).length,newProductUiCases:0,newPasses:0,activityCredit:0,humanApproval:'NOT_RUN',publicationAction:'NONE'};
if(result.openTimelineTransitions!==6||gridStates!==2144||!physicsEquivalent)throw Error('Expected bounded evidence mismatch');
await writeFile(path.join(base,'code-probe.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({directGuides:24,originals:139,gridStates,openTimelineTransitions:result.openTimelineTransitions,productUi:0}));
