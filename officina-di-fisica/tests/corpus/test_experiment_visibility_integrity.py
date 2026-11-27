"""Pinned packages must be rejected before canonical importer sees a mutation."""
from pathlib import Path
import base64
import copy
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from tools.corpus_engineering import experiment_visibility_request as v
from server import store,editor
from tools.corpus_engineering.draft_import import import_drafts

APP=Path(__file__).resolve().parents[2]
BASE=APP/'editorial/reviews/experiment-visibility-protocol-integrity-followup-20261126'
REAL_POPEN=subprocess.Popen
ORIGINAL=APP/'editorial/reviews/experiment-visibility-macro-proposal-20261126/request-example.json'

class VisibilityIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.context=cls.enterClassContext(tempfile.TemporaryDirectory());cls.app=(Path(cls.context)/'app').resolve();cls.app.mkdir()
        for name in ('server','static','content','contracts','migrations','policies','extensions'):
            source=APP/name
            if source.exists():shutil.copytree(source,cls.app/name,ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
        (cls.app/'tools/corpus_engineering').mkdir(parents=True)
        for name in ('runtime_fingerprint.py','draft_import.py'):shutil.copyfile(APP/'tools/corpus_engineering'/name,cls.app/'tools/corpus_engineering'/name)
        for name in ('package.json','package-lock.json'):shutil.copyfile(APP/name,cls.app/name)
        (cls.app/'node_modules').symlink_to(APP/'node_modules',target_is_directory=True)
        env={**os.environ,'ASTRA_EXTENSIONS':str(cls.app/'extensions'),'PYTHONDONTWRITEBYTECODE':'1'}
        cls.fp=json.loads(subprocess.check_output([sys.executable,'-B','-m','tools.corpus_engineering.runtime_fingerprint'],cwd=cls.app,env=env))

    def setUp(self):
        self.temp=self.enterContext(tempfile.TemporaryDirectory());self.root=Path(self.temp);self.output=self.root/'evidence';self.output.mkdir();target=self.app/'editorial/batches';target.mkdir(parents=True,exist_ok=True)
        pins=json.loads((BASE/'fixture-input-pins.json').read_bytes());self.files={}
        for name,pin in pins['files'].items():
            blob=(BASE/'input-fixtures'/name).read_bytes();self.assertEqual(v.sha(blob),pin);p=target/name;p.write_bytes(blob);self.files[str(p)]=pin
        self.packages=[str(target/(name+'.json'))for name in v.PACKAGES];self.rows=[r for p in self.packages for r in json.loads(Path(p).read_bytes())['records']]
        self.plan={'schemaVersion':'1.0.0','sourceCommit':pins['sourceCandidateCommit'],'requestSha256':v.sha(ORIGINAL.read_bytes()),'runtimeFingerprint':self.fp,'course':'TEST_BOUNDARY_NOT_UI','packageFiles':self.packages,'inputFiles':self.files,'draftRecords':self.rows,'records':[{'id':r['id'],'variant':'draft','record':r,'candidateSha256':v.digest(r)}for r in self.rows],'expectedCaseKeys':[],'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE'}
        request=json.loads(ORIGINAL.read_bytes());request['runtimeSha256']=self.fp['sha256'];request['runtimeProtocolSha256']=self.fp['protocolSha256'];request['protocolFiles']={k:v.sha((APP.parent/k).read_bytes())for k in request['protocolFiles']}
        self.request=self.root/'private-unit-request.json';self.request.write_text(json.dumps(request));self.plan['requestFile']=str(self.request);self.plan['requestSha256']=v.sha(self.request.read_bytes())
        self.prepared=self.root/'prepared.json';self.info=self.root/'info.json';self.info.write_text(json.dumps({'candidateApp':str(self.app),'prepared':str(self.prepared),'output':str(self.output)}))
        self.data=self.root/'private-data';self.data.mkdir();self.marker=self.root/'canonical-import-entered.json'

    def launch_real_import_without_browser(self,*args,**kwargs):
        if not args or args[0][0]!='node':return REAL_POPEN(*args,**kwargs)
        # Only the slow browser/server process boundary is replaced. The real
        # canonical importer runs, against an isolated actual seeded DB.
        with patch.object(store,'DATA',self.data),patch.object(editor,'DATA',self.data):
            store.initialize()
            self.marker.write_text(json.dumps({'canonicalImportEntered':True,'activityCredit':0}))
            with store.connect()as db:
                for p in self.plan['packageFiles']:import_drafts(db,{'id':'owner','role':'autore'},json.loads(Path(p).read_bytes()))
        raise RuntimeError('Browser deliberately not launched after real import boundary')

    def reject_before_import(self):
        self.prepared.write_text(json.dumps(self.plan))
        # The test bootstrap holds the real shared mutex. Avoid reacquiring
        # that same non-reentrant lock in this nested in-process harness call.
        with patch.object(v.fcntl,'flock',return_value=None),patch.object(v.subprocess,'Popen',side_effect=self.launch_real_import_without_browser):
            try:v.run_prepared(self.info)
            except Exception:pass
        self.assertFalse(self.marker.exists(),'Mutated bytes reached the real canonical import before rejection')

    def test_valid_four_files_return_all_nine_normalized_owner_records(self):
        checker=getattr(v,'verify_prepared_inputs',lambda *args:None)
        result=checker({'candidateApp':str(self.app)},self.plan)
        self.assertIsInstance(result,dict,'Valid prepared dataset must be checked, not ignored')
        self.assertEqual(set(result['normalizedOwnerRecords']),{r['id']for r in self.rows})
        first=result['normalizedOwnerRecords'][self.rows[0]['id']]
        self.assertNotIn('baseVersion',first);self.assertEqual(first['review'],'bozza');self.assertEqual(first['version'],2)

    def test_blocks_changed_after_prepare_never_reach_canonical_import(self):
        path=Path(self.packages[0]);pkg=json.loads(path.read_bytes());pkg['records'][0]['blocks'][0]['text']+=' Mutated after prepare.';path.write_text(json.dumps(pkg));self.reject_before_import()

    def test_asset_bytes_changed_after_prepare_never_reach_canonical_import(self):
        path=Path(self.packages[0]);pkg=json.loads(path.read_bytes());asset=pkg['assets'][0];asset['data']=base64.b64encode(base64.b64decode(asset['data'])+b'\n').decode();path.write_text(json.dumps(pkg));self.reject_before_import()

    def test_prepared_candidate_rebound_never_reaches_canonical_import(self):
        self.plan['records'][0]['record']=copy.deepcopy(self.plan['records'][0]['record']);self.plan['records'][0]['record']['blocks'][0]['text']+=' Rebound candidate.';self.reject_before_import()

    def test_omitted_package_never_reaches_canonical_import(self):
        self.plan['packageFiles']=self.plan['packageFiles'][1:];self.reject_before_import()

    def test_real_final_408_has_exact_byte_bound_cases_and_nine_full_owner_records(self):
        root=BASE/'actual-ui-408';prepared=v.load(root/'prepared.json');receipt=v.load(root/'terminal-receipt.json')
        self.assertEqual(receipt['observedExitCode'],0);self.assertEqual(len(prepared['expectedCaseKeys']),408)
        self.assertEqual(receipt['runtimeSha256'],'c05df15e2bf95ec27709c2700d18cae53c23842101aec88c7c7eca66c490d4d2')
        self.assertEqual(v.sha((BASE/'executed-experiment_visibility_ui.mjs').read_bytes()),receipt['protocolSha256'])
        report=v.verify_report(root,prepared,receipt['protocolSha256']);self.assertEqual(len(report['fullOwnerRecordIdentity']['records']),9)
        cases=[v.load(root/x['file'])for x in report['cases']];setups=[c for c in cases if c['caseKey'].endswith('|setup')]
        self.assertEqual(len(setups),112);self.assertEqual(sum(len(c['questions'])for c in setups),240)
        self.assertEqual(sum(c['variant']=='draft'and c['reading']is not None for c in setups),72)
        self.assertEqual(report['activityCredit'],0);self.assertEqual(report['humanApproval'],'NOT_RUN')

    def test_full_owner_record_body_must_match_normalized_prepared_record(self):
        code=r"""
        import assert from 'node:assert/strict';
        import {assertOwnerRecord as check} from './tools/corpus_engineering/experiment_visibility_ui.mjs';
        const expected={id:'case',version:2,baseVersion:1,control:{min:0,max:1,step:1},assessmentSelection:{schemaVersion:'1.0.0',points:[0,1]},blocks:[{type:'paragraph',text:'Frozen statement'}]};
        const saved={...expected,review:'bozza'};delete saved.baseVersion;
        check(saved,expected);
        assert.throws(()=>check({...saved,blocks:[{type:'paragraph',text:'Other delivered statement'}]},expected));
        assert.throws(()=>check({...saved,version:3},expected));
        check({...saved,version:3},{...expected,baseVersion:2,version:3});
        assert.throws(()=>check(saved,{...expected,baseVersion:2,version:3}));
        assert.throws(()=>check({...saved,version:4},{...expected,baseVersion:2,version:4}));
        assert.throws(()=>check(saved,{...expected,baseVersion:true}));
        """
        result=subprocess.run(['node','--input-type=module','-e',code],cwd=APP,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_requested_draft_must_follow_an_integer_live_edition(self):
        self.assertTrue(v.is_next_edition({'baseVersion':1,'version':2}))
        self.assertTrue(v.is_next_edition({'baseVersion':2,'version':3}))
        for base, version in ((2, 2), (2, 4), (True, 2), (0, 1), (2, '3'), (2**53-1, 2**53)):
            with self.subTest(base=base, version=version):
                self.assertFalse(v.is_next_edition({'baseVersion':base,'version':version}))

if __name__=='__main__':unittest.main()
