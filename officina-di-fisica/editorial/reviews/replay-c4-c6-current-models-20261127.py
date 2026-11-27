"""Replay existing independent course model comparisons on a pinned app."""

import argparse
import gzip
import importlib
import json
import subprocess
from pathlib import Path

from tools.corpus_engineering.pipeline import canonical, git_bytes, sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


RUNTIME = 'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'


def review_course(app, output, course, compress_raw=False):
    module = importlib.import_module(f'tools.corpus_engineering.experiments_{course}_code_partial_verifier')
    primary = app / module.PRIMARY
    protocol = app / module.PROTOCOL
    primary_sha = sha(primary.read_bytes())
    protocol_sha = sha(protocol.read_bytes())
    if primary_sha != module.PRIMARY_SHA:
        raise ValueError('Independent source model snapshot drifted: ' + course)
    raw = git_bytes(app.parent, module.REF, module.SOURCE)
    if sha(raw) != module.SOURCE_SHA or raw != (app / Path(module.SOURCE).relative_to(app.name)).read_bytes():
        raise ValueError('Original activity source drifted: ' + course)
    sources = {row['id']: row for row in json.loads(raw)}
    results, status = [], {}
    for group in module.GROUPS:
        run = subprocess.run(['node', str(protocol), group], cwd=app, capture_output=True, timeout=60)
        (output / f'{course}-{group}-stderr.txt').write_bytes(run.stderr)
        if run.returncode:
            raise RuntimeError(f'Existing model collector {course}/{group} exited {run.returncode}')
        proof = json.loads(run.stdout)
        expected = {
            'group': group, 'sourcePath': module.SOURCE, 'sourceFileSha256': module.SOURCE_SHA,
            'sourceRef': module.REF, 'protocolSha256': protocol_sha, 'UI': 'NOT_RUN',
            'scientificApproval': False, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE',
        }
        if any(proof.get(key) != value for key, value in expected.items()):
            raise ValueError('Actual code collector emitted a mismatched report')
        raw_result = output / f'{course}-{group}-actual.json'
        if compress_raw:
            raw_result = raw_result.with_suffix('.json.gz')
            raw_result.write_bytes(gzip.compress(run.stdout, mtime=0))
        else:
            raw_result.write_bytes(run.stdout)
        compared = module.compare(group, proof, sources)
        assert {row['id'] for row in compared} == set(proof['sourceIds'])
        report = output / f'{course}-{group}-comparison.json'
        report.write_text(canonical(compared) + '\n')
        results.extend(compared)
        status[group] = {'rawSha256': sha(run.stdout), 'artifact': raw_result.name,
                         'artifactSha256': sha(raw_result.read_bytes()), 'comparisonsSha256': sha(report.read_bytes()),
                         'observedExit': run.returncode, 'records': len(compared),
                         'codeStates': sum(len(row['cases']) for row in proof['records'])}
    if len(results) != len(sources) or {row['id'] for row in results} != set(sources):
        raise ValueError('Incomplete or duplicate course source coverage: ' + course)
    return {'independentPrimarySha256': primary_sha, 'verifierSha256': sha(Path(module.__file__).read_bytes()),
            'collectorSha256': protocol_sha, 'groups': status, 'recordCount': len(results),
            'positiveSourceMath': sum(row['sourceMathAndActualTasksOk'] is True for row in results),
            'sourceManualityFailures': [row['id'] for row in results if row.get('ManualityFailure')],
            'manualSupportGaps': [row['id'] for row in results if row.get('ManualSupportGap')],
            'consumerCodeGeometryFailures': [row['id'] for row in results if not row['consumerCodeGeometryOk']]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--course', choices=('C3', 'C4', 'C5', 'C6'), action='append')
    parser.add_argument('--runtime', default=RUNTIME)
    parser.add_argument('--commit')
    parser.add_argument('--output', type=Path)
    parser.add_argument('--compress-raw', action='store_true')
    args = parser.parse_args()
    app = Path.cwd()
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=app, text=True).strip()
    if args.commit and head != args.commit:
        raise ValueError('Unexpected source checkout')
    before = runtime_fingerprint(app)
    if before['sha256'] != args.runtime:
        raise ValueError('Unexpected current runtime')
    if args.output is None and (args.course or args.runtime != RUNTIME or args.compress_raw):
        parser.error('--output is required for a different course, runtime or archive format')
    output = args.output or Path(__file__).resolve().parent / 'c4-c6-current-models-20261127'
    output.mkdir(parents=True, exist_ok=True)
    names = args.course or ['C4', 'C5', 'C6']
    if len(set(names)) != len(names):
        raise ValueError('Each course must be requested once')
    courses = {key: review_course(app, output, key, args.compress_raw) for key in names}
    if runtime_fingerprint(app) != before:
        raise ValueError('Application runtime changed during collection')
    receipt = {'sourceCommit': head, 'runtimeSha256': args.runtime, 'courses': courses,
               'scope': 'Fresh installed-code replay and independent source math. Original editions only.',
               'currentActivityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    (output / 'receipt.json').write_text(canonical(receipt) + '\n')
    print('Replayed', sum(row['recordCount'] for row in courses.values()), 'original models.')

if __name__ == '__main__':
    main()
