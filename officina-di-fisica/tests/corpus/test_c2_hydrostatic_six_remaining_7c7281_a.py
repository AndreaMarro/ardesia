import unittest,json,math
from tools.corpus_engineering import c2_hydrostatic_draft_groups_7c7281_review_a as v
D=v.APP/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127'
class SixRemaining(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.plan=json.loads((D/'matrix-prepared.json').read_bytes());cls.cases={g['group']:v.actual(g['folder'])for g in cls.plan['groups']};cls.docs={g['group']:json.loads((v.APP/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups'/g['group']/'visual-review-per-id.json').read_bytes())for g in cls.plan['groups']}
 def test_six_actual_264(self):self.assertEqual(len(self.cases),6);self.assertEqual(sum(map(len,self.cases.values())),264)
 def test_actual96submissions_8expected_rejections(self):
  q=[q for cases in self.cases.values()for c in cases for q in c.get('questions',[])];self.assertEqual(len(q),96);self.assertEqual(sum(not q['expectedAccepted']for q in q),8)
 def test_original_contrast_scientific_failure_not_closed(self):
  for group in ['original-stevino-correct-physics-rejected','original-stevino-installed-grader-accepted']:
   row=self.docs[group]['records'][0];self.assertIn('FAIL_ORIGINAL',row['sourceScientificReview']);self.assertTrue(row['sourceConflictRetained']);self.assertEqual(row['reviewedVersion'],1)
 def test_original15_rejected_and14715_accepted(self):
  for group,value,accepted in [('original-stevino-correct-physics-rejected','15',False),('original-stevino-installed-grader-accepted','14.715',True)]:
   for c in self.cases[group]:
    if'questions'in c:self.assertEqual(c['questions'][1]['input'],value);self.assertEqual(c['questions'][1]['status'].startswith('Corretto. '),accepted)
 def test_pascal_text_graphic_failure_real(self):
  group='draft-l003-01';self.assertEqual(self.docs[group]['records'][0]['visualReview'],'FAIL');p=json.loads((D/'groups'/group/'prepared.json').read_bytes());self.assertIn('stessa quota',p['records'][0]['record']['blocks'][0]['text']);c=next(c for c in self.cases[group]if c.get('sourceReplayedX')==10);faces=[e for e in c['elements']if e['kind']=='rod'and e.get('c')==0x726d81 and math.isclose(e['b'][1]-e['a'][1],.11,abs_tol=1e-12)];self.assertEqual(len(faces),2);self.assertTrue(math.isclose(faces[0]['b'][1]-faces[1]['b'][1],.42,abs_tol=1e-12))
 def test_pascal_math_separate_from_text(self):
  for c in self.cases['draft-l003-01']:
   if'interaction'in c:self.assertEqual(c['model']['y'],2*c['model']['x'])
   else:self.assertTrue(all(q['expectedAccepted']for q in c['questions']))
 def test_each_group8profile_png_pins(self):
  for doc in self.docs.values():
   row=doc['records'][0];self.assertEqual(len(row['readPngSha256']),8);self.assertEqual(len({(r['profile']['width'],r['profile']['view'])for r in row['readFiles']}),8)
   for r in row['readFiles']:self.assertEqual(v.sha((v.APP/r['path']).read_bytes()),r['sha256'])
 def test_local_four_positive_one_negative_drafts(self):
  r=json.loads((D/'five-draft-editions-before-pascal-fix.json').read_bytes());self.assertEqual(len(r['records']),5);self.assertEqual(len(r['positiveDraftIds']),4);self.assertEqual(r['failedDraftIds'],['SIM-C2-L003-01'])
 def test_never_grants_credit(self):
  for doc in self.docs.values():self.assertEqual(doc['activityCredit'],0);self.assertEqual(doc['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main()
