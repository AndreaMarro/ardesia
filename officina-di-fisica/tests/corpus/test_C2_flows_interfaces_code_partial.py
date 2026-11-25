"""Bounded original C2 code-only proofs; do not convert successful tests to UI credit."""
from copy import deepcopy
from fractions import Fraction as F
from types import SimpleNamespace
import json,unittest
from unittest.mock import patch
import sympy as sp
from tools.corpus_engineering import experiments_C2_flows_interfaces_code_verifier as m
from tools.corpus_engineering import experiments_C2_code_partial_review as boundary

GROUPS={'bernoulli':(58,0,{'SIM-C2-L006-02'}),
 'viscosity-poiseuille':(116,190,{'SIM-C2-L007-03','SIM-C2-L007-04','SIM-C2-L008-02'}),
 'networks':(24,0,set()),'capillarity':(72,0,set())}

class RemainingC2CodePartial(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources=boundary.source_rows()
        cls.proofs={g:json.loads((boundary.APP/m.for_group(g).PROOF).read_text()) for g in GROUPS}

    def test_four_bounded_reports_retain_every_known_failure_and_zero_credit(self):
        total=0
        for group,(states,frames,negative) in GROUPS.items():
            r=m.report(group);self.assertEqual((r['installedStates'],r['clockFrames']),(states,frames))
            self.assertTrue(all(x['mathOk'] for x in r['records']))
            self.assertTrue(all(x['installedConsumerCode']['installedScalarTasksAndClocksOk'] for x in r['records']),r)
            self.assertEqual({x['id'] for x in r['records'] if not x['installedConsumerCode']['geometryCodeOk']},negative)
            total+=len(r['records'])
            for x in r['records']:self.assertFalse(x['ok']);self.assertEqual(x['UI'],'NOT_RUN');self.assertEqual(x['activityCredit'],0)
            self.assertFalse(r['overallComplete']);self.assertEqual(r['acceptedCount'],0)
        self.assertEqual(total,21)

    def test_every_inverse_domain_and_legal_grid_including_nonunique_cases(self):
        for key,s in m.SPECS.items():
            lo,hi,step=s[:3]
            if key=='SIM-C2-L007-02':
                with self.assertRaises(ValueError):m.inverse_inputs(key,6)
                continue
            for i in range(round((hi-lo)/step)+1):
                x=sp.Rational(str(lo))+i*sp.Rational(str(step));values=m.inverse_inputs(key,m.exact_value(key,x))
                self.assertTrue(any(sp.simplify(v-x)==0 for v in values),(key,x,values))
        self.assertEqual(m.inverse_inputs('SIM-C2-L008-02',sp.Rational(1,2)),(2,3))
        self.assertEqual(m.inverse_inputs('SIM-C2-L010-03',-5),(120,))
        for key,y in [('SIM-C2-L009-01',2),('SIM-C2-L009-03',10),('SIM-C2-L010-05',0),('SIM-C2-L010-03',11)]:
            with self.assertRaises(ValueError):m.inverse_inputs(key,y)
        for bad in [sp.I,sp.oo,-sp.oo,sp.nan]:
            with self.assertRaises(ValueError):m.inverse_inputs('SIM-C2-L010-03',bad)

    def test_each_actual_record_rejects_scalar_key_unit_prompt_graph_or_secondary_drift(self):
        for group in GROUPS:
            family=m.for_group(group)
            for original in self.proofs[group]['records']:
                key=original['id'];single=SimpleNamespace(**vars(family));single.SPECS={key:family.SPECS[key]}
                self.assertTrue(boundary.compare(single,{'records':[original]},self.sources)[key]['installedScalarTasksAndClocksOk'])
                for mode in ('scalar','key','unit','prompt','graph','secondary'):
                    row=deepcopy(original)
                    if mode=='scalar':row['cases'][0]['solve']['y']+=1
                    elif mode=='key':row['assessment'][0]['value']+=1
                    elif mode=='unit':row['assessment'][0]['unit']='WRONG'
                    elif mode=='prompt':row['assessment'][1]['prompt']='Unreviewed different question'
                    elif mode=='graph':row['cases'][0]['graphs'][0]['series'][0]['points'][0][1]+=1
                    else:row['cases'][0]['readings'][2][2]='WRONG'
                    result=boundary.compare(single,{'records':[row]},self.sources)[key]
                    self.assertFalse(result['installedScalarTasksAndClocksOk'],(key,mode))

    def test_real_geometry_negatives_have_numeric_witnesses_not_fictional_UI(self):
        pitot=next(r for r in self.proofs['bernoulli']['records'] if r['id']=='SIM-C2-L006-02')
        failed=[c['x'] for c in pitot['cases'] if m.geometry_errors(pitot['id'],c['x'],c['elements'])]
        self.assertEqual(failed,[4.5,4.75,5])
        top=next(c for c in pitot['cases'] if c['x']==5)
        self.assertTrue(any(e.get('kind')=='rod' and boundary.near(e.get('r'),.062) and boundary.near(e['b'][1],F(4629,1600)) for e in top['elements']))
        for key in ('SIM-C2-L007-03','SIM-C2-L007-04'):
            row=next(r for r in self.proofs['viscosity-poiseuille']['records'] if r['id']==key)
            self.assertTrue(all(any('AXIS_TIP_INSIDE_OPAQUE_PLATE' in e for e in m.geometry_errors(key,c['x'],c['elements'])) for c in row['cases']))
        row=next(r for r in self.proofs['viscosity-poiseuille']['records'] if r['id']=='SIM-C2-L008-02')
        self.assertTrue(any('ratio is6 instead of8' in e for e in m.cross_case_geometry_errors(row['id'],row)))
        # Controlled test fixture only; no product/candidate is modified or approved.
        fixed=deepcopy(row)
        for e in fixed['cases'][0]['elements']:
            if e.get('kind')=='arrow':e['b'][0]=e['a'][0]+(e['b'][0]-e['a'][0])*4/3
        self.assertEqual(m.cross_case_geometry_errors(row['id'],fixed),[])

    def test_clock_local_velocity_and_disclosed_primary_or_proof_guards(self):
        self.assertEqual(m.clock_value('SIM-C2-L007-05',sp.Rational(11,20),5),sp.Rational(837,20))
        p=deepcopy(self.proofs['viscosity-poiseuille']);row=next(r for r in p['records'] if r['id']=='SIM-C2-L007-05')
        row['cases'][0]['clockSamples'][-1]['signal']=-1
        self.assertFalse(boundary.compare(m.for_group('viscosity-poiseuille'),p,self.sources)[row['id']]['installedScalarTasksAndClocksOk'])
        family=m.for_group('networks');family.PROOF_SHA256='0'*64
        with self.assertRaises(ValueError):boundary.report(family)
        with self.assertRaises(ValueError):m.for_group('UNKNOWN')

if __name__=='__main__':unittest.main()
