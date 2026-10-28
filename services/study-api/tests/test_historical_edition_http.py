"""Unavailable immutable revisions remain readable, never executable or rebound."""
import hashlib
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from lessonos.study import catalog
from lessonos.study.feedback import propose_feedback, review_feedback
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from study_api.app import create_app

OLD_SHA = '50b708fea1d7ae6b7805fc0d883168ea048aff63ec2c7529617450b6ab6dcb51'
CURRENT_SHA = 'cfb6fc645f24d291c627d78aabb855ddbf7a94fb0ff7c47ce84811a91c7571a3'
PACK = 'sf-fluidi-termodinamica-v1'


@pytest.fixture
def history(tmp_path):
    store = StudyStore(tmp_path/'history.sqlite')
    teacher = store.create_principal('history-teacher', 'teacher')
    student = store.create_principal('history-student', 'student')
    peer = store.create_principal('history-peer', 'student')
    outsider = store.create_principal('history-outsider', 'student')
    for edition in ('old', 'new'):
        store.create_edition(teacher, edition, course_id='fluidi-termodinamica', pack_id=PACK)
        for actor in (student, peer): store.add_test_member(teacher, edition, actor.id)
    resource = store.create_resource(student, 'old', 'notes', 'Originale sintetico congelato')
    refs = [{'resourceId':resource['id'], 'revisionId':resource['revisionId']}]
    receipt = submit(store, student, 'old', 'ideal-gas-v1', [], 'Previsione sintetica', 'historical-submit', source_refs=refs, activity_parameters={})
    draft = propose_feedback(store, teacher, receipt['submissionId'])
    review_feedback(store, teacher, draft['id'], 1, 'Restituzione sintetica già approvata', 'historical-review')
    # Simulate the existing historical pin and its already frozen receipt only in this local fixture.
    receipt['courseContext']['packSha256'] = OLD_SHA
    with store.transaction() as c:
        c.execute('UPDATE study_edition_packs SET pack_sha256=? WHERE edition_id=?', (OLD_SHA, 'old'))
        c.execute('UPDATE study_receipts SET body=? WHERE id=?', (json.dumps(receipt), receipt['receiptId']))
    yield store, teacher, student, peer, outsider, resource, receipt, draft
    store.close()


def login(client, store, actor):
    assert client.post('/study/session', json={'token':store.issue_session(actor)}).status_code == 200


@pytest.mark.parametrize('role', ['teacher', 'student'])
def test_historical_listing_and_workspace_preserve_pin_and_frozen_evidence(history, role):
    store, teacher, student, peer, outsider, resource, receipt, draft = history
    before = list(store.connection.iterdump())
    with TestClient(create_app(store.path, demo=True)) as client:
        login(client, store, teacher if role == 'teacher' else student)
        page = client.get('/study/editions')
        assert page.status_code == 200
        items = {item['id']:item for item in page.json()['items']}
        assert set(items) == {'old', 'new'}
        old = items['old']
        assert {k:old[k] for k in ('courseId','packId','packVersion','packSha256')} == {
            'courseId':'fluidi-termodinamica', 'packId':PACK, 'packVersion':1, 'packSha256':OLD_SHA}
        assert old['title'] == 'Edizione storica · revisione non disponibile'
        assert old['readOnly'] is True and old['historical'] is True and old['availability'] == 'UNAVAILABLE'
        assert old['entryActivityId'] is None and old['questionBankIds'] == []
        assert items['new']['packSha256'] == CURRENT_SHA
        assert client.get('/study/workspace', params={'editionId':'new'}).status_code == 200
        workspace = client.get('/study/workspace', params={'editionId':'old'})
        assert workspace.status_code == 200
        body = workspace.json()
        assert body['edition'] == old and body['enrolled'] is True
        assert body['resources'][0]['text'] == resource['text']
        assert body['submissions'][0]['courseContext']['packSha256'] == OLD_SHA
        assert body['submissions'][0]['feedback'][0]['review']['text'] == 'Restituzione sintetica già approvata'
        assert client.get('/study/resources/'+resource['id']).json() == resource
        assert client.get('/study/resources/'+resource['id']+'/revisions/'+resource['revisionId']).json() == resource
        assert client.get('/study/receipts/'+receipt['receiptId']).json() == receipt
    # Reads do not change any application evidence or binding (session and login rate-limit rows aside).
    assert [line for line in store.connection.iterdump() if 'study_session' not in line and 'study_rate_limits' not in line] == [line for line in before if 'study_session' not in line and 'study_rate_limits' not in line]


def test_historical_peer_denial_revocation_and_strict_execution_defaults(history):
    from lessonos.study.models import StudyError
    from lessonos.study.catalog import edition_pack
    from lessonos.study.submissions import get_receipt, list_submissions
    from lessonos.study.feedback import list_feedback
    from lessonos.study.view_layout import load_layout
    store, teacher, student, peer, outsider, resource, receipt, draft = history
    # No implicit read capability reaches mutation callers.
    for operation in (lambda:store.get_edition('old'), lambda:edition_pack(store,'old'),
                      lambda:store._edition_access(student,'old'), lambda:store.get_resource(student,resource['id']),
                      lambda:get_receipt(store,student,receipt['receiptId']), lambda:list_submissions(store,student,'old'),
                      lambda:list_feedback(store,student,receipt['submissionId']), lambda:load_layout(store,student,'old')):
        with pytest.raises(StudyError, match='coursepack_unavailable'): operation()
    with TestClient(create_app(store.path, demo=True)) as client:
        login(client, store, peer)
        for path in ('/study/resources/'+resource['id'], '/study/resources/'+resource['id']+'/revisions/'+resource['revisionId'], '/study/receipts/'+receipt['receiptId']):
            assert client.get(path).status_code == 403
        body = client.get('/study/workspace', params={'editionId':'old'}).json()
        assert body['resources'] == [] and body['submissions'] == []
        login(client, store, outsider)
        assert client.get('/study/resources/'+resource['id']).status_code == 403
        login(client, store, student)
        for path in ('/study/course-learning','/study/coursepack','/study/learning-experiences'):
            response = client.get(path, params={'editionId':'old'})
            assert response.status_code == 409 and response.json() == {'error':'coursepack_unavailable'}
        before = [tuple(row) for row in store.connection.execute('SELECT * FROM study_edition_packs ORDER BY edition_id')]
        mutations = [
            ('post','/study/resources', {'editionId':'old','text':'No new source'}),
            ('post','/study/resources/'+resource['id']+'/revise', {'expectedRevision':resource['revisionId'],'text':'No rewrite'}),
            ('post','/study/submissions', {'editionId':'old','activityId':'ideal-gas-v1','text':'No new attempt'}),
            ('post','/study/submissions', {'editionId':'old','activityId':'ideal-gas-v1','text':'No retry','parentId':receipt['submissionId']}),
            ('post','/study/exams', {'editionId':'old'}),
            ('post','/study/layout', {'editionId':'old','layouts':[]}),
        ]
        for method,path,payload in mutations:
            response = getattr(client,method)(path,json=payload,headers={'Idempotency-Key':'blocked-history'})
            assert response.status_code == 409, (path,response.text)
            assert response.json() == {'error':'coursepack_unavailable'}
        assert [tuple(row) for row in store.connection.execute('SELECT * FROM study_edition_packs ORDER BY edition_id')] == before
        store.revoke_session(client.cookies.get('study_session'))
        for path in ('/study/editions','/study/workspace?editionId=old','/study/receipts/'+receipt['receiptId']):
            assert client.get(path).status_code == 401


def test_canonical_curated_bank_descriptor_and_teacher_catalog_keep_original_pack(tmp_path):
    raw = Path(catalog.__file__).parent/'content'/f'{PACK}.json'
    assert hashlib.sha256(raw.read_bytes()).hexdigest() == 'e637a4f1406cd8b7d6a2dd301a74c28e1f299611a99965b6d918546f76a0df65'
    descriptor = catalog.describe_pack(PACK)
    assert descriptor['questionBankIds'] == ['physics-semestre-2026']
    assert descriptor['packSha256'] == CURRENT_SHA
    store = StudyStore(tmp_path/'bank.sqlite')
    teacher = store.create_principal('bank-teacher','teacher')
    store.create_edition(teacher,'new',course_id='fluidi-termodinamica',pack_id=PACK)
    try:
        with TestClient(create_app(store.path,demo=True)) as client:
            login(client,store,teacher)
            response = client.get('/study/editions/new/question-banks')
            assert response.status_code == 200
            assert response.json()['items'][0]['id'] == 'physics-semestre-2026'
            known = client.get('/study/editions/new/question-banks/physics-semestre-2026')
            assert known.status_code == 200
            unknown = client.get('/study/editions/new/question-banks/unknown-bank')
            assert unknown.status_code == 404
    finally:store.close()



def test_historical_original_media_read_is_explicit_and_owner_only_until_submitted(tmp_path):
    from io import BytesIO
    from PIL import Image
    from lessonos.study.assets import upload_asset, read_original_asset
    from lessonos.study.models import StudyError
    store=StudyStore(tmp_path/'media.sqlite')
    teacher=store.create_principal('media-teacher','teacher')
    student=store.create_principal('media-student','student')
    peer=store.create_principal('media-peer','student')
    store.create_edition(teacher,'old',course_id='fluidi-termodinamica',pack_id=PACK)
    for actor in (student,peer):store.add_test_member(teacher,'old',actor.id)
    image=BytesIO();Image.new('RGB',(2,2),(30,60,90)).save(image,format='PNG');original=image.getvalue()
    asset=upload_asset(store,student,'old',original,'image/png',tmp_path/'blobs',key='media-before-pin')
    with store.transaction() as c:c.execute('UPDATE study_edition_packs SET pack_sha256=? WHERE edition_id=?',(OLD_SHA,'old'))
    try:
        with pytest.raises(StudyError,match='coursepack_unavailable'):
            read_original_asset(store,student,asset['id'],tmp_path/'blobs')
        with TestClient(create_app(store.path,demo=True)) as client:
            login(client,store,student)
            response=client.get('/study/assets/'+asset['id'])
            assert response.status_code==200 and response.content==original
            metadata=json.loads(response.headers['X-Study-Asset-Descriptor'])
            assert metadata['sha256']==asset['sha256']==hashlib.sha256(response.content).hexdigest()
            assert metadata['editionId']=='old'
            for actor in (teacher,peer):
                login(client,store,actor)
                assert client.get('/study/assets/'+asset['id']).status_code==403
            login(client,store,student)
            response=client.post('/study/assets?editionId=old',content=original,headers={'Content-Type':'image/png','Idempotency-Key':'blocked-media-upload'})
            assert response.status_code==409 and response.json()=={'error':'coursepack_unavailable'}
            assert store.connection.execute('SELECT COUNT(*) FROM study_assets').fetchone()[0]==1
            store.revoke_session(client.cookies.get('study_session'))
            assert client.get('/study/assets/'+asset['id']).status_code==401
    finally:store.close()
