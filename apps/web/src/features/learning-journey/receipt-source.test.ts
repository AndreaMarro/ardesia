import {afterEach,expect,test,vi} from 'vitest';
import {coreJourneyAdapter} from './coreAdapter';
import {emptyDraft,type JourneyData} from './model';
afterEach(()=>vi.unstubAllGlobals());

test('receipt recovery rejects a changed help passage even when the primary PDF annotation still matches',async()=>{
  const me={id:'student',role:'student' as const,synthetic:true as const};
  const data={workspace:{edition:{id:'fluidi',packSha256:'a'.repeat(64)}},experience:{id:'poiseuille-boundary-v1',steps:[{id:'fixed-pressure'}]}} as unknown as JourneyData;
  const primary={resourceId:'annotation',revisionId:'exact-annotation',contextId:'annotation-context'};
  const help={resourceId:'passage',revisionId:'original-passage',contextId:'passage-context'};
  const draft={...emptyDraft(data),ratio:'16',boundary:'pressure' as const,procedure:'Il raggio compare alla quarta potenza.',source:primary,helpSource:help,support:['lesson-passage' as const]};
  const receipt={receiptId:'receipt',submissionId:'submission',studentId:me.id,activityId:'poiseuille-v1',revision:1,
    activityEvidence:{experienceId:draft.experienceId,stepId:draft.stepId,prediction:{ratio:16,fixedQuantity:'pressure'},supportUsed:['lesson-passage'],lessonPassageRef:{resourceId:help.resourceId,revisionId:help.revisionId}}};
  const submission={id:'submission',receipt_id:'receipt',student_id:me.id,activity_id:'poiseuille-v1',source_refs:[primary,help],
    text:'Previsione: 16; grandezza fissata: Δp.\n\nProcedimento: Il raggio compare alla quarta potenza.'};
  vi.stubGlobal('fetch',vi.fn(async(path:string)=>Response.json(path.includes('/receipts/')?receipt:{edition:{id:'fluidi'},submissions:[submission]})));
  const adapter=coreJourneyAdapter(me,'fluidi');
  await expect(adapter.receipt('receipt',draft)).resolves.toEqual(receipt);
  await expect(adapter.receipt('receipt',{...draft,helpSource:{...help,revisionId:'different-passage'}})).rejects.toThrow('receipt_context_mismatch');
});
