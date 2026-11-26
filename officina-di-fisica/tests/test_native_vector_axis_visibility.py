"""Author regression for the six native vector records; never science approval."""
from pathlib import Path
import unittest,subprocess,json,tempfile,hashlib
APP=Path(__file__).resolve().parents[1];B=APP/'editorial/author-notes/native-vector-apparatus-correction-20261126';IDS={'SIM-C1-L001-06','SIM-C1-L002-01','SIM-C1-L002-02','SIM-C1-L002-03','SIM-C1-L002-04','SIM-C1-L007-01'}
class NativeVectorAxis(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  assert hashlib.sha256((B/'before-esperimento.js').read_bytes()).hexdigest()=='62f1169d8f83ed240546a847a994557c101fb87db1e7999f090d1d9aef719723'
  p=subprocess.run(['node',str(B/'collect-installed.mjs'),str(APP)],capture_output=True,text=True,timeout=60);assert p.returncode==0,p.stderr;cls.after=json.loads(p.stdout)
  with tempfile.TemporaryDirectory(prefix='cric-vectors-before-')as temp:
   root=Path(temp);(root/'package.json').write_text('{"type":"module"}');folder=root/'banchi';voci=folder/'voci';voci.mkdir(parents=True)
   for path in (APP/'static/js/banchi').iterdir():
    if path.name!='voci':(folder/path.name).symlink_to(path,target_is_directory=path.is_dir())
   for path in (APP/'static/js/banchi/voci').iterdir():
    if path.name!='esperimento.js':(voci/path.name).symlink_to(path,target_is_directory=path.is_dir())
   (voci/'esperimento.js').write_bytes((B/'before-esperimento.js').read_bytes());p=subprocess.run(['node',str(B/'collect-installed.mjs'),str(APP),str(voci/'esperimento.js')],capture_output=True,text=True,timeout=60);assert p.returncode==0,p.stderr;cls.before=json.loads(p.stdout)
 def test_exact_inventory_and_no_opaque_y_sprite_on_any_native_vector(self):
  self.assertEqual({x['id']for x in self.after['target']},IDS)
  for row in self.after['target']:
   with self.subTest(id=row['id'],x=row['x'],stage=row['stage']):self.assertFalse(any(e['kind']=='label'and e['text']=='y'for e in row['elements']))
 def test_legend_association_has_actionable_text_in_both_modes(self):
  for r in self.after['cases']:
   if r['id']in IDS:
    with self.subTest(id=r['id']):self.assertIn('asse y',r['legend']);self.assertIn('retta grigia',r['legend']);self.assertIn('letture',r['legend']);self.assertIn('tavola 2D',r['legend']);self.assertNotIn('usa la vista Alto',r['legend'])
 def test_all_other_175_records_and_all_physical_data_remain_exact(self):
  self.assertEqual(self.after['records'],181);self.assertEqual(self.before['gridInputs'],self.after['gridInputs']);self.assertEqual(self.before['states'],self.after['states'])
  for before,after in zip(self.before['cases'],self.after['cases']):
   with self.subTest(id=before['id']):
    if before['id']not in IDS:self.assertEqual(before,after)
    else:
     self.assertEqual(before['teaching'],after['teaching']);self.assertEqual({**before['scene'],'height':6},after['scene']);self.assertEqual(before['sourceSha256'],after['sourceSha256'])
     for b,a in zip(before['states'],after['states']):self.assertEqual({k:v for k,v in b.items()if k!='primitives'},{k:v for k,v in a.items()if k!='primitives'})
 def test_only_existing_y_labels_are_removed_all_other_elements_retained(self):
  for b,a in zip(self.before['target'],self.after['target']):
   with self.subTest(id=b['id'],x=b['x'],stage=b['stage']):self.assertEqual(a['elements'],[e for e in b['elements']if not(e['kind']=='label'and e['text']=='y')]);self.assertEqual(b['model'],a['model']);self.assertEqual(b['measurement'],a['measurement'])
if __name__=='__main__':unittest.main()
