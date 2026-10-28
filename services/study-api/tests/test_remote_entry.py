"""Exercise the deployment entry without inherited PYTHONPATH or remote IO."""
import os
from pathlib import Path
import subprocess
import sys

from test_remote_runtime import configuration

ENTRY = Path(__file__).resolve().parents[1] / 'app.py'


def entry_environment(tmp_path):
    environment = {key: value for key, value in os.environ.items() if not key.startswith('ARDESIA_')}
    environment.update({'ARDESIA_' + key: value for key, value in configuration().items()})
    environment['ARDESIA_DATA_DIR'] = str(tmp_path / 'ephemeral-acceptance')
    return environment


def test_vercel_entry_resolves_monorepo_imports_and_exports_shared_core_from_any_cwd(tmp_path):
    # -I ignores PYTHONPATH and excludes the working directory from imports.
    result = subprocess.run([sys.executable, '-I', '-c', '''
import runpy, sys
namespace = runpy.run_path(sys.argv[1])
from fastapi.testclient import TestClient
with TestClient(namespace['app'], base_url='https://core.example.test') as client:
    response = client.get('/study/health')
    assert response.status_code == 200
    body = response.json()
    assert body['mode'] == 'SYNTHETIC_ACCEPTANCE'
    assert body['syntheticOnly'] is True and body['productionReady'] is False
    assert body['capabilities']['passwordLogin'] is True
    assert any(route.path == '/study/session/login' for route in namespace['app'].routes)
print('shared_core_entry_ok')
''', str(ENTRY)], cwd=tmp_path, env=entry_environment(tmp_path), capture_output=True, text=True, timeout=30)
    assert result.returncode == 0, result.stderr
    assert result.stdout.strip() == 'shared_core_entry_ok'
    assert not (tmp_path / 'ephemeral-acceptance').exists()  # Health never opens a local store/DB.


def test_vercel_entry_fails_closed_without_explicit_acceptance_configuration(tmp_path):
    environment = entry_environment(tmp_path)
    environment['ARDESIA_MODE'] = ''
    result = subprocess.run([sys.executable, '-I', str(ENTRY)], cwd=tmp_path,
                            env=environment, capture_output=True, text=True, timeout=30)
    assert result.returncode != 0
    assert 'remote_synthetic_acceptance_required' in result.stderr
    assert environment['ARDESIA_DB_URL'] not in result.stderr
