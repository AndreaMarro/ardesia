"""Reproduce frozen negative findings on their real Git-pinned runtime, never on today's app.
Only historical tests use this disposable fixture. Current registry evidence keeps binding
and executing the actual current runtime. No fingerprints or judgments are substituted.
"""
from contextlib import contextmanager
from functools import lru_cache
from io import BytesIO
import atexit
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile
from unittest.mock import patch
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint

LEGACY_COMMIT='493df796527bdb31b71f223343384656258e8e3a'
LEGACY_FINGERPRINT='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5'


@lru_cache(maxsize=1)
def historical_app(app):
    app=Path(app).resolve();repo=app.parent
    roots=['server','static','content','contracts','migrations','policies','extensions','package.json','package-lock.json','tools/corpus_engineering/draft_import.py']
    tracked=set(subprocess.check_output(['git','ls-tree','--name-only',LEGACY_COMMIT+':officina-di-fisica'],cwd=repo,text=True).splitlines())
    roots=[name for name in roots if name.split('/')[0] in tracked]
    raw=subprocess.check_output(['git','archive',LEGACY_COMMIT,'--',*('officina-di-fisica/'+name for name in roots)],cwd=repo)
    home=tempfile.TemporaryDirectory(prefix='cric-frozen-negative-runtime-');atexit.register(home.cleanup)
    with tarfile.open(fileobj=BytesIO(raw)) as archive:
        members=archive.getmembers()
        if sum(m.size for m in members)>64*1024*1024:raise ValueError('Historical runtime fixture exceeds its bound')
        archive.extractall(home.name,filter='data')
    frozen=Path(home.name)/'officina-di-fisica'
    # These three installed audit dependencies are explicitly part of the fingerprint.
    # Copies, not runtime aliases, ensure later local edits cannot alter this fixture.
    names=['node_modules/axe-core/axe.min.js','node_modules/axe-core/package.json','node_modules/playwright/package.json']
    for group,number in [('foundations','037'),('vectors','038'),('forces','041')]:
        names+=['tests/corpus/browser-experiments-'+group+'.mjs','editorial/reviews/experiments-'+group+'-'+number+'-browser-originals.json']
    for name in names:
        target=frozen/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(app/name,target)
    with patch.dict(os.environ,{'ASTRA_EXTENSIONS':str(frozen/'extensions')}):
        if runtime_fingerprint(frozen)['sha256']!=LEGACY_FINGERPRINT:
            raise ValueError('Historical Git snapshot/dependencies do not reproduce the reviewed runtime')
    return frozen


@contextmanager
def reviewed_runtime(review,force=False):
    expected=review.READ_RUNTIME_PROFILE_SHA256
    if expected!=LEGACY_FINGERPRINT:raise ValueError('Unrecognized historical review fingerprint')
    current=review.APP
    if not force and runtime_fingerprint(current)['sha256']==expected:
        yield current
        return
    frozen=historical_app(current)
    with patch.object(review,'APP',frozen),patch.dict(os.environ,{'ASTRA_EXTENSIONS':str(frozen/'extensions')}):
        if runtime_fingerprint(frozen)['sha256']!=expected:raise ValueError('Frozen runtime changed during replay')
        yield frozen
        if runtime_fingerprint(frozen)['sha256']!=expected:raise ValueError('Frozen runtime changed during replay')
