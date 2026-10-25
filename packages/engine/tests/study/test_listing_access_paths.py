"""Discovery has covering access paths in both ownership directions."""
from lessonos.study.store import StudyStore


def test_student_discovery_has_covering_membership_access_path(tmp_path):
    store = StudyStore(tmp_path / 'access-path.sqlite')
    try:
        plan = store.connection.execute(
            'EXPLAIN QUERY PLAN SELECT edition_id FROM study_members WHERE student_id=? ORDER BY edition_id',
            ('synthetic-student',)).fetchall()
        details = ' '.join(row[3] for row in plan)
        assert 'SEARCH' in details and 'COVERING INDEX study_members_student_id' in details
        assert 'TEMP B-TREE' not in details
    finally:
        store.close()
