"""Scientific bank delivery: no spoilers, exact grading, reproducible distinct families."""
import hashlib
import json
import os
from copy import deepcopy

import pytest

from lessonos.study.models import StudyError
from lessonos.study import question_bank as bank_module
from lessonos.study.question_bank import QuestionBank, parse_rational


def write_bank(path, *, families=36):
    path.mkdir(parents=True, exist_ok=True)
    (path / 'questions').mkdir(exist_ok=True)
    questions = []
    for index in range(families):
        for kind in ('multiple_choice', 'completion'):
            question = {
                'id': f'fixture-{index:03}-{kind}', 'version': 1,
                'bankId': 'physics-semestre-2026', 'activityId': 'physics-question-bank-v1',
                'prompt': 'Quanto vale metà di tre? Rispondi in m.', 'format': kind,
                'options': [{'id': letter, 'text': value, 'exact': value}
                            for letter, value in zip('ABCDE', ['1', '3/2', '2', '3', '6'])] if kind == 'multiple_choice' else [],
                'answer': {'kind': 'rational', 'exact': '3/2', 'unit': 'm',
                           'text': '3/2 m', 'accepted': ['1,5', '1.5', '3/2'],
                           **({'correctOptionId': 'B'} if kind == 'multiple_choice' else {})},
                'solution': 'Spiegazione riservata: dividere tre per due.',
                'solutionSteps': [{'title': 'Divisione', 'explanation': 'Tre diviso due vale uno e mezzo.'}],
                'taxonomy': {'unitId': f'U{index % 7 + 1}', 'macroarea': 'Fisica', 'microarea': 'Misure', 'topic': 'Metà'},
                'difficulty': {'level': ('base', 'facile', 'medio', 'difficile')[index % 4], 'rank': index % 4 + 1, 'reason': 'Un rapporto.'},
                'descriptors': {'learningObjective': 'Calcolare un rapporto', 'calculatorAllowed': False,
                                'estimatedSeconds': 30, 'miniCourseIds': ['misure'],
                                'misconceptions': ['Il risultato segreto è tre mezzi.']},
                'familyId': f'family-{index:03}', 'semanticSignature': f'secret-{index}-{kind}',
                'status': 'DRAFT', 'reviewer': None, 'verification': {'exact': '3/2'},
                'provenance': {'authoringFormula': '3/2'},
            }
            questions.append(question)
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (path / 'questions' / 'U1.json').write_bytes(payload)
    manifest = {
        'id': 'physics-semestre-2026', 'version': 1, 'schemaVersion': '1.0.0',
        'questionCount': len(questions), 'status': 'DRAFT',
        'shards': [{'path': 'questions/U1.json', 'count': len(questions), 'sha256': hashlib.sha256(payload).hexdigest()}],
        'examProfiles': [{'id': 'semestre-2026', 'questionCount': 31, 'multipleChoice': 21, 'completion': 10,
                          'durationSeconds': 3000, 'scoring': {'correct': 1, 'incorrect': -0.1, 'omitted': 0}}],
        'taxonomy': [], 'quality': {'scientificApproval': 'NOT_RUN'}, 'sources': [],
    }
    (path / 'manifest.json').write_text(json.dumps(manifest))
    return questions, manifest


def rewrite_bank(path, questions, manifest):
    payload = json.dumps(questions, ensure_ascii=False).encode()
    (path / 'questions' / 'U1.json').write_bytes(payload)
    manifest['shards'][0]['sha256'] = hashlib.sha256(payload).hexdigest()
    (path / 'manifest.json').write_text(json.dumps(manifest))


@pytest.fixture
def bank(tmp_path):
    write_bank(tmp_path)
    return QuestionBank(tmp_path)


def test_projection_is_allowlisted_recursively_and_detached(bank):
    question = bank.question('fixture-000-multiple_choice')
    serialized = json.dumps(question)
    for secret in ('solution', 'answer', 'exact', 'secret-', 'verification', 'authoringFormula', 'misconceptions'):
        assert secret not in serialized
    assert question['status'] == 'DRAFT'
    assert question['options'][1] == {'id': 'B', 'text': '3/2'}
    question['options'][1]['text'] = 'mutated'
    assert bank.question('fixture-000-multiple_choice')['options'][1]['text'] == '3/2'


def test_bounded_filters_and_pagination_cover_each_question_once(bank):
    first = bank.questions(limit=5, difficulty='base', mini_course_id='misure')
    assert first['total'] == 18 and len(first['items']) == 5
    ids = [item['id'] for item in first['items']]
    cursor = first['nextCursor']
    while cursor:
        page = bank.questions(limit=5, after=cursor, difficulty='base', mini_course_id='misure')
        ids.extend(item['id'] for item in page['items'])
        cursor = page['nextCursor']
    assert len(ids) == len(set(ids)) == 18
    assert bank.questions(unit_id='U2', format='completion')['total'] == 5
    assert bank.questions(query='nonpresente')['total'] == 0
    for options in ({'limit': 0}, {'limit': True}, {'limit': 101}, {'difficulty': 'invented'},
                    {'unit_id': '../../secret'}, {'after': 'missing'}, {'query': 'x' * 121}):
        with pytest.raises(StudyError):
            bank.questions(**options)


@pytest.mark.parametrize('value', ['1.5', '1,5', '3 / 2', '6/4', '+15e-1', '1.5 m'])
def test_rational_answers_use_exact_equivalence_and_declared_units(bank, value):
    result = bank.attempt('fixture-000-completion', value)
    assert result['outcome'] == 'correct' and result['score'] == 1
    assert result['answer']['exact'] == '3/2'
    assert result['solutionSteps'] and result['scientificApproval'] == 'NOT_RUN'
    assert result['persisted'] is False


@pytest.mark.parametrize('value', ['1/0', '1e999999999', '__import__("os").system("id")', 'NaN', 'Infinity',
                                  '9' * 200, '1 5', '1.5 cm', '3/(1+1)'])
def test_parser_never_evaluates_arbitrary_expressions(bank, value):
    if len(value) > 128:
        with pytest.raises(StudyError, match='invalid_answer'):
            bank.attempt('fixture-000-completion', value)
    else:
        assert bank.attempt('fixture-000-completion', value)['outcome'] == 'incorrect'
    assert parse_rational(value) is None


def test_mcq_omission_scoring_and_stale_bank_pin(bank):
    assert bank.attempt('fixture-000-multiple_choice', 'b')['outcome'] == 'correct'
    assert bank.attempt('fixture-000-multiple_choice', 'A')['score'] == -0.1
    assert bank.attempt('fixture-000-completion', '')['outcome'] == 'omitted'
    assert bank.attempt('fixture-000-completion', ' ')['score'] == 0
    with pytest.raises(StudyError, match='question_bank_changed'):
        bank.attempt('fixture-000-completion', '3/2', expected_sha256='0' * 64)


def test_seeded_exam_has_2026_format_distinct_families_and_no_spoilers(bank):
    first = bank.exam('same-seed')
    assert first == bank.exam('same-seed')
    assert first['durationSeconds'] == 3000
    assert len(first['questions']) == 31
    assert sum(q['format'] == 'multiple_choice' for q in first['questions']) == 21
    assert sum(q['format'] == 'completion' for q in first['questions']) == 10
    assert len({q['familyId'] for q in first['questions']}) == 31
    assert [q['id'] for q in first['questions']] != [q['id'] for q in bank.exam('other-seed')['questions']]
    assert 'solution' not in json.dumps(first) and 'correctOptionId' not in json.dumps(first)
    with pytest.raises(StudyError, match='insufficient_distinct_families'):
        bank.exam('small', difficulty='base')


def test_integrity_rejects_tampering_duplicates_and_path_escape(tmp_path):
    questions, manifest = write_bank(tmp_path)
    (tmp_path / 'questions' / 'U1.json').write_text('[]')
    with pytest.raises(StudyError, match='question_bank_unavailable'):
        QuestionBank(tmp_path)
    questions, manifest = write_bank(tmp_path)
    questions[-1]['id'] = questions[0]['id']
    payload = json.dumps(questions).encode()
    (tmp_path / 'questions' / 'U1.json').write_bytes(payload)
    manifest['shards'][0]['sha256'] = hashlib.sha256(payload).hexdigest()
    (tmp_path / 'manifest.json').write_text(json.dumps(manifest))
    with pytest.raises(StudyError, match='question_bank_unavailable'):
        QuestionBank(tmp_path)
    _, manifest = write_bank(tmp_path)
    manifest['shards'][0]['path'] = '../private.json'
    (tmp_path / 'manifest.json').write_text(json.dumps(manifest))
    with pytest.raises(StudyError, match='question_bank_unavailable'):
        QuestionBank(tmp_path)


def test_symbolic_and_text_aliases_do_not_claim_general_cas_equivalence(tmp_path):
    questions, manifest = write_bank(tmp_path)
    question = next(q for q in questions if q['id'] == 'fixture-000-completion')
    question['answer'] = {'kind': 'symbolic', 'exact': 'm*v', 'unit': 'kg m/s', 'text': 'm v', 'accepted': ['m*v', 'mv']}
    rewrite_bank(tmp_path, questions, manifest)
    bank = QuestionBank(tmp_path)
    assert bank.attempt(question['id'], 'm * v')['outcome'] == 'correct'
    assert bank.attempt(question['id'], 'v*m')['outcome'] == 'incorrect'
    assert bank.attempt(question['id'], 'v*m')['matchingPolicy'] == 'approved_aliases_only'
    question['answer'] = {'kind': 'text', 'exact': 'inerzia', 'unit': '', 'text': 'inerzia', 'accepted': ['inerzia']}
    rewrite_bank(tmp_path, questions, manifest)
    bank = QuestionBank(tmp_path)
    assert bank.attempt(question['id'], '  INERZIA  ')['outcome'] == 'correct'


@pytest.mark.parametrize('invalid', ['AB', '', None])
def test_correct_option_is_one_explicit_choice_id(bank, invalid):
    question = deepcopy(bank._by_id['fixture-000-multiple_choice'])
    question['answer']['correctOptionId'] = invalid
    with pytest.raises(ValueError, match='invalid options'):
        QuestionBank._validate_question(question)


def test_snapshot_is_immutable_but_public_results_can_be_modified(bank):
    with pytest.raises(TypeError):
        bank.manifest['title'] = 'modified'
    with pytest.raises(TypeError):
        bank._by_id['fixture-000-completion']['answer']['exact'] = '99'
    with pytest.raises(AttributeError):
        bank.sha256 = '0' * 64
    response = bank.attempt('fixture-000-completion', '3/2')
    response['answer']['accepted'].append('99')
    response['solutionSteps'][0]['title'] = 'modified'
    original = bank.attempt('fixture-000-completion', '99')
    assert original['outcome'] == 'incorrect'
    assert original['solutionSteps'][0]['title'] != 'modified'


def test_cache_reuses_snapshots_and_invalidates_manifest_or_shard_changes(tmp_path, monkeypatch):
    questions, manifest = write_bank(tmp_path)
    monkeypatch.setitem(bank_module.BANK_PATHS, bank_module.BANK_ID, tmp_path)
    bank_module.clear_bank_cache()
    first = bank_module.load_bank()
    assert bank_module.load_bank() is first
    manifest['title'] = 'Updated catalog'
    (tmp_path / 'manifest.json').write_text(json.dumps(manifest))
    updated = bank_module.load_bank()
    assert updated is not first and updated.catalog()['title'] == 'Updated catalog'
    assert bank_module.load_bank() is updated
    source = tmp_path / 'questions' / 'U1.json'
    before = source.stat()
    raw = source.read_bytes()
    # Same byte length and restored mtime still has a different ctime.
    source.write_bytes(raw.replace(b'fixture-000', b'fixture-999', 1))
    os.utime(source, ns=(before.st_atime_ns, before.st_mtime_ns))
    assert source.stat().st_size == before.st_size
    with pytest.raises(StudyError, match='question_bank_unavailable'):
        bank_module.load_bank()
    rewrite_bank(tmp_path, questions, manifest)
    repaired = bank_module.load_bank()
    assert repaired is not updated
    assert repaired.question('fixture-000-completion')['prompt']
    bank_module.clear_bank_cache()


def test_cache_is_bounded_and_rechecks_registry_paths(tmp_path, monkeypatch):
    bank_module.clear_bank_cache()
    original = None
    for index in range(bank_module._BANK_CACHE_LIMIT + 1):
        path = tmp_path / str(index)
        write_bank(path)
        monkeypatch.setitem(bank_module.BANK_PATHS, bank_module.BANK_ID, path)
        snapshot = bank_module.load_bank()
        if index == 0:
            original = snapshot
    assert len(bank_module._BANK_CACHE) == bank_module._BANK_CACHE_LIMIT
    monkeypatch.setitem(bank_module.BANK_PATHS, bank_module.BANK_ID, tmp_path / '0')
    assert bank_module.load_bank() is not original
    bank_module.clear_bank_cache()


def test_2026_exam_separates_law_families_and_excludes_provided_law_extensions(tmp_path):
    questions, manifest = write_bank(tmp_path, families=50)
    for question in questions:
        family_number = int(question['familyId'].split('-')[-1])
        question['lawFamily'] = f'law-{family_number % 40:03}'
        if family_number >= 35:
            question['descriptors']['scope'] = 'provided_law_extension'
    rewrite_bank(tmp_path, questions, manifest)
    bank = QuestionBank(tmp_path)
    exam = bank.exam('law-separation')
    assert len(exam['questions']) == 31
    assert len({q['lawFamily'] for q in exam['questions']}) == 31
    assert all(int(q['familyId'].split('-')[-1]) < 35 for q in exam['questions'])
    assert exam['lawFamilyRepetition'] is False
    assert exam['excludedScopes'] == ['provided_law_extension']
    assert sum(q['format'] == 'multiple_choice' for q in exam['questions']) == 21


def test_training_coverage_retains_a_rare_unit_without_changing_format_or_law_uniqueness(tmp_path):
    questions, manifest = write_bank(tmp_path, families=50)
    for question in questions:
        number = int(question['familyId'].split('-')[-1])
        question['taxonomy']['unitId'] = 'U7' if number == 49 else f'U{number % 6 + 1}'
    rewrite_bank(tmp_path, questions, manifest)
    bank = QuestionBank(tmp_path)
    for index in range(12):
        exam = bank.exam(f'rare-unit-{index}')
        assert {q['taxonomy']['unitId'] for q in exam['questions']} == {f'U{i}' for i in range(1, 8)}
        assert len({q['lawFamily'] for q in exam['questions']}) == 31
        assert sum(q['format'] == 'multiple_choice' for q in exam['questions']) == 21
        assert sum(q['format'] == 'completion' for q in exam['questions']) == 10
        assert exam['samplingStrategy']['unitCoverageComplete'] is True
        assert exam['samplingStrategy']['officialUnitQuota'] is False
