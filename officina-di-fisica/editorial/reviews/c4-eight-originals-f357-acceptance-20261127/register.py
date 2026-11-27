"""Replace the narrower C4 receipt with the validated eight-activity scope."""
from copy import deepcopy
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiments_c4_eight_originals_f357_verifier as verifier
from tools.corpus_engineering.pipeline import canonical, sha, write_immutable


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


def register():
    app = verifier.APP
    registry_path = app / 'editorial/batches/registry.json'
    status_path = verifier.REVIEWS / 'full-corpus-work-status-20261126.json'
    report_path = verifier.REVIEWS / (verifier.BATCH + '.json')
    old_registry, old_status = registry_path.read_bytes(), status_path.read_bytes()
    registry, status = map(json.loads, (old_registry, old_status))
    if status['registrySha256'] != sha(old_registry):
        raise ValueError('Per-ID status does not match the current registry')
    spec = {'id':verifier.BATCH, 'verifier':'experiments_c4_eight_originals_f357_verifier',
            'activityIds':sorted(verifier.IDS)}
    owning = [row for row in load_activity_registry(registry_path) if verifier.IDS.intersection(row['activityIds'])]
    if owning == [spec]:
        already = True
    elif (len(owning)==1 and owning[0]['id']=='experiments-c4-three-originals'
          and set(owning[0]['activityIds'])==verifier.EARLIER_IDS):
        already = False
    else:
        raise ValueError('Unexpected prior record ownership')
    sources = {record['id']:record for record in json.loads((app/'content/esperienze-C4.json').read_bytes()) if record['id'] in verifier.IDS}
    raw_report = verifier.report(sources)
    write_immutable(report_path, (canonical(raw_report) + '\n').encode())
    result = validate_activity_batch(spec, sources, app)
    if result['records'] != raw_report['records']:
        raise ValueError('The canonical validator disagrees with the eight exact records')
    if already:
        return 0
    altered = deepcopy(sources)
    altered[verifier.FIELD]['version'] += 1
    try:
        verifier.report(altered)
    except ValueError as error:
        negative = str(error)
    else:
        raise ValueError('Changed source version must be rejected')
    questions = load_registry(registry_path)
    registry['activityBatches'] = [spec if item == owning[0] else item for item in registry['activityBatches']]
    affected = [row for row in status['activities'] if row['id'] in verifier.IDS]
    if len(affected) != len(verifier.IDS):
        raise ValueError('The activity work status is incomplete')
    added = 0
    for row in affected:
        prior = row['id'] in verifier.EARLIER_IDS
        if prior and row['state'] != 'REVIEWED_ORIGINAL_ON_7C72_PENDING_CANONICAL':
            raise ValueError('The renewal is detached from its older registered activity')
        if not prior:
            if row['state'] != 'NOT_FULLY_REVIEWED' or not row.get('openConsumerFinding'):
                raise ValueError('The new activity is not eligible for a first closure')
            row['resolvedConsumerFinding'] = {**row.pop('openConsumerFinding'),
                'resolutionRuntimeSha256':verifier.RUNTIME,'resolutionEvidence':report_path.relative_to(app).as_posix()}
            added += 1
        if row.get('evidence'):
            row['priorEvidence'] = row['evidence']
        row.update(state='REVIEWED_ORIGINAL_ON_F357_PENDING_CANONICAL', evidence=report_path.relative_to(app).as_posix())
    status['reviewedActivities'] += added
    status['remainingActivities'] -= added
    current_registry = encode(registry)
    status['registrySha256'] = sha(current_registry)
    if (registry_path.read_bytes(), status_path.read_bytes()) != (old_registry, old_status):
        raise ValueError('Concurrent edit to the candidate register')
    try:
        replace(registry_path, current_registry)
        if load_registry(registry_path) != questions:
            raise ValueError('The complete question registry changed')
        replace(status_path, encode(status))
    except Exception:
        replace(registry_path, old_registry)
        replace(status_path, old_status)
        raise
    receipt = {'activityIds':sorted(verifier.IDS),'renewedIds':sorted(verifier.EARLIER_IDS),
               'added':added,'renewed':len(verifier.EARLIER_IDS),'runtimeSha256':verifier.RUNTIME,
               'actualBrowserCases':raw_report['actualBrowserCases'],'focusedFieldCases':56,
               'reportSha256':sha(report_path.read_bytes()),'registrySha256':status['registrySha256'],
               'registeredAcrossEvidenceEpochs':status['reviewedActivities'],'openActivities':status['remainingActivities'],
               'rejectedAlteredSourceVersion':negative,'canonicalIntegration':'PENDING',
               'humanApproval':'NOT_RUN','publicationAction':'NONE'}
    write_immutable(verifier.PROOF/'registration-receipt.json', encode(receipt))
    return added


if __name__ == '__main__':
    print(register())
