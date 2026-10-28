"""Controlled draft practice and real persisted thematic exams use existing stores."""
import json

import pytest

from lessonos.study import exam, curated_bank
from lessonos.study.catalog import load_pack
from lessonos.study.models import Principal, StudyError
from lessonos.study.question_bank import BANK_ID, bank_access_for_edition, bank_catalog_for_edition
from lessonos.study.store import StudyStore, canonical, digest
from test_identity_store import setup_store

MOCK1 = 'closure1-fluid-thermal-mock-1'
MOCK2 = 'closure1-fluid-thermal-mock-2'


@pytest.fixture
def world(tmp_path):
    store, teacher, student, peer, other = setup_store(tmp_path)
    store.create_edition(teacher, 'course', course_id='fluidi-termodinamica', pack_id='sf-fluidi-termodinamica-v1')
    store.add_test_member(teacher, 'course', student.id)
    store.add_test_member(teacher, 'course', peer.id)
    yield store, teacher, student, peer, other
    store.close()


def test_default_publication_deny_and_exact_199_draft_curated_allowlist(world):
    store, teacher, student, peer, other = world
    assert all(item['questionCount'] == 0 for item in bank_catalog_for_edition(store, student, 'course')['items'])
    with pytest.raises(StudyError):
        exam.start_attempt(store, student, 'course', simulation_id=MOCK1)
    store.synthetic_acceptance = 'true'
    assert curated_bank.access(store, student, 'course') is None
    store.synthetic_acceptance = True
    context = curated_bank.access(store, student, 'course')
    assert len(context['ids']) == 199
    assert context['ids'] == frozenset(r['id'] for r in load_pack('sf-fluidi-termodinamica-v1')['curatedPractice']['questionRefs'])
    assert len(context['bank'].questions(limit=100, published_ids=context['ids'])['items']) == 100
    catalog = bank_catalog_for_edition(store, student, 'course')['items'][0]
    assert catalog['questionCount'] == 199 and catalog['editorialStatus'] == 'DRAFT'
    assert catalog['scientificApproval'] == 'NOT_RUN' and catalog['humanApproval'] is False
    assert catalog['publication']['publishedQuestionCount'] == 0
    assert catalog['releaseScope'] == 'PRIVATE_SYNTHETIC_ACCEPTANCE'
    assert curated_bank.access(store, other, 'course') is None
    outsider = store.create_principal('unjoined-synthetic', 'student')
    with pytest.raises(StudyError, match='forbidden'):
        curated_bank.access(store, outsider, 'course')
    with pytest.raises(StudyError, match='unauthenticated'):
        curated_bank.access(store, Principal('not-registered','student'), 'course')
    for table in ('study_question_bank_approvals','study_question_bank_reviews'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0] == 0


@pytest.mark.parametrize('mock_id', [MOCK1, MOCK2])
def test_real_31_question_paper_freezes_originals_50_minutes_and_hides_feedback_until_final(world, mock_id):
    store, _, student, *_ = world
    store.synthetic_acceptance = True
    store.clock = lambda: 1000.0
    listing = exam.list_attempts(store, student, 'course')
    assert len(listing['simulations']) == 2 and all(item['ready'] for item in listing['simulations'])
    attempt = exam.start_attempt(store, student, 'course', simulation_id=mock_id)
    assert attempt['simulationId'] == mock_id and attempt['deadlineAt'] == 4000
    assert attempt['durationSeconds'] == 3000 and len(attempt['questions']) == 31
    assert sum(q['type']=='mcq' for q in attempt['questions']) == 21
    assert sum(q['type']=='completion' for q in attempt['questions']) == 10
    assert 'THEMATIC' in attempt['scope'] and attempt['scopeWarning']
    assert attempt['result'] is None and attempt['humanApproval'] is False
    assert all('answer' not in q and 'explanation' not in q and 'sourceRecord' not in q for q in attempt['questions'])
    raw = store.connection.execute('SELECT * FROM study_exam_attempts WHERE id=?',(attempt['id'],)).fetchone()
    pack = json.loads(raw['pack_snapshot'])
    bank = curated_bank.access(store, student, 'course')['bank']
    canonical_mock = next(m for m in load_pack('sf-fluidi-termodinamica-v1')['examSimulations'] if m['id']==mock_id)
    assert {q['id'] for q in pack['questions']} == {r['id'] for r in canonical_mock['questionRefs']}
    for q in pack['questions']:
        assert 'approvalId' not in q
        assert q['sourceRecord'] == bank.review_record(q['id'])
        assert q['questionRef']['sha256'] == bank.approval_content_sha256(q['id'])
    answers = {q['id']:(q['answer'] if q['type']=='mcq' else q['accepted'][0]) for q in pack['questions']}
    final = exam.submit_attempt(store, student, attempt['id'], answers, expected_revision=0)
    assert final['result']['correct'] == 31 and final['result']['score'] == 31
    assert all(q['explanation'] and q['expectedText'] for q in final['result']['questions'])
    assert final['result']['humanApproval'] is False
    assert final['result']['validity']['meaning'] == 'CANONICAL_DRAFT_REFERENCE_NOT_HUMAN_APPROVAL'
    assert exam.submit_attempt(store, student, attempt['id'], {}, expected_revision=0) == final
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='exam.submitted'").fetchone()[0] == 1
    for table in ('study_question_bank_approvals','study_question_bank_reviews'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0] == 0


def test_reopen_cas_peer_scope_and_active_mock_selection(world):
    store, _, student, peer, _ = world
    store.synthetic_acceptance = True
    attempt = exam.start_attempt(store, student, 'course', simulation_id=MOCK1)
    assert exam.start_attempt(store, student, 'course', simulation_id=MOCK1)['id'] == attempt['id']
    with pytest.raises(StudyError, match='exam_active_simulation_conflict'):
        exam.start_attempt(store, student, 'course', simulation_id=MOCK2)
    with pytest.raises(StudyError, match='exam_simulation_required'):
        exam.start_attempt(store, student, 'course')
    first_id = next(q['id'] for q in attempt['questions'] if q['type']=='mcq')
    saved = exam.save_answers(store, student, attempt['id'], {first_id:'A'}, expected_revision=0)
    with pytest.raises(StudyError, match='exam_revision_conflict'):
        exam.save_answers(store, student, attempt['id'], {first_id:'B'}, expected_revision=0)
    reopened = StudyStore(store.path); reopened.synthetic_acceptance = True
    try:
        assert exam.get_attempt(reopened, student, attempt['id'])['answers'] == saved['answers']
        with pytest.raises(StudyError, match='forbidden'):
            exam.get_attempt(reopened, peer, attempt['id'])
        assert exam.list_attempts(reopened, student, 'course')['attempts'][0]['simulationId'] == MOCK1
        reopened.synthetic_acceptance = False
        with pytest.raises(StudyError, match='exam_simulation_unavailable'):
            exam.get_attempt(reopened, student, attempt['id'])
    finally:
        reopened.close()


def test_expiry_finalizes_stored_answers_not_late_input_and_snapshot_flag_is_not_authority(world):
    store, _, student, *_ = world
    store.synthetic_acceptance = True
    clock = [1000.0]; store.clock = lambda:clock[0]
    attempt = exam.start_attempt(store, student, 'course', simulation_id=MOCK1)
    clock[0] = 4011
    expired = exam.submit_attempt(store, student, attempt['id'], {}, expected_revision=0)
    assert expired['status'] == 'expired' and expired['result']['omitted'] == 31
    assert expired['result']['humanApproval'] is False
    second = exam.start_attempt(store, student, 'course', simulation_id=MOCK2)
    row = store.connection.execute('SELECT * FROM study_exam_attempts WHERE id=?',(second['id'],)).fetchone()
    snapshot = json.loads(row['pack_snapshot']); snapshot['questions'][0]['explanation'] = 'Tampered reference'
    with store.transaction() as c:
        c.execute('UPDATE study_exam_attempts SET pack_snapshot=?,pack_sha256=? WHERE id=?',
                  (canonical(snapshot),digest(canonical(snapshot)),second['id']))
    with pytest.raises(StudyError, match='exam_simulation_snapshot_changed'):
        exam.get_attempt(store, student, second['id'])


@pytest.mark.parametrize('mock_id', ['unknown', '', {}, True, '../mock'])
def test_unknown_malformed_cross_course_simulation_cannot_start(world, mock_id):
    store, _, student, *_ = world
    store.synthetic_acceptance = True
    with pytest.raises(StudyError):
        exam.start_attempt(store, student, 'course', simulation_id=mock_id)
    with pytest.raises(StudyError):
        exam.start_attempt(store, student, 'fluidi', simulation_id=MOCK1)
    assert store.connection.execute('SELECT COUNT(*) FROM study_exam_attempts').fetchone()[0] == 0


def test_changed_pinned_pack_manifest_or_question_reference_fails_closed(world, monkeypatch):
    store, _, student, *_ = world
    store.synthetic_acceptance = True
    original = curated_bank.load_pack
    def damaged(*args):
        pack = original(*args); pack['curatedPractice']['questionRefs'][0]['sha256'] = '0'*64
        return pack
    monkeypatch.setattr(curated_bank, 'load_pack', damaged)
    with pytest.raises(StudyError, match='coursepack_unavailable'):
        curated_bank.access(store, student, 'course')



def test_two_tabs_start_the_same_mock_with_one_persisted_authority(world):
    from concurrent.futures import ThreadPoolExecutor
    store, _, student, *_ = world
    def open_tab(_):
        connection = StudyStore(store.path); connection.synthetic_acceptance = True
        try:
            return exam.start_attempt(connection, student, 'course', simulation_id=MOCK1)['id']
        finally:
            connection.close()
    with ThreadPoolExecutor(max_workers=2) as pool:
        attempt_ids = list(pool.map(open_tab, range(2)))
    assert len(set(attempt_ids)) == 1
    assert store.connection.execute('SELECT COUNT(*) FROM study_exam_attempts').fetchone()[0] == 1
