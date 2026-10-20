"""Deferred live contract: opt in only after root integrates the new migration.

Default unit runs skip before migration/connection creation. Never run on shared
G0 PostgreSQL during a frozen candidate QA run.
"""
import pytest
from test_postgres_contract import pg_configuration, pg_store, identities, api_request
from lessonos.study.submissions import submit
from lessonos.study.models import StudyError


def test_postgres_pack_pin_is_private_to_backend_and_immutable_to_app(pg_store,pg_configuration,identities,tmp_path):
    import psycopg
    from lessonos.study.postgres import PostgresStudyStore
    actors,sessions=identities
    tutor,student,peer,physics_edition=actors
    edition='analysis-'+physics_edition
    pg_store.create_edition(tutor,edition,course_id='analisi-1',pack_id='taylor-exp-v1')
    pg_store.add_test_member(tutor,edition,student.id)
    store=PostgresStudyStore(pg_configuration['DB_URL'],tmp_path,
        auth_user_id=sessions[1]['userId'],auth_session_id=sessions[1]['sessionId'])
    try:
        receipt=submit(store,student,edition,'taylor-exp-v1',[],'Grado, fattoriale e resto.','analysis',
            activity_parameters={'x':.5,'degree':3})
        assert receipt['courseContext']['packId']=='taylor-exp-v1'
        with pytest.raises(StudyError,match='activity_not_assigned'):
            submit(store,student,edition,'poiseuille-v1',[],'Wrong pack','wrong-pack')
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            store.connection.execute('UPDATE study_edition_packs SET pack_version=2 WHERE edition_id=?',(edition,))
        status,_=api_request(pg_configuration,'GET','/rest/v1/study_edition_packs?select=edition_id',token=sessions[1]['token'])
        assert status in (401,403)
        # Even a backend actor cannot forge a binding for somebody else's edition.
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            store.connection.execute('INSERT INTO study_edition_packs VALUES(?,?,?,?,?)',
                ('not-owned','analisi-1','taylor-exp-v1',1,'0'*64))
    finally:
        store.close()
