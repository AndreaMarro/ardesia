"""S11: real Core receipts, replay, source lifecycle and privacy boundaries."""
import json
import pytest
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from lessonos.study.submissions import submit
from lessonos.study.context import delete_resource, revise_resource
from lessonos.study.learning_insights import dashboard, ingest, preferences, set_preferences, export
from test_identity_store import setup_store

NOTICE = {'version': 'synthetic-usage-v1', 'purpose': 'Uso facoltativo sintetico', 'retentionDays': 30}


def attempt(store, student, key='attempt'):
    return submit(store, student, 'fluidi', 'poiseuille-v1', [], 'PRIVATE ANSWER', key)


def event(receipt, id='event-1', at=1000, kind='hint.used'):
    return {'schemaVersion': 1, 'eventId': id, 'receiptId': receipt['receiptId'], 'kind': kind, 'occurredAt': at,
            'consentId': receipt.get('_consentId','disabled')}


def enabled(tmp_path):
    store, tutor, student, peer, other = setup_store(tmp_path)
    store.clock = lambda: 1000
    receipt = attempt(store, student)
    receipt['_consentId'] = set_preferences(store, student, 'fluidi', True, NOTICE['version'], notice=NOTICE)['consentId']
    return store, tutor, student, peer, other, receipt


def test_default_off_and_optout_never_disables_core_study(tmp_path):
    store, tutor, student, *_ = setup_store(tmp_path)
    store.clock = lambda: 1000
    receipt = attempt(store, student)
    assert preferences(store, student, 'fluidi', notice=NOTICE)['enabled'] is False
    with pytest.raises(StudyError, match='optional_analytics_disabled'):
        ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    with pytest.raises(StudyError, match='analytics_notice_required'):
        set_preferences(store, student, 'fluidi', True, NOTICE['version'])
    assert dashboard(store, student, 'fluidi')['summary']['attempts'] == 1
    assert submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Still useful', 'second')['receiptId']


@pytest.mark.parametrize('extra', [{'actorId': 'student-02'}, {'text': 'secret'}, {'audio': 'raw'}, {'emotion': 'happy'}])
def test_unknown_properties_are_rejected_before_persistence(tmp_path, extra):
    store, _, student, _, _, receipt = enabled(tmp_path)
    with pytest.raises(StudyError, match='invalid_learning_event'):
        ingest(store, student, 'fluidi', [{**event(receipt), **extra}], notice=NOTICE)
    assert export(store, student, 'fluidi', notice=NOTICE)['optionalEvents'] == []


def test_batch_budget_peer_receipt_and_atomic_rollback(tmp_path):
    store, _, student, peer, _, receipt = enabled(tmp_path)
    foreign = attempt(store, peer, 'peer')
    with pytest.raises(StudyError, match='forbidden'):
        ingest(store, student, 'fluidi', [event(receipt), {**event(foreign, 'foreign'), 'consentId':receipt['_consentId']}], notice=NOTICE)
    assert export(store, student, 'fluidi', notice=NOTICE)['optionalEvents'] == []
    with pytest.raises(StudyError) as exc:
        ingest(store, student, 'fluidi', [event(receipt)] * 21, notice=NOTICE)
    assert exc.value.status == 413
    with pytest.raises(StudyError) as exc:
        ingest(store, student, 'fluidi', [{**event(receipt), 'text': 'x'*5000}], notice=NOTICE)
    assert exc.value.status == 413


def test_duplicate_and_outoforder_replay_survives_cold_store(tmp_path):
    store, _, student, _, _, receipt = enabled(tmp_path)
    store.clock = lambda: 1010
    batch = [event(receipt, 'late', 1009), event(receipt, 'early', 1001, 'study.resumed')]
    assert ingest(store, student, 'fluidi', batch, notice=NOTICE) == {'accepted': 2, 'duplicates': 0}
    assert ingest(store, student, 'fluidi', list(reversed(batch)), notice=NOTICE) == {'accepted': 0, 'duplicates': 2}
    reopened = StudyStore(store.path, clock=lambda: 1010)
    result = export(reopened, student, 'fluidi', notice=NOTICE)
    assert [e['eventId'] for e in result['optionalEvents']] == ['early', 'late']
    assert result['summary']['attempts'] == 1
    assert result['attempts'][0]['outcome'] == 'NOT_CHECKED'
    assert 'PRIVATE ANSWER' not in json.dumps(result)
    with pytest.raises(StudyError, match='learning_event_conflict'):
        ingest(reopened, student, 'fluidi', [event(receipt, 'late', 1009, 'feedback.read')], notice=NOTICE)


def test_optout_erases_optional_events_and_rejects_old_replay_after_reenable(tmp_path):
    store, _, student, _, _, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    store.clock = lambda: 1001
    set_preferences(store, student, 'fluidi', False, None, notice=NOTICE)
    assert export(store, student, 'fluidi', notice=NOTICE)['optionalEvents'] == []
    store.clock = lambda: 1002
    set_preferences(store, student, 'fluidi', True, NOTICE['version'], notice=NOTICE)
    with pytest.raises(StudyError, match='event_outside_consent_window'):
        ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    assert dashboard(store, student, 'fluidi')['summary']['attempts'] == 1


def test_retention_and_source_deletion_remove_projection_and_export(tmp_path):
    store, _, student, _, _, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    refs = store.connection.execute('SELECT source_refs FROM study_submissions').fetchone()[0]
    ref = json.loads(refs)[0]
    revised = revise_resource(store, student, ref['resourceId'], ref['revisionId'], 'Correction')
    assert revised['revisionId'] != ref['revisionId']
    assert dashboard(store, student, 'fluidi')['attempts'][0]['sourceState'] == 'HISTORICAL'
    delete_resource(store, student, ref['resourceId'])
    assert export(store, student, 'fluidi', notice=NOTICE)['attempts'] == []
    assert export(store, student, 'fluidi', notice=NOTICE)['optionalEvents'] == []
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='learning.insights.observation.v1'").fetchone()[0] == 0


def test_expired_events_are_physically_purged_and_notice_change_disables_collection(tmp_path):
    store, _, student, _, _, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    assert preferences(store, student, 'fluidi', notice={**NOTICE, 'version':'new'})['enabled'] is False
    store.clock = lambda: 1000 + 31*86400
    assert export(store, student, 'fluidi', notice=NOTICE)['optionalEvents'] == []
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='learning.insights.observation.v1'").fetchone()[0] == 0


def test_role_isolation_membership_revocation_and_small_cohort_suppression(tmp_path):
    store, tutor, student, peer, other, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    assert dashboard(store, peer, 'fluidi')['attempts'] == []
    with pytest.raises(StudyError, match='forbidden'):
        dashboard(store, other, 'fluidi')
    teacher = dashboard(store, tutor, 'fluidi')
    assert teacher['summary'] is None and teacher['cohortSuppressed'] is True
    assert export(store, tutor, 'fluidi', notice=NOTICE)['optionalEvents'] == []
    with store.transaction() as c:
        c.execute('DELETE FROM study_members WHERE student_id=?', (student.id,))
    with pytest.raises(StudyError, match='forbidden'):
        export(store, student, 'fluidi', notice=NOTICE)



def test_only_canonical_checks_and_assistance_define_outcome(tmp_path):
    from test_learning_experiences import evidence
    store, _, student, *_ = setup_store(tmp_path)
    args = dict(activity_parameters={'radiusRatio':2,'boundary':'flow'}, activity_evidence=evidence())
    first = submit(store, student, 'fluidi', 'poiseuille-v1', [], 'Prediction', 'first', **args)
    submit(store, student, 'fluidi', 'poiseuille-v1', [], 'New prediction', 'second', parent_id=first['submissionId'], **args)
    result = dashboard(store, student, 'fluidi')
    assert result['summary'] == {'attempts':2,'checked':2,'matched':0,'assisted':1,'observedCategories':{}}
    assert {a['outcome'] for a in result['attempts']} == {'MISMATCH'}
    assert result['attempts'][1]['parentId'] == first['submissionId']
    comparison=result['comparisons'][0]
    assert comparison['beforeReceiptId'] == first['receiptId']
    assert comparison['beforeOutcome'] == comparison['afterOutcome'] == 'MISMATCH'
    assert comparison['scope'] == 'SAME_MODEL_PARAMETERS'
    assert comparison['causalInference'] is False


def test_suggestions_use_reviewed_current_source_and_contest_updates_projection(tmp_path):
    from test_error_diary import opened, diary
    store, _, student, peer, _, _, _, thread = opened(tmp_path)
    result = dashboard(store, student, 'fluidi')
    assert result['suggestions'][0]['threadId'] == thread['threadId']
    assert result['suggestions'][0]['provenance'] == 'CORE_REVIEWED_OBSERVATION'
    assert dashboard(store, peer, 'fluidi')['suggestions'] == []
    diary().contest_error(store, student, thread['threadId'], 'La fonte è ambigua', 'contest')
    assert dashboard(store, student, 'fluidi')['suggestions'] == []


def test_cohort_threshold_counts_distinct_learners_and_erasure_removes_optional_data(tmp_path):
    from lessonos.study.operations import _erase_rows
    store, tutor, student, _, _, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    for i in range(4):
        learner = store.create_principal(f'synthetic-{i}', 'student')
        store.add_test_member(tutor, 'fluidi', learner.id)
        attempt(store, learner, f'attempt-{i}')
    assert dashboard(store, tutor, 'fluidi')['summary']['attempts'] == 5
    with store.transaction():
        _erase_rows(store, student.id)
    assert store.connection.execute('SELECT COUNT(*) FROM study_events WHERE actor_id=?', (student.id,)).fetchone()[0] == 0
    with pytest.raises(StudyError, match='unauthenticated'):
        dashboard(store, student, 'fluidi')


def test_new_notice_cannot_resurrect_previous_purpose_events(tmp_path):
    store, _, student, _, _, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    changed = {**NOTICE, 'version':'notice-v2'}
    set_preferences(store, student, 'fluidi', True, changed['version'], notice=changed)
    assert export(store, student, 'fluidi', notice=changed)['optionalEvents'] == []


def test_operator_retention_sweep_purges_an_unopened_restored_copy(tmp_path):
    from lessonos.study.learning_insights.maintenance import prune_expired
    store, _, student, _, _, receipt = enabled(tmp_path)
    ingest(store, student, 'fluidi', [event(receipt)], notice=NOTICE)
    restored = tmp_path/'restored.sqlite'
    store.backup(restored)
    copy = StudyStore(restored, clock=lambda:1000+31*86400)
    assert prune_expired(copy) == {'expiredEvents':1,'applied':False}
    assert prune_expired(copy, apply=True) == {'expiredEvents':1,'applied':True}
    assert prune_expired(copy) == {'expiredEvents':0,'applied':False}


def test_diary_career_does_not_leak_suggestions_across_edition_filter(tmp_path):
    from test_error_diary import opened
    store,tutor,student,*_=opened(tmp_path)
    store.create_edition(tutor,'second-edition')
    store.add_test_member(tutor,'second-edition',student.id)
    assert dashboard(store,student,'second-edition')['suggestions'] == []


def test_clock_skew_cannot_replay_withdrawn_consent_generation(tmp_path):
    store,_,student,_,_,receipt=enabled(tmp_path)
    proposed=event(receipt,at=1050)
    ingest(store,student,'fluidi',[proposed],notice=NOTICE)
    store.clock=lambda:1001
    set_preferences(store,student,'fluidi',False,None,notice=NOTICE)
    store.clock=lambda:1002
    set_preferences(store,student,'fluidi',True,NOTICE['version'],notice=NOTICE)
    with pytest.raises(StudyError,match='event_outside_consent_window'):
        ingest(store,student,'fluidi',[proposed],notice=NOTICE)


def test_restore_hook_cannot_resurrect_a_withdrawn_choice_from_old_backup(tmp_path):
    from lessonos.study.learning_insights.maintenance import invalidate_after_restore
    store,_,student,_,_,receipt=enabled(tmp_path)
    ingest(store,student,'fluidi',[event(receipt)],notice=NOTICE)
    backup=tmp_path/'before-withdrawal.sqlite'
    store.backup(backup)
    set_preferences(store,student,'fluidi',False,None,notice=NOTICE)
    restored=StudyStore(backup,clock=lambda:1001)
    assert invalidate_after_restore(restored) == {'optionalRows':2,'applied':False}
    invalidate_after_restore(restored,apply=True)
    assert preferences(restored,student,'fluidi',notice=NOTICE)['enabled'] is False
    assert export(restored,student,'fluidi',notice=NOTICE)['optionalEvents'] == []
    assert dashboard(restored,student,'fluidi')['summary']['attempts'] == 1


def test_verified_transfer_moves_from_actionable_suggestion_to_grounded_recovery(tmp_path):
    from test_error_diary import opened, practice, verification
    store,tutor,student,_,_,_,_,thread=opened(tmp_path)
    completed,*_=practice(store,student,thread['threadId'])
    verification(store,tutor,thread['threadId'],completed['attempts'][-1]['attemptId'])
    result=dashboard(store,student,'fluidi')
    assert result['suggestions'] == []
    assert result['recoveries'][0]['threadId'] == thread['threadId']
    assert result['recoveries'][0]['provenance'] == 'CORE_REVIEWED_TRANSFER'
