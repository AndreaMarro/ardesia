"""Source-first calorimetry: actual identity, separate physical oracles and hostile rebinding."""
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
POS=st.builds(Fraction,st.integers(1,50),st.integers(1,15))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)

class CalorimetryIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('temperature_after_heating','two_body_calorimetry','calorimeter_capacity','latent_heat'):
            m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_bytes())
            b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_bytes())
            cls.rows.append((m,p,b))

    def test_actual_fresh_and_saved_identity_all64(self):
        primary=APP/'editorial/reviews/u5-calorimetry-169-172-primary-source-only.md'
        for m,p,b in self.rows:
            fresh=m.report(p,b);saved=json.loads((APP/'editorial/reviews'/(m.BATCH+'.json')).read_bytes())
            self.assertEqual(fresh,saved)
            for report in (fresh,saved):
                assert_record_identity(report['records'],m.EXPECTED_IDS,p,b)
                self.assertEqual(len(report['records']),16)
                self.assertTrue(all(r['ok'] for r in report['records']))
                self.assertTrue(all(r['verificationMode'] in ('EXACT_ORACLE','AI_CONCEPTUAL') for r in report['records']))
                self.assertEqual(report['verifierSha256'],sha(Path(m.__file__).read_bytes()))
                self.assertEqual(report['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
                self.assertEqual(report['packageSha256'],m.REVIEWED_PACKAGE_SHA256)
                self.assertEqual(report['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
                self.assertEqual(report['primaryBeforeCandidateKeys']['sha256'],sha(primary.read_bytes()))
                self.assertTrue(report['source']['path'].endswith('U5-03.json'))
                self.assertEqual(report['humanApproval'],'NOT_RUN');self.assertEqual(report['publication'],'DRAFT')

    def test_104_hostile_rebindings_and_pin_test_only_mathematical_guards(self):
        for m,p,b in self.rows:
            before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
            audit=m.mutation_audit(p,b,APP/'editorial/assets')
            self.assertEqual(audit['caseCount'],26);self.assertTrue(audit['allRejected'])
            self.assertEqual(sum(c['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for c in audit['cases']),16)
            self.assertTrue(any(c['case']=='wrong_SVG_physical_scale_or_continuity_all_hashes_bindings_and_tokens_replaced' for c in audit['cases']))
            self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))

    def test_saved_identity_rejects_wrong_mode_hash_or_approval(self):
        for m,p,b in self.rows:
            original=m.report(p,b)['records']
            for field,value in [('verificationMode','AI_SCIENTIFIC_PASS'),('candidateSha256','0'*64),('sourceSha256','0'*64),('humanApproval','PASS'),('publication','PUBLISHED')]:
                rows=deepcopy(original);rows[0][field]=value
                with self.assertRaises(ValueError):assert_record_identity(rows,m.EXPECTED_IDS,p,b)

    @BOUNDED
    @given(power=POS,duration=POS,a=POS,b=POS)
    def test_heating_balance_inverses_offset_and_preparation_scaling(self,power,duration,a,b):
        m=self.rows[0][0];reading=m.heated_reading(power,duration)
        self.assertEqual(reading,Fraction(20)+power*duration/10)
        self.assertEqual(m.power_from_reading(reading,duration),power)
        self.assertEqual(m.duration_from_reading(reading,power),duration)
        self.assertEqual(m.heated_scaled(power,duration,a,b),m.heated_reading(a*power,b*duration)/reading)
        self.assertEqual(m.constrained_duration(reading,power/duration),sp.Rational(duration))
        kelvin=m.SI.Quantity(reading,'degC').to('kelvin').magnitude
        self.assertEqual(Fraction(kelvin),reading+Fraction(5463,20))

    @BOUNDED
    @given(hot=POS,cold=POS,a=POS,b=POS)
    def test_two_body_energy_balance_both_inverses_and_common_scale(self,hot,cold,a,b):
        m=self.rows[1][0];reading=m.equilibrium(hot,cold)
        self.assertTrue(20<reading<80)
        self.assertEqual(hot*(80-reading),cold*(reading-20))
        self.assertEqual(m.hot_from_reading(reading,cold),hot)
        self.assertEqual(m.cold_from_reading(reading,hot),cold)
        self.assertEqual(m.equilibrium_scaled(hot,cold,a,b),m.equilibrium(a*hot,b*cold)/reading)
        self.assertEqual(m.equilibrium_scaled(hot,cold,a,a),1)
        self.assertEqual(m.equal_capacity_reading(hot),50)

    @BOUNDED
    @given(hot=POS,cold=POS,a=POS,b=POS)
    def test_fixed_calorimeter_energy_mass_equivalent_and_strict_cold_inverse(self,hot,cold,a,b):
        m=self.rows[2][0];reading=m.equilibrium(hot,cold)
        self.assertEqual(hot*(80-reading),(cold+2)*(reading-20))
        self.assertEqual(m.hot_from_reading(reading,cold),hot)
        self.assertEqual(m.cold_from_reading(reading,hot),cold)
        self.assertEqual(m.equilibrium_scaled(hot,cold,a,b),m.equilibrium(a*hot,b*cold)/reading)
        equal=m.equilibrium(hot,hot)
        self.assertTrue(20<equal<50);self.assertEqual(m.equal_mass_from_reading(equal),hot)
        self.assertNotEqual(m.equilibrium(2*hot,2*cold),reading)

    @BOUNDED
    @given(mass=POS,latent=POS,a=POS,b=POS)
    def test_complete_phase_heat_units_inverses_and_positive_constrained_branch(self,mass,latent,a,b):
        m=self.rows[3][0];heat=m.phase_heat(mass,latent)
        self.assertEqual(heat,mass*latent)
        self.assertEqual(m.mass_from_heat(heat,latent),mass)
        self.assertEqual(m.latent_from_heat(heat,mass),latent)
        self.assertEqual(m.heat_scaled(mass,latent,a,b),a*b)
        self.assertEqual(m.constrained_latent(heat,mass/latent),sp.Rational(latent))

    @BOUNDED
    @given(first=POS,gap=POS,gain=POS,offset=st.integers(-20,20))
    def test_independent_display_calibration_exact_units_and_nonzero_offset(self,first,gap,gain,offset):
        second=first+gap;third=first+2*gap
        for m,_,_ in self.rows:
            unit='joule' if m.FAMILY=='latent-heat' else 'dimensionless'
            self.assertEqual(m.calibrate(first,second,gain*first,gain*third,gain*first+offset,gain*second+offset,gain*third+offset,unit),(gain,offset,third,third))

    def test_physical_domain_rejections_and_nonpositive_cold_mass(self):
        heat,two,cal,latent=(r[0] for r in self.rows)
        cases=[(heat.heated_reading,(0,1)),(heat.heated_reading,(1,0)),(heat.heated_reading,(-1,1)),
          (heat.power_from_reading,(20,1)),(heat.power_from_reading,(25,0)),(heat.duration_from_reading,(19,1)),
          (heat.duration_from_reading,(25,0)),(heat.heated_scaled,(1,1,0,1)),(heat.constrained_duration,(20,1)),
          (heat.constrained_duration,(25,-1)),(two.equilibrium,(0,1)),(two.equilibrium,(1,-1)),
          (two.hot_from_reading,(20,1)),(two.hot_from_reading,(80,1)),(two.hot_from_reading,(50,0)),
          (two.cold_from_reading,(81,1)),(two.cold_from_reading,(50,-1)),(two.equilibrium_scaled,(1,1,-1,1)),
          (two.equal_capacity_reading,(0,)),(cal.equilibrium,(0,1)),(cal.equilibrium,(1,0)),
          (cal.hot_from_reading,(20,1)),(cal.hot_from_reading,(50,0)),(cal.cold_from_reading,(50,1)),
          (cal.cold_from_reading,(40,1)),(cal.cold_from_reading,(20,1)),(cal.cold_from_reading,(80,1)),
          (cal.equal_mass_from_reading,(20,)),(cal.equal_mass_from_reading,(50,)),(cal.equal_mass_from_reading,(60,)),
          (cal.equilibrium_scaled,(1,1,1,0)),(latent.phase_heat,(0,1)),(latent.phase_heat,(1,0)),
          (latent.mass_from_heat,(0,1)),(latent.mass_from_heat,(1,-1)),(latent.latent_from_heat,(1,0)),
          (latent.latent_from_heat,(-1,1)),(latent.heat_scaled,(1,1,1,-1)),(latent.constrained_latent,(0,1)),
          (latent.constrained_latent,(1,0))]
        self.assertEqual(len(cases),40)
        for fn,args in cases:
            with self.subTest(function=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)

    def test_manual_means_zero_law_phase_and_corrected_counterexample(self):
        heat,two,cal,latent=(r[0] for r in self.rows)
        self.assertEqual((heat.heated_reading(5,10)+heat.heated_reading(10,20))/2,Fraction(65,2))
        self.assertEqual(heat.heated_reading(Fraction(15,2),15),Fraction(125,4))
        self.assertEqual((two.equilibrium(1,1)+two.equilibrium(2,3))/2,47)
        self.assertEqual(two.equilibrium(Fraction(3,2),2),Fraction(320,7))
        self.assertEqual((cal.equilibrium(2,2)+cal.equilibrium(4,4))/2,42)
        self.assertEqual(cal.equilibrium(3,3),Fraction(85,2));self.assertEqual(cal.equilibrium(1,1),35)
        self.assertEqual((latent.phase_heat(2,100)+latent.phase_heat(4,200))/2,500)
        self.assertEqual(latent.phase_heat(3,150),450)
        self.assertEqual(two.oracle()[2],'La seconda è il doppio della prima')
        self.assertEqual(cal.oracle()[2],'B e C hanno la stessa temperatura e sono in equilibrio termico fra loro')
        self.assertEqual(latent.oracle()[2],'La temperatura resta costante e aumenta la frazione liquida')
        special=next(r for r in self.rows[2][1]['records'] if r['id'].endswith('-03'))
        self.assertEqual((special['skill'],special['prerequisites']),('C3-L01',[]))

    def test_dependency_boundary_and_exact_parser(self):
        for m,_,_ in self.rows:
            imports=[]
            for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
                if isinstance(node,ast.Import):imports.extend(x.name for x in node.names)
                if isinstance(node,ast.ImportFrom):imports.append(node.module or '')
            self.assertFalse(any('authoring' in item for item in imports))
            self.assertEqual(m.parse_literal('−4/5'),-sp.Rational(4,5))
            for value in ['nan','inf','1/0','1+1','1/2/3','__import__("os")','2**100000']:
                with self.assertRaises(ValueError):m.parse_literal(value)

if __name__=='__main__':unittest.main()
