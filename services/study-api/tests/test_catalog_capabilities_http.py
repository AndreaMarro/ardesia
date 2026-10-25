"""The existing catalogue and course routes expose the same additive binding."""
import pytest
from fastapi.testclient import TestClient

from lessonos.study.store import StudyStore
from study_api.app import create_app


@pytest.mark.parametrize('pack_id,course_id,entry,banks', [
    ('relazioni-fluidi-v1', 'fisica-fluidi', 'poiseuille-v1', ['physics-semestre-2026']),
    ('taylor-exp-v1', 'analisi-1', 'taylor-exp-v1', []),
])
def test_catalogue_and_course_expose_explicit_binding_without_rewriting_pack(tmp_path, pack_id, course_id, entry, banks):
    store = StudyStore(tmp_path / 'capabilities.sqlite')
    teacher = store.create_principal('fixture-teacher', 'teacher')
    store.create_edition(teacher, 'fixture-edition', course_id=course_id, pack_id=pack_id)
    token = store.issue_session(teacher)
    try:
        with TestClient(create_app(store.path, demo=True)) as client:
            assert client.post('/study/session', json={'token': token}).status_code == 200
            catalogue = client.get('/study/admin/coursepacks')
            assert catalogue.status_code == 200
            descriptor = next(item for item in catalogue.json()['items'] if item['packId'] == pack_id)
            course = client.get('/study/course', params={'editionId': 'fixture-edition'})
            assert course.status_code == 200
            assert descriptor['entryActivityId'] == course.json()['entryActivityId'] == entry
            assert descriptor['questionBankIds'] == course.json()['questionBankIds'] == banks
            assert descriptor['packSha256'] == course.json()['packSha256']
            pack = client.get('/study/coursepack', params={'editionId': 'fixture-edition'})
            assert pack.status_code == 200
            assert 'entryActivityId' not in pack.json() and 'questionBankIds' not in pack.json()
    finally:
        store.close()
