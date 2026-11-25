"""Independent thermal models, source-first review identity and adversarial editions."""
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

class GasBasicsIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('temperature_difference','ideal_gas_pressure','gas_density','isothermal_chambers','isothermal_work'):
            module=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            package=json.loads((APP/'editorial/batches'/(module.BATCH+'.json')).read_text())
            bindings=json.loads((APP/'editorial/batches'/(module.BATCH+'-bindings.json')).read_text())
            cls.rows.append((module,package,bindings))

    def test_actual_fresh_and_saved_identity_all80(self):
        primary=APP/'editorial/reviews/u5-gas-basics-148-152-primary-source-only.md'
        for module,package,bindings in self.rows:
            with self.subTest(batch=module.BATCH):
                fresh=module.report(package,bindings)
                saved=json.loads((APP/'editorial/reviews'/(module.BATCH+'.json')).read_text())
                for report in (fresh,saved):
                    assert_record_identity(report['records'],module.EXPECTED_IDS,package,bindings)
                    self.assertEqual(len(report['records']),16)
                    self.assertTrue(all(row['ok'] for row in report['records']))
                    self.assertTrue(all(row['verificationMode'] in ('EXACT_ORACLE','AI_CONCEPTUAL') for row in report['records']))
                    self.assertEqual(report['verifierSha256'],sha(Path(module.__file__).read_bytes()))
                    self.assertEqual(report['contractSha256'],sha(Path(module.__file__).with_name('review_contract.py').read_bytes()))
                    self.assertEqual(report['packageSha256'],module.REVIEWED_PACKAGE_SHA256)
                    self.assertEqual(report['bindingsSha256'],module.REVIEWED_BINDINGS_SHA256)
                    self.assertEqual(report['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()))
                    self.assertEqual(report['publication'],'DRAFT');self.assertEqual(report['humanApproval'],'NOT_RUN')
                    self.assertTrue(report['source']['path'].endswith('U5-01.json'))
                self.assertEqual(fresh,saved)

    def test_130_mutations_with_rebound_keys_and_replaced_edition_tokens(self):
        for module,package,bindings in self.rows:
            with self.subTest(batch=module.BATCH):
                before=(digest(package),digest(bindings),dict(module.REVIEWED_CANDIDATES),module.REVIEWED_PACKAGE_SHA256,module.REVIEWED_BINDINGS_SHA256)
                audit=module.mutation_audit(package,bindings,APP/'editorial/assets')
                self.assertEqual(audit['caseCount'],26);self.assertTrue(audit['allRejected'])
                self.assertEqual(sum(case['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for case in audit['cases']),16)
                self.assertTrue(any(case['case']=='author_self_certification_rehashed_and_retokenized' for case in audit['cases']))
                self.assertEqual(before,(digest(package),digest(bindings),dict(module.REVIEWED_CANDIDATES),module.REVIEWED_PACKAGE_SHA256,module.REVIEWED_BINDINGS_SHA256))

    def test_saved_identity_rejects_stale_hash_and_invented_modes(self):
        for module,package,bindings in self.rows:
            original=module.report(package,bindings)['records']
            for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
                rows=deepcopy(original);rows[0][field]=value
                with self.subTest(batch=module.BATCH,field=field):
                    with self.assertRaises(ValueError):assert_record_identity(rows,module.EXPECTED_IDS,package,bindings)

    @BOUNDED
    @given(cold=POS,gap=POS,shift=POS,factor=POS)
    def test_affine_points_offset_cancel_and_absolute_scaling(self,cold,gap,shift,factor):
        module=self.rows[0][0];hot=cold+gap
        self.assertEqual(module.interval(hot,cold),gap)
        self.assertEqual(module.interval(hot+shift,cold+shift),gap)
        self.assertEqual(module.celsius_absolute(hot)-module.celsius_absolute(cold),gap)
        self.assertEqual(module.absolute_scaled_ratio(hot,cold,factor,factor),factor)
        self.assertEqual(module.absolute_scaled_ratio(hot,cold,2*factor,factor),factor*(2*hot-cold)/gap)

    @BOUNDED
    @given(temperature=POS,volume=POS,amount_R=POS,factor=POS)
    def test_ideal_state_exact_units_two_inverses_and_common_scale(self,temperature,volume,amount_R,factor):
        module=self.rows[1][0];pressure=module.physical_pressure(temperature,volume,amount_R)
        self.assertEqual(pressure,amount_R*temperature/volume)
        self.assertEqual(module.temperature_from_pressure(pressure,volume,amount_R),temperature)
        self.assertEqual(module.volume_from_pressure(temperature,pressure,amount_R),volume)
        self.assertEqual(module.physical_pressure(temperature*factor,volume*factor,amount_R),pressure)
        self.assertEqual(module.physical_pressure(temperature,2*volume,amount_R),pressure/2)
        self.assertEqual(module.redundant_state(temperature/volume,pressure,amount_R),'infinite')

    @BOUNDED
    @given(pressure=POS,temperature=POS,factor=POS)
    def test_mass_density_composition_inverses_and_scaling(self,pressure,temperature,factor):
        module=self.rows[2][0];density=module.physical_density(pressure,temperature)
        self.assertEqual(density,4*pressure/temperature)
        self.assertEqual(module.pressure_from_density(density,temperature),pressure)
        self.assertEqual(module.temperature_from_density(density,pressure),temperature)
        self.assertEqual(module.physical_density(pressure*factor,temperature),density*factor)
        self.assertEqual(module.physical_density(pressure,temperature*factor),density/factor)
        self.assertEqual(module.physical_density(pressure*factor,temperature*factor),density)
        self.assertEqual(module.redundant_density(pressure/temperature,density),'infinite')

    @BOUNDED
    @given(first=POS,second=POS,third=POS,fourth=POS,volume=POS)
    def test_chambers_conservation_positive_inverse_and_linear_mean(self,first,second,third,fourth,volume):
        module=self.rows[3][0];final=module.physical_final_pressure(first,second)
        self.assertEqual(final,(first+second)/2)
        self.assertGreaterEqual(final,min(first,second));self.assertLessEqual(final,max(first,second))
        self.assertEqual(module.inverse_initial(final,second),first)
        self.assertEqual(module.final_fraction(volume,volume),Fraction(1,2))
        self.assertEqual(module.final_fraction(volume,2*volume),Fraction(1,3))
        self.assertEqual((final+module.physical_final_pressure(third,fourth))/2,module.physical_final_pressure((first+third)/2,(second+fourth)/2))

    @BOUNDED
    @given(reference=POS,exponent=st.integers(-5,5),increment=st.integers(-3,3),factor=POS)
    def test_reversible_log_work_signed_inverse_and_cross_trial_ratio(self,reference,exponent,increment,factor):
        module=self.rows[4][0];ratio=Fraction(2)**exponent
        work=module.physical_work(reference,ratio)
        self.assertEqual(work,sp.Rational(reference)*exponent)
        self.assertEqual(module.inverse_volume_ratio(work,reference),sp.Rational(ratio))
        self.assertEqual(module.physical_work(reference*factor,ratio),work*sp.Rational(factor))
        if exponent:
            self.assertEqual(module.inverse_reference(work,ratio),sp.Rational(reference))
            self.assertEqual(module.cross_trial_work_ratio(factor,Fraction(2)**increment,ratio),sp.Rational(factor)*sp.Rational(exponent+increment,exponent))
        else:
            with self.assertRaises(ValueError):module.inverse_reference(0,ratio)
        if exponent<0:self.assertLess(work,0)
        elif exponent>0:self.assertGreater(work,0)
        else:self.assertEqual(work,0)

    @BOUNDED
    @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
    def test_continuous_display_calibration_preserves_dimensions(self,first,gap,gain,offset):
        second=first+gap;third=second+gap
        for module,package,bindings in self.rows:
            gain_found,offset_found,decoded,affine=module.calibrate(first,second,gain*first,gain*second,gain*first+offset,gain*second+offset,gain*third+offset,module.UNITS[1])
            self.assertEqual(gain_found,sp.Rational(gain));self.assertEqual(offset_found,offset)
            self.assertEqual(decoded,sp.Rational(second));self.assertEqual(affine,sp.Rational(third))

    def test_strict_physical_domains_and_affine_absolute_zero(self):
        temp,pressure,density,chambers,work=(row[0] for row in self.rows)
        self.assertEqual(temp.celsius_absolute(0),Fraction(5463,20))
        self.assertEqual(temp.celsius_absolute(-10),Fraction(5263,20))
        for reading in (-Fraction(5463,20),-300):
            with self.assertRaises(ValueError):temp.celsius_absolute(reading)
        for args in [(1,1),(1,2),(1,0),(-1,-2)]:
            with self.assertRaises(ValueError):temp.interval(*args)
        for args in [(300,300,1,1),(400,300,1,2),(400,300,0,1)]:
            with self.assertRaises(ValueError):temp.absolute_scaled_ratio(*args)
        for function in (pressure.physical_pressure,pressure.temperature_from_pressure,pressure.volume_from_pressure,density.physical_density,density.pressure_from_density,density.temperature_from_density,chambers.physical_final_pressure,chambers.final_fraction):
            for args in [(0,1),(1,0),(-1,1),(1,-1)]:
                with self.assertRaises(ValueError):function(*args)
        for args in [(100,200),(100,201),(0,1),(1,0)]:
            with self.assertRaises(ValueError):chambers.inverse_initial(*args)
        self.assertEqual(chambers.inverse_initial(100,100),100)
        with self.assertRaises(ValueError):pressure.redundant_state(100,99)
        with self.assertRaises(ValueError):density.redundant_density(Fraction(1,4),2)
        for args in [(0,2),(1,0),(-1,2),(1,-1)]:
            with self.assertRaises(ValueError):work.physical_work(*args)
        for args in [(0,1),(1,1),(-1,2),(1,Fraction(1,2)),(1,0)]:
            with self.assertRaises(ValueError):work.inverse_reference(*args)
        for args in [(0,Fraction(1,2)),(12,0),(12,1),(12,2)]:
            with self.assertRaises(ValueError):work.hot_isotherm_heat(*args)

    def test_manual_means_nonidentifiability_and_changed_candidate_parameters(self):
        temp,pressure,density,chambers,work=(row[0] for row in self.rows)
        self.assertEqual(temp.oracle()[12],sp.Rational(29,30))
        self.assertNotEqual(sp.Rational(337,537),temp.oracle()[12])
        self.assertEqual(pressure.oracle()[10:15],[2,150,sp.Rational(2,3),400,600])
        self.assertEqual(pressure.physical_pressure(350,Fraction(5,2)),140)
        self.assertEqual(density.oracle()[11],sp.Rational(5,2));self.assertEqual(density.physical_density(120,240),2)
        self.assertEqual(chambers.oracle()[11],200)
        for volume in [Fraction(1,2),Fraction(3),Fraction(4)]:
            self.assertEqual(pressure.physical_pressure(100*volume,volume),100)
        for temperature in [Fraction(160),Fraction(320),Fraction(400)]:
            self.assertEqual(density.physical_density(temperature/4,temperature),1)

    def test_log_domain_nonpower_ratio_and_cycle_hot_heat_scope(self):
        module=self.rows[4][0]
        self.assertEqual(module.inverse_volume_ratio(module.physical_work(10,3),10),3)
        self.assertEqual(module.cross_trial_work_ratio(2,Fraction(1,2),2),0)
        self.assertEqual(module.cross_trial_work_ratio(2,Fraction(1,4),2),-2)
        self.assertEqual(module.physical_work(10,Fraction(1,4)),-20)
        for reference in (1,10,100):self.assertEqual(module.physical_work(reference,1),0)
        self.assertEqual(module.hot_isotherm_heat(12,Fraction(1,2)),24)
        self.assertNotEqual(15*sp.log(3)/sp.log(2),25);self.assertNotEqual(3**3,2**5)
        volume,V0,p0=sp.symbols('volume V0 p0',positive=True)
        hot=sp.integrate(p0*V0/volume,(volume,V0,4*V0))
        cold=sp.integrate(p0*V0/(2*volume),(volume,4*V0,V0))
        self.assertEqual(sp.simplify(cold+hot/2),0)
        self.assertEqual(sp.simplify(hot+cold-hot/2),0)
        # Isocore heating adds positive heat beyond the hot-isotherm amount if no regenerator is specified.
        capacity,hot_temperature=sp.symbols('capacity hot_temperature',positive=True)
        extra=capacity*(hot_temperature-hot_temperature/2)
        self.assertTrue(extra.is_positive)

    def test_review_boundary_literal_grammar_and_durable_primary(self):
        primary=APP/'editorial/reviews/u5-gas-basics-148-152-primary-source-only.md'
        self.assertEqual(sha(primary.read_bytes()),'1a8bb11b9c09dc191e31fc3f835425f2b885393a693926bff8cfd93d35d6dc2d')
        for module,package,bindings in self.rows:
            source=Path(module.__file__).read_text()
            imports=[node.module for node in ast.walk(ast.parse(source)) if isinstance(node,ast.ImportFrom)]
            self.assertFalse(any(name and 'authoring' in name for name in imports))
            self.assertEqual(module.parse_literal('1/49'),sp.Rational(1,49))
            self.assertEqual(module.parse_literal('16,85/26,85'),sp.Rational(337,537))
            self.assertEqual(module.parse_literal('√3'),sp.sqrt(3))
            for bad in ['1/0','1/2+1/2','__import__("os")','nan','∞','1'*81]:
                with self.assertRaises(ValueError):module.parse_literal(bad)
            for suffix in ('.json','-independent-note.json'):
                text=(APP/'editorial/reviews'/(module.BATCH+suffix)).read_text()
                self.assertTrue(text.endswith('\n'));self.assertFalse(text.endswith('\n\n'))
                self.assertTrue(all(line==line.rstrip() for line in text.splitlines()))
            self.assertEqual(len(module.MANUAL),16);self.assertEqual(len(module.DISTRACTORS),16)
            self.assertEqual(len(module.PEDAGOGY),16)

if __name__=='__main__':unittest.main()
