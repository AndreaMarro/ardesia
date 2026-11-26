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
from tools.corpus_engineering import cric_c2_fluids_review_common as c
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/cric-c2-006-010-independent-proof-20261126'
FIX=PROOF/'fixtures';ASSETS=FIX/'assets'
MODULES=[importlib.import_module(f'tools.corpus_engineering.cric_c2_l{n:03}_verifier')for n in range(6,11)]
def packet(m):
    batch=m.__name__.split('.')[-1].removesuffix('_verifier').replace('_','-')
    return batch,json.loads((FIX/(batch+'.json')).read_text()),json.loads((FIX/(batch+'-bindings.json')).read_text())
def rebind(m,p,b):
    byid={x['id']:x for x in b};pins={}
    for r in p['records']:
        x=byid[r['id']];x['candidateSha256']=digest(r)
        pins[r['id']]=digest({'record':r,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class DistinctCricFluidsReview(unittest.TestCase):
    stats={'wrongKeysRejected':0,'metadataRejected':0,'unitToleranceRejected':0,'constitutiveFaultsRejected':0,'inverseFaultsRejected':0,'finiteExactRejections':0,'hypothesisConfigurations':0,'domainBackslidesRejected':0,'accessibleAssetMutationsRejected':0}
    def test_01_fresh_saved_identity_sources_and_original_versions(self):
        source=json.loads(subprocess.check_output(['git','show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json'],cwd=APP));source={r['id']:r for r in source if r.get('kind')=='question'}
        ids=[]
        for m in MODULES:
            batch,p,b=packet(m);fresh=m.report(p,b,ASSETS);saved=json.loads((APP/'editorial/reviews'/(batch+'.json')).read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
            assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
            self.assertEqual(len(p['records']),10);self.assertEqual(len({r['family']for r in p['records']}),10)
            raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+'.json'],cwd=APP);self.assertEqual(raw,(FIX/(batch+'.json')).read_bytes())
            for r,x in zip(p['records'],b):
                self.assertEqual(x['sourceSha256'],digest(source[r['id']]))
                self.assertEqual(r['version'],source[r['id']]['version']+1);self.assertEqual(r['baseVersion'],source[r['id']]['version']);ids.append(r['id'])
        self.assertEqual(set(ids),{f'C2-Q{n:03}'for n in range(51,101)})
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
            for field,value in[('family','collapsed-cohort-family'),('version',100),('baseVersion',100),('course','C1'),('skill','C1-L001'),('prerequisites',[]),('review','APPROVED')]:
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
    def test_05_plausible_constitutive_faults_with_fresh_packet_pins(self):
        faults=[('bernoulli_pressure_change',lambda rho,vi,vf,*args:rho*(vf-vi)**2/2),('mean_poiseuille',lambda maximum:maximum),('hydraulic_resistance',lambda eta,length,radius:8*eta*length/(sp.pi*radius**2)),('parallel_resistance',lambda *res:sum(res)),('film_force',lambda gamma,length,interfaces=2:gamma*length)]
        m=MODULES[0];_,p,b=packet(m)
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows));self.assertTrue(any('physical oracle constitutive'in e for e in rows[0]['errors']));self.stats['constitutiveFaultsRejected']+=1
    def test_06_finite_exact_inputs_before_any_cast(self):
        R=sp.Rational
        cases=[(c.model.continuity_velocity,[2,3]),(c.model.bernoulli_pressure_change,[1000,2,1,10,0]),(c.model.stagnation_speed,[60,R(6,5)]),(c.model.speed_from_pressure_drop,[1,1000,1500]),(c.model.area_ratio,[1,2]),(c.model.torricelli,[10,R(1,5)]),(c.model.poiseuille_profile,[1,R(4,5),1]),(c.model.mean_poiseuille,[R(14,25)]),(c.model.radial_gradient_magnitude,[1,R(1,2),1]),(c.model.mean_shear_gradient,[R(1,50),R(1,2000)]),(c.model.dynamic_viscosity,[R(18,5),12]),(c.model.shear_stress,[R(3,10),12]),(c.model.couette_force,[1,2,3,4]),(c.model.hydraulic_resistance,[1,2,3]),(c.model.poiseuille_flow,[1,2,3,4]),(c.model.pressure_for_flow,[1,2,3,4]),(c.model.radius_factor_for_flow_ratio,[3]),(c.model.passive_hydraulic_power,[3,4]),(c.model.series_resistance,[2,5,1]),(c.model.parallel_resistance,[4,12]),(c.model.unknown_parallel_resistance,[3,4]),(c.model.conductance,[4]),(c.model.narrow_flow_fraction,[2]),(c.model.surface_work,[1,2]),(c.model.film_force,[1,2]),(c.model.capillary_height,[1,2,10,1,R(1,2)]),(c.model.laplace_spherical_pressure,[1,2]),(c.model.merged_radius,[1]),(c.inverse_initial_speed,[2,1000,1500]),(c.inverse_tube_radius,[1,2,3,4]),(c.inverse_surface_tension,[3,2]),(c.force_ratio,[1,2,3,4,5])]
        # Count arguments are covered separately; radius-only wrapper keeps this numeric matrix uniform.
        cases=[(fn,args)for fn,args in cases if fn is not c.model.merged_radius]+[(lambda radius:c.model.merged_radius(radius,8),[1])]
        for fn,args in cases:
            for i in range(len(args)):
                for bad in[True,False,0.25,sp.Float('0.25'),sp.I,sp.oo,-sp.oo,sp.nan,1+2j,'2']:
                    a=args.copy();a[i]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*a)
                    self.stats['finiteExactRejections']+=1
        for bad in[True,False,0,sp.Integer(8),sp.Rational(3,2),8.0,sp.I,sp.oo,sp.nan,'8']:
            for fn in[c.model.merge_area_ratio,lambda n:c.model.merged_radius(1,n)]:
                with self.assertRaises((ValueError,TypeError)):fn(bad)
                self.stats['finiteExactRejections']+=1
    def test_07_safe_exact_quantity_and_Bernoulli_AST(self):
        self.assertEqual(c.quantity('0,28 m/s'),(sp.Rational(7,25),'velocity'));self.assertEqual(c.quantity('12 mW'),(sp.Rational(3,250),'power'));self.assertEqual(c.quantity('12 kPa·s/mL'),(sp.Integer(12)*10**9,'hydraulic_resistance'));self.assertEqual(c.quantity('⁴√3'),(sp.Integer(3)**sp.Rational(1,4),'pure'));self.assertEqual(c.quantity('1/⁴√3'),(sp.Integer(3)**-sp.Rational(1,4),'pure'))
        self.assertEqual(sp.simplify(c.bernoulli_expression('p₁−p₂=ρ(v₂²−v₁²)/2')-c.physical_oracle()[60]),0)
        for bad in['__import__("os")','1/0','r(-1)','nan','1e999','True','[1]','r(10001)','2;3','⁴√0','⁴√10000']:
            with self.assertRaises((ValueError,SyntaxError)):c.quantity(bad)
        for bad in['p₁−p₂=__import__("os")','p₁−p₂=rho.__class__','p₁−p₂=rho[1]','p₁−p₂=rho/0','p₁−p₂=rho**100','p₂−p₁=ρ(v₂²−v₁²)/2','p₁−p₂=True','p₁−p₂=unknown']:
            with self.assertRaises((ValueError,SyntaxError)):c.bernoulli_expression(bad)
        for bad in[True,False,0.1,sp.Float('0.1'),sp.I,sp.oo,sp.nan]:
            with self.assertRaises(ValueError):c.codec.numeric_lexeme(bad)
    def test_08_inverse_roundtrips_and_physical_domains(self):
        R=sp.Rational
        self.assertEqual(c.inverse_initial_speed(2,1000,1500),1);self.assertEqual(c.model.speed_from_pressure_drop(c.inverse_initial_speed(2,1000,1500),1000,1500),2)
        flow=c.model.poiseuille_flow(3,2,4,5);self.assertEqual(sp.simplify(c.inverse_tube_radius(flow,3,2,4)),5)
        self.assertEqual(c.model.parallel_resistance(4,c.model.unknown_parallel_resistance(3,4)),3)
        self.assertEqual(c.inverse_surface_tension(R(15,10**6),R(3,10**4)),R(1,20));self.assertEqual(c.force_ratio(1,2,3,1,R(5,2)),R(2,5))
        wrongs=[(sp.sqrt(4+3),sp.Integer(1)),(sp.sqrt(8*2*4*flow/(sp.pi*3)),sp.Integer(5)),(c.model.parallel_resistance(4,4-3),sp.Integer(3)),(R(15,10**6)*R(3,10**4),R(1,20)),(R(5,2),R(2,5))]
        for got,want in wrongs:self.assertNotEqual(sp.simplify(got-want),0);self.stats['inverseFaultsRejected']+=1
        for fn,args in[(c.inverse_initial_speed,[1,1000,1500]),(c.inverse_tube_radius,[0,2,3,4]),(c.inverse_surface_tension,[1,0]),(c.force_ratio,[1,2,0,1,2]),(c.model.dynamic_viscosity,[1,0]),(c.model.dynamic_viscosity,[-1,2]),(c.model.poiseuille_profile,[1,2,1]),(c.model.capillary_height,[1,1,1,1,2]),(c.model.unknown_parallel_resistance,[4,4]),(c.model.unknown_parallel_resistance,[5,4]),(c.model.narrow_flow_fraction,[R(1,2)]),(c.model.series_resistance,[]),(c.model.parallel_resistance,[1]*101)]:
            with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(c.model.poiseuille_flow(0,1,1,1),0);self.assertEqual(c.model.surface_work(1,0),0);self.assertEqual(c.model.capillary_height(1,1,1,1,0),0);self.assertEqual(c.model.dynamic_viscosity(-3,-10),R(3,10));self.assertEqual(c.model.passive_hydraulic_power(-2,-3),6)
    def test_09_full_native_assets_and_independent_geometric_relations(self):
        import xml.etree.ElementTree as ET
        roots={}
        for n in range(6,11):
            batch=f'cric-c2-l{n:03}';D=APP/'editorial/reviews/cric-c2-006-010-asset-review-20261126'/batch;raw=(D/'source-reviewed.svg').read_bytes();self.assertEqual(raw,(ASSETS/(batch+'-progressive.svg')).read_bytes());r=json.loads((D/'render.json').read_text());self.assertEqual(r['sourceSvgSha256'],hashlib.sha256(raw).hexdigest());self.assertEqual(r['observedExit'],0);png=(D/'full-native.png').read_bytes();self.assertEqual(int.from_bytes(png[16:20],'big'),640);self.assertEqual(int.from_bytes(png[20:24],'big'),r['pngHeight']);root=ET.fromstring(raw);self.assertEqual(r['pngHeight'],int(root.attrib['height']));roots[n]=root;self.assertIn('CHILD_EXIT 0',(D/'actual-native-terminal.txt').read_text())
        tags=lambda n,t:[e.attrib for e in roots[n]if e.tag.endswith(t)]
        rects=tags(6,'rect');self.assertTrue(any(r.get('height')=='40'for r in rects));self.assertTrue(any(r.get('height')=='160'for r in rects))
        t=sp.Symbol('t',real=True);x=220*(1-t)**2+2*700*t*(1-t)+220*t**2;y=1300*(1-t)**2+2*1480*t*(1-t)+1660*t**2
        self.assertEqual(sp.expand((x-220)/240-(1-((y-1480)/180)**2)),0)
        profile=next(d for d in tags(7,'path')if d.get('d')=='M220 1300Q700 1480 220 1660');self.assertTrue(profile)
        l=next(d for d in tags(7,'line')if d.get('y1')=='1336');self.assertEqual((sp.Rational(l['x2'])-sp.Rational(l['x1']))/240,sp.Rational(9,25))
        self.assertEqual(sorted(sp.Rational(d['r'])for d in tags(8,'circle')),[60,90]);bars=[d for d in tags(8,'rect')if d.get('height')=='28'];self.assertEqual(sp.Rational(bars[1]['width'])/sp.Rational(bars[0]['width']),sp.Rational(81,16))
        self.assertEqual(sorted(sp.Rational(d['width'])for d in tags(9,'rect')if d.get('height')=='30'),[20,320]);self.assertEqual(sorted(sp.Rational(d['r'])for d in tags(10,'circle')),[30,120]);self.assertEqual(sorted(sp.Rational(d['width'])for d in tags(10,'rect')if d.get('height')=='28'),[60,240])
        for entry in json.loads((APP/'editorial/reviews/cric-c2-006-010-source-assets-20261126/git-inputs.json').read_text())['inputs']:
            raw=subprocess.check_output(['git','show',entry['commit']+':'+entry['path']],cwd=APP);self.assertEqual(hashlib.sha256(raw).hexdigest(),entry['sha256'])
    def test_10_portable_identity_contract_and_no_false_approval(self):
        source=(APP/'tools/corpus_engineering/batches.py').read_text();node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity');segment=ast.get_source_segment(source,node);self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca');self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
        m=MODULES[0];_,p,b=packet(m);rows=m.verify(p,b,ASSETS)
        for field,value in[('id','FAKE'),('ok',False),('candidateSha256','0'*64),('humanApproval','APPROVED'),('verificationMode','UNSUPPORTED')]:
            bad=copy.deepcopy(rows);bad[0][field]=value
            with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)
    def test_11_unfinished_reading_and_missing_model_dependencies_fail_closed(self):
        m=MODULES[0];_,p,b=packet(m)
        with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
        with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c2_051_100_review_models.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
    def test_12_domain_backslides_rejected_after_every_packet_pin_rebound(self):
        cases=[(MODULES[1],'C2-Q068','v_max>0'),(MODULES[1],'C2-Q070','U>0'),(MODULES[2],'C2-Q075','Δp>0')]
        for m,identifier,term in cases:
            _,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(term,term.replace('>0',''))
            with rebind(m,p,b):row=m.verify(p,b,ASSETS)[i]
            self.assertFalse(row['ok']);self.assertTrue(any('zero-denominator domain'in e for e in row['errors']));self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in row['errors']));self.stats['domainBackslidesRejected']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20))
    def test_13_Bernoulli_inverse_sign(self,rho,vi,vf):
        drop=sp.Rational(rho,2)*(vf**2-vi**2);self.assertEqual(c.inverse_initial_speed(vf,rho,drop),vi);self.assertEqual(c.model.bernoulli_pressure_change(rho,vi,vf),-drop);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,12),st.integers(1,12),st.integers(1,8))
    def test_14_Poiseuille_radius_scaling(self,eta,L,r):
        base=c.model.poiseuille_flow(3,eta,L,r);wide=c.model.poiseuille_flow(3,eta,L,2*r);self.assertEqual(sp.simplify(wide/base),16);self.assertEqual(sp.simplify(c.inverse_tube_radius(base,3,eta,L)),r);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,10))
    def test_15_network_reduction_and_inverse(self,a,b,flow):
        eq=c.model.parallel_resistance(a,b);self.assertLess(eq,min(a,b));self.assertGreater(c.model.series_resistance(a,b),max(a,b));self.assertEqual(c.model.unknown_parallel_resistance(eq,a),b);self.assertEqual(sp.simplify((eq*flow)/a+(eq*flow)/b),flow);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20))
    def test_16_Couette_and_material_coefficient(self,eta,speed,gap):
        self.assertEqual(c.force_ratio(eta,3,speed,gap,2*gap),sp.Rational(1,2));tau=eta*sp.Rational(speed,gap);self.assertEqual(c.model.dynamic_viscosity(tau,sp.Rational(speed,gap)),eta);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,20),st.integers(1,20),st.integers(1,20))
    def test_17_surface_work_and_two_faces(self,gamma,area,length):
        work=c.model.surface_work(gamma,area);self.assertEqual(c.inverse_surface_tension(work,area),gamma);self.assertEqual(c.model.film_force(gamma,length,2),2*c.model.film_force(gamma,length,1));self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,10),st.integers(1,10),st.integers(1,8))
    def test_18_capillary_sign_and_volume_conservation(self,gamma,radius,n):
        h=c.model.capillary_height(gamma,1,10,radius,sp.Rational(1,2));self.assertGreater(h,0);self.assertEqual(c.model.capillary_height(gamma,1,10,radius,-sp.Rational(1,2)),-h);self.assertEqual(c.model.merged_radius(radius,n**3),radius*n);self.assertEqual(c.model.merge_area_ratio(n**3),sp.Rational(1,n));self.stats['hypothesisConfigurations']+=1
    def test_19_accessible_title_and_description_rebound_with_asset_bytes(self):
        import xml.etree.ElementTree as ET
        import tempfile,base64,shutil
        for m in MODULES:
            batch,op,ob=packet(m)
            for local_tag in['title','desc']:
                p,b=copy.deepcopy(op),copy.deepcopy(ob);asset=p['assets'][0];old_hash=asset['id'];root=ET.fromstring(base64.b64decode(asset['data']));element=next(e for e in root if e.tag.rsplit('}',1)[-1]==local_tag);element.text='';raw=ET.tostring(root,encoding='utf-8');new_hash=hashlib.sha256(raw).hexdigest();asset.update(id=new_hash,data=base64.b64encode(raw).decode())
                for row in p['records']:
                    for block in row['blocks']:
                        if block.get('type')=='figure'and block.get('src')=='/asset/'+old_hash:block['src']='/asset/'+new_hash
                for binding in b:
                    for name,checksum in binding['assetChecksums'].items():
                        if checksum==old_hash:binding['assetChecksums'][name]=new_hash
                with tempfile.TemporaryDirectory(prefix='cric-c2-accessible-review-')as directory:
                    temp=Path(directory)
                    for source in ASSETS.iterdir():shutil.copyfile(source,temp/source.name)
                    (temp/(batch+'-progressive.svg')).write_bytes(raw)
                    with rebind(m,p,b):rows=m.verify(p,b,temp)
                linked=[r for r in rows if r['assetChecksums']]
                self.assertTrue(linked);self.assertTrue(all(not r['ok']for r in linked));self.assertTrue(all(any('accessible SVG'in e for e in r['errors'])for r in linked));self.assertTrue(all(not any('edition changed'in e or 'signature mismatch'in e for e in r['errors'])for r in linked));self.stats['accessibleAssetMutationsRejected']+=1
