"""Private notebook contracts, using the real canonical database and sources."""
import json
import pytest
from lessonos.study import learning_memory as memory
from lessonos.study.context import revise_resource, delete_resource
from lessonos.study.models import StudyError
from lessonos.study.store import StudyStore
from test_identity_store import setup_store


def draft(title='Lezione uno', **changes):
    return {'title': title, 'text': 'A pressione fissata considero la quarta potenza.',
            'classification': 'hypothesis', 'concepts': ['portata'], 'sourceRefs': [], 'links': [], **changes}


def reference(resource):
    return {'resourceId': resource['id'], 'revisionId': resource['revisionId'],
            'start': 0, 'end': len(resource['text']), 'quote': resource['text']}


def test_two_lessons_reopen_exact_source_and_backlink_without_duplication(tmp_path):
    store, teacher, student, peer, other = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'La portata dipende da r⁴.')
    one = memory.save_note(store, student, draft(sourceRefs=[reference(source)]), 'first')
    two = memory.save_note(store, student, draft('Lezione due', links=[one['id']],
        sourceRefs=[reference(source)], classification='not_understood'), 'second')
    reopened = StudyStore(store.path)
    graph = memory.get_memory(reopened, student)
    assert len(graph['notes']) == 2
    sources = [node for node in graph['nodes'] if node['kind'] == 'source']
    assert len(sources) == 1 and sources[0]['reference']['revisionId'] == source['revisionId']
    assert any(e['source'] == two['id'] and e['target'] == one['id'] for e in graph['edges'])
    assert memory.get_note(reopened, student, one['id'])['backlinks'] == [two['id']]
    assert reopened.get_resource_revision(student, **{'resource_id':sources[0]['reference']['resourceId'],
        'revision_id':sources[0]['reference']['revisionId']})['text'] == 'La portata dipende da r⁴.'
    for actor in (teacher, peer, other):
        assert memory.get_memory(store, actor, query='portata')['notes'] == []
        assert memory.export_memory(store, actor)['notes'] == []
        with pytest.raises(StudyError, match='not_found'):
            memory.get_note(store, actor, one['id'])
    reopened.close()


def test_personal_memory_exists_without_course_and_uses_atomic_idempotent_events(tmp_path):
    store = StudyStore(tmp_path / 'personal.sqlite')
    student = store.create_principal('student-alone', 'student')
    one = memory.save_note(store, student, draft(), 'once')
    assert memory.save_note(store, student, draft(), 'once')['id'] == one['id']
    with pytest.raises(StudyError, match='idempotency_conflict'):
        memory.save_note(store, student, draft('Changed'), 'once')
    assert len(memory.get_memory(store, student)['notes']) == 1
    assert store.connection.execute('SELECT COUNT(*) FROM study_editions').fetchone()[0] == 0
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0] == 1


def test_correction_is_latest_after_restore_and_stale_edit_does_not_overwrite(tmp_path):
    store, _, student, *_ = setup_store(tmp_path)
    one = memory.save_note(store, student, draft(classification='observation'), 'first')
    fixed = memory.save_note(store, student, draft(classification='correction', text='Rettifico: il vincolo era diverso.'),
        'fix', note_id=one['id'], expected_version=1)
    assert fixed['version'] == 2
    with pytest.raises(StudyError, match='stale_revision'):
        memory.save_note(store, student, draft(text='stale'), 'stale', note_id=one['id'], expected_version=1)
    backup = tmp_path / 'backup.sqlite'
    store.backup(backup)
    restored = StudyStore(backup)
    projection = memory.get_memory(restored, student)
    assert projection['notes'][0]['classification'] == 'correction'
    assert projection['notes'][0]['text'] == 'Rettifico: il vincolo era diverso.'
    assert [v['classification'] for v in memory.get_history(restored, student, one['id'])] == ['observation', 'correction']
    restored.close()


def test_exact_revision_becomes_historical_and_revocation_redacts_all_derived_content(tmp_path):
    store, teacher, student, *_ = setup_store(tmp_path)
    source = store.create_resource(teacher, 'fluidi', 'notes', 'PASSAGGIO RISERVATO', 'group')
    payload = draft('Annotazione riservata', text='PASSAGGIO RISERVATO: da chiarire.', sourceRefs=[reference(source)])
    note = memory.save_note(store, student, payload, 'first')
    revise_resource(store, teacher, source['id'], source['revisionId'], 'Nuova versione')
    historical = memory.get_note(store, student, note['id'])
    assert historical['sourceState'] == 'HISTORICAL'
    assert historical['sourceRefs'][0]['revisionId'] == source['revisionId']
    delete_resource(store, teacher, source['id'])
    for projection in (memory.get_memory(store, student), memory.get_history(store, student, note['id']),
                       memory.export_memory(store, student), memory.save_note(store, student, payload, 'first')):
        assert 'PASSAGGIO RISERVATO' not in json.dumps(projection)
        assert 'Annotazione riservata' not in json.dumps(projection)
    assert memory.get_memory(store, student, query='RISERVATO')['notes'] == []
    assert memory.get_note(store, student, note['id'])['sourceState'] == 'UNAVAILABLE'


@pytest.mark.parametrize('bad', ['foreign_source', 'foreign_link', 'quote', 'revision', 'classification'])
def test_invalid_or_foreign_references_leave_no_note_or_receipt(tmp_path, bad):
    store, _, student, peer, _ = setup_store(tmp_path)
    source = store.create_resource(peer if bad == 'foreign_source' else student, 'fluidi', 'notes', 'Originale')
    payload = draft(sourceRefs=[reference(source)])
    if bad == 'foreign_link':
        foreign = memory.save_note(store, peer, draft(), 'peer')
        payload['links'] = [foreign['id']]
    elif bad == 'quote': payload['sourceRefs'][0]['quote'] = 'Inventato'
    elif bad == 'revision': payload['sourceRefs'][0]['revisionId'] = 'missing'
    elif bad == 'classification': payload['classification'] = 'diagnosed'
    before = store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0]
    with pytest.raises(StudyError): memory.save_note(store, student, payload, 'invalid')
    assert memory.get_memory(store, student)['notes'] == []
    assert store.connection.execute('SELECT COUNT(*) FROM study_receipts').fetchone()[0] == before


def test_export_import_validates_current_permissions_and_remaps_backlinks(tmp_path):
    store, _, student, peer, _ = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'Privato di A')
    one = memory.save_note(store, student, draft(sourceRefs=[reference(source)]), 'one')
    memory.save_note(store, student, draft('Seconda', links=[one['id']]), 'two')
    exported = memory.export_memory(store, student)
    before = len(memory.get_memory(store, student)['notes'])
    with pytest.raises(StudyError): memory.import_memory(store, peer, exported, 'foreign-import')
    assert memory.get_memory(store, peer)['notes'] == []
    result = memory.import_memory(store, student, exported, 'import')
    assert result['importedCount'] == 2
    assert memory.import_memory(store, student, exported, 'import') == result
    assert len(memory.get_memory(store, student)['notes']) == before + 2
    imported = [n for n in memory.get_memory(store, student)['notes'] if n['id'] in result['noteIds']]
    assert next(n for n in imported if n['title'] == 'Seconda')['links'][0] in result['noteIds']
    exported['notes'][0]['text'] = 'manomesso'
    with pytest.raises(StudyError, match='invalid_memory_archive'):
        memory.import_memory(store, student, exported, 'tampered')


def test_deleted_note_is_not_resurrected_by_retries_or_backlinks(tmp_path):
    store, _, student, *_ = setup_store(tmp_path)
    one = memory.save_note(store, student, draft(), 'first')
    memory.save_note(store, student, draft('Seconda', links=[one['id']]), 'second')
    memory.delete_note(store, student, one['id'], 1, 'remove')
    assert len(memory.get_memory(store, student)['notes']) == 1
    assert all(e['target'] != one['id'] for e in memory.get_memory(store, student)['edges'])
    with pytest.raises(StudyError, match='not_found'):
        memory.save_note(store, student, draft(), 'first')


def test_search_finds_authorized_original_and_graph_includes_published_review(tmp_path):
    from lessonos.study.submissions import submit
    from lessonos.study.feedback import propose_feedback, review_feedback
    store, teacher, student, peer, _ = setup_store(tmp_path)
    source = store.create_resource(teacher, 'fluidi', 'notes', 'Vincolo: pressione fissata', 'group')
    memory.save_note(store, student, draft(sourceRefs=[reference(source)]), 'note')
    for actor in (student, peer):
        submitted = submit(store, actor, 'fluidi', 'poiseuille-v1', [], actor.id + ' tentativo', actor.id,
            source_refs=[{'resourceId':source['id'], 'revisionId':source['revisionId']}])
        proposal = propose_feedback(store, teacher, submitted['submissionId'])
        review_feedback(store, teacher, proposal['id'], 1, actor.id + ' review privata', actor.id)
    graph = memory.get_memory(store, student, query='vincolo')
    assert len(graph['notes']) == 1
    assert len([n for n in graph['nodes'] if n['kind'] == 'attempt']) == 1
    assert len([n for n in graph['nodes'] if n['kind'] == 'review']) == 1
    assert peer.id not in json.dumps(graph)


def test_malformed_signed_import_has_a_domain_error_and_is_atomic(tmp_path):
    from hashlib import sha256
    store, _, student, *_ = setup_store(tmp_path)
    for links in ([{}], [[]], [None], [True]):
        content = {'format':'ardesia-learning-memory/1', 'notes':[{'id':'imported', **draft(links=links)}]}
        archive = {**content, 'sha256':sha256(json.dumps(content,ensure_ascii=False,sort_keys=True,
            separators=(',',':')).encode()).hexdigest()}
        with pytest.raises(StudyError): memory.import_memory(store, student, archive, 'malformed')
        assert memory.get_memory(store, student)['notes'] == []


@pytest.mark.parametrize('deleted', [False, True])
def test_erasure_cannot_promote_an_older_note_version_or_resurrect_a_tombstone(tmp_path, deleted):
    from lessonos.study.submissions import submit
    from lessonos.study.operations import erase_student
    store, teacher, student, *_ = setup_store(tmp_path)
    source = store.create_resource(student, 'fluidi', 'notes', 'Fonte privata da eliminare')
    submit(store,student,'fluidi','poiseuille-v1',[],'Procedimento','submission',
        source_refs=[{'resourceId':source['id'],'revisionId':source['revisionId']}])
    note = memory.save_note(store,teacher,draft('Nota del tutor',classification='observation'),'teacher-note')
    memory.save_note(store,teacher,draft('Nota rettificata',classification='correction',sourceRefs=[reference(source)]),
        'correct',note_id=note['id'],expected_version=1)
    if deleted: memory.delete_note(store,teacher,note['id'],2,'delete')
    erase_student(store.path.parent,student.id,apply=True)
    visible = memory.get_memory(store,teacher)['notes']
    assert not any(n['title']=='Nota del tutor' or n['classification']=='observation' for n in visible)
    assert not deleted or visible == []


def test_diary_review_connects_a_new_attempt_without_claiming_resolution(tmp_path):
    from lessonos.study.submissions import submit
    from lessonos.study.diary import propose_error,confirm_error,record_practice
    store,teacher,student,*_=setup_store(tmp_path)
    source=store.create_resource(student,'fluidi','notes','Portata proporzionale a r²')
    memory.save_note(store,student,draft(sourceRefs=[reference(source)]),'note')
    submitted=submit(store,student,'fluidi','poiseuille-v1',[],'Uso r²','original',
        source_refs=[{'resourceId':source['id'],'revisionId':source['revisionId']}])
    thread=propose_error(store,teacher,submitted['submissionId'],'radius-power','model_selection',reference(source),'observe')
    confirm_error(store,teacher,thread['threadId'],{'criterion':'Giustifica la quarta potenza','procedureRequired':True},
        'Confronta il modello a pressione fissata','Prova un nuovo raggio','confirm',transfer_exercise={
            'exerciseId':'new-transfer','prompt':'Raddoppia il raggio a pressione fissata',
            'originalParameters':{'radiusRatio':1.5,'boundary':'pressure'},'parameters':{'radiusRatio':2,'boundary':'pressure'}})
    attempt=submit(store,student,'fluidi','new-transfer',[],'A pressione fissata il rapporto è sedici','new-attempt',
        diary_thread_id=thread['threadId'],activity_parameters={'radiusRatio':2,'boundary':'pressure'})
    record_practice(store,student,thread['threadId'],attempt['submissionId'],'new-transfer',{'radiusRatio':2,'boundary':'pressure'},'practice')
    graph=memory.get_memory(store,student)
    observation=next(n for n in graph['nodes'] if n['kind']=='observation')
    assert observation['status']=='PRACTISING'
    assert any(e['relation']=='new_attempt' and e['target']=='attempt:'+attempt['submissionId'] for e in graph['edges'])
    assert any(n['kind']=='review' and n.get('provenance')=='diary' for n in graph['nodes'])
