"""Fresh bounded review evidence; deliberately preserves a real visual FAIL."""
from pathlib import Path
import hashlib,json,math,sys,unittest,importlib.util
APP=Path(__file__).resolve().parents[2];BASE=APP/'editorial/reviews/c1-six-closures-4c83-renewal-20261126';OUT=BASE/'actual-first-diagnostic-616'
def read(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
class SixClosureEvidence(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.report=read(OUT/'report.json');cls.plan=read(OUT/'prepared.json');cls.cases=[read(OUT/r['file'])for r in cls.report['cases']];cls.geometry=read(OUT/'geometry-observations.json')
 def test_complete_observed_case_set_and_bytes_preserved(self):
  self.assertEqual(len(self.cases),616);self.assertEqual({c['caseKey']for c in self.cases},set(self.plan['expectedCaseKeys']))
  for item,c in zip(self.report['cases'],self.cases):
   self.assertEqual(sha(OUT/item['file']),item['sha256']);self.assertEqual(c['runtimeSha256'],'4c83e0156b74d5a4cdfad90421f4304e6a7a03bde10d5b125f6635aae7eff907');self.assertEqual(c['activityCredit'],0);self.assertFalse(c['scientificApproval'])
   for image in c['screenshots']:self.assertEqual(sha(OUT/image['file']),image['sha256'])
 def test_failures_remain_diagnostic_and_not_retagged_pass(self):
  failures=[c for c in self.cases if not c['technicalOk']];self.assertEqual(len(failures),24);self.assertEqual(self.report['technicalStatus'],'FAIL');self.assertEqual(read(OUT/'terminal-receipt.json')['observedExitCode'],1)
  for c in failures:
   self.assertIn('numerical state drifted',c['error']);self.assertEqual(c['interaction']['x'],55 if c['id']=='SIM-C1-L005-05'else 90)
  r=read(BASE/'partial-review.json');self.assertEqual(r['newUIAcceptance']if'newUIAcceptance'in r else r['activityCredit'],0)
 def test_real_shaft_mask_is_not_misreported_as_tip_or_entire_cone(self):
  issues=self.geometry['observationsRequiringReview'];self.assertEqual(len(issues),12);self.assertEqual(len({x['caseKey']for x in issues}),6)
  for x in issues:
   self.assertEqual(x['part'],'shaft');self.assertTrue(x['caseKey'].startswith('SIM-C1-L007-01|published|'));self.assertIn('|side|',x['caseKey']);self.assertFalse(x['opaquePhysicalMeshRayHits']);self.assertEqual([l['text']for l in x['labelProjectedHullGaps']if l['gapPixels']<=0],['y'])
  source=next(c for c in self.cases if c['caseKey']=='SIM-C1-L007-01|published|320|side|grid|0');self.assertTrue(all(not g['tipInsideOpaqueLabel']for g in source['nativeGlyphs']))
 def test_sampled_physical_mesh_rays_do_not_invent_a_containment_finding(self):
  self.assertEqual(len(self.geometry['cases']),536)
  for c in self.geometry['cases']:
   for p in c['fullNativeParts']:self.assertFalse(p['opaquePhysicalMeshRayHits']);self.assertGreater(p['closed32facetUniqueVertices'],32)
 def test_independent_exact_manual_values_and_dimensions(self):
  from fractions import Fraction as F
  import sympy as s
  import pint
  U=pint.UnitRegistry();self.assertEqual(20-5*F(9,10)**2,F(319,20));self.assertEqual(F(7,2)**2/2,F(49,8));self.assertEqual(-50*F(1,100),F(-1,2));self.assertEqual(10*(5-F(5,2)),25)
  self.assertEqual(s.simplify(12*s.cos(2*s.pi/3)),-6);self.assertEqual(12*s.cos(s.pi/2),0);self.assertEqual(20*s.cos(s.pi/3),10)
  self.assertEqual((50*U.newton/U.meter*.01*U.meter).to(U.newton).magnitude,.5);self.assertEqual((4*U.newton*3*U.meter).to(U.joule).magnitude,12)
  self.assertEqual((1*U.kg*10*U.meter/U.second**2*F(5,2)*U.meter).to(U.joule).magnitude,25)
  self.assertIn('SIM-C1-L005-05',read(BASE/'partial-review.json')['sourceManualFailureRetained'])
 def test_canonical_owner_import_and_guest_isolation_are_real(self):
  self.assertEqual(self.report['guestIsolation'],'ORIGINAL_OR_DENIED_AND_DRAFT_ASSETS_403');self.assertEqual(len(self.report['fullOwnerRecordIdentity']['records']),3)
  imp=self.report['canonicalImport'];self.assertEqual(imp['publishedCount'],991);self.assertEqual(len(imp['imports']),3)
  for r in imp['imports']:self.assertEqual(r['first']['saved'],1);self.assertEqual(r['second']['saved'],0)
 def test_collector_derivation_changes_cardinality_only(self):
  old=(APP/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_text();derived=(BASE/'collector-c1-derived.mjs').read_text()
  expected=old.replace('len(files)==4 and len(names)==2 and len(set(names))==2','len(files)==6 and len(names)==3 and len(set(names))==3').replace('assert.equal(checked.length,9)','assert.equal(checked.length,3)').replace('All nine complete normalized owner records','All three complete normalized C1 owner records')
  self.assertEqual(derived,expected);self.assertEqual(sha(BASE/'collector-c1-derived.mjs'),read(BASE/'review-request.json')['collectorSha256'])
if __name__=='__main__':unittest.main()
