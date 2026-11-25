"""Same signed deltas cannot excuse hidden or overlaid force glyphs."""
import json,subprocess,unittest
from copy import deepcopy
from tools.corpus_engineering import experiments_force_work_corrected_048_verifier as f
from tools.corpus_engineering import experiments_energy_momentum_corrected_049_verifier as e
class CurrentVisibilityGuards(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        rows=json.loads(subprocess.check_output(['git','show',f.SOURCE_REF+':'+f.SOURCE_PATH],cwd=f.APP));cls.a=f.runtime_values({r['id']:r for r in rows if r['id'] in f.SPECS});cls.b=e.runtime_values({r['id']:r for r in rows if r['id'] in e.SPECS})
    def test_same_delta_pair_inside_box_is_rejected(self):
        key='SIM-C1-L006-01';a=deepcopy(self.a);case=next(c for c in a[key]['cases'] if c['x']==6)
        for ar in case['elements']:
            if ar['kind']=='arrow':ar['a'][2]=ar['b'][2]=0
        self.assertFalse(f.compare_runtime(a)[key]['ok'])
    def test_dynamic_label_covering_vector_tip_is_rejected(self):
        key='SIM-C1-L007-01';a=deepcopy(self.a);case=next(c for c in a[key]['cases'] if c['x']==0);ar=next(v for v in case['elements'] if v['kind']=='arrow');case['elements'].append({'kind':'label','p':[ar['b'][0],ar['b'][1]+.26,ar['b'][2]],'text':'a','c':ar['c']});self.assertFalse(f.compare_runtime(a)[key]['ok'])
    def test_same_delta_weight_in_table_is_rejected(self):
        key='SIM-C1-L008-03';a=deepcopy(self.b);case=next(c for c in a[key]['cases'] if c['x']==0);ar=next(v for v in case['elements'] if v['kind']=='arrow');ar['a']=[0,.3,.25];ar['b']=[0,-.12,.25];self.assertFalse(e.geometry(key,0,case['elements']))
    def test_fresh_reachable_geometry_matches_after_review(self):
        for module,actual in ((f,self.a),(e,self.b)):
            for key,row in module.compare_runtime(actual).items():self.assertTrue(row['ok'],(key,row['errors']))
if __name__=='__main__':unittest.main()
