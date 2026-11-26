"""Bounded current independent proofs, deliberately no full-family acceptance."""
from pathlib import Path
import unittest,json,copy,tempfile,shutil
from unittest.mock import patch
from tools.corpus_engineering import c1_closure_renewal_95769_verifier as m
APP=Path(__file__).resolve().parents[2];B=m.BASE
class ClosureRenewal(unittest.TestCase):
 def test_five_new_individuals_have_real_runtime_and_own_id_excluded(self):
  r=json.loads((B/'individual-reports.json').read_bytes());self.assertEqual({x['id']for x in r['records']},m.IDS);self.assertEqual(r['acceptedIndividualCount'],5);self.assertEqual(r['activityCredit'],0)
  for x in r['records']:
   self.assertTrue(x['ok']);self.assertEqual(x['runtimeProfileSha256'],m.RUNTIME);self.assertFalse(x['wholeFamilyAcceptance']);self.assertEqual(x['humanApproval'],'NOT_RUN');self.assertTrue(x['reviewDependencySha256'])
  for family in r['rawFreshEngineResults'].values():self.assertNotIn(m.EXCLUDED,family['actual']);self.assertNotIn(m.EXCLUDED,family['selectedIndependentChecks'])
 def test_original_normal_manual_failure_is_retained_beside_corrected_draft(self):
  r=json.loads((B/'individual-reports.json').read_bytes());x=next(x for x in r['records']if x['id']=='SIM-C1-L005-05');self.assertEqual((x['baseVersion'],x['candidateVersion']),(1,2));self.assertEqual(x['publicationAction'],'DRAFT');self.assertFalse(x['publishedEditionReview']['ok']);self.assertTrue(x['failedPublishedEdition']);self.assertIn('40degree',x['publishedEditionReview']['manualArithmetic'])
 def test_new_evidence_is_complete_and_cannot_reuse_a_tampered_png(self):
  self.assertEqual(len(m.evidence()['cases']),576)
  with tempfile.TemporaryDirectory(prefix='cric-proof-tamper-')as temp:
   folder=Path(temp);shutil.copytree(B/'actual-ui-576',folder/'actual-ui-576');shutil.copy2(B/'images-read.json',folder/'images-read.json');shutil.copy2(B/'collector-c1-derived.mjs',folder/'collector-c1-derived.mjs');shutil.copy2(B/'numerical-observation.mjs',folder/'numerical-observation.mjs');shutil.copy2(B/'complete-convex-certificates.json',folder/'complete-convex-certificates.json');shutil.copy2(B/'review-request.json',folder/'review-request.json')
   p=next((folder/'actual-ui-576/screens').glob('*.png'));p.write_bytes(p.read_bytes()+b'tampered')
   with patch.object(m,'BASE',folder),self.assertRaisesRegex(ValueError,'PNG bytes drift'):m.evidence()
 def test_an_unknown_app_cannot_inherit_current_or_historical_approval(self):
  with tempfile.TemporaryDirectory(prefix='cric-empty-runtime-')as temp,self.assertRaises(ValueError):m.report({},app=Path(temp))
 def test_reused_consumer_oracle_rejects_old_hidden_force_with_same_delta(self):
  import importlib
  r=json.loads((B/'individual-reports.json').read_bytes());family=r['rawFreshEngineResults']['experiments_accelerated_activity_verifier'];actual=copy.deepcopy(family['actual']);key='SIM-C1-L004-02';case=actual[key]['cases'][-1]
  arrow=next(e for e in case['elements']if e['kind']=='arrow'and e['c']==0xb94f48)
  for point in ('a','b'):arrow[point][1]-=.64
  old=importlib.import_module('tools.corpus_engineering.experiments_accelerated_activity_verifier');comparison=old.compare_runtime(actual);self.assertFalse(comparison[key]['ok'])
if __name__=='__main__':unittest.main()
