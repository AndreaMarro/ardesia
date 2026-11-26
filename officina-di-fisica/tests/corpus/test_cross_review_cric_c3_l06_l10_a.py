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
from tools.corpus_engineering import cric_c3_thermodynamics_review_common as c
APP=Path(__file__).resolve().parents[2]
PROOF=APP/'editorial/reviews/cric-c3-006-010-independent-proof-20261126'
FIX=PROOF/'fixtures';ASSETS=FIX/'assets'
MODULES=[importlib.import_module(f'tools.corpus_engineering.cric_c3_l{n:02}_verifier')for n in range(6,11)]
def packet(m):
    batch=m.__name__.split('.')[-1].removesuffix('_verifier').replace('_','-')
    return batch,json.loads((FIX/(batch+'.json')).read_text()),json.loads((FIX/(batch+'-bindings.json')).read_text())
def rebind(m,p,b):
    byid={x['id']:x for x in b};pins={}
    for r in p['records']:
        x=byid[r['id']];x['candidateSha256']=digest(r)
        pins[r['id']]=digest({'record':r,'assets':x['assetChecksums'],'source':{'id':x['sourceId'],'ref':x['sourceRef'],'sha256':x['sourceSha256']}})
    return mock.patch.multiple(m,REVIEWED_CANDIDATES=pins,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b))
class DistinctCricThermodynamicsReview(unittest.TestCase):
    stats={'wrongKeysRejected':0,'metadataRejected':0,'unitToleranceRejected':0,'constitutiveFaultsRejected':0,'inverseFaultsRejected':0,'finiteExactRejections':0,'hypothesisConfigurations':0,'domainBackslidesRejected':0,'accessibleAssetMutationsRejected':0,'equivalentAlternativeDuplicatesRejected':0,'wrongCelsiusOffsetRejected':0}

    def test_01_fresh_saved_identity_sources_and_original_versions(self):
            source=json.loads(subprocess.check_output(['git','show','5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C3.json'],cwd=APP));source={r['id']:r for r in source if r.get('kind')=='question'}
            ids=[]
            for m in MODULES:
                batch,p,b=packet(m);fresh=m.report(p,b,ASSETS);saved=json.loads((APP/'editorial/reviews'/(batch+'.json')).read_text());self.assertEqual(fresh,saved);self.assertTrue(all(r['ok']for r in fresh['records']))
                assert_record_identity(fresh['records'],m.EXPECTED_IDS,p,b);assert_record_identity(saved['records'],m.EXPECTED_IDS,p,b)
                self.assertEqual(len(p['records']),10);self.assertEqual(len({r['family']for r in p['records']}),10)
                raw=subprocess.check_output(['git','show',m.CANDIDATE_REF+':officina-di-fisica/editorial/batches/'+batch+'.json'],cwd=APP);self.assertEqual(raw,(FIX/(batch+'.json')).read_bytes())
                for r,x in zip(p['records'],b):
                    self.assertEqual(x['sourceSha256'],digest(source[r['id']]))
                    self.assertEqual(r['version'],source[r['id']]['version']+1);self.assertEqual(r['baseVersion'],source[r['id']]['version']);ids.append(r['id'])
            self.assertEqual(set(ids),{f'C3-Q{n:03}'for n in range(51,101)})
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
                        self.assertFalse(result['ok'],(row['id'],value));self.assertTrue(any('Independent physical'in e or 'Independent specific physics'in e or 'Independent exact alternatives'in e or 'Independent entropy'in e for e in result['errors']),result['errors']);self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in result['errors']));self.stats['wrongKeysRejected']+=1

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

    def test_10_portable_identity_contract_and_no_false_approval(self):
            source=(APP/'tools/corpus_engineering/batches.py').read_text();node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef)and n.name=='assert_record_identity');segment=ast.get_source_segment(source,node);self.assertEqual(hashlib.sha256(segment.encode()).hexdigest(),'55ff6aaa71fd195322e44745a9f17762d6ac745a1abe7dac5e739d69e4c0e5ca');self.assertEqual(inspect.getsource(assert_record_identity).rstrip('\n'),segment)
            m=MODULES[0];_,p,b=packet(m);rows=m.verify(p,b,ASSETS)
            for field,value in[('id','FAKE'),('ok',False),('candidateSha256','0'*64),('humanApproval','APPROVED'),('verificationMode','UNSUPPORTED')]:
                bad=copy.deepcopy(rows);bad[0][field]=value
                with self.assertRaises(ValueError):assert_record_identity(bad,m.EXPECTED_IDS,p,b)

    def test_11_unfinished_reading_and_missing_model_dependencies_fail_closed(self):
            m=MODULES[0];_,p,b=packet(m)
            with mock.patch.object(c.evidence,'READING_COMPLETE',False):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))
            with mock.patch.dict(m.DEPENDENCY_SHA256,{'cric_c3_051_100_review_models.py':'0'*64}):self.assertTrue(all(not r['ok']for r in m.verify(p,b,ASSETS)))

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
                    with tempfile.TemporaryDirectory(prefix='cric-c3-accessible-review-')as directory:
                        temp=Path(directory)
                        for source in ASSETS.iterdir():shutil.copyfile(source,temp/source.name)
                        (temp/(batch+'-progressive.svg')).write_bytes(raw)
                        with rebind(m,p,b):rows=m.verify(p,b,temp)
                    linked=[r for r in rows if r['assetChecksums']]
                    self.assertTrue(linked);self.assertTrue(all(not r['ok']for r in linked));self.assertTrue(all(any('accessible SVG'in e for e in r['errors'])for r in linked));self.assertTrue(all(not any('edition changed'in e or 'signature mismatch'in e for e in r['errors'])for r in linked));self.stats['accessibleAssetMutationsRejected']+=1

    def test_05_constitutive_faults_rejected_with_normal_frozen_dependencies(self):
        faults=[('internal_change',lambda q,w:q+w),('linear_pressure_work',lambda pi,pf,vi,vf:pi*(vf-vi)),('isobaric_ideal_work',lambda n,R,dT:R*dT),('heat_transfer_entropy',lambda q,hot,cold:q*(1/cold+1/hot)),('constant_capacity_entropy',lambda C,Ti,Tf:C*(Tf-Ti)/Ti)]
        m=MODULES[0];_,p,b=packet(m)
        for name,wrong in faults:
            with mock.patch.object(c.model,name,wrong):rows=m.verify(p,b,ASSETS)
            self.assertTrue(all(not r['ok']for r in rows));self.assertTrue(any('physical oracle constitutive'in e for e in rows[0]['errors']));self.stats['constitutiveFaultsRejected']+=1
    def test_06_finite_exact_inputs_before_any_cast(self):
        R=sp.Rational
        cases=[(c.model.internal_change,[35,60]),(c.model.heat_from_balance,[-75,120]),(c.model.pressure_work,[120,R(3,2),2]),(c.model.linear_pressure_work,[200,100,1,4]),(c.model.piston_work,[100000,R(1,400),R(1,25)]),(c.model.temperature_change,[-200,25]),(c.model.isobaric_ideal_work,[R(1,2),R(4157,500),20]),(c.model.adiabatic_pressure_ratio,[4,R(3,2)]),(c.model.triangle_cycle_work,[4,60]),(lambda w,t:c.model.cycle_power(w,3,t),[24,60]),(c.model.cycle_work,[400,300]),(lambda w,q:c.model.rejected_per_cycle(w,3,q),[R(9,5),2]),(c.model.rectangular_volume_span,[150,50]),(c.model.celsius_kelvin,[R(3537,20)]),(c.model.carnot_efficiency,[450,300]),(c.model.inverse_carnot_hot,[300,R(2,5)]),(c.model.engine_power,[R(11,50),1500]),(c.model.minimum_rejected_heat,[900,600,300]),(c.model.refrigerator_cop,[50,200]),(c.model.reservoir_entropy,[-640,320]),(c.model.fusion_entropy,[R(1,100),100000,250]),(c.model.heat_transfer_entropy,[90,360,300]),(c.model.constant_capacity_entropy,[30,250,300]),(c.inverse_pressure,[60,R(3,2),2]),(c.inverse_capacity,[-200,-8]),(c.inverse_hot_heat,[50,R(1,2)]),(c.inverse_entropy_heat,[-2,320]),(c.inverse_entropy_capacity,[30*sp.log(R(6,5)),250,300])]
        for fn,args in cases:
            for i in range(len(args)):
                for bad in[True,False,0.25,sp.Float('0.25'),sp.I,sp.oo,-sp.oo,sp.nan,1+2j,'2',sp.Symbol('unresolved',positive=True)]:
                    a=args.copy();a[i]=bad
                    with self.assertRaises((ValueError,TypeError)):fn(*a)
                    self.stats['finiteExactRejections']+=1
        for bad in[True,False,0,sp.Integer(3),sp.Rational(3,2),3.0,sp.I,sp.oo,-sp.oo,sp.nan,'3']:
            for fn in[lambda n:c.model.cycle_power(24,n,60),lambda n:c.model.rejected_per_cycle(1,n,2),lambda n:c.model.statistical_entropy_ratio(n,48),lambda n:c.model.statistical_entropy_ratio(12,n)]:
                with self.assertRaises((ValueError,TypeError)):fn(bad)
                self.stats['finiteExactRejections']+=1
    def test_07_safe_lexical_quantity_logarithms_and_units(self):
        R=sp.Rational
        for raw,want,dim in[('83,14 J',R(4157,50),'energy'),('1,4 kJ',1400,'energy'),('100/3 %',R(1,3),'pure'),('ln 4',sp.log(4),'pure'),('30 ln(6/5) J/K',30*sp.log(R(6,5)),'entropy'),('−ln 4',-sp.log(4),'pure')]:
            got,actualdim=c.quantity(raw);self.assertEqual(sp.simplify(got-want),0);self.assertEqual(actualdim,dim)
        self.assertEqual(c.entropy_unit('J/K'),c.entropy_unit('J K^-1'));self.assertNotEqual(c.entropy_unit('W/K'),c.entropy_unit('J/K'))
        for bad in['__import__("os")','ln(0)','ln(-1)','ln(1/0)','ln 0','nan','oo','1e999','r(-1)','[1]','True','10**999','1/0','ln(__import__)','ln(2+2)','1/20 J/°C','1;2']:
            with self.assertRaises((ValueError,TypeError,SyntaxError)):c.quantity(bad)
        for bad in[True,False,0.1,sp.Float('0.1'),sp.I,sp.oo,sp.nan]:
            with self.assertRaises(ValueError):c.codec.numeric_lexeme(bad)
    def test_08_inverse_roundtrips_and_physical_domains(self):
        R=sp.Rational
        self.assertEqual(c.inverse_pressure(60,R(3,2),2),120);self.assertEqual(c.model.pressure_work(c.inverse_pressure(60,R(3,2),2),R(3,2),2),60)
        self.assertEqual(c.inverse_capacity(-200,-8),25);self.assertEqual(c.model.temperature_change(-200,c.inverse_capacity(-200,-8)),-8)
        self.assertEqual(c.inverse_hot_heat(50,R(1,2)),100);self.assertEqual(c.model.cycle_work(100,50),50)
        self.assertEqual(c.inverse_entropy_heat(-2,320),-640);self.assertEqual(c.model.reservoir_entropy(c.inverse_entropy_heat(-2,320),320),-2)
        self.assertEqual(c.inverse_entropy_capacity(30*sp.log(R(6,5)),250,300),30)
        wrongs=[(60/(R(3,2)+2),120),((-200)*(-8),25),(50*R(1,2),100),(R(-2,320),-640),(30*sp.log(R(6,5))/50,30)]
        for got,want in wrongs:self.assertNotEqual(sp.simplify(got-want),0);self.stats['inverseFaultsRejected']+=1
        for fn,args in[(c.inverse_pressure,[1,2,2]),(c.inverse_pressure,[-1,1,2]),(c.inverse_capacity,[1,0]),(c.inverse_capacity,[1,-1]),(c.inverse_hot_heat,[1,0]),(c.inverse_hot_heat,[1,1]),(c.inverse_entropy_heat,[1,0]),(c.inverse_entropy_capacity,[1,2,2]),(c.model.adiabatic_pressure_ratio,[4,1]),(c.model.carnot_efficiency,[200,300]),(c.model.carnot_efficiency,[300,0]),(c.model.inverse_carnot_hot,[300,1]),(c.model.engine_power,[1,100]),(c.model.refrigerator_cop,[50,50]),(c.model.temperature_change,[1,0]),(c.model.celsius_kelvin,[-274]),(c.model.rejected_per_cycle,[10,1,2])]:
            with self.assertRaises(ValueError):fn(*args)
        self.assertEqual(c.model.pressure_work(0,1,2),0);self.assertEqual(c.model.carnot_efficiency(300,300),0);self.assertEqual(c.model.engine_power(0,100),0);self.assertEqual(c.model.heat_transfer_entropy(0,360,300),0);self.assertEqual(c.model.celsius_kelvin(-R(27315,100)),0);self.assertEqual(c.model.pressure_work(120,2,R(3,2)),-60)
    def test_09_whole_native_assets_and_independent_geometry(self):
        import xml.etree.ElementTree as ET
        roots={}
        terminal=(APP/'editorial/reviews/cric-c3-006-010-asset-review-20261126/actual-terminal.txt').read_text();self.assertIn('CHILD_EXIT 0',terminal)
        for n in range(6,11):
            batch=f'cric-c3-l{n:02}';D=APP/'editorial/reviews/cric-c3-006-010-asset-review-20261126'/batch;raw=(ASSETS/(batch+'-progressive.svg')).read_bytes();r=json.loads((D/'actual-render.json').read_text());self.assertEqual(r['sourceSvgSha256'],hashlib.sha256(raw).hexdigest());png=(D/'full-native.png').read_bytes();self.assertEqual(hashlib.sha256(png).hexdigest(),r['pngSha256']);self.assertEqual(int.from_bytes(png[16:20],'big'),640);root=ET.fromstring(raw);self.assertEqual(int.from_bytes(png[20:24],'big'),int(root.attrib['height']));self.assertEqual(r['clipping'],[]);roots[n]=root
        tags=lambda n,t:[e.attrib for e in roots[n]if e.tag.rsplit('}',1)[-1]==t]
        bars=[x for x in tags(6,'rect')if x.get('height')=='32'];self.assertEqual(sp.Rational(bars[0]['width'])/sp.Rational(bars[1]['width']),sp.Rational(35,60))
        # p-V trapezoid: 80 drawing-units/L,1.2 drawing-units/kPa; exact physical area450J.
        self.assertEqual(sp.Rational((200+100)*(4-1),2),450);self.assertIn({'x1':'220','y1':'610','x2':'460','y2':'730','stroke':'#306f8c','stroke-width':'3'},tags(6,'line'))
        self.assertIn({'x1':'140','y1':'850','x2':'500','y2':'610','stroke':'#306f8c','stroke-width':'3'},tags(7,'line'))
        bars=[x for x in tags(7,'rect')if x.get('height')=='28'];self.assertEqual(sp.Rational(bars[1]['width'])/sp.Rational(bars[0]['width']),4);self.assertEqual(sp.Rational(bars[3]['width'])/sp.Rational(bars[2]['width']),sp.Rational(1,8))
        tri=next(x for x in tags(8,'polygon')if x.get('points')=='180,360 180,240 500,360');self.assertTrue(tri);self.assertEqual(sp.Rational(320*120,2)/(80*2),120);rectangle=next(x for x in tags(8,'rect')if x.get('y')=='1190');self.assertEqual(sp.Rational(rectangle['width'])*sp.Rational(rectangle['height'])/(80*2),150)
        bars=[x for x in tags(9,'rect')if x.get('height')=='28'];widths=[sp.Rational(x['width'])for x in bars];self.assertEqual(widths[:3],[300,150,150]);self.assertEqual(widths[4]/widths[3],sp.Rational(22,100));self.assertEqual(widths[5]+widths[4],widths[3]);self.assertEqual(widths[7]/widths[6],3);self.assertEqual(widths[6]+widths[7],widths[8])
        bars=[x for x in tags(10,'rect')if x.get('height')in['28','30']];self.assertEqual([sp.Rational(x['width'])for x in bars],[160,320,200,240,40]);self.assertEqual(sp.Rational(bars[1]['width'])/sp.Rational(bars[0]['width']),2);self.assertEqual(sp.Rational(bars[4]['width']),sp.Rational(bars[3]['width'])-sp.Rational(bars[2]['width']))
        for entry in json.loads((APP/'editorial/reviews/cric-c3-006-010-source-assets-20261126/git-inputs.json').read_text())['inputs']:
            raw=subprocess.check_output(['git','show',entry['commit']+':'+entry['path']],cwd=APP);self.assertEqual(hashlib.sha256(raw).hexdigest(),entry['sha256'])
    def test_12_domain_backslides_after_all_packet_pins_rebound(self):
        cases=[(MODULES[1],'C3-Q070','gas perfetto chiuso','gas chiuso'),(MODULES[3],'C3-Q088','macchina ciclica','macchina'),(MODULES[4],'C3-Q099','intero sistema isolato','sistema chiuso')]
        for m,identifier,term,replacement in cases:
            _,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);self.assertIn(term,p['records'][i]['prompt']);p['records'][i]['prompt']=p['records'][i]['prompt'].replace(term,replacement)
            with rebind(m,p,b):row=m.verify(p,b,ASSETS)[i]
            self.assertFalse(row['ok']);self.assertTrue(any('thermodynamic domain'in e for e in row['errors']));self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in row['errors']));self.stats['domainBackslidesRejected']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(-100,100),st.integers(-100,100))
    def test_13_first_law_sign_and_inverse(self,heat,work):
        du=c.model.internal_change(heat,work);self.assertEqual(du+work,heat);self.assertEqual(c.model.heat_from_balance(du,work),heat);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,10))
    def test_14_linear_pressure_integral_and_inverse(self,pi,pf,span):
        work=c.model.linear_pressure_work(pi,pf,1,1+span);self.assertEqual(work,sp.Rational(pi+pf,2)*span);pmean=sp.Rational(pi+pf,2);self.assertEqual(c.inverse_pressure(work,1,1+span),pmean);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(2,8),st.integers(1,30),st.integers(1,30))
    def test_15_adiabatic_ratio_and_total_capacity(self,factor,work,capacity):
        self.assertEqual(c.model.adiabatic_pressure_ratio(factor**2,sp.Rational(3,2)),factor**3);dt=c.model.temperature_change(-work,capacity);self.assertLess(dt,0);self.assertEqual(c.inverse_capacity(-work,dt),capacity);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,30),st.integers(1,30))
    def test_16_cycle_power_counts_and_heat_balance(self,work,n,duration):
        self.assertEqual(c.model.cycle_power(work,n,duration),sp.Rational(work*n,duration));self.assertEqual(c.model.rejected_per_cycle(work*n,n,work+10),10);self.assertEqual(c.model.cycle_work(work+10,10),work);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,100),st.integers(1,100),st.integers(1,100))
    def test_17_Carnot_inverse_and_reservoir_entropy(self,cold,gap,heat):
        hot=cold+gap;eta=c.model.carnot_efficiency(hot,cold);self.assertGreater(eta,0);self.assertLess(eta,1);self.assertEqual(c.model.inverse_carnot_hot(cold,eta),hot);qc=c.model.minimum_rejected_heat(heat,hot,cold);self.assertEqual(c.model.reservoir_entropy(-heat,hot)+c.model.reservoir_entropy(qc,cold),0);self.stats['hypothesisConfigurations']+=1
    @settings(max_examples=40,derandomize=True,database=None,deadline=None)
    @given(st.integers(1,30),st.integers(1,100),st.integers(2,5))
    def test_18_entropy_integral_bounds_and_inverse(self,capacity,initial,factor):
        final=initial*factor;ds=c.model.constant_capacity_entropy(capacity,initial,final);self.assertEqual(ds,capacity*sp.log(factor));self.assertEqual(c.inverse_entropy_capacity(ds,initial,final),capacity);self.assertGreater(ds,capacity*sp.Rational(factor-1,factor));self.assertLess(ds,capacity*(factor-1));self.stats['hypothesisConfigurations']+=1
    def test_20_original_and_new_Celsius_preparations_distinct(self):
        R=sp.Rational;old=c.model.primary_only_derivations()[0][81];new=c.physical_oracle()[81];self.assertEqual(old,R(100000,3001));self.assertEqual(new,R(100,3));self.assertNotEqual(old,new)
        with mock.patch.object(c.model,'celsius_kelvin',lambda t:t+273):
            m=MODULES[3];_,p,b=packet(m);rows=m.verify(p,b,ASSETS)
        self.assertTrue(all(not r['ok']for r in rows));self.assertTrue(any('physical oracle constitutive'in e for e in rows[0]['errors']));self.stats['wrongCelsiusOffsetRejected']+=1
        m=MODULES[3];_,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']=='C3-Q081');p['records'][i]['answer']['value']='100000/3001 %';p['records'][i]['answer']['options'].append('100000/3001 %')
        with rebind(m,p,b):row=m.verify(p,b,ASSETS)[i]
        self.assertFalse(row['ok']);self.assertTrue(any('physical exact result'in e for e in row['errors']));self.stats['wrongCelsiusOffsetRejected']+=1
    def test_21_equivalent_options_are_not_two_correct_answers(self):
        cases=[(MODULES[1],'C3-Q067','83140 mJ'),(MODULES[2],'C3-Q076','1400 J'),(MODULES[3],'C3-Q081','200/6 %'),(MODULES[4],'C3-Q093','J K^-1'),(MODULES[4],'C3-Q096','2 ln 2'),(MODULES[4],'C3-Q100','30 ln(12/10) J/K'),(MODULES[0],'C3-Q052',None)]
        for m,identifier,alias in cases:
            _,op,ob=packet(m);p,b=copy.deepcopy(op),copy.deepcopy(ob);i=next(i for i,r in enumerate(p['records'])if r['id']==identifier);row=p['records'][i];row['answer']['options'].append(row['answer']['value']if alias is None else alias)
            with rebind(m,p,b):r=m.verify(p,b,ASSETS)[i]
            self.assertFalse(r['ok'],identifier);self.assertTrue(any('not unique'in e for e in r['errors']),r['errors']);self.assertFalse(any('edition changed'in e or 'signature mismatch'in e for e in r['errors']));self.stats['equivalentAlternativeDuplicatesRejected']+=1
