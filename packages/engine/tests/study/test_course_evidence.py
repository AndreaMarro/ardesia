"""One existing resource/submission authority for controlled draft course evidence."""
from copy import deepcopy

import pytest

from lessonos.study.catalog import load_pack
from lessonos.study.four_courses import course_projection_for_edition, coursepack_for_edition, lesson_reference
from lessonos.study.models import StudyError
from lessonos.study.science_library import resources
from lessonos.study.science_library.fluid_catalog import FLUID_LAB_DEFINITIONS
from lessonos.study.science_library.fluid_models import default_fluid_parameters
from lessonos.study.store import StudyStore, canonical, digest
from lessonos.study.submissions import submit, get_receipt, list_submissions
from test_identity_store import setup_store


def fixture(tmp_path):
    store, teacher, student, peer, other = setup_store(tmp_path)
    store.create_edition(teacher, 'course', course_id='fluidi-termodinamica', pack_id='sf-fluidi-termodinamica-v1')
    store.add_test_member(teacher, 'course', student.id)
    store.add_test_member(teacher, 'course', peer.id)
    return store, teacher, student, peer, other


def lesson_context(lesson_id='ds-2026-u3-01', phase='practice', **extra):
    lesson = next(l for l in load_pack('sf-fluidi-termodinamica-v1')['lessons'] if l['id'] == lesson_id)
    return {'lessonRef':lesson_reference(lesson), 'phase':phase, **extra}


def lab_state(capability='manometer-lab-v1', *, context=None):
    params = default_fluid_parameters(capability)
    definition = FLUID_LAB_DEFINITIONS[capability]
    snapshot = resources.new_snapshot(capability, params, note='Prima previsione, poi osservazione.', prediction='Il segno si inverte')
    # JavaScript serializes integer values without Python's floating point suffix.
    snapshot['parameters'] = params
    snapshot['supportUsed'] = ['model']
    snapshot['labSnapshot'] = {
        'schema':'ardesia.fluid-thermo.snapshot/1', 'pluginId':'io.ardesia.fluid-thermo', 'pluginVersion':'1.0.0',
        'configuration':{'schemaVersion':1, 'modelId':definition['id'], 'modelVersion':1, 'parameters':deepcopy(params)},
        'prediction':snapshot['prediction'], 'note':snapshot['note'], 'supportUsed':['model'], 'view':'3d',
    }
    if context:
        snapshot['courseLesson'] = deepcopy(context)
        snapshot['labSnapshot']['configuration']['lessonRef'] = deepcopy(context['lessonRef'])
    return snapshot


def reasoning(store, student, key='attempt', *, context=None, **kwargs):
    return submit(store, student, 'course', 'course-reasoning-v1', [], 'Fisso la forza e dimezzo l’area: prevedo pressione doppia.', key,
                  course_lesson=context or lesson_context(), activity_parameters={}, **kwargs)


def test_default_demo_guard_and_server_owned_controlled_projection(tmp_path):
    store, teacher, student, peer, other = fixture(tmp_path)
    public = course_projection_for_edition(store, student, 'course')
    assert public['releaseScope'] == 'PUBLIC_DEMONSTRATION'
    assert len(public['course']['lessons']) == 1
    with pytest.raises(StudyError, match='course_lesson_unavailable'):
        reasoning(store, student)
    # A truthy string is not the trusted server policy boolean.
    store.synthetic_acceptance = 'SYNTHETIC_ACCEPTANCE'
    assert len(coursepack_for_edition(store, student, 'course')['lessons']) == 1
    store.synthetic_acceptance = True
    controlled = course_projection_for_edition(store, student, 'course')
    assert controlled['releaseScope'] == 'PRIVATE_SYNTHETIC_ACCEPTANCE'
    assert len(controlled['course']['lessons']) == 11  # Ten authored lessons plus the unchanged public demo.
    assert controlled['bankIncluded'] is False
    assert controlled['course']['completedObjectives'] == 0
    assert controlled['course']['humanApproval'] is False
    assert controlled['course']['editorialStatus'] == 'DRAFT'
    assert set(controlled['course']['editorialMaterials']) == {'formulaSheet', 'recoveryTargets'}
    pack = coursepack_for_edition(store, student, 'course')
    assert pack['exercises'] == pack['transferTests'] == []
    assert 'reviewRubric' not in pack and 'atomicFinalAssessment' not in pack
    for lesson in controlled['course']['lessons']:
        assert lesson['workedExample']['steps'] and lesson['workedExample']['answerDisplay']
        assert lesson['lessonRef'] == lesson_context(lesson['id'])['lessonRef']
        assert 'answer' not in lesson['practice'] and 'answer' not in lesson['transfer']
        assert lesson['editorialStatus'] == 'DRAFT' and lesson['humanApproval'] is False
    teacher_pack = coursepack_for_edition(store, teacher, 'course')
    assert teacher_pack['atomicFinalAssessment'][0]['answer']
    store.close()


def test_manual_attempt_retry_parent_and_source_keep_original_receipt_authority(tmp_path):
    store, teacher, student, peer, other = fixture(tmp_path)
    store.synthetic_acceptance = True
    saved = resources.save(store, student, 'course', lab_state(context=lesson_context(stepId='annotate')), 'save')
    ref = {'resourceId':saved['resource']['id'], 'revisionId':saved['resource']['revisionId']}
    receipt = reasoning(store, student, source_refs=[ref])
    assert reasoning(store, student, source_refs=[ref]) == receipt
    assert get_receipt(store, student, receipt['receiptId']) == receipt
    assert receipt['courseContext']['lessonRef'] == lesson_context()['lessonRef']
    assert receipt['courseContext']['phase'] == 'practice'
    assert receipt['courseContext']['parameters'] == {}
    assert receipt['courseContext']['modelId'] is None
    assert receipt['review']['state'] == 'MANUAL_REVIEW_REQUIRED'
    assert receipt['review']['originalText'] == list_submissions(store, teacher, 'course')[0]['text']
    assert 'correct' not in receipt and 'mastery' not in receipt
    assert resources.read(store, teacher, ref['resourceId'], ref['revisionId']) == saved
    assert len(list_submissions(store, peer, 'course')) == 0
    child = reasoning(store, student, 'child', parent_id=receipt['submissionId'], source_refs=[ref])
    assert child['revision'] == 2 and child['parentId'] == receipt['submissionId']
    assert reasoning(store, student, 'child', parent_id=receipt['submissionId'], source_refs=[ref]) == child
    with pytest.raises(StudyError, match='newer_attempt_exists'):
        reasoning(store, student, 'second-child', parent_id=receipt['submissionId'])
    with pytest.raises(StudyError, match='parent_course_lesson_mismatch'):
        reasoning(store, student, 'changed-phase', context=lesson_context(phase='transfer'), parent_id=child['submissionId'])
    with pytest.raises(StudyError, match='forbidden'):
        reasoning(store, peer, 'peer-parent', parent_id=child['submissionId'])
    assert store.connection.execute("SELECT COUNT(*) FROM study_submissions WHERE edition_id='course'").fetchone()[0] == 2
    store.close()


@pytest.mark.parametrize('mutation,error', [
    (lambda c:c['lessonRef'].update(sha256='0'*64), 'stale_course_lesson'),
    (lambda c:c['lessonRef'].update(version=2), 'stale_course_lesson'),
    (lambda c:c['lessonRef'].update(id='ds-2026-u1-01'), 'course_lesson_unavailable'),
    (lambda c:c.update(phase='accepted'), 'invalid_course_lesson'),
])
def test_manual_rejects_guessed_revision_another_course_and_invalid_phase(tmp_path, mutation, error):
    store, teacher, student, *_ = fixture(tmp_path)
    store.synthetic_acceptance = True
    context = lesson_context(); mutation(context)
    with pytest.raises(StudyError, match=error):
        reasoning(store, student, context=context)
    assert not list_submissions(store, student, 'course')
    store.close()


def test_manual_requires_bound_lesson_empty_parameters_membership_and_same_source_phase(tmp_path):
    store, teacher, student, peer, other = fixture(tmp_path)
    store.synthetic_acceptance = True
    for options in ({}, {'course_lesson':lesson_context(), 'activity_parameters':{'value':1}},
                    {'course_lesson':lesson_context('original-demo-u5-01'), 'activity_parameters':{}}):
        with pytest.raises(StudyError):
            submit(store, student, 'course', 'course-reasoning-v1', [], 'Originale', 'bad', **options)
    saved = resources.save(store, student, 'course', lab_state(context=lesson_context(phase='transfer')), 'save')
    ref = {'resourceId':saved['resource']['id'], 'revisionId':saved['resource']['revisionId']}
    with pytest.raises(StudyError, match='source_course_lesson_mismatch'):
        reasoning(store, student, source_refs=[ref])
    with pytest.raises(StudyError, match='forbidden'):
        reasoning(store, peer, source_refs=[ref])
    for actor in (teacher, other):
        with pytest.raises(StudyError):
            reasoning(store, actor)
    legacy = submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Q cresce', 'legacy')
    assert 'review' not in legacy and legacy['courseContext']['modelId'] == 'poiseuille-v1'
    store.close()


@pytest.mark.parametrize('capability', sorted(FLUID_LAB_DEFINITIONS))
def test_every_plugin_lab_round_trips_exact_canonical_bytes_without_evaluation_on_read(tmp_path, capability, monkeypatch):
    store, _, student, *_ = fixture(tmp_path)
    snapshot = lab_state(capability)
    saved = resources.save(store, student, 'course', snapshot, 'save')
    assert saved['snapshot'] == snapshot
    assert saved['resource']['text'] == canonical(snapshot)
    assert saved['updatedAt'] == store.connection.execute('SELECT created_at FROM study_revisions WHERE id=?', (saved['resource']['revisionId'],)).fetchone()[0]
    monkeypatch.setattr(resources, 'evaluate', lambda *_:pytest.fail('read must not execute solver'))
    assert resources.read(store, student, saved['resource']['id']) == saved
    store.close()


@pytest.mark.parametrize('mutate', [
    lambda s:s['labSnapshot']['configuration']['parameters'].update(height=17),
    lambda s:s['labSnapshot']['configuration'].update(modelId='ideal-gas'),
    lambda s:s['labSnapshot'].update(prediction='A changed prediction'),
    lambda s:s['labSnapshot'].update(note='A changed note'),
    lambda s:s['labSnapshot'].update(supportUsed=['hint']),
    lambda s:s['labSnapshot'].update(result={'value':999}),
    lambda s:s['labSnapshot']['configuration'].update(result={'value':999}),
    lambda s:s['labSnapshot'].update(view='4d'),
    lambda s:s['labSnapshot']['configuration'].update(modelVersion=True),
    lambda s:s['labSnapshot']['configuration'].update(lessonRef=lesson_context('ds-2026-u3-02')['lessonRef']),
])
def test_plugin_inner_outer_mismatch_and_untrusted_results_are_rejected(tmp_path, mutate):
    store, _, student, *_ = fixture(tmp_path)
    store.synthetic_acceptance = True
    snapshot = lab_state(context=lesson_context())
    mutate(snapshot)
    with pytest.raises(StudyError):
        resources.save(store, student, 'course', snapshot, 'bad')
    assert store.connection.execute("SELECT COUNT(*) FROM study_resources WHERE kind='science-resource'").fetchone()[0] == 0
    store.close()


def test_course_checkpoint_source_revisions_and_lab_objective_binding_are_authorized(tmp_path):
    store, teacher, student, peer, other = fixture(tmp_path)
    store.synthetic_acceptance = True
    source = resources.save(store, student, 'course', resources.new_snapshot('collision-1d-v1', {}, note='Prima osservazione'), 'source')['resource']
    original = source['revisionId']
    resources.save(store, student, 'course', resources.new_snapshot('collision-1d-v1', {}, note='Seconda osservazione'), 'source-update', resource_id=source['id'], expected_revision=original)
    snapshot = lab_state(context=lesson_context(stepId='predict'))
    snapshot['labSnapshot']['configuration']['sourceRefs'] = [{'resourceId':source['id'], 'revisionId':original}]
    saved = resources.save(store, student, 'course', snapshot, 'save')
    assert saved['snapshot']['labSnapshot']['configuration']['sourceRefs'][0]['revisionId'] == original
    invalid = deepcopy(snapshot); invalid['courseLesson']['stepId'] = 'invented-step'
    with pytest.raises(StudyError, match='invalid_course_lesson'):
        resources.save(store, student, 'course', invalid, 'bad-step')
    invalid = lab_state('ideal-gas-lab-v1', context=lesson_context())
    with pytest.raises(StudyError, match='course_lab_mismatch'):
        resources.save(store, student, 'course', invalid, 'bad-lab')
    peer_source = store.create_resource(peer, 'course', 'notes', 'Privato')
    invalid = deepcopy(snapshot); invalid['labSnapshot']['configuration']['sourceRefs'] = [{'resourceId':peer_source['id'], 'revisionId':peer_source['revisionId']}]
    with pytest.raises(StudyError, match='forbidden'):
        resources.save(store, student, 'course', invalid, 'bad-owner')
    wrong_course = store.create_resource(student, 'fluidi', 'notes', 'Altra edizione')
    invalid = deepcopy(snapshot); invalid['labSnapshot']['configuration']['sourceRefs'] = [{'resourceId':wrong_course['id'], 'revisionId':wrong_course['revisionId']}]
    with pytest.raises(StudyError, match='invalid_source_refs'):
        resources.save(store, student, 'course', invalid, 'bad-edition')
    store.close()


def test_plugin_historical_read_preserves_versions_and_cas_retry_never_overwrites(tmp_path, monkeypatch):
    store, _, student, *_ = fixture(tmp_path)
    store.synthetic_acceptance = True
    snapshot = lab_state(context=lesson_context(stepId='predict'))
    first = resources.save(store, student, 'course', snapshot, 'first')
    changed = deepcopy(snapshot)
    changed['courseLesson']['stepId'] = 'annotate'
    second = resources.save(store, student, 'course', changed, 'second', resource_id=first['resource']['id'], expected_revision=first['resource']['revisionId'])
    assert resources.save(store, student, 'course', changed, 'second', resource_id=first['resource']['id'], expected_revision=first['resource']['revisionId']) == second
    with pytest.raises(StudyError, match='stale_revision'):
        resources.save(store, student, 'course', snapshot, 'stale', resource_id=first['resource']['id'], expected_revision=first['resource']['revisionId'])
    assert resources.read(store, student, first['resource']['id']) == second
    assert resources.read(store, student, first['resource']['id'], first['resource']['revisionId']) == first
    historical = deepcopy(snapshot)
    historical['capabilityVersion'] = historical['labSnapshot']['configuration']['modelVersion'] = 7
    historical['implementationSha256'] = 'a'*64
    old = store.create_resource(student, 'course', 'science-resource', canonical(historical))
    monkeypatch.setattr(resources, 'evaluate', lambda *_:pytest.fail('historical read must not execute solver'))
    reopened = resources.read(store, student, old['id'], old['revisionId'])
    assert reopened['snapshot'] == historical and reopened['supported'] is False
    with pytest.raises(StudyError, match='capability_version_unavailable'):
        resources.save(store, student, 'course', historical, 'unsupported')
    store.close()


def test_optional_exercise_reference_is_exact_pinned_and_phase_bound(tmp_path):
    store, teacher, student, *_ = fixture(tmp_path)
    context = lesson_context('original-demo-u5-01')
    exercise = load_pack('sf-fluidi-termodinamica-v1')['exercises'][0]
    snapshot = lab_state('ideal-gas-lab-v1', context=context)
    exact = {'id':exercise['id'], 'version':1, 'sha256':digest(canonical(exercise))}
    snapshot['labSnapshot']['configuration']['exerciseRef'] = exact
    saved = resources.save(store, student, 'course', snapshot, 'save-exercise')
    assert saved['snapshot'] == snapshot
    invalid = deepcopy(snapshot); invalid['labSnapshot']['configuration']['exerciseRef']['sha256'] = '0'*64
    with pytest.raises(StudyError, match='stale_course_exercise'):
        resources.save(store, student, 'course', invalid, 'bad-hash')
    invalid = deepcopy(snapshot); invalid['courseLesson']['phase'] = 'transfer'
    with pytest.raises(StudyError, match='course_exercise_mismatch'):
        resources.save(store, student, 'course', invalid, 'wrong-phase')
    store.close()


def test_historical_plugin_version_remains_readable_without_execution(tmp_path, monkeypatch):
    store, _, student, *_ = fixture(tmp_path)
    snapshot = lab_state(); snapshot['labSnapshot']['pluginVersion'] = '2.0.0'
    resource = store.create_resource(student, 'course', 'science-resource', canonical(snapshot))
    monkeypatch.setattr(resources, 'evaluate', lambda *_:pytest.fail('read must not execute solver'))
    assert resources.read(store, student, resource['id'])['supported'] is False
    assert resources.read(store, student, resource['id'])['snapshot'] == snapshot
    with pytest.raises(StudyError, match='capability_version_unavailable'):
        resources.save(store, student, 'course', snapshot, 'unsupported')
    store.close()


def test_additive_pack_materials_keep_prompts_refs_and_hide_reserved_answers(tmp_path, monkeypatch):
    from lessonos.study import four_courses
    original = four_courses.load_pack
    def with_materials(*args, **kwargs):
        pack = original(*args, **kwargs)
        pack.update({
            'curatedPractice':[{'prompt':'Ragiona sul vincolo', 'lessonRef':lesson_context()['lessonRef'], 'answer':42,
                                'rubric':{'expectedAnswer':'reserved'}, 'feedback':'reserved feedback'}],
            'workedProblemRefs':[{'lessonRef':lesson_context()['lessonRef'], 'locator':'workedExample'}],
            'examSimulations':[{'title':'Simulazione', 'items':[{'prompt':'Nuova situazione', 'expectedAnswer':'reserved',
                'solution':['reserved'], 'transfer':{'prompt':'Transfer', 'answer':17}}]}],
        })
        return pack
    monkeypatch.setattr(four_courses, 'load_pack', with_materials)
    store, teacher, student, *_ = fixture(tmp_path)
    store.synthetic_acceptance = True
    for projected in (coursepack_for_edition(store, student, 'course'), course_projection_for_edition(store, student, 'course')['course']):
        assert projected['curatedPractice'][0]['prompt'] == 'Ragiona sul vincolo'
        assert projected['workedProblemRefs'][0]['locator'] == 'workedExample'
        assert projected['examSimulations'][0]['items'][0] == {'prompt':'Nuova situazione', 'transfer':{'prompt':'Transfer'}}
        assert 'reserved' not in canonical(projected)
    assert coursepack_for_edition(store, teacher, 'course')['curatedPractice'][0]['answer'] == 42
    store.close()


@pytest.mark.parametrize('mutation', [
    lambda s:s['labSnapshot']['configuration']['parameters'].update(density=float('nan')),
    lambda s:s['labSnapshot']['configuration'].update(sourceRefs=[{'resourceId':'x','revisionId':'y'}]*6),
    lambda s:s['labSnapshot']['configuration'].update(sourceRefs=[{'resourceId':'x','revisionId':'y'}]*2),
    lambda s:s['labSnapshot'].update(supportUsed=['model', 'model']),
    lambda s:s['labSnapshot'].update(note='\ud800'),
])
def test_invalid_plugin_json_bounds_and_duplicate_refs_fail_as_domain_errors(tmp_path, mutation):
    store, _, student, *_ = fixture(tmp_path)
    snapshot = lab_state(); mutation(snapshot)
    with pytest.raises(StudyError, match='invalid_science_snapshot'):
        resources.save(store, student, 'course', snapshot, 'bad-json')
    store.close()


def test_current_lab_parameters_are_checked_by_independent_core_solver(tmp_path):
    store, _, student, *_ = fixture(tmp_path)
    snapshot = lab_state()
    snapshot['parameters']['density'] = snapshot['labSnapshot']['configuration']['parameters']['density'] = -1000
    with pytest.raises(StudyError, match='invalid_physical_domain'):
        resources.save(store, student, 'course', snapshot, 'outside-domain')
    assert store.connection.execute("SELECT COUNT(*) FROM study_resources WHERE kind='science-resource'").fetchone()[0] == 0
    store.close()
