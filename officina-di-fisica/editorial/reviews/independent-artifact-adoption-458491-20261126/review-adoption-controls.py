"""Bounded temp-only probes of exact AST blocks from the reviewed adopter.

No adopter main(), GitHub call, Node validator, real APP write or scientific
verifier is run. Only the noted transport control-flow blocks are executed.
"""
from pathlib import Path
import ast
import fcntl
import hashlib
import json
import os
import shutil
import subprocess
from tempfile import TemporaryDirectory
from types import SimpleNamespace

BASE = Path(__file__).resolve().parent
SOURCE = BASE / 'adopt-458491-verified-artifact.py'
EXPECTED = '5f98f2d806d27338e9521a3a6433832a7fbcf1070dc3bde28a5c43314ee9e040'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def target(node, name):
    return isinstance(node, ast.Assign) and any(isinstance(x, ast.Name) and x.id == name for x in node.targets)


def run(nodes, scope):
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(SOURCE), 'exec'), scope)


def main():
    assert shutil.disk_usage(BASE).free >= 2 * 1024**3
    raw = SOURCE.read_bytes()
    assert sha(raw) == EXPECTED
    tree = ast.parse(raw)
    main_node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'main')
    block = next(n for n in main_node.body if isinstance(n, ast.With)).body
    start = next(i for i,n in enumerate(block) if target(n, 'old_receipt'))
    end = next(i for i,n in enumerate(block) if target(n, 'delivery'))
    prior_nodes = block[start:end]
    end_members = next(i for i,n in enumerate(block) if target(n, 'paths'))
    membership_nodes = block[end:end_members+1]
    tail_start = next(i for i,n in enumerate(block) if target(n, 'p'))
    tail_end = next(i for i,n in enumerate(block) if target(n, 'receipt'))
    tail_nodes = block[tail_start:tail_end]
    checks = []
    with TemporaryDirectory(prefix='cric-adoption-controls-') as folder:
        temp = Path(folder)
        app = temp/'app'; dest = app/'review'; staging = app/'staging'
        dest.mkdir(parents=True)
        delivery = staging/'preintegration/delivery'; delivery.mkdir(parents=True)
        pointer = delivery/'editorial/corpus/checkpoint.json'; pointer.parent.mkdir(parents=True)
        pointer.write_bytes(b'NEW VERIFIED POINTER')
        members = ['preintegration/delivery/editorial/corpus/checkpoint.json']
        scope = {'Path':Path, 'json':json, 'sha':sha, 'DEST':dest, 'TMP':staging,
                 'z':SimpleNamespace(namelist=lambda:members)}
        run(membership_nodes, scope)
        assert scope['paths'] == [pointer]
        checks.append('exact staging membership accepted')
        stale = delivery/'editorial/stale-not-in-archive.txt'; stale.write_bytes(b'UNPINNED')
        try:
            run(membership_nodes, scope)
        except AssertionError as error:
            assert 'Unpinned residual' in str(error)
            checks.append('unlisted staging residual rejected')
        else:
            raise AssertionError('Residual accepted')
        stale.unlink()
        backup = dest/'prior/editorial/corpus/checkpoint.json'; backup.parent.mkdir(parents=True)
        backup.write_bytes(b'OLD ARCHIVED POINTER')
        run(prior_nodes, scope)
        expected_prior = {'editorial/corpus/checkpoint.json':sha(backup.read_bytes())}
        assert scope['prior'] == expected_prior
        checks.append('prior recovered without an earlier receipt after interruption')
        (dest/'receipt.json').write_text(json.dumps({'priorChangedFilesArchived':expected_prior}))
        run(prior_nodes, scope)
        assert scope['prior'] == expected_prior
        checks.append('normal rerun preserves prior map')
        backup.write_bytes(b'ALTERED ARCHIVE')
        try:
            run(prior_nodes, scope)
        except AssertionError as error:
            assert 'Archived prior evidence changed' in str(error)
            checks.append('present archived-prior tampering rejected')
        else:
            raise AssertionError('Prior archive drift accepted')
        backup.write_bytes(b'OLD ARCHIVED POINTER')
        pointer_target = app/'editorial/corpus/checkpoint.json'; pointer_target.parent.mkdir(parents=True)
        pointer_target.write_bytes(b'OLD ACTIVE POINTER')
        payload = app/'editorial/report.json'; payload.write_bytes(b'CURRENT REPORT')
        observed_calls = []
        def persistence(status):
            def call(*args, **kwargs):
                observed_calls.append((args, kwargs))
                return subprocess.CompletedProcess(args[0], status, stdout=b'temp-only stub: no Node invoked')
            return SimpleNamespace(run=call, PIPE=subprocess.PIPE, STDOUT=subprocess.STDOUT)
        tail = {'APP':app,'DEST':dest,'TMP':staging,'index':{'runtimeSha256':'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'},
                'env':{},'sha':sha,'os':os,'pointer':pointer,'pointer_target':pointer_target,
                'adopted':{'editorial/report.json':sha(payload.read_bytes())},'subprocess':persistence(1)}
        try:
            run(tail_nodes, tail)
        except AssertionError:
            assert pointer_target.read_bytes() == b'OLD ACTIVE POINTER'
            checks.append('failed terminal persistence cannot advance active pointer')
        else:
            raise AssertionError('Persistence failure accepted')
        tail['subprocess'] = persistence(0)
        payload.write_bytes(b'ALTERED AFTER INSTALLATION')
        try:
            run(tail_nodes, tail)
        except AssertionError:
            assert pointer_target.read_bytes() == b'OLD ACTIVE POINTER'
            checks.append('post-installation payload drift cannot advance active pointer')
        else:
            raise AssertionError('Installed payload drift accepted')
        payload.write_bytes(b'CURRENT REPORT')
        run(tail_nodes, tail)
        assert pointer_target.read_bytes() == pointer.read_bytes()
        assert tail['adopted']['editorial/corpus/checkpoint.json'] == sha(pointer.read_bytes())
        assert len(observed_calls) == 3
        checks.append('pointer advances only after success and final file hashes')
    out = {'reviewedScriptSha256':EXPECTED,'checks':checks,'passedChecks':len(checks),
           'scope':'Exact AST transport blocks with tiny temp fixtures; persistence is explicitly stubbed, never a UI or validator PASS',
           'realRootWrites':0,'actualNodeRuns':0,'newScientificAcceptances':0,'newUiCases':0,
           'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    (BASE/'adoption-control-probes.json').write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps(out,sort_keys=True))


if __name__ == '__main__':
    with open('/private/tmp/cric-bounded-local-work.lock','a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        main()
