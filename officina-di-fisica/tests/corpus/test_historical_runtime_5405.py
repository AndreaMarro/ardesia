"""True5405 negatives survive current-runtime fixes; no judgment or fingerprint substitution."""
import json,os,subprocess
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from tests.corpus import historical_runtime as fixture
from tools.corpus_engineering import experiments_force_work_045_verifier as force,experiments_energy_momentum_046_verifier as energy
from tools.corpus_engineering.pipeline import sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]
FP='54054f7ac463ef52f7c4c881d50ee071713315d891812696f18e39d9ad45ab3d'
COMMIT='da2d1ad10542c0d5054650aa8a8e6c46d9ca4f1b'

class Historical5405(unittest.TestCase):
    def test_real5405_snapshot_reproduces_zero_mean_and_hidden_spring_without_current_alias(self):
        # Break caught: choosing the old f897/current app instead of the exact5405 tree.
        error=None;observed=None;original=force.APP
        try:
            with fixture.reviewed_runtime(force,force=True) as frozen:
                self.assertNotEqual(frozen,APP);self.assertEqual(runtime_fingerprint(frozen)['sha256'],FP)
                code="""import{readFileSync}from'node:fs';import{esperienza}from'./static/js/banchi/voci/esperimento.js';const rows=JSON.parse(readFileSync('content/esperienze-C1.json'));const spring=await esperienza(rows.find(r=>r.id==='SIM-C1-L006-02'));const power=await esperienza(rows.find(r=>r.id==='SIM-C1-L007-02'));const elements=spring.elements(1,2),ball=elements.find(e=>e.kind==='ball'&&e.c===0xd49332),arrow=elements.find(e=>e.kind==='arrow'&&e.c===0x147979);console.log(JSON.stringify({mean:power.model.readings({x:0},{x:0,y:0})[2],instant:power.model.solve({x:0}).y,ball,arrow}));"""
                observed=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=frozen,text=True))
        except ValueError as exc:error=str(exc)
        self.assertIsNone(error,'Known5405 review must execute actual archived runtime: '+str(error));self.assertEqual(force.APP,original)
        self.assertEqual(observed['mean'],['Potenza media dall’avvio',0,'W']);self.assertEqual(observed['instant'],0)
        self.assertEqual(observed['arrow']['a'],observed['ball']['p']);self.assertAlmostEqual(observed['arrow']['b'][0]-observed['arrow']['a'][0],-.2);self.assertEqual(observed['ball']['r'],.25)

    def test_context_restores_module_and_external_environment_after_body_error(self):
        original=energy.APP;before=sha((APP/'static/js/banchi/voci/apparati/meccanica.js').read_bytes());error=None
        with patch.dict(os.environ,{'ASTRA_EXTENSIONS':'/private/tmp/caller-external-engine'}):
            try:
                with fixture.reviewed_runtime(energy,force=True) as frozen:
                    self.assertEqual(energy.APP,frozen);self.assertEqual(os.environ['ASTRA_EXTENSIONS'],str(frozen/'extensions'));raise RuntimeError('body sentinel')
            except Exception as exc:error=exc
            self.assertIsInstance(error,RuntimeError);self.assertEqual(str(error),'body sentinel');self.assertEqual(os.environ['ASTRA_EXTENSIONS'],'/private/tmp/caller-external-engine')
        self.assertEqual(energy.APP,original);self.assertEqual(sha((APP/'static/js/banchi/voci/apparati/meccanica.js').read_bytes()),before)

    def test_archive_contains_authentic_protocols_proofs_and_required_png_bytes(self):
        error=None
        try:
            with fixture.reviewed_runtime(energy,force=True) as frozen:
                self.assertTrue(energy.consumer_evidence()['ok'])
                for dependency in ('node_modules/axe-core/axe.min.js','node_modules/axe-core/package.json','node_modules/playwright/package.json'):
                    self.assertEqual((frozen/dependency).read_bytes(),(APP/dependency).read_bytes());self.assertFalse((frozen/dependency).samefile(APP/dependency))
                paths=['tests/corpus/browser-experiments-force-work-045.mjs','editorial/reviews/experiments-force-work-045-browser-originals.json','tests/corpus/browser-experiments-energy-momentum-046.mjs','editorial/reviews/experiments-energy-momentum-046-browser-originals.json','editorial/reviews/evidence/energy-momentum-046-negative-20261125/manifest.json']
                manifest=json.loads((frozen/paths[-1]).read_text())
                paths += ['editorial/reviews/evidence/energy-momentum-046-negative-20261125/'+r['name'] for r in manifest['files']]
                for name in paths:
                    expected=subprocess.check_output(['git','show',COMMIT+':officina-di-fisica/'+name],cwd=APP);self.assertEqual((frozen/name).read_bytes(),expected)
        except ValueError as exc:error=str(exc)
        self.assertIsNone(error,'Known5405 evidence must be archived, not copied from mutable current files: '+str(error))

    def test_cached_runtime_drift_is_rejected_before_any_review_body(self):
        entered=False;error=None
        try:
            with fixture.reviewed_runtime(energy,force=True) as frozen:pass
        except ValueError as exc:error=str(exc)
        self.assertIsNone(error,'Known5405 fixture required before corruption probe: '+str(error))
        file=frozen/'static/js/banchi/voci/confronti.js';raw=file.read_bytes()
        try:
            file.write_bytes(raw+b'\n// private drift probe\n')
            with self.assertRaises(ValueError):
                with fixture.reviewed_runtime(energy,force=True):entered=True
            self.assertFalse(entered)
        finally:file.write_bytes(raw)

    def test_exit_drift_is_detected_even_if_body_raises_and_environment_restores(self):
        # Break caught: placing the post-yield integrity check outside finally.
        original=energy.APP;error=None;file=None;raw=None;prior=os.environ.get('ASTRA_EXTENSIONS')
        try:
            with fixture.reviewed_runtime(energy,force=True) as frozen:
                file=frozen/'static/js/banchi/voci/confronti.js';raw=file.read_bytes();file.write_bytes(raw+b'\n// private drift on error\n');raise RuntimeError('body changed snapshot')
        except Exception as exc:error=exc
        finally:
            if file and raw is not None:file.write_bytes(raw)
        self.assertIsInstance(error,ValueError,'Snapshot drift must fail closed even on an exception');self.assertIn('changed',str(error).lower());self.assertEqual(energy.APP,original);self.assertEqual(os.environ.get('ASTRA_EXTENSIONS'),prior)

    def test_existing_f897_exit_drift_is_not_swallowed_on_body_error(self):
        from tools.corpus_engineering import experiments_foundations_activity_verifier as legacy
        original=legacy.APP;error=None;file=None;raw=None
        try:
            with fixture.reviewed_runtime(legacy,force=True) as frozen:
                file=frozen/'static/js/ui.js';raw=file.read_bytes();file.write_bytes(raw+b'\n// private legacy drift\n');raise RuntimeError('body sentinel')
        except Exception as exc:error=exc
        finally:
            if file and raw is not None:file.write_bytes(raw)
        self.assertIsInstance(error,ValueError,'Post-yield guard must run in finally');self.assertIn('changed',str(error).lower());self.assertEqual(legacy.APP,original)

    def test_unknown_epoch_rejected_by_builder_before_git_or_current_execution(self):
        caught=None
        try:fixture.historical_app(APP,'0'*64)
        except Exception as exc:caught=exc
        self.assertIsInstance(caught,ValueError);self.assertIn('Unrecognized',str(caught))
        with self.assertRaisesRegex(ValueError,'Unrecognized'):
            with fixture.reviewed_runtime(SimpleNamespace(APP=APP,READ_RUNTIME_PROFILE_SHA256='0'*64)):self.fail('Unrecognized review ran')

if __name__=='__main__':unittest.main()
