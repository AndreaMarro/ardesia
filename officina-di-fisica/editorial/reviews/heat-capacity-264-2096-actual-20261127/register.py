"""Register the current private heat-capacity edition with the existing validator."""

import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering import experiment_heat_capacity_264_current_activity_verifier as verifier
from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering.pipeline import canonical, sha, write_immutable


PACKAGE = 'experiment-heat-capacity-revision-264'


def replace(file, payload):
    with tempfile.NamedTemporaryFile(dir=file.parent, prefix='.' + file.name + '-', delete=False) as stream:
        candidate = Path(stream.name)
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(candidate, file)
    finally:
        candidate.unlink(missing_ok=True)


def register():
    app = verifier.APP
    batches = app / 'editorial/batches'
    reviews = app / 'editorial/reviews'
    registry_file = batches / 'registry.json'
    status_file = reviews / 'full-corpus-work-status-20261126.json'
    report_file = reviews / (verifier.BATCH + '.json')
    key = verifier.science.KEY
    course_sources = json.loads((app / 'content/esperienze-C3.json').read_bytes())
    sources = {row['id']:row for row in course_sources if row['id'] == key}
    package = json.loads((batches / (PACKAGE + '.json')).read_bytes())
    bindings = json.loads((batches / (PACKAGE + '-bindings.json')).read_bytes())
    spec = {'id':verifier.BATCH, 'verifier':'experiment_heat_capacity_264_current_activity_verifier',
            'activityIds':[key], 'revisionPackage':PACKAGE}
    registry_bytes = registry_file.read_bytes()
    status_bytes = status_file.read_bytes()
    registry, status = json.loads(registry_bytes), json.loads(status_bytes)
    if status['registrySha256'] != sha(registry_bytes):
        raise ValueError('The current per-ID work status does not identify this registry')
    matching = [row for row in load_activity_registry(registry_file) if key in row['activityIds']]
    if matching and matching != [spec]:
        raise ValueError('A different cohort already owns this activity')
    questions_before = load_registry(registry_file)
    report = verifier.report(sources, package, bindings)
    write_immutable(report_file, (canonical(report) + '\n').encode())
    accepted = validate_activity_batch(spec, sources, app)
    if len(accepted['records']) != 1 or accepted['revision']['browserCases'] != 3:
        raise ValueError('The canonical validator did not accept the private activity edition')
    if not matching:
        registry['activityBatches'].append(spec)
        activity, = [row for row in status['activities'] if row['id'] == key]
        if activity['state'] != 'NOT_FULLY_REVIEWED':
            raise ValueError('The source activity is not marked open')
        activity.update(state='REVIEWED_DRAFT_ON_2096_PENDING_CANONICAL', evidence=report_file.relative_to(app).as_posix())
        status['reviewedActivities'] += 1
        status['remainingActivities'] -= 1
        changed_registry = (json.dumps(registry, ensure_ascii=False, indent=2) + '\n').encode()
        status['registrySha256'] = sha(changed_registry)
        if (registry_file.read_bytes(), status_file.read_bytes()) != (registry_bytes, status_bytes):
            raise ValueError('Another writer changed the per-ID registry')
        try:
            replace(registry_file, changed_registry)
            if load_registry(registry_file) != questions_before:
                raise ValueError('The question cohort was altered by this activity registration')
            replace(status_file, (json.dumps(status, ensure_ascii=False, indent=2) + '\n').encode())
        except Exception:
            replace(registry_file, registry_bytes)
            replace(status_file, status_bytes)
            raise
    return {'newActivity':0 if matching else 1, 'id':key, 'registeredActivities':status['reviewedActivities'],
            'openActivities':status['remainingActivities'], 'registrySha256':status['registrySha256'],
            'reportSha256':sha(report_file.read_bytes()), 'originalReview':'FAIL_TEXT_RETAINED',
            'runtimeSha256':report['runtimeSha256'], 'event':'DRAFT', 'humanApproval':'NOT_RUN', 'publicationAction':'NONE'}


if __name__ == '__main__':
    print(json.dumps(register(), indent=2))
