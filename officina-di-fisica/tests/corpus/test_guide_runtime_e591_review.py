"""Frozen proposed-epoch code probe; six negative transitions block acceptance."""
from pathlib import Path
import json,unittest
BASE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-guide-runtime-e591-20261126'
class GuideEpochReview(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.p=json.loads((BASE/'code-probe.json').read_bytes())
 def test_direct_producer_24_guides_and_16_actual_number_entries(self):
  self.assertEqual(len(self.p['records']),8);self.assertEqual(self.p['gradedManualInputsAccepted'],16)
  for r in self.p['records']:
   self.assertTrue(r['assessmentUnchanged']);self.assertEqual(len(r['assessments']),2)
   self.assertTrue(all(s['steps'][2][0]=='Controlla il calcolo'for s in r['samples'][:2]))
   self.assertEqual(r['samples'][2]['steps'][2][0],'Osserva la lettura del modello')
 def test_six_genuine_code_path_transitions_remain_negative_not_ui_passes(self):
  t=self.p['transitions'];self.assertEqual(len(t),6);self.assertEqual(self.p['openTimelineTransitions'],6)
  self.assertEqual({r['id']for r in t},{'SIM-C5-L01-01','SIM-C5-L02-03','SIM-C5-L08-02'})
  for r in t:
   self.assertTrue(r['staleTitleOrInstruction']);self.assertEqual(r['trace']['after']['equation'],r['trace']['expected'][2])
   self.assertNotEqual(r['trace']['after']['title'],r['trace']['expected'][0])
 def test_139_originals_2144_states_unchanged_is_regression_only(self):
  self.assertEqual(self.p['originalSourcesCompared'],139);self.assertEqual(self.p['originalGridStatesCompared'],2144);self.assertTrue(self.p['physicsEquivalent'])
  self.assertEqual(self.p['newPasses'],0);self.assertEqual(self.p['newProductUiCases'],0);self.assertEqual(self.p['activityCredit'],0)
 def test_decimal_ulp_matching_does_not_snap_measure_or_nearby_distinct_input(self):
  samples=self.p['decimalSamples'];self.assertEqual([x['step'][0]=='Controlla il calcolo'for x in samples],[True,True,False,False])
  q=self.p['nearQuadrant'];self.assertNotEqual(q['solve']['y'],0);self.assertTrue(q['measureUnchanged']);self.assertEqual(q['guide'][0],'Osserva la lettura del modello')
 def test_pilot_reference_scope_explicit_no_fictional_ui(self):
  p=self.p['pilotReference'];self.assertEqual(p['pilot'],'induzione');self.assertTrue(p['referenceUsesOriginalActivityModel']);self.assertTrue(p['drawUsesReasoningOverride'])
  self.assertEqual(self.p['humanApproval'],'NOT_RUN');self.assertEqual(self.p['publicationAction'],'NONE')
if __name__=='__main__':unittest.main()
