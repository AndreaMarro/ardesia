"""Explicit historical fixture: an already-started legacy attempt, not a new exam path."""
from lessonos.study import exam
from lessonos.study.store import canonical, identifier


def insert_historical_attempt(store, student, edition_id='fluidi'):
    pack = exam.load_exam_pack()
    attempt_id = identifier()
    started_at = store.clock()
    question_ids = [question['id'] for question in pack['questions']]
    store.connection.execute(
        'INSERT INTO study_exam_attempts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        (attempt_id, edition_id, student.id, pack['id'], pack['version'],
         exam.pack_fingerprint(pack), canonical(question_ids), '{}', 'in_progress',
         started_at, started_at + exam.DURATION_SECONDS, None, None, None, None,
         canonical(pack), 0))
    store.connection.commit()
    return exam.get_attempt(store, student, attempt_id)
