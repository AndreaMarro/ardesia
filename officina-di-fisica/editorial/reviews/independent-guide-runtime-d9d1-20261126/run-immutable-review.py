"""Reconstruct only pinned runtime inputs in a temporary APP and run own probes.

No authoring module is imported and no author/live or ROOT file is modified.
"""
from pathlib import Path
import fcntl
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

BASE=Path(__file__).resolve().parent
CORE=BASE.parents[2]
REPO=Path('/private/tmp/cric-consumer-author-20261126')
REF='cbc64655906e0a3c990c74cdd7fe613d57e130e9'
SNAPSHOT=BASE/'candidate-input-snapshot'
PROFILE='d9d1bbf4a269a9a7b0e3a9cd4f5595f8dc45a85b77d3337b241b7dfa62968927'


def sha(raw):return hashlib.sha256(raw).hexdigest()
def git(name):return subprocess.check_output(['git','show',REF+':officina-di-fisica/'+name],cwd=REPO)


def main(mode):
    assert mode in ('code','browser')
    assert shutil.disk_usage(BASE).free>=2*1024**3
    fp=json.loads((SNAPSHOT/'editorial/author-notes/clock-guide-and-interference-rows-20261126/candidate-runtime-fingerprint.json').read_bytes())
    assert fp['sha256']==PROFILE
    with tempfile.TemporaryDirectory(prefix='cric-independent-guide-d9d1-') as folder:
        app=Path(folder)/'officina-di-fisica';app.mkdir()
        for name,pin in fp['files'].items():
            if name.startswith('node_modules/'):
                assert sha((CORE/name).read_bytes())==pin,name
                continue
            raw=git(name);assert sha(raw)==pin,name
            target=app/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
        (app/'node_modules').symlink_to(CORE/'node_modules',target_is_directory=True)
        protocol=git('tools/corpus_engineering/runtime_fingerprint.py')
        assert sha(protocol)==fp['protocolSha256']
        (app/'tools/corpus_engineering/runtime_fingerprint.py').write_bytes(protocol)
        packages=app/'editorial/batches';packages.mkdir(parents=True)
        for name in ('experiments-manual-support-revision-263.json','experiments-manual-support-revision-263-bindings.json'):
            (packages/name).write_bytes((SNAPSHOT/'editorial/batches'/name).read_bytes())
        env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PYTHONPATH':'.',
             'PATH':'/private/tmp/cric-recovery-venv/bin:'+os.environ['PATH'],
             'ASTRA_REVIEW_APP':str(app),'ASTRA_EXTENSIONS':str(app/'extensions'),
             'ASTRA_DRAFT_READING_BATCHES':'experiments-manual-support-revision-263',
             'ASTRA_RESULTS':str(BASE/'browser-reading')}
        observed=json.loads(subprocess.check_output(['python3','-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=app,env=env))
        assert observed==fp
        (BASE/'actual-reconstructed-runtime-fingerprint.json').write_text(json.dumps(observed,indent=2)+'\n')
        cmd=['node',str(BASE/('probe-epoch.mjs' if mode=='code' else 'protocol-private-consumer-reading.mjs'))]
        status='NOT_TERMINAL';code=None
        try:
            with (BASE/(mode+'-execution.txt')).open('wb') as log:
                p=subprocess.run(cmd,cwd=app,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=360)
            code=p.returncode;status='PASS' if code==0 else 'FAIL'
        except subprocess.TimeoutExpired:
            status='FAIL_TIMEOUT'
            raise
        finally:
            fresh=json.loads(subprocess.check_output(['python3','-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=app,env=env))
            assert fresh==fp,'Immutable reconstructed runtime drifted'
            receipt={'sourceCommit':REF,'actualRuntimeSha256':PROFILE,'reconstructedPinnedRuntimeFiles':len(fp['files']),
                     'command':cmd,'observedExitCode':code,'terminalStatus':status,
                     'runtimeBeforeAndAfterIdentical':True,'temporaryApp':'REMOVED_BY_CONTEXT_EXIT',
                     'authoringModulesImported':False,'realRootWrites':0,'activityCredit':0,
                     'humanApproval':'NOT_RUN','publicationAction':'NONE'}
            (BASE/(mode+'-execution-receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n')
        assert code==0,(mode,code)


if __name__=='__main__':
    with open('/private/tmp/cric-bounded-local-work.lock','a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX)
        main(sys.argv[1])
