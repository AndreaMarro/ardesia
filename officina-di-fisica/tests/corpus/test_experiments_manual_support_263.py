"""Independent manual DRAFT review is not activity approval; real guard mutations."""
from copy import deepcopy
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import json,shutil,unittest
from tools.corpus_engineering import experiments_manual_support_revision_verifier as v

class ManualSupport263(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.fixture=v.APP/v.REVIEW_DIR/'final-input-snapshot'
  cls.asset_root=cls.fixture/'editorial/assets'
  cls.package=json.loads((cls.fixture/'editorial/batches'/f'{v.BATCH}.json').read_bytes())
  cls.bindings=json.loads((cls.fixture/'editorial/batches'/f'{v.BATCH}-bindings.json').read_bytes())
  cls.sources=v.source_records();cls.records=v.verify(cls.sources,cls.package,cls.bindings,cls.asset_root)
 def changed(self,index):return deepcopy(self.package),deepcopy(self.bindings)
 def retoken(self,p,b,index):
  row=p['records'][index];binding=next(x for x in b if x['id']==row['id']);binding['candidateSha256']=v.digest(row)
  assets={n:v.sha((self.asset_root/n).read_bytes())for n in binding['assetChecksums']}
  sig=v.digest({'record':row,'assets':assets,'source':{'id':binding['sourceId'],'ref':binding['sourceRef'],'sha256':binding['sourceSha256']}})
  return {**v.REVIEWED_REVISIONS,row['id']:sig}
 def test_eight_manual_passes_zero_activity_credit_and_original_failures_retained(self):
  self.assertEqual(len(self.records),8)
  self.assertTrue(all(r['candidateTextMathManualReview']['ok']for r in self.records))
  self.assertTrue(all(not r['ok'] and r['activityCredit']==0 and r['newProductUiReview']=='NOT_RUN' and r['humanApproval']=='NOT_RUN'for r in self.records))
  for key in ['SIM-C4-L09-02','SIM-C5-L09-02']:
   r=next(r for r in self.records if r['id']==key);self.assertTrue(r['originalPublishedEditionJudgmentPreserved']['consumerCodeGeometryFailure']);self.assertTrue(r['originalPublishedEditionJudgmentPreserved']['sourceManualityFailure'])
 def test_sixteen_actual_questions_and_numeric_format_roundtrip(self):
  q=[q for r in self.records for q in r['actualGeneratedQuestionReview']['questions']]
  self.assertEqual(len(q),16);self.assertTrue(all(x['finiteManualEntryAccepted'] and x['displayNumberRoundtripAccepted']for x in q))
  self.assertFalse(any(r['actualGeneratedQuestionReview']['unitsDuplicatedInPrompt']for r in self.records))
 def test_complete_unique_ids_and_bindings_are_required(self):
  for kind in ('missing','duplicate','binding'):
   p,b=self.changed(0)
   if kind=='missing':p['records'].pop()
   elif kind=='duplicate':p['records'][0]=p['records'][1]
   else:b.pop()
   with self.assertRaises(ValueError):v.verify(self.sources,p,b,self.asset_root)
 def test_eight_wrong_claims_fail_independent_math_even_with_fixture_retoken(self):
  prefixes={'SIM-C3-L07-05':'p=100','SIM-C4-L09-02':'F(30','SIM-C5-L01-01':'x(0','SIM-C5-L02-03':'y(0,1/4)','SIM-C5-L03-02':r'A_{\rm risultante}(1/2)','SIM-C5-L08-02':r'\overline N(2T'}
  for i,original in enumerate(self.package['records']):
   with self.subTest(id=original['id']):
    p,b=self.changed(i);row=p['records'][i];key=row['id']
    if key=='SIM-C5-L09-02':next(x for x in row['blocks']if 'sin19,45' in x.get('text',''))['text']=next(x['text']for x in row['blocks']if 'sin19,45'in x.get('text','')).replace('3331/10000','9999/10000')
    elif key=='SIM-C5-L07-02':next(x for x in row['blocks']if x['type']=='formula' and x['text'].startswith('100'))['text']='100'+r'\cdot\frac14=25\%'
    else:next(x for x in row['blocks']if x['type']=='formula' and x['text'].startswith(prefixes[key]))['text']+='=999'
    # This is a private test bypass of the signature boundary only, never a saved approval.
    with patch.object(v,'REVIEWED_REVISIONS',self.retoken(p,b,i)):
     result=v.verify(self.sources,p,b,self.asset_root);bad=next(x for x in result if x['id']==key)
     self.assertIn('Independent candidate mathematics/manual support failed',bad['candidateTextMathManualReview']['errors'])
 def test_provenance_and_immutable_model_rebinding_rejected(self):
  for field,value in [('sourceRef','0'*40),('sourceSha256','0'*64),('sourceId','SIM-C1-L001-01')]:
   p,b=self.changed(0);b[0][field]=value
   with patch.object(v,'REVIEWED_REVISIONS',self.retoken(p,b,0)):
    r=v.verify(self.sources,p,b,self.asset_root)[0];self.assertFalse(r['candidateTextMathManualReview']['ok'])
  p,b=self.changed(0);p['records'][0]['control']['max']=5
  with patch.object(v,'REVIEWED_REVISIONS',self.retoken(p,b,0)):
   self.assertIn('Immutable original physics/control/reference changed',v.verify(self.sources,p,b,self.asset_root)[0]['candidateTextMathManualReview']['errors'])
 def test_actual_duplicate_prompt_unit_rejected_after_fixture_retoken(self):
  p,b=self.changed(1);p['records'][1]['transferPrompt']=p['records'][1]['transferPrompt'].replace('{x}','{x}°')
  with patch.object(v,'REVIEWED_REVISIONS',self.retoken(p,b,1)):
   r=next(x for x in v.verify(self.sources,p,b,self.asset_root)if x['id']=='SIM-C4-L09-02')
   self.assertIn('Duplicated input unit in delivered transfer prompt',r['candidateTextMathManualReview']['errors'])
 def test_literal_precision_and_nonfinite_rejection(self):
  self.assertNotEqual(v.literal('2.0000000000000000001'),2)
  for token in ('I','oo','nan','Infinity','1/0'):self.assertIsNone(v.literal(token))
 def test_geometry_mutations_preserve_labels_but_fail_physical_checks(self):
  changes=[('adiabatic-manual-paths.svg','width="202.5"','width="200"','SIM-C3-L07-05'),('beer-manual-successive-halves.svg','height="37.5"','height="40"','SIM-C5-L07-02'),('snell-manual-bounded-angles.svg','369.783,248.782','500,248.782','SIM-C5-L09-02')]
  for name,before,after,key in changes:
   with TemporaryDirectory()as folder:
    root=Path(folder)
    for spec in v.SPECS.values():shutil.copyfile(self.asset_root/spec[3],root/spec[3])
    f=root/name;text=f.read_text();self.assertIn(before,text);f.write_text(text.replace(before,after,1))
    self.assertTrue(any(not x['ok']for x in v.figure_checks(root)[key]))
 def test_every_record_binds_verifier_and_primary_and_native_dependencies(self):
  for r in self.records:
   d=r['reviewDependencySha256'];self.assertEqual(d['tools/corpus_engineering/experiments_manual_support_revision_verifier.py'],v.sha(Path(v.__file__).read_bytes()))
   self.assertEqual(d[v.PRIMARY_DIR+'/exact-primary.json'],v.PRIMARY_SHA)
   self.assertEqual(d[v.REVIEW_DIR+'/native-render.json'],v.READ_NATIVE_RENDER_SHA)
if __name__=='__main__':unittest.main()
