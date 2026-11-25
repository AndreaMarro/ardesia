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
class ViscousNetworkIndependent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows=[]
        for name in ('reservoir_emptying','transport_time','poiseuille_flow','hydraulic_series','hydraulic_parallel'):
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
                    self.assertTrue(report['source']['path'].endswith('U3-04.json'))
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
    @given(ratio=POS,height=POS,g=POS,area=POS,left=POS,right=POS)
    def test_emptying_ODE_integrated_volume_and_first_zero(self,ratio,height,g,area,left,right):
        m=self.rows[0][0];r=100+ratio;fraction=left/(left+right)
        T=m.physical_time(r,height,g);level=m.physical_level(height,fraction)
        self.assertEqual(level,height*(1-fraction)**2)
        initial_flow=sp.Rational(area/r)*sp.sqrt(2*sp.Rational(g)*sp.Rational(height))
        actual_flow=initial_flow*(1-fraction)
        dh_dt=-2*sp.Rational(height)*(1-fraction)/T
        self.assertEqual(sp.simplify(sp.Rational(area)*dh_dt+actual_flow),0)
        self.assertEqual(sp.simplify(initial_flow*T/2-sp.Rational(area*height)),0)
        initial_rate_estimate=sp.Rational(area*height)/initial_flow
        self.assertEqual(sp.simplify(T-2*initial_rate_estimate),0)
        self.assertEqual(m.physical_level(height,0),height)
        self.assertEqual(m.physical_level(height,1),0)
    @BOUNDED
    @given(flow=POS,first_volume=POS,second_volume=POS,scale=POS)
    def test_transfer_time_additivity_and_common_scaling(self,flow,first_volume,second_volume,scale):
        m=self.rows[1][0]
        first=m.physical_time(first_volume,flow);second=m.physical_time(second_volume,flow)
        self.assertEqual(flow*first,first_volume)
        self.assertEqual(m.physical_time(first_volume+second_volume,flow),first+second)
        self.assertEqual(m.physical_time(scale*first_volume,scale*flow),first)
        self.assertEqual(m.physical_time(first_volume,2*flow),first/2)
    @BOUNDED
    @given(radius=POS,viscosity=POS,length=POS,radius_factor=POS,viscosity_factor=POS,margin=POS)
    def test_poiseuille_scaling_in_two_generated_low_Re_states(self,radius,viscosity,length,radius_factor,viscosity_factor,margin):
        m=self.rows[2][0];rho=Fraction(1000)
        r1=radius/100;r2=r1*radius_factor
        eta1=viscosity/1000;eta2=eta1*viscosity_factor
        # Choose a common pressure drop so both independently computed Reynolds numbers are below 1.
        first_ceiling=4*eta1**2*length/(rho*r1**3)
        second_ceiling=4*eta2**2*length/(rho*r2**3)
        dp=min(first_ceiling,second_ceiling)/(1+margin)
        qa=m.physical_flow(radius,viscosity,dp,length)
        qb=m.physical_flow(radius*radius_factor,viscosity*viscosity_factor,dp,length)
        self.assertEqual(sp.cancel(qb/qa),sp.Rational(radius_factor**4/viscosity_factor))
        for q,r,eta in [(qa,r1,eta1),(qb,r2,eta2)]:
            q_si=q/10**6
            mean_speed=sp.cancel(q_si/(sp.pi*sp.Rational(r)**2))
            reynolds=sp.cancel(sp.Rational(rho)*mean_speed*(2*r)/eta)
            self.assertGreater(reynolds,0);self.assertLess(reynolds,1)
            radius_fourth=sp.cancel(8*sp.Rational(eta*length)*q_si/(sp.pi*dp))
            self.assertEqual(radius_fourth,sp.Rational(r**4))
            self.assertEqual(sp.simplify(radius_fourth**sp.Rational(1,4)-sp.Rational(r)),0)
    @BOUNDED
    @given(first=POS,second=POS,flow=POS,outlet_margin=POS)
    def test_series_common_rate_and_telescoping_pressures(self,first,second,flow,outlet_margin):
        m=self.rows[3][0];outlet=100+outlet_margin
        middle=outlet+second*flow;inlet=middle+first*flow
        total=(inlet-outlet)/flow
        self.assertEqual(m.physical_series(first,second),total)
        self.assertGreater(total,first);self.assertGreater(total,second)
        self.assertEqual(m.physical_first(total,second),first)
        q,p1,p2=m.pressure_partition(first,second,inlet-outlet)
        self.assertEqual(q,flow);self.assertEqual(p1,inlet-middle);self.assertEqual(p2,middle-outlet)
        self.assertEqual(p1+p2,inlet-outlet)
    @BOUNDED
    @given(first=POS,second=POS,drop=POS)
    def test_parallel_flow_balance_inverse_and_pressure_control(self,first,second,drop):
        m=self.rows[4][0];q1=drop/first;q2=drop/second
        equivalent=m.physical_parallel(first,second)
        self.assertEqual(equivalent,drop/(q1+q2))
        self.assertGreater(equivalent,0);self.assertLess(equivalent,min(first,second))
        self.assertEqual(m.physical_first(equivalent,second),first)
        total_before=q1+q2;total_after=drop/first
        self.assertEqual(total_after,q1);self.assertLess(total_after,total_before)
    def test_strict_domain_counterexamples_and_continuous_resistances(self):
        emptying,transport,poiseuille,series,parallel=(x[0] for x in self.rows)
        bad=[(emptying.physical_time,(10,5)),(emptying.physical_time,(100,0)),(emptying.physical_time,(100,5,0)),
             (emptying.physical_level,(5,-1)),(emptying.physical_level,(5,Fraction(11,10))),
             (transport.physical_time,(0,3)),(transport.physical_time,(12,0)),(transport.physical_time,(-1,3)),
             (poiseuille.physical_flow,(0,1)),(poiseuille.physical_flow,(1,0)),(poiseuille.physical_flow,(1,1,0)),(poiseuille.physical_flow,(1,1,1,0)),
             (series.physical_series,(0,2)),(series.physical_series,(-1,2)),(series.physical_first,(3,3)),(series.physical_first,(2,3)),(series.pressure_partition,(2,3,0)),
             (parallel.physical_parallel,(0,2)),(parallel.physical_parallel,(-1,2)),(parallel.physical_first,(0,2)),(parallel.physical_first,(2,2)),(parallel.physical_first,(3,2)),(parallel.physical_first,(1,-2))]
        self.assertEqual(len(bad),23)
        for fn,args in bad:
            with self.subTest(fn=fn.__name__,args=args):
                with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(series.physical_series(Fraction(1,3),Fraction(1,2)),Fraction(5,6))
        self.assertEqual(parallel.physical_parallel(Fraction(1,3),Fraction(1,2)),Fraction(1,5))
        self.assertEqual(transport.physical_time(Fraction(4,3),Fraction(1,3)),4)
    def test_exact_means_special_control_and_identifiability(self):
        emptying,transport,poiseuille,series,parallel=(x[0] for x in self.rows)
        self.assertEqual((emptying.physical_time(100,5)+emptying.physical_time(200,20))/2,250)
        self.assertEqual(emptying.physical_time(150,Fraction(25,2)),75*sp.sqrt(10))
        self.assertEqual((transport.physical_time(12,3)+transport.physical_time(20,4))/2,Fraction(9,2))
        self.assertEqual(transport.physical_time(16,Fraction(7,2)),Fraction(32,7))
        self.assertEqual((poiseuille.physical_flow(1,1)+poiseuille.physical_flow(2,2))/2,9*sp.pi/20)
        # Source 109-08 changes length and radius while holding flow, not pressure.
        self.assertEqual(Fraction(4,2**4),Fraction(1,4))
        self.assertEqual((series.physical_series(2,3)+series.physical_series(4,6))/2,series.physical_series(3,Fraction(9,2)))
        self.assertEqual((parallel.physical_parallel(2,2)+parallel.physical_parallel(3,6))/2,Fraction(3,2))
        self.assertEqual(parallel.physical_parallel(Fraction(5,2),4),Fraction(20,13))
        # Unequal branches disprove a universal half-flow closure rule.
        dp=Fraction(6);before=dp/1+dp/3;after=dp/1
        self.assertEqual(after/before,Fraction(3,4))
        for rate in [Fraction(1,3),Fraction(3),Fraction(5)]:self.assertEqual(transport.physical_time(4*rate,rate),4)
        for eq in [Fraction(1,5),Fraction(1),Fraction(7,3)]:self.assertEqual(parallel.physical_parallel(2*eq,2*eq),eq)
        for m,_,_ in self.rows:self.assertEqual(len(m.oracle()),16)
    def test_no_authoring_imports_note_whitespace_and_bounded_exact_grammar(self):
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
            self.assertEqual(m.parse_literal('75√10'),75*sp.sqrt(10))
            self.assertEqual(m.parse_literal('√8/2'),sp.sqrt(2))
            self.assertEqual(m.parse_literal('1.5'),sp.Rational(3,2))
if __name__=='__main__':unittest.main()
