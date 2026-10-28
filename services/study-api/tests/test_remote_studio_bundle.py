"""Optional Studio packaging uses its existing mount and controlled Core."""
import hashlib
import json

from fastapi.testclient import TestClient
import pytest

from study_api.remote import create_remote_app
from test_remote_runtime import configuration, ORIGIN
from test_vercel_service_config import builder


def test_studio_build_is_locked_uses_subpath_and_preserves_source_bytes(tmp_path, monkeypatch):
    for key in ('ARDESIA_GIT_SHA', 'VERCEL_GIT_COMMIT_SHA', 'GITHUB_SHA', 'RENDER_GIT_COMMIT'):
        monkeypatch.delenv(key, raising=False)
    root = tmp_path / 'repo'
    dist = root / 'apps/studio/dist'
    (dist / 'assets').mkdir(parents=True)
    (dist / 'index.html').write_bytes(b'<main>Studio</main><script src="/studio/assets/app.js"></script>')
    (dist / 'assets/app.js').write_bytes(b'canonical studio fixture')
    calls = []
    def run(command, **options):
        calls.append((command, options))
    destination = root / 'services/study-api/_studio'
    builder().build_studio(root, destination, 'd' * 40, run=run)
    assert calls[0][0] == ['npm', '--prefix', 'apps/studio', 'ci']
    assert calls[1][0] == ['npm', '--prefix', 'apps/studio', 'run', 'build', '--', '--base=/studio/']
    assert all(options['cwd'] == root and options['check'] is True for _, options in calls)
    assert calls[1][1]['env']['ARDESIA_STUDIO_BASE'] == '/studio/'
    assert calls[1][1]['env']['ARDESIA_GIT_SHA'] == 'd' * 40
    for name in ('index.html', 'assets/app.js'):
        assert (destination / name).read_bytes() == (dist / name).read_bytes()
    metadata = json.loads((destination / 'acceptance-release.json').read_text())
    assert metadata['sourceSha'] == 'd' * 40
    assert metadata['indexSha256'] == hashlib.sha256((dist / 'index.html').read_bytes()).hexdigest()
    calls.clear()
    with pytest.raises(ValueError, match='frontend_release_sha_required'):
        builder().build_studio(root, destination, '', run=run)
    assert calls == []
    monkeypatch.setenv('VERCEL_GIT_COMMIT_SHA', 'f' * 40)
    with pytest.raises(ValueError, match='studio_build_provenance_mismatch'):
        builder().build_studio(root, destination, 'd' * 40, run=run)
    assert calls == []


def test_studio_mount_does_not_capture_web_or_api_and_preserves_boundary(tmp_path):
    studio = tmp_path / '_studio'
    (studio / 'assets').mkdir(parents=True)
    (studio / 'index.html').write_text('<main>existing Studio</main>')
    (studio / 'assets/app.js').write_text('studio asset')
    web = tmp_path / '_frontend'
    web.mkdir()
    (web / 'index.html').write_text('<main>reviewed Web</main>')
    app = create_remote_app(configuration(), tmp_path / 'data', frontend=web, studio_frontend=studio)
    with TestClient(app, base_url=ORIGIN) as client:
        assert client.get('/').text == '<main>reviewed Web</main>'
        assert client.get('/studio/').text == '<main>existing Studio</main>'
        assert client.get('/studio/assets/app.js').text == 'studio asset'
        assert client.get('/studio/assets/missing.js', headers={'Accept': 'text/html'}).status_code == 404
        assert client.get('/study/typo', headers={'Accept': 'text/html'}).json() == {'error': 'not_found'}
        assert client.get('/study/health').json()['mode'] == 'SYNTHETIC_ACCEPTANCE'
        assert client.get('/studio/', headers={'Origin': 'https://attacker.invalid'}).status_code == 403
        assert client.get('/studio/', headers={'Host': 'attacker.invalid'}).status_code == 403


def test_combined_bundle_budget_is_measured_and_fails_without_dropping_assets(tmp_path):
    for name, count in (('_core', 5), ('_frontend', 7), ('_studio', 11), ('study_api', 3)):
        folder = tmp_path / name
        folder.mkdir()
        (folder / 'file').write_bytes(b'x' * count)
    dependencies = tmp_path / 'runtime'
    dependencies.mkdir()
    (dependencies / 'package').write_bytes(b'x' * 13)
    report = builder().measure_bundle(tmp_path, dependency_roots=(dependencies,), limit_bytes=40)
    assert report['accountedBytes'] == 39 and report['withinAccountedBudget'] is True
    assert report['pythonDependencyEstimateAvailable'] is True
    assert report['hostedFunctionSizeVerified'] is False and report['assetsExcluded'] == []
    with pytest.raises(ValueError, match='acceptance_bundle_budget_exceeded'):
        builder().measure_bundle(tmp_path, dependency_roots=(dependencies,), limit_bytes=38)
    assert (tmp_path / '_studio/file').stat().st_size == 11
    assert json.loads((tmp_path / '_bundle-size.json').read_text())['withinAccountedBudget'] is False


def test_environment_entry_refuses_a_partial_studio_bundle(tmp_path, monkeypatch):
    import study_api.remote as remote
    service = tmp_path / 'service'
    (service / '_studio').mkdir(parents=True)
    for key, value in configuration().items():
        monkeypatch.setenv('ARDESIA_' + key, value)
    monkeypatch.setenv('ARDESIA_DATA_DIR', str(tmp_path / 'data'))
    monkeypatch.setattr(remote, '__file__', str(service / 'study_api/remote.py'))
    with pytest.raises(ValueError, match='remote_studio_index_required'):
        remote.app_from_env()
