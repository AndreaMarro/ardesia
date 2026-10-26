import type {StudyResource} from '../../api';
import {ErrorNotice} from '../../components/Feedback';
import {supportLabel} from './modelLabels';

const kinds=new Set(['independent-study-plan-v1','independent-study-source-v1','independent-study-attempt-v1']);
export const isIndependentStudyResource=(kind:string)=>kinds.has(kind);
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
function body(resource:StudyResource):Record<string,unknown>|null{
 try{const value:unknown=JSON.parse(resource.text);return object(value)?value:null;}catch{return null;}
}
type Submitted={phase:'practice'|'transfer';answer:{value:number;unit:string;reasoning:string};observed:string[]};
function submitted(resource:StudyResource):Submitted|null{
 const value=body(resource);if(resource.kind!=='independent-study-attempt-v1'||!value||value.schemaVersion!==1)return null;
 const answer=value.answer,assistance=value.assistance;
 if((value.phase!=='practice'&&value.phase!=='transfer')||!object(answer)||!object(assistance)
  ||typeof answer.value!=='number'||!Number.isFinite(answer.value)||typeof answer.unit!=='string'||Array.from(answer.unit).length>32
  ||typeof answer.reasoning!=='string'||!answer.reasoning.trim()||Array.from(answer.reasoning).length>4000
  ||!Array.isArray(assistance.observed)||assistance.observed.length>12||!assistance.observed.every(s=>typeof s==='string'&&s.length<=80))return null;
 return {phase:value.phase,answer:{value:answer.value,unit:answer.unit,reasoning:answer.reasoning},observed:assistance.observed};
}
/** Shape validation only; a generic resource does not attest domain issuance. */
export const canCiteIndependentStudyAttempt=(resource:StudyResource)=>submitted(resource)!==null;

/** Core indexes Unicode code points; DOM selections index UTF-16 code units. */
export function studySourceSelection(raw:string,start:number,end:number){
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>raw.length)return null;
 const split=(at:number)=>at>0&&at<raw.length&&raw.charCodeAt(at)>=0xdc00&&raw.charCodeAt(at)<=0xdfff&&raw.charCodeAt(at-1)>=0xd800&&raw.charCodeAt(at-1)<=0xdbff;
 if(split(start)||split(end))return null;
 return {start:Array.from(raw.slice(0,start)).length,end:Array.from(raw.slice(0,end)).length,quote:raw.slice(start,end)};
}

export function IndependentStudySource({resource}:{resource:StudyResource}){
 const value=body(resource);
 const invalid=<ErrorNotice message="La fonte di studio non è leggibile in questa versione. La revisione originale è conservata."/>;
 if(!value)return invalid;
 if(resource.kind==='independent-study-source-v1'){
  if(typeof value.title!=='string'||!value.title.trim()||value.title.length>240)return invalid;
  return <article aria-label="Fonte editoriale di studio"><h3>{value.title}</h3>
   <p>{value.editorialStatus==='DRAFT'?'Materiale in bozza; approvazione scientifica non attestata.':'Stato editoriale da verificare nella revisione del percorso.'}</p>
   <p>Fonte collegata al percorso. Gli svolgimenti non sono anticipati in questa vista.</p>
  </article>;
 }
 if(resource.kind==='independent-study-plan-v1'){
  if(value.schemaVersion!==1)return invalid;
  return <article aria-label="Percorso personale"><h3>Percorso di studio autonomo</h3><p>Il percorso personale si consulta nello Studio autonomo. Fonti, tentativi e aiuti rimangono collegati alle loro revisioni.</p></article>;
 }
 const attempt=submitted(resource);if(!attempt)return invalid;
 return <article aria-label="Tentativo di studio autonomo"><h3>Tentativo di studio autonomo</h3>
  <p>{attempt.phase==='practice'?'Prova iniziale':'Problema diverso'} · risposta nella fonte: <strong>{attempt.answer.value} {attempt.answer.unit}</strong></p>
  <h4>Procedimento nella fonte</h4><p className="original-text">{attempt.answer.reasoning}</p>
  <h4>Aiuti riportati nella fonte</h4>{attempt.observed.length?<ul>{attempt.observed.map((s,i)=><li key={i}>{supportLabel(s)}</li>)}</ul>:<p>Nessun aiuto riportato nella fonte.</p>}
  <p>Le indicazioni sugli aiuti provengono dalla fonte allegata e non sono verificate da questa vista.</p>
  <p>Aiuti esterni non determinati. Nessuna competenza certificata da questa risposta.</p>
 </article>;
}
