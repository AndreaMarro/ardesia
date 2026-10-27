import {expect,it} from 'vitest';
import {aggregateEvidence,filterAttempts,parseInsightView,viewSearch,visibleExport} from './explorer';
import type {InsightAttempt,InsightData} from './contracts';
const a:InsightAttempt={receiptId:'r1',activityId:'poiseuille-v1',studentId:'s1',parentId:null,receivedAt:1,modelVersion:1,packRef:{packId:'fluidi',packVersion:1,packSha256:'abc'},sourceRefs:[{resourceId:'source1',revisionId:'rev1'}],sourceState:'CURRENT',supportUsed:[],assistance:'NO_SUPPORT_REQUESTED',outcome:'MATCH',provenance:'CANONICAL_RECEIPT'};
const b:InsightAttempt={...a,receiptId:'r2',activityId:'hooke-v1',studentId:'s2',assistance:'SUPPORT_REQUESTED',outcome:'MISMATCH',sourceRefs:[{resourceId:'source2',revisionId:'rev2'}]};
const all={model:'all',outcome:'all',assistance:'all'} as const;
it('keeps only authorized rows matching all filters',()=>{
 expect(filterAttempts([a,b],{...all,model:'hooke-v1',outcome:'MISMATCH'})).toEqual([b]);
 expect(filterAttempts([a,b],{...all,assistance:'NOT_RECORDED'})).toEqual([]);
});
it('URL state preserves application parameters and rejects unknown or duplicated filters',()=>{
 const search=viewSearch('?view=work&edition=fluidi&insightOutcome=MATCH',{...all,model:'hooke-v1',assistance:'SUPPORT_REQUESTED'});
 expect(new URLSearchParams(search).get('view')).toBe('work');
 expect(parseInsightView(search,['hooke-v1']).view).toEqual({...all,model:'hooke-v1',assistance:'SUPPORT_REQUESTED'});
 expect(parseInsightView('?insightModel=private-unknown',['hooke-v1']).invalid).toBe(true);
 expect(parseInsightView('?insightOutcome=MATCH&insightOutcome=MISMATCH',[]).invalid).toBe(true);
 expect(search).not.toContain('r1');expect(search).not.toContain('s1');
});
it('aggregates counts without learner fields and suppresses by distinct learners',()=>{
 expect(aggregateEvidence([a,b],'student').rows).toEqual([
  {outcome:'Concorde con il modello',assistance:'Nessun aiuto richiesto',count:1},
  {outcome:'Da confrontare',assistance:'Aiuto richiesto',count:1}
 ]);
 expect(aggregateEvidence([a,a,a,a,a],'teacher').suppressed).toBe(true);
 const five=Array.from({length:5},(_,i)=>({...a,studentId:'s'+i,receiptId:'r'+i}));
 expect(aggregateEvidence(five,'teacher').rows[0].count).toBe(5);
 expect(JSON.stringify(aggregateEvidence(five,'teacher').rows)).not.toContain('studentId');
});
it('exports freshly authorized matching evidence and removes cross-filter comparisons',()=>{
 const data={schemaVersion:1,editionId:'fluidi',role:'teacher',attempts:[a,b],suggestions:[{threadId:'t1',sourceRef:a.sourceRefs[0]}],recoveries:[],comparisons:[{beforeReceiptId:'r1',afterReceiptId:'r2'}],optionalEvents:[{receiptId:'r1'},{receiptId:'r2'}],preferences:{},cohortSuppressed:true,summary:null,limits:[]} as unknown as InsightData;
 const exported=visibleExport(data,{...all,model:'hooke-v1'});
 expect(exported.attempts).toEqual([b]);expect(exported.suggestions).toEqual([]);expect(exported.comparisons).toEqual([]);
 expect(exported.optionalEvents).toEqual([{receiptId:'r2'}]);expect(exported.summary).toBeNull();
 expect(visibleExport({...data,attempts:[]},{...all,model:'hooke-v1'}).attempts).toEqual([]);
});

it('excludes reviewed recoveries whose original source is outside the filtered view',()=>{
 const recovery={threadId:'reviewed',category:'units',sourceRef:a.sourceRefs[0],verificationReceiptId:b.receiptId,verificationSourceRefs:b.sourceRefs,provenance:'CORE_REVIEWED_TRANSFER',scope:'Restricted transfer'};
 const data={schemaVersion:1,editionId:'fluidi',role:'student',attempts:[a,b],suggestions:[],comparisons:[],recoveries:[recovery],optionalEvents:[],preferences:{},cohortSuppressed:false,summary:null,limits:[]} as unknown as InsightData;
 expect(visibleExport(data,all).recoveries).toHaveLength(1);
 expect(visibleExport(data,{...all,model:'hooke-v1'}).recoveries).toEqual([]);
 expect(visibleExport({...data,recoveries:[{...recovery,verificationSourceRefs:[{resourceId:'outside',revisionId:'outside'}]}]},all).recoveries).toEqual([]);
});
