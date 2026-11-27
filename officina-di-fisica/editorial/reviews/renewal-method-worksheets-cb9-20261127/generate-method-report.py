from pathlib import Path
import sys,os,fcntl,shutil,json
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering import methods_renewal_cb9_verifier as m
from tools.corpus_engineering.pipeline import canonical
CURRENT=Path('/private/tmp/cric-method-css-748-independent-app');os.environ['ASTRA_EXTENSIONS']=str(CURRENT/'extensions')
with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(APP).free>=2*1024**3
 bp=json.loads((m.AUTHOR/'fixture-cb9/reader-blueprint.json').read_bytes());sources={r['id']:r['source']['record']for r in bp['records']if r['id']in m.CATALOGS};sources.update({r['id']:r for r in json.loads((APP/'content/metodo.json').read_bytes())})
 first=m.report(sources,app=CURRENT);second=m.report(sources,app=CURRENT);assert canonical(first)==canonical(second);assert first['acceptedIndividualCount']==16
 (m.WORKSHEETS/'methods-sixteen-current.json').write_text(canonical(first)+'\n');(m.WORKSHEETS/'fresh-saved-identity.json').write_text(json.dumps({'twoActualCalls':True,'strictCanonicalIdentity':True,'individualResults':16,'activityCredit':0},indent=2)+'\n');print('Fresh16 source+currentUI,2 actual calls identical,0ledger/registeredcredit.')
