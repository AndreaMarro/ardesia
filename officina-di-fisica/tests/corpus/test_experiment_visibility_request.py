"""Fail-closed transport/coverage guards; no activity or scientific approval."""
from pathlib import Path
import copy
import json
import tempfile
import unittest
from unittest.mock import patch
from tools.corpus_engineering import experiment_visibility_request as v

APP=Path(__file__).resolve().parents[2]
PROPOSAL=APP/'editorial/reviews/experiment-visibility-macro-proposal-20261126'

class VisibilityEvidence(unittest.TestCase):
    def test_request_requires_immutable_refs_exact_protocol_set_and_no_acceptance(self):
        r=json.loads((PROPOSAL/'request-example.json').read_bytes())
        validator=v.Draft202012Validator(v.load(v.SCHEMA))
        validator.validate(r)
        v.validate(PROPOSAL/'request-example.json')
        for key,value in [('candidateRef','main'),('candidateRef','a'*40+'\n'),('activityCredit',1),('humanApproval','PASS'),('publicationAction','PUBLISH')]:
            bad=copy.deepcopy(r);bad[key]=value
            with self.subTest(key=key,value=value),self.assertRaises(__import__('jsonschema').exceptions.ValidationError):validator.validate(bad)
        with tempfile.TemporaryDirectory()as tmp:
            target=Path(tmp)/'request.json';bad=copy.deepcopy(r);bad['protocolFiles'].pop(next(iter(bad['protocolFiles'])));target.write_text(json.dumps(bad))
            with self.assertRaisesRegex(ValueError,'four protocol'):v.validate(target)

    def test_paths_reject_parent_alias_absolute_and_external_symlinks(self):
        with tempfile.TemporaryDirectory()as tmp,tempfile.TemporaryDirectory()as other:
            root=Path(tmp);(root/'link').symlink_to(other,target_is_directory=True)
            for name in ['../outside','/outside','a/../../outside','a\\b','a:b','a\n','link/outside',None]:
                with self.subTest(name=name),self.assertRaises(ValueError):v.safe(root,name)
            self.assertEqual(v.safe(root,'cases/one.json'),root/'cases/one.json')

    def evidence(self,root):
        p={'sourceCommit':'1'*40,'requestSha256':'2'*64,'runtimeFingerprint':{'sha256':'3'*64},'expectedCaseKeys':['one']}
        image=b'actual fixture bytes';(root/'image.png').write_bytes(image)
        c={'caseKey':'one','technicalOk':True,'sourceCommit':p['sourceCommit'],'requestSha256':p['requestSha256'],'runtimeSha256':'3'*64,'protocolSha256':'4'*64,'scientificApproval':False,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','screenshots':[{'file':'image.png','sha256':v.sha(image)}]}
        (root/'case.json').write_text(json.dumps(c));item={'caseKey':'one','file':'case.json','sha256':v.sha((root/'case.json').read_bytes())}
        report={**{k:p[k]for k in ['sourceCommit','requestSha256','runtimeFingerprint']},'protocolSha256':'4'*64,'activityCredit':0,'humanApproval':'NOT_RUN','publicationAction':'NONE','cases':[item],'technicalStatus':'ALL_PLANNED_CASES_OBSERVED_REVIEW_NOT_GRANTED'}
        (root/'report.json').write_text(json.dumps(report));return p,c,report

    def test_missing_duplicate_and_unknown_states_are_rejected(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);p,c,r=self.evidence(root);v.verify_report(root,p,'4'*64)
            for items in [[],r['cases']*2,[{**r['cases'][0],'caseKey':'unknown'}]]:
                (root/'report.json').write_text(json.dumps({**r,'cases':items}))
                with self.subTest(items=items),self.assertRaisesRegex(ValueError,'Missing/duplicate'):v.verify_report(root,p,'4'*64)

    def test_rebound_report_protocol_and_runtime_fail(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);p,c,r=self.evidence(root)
            for key,value in [('runtimeFingerprint',{'sha256':'5'*64}),('protocolSha256','5'*64),('activityCredit',1)]:
                (root/'report.json').write_text(json.dumps({**r,key:value}))
                with self.subTest(key=key),self.assertRaisesRegex(ValueError,'Report provenance'):v.verify_report(root,p,'4'*64)

    def test_retoked_case_cannot_claim_approval_or_omit_png(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);p,c,r=self.evidence(root)
            for key,value in [('scientificApproval',True),('runtimeSha256','8'*64),('screenshots',[])]:
                (root/'case.json').write_text(json.dumps({**c,key:value}));changed=copy.deepcopy(r);changed['cases'][0]['sha256']=v.sha((root/'case.json').read_bytes());(root/'report.json').write_text(json.dumps(changed))
                with self.subTest(key=key),self.assertRaises(ValueError):v.verify_report(root,p,'4'*64)

    def test_pixels_tamper_is_rejected_even_with_retoked_case(self):
        with tempfile.TemporaryDirectory()as tmp:
            root=Path(tmp);p,c,r=self.evidence(root);(root/'image.png').write_bytes(b'altered')
            with self.assertRaisesRegex(ValueError,'PNG bytes'):v.verify_report(root,p,'4'*64)

    def test_actual_controller_guard_rejects_stale_dom_constant_output_and_clock(self):
        import subprocess
        code=r"""
        import assert from 'node:assert/strict';
        import {assertObservedControls as check} from './tools/corpus_engineering/experiment_visibility_ui.mjs';
        const row={record:{control:{min:0,max:1,step:.1}},hasClock:true,clockInput:false};
        const state={kind:'grid',x:.3},m={actualDOMControls:[{name:'x',value:'0.3'}],sourceReplayedX:.1+.2,sourceReplayedClockTime:0,clockReadout:'0'};
        check(m,state,row);
        for(const bad of [{...m,actualDOMControls:[{name:'x',value:'0'}]},{...m,sourceReplayedX:0},{...m,sourceReplayedClockTime:1},{...m,clockReadout:'1'}])assert.throws(()=>check(bad,state,row));
        const aux={...m,actualDOMControls:[{name:'x',value:'.3'},{name:'middle',value:'2',step:'.25'},{name:'circuit',value:'closed'}]};
        check(aux,{kind:'auxiliary',x:.3,middle:2,circuit:'closed'},row);
        assert.throws(()=>check(aux,{kind:'auxiliary',x:.3,middle:-2,circuit:'closed'},row));
        assert.throws(()=>check(aux,{kind:'auxiliary',x:.3,middle:2,circuit:'open'},row));
        const timeline={...row,clockInput:true};
        check({...m,actualDOMControls:[{name:'x',value:'.125'}],sourceReplayedX:.125,sourceReplayedClockTime:.125,clockReadout:'.125'},{kind:'clock',x:.3,time:.125},timeline);
        assert.throws(()=>check({...m,sourceReplayedX:90-1e-8,actualDOMControls:[{name:'x',value:String(90-1e-8)}]},{kind:'grid',x:90},{record:{control:{min:0,step:5}},hasClock:false,clockInput:false}));
        check({actualDOMControls:[{name:'x',value:'273.25'}],sourceReplayedX:273.25},{kind:'grid',x:273.25},{record:{control:{min:273.15,step:.1}},hasClock:false,clockInput:false});
        """
        subprocess.run(['node','--input-type=module','-e',code],cwd=APP,check=True,capture_output=True)

    def test_final_real_draft_pilot_and_clock_34_have_bound_provenance(self):
        root=PROPOSAL/'final-raw-dom-34-diagnostic';p=v.load(root/'prepared.json');r=v.load(root/'terminal-receipt.json')
        self.assertEqual(r['observedExitCode'],0);self.assertEqual(len(p['expectedCaseKeys']),34)
        self.assertEqual(v.sha((root/'experiment_visibility_ui.mjs').read_bytes()),r['protocolSha256'])
        self.assertEqual(r['protocolSha256'],v.sha((APP/'tools/corpus_engineering/experiment_visibility_ui.mjs').read_bytes()))
        report=v.verify_report(root,p,r['protocolSha256'])
        cases=[v.load(root/c['file'])for c in report['cases']]
        pilot=next(c for c in cases if c['id']=='SIM-C4-L10-02'and c['caseKey'].endswith('|setup'))
        self.assertEqual(len(pilot['questions']),4)
        draft=next(c for c in cases if c['variant']=='draft'and c['caseKey'].endswith('|setup'))
        self.assertEqual(len(draft['questions']),2)
        self.assertEqual({c['sourceReplayedClockTime']for c in cases if c.get('interaction',{}).get('kind')=='clock'},{0,1,2})
        self.assertEqual(report['activityCredit'],0)

    def test_actual_bounded_32_case_run_is_not_full_cohort_approval(self):
        root=PROPOSAL/'initial-32-diagnostic-frozen';p=v.load(root/'prepared.json');r=v.load(root/'terminal-receipt.json')
        self.assertEqual(len(p['expectedCaseKeys']),32);self.assertEqual(len(p['records']),1)
        self.assertEqual(r['observedExitCode'],0);self.assertEqual(p['scope'],'DIAGNOSTIC_SUBSET_PROTOCOL_EXECUTION_NOT_COMPLETE_C6_OR_139')
        self.assertEqual(r['activityCredit'],0);self.assertEqual(v.sha((root/'protocol-executed.mjs').read_bytes()),r['protocolSha256'])
        self.assertEqual(v.sha((root/'supervisor-executed.py').read_bytes()),r['supervisorSha256'])
        v.verify_report(root,p,r['protocolSha256'])

if __name__=='__main__':unittest.main()
