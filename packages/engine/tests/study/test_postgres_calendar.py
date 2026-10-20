"""Opt-in only: root applies migration10 and runs real Auth/RLS contracts."""
import pytest
import json
from test_postgres_contract import pg_configuration,pg_store,identities,api_request
from lessonos.study.calendar import preview_schedule,confirm_schedule,get_ics
from lessonos.study.calendar_mock import MockCalendar
from test_calendar_time import dates


def test_postgres_calendar_ownership_published_ics_and_projection_mutation_rls(pg_store,pg_configuration,identities,tmp_path):
    import psycopg
    from lessonos.study.postgres import PostgresStudyStore
    actors,sessions=identities
    tutor,student,peer,edition=actors
    # The fixture's canonical roster is intentionally stable. Dates are setup
    # administration here, not a new public scheduling API or external import.
    pg_store.connection.execute('UPDATE study_editions SET sessions=? WHERE id=?',(json.dumps(dates()),edition))
    stores=[PostgresStudyStore(pg_configuration['DB_URL'],tmp_path,auth_user_id=session['userId'],auth_session_id=session['sessionId']) for session in sessions]
    try:
        teacher=stores[0];intent=preview_schedule(teacher,tutor,edition,'ics','pg-preview')
        confirm_schedule(teacher,tutor,edition,intent['previewId'],intent['previewHash'],intent['sourceVersion'],True,'pg-confirm',MockCalendar())
        assert get_ics(stores[1],student,edition,intent['previewId']).count(b'BEGIN:VEVENT')==4
        # A member can read the published ICS, but cannot mutate even that
        # target's adapter state through a directly bound backend connection.
        target=intent['plan']['targetId']
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            stores[1].connection.execute('INSERT INTO study_calendar_mappings(target_id,session_id,event_id) VALUES(?,?,?)',(target,'0'*32,'1'*32))
        mock=preview_schedule(teacher,tutor,edition,'mock','pg-mock')
        assert stores[1].connection.execute('SELECT 1 FROM study_calendar_targets WHERE id=?',(mock['plan']['targetId'],)).fetchone() is None
        status,_=api_request(pg_configuration,'GET','/rest/v1/study_calendar_intents?select=id',token=sessions[1]['token'])
        assert status in (401,403)
    finally:
        for store in stores:store.close()
