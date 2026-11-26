"""Actual16-record renewal guards, including real image/source drift and old epoch."""
from pathlib import Path
import copy,json,shutil,tempfile,unittest
from tools.corpus_engineering import methods_renewal_748_verifier as v
from tools.corpus_engineering.pipeline import canonical
from renewal_runtime_748 import immutable_runtime
def sources(app):
    full={r['id']:r for name in['catalog.json','metodo.json']for r in json.loads((app/'content'/name).read_bytes())}
    return{k:full[k]for k in v.IDS}

class MethodRenewal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scope=immutable_runtime('63131d8367ffbd16cc33b77319a7aedf05de7f1a');cls.app=cls.scope.__enter__()
        cls.addClassCleanup(cls.scope.__exit__,None,None,None)

    def test_actual_fresh_saved_all_sixteen_and_guard_missing_source(self):
        got=v.report(sources(self.app),app=self.app);saved=json.loads((v.BASE/'methods-activities-001-renewal-748.json').read_bytes())
        self.assertEqual(canonical(got),canonical(saved));self.assertEqual(len(got['records']),16)
        self.assertTrue(all(r['ok']and r['consumerUI']=='PASS_ACTUAL_BOUNDED_320_1280'and r['activityCredit']==0 for r in got['records']))
        missing=sources(self.app);del missing['C6']
        with self.assertRaisesRegex(ValueError,'Exactly16'):v.report(missing,app=self.app)

    def test_real_source_change_is_rejected_without_rebinding_review(self):
        altered=copy.deepcopy(sources(self.app));altered['C1-M-formula']['steps'][0]['prompt']+=' Changed'
        with self.assertRaisesRegex(ValueError,'exact/manual source'):v.report(altered,app=self.app)

    def test_real_retained_png_bytes_are_checked(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);shutil.copytree(v.BASE/'actual-catalogs-12',root/'actual-catalogs-12');shutil.copytree(v.BASE/'executed-catalogs',root/'executed-catalogs')
            v.evidence(base=root)
            report=json.loads((root/'actual-catalogs-12/report.json').read_bytes());image=root/'actual-catalogs-12'/(report['records'][0]['pngSha256']+'.png')
            image.write_bytes(image.read_bytes()+b'corrupt retained witness')
            with self.assertRaisesRegex(ValueError,'observed image'):v.evidence(base=root)

    def test_real_historical_one_a_app_cannot_reuse_new_ui(self):
        with immutable_runtime('eb51d0e9bdc3f992e9ae0ae76810098376e2ab79')as old:
            with self.assertRaisesRegex(ValueError,'Actual748 runtime'):v.report(sources(self.app),app=old)

if __name__=='__main__':unittest.main()
