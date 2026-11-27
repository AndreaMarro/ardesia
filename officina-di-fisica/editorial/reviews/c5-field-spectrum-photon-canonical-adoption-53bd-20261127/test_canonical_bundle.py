from pathlib import Path
from unittest.mock import patch
import unittest,json,copy,tempfile,shutil,sys
F=Path(__file__).resolve().parent;APP=F.parents[2];sys.path.insert(0,str(APP))
from tools.corpus_engineering import experiments_c5_field_spectrum_photon_53bd_verifier as V
from tools.corpus_engineering.batches import validate_activity_batch
SPEC=json.loads((F/'unregistered-spec.json').read_bytes());PACKAGE=json.loads((APP/'editorial/batches'/(V.BATCH+'.json')).read_bytes());BINDINGS=json.loads((APP/'editorial/batches'/(V.BATCH+'-bindings.json')).read_bytes());SOURCES={r['id']:r for r in json.loads((V.DOSSIER/'source-C5-5d.json').read_bytes())if r['id']in SPEC['activityIds']}
class CanonicalFiveC5(unittest.TestCase):
 def test_existing_validate_activity_batch_fresh_saved_and15preview(self):
  result=validate_activity_batch(SPEC,SOURCES,APP);self.assertEqual(len(result['records']),5);self.assertEqual(result['revision']['browserCases'],15)
 def test_complete_fresh_scientific_identity_and_explicit_clock_limits(self):
  report=V.report(SOURCES,PACKAGE,BINDINGS);self.assertEqual({r['id']for r in report['records']},set(SOURCES));self.assertEqual(len({r['reviewDependencySha256']for r in report['records']}),1)
  for r in report['records']:self.assertTrue(r['ok']);self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['publicationAction'],'DRAFT');self.assertIn('no clock sweep',r['clockLimitations'])
 def test_mutated_retokens_and_partial_sets_default_deny(self):
  candidate=copy.deepcopy(PACKAGE);binding=copy.deepcopy(BINDINGS);candidate['records'][0]['blocks'][0]['text']+=' False independent review.';binding[0]['candidateSha256']=V.digest(candidate['records'][0])
  with self.assertRaises(ValueError):V.report(SOURCES,candidate,binding)
  with self.assertRaises(ValueError):V.report({key:value for key,value in list(SOURCES.items())[1:]},PACKAGE,BINDINGS)
  binding=copy.deepcopy(BINDINGS);binding[0]['sourceRef']='0'*40
  with self.assertRaises(ValueError):V.report(SOURCES,PACKAGE,binding)
 def test_source_model_and_unit_mutations_default_deny(self):
  for field,value in [('measure',{'label':'Energy','unit':'J'}),('version',99)]:
   changed=copy.deepcopy(SOURCES);changed[next(iter(changed))][field]=value
   with self.assertRaises(ValueError):V.report(changed,PACKAGE,BINDINGS)
 def test_changed_actual_leaf_bytes_rejected_in_disposable_dossier(self):
  with tempfile.TemporaryDirectory(prefix='cric-c5-negative-evidence-')as home:
   app=Path(home)/'app';dossier=app/'editorial/reviews'/V.DOSSIER.name;shutil.copytree(V.DOSSIER,dossier)
   case=next((dossier/'bounded-120-clock-aware/actual/cases').glob('*.json'));case.write_bytes(case.read_bytes()+b' ')
   with patch.object(V,'APP',app),patch.object(V,'DOSSIER',dossier):
    with self.assertRaises(ValueError):V.evidence()
 def test_changed_saved_report_rejected_without_dropping_any_gate(self):
  path=APP/'editorial/reviews'/(SPEC['id']+'.json');raw=path.read_bytes();altered=json.loads(raw);altered['records'][0]['manualArithmetic']='STALE_UNREVIEWED'
  try:
   path.write_text(json.dumps(altered))
   with self.assertRaisesRegex(ValueError,'Activity evidence changed'):validate_activity_batch(SPEC,SOURCES,APP)
  finally:path.write_bytes(raw)
if __name__=='__main__':unittest.main(verbosity=2)
