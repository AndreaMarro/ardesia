"""Exact partial inventory/dependencies; no UI or activity approval from math."""
from pathlib import Path
import json,hashlib,unittest
APP=Path(__file__).resolve().parents[2];B=APP/'editorial/reviews/renewal-readers-179-927-20261126'
def load(p):return json.loads(p.read_bytes())
class ReaderMathPartial(unittest.TestCase):
 def test_exact179_no_duplicates_and_all_consumer_ui_uncredited(self):
  blueprint=load(B/'reader-blueprint.json');self.assertEqual(blueprint['counts'],{'total':179,'catalogs':6,'materialReaders':173,'draftReaders':14,'originalReadersAndCatalogs':165});want={x['id']for x in blueprint['records']};records=[]
  for p in B.glob('*-math-only.json'):
   r=load(p);records+=r['selectedReaderRecords'];self.assertEqual(r['consumerUI'],'NOT_RUN_ON_FINAL_EPOCH');self.assertEqual(r['activityCredit'],0)
   for row in r['selectedReaderRecords']:self.assertTrue(row['ok']);self.assertEqual(row['activityCredit'],0);self.assertEqual(row['consumerUI'],'NOT_RUN_ON_FINAL_EPOCH');self.assertEqual(row['mathReviewDependencySha256'],r['reviewDependencySha256'])
  self.assertEqual(len(records),179);self.assertEqual({r['id']for r in records},want);self.assertEqual(len(want),179)
 def test_each_math_dependency_is_byte_bound_not_just_top_level_verifier(self):
  for p in B.glob('*-math-only.json'):
   r=load(p)
   for name,sha in r['dependencies'].items():self.assertEqual(hashlib.sha256((APP/name).read_bytes()).hexdigest(),sha)
 def test_fourteen_failed_originals_are_retained_beside_unchanged_drafts(self):
  records=[r for p in B.glob('*-math-only.json')for r in load(p)['selectedReaderRecords']];revised=[r for r in records if r.get('failedPublishedEdition')];self.assertEqual(len(revised),14)
  for r in revised:self.assertFalse(r['publishedEditionReview']['ok']);self.assertTrue(r['originalEditionRetained']);self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['publicationAction'],'DRAFT')
if __name__=='__main__':unittest.main()
