"""Distinct reviewer regressions; no authoring imports and no product browser."""
import ast
import copy
import hashlib
import importlib
import inspect
import json
from pathlib import Path
import subprocess
import unittest
from unittest import mock
from fractions import Fraction
import sympy as sp
from hypothesis import given,settings,strategies as st
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.batches import assert_record_identity
from tools.corpus_engineering import cric_c1_mechanics_review_common as c
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/cric-c1-006-010-independent-proof-20261126'
FIX=PROOF/'fixtures';ASSETS=FIX/'assets'
MODULES=[importlib.import_module(f'tools.corpus_engineering.cric_c1_l{n:03}_verifier')for n in range(6,11)]
def packet(m):
    batch=m.__name__.split('.')[-1].removesuffix('_verifier').replace('_','-')
    return batch,json.loads((FIX/(batch+'.json')).read_text()),json.loads((FIX/(batch+'-bindings.json')).read_text())
def rebind(m,p,b):
    byid={x['id']:x for x in b};pins={}
    for r in p['records']:
        x=byid[r['id']];x['candidateSha256']=digest(r)
        pins[r['id']]=digest({'record':r,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class DistinctCricMechanicsReview(unittest.TestCase):
    stats={'wrongKeysRejected':0,'metadataRejected':0,'unitToleranceRejected':0,'constitutiveFaultsRejected':0,'inverseFaultsRejected':0,'finiteExactRejections':0,'hypothesisConfigurations':0}
    def test_01_fresh_saved_identity_sources_and_original_versions(self):
        source=json.loads(subprocess.check_output(['git','show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C1.json'],cwd=APP));source={r['id']:r for r in source if r.get('kind')=='question'}
        ids=[]
        for m in MODULES:
            batch,p,b=packet(m);fresh=m.report(p,b,ASSETS);saved=json.loads((APP/'editorial/reviews'/(batch+'.json')).read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(len(p['records']),10);self.assertEqual(len({r['family']for r in p['records']}),10)
            raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+'.json'],cwd=APP);self.assertEqual(raw,(FIX/(batch+'.json')).read_bytes())
            for r,x in zip(p['records'],b):
                self.assertEqual(x['sourceSha256'],digest(source[r['id']]))
                self.assertEqual(r['version'],source[r['id']]['version']+1);self.assertEqual(r['baseVersion'],source[r['id']]['version']);ids.append(r['id'])
        self.assertEqual(set(ids),{f'C1-Q{n:03}'for n in range(51,101)})
        for entry in json.loads((PROOF/'git-inputs.json').read_text())['inputs']:
            raw=subprocess.check_output(['git','show',entry['commit']+':'+entry['path']],cwd=APP);self.assertEqual(raw,(PROOF/entry['snapshot']).read_bytes());self.assertEqual(hashlib.sha256(raw).hexdigest(),entry['sha256'])
    def test_02_every_wrong_key_with_all_freeze_tokens_rebound(self):
        for m in MODULES:
            _,original,bindings=packet(m)
            for index,row in enumerate(original['records']):
                wrong=[v for v in row['answer'].get('options',[])if v!=row['answer']['value']]if row['answer']['type']=='choice'else[row['answer']['value']+1]
                for value in wrong:
                    p,b=copy.deepcopy(original),copy.deepcopy(bindings);p['records'][index]['answer']['value']=value
                    with rebind(m,p,b):result=m.verify(p,b,ASSETS)[index]
                    self.assertFalse(result['ok'],(row['id'],value));self.assertTrue(any('Independent physical'in e or 'Independent specific physics'in e or 'Independent exact alternatives'in e for e in result['errors']),result['errors']);self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in result['errors']));self.stats['wrongKeysRejected']+=1
    def test_03_metadata_and_feedback_mapping_rebound(self):
        for m in MODULES:
            _,op,ob=packet(m)
            for field,value in[('family','collapsed-cohort-family'),('version',100),('baseVersion',100),('course','C2'),('skill','C1-L001'),('prerequisites',[]),('review','APPROVED')]:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][0][field]=value
                with rebind(m,p,b):r=m.verify(p,b,ASSETS)[0]
                self.assertFalse(r['ok']);self.stats['metadataRejected']+=1
            for index,row in enumerate(op['records']):
                if row['error']['category']not in['concetto','unità']:continue
                p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][index]['error']['category']='algebra'
                with rebind(m,p,b):r=m.verify(p,b,ASSETS)[index]
                self.assertFalse(r['ok']);self.assertTrue(any('feedback mapping'in e for e in r['errors']));self.stats['metadataRejected']+=1
    def test_04_numeric_units_and_tolerance_rebound(self):
        for m in MODULES:
            _,op,ob=packet(m)
            for index,row in enumerate(op['records']):
                if row['answer']['type']!='numeric':continue
                for field,value in[('unit','s'),('tolerance',1)]:
                    p,b=copy.deepcopy(op),copy.deepcopy(ob);p['records'][index]['answer'][field]=value
                    with rebind(m,p,b):r=m.verify(p,b,ASSETS)[index]
                    self.assertFalse(r['ok']);self.assertTrue(any('physical numeric unit or tolerance'in e for e in r['errors']));self.stats['unitToleranceRejected']+=1
    def test_05_plausible_constitutive_faults_without_stale_file_pins(self):
        faults=[('threshold_mu',lambda f,n:sp.Rational(n,f)),('linear_force_work',lambda a,b,d:(a+b)*d),('impulse_component',lambda m,vi,vf:m*(vf+vi)),('center_of_mass',lambda m1,x1,m2,x2:(x1+x2)/2),('bottom_tension',lambda m,g,h,L:m*g)]
        m=MODULES[0];_,p,b=packet(m)
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows));self.assertTrue(any('physical oracle constitutive'in e for e in rows[0]['errors']));self.stats['constitutiveFaultsRejected']+=1
    def test_06_finite_exact_inputs_before_cast(self):
        R=sp.Rational
        cases=[(c.model.threshold_mu,[18,60]),(c.model.kinetic_deceleration,[R(1,5),R(49,5)]),(c.model.gravity_ratio,[4,2]),(c.model.external_gravity,[8,2]),(c.model.spring_rest_length,[R(14,100),6,200]),(c.model.hooke_component,[80,-R(1,40)]),(c.model.constant_force_work,[16,5,60]),(c.model.linear_force_work,[2,10,R(2,5)]),(c.model.kinetic_energy,[4,3]),(c.model.kinetic_final,[5,18,-6]),(c.model.instantaneous_power,[25,R(4,5)]),(c.model.stopping_distance,[4,3,6]),(c.model.potential_height,[3,R(1,5),10]),(c.model.spring_energy_rescale,[R(4,5),2,5]),(c.model.internal_gain,[20,7,0]),(c.model.ascent_speed,[5,10,R(4,5)]),(c.model.motor_work,[3,10,2,-5]),(c.model.bottom_tension,[2,10,1,2]),(c.model.impulse_component,[R(1,10),4,-3]),(c.model.recoil_velocity,[4,3,6]),(c.model.captured_horizontal_velocity,[R(3,2),2,R(1,2)]),(c.model.final_momentum,[R(5,2),-3,R(3,5)]),(c.model.center_of_mass,[1,0,3,R(4,5)]),(c.model.torque_magnitude,[R(2,5),15,30]),(c.model.right_reaction,[30,R(1,2),2]),(c.model.cm_acceleration,[18,12]),(c.model.muscle_force_drop,[6,R(3,100),R(4,100)]),(c.inverse_capture_mass,[R(3,2),2,R(3,2)]),(c.inverse_recoil_mass,[4,3,-2]),(c.inverse_support_position,[R(15,2),30,2]),(c.inverse_external_radius,[8,2])]
        for fn,args in cases:
            for index in range(len(args)):
                for bad in[True,False,0.25,sp.Float('0.25'),sp.I,sp.oo,-sp.oo,sp.nan,1+2j,'2']:
                    values=args.copy();values[index]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*values)
                    self.stats['finiteExactRejections']+=1
        for vector in[(sp.I,0),(sp.oo,0),(sp.nan,0),(True,0),(0.25,0),(0,sp.Float('0.1'))]:
            for initial,final in[(vector,(0,2)),((2,0),vector)]:
                with self.assertRaises((ValueError,TypeError)):c.model.mean_force_vector(Fraction(1,2),initial,final,Fraction(1,2))
                self.stats['finiteExactRejections']+=1
        self.assertEqual(c.model.hooke_component(80,0),0);self.assertEqual(c.model.cm_acceleration(0,12),0);self.assertEqual(c.model.bottom_tension(2,10,0,2),20);self.assertEqual(c.model.kinetic_final(5,-5,0),0)
    def test_07_safe_exact_numeric_and_symbolic_literals(self):
        self.assertEqual(c.quantity('1,96 m/s²'),(sp.Rational(49,25),'acceleration'));self.assertEqual(c.quantity('−7/10 N·s'),(-sp.Rational(7,10),'momentum'));self.assertEqual(c.quantity('2√2 N'),(2*sp.sqrt(2),'force'));self.assertEqual(c.quantity('60 cm'),(sp.Rational(3,5),'length'))
        for bad in['__import__("os")','1/0','r(-1)','nan','1e999','True','[1]','r(10001)','2;3']:
            with self.assertRaises((ValueError,SyntaxError)):c.quantity(bad)
        for bad in['__import__("os")','k.__class__','k[x]','k/0','k**100','xx','True','r(2)']:
            with self.assertRaises((ValueError,SyntaxError)):c.symbolic_spring(bad)
        for bad in[True,False,0.1,sp.Float('0.1'),sp.I,sp.oo,sp.nan]:
            with self.assertRaises(ValueError):c.codec.numeric_lexeme(bad)
    def test_08_inverse_roundtrips_and_physical_branches(self):
        R=sp.Rational
        self.assertEqual(c.inverse_capture_mass(R(3,2),2,R(3,2)),R(1,2));self.assertEqual(c.model.captured_horizontal_velocity(R(3,2),2,c.inverse_capture_mass(R(3,2),2,R(3,2))),R(3,2))
        self.assertEqual(c.inverse_recoil_mass(4,3,-2),6);self.assertEqual(c.model.recoil_velocity(4,3,c.inverse_recoil_mass(4,3,-2)),-2)
        self.assertEqual(c.inverse_support_position(R(15,2),30,2),R(1,2));self.assertEqual(c.model.right_reaction(30,c.inverse_support_position(R(15,2),30,2),2),R(15,2));self.assertEqual(c.inverse_external_radius(8,2),2)
        for fn,args in[(c.inverse_capture_mass,[1,2,0]),(c.inverse_capture_mass,[1,2,3]),(c.inverse_recoil_mass,[4,3,2]),(c.inverse_support_position,[30,30,2]),(c.inverse_external_radius,[2,8]),(c.model.bottom_tension,[2,10,3,2]),(c.model.external_gravity,[8,R(1,2)]),(c.model.ascent_speed,[1,10,2])]:
            with self.assertRaises(ValueError):fn(*args)
        wrongs=[(lambda:c.model.captured_horizontal_velocity(R(3,2),2,R(3,2)*(2/R(3,2)+1)),R(3,2)),(lambda:c.model.recoil_velocity(4,3,12),-2),(lambda:c.model.right_reaction(30,R(3,2),2),R(15,2)),(lambda:c.model.external_gravity(8,4),2)]
        for fn,want in wrongs:
            self.assertNotEqual(fn(),want);self.stats['inverseFaultsRejected']+=1
    def test_09_full_native_asset_proofs_and_actual_vector_geometry(self):
        import xml.etree.ElementTree as ET
        for n in range(6,11):
            batch=f'cric-c1-l{n:03}';D=APP/'editorial/reviews/cric-c1-006-010-asset-review-20261126'/batch;raw=(D/'source-reviewed.svg').read_bytes();self.assertEqual(raw,(ASSETS/(batch+'-progressive.svg')).read_bytes());r=json.loads((D/'render.json').read_text());self.assertEqual(r['sourceSvgSha256'],hashlib.sha256(raw).hexdigest());self.assertEqual(r['observedExit'],0);png=(D/'full-native.png').read_bytes();self.assertEqual(int.from_bytes(png[16:20],'big'),640);self.assertEqual(int.from_bytes(png[20:24],'big'),r['pngHeight']);self.assertEqual(r['pngHeight'],int(ET.fromstring(raw).attrib['height']))
        D=APP/'editorial/reviews/cric-c1-006-010-asset-review-20261126/cric-c1-l009';root=ET.fromstring((D/'source-reviewed.svg').read_bytes());lines=[e.attrib for e in root if e.tag.endswith('line')];vel=[x for x in lines if x.get('y1')=='780'];self.assertEqual(len(vel),2);self.assertEqual(sorted(abs(int(x['x2'])-int(x['x1']))for x in vel),[100,150]);self.assertTrue(all(int(x['y1'])>760 for x in vel));self.assertTrue((D/'negative-hidden-velocity-before-author-fix/full-native.png').exists())
    def test_10_portable_identity_contract_and_rejected_false_approval(self):
        source=(APP/'tools/corpus_engineering/batches.py').read_text();node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity');segment=ast.get_source_segment(source,node);self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca');self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
        m=MODULES[0];_,p,b=packet(m);rows=m.verify(p,b,ASSETS)
        for field,value in[('id','FAKE'),('ok',False),('candidateSha256','0'*64),('humanApproval','APPROVED'),('verificationMode','UNSUPPORTED')]:
            bad=copy.deepcopy(rows);bad[0][field]=value
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
    def test_11_dependencies_and_unfinished_reading_fail_closed(self):
        m=MODULES[0];_,p,b=packet(m)
        with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
        with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c1_051_100_review_models.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_12_friction_force_balance(self,f,n,scale):
        mu=c.model.threshold_mu(f,n);self.assertEqual(mu*n,f);self.assertEqual(c.model.threshold_mu(f*scale,n*scale),mu);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,10))
    def test_13_gravity_exterior_inverse(self,g,scale,m):
        out=c.model.external_gravity(g,scale);self.assertEqual(c.inverse_external_radius(g,out),scale);self.assertEqual(c.model.gravity_ratio(m,scale),sp.Rational(m,scale**2));self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(-30,30),st.integers(1,30))
    def test_14_hooke_and_work_integral(self,k,x,L):
        self.assertEqual(c.model.hooke_component(k,x),-k*x);self.assertEqual(c.model.linear_force_work(2,10,L),6*L);z=sp.Symbol('z');self.assertEqual(sp.integrate(2+8*z/L,(z,0,L)),6*L);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(-30,30),st.integers(-30,30))
    def test_15_cm_translation_invariance(self,m1,m2,x1,shift):
        before=c.model.center_of_mass(m1,x1,m2,5);after=c.model.center_of_mass(m1,x1+shift,m2,5+shift);self.assertEqual(after,before+shift);self.assertTrue(min(x1,5)<=before<=max(x1,5));self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_16_recoil_and_capture_momentum(self,m1,m2,v):
        recoil=c.model.recoil_velocity(m1,v,m2);self.assertEqual(m1*v+m2*recoil,0);self.assertEqual(c.inverse_recoil_mass(m1,v,recoil),m2);vf=c.model.captured_horizontal_velocity(m1,v,m2);self.assertEqual((m1+m2)*vf,m1*v);self.assertEqual(c.inverse_capture_mass(m1,v,vf),m2);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_17_two_support_moments(self,P,L,a):
        position=sp.Rational(a,a+1)*L;right=c.model.right_reaction(P,position,L);left=P-right;self.assertEqual(right*L,P*position);self.assertEqual(left+right,P);self.assertTrue(left>0 and right>0);self.assertEqual(c.inverse_support_position(right,P,L),position);self.stats['hypothesisConfigurations']+=1
