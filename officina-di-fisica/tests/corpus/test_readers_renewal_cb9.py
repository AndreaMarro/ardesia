from pathlib import Path
import json,shutil,tempfile,unittest,zipfile,hashlib
from tools.corpus_engineering import readers_renewal_cb9_verifier as v
from tools.corpus_engineering.pipeline import canonical
from renewal_runtime_cb9 import immutable_runtime
class ReaderRenewal(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.scope=immutable_runtime('cf3d8774ea4eb2f5287b7d7b890d9be0bf8bc8bc');cls.app=cls.scope.__enter__();cls.addClassCleanup(cls.scope.__exit__,None,None,None)
 def test_exact_179_both_widths_current_all_pass_and14_original_judgments_retained(self):
  rows=v.evidence();self.assertEqual(len(rows),358);self.assertEqual(len({r['id']for r in rows}),179);self.assertTrue(all(r['technicalOk']for r in rows));self.assertEqual(sum(r['variant']=='DRAFT'for r in rows),28);self.assertTrue(all(r['terminalObservationSource']=='AUTHOR_RECORDED_COHORT_EXIT_CODE_IN_IMMUTABLE585A8F8B'for r in rows))
  summaries=[v.load(p)for p in(v.BASE/'group-reports').glob('*.json')];records=[r for s in summaries for r in s['records']];self.assertEqual(len(summaries),33);self.assertEqual(len(records),189);self.assertEqual(len({r['id']for r in records}),189);self.assertTrue(all(r['ok']for r in records));self.assertEqual(sum(bool(r.get('failedPublishedEdition'))for r in records),14)
 def test_fresh_exact_group_matches_saved_without_transferring_failed_published_edition(self):
  bp=v.load(v.BASE/'reader-blueprint.json');rows={r['id']:r['source']['record']for r in bp['records']};keys={'C1-E'+str(i).zfill(3)for i in range(1,9)};package=v.load(v.BASE/'canonical-package-inputs/examples-c1-revisions-016.json');bindings=v.load(v.BASE/'canonical-package-inputs/examples-c1-revisions-016-bindings.json')
  got=v.report({k:rows[k]for k in keys},package,bindings,app=self.app);saved=v.load(v.BASE/'group-reports/examples-c1-activities-003-renewal-cb9.json');self.assertEqual(canonical(got),canonical(saved));by={r['id']:r for r in got['records']};self.assertTrue(by['C1-E006']['ok']);self.assertTrue(by['C1-E006']['sourceMathChecksOk']);self.assertFalse(by['C1-E006']['consumerObservedUiFailure'])
  for key in ['C1-E003','C1-E008']:self.assertTrue(by[key]['failedPublishedEdition']);self.assertFalse(by[key]['publishedEditionReview']['ok'])
  with self.assertRaisesRegex(ValueError,'Explicit reviewed revision'):v.report({k:rows[k]for k in keys},app=self.app)
 def test_forged_report_rejected_before_source_or_image_can_be_reinterpreted(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp);index=v.load(v.BASE/'reader-proof-index.json');shutil.copyfile(v.BASE/'reader-proof-index.json',root/'reader-proof-index.json')
   for name in index['files']:
    target=root/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(v.BASE/name,target)
   target=root/'verified-author-source/full-reader-replay-cb9/C1/report.json';report=v.load(target);report['records'][0]['sourceSha256']='0'*64;target.write_text(json.dumps(report))
   with self.assertRaisesRegex(ValueError,'author reader bytes changed'):v.evidence(base=root)
 def test_actual_source_dependency_archive_matches_executed_bytes(self):
  manifest=v.load(v.BASE/'executed-source-math-dependencies.json');file=v.BASE/'executed-source-math-dependencies.zip';self.assertEqual(hashlib.sha256(file.read_bytes()).hexdigest(),manifest['archiveSha256'])
  with zipfile.ZipFile(file)as z:
   self.assertEqual(set(z.namelist()),set(manifest['files']))
   for name,pin in manifest['files'].items():self.assertEqual(hashlib.sha256(z.read(name)).hexdigest(),pin)
 def test_changed_unused_dependency_is_not_masked_by_frozen_metadata(self):
  with tempfile.TemporaryDirectory()as tmp:
   root=Path(tmp);p=root/'helper.py';p.write_text('def unused():return 1\n');expected={'helper.py':hashlib.sha256(p.read_bytes()).hexdigest()};v.verify_source_dependencies(expected,root=root);p.write_text('def unused():return 2\n')
   with self.assertRaisesRegex(ValueError,'dependency changed'):v.verify_source_dependencies(expected,root=root)
if __name__=='__main__':unittest.main()
