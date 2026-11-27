from pathlib import Path
import subprocess,os,sys,json,time,hashlib
D=Path(__file__).resolve().parent;env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'};start=time.monotonic();receipts=[]
for name,args in [('actual-code',['node',str(D/'collect-actual.mjs'),str(D/'consumer'),str(D/'package.json')]),('comparison',[sys.executable,'-B',str(D/'check_actual.py')]),('tests',[sys.executable,'-B',str(D/'test_review.py')])]:
 with(D/(name+'.stdout.txt')).open('x')as out,(D/(name+'.stderr.txt')).open('x')as err:r=subprocess.run(args,cwd=D,env=env,stdout=out,stderr=err)
 receipt={'stage':name,'observedExitCode':r.returncode,'signal':None if r.returncode>=0 else -r.returncode};receipts.append(receipt)
 if name=='actual-code':(D/'actual-code.json').write_bytes((D/'actual-code.stdout.txt').read_bytes())
 (D/'actual-terminal.json').write_text(json.dumps({'stages':receipts,'elapsedSeconds':time.monotonic()-start,'Chrome':'NOT_RUN','activityCredit':0},indent=2)+'\n')
 if r.returncode:raise SystemExit(r.returncode)
print(json.dumps({'allStagesRealExit0':True,'elapsedSeconds':time.monotonic()-start,'Chrome':'NOT_RUN'}))
