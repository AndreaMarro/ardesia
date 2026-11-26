"""Actual reader failures remain failures alongside independently correct source math."""
from pathlib import Path
import json,shutil,tempfile,unittest,zipfile,hashlib
from tools.corpus_engineering import readers_renewal_748_verifier as v
from tools.corpus_engineering.pipeline import canonical
from renewal_runtime_748 import immutable_runtime

class ReaderRenewal(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scope=immutable_runtime('63131d8367ffbd16cc33b77319a7aedf05de7f1a');cls.app=cls.scope.__enter__();cls.addClassCleanup(cls.scope.__exit__,None,None,None)

    def test_exact_real_179_both_widths_and_all_negative_statuses_retained(self):
        records=v.evidence();self.assertEqual(len(records),358);self.assertEqual(len({r['id']for r in records}),179)
        bad=[r for r in records if not r['technicalOk']];self.assertEqual(len(bad),135);self.assertEqual({r['width']for r in bad},{320})
        self.assertTrue(all('Formula overflow'in r['error']for r in bad));self.assertTrue(all(r['technicalOk']for r in records if r['width']==1280))
        self.assertEqual(sum(bool(r.get('violations'))for r in records),132)
        self.assertEqual(sum(r['variant']=='DRAFT'for r in records),28);self.assertTrue(all(r['technicalOk']for r in records if r['variant']=='DRAFT'))

    def test_fresh_source_math_and_ui_failure_are_separate_in_canonical_group(self):
        blueprint=v.load(v.BASE/'reader-blueprint.json');rows={r['id']:r['source']['record']for r in blueprint['records']};keys={'C1-E'+str(i).zfill(3)for i in range(1,9)}
        package=v.load(v.BASE/'canonical-package-inputs/examples-c1-revisions-016.json');bindings=v.load(v.BASE/'canonical-package-inputs/examples-c1-revisions-016-bindings.json')
        got=v.report({k:rows[k]for k in keys},package,bindings,app=self.app);saved=v.load(v.BASE/'group-reports/examples-c1-activities-003-renewal-748.json');self.assertEqual(canonical(got),canonical(saved))
        by={r['id']:r for r in got['records']};self.assertTrue(by['C1-E006']['sourceMathChecksOk']);self.assertFalse(by['C1-E006']['ok']);self.assertTrue(by['C1-E006']['consumerObservedUiFailure'])
        self.assertFalse(by['C1-E006']['sourceScientificFailureInferredFromUI'])
        for key in['C1-E003','C1-E008']:
            self.assertTrue(by[key]['ok']);self.assertTrue(by[key]['failedPublishedEdition']);self.assertFalse(by[key]['publishedEditionReview']['ok'])
        with self.assertRaisesRegex(ValueError,'Explicit reviewed revision'):v.report({k:rows[k]for k in keys},app=self.app)

    def test_forging_a_failed_case_as_positive_is_rejected_before_image_reads(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);index=v.load(v.BASE/'reader-proof-index.json');shutil.copyfile(v.BASE/'reader-proof-index.json',root/'reader-proof-index.json')
            for name in index['files']:
                target=root/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(v.BASE/name,target)
            target=root/'actual-C1-66/report.json';report=v.load(target);next(r for r in report['records']if not r['technicalOk'])['technicalOk']=True;target.write_text(json.dumps(report))
            with self.assertRaisesRegex(ValueError,'protocol/report changed'):v.evidence(base=root)

    def test_executed_math_dependency_archive_is_exact_and_covers_all_records(self):
        manifest=v.load(v.BASE/'executed-source-math-dependencies.json');file=v.BASE/'executed-source-math-dependencies.zip';self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),manifest['archiveSha256'])
        with zipfile.ZipFile(file)as archive:
            self.assertEqual(set(archive.namelist()),set(manifest['files']))
            for name,pin in manifest['files'].items():self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(),pin)
        summaries=[v.load(p)for p in(v.BASE/'group-reports').glob('*.json')];rows=[r for s in summaries for r in s['records']]
        self.assertEqual(len(rows),189);self.assertEqual(len({r['id']for r in rows}),189);self.assertEqual(sum(r['ok']for r in rows),54)
        self.assertEqual(sum(bool(r.get('failedPublishedEdition'))for r in rows),14)

    def test_changed_unused_helper_cannot_be_masked_by_frozen_dependency_hash(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);file=root/'helper.py';file.write_text('def unused(): return 1\n');expected={'helper.py':hashlib.sha256(file.read_bytes()).hexdigest()}
            v.verify_source_dependencies(expected,root=root)
            file.write_text('def unused(): return 2\n')
            with self.assertRaisesRegex(ValueError,'dependency changed'):v.verify_source_dependencies(expected,root=root)

if __name__=='__main__':unittest.main()
