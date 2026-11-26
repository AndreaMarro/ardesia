"""Selective independent re-reading keeps fifteen prior pins and all pre-key laws."""
import ast,json,os,unittest
from pathlib import Path
from unittest.mock import patch
from tools.corpus_engineering import wavelength_in_medium_verifier as m
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
HOME=APP/'editorial/reviews/wavelength-in-medium-240-feedback15-independent-reread-20261126'
class WavelengthFeedbackReread(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.p=json.loads((CANDIDATE/'editorial/batches/wavelength-in-medium-240.json').read_bytes());cls.b=json.loads((CANDIDATE/'editorial/batches/wavelength-in-medium-240-bindings.json').read_bytes());cls.oldp=json.loads((HOME/'old-wavelength-in-medium-240.json').read_bytes());cls.oldb=json.loads((HOME/'old-wavelength-in-medium-240-bindings.json').read_bytes())
 def test_exactly_one_candidate_and_token_changed_no_math_AST_changed(self):
  changed=[i for i,(a,b) in enumerate(zip(self.oldp['records'],self.p['records'])) if a!=b];self.assertEqual(changed,[14]);a=json.loads(json.dumps(self.oldp['records'][14]));a['blocks'][-1]['text']=self.p['records'][14]['blocks'][-1]['text'];a['error']['message']=self.p['records'][14]['error']['message'];self.assertEqual(a,self.p['records'][14]);self.assertEqual(self.oldp['assets'],self.p['assets'])
  old=ast.parse((HOME/'prior-scientific-edition/wavelength_in_medium_verifier.py').read_text());new=ast.parse(Path(m.__file__).read_text());functions=lambda t:{n.name:ast.dump(n,include_attributes=False) for n in t.body if isinstance(n,ast.FunctionDef)};self.assertEqual(functions(old),functions(new));tokens=ast.literal_eval(next(n.value for n in old.body if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name) and n.targets[0].id=='REVIEWED_CANDIDATES'));self.assertEqual([key for key in tokens if tokens[key]!=m.REVIEWED_CANDIDATES[key]],['AR-u7-wavelength-in-medium-15'])
 def test_fresh_saved_identity_and_independent_calibration_counterexamples(self):
  fresh=m.report(self.p,self.b,CANDIDATE/'editorial/assets');saved=json.loads((APP/'editorial/reviews/wavelength-in-medium-240.json').read_bytes());self.assertEqual(fresh,saved)
  for report in (fresh,saved):assert_record_identity(report['records'],m.EXPECTED_IDS,self.p,self.b);self.assertTrue(all(r['ok'] for r in report['records']))
  self.assertEqual(m.oracle()[14],800)
  for vacuum,wanted in [(801,802),(1600,1601),(400,401),(800,801)]:self.assertEqual(2*m.result(vacuum,2)+1,wanted)
  self.assertEqual(sha((APP/'editorial/reviews/u7-radiation-240-244-independent-models.py').read_bytes()),m.INDEPENDENT_MODELS_IMPLEMENTATION_SHA256);self.assertEqual(sha((APP/'editorial/reviews/u7-radiation-240-244-primary-source-only.md').read_bytes()),m.PRIMARY_SHA256)
 def test_prior_feedback_is_rejected_by_new_signature_even_if_edition_pins_rebound(self):
  with patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(self.oldp),REVIEWED_BINDINGS_SHA256=digest(self.oldb)):
   rows=m.verify(self.oldp,self.oldb,CANDIDATE/'editorial/assets');self.assertEqual([r['id'] for r in rows if not r['ok']],['AR-u7-wavelength-in-medium-15']);self.assertIn('Independent reviewed signature mismatch',rows[14]['errors'])
if __name__=='__main__':unittest.main()
