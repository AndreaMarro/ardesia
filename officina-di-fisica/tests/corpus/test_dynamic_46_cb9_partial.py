from pathlib import Path
import hashlib,json,unittest,zipfile
APP=Path(__file__).resolve().parents[2];BASE=APP/'editorial/reviews/renewal-dynamics-46-cb9-20261127'
class CurrentDynamicPartial(unittest.TestCase):
 def test_all_fresh_math_nodes_still_deny_activity_credit_without_ui(self):
  summary=json.loads((BASE/'summary.json').read_bytes());self.assertEqual(summary['recordCount'],46);self.assertEqual(summary['sourceMathNodeOkCount'],46);self.assertFalse(summary['failures']);self.assertEqual(summary['runtimeFingerprintBeforeAndAfter']['sha256'],'cb9fc66d96ecced2addff3df4dfbeb0b5834e73a13719a78ea964bc28a5ada49');records=[];modules=json.loads((BASE/'executed-dependencies.json').read_bytes());self.assertEqual(hashlib.sha256((BASE/'executed-dependencies.zip').read_bytes()).hexdigest(),modules['archiveSha256'])
  with zipfile.ZipFile(BASE/'executed-dependencies.zip')as z:
   self.assertEqual(set(z.namelist()),set(modules['files']))
   for name,pin in modules['files'].items():self.assertEqual(hashlib.sha256(z.read(name)).hexdigest(),pin)
  for p in BASE.glob('*-math-engine-partial.json'):
   r=json.loads(p.read_bytes());self.assertEqual(r['runtimeSha256'],summary['runtimeFingerprintBeforeAndAfter']['sha256']);self.assertTrue(all(modules['files'][k]==v for k,v in r['dependencies'].items()));records+=r['selectedRecords']
  self.assertEqual(len(records),46);self.assertEqual(len({r['id']for r in records}),46);self.assertEqual({r['id']for r in records},set(summary['uniqueIds']))
  recused={'SIM-C1-L001-06','SIM-C1-L002-01','SIM-C1-L002-02','SIM-C1-L002-03','SIM-C1-L002-04','SIM-C1-L007-01'}
  self.assertFalse({r['id']for r in records}&recused)
  for r in records:self.assertTrue(r['sourceMathAndNodeChecksOk']);self.assertFalse(r['ok']);self.assertEqual(r['activityCredit'],0);self.assertEqual(r['consumerUI'],'NOT_RUN_ON_FINAL_EPOCH');self.assertEqual(r['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main()
