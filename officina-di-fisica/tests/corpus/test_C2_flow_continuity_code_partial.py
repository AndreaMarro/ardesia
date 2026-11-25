"""Real code proofs and independent physics; existing incoming-arrow failure is retained."""
from copy import deepcopy
from fractions import Fraction as F
import json,unittest
from unittest.mock import patch
from tools.corpus_engineering import experiments_flow_continuity_code_verifier as m
from tools.corpus_engineering import experiments_C2_code_partial_review as boundary

class FlowContinuityCodePartial(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof=json.loads((boundary.APP/m.PROOF).read_text());cls.sources=boundary.source_rows()

    def test_all_assigned_math_and_clock_states_with_explicit_existing_code_failure(self):
        report=m.report();self.assertEqual((report['installedStates'],report['clockFrames']),(68,130))
        self.assertTrue(all(row['mathOk'] for row in report['records']))
        self.assertTrue(all(row['installedConsumerCode']['installedScalarTasksAndClocksOk'] for row in report['records']))
        failed=[row['id'] for row in report['records'] if not row['installedConsumerCode']['geometryCodeOk']]
        self.assertEqual(failed,['SIM-C2-L005-05'])
        errors=report['records'][-1]['installedConsumerCode']['geometryErrors'];self.assertEqual(len(errors),13)
        self.assertTrue(all('incoming arrow requested by source is absent' in e for e in errors))
        for row in report['records']:
            self.assertFalse(row['ok']);self.assertFalse(row['overallComplete']);self.assertEqual(row['UI'],'NOT_RUN')
        self.assertEqual((report['acceptedCount'],report['activityCredit']),(0,0))

    def test_each_law_and_inverse_reconstructs_every_legal_control(self):
        for key,(lo,hi,step,*_) in m.SPECS.items():
            for index in range(round((hi-lo)/step)+1):
                x=F(str(lo))+index*F(str(step));self.assertEqual(m.inverse_input(key,m.exact_value(key,x)),x)
            with self.assertRaises(ValueError):m.inverse_input(key,-1)
        with self.assertRaises(ValueError):m.exact_value('SIM-C2-L005-03',0)
        with self.assertRaises(ValueError):m.inverse_input('SIM-C2-L005-03',0)
        for value in ['nan','inf','I']:
            with self.assertRaises(ValueError):m.inverse_input('SIM-C2-L005-01',value)
        self.assertEqual(m.clock_value('SIM-C2-L005-04',6,5),F(45,2))
        self.assertEqual(m.exact_value('SIM-C2-L005-04',6),3)

    def test_each_consumer_rejects_changed_scalar_task_unit_graph_and_control(self):
        for key in m.SPECS:
            for mode in ('scalar','task','unit','prompt','graph','control','partial'):
                p=deepcopy(self.proof);row=next(r for r in p['records'] if r['id']==key)
                if mode=='scalar':row['cases'][0]['solve']['y']+=1
                elif mode=='task':row['assessment'][0]['value']+=1
                elif mode=='unit':row['assessment'][0]['unit']='WRONG'
                elif mode=='prompt':row['assessment'][1]['prompt']='A different unreviewed question'
                elif mode=='graph':row['cases'][0]['graphs'][0]['series'][0]['points'][0][1]+=1
                elif mode=='control':row['params'][0]['max']+=1
                else:row['cases'].pop()
                result=boundary.compare(m,p,self.sources)[key]
                self.assertFalse(result['installedScalarTasksAndClocksOk'],(key,mode))

    def test_local_probe_speed_cannot_be_replaced_by_mean_or_wrong_tracer(self):
        key='SIM-C2-L005-04'
        for mode in ('signal','readout_unit','tracer'):
            p=deepcopy(self.proof);row=next(r for r in p['records'] if r['id']==key)
            c=next(c for c in row['cases'] if c['x']==6);frame=c['clockSamples'][-1]
            if mode=='signal':frame['signal']=15
            elif mode=='readout_unit':frame['readings'][-1][2]='m'
            else:next(e for e in frame['elements'] if e.get('kind')=='ball' and e.get('c')==0xb94f48)['p'][0]+=.1
            result=boundary.compare(m,p,self.sources)[key]
            self.assertFalse(result['geometryCodeOk'] if mode=='tracer' else result['installedScalarTasksAndClocksOk'])

    def test_missing_duplicate_ids_or_changed_proof_never_get_credit(self):
        for mode in ('missing','duplicate'):
            p=deepcopy(self.proof)
            if mode=='missing':p['records'].pop()
            else:p['records'][-1]=deepcopy(p['records'][0])
            with self.assertRaises(ValueError):boundary.compare(m,p,self.sources)
        with patch.object(m,'PROOF_SHA256','0'*64):
            with self.assertRaises(ValueError):m.report()

if __name__=='__main__':unittest.main()
