"""Reporting precision may never decide whether a physical glyph is clear."""
import unittest
from tools.corpus_engineering.experiments_forces_revision_verifier import plane_support_clearance_observation as observe


class GeometryObservationSerialization(unittest.TestCase):
    def test_actual_cross_platform_witnesses_serialize_identically(self):
        for a,b in [(0.5470168936457429,0.547016893645743),(0.47,0.4700000000000003)]:
            self.assertEqual(observe('normal',a,.043),observe('normal',b,.043))
            self.assertTrue(observe('normal',a,.043)['ok'])

    def test_rounding_never_promotes_an_obscured_or_touching_glyph(self):
        radius=.043
        below=observe('weight',radius-1e-14,radius)
        touching=observe('weight',radius,radius)
        above=observe('weight',radius+1e-14,radius)
        self.assertEqual(below['minimumPlaneClearance'],above['minimumPlaneClearance'])
        self.assertFalse(below['ok']);self.assertFalse(touching['ok']);self.assertTrue(above['ok'])
        self.assertTrue(above['decisionUsesUnroundedClearance'])

    def test_semantic_change_and_body_radius_remain_visible(self):
        self.assertNotEqual(observe('normal',.5,.043),observe('normal',.500001,.043))
        self.assertFalse(observe('normal',.5,.6)['ok'])
        self.assertTrue(observe('normal',.5,.043)['ok'])
