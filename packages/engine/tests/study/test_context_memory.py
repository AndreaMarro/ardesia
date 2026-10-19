import pytest
from lessonos.study.context import retrieve_context,revise_resource,delete_resource,rebuild_projection
from lessonos.study.feedback import propose_feedback,review_feedback
from lessonos.study.submissions import submit
from test_identity_store import setup_store


def reviewed_source(store,tutor,student):
    resource=store.create_resource(student,'fluidi','notes','Grandezze fissate: raggio e portata')
    receipt=submit(store,student,'fluidi','poiseuille-v1',[],'Q cresce come r²','submit',source_refs=[{'resourceId':resource['id'],'revisionId':resource['revisionId']}])
    proposal=propose_feedback(store,tutor,receipt['submissionId'])
    review=review_feedback(store,tutor,proposal['id'],1,'Verifica la quarta potenza mantenendo Δp fissata.','review')
    return resource,review


def test_memory_is_grounded_persistent_and_permission_filtered_before_search(tmp_path):
    from lessonos.study.store import StudyStore
    store,tutor,student,peer,other=setup_store(tmp_path)
    resource,review=reviewed_source(store,tutor,student)
    packet=retrieve_context(StudyStore(store.path),student,resource['contextId'],'potenza')
    assert len(packet['observations'])==1 and packet['observations'][0]['reviewId']==review['reviewId']
    assert packet['observations'][0]['evidence']['text']=='Q cresce come r²'
    assert packet['observations'][0]['evidence']['sourceId']==resource['id']
    for principal in (peer,other):
        with pytest.raises(ValueError):retrieve_context(store,principal,resource['contextId'],'potenza')


@pytest.mark.parametrize('action',['revise','delete'])
def test_changed_or_removed_source_invalidates_memory_and_citations(tmp_path,action):
    store,tutor,student,*_=setup_store(tmp_path)
    resource,review=reviewed_source(store,tutor,student)
    assert retrieve_context(store,student,resource['contextId'],'potenza')['observations']
    if action=='revise':revise_resource(store,student,resource['id'],resource['revisionId'],'Fonte corretta')
    else:delete_resource(store,student,resource['id'])
    if action=='delete':
        with pytest.raises(ValueError):retrieve_context(store,student,resource['contextId'],'potenza')
    else:
        packet=retrieve_context(store,student,resource['contextId'],'potenza')
        assert packet['observations']==[] and packet['omittedStale']==1


def test_projection_rebuild_and_review_consumer_are_idempotent(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    resource,review=reviewed_source(store,tutor,student)
    before=retrieve_context(store,student,resource['contextId'],'potenza')
    rebuild_projection(store);rebuild_projection(store)
    assert retrieve_context(store,student,resource['contextId'],'potenza')==before
    assert store.connection.execute("SELECT COUNT(*) FROM segments WHERE seg_id LIKE 'study-%'").fetchone()[0]==1

def test_shared_activity_does_not_publish_peer_observations(tmp_path):
    store,tutor,student,peer,*_=setup_store(tmp_path)
    shared=store.create_resource(tutor,'fluidi','activity','Shared activity',visibility='group')
    for actor in (student,peer):
        receipt=submit(store,actor,'fluidi','poiseuille-v1',[],actor.id+' private answer',actor.id,source_refs=[{'resourceId':shared['id'],'revisionId':shared['revisionId']}])
        proposal=propose_feedback(store,tutor,receipt['submissionId'])
        review_feedback(store,tutor,proposal['id'],1,actor.id+' private correction',actor.id)
    packet=retrieve_context(store,student,shared['contextId'],'')
    assert len(packet['observations'])==1
    assert peer.id not in str(packet)


def test_rebuild_cannot_resurrect_stale_legacy_retrieval_text(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    resource,review=reviewed_source(store,tutor,student)
    revise_resource(store,student,resource['id'],resource['revisionId'],'changed')
    rebuild_projection(store)
    assert store.legacy.get_segment('study-'+review['reviewId']) is None
