from pathlib import Path
import unittest,json,tempfile,shutil
from tools.corpus_engineering import methods_renewal_cb9_verifier as m
APP=Path(__file__).resolve().parents[2]
class CurrentMethods(unittest.TestCase):
 def test_sixteen_fresh_source_and_actual_current_ui_not_global_credit(self):
  r=json.loads((m.WORKSHEETS/'methods-sixteen-current.json').read_bytes());self.assertEqual({x['id']for x in r['records']},m.IDS);self.assertEqual(r['acceptedIndividualCount'],16);self.assertEqual(r['runtimeSha256'],m.RUNTIME)
  for x in r['records']:self.assertTrue(x['ok']);self.assertEqual(x['activityCredit'],0);self.assertEqual(x['humanApproval'],'NOT_RUN');self.assertEqual(x['registryOrLedgerAction'],'NONE')
 def test_twelve_author_catalog_cases_and_twenty_new_independent_sequences(self):
  cat,sheet=m.evidence();self.assertEqual(len(cat['records']),12);self.assertEqual(len(sheet['records']),20);self.assertEqual(sum(len(x['steps'])for x in sheet['records']),98);self.assertTrue(all(x['switchSheetProgressPreserved']and x['resetToFirstStep']for x in sheet['records']))
 def test_author_image_tampering_rejected_without_inventing_own_terminal_receipts(self):
  with tempfile.TemporaryDirectory(prefix='cric-catalog-cb9-tamper-')as temp:
   b=Path(temp);src=m.AUTHOR;dest=b/'verified-author-source';dest.mkdir();shutil.copy2(m.BASE/'author-input-adoption.json',b/'author-input-adoption.json');shutil.copy2(src/'full-reader-cb9-author-handoff.json',dest/'full-reader-cb9-author-handoff.json');shutil.copytree(src/'fixture-cb9',dest/'fixture-cb9');(dest/'full-reader-replay-cb9').mkdir();shutil.copytree(src/'full-reader-replay-cb9/catalogs',dest/'full-reader-replay-cb9/catalogs')
   for n in ['cohort-results.json','catalogs-process.txt']:shutil.copy2(src/'full-reader-replay-cb9'/n,dest/'full-reader-replay-cb9'/n)
   self.assertEqual(len(m.author_cohort('catalogs',b)[0]['records']),12)
   p=next((dest/'full-reader-replay-cb9/catalogs').glob('*.png'));p.write_bytes(p.read_bytes()+b'tamper')
   with self.assertRaisesRegex(ValueError,'author file changed'):m.author_cohort('catalogs',b)
 def test_unknown_runtime_cannot_inherit_ui_pass(self):
  with tempfile.TemporaryDirectory(prefix='cric-unknown-epoch-')as temp,self.assertRaises(ValueError):m.report({},app=Path(temp))
if __name__=='__main__':unittest.main()
