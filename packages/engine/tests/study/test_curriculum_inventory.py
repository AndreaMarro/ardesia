"""Private curriculum inventory is a projection, never a second course registry."""
from copy import deepcopy
import json

import pytest

from lessonos.study import catalog, editions, question_bank
from lessonos.study.models import StudyError
from lessonos.study.question_bank import QuestionBank
from lessonos.study.store import StudyStore
from test_question_bank import write_bank, rewrite_bank


@pytest.fixture
def inventory_bank(tmp_path, monkeypatch):
    path = tmp_path / 'bank'
    questions, manifest = write_bank(path, families=3)
    units = sorted({q['taxonomy']['unitId'] for q in questions})
    manifest['miniCourses'] = [
        {'id': 'fixture-' + unit, 'title': 'Fixture ' + unit,
         'unitIds': ['U7'], 'questionCount': 9999} for unit in units
    ] + [{'id': 'fixture-all', 'title': 'Fixture transversal', 'questionCount': 9999}]
    manifest['academicYear'] = 'synthetic-year'
    for q in questions:
        q['descriptors']['miniCourseIds'] = ['fixture-' + q['taxonomy']['unitId'], 'fixture-all', 'fixture-all']
        q['descriptors']['prerequisites'] = ['fractions', 'Fractions']
    rewrite_bank(path, questions, manifest)
    # Inventory uses real synthetic records without replacing the canonical
    # manifest registry to which authored CoursePacks are immutably bound.
    original_load = question_bank.load_bank
    def load_inventory_bank(bank_id=question_bank.BANK_ID):
        return QuestionBank(path) if bank_id == question_bank.BANK_ID else original_load(bank_id)
    monkeypatch.setattr(question_bank, 'load_bank', load_inventory_bank)
    question_bank.clear_bank_cache()
    yield path, questions, manifest, units
    question_bank.clear_bank_cache()


def test_collections_count_records_and_do_not_add_transversal_membership_twice(inventory_bank):
    path, questions, manifest, units = inventory_bank
    collections = QuestionBank(path).inventory_collections()
    assert len(collections) == len(manifest['miniCourses'])
    by_selection = {item['selection']['miniCourseId']: item for item in collections}
    transversal = by_selection['fixture-all']
    assert transversal['questionCount'] == len(questions)
    assert sum(by_selection['fixture-' + unit]['questionCount'] for unit in units) == len(questions)
    assert sum(transversal['countsByUnit'].values()) == len(questions)
    assert transversal['familyCount'] == len({q['familyId'] for q in questions})
    for item in collections:
        selected = [q for q in questions if item['selection']['miniCourseId'] in q['descriptors']['miniCourseIds']]
        assert item['questionCount'] == item['solutionCount'] == len(selected)
        assert item['unitIds'] == sorted({q['taxonomy']['unitId'] for q in selected})
        assert sum(item['countsByDifficulty'].values()) == sum(item['countsByFormat'].values()) == len(selected)
        assert item['creatable'] is False and item['editorialStatus'] == 'DRAFT'
        assert item['scientificReview'] == 'NOT_RUN'
        assert item['subject'] == 'fisica'


def test_manifest_summary_counts_cannot_override_inventory(inventory_bank):
    path, questions, manifest, _ = inventory_bank
    before = QuestionBank(path).inventory_collections()
    for item in manifest['miniCourses']:
        item['questionCount'] = -100
        item['countsByDifficulty'] = {'base': 1_000_000}
    manifest['quality'] = {'buildValidation': {'questionCount': -100, 'familyCount': -100}}
    manifest['taxonomy'] = [{'id': 'U1', 'questionCount': -100}]
    rewrite_bank(path, questions, manifest)
    after = QuestionBank(path).inventory_collections()
    assert [{k: v for k, v in row.items() if k != 'bankSha256'} for row in after] == [
        {k: v for k, v in row.items() if k != 'bankSha256'} for row in before]
    assert after[0]['bankSha256'] != before[0]['bankSha256']


def test_reference_samples_are_bounded_real_detached_and_never_copy_answers(inventory_bank):
    path, questions, manifest, _ = inventory_bank
    bank = QuestionBank(path)
    before = json.dumps(bank.manifest, sort_keys=True)
    projections = bank.inventory_collections()
    for item in projections:
        assert len(item['questionRefs']) <= 3
        for ref in item['questionRefs']:
            assert ref['version'] == bank.question_version(ref['id'])
            assert ref['contentSha256'] == bank.approval_content_sha256(ref['id'])
    serialized = json.dumps(projections)
    for forbidden in ('Spiegazione riservata', 'correctOptionId', 'solutionSteps', 'authoringFormula', 'semanticSignature'):
        assert forbidden not in serialized
    projections[0]['prerequisites'].append('mutated')
    projections[0]['questionRefs'][0]['id'] = 'mutated'
    assert 'mutated' not in json.dumps(bank.inventory_collections())
    assert json.dumps(bank.manifest, sort_keys=True) == before


def test_optional_teacher_inventory_preserves_registry_and_existing_course_content(tmp_path, inventory_bank):
    store = StudyStore(tmp_path / 'inventory.sqlite')
    teacher = store.create_principal('fixture-teacher', 'teacher')
    try:
        before = editions.registry(store, teacher)
        assert set(before) == {'items', 'paymentMode'}
        after = editions.registry(store, teacher, include_inventory=True)
        assert {k: v for k, v in after.items() if k != 'inventory'} == before
        inventory = after['inventory']
        for programme in inventory['programmes']:
            descriptor = catalog.describe_pack(programme['packId'], programme['packVersion'])
            pack = catalog.load_pack(programme['packId'], programme['packVersion'])
            transfer = [item for group in pack['transferTests'] for item in group['items']]
            assert programme['id'] == f"{pack['id']}@{pack['version']}"
            assert programme['packSha256'] == descriptor['packSha256']
            assert programme['exerciseCount'] == len(pack['exercises'])
            assert programme['transferCount'] == len(transfer)
            assert programme['solutionCount'] == sum(bool(item.get('solution')) for item in pack['exercises'] + transfer)
            assert programme['creatable'] is True and programme['scientificReview'] == 'NOT_ATTESTED'
        assert {p['packId'] for p in inventory['programmes']} == {p['packId'] for p in before['items']}
        shared = {item['label']: item['entryIds'] for item in inventory['sharedPrerequisites']}
        assert 'fractions' in shared and 'Fractions' in shared
        entries = inventory['programmes'] + inventory['collections']
        for label, ids in shared.items():
            assert len(ids) >= 2 and len(ids) == len(set(ids))
            assert ids == sorted(item['id'] for item in entries if label in item['prerequisites'])
        assert store.connection.execute('SELECT COUNT(*) FROM study_editions').fetchone()[0] == 0
        assert store.connection.execute('SELECT COUNT(*) FROM study_question_bank_approvals').fetchone()[0] == 0
        for collection in inventory['collections']:
            with pytest.raises(StudyError, match='invalid_coursepack'):
                editions.create_draft(store, teacher, collection['selection']['miniCourseId'], 1, 10, 4900, collection['id'])
        assert store.connection.execute('SELECT COUNT(*) FROM study_editions').fetchone()[0] == 0
    finally:
        store.close()


def test_auth_and_default_response_do_not_load_the_question_corpus(tmp_path, monkeypatch):
    def forbidden_load(*args, **kwargs):
        raise AssertionError('unauthorized or default registry read loaded the bank')
    monkeypatch.setattr(question_bank, 'load_bank', forbidden_load)
    store = StudyStore(tmp_path / 'scope.sqlite')
    teacher = store.create_principal('fixture-owner', 'teacher')
    student = store.create_principal('fixture-learner', 'student')
    try:
        assert 'inventory' not in editions.registry(store, teacher)
        with pytest.raises(StudyError, match='forbidden') as error:
            editions.registry(store, student, include_inventory=True)
        assert error.value.status == 403
    finally:
        store.close()


def test_duplicate_collection_ids_fail_closed(inventory_bank):
    path, questions, manifest, _ = inventory_bank
    manifest['miniCourses'].append(deepcopy(manifest['miniCourses'][0]))
    rewrite_bank(path, questions, manifest)
    with pytest.raises(StudyError, match='question_bank_unavailable'):
        QuestionBank(path).inventory_collections()
