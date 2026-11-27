"""Bind the independent six-ID replay to its complete four-record vector family."""

import json
from pathlib import Path

from . import c1_six_vector_renewal_cb9_verifier as independent
from .pipeline import sha


BATCH = 'experiments-vectors-revision-119'
DRAFT = 'experiment-products-revision-119'
IDS = set(independent.FAMILIES['experiments_vectors_revision_verifier.py'])


def report(sources, package, bindings):
    raw = (independent.APP / 'content/esperienze-C1.json').read_bytes()
    original = {row['id']: row for row in json.loads(raw)}
    if set(sources) != IDS or any(source != original[key] for key, source in sources.items()):
        raise ValueError('Vector family source or coverage differs')
    fixture = independent.BASE / 'fixtures'
    packages = {name: independent.load(fixture / (name + '.json')) for name in independent.DRAFTS.values()}
    bindings_by_package = {
        name: independent.load(fixture / (name + '-bindings.json')) for name in independent.DRAFTS.values()
    }
    packages[DRAFT] = package
    bindings_by_package[DRAFT] = bindings
    verified = independent.report(original, packages, bindings_by_package)
    records = []
    for original_proof in verified['records']:
        if original_proof['id'] not in IDS:
            continue
        row = dict(original_proof, originalEditionRetained=True)
        row.pop('wholeFamilyAcceptance')
        if 'publishedEditionReview' in row:
            row['failedPublishedEdition'] = not row['publishedEditionReview']['ok']
        records.append(row)
    if len(records) != len(IDS) or {row['id'] for row in records} != IDS or not all(row['ok'] for row in records):
        raise ValueError('The whole four-record family requires positive independent evidence')
    return {
        'schemaVersion': '1.0.0',
        'batch': BATCH,
        'records': records,
        'runtimeSha256': verified['runtimeSha256'],
        'independentVerifierSha256': verified['verifierSha256'],
        'verifierSha256': sha(Path(__file__).read_bytes()),
        'humanApproval': 'NOT_RUN',
        'publicationAction': 'NONE',
    }
