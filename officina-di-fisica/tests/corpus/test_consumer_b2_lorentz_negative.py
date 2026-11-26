"""Real Lorentz TOP label masks, with force-direction/zero controls distinct."""
from pathlib import Path
import hashlib
import json
import math
import unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-consumer-b2ab-20261126/lorentz-negative-frozen-20261126'


class LorentzNegative(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.r=json.loads((BASE/'ui-canary-lorentz/report.json').read_bytes())

    def test_40_actual_cases_have_complete_profiles_and_terminal_receipt(self):
        self.assertEqual(len(self.r['cases']),40)
        self.assertEqual({(c['x'],c['width'],c['view'])for c in self.r['cases']},{(x,w,v)for x in (0,5,90,175,180)for w in (320,1280)for v in ('orbit','side','top','fixed_projection')})
        e=json.loads((BASE/'browser-canary-lorentz-execution-receipt.json').read_bytes());self.assertEqual(e['observedExitCode'],0)
        self.assertEqual(e['actualRuntimeSha256'],'b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46')
        self.assertTrue(e['runtimeBeforeAndAfterIdentical'])

    def test_22_tip_entries_in_ten_top_states_are_not_22_distinct_failures(self):
        hits=[]
        for c in self.r['cases']:
            for a in c.get('projectedArrows',[]):
                for label in a['tipInsideOpaqueSourceLabel']:
                    if label['text']not in ('v','B'):continue
                    hits.append((c['width'],c['view'],c['x'],label['text']))
                    p=a['tipPixels'];b=label['box'];self.assertLess(abs(p['x']-b['x']),b['w']/2);self.assertLess(abs(p['y']-b['y']),b['h']/2)
        self.assertEqual(len(hits),22)
        self.assertEqual({h[:3]for h in hits},{(w,'top',x)for w in (320,1280)for x in (0,5,90,175,180)})

    def test_force_zero_and_small_force_and_independent_cross_product_direction(self):
        for c in self.r['cases']:
            x=c['x'];arrows=[a for a in c['elements']if a['kind']=='arrow'];v=next(a for a in arrows if a['c']==0x147979)
            d=[v['b'][i]-v['a'][i]for i in range(3)];self.assertAlmostEqual(math.hypot(*d),1.4)
            force=[a for a in arrows if a['c']==0x7350b0]
            if x in (0,180):self.assertEqual(c['model']['y'],0);self.assertEqual(force,[])
            else:
                self.assertGreater(c['model']['y'],0);self.assertAlmostEqual(c['model']['y'],6*math.sin(math.radians(x)))
                self.assertEqual(len(force),1);f=force[0];self.assertEqual(f['a'][0],f['b'][0]);self.assertEqual(f['a'][2],f['b'][2])
                self.assertLess(f['b'][1]-f['a'][1],0);self.assertAlmostEqual(f['a'][1]-f['b'][1],.95*c['model']['y']/6)

    def test_raw_pixels_and_zero_activity_credit_remain_bound(self):
        for c in self.r['cases']:
            for name,pin in [('screenshot','screenshotSha256'),('instrumentScreenshot','instrumentScreenshotSha256')]:self.assertEqual(hashlib.sha256((BASE/'ui-canary-lorentz'/c[name]).read_bytes()).hexdigest(),c[pin])
        self.assertEqual(self.r['activityCredit'],0);self.assertEqual(self.r['humanApproval'],'NOT_RUN')


if __name__=='__main__':unittest.main()
