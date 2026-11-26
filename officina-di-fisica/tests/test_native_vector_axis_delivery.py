"""Actual author proof/provenance, never independent scientific acceptance."""
from pathlib import Path
import hashlib,json,unittest,zipfile
APP=Path(__file__).resolve().parents[1]
B=APP/'editorial/author-notes/native-vector-apparatus-correction-20261126'
def load(p):return json.loads(p.read_bytes())
class NativeVectorDelivery(unittest.TestCase):
 def test_actual264_final_terminal_modes_inputs_and_legends(self):
  root=B/'actual-final-ui-264';report=load(root/'report.json');terminal=load(root/'terminal-receipt.json');plan=load(root/'prepared.json')
  self.assertEqual(terminal['observedExitCode'],0);self.assertIsNone(terminal['error']);self.assertEqual(terminal['runtimeSha256'],'f7827fb98cd218f1657a7e2208737de512235a82b66da3fb7bccbed4c192980f');self.assertEqual(terminal['activityCredit'],0)
  self.assertEqual({x['caseKey']for x in report['cases']},set(plan['expectedCaseKeys']));self.assertEqual(len(report['cases']),264);self.assertEqual(len(plan['records']),8)
  native=fallback=0
  for item in report['cases']:
   raw=(root/item['file']).read_bytes();self.assertEqual(hashlib.sha256(raw).hexdigest(),item['sha256']);case=json.loads(raw)
   with self.subTest(case=case['caseKey']):
    self.assertTrue(case['technicalOk']);self.assertEqual(case['runtimeSha256'],terminal['runtimeSha256'])
    for img in case['screenshots']:self.assertEqual(hashlib.sha256((root/img['file']).read_bytes()).hexdigest(),img['sha256'])
    if 'interaction' not in case:continue
    native+=not case['profile']['fallback'];fallback+=case['profile']['fallback'];controls={x['view']:x['disabled']for x in case['viewControls']}
    self.assertFalse(controls['diagram']);self.assertTrue(all(controls[v]==case['profile']['fallback']for v in ['orbit','top','side']));self.assertIn('tavola 2D',case['legend']);self.assertIn('letture numeriche',case['legend']);self.assertNotIn('usa la vista Alto',case['legend']);self.assertFalse(any(e['kind']=='label'and e['text']=='y'for e in case['elements']))
  self.assertEqual((native,fallback),(150,50));self.assertEqual(len(report['canonicalImport']['imports']),3);self.assertEqual(report['canonicalImport']['publishedCount'],991)
 def test_open_visual_findings_are_not_hidden_by_terminal_technical_success(self):
  result=load(B/'open-visual-findings.json');self.assertEqual(result['scientificApproval'],'NOT_GRANTED');self.assertEqual(result['activityCredit'],0);self.assertEqual(result['clippingStates'],2);self.assertEqual(result['clippingPartObservations'],4);self.assertEqual(result['labelHullIntersections'],0)
 def test_exact_negative_harness_run_and_peer_fallback_failure_retained(self):
  side=load(B/'negative-fallback-assertion-264.json');self.assertEqual(side['actualTerminalExitCode'],1);self.assertEqual(side['harnessFailures'],50);self.assertEqual(hashlib.sha256((B/'negative-fallback-assertion-264.zip').read_bytes()).hexdigest(),side['zipSha256'])
  with zipfile.ZipFile(B/'negative-fallback-assertion-264.zip')as z:
   self.assertEqual(set(z.namelist()),set(side['files']))
   for name,pin in side['files'].items():self.assertEqual(hashlib.sha256(z.read(name)).hexdigest(),pin['sha256'])
  refs=load(B/'frozen-negative-references.json');self.assertIn('f25f448',json.dumps(refs));self.assertEqual(side['activityCredit'],0)
if __name__=='__main__':unittest.main()
