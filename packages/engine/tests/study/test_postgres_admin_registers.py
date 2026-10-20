"""Live opt-in only after root backs up/applies schema5; never run by the builder."""
import uuid
import base64
import json
import pytest
from test_postgres_contract import pg_configuration,pg_store,identities,api_request
from lessonos.study import attendance,manual_payments
from lessonos.study.groups import configure_sessions
from lessonos.study.models import StudyError


def test_postgres_manual_registers_owner_rls_receipt_and_append_only_contract(pg_store,pg_configuration,identities,tmp_path):
    import psycopg
    from lessonos.study.postgres import PostgresStudyStore
    actors,sessions=identities
    tutor,student,peer,_=actors
    eid='register-'+uuid.uuid4().hex[:12]
    pg_store.create_edition(tutor,eid)
    configure_sessions(pg_store,tutor,eid,[{'start':f'2025-01-{day:02}T18:00:00+01:00',
        'end':f'2025-01-{day:02}T19:30:00+01:00'} for day in (3,5,10,12)])
    pg_store.add_test_member(tutor,eid,student.id)
    other=pg_store.create_principal('other-'+eid,'teacher')
    email=uuid.uuid4().hex+'@example.invalid';password=uuid.uuid4().hex+'X!7'
    status,user=api_request(pg_configuration,'POST','/auth/v1/admin/users',admin=True,
        body={'email':email,'password':password,'email_confirm':True})
    assert status==200,'isolated other-tutor fixture failed'
    try:
        status,session=api_request(pg_configuration,'POST','/auth/v1/token?grant_type=password',body={'email':email,'password':password})
        assert status==200,'isolated other-tutor login failed'
        claims=json.loads(base64.urlsafe_b64decode(session['access_token'].split('.')[1]+'=='))
        pg_store.connection.execute('INSERT INTO ardesia_private.identities VALUES(?,?)',(user['id'],other.id))
    except BaseException:
        api_request(pg_configuration,'DELETE','/auth/v1/admin/users/'+user['id'],admin=True)
        raise
    other_session={'userId':user['id'],'sessionId':claims['session_id']}
    stores=[PostgresStudyStore(pg_configuration['DB_URL'],tmp_path/name,
        auth_user_id=session['userId'],auth_session_id=session['sessionId']) for name,session in zip(('tutor','student','peer','other'),[*sessions,other_session])]
    try:
        owner=stores[0];view=attendance.register(owner,tutor,eid)
        ack=attendance.record(owner,tutor,eid,'attendance',session_id=view['sessions'][0]['sessionId'],student_id=student.id,
            status='PRESENT',expected_revision=0,expected_management_revision=view['managementRevision'])
        payment=manual_payments.record(owner,tutor,eid,'manual',student_id=student.id,amount_minor=4900,currency='EUR',external_reference='test-'+eid)
        assert manual_payments.listing(owner,tutor,eid)['summary']['totalMinor']==4900
        for table in ('study_attendance_records','study_manual_payment_records'):
            assert owner.connection.execute(f'SELECT count(*) FROM {table} WHERE edition_id=?',(eid,)).fetchone()[0]==1
            for actor,store in zip((student,peer,other),stores[1:]):
                assert store.connection.execute(f'SELECT count(*) FROM {table} WHERE edition_id=?',(eid,)).fetchone()[0]==0
                with pytest.raises(StudyError,match='forbidden'):manual_payments.listing(store,actor,eid)
            for statement in (f'UPDATE {table} SET status=status WHERE edition_id=?',f'DELETE FROM {table} WHERE edition_id=?'):
                with pytest.raises(psycopg.errors.InsufficientPrivilege):owner.connection.execute(statement,(eid,))
            status,_=api_request(pg_configuration,'GET','/rest/v1/'+table+'?select=id',token=sessions[1]['token'])
            assert status in (401,403)
        assert owner.connection.execute('SELECT count(*) FROM study_receipts WHERE id IN (?,?)',(ack['receiptId'],payment['receiptId'])).fetchone()[0]==2
        for store in stores[1:]:
            assert store.connection.execute('SELECT count(*) FROM study_receipts WHERE id IN (?,?)',(ack['receiptId'],payment['receiptId'])).fetchone()[0]==0
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            stores[1].connection.execute('INSERT INTO study_receipts VALUES(?,?,?,?,?,?)',
                (uuid.uuid4().hex,student.id,'admin.manual-payment.recorded','forged','0'*64,'{}'))
        before=owner.connection.execute('SELECT body FROM study_receipts WHERE id=?',(payment['receiptId'],)).fetchone()[0]
        assert owner.connection.execute('UPDATE study_receipts SET body=? WHERE id=?',('{}',payment['receiptId'])).rowcount==0
        assert owner.connection.execute('SELECT body FROM study_receipts WHERE id=?',(payment['receiptId'],)).fetchone()[0]==before
        # Administrative erasure reuses the same row helper. Auth binding is
        # removed first; this test never deletes any pre-existing Auth account.
        status,_=api_request(pg_configuration,'DELETE','/auth/v1/admin/users/'+sessions[1]['userId'],admin=True)
        assert status==200
        from lessonos.study.operations import _erase_rows
        with pg_store.transaction():_erase_rows(pg_store,student.id)
        for table in ('study_attendance_records','study_manual_payment_records'):
            assert pg_store.connection.execute(f'SELECT count(*) FROM {table} WHERE edition_id=?',(eid,)).fetchone()[0]==0
        assert pg_store.connection.execute('SELECT count(*) FROM study_receipts WHERE id IN (?,?)',(ack['receiptId'],payment['receiptId'])).fetchone()[0]==0
        status,_=api_request(pg_configuration,'DELETE','/auth/v1/admin/users/'+sessions[0]['userId'],admin=True)
        assert status==200
        assert owner.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
        # Existing student submissions/receipt/RLS paths are covered by the
        # full live Study contract; this does not replace those independent gates.
    finally:
        for store in stores:store.close()
        api_request(pg_configuration,'DELETE','/auth/v1/admin/users/'+user['id'],admin=True)
