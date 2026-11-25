"""Inventory does not double-count drafts, erase failures or invent actual UI."""
import copy,unittest
from unittest.mock import patch
from tools.corpus_engineering import partial_activity_inventory as v
class PartialActivityInventory(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.report=v.build();cls.sources=v.source_records()
 def test_exact_139_originals_and_278_tasks_no_inventory_credit(self):
  r=self.report;s=r['summary']
  self.assertEqual(s['records'],139);self.assertEqual(s['byCourse'],{'C2':41,'C3':36,'C4':29,'C5':27,'C6':6})
  self.assertEqual(s['actualAssignedNumericTasks'],278);self.assertEqual(s['installedLegalGridStates'],2144)
  self.assertEqual(s['clockObservationRecordsIncludingRepeatedStates'],2615)
  self.assertEqual(r['activityCredit'],0);self.assertFalse(r['registryModified']);self.assertFalse(r['overallAcceptanceGranted'])
 def test_actual_ui_history_distinct_from_not_run(self):
  s=self.report['summary'];self.assertEqual(len(s['uiObservedIds']),10);self.assertEqual(s['uiNotRunCount'],129)
  self.assertEqual(s['historical047BaseUiCases'],228);self.assertEqual(s['historical047TargetedSupplementCases'],8)
  old=[r for r in self.report['records'] if r['UI']!='NOT_RUN']
  self.assertEqual(sum(r['findingsAndLimits']['baseUiCaseCountForThisId']for r in old),228)
  self.assertEqual(s['historical047PositiveCountPreserved'],5)
 def test_original_stevino_failure_is_not_cleared_by_draft_math(self):
  self.assertEqual(self.report['summary']['sourceScientificFailureIds'],['SIM-C2-L002-01'])
  r=next(r for r in self.report['records']if r['id']=='SIM-C2-L002-01')
  self.assertTrue(r['sourceScientificFailure']);self.assertTrue(r['consumerObservedUiFailure'])
  self.assertEqual(self.report['candidateCorrectionNotDoubleCounted']['addsOriginals'],0)
 def test_manual_failures_support_gaps_and_addendum_remain_separate(self):
  s=self.report['summary'];self.assertEqual(len(s['sourceManualityFailureIds']),4);self.assertEqual(len(s['manualSupportGapIds']),8);self.assertEqual(len(s['supportGapOnlyIds']),4)
  r=next(r for r in self.report['records']if r['id']=='SIM-C3-L07-05')
  self.assertTrue(r['manualSupportGap']);self.assertFalse(r['sourceScientificFailure'])
  add=r['findingsAndLimits']['separateManualityAddendum'];self.assertFalse(add['sourceManualityReady']);self.assertTrue(add['originalFrozenReportUntouched'])
 def test_ui_failures_code_failures_never_conflated(self):
  s=self.report['summary'];self.assertEqual(len(s['consumerObservedUiFailureIds']),5);self.assertEqual(len(s['consumerCodeGeometryFailureIds']),12)
  self.assertFalse(set(s['consumerObservedUiFailureIds'])&set(s['consumerCodeGeometryFailureIds']))
  for r in self.report['records']:
   if r['consumerCodeGeometryFailure']:self.assertEqual(r['UI'],'NOT_RUN')
 def test_missing_duplicate_foreign_and_version_drift_rejected(self):
  for action in ['missing','duplicate','foreign','version']:
   rows=copy.deepcopy(self.report['records'])
   if action=='missing':rows.pop()
   elif action=='duplicate':rows[0]=rows[1]
   elif action=='foreign':rows[0]['id']='SIM-C1-L001-01'
   else:rows[0]['sourceVersion']+=1
   with self.assertRaises(ValueError):v.validate_identity(rows,self.sources)
 def test_no_human_or_publication_escalation_and_pinned_inputs(self):
  rows=copy.deepcopy(self.report['records']);rows[0]['activityCreditGrantedByInventory']=1
  with self.assertRaises(ValueError):v.validate_identity(rows,self.sources)
  with patch.dict(v.PINS,{'editorial/reviews/C6-6-code-partial-20261125/delivery.json':'0'*64}):
   with self.assertRaisesRegex(ValueError,'Frozen inventory input drift'):v.build()
if __name__=='__main__':unittest.main()
