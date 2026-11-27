"""Replay a C6 batch against its immutable author and independent review deliveries."""
import argparse
import hashlib
import importlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical

APP = Path.cwd()
EDITORIAL = APP / 'editorial'
REVIEWS = EDITORIAL / 'reviews'


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def read(file):
    return json.loads(file.read_bytes())


def subprocess_environment():
    environment = dict(os.environ, PYTHONPATH='.', PYTHONDONTWRITEBYTECODE='1', GIT_NO_LAZY_FETCH='1')
    environment.pop('CRIC_REVIEW_CANDIDATE_APP', None)
    return environment


def run_tests(pattern, output):
    if not re.fullmatch(r'test_[\w]+\.py', pattern):
        raise ValueError('Expected the independently delivered test module name')
    run = subprocess.run([sys.executable, '-B', '-m', 'unittest', 'discover', '-s', 'tests/corpus', '-p', pattern, '-v'],
                         env=subprocess_environment(), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=240)
    (output / 'actual-tests.txt').write_bytes(run.stdout)
    terminal = run.stdout.decode(errors='replace')
    print(terminal[-2200:], flush=True)
    match = re.search(r'Ran ([1-9][0-9]*) tests? in ([0-9.]+)s', terminal)
    if run.returncode or not match:
        raise RuntimeError('Independent review tests failed or were not discovered')
    return {'count': int(match[1]), 'seconds': float(match[2]), 'actualExit': run.returncode}


def assert_assignment_identity(package, bindings, assignment, source_ref):
    """Read each original from its own declared path, including the off-file AQ01."""
    originals = {}
    sources_by_path = {}
    for source in assignment['sources']:
        if source['path'] not in sources_by_path:
            raw = subprocess.check_output(['git', 'show', source_ref + ':' + source['path']], cwd=APP.parent,
                                          env=subprocess_environment())
            assert hashlib.sha256(raw).hexdigest() == source['sourceFileSha256']
            sources_by_path[source['path']] = {row['id']: row for row in json.loads(raw)}
        originals[source['id']] = sources_by_path[source['path']][source['id']]
    by_binding = {binding['id']: binding for binding in bindings}
    for row in package['records']:
        key = row['id']
        source = originals[key]
        for name in ('kind', 'course', 'skill', 'family', 'exam', 'section', 'order', 'prerequisites'):
            assert type(row.get(name)) is type(source.get(name)) and row.get(name) == source.get(name), (key, name)
        assert type(row['baseVersion']) is int and type(row['version']) is int
        assert row['baseVersion'] == source['version'] and row['version'] == source['version'] + 1
        assert bool(row.get('exam')) == assignment['protectedExam']
        assert by_binding[key]['sourceSha256'] == hashlib.sha256(canonical(source).encode()).hexdigest()


def main():
    parser = argparse.ArgumentParser(__doc__)
    parser.add_argument('batch')
    parser.add_argument('test_module')
    parser.add_argument('--recovery', type=Path, action='append', required=True)
    arguments = parser.parse_args()
    assignment = next(a for a in read(EDITORIAL / 'assignments/cric-606-v1.json')['assignments'] if a['batchId'] == arguments.batch)
    assert assignment['author'] != assignment['independentVerifier']
    assert arguments.batch.startswith('cric-c6-')
    for manifest in arguments.recovery:
        for path, item in read(manifest)['files'].items():
            assert sha(APP / path) == item['sha256'], path
    output = REVIEWS / f'{arguments.batch}-root-integration-20261127'
    output.mkdir(exist_ok=True)
    tests = run_tests(arguments.test_module, output)
    batch = arguments.batch
    package_path = EDITORIAL / 'batches' / f'{batch}.json'
    package = read(package_path)
    bindings = read(EDITORIAL / 'batches' / f'{batch}-bindings.json')
    source_ref = '5d1dc8dc7b601aef959d10d564c75462be74708d'
    assert_assignment_identity(package, bindings, assignment, source_ref)
    verifier = importlib.import_module('tools.corpus_engineering.' + batch.replace('-', '_') + '_verifier')
    saved_path = REVIEWS / f'{batch}.json'
    saved = read(saved_path)
    fresh = verifier.verify(package, bindings)
    assert fresh == saved['records']
    assert_record_identity(fresh, set(assignment['questionIds']), package, bindings)
    assert sha(Path(verifier.__file__)) == saved['verifierSha256']
    result = exercise(batch)
    count = len(assignment['questionIds'])
    assert (result['firstImport']['saved'], result['repeatedImport']['saved'], result['repeatedImport']['unchanged'],
            result['preservedLiveHeads']) == (count, 0, count, count)
    assert result['beforePublishedCount'] == result['afterPublishedCount'] == 991
    assert result['beforePublishedSha256'] == result['afterPublishedSha256']
    integration_path = REVIEWS / f'{batch}-integration.json'
    integration_path.write_text(canonical(result) + '\n')
    (output / 'receipt.json').write_text(json.dumps({
        'batch': batch, 'questionIds': assignment['questionIds'], 'protectedExam': assignment['protectedExam'],
        'tests': tests, 'sourceRef': source_ref, 'individualScientificEvidenceSha256': sha(saved_path),
        'integrationEvidenceSha256': sha(integration_path), 'newDrafts': count, 'repeatSaved': 0,
        'unchangedDrafts': count, 'preservedPublishedCount': 991, 'humanApproval': 'NOT_RUN',
        'publicationAction': 'NONE', 'fullProductUI': 'PENDING',
    }, indent=2) + '\n')
    print(f'{batch}: {count} independently verified, exact idempotent import', flush=True)


if __name__ == '__main__':
    main()
