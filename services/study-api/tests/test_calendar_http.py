from fastapi.testclient import TestClient
from study_api.app import create_app
from lessonos.study.store import StudyStore
from lessonos.study.groups import configure_sessions
from lessonos.study.calendar_mock import MockCalendar


def test_calendar_http_teacher_confirm_member_ics_and_mock_lost_ack(tmp_path):
    store=StudyStore(tmp_path/'calendar.sqlite')
    tutor=store.create_principal('tutor-calendar','teacher');student=store.create_principal('student-calendar','student')
    peer=store.create_principal('student-peer','student');other=store.create_principal('tutor-other','teacher')
    store.create_edition(tutor,'dates')
    dates=[{'start':f'2026-11-{day:02}T18:00:00+01:00','end':f'2026-11-{day:02}T19:30:00+01:00'} for day in [3,5,10,12]]
    configure_sessions(store,tutor,'dates',dates);store.add_test_member(tutor,'dates',student.id)
    mock=MockCalendar()
    with TestClient(create_app(store.path,demo=True,calendar_provider=mock)) as client:
        assert client.get('/study/calendar/capabilities').status_code==401
        client.post('/study/session',json={'token':store.issue_session(tutor)})
        caps=client.get('/study/calendar/capabilities').json()
        assert caps['google']=='NOT_CONFIGURED' and caps['mock']=='IN_PROCESS_TEST_DOUBLE'
        assert client.post('/study/calendar/preview',json={'editionId':'dates','provider':'google'},headers={'Idempotency-Key':'google'}).status_code==501
        assert client.post('/study/calendar/preview',json={'editionId':'dates','provider':'ics','sessions':dates},headers={'Idempotency-Key':'inject'}).status_code==422
        for provider in ('ics','mock'):
            preview=client.post('/study/calendar/preview',json={'editionId':'dates','provider':provider},headers={'Idempotency-Key':'preview-'+provider})
            assert preview.status_code==200
            plan=preview.json();body={key:plan[key] for key in ('previewId','previewHash','sourceVersion')};body|={'editionId':'dates','confirmed':True}
            if provider=='mock':
                mock.lose_next_ack=True
                assert client.post('/study/calendar/confirm',json=body,headers={'Idempotency-Key':'confirm-mock'}).status_code==503
            response=client.post('/study/calendar/confirm',json=body,headers={'Idempotency-Key':'confirm-'+provider})
            assert response.status_code==200 and response.json()['state']=='published'
            assert client.post('/study/calendar/confirm',json=body,headers={'Idempotency-Key':'confirm-'+provider}).json()==response.json()
            if provider=='ics':ics_plan=plan
        assert sum(map(len,mock.events.values()))==4
        for actor,status in ((student,200),(peer,403),(other,403)):
            client.post('/study/session',json={'token':store.issue_session(actor)})
            response=client.get('/study/calendar/ics',params={'editionId':'dates','previewId':ics_plan['previewId']})
            assert response.status_code==status
            if status==200:assert response.content.count(b'BEGIN:VEVENT')==4 and b'ATTENDEE' not in response.content
            assert client.post('/study/calendar/preview',json={'editionId':'dates','provider':'ics'},headers={'Idempotency-Key':'foreign'}).status_code==403
    assert store.get_edition('dates')['sessions']==dates
    store.close()
