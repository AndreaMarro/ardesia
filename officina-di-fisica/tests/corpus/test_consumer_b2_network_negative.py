"""Genuine b2 consumer negative: visible source replay is not activity credit."""
from pathlib import Path
import hashlib
import json
import unittest

BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-consumer-b2ab-20261126/network-negative-frozen-20261126'
FP='b2abff8e44eab69812c8c2a03c9876fdf49ae3dab2285f323303bcd3c1689e46'


class NetworkCanaryNegative(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r=json.loads((BASE/'ui-canary-network/report.json').read_bytes())

    def test_eight_real_profiles_bound_to_terminal_execution_and_runtime(self):
        self.assertEqual(len(self.r['cases']),8)
        self.assertEqual(self.r['runtimeFingerprint']['sha256'],FP)
        e=json.loads((BASE/'browser-canary-network-execution-receipt.json').read_bytes())
        self.assertEqual(e['observedExitCode'],0);self.assertEqual(e['actualRuntimeSha256'],FP)
        self.assertTrue(e['runtimeBeforeAndAfterIdentical'])
        self.assertEqual({(c['width'],c['view'])for c in self.r['cases']},{(w,v)for w in (320,1280)for v in ('orbit','side','top','fixed_projection')})

    def test_four_projected_tip_masks_are_narrow_claim_not_whole_cone(self):
        hits=[]
        for c in self.r['cases']:
            for a in c.get('projectedArrows',[]):
                for label in a['tipInsideOpaqueSourceLabel']:
                    if label['text']!='Nodo A':continue
                    hits.append((c['width'],c['view']))
                    tip=a['tipPixels'];box=label['box']
                    self.assertLess(abs(tip['x']-box['x']),box['w']/2)
                    self.assertLess(abs(tip['y']-box['y']),box['h']/2)
                    self.assertEqual(a['b'],[-1.4,1.43,0])
        self.assertEqual(set(hits),{(320,'orbit'),(320,'side'),(320,'top'),(1280,'top')})

    def test_physical_flow_conservation_and_gain_are_preserved_despite_ui_failure(self):
        for c in self.r['cases']:
            self.assertEqual(c['id'],'SIM-C2-L005-05');self.assertEqual(c['x'],8)
            self.assertEqual(c['model']['y'],4)
            arrows=[e for e in c['elements']if e['kind']=='arrow']
            self.assertEqual(len(arrows),3)
            lengths=[e['b'][0]-e['a'][0]for e in arrows]
            self.assertAlmostEqual(lengths[0],1.1)
            self.assertAlmostEqual(lengths[0],sum(lengths[1:]))
            self.assertEqual(c['actualRenderer'],'Tavola di misura'if c['fallback']else'3D interattivo')

    def test_original_png_bytes_and_guest_fixture_negative_retained_separately(self):
        for c in self.r['cases']:
            for field,pin in [('screenshot','screenshotSha256'),('instrumentScreenshot','instrumentScreenshotSha256')]:
                self.assertEqual(hashlib.sha256((BASE/'ui-canary-network'/c[field]).read_bytes()).hexdigest(),c[pin])
        prior=json.loads((BASE/'initial-guest-fixture-negative/diagnostic.json').read_bytes())
        self.assertEqual(prior['observedExitCode'],1);self.assertEqual(prior['actualUiCases'],0)
        self.assertFalse(prior['productionFailure'])
        self.assertEqual(self.r['guestIsolation'],'ORIGINAL_ONLY_AND_DRAFT_ASSETS_403')
        self.assertEqual(self.r['activityCredit'],0);self.assertEqual(self.r['humanApproval'],'NOT_RUN')


if __name__=='__main__':unittest.main()
