"""Accessible physical descriptions remain guarded after every edition pin is replaced."""
import ast,base64,importlib,json,os,tempfile,unittest
from copy import deepcopy
from pathlib import Path
from unittest.mock import patch
import xml.etree.ElementTree as ET
from tools.corpus_engineering.pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
CANDIDATE=Path(os.environ.get('CRIC_REVIEW_CANDIDATE_APP',str(APP)))
HOME=APP/'editorial/reviews/cric-c2-accessible-description-guard-followup-20261126'
class AccessibleSvgPhysicalReview(unittest.TestCase):
 def hostile(self,n,tag):
  batch=f'cric-c2-l{n:03}';m=importlib.import_module('tools.corpus_engineering.'+batch.replace('-','_')+'_verifier');p=json.loads((CANDIDATE/f'editorial/batches/{batch}.json').read_bytes());b=json.loads((CANDIDATE/f'editorial/batches/{batch}-bindings.json').read_bytes());p,b=deepcopy(p),deepcopy(b);asset=next(x for x in p['assets'] if x['name']==m.ASSET_NAME);raw=base64.b64decode(asset['data']);root=ET.fromstring(raw);element=next(e for e in root.iter() if e.tag.rsplit('}',1)[-1]==tag);before=element.text;self.assertTrue(before);after=before+' Pressione fisica erronea: 999 Pa.';self.assertEqual(raw.count(before.encode()),1);raw=raw.replace(before.encode(),after.encode(),1);previous=asset['id'];asset.update(id=sha(raw),data=base64.b64encode(raw).decode())
  for row,link in zip(p['records'],b):
   for block in row['blocks']:
    if block.get('src')=='/asset/'+previous:block['src']='/asset/'+asset['id']
   if m.ASSET_NAME in link.get('assetChecksums',{}):link['assetChecksums'][m.ASSET_NAME]=asset['id']
   link['candidateSha256']=digest(row)
  with tempfile.TemporaryDirectory() as directory:
   home=Path(directory)
   for x in p['assets']:(home/x['name']).write_bytes(base64.b64decode(x['data']))
   tokens={r['id']:token for r,link,token,assets,errors in m.reviewed_rows(p,b,{},m.EXPECTED_IDS,home)}
   with patch.dict(m.REVIEWED_CANDIDATES,tokens),patch.multiple(m,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b)):
    with self.assertRaisesRegex(ValueError,'accessible title/desc'):m.verify(p,b,home)
 def test_all_five_titles_with_new_hashes_bindings_tokens_and_pins(self):
  for n in range(1,6):
   with self.subTest(batch=n):self.hostile(n,'title')
 def test_all_five_descriptions_with_new_hashes_bindings_tokens_and_pins(self):
  for n in range(1,6):
   with self.subTest(batch=n):self.hostile(n,'desc')
 def test_genuine_red_and_prior_scientific_rows_are_preserved(self):
  receipt=json.loads((HOME/'red-description-accepted.json').read_bytes());self.assertEqual(receipt['exitCode'],1);self.assertIsNone(receipt['signal']);self.assertIn('Wrong quantitative label accepted after hostile rebinding',(HOME/'red-description-accepted.log').read_text())
  prior=HOME/'prior-scientific-editions';manifest=json.loads((prior/'manifest.json').read_bytes())
  files=manifest.get('files',manifest)
  for path,expected in files.items():
   if isinstance(expected,str) and len(expected)==64:self.assertEqual(sha((prior/path).read_bytes()),expected)
  for n in (1,3):
   batch=f'cric-c2-l{n:03}';old=next(prior.rglob(batch+'.json'));new=APP/f'editorial/reviews/{batch}.json';self.assertEqual(json.loads(old.read_bytes())['records'],json.loads(new.read_bytes())['records']);oldmodule=next(prior.rglob(batch.replace('-','_')+'_verifier.py'));newmodule=APP/f'tools/corpus_engineering/{oldmodule.name}'
   def funcs(path):return {x.name:ast.dump(x,include_attributes=False) for x in ast.parse(path.read_text()).body if isinstance(x,ast.FunctionDef)}
   before,after=funcs(oldmodule),funcs(newmodule);self.assertEqual(set(before),set(after));self.assertEqual([k for k in before if before[k]!=after[k]],['asset_geometry'])
if __name__=='__main__':unittest.main()
