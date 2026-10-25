import pytest
from lessonos.study.feedback import propose_feedback,review_feedback,list_feedback
from lessonos.study.submissions import submit,list_submissions
from lessonos.study.models import Principal,StudyError
from test_identity_store import setup_store


def test_new_attempt_keeps_previous_and_review_is_revision_bound(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    original=submit(store,student,'fluidi','poiseuille-v1',[],'Q cresce come r²','one')
    candidate=propose_feedback(store,tutor,original['submissionId'])
    reviewed=review_feedback(store,tutor,candidate['id'],1,'Controlla la quarta potenza.','review-1')
    retry=submit(store,student,'fluidi','poiseuille-v1',[],'Q cresce di 5,0625','two',parent_id=original['submissionId'])
    assert retry['revision']==2 and retry['parentId']==original['submissionId']
    assert len(list_submissions(store,student,'fluidi'))==2
    assert reviewed['submissionRevision']==1
    with pytest.raises(StudyError,match='stale_revision'):review_feedback(store,tutor,candidate['id'],2,'wrong','review-2')


def test_fake_model_or_student_cannot_mark_human_reviewed(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'text','key')
    candidate=propose_feedback(store,tutor,receipt['submissionId'])
    assert candidate['authorType']=='deterministic_fake' and candidate['state']=='proposed'
    for principal in (student,Principal('fake-model','provider')):
        with pytest.raises(StudyError):review_feedback(store,principal,candidate['id'],1,'approve','key')
    assert list_feedback(store,student,receipt['submissionId'])==[]


def test_clarification_never_becomes_disciplinary_error_or_grade(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'testo ambiguo','key')
    candidate=propose_feedback(store,tutor,receipt['submissionId'])
    review=review_feedback(store,tutor,candidate['id'],1,'Puoi chiarire il vincolo?','clarify',decision='needs_clarification')
    assert review['decision']=='needs_clarification' and 'score' not in review
    assert 'grade' not in list_feedback(store,student,receipt['submissionId'])[0]


def test_source_changes_make_proposed_feedback_stale(tmp_path):
    from lessonos.study.context import revise_resource
    store,tutor,student,*_=setup_store(tmp_path)
    resource=store.create_resource(student,'fluidi','notes','original')
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'text','key',source_refs=[{'resourceId':resource['id'],'revisionId':resource['revisionId']}])
    candidate=propose_feedback(store,tutor,receipt['submissionId'])
    revise_resource(store,student,resource['id'],resource['revisionId'],'changed')
    with pytest.raises(StudyError,match='stale_source'):review_feedback(store,tutor,candidate['id'],1,'approve','review')
