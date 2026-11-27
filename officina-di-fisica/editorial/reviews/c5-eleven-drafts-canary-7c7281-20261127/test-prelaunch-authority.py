"""Negative prelaunch tests use copies only; active imported candidates are never changed."""
from pathlib import Path
import unittest,importlib.util,copy,json,tempfile,hashlib,subprocess
F=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('authority',F/'prepare-and-prelaunch.py');p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
class Authority(unittest.TestCase):
 def setUp(self):self.plan=json.loads((F/'prepared.json').read_text())
 def test_untouched_edition_and_owner_authority(self):self.assertEqual(len(p.verify(self.plan)),11)
 def test_retokens_cannot_rebind_full_record(self):
  row=self.plan['records'][0];row['record']['blocks'][0]['text']+=' forged';row['candidateSha256']=p.digest(row['record'])
  with self.assertRaises(AssertionError):p.verify(self.plan)
 def test_missing_full_owner_edition_rejected(self):
  self.plan['draftRecords'].pop()
  with self.assertRaises(AssertionError):p.verify(self.plan)
 def test_js_numeric_reencoding_cannot_silently_change_authoritative_sha(self):
  changed=p.normalized_numbers(self.plan)
  self.assertNotEqual(p.digest(changed['draftRecords'][0]),p.digest(self.plan['draftRecords'][0]))
  with self.assertRaises(AssertionError):p.verify(changed)
 def test_extra_input_file_rejected_before_import(self):
  with tempfile.TemporaryDirectory(prefix='cric-c5-authority-negative-')as name:
   old=p.FOLDER;p.FOLDER=Path(name);(p.FOLDER/'inputs').mkdir()
   try:
    for source in (F/'inputs').iterdir():(p.FOLDER/'inputs'/source.name).write_bytes(source.read_bytes())
    (p.FOLDER/'inputs/extra.json').write_text('{}')
    with self.assertRaises(AssertionError):p.verify(self.plan)
   finally:p.FOLDER=old
if __name__=='__main__':unittest.main()
