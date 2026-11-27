"""Register one exactly scoped C5 activity package using the canonical validator."""
import argparse
from copy import deepcopy
import json
import os
from pathlib import Path
import tempfile

from tools.corpus_engineering.batches import load_activity_registry, load_registry, validate_activity_batch
from tools.corpus_engineering import experiments_c5_nine_drafts_f357_verifier as verifier
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.pipeline import canonical,digest,git_bytes,sha,write_immutable


def replace(path, raw):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix='.'+path.name+'-', delete=False) as stream:
        temporary=Path(stream.name)
        stream.write(raw)
        stream.flush()
        os.fsync(stream.fileno())
    try:
        os.replace(temporary,path)
    finally:
        temporary.unlink(missing_ok=True)


def encode(payload):
    return (json.dumps(payload,ensure_ascii=False,indent=2)+'\n').encode()


def register(batch):
    selection=verifier.read('selected-packages.json')
    if batch not in selection:
        raise ValueError('Unknown bounded C5 package')
    keys=set(selection[batch]['ids'])
    app=verifier.APP
    registry_file=app/'editorial/batches/registry.json'
    reviews=app/'editorial/reviews'
    status_file=reviews/'full-corpus-work-status-20261126.json'
    name=batch.replace('experiment-c5-','activities-c5-',1)
    spec={'id':name,'verifier':'experiments_c5_nine_drafts_f357_verifier','activityIds':sorted(keys),'revisionPackage':batch}
    report_file=reviews/(name+'.json')
    old_registry,old_status=registry_file.read_bytes(),status_file.read_bytes()
    registry,status=map(json.loads,(old_registry,old_status))
    if status['registrySha256']!=sha(old_registry):
        raise ValueError('Current status is detached from registry')
    previous=[row for row in load_activity_registry(registry_file) if keys.intersection(row['activityIds'])]
    if previous and previous!=[spec]:
        raise ValueError('Some C5 IDs already belong to another cohort')
    pkg_file=registry_file.with_name(batch+'.json')
    bindings_file=pkg_file.with_name(batch+'-bindings.json')
    package,bindings=map(json.loads,(pkg_file.read_bytes(),bindings_file.read_bytes()))
    raw=git_bytes(app.parent,verifier.science.REF,verifier.science.SOURCE)
    if sha(raw)!=verifier.science.SOURCE_SHA:
        raise ValueError('Original C5 source SHA-256 changed')
    sources={row['id']:row for row in json.loads(raw) if row['id'] in keys}
    get_digest=lambda data:{row['id']:digest(row) for row in data if row['id'] in keys}
    if get_digest(sources.values())!=get_digest(json.loads((app.parent/verifier.science.SOURCE).read_bytes())):
        raise ValueError('Runtime C5 original source changed')
    report=verifier.report(sources,package,bindings)
    write_immutable(report_file,(canonical(report)+'\n').encode())
    integrated=exercise(batch)
    write_immutable(reviews/(batch+'-integration.json'),(canonical(integrated)+'\n').encode())
    validated=validate_activity_batch(spec,sources,app)
    assert report['records']==validated['records']
    if previous:
        return 0
    drift=deepcopy(bindings)
    drift[0]['candidateSha256']='0'*64
    try:
        verifier.report(sources,package,drift)
    except ValueError as error:
        negative=str(error)
    else:
        raise ValueError('Altered binding unexpectedly accepted')
    questions=load_registry(registry_file)
    registry['activityBatches'].append(spec)
    activities=[row for row in status['activities'] if row['id'] in keys]
    if {row['id'] for row in activities}!=keys or any(row['state']!='NOT_FULLY_REVIEWED' for row in activities):
        raise ValueError('C5 work status does not contain exactly this set of open records')
    for row in activities:
        row.update(state='REVIEWED_DRAFT_ON_F357_PENDING_CANONICAL',evidence=report_file.relative_to(app).as_posix())
    status['reviewedActivities']+=len(keys)
    status['remainingActivities']-=len(keys)
    updated=encode(registry)
    status['registrySha256']=sha(updated)
    if (registry_file.read_bytes(),status_file.read_bytes())!=(old_registry,old_status):
        raise ValueError('Concurrent C5 registration')
    try:
        replace(registry_file,updated)
        if load_registry(registry_file)!=questions:
            raise ValueError('Question registry changed during C5 registration')
        replace(status_file,encode(status))
    except Exception:
        replace(registry_file,old_registry)
        replace(status_file,old_status)
        raise
    receipt={'activityIds':sorted(keys),'added':len(keys),'registrySha256':status['registrySha256'],
             'reportSha256':sha(report_file.read_bytes()),'runtimeSha256':verifier.RUNTIME,
             'registeredAcrossEvidenceEpochs':status['reviewedActivities'],'openActivities':status['remainingActivities'],
             'actualBrowserCases':sum(row['actualBrowserCases'] for row in validated['records']),
             'actualAnswerSubmissions':sum(row['actualAnswerSubmissions'] for row in validated['records']),
             'protectedPreviewCases':validated['revision']['browserCases'],'alteredBindingRejected':negative,
             'canonicalIntegration':'PENDING','humanApproval':'NOT_RUN','publicationAction':'NONE'}
    write_immutable(verifier.PROOF/(batch+'-registration.json'),encode(receipt))
    return len(keys)


if __name__=='__main__':
    parser=argparse.ArgumentParser(__doc__)
    parser.add_argument('batch')
    print(register(parser.parse_args().batch))
