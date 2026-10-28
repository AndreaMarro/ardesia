"""Course capabilities are explicit, versioned links, not subject heuristics."""
from copy import deepcopy

import pytest

from lessonos.study import catalog
from lessonos.study.models import StudyError
from lessonos.study.question_bank import bank_access_for_edition, bank_catalog_for_edition
from lessonos.study.store import StudyStore


def register_fixture(monkeypatch, *, pack_id='synthetic-course-v1', version=1,
                     subject='fisica', bindings=(), activities=None):
    """Only this test can see this synthetic pack; authored files stay untouched."""
    pack = {'id': pack_id, 'version': version, 'status': 'DRAFT',
            'scope': 'Synthetic contract fixture; not a publishable course.',
            'activities': activities if activities is not None else [{'id': 'synthetic-model-v1'}],
            'exercises': [], 'transferTests': []}
    metadata = ('unused-fixture.json', 'synthetic-course', 'Synthetic fixture', subject, 'Not offered')
    monkeypatch.setitem(catalog._PACKS, (pack_id, version), metadata + bindings)
    original = catalog.load_pack

    def load(requested=catalog.DEFAULT_PACK, revision=1):
        return deepcopy(pack) if (requested, revision) == (pack_id, version) else original(requested, revision)

    monkeypatch.setattr(catalog, 'load_pack', load)
    return pack


@pytest.mark.parametrize('subject', ['fisica', 'analisi'])
def test_unbound_course_has_no_bank_or_automatic_entry_even_if_it_has_activities(monkeypatch, subject):
    pack = register_fixture(monkeypatch, subject=subject)
    descriptor = catalog.describe_pack(pack['id'], pack['version'])
    assert descriptor['questionBankIds'] == []
    assert descriptor['entryActivityId'] is None


def test_another_version_does_not_inherit_the_existing_course_capabilities(monkeypatch):
    register_fixture(monkeypatch, pack_id=catalog.DEFAULT_PACK, version=2,
                     activities=[{'id': 'poiseuille-v1'}])
    descriptor = catalog.describe_pack(catalog.DEFAULT_PACK, 2)
    assert descriptor['questionBankIds'] == []
    assert descriptor['entryActivityId'] is None


def test_third_course_selects_its_explicit_activity_without_becoming_taylor_or_poiseuille(monkeypatch):
    pack = register_fixture(monkeypatch, subject='analisi', bindings=('synthetic-model-v1', ()))
    descriptor = catalog.describe_pack(pack['id'])
    assert descriptor['entryActivityId'] == 'synthetic-model-v1'
    assert descriptor['questionBankIds'] == []


@pytest.mark.parametrize('activities', [[], [{'id': 'other-model'}],
                                      [{'id': 'synthetic-model-v1'}, {'id': 'synthetic-model-v1'}]])
def test_broken_or_ambiguous_entry_binding_is_unavailable_instead_of_falling_back(monkeypatch, activities):
    pack = register_fixture(monkeypatch, bindings=('synthetic-model-v1', ()), activities=activities)
    with pytest.raises(StudyError, match='coursepack_unavailable') as error:
        catalog.describe_pack(pack['id'])
    assert error.value.status == 409


@pytest.mark.parametrize('bindings', [
    ('synthetic-model-v1',),
    (False, ()),
    ('', ()),
    (None, 'physics-semestre-2026'),
    (None, ('physics-semestre-2026', 'physics-semestre-2026')),
    (None, (True,)),
])
def test_malformed_registry_capabilities_fail_closed(monkeypatch, bindings):
    pack = register_fixture(monkeypatch, bindings=bindings)
    with pytest.raises(StudyError, match='coursepack_unavailable'):
        catalog.describe_pack(pack['id'])


@pytest.mark.parametrize('pack_id,entry,banks,sha', [
    ('relazioni-fluidi-v1', 'poiseuille-v1', ['physics-semestre-2026'],
     '3e0589e3647cc8d45e006c58839f2b83b06a13451f5d2985ac01eee8efaa321f'),
    ('taylor-exp-v1', 'taylor-exp-v1', [],
     '89ccce46ce08fa7ac8dfa40ff9f3690781746f4fab26a8a66900ab4142b888ca'),
])
def test_existing_pack_content_and_persisted_pins_do_not_change(tmp_path, pack_id, entry, banks, sha):
    original = catalog.load_pack(pack_id)
    descriptor = catalog.describe_pack(pack_id)
    assert descriptor['packSha256'] == sha
    assert descriptor['entryActivityId'] == entry
    assert descriptor['questionBankIds'] == banks
    assert catalog.load_pack(pack_id) == original
    assert 'entryActivityId' not in original and 'questionBankIds' not in original
    store = StudyStore(tmp_path / 'pins.sqlite')
    teacher = store.create_principal('fixture-teacher', 'teacher')
    store.create_edition(teacher, 'fixture-edition', course_id=descriptor['courseId'], pack_id=pack_id)
    before = dict(store.connection.execute('SELECT * FROM study_edition_packs').fetchone())
    store.close()
    reopened = StudyStore(tmp_path / 'pins.sqlite')
    try:
        assert reopened.get_edition('fixture-edition')['entryActivityId'] == entry
        assert dict(reopened.connection.execute('SELECT * FROM study_edition_packs').fetchone()) == before
        assert before['pack_sha256'] == sha
    finally:
        reopened.close()


def test_foreign_physics_edition_cannot_open_the_semester_bank(tmp_path, monkeypatch):
    pack = register_fixture(monkeypatch)
    store = StudyStore(tmp_path / 'foreign-physics.sqlite')
    try:
        teacher = store.create_principal('fixture-owner', 'teacher')
        student = store.create_principal('fixture-student', 'student')
        store.create_edition(teacher, 'unrelated-physics', course_id='synthetic-course', pack_id=pack['id'])
        store.add_test_member(teacher, 'unrelated-physics', student.id)
        # Fail before reading a bank or an approval table: subject is no entitlement.
        with pytest.raises(StudyError, match='question_bank_not_available_for_edition') as error:
            bank_access_for_edition(store, student, 'unrelated-physics')
        assert error.value.status == 404
        assert bank_catalog_for_edition(store, student, 'unrelated-physics')['items'] == []
    finally:
        store.close()


def test_descriptors_are_detached_and_unknown_pack_versions_fail_closed():
    descriptor = catalog.describe_pack()
    descriptor['questionBankIds'].append('foreign-bank')
    assert catalog.describe_pack()['questionBankIds'] == ['physics-semestre-2026']
    for pack_id, version in [('unknown', 1), (catalog.DEFAULT_PACK, 2), (catalog.DEFAULT_PACK, True)]:
        with pytest.raises(StudyError, match='invalid_coursepack'):
            catalog.describe_pack(pack_id, version)


@pytest.mark.parametrize('damage', ['unknown_bank','wrong_version','bool_version','malformed_sha','different_sha','missing_field','not_object'])
def test_explicit_curated_bank_reference_fails_closed_without_exact_registered_manifest(monkeypatch, damage):
    pack=register_fixture(monkeypatch)
    pack['curatedPractice'] = dict(catalog.load_pack('sf-fluidi-termodinamica-v1')['curatedPractice'])
    reference=pack['curatedPractice']
    if damage=='unknown_bank':reference['bankId']='unregistered'
    elif damage=='wrong_version':reference['bankVersion']=2
    elif damage=='bool_version':reference['bankVersion']=True
    elif damage=='malformed_sha':reference['manifestSha256']='../manifest.json'
    elif damage=='different_sha':reference['manifestSha256']='0'*64
    elif damage=='missing_field':del reference['manifestSha256']
    else:pack['curatedPractice']=[]
    with pytest.raises(StudyError,match='coursepack_unavailable') as error:
        catalog.describe_pack(pack['id'])
    assert error.value.status==409


def test_explicit_registry_bank_capabilities_keep_precedence_over_curated_metadata(monkeypatch):
    pack=register_fixture(monkeypatch, bindings=(None, ('physics-semestre-2026',)))
    pack['curatedPractice']={'bankId':'unregistered'}
    assert catalog.describe_pack(pack['id'])['questionBankIds']==['physics-semestre-2026']


@pytest.mark.parametrize('damage', ['missing','missing_course','empty_pack','bool_version','negative_version','malformed_sha'])
def test_readable_descriptor_retains_no_capability_for_missing_or_malformed_pin(damage):
    row={'course_id':'historical-course','pack_id':'unavailable-pack','pack_version':1,'pack_sha256':'0'*64}
    if damage=='missing':row=None
    elif damage=='missing_course':row['course_id']=None
    elif damage=='empty_pack':row['pack_id']=''
    elif damage=='bool_version':row['pack_version']=True
    elif damage=='negative_version':row['pack_version']=-1
    else:row['pack_sha256']='untrusted'
    with pytest.raises(StudyError,match='coursepack_unavailable'):
        catalog.readable_descriptor(row)
