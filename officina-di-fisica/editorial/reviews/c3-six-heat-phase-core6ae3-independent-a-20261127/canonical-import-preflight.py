from pathlib import Path
import tempfile,subprocess,os,json,time,hashlib,sys
A=Path('/private/tmp/cric-midpoint-and-press-20261127/officina-di-fisica');D=Path(__file__).resolve().parent;package=D/'canonical-inputs/experiment-c3-heat-transformations-reading-20261127.json'
code='''import json,sys
from server import store
from tools.corpus_engineering.draft_import import import_drafts
package=json.load(open(sys.argv[1]));store.initialize()
with store.connect() as db:
 before=store.encode(store.published(db));count=len(store.published(db));old={(r['id'],r['v']):r['payload']for r in db.execute('SELECT id,v,payload FROM versions')}
 a=import_drafts(db,{'id':'owner','role':'autore'},package);b=import_drafts(db,{'id':'owner','role':'autore'},package)
 assert a['saved']==6 and b['saved']==0 and b['unchanged']==6 and count==991
 assert before==store.encode(store.published(db))
 assert all(db.execute('SELECT payload FROM versions WHERE id=? AND v=?',k).fetchone()[0]==v for k,v in old.items())
 print(json.dumps({'first':a,'second':b,'publishedPreserved':count,'historicalVersionsPreserved':len(old),'ownerGuestHTTP':'NOT_RUN_NO_SERVER','browser':'NOT_RUN','activityCredit':0}))
'''
with tempfile.TemporaryDirectory(prefix='cric-c3-six-a-import-')as data:
 t=time.monotonic();r=subprocess.run([sys.executable,'-B','-c',code,str(package)],cwd=A,env={**os.environ,'ASTRA_DATA':data,'ASTRA_HOSTED':'0','ASTRA_HTTPS':'0','ASTRA_EXTENSIONS':str(A/'extensions'),'PYTHONDONTWRITEBYTECODE':'1'},capture_output=True,timeout=60)
 for k,v in [('stdout',r.stdout),('stderr',r.stderr)]:(D/('canonical-import-'+k+'.txt')).write_bytes(v)
 rec=dict(actualObservedExitCode=r.returncode,signal=-r.returncode if r.returncode<0 else None,elapsedSeconds=time.monotonic()-t,timeoutSeconds=60,timedOut=False,assistedTermination=False,stdoutSha256=hashlib.sha256(r.stdout).hexdigest(),stderrSha256=hashlib.sha256(r.stderr).hexdigest(),browser='NOT_RUN');(D/'canonical-import-terminal.json').write_text(json.dumps(rec,indent=2)+'\n');print(r.stdout.decode(),r.stderr.decode(),rec);raise SystemExit(r.returncode)
