"""Source-first thermal cycles: independent conservation, domains, editions and adversarial proofs."""
import ast
from copy import deepcopy
from fractions import Fraction
import importlib
import json
from pathlib import Path
import unittest
from hypothesis import given,settings,strategies as st
import sympy as sp
from tools.corpus_engineering.pipeline import digest,sha
from tools.corpus_engineering.batches import assert_record_identity
APP=Path(__file__).resolve().parents[2]
POS=st.builds(Fraction,st.integers(1,60),st.integers(1,20))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)

class ThermalCyclesIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('cyclic_work','engine_efficiency','engine_average_power','carnot_efficiency','refrigerator_cop'):
            m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_bytes())
            b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes())
            cls.rows.append((m,p,b))

    def test_actual_fresh_and_saved_identity_all80(self):
        primary=APP/'editorial/reviews/u5-thermal-cycles-158-162-primary-source-only.md'
        for m,p,b in self.rows:
            fresh=m.report(p,b);saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes())
            for report in (fresh,saved):
                with self.subTest(batch=m.BATCH):
                    assert_record_identity(report['records'],m.EXPECTED_IDS,p,b)
                    self.assertEqual(len(report['records']),16)
                    self.assertTrue(all(r['ok'] for r in report['records']))
                    self.assertTrue(all(r['verificationMode'] in ('EXACT_ORACLE','AI_CONCEPTUAL') for r in report['records']))
                    self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()))
                    self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
                    self.assertEqual(report['packageSha256'],m.REVIEWED_PACKAGE_SHA256)
                    self.assertEqual(report['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
                    self.assertEqual(report['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()))
                    self.assertEqual(report['publication'],'DRAFT');self.assertEqual(report['humanApproval'],'NOT_RUN')
                    self.assertTrue(report['source']['path'].endswith('U5-02.json'))
            self.assertEqual(fresh,saved)

    def test_130_adversarial_mutations_with_rebound_keys_and_replaced_tokens(self):
        for m,p,b in self.rows:
            before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
            audit=m.mutation_audit(p,b,APP/'editorial/assets')
            self.assertEqual(audit['caseCount'],26);self.assertTrue(audit['allRejected'])
            self.assertEqual(sum(c['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for c in audit['cases']),16)
            self.assertTrue(any(c['case']=='wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced' for c in audit['cases']))
            self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))

    def test_saved_identity_rejects_invented_mode_hash_and_publication(self):
        for m,p,b in self.rows:
            original=m.report(p,b)['records']
            for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
                rows=deepcopy(original);rows[0][field]=value
                with self.assertRaises(ValueError):assert_record_identity(rows,m.EXPECTED_IDS,p,b)

    @BOUNDED
    @given(cold=POS,gap=POS,next_cold=POS,next_gap=POS,factor=POS)
    def test_cycle_first_law_inverses_and_two_motor_domains(self,cold,gap,next_cold,next_gap,factor):
        m=self.rows[0][0];hot=cold+gap;hot_b=next_cold+next_gap
        work=m.cycle_net(hot,cold)
        self.assertEqual(work,gap);self.assertEqual(m.cycle_hot(work,cold),hot);self.assertEqual(m.cycle_cold(hot,work),cold)
        self.assertEqual(m.cycle_scaled(hot,cold,hot_b/hot,next_cold/cold),next_gap/gap)
        self.assertEqual(m.cycle_scaled(hot,cold,factor,factor),factor)
        self.assertEqual(m.constrained_cold(work,hot/cold),cold)

    @BOUNDED
    @given(cold=POS,gap=POS,next_cold=POS,next_gap=POS,factor=POS)
    def test_engine_efficiency_complements_inverses_and_scale(self,cold,gap,next_cold,next_gap,factor):
        m=self.rows[1][0];hot=cold+gap;hot_b=next_cold+next_gap
        eta=m.efficiency(hot,cold)
        self.assertGreater(eta,0);self.assertLess(eta,1)
        self.assertEqual(eta,gap/hot);self.assertEqual(m.hot_from_eta(cold,eta),hot);self.assertEqual(m.cold_from_eta(hot,eta),cold)
        self.assertEqual(m.efficiency_scaled(hot,cold,factor,factor),1)
        self.assertEqual(m.efficiency_scaled(hot,cold,hot_b/hot,next_cold/cold),Fraction(next_gap,hot_b)/eta)
        self.assertEqual(m.redundant_efficiency(hot/cold,eta),'infinite')
        # Existence of compatible reservoirs; none are secretly fixed across the trials.
        tc=Fraction(300);th=2*tc/(1-eta)
        self.assertLess(eta,1-tc/th)

    @BOUNDED
    @given(heat=POS,duration=POS,a=POS,b=POS)
    def test_average_power_exact_units_inverses_and_common_scale(self,heat,duration,a,b):
        m=self.rows[2][0];power=m.average_power(heat,duration)
        self.assertEqual(power,heat/(4*duration))
        self.assertEqual(m.heat_from_power(power,duration),heat);self.assertEqual(m.duration_from_power(heat,power),duration)
        self.assertEqual(m.power_scaled(heat,duration,a,b),a/b)
        self.assertEqual(m.power_scaled(heat,duration,a,a),1)
        self.assertEqual(m.redundant_power(heat/duration,power),'infinite')

    @BOUNDED
    @given(cold=POS,gap=POS,next_cold=POS,next_gap=POS,factor=POS)
    def test_carnot_absolute_temperatures_entropy_ratio_and_two_domains(self,cold,gap,next_cold,next_gap,factor):
        m=self.rows[3][0];hot=cold+gap;hot_b=next_cold+next_gap
        eta=m.carnot_efficiency(hot,cold)
        self.assertGreater(eta,0);self.assertLess(eta,1)
        self.assertEqual(m.hot_from_eta(cold,eta),hot);self.assertEqual(m.cold_from_eta(hot,eta),cold)
        self.assertEqual(m.carnot_scaled(hot,cold,factor,factor),1)
        self.assertEqual(m.carnot_scaled(hot,cold,hot_b/hot,next_cold/cold),Fraction(next_gap,hot_b)/eta)
        self.assertEqual(m.redundant_temperature(hot/cold,eta),'infinite')
        heat_in=Fraction(1);heat_out=heat_in*cold/hot
        self.assertEqual(heat_out/cold-heat_in/hot,0)
        self.assertEqual((heat_in-heat_out)/heat_in,eta)

    @BOUNDED
    @given(cold_heat=POS,work=POS,a=POS,b=POS)
    def test_cop_energy_balance_inverses_and_permitted_values_above_one(self,cold_heat,work,a,b):
        m=self.rows[4][0];cop=m.refrigerator_cop(cold_heat,work)
        self.assertEqual(cop,cold_heat/work)
        self.assertEqual(m.cold_from_cop(cop,work),cold_heat);self.assertEqual(m.work_from_cop(cold_heat,cop),work)
        self.assertEqual(m.cop_scaled(cold_heat,work,a,b),a/b)
        self.assertEqual(m.cop_scaled(cold_heat,work,a,a),1)
        self.assertEqual(m.redundant_cop(cop,cop),'infinite')
        hot_heat=cold_heat+work
        self.assertEqual(hot_heat/work-cop,1)
        tc=Fraction(300);th=tc*(1+1/(2*cop))
        self.assertGreater(hot_heat/th-cold_heat/tc,0)

    @BOUNDED
    @given(first=POS,increment=POS,gain=POS,offset=st.integers(-20,20))
    def test_independent_affine_and_proportional_calibration_exact_units(self,first,increment,gain,offset):
        second=first+increment;third=first+2*increment
        for m,_,_ in self.rows:
            unit='joule' if m.FAMILY=='cyclic-work' else 'watt' if m.FAMILY=='engine-average-power' else 'dimensionless'
            found=m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit)
            self.assertEqual(found,(gain,offset,third,third))

    def test_60_domain_and_inverse_rejections(self):
        cycle,eta,power,carnot,cop=(r[0] for r in self.rows)
        cases=[
          (cycle.cycle_net,(1,1)),(cycle.cycle_net,(1,2)),(cycle.cycle_net,(1,0)),(cycle.cycle_hot,(0,1)),
          (cycle.cycle_hot,(1,-1)),(cycle.cycle_cold,(1,1)),(cycle.cycle_cold,(1,0)),(cycle.cycle_scaled,(2,1,0,1)),
          (cycle.cycle_scaled,(2,1,1,3)),(cycle.constrained_cold,(0,2)),(cycle.constrained_cold,(1,1)),(cycle.constrained_cold,(1,-2)),
          (eta.efficiency,(1,1)),(eta.efficiency,(1,2)),(eta.efficiency,(1,0)),(eta.hot_from_eta,(1,1)),
          (eta.hot_from_eta,(1,0)),(eta.hot_from_eta,(-1,Fraction(1,2))),(eta.cold_from_eta,(1,-1)),(eta.cold_from_eta,(0,Fraction(1,2))),
          (eta.efficiency_scaled,(2,1,1,3)),(eta.efficiency_scaled,(2,1,-1,1)),(eta.redundant_efficiency,(1,Fraction(1,2))),(eta.redundant_efficiency,(2,Fraction(1,3))),
          (power.average_power,(1,0)),(power.average_power,(0,1)),(power.average_power,(1,-1)),(power.heat_from_power,(0,1)),
          (power.heat_from_power,(1,0)),(power.duration_from_power,(1,0)),(power.duration_from_power,(-1,1)),(power.power_scaled,(1,1,0,1)),
          (power.power_scaled,(1,1,1,-1)),(power.redundant_power,(0,1)),(power.redundant_power,(40,0)),(power.redundant_power,(40,11)),
          (carnot.carnot_efficiency,(1,1)),(carnot.carnot_efficiency,(1,2)),(carnot.carnot_efficiency,(1,0)),(carnot.hot_from_eta,(1,1)),
          (carnot.hot_from_eta,(1,0)),(carnot.hot_from_eta,(-1,Fraction(1,2))),(carnot.cold_from_eta,(1,-1)),(carnot.cold_from_eta,(0,Fraction(1,2))),
          (carnot.carnot_scaled,(2,1,1,3)),(carnot.carnot_scaled,(2,1,-1,1)),(carnot.redundant_temperature,(1,Fraction(1,2))),(carnot.redundant_temperature,(2,Fraction(1,3))),
          (cop.refrigerator_cop,(1,0)),(cop.refrigerator_cop,(0,1)),(cop.refrigerator_cop,(1,-1)),(cop.cold_from_cop,(0,1)),
          (cop.cold_from_cop,(1,0)),(cop.work_from_cop,(1,0)),(cop.work_from_cop,(-1,1)),(cop.cop_scaled,(1,1,0,1)),
          (cop.cop_scaled,(1,1,1,-1)),(cop.redundant_cop,(0,1)),(cop.redundant_cop,(1,0)),(cop.redundant_cop,(5,4))]
        self.assertEqual(len(cases),60)
        for fn,args in cases:
            with self.subTest(function=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)

    def test_manual_means_reparameterization_and_irreducible_physics(self):
        cycle,eta,power,carnot,cop=(r[0] for r in self.rows)
        self.assertEqual((cycle.cycle_net(100,40)+cycle.cycle_net(200,60))/2,cycle.cycle_net(150,50))
        self.assertEqual((eta.efficiency(100,20)+eta.efficiency(2,1))/2,Fraction(13,20))
        self.assertEqual(eta.efficiency(51,Fraction(21,2)),Fraction(27,34))
        self.assertEqual((power.average_power(80,2)+power.average_power(1,1))/2,Fraction(41,8))
        self.assertEqual((2*power.average_power(80,2)+power.average_power(1,1))/3,Fraction(27,4))
        self.assertEqual(carnot.carnot_efficiency(3,1),carnot.carnot_efficiency(900,300))
        self.assertEqual(carnot.oracle()[12],Fraction(3,2))
        self.assertNotEqual(carnot.oracle()[12],Fraction(1,200))
        self.assertEqual(carnot.carnot_efficiency(650,250),Fraction(8,13))
        self.assertEqual((cop.refrigerator_cop(100,20)+cop.refrigerator_cop(1,1))/2,3)
        self.assertEqual(cop.refrigerator_cop(Fraction(101,2),Fraction(21,2)),Fraction(101,21))
        self.assertGreater(cop.refrigerator_cop(100,20),1)
        th,tc=sp.symbols('th tc',positive=True)
        self.assertEqual(sp.diff(1-tc/th,th),tc/th**2)
        self.assertEqual(sp.diff(1-tc/th,tc),-1/th)

    def test_preserved_negative159_and_distinct_terminal_final(self):
        folder=APP/'editorial/author-evidence/engine-efficiency-159-negative-320'
        manifest=json.loads((folder/'manifest.json').read_bytes())
        self.assertEqual(manifest['processExitCode'],1);self.assertFalse(manifest['completionMarkerCreated'])
        self.assertFalse((folder/'completion.json').exists())
        for name,checksum in manifest['files'].items():self.assertEqual(sha((folder/name).read_bytes()),checksum)
        report=json.loads((folder/'report.json').read_bytes())
        failures=[(r['id'],r['width']) for r in report['records'] if r['violations'] or r['overflow']>1 or any(f['scroll']>f['width']+1 or f['typeset']>f['width']+1 for f in r['formulas'])]
        self.assertEqual(failures,[('AR-u5-engine-efficiency-03',320)])
        final=json.loads((APP/'editorial/author-evidence/engine-efficiency-159-completion.json').read_bytes())
        self.assertEqual(final['terminalExitCode'],0);self.assertIsNone(final['signal'])
        self.assertEqual(final['reportSha256'],sha((APP/'editorial/author-evidence/engine-efficiency-159-browser.json').read_bytes()))
        self.assertNotEqual(manifest['initialPackageFileSha256'],final['context']['packageFileSha256'] if 'context' in final else final['packageFileSha256'])

    def test_dependency_boundary_and_bounded_exact_parser(self):
        for m,_,_ in self.rows:
            tree=ast.parse(Path(m.__file__).read_text())
            imports=[]
            for node in ast.walk(tree):
                if isinstance(node,ast.Import):imports.extend(x.name for x in node.names)
                if isinstance(node,ast.ImportFrom):imports.append(node.module or '')
            self.assertFalse(any('authoring' in item for item in imports))
            self.assertEqual(m.parse_literal('−4/5'),-sp.Rational(4,5))
            for value in ['float("nan")','1/0','2**1000000','__import__("os")','nan','inf','1+1','1/2/3']:
                with self.assertRaises(ValueError):m.parse_literal(value)

if __name__=='__main__':unittest.main()
