"""Independent source-first physical review, actual edition identity and domain properties."""
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
class NetworkEnergyIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('identical_branches','junction_balance','mixing_mass_balance','hydraulic_power','bernoulli_horizontal'):
            m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_text());b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_text())
            cls.rows.append((m,p,b))
    def test_actual_fresh_and_saved_report_identity_all80(self):
        for m,p,b in self.rows:
            with self.subTest(batch=m.BATCH):
                fresh=m.report(p,b)
                saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_text())
                for report in (fresh,saved):
                    assert_record_identity(report['records'],m.EXPECTED_IDS,p,b)
                    self.assertEqual(len(report['records']),16)
                    self.assertTrue(all(r['ok'] for r in report['records']))
                    self.assertTrue(all(r['verificationMode'] in ('EXACT_ORACLE','AI_CONCEPTUAL') for r in report['records']))
                    self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()))
                    self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
                    self.assertEqual(report['packageSha256'],m.REVIEWED_PACKAGE_SHA256)
                    self.assertEqual(report['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
                    self.assertEqual(report['publication'],'DRAFT');self.assertEqual(report['humanApproval'],'NOT_RUN')
                    self.assertTrue(report['source']['path'].endswith('U3-03.json'))
                self.assertEqual(fresh,saved)
    def test_125_mutations_with_rebound_keys_and_replaced_reading_tokens(self):
        for m,p,b in self.rows:
            with self.subTest(batch=m.BATCH):
                before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
                a=m.mutation_audit(p,b,APP/'editorial/assets');self.assertEqual(a['caseCount'],25);self.assertTrue(a['allRejected'])
                self.assertEqual(sum(c['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for c in a['cases']),16)
                self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))
    def test_saved_identity_rejects_stale_hash_or_invented_mode(self):
        for m,p,b in self.rows:
            original=m.report(p,b)['records']
            for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
                rows=deepcopy(original);rows[0][field]=value
                with self.subTest(batch=m.BATCH,field=field):
                    with self.assertRaises(ValueError):assert_record_identity(rows,m.EXPECTED_IDS,p,b)
    @BOUNDED
    @given(total=POS,count=st.integers(1,60),area=POS,multiplier=st.integers(1,8),area_factor=POS)
    def test_integer_equal_branch_balance_and_scaling(self,total,count,area,multiplier,area_factor):
        m=self.rows[0][0]
        speed=m.physical_speed(total,count,area)
        self.assertEqual(count*area*speed,total)
        self.assertEqual(area*speed,total/count)
        new=m.physical_speed(total,count*multiplier,area*area_factor)
        self.assertEqual(new/speed,1/(multiplier*area_factor))
        self.assertEqual(total/(area*speed),count)
    @BOUNDED
    @given(first=POS,second=POS,extra=POS)
    def test_two_outlet_balance_and_signs(self,first,second,extra):
        m=self.rows[1][0];inlet=first+second
        self.assertEqual(m.physical_outlet(inlet,first),second)
        self.assertEqual(m.physical_outlet(inlet+extra,first),second+extra)
        mean_inlet=(inlet+inlet+extra)/2
        self.assertEqual(m.physical_outlet(mean_inlet,first),(second+second+extra)/2)
        # Holding total fixed, a larger first outlet reduces the second.
        shift=second/2
        self.assertEqual(m.physical_outlet(inlet,first+shift),second-shift)
    @BOUNDED
    @given(first=POS,second=POS,low=POS,contrast=POS,factor=POS)
    def test_tracer_mass_balance_convexity_and_common_scaling(self,first,second,low,contrast,factor):
        m=self.rows[2][0];high=low+contrast
        mixed=m.physical_concentration(first,second,low,high)
        self.assertEqual(mixed*(first+second),low*first+high*second)
        self.assertLess(low,mixed);self.assertLess(mixed,high)
        self.assertEqual(m.physical_concentration(first*factor,second*factor,low,high),mixed)
        self.assertEqual(second*(high-mixed)/(mixed-low),first)
        self.assertEqual(first*(mixed-low)/(high-mixed),second)
    @BOUNDED
    @given(dp=POS,flow=POS,time=POS,pressure_factor=POS,flow_factor=POS)
    def test_pump_work_rate_and_exact_SI_conversion(self,dp,flow,time,pressure_factor,flow_factor):
        m=self.rows[3][0];power=m.physical_power(dp,flow)
        transported_volume_liters=flow*time
        # In SI, kPa -> Pa and L -> m³ cancel exactly in work.
        work_joules=(1000*dp)*(transported_volume_liters/1000)
        self.assertEqual(work_joules/time,power)
        self.assertEqual(m.physical_power(dp*pressure_factor,flow*flow_factor)/power,pressure_factor*flow_factor)
        self.assertEqual(power/flow,dp)
    @BOUNDED
    @given(inlet_speed=POS,outlet_speed=POS,density=POS,area=POS,margin=POS,floor=POS)
    def test_horizontal_streamline_energy_and_compatible_areas(self,inlet_speed,outlet_speed,density,area,margin,floor):
        m=self.rows[4][0]
        kinetic_change=density*(outlet_speed**2-inlet_speed**2)/2000
        inlet_pressure=floor+margin+abs(kinetic_change)
        outlet_pressure=m.physical_pressure(inlet_speed,outlet_speed,inlet_pressure,density,floor)
        self.assertGreater(outlet_pressure,floor)
        self.assertEqual(inlet_pressure+density*inlet_speed**2/2000,outlet_pressure+density*outlet_speed**2/2000)
        outlet_area=area*inlet_speed/outlet_speed
        self.assertEqual(area*inlet_speed,outlet_area*outlet_speed)
        inverse_squared=outlet_speed**2+2000*(outlet_pressure-inlet_pressure)/density
        self.assertEqual(inverse_squared,inlet_speed**2)
    def test_strict_physical_domains_and_integer_count_counterexamples(self):
        branches,junction,mixing,pump,bernoulli=(x[0] for x in self.rows)
        bad=[(branches.physical_speed,(24,Fraction(5,2),2)),(branches.physical_speed,(24,0,2)),
             (branches.physical_speed,(24,-2,2)),(branches.physical_speed,(24,2,0)),
             (junction.physical_outlet,(4,4)),(junction.physical_outlet,(3,4)),(junction.physical_outlet,(10,0)),
             (mixing.physical_concentration,(0,1)),(mixing.physical_concentration,(1,-1)),
             (mixing.physical_concentration,(1,1,3,1)),
             (pump.physical_power,(0,3)),(pump.physical_power,(-2,3)),(pump.physical_power,(2,0)),
             (bernoulli.physical_pressure,(0,4)),(bernoulli.physical_pressure,(2,20)),
             (bernoulli.physical_pressure,(2,4,100,1000,95)),
             (bernoulli.physical_pressure,(2,4,100,0)),(bernoulli.physical_pressure,(2,4,100,1000,-1))]
        for fn,args in bad:
            with self.subTest(fn=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(branches.physical_speed(24,Fraction(2,1),2),6)
        self.assertEqual(bernoulli.physical_pressure(2,4,100,1000,90),94)
    def test_exact_means_calibrations_and_redundant_scales(self):
        branches,junction,mixing,pump,bernoulli=(x[0] for x in self.rows)
        self.assertEqual((branches.physical_speed(24,2,2)+branches.physical_speed(24,3,3))/2,Fraction(13,3))
        for equal_rate in [Fraction(1),Fraction(2),Fraction(7,3)]:
            self.assertEqual(mixing.physical_concentration(equal_rate,equal_rate),2)
        self.assertEqual((mixing.physical_concentration(1,1)+mixing.physical_concentration(2,3))/2,Fraction(21,10))
        self.assertEqual(mixing.physical_concentration(Fraction(3,2),2),Fraction(15,7))
        self.assertEqual((pump.physical_power(2,3)+pump.physical_power(4,5))/2,13)
        self.assertEqual(pump.physical_power(3,4),12)
        self.assertEqual((bernoulli.physical_pressure(2,4)+bernoulli.physical_pressure(4,2))/2,100)
        self.assertEqual((bernoulli.physical_pressure(2,4)+bernoulli.physical_pressure(4,4))/2,97)
        self.assertEqual(bernoulli.physical_pressure(3,4),Fraction(193,2))
        for m,_,_ in self.rows:self.assertEqual(len(m.oracle()),16)
    def test_no_authoring_imports_notes_and_bounded_literal_parser(self):
        for m,_,_ in self.rows:
            for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
                if isinstance(node,ast.ImportFrom):self.assertNotIn('authoring',node.module or '')
                elif isinstance(node,ast.Import):self.assertTrue(all('authoring' not in a.name for a in node.names))
            note=(APP/'editorial/reviews'/(m.BATCH+'-independent-note.json')).read_text()
            self.assertTrue(all(line.rstrip()==line for line in note.splitlines()))
            self.assertEqual(len(json.loads(note)['records']),16)
            for raw in ('x+1','sqrt(2)','__import__("os")','2**999999999','1'*81):
                with self.assertRaises((ValueError,TypeError)):m.parse_literal(raw)
if __name__=='__main__':unittest.main()
