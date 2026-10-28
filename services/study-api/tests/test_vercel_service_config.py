"""Service config and staged-package proofs, independent of a hosted build."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

from test_remote_entry import ENTRY, entry_environment

SERVICE = ENTRY.parent


def builder():
    spec = importlib.util.spec_from_file_location('acceptance_bundle', SERVICE / 'build_shared_core.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_service_config_selects_isolated_python_build_with_explicit_frontend_bundles():
    config = json.loads((SERVICE / 'vercel.json').read_text())
    assert config['framework'] == 'fastapi'
    assert config['installCommand'] == 'uv sync --frozen --no-dev'
    assert config['buildCommand'] == 'python3 build_shared_core.py'
    assert config['outputDirectory'] is None
    assert config['git']['deploymentEnabled'] is False
    assert config['functions']['app.py']['includeFiles'] == '{_core/**,_frontend/**,_studio/**}'
    assert 'tests/**' in config['functions']['app.py']['excludeFiles']
    assert 'nodeVersion' not in config and 'builds' not in config and 'env' not in config
    commands = config['installCommand'] + config['buildCommand']
    assert not any(value in commands for value in ('npm', 'apps/studio', 'build_vercel_integrated', '.vercel/output'))


def test_staging_keeps_canonical_bytes_package_data_and_drops_only_generated_cache(tmp_path):
    build = builder()
    source = tmp_path / 'repository'
    for relative in build.PACKAGES.values():
        package = source / relative
        (package / '__pycache__').mkdir(parents=True)
        (package / '__init__.py').write_bytes(b'# canonical package\n')
        (package / 'content.json').write_bytes(b'{"canonical":true}')
        (package / '__pycache__' / 'cached.pyc').write_bytes(b'cache')
    destination = tmp_path / 'bundle' / '_core'
    build.stage_shared_core(source, destination)
    for name, relative in build.PACKAGES.items():
        assert (destination / name / '__init__.py').read_bytes() == (source / relative / '__init__.py').read_bytes()
        assert (destination / name / 'content.json').read_bytes() == b'{"canonical":true}'
        assert not (destination / name / '__pycache__').exists()
    (destination / 'stale.py').write_text('old artifact')
    build.stage_shared_core(source, destination)
    assert not (destination / 'stale.py').exists()


def test_staged_entry_runs_without_outside_root_canonical_checkout(tmp_path):
    build = builder()
    isolated = tmp_path / 'bundle' / 'services' / 'study-api'
    isolated.mkdir(parents=True)
    shutil.copy2(ENTRY, isolated / 'app.py')
    shutil.copytree(SERVICE / 'study_api', isolated / 'study_api',
                    ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    build.stage_shared_core(SERVICE.parents[1], isolated / '_core')
    (isolated / '_frontend').mkdir()
    (isolated / '_frontend/index.html').write_text('<main>same-origin fixture</main>')
    (isolated / '_studio/assets').mkdir(parents=True)
    (isolated / '_studio/index.html').write_text('<main>same-origin Studio fixture</main>')
    (isolated / '_studio/assets/app.js').write_text('studio asset')
    # There is no packages/engine or plugins checkout in the isolated bundle.
    result = subprocess.run([sys.executable, '-I', '-c', '''
import runpy, sys
from pathlib import Path
entry = Path(sys.argv[1])
namespace = runpy.run_path(str(entry))
import lessonos, s19_circuit_lab, study_api
for package in (lessonos, s19_circuit_lab):
    assert Path(package.__file__).is_relative_to(entry.parent / '_core')
assert Path(study_api.__file__).is_relative_to(entry.parent / 'study_api')
from fastapi.testclient import TestClient
with TestClient(namespace['app'], base_url='https://core.example.test') as client:
    response = client.get('/study/health')
    assert response.status_code == 200
    assert response.json()['mode'] == 'SYNTHETIC_ACCEPTANCE'
    frontend = client.get('/courses/fluidi', headers={'Accept': 'text/html'})
    assert frontend.status_code == 200 and 'same-origin fixture' in frontend.text
    assert client.get('/study/typo', headers={'Accept': 'text/html'}).status_code == 404
    assert 'same-origin Studio fixture' in client.get('/studio/').text
    assert client.get('/studio/assets/app.js').text == 'studio asset'
    assert client.get('/studio/assets/missing.js').status_code == 404
print('staged_canonical_core_ok')
''', str(isolated / 'app.py')], cwd=tmp_path, env=entry_environment(tmp_path),
        capture_output=True, text=True, timeout=45)
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == 'staged_canonical_core_ok'
