"""Echo masks versus camera-ray occlusion, distinctly from containment."""
from pathlib import Path
import hashlib
import json
import math
import unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-consumer-b2ab-20261126/echo-negative-frozen-20261126'

class EchoNegative(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r=json.loads((BASE/'ui-canary-echo/report.json').read_bytes())
        cls.o=json.loads((BASE/'independent-observations.json').read_bytes())

    def test_actual_sixteen_cases_bound_to_b2_and_clock_zero(self):
        self.assertEqual(len(self.r['cases']),16)
        self.assertEqual({(c['x'],c['width'],c['view'])for c in self.r['cases']},{(x,w,v)for x in (1,20)for w in (320,1280)for v in ('orbit','side','top','fixed_projection')})
        self.assertEqual({c['clockTime']for c in self.r['cases']},{0})
        receipt=json.loads((BASE/'browser-canary-echo-execution-receipt.json').read_bytes())
        self.assertEqual(receipt['observedExitCode'],0);self.assertTrue(receipt['runtimeBeforeAndAfterIdentical'])
        self.assertEqual(receipt['actualRuntimeSha256'],'b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46')

    def test_real_twenty_ms_top_masks_are_not_cone_containment(self):
        for w in (320,1280):
            c=next(c for c in self.r['cases']if c['x']==20 and c['view']=='top'and c['width']==w)
            out=next(a for a in c['projectedArrows']if a['c']==0x147979)
            self.assertIn('Riflettore',[l['text']for l in out['tipInsideOpaqueSourceLabel']])
            for label in out['tipInsideOpaqueSourceLabel']:
                p=out['tipPixels'];b=label['box'];self.assertLess(abs(p['x']-b['x']),b['w']/2);self.assertLess(abs(p['y']-b['y']),b['h']/2)

    def test_full_xyz_return_camera_ray_intersects_sphere_but_tip_outside(self):
        for q in self.o['topReturnRaySphereObservations']:
            p=q['tip'];c=q['opaqueSphere']['p'];r=q['opaqueSphere']['r'];u=q['rayDirection'];d=[c[i]-p[i]for i in range(3)];along=sum(a*b for a,b in zip(d,u));perp=math.sqrt(sum((d[i]-along*u[i])**2 for i in range(3)))
            self.assertGreater(math.hypot(*d),r);self.assertGreater(along,0);self.assertLess(perp,r)
            self.assertAlmostEqual(perp,q['perpendicularDistance']);self.assertTrue(q['rayIntersectsSphere']);self.assertFalse(q['tipInsideSphere'])

    def test_png_hashes_and_no_activity_credit(self):
        for c in self.r['cases']:
            for name,pin in [('screenshot','screenshotSha256'),('instrumentScreenshot','instrumentScreenshotSha256')]:self.assertEqual(hashlib.sha256((BASE/'ui-canary-echo'/c[name]).read_bytes()).hexdigest(),c[pin])
        self.assertEqual(self.o['activityCredit'],0);self.assertEqual(self.o['humanApproval'],'NOT_RUN')

if __name__=='__main__':unittest.main()
