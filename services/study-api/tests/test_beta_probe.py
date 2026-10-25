"""The remote preflight cannot turn public health into a beta launch receipt."""
import json
from pathlib import Path
import socket
import subprocess
import sys

import pytest

from study_api.beta_probe import (
    ProbeFailure, ProbeResponse, ProbeTarget, PinnedHttpsReader,
    public_addresses, run_probe,
)


ORIGIN = 'https://ardesia-staging.example.org'
SHA = '6f19b1956cedbebf36a5cf097af66e47ed8acecd'


def manifest(**overrides):
    return {'schema': 'ardesia.beta-readiness-target.v1', 'origin': ORIGIN,
            'expectedCommit': SHA, **overrides}


def response(payload, status=200):
    return ProbeResponse(status, 'application/json', json.dumps(payload).encode())


class Reader:
    def __init__(self, health=None, me=401, ops=401):
        self.paths = []
        self.responses = {
            '/study/health': response(health if health is not None else {
                'ok': True, 'synthetic': False, 'authentication': 'supabase',
                'persistence': 'postgres', 'buildCommitSha': SHA,
            }),
            '/study/me': response({'error': 'unauthenticated'}, me),
            '/study/ops/health': response({'error': 'unauthenticated'}, ops),
        }

    def get(self, path):
        self.paths.append(path)
        value = self.responses[path]
        if isinstance(value, Exception):
            raise value
        return value


def check(result, name):
    return next(item for item in result['checks'] if item['id'] == name)


def test_no_target_or_unapproved_target_never_connects():
    reader = Reader()
    for target, allow in [(None, []), (manifest(), []),
                          (manifest(), ['https://other.example.org'])]:
        result = run_probe(target, allow, reader=reader)
        assert check(result, 'approved_target')['status'] == 'FAIL'
        assert result['readOnlyPreflightPassed'] is False
        assert result['betaReady'] is False and result['launchAllowed'] is False
    assert reader.paths == []


@pytest.mark.parametrize('origin', [
    'http://ardesia-staging.example.org', 'https://127.0.0.1',
    'https://[::1]', 'https://10.0.0.2', 'https://169.254.169.254',
    'https://224.0.0.1', 'https://239.255.255.250', 'https://[ff02::1]', 'https://[4000::1]',
    'https://localhost', 'https://demo.localhost', 'https://intranet',
    'https://user:secret@ardesia-staging.example.org',
    ORIGIN + '/study', ORIGIN + '?token=secret', ORIGIN + '#secret',
    ORIGIN + ':8443', ORIGIN + '/', 'https://evil.example.org\\@example.org',
])
def test_unsafe_origin_rejected_without_request_or_secret_echo(origin):
    reader = Reader()
    result = run_probe(manifest(origin=origin), [origin], reader=reader)
    assert check(result, 'approved_target')['status'] == 'FAIL'
    assert reader.paths == []
    assert 'secret' not in json.dumps(result)
    assert result['target'] is None


@pytest.mark.parametrize('changes', [
    {'expectedCommit': 'main'}, {'expectedCommit': SHA[:12]},
    {'schema': 'other'}, {'accessToken': 'never-print-this'},
])
def test_target_requires_exact_schema_sha_and_no_credential_fields(changes):
    reader = Reader()
    result = run_probe(manifest(**changes), [ORIGIN], reader=reader)
    assert check(result, 'approved_target')['status'] == 'FAIL'
    assert reader.paths == []
    assert 'never-print-this' not in json.dumps(result)


def test_all_readonly_checks_pass_but_real_journey_remains_not_run():
    reader = Reader()
    result = run_probe(manifest(), [ORIGIN], reader=reader)
    assert reader.paths == ['/study/health', '/study/me', '/study/ops/health']
    assert result['readOnlyPreflightPassed'] is True
    assert result['betaReady'] is False and result['launchAllowed'] is False
    assert result['status'] == 'BLOCKED'
    operator = [item for item in result['checks'] if item['stage'] == 'operator']
    assert len(operator) >= 10 and all(item['status'] == 'NOT_RUN' for item in operator)
    assert {'two_user_login', 'invitation_and_edition', 'private_media',
            'cross_user_isolation', 'session_revocation', 'studio_roundtrip',
            'persistence_and_restore', 'core_learning_journey'} <= {item['id'] for item in operator}


@pytest.mark.parametrize('synthetic', [True, None, 0, 'false'])
def test_synthetic_or_unattested_health_is_never_remote_beta(synthetic):
    reader = Reader(health={'ok': True, 'synthetic': synthetic,
                            'authentication': 'supabase', 'persistence': 'postgres',
                            'buildCommitSha': SHA})
    result = run_probe(manifest(), [ORIGIN], reader=reader)
    assert check(result, 'real_runtime')['status'] == 'FAIL'
    assert result['readOnlyPreflightPassed'] is False


@pytest.mark.parametrize('health', [
    {'ok': True, 'synthetic': False, 'authentication': 'synthetic_session', 'persistence': 'sqlite'},
    {'ok': True, 'synthetic': False, 'authentication': 'supabase', 'persistence': 'postgres'},
    {'ok': True, 'synthetic': False, 'authentication': 'supabase', 'persistence': 'postgres', 'buildCommitSha': 'a' * 40},
])
def test_missing_identity_or_fake_persistence_blocks_preflight(health):
    result = run_probe(manifest(), [ORIGIN], reader=Reader(health=health))
    assert result['readOnlyPreflightPassed'] is False


@pytest.mark.parametrize('path', ['/study/me', '/study/ops/health'])
@pytest.mark.parametrize('status', [200, 302, 500])
def test_anonymous_access_redirect_or_server_error_is_not_a_denial_receipt(path, status):
    reader = Reader()
    reader.responses[path] = response({'email': 'private@example.invalid'}, status)
    result = run_probe(manifest(), [ORIGIN], reader=reader)
    assert result['readOnlyPreflightPassed'] is False
    assert 'private@example.invalid' not in json.dumps(result)


@pytest.mark.parametrize('bad_response', [
    ProbeResponse(302, 'text/html', b'location: https://elsewhere.invalid/secret'),
    ProbeResponse(200, 'application/json', b'{not-json secret'),
    ProbeResponse(200, 'text/html', b'<html>private@example.invalid</html>'),
    ProbeResponse(200, 'application/json', b'{' + b'x' * 65537),
    ProbeResponse(200, 'application/json', b'{"ok":true,"ok":false}'),
    ProbeResponse(200, 'application/json', b'{"ok":NaN}'),
    TimeoutError('private@example.invalid credentials should not be logged'),
])
def test_remote_errors_and_payloads_are_bounded_and_sanitized(bad_response):
    reader = Reader()
    reader.responses['/study/health'] = bad_response
    result = run_probe(manifest(), [ORIGIN], reader=reader)
    assert check(result, 'real_runtime')['status'] == 'FAIL'
    rendered = json.dumps(result)
    assert 'private@example.invalid' not in rendered and 'secret' not in rendered
    assert result['readOnlyPreflightPassed'] is False


def test_public_dns_rejects_mixed_private_answers_before_any_https(monkeypatch):
    def answers(*args, **kwargs):
        return [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('93.184.216.34', 443)),
                (socket.AF_INET, socket.SOCK_STREAM, 6, '', ('127.0.0.1', 443))]
    monkeypatch.setattr(socket, 'getaddrinfo', answers)
    with pytest.raises(ProbeFailure, match='non_public_address'):
        public_addresses('ardesia-staging.example.org')


def test_public_dns_errors_are_not_echoed(monkeypatch):
    def fail(*args, **kwargs):
        raise OSError('DNS secret should not be logged')
    monkeypatch.setattr(socket, 'getaddrinfo', fail)
    with pytest.raises(ProbeFailure, match='dns_unavailable'):
        public_addresses('ardesia-staging.example.org')


@pytest.mark.parametrize('address', [
    '10.0.0.1', '169.254.169.254', '::1', 'fc00::1', '::ffff:127.0.0.1',
    '224.0.0.1', '239.255.255.250', 'ff02::1', 'ff05::1', '4000::1',
])
def test_dns_resolving_public_name_to_nonpublic_address_is_rejected(monkeypatch, address):
    family = socket.AF_INET6 if ':' in address else socket.AF_INET
    monkeypatch.setattr(socket, 'getaddrinfo', lambda *args, **kwargs: [
        (family, socket.SOCK_STREAM, 6, '', (address, 443))])
    with pytest.raises(ProbeFailure, match='non_public_address'):
        public_addresses('ardesia-staging.example.org')


def test_tls_uses_checked_numeric_address_and_verifies_original_hostname(monkeypatch):
    import ssl
    import study_api.beta_probe as probe
    connections, wrapped, closed = [], [], []
    class Raw:
        def close(self): closed.append(True)
    raw = Raw()
    def create(destination, timeout):
        connections.append((destination, timeout))
        return raw
    class Context:
        def wrap_socket(self, stream, *, server_hostname):
            wrapped.append((stream, server_hostname))
            return 'verified-socket'
    connection = probe._PinnedConnection('ardesia-staging.example.org', '93.184.216.34', 5)
    assert connection._context.check_hostname is True
    assert connection._context.verify_mode == ssl.CERT_REQUIRED
    connection._context = Context()
    monkeypatch.setattr(socket, 'create_connection', create)
    connection.connect()
    assert connections == [(('93.184.216.34', 443), 5)]
    assert wrapped == [(raw, 'ardesia-staging.example.org')]
    assert connection.sock == 'verified-socket' and closed == []
    def reject(stream, *, server_hostname):
        raise ssl.SSLCertVerificationError('certificate detail stays private')
    connection._context.wrap_socket = reject
    with pytest.raises(ssl.SSLCertVerificationError):
        connection.connect()
    assert closed == [True]


def test_pinned_transport_resolves_once_and_keeps_tls_hostname(monkeypatch):
    import study_api.beta_probe as probe
    resolutions = []
    connections = []
    requests = []
    def resolve(host):
        resolutions.append(host)
        return ('93.184.216.34',)
    class Connection:
        def __init__(self, host, address, timeout):
            connections.append((host, address, timeout))
        def request(self, method, path, headers):
            requests.append((method, path, headers))
        def getresponse(self):
            class Reply:
                status = 401
                def getheader(self, name, default=''): return 'application/json'
                def read(self, limit): return b'{"error":"unauthenticated"}'
            return Reply()
        def close(self): pass
    monkeypatch.setattr(probe, 'public_addresses', resolve)
    monkeypatch.setattr(probe, '_PinnedConnection', Connection)
    target = ProbeTarget.parse(manifest(), [ORIGIN])
    reader = PinnedHttpsReader(target)
    reader.get('/study/me')
    reader.get('/study/ops/health')
    assert resolutions == ['ardesia-staging.example.org']
    assert all(item[:2] == ('ardesia-staging.example.org', '93.184.216.34') for item in connections)
    assert all(method == 'GET' for method, _, _ in requests)
    assert all(not {'authorization', 'cookie', 'proxy-authorization'} & {key.lower() for key in headers}
               for _, _, headers in requests)
    with pytest.raises(ProbeFailure, match='path_not_allowed'):
        reader.get('https://elsewhere.invalid/')


@pytest.mark.parametrize('status,size,expected', [
    (302, 0, 'redirect_rejected'), (200, 65537, 'response_too_large'),
])
def test_transport_never_follows_redirect_and_caps_body_before_json(monkeypatch, status, size, expected):
    import study_api.beta_probe as probe
    requests, closes, limits = [], [], []
    class Connection:
        def __init__(self, *args): pass
        def request(self, method, path, headers): requests.append((method, path))
        def getresponse(self):
            class Reply:
                def getheader(self, name, default=''): return 'application/json'
                def read(self, limit):
                    limits.append(limit)
                    return b'x' * size
            reply = Reply()
            reply.status = status
            return reply
        def close(self): closes.append(True)
    monkeypatch.setattr(probe, 'public_addresses', lambda host: ('93.184.216.34',))
    monkeypatch.setattr(probe, '_PinnedConnection', Connection)
    reader = PinnedHttpsReader(ProbeTarget.parse(manifest(), [ORIGIN]))
    with pytest.raises(ProbeFailure, match=expected):
        reader.get('/study/health')
    assert requests == [('GET', '/study/health')] and closes == [True]
    assert limits == ([] if status == 302 else [65537])


def test_existing_synthetic_health_and_remote_host_guards_still_block_beta(tmp_path):
    from fastapi.testclient import TestClient
    from study_api.app import create_app
    app = create_app(tmp_path / 'synthetic.sqlite', demo=True)
    with TestClient(app) as client:
        health = client.get('/study/health')
        assert health.status_code == 200 and health.json()['synthetic'] is True
        reader = Reader(health=health.json())
        receipt = run_probe(manifest(), [ORIGIN], reader=reader)
        assert check(receipt, 'real_runtime')['status'] == 'FAIL'
        assert check(receipt, 'deployed_commit')['status'] == 'FAIL'
        assert receipt['betaReady'] is False
    with TestClient(app, base_url=ORIGIN) as remote:
        assert remote.get('/study/health').status_code == 403
    with pytest.raises(ValueError, match='synthetic_only'):
        create_app(tmp_path / 'real.sqlite', demo=False)


def test_cli_without_target_is_readonly_blocked_json():
    root = Path(__file__).resolve().parents[3]
    result = subprocess.run([sys.executable, str(root / 'bin/study-demo/probe-beta.py')],
                            capture_output=True, text=True, timeout=10)
    assert result.returncode == 2
    receipt = json.loads(result.stdout)
    assert receipt['betaReady'] is False and receipt['launchAllowed'] is False
    assert check(receipt, 'approved_target')['status'] == 'FAIL'
    assert result.stderr == ''


def test_cli_rejects_duplicate_manifest_fields_without_echoing_private_input(tmp_path):
    root = Path(__file__).resolve().parents[3]
    target = tmp_path / 'target.json'
    target.write_text('{"origin":"private@example.invalid","origin":"' + ORIGIN + '"}')
    result = subprocess.run([sys.executable, str(root / 'bin/study-demo/probe-beta.py'),
                             '--target', str(target), '--allow-origin', ORIGIN],
                            capture_output=True, text=True, timeout=10)
    assert result.returncode == 2 and 'private@example.invalid' not in result.stdout
    assert check(json.loads(result.stdout), 'approved_target')['status'] == 'FAIL'
    assert result.stderr == ''
