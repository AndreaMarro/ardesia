"""Independent technical review; no candidate, Root, registry or release writes.

The real historical oracles execute below. Integration and browser are isolated
only in boundary tests; those tests award neither import nor UI acceptance.
"""
import copy,hashlib,importlib,json,os,shutil,subprocess,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path('/private/tmp/cric-resident-integrator/officina-di-fisica')
GENERATED=Path('/private/tmp/cric-section-reconciliation-candidates-20261127')
PIN='f028bce3d6c30cea31d89ce016b09554bc0e5c74'
sys.path.insert(0,str(ROOT))
from tools.corpus_engineering import batches as B,section_reconciliation as S,evidence as E
from tools.corpus_engineering.pipeline import digest,sha
FROZEN=('tools/corpus_engineering/section_reconciliation.py','tools/corpus_engineering/section_identity_audit.py','tools/corpus_engineering/batches.py','tools/corpus_engineering/evidence.py','contracts/corpus-batches-v1.schema.json')
def encode(x):return (json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode()
def write(path,x):path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(encode(x))
class ImportBoundary(Exception):pass
class BridgeTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  for path in FROZEN:
   raw=subprocess.check_output(['git','show',PIN+':officina-di-fisica/'+path],cwd=ROOT.parent)
   if (ROOT/path).read_bytes()!=raw:raise AssertionError('Root frozen code changed: '+path)
  cls.registry=json.loads((ROOT/'editorial/batches/registry.json').read_bytes())
  cls.specs={s['id']:s for s in cls.registry['batches']}
  cls.names=sorted(p.name for p in (GENERATED/'editorial/reviews/section-reconciliation-v1').iterdir())
  if len(cls.names)!=25:raise AssertionError('Expected actual 25 generated packages')
  cls.checked=0
  cls.root_files={str(ROOT/path):sha((ROOT/path).read_bytes())for path in FROZEN}
  for name in cls.names:
   for path in (f'editorial/batches/{name}.json',f'editorial/batches/{name}-bindings.json',f'editorial/reviews/{name}.json'):
    cls.root_files[str(ROOT/path)]=sha((ROOT/path).read_bytes())
 @classmethod
 def tearDownClass(cls):
  if any(sha(Path(path).read_bytes())!=checksum for path,checksum in cls.root_files.items()):raise AssertionError('Root inputs changed during target')
  deps=[]
  for module in tuple(sys.modules.values()):
   name=getattr(module,'__file__',None)
   if not name:continue
   file=Path(name).resolve()
   if file.suffix!='.py' or not file.is_relative_to(ROOT):continue
   path=str(file.relative_to(ROOT.parent));raw=file.read_bytes();frozen=subprocess.check_output(['git','show',PIN+':'+path],cwd=ROOT.parent)
   if raw!=frozen:raise AssertionError('Imported Root module differs from frozen Git: '+path)
   deps.append({'commit':PIN,'path':path,'sha256':sha(raw)})
  receipt={'schemaVersion':'1.0.0','moduleDependencies':sorted(deps,key=lambda x:x['path']),'rootCommit':PIN,'freshHistoricalOracleRecords':cls.checked,'currentCompositeIdentities':cls.checked,'rootFilesUnchanged':True,'rootInputSha256':cls.root_files,'newImportAndBrowser':'NOT_RUN','humanApproval':'NOT_RUN','publicationAction':'NONE'}
  Path(__file__).with_name('actual-receipt.json').write_bytes(encode(receipt))
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='cric-section-peer-');self.repo=Path(self.temp.name).resolve();self.app=self.repo/'officina-di-fisica'
  # Shared Git object lookup only. No Git write occurs through this link.
  (self.repo/'.git').symlink_to(ROOT.parent/'.git',target_is_directory=True)
  self.batch='cric-c1-l006';self.install(self.batch)
  write(self.app/'editorial/batches/registry.json',{'schemaVersion':'1.0.0','batches':[]})
 def tearDown(self):self.temp.cleanup()
 def install(self,name):
  for suffix in (f'editorial/batches/{name}.json',f'editorial/batches/{name}-bindings.json',f'editorial/reviews/{name}-integration.json'):
   target=self.app/suffix;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(GENERATED/suffix,target)
  src=GENERATED/'editorial/reviews/section-reconciliation-v1'/name;dest=self.app/'editorial/reviews/section-reconciliation-v1'/name
  shutil.copytree(src,dest)
  shutil.copyfile(ROOT/f'editorial/reviews/{name}.json',self.app/f'editorial/reviews/{name}.json')
 def values(self,name=None):
  name=name or self.batch;old,oldb,pins=S.pinned_history(self.app,name);folder=S.reconciliation_folder(self.app,name)
  spec=copy.deepcopy(self.specs[name]);spec['sectionReconciliationSha256']=sha((folder/'certificate.json').read_bytes())
  p=json.loads((self.app/f'editorial/batches/{name}.json').read_bytes());b=json.loads((self.app/f'editorial/batches/{name}-bindings.json').read_bytes())
  report=json.loads((self.app/f'editorial/reviews/{name}.json').read_bytes())
  return spec,old,oldb,pins,p,b,report
 def verify(self,name=None,records=None):
  name=name or self.batch;spec,old,oldb,pins,p,b,report=self.values(name)
  return S.verify_reconciliation(self.app,spec,old,oldb,pins,self.app/f'editorial/reviews/{name}.json',p,b,report['records'] if records is None else records)
 def fresh(self,name=None):
  spec,old,oldb,pins,p,b,report=self.values(name);module=importlib.import_module('tools.corpus_engineering.'+spec['verifier'])
  fresh=module.verify(old,oldb);B.assert_record_identity(fresh,set(spec['questionIds']),old,oldb)
  self.assertEqual(fresh,report['records']);self.assertTrue(all(r['ok']is True for r in fresh));self.assertEqual(sha(Path(module.__file__).read_bytes()),report['verifierSha256'])
  if 'contractSha256'in report:self.assertEqual(report['contractSha256'],sha((ROOT/'tools/corpus_engineering/review_contract.py').read_bytes()))
  return fresh
 def test_all_actual_25_pairs_with_fresh_historical_oracles_and_distinct_composite(self):
  for name in self.names:
   with self.subTest(batch=name):
    if name!=self.batch:self.install(name)
    spec,old,oldb,pins,p,b,report=self.values(name);before=encode(report);fresh=self.fresh(name);revised,file=self.verify(name,records=fresh)
    B.assert_record_identity(revised,set(spec['questionIds']),p,b);self.assertEqual(encode(fresh),encode(report['records']));self.assertEqual(encode(report),before)
    for oldr,newr in zip(fresh,revised):
     a=newr['verifiedSectionReconciliation'];self.assertEqual(a['scientificReviewedSignature'],oldr['reviewedSignature']);self.assertEqual(newr['reviewedSignature'],digest(a));self.assertNotEqual(newr['reviewedSignature'],oldr['reviewedSignature']);self.assertNotEqual(newr['candidateSha256'],oldr['candidateSha256']);self.assertEqual(a['certificateSha256'],spec['sectionReconciliationSha256'])
    type(self).checked+=len(revised)
  self.assertEqual(type(self).checked,250)
 def test_rejects_wrong_math_with_candidate_binding_renewed(self):
  spec,old,oldb,pins,p,b,report=self.values();p['records'][0]['prompt']+=' changed physics';b[0]['candidateSha256']=digest(p['records'][0]);write(self.app/f'editorial/batches/{self.batch}.json',p);write(self.app/f'editorial/batches/{self.batch}-bindings.json',b)
  with self.assertRaises(ValueError):self.verify()
 def test_rejects_forged_certificate_even_with_spec_checksum_renewed(self):
  f=S.reconciliation_folder(self.app,self.batch)/'certificate.json';c=json.loads(f.read_bytes());c['identityProof']['records'][0]['nonSectionPayloadSha256']='0'*64;write(f,c)
  with self.assertRaises(ValueError):self.verify()
 def test_rejects_wrong_section_with_candidate_binding_renewed(self):
  spec,old,oldb,pins,p,b,report=self.values();p['records'][0]['section']='Wrong';b[0]['candidateSha256']=digest(p['records'][0]);write(self.app/f'editorial/batches/{self.batch}.json',p);write(self.app/f'editorial/batches/{self.batch}-bindings.json',b)
  with self.assertRaises(ValueError):self.verify()
 def test_rejects_missing_corrupt_and_stale_certificate(self):
  spec,old,oldb,pins,p,b,report=self.values()
  def run():return S.verify_reconciliation(self.app,spec,old,oldb,pins,self.app/f'editorial/reviews/{self.batch}.json',p,b,report['records'])
  f=S.reconciliation_folder(self.app,self.batch)/'certificate.json';raw=f.read_bytes();f.unlink()
  with self.assertRaises(ValueError):run()
  f.write_bytes(b'{}')
  with self.assertRaises(ValueError):run()
  f.write_bytes(raw);spec['sectionReconciliationSha256']='0'*64
  with self.assertRaises(ValueError):run()
 def test_rejects_leaf_and_directory_symlinks_and_traversal(self):
  folder=S.reconciliation_folder(self.app,self.batch);f=folder/'certificate.json';target=self.repo/'external-cert.json';f.rename(target);f.symlink_to(target)
  with self.assertRaises(ValueError):self.verify()
  f.unlink();target.rename(f);relocated=self.repo/'outside';folder.rename(relocated);folder.symlink_to(relocated,target_is_directory=True)
  with self.assertRaises(ValueError):S.pinned_history(self.app,self.batch)
  for bad in ('../../outside','cric-c6-l01','cric-c1-l006/../cric-c1-l006'):
   with self.subTest(batch=bad),self.assertRaises(ValueError):S.reconciliation_folder(self.app,bad)
 def test_rejects_historical_file_or_science_change(self):
  f=S.reconciliation_folder(self.app,self.batch)/'original-bindings.json';b=json.loads(f.read_bytes());b[0]['candidateSha256']='0'*64;write(f,b)
  with self.assertRaises(ValueError):self.verify()
 def test_old_oracle_rejects_new_payload_instead_of_retagging(self):
  spec,old,oldb,pins,p,b,report=self.values();module=importlib.import_module('tools.corpus_engineering.'+spec['verifier'])
  self.assertTrue(any(r['ok']is not True for r in module.verify(p,b)))
 def test_validate_batch_preserves_fresh_oracle_and_import_boundaries(self):
  spec,*_=self.values()
  with patch.object(B,'exercise',side_effect=ImportBoundary) as call:
   with self.assertRaises(ImportBoundary):B.validate_batch(spec,self.app)
   self.assertEqual(call.call_count,1)
 def test_validate_batch_requires_current_preview_after_import_boundary(self):
  spec,*_=self.values();integration=json.loads((self.app/f'editorial/reviews/{self.batch}-integration.json').read_bytes())
  with patch.object(B,'exercise',return_value=integration):
   with self.assertRaises(FileNotFoundError):B.validate_batch(spec,self.app)
 def test_old_report_failure_stops_before_import(self):
  spec,*_=self.values();f=self.app/f'editorial/reviews/{self.batch}.json';r=json.loads(f.read_bytes());r['records'][0]['ok']=False;write(f,r)
  with patch.object(B,'exercise',side_effect=AssertionError('must not reach integration'))as call:
   with self.assertRaises(ValueError):B.validate_batch(spec,self.app)
   self.assertEqual(call.call_count,0)
 def test_missing_certificate_metadata_does_not_allow_new_payload(self):
  spec,*_=self.values();del spec['sectionReconciliationSha256']
  with patch.object(B,'exercise',side_effect=AssertionError('must not reach integration')):
   with self.assertRaises(ValueError):B.validate_batch(spec,self.app)
 def test_legacy_old_payload_without_metadata_reaches_unchanged_import_boundary(self):
  spec,old,oldb,*_=self.values();del spec['sectionReconciliationSha256'];write(self.app/f'editorial/batches/{self.batch}.json',old);write(self.app/f'editorial/batches/{self.batch}-bindings.json',oldb)
  with patch.object(B,'exercise',side_effect=ImportBoundary):
   with self.assertRaises(ImportBoundary):B.validate_batch(spec,self.app)
 def test_compiler_retains_historical_anchor_and_emits_distinct_current_composite(self):
  spec,old,oldb,pins,p,b,report=self.values();revised,cert=self.verify();paths={'package':f'editorial/batches/{self.batch}.json','science':f'editorial/reviews/{self.batch}.json','integration':f'editorial/reviews/{self.batch}-integration.json','browser':f'editorial/reviews/{self.batch}-browser.json','sectionReconciliation':str(cert.relative_to(self.app))};sums={key:('0'*64)for key in paths};sums['sectionReconciliation']=sha(cert.read_bytes())
  context={'spec':spec,'package':p,'bindings':b,'records':revised,'paths':paths,'checksums':sums,'browserCases':30}
  empty={'report':{'records':[]}};write(self.app/'editorial/recovery/selection-199.json',empty)
  entries=[{'id':r['id'],'sourceId':z['sourceId'],'sourceSha256':z['sourceSha256'],'provenance':{'commit':z['sourceRef']},'review':{}}for r,z in zip(p['records'],b)]
  # Compilation unit only: no import or browser acceptance is claimed here.
  with patch.object(E,'recover',return_value=empty),patch.object(E,'load_registry',return_value=[spec]),patch.object(E,'validate_batch',return_value=context):
   result,versions=E.apply_evidence(self.repo,self.app,'a'*40,entries,[])
  self.assertEqual(result['newlyPublishedQuestionCount'],0)
  for entry,composite,historical in zip(entries,revised,report['records']):
   ev=entry['evidence'][0];self.assertEqual(ev['candidateSha256'],composite['candidateSha256']);self.assertEqual(ev['reviewedSignature'],composite['reviewedSignature']);self.assertNotEqual(ev['reviewedSignature'],historical['reviewedSignature']);self.assertEqual(ev['sectionReconciliation']['scientificReviewedSignature'],historical['reviewedSignature']);self.assertEqual(ev['sectionReconciliation']['sha256'],sha(cert.read_bytes()));self.assertEqual(entry['review']['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main(verbosity=2)
