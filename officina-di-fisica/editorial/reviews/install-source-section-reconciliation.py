"""Install the reviewed section-only staging candidates and retain their old inputs."""

import argparse
import importlib
import json
from pathlib import Path
import runpy

from tools.corpus_engineering import batches
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.section_reconciliation import pinned_history, verify_reconciliation


def install(bundle):
    app = Path.cwd()
    helpers = runpy.run_path('editorial/reviews/cric-c6-register-verified-root-20261127.py')
    load, dump, atomic, sha = (helpers[key] for key in ('load', 'dump', 'atomic', 'sha'))
    registry, work, operations = (helpers[key] for key in ('REGISTRY', 'WORK', 'OPERATIONS'))
    before_registry = registry.read_bytes()
    specs = load(registry)
    spec_by_name = {entry['id']: entry for entry in specs['batches']}
    raw_receipt = (bundle / 'preparation-receipt.json').read_bytes()
    prepared = json.loads(raw_receipt)
    entries = prepared['batches']
    assert len(entries) == len({row['id'] for row in entries}) == 25
    assert sum(len(row['reconciled']) for row in entries) == 250
    assert len({key for row in entries for key in row['reconciled']}) == 250
    provenance = app / 'editorial/reviews/section-reconciliation-v1'
    provenance.mkdir(exist_ok=True)
    snapshots, pins = {}, {}

    def write(relative, raw, *, allowed=None):
        dest = app / relative
        before = dest.read_bytes() if dest.is_file() else None
        if allowed is not None and before != raw and before not in allowed:
            raise ValueError('Concurrent or unrelated content change: ' + str(relative))
        if before == raw:
            return
        snapshots[dest] = before
        dest.parent.mkdir(parents=True, exist_ok=True)
        atomic(dest, raw)

    try:
        for entry in entries:
            batch = entry['id']
            current = spec_by_name[batch]
            folder = Path('editorial/reviews/section-reconciliation-v1') / batch
            package_file = Path('editorial/batches') / (batch + '.json')
            binding_file = Path('editorial/batches') / (batch + '-bindings.json')
            integration_file = Path('editorial/reviews') / (batch + '-integration.json')
            certificate_file = folder / 'certificate.json'
            old_integration = folder / 'original-integration.json'
            new_report = (bundle / integration_file).read_bytes()
            assert sha(new_report) == entry['integrationSha256']
            if not (app / old_integration).exists():
                write(old_integration, (app / integration_file).read_bytes(), allowed={None})
            old_artifacts = ['original-package.json', 'original-bindings.json', 'certificate.json']
            for name in old_artifacts:
                target = folder / name
                write(target, (bundle / target).read_bytes(), allowed={None})
            assert sha((app / certificate_file).read_bytes()) == entry['sectionReconciliationSha256']
            assert set(current['questionIds']) == set(entry['reconciled'])
            assert current.get('sectionReconciliationSha256') in (None, entry['sectionReconciliationSha256'])
            current['sectionReconciliationSha256'] = entry['sectionReconciliationSha256']
            for target, original in ((package_file, 'original-package.json'), (binding_file, 'original-bindings.json')):
                write(target, (bundle / target).read_bytes(), allowed={(app / folder / original).read_bytes()})
            write(integration_file, new_report, allowed={(app / old_integration).read_bytes()})
            package, bindings = load(app / package_file), load(app / binding_file)
            historic_package, historic_bindings, historic_pins = pinned_history(app, batch)
            historical_science = app / 'editorial/reviews' / (batch + '.json')
            scientific = load(historical_science)
            verifier = importlib.import_module('tools.corpus_engineering.' + current['verifier'])
            original_proof = verifier.verify(historic_package, historic_bindings)
            ids = set(current['questionIds'])
            assert original_proof == scientific['records'] and len(original_proof) == 10
            assert scientific['verifierSha256'] == sha(Path(verifier.__file__).read_bytes())
            batches.assert_record_identity(original_proof, ids, historic_package, historic_bindings)
            proof, certificate = verify_reconciliation(
                app, current, historic_package, historic_bindings, historic_pins,
                historical_science, package, bindings, original_proof,
            )
            batches.assert_record_identity(proof, ids, package, bindings)
            assert load(app / integration_file)['packageSha256'] == digest(package)
            pins[batch] = {'certificateSha256': sha(certificate.read_bytes()),
                           'integrationSha256': entry['integrationSha256'], 'questionIds': current['questionIds']}
        candidate_registry = dump(specs)
        current_status, ops = load(work), load(operations)
        assert current_status['registrySha256'] in {sha(before_registry), sha(candidate_registry)}
        assert current_status['reviewedQuestions'] == 4606 and current_status['remainingQuestions'] == 0
        if before_registry == candidate_registry:
            persisted = load(provenance / 'installation-receipt.json')
            assert persisted['registrySha256'] == sha(candidate_registry) and persisted['batches'] == pins
            print('Section reconciliation already installed and verified')
            return
        current_status['registrySha256'] = sha(candidate_registry)
        ops['sectionReconciliation'] = {'candidateCount': 250, 'batchCount': 25, 'actualFreshPreviews': 'PENDING',
                                        'priorRegistrySha256': sha(before_registry), 'publicationAction': 'NONE'}
        write(Path('editorial/reviews/section-reconciliation-v1/prior-registry.json'), before_registry, allowed={None})
        summary = {'registrySha256': sha(candidate_registry), 'preparationReceiptSha256': sha(raw_receipt),
                   'correctedQuestions': 250, 'historicalScientificReportsReplayed': 25, 'batches': pins,
                   'replacedDraftsAlreadyInExternalDatabase': 'REQUIRES_NATIVE_EDITION_UPDATE_IF_CONFLICTING',
                   'newSourceQuestionCredit': 0, 'fullBrowserApproval': 'PENDING',
                   'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}
        write(Path('editorial/reviews/section-reconciliation-v1/installation-receipt.json'), dump(summary), allowed={None})
        write(work.relative_to(app), dump(current_status))
        write(operations.relative_to(app), dump(ops))
        write(registry.relative_to(app), candidate_registry, allowed={before_registry})
        loaded = batches.load_registry(registry)
        assert len({key for item in loaded for key in item['questionIds']}) == 4606
    except BaseException:
        for path, prior in reversed(list(snapshots.items())):
            if prior is None:
                path.unlink()
            else:
                atomic(path, prior)
        raise
    print('All 250 reconciled sections installed in staging. Individual old science and active identities replayed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('--bundle', type=Path, required=True)
    install(parser.parse_args().bundle)
