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
class WaveOscillatorIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('wave_wavelength','echo_ranging','oscillator_period','oscillator_max_speed','oscillator_max_acceleration'):
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
                    self.assertTrue(report['source']['path'].endswith('U4-01.json'))
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
    @given(speed=POS,frequency=POS,factor=POS)
    def test_shape_advance_per_source_period_and_scaling(self,speed,frequency,factor):
        m=self.rows[0][0];wavelength=m.physical_wavelength(speed,frequency)
        period=1/frequency
        self.assertEqual(wavelength,speed*period)
        self.assertEqual(wavelength*frequency,speed)
        self.assertEqual(m.physical_wavelength(speed,frequency*factor),wavelength/factor)
        self.assertEqual(m.physical_wavelength(speed*factor,frequency*factor),wavelength)
    @BOUNDED
    @given(speed=POS,total_time=POS,factor=POS)
    def test_reciprocal_echo_two_legs_and_constrained_positive_root(self,speed,total_time,factor):
        m=self.rows[1][0];distance=m.physical_distance(speed,total_time)
        self.assertEqual(2*distance,speed*total_time)
        self.assertEqual(distance/speed,total_time/2)
        self.assertEqual(m.physical_distance(speed*factor,total_time),distance*factor)
        coefficient=speed/total_time
        self.assertEqual(m.constrained_time(distance,coefficient),sp.Rational(total_time))
        self.assertNotEqual(distance,speed*total_time)
    @BOUNDED
    @given(mass=POS,stiffness=POS,factor=POS)
    def test_Newton_reduced_period_squared_and_scale_freedom(self,mass,stiffness,factor):
        m=self.rows[2][0];tau=m.physical_reduced_period(mass,stiffness)
        self.assertEqual(sp.simplify(tau**2),sp.Rational(mass/stiffness))
        self.assertEqual(sp.simplify(stiffness*tau**2),sp.Rational(mass))
        self.assertEqual(m.physical_reduced_period(mass*factor,stiffness*factor),tau)
        omega=1/tau
        self.assertEqual(sp.simplify(omega**2),sp.Rational(stiffness/mass))
        # Phase gained during tau is one radian; the complete cycle requires2π.
        full=2*sp.pi*tau
        self.assertEqual(sp.simplify(omega*full),2*sp.pi)
        self.assertNotEqual(full,tau)
    @BOUNDED
    @given(amplitude=POS,omega=POS,factor=POS)
    def test_harmonic_velocity_derivative_energy_and_inverse(self,amplitude,omega,factor):
        m=self.rows[3][0];speed=m.physical_max_speed(amplitude,omega)
        self.assertEqual(speed,amplitude*omega)
        self.assertEqual(speed/omega,amplitude)
        self.assertEqual(m.physical_max_speed(amplitude*factor,omega),speed*factor)
        # At equilibrium all harmonic mechanical energy is kinetic, giving the same modulus.
        self.assertEqual(speed**2,omega**2*amplitude**2)
        self.assertEqual(m.constrained_omega(speed,amplitude/omega),sp.Rational(omega))
    @BOUNDED
    @given(amplitude=POS,omega=POS,factor=POS)
    def test_restoring_acceleration_sign_square_scaling_and_cubic(self,amplitude,omega,factor):
        m=self.rows[4][0];acceleration=m.physical_max_acceleration(amplitude,omega)
        self.assertEqual(acceleration,amplitude*omega**2)
        self.assertEqual(acceleration/omega**2,amplitude)
        self.assertEqual(m.physical_max_acceleration(amplitude,omega*factor),acceleration*factor**2)
        at_positive_endpoint=-omega**2*amplitude
        self.assertEqual(at_positive_endpoint,-acceleration)
        self.assertEqual(-omega**2*0,0)
        self.assertEqual(m.constrained_omega(acceleration,amplitude/omega),sp.Rational(omega))
    def test_physical_domains_reject_zero_negative_and_nonphysical_roots(self):
        wave,echo,period,speed,acc=(x[0] for x in self.rows)
        functions=[wave.physical_wavelength,echo.physical_distance,period.physical_reduced_period,speed.physical_max_speed,acc.physical_max_acceleration]
        for fun in functions:
            for args in [(0,1),(1,0),(-1,1),(1,-1)]:
                with self.subTest(function=fun.__name__,args=args):
                    with self.assertRaises(ValueError):fun(*args)
        for fun in (echo.constrained_time,speed.constrained_omega,acc.constrained_omega):
            for args in [(0,1),(1,0),(-1,1),(1,-1)]:
                with self.subTest(function=fun.__name__,args=args):
                    with self.assertRaises(ValueError):fun(*args)
    def test_manual_means_endpoint_concepts_and_continuous_families(self):
        wave,echo,period,speed,acc=(x[0] for x in self.rows)
        self.assertEqual(wave.oracle()[11],sp.Rational(9,2))
        self.assertEqual(echo.oracle()[11],25)
        self.assertEqual(period.oracle()[11],sp.Rational(5,4))
        self.assertEqual(speed.oracle()[11],5)
        self.assertEqual(acc.oracle()[11],11)
        for f in [Fraction(1,3),Fraction(1),Fraction(7,2)]:
            self.assertEqual(wave.physical_wavelength(4*f,f),4)
            self.assertEqual(period.physical_reduced_period(f/4,f),sp.Rational(1,2))
        theta=sp.symbols('theta',real=True);A,w=sp.symbols('A w',positive=True)
        displacement=A*sp.cos(theta)
        velocity=-A*w*sp.sin(theta)
        acceleration=-A*w**2*sp.cos(theta)
        self.assertEqual(velocity.subs(theta,0),0)
        self.assertEqual(velocity.subs(theta,sp.pi/2),-A*w)
        self.assertEqual(acceleration.subs(theta,sp.pi/2),0)
        self.assertEqual(acceleration.subs(theta,0),-A*w**2)
        self.assertEqual(acceleration.subs(theta,sp.pi),A*w**2)
    def test_review_boundary_no_authoring_imports_whitespace_and_literal_grammar(self):
        for m,p,b in self.rows:
            source=Path(m.__file__).read_text()
            imports=[n.module for n in ast.walk(ast.parse(source)) if isinstance(n,ast.ImportFrom)]
            self.assertFalse(any(x and 'authoring' in x for x in imports))
            self.assertEqual(m.parse_literal('√2/2'),sp.sqrt(2)/2)
            self.assertEqual(m.parse_literal('2π/4'),sp.pi/2)
            for bad in ['1/0','1/2+1/2','sqrt(2)','__import__("os")','nan','∞','1'*81]:
                with self.assertRaises(ValueError):m.parse_literal(bad)
            for suffix in ('.json','-independent-note.json'):
                text=(APP/'editorial/reviews'/(m.BATCH+suffix)).read_text()
                self.assertTrue(text.endswith('\n'));self.assertFalse(text.endswith('\n\n'))
                self.assertTrue(all(line==line.rstrip() for line in text.splitlines()))
            self.assertEqual(len(m.MANUAL),16);self.assertEqual(len(m.DISTRACTORS),16)

if __name__=='__main__':unittest.main()
