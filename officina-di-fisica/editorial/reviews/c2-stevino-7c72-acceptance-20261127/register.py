"""Replay the canonical validator and add the Stevino draft to the registry once."""
from copy import deepcopy
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiment_stevino_7c72_verifier as verifier
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical, digest, git_bytes, sha, write_immutable


def replace(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.' + path.name + '-', delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def encode(payload):
    return (json.dumps(payload, ensure_ascii=False, indent=2) + '\n').encode()


def assert_rejections(source, record):
    text_drift = deepcopy(record)
    text_drift['transferPrompt'] += ' Altered.'
    boolean_drift = deepcopy(record)
    boolean_drift['assessmentSelection']['points'][0] = True
    for name, identity, candidate in (
        ('draft_text_drift', source, text_drift),
        ('boolean_not_numeric_normalization', source, boolean_drift),
        ('source_hash_drift', '0' * 64, record),
    ):
        try:
            verifier.observations(identity, candidate)
        except ValueError as error:
            yield {'test':name, 'rejected':True, 'reason':str(error)}
        else:
            raise ValueError('Adversarial mutation passed: ' + name)


def register():
    app = verifier.APP
    registry_file = app / 'editorial/batches/registry.json'
    reviews = app / 'editorial/reviews'
    status_file = reviews / 'full-corpus-work-status-20261126.json'
    report_file = reviews / (verifier.BATCH + '.json')
    old_registry, old_status = registry_file.read_bytes(), status_file.read_bytes()
    registry, status = map(json.loads, (old_registry, old_status))
    if status['registrySha256'] != sha(old_registry):
        raise ValueError('The current work status is for a different registry')
    key = verifier.science.KEY
    package_name = 'experiment-stevino-revision-047'
    spec = {'id':verifier.BATCH, 'verifier':'experiment_stevino_7c72_verifier',
            'activityIds':[key], 'revisionPackage':package_name}
    matching = [row for row in load_activity_registry(registry_file) if key in row['activityIds']]
    if matching and matching != [spec]:
        raise ValueError('A different cohort already owns Stevino')
    package_file = app / 'editorial/batches' / (package_name + '.json')
    bindings_file = package_file.with_name(package_name + '-bindings.json')
    package, bindings = (json.loads(path.read_bytes()) for path in (package_file, bindings_file))
    source_path = 'officina-di-fisica/content/esperienze-C2.json'
    raw = git_bytes(app.parent, verifier.science.SOURCE_REF, source_path)
    source = next(row for row in json.loads(raw) if row['id'] == key)
    loaded = next(row for row in json.loads((app.parent/source_path).read_bytes()) if row['id'] == key)
    if digest(source) != digest(loaded):
        raise ValueError('The runtime source edition changed')
    sources = {key:source}
    evidence = verifier.report(sources, package, bindings)
    write_immutable(report_file, (canonical(evidence) + '\n').encode())
    integration = reviews / (package_name + '-integration.json')
    write_immutable(integration, (canonical(exercise(package_name)) + '\n').encode())
    tested = list(assert_rejections(digest(source), package['records'][0]))
    result = validate_activity_batch(spec, sources, app)
    if result['records'] != evidence['records']:
        raise ValueError('The canonical validator disagrees with the reviewed record')
    if matching:
        return 0
    questions = load_registry(registry_file)
    registry['activityBatches'].append(spec)
    activity = next(row for row in status['activities'] if row['id'] == key)
    if activity['state'] != 'NOT_FULLY_REVIEWED':
        raise ValueError('The work status does not list Stevino as open')
    activity.update(state='REVIEWED_DRAFT_ON_7C72_PENDING_CANONICAL', evidence=report_file.relative_to(app).as_posix())
    status['reviewedActivities'] += 1
    status['remainingActivities'] -= 1
    changed_registry = encode(registry)
    status['registrySha256'] = sha(changed_registry)
    if (registry_file.read_bytes(), status_file.read_bytes()) != (old_registry, old_status):
        raise ValueError('The activity registry changed during verification')
    try:
        replace(registry_file, changed_registry)
        if load_registry(registry_file) != questions:
            raise ValueError('Question registry was changed by activity registration')
        replace(status_file, encode(status))
    except Exception:
        replace(registry_file, old_registry)
        replace(status_file, old_status)
        raise
    receipt = {'activityIds':[key], 'added':1, 'runtimeSha256':evidence['runtimeSha256'],
               'reportSha256':sha(report_file.read_bytes()), 'registrySha256':status['registrySha256'],
               'registeredAcrossEvidenceEpochs':status['reviewedActivities'], 'openActivities':status['remainingActivities'],
               'actualObservedCases':sum(group['cases'] for group in verifier.observations(digest(source), package['records'][0])),
               'protectedPreviewCases':result['revision']['browserCases'], 'negativeChecks':tested,
               'canonicalIntegration':'PENDING', 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    write_immutable(verifier.PROOF / 'registration-receipt.json', encode(receipt))
    return 1


if __name__ == '__main__':
    print(register())
