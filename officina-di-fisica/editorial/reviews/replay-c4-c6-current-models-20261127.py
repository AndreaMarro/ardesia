"""Run the existing independent C4–C6 model comparisons on the current app."""

import importlib
import json
import subprocess
from pathlib import Path

from tools.corpus_engineering.pipeline import canonical, git_bytes, sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint


RUNTIME = 'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49'


def review_course(app, output, course):
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
        raw_result.write_bytes(run.stdout)
        compared = module.compare(group, proof, sources)
        assert {row['id'] for row in compared} == set(proof['sourceIds'])
        report = output / f'{course}-{group}-comparison.json'
        report.write_text(canonical(compared) + '\n')
        results.extend(compared)
        status[group] = {'rawSha256': sha(run.stdout), 'comparisonsSha256': sha(report.read_bytes()),
                         'observedExit': run.returncode, 'records': len(compared),
                         'codeStates': sum(len(row['cases']) for row in proof['records'])}
    assert {row['id'] for row in results} == set(sources)
    return {'independentPrimarySha256': primary_sha, 'verifierSha256': sha(Path(module.__file__).read_bytes()),
            'collectorSha256': protocol_sha, 'groups': status, 'recordCount': len(results),
            'positiveSourceMath': sum(row['sourceMathAndActualTasksOk'] is True for row in results),
            'sourceManualityFailures': [row['id'] for row in results if row.get('ManualityFailure')],
            'manualSupportGaps': [row['id'] for row in results if row.get('ManualSupportGap')],
            'consumerCodeGeometryFailures': [row['id'] for row in results if not row['consumerCodeGeometryOk']]}


def main():
    app = Path.cwd()
    before = runtime_fingerprint(app)
    if before['sha256'] != RUNTIME:
        raise ValueError('Unexpected current runtime')
    output = Path(__file__).resolve().parent / 'c4-c6-current-models-20261127'
    output.mkdir(exist_ok=True)
    courses = {key: review_course(app, output, key) for key in ('C4', 'C5', 'C6')}
    assert runtime_fingerprint(app) == before
    assert sum(row['recordCount'] for row in courses.values()) == 62
    receipt = {'runtimeSha256': RUNTIME, 'courses': courses,
               'scope': 'Fresh installed-code replay and independent source math. Original edition only. Browser and draft evidence are separate.',
               'currentActivityCredit': 0, 'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    (output / 'receipt.json').write_text(canonical(receipt) + '\n')
    print('Replayed all 62 original C4–C6 activity models with the current installed app; no browser acceptance.')


if __name__ == '__main__':
    main()
