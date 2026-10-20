"""Force overlapping preconditions on real PostgreSQL; assert domain outcomes."""
from concurrent.futures import ThreadPoolExecutor
import json
from threading import Barrier, BrokenBarrierError

from lessonos.study import diary
from lessonos.study.context import revise_resource
from lessonos.study.models import StudyError
from lessonos.study.submissions import submit
from test_postgres_contract import pg_configuration, pg_store, seed


def rendezvous(barrier):
    try:
        barrier.wait(timeout=0.5)
    except BrokenBarrierError:
        pass  # An aggregate lock correctly keeps the second caller outside.


def concurrent_calls(configuration, directory, command):
    from lessonos.study.postgres import PostgresStudyStore
    def invoke(index):
        store = PostgresStudyStore(configuration['DB_URL'], directory, administrative=True)
        try:
            command(store, index)
            return 'accepted'
        except StudyError as error:
            return error.code
        finally:
            store.close()
    with ThreadPoolExecutor(max_workers=2) as pool:
        return sorted(pool.map(invoke, range(2)))


def synchronize_query(store, statement, barrier):
    execute = store.connection.execute
    def synchronized(query, parameters=None):
        rows = execute(query, parameters)
        if query == statement:
            value = rows.fetchone()
            rendezvous(barrier)
            class CapturedRow:
                def fetchone(self):
                    return value
            return CapturedRow()
        return rows
    store.connection.execute = synchronized


def test_concurrent_source_revisions_cannot_both_replace_the_same_head(pg_store, pg_configuration, tmp_path):
    tutor, student, peer, edition = seed(pg_store)
    source = pg_store.create_resource(student, edition, 'notes', 'Prima versione.')
    barrier = Barrier(2)
    def revise(store, index):
        synchronize_query(store, 'SELECT current_revision FROM study_resources WHERE id=?', barrier)
        revise_resource(store, student, source['id'], source['revisionId'], 'Nuova versione ' + str(index))
    assert concurrent_calls(pg_configuration, tmp_path, revise) == ['accepted', 'stale_revision']
    assert pg_store.connection.execute('SELECT COUNT(*) FROM study_revisions WHERE resource_id=?', (source['id'],)).fetchone()[0] == 2


def test_concurrent_parent_retries_cannot_fork_submission_history(pg_store, pg_configuration, tmp_path):
    tutor, student, peer, edition = seed(pg_store)
    original = submit(pg_store, student, edition, 'poiseuille-v1', [], 'Procedimento iniziale.', 'original')
    barrier = Barrier(2)
    def revise(store, index):
        synchronize_query(store, 'SELECT 1 FROM study_submissions WHERE parent_id=?', barrier)
        submit(store, student, edition, 'poiseuille-v1', [], 'Nuovo procedimento ' + str(index),
            'different-key-' + str(index), parent_id=original['submissionId'])
    assert concurrent_calls(pg_configuration, tmp_path, revise) == ['accepted', 'newer_attempt_exists']
    assert pg_store.connection.execute('SELECT COUNT(*) FROM study_submissions WHERE parent_id=?', (original['submissionId'],)).fetchone()[0] == 1


def test_concurrent_confirmation_with_different_keys_opens_one_observation(pg_store, pg_configuration, tmp_path, monkeypatch):
    tutor, student, peer, edition = seed(pg_store)
    original = submit(pg_store, student, edition, 'poiseuille-v1', [], 'Q cresce come r².', 'original')
    source = json.loads(pg_store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?', (original['submissionId'],)).fetchone()[0])[0]
    anchor = {**source, 'start': 0, 'end': len('Q cresce come r².'), 'quote': 'Q cresce come r².'}
    proposed = diary.propose_error(pg_store, tutor, original['submissionId'], 'radius', 'model_selection', anchor, 'propose')
    barrier, state = Barrier(2), diary._state
    def synchronized_state(thread, allowed):
        state(thread, allowed)
        if allowed == ('CANDIDATE',):
            rendezvous(barrier)
    monkeypatch.setattr(diary, '_state', synchronized_state)
    def confirm(store, index):
        diary.confirm_error(store, tutor, proposed['threadId'], {'criterion': 'Quarta potenza', 'procedureRequired': True},
            'La dipendenza è dalla quarta potenza.', 'Raddoppia il raggio.', 'confirm-' + str(index),
            transfer_exercise={'exerciseId': 'new-exercise', 'originalParameters': {'radiusRatio': 1.5},
                'parameters': {'radiusRatio': 2}, 'prompt': 'Cambia il raggio a pressione fissata.'})
    assert concurrent_calls(pg_configuration, tmp_path, confirm) == ['accepted', 'invalid_diary_transition']
    assert diary.get_thread(pg_store, tutor, proposed['threadId'])['observedCount'] == 1


def test_concurrent_layout_edits_do_not_silently_overwrite_another_tab(pg_store, pg_configuration, tmp_path):
    from lessonos.study.view_layout import load_layout, save_layout
    tutor, student, peer, edition = seed(pg_store)
    resource = pg_store.create_resource(student, edition, 'notes', 'Fonte unica')
    initial = load_layout(pg_store, student, edition)
    barrier = Barrier(2)
    def edit(store, index):
        rendezvous(barrier)
        item={'kind':'plugin-postit-object','pluginId':'ardesia.study','instanceId':'view-1',
              'bounds':{'x':index*100,'y':0,'width':320,'height':240},'zIndex':0,
              'selected':False,'hovered':False,'proximity':'far',
              'pluginState':{'resourceId':resource['id'],'revisionId':resource['revisionId'],'contextId':resource['contextId']}}
        save_layout(store,student,edition,[item],initial['layoutVersion'])
    assert concurrent_calls(pg_configuration,tmp_path,edit) == ['accepted','stale_layout']
    loaded=load_layout(pg_store,student,edition)
    assert len(loaded['layouts']) == 1 and loaded['layoutSaved'] is True
    assert pg_store.connection.execute('SELECT COUNT(*) FROM study_resources WHERE id=?',(resource['id'],)).fetchone()[0] == 1
