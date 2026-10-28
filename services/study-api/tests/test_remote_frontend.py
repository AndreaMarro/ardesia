"""Same-origin bundle identity and SPA/API routing without network or npm."""
import hashlib
import json
from pathlib import Path

from fastapi.testclient import TestClient
import pytest

from study_api.remote import create_remote_app
from test_remote_runtime import configuration, ORIGIN
from test_vercel_service_config import builder


def web_fixture(tmp_path):
    source = tmp_path / 'canonical-web-dist'
    (source / 'assets').mkdir(parents=True)
    (source / 'index.html').write_bytes(b'<!doctype html><main>reviewed Web</main><script src="/assets/app.js"></script>')
    (source / 'assets/app.js').write_bytes(b'console.log("canonical acceptance fixture")')
    return source


def test_frontend_staging_preserves_reviewed_bytes_and_records_source_identity(tmp_path):
    source = web_fixture(tmp_path)
    destination = tmp_path / 'service' / '_frontend'
    builder().stage_frontend(source, destination, 'b' * 40)
    for relative in ('index.html', 'assets/app.js'):
        assert (destination / relative).read_bytes() == (source / relative).read_bytes()
    metadata = json.loads((destination / 'acceptance-release.json').read_text())
    assert metadata == {'sourceSha': 'b' * 40, 'syntheticOnly': True, 'mode': 'SYNTHETIC_ACCEPTANCE',
                        'indexSha256': hashlib.sha256((source / 'index.html').read_bytes()).hexdigest()}
    with pytest.raises(ValueError, match='frontend_release_sha_required'):
        builder().stage_frontend(source, destination, '')


def test_optional_web_build_uses_only_locked_root_web_workspace_before_staging(tmp_path):
    root = tmp_path / 'repo'
    dist = root / 'apps/web/dist'
    dist.mkdir(parents=True)
    (dist / 'index.html').write_text('<main>built Web</main>')
    calls = []
    def run(command, **options):
        calls.append((command, options))
    builder().build_web(root, root / 'services/study-api/_frontend', 'c' * 40, run=run)
    assert calls == [(['npm', 'ci'], {'cwd': root, 'check': True}),
                     (['npm', 'run', 'build:web'], {'cwd': root, 'check': True})]
    assert (root / 'services/study-api/_frontend/index.html').read_bytes() == (dist / 'index.html').read_bytes()
    calls.clear()
    with pytest.raises(ValueError, match='frontend_release_sha_required'):
        builder().build_web(root, root / 'unused', '', run=run)
    assert calls == []


def test_private_spa_deep_navigation_assets_and_api_typos_share_strict_boundary(tmp_path):
    source = web_fixture(tmp_path)
    app = create_remote_app(configuration(), tmp_path / 'data', frontend=source)
    with TestClient(app, base_url=ORIGIN) as client:
        for path in ('/', '/courses/fluidi/lessons/example'):
            response = client.get(path, headers={'Accept': 'text/html'})
            assert response.status_code == 200 and response.content == (source / 'index.html').read_bytes()
            assert response.headers['cache-control'] == 'no-store'
        assert client.get('/assets/app.js').content == (source / 'assets/app.js').read_bytes()
        for path in ('/study/typo', '/study/resources/missing/subroute'):
            response = client.get(path, headers={'Accept': 'text/html'})
            assert response.status_code == 404 and response.json() == {'error': 'not_found'}
        assert client.get('/assets/missing.js', headers={'Accept': 'text/html'}).status_code == 404
        assert client.get('/missing-page', headers={'Accept': 'application/json'}).status_code == 404
        assert client.post('/courses/fluidi', headers={'Origin': ORIGIN}).status_code == 405
        assert client.get('/study/health').json()['mode'] == 'SYNTHETIC_ACCEPTANCE'
        assert client.get('/', headers={'Origin': 'https://attacker.invalid'}).status_code == 403
        assert client.get('/', headers={'Host': 'attacker.invalid'}).status_code == 403
