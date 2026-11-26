"""Portable context adapter for the exact archived replay; no production edits.

--verify-inputs-only performs no Node/browser/runtime test. An actual replay is
explicit and writes only a new output folder, never the historical evidence.
"""
from pathlib import Path
import argparse
import fcntl
import hashlib
import importlib.util
import json
import os
import shutil

HERE=Path(__file__).resolve().parent
FROZEN=HERE.parent/'network-negative-frozen-20261126'
APP=next(p for p in HERE.parents if (p/'static/js/banchi').is_dir()and(p/'server').is_dir())


def sha(raw):return hashlib.sha256(raw).hexdigest()


def verify_inputs():
    manifest_raw=(FROZEN/'delivery.json').read_bytes()
    assert sha(manifest_raw)=='395816552f4dc9546d0ccb10313fdc408845f43b74a13981a45a6d5976585529'
    manifest=json.loads(manifest_raw)
    for name,pin in manifest['files'].items():assert sha((APP/name).read_bytes())==pin,name
    pins=json.loads((HERE/'source-input-pins.json').read_bytes())
    assert pins['sourceCommit']=='16dcfbe690fbeca98cd41a3ecd3f1eeb38e59ee3'
    assert pins['runtimeSha256']=='b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46'
    actual={str(p.relative_to(HERE))for p in (HERE/'draft-input-snapshot/editorial/batches').rglob('*')if p.is_file()}
    assert len(pins['files'])==4 and actual==set(pins['files']),'Exact four-file input inventory required'
    for name,pin in pins['files'].items():assert sha((HERE/name).read_bytes())==pin,name
    records=[]
    for p in (HERE/'draft-input-snapshot/editorial/batches').glob('*.json'):
        if p.name.endswith('-bindings.json'):continue
        package=json.loads(p.read_bytes());assert package['schema']=='astra/1';records+=package['records']
    assert len(records)==9 and len({r['id']for r in records})==9
    assert all((r['version'],r['baseVersion'])==(2,1)for r in records)
    return {'frozenManifestSha256':sha(manifest_raw),'sourceInputs':len(pins['files']),
            'draftRecords':9,'uiExecutedByVerificationOnly':False,'activityCredit':0,
            'humanApproval':'NOT_RUN','publicationAction':'NONE'}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--verify-inputs-only',action='store_true')
    parser.add_argument('--output',type=Path);args=parser.parse_args()
    verified=verify_inputs()
    if args.verify_inputs_only:
        assert args.output is None;print(json.dumps(verified,sort_keys=True));return
    assert args.output is not None,'An explicit fresh output directory is required'
    output=args.output.resolve();assert not output.exists(),'Never overwrite a prior epoch or replay'
    assert output.is_relative_to((APP/'var').resolve()),'Replay output must be inside this checkout var/'
    with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
        fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>=2*1024**3
        output.mkdir(parents=True)
        for name in ('candidate-runtime-fingerprint.json','source-records.json','protocol-private-consumer-reading.mjs'):
            shutil.copyfile(FROZEN/name,output/name)
        shutil.copytree(HERE/'draft-input-snapshot',output/'draft-input-snapshot')
        spec=importlib.util.spec_from_file_location('reviewed_archived_b2_runner',FROZEN/'run-immutable-review.py')
        runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
        runner.BASE=output;runner.CORE=APP;runner.SNAPSHOT=output/'draft-input-snapshot'
        runner.REPO=Path(os.environ.get('CRIC_REVIEW_SOURCE_REPO',str(APP.parent)))
        os.environ['GIT_NO_LAZY_FETCH']='1'
        os.environ['ASTRA_REVIEW_BATCH']='canary-network'
        runner.main('browser')
        print(json.dumps({'newOutput':str(output),'historicalFrozenEvidenceRewritten':False,
                          'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}))


if __name__=='__main__':main()
