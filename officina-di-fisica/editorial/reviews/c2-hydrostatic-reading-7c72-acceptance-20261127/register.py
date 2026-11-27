"""Validate and register the four hydrostatic editions through the corpus validator."""
from copy import deepcopy
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiments_c2_hydrostatic_7c72_verifier as verifier
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


def verify_negative_cases(sources, package, bindings):
    wrong_pascal = deepcopy(package)
    next(row for row in wrong_pascal['records'] if row['id'] == verifier.PAS)['interpretation'] = 'Pistoni alla stessa quota.'
    wrong_manometer = deepcopy(package)
    next(row for row in wrong_manometer['records'] if row['id'] == verifier.MANOMETER)['version'] = 2
    wrong_binding = deepcopy(bindings)
    wrong_binding[0]['sourceSha256'] = '0' * 64
    for name, candidate, source_bindings in (
        ('old_pascal_premise', wrong_pascal, bindings),
        ('wrong_live_manometer_version', wrong_manometer, bindings),
        ('wrong_source_binding', package, wrong_binding),
    ):
        try:
            verifier.report(sources, candidate, source_bindings)
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
    keys = set(verifier.SCOPES)
    spec = {'id':verifier.BATCH, 'verifier':'experiments_c2_hydrostatic_7c72_verifier',
            'activityIds':sorted(keys), 'revisionPackage':verifier.PACKAGE}
    matching = [row for row in load_activity_registry(registry_file) if keys.intersection(row['activityIds'])]
    if matching and matching != [spec]:
        raise ValueError('A different cohort already owns one of the four records')
    package_file = app / 'editorial/batches' / (verifier.PACKAGE + '.json')
    bindings_file = package_file.with_name(verifier.PACKAGE + '-bindings.json')
    package, bindings = (json.loads(path.read_bytes()) for path in (package_file, bindings_file))
    source_path = 'officina-di-fisica/content/esperienze-C2.json'
    raw = git_bytes(app.parent, verifier.SOURCE_REF, source_path)
    sources = {row['id']:row for row in json.loads(raw) if row['id'] in keys}
    installed = {row['id']:row for row in json.loads((app.parent/source_path).read_bytes()) if row['id'] in keys}
    if {key:digest(row) for key,row in sources.items()} != {key:digest(row) for key,row in installed.items()}:
        raise ValueError('The runtime source editions changed')
    evidence = verifier.report(sources, package, bindings)
    write_immutable(report_file, (canonical(evidence) + '\n').encode())
    integration = reviews / (verifier.PACKAGE + '-integration.json')
    write_immutable(integration, (canonical(exercise(verifier.PACKAGE)) + '\n').encode())
    tested = list(verify_negative_cases(sources, package, bindings))
    result = validate_activity_batch(spec, sources, app)
    if result['records'] != evidence['records']:
        raise ValueError('The canonical validator disagrees with the four records')
    if matching:
        return 0
    questions = load_registry(registry_file)
    registry['activityBatches'].append(spec)
    activities = [row for row in status['activities'] if row['id'] in keys]
    if {row['id'] for row in activities} != keys or any(row['state'] != 'NOT_FULLY_REVIEWED' for row in activities):
        raise ValueError('The work status does not list all four records as open')
    for row in activities:
        row.update(state='REVIEWED_DRAFT_ON_7C72_PENDING_CANONICAL', evidence=report_file.relative_to(app).as_posix())
    status['reviewedActivities'] += len(keys)
    status['remainingActivities'] -= len(keys)
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
    receipt = {'activityIds':sorted(keys), 'added':len(keys), 'runtimeSha256':evidence['runtimeSha256'],
               'reportSha256':sha(report_file.read_bytes()), 'registrySha256':status['registrySha256'],
               'registeredAcrossEvidenceEpochs':status['reviewedActivities'], 'openActivities':status['remainingActivities'],
               'actualObservedCases':sum(row['observedDraft']['browserCases'] for row in result['records']),
               'actualAnswerSubmissions':sum(row['observedDraft']['actualAnswerSubmissions'] for row in result['records']),
               'protectedPreviewCases':result['revision']['browserCases'], 'negativeChecks':tested,
               'canonicalIntegration':'PENDING', 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}
    write_immutable(verifier.PROOF / 'registration-receipt.json', encode(receipt))
    return len(keys)


if __name__ == '__main__':
    print(register())
