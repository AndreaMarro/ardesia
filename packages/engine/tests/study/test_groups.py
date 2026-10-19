from concurrent.futures import ThreadPoolExecutor
import pytest
from lessonos.study.groups import reserve_seat, confirm_test_enrollment, propose_cohorts, configure_sessions
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from test_identity_store import setup_store


def test_twelve_requests_never_overbook_and_retry_is_idempotent(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite');tutor=store.create_principal('tutor','teacher');store.create_edition(tutor,'fluidi')
    students=[store.create_principal(f'student-{i:02}','student') for i in range(12)]
    for index,student in enumerate(students):
        if index<10:
            hold=reserve_seat(store,student,'fluidi',f'hold-{index}',100)
            assert reserve_seat(store,student,'fluidi',f'hold-{index}',100)==hold
            receipt=confirm_test_enrollment(store,student,hold['id'],f'confirm-{index}',101)
            assert receipt['state']=='confirmed'
            assert confirm_test_enrollment(store,student,hold['id'],f'confirm-{index}',101)==receipt
        else:
            with pytest.raises(StudyError,match='group_full'):reserve_seat(store,student,'fluidi',f'hold-{index}',100)
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==10


def test_two_people_racing_for_last_seat_only_one_hold(tmp_path):
    store,tutor,first,peer,*_=setup_store(tmp_path)
    # Two confirmed members, one remaining place.
    store.connection.execute('UPDATE study_editions SET capacity=3');store.connection.commit()
    students=[store.create_principal(f'racer-{i}','student') for i in range(2)]
    def reserve(student):
        other=StudyStore(store.path)
        try:return reserve_seat(other,student,'fluidi',student.id,100)['state']
        except StudyError as error:return error.code
        finally:other.close()
    with ThreadPoolExecutor(2) as pool:results=list(pool.map(reserve,students))
    assert sorted(results)==['group_full','hold']


def test_expired_hold_does_not_consume_seat_or_confirm_late_payment(tmp_path):
    store,tutor,*_=setup_store(tmp_path)
    store.connection.execute('UPDATE study_editions SET capacity=3');store.connection.commit()
    first=store.create_principal('new-first','student');second=store.create_principal('new-second','student')
    hold=reserve_seat(store,first,'fluidi','first',100,ttl=10)
    reserve_seat(store,second,'fluidi','second',111)
    assert confirm_test_enrollment(store,first,hold['id'],'late',112)['state']=='payment_requires_review'
    assert not store.connection.execute("SELECT 1 FROM study_members WHERE student_id='new-first'").fetchone()


def test_matching_requires_every_date_and_explains_exclusion():
    requests=[{'id':'all','available':['a','b','c','d'],'topic':'fluidi'}, {'id':'three','available':['a','b','c'],'topic':'fluidi'}]
    proposals=propose_cohorts(requests,[{'id':'dates','sessions':['a','b','c','d'],'topic':'fluidi'}])
    assert proposals[0]['compatible']==['all']
    assert proposals[0]['excluded']==[{'id':'three','reason':'missing_dates'}]


def test_peer_hold_cannot_be_confirmed_and_changed_payload_conflicts(tmp_path):
    store,tutor,*_=setup_store(tmp_path)
    one=store.create_principal('new-one','student');two=store.create_principal('new-two','student')
    hold=reserve_seat(store,one,'fluidi','key',100)
    with pytest.raises(StudyError,match='forbidden'):confirm_test_enrollment(store,two,hold['id'],'other',101)
    with pytest.raises(StudyError,match='idempotency_conflict'):reserve_seat(store,one,'fluidi','key',100,ttl=999)


def test_calendar_conflict_and_confirmed_date_change_require_reconfirmation(tmp_path):
    store,tutor,*_=setup_store(tmp_path)
    dates=[{'start':f'2026-11-{day:02}T18:00:00+01:00','end':f'2026-11-{day:02}T19:30:00+01:00'} for day in [3,5,10,12]]
    # A roster already exists: changing a confirmed calendar cannot be silent.
    with pytest.raises(StudyError,match='reconfirmation_required'):configure_sessions(store,tutor,'fluidi',dates)
    store.create_edition(tutor,'other')
    configure_sessions(store,tutor,'other',dates)
    store.create_edition(tutor,'conflict')
    with pytest.raises(StudyError,match='calendar_conflict'):configure_sessions(store,tutor,'conflict',dates)
