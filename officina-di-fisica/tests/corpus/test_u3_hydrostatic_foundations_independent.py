"""Separate reviewer: exact editions, retokenized mutations and physical properties."""
import ast
from fractions import Fraction
import importlib
import json
from pathlib import Path
import unittest
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.pipeline import digest,sha
APP=Path(__file__).resolve().parents[2]
POS=st.builds(Fraction,st.integers(1,60),st.integers(1,20))
BOUNDED=settings(max_examples=40,derandomize=True,deadline=None)
class HydrostaticIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('pressure_area','density','stevino_gauge','stevino_absolute','layered_liquids'):
            m=importlib.import_module('tools.corpus_engineering.'+name+'_verifier')
            p=json.loads((APP/'editorial/batches'/(m.BATCH+'.json')).read_text());b=json.loads((APP/'editorial/batches'/(m.BATCH+'-bindings.json')).read_text())
            cls.rows.append((m,p,b))
    def test_all80_read_editions_and_metadata(self):
        for m,p,b in self.rows:
            with self.subTest(batch=m.BATCH):
                r=m.report(p,b);self.assertEqual(len(r['records']),16)
                self.assertTrue(all(x['ok'] for x in r['records']))
                self.assertEqual({x['id'] for x in r['records']},m.EXPECTED_IDS)
                self.assertEqual(r['verifierSha256'],sha(Path(m.__file__).read_bytes()))
                self.assertEqual(r['contractSha256'],sha(Path(m.__file__).with_name('review_contract.py').read_bytes()))
                self.assertEqual(r['packageSha256'],m.REVIEWED_PACKAGE_SHA256)
                self.assertEqual(r['bindingsSha256'],m.REVIEWED_BINDINGS_SHA256)
                self.assertTrue(r['source']['path'].endswith('U3-01.json'));self.assertEqual(len(m.CANDIDATE_REF),40)
                self.assertEqual(r['publication'],'DRAFT');self.assertEqual(r['humanApproval'],'NOT_RUN')
                self.assertTrue(all(x['manualArithmetic'] and x['physicalAssumptions'] and x['distractors'] for x in r['records']))
    def test125_rebound_keys_units_sources_duplicates_and_svg(self):
        for m,p,b in self.rows:
            with self.subTest(batch=m.BATCH):
                before=(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256)
                a=m.mutation_audit(p,b,APP/'editorial/assets');self.assertEqual(a['caseCount'],25);self.assertTrue(a['allRejected'])
                self.assertEqual(sum(c['case']=='wrong_key_rebound_and_all_edition_tokens_replaced' for c in a['cases']),16)
                self.assertEqual(before,(digest(p),digest(b),dict(m.REVIEWED_CANDIDATES),m.REVIEWED_PACKAGE_SHA256,m.REVIEWED_BINDINGS_SHA256))
    @BOUNDED
    @given(force=POS,area=POS,scale=POS)
    def test_uniform_traction_integral_and_same_scale_degeneracy(self,force,area,scale):
        m=self.rows[0][0];p=m.physical_pressure(force,area)
        self.assertEqual(p*area,force)
        self.assertEqual(m.physical_pressure(scale*force,scale*area),p)
        self.assertEqual(m.physical_pressure(force,2*area),p/2)
    @BOUNDED
    @given(mass=POS,volume=POS,scale=POS)
    def test_mass_conservation_and_exact_litre_conversion(self,mass,volume,scale):
        m=self.rows[1][0];rho=m.physical_density(mass,volume)
        self.assertEqual(rho*volume,mass)
        rho_si=(m.SI.Quantity(mass,'kg')/m.SI.Quantity(volume,'liter')).to('kg/meter**3').magnitude
        self.assertEqual(rho_si,1000*rho)
        self.assertEqual(m.physical_density(scale*mass,scale*volume),rho)
    @BOUNDED
    @given(rho=POS,h=POS,width=POS)
    def test_column_force_balance_cancels_vessel_area(self,rho,h,width):
        m=self.rows[2][0];dp=m.physical_gauge(rho,h)
        weight_per_area=1000*rho*10*h
        self.assertEqual(1000*dp*width,weight_per_area*width)
        self.assertEqual(m.physical_gauge(rho,2*h),2*dp)
    @BOUNDED
    @given(ps=POS,h=POS,gamma=POS,delta=POS)
    def test_absolute_boundary_and_inverse_cannot_reset_at_surface(self,ps,h,gamma,delta):
        m=self.rows[3][0];p=m.physical_absolute(ps,h,gamma)
        self.assertEqual(m.positive_depth(p,ps,gamma),h)
        self.assertEqual(m.physical_absolute(ps,0,gamma),ps)
        self.assertEqual(m.physical_absolute(ps+delta,h,gamma)-p,delta)
        self.assertGreater(p,ps)
    @BOUNDED
    @given(ha=POS,ho=POS,delta=POS)
    def test_interface_continuity_and_positive_layer_inverse(self,ha,ho,delta):
        m=self.rows[4][0];p=m.physical_layered(ha,ho)
        interface=8*ho
        self.assertEqual(p-interface,10*ha)
        self.assertEqual(m.positive_water_height(p,ho),ha)
        self.assertEqual(m.physical_layered(ha+delta,ho)-p,10*delta)
        self.assertEqual(m.physical_layered(ha,ho+delta)-p,8*delta)
        # Removing the top layer's head would violate continuity even with the correct bottom gradient.
        self.assertNotEqual(p,10*ha)
    def test_physical_domain_boundary_counterexamples(self):
        pressure,density,gauge,absolute,layers=(row[0] for row in self.rows)
        checks=[(pressure.physical_pressure,(1,0)),(pressure.physical_pressure,(-1,1)),
                (density.physical_density,(0,1)),(density.physical_density,(1,-2)),
                (gauge.physical_gauge,(1,0)),(gauge.physical_gauge,(-1,2)),
                (absolute.positive_depth,(100,100)),(absolute.positive_depth,(90,100)),
                (absolute.physical_absolute,(0,2)),(absolute.physical_absolute,(100,-1)),
                (layers.positive_water_height,(8,1)),(layers.positive_water_height,(7,1)),
                (layers.physical_layered,(1,1,800,1000)),(layers.physical_layered,(0,1))]
        for fn,args in checks:
            with self.subTest(fn=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(absolute.physical_absolute(100,0),100)
        self.assertEqual(layers.positive_water_height(Fraction(81,10),1),Fraction(1,100))
    def test_no_authoring_import_and_literal_parser_is_bounded(self):
        for m,_,_ in self.rows:
            for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
                if isinstance(node,ast.ImportFrom):self.assertNotIn('authoring',node.module or '')
                elif isinstance(node,ast.Import):self.assertTrue(all('authoring' not in a.name for a in node.names))
            for raw in ('x+1','sqrt(2)','__import__("os")','2**999999999','1'*81):
                with self.assertRaises((ValueError,TypeError)):m.parse_literal(raw)
if __name__=='__main__':unittest.main()
