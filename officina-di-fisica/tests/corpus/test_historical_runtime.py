"""Historical failures remain reproducible while present-day evidence uses the new runtime."""
import json
from pathlib import Path
import subprocess
from types import SimpleNamespace
import unittest
from tests.corpus.historical_runtime import LEGACY_FINGERPRINT,reviewed_runtime
from tools.corpus_engineering import experiments_foundations_activity_verifier as review
from tools.corpus_engineering.pipeline import sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]


class FrozenNegativeEvidence(unittest.TestCase):
    def test_actual_git_snapshot_reproduces_original_bad_numeric_roundtrip_and_95_degree_task(self):
        with reviewed_runtime(review,force=True) as frozen:
            self.assertEqual(runtime_fingerprint(frozen)['sha256'],LEGACY_FINGERPRINT)
            code="""import{n}from'./static/js/banchi/misure.js';import{esperienza}from'./static/js/banchi/voci/esperimento.js';import{readFileSync}from'node:fs';const row=JSON.parse(readFileSync('content/esperienze-C1.json')).find(r=>r.id==='SIM-C1-L001-06');const a=await esperienza(row);console.log(JSON.stringify({text:n(2000),parsed:Number(n(2000).replace(',','.')),prompt:a.record.assessment[1].prompt}));"""
            result=subprocess.run(['node','--input-type=module','-e',code],cwd=frozen,text=True,capture_output=True,check=True)
            data=json.loads(result.stdout);self.assertEqual(data['text'],'2.000');self.assertEqual(data['parsed'],2);self.assertIn('95',data['prompt'])

    def test_fixture_never_replaces_the_current_installation_or_leaves_module_paths_changed(self):
        before=sha((APP/'static/js/banchi/banco.js').read_bytes());original=review.APP
        with reviewed_runtime(review,force=True) as frozen:
            self.assertNotEqual(frozen,APP);self.assertEqual(review.APP,frozen)
        self.assertEqual(review.APP,original);self.assertEqual(sha((APP/'static/js/banchi/banco.js').read_bytes()),before)

    def test_arbitrary_historical_fingerprint_cannot_select_or_execute_a_snapshot(self):
        unknown=SimpleNamespace(APP=APP,READ_RUNTIME_PROFILE_SHA256='0'*64)
        with self.assertRaisesRegex(ValueError,'Unrecognized'):
            with reviewed_runtime(unknown):self.fail('Unknown evidence executed')
