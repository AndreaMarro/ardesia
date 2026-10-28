"""Authored diagnostic and on-demand support share immutable Core provenance."""
import pytest

from lessonos.study import catalog
from lessonos.study.assessment_support import request_support
from lessonos.study.four_courses import course_projection_for_edition, coursepack_for_edition, lesson_reference
from lessonos.study.models import StudyError
from lessonos.study.store import canonical, digest
from lessonos.study.submissions import get_receipt, submit
from test_course_evidence import fixture

PACK = 'sf-fluidi-termodinamica-v1'


def ref(item):return {'id':item['id'],'version':1,'sha256':digest(canonical(item))}


def context(item, phase='practice'):
    lesson_id=item.get('recoveryTarget',{}).get('lessonId') or 'ds-2026-'+item['familyId'].lower()
    lesson=next(l for l in catalog.load_pack(PACK)['lessons'] if l['id']==lesson_id)
    return {'lessonRef':lesson_reference(lesson),'assessmentRef':ref(item),'phase':phase}


def items():return catalog.load_pack(PACK)['atomicFinalAssessment']


def send(store,student,item,key='answer',phase='practice',**kwargs):
    return submit(store,student,'course','course-reasoning-v1',[],'Originale sintetico da rivedere.',key,
                  activity_parameters={},course_lesson=context(item,phase),**kwargs)


def test_safe_diagnostic_three_and_hint_counts_57_without_solutions_or_canonical_changes(tmp_path):
    store,teacher,student,*_=fixture(tmp_path)
    pack=catalog.load_pack(PACK);before=canonical(pack)
    assert 'diagnosticItems' not in coursepack_for_edition(store,student,'course')
    store.synthetic_acceptance=True
    safe=coursepack_for_edition(store,student,'course')
    projected=course_projection_for_edition(store,student,'course')['course']
    assert len(safe['diagnosticItems'])==3 and safe['diagnosticItems']==projected['diagnosticItems']
    assert len(safe['assessmentItems'])==57
    for original,diagnostic in zip(pack['diagnostic'],safe['diagnosticItems'],strict=True):
        assert set(diagnostic)=={'id','objectiveId','prompt','recoveryTarget','assessmentRef','lessonRef'}
        assert diagnostic['assessmentRef']==ref(original)
        assert diagnostic['lessonRef']==context(original)['lessonRef']
        assert diagnostic['recoveryTarget']==original['recoveryTarget']
        assert original['feedback'] not in canonical(diagnostic)
    for original,atomic in zip(pack['atomicFinalAssessment'],safe['assessmentItems'],strict=True):
        assert atomic['hintCount']==3 and atomic['transfer']['hintCount']==2
        assert original['hints'][-1] not in canonical(atomic)
        assert 'hints' not in atomic and set(atomic['transfer'])=={'prompt','hintCount'}
    assert coursepack_for_edition(store,teacher,'course')==pack
    assert canonical(catalog.load_pack(PACK))==before
    assert catalog.describe_pack(PACK)['packSha256']=='cfb6fc645f24d291c627d78aabb855ddbf7a94fb0ff7c47ce84811a91c7571a3'
    store.close()


def test_three_diagnostics_freeze_exact_originals_and_practice_only_without_grading(tmp_path):
    store,teacher,student,*_=fixture(tmp_path);store.synthetic_acceptance=True
    diagnostics=catalog.load_pack(PACK)['diagnostic']
    for index,item in enumerate(diagnostics):
        receipt=send(store,student,item,'diag-'+str(index))
        provenance=receipt['courseContext']
        assert provenance['assessmentCollection']=='diagnostic'
        assert provenance['assessmentObjectiveId']==item['objectiveId']
        assert provenance['assessmentPrompt']==item['prompt'] and provenance['assessmentRef']==ref(item)
        assert receipt['review']=={'state':'MANUAL_REVIEW_REQUIRED','originalText':'Originale sintetico da rivedere.','prompt':item['prompt']}
        assert 'grade' not in receipt and item['feedback'] not in canonical(receipt)
        assert get_receipt(store,teacher,receipt['receiptId'])==receipt
        with pytest.raises(StudyError,match='course_assessment_phase_unavailable'):
            send(store,student,item,'diag-transfer-'+str(index),phase='transfer')
        with pytest.raises(StudyError,match='course_assessment_support_unavailable'):
            request_support(store,student,'course',item['id'],context(item),1,'no-diag-hints-'+str(index))
    first=send(store,student,diagnostics[0],'diag-0')
    with pytest.raises(StudyError,match='parent_course_lesson_mismatch'):
        send(store,student,diagnostics[1],'wrong-parent',parent_id=first['submissionId'])
    assert send(store,student,diagnostics[0],'child',parent_id=first['submissionId'])['revision']==2
    # The demo lesson shares this diagnostic's objective; only its authored recovery lesson is valid.
    value=context(diagnostics[2]);demo=next(l for l in catalog.load_pack(PACK)['lessons'] if l['id']=='original-demo-u5-01')
    value['lessonRef']=lesson_reference(demo)
    with pytest.raises(StudyError,match='course_assessment_objective_mismatch'):
        submit(store,student,'course','course-reasoning-v1',[],'Wrong lesson','wrong-lesson',activity_parameters={},course_lesson=value)
    store.close()


def test_help_is_idempotent_cumulative_actor_ref_phase_bound_and_frozen_in_existing_receipts(tmp_path):
    store,teacher,student,peer,outsider=fixture(tmp_path);store.synthetic_acceptance=True
    item,other=items()[:2]
    store.clock=lambda:1000.0
    first=request_support(store,student,'course',item['id'],context(item),1,'help-one')
    assert set(first)=={'assessmentRef','phase','level','hintCount','text','kind','assistanceRecorded'}
    assert first=={'assessmentRef':ref(item),'phase':'practice','level':1,'hintCount':3,'text':item['hints'][0],'kind':'HINT','assistanceRecorded':True}
    assert request_support(store,student,'course',item['id'],context(item),1,'help-one')==first
    with pytest.raises(StudyError,match='idempotency_conflict'):
        request_support(store,student,'course',item['id'],context(item),2,'help-one')
    store.clock=lambda:1001.0
    explicit=request_support(store,student,'course',item['id'],context(item),3,'help-explicit')
    assert explicit['text']==item['answer'] and explicit['kind']=='EXPLICIT_HINT'
    request_support(store,peer,'course',item['id'],context(item),2,'peer-help')
    request_support(store,student,'course',other['id'],context(other),2,'other-item')
    request_support(store,student,'course',item['id'],context(item,'transfer'),1,'transfer-help')
    store.clock=lambda:1002.0
    request_support(store,student,'course',item['id'],context(item),1,'help-again')
    receipt=send(store,student,item)
    assert receipt['courseContext']['assessmentCollection']=='atomicFinalAssessment'
    assert receipt['courseContext']['assistance']=={'recorded':True,'scope':'CUMULATIVE_PRIOR_HELP','events':[
        {'level':1,'kind':'HINT','requestedAt':1000.0},{'level':3,'kind':'EXPLICIT_HINT','requestedAt':1001.0}]}
    assert 'independent' not in canonical(receipt['courseContext']['assistance'])
    assert item['answer'] not in canonical(receipt)
    store.clock=lambda:1003.0
    request_support(store,student,'course',item['id'],context(item),2,'later-help')
    assert send(store,student,item)==receipt # Existing receipt is never relabeled after later support.
    child=send(store,student,item,'child',parent_id=receipt['submissionId'])
    assert {entry['level'] for entry in child['courseContext']['assistance']['events']}=={1,2,3}
    assert get_receipt(store,student,receipt['receiptId'])==receipt
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='course.assessment.support'").fetchone()[0]==7
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='course.assessment.support'").fetchone()[0]==7
    with pytest.raises(StudyError,match='forbidden'):
        get_receipt(store,peer,receipt['receiptId'])
    store.close()


@pytest.mark.parametrize('level',[0,-1,4,True,'1',1.5,None])
def test_hint_level_domain_fails_without_any_support_event_or_receipt(tmp_path,level):
    store,_,student,*_=fixture(tmp_path);store.synthetic_acceptance=True;item=items()[0]
    with pytest.raises(StudyError,match='invalid_support_level'):
        request_support(store,student,'course',item['id'],context(item),level,'bad-level')
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM study_events').fetchone()[0]==0
    store.close()


@pytest.mark.parametrize('damage,error',[
    ('unknown','stale_course_assessment'),('hash','stale_course_assessment'),('lesson','course_assessment_objective_mismatch'),
    ('path','course_assessment_support_mismatch'),('injected','invalid_course_lesson')])
def test_support_exact_ref_lesson_url_and_body_are_server_validated(tmp_path,damage,error):
    store,_,student,*_=fixture(tmp_path);store.synthetic_acceptance=True;item=items()[0];value=context(item);path=item['id']
    if damage=='unknown':value['assessmentRef']['id']='unknown'
    elif damage=='hash':value['assessmentRef']['sha256']='0'*64
    elif damage=='lesson':value['lessonRef']=context(items()[10])['lessonRef']
    elif damage=='path':path=items()[1]['id']
    else:value['assistance']={'recorded':False}
    with pytest.raises(StudyError,match=error):request_support(store,student,'course',path,value,1,'bad-ref')
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0]==0
    store.close()


def test_default_policy_nonmember_teacher_and_stale_pack_cannot_request_support(tmp_path):
    store,teacher,student,peer,outsider=fixture(tmp_path);item=items()[0]
    with pytest.raises(StudyError,match='course_assessment_support_unavailable'):
        request_support(store,student,'course',item['id'],context(item),1,'default-deny')
    store.synthetic_acceptance=True
    for actor in (teacher,outsider):
        with pytest.raises(StudyError):request_support(store,actor,'course',item['id'],context(item),1,'actor-deny')
    with store.transaction() as c:c.execute("UPDATE study_edition_packs SET pack_sha256=? WHERE edition_id='course'",('0'*64,))
    with pytest.raises(StudyError,match='coursepack_unavailable'):
        request_support(store,student,'course',item['id'],context(item),1,'old-pack')
    store.close()
