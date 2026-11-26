"""Read-only review of an immutable adoption tree; no adopter or verifier runs.

The only writes are a bounded temporary reconstruction and this own receipt.
Metadata stored by the integrator is corroborated internally, not re-fetched.
"""
from pathlib import Path
import ast
import fcntl
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import zipfile

BASE = Path(__file__).resolve().parent
REPO = Path(os.environ.get('CRIC_REVIEW_SOURCE_REPO', '/private/tmp/cric-resident-integrator'))
REF = 'aa7577b74fa275a127194cdbaad93c60aa3a007a'
PREFIX = 'officina-di-fisica/'
FOLDER = PREFIX + 'editorial/reviews/preintegration-45849149030-root-adoption-20261125/'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO)


def read(path):
    return git('show', REF + ':' + path)


def main():
    assert shutil.disk_usage(BASE).free >= 2 * 1024**3
    assert git('rev-parse', REF).decode().strip() == REF
    receipt_raw = read(FOLDER + 'receipt.json')
    receipt = json.loads(receipt_raw)
    assert receipt['runId'] == 45849149030
    assert receipt['headSha'] == '68c9553132877606f0cb957267ae31c5f3359a08'
    assert receipt['humanApproval'] == 'NOT_RUN' and receipt['publicationAction'] == 'NONE'
    assert receipt['requiredPRCIOnCurrentHead'] == 'NOT_RUN_YET'
    assert receipt['canonicalMerge'] == 'NOT_DONE'  # adoption-time statement
    files = receipt['filesAdopted']
    assert len(files) == 772
    tree = git('ls-tree', '-r', '-z', REF).split(b'\0')
    objects = {}
    for entry in tree:
        if not entry:
            continue
        mode_type_oid, path = entry.split(b'\t', 1)
        mode, typ, oid = mode_type_oid.split()
        objects[path.decode()] = (mode, typ, oid)
    # Use immutable Git objects, never current worktree bytes.
    batch = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=REPO,
                             stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    def object_bytes(path):
        mode, typ, oid = objects[path]
        assert mode in (b'100644', b'100755') and typ == b'blob', path
        batch.stdin.write(oid + b'\n'); batch.stdin.flush()
        _, kind, size = batch.stdout.readline().split()
        assert kind == b'blob'
        raw = batch.stdout.read(int(size))
        assert batch.stdout.read(1) == b'\n'
        return raw
    try:
        for rel, pin in files.items():
            assert sha(object_bytes(PREFIX + rel)) == pin, rel
        for rel, pin in receipt['priorChangedFilesArchived'].items():
            assert sha(object_bytes(FOLDER + 'prior/' + rel)) == pin, rel
        with tempfile.TemporaryFile() as archive:
            joined = hashlib.sha256(); size = 0
            parts = receipt['boundedVerbatimArtifactParts']
            assert len(parts) == 4
            for number, part in enumerate(parts, 1):
                assert part['path'].endswith(f'.part-{number:03d}')
                raw = object_bytes(PREFIX + part['path'])
                assert len(raw) == part['bytes'] and sha(raw) == part['sha256']
                archive.write(raw); joined.update(raw); size += len(raw)
            assert size == receipt['artifactBytes'] == 143384677
            assert joined.hexdigest() == receipt['artifactSha256']
            archive.seek(0)
            with zipfile.ZipFile(archive) as z:
                names = z.namelist()
                assert len(names) == len(set(names))
                assert z.testzip() is None
                expected = {n.removeprefix('preintegration/delivery/'): n for n in names
                            if n.startswith('preintegration/delivery/') and not n.endswith('/')}
                assert set(expected) == set(files)
                for rel, name in expected.items():
                    assert sha(z.read(name)) == files[rel], rel
                full = z.read('preintegration-full-tests.log')
                assert b'Ran 957 tests in 604.148s\n\nOK' in full
                assert sha(z.read('preintegration/officina-release.zip')) == receipt['releaseSha256']
                checkpoint = json.loads(z.read(expected['editorial/corpus/checkpoint.json']))
                assert checkpoint == receipt['checkpoint']
                generation = 'editorial/corpus/' + checkpoint['generation'] + '/'
                assert sha(z.read(expected[generation + 'manifest.json'])) == checkpoint['manifestSha256']
                for line in z.read(expected[generation + 'SHA256SUMS']).decode().splitlines():
                    digest, name = line.split('  ', 1)
                    assert sha(z.read(expected[generation + name])) == digest
                index = json.loads(z.read(expected['editorial/reviews/runtime1a3502eb7459-terminal-evidence/index.json']))
                assert (index['savedBatches'], index['savedCases']) == (229, 10467)
                assert len(index['entries']) == 229
                assert len({e['batch'] for e in index['entries']}) == 229
                for e in index['entries']:
                    assert sha(object_bytes(PREFIX + 'editorial/batches/' + e['batch'] + '.json')) == e['packageFileSha256']
                    for field, hashfield in [('reportPath', 'reportSha256'), ('terminalMarkerPath', 'terminalMarkerSha256')]:
                        assert sha(z.read(expected[e[field]])) == e[hashfield]
                assert sha(object_bytes(PREFIX + 'editorial/batches/registry.json')) == index['registrySha256']
                coexist = json.loads(z.read('preintegration/registry-coexistence.json'))
                assert coexist['beforePublishedCount'] == coexist['afterPublishedCount'] == 991
                assert coexist['beforePublishedSha256'] == coexist['afterPublishedSha256']
                assert coexist['newPublications'] == 0
                direct_logs = [n for n in ['preintegration-full-tests.log', 'preintegration-fresh.log',
                               'preintegration-incremental.log', 'preintegration-batches.log']
                               if FOLDER + n not in objects]
                assert len(direct_logs) == 4
                log_pins = {n: sha(z.read(n)) for n in direct_logs}
    finally:
        batch.stdin.close(); batch.stdout.close()
        assert batch.wait() == 0
    # Verify the transport changed only the declared run-specific constants.
    provenance = json.loads(read(FOLDER + 'adopt-458491-parameter-provenance.json'))
    old = read(PREFIX + 'editorial/reviews/preintegration-45654876359-root-adoption-20261125/reproduce-adoption.py')
    new = read(FOLDER + 'adopt-458491-verified-artifact.py')
    assert sha(old) == provenance['baseScriptSha256']
    assert sha(new) == provenance['newScriptSha256']
    replacements = provenance['constantChanges']
    class Constants(ast.NodeTransformer):
        def visit_Constant(self, node):
            value = node.value
            if isinstance(value, str):
                for before, after in replacements.items(): value = value.replace(before, after)
            elif isinstance(value, bytes):
                for before, after in replacements.items(): value = value.replace(before.encode(), after.encode())
            elif type(value) in (int, float) and str(value) in replacements:
                value = type(value)(replacements[str(value)])
            return ast.copy_location(ast.Constant(value=value), node)
    assert ast.dump(Constants().visit(ast.parse(old)), include_attributes=False) == ast.dump(ast.parse(new), include_attributes=False)
    metadata = json.loads(read(FOLDER + 'artifact-metadata.json'))['structuredContent']['artifacts'][0]
    assert metadata['id'] == receipt['artifactId']
    assert metadata['digest'] == 'sha256:' + receipt['artifactSha256']
    assert metadata['workflow_run']['id'] == receipt['runId']
    assert metadata['workflow_run']['head_sha'] == receipt['headSha']
    jobs = json.loads(read(FOLDER + 'runner-job-metadata.json'))['structuredContent']['jobs']
    job = next(j for j in jobs if j['id'] == receipt['jobId'])
    assert job['run_id'] == receipt['runId'] and job['conclusion'] == 'success'
    assert all(s['conclusion'] == 'success' for s in job['steps'])
    out = {'reviewedCommit': REF, 'receiptSha256': sha(receipt_raw),
           'reviewedScriptSha256': sha(new), 'exactCommittedAdoptedFiles': len(files),
           'exactArchivedPriorFiles': len(receipt['priorChangedFilesArchived']),
           'artifactParts': len(parts), 'artifactBytes': size,
           'artifactSha256': joined.hexdigest(), 'zipCrcAllMembers': 'PASS',
           'deliverySetAndAllBytesMatchCommit': True, 'constantOnlyAstChange': True,
           'checkpoint': checkpoint, 'uiEvidenceMetadata': {'batches': 229, 'cases': 10467},
           'directUntrackedLogsAvailableOnlyInExactArchive': log_pins,
           'runnerSuiteLogObserved': {'tests':957, 'seconds':604.148},
           'scope': 'Immutable committed transport bytes and retained runner metadata; no live GitHub fetch, adopter execution, Node validator, UI or scientific rerun.',
           'newScientificAcceptances':0, 'newUiCases':0, 'activityCredit':0,
           'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    (BASE / 'committed-transport-checks.json').write_text(json.dumps(out, indent=2) + '\n')
    print(json.dumps(out, sort_keys=True))


if __name__ == '__main__':
    with open('/private/tmp/cric-bounded-local-work.lock', 'a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        main()
