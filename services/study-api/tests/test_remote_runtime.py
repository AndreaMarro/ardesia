"""Hermetic controlled-remote boundary proofs; no real credentials or network."""
import asyncio
import base64
import json
import urllib.error
from types import SimpleNamespace

import httpx
import pytest
from fastapi.testclient import TestClient

from lessonos.study.models import StudyError
from study_api.app import create_app
from study_api.remote import MODE, PROJECT_REF, RemoteSupabaseRuntime, create_remote_app, _NoRedirect
from study_api.runtime import SupabaseBlobs, SupabaseRuntime
from test_admission_http import FakeRuntime
from test_body_admission_http import Exchange

ORIGIN = 'https://core.example.test'
PASSWORD = 'synthetic-password-only'


def configuration(**changes):
    return {'MODE': MODE, 'API_URL': f'https://{PROJECT_REF}.supabase.co',
            'DB_URL': f'postgresql://ardesia_runtime.{PROJECT_REF}:synthetic@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require',
            'ANON_KEY': 'synthetic-public-key', 'APP_ORIGINS': ORIGIN,
            'RELEASE_SHA': 'a' * 40, **changes}


def app_with_fake(tmp_path, monkeypatch, *, boundary=None, **options):
    runtime = RemoteSupabaseRuntime(configuration(), tmp_path)
    fake = FakeRuntime(boundary)
    monkeypatch.setattr(runtime, 'open', fake.open)
    monkeypatch.setattr(runtime, 'principal', fake.principal)
    monkeypatch.setattr(runtime, 'request', fake.request)
    attempts = []
    def password_token(email, password):
        attempts.append((email, password))
        if password != PASSWORD:
            raise StudyError('unauthenticated', 401)
        return 'valid'
    monkeypatch.setattr(runtime, 'password_token', password_token)
    app = create_app(tmp_path / 'unused.sqlite', demo=True, runtime=runtime,
                     secure_cookies=True, **options)
    return app, runtime, fake, attempts


@pytest.mark.parametrize('changes', [
    {'MODE': ''}, {'MODE': 'production'}, {'API_URL': 'http://' + PROJECT_REF + '.supabase.co'},
    {'API_URL': 'https://other.supabase.co'}, {'API_URL': 'https://' + PROJECT_REF + '.supabase.co/'},
    {'RELEASE_SHA': ''}, {'RELEASE_SHA': 'a' * 39}, {'RELEASE_SHA': 'not-a-sha'},
    {'ANON_KEY': ''}, {'APP_ORIGINS': ''}, {'APP_ORIGINS': 'http://core.example.test'},
    {'APP_ORIGINS': 'https://*.example.test'}, {'APP_ORIGINS': ORIGIN + '/'},
    {'APP_ORIGINS': ORIGIN + '/path'}, {'APP_ORIGINS': ORIGIN + '?next=evil'},
    {'APP_ORIGINS': ORIGIN + '#fragment'}, {'APP_ORIGINS': 'https://user@core.example.test'},
    {'APP_ORIGINS': 'https://127.0.0.1'}, {'APP_ORIGINS': 'https://localhost'},
    {'APP_ORIGINS': 'https://core.example.test:8443'},
    {'DB_URL': 'postgresql://ardesia_runtime:synthetic@localhost/postgres?sslmode=require'},
    {'DB_URL': f'postgresql://ardesia_runtime.{PROJECT_REF}:synthetic@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require'},
    {'DB_URL': f'postgresql://postgres:synthetic@db.{PROJECT_REF}.supabase.co/postgres?sslmode=require'},
    {'DB_URL': f'postgresql://ardesia_runtime:synthetic@db.{PROJECT_REF}.supabase.co/postgres?sslmode=disable'},
    {'DB_URL': f'postgresql://ardesia_runtime.wrong:synthetic@aws-1-eu-central-1.pooler.supabase.com/postgres?sslmode=require'},
    {'DB_URL': f'postgresql://ardesia_runtime.{PROJECT_REF}:synthetic@aws-0-eu-west-1.pooler.supabase.com/postgres?sslmode=require'},
    {'DB_URL': f'postgresql://ardesia_runtime:synthetic@db.{PROJECT_REF}.supabase.co/postgres?sslmode=require&sslmode=disable'},
    {'DB_URL': f'postgresql://ardesia_runtime:synthetic@db.{PROJECT_REF}.supabase.co/postgres?sslmode=require&options=unsafe'},
])
def test_remote_configuration_is_explicit_and_pinned(tmp_path, changes):
    with pytest.raises(ValueError):
        RemoteSupabaseRuntime(configuration(**changes), tmp_path)


def test_valid_profile_does_not_weaken_default_loopback_or_synthetic_guards(tmp_path):
    runtime = RemoteSupabaseRuntime(configuration(), tmp_path)
    with pytest.raises(ValueError, match='synthetic_only'):
        create_app(tmp_path / 'unused', runtime=runtime)
    with pytest.raises(ValueError, match='remote_secure_cookies_required'):
        create_app(tmp_path / 'unused', demo=True, runtime=runtime)
    with pytest.raises(ValueError, match='loopback'):
        SupabaseRuntime(configuration(), tmp_path)
    app = create_remote_app(configuration(), tmp_path)
    with TestClient(app, base_url=ORIGIN) as client:
        health = client.get('/study/health')
        assert health.status_code == 200
        assert health.json()['mode'] == MODE
        assert health.json()['syntheticOnly'] is True
        assert health.json()['productionReady'] is False
        assert health.json()['releaseSha'] == 'a' * 40
        assert health.json()['capabilities']['passwordLogin'] is True
        assert 'synthetic@' not in health.text and 'synthetic-public-key' not in health.text
    with TestClient(create_app(tmp_path / 'unused', demo=True)) as client:
        assert client.post('/study/session/login', json={}).status_code == 404
        assert client.get('/study/health', headers={'Host': 'core.example.test'}).status_code == 403


@pytest.mark.parametrize('scheme,headers,method,error', [
    ('http', [(b'host', b'core.example.test'), (b'origin', ORIGIN.encode())], 'POST', 'remote_host_denied'),
    ('https', [(b'host', b'attacker.invalid'), (b'origin', ORIGIN.encode())], 'POST', 'remote_host_denied'),
    ('https', [(b'host', b'core.example.test.attacker.invalid')], 'GET', 'remote_host_denied'),
    ('https', [(b'host', b'core.example.test'), (b'host', b'core.example.test')], 'GET', 'remote_host_denied'),
    ('https', [(b'host', b'core.example.test')], 'POST', 'origin_denied'),
    ('https', [(b'host', b'core.example.test'), (b'origin', b'null')], 'POST', 'origin_denied'),
    ('https', [(b'host', b'core.example.test'), (b'origin', b'https://attacker.invalid')], 'GET', 'origin_denied'),
    ('https', [(b'host', b'core.example.test'), (b'origin', ORIGIN.encode()), (b'origin', ORIGIN.encode())], 'POST', 'origin_denied'),
])
def test_remote_denial_precedes_body_budget_receive_auth_and_db(tmp_path, monkeypatch, scheme, headers, method, error):
    from study_api.body_admission import _BodyBudget
    def forbidden(*args, **kwargs):
        raise AssertionError('denied request entered body admission or provider')
    monkeypatch.setattr(_BodyBudget, 'acquire', forbidden)
    monkeypatch.setattr(RemoteSupabaseRuntime, 'open', forbidden)
    app = create_remote_app(configuration(), tmp_path)
    exchange = Exchange(path='/study/session/login', method=method)
    exchange.scope.update(scheme=scheme, headers=headers)
    asyncio.run(exchange.run(app))
    assert exchange.status == 403 and exchange.reads == 0
    body = b''.join(message.get('body', b'') for message in exchange.messages)
    assert json.loads(body) == {'error': error}


def test_allowed_remote_body_budget_blocks_before_credentials_and_store(tmp_path, monkeypatch):
    app, _, fake, attempts = app_with_fake(tmp_path, monkeypatch, request_body_wait=.03)
    async def exercise():
        release = asyncio.Event()
        first = Exchange(chunks=(b'{', b'}'), gate=release)
        denied = Exchange(path='/study/session/login')
        for exchange in (first, denied):
            exchange.scope.update(scheme='https', headers=[(b'host', b'core.example.test'), (b'origin', ORIGIN.encode())])
        pending = asyncio.create_task(first.run(app))
        try:
            await asyncio.wait_for(first.entered.wait(), 2)
            # A second large route cannot reserve while the first body is held.
            denied.scope.update(path='/study/notebook/inspect')
            await asyncio.wait_for(denied.run(app), 2)
            assert denied.status == 503 and denied.reads == 0
            assert fake.opens == [] and attempts == []
        finally:
            release.set()
            await asyncio.wait_for(pending, 2)
    asyncio.run(exercise())


def test_password_login_uses_same_cookie_principal_recovery_and_revocation(tmp_path, monkeypatch):
    app, _, fake, attempts = app_with_fake(tmp_path, monkeypatch, request_store_limit=1)
    with TestClient(app, base_url=ORIGIN, headers={'Origin': ORIGIN}) as client:
        client.cookies.set('study_session', 'invalid', domain='core.example.test', path='/')
        response = client.post('/study/session/login', json={'email': 'synthetic@example.test', 'password': PASSWORD,
                                                           'actorId': 'forged-actor', 'role': 'teacher'})
        assert response.status_code == 200
        assert response.json() == {'id': 'student-own', 'role': 'student', 'synthetic': True, 'authentication': 'supabase'}
        cookie = response.headers['set-cookie']
        assert 'HttpOnly' in cookie and 'Secure' in cookie and 'SameSite=strict' in cookie
        assert 'Path=/' in cookie and 'Domain=' not in cookie
        assert response.headers['cache-control'] == 'no-store'
        assert PASSWORD not in response.text and 'valid' not in response.text
        assert attempts == [('synthetic@example.test', PASSWORD)]
        assert fake.opens == ['', 'valid'] and fake.maximum == 1 and fake.active == 0
        assert client.get('/study/me').json()['id'] == 'student-own'
        bad = client.post('/study/session/login', json={'email': 'synthetic@example.test', 'password': 'wrong'})
        assert bad.status_code == 401 and 'set-cookie' not in bad.headers
        assert client.get('/study/me').status_code == 200
        token_exchange = client.post('/study/session', json={'token': 'valid'})
        assert token_exchange.status_code == 200
        assert client.delete('/study/session').status_code == 200
        assert client.get('/study/me').status_code == 401
        # Actual runtime logout used the same Supabase revocation transport.
        assert 'valid' in fake.revoked
        client.cookies.set('study_session', 'valid', domain='core.example.test', path='/')
        rejected = client.get('/study/me')
        assert rejected.status_code == 401
        assert rejected.headers['x-study-session-rejected'] == 'cookie'
        assert 'Max-Age=0' in rejected.headers['set-cookie']


@pytest.mark.parametrize('body', [
    {'email': '', 'password': PASSWORD}, {'email': 'synthetic@example.test', 'password': PASSWORD * 100},
    {'email': 'synthetic@example.test'}, {'email': 'synthetic@example.test', 'password': []},
])
def test_bad_credential_validation_never_echoes_password(tmp_path, monkeypatch, body):
    app, _, fake, attempts = app_with_fake(tmp_path, monkeypatch)
    with TestClient(app, base_url=ORIGIN, headers={'Origin': ORIGIN}) as client:
        response = client.post('/study/session/login', json=body)
        assert response.status_code == 422 and response.json() == {'error': 'invalid_credentials'}
        assert PASSWORD not in response.text and attempts == []
        assert fake.opens == ['']  # Only the admitted request-rate counter.


def test_login_waiting_for_store_capacity_does_not_contact_auth(tmp_path, monkeypatch):
    app, _, fake, attempts = app_with_fake(tmp_path, monkeypatch, boundary='command',
                                         request_store_limit=1, request_store_wait=.03)
    async def exercise():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=ORIGIN,
                                     headers={'Origin': ORIGIN}, cookies={'study_session': 'valid'}) as client:
            pending = asyncio.create_task(client.get('/study/me'))
            try:
                assert await asyncio.to_thread(fake.gate.entered.wait, 2)
                denied = await client.post('/study/session/login', json={'email': 'synthetic@example.test', 'password': PASSWORD})
                assert denied.status_code == 503 and denied.json() == {'error': 'server_busy'}
                assert attempts == [] and fake.opens == ['valid']
            finally:
                fake.gate.release.set()
                await pending
            assert fake.active == 0 and fake.maximum == 1
    asyncio.run(exercise())


def jwt(sub='00000000-0000-0000-0000-000000000001', session='00000000-0000-0000-0000-000000000002', role='authenticated'):
    payload = base64.urlsafe_b64encode(json.dumps({'sub': sub, 'session_id': session, 'role': role}).encode()).rstrip(b'=')
    return 'header.' + payload.decode() + '.signature'


def test_password_result_passes_real_user_verification_then_existing_postgres_session_context(tmp_path, monkeypatch):
    import study_api.runtime as runtime_module
    runtime = RemoteSupabaseRuntime(configuration(), tmp_path)
    token = jwt()
    calls = []
    def request(method, path, **kwargs):
        calls.append((method, path))
        if path.startswith('/auth/v1/token'):
            return json.dumps({'access_token': token, 'refresh_token': 'never-returned'}).encode()
        assert kwargs['token'] == token
        return b'{"id":"00000000-0000-0000-0000-000000000001"}'
    def store(url, directory, **kwargs):
        calls.append(kwargs)
        return SimpleNamespace()
    monkeypatch.setattr(runtime, 'request', request)
    monkeypatch.setattr(runtime_module, 'PostgresStudyStore', store)
    result = runtime.open(runtime.password_token('synthetic@example.test', PASSWORD))
    assert calls == [('POST', '/auth/v1/token?grant_type=password'), ('GET', '/auth/v1/user'),
                     {'auth_user_id': '00000000-0000-0000-0000-000000000001',
                      'auth_session_id': '00000000-0000-0000-0000-000000000002'}]
    assert isinstance(result.blobs, SupabaseBlobs)
    assert result.synthetic_acceptance is True


@pytest.mark.parametrize('token,response', [
    ('invalid', b'{}'), (jwt(role='service_role'), b'{"id":"00000000-0000-0000-0000-000000000001"}'),
    (jwt(), b'{"id":"00000000-0000-0000-0000-000000000099"}'), (jwt(), b'invalid json'),
    (jwt(session='invalid'), b'{"id":"00000000-0000-0000-0000-000000000001"}'),
])
def test_invalid_or_mismatched_auth_never_opens_database(tmp_path, monkeypatch, token, response):
    import study_api.runtime as runtime_module
    runtime = RemoteSupabaseRuntime(configuration(), tmp_path)
    monkeypatch.setattr(runtime, 'request', lambda *args, **kwargs: response)
    def forbidden(*args, **kwargs):
        raise AssertionError('unverified token reached PostgreSQL')
    monkeypatch.setattr(runtime_module, 'PostgresStudyStore', forbidden)
    with pytest.raises(StudyError) as error:
        runtime.open(token)
    assert error.value.code == 'unauthenticated'


def test_redirect_refusal_and_missing_cleanup_key_are_explicit(tmp_path, monkeypatch):
    runtime = RemoteSupabaseRuntime(configuration(), tmp_path)
    calls = []
    def redirected(request, **kwargs):
        calls.append(request.full_url)
        raise urllib.error.HTTPError(request.full_url, 302, 'redirect', {}, None)
    monkeypatch.setattr(runtime, '_urlopen', redirected)
    with pytest.raises(StudyError) as error:
        runtime.password_token('synthetic@example.test', PASSWORD)
    assert error.value.code == 'provider_unavailable'
    assert len(calls) == 1
    assert _NoRedirect().redirect_request(None, None, 302, '', {}, 'https://attacker.invalid') is None
    with pytest.raises(StudyError) as error:
        SupabaseBlobs(runtime, 'synthetic-token').remove('synthetic-asset')
    assert error.value.code == 'media_compensation_unavailable' and error.value.status == 503
    assert len(calls) == 1  # No delete with the public key or fabricated success.
