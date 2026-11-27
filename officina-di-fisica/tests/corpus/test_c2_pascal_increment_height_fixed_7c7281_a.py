import unittest,json,copy,math
import sympy as sp
from tools.corpus_engineering import c2_hydrostatic_draft_groups_7c7281_review_a as v
D=v.APP/'editorial/reviews/c2-pascal-increment-height-fixed-7c7281-independent-a-20261127'
class PascalFixed(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=v.actual(D);cls.p=json.loads((D/'prepared.json').read_bytes());cls.doc=json.loads((D/'visual-review-per-id.json').read_bytes())
 def test_fresh48_only_pascal(self):self.assertEqual(len(self.cases),48);self.assertEqual({c['id']for c in self.cases},{'SIM-C2-L003-01'});self.assertEqual(sum(len(c.get('questions',[]))for c in self.cases),16)
 def test_corrected_candidate_pin(self):self.assertEqual(self.p['records'][0]['candidateSha256'],'cdbc3d74e2f7c19a9aea2b87171936ad34b5715393d9b21001ede15dbe69b5de')
 def test_exact_record_diff_and_formula_preservation(self):
  old=v.APP/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/draft-l003-01/prepared.json';old=json.loads(old.read_bytes())['records'][0]['record'];new=self.p['records'][0]['record'];self.assertEqual({k for k in old if old[k]!=new[k]},{'blocks','interpretation'});self.assertEqual([i for i,(x,y)in enumerate(zip(old['blocks'],new['blocks'],strict=True))if x!=y],[0,5]);self.assertEqual([b for b in old['blocks']if b['type']=='formula'],[b for b in new['blocks']if b['type']=='formula'])
 def test_same_increment_at_different_heights_exact(self):
  P0,d,z1,z2=sp.symbols('P0 d z1 z2',real=True,finite=True);rho,g=sp.symbols('rho g',positive=True,finite=True);p1=P0+d-rho*g*z1;p2=P0+d-rho*g*z2
  self.assertEqual(sp.simplify((p1-p1.subs(d,0))-d),0);self.assertEqual(sp.simplify((p2-p2.subs(d,0))-d),0);self.assertEqual(sp.diff(p1-p2,d),0);self.assertEqual(sp.simplify(p1-p2-rho*g*(z2-z1)),0)
 def test_incremental_force_area_units(self):
  delta=sp.symbols('delta',nonnegative=True,finite=True);f1=1000*delta/sp.Integer(2000);f2=1000*delta/sp.Integer(500);self.assertEqual(sp.simplify(f2-4*f1),0);self.assertEqual(f2.subs(delta,6),12);self.assertEqual(f2.subs(delta,5),10);self.assertEqual(f2.subs(delta,0),0)
 def test_real_observe_phase_new_text(self):
  text=self.p['records'][0]['record']['interpretation'];self.assertNotIn('allo stesso livello',text)
  for c in self.cases:
   if'phases'in c:self.assertIn(text,c['phases'][0]);self.assertTrue(all(q['expectedAccepted']for q in c['questions']));self.assertEqual(len(c['reading']['formulas']),3)
 def test_manual_final_exact_pin_and_wording(self):
  raw=(D/'manual-final-71622.verbatim.md').read_bytes();self.assertEqual(v.sha(raw),'71622ee3ae11df3f55e2869fc23648fb8e77939ea2c78e8e21fd8552b718a5b5');text=raw.decode().split('## `SIM-C2-L003-01`')[1];self.assertIn('a parità di incremento di pressione',text);self.assertIn('incremento di forza quadruplica',text);self.assertNotIn('due facce alla stessa pressione',text)
 def test_eight_current_png_and_unchanged_drawing(self):
  row=self.doc['records'][0];self.assertEqual(len(row['readPngSha256']),8)
  for f in row['readFiles']:self.assertTrue(f['sameEpochNegativePixelsUnchanged']);self.assertEqual(v.sha((v.APP/f['path']).read_bytes()),f['sha256'])
  c=next(c for c in self.cases if c.get('sourceReplayedX')==10);faces=[e for e in c['elements']if e['kind']=='rod'and e.get('c')==0x726d81 and math.isclose(e['b'][1]-e['a'][1],.11,abs_tol=1e-12)];self.assertTrue(math.isclose(faces[0]['b'][1]-faces[1]['b'][1],.42,abs_tol=1e-12))
 def test_old_negative_not_retagged(self):
  old=v.APP/'editorial/reviews/c2-hydrostatic-six-remaining-7c7281-independent-a-20261127/groups/draft-l003-01/visual-review-per-id.json';self.assertEqual(json.loads(old.read_bytes())['records'][0]['visualReview'],'FAIL');self.assertEqual(self.doc['records'][0]['visualReview'],'PASS');self.assertEqual(self.doc['activityCredit'],0);self.assertEqual(self.doc['humanApproval'],'NOT_RUN')
if __name__=='__main__':unittest.main()
