"""Archive transport preserves exact bytes and never masks present tampering."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import unittest
from tools.corpus_engineering import frozen_text_evidence as v,partial_activity_inventory as inventory
class FrozenTextEvidence(unittest.TestCase):
 def fixture(self,root):
  for name in (v.ARCHIVE,v.SIDECAR):
   target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((inventory.APP/name).read_bytes())
 def test_absent_originals_restore_exact_bytes_without_extraction(self):
  with TemporaryDirectory()as folder:
   root=Path(folder);self.fixture(root)
   for name,expected in v.ALLOWLIST.items():
    self.assertFalse((root/name).exists());data=v.verified_frozen_bytes(root,name,expected)
    self.assertEqual(v.sha(data),expected);self.assertEqual(data,(inventory.APP/name).read_bytes());self.assertFalse((root/name).exists())
 def test_regular_file_first_and_present_tamper_not_masked(self):
  with TemporaryDirectory()as folder:
   root=Path(folder);self.fixture(root);name,expected=next(iter(v.ALLOWLIST.items()));target=root/name;target.parent.mkdir(parents=True,exist_ok=True)
   data=v.verified_frozen_bytes(root,name,expected);target.write_bytes(data)
   self.assertEqual(v.verified_frozen_bytes(root,name,expected),data)
   target.write_bytes(data.rstrip()+b'\n')
   with self.assertRaisesRegex(ValueError,'Present frozen file changed'):v.verified_frozen_bytes(root,name,expected)
 def test_archive_corruption_and_sidecar_corruption_rejected(self):
  for which in [v.ARCHIVE,v.SIDECAR]:
   with TemporaryDirectory()as folder:
    root=Path(folder);self.fixture(root);p=root/which;p.write_bytes(p.read_bytes()+b'x');name,expected=next(iter(v.ALLOWLIST.items()))
    with self.assertRaises(ValueError):v.verified_frozen_bytes(root,name,expected)
 def test_present_directory_cannot_be_masked_by_archive(self):
  with TemporaryDirectory()as folder:
   root=Path(folder);self.fixture(root);name,expected=next(iter(v.ALLOWLIST.items()));(root/name).mkdir(parents=True)
   with self.assertRaisesRegex(ValueError,'not a regular file'):v.verified_frozen_bytes(root,name,expected)
 def test_unknown_missing_path_and_wrong_hash_rejected(self):
  with TemporaryDirectory()as folder:
   root=Path(folder);self.fixture(root)
   with self.assertRaises(FileNotFoundError):v.verified_frozen_bytes(root,'editorial/reviews/not-allowlisted.md','0'*64)
   name,expected=next(iter(v.ALLOWLIST.items()))
   with self.assertRaises(ValueError):v.verified_frozen_bytes(root,name,'0'*64)
   with self.assertRaises(ValueError):v.verified_frozen_bytes(root,'../escape','0'*64)
 def test_inventory_identical_when_only_two_originals_absent(self):
  before=inventory.build();original=Path.exists;missing={inventory.APP/p for p in v.ALLOWLIST}
  def exists(p):return False if p in missing else original(p)
  with patch.object(Path,'exists',exists):after=inventory.build()
  self.assertEqual(before,after);self.assertEqual(after['activityCredit'],0)
 def test_per_record_transport_dependency_is_bound(self):
  result=inventory.build();expected=v.sha((inventory.APP/'tools/corpus_engineering/frozen_text_evidence.py').read_bytes())
  self.assertTrue(all(r['inventoryDependencySha256']['tools/corpus_engineering/frozen_text_evidence.py']==expected for r in result['records']))
if __name__=='__main__':unittest.main()
