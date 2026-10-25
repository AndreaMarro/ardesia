"""Live adapter contracts. Explicitly opt in to the isolated local Supabase DB.

No alternate domain implementation: the same StudyStore methods and commands
must work against PostgreSQL, including atomic capacity and source receipts.
"""
import json
import os
from pathlib import Path
import shlex
import uuid
from concurrent.futures import ThreadPoolExecutor

import pytest

from lessonos.study.models import StudyError
from lessonos.study.submissions import submit
from lessonos.study.feedback import propose_feedback, review_feedback
from lessonos.study.context import retrieve_context


def api_request(configuration, method, path, *, body=None, token=None, admin=False):
    import urllib.error
    import urllib.request
    key = configuration['SERVICE_ROLE_KEY'] if admin else configuration['ANON_KEY']
    headers = {'apikey': key, 'Content-Type': 'application/json'}
    if token or admin:
        headers['Authorization'] = 'Bearer ' + (token or key)
    request = urllib.request.Request(configuration['API_URL'] + path, method=method,
        headers=headers, data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            data = response.read()
            return response.status, json.loads(data) if data else None
    except urllib.error.HTTPError as error:
        return error.code, json.loads(error.read())


@pytest.fixture
def identities(pg_store, pg_configuration):
    import base64
    actors = seed(pg_store)
    sessions = []
    for actor in actors[:3]:
        password = uuid.uuid4().hex + 'X!7'
        email = uuid.uuid4().hex + '@example.invalid'
        status, user = api_request(pg_configuration, 'POST', '/auth/v1/admin/users', admin=True,
            body={'email': email, 'password': password, 'email_confirm': True})
        assert status == 200, 'local Auth fixture creation failed'
        status, session = api_request(pg_configuration, 'POST', '/auth/v1/token?grant_type=password',
            body={'email': email, 'password': password})
        assert status == 200, 'local Auth fixture login failed'
        claims = json.loads(base64.urlsafe_b64decode(session['access_token'].split('.')[1] + '=='))
        pg_store.connection.execute('INSERT INTO ardesia_private.identities VALUES(?,?)', (user['id'], actor.id))
        sessions.append({'actor': actor, 'userId': user['id'], 'sessionId': claims['session_id'], 'token': session['access_token']})
    try:
        yield actors, sessions
    finally:
        for session in sessions:
            api_request(pg_configuration, 'DELETE', '/auth/v1/admin/users/' + session['userId'], admin=True)


@pytest.fixture(scope='module')
def pg_configuration():
    supplied = os.getenv('ARDESIA_SUPABASE_ENV_FILE')
    if not supplied:
        pytest.skip('live local Supabase contract: ARDESIA_SUPABASE_ENV_FILE not supplied')
    class PrivateConfiguration(dict):
        def __repr__(self):
            return '<local Supabase configuration redacted>'
    values = PrivateConfiguration()
    for line in Path(supplied).read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            values[key] = shlex.split(value)[0] if value else ''
    return values


@pytest.fixture
def pg_store(pg_configuration, tmp_path):
    from lessonos.study.postgres import PostgresStudyStore, migrate
    migrate(pg_configuration['DB_URL'])
    store = PostgresStudyStore(pg_configuration['DB_URL'], tmp_path, administrative=True)
    yield store
    store.close()


def seed(store):
    tag = uuid.uuid4().hex[:12]
    tutor = store.create_principal('tutor-' + tag, 'teacher')
    student = store.create_principal('student-' + tag, 'student')
    peer = store.create_principal('peer-' + tag, 'student')
    edition = 'edition-' + tag
    store.create_edition(tutor, edition)
    store.add_test_member(tutor, edition, student.id)
    store.add_test_member(tutor, edition, peer.id)
    return tutor, student, peer, edition


def test_postgres_runs_shared_submission_review_and_context(pg_store):
    tutor, student, peer, edition = seed(pg_store)
    source = pg_store.create_resource(student, edition, 'notes', 'La portata segue il quadrato.')
    with pytest.raises(StudyError, match='forbidden'):
        pg_store.get_resource(tutor, source['id'])
    receipt = submit(pg_store, student, edition, 'poiseuille-v1', [], source['text'], 'submit',
        source_refs=[{'resourceId': source['id'], 'revisionId': source['revisionId']}])
    assert submit(pg_store, student, edition, 'poiseuille-v1', [], source['text'], 'submit',
        source_refs=[{'resourceId': source['id'], 'revisionId': source['revisionId']}]) == receipt
    assert pg_store.get_resource(tutor, source['id'])['text'] == source['text']
    with pytest.raises(StudyError, match='forbidden'):
        pg_store.get_resource(peer, source['id'])
    candidate = propose_feedback(pg_store, tutor, receipt['submissionId'])
    review_feedback(pg_store, tutor, candidate['id'], 1,
        'La portata segue la quarta potenza a pressione fissata.', 'review')
    context = retrieve_context(pg_store, student, source['contextId'], 'quarta')
    assert len(context['observations']) == 1
    assert context['observations'][0]['evidence']['submissionId'] == receipt['submissionId']


def test_postgres_capacity_is_atomic_between_connections(pg_store, pg_configuration, tmp_path):
    from lessonos.study.postgres import PostgresStudyStore
    tutor, student, peer, edition = seed(pg_store)
    for index in range(7):
        actor = pg_store.create_principal(f'seat-{edition}-{index}', 'student')
        pg_store.add_test_member(tutor, edition, actor.id)
    candidates = [pg_store.create_principal(f'last-{edition}-{index}', 'student') for index in range(2)]
    def enroll(actor):
        store = PostgresStudyStore(pg_configuration['DB_URL'], tmp_path, administrative=True)
        try:
            store.add_test_member(tutor, edition, actor.id)
            return 'confirmed'
        except StudyError as exc:
            return exc.code
        finally:
            store.close()
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(enroll, candidates))
    assert sorted(results) == ['confirmed', 'group_full']
    assert pg_store.connection.execute('SELECT COUNT(*) FROM study_members WHERE edition_id=?', (edition,)).fetchone()[0] == 10
    import psycopg
    excluded = next(actor for actor in candidates if not pg_store.connection.execute(
        'SELECT 1 FROM study_members WHERE edition_id=? AND student_id=?', (edition, actor.id)).fetchone())
    with pytest.raises(psycopg.errors.CheckViolation):
        pg_store.connection.execute('INSERT INTO study_members VALUES(?,?)', (edition, excluded.id))


def test_sql_adapter_preserves_quoted_question_marks_and_json_path():
    from lessonos.study.postgres import postgres_sql
    assert postgres_sql("SELECT '?' AS quoted, text FROM notes WHERE id=?") == "SELECT '?' AS quoted, text FROM notes WHERE id=%s"
    assert postgres_sql("SELECT json_extract(payload,'$.receiptId') FROM study_events WHERE id=?") == "SELECT (payload::jsonb ->> 'receiptId') FROM study_events WHERE id=%s"


def test_auth_rls_exact_revision_and_revocation(pg_store, pg_configuration, identities, tmp_path):
    from lessonos.study.postgres import PostgresStudyStore
    from lessonos.study.context import revise_resource
    actors, sessions = identities
    tutor, student, peer, edition = actors
    source = pg_store.create_resource(student, edition, 'notes', 'Originale privato della prima versione.')
    def connect(index):
        session = sessions[index]
        return PostgresStudyStore(pg_configuration['DB_URL'], tmp_path,
            auth_user_id=session['userId'], auth_session_id=session['sessionId'])
    for index, expected in ((0, 0), (1, 1), (2, 0)):
        store = connect(index)
        assert store.connection.execute('SELECT COUNT(*) FROM study_revisions WHERE resource_id=?', (source['id'],)).fetchone()[0] == expected
        store.close()
    user_store = connect(1)
    submit(user_store, student, edition, 'poiseuille-v1', [], source['text'], 'commit',
        source_refs=[{'resourceId': source['id'], 'revisionId': source['revisionId']}])
    newer = revise_resource(user_store, student, source['id'], source['revisionId'], 'Bozza successiva non consegnata.')
    user_store.close()
    tutor_store = connect(0)
    assert tutor_store.get_resource_revision(tutor, source['id'], source['revisionId'])['text'] == source['text']
    assert tutor_store.connection.execute('SELECT text FROM study_revisions WHERE id=?', (newer['revisionId'],)).fetchone() is None
    historical=retrieve_context(tutor_store,tutor,source['contextId'],'',resource_id=source['id'],revision_id=source['revisionId'])
    assert historical['sourceState']=='HISTORICAL' and historical['resource']['text']==source['text']
    assert newer['revisionId'] not in str(historical) and 'Bozza successiva' not in str(historical)
    tutor_store.close()
    path = '/rest/v1/study_revisions?resource_id=eq.' + source['id'] + '&select=id,text'
    status, visible = api_request(pg_configuration, 'GET', path, token=sessions[0]['token'])
    assert status == 200 and len(visible) == 1 and visible[0]['text'] == source['text']
    status, visible = api_request(pg_configuration, 'GET', path, token=sessions[2]['token'])
    assert status == 200 and visible == []

    status, _ = api_request(pg_configuration, 'POST', '/rest/v1/study_resources', token=sessions[1]['token'],
        body={'id': 'forged', 'owner_id': peer.id})
    assert status == 403
    # Existing JWTs cease granting database access as soon as membership ends.
    pg_store.connection.execute('DELETE FROM study_members WHERE edition_id=? AND student_id=?', (edition, student.id))
    status, visible = api_request(pg_configuration, 'GET', path, token=sessions[1]['token'])
    assert status == 200 and visible == []


def test_real_auth_runtime_http_uses_the_same_core_and_rejects_revoked_jwt(pg_store, pg_configuration, identities, tmp_path):
    from fastapi.testclient import TestClient
    from study_api.app import create_app
    from study_api.runtime import SupabaseRuntime
    actors, sessions = identities
    tutor, student, peer, edition = actors
    app = create_app(tmp_path / 'postgres.lock', demo=True,
        runtime=SupabaseRuntime(pg_configuration, tmp_path))
    with TestClient(app) as client:
        assert client.get('/study/me').status_code == 401
        # Login and logout recover without requiring a still-valid old cookie.
        recovered = client.post('/study/session', json={'token': sessions[1]['token']},
            headers={'Cookie': 'study_session=expired-or-invalid'})
        assert recovered.status_code == 200
        assert client.get('/study/me', headers={'Cookie': 'study_session=expired-or-invalid'}).status_code == 401
        cleared = client.delete('/study/session', headers={'Cookie': 'study_session=expired-or-invalid'})
        assert cleared.status_code == 200 and 'Max-Age=0' in cleared.headers['set-cookie']
        response = client.post('/study/session', json={'token': sessions[1]['token']})
        assert response.status_code == 200 and response.json()['id'] == student.id
        source = client.post('/study/resources', json={'editionId': edition, 'text': 'Originale HTTP PostgreSQL.'}).json()
        assert source['ownerId'] == student.id
        client.post('/study/session', json={'token': sessions[0]['token']})
        assert client.get('/study/resources/' + source['id']).status_code in (403, 404)
        client.post('/study/session', json={'token': sessions[1]['token']})
        response = client.post('/study/submissions', headers={'Idempotency-Key': 'http-pg-submit'},
            json={'editionId': edition, 'activityId': 'poiseuille-v1', 'text': source['text'],
                  'sourceRefs': [{'resourceId': source['id'], 'revisionId': source['revisionId']}]})
        assert response.status_code == 200 and response.json()['submissionId']
        client.post('/study/session', json={'token': sessions[0]['token']})
        assert client.get('/study/resources/' + source['id']).json()['text'] == source['text']
        client.post('/study/session', json={'token': sessions[2]['token']})
        assert client.get('/study/resources/' + source['id']).status_code in (403, 404)
        assert client.delete('/study/session').status_code == 200
        # Replaying a signed, unexpired access token after logout is forbidden.
        assert client.post('/study/session', json={'token': sessions[2]['token']}).status_code == 401


def test_anonymous_interest_uses_shared_validation_and_a_private_persisted_receipt(pg_store, pg_configuration, tmp_path):
    from fastapi.testclient import TestClient
    from study_api.app import create_app
    from study_api.runtime import SupabaseRuntime
    tutor, student, peer, edition = seed(pg_store)
    app = create_app(tmp_path / 'postgres.lock', demo=True, runtime=SupabaseRuntime(pg_configuration, tmp_path))
    key = uuid.uuid4().hex
    payload = {'editionId': edition, 'contact': 'volontario@example.invalid',
               'topic': 'Fisica', 'slots': ['martedì sera'], 'consent': True}
    with TestClient(app) as client:
        first = client.post('/study/interests', json=payload, headers={'Idempotency-Key': key})
        assert first.status_code == 200
        assert client.post('/study/interests', json=payload, headers={'Idempotency-Key': key}).json() == first.json()
        assert client.get('/study/interests?editionId=' + edition).status_code == 401
    assert pg_store.connection.execute('SELECT COUNT(*) FROM study_interests WHERE request_key=?', (key,)).fetchone()[0] == 1


def test_private_original_storage_reuses_core_validation_and_submission_policy(pg_store, pg_configuration, identities, tmp_path):
    from io import BytesIO
    from PIL import Image
    from lessonos.study.assets import upload_asset, read_asset
    from study_api.runtime import SupabaseRuntime
    actors, sessions = identities
    tutor, student, peer, edition = actors
    runtime = SupabaseRuntime(pg_configuration, tmp_path)
    image = BytesIO()
    Image.new('RGB', (3, 3), '#abcdef').save(image, format='PNG')
    data = image.getvalue()
    student_store = runtime.open(sessions[1]['token'])
    tutor_store = runtime.open(sessions[0]['token'])
    peer_store = runtime.open(sessions[2]['token'])
    asset = None
    try:
        asset = upload_asset(student_store, student, edition, data, 'image/png', tmp_path / 'blobs')
        # This explicitly checks the real private Storage service, not local disk.
        assert student_store.blobs.get(asset['id']) == data
        assert not (tmp_path / 'blobs' / asset['id']).exists()
        with pytest.raises(StudyError):
            read_asset(tutor_store, tutor, asset['id'], tmp_path / 'blobs')
        submit(student_store, student, edition, 'poiseuille-v1', [asset['id']], 'Spiegazione allegata.', 'image-submit')
        assert read_asset(tutor_store, tutor, asset['id'], tmp_path / 'blobs') == (data, 'image/png')
        with pytest.raises(StudyError):
            read_asset(peer_store, peer, asset['id'], tmp_path / 'blobs')
    finally:
        if asset:
            student_store.blobs.remove(asset['id'])
        for store in (student_store, tutor_store, peer_store):
            store.close()


def test_error_diary_transfer_is_shared_on_authenticated_postgres(pg_store, pg_configuration, identities, tmp_path):
    from lessonos.study import diary
    from study_api.runtime import SupabaseRuntime
    actors, sessions = identities
    tutor, student, peer, edition = actors
    runtime = SupabaseRuntime(pg_configuration, tmp_path)
    tutor_store = runtime.open(sessions[0]['token'])
    student_store = runtime.open(sessions[1]['token'])
    peer_store = runtime.open(sessions[2]['token'])
    try:
        original = submit(student_store, student, edition, 'poiseuille-v1', [], 'Q cresce come r².', 'original')
        ref = json.loads(student_store.connection.execute('SELECT source_refs FROM study_submissions WHERE id=?',
            (original['submissionId'],)).fetchone()[0])[0]
        anchor = {**ref, 'start': 0, 'end': len('Q cresce come r².'), 'quote': 'Q cresce come r².'}
        proposed = diary.propose_error(tutor_store, tutor, original['submissionId'], 'radius-power', 'model_selection', anchor, 'propose')
        thread_id = proposed['threadId']
        diary.confirm_error(tutor_store, tutor, thread_id, {'criterion': 'Quarta potenza', 'procedureRequired': True},
            'La dipendenza è dalla quarta potenza.', 'Cambia il raggio e spiega il procedimento.', 'confirm',
            transfer_exercise={'exerciseId': 'transfer-pg', 'originalParameters': {'radiusRatio': 1.5},
                'parameters': {'radiusRatio': 2}, 'prompt': 'Raddoppia il raggio a pressione fissata.'})
        transfer = submit(student_store, student, edition, 'transfer-pg', [],
            'A pressione fissata la quarta potenza dà 2^4 = 16.', 'transfer')
        current = diary.record_practice(student_store, student, thread_id, transfer['submissionId'],
            'transfer-pg', {'radiusRatio': 2}, 'practice')
        diary.verify_transfer(tutor_store, tutor, thread_id, current['attempts'][-1]['attemptId'],
            {'criterion': 'Quarta potenza', 'procedureQuote': 'la quarta potenza dà 2^4 = 16',
             'reasoning': 'La procedura rispetta il vincolo di pressione.',
             'variationReason': 'Il raggio cambia rispetto al primo problema.'}, 'verify')
        assert diary.get_thread(student_store, student, thread_id)['status'] == 'VERIFIED_RESOLVED'
        with pytest.raises(StudyError):
            diary.get_thread(peer_store, peer, thread_id)
    finally:
        for store in (tutor_store, student_store, peer_store):
            store.close()


def test_postgres_storage_failed_compensation_survives_and_is_recoverable(identities, pg_store, pg_configuration, tmp_path):
    from lessonos.study.assets import upload_asset
    from lessonos.study.uploads import recover_uploads
    from study_api.runtime import SupabaseRuntime, SupabaseBlobs
    from test_upload_recovery import png, reject_metadata
    actors, sessions = identities
    tutor, student, peer, edition = actors
    runtime = SupabaseRuntime(pg_configuration, tmp_path)
    store = runtime.open(sessions[1]['token'])
    actual_blobs = store.blobs

    class FailedCleanup:
        is_local = False

        def put(self, blob_id, data, mime):
            actual_blobs.put(blob_id, data, mime)

        def remove(self, blob_id):
            raise OSError('synthetic cleanup transport failure')

    store.blobs = FailedCleanup()
    original = reject_metadata(store)
    try:
        with pytest.raises(RuntimeError, match='synthetic metadata failure'):
            upload_asset(store, student, edition, png(), 'image/png', tmp_path / 'blobs')
        store.transaction = original
        intent = store.connection.execute('SELECT * FROM study_upload_intents WHERE owner_id=?', (student.id,)).fetchone()
        assert intent['state'] == 'cleanup_required'
        assert pg_store.connection.execute('SELECT COUNT(*) FROM study_assets WHERE id=?', (intent['id'],)).fetchone()[0] == 0
        assert pg_store.connection.execute("SELECT COUNT(*) FROM storage.objects WHERE bucket_id='ardesia-originals' AND name=?", (intent['id'],)).fetchone()[0] == 1
        # A browser cannot enumerate intent or create an untracked arbitrary blob.
        status, _ = api_request(pg_configuration, 'GET', '/rest/v1/study_upload_intents?select=id', token=sessions[1]['token'])
        assert status in (401, 403)
        with pytest.raises(StudyError, match='provider_unavailable'):
            actual_blobs.put(uuid.uuid4().hex, png(), 'image/png')
        with pytest.raises(StudyError, match='forbidden'):
            recover_uploads(store, actual_blobs)
        counts = recover_uploads(pg_store, SupabaseBlobs(runtime, ''))
        assert counts['cleaned'] >= 1 and counts['failed'] == 0
        assert pg_store.connection.execute('SELECT COUNT(*) FROM study_upload_intents WHERE id=?', (intent['id'],)).fetchone()[0] == 0
        assert pg_store.connection.execute("SELECT COUNT(*) FROM storage.objects WHERE bucket_id='ardesia-originals' AND name=?", (intent['id'],)).fetchone()[0] == 0
    finally:
        store.close()


def test_real_http_upload_idempotency_keeps_one_private_original(identities, pg_store, pg_configuration, tmp_path):
    from fastapi.testclient import TestClient
    from study_api.app import create_app
    from study_api.runtime import SupabaseRuntime
    from test_upload_recovery import png
    actors, sessions = identities
    tutor, student, peer, edition = actors
    app = create_app(tmp_path / 'postgres.lock', demo=True, runtime=SupabaseRuntime(pg_configuration, tmp_path))
    with TestClient(app) as client:
        assert client.post('/study/session', json={'token': sessions[1]['token']}).status_code == 200
        missing=client.post('/study/assets?editionId='+edition,content=png(),headers={'Content-Type':'image/png'})
        assert missing.status_code==422 and missing.json()=={'error':'idempotency_key_required'}
        assert pg_store.connection.execute('SELECT COUNT(*) FROM study_assets WHERE owner_id=?',(student.id,)).fetchone()[0]==0
        headers = {'Content-Type': 'image/png', 'Idempotency-Key': 'lost-upload-response'}
        first = client.post('/study/assets?editionId=' + edition, content=png(), headers=headers)
        assert first.status_code == 200
        replay = client.post('/study/assets?editionId=' + edition, content=png(), headers=headers)
        assert replay.status_code == 200 and replay.json() == first.json()
        assert pg_store.connection.execute('SELECT COUNT(*) FROM study_assets WHERE owner_id=?', (student.id,)).fetchone()[0] == 1
        assert pg_store.connection.execute("SELECT COUNT(*) FROM storage.objects WHERE bucket_id='ardesia-originals' AND name=?", (first.json()['id'],)).fetchone()[0] == 1
        assert client.post('/study/session', json={'token': sessions[2]['token']}).status_code == 200
        denied = client.get('/study/assets/' + first.json()['id'])
        assert denied.status_code == 404  # RLS conceals existence before Core lookup.
        assert denied.json() == {'error':'not_found'}
