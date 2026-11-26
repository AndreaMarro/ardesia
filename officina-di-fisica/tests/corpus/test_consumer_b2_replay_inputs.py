"""The context adapter verifies missing/tampered inputs without running a UI."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import hashlib
import importlib.util
import json
import shutil
import unittest

HERE=Path(__file__).resolve().parents[2]/'editorial/reviews/independent-consumer-b2ab-20261126/network-negative-replay-support-20261126'
spec=importlib.util.spec_from_file_location('b2_replay_context_adapter',HERE/'replay-network-negative.py')
adapter=importlib.util.module_from_spec(spec);spec.loader.exec_module(adapter)


class ReplayInputs(unittest.TestCase):
    def test_all_frozen_bytes_and_four_inputs_available_without_ui(self):
        r=adapter.verify_inputs();self.assertEqual(r['sourceInputs'],4);self.assertEqual(r['draftRecords'],9)
        self.assertFalse(r['uiExecutedByVerificationOnly']);self.assertEqual(r['activityCredit'],0)

    def fixture(self,root):
        shutil.copytree(HERE/'draft-input-snapshot',root/'draft-input-snapshot')
        shutil.copyfile(HERE/'source-input-pins.json',root/'source-input-pins.json')

    def test_missing_tampered_or_unlisted_input_is_rejected(self):
        for mode in ('missing','tampered','unlisted'):
            with self.subTest(mode=mode),TemporaryDirectory()as d:
                root=Path(d);self.fixture(root);files=list((root/'draft-input-snapshot/editorial/batches').glob('*.json'))
                if mode=='missing':files[0].unlink()
                elif mode=='tampered':files[0].write_bytes(files[0].read_bytes()+b' ')
                else:(files[0].parent/'stale-unpinned.json').write_text('{}')
                with patch.object(adapter,'HERE',root):
                    with self.assertRaises((AssertionError,FileNotFoundError)):adapter.verify_inputs()

    def test_duplicate_candidate_or_wrong_base_rejected_even_with_private_repin(self):
        for mode in ('duplicate','base'):
            with self.subTest(mode=mode),TemporaryDirectory()as d:
                root=Path(d);self.fixture(root);f=root/'draft-input-snapshot/editorial/batches/experiments-manual-support-revision-263.json'
                pkg=json.loads(f.read_bytes())
                if mode=='duplicate':pkg['records'][1]['id']=pkg['records'][0]['id']
                else:pkg['records'][0]['baseVersion']=0
                f.write_text(json.dumps(pkg));p=root/'source-input-pins.json';pins=json.loads(p.read_bytes())
                pins['files'][str(f.relative_to(root))]=hashlib.sha256(f.read_bytes()).hexdigest();p.write_text(json.dumps(pins))
                with patch.object(adapter,'HERE',root):
                    with self.assertRaises(AssertionError):adapter.verify_inputs()


if __name__=='__main__':unittest.main()
