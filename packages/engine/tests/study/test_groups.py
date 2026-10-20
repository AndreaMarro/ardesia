from concurrent.futures import ThreadPoolExecutor
import pytest
from lessonos.study.groups import reserve_seat, confirm_test_enrollment, propose_cohorts, configure_sessions
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from test_identity_store import setup_store
from lessonos.study.editions import offer_edition


def offered_store(tmp_path):
    store=StudyStore(tmp_path/'offered.sqlite',clock=lambda:100)
    tutor=store.create_principal('tutor-test','teacher')
    first=store.create_principal('student-01','student')
    peer=store.create_principal('student-02','student')
    other=store.create_principal('tutor-other','teacher')
    store.create_edition(tutor,'fluidi')
    prepare_offer(store,tutor,'fluidi')
    store.add_test_member(tutor,'fluidi',first.id)
    store.add_test_member(tutor,'fluidi',peer.id)
    return store,tutor,first,peer,other


def prepare_offer(store,tutor,edition_id):
    dates=[{'start':f'2026-11-{day:02}T18:00:00+01:00','end':f'2026-11-{day:02}T19:30:00+01:00'} for day in (3,5,10,12)]
    configure_sessions(store,tutor,edition_id,dates)
    return offer_edition(store,tutor,edition_id,'fixture-offer-'+edition_id,confirmed=True)


def test_twelve_requests_never_overbook_and_retry_is_idempotent(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite');tutor=store.create_principal('tutor','teacher');store.create_edition(tutor,'fluidi')
    prepare_offer(store,tutor,'fluidi')
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
    store,tutor,first,peer,*_=offered_store(tmp_path)
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
    store,tutor,*_=offered_store(tmp_path)
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
    store,tutor,*_=offered_store(tmp_path)
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


def pending_legacy_hold(tmp_path, *, expiry=1000):
    """Deliberately old data: a collecting edition with a pending test hold."""
    store=StudyStore(tmp_path/'legacy-hold.sqlite', clock=lambda:100)
    tutor=store.create_principal('legacy-tutor','teacher')
    student=store.create_principal('legacy-student','student')
    store.create_edition(tutor,'legacy-edition')
    dates=[{'start':f'2026-11-{day:02}T18:00:00+01:00','end':f'2026-11-{day:02}T19:30:00+01:00'} for day in (3,5,10,12)]
    configure_sessions(store,tutor,'legacy-edition',dates)
    with store.transaction() as c:
        c.execute("INSERT INTO study_holds VALUES('legacy-hold',?,?,?,'hold')",('legacy-edition',student.id,expiry))
    return store,tutor,student,dates


def test_non_offered_known_id_does_not_create_hold_or_waitlist(tmp_path):
    store=StudyStore(tmp_path/'draft.sqlite')
    tutor=store.create_principal('draft-tutor','teacher')
    student=store.create_principal('draft-student','student')
    store.create_edition(tutor,'draft-edition')
    for state in ('collecting','draft','cancelled','running','completed'):
        with store.transaction() as c:
            c.execute('UPDATE study_editions SET state=? WHERE id=?',(state,'draft-edition'))
        with pytest.raises(StudyError,match='edition_not_offered'):
            reserve_seat(store,student,'draft-edition','blocked-'+state,100)
    assert store.connection.execute('SELECT COUNT(*) FROM study_holds').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM study_waitlist').fetchone()[0]==0
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='seat.reserve'").fetchone()[0]==0
    store.close()


def test_non_offered_existing_membership_is_preserved(tmp_path):
    store,tutor,student,*_=setup_store(tmp_path)
    result=reserve_seat(store,student,'fluidi','membership-fact',100)
    assert result['state']=='confirmed' and result['id'] is None
    assert store._edition_access(student,'fluidi')['id']=='fluidi'
    assert store.connection.execute('SELECT COUNT(*) FROM study_holds').fetchone()[0]==0
    store.close()


def test_legacy_pending_non_offered_hold_requires_review_without_enrollment(tmp_path):
    store,tutor,student,dates=pending_legacy_hold(tmp_path)
    result=confirm_test_enrollment(store,student,'legacy-hold','legacy-confirm',101)
    assert result['state']=='payment_requires_review'
    assert confirm_test_enrollment(store,student,'legacy-hold','legacy-confirm',101)==result
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0]==0
    assert store.connection.execute('SELECT state FROM study_editions').fetchone()[0]=='collecting'
    store.close()


def test_active_hold_prevents_material_calendar_edit_but_same_dates_are_noop(tmp_path):
    store,tutor,student,dates=pending_legacy_hold(tmp_path)
    before=store.connection.execute('SELECT COUNT(*) FROM study_events').fetchone()[0]
    configure_sessions(store,tutor,'legacy-edition',dates)
    assert store.connection.execute('SELECT COUNT(*) FROM study_events').fetchone()[0]==before
    changed=[{**date,'start':date['start'].replace('18:00','20:00'),'end':date['end'].replace('19:30','21:30')} for date in dates]
    with pytest.raises(StudyError,match='reconfirmation_required'):
        configure_sessions(store,tutor,'legacy-edition',changed)
    assert store.get_edition('legacy-edition')['sessions']==dates
    store.close()


def test_expired_hold_does_not_block_calendar_edit(tmp_path):
    store,tutor,student,dates=pending_legacy_hold(tmp_path,expiry=99)
    changed=[{**date,'start':date['start'].replace('18:00','20:00'),'end':date['end'].replace('19:30','21:30')} for date in dates]
    configure_sessions(store,tutor,'legacy-edition',changed)
    assert store.get_edition('legacy-edition')['sessions']==changed
    assert store.connection.execute('SELECT state FROM study_holds').fetchone()[0]=='hold'
    store.close()


def test_confirmation_reads_edition_after_its_aggregate_lock(tmp_path,monkeypatch):
    store,tutor,student,dates=pending_legacy_hold(tmp_path)
    locked=[]
    original_get=store.get_edition
    def lock(connection,edition_id):
        locked.append(edition_id)
    def get_after_lock(edition_id):
        assert locked, 'mutable edition preconditions read before its lock'
        return original_get(edition_id)
    monkeypatch.setattr(store,'lock_edition',lock)
    monkeypatch.setattr(store,'get_edition',get_after_lock)
    assert confirm_test_enrollment(store,student,'legacy-hold','ordered-confirm',101)['state']=='payment_requires_review'
    store.close()


def test_offer_is_explicit_owned_idempotent_and_requires_all_four_valid_dates(tmp_path):
    store=StudyStore(tmp_path/'offer.sqlite')
    tutor=store.create_principal('offer-tutor','teacher')
    peer=store.create_principal('offer-other','teacher')
    student=store.create_principal('offer-student','student')
    store.create_edition(tutor,'offer-edition')
    with pytest.raises(StudyError,match='explicit_confirmation_required'):
        offer_edition(store,tutor,'offer-edition','declined',confirmed=False)
    with pytest.raises(StudyError,match='four_sessions_required'):
        offer_edition(store,tutor,'offer-edition','missing-dates',confirmed=True)
    for actor in (peer,student):
        with pytest.raises(StudyError,match='forbidden'):
            offer_edition(store,actor,'offer-edition','foreign',confirmed=True)
    first=prepare_offer(store,tutor,'offer-edition')
    assert first['state']=='offered' and first['scientificApproval']=='NOT_ATTESTED'
    assert offer_edition(store,tutor,'offer-edition','fixture-offer-offer-edition',confirmed=True)==first
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='edition.offered'").fetchone()[0]==1
    store.close()


def test_configuring_an_unoccupied_offered_edition_requires_a_fresh_offer(tmp_path):
    store=StudyStore(tmp_path/'reoffer.sqlite')
    tutor=store.create_principal('reoffer-tutor','teacher')
    student=store.create_principal('reoffer-student','student')
    store.create_edition(tutor,'reoffer-edition')
    prepare_offer(store,tutor,'reoffer-edition')
    dates=store.get_edition('reoffer-edition')['sessions']
    changed=[{**date,'start':date['start'].replace('18:00','20:00'),'end':date['end'].replace('19:30','21:30')} for date in dates]
    configure_sessions(store,tutor,'reoffer-edition',changed)
    assert store.get_edition('reoffer-edition')['state']=='draft'
    with pytest.raises(StudyError,match='edition_not_offered'):
        reserve_seat(store,student,'reoffer-edition','stale-offer',100)
    store.close()


def test_hold_expiry_uses_clock_after_waiting_for_the_edition_lock(tmp_path,monkeypatch):
    store=StudyStore(tmp_path/'clock.sqlite',clock=lambda:100)
    tutor=store.create_principal('clock-tutor','teacher')
    student=store.create_principal('clock-student','student')
    store.create_edition(tutor,'clock-edition')
    prepare_offer(store,tutor,'clock-edition')
    hold=reserve_seat(store,student,'clock-edition','clock-hold',100,ttl=1)
    def after_wait(connection,edition_id):
        store.clock=lambda:102
    monkeypatch.setattr(store,'lock_edition',after_wait)
    result=confirm_test_enrollment(store,student,hold['id'],'clock-confirm',100)
    assert result['state']=='payment_requires_review'
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==0
    store.close()


def test_explicitly_offering_legacy_collecting_does_not_revalidate_old_holds(tmp_path):
    store,tutor,student,dates=pending_legacy_hold(tmp_path)
    offer_edition(store,tutor,'legacy-edition','new-explicit-offer',confirmed=True)
    assert store.connection.execute('SELECT state FROM study_holds').fetchone()[0]=='payment_requires_review'
    assert confirm_test_enrollment(store,student,'legacy-hold','old-terms-confirm',101)['state']=='payment_requires_review'
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==0
    store.close()


def test_reservation_ttl_starts_after_waiting_for_the_edition_lock(tmp_path,monkeypatch):
    store=StudyStore(tmp_path/'reserve-clock.sqlite',clock=lambda:100)
    tutor=store.create_principal('reserve-clock-tutor','teacher')
    student=store.create_principal('reserve-clock-student','student')
    store.create_edition(tutor,'reserve-clock-edition')
    prepare_offer(store,tutor,'reserve-clock-edition')
    def after_wait(connection,edition_id):
        store.clock=lambda:200
    monkeypatch.setattr(store,'lock_edition',after_wait)
    hold=reserve_seat(store,student,'reserve-clock-edition','delayed-reserve',100,ttl=5)
    assert hold['expiresAt']==205
    store.close()


def test_confirmation_and_calendar_edit_preserve_the_accepted_dates(tmp_path):
    store=StudyStore(tmp_path/'edition-race.sqlite',clock=lambda:100)
    tutor=store.create_principal('edition-race-tutor','teacher')
    student=store.create_principal('edition-race-student','student')
    store.create_edition(tutor,'edition-race')
    original=prepare_offer(store,tutor,'edition-race')['sessions']
    hold=reserve_seat(store,student,'edition-race','race-hold',100)
    changed=[{**date,'start':date['start'].replace('18:00','20:00'),'end':date['end'].replace('19:30','21:30')} for date in original]
    from threading import Barrier
    barrier=Barrier(2)
    def command(index):
        other=StudyStore(store.path,clock=lambda:101)
        try:
            barrier.wait(timeout=5)
            if index==0:
                return confirm_test_enrollment(other,student,hold['id'],'racing-confirm',101)['state']
            configure_sessions(other,tutor,'edition-race',changed)
            return 'calendar-changed'
        except StudyError as error:return error.code
        finally:other.close()
    with ThreadPoolExecutor(2) as pool:results=list(pool.map(command,range(2)))
    assert sorted(results)==['confirmed','reconfirmation_required']
    assert store.get_edition('edition-race')['sessions']==original
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==1
    store.close()


@pytest.mark.parametrize('ttl',[True,False,'900',0,-1,3601,10**1000,float('nan'),float('inf')])
def test_reservation_rejects_invalid_ttl_without_writes(tmp_path,ttl):
    store=StudyStore(tmp_path/'invalid-ttl.sqlite')
    tutor=store.create_principal('ttl-tutor','teacher')
    student=store.create_principal('ttl-student','student')
    store.create_edition(tutor,'ttl-edition')
    with pytest.raises(StudyError,match='invalid_expiry'):
        reserve_seat(store,student,'ttl-edition','invalid-ttl',100,ttl=ttl)
    assert store.connection.execute('SELECT COUNT(*) FROM study_holds').fetchone()[0]==0
    store.close()
