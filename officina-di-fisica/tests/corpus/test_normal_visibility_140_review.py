"""Independent140 geometry counterprobes; unchanged magnitudes cannot hide vectors."""
from copy import deepcopy
from unittest.mock import patch
from pathlib import Path
import json,subprocess,unittest
from tools.corpus_engineering import experiments_forces_revision_verifier as review
APP=Path(__file__).resolve().parents[2]
KEY='SIM-C1-L005-05'

class NormalVisibility140(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source=json.loads(subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=APP))
        cls.sources={r['id']:r for r in source if r['id'] in review.SPECS};cls.effective=dict(cls.sources)
        package=json.loads((APP/'editorial/batches/experiment-normal-revision-140.json').read_text());cls.effective[KEY]=package['records'][0]
        # Canonical numerical adapter only: no browser or report approval, no DB.
        cls.actual=review.runtime_values(cls.effective)

    def test_real_hidden_normal75_keeps_correct_delta_and_is_rejected(self):
        # Break caught: a verifier checking delta/scale only admits c177 occlusion.
        self.assertTrue(review.compare_runtime(self.actual)[KEY]['ok'])
        broken=deepcopy(self.actual);row=next(r for r in broken[KEY]['cases'] if r['x']==75)
        sphere=next(e for e in row['elements'] if e.get('kind')=='ball' and e.get('c')==0xd49332)
        arrow=next(e for e in row['elements'] if e.get('kind')=='arrow' and e.get('c')==0x147979)
        delta=[b-a for a,b in zip(arrow['a'],arrow['b'])];arrow['a']=list(sphere['p']);arrow['b']=[a+d for a,d in zip(arrow['a'],delta)]
        self.assertLess(sum(d*d for d in delta),sphere['r']**2)
        self.assertFalse(review.compare_runtime(broken)[KEY]['ok'],'A correct normal magnitude hidden inside opaque body must not pass')

    def test_real_weight0_head_below_opaque_table_keeps_delta_and_is_rejected(self):
        self.assertTrue(review.compare_runtime(self.actual)[KEY]['ok'])
        broken=deepcopy(self.actual);row=next(r for r in broken[KEY]['cases'] if r['x']==0)
        sphere=next(e for e in row['elements'] if e.get('kind')=='ball' and e.get('c')==0xd49332)
        arrow=next(e for e in row['elements'] if e.get('kind')=='arrow' and e.get('c')==0xb94f48)
        delta=[b-a for a,b in zip(arrow['a'],arrow['b'])];arrow['a']=list(sphere['p']);arrow['b']=[a+d for a,d in zip(arrow['a'],delta)]
        self.assertAlmostEqual(arrow['b'][1],-.35);self.assertAlmostEqual(delta[1],-.75)
        self.assertFalse(review.compare_runtime(broken)[KEY]['ok'],'A correct weight magnitude with head behind table must not pass')

    def test_transverse_shift_keeps_both_vectors_but_changes_action_line(self):
        broken=deepcopy(self.actual);row=next(r for r in broken[KEY]['cases'] if r['x']==60)
        arrow=next(e for e in row['elements'] if e.get('kind')=='arrow' and e.get('c')==0x147979)
        arrow['a'][2]+=1;arrow['b'][2]+=1
        self.assertFalse(review.compare_runtime(broken)[KEY]['ok'])

    def test_opposite_equal_forces_must_not_cover_each_other(self):
        broken=deepcopy(self.actual);row=next(r for r in broken[KEY]['cases'] if r['x']==0)
        sphere=next(e for e in row['elements'] if e.get('kind')=='ball' and e.get('c')==0xd49332)
        arrow=next(e for e in row['elements'] if e.get('kind')=='arrow' and e.get('c')==0xb94f48)
        arrow['a']=[sphere['p'][0],sphere['p'][1]+1.05,0];arrow['b']=[sphere['p'][0],sphere['p'][1]+.3,0]
        self.assertFalse(review.compare_runtime(broken)[KEY]['ok'])

    def test_regression_is_the_independently_observed_A_negative_not_an_invented_key(self):
        folder=APP/'editorial/reviews/normal-visibility-a-20261125'
        manifest=json.loads((folder/'manifest.json').read_text());geometry=json.loads((folder/'geometry.json').read_text())
        self.assertEqual(manifest['runtimeSha256'],'c177aba9dfdbfd8296addd3583ce487e8f43ed1b52cef784636a2d1cd40f0744')
        self.assertTrue(geometry['normalAt75']['entireArrowWithinOpaqueSphere'])
        self.assertLess(geometry['normalAt75']['maximumArrowVertexRadius'],geometry['normalAt75']['sphereGeometry']['minimumFacetDistance'])
        self.assertTrue(geometry['weightAt0']['headProjectionRayHitsTabletopForEveryMeshVertex'])

    def test_current_full_glyph_proof_and_historical_A_are_bound_without_retag(self):
        self.assertTrue(review.normal_visibility_evidence()['ok'])
        with patch.object(review,'READ_NORMAL_VISIBILITY_MANIFEST_SHA256','0'*64):self.assertFalse(review.normal_visibility_evidence()['ok'])
        folder=APP/'editorial/reviews/normal-visibility-independent-1a35-20261125';m=json.loads((folder/'manifest.json').read_text())
        self.assertEqual(m['runtimeProfileSha256'],'1a3502eb7459884e9278fd10c11211d5dfae3fa89c4fe489e4c3d116c72a8bba')
        refs=m['historicalIndependentAReferences'];self.assertEqual(set(refs),{'normal-visibility-a-20261125','normal-visibility-postfix-a-20261125'})
        self.assertEqual(refs['normal-visibility-a-20261125']['manifestSha256'],'33c21222478335a063a50b41d81e57342e837117705ef89a379e71db4b8558e7')
        self.assertEqual(refs['normal-visibility-postfix-a-20261125']['manifestSha256'],'3c9bf8979c73289d5667f8be34f78e82d48af5474d2dea57fc2d099a353e4698')

if __name__=='__main__':unittest.main()
