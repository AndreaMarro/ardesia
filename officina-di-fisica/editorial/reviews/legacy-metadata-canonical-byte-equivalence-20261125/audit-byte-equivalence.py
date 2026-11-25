"""Read-only byte provenance audit; it never imports verifiers or repairs metadata.

Run against the integrator's checkout. The output identifies byte-equivalent
known canonical merge trees, never an original author's unavailable commit.
No fetch, object creation, model execution, or acceptance gate is performed.
"""
from pathlib import Path
import ast
import hashlib
import json
import os
import subprocess
import sys

CANONICAL_REF = '831b73fa71076b2e9b363006ffd94a350f22fe90'
SOURCE_BASE = '5d1dc8dc7b601aef959d10d564c75462be74708d'
AUDIT_PATH = 'officina-di-fisica/editorial/reviews/git-provenance-inputs-20261125/legacy-metadata-availability.json'
REGISTRY_PATH = 'officina-di-fisica/editorial/batches/registry.json'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def audit(repo):
    repo = Path(repo).resolve()
    env = {**os.environ, 'GIT_NO_LAZY_FETCH': '1', 'GIT_OPTIONAL_LOCKS': '0'}

    def git(*args, allow_missing=False):
        result = subprocess.run(['git', '-C', str(repo), *args], env=env,
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode:
            if allow_missing:
                return None
            raise RuntimeError(result.stderr.decode(errors='replace')[:400])
        return result.stdout

    root_head = git('rev-parse', 'HEAD').decode().strip()
    git('merge-base', '--is-ancestor', SOURCE_BASE, CANONICAL_REF)
    canonical_parents = git('rev-list', '--parents', '-n', '1', CANONICAL_REF).decode().split()
    assert len(canonical_parents) == 3
    canonical_subject = git('show', '-s', '--format=%s', CANONICAL_REF).decode().strip()
    assert canonical_subject.startswith('Merge pull request #363 ')
    source_raw = (repo / AUDIT_PATH).read_bytes()
    registry_raw = (repo / REGISTRY_PATH).read_bytes()
    inputs = json.loads(source_raw)['legacyUnavailableReferences']
    registry = json.loads(registry_raw)
    assert len(inputs) == 9
    chain = git('log', '--first-parent', '--reverse', '--format=%H%x00%s',
                SOURCE_BASE + '..' + CANONICAL_REF).decode().splitlines()
    canonical_merges = [line.split('\0')[0] for line in chain
                        if line.split('\0', 1)[1].startswith('Merge pull request #')]
    assert canonical_merges[-1] == CANONICAL_REF
    records = []
    for item in inputs:
        module_path = item['module']
        module_name = Path(module_path).stem
        matches = [s for s in registry['batches'] if s['verifier'] == module_name]
        assert len(matches) == 1
        spec = matches[0]
        paths = [module_path,
                 'officina-di-fisica/editorial/batches/' + spec['id'] + '.json',
                 'officina-di-fisica/editorial/batches/' + spec['id'] + '-bindings.json']
        actual = {(path): (repo / path).read_bytes() for path in paths}
        # The equality target must itself be committed, not an uncommitted WIP.
        for path, raw in actual.items():
            assert raw == git('show', root_head + ':' + path), ('uncommitted target', path)
            assert raw == git('show', CANONICAL_REF + ':' + path), ('canonical mismatch', path)
        constants = {}
        for node in ast.parse(actual[module_path]).body:
            if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
                    constants[node.targets[0].id] = node.value.value
        assert constants['CANDIDATE_REF'] == item['historicalInformationalRef']
        for path, pin in zip(paths[1:], ['REVIEWED_PACKAGE_SHA256', 'REVIEWED_BINDINGS_SHA256']):
            canonical_json = json.dumps(json.loads(actual[path]), sort_keys=True,
                                        ensure_ascii=False, separators=(',', ':')).encode()
            assert sha(canonical_json) == constants[pin], ('reviewed content pin mismatch', path)
        first = None
        for ref in canonical_merges:
            if all(git('show', ref + ':' + path, allow_missing=True) == raw
                   for path, raw in actual.items()):
                first = ref
                break
        assert first is not None
        files = []
        for path, raw in actual.items():
            files.append({'path': path, 'bytes': len(raw), 'sha256': sha(raw),
                          'canonicalBlobOid': git('rev-parse', CANONICAL_REF + ':' + path).decode().strip(),
                          'identicalInCurrentCommittedIntegratorTree': True,
                          'identicalInKnownCanonicalTree': True,
                          'identicalInOldestCheckedMatchingCanonicalTree': True})
        records.append({'module': module_name, 'batchId': spec['id'],
                        'historicalInformationalRef': item['historicalInformationalRef'],
                        'historicalRefAvailability': 'NOT_RETRIED; PRIOR_FAILED_REMOTE_FETCH_RETAINED',
                        'byteEquivalentCanonicalMerge': CANONICAL_REF,
                        'oldestMatchingCanonicalMergeWithinCheckedChain': first,
                        'oldestMatchingSubject': git('show', '-s', '--format=%s', first).decode().strip(),
                        'files': files,
                        'originalAuthorCommitRecovered': False,
                        'originalAuthorshipAttributed': False,
                        'metadataChanged': False,
                        'scientificCreditAdded': 0})
    assert git('rev-parse', 'HEAD').decode().strip() == root_head
    return {'scope': 'READ_ONLY_CANONICAL_BYTE_EQUIVALENCE_NOT_AUTHOR_COMMIT_RECOVERY',
            'integratorCommittedHeadAtAudit': root_head,
            'inputAvailabilityAuditPath': AUDIT_PATH,
            'inputAvailabilityAuditSha256': sha(source_raw),
            'registryReadOnlySha256': sha(registry_raw),
            'knownCanonicalMerge': CANONICAL_REF,
            'knownCanonicalSubject': canonical_subject,
            'checkedCanonicalMergeChainFromExclusiveBase': SOURCE_BASE,
            'checkedCanonicalMerges': canonical_merges,
            'recordCount': len(records), 'fileByteComparisons': len(records) * 3,
            'records': records,
            'limits': [
                'The known merged PR363 tree is a historical canonical tree, not a claim about the current remote tip.',
                'The oldest matching result is bounded to the explicitly listed first-parent canonical merge chain.',
                'Exact equality covers the verifier, package and bindings bytes; it does not execute the oracle, renderer or dependencies.',
                'No unavailable historical ref was recovered, fetched, relabelled or attributed to an author.',
                'Existing informational CANDIDATE_REF fields and scientific gates remain unchanged.'
            ],
            'networkCalls': 0, 'verifierImports': 0, 'metadataEdits': 0,
            'newScientificAcceptances': 0, 'newUiCases': 0, 'activityCredit': 0,
            'humanApproval': 'NOT_RUN', 'publicationAction': 'NONE'}


if __name__ == '__main__':
    assert len(sys.argv) == 2, 'Pass the read-only integrator repository root'
    print(json.dumps(audit(sys.argv[1]), sort_keys=True, ensure_ascii=False, indent=2))
