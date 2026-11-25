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
class ArchimedesFloatingIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('archimedes_force','floating_fraction','apparent_weight','maximum_payload','loaded_raft_depth'):
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
                    self.assertTrue(report['source']['path'].endswith('U3-02.json'))
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
    @given(rho=POS,area=POS,height=POS,depth=POS,boundary=POS)
    def test_archimedes_pressure_prism_and_depth_translation(self,rho,area,height,depth,boundary):
        m=self.rows[0][0];g=Fraction(10)
        # Independent pressure integration on opposing faces in SI; equal side contributions cancel.
        top=boundary+rho*g*depth
        bottom=boundary+rho*g*(depth+height)
        resultant=(bottom-top)*area
        volume_si=area*height
        self.assertEqual(resultant,rho*g*volume_si)
        # The oracle helper accepts kg/L and L: exact conversions cancel.
        self.assertEqual(m.physical_buoyancy(rho/1000,volume_si*1000),resultant)
        deeper_top=top+rho*g*height;deeper_bottom=bottom+rho*g*height
        self.assertEqual((deeper_bottom-deeper_top)*area,resultant)
    @BOUNDED
    @given(liquid=POS,a=POS,b=POS,total_volume=POS,cut_a=POS,cut_b=POS)
    def test_free_floating_cut_pieces_preserve_fraction_and_weight_balance(self,liquid,a,b,total_volume,cut_a,cut_b):
        m=self.rows[1][0];fraction=a/(a+b);body=liquid*fraction
        self.assertEqual(m.physical_fraction(body,liquid),fraction)
        first_volume=total_volume*cut_a/(cut_a+cut_b);second_volume=total_volume-first_volume
        for V in (first_volume,second_volume):
            immersed=fraction*V
            self.assertEqual(liquid*immersed,body*V)
            self.assertLess(immersed,V)
        self.assertEqual(first_volume+second_volume,total_volume)
    @BOUNDED
    @given(rho=POS,volume=POS,excess_mass=POS,g=POS)
    def test_taut_top_support_tension_is_weight_minus_buoyancy(self,rho,volume,excess_mass,g):
        m=self.rows[2][0];mass=rho*volume+excess_mass
        T=m.physical_tension(mass,volume,rho,g)
        self.assertEqual(T,excess_mass*g)
        self.assertEqual(T+rho*volume*g,mass*g)
        self.assertGreater(T,0);self.assertLess(T,mass*g)
    @BOUNDED
    @given(liquid=POS,volume=POS,a=POS,b=POS,excess=POS)
    def test_dry_payload_limit_uses_full_volume_and_subtracts_platform(self,liquid,volume,a,b,excess):
        m=self.rows[3][0];platform=liquid*a/(a+b)
        maximum=m.physical_payload(platform,volume,liquid)
        own=platform*volume
        self.assertEqual(own+maximum,liquid*volume)
        self.assertGreater(maximum,0)
        self.assertGreater((own+maximum+excess)/liquid,volume)
        # A smaller dry load requires a proper fraction of the available volume.
        self.assertLess((own+maximum/2)/liquid,volume)
    @BOUNDED
    @given(cargo=POS,rho=POS,H=POS,margin=POS)
    def test_raft_geometry_and_fixed_own_mass(self,cargo,rho,H,margin):
        m=self.rows[4][0];own=Fraction(2);wanted=H/(1+margin)
        area=(cargo+own)/(rho*wanted)
        h=m.physical_draft(cargo,area,H,rho,own)
        self.assertEqual(h,wanted);self.assertLess(h,H)
        self.assertEqual(rho*area*h,cargo+own)
        self.assertEqual(rho*area*h-own,cargo)
    def test_physical_domain_and_strict_geometry_counterexamples(self):
        buoyancy,floating,tension,payload,raft=(x[0] for x in self.rows)
        bad=[(buoyancy.physical_buoyancy,(0,1)),(buoyancy.physical_buoyancy,(1,-1)),
             (floating.physical_fraction,(0,1)),(floating.physical_fraction,(1,1)),(floating.physical_fraction,(2,1)),
             (tension.physical_tension,(1,1)),(tension.physical_tension,(1,2)),(tension.physical_tension,(3,0)),
             (payload.physical_payload,(0,20)),(payload.physical_payload,(1,20)),(payload.physical_payload,(2,20)),
             (raft.physical_draft,(6,2)),(raft.physical_draft,(7,2)),(raft.physical_draft,(0,2)),(raft.physical_draft,(2,0))]
        for fn,args in bad:
            with self.subTest(fn=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(raft.physical_draft(4,2),3)
        self.assertEqual(payload.physical_payload(Fraction(1,2),20),10)
    def test_repeated_payload_root_is_one_distinct_solution(self):
        x=sp.symbols('x',real=True);capacity=x-x*x/40
        self.assertEqual(sp.solve(sp.Eq(capacity,10),x),[20])
        self.assertEqual(sp.factor(capacity-10),-(x-20)**2/40)
        below=sp.solve(sp.Eq(capacity,9),x)
        self.assertEqual(below,[20-2*sp.sqrt(10),20+2*sp.sqrt(10)])
        self.assertTrue(all(0<v<40 for v in below))
        self.assertEqual(sp.solve(sp.Eq(capacity,11),x),[])
    def test_no_authoring_imports_and_saved_note_whitespace(self):
        for m,_,_ in self.rows:
            for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
                if isinstance(node,ast.ImportFrom):self.assertNotIn('authoring',node.module or '')
                elif isinstance(node,ast.Import):self.assertTrue(all('authoring' not in a.name for a in node.names))
            note=(APP/'editorial/reviews'/(m.BATCH+'-independent-note.json')).read_text()
            self.assertTrue(all(line.rstrip()==line for line in note.splitlines()))
            for raw in ('x+1','sqrt(2)','__import__("os")','2**999999999','1'*81):
                with self.assertRaises((ValueError,TypeError)):m.parse_literal(raw)
if __name__=='__main__':unittest.main()
