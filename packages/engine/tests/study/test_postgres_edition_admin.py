"""Root opt-in after backup/migration11; never run against the shared PG by this builder."""
import pytest
from test_postgres_contract import pg_configuration,pg_store,identities,api_request
from lessonos.study import editions
from lessonos.study.groups import reserve_seat


def test_pg_management_anonymous_schema_guard_owner_write_and_student_row_lock(pg_store,pg_configuration,identities,tmp_path):
    import psycopg
    from lessonos.study.postgres import PostgresStudyStore
    actors,sessions=identities
    tutor,student,peer,_=actors
    anonymous=PostgresStudyStore(pg_configuration['DB_URL'],tmp_path/'anon')
    stores=[PostgresStudyStore(pg_configuration['DB_URL'],tmp_path/str(index),
        auth_user_id=session['userId'],auth_session_id=session['sessionId']) for index,session in enumerate(sessions)]
    try:
        assert anonymous.connection.execute('SELECT version FROM study_schema').fetchone()[0]==4
        teacher=stores[0]
        edition=editions.create_draft(teacher,tutor,'taylor-exp-v1',1,10,3900,'pg-management-create')['edition']
        eid=edition['id']
        # A private draft must not leak through the trusted backend's anonymous
        # SQL path or the SECURITY DEFINER public catalog projection.
        assert teacher.connection.execute('SELECT id FROM study_editions WHERE id=?',(eid,)).fetchone()[0]==eid
        assert teacher.connection.execute('SELECT ardesia_private.catalog(?)',(eid,)).fetchone()[0]['id']==eid
        for unentitled in (anonymous,stores[1],stores[2]):
            assert unentitled.connection.execute('SELECT id FROM study_editions WHERE id=?',(eid,)).fetchone() is None
            assert unentitled.connection.execute('SELECT edition_id FROM study_edition_packs WHERE edition_id=?',(eid,)).fetchone() is None
            assert unentitled.connection.execute('SELECT ardesia_private.catalog(?)',(eid,)).fetchone()[0] is None
        dates=[{'localStart':f'2027-04-{day:02}T18:00'} for day in (3,5,10,12)]
        editions.edit_draft(teacher,tutor,eid,'pg-management-configure',revision=0,capacity=10,price_minor=3900,starts=dates)
        preview=editions.preview_offer(teacher,tutor,eid,'pg-management-preview',revision=1)
        offered=editions.offer_edition(teacher,tutor,eid,'pg-management-offer',confirmed=True,
            preview_id=preview['previewId'],preview_hash=preview['previewHash'],revision=1)
        assert offered['edition']['managementRevision']==2
        # Restricting edition mutation must not accidentally deny a student's
        # existing SELECT FOR UPDATE used by the seat command.
        hold=reserve_seat(stores[1],student,eid,'pg-management-hold',stores[1].clock())
        assert hold['state']=='hold'
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            stores[1].connection.execute('UPDATE study_editions SET capacity=9 WHERE id=?',(eid,))
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            stores[2].connection.execute('UPDATE study_editions SET state=? WHERE id=?',('offered',eid))
        status,_=api_request(pg_configuration,'GET','/rest/v1/study_schema?select=version',token=sessions[1]['token'])
        assert status in (401,403)
        # An anonymous backend can serve the public catalog after migration,
        # but cannot bypass owner mutation with an empty Auth context.
        assert anonymous.connection.execute('SELECT ardesia_private.catalog(?)',(eid,)).fetchone() is not None
        assert anonymous.connection.execute('UPDATE study_editions SET state=? WHERE id=?',('offered',eid)).rowcount==0
    finally:
        anonymous.close()
        for store in stores:store.close()
