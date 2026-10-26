"""Synthetic loopback fixture for compiled App + proposed factory, no monkeypatch."""
from pathlib import Path
import json
import os
from study_api.app import create_app
from test_factory_composition import seed

ROOT = Path(__file__).resolve().parents[4]
DATA = Path(os.environ.get('S06_COMPOSITION_DATA', Path(__file__).parent / '.artifacts'))
if DATA.exists() and any(DATA.iterdir()):
    raise RuntimeError('fresh_fixture_required: choose a new empty S06_COMPOSITION_DATA directory')
DATA.mkdir(parents=True, exist_ok=True)
path = DATA / 'study.sqlite'
if not path.exists():
    store, tutor, student, peer, empty = seed(path)
    access = {name: store.issue_session(actor, ttl=86400) for name, actor in [('student', student), ('peer', peer), ('tutor', tutor), ('empty', empty)]}
    (DATA / 'access.json').write_text(json.dumps(access))
    (DATA / 'access.json').chmod(0o600)
    store.close()
app = create_app(path, demo=True, frontend=ROOT / 'apps/web/dist')

# An explicit test constraint, not a claim about existing production headers.
@app.middleware('http')
async def compiled_script_policy(request, call_next):
    response = await call_next(request)
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'"
    return response
