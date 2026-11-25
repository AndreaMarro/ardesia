"""Negative probes of partial C3 science/code checks. No fake UI or credit."""
import copy,json,unittest
from unittest.mock import patch
from tools.corpus_engineering import experiments_C3_code_partial_verifier as v

class C3CodePartial(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import subprocess
        raw=subprocess.check_output(['git','show',v.REF+':'+v.SOURCE],cwd=v.APP)
        cls.sources={r['id']:r for r in json.loads(raw)}
        cls.proofs={g:json.loads((v.APP/('editorial/reviews/C3-'+g+'-installed-code-1a35-20261125.json')).read_bytes()) for g in v.GROUPS}

    def test_all36_complete_bounded_code_checks_without_ui_credit(self):
        ids=[];states=frames=0;failed=[]
        for g in v.GROUPS:
            report=v.report(g)
            self.assertFalse(report['ok']);self.assertFalse(report['overallComplete'])
            self.assertEqual(report['activityCredit'],0);self.assertEqual(report['UI'],'NOT_RUN')
            for r in report['records']:
                ids.append(r['id']);states+=r['gridCount'];frames+=r['clockSampleCount']
                self.assertEqual(r['errors'],[]);self.assertFalse(r['ok']);self.assertEqual(len(r['actualTasks']),2)
                if not r['consumerCodeGeometryOk']:failed.append(r['id'])
        self.assertEqual(len(ids),36);self.assertEqual(len(set(ids)),36)
        self.assertEqual((states,frames),(624,745))
        self.assertEqual(set(failed),{'SIM-C3-L01-04','SIM-C3-L09-01'})

    def test_every_id_wrong_scalar_and_actual_transfer_rejected(self):
        for g,p in self.proofs.items():
            for i,record in enumerate(p['records']):
                with self.subTest(id=record['id']):
                    changed=copy.deepcopy(p)
                    changed['records'][i]['cases'][0]['solve']['y']+=1
                    changed['records'][i]['assessment'][1]['value']+=1
                    row=v.compare(g,changed,self.sources)[i]
                    self.assertIn('Installedscalarwrong',row['errors'])
                    self.assertIn('Actualtask/math/unit/prompt/manualinputwrong',row['errors'])

    def test_clock_instantaneous_signal_is_not_final_reading(self):
        p=copy.deepcopy(self.proofs['paths']);r=p['records'][1]
        # At final2L, t0 is1L/p100, finalreadingp50.
        c=next(c for c in r['cases'] if c['x']==2)
        self.assertEqual(c['clockSamples'][0]['solve']['y'],50)
        self.assertEqual(c['clockSamples'][0]['signal'],100)
        c['clockSamples'][0]['signal']=50
        self.assertIn('Clockframewrong',v.compare('paths',p,self.sources)[1]['errors'])

    def test_clock_duration_input_units_graph_and_parser_mutations(self):
        p=copy.deepcopy(self.proofs['calorimetry']);r=p['records'][4]
        r['cases'][1]['duration']+=1
        r['cases'][1]['clockSamples'][1]['instantPhysicalInput']+=1
        r['cases'][1]['readings'][1][2]='kg'
        r['cases'][1]['graphs'][0]['series'][0]['points'][0][1]+=1
        errors=v.compare('calorimetry',p,self.sources)[4]['errors']
        for e in ('Clockcoveragewrong','Clockframewrong','Outputreading/unitwrong','Controlgraphwrong'):self.assertIn(e,errors)
        p=copy.deepcopy(self.proofs['state']);p['records'][0]['assessmentFormat'][0]['parsed']=80000
        self.assertIn('Displayroundtripwrong',v.compare('state',p,self.sources)[0]['errors'])

    def test_missing_duplicate_foreign_id_source_and_unit_are_rejected(self):
        for mode in ('missing','duplicate','foreign'):
            p=copy.deepcopy(self.proofs['state'])
            if mode=='missing':p['records'].pop()
            elif mode=='duplicate':p['records'][0]=p['records'][1]
            else:p['records'][0]['id']='SIM-C2-L01-01'
            with self.assertRaises(ValueError):v.compare('state',p,self.sources)
        p=copy.deepcopy(self.proofs['state']);p['records'][0]['sourceRecord']['version']=2
        p['records'][0]['params'][0]['step']=.25;p['records'][0]['assessment'][0]['unit']='cm²'
        errors=v.compare('state',p,self.sources)[0]['errors']
        for e in ('Source/versionidentitydrift','Control/default/gridchanged','Actualtask/math/unit/prompt/manualinputwrong'):self.assertIn(e,errors)

    def test_geometric_negative_precise_containment_limits(self):
        rows=v.compare('state',self.proofs['state'],self.sources)
        obs=rows[3]['geometryObservations']
        self.assertEqual([o['input'] for o in obs],[-50,-45])
        for o in obs:
            self.assertLess((o['tip'][1]-o['bulbCenter'][1])**2+o['rodRadius']**2,o['bulbRadius']**2)
        rows=v.compare('entropy',self.proofs['entropy'],self.sources)
        self.assertEqual([o['input'] for o in rows[0]['geometryObservations']],[75,80])
        self.assertIn('NOT wholecone',rows[0]['geometryObservations'][0]['limit'])

    def test_exact_hand_bounds_radiation_rational_sum_and_domains(self):
        import sympy as S
        self.assertEqual(v.exact('L05-03',350),S.Rational(626535,1600))
        self.assertEqual(v.exact('L07-01',6),S.Rational(90535,1386))
        self.assertEqual(v.exact('L07-05','2.5'),8*S.sqrt(10))
        self.assertLess(S.Rational(316,100)**2,10);self.assertGreater(S.Rational(317,100)**2,10)
        self.assertEqual(v.exact('L04-03',0),0);self.assertEqual(v.exact('L04-03',54),100)
        self.assertEqual([v.exact('L10-03',i) for i in range(5)],[1,4,6,4,1])
        self.assertEqual(v.exact('L09-04',500),0)
        self.assertEqual(v.exact('L10-04',-60),-S.Rational(1,10))
        self.assertEqual(len(v.dimensional_checks()),8)

    def test_secondary_physics_and_mesh_evidence_drift(self):
        p=copy.deepcopy(self.proofs['entropy'])
        p['records'][6]['cases'][2]['readings'][2][1]+=1
        self.assertIn('Secondaryreadingwrong',v.compare('entropy',p,self.sources)[6]['errors'])
        p=copy.deepcopy(self.proofs['calorimetry'])
        p['records'][6]['cases'][-1]['readings'][2][1]+=1
        self.assertIn('Secondaryreadingwrong',v.compare('calorimetry',p,self.sources)[6]['errors'])
        p=copy.deepcopy(self.proofs['paths']);p['records'][1]['clock']['unit']='Pa'
        self.assertIn('Clocklabels/units/pacewrong',v.compare('paths',p,self.sources)[1]['errors'])
        with patch.object(v,'MESH_SHA','0'*64):
            with self.assertRaisesRegex(ValueError,'Meshsupplementchanged'):v.report('state')

    def test_carnot_path_drift_and_runtime_proof_drift_fail_closed(self):
        p=copy.deepcopy(self.proofs['entropy'])
        p['records'][3]['cases'][0]['graphs'][1]['series'][1]['points'][1][1]+=.01
        self.assertIn('Carnotpathinvariantwrong',v.compare('entropy',p,self.sources)[3]['errors'])
        with patch('tools.corpus_engineering.runtime_fingerprint.runtime_fingerprint',return_value={'sha256':'unknown'}):
            with self.assertRaisesRegex(ValueError,'Runtimeepoch'):v.report('state')
        with patch.dict(v.PROOFS,{'state':'0'*64}):
            with self.assertRaisesRegex(ValueError,'Installedproof'):v.report('state')
        with self.assertRaises(ValueError):v.report('allunbounded')

if __name__=='__main__':unittest.main()
