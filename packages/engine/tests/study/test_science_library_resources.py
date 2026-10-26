import importlib
import json

import pytest

from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def api():
    return importlib.import_module('lessonos.study.science_library.resources')


def state(note='Ragionamento sintetico'):
    return api().new_snapshot('collision-1d-v1', {'mass1': 2}, note=note)


def test_private_configuration_and_note_reopen_in_a_new_store_without_revealing_result(tmp_path):
    store, teacher, student, peer, other = setup_store(tmp_path)
    saved = api().save(store, student, 'fluidi', state(), 'save-1')
    assert saved['resource']['ownerId'] == student.id
    assert saved['resource']['visibility'] == 'private'
    assert saved['snapshot']['parameters']['mass2'] == 1
    assert 'result' not in saved
    reopened = StudyStore(store.path)
    try:
        actual = api().read(reopened, student, saved['resource']['id'], saved['resource']['revisionId'])
        assert actual == saved
        assert actual['snapshot']['note'] == 'Ragionamento sintetico'
        for actor in (teacher, peer, other):
            with pytest.raises(StudyError) as e:
                api().read(reopened, actor, saved['resource']['id'], saved['resource']['revisionId'])
            assert e.value.status == 403
    finally:
        reopened.close()
        store.close()


def test_cas_update_retry_exact_history_and_idempotency_conflict(tmp_path):
    store, teacher, student, *_ = setup_store(tmp_path)
    a = api().save(store, student, 'fluidi', state('Prima'), 'create')
    b = api().save(store, student, 'fluidi', state('Seconda'), 'update', resource_id=a['resource']['id'], expected_revision=a['resource']['revisionId'])
    retry = api().save(store, student, 'fluidi', state('Seconda'), 'update', resource_id=a['resource']['id'], expected_revision=a['resource']['revisionId'])
    assert retry == b
    assert b['resource']['id'] == a['resource']['id']
    assert b['resource']['revisionId'] != a['resource']['revisionId']
    assert api().read(store, student, a['resource']['id'], a['resource']['revisionId'])['snapshot']['note'] == 'Prima'
    with pytest.raises(StudyError) as e:
        api().save(store, student, 'fluidi', state('Terza'), 'new-key', resource_id=a['resource']['id'], expected_revision=a['resource']['revisionId'])
    assert e.value.status == 409
    with pytest.raises(StudyError) as e:
        api().save(store, student, 'fluidi', state('Alterata'), 'update', resource_id=a['resource']['id'], expected_revision=a['resource']['revisionId'])
    assert e.value.code == 'idempotency_conflict'
    store.close()


def test_unknown_version_or_changed_implementation_retains_readable_notes_without_execution(tmp_path, monkeypatch):
    store, _, student, *_ = setup_store(tmp_path)
    snapshot = state('Il quaderno resta leggibile')
    snapshot['capabilityVersion'] = 999
    snapshot['implementationSha256'] = 'a' * 64
    resource = store.create_resource(student, 'fluidi', 'science-resource', json.dumps(snapshot))
    monkeypatch.setattr(api(), 'evaluate', lambda *_: (_ for _ in ()).throw(AssertionError('Must not run a model while reopening')))
    result = api().read(store, student, resource['id'], resource['revisionId'])
    assert result['supported'] is False
    assert result['snapshot']['note'] == 'Il quaderno resta leggibile'
    assert 'result' not in result
    store.close()


def test_saved_state_requires_prediction_to_compare_and_does_not_trust_a_stored_result(tmp_path):
    store, _, student, *_ = setup_store(tmp_path)
    saved = api().save(store, student, 'fluidi', state(), 'save')
    ref = saved['resource']
    with pytest.raises(StudyError) as e:
        api().compare(store, student, ref['id'], ref['revisionId'], '')
    assert e.value.code == 'prediction_required'
    compared = api().compare(store, student, ref['id'], ref['revisionId'], '1')
    assert compared['result']['velocity1AfterMS'] == 1
    assert compared['resourceRef'] == {'resourceId': ref['id'], 'revisionId': ref['revisionId']}
    assert compared['prediction'] == '1'
    invalid = state()
    invalid['result'] = {'value': 999}
    with pytest.raises(StudyError):
        api().save(store, student, 'fluidi', invalid, 'forged')
    store.close()


def test_update_cannot_rebind_to_another_edition_or_resource_kind(tmp_path):
    store, teacher, student, *_ = setup_store(tmp_path)
    saved = api().save(store, student, 'fluidi', state(), 'create')
    store.create_edition(teacher, 'other-course')
    store.add_test_member(teacher, 'other-course', student.id)
    with pytest.raises(StudyError) as e:
        api().save(store, student, 'other-course', state(), 'rebind', resource_id=saved['resource']['id'], expected_revision=saved['resource']['revisionId'])
    assert e.value.status == 409
    note = store.create_resource(student, 'fluidi', 'notes', 'Testo ordinario')
    with pytest.raises(StudyError):
        api().save(store, student, 'fluidi', state(), 'wrong-kind', resource_id=note['id'], expected_revision=note['revisionId'])
    store.close()


def test_support_used_preserves_unknown_legacy_and_rejects_invalid_flags(tmp_path):
    store, _, student, *_ = setup_store(tmp_path)
    legacy = api().save(store, student, 'fluidi', state(), 'legacy')
    assert 'supportUsed' not in api().read(store, student, legacy['resource']['id'])['snapshot']
    current = api().new_snapshot('collision-1d-v1', {}, support_used=['domain'])
    saved = api().save(store, student, 'fluidi', current, 'help')
    assert api().read(store, student, saved['resource']['id'])['snapshot']['supportUsed'] == ['domain']
    for bad in (True, 'domain', ['unknown'], ['domain', 'domain'], [{}]):
        with pytest.raises(StudyError) as error:
            api().new_snapshot('collision-1d-v1', {}, support_used=bad)
        assert error.value.code == 'invalid_science_snapshot'
    invalid = state()
    invalid['note'] = '\ud800'
    with pytest.raises(StudyError):
        api().save(store, student, 'fluidi', invalid, 'invalid-utf8')
    store.close()
