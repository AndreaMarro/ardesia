"""Actual frozen six-case responsive failure; future epochs must not retag it."""
from pathlib import Path
import hashlib,json,unittest
APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/independent-reader-flow-34d-20261127'
def load(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
class BoundaryEvidence(unittest.TestCase):
    def test_six_actual_width_failures_and_unmodified_source_epoch(self):
        report=load(BASE/'actual-boundary-6/report.json');receipt=load(BASE/'actual-boundary-6/terminal-receipt.json')
        self.assertEqual(receipt['observedExitCode'],1);self.assertEqual(receipt['before'],receipt['after']);self.assertEqual(receipt['before'],report['runtimeFingerprint'])
        self.assertEqual(report['runtimeFingerprint']['sha256'],'34d3de9ee5f452bf469b007c8e6f9686ebcc103af647bfe1ac4873d975e0cb67')
        self.assertEqual(report['protocolSha256'],sha(BASE/'browser-reader-boundary-peer.mjs'));self.assertEqual(len(report['records']),6)
        self.assertEqual({(r['id'],r['width'])for r in report['records']},{(k,w)for k in['C1-E021','C3-E019','C5-E011']for w in[641,768]})
        for row in report['records']:
            self.assertFalse(row['technicalOk']);self.assertIn('Formula overflow',row['error']);self.assertTrue(any(f['scroll']>f['width']+1 for f in row['formulas']))
            self.assertEqual([v['id']for v in row['violations']],['scrollable-region-focusable']);self.assertEqual(sha(BASE/'actual-boundary-6'/(row['failureScreenshotSha256']+'.png')),row['failureScreenshotSha256'])
        self.assertEqual(load(BASE/'summary.json')['activityCredit'],0)
if __name__=='__main__':unittest.main()
