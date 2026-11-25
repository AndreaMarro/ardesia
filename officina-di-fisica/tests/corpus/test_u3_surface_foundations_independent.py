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
class SurfaceFoundationsIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('network_stages','accelerating_liquid_column','soap_film_force','surface_work','laplace_droplet'):
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
                    self.assertTrue(report['source']['path'].endswith('U3-05.json'))
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
    @given(stages=st.integers(1,40),branches=st.integers(1,40),r0=POS,total_rate=POS)
    def test_integer_network_branch_and_stage_balances(self,stages,branches,r0,total_rate):
        m=self.rows[0][0]
        branch_rate=total_rate/branches
        stage_drop=r0*branch_rate
        total_drop=stages*stage_drop
        equivalent=m.physical_resistance(stages,branches,r0)
        self.assertEqual(total_drop/total_rate,equivalent)
        self.assertEqual(branch_rate*branches,total_rate)
        self.assertEqual(m.inverse_stages(equivalent,branches,r0),stages)
        self.assertEqual(m.physical_resistance(2*stages,2*branches,r0),equivalent)
    @BOUNDED
    @given(length=POS,acceleration=POS,rho=POS,area=POS,scale=POS,p2=POS)
    def test_material_column_Newton_pressure_and_subsystem_additivity(self,length,acceleration,rho,area,scale,p2):
        m=self.rows[1][0]
        force=m.physical_force(length,acceleration,rho,area)
        mass=rho*area*length
        self.assertEqual(force,mass*acceleration)
        dp=force/area;p1=p2+dp
        self.assertEqual((p1-p2)*area,force)
        self.assertGreater(p1,p2)
        left=length/(1+scale);right=length-left
        self.assertEqual(m.physical_force(left,acceleration,rho,area)+m.physical_force(right,acceleration,rho,area),force)
        self.assertEqual(m.physical_force(length*scale,acceleration,rho,area),force*scale)
        self.assertEqual(force/(rho*area*acceleration),length)
    @BOUNDED
    @given(tension=POS,edge=POS,travel=POS,scale=POS)
    def test_two_film_interfaces_same_direction_and_virtual_work(self,tension,edge,travel,scale):
        m=self.rows[2][0]
        one_face=tension*edge/100  # mN from mN/m and cm
        force=m.physical_force(tension,edge)
        self.assertEqual(force,one_face+one_face)
        self.assertGreater(force,one_face)
        # Work in mN·m, using edge and travel in cm converted separately.
        work=force*travel/100
        total_new_area=2*(edge/100)*(travel/100)
        self.assertEqual(work,tension*total_new_area)
        self.assertEqual(m.physical_force(tension*scale,edge),force*scale)
        self.assertEqual(force/(2*(edge/100)),tension)
    @BOUNDED
    @given(tension=POS,first_area=POS,second_area=POS,scale=POS)
    def test_total_surface_area_work_additivity_and_no_double_count(self,tension,first_area,second_area,scale):
        m=self.rows[3][0]
        total=first_area+second_area
        work=m.physical_work(tension,total)
        self.assertEqual(work,m.physical_work(tension,first_area)+m.physical_work(tension,second_area))
        self.assertEqual(work,tension*total/10)
        self.assertEqual(m.physical_work(tension,total*scale),work*scale)
        self.assertEqual(work*10/total,tension)
        self.assertNotEqual(work,2*m.physical_work(tension,total))
    @BOUNDED
    @given(tension=POS,radius=POS,scale=POS)
    def test_single_interface_hemisphere_balance_and_inverse_curvature(self,tension,radius,scale):
        m=self.rows[4][0]
        jump=m.physical_jump(tension,radius)
        self.assertEqual(jump*radius**2,2*tension*radius)
        self.assertEqual(jump*radius/2,tension)
        self.assertEqual(2*tension/jump,radius)
        self.assertEqual(m.physical_jump(tension,radius*scale),jump/scale)
        self.assertEqual(m.physical_jump(tension*scale,radius*scale),jump)
        p_ext=Fraction(100000);p_in=p_ext+jump
        self.assertEqual(p_in-p_ext,jump)
        self.assertNotEqual(p_in,jump)
    def test_strict_physical_domains_and_integer_inverse(self):
        network,column,film,work,drop=(x[0] for x in self.rows)
        bad=[(network.physical_resistance,(0,2)),(network.physical_resistance,(2,0)),
             (network.physical_resistance,(Fraction(1,2),2)),(network.physical_resistance,(2,Fraction(5,2))),
             (network.physical_resistance,(2,4,-1)),(network.inverse_stages,(Fraction(1,3),4)),
             (column.physical_force,(0,5)),(column.physical_force,(2,0)),(column.physical_force,(2,-1)),
             (column.physical_force,(2,5,-1000)),(column.physical_force,(2,5,1000,0)),
             (film.physical_force,(0,2)),(film.physical_force,(50,0)),(film.physical_force,(-1,2)),
             (film.physical_force,(50,2,1)),(work.physical_work,(0,5)),(work.physical_work,(20,0)),
             (work.physical_work,(20,-1)),(drop.physical_jump,(0,2)),(drop.physical_jump,(20,0)),
             (drop.physical_jump,(20,-2))]
        self.assertEqual(len(bad),21)
        for fn,args in bad:
            with self.subTest(fn=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)
        for k in (1,2,19):self.assertEqual(network.physical_resistance(k,2*k),1)
        for r in (Fraction(1,3),Fraction(1),Fraction(9,2)):self.assertEqual(drop.physical_jump(10*r,r),20)
    def test_exact_means_inverse_calibrations_and_distinct_redundancy_domains(self):
        network,column,film,work,drop=(x[0] for x in self.rows)
        self.assertEqual((network.physical_resistance(2,4)+network.physical_resistance(3,2))/2,2)
        with self.assertRaises(ValueError):network.physical_resistance(Fraction(5,2),3)
        self.assertEqual((column.physical_force(2,5)+column.physical_force(4,2))/2,Fraction(9,10))
        self.assertEqual(column.physical_force(3,Fraction(7,2)),Fraction(21,20))
        self.assertEqual((film.physical_force(50,2)+film.physical_force(25,5))/2,Fraction(9,4))
        self.assertEqual(film.physical_force(Fraction(75,2),Fraction(7,2)),Fraction(21,8))
        self.assertEqual((work.physical_work(20,5)+work.physical_work(50,3))/2,Fraction(25,2))
        self.assertEqual(work.physical_work(35,4),14)
        self.assertEqual((drop.physical_jump(20,2)+drop.physical_jump(30,4))/2,Fraction(35,2))
        self.assertEqual(drop.physical_jump(25,3),Fraction(50,3))
        for m,_,_ in self.rows:self.assertEqual(len(m.oracle()),16)
    def test_no_authoring_imports_spaced_notes_and_bounded_exact_grammar(self):
        for m,_,_ in self.rows:
            for node in ast.walk(ast.parse(Path(m.__file__).read_text())):
                if isinstance(node,ast.ImportFrom):self.assertNotIn('authoring',node.module or '')
                elif isinstance(node,ast.Import):self.assertTrue(all('authoring' not in a.name for a in node.names))
            note=(APP/'editorial/reviews'/(m.BATCH+'-independent-note.json')).read_text()
            self.assertTrue(all(line.rstrip()==line for line in note.splitlines()))
            self.assertEqual(len(json.loads(note)['records']),16)
            for raw in ('x+1','sqrt(2)','__import__("os")','2**999999999','1'*81,'√10000','π/0','1/0','2π+1','3√-2'):
                with self.assertRaises((ValueError,TypeError)):m.parse_literal(raw)
            self.assertEqual(m.parse_literal('2π/20'),sp.pi/10)
            self.assertEqual(m.parse_literal('√8/2'),sp.sqrt(2))
            self.assertEqual(m.parse_literal('1.5'),sp.Rational(3,2))
if __name__=='__main__':unittest.main()
