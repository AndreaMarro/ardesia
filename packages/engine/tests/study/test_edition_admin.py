"""Edition management is one versioned Core, without commercial side effects."""
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
import json
import sqlite3
import pytest
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from lessonos.study import editions
from lessonos.study.groups import configure_sessions,reserve_seat
from lessonos.study.operations import _existing_database,check_data


def starts(hour='18:00'):
    return [{'localStart':f'2026-11-{day:02}T{hour}'} for day in (3,5,10,12)]


def setup(tmp_path):
    now=[100]
    store=StudyStore(tmp_path/'study.sqlite',clock=lambda:now[0])
    teacher=store.create_principal('admin-tutor','teacher')
    other=store.create_principal('admin-other','teacher')
    student=store.create_principal('admin-student','student')
    result=editions.create_draft(store,teacher,'taylor-exp-v1',1,10,4900,'create')
    return store,teacher,other,student,result['edition']['id'],now


def configure(store,teacher,eid,*,key='configure',revision=0,capacity=10,price=4900,dates=None):
    return editions.edit_draft(store,teacher,eid,key,revision=revision,capacity=capacity,
        price_minor=price,starts=dates or starts())


def confirm(store,teacher,eid,preview,key='offer',**changes):
    return editions.offer_edition(store,teacher,eid,key,confirmed=changes.get('confirmed',True),
        preview_id=preview['previewId'],preview_hash=changes.get('hash',preview['previewHash']),
        revision=changes.get('revision',preview['expectedRevision']))


def test_create_is_idempotent_immutable_binding_owned_and_not_a_sale(tmp_path):
    store,tutor,other,student,eid,now=setup(tmp_path)
    original=editions.create_draft(store,tutor,'taylor-exp-v1',1,10,4900,'create')
    assert original['edition']['id']==eid
    assert original['edition']['state']=='draft'
    assert original['edition']['packId']=='taylor-exp-v1'
    assert original['edition']['managementRevision']==0
    assert store.connection.execute('SELECT COUNT(*) FROM classes').fetchone()[0]==1
    assert store.connection.execute('SELECT COUNT(*) FROM study_edition_packs').fetchone()[0]==1
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==0
    assert store.connection.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0]==0
    with pytest.raises(StudyError,match='idempotency_conflict'):
        editions.create_draft(store,tutor,'taylor-exp-v1',1,10,3900,'create')
    for actor in (other,student):
        with pytest.raises(StudyError,match='forbidden'):editions.admin_edition(store,actor,eid)
    with pytest.raises(StudyError,match='edition_not_offered'):
        reserve_seat(store,student,eid,'draft-booking',100)
    store.close()


def test_aba_and_same_revision_concurrency_cannot_approve_a_stale_offer(tmp_path):
    store,tutor,other,student,eid,now=setup(tmp_path)
    configure(store,tutor,eid)
    old=editions.preview_offer(store,tutor,eid,'old-preview',revision=1)
    configure(store,tutor,eid,key='B',revision=1,dates=starts('20:00'))
    configure(store,tutor,eid,key='A-again',revision=2)
    current=editions.admin_edition(store,tutor,eid)
    assert current['managementRevision']==3 and current['sessions']==old['offer']['sessions']
    with pytest.raises(StudyError,match='stale_edition'):confirm(store,tutor,eid,old)
    assert editions.admin_edition(store,tutor,eid)['state']=='draft'
    barrier=Barrier(2)
    def edit(index):
        independent=StudyStore(store.path,clock=lambda:100)
        try:
            barrier.wait(timeout=5)
            configure(independent,tutor,eid,key='race-'+str(index),revision=3,capacity=9-index)
            return 'edited'
        except StudyError as error:return error.code
        finally:independent.close()
    with ThreadPoolExecutor(2) as pool:outcomes=list(pool.map(edit,range(2)))
    assert sorted(outcomes)==['edited','stale_edition']
    assert editions.admin_edition(store,tutor,eid)['managementRevision']==4
    store.close()


def test_noop_representation_and_idempotent_retries_do_not_advance_revision(tmp_path):
    store,tutor,other,student,eid,now=setup(tmp_path)
    original=configure(store,tutor,eid)
    assert configure(store,tutor,eid)==original
    same=configure(store,tutor,eid,key='noop',revision=1)
    assert same['edition']['managementRevision']==1
    # The old direct command shares the same material mutation primitive.
    without_seconds=[{key:value.replace(':00+01:00','+01:00') for key,value in date.items()} for date in same['edition']['sessions']]
    configure_sessions(store,tutor,eid,without_seconds)
    assert editions.admin_edition(store,tutor,eid)['managementRevision']==1
    assert editions.admin_edition(store,tutor,eid)['sessions']==original['edition']['sessions']
    store.close()


def test_preview_expiry_false_tamper_foreign_and_double_confirm_fail_closed(tmp_path):
    store,tutor,other,student,eid,now=setup(tmp_path)
    configure(store,tutor,eid)
    expired=editions.preview_offer(store,tutor,eid,'expired',revision=1,ttl=1)
    now[0]=101
    with pytest.raises(StudyError,match='offer_preview_expired'):confirm(store,tutor,eid,expired,'expired-confirm')
    preview=editions.preview_offer(store,tutor,eid,'fresh',revision=1)
    for actor in (other,student):
        with pytest.raises(StudyError,match='forbidden'):confirm(store,actor,eid,preview,'foreign')
    with pytest.raises(StudyError,match='explicit_confirmation_required'):confirm(store,tutor,eid,preview,confirmed=False)
    with pytest.raises(StudyError,match='invalid_offer_preview'):confirm(store,tutor,eid,preview,hash='0'*64)
    result=confirm(store,tutor,eid,preview)
    assert result['edition']['state']=='offered' and result['edition']['managementRevision']==2
    assert confirm(store,tutor,eid,preview)==result
    with pytest.raises(StudyError,match='stale_edition'):confirm(store,tutor,eid,preview,'second-key')
    assert store.connection.execute("SELECT COUNT(*) FROM study_receipts WHERE operation='edition.offered'").fetchone()[0]==1
    store.close()


def test_same_actor_create_key_race_creates_one_class_edition_and_binding(tmp_path):
    store=StudyStore(tmp_path/'same-key.sqlite')
    teacher=store.create_principal('same-key-tutor','teacher')
    barrier=Barrier(2)
    def create(_):
        independent=StudyStore(store.path)
        try:
            barrier.wait(timeout=5)
            return editions.create_draft(independent,teacher,'relazioni-fluidi-v1',1,10,4900,'same-key')
        finally:independent.close()
    with ThreadPoolExecutor(2) as pool:outcomes=list(pool.map(create,range(2)))
    assert outcomes[0]==outcomes[1]
    for table in ('classes','study_editions','study_edition_packs'):
        assert store.connection.execute('SELECT COUNT(*) FROM '+table).fetchone()[0]==1
    store.close()


def test_dst_gap_ambiguous_fold_and_elapsed_duration_are_resolved_by_core():
    ordinary=starts()[1:]
    with pytest.raises(StudyError,match='invalid_calendar'):
        editions.resolve_starts([{'localStart':'2027-03-28T02:30'},*ordinary])
    with pytest.raises(StudyError,match='ambiguous_calendar_time'):
        editions.resolve_starts([{'localStart':'2026-10-25T02:30'},*ordinary])
    early=editions.resolve_starts([{'localStart':'2026-10-25T02:30','occurrence':'earlier'},*ordinary])
    late=editions.resolve_starts([{'localStart':'2026-10-25T02:30','occurrence':'later'},*ordinary])
    assert early[0]=={'start':'2026-10-25T02:30:00+02:00','end':'2026-10-25T03:00:00+01:00'}
    assert late[0]=={'start':'2026-10-25T02:30:00+01:00','end':'2026-10-25T04:00:00+01:00'}
    spring=editions.resolve_starts([{'localStart':'2027-03-28T01:45'},*ordinary])
    assert spring[0]['end']=='2027-03-28T04:15:00+02:00'
    with pytest.raises(StudyError,match='invalid_calendar'):
        editions.resolve_starts([{'localStart':'9999-12-31T23:59'},*ordinary])


def test_a_conflict_in_the_fourth_date_is_rejected_and_published_edits_require_reconfirmation(tmp_path):
    store,tutor,other,student,eid,now=setup(tmp_path)
    configure(store,tutor,eid)
    second=editions.create_draft(store,tutor,'relazioni-fluidi-v1',1,10,4900,'second')['edition']['id']
    dates=[{'localStart':f'2026-12-{day:02}T18:00'} for day in (1,3,8)]+[starts()[-1]]
    with pytest.raises(StudyError,match='calendar_conflict'):
        configure(store,tutor,second,key='second-configure',dates=dates)
    preview=editions.preview_offer(store,tutor,eid,'preview',revision=1)
    confirm(store,tutor,eid,preview)
    hold=reserve_seat(store,student,eid,'hold',100)
    with pytest.raises(StudyError,match='reconfirmation_required'):
        configure(store,tutor,eid,key='price-change',revision=2,price=3900)
    assert editions.admin_edition(store,tutor,eid)['priceMinor']==4900
    assert store.connection.execute('SELECT state FROM study_holds WHERE id=?',(hold['id'],)).fetchone()[0]=='hold'
    store.close()


@pytest.mark.parametrize('field,value',[('capacity',True),('capacity',11),('capacity',10**1000),('price',0),('price',49.0),('revision',True),('revision',10**1000)])
def test_core_invalid_admin_parameters_cannot_write(tmp_path,field,value):
    store,tutor,other,student,eid,now=setup(tmp_path)
    kwargs={'revision':0,'capacity':10,'price':4900};kwargs[field]=value
    with pytest.raises(StudyError):configure(store,tutor,eid,**kwargs)
    assert editions.admin_edition(store,tutor,eid)['managementRevision']==0
    store.close()


def test_version3_upgrade_preserves_members_and_version4_loss_fails_without_repair(tmp_path):
    store,tutor,other,student,eid,now=setup(tmp_path)
    store.add_test_member(tutor,eid,student.id)
    store.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as raw:
        raw.execute('UPDATE study_schema SET version=3')
        raw.execute('ALTER TABLE study_editions DROP COLUMN management_revision')
    raw.close()
    upgraded=StudyStore(tmp_path/'study.sqlite')
    assert upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0]==4
    assert upgraded._edition_access(student,eid)['state']=='draft'
    assert editions.admin_edition(upgraded,tutor,eid)['managementRevision']==0
    upgraded.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as raw:
        raw.execute('ALTER TABLE study_editions DROP COLUMN management_revision')
    raw.close()
    before=(tmp_path/'study.sqlite').read_bytes()
    with pytest.raises(StudyError,match='database_integrity_failure'):StudyStore(tmp_path/'study.sqlite')
    assert (tmp_path/'study.sqlite').read_bytes()==before
    with pytest.raises(ValueError,match='database_integrity_schema'):_existing_database(tmp_path)
    assert not check_data(tmp_path)['ok']


def test_shared_schema_contract_rejects_unknown_or_incomplete_features():
    from lessonos.study.schema_contract import validate_schema,TABLES_V3
    validate_schema(4,TABLES_V3,{'management_revision'},{'offer_revision'})
    with pytest.raises(StudyError,match='newer_schema'):validate_schema(99,TABLES_V3,{'management_revision'},{'offer_revision'})
    with pytest.raises(StudyError,match='database_integrity_failure'):validate_schema(4,TABLES_V3-{'study_calendar_cache'},{'management_revision'},{'offer_revision'})
    with pytest.raises(StudyError,match='database_integrity_failure'):validate_schema(4,TABLES_V3,set(),{'offer_revision'})
    with pytest.raises(StudyError,match='database_schema_not_ready'):validate_schema(3,TABLES_V3,set())

    with pytest.raises(StudyError,match='database_integrity_failure'):validate_schema(4,TABLES_V3,{'management_revision'},set())


@pytest.mark.parametrize('loss',['offer_revision','calendar_table'])
def test_schema4_missing_hold_binding_or_calendar_table_is_not_repaired(tmp_path,loss):
    store,*_=setup(tmp_path)
    store.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as raw:
        if loss=='offer_revision':raw.execute('ALTER TABLE study_holds DROP COLUMN offer_revision')
        else:raw.execute('DROP TABLE study_calendar_cache')
    raw.close()
    before=(tmp_path/'study.sqlite').read_bytes()
    with pytest.raises(StudyError,match='database_integrity_failure'):StudyStore(tmp_path/'study.sqlite')
    assert (tmp_path/'study.sqlite').read_bytes()==before
    with pytest.raises(ValueError,match='database_integrity_schema'):_existing_database(tmp_path)


def test_legacy_null_binding_cannot_confirm_but_completed_membership_is_preserved(tmp_path):
    from lessonos.study.groups import confirm_test_enrollment
    store,tutor,other,student,eid,now=setup(tmp_path)
    configure(store,tutor,eid)
    preview=editions.preview_offer(store,tutor,eid,'preview',revision=1)
    confirm(store,tutor,eid,preview)
    hold=reserve_seat(store,student,eid,'hold',100)
    assert hold['offerRevision']==2
    # A deliberate legacy-row fixture: NULL is absence of acceptance evidence.
    with store.transaction() as connection:
        connection.execute('UPDATE study_holds SET offer_revision=NULL WHERE id=?',(hold['id'],))
    assert reserve_seat(store,student,eid,'hold',100)==hold  # historical receipt
    assert confirm_test_enrollment(store,student,hold['id'],'old-confirm',101)['state']=='payment_requires_review'
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==0
    fresh=reserve_seat(store,student,eid,'new-acceptance',101)
    assert fresh['id']!=hold['id'] and fresh['offerRevision']==2
    receipt=confirm_test_enrollment(store,student,fresh['id'],'fresh-confirm',102)
    assert receipt['state']=='confirmed'
    with store.transaction() as connection:
        connection.execute('UPDATE study_holds SET offer_revision=NULL WHERE id=?',(fresh['id'],))
    assert confirm_test_enrollment(store,student,fresh['id'],'fresh-confirm',102)==receipt
    assert confirm_test_enrollment(store,student,fresh['id'],'already-confirmed',103)['state']=='confirmed'
    assert store.connection.execute('SELECT COUNT(*) FROM study_members').fetchone()[0]==1
    assert store.connection.execute('SELECT COUNT(*) FROM enrollments').fetchone()[0]==1
    store.close()
