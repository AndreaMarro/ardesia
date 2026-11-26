"""Observed E×10 label masks; distinguish projection overlap from opaque mask."""
from pathlib import Path
import hashlib
import json
import unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-consumer-b2ab-20261126/electric-negative-frozen-20261126'


class ElectricNegative(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.r=json.loads((BASE/'ui-canary-electric/report.json').read_bytes())

    def test_24_genuine_states_and_terminal_execution_are_bound(self):
        self.assertEqual(len(self.r['cases']),24)
        self.assertEqual({(c['x'],c['width'],c['view'])for c in self.r['cases']},{(x,w,v)for x in (1,4,8)for w in (320,1280)for v in ('orbit','side','top','fixed_projection')})
        e=json.loads((BASE/'browser-canary-electric-execution-receipt.json').read_bytes())
        self.assertEqual(e['observedExitCode'],0);self.assertTrue(e['runtimeBeforeAndAfterIdentical'])
        self.assertEqual(e['actualRuntimeSha256'],'b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46')

    def test_true_arrow_and_explicit_zoom_keep_inverse_square_and_gain_without_clamp(self):
        for c in self.r['cases']:
            x=c['x'];self.assertAlmostEqual(c['model']['y'],90/x**2)
            arrows=[a for a in c['elements']if a['kind']=='arrow']
            self.assertEqual(len(arrows),1 if x==1 else 2)
            lengths=[a['b'][0]-a['a'][0]for a in arrows]
            self.assertAlmostEqual(lengths[0],90/(65*x*x))
            if len(arrows)==2:self.assertAlmostEqual(lengths[1],10*lengths[0])
            self.assertTrue(all(a['a'][2]==a['b'][2]==.3 for a in arrows))

    def test_seven_tips_masked_in_four_top_states_not_a_whole_cone_claim(self):
        hits=[]
        for c in self.r['cases']:
            for a in c.get('projectedArrows',[]):
                for label in a['tipInsideOpaqueSourceLabel']:
                    if label['text']!='E ×10':continue
                    hits.append((c['width'],c['view'],c['x']))
                    p=a['tipPixels'];b=label['box']
                    self.assertLess(abs(p['x']-b['x']),b['w']/2);self.assertLess(abs(p['y']-b['y']),b['h']/2)
        self.assertEqual(len(hits),7)
        self.assertEqual(set(hits),{(320,'top',4),(320,'top',8),(1280,'top',4),(1280,'top',8)})

    def test_pixels_and_original_epoch_are_retained_with_no_credit(self):
        for c in self.r['cases']:
            for name,pin in [('screenshot','screenshotSha256'),('instrumentScreenshot','instrumentScreenshotSha256')]:
                self.assertEqual(hashlib.sha256((BASE/'ui-canary-electric'/c[name]).read_bytes()).hexdigest(),c[pin])
        self.assertEqual(self.r['activityCredit'],0);self.assertEqual(self.r['humanApproval'],'NOT_RUN')
        self.assertTrue(all(c['variant']=='ORIGINAL_PUBLISHED'for c in self.r['cases']))


if __name__=='__main__':unittest.main()
