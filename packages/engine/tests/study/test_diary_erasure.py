import json
from lessonos.study import diary
from lessonos.study.operations import erase_student
from test_error_diary import opened


def test_erasure_removes_tutor_diary_events_and_receipts_with_no_resource_id(tmp_path):
    store, tutor, student, peer, other, original, anchor, thread = opened(tmp_path/'data')
    diary.contest_error(store, student, thread['threadId'], 'Il segno va ricontrollato.', 'contest')
    diary.dismiss_error(store, tutor, thread['threadId'], 'Nota privata da eliminare con lo studente.', 'dismiss')
    assert store.connection.execute("SELECT COUNT(*) FROM study_events WHERE kind='error.dismissed.v1' AND resource_id IS NULL").fetchone()[0]==1
    erase_student(store.path.parent, student.id, apply=True)
    events=[json.loads(row[0]) for row in store.connection.execute('SELECT payload FROM study_events')]
    receipts=[json.loads(row[0]) for row in store.connection.execute('SELECT body FROM study_receipts')]
    assert thread['threadId'] not in str(events)
    assert thread['threadId'] not in str(receipts)
    assert 'Nota privata' not in str(events)
    assert store.get_edition('fluidi')['teacherId']==tutor.id
    assert store.connection.execute('SELECT 1 FROM study_principals WHERE id=?',(peer.id,)).fetchone()
