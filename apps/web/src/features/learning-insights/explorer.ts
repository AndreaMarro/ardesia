import type {InsightAttempt,InsightData} from './contracts';

export type InsightView={model:string;outcome:string;assistance:string};
export const DEFAULT_VIEW:InsightView={model:'all',outcome:'all',assistance:'all'};
export const OUTCOME_LABELS:Record<string,string>={MATCH:'Concorde con il modello',MISMATCH:'Da confrontare',NOT_CHECKED:'Non verificato'};
export const HELP_LABELS:Record<string,string>={SUPPORT_REQUESTED:'Aiuto richiesto',NO_SUPPORT_REQUESTED:'Nessun aiuto richiesto',NOT_RECORDED:'Aiuti non registrati'};
const params={model:'insightModel',outcome:'insightOutcome',assistance:'insightHelp'} as const;

export function filterAttempts(rows:InsightAttempt[],view:InsightView):InsightAttempt[]{
 const seen=new Set<string>();
 return rows.filter(a=>{
  if(seen.has(a.receiptId))return false;seen.add(a.receiptId);
  return (view.model==='all'||a.activityId===view.model)&&(view.outcome==='all'||a.outcome===view.outcome)&&(view.assistance==='all'||a.assistance===view.assistance);
 });
}

export function parseInsightView(search:string,models:string[]):{view:InsightView;invalid:boolean}{
 const query=new URLSearchParams(search);const view={...DEFAULT_VIEW};let invalid=false;
 const allowed={model:models,outcome:Object.keys(OUTCOME_LABELS),assistance:Object.keys(HELP_LABELS)};
 for(const key of Object.keys(params) as (keyof InsightView)[]){
  const values=query.getAll(params[key]);const value=values[0]??'all';
  if(values.length>1||(value!=='all'&&!allowed[key].includes(value)))invalid=true;
  else view[key]=value;
 }
 return {view:invalid?{...DEFAULT_VIEW}:view,invalid};
}

export function viewSearch(search:string,view:InsightView):string{
 const query=new URLSearchParams(search);
 for(const key of Object.keys(params) as (keyof InsightView)[]){
  query.delete(params[key]);if(view[key]!=='all')query.set(params[key],view[key]);
 }
 const encoded=query.toString();return encoded?'?'+encoded:'';
}

export type EvidenceCount={outcome:string;assistance:string;count:number};
export function aggregateEvidence(rows:InsightAttempt[],role:string):{suppressed:boolean;rows:EvidenceCount[]}{
 const unique=filterAttempts(rows,DEFAULT_VIEW);
 if(role==='teacher'&&new Set(unique.map(a=>a.studentId)).size<5)return {suppressed:true,rows:[]};
 const groups=new Map<string,EvidenceCount>();
 for(const a of unique){
  const key=a.outcome+':'+a.assistance;
  const group=groups.get(key)??{outcome:OUTCOME_LABELS[a.outcome],assistance:HELP_LABELS[a.assistance],count:0};
  group.count++;groups.set(key,group);
 }
 return {suppressed:false,rows:[...groups.values()]};
}

/** Called only on a fresh authenticated export, never on a cached chart dataset. */
export function visibleExport(data:InsightData,view:InsightView):InsightData{
 const attempts=filterAttempts(data.attempts,view);const ids=new Set(attempts.map(a=>a.receiptId));
 const refs=new Set(attempts.flatMap(a=>a.sourceRefs.map(r=>JSON.stringify([r.resourceId,r.revisionId]))));
 const suggestions=data.suggestions.filter(s=>refs.has(JSON.stringify([s.sourceRef.resourceId,s.sourceRef.revisionId])));
 const categories:Record<string,number>={};for(const s of suggestions)categories[s.category]=(categories[s.category]??0)+1;
 const suppressed=data.cohortSuppressed||aggregateEvidence(attempts,data.role).suppressed;
 return {...data,attempts,suggestions,comparisons:data.comparisons.filter(c=>ids.has(c.beforeReceiptId)&&ids.has(c.afterReceiptId)),
  recoveries:data.recoveries.filter(r=>ids.has(r.verificationReceiptId)&&refs.has(JSON.stringify([r.sourceRef.resourceId,r.sourceRef.revisionId]))&&r.verificationSourceRefs.every(ref=>refs.has(JSON.stringify([ref.resourceId,ref.revisionId])))),optionalEvents:data.optionalEvents.filter(e=>ids.has(e.receiptId)),
  cohortSuppressed:suppressed,summary:suppressed?null:{attempts:attempts.length,checked:attempts.filter(a=>a.outcome!=='NOT_CHECKED').length,
   matched:attempts.filter(a=>a.outcome==='MATCH').length,assisted:attempts.filter(a=>a.assistance==='SUPPORT_REQUESTED').length,observedCategories:categories}};
}
