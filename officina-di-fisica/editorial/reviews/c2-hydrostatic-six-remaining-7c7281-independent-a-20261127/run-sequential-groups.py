from pathlib import Path
import json,subprocess,sys,time,hashlib
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica')
D=A/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127'
plan=json.loads((D/'matrix-prepared.json').read_bytes())
for group in plan['groups']:
    folder=Path(group['folder'])
    assert hashlib.sha256((folder/'prepared.json').read_bytes()).hexdigest()==group['preparedSha256']
    command=['python3','/private/tmp/cric_a_bounded_local.py',sys.executable,'-B',str(folder/'run-actual.py')]
    started=time.time()
    with (folder/'wrapper.stdout.txt').open('wb') as out,(folder/'wrapper.stderr.txt').open('wb') as err:
        result=subprocess.run(command,cwd=A,stdout=out,stderr=err)
    receipt=dict(actualWrapperExitCode=result.returncode,elapsedSecondsIncludingMutex=time.time()-started,command=command,stdoutSha256=hashlib.sha256((folder/'wrapper.stdout.txt').read_bytes()).hexdigest(),stderrSha256=hashlib.sha256((folder/'wrapper.stderr.txt').read_bytes()).hexdigest(),activityCredit=0)
    (folder/'wrapper-terminal.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(group['group'],receipt,flush=True)
    if result.returncode!=0:
        raise SystemExit(result.returncode)
print('All six separate browser supervisors finished; manual review still required',flush=True)
