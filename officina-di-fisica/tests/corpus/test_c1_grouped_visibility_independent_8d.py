"""Historical, real 8d consumer evidence: no current-runtime approval or retag."""
from pathlib import Path
import json, hashlib, unittest, copy
APP=Path(__file__).resolve().parents[2]
D=APP/'editorial/reviews/c1-grouped-visibility-independent-8d36-20261125'
FP='8d36a399f6a4d7f436369163be9cf48eb15633cbca7683ebf368f2efccb34a55'
def read(name): return json.loads((D/name).read_text())
def complete_matrix(r):
    if r.get('runtimeProfileBefore')!=FP or r.get('runtimeProfileAfter')!=FP or r.get('terminalStatus')!='COMPLETED' or r.get('errors'): return False
    ids={c['id'] for c in r['cases']}
    return len(ids)==26 and len(r['cases'])==352 and all({(c['width'],c['fallback']) for c in r['cases'] if c['id']==i}=={(320,False),(320,True),(1280,False),(1280,True)} for i in ids)
class GroupedVisibilityEvidence(unittest.TestCase):
    def test_real_matrix_and_protocol_identity(self):
        r=read('browser-raw.json');self.assertTrue(complete_matrix(r));self.assertEqual(hashlib.sha256((D/'browser-canary.mjs').read_bytes()).hexdigest(),r['protocolSha256']);self.assertFalse(r['scientificApproval'])
        for c in r['cases']:self.assertEqual(hashlib.sha256((D/c['screenshot']).read_bytes()).hexdigest(),c['screenshotSha256'])
    def test_partial_or_retagged_proof_is_not_complete(self):
        r=read('browser-raw.json');x=copy.deepcopy(r);x['cases']=[c for c in x['cases'] if c['id']!='SIM-C1-L007-01'];self.assertFalse(complete_matrix(x));x=copy.deepcopy(r);x['runtimeProfileAfter']='c177';self.assertFalse(complete_matrix(x))
    def test_original_grid_and_contact_census_is_bounded_and_real(self):
        r=read('geometry-raw.json');self.assertEqual(r['runtimeBefore'],FP);self.assertEqual(r['runtimeAfter'],FP);self.assertEqual(len(r['frames']),1245);self.assertEqual(len(r['summary']),26);self.assertEqual(hashlib.sha256((D/'census.mjs').read_bytes()).hexdigest(),r['protocolSha256'])
        for f in r['frames']:
            for a in f['arrows']:
                if a['tipBlocker']:self.assertEqual(a['tipBlocker']['kind'],'other-arrow')
    def test_caduta_and_force_box_negative_cases_are_now_clear_of_opaque_meshes(self):
        r=read('geometry-raw.json')
        for f in r['frames']:
            if f['id'] in ('SIM-C1-L004-02','SIM-C1-L008-03','SIM-C1-L006-01','SIM-C1-L006-02'):
                for a in f['arrows']:self.assertIsNone(a['tipBlocker']);self.assertEqual(a['headVerticesBlocked'],0)
    def test_live_narrow_label_failure_is_retained_not_counted_as_pass(self):
        r=read('label-projection.json');c=next(c for c in r['candidates'] if c['id']=='SIM-C1-L007-01' and c['input']==0 and c['width']==320);green=next(a for a in c['arrows'] if a['color']==0x147979);self.assertTrue(any(b['text']=='a' and b['left']<green['tip']['x']<b['right'] and b['top']<green['tip']['y']<b['bottom'] for b in green['coveringLabelBoxes']));self.assertFalse(r['scientificApproval']);self.assertTrue((D/c['screenshot']).is_file())
    def test_complete_glyph_viewports_and_accessible_legends(self):
        r=read('viewport.json');self.assertEqual(r['nativeCases'],176);self.assertTrue(r['allCompleteGlyphMeshesInsideViewport']);self.assertEqual(r['outsideCases'],[])
        for c in read('browser-raw.json')['cases']:self.assertTrue(c['legendLayout']['visible']);self.assertLessEqual(c['legendLayout']['scrollWidth'],c['legendLayout']['width']+1)
if __name__=='__main__': unittest.main()
