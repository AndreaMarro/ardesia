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
class IntensitySuperpositionIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('wave_amplitude_energy','sound_decibel','incoherent_sound_sum','coherent_constructive'):
            m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_text());b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_text())
            cls.rows.append((m,p,b))
    def test_actual_fresh_and_saved_report_identity_all64(self):
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
                    self.assertTrue(report['source']['path'].endswith('U4-02.json'))
                self.assertEqual(fresh,saved)
    def test_100_mutations_with_rebound_keys_and_replaced_reading_tokens(self):
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
    @given(reference=POS,amplitude_ratio=POS,factor=POS)
    def test_fixed_frequency_amplitude_square_and_frequency_exception(self,reference,amplitude_ratio,factor):
        m=self.rows[0][0];intensity=m.physical_intensity(reference,amplitude_ratio)
        self.assertEqual(intensity,reference*amplitude_ratio**2)
        self.assertEqual(intensity/amplitude_ratio**2,reference)
        self.assertEqual(m.physical_intensity(reference,amplitude_ratio*factor),intensity*factor**2)
        self.assertEqual(m.frequency_power_ratio(factor),factor**2)
        coefficient=reference/amplitude_ratio
        self.assertEqual(m.constrained_ratio(intensity,coefficient),sp.Rational(amplitude_ratio))
    @BOUNDED
    @given(reference=POS,exponent=st.integers(1,8),increment=st.integers(1,5))
    def test_log_level_definition_exact_inverse_and_additive_increment(self,reference,exponent,increment):
        m=self.rows[1][0]
        intensity=reference*10**exponent
        level=m.physical_level(intensity,reference)
        self.assertEqual(level,10*exponent)
        self.assertEqual(m.intensity_from_level(level,reference),sp.Rational(intensity))
        self.assertEqual(m.physical_level(intensity*10**increment,reference),level+10*increment)
        self.assertEqual(m.physical_level(reference,reference,positive_level=False),0)
        self.assertEqual(m.intensity_from_level(0,reference,positive_level=False),sp.Rational(reference))
    @BOUNDED
    @given(first=POS,second=POS,third=POS,factor=POS)
    def test_incoherent_cross_term_removal_positive_inverse_and_switch_off(self,first,second,third,factor):
        m=self.rows[2][0];total=m.physical_total(first,second)
        self.assertEqual(total,first+second)
        self.assertEqual(m.inverse_first(total,second),first)
        self.assertEqual(m.physical_total(first*factor,second*factor),total*factor)
        self.assertEqual((total-first)/total,second/total)
        self.assertEqual(first/second,(1-second/total)/(second/total))
        self.assertEqual((m.physical_total(first,second)+m.physical_total(second,third))/2,m.physical_total((first+second)/2,(second+third)/2))
    @BOUNDED
    @given(first=POS,second=POS,factor=POS)
    def test_coherent_amplitudes_add_then_phase_flip_intensity_ratio(self,first,second,factor):
        m=self.rows[3][0];total=m.physical_amplitude(first,second)
        self.assertEqual(total,first+second)
        self.assertEqual(m.inverse_first(total,second),first)
        self.assertEqual(m.physical_amplitude(first*factor,second*factor),total*factor)
        flip=m.phase_flip_ratio(first,second)
        self.assertEqual(flip,(first-second)**2/(first+second)**2)
        self.assertGreaterEqual(flip,0);self.assertLess(flip,1)
        self.assertEqual(m.phase_flip_ratio(first,first),0)
        self.assertNotEqual(total**2,first**2+second**2)
    def test_strict_inverse_domains_and_zero_decibel_boundary(self):
        intensity,level,incoherent,coherent=(x[0] for x in self.rows)
        for fun in (intensity.physical_intensity,incoherent.physical_total,coherent.physical_amplitude):
            for args in [(0,1),(1,0),(-1,1),(1,-1)]:
                with self.assertRaises(ValueError):fun(*args)
        for fun in (intensity.constrained_ratio,):
            for args in [(0,1),(1,0),(-1,1),(1,-1)]:
                with self.assertRaises(ValueError):fun(*args)
        for fun in (incoherent.inverse_first,coherent.inverse_first):
            for args in [(1,1),(1,2),(0,1),(2,0)]:
                with self.assertRaises(ValueError):fun(*args)
        for args in [(0,1),(1,0),(-1,1),(1,-1),(1,1),(1,2)]:
            with self.assertRaises(ValueError):level.physical_level(*args)
        self.assertEqual(level.physical_level(1,1,positive_level=False),0)
        self.assertEqual(level.physical_level(1,10,positive_level=False),-10)
        self.assertEqual(level.intensity_from_level(-10,10,positive_level=False),1)
        self.assertEqual(incoherent.physical_total(1,3),4)
        self.assertEqual((4-1)/4,3/4)
        self.assertEqual(coherent.phase_flip_ratio(3,4),Fraction(1,49))
    def test_manual_means_and_physical_limits(self):
        intensity,level,incoherent,coherent=(x[0] for x in self.rows)
        self.assertEqual(intensity.oracle()[11],11)
        self.assertEqual(incoherent.oracle()[11],4)
        self.assertEqual(coherent.oracle()[11],4)
        self.assertEqual(intensity.frequency_power_ratio(Fraction(3,2)),Fraction(9,4))
        theta=sp.symbols('theta',real=True);a,b=sp.symbols('a b',positive=True)
        y1=a*sp.cos(theta);y2=b*sp.cos(theta)
        self.assertEqual(sp.expand(y1+y2),sp.expand((a+b)*sp.cos(theta)))
        cross_average=sp.integrate(sp.cos(theta),(theta,0,2*sp.pi))/(2*sp.pi)
        self.assertEqual(cross_average,0)
    def test_log_mean_is_geometric_in_ratio_and_common_scaling_is_invisible(self):
        m=self.rows[1][0]
        original_mean=(m.physical_level(100,1)+m.physical_level(2,1))/2
        geometric_ratio=sp.sqrt(100*2)
        self.assertEqual(sp.simplify(original_mean-10*sp.log(geometric_ratio)/sp.log(10)),0)
        delivered_mean=(m.physical_level(1000,10)+m.physical_level(10,1))/2
        self.assertEqual(delivered_mean,15)
        self.assertEqual(m.intensity_from_level(delivered_mean,1),10*sp.sqrt(10))
        for scale in (Fraction(1,7),Fraction(2),Fraction(11,3)):
            self.assertEqual(m.physical_level(100*scale,scale),20)
        self.assertNotEqual(delivered_mean,m.physical_level(505,Fraction(11,2)))
    def test_local_amplitude_sum_does_not_determine_counterpropagating_flux(self):
        m=self.rows[3][0]
        A,B,k,w,tension=sp.symbols('A B k w tension',positive=True)
        x,t=sp.symbols('x t',real=True)
        displacement=A*sp.cos(k*x-w*t)+B*sp.cos(k*x+w*t)
        at_origin=sp.simplify(displacement.subs(x,0))
        self.assertEqual(sp.simplify(at_origin-(A+B)*sp.cos(w*t)),0)
        instantaneous_flux=(-tension*sp.diff(displacement,x)*sp.diff(displacement,t)).subs(x,0)
        mean_flux=sp.integrate(instantaneous_flux,(t,0,2*sp.pi/w))*w/(2*sp.pi)
        self.assertEqual(sp.simplify(mean_flux-tension*k*w*(A**2-B**2)/2),0)
        self.assertEqual(m.opposite_wave_mean_flux(1,1),0)
        self.assertEqual(m.physical_amplitude(1,1),2)
        self.assertEqual(m.opposite_wave_mean_flux(3,4),-7)
    def test_review_boundary_no_authoring_imports_whitespace_and_literal_grammar(self):
        for m,p,b in self.rows:
            source=Path(m.__file__).read_text()
            imports=[n.module for n in ast.walk(ast.parse(source)) if isinstance(n,ast.ImportFrom)]
            self.assertFalse(any(x and 'authoring' in x for x in imports))
            self.assertEqual(m.parse_literal('1/49'),sp.Rational(1,49))
            self.assertEqual(m.parse_literal('2π/4'),sp.pi/2)
            for bad in ['1/0','1/2+1/2','__import__("os")','nan','∞','1'*81]:
                with self.assertRaises(ValueError):m.parse_literal(bad)
            for suffix in ('.json','-independent-note.json'):
                text=(APP/'editorial/reviews'/(m.BATCH+suffix)).read_text()
                self.assertTrue(text.endswith('\n'));self.assertFalse(text.endswith('\n\n'))
                self.assertTrue(all(line==line.rstrip() for line in text.splitlines()))
            self.assertEqual(len(m.MANUAL),16);self.assertEqual(len(m.DISTRACTORS),16)

if __name__=='__main__':unittest.main()
