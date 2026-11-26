"""Actual diagnostic completeness/default-deny; never accepts known overflow."""
from pathlib import Path
import unittest,json,zipfile,hashlib
APP=Path(__file__).resolve().parents[2];B=APP/'editorial/reviews/renewal-method-worksheets-927-20261126'
def load(p):return json.loads(p.read_bytes())
class WorksheetDiagnostic(unittest.TestCase):
 def test_all98_real_steps_and196_feedbacks_completed_without_hiding_eight_failures(self):
  r=load(B/'actual-overflow-retained-20/report.json');self.assertEqual(r['status'],'FAIL');self.assertEqual(r['completeSequences'],20);self.assertEqual(len(r['records']),20);self.assertEqual(r['runtimeFingerprint'],r['finalRuntimeFingerprint']);self.assertEqual(sum(len(x['steps'])for x in r['records']),98);self.assertEqual(sum(not x['technicalOk']for x in r['records']),8)
  blueprint={x['id']:x for x in load(B/'independent-input-blueprint.json')['records']}
  for c in r['records']:
   self.assertTrue(c['sequenceComplete']);self.assertTrue(c['switchSheetProgressPreserved']);self.assertTrue(c['resetToFirstStep']);self.assertEqual(c['activityCredit'],0)
   for actual,want in zip(c['steps'],blueprint[c['id']]['sourceSteps']):self.assertEqual(actual['independentInput'],want['independentInput']);self.assertTrue(actual['rejected'].startswith('Riprova. '));self.assertTrue(actual['accepted'].startswith('Corretto. '));self.assertEqual(actual['activeAxe'],[])
 def test_known_eight_narrow_layout_errors_remain_failed_in_same_historical_states(self):
  r=load(B/'paired-layout-summary.json');self.assertEqual(r['actualTerminalExitCode'],0);self.assertEqual(len(r['pairs']),8)
  widths={'C1':332,'C3':354,'C4':343,'C5':346}
  for pair in r['pairs']:self.assertEqual(pair['width'],320);self.assertEqual(pair['currentScrollWidth'],widths[pair['id'][:2]]);self.assertEqual(pair['historicalScrollWidth'],pair['currentScrollWidth']);self.assertEqual(pair['workshopRightCurrent'],308);self.assertEqual(pair['workshopRightHistorical'],308)
  self.assertEqual(load(B/'actual-overflow-retained-20/terminal-receipt.json')['observedExitCode'],1)
 def test_harness_error_and_product_error_are_separate_exact_archives(self):
  for name in ['negative-fieldset-20','negative-overflow-20']:
   side=load(B/(name+'.json'));p=B/(name+'.zip');self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),side['zipSha256'])
   with zipfile.ZipFile(p)as z:
    self.assertEqual(set(z.namelist()),set(side['files']))
    for file,pin in side['files'].items():self.assertEqual(hashlib.sha256(z.read(file)).hexdigest(),pin['sha256'])
  self.assertEqual(load(B/'negative-fieldset-20.json')['completedSequences'],0);self.assertEqual(load(B/'negative-overflow-20.json')['completedSequences'],12)
 def test_source_math_remains_distinct_from_unaccepted_consumer(self):
  r=load(B/'fresh-source-math16.json');self.assertEqual(len(r['records']),16);self.assertTrue(all(x['ok']for x in r['records']));self.assertEqual(r['activityCredit'],0)
if __name__=='__main__':unittest.main()
