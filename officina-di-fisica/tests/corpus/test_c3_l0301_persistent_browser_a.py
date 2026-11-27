import json,unittest
from tools.corpus_engineering import c3_draft_bounded_browser_review_a as v
B=v.APP/'editorial/reviews/c3-l0301-recovery-preflight-a-20261127';ID='SIM-C3-L03-01'
class PersistentOneId(unittest.TestCase):
 def test_fresh_saved(self):self.assertEqual(v.report(B,ID),json.loads((B/'independent-browser-review.json').read_bytes()))
 def test_real_48_profile_grid_and_answers(self):
  for width in (320,1280):
   rows=v.actual(B/str(width),ID);self.assertEqual(len(rows),24);self.assertEqual(sum('interaction'not in c for c in rows),4)
   self.assertEqual({c['profile']['view']for c in rows},{'orbit','side','top','fixed_projection'})
   for c in rows:
    if 'interaction'in c:self.assertEqual(c['model']['y'],50*c['sourceReplayedX'])
 def test_independent_capacity_total_not_specific(self):
  self.assertEqual(v.cpu.primary.law(ID,8),400);self.assertEqual(v.cpu.primary.law(ID,6),300)
if __name__=='__main__':unittest.main(verbosity=2)
