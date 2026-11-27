from pathlib import Path
import json,sys,os,time,fcntl,shutil
F=Path(__file__).resolve().parent;APP=F.parents[2];WORK=APP.parent.parent;sys.path.insert(0,str(APP));os.environ['ASTRA_EXTENSIONS']=str(APP/'extensions')
with(WORK/'.cric-browser.lock').open('a+')as lock:
 fcntl.flock(lock,fcntl.LOCK_EX);assert shutil.disk_usage(WORK).free>=2*1024**3
 from tools.corpus_engineering import experiments_c3_heat_exchange_3c17_verifier as verifier
 from tools.corpus_engineering.integration import exercise
 source=json.loads((APP/'editorial/reviews/c3-heat-exchange-final-3c17-20261127/source-C3-5d.json').read_bytes());spec=json.loads((F/'unregistered-spec.json').read_bytes());sources={r['id']:r for r in source if r['id']in spec['activityIds']};package=json.loads((APP/'editorial/batches'/(spec['revisionPackage']+'.json')).read_bytes());bindings=json.loads((APP/'editorial/batches'/(spec['revisionPackage']+'-bindings.json')).read_bytes());start=time.time();report=verifier.report(sources,package,bindings);(APP/'editorial/reviews'/(spec['id']+'.json')).write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');integration=exercise(spec['revisionPackage']);(APP/'editorial/reviews'/(spec['revisionPackage']+'-integration.json')).write_text(json.dumps(integration,indent=2,ensure_ascii=False)+'\n');print(json.dumps({'records':len(report['records']),'freshReportRecords':[(r['id'],r['ok'])for r in report['records']],'integration':integration,'seconds':time.time()-start,'registryChanged':False,'activityCredit':0},ensure_ascii=False))
