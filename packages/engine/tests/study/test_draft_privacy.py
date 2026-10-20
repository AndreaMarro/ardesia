"""V4 privacy oracle: assignment does not grant access to a learner's drafts."""
import pytest
from lessonos.study.assets import upload_asset, read_asset
from lessonos.study.context import revise_resource, retrieve_context
from lessonos.study.models import StudyError
from lessonos.study.portable import export_notebook
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from test_identity_store import setup_store
from test_submissions import png


def denied(action):
    with pytest.raises(StudyError) as error:
        action()
    assert error.value.status in (403, 404)


def test_assigned_tutor_cannot_read_unsubmitted_private_text_or_original(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'PRIVATE DRAFT')
    asset = upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path/'blobs')
    for actor in (tutor, peer, other):
        denied(lambda: store.get_resource(actor, source['id']))
        denied(lambda: read_asset(store, actor, asset['id'], tmp_path/'blobs'))
        denied(lambda: retrieve_context(store, actor, source['contextId'], 'PRIVATE'))
    assert store.get_resource(student, source['id'])['text'] == 'PRIVATE DRAFT'


def test_receipt_grants_only_submitted_references_and_survives_cold_reopen(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'SHARED SNAPSHOT')
    private = store.create_resource(student, 'fluidi', 'notes', 'STILL PRIVATE')
    shared_asset = upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path/'blobs')
    private_asset = upload_asset(store, student, 'fluidi', png(), 'image/png', tmp_path/'blobs')
    submit(store, student, 'fluidi', 'poiseuille-v1', [shared_asset['id']], 'My answer', 'share-one',
           source_refs=[{'resourceId':source['id'], 'revisionId':source['revisionId']}])
    store.close()
    store = StudyStore(tmp_path/'study.sqlite')
    assert store.get_resource(tutor, source['id'])['text'] == 'SHARED SNAPSHOT'
    assert read_asset(store, tutor, shared_asset['id'], tmp_path/'blobs')[0] == png()
    denied(lambda: store.get_resource(tutor, private['id']))
    denied(lambda: read_asset(store, tutor, private_asset['id'], tmp_path/'blobs'))
    for actor in (peer, other):
        denied(lambda: store.get_resource(actor, source['id']))
        denied(lambda: read_asset(store, actor, shared_asset['id'], tmp_path/'blobs'))
    exported = export_notebook(store, tutor, 'fluidi', tmp_path/'blobs')
    assert 'STILL PRIVATE' not in str(exported)
    assert private_asset['id'] not in str(exported)


def test_later_private_revision_does_not_inherit_submission_permission(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'SUBMITTED V1')
    submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Answer', 'v1',
           source_refs=[{'resourceId':source['id'], 'revisionId':source['revisionId']}])
    updated = revise_resource(store, student, source['id'], source['revisionId'], 'PRIVATE V2')
    denied(lambda: store.get_resource(tutor, source['id']))
    assert store.get_resource(student, source['id'])['revisionId'] == updated['revisionId']
    snapshot = store.get_resource_revision(tutor, source['id'], source['revisionId'])
    assert snapshot['text'] == 'SUBMITTED V1'
    denied(lambda: store.get_resource_revision(tutor, source['id'], updated['revisionId']))


def test_teacher_private_note_stays_private_and_published_material_is_readable(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    private = store.create_resource(tutor, 'fluidi', 'notes', 'TEACHER ONLY')
    published = store.create_resource(tutor, 'fluidi', 'notes', 'LIBRARY', visibility='group')
    denied(lambda: store.get_resource(student, private['id']))
    assert store.get_resource(student, published['id'])['text'] == 'LIBRARY'
