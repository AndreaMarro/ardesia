"""Bind a new source section to an unchanged independently verified payload."""

import json
import re
from pathlib import Path

from .pipeline import digest, git_bytes, sha
from . import section_identity_audit


def _read(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError('Section reconciliation requires a regular file: ' + str(path))
    return path.read_bytes()


def reconciliation_folder(app, batch):
    root = app.resolve() / 'editorial/reviews/section-reconciliation-v1'
    folder = root / batch
    if re.fullmatch(r'cric-c[1-5]-l\d{2,3}', batch) is None or folder.resolve() != folder:
        raise ValueError('Unexpected source section reconciliation path: ' + batch)
    return folder


def pinned_history(app, batch):
    folder = reconciliation_folder(app, batch)
    files = {'package': folder / 'original-package.json', 'bindings': folder / 'original-bindings.json'}
    raw = {key: _read(file) for key, file in files.items()}
    return json.loads(raw['package']), json.loads(raw['bindings']), {key: sha(value) for key, value in raw.items()}


def _source_records(app, source_ref, bindings):
    files, records = {}, {}
    for binding in bindings:
        source_path = binding['provenance']['sourcePath']
        if re.fullmatch(r'officina-di-fisica/content/C[1-5]\.json', source_path) is None:
            raise ValueError('Unexpected Cric source file during section reconciliation')
        if source_path not in files:
            raw = git_bytes(app.parent, source_ref, source_path)
            files[source_path] = {row['id']: row for row in json.loads(raw)}
        key = binding['sourceId']
        records[key] = files[source_path][key]
    return records


def build_certificate(app, batch, old_package, old_bindings, old_pins, scientific, package_file, binding_file):
    source_ref = old_bindings[0]['sourceRef']
    originals = _source_records(app, source_ref, old_bindings)
    package_raw, bindings_raw = _read(package_file), _read(binding_file)
    proof = section_identity_audit.assert_section_only(
        old_package, old_bindings, json.loads(package_raw), json.loads(bindings_raw), originals,
        source_ref=source_ref,
    )
    if not proof['changedIds']:
        raise ValueError('Section reconciliation contains no changes')
    return {
        'schemaVersion': '1.0.0',
        'batchId': batch,
        'historical': {**old_pins, 'science': sha(_read(scientific))},
        'candidate': {'package': sha(package_raw), 'bindings': sha(bindings_raw)},
        'reviewProtocolSha256': sha(_read(Path(section_identity_audit.__file__))),
        'identityProof': proof,
    }


def verify_reconciliation(app, spec, old_package, old_bindings, old_pins, scientific, package, bindings, records):
    batch = spec['id']
    folder = reconciliation_folder(app, batch)
    certificate_file = folder / 'certificate.json'
    raw = _read(certificate_file)
    pin = sha(raw)
    if pin != spec['sectionReconciliationSha256']:
        raise ValueError('Section reconciliation certificate changed: ' + batch)
    package_file = app / 'editorial/batches' / (batch + '.json')
    binding_file = app / 'editorial/batches' / (batch + '-bindings.json')
    if json.loads(_read(package_file)) != package or json.loads(_read(binding_file)) != bindings:
        raise ValueError('Section reconciliation candidate changed during validation: ' + batch)
    expected = build_certificate(app, batch, old_package, old_bindings, old_pins, scientific, package_file, binding_file)
    if digest(json.loads(raw)) != digest(expected):
        raise ValueError('Section reconciliation certificate cannot be reproduced: ' + batch)
    if pinned_history(app, batch)[2] != old_pins:
        raise ValueError('Section reconciliation historical input changed: ' + batch)
    pairs = {item['id']: item for item in expected['identityProof']['records']}
    revised = []
    for result in records:
        identity = pairs[result['id']]
        if identity['oldCandidateSha256'] != result['candidateSha256']:
            raise ValueError('Section reconciliation differs from the independent payload')
        anchor = {
            'scientificReviewedSignature': result['reviewedSignature'],
            'historicalCandidateSha256': identity['oldCandidateSha256'],
            'currentCandidateSha256': identity['newCandidateSha256'],
            'certificateSha256': pin,
        }
        revised.append({**result, 'candidateSha256': anchor['currentCandidateSha256'],
                        'reviewedSignature': digest(anchor), 'verifiedSectionReconciliation': anchor})
    return revised, certificate_file
