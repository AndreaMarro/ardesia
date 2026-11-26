from pathlib import Path
import importlib.util,hashlib,json,shutil,subprocess,tempfile,unittest
ROOT=Path('/private/tmp/cric-resident-integrator');APP=ROOT/'officina-di-fisica';REF='e7aeae2b2ef88eecfcda2a3bcb34301ff61a82dd';NAME='officina-di-fisica/tools/corpus_engineering/experiment_visibility_request.py';raw=subprocess.check_output(['git','show',REF+':'+NAME],cwd=ROOT);assert raw==(ROOT/NAME).read_bytes();spec=importlib.util.spec_from_file_location('independent_frozen_visibility',ROOT/NAME);v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
HOME=APP/'editorial/reviews/same-browser-reference-contract-20261126/actual-ui7-protocol-final';prepared=json.loads((HOME/'prepared.json').read_bytes());protocol=hashlib.sha256((APP/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_bytes()).hexdigest()
class IndependentReportBoundary(unittest.TestCase):
 def copy(self):
  directory=tempfile.TemporaryDirectory(prefix='cric-139-independent-case-');self.addCleanup(directory.cleanup);target=Path(directory.name)/'evidence';shutil.copytree(HOME,target);return target
 def mutate(self,target,remove_interaction):
  rp=target/'report.json';report=json.loads(rp.read_bytes());item=next(c for c in report['cases'] if '|grid|' in c['caseKey']);cp=target/item['file'];case=json.loads(cp.read_bytes());assert case['interaction']['kind']=='grid';case['model']['y']+=1
  if remove_interaction:case.pop('interaction')
  raw=(json.dumps(case,ensure_ascii=False,indent=2)+'\n').encode();cp.write_bytes(raw);item['sha256']=hashlib.sha256(raw).hexdigest();rp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('ADVERSARIAL_COPY',item['caseKey'],'removeInteraction',remove_interaction,flush=True)
 def test_actual_unchanged_seven_case_report_is_accepted(self):v.verify_report(self.copy(),prepared,protocol)
 def test_wrong_model_with_state_metadata_is_rejected(self):
  out=self.copy();self.mutate(out,False)
  with self.assertRaisesRegex(ValueError,'parity'):v.verify_report(out,prepared,protocol)
 def test_missing_state_metadata_cannot_bypass_strict_parity(self):
  out=self.copy();self.mutate(out,True)
  with self.assertRaises(ValueError):v.verify_report(out,prepared,protocol)
if __name__=='__main__':unittest.main(verbosity=2)
