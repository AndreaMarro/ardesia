"""Apply the three verified Bernoulli activities through the canonical registry."""

from datetime import datetime
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering import experiments_c2_bernoulli_53bd_verifier as verifier
from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical, digest, sha, write_immutable


BATCH = 'experiment-c2-bernoulli-verified-53bd-20261127'
NAME = 'activities-c2-bernoulli-53bd-20261127'
ENTRY = {'id': NAME, 'verifier': 'experiments_c2_bernoulli_53bd_verifier',
         'activityIds': sorted(verifier.IDS), 'revisionPackage': BATCH}


def replace(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.' + path.name, delete=False) as stream:
        temporary = Path(stream.name)
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def pretty(data):
    return (json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()


def register():
    app = verifier.APP
    registry_file = app / 'editorial/batches/registry.json'
    reviews = app / 'editorial/reviews'
    status_file = reviews / 'full-corpus-work-status-20261126.json'
    report_file = reviews / (NAME + '.json')
    registry_raw, status_raw = registry_file.read_bytes(), status_file.read_bytes()
    registry, status = map(json.loads, (registry_raw, status_raw))
    if status['registrySha256'] != sha(registry_raw):
        raise ValueError('Work register drifted from its canonical batch registry')
    previously = [row for row in load_activity_registry() if verifier.IDS.intersection(row['activityIds'])]
    if previously and previously != [ENTRY]:
        raise ValueError('Another batch already claims one of these C2 activities')
    sources = {row['id']: row for row in json.loads((app / 'content/esperienze-C2.json').read_bytes())
               if row['id'] in verifier.IDS}
    package = json.loads(registry_file.with_name(BATCH + '.json').read_bytes())
    bindings = json.loads(registry_file.with_name(BATCH + '-bindings.json').read_bytes())
    report = verifier.report(sources, package, bindings)
    write_immutable(report_file, (canonical(report) + '\n').encode())
    integration = exercise(BATCH)
    write_immutable(reviews / (BATCH + '-integration.json'), (canonical(integration) + '\n').encode())
    validated = validate_activity_batch(ENTRY, sources, app)
    if validated['records'] != report['records'] or validated['revision']['browserCases'] != 9:
        raise ValueError('Canonical validation failed the exact C2 evidence')
    if previously:
        return 0
    mutated = [{**row, 'candidateSha256': '0' * 64} if index == 0 else row for index, row in enumerate(bindings)]
    try:
        verifier.report(sources, package, mutated)
    except ValueError as error:
        rejected = str(error)
    else:
        raise ValueError('Altered candidate provenance unexpectedly accepted')
    questions = load_registry()
    registry['activityBatches'].append(ENTRY)
    selected = [row for row in status['activities'] if row['id'] in verifier.IDS]
    if len(selected) != len(verifier.IDS) or any(row['state'] != 'NOT_FULLY_REVIEWED' for row in selected):
        raise ValueError('C2 registration must close exactly the known open IDs')
    for row in selected:
        row.update(state='REVIEWED_DRAFT_ON_53BD_PENDING_CANONICAL', evidence=report_file.relative_to(app).as_posix())
    status['reviewedActivities'] += len(selected)
    status['remainingActivities'] -= len(selected)
    status['observedAt'] = datetime.now().astimezone().isoformat()
    status['fullSnapshotGate'] = 'PENDING_REMAINING_ACTIVITIES_UNIFIED_RUNTIME_AND_CANONICAL_CI'
    registry_next = pretty(registry)
    status['registrySha256'] = sha(registry_next)
    if (registry_file.read_bytes(), status_file.read_bytes()) != (registry_raw,status_raw):
        raise ValueError('Concurrent edit of the activity registry')
    try:
        replace(registry_file,registry_next)
        if load_registry() != questions:
            raise ValueError('Questions changed while registering Bernoulli')
        replace(status_file,pretty(status))
    except Exception:
        replace(registry_file,registry_raw)
        replace(status_file,status_raw)
        raise
    receipt = {
        'schemaVersion':'1.0.0','activityIds':sorted(verifier.IDS),'registered':len(selected),
        'registeredAcrossRuntimeEpochs':status['reviewedActivities'],'remainingActivities':status['remainingActivities'],
        'runtimeSha256':verifier.RUNTIME,'registrySha256':status['registrySha256'],'statusSha256':sha(status_file.read_bytes()),
        'reportSha256':sha(report_file.read_bytes()),'packageCanonicalSha256':digest(package),
        'browserPreviewCases':9,'acceptedBrowserCases':sum(row['actualBrowserCases'] for row in validated['records']),
        'acceptedAnswerSubmissions':sum(row['actualAnswerSubmissions'] for row in validated['records']),
        'withheld':{'SIM-C2-L006-02':'Prior targeted Pitot visibility needs exact-case closure.'},
        'negativeMutatedBinding':rejected,'humanApproval':'NOT_RUN','publicationAction':'NONE',
    }
    write_immutable(verifier.PROOF/'bernoulli-three-registration.json',pretty(receipt))
    return len(selected)


if __name__ == '__main__':
    print(register())
