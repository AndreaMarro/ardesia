import unittest,json,copy
from tools.corpus_engineering import c2_hydrostatic_draft_groups_7c7281_review_a as v
BASE=v.APP/'editorial/reviews/c2-manometro-v3-7c7281-independent-a-20261127'
class ManometroV3Actual(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual(BASE);cls.p=json.loads((BASE/'prepared.json').read_bytes());cls.r=json.loads((BASE/'actual/report.json').read_bytes())
 def test_48cases16accepted_answers(self):
  self.assertEqual(len(self.cases),48);self.assertEqual(sum(len(c.get('questions',[]))for c in self.cases),16);self.assertEqual({c['id']for c in self.cases},{'SIM-C2-L002-04'});self.assertEqual({c['variant']for c in self.cases},{'draft'})
 def test_actual_live2_owner3(self):
  self.assertEqual(self.p['records'][0]['record']['baseVersion'],2);self.assertEqual(self.p['records'][0]['record']['version'],3);self.assertTrue(v.exact_owner_versions(self.r['fullOwnerRecordIdentity'],self.p['draftRecords']))
 def test_bad_owner2_4_boolean_rejected(self):
  for value in [2,4,True]:
   owner=copy.deepcopy(self.r['fullOwnerRecordIdentity']);next(r for r in owner['records']if r['id']=='SIM-C2-L002-04')['version']=value
   with self.assertRaises(ValueError):v.exact_owner_versions(owner,self.p['draftRecords'])
 def test_all8profiles_read_png(self):
  d=json.loads((BASE/'visual-review-per-id.json').read_bytes());r=d['records'][0];self.assertEqual(len(r['readPngSha256']),8);self.assertEqual(len({(x['profile']['width'],x['profile']['view'])for x in r['readFiles']}),8)
  for file in r['readFiles']:self.assertEqual(v.sha((v.APP/file['path']).read_bytes()),file['sha256'])
 def test_signed_zero_and_levels(self):
  states=[c for c in self.cases if'interaction'in c];self.assertEqual(len(states),40)
  for c in states:self.assertEqual(c['model']['y'],10*c['model']['x'])
  self.assertEqual({c['model']['x']for c in states},{-2,-1,0,1,2})
 def test_formula_fit_all_profiles(self):
  setup=[c for c in self.cases if'phases'in c];self.assertEqual(len(setup),8)
  for c in setup:self.assertEqual(len(c['reading']['formulas']),4);self.assertTrue(all(f['typeset']<=f['width']+1 and f['scroll']<=f['width']+1 for f in c['reading']['formulas']))
 def test_owner_guest_and_canonical_idempotence(self):
  self.assertEqual(self.r['guestIsolation'],'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403');self.assertEqual(self.r['canonicalImport']['publishedCount'],991);self.assertEqual(self.r['canonicalImport']['imports'][0]['second']['saved'],0)
 def test_local_verdict_never_grants_credit(self):
  d=json.loads((BASE/'visual-review-per-id.json').read_bytes());self.assertEqual(d['activityCredit'],0);self.assertEqual(d['humanApproval'],'NOT_RUN');self.assertIn('axial',d['records'][0]['reason'])
 def test_actual_http_guest_denied_live2_owner3(self):
  h=json.loads((BASE/'actual-owner-guest-http.json').read_bytes());self.assertEqual(h['guest']['status'],403);self.assertEqual(h['canonicalPublishedLiveVersion'],2);self.assertEqual(h['owner']['version'],3);self.assertTrue(h['owner']['completeNormalizedPayloadEqualsPrepared']);self.assertTrue(h['publishedUnchanged']);self.assertEqual(v.sha((BASE/'actual-guest-response.json').read_bytes()),h['guest']['bodySha256']);self.assertEqual(v.sha((BASE/'actual-owner-draft-v3.json').read_bytes()),h['owner']['bodySha256'])
if __name__=='__main__':unittest.main()
