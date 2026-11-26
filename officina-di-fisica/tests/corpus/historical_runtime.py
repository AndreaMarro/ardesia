"""Reproduce frozen negatives on real Git snapshots, never on a relabeled current app.
Only historical tests use this disposable fixture. Current registry evidence still
executes the actual current installation with its actual fingerprint.
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

# Previous public constants/default API are retained for the original f897 tests.
LEGACY_COMMIT='493df796527bdb31b71f223343384656258e8e3a'
LEGACY_FINGERPRINT='f897223d7afb4a9e09eb4fd06768e42e5b52bc131455fa678fbef74b4f39caa5'
C1_NEGATIVE_COMMIT='da2d1ad10542c0d5054650aa8a8e6c46d9ca4f1b'
C1_NEGATIVE_FINGERPRINT='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d'
HISTORICAL_RUNTIMES={LEGACY_FINGERPRINT:LEGACY_COMMIT,C1_NEGATIVE_FINGERPRINT:C1_NEGATIVE_COMMIT}
# This immutable delivery includes the original f897/041 proof, which was created
# after runtime commit493. All six f897 proof/protocol bytes were checked identical.
EVIDENCE_COMMIT=C1_NEGATIVE_COMMIT
AUDIT_DEPENDENCIES=('node_modules/axe-core/axe.min.js','node_modules/axe-core/package.json','node_modules/playwright/package.json')


def _extract(repo,commit,paths,destination,budget):
    raw=subprocess.check_output(['git','archive',commit,'--',*('officina-di-fisica/'+name for name in paths)],cwd=repo)
    with tarfile.open(fileobj=BytesIO(raw)) as archive:
        size=sum(m.size for m in archive.getmembers())
        if size>budget:raise ValueError('Historical runtime fixture exceeds its bound')
        archive.extractall(destination,filter='data')
    return size


def _check(frozen,expected):
    try:actual=runtime_fingerprint(frozen)['sha256']
    except (ValueError,OSError) as exc:raise ValueError('Frozen runtime changed or became unavailable during replay') from exc
    if actual!=expected:raise ValueError('Frozen runtime changed during replay')


@lru_cache(maxsize=2)
def historical_app(app,fingerprint=LEGACY_FINGERPRINT):
    if fingerprint not in HISTORICAL_RUNTIMES:raise ValueError('Unrecognized historical review fingerprint')
    app=Path(app).resolve();repo=app.parent;commit=HISTORICAL_RUNTIMES[fingerprint]
    roots=['server','static','content','contracts','migrations','policies','extensions','package.json','package-lock.json','tools/corpus_engineering/draft_import.py']
    tracked=set(subprocess.check_output(['git','ls-tree','--name-only',commit+':officina-di-fisica'],cwd=repo,text=True).splitlines())
    roots=[name for name in roots if name.split('/')[0] in tracked]
    if fingerprint==LEGACY_FINGERPRINT:
        evidence=[]
        for group,number in [('foundations','037'),('vectors','038'),('forces','041')]:
            evidence+=['tests/corpus/browser-experiments-'+group+'.mjs','editorial/reviews/experiments-'+group+'-'+number+'-browser-originals.json']
    else:
        evidence=[]
        for group,number in [('force-work','045'),('energy-momentum','046')]:
            evidence+=['tests/corpus/browser-experiments-'+group+'-'+number+'.mjs','editorial/reviews/experiments-'+group+'-'+number+'-browser-originals.json','editorial/reviews/evidence/'+group+'-'+number+'-negative-20261125']
    home=tempfile.TemporaryDirectory(prefix='cric-frozen-negative-runtime-')
    try:
        used=_extract(repo,commit,roots,home.name,64*1024*1024)
        _extract(repo,EVIDENCE_COMMIT,evidence,home.name,64*1024*1024-used)
        frozen=Path(home.name)/'officina-di-fisica'
        # Only these installed audit inputs are copied. They are included in the
        # full known fingerprint; no symlink/hardlink or current-runtime alias.
        for name in AUDIT_DEPENDENCIES:
            target=frozen/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(app/name,target)
        with patch.dict(os.environ,{'ASTRA_EXTENSIONS':str(frozen/'extensions')}):_check(frozen,fingerprint)
    except BaseException:
        home.cleanup()
        raise
    atexit.register(home.cleanup)
    return frozen


@contextmanager
def reviewed_runtime(review,force=False):
    expected=review.READ_RUNTIME_PROFILE_SHA256
    if expected not in HISTORICAL_RUNTIMES:raise ValueError('Unrecognized historical review fingerprint')
    current=review.APP
    frozen=current if not force and runtime_fingerprint(current)['sha256']==expected else historical_app(current,expected)
    with patch.object(review,'APP',frozen),patch.dict(os.environ,{'ASTRA_EXTENSIONS':str(frozen/'extensions')}):
        _check(frozen,expected)
        try:yield frozen
        finally:_check(frozen,expected)
