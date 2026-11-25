"""One bounded installed-code group, with real resource and runtime guards.

No browser, DB, candidate authoring or acceptance action. Repeated equal output
is retained; different bytes never overwrite an earlier collection.
"""
import argparse,fcntl,hashlib,json,os,shutil,subprocess
from pathlib import Path

APP=Path(__file__).resolve().parents[2]
RUNTIME='1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba'
GROUPS=('state','calorimetry','first-law','paths','entropy')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('group',choices=GROUPS);args=parser.parse_args()
    lock=open('/private/tmp/cric-bounded-local-work.lock','a');fcntl.flock(lock,fcntl.LOCK_EX)
    if shutil.disk_usage(APP).free<2*1024**3:raise ValueError('FAIL_CLOSED free<2GiB')
    from .runtime_fingerprint import runtime_fingerprint
    before=runtime_fingerprint(APP)['sha256']
    if before!=RUNTIME:raise ValueError('Unknown runtime; no collection executed')
    protocol=APP/'tests/corpus/collect-C3-bounded-code-only.mjs'
    run=subprocess.run(['node',str(protocol),args.group],cwd=APP,text=True,capture_output=True,timeout=45)
    if run.returncode:raise ValueError('Installed collector failed: '+run.stderr[:1000])
    report=json.loads(run.stdout);after=runtime_fingerprint(APP)['sha256']
    if after!=before:raise ValueError('Runtime changed during actual collection')
    if report.get('group')!=args.group or report.get('UI')!='NOT_RUN' or report.get('scientificApproval') is not False:
        raise ValueError('Unexpected collection disposition')
    report.update(runtimeProfileBefore=before,runtimeProfileAfter=after,
                  terminalStatus='COMPLETED_CODE_COLLECTION_ONLY',
                  collectorWrapperSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
    raw=(json.dumps(report,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()
    if shutil.disk_usage(APP).free<2*1024**3:raise ValueError('FAIL_CLOSED free<2GiB before artifact write')
    target=APP/'editorial/reviews'/('C3-'+args.group+'-installed-code-1a35-20261125.json')
    if target.exists() and target.read_bytes()!=raw:raise ValueError('Earlier collection differs; preserve it before a new edition')
    if not target.exists():target.write_bytes(raw)
    print(json.dumps({'path':str(target.relative_to(APP)),'sha256':hashlib.sha256(raw).hexdigest(),
                      'records':len(report['records']),'states':sum(len(r['cases']) for r in report['records']),
                      'clockFrames':sum(len(c['clockSamples']) for r in report['records'] for c in r['cases']),
                      'UI':'NOT_RUN','activityCredit':0}))

if __name__=='__main__':main()
