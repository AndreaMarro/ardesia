"""Derive observations for200targets; never grants approval/completeness."""
import hashlib,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'packages/engine'))
from lessonos.study.four_courses import course_projection
folder=Path(__file__).parent
source=ROOT/'handoffs/deepseek/2026-10-25/coverage-200.json'
proof=ROOT/'handoffs/codex-b/evidence/editorial-final-remote.json'
old=json.loads(source.read_text());observed=json.loads(proof.read_text())
assert observed['status']=='PASS' and observed['humanApproval'] is False
passed={(x['course'],x['lessonId']) for x in observed['cases'] if x['status']=='PASS'}
projection=course_projection(review=True);rows=[]
for item in old['objectives']:
 course=next(c for c in projection['courses'] if c['pathId']==item['courseId'])
 lessons=[l for l in course['lessons'] if l['releaseScope']=='PRIVATE_EDITORIAL_REVIEW' and item['objectiveId'] in l['objectiveIds']]
 assert len(lessons)==1,(item['objectiveId'],len(lessons))
 lesson=lessons[0];assert (course['pathId'],lesson['id']) in passed
 rows.append({**item,'runtimeReachability':'VERIFIED_PROTECTED_EDITORIAL_PREVIEW',
  'remoteProof':{'kind':'READ_ONLY_DRAFT_PREVIEW','deploymentId':'dpl_4tSUVdLjeyQpVqY6eNKF9G1abXp7','sourceCommit':'05d2bc9911aff3862906ac5a71769bc726dfbcea','lessonRef':lesson['lessonRef'],'packRef':course['packRef'],'evidence':str(proof.relative_to(ROOT))},
  'persistReopen':'NOT_VERIFIED_PER_TARGET','audio':'TRANSCRIPT_ONLY_FOR_THIS_FAMILY',
  'approved':False,'complete':False})
assert len(rows)==200 and len({r['objectiveId'] for r in rows})==200
result={'schemaVersion':1,'observedOn':'2026-10-25','baseline':projection['baseline'],
 'priorSnapshot':str(source.relative_to(ROOT)),'priorSnapshotSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'browserEvidenceSha256':hashlib.sha256(proof.read_bytes()).hexdigest(),
 'meaning':'Each target maps to one authored family lesson observed in the protected review. This does not certify explanation sufficiency, scientific approval, autonomous performance, remote Core continuity or complete target acceptance.',
 'requiredTargets':200,'completeTargets':0,'approvedTargets':0,'objectives':rows}
(folder/'objective-evidence.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('200targets traced to protected lessons,0complete,0approved; previous snapshot preserved.')
