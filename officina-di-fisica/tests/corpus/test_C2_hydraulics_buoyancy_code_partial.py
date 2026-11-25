"""Exact source/code probes only; never substitute for actual UI evidence."""
from copy import deepcopy
import json,unittest
from unittest.mock import patch
from tools.corpus_engineering import experiments_hydraulics_buoyancy_code_verifier as r

class HydraulicsBuoyancyCodePartial(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.proof=json.loads((r.APP/r.PROOF).read_text())

    def test_exact_checks_and_all77_installed_states(self):
        checks=r.exact_checks()
        self.assertEqual(set(checks),set(r.SPECS))
        self.assertTrue(all(c['ok'] for rows in checks.values() for c in rows))
        result=r.compare_installed(self.proof)
        self.assertTrue(all(row['ok'] for row in result.values()),result)
        self.assertEqual(sum(row['caseCount'] for row in result.values()),77)

    def test_every_id_rejects_rebound_scalar_graph_key_unit_partial_or_prediction(self):
        for key in r.SPECS:
            for mode in ('scalar','graph','key','unit','partial','prediction','clock'):
                p=deepcopy(self.proof);row=next(x for x in p['records'] if x['id']==key)
                if mode=='scalar':row['cases'][0]['solve']['y']+=1
                elif mode=='graph':row['cases'][0]['graphs'][0]['series'][0]['points'][0][1]+=1
                elif mode=='key':row['assessment'][0]['value']+=1
                elif mode=='unit':row['assessment'][0]['unit']='WRONG'
                elif mode=='partial':row['cases'].pop()
                elif mode=='prediction':row['prediction']['correct']=0
                else:row['clock']={'duration':5}
                self.assertFalse(r.compare_installed(p)[key]['ok'],(key,mode))

    def test_piston_probe_and_all_immersed_fraction_counterexamples(self):
        for key in r.SPECS:
            p=deepcopy(self.proof);row=next(x for x in p['records'] if x['id']==key);e=row['cases'][0]['elements']
            if key=='SIM-C2-L003-02':next(v for v in e if v.get('kind')=='rod' and v.get('c')==0x726d81 and r.near(v.get('r'),.58))['a'][1]+=.1
            elif key=='SIM-C2-L003-03':next(v for v in e if v.get('kind')=='ball' and v.get('c')==0x7350b0)['p'][1]+=.1
            else:next(v for v in e if v.get('kind')=='box' and v.get('c')==0xd49332)['p'][1]+=.1
            self.assertFalse(r.compare_installed(p)[key]['ok'],key)

    def test_partial_proof_never_claims_activity_credit_or_UI(self):
        result=r.report()
        self.assertEqual(result['acceptedCount'],0);self.assertEqual(result['activityCredit'],0)
        self.assertFalse(result['overallComplete']);self.assertEqual(len(result['records']),5)
        for row in result['records']:
            self.assertTrue(row['mathAndCodeOk']);self.assertFalse(row['ok'])
            self.assertEqual(row['UI'],'NOT_RUN');self.assertEqual(row['humanApproval'],'NOT_RUN')
            self.assertEqual(row['publicationAction'],'NONE')

    def test_duplicate_ids_and_unknown_epoch_are_rejected(self):
        p=deepcopy(self.proof);p['records'][-1]=deepcopy(p['records'][0])
        with self.assertRaises(ValueError):r.compare_installed(p)
        with patch.object(r,'RUNTIME','0'*64):
            with self.assertRaises(ValueError):r.report()

if __name__=='__main__':unittest.main()
