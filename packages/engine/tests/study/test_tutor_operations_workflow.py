"""S09 crosses capacity, immutable receipts and independent manual declarations."""
from concurrent.futures import ThreadPoolExecutor
import pytest
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from lessonos.study import editions, attendance, manual_payments
from lessonos.study.groups import reserve_seat, confirm_test_enrollment


def test_last_seat_race_then_ten_members_two_waiting_and_cold_manual_register(tmp_path):
    store = StudyStore(tmp_path / 'operations.sqlite')
    tutor = store.create_principal('s09-tutor', 'teacher')
    other = store.create_principal('s09-other', 'teacher')
    learners = [store.create_principal(f's09-student-{i:02}', 'student') for i in range(12)]
    created = editions.create_draft(store, tutor, 'taylor-exp-v1', 1, 10, 4900, 'create')
    eid = created['edition']['id']
    dates = [{'localStart': f'2026-11-{day:02}T18:00'} for day in (3, 5, 10, 12)]
    editions.edit_draft(store, tutor, eid, 'dates', revision=0, capacity=10, price_minor=4900, starts=dates)
    preview = editions.preview_offer(store, tutor, eid, 'preview', revision=1)
    editions.offer_edition(store, tutor, eid, 'offer', confirmed=True, preview_id=preview['previewId'], preview_hash=preview['previewHash'], revision=1)
    for learner in learners[:9]:
        hold = reserve_seat(store, learner, eid, 'reserve', store.clock())
        confirm_test_enrollment(store, learner, hold['id'], 'confirm', store.clock())

    def compete(learner):
        connection = StudyStore(store.path, initialize=False)
        try:
            hold = reserve_seat(connection, learner, eid, 'race', connection.clock())
            return learner, hold
        except StudyError as error:
            assert error.code == 'group_full'
            return learner, None
        finally:
            connection.close()

    with ThreadPoolExecutor(2) as pool:
        results = list(pool.map(compete, learners[9:11]))
    assert sum(hold is not None for _, hold in results) == 1
    winner, hold = next((learner, hold) for learner, hold in results if hold)
    assert reserve_seat(store, winner, eid, 'race', store.clock()) == hold
    ack = confirm_test_enrollment(store, winner, hold['id'], 'race-confirm', store.clock())
    assert confirm_test_enrollment(store, winner, hold['id'], 'race-confirm', store.clock()) == ack
    for _ in range(2):
        with pytest.raises(StudyError, match='group_full'):
            reserve_seat(store, learners[-1], eid, 'waiting', store.clock())
    register = attendance.register(store, tutor, eid)
    assert register['admission']['confirmedCount'] == 10
    assert register['admission']['waitlistedCount'] == 2
    assert register['admission']['activeHoldCount'] == 0
    declaration = manual_payments.record(store, tutor, eid, 'manual', student_id=winner.id,
                                        amount_minor=1200, currency='EUR', external_reference='S09-SYNTHETIC-01')
    assert manual_payments.record(store, tutor, eid, 'manual', student_id=winner.id,
                                 amount_minor=1200, currency='EUR', external_reference='S09-SYNTHETIC-01') == declaration
    assert attendance.register(store, tutor, eid)['admission'] == register['admission']
    for actor in (other, learners[0]):
        with pytest.raises(StudyError, match='forbidden'):
            manual_payments.listing(store, actor, eid)
    with pytest.raises(StudyError, match='reconfirmation_required'):
        editions.edit_draft(store, tutor, eid, 'unsafe-reschedule', revision=2, capacity=10,
                            price_minor=4900, starts=[{'localStart': f'2026-12-{day:02}T18:00'} for day in (3, 5, 10, 12)])
    store.close()
    cold = StudyStore(tmp_path / 'operations.sqlite', initialize=False)
    assert attendance.register(cold, tutor, eid)['admission']['confirmedCount'] == 10
    assert manual_payments.listing(cold, tutor, eid)['summary']['totalMinor'] == 1200
    assert cold.get_edition(eid)['packId'] == 'taylor-exp-v1'
    assert cold.get_edition(eid)['sessions'][0]['start'] == '2026-11-03T18:00:00+01:00'
    cold.close()
