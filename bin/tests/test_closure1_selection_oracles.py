"""Independent numeric laws must catch a corrupted key and option, not roundtrip it."""
import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
PATH=ROOT/'bin/content/physics_bank/verify_fluid_thermal_selection.py'

class SelectionOraclesTest(unittest.TestCase):
    def setUp(self):
        self.assertTrue(PATH.is_file(),'independent verifier missing')
        spec=importlib.util.spec_from_file_location('selection_oracles',PATH)
        self.module=importlib.util.module_from_spec(spec);spec.loader.exec_module(self.module)

    def test_physical_unit_conversions_and_state_relations(self):
        law=self.module.PHYSICS
        self.assertAlmostEqual(law['U3-stevino-gauge'](0.8,0.5),4)
        self.assertAlmostEqual(law['U3-soap-film-force'](40,5),4)
        self.assertAlmostEqual(law['U5-emitted-blackbody-power'](3,2),97.2)
        self.assertAlmostEqual(law['U5-entropy-hot-cold'](300,600),1)
        self.assertAlmostEqual(law['U5-two-body-calorimetry'](1,3),35)

    def test_wrong_stored_answer_and_option_are_rejected(self):
        from copy import deepcopy
        q,model=self.module.load_case('u3-pressure-area-01')
        self.assertFalse(self.module.check_question(q,model))
        bad=deepcopy(q);bad['answer']['exact']='8'
        self.assertTrue(self.module.check_question(bad,model))
        bad=deepcopy(q);bad['prompt']=bad['prompt'].replace('F = 12 N','F = 24 N')
        self.assertTrue(self.module.check_question(bad,model))
        q,model=self.module.load_case('u3-identical-branches-01')
        bad=deepcopy(q)
        count=q['verification']['automaticChecks'][0]['values']['x']
        bad['prompt']=bad['prompt'].replace('N = '+count,'N = '+count+'0')
        self.assertTrue(self.module.check_question(bad,model))
        q,model=self.module.load_case('u3-pressure-area-09')
        self.assertFalse(self.module.check_question(q,model))
        bad=deepcopy(q)
        correct=next(o for o in bad['options'] if o['id']==bad['answer']['correctOptionId'])
        correct['exact']='2*y*z'
        self.assertTrue(self.module.check_question(bad,model))

if __name__=='__main__':unittest.main()
