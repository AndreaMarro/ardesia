"""Produce replacement candidates and archived inputs for the registered Cric lots."""

import argparse
import json
from pathlib import Path

from tools.corpus_engineering import section_reconciliation
from tools.corpus_engineering.integration import exercise_package
from tools.corpus_engineering.pipeline import canonical, digest, sha


def package_bytes(package):
    return (json.dumps(package, indent=2, ensure_ascii=False) + '\n').encode()


def prepare(app, item, output):
    batch = item['batch']
    directory = section_reconciliation.reconciliation_folder(output, batch)
    assert item['packagePath'] == f'editorial/batches/{batch}.json'
    assert item['bindingPath'] == f'editorial/batches/{batch}-bindings.json'
    old_package_raw = (app / item['packagePath']).read_bytes()
    old_bindings_raw = (app / item['bindingPath']).read_bytes()
    assert sha(old_package_raw) == item['oldPackageFileSha256'], batch
    assert sha(old_bindings_raw) == item['oldBindingsFileSha256'], batch
    old_package, old_bindings = json.loads(old_package_raw), json.loads(old_bindings_raw)
    package, bindings = json.loads(old_package_raw), json.loads(old_bindings_raw)
    edits = {row['id']: row for row in item['changes']}
    assert len(edits) == len(item['changes'])
    by_id = {row['id']: row for row in bindings}
    for row in package['records']:
        if row['id'] not in edits:
            continue
        edit = edits[row['id']]
        assert row['section'] == edit['oldSection'] and digest(row) == edit['oldCandidateSha256']
        row['section'] = edit['newSection']
        by_id[row['id']]['candidateSha256'] = digest(row)
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'original-package.json').write_bytes(old_package_raw)
    (directory / 'original-bindings.json').write_bytes(old_bindings_raw)
    candidate_file = output / item['packagePath']
    binding_file = output / item['bindingPath']
    candidate_file.parent.mkdir(parents=True, exist_ok=True)
    candidate_file.write_bytes(package_bytes(package))
    binding_file.write_text(canonical(bindings) + '\n')
    science_file = app / 'editorial/reviews' / (batch + '.json')
    pins = {'package': sha(old_package_raw), 'bindings': sha(old_bindings_raw)}
    result = section_reconciliation.build_certificate(
        app, batch, old_package, old_bindings, pins, science_file, candidate_file, binding_file,
    )
    assert set(result['identityProof']['changedIds']) == set(edits)
    certificate_file = directory / 'certificate.json'
    certificate_file.write_text(canonical(result) + '\n')
    integration = exercise_package(candidate_file)
    count = len(package['records'])
    assert (integration['firstImport']['saved'], integration['repeatedImport']['saved'],
            integration['repeatedImport']['unchanged']) == (count, 0, count)
    assert integration['beforePublishedCount'] == integration['afterPublishedCount'] == 991
    assert integration['beforePublishedSha256'] == integration['afterPublishedSha256']
    integration_file = output / 'editorial/reviews' / (batch + '-integration.json')
    integration_file.write_text(canonical(integration) + '\n')
    return {'id': batch, 'sectionReconciliationSha256': sha(certificate_file.read_bytes()),
            'integrationSha256': sha(integration_file.read_bytes()), 'verifiedQuestionCount': count,
            'reconciled': sorted(edits)}


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--plan-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--batch', action='append')
    args = parser.parse_args()
    app = Path.cwd()
    raw = args.plan.read_bytes()
    assert args.plan_sha256 == sha(raw)
    plan = json.loads(raw)
    output = args.output.resolve()
    if output == app or output.is_relative_to(app) or (output.exists() and any(output.iterdir())):
        raise ValueError('Provide an empty isolated output directory')
    selected = [batch for batch in plan['packages'] if not args.batch or batch['batch'] in args.batch]
    assert selected and (not args.batch or {r['batch'] for r in selected} == set(args.batch))
    results = [prepare(app, item, output) for item in selected]
    receipt = {'schemaVersion': '1.0.0', 'planSha256': args.plan_sha256, 'batches': results,
               'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
    (output / 'preparation-receipt.json').write_text(canonical(receipt) + '\n')
    print('Exact section reconciliation and repeat import passed for', sum(len(r['reconciled']) for r in results), 'IDs')


if __name__ == '__main__':
    main()
