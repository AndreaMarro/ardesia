"""Withdrawn acceptance must survive new editions and require explicit fresh closure."""
from copy import deepcopy
from pathlib import Path
import json
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock,patch
from tools.corpus_engineering import batches,evidence
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.runtime_fingerprint import runtime_fingerprint
APP=Path(__file__).resolve().parents[2]

class AcceptanceWithdrawals(unittest.TestCase):
    def setUp(self):
        self.home=tempfile.TemporaryDirectory();self.addCleanup(self.home.cleanup)
        self.app=Path(self.home.name)/'app'
        for folder in ('editorial/batches','editorial/reviews','editorial/acceptance','contracts','static'):(self.app/folder).mkdir(parents=True)
        (self.app/'static/model.txt').write_text('fixture-runtime-v1')
        self.verifier=self.app/'verifier.py';self.verifier.write_text('# fixture scientific verifier')
        self.a={'id':'fixture-a','verifier':'fixture_verifier','activityIds':['SIM-test']}
        self.q={'id':'fixture-q','verifier':'fixture_verifier','questionIds':['AR-test']}
        self.source={'SIM-test':{'id':'SIM-test','kind':'experiment','version':1}}
        self.arow={'id':'SIM-test','ok':True,'sourceSha256':digest(self.source['SIM-test']),
          'humanApproval':'NOT_RUN','publicationAction':'NONE','originalEditionRetained':True,
          'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':'1+1=2',
          'physicalAssumptions':'fixture only','pedagogicalReview':'fixture only'}
        self.areport={'records':[deepcopy(self.arow)],'verifierSha256':sha(self.verifier.read_bytes())}
        self.package={'schema':'astra/1','records':[{'id':'AR-test','answer':{'type':'numeric','value':2},'blocks':[]}],'assets':[]}
        self.bindings=[{'id':'AR-test','sourceSha256':'a'*64}]
        self.qrow={'id':'AR-test','ok':True,'candidateSha256':digest(self.package['records'][0]),'sourceSha256':'a'*64,
          'humanApproval':'NOT_RUN','publication':'DRAFT','verificationMode':'EXACT_ORACLE',
          'reviewedSignature':'b'*64,'assetChecksums':{}}
        self.qreport={'records':[deepcopy(self.qrow)],'verifierSha256':sha(self.verifier.read_bytes())}
        self.integration={'packageSha256':digest(self.package)}
        self.write('editorial/reviews/fixture-a.json',self.areport);self.write('editorial/reviews/fixture-q.json',self.qreport)
        self.write('editorial/reviews/fixture-q-integration.json',self.integration)
        self.write('editorial/batches/fixture-q.json',self.package);self.write('editorial/batches/fixture-q-bindings.json',self.bindings)
        self.browser=self.app/'editorial/reviews/fixture-q-browser.json';self.browser.write_text('{}')
        self.diagnostic=self.app/'editorial/reviews/diagnostic.json';self.diagnostic.write_text('{"finding":"hidden normal"}\n')
        self.registry={'schemaVersion':'1.0.0','batches':[self.q],'activityBatches':[self.a]}
        self.ledger={'schemaVersion':'1.0.0','withdrawals':[{
          'withdrawalId':'visibility-001','batchId':'fixture-a','recordId':'SIM-test',
          'withdrawnAt':'2026-11-25T12:00:00Z','reason':'Normal vector hidden; acceptance withdrawn.',
          'evidence':{'path':'editorial/reviews/diagnostic.json','sha256':sha(self.diagnostic.read_bytes())},
          'humanApproval':'NOT_RUN','publicationAction':'NONE'}]}
        self.configured()
        self.report_call=Mock(side_effect=lambda selected:deepcopy(self.areport))
        self.verify_call=Mock(side_effect=lambda package,bindings:deepcopy(self.qreport['records']))
        self.module=SimpleNamespace(__file__=str(self.verifier),report=self.report_call,verify=self.verify_call)
        self.addCleanup(patch.stopall)
        patch.object(batches.importlib,'import_module',return_value=self.module).start()
        patch.object(batches,'exercise',side_effect=lambda name:deepcopy(self.integration)).start()
        patch.object(batches,'validate_browser_preview',return_value=(self.browser,3)).start()

    def write(self,path,value):
        file=self.app/path;file.write_text(json.dumps(value,sort_keys=True)+'\n');return file
    def configured(self):
        file=self.write('editorial/acceptance/withdrawals-v1.json',self.ledger)
        self.registry['acceptanceWithdrawals']={'path':str(file.relative_to(self.app)),'sha256':sha(file.read_bytes())}
        self.write('editorial/batches/registry.json',self.registry)
    def close(self,**updates):
        closure={'batchId':'fixture-a','recordId':'SIM-test','closedAt':'2026-11-25T13:00:00Z',
          'reason':'Independent positive scientific review of the corrected runtime.',
          'runtimeSha256':runtime_fingerprint(self.app)['sha256'],
          'scientificReport':{'path':'editorial/reviews/fixture-a.json','sha256':sha((self.app/'editorial/reviews/fixture-a.json').read_bytes())}}
        closure.update(updates);self.ledger['withdrawals'][0]['closure']=closure;self.configured()
    def activity(self):return batches.validate_activity_batch(self.a,self.source,self.app)
    def question(self):return batches.validate_batch(self.q,self.app)

    def test_open_withdrawal_blocks_before_any_approval_and_survives_changed_runtime(self):
        for change in (False,True):
            if change:(self.app/'static/model.txt').write_text('completely-new-runtime')
            with self.assertRaisesRegex(ValueError,'[Ww]ithdraw|[Rr]itiro'):self.activity()
        self.report_call.assert_not_called()

    def test_withdrawal_is_by_id_even_if_moved_to_another_batch(self):
        changed=dict(self.a,id='new-group')
        self.write('editorial/reviews/new-group.json',self.areport)
        with self.assertRaises(ValueError):batches.validate_activity_batch(changed,self.source,self.app)
        self.report_call.assert_not_called()

    def test_question_withdrawal_blocks_before_verifier_even_after_candidate_changes(self):
        self.ledger['withdrawals'][0].update(batchId='fixture-q',recordId='AR-test');self.configured()
        self.package['records'][0]['answer']['value']=3;self.write('editorial/batches/fixture-q.json',self.package)
        with self.assertRaisesRegex(ValueError,'[Ww]ithdraw|[Rr]itiro'):self.question()
        self.verify_call.assert_not_called()

    def test_other_ids_and_absent_configuration_remain_backward_compatible(self):
        result=self.question();self.assertNotIn('acceptanceWithdrawals',result)
        del self.registry['acceptanceWithdrawals'];self.write('editorial/batches/registry.json',self.registry)
        result=self.activity();self.assertNotIn('acceptanceWithdrawals',result)
        self.assertEqual(result['records'],self.areport['records'])
        self.assertEqual(batches.load_registry(self.app/'editorial/batches/registry.json'),[self.q])

    def test_missing_malformed_wrong_hash_and_external_ledger_fail_closed(self):
        ref=deepcopy(self.registry['acceptanceWithdrawals'])
        for kind in ('missing','malformed','wrong_hash','absolute','parent','symlink'):
            with self.subTest(kind=kind):
                self.configured();file=self.app/ref['path']
                if kind=='missing':file.unlink()
                if kind=='malformed':file.write_text('{bad json')
                if kind=='wrong_hash':file.write_text('{"schemaVersion":"1.0.0","withdrawals":[]}')
                if kind in ('absolute','parent','symlink'):
                    outside=Path(self.home.name)/'outside.json';outside.write_text(json.dumps(self.ledger))
                    self.registry['acceptanceWithdrawals']={'path':str(outside) if kind=='absolute' else '../outside.json','sha256':sha(outside.read_bytes())}
                    if kind=='symlink':
                        link=self.app/'escape.json';link.symlink_to(outside);self.registry['acceptanceWithdrawals']['path']='escape.json'
                    self.write('editorial/batches/registry.json',self.registry)
                with self.assertRaises(ValueError):self.activity()
                if file.is_symlink():file.unlink()
        self.report_call.assert_not_called()

    def test_schema_malformed_and_duplicate_withdrawals_fail_closed(self):
        original=deepcopy(self.ledger)
        for kind in ('version','unknown','missing_id','duplicate','human_approved'):
            self.ledger=deepcopy(original)
            if kind=='version':self.ledger['schemaVersion']='2.0.0'
            if kind=='unknown':self.ledger['silentAutoResolve']=True
            if kind=='missing_id':del self.ledger['withdrawals'][0]['recordId']
            if kind=='duplicate':self.ledger['withdrawals'].append(deepcopy(self.ledger['withdrawals'][0]))
            if kind=='human_approved':self.ledger['withdrawals'][0]['humanApproval']='APPROVED'
            self.configured()
            with self.subTest(kind=kind),self.assertRaises(ValueError):self.activity()
        self.report_call.assert_not_called()

    def test_valid_explicit_closure_keeps_audit_and_runs_standard_verifier(self):
        self.close();result=self.activity();self.report_call.assert_called_once()
        audit=result['acceptanceWithdrawals'];row=audit['withdrawals'][0]
        self.assertEqual(audit['ledger']['sha256'],self.registry['acceptanceWithdrawals']['sha256'])
        self.assertEqual(row['recordId'],'SIM-test');self.assertEqual(row['withdrawalSha256'],digest({k:v for k,v in self.ledger['withdrawals'][0].items() if k!='closure'}))
        self.assertEqual(row['closureSha256'],digest(self.ledger['withdrawals'][0]['closure']))
        self.assertEqual(row['closure']['scientificReport']['sha256'],sha((self.app/'editorial/reviews/fixture-a.json').read_bytes()))
        self.assertEqual(row['closure']['runtimeSha256'],runtime_fingerprint(self.app)['sha256'])
        self.assertEqual(audit['humanApproval'],'NOT_RUN');self.assertEqual(audit['publicationAction'],'NONE')

    def test_stale_runtime_wrong_group_id_report_hash_or_path_cannot_close(self):
        for kind in ('runtime','group','id','hash','path','negative','report_id','early'):
            self.close();c=self.ledger['withdrawals'][0]['closure']
            if kind=='runtime':c['runtimeSha256']='0'*64
            if kind=='group':c['batchId']='other-group'
            if kind=='id':c['recordId']='other-id'
            if kind=='hash':c['scientificReport']['sha256']='0'*64
            if kind=='path':c['scientificReport']['path']='editorial/reviews/other.json';self.write(c['scientificReport']['path'],self.areport)
            if kind=='early':c['closedAt']='2026-11-24T13:00:00Z'
            if kind=='report_id':
                bad=deepcopy(self.areport);bad['records'][0]['id']='other-id'
                file=self.write('editorial/reviews/fixture-a.json',bad);c['scientificReport']['sha256']=sha(file.read_bytes())
            if kind=='negative':
                bad=deepcopy(self.areport);bad['records'][0]['ok']=False
                file=self.write('editorial/reviews/fixture-a.json',bad);c['scientificReport']['sha256']=sha(file.read_bytes())
            self.configured()
            with self.subTest(kind=kind),self.assertRaises(ValueError):self.activity()
            self.write('editorial/reviews/fixture-a.json',self.areport)

    def test_positive_closure_cannot_bypass_fresh_or_saved_identity(self):
        for kind in ('fresh_failure','wrong_source','stale_saved'):
            self.close()
            if kind=='fresh_failure':self.report_call.side_effect=ValueError('fresh scientific failure')
            else:
                wrong=deepcopy(self.areport);wrong['records'][0]['sourceSha256']='0'*64
                self.report_call.side_effect=lambda selected:deepcopy(wrong if kind=='wrong_source' else self.areport)
                if kind=='stale_saved':
                    self.write('editorial/reviews/fixture-a.json',wrong);self.close()
            with self.subTest(kind=kind),self.assertRaises(ValueError):self.activity()
            self.write('editorial/reviews/fixture-a.json',self.areport)
            self.report_call.side_effect=lambda selected:deepcopy(self.areport)

    def test_diagnostic_missing_corrupt_or_external_cannot_be_credited(self):
        self.close();original=deepcopy(self.ledger)
        for kind in ('missing','hash','external'):
            self.ledger=deepcopy(original);record=self.ledger['withdrawals'][0]
            if kind=='missing':record['evidence']['path']='editorial/reviews/absent.json'
            if kind=='hash':record['evidence']['sha256']='0'*64
            if kind=='external':record['evidence']['path']='../outside.json'
            self.configured()
            with self.subTest(kind=kind),self.assertRaises(ValueError):self.activity()

    def test_registry_loader_rejects_referenced_bad_ledger(self):
        (self.app/'editorial/acceptance/withdrawals-v1.json').unlink()
        with self.assertRaises(ValueError):batches.load_registry(self.app/'editorial/batches/registry.json')

    def test_runtime_or_report_change_during_fresh_validation_is_rejected(self):
        for kind in ('runtime','report','ledger'):
            self.close()
            def changed(selected):
                if kind=='runtime':(self.app/'static/model.txt').write_text('runtime-changed-in-verifier')
                if kind=='report':(self.app/'editorial/reviews/fixture-a.json').write_text('{}')
                if kind=='ledger':(self.app/'editorial/acceptance/withdrawals-v1.json').write_text('{}')
                return deepcopy(self.areport)
            self.report_call.side_effect=changed
            with self.subTest(kind=kind),self.assertRaises(ValueError):self.activity()
            self.write('editorial/reviews/fixture-a.json',self.areport)


    def test_compiler_preserves_activity_withdrawal_closure_audit(self):
        self.close()
        raw=json.dumps(list(self.source.values())).encode()
        entry={'id':'SIM-test','sourceSha256':digest(self.source['SIM-test']),
          'provenance':{'commit':'a'*40,'path':'content/fixture.json','fileSha256':sha(raw)},
          'calculatorFreeReview':'NOT_RUN'}
        with patch.object(evidence,'git_bytes',return_value=raw):
            meta=evidence.apply_activity_evidence(self.app,self.app,[entry])
        self.assertEqual(meta['reviewedActivityCount'],1)
        compiled=entry['evidence'][0]['acceptanceWithdrawals']
        self.assertEqual(compiled,self.activity()['acceptanceWithdrawals'])
        self.assertEqual(entry['humanApproval'],'NOT_RUN')
        self.assertEqual(entry['state'],'REVIEWED_EXISTING_EDITION')
        del self.registry['acceptanceWithdrawals'];self.write('editorial/batches/registry.json',self.registry)
        legacy={'id':'SIM-test','sourceSha256':digest(self.source['SIM-test']),
          'provenance':entry['provenance'],'calculatorFreeReview':'NOT_RUN'}
        with patch.object(evidence,'git_bytes',return_value=raw):
            old_meta=evidence.apply_activity_evidence(self.app,self.app,[legacy])
        self.assertNotIn('acceptanceWithdrawals',legacy['evidence'][0])
        expected=deepcopy(entry);del expected['evidence'][0]['acceptanceWithdrawals']
        self.assertEqual(legacy,expected);self.assertEqual(meta,old_meta)

    def test_compiler_preserves_question_audit_and_open_blocks_compilation(self):
        self.ledger['withdrawals'][0].update(batchId='fixture-q',recordId='AR-test')
        self.package['records'][0].update(skill='C1-L001',family='fixture')
        self.qreport['records'][0]['candidateSha256']=digest(self.package['records'][0])
        self.bindings[0].update(sourceRef='a'*40,sourceId='test')
        self.integration['packageSha256']=digest(self.package)
        self.write('editorial/batches/fixture-q.json',self.package)
        self.write('editorial/batches/fixture-q-bindings.json',self.bindings)
        self.write('editorial/reviews/fixture-q.json',self.qreport)
        self.write('editorial/reviews/fixture-q-integration.json',self.integration)
        recovered={'report':{'records':[]}}
        (self.app/'editorial/recovery').mkdir()
        self.write('editorial/recovery/selection-199.json',recovered)
        entry={'id':'AR-test','sourceId':'test','sourceSha256':'a'*64,
          'provenance':{'commit':'a'*40},'review':{},'evidence':[]}
        self.configured()
        with patch.object(evidence,'recover',return_value=recovered):
            with self.assertRaises(ValueError):evidence.apply_evidence(self.app,self.app,'a'*40,[entry],[])
        self.assertNotIn('state',entry);self.verify_call.assert_not_called()
        closure={'batchId':'fixture-q','recordId':'AR-test','closedAt':'2026-11-25T13:00:00Z',
          'reason':'Independent positive fixture review','runtimeSha256':runtime_fingerprint(self.app)['sha256'],
          'scientificReport':{'path':'editorial/reviews/fixture-q.json','sha256':sha((self.app/'editorial/reviews/fixture-q.json').read_bytes())}}
        self.ledger['withdrawals'][0]['closure']=closure;self.configured()
        with patch.object(evidence,'recover',return_value=recovered):
            result,revisions=evidence.apply_evidence(self.app,self.app,'a'*40,[entry],[])
        self.verify_call.assert_called_once();self.assertEqual(result['revisedDraftCount'],1)
        audit=entry['evidence'][0]['acceptanceWithdrawals']
        self.assertEqual(audit['withdrawals'][0]['closureSha256'],digest(closure))
        self.assertEqual(entry['state'],'REVISED_DRAFT');self.assertEqual(entry['review']['humanApproval'],'NOT_RUN')
        self.assertEqual(result['newlyPublishedQuestionCount'],0)


    def test_question_closure_still_rejects_fresh_candidate_identity(self):
        self.ledger['withdrawals'][0].update(batchId='fixture-q',recordId='AR-test')
        self.ledger['withdrawals'][0]['closure']={
          'batchId':'fixture-q','recordId':'AR-test','closedAt':'2026-11-25T13:00:00Z',
          'reason':'Positive fixture report','runtimeSha256':runtime_fingerprint(self.app)['sha256'],
          'scientificReport':{'path':'editorial/reviews/fixture-q.json','sha256':sha((self.app/'editorial/reviews/fixture-q.json').read_bytes())}}
        self.configured()
        wrong=deepcopy(self.qreport['records']);wrong[0]['candidateSha256']='0'*64
        self.verify_call.side_effect=lambda package,bindings:deepcopy(wrong)
        with self.assertRaisesRegex(ValueError,'stale identity'):self.question()
        self.verify_call.assert_called_once()

    def test_duplicate_json_fields_are_corrupt_even_with_fresh_file_hash(self):
        file=self.app/'editorial/acceptance/withdrawals-v1.json'
        file.write_text('{"schemaVersion":"1.0.0","withdrawals":[],"withdrawals":[]}')
        self.registry['acceptanceWithdrawals']['sha256']=sha(file.read_bytes())
        self.write('editorial/batches/registry.json',self.registry)
        with self.assertRaises(ValueError):self.activity()
        self.report_call.assert_not_called()


    def test_later_batch_cannot_reopen_earlier_acceptance_before_compilation(self):
        self.close()
        other={'id':'fixture-other','verifier':'fixture_verifier','activityIds':['SIM-other']}
        self.registry['activityBatches'].append(other);self.configured()
        source_other={'id':'SIM-other','kind':'experiment','version':1}
        sources={**self.source,'SIM-other':source_other}
        other_report=deepcopy(self.areport)
        other_report['records'][0].update(id='SIM-other',sourceSha256=digest(source_other))
        self.write('editorial/reviews/fixture-other.json',other_report)
        raw=json.dumps(list(sources.values())).encode()
        entries=[{'id':key,'sourceSha256':digest(value),'calculatorFreeReview':'NOT_RUN',
          'provenance':{'commit':'a'*40,'path':'content/fixture.json','fileSha256':sha(raw)}} for key,value in sources.items()]
        def verifier(selected):
            if 'SIM-other' in selected:
                del self.ledger['withdrawals'][0]['closure'];self.configured()
                return deepcopy(other_report)
            return deepcopy(self.areport)
        self.report_call.side_effect=verifier
        with patch.object(evidence,'git_bytes',return_value=raw):
            with self.assertRaisesRegex(ValueError,'[Ww]ithdraw'):
                evidence.apply_activity_evidence(self.app,self.app,entries)
        self.assertTrue(all(row['calculatorFreeReview']=='NOT_RUN' for row in entries))

if __name__=='__main__':unittest.main()
