from pathlib import Path
import hashlib,json,unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-reader-flow-b7c-20261127'
def load(name):return json.loads((BASE/name).read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
class ReaderBoundaryAndFallback(unittest.TestCase):
 def test_actual_six_reader_passes_on_exact_final_epoch(self):
  r=load('actual-final-6-and-legends-4/report.json');t=load('actual-final-6-and-legends-4/terminal-receipt.json')
  self.assertEqual(t['observedExitCode'],0);self.assertEqual(t['before'],t['after']);self.assertEqual(t['before'],r['runtimeFingerprint']);self.assertEqual(t['before']['sha256'],'b7c12b264de45e957ec796cf30e1670028a173e31147b60cc4e29c838ddc7a66')
  self.assertEqual(r['protocolSha256'],sha(BASE/'browser-reader-boundary-peer.mjs'));self.assertEqual(len(r['records']),6)
  self.assertEqual({(x['id'],x['width'])for x in r['records']},{(k,w)for k in ['C1-E021','C3-E019','C5-E011']for w in [641,768]})
  for x in r['records']:
   self.assertTrue(x['technicalOk']);self.assertFalse(x['violations']);self.assertTrue(all(v['scroll']<=v['width']+1 for v in x['formulas']));self.assertEqual(sha(BASE/'actual-final-6-and-legends-4'/(x['pngSha256']+'.png')),x['pngSha256'])
 def test_four_real_fallback_instructions_remain_failures(self):
  r=load('actual-final-6-and-legends-4/report.json');self.assertEqual(len(r['legendCases']),4)
  self.assertEqual({(x['id'],x['width'])for x in r['legendCases']},{(k,w)for k in ['SIM-C4-L09-02','SIM-C5-L09-02']for w in [320,1280]})
  for x in r['legendCases']:
   self.assertFalse(x['instructionUsabilityOk']);self.assertEqual(x['display'],'Tavola di misura');self.assertTrue(x['legendVisible']);self.assertIn('Obliqua o Laterale',x['legend']);v={e['view']:e['disabled']for e in x['views']};self.assertTrue(all(v[k]for k in ['orbit','top','side']));self.assertFalse(v['diagram']);self.assertEqual(sha(BASE/'actual-final-6-and-legends-4'/(x['pngSha256']+'.png')),x['pngSha256'])
  self.assertEqual(load('summary.json')['activityCredit'],0)
 def test_initial_harness_error_is_not_hidden_or_counted_as_product_failure(self):
  r=load('initial-harness-includes-valid-diagram-control/actual/report.json');t=load('initial-harness-includes-valid-diagram-control/actual/terminal-receipt.json')
  self.assertEqual(t['observedExitCode'],1);self.assertTrue(all(x['technicalOk']for x in r['records']));self.assertIn('observed.views.every',r['failure']);self.assertEqual(r['protocolSha256'],sha(BASE/'initial-harness-includes-valid-diagram-control/executed-protocol.mjs'))
if __name__=='__main__':unittest.main()
