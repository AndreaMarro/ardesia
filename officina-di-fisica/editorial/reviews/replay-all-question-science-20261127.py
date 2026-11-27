"""Reproduce every registered independent question oracle before the browser gate."""

import importlib
import json
import time
from pathlib import Path

from tools.corpus_engineering import batches
from tools.corpus_engineering.acceptance_withdrawals import acceptance_audit
from tools.corpus_engineering.pipeline import canonical, sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
from tools.corpus_engineering.section_reconciliation import pinned_history, verify_reconciliation


def replay(app, spec):
    batch = spec['id']
    expected = set(spec['questionIds'])
    acceptance_audit(spec, expected, app)
    package_file = app / 'editorial/batches' / (batch + '.json')
    binding_file = app / 'editorial/batches' / (batch + '-bindings.json')
    report_file = app / 'editorial/reviews' / (batch + '.json')
    raw = {name: file.read_bytes() for name, file in [('package', package_file), ('bindings', binding_file),
                                                     ('report', report_file)]}
    package, bindings, stored_report = (json.loads(raw[name]) for name in ('package', 'bindings', 'report'))
    if 'sectionReconciliationSha256' in spec:
        old_package, old_bindings, old_pins = pinned_history(app, batch)
    else:
        old_package, old_bindings = package, bindings
    verifier = importlib.import_module('tools.corpus_engineering.' + spec['verifier'])
    assert stored_report['verifierSha256'] == sha(Path(verifier.__file__).read_bytes())
    if 'contractSha256' in stored_report:
        assert stored_report['contractSha256'] == sha(Path(batches.__file__).with_name('review_contract.py').read_bytes())
    current = verifier.verify(old_package, old_bindings)
    batches.assert_record_identity(current, expected, old_package, old_bindings)
    if current != stored_report['records']:
        raise ValueError(canonical(batches.report_differences(stored_report['records'], current)))
    if 'sectionReconciliationSha256' in spec:
        current, _ = verify_reconciliation(app, spec, old_package, old_bindings, old_pins, report_file,
                                           package, bindings, current)
    batches.assert_record_identity(current, expected, package, bindings)
    assert raw == {name: file.read_bytes() for name, file in [('package', package_file), ('bindings', binding_file),
                                                              ('report', report_file)]}
    evidence = [{'id': row['id'], 'candidateSha256': row['candidateSha256'], 'sourceSha256': row['sourceSha256'],
                 'scientificOrCompositeSignature': row['reviewedSignature'], 'verificationMode': row['verificationMode']}
                for row in current]
    return {'batch': batch, 'inputs': {name+'Sha256': sha(value) for name, value in raw.items()},
            'verifierSha256': stored_report['verifierSha256'], 'records': evidence}


def main():
    app = Path.cwd()
    folder = Path(__file__).resolve().parent / 'full-question-science-replay-20261127'
    folder.mkdir(exist_ok=True)
    registry = app / 'editorial/batches/registry.json'
    before, runtime = registry.read_bytes(), runtime_fingerprint(app)
    specs = batches.load_registry(registry)
    results, defects = [], []
    start = time.monotonic()
    for spec in specs:
        try:
            results.append(replay(app, spec))
        except Exception as error:
            defects.append({'batch': spec['id'], 'ids': spec['questionIds'], 'error': type(error).__name__,
                            'detail': str(error)[:6000]})
        if (len(results) + len(defects)) % 20 == 0:
            print(len(results), 'successful batches and', len(defects), 'unsuccessful batches', flush=True)
    assert registry.read_bytes() == before and runtime_fingerprint(app) == runtime
    ids = [row['id'] for group in results for row in group['records']]
    assert len(ids) == len(set(ids))
    assert len(ids) + sum(len(row['ids']) for row in defects) == 4606
    outcome = {'runtimeSha256': runtime['sha256'], 'registrySha256': sha(before), 'elapsedSeconds': time.monotonic()-start,
               'sourceRecords': 4606, 'freshRecordedSourceIds': len(ids), 'completedBatches': len(results),
               'findings': defects, 'results': results, 'independentVerificationScope': 'SCIENCE_ONLY',
               'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    (folder / 'receipt.json').write_text(canonical(outcome) + '\n')
    print('Replayed questions', len(ids), 'out of 4606; failed batches', len(defects), flush=True)
    if defects:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
