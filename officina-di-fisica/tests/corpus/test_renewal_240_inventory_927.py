"""Coverage and recusal only: no activity acceptance from an inventory."""
from pathlib import Path
import unittest,json
APP=Path(__file__).resolve().parents[2]
class RenewalInventory(unittest.TestCase):
 def test_exact240_owned_and_six_authored_recused_without_double_counting(self):
  r=json.loads((APP/'editorial/reviews/renewal-240-927-inventory-20261126/plan.json').read_bytes());own=[key for g in r['groups']for key in g['ownActivityIds']];recused=[key for g in r['groups']for key in g['recusedActivityIds']];self.assertEqual(len(own),240);self.assertEqual(len(set(own)),240);self.assertEqual(len(set(recused)),6);self.assertFalse(set(own)&set(recused));self.assertEqual(sum(r['counts'].values()),246);self.assertEqual(r['counts'],{'readerAndCatalog':179,'guidedWorksheet':10,'dynamic':51,'recusedNativeVector':6});self.assertEqual(r['activityCredit'],0)
 def test_ten_interactive_worksheets_have_all49_independent_inputs_not_reader_credit(self):
  r=json.loads((APP/'editorial/reviews/renewal-method-worksheets-927-20261126/independent-input-blueprint.json').read_bytes());self.assertEqual(len(r['records']),10);self.assertEqual(sum(len(x['sourceSteps'])for x in r['records']),49);self.assertEqual(r['UI'],'NOT_RUN');self.assertEqual(r['activityCredit'],0);self.assertEqual(r['plannedCases'],20);self.assertEqual(r['plannedWidths'],[320,1280])
if __name__=='__main__':unittest.main()
