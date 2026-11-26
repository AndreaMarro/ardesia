"""Unchanged-source math only; never transfers historical UI acceptance."""
from pathlib import Path
import json,subprocess,os,importlib,sys,hashlib,fcntl,shutil,ast
APP=Path(__file__).resolve().parents[3];sys.path.insert(0,str(APP))
from tools.corpus_engineering.pipeline import canonical,sha,digest
REPO=Path('/private/tmp/cric-vector-apparatus-author-20261126');REF='27503c36097b196fb7003a6448a9aaf7ee21baf0';BASE=Path(__file__).resolve().parent
blueprint=json.loads((BASE/'reader-blueprint.json').read_bytes());source={r['id']:r['source']['record']for r in blueprint['records']};source.update({r['id']:r for r in json.loads((APP/'content/metodo.json').read_bytes())})
groups=[r for r in json.loads((APP/'editorial/reviews/renewal-240-927-inventory-20261126/plan.json').read_bytes())['groups']if r['class']=='IMMUTABLE_MATH_SOURCE_PLUS_ACTUAL_READER_RENEWAL_PLAN'];wanted={r['id']for r in blueprint['records']}
def git(name):return subprocess.check_output(['git','show',REF+':officina-di-fisica/editorial/batches/'+name],cwd=REPO,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'})
def dependency_files(file,seen=None):
 seen=seen or set();file=Path(file)
 if file in seen:return seen
 seen.add(file)
 for node in ast.walk(ast.parse(file.read_text())):
  if isinstance(node,ast.ImportFrom)and node.level==1:
   modules=[node.module]if node.module else[n.name for n in node.names]
   for name in modules:
    path=file.parent/(name.replace('.','/')+'.py')
    if path.is_file():dependency_files(path,seen)
 return seen
def main():
 results=[];errors=[]
 for spec in groups:
  selected={k:source[k]for k in spec['activityIds']};module=importlib.import_module('tools.corpus_engineering.'+spec['verifier']);revision=spec.get('revisionPackage')
  try:
   if revision:report=module.report(selected,json.loads(git(revision+'.json')),json.loads(git(revision+'-bindings.json')))
   else:report=module.report(selected)
   if {r['id']for r in report['records']}!=set(selected):raise ValueError('Exact source group IDs omitted or duplicated')
   records=[r for r in report['records']if r['id']in wanted]
   if any(not r['ok']for r in records):errors.append({'batch':spec['batchId'],'failures':[{'id':r['id'],'errors':r.get('errors')}for r in records if not r['ok']]})
   dependencies={str(p.relative_to(APP)):sha(p.read_bytes())for p in dependency_files(module.__file__)};dependencies[str(Path(__file__).relative_to(APP))]=sha(Path(__file__).read_bytes());dependency_hash=digest(dependencies);records=[{**r,'mathReviewDependencySha256':dependency_hash,'consumerUI':'NOT_RUN_ON_FINAL_EPOCH','activityCredit':0}for r in records]
   item={'batch':spec['batchId'],'sourceRuntimeCommitForFutureUI':REF,'mathematicalSourceReport':report,'selectedReaderRecords':records,'dependencies':dependencies,'reviewDependencySha256':digest(dependencies),'consumerUI':'NOT_RUN_ON_FINAL_EPOCH','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(BASE/(spec['batchId']+'-math-only.json')).write_text(canonical(item)+'\n');results.extend(records)
  except Exception as error:errors.append({'batch':spec['batchId'],'technicalError':type(error).__name__+': '+str(error)})
  print(spec['batchId'],'cumulativeReaderRecords',len(results),'errors',len(errors),flush=True)
 if len(results)!=179 or{r['id']for r in results}!=wanted:errors.append({'coverage':'179 exact unique reader records required','got':len(results)})
 summary={'scope':'Fresh recomputation of unchanged frozen source/math/manual models only, not consumer approval or new blind reading','sourceRuntimeCommitForFutureUI':REF,'readerSourceRecords':len(results),'groups':len(groups),'errors':errors,'sourceMathOkCount':sum(r['ok']for r in results),'allOldUIEvidenceNotTransferred':True,'consumerUI':'NOT_RUN_ON_FINAL_EPOCH','activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'};(BASE/'math-only-summary.json').write_text(canonical(summary)+'\n')
 if errors:raise ValueError('Source/math-only recomputation contains failures; see exact summary')
if __name__=='__main__':
 with open('/private/tmp/cric-bounded-local-work.lock','a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if shutil.disk_usage(BASE).free<2*1024**3:raise ValueError('Need2GiB free')
  main()
