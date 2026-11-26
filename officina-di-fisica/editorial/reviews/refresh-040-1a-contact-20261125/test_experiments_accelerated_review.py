"""Four accelerated originals: manual tasks, flight domains and circular frames."""
from copy import deepcopy
import json
import subprocess
import unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import experiments_accelerated_activity_verifier as review
from tools.corpus_engineering.pipeline import canonical,digest,sha
from tools.corpus_engineering.batches import assert_activity_identity


class AcceleratedExperimentsReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw=subprocess.check_output(['git','show',review.SOURCE_REF+':'+review.SOURCE_PATH],cwd=review.APP)
        cls.sources={r['id']:r for r in json.loads(cls.raw) if r['id'] in review.READ_SOURCE_SHA256}
        cls.actual=review.runtime_values(cls.sources);cls.physics=review.independent_checks()

    def test_four_complete_originals_without_human_or_publication_escalation(self):
        with patch.object(review,'runtime_values',wraps=review.runtime_values) as fresh:
            first=review.report(self.sources);second=review.report(self.sources)
        self.assertEqual(fresh.call_count,2);self.assertEqual(first,second)
        self.assertEqual(first,json.loads(canonical(first)))
        self.assertEqual((first['acceptedCount'],first['failedCount'],first['draftReviewedCount']),(4,0,0))
        self.assertEqual(first['sourceManualityIssueIds'],[])
        self.assertEqual(first['consumerInterfaceIssueIds'],[])
        self.assertEqual(sum(len(r['checks']) for r in first['records']),49)
        assert_activity_identity(first['records'],set(review.READ_SOURCE_SHA256),self.sources)
        bad=deepcopy(first['records']);bad[0]['humanApproval']='APPROVED'
        with self.assertRaises(ValueError):assert_activity_identity(bad,set(review.READ_SOURCE_SHA256),self.sources)
        for r in first['records']:
            self.assertEqual(r['humanApproval'],'NOT_RUN');self.assertEqual(r['publicationAction'],'NONE')
            self.assertTrue(r['originalEditionRetained'])
            self.assertEqual(r['sourceScientificReview']['ok'],r['id'] not in review.SOURCE_ISSUES)
            self.assertEqual(r['consumerReview']['ok'],r['id'] not in review.CONSUMER_ISSUES)
            self.assertTrue(r['runtimeComparison']['numericPhysicsMatches'])
            self.assertTrue(all(c['ok'] for c in r['checks'] if c.get('mode')=='OBSERVED_INPUT_FORMAT_CONFORMANCE'))
        self.assertEqual([r['runtimeComparison']['caseCount'] for r in first['records']],[17,21,11,11])

    def test_source_dependencies_version_and_entire_runtime_are_bound(self):
        self.assertEqual(sha(self.raw),review.SOURCE_FILE_SHA256)
        self.assertEqual((review.APP/'content/esperienze-C1.json').read_bytes(),self.raw)
        self.assertEqual({k:digest(v) for k,v in self.sources.items()},review.READ_SOURCE_SHA256)
        self.assertEqual(review.runtime_hashes(),review.READ_RUNTIME)
        self.assertEqual(review.runtime_fingerprint(review.APP)['sha256'],review.READ_RUNTIME_PROFILE_SHA256)
        self.assertEqual(len(review.READ_RUNTIME),22)
        self.assertIn('static/js/banchi/voci/assessment-selection.js',review.READ_RUNTIME)
        self.assertIn('server/domain/experiment_assessment.py',review.READ_RUNTIME)
        self.assertEqual(self.sources['SIM-C1-L004-03']['version'],1)

    def test_unknown_sources_cannot_select_or_execute_an_engine(self):
        for key in review.SPECS:
            sources=deepcopy(self.sources);sources[key]['interpretation']+=' changed'
            with patch.object(review,'runtime_values') as execute:
                changed=next(r for r in review.verify(sources) if r['id']==key)
                execute.assert_not_called();self.assertFalse(changed['sourceScientificReview']['ok'])
                self.assertFalse(changed['ok'])
            del sources[key]
            with self.assertRaises(ValueError):review.verify(sources)
        for field,value in [('kind','example'),('review','HUMAN APPROVED'),('engine',{'id':'unseen','version':'1.0.0'})]:
            sources=deepcopy(self.sources);sources['SIM-C1-L004-01'][field]=value
            with patch.object(review,'runtime_values') as execute:
                self.assertTrue(all(not r['ok'] for r in review.verify(sources)));execute.assert_not_called()

    def test_stale_missing_or_changed_runtime_rejects_before_execution(self):
        for file in review.READ_RUNTIME:
            changed=dict(review.READ_RUNTIME);changed[file]='MISSING'
            with patch.object(review,'runtime_hashes',return_value=changed),patch.object(review,'runtime_values') as execute:
                self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)));execute.assert_not_called()
        with patch.object(review,'runtime_fingerprint',return_value={'sha256':'0'*64}),patch.object(review,'runtime_values') as execute:
            self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)));execute.assert_not_called()
        with patch.object(review,'runtime_values',side_effect=ValueError('failed actual consumer')):
            self.assertTrue(all(not r['ok'] for r in review.verify(self.sources)))
        changed=dict(review.READ_RUNTIME);changed[next(iter(changed))]='0'*64
        with patch.object(review,'runtime_values',return_value=self.actual),patch.object(review,'runtime_hashes',side_effect=[review.READ_RUNTIME,changed]):
            self.assertTrue(all('Runtime changed during check; discard evidence' in r['errors'] for r in review.verify(self.sources)))

    def test_empty_or_failed_independent_physics_never_passes(self):
        with patch.object(review,'runtime_values',return_value=self.actual):
            for key in review.SPECS:
                for value in ([],[{'ok':False,'claim':'wrong independent math','dimension':{}}]):
                    physics=deepcopy(self.physics);physics[key]=value
                    with patch.object(review,'independent_checks',return_value=physics):
                        row=next(r for r in review.verify(self.sources) if r['id']==key)
                        self.assertFalse(row['ok']);self.assertFalse(row['sourceScientificReview']['ok'])

    def test_actual_law_domains_assignments_graphs_and_geometry_are_challenged(self):
        for key in review.SPECS:
            actual=deepcopy(self.actual);actual[key]['cases'][0]['output']['y']=999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'].pop()
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['params'][0]['step']*=2
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['assessment'][1]['value']=999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'][0]['graphs'][0]['series'][0]['points'][0][1]=999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual)
            element=next(e for e in actual[key]['cases'][0]['elements'] if e.get('kind')==('box' if key.endswith('01') else 'ball'))
            element['p'][0]+=1
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        actual=deepcopy(self.actual);actual['SIM-C1-L004-02']['formatRoundtrip'][0]['parsed']=1000
        with patch.object(review,'runtime_values',return_value=actual):
            self.assertFalse(next(r for r in review.verify(self.sources) if r['id']=='SIM-C1-L004-02')['ok'])

    def test_actual_clocks_frames_signals_units_and_circle_directions_are_challenged(self):
        for key in review.SPECS:
            actual=deepcopy(self.actual);actual[key]['cases'][0]['timeSamples'].pop()
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'][0]['timeSamples'][0]['output']['y']=999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['clock']['input']=not actual[key]['clock']['input']
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        for key in ('SIM-C1-L004-03','SIM-C1-L004-04'):
            actual=deepcopy(self.actual);actual[key]['cases'][0]['timeSamples'][1]['signal']=999
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'][0]['timeSamples'][0]['readings'][3][2]='m/s'
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
            actual=deepcopy(self.actual);actual[key]['cases'][0]['graphs'][1]['y']='Wrong quantity (m/s)'
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        for key,color in [('SIM-C1-L004-01',0x7350b0),('SIM-C1-L004-02',0xb94f48),('SIM-C1-L004-04',0x7350b0)]:
            actual=deepcopy(self.actual);arrows=[e for e in actual[key]['cases'][0]['timeSamples'][2]['elements'] if e.get('kind')=='arrow' and e.get('c')==color]
            arrows[0]['b'][1]+=1
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])
        actual=deepcopy(self.actual);ball=next(e for e in actual['SIM-C1-L004-04']['cases'][0]['timeSamples'][1]['elements'] if e.get('kind')=='ball');ball['p'][1]+=1
        self.assertFalse(review.compare_runtime(actual)['SIM-C1-L004-04']['ok'])

        # A preserved vector delta is insufficient: these former origins hid tips.
        for key,color,shift in [('SIM-C1-L004-02',0xb94f48,.64),('SIM-C1-L004-04',0x7350b0,.13),('SIM-C1-L004-04',0x147979,.12)]:
            actual=deepcopy(self.actual)
            for case in actual[key]['cases']:
                for frame in [case]+case['timeSamples']:
                    for element in frame['elements']:
                        if element.get('kind')=='arrow' and element.get('c')==color:
                            element['a'][1]-=shift;element['b'][1]-=shift
            self.assertFalse(review.compare_runtime(actual)[key]['ok'])

    def test_exact_manual_arithmetic_and_model_scope_are_independent(self):
        for checks in self.physics.values():
            self.assertTrue(all(c['ok'] for c in checks))
            for c in checks:self.assertFalse(sp.sympify(c['independentExact']).atoms(sp.Float))
        expected=[4,sp.Rational(319,20),7,sp.Rational(49,8)]
        self.assertEqual([review.exact_value(k,v[5]) for k,v in review.SPECS.items()],expected)
        self.assertEqual(review.exact_value('SIM-C1-L004-01',0),0)
        self.assertEqual(review.exact_value('SIM-C1-L004-02',2),0)
        self.assertEqual(sum(c['clockSampleCount'] for c in review.compare_runtime(self.actual).values()),240)
        circle=self.physics['SIM-C1-L004-04']
        self.assertTrue(next(c for c in circle if c['claim']=='acceleration inward parallelminusposition')['ok'])
        period=next(c for c in circle if c['claim']=='period times angularspeed exact2pi')
        self.assertEqual(period['scope'],'instrument_model_not_extra_assigned_period_calculation')

    def test_observed_diagnostic_proof_is_bound_and_not_scientific_approval(self):
        evidence=review.consumer_evidence();self.assertTrue(evidence['ok'])
        self.assertFalse(evidence['scientificApproval']);self.assertEqual(evidence['observedCaseCount'],52)
        for field in ('READ_BROWSER_PROOF_SHA256','READ_BROWSER_PROTOCOL_SHA256'):
            with patch.object(review,field,'0'*64):self.assertFalse(review.consumer_evidence()['ok'])
        with patch.object(review,'runtime_values',return_value=self.actual),patch.object(review,'consumer_evidence',return_value={'ok':False}):
            self.assertTrue(all(not r['ok'] and not r['consumerReview']['ok'] for r in review.verify(self.sources)))

if __name__=='__main__':unittest.main()
