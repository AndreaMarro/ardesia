"""Edition registers are authenticated facts, never inferred enrollment or payment."""
import pytest
from fastapi.testclient import TestClient
from lessonos.study.store import StudyStore
from lessonos.study.schema_contract import CURRENT_SCHEMA
from lessonos.study.groups import configure_sessions
from study_api.app import create_app


def seed(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite')
    tutor=store.create_principal('ledger-tutor','teacher')
    student=store.create_principal('ledger-student','student')
    other=store.create_principal('ledger-other','teacher')
    store.create_edition(tutor,'ledger-edition')
    configure_sessions(store,tutor,'ledger-edition',[
        {'start':f'2025-01-{day:02}T18:00:00+01:00','end':f'2025-01-{day:02}T19:30:00+01:00'} for day in (3,5,10,12)])
    store.add_test_member(tutor,'ledger-edition',student.id)
    tokens={actor.id:store.issue_session(actor) for actor in (tutor,student,other)}
    return store,tutor,student,other,tokens


def login(client,token):
    assert client.post('/study/session',json={'token':token}).status_code==200


@pytest.mark.parametrize('bad',['\ud800','\udfff'])
@pytest.mark.parametrize('field',['externalReference','reason','studentId'])
def test_register_json_non_scalar_unicode_is_422_with_no_writes(tmp_path,bad,field):
    import json
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True),raise_server_exceptions=False) as client:
        login(client,tokens[tutor.id]);base='/study/admin/editions/ledger-edition'
        if field=='reason':
            view=client.get(base+'/attendance').json();route='/attendance'
            body={'sessionId':view['sessions'][0]['sessionId'],'studentId':student.id,'status':'PRESENT',
                'expectedRevision':0,'expectedManagementRevision':view['managementRevision'],'reason':bad}
        else:
            route='/manual-payments'
            body={'studentId':student.id,'amountMinor':4900,'currency':'EUR','externalReference':'valid-reference',field:bad}
        response=client.post(base+route,content=json.dumps(body,ensure_ascii=True),
            headers={'Content-Type':'application/json','Idempotency-Key':'invalid-scalar'})
        assert response.status_code==422
        assert client.get('/study/me').status_code==200
        assert 'set-cookie' not in response.headers
        assert store.connection.execute('SELECT count(*) FROM study_attendance_records').fetchone()[0]==0
        assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
        assert store.connection.execute("SELECT count(*) FROM study_receipts WHERE operation LIKE 'admin.%'").fetchone()[0]==0
    store.close()


@pytest.mark.parametrize('change',[
    {'externalReference':{'nested':'\ud800'}}, {'externalReference':['\udfff']},
    {'currency':'\ud800'}, {'extra':'\udfff'}, {'\ud800':'value'},
    {'studentId':{'nested':['\udfff']}}, {'reason':{'nested':'\ud800'}},
])
def test_register_rejects_non_scalars_in_unknown_fields_keys_and_wrong_types(tmp_path,change):
    import json
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True),raise_server_exceptions=False) as client:
        login(client,tokens[tutor.id])
        body={'studentId':student.id,'amountMinor':4900,'currency':'EUR','externalReference':'valid-reference',**change}
        response=client.post('/study/admin/editions/ledger-edition/manual-payments',content=json.dumps(body,ensure_ascii=True),
            headers={'Content-Type':'application/json','Idempotency-Key':'invalid-nested-scalar'})
        assert response.status_code==422
        assert '\\ud800' not in response.text and '\\udfff' not in response.text
        assert client.get('/study/me').status_code==200 and 'set-cookie' not in response.headers
        assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
        assert store.connection.execute("SELECT count(*) FROM study_receipts WHERE operation LIKE 'admin.%'").fetchone()[0]==0
    store.close()


@pytest.mark.parametrize('number',['1e1000','-1e1000','1.2'])
@pytest.mark.parametrize('location',['amount','unknown','nested'])
def test_register_nonfinite_json_numbers_are_safe_422_without_echo(tmp_path,number,location):
    import json
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True),raise_server_exceptions=False) as client:
        login(client,tokens[tutor.id])
        base=json.dumps({'studentId':student.id,'amountMinor':4900,'currency':'EUR','externalReference':'finite-reference'})
        body=base.replace('4900',number) if location=='amount' else base[:-1]+',"extra":'+(number if location=='unknown' else '{"nested":['+number+']}')+'}'
        response=client.post('/study/admin/editions/ledger-edition/manual-payments',content=body,
            headers={'Content-Type':'application/json','Idempotency-Key':'invalid-nonfinite'})
        assert response.status_code==422
        assert 'Infinity' not in response.text and '1e1000' not in response.text
        assert client.get('/study/me').status_code==200 and 'set-cookie' not in response.headers
        assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
        assert store.connection.execute("SELECT count(*) FROM study_receipts WHERE operation LIKE 'admin.%'").fetchone()[0]==0
    store.close()


def test_register_unicode_scalars_roundtrip_in_reference_reason_and_student_id(tmp_path):
    import json
    store,tutor,student,other,tokens=seed(tmp_path)
    person=store.create_principal('ledger-🙂','student');store.add_test_member(tutor,'ledger-edition',person.id)
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens[tutor.id]);base='/study/admin/editions/ledger-edition'
        def post(route,body,key):
            response=client.post(base+route,content=json.dumps(body,ensure_ascii=True),
                headers={'Content-Type':'application/json','Idempotency-Key':key})
            assert response.status_code==200
            return response.json()
        ref=' Re\u0301f-🙂 '
        payment=post('/manual-payments',{'studentId':person.id,'amountMinor':4900,'currency':'EUR','externalReference':ref},'astral-payment')
        post('/manual-payments/'+payment['entryId']+'/revisions',{'expectedRevision':1,'targetRecordId':payment['recordId'],
            'status':'RECORDED_MANUALLY','amountMinor':3900,'reason':'Rettifica 🙂'},'astral-reason')
        current=client.get(base+'/attendance').json()
        post('/attendance',{'sessionId':current['sessions'][0]['sessionId'],'studentId':person.id,'status':'PRESENT',
            'expectedRevision':0,'expectedManagementRevision':current['managementRevision'],'reason':'Nota 𝑥🙂'},'astral-attendance')
        record=client.get(base+'/manual-payments/'+payment['entryId']+'/history').json()['items'][0]
        assert record['externalReference']==ref and record['reason']=='Rettifica 🙂' and record['studentId']==person.id
        view=client.get(base+'/attendance').json()
        assert next(c for c in view['cells'] if c['studentId']==person.id and c['record'])['record']['reason']=='Nota 𝑥🙂'
    store.close()


def test_owner_records_attendance_and_manual_annotation_without_new_membership(tmp_path):
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens[tutor.id])
        base='/study/admin/editions/ledger-edition'
        register=client.get(base+'/attendance')
        assert register.status_code==200
        current=register.json()
        assert len(current['sessions'])==4 and len(current['cells'])==4
        assert all(cell['status']=='UNRECORDED' for cell in current['cells'])
        body={'sessionId':current['sessions'][0]['sessionId'],'studentId':student.id,'status':'PRESENT',
              'expectedRevision':0,'expectedManagementRevision':current['managementRevision']}
        first=client.post(base+'/attendance',json=body,headers={'Idempotency-Key':'attendance'})
        assert first.status_code==200
        assert client.post(base+'/attendance',json=body,headers={'Idempotency-Key':'attendance'}).json()==first.json()
        payment=client.post(base+'/manual-payments',json={'studentId':student.id,'amountMinor':4900,
            'currency':'EUR','externalReference':'synthetic-ref-1'},headers={'Idempotency-Key':'manual'})
        assert payment.status_code==200
        assert client.get('/study/receipts/'+payment.json()['receiptId']).status_code==404
        listing=client.get(base+'/manual-payments').json()
        assert listing['summary']['totalMinor']==4900
        assert listing['items'][0]['status']=='RECORDED_MANUALLY'
        assert listing['items'][0]['mode']=='test'
        assert store.connection.execute('SELECT count(*) FROM study_members').fetchone()[0]==1
        assert store.connection.execute('SELECT count(*) FROM study_holds').fetchone()[0]==0
    store.close()


@pytest.mark.parametrize('role',['student','other','anonymous'])
def test_registers_are_owner_only_not_a_new_student_or_global_tutor_grant(tmp_path,role):
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        if role!='anonymous':login(client,tokens[student.id if role=='student' else other.id])
        for suffix in ('attendance','manual-payments'):
            response=client.get('/study/admin/editions/ledger-edition/'+suffix)
            assert response.status_code==(401 if role=='anonymous' else 403)
        if role!='anonymous':assert client.get('/study/me').status_code==200
    store.close()


@pytest.mark.parametrize('change',[{'amountMinor':True},{'amountMinor':10**1000},{'currency':'USD'},
    {'actorId':'forged-owner'},{'recordedAt':0},{'mode':'production'},{'externalReference':''}])
def test_manual_dto_rejects_forged_or_unbounded_values_without_any_record(tmp_path,change):
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens[tutor.id])
        body={'studentId':student.id,'amountMinor':4900,'currency':'EUR','externalReference':'reference',**change}
        response=client.post('/study/admin/editions/ledger-edition/manual-payments',json=body,headers={'Idempotency-Key':'invalid'})
        assert response.status_code==422
        assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
    store.close()


def test_missing_key_revocation_and_history_bounds_fail_before_mutation(tmp_path):
    store,tutor,student,other,tokens=seed(tmp_path)
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens[tutor.id])
        base='/study/admin/editions/ledger-edition'
        body={'studentId':student.id,'amountMinor':4900,'currency':'EUR','externalReference':'reference'}
        assert client.post(base+'/manual-payments',json=body).status_code==422
        assert client.get(base+'/manual-payments?limit=51').status_code==422
        assert client.get(base+'/manual-payments?after=invalid').status_code==422
        assert client.get(base+'/attendance/history').status_code==422
        store.revoke_session(client.cookies.get('study_session'))
        denied=client.post(base+'/manual-payments',json=body,headers={'Idempotency-Key':'rejected'})
        assert denied.status_code==401
        assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==0
    store.close()


def test_unconfigured_draft_register_is_explicitly_not_ready_without_fake_absences(tmp_path):
    store,tutor,student,other,tokens=seed(tmp_path)
    store.create_edition(tutor,'empty-draft')
    with TestClient(create_app(store.path,demo=True)) as client:
        login(client,tokens[tutor.id])
        result=client.get('/study/admin/editions/empty-draft/attendance')
        assert result.status_code==200
        assert result.json()['calendarReady'] is False
        assert result.json()['sessions']==result.json()['cells']==result.json()['roster']==[]
    store.close()


def test_tutor_ten_enrollments_two_interests_and_manual_registers_are_distinct_http_facts(tmp_path):
    store=StudyStore(tmp_path/'study.sqlite')
    tutor=store.create_principal('journey-tutor','teacher')
    students=[store.create_principal(f'journey-student-{i}','student') for i in range(11)]
    tutor_token=store.issue_session(tutor)
    student_tokens=[store.issue_session(s) for s in students]
    with TestClient(create_app(store.path,demo=True,auth_limit=100)) as client:
        login(client,tutor_token)
        create=client.post('/study/admin/editions',json={'packId':'relazioni-fluidi-v1','packVersion':1,'capacity':10,'priceMinor':4900},headers={'Idempotency-Key':'create'})
        assert create.status_code==200
        eid=create.json()['edition']['id'];base='/study/admin/editions/'+eid
        edited=client.patch(base,json={'expectedRevision':0,'capacity':10,'priceMinor':4900,
            'starts':[{'localStart':f'2025-01-{day:02}T18:00'} for day in (3,5,10,12)]},headers={'Idempotency-Key':'configure'})
        assert edited.status_code==200
        preview=client.post(base+'/offer/preview',json={'expectedRevision':1},headers={'Idempotency-Key':'preview'}).json()
        offered=client.post(base+'/offer/confirm',json={'expectedRevision':1,'previewId':preview['previewId'],
            'previewHash':preview['previewHash'],'confirmed':True},headers={'Idempotency-Key':'offer'})
        assert offered.status_code==200
        for i,token in enumerate(student_tokens[:10]):
            login(client,token)
            hold=client.post('/study/editions/'+eid+'/holds',headers={'Idempotency-Key':f'hold-{i}'})
            assert hold.status_code==200 and hold.json()['state']=='hold'
            confirm=client.post('/study/holds/'+hold.json()['id']+'/confirm',headers={'Idempotency-Key':f'confirm-{i}'})
            assert confirm.status_code==200 and confirm.json()['state']=='confirmed'
        login(client,student_tokens[10])
        assert client.post('/study/editions/'+eid+'/holds',headers={'Idempotency-Key':'eleventh'}).status_code==409
        for i in range(2):
            assert client.post('/study/interests',json={'editionId':eid,'contact':f'interest-{i}@example.invalid',
                'consent':True,'topic':'Fluidi','slots':['synthetic-past-dates']},headers={'Idempotency-Key':f'interest-{i}'}).status_code==200
        login(client,tutor_token)
        initial=client.get(base+'/attendance').json()
        assert initial['admission']=={'interestCount':2,'confirmedCount':10,'activeHoldCount':0,'waitlistedCount':1}
        assert len(initial['cells'])==40 and all(c['status']=='UNRECORDED' for c in initial['cells'])
        denied=client.post(base+'/manual-payments',json={'studentId':students[10].id,'amountMinor':4900,
            'currency':'EUR','externalReference':'not-enrolled'},headers={'Idempotency-Key':'not-enrolled'})
        assert denied.status_code==409 and denied.json()['error']=='member_required'
        first=None
        for i,person in enumerate(students[:10]):
            assert client.post(base+'/manual-payments',json={'studentId':person.id,'amountMinor':4900,'currency':'EUR',
                'externalReference':f'manual-synthetic-{i}'},headers={'Idempotency-Key':f'payment-{i}'}).status_code==200
            for j,session in enumerate(initial['sessions']):
                body={'studentId':person.id,'sessionId':session['sessionId'],'status':'ABSENT' if (i,j)==(0,0) else 'UNRECORDED' if (i,j)==(1,0) else 'PRESENT',
                      'expectedRevision':0,'expectedManagementRevision':initial['managementRevision']}
                result=client.post(base+'/attendance',json=body,headers={'Idempotency-Key':f'attendance-{i}-{j}'})
                assert result.status_code==200
                if (i,j)==(0,0):first=(body,result.json())
        body,ack=first
        correction=client.post(base+'/attendance',json={**body,'status':'PRESENT','expectedRevision':1,
            'targetRecordId':ack['recordId'],'reason':'Synthetic manual correction'},headers={'Idempotency-Key':'correct-first'})
        assert correction.status_code==200
        final=client.get(base+'/attendance').json()
        assert final['admission']==initial['admission']
        assert len(final['cells'])==40 and sum(c['status']=='UNRECORDED' for c in final['cells'])==1
        assert client.get(base+'/manual-payments').json()['summary']['totalMinor']==49000
        assert store.connection.execute('SELECT count(*) FROM study_attendance_records').fetchone()[0]==41
        assert store.connection.execute('SELECT count(*) FROM study_manual_payment_records').fetchone()[0]==10
        assert store.connection.execute("SELECT count(*) FROM study_events WHERE kind LIKE 'admin.%'").fetchone()[0]==0
    store.close()


def test_http_never_upgrades_schema4_and_operator_upgrade_is_separate(tmp_path):
    import sqlite3
    import hashlib
    store,tutor,student,other,tokens=seed(tmp_path)
    path=store.path;store.close()
    with sqlite3.connect(path) as c:
        c.execute('DROP TABLE study_attendance_records');c.execute('DROP TABLE study_manual_payment_records');c.execute('UPDATE study_schema SET version=4')
    before=hashlib.sha256(path.read_bytes()).hexdigest()
    files={p.name for p in tmp_path.iterdir()}
    with TestClient(create_app(path,demo=True)) as client:
        assert client.get('/study/health').status_code==200
        assert client.get('/study/admin/editions/ledger-edition/attendance').status_code==503
    assert hashlib.sha256(path.read_bytes()).hexdigest()==before
    assert {p.name for p in tmp_path.iterdir()}==files
    with sqlite3.connect(path) as c:
        assert c.execute('SELECT version FROM study_schema').fetchone()[0]==4
        assert not c.execute("SELECT 1 FROM sqlite_master WHERE name='study_attendance_records'").fetchone()
    operator=StudyStore(path)
    assert operator.connection.execute('SELECT version FROM study_schema').fetchone()[0]==CURRENT_SCHEMA
    operator.close()


def test_http_missing_database_does_not_create_database_or_parent(tmp_path):
    path=tmp_path/'never-created'/'study.sqlite'
    with TestClient(create_app(path,demo=True)) as client:
        assert client.get('/study/health').status_code==200
        response=client.get('/study/admin/editions/anything/attendance')
        assert response.status_code==503
    assert not path.exists() and not path.parent.exists()


def test_http_current_schema_emits_no_ddl(monkeypatch,tmp_path):
    import sqlite3,re
    store,tutor,student,other,tokens=seed(tmp_path);path=store.path;store.close()
    connect=sqlite3.connect;statements=[]
    def traced(*args,**kwargs):
        connection=connect(*args,**kwargs);connection.set_trace_callback(statements.append);return connection
    monkeypatch.setattr(sqlite3,'connect',traced)
    with TestClient(create_app(path,demo=True)) as client:
        login(client,tokens[tutor.id])
        assert client.get('/study/admin/editions/ledger-edition/attendance').status_code==200
    assert not [sql for sql in statements if re.match(r'\s*(CREATE|ALTER|DROP|REINDEX|VACUUM)\b',sql,re.I)]
    assert not [sql for sql in statements if re.match(r'\s*UPDATE study_schema\b',sql,re.I)]


@pytest.mark.parametrize('loss',['table','column','marker'])
def test_http_partial_or_unknown_schema_is_not_repaired(tmp_path,loss):
    import sqlite3,hashlib
    store,*_=seed(tmp_path);path=store.path;store.close()
    with sqlite3.connect(path) as c:
        if loss=='table':c.execute('DROP TABLE study_manual_payment_records')
        elif loss=='column':c.execute('ALTER TABLE study_manual_payment_records DROP COLUMN offer_snapshot')
        else:c.execute('UPDATE study_schema SET version=99')
    before=hashlib.sha256(path.read_bytes()).hexdigest();files={p.name for p in tmp_path.iterdir()}
    with TestClient(create_app(path,demo=True)) as client:
        assert client.get('/study/admin/editions/ledger-edition/attendance').status_code==503
    assert hashlib.sha256(path.read_bytes()).hexdigest()==before
    assert {p.name for p in tmp_path.iterdir()}==files


def test_startup_erasure_replay_does_not_silently_migrate_an_old_runtime(tmp_path):
    import sqlite3,hashlib,json
    store,tutor,student,*_=seed(tmp_path);path=store.path;store.close()
    with sqlite3.connect(path) as c:
        c.execute('DROP TABLE study_attendance_records');c.execute('DROP TABLE study_manual_payment_records');c.execute('UPDATE study_schema SET version=4')
    ledger=tmp_path/'erasure-ledger.json';ledger.write_text(json.dumps({'version':1,'actors':[student.id]}))
    before=hashlib.sha256(path.read_bytes()).hexdigest();before_ledger=ledger.read_bytes()
    with TestClient(create_app(path,demo=True)) as client:
        assert client.get('/study/health').status_code==200
        for _ in range(2):assert client.get('/study/course').status_code==503
    assert hashlib.sha256(path.read_bytes()).hexdigest()==before and ledger.read_bytes()==before_ledger
    # Explicit operator migration/replay remains required; the private HTTP
    # runtime never serves unreplayed personal facts after that startup failure.


def test_http_old_schema_post_recovery_is_503_not_an_unhandled_middleware_error(tmp_path):
    import sqlite3
    store,tutor,student,other,tokens=seed(tmp_path);path=store.path;store.close()
    with sqlite3.connect(path) as c:
        c.execute('DROP TABLE study_attendance_records');c.execute('DROP TABLE study_manual_payment_records');c.execute('UPDATE study_schema SET version=4')
    with TestClient(create_app(path,demo=True),raise_server_exceptions=False) as client:
        client.cookies.set('study_session',tokens[tutor.id],domain='testserver.local',path='/')
        denied=client.post('/study/session',json={'token':'invalid-body'})
        assert denied.status_code==503
        assert 'set-cookie' not in denied.headers
        assert client.cookies.get('study_session')==tokens[tutor.id]
        logout=client.delete('/study/session')
        assert logout.status_code==503
        assert logout.json()['serverRevocation']=='UNCONFIRMED'
        assert client.cookies.get('study_session') is None
