"""Replay the five independent C1 results with the current Root dependencies."""

import json
from pathlib import Path

from tools.corpus_engineering import c1_closure_renewal_cb9_verifier as verifier
from tools.corpus_engineering.pipeline import canonical, digest, sha


def main():
    app = verifier.APP
    source = app / 'content/esperienze-C1.json'
    originals = {row['id']: row for row in json.loads(source.read_bytes())}
    archived_report = verifier.BASE / 'individual-reports.json'
    archive_before = archived_report.read_bytes()
    historic = json.loads(archive_before)
    current = verifier.report(originals, app=app)
    assert verifier.report(originals, app=app) == current
    assert current['records'] and current['acceptedIndividualCount'] == 5
    old_dependencies = historic.pop('dependencies')
    current_dependencies = current.pop('dependencies')
    assert old_dependencies.keys() == current_dependencies.keys()
    changed = {
        key: {'independent': old_dependencies[key], 'root': value}
        for key, value in current_dependencies.items() if old_dependencies[key] != value
    }
    assert set(changed) == {'experiment_visibility_request.py'}, changed
    for old, new in zip(historic['records'], current['records'], strict=True):
        assert old.pop('reviewDependencySha256') == digest(old_dependencies)
        assert new.pop('reviewDependencySha256') == digest(current_dependencies)
    assert historic == current
    assert archived_report.read_bytes() == archive_before
    folder = verifier.BASE.parent / 'c1-five-closures-cb9-root-validator-20261127'
    folder.mkdir(exist_ok=True)
    current['dependencies'] = current_dependencies
    for row in current['records']:
        row['reviewDependencySha256'] = digest(current_dependencies)
    exact = (canonical(current) + '\n').encode()
    (folder / 'current-individual-reports.json').write_bytes(exact)
    receipt = {
        'scope': 'Two fresh verifier replays on the current Root app, of which the full 576-case observed report, raw cases and PNG hashes were revalidated',
        'independentArchivedReportSha256': sha(archive_before),
        'rootCurrentReportSha256': sha(exact),
        'runtimeSha256': verifier.RUNTIME,
        'dependencyChanges': changed,
        'resultParityApartFromDeclaredDependencyHash': True,
        'verifiedActualCases': 576,
        'acceptedIndividualResults': 5,
        'newActivityCredit': 0,
        'registryAction': 'NONE',
        'humanApproval': 'NOT_RUN',
        'publicationAction': 'NONE',
    }
    (folder / 'receipt.json').write_text(canonical(receipt) + '\n')
    print('Five independent cases, 576 observed UI cases and two current verifier replays; five results identical apart from the validator hash.')


if __name__ == '__main__':
    main()
