"""Causal contracts for two manual registers sharing one Core and no learning events."""
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
import json
import sqlite3
import pytest
from lessonos.study.store import StudyStore
from lessonos.study.models import StudyError
from lessonos.study.schema_contract import CURRENT_SCHEMA
from lessonos.study.groups import configure_sessions
from lessonos.study import attendance,manual_payments
from lessonos.study.operations import backup_data,restore_data,erase_student,_existing_database


def seed(tmp_path):
    clock=[1800000000.]
    store=StudyStore(tmp_path/'study.sqlite',clock=lambda:clock[0])
    tutor=store.create_principal('register-tutor','teacher')
    student=store.create_principal('register-student','student')
    peer=store.create_principal('register-peer','student')
    other=store.create_principal('register-other','teacher')
    store.create_edition(tutor,'register-edition')
    configure_sessions(store,tutor,'register-edition',[
        {'start':f'2025-01-{day:02}T18:00:00+01:00','end':f'2025-01-{day:02}T19:30:00+01:00'} for day in (3,5,10,12)])
    store.add_test_member(tutor,'register-edition',student.id)
    return store,tutor,student,peer,other,clock


def declare(store,tutor,student,*,key='attendance',revision=0,target=None,status='PRESENT',reason='',management=None):
    view=attendance.register(store,tutor,'register-edition')
    return attendance.record(store,tutor,'register-edition',key,session_id=view['sessions'][0]['sessionId'],student_id=student.id,
        status=status,expected_revision=revision,expected_management_revision=view['managementRevision'] if management is None else management,
        target_record_id=target,reason=reason)


def annotate(store,tutor,student,*,key='payment',reference='local-ref',amount=4900):
    return manual_payments.record(store,tutor,'register-edition',key,student_id=student.id,amount_minor=amount,currency='EUR',external_reference=reference)


@pytest.mark.parametrize('bad',['\ud800','\udfff'])
@pytest.mark.parametrize('field',['reference','reason','student'])
def test_register_text_rejects_non_scalar_unicode_before_hash_or_sql(tmp_path,bad,field):
    store,tutor,student,*_=seed(tmp_path)
    with pytest.raises(StudyError) as error:
        if field=='reference':annotate(store,tutor,student,reference=bad)
        elif field=='reason':declare(store,tutor,student,reason=bad)
        else:
            manual_payments.record(store,tutor,'register-edition','bad-student',student_id=bad,
                amount_minor=4900,currency='EUR',external_reference='valid-reference')
    assert error.value.status==422
    assert store.connection.execute('SELECT count(*) FROM study_attendance_records').fetchone()[0]==0
    assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
    assert store.connection.execute("SELECT count(*) FROM study_receipts WHERE operation LIKE 'admin.%'").fetchone()[0]==0
    store.close()


def pedagogical_facts(store):
    return {name:[tuple(r) for r in store.connection.execute(f'SELECT * FROM {name} ORDER BY 1')]
            for name in ('study_members','study_holds','enrollments','study_events','study_submissions','study_reviews','study_observations','study_edition_packs','study_editions')}


def test_default_unrecorded_and_append_only_rectification_leave_other_lanes_unchanged(tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    before=pedagogical_facts(store)
    view=attendance.register(store,tutor,'register-edition')
    assert [c['status'] for c in view['cells']]==['UNRECORDED']*4
    assert all(c['recordId'] is None and c['canRecord'] for c in view['cells'])
    first=declare(store,tutor,student)
    assert declare(store,tutor,student)==first
    with pytest.raises(StudyError,match='idempotency_conflict'):declare(store,tutor,student,status='ABSENT')
    second=declare(store,tutor,student,key='correction',revision=1,target=first['recordId'],status='ABSENT',reason='Manual correction')
    third=declare(store,tutor,student,key='unrecord',revision=2,target=second['recordId'],status='UNRECORDED',reason='Evidence insufficient')
    history=attendance.history(store,tutor,'register-edition',session_id=view['sessions'][0]['sessionId'],student_id=student.id)
    assert [r['status'] for r in history['items']]==['UNRECORDED','ABSENT','PRESENT']
    assert history['items'][0]['supersedesRecordId']==second['recordId']
    assert history['items'][2]['recordId']==first['recordId']
    assert history['items'][0]['recordedBy']==tutor.id and history['items'][0]['recordedAt']==store.clock()
    assert pedagogical_facts(store)==before
    assert store.connection.execute('SELECT count(*) FROM study_receipts WHERE operation LIKE ?',('admin.%',)).fetchone()[0]==3
    assert set(third)=={'receiptId','recordId','editionId','revision','status','mode'}
    store.close()


def test_future_missing_member_and_stale_calendar_fail_without_any_register_fact(tmp_path):
    store,tutor,student,peer,other,clock=seed(tmp_path)
    clock[0]=0
    with pytest.raises(StudyError,match='session_not_started'):declare(store,tutor,student)
    clock[0]=1800000000
    with pytest.raises(StudyError,match='member_required'):declare(store,tutor,peer)
    with pytest.raises(StudyError,match='stale_edition'):declare(store,tutor,student,management=0)
    assert store.connection.execute('SELECT count(*) FROM study_attendance_records').fetchone()[0]==0
    assert not any(c['status']!='UNRECORDED' for c in attendance.register(store,tutor,'register-edition')['cells'])
    store.close()


def test_historical_correction_uses_record_snapshot_and_never_relabels_changed_calendar(tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    first=declare(store,tutor,student)
    view=attendance.register(store,tutor,'register-edition')
    original=view['cells'][0]['record']
    # Explicit operator/legacy-history fixture, not a supported rescheduling
    # command: current Core intentionally forbids calendar edits with members.
    dates=store.get_edition('register-edition')['sessions']
    dates[0]={'start':'2025-02-03T18:00:00+01:00','end':'2025-02-03T19:30:00+01:00'}
    with store.transaction() as c:c.execute('UPDATE study_editions SET sessions=?,management_revision=management_revision+1 WHERE id=?',
        (json.dumps(dates),'register-edition'))
    current=attendance.register(store,tutor,'register-edition')['cells'][0]
    assert current['calendarConflict'] and not current['canRecord'] and current['canCorrect']
    assert current['status']=='UNRECORDED'
    declare(store,tutor,student,key='historical',revision=1,target=first['recordId'],status='ABSENT',reason='Correct the old session',management=original['managementRevision'])
    corrected=attendance.register(store,tutor,'register-edition')['cells'][0]['record']
    assert corrected['sessionSnapshot']==original['sessionSnapshot']
    assert corrected['managementRevision']==original['managementRevision']
    assert attendance.register(store,tutor,'register-edition')['cells'][0]['calendarConflict']
    store.close()


def test_manual_corrections_void_and_reactivation_count_only_one_head(tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    before=pedagogical_facts(store)
    first=annotate(store,tutor,student)
    assert annotate(store,tutor,student)==first
    second=manual_payments.correct(store,tutor,'register-edition',first['entryId'],'correct',expected_revision=1,
        target_record_id=first['recordId'],status='RECORDED_MANUALLY',amount_minor=3900,reason='Correct amount')
    current=manual_payments.listing(store,tutor,'register-edition')
    assert current['summary']['totalMinor']==3900 and current['summary']['recordedCount']==1
    assert current['items'][0]['priceDiscrepancy']
    void=manual_payments.correct(store,tutor,'register-edition',first['entryId'],'void',expected_revision=2,
        target_record_id=second['recordId'],status='VOIDED',reason='Wrong recipient; do not reassign')
    assert manual_payments.listing(store,tutor,'register-edition')['summary']['totalMinor']==0
    assert manual_payments.listing(store,tutor,'register-edition')['summary']['voidedCount']==1
    history=manual_payments.history(store,tutor,'register-edition',first['entryId'])['items']
    assert [r['revision'] for r in history]==[3,2,1]
    assert all(r['studentId']==student.id and r['externalReference']=='local-ref' and r['offerSnapshot']==history[-1]['offerSnapshot'] for r in history)
    assert history[0]['amountMinor']==3900 and void['status']=='VOIDED'
    assert pedagogical_facts(store)==before
    store.close()


@pytest.mark.parametrize('status,amount',[('RECORDED_MANUALLY',3900),('VOIDED',None)])
def test_payment_page_and_summary_share_one_read_snapshot(tmp_path,status,amount):
    store,tutor,student,*_=seed(tmp_path)
    first=annotate(store,tutor,student)
    writer=StudyStore(store.path,initialize=False);raw=store.connection;interleaved=[];queries=[]
    class Cursor:
        def __init__(self,cursor):self.cursor=cursor
        def fetchall(self):
            rows=self.cursor.fetchall()
            ack=manual_payments.correct(writer,tutor,'register-edition',first['entryId'],'concurrent',
                expected_revision=1,target_record_id=first['recordId'],status=status,amount_minor=amount,reason='Concurrent writer')
            interleaved.append(ack['revision'])
            return rows
    class Connection:
        def __getattr__(self,name):return getattr(raw,name)
        def execute(self,sql,parameters=()):
            result=raw.execute(sql,parameters)
            if 'FROM study_manual_payment_records r' in sql:
                queries.append(sql)
                if not interleaved and 'COALESCE(SUM(CASE' not in sql:return Cursor(result)
                if not interleaved and sql.lstrip().startswith('WITH'):return Cursor(result)
            return result
    store.connection=Connection()
    try:
        view=manual_payments.listing(store,tutor,'register-edition')
        assert interleaved==[2]
        assert view['items'][0]['revision']==1 and view['items'][0]['amountMinor']==4900
        assert view['summary']['totalMinor']==4900
        assert view['summary']['recordedCount']==1 and view['summary']['voidedCount']==0
        assert len(queries)==1
    finally:store.connection=raw;store.close();writer.close()


@pytest.mark.parametrize('amount',[True,False,0,-1,1000001,1.2,10**1000])
def test_manual_amount_is_a_bounded_strict_integer(tmp_path,amount):
    store,tutor,student,*_=seed(tmp_path)
    with pytest.raises(StudyError,match='invalid_manual_amount'):annotate(store,tutor,student,amount=amount)
    assert manual_payments.listing(store,tutor,'register-edition')['items']==[]
    store.close()


def test_reference_namespace_nfc_trim_duplicate_even_after_void_and_other_edition(tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    first=annotate(store,tutor,student,reference='  Re\u0301f-1 ')
    for reference in ('Réf-1',' Re\u0301f-1'):
        with pytest.raises(StudyError,match='duplicate_reference'):annotate(store,tutor,student,key=reference,reference=reference)
    manual_payments.correct(store,tutor,'register-edition',first['entryId'],'void',expected_revision=1,
        target_record_id=first['recordId'],status='VOIDED',reason='Never recycle references')
    with pytest.raises(StudyError,match='duplicate_reference'):annotate(store,tutor,student,key='again',reference='Réf-1')
    store.create_edition(tutor,'other-edition');store.add_test_member(tutor,'other-edition',student.id)
    with pytest.raises(StudyError,match='duplicate_reference'):
        manual_payments.record(store,tutor,'other-edition','other',student_id=student.id,amount_minor=4900,currency='EUR',external_reference='Réf-1')
    annotate(store,tutor,student,key='case-distinct',reference='réf-1')
    store.close()


def test_owner_acl_precedes_foreign_json_decode_and_receipt_replay(tmp_path):
    store,tutor,student,peer,other,_=seed(tmp_path)
    first=annotate(store,tutor,student)
    with store.transaction() as c:c.execute('UPDATE study_manual_payment_records SET offer_snapshot=?',('NOT JSON',))
    for actor in (other,student,peer):
        with pytest.raises(StudyError,match='forbidden'):manual_payments.listing(store,actor,'register-edition')
        with pytest.raises(StudyError,match='forbidden'):attendance.register(store,actor,'register-edition')
        with pytest.raises(StudyError,match='forbidden'):annotate(store,actor,student)
    store.close()


def test_history_and_entry_lists_are_bounded_and_cursors_cannot_cross_scope(tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    first=annotate(store,tutor,student)
    for n in range(1,4):annotate(store,tutor,student,key=str(n),reference=str(n))
    a=manual_payments.listing(store,tutor,'register-edition',limit=2)
    b=manual_payments.listing(store,tutor,'register-edition',limit=2,after=a['nextCursor'])
    assert len(a['items'])==len(b['items'])==2 and b['nextCursor'] is None
    assert len({i['entryId'] for i in a['items']+b['items']})==4
    assert a['summary']==b['summary'] and a['summary']['totalMinor']==19600
    old=declare(store,tutor,student)
    declare(store,tutor,student,key='rectify',revision=1,target=old['recordId'],reason='Explicit correction')
    session=attendance.register(store,tutor,'register-edition')['sessions'][0]['sessionId']
    h=attendance.history(store,tutor,'register-edition',session_id=session,student_id=student.id,limit=1)
    tail=attendance.history(store,tutor,'register-edition',session_id=session,student_id=student.id,limit=1,after=h['nextCursor'])
    assert [h['items'][0]['revision'],tail['items'][0]['revision']]==[2,1] and tail['nextCursor'] is None
    with pytest.raises(StudyError,match='invalid_cursor'):manual_payments.history(store,tutor,'register-edition',first['entryId'],after=h['nextCursor'])
    with pytest.raises(StudyError,match='invalid_page'):manual_payments.listing(store,tutor,'register-edition',limit=51)
    store.close()


@pytest.mark.parametrize('domain',['attendance','payment'])
def test_two_connection_cas_race_commits_one_rectification(domain,tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    first=declare(store,tutor,student) if domain=='attendance' else annotate(store,tutor,student)
    path=store.path;store.close();barrier=Barrier(2)
    def correct(index):
        local=StudyStore(path)
        try:
            barrier.wait(timeout=5)
            if domain=='attendance':return declare(local,tutor,student,key=str(index),revision=1,target=first['recordId'],status='ABSENT',reason='Correction')['revision']
            return manual_payments.correct(local,tutor,'register-edition',first['entryId'],str(index),expected_revision=1,
                target_record_id=first['recordId'],status='VOIDED',reason='Correction')['revision']
        except StudyError as error:return error.code
        finally:local.close()
    with ThreadPoolExecutor(max_workers=2) as pool:result=list(pool.map(correct,range(2)))
    assert sorted(map(str,result))==['2','stale_admin_record']


def test_schema4_upgrade_preserves_facts_and_schema5_missing_features_fail_without_repair(tmp_path):
    store,tutor,student,*_=seed(tmp_path);before=pedagogical_facts(store);store.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as c:
        c.execute('DROP TABLE study_attendance_records');c.execute('DROP TABLE study_manual_payment_records');c.execute('UPDATE study_schema SET version=4')
    upgraded=StudyStore(tmp_path/'study.sqlite')
    assert pedagogical_facts(upgraded)==before and upgraded.connection.execute('SELECT version FROM study_schema').fetchone()[0]==CURRENT_SCHEMA
    assert attendance.register(upgraded,tutor,'register-edition')['cells'][0]['status']=='UNRECORDED'
    upgraded.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as c:c.execute('DROP TABLE study_manual_payment_records')
    with pytest.raises(StudyError,match='database_integrity_failure'):StudyStore(tmp_path/'study.sqlite')
    with sqlite3.connect(tmp_path/'study.sqlite') as c:assert not c.execute("SELECT 1 FROM sqlite_master WHERE name='study_manual_payment_records'").fetchone()
    with pytest.raises(ValueError,match='database_integrity_schema'):_existing_database(tmp_path)


def test_erasure_and_restore_remove_manual_subject_records_and_tutor_receipts(tmp_path):
    source=tmp_path/'source';source.mkdir()
    store,tutor,student,*_=seed(source)
    a=declare(store,tutor,student);p=annotate(store,tutor,student);store.close()
    preview=erase_student(source,student.id,apply=False)
    assert preview['attendanceRecords']==preview['manualPaymentRecords']==1
    backup_data(source,tmp_path/'backup')
    erase_student(source,student.id,apply=True)
    erased=StudyStore(source/'study.sqlite')
    for table in ('study_attendance_records','study_manual_payment_records'):assert erased.connection.execute(f'SELECT count(*) FROM {table}').fetchone()[0]==0
    assert erased.connection.execute('SELECT 1 FROM study_receipts WHERE id IN (?,?)',(a['receiptId'],p['receiptId'])).fetchone() is None
    erased.close()
    restore_data(tmp_path/'backup',tmp_path/'restored',source/'erasure-ledger.json')
    restored=StudyStore(tmp_path/'restored/study.sqlite')
    assert restored.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
    assert restored.connection.execute('SELECT count(*) FROM study_attendance_records').fetchone()[0]==0
    restored.close()


def test_clock_and_membership_are_read_after_the_edition_lock(tmp_path):
    store,tutor,student,peer,other,clock=seed(tmp_path)
    session=attendance.register(store,tutor,'register-edition')['sessions'][0]
    old_lock=store.lock_edition
    def clock_changed(c,eid):
        old_lock(c,eid)
        clock[0]=0
    store.lock_edition=clock_changed
    with pytest.raises(StudyError,match='session_not_started'):declare(store,tutor,student)
    clock[0]=1800000000
    def membership_removed(c,eid):
        old_lock(c,eid)
        # Deterministic maintenance-race injection: no withdrawal API exists in
        # this slice. The transaction rolls this removal back on failure.
        c.execute('DELETE FROM study_members WHERE edition_id=? AND student_id=?',(eid,student.id))
    store.lock_edition=membership_removed
    with pytest.raises(StudyError,match='member_required'):annotate(store,tutor,student)
    assert store.connection.execute('SELECT count(*) FROM study_members').fetchone()[0]==1
    assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
    store.close()


def test_same_key_race_returns_one_exact_ack_and_receipt_failure_rolls_back_the_record(tmp_path,monkeypatch):
    store,tutor,student,*_=seed(tmp_path);path=store.path;store.close();barrier=Barrier(2)
    def write(_):
        local=StudyStore(path)
        try:barrier.wait(timeout=5);return annotate(local,tutor,student)
        finally:local.close()
    with ThreadPoolExecutor(max_workers=2) as pool:receipts=list(pool.map(write,range(2)))
    assert receipts[0]==receipts[1]
    reopened=StudyStore(path)
    assert reopened.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==1
    from lessonos.study import transactions
    def fail(*args):raise RuntimeError('injected receipt write failure')
    monkeypatch.setattr(transactions,'record_receipt',fail)
    with pytest.raises(RuntimeError,match='injected receipt'):declare(reopened,tutor,student)
    assert reopened.connection.execute('SELECT count(*) FROM study_attendance_records').fetchone()[0]==0
    reopened.close()


def test_schema5_missing_column_or_marker_is_never_repaired(tmp_path):
    store,*_=seed(tmp_path);store.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as c:c.execute('ALTER TABLE study_manual_payment_records DROP COLUMN offer_snapshot')
    with pytest.raises(StudyError,match='database_integrity_failure'):StudyStore(tmp_path/'study.sqlite')
    with sqlite3.connect(tmp_path/'study.sqlite') as c:
        assert 'offer_snapshot' not in {r[1] for r in c.execute('PRAGMA table_info(study_manual_payment_records)')}
        assert c.execute('SELECT version FROM study_schema').fetchone()[0]==CURRENT_SCHEMA


def test_manual_facts_do_not_enter_learning_notebook_or_pedagogical_events(tmp_path):
    from lessonos.study.portable import export_notebook,inspect_notebook
    store,tutor,student,*_=seed(tmp_path)
    annotate(store,tutor,student,reference='PRIVATE_COMMERCIAL_REFERENCE')
    declare(store,tutor,student,reason='PRIVATE_ATTENDANCE_REASON')
    bundle=export_notebook(store,student,'register-edition',tmp_path/'blobs')
    data=json.dumps(bundle)
    assert 'PRIVATE_COMMERCIAL_REFERENCE' not in data and 'PRIVATE_ATTENDANCE_REASON' not in data
    assert 'Edition attendance and manual commercial registers are not included in this learning notebook.' in bundle['omissions']
    assert inspect_notebook(bundle)['valid']
    events='\n'.join(row[0] for row in store.connection.execute('SELECT payload FROM study_events'))
    assert 'PRIVATE_COMMERCIAL_REFERENCE' not in events and 'PRIVATE_ATTENDANCE_REASON' not in events
    store.close()


@pytest.mark.parametrize('field',['reference','reason'])
def test_manual_text_rejects_nul_before_dialect_specific_database_errors(tmp_path,field):
    store,tutor,student,*_=seed(tmp_path)
    try:
        with pytest.raises(StudyError):
            if field=='reference':annotate(store,tutor,student,reference='opaque\x00reference')
            else:declare(store,tutor,student,reason='reason\x00text')
    finally:store.close()


def test_partial_register_upgrade_cannot_repair_a_schema4_marker(tmp_path):
    store,*_=seed(tmp_path);store.close()
    with sqlite3.connect(tmp_path/'study.sqlite') as c:
        c.execute('DROP TABLE study_manual_payment_records');c.execute('UPDATE study_schema SET version=4')
    with pytest.raises(StudyError,match='database_integrity_failure'):StudyStore(tmp_path/'study.sqlite')
    with sqlite3.connect(tmp_path/'study.sqlite') as c:
        assert c.execute('SELECT version FROM study_schema').fetchone()[0]==4
        assert not c.execute("SELECT 1 FROM sqlite_master WHERE name='study_manual_payment_records'").fetchone()


def test_attendance_projection_uses_one_head_query_for_one_or_ten_members(tmp_path):
    store,tutor,student,*_=seed(tmp_path)
    selects=[]
    store.connection.set_trace_callback(lambda statement:selects.append(statement))
    assert len(attendance.register(store,tutor,'register-edition')['cells'])==4
    assert sum('FROM study_attendance_records a' in q for q in selects)==1
    store.connection.set_trace_callback(None)
    for n in range(9):
        person=store.create_principal(f'projection-student-{n}','student')
        store.add_test_member(tutor,'register-edition',person.id)
    selects.clear();store.connection.set_trace_callback(lambda statement:selects.append(statement))
    assert len(attendance.register(store,tutor,'register-edition')['cells'])==40
    assert sum('FROM study_attendance_records a' in q for q in selects)==1
    assert len([q for q in selects if q.lstrip().startswith('SELECT')])==5
    store.close()
