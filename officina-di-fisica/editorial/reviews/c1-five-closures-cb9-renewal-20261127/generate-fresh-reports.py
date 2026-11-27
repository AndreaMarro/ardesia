from pathlib import Path
import sys,os,json,fcntl,shutil
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import c1_closure_renewal_cb9_verifier as m
from tools.corpus_engineering.pipeline import canonical
CURRENT=Path('/private/tmp/cric-method-css-748-independent-app');os.environ['ASTRA_EXTENSIONS']=str(CURRENT/'extensions')
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>=2*1024**3
 sources={r['id']:r for r in json.loads((CURRENT/'content/esperienze-C1.json').read_bytes())}
 first=m.report(sources,app=CURRENT);second=m.report(sources,app=CURRENT);assert canonical(first)==canonical(second);assert first['acceptedIndividualCount']==5
 (m.BASE/'individual-reports.json').write_text(canonical(first)+'\n');(m.BASE/'fresh-saved-identity.json').write_text(json.dumps({'strictCanonicalIdentity':True,'twoActualCalls':True,'acceptedIndividuals':first['acceptedIndividualCount'],'runtimeSha256':m.RUNTIME,'activityCredit':0},indent=2)+'\n');print('Two fresh calls identical;5 bounded individual results,0 ledger or registered credit.')
