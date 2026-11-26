"""Author technical regression for one recorded partial-shaft mask, not SCI approval."""
from pathlib import Path
import unittest,subprocess,json,sys,tempfile,hashlib
APP=Path(__file__).resolve().parents[1];B=APP/'editorial/author-notes/work-axis-label-correction-20261126'
class WorkAxisVisibility(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  p=subprocess.run(['node',str(B/'collect-installed.mjs'),str(APP)],capture_output=True,text=True,timeout=60);assert p.returncode==0,p.stderr;cls.after=json.loads(p.stdout)
  # Execute the immutable pre-patch caller with the SAME installed Node/model
  # environment, avoiding cross-version Math.cos/Intl snapshot comparisons.
  old=B/'before-esperimento.js';assert hashlib.sha256(old.read_bytes()).hexdigest()=='7a856fda0835d736b46c631e05652e6b2e27f3758abd94d7026158e56b019843'
  with tempfile.TemporaryDirectory(prefix='cric-work-axis-before-')as temp:
   root=Path(temp);(root/'package.json').write_text('{"type":"module"}');folder=root/'banchi';voci=folder/'voci';voci.mkdir(parents=True)
   for path in (APP/'static/js/banchi').iterdir():
    if path.name!='voci':(folder/path.name).symlink_to(path,target_is_directory=path.is_dir())
   for path in (APP/'static/js/banchi/voci').iterdir():
    if path.name!='esperimento.js':(voci/path.name).symlink_to(path,target_is_directory=path.is_dir())
   (voci/'esperimento.js').write_bytes(old.read_bytes());p=subprocess.run(['node',str(B/'collect-installed.mjs'),str(APP),str(voci/'esperimento.js')],capture_output=True,text=True,timeout=60);assert p.returncode==0,p.stderr;cls.before=json.loads(p.stdout)
 def test_y_sprite_does_not_cover_the_work_vector_tails(self):
  for row in self.after['target']:
   with self.subTest(x=row['x'],stage=row['stage']):self.assertFalse(any(e['kind']=='label'and e['text']=='y'for e in row['elements']))
 def test_axis_identity_remains_explicit_in_the_html_legend(self):
  text=next(r['legend']for r in self.after['cases']if r['id']=='SIM-C1-L007-01');self.assertIn('asse y',text);self.assertIn('retta grigia',text);self.assertIn('perpendicolare',text);self.assertIn('Alto',text)
 def test_all_other_180_records_and_all_physical_quantities_remain_exact(self):
  self.assertEqual(self.after['records'],181);self.assertEqual(self.after['gridInputs'],self.before['gridInputs']);self.assertEqual(self.after['states'],self.before['states'])
  for before,after in zip(self.before['cases'],self.after['cases']):
   with self.subTest(id=before['id']):
    self.assertEqual(before['id'],after['id']);self.assertEqual(before['sourceSha256'],after['sourceSha256']);self.assertEqual(before['teaching'],after['teaching']);self.assertEqual(before['scene'],after['scene'])
    if before['id']!='SIM-C1-L007-01':self.assertEqual(before,after)
    else:
     for b,a in zip(before['states'],after['states']):self.assertEqual({k:v for k,v in b.items()if k!='primitives'},{k:v for k,v in a.items()if k!='primitives'})
 def test_only_one_y_label_is_removed_and_no_geometry_is_rewritten(self):
  for b,a in zip(self.before['target'],self.after['target']):
   with self.subTest(x=b['x'],stage=b['stage']):
    removed=[e for e in b['elements']if e['kind']=='label'and e['text']=='y'];self.assertEqual(len(removed),1);self.assertEqual(a['elements'],[e for e in b['elements']if e not in removed]);self.assertEqual(a['model'],b['model']);self.assertEqual(a['measurement'],b['measurement'])
if __name__=='__main__':unittest.main()
