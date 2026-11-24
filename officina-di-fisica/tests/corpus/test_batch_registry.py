from pathlib import Path
from copy import deepcopy
import json
import tempfile
import unittest

from tools.corpus_engineering.batches import load_registry, validate_batch, assert_record_identity, assert_browser_identity,validate_browser_preview
from tools.corpus_engineering.pipeline import build_entry,digest,sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
from tools.corpus_engineering.integration import exercise
from tools.corpus_engineering.review_contract import reviewed_rows

APP=Path(__file__).resolve().parents[2]


class BatchRegistry(unittest.TestCase):
    def test_empty_formula_metrics_cannot_certify_a_rendered_formula(self):
        with tempfile.TemporaryDirectory() as home:
            app=Path(home)
            for folder in ('editorial/reviews','editorial/batches','tests/corpus'):(app/folder).mkdir(parents=True)
            script=app/'tests/corpus/browser-drafts.mjs';script.write_text('// fixture only')
            package={'records':[{'id':'AR-one','blocks':[{'type':'formula','text':'1+1=2'}]}],'assets':[]}
            file=app/'editorial/batches/test-001.json';file.write_text(json.dumps(package))
            proof={'packageFileSha256':sha(file.read_bytes()),'testSha256':sha(script.read_bytes()),
                   'runtimeFingerprint':runtime_fingerprint(app),'protectedAssets':[],
                   'records':[{'id':'AR-one','width':width,'violations':[],'overflow':0,'formulas':[]} for width in (1440,768,320)]}
            (app/'editorial/reviews/test-001-browser.json').write_text(json.dumps(proof))
            with self.assertRaises(ValueError):validate_browser_preview('test-001',file,package,{'AR-one'},app)

    def test_offline_corpus_schema_does_not_invalidate_the_reader_but_runtime_contract_does(self):
        with tempfile.TemporaryDirectory() as home:
            app=Path(home);contracts=app/'contracts';contracts.mkdir()
            offline=contracts/'corpus-batches-v1.schema.json';offline.write_text('{}')
            runtime=contracts/'engine-v1.schema.json';runtime.write_text('{}')
            before=runtime_fingerprint(app)
            offline.write_text('{"newOfflineField":true}')
            self.assertEqual(before,runtime_fingerprint(app))
            runtime.write_text('{"newRuntimeField":true}')
            self.assertNotEqual(before,runtime_fingerprint(app))

    def test_distinct_choice_strings_cannot_hide_equivalent_exact_values(self):
        for options in (['5/3','2','8/4','1','3'],['1 m','100 cm','2 m','3 m','4 m']):
            row={'id':'AR-test','answer':{'type':'choice','value':options[0],'options':options},'blocks':[]}
            binding={'id':row['id'],'candidateSha256':digest(row),'assetChecksums':{},'sourceId':'test','sourceRef':'a'*40,'sourceSha256':'b'*64}
            values=reviewed_rows({'records':[row],'assets':[]},[binding],{}, {row['id']},APP/'editorial/assets')
            self.assertTrue(any('Equivalent exact numeric choices' in error for error in values[0][-1]))

    def registry(self, rows):
        return {"schemaVersion":"1.0.0","batches":rows}

    def test_duplicate_ids_across_batches_cannot_count_as_two_revisions(self):
        rows=[{"id":"one-001","verifier":"units_verifier","questionIds":["AR-one"]},
              {"id":"two-002","verifier":"scale_verifier","questionIds":["AR-one"]}]
        with tempfile.TemporaryDirectory() as home:
            file=Path(home)/"registry.json";file.write_text(json.dumps(self.registry(rows)))
            with self.assertRaises(ValueError):load_registry(file)

    def test_paths_and_unversioned_registries_are_rejected(self):
        values=[{"batches":[]},self.registry([{"id":"../private","verifier":"os","questionIds":["AR-one"]}])]
        for value in values:
            with tempfile.TemporaryDirectory() as home:
                file=Path(home)/"registry.json";file.write_text(json.dumps(value))
                with self.assertRaises(ValueError):load_registry(file)

    def test_cached_arithmetic_does_not_reissue_scientific_approval(self):
        source={"id":"u1-one-01","prompt":"Testo"}
        before=build_entry("ardesia",source,{},"same")
        before["review"]["independentSolution"]="PASS_AI"
        before["state"]="REVISED_DRAFT"
        before["family"]="retired-draft-family"
        before["competency"]="C1-L001"
        after=build_entry("ardesia",source,{},"same",before)
        self.assertEqual(after["review"]["independentSolution"],"NOT_RUN")
        self.assertEqual(after["state"],"ACCOUNTED")
        self.assertEqual(after["family"],"")
        self.assertEqual(after["competency"],"")

    def test_scientific_output_cannot_omit_duplicate_or_rebind_a_registered_id(self):
        package={"records":[{"id":"AR-one"},{"id":"AR-two"}]}
        bindings=[{"id":"AR-one","sourceSha256":"a"*64},{"id":"AR-two","sourceSha256":"b"*64}]
        records=[{"id":r["id"],"candidateSha256":digest(r),"sourceSha256":b["sourceSha256"],"ok":True,
                  "verificationMode":"EXACT_ORACLE","humanApproval":"NOT_RUN","publication":"DRAFT"}
                 for r,b in zip(package["records"],bindings)]
        assert_record_identity(records,{"AR-one","AR-two"},package,bindings)
        for wrong in (records[:1],[records[0],records[0]]):
            with self.assertRaises(ValueError):assert_record_identity(wrong,{"AR-one","AR-two"},package,bindings)
        wrong=deepcopy(records);wrong[0]["candidateSha256"]="0"*64
        with self.assertRaises(ValueError):assert_record_identity(wrong,{"AR-one","AR-two"},package,bindings)

    def test_browser_proof_invalidates_when_css_changes(self):
        with tempfile.TemporaryDirectory() as home:
            app=Path(home);(app/"static").mkdir();(app/"static/style.css").write_text('body {color:black}')
            before=runtime_fingerprint(app)
            package=app/"package.json";package.write_text('{"value":1e-6,"tolerance":1.0}')
            proof={"packageFileSha256":__import__('hashlib').sha256(package.read_bytes()).hexdigest(),
                   "testSha256":"test","runtimeFingerprint":before}
            assert_browser_identity(proof,package,"test",before)
            (app/"static/style.css").write_text('body {color:white}')
            with self.assertRaises(ValueError):assert_browser_identity(proof,package,"test",runtime_fingerprint(app))

    def test_integration_runner_accepts_a_different_bounded_batch(self):
        result=exercise("scale-002")
        self.assertEqual(result["firstImport"]["saved"],16)
        self.assertEqual(result["repeatedImport"]["saved"],0)
        self.assertEqual(result["afterPublishedCount"],991)
        self.assertEqual(result["beforePublishedSha256"],result["afterPublishedSha256"])


if __name__=="__main__":unittest.main()
