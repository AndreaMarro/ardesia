"""Integration audit of the actual expanded bank, without external services."""
from collections import Counter
import hashlib
import json
from pathlib import Path
import resource
import sys
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / "packages/engine"))

from lessonos.study.question_bank import BANK_ID, BANK_PATHS, LEVELS, clear_bank_cache, load_bank


DEST = HERE.parent / 'docs/RUNTIME-CORPUS-VALIDATION-2026-10-21.json'
FORBIDDEN = {'answer', 'solution', 'solutionSteps', 'verification', 'correctOptionId', 'accepted', 'exact'}


def assert_student_projection(value):
    if isinstance(value, dict):
        assert not (FORBIDDEN & value.keys()), FORBIDDEN & value.keys()
        for child in value.values():
            assert_student_projection(child)
    elif isinstance(value, (tuple, list)):
        for child in value:
            assert_student_projection(child)


clear_bank_cache()
start = time.perf_counter()
bank = load_bank()
cold = time.perf_counter() - start
warm = []
for _ in range(100):
    start = time.perf_counter()
    assert load_bank() is bank
    warm.append(time.perf_counter() - start)

catalog = bank.catalog()
assert catalog['questionCount'] == 4000, catalog['questionCount']
assert catalog['countsByDifficulty'] == {level: 1000 for level in LEVELS}
questions = bank._questions
start = time.perf_counter()
canonical_grades = Counter()
for question in questions:
    projected = bank.question(question['id'])
    assert_student_projection(projected)
    json.dumps(projected, ensure_ascii=False)
    response = (question['answer']['correctOptionId'] if question['format'] == 'multiple_choice'
                else question['answer']['exact'])
    result = bank.attempt(question['id'], response, expected_sha256=bank.sha256)
    assert result['outcome'] == 'correct', (question['id'], response, result['outcome'])
    assert result['score'] == 1, question['id']
    assert result['solution'] == question['solution'], question['id']
    assert len(result['solutionSteps']) == len(question['solutionSteps']), question['id']
    canonical_grades[question['format']] += 1
grading_seconds = time.perf_counter() - start

start = time.perf_counter()
pages = 0
seen = []
cursor = None
while True:
    page = bank.questions(limit=100, after=cursor, expected_sha256=bank.sha256)
    assert page['total'] == 4000
    assert_student_projection(page['items'])
    seen.extend(q['id'] for q in page['items'])
    pages += 1
    cursor = page['nextCursor']
    if cursor is None:
        break
assert len(seen) == len(set(seen)) == 4000
assert seen == sorted(seen)
pagination_seconds = time.perf_counter() - start

exam_rows = []
start = time.perf_counter()
for profile in catalog['examProfiles']:
    profile_id = profile['id']
    for level in (None, *LEVELS):
        for seed_number in range(10):
            seed = f'corpus-integration-{seed_number}'
            result = bank.exam(seed, profile_id=profile_id, difficulty=level, expected_sha256=bank.sha256)
            paper = result['questions']
            assert len(paper) == 31
            assert Counter(q['format'] for q in paper) == {
                'multiple_choice': profile['multipleChoice'], 'completion': profile['completion']}
            assert len({q['lawFamily'] for q in paper}) == 31
            assert len({q['id'] for q in paper}) == 31
            assert result['durationSeconds'] == profile['durationSeconds']
            if level:
                assert all(q['difficulty']['level'] == level for q in paper)
            if profile_id == 'semestre-2026':
                assert all(q['descriptors']['scope'] == 'syllabus_core' for q in paper)
                assert {q['taxonomy']['unitId'] for q in paper} == {f'U{i}' for i in range(1, 8)}
                assert result['samplingStrategy']['unitCoverageComplete'] is True
                assert result['samplingStrategy']['officialUnitQuota'] is False
            if seed_number == 0:
                repeat = bank.exam(seed, profile_id=profile_id, difficulty=level, expected_sha256=bank.sha256)
                assert repeat == result
            assert_student_projection(paper)
            exam_rows.append({'profile': profile_id, 'difficulty': level or 'mixed', 'seed': seed,
                              'units': sorted({q['taxonomy']['unitId'] for q in paper}),
                              'passed': True})
exam_seconds = time.perf_counter() - start

directory = BANK_PATHS[BANK_ID]
manifest = json.loads((directory / 'manifest.json').read_text())
shards = manifest['shards']
result = {
    'date': '2026-10-21',
    'status': 'PASS',
    'scientificApproval': 'NOT_RUN',
    'bankId': BANK_ID,
    'manifestSha256': bank.sha256,
    'recordCount': len(questions),
    'shardCount': len(shards),
    'shardBytes': sum((directory / item['path']).stat().st_size for item in shards),
    'maxShardBytes': max((directory / item['path']).stat().st_size for item in shards),
    'countsByDifficulty': catalog['countsByDifficulty'],
    'countsByUnit': catalog['countsByUnit'],
    'countsByFormat': catalog['countsByFormat'],
    'countsByScope': dict(Counter(q['descriptors']['scope'] for q in questions)),
    'lawFamilies': len({q['lawFamily'] for q in questions}),
    'canonicalAnswersCorrect': sum(canonical_grades.values()),
    'canonicalAnswersByFormat': dict(canonical_grades),
    'studentProjectionsChecked': len(questions),
    'pagination': {'pages': pages, 'pageSize': 100, 'distinctIds': len(seen)},
    'examProfilesChecked': [p['id'] for p in catalog['examProfiles']],
    'examInstancesChecked': len(exam_rows),
    'examLevelsChecked': ['mixed', *LEVELS],
    'seedsPerProfileAndLevel': 10,
    'determinismChecks': len(catalog['examProfiles']) * 5,
    'unitCoverageStrategy': 'editorial_training_not_ministerial_quotas',
    'timingSeconds': {
        'coldSnapshotLoad': round(cold, 6),
        'warmLoadMean100': round(sum(warm)/len(warm), 6),
        'warmLoadMax100': round(max(warm), 6),
        'allCanonicalGradesAndProjections': round(grading_seconds, 6),
        'pagination40Pages': round(pagination_seconds, 6),
        'examInstancesAndDeterminism': round(exam_seconds, 6),
    },
    'maxProcessRssKiB': resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 if sys.platform == 'darwin' else 1),
    'limitations': [
        'Wall-clock timings describe one local execution and are not a production SLA.',
        'This checks stored keys against the deterministic runtime grader; it does not independently prove every physical premise.',
        'Attempts remain stateless; no external services, real-user data or production session were used.',
        'Human scientific approval and production deployment were not performed.',
    ],
}
assert hashlib.sha256((directory/'manifest.json').read_bytes()).hexdigest() == bank.sha256
DEST.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(result, ensure_ascii=False, indent=2))
