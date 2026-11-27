from pathlib import Path
import hashlib,json,unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-view-aware-legends-cb9-20261127'
def load(p):return json.loads((BASE/p).read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
class ViewAwareLegendPeer(unittest.TestCase):
 def test_real_eight_cases_sixteen_transitions_exact_epoch(self):
  r=load('actual-final-8/report.json');t=load('actual-final-8/terminal-receipt.json');self.assertEqual(t['observedExitCode'],0);self.assertEqual(t['before'],t['after']);self.assertEqual(t['before'],r['runtimeFingerprint']);self.assertEqual(t['before']['sha256'],'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49');self.assertEqual(r['protocolSha256'],sha(BASE/'browser-reader-boundary-peer.mjs'));self.assertFalse(r['records']);self.assertEqual(len(r['legendCases']),8)
  self.assertEqual({(x['id'],x['width'],x['forceFallback'])for x in r['legendCases']},{(k,w,f)for k in ['SIM-C4-L09-02','SIM-C5-L09-02']for w in [320,1280]for f in [True,False]})
  for x in r['legendCases']:
   self.assertTrue(x['instructionUsabilityOk']);self.assertEqual([v['view']for v in x['transitions']],['diagram']if x['forceFallback']else['orbit','diagram','orbit'])
   for v in x['transitions']:
    controls={c['view']:c for c in v['views']};self.assertEqual(controls[v['view']]['selected'],'true');self.assertFalse(controls['diagram']['disabled']);self.assertTrue(all(controls[k]['disabled']==x['forceFallback']for k in ['orbit','top','side']));self.assertEqual('scegli la vista Obliqua o Laterale'in v['legend'],v['view']!='diagram');self.assertTrue(v['legendVisible']);self.assertEqual(sha(BASE/'actual-final-8'/(v['pngSha256']+'.png')),v['pngSha256'])
  self.assertEqual(sum(len(x['transitions'])for x in r['legendCases']),16)
 def test_initial_unawaited_harness_negative_preserved_separately(self):
  r=load('initial-transition-not-awaited/actual/report.json');t=load('initial-transition-not-awaited/actual/terminal-receipt.json');self.assertEqual(t['observedExitCode'],1);self.assertEqual(len(r['records']),6);self.assertTrue(all(x['technicalOk']for x in r['records']));self.assertIn("'false' !== 'true'",r['failure']);self.assertEqual(r['protocolSha256'],sha(BASE/'initial-transition-not-awaited/executed-protocol.mjs'));self.assertEqual(load('summary.json')['activityCredit'],0)
if __name__=='__main__':unittest.main()
