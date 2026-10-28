"""Canonical atomic assessment prompts use the existing manual receipt authority."""
import pytest

from lessonos.study.catalog import load_pack
from lessonos.study.four_courses import course_projection_for_edition, coursepack_for_edition
from lessonos.study.models import StudyError
from lessonos.study.science_library.fluid_models import default_fluid_parameters
from lessonos.study.store import canonical, digest
from lessonos.study.submissions import submit, get_receipt, list_submissions
from test_course_evidence import fixture, lesson_context, reasoning


def assessment_ref(item):
    return {'id':item['id'], 'version':1, 'sha256':digest(canonical(item))}


def context_for(item, phase='practice', **extra):
    return lesson_context('ds-2026-'+item['familyId'].lower(), phase,
                          assessmentRef=assessment_ref(item), **extra)


def test_all_57_safe_atomic_prompts_are_reachable_and_teacher_rubrics_stay_unchanged(tmp_path):
    store, teacher, student, *_ = fixture(tmp_path)
    canonical_pack = load_pack('sf-fluidi-termodinamica-v1')
    original_bytes = canonical(canonical_pack)
    assert len(canonical_pack['atomicFinalAssessment']) == 57
    assert 'assessmentItems' not in coursepack_for_edition(store, student, 'course')
    assert 'assessmentItems' not in course_projection_for_edition(store, student, 'course')['course']
    store.synthetic_acceptance = True
    projected = course_projection_for_edition(store, student, 'course')['course']['assessmentItems']
    assert projected == coursepack_for_edition(store, student, 'course')['assessmentItems']
    assert len(projected) == 57 and len({i['objectiveId'] for i in projected}) == 57
    reachable = {objective for lesson in coursepack_for_edition(store, student, 'course')['lessons']
                 if lesson['activityId'] == 'course-reasoning-v1' for objective in lesson['objectiveIds']}
    for safe, original in zip(projected, canonical_pack['atomicFinalAssessment'], strict=True):
        assert set(safe) == {'id', 'objectiveId', 'prompt', 'transfer', 'assessmentRef', 'hintCount'}
        assert set(safe['transfer']) == {'prompt','hintCount'}
        assert safe['assessmentRef'] == assessment_ref(original)
        assert safe['prompt'] == original['prompt']
        assert safe['transfer']['prompt'] == original['transfer']['prompt']
        assert safe['objectiveId'] in reachable
        assert original['answer'] not in canonical(safe)
    assert coursepack_for_edition(store, teacher, 'course') == canonical_pack
    assert coursepack_for_edition(store, teacher, 'course')['atomicFinalAssessment'][0]['rubric']['criteria']
    assert canonical(load_pack('sf-fluidi-termodinamica-v1')) == original_bytes
    store.close()


def test_every_canonical_atomic_item_gets_practice_and_transfer_receipts_with_exact_originals(tmp_path):
    store, teacher, student, peer, _ = fixture(tmp_path)
    store.synthetic_acceptance = True
    items = load_pack('sf-fluidi-termodinamica-v1')['atomicFinalAssessment']
    for index, item in enumerate(items):
        for phase in ('practice', 'transfer'):
            context = context_for(item, phase, stepId='independent' if phase == 'practice' else 'transfer')
            text = f'Originale sintetico {index}/{phase}: modello, vincolo e ragionamento da rivedere.'
            receipt = submit(store, student, 'course', 'course-reasoning-v1', [], text, f'item-{index}-{phase}',
                             activity_parameters={}, course_lesson=context)
            assert receipt['courseContext']['assessmentRef'] == assessment_ref(item)
            expected_prompt = item['prompt'] if phase == 'practice' else item['transfer']['prompt']
            assert receipt['courseContext']['assessmentPrompt'] == expected_prompt
            assert receipt['review'] == {'state':'MANUAL_REVIEW_REQUIRED', 'originalText':text, 'prompt':expected_prompt}
            assert receipt['courseContext']['parameters'] == {} and receipt['courseContext']['modelId'] is None
            assert receipt['state'] == 'received' and 'grade' not in receipt
            assert get_receipt(store, student, receipt['receiptId']) == receipt
            assert get_receipt(store, teacher, receipt['receiptId']) == receipt
            assert item['answer'] not in canonical(receipt)
    attempts = list_submissions(store, student, 'course')
    assert len(attempts) == 114
    assert all(attempt['courseContext']['assessmentRef']['version'] == 1 for attempt in attempts)
    assert list_submissions(store, peer, 'course') == []
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='submission.received'").fetchone()[0] == 114
    store.close()


@pytest.mark.parametrize('mutation,error', [
    (lambda ref:ref.update(sha256='0'*64), 'stale_course_assessment'),
    (lambda ref:ref.update(version=2), 'stale_course_assessment'),
    (lambda ref:ref.update(id='unknown-assessment'), 'stale_course_assessment'),
    (lambda ref:ref.update(version=True), 'invalid_course_assessment'),
    (lambda ref:ref.update(answer='injected'), 'invalid_course_assessment'),
    (lambda ref:ref.update(sha256='wrong'), 'invalid_course_assessment'),
])
def test_assessment_revision_is_exact_and_untrusted_reference_extensions_are_rejected(tmp_path, mutation, error):
    store, _, student, *_ = fixture(tmp_path)
    store.synthetic_acceptance = True
    item = load_pack('sf-fluidi-termodinamica-v1')['atomicFinalAssessment'][0]
    context = context_for(item)
    mutation(context['assessmentRef'])
    with pytest.raises(StudyError, match=error):
        reasoning(store, student, context=context)
    assert list_submissions(store, student, 'course') == []
    store.close()


def test_assessment_objective_cannot_cross_lesson_or_use_guessed_reader_revision(tmp_path):
    store, _, student, *_ = fixture(tmp_path)
    store.synthetic_acceptance = True
    item = load_pack('sf-fluidi-termodinamica-v1')['atomicFinalAssessment'][0]
    context = lesson_context('ds-2026-u3-02', assessmentRef=assessment_ref(item))
    with pytest.raises(StudyError, match='course_assessment_objective_mismatch'):
        reasoning(store, student, context=context)
    context = context_for(item); context['lessonRef']['sha256'] = '0'*64
    with pytest.raises(StudyError, match='stale_course_lesson'):
        reasoning(store, student, context=context)
    context = context_for(item); context['assessmentPrompt'] = 'Client-selected prompt'
    with pytest.raises(StudyError, match='invalid_course_lesson'):
        reasoning(store, student, context=context)
    store.close()


def test_assessment_parent_retry_pins_the_same_item_and_preserves_legacy_absence(tmp_path):
    store, _, student, peer, _ = fixture(tmp_path)
    store.synthetic_acceptance = True
    first, second = load_pack('sf-fluidi-termodinamica-v1')['atomicFinalAssessment'][:2]
    context = context_for(first)
    receipt = reasoning(store, student, context=context)
    assert reasoning(store, student, context=context) == receipt
    assert store.connection.execute("SELECT COUNT(*) FROM study_submissions WHERE edition_id='course'").fetchone()[0] == 1
    with pytest.raises(StudyError, match='idempotency_conflict'):
        reasoning(store, student, context=context_for(second))
    for index, different_context in enumerate((context_for(second), context_for(first, 'transfer'),
                                               lesson_context('ds-2026-u3-01'))):
        with pytest.raises(StudyError, match='parent_course_lesson_mismatch'):
            reasoning(store, student, 'wrong-parent-'+str(index), context=different_context, parent_id=receipt['submissionId'])
    with pytest.raises(StudyError, match='forbidden'):
        reasoning(store, peer, 'peer-parent', context=context, parent_id=receipt['submissionId'])
    child = reasoning(store, student, 'child', context=context_for(first, stepId='feedback'), parent_id=receipt['submissionId'])
    assert child['revision'] == 2 and child['courseContext']['assessmentRef'] == assessment_ref(first)
    legacy = reasoning(store, student, 'legacy', context=lesson_context('ds-2026-u3-01'))
    assert 'assessmentRef' not in legacy['courseContext'] and 'prompt' not in legacy['review']
    with pytest.raises(StudyError, match='parent_course_lesson_mismatch'):
        reasoning(store, student, 'add-assessment', context=context, parent_id=legacy['submissionId'])
    store.close()


def test_lab_comparison_rejects_assessment_reference_and_default_students_cannot_assign_atomic_items(tmp_path):
    store, _, student, *_ = fixture(tmp_path)
    item = next(item for item in load_pack('sf-fluidi-termodinamica-v1')['atomicFinalAssessment']
                if item['objectiveId'].startswith('U3-02.'))
    context = context_for(item)
    with pytest.raises(StudyError, match='course_lesson_unavailable'):
        reasoning(store, student, context=context)
    store.synthetic_acceptance = True
    with pytest.raises(StudyError, match='course_assessment_activity_mismatch'):
        submit(store, student, 'course', 'hydrostatic-lab-v1', [], 'Non è una risposta numerica automatica', 'wrong-model',
               course_lesson=context, activity_parameters=default_fluid_parameters('hydrostatic-lab-v1'))
    store.close()
