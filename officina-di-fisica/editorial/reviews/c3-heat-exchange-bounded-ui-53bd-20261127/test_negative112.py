from pathlib import Path
from fractions import Fraction as Q
import json,hashlib,unittest
F=Path(__file__).resolve().parent;D=F/'controls-112';A=D/'actual';plan=json.loads((D/'prepared.json').read_bytes());report=json.loads((A/'report.json').read_bytes());terminal=json.loads((D/'actual-terminal.json').read_bytes());rows={r['caseKey']:json.loads((A/r['file']).read_bytes())for r in report['cases']};witness=json.loads((D/'confirmed-negative-witnesses.json').read_bytes());sha=lambda b:hashlib.sha256(b).hexdigest()
class RealNegative112(unittest.TestCase):
 def test_terminal_complete_negative_not_pass_or_timeout(self):
  self.assertEqual(terminal['exitCode'],1);self.assertFalse(terminal['timeoutTriggered']);self.assertEqual(len(rows),112);self.assertEqual(set(rows),set(plan['expectedCaseKeys']));self.assertEqual(report['errors'],[]);self.assertEqual(report['runtimeFingerprint'],plan['runtimeFingerprint'])
 def test_all_actual_leaf_and_screenshot_checksums(self):
  for index in report['cases']:
   raw=(A/index['file']).read_bytes();self.assertEqual(sha(raw),index['sha256']);row=json.loads(raw);self.assertEqual(row['runtimeSha256'],plan['runtimeFingerprint']['sha256'])
   for image in row['screenshots']:self.assertEqual(sha((A/image['file']).read_bytes()),image['sha256'])
 def test_four_formula_setups_and_twelve_unobserved_not_credit(self):
  bad=[r for r in rows.values()if not r['technicalOk']];self.assertEqual(len(bad),16);setup=[r for r in bad if r['caseKey'].endswith('|setup')];self.assertEqual(len(setup),4)
  for r in setup:self.assertEqual(r['id'],'SIM-C3-L05-01');self.assertEqual(r['profile']['width'],320);self.assertIn('metrics.formulas.every',r['error'])
  self.assertEqual(sum(len(r.get('questions',[]))for r in rows.values()),40)
  for r in rows.values():
   for q in r.get('questions',[]):self.assertTrue(q['status'].startswith('Corretto. '))
 def test_four_specific_raster_read_tip_observations_have_bound_witness(self):
  self.assertEqual(len(witness['observations']),4)
  for r in witness['observations']:
   self.assertTrue(r['wholePNGRead']);g=r['sourceProjectedGlyph'];tip=g['tipPixels'];self.assertTrue(g['tipInsideOpaqueLabel'])
   for label in g['tipInsideOpaqueLabel']:
    b=label['box'];self.assertLess(abs(tip['x']-b['x']),b['w']/2);self.assertLess(abs(tip['y']-b['y']),b['h']/2)
   self.assertEqual(sha((A/r['actualPNG']['file']).read_bytes()),r['actualPNG']['sha256'])
 def test_actual_radiation_signs_and_zero_all_eight_profiles(self):
  rad=[r for r in rows.values()if r['id']=='SIM-C3-L05-03'and'grid'in r['caseKey']];self.assertEqual(len(rad),32)
  for r in rad:
   x=r['sourceReplayedX'];y=float(Q.from_float(5.67e-8)*(Q(str(x))**4-300**4));self.assertEqual(r['model']['y'],y);arrows=[e for e in r['elements']if e['kind']=='arrow']
   if x==300:self.assertEqual(arrows,[])
   else:
    self.assertEqual(len(arrows),3)
    for e in arrows:self.assertEqual((e['b'][0]>e['a'][0])-(e['b'][0]<e['a'][0]),(x>300)-(x<300))
if __name__=='__main__':unittest.main(verbosity=2)
